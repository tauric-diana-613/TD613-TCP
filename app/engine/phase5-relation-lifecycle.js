import { canonicalDigest } from '../dome-world/ash/canonical-json.js';
import { NonceRegistry } from './phase5-relation-crypto.js';
import {
  APERTURE_RELATION_AUDIT_SCHEMA,
  PHASE5_DIGEST_DOMAINS,
  RELATION_CONFIRMATION_SCHEMA,
  RELATION_ENVELOPE_SCHEMA,
  RELATION_STATES,
  cloneRelationValue,
  compileRelationProposal,
  computeConfirmationDigest,
  computeRelationDigest,
  deepFreezeRelationValue,
  findForbiddenRelationFields,
  randomRelationId,
  relationDigestSubject
} from './phase5-relation-contract.js';

const TRANSITIONS = Object.freeze({
  PROPOSED: Object.freeze(['CONFIRMED', 'WITHDRAWN']),
  CONFIRMED: Object.freeze(['REVISED', 'WITHDRAWN', 'SUPERSEDED']),
  REVISED: Object.freeze(['SUPERSEDED']),
  WITHDRAWN: Object.freeze([]),
  SUPERSEDED: Object.freeze([])
});
const computeAuditDigest = (audit, options = {}) => canonicalDigest(
  PHASE5_DIGEST_DOMAINS.apertureAudit,
  relationDigestSubject(audit, 'audit_digest'),
  options
);

export async function confirmRelation(proposalBundle, audit, options = {}) {
  const {
    explicitOperatorAction = false, confirmationId = null, createdAt = null,
    nonceRegistry = null, cryptoImpl = globalThis.crypto,
    TextEncoderImpl = globalThis.TextEncoder
  } = options;
  const proposal = proposalBundle?.envelope || proposalBundle;
  if (!proposal || proposal.schema !== RELATION_ENVELOPE_SCHEMA || proposal.state !== 'PROPOSED') {
    throw new Error('Confirmation requires a proposed Relation Envelope.');
  }
  if (explicitOperatorAction !== true) throw new Error('Explicit operator confirmation is required.');
  if (!audit || audit.schema !== APERTURE_RELATION_AUDIT_SCHEMA || audit.stage !== 'PROPOSAL') {
    throw new Error('Confirmation requires a proposal-stage Aperture relation audit.');
  }
  if (!['RELATION_PROPOSAL_ADMISSIBLE', 'RELATION_ADMISSIBLE_WITH_WARNINGS'].includes(audit.outcome)) {
    throw new Error(`Relation audit does not permit confirmation: ${audit.outcome || 'unknown'}.`);
  }
  if (await computeRelationDigest(proposal, { cryptoImpl, TextEncoderImpl }) !== proposal.relation_digest) {
    throw new Error('Relation proposal digest verification failed.');
  }
  if (await computeAuditDigest(audit, { cryptoImpl, TextEncoderImpl }) !== audit.audit_digest) {
    throw new Error('Aperture relation audit digest verification failed.');
  }
  if (audit.relation_id !== proposal.relation_id || audit.relation_digest !== proposal.relation_digest) {
    throw new Error('Audit and proposal references do not match.');
  }
  const confirmationTime = createdAt || new Date().toISOString();
  if (nonceRegistry != null) {
    if (!(nonceRegistry instanceof NonceRegistry)) throw new TypeError('nonceRegistry must be a Phase V NonceRegistry.');
    const claimed = await nonceRegistry.claim(proposal.context_nonce, {
      relationId: proposal.relation_id, state: 'CONFIRMED', createdAt: confirmationTime
    });
    if (!claimed) throw new Error('HOLD_NONCE_REUSE');
  }
  const confirmation = {
    schema: RELATION_CONFIRMATION_SCHEMA,
    confirmation_receipt_id: confirmationId || randomRelationId('relconf_', cryptoImpl),
    relation_id: proposal.relation_id,
    proposal_digest: proposal.relation_digest,
    aperture_audit_id: audit.audit_id,
    aperture_audit_digest: audit.audit_digest,
    prior_state: 'PROPOSED',
    new_state: 'CONFIRMED',
    explicit_operator_action: true,
    action_posture: 'human-gesture-after-visible-proposal-and-audit',
    created_at: confirmationTime,
    time_posture: 'local-clock-not-trusted-time',
    recommendation_not_command: true,
    external_permission_claim: false,
    does_not_establish: ['permission', 'identity', 'authorship', 'trusted-time'],
    seal: '⟐'
  };
  confirmation.confirmation_digest = await computeConfirmationDigest(confirmation, { cryptoImpl, TextEncoderImpl });
  const confirmed = cloneRelationValue(proposal);
  confirmed.state = 'CONFIRMED';
  confirmed.operator_confirmation = {
    status: 'CONFIRMED', confirmation_receipt_id: confirmation.confirmation_receipt_id
  };
  confirmed.relation_digest = await computeRelationDigest(confirmed, { cryptoImpl, TextEncoderImpl });
  return deepFreezeRelationValue({
    envelope: confirmed,
    proposal_envelope: cloneRelationValue(proposal),
    confirmation_receipt: confirmation,
    key: proposalBundle?.key || null,
    side_effects: {
      network_called: false, storage_mutated: false, phason_event_created: false,
      ash_action_triggered: false, explicit_operator_action: true
    }
  });
}

async function createStateSnapshot(envelope, newState, options = {}) {
  if (!envelope || envelope.schema !== RELATION_ENVELOPE_SCHEMA) throw new TypeError('Relation Envelope is required.');
  if (!RELATION_STATES.includes(newState)) throw new Error('Unsupported relation state.');
  if (!TRANSITIONS[envelope.state]?.includes(newState)) throw new Error('HOLD_LIFECYCLE_CONTRADICTION');
  if (await computeRelationDigest(envelope, options) !== envelope.relation_digest) {
    throw new Error('Relation Envelope digest verification failed before lifecycle transition.');
  }
  const snapshot = cloneRelationValue(envelope);
  snapshot.state = newState;
  snapshot.relation_digest = await computeRelationDigest(snapshot, options);
  return deepFreezeRelationValue(snapshot);
}

export async function createRelationStateSnapshot(_envelope, newState) {
  if (newState === 'CONFIRMED') throw new Error('Explicit operator confirmation is required.');
  throw new Error('HOLD_LIFECYCLE_CONTRADICTION');
}

export async function reviseRelation(confirmedBundle, proposalInput, options = {}) {
  const predecessor = confirmedBundle?.envelope || confirmedBundle;
  if (predecessor?.state !== 'CONFIRMED') throw new Error('Only a confirmed relation may be revised.');
  const predecessorSnapshot = await createStateSnapshot(predecessor, 'REVISED', options);
  const {
    key: _key, contextNonce: _nonce, relationId: _id,
    revisionOf: _revision, supersedesRelationId: _supersession,
    ...freshInput
  } = proposalInput || {};
  const successor = await compileRelationProposal({
    ...freshInput,
    contextNonce: null,
    relationId: null,
    revisionOf: predecessor.relation_id,
    supersedesRelationId: null
  }, options);
  if (successor.envelope.relation_id === predecessor.relation_id
    || successor.envelope.context_nonce === predecessor.context_nonce) {
    throw new Error('Revision requires a new relation ID and nonce.');
  }
  if (confirmedBundle?.key && successor.key === confirmedBundle.key) {
    throw new Error('Revision requires a new per-relation key.');
  }
  return deepFreezeRelationValue({ predecessor: predecessorSnapshot, successor });
}

export async function withdrawRelation(envelope, options = {}) {
  if (!['PROPOSED', 'CONFIRMED'].includes(envelope?.state)) {
    throw new Error('Only proposed or confirmed relations may be withdrawn.');
  }
  return createStateSnapshot(envelope, 'WITHDRAWN', options);
}

export async function supersedeRelation(predecessor, confirmedSuccessor, options = {}) {
  const successor = confirmedSuccessor?.envelope || confirmedSuccessor;
  if (!['CONFIRMED', 'REVISED'].includes(predecessor?.state)) {
    throw new Error('Only a confirmed or revised predecessor may be superseded.');
  }
  if (successor?.state !== 'CONFIRMED') {
    throw new Error('A predecessor becomes superseded only after successor confirmation.');
  }
  if (successor.lineage?.revision_of !== predecessor.relation_id
    && successor.lineage?.supersedes_relation_id !== predecessor.relation_id) {
    throw new Error('Successor lineage does not name the predecessor.');
  }
  return createStateSnapshot(predecessor, 'SUPERSEDED', options);
}

export function exportRelationBundle({
  envelope, confirmationReceipt = null, audit = null,
  phasonChain = null, replayReceipt = null
}) {
  const bundle = {
    schema: 'td613.phase5.relation-export/v0.1',
    posture: 'local-relation-record',
    envelope: cloneRelationValue(envelope),
    confirmation_receipt: cloneRelationValue(confirmationReceipt),
    aperture_audit: cloneRelationValue(audit),
    phason_chain: cloneRelationValue(phasonChain),
    replay_receipt: cloneRelationValue(replayReceipt),
    key_exported: false,
    artifact_digest_exported: false,
    universal_artifact_link: false,
    does_not_establish: ['identity', 'permission', 'trusted-time', 'universal-artifact-link'],
    seal: '⟐'
  };
  if (findForbiddenRelationFields(bundle.envelope).length) throw new Error('REJECT_ARTIFACT_DISCLOSURE');
  return deepFreezeRelationValue(bundle);
}
