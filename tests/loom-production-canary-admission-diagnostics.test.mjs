import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  KHONAPOLIT_MAX_PROVIDER_CALLS,
  KHONAPOLIT_MAX_STRUCTURAL_REPAIRS,
  KHONAPOLIT_MAX_TOTAL_PROVIDER_REQUESTS
} from '../server/khonapolit-quality.js';

const source = readFileSync(new URL('../scripts/loom-production-canary.mjs', import.meta.url), 'utf8');

test('production canary preserves five-seat Marrowline plus one repair diagnostics without rejected prose or secrets', () => {
  assert.match(source, /const boundedAdmissionReasons = value => Array\.isArray\(value\)/);
  assert.match(source, /\^\[a-z0-9-\]\{1,96\}\$/);
  assert.match(source, /admission_reasons: boundedAdmissionReasons\(attempt\?\.outputAdmission\?\.reasons\)/);
  assert.match(source, /rejected_attempts: boundedRejectedAttempts\(marrowlinePayload\?\.diagnostic\?\.rejectedAttempts\)/);
  assert.match(source, /admission_reasons=\$\{admissionReasons\}/);
  assert.equal(KHONAPOLIT_MAX_PROVIDER_CALLS, 5);
  assert.equal(KHONAPOLIT_MAX_STRUCTURAL_REPAIRS, 1);
  for (const collector of ['boundedMarrowlineAttempts', 'boundedRejectedAttempts']) {
    const bounded = new RegExp(`const ${collector} = value => Array\\.isArray\\(value\\)\\s*\\? value\\.slice\\(0, (\\d+)\\)\\.map\\(attempt => \\(\\{`).exec(source);
    assert.ok(bounded, `${collector} remains a bounded diagnostic collector`);
    assert.equal(Number(bounded[1]), KHONAPOLIT_MAX_TOTAL_PROVIDER_REQUESTS, `${collector} preserves the declared five seats and one repair without widening the observation budget`);
  }
  assert.match(source, /const boundedModelPlan = value =>/);
  assert.match(source, /callable_models: callableModels/);
  assert.match(source, /excluded_models: excludedModels/);
  assert.match(source, /provider_plan: boundedModelPlan\(marrowlinePayload\?\.modelPolicy \|\| marrowlineReceipt\?\.modelPolicy\)/);
  assert.match(source, /provider_stream: attempt\?\.providerStream/);
  assert.match(source, /first_chunk_ms: boundedCount\(attempt\.providerStream\.firstChunkMs\)/);
  assert.match(source, /chunk_count: boundedCount\(attempt\.providerStream\.chunkCount\)/);
  assert.match(source, /byte_count: boundedCount\(attempt\.providerStream\.byteCount\)/);
  assert.match(source, /parse_errors: boundedCount\(attempt\.providerStream\.parseErrors\)/);
  assert.match(source, /observations\.provider_attempts\.slice\(0, 5\)/,
    'independent Loom evidence must preserve all five bounded provider attempts');
  assert.match(source, /observations\.provider_attempt_timings\.slice\(0, 5\)/,
    'independent Loom timing evidence must preserve all five bounded provider attempts');
  assert.doesNotMatch(source, /rejected_attempts:[\s\S]{0,400}transmission\.text/);
  assert.doesNotMatch(source, /admission_reasons:[\s\S]{0,400}marrowlinePayload\?\.text/);
  assert.doesNotMatch(source, /provider_plan:[\s\S]{0,500}(?:api[-_]?key|x-goog-api-key|authorization)/i);
});
