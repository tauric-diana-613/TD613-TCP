export const ASH_WORKSPACE_BRIDGE_VERSION = 'td613.ash-keep.workspace-bridge/v0.4-exact-action-gates-hold-preservation';

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
  approveRelease: 'REBUILD_ELIGIBLE',
  makeSave: 'RELEASE_ELIGIBLE',
  exportCapsule: 'RELEASE_ELIGIBLE'
});

function lifecycleState(doc) {
  return String(doc?.body?.dataset?.ashLifecycle || 'ARRIVAL_UNPERSISTED').toUpperCase();
}

function stateAllows(state, required) {
  return Number.isInteger(STATE_RANK[state]) && STATE_RANK[state] >= STATE_RANK[required];
}

function requiredStateForGate(gate) {
  if (gate === 'test' || gate === 'routes' || gate === 'case') return 'CASE_BOUND';
  if (gate === 'draft' || gate === 'local_release') return 'REBUILD_ELIGIBLE';
  if (gate === 'save') return 'RELEASE_ELIGIBLE';
  return null;
}

export function actionGateForLifecycleState(state, gate, target = null) {
  const required = requiredStateForGate(gate);
  const rankOpen = Boolean(required && stateAllows(String(state || '').toUpperCase(), required));
  const nativeOpen = gate !== 'local_release' || target?.disabled !== true;
  return Object.freeze({
    allowed: rankOpen && nativeOpen,
    state: String(state || 'ARRIVAL_UNPERSISTED'),
    gate,
    reason: rankOpen && nativeOpen ? 'OPEN' : 'LIFECYCLE_ACTION_HELD'
  });
}

function normalize(value) {
  return value == null ? '' : String(value);
}

function receiptDigest(receipt) {
  return receipt?.manifest?.artifact_metadata?.artifact_digest
    || receipt?.manifest?.artifactMetadata?.artifactDigest
    || receipt?.artifact_metadata?.artifact_digest
    || null;
}

function receiptLocator(receipt) {
  return receipt?.manifest?.source_locator || receipt?.manifest?.sourceLocator || {};
}

function receiptEnvironment(receipt) {
  return receipt?.manifest?.source_environment || receipt?.manifest?.sourceEnvironment || '';
}

function receiptCredential(receipt) {
  return receipt?.manifest?.credential_reference?.credential_type
    || receipt?.manifest?.credentialReference?.credentialType
    || '';
}

function parseReceipt(doc) {
  try {
    return JSON.parse(doc?.getElementById?.('custodyReceipt')?.textContent || 'null');
  } catch {
    return null;
  }
}

function displayedLocalDigest(doc) {
  return doc?.getElementById?.('lifeCommitmentStatus')?.textContent?.match(/sha256:[0-9a-f]{64}/)?.[0] || null;
}

export function registrationMatchesBoundReceipt(doc) {
  if (STATE_RANK[lifecycleState(doc)] < STATE_RANK.CASE_BOUND) return false;
  const receipt = parseReceipt(doc);
  if (!receipt) return false;
  const locator = receiptLocator(receipt);
  const currentDigest = displayedLocalDigest(doc);
  const priorDigest = receiptDigest(receipt);
  const fileSelected = Boolean(doc?.getElementById?.('lifeFile')?.files?.length);
  if (fileSelected) return Boolean(currentDigest && priorDigest && currentDigest === priorDigest);
  return !priorDigest &&
    normalize(doc?.getElementById?.('lifeSourceLabel')?.value) === normalize(locator.label) &&
    normalize(doc?.getElementById?.('lifePathRef')?.value) === normalize(locator.path_or_ref ?? locator.pathOrRef) &&
    normalize(doc?.getElementById?.('lifeSourceEnvironment')?.value) === normalize(receiptEnvironment(receipt)) &&
    normalize(doc?.getElementById?.('lifeCredentialType')?.value) === normalize(receiptCredential(receipt));
}

function openCustody(doc, host, reason, actionId) {
  const status = doc.getElementById('custodyStatus');
  if (status && reason) status.textContent = reason;
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

function holdAction(event, doc, host, action, required, reason) {
  event.preventDefault();
  event.stopImmediatePropagation();
  openCustody(doc, host, reason, action?.id || null);
  doc.dispatchEvent(new host.CustomEvent('td613:ash-keep:action-held', {
    detail: {
      action_id: action?.id || null,
      required_state: required,
      current_state: lifecycleState(doc),
      bridge: ASH_WORKSPACE_BRIDGE_VERSION
    }
  }));
}

export function installAshWorkspaceBridge(doc = globalThis.document, host = globalThis.window) {
  if (!doc || !host || installedDocuments.has(doc)) return false;

  doc.addEventListener('click', event => {
    const custodyTab = event.target?.closest?.('.work-tab[data-workspace="custody"]');
    if (custodyTab) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const existingStatus = doc.getElementById('custodyStatus')?.textContent?.trim() || '';
      const directOpenReason = event.isTrusted && !existingStatus ? 'Ash Custody opened.' : null;
      openCustody(doc, host, directOpenReason, 'custody-tab');
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

    if (actionId === 'registerCustodyRoot' && registrationMatchesBoundReceipt(doc)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const status = doc.getElementById('custodyStatus');
      if (status) status.textContent = 'Identical custody root already registered and bound. No successor receipt or Case Map mutation was created.';
      doc.dispatchEvent(new host.CustomEvent('td613:ash-keep:custody-registration-noop', {
        detail: { state, action_id: actionId, bridge: ASH_WORKSPACE_BRIDGE_VERSION }
      }));
      return;
    }

    if (actionId === 'approveRelease' && (!stateAllows(state, 'REBUILD_ELIGIBLE') || action.disabled === true)) {
      holdAction(
        event,
        doc,
        host,
        action,
        'REVIEW_READY_FOR_LOCAL_RELEASE',
        `${action.textContent?.trim() || actionId} held · exact Draft review and current custody-bound authority are required.`
      );
      return;
    }

    const required = ACTION_REQUIREMENTS[actionId];
    if (!required || stateAllows(state, required)) return;

    holdAction(
      event,
      doc,
      host,
      action,
      required,
      `${action?.textContent?.trim() || actionId} held · ${required} required; current lifecycle state ${state}.`
    );
  }, true);

  installedDocuments.add(doc);
  return true;
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  installAshWorkspaceBridge(document, window);
}
