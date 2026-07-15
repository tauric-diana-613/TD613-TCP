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
  installAshWorkspaceBridge
} from '../app/dome-world/ash-workspace-bridge.js';

assert.equal(ASH_WORKSPACE_BRIDGE_VERSION, 'td613.ash-keep.workspace-bridge/v0.3-hold-preservation');
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
assert.match(keepJs, /caseMapDigest: state\.caseMap\.case_map_digest/, 'raw Keep source should retain the unrelated Save Point digest use that exposed the scope collision');
assert.doesNotMatch(rawKeepDraft, /caseMapDigest:/, 'raw keepDraft fixture should begin without the lifecycle binding');

const renderedJs = bindAshDraftsToCaseMap(keepJs);
const renderedKeepDraft = renderedJs.match(/async function keepDraft\(\) \{[\s\S]*?\n\}/)?.[0] || '';
assert.match(renderedKeepDraft, /caseMapDigest: state\.caseMap\.case_map_digest/, 'Draft binding must be checked inside keepDraft rather than across the entire source file');
assert.equal((renderedKeepDraft.match(/caseMapDigest:/g) || []).length, 1, 'keepDraft must receive exactly one Case Map digest binding');
assert.match(renderedJs, /releaseReceiptReference: state\.latestRelease\?\.receipt_id \|\| null/);
assert.match(renderedJs, /releaseReceiptDigest: state\.latestRelease\?\.receipt_digest \|\| null/);
assert.match(renderedJs, /latestSavePoint\.release_receipt_reference !== currentRelease\.receipt_id/);
assert.match(renderedJs, /window\.__td613OpenAshWorkspace = setWorkspace; \/\/ td613 late workspace bridge/);
assert.equal(bindAshDraftsToCaseMap(renderedJs), renderedJs, 'base workspace, Draft, Save Point, and Capsule transformations must be idempotent');

const dom = new JSDOM(`<!doctype html><body data-ash-lifecycle="ARRIVAL_UNPERSISTED">
  <nav>
    <button class="work-tab" data-workspace="map" aria-selected="true">Map</button>
    <button class="work-tab" data-workspace="custody" aria-selected="false">Custody</button>
    <button class="work-tab" data-workspace="test" aria-selected="false">Test</button>
  </nav>
  <section class="workspace active" id="workspace-map"></section>
  <section class="workspace" id="workspace-custody"><p id="custodyStatus"></p></section>
  <section class="workspace" id="workspace-test"></section>
  <button id="keepDraft">Keep Draft</button>
  <button id="makeSave">Make Save Point</button>
  <button id="bindCustodyRoot">Bind verified root</button>
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

opened.length = 0;
let heldAction = null;
document.addEventListener('td613:ash-keep:action-held', event => { heldAction = event.detail; });
const heldDraftClick = new window.MouseEvent('click', { bubbles: true, cancelable: true });
document.getElementById('keepDraft').dispatchEvent(heldDraftClick);
assert.equal(heldDraftClick.defaultPrevented, true, 'a restored Draft workspace cannot bypass its lifecycle gate');
assert.equal(heldAction?.action_id, 'keepDraft');
assert.equal(heldAction?.required_state, 'REBUILD_ELIGIBLE');
assert.deepEqual(opened, ['custody']);

document.body.dataset.ashLifecycle = 'REBUILD_ELIGIBLE';
const allowedDraftClick = new window.MouseEvent('click', { bubbles: true, cancelable: true });
document.getElementById('keepDraft').dispatchEvent(allowedDraftClick);
assert.equal(allowedDraftClick.defaultPrevented, false);

const heldSaveClick = new window.MouseEvent('click', { bubbles: true, cancelable: true });
document.getElementById('makeSave').dispatchEvent(heldSaveClick);
assert.equal(heldSaveClick.defaultPrevented, true, 'Save Point creation remains held until a current release exists');

document.body.dataset.ashLifecycle = 'RELEASE_ELIGIBLE';
const allowedSaveClick = new window.MouseEvent('click', { bubbles: true, cancelable: true });
document.getElementById('makeSave').dispatchEvent(allowedSaveClick);
assert.equal(allowedSaveClick.defaultPrevented, false);

document.body.dataset.ashLifecycle = 'CASE_BOUND';
let rebindNoop = null;
document.addEventListener('td613:ash-keep:custody-rebind-noop', event => { rebindNoop = event.detail; });
const rebindClick = new window.MouseEvent('click', { bubbles: true, cancelable: true });
document.getElementById('bindCustodyRoot').dispatchEvent(rebindClick);
assert.equal(rebindClick.defaultPrevented, true);
assert.equal(rebindNoop?.state, 'CASE_BOUND');
assert.match(document.getElementById('custodyStatus').textContent, /already bound/i);

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
