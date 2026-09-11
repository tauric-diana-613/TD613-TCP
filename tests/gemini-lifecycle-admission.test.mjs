import assert from 'node:assert/strict';
import fs from 'node:fs';
import { GEMINI_LIFECYCLE_VERSION, MODEL_CATALOG, assessGeminiEligibility } from '../server/gemini-model-registry.js';
import { clearGeminiModelState, recordGeminiModelOutcome, resolveGeminiModelPlan } from '../server/gemini-model-policy.js';
import handler from '../server/hush-generate-quality.js';

const at = 1000000;
const models = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite-preview', 'gemini-3.1-flash-image', 'gemini-flash-latest', 'operator-future-model'];
const listing = { ok: true, complete: true, observedAt: at - 1000, expiresAt: at + 599000, models };
clearGeminiModelState();
const plan = (providerListing, env = {}) => resolveGeminiModelPlan({ task: 'hush-transform', env, at, providerListing });
assert.deepEqual(plan(listing).callableModels, ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-2.5-flash']);
assert.ok(plan(listing).excludedModels.some(row => row.model === 'gemini-3.7-flash' && row.reasons.includes('provider-absent')));
assert.ok(plan(listing).excludedModels.some(row => row.model === 'gemini-3.6-flash' && row.reasons.includes('provider-absent')));
assert.ok(plan(listing).excludedModels.some(row => row.model === 'gemini-3-flash-preview' && row.reasons.includes('provider-absent')));
for (const bad of [undefined, { ...listing, ok: false }, { ...listing, complete: false }, { ...listing, observedAt: at + 1 }, { ...listing, expiresAt: at }, { ...listing, observedAt: NaN }, { ...listing, expiresAt: at + 600001 }]) {
  assert.deepEqual(plan(bad).callableModels, []);
}
assert.deepEqual(plan({ ...listing, models: [] }).callableModels, []);
assert.equal(MODEL_CATALOG['gemini-3.8-flash'].quality, 130);
assert.equal(MODEL_CATALOG['gemini-3.8-flash'].role, 'primary-quality');
assert.equal(assessGeminiEligibility('gemini-3.8-flash', { listing, at }).eligible, true);
assert.equal(assessGeminiEligibility('gemini-3.8-flash', { explicit: true, listing, at }).eligible, true);
for (const [id, reason] of [['gemini-3.1-flash-lite-preview', 'documented-shutdown'], ['gemini-3.1-flash-image', 'specialized-route-required']]) {
  const p = plan(listing, { HUSH_GEMINI_MODEL: id });
  assert.equal(p.explicitModels[0], id); // Preserve the request and explain its hold.
  assert.ok(!p.callableModels.includes(id));
  assert.ok(p.excludedModels.find(row => row.model === id).reasons.includes(reason));
}
for (const id of ['gemini-flash-latest', 'operator-future-model']) {
  const p = plan(listing, { HUSH_GEMINI_MODEL: id });
  assert.ok(p.callableModels.includes(id));
  assert.equal(p.callableModels[0], 'gemini-3.8-flash', 'quality-first must not let an explicit legacy/unknown route outrank the pinned frontier');
}
assert.ok(!plan(listing, { GEMINI_DISABLED_MODELS: 'gemini-3.8-flash' }).callableModels.includes('gemini-3.8-flash'));
assert.equal(resolveGeminiModelPlan({ env: {}, at, providerListing: listing, maxModels: 1 }).callableModels.length, 1);

recordGeminiModelOutcome('gemini-3.8-flash', { ok: false, status: 429 }, at);
assert.deepEqual(plan(listing).callableModels, ['gemini-3.5-flash', 'gemini-2.5-flash']);
clearGeminiModelState();
const scheduledAt = Date.parse('2027-05-07');
assert.ok(assessGeminiEligibility('gemini-3.1-flash-lite', { explicit: true, at: scheduledAt, listing: { ...listing, models: ['gemini-3.1-flash-lite'], observedAt: scheduledAt, expiresAt: scheduledAt + 1000 } }).reasons.includes('lifecycle-review-required'));

// A complete empty listing must cause zero generation attempts, including via Hush.
const originalFetch = globalThis.fetch;
const originalKey = process.env.GEMINI_API_KEY;
const originalModel = process.env.HUSH_GEMINI_MODEL;
const calls = [];
try {
  process.env.GEMINI_API_KEY = 'synthetic-admission-key';
  process.env.HUSH_GEMINI_MODEL = 'gemini-3.5-flash';
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    assert.ok(String(url).includes('/models?'));
    return { ok: true, status: 200, async json() { return { models: [] }; } };
  };
  const res = { setHeader() {}, status(n) { this.statusCode = n; return this; }, json(p) { this.payload = p; return p; } };
  await handler({ method: 'POST', body: { contract: { sourceText: 'The cat crossed the room.' } } }, res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.payload.reason, 'no_eligible_callable_models');
  assert.equal(res.payload.attempts.length, 0);
  assert.equal(calls.length, 1);
} finally {
  globalThis.fetch = originalFetch;
  for (const [key, value] of [['GEMINI_API_KEY', originalKey], ['HUSH_GEMINI_MODEL', originalModel]]) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
  clearGeminiModelState();
}

// External-episode reconciliation: visibility, generation outcome, and lifecycle stay distinct.
const reconciliation = JSON.parse(fs.readFileSync(
  new URL('./fixtures/gemini/gemini-visibility-availability-non-equivalence-v01.json', import.meta.url),
  'utf8'
));
const pre = reconciliation.observations.pre_failure_listing;
const failure = reconciliation.observations.generation_failure;
const post = reconciliation.observations.post_failure_listing;
assert.equal(reconciliation.model, 'gemini-3.8-flash');
assert.equal(pre.ok, true);
assert.equal(pre.complete, true);
assert.equal(pre.cached, false);
assert.equal(pre.model_visible, true);
assert.equal(post.ok, true);
assert.equal(post.complete, true);
assert.equal(post.cached, false);
assert.equal(post.model_visible, true);
assert.equal(failure.status, 503);
assert.equal(failure.successful_generation, false);
assert.equal(failure.model, undefined, 'generation model remains bound by the repository source rather than duplicated fixture prose');
assert.ok(Date.parse(pre.completed_at) < Date.parse(failure.observed_at));
assert.ok(Date.parse(failure.observed_at) < Date.parse(post.started_at));
assert.equal(post.current_main_dispatch, false, 'historical rerun must not masquerade as current-main dispatch closure');
assert.notEqual(post.source_sha, reconciliation.execution_parent);
assert.equal(GEMINI_LIFECYCLE_VERSION, reconciliation.lifecycle.registry_version);
assert.equal(MODEL_CATALOG[reconciliation.model].stability, reconciliation.lifecycle.registry_stability);
assert.equal(MODEL_CATALOG[reconciliation.model].lifecycle, reconciliation.lifecycle.registry_lifecycle);
assert.equal(reconciliation.lifecycle.official_status, 'GA_STABLE');
assert.equal(reconciliation.lifecycle.official_shutdown_announced, false);
const handoff = fs.readFileSync(new URL('../docs/research/2026-09-10-LOOM-LIVING-ROOM-HANDOFF.md', import.meta.url), 'utf8');
assert.match(handoff, new RegExp(failure.request_id));
assert.match(handoff, /returned a provider HTTP 503 after 2,196 ms/);
assert.match(handoff, /model `gemini-3\.8-flash`/);
assert.match(handoff, /stage\s+`provider-transport`/);
for (const claim of Object.values(reconciliation.claim_ceiling)) {
  assert.equal(claim, false, 'negative authority ceilings must remain false');
}
assert.deepEqual(reconciliation.earned_if_valid, [
  'CREDENTIAL_SCOPED_LIST_VISIBILITY_DOES_NOT_IMPLY_GENERATION_EPISODE_SUCCESS',
  'DOCUMENTED_CURRENT_LIFECYCLE_DOES_NOT_IMPLY_PER_EPISODE_TRANSPORT_SUCCESS',
  'THE_2026_09_10_HTTP_503_IS_NOT_EVIDENCE_OF_GLOBAL_GEMINI_3_8_FLASH_RETIREMENT'
]);

console.log('gemini-lifecycle-admission.test.mjs passed');
