import { extractCadenceProfile } from './stylometry.js';

export const HUSH_SYNTAX_RECOMPOSER_VERSION = 'phase-19';

const safeText = (value) => String(value ?? '');
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const unique = (values = []) => [...new Set(asArray(values))];

function sentenceJoin(parts = []) {
  return asArray(parts).map((part) => {
    const value = safeText(part).replace(/\s+/g, ' ').trim();
    if (!value) return '';
    return /[.!?]$/.test(value) ? value : `${value}.`;
  }).filter(Boolean).join(' ');
}

function protectedFragments(plan = {}) {
  return unique([...(plan.protectedLiterals || []), ...asArray(plan.units).flatMap((unit) => asArray(unit.protectedFragments))]);
}

function evidenceLiteral(literals = []) {
  return literals.find((literal) => /^(?:EXHIBIT|DOC|CASE|ID|REF)/i.test(literal)) || literals[0] || '';
}

function dateLiteral(literals = []) {
  return literals.find((literal) => /\d/.test(literal) && !/^(?:EXHIBIT|DOC|CASE|ID|REF)/i.test(literal)) || '';
}

function stripLiteralTail(text = '', literals = []) {
  let value = safeText(text);
  for (const literal of literals) value = value.replace(new RegExp(`\\s*${literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'g'), '');
  return value.trim();
}

function baseClaim(input = {}) {
  const meaningPlan = input.meaningPlan || {};
  return asArray(meaningPlan.units).map((unit) => unit.text).join(' ') || safeText(input.sourceText);
}

function negationPhrase(sourceText = '') {
  if (/\bI did not\b/i.test(sourceText)) return 'was not changed on my end';
  if (/\bI cannot confirm\b/i.test(sourceText)) return 'cannot be confirmed from my side';
  if (/\bdo not separate\b/i.test(sourceText)) return 'should stay together';
  if (/\bnot naming\b/i.test(sourceText)) return 'the sender is not being named';
  return '';
}

function caveatPhrase(sourceText = '') {
  if (/cannot confirm/i.test(sourceText)) return 'I cannot confirm the later change';
  if (/\bmay\b/i.test(sourceText)) return 'This may need review';
  if (/appears|seems/i.test(sourceText)) return 'The record appears different';
  return '';
}

function integrityParts(sourceText = '', fallback = '') {
  const negation = negationPhrase(sourceText);
  const caveat = caveatPhrase(sourceText);
  const parts = [];
  if (negation) parts.push(negation);
  if (caveat && caveat.toLowerCase() !== negation.toLowerCase()) parts.push(caveat);
  if (!parts.length && fallback) parts.push(fallback);
  return parts;
}

function integrityTail(sourceText = '', fallback = '') {
  return integrityParts(sourceText, fallback).join('. ');
}

function nounForLiteral(literal = '') {
  if (/^DOC/i.test(literal)) return 'note';
  if (/^CASE/i.test(literal)) return 'case note';
  if (/^EXHIBIT/i.test(literal)) return 'exhibit';
  if (/^ID/i.test(literal)) return 'record';
  if (/^REF/i.test(literal)) return 'reference packet';
  return 'record';
}

function composeByFamily(family = '', input = {}) {
  const sourceText = safeText(input.sourceText);
  const literals = protectedFragments(input.meaningPlan || {});
  const evidence = evidenceLiteral(literals);
  const date = dateLiteral(literals);
  const noun = nounForLiteral(evidence);
  const negation = negationPhrase(sourceText);
  const caveat = caveatPhrase(sourceText);
  const main = evidence ? `${evidence} ${noun}` : stripLiteralTail(baseClaim(input), literals);
  const datePart = date ? `on ${date}` : '';
  const changedLater = /changed later|label changed|later copy|later version/i.test(sourceText);
  const requestKeep = /keep|preserve|remain|attached|separate/i.test(sourceText);
  const tail = (fallback = '') => integrityTail(sourceText, fallback);
  const parts = (fallback = '') => integrityParts(sourceText, fallback);

  switch (family) {
    case 'record-first':
      return sentenceJoin([`${main} should stay with the record ${datePart}`.trim(), ...parts(changedLater ? 'The later label should be reviewed' : 'No extra claim is added')]);
    case 'evidence-first':
      return sentenceJoin([`${main} is the anchor for this note ${datePart}`.trim(), ...parts('The surrounding message should remain narrow')]);
    case 'date-first':
      return sentenceJoin([`${date || 'The dated record'} is the timing anchor for ${evidence || 'the record'}`, ...parts('The label should stay with the note')]);
    case 'caveat-first':
      return sentenceJoin([caveat || 'I am keeping the claim narrow', `${main} ${datePart} should remain attached`.trim(), negation]);
    case 'request-softened':
      return sentenceJoin([`It would help to keep ${main} ${datePart} with the message`.trim(), ...parts()]);
    case 'two-sentence-brief':
      return sentenceJoin([`${main} stays with the note ${datePart}`.trim(), ...parts('The later version needs review')]);
    case 'short-note':
      return sentenceJoin([`${main}. ${datePart ? `Timing: ${date}.` : ''}`, ...parts()]);
    case 'intake-style':
      return sentenceJoin([`Intake note: ${main} ${datePart}`.trim(), ...parts('Review the later file label')]);
    case 'procedural-neutral':
      return sentenceJoin([`Record note: ${main} ${datePart}`.trim(), ...parts('Keep the attachment with the record')]);
    case 'warm-logistics':
      return sentenceJoin([`Just keeping this organized: ${main} should stay with the note ${datePart}`.trim(), ...parts('That keeps the context together')]);
    case 'group-chat-soft':
      return sentenceJoin([`Just flagging this plainly: ${main} should stay attached ${datePart}`.trim(), ...parts()]);
    case 'formal-record':
      return sentenceJoin([`For the record, ${main} remains the relevant anchor ${datePart}`.trim(), ...parts('No broader conclusion is being added')]);
    case 'compressed-record':
      return sentenceJoin([`${main}; ${date || 'timing retained'}; ${tail('review later')}`]);
    case 'expanded-context':
      return sentenceJoin([`${main} should remain connected to the message ${datePart}`.trim(), ...parts('The point is preservation, not expansion'), changedLater ? 'The later label change is the review issue' : '']);
    default:
      return sentenceJoin([`${main} should remain with the note ${datePart}`.trim(), ...parts()]);
  }
}

export function applySyntaxOperation(input = {}) {
  return composeByFamily(input.family || 'record-first', input);
}

export function diversifySyntaxPlans(input = {}) {
  const families = ['record-first', 'evidence-first', 'date-first', 'caveat-first', 'request-softened', 'two-sentence-brief', 'short-note', 'intake-style', 'procedural-neutral', 'warm-logistics', 'group-chat-soft', 'formal-record', 'compressed-record', 'expanded-context'];
  const count = Math.max(1, Math.min(36, Number(input.candidateCount || 18)));
  const out = [];
  while (out.length < count) out.push(families[out.length % families.length]);
  return out;
}

export function recomposeSyntaxCandidate(input = {}) {
  const text = applySyntaxOperation(input).replace(/\s+/g, ' ').trim();
  const operations = unique([`family:${input.family || 'record-first'}`, ...(input.syntaxPlan?.operations || []).slice(0, 3).map((op) => op.code), 'syntax-recompose']);
  return { id: input.id || `syntax-candidate-${input.family || 'record-first'}`, text, family: input.family || 'record-first', strategy: input.family || 'record-first', syntaxPlanId: input.syntaxPlanId || 'syntax-plan-local', operations, profile: extractCadenceProfile(text), warnings: [] };
}

export function generateSyntaxRecomposerCandidates(input = {}) {
  const families = diversifySyntaxPlans(input);
  const candidates = [];
  const seen = new Set();
  families.forEach((family, index) => {
    const candidate = recomposeSyntaxCandidate({ ...input, family, id: `syntax-candidate-${index + 1}` });
    const key = candidate.text.toLowerCase();
    if (!seen.has(key)) { seen.add(key); candidates.push(candidate); }
  });
  return { version: HUSH_SYNTAX_RECOMPOSER_VERSION, candidates, warnings: candidates.length < 4 ? ['syntax-candidate-pool-thin'] : [], limitations: ['Syntax recomposer changes local sentence architecture; release policy still decides output population.'] };
}
