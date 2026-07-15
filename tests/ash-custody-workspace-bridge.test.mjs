import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

import {
  ASH_LIFECYCLE_MODULE,
  ASH_WORKSPACE_BRIDGE_MODULE,
  bindAshDraftsToCaseMap,
  injectAshKeepLifecycle
} from '../api/dome-world-shell.js';
import {
  ASH_WORKSPACE_BRIDGE_VERSION,
  actionGateForLifecycleState,
  installAshWorkspaceBridge,
  registrationMatchesBoundReceipt
} from '../app/dome-world/ash-workspace-bridge.js';

assert.equal(ASH_WORKSPACE_BRIDGE_VERSION, 'td613.ash-keep.workspace-bridge/v0.4-exact-action-gates-hold-preservation');
assert.equal(ASH_WORKSPACE_BRIDGE_MODULE, '/dome-world/ash-workspace-bridge.js');

const keepHtml = fs.readFileSync('app/dome-world/ash-keep.html', 'utf8');
const renderedHtml = injectAshKeepLifecycle(keepHtml);
assert.match(renderedHtml, /src="\/dome-world\/ash-workspace-bridge\.js"/);
assert.ok(
  renderedHtml.indexOf(ASH_WORKSPACE_BRIDGE_MODULE) > renderedHtml.indexOf(ASH_LIFECYCLE_MODULE),
  'Custody bridge must load after lifecycle injection has created the late workspace tab'
);
assert.equal(injectAshKeepLifecycle(renderedHtml), renderedHtml, 'bridge composition must be idempotent');

const keepJs = fs.readFileSync('app/dome-world/ash-keep.js', 'utf8');
const rawKeepDraft = keepJs.match(/async function keepDraft\(\) \{[\s\S]*?\n\}/)?.[0] || '';
const rawMakeSave = keepJs.match(/async function makeSavePoint\(\) \{[\s\S]*?\n\}/)?.[0] || '';
assert.match(keepJs, /caseMapDigest: state\.caseMap\.case_map_digest/, 'raw Keep source should retain the unrelated Save Point digest use that exposed the scope collision');
assert.doesNotMatch(rawKeepDraft, /caseMapDigest:/, 'raw keepDraft fixture should begin without the lifecycle binding');
assert.doesNotMatch(rawMakeSave, /releaseReceiptReference:/, 'raw Save Point fixture should begin without the release binding');

const renderedJs = bindAshDraftsToCaseMap(keepJs);
const renderedKeepDraft = renderedJs.match(/async function keepDraft\(\) \{[\s\S]*?\n\}/)?.[0] || '';
const renderedMakeSave = renderedJs.match(/async function makeSavePoint\(\) \{[\s\S]*?\n\}/)?.[0] || '';
assert.match(renderedKeepDraft, /caseMapDigest: state\.caseMap\.case_map_digest/, 'Draft binding must be checked inside keepDraft rather than across the entire source file');
assert.equal((renderedKeepDraft.match(/caseMapDigest:/g) || []).length, 1, 'keepDraft must receive exactly one Case Map digest binding');
assert.match(renderedMakeSave, /releaseReceiptReference: state\.latestRelease\?\.receipt_id \|\| null/);
assert.match(renderedMakeSave, /releaseReceiptDigest: state\.latestRelease\?\.receipt_digest \|\| null/);
assert.match(renderedMakeSave, /releaseCreatedAt: state\.latestRelease\?\.created_at \|\| null/);
assert.match(renderedJs, /latestSavePoint\.release_created_at !== currentRelease\.created_at/);
assert.match(renderedJs, /window\.__td613OpenAshWorkspace = setWorkspace; \/\/ td613 late workspace bridge/);
assert.equal(bindAshDraftsToCaseMap(renderedJs), renderedJs, 'base workspace, Draft, and continuity transformations must be idempotent');

assert.equal(actionGateForLifecycleState('CASE_BOUND', 'draft').allowed, false);
assert.equal(actionGateForLifecycleState('REBUILD_ELIGIBLE', 'draft').allowed, true);
assert.equal(actionGateForLifecycleState('REBUILD_ELIGIBLE', 'save').allowed, false);
assert.equal(actionGateForLifecycleState('RELEASE_ELIGIBLE', 'save').allowed, true);
assert.equal(actionGateForLifecycleState('REBUILD_ELIGIBLE', 'local_release', { disabled: true }).allowed, false);
assert.equal(actionGateForLifecycleState('REBUILD_ELIGIBLE', 'local_release', { disabled: false }).allowed, true);

const dom = new JSDOM(`<!doctype html><body data-ash-lifecycle="READINESS_OBSERVED">
  <nav>
    <button class="work-tab" data-workspace="map" aria-selected="true">Map</button>
    <button class="work-tab" data-workspace="custody" aria-selected="false">Custody</button>
    <button class="work-tab" data-workspace="test" aria-selected="false">Test</button>
  </nav>
  <section class="workspace active" id="workspace-map"></section>
  <section class="workspace" id="workspace-custody">
    <p id="custodyStatus"></p>
    <div id="lifecycleHold">Held: CURRENT_REBUILD_TEST_ABSENT. Next: RUN_CURRENT_REBUILD_TEST.</div>
    <pre id="custodyReceipt">null</pre>
    <input id="lifeFile" type="file">
    <input id="lifeSourceLabel">
    <input id="lifePathRef">
    <select id="lifeSourceEnvironment"><option value="manual">manual</option></select>
    <select id="lifeCredentialType"><option value="none">none</option></select>
    <p id="lifeCommitmentStatus"></p>
    <button id="bindCustodyRoot">Bind verified root to current case</button>
    <button id="registerCustodyRoot">Register and verify root</button>
  </section>
  <section class="workspace active" id="workspace-draft"><button id="keepDraft">Keep Draft</button><button id="approveRelease" disabled>Keep Release Receipt</button></section>
  <section class="workspace active" id="workspace-save"><button id="makeSave">Seal Save Point</button></section>
  <section class="workspace" id="workspace-test"></section>
</body>`, { pretendToBeVisual: true });
const { window } = dom;
const { document } = window;
const opened = [];
window.__td613OpenAshWorkspace = name => {
  opened.push(name);
  document.querySelectorAll('.work-tab').forEach(button => {
    button.setAttribute('aria-selected', String(button.dataset.workspace === name));
  });
  document.querySelectorAll('.workspace').forEach(panel => {
    panel.classList.toggle('active', panel.id === `workspace-${name}`);
  });
};

let keptDrafts = 0;
let savedPoints = 0;
let boundRoots = 0;
document.getElementById('keepDraft').addEventListener('click', () => { keptDrafts += 1; });
document.getElementById('makeSave').addEventListener('click', () => { savedPoints += 1; });
document.getElementById('bindCustodyRoot').addEventListener('click', () => { boundRoots += 1; });

assert.equal(installAshWorkspaceBridge(document, window), true);
assert.equal(installAshWorkspaceBridge(document, window), false, 'bridge installation must be idempotent per document');

document.querySelector('[data-workspace="test"]').dispatchEvent(new window.MouseEvent('click', {
  bubbles: true,
  cancelable: true
}));
assert.deepEqual(opened, [], 'ordinary workspaces remain owned by the existing base tab listeners');

const custodyClick = new window.MouseEvent('click', { bubbles: true, cancelable: true });
document.querySelector('[data-workspace="custody"]').dispatchEvent(custodyClick);
assert.equal(custodyClick.defaultPrevented, true);
assert.deepEqual(opened, ['custody']);
assert.equal(document.querySelector('[data-workspace="custody"]').getAttribute('aria-selected'), 'true');
assert.equal(document.querySelector('#workspace-custody').classList.contains('active'), true);
assert.equal(document.querySelector('#workspace-map').classList.contains('active'), false);

const heldStatus = 'Test held · RUN_CURRENT_REBUILD_TEST.';
document.getElementById('custodyStatus').textContent = heldStatus;
document.querySelector('[data-workspace="custody"]').click();
assert.equal(document.getElementById('custodyStatus').textContent, heldStatus, 'programmatic Custody routing must preserve the lifecycle hold reason');

const heldDraftClick = new window.MouseEvent('click', { bubbles: true, cancelable: true });
document.getElementById('keepDraft').dispatchEvent(heldDraftClick);
assert.equal(heldDraftClick.defaultPrevented, true);
assert.equal(keptDrafts, 0, 'a restored Draft workspace cannot mutate before Rebuild eligibility');
assert.match(document.getElementById('custodyStatus').textContent, /Keep Draft held/);

document.body.dataset.ashLifecycle = 'REBUILD_ELIGIBLE';
document.getElementById('keepDraft').dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
assert.equal(keptDrafts, 1, 'Draft mutation resumes after the lifecycle gate opens');

const heldReleaseClick = new window.MouseEvent('click', { bubbles: true, cancelable: true });
document.getElementById('approveRelease').dispatchEvent(heldReleaseClick);
assert.equal(heldReleaseClick.defaultPrevented, true, 'a restored Draft workspace cannot bypass exact review readiness');
document.getElementById('approveRelease').disabled = false;
const allowedReleaseClick = new window.MouseEvent('click', { bubbles: true, cancelable: true });
document.getElementById('approveRelease').dispatchEvent(allowedReleaseClick);
assert.equal(allowedReleaseClick.defaultPrevented, false);

const heldSaveClick = new window.MouseEvent('click', { bubbles: true, cancelable: true });
document.getElementById('makeSave').dispatchEvent(heldSaveClick);
assert.equal(heldSaveClick.defaultPrevented, true);
assert.equal(savedPoints, 0, 'a stale Save workspace cannot seal continuity before release');

document.body.dataset.ashLifecycle = 'RELEASE_ELIGIBLE';
document.getElementById('makeSave').dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
assert.equal(savedPoints, 1);

document.body.dataset.ashLifecycle = 'CASE_BOUND';
const duplicateBind = new window.MouseEvent('click', { bubbles: true, cancelable: true });
document.getElementById('bindCustodyRoot').dispatchEvent(duplicateBind);
assert.equal(duplicateBind.defaultPrevented, true);
assert.equal(boundRoots, 0, 'an exact already-bound root cannot trigger a successor Case Map mutation');

document.body.dataset.ashLifecycle = 'CUSTODY_ROOT_VERIFIED';
document.getElementById('bindCustodyRoot').dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
assert.equal(boundRoots, 1, 'a newly selected verified root can still bind');

document.body.dataset.ashLifecycle = 'CASE_BOUND';
document.getElementById('lifeSourceLabel').value = 'Metadata root';
document.getElementById('lifePathRef').value = 'local:root';
document.getElementById('lifeSourceEnvironment').value = 'manual';
document.getElementById('lifeCredentialType').value = 'none';
document.getElementById('custodyReceipt').textContent = JSON.stringify({
  manifest: {
    source_environment: 'manual',
    source_locator: { label: 'Metadata root', path_or_ref: 'local:root' },
    artifact_metadata: { artifact_digest: null },
    credential_reference: { credential_type: 'none' }
  }
});
assert.equal(registrationMatchesBoundReceipt(document), true, 'identical L0 registration is recognized before another receipt is created');
document.getElementById('lifePathRef').value = 'local:new-root';
assert.equal(registrationMatchesBoundReceipt(document), false, 'changed metadata remains eligible for a new root');

const heldDom = new JSDOM('<button class="work-tab" data-workspace="custody">Custody</button>');
let held = null;
heldDom.window.document.addEventListener('td613:ash-keep:workspace-bridge-held', event => {
  held = event.detail;
});
installAshWorkspaceBridge(heldDom.window.document, heldDom.window);
heldDom.window.document.querySelector('button').dispatchEvent(new heldDom.window.MouseEvent('click', {
  bubbles: true,
  cancelable: true
}));
assert.equal(held?.reason, 'BASE_WORKSPACE_CAPABILITY_UNAVAILABLE');
assert.equal(held?.workspace, 'custody');

heldDom.window.close();
dom.window.close();
console.log('ash-custody-workspace-bridge.test.mjs passed');
