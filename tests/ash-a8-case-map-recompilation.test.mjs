import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const core = read('app/dome-world/ash-a7-a11-recompiler-core.js');
const source = read('app/dome-world/ash-a8-case-map-recompilation.js');
const handshake = read('app/dome-world/ash-a8-map-return-handshake.js');
const guard = read('app/dome-world/ash-a8-dirty-draft-recompile-guard.js');
const probe = read('scripts/ash-a7-a11-browser-probe.mjs');
const bridge = read('app/dome-world/ash-workspace-bridge.js');
const shell = read('api/dome-world-shell.js');
const html = read('app/dome-world/ash-keep.html');
const mirror = read('app/dome-world/ash-keep-source.html');
const vercel = JSON.parse(read('vercel.json'));

for (const token of [
  'td613.ash.a8-case-map-recompilation/v0.2-held-draft-quarantine',
  'function quarantineHeldDraft()','HELD_PENDING_ACTIVE_MAP_RETURN','RESTORED_ON_ACTIVE_MAP_RETURN',
  'What are you placing?','Commit relationship','Relationship inspection','Accessible table',
  'held_draft_quarantine:true','source_bytes_moved:false','authority_changed:false'
]) assert.ok(source.includes(token), `A8 source missing ${token}`);

for (const token of [
  'td613.ash.a8-map-return-handshake/v0.2-prehold-shadow',
  'PREHOLD_COMMIT_SHADOW_CAPTURED','HELD_WITH_PREHOLD_DRAFT','MAP_RETURN_ALIGNMENT_REQUESTED',
  'MAP_RETURN_FINAL_INSTRUMENT_REFRESH_OBSERVED','RESTORED_AFTER_CANONICAL_MAP_RETURN',
  'trusted_window_capture:true','full_control_parity:true','human_closure_required:true'
]) assert.ok(handshake.includes(token), `A8 return handshake missing ${token}`);

for (const token of [
  'td613.ash.a8-dirty-draft-recompile-guard/v0.7-multi-control-shadow-merge',
  'td613.ash.a8-dirty-draft-guard-receipt/v0.13-multi-control-shadow-merge',
  'function mergeControlIntentWithShadow','function mergeConnectedInput','function restoreConnectedChange','function transplantDetachedEdit',
  '__td613AshA8MapReturnHandshake?.restore?.()','applyControlIntent(intent, { requireReplacement, sourceTarget })',
  'DIRTY_DRAFT_FOCUS_ADMITTED','shadow_rewritten:false','MULTI_CONTROL_SHADOW_MERGED',
  'multi_control_shadow_merges:multiControlShadowMerges','focus_only_admissions:focusOnlyAdmissions',
  "stale_event_policy:'RESTORE_PRIOR_SHADOW_REAPPLY_CURRENT_INTENT_THEN_RECAPTURE'",
  'pendingIntentDetachedRestores += 1','authority_changed:false','source_bytes_moved:false','human_closure_required:true'
]) assert.ok(guard.includes(token), `A8 multi-control guard missing ${token}`);
assert.ok(guard.indexOf('__td613AshA8MapReturnHandshake?.restore?.()') < guard.indexOf('applyControlIntent(intent, { requireReplacement, sourceTarget })'), 'A8 must restore the prior full shadow before applying the current control intent.');
const focusStart = guard.indexOf("if (event.type === 'focusin')");
const editStart = guard.indexOf("const continuity = event.type === 'change'", focusStart);
assert.ok(focusStart >= 0 && editStart > focusStart, 'A8 focus and edit arbitration boundaries are missing.');
const focusBlock = guard.slice(focusStart, editStart);
assert.ok(focusBlock.includes('shadow_rewritten:false'));
assert.ok(focusBlock.includes('return true'));
assert.doesNotMatch(focusBlock, /applyControlIntent|mergeControlIntentWithShadow|\.capture\?\./, 'Focus may activate deferral but may not rewrite the shared shadow.');

for (const token of [
  'async function stageA8Field(page, id, value)','await locator.selectOption(String(value))','await locator.fill(String(value))',
  'async function waitForConcurrentA8Staging(page, fields)','await waitForConcurrentA8Staging(page, fields)',
  'visible_field_gestures:true','concurrent_staging_verified:true','await button.focus()','await button.click()',
  '#premiumPrimaryDock [data-premium-workspace="map"]:visible','RESTORED_AFTER_CANONICAL_MAP_RETURN'
]) assert.ok(probe.includes(token), `A8 browser witness missing ${token}`);

for (const token of [
  'td613.ash.a7-a11-recompiler-core/v0.5-post-sync-guard-arbitration',
  'guard.shouldDefer(source)','POST_STAGE_SYNC_PRE_GENERIC_DRAFT_RESTORE','generic_draft_restore_suppressed:true',
  'const draftRestored = genericDraftRestoreSuppressed ? recoveredAfterSync : restoreStageDrafts(draft)'
]) assert.ok(core.includes(token), `A8 shared core missing ${token}`);

for (const text of [source, handshake, guard, core]) assert.doesNotMatch(text, /indexedDB\.(?:open|deleteDatabase)|localStorage\.(?:setItem|removeItem|clear)|sessionStorage\.(?:setItem|removeItem|clear)|fetch\s*\(|sendBeacon|caches\.|serviceWorker|MutationObserver|setInterval\s*\(/);
assert.match(bridge, /ash-a8-dirty-draft-recompile-guard\.js\?v=20260726-a15-empirical-v1/);
assert.match(shell, /ash-a8-case-map-recompilation\.js\?v=\$\{ASH_LIFECYCLE_ASSET_EPOCH\}/);
assert.match(html, /ash-a8-case-map-recompilation\.js/);
assert.equal(html, mirror, 'Ash source mirror must remain byte-identical');
assert.equal(vercel.git?.deploymentEnabled, false);

console.log(JSON.stringify({ok:true,schema:'td613.ash.a8-case-map-contract/v0.25-static-plus-browser-ordering',multi_control_shadow_merge:true,focus_does_not_rewrite_shadow:true,prior_shadow_restored_before_current_intent:true,browser_ordering_required:true,cumulative_context_webkit_path:true,authority_changed:false,source_bytes_moved:false,human_closure_required:true,vercel_gate:'CLOSED'}, null, 2));
