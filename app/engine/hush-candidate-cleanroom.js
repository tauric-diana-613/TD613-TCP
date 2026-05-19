export const HUSH_CANDIDATE_CLEANROOM_VERSION = 'phase-17';

const safeText = (value) => String(value ?? '');
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

function collapseWhitespace(text = '') {
  return safeText(text).replace(/[ \t]+/g, ' ').replace(/\s+([,.!?;:])/g, '$1').trim();
}

function dedupeTransitions(text = '') {
  let value = safeText(text);
  const transitions = ['For reference', 'For clarity', 'Regarding', 'Note:', 'Quick note:', 'Also', 'At this stage', 'For the record'];
  for (const transition of transitions) {
    const escaped = transition.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    value = value.replace(new RegExp(`(?:${escaped}\\s*,?\\s*){2,}`, 'gi'), `${transition} `);
  }
  return collapseWhitespace(value);
}

function normalizeProceduralMarkers(text = '', strategy = '', traits = {}) {
  const procedural = strategy === 'procedural' || traits.clauseShape === 'list-driven' || traits.diction === 'procedural';
  if (procedural) return text;
  return safeText(text).replace(/\bItem\s+\d+\s*:\s*/gi, '');
}

function dedupeProtectedLiterals(text = '', protectedLiterals = []) {
  let value = safeText(text);
  for (const literal of asArray(protectedLiterals)) {
    const first = value.indexOf(literal);
    if (first === -1) continue;
    const before = value.slice(0, first + literal.length);
    const after = value.slice(first + literal.length).split(literal).join('');
    value = before + after;
  }
  return collapseWhitespace(value);
}

function restoreNegations(text = '', meaningPlan = {}) {
  let value = safeText(text);
  for (const unit of asArray(meaningPlan.units)) {
    if (!unit?.hasNegation) continue;
    const negations = safeText(unit.text).match(/\b(no|not|never|none|without|cannot|can't|do not|don't|did not|didn't)\b/gi) || [];
    for (const negation of negations) {
      if (!new RegExp(`\\b${negation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(value)) {
        value += ` ${negation}`;
      }
    }
  }
  return collapseWhitespace(value);
}

function restoreCaveats(text = '', meaningPlan = {}) {
  let value = safeText(text);
  const caveats = [];
  for (const unit of asArray(meaningPlan.units)) {
    const matches = safeText(unit.text).match(/\b(may|might|seems|appears|possibly|cannot confirm|from what I can tell)\b/gi) || [];
    caveats.push(...matches);
  }
  for (const caveat of [...new Set(caveats)]) {
    if (!new RegExp(caveat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(value)) value = `${caveat} ${value.charAt(0).toLowerCase()}${value.slice(1)}`;
  }
  return collapseWhitespace(value);
}

function removeRepeatedPhrases(text = '') {
  return safeText(text)
    .replace(/\b(\w+)(\s+\1\b)+/gi, '$1')
    .replace(/\b([A-Za-z][A-Za-z ]{3,30})\b\s+\1\b/gi, '$1');
}

export function cleanHushCandidate(input = {}) {
  const candidate = input.candidate || {};
  const protectedLiterals = asArray(input.protectedLiterals || input.meaningPlan?.protectedLiterals);
  const traits = input.realizationPlan?.traits || input.mask?.writingTraits || {};
  const operations = [];
  let text = safeText(candidate.text);
  const before = text;
  text = normalizeProceduralMarkers(text, candidate.strategy || '', traits);
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
  const afterLiterals = text;
  text = restoreNegations(text, input.meaningPlan || {});
  if (text !== afterLiterals) operations.push('restore-negations');
  const afterNegations = text;
  text = restoreCaveats(text, input.meaningPlan || {});
  if (text !== afterNegations) operations.push('restore-caveats');
  text = collapseWhitespace(text);
  return {
    ...candidate,
    text,
    cleanroom: {
      version: HUSH_CANDIDATE_CLEANROOM_VERSION,
      changed: text !== before,
      operations,
      warnings: []
    }
  };
}

export function cleanHushCandidates(input = {}) {
  const candidates = asArray(input.candidates).map((candidate) => cleanHushCandidate({ ...input, candidate }));
  return {
    version: HUSH_CANDIDATE_CLEANROOM_VERSION,
    candidates,
    changedCount: candidates.filter((candidate) => candidate.cleanroom?.changed).length,
    operations: [...new Set(candidates.flatMap((candidate) => asArray(candidate.cleanroom?.operations)))],
    warnings: []
  };
}

export function summarizeCleanroom(result = {}) {
  return {
    version: result.version || HUSH_CANDIDATE_CLEANROOM_VERSION,
    changedCount: Number(result.changedCount || 0),
    operationCount: asArray(result.operations).length,
    operations: asArray(result.operations),
    warnings: asArray(result.warnings)
  };
}
