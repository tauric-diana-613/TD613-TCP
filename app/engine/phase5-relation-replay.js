import { canonicalDigest } from '../dome-world/ash/canonical-json.js';
import {
  PHASE5_DIGEST_DOMAINS, APERTURE_RELATION_AUDIT_SCHEMA,
  RELATION_CONFIRMATION_SCHEMA, RELATION_ENVELOPE_SCHEMA,
  computeConfirmationDigest, computeRelationDigest, findForbiddenRelationFields
} from './phase5-relation-envelope.js';
import {
  R0_RECEIPT_REFERENCES_ONLY, R1_ROUTE_SCOPED_ARTIFACT_REFERENCE, verifyAshReference
} from './phase5-relation-crypto.js';
import { computeRelationAuditDigest } from './aperture-v3-relation-audit.js';
import { PHASON_RELATION_CHAIN_SCHEMA, replayPhasonRelationChain } from './phase5-phason-relation-ledger.js';

export const RELATION_REPLAY_RECEIPT_SCHEMA = 'td613.relation-replay-receipt/v0.1';
function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function randomId(prefix, cryptoImpl = globalThis.crypto) {
  if (!cryptoImpl?.getRandomValues) throw new Error('Secure random values are unavailable.');
  const bytes = new Uint8Array(10); cryptoImpl.getRandomValues(bytes);
  return `${prefix}${Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')}`;
}
function replayDigestSubject(receipt) { const subject = clone(receipt); delete subject.replay_digest; return subject; }
export function computeRelationReplayDigest(receipt, options = {}) {
  return canonicalDigest(PHASE5_DIGEST_DOMAINS.replay, replayDigestSubject(receipt), options);
}
function authorityBoundaryBroken(envelope) {
  return envelope?.automatic_relation_creation !== false
    || envelope?.automatic_confirmation !== false
    || envelope?.automatic_ash_action !== false
    || envelope?.prediction_authorized !== false
    || envelope?.open_field_promotion !== false
    || envelope?.relation_is_identity !== false
    || envelope?.relation_is_causation !== false
    || envelope?.relation_is_permission !== false
    || envelope?.marrowline_confirmation_authority !== false
    || envelope?.visibility?.server_persistence !== false
    || envelope?.visibility?.public_export !== false;
}
export async function replayRelationEnvelope(
  { envelope, confirmationReceipt = null, audit, phasonChain },
  {
    key = null, artifactDigest = null, ashReceipt = null, flowcoreReceipt = null,
    roundTripReceipt = null, replayId = null, createdAt = null,
    cryptoImpl = globalThis.crypto, TextEncoderImpl = globalThis.TextEncoder
  } = {}
) {
  const errors = []; const warnings = []; let outcome = 'RELATION_REPLAY_VERIFIED';
  if (!envelope || envelope.schema !== RELATION_ENVELOPE_SCHEMA) errors.push('unsupported_relation_envelope_schema');
  if (!audit || audit.schema !== APERTURE_RELATION_AUDIT_SCHEMA) errors.push('unsupported_relation_audit_schema');
  if (!phasonChain || phasonChain.schema !== PHASON_RELATION_CHAIN_SCHEMA) errors.push('unsupported_phason_chain_schema');
  if (envelope) {
    if (await computeRelationDigest(envelope, { cryptoImpl, TextEncoderImpl }) !== envelope.relation_digest) errors.push('relation_digest_mismatch');
    if (findForbiddenRelationFields(envelope).length) errors.push('artifact_or_authority_forbidden_field');
    if (authorityBoundaryBroken(envelope)) errors.push('authority_boundary_breach');
  }
  if (audit) {
    if (await computeRelationAuditDigest(audit, { cryptoImpl, TextEncoderImpl }) !== audit.audit_digest) errors.push('audit_digest_mismatch');
    if (audit.relation_id !== envelope?.relation_id) errors.push('audit_relation_reference_mismatch');
  }
  if (confirmationReceipt) {
    if (confirmationReceipt.schema !== RELATION_CONFIRMATION_SCHEMA) errors.push('unsupported_confirmation_schema');
    else {
      if (await computeConfirmationDigest(confirmationReceipt, { cryptoImpl, TextEncoderImpl }) !== confirmationReceipt.confirmation_digest) errors.push('confirmation_digest_mismatch');
      if (confirmationReceipt.relation_id !== envelope?.relation_id) errors.push('confirmation_relation_reference_mismatch');
      const createdDigest = phasonChain?.events?.[0]?.relation_digest || null;
      if (createdDigest && confirmationReceipt.proposal_digest !== createdDigest) errors.push('confirmation_proposal_digest_mismatch');
      if (audit?.relation_digest !== confirmationReceipt.proposal_digest) errors.push('confirmation_audit_proposal_digest_mismatch');
      if (confirmationReceipt.aperture_audit_digest !== audit?.audit_digest) errors.push('confirmation_audit_reference_mismatch');
      if (confirmationReceipt.explicit_operator_action !== true) errors.push('confirmation_not_explicit');
    }
  } else if (envelope?.state === 'CONFIRMED') errors.push('confirmed_relation_missing_confirmation_receipt');

  const phasonReplay = phasonChain
    ? await replayPhasonRelationChain(phasonChain, { cryptoImpl, TextEncoderImpl })
    : { outcome: 'RELATION_REPLAY_HELD_LIFECYCLE_CONTRADICTION', errors: ['missing_chain'] };
  if (phasonReplay.outcome === 'RELATION_REPLAY_HELD_PHASON_FORK') errors.push('phason_fork');
  else if (phasonReplay.outcome !== 'RELATION_REPLAY_VERIFIED') errors.push(...phasonReplay.errors);
  if (phasonChain?.relation_id !== envelope?.relation_id) errors.push('phason_relation_reference_mismatch');
  if (phasonReplay.current_state !== envelope?.state) errors.push('lifecycle_state_mismatch');
  if (ashReceipt && envelope?.references?.ash_custody_receipt_id !== ashReceipt.receipt_id) errors.push('ash_reference_mismatch');
  if (flowcoreReceipt && envelope?.references?.flowcore_context_receipt_id !== flowcoreReceipt.receipt_id) errors.push('flowcore_reference_mismatch');
  if (roundTripReceipt && (envelope?.references?.aperture_round_trip_receipt_id !== roundTripReceipt.receipt_id
    || roundTripReceipt.context?.receipt?.receipt_id !== envelope?.references?.flowcore_context_receipt_id)) errors.push('round_trip_reference_mismatch');

  if (envelope?.assurance_class === R0_RECEIPT_REFERENCES_ONLY) {
    outcome = 'RELATION_REPLAY_VERIFIED_R0'; warnings.push('r0_receipt_references_only');
  } else if (envelope?.assurance_class === R1_ROUTE_SCOPED_ARTIFACT_REFERENCE) {
    if (!key) { outcome = 'RELATION_REPLAY_HELD_KEY_UNAVAILABLE'; warnings.push('local_relation_key_unavailable'); }
    else if (!artifactDigest) { outcome = 'RELATION_REPLAY_HELD_KEY_UNAVAILABLE'; warnings.push('local_artifact_digest_unavailable_for_hmac_reverification'); }
    else if (!await verifyAshReference({
      key, ashReference: envelope.ash_reference, artifactDigest,
      contextNonce: envelope.context_nonce, routeScope: envelope.route?.route_scope,
      cryptoImpl, TextEncoderImpl
    })) errors.push('route_scoped_reference_mismatch');
  } else errors.push('unsupported_assurance_class');

  if (errors.includes('artifact_or_authority_forbidden_field') || errors.includes('authority_boundary_breach') || errors.includes('confirmation_not_explicit')) outcome = 'RELATION_REPLAY_REJECTED_AUTHORITY_BREACH';
  else if (errors.includes('phason_fork')) outcome = 'RELATION_REPLAY_HELD_PHASON_FORK';
  else if (errors.some(error => error.includes('lifecycle') || error.includes('phason'))) outcome = 'RELATION_REPLAY_HELD_LIFECYCLE_CONTRADICTION';
  else if (errors.some(error => error.includes('reference') || error.includes('proposal_digest'))) outcome = 'RELATION_REPLAY_HELD_REFERENCE_MISMATCH';
  else if (errors.length) outcome = 'RELATION_REPLAY_HELD_TAMPER';
  else if (outcome === 'RELATION_REPLAY_VERIFIED' && warnings.length) outcome = 'RELATION_REPLAY_VERIFIED_WITH_WARNINGS';

  const receipt = {
    schema: RELATION_REPLAY_RECEIPT_SCHEMA,
    replay_id: replayId || randomId('relreplay_', cryptoImpl),
    relation_id: envelope?.relation_id || null,
    relation_digest: envelope?.relation_digest || null,
    created_at: createdAt || new Date().toISOString(),
    time_posture: 'local-clock-not-trusted-time',
    outcome, errors: [...new Set(errors)], warnings: [...new Set(warnings)],
    checks: {
      relation_digest: !errors.includes('relation_digest_mismatch'),
      confirmation_digest: !errors.includes('confirmation_digest_mismatch'),
      audit_digest: !errors.includes('audit_digest_mismatch'),
      phason_chain: phasonReplay.outcome === 'RELATION_REPLAY_VERIFIED',
      source_references: !errors.some(error => error.includes('reference_mismatch') || error.includes('proposal_digest')),
      authority_nontransfer: !errors.includes('authority_boundary_breach'),
      artifact_digest_absent: !errors.includes('artifact_or_authority_forbidden_field')
    },
    network_called: false, artifact_reloaded: false, weather_regenerated: false,
    storage_mutated: false, ash_action_triggered: false, open_field_promoted: false,
    recommendation_not_command: true, seal: '⟐'
  };
  receipt.replay_digest = await computeRelationReplayDigest(receipt, { cryptoImpl, TextEncoderImpl });
  return Object.freeze(receipt);
}
