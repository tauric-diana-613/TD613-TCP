import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const fixture = JSON.parse(fs.readFileSync('tests/fixtures/hush/hush-quota-scope-regression-family.json', 'utf8'));
const client = fs.readFileSync('app/hush-pr123-stable-transform.js', 'utf8');
const broker = fs.readFileSync('app/engine/hush-provider-broker.js', 'utf8');
const server = fs.readFileSync('server/hush-generate-quality.js', 'utf8');

test('handoff fixture preserves the three quota-scope falsifiers', () => {
  assert.equal(fixture.schema, 'td613.hush.quota-scope-regression-family/v0.1');
  assert.deepEqual(fixture.cases.map(row => row.expected_scope), ['model', 'shared', 'unknown']);
  assert.equal(new Set(fixture.cases.map(row => row.id)).size, 3);
});

test('existing Hush client still carries the June model-vs-provider quota distinction', () => {
  assert.match(client, /function quotaScope\(/);
  assert.match(client, /model_quota_exhausted/);
  assert.match(client, /provider_quota_exhausted/);
});

test('draft repair closes the broker promotion seam without freezing unknown 429 scope', () => {
  assert.match(broker, /reason === 'model_quota_exhausted'/);
  assert.match(broker, /scope === 'model-diagnostic'/);
  assert.match(broker, /scope === 'provider'/);
  assert.match(broker, /scope === 'shared'/);
  assert.match(broker, /bare\/ambiguous 429 cannot establish provider scope/i);
  assert.doesNotMatch(broker, /reason === 'provider_quota_exhausted' \|\| status === 429/);
});

test('handoff pins the current server-side semantic gap', () => {
  assert.match(server, /classifyGeminiTransport/);
  assert.match(server, /retryAfterSeconds\(result\.response\)/);
  assert.doesNotMatch(server, /observeGeminiQuota/);
});

test('historical PR123 stable-transform and PR141 normalizer are not in the current adversarial-bench runtime chain', () => {
  const html = fs.readFileSync('app/adversarial-bench.html', 'utf8');
  const light = fs.readFileSync('app/adversarial-bench-light.js', 'utf8');
  const coherence = fs.readFileSync('app/hush-current-runtime-coherence.js', 'utf8');
  assert.doesNotMatch(html, /hush-pr123-stable-transform\.js/);
  assert.doesNotMatch(html, /hush-pr141-receipt-truth-normalizer\.js/);
  assert.doesNotMatch(light, /hush-pr123-stable-transform|hush-pr141-receipt-truth-normalizer/);
  assert.doesNotMatch(coherence, /hush-pr123-stable-transform|hush-pr141-receipt-truth-normalizer/);
  assert.match(html, /hush-pr123-strict-undefined-fallback\.js/);
});

test.todo('reuse shared Gemini quota observer after Marrowline #1209 lands and preserve structured model/shared/unknown scope in the live Hush server receipts');
test.todo('decide bounded cooldown law for shared short-burst RetryInfo without weakening strict no-fallback Hush custody');

console.log('hush-quota-scope-handoff.test.mjs handoff hooks loaded');
