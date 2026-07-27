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
  "source_control:'PRIMARY_DOCK_TRUSTED_WINDOW_CAPTURE'",'idempotent_return_admitted:true','if (mapReturnObserved) return true',
  "host.addEventListener('click', observeTrustedCanonicalMapGesture, true)",
  "host.addEventListener('td613:ash:ux-workspace-opened', requestConfirmedMapRefresh)",
  "host.addEventListener('td613:ash:ux-workspace-aligned', observeMapAlignment)",
  "host.addEventListener('td613:ash:whole-instrument-refreshed', observeWholeInstrumentRefresh)",
  "host.addEventListener('td613:ash:a8-recompiled', settleAfterA8Recompile)",
  "refresh?.('A8_CANONICAL_MAP_RETURN_HANDSHAKE')",'owner.refresh(FINAL_REFRESH_SOURCE)','event.detail?.source === FINAL_REFRESH_SOURCE',
  'RESTORED_AFTER_CANONICAL_MAP_RETURN','td613:ash:a8-map-return-restored','PREHOLD_VISIBLE_COMMIT_CAPTURE',
  'precommit_shadow_capture:true','canonical_map_gesture_observed:true','trusted_window_capture:true','idempotent_map_return_admitted:true','canonical_map_alignment_observed:true',"alignment_owner:'ASH_UI_UX_RESCUE'",'final_whole_instrument_refresh_observed:true','a8_recompiled_after_final_refresh:true','full_control_parity:true','quiet_window_ms:SETTLEMENT_QUIET_MS','workshop_visible_after_restore:true',
  'final_refresh_requested:finalRefreshRequested','final_instrument_refresh_observed:finalInstrumentRefreshObserved','post_refresh_a8_recompile_observed:postRefreshA8RecompileObserved',
  'authority_changed:false','source_bytes_moved:false','custody_changed:false','release_posture_changed:false','human_closure_required:true'
]) assert.ok(returnHandshake.includes(token), `A8 canonical Map-return handshake missing ${token}`);
assert.match(returnHandshake, /function captureBeforeCommit\(event\)[\s\S]{0,260}captureAll\(\)/);
assert.match(returnHandshake, /function observeTrustedCanonicalMapGesture\(event\)[\s\S]{0,320}event\.isTrusted !== true[\s\S]{0,180}MAP_DOCK_SELECTOR[\s\S]{0,360}idempotent_return_admitted:true/);
assert.match(returnHandshake, /function requestConfirmedMapRefresh\(event\)[\s\S]{0,180}if \(mapReturnObserved\) return true/);
assert.match(returnHandshake, /function requestConfirmedMapRefresh\(event\)[\s\S]{0,620}__td613AshA8\?\.refresh[\s\S]{0,260}requestCanonicalMapAlignment\(serial\)/);
assert.match(returnHandshake, /function requestCanonicalMapAlignment\(serial\)[\s\S]{0,420}__td613AshUiUxRescue[\s\S]{0,180}scrollTo\('map'\)/);
assert.match(returnHandshake, /function finalizeSettlement\(serial\)[\s\S]{0,400}!finalInstrumentRefreshObserved[\s\S]{0,120}!postRefreshA8RecompileObserved/);
assert.match(returnHandshake, /function observeWholeInstrumentRefresh\(event\)[\s\S]{0,500}event\.detail\?\.source === FINAL_REFRESH_SOURCE[\s\S]{0,500}queueMicrotask\(requestFinalInstrumentRefresh\)/);
assert.doesNotMatch(returnHandshake, /function arm\(event\)[\s\S]{0,300}captureAll\(\)/);
assert.doesNotMatch(returnHandshake, /indexedDB\.|localStorage\.(?:setItem|removeItem|clear)|sessionStorage\.(?:setItem|removeItem|clear)|fetch\s*\(|sendBeacon|caches\.|serviceWorker/);
assert.match(bridge, /ash-a8-map-return-handshake\.js\?v=20260726-a15-empirical-v1/);

for (const token of [
  'td613.ash.a8-dirty-draft-recompile-guard/v0.7-multi-control-shadow-merge',
  'td613.ash.a8-dirty-draft-guard-receipt/v0.13-multi-control-shadow-merge',
  "const FORM_SELECTOR = '#ashA8ObjectForm,#ashA8RelationForm'","const COMMIT_SELECTOR = '#ashA8CommitObject,#ashA8CommitRelation'",
  'const pendingConnectedIntents = new Map()','let connectedIntentSerial = 0','let connectedPairValuesRestored = 0','let pendingIntentDetachedRestores = 0','let focusScopedIntentsCleared = 0','let multiControlShadowMerges = 0','let focusOnlyAdmissions = 0',
  'function snapshotControlIntent(target)','source_target:target','function applyControlIntent(intent, { requireReplacement = false, sourceTarget = null } = {})','function mergeControlIntentWithShadow(intent, { requireReplacement = false, sourceTarget = null } = {})','function clearPendingConnectedIntentsExcept(controlId = null)','function takePendingConnectedIntent(id)','function rememberConnectedInput(target)','function mergeConnectedInput(target)','function restoreConnectedChange(target)','function transplantDetachedEdit(target)',
  'const parity = host?.__td613AshA8MapReturnHandshake?.restore?.() || null','const continuity = applyControlIntent(intent, { requireReplacement, sourceTarget })','multiControlShadowMerges += 1','prior_shadow_restored:parity?.complete === true',
  'const intent = rememberConnectedInput(target)','return mergeControlIntentWithShadow(intent, { sourceTarget:target })','const pendingIntent = takePendingConnectedIntent(id)','const intent = pendingIntent || snapshotControlIntent(target)','mergeControlIntentWithShadow(intent','pendingIntentDetachedRestores += 1',
  "event.type === 'focusin'","event.type === 'change'","event.type === 'input'",'DIRTY_DRAFT_FOCUS_ADMITTED','shadow_rewritten:false','mergeConnectedInput(target)','restoreConnectedChange(target)','MULTI_CONTROL_SHADOW_MERGED','multi_control_shadow_merged:continuity.transplanted',
  'STALE_DETACHED_EDIT_VALUE_TRANSPLANTED','event.stopImmediatePropagation?.()','intent_source:continuity.intent_source || null',
  'pending_connected_intents:pendingConnectedIntents.size','connected_pair_values_restored:connectedPairValuesRestored','pending_intent_detached_restores:pendingIntentDetachedRestores','focus_scoped_intents_cleared:focusScopedIntentsCleared','multi_control_shadow_merges:multiControlShadowMerges','focus_only_admissions:focusOnlyAdmissions',"stale_event_policy:'RESTORE_PRIOR_SHADOW_REAPPLY_CURRENT_INTENT_THEN_RECAPTURE'",
  'function admitCommit(event)','pendingConnectedIntents.clear()','COMMIT_GESTURE_ADMITTED','function recoverAfterStageSync(source, detail = {})','DIRTY_DRAFT_RECOVERED_AFTER_STAGE_SYNC','POST_STAGE_SYNC_PRE_GENERIC_DRAFT_RESTORE','authoritative_restore_owner:\'A8_MAP_RETURN_HANDSHAKE_SHADOW\'','function recoverAfterInFlightRecompile(event)','queueMicrotask(() => completeQueuedRecovery(serial, source))','function shouldDefer(source)',"return 'DIRTY_STAGE_DRAFT'",
  "doc.addEventListener('input', beginDirtyDraft, true)","doc.addEventListener('change', beginDirtyDraft, true)","doc.addEventListener('click', admitCommit, true)",'__td613AshA8RecompileGuard','authority_changed:false','source_bytes_moved:false','human_closure_required:true'
]) assert.ok(dirtyGuard.includes(token), `A8 multi-control shadow guard missing ${token}`);
assert.match(dirtyGuard, /function mergeControlIntentWithShadow\(intent,[\s\S]{0,420}__td613AshA8MapReturnHandshake\?\.restore\?\.\(\)[\s\S]{0,360}applyControlIntent\(intent, \{ requireReplacement, sourceTarget \}\)[\s\S]{0,240}multiControlShadowMerges \+= 1/, 'Every authored control edit must merge into the prior full shadow before recapture.');
assert.match(dirtyGuard, /function mergeConnectedInput\(target\)[\s\S]{0,320}rememberConnectedInput\(target\)[\s\S]{0,260}mergeControlIntentWithShadow\(intent, \{ sourceTarget:target \}\)/, 'Connected input must restore the prior full draft, reapply the current value, and recapture.');
assert.match(dirtyGuard, /function restoreConnectedChange\(target\)[\s\S]{0,700}pendingIntent \|\| snapshotControlIntent\(target\)[\s\S]{0,500}mergeControlIntentWithShadow\(intent,[\s\S]{0,420}connectedPairValuesRestored \+= 1/, 'Connected change must merge with the accumulated shadow whether or not input/change stayed on one node.');
assert.match(dirtyGuard, /function transplantDetachedEdit\(target\)[\s\S]{0,340}pendingIntent \|\| snapshotControlIntent\(target\)[\s\S]{0,500}mergeControlIntentWithShadow\(intent,[\s\S]{0,500}pendingIntentDetachedRestores \+= 1/, 'Detached change must prefer the pending authored input and merge it into the full shadow.');
assert.match(dirtyGuard, /event\.type === 'focusin'[\s\S]{0,420}DIRTY_DRAFT_FOCUS_ADMITTED[\s\S]{0,240}shadow_rewritten:false[\s\S]{0,220}return true/, 'Focus may activate deferral but must not rewrite the authoritative multi-field shadow.');
assert.doesNotMatch(dirtyGuard.match(/if \(event\.type === 'focusin'\)[\s\S]*?return true;/)?.[0] || '', /capture|mergeControlIntentWithShadow|applyControlIntent/, 'Focus admission must not capture default DOM state over authored fields.');
assert.match(dirtyGuard, /const continuity = event\.type === 'change'[\s\S]{0,240}restoreConnectedChange\(target\)[\s\S]{0,240}event\.type === 'input'[\s\S]{0,220}mergeConnectedInput\(target\)/, 'Only input/change may mutate the shared shadow after focus admission.');
assert.doesNotMatch(dirtyGuard.match(/function rememberConnectedInput\(target\)[\s\S]*?\n\}/)?.[0] || '', /queueMicrotask|setTimeout|setInterval/);
assert.match(dirtyGuard, /if \(target\.isConnected !== true\)[\s\S]{0,220}event\.stopImmediatePropagation\?\.\(\)[\s\S]{0,220}transplantDetachedEdit\(target\)[\s\S]{0,520}return continuity\.transplanted/);
assert.match(dirtyGuard, /function canonicalMapWorkshopIsActive\(\)[\s\S]{0,260}signals\.workshop_connected[\s\S]{0,180}signals\.premium_map_signal \|\| signals\.active_map_panel_signal/);
assert.match(dirtyGuard, /function shouldDefer\(source\)[\s\S]{0,240}!dirtyDraftActive[\s\S]{0,180}custodyHoldIsActive\(\)[\s\S]{0,180}!canonicalMapWorkshopIsActive\(\)/);
assert.match(dirtyGuard, /function recoverAfterStageSync\(source, detail = \{\}\)[\s\S]{0,620}POST_STAGE_SYNC_PRE_GENERIC_DRAFT_RESTORE[\s\S]{0,300}A8_MAP_RETURN_HANDSHAKE_SHADOW/);
assert.doesNotMatch(dirtyGuard, /indexedDB\.|localStorage\.|sessionStorage\.|fetch\s*\(|sendBeacon|caches\.|serviceWorker|MutationObserver|setInterval\s*\(/);
assert.match(bridge, /ash-a8-dirty-draft-recompile-guard\.js\?v=20260726-a15-empirical-v1/);

for (const token of ['async function stageA8Field(page, id, value)','await locator.selectOption(String(value))','await locator.fill(String(value))','async function waitForConcurrentA8Staging(page, fields)','async function commitA8Gesture(page, fields, buttonId)','for (const [id, value] of Object.entries(fields)) await stageA8Field(page, id, value)','await waitForConcurrentA8Staging(page, fields)','concurrent_staging_verified:true','visible_field_gestures:true','await button.focus()','await button.click()','#premiumPrimaryDock [data-premium-workspace="map"]:visible','await returnToMap(page, relationFields)','RESTORED_AFTER_CANONICAL_MAP_RETURN','visible_a8_field_gestures:true','concurrent_a8_staging_verified:true','canonical_map_dock_return:true','exact_map_return_receipt_required:true','a8_handshake:window.__td613AshA8MapReturnHandshake?.current?.()']) assert.ok(a7a11Probe.includes(token), `A8 browser witness omitted real staging token ${token}`);
assert.match(a7a11Probe, /await returnToMap\(page, relationFields\);[\s\S]{0,500}restoredRelation\.from !== fromValue[\s\S]{0,220}restoredRelation\.to !== toValue/);
for (const pattern of [/page\.evaluate\(\(\{ fields, buttonId \}\)/,/const prepared = \[\]/,/captureTarget\?\.dispatchEvent/,/for \(const \[, control, value\] of prepared\) control\.value = value/]) assert.doesNotMatch(a7a11Probe, pattern);

for (const token of ['td613.ash.a7-a11-recompiler-core/v0.5-post-sync-guard-arbitration','function captureStageDrafts()','function restoreStageDrafts(draft)','.ash-stage-form input[id]','function activeStageInteraction(stage)','function stageGuardReason(stage, source)','__td613Ash${stage}RecompileGuard','guard.shouldDefer(source)','STAGE_RECOMPILE_GUARD','STAGE_RECOMPILE_GUARD_ERROR','function recoverStageAfterSync(stage, source, detail = {})','guard.recoverAfterSync(source, detail)','POST_STAGE_SYNC_PRE_GENERIC_DRAFT_RESTORE','const guardReason = stageGuardReason(stage, source)','preSyncActiveInteraction || guardReason',"reason:preSyncActiveInteraction ? 'ACTIVE_STAGE_INTERACTION' : guardReason",'const draft = captureStageDrafts()','const result = await sync(snapshot, source)','const postSyncActiveInteraction = activeStageInteraction(stage)','const postSyncGuardReason = stageGuardReason(stage, source)','const genericDraftRestoreSuppressed = Boolean(postSyncActiveInteraction || postSyncGuardReason)','const recoveredAfterSync = postSyncGuardReason','generic_draft_restore_suppressed:true','const draftRestored = genericDraftRestoreSuppressed ? recoveredAfterSync : restoreStageDrafts(draft)',"? 'STAGE_GUARD'","? 'ACTIVE_STAGE_INTERACTION'",": 'GENERIC_STAGE_SNAPSHOT'",'draft_restore_owner:draftRestoreOwner','post_sync_guard_recovered:recoveredAfterSync','post_sync_active_interaction:Boolean(postSyncActiveInteraction)','active.focus?.({ preventScroll:true })','ACTIVE_STAGE_INTERACTION','active_stage_primary_action_deferred:true']) assert.ok(core.includes(token), `A8 core missing ${token}`);
assert.match(core, /const result = await sync\(snapshot, source\);[\s\S]{0,800}const postSyncGuardReason = stageGuardReason\(stage, source\);[\s\S]{0,900}const draftRestored = genericDraftRestoreSuppressed \? recoveredAfterSync : restoreStageDrafts\(draft\)/);
assert.doesNotMatch(core, /const result = await sync\(snapshot, source\);\s*const draftRestored = restoreStageDrafts\(draft\);/);
assert.doesNotMatch(core, /MutationObserver|localStorage\.(?:setItem|removeItem|clear)|indexedDB\.(?:open|deleteDatabase)/);
assert.match(core, /'whole-instrument-refreshed'/);

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
assert.equal(html, mirror);
assert.equal(vercel.git?.deploymentEnabled, false);

console.log(JSON.stringify({ok:true,schema:'td613.ash.a8-case-map-contract/v0.23-multi-control-shadow-merge',existing_map_engine_delegation:true,stage_form_draft_preservation:true,focus_independent_dirty_draft_guard:true,multi_control_shadow_merge:true,focus_does_not_rewrite_shadow:true,prior_shadow_restored_before_current_intent:true,current_intent_reapplied_before_recapture:true,cumulative_context_webkit_path:true,dual_map_signal_deferral:true,post_sync_restore_arbitration:true,stage_guard_authoritative_after_sync:true,generic_stale_restore_suppressed:true,subordinate_stage_guard_interface:true,post_core_generic_restore_recovery:true,post_event_dispatch_recovery:true,connected_workshop_recovery:true,in_flight_recompile_recovery:true,dirty_session_preserved_after_recovery:true,guard_inactive_outside_active_map:true,guard_released_before_visible_commit:true,guard_inactive_during_custody_hold:true,held_draft_quarantine:true,detached_event_quarantine:true,pending_intent_precedes_detached_snapshot:true,real_visible_field_staging_witness:true,concurrent_staging_verified_before_commit:true,canonical_map_dock_return:true,trusted_window_capture:true,idempotent_map_return_admitted:true,exact_map_return_receipt_required:true,authority_changed:false,source_bytes_moved:false,human_closure_required:true,vercel_gate:'CLOSED'}, null, 2));
