import { detectForbiddenClaims } from './claim-ladder.js';

export const HUSH_RELEASE_POLICY_VERSION = 'phase-18';

const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const safeText = (value) => String(value ?? '');

export const HARD_BLOCK_REASONS = Object.freeze([
  'empty-output',
  'semantic-fidelity-below-mode-floor',
  'protected-literal-score-below-mode-floor',
  'protected-literal-drop',
  'naturalness-catastrophic',
  'forbidden-positive-claim',
  'source-body-severe-with-weak-mask-movement'
]);

export const REVIEW_WARNING_REASONS = Object.freeze([
  'source-residual-high',
  'critical-source-residual-hot',
  'critical-residual-dimension-hot',
  'residual-pressure-over-threshold',
  'low-mask-movement',
  'mask-match-low',
  'candidate-set-weak',
  'naturalness-veto',
  'source-body-attached',
  'source-body-severe',
  'source-opening-retained',
  'source-closing-retained'
]);

export function classifyHushReasons(reasons = []) {
  const unique = [...new Set(asArray(reasons))];
  const hardBlockReasons = [];
  const reviewWarnings = [];
  for (const reason of unique) {
    if (HARD_BLOCK_REASONS.includes(reason)) hardBlockReasons.push(reason);
    else reviewWarnings.push(reason);
  }
  return { hardBlockReasons: [...new Set(hardBlockReasons)], reviewWarnings: [...new Set(reviewWarnings)] };
}

export function buildReleasePolicy(input = {}) {
  const candidate = input.candidate || {};
  const outputText = safeText(input.outputText ?? candidate.text);
  const semantic = Number(input.semanticFidelity ?? candidate.scoreBreakdown?.semanticFidelity ?? candidate.escapeVector?.scores?.semanticFidelity ?? 0);
  const literal = Number(input.protectedLiteralScore ?? candidate.scoreBreakdown?.protectedLiteralScore ?? candidate.lockboxVerification?.preservationScore ?? 1);
  const naturalness = Number(input.naturalnessScore ?? candidate.naturalness?.naturalnessScore ?? 1);
  const sourceResidue = input.sourceResidue || candidate.sourceResidue || null;
  const sourceResidueScore = Number(input.sourceResidueScore ?? candidate.scoreBreakdown?.sourceResidueScore ?? candidate.sourceResidueScore ?? 1);
  const maskMatch = Number(input.maskMatch ?? candidate.scoreBreakdown?.maskMatch ?? candidate.match?.matchScore ?? 1);
  const hardFloorSemantic = Number(input.minSemanticFidelity ?? candidate.weightProfile?.minSemanticFidelity ?? 0.58);
  const hardFloorLiteral = Number(input.minProtectedLiteralScore ?? candidate.weightProfile?.minProtectedLiteralScore ?? 0.92);
  const reasons = [...asArray(input.reasons), ...asArray(candidate.vetoes), ...asArray(candidate.warnings), ...asArray(sourceResidue?.warnings)];
  if (!outputText.trim()) reasons.push('empty-output');
  if (semantic < hardFloorSemantic) reasons.push('semantic-fidelity-below-mode-floor');
  if (literal < hardFloorLiteral) reasons.push('protected-literal-score-below-mode-floor');
  if (literal < 1 && asArray(input.protectedLiterals).length) reasons.push('protected-literal-drop');
  if (naturalness < Number(input.minNaturalness ?? 0.34)) reasons.push('naturalness-catastrophic');
  if (detectForbiddenClaims(outputText).hasForbiddenClaim) reasons.push('forbidden-positive-claim');
  const severeSourceBody = asArray(sourceResidue?.warnings).includes('source-body-severe') || Number(sourceResidue?.metrics?.cadenceBodyRisk ?? 0) > 0.82 || sourceResidueScore < 0.18;
  const weakMaskMovement = maskMatch < Number(input.minMaskMatchForSevereResidue ?? 0.35) || asArray(reasons).includes('low-mask-movement');
  if (severeSourceBody && weakMaskMovement) reasons.push('source-body-severe-with-weak-mask-movement');
  const classified = classifyHushReasons(reasons);
  const hardBlocked = classified.hardBlockReasons.length > 0;
  const releaseStatus = hardBlocked ? 'blocked' : classified.reviewWarnings.length ? 'needs-review' : 'emit';
  return {
    version: HUSH_RELEASE_POLICY_VERSION,
    hardBlocked,
    releaseStatus,
    hardBlockReasons: classified.hardBlockReasons,
    reviewWarnings: classified.reviewWarnings,
    operatorMessage: hardBlocked
      ? 'Output blocked because meaning, protected literals, naturalness, claim discipline, or severe source-body retention failed.'
      : releaseStatus === 'needs-review'
        ? 'Output may populate, but review warnings remain. Do not treat this as sealed.'
        : 'Output may populate for local review.',
    mayPopulateOutput: !hardBlocked,
    maySeal: !hardBlocked && classified.reviewWarnings.length === 0,
    limitations: ['Release policy controls local output population only; it does not predict external recognition outcomes.']
  };
}

export function summarizeReleasePolicy(policy = {}) {
  return {
    version: policy.version || HUSH_RELEASE_POLICY_VERSION,
    releaseStatus: policy.releaseStatus || 'blocked',
    mayPopulateOutput: Boolean(policy.mayPopulateOutput),
    maySeal: Boolean(policy.maySeal),
    hardBlockCount: asArray(policy.hardBlockReasons).length,
    reviewWarningCount: asArray(policy.reviewWarnings).length,
    operatorMessage: policy.operatorMessage || ''
  };
}
