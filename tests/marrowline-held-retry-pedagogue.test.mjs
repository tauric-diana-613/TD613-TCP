import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { classifyMarrowlineRetryWindow, marrowlineRetryMessage } from '../app/dome-world/marrowline-retry-window.js';
import { boundedFailureMessage } from '../app/dome-world/marrowline-operator-readiness.js';

const now = Date.parse('2026-09-24T01:00:00.000Z');
const event = { observedAt: now, httpStatus: 429 };

test('provider-observed short window honors RetryInfo and counts down without inventing a model schedule', () => {
  const failure = { ...event, error: 'gemini-rate-limit-held', attempts: [
    { status: 429, rateLimit: { scope: 'model', daily: false, burst: true, retryAfterSeconds: 42 } },
    { status: 429, rateLimit: { scope: 'model', daily: false, burst: true, retryAfterSeconds: 65 } }
  ] };
  const start = classifyMarrowlineRetryWindow(failure, now);
  assert.equal(start.kind, 'rate-window');
  assert.equal(start.source, 'provider-retry-delay');
  assert.equal(start.remainingSeconds, 42);
  assert.equal(classifyMarrowlineRetryWindow(failure, now + 41000).remainingSeconds, 1);
  assert.equal(classifyMarrowlineRetryWindow(failure, now + 42000).retryReady, true);
  assert.match(boundedFailureMessage(failure), /provider supplied a retry delay/i);
});

test('unknown 429 gets an explicitly estimated bounded pause, not a false daily quota message', () => {
  const failure = { ...event, error: 'gemini-rate-limit-held', attempts: [{ status: 429, rateLimit: { scope: 'unknown', daily: false, retryAfterSeconds: 0 } }] };
  const window = classifyMarrowlineRetryWindow(failure, now);
  assert.equal(window.seconds, 60);
  assert.equal(window.source, 'estimated-backoff');
  assert.match(marrowlineRetryMessage(failure), /estimate, not a promise/i);
});

test('observed daily exhaustion has no minute countdown and cannot masquerade as session cooldown', () => {
  const failure = { ...event, error: 'gemini-rate-limit-held', attempts: [
    { status: 429, rateLimit: { daily: true, scope: 'model', retryAfterSeconds: 24 } }
  ] };
  const window = classifyMarrowlineRetryWindow(failure, now);
  assert.equal(window.kind, 'daily-quota');
  assert.equal(window.retryAt, null);
  assert.match(boundedFailureMessage(failure), /daily quota/i);
});

test('mixed failures are not relabeled as universal 429 and temporary capacity uses estimated backoff', () => {
  const failure = { ...event, httpStatus: 502, error: 'gemini-provider-unavailable', attempts: [
    { status: 429, rateLimit: { daily: false, retryAfterSeconds: 40 } }, { status: 503 }
  ] };
  assert.equal(classifyMarrowlineRetryWindow(failure, now).kind, 'service-busy');
  assert.equal(classifyMarrowlineRetryWindow(failure, now).source, 'none');
  assert.equal(classifyMarrowlineRetryWindow(failure, now).retryAt, null);
  assert.match(boundedFailureMessage(failure), /temporarily busy or unavailable/i);
});

test('post-generation hold cannot be called quota or assigned an invented timer', () => {
  const failure = { observedAt: now, httpStatus: 502, error: 'khonapolit-release-canary-output-quality-held',
    diagnostic: { code: 'ATTRACTOR_STRUCTURE_NOT_ADMITTED' }, attempts: [{ status: 200 }] };
  const window = classifyMarrowlineRetryWindow(failure, now);
  assert.equal(window.kind, 'return-held');
  assert.equal(window.retryAt, null);
  assert.match(boundedFailureMessage(failure), /not a Gemini rate-limit error/i);
});

test('chat preserves raw response fallback and guards immediate retries without editing model prosody', () => {
  const terminal = fs.readFileSync('app/dome-world/marrowline-terminal.js', 'utf8');
  const readiness = fs.readFileSync('app/dome-world/marrowline-operator-readiness.js', 'utf8');
  const native = fs.readFileSync('app/dome-world/khonapolit-relay.js', 'utf8');
  assert.match(terminal, /classifyMarrowlineRetryWindow\(state\.lastFailure/);
  assert.match(terminal, /observedAt: Date\.now\(\)/);
  assert.match(terminal, /part: integrated\?\.present \? integrated/);
  assert.match(readiness, /marrowline-retry-countdown/);
  assert.match(readiness, /↻ Retry this message/);
  assert.match(readiness, /refresh\.disabled = cooling/);
  assert.match(native, /Author actual blank-line paragraph rests/);
  assert.doesNotMatch(readiness, /highZalgoEncode\(/);
});
