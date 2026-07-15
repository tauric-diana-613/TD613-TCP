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
const rawCore = read('app/dome-world/ash-keep.js');
const caseControls = read('app/dome-world/ash-case-controls.js');
const mapLabels = read('app/dome-world/ash-map-labels.js');
const keepSource = read('app/dome-world/ash-keep.html');
const deliverySource = read('app/dome-world/ash-keep-source.html');
const receipt = read('docs/ASH_LIFECYCLE_PRODUCTION_DEMO_RECEIPT.md');
const ledger = read('docs/ASH_KEEP_BUILDOUT_LEDGER.md');
const roadmap = read('ROADMAP.md');
const convergenceReceipt = read('docs/ASH_CONSTITUTIONAL_CONVERGENCE_RECEIPT.md');

function invokeShell(req) {
  const headers = new Map();
  let body = '';
  const res = { statusCode: 0, setHeader(name, value) { headers.set(String(name).toLowerCase(), String(value)); }, end(value = '') { body = String(value); } };
  handler(req, res);
  return { statusCode: res.statusCode, headers, body };
}

for (const marker of [
  /Ash Lifecycle Deployed Observation/,
  /Wait for deployed Ash lifecycle-composed threshold and Keep/,
  /threshold_body" \| grep -q 'name="ash-lifecycle" content="v0\.1"'/,
  /name="ash-lifecycle" content="v0\.1"/,
  /Observe deployed Ash lifecycle without promotion/,
  /node scripts\/ash-lifecycle-production-probe\.mjs/
]) assert.match(workflow, marker);
assert.doesNotMatch(workflow, /TD613 Ash · Threshold/, 'Deployed readiness must not require the retired standalone threshold title.');
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
assert.match(rawKeepDraft, /caseMapDigest: state\.caseMap\.case_map_digest/, 'canonical keepDraft must bind the current Case Map without shell rewriting');

assert.doesNotMatch(shell, /ASH_KEEP_ENTRY_ROUTE/);
assert.match(shell, /ASH_KEEP_JS_SHELL_VERSION = 'td613\.ash-keep\.js-shell\/v0\.4-native-bindings'/);
assert.match(shell, /ASH_KEEP_SHELL_VERSION = 'td613\.ash-keep\.shell\/v0\.2-canonical-composition'/);
assert.doesNotMatch(shell, /DRAFT_MARKER|DRAFT_BINDING|SAVE_POINT_MARKER|CAPSULE_MARKER/);
assert.match(shell, /caseMapDigest: state\.caseMap\.case_map_digest/);
assert.match(shell, /releaseReceiptReference: state\.latestRelease\?\.receipt_id \|\| null/);
assert.match(shell, /releaseReceiptDigest: state\.latestRelease\?\.receipt_digest \|\| null/);
assert.match(shell, /latestSavePoint\.release_receipt_reference !== currentRelease\.receipt_id/);
assert.match(shell, /ash-constitutional-composition/);
assert.match(shell, /ash-convergence\.js/);
assert.match(shell, /ash-native-core-contains-forced-reload/);
assert.doesNotMatch(rawCore, /location\.reload\(\)/);
assert.match(shell, /searchParams\.get\('arrival'\) === 'cleared'/);
assert.doesNotMatch(shell, /redirectAshKeepDocument/);
assert.match(probe, /const domeUrl = `\$\{base\}\/dome-world`/);
assert.match(probe, /page\.goto\(domeUrl/);
assert.match(probe, /\.tab\[data-view="ash"\]/);
assert.match(probe, /Selecting Ash redirected without an operator entry gesture/);
assert.match(probe, /\[data-ash-threshold-enter\]/);
assert.doesNotMatch(probe, /locator\('#ashTitle'\)|locator\('\.seal\[data-step/);
assert.equal(deliverySource, keepSource, 'Static delivery source drifted from the canonical Ash Keep document');
assert.match(adapter, /name="ash-delivery-adapter" content="v0\.1"/, 'The retired adapter may remain as a fallback artifact but cannot own the public route');
assert.match(keepSource, /<div class="launch" id="launch"[^>]*>/);
assert.match(keepSource, /<button class="btn primary" id="startDemo">Start a demo<\/button>/);
assert.match(keepSource, /<button class="btn gold" id="newCase">New case<\/button>/);
assert.match(keepSource, /id="saveCase"[^>]*>Save Case<\/button>/);
assert.match(keepSource, /id="closeCase"[^>]*>Close Case<\/button>/);
assert.match(keepSource, /id="selectCase" disabled/);
assert.match(keepSource, /\/dome-world\/ash-case-controls\.js/);
assert.match(caseControls, /td613\.ash-keep\.case-controls\/v1\.2/);
assert.match(caseControls, /savedCases/);
assert.match(caseControls, /DELETE_PARTIAL_HOLD/);
assert.doesNotMatch(caseControls, /location\.reload\(\)/);
assert.match(caseControls, /current unsaved/);
assert.match(caseControls, /open\.textContent = 'Open'/);
assert.match(caseControls, /remove\.textContent = 'Delete'/);
assert.match(mapLabels, /td613\.ash-keep\.map-labels\/v1\.0/);
assert.match(mapLabels, /td613\.ash-keep\.object-registry\/v1\.0/);
assert.match(mapLabels, /Object Registry/);
assert.match(mapLabels, /label_mode: 'overlay-only'/);
assert.match(mapLabels, /hover or tap for label/);
assert.doesNotMatch(mapLabels, /requestAnimationFrame\(/);

const arrivalOnly = invokeShell({ method: 'GET', url: '/api/dome-world-shell?arrival=cleared', query: { arrival: 'cleared' } });
assert.equal(arrivalOnly.statusCode, 200);
assert.equal(arrivalOnly.headers.get('location'), undefined);
assert.equal(arrivalOnly.headers.get('x-td613-ash-keep-shell'), 'td613.ash-keep.shell/v0.2-canonical-composition');
assert.match(arrivalOnly.body, /<div class="launch" id="launch"[^>]*>/);
assert.match(arrivalOnly.body, /\/dome-world\/ash-keep\.js/);
assert.doesNotMatch(arrivalOnly.body, /surface=ash-keep-js/);
assert.match(arrivalOnly.body, /\/dome-world\/ash-lifecycle\.js/);
assert.match(arrivalOnly.body, /\/dome-world\/ash-workspace-bridge\.js/);
assert.match(arrivalOnly.body, /\/dome-world\/ash-case-controls\.js/);
const explicitSurface = invokeShell({ method: 'GET', url: '/api/dome-world-shell?surface=ash-keep-html&arrival=cleared', query: { surface: 'ash-keep-html', arrival: 'cleared' } });
assert.equal(explicitSurface.statusCode, 200);
assert.equal(explicitSurface.headers.get('location'), undefined);
assert.match(explicitSurface.body, /<h2[^>]*>Ash Keep<\/h2>/);
const headSurface = invokeShell({ method: 'HEAD', url: '/api/dome-world-shell?surface=ash-keep-html', query: { surface: 'ash-keep-html' } });
assert.equal(headSurface.statusCode, 200);
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
assert.match(ledger, /I\. Ash operator surface and local case stewardship \| \*\*43 \/ 45\*\*/);
assert.match(ledger, /component maturity on main = 201 \/ 375/);
assert.match(ledger, /production-demonstrated workstreams = 3 \/ 9/);
assert.match(ledger, /# Constitutional Synthesis Matrix/);
assert.match(ledger, /Score: `47 \/ 50`/);
assert.match(ledger, /Stretch 1 · Ash Constitutional Convergence Closure[\s\S]*CLOSED \/ IMPLEMENTED_PRODUCTION_DEMONSTRATED/);
assert.match(ledger, /Stretch 2 · Custodian Return And Anisotropy[\s\S]*AWAITING_OPERATOR_APPROVAL \/ NOT_STARTED/);
assert.match(roadmap, /component maturity = 201 \/ 375/);
assert.match(roadmap, /constitutional synthesis = 47 \/ 50/);
assert.match(roadmap, /Stretch 1 · Ash Constitutional Convergence Closure — CLOSED/);
assert.match(roadmap, /Stretch 2 · Custodian Return And Anisotropy — AWAITING OPERATOR APPROVAL/);
assert.ok(roadmap.indexOf('Stretch 2 · Custodian Return And Anisotropy — AWAITING OPERATOR APPROVAL') < roadmap.indexOf('Choir calibration receipt binding'), 'Stretch 2 must remain the approval-gated packet before Choir calibration.');
assert.match(roadmap, /transport-capable workstreams = 0/);
assert.match(convergenceReceipt, /Status: `IMPLEMENTED_PRODUCTION_DEMONSTRATED`/);
assert.match(convergenceReceipt, /Source status: `DEPLOYED_OBSERVATION`/);
assert.match(convergenceReceipt, /29458943541/);
assert.match(convergenceReceipt, /8360435416/);
assert.match(convergenceReceipt, /Observer promotion authorized: `false`/);

console.log('ash-lifecycle-production-contract.test.mjs passed');
