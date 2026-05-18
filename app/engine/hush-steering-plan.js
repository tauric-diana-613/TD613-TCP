import { buildResidualVector, residualVeto, summarizeResidualVector } from './hush-residual-vector.js';
import { verifyProtectedLiteralLockbox, summarizeProtectedLiteralLockbox } from './hush-protected-literal-lockbox.js';

export const HUSH_STEERING_PLAN_VERSION = 'phase-12';

const asArray = (value) => Array.isArray(value) ? [...value] : [];
const clamp = (value, min = 0, max = 1) => Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : 0;
const round = (value, digits = 4) => Number.isFinite(value) ? Number(value.toFixed(digits)) : 0;

export const MODE_WEIGHT_PROFILES = Object.freeze({
  neutralize: { maskMatch: 0.28, semanticFidelity: 0.26, protectedLiteralScore: 0.22, sourceReductionScore: 0.16, contextSafetyScore: 0.08, minSemanticFidelity: 0.58, minProtectedLiteralScore: 0.92, maxResidualPressure: 0.72 },
  'stable-pseudonym': { maskMatch: 0.34, semanticFidelity: 0.22, protectedLiteralScore: 0.18, sourceReductionScore: 0.12, contextSafetyScore: 0.14, minSemanticFidelity: 0.62, minProtectedLiteralScore: 0.92, maxResidualPressure: 0.68 },
  'rotating-mask': { maskMatch: 0.20, semanticFidelity: 0.16, protectedLiteralScore: 0.14, sourceReductionScore: 0.28, contextSafetyScore: 0.22, minSemanticFidelity: 0.58, minProtectedLiteralScore: 0.88, maxResidualPressure: 0.58 },
  'hostile-pipeline-compression': { maskMatch: 0.12, semanticFidelity: 0.34, protectedLiteralScore: 0.32, sourceReductionScore: 0.12, contextSafetyScore: 0.10, minSemanticFidelity: 0.86, minProtectedLiteralScore: 1, maxResidualPressure: 0.75 },
  'legal-intake': { maskMatch: 0.12, semanticFidelity: 0.36, protectedLiteralScore: 0.34, sourceReductionScore: 0.08, contextSafetyScore: 0.10, minSemanticFidelity: 0.90, minProtectedLiteralScore: 1, maxResidualPressure: 0.78 }
});

export function getHushWeightProfile(mode = 'neutralize', contextType = '') {
  if (contextType === 'legal-intake' || contextType === 'protected-tip-form' || contextType === 'hr-compliance-portal') return MODE_WEIGHT_PROFILES['legal-intake'];
  return MODE_WEIGHT_PROFILES[mode] || MODE_WEIGHT_PROFILES.neutralize;
}

export function scoreCandidateWithSteering(input = {}) {
  const profile = getHushWeightProfile(input.operatorMode || 'neutralize', input.contextType || '');
  const maskMatch = Number(input.maskMatch ?? 0);
  const semanticFidelity = Number(input.semanticFidelity ?? 0);
  const protectedLiteralScore = Number(input.protectedLiteralScore ?? 1);
  const sourceReductionScore = Number(input.sourceReductionScore ?? 0);
  const contextSafetyScore = Number(input.contextSafetyScore ?? 0);
  let finalScore =
    profile.maskMatch * maskMatch +
    profile.semanticFidelity * semanticFidelity +
    profile.protectedLiteralScore * protectedLiteralScore +
    profile.sourceReductionScore * sourceReductionScore +
    profile.contextSafetyScore * contextSafetyScore;
  const vetoes = [];
  if (semanticFidelity < profile.minSemanticFidelity) vetoes.push('semantic-fidelity-below-mode-floor');
  if (protectedLiteralScore < profile.minProtectedLiteralScore) vetoes.push('protected-literal-score-below-mode-floor');
  if (input.residualVector) {
    const veto = residualVeto(input.residualVector, { maxResidual: profile.maxResidualPressure, maxCritical: 0 });
    if (veto.vetoed) vetoes.push(...veto.reasons);
    finalScore *= clamp(1 - Math.max(0, (input.residualVector.summary?.residualPressure ?? 0) - 0.35));
  }
  if (vetoes.length) finalScore *= 0.35;
  return {
    finalScore: round(clamp(finalScore)),
    scoreBreakdown: {
      maskMatch: round(maskMatch),
      semanticFidelity: round(semanticFidelity),
      protectedLiteralScore: round(protectedLiteralScore),
      sourceReductionScore: round(sourceReductionScore),
      contextSafetyScore: round(contextSafetyScore),
      residualPressure: input.residualVector?.summary?.residualPressure ?? null
    },
    weightProfile: profile,
    vetoes: [...new Set(vetoes)]
  };
}

export function buildSteeringPlan(input = {}) {
  const residualVector = input.residualVector || buildResidualVector(input);
  const lockboxVerification = input.lockbox ? verifyProtectedLiteralLockbox(input.lockbox, input.outputText || '') : null;
  const sortedResiduals = asArray(residualVector.dimensions).slice().sort((a, b) => (b.residualPressure || 0) - (a.residualPressure || 0));
  const targetDimensions = sortedResiduals.filter((dim) => dim.status !== 'cool').slice(0, 4);
  const steps = [];
  if (lockboxVerification?.missingCount) steps.push({ code: 'restore-literals', priority: 100, target: 'protected literals', reason: 'Locked literal strings are missing from the output.' });
  for (const dim of targetDimensions) {
    steps.push({ code: `target-${dim.key}`, priority: dim.critical ? 80 : 60, target: dim.label, reason: `${dim.label} remains ${dim.status}; movement=${dim.movementTowardMask}, residual=${dim.residualPressure}` });
  }
  if (!steps.length) steps.push({ code: 'maintain-review', priority: 30, target: 'review', reason: 'No hot residual dimension surfaced. Continue review before export.' });
  const viable = residualVector.summary?.viableForSeal && !lockboxVerification?.missingCount;
  return {
    version: HUSH_STEERING_PLAN_VERSION,
    route: viable ? 'seal-review' : 'targeted-rewrite',
    residualVector,
    residualSummary: summarizeResidualVector(residualVector),
    lockboxSummary: input.lockbox ? summarizeProtectedLiteralLockbox(input.lockbox, lockboxVerification) : null,
    targetDimensions,
    steps: steps.sort((a, b) => b.priority - a.priority),
    viability: {
      viable,
      allCandidatesFailed: Boolean(input.allCandidatesFailed),
      reason: viable ? 'Residual and literal checks are within local review thresholds.' : 'One or more residual or literal checks require targeted revision.'
    },
    warnings: [...asArray(residualVector.warnings), ...asArray(lockboxVerification?.warnings)]
  };
}

export function summarizeSteeringPlan(plan = {}) {
  return {
    version: plan.version || HUSH_STEERING_PLAN_VERSION,
    route: plan.route || 'targeted-rewrite',
    largestResidualFeature: plan.residualSummary?.largestResidualFeature || null,
    stepCount: asArray(plan.steps).length,
    firstStep: asArray(plan.steps)[0]?.code || null,
    viable: Boolean(plan.viability?.viable),
    warnings: asArray(plan.warnings)
  };
}
