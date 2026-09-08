// Lifecycle evidence retrieved 2026-09-08. Listing visibility never supplies quality rank.
export const GEMINI_LIFECYCLE_VERSION = 'td613.gemini-lifecycle/v0.1';
export const GEMINI_LIFECYCLE_SOURCES = Object.freeze([
  'https://ai.google.dev/gemini-api/docs/models',
  'https://ai.google.dev/gemini-api/docs/deprecations'
]);
const LEGACY_CATALOG = Object.freeze({
  'gemini-3.5-flash': Object.freeze({ tier: 'frontier', stability: 'stable', quality: 100, role: 'primary-quality' }),
  'gemini-3-flash-preview': Object.freeze({ tier: 'frontier', stability: 'preview', quality: 92, role: 'secondary-quality' }),
  'gemini-2.5-flash': Object.freeze({ tier: 'reasoning', stability: 'stable', quality: 84, role: 'stable-fallback' }),
  'gemini-3.1-flash-lite': Object.freeze({ tier: 'economy', stability: 'stable', quality: 70, role: 'high-volume-fallback' }),
  'gemini-2.5-flash-lite': Object.freeze({ tier: 'economy', stability: 'stable', quality: 58, role: 'last-resort-fallback' }),
  'gemini-3.1-pro-preview': Object.freeze({ tier: 'frontier-pro', stability: 'preview', quality: 105, role: 'explicit-opt-in-only' }),
  'gemini-2.5-pro': Object.freeze({ tier: 'pro', stability: 'stable', quality: 90, role: 'explicit-opt-in-only' })
});


const rows = Object.fromEntries(Object.entries(LEGACY_CATALOG).map(([id, row]) => [id, {
  ...row, lifecycle: 'current', capability: 'text', qualityEvidence: 'legacy-policy-prior-not-benchmark-proof'
}]));
for (const id of ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite']) {
  rows[id] = { tier: 'candidate', stability: 'stable', quality: null, role: 'benchmark-candidate', lifecycle: 'current', capability: 'text', qualityEvidence: 'missing' };
}
rows['gemini-3.1-flash-lite'].earliestShutdown = '2027-05-07';
rows['gemini-3.1-flash-lite'].lifecycle = 'shutdown_scheduled';
for (const id of ['gemini-2.0-flash', 'gemini-2.0-flash-001', 'gemini-2.0-flash-lite', 'gemini-2.0-flash-lite-001', 'gemini-3-pro-preview', 'gemini-3.1-flash-lite-preview']) {
  rows[id] = { stability: 'retired', lifecycle: 'shutdown', capability: 'text', role: 'excluded' };
}
for (const id of ['gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-pro-latest']) {
  rows[id] = { stability: 'moving-alias', lifecycle: 'unknown_operator_supplied', capability: 'text', role: 'explicit-opt-in-only' };
}
// Exact known specialized IDs. Unknown names never acquire capability by a regex guess.
for (const id of ['gemini-2.5-flash-preview-tts', 'gemini-2.5-pro-preview-tts', 'gemini-2.5-flash-image', 'gemini-3-pro-image-preview', 'gemini-3-pro-image', 'nano-banana-pro-preview', 'gemini-3.1-flash-image-preview', 'gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image', 'gemini-omni-flash-preview', 'gemini-omni-1.1-flash', 'gemini-3.5-transcribe', 'lyria-3-clip-preview', 'lyria-3-pro-preview', 'lyria-3.5', 'gemini-3.1-flash-tts-preview', 'gemini-robotics-er-2-preview', 'gemini-2.5-computer-use-preview-10-2025', 'antigravity-preview-05-2026', 'deep-research-max-preview-04-2026', 'deep-research-preview-04-2026', 'deep-research-pro-preview-12-2025']) {
  rows[id] = { stability: 'task-specific', lifecycle: 'specialized', capability: 'specialized', role: 'separate-route-required' };
}
export const MODEL_CATALOG = Object.freeze(Object.fromEntries(Object.entries(rows).map(([id, row]) => [id, Object.freeze({ ...row, lifecycleEvidenceDate: '2026-09-08' })])));

export function assessGeminiEligibility(model, { explicit = false, listing, at = Date.now() } = {}) {
  const metadata = MODEL_CATALOG[model];
  const reasons = [];
  const fresh = listing?.ok === true && listing.complete === true && Array.isArray(listing.models)
    && Number.isFinite(listing.observedAt) && Number.isFinite(listing.expiresAt)
    && listing.observedAt <= at && at < listing.expiresAt
    && listing.expiresAt - listing.observedAt <= 600000;
  if (!fresh) reasons.push('fresh-complete-provider-observation-required');
  else if (!listing.models.includes(model)) reasons.push('provider-absent');
  if (metadata?.earliestShutdown && at >= Date.parse(metadata.earliestShutdown)) reasons.push('lifecycle-review-required');
  if (metadata?.lifecycle === 'shutdown') reasons.push('documented-shutdown');
  if (metadata?.capability === 'specialized') reasons.push('specialized-route-required');
  if ((!metadata || metadata.stability === 'moving-alias' || metadata.role === 'benchmark-candidate') && !explicit) reasons.push('explicit-operator-selection-required');
  return Object.freeze({ eligible: reasons.length === 0, reasons: Object.freeze(reasons), providerObservationFresh: fresh, lifecycle: metadata?.lifecycle || 'unknown_operator_supplied' });
}
