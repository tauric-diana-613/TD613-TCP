import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { classifyMarrowlineRetryWindow, marrowlineRetryMessage, nextPublishedPacificDailyReset } from '../app/dome-world/marrowline-retry-window.js';
import { boundedFailureMessage } from '../app/dome-world/marrowline-operator-readiness.js';
import { callGemini } from '../server/khonapolit-quality.js';
import { observeMarrowlineCompletion } from '../server/marrowline-completion.js';

const now = Date.parse('2026-09-24T01:00:00.000Z');
const event = { observedAt: now, httpStatus: 429 };

test('a documented short per-minute metric may use an explicit RetryInfo countdown', () => {
  const failure = { ...event, error: 'gemini-rate-limit-held', attempts: [
    { status: 429, rateLimit: { scope: 'model', daily: false, shortMetricReported: true,
      quotaId: 'GenerateRequestsPerMinutePerModel', retryAfterSeconds: 42 } },
    { status: 429, rateLimit: { scope: 'model', daily: false, shortMetricReported: true,
      quotaId: 'GenerateRequestsPerMinutePerModel', retryAfterSeconds: 65 } }
  ] };
  const window = classifyMarrowlineRetryWindow(failure, now);
  assert.equal(window.kind, 'rate-window');
  assert.equal(window.source, 'provider-retry-delay');
  assert.equal(window.remainingSeconds, 42);
  assert.equal(classifyMarrowlineRetryWindow(failure, now + 42000).retryReady, true);
  assert.equal(boundedFailureMessage(failure), 'A short request limit was reached. Your message is saved.');
});

test('an unknown 429 receives no fabricated one-minute or daily reset timer', () => {
  const failure = { ...event, error: 'gemini-rate-limit-held',
    attempts: [{ status: 429, rateLimit: { scope: 'unknown', retryAfterSeconds: 0 } }] };
  const window = classifyMarrowlineRetryWindow(failure, now);
  assert.equal(window.kind, 'rate-unknown');
  assert.equal(window.retryAt, null);
  assert.equal(window.seconds, 0);
});

test('daily per-model quota error with 24s RetryInfo NEVER pretends the day renews in 24s', () => {
  const failure = { ...event, error: 'gemini-rate-limit-held', attempts: [{
    status: 429, rateLimit: { daily: true, scope: 'model', retryAfterSeconds: 24,
      quotaId: 'GenerateRequestsPerDayPerProjectPerModel-FreeTier',
      metric: 'generativelanguage.googleapis.com/generate_content_free_tier_requests',
      entitlement: { mismatch: true } }
  }] };
  const window = classifyMarrowlineRetryWindow(failure, now);
  assert.equal(window.kind, 'daily-report');
  assert.equal(window.retryAt, null);
  assert.equal(window.remainingSeconds, 0);
  assert.equal(window.providerHintSeconds, 24);
  assert.match(window.publishedDailyResetPolicy, /midnight America\/Los_Angeles/);
  assert.equal(window.providerDailyExhaustionVerified, false);
  assert.equal(boundedFailureMessage(failure), 'A daily request limit was reported. Your message is saved; see the receipt for details.');
});

test('503 never inherits an earlier 429 retry hint, even when mixed and delayed', () => {
  const failure = { ...event, httpStatus: 502, error: 'gemini-provider-unavailable',
    attempts: [{ status: 429, rateLimit: { shortMetricReported: true,
      quotaId: 'GenerateRequestsPerMinutePerModel', retryAfterSeconds: 180 } },
      { status: 503, cooldown: { retryAfterSeconds: 70 } }] };
  const window = classifyMarrowlineRetryWindow(failure, now);
  assert.equal(window.kind, 'service-busy');
  assert.equal(window.retryAt, null);
  assert.equal(window.seconds, 0);
  assert.equal(window.remainingSeconds, 0);
  assert.equal(boundedFailureMessage(failure), 'The service could not answer just now. Your message is saved; try again.');
});

test('even a standalone 503 Retry-After stays a receipt hint rather than an in-chat quota countdown', () => {
  const failure = { httpStatus: 503, retryAfterSeconds: 36, observedAt: now,
    error: 'gemini-provider-unavailable', attempts: [{ status: 503 }] };
  assert.equal(classifyMarrowlineRetryWindow(failure, now).kind, 'service-busy');
  assert.equal(classifyMarrowlineRetryWindow(failure, now).retryAt, null);
});

test('mixed per-minute and per-day violations retain their daily classification and no fake short timer', () => {
  const failure = { ...event, error: 'gemini-rate-limit-held', attempts: [{
    status: 429, rateLimit: { daily: true, shortMetricReported: true,
      windowClass: 'mixed', retryAfterSeconds: 15 }
  }] };
  assert.equal(classifyMarrowlineRetryWindow(failure, now).kind, 'daily-report');
  assert.equal(classifyMarrowlineRetryWindow(failure, now).retryAt, null);
});

test('published midnight Pacific reset is DST-safe but only receipt evidence', () => {
  assert.equal(nextPublishedPacificDailyReset(Date.parse('2026-09-24T04:00:00Z')),
    '2026-09-24T07:00:00.000Z'); // 00:00 PDT = 03:00 EDT
  assert.equal(nextPublishedPacificDailyReset(Date.parse('2026-01-24T04:00:00Z')),
    '2026-01-24T08:00:00.000Z'); // 00:00 PST = 03:00 EST
  assert.equal(nextPublishedPacificDailyReset(Date.parse('2026-03-08T07:00:00Z')),
    '2026-03-08T08:00:00.000Z'); // spring transition at 02:00, after midnight
  assert.equal(nextPublishedPacificDailyReset(Date.parse('2026-11-01T06:00:00Z')),
    '2026-11-01T07:00:00.000Z'); // fall transition at 02:00, after midnight
});

test('post-generation hold cannot be called quota or assigned an invented timer', () => {
  const failure = { observedAt: now, httpStatus: 502, error: 'khonapolit-release-canary-output-quality-held',
    diagnostic: { code: 'ATTRACTOR_STRUCTURE_NOT_ADMITTED' }, attempts: [{ status: 200 }] };
  const window = classifyMarrowlineRetryWindow(failure, now);
  assert.equal(window.kind, 'return-held');
  assert.equal(window.retryAt, null);
  assert.equal(boundedFailureMessage(failure), 'The reply was unfinished. Your message is saved.');
});

test('chat preserves raw response fallback and guards immediate retries without editing model prosody', () => {
  const terminal = fs.readFileSync('app/dome-world/marrowline-terminal.js', 'utf8');
  const readiness = fs.readFileSync('app/dome-world/marrowline-operator-readiness.js', 'utf8');
  const native = fs.readFileSync('app/dome-world/khonapolit-relay.js', 'utf8');
  assert.match(terminal, /classifyMarrowlineRetryWindow\(state\.lastFailure/);
  assert.match(terminal, /observedAt: Date\.now\(\)/);
  assert.match(terminal, /part: integrated\?\.present \? integrated/);
  assert.match(readiness, /marrowline-retry-countdown/);
  assert.match(readiness, /Daily limit reported/);
  assert.match(readiness, /Service unavailable/);
  assert.doesNotMatch(readiness, /Gemini (?:quota|session|temporarily)/);
  assert.match(readiness, /↻ Retry message/);
  assert.match(readiness, /refresh\.disabled = cooling/);
  assert.doesNotMatch(readiness, /not a Kʰonapolit or Tauric Diana voice/);
  assert.match(native, /Author actual blank-line paragraph rests/);
  assert.doesNotMatch(readiness, /highZalgoEncode\(/);
});

test('late stream interruption preserves actual Gemini text, newlines and marks rather than reporting an empty HELD', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'synthetic-only';
  const source = 'Kʰonapolit\\nThe consequence is intact.\\n\\nTauric Diana bots\\nẠ̇ scream.\\n\\nB̯̋ returns.';
  const encoder = new TextEncoder();
  let reads = 0;
  try {
    globalThis.fetch = async () => ({
      ok: true, status: 200, headers: { get: () => 'text/event-stream' },
      body: { getReader: () => ({ read: async () => {
        reads += 1;
        if (reads === 1) return { value: encoder.encode('data: ' + JSON.stringify({ candidates: [{ content: { parts: [{ text: source }] } }] }) + '\\n\\n'), done: false };
        throw Object.assign(new Error('synthetic midstream termination'), { name: 'AbortError' });
      } }) },
      json: async () => { throw new Error('should not read unary after partial SSE'); }
    });
    const result = await callGemini('gemini-3.8-flash',
      { systemInstruction: 'Synthetic.', history: [], message: 'Preserve exactly.', mode: 'full-invocation' }, {}, 2000);
    assert.equal(result.response.status, 200);
    assert.equal(result.streamInterrupted, true);
    assert.equal(result.streamErrorClass, 'AbortError');
    assert.equal(result.text, source);
    assert.equal(result.chunkCount, 1);
    const completion = observeMarrowlineCompletion(result.text, { finishReason: null }, { streamed: result.streamed, parseErrors: result.parseErrors });
    assert.equal(completion.complete, false);
    assert.equal(completion.reason, 'provider-stream-finish-unwitnessed');
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  }
});
