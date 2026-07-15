export const ASH_WORKSPACE_BRIDGE_VERSION = 'td613.ash-keep.workspace-bridge/v0.2-action-gates';

const installedDocuments = new WeakSet();

const STATE_RANK = Object.freeze({
  ARRIVAL_UNPERSISTED: 0,
  READINESS_OBSERVED: 1,
  CUSTODY_ROOT_PROVISIONAL: 2,
  CUSTODY_ROOT_VERIFIED: 3,
  CASE_BOUND: 4,
  REBUILD_ELIGIBLE: 5,
  RELEASE_ELIGIBLE: 6,
  CONTINUITY_SEALED: 7
});

const ACTION_REQUIREMENTS = Object.freeze({
  addRoom: 'CASE_BOUND',
  addObject: 'CASE_BOUND',
  addRelationship: 'CASE_BOUND',
  saveRule: 'CASE_BOUND',
  recordRoute: 'CASE_BOUND',
  runTest: 'CASE_BOUND',
  loadSeed: 'CASE_BOUND',
  replayTest: 'CASE_BOUND',
  recordUnexpected: 'CASE_BOUND',
  draftTest: 'CASE_BOUND',
  keepDraft: 'REBUILD_ELIGIBLE',
  reviewDraft: 'REBUILD_ELIGIBLE',
  compareDrafts: 'REBUILD_ELIGIBLE',
  screenProvider: 'REBUILD_ELIGIBLE',
  askHush: 'REBUILD_ELIGIBLE',
  makeSave: 'RELEASE_ELIGIBLE',
  exportCapsule: 'RELEASE_ELIGIBLE'
});

function lifecycleState(doc) {
  return String(doc?.body?.dataset?.ashLifecycle || 'ARRIVAL_UNPERSISTED').toUpperCase();
}

function stateAllows(state, required) {
  return Number.isInteger(STATE_RANK[state]) && STATE_RANK[state] >= STATE_RANK[required];
}

function openCustody(doc, host, reason, actionId) {
  const status = doc.getElementById('custodyStatus');
  if (status) status.textContent = reason;
  const openWorkspace = host.__td613OpenAshWorkspace;
  if (typeof openWorkspace === 'function') {
    openWorkspace('custody');
    return true;
  }
  doc.dispatchEvent(new host.CustomEvent('td613:ash-keep:workspace-bridge-held', {
    detail: {
      workspace: 'custody',
      action_id: actionId || null,
      reason: 'BASE_WORKSPACE_CAPABILITY_UNAVAILABLE',
      bridge: ASH_WORKSPACE_BRIDGE_VERSION
    }
  }));
  return false;
}

export function installAshWorkspaceBridge(doc = globalThis.document, host = globalThis.window) {
  if (!doc || !host || installedDocuments.has(doc)) return false;

  doc.addEventListener('click', event => {
    const custodyTab = event.target?.closest?.('.work-tab[data-workspace="custody"]');
    if (custodyTab) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openCustody(doc, host, 'Ash Custody opened.', 'custody-tab');
      return;
    }

    const action = event.target?.closest?.('[id]');
    const actionId = action?.id || '';
    const state = lifecycleState(doc);

    if (actionId === 'bindCustodyRoot' && stateAllows(state, 'CASE_BOUND')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const status = doc.getElementById('custodyStatus');
      if (status) status.textContent = 'Custody root already bound to the current case. The Case Map digest remains unchanged.';
      doc.dispatchEvent(new host.CustomEvent('td613:ash-keep:custody-rebind-noop', {
        detail: { state, action_id: actionId, bridge: ASH_WORKSPACE_BRIDGE_VERSION }
      }));
      return;
    }

    const required = ACTION_REQUIREMENTS[actionId];
    if (!required || stateAllows(state, required)) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    openCustody(
      doc,
      host,
      `${action?.textContent?.trim() || actionId} held · ${required} required; current lifecycle state ${state}.`,
      actionId
    );
    doc.dispatchEvent(new host.CustomEvent('td613:ash-keep:action-held', {
      detail: { action_id: actionId, required_state: required, current_state: state, bridge: ASH_WORKSPACE_BRIDGE_VERSION }
    }));
  }, true);

  installedDocuments.add(doc);
  return true;
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  installAshWorkspaceBridge(document, window);
}
