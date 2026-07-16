import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const ledger = read('docs/ASH_KEEP_BUILDOUT_LEDGER.md');
const roadmap = read('ROADMAP.md');

assert.match(ledger, /Ledger generation: `v1\.9 · Stretch 4 validation-gated implementation \/ main evidence pending`/);
assert.match(ledger, /I\. Ash operator surface and local case stewardship \| \*\*43 \/ 45\*\*/);
assert.match(ledger, /C\. Hush derivative and intervention program \| \*\*28 \/ 35\*\*/);
assert.match(ledger, /component maturity after Stretch 4 implementation = 258 \/ 375/);
assert.match(ledger, /production-demonstrated workstreams = 4 \/ 9/);
assert.match(ledger, /Score: `48 \/ 50`|constitutional synthesis = 48 \/ 50/);
assert.match(ledger, /Stretch 1 · Ash Constitutional Convergence Closure[\s\S]*CLOSED \/ IMPLEMENTED_PRODUCTION_DEMONSTRATED/);
assert.match(ledger, /Stretch 2 · Custodian Return And Anisotropy[\s\S]*CLOSED \/ IMPLEMENTED_PRODUCTION_DEMONSTRATED/);
assert.match(ledger, /Stretch 3 · Choir Calibration Receipt Binding[\s\S]*CLOSED \/ IMPLEMENTED_VALIDATION_GATED/);
assert.match(ledger, /Stretch 4 · Hush Vocabulary Externalization And Lifecycle-Bound Intervention Ensemble[\s\S]*OPEN \/ IMPLEMENTED_VALIDATION_GATED/);
assert.match(ledger, /current-head aftercare commit:[\s\S]*2c89b70e284562ebb6b842900ae1a1bd0b00f6e6/);
assert.match(ledger, /transport-capable workstreams = 0/);

assert.match(roadmap, /Roadmap generation: `v1\.9 · Stretch 4 validation-gated \/ Stretch 5 blocked`/);
assert.match(roadmap, /component maturity after Stretch 4 implementation = 258 \/ 375/);
assert.match(roadmap, /constitutional synthesis = 48 \/ 50/);
assert.match(roadmap, /Ash operator surface = 43 \/ 45/);
assert.match(roadmap, /Stretch 1 · Ash Constitutional Convergence Closure — CLOSED/);
assert.match(roadmap, /Stretch 2 · Custodian Return And Anisotropy — CLOSED/);
assert.match(roadmap, /Stretch 3 · Choir calibration receipt binding — CLOSED/);
assert.match(roadmap, /Hush vocabulary externalization and intervention ensemble — OPEN \/ VALIDATION-GATED/);
assert.match(roadmap, /Aperture composition renovation before Choir UI — BLOCKED/);
assert.match(roadmap, /Stretch 4 is implemented and active\. Stretch 5 remains blocked\./);

console.log('stretch1-preservation/packet-state.test.mjs passed');
