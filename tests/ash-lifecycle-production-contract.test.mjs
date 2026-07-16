import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const workflow = read('.github/workflows/ash-keep-production-closure.yml');
const probe = `${read('scripts/ash-lifecycle-production-probe.mjs')}\n${read('scripts/ash-lifecycle-production-probe-base.mjs')}`;
const core = read('app/dome-world/ash-keep.js');
const controls = read('app/dome-world/ash-case-controls.js');
const keep = read('app/dome-world/ash-keep.html');
const delivery = read('app/dome-world/ash-keep-source.html');
const receipt = read('docs/ASH_LIFECYCLE_PRODUCTION_DEMO_RECEIPT.md');
const ledger = read('docs/ASH_KEEP_BUILDOUT_LEDGER.md');
const roadmap = read('ROADMAP.md');
const convergence = read('docs/ASH_CONSTITUTIONAL_CONVERGENCE_RECEIPT.md');
const hushReceipt = read('docs/ASH_KEEP_HUSH_INTERVENTION_RECEIPT.md');
const composition = read('docs/APERTURE_COMPOSITION_RENOVATION.md');

for (const marker of [
  'Ash Lifecycle Deployed Observation',
  'Wait for deployed Ash lifecycle-composed threshold and Keep',
  'Observe deployed Ash lifecycle without promotion',
  'Observe deployed constitutional convergence without promotion',
  'CONTINUITY_SEALED',
  'promotion remains separate'
]) assert.ok(workflow.includes(marker), `Lifecycle workflow omitted ${marker}`);
assert.doesNotMatch(workflow, /TD613 Ash · Threshold/);

for (const token of [
  'ARRIVAL_UNPERSISTED', 'READINESS_OBSERVED', 'CASE_BOUND', 'REBUILD_ELIGIBLE',
  'RELEASE_ELIGIBLE', 'CONTINUITY_SEALED', 'raw_artifact_in_request_body',
  'provider_or_transport_requests', 'SYNTHETIC_DRAFT', 'draft_body_sha256',
  'promotion_authorized: false', 'readiness is not custody', 'continuity is not transport'
]) assert.ok(probe.includes(token), `Lifecycle probe omitted ${token}`);

assert.doesNotMatch(core, /location\.reload\(\)/);
assert.equal(delivery, keep);
assert.match(keep, /\/dome-world\/ash-lifecycle\.js/);
assert.match(keep, /\/dome-world\/ash-case-controls\.js/);
assert.match(controls, /DELETE_PARTIAL_HOLD/);
assert.doesNotMatch(controls, /location\.reload\(\)/);

for (const token of [
  'Status: `EARNED`',
  'observed_commit: e8cbd00673e86d9fa0969407c28ef3ed89af55f7',
  'observer_workflow_run_id: 29383294474',
  'evidence_artifact_id: 8330532097',
  'promotion_authorized: true',
  'promotion_scope: ASH_LIFECYCLE_MATURITY_ONLY',
  'CONTINUITY_SEALED',
  'raw_artifact_in_request_body: false',
  'provider_or_transport_requests: []',
  'lifecycle maturity promotion ≠ transport authorization'
]) assert.ok(receipt.includes(token), `Lifecycle receipt omitted ${token}`);

assert.match(ledger, /H\. Ash product lifecycle orchestration \| \*\*35 \/ 35\*\*/);
assert.match(ledger, /I\. Ash operator surface and local case stewardship \| \*\*43 \/ 45\*\*/);
assert.match(ledger, /C\. Hush derivative and intervention program \| \*\*28 \/ 35\*\*/);
assert.match(ledger, /E\. Aperture composition renovation \| \*\*18 \/ 25\*\*/);
assert.match(ledger, /component maturity after Stretch 5 implementation = 270 \/ 375/);
assert.match(ledger, /validation-gated workstreams = 3 \/ 9/);
assert.match(ledger, /Score: `49 \/ 50`|constitutional synthesis = 49 \/ 50/);
assert.match(ledger, /Stretch 5 · Aperture Composition Renovation Before Choir UI[\s\S]*OPEN \/ IMPLEMENTED_VALIDATION_GATED/);
assert.match(ledger, /Vercel Deployment Law[\s\S]*Vercel deployment is permitted/);
assert.match(roadmap, /Stretch 4 · Hush vocabulary externalization and intervention ensemble — CLOSED/);
assert.match(roadmap, /Stretch 5 · Aperture composition renovation before Choir UI — OPEN \/ IMPLEMENTED_VALIDATION_GATED/);
assert.match(roadmap, /Higher-order interference — BLOCKED \/ NOT AUTHORIZED/);
assert.match(roadmap, /transport-capable workstreams = 0/);
assert.match(roadmap, /Vercel deployment = ALLOWED/);
assert.match(roadmap, /production observation ≠ operator closure/);
assert.match(convergence, /Status: `IMPLEMENTED_PRODUCTION_DEMONSTRATED`/);
assert.match(convergence, /29458943541/);
assert.match(hushReceipt, /Hush_validation_run: 29483240258/);
assert.match(hushReceipt, /Stretch_5_authorized: false/);
assert.match(composition, /canonical_body_rewritten = false/);
assert.match(composition, /td613\.aperture\.composition-constitution-projection\/v0\.1/);
assert.match(composition, /Vercel allowed ≠ deployment earns maturity/);
assert.match(composition, /Stretch_6_authorized: false/);

console.log('ash-lifecycle-production-contract.test.mjs passed');
