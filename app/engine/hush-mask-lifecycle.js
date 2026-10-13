export const HUSH_MASK_LIFECYCLE_VERSION = 'phase-12';

const asArray = (value) => Array.isArray(value) ? [...value] : [];
const clamp = (value, min = 0, max = 1) => Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : 0;
const round = (value, digits = 4) => Number.isFinite(value) ? Number(value.toFixed(digits)) : 0;

export const MASK_STATES = Object.freeze(['fresh', 'warming', 'stable', 'overused', 'burned', 'quarantined', 'retired']);

export function buildMaskLifecycle(input = {}) {
  const exposureCount = Number(input.exposureCount ?? input.personaSummary?.acceptedCount ?? input.personaSummary?.entryCount ?? 0);
  const contextSpread = Number(input.contextSpread ?? asArray(input.contexts).filter(Boolean).length ?? 0);
  const recaptureRisk = Number(input.recaptureRisk ?? input.recognitionField?.summary?.recapturePressure ?? input.recognitionField?.summary?.recognitionPressure ?? 0);
  const maskDrift = Number(input.maskDrift ?? input.escapeVector?.scores?.maskDrift ?? 0);
  const maskLinkability = Number(input.maskLinkability ?? input.escapeVector?.scores?.maskLinkability ?? 0);
  const missingLiteralPressure = Number(input.missingLiteralPressure ?? 0);
  let state = 'fresh';
  if (input.retired) state = 'retired';
  else if (missingLiteralPressure > 0 || recaptureRisk >= 0.82 || maskLinkability >= 0.82) state = 'quarantined';
  else if (exposureCount >= 10 || recaptureRisk >= 0.72 || maskLinkability >= 0.72) state = 'burned';
  else if (exposureCount >= 6 || contextSpread >= 4 || maskDrift >= 0.65) state = 'overused';
  else if (exposureCount >= 3) state = 'stable';
  else if (exposureCount >= 1) state = 'warming';
  const rotationRecommendation = ['overused', 'burned', 'quarantined', 'retired'].includes(state) ? 'rotate-mask' : state === 'stable' ? 'monitor-continuity' : 'continue-carefully';
  return {
    version: HUSH_MASK_LIFECYCLE_VERSION,
    maskId: input.maskId || input.mask?.id || '',
    label: input.label || input.mask?.label || '',
    state,
    exposureCount,
    contextSpread,
    recaptureRisk: round(clamp(recaptureRisk)),
    maskDrift: round(clamp(maskDrift)),
    maskLinkability: round(clamp(maskLinkability)),
    lastUsedAt: input.lastUsedAt || null,
    rotationRecommendation,
    warnings: [
      ...(state === 'overused' ? ['mask-overuse-pressure'] : []),
      ...(state === 'burned' ? ['mask-burn-pressure'] : []),
      ...(state === 'quarantined' ? ['mask-quarantine-required'] : []),
      ...(state === 'retired' ? ['mask-retired'] : [])
    ],
    limitations: ['Mask lifecycle is local exposure governance, not an external recognition verdict.']
  };
}

export function updateMaskLifecycle(lifecycle = {}, event = {}) {
  const contexts = [...new Set([...asArray(lifecycle.contexts), event.contextType].filter(Boolean))];
  return buildMaskLifecycle({
    ...lifecycle,
    exposureCount: Number(lifecycle.exposureCount || 0) + (event.countsAsExposure === false ? 0 : 1),
    contexts,
    contextSpread: contexts.length,
    recaptureRisk: Math.max(Number(lifecycle.recaptureRisk || 0), Number(event.recaptureRisk || 0)),
    maskDrift: Math.max(Number(lifecycle.maskDrift || 0), Number(event.maskDrift || 0)),
    maskLinkability: Math.max(Number(lifecycle.maskLinkability || 0), Number(event.maskLinkability || 0)),
    lastUsedAt: event.usedAt || new Date(0).toISOString()
  });
}

export function summarizeMaskLifecycle(lifecycle = {}) {
  return {
    version: lifecycle.version || HUSH_MASK_LIFECYCLE_VERSION,
    maskId: lifecycle.maskId || '',
    state: lifecycle.state || 'fresh',
    exposureCount: lifecycle.exposureCount || 0,
    contextSpread: lifecycle.contextSpread || 0,
    rotationRecommendation: lifecycle.rotationRecommendation || 'continue-carefully',
    warnings: asArray(lifecycle.warnings)
  };
}
