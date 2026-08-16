import { assertCisternRelease, compileCisternLawReceipt } from '../../app/engine/aia-cistern-law.js';
import { consumeGivingMutationIntent } from './intent-ledger.js';
import { SESSION_ROLES } from './security.js';
import { GivingError, sha256 } from './util.js';

const POLICIES = Object.freeze({
  'campaign-deputy.link-existing': Object.freeze({
    boundary: 'Giving/Campaign-Deputy',
    expected: ['same-origin-session', 'session-bound-intent', 'identity-confirmed', 'exact-person-selected', 'committee-membership-write'],
    observe: (payload) => [
      'same-origin-session',
      'session-bound-intent',
      ...(payload.confirmed === true ? ['identity-confirmed'] : []),
      ...(payload.person_id ? ['exact-person-selected'] : []),
      'committee-membership-write'
    ],
    separatelyConfirmed: false,
    durableReplay: false
  }),
  'campaign-deputy.create-confirmed': Object.freeze({
    boundary: 'Giving/Campaign-Deputy',
    expected: ['same-origin-session', 'session-bound-intent', 'identity-confirmed', 'duplicate-reviewed', 'create-new-confirmed', 'person-create', 'committee-membership-write'],
    observe: (payload) => [
      'same-origin-session',
      'session-bound-intent',
      ...(payload.confirmed === true ? ['identity-confirmed'] : []),
      ...(payload.duplicate_reviewed === true ? ['duplicate-reviewed'] : []),
      ...(payload.create_new_confirmed === true ? ['create-new-confirmed'] : []),
      'person-create',
      'committee-membership-write'
    ],
    separatelyConfirmed: true,
    durableReplay: true
  }),
  'campaign-deputy.ensure-committee': Object.freeze({
    boundary: 'Giving/Campaign-Deputy',
    expected: ['same-origin-session', 'session-bound-intent', 'committee-identity-confirmed', 'committee-list-write'],
    observe: (payload) => [
      'same-origin-session',
      'session-bound-intent',
      ...(payload.confirmed === true ? ['committee-identity-confirmed'] : []),
      'committee-list-write'
    ],
    separatelyConfirmed: true,
    durableReplay: false
  }),
  'campaign-deputy.withhold': Object.freeze({
    boundary: 'Giving/Campaign-Deputy',
    expected: ['same-origin-session', 'session-bound-intent', 'operator-withhold'],
    observe: () => ['same-origin-session', 'session-bound-intent', 'operator-withhold'],
    separatelyConfirmed: true,
    durableReplay: false
  }),
  'session.shared-access.revoke': Object.freeze({
    boundary: 'Giving/Shared-Access',
    expected: ['same-origin-session', 'session-bound-intent', 'owner-session', 'owner-authority-confirmed', 'collaborator-mass-eviction'],
    observe: (payload, session) => [
      'same-origin-session',
      'session-bound-intent',
      ...(session?.role === SESSION_ROLES.OWNER ? ['owner-session'] : []),
      ...(payload.owner_authority_confirmed === true ? ['owner-authority-confirmed'] : []),
      'collaborator-mass-eviction'
    ],
    humanObserved: (payload, session) => payload.owner_authority_confirmed === true && session?.role === SESSION_ROLES.OWNER,
    separatelyConfirmed: true,
    durableReplay: false
  }),
  'session.shared-access.enable': Object.freeze({
    boundary: 'Giving/Shared-Access',
    expected: ['same-origin-session', 'session-bound-intent', 'owner-session', 'owner-authority-confirmed', 'shared-access-reopen'],
    observe: (payload, session) => [
      'same-origin-session',
      'session-bound-intent',
      ...(session?.role === SESSION_ROLES.OWNER ? ['owner-session'] : []),
      ...(payload.owner_authority_confirmed === true ? ['owner-authority-confirmed'] : []),
      'shared-access-reopen'
    ],
    humanObserved: (payload, session) => payload.owner_authority_confirmed === true && session?.role === SESSION_ROLES.OWNER,
    separatelyConfirmed: true,
    durableReplay: false
  })
});

export function cisternPolicy(operation) {
  return POLICIES[operation] || null;
}

function contextWitnesses(envelope) {
  const context = envelope?.aperture_context;
  if (!context) return [];
  return [{
    source: context.source || 'TD613 Aperture',
    digest: sha256(context),
    authority_effect: 'NONE'
  }];
}

function preflightReceipt(envelope, session, policy, spentIntent = null) {
  const payload = envelope?.payload || {};
  const humanObserved = typeof policy.humanObserved === 'function'
    ? policy.humanObserved(payload, session)
    : payload.confirmed === true || envelope.operation === 'campaign-deputy.withhold';
  return compileCisternLawReceipt({
    boundary: policy.boundary || 'Giving/Campaign-Deputy',
    action: envelope.operation,
    expectedRoute: policy.expected,
    observedRoute: policy.observe(payload, session),
    witness: {
      human_required: true,
      human_observed: humanObserved,
      separately_confirmed: policy.separatelyConfirmed,
      bounded_intent: Boolean(envelope?.intent?.nonce && session?.nonce)
    },
    contexts: contextWitnesses(envelope),
    requestDigest: envelope?.request_digest || null,
    sessionDigest: session?.sid ? sha256(session.sid) : null,
    spentIntentDigest: spentIntent?.intent_digest || null,
    durableTombstone: spentIntent?.durable === true,
    outcome: 'RELEASED'
  });
}

export async function assertGivingCisternRoute(envelope, session, context = {}) {
  const policy = cisternPolicy(envelope?.operation);
  if (!policy) return null;
  let receipt = preflightReceipt(envelope, session, policy);
  try {
    assertCisternRelease(receipt);
  } catch {
    throw new GivingError(
      'write-authorization-withheld',
      'This Giving mutation did not satisfy the required operator confirmations',
      409,
      {
        missing_required_confirmations: receipt.route.deltas.map((item) => item.expected).filter(Boolean)
      }
    );
  }

  if (policy.durableReplay) {
    const spentIntent = await consumeGivingMutationIntent({
      envelope,
      session,
      fetchImpl: context.fetchImpl
    });
    receipt = preflightReceipt(envelope, session, policy, spentIntent);
    assertCisternRelease(receipt);
  }
  return receipt;
}

function safeEgressProjection(operation, data = {}) {
  if (operation === 'session.shared-access.revoke' || operation === 'session.shared-access.enable') {
    return {
      action: operation,
      shared_access: data?.shared_access || null,
      sessions_issued_before_last_lock_rejected: data?.sessions_issued_before_last_lock_rejected === true,
      owner_session_required_to_reopen: data?.owner_session_required_to_reopen === true,
      shared_secret_changed: false,
      donor_payload_logged: false
    };
  }
  if (operation === 'campaign-deputy.ensure-committee') {
    return {
      action: data?.receipt?.action || null,
      list_id: data?.receipt?.listId || data?.list?.id || null,
      fec_committee_id: data?.receipt?.fec_committee_id || null,
      external_contribution_created: false
    };
  }
  if (operation === 'campaign-deputy.withhold') {
    return {
      action: 'WITHHOLD',
      dossier_id: data?.dossierId || null,
      committee: data?.committee || null,
      external_mutation: false
    };
  }
  const sync = data?.sync || data?.receipt || {};
  return {
    action: sync.action || null,
    person_id: sync.personId || data?.person?.personId || data?.person?.id || null,
    list_id: sync.listId || data?.list?.id || null,
    committee: sync.committee || null,
    dossier_id: sync.dossierId || null,
    external_contribution_created: false
  };
}

export function finalizeGivingCisternReceipt(preflightReceipt, envelope, session, data) {
  if (!preflightReceipt) return null;
  const egress = safeEgressProjection(envelope.operation, data);
  return compileCisternLawReceipt({
    boundary: preflightReceipt.boundary,
    action: envelope.operation,
    expectedRoute: preflightReceipt.route.expected,
    observedRoute: preflightReceipt.route.observed,
    witness: preflightReceipt.witness,
    contexts: preflightReceipt.context_witnesses || [],
    requestDigest: envelope.request_digest,
    sessionDigest: session?.sid ? sha256(session.sid) : null,
    spentIntentDigest: preflightReceipt.spent_intent_digest || (session?.nonce ? sha256(session.nonce) : null),
    durableTombstone: preflightReceipt.durable_tombstone === true,
    egressDigest: sha256(egress),
    outcome: 'RELEASED'
  });
}

export function publicWriteAuthorizationReceipt(internalReceipt, rotatedSession) {
  if (!internalReceipt) return null;
  return Object.freeze({
    status: internalReceipt.outcome === 'RELEASED' ? 'VERIFIED' : 'WITHHELD',
    request_digest: internalReceipt.request_digest || null,
    egress_digest: internalReceipt.egress_digest || null,
    replay_protection: internalReceipt.durable_tombstone ? 'DURABLE_SPENT_INTENT' : 'SIGNED_SESSION_ROTATION_ONLY',
    context_witness_count: internalReceipt.context_witnesses?.length || 0,
    context_authority_effect: 'NONE',
    next_intent_issued: Boolean(rotatedSession)
  });
}

export const _cisternInternals = Object.freeze({ POLICIES, safeEgressProjection, preflightReceipt, contextWitnesses });
