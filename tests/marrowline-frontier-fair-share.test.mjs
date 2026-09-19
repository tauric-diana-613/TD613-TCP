import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { allocateKhonapolitAttemptTimeout } from '../server/khonapolit-quality.js';

test('live Marrowline preserves 3.8-first quality while giving 3.5 a long continuity lane', () => {
  assert.equal(
    allocateKhonapolitAttemptTimeout({ remainingMs: 50000, index: 0, modelCount: 5, fairShare: true }),
    8000,
    '3.8 gets the first look but cannot consume the human request wall'
  );
  assert.equal(
    allocateKhonapolitAttemptTimeout({ remainingMs: 42000, index: 1, modelCount: 5, fairShare: true }),
    28000,
    '3.5 gets the empirically proven long Marrowline completion runway while preserving fourteen seconds for the tail'
  );
  assert.equal(
    allocateKhonapolitAttemptTimeout({ remainingMs: 14000, index: 2, modelCount: 5, fairShare: true }),
    5000,
    'the third seat yields enough time to keep both later approved seats reachable'
  );
  assert.equal(
    allocateKhonapolitAttemptTimeout({ remainingMs: 9000, index: 3, modelCount: 5, fairShare: true }),
    4500,
    'the fourth seat preserves a lawful final-seat remainder'
  );
  assert.equal(
    allocateKhonapolitAttemptTimeout({ remainingMs: 4500, index: 4, modelCount: 5, fairShare: true }),
    4500,
    'the final approved seat receives the lawful remainder'
  );
  assert.equal(
    allocateKhonapolitAttemptTimeout({ remainingMs: 50000, index: 0, modelCount: 1, fairShare: true }),
    32000,
    'single-model operation keeps the inherited primary ceiling'
  );
  assert.equal(
    allocateKhonapolitAttemptTimeout({ remainingMs: 18000, index: 1, modelCount: 3 }),
    10500,
    'callers that do not opt into fair sharing retain the inherited fallback contract'
  );
});

test('the live Kʰonapolit loop explicitly opts into fair sharing', () => {
  const source = fs.readFileSync('server/khonapolit-quality.js', 'utf8');
  assert.match(
    source,
    /allocateKhonapolitAttemptTimeout\(\{\s*remainingMs,\s*index,\s*modelCount:\s*models\.length,\s*fairShare:\s*true\s*\}\)/,
    'production Marrowline must not silently fall back to the 32 second primary monopoly'
  );
});
