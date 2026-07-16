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
const closure = read('docs/APERTURE_COMPOSITION_CLOSURE_RECEIPT.md');
const stretch6 = read('docs/ASH_KEEP_STRETCH6_CLOSURE_RECEIPT.md');
const stretch7 = read('docs/ASH_KEEP_STRETCH7_CLOSURE_RECEIPT.md');
const stretch8 = read('docs/ASH_KEEP_STRETCH8_CLOSURE_RECEIPT.md');

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

assert.match(ledger, /component maturity after Stretch 8 closure = 296 \/ 375/);
assert.match(ledger, /Stretch 6 · Higher-Order Interference[\s\S]*CLOSED \/ IMPLEMENTED_VALIDATION_GATED \/ EVIDENCE_BOUNDED/);
assert.match(ledger, /Stretch 7 · Ordered Route-Sequence Recovery[\s\S]*STRATEGIC_DEPLOYMENT_SEALED/);
assert.match(ledger, /Stretch 8 · Temporal And Delayed-Disclosure Assays[\s\S]*CLOSED \/ IMPLEMENTED_VALIDATION_GATED \/ EVIDENCE_BOUNDED/);
assert.match(roadmap, /Stretch 7 · Ordered route-sequence recovery — CLOSED/);
assert.match(roadmap, /Stretch 8 · Temporal and delayed-disclosure assays — CLOSED/);
assert.match(roadmap, /Safe Harbor → Ash custody-root adapter — CONDITIONALLY AUTHORIZED AFTER SUCCESSFUL STRETCH 8 SEAL/);
assert.match(stretch6, /new serverless function = false/);
assert.match(stretch7, /new serverless function = false/);
assert.match(stretch8, /State: `CLOSED \/ IMPLEMENTED_VALIDATION_GATED \/ EVIDENCE_BOUNDED`/);
assert.match(stretch8, /new serverless function = false/);
assert.match(stretch8, /Stretch 9 authorization = CONDITIONAL_ON_SUCCESSFUL_STRETCH_8_VERCEL_SEAL/);
assert.match(closure, /lifecycle_run: 29514548484/);
assert.match(closure, /deployment_authorizes_transport: false/);
assert.match(closure, /Stretch_6_authorized: false/);

console.log('ash-lifecycle-production-contract.test.mjs passed');
