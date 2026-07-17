import {
  DESTINATION_HANDOFF_DOMAINS,
  compileDestinationHandoffPlan,
  compileDestinationHandoffAuthorization,
  compileDestinationHandoffAttempt,
  compileDestinationHandoffRecipientReceipt,
  compileDestinationHandoffRollback,
  compileDestinationHandoffCustodyAccounting,
  replayDestinationHandoff
} from '/app/engine/ash-destination-handoff.js';

const $ = id => document.getElementById(id);
const state = { plan: null, authorization: null, attempt: null, recipientReceipt: null, rollback: null, accounting: null, replay: null, recipientReady: false };
const digest = letter => `sha256:${letter.repeat(64)}`;
const json = value => JSON.stringify(value, null, 2);
const setState = (label, ok = false) => { $('state').textContent = label; $('state').className = `status ${ok ? 'ok' : 'hold'}`; };
const referenceRows = () => [...new Set($('references').value.split('\n').map(value => value.trim()).filter(Boolean))].sort().map((referenceId, index) => ({
  referenceId,
  evidenceClass: index % 2 ? 'RECEIPT_DIGEST' : 'ARTIFACT_DIGEST',
  sourceId: `source:${index + 1}`,
  sourceLocalReference: index % 2 ? `receipt:stretch11-${index + 1}` : `artifact:stretch11-${index + 1}`,
  verificationReference: `verification:stretch10-${index + 1}`,
  verificationDigest: digest(index % 2 ? 'b' : 'a')
}));

function render() {
  const chain = {
    plan: state.plan,
    authorization: state.authorization,
    attempt: state.attempt,
    recipient_receipt: state.recipientReceipt,
    rollback: state.rollback,
    custody_accounting: state.accounting,
    replay: state.replay
  };
  $('chain').textContent = json(chain);
  $('receipt').textContent = state.accounting ? json({
    state: state.accounting.state,
    what_left: state.accounting.what_left,
    what_remained: state.accounting.what_remained,
    remote_state_unknown: state.accounting.remote_state_unknown,
    external_deletion_proven: state.accounting.external_deletion_proven
  }) : 'No recipient receipt.';
  $('leaves').textContent = state.plan ? json(state.plan.scope.reference_ids) : 'Nothing.';
  $('remains').textContent = state.attempt ? json(state.attempt.what_remained) : 'All references remain in local custody until delivery.';
}

async function prepare() {
  state.plan = await compileDestinationHandoffPlan({
    destinationId: $('destinationId').value,
    destinationClass: 'SAME_ORIGIN_STATIC_RECIPIENT',
    destinationRoute: $('route').value,
    destinationOrigin: location.origin,
    recipientId: $('recipientId').value,
    expectedRecipientId: 'recipient:ash-closure-witness',
    recipientClass: 'NAMED_SYNTHETIC_CUSTODY_RECIPIENT',
    recipientPosture: 'READY',
    recipientMatchBasis: 'EXACT_QUERY_BOUND_RECIPIENT_ID',
    manifestId: 'manifest:stretch11-browser-handoff',
    purpose: $('purpose').value,
    scopeVersion: '1',
    references: referenceRows(),
    custodyRootReference: 'custody-root:stretch9-safe-harbor-bound',
    custodyRootDigest: digest('c'),
    provenanceCurrent: $('current').checked,
    elapsedMs: 1000,
    expiryLimitMs: 300000,
    declaredDigestDomain: DESTINATION_HANDOFF_DOMAINS.plan,
    operatorNotes: ['Browser-local same-origin closure witness fixture.']
  });
  state.authorization = null; state.attempt = null; state.recipientReceipt = null; state.rollback = null; state.accounting = null; state.replay = null;
  const eligible = state.plan.state === 'DESTINATION_HANDOFF_PLAN_ELIGIBLE';
  $('send').disabled = !eligible;
  setState(state.plan.state, eligible);
  render();
}

function deliverPacket(packet) {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    const timeout = setTimeout(() => { channel.port1.close(); reject(new Error('Named recipient timed out.')); }, 8000);
    channel.port1.onmessage = event => { clearTimeout(timeout); channel.port1.close(); resolve(event.data); };
    $('recipientFrame').contentWindow.postMessage(packet, location.origin, [channel.port2]);
  });
}

async function send() {
  if (!state.plan) await prepare();
  if (!$('authorize').checked) {
    state.authorization = await compileDestinationHandoffAuthorization({ plan: state.plan, operatorConfirmed: false });
    setState(state.authorization.state); render(); return;
  }
  state.authorization = await compileDestinationHandoffAuthorization({
    plan: state.plan,
    destinationId: state.plan.destination.destination_id,
    recipientId: state.plan.recipient.recipient_id,
    recipientPosture: 'READY',
    operatorGesture: 'AUTHORIZE_EXACT_DESTINATION_HANDOFF',
    operatorConfirmed: true,
    declaredDigestDomain: DESTINATION_HANDOFF_DOMAINS.authorization
  });
  if (state.authorization.state !== 'DESTINATION_HANDOFF_AUTHORIZED') { setState(state.authorization.state); render(); return; }
  try {
    const observation = await deliverPacket({
      type: 'TD613_ASH_DESTINATION_HANDOFF',
      destination_id: state.plan.destination.destination_id,
      recipient_id: state.plan.recipient.recipient_id,
      plan_digest: state.plan.plan_digest,
      reference_ids: state.plan.scope.reference_ids,
      raw_body_present: false,
      raw_corpus_present: false
    });
    state.attempt = await compileDestinationHandoffAttempt({
      plan: state.plan, authorization: state.authorization,
      observedDestinationId: observation.destination_id,
      observedRecipientId: observation.recipient_id,
      observedPlanDigest: observation.plan_digest,
      outcome: observation.accepted ? 'DELIVERED' : 'REFUSED',
      sentReferenceIds: observation.received_reference_ids,
      provenanceCurrent: true,
      sameOrigin: true, messageChannelUsed: true, iframeRecipientUsed: true,
      declaredDigestDomain: DESTINATION_HANDOFF_DOMAINS.attempt
    });
    state.recipientReceipt = await compileDestinationHandoffRecipientReceipt({
      attempt: state.attempt,
      destinationId: observation.destination_id,
      recipientId: observation.recipient_id,
      attemptDigest: state.attempt.attempt_digest,
      posture: observation.posture,
      receivedReferenceIds: observation.received_reference_ids,
      rawBodyReceived: observation.raw_body_received,
      rawCorpusReceived: observation.raw_corpus_received,
      recipientObservations: ['Static same-origin recipient returned a MessageChannel receipt.'],
      declaredDigestDomain: DESTINATION_HANDOFF_DOMAINS.recipientReceipt
    });
    if (state.attempt.outcome !== 'DELIVERED' || state.recipientReceipt.state !== 'RECIPIENT_RECEIPT_VERIFIED') {
      state.rollback = await compileDestinationHandoffRollback({ attempt: state.attempt, rollbackRequested: true, localStateRestored: true, transportStopped: true });
    }
    state.accounting = await compileDestinationHandoffCustodyAccounting({
      attempt: state.attempt, recipientReceipt: state.recipientReceipt, rollback: state.rollback,
      whatLeft: state.attempt.what_left, whatRemained: state.attempt.what_remained
    });
    state.replay = await replayDestinationHandoff({
      plan: state.plan, authorization: state.authorization, attempt: state.attempt,
      recipientReceipt: state.recipientReceipt, rollback: state.rollback, accounting: state.accounting
    });
    const complete = state.accounting.state === 'DESTINATION_HANDOFF_COMPLETE' && state.replay.replay_verified;
    setState(complete ? 'DESTINATION_HANDOFF_COMPLETE' : state.accounting.state, complete);
  } catch (error) {
    state.attempt = await compileDestinationHandoffAttempt({ plan: state.plan, authorization: state.authorization, outcome: 'TIMEOUT', sentReferenceIds: [] });
    state.rollback = await compileDestinationHandoffRollback({ attempt: state.attempt, rollbackRequested: true, localStateRestored: true, transportStopped: true });
    state.accounting = await compileDestinationHandoffCustodyAccounting({ attempt: state.attempt, rollback: state.rollback, whatLeft: [], whatRemained: state.attempt.what_remained });
    setState(`${state.attempt.state} · ${error.message}`);
  }
  render();
}

async function cancel() {
  if (!state.plan) await prepare();
  state.authorization = await compileDestinationHandoffAuthorization({ plan: state.plan, cancelled: true });
  setState(state.authorization.state);
  render();
}

window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.data?.type !== 'TD613_ASH_RECIPIENT_READY') return;
  state.recipientReady = event.data.recipient_id === $('recipientId').value;
});
$('prepare').addEventListener('click', () => prepare().catch(error => setState(error.message)));
$('send').addEventListener('click', () => send().catch(error => setState(error.message)));
$('cancel').addEventListener('click', () => cancel().catch(error => setState(error.message)));
prepare().catch(error => setState(error.message));
window.__td613AshDestinationHandoff = Object.freeze({
  version: 'td613.ash.destination-handoff.browser/v0.1',
  current: () => ({ state: $('state').textContent, recipient_ready: state.recipientReady, accounting: state.accounting, replay: state.replay }),
  prepare,
  send,
  cancel
});
