export const ASH_FLOWCORE_WORKSPACE_REMOUNT_VERSION = 'td613.ash.flowcore-workspace-remount/v0.2-delegated-motion-owner';

const host = globalThis.window;
const doc = globalThis.document;
let queued = false;
let currentReceipt = null;
let currentPlayReceipt = null;

function visibleCanonicalFields() {
  if (!doc) return [];
  return [...doc.querySelectorAll('.ash-flowcore-field:not(.ash-flowcore-field--proxy):not([hidden])')]
    .filter(field => {
      if (!field?.isConnected) return false;
      const style = getComputedStyle(field);
      const rect = field.getBoundingClientRect();
      return style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number(style.opacity) > 0
        && rect.width > 0
        && rect.height > 0;
    });
}

function publish(reason, before, refreshed, after) {
  currentReceipt = Object.freeze({
    schema:'td613.ash.flowcore-workspace-remount-receipt/v0.2',
    version:ASH_FLOWCORE_WORKSPACE_REMOUNT_VERSION,
    reason,
    workspace:doc?.documentElement?.dataset?.ashPremiumWorkspace || null,
    before,
    portal_refresh_invoked:refreshed,
    after,
    canonical_visible_field_count:visibleCanonicalFields().length,
    delegated_play_motion_bound:Boolean(doc?.querySelector?.('[data-aia-play][data-aia-play-recovery="LIVE_AIA_REPLAY_DELEGATE"]')),
    authority_changed:false,
    source_bytes_moved:false,
    custody_changed:false,
    transport_authorized:false,
    release_authorized:false,
    human_closure_required:true
  });
  if (doc?.documentElement) {
    doc.documentElement.dataset.ashFlowcoreWorkspaceRemount = String(currentReceipt.canonical_visible_field_count === 1);
    doc.documentElement.dataset.ashFlowcoreWorkspaceRemountReason = reason;
  }
  host?.dispatchEvent?.(new CustomEvent('td613:ash:flowcore-workspace-remounted', { detail:currentReceipt }));
  return currentReceipt;
}

function delegateRecoveredPlayMotion(event) {
  const control = event.target?.closest?.('[data-aia-play][data-aia-play-recovery="LIVE_AIA_REPLAY_DELEGATE"]');
  if (!control) return false;
  const play = host?.__td613AshUiUxRescue?.play;
  const available = typeof play === 'function';
  const started = available ? play() === true : false;
  currentPlayReceipt = Object.freeze({
    schema:'td613.ash.flowcore-recovered-play-motion/v0.1',
    version:ASH_FLOWCORE_WORKSPACE_REMOUNT_VERSION,
    control_owner:control.dataset.aiaPlayOwner || 'LIVE_AIA_REPLAY_DELEGATE',
    tutorial_owner:'LIVE_AIA_REPLAY',
    motion_owner:'ASH_UI_UX_RESCUE',
    motion_api_available:available,
    motion_started:started,
    canonical_visible_field_count:visibleCanonicalFields().length,
    authority_changed:false,
    source_bytes_moved:false,
    custody_changed:false,
    transport_authorized:false,
    release_authorized:false,
    human_closure_required:true
  });
  if (doc?.documentElement) {
    doc.documentElement.dataset.ashConsequenceMotionPosture = started
      ? 'DELEGATED_TO_UI_UX_RESCUE_PLAY'
      : 'HELD_UI_UX_RESCUE_PLAY_UNAVAILABLE';
  }
  host?.dispatchEvent?.(new CustomEvent('td613:ash:flowcore-recovered-play-motion', { detail:currentPlayReceipt }));
  return started;
}

export function reconcileAshFlowcoreWorkspace(reason = 'EXPLICIT_RECONCILE') {
  if (!host || !doc || queued) return false;
  queued = true;
  queueMicrotask(() => {
    queued = false;
    const portal = host.__td613AshFlowcoreIngressPortal;
    const before = portal?.current?.() || null;
    const refreshed = typeof portal?.refresh === 'function' ? portal.refresh() === true : false;
    const after = portal?.current?.() || null;
    publish(reason, before, refreshed, after);
  });
  return true;
}

export function installAshFlowcoreWorkspaceRemount() {
  if (!host || !doc?.body || host.__td613AshFlowcoreWorkspaceRemount) return false;
  for (const type of ['whole-instrument-refreshed','flowcore-portal-loader-ready']) {
    host.addEventListener(`td613:ash:${type}`, () => reconcileAshFlowcoreWorkspace(`EVENT_${type.toUpperCase()}`));
  }
  doc.addEventListener('click', delegateRecoveredPlayMotion);
  host.__td613AshFlowcoreWorkspaceRemount = Object.freeze({
    version:ASH_FLOWCORE_WORKSPACE_REMOUNT_VERSION,
    reconcile:reconcileAshFlowcoreWorkspace,
    current:() => currentReceipt,
    currentPlay:() => currentPlayReceipt
  });
  reconcileAshFlowcoreWorkspace('INSTALL');
  return true;
}

if (host && doc) installAshFlowcoreWorkspaceRemount();
