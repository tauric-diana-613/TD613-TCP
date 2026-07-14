export const HUSH_CLAIM_INTEGRITY_VERSION = 'phase-19';

const safeText = (value) => String(value ?? '');
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const unique = (values = []) => [...new Set(asArray(values))];

function containsAny(text = '', patterns = []) {
  const value = safeText(text);
  return patterns.some((pattern) => typeof pattern === 'string' ? value.includes(pattern) : pattern.test(value));
}

function extractNegations(text = '') {
  return safeText(text).match(/\b(no|not|never|none|without|cannot|can't|do not|don't|did not|didn't)\b/gi) || [];
}

function extractCaveats(text = '') {
  return safeText(text).match(/\b(may|might|appears|seems|possibly|cannot confirm|from what I can tell|I do not know|not naming)\b/gi) || [];
}

function extractDates(text = '') {
  return safeText(text).match(/\b\d{1,4}[/-]\d{1,2}(?:[/-]\d{1,4})?\b|\b\d{4}-\d{2}-\d{2}\b/g) || [];
}

function extractEvidence(text = '') {
  const matches = safeText(text).match(/\b(?:EXHIBIT|DOC|CASE|ID|REF|TD613|SHI|SAC)[A-Z0-9:_#\[\]\/-]*\b/g) || [];
  return matches.filter((marker) => !['EXHIBIT', 'DOC', 'CASE', 'ID', 'REF', 'SHI', 'SAC'].includes(marker.toUpperCase()));
}

function status(hasFailure, hasReview = false) {
  if (hasFailure) return 'fail';
  if (hasReview) return 'review';
  return 'pass';
}

export function buildClaimIntegrityCheck(input = {}) {
  return verifyClaimIntegrity(input);
}

export function verifyClaimIntegrity(input = {}) {
  const sourceText = safeText(input.sourceText);
  const outputText = safeText(input.outputText ?? input.text);
  const protectedLiterals = unique([...(input.protectedLiterals || []), ...(input.meaningPlan?.protectedLiterals || [])]);
  const hardFailures = [];
  const reviewWarnings = [];
  const repairsSuggested = [];

  const missingProtected = protectedLiterals.filter((literal) => !outputText.includes(literal));
  if (missingProtected.length) {
    hardFailures.push('protected-literal-dropped');
    repairsSuggested.push('restore-protected-literal');
  }

  const sourceNegations = unique(extractNegations(sourceText));
  const outputNegations = extractNegations(outputText);
  if (sourceNegations.length && !outputNegations.length) hardFailures.push('negation-dropped');
  if (/\bI did not\b/i.test(sourceText) && /\bI did\b/i.test(outputText) && !/\bI did not\b/i.test(outputText)) hardFailures.push('negation-inverted');

  const sourceCaveats = unique(extractCaveats(sourceText));
  const outputCaveats = extractCaveats(outputText);
  if (sourceCaveats.length && !outputCaveats.length) {
    hardFailures.push('uncertainty-removed');
    repairsSuggested.push('restore-caveat');
  }

  const missingDates = unique(extractDates(sourceText)).filter((date) => !outputText.includes(date));
  if (missingDates.length) hardFailures.push('date-dropped');

  const missingEvidence = unique(extractEvidence(sourceText)).filter((marker) => !outputText.includes(marker));
  if (missingEvidence.length) hardFailures.push('evidence-anchor-dropped');

  const sourceRequest = /\b(please keep|i need|make sure|should remain|do not separate|preserve|keep)\b/i.test(sourceText);
  const outputRequest = /\b(please keep|it would help|keep|preserve|should stay|should remain|record note)\b/i.test(outputText);
  if (sourceRequest && !outputRequest) reviewWarnings.push('request-softened-review');

  if (sourceCaveats.length && outputCaveats.length && outputText.search(new RegExp(outputCaveats[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')) > 80) reviewWarnings.push('caveat-moved-too-far');

  const checks = {
    protectedLiterals: status(missingProtected.length > 0),
    negations: status(hardFailures.includes('negation-dropped') || hardFailures.includes('negation-inverted')),
    caveats: status(hardFailures.includes('uncertainty-removed'), reviewWarnings.includes('caveat-moved-too-far')),
    dates: status(missingDates.length > 0),
    evidenceAnchors: status(missingEvidence.length > 0),
    requestIntent: status(false, reviewWarnings.includes('request-softened-review')),
    actorActionObject: 'review'
  };
  const score = Math.max(0, 1 - hardFailures.length * 0.22 - reviewWarnings.length * 0.05);
  return {
    version: HUSH_CLAIM_INTEGRITY_VERSION,
    passed: hardFailures.length === 0,
    score: Number(score.toFixed(4)),
    checks,
    hardFailures: unique(hardFailures),
    reviewWarnings: unique(reviewWarnings),
    repairsSuggested: unique(repairsSuggested)
  };
}

export function summarizeClaimIntegrity(input = {}) {
  const check = input.checks ? input : verifyClaimIntegrity(input);
  return {
    version: check.version || HUSH_CLAIM_INTEGRITY_VERSION,
    passed: Boolean(check.passed),
    score: check.score ?? 0,
    hardFailureCount: asArray(check.hardFailures).length,
    reviewWarningCount: asArray(check.reviewWarnings).length,
    hardFailures: asArray(check.hardFailures),
    reviewWarnings: asArray(check.reviewWarnings)
  };
}
