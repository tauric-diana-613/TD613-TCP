import { extractCadenceProfile } from './stylometry.js';
import { rebuildPayloadSentence } from './hush-payload-repair.js';

export const HUSH_SYNTAX_RECOMPOSER_VERSION = 'phase-21.2-source-detached-families';

const safeText = (value) => String(value ?? '');
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const unique = (values = []) => [...new Set(asArray(values))];
const OPERATIONAL_PREFIX = /^(?:EXHIBIT|DOC|CASE|ID|REF|INV|PO|HR|PAY|FILE|TICKET|REQ|FORM|W2|W-?2|W-?4|I-?9|SSN|EIN|TIN|ACCT|ACCOUNT|VENDOR|INVOICE|PAYROLL|BENEFIT|TD613|SHI|SAC)/i;

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
  return literals.find((literal) => OPERATIONAL_PREFIX.test(literal)) || literals[0] || '';
}

function dateLiteral(literals = []) {
  return literals.find((literal) => /\d/.test(literal) && !OPERATIONAL_PREFIX.test(literal) && !/:/.test(literal)) || '';
}

function timestampLiteral(literals = []) {
  return literals.find((literal) => /\b\d{1,2}:\d{2}/.test(literal)) || '';
}

function stripLiteralTail(text = '', literals = []) {
  let value = safeText(text);
  for (const literal of literals) value = value.replace(new RegExp(`\s*${literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\s*$`, 'g'), '');
  return value.trim();
}

function baseClaim(input = {}) {
  const meaningPlan = input.meaningPlan || {};
  return asArray(meaningPlan.units).map((unit) => unit.text).join(' ') || safeText(input.sourceText);
}

function negationPhrase(sourceText = '') {
  if (/\bnot to resend\b|\bdo not resend\b|\bnot resend\b/i.test(sourceText)) return 'should not resend';
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
  if (/^INV|^INVOICE/i.test(literal)) return 'invoice record';
  if (/^PO/i.test(literal)) return 'purchase record';
  if (/^HR|^PAY|^FILE|^TICKET|^REQ|^FORM/i.test(literal)) return 'record';
  if (/^ID/i.test(literal)) return 'record';
  if (/^REF/i.test(literal)) return 'reference packet';
  return 'record';
}

function payloadHas(payloadMap = {}, kind = '', pattern = null) {
  return asArray(payloadMap.payloadUnits).some((unit) => unit.kind === kind && (!pattern || pattern.test(unit.text)));
}

function payloadText(payloadMap = {}, kind = '', pattern = null) {
  return asArray(payloadMap.payloadUnits).find((unit) => unit.kind === kind && (!pattern || pattern.test(unit.text)))?.text || '';
}

function payloadSentence(input = {}) {
  const payloadMap = input.payloadMap || {};
  if (!asArray(payloadMap.payloadUnits).length) return '';
  return rebuildPayloadSentence({ sourceText: input.sourceText, payloadMap, payloadBindingMap: input.payloadBindingMap });
}

function anchorPhrase(input = {}, fallback = 'the record') {
  const payloadMap = input.payloadMap || {};
  const evidence = payloadText(payloadMap, 'evidence-id');
  const timestamp = payloadText(payloadMap, 'timestamp');
  const date = payloadText(payloadMap, 'date');
  const actor = payloadText(payloadMap, 'actor');
  const time = timestamp || date;
  const anchor = [evidence, actor, time].filter(Boolean).join(' / ');
  return anchor || fallback;
}

function familyPayloadParts(family = '', input = {}) {
  const sourceText = safeText(input.sourceText);
  const payload = payloadSentence(input);
  if (!payload) return [];
  const evidence = payloadText(input.payloadMap, 'evidence-id');
  const timestamp = payloadText(input.payloadMap, 'timestamp');
  const date = payloadText(input.payloadMap, 'date');
  const actor = payloadText(input.payloadMap, 'actor');
  const time = timestamp || date;
  const hasVersion = payloadHas(input.payloadMap, 'version') || /which version|finance kept|version/i.test(sourceText);
  const reason = payloadText(input.payloadMap, 'reason');
  const integrity = integrityParts(sourceText);
  const versionTail = hasVersion && !/version/i.test(payload) ? 'The version context should remain attached' : '';
  const reasonTail = reason && !payload.toLowerCase().includes(reason.toLowerCase()) ? reason.replace(/^bc\b/i, 'because') : '';
  const holdTail = actor && /not to resend|do not resend|not resend/i.test(sourceText) && !/not resend|hold/i.test(payload) ? `${actor} should hold before resending` : '';
  const anchor = anchorPhrase(input, evidence || 'the record');

  switch (family) {
    case 'record-first':
      return [`Record note: ${payload}`, ...integrity];
    case 'evidence-first':
      return [evidence && time ? `${evidence} stays tied to ${time}` : `${evidence || 'The record'} remains the anchor`, payload, ...integrity];
    case 'date-first':
      return [time ? `${time} is the timing anchor` : 'The timing stays attached', payload, ...integrity];
    case 'caveat-first':
      return ['Keeping the claim narrow', payload, ...integrity];
    case 'request-softened':
      return [evidence ? `It would help to keep ${evidence}${time ? ` with ${time}` : ''}` : 'It would help to keep the record intact', payload, ...integrity];
    case 'two-sentence-brief':
      return [payload, ...integrity];
    case 'short-note':
      return [evidence && time ? `${evidence}; ${time}; payload retained` : 'Payload retained', payload, ...integrity];
    case 'intake-style':
      return [`Intake record: ${payload}`, versionTail, reasonTail, ...integrity];
    case 'procedural-neutral':
      return [`Procedural note: ${payload}`, holdTail, ...integrity];
    case 'group-chat-soft':
      return [`Just flagging this plainly: ${payload}`, holdTail, ...integrity];
    case 'formal-record':
      return [`For the record: ${payload}`, 'No broader conclusion is being added', ...integrity];
    case 'compressed-record':
      return [evidence && time ? `${evidence}; ${time}; ${payload}` : `Record: ${payload}`, ...integrity];
    case 'expanded-context':
      return [payload, versionTail, reasonTail, 'The point is preservation, not expansion', ...integrity];
    case 'source-detached-brief':
      return [`Start with the anchor: ${anchor}`, 'Then keep the claim narrow', payload, ...integrity];
    case 'residue-break-turn':
      return ['The issue is the relationship between the anchor and the later handling', payload, 'Do not carry the source phrasing forward', ...integrity];
    case 'archive-reframe':
      return [`Archive frame: ${anchor}`, payload, versionTail || reasonTail || 'The record should be read through attachment and sequence', ...integrity];
    case 'sequence-inversion':
      return [versionTail || reasonTail || holdTail || 'The review point comes after the anchor', payload, `Anchor retained: ${anchor}`, ...integrity];
    default:
      return [payload, ...integrity];
  }
}

function composePayloadByFamily(family = '', input = {}) {
  return sentenceJoin(familyPayloadParts(family, input));
}

function composeByFamily(family = '', input = {}) {
  const payloadComposed = composePayloadByFamily(family, input);
  if (payloadComposed) return payloadComposed;
  const sourceText = safeText(input.sourceText);
  const literals = protectedFragments(input.meaningPlan || {});
  const evidence = evidenceLiteral(literals);
  const date = dateLiteral(literals);
  const timestamp = timestampLiteral(literals);
  const noun = nounForLiteral(evidence);
  const negation = negationPhrase(sourceText);
  const caveat = caveatPhrase(sourceText);
  const main = evidence ? `${evidence} ${noun}` : stripLiteralTail(baseClaim(input), literals);
  const datePart = timestamp ? `at ${timestamp}` : date ? `on ${date}` : '';
  const changedLater = /changed later|label changed|later copy|later version/i.test(sourceText);
  const tail = (fallback = '') => integrityTail(sourceText, fallback);
  const parts = (fallback = '') => integrityParts(sourceText, fallback);
  const anchor = [evidence, timestamp || date].filter(Boolean).join(' / ') || main || 'the record';

  switch (family) {
    case 'record-first':
      return sentenceJoin([`${main} should stay with the record ${datePart}`.trim(), ...parts(changedLater ? 'The later label should be reviewed' : 'No extra claim is added')]);
    case 'evidence-first':
      return sentenceJoin([`${main} is the anchor for this note ${datePart}`.trim(), ...parts('The surrounding message should remain narrow')]);
    case 'date-first':
      return sentenceJoin([`${timestamp || date || 'The dated record'} is the timing anchor for ${evidence || 'the record'}`, ...parts('The label should stay with the note')]);
    case 'caveat-first':
      return sentenceJoin([caveat || 'I am keeping the claim narrow', `${main} ${datePart} should remain attached`.trim(), negation]);
    case 'request-softened':
      return sentenceJoin([`It would help to keep ${main} ${datePart} with the message`.trim(), ...parts()]);
    case 'two-sentence-brief':
      return sentenceJoin([`${main} stays with the note ${datePart}`.trim(), ...parts('The later version needs review')]);
    case 'short-note':
      return sentenceJoin([`${main}. ${datePart ? `Timing: ${timestamp || date}.` : ''}`, ...parts()]);
    case 'intake-style':
      return sentenceJoin([`Intake note: ${main} ${datePart}`.trim(), ...parts('Review the later file label')]);
    case 'procedural-neutral':
      return sentenceJoin([`Record note: ${main} ${datePart}`.trim(), ...parts('Keep the attachment with the record')]);
    case 'group-chat-soft':
      return sentenceJoin([`Just flagging this plainly: ${main} should stay attached ${datePart}`.trim(), ...parts()]);
    case 'formal-record':
      return sentenceJoin([`For the record, ${main} remains the relevant anchor ${datePart}`.trim(), ...parts('No broader conclusion is being added')]);
    case 'compressed-record':
      return sentenceJoin([`${main}; ${timestamp || date || 'timing retained'}; ${tail('review later')}`]);
    case 'expanded-context':
      return sentenceJoin([`${main} should remain connected to the message ${datePart}`.trim(), ...parts('The point is preservation, not expansion'), changedLater ? 'The later label change is the review issue' : '']);
    case 'source-detached-brief':
      return sentenceJoin([`Anchor first: ${anchor}`, 'The claim stays narrow', ...parts('The source order should not decide the output order')]);
    case 'residue-break-turn':
      return sentenceJoin(['Begin with the review point, not the source sentence path', `${main} remains the anchor ${datePart}`.trim(), ...parts('Keep meaning; break the source body')]);
    case 'archive-reframe':
      return sentenceJoin([`Archive frame: ${anchor}`, `${nounForLiteral(evidence)} handling stays the issue`, ...parts('The output should carry custody, not source syntax')]);
    case 'sequence-inversion':
      return sentenceJoin([changedLater ? 'Later handling is the review point' : 'The review point comes after the anchor', `${main} ${datePart}`.trim(), ...parts('Anchor retained without copying the source route')]);
    default:
      return sentenceJoin([`${main} should remain with the note ${datePart}`.trim(), ...parts()]);
  }
}

export function applySyntaxOperation(input = {}) {
  return composeByFamily(input.family || 'record-first', input);
}

export function diversifySyntaxPlans(input = {}) {
  const families = ['source-detached-brief', 'residue-break-turn', 'archive-reframe', 'sequence-inversion', 'record-first', 'evidence-first', 'date-first', 'caveat-first', 'request-softened', 'two-sentence-brief', 'short-note', 'intake-style', 'procedural-neutral', 'group-chat-soft', 'formal-record', 'compressed-record', 'expanded-context'];
  const count = Math.max(1, Math.min(36, Number(input.candidateCount || 18)));
  const out = [];
  while (out.length < count) out.push(families[out.length % families.length]);
  return out;
}

export function recomposeSyntaxCandidate(input = {}) {
  const text = applySyntaxOperation(input).replace(/\s+/g, ' ').trim();
  const operations = unique([`family:${input.family || 'record-first'}`, ...(input.syntaxPlan?.operations || []).slice(0, 3).map((op) => op.code), input.payloadMap ? 'payload-aware-recompose' : 'syntax-recompose']);
  return { id: input.id || `syntax-candidate-${input.family || 'record-first'}`, text, family: input.family || 'record-first', strategy: input.family || 'record-first', syntaxPlanId: input.syntaxPlanId || 'syntax-plan-local', operations, profile: extractCadenceProfile(text), warnings: input.payloadMap && !text ? ['payload-candidate-incomplete'] : [] };
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
