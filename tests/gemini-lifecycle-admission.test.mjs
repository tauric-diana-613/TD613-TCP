import assert from 'node:assert/strict';
import { MODEL_CATALOG, assessGeminiEligibility } from '../server/gemini-model-registry.js';
import { clearGeminiModelState, recordGeminiModelOutcome, resolveGeminiModelPlan } from '../server/gemini-model-policy.js';
import handler from '../server/hush-generate-quality.js';

const at = 1000000;
const models = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite-preview', 'gemini-3.1-flash-image', 'gemini-flash-latest', 'operator-future-model'];
const listing = { ok: true, complete: true, observedAt: at - 1000, expiresAt: at + 599000, models };
clearGeminiModelState();
const plan = (providerListing, env = {}) => resolveGeminiModelPlan({ task: 'hush-transform', env, at, providerListing });
assert.deepEqual(plan(listing).callableModels, ['gemini-3.5-flash', 'gemini-2.5-flash']);
assert.ok(plan(listing).excludedModels.some(row => row.model === 'gemini-3-flash-preview' && row.reasons.includes('provider-absent')));
for (const bad of [undefined, { ...listing, ok: false }, { ...listing, complete: false }, { ...listing, observedAt: at + 1 }, { ...listing, expiresAt: at }, { ...listing, observedAt: NaN }, { ...listing, expiresAt: at + 600001 }]) {
  assert.deepEqual(plan(bad).callableModels, []);
}
assert.deepEqual(plan({ ...listing, models: [] }).callableModels, []);
assert.equal(MODEL_CATALOG['gemini-3.8-flash'].quality, null);
assert.equal(assessGeminiEligibility('gemini-3.8-flash', { listing, at }).eligible, false);
assert.equal(assessGeminiEligibility('gemini-3.8-flash', { explicit: true, listing, at }).eligible, true);
for (const [id, reason] of [['gemini-3.1-flash-lite-preview', 'documented-shutdown'], ['gemini-3.1-flash-image', 'specialized-route-required']]) {
  const p = plan(listing, { HUSH_GEMINI_MODEL: id });
  assert.equal(p.explicitModels[0], id); // Preserve the request and explain its hold.
  assert.ok(!p.callableModels.includes(id));
  assert.ok(p.excludedModels.find(row => row.model === id).reasons.includes(reason));
}
for (const id of ['gemini-flash-latest', 'operator-future-model']) assert.equal(plan(listing, { HUSH_GEMINI_MODEL: id }).callableModels[0], id);
assert.ok(!plan(listing, { GEMINI_DISABLED_MODELS: 'gemini-3.5-flash' }).callableModels.includes('gemini-3.5-flash'));
assert.equal(resolveGeminiModelPlan({ env: {}, at, providerListing: listing, maxModels: 1 }).callableModels.length, 1);

recordGeminiModelOutcome('gemini-3.5-flash', { ok: false, status: 429 }, at);
assert.deepEqual(plan(listing).callableModels, ['gemini-2.5-flash']);
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
console.log('gemini-lifecycle-admission.test.mjs passed');
