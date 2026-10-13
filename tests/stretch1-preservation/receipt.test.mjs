import assert from 'node:assert/strict';
import fs from 'node:fs';

const receipt = fs.readFileSync(new URL('../../docs/ASH_CONSTITUTIONAL_CONVERGENCE_RECEIPT.md', import.meta.url), 'utf8');

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
