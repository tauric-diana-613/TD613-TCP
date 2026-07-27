import assert from 'node:assert/strict';
import fs from 'node:fs';

const core = fs.readFileSync(new URL('../app/dome-world/ash-a7-a11-recompiler-core.js', import.meta.url), 'utf8');
const source = fs.readFileSync(new URL('../app/dome-world/ash-a8-case-map-recompilation.js', import.meta.url), 'utf8');
const returnHandshake = fs.readFileSync(new URL('../app/dome-world/ash-a8-map-return-handshake.js', import.meta.url), 'utf8');
const dirtyGuard = fs.readFileSync(new URL('../app/dome-world/ash-a8-dirty-draft-recompile-guard.js', import.meta.url), 'utf8');
const probe = fs.readFileSync(new URL('../scripts/ash-a7-a11-browser-probe.mjs', import.meta.url), 'utf8');
const bridge = fs.readFileSync(new URL('../app/dome-world/ash-workspace-bridge.js', import.meta.url), 'utf8');
const shell = fs.readFileSync(new URL('../api/dome-world-shell.js', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../app/dome-world/ash-keep.html', import.meta.url), 'utf8');
const mirror = fs.readFileSync(new URL('../app/dome-world/ash-keep-source.html', import.meta.url), 'utf8');
const vercel = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));

function functionBlock(text, name, nextName) {
  const start = text.indexOf(`function ${name}`);
  assert.notEqual(start, -1, `Missing function ${name}`);
  const end = nextName ? text.indexOf(`function ${nextName}`, start + 1) : text.length;
  assert.notEqual(end, -1, `Missing function boundary after ${name}`);
  return text.slice(start, end);
}
function ordered(block, tokens, label) {
  let cursor = -1;
  for (const token of tokens) {
    const position = block.indexOf(token);
    assert.ok(position > cursor, `${label} missing or misordered ${token}`);
    cursor = position;
  }
}

assert.match(source, /td613\.ash\.a8-case-map-recompilation\/v0\.2-held-draft-quarantine/);
for (const marker of ['What are you placing?','What is known','What remains uncertain','Commit relationship','Relationship inspection','Accessible table','held_draft_quarantine:true','source_bytes_moved:false','authority_changed:false']) assert.ok(source.includes(marker), `A8 source missing ${marker}`);
for (const token of ['let heldDraftRestorePending = false','function quarantineHeldDraft()','HELD_PENDING_ACTIVE_MAP_RETURN','RESTORED_ON_ACTIVE_MAP_RETURN','captureWorkshopDraft({ allowHeldOverwrite:true })']) assert.ok(source.includes(token), `A8 held-draft law missing ${token}`);
assert.doesNotMatch(source, /indexedDB\.(?:open|deleteDatabase)|fetch\s*\(|localStorage\.(?:setItem|removeItem|clear)/);

for (const token of [
  'td613.ash.a8-map-return-handshake/v0.2-prehold-shadow',
  "const MAP_DOCK_SELECTOR = '#premiumPrimaryDock [data-premium-workspace=\"map\"]'",
  "const FINAL_REFRESH_SOURCE = 'A8_MAP_RETURN_SETTLEMENT'",
  'PREHOLD_COMMIT_SHADOW_CAPTURED','HELD_WITH_PREHOLD_DRAFT','MAP_RETURN_ALIGNMENT_REQUESTED',
  'MAP_RETURN_FINAL_INSTRUMENT_REFRESH_OBSERVED','RESTORED_AFTER_CANONICAL_MAP_RETURN',
  "host.addEventListener('click', observeTrustedCanonicalMapGesture, true)",
  "host.addEventListener('td613:ash:ux-workspace-aligned', observeMapAlignment)",
  "host.addEventListener('td613:ash:whole-instrument-refreshed', observeWholeInstrumentRefresh)",
  'full_control_parity:true','authority_changed:false','source_bytes_moved:false','human_closure_required:true'
]) assert.ok(returnHandshake.includes(token), `A8 return handshake missing ${token}`);
assert.doesNotMatch(returnHandshake, /indexedDB\.|localStorage\.|sessionStorage\.|fetch\s*\(|sendBeacon|caches\.|serviceWorker/);

for (const token of [
  'td613.ash.a8-dirty-draft-recompile-guard/v0.7-multi-control-shadow-merge',
  'td613.ash.a8-dirty-draft-guard-receipt/v0.13-multi-control-shadow-merge',
  'const pendingConnectedIntents = new Map()','let multiControlShadowMerges = 0','let focusOnlyAdmissions = 0',
  'function mergeControlIntentWithShadow','function mergeConnectedInput','function restoreConnectedChange','function transplantDetachedEdit',
  'DIRTY_DRAFT_FOCUS_ADMITTED','shadow_rewritten:false','MULTI_CONTROL_SHADOW_MERGED',
  'multi_control_shadow_merges:multiControlShadowMerges','focus_only_admissions:focusOnlyAdmissions',
  "stale_event_policy:'RESTORE_PRIOR_SHADOW_REAPPLY_CURRENT_INTENT_THEN_RECAPTURE'",
  'authority_changed:false','source_bytes_moved:false','human_closure_required:true'
]) assert.ok(dirtyGuard.includes(token), `A8 multi-control guard missing ${token}`);

const mergeBlock = functionBlock(dirtyGuard, 'mergeControlIntentWithShadow', 'clearPendingConnectedIntentsExcept');
ordered(mergeBlock, [
  '__td613AshA8MapReturnHandshake?.restore?.()',
  'applyControlIntent(intent, { requireReplacement, sourceTarget })',
  'multiControlShadowMerges += 1',
  'prior_shadow_restored:parity?.complete === true'
], 'multi-control merge owner');

const inputBlock = functionBlock(dirtyGuard, 'mergeConnectedInput', 'restoreConnectedChange');
ordered(inputBlock, ['rememberConnectedInput(target)','mergeControlIntentWithShadow(intent, { sourceTarget:target })'], 'connected input merge');

const changeBlock = functionBlock(dirtyGuard, 'restoreConnectedChange', 'transplantDetachedEdit');
ordered(changeBlock, ['takePendingConnectedIntent(id)','pendingIntent || snapshotControlIntent(target)','mergeControlIntentWithShadow(intent','connectedPairValuesRestored += 1'], 'connected change merge');

const detachedBlock = functionBlock(dirtyGuard, 'transplantDetachedEdit', 'beginDirtyDraft');
ordered(detachedBlock, ['takePendingConnectedIntent(id)','pendingIntent || snapshotControlIntent(target)','mergeControlIntentWithShadow(intent','pendingIntentDetachedRestores += 1'], 'detached change precedence');
assert.ok(detachedBlock.includes("intent_source:pendingIntent ? 'FOCUS_SCOPED_CONNECTED_INPUT' : 'DETACHED_EVENT_SNAPSHOT'"));

const beginBlock = functionBlock(dirtyGuard, 'beginDirtyDraft', 'admitCommit');
ordered(beginBlock, [
  'target.isConnected !== true',
  'event.stopImmediatePropagation?.()',
  'transplantDetachedEdit(target)',
  "event.type === 'focusin'",
  'DIRTY_DRAFT_FOCUS_ADMITTED',
  'shadow_rewritten:false',
  'return true',
  "event.type === 'change'",
  'restoreConnectedChange(target)',
  "event.type === 'input'",
  'mergeConnectedInput(target)',
  'MULTI_CONTROL_SHADOW_MERGED'
], 'A8 edit arbitration');
const focusStart = beginBlock.indexOf("if (event.type === 'focusin')");
const focusEnd = beginBlock.indexOf('const continuity =', focusStart);
const focusBlock = beginBlock.slice(focusStart, focusEnd);
assert.doesNotMatch(focusBlock, /capture|applyControlIntent|mergeControlIntentWithShadow/, 'Focus must not rewrite the authoritative shadow.');
assert.doesNotMatch(functionBlock(dirtyGuard, 'rememberConnectedInput', 'mergeConnectedInput'), /queueMicrotask|setTimeout|setInterval/);
assert.doesNotMatch(dirtyGuard, /indexedDB\.|localStorage\.|sessionStorage\.|fetch\s*\(|sendBeacon|caches\.|serviceWorker|MutationObserver|setInterval\s*\(/);

for (const token of [
  'async function stageA8Field(page, id, value)','await locator.selectOption(String(value))','await locator.fill(String(value))',
  'async function waitForConcurrentA8Staging(page, fields)','await waitForConcurrentA8Staging(page, fields)',
  'visible_field_gestures:true','concurrent_staging_verified:true','await button.focus()','await button.click()',
  '#premiumPrimaryDock [data-premium-workspace="map"]:visible','RESTORED_AFTER_CANONICAL_MAP_RETURN',
  'canonical_map_dock_return:true','exact_map_return_receipt_required:true'
]) assert.ok(probe.includes(token), `A8 browser witness omitted ${token}`);
assert.doesNotMatch(probe, /page\.evaluate\(\(\{ fields, buttonId \}\)|const prepared = \[\]|captureTarget\?\.dispatchEvent/);

for (const token of [
  'td613.ash.a7-a11-recompiler-core/v0.5-post-sync-guard-arbitration','function stageGuardReason(stage, source)',
  'guard.shouldDefer(source)','function recoverStageAfterSync(stage, source, detail = {})',
  'POST_STAGE_SYNC_PRE_GENERIC_DRAFT_RESTORE','generic_draft_restore_suppressed:true',
  'const draftRestored = genericDraftRestoreSuppressed ? recoveredAfterSync : restoreStageDrafts(draft)',
  "? 'STAGE_GUARD'","? 'ACTIVE_STAGE_INTERACTION'",": 'GENERIC_STAGE_SNAPSHOT'"
]) assert.ok(core.includes(token), `A8 shared core missing ${token}`);
assert.doesNotMatch(core, /MutationObserver|localStorage\.(?:setItem|removeItem|clear)|indexedDB\.(?:open|deleteDatabase)/);
assert.match(bridge, /ash-a8-dirty-draft-recompile-guard\.js\?v=20260726-a15-empirical-v1/);
assert.match(shell, /ash-a8-case-map-recompilation\.js\?v=\$\{ASH_LIFECYCLE_ASSET_EPOCH\}/);
assert.match(html, /ash-a8-case-map-recompilation\.js/);
assert.equal(html, mirror, 'Ash source mirror must remain byte-identical');
assert.equal(vercel.git?.deploymentEnabled, false);

console.log(JSON.stringify({
  ok:true,
  schema:'td613.ash.a8-case-map-contract/v0.24-function-scoped-shadow-law',
  multi_control_shadow_merge:true,
  focus_does_not_rewrite_shadow:true,
  prior_shadow_restored_before_current_intent:true,
  current_intent_reapplied_before_recapture:true,
  detached_pending_intent_precedence:true,
  cumulative_context_webkit_path:true,
  real_visible_field_staging_witness:true,
  concurrent_staging_verified_before_commit:true,
  canonical_map_return_handshake:true,
  authority_changed:false,
  source_bytes_moved:false,
  human_closure_required:true,
  vercel_gate:'CLOSED'
}, null, 2));
