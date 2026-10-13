import assert from 'node:assert/strict';
import {
  DESTINATION_HANDOFF_DOMAINS,
  compileDestinationHandoffPlan,
  compileDestinationHandoffAuthorization,
  compileDestinationHandoffAttempt,
  compileDestinationHandoffRecipientReceipt,
  compileDestinationHandoffRollback,
  compileDestinationHandoffCustodyAccounting,
  replayDestinationHandoff,
  verifyDestinationHandoffPlan,
  verifyDestinationHandoffAuthorization,
  verifyDestinationHandoffAttempt,
  verifyDestinationHandoffRecipientReceipt,
  verifyDestinationHandoffRollback,
  verifyDestinationHandoffCustodyAccounting,
  verifyDestinationHandoffReplay
} from '../app/engine/ash-destination-handoff.js';

const digest = letter => `sha256:${letter.repeat(64)}`;
const references = [
  {
    referenceId: 'reference:artifact-one', evidenceClass: 'ARTIFACT_DIGEST', sourceId: 'source:artifact-one',
    sourceLocalReference: 'artifact:fixture-one', verificationReference: 'verification:artifact-one', verificationDigest: digest('a')
  },
  {
    referenceId: 'reference:receipt-one', evidenceClass: 'RECEIPT_DIGEST', sourceId: 'source:receipt-one',
    sourceLocalReference: 'receipt:fixture-one', verificationReference: 'verification:receipt-one', verificationDigest: digest('b')
  }
];

const planInput = {
  handoffId: 'ashhandoff_stretch11_fixture', createdAt: '2026-07-17T02:30:00.000Z',
  destinationId: 'destination:same-origin-closure-witness', destinationClass: 'SAME_ORIGIN_STATIC_RECIPIENT',
  destinationRoute: 'SAME_ORIGIN_MESSAGE_CHANNEL', destinationOrigin: 'SAME_ORIGIN',
  recipientId: 'recipient:ash-closure-witness', expectedRecipientId: 'recipient:ash-closure-witness',
  recipientClass: 'NAMED_SYNTHETIC_CUSTODY_RECIPIENT', recipientPosture: 'READY',
  manifestId: 'manifest:stretch11-fixture', purpose: 'VALIDATE_FINAL_DESTINATION_HANDOFF', scopeVersion: '1',
  references, custodyRootReference: 'custody-root:fixture', custodyRootDigest: digest('c'), provenanceCurrent: true,
  elapsedMs: 1000, expiryLimitMs: 60000, declaredDigestDomain: DESTINATION_HANDOFF_DOMAINS.plan
};

const plan = await compileDestinationHandoffPlan(planInput);
assert.equal(plan.state, 'DESTINATION_HANDOFF_PLAN_ELIGIBLE');
assert.equal(plan.plan_eligible, true);
assert.equal(plan.scope.reference_count, 2);
assert.equal(plan.scope.raw_body_present, false);
assert.equal(plan.scope.raw_corpus_present, false);
assert.equal(plan.universal_join_key, null);
assert.equal(plan.broadcast_authorized, false);
assert.equal(plan.universal_transport_authorized, false);
assert.equal(plan.cinder_action_authorized, false);
assert.equal(await verifyDestinationHandoffPlan(plan), true);

const authorization = await compileDestinationHandoffAuthorization({
  plan, authorizationId: 'ashhandoffauth_fixture', createdAt: '2026-07-17T02:31:00.000Z',
  destinationId: plan.destination.destination_id, recipientId: plan.recipient.recipient_id,
  recipientPosture: 'READY', operatorGesture: 'AUTHORIZE_EXACT_DESTINATION_HANDOFF', operatorConfirmed: true,
  declaredDigestDomain: DESTINATION_HANDOFF_DOMAINS.authorization
});
assert.equal(authorization.state, 'DESTINATION_HANDOFF_AUTHORIZED');
assert.equal(authorization.destination_transport_authorized, true);
assert.equal(authorization.release_authorized, false);
assert.equal(await verifyDestinationHandoffAuthorization(authorization), true);

const attempt = await compileDestinationHandoffAttempt({
  plan, authorization, attemptId: 'ashhandoffattempt_fixture', createdAt: '2026-07-17T02:32:00.000Z',
  observedDestinationId: plan.destination.destination_id, observedRecipientId: plan.recipient.recipient_id,
  observedPlanDigest: plan.plan_digest, outcome: 'DELIVERED', sentReferenceIds: plan.scope.reference_ids,
  provenanceCurrent: true, messageChannelUsed: true, iframeRecipientUsed: true, sameOrigin: true,
  declaredDigestDomain: DESTINATION_HANDOFF_DOMAINS.attempt
});
assert.equal(attempt.state, 'DELIVERY_EXECUTED_AWAITING_RECEIPT');
assert.equal(attempt.what_left.length, 2);
assert.equal(attempt.what_remained.length, 0);
assert.equal(attempt.transport_observation.network_request_used, false);
assert.equal(attempt.transport_observation.serverless_function_used, false);
assert.equal(await verifyDestinationHandoffAttempt(attempt), true);

const receipt = await compileDestinationHandoffRecipientReceipt({
  attempt, receiptId: 'ashrecipientreceipt_fixture', createdAt: '2026-07-17T02:33:00.000Z',
  destinationId: attempt.destination_id, recipientId: attempt.recipient_id, attemptDigest: attempt.attempt_digest,
  posture: 'ACCEPTED', receivedReferenceIds: attempt.sent_reference_ids,
  declaredDigestDomain: DESTINATION_HANDOFF_DOMAINS.recipientReceipt
});
assert.equal(receipt.state, 'RECIPIENT_RECEIPT_VERIFIED');
assert.equal(receipt.receipt_verified, true);
assert.equal(receipt.truth_inferred, false);
assert.equal(receipt.reuse_authorized, false);
assert.equal(await verifyDestinationHandoffRecipientReceipt(receipt), true);

const accounting = await compileDestinationHandoffCustodyAccounting({
  attempt, recipientReceipt: receipt, accountingId: 'ashhandoffaccounting_fixture',
  createdAt: '2026-07-17T02:34:00.000Z', whatLeft: attempt.what_left, whatRemained: attempt.what_remained
});
assert.equal(accounting.state, 'DESTINATION_HANDOFF_COMPLETE');
assert.equal(accounting.custody_accounted, true);
assert.equal(accounting.external_deletion_proven, false);
assert.equal(await verifyDestinationHandoffCustodyAccounting(accounting), true);

const replay = await replayDestinationHandoff({
  plan, authorization, attempt, recipientReceipt: receipt, accounting,
  replayId: 'ashhandoffreplay_fixture', createdAt: '2026-07-17T02:35:00.000Z'
});
assert.equal(replay.state, 'DESTINATION_HANDOFF_REPLAY_VERIFIED');
assert.equal(replay.replay_verified, true);
assert.equal(replay.destination_contacted, false);
assert.equal(replay.transport_reexecuted, false);
assert.equal(replay.provider_reexecuted, false);
assert.equal(replay.reader_reexecuted, false);
assert.equal(await verifyDestinationHandoffReplay(replay), true);

assert.equal((await compileDestinationHandoffPlan({ ...planInput, destinationId: '' })).state, 'DESTINATION_HOLD');
assert.equal((await compileDestinationHandoffPlan({ ...planInput, recipientId: '' })).state, 'RECIPIENT_HOLD');
assert.equal((await compileDestinationHandoffPlan({ ...planInput, expectedRecipientId: 'recipient:other' })).state, 'RECIPIENT_MISMATCH_HOLD');
assert.equal((await compileDestinationHandoffPlan({ ...planInput, rawBodyIncluded: true })).state, 'SCOPE_HOLD');
assert.equal((await compileDestinationHandoffPlan({ ...planInput, provenanceCurrent: false })).state, 'PROVENANCE_HOLD');
assert.equal((await compileDestinationHandoffPlan({ ...planInput, elapsedMs: 61000 })).state, 'EXPIRY_HOLD');
assert.equal((await compileDestinationHandoffPlan({ ...planInput, declaredDigestDomain: 'TD613:WRONG:v1' })).state, 'WRONG_DOMAIN_HOLD');
assert.equal((await compileDestinationHandoffPlan({ ...planInput, cancelled: true })).state, 'CANCELLED_HOLD');
assert.equal((await compileDestinationHandoffAuthorization({ plan, operatorConfirmed: false })).state, 'CANCELLED_HOLD');
assert.equal((await compileDestinationHandoffAuthorization({ plan, operatorConfirmed: true, operatorGesture: 'AUTHORIZE_EXACT_DESTINATION_HANDOFF', recipientPosture: 'REFUSED' })).state, 'REFUSAL_HOLD');

assert.equal((await compileDestinationHandoffAttempt({ plan, authorization, outcome: 'REFUSED' })).state, 'REFUSAL_HOLD');
assert.equal((await compileDestinationHandoffAttempt({ plan, authorization, outcome: 'TIMEOUT' })).state, 'TIMEOUT_HOLD');
const partial = await compileDestinationHandoffAttempt({ plan, authorization, outcome: 'PARTIAL', sentReferenceIds: [plan.scope.reference_ids[0]] });
assert.equal(partial.state, 'PARTIAL_DELIVERY_HOLD');
assert.equal((await compileDestinationHandoffAttempt({ plan, authorization, outcome: 'DELIVERED', duplicateAttempt: true })).state, 'DUPLICATE_HOLD');
assert.equal((await compileDestinationHandoffAttempt({ plan, authorization, outcome: 'DELIVERED', observedRecipientId: 'recipient:other' })).state, 'RECIPIENT_MISMATCH_HOLD');

const badReceipt = await compileDestinationHandoffRecipientReceipt({ attempt, posture: 'ACCEPTED', receivedReferenceIds: [attempt.sent_reference_ids[0]] });
assert.equal(badReceipt.state, 'RECEIPT_HOLD');
const refusedReceipt = await compileDestinationHandoffRecipientReceipt({ attempt, posture: 'REFUSED', receivedReferenceIds: [] });
assert.equal(refusedReceipt.state, 'REFUSAL_HOLD');

const rollback = await compileDestinationHandoffRollback({
  attempt: partial, rollbackId: 'ashhandoffrollback_fixture', rollbackRequested: true, localStateRestored: true,
  transportStopped: true, duplicateRiskRetained: true
});
assert.equal(rollback.state, 'ROLLBACK_COMPLETE');
assert.equal(rollback.remote_deletion_proven, false);
assert.equal(await verifyDestinationHandoffRollback(rollback), true);
assert.equal((await compileDestinationHandoffRollback({ attempt: partial, rollbackRequested: true, localStateRestored: false })).state, 'ROLLBACK_HOLD');

const heldAccounting = await compileDestinationHandoffCustodyAccounting({
  attempt: partial, rollback, whatLeft: partial.what_left, whatRemained: partial.what_remained
});
assert.equal(heldAccounting.state, 'DESTINATION_HANDOFF_HELD_ACCOUNTED');
assert.equal(heldAccounting.custody_accounted, true);

const tampered = JSON.parse(JSON.stringify(attempt));
tampered.recipient_id = 'recipient:tampered';
assert.equal(await verifyDestinationHandoffAttempt(tampered), false);
const replayHold = await replayDestinationHandoff({
  plan, authorization, attempt, recipientReceipt: receipt, accounting, contactDestination: true
});
assert.equal(replayHold.state, 'REPLAY_HOLD');
assert.equal(replayHold.destination_contacted, false);
const crossRecipientReplay = await replayDestinationHandoff({
  plan, authorization, attempt, recipientReceipt: receipt, accounting, requestedRecipientId: 'recipient:other'
});
assert.equal(crossRecipientReplay.state, 'REPLAY_HOLD');

console.log('ash-destination-handoff.test.mjs passed');
