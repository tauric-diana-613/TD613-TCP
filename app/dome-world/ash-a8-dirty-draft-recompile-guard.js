export const ASH_A8_DIRTY_DRAFT_RECOMPILE_GUARD_VERSION = 'td613.ash.a8-dirty-draft-recompile-guard/v0.1';

const host = globalThis.window;
const doc = globalThis.document;
const FORM_SELECTOR = '#ashA8ObjectForm,#ashA8RelationForm';
const COMMIT_SELECTOR = '#ashA8CommitObject,#ashA8CommitRelation';
let dirtyDraftActive = false;
let recoveredInFlightRecompiles = 0;
let recoveredPremiumRefreshes = 0;
let recoverySerial = 0;

function canonicalMapWorkshopIsActive() {
  const workspace = doc?.getElementById?.('workspace-map');
  const workshop = doc?.getElementById?.('ashA8RelationWorkshop');
  return doc?.documentElement?.dataset?.ashPremiumWorkspace === 'map'
    && workspace?.classList?.contains?.('active') === true
    && workshop?.isConnected === true;
}

function workshopIsConnected() {
  return doc?.getElementById?.('ashA8RelationWorkshop')?.isConnected === true;
}

function custodyHoldIsActive() {
  return host?.__td613AshA8MapReturnHandshake?.current?.().held === true;
}

function publish(posture, source = null, detail = {}) {
  if (doc?.documentElement) doc.documentElement.dataset.ashA8DirtyDraftGuard = posture;
  host?.dispatchEvent?.(new CustomEvent('td613:ash:a8-dirty-draft-guard', {
    detail:Object.freeze({
      schema:'td613.ash.a8-dirty-draft-guard-receipt/v0.4-post-premium-refresh-recovery',
      posture,
      source,
      dirty_draft_active:dirtyDraftActive,
      map_workshop_active:canonicalMapWorkshopIsActive(),
      workshop_connected:workshopIsConnected(),
      custody_hold_active:custodyHoldIsActive(),
      recovered_in_flight_recompiles:recoveredInFlightRecompiles,
      recovered_premium_refreshes:recoveredPremiumRefreshes,
      recovery_serial:recoverySerial,
      authority_changed:false,
      source_bytes_moved:false,
      custody_changed:false,
      release_posture_changed:false,
      human_closure_required:true,
      ...detail
    })
  }));
}

function beginDirtyDraft(event) {
  if (!event.target?.closest?.(FORM_SELECTOR) || custodyHoldIsActive()) return false;
  host?.__td613AshA8MapReturnHandshake?.capture?.();
  dirtyDraftActive = true;
  publish('DIRTY_DRAFT_ACTIVE', event.type);
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
  publish(posture, source, {
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
  publish('CLEARED', source);
}

function shouldDefer(source) {
  if (!dirtyDraftActive || custodyHoldIsActive() || !canonicalMapWorkshopIsActive()) return false;
  publish('RECOMPILE_DEFERRED_DIRTY_DRAFT', source);
  return 'DIRTY_STAGE_DRAFT';
}

export function installAshA8DirtyDraftRecompileGuard() {
  if (!host || !doc?.body || host.__td613AshA8RecompileGuard) return false;
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
    recover:recoverAfterInFlightRecompile,
    clear,
    current:() => Object.freeze({
      dirty_draft_active:dirtyDraftActive,
      map_workshop_active:canonicalMapWorkshopIsActive(),
      workshop_connected:workshopIsConnected(),
      custody_hold_active:custodyHoldIsActive(),
      recovered_in_flight_recompiles:recoveredInFlightRecompiles,
      recovered_premium_refreshes:recoveredPremiumRefreshes,
      recovery_serial:recoverySerial,
      posture:doc?.documentElement?.dataset?.ashA8DirtyDraftGuard || null,
      authority_changed:false,
      source_bytes_moved:false,
      human_closure_required:true
    })
  });
  publish('READY', 'INSTALL');
  return true;
}

if (host && doc) installAshA8DirtyDraftRecompileGuard();
