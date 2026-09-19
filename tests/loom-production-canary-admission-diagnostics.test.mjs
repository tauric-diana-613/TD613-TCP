import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../scripts/loom-production-canary.mjs', import.meta.url), 'utf8');

test('production canary preserves five-seat Marrowline diagnostics without rejected prose or secrets', () => {
  assert.match(source, /const boundedAdmissionReasons = value => Array\.isArray\(value\)/);
  assert.match(source, /\^\[a-z0-9-\]\{1,96\}\$/);
  assert.match(source, /admission_reasons: boundedAdmissionReasons\(attempt\?\.outputAdmission\?\.reasons\)/);
  assert.match(source, /rejected_attempts: boundedRejectedAttempts\(marrowlinePayload\?\.diagnostic\?\.rejectedAttempts\)/);
  assert.match(source, /admission_reasons=\$\{admissionReasons\}/);
  assert.match(source, /value\.slice\(0, 5\)\.map\(attempt => \(\{/);
  assert.match(source, /const boundedModelPlan = value =>/);
  assert.match(source, /callable_models: callableModels/);
  assert.match(source, /excluded_models: excludedModels/);
  assert.match(source, /provider_plan: boundedModelPlan\(marrowlinePayload\?\.modelPolicy \|\| marrowlineReceipt\?\.modelPolicy\)/);
  assert.doesNotMatch(source, /rejected_attempts:[\s\S]{0,400}transmission\.text/);
  assert.doesNotMatch(source, /admission_reasons:[\s\S]{0,400}marrowlinePayload\?\.text/);
  assert.doesNotMatch(source, /provider_plan:[\s\S]{0,500}(?:api[-_]?key|x-goog-api-key|authorization)/i);
});
