import assert from 'node:assert/strict';
import test from 'node:test';
import { observeGeminiQuota } from '../server/gemini-provider-transport.js';

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
