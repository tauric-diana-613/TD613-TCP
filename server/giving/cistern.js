import { assertCisternRelease, compileCisternLawReceipt } from '../../app/engine/aia-cistern-law.js';
import { GivingError, sha256 } from './util.js';

const POLICIES = Object.freeze({
  'campaign-deputy.link-existing': Object.freeze({
    expected: ['same-origin-session', 'session-bound-intent', 'identity-confirmed', 'exact-person-selected', 'committee-membership-write'],
    observe: (payload) => [
      'same-origin-session',
      'session-bound-intent',
      ...(payload.confirmed === true ? ['identity-confirmed'] : []),
      ...(payload.person_id ? ['exact-person-selected'] : []),
      'committee-membership-write'
    ],
    separatelyConfirmed: false
  }),
  'campaign-deputy.create-confirmed': Object.freeze({
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
    separatelyConfirmed: true
  }),
  'campaign-deputy.ensure-committee': Object.freeze({
    expected: ['same-origin-session', 'session-bound-intent', 'committee-identity-confirmed', 'committee-list-write'],
    observe: (payload) => [
      'same-origin-session',
      'session-bound-intent',
      ...(payload.confirmed === true ? ['committee-identity-confirmed'] : []),
      'committee-list-write'
    ],
    separatelyConfirmed: true
  }),
  'campaign-deputy.withhold': Object.freeze({
    expected: ['same-origin-session', 'session-bound-intent', 'operator-withhold'],
    observe: () => ['same-origin-session', 'session-bound-intent', 'operator-withhold'],
    separatelyConfirmed: true
  })
});

export function cisternPolicy(operation) {
  return POLICIES[operation] || null;
}

export function assertGivingCisternRoute(envelope, session) {
  const policy = cisternPolicy(envelope?.operation);
  if (!policy) return null;
  const payload = envelope?.payload || {};
  const receipt = compileCisternLawReceipt({
    boundary: 'Giving/Campaign-Deputy',
    action: envelope.operation,
    expectedRoute: policy.expected,
    observedRoute: policy.observe(payload),
    witness: {
      human_required: true,
      human_observed: payload.confirmed === true || envelope.operation === 'campaign-deputy.withhold',
      separately_confirmed: policy.separatelyConfirmed,
      bounded_intent: Boolean(envelope?.intent?.nonce && session?.nonce)
    },
    requestDigest: envelope?.request_digest || null,
    sessionDigest: session?.sid ? sha256(session.sid) : null,
    outcome: 'RELEASED'
  });
  try {
    return assertCisternRelease(receipt);
  } catch {
    throw new GivingError(
      'write-authorization-withheld',
      'This Campaign Deputy write did not satisfy the required operator confirmations',
      409,
      {
        missing_required_confirmations: receipt.route.deltas.map((item) => item.expected).filter(Boolean)
      }
    );
  }
}

function safeEgressProjection(operation, data = {}) {
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
    requestDigest: envelope.request_digest,
    sessionDigest: session?.sid ? sha256(session.sid) : null,
    spentIntentDigest: session?.nonce ? sha256(session.nonce) : null,
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
    next_intent_issued: Boolean(rotatedSession)
  });
}

export const _cisternInternals = Object.freeze({ POLICIES, safeEgressProjection });
