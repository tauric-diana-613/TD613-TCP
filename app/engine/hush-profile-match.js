import { extractCadenceProfile } from './stylometry.js';

export const HUSH_PROFILE_MATCH_VERSION = 'phase-11';

const safeText = (value) => String(value ?? '');
const asArray = (value) => Array.isArray(value) ? [...value] : [];
const clamp = (value, min = 0, max = 1) => Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : 0;
const round = (value, digits = 4) => Number.isFinite(value) ? Number(value.toFixed(digits)) : 0;

function words(text = '') {
  return safeText(text).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || [];
}

function closeness(actual, target, tolerance = 1) {
  if (!Number.isFinite(actual) || !Number.isFinite(target)) return 0;
  const scale = Math.max(Math.abs(target), tolerance);
  return clamp(1 - (Math.abs(actual - target) / scale));
}

function literalStatus(outputText = '', protectedLiterals = []) {
  const required = asArray(protectedLiterals).filter(Boolean);
  if (!required.length) return { status: 'none-required', score: 1, missing: [] };
  const missing = required.filter((literal) => !safeText(outputText).includes(literal));
  return {
    status: missing.length ? 'missing-protected-literals' : 'preserved',
    score: clamp((required.length - missing.length) / Math.max(1, required.length)),
    missing
  };
}

function dimensionScores(outputProfile = {}, maskProfile = {}) {
  return {
    sentenceLength: closeness(outputProfile.avgSentenceLength, maskProfile.avgSentenceLength, 4),
    punctuation: closeness(outputProfile.punctuationDensity, maskProfile.punctuationDensity, 0.08),
    contractions: closeness(outputProfile.contractionDensity, maskProfile.contractionDensity, 0.025),
    recurrence: closeness(outputProfile.recurrencePressure, maskProfile.recurrencePressure, 0.12),
    abstraction: closeness(outputProfile.lexicalDensity, maskProfile.lexicalDensity, 0.18),
    modifiers: closeness(outputProfile.modifierDensity, maskProfile.modifierDensity, 0.06),
    compression: closeness(outputProfile.wordCount, maskProfile.wordCount, Math.max(24, (maskProfile.wordCount || 0) * 0.65))
  };
}

function averageScore(scores = {}) {
  const values = Object.values(scores).filter(Number.isFinite);
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

export function classifyProfileMatch(match = {}) {
  const score = Number(match.matchScore || 0);
  if (!score || score < 0.15) return 'no-signal';
  if (score < 0.45) return 'outside-band';
  if (score < 0.72) return 'partial';
  if (score < 0.90) return 'strong';
  return 'overfit-risk';
}

export function detectProfileMatchWarnings(match = {}) {
  const warnings = [];
  if ((match.semanticFidelity ?? 1) < 0.55) warnings.push('meaning-drift');
  if (match.protectedLiteralStatus === 'missing-protected-literals') warnings.push('protected-literal-drop');
  if ((match.sourceResidualRisk ?? 0) > 0.58) warnings.push('source-residual-high');
  if ((match.matchScore ?? 0) < 0.45) warnings.push('mask-match-low');
  if (match.toleranceStatus === 'overfit-risk') warnings.push('overfit-risk');
  if ((match.outputWordCount ?? 0) > 0 && match.outputWordCount < 12) warnings.push('short-output');
  if ((match.recognitionPressure ?? 0) >= 0.68) warnings.push('context-pressure-hot');
  return [...new Set(warnings)];
}

export function buildProfileMatch(input = {}) {
  const sourceText = safeText(input.sourceText);
  const outputText = safeText(input.outputText);
  const maskProfile = input.maskProfile || {};
  const sourceProfile = input.sourceProfile || extractCadenceProfile(sourceText);
  const outputProfile = input.outputProfile || extractCadenceProfile(outputText);
  const dimensions = dimensionScores(outputProfile, maskProfile);
  const literal = literalStatus(outputText, input.protectedLiterals);
  const semanticFidelity = input.semanticAudit?.semanticFidelity ?? input.escapeVector?.scores?.semanticFidelity ?? input.escapeVector?.semanticFidelity ?? null;
  const sourceResidualRisk = input.escapeVector?.scores?.sourceResidualRisk ?? input.escapeVector?.sourceResidualRisk ?? null;
  const recognitionPressure = input.recognitionField?.summary?.recognitionPressure ?? null;
  let matchScore = averageScore(dimensions);
  if (Number.isFinite(semanticFidelity)) matchScore *= clamp(0.55 + (semanticFidelity * 0.45));
  matchScore *= clamp(0.35 + (literal.score * 0.65));
  const preliminary = {
    version: HUSH_PROFILE_MATCH_VERSION,
    matchScore: round(matchScore),
    toleranceStatus: 'partial',
    dimensionScores: Object.fromEntries(Object.entries(dimensions).map(([key, value]) => [key, round(value)])),
    sourceResidualRisk: Number.isFinite(sourceResidualRisk) ? round(sourceResidualRisk) : null,
    semanticFidelity: Number.isFinite(semanticFidelity) ? round(semanticFidelity) : null,
    protectedLiteralStatus: literal.status,
    missingProtectedLiterals: literal.missing,
    protectedLiteralScore: round(literal.score),
    recognitionPressure: Number.isFinite(recognitionPressure) ? round(recognitionPressure) : null,
    outputWordCount: words(outputText).length,
    warnings: [],
    limitations: [
      'Profile match is local tolerance-band convergence, not external recognition behavior.',
      'A high mask match with low semantic fidelity is a failed swap.'
    ]
  };
  preliminary.toleranceStatus = classifyProfileMatch(preliminary);
  preliminary.warnings = detectProfileMatchWarnings(preliminary);
  return preliminary;
}

export function summarizeProfileMatch(match = {}) {
  return {
    version: match.version || HUSH_PROFILE_MATCH_VERSION,
    matchScore: match.matchScore ?? null,
    toleranceStatus: match.toleranceStatus || classifyProfileMatch(match),
    protectedLiteralStatus: match.protectedLiteralStatus || '',
    semanticFidelity: match.semanticFidelity ?? null,
    sourceResidualRisk: match.sourceResidualRisk ?? null,
    warnings: asArray(match.warnings)
  };
}
