export const ASH_A8_DIRTY_DRAFT_RECOMPILE_GUARD_VERSION = 'td613.ash.a8-dirty-draft-recompile-guard/v0.3-post-sync-restore-owner';

const host = globalThis.window;
const doc = globalThis.document;
const FORM_SELECTOR = '#ashA8ObjectForm,#ashA8RelationForm';
const COMMIT_SELECTOR = '#ashA8CommitObject,#ashA8CommitRelation';
const admittedDirtyEvents = new WeakSet();
let dirtyDraftActive = false;
let recoveredInFlightRecompiles = 0;
let recoveredPremiumRefreshes = 0;
let recoveredPostSyncRenders = 0;
let recoverySerial = 0;
let staleDetachedEventsHeld = 0;
let staleDetachedValuesTransplanted = 0;

function mapWorkshopSignals() {
  const workspace = doc?.getElementById?.('workspace-map');
  const workshop = doc?.getElementById?.('ashA8RelationWorkshop');
  return Object.freeze({
    workshop_connected:workshop?.isConnected === true,
    premium_map_signal:doc?.documentElement?.dataset?.ashPremiumWorkspace === 'map',
    active_map_panel_signal:workspace?.classList?.contains?.('active') === true
  });
}

function canonicalMapWorkshopIsActive() {
  const signals = mapWorkshopSignals();
  return signals.workshop_connected
    && (signals.premium_map_signal || signals.active_map_panel_signal);
}

function workshopIsConnected() {
  return doc?.getElementById?.('ashA8RelationWorkshop')?.isConnected === true;
}

function custodyHoldIsActive() {
  return host?.__td613AshA8MapReturnHandshake?.current?.().held === true;
}

function publish(posture, source = null, detail = {}) {
  if (doc?.documentElement) doc.documentElement.dataset.ashA8DirtyDraftGuard = posture;
  const signals = mapWorkshopSignals();
  host?.dispatchEvent?.(new CustomEvent('td613:ash:a8-dirty-draft-guard', {
    detail:Object.freeze({
      schema:'td613.ash.a8-dirty-draft-guard-receipt/v0.9-detached-gesture-continuity',
      posture,
      source,
      dirty_draft_active:dirtyDraftActive,
      map_workshop_active:signals.workshop_connected && (signals.premium_map_signal || signals.active_map_panel_signal),
      workshop_connected:signals.workshop_connected,
      premium_map_signal:signals.premium_map_signal,
      active_map_panel_signal:signals.active_map_panel_signal,
      custody_hold_active:custodyHoldIsActive(),
      recovered_in_flight_recompiles:recoveredInFlightRecompiles,
      recovered_premium_refreshes:recoveredPremiumRefreshes,
      recovered_post_sync_renders:recoveredPostSyncRenders,
      recovery_serial:recoverySerial,
      stale_detached_events_held:staleDetachedEventsHeld,
      stale_detached_values_transplanted:staleDetachedValuesTransplanted,
      authority_changed:false,
      source_bytes_moved:false,
      custody_changed:false,
      release_posture_changed:false,
      human_closure_required:true,
      ...detail
    })
  }));
}

function transplantDetachedEdit(target) {
  const id = String(target?.id || '');
  if (!id || !target?.closest?.(FORM_SELECTOR)) return Object.freeze({ transplanted:false, control_id:id || null, reason:'UNIDENTIFIED_CONTROL' });
  const live = doc?.getElementById?.(id);
  if (!live?.isConnected || live === target) return Object.freeze({ transplanted:false, control_id:id, reason:'LIVE_REPLACEMENT_UNAVAILABLE' });
  if (live.tagName !== target.tagName || String(live.type || '') !== String(target.type || '')) {
    return Object.freeze({ transplanted:false, control_id:id, reason:'CONTROL_SHAPE_MISMATCH' });
  }
  const intendedValue = String(target.value ?? '');
  if (live.tagName === 'SELECT' && ![...live.options].some(option => option.value === intendedValue)) {
    return Object.freeze({ transplanted:false, control_id:id, reason:'INTENDED_OPTION_UNAVAILABLE' });
  }
  live.value = intendedValue;
  if ('checked' in target && 'checked' in live) live.checked = Boolean(target.checked);
  const valueMatches = String(live.value ?? '') === intendedValue;
  const checkedMatches = !('checked' in target) || !('checked' in live) || Boolean(live.checked) === Boolean(target.checked);
  if (!valueMatches || !checkedMatches) return Object.freeze({ transplanted:false, control_id:id, reason:'LIVE_REPLACEMENT_REJECTED_VALUE' });
  host?.__td613AshA8MapReturnHandshake?.capture?.();
  dirtyDraftActive = true;
  staleDetachedValuesTransplanted += 1;
  return Object.freeze({
    transplanted:true,
    control_id:id,
    intended_value:intendedValue,
    intended_checked:'checked' in target ? Boolean(target.checked) : null
  });
}

function beginDirtyDraft(event) {
  const target = event.target;
  if (!target?.closest?.(FORM_SELECTOR) || custodyHoldIsActive()) return false;
  if (target.isConnected !== true) {
    staleDetachedEventsHeld += 1;
    event.stopImmediatePropagation?.();
    const continuity = transplantDetachedEdit(target);
    publish(continuity.transplanted ? 'STALE_DETACHED_EDIT_VALUE_TRANSPLANTED' : 'STALE_DETACHED_EDIT_EVENT_HELD', event.type, {
      admission_boundary:'WINDOW_CAPTURE_BEFORE_DOCUMENT_REFRESH',
      stale_detached_event:true,
      authored_value_preserved:continuity.transplanted,
      control_id:continuity.control_id,
      transplant_reason:continuity.reason || null
    });
    return continuity.transplanted;
  }
  if (admittedDirtyEvents.has(event)) return true;
  admittedDirtyEvents.add(event);
  host?.__td613AshA8MapReturnHandshake?.capture?.();
  dirtyDraftActive = true;
  publish('DIRTY_DRAFT_ACTIVE', event.type, {
    admission_boundary:'WINDOW_CAPTURE_BEFORE_DOCUMENT_REFRESH'
  });
  return true;
}

function admitCommit(event) {
  if (!event.target?.closest?.(COMMIT_SELECTOR)) return false;
  recoverySerial += 1;
  dirtyDraftActive = false;
  publish('COMMIT_GESTURE_ADMITTED', 'VISIBLE_COMMIT_CAPTURE');
  return true;
}

function restoreCurrentShadow(posture, source, detail = {}) {
  if (!dirtyDraftActive || custodyHoldIsActive() || !workshopIsConnected()) return false;
  const parity = host?.__td613AshA8MapReturnHandshake?.restore?.() || null;
  const recovered = parity?.complete === true;
  publish(recovered ? posture : 'DIRTY_DRAFT_RECOVERY_HELD', source, {
    expected_controls:parity?.expected ?? 0,
    matched_controls:parity?.matched ?? 0,
    full_control_parity:recovered,
    ...detail
  });
  return recovered;
}

function recoverAfterPremiumRefresh(source, detail = {}) {
  const recovered = restoreCurrentShadow('DIRTY_DRAFT_RECOVERED_AFTER_PREMIUM_REFRESH', source, {
    recovery_origin:'AWAITED_PREMIUM_REFRESH',
    recovery_phase:'POST_PREMIUM_REFRESH_PRE_STAGE_SYNC',
    stale_token:Boolean(detail?.stale_token),
    guard_reason:detail?.guard_reason || null
  });
  if (recovered) recoveredPremiumRefreshes += 1;
  return recovered;
}

function recoverAfterStageSync(source, detail = {}) {
  const recovered = restoreCurrentShadow('DIRTY_DRAFT_RECOVERED_AFTER_STAGE_SYNC', source, {
    recovery_origin:'POST_STAGE_SYNC_RESTORE_ARBITRATION',
    recovery_phase:'POST_STAGE_SYNC_PRE_GENERIC_DRAFT_RESTORE',
    guard_reason:detail?.guard_reason || null,
    active_stage_interaction:Boolean(detail?.active_stage_interaction),
    generic_draft_restore_suppressed:detail?.generic_draft_restore_suppressed === true,
    authoritative_restore_owner:'A8_MAP_RETURN_HANDSHAKE_SHADOW'
  });
  if (recovered) recoveredPostSyncRenders += 1;
  return recovered;
}

function completeQueuedRecovery(serial, source) {
  if (serial !== recoverySerial || !dirtyDraftActive || custodyHoldIsActive() || !workshopIsConnected()) return false;
  const restoreOwner = host?.__td613AshA8MapReturnHandshake?.restore;
  if (typeof restoreOwner !== 'function') return false;
  const recovered = restoreCurrentShadow('DIRTY_DRAFT_RECOVERED_AFTER_IN_FLIGHT_RECOMPILE', source, {
    recovery_origin:'POST_CORE_GENERIC_DRAFT_RESTORE',
    recovery_phase:'POST_A8_RECOMPILED_EVENT_DISPATCH',
    event_dispatch_settled:true,
    connected_workshop_recovery:true
  });
  if (recovered) recoveredInFlightRecompiles += 1;
  return recovered;
}

function recoverAfterInFlightRecompile(event) {
  if (!dirtyDraftActive || custodyHoldIsActive()
    || (!canonicalMapWorkshopIsActive() && !workshopIsConnected())) return false;
  const restoreOwner = host?.__td613AshA8MapReturnHandshake?.restore;
  if (typeof restoreOwner !== 'function') return false;
  const serial = ++recoverySerial;
  const source = event?.detail?.source || 'A8_RECOMPILED';
  queueMicrotask(() => completeQueuedRecovery(serial, source));
  publish('DIRTY_DRAFT_RECOVERY_QUEUED', source, {
    recovery_phase:'A8_RECOMPILED_EVENT_DISPATCH',
    event_dispatch_settled:false
  });
  return true;
}

function clear(source) {
  recoverySerial += 1;
  dirtyDraftActive = false;
  recoveredInFlightRecompiles = 0;
  recoveredPremiumRefreshes = 0;
  recoveredPostSyncRenders = 0;
  staleDetachedEventsHeld = 0;
  staleDetachedValuesTransplanted = 0;
  publish('CLEARED', source);
}

function shouldDefer(source) {
  if (!dirtyDraftActive || custodyHoldIsActive() || !canonicalMapWorkshopIsActive()) return false;
  publish('RECOMPILE_DEFERRED_DIRTY_DRAFT', source, {
    guard_basis:'CONNECTED_WORKSHOP_AND_EITHER_CANONICAL_MAP_SIGNAL'
  });
  return 'DIRTY_STAGE_DRAFT';
}

export function installAshA8DirtyDraftRecompileGuard() {
  if (!host || !doc?.body || host.__td613AshA8RecompileGuard) return false;
  host.addEventListener('focusin', beginDirtyDraft, true);
  host.addEventListener('input', beginDirtyDraft, true);
  host.addEventListener('change', beginDirtyDraft, true);
  doc.addEventListener('input', beginDirtyDraft, true);
  doc.addEventListener('change', beginDirtyDraft, true);
  doc.addEventListener('click', admitCommit, true);
  host.addEventListener('td613:ash:a8-recompiled', recoverAfterInFlightRecompile);
  host.addEventListener('td613:ash:case-created', () => clear('CASE_CREATED'));
  host.addEventListener('td613:ash:case-closed', () => clear('CASE_CLOSED'));
  host.__td613AshA8RecompileGuard = Object.freeze({
    version:ASH_A8_DIRTY_DRAFT_RECOMPILE_GUARD_VERSION,
    shouldDefer,
    recoverAfterRefresh:recoverAfterPremiumRefresh,
    recoverAfterSync:recoverAfterStageSync,
    recover:recoverAfterInFlightRecompile,
    clear,
    current:() => {
      const signals = mapWorkshopSignals();
      return Object.freeze({
        dirty_draft_active:dirtyDraftActive,
        map_workshop_active:signals.workshop_connected && (signals.premium_map_signal || signals.active_map_panel_signal),
        workshop_connected:signals.workshop_connected,
        premium_map_signal:signals.premium_map_signal,
        active_map_panel_signal:signals.active_map_panel_signal,
        custody_hold_active:custodyHoldIsActive(),
        recovered_in_flight_recompiles:recoveredInFlightRecompiles,
        recovered_premium_refreshes:recoveredPremiumRefreshes,
        recovered_post_sync_renders:recoveredPostSyncRenders,
        recovery_serial:recoverySerial,
        stale_detached_events_held:staleDetachedEventsHeld,
        stale_detached_values_transplanted:staleDetachedValuesTransplanted,
        posture:doc?.documentElement?.dataset?.ashA8DirtyDraftGuard || null,
        admission_boundary:'WINDOW_CAPTURE_BEFORE_DOCUMENT_REFRESH',
        guard_basis:'CONNECTED_WORKSHOP_AND_EITHER_CANONICAL_MAP_SIGNAL',
        post_sync_restore_owner:'A8_MAP_RETURN_HANDSHAKE_SHADOW',
        stale_event_policy:'TRANSPLANT_AUTHORED_VALUE_THEN_QUARANTINE',
        authority_changed:false,
        source_bytes_moved:false,
        human_closure_required:true
      });
    }
  });
  publish('READY', 'INSTALL');
  return true;
}

if (host && doc) installAshA8DirtyDraftRecompileGuard();
