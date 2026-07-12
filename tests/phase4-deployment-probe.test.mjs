import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync('scripts/phase4-reciprocal-bridge-deployment-probe.mjs','utf8');
assert.match(source,/\/api\/aperture-bridge/);
assert.match(source,/td613\.flowcore\.context-receipt\/v0\.1/);
assert.match(source,/PHASE_4_ACTIVE/);
assert.match(source,/ROUND_TRIP_VERIFIED/);
assert.match(source,/ABSTAIN/);
assert.match(source,/artifact rejection/);
assert.match(source,/reciprocal_authority:false/);
assert.match(source,/automatic_ash_action:false/);
assert.match(source,/prediction_authorized:false/);
console.log('phase4-deployment-probe.test.mjs passed');
