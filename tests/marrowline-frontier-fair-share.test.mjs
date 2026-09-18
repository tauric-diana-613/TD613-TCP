import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { allocateKhonapolitAttemptTimeout } from '../server/khonapolit-quality.js';

test('live Marrowline weights the wall clock toward the empirically useful 3.x fallback', () => {
  assert.equal(
    allocateKhonapolitAttemptTimeout({ remainingMs: 50000, index: 0, modelCount: 3, fairShare: true }),
    18000,
    'attempt one gets a bounded frontier window while preserving meaningful fallback runway'
  );
  assert.equal(
    allocateKhonapolitAttemptTimeout({ remainingMs: 33334, index: 1, modelCount: 3, fairShare: true }),
    25334,
    'attempt two receives enough runway for the empirically slower high-quality 3.x fallback while reserving a final lane'
  );
  assert.equal(
    allocateKhonapolitAttemptTimeout({ remainingMs: 16667, index: 2, modelCount: 3, fairShare: true }),
    16667,
    'the last frontier attempt receives the lawful remainder'
  );
  assert.equal(
    allocateKhonapolitAttemptTimeout({ remainingMs: 50000, index: 0, modelCount: 1, fairShare: true }),
    32000,
    'single-model operation keeps the existing primary completion ceiling'
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
