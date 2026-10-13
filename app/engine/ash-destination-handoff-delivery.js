import { clone, randomId, freeze } from './aperture-v31-core.js';
import {
  DESTINATION_HANDOFF_AUTHORIZATION_SCHEMA, DESTINATION_HANDOFF_ATTEMPT_SCHEMA,
  DESTINATION_HANDOFF_RECIPIENT_RECEIPT_SCHEMA, DESTINATION_HANDOFF_DOMAINS,
  SUPPORTED_ROUTE, ATTEMPT_OUTCOMES, RECEIPT_POSTURES, strings, upper, text, exactArray, sameArray, baseCeiling,
  authorizationState, attemptState, receiptState, seal,
  verifyDestinationHandoffPlan, verifyRecord
} from './ash-destination-handoff-core.js';

export async function compileDestinationHandoffAuthorization(input = {}, options = {}) {
  const plan = input.plan;
  const failures = [];
  if (!await verifyDestinationHandoffPlan(plan, options)) failures.push('tamper-plan-digest-mismatch');
  if (plan?.state !== 'DESTINATION_HANDOFF_PLAN_ELIGIBLE') failures.push(`provenance-plan-not-eligible:${plan?.state || 'MISSING'}`);
  if (input.operatorGesture !== 'AUTHORIZE_EXACT_DESTINATION_HANDOFF' || input.operatorConfirmed !== true) failures.push('missing-operator-authorization');
  if (text(input.destinationId || plan?.destination?.destination_id) !== plan?.destination?.destination_id) failures.push('missing-destination-or-destination-mismatch');
  if (text(input.recipientId || plan?.recipient?.recipient_id) !== plan?.recipient?.recipient_id) failures.push('recipient-mismatch');
  if (upper(input.recipientPosture || plan?.recipient?.recipient_posture) === 'REFUSED') failures.push('recipient-refusal');
  if (input.cancelled === true) failures.push('cancelled-operator-action');
  if (input.declaredDigestDomain && input.declaredDigestDomain !== DESTINATION_HANDOFF_DOMAINS.authorization) failures.push('wrong-domain:authorization');
  const failedChecks = strings(failures);
  const state = authorizationState(failedChecks);
  const record = {
    schema: DESTINATION_HANDOFF_AUTHORIZATION_SCHEMA,
    version: 'v0.1',
    authorization_id: input.authorizationId || randomId('ashhandoffauth_', options.cryptoImpl || globalThis.crypto),
    created_at: text(input.createdAt || new Date().toISOString()),
    handoff_reference: plan?.handoff_id || null,
    plan_digest: plan?.plan_digest || null,
    destination_id: plan?.destination?.destination_id || null,
    recipient_id: plan?.recipient?.recipient_id || null,
    manifest_id: plan?.scope?.manifest_id || null,
    reference_ids: exactArray(plan?.scope?.reference_ids),
    purpose: plan?.scope?.purpose || null,
    scope_version: plan?.scope?.version || null,
    expiry_posture: clone(plan?.expiry || null),
    operator_gesture: text(input.operatorGesture) || null,
    operator_confirmed: input.operatorConfirmed === true,
    recipient_posture: upper(input.recipientPosture || plan?.recipient?.recipient_posture),
    state,
    authorization_eligible: state === 'DESTINATION_HANDOFF_AUTHORIZED',
    failed_checks: failedChecks,
    ...baseCeiling(),
    destination_transport_authorized: state === 'DESTINATION_HANDOFF_AUTHORIZED',
    release_authorized: false,
    authorization_digest: null
  };
  record.authorization_digest = await seal(DESTINATION_HANDOFF_DOMAINS.authorization, record, 'authorization_digest', options);
  return freeze(record);
}

export const verifyDestinationHandoffAuthorization = (value, options = {}) => verifyRecord(DESTINATION_HANDOFF_DOMAINS.authorization, value, 'authorization_digest', DESTINATION_HANDOFF_AUTHORIZATION_SCHEMA, options);

export async function compileDestinationHandoffAttempt(input = {}, options = {}) {
  const plan = input.plan;
  const authorization = input.authorization;
  const failures = [];
  if (!await verifyDestinationHandoffPlan(plan, options)) failures.push('tamper-plan-digest-mismatch');
  if (!await verifyDestinationHandoffAuthorization(authorization, options)) failures.push('tamper-authorization-digest-mismatch');
  if (authorization?.state !== 'DESTINATION_HANDOFF_AUTHORIZED') failures.push(`missing-operator-authorization:${authorization?.state || 'MISSING'}`);
  const observedDestinationId = text(input.observedDestinationId || plan?.destination?.destination_id);
  const observedRecipientId = text(input.observedRecipientId || plan?.recipient?.recipient_id);
  const observedPlanDigest = text(input.observedPlanDigest || plan?.plan_digest);
  const outcome = ATTEMPT_OUTCOMES.has(upper(input.outcome || 'DELIVERED')) ? upper(input.outcome || 'DELIVERED') : 'TIMEOUT';
  const sentReferenceIds = exactArray(input.sentReferenceIds || (outcome === 'DELIVERED' ? plan?.scope?.reference_ids : []));
  const plannedReferenceIds = exactArray(plan?.scope?.reference_ids);
  if (!observedDestinationId) failures.push('missing-destination');
  if (observedDestinationId !== plan?.destination?.destination_id) failures.push('missing-destination-or-destination-mismatch');
  if (!observedRecipientId) failures.push('missing-recipient');
  if (observedRecipientId !== plan?.recipient?.recipient_id) failures.push('recipient-mismatch');
  if (observedPlanDigest !== plan?.plan_digest) failures.push('scope-plan-digest-mismatch');
  if (outcome === 'DELIVERED' && !sameArray(sentReferenceIds, plannedReferenceIds)) failures.push('scope-reference-manifest-mismatch');
  if (outcome === 'PARTIAL' && (!sentReferenceIds.length || sentReferenceIds.length >= plannedReferenceIds.length)) failures.push('scope-partial-reference-manifest-invalid');
  if (input.duplicateAttempt === true) failures.push('duplicate-attempt');
  if (input.provenanceCurrent === false || plan?.prerequisites?.provenance_current !== true) failures.push('provenance-not-current');
  if (input.expired === true || plan?.expiry?.expired === true || plan?.expiry?.revoked === true) failures.push('expired-handoff-posture');
  if (input.rawBodyIncluded === true) failures.push('scope-raw-body-present');
  if (input.rawCorpusIncluded === true) failures.push('scope-raw-corpus-present');
  if (input.cancelled === true) failures.push('cancelled-operator-action');
  if (input.declaredDigestDomain && input.declaredDigestDomain !== DESTINATION_HANDOFF_DOMAINS.attempt) failures.push('wrong-domain:attempt');
  const failedChecks = strings(failures);
  const state = attemptState(failedChecks, outcome);
  const whatLeft = sentReferenceIds;
  const whatRemained = plannedReferenceIds.filter(value => !whatLeft.includes(value));
  const record = {
    schema: DESTINATION_HANDOFF_ATTEMPT_SCHEMA,
    version: 'v0.1',
    attempt_id: input.attemptId || randomId('ashhandoffattempt_', options.cryptoImpl || globalThis.crypto),
    created_at: text(input.createdAt || new Date().toISOString()),
    handoff_reference: plan?.handoff_id || null,
    plan_digest: plan?.plan_digest || null,
    authorization_reference: authorization?.authorization_id || null,
    authorization_digest: authorization?.authorization_digest || null,
    destination_id: observedDestinationId || null,
    recipient_id: observedRecipientId || null,
    route: plan?.destination?.destination_route || null,
    outcome,
    sent_reference_ids: whatLeft,
    unsent_reference_ids: whatRemained,
    planned_reference_ids: plannedReferenceIds,
    what_left: whatLeft,
    what_remained: whatRemained,
    what_was_not_sent: whatRemained,
    remote_state_unknown: outcome !== 'DELIVERED',
    state,
    receipt_required: outcome === 'DELIVERED' || outcome === 'PARTIAL',
    attempt_eligible_for_receipt: state === 'DELIVERY_EXECUTED_AWAITING_RECEIPT',
    failed_checks: failedChecks,
    transport_observation: {
      channel: SUPPORTED_ROUTE,
      same_origin: input.sameOrigin !== false,
      message_channel_used: input.messageChannelUsed === true,
      iframe_recipient_used: input.iframeRecipientUsed === true,
      network_request_used: false,
      serverless_function_used: false
    },
    ...baseCeiling(),
    destination_transport_authorized: authorization?.destination_transport_authorized === true,
    release_authorized: false,
    attempt_digest: null
  };
  record.attempt_digest = await seal(DESTINATION_HANDOFF_DOMAINS.attempt, record, 'attempt_digest', options);
  return freeze(record);
}

export const verifyDestinationHandoffAttempt = (value, options = {}) => verifyRecord(DESTINATION_HANDOFF_DOMAINS.attempt, value, 'attempt_digest', DESTINATION_HANDOFF_ATTEMPT_SCHEMA, options);

export async function compileDestinationHandoffRecipientReceipt(input = {}, options = {}) {
  const attempt = input.attempt;
  const failures = [];
  if (!await verifyDestinationHandoffAttempt(attempt, options)) failures.push('tamper-attempt-digest-mismatch');
  const posture = RECEIPT_POSTURES.has(upper(input.posture || 'ACCEPTED')) ? upper(input.posture || 'ACCEPTED') : 'REFUSED';
  const destinationId = text(input.destinationId || attempt?.destination_id);
  const recipientId = text(input.recipientId || attempt?.recipient_id);
  const receivedReferenceIds = exactArray(input.receivedReferenceIds || []);
  if (destinationId !== attempt?.destination_id) failures.push('recipient-mismatch:destination');
  if (recipientId !== attempt?.recipient_id) failures.push('recipient-mismatch');
  if (text(input.attemptDigest || attempt?.attempt_digest) !== attempt?.attempt_digest) failures.push('digest-mismatch:attempt');
  if (posture === 'ACCEPTED' && !sameArray(receivedReferenceIds, attempt?.sent_reference_ids)) failures.push('receipt-reference-manifest-mismatch');
  if (input.rawBodyReceived === true) failures.push('receipt-raw-body-present');
  if (input.rawCorpusReceived === true) failures.push('receipt-raw-corpus-present');
  if (input.cancelled === true) failures.push('cancelled-operator-action');
  if (input.declaredDigestDomain && input.declaredDigestDomain !== DESTINATION_HANDOFF_DOMAINS.recipientReceipt) failures.push('wrong-domain:recipient-receipt');
  const failedChecks = strings(failures);
  const state = receiptState(failedChecks, posture);
  const record = {
    schema: DESTINATION_HANDOFF_RECIPIENT_RECEIPT_SCHEMA,
    version: 'v0.1',
    receipt_id: input.receiptId || randomId('ashrecipientreceipt_', options.cryptoImpl || globalThis.crypto),
    created_at: text(input.createdAt || new Date().toISOString()),
    attempt_reference: attempt?.attempt_id || null,
    attempt_digest: attempt?.attempt_digest || null,
    destination_id: destinationId || null,
    recipient_id: recipientId || null,
    posture,
    received_reference_ids: receivedReferenceIds,
    receipt_verified: state === 'RECIPIENT_RECEIPT_VERIFIED',
    state,
    failed_checks: failedChecks,
    recipient_observations: strings(input.recipientObservations),
    ...baseCeiling(),
    destination_transport_authorized: false,
    release_authorized: false,
    recipient_receipt_digest: null
  };
  record.recipient_receipt_digest = await seal(DESTINATION_HANDOFF_DOMAINS.recipientReceipt, record, 'recipient_receipt_digest', options);
  return freeze(record);
}

export const verifyDestinationHandoffRecipientReceipt = (value, options = {}) => verifyRecord(DESTINATION_HANDOFF_DOMAINS.recipientReceipt, value, 'recipient_receipt_digest', DESTINATION_HANDOFF_RECIPIENT_RECEIPT_SCHEMA, options);
