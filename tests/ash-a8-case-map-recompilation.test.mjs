import assert from 'node:assert/strict';
import fs from 'node:fs';

const core = fs.readFileSync(new URL('../app/dome-world/ash-a7-a11-recompiler-core.js', import.meta.url), 'utf8');
const source = fs.readFileSync(new URL('../app/dome-world/ash-a8-case-map-recompilation.js', import.meta.url), 'utf8');
const bridge = fs.readFileSync(new URL('../app/dome-world/ash-workspace-bridge.js', import.meta.url), 'utf8');
const handshake = fs.readFileSync(new URL('../scripts/run-ash-constitutional-convergence-handshake.mjs', import.meta.url), 'utf8');
const closureWorkflow = fs.readFileSync(new URL('../.github/workflows/ash-keep-production-closure.yml', import.meta.url), 'utf8');
const shell = fs.readFileSync(new URL('../api/dome-world-shell.js', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../app/dome-world/ash-keep.html', import.meta.url), 'utf8');
const mirror = fs.readFileSync(new URL('../app/dome-world/ash-keep-source.html', import.meta.url), 'utf8');
const vercel = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));

for (const marker of [
  'What are you placing?',
  'What is known',
  'What remains uncertain',
  'Preview waits for a plain name',
  'Add deliberately',
  'Object A —— choose relation ——> Object B',
  'Evidence/source',
  'Commit relationship',
  'Relationship inspection',
  'Graph view',
  'Notes and history',
  'Accessible table',
  'unresolved',
  'contradiction',
  'engine has no undirected relation state',
  'Storage confirmation remains pending',
  'Stored relationship confirmed',
  'Existing Ash action owner'
]) assert.ok(source.includes(marker), `A8 source missing ${marker}`);

for (const id of ['objectName','objectType','objectRoom','objectSource','addObject','linkFrom','linkTo','linkType','addRelationship','researchNotes']) assert.ok(source.includes(`'${id}'`), `A8 must delegate to existing ${id}`);
assert.match(source, /function delegateLegacyAction\(id\)/);
assert.match(source, /control\.dispatchEvent\(new MouseEvent\('click'/);
assert.match(source, /if \(control\.disabled\)/);
assert.match(source, /delegateLegacyAction\('addObject'\)/);
assert.match(source, /delegateLegacyAction\('addRelationship'\)/);
assert.doesNotMatch(source, /byId\('addObject'\)\?\.click\(\)/);
assert.doesNotMatch(source, /byId\('addRelationship'\)\?\.click\(\)/);
assert.match(source, /notes\.dispatchEvent\(new Event\('change'/);
assert.match(source, /table\.classList\.add\('active'\)/);
assert.match(source, /data-ash-a8-inspect-relation/);
assert.match(source, /id="ashA8RelationDetail"/);
assert.match(source, /root\.addEventListener\('click'/);
assert.doesNotMatch(source, /ashA8RelationDirection/);
assert.match(source, /source_bytes_moved:false/);
assert.match(source, /authority_changed:false/);
assert.doesNotMatch(source, /indexedDB\.(?:open|deleteDatabase)/);
assert.doesNotMatch(source, /fetch\s*\(/);
assert.doesNotMatch(source, /localStorage\.(?:setItem|removeItem|clear)/);
assert.doesNotMatch(source, /new\s+(?:Worker|SharedWorker)/);

assert.match(core, /function captureStageDrafts\(\)/);
assert.match(core, /function restoreStageDrafts\(draft\)/);
assert.match(core, /\.ash-stage-form input\[id\]/);
assert.match(core, /const draft = captureStageDrafts\(\)/);
assert.match(core, /const draftRestored = restoreStageDrafts\(draft\)/);
assert.match(core, /draft_restored:draftRestored/);
assert.match(core, /active\.focus\?\.\(\{ preventScroll:true \}\)/);
assert.doesNotMatch(core, /MutationObserver/);
assert.doesNotMatch(core, /localStorage\.(?:setItem|removeItem|clear)/);
assert.doesNotMatch(core, /indexedDB\.(?:open|deleteDatabase)/);

assert.match(bridge, /\.ash-flowcore-field--proxy \[data-aia-exact\]/);
assert.match(bridge, /removeAttribute\('data-aia-exact'\)/);
assert.match(handshake, /td613:ash:probe-contention-release:v1/);
assert.match(handshake, /RELEASE_FIRST_TAB/);
assert.match(handshake, /Second-tab contention request was not queued before first-tab release/);
assert.match(handshake, /Cross-tab lock witness exceeded 35000ms/);
assert.doesNotMatch(handshake, /setTimeout\(resolve, 240\)/);
assert.equal((closureWorkflow.match(/run-ash-constitutional-convergence-handshake\.mjs/g) || []).length >= 2, true);
assert.match(closureWorkflow, /node --check scripts\/run-ash-constitutional-convergence-handshake\.mjs/);
assert.match(shell, /ash-a8-case-map-recompilation\.js\?v=20260723-a8-v1/);
assert.match(html, /ash-a8-case-map-recompilation\.js/);
assert.equal(html, mirror, 'Ash source mirror must remain byte-identical');
assert.equal(vercel.git?.deploymentEnabled, false);

console.log(JSON.stringify({
  ok:true,
  schema:'td613.ash.a8-case-map-contract/v0.1',
  existing_map_engine_delegation:true,
  inert_owner_event_delegation:true,
  disabled_owner_respected:true,
  stage_form_draft_preservation:true,
  active_edit_focus_preserved:true,
  relation_workshop:true,
  directed_relation_truthful:true,
  notes_change_persistence:true,
  accessible_table:true,
  stored_relation_detail:true,
  proxy_inspection_selector_quarantined:true,
  explicit_cross_tab_handshake:true,
  background_timer_lock_release:false,
  authority_changed:false,
  source_bytes_moved:false,
  human_closure_required:true,
  vercel_gate:'CLOSED'
}, null, 2));
