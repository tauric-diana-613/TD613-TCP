import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

import {
  ASH_WORKSPACE_NAVIGATION_VERSION,
  installAshWorkspaceNavigation
} from '../app/dome-world/ash-workspace-navigation.js';

const dom = new JSDOM(`<!doctype html><html><head></head><body data-ash-lifecycle="ARRIVAL_UNPERSISTED">
  <nav class="workspace-rail">
    <button class="work-tab" data-workspace="map">Map</button>
    <button class="work-tab" data-workspace="save">Save</button>
  </nav>
  <main>
    <section class="workspace active" id="workspace-map"><div class="workspace-head"></div></section>
    <section class="workspace" id="workspace-save"><div class="workspace-head"></div><input id="capsuleFile" type="file"></section>
  </main>
  <div class="launch" id="launch"><section class="launch-panel">
    <input id="newTitle">
    <div class="actions"><button id="startDemo">Start Demo</button><button id="newCase">New case</button></div>
  </section></div>
</body></html>`, {
  pretendToBeVisual:true,
  url:'https://td613.test/dome-world/ash-keep.html'
});

const { document } = dom.window;
const opened = [];
dom.window.__td613OpenAshWorkspace = workspace => {
  opened.push(workspace);
  document.querySelectorAll('.workspace').forEach(panel => panel.classList.toggle('active', panel.id === `workspace-${workspace}`));
};

assert.equal(installAshWorkspaceNavigation(document, dom.window), true);
assert.equal(ASH_WORKSPACE_NAVIGATION_VERSION, 'td613.ash-keep.workspace-navigation/v1.1-capsule-recovery-entry');
assert.ok(document.getElementById('openCapsuleRecovery'));
assert.equal(document.querySelectorAll('#capsuleRecoveryLaunchDescription').length, 1);
assert.ok(dom.window.__td613AshWorkspaceNavigation?.refresh, 'Navigation owner must expose explicit recomposition.');

const actions = document.querySelector('#launch .actions');
const left = document.createElement('div');
left.className = 'launch-action-group launch-action-group-left';
left.append(document.getElementById('startDemo'), document.getElementById('newCase'));
const right = document.createElement('div');
right.className = 'launch-action-group launch-action-group-right';
right.append(document.createElement('button'), document.createElement('button'));
actions.replaceChildren(left, right);

assert.equal(document.getElementById('openCapsuleRecovery'), null, 'Synthetic recomposition should prove the entry was removed before explicit repair.');
await new Promise(resolve => dom.window.setTimeout(resolve, 0));
assert.equal(document.getElementById('openCapsuleRecovery'), null, 'A body-wide observer silently reconstructed the membrane.');
dom.window.__td613AshWorkspaceNavigation.refresh();

const restored = document.getElementById('openCapsuleRecovery');
assert.ok(restored, 'Explicit navigation-owner refresh did not restore encrypted Capsule recovery.');
assert.equal(restored.parentElement, left, 'Recovery entry was not re-homed into the composed launch action group.');
assert.equal(document.querySelectorAll('#openCapsuleRecovery').length, 1, 'Recovery entry duplicated during explicit recomposition.');
assert.equal(document.querySelectorAll('#capsuleRecoveryLaunchDescription').length, 1, 'Recovery description duplicated during explicit recomposition.');

restored.dispatchEvent(new dom.window.MouseEvent('click', { bubbles:true, cancelable:true }));
assert.equal(document.getElementById('launch').classList.contains('hidden'), true);
assert.equal(document.getElementById('workspace-save').classList.contains('active'), true);
assert.equal(opened.at(-1), 'save');
assert.equal(document.querySelector('.capsule-recovery-navigation').hidden, false);

const navigationSource = await import('node:fs').then(fs => fs.readFileSync('app/dome-world/ash-workspace-navigation.js', 'utf8'));
assert.doesNotMatch(navigationSource, /new\s+host\.MutationObserver/, 'Navigation must not watch and reconstruct the whole body.');

dom.window.close();
console.log('ash-capsule-recovery-entry.test.mjs passed');
