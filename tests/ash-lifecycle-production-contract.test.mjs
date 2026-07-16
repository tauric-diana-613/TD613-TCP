import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = p => fs.readFileSync(p, 'utf8');
const workflow = read('.github/workflows/ash-keep-production-closure.yml');
const probe = read('scripts/ash-lifecycle-production-probe.mjs') + read('scripts/ash-lifecycle-production-probe-base.mjs');
const core = read('app/dome-world/ash-keep.js');
const controls = read('app/dome-world/ash-case-controls.js');
const keep = read('app/dome-world/ash-keep.html');
const delivery = read('app/dome-world/ash-keep-source.html');
const receipt = read('docs/ASH_LIFECYCLE_PRODUCTION_DEMO_RECEIPT.md');
const ledger = read('docs/ASH_KEEP_BUILDOUT_LEDGER.md');
const roadmap = read('ROADMAP.md');
const closure = read('docs/APERTURE_COMPOSITION_CLOSURE_RECEIPT.md');

for (const token of ['Ash Lifecycle Deployed Observation', 'CONTINUITY_SEALED', 'promotion remains separate'])
  assert.ok(workflow.includes(token), `Workflow omitted ${token}`);

for (const token of ['ARRIVAL_UNPERSISTED', 'CASE_BOUND', 'RELEASE_ELIGIBLE', 'promotion_authorized: false', 'continuity is not transport'])
  assert.ok(probe.includes(token), `Probe omitted ${token}`);

assert.doesNotMatch(core, /location\.reload\(\)/);
assert.equal(delivery, keep);
assert.match(keep, /\/dome-world\/ash-lifecycle\.js/);
assert.match(controls, /DELETE_PARTIAL_HOLD/);
assert.match(receipt, /Status: `EARNED`/);
assert.match(receipt, /promotion_scope: ASH_LIFECYCLE_MATURITY_ONLY/);
assert.match(ledger, /component maturity after Stretch 5 closure = 270 \/ 375/);
assert.match(ledger, /Stretch 5 · Aperture Composition Renovation Before Choir UI[\s\S]*CLOSED/);
assert.match(roadmap, /Stretch 5 · Aperture composition renovation before Choir UI — CLOSED/);
assert.match(roadmap, /Higher-order interference — BLOCKED \/ NOT AUTHORIZED/);
assert.match(closure, /lifecycle_run: 29514548484/);
assert.match(closure, /deployment_authorizes_transport: false/);
assert.match(closure, /Stretch_6_authorized: false/);

console.log('ash-lifecycle-production-contract.test.mjs passed');
