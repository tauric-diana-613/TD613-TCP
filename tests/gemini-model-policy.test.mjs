import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  GEMINI_MODEL_POLICY_VERSION,
  clearGeminiModelState,
  listGeminiGenerateContentModels,
  recordGeminiModelOutcome,
  resolveGeminiModelPlan,
  resolveGeminiProviderPlan
} from '../server/gemini-model-policy.js';
import {
  GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
  KHONAPOLIT_INTERACTIVE_MAX_OUTPUT_TOKENS,
  buildGeminiGenerationConfig,
  currentGeminiGenerationProfile,
  withGeminiGenerationProfile
} from '../server/gemini-generation-envelope.js';

clearGeminiModelState();
const defaultPlan = resolveGeminiModelPlan({ task: 'hush-transform', env: {}, at: 1000 });
assert.equal(defaultPlan.version, GEMINI_MODEL_POLICY_VERSION);
assert.deepEqual(defaultPlan.models.slice(0, 5), [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3-flash-preview'
]);
assert.equal(defaultPlan.stickySuccessPromotion, false);
assert.equal(defaultPlan.latestAliasDefaulted, false);
assert.ok(!defaultPlan.models.some((model) => /-latest$/.test(model)));
assert.ok(!defaultPlan.models.some((model) => /flash-lite/.test(model)), 'interactive defaults must not silently descend into Flash-Lite');
assert.ok(!defaultPlan.models.includes('gemini-3.1-pro-preview'));

const staleGlobalPlan = resolveGeminiModelPlan({
  task: 'hush-transform',
  env: { GEMINI_MODEL: 'gemini-3.1-flash-lite' },
  at: 1000
});
assert.equal(staleGlobalPlan.models[0], 'gemini-3.8-flash');
assert.equal(staleGlobalPlan.legacyGlobalModels[0], 'gemini-3.1-flash-lite');
assert.ok(staleGlobalPlan.warnings.includes('legacy-global-models-demoted-under-quality-first'));

const operatorOrderPlan = resolveGeminiModelPlan({
  task: 'hush-transform',
  env: { GEMINI_MODEL: 'gemini-3.1-flash-lite', GEMINI_ROUTING_MODE: 'operator-order' },
  at: 1000
});
assert.equal(operatorOrderPlan.models[0], 'gemini-3.1-flash-lite');
assert.equal(operatorOrderPlan.mode, 'operator-order');

const preThreePlan = resolveGeminiModelPlan({
  task: 'hush-transform',
  env: { GEMINI_MODEL: 'gemini-2.4-flash' },
  at: 1000
});
assert.ok(preThreePlan.warnings.includes('pre-gemini-3-config-ignored'));
assert.equal(preThreePlan.models.includes('gemini-2.4-flash'), false);

const overridePlan = resolveGeminiModelPlan({
  task: 'hush-transform',
  env: {
    HUSH_GEMINI_MODEL: 'gemini-3.1-pro-preview',
    HUSH_GEMINI_FALLBACKS: 'gemini-3.5-flash,gemini-3-flash-preview',
    GEMINI_DISABLED_MODELS: 'gemini-3-flash-preview'
  },
  at: 1000
});
assert.equal(overridePlan.models[0], 'gemini-3.8-flash');
assert.equal(overridePlan.routeSpecificModels[0], 'gemini-3.1-pro-preview');
assert.ok(overridePlan.models.includes('gemini-3.1-pro-preview'));
assert.ok(!overridePlan.models.includes('gemini-3-flash-preview'));
assert.deepEqual(overridePlan.explicitModels.slice(0, 3), ['gemini-3.1-pro-preview', 'gemini-3.5-flash', 'gemini-3-flash-preview']);
assert.ok(overridePlan.warnings.includes('route-specific-models-demoted-under-quality-first'));

clearGeminiModelState();
recordGeminiModelOutcome('gemini-3.8-flash', { ok: false, status: 429, retryAfterSeconds: 60 }, 1000);
const cooldownPlan = resolveGeminiModelPlan({ task: 'hush-transform', env: {}, at: 2000 });
assert.equal(cooldownPlan.models[0], 'gemini-3.7-flash');
assert.equal(cooldownPlan.callableModels.includes('gemini-3.8-flash'), false);
assert.equal(cooldownPlan.models.at(-1), 'gemini-3.8-flash');
assert.ok(cooldownPlan.warnings.includes('cooling-models-demoted'));

const khonapolitCooldownListing = Object.freeze({
  ok: true,
  status: 200,
  models: Object.freeze([
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3-flash-preview'
  ]),
  cached: false,
  complete: true,
  observedAt: 2000,
  expiresAt: 602000,
  pageCount: 1,
  error: null
});
const khonapolitCooldownPlan = resolveGeminiModelPlan({
  task: 'khonapolit-dialogue',
  env: {},
  at: 2000,
  providerListing: khonapolitCooldownListing
});
assert.equal(khonapolitCooldownPlan.models.at(-1), 'gemini-3.8-flash', 'cooldown still demotes the seat in plan ordering');
assert.ok(khonapolitCooldownPlan.callableModels.includes('gemini-3.8-flash'), 'Marrowline keeps provider-listed cooling seats callable on a fresh human turn');
assert.equal(khonapolitCooldownPlan.callableModels.length, 5, 'one prior 429 cannot collapse the five-seat Marrowline frontier');
assert.ok(khonapolitCooldownPlan.warnings.includes('khonapolit-cooling-models-retained-callable'));

clearGeminiModelState();
recordGeminiModelOutcome('gemini-3.6-flash', { ok: true, status: 200 }, 1000);
const noPromotionPlan = resolveGeminiModelPlan({ task: 'hush-transform', env: {}, at: 2000 });
assert.equal(noPromotionPlan.models[0], 'gemini-3.8-flash');
assert.equal(noPromotionPlan.models.indexOf('gemini-3.6-flash'), 2);

const ordinaryGeneration = buildGeminiGenerationConfig({
  model: 'gemini-3.8-flash',
  maxOutputTokens: 65536,
  reasoning: { level: 'high' }
});
assert.equal(ordinaryGeneration.maxOutputTokens, 65536);
assert.deepEqual(ordinaryGeneration.thinkingConfig, { thinkingLevel: 'high' });
assert.equal(currentGeminiGenerationProfile(), null);

const interactive38 = await withGeminiGenerationProfile(
  GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
  async () => {
    await Promise.resolve();
    assert.equal(currentGeminiGenerationProfile(), GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE);
    return buildGeminiGenerationConfig({
      model: 'gemini-3.8-flash',
      maxOutputTokens: 65536,
      reasoning: { level: 'high' }
    });
  }
);
assert.equal(interactive38.maxOutputTokens, KHONAPOLIT_INTERACTIVE_MAX_OUTPUT_TOKENS);
assert.deepEqual(interactive38.thinkingConfig, { thinkingLevel: 'medium' });
assert.equal(currentGeminiGenerationProfile(), null, 'request-scoped profile must not leak after the callback');

const interactive35 = await withGeminiGenerationProfile(
  GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
  () => buildGeminiGenerationConfig({
    model: 'gemini-3.5-flash',
    maxOutputTokens: 65536,
    reasoning: { level: 'high' }
  })
);
assert.equal(interactive35.maxOutputTokens, KHONAPOLIT_INTERACTIVE_MAX_OUTPUT_TOKENS);
assert.deepEqual(interactive35.thinkingConfig, { thinkingLevel: 'low' });

const interactive36 = await withGeminiGenerationProfile(
  GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
  () => buildGeminiGenerationConfig({
    model: 'gemini-3.6-flash',
    maxOutputTokens: 65536,
    reasoning: { level: 'high' }
  })
);
assert.deepEqual(interactive36.thinkingConfig, { thinkingLevel: 'low' });

const khonapolitApiSource = fs.readFileSync('api/khonapolit.js', 'utf8');
assert.match(khonapolitApiSource, /GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE/);
assert.match(khonapolitApiSource, /withGeminiGenerationProfile/);
assert.match(khonapolitApiSource, /\(\) => khonapolitHandler\(req, res\)/);

const listing = await listGeminiGenerateContentModels('test-key', {
  force: true,
  at: 1000,
  fetchImpl: async () => ({
    ok: true,
    status: 200,
    async json() {
      return {
        models: [
          { name: 'models/gemini-3.8-flash', supportedGenerationMethods: ['generateContent'] },
          { name: 'models/gemini-3.5-flash', supportedGenerationMethods: ['generateContent'] },
          { name: 'models/gemini-embedding-2', supportedGenerationMethods: ['embedContent'] },
          { name: 'models/gemini-3.1-flash-lite', supportedGenerationMethods: ['generateContent', 'countTokens'] }
        ]
      };
    }
  })
});
assert.deepEqual(listing.models, ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite']);
assert.equal(listing.ok, true);

clearGeminiModelState();
{
  const now = Date.now();
  recordGeminiModelOutcome('gemini-3.8-flash', { ok: false, status: 503 }, now);
  let listingCalls = 0;
  const narrow = Object.freeze({
    ok: true, status: 200, models: Object.freeze(['gemini-3.8-flash']), cached: true,
    complete: true, observedAt: now - 1000, expiresAt: now + 599000, pageCount: 1, error: null
  });
  const refreshed = Object.freeze({
    ok: true, status: 200,
    models: Object.freeze(['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3-flash-preview']),
    cached: false, complete: true, observedAt: now, expiresAt: now + 600000, pageCount: 1, error: null
  });
  const plan = await resolveGeminiProviderPlan({
    task: 'general-text',
    env: { GEMINI_API_KEY: 'synthetic-key' },
    maxModels: 8,
    listModels: async (_key, options = {}) => {
      listingCalls += 1;
      if (listingCalls === 1) {
        assert.equal(options.force, undefined);
        return narrow;
      }
      assert.equal(options.force, true, 'empty callable plan must force one fresh provider listing');
      return refreshed;
    }
  });
  assert.equal(listingCalls, 2);
  assert.equal(plan.callableModels.includes('gemini-3.8-flash'), false, 'local cooldown remains honored');
  assert.deepEqual(plan.callableModels.slice(0, 4), ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3-flash-preview'],
    'fresh credential observation may recover alternate current models without bypassing lifecycle admission');
}
clearGeminiModelState();
{
  let listingCalls = 0;
  const failedListing = Object.freeze({
    ok: false, status: 408, models: Object.freeze([]), cached: false,
    complete: false, observedAt: null, expiresAt: null, error: 'model-list-timeout'
  });
  const held = await resolveGeminiProviderPlan({
    task: 'general-text',
    env: { GEMINI_API_KEY: 'synthetic-key' },
    maxModels: 8,
    listModels: async (_key, options = {}) => {
      listingCalls += 1;
      if (listingCalls === 2) assert.equal(options.force, true);
      return failedListing;
    }
  });
  assert.equal(listingCalls, 2, 'an empty first plan may earn exactly one forced observation retry');
  assert.deepEqual(held.callableModels, [], 'failed or incomplete fresh observation must preserve NO_ELIGIBLE_MODEL rather than bootstrap callability');
  assert.ok(held.excludedModels.every(row => row.reasons.includes('fresh-complete-provider-observation-required')));
}
clearGeminiModelState();
await import('./gemini-provider-stack-clinical.test.mjs');
await import('./gemini-quality-pilot-clinical.test.mjs');
console.log('gemini-model-policy.test.mjs passed');
