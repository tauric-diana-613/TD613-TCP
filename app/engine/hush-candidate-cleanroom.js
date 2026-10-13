export const HUSH_CANDIDATE_CLEANROOM_VERSION = 'phase-21';

const safeText = (value) => String(value ?? '');
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const unique = (values = []) => [...new Set(asArray(values))];

function collapseWhitespace(text = '') {
  return safeText(text).replace(/[ \t]+/g, ' ').replace(/\s+([,.!?;:])/g, '$1').trim();
}

function dedupeTransitions(text = '') {
  let value = safeText(text);
  const transitions = ['For reference', 'For clarity', 'Regarding', 'Note:', 'Quick note:', 'Also', 'At this stage', 'For the record', 'Record note:', 'Intake note:'];
  for (const transition of transitions) {
    const repeated = `${transition} ${transition}`;
    while (value.includes(repeated)) value = value.replace(repeated, transition);
  }
  return collapseWhitespace(value);
}

function normalizeProceduralMarkers(text = '', strategy = '', traits = {}) {
  const procedural = strategy === 'procedural' || strategy === 'procedural-neutral' || traits.clauseShape === 'list-driven' || traits.diction === 'procedural';
  if (procedural) return text;
  return safeText(text).replace(/\bItem\s+\d+\s*:\s*/gi, '');
}

function dedupeProtectedLiterals(text = '', protectedLiterals = []) {
  let value = safeText(text);
  for (const literal of asArray(protectedLiterals)) {
    const first = value.indexOf(literal);
    if (first === -1) continue;
    value = value.slice(0, first + literal.length) + value.slice(first + literal.length).split(literal).join('');
  }
  return collapseWhitespace(value);
}

function restoreMissingLiterals(text = '', protectedLiterals = []) {
  let value = safeText(text);
  const operations = [];
  const warnings = [];
  for (const literal of asArray(protectedLiterals)) {
    if (value.includes(literal)) continue;
    const words = value.split(/\s+/).filter(Boolean);
    const anchor = words.findIndex((word) => /file|record|note|packet|attachment|label|message|saved|changed|edited|logged|invoice|spreadsheet|version/i.test(word));
    if (anchor >= 0) {
      words.splice(anchor, 0, literal);
      value = words.join(' ');
      operations.push('in-unit-literal-placement');
    } else {
      value = `${literal} ${value}`;
      warnings.push('literal-placement-review');
    }
  }
  return { text: collapseWhitespace(value), operations, warnings };
}

function restoreNegations(text = '', meaningPlan = {}) {
  let value = safeText(text);
  for (const unit of asArray(meaningPlan.units)) {
    if (!unit?.hasNegation) continue;
    const clause = collapseWhitespace(unit.text);
    if (!clause) continue;

    let repair = '';
    let equivalent = null;
    if (/\bnot\s+(?:a\s+)?broader accusation\b/i.test(clause)) {
      repair = 'No broader accusation is being made.';
      equivalent = /\b(?:no|not\s+(?:a\s+)?)broader accusation\b/i;
    } else if (/\bwithout losing\b/i.test(clause)) {
      repair = 'The stated constraint must not be lost.';
      equivalent = /\b(?:without losing|constraint must not be lost)\b/i;
    } else if (/\bdo not separate\b/i.test(clause)) {
      repair = 'The referenced items should not be separated.';
      equivalent = /\b(?:do not separate|should not be separated)\b/i;
    } else if (/\b(?:do not|not to) resend\b/i.test(clause)) {
      repair = 'The material should not be resent yet.';
      equivalent = /\b(?:do not resend|not to resend|should not be resent)\b/i;
    } else if (/\bcannot confirm\b/i.test(clause)) {
      repair = 'The unresolved point cannot be confirmed.';
      equivalent = /\b(?:cannot confirm|cannot be confirmed)\b/i;
    } else {
      repair = `Constraint retained: ${clause.replace(/[.!?]+$/, '')}.`;
      equivalent = new RegExp(clause.replace(/[.!?]+$/, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }
    if (!equivalent.test(value)) value = `${value} ${repair}`;
  }
  return collapseWhitespace(value);
}

function restoreCaveats(text = '', meaningPlan = {}) {
  let value = safeText(text);
  const caveats = [];
  for (const unit of asArray(meaningPlan.units)) {
    caveats.push(...(safeText(unit.text).match(/\b(may|might|seems|appears|possibly|cannot confirm|from what I can tell)\b/gi) || []));
  }
  for (const caveat of unique(caveats)) {
    if (!new RegExp(caveat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(value)) value = `${caveat} ${value}`;
  }
  return collapseWhitespace(value);
}

function removeRepeatedPhrases(text = '') {
  return safeText(text).replace(/\b(\w+)(\s+\1\b)+/gi, '$1');
}

function detectPayloadClipping(text = '', sourceText = '') {
  const value = safeText(text);
  const source = safeText(sourceText);
  const warnings = [];
  if (/\b(?:not|without|did not|do not|cannot)\.?$/i.test(value)) warnings.push('dangling-negation');
  if (/\b(?:on|at|with|until|from|to|by)\.?$/i.test(value)) warnings.push('dangling-preposition');
  if (/\brecord should stay with the record on\b/i.test(value)) warnings.push('orphan-record-template');
  const identifiers = source.match(/\b[A-Z]{2,12}-\d{1,8}[A-Z]?\b/g) || [];
  for (const id of identifiers) {
    const number = id.match(/\d+/)?.[0];
    if (number && !value.includes(id) && new RegExp(`\\b${number}\\b`).test(value)) warnings.push('truncated-identifier');
  }
  const timestamps = source.match(/\b\d{1,2}:\d{2}(?:\s?[AP]M)?\b/gi) || [];
  for (const timestamp of timestamps) {
    const tail = timestamp.split(':')[1]?.replace(/\D/g, '');
    if (tail && !value.includes(timestamp) && new RegExp(`\\b${tail}\\b`).test(value)) warnings.push('truncated-timestamp');
  }
  return unique(warnings);
}

export function cleanHushCandidate(input = {}) {
  const candidate = input.candidate || {};
  const protectedLiterals = asArray(input.protectedLiterals || input.meaningPlan?.protectedLiterals);
  const traits = input.realizationPlan?.traits || input.mask?.writingTraits || {};
  const operations = [];
  const warnings = [];
  const sourceText = input.sourceText || input.meaningPlan?.sourceText || '';
  let text = safeText(candidate.text);
  const before = text;
  warnings.push(...detectPayloadClipping(before, sourceText));
  text = normalizeProceduralMarkers(text, candidate.strategy || candidate.family || '', traits);
  if (text !== before) operations.push('normalize-procedural-markers');
  const afterMarkers = text;
  text = dedupeTransitions(text);
  if (text !== afterMarkers) operations.push('dedupe-transitions');
  const afterTransitions = text;
  text = removeRepeatedPhrases(text);
  if (text !== afterTransitions) operations.push('remove-repeated-phrases');
  const afterRepeated = text;
  text = dedupeProtectedLiterals(text, protectedLiterals);
  if (text !== afterRepeated) operations.push('dedupe-protected-literals');
  const placed = restoreMissingLiterals(text, protectedLiterals);
  text = placed.text;
  operations.push(...placed.operations);
  warnings.push(...placed.warnings);
  const afterLiterals = text;
  text = restoreNegations(text, input.meaningPlan || {});
  if (text !== afterLiterals) operations.push('restore-negations');
  const afterNegations = text;
  text = restoreCaveats(text, input.meaningPlan || {});
  if (text !== afterNegations) operations.push('restore-caveats');
  text = collapseWhitespace(text);
  warnings.push(...detectPayloadClipping(text, sourceText));
  return { ...candidate, text, cleanroom: { version: HUSH_CANDIDATE_CLEANROOM_VERSION, changed: text !== before, operations: unique(operations), warnings: unique(warnings) } };
}

export function cleanHushCandidates(input = {}) {
  const candidates = asArray(input.candidates).map((candidate) => cleanHushCandidate({ ...input, candidate }));
  return { version: HUSH_CANDIDATE_CLEANROOM_VERSION, candidates, changedCount: candidates.filter((candidate) => candidate.cleanroom?.changed).length, operations: unique(candidates.flatMap((candidate) => asArray(candidate.cleanroom?.operations))), warnings: unique(candidates.flatMap((candidate) => asArray(candidate.cleanroom?.warnings))) };
}

export function summarizeCleanroom(result = {}) {
  return { version: result.version || HUSH_CANDIDATE_CLEANROOM_VERSION, changedCount: Number(result.changedCount || 0), operationCount: asArray(result.operations).length, operations: asArray(result.operations), warnings: asArray(result.warnings) };
}
