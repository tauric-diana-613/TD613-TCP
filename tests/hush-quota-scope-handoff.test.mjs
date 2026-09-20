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

test('handoff pins the current broker promotion seam so a future repair cannot lose it', () => {
  assert.match(broker, /reason === 'provider_quota_exhausted' \|\| status === 429/);
  assert.match(broker, /reason: 'provider_quota_exhausted', httpStatus: 429/);
});

test('handoff pins the current server-side semantic gap', () => {
  assert.match(server, /classifyGeminiTransport/);
  assert.match(server, /retryAfterSeconds\(result\.response\)/);
  assert.doesNotMatch(server, /observeGeminiQuota/);
});

test.todo('repair broker persistence so model_quota_exhausted cannot be promoted by HTTP 429 alone');
test.todo('reuse shared Gemini quota observer after Marrowline #1209 lands and preserve model/shared/unknown in Hush server receipts');
test.todo('decide bounded cooldown law for shared short-burst RetryInfo without weakening strict no-fallback Hush custody');

console.log('hush-quota-scope-handoff.test.mjs handoff hooks loaded');
