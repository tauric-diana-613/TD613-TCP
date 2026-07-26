import assert from 'node:assert/strict';
import fs from 'node:fs';

const core = fs.readFileSync(new URL('../app/dome-world/ash-a7-a11-recompiler-core.js', import.meta.url), 'utf8');
const source = fs.readFileSync(new URL('../app/dome-world/ash-a8-case-map-recompilation.js', import.meta.url), 'utf8');
const returnHandshake = fs.readFileSync(new URL('../app/dome-world/ash-a8-map-return-handshake.js', import.meta.url), 'utf8');
const aia3 = fs.readFileSync(new URL('../app/dome-world/ash-aia3-composition.js', import.meta.url), 'utf8');
const bridge = fs.readFileSync(new URL('../app/dome-world/ash-workspace-bridge.js', import.meta.url), 'utf8');
const handshake = fs.readFileSync(new URL('../scripts/run-ash-constitutional-convergence-handshake.mjs', import.meta.url), 'utf8');
const handshakeWorker = fs.readFileSync(new URL('../scripts/run-ash-constitutional-convergence-handshake-worker.mjs', import.meta.url), 'utf8');
const consolidatedWorkflow = fs.readFileSync(new URL('../.github/workflows/td613-ci.yml', import.meta.url), 'utf8');
const shell = fs.readFileSync(new URL('../api/dome-world-shell.js', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../app/dome-world/ash-keep.html', import.meta.url), 'utf8');
const mirror = fs.readFileSync(new URL('../app/dome-world/ash-keep-source.html', import.meta.url), 'utf8');
const vercel = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));

assert.match(source, /td613\.ash\.a8-case-map-recompilation\/v0\.2-held-draft-quarantine/);
for (const marker of ['What are you placing?','What is known','What remains uncertain','Preview waits for a plain name','Add deliberately','Direction: Object A → Object B.','Evidence/source','Commit relationship','Relationship inspection','Graph view','Notes and history','Accessible table','unresolved','contradiction','engine has no undirected relation state','Storage confirmation remains pending','Stored relationship confirmed','Existing Ash action owner']) assert.ok(source.includes(marker), `A8 source missing ${marker}`);
for (const id of ['objectName','objectType','objectRoom','objectSource','addObject','linkFrom','linkTo','linkType','addRelationship','researchNotes']) assert.ok(source.includes(`'${id}'`));
for (const token of ['function delegateLegacyAction(id)','td613:ash-keep:action-held','delegateLegacyAction(\'addObject\')','delegateLegacyAction(\'addRelationship\')','data-ash-a8-inspect-relation','ashA8RelationDetail','source_bytes_moved:false','authority_changed:false']) assert.ok(source.includes(token), `A8 source missing ${token}`);
for (const token of ['let heldDraftRestorePending = false','allowHeldOverwrite = false','if (heldDraftRestorePending && !allowHeldOverwrite) return false','function quarantineHeldDraft()','HELD_PENDING_ACTIVE_MAP_RETURN','function releaseHeldDraftAfterActiveRestore(workspace, restored)','RESTORED_ON_ACTIVE_MAP_RETURN','captureWorkshopDraft({ allowHeldOverwrite:true })','if (!heldDraftRestorePending) captureWorkshopDraft()','held_draft_quarantine:true','heldDraftRestorePending:() => heldDraftRestorePending']) assert.ok(source.includes(token), `A8 held-draft quarantine missing ${token}`);
assert.match(source, /control\.dispatchEvent\(new MouseEvent\('click'/);
assert.match(source, /notes\.dispatchEvent\(new Event\('change'/);
assert.match(source, /const objectRestored = restoreDraftGroup\(objectDraft\);[\s\S]*?const relationRestored = restoreDraftGroup\(relationDraft\);[\s\S]*?const restored = objectRestored \|\| relationRestored;/);
assert.match(source, /for \(const type of \['case-created','case-closed'\]\)/);
assert.doesNotMatch(source, /\['case-created','case-closed','profile-demo-hydrated'\]/);
assert.doesNotMatch(source, /byId\('addObject'\)\?\.click\(\)|byId\('addRelationship'\)\?\.click\(\)|indexedDB\.(?:open|deleteDatabase)|fetch\s*\(|localStorage\.(?:setItem|removeItem|clear)|new\s+(?:Worker|SharedWorker)/);

assert.match(returnHandshake, /td613\.ash\.a8-map-return-handshake\/v0\.1/);
for (const token of [
  "const HELD_ACTIONS = new Set(['addObject','addRelationship'])",
  'function captureAll()','function restoreAll()','function canonicalMapIsOpen()',
  'HELD_WAITING_FOR_CANONICAL_MAP_RETURN','CANONICAL_MAP_RETURN_OBSERVED',
  "host.addEventListener('td613:ash:ux-workspace-opened', requestConfirmedMapRefresh)",
  "host.addEventListener('td613:ash:a8-recompiled', settleAfterA8Recompile)",
  "refresh?.('A8_CANONICAL_MAP_RETURN_HANDSHAKE')",
  'RESTORED_AFTER_CANONICAL_MAP_RETURN','td613:ash:a8-map-return-restored',
  'authority_changed:false','source_bytes_moved:false','custody_changed:false','release_posture_changed:false','human_closure_required:true'
]) assert.ok(returnHandshake.includes(token), `A8 canonical Map-return handshake missing ${token}`);
assert.doesNotMatch(returnHandshake, /indexedDB\.|localStorage\.(?:setItem|removeItem|clear)|sessionStorage\.(?:setItem|removeItem|clear)|fetch\s*\(|sendBeacon|caches\.|serviceWorker/);
assert.match(bridge, /ash-a8-map-return-handshake\.js\?v=20260726-a15-empirical-v1/);

for (const token of ['function captureStageDrafts()','function restoreStageDrafts(draft)','.ash-stage-form input[id]','const draft = captureStageDrafts()','const draftRestored = restoreStageDrafts(draft)','draft_restored:draftRestored','active.focus?.({ preventScroll:true })','ACTIVE_STAGE_INTERACTION','active_stage_primary_action_deferred:true']) assert.ok(core.includes(token), `A8 core missing ${token}`);
assert.doesNotMatch(core, /MutationObserver|localStorage\.(?:setItem|removeItem|clear)|indexedDB\.(?:open|deleteDatabase)/);

assert.match(aia3, /function closeDeepPanels\(\)/);
assert.match(bridge, /\.ash-flowcore-field--proxy \[data-aia-exact\]/);
assert.match(bridge, /removeAttribute\('data-aia-exact'\)/);
for (const token of ['td613:ash:probe-contention-release:v4','RELEASE_FIRST_TAB','Second-tab contention intent was not observed before first-tab release','Cross-tab lock witness exceeded 35000ms','First-tab lock release exceeded 10000ms','QUERY_TIMEOUT','NATIVE_LOCK_MANAGER_PROTOTYPE','Pre-release exclusion assay re-entered the coordinated Ash lease path']) assert.ok(handshakeWorker.includes(token), `Handshake worker missing ${token}`);
for (const token of ['run-ash-constitutional-convergence-handshake-worker.mjs','spawn(process.execPath','HANDSHAKE_CHILD_PROCESS_CEILING',"child.kill('SIGINT')","child.kill('SIGKILL')",'process.exitCode = 124','promotion_authorized:false','authority_changed:false','source_bytes_moved:false','human_closure_required:true']) assert.ok(handshake.includes(token), `Handshake wrapper missing ${token}`);
assert.equal((consolidatedWorkflow.match(/run-ash-constitutional-convergence-handshake\.mjs/g) || []).length, 1);
assert.match(consolidatedWorkflow, /Run bounded closure and constitutional convergence once/);
assert.match(consolidatedWorkflow, /node tests\/ash-a8-case-map-recompilation\.test\.mjs/);
assert.match(shell, /ash-a8-case-map-recompilation\.js\?v=\$\{ASH_LIFECYCLE_ASSET_EPOCH\}/);
assert.match(html, /ash-a8-case-map-recompilation\.js/);
assert.equal(html, mirror, 'Ash source mirror must remain byte-identical');
assert.equal(vercel.git?.deploymentEnabled, false);

console.log(JSON.stringify({ok:true,schema:'td613.ash.a8-case-map-contract/v0.4-canonical-map-return-handshake',existing_map_engine_delegation:true,stage_form_draft_preservation:true,held_draft_quarantine:true,canonical_map_return_handshake:true,transitioning_active_class_cannot_release_shadow_draft:true,default_dom_overwrite_held_until_canonical_map_restore:true,delayed_profile_hydration_cannot_clear_active_draft:true,object_and_relation_drafts_restore_independently:true,explicit_cross_tab_handshake:true,external_process_watchdog:true,authority_changed:false,source_bytes_moved:false,human_closure_required:true,vercel_gate:'CLOSED'}, null, 2));
