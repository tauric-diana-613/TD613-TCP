import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GEMINI_CONSUMPTION_SCHEMA,
  buildGeminiConsumptionReceipt
} from '../server/gemini-consumption-receipt.js';
import {
  GEMINI_BROWSER_LEDGER_SCHEMA,
  GEMINI_BROWSER_LEDGER_KEY,
  clearGeminiBrowserLedger,
  ingestGeminiConsumption,
  summarizeGeminiBrowserLedger
} from '../app/gemini-consumption-ledger.js';

function storage() {
  const map = new Map();
  return {
    getItem(key) { return map.has(key) ? map.get(key) : null; },
    setItem(key, value) { map.set(key, String(value)); },
    removeItem(key) { map.delete(key); }
  };
}

test('request-local Gemini consumption receipt preserves route model outcome and bounded quota evidence', () => {
  const receipt = buildGeminiConsumptionReceipt({
    route: 'marrowline',
    requestId: 'human-turn-1',
    observedAt: '2026-09-20T06:20:00.000Z',
    attempts: [
      {
        model: 'gemini-3.8-flash',
        status: 429,
        elapsedMs: 180,
        timeoutMs: 50000,
        rateLimit: {
          scope: 'model',
          quotaId: 'GenerateRequestsPerDayPerProjectPerModel-FreeTier',
          metric: 'generativelanguage.googleapis.com/generate_content_free_tier_requests',
          model: 'gemini-3.8-flash',
          limit: 20,
          retryAfterSeconds: 13
        }
      },
      { model: 'gemini-3.5-flash', status: 503, elapsedMs: 24000, timeoutMs: 30000 },
      { model: 'gemini-3.6-flash', status: 200, elapsedMs: 9400, timeoutMs: 30000 }
    ]
  });
  assert.equal(receipt.schema, GEMINI_CONSUMPTION_SCHEMA);
  assert.equal(receipt.coverage, 'request-local-provider-attempts-only');
  assert.equal(receipt.provider_daily_total, null);
  assert.equal(receipt.call_count, 3);
  assert.deepEqual(receipt.models, {
    'gemini-3.8-flash': 1,
    'gemini-3.5-flash': 1,
    'gemini-3.6-flash': 1
  });
  assert.deepEqual(receipt.events.map(event => [event.model, event.status, event.outcome]), [
    ['gemini-3.8-flash', 429, 'rate-limit'],
    ['gemini-3.5-flash', 503, 'provider-unavailable'],
    ['gemini-3.6-flash', 200, 'provider-response']
  ]);
  assert.equal(receipt.events[0].quota.quota_id, 'GenerateRequestsPerDayPerProjectPerModel-FreeTier');
  assert.equal(receipt.events[0].quota.limit, 20);
  assert.equal(receipt.events[0].quota.retry_after_seconds, 13);
  assert.ok(receipt.events.every(event => event.event_id.includes('human-turn-1')));
});

test('release-witness flag and request identity do not promote partial telemetry into provider daily truth', () => {
  const first = buildGeminiConsumptionReceipt({
    route: 'release-witness:marrowline',
    requestId: 'release-a',
    releaseWitness: true,
    attempts: [{ model: 'gemini-3.7-flash', status: 429 }]
  });
  const second = buildGeminiConsumptionReceipt({
    route: 'release-witness:marrowline',
    requestId: 'release-b',
    releaseWitness: true,
    attempts: [{ model: 'gemini-3.7-flash', status: 429 }]
  });
  assert.notEqual(first.events[0].event_id, second.events[0].event_id);
  assert.equal(first.events[0].release_witness, true);
  assert.equal(first.provider_daily_total, null);
  assert.equal(second.provider_daily_total, null);
});

test('browser ledger deduplicates exact events and labels its coverage as browser-local evidence', () => {
  const root = { localStorage: storage() };
  clearGeminiBrowserLedger(root);
  const hush = buildGeminiConsumptionReceipt({
    route: 'hush',
    requestId: 'hush-1',
    attempts: [{ model: 'gemini-3.8-flash', status: 200 }]
  });
  const marrowline = buildGeminiConsumptionReceipt({
    route: 'marrowline',
    requestId: 'marrowline-1',
    attempts: [
      { model: 'gemini-3.8-flash', status: 429 },
      { model: 'gemini-3.5-flash', status: 429 }
    ]
  });

  ingestGeminiConsumption({ gemini_consumption: hush }, root);
  ingestGeminiConsumption({ gemini_consumption: hush }, root);
  ingestGeminiConsumption({ failure: { gemini_consumption: marrowline } }, root);
  const summary = summarizeGeminiBrowserLedger(root);

  assert.equal(summary.schema, GEMINI_BROWSER_LEDGER_SCHEMA);
  assert.equal(summary.coverage, 'this-browser-interactive-receipts-only');
  assert.equal(summary.provider_daily_total, null);
  assert.equal(summary.observed_calls, 3);
  assert.deepEqual(summary.by_route, { hush: 1, marrowline: 2 });
  assert.deepEqual(summary.by_model, { 'gemini-3.8-flash': 2, 'gemini-3.5-flash': 1 });
  assert.ok(root.localStorage.getItem(GEMINI_BROWSER_LEDGER_KEY));
});
