import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const ledger = read('docs/ASH_KEEP_BUILDOUT_LEDGER.md');
const roadmap = read('ROADMAP.md');

assert.match(ledger, /Ledger generation: `v1\.7 · Stretch 2 production closure \/ Stretch 3 validation-gated implementation`/);
assert.match(ledger, /I\. Ash operator surface and local case stewardship \| \*\*43 \/ 45\*\*/);
assert.match(ledger, /component maturity after Stretch 3 merge = 237 \/ 375/);
assert.match(ledger, /production-demonstrated workstreams = 4 \/ 9/);
assert.match(ledger, /Score: `47 \/ 50`|constitutional synthesis = 47 \/ 50/);
assert.match(ledger, /Stretch 1 · Ash Constitutional Convergence Closure[\s\S]*CLOSED \/ IMPLEMENTED_PRODUCTION_DEMONSTRATED/);
assert.match(ledger, /Stretch 2 · Custodian Return And Anisotropy[\s\S]*CLOSED \/ IMPLEMENTED_PRODUCTION_DEMONSTRATED/);
assert.match(ledger, /Stretch 3 · Choir Calibration Receipt Binding[\s\S]*OPEN \/ IMPLEMENTED_VALIDATION_GATED/);
assert.match(ledger, /current-head aftercare commit[\s\S]*2c89b70e284562ebb6b842900ae1a1bd0b00f6e6/);
assert.match(ledger, /transport-capable workstreams = 0/);

assert.match(roadmap, /Roadmap generation: `v1\.7 · Stretch 2 closed \/ Stretch 3 validation-gated`/);
assert.match(roadmap, /component maturity after Stretch 3 merge = 237 \/ 375/);
assert.match(roadmap, /constitutional synthesis = 47 \/ 50/);
assert.match(roadmap, /Ash operator surface = 43 \/ 45/);
assert.match(roadmap, /Stretch 1 · Ash Constitutional Convergence Closure — CLOSED/);
assert.match(roadmap, /Stretch 2 · Custodian Return And Anisotropy — CLOSED/);
assert.match(roadmap, /Stretch 3 · Choir calibration receipt binding — OPEN \/ VALIDATION-GATED/);
assert.ok(roadmap.indexOf('Stretch 1 · Ash Constitutional Convergence Closure — CLOSED') < roadmap.indexOf('Stretch 2 · Custodian Return And Anisotropy — CLOSED'));
assert.ok(roadmap.indexOf('Stretch 2 · Custodian Return And Anisotropy — CLOSED') < roadmap.indexOf('Stretch 3 · Choir calibration receipt binding — OPEN / VALIDATION-GATED'));
assert.ok(roadmap.indexOf('Stretch 3 · Choir calibration receipt binding — OPEN / VALIDATION-GATED') < roadmap.indexOf('Hush vocabulary externalization and intervention ensemble — BLOCKED'));
assert.match(roadmap, /Stretch 2 is closed\. Stretch 3 is implemented and active\. Stretch 4 remains blocked\./);
