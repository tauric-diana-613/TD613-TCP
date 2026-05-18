import { extractCadenceProfile } from './stylometry.js';

export const HUSH_RESIDUAL_VECTOR_VERSION = 'phase-12';

const safeText = (value) => String(value ?? '');
const clamp = (value, min = 0, max = 1) => Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : 0;
const round = (value, digits = 4) => Number.isFinite(value) ? Number(value.toFixed(digits)) : 0;

export const RESIDUAL_DIMENSIONS = Object.freeze([
  { key: 'avgSentenceLength', label: 'sentence length', tolerance: 4, critical: true },
  { key: 'punctuationDensity', label: 'punctuation density', tolerance: 0.08, critical: true },
  { key: 'contractionDensity', label: 'contraction density', tolerance: 0.025, critical: false },
  { key: 'recurrencePressure', label: 'recurrence pressure', tolerance: 0.12, critical: true },
  { key: 'lexicalDensity', label: 'lexical density', tolerance: 0.18, critical: true },
  { key: 'modifierDensity', label: 'modifier density', tolerance: 0.06, critical: false },
  { key: 'lineBreakDensity', label: 'line break density', tolerance: 0.06, critical: false },
  { key: 'lexicalEntropy', label: 'lexical entropy', tolerance: 0.7, critical: true }
]);

function profile(input = {}) {
  if (input && typeof input === 'object' && !Array.isArray(input)) return input;
  return extractCadenceProfile(safeText(input));
}

function distance(a, b, tolerance = 1) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.abs(a - b) / Math.max(Math.abs(b), tolerance);
}

function closeness(a, b, tolerance = 1) {
  const d = distance(a, b, tolerance);
  return d === null ? 0 : clamp(1 - d);
}

function movement(sourceValue, outputValue, maskValue, tolerance) {
  const sourceToMask = distance(sourceValue, maskValue, tolerance);
  const outputToMask = distance(outputValue, maskValue, tolerance);
  if (sourceToMask === null || outputToMask === null) return 0;
  if (sourceToMask === 0) return outputToMask <= 0.01 ? 1 : 0;
  return clamp((sourceToMask - outputToMask) / sourceToMask, -1, 1);
}

function sourceStickiness(sourceValue, outputValue, maskValue, tolerance) {
  const outputSource = closeness(outputValue, sourceValue, tolerance);
  const outputMask = closeness(outputValue, maskValue, tolerance);
  return clamp(outputSource - outputMask + 0.5);
}

export function buildResidualVector(input = {}) {
  const sourceProfile = profile(input.sourceProfile || input.sourceText || '');
  const outputProfile = profile(input.outputProfile || input.outputText || '');
  const maskProfile = profile(input.maskProfile || input.maskText || '');
  const dimensions = RESIDUAL_DIMENSIONS.map((dim) => {
    const sourceValue = Number(sourceProfile[dim.key]);
    const outputValue = Number(outputProfile[dim.key]);
    const maskValue = Number(maskProfile[dim.key]);
    const maskDistance = distance(outputValue, maskValue, dim.tolerance);
    const sourceDistance = distance(outputValue, sourceValue, dim.tolerance);
    const sourceToMask = distance(sourceValue, maskValue, dim.tolerance);
    const move = movement(sourceValue, outputValue, maskValue, dim.tolerance);
    const sticky = sourceStickiness(sourceValue, outputValue, maskValue, dim.tolerance);
    const residual = clamp((maskDistance ?? 1) * 0.6 + sticky * 0.4);
    return {
      key: dim.key,
      label: dim.label,
      critical: dim.critical,
      sourceValue: Number.isFinite(sourceValue) ? round(sourceValue) : null,
      outputValue: Number.isFinite(outputValue) ? round(outputValue) : null,
      maskValue: Number.isFinite(maskValue) ? round(maskValue) : null,
      outputMaskDistance: maskDistance === null ? null : round(maskDistance),
      outputSourceDistance: sourceDistance === null ? null : round(sourceDistance),
      sourceMaskDistance: sourceToMask === null ? null : round(sourceToMask),
      movementTowardMask: round(move),
      sourceStickiness: round(sticky),
      residualPressure: round(residual),
      status: residual >= 0.75 ? 'hot' : residual >= 0.45 ? 'warm' : 'cool'
    };
  });
  const hot = dimensions.filter((dim) => dim.status === 'hot');
  const criticalHot = hot.filter((dim) => dim.critical);
  const largest = [...dimensions].sort((a, b) => (b.residualPressure || 0) - (a.residualPressure || 0))[0] || null;
  const meanResidual = dimensions.length ? dimensions.reduce((sum, dim) => sum + (dim.residualPressure || 0), 0) / dimensions.length : 0;
  const meanMovement = dimensions.length ? dimensions.reduce((sum, dim) => sum + (dim.movementTowardMask || 0), 0) / dimensions.length : 0;
  return {
    version: HUSH_RESIDUAL_VECTOR_VERSION,
    dimensionCount: dimensions.length,
    dimensions,
    largestResidualFeature: largest,
    hotDimensions: hot.map((dim) => dim.key),
    criticalHotDimensions: criticalHot.map((dim) => dim.key),
    summary: {
      residualPressure: round(meanResidual),
      movementTowardMask: round(meanMovement),
      criticalResidualCount: criticalHot.length,
      viableForSeal: meanResidual < 0.45 && criticalHot.length === 0
    },
    warnings: [
      ...(criticalHot.length ? ['critical-source-residual-hot'] : []),
      ...(meanMovement < 0.15 ? ['low-mask-movement'] : []),
      ...(meanResidual >= 0.7 ? ['candidate-set-weak'] : [])
    ],
    limitations: ['Residual vectors are local feature pressure summaries, not identity conclusions.']
  };
}

export function summarizeResidualVector(vector = {}) {
  return {
    version: vector.version || HUSH_RESIDUAL_VECTOR_VERSION,
    residualPressure: vector.summary?.residualPressure ?? null,
    movementTowardMask: vector.summary?.movementTowardMask ?? null,
    largestResidualFeature: vector.largestResidualFeature?.label || null,
    criticalResidualCount: vector.summary?.criticalResidualCount ?? 0,
    viableForSeal: Boolean(vector.summary?.viableForSeal),
    warnings: Array.isArray(vector.warnings) ? [...vector.warnings] : []
  };
}

export function residualVeto(vector = {}, options = {}) {
  const maxResidual = Number(options.maxResidual ?? 0.72);
  const maxCritical = Number(options.maxCritical ?? 0);
  const residual = Number(vector.summary?.residualPressure ?? 1);
  const critical = Number(vector.summary?.criticalResidualCount ?? 99);
  const vetoed = residual > maxResidual || critical > maxCritical;
  return {
    vetoed,
    reasons: [
      ...(residual > maxResidual ? ['residual-pressure-over-threshold'] : []),
      ...(critical > maxCritical ? ['critical-residual-dimension-hot'] : [])
    ],
    residualPressure: round(residual),
    criticalResidualCount: critical
  };
}
