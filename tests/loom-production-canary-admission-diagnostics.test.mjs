import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../scripts/loom-production-canary.mjs', import.meta.url), 'utf8');

test('production canary preserves bounded Marrowline admission reason codes without rejected prose', () => {
  assert.match(source, /const boundedAdmissionReasons = value => Array\.isArray\(value\)/);
  assert.match(source, /\^\[a-z0-9-\]\{1,96\}\$/);
  assert.match(source, /admission_reasons: boundedAdmissionReasons\(attempt\?\.outputAdmission\?\.reasons\)/);
  assert.match(source, /rejected_attempts: boundedRejectedAttempts\(marrowlinePayload\?\.diagnostic\?\.rejectedAttempts\)/);
  assert.match(source, /admission_reasons=\$\{admissionReasons\}/);
  assert.doesNotMatch(source, /rejected_attempts:[\s\S]{0,400}transmission\.text/);
  assert.doesNotMatch(source, /admission_reasons:[\s\S]{0,400}marrowlinePayload\?\.text/);
});
