import assert from 'node:assert/strict';
import test from 'node:test';
import { assessGeminiQuotaEntitlement, gemini503FailoverDelayMs, observeGeminiQuota } from '../server/gemini-provider-transport.js';

const response = (retryAfter = '') => ({
  headers: { get: (name) => name.toLowerCase() === 'retry-after' ? retryAfter : null }
});

test('Gemini quota observer preserves a structured model-scoped 429', () => {
  const payload = {
    error: {
      code: 429,
      status: 'RESOURCE_EXHAUSTED',
      message: 'Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_requests, limit: 20, model: gemini-3.5-flash',
      details: [{
        '@type': 'type.googleapis.com/google.rpc.QuotaFailure',
        violations: [{
          quotaMetric: 'generativelanguage.googleapis.com/generate_content_requests',
          quotaId: 'GenerateRequestsPerMinutePerModel',
          quotaDimensions: { model: 'gemini-3.5-flash', location: 'global' }
        }]
      }]
    }
  };
  const observed = observeGeminiQuota(payload, { model: 'gemini-3.5-flash', response: response('12') });
  assert.equal(observed.observed, true);
  assert.equal(observed.scope, 'model');
  assert.equal(observed.model, 'gemini-3.5-flash');
  assert.equal(observed.limit, 20);
  assert.equal(observed.retryAfterSeconds, 12);
});

test('Gemini quota observer does not invent model scope for a shared project bucket', () => {
  const payload = {
    error: {
      code: 429,
      status: 'RESOURCE_EXHAUSTED',
      message: 'Resource exhausted. Please retry in 2s.',
      details: [
        {
          '@type': 'type.googleapis.com/google.rpc.QuotaFailure',
          violations: [{
            quotaMetric: 'generativelanguage.googleapis.com/generate_content_requests_per_minute',
            quotaId: 'GenerateRequestsPerMinutePerProject',
            quotaDimensions: { location: 'global' }
          }]
        },
        { '@type': 'type.googleapis.com/google.rpc.RetryInfo', retryDelay: '2s' }
      ]
    }
  };
  const observed = observeGeminiQuota(payload, { model: 'gemini-3.8-flash', response: response('') });
  assert.equal(observed.scope, 'shared');
  assert.equal(observed.retryAfterSeconds, 2);
  assert.equal(observed.burst, true);
  assert.equal(observed.daily, false);
});

test('ambiguous 429 remains unknown rather than becoming provider exhaustion', () => {
  const payload = { error: { code: 429, status: 'RESOURCE_EXHAUSTED', message: 'quota' } };
  const observed = observeGeminiQuota(payload, { model: 'gemini-3.8-flash', response: response('') });
  assert.equal(observed.observed, true);
  assert.equal(observed.scope, 'unknown');
  assert.equal(observed.model, 'gemini-3.8-flash');
});


test('FreeTier daily 20 for one model cannot establish five-seat route capacity', () => {
  const payload = {
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
  const observed = observeGeminiQuota(payload, { model: 'gemini-3.8-flash', response: response('27') });
  const entitlement = assessGeminiQuotaEntitlement(observed, { expectedDailyLimit: 100, routeModelCount: 5 });
  assert.equal(observed.scope, 'model');
  assert.equal(observed.daily, true);
  assert.equal(observed.burst, false, 'generate_content_free_tier_requests must not match burst merely because “generate” contains the letters “rate”');
  assert.equal(observed.retryAfterSeconds, 27);
  assert.equal(observed.limit, 20);
  assert.equal(entitlement.limitScope, 'per-model');
  assert.equal(entitlement.routeModelCount, 5);
  assert.equal(entitlement.routeDailyCapacity, null);
  assert.equal(entitlement.mismatch, null);
  assert.equal(entitlement.expectedDailyLimit, 100);
  assert.equal(entitlement.providerReportedDailyLimit, 20);
  assert.equal(entitlement.reason, null);
});

test('per-model 20 receipt cannot establish four-seat aggregate capacity or entitlement mismatch', () => {
  const entitlement = assessGeminiQuotaEntitlement({
    scope: 'model',
    daily: true,
    limit: 20,
    quotaId: 'GenerateRequestsPerDayPerProjectPerModel-FreeTier',
    metric: 'generativelanguage.googleapis.com/generate_content_free_tier_requests',
    model: 'gemini-3.8-flash'
  }, { expectedDailyLimit: 100, routeModelCount: 4 });
  assert.equal(entitlement.limitScope, 'per-model');
  assert.equal(entitlement.routeDailyCapacity, null);
  assert.equal(entitlement.mismatch, null);
  assert.equal(entitlement.reason, null);
});

test('a provider project-wide daily 100 receipt remains a route-wide 100 budget', () => {
  const entitlement = assessGeminiQuotaEntitlement({
    scope: 'shared',
    daily: true,
    limit: 100,
    quotaId: 'GenerateRequestsPerDayPerProject-FreeTier',
    metric: 'generativelanguage.googleapis.com/generate_content_free_tier_requests',
    model: 'gemini-3.8-flash'
  }, { expectedDailyLimit: 100, routeModelCount: 5 });
  assert.equal(entitlement.limitScope, 'route-or-project');
  assert.equal(entitlement.routeDailyCapacity, 100);
  assert.equal(entitlement.mismatch, false);
});

test('503-only inter-seat backoff is bounded, never adds calls or borrows a 429 timer', () => {
  const options = { status: 503, remainingMs: 180000, hasNextModel: true };
  assert.equal(gemini503FailoverDelayMs({ ...options, service503Count: 1 }), 1000);
  assert.equal(gemini503FailoverDelayMs({ ...options, service503Count: 2, alreadyWaitedMs: 1000 }), 2000);
  assert.equal(gemini503FailoverDelayMs({ ...options, service503Count: 3, alreadyWaitedMs: 3000 }), 4000);
  assert.equal(gemini503FailoverDelayMs({ ...options, service503Count: 4, alreadyWaitedMs: 7000 }), 0);
  assert.equal(gemini503FailoverDelayMs({ ...options, status: 429, service503Count: 1 }), 0);
  assert.equal(gemini503FailoverDelayMs({ ...options, status: 502, service503Count: 1 }), 0);
  assert.equal(gemini503FailoverDelayMs({ ...options, status: 599, service503Count: 1 }), 0);
  assert.equal(gemini503FailoverDelayMs({ ...options, hasNextModel: false, service503Count: 1 }), 0);
  assert.equal(gemini503FailoverDelayMs({ ...options, remainingMs: 1100, service503Count: 1 }), 0);
  assert.equal(gemini503FailoverDelayMs({ ...options, remainingMs: 1600, service503Count: 1 }), 600);
});
