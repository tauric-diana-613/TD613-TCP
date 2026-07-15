import assert from 'node:assert/strict';
import fs from 'node:fs';
import handler from '../api/dome-world-shell.js';

const read = path => fs.readFileSync(path, 'utf8');
const workflow = read('.github/workflows/ash-keep-production-closure.yml');
const probeRunner = read('scripts/ash-lifecycle-production-probe.mjs');
const probeBase = read('scripts/ash-lifecycle-production-probe-base.mjs');
const probe = `${probeRunner}\n${probeBase}`;
const shell = read('api/dome-world-shell.js');
const adapter = read('app/dome-world/ash-keep-entry.html');
const adapterJs = read('app/dome-world/ash-keep-entry.js');
const rawCore = read('app/dome-world/ash-keep.js');
const keepSource = read('app/dome-world/ash-keep.html');
const deliverySource = read('app/dome-world/ash-keep-source.html');
const receipt = read('docs/ASH_LIFECYCLE_PRODUCTION_DEMO_RECEIPT.md');
const ledger = read('docs/ASH_KEEP_BUILDOUT_LEDGER.md');
const roadmap = read('ROADMAP.md');

function invokeShell(req) {
  const headers = new Map();
  let body = '';
  const res = { statusCode: 0, setHeader(name, value) { headers.set(String(name).toLowerCase(), String(value)); }, end(value = '') { body = String(value); } };
  handler(req, res);
  return { statusCode: res.statusCode, headers, body };
}

for (const marker of [
  /Ash Lifecycle Deployed Observation/,
  /TD613 Ash · Threshold/,
  /name="ash-lifecycle" content="v0\.1"/,
  /Observe deployed Ash lifecycle without promotion/,
  /node scripts\/ash-lifecycle-production-probe\.mjs/
]) assert.match(workflow, marker);
const deployedJob = workflow.split('  deployed-observation:')[1] || '';
assert.doesNotMatch(deployedJob, /run-ash-keep-production-probe/);
assert.match(deployedJob, /CONTINUITY_SEALED/);
assert.match(deployedJob, /promotion remains separate/i);

for (const token of [
  'ARRIVAL_UNPERSISTED', 'READINESS_OBSERVED', 'CASE_BOUND', 'REBUILD_ELIGIBLE', 'RELEASE_ELIGIBLE', 'CONTINUITY_SEALED',
  'ash-custody-register', 'raw_artifact_in_request_body', 'provider_or_transport_requests',
  'ash-lifecycle-mobile-portrait.png', 'ash-lifecycle-mobile-landscape.png',
  'SYNTHETIC_DRAFT', 'draft_body_sha256', 'Synthetic draft entered a request body'
]) assert.ok(probe.includes(token), `Lifecycle probe omitted ${token}`);
assert.match(probeRunner, /ash-lifecycle-production-probe-base\.mjs/);
assert.match(probeRunner, /ash-lifecycle-production-probe\.runtime\.mjs/);
assert.match(probeRunner, /#draftBody/);
assert.match(probeRunner, /item\.body === SYNTHETIC_DRAFT/);
assert.match(probeRunner, /declared draft selection/);
assert.match(probe, /promotion_authorized: false/);
assert.match(probe, /readiness is not custody/);
assert.match(probe, /continuity is not transport/);

const rawKeepDraft = rawCore.match(/async function keepDraft\(\) \{[\s\S]*?\n\}/)?.[0] || '';
assert.match(rawCore, /caseMapDigest: state\.caseMap\.case_map_digest/, 'unrelated Save Point digest use must remain present in the raw core fixture');
assert.doesNotMatch(rawKeepDraft, /caseMapDigest:/, 'raw keepDraft must remain the declared transformation fixture');

assert.match(shell, /ASH_KEEP_ENTRY_ROUTE = '\/dome-world\/ash-keep-entry\.html'/);
assert.match(shell, /ASH_KEEP_JS_SHELL_VERSION = 'td613\.ash-keep\.js-shell\/v0\.2-review-refresh'/);
assert.match(shell, /if \(code\.includes\(DRAFT_MARKER\)\)/);
assert.match(shell, /else if \(!code\.includes\(DRAFT_BINDING\)\)/);
assert.doesNotMatch(shell, /if \(!code\.includes\('caseMapDigest: state\.caseMap\.case_map_digest'\)\)/);
assert.match(shell, /td613 lifecycle review refresh/);
assert.match(shell, /td613 late workspace bridge/);
assert.match(shell, /searchParams\.get\('arrival'\) === 'cleared'/);
assert.match(shell, /redirectAshKeepDocument/);
assert.equal(deliverySource, keepSource, 'Static delivery source drifted from the canonical Ash Keep document');
assert.match(adapter, /name="ash-delivery-adapter" content="v0\.1"/);
assert.match(adapter, /name="ash-lifecycle" content="v0\.1"/);
assert.match(adapterJs, /ash-keep-source\.html\?delivery=td613-static-v0\.1/);
assert.match(adapterJs, /ash-keep\.js\?delivery=td613-static-core-v0\.1/);
assert.match(adapterJs, /function governCore/);
assert.match(adapterJs, /if \(code\.includes\(DRAFT_MARKER\)\)/);
assert.match(adapterJs, /else if \(!code\.includes\(DRAFT_BINDING\)\)/);
assert.doesNotMatch(adapterJs, /if \(!code\.includes\('caseMapDigest: state\.caseMap\.case_map_digest'\)\)/);
assert.match(adapterJs, /Governed core omitted the Draft Case Map binding/);
assert.match(adapterJs, /td613 lifecycle review refresh/);
assert.match(adapterJs, /td613 late workspace bridge/);
assert.match(adapterJs, /data-td613-ash-core="governed-inline"/);
assert.match(adapterJs, /\/dome-world\/ash-workspace-bridge\.js/);
assert.match(adapterJs, /html = html\.replace\(CORE_SCRIPT, governedCore\)/);
assert.match(adapterJs, /html\.replace\(governedCore, `\$\{governedCore\}/);
assert.match(adapterJs, /document\.open\('text\/html', 'replace'\)/);
assert.doesNotMatch(adapterJs, /\/api\/dome-world-shell\?surface=ash-keep-js/);

const arrivalOnly = invokeShell({ method: 'GET', url: '/api/dome-world-shell?arrival=cleared', query: { arrival: 'cleared' } });
assert.equal(arrivalOnly.statusCode, 307);
assert.equal(arrivalOnly.headers.get('location'), '/dome-world/ash-keep-entry.html');
assert.equal(arrivalOnly.headers.get('x-td613-ash-keep-shell'), 'td613.ash-keep.shell/v0.1');
const explicitSurface = invokeShell({ method: 'GET', url: '/api/dome-world-shell?surface=ash-keep-html&arrival=cleared', query: { surface: 'ash-keep-html', arrival: 'cleared' } });
assert.equal(explicitSurface.statusCode, 307);
assert.equal(explicitSurface.headers.get('location'), '/dome-world/ash-keep-entry.html');
const headSurface = invokeShell({ method: 'HEAD', url: '/api/dome-world-shell?surface=ash-keep-html', query: { surface: 'ash-keep-html' } });
assert.equal(headSurface.statusCode, 307);
assert.equal(headSurface.body, '');

assert.match(receipt, /Status: `EARNED`/);
assert.match(receipt, /status: EARNED/);
assert.match(receipt, /promotion_authorized: true/);
assert.match(receipt, /promotion_scope: ASH_LIFECYCLE_MATURITY_ONLY/);
assert.match(receipt, /operator_closure: EVIDENCE_VERIFIED_AND_LIFECYCLE_MATURITY_PROMOTED/);
assert.match(receipt, /observed_commit: e8cbd00673e86d9fa0969407c28ef3ed89af55f7/);
assert.match(receipt, /upstream_deployment_workflow_run_id: 29383285733/);
assert.match(receipt, /observer_workflow_run_id: 29383294474/);
assert.match(receipt, /evidence_artifact_id: 8330532097/);
assert.match(receipt, /evidence_artifact_sha256: sha256:93c8c3992223af4524bf16d645de394333decd62b2ab65c88a1a7d1c4c68a249/);
assert.match(receipt, /terminal_commit_status_id: 50486516511/);
assert.match(receipt, /terminal_status_receipt_sha256: sha256:8d3602d2529f59ec39974280bfbde80746797168d646925bdc435277e7b90295/);
assert.match(receipt, /lifecycle_report_sha256: sha256:bf64b8b7ef9fd392672ab311690c395ad5ad1fe612ec32cd05bbb9396a270260/);
assert.match(receipt, /evidence_manifest_sha256: sha256:b5bd7e03c2dd3630703805d125900ee249b4b15ca30ed59cf1103803e982bdb7/);
for (const digest of [
  'sha256:e11bb2b191d7f46c7220cc74c78d7b011af55cefe7984c976c8ab27843f64003',
  'sha256:c1219446ed79238317b0465df05dccb07370008f63194fd842c4d63ca7362ccc',
  'sha256:2a4318cf7bb704aad07bd9f9aa7403902333bf07edf0ec35f67002bd3469e159',
  'sha256:4e2cc03f37e7ff08c15d17d234a9af62c58c2f7678a425efed3845048d378a34'
]) assert.ok(receipt.includes(digest), `Lifecycle promotion receipt omitted screenshot digest ${digest}`);
assert.match(receipt, /CONTINUITY_SEALED/);
assert.match(receipt, /raw_artifact_in_request_body: false/);
assert.match(receipt, /provider_or_transport_requests: \[\]/);
assert.match(receipt, /lifecycle maturity promotion ≠ transport authorization/);

assert.match(ledger, /H\. Ash product lifecycle orchestration \| \*\*35 \/ 35\*\*/);
assert.match(ledger, /main = 158 \/ 330/);
assert.match(ledger, /production-demonstrated workstreams = 2 \/ 8/);
assert.match(ledger, /Status: `IMPLEMENTED_PRODUCTION_DEMONSTRATED`/);
assert.match(ledger, /Choir calibration receipt binding/);
assert.match(roadmap, /Ash lifecycle = 35 \/ 35 · production-demonstrated/);
assert.match(roadmap, /full bounded program = 158 \/ 330/);
assert.match(roadmap, /Choir calibration receipt binding \[NEXT\]/);
assert.match(roadmap, /lifecycle production closure \[CLOSED\]/);
assert.match(roadmap, /transport-capable workstreams = 0/);

console.log('ash-lifecycle-production-contract.test.mjs passed');
