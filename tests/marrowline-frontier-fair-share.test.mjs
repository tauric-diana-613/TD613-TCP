import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { allocateKhonapolitAttemptTimeout } from '../server/khonapolit-quality.js';

test('live Marrowline gives every approved Gemini 3 lane a real completion window', () => {
  assert.equal(
    allocateKhonapolitAttemptTimeout({ remainingMs: 205000, index: 0, modelCount: 5, fairShare: true }),
    50000,
    '3.8 receives a fifty-second frontier completion window'
  );
  assert.equal(
    allocateKhonapolitAttemptTimeout({ remainingMs: 155000, index: 1, modelCount: 5, fairShare: true }),
    75000,
    '3.5 receives the empirically proven seventy-five-second continuity lane'
  );
  assert.equal(
    allocateKhonapolitAttemptTimeout({ remainingMs: 80000, index: 2, modelCount: 5, fairShare: true }),
    40000,
    '3.6 receives a forty-second completion window while preserving later lanes'
  );
  assert.equal(
    allocateKhonapolitAttemptTimeout({ remainingMs: 40000, index: 3, modelCount: 5, fairShare: true }),
    30000,
    '3.7 receives thirty seconds while preserving ten seconds for Preview'
  );
  assert.equal(
    allocateKhonapolitAttemptTimeout({ remainingMs: 10000, index: 4, modelCount: 5, fairShare: true }),
    10000,
    'Preview receives the lawful final remainder'
  );
  assert.equal(
    allocateKhonapolitAttemptTimeout({ remainingMs: 205000, index: 0, modelCount: 1, fairShare: true }),
    50000,
    'single-model operation uses the widened primary completion ceiling'
  );
  assert.equal(
    allocateKhonapolitAttemptTimeout({ remainingMs: 18000, index: 1, modelCount: 3 }),
    18000,
    'non-fair-share callers retain inherited caps without exceeding remaining wall time'
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
