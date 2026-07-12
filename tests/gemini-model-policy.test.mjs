import assert from 'node:assert/strict';
import {
  GEMINI_MODEL_POLICY_VERSION,
  clearGeminiModelState,
  listGeminiGenerateContentModels,
  recordGeminiModelOutcome,
  resolveGeminiModelPlan
} from '../api/gemini-model-policy.js';

clearGeminiModelState();
const defaultPlan = resolveGeminiModelPlan({ task: 'hush-transform', env: {}, at: 1000 });
assert.equal(defaultPlan.version, GEMINI_MODEL_POLICY_VERSION);
assert.deepEqual(defaultPlan.models.slice(0, 5), [
  'gemini-3.5-flash',
  'gemini-3-flash-preview',
  'gemini-2.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite'
]);
assert.equal(defaultPlan.stickySuccessPromotion, false);
assert.equal(defaultPlan.latestAliasDefaulted, false);
assert.ok(!defaultPlan.models.some((model) => /-latest$/.test(model)));
assert.ok(!defaultPlan.models.includes('gemini-2.5-pro'));
assert.ok(!defaultPlan.models.includes('gemini-3.1-pro-preview'));

const staleGlobalPlan = resolveGeminiModelPlan({
  task: 'hush-transform',
  env: { GEMINI_MODEL: 'gemini-2.5-flash-lite' },
  at: 1000
});
assert.equal(staleGlobalPlan.models[0], 'gemini-3.5-flash');
assert.equal(staleGlobalPlan.legacyGlobalModels[0], 'gemini-2.5-flash-lite');
assert.ok(staleGlobalPlan.warnings.includes('legacy-global-models-demoted-under-quality-first'));

const operatorOrderPlan = resolveGeminiModelPlan({
  task: 'hush-transform',
  env: { GEMINI_MODEL: 'gemini-2.5-flash-lite', GEMINI_ROUTING_MODE: 'operator-order' },
  at: 1000
});
assert.equal(operatorOrderPlan.models[0], 'gemini-2.5-flash-lite');
assert.equal(operatorOrderPlan.mode, 'operator-order');

const overridePlan = resolveGeminiModelPlan({
  task: 'hush-transform',
  env: {
    HUSH_GEMINI_MODEL: 'gemini-2.5-pro',
    HUSH_GEMINI_FALLBACKS: 'gemini-3.5-flash,gemini-2.5-flash',
    GEMINI_DISABLED_MODELS: 'gemini-2.5-flash'
  },
  at: 1000
});
assert.equal(overridePlan.models[0], 'gemini-2.5-pro');
assert.equal(overridePlan.models[1], 'gemini-3.5-flash');
assert.ok(!overridePlan.models.includes('gemini-2.5-flash'));
assert.deepEqual(overridePlan.explicitModels.slice(0, 3), ['gemini-2.5-pro', 'gemini-3.5-flash', 'gemini-2.5-flash']);

clearGeminiModelState();
recordGeminiModelOutcome('gemini-3.5-flash', { ok: false, status: 429, retryAfterSeconds: 60 }, 1000);
const cooldownPlan = resolveGeminiModelPlan({ task: 'hush-transform', env: {}, at: 2000 });
assert.equal(cooldownPlan.models[0], 'gemini-3-flash-preview');
assert.equal(cooldownPlan.callableModels.includes('gemini-3.5-flash'), false);
assert.equal(cooldownPlan.models.at(-1), 'gemini-3.5-flash');
assert.ok(cooldownPlan.warnings.includes('cooling-models-demoted'));

clearGeminiModelState();
recordGeminiModelOutcome('gemini-3.1-flash-lite', { ok: true, status: 200 }, 1000);
const noPromotionPlan = resolveGeminiModelPlan({ task: 'hush-transform', env: {}, at: 2000 });
assert.equal(noPromotionPlan.models[0], 'gemini-3.5-flash');
assert.equal(noPromotionPlan.models.indexOf('gemini-3.1-flash-lite'), 3);

const listing = await listGeminiGenerateContentModels('test-key', {
  force: true,
  at: 1000,
  fetchImpl: async () => ({
    ok: true,
    status: 200,
    async json() {
      return {
        models: [
          { name: 'models/gemini-3.5-flash', supportedGenerationMethods: ['generateContent'] },
          { name: 'models/gemini-embedding-2', supportedGenerationMethods: ['embedContent'] },
          { name: 'models/gemini-3.1-flash-lite', supportedGenerationMethods: ['generateContent', 'countTokens'] }
        ]
      };
    }
  })
});
assert.deepEqual(listing.models, ['gemini-3.5-flash', 'gemini-3.1-flash-lite']);
assert.equal(listing.ok, true);

clearGeminiModelState();
console.log('gemini-model-policy.test.mjs passed');
