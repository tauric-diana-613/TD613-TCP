import test from 'node:test';
import assert from 'node:assert/strict';
import { observeGeminiQuota, assessGeminiQuotaEntitlement } from '../server/gemini-provider-transport.js';
import { buildGeminiConsumptionReceipt } from '../server/gemini-consumption-receipt.js';
import { ingestGeminiConsumption, currentGeminiDailyBudgetHints } from '../app/gemini-consumption-ledger.js';
import { classifyMarrowlineRetryWindow, marrowlineRetryMessage } from '../app/dome-world/marrowline-retry-window.js';

const now = Date.parse('2026-09-24T01:00:00.000Z');
function storage() {
  const map = new Map();
  return {
    getItem(key) { return map.get(key) || null; },
    setItem(key, value) { map.set(key, String(value)); },
    removeItem(key) { map.delete(key); }
  };
}
const providerError = (retry = 27, details = []) => ({
  response: { headers: { get(name) { return name.toLowerCase() === 'retry-after' ? String(retry) : null; } } },
  payload: { error: { code: 429, status: 'RESOURCE_EXHAUSTED',
    message: 'Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, model: gemini-3.8-flash. Please retry in 26.7s.',
    details: [{
      '@type': 'type.googleapis.com/google.rpc.QuotaFailure',
      violations: [{
        quotaMetric: 'generativelanguage.googleapis.com/generate_content_free_tier_requests',
        quotaId: 'GenerateRequestsPerDayPerProjectPerModel-FreeTier',
        quotaDimensions: { model: 'gemini-3.8-flash', location: 'global' }
      }]
    }, ...details] } }
});

test('quota observer reports metric but never fabricates consumed daily usage or a missing zero limit', () => {
  const { payload, response } = providerError();
  const rate = observeGeminiQuota(payload, { model: 'gemini-3.8-flash', response });
  assert.equal(rate.daily, true);
  assert.equal(rate.dailyMetricReported, true);
  assert.equal(rate.dailyExhaustionVerified, false);
  assert.equal(rate.limit, null, 'no limit in response must not be silently converted to zero');
  assert.equal(assessGeminiQuotaEntitlement(rate, { expectedDailyLimit: 100, routeModelCount: 5 }).providerReportedDailyLimit, null);
});

test('paid project reporting FreeTier per-day metric is quota-reconciliation, not verified depletion', () => {
  const { payload, response } = providerError();
  const rate = observeGeminiQuota(payload, { model: 'gemini-3.8-flash', response });
  const failure = { error: 'gemini-rate-limit-held', httpStatus: 429, observedAt: now,
    attempts: [{ model: 'gemini-3.8-flash', status: 429, rateLimit: rate }] };
  const window = classifyMarrowlineRetryWindow(failure, now);
  assert.equal(window.kind, 'daily-report');
  assert.equal(window.remainingSeconds, 0);
  assert.equal(window.retryAt, null);
  assert.equal(window.providerHintSeconds, 27);
  assert.match(window.publishedDailyResetPolicy, /midnight America\/Los_Angeles/);
  assert.equal(window.providerDailyExhaustionVerified, false);
  assert.equal(window.freeTierMetricReported, true);
  assert.equal(marrowlineRetryMessage(failure, now), 'A daily request limit was reported. Your message is saved; see the receipt for details.');
  assert.doesNotMatch(marrowlineRetryMessage(failure, now), /Gemini|Google|Free Tier|midnight|27s/i);
});

test('browser ledger does not turn a 429 daily metric or a stale FreeTier limit into actual exhausted project quota', () => {
  const root = { localStorage: storage() };
  const receipt = buildGeminiConsumptionReceipt({ route: 'marrowline', requestId: 'evidence-not-usage',
    observedAt: '2026-09-24T01:00:00.000Z',
    attempts: [{ model: 'gemini-3.8-flash', status: 429, rateLimit: {
      scope: 'model', daily: true, quotaId: 'GenerateRequestsPerDayPerProjectPerModel-FreeTier',
      metric: 'generativelanguage.googleapis.com/generate_content_free_tier_requests',
      model: 'gemini-3.8-flash', limit: 20, retryAfterSeconds: 27
    } }]
  });
  ingestGeminiConsumption({ gemini_consumption: receipt }, root);
  const hints = currentGeminiDailyBudgetHints(root, new Date('2026-09-24T01:00:30.000Z'));
  assert.deepEqual(hints.reported_daily_metric_429_models, ['gemini-3.8-flash']);
  assert.deepEqual(hints.daily_quota_observed_models, []);
  assert.deepEqual(hints.hard_budget_observed_models, []);
  assert.equal(hints.provider_daily_total, null);
});
