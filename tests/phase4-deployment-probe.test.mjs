import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(
  'scripts/phase4-reciprocal-bridge-deployment-probe.mjs',
  'utf8'
);

for (const pattern of [
  /\/api\/aperture-bridge/,
  /td613\.flowcore\.context-receipt\/v0\.1/,
  /PHASE_4_ACTIVE/,
  /ROUND_TRIP_VERIFIED/,
  /ROUND_TRIP_HELD_TAMPER/,
  /ABSTAIN_INSUFFICIENT_CONTEXT/,
  /REJECT_AUTHORITY_BREACH/,
  /HOLD_FOR_REPAIR/,
  /OPEN_FIELD_SPECULATIVE_SYNTHESIS/,
  /LEGACY_PROVISIONAL_NORMALIZED/,
  /artifact rejection/,
  /reciprocal_authority\s*:\s*false/,
  /automatic_ash_action\s*:\s*false/,
  /prediction_authorized\s*:\s*false/
]) {
  assert.match(source, pattern);
}

console.log('phase4-deployment-probe.test.mjs passed');
