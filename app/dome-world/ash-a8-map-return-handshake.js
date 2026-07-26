export const ASH_A8_MAP_RETURN_HANDSHAKE_VERSION = 'td613.ash.a8-map-return-handshake/v0.2-prehold-shadow';

const host = globalThis.window;
const doc = globalThis.document;
const byId = id => doc?.getElementById(id);
const CONTROL_IDS = Object.freeze([
  'ashA8ObjectName','ashA8ObjectType','ashA8ObjectRoom','ashA8ObjectKnown','ashA8ObjectUncertain','ashA8ObjectEvidence','ashA8ObjectSource','ashA8ObjectNotes',
  'ashA8RelationFrom','ashA8RelationTo','ashA8RelationType','ashA8RelationEvidence','ashA8RelationUncertain','ashA8RelationNotes'
]);
const HELD_ACTIONS = new Set(['addObject','addRelationship']);
const COMMIT_SELECTOR = '#ashA8CommitObject,#ashA8CommitRelation';
const MAP_DOCK_SELECTOR = '#premiumPrimaryDock [data-premium-workspace="map"]';
const FINAL_REFRESH_SOURCE = 'A8_MAP_RETURN_SETTLEMENT';
const SETTLEMENT_QUIET_MS = 150;
const draft = new Map();
let held = false;
let mapReturnObserved = false;
let alignmentObserved = false;
let finalRefreshRequested = false;
let finalInstrumentRefreshObserved = false;
let postRefreshA8RecompileObserved = false;
let refreshSerial = 0;
let settlementTimer = null;

function ensureStyles() {
  if (!doc?.head || byId('td613-ash-a8-map-return-handshake-css')) return;
  const style = doc.createElement('style');
  style.id = 'td613-ash-a8-map-return-handshake-css';
  style.textContent = 'html[data-ash-a8-map-return-handshake^="MAP_RETURN_"] #ashA8RelationWorkshop{visibility:hidden!important;pointer-events:none!important}';
  doc.head.append(style);
}

function captureAll() {
  let captured = false;
  for (const id of CONTROL_IDS) {
    const control = byId(id);
    if (!control?.isConnected) continue;
    draft.set(id, Object.freeze({
      value:String(control.value ?? ''),
      checked:'checked' in control ? Boolean(control.checked) : null
    }));
    captured = true;
  }
  if (captured) mark('PREHOLD_DRAFT_CAPTURED');
  return captured;
}

function restoreAll() {
  let restored = 0;
  let matched = 0;
  const missing = [];
  for (const [id, saved] of draft) {
    const control = byId(id);
    if (!control?.isConnected) {
      missing.push(id);
      continue;
    }
    if (control.tagName === 'SELECT' && ![...control.options].some(option => option.value === saved.value)) {
      missing.push(id);
      continue;
    }
    control.value = saved.value;
    if (saved.checked !== null && 'checked' in control) control.checked = saved.checked;
    restored += 1;
    const valueMatches = String(control.value ?? '') === saved.value;
    const checkedMatches = saved.checked === null || !('checked' in control) || Boolean(control.checked) === saved.checked;
    if (valueMatches && checkedMatches) matched += 1;
  }
  return Object.freeze({
    expected:draft.size,
    restored,
    matched,
    complete:draft.size > 0 && matched === draft.size,
    missing:Object.freeze(missing)
  });
}

function canonicalMapIsOpen() {
  const workspace = byId('workspace-map');
  return doc?.documentElement?.dataset?.ashPremiumWorkspace === 'map'
    && workspace?.classList?.contains('active') === true;
}

function mark(posture) {
  if (doc?.documentElement) doc.documentElement.dataset.ashA8MapReturnHandshake = posture;
}

function clearSettlementTimer() {
  if (settlementTimer !== null) host?.clearTimeout?.(settlementTimer);
  settlementTimer = null;
}

function resetFinalRefreshState() {
  clearSettlementTimer();
  finalRefreshRequested = false;
  finalInstrumentRefreshObserved = false;
  postRefreshA8RecompileObserved = false;
  refreshSerial += 1;
}

function clear() {
  clearSettlementTimer();
  draft.clear();
  held = false;
  mapReturnObserved = false;
  alignmentObserved = false;
  finalRefreshRequested = false;
  finalInstrumentRefreshObserved = false;
  postRefreshA8RecompileObserved = false;
  refreshSerial += 1;
  mark('CLEARED');
}

function captureBeforeCommit(event) {
  if (held || !event.target?.closest?.(COMMIT_SELECTOR)) return false;
  const captured = captureAll();
  if (captured) mark('PREHOLD_COMMIT_SHADOW_CAPTURED');
  return captured;
}

function arm(event) {
  if (!HELD_ACTIONS.has(event.detail?.action_id)) return;
  held = draft.size > 0;
  mapReturnObserved = false;
  alignmentObserved = false;
  resetFinalRefreshState();
  mark(held ? 'HELD_WITH_PREHOLD_DRAFT' : 'HELD_WITHOUT_PREHOLD_DRAFT');
}

function captureDelegatedForm(event) {
  if (!event.target?.closest?.('#ashA8ObjectForm,#ashA8RelationForm')) return;
  if (held) return;
  captureAll();
}

function requestConfirmedMapRefresh(event) {
  if (!held || event.detail?.workspace !== 'map') return false;
  if (mapReturnObserved) return true;
  mapReturnObserved = true;
  alignmentObserved = false;
  resetFinalRefreshState();
  const serial = refreshSerial;
  mark('MAP_RETURN_SETTLING');
  queueMicrotask(() => {
    if (!held || !mapReturnObserved || serial !== refreshSerial) return;
    Promise.resolve(host?.__td613AshA8?.refresh?.('A8_CANONICAL_MAP_RETURN_HANDSHAKE')).catch(() => {
      if (serial === refreshSerial) mark('MAP_RETURN_RESTORE_HELD');
    });
  });
  return true;
}

function observeTrustedCanonicalMapGesture(event) {
  if (!held || event.isTrusted !== true || !event.target?.closest?.(MAP_DOCK_SELECTOR)) return false;
  return requestConfirmedMapRefresh({
    detail:Object.freeze({
      workspace:'map',
      source_control:'PRIMARY_DOCK_TRUSTED_WINDOW_CAPTURE',
      idempotent_return_admitted:true
    })
  });
}

function requestFinalInstrumentRefresh() {
  if (!held || !mapReturnObserved || !alignmentObserved || !canonicalMapIsOpen() || finalRefreshRequested) return false;
  finalRefreshRequested = true;
  finalInstrumentRefreshObserved = false;
  postRefreshA8RecompileObserved = false;
  clearSettlementTimer();
  refreshSerial += 1;
  const serial = refreshSerial;
  mark('MAP_RETURN_REQUESTING_FINAL_INSTRUMENT_REFRESH');
  queueMicrotask(() => {
    if (!held || !mapReturnObserved || !alignmentObserved || serial !== refreshSerial) {
      finalRefreshRequested = false;
      return;
    }
    const owner = host?.__td613AshWholeInstrument;
    if (!owner?.refresh) {
      finalRefreshRequested = false;
      mark('MAP_RETURN_FINAL_INSTRUMENT_REFRESH_HELD');
      return;
    }
    owner.refresh(FINAL_REFRESH_SOURCE);
  });
  return true;
}

function observeWholeInstrumentRefresh(event) {
  if (!held || !mapReturnObserved || !alignmentObserved || !canonicalMapIsOpen()) return false;
  clearSettlementTimer();
  postRefreshA8RecompileObserved = false;
  refreshSerial += 1;
  if (event.detail?.source === FINAL_REFRESH_SOURCE) {
    finalRefreshRequested = false;
    finalInstrumentRefreshObserved = true;
    mark('MAP_RETURN_FINAL_INSTRUMENT_REFRESH_OBSERVED');
    return true;
  }
  finalInstrumentRefreshObserved = false;
  finalRefreshRequested = false;
  mark('MAP_RETURN_EXTERNAL_INSTRUMENT_REFRESH_OBSERVED');
  queueMicrotask(requestFinalInstrumentRefresh);
  return true;
}

function finalizeSettlement(serial) {
  if (!held
    || !mapReturnObserved
    || !alignmentObserved
    || !finalInstrumentRefreshObserved
    || !postRefreshA8RecompileObserved
    || serial !== refreshSerial
    || !canonicalMapIsOpen()) return false;
  const finalParity = restoreAll();
  if (!finalParity.complete) {
    mark('MAP_RETURN_RESTORE_HELD');
    return false;
  }
  held = false;
  mapReturnObserved = false;
  alignmentObserved = false;
  finalRefreshRequested = false;
  finalInstrumentRefreshObserved = false;
  postRefreshA8RecompileObserved = false;
  settlementTimer = null;
  mark('RESTORED_AFTER_CANONICAL_MAP_RETURN');
  host?.dispatchEvent?.(new CustomEvent('td613:ash:a8-map-return-restored', {
    detail:Object.freeze({
      schema:'td613.ash.a8-map-return-receipt/v0.7-trusted-idempotent-return',
      restored_controls:finalParity.matched,
      expected_controls:finalParity.expected,
      full_control_parity:true,
      precommit_shadow_capture:true,
      canonical_map_gesture_observed:true,
      trusted_window_capture:true,
      idempotent_map_return_admitted:true,
      canonical_map_alignment_observed:true,
      final_whole_instrument_refresh_observed:true,
      a8_recompiled_after_final_refresh:true,
      quiet_window_ms:SETTLEMENT_QUIET_MS,
      source_posture:'PREHOLD_VISIBLE_COMMIT_CAPTURE',
      workshop_visible_after_restore:true,
      authority_changed:false,
      source_bytes_moved:false,
      custody_changed:false,
      release_posture_changed:false,
      human_closure_required:true
    })
  }));
  return true;
}

function scheduleFinalSettlement() {
  if (!held
    || !mapReturnObserved
    || !alignmentObserved
    || !finalInstrumentRefreshObserved
    || !postRefreshA8RecompileObserved
    || !canonicalMapIsOpen()) return false;
  clearSettlementTimer();
  const parity = restoreAll();
  if (!parity.complete) {
    mark('MAP_RETURN_RESTORE_HELD');
    return false;
  }
  mark('MAP_RETURN_FINAL_OWNER_PARITY_OBSERVED');
  const serial = ++refreshSerial;
  settlementTimer = host?.setTimeout?.(() => finalizeSettlement(serial), SETTLEMENT_QUIET_MS) ?? null;
  return true;
}

function settleAfterA8Recompile() {
  if (!held || !mapReturnObserved || !canonicalMapIsOpen()) return false;
  clearSettlementTimer();
  const parity = restoreAll();
  if (!parity.complete) {
    mark('MAP_RETURN_RESTORE_HELD');
    return false;
  }
  if (!alignmentObserved) {
    mark('MAP_RETURN_PARITY_WAITING_ALIGNMENT');
    return true;
  }
  if (!finalInstrumentRefreshObserved) {
    mark('MAP_RETURN_PARITY_WAITING_FINAL_INSTRUMENT_REFRESH');
    requestFinalInstrumentRefresh();
    return true;
  }
  postRefreshA8RecompileObserved = true;
  return scheduleFinalSettlement();
}

function observeMapAlignment(event) {
  if (!held || !mapReturnObserved || event.detail?.workspace !== 'map') return false;
  alignmentObserved = true;
  clearSettlementTimer();
  mark('MAP_RETURN_ALIGNMENT_OBSERVED');
  requestFinalInstrumentRefresh();
  return true;
}

export function installAshA8MapReturnHandshake() {
  if (!host || !doc?.body || host.__td613AshA8MapReturnHandshake) return false;
  ensureStyles();
  host.addEventListener('click', observeTrustedCanonicalMapGesture, true);
  doc.addEventListener('click', captureBeforeCommit, true);
  doc.addEventListener('input', captureDelegatedForm, true);
  doc.addEventListener('change', captureDelegatedForm, true);
  doc.addEventListener('td613:ash-keep:action-held', arm);
  host.addEventListener('td613:ash:ux-workspace-opened', requestConfirmedMapRefresh);
  host.addEventListener('td613:ash:ux-workspace-aligned', observeMapAlignment);
  host.addEventListener('td613:ash:whole-instrument-refreshed', observeWholeInstrumentRefresh);
  host.addEventListener('td613:ash:a8-recompiled', settleAfterA8Recompile);
  host.addEventListener('td613:ash:case-created', clear);
  host.addEventListener('td613:ash:case-closed', clear);
  const api = Object.freeze({
    version:ASH_A8_MAP_RETURN_HANDSHAKE_VERSION,
    capture:captureAll,
    restore:restoreAll,
    current:() => Object.freeze({
      held,
      map_return_observed:mapReturnObserved,
      alignment_observed:alignmentObserved,
      final_refresh_requested:finalRefreshRequested,
      final_instrument_refresh_observed:finalInstrumentRefreshObserved,
      post_refresh_a8_recompile_observed:postRefreshA8RecompileObserved,
      draft_controls:draft.size,
      posture:doc?.documentElement?.dataset?.ashA8MapReturnHandshake || null,
      quiet_window_ms:SETTLEMENT_QUIET_MS
    }),
    authority:Object.freeze({ authority_changed:false, source_bytes_moved:false, custody_changed:false, release_posture_changed:false, human_closure_required:true })
  });
  host.__td613AshA8MapReturnHandshake = api;
  mark('READY');
  return true;
}

if (host && doc) installAshA8MapReturnHandshake();
