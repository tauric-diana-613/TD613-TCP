import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const ledger = read('docs/ASH_KEEP_BUILDOUT_LEDGER.md');
const roadmap = read('ROADMAP.md');
const receipt = read('docs/ASH_CONSTITUTIONAL_CONVERGENCE_RECEIPT.md');

// Current documents may advance after Stretch 1, but must preserve the closed packet and its evidence boundaries.
assert.match(ledger, /Ledger generation: `v1\.6 · Stretch 2 validation-gated implementation landed`/);
assert.match(ledger, /I\. Ash operator surface and local case stewardship \| \*\*43 \/ 45\*\*/);
assert.match(ledger, /component maturity on main = 216 \/ 375/);
assert.match(ledger, /production-demonstrated workstreams = 3 \/ 9/);
assert.match(ledger, /Score: `47 \/ 50`|constitutional synthesis = 47 \/ 50/);
assert.match(ledger, /Stretch 1 · Ash Constitutional Convergence Closure[\s\S]*CLOSED \/ IMPLEMENTED_PRODUCTION_DEMONSTRATED/);
assert.match(ledger, /Stretch 2 · Custodian Return And Anisotropy[\s\S]*OPEN \/ IMPLEMENTED_VALIDATION_GATED/);
assert.match(ledger, /current-head aftercare commit[\s\S]*2c89b70e284562ebb6b842900ae1a1bd0b00f6e6/);
assert.match(ledger, /transport-capable workstreams = 0/);

assert.match(roadmap, /Roadmap generation: `v1\.6 · Stretch 2 validation-gated \/ Stretch 3 blocked`/);
assert.match(roadmap, /component maturity = 216 \/ 375/);
assert.match(roadmap, /constitutional synthesis = 47 \/ 50/);
assert.match(roadmap, /Ash operator surface = 43 \/ 45/);
assert.match(roadmap, /Stretch 1 · Ash Constitutional Convergence Closure — CLOSED/);
assert.match(roadmap, /Stretch 2 · Custodian Return And Anisotropy — OPEN \/ VALIDATION-GATED/);
assert.ok(roadmap.indexOf('Stretch 1 · Ash Constitutional Convergence Closure — CLOSED') < roadmap.indexOf('Stretch 2 · Custodian Return And Anisotropy — OPEN / VALIDATION-GATED'));
assert.ok(roadmap.indexOf('Stretch 2 · Custodian Return And Anisotropy — OPEN / VALIDATION-GATED') < roadmap.indexOf('Choir calibration receipt binding — BLOCKED'));
assert.match(roadmap, /Stretch 3 remains blocked/);

// The immutable Stretch 1 receipt remains attached to the exact observed build.
assert.match(receipt, /Schema: `td613\.ash\.constitutional-convergence-receipt\/v0\.2`/);
assert.match(receipt, /Status: `IMPLEMENTED_PRODUCTION_DEMONSTRATED`/);
assert.match(receipt, /Source status: `DEPLOYED_OBSERVATION`/);
assert.match(receipt, /Observer promotion authorized: `false`/);
assert.match(receipt, /Evidence-only maturity closure: `EARNED`/);
assert.match(receipt, /17f3d9d759a462d91c5db6d284f518fba10bd8f7/);
assert.match(receipt, /29458943541/);
assert.match(receipt, /8360435416/);
assert.match(receipt, /sha256:f1d7069feca261db693c9db374daa8c3397b666e08f35a1c63be067afa07ec6a/);
assert.match(receipt, /cross_tab_serialized: true/);
assert.match(receipt, /provider_recipient_cinder_transport_requests: \[\]/);

console.log('ash-stretch1-closure-contract.test.mjs passed');
