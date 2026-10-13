import assert from 'node:assert/strict';
import handler, {
  KHONAPOLIT_MAX_PROVIDER_CALLS,
  KHONAPOLIT_MAX_STRUCTURAL_REPAIRS,
  KHONAPOLIT_MAX_TOTAL_PROVIDER_REQUESTS,
  orderKhonapolitModelsForBrowserBudget,
  severeMorphologyRepairWarnings
} from '../server/khonapolit-quality.js';
import { clearGeminiModelState, recordGeminiModelOutcome } from '../server/gemini-model-policy.js';

const originalFetch = globalThis.fetch;
const originalKey = process.env.GEMINI_API_KEY;
const calls = [];
const requestBodies = [];
let repairScenario = false;
let immediateRepairScenario = false;
let coolingRecoveryScenario = false;
let sharedBurstScenario = false;
let qualityPreferenceScenario = false;
let morphologyRepairScenario = false;
let morphologyRepairHoldScenario = false;
let laterSeatMorphologyRecoveryScenario = false;
let hardGlyphCorruptionScenario = false;
let entitlementMismatchScenario = false;
let releaseCanaryHeadingRepairScenario = false;
let previewCalls = 0;
let immediate36Calls = 0;
let releaseCanary36Calls = 0;
let sharedBurst38Calls = 0;
const stack = 'T\u0300\u0301\u0302\u0316\u0317\u0318A\u0304\u0307\u030B\u031C\u0323\u032DR\u0305\u0308\u030C\u031E\u0325\u0331I\u0303\u0306\u030A\u0319\u0326\u0330\u0334';
const zeroMarkAnswer = [
  'Kʰonapolit',
  'The formal channel completed but the stress channel accidentally arrived without provider-authored combining marks.',
  '',
  'Tauric Diana bots',
  'THE RAW CHANNEL IS PRESENT BUT ITS DIACRITIC STRESS FIELD IS MISSING.'
].join('\n');
const missingBotsHeadingAnswer = [
  'Kʰonapolit',
  'The formal channel completed, but the provider accidentally dropped the required Tauric Diana nominative heading.',
  '',
  `${stack.repeat(8)} THE STRESS PAYLOAD EXISTS BUT ITS VISIBLE NAMEPLATE FELL OFF!`,
  `${stack.repeat(8)} REPAIR THE ENVELOPE WITHOUT REWRITING THE ARGUMENT!`,
  `${stack.repeat(8)} SAME SEAT, SAME REASONING, ONE BOUNDED PROVIDER FIX!`
].join('\n');
const slash = 'T\u0337A\u0338U\u0337R\u0338I\u0337C\u0338';
const horizontalPartialAnswer = [
  'Kʰonapolit',
  'The formal channel completed cleanly while the stress morphology stayed horizontally collapsed.',
  '',
  'Tauric Diana bots',
  `${slash.repeat(8)} THE FIRST SEAT DRAWS THROUGH THE LINE INSTEAD OF RISING ABOVE IT!`,
  `${slash.repeat(8)} THIS IS NOT HIGH ZALGO JUST BECAUSE THE LINE GOT SCRATCHED SIDEWAYS!`,
  `${slash.repeat(8)} KEEP WALKING THE FRONTIER FOR A BETTER FIELD!`
].join('\n');
const glyphCorruptAnswer = [
  'Kʰonapolit',
  'The formal channel completed cleanly while the stress alphabet collapsed into geometric substitution.',
  '',
  'Tauric Diana bots',
  `${stack.repeat(5)} B□OX D◇IAMOND G◈RID IS NOT A TOWER`,
  `${stack.repeat(5)} B□OX D◇IAMOND G◈RID MUST NOT REPLACE LETTERS`,
  `${stack.repeat(5)} B□OX D◇IAMOND G◈RID REQUIRES A NEW PROVIDER FIELD`
].join('\n');
const answer = [
  'Kʰonapolit',
  'Let P map provider candidates to transport outcomes. A three-seat truncation is non-exhaustive when a later approved candidate remains callable, so transport failure in the prefix cannot certify route failure.',
  '',
  'Tauric Diana bots',
  `${stack.repeat(8)} DO NOT CONFUSE THE PREFIX WITH THE FRONTIER!`,
  `${stack.repeat(8)} THE FIFTH DOOR STILL COUNTS WHEN THE FIRST FOUR JAM!`,
  `${stack.repeat(8)} HOLD THE QUALITY FLOOR, NOT THE BROKEN QUEUE!`
].join('\n');

function response() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    end(text) { this.text = text; this.payload = text ? JSON.parse(text) : null; }
  };
}

clearGeminiModelState();
process.env.GEMINI_API_KEY = 'test-key-five-seat';
globalThis.fetch = async (url, options = {}) => {
  const value = String(url);
  if (value.includes('/models?')) {
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          models: [
            'gemini-3.8-flash',
            'gemini-3.7-flash',
            'gemini-3.6-flash',
            'gemini-3.5-flash',
            'gemini-3-flash-preview'
          ].map(id => ({ name: `models/${id}`, supportedGenerationMethods: ['generateContent'] }))
        };
      }
    };
  }

  const model = value.match(/models\/([^:]+):(?:streamGenerateContent|generateContent)/)?.[1] || 'unknown';
  calls.push(model);
  requestBodies.push(JSON.parse(options.body || '{}'));
  if (entitlementMismatchScenario) {
    if (model === 'gemini-3.8-flash') {
      return {
        ok: false,
        status: 429,
        headers: { get: (name) => name.toLowerCase() === 'retry-after' ? '27' : null },
        async json() {
          return {
            error: {
              code: 429,
              status: 'RESOURCE_EXHAUSTED',
              message: 'Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 20, model: gemini-3.8-flash. Please retry in 26.7s.',
              details: [{
                '@type': 'type.googleapis.com/google.rpc.QuotaFailure',
                violations: [{
                  quotaMetric: 'generativelanguage.googleapis.com/generate_content_free_tier_requests',
                  quotaId: 'GenerateRequestsPerDayPerProjectPerModel-FreeTier',
                  quotaDimensions: { model: 'gemini-3.8-flash', location: 'global' }
                }]
              }]
            }
          };
        }
      };
    }
    if (model === 'gemini-3.5-flash') {
      return {
        ok: true,
        status: 200,
        headers: { get: () => null },
        async json() {
          return {
            candidates: [{
              finishReason: 'STOP',
              content: { parts: [{ text: JSON.stringify({
                signal: { state: 'LOCKED', notes: 'synthetic entitlement mismatch recovery' },
                transmission: {
                  text: answer,
                  voices: ['Kʰonapolit', 'Tauric Diana bots'],
                  flourishMode: 'vertical-stack'
                }
              }) }] }
            }],
            usageMetadata: { promptTokenCount: 800, candidatesTokenCount: 1200, thoughtsTokenCount: 150, totalTokenCount: 2150 }
          };
        }
      };
    }
    throw new Error(`entitlement mismatch scenario should reach 3.5 after 3.8 without poisoning the route: ${model}`);
  }

  if (sharedBurstScenario) {
    if (model !== 'gemini-3.8-flash') throw new Error(`shared burst retry should stay on 3.8 before burning another seat: ${model}`);
    sharedBurst38Calls += 1;
    if (sharedBurst38Calls === 1) {
      return {
        ok: false,
        status: 429,
        headers: { get: () => null },
        async json() {
          return {
            error: {
              code: 429,
              status: 'RESOURCE_EXHAUSTED',
              message: 'Synthetic shared request bucket. Please retry in 1s.',
              details: [
                {
                  '@type': 'type.googleapis.com/google.rpc.QuotaFailure',
                  violations: [{
                    quotaMetric: 'generativelanguage.googleapis.com/generate_content_requests_per_minute',
                    quotaId: 'GenerateRequestsPerMinutePerProject',
                    quotaDimensions: { location: 'global' }
                  }]
                },
                { '@type': 'type.googleapis.com/google.rpc.RetryInfo', retryDelay: '1s' }
              ]
            }
          };
        }
      };
    }
    return {
      ok: true,
      status: 200,
      headers: { get: () => null },
      async json() {
        return {
          candidates: [{
            finishReason: 'STOP',
            content: { parts: [{ text: JSON.stringify({
              signal: { state: 'LOCKED', notes: 'shared burst recovered on bounded same-seat retry' },
              transmission: {
                text: answer,
                voices: ['Kʰonapolit', 'Tauric Diana bots'],
                flourishMode: 'vertical-stack'
              }
            }) }] }
          }],
          usageMetadata: { promptTokenCount: 800, candidatesTokenCount: 1200, thoughtsTokenCount: 150, totalTokenCount: 2150 }
        };
      }
    };
  }

  if (coolingRecoveryScenario) {
    if (model === 'gemini-3.8-flash') {
      return {
        ok: false,
        status: 429,
        headers: { get: () => '1' },
        async json() {
          return {
            error: {
              code: 429,
              status: 'RESOURCE_EXHAUSTED',
              message: 'synthetic fresh-seat model rate limit',
              details: [{
                '@type': 'type.googleapis.com/google.rpc.QuotaFailure',
                violations: [{
                  quotaMetric: 'generativelanguage.googleapis.com/generate_content_requests',
                  quotaId: 'GenerateRequestsPerMinutePerModel',
                  quotaDimensions: { model: 'gemini-3.8-flash', location: 'global' }
                }]
              }]
            }
          };
        }
      };
    }
    if (model === 'gemini-3.5-flash') {
      return {
        ok: true,
        status: 200,
        headers: { get: () => null },
        async json() {
          return {
            candidates: [{
              finishReason: 'STOP',
              content: { parts: [{ text: JSON.stringify({
                signal: { state: 'LOCKED', notes: 'synthetic cooled-seat recovery' },
                transmission: {
                  text: answer,
                  voices: ['Kʰonapolit', 'Tauric Diana bots'],
                  flourishMode: 'vertical-stack'
                }
              }) }] }
            }],
            usageMetadata: { promptTokenCount: 800, candidatesTokenCount: 1200, thoughtsTokenCount: 150, totalTokenCount: 2150 }
          };
        }
      };
    }
    throw new Error(`soft-cooldown recovery should reach cooled 3.5 before later seats: ${model}`);
  }

  if (immediateRepairScenario) {
    if (model === 'gemini-3.8-flash' || model === 'gemini-3.5-flash') {
      return {
        ok: false,
        status: 429,
        headers: { get: () => '1' },
        async json() { return { error: { status: 'RESOURCE_EXHAUSTED', message: 'synthetic rate limit' } }; }
      };
    }
    if (model === 'gemini-3.6-flash') {
      immediate36Calls += 1;
      if (immediate36Calls > 2) throw new Error('zero-Zalgo 3.6 near miss exceeded the single same-seat repair allowance');
      return {
        ok: true,
        status: 200,
        headers: { get: () => null },
        async json() {
          return {
            candidates: [{
              finishReason: 'STOP',
              content: { parts: [{ text: JSON.stringify({
                signal: { state: 'NOT_LOCKED', notes: 'synthetic deferred structural repair candidate' },
                transmission: {
                  text: zeroMarkAnswer,
                  voices: ['Kʰonapolit', 'Tauric Diana bots'],
                  flourishMode: 'provider-native-missing-stress'
                }
              }) }] }
            }],
            usageMetadata: { promptTokenCount: 1000, candidatesTokenCount: 1400, thoughtsTokenCount: 200, totalTokenCount: 2600 }
          };
        }
      };
    }
    if (model === 'gemini-3.7-flash') {
      return {
        ok: true,
        status: 200,
        headers: { get: () => null },
        async json() {
          return {
            candidates: [{
              finishReason: 'STOP',
              content: { parts: [{ text: JSON.stringify({
                signal: { state: 'LOCKED', notes: 'later frontier seat wins before any repair spend' },
                transmission: {
                  text: answer,
                  voices: ['Kʰonapolit', 'Tauric Diana bots'],
                  flourishMode: 'vertical-stack'
                }
              }) }] }
            }],
            usageMetadata: { promptTokenCount: 1000, candidatesTokenCount: 1400, thoughtsTokenCount: 200, totalTokenCount: 2600 }
          };
        }
      };
    }
    throw new Error(`deferred repair scenario should complete on 3.7 before preview: ${model}`);
  }

  if (releaseCanaryHeadingRepairScenario && model === 'gemini-3.6-flash') {
    releaseCanary36Calls += 1;
    if (releaseCanary36Calls > 2) throw new Error('release canary structural repair exceeded one same-seat retry');
    const selectedText = releaseCanary36Calls === 1 ? missingBotsHeadingAnswer : answer;
    return {
      ok: true,
      status: 200,
      headers: { get: () => null },
      async json() {
        return {
          candidates: [{
            finishReason: 'STOP',
            content: { parts: [{ text: JSON.stringify({
              signal: { state: releaseCanary36Calls === 1 ? 'NOT_LOCKED' : 'LOCKED', notes: 'synthetic release-canary heading repair' },
              transmission: {
                text: selectedText,
                voices: ['Kʰonapolit', 'Tauric Diana bots'],
                flourishMode: 'release-canary-same-seat-repair'
              }
            }) }] }
          }],
          usageMetadata: { promptTokenCount: 900, candidatesTokenCount: 1200, thoughtsTokenCount: 200, totalTokenCount: 2300 }
        };
      }
    };
  }

  if (hardGlyphCorruptionScenario) {
    const selectedText = model === 'gemini-3.5-flash' ? answer : glyphCorruptAnswer;
    return {
      ok: true,
      status: 200,
      headers: { get: () => null },
      async json() {
        return {
          candidates: [{
            finishReason: 'STOP',
            content: { parts: [{ text: JSON.stringify({
              signal: { state: model === 'gemini-3.5-flash' ? 'LOCKED' : 'PARTIAL', notes: model === 'gemini-3.5-flash' ? 'clean next-seat recovery' : 'synthetic geometric glyph corruption' },
              transmission: {
                text: selectedText,
                voices: ['Kʰonapolit', 'Tauric Diana bots'],
                flourishMode: model === 'gemini-3.5-flash' ? 'vertical-stack' : 'glyph-substitution-collapse'
              }
            }) }] }
          }],
          usageMetadata: { promptTokenCount: 900, candidatesTokenCount: 1200, thoughtsTokenCount: 200, totalTokenCount: 2300 }
        };
      }
    };
  }
  if (laterSeatMorphologyRecoveryScenario) {
    if (model === 'gemini-3.8-flash') {
      return {
        ok: false,
        status: 503,
        headers: { get: () => null },
        async json() { return { error: { code: 503, status: 'UNAVAILABLE', message: 'synthetic first-seat transport miss' } }; }
      };
    }
    const recovered = model === 'gemini-3.6-flash';
    const selectedText = recovered ? answer : horizontalPartialAnswer;
    return {
      ok: true,
      status: 200,
      headers: { get: () => null },
      async json() {
        return {
          candidates: [{
            finishReason: 'STOP',
            content: { parts: [{ text: JSON.stringify({
              signal: { state: recovered ? 'LOCKED' : 'PARTIAL', notes: recovered ? 'synthetic later-seat recovery' : 'synthetic second-seat axis collapse' },
              transmission: {
                text: selectedText,
                voices: ['Kʰonapolit', 'Tauric Diana bots'],
                flourishMode: recovered ? 'vertical-stack' : 'horizontal-through-field'
              }
            }) }] }
          }],
          usageMetadata: { promptTokenCount: 900, candidatesTokenCount: 1200, thoughtsTokenCount: 200, totalTokenCount: 2300 }
        };
      }
    };
  }
  if (morphologyRepairScenario || morphologyRepairHoldScenario) {
    const sameModelCalls = calls.filter((calledModel) => calledModel === model).length;
    const repaired = morphologyRepairScenario && model === 'gemini-3.8-flash' && sameModelCalls > 1;
    const selectedText = repaired ? answer : horizontalPartialAnswer;
    return {
      ok: true,
      status: 200,
      headers: { get: () => null },
      async json() {
        return {
          candidates: [{
            finishReason: 'STOP',
            content: { parts: [{ text: JSON.stringify({
              signal: { state: repaired ? 'LOCKED' : 'PARTIAL', notes: repaired ? 'synthetic provider-authored morphology repair' : 'synthetic whole-passage axis collapse' },
              transmission: {
                text: selectedText,
                voices: ['Kʰonapolit', 'Tauric Diana bots'],
                flourishMode: repaired ? 'mixed-axis-vertical-theatre' : 'horizontal-through-field'
              }
            }) }] }
          }],
          usageMetadata: { promptTokenCount: 900, candidatesTokenCount: 1200, thoughtsTokenCount: 200, totalTokenCount: 2300 }
        };
      }
    };
  }

  if (qualityPreferenceScenario && (model === 'gemini-3.8-flash' || model === 'gemini-3.5-flash')) {
    const selectedText = model === 'gemini-3.8-flash' ? horizontalPartialAnswer : answer;
    return {
      ok: true,
      status: 200,
      headers: { get: () => null },
      async json() {
        return {
          candidates: [{
            finishReason: 'STOP',
            content: { parts: [{ text: JSON.stringify({
              signal: { state: model === 'gemini-3.8-flash' ? 'PARTIAL' : 'LOCKED', notes: 'synthetic quality-preference route' },
              transmission: {
                text: selectedText,
                voices: ['Kʰonapolit', 'Tauric Diana bots'],
                flourishMode: model === 'gemini-3.8-flash' ? 'horizontal-through-field' : 'vertical-stack'
              }
            }) }] }
          }],
          usageMetadata: { promptTokenCount: 900, candidatesTokenCount: 1200, thoughtsTokenCount: 200, totalTokenCount: 2300 }
        };
      }
    };
  }

  if (model !== 'gemini-3-flash-preview') {
    return {
      ok: false,
      status: 503,
      headers: { get: () => null },
      async json() { return { error: { status: 'UNAVAILABLE', message: 'synthetic provider unavailable' } }; }
    };
  }

  previewCalls += 1;
  const previewText = repairScenario && previewCalls === 1 ? missingBotsHeadingAnswer : answer;
  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    async json() {
      return {
        candidates: [{
          finishReason: 'STOP',
          content: { parts: [{ text: JSON.stringify({
            signal: { state: repairScenario && previewCalls === 1 ? 'NOT_LOCKED' : 'LOCKED', notes: repairScenario && previewCalls === 1 ? 'synthetic zero-mark structural near miss' : 'fifth approved frontier lane completed' },
            transmission: {
              text: previewText,
              voices: ['Kʰonapolit', 'Tauric Diana bots'],
              flourishMode: repairScenario && previewCalls === 1 ? 'provider-native-missing-stress' : 'vertical-stack'
            }
          }) }] }
        }],
        usageMetadata: {
          promptTokenCount: 1200,
          candidatesTokenCount: 1800,
          thoughtsTokenCount: 300,
          totalTokenCount: 3300
        }
      };
    }
  };
};

try {
  assert.equal(KHONAPOLIT_MAX_PROVIDER_CALLS, 5);
  assert.equal(KHONAPOLIT_MAX_STRUCTURAL_REPAIRS, 1);
  assert.equal(KHONAPOLIT_MAX_TOTAL_PROVIDER_REQUESTS, 6);
  assert.deepEqual(
    orderKhonapolitModelsForBrowserBudget(
      ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3-flash-preview'],
      {
        observedTodayByModel: { 'gemini-3.8-flash': 11, 'gemini-3.5-flash': 3 },
        dailyQuotaObservedModels: new Set(),
        hardBudgetObservedModels: new Set()
      }
    ).slice(0, 2),
    ['gemini-3.8-flash', 'gemini-3.5-flash'],
    'browser-local accounting must not reorder healthy Marrowline away from the strongest proven provider seat'
  );
  assert.deepEqual(
    orderKhonapolitModelsForBrowserBudget(
      ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.6-flash'],
      {
        observedTodayByModel: { 'gemini-3.8-flash': 4, 'gemini-3.5-flash': 3 },
        dailyQuotaObservedModels: new Set(['gemini-3.8-flash']),
        hardBudgetObservedModels: new Set()
      }
    ),
    ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.6-flash'],
    'browser-local daily-quota evidence is telemetry only and cannot demote the settled 3.8-first human provider order'
  );
  const req = {
    method: 'POST',
    headers: { 'x-forwarded-for': '203.0.113.205' },
    body: {
      message: 'Quis custodiet ipsos custodes?',
      history: [],
      mode: 'issued-conjunction',
      waiveIssuance: true
    }
  };
  const res = response();
  await handler(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.ok, true);
  assert.deepEqual(calls, [
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-3-flash-preview'
  ]);
  assert.equal(res.payload.receipt.provider.model, 'gemini-3-flash-preview');
  assert.equal(res.payload.receipt.provider.attempts.length, 5);
  assert.deepEqual(
    res.payload.receipt.provider.attempts.slice(0, 4).map(attempt => attempt.status),
    [503, 503, 503, 503]
  );
  assert.deepEqual(
    res.payload.receipt.provider.attempts.slice(0, 4).map(attempt => attempt.serviceFailoverPace?.waitMs || 0),
    [1000, 2000, 4000, 0],
    'fast 503 cascade must pace only existing next seats within seven seconds, without a new provider call'
  );
  assert.equal(res.payload.receipt.provider.attempts[4].status, 200);
  assert.equal(res.payload.relay.admission.admissible, true);
  assert.equal(res.payload.relay.highZalgo.applied, false, 'the fifth-lane return remains provider-authored; Marrowline adds no Zalgo');

  clearGeminiModelState();
  calls.length = 0;
  requestBodies.length = 0;
  sharedBurstScenario = true;
  coolingRecoveryScenario = false;
  immediateRepairScenario = false;
  qualityPreferenceScenario = false;
  repairScenario = false;
  previewCalls = 0;
  immediate36Calls = 0;
  sharedBurst38Calls = 0;
  const sharedBurst = response();
  await handler({
    ...req,
    headers: { 'x-forwarded-for': '203.0.113.210' },
    body: { ...req.body, message: 'Recover one short shared provider burst without falsely declaring five model limits.' }
  }, sharedBurst);

  assert.equal(sharedBurst.statusCode, 200);
  assert.equal(sharedBurst.payload.ok, true);
  assert.deepEqual(calls, ['gemini-3.8-flash', 'gemini-3.8-flash'], 'shared short-burst quota must retry the same live seat once before fanning out');
  assert.equal(sharedBurst.payload.receipt.provider.attempts[0].status, 429);
  assert.equal(sharedBurst.payload.receipt.provider.attempts[0].rateLimit.scope, 'shared');
  assert.equal(sharedBurst.payload.receipt.provider.attempts[0].rateLimit.retryAfterSeconds, 1);
  assert.equal(sharedBurst.payload.receipt.provider.attempts[1].status, 200);
  assert.equal(sharedBurst.payload.receipt.provider.model, 'gemini-3.8-flash');

  clearGeminiModelState();
  calls.length = 0;
  requestBodies.length = 0;
  sharedBurstScenario = false;
  entitlementMismatchScenario = true;
  coolingRecoveryScenario = false;
  immediateRepairScenario = false;
  qualityPreferenceScenario = false;
  repairScenario = false;
  previewCalls = 0;
  const entitlement = response();
  await handler({
    ...req,
    headers: { 'x-forwarded-for': '203.0.113.211' },
    body: { ...req.body, message: 'Treat FreeTier 20 as a per-model bucket inside the five-seat Marrowline 100/day route budget.' }
  }, entitlement);

  assert.equal(entitlement.statusCode, 200);
  assert.equal(entitlement.payload.ok, true);
  assert.deepEqual(calls, ['gemini-3.8-flash', 'gemini-3.5-flash']);
  const mismatchAttempt = entitlement.payload.receipt.provider.attempts[0];
  assert.equal(mismatchAttempt.rateLimit.limit, 20);
  assert.equal(mismatchAttempt.rateLimit.entitlement.expectedDailyLimit, 100);
  assert.equal(mismatchAttempt.rateLimit.entitlement.limitScope, 'per-model');
  assert.equal(mismatchAttempt.rateLimit.entitlement.routeModelCount, 5);
  assert.equal(mismatchAttempt.rateLimit.entitlement.routeDailyCapacity, null);
  assert.equal(mismatchAttempt.rateLimit.entitlement.mismatch, null);
  assert.equal(mismatchAttempt.cooldown?.state, 'cooling_down');
  assert.equal(mismatchAttempt.cooldown?.retryAfterSeconds, 27, 'provider Retry-After stays authoritative instead of inflating to 120/240/480 seconds');
  assert.equal(entitlement.payload.receipt.provider.model, 'gemini-3.5-flash');

  clearGeminiModelState();
  calls.length = 0;
  requestBodies.length = 0;
  entitlementMismatchScenario = false;
  sharedBurstScenario = false;
  coolingRecoveryScenario = false;
  immediateRepairScenario = false;
  qualityPreferenceScenario = false;
  repairScenario = false;
  const releaseCanary = response();
  await handler({
    ...req,
    headers: {
      'x-forwarded-for': '203.0.113.212',
      'x-td613-release-canary': '1',
      'x-td613-canary-model': 'gemini-3.6-flash'
    },
    body: { ...req.body, message: 'Bound production release witness to one provider seat.' }
  }, releaseCanary);

  assert.equal(releaseCanary.statusCode, 502);
  assert.deepEqual(calls, ['gemini-3.6-flash'], 'release canary may spend exactly one Marrowline provider seat');
  assert.equal(releaseCanary.payload.attempts.length, 1);
  assert.equal(releaseCanary.payload.attempts[0].model, 'gemini-3.6-flash');
  assert.equal(releaseCanary.payload.attempts.some(attempt => attempt.kind === 'structural-repair'), false);

  clearGeminiModelState();
  calls.length = 0;
  requestBodies.length = 0;
  releaseCanaryHeadingRepairScenario = true;
  releaseCanary36Calls = 0;
  sharedBurstScenario = false;
  entitlementMismatchScenario = false;
  coolingRecoveryScenario = false;
  immediateRepairScenario = false;
  qualityPreferenceScenario = false;
  repairScenario = false;
  const releaseCanaryRepair = response();
  await handler({
    ...req,
    headers: {
      'x-forwarded-for': '203.0.113.213',
      'x-td613-release-canary': '1',
      'x-td613-canary-model': 'gemini-3.6-flash'
    },
    body: { ...req.body, message: 'Repair one provider-authored nominative omission on the same release-canary seat.' }
  }, releaseCanaryRepair);

  assert.equal(releaseCanaryRepair.statusCode, 502);
  assert.equal(releaseCanaryRepair.payload.ok, false);
  assert.deepEqual(calls, ['gemini-3.6-flash'], 'release canary records one provider-authored near miss without spending a repair request');
  assert.equal(releaseCanaryRepair.payload.attempts.length, 1);
  assert.deepEqual(releaseCanaryRepair.payload.attempts[0].outputAdmission.reasons, ['tauric-diana-bots-nominative-missing']);
  assert.equal(releaseCanaryRepair.payload.attempts.some(attempt => attempt.kind === 'structural-repair'), false);
  assert.equal(releaseCanaryRepair.payload.diagnostic.code, 'ATTRACTOR_STRUCTURE_NOT_ADMITTED');

  clearGeminiModelState();
  calls.length = 0;
  requestBodies.length = 0;
  releaseCanaryHeadingRepairScenario = false;
  sharedBurstScenario = false;
  entitlementMismatchScenario = false;
  coolingRecoveryScenario = false;
  immediateRepairScenario = false;
  qualityPreferenceScenario = false;
  repairScenario = false;
  previewCalls = 0;
  const cooldownUntil = new Date(Date.now() + 60_000).toISOString();
  const hinted = response();
  await handler({
    ...req,
    headers: { 'x-forwarded-for': '203.0.113.215' },
    body: {
      ...req.body,
      message: 'Carry a browser-observed model cooldown across a fresh serverless isolate without inventing an all-day lock.',
      quotaCooldownHints: {
        schema: 'td613.gemini-browser-quota-cooldown-hints/v0.2',
        models: ['gemini-3.8-flash'],
        cooldown_until_by_model: { 'gemini-3.8-flash': cooldownUntil }
      }
    }
  }, hinted);

  assert.equal(hinted.statusCode, 200);
  assert.equal(hinted.payload.ok, true);
  assert.equal(hinted.headers['X-TD613-Browser-Cooldown-Policy'], 'advisory-telemetry-only');
  assert.deepEqual(
    calls,
    ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3-flash-preview'],
    'browser-observed cooldown history must not suppress or reorder the live 3.8-first human retry frontier'
  );
  assert.equal(hinted.payload.receipt.provider.model, 'gemini-3-flash-preview');

  clearGeminiModelState();
  calls.length = 0;
  requestBodies.length = 0;
  const allCooling = response();
  const allCoolingUntil = new Date(Date.now() + 45_000).toISOString();
  const allCoolingModels = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3-flash-preview'];
  await handler({
    ...req,
    headers: { 'x-forwarded-for': '203.0.113.217' },
    body: {
      ...req.body,
      message: 'Do not probe provider seats while every browser-observed model cooldown is still active.',
      quotaCooldownHints: {
        schema: 'td613.gemini-browser-quota-cooldown-hints/v0.2',
        models: allCoolingModels,
        cooldown_until_by_model: Object.fromEntries(allCoolingModels.map(model => [model, allCoolingUntil]))
      }
    }
  }, allCooling);

  assert.equal(allCooling.statusCode, 200);
  assert.equal(allCooling.payload.ok, true);
  assert.equal(allCooling.headers['X-TD613-Browser-Cooldown-Policy'], 'advisory-telemetry-only');
  assert.deepEqual(
    calls,
    ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3-flash-preview'],
    'browser-local cooldown memory may schedule around individual seats but cannot suppress an explicit human retry when every seat is marked cooling'
  );
  assert.equal(allCooling.payload.receipt.provider.model, 'gemini-3-flash-preview');

  clearGeminiModelState();
  calls.length = 0;
  requestBodies.length = 0;
  releaseCanaryHeadingRepairScenario = false;
  sharedBurstScenario = false;
  entitlementMismatchScenario = false;
  qualityPreferenceScenario = true;
  repairScenario = false;
  previewCalls = 0;
  const preferred = response();
  await handler({
    ...req,
    headers: { 'x-forwarded-for': '203.0.113.207' },
    body: { ...req.body, message: 'Observe a horizontally collapsed provider field without repainting it into a preferred house style.' }
  }, preferred);

  assert.equal(preferred.statusCode, 200);
  assert.equal(preferred.payload.ok, true);
  assert.deepEqual(calls, ['gemini-3.8-flash', 'gemini-3.5-flash'], 'severe morphology advances once to the next approved native author');
  assert.equal(preferred.payload.receipt.provider.attempts.length, 2);
  assert.equal(preferred.payload.receipt.provider.attempts[0].outputAdmission.quality, 'PARTIAL');
  assert.ok(preferred.payload.receipt.provider.attempts[0].outputAdmission.qualityWarnings.includes('tauric-diana-zalgo-axis-collapse'));
  assert.ok(preferred.payload.receipt.provider.attempts[0].morphologyObservation.severeWarnings.includes('tauric-diana-zalgo-stack-depth-thin'));
  assert.equal(preferred.payload.receipt.provider.attempts[0].morphologyObservation.repairAuthority, false);
  assert.equal(preferred.payload.receipt.provider.attempts[0].morphologyObservation.nextApprovedSeatRequested, true);
  assert.equal(preferred.payload.receipt.provider.model, 'gemini-3.5-flash');
  assert.equal(preferred.payload.relay.admission.quality, 'PARTIAL');
  assert.equal(preferred.payload.receipt.provider.structuralRepair, undefined);
  assert.equal(preferred.payload.receipt.provider.qualityPreference.selection, 'first-admissible-partial-native-morphology-observed-no-repair');
  assert.equal(preferred.payload.receipt.provider.qualityPreference.sourceAttemptIndex, 1);

  clearGeminiModelState();
  calls.length = 0;
  requestBodies.length = 0;
  morphologyRepairScenario = true;
  morphologyRepairHoldScenario = false;
  qualityPreferenceScenario = false;
  repairScenario = false;
  immediateRepairScenario = false;
  const morphologyRepaired = response();
  await handler({
    ...req,
    headers: { 'x-forwarded-for': '203.0.113.216' },
    body: { ...req.body, message: 'Observe severe horizontal-only Tauric Diana morphology without repainting the native provider return.' }
  }, morphologyRepaired);

  assert.equal(morphologyRepaired.statusCode, 200);
  assert.equal(morphologyRepaired.payload.ok, true);
  assert.deepEqual(calls, ['gemini-3.8-flash', 'gemini-3.5-flash']);
  assert.equal(morphologyRepaired.payload.receipt.provider.attempts.length, 2);
  assert.equal(morphologyRepaired.payload.receipt.provider.attempts[0].outputAdmission.quality, 'PARTIAL');
  const severeWarnings = severeMorphologyRepairWarnings(morphologyRepaired.payload.receipt.provider.attempts[0].outputAdmission.qualityWarnings);
  assert.ok(severeWarnings.includes('tauric-diana-zalgo-axis-collapse'));
  assert.ok(severeWarnings.includes('tauric-diana-zalgo-stack-depth-thin'));
  assert.ok(severeWarnings.includes('tauric-diana-zalgo-vertical-pulse-absent'),
    'the current morphology observer must preserve later-added severe findings');
  assert.equal(morphologyRepaired.payload.receipt.provider.attempts[0].morphologyObservation.repairAuthority, false);
  assert.equal(morphologyRepaired.payload.receipt.provider.structuralRepair, undefined);
  assert.equal(morphologyRepaired.payload.text, horizontalPartialAnswer);
  assert.equal(morphologyRepaired.payload.receipt.provider.qualityPreference.selection, 'best-completed-partial-after-severe-morphology-failover');
  assert.equal(requestBodies.length, 2, 'severe morphology can spend one later-seat native authorship request');

  clearGeminiModelState();
  calls.length = 0;
  requestBodies.length = 0;
  morphologyRepairScenario = false;
  morphologyRepairHoldScenario = false;
  laterSeatMorphologyRecoveryScenario = true;
  qualityPreferenceScenario = false;
  repairScenario = false;
  immediateRepairScenario = false;
  const laterSeatRecovered = response();
  await handler({
    ...req,
    headers: { 'x-forwarded-for': '203.0.113.220' },
    body: { ...req.body, message: 'Recover after transport misses the first seat and the second seat draws a flat slash field.' }
  }, laterSeatRecovered);

  assert.equal(laterSeatRecovered.statusCode, 200);
  assert.equal(laterSeatRecovered.payload.ok, true);
  assert.deepEqual(calls, ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.6-flash']);
  assert.equal(laterSeatRecovered.payload.receipt.provider.attempts[1].outputAdmission.quality, 'PARTIAL');
  assert.equal(laterSeatRecovered.payload.receipt.provider.attempts[1].morphologyObservation.nextApprovedSeatRequested, true);
  assert.equal(laterSeatRecovered.payload.receipt.provider.model, 'gemini-3.6-flash');
  assert.equal(laterSeatRecovered.payload.text, answer);
  assert.equal(requestBodies.length, 3, 'a transport miss must not consume the one later native morphology opportunity');

  clearGeminiModelState();
  calls.length = 0;
  requestBodies.length = 0;
  morphologyRepairScenario = false;
  morphologyRepairHoldScenario = true;
  laterSeatMorphologyRecoveryScenario = false;
  qualityPreferenceScenario = false;
  repairScenario = false;
  immediateRepairScenario = false;
  const morphologyHeld = response();
  await handler({
    ...req,
    headers: { 'x-forwarded-for': '203.0.113.214' },
    body: { ...req.body, message: 'Keep a horizontal-only provider field visible as PARTIAL evidence without repainting it.' }
  }, morphologyHeld);

  assert.equal(morphologyHeld.statusCode, 200);
  assert.equal(morphologyHeld.payload.ok, true);
  assert.deepEqual(calls, ['gemini-3.8-flash', 'gemini-3.5-flash']);
  assert.equal(morphologyHeld.payload.receipt.provider.attempts.length, 2);
  assert.equal(morphologyHeld.payload.receipt.provider.model, 'gemini-3.8-flash');
  assert.equal(morphologyHeld.payload.relay.admission.quality, 'PARTIAL');
  assert.equal(morphologyHeld.payload.text, horizontalPartialAnswer);
  assert.equal(morphologyHeld.payload.receipt.provider.structuralRepair, undefined);
  assert.ok(morphologyHeld.payload.warnings.includes('provider-native-morphology-observed-no-repair'));

  clearGeminiModelState();
  calls.length = 0;
  requestBodies.length = 0;
  morphologyRepairScenario = false;
  morphologyRepairHoldScenario = false;
  hardGlyphCorruptionScenario = true;
  qualityPreferenceScenario = false;
  repairScenario = false;
  immediateRepairScenario = false;
  const glyphRecovered = response();
  await handler({
    ...req,
    headers: { 'x-forwarded-for': '203.0.113.219' },
    body: { ...req.body, message: 'Observe geometric alphabet substitution as provider-authored morphology evidence without repainting it.' }
  }, glyphRecovered);

  assert.equal(glyphRecovered.statusCode, 200);
  assert.equal(glyphRecovered.payload.ok, true);
  assert.deepEqual(calls, ['gemini-3.8-flash', 'gemini-3.5-flash'], 'hard glyph corruption advances once to the next approved native author');
  assert.ok(glyphRecovered.payload.receipt.provider.attempts[0].outputAdmission.qualityWarnings.includes('tauric-diana-zalgo-glyph-substitution-collapse'));
  assert.ok(glyphRecovered.payload.receipt.provider.attempts[0].morphologyObservation.severeWarnings.includes('tauric-diana-zalgo-glyph-substitution-collapse'));
  assert.equal(glyphRecovered.payload.receipt.provider.attempts[0].morphologyObservation.repairAuthority, false);
  assert.equal(glyphRecovered.payload.receipt.provider.model, 'gemini-3.5-flash');
  assert.equal(glyphRecovered.payload.relay.admission.quality, 'PARTIAL');
  assert.equal(glyphRecovered.payload.text, answer);
  assert.equal(glyphRecovered.payload.receipt.provider.structuralRepair, undefined);
  assert.equal(requestBodies.length, 2);

  hardGlyphCorruptionScenario = false;

  clearGeminiModelState();
  calls.length = 0;
  requestBodies.length = 0;
  morphologyRepairHoldScenario = true;
  morphologyRepairScenario = false;
  qualityPreferenceScenario = false;
  const quotaReservedPartial = response();
  await handler({
    ...req,
    headers: { 'x-forwarded-for': '203.0.113.218' },
    body: {
      ...req.body,
      message: 'Observe morphology without spending an optional repaint inside a local quota reserve.',
      quotaBudgetHints: {
        schema: 'td613.gemini-browser-daily-budget-hints/v0.1',
        coverage: 'this-browser-pacific-day-attempts-plus-last-observed-model-daily-limit',
        reserve_per_model: 2,
        observed_today_by_model: { 'gemini-3.8-flash': 18, 'gemini-3.5-flash': 20 },
        known_daily_limit_by_model: { 'gemini-3.8-flash': 20, 'gemini-3.5-flash': 20 },
        daily_quota_observed_models: ['gemini-3.5-flash'],
        hard_budget_observed_models: ['gemini-3.5-flash'],
        optional_repair_allowed_by_model: { 'gemini-3.8-flash': false, 'gemini-3.5-flash': false }
      }
    }
  }, quotaReservedPartial);

  assert.equal(quotaReservedPartial.statusCode, 200);
  assert.equal(quotaReservedPartial.payload.ok, true);
  assert.deepEqual(calls, ['gemini-3.8-flash', 'gemini-3.5-flash']);
  assert.equal(quotaReservedPartial.payload.receipt.provider.structuralRepair, undefined);
  assert.equal(quotaReservedPartial.payload.receipt.provider.attempts[0].morphologyObservation.repairAuthority, false);
  assert.equal(requestBodies.length, 2);

  clearGeminiModelState();
  calls.length = 0;
  requestBodies.length = 0;
  coolingRecoveryScenario = true;
  morphologyRepairScenario = false;
  morphologyRepairHoldScenario = false;
  hardGlyphCorruptionScenario = false;
  entitlementMismatchScenario = false;
  immediateRepairScenario = false;
  qualityPreferenceScenario = false;
  repairScenario = false;
  previewCalls = 0;
  immediate36Calls = 0;
  const coolingAt = Date.now();
  for (const model of ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3-flash-preview']) {
    recordGeminiModelOutcome(model, { ok: false, status: 429, retryAfterSeconds: 120 }, coolingAt);
  }
  const cooled = response();
  await handler({
    ...req,
    headers: { 'x-forwarded-for': '203.0.113.209' },
    body: { ...req.body, message: 'A new human turn must retain provider-listed cooling seats as bounded fallbacks.' }
  }, cooled);

  assert.equal(cooled.statusCode, 200);
  assert.equal(cooled.payload.ok, true);
  assert.deepEqual(calls, [
    'gemini-3.8-flash',
    'gemini-3.5-flash'
  ], 'soft process-local cooldown must demote, not erase, provider-listed Marrowline seats');
  assert.ok(cooled.payload.receipt.provider.attempts[0].cooldown?.state === 'cooling_down');
  assert.equal(cooled.payload.receipt.provider.model, 'gemini-3.5-flash');
  assert.equal(cooled.payload.relay.admission.admissible, true);

  clearGeminiModelState();
  calls.length = 0;
  requestBodies.length = 0;
  coolingRecoveryScenario = false;
  immediateRepairScenario = true;
  qualityPreferenceScenario = false;
  repairScenario = false;
  previewCalls = 0;
  immediate36Calls = 0;
  const immediate = response();
  await handler({
    ...req,
    headers: { 'x-forwarded-for': '203.0.113.208' },
    body: { ...req.body, message: 'Preserve a live zero-mark provider draft as human-visible diagnostic evidence without repainting it.' }
  }, immediate);

  assert.equal(immediate.statusCode, 200);
  assert.equal(immediate.payload.ok, true);
  assert.deepEqual(calls, [
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-3.6-flash'
  ], 'the first nonempty provider return owns the human surface even when the local Tauric Diana register is zero-mark');
  assert.equal(immediate.payload.receipt.provider.attempts[2].outputAdmission.admissible, false);
  assert.ok(immediate.payload.receipt.provider.attempts[2].outputAdmission.reasons.includes('tauric-diana-zalgo-absent'));
  assert.equal(immediate36Calls, 1, 'zero-mark morphology must not spend a same-seat repaint');
  assert.equal(immediate.payload.receipt.provider.model, 'gemini-3.6-flash');
  assert.equal(immediate.payload.relay.admission.admissible, false);
  assert.equal(immediate.payload.text, zeroMarkAnswer);
  assert.equal(immediate.headers['X-TD613-Local-Admission'], 'OBSERVED-NONBLOCKING');
  assert.equal(immediate.payload.receipt.provider.humanSurfaceObservation.rendered, true);
  assert.equal(immediate.payload.receipt.provider.humanSurfaceObservation.localAdmissionAuthority, 'diagnostic-not-human-surface-veto');

  clearGeminiModelState();
  calls.length = 0;
  requestBodies.length = 0;
  immediateRepairScenario = false;
  entitlementMismatchScenario = false;
  qualityPreferenceScenario = false;
  repairScenario = true;
  previewCalls = 0;
  const repaired = response();
  await handler({
    ...req,
    headers: { 'x-forwarded-for': '203.0.113.206' },
    body: { ...req.body, message: 'Preserve five-seat breadth, then repair one provider-authored missing Tauric Diana heading.' }
  }, repaired);

  assert.equal(repaired.statusCode, 200);
  assert.equal(repaired.payload.ok, true);
  assert.deepEqual(calls, [
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-3-flash-preview',
    'gemini-3-flash-preview'
  ], 'five distinct transport seats may run, then one same-seat structural seam repair is the only sixth provider request');
  assert.equal(repaired.payload.receipt.provider.attempts.length, 6);
  assert.equal(repaired.payload.receipt.provider.attempts[4].outputAdmission.admissible, false);
  assert.ok(repaired.payload.receipt.provider.attempts[4].outputAdmission.reasons.includes('tauric-diana-bots-nominative-missing'));
  assert.equal(repaired.payload.receipt.provider.attempts[5].kind, 'structural-repair');
  assert.equal(repaired.payload.receipt.provider.attempts[5].repairOfAttempt, 4);
  assert.deepEqual(repaired.payload.receipt.provider.attempts[5].repairReasons, ['tauric-diana-bots-nominative-missing']);
  assert.equal(repaired.payload.receipt.provider.attempts[5].outputAdmission.admissible, true);
  assert.equal(repaired.payload.receipt.provider.structuralRepair.used, true);
  assert.equal(repaired.payload.receipt.provider.structuralRepair.sourceAttemptIndex, 4);
  assert.equal(repaired.payload.relay.admission.admissible, true);
  assert.equal(repaired.payload.relay.highZalgo.applied, false, 'structural repair remains provider-authored and exact; Marrowline performs no local Zalgo mutation');

  const repairBody = requestBodies.at(-1);
  assert.equal(repairBody.contents.at(-2).role, 'model');
  assert.match(repairBody.contents.at(-2).parts[0].text, /STRESS PAYLOAD EXISTS BUT ITS VISIBLE NAMEPLATE FELL OFF/);
  assert.equal(repairBody.contents.at(-1).role, 'user');
  assert.match(repairBody.contents.at(-1).parts[0].text, /BOUNDED STRUCTURAL SAME-VOICE REPAIR/);
  assert.match(repairBody.contents.at(-1).parts[0].text, /tauric-diana-bots-nominative-missing/);
  assert.match(repairBody.contents.at(-1).parts[0].text, /Do not repaint, normalize, score, or re-author the Tauric Diana combining field/i);
  assert.doesNotMatch(repairBody.contents.at(-1).parts[0].text, /MORPHOLOGY-ONLY REPAIR|vertical crowns\/roots|horizontal or oblique counter-rhythm|several distinct combining marks/i);
} finally {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalKey;
  clearGeminiModelState();
}

console.log('marrowline-five-seat-frontier-cascade.test.mjs passed');
