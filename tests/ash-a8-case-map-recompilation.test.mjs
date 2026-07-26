import assert from 'node:assert/strict';
import fs from 'node:fs';

const core = fs.readFileSync(new URL('../app/dome-world/ash-a7-a11-recompiler-core.js', import.meta.url), 'utf8');
const source = fs.readFileSync(new URL('../app/dome-world/ash-a8-case-map-recompilation.js', import.meta.url), 'utf8');
const returnHandshake = fs.readFileSync(new URL('../app/dome-world/ash-a8-map-return-handshake.js', import.meta.url), 'utf8');
const dirtyGuard = fs.readFileSync(new URL('../app/dome-world/ash-a8-dirty-draft-recompile-guard.js', import.meta.url), 'utf8');
const a7a11Probe = fs.readFileSync(new URL('../scripts/ash-a7-a11-browser-probe.mjs', import.meta.url), 'utf8');
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

assert.match(returnHandshake, /td613\.ash\.a8-map-return-handshake\/v0\.2-prehold-shadow/);
for (const token of [
  "const HELD_ACTIONS = new Set(['addObject','addRelationship'])",
  "const COMMIT_SELECTOR = '#ashA8CommitObject,#ashA8CommitRelation'",
  "const MAP_DOCK_SELECTOR = '#premiumPrimaryDock [data-premium-workspace=\"map\"]'",
  "const FINAL_REFRESH_SOURCE = 'A8_MAP_RETURN_SETTLEMENT'",
  'const SETTLEMENT_QUIET_MS = 150','function ensureStyles()','function captureAll()','function restoreAll()','function canonicalMapIsOpen()',
  'let alignmentObserved = false','let finalRefreshRequested = false','let finalInstrumentRefreshObserved = false','let postRefreshA8RecompileObserved = false',
  'function captureBeforeCommit(event)','event.target?.closest?.(COMMIT_SELECTOR)','PREHOLD_COMMIT_SHADOW_CAPTURED',
  "doc.addEventListener('click', captureBeforeCommit, true)",
  'expected:draft.size','matched === draft.size','complete:draft.size > 0',
  'PREHOLD_DRAFT_CAPTURED','held = draft.size > 0','HELD_WITH_PREHOLD_DRAFT','HELD_WITHOUT_PREHOLD_DRAFT',
  'MAP_RETURN_SETTLING','MAP_RETURN_RESTORE_HELD','MAP_RETURN_PARITY_WAITING_ALIGNMENT','MAP_RETURN_PARITY_WAITING_FINAL_INSTRUMENT_REFRESH',
  'MAP_RETURN_ALIGNMENT_REQUEST_HELD','MAP_RETURN_ALIGNMENT_REQUESTED',
  'MAP_RETURN_REQUESTING_FINAL_INSTRUMENT_REFRESH','MAP_RETURN_FINAL_INSTRUMENT_REFRESH_OBSERVED','MAP_RETURN_EXTERNAL_INSTRUMENT_REFRESH_OBSERVED','MAP_RETURN_FINAL_OWNER_PARITY_OBSERVED',
  'data-ash-a8-map-return-handshake^="MAP_RETURN_"','function clearSettlementTimer()','function resetFinalRefreshState()','function requestCanonicalMapAlignment(serial)','function requestFinalInstrumentRefresh()','function observeWholeInstrumentRefresh(event)','function finalizeSettlement(serial)','function scheduleFinalSettlement()','function observeMapAlignment(event)',
  'host?.__td613AshUiUxRescue','owner.scrollTo(\'map\') !== true','.then(() => requestCanonicalMapAlignment(serial))',
  'function observeTrustedCanonicalMapGesture(event)','event.isTrusted !== true','event.target?.closest?.(MAP_DOCK_SELECTOR)',
  "source_control:'PRIMARY_DOCK_TRUSTED_WINDOW_CAPTURE'",'idempotent_return_admitted:true',
  'if (mapReturnObserved) return true',
  "host.addEventListener('click', observeTrustedCanonicalMapGesture, true)",
  "host.addEventListener('td613:ash:ux-workspace-opened', requestConfirmedMapRefresh)",
  "host.addEventListener('td613:ash:ux-workspace-aligned', observeMapAlignment)",
  "host.addEventListener('td613:ash:whole-instrument-refreshed', observeWholeInstrumentRefresh)",
  "host.addEventListener('td613:ash:a8-recompiled', settleAfterA8Recompile)",
  "refresh?.('A8_CANONICAL_MAP_RETURN_HANDSHAKE')",
  'owner.refresh(FINAL_REFRESH_SOURCE)','event.detail?.source === FINAL_REFRESH_SOURCE',
  'RESTORED_AFTER_CANONICAL_MAP_RETURN','td613:ash:a8-map-return-restored','PREHOLD_VISIBLE_COMMIT_CAPTURE',
  'precommit_shadow_capture:true','canonical_map_gesture_observed:true','trusted_window_capture:true','idempotent_map_return_admitted:true','canonical_map_alignment_observed:true',"alignment_owner:'ASH_UI_UX_RESCUE'",'final_whole_instrument_refresh_observed:true','a8_recompiled_after_final_refresh:true','full_control_parity:true','quiet_window_ms:SETTLEMENT_QUIET_MS','workshop_visible_after_restore:true',
  'final_refresh_requested:finalRefreshRequested','final_instrument_refresh_observed:finalInstrumentRefreshObserved','post_refresh_a8_recompile_observed:postRefreshA8RecompileObserved',
  'authority_changed:false','source_bytes_moved:false','custody_changed:false','release_posture_changed:false','human_closure_required:true'
]) assert.ok(returnHandshake.includes(token), `A8 canonical Map-return handshake missing ${token}`);
assert.match(returnHandshake, /function captureBeforeCommit\(event\)[\s\S]{0,260}captureAll\(\)/, 'A8 must capture all visible fields immediately before the delegated commit.');
assert.match(returnHandshake, /function observeTrustedCanonicalMapGesture\(event\)[\s\S]{0,320}event\.isTrusted !== true[\s\S]{0,180}MAP_DOCK_SELECTOR[\s\S]{0,360}idempotent_return_admitted:true/, 'Only the trusted canonical primary-dock Map gesture may admit an idempotent return.');
assert.match(returnHandshake, /function requestConfirmedMapRefresh\(event\)[\s\S]{0,180}if \(mapReturnObserved\) return true/, 'Duplicate workspace-open receipts must not reset an admitted trusted return.');
assert.match(returnHandshake, /function requestConfirmedMapRefresh\(event\)[\s\S]{0,620}__td613AshA8\?\.refresh[\s\S]{0,260}requestCanonicalMapAlignment\(serial\)/, 'A8 must request canonical Map alignment from the existing UI owner after the held refresh settles.');
assert.match(returnHandshake, /function requestCanonicalMapAlignment\(serial\)[\s\S]{0,420}__td613AshUiUxRescue[\s\S]{0,180}scrollTo\('map'\)/, 'A8 must reuse the existing UI-rescue alignment owner instead of inventing a second scroll engine.');
assert.match(returnHandshake, /function finalizeSettlement\(serial\)[\s\S]{0,400}!finalInstrumentRefreshObserved[\s\S]{0,120}!postRefreshA8RecompileObserved/, 'A8 must not expose the workshop before the final owner refresh and subsequent A8 recompile.');
assert.match(returnHandshake, /function observeWholeInstrumentRefresh\(event\)[\s\S]{0,500}event\.detail\?\.source === FINAL_REFRESH_SOURCE[\s\S]{0,500}queueMicrotask\(requestFinalInstrumentRefresh\)/, 'External whole-instrument refreshes must invalidate and reissue the final settlement refresh.');
assert.doesNotMatch(returnHandshake, /function arm\(event\)[\s\S]{0,300}captureAll\(\)/, 'A8 action-held receipt must not recapture after Custody has opened.');
assert.doesNotMatch(returnHandshake, /indexedDB\.|localStorage\.(?:setItem|removeItem|clear)|sessionStorage\.(?:setItem|removeItem|clear)|fetch\s*\(|sendBeacon|caches\.|serviceWorker/);
assert.match(bridge, /ash-a8-map-return-handshake\.js\?v=20260726-a15-empirical-v1/);

for (const token of [
  'td613.ash.a8-dirty-draft-recompile-guard/v0.2-dual-map-signal',
  "const FORM_SELECTOR = '#ashA8ObjectForm,#ashA8RelationForm'",
  "const COMMIT_SELECTOR = '#ashA8CommitObject,#ashA8CommitRelation'",
  'let dirtyDraftActive = false','let recoveredInFlightRecompiles = 0','let recoverySerial = 0','function mapWorkshopSignals()','function canonicalMapWorkshopIsActive()','function workshopIsConnected()','function custodyHoldIsActive()',
  'premium_map_signal','active_map_panel_signal','signals.workshop_connected','signals.premium_map_signal || signals.active_map_panel_signal',"guard_basis:'CONNECTED_WORKSHOP_AND_EITHER_CANONICAL_MAP_SIGNAL'",
  'function beginDirtyDraft(event)','host?.__td613AshA8MapReturnHandshake?.capture?.()','dirtyDraftActive = true','DIRTY_DRAFT_ACTIVE',
  'function admitCommit(event)','recoverySerial += 1','dirtyDraftActive = false','COMMIT_GESTURE_ADMITTED',
  'function completeQueuedRecovery(serial, source)','POST_A8_RECOMPILED_EVENT_DISPATCH','event_dispatch_settled:true','connected_workshop_recovery:true','full_control_parity:recovered',
  'function recoverAfterInFlightRecompile(event)','DIRTY_DRAFT_RECOVERY_QUEUED','A8_RECOMPILED_EVENT_DISPATCH','event_dispatch_settled:false','queueMicrotask(() => completeQueuedRecovery(serial, source))',
  'host?.__td613AshA8MapReturnHandshake?.restore?.()','DIRTY_DRAFT_RECOVERED_AFTER_IN_FLIGHT_RECOMPILE','DIRTY_DRAFT_RECOVERY_HELD',
  'function shouldDefer(source)','!dirtyDraftActive || custodyHoldIsActive() || !canonicalMapWorkshopIsActive()','RECOMPILE_DEFERRED_DIRTY_DRAFT',"return 'DIRTY_STAGE_DRAFT'",
  "doc.addEventListener('input', beginDirtyDraft, true)","doc.addEventListener('change', beginDirtyDraft, true)","doc.addEventListener('click', admitCommit, true)","host.addEventListener('td613:ash:a8-recompiled', recoverAfterInFlightRecompile)",
  '__td613AshA8RecompileGuard','shouldDefer','recover:recoverAfterInFlightRecompile','dirty_draft_active:dirtyDraftActive','workshop_connected:signals.workshop_connected','recovered_in_flight_recompiles:recoveredInFlightRecompiles','recovery_serial:recoverySerial','authority_changed:false','source_bytes_moved:false','human_closure_required:true'
]) assert.ok(dirtyGuard.includes(token), `A8 dirty-draft guard missing ${token}`);
assert.match(dirtyGuard, /function canonicalMapWorkshopIsActive\(\)[\s\S]{0,260}signals\.workshop_connected[\s\S]{0,180}signals\.premium_map_signal \|\| signals\.active_map_panel_signal/, 'A8 deferral must survive a one-frame disagreement between the premium Map dataset and the visibly active Map panel.');
assert.match(dirtyGuard, /function shouldDefer\(source\)[\s\S]{0,240}!dirtyDraftActive[\s\S]{0,180}custodyHoldIsActive\(\)[\s\S]{0,180}!canonicalMapWorkshopIsActive\(\)/, 'Dirty-draft guard must remain subordinate to a connected canonical Map workshop and custody state.');
assert.match(dirtyGuard, /function recoverAfterInFlightRecompile\(event\)[\s\S]{0,360}!dirtyDraftActive[\s\S]{0,200}custodyHoldIsActive\(\)[\s\S]{0,260}!canonicalMapWorkshopIsActive\(\)[\s\S]{0,380}queueMicrotask\(\(\) => completeQueuedRecovery\(serial, source\)\)/, 'A8 must queue recovery only for an active or transition-connected dirty Map workshop after the recompile receipt dispatch.');
assert.match(dirtyGuard, /function completeQueuedRecovery\(serial, source\)[\s\S]{0,280}serial !== recoverySerial[\s\S]{0,180}!dirtyDraftActive[\s\S]{0,160}custodyHoldIsActive\(\)[\s\S]{0,180}!workshopIsConnected\(\)[\s\S]{0,260}__td613AshA8MapReturnHandshake\?\.restore/, 'Queued A8 recovery must revalidate the session after event dispatch and then restore full shadow parity.');
assert.doesNotMatch(dirtyGuard, /function completeQueuedRecovery\(serial, source\)[\s\S]{0,500}dirtyDraftActive = false/, 'Post-dispatch recovery must preserve the dirty session until visible Commit.');
assert.doesNotMatch(dirtyGuard, /indexedDB\.|localStorage\.|sessionStorage\.|fetch\s*\(|sendBeacon|caches\.|serviceWorker|MutationObserver|setInterval\s*\(/);
assert.match(bridge, /ash-a8-dirty-draft-recompile-guard\.js\?v=20260726-a15-empirical-v1/);

for (const token of [
  'async function stageA8Field(page, id, value)',
  'await locator.selectOption(String(value))',
  'await locator.fill(String(value))',
  'async function waitForConcurrentA8Staging(page, fields)',
  'async function commitA8Gesture(page, fields, buttonId)',
  'for (const [id, value] of Object.entries(fields)) await stageA8Field(page, id, value)',
  'await waitForConcurrentA8Staging(page, fields)',
  'concurrent_staging_verified:true',
  'visible_field_gestures:true',
  'await button.focus()',
  'await button.click()',
  '#premiumPrimaryDock [data-premium-workspace="map"]:visible',
  'await returnToMap(page, relationFields)',
  'RESTORED_AFTER_CANONICAL_MAP_RETURN',
  'visible_a8_field_gestures:true',
  'concurrent_a8_staging_verified:true',
  'canonical_map_dock_return:true',
  'exact_map_return_receipt_required:true',
  'a8_handshake:window.__td613AshA8MapReturnHandshake?.current?.()'
]) assert.ok(a7a11Probe.includes(token), `A8 browser witness omitted real staging token ${token}`);
assert.match(a7a11Probe, /await returnToMap\(page, relationFields\);[\s\S]{0,500}restoredRelation\.from !== fromValue[\s\S]{0,220}restoredRelation\.to !== toValue/);
for (const pattern of [
  /page\.evaluate\(\(\{ fields, buttonId \}\)/,
  /const prepared = \[\]/,
  /captureTarget\?\.dispatchEvent/,
  /for \(const \[, control, value\] of prepared\) control\.value = value/
]) assert.doesNotMatch(a7a11Probe, pattern, 'A8 browser witness must not batch hidden assignments behind one synthetic capture event.');

for (const token of ['td613.ash.a7-a11-recompiler-core/v0.4-stage-guard','function captureStageDrafts()','function restoreStageDrafts(draft)','.ash-stage-form input[id]','function stageGuardReason(stage, source)','__td613Ash${stage}RecompileGuard','guard.shouldDefer(source)','STAGE_RECOMPILE_GUARD','STAGE_RECOMPILE_GUARD_ERROR','const guardReason = stageGuardReason(stage, source)','activeStageInteraction || guardReason',"reason:activeStageInteraction ? 'ACTIVE_STAGE_INTERACTION' : guardReason",'const draft = captureStageDrafts()','const draftRestored = restoreStageDrafts(draft)','draft_restored:draftRestored','active.focus?.({ preventScroll:true })','ACTIVE_STAGE_INTERACTION','active_stage_primary_action_deferred:true']) assert.ok(core.includes(token), `A8 core missing ${token}`);
assert.doesNotMatch(core, /MutationObserver|localStorage\.(?:setItem|removeItem|clear)|indexedDB\.(?:open|deleteDatabase)/);
assert.match(core, /'whole-instrument-refreshed'/, 'A8 final settlement must account for the core whole-instrument recompile driver.');

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

console.log(JSON.stringify({ok:true,schema:'td613.ash.a8-case-map-contract/v0.17-dual-map-signal-deferral',existing_map_engine_delegation:true,stage_form_draft_preservation:true,focus_independent_dirty_draft_guard:true,dual_map_signal_deferral:true,subordinate_stage_guard_interface:true,post_core_generic_restore_recovery:true,post_event_dispatch_recovery:true,connected_workshop_recovery:true,in_flight_recompile_recovery:true,dirty_session_preserved_after_recovery:true,guard_inactive_outside_active_map:true,guard_released_before_visible_commit:true,guard_inactive_during_custody_hold:true,held_draft_quarantine:true,prehold_form_shadow:true,visible_commit_boundary_capture:true,real_visible_field_staging_witness:true,concurrent_staging_verified_before_commit:true,canonical_map_dock_return:true,trusted_window_capture:true,idempotent_map_return_admitted:true,existing_ui_alignment_owner_reused:true,duplicate_scroll_engine_created:false,synthetic_return_gesture_admitted:false,non_dock_return_gesture_admitted:false,exact_map_return_receipt_required:true,post_custody_recapture_forbidden:true,canonical_map_return_handshake:true,canonical_map_alignment_required:true,final_whole_instrument_refresh_required:true,a8_recompile_after_final_refresh_required:true,external_refresh_invalidates_settlement:true,workshop_hidden_until_restore:true,full_saved_control_parity:true,quiet_recompile_window:true,transitioning_active_class_cannot_release_shadow_draft:true,default_dom_overwrite_held_until_canonical_map_restore:true,delayed_profile_hydration_cannot_clear_active_draft:true,object_and_relation_drafts_restore_independently:true,explicit_cross_tab_handshake:true,external_process_watchdog:true,authority_changed:false,source_bytes_moved:false,human_closure_required:true,vercel_gate:'CLOSED'}, null, 2));
