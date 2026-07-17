import { randomId, freeze } from './aperture-v31-core.js';
import {
  DESTINATION_HANDOFF_ROLLBACK_SCHEMA, DESTINATION_HANDOFF_CUSTODY_ACCOUNTING_SCHEMA,
  DESTINATION_HANDOFF_REPLAY_SCHEMA, DESTINATION_HANDOFF_DOMAINS,
  SUPPORTED_ROUTE, strings, text, exactArray, sameArray, baseCeiling, rollbackState, accountingState, seal, verifyRecord,
  verifyDestinationHandoffPlan
} from './ash-destination-handoff-core.js';
import {
  verifyDestinationHandoffAuthorization, verifyDestinationHandoffAttempt,
  verifyDestinationHandoffRecipientReceipt
} from './ash-destination-handoff-delivery.js';

export async function compileDestinationHandoffRollback(input = {}, options = {}) {
  const attempt = input.attempt;
  const failures = [];
  if (!await verifyDestinationHandoffAttempt(attempt, options)) failures.push('tamper-attempt-digest-mismatch');
  if (input.rollbackRequested !== true) failures.push('rollback-failure:not-requested');
  if (input.localStateRestored !== true) failures.push('rollback-failure:local-state-not-restored');
  if (input.cancelled === true) failures.push('cancelled-operator-action');
  const failedChecks = strings(failures);
  const state = rollbackState(failedChecks);
  const record = {
    schema: DESTINATION_HANDOFF_ROLLBACK_SCHEMA,
    version: 'v0.1',
    rollback_id: input.rollbackId || randomId('ashhandoffrollback_', options.cryptoImpl || globalThis.crypto),
    created_at: text(input.createdAt || new Date().toISOString()),
    attempt_reference: attempt?.attempt_id || null,
    attempt_digest: attempt?.attempt_digest || null,
    rollback_requested: input.rollbackRequested === true,
    local_state_restored: input.localStateRestored === true,
    transport_stopped: input.transportStopped !== false,
    remote_state_unknown: true,
    remote_deletion_proven: false,
    duplicate_risk_retained: input.duplicateRiskRetained !== false,
    state,
    rollback_verified: state === 'ROLLBACK_COMPLETE',
    failed_checks: failedChecks,
    ...baseCeiling(),
    rollback_digest: null
  };
  record.rollback_digest = await seal(DESTINATION_HANDOFF_DOMAINS.rollback, record, 'rollback_digest', options);
  return freeze(record);
}

export const verifyDestinationHandoffRollback = (value, options = {}) => verifyRecord(DESTINATION_HANDOFF_DOMAINS.rollback, value, 'rollback_digest', DESTINATION_HANDOFF_ROLLBACK_SCHEMA, options);

export async function compileDestinationHandoffCustodyAccounting(input = {}, options = {}) {
  const attempt = input.attempt;
  const receipt = input.recipientReceipt || null;
  const rollback = input.rollback || null;
  const failures = [];
  if (!await verifyDestinationHandoffAttempt(attempt, options)) failures.push('tamper-attempt-digest-mismatch');
  if (receipt && !await verifyDestinationHandoffRecipientReceipt(receipt, options)) failures.push('receipt-digest-mismatch');
  if (rollback && !await verifyDestinationHandoffRollback(rollback, options)) failures.push('rollback-digest-mismatch');
  const delivered = attempt?.outcome === 'DELIVERED' && receipt?.state === 'RECIPIENT_RECEIPT_VERIFIED';
  if (attempt?.outcome === 'DELIVERED' && !receipt) failures.push('receipt-missing');
  if (['REFUSED', 'TIMEOUT', 'PARTIAL', 'CANCELLED'].includes(attempt?.outcome) && !rollback) failures.push('rollback-missing');
  const whatLeft = exactArray(input.whatLeft || attempt?.what_left);
  const whatRemained = exactArray(input.whatRemained || attempt?.what_remained);
  if (!sameArray(whatLeft, attempt?.what_left)) failures.push('receipt-what-left-mismatch');
  if (!sameArray(whatRemained, attempt?.what_remained)) failures.push('receipt-what-remained-mismatch');
  const failedChecks = strings(failures);
  const state = accountingState(failedChecks, delivered);
  const record = {
    schema: DESTINATION_HANDOFF_CUSTODY_ACCOUNTING_SCHEMA,
    version: 'v0.1',
    accounting_id: input.accountingId || randomId('ashhandoffaccounting_', options.cryptoImpl || globalThis.crypto),
    created_at: text(input.createdAt || new Date().toISOString()),
    attempt_reference: attempt?.attempt_id || null,
    attempt_digest: attempt?.attempt_digest || null,
    recipient_receipt_reference: receipt?.receipt_id || null,
    recipient_receipt_digest: receipt?.recipient_receipt_digest || null,
    rollback_reference: rollback?.rollback_id || null,
    rollback_digest: rollback?.rollback_digest || null,
    what_left: whatLeft,
    what_remained: whatRemained,
    what_was_not_sent: exactArray(attempt?.what_was_not_sent),
    what_was_returned: exactArray(input.whatWasReturned),
    what_was_revoked: exactArray(input.whatWasRevoked),
    remote_state_unknown: Boolean(rollback?.remote_state_unknown || attempt?.remote_state_unknown),
    external_deletion_proven: false,
    terminal_attempt_outcome: attempt?.outcome || null,
    state,
    custody_accounted: ['DESTINATION_HANDOFF_COMPLETE', 'DESTINATION_HANDOFF_HELD_ACCOUNTED'].includes(state),
    failed_checks: failedChecks,
    ...baseCeiling(),
    destination_transport_authorized: false,
    release_authorized: false,
    accounting_digest: null
  };
  record.accounting_digest = await seal(DESTINATION_HANDOFF_DOMAINS.custodyAccounting, record, 'accounting_digest', options);
  return freeze(record);
}

export const verifyDestinationHandoffCustodyAccounting = (value, options = {}) => verifyRecord(DESTINATION_HANDOFF_DOMAINS.custodyAccounting, value, 'accounting_digest', DESTINATION_HANDOFF_CUSTODY_ACCOUNTING_SCHEMA, options);

export async function replayDestinationHandoff(input = {}, options = {}) {
  const plan = input.plan;
  const authorization = input.authorization;
  const attempt = input.attempt;
  const receipt = input.recipientReceipt || null;
  const rollback = input.rollback || null;
  const accounting = input.accounting;
  const failures = [];
  if (!await verifyDestinationHandoffPlan(plan, options)) failures.push('replay-plan-invalid');
  if (!await verifyDestinationHandoffAuthorization(authorization, options)) failures.push('replay-authorization-invalid');
  if (!await verifyDestinationHandoffAttempt(attempt, options)) failures.push('replay-attempt-invalid');
  if (receipt && !await verifyDestinationHandoffRecipientReceipt(receipt, options)) failures.push('replay-receipt-invalid');
  if (rollback && !await verifyDestinationHandoffRollback(rollback, options)) failures.push('replay-rollback-invalid');
  if (!await verifyDestinationHandoffCustodyAccounting(accounting, options)) failures.push('replay-accounting-invalid');
  if (authorization?.plan_digest !== plan?.plan_digest) failures.push('replay-plan-authorization-mismatch');
  if (attempt?.authorization_digest !== authorization?.authorization_digest) failures.push('replay-authorization-attempt-mismatch');
  if (accounting?.attempt_digest !== attempt?.attempt_digest) failures.push('replay-attempt-accounting-mismatch');
  if (input.requestedDestinationId && input.requestedDestinationId !== plan?.destination?.destination_id) failures.push('replay-destination-jurisdiction-mismatch');
  if (input.requestedRecipientId && input.requestedRecipientId !== plan?.recipient?.recipient_id) failures.push('replay-recipient-jurisdiction-mismatch');
  if (input.contactDestination === true || input.reexecuteTransport === true || input.reexecuteProvider === true || input.reexecuteReader === true || input.mutateStorage === true) failures.push('replay-execution-beyond-jurisdiction');
  const failedChecks = strings(failures);
  const state = failedChecks.length ? 'REPLAY_HOLD' : 'DESTINATION_HANDOFF_REPLAY_VERIFIED';
  const record = {
    schema: DESTINATION_HANDOFF_REPLAY_SCHEMA,
    version: 'v0.1',
    replay_id: input.replayId || randomId('ashhandoffreplay_', options.cryptoImpl || globalThis.crypto),
    created_at: text(input.createdAt || new Date().toISOString()),
    plan_digest: plan?.plan_digest || null,
    authorization_digest: authorization?.authorization_digest || null,
    attempt_digest: attempt?.attempt_digest || null,
    recipient_receipt_digest: receipt?.recipient_receipt_digest || null,
    rollback_digest: rollback?.rollback_digest || null,
    accounting_digest: accounting?.accounting_digest || null,
    requested_destination_id: text(input.requestedDestinationId || plan?.destination?.destination_id) || null,
    requested_recipient_id: text(input.requestedRecipientId || plan?.recipient?.recipient_id) || null,
    state,
    replay_verified: state === 'DESTINATION_HANDOFF_REPLAY_VERIFIED',
    failed_checks: failedChecks,
    destination_contacted: false,
    transport_reexecuted: false,
    provider_reexecuted: false,
    reader_reexecuted: false,
    storage_mutated: false,
    raw_body_restored: false,
    raw_corpus_restored: false,
    ...baseCeiling(),
    destination_transport_authorized: false,
    release_authorized: false,
    replay_digest: null
  };
  record.replay_digest = await seal(DESTINATION_HANDOFF_DOMAINS.replay, record, 'replay_digest', options);
  return freeze(record);
}

export const verifyDestinationHandoffReplay = (value, options = {}) => verifyRecord(DESTINATION_HANDOFF_DOMAINS.replay, value, 'replay_digest', DESTINATION_HANDOFF_REPLAY_SCHEMA, options);

export const DESTINATION_HANDOFF_CAPABILITIES = freeze({
  route: SUPPORTED_ROUTE,
  maximum_reference_count: 16,
  transport_capability: 'NAMED_SAME_ORIGIN_BROWSER_RECIPIENT',
  serverless_function_required: false,
  general_release_authority: false,
  broadcast_authority: false,
  universal_transport_authority: false,
  cinder_authority: false
});
