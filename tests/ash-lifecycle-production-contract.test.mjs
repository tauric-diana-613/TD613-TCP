import assert from 'node:assert/strict';
import fs from 'node:fs';
import handler from '../api/dome-world-shell.js';

const read = path => fs.readFileSync(path, 'utf8');
const workflow = read('.github/workflows/ash-keep-production-closure.yml');
const probe = `${read('scripts/ash-lifecycle-production-probe.mjs')}\n${read('scripts/ash-lifecycle-production-probe-base.mjs')}`;
const shell = read('api/dome-world-shell.js');
const core = read('app/dome-world/ash-keep.js');
const controls = read('app/dome-world/ash-case-controls.js');
const keep = read('app/dome-world/ash-keep.html');
const delivery = read('app/dome-world/ash-keep-source.html');
const receipt = read('docs/ASH_LIFECYCLE_PRODUCTION_DEMO_RECEIPT.md');
const ledger = read('docs/ASH_KEEP_BUILDOUT_LEDGER.md');
const roadmap = read('ROADMAP.md');
const convergence = read('docs/ASH_CONSTITUTIONAL_CONVERGENCE_RECEIPT.md');
const hushReceipt = read('docs/ASH_KEEP_HUSH_INTERVENTION_RECEIPT.md');

for (const marker of [
  'Ash Lifecycle Deployed Observation', 'Wait for deployed Ash lifecycle-composed threshold and Keep',
  'Observe deployed Ash lifecycle without promotion', 'Observe deployed constitutional convergence without promotion'
]) assert.match(workflow, new RegExp(marker));
assert.doesNotMatch(workflow, /TD613 Ash · Threshold/);
const deployed = workflow.split('  deployed-observation:')[1] || '';
assert.doesNotMatch(deployed, /run-ash-keep-production-probe/);
assert.match(deployed, /CONTINUITY_SEALED/);
assert.match(deployed, /promotion remains separate/i);

for (const token of [
  'ARRIVAL_UNPERSISTED', 'READINESS_OBSERVED', 'CASE_BOUND', 'REBUILD_ELIGIBLE',
  'RELEASE_ELIGIBLE', 'CONTINUITY_SEALED', 'raw_artifact_in_request_body',
  'provider_or_transport_requests', 'SYNTHETIC_DRAFT', 'draft_body_sha256'
]) assert.ok(probe.includes(token), `Lifecycle probe omitted ${token}`);
assert.match(probe, /promotion_authorized: false/);
assert.match(probe, /readiness is not custody/);
assert.match(probe, /continuity is not transport/);

assert.match(shell, /ASH_KEEP_JS_SHELL_VERSION = 'td613\.ash-keep\.js-shell\/v0\.4-native-bindings'/);
assert.match(shell, /ASH_KEEP_SHELL_VERSION = 'td613\.ash-keep\.shell\/v0\.2-canonical-composition'/);
assert.match(shell, /caseMapDigest: state\.caseMap\.case_map_digest/);
assert.match(shell, /ash-constitutional-composition/);
assert.doesNotMatch(core, /location\.reload\(\)/);
assert.equal(delivery, keep);
assert.match(keep, /\/dome-world\/ash-lifecycle\.js/);
assert.match(controls, /DELETE_PARTIAL_HOLD/);
assert.doesNotMatch(controls, /location\.reload\(\)/);

function invoke(req) {
  const headers = new Map();
  let body = '';
  const res = { statusCode: 0, setHeader(name, value) { headers.set(String(name).toLowerCase(), String(value)); }, end(value = '') { body = String(value); } };
  handler(req, res);
  return { statusCode: res.statusCode, headers, body };
}
const rendered = invoke({ method: 'GET', url: '/api/dome-world-shell?arrival=cleared', query: { arrival: 'cleared' } });
assert.equal(rendered.statusCode, 200);
assert.equal(rendered.headers.get('x-td613-ash-keep-shell'), 'td613.ash-keep.shell/v0.2-canonical-composition');
assert.match(rendered.body, /\/dome-world\/ash-lifecycle\.js/);

for (const token of [
  'Status: `EARNED`', 'promotion_authorized: true',
  'promotion_scope: ASH_LIFECYCLE_MATURITY_ONLY', 'CONTINUITY_SEALED',
  'raw_artifact_in_request_body: false', 'provider_or_transport_requests: []'
]) assert.ok(receipt.includes(token), `Lifecycle receipt omitted ${token}`);
assert.match(receipt, /observed_commit: e8cbd00673e86d9fa0969407c28ef3ed89af55f7/);
assert.match(receipt, /observer_workflow_run_id: 29383294474/);
assert.match(receipt, /evidence_artifact_id: 8330532097/);

assert.match(ledger, /H\. Ash product lifecycle orchestration \| \*\*35 \/ 35\*\*/);
assert.match(ledger, /I\. Ash operator surface and local case stewardship \| \*\*43 \/ 45\*\*/);
assert.match(ledger, /C\. Hush derivative and intervention program \| \*\*28 \/ 35\*\*/);
assert.match(ledger, /component maturity after Stretch 4 closure = 258 \/ 375/);
assert.match(ledger, /validation-gated workstreams = 2 \/ 9/);
assert.match(ledger, /Score: `48 \/ 50`|constitutional synthesis = 48 \/ 50/);
assert.match(ledger, /Stretch 4 · Hush Vocabulary Externalization And Lifecycle-Bound Intervention Ensemble[\s\S]*CLOSED \/ IMPLEMENTED_VALIDATION_GATED/);
assert.match(roadmap, /Hush vocabulary externalization and intervention ensemble — CLOSED/);
assert.match(roadmap, /Aperture composition renovation before Choir UI — BLOCKED \/ NOT AUTHORIZED/);
assert.match(roadmap, /transport-capable workstreams = 0/);
assert.match(convergence, /Status: `IMPLEMENTED_PRODUCTION_DEMONSTRATED`/);
assert.match(convergence, /29458943541/);
assert.match(hushReceipt, /Hush_validation_run: 29483240258/);
assert.match(hushReceipt, /Stretch_5_authorized: false/);

console.log('ash-lifecycle-production-contract.test.mjs passed');
