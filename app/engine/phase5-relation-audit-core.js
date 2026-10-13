import { canonicalDigest } from '../dome-world/ash/canonical-json.js';
import {
  APERTURE_RELATION_AUDIT_SCHEMA,
  PHASE5_DIGEST_DOMAINS,
  RELATION_ENVELOPE_SCHEMA,
  computeConfirmationDigest,
  computeRelationDigest,
  findForbiddenRelationFields,
  validateAshCustodyReceiptIntegrity,
  validateFlowCoreContextReceipt,
  validateRoundTripReceipt
} from './phase5-relation-envelope.js';
import {
  NonceRegistry,
  R0_RECEIPT_REFERENCES_ONLY,
  R1_ROUTE_SCOPED_ARTIFACT_REFERENCE,
  verifyAshReference
} from './phase5-relation-crypto.js';

export const RELATION_AUDIT_OUTCOMES = Object.freeze([
  'RELATION_PROPOSAL_ADMISSIBLE', 'RELATION_CONFIRMED_WITHIN_SCOPE',
  'RELATION_WITHDRAWAL_ADMISSIBLE', 'RELATION_SUPERSESSION_ADMISSIBLE',
  'RELATION_REPLAY_ADMISSIBLE', 'RELATION_ADMISSIBLE_WITH_WARNINGS',
  'HOLD_NONCE_REUSE', 'HOLD_REFERENCE_MISMATCH', 'HOLD_INSUFFICIENT_RELATA',
  'HOLD_KEY_UNAVAILABLE', 'HOLD_LIFECYCLE_CONTRADICTION', 'HOLD_PHASON_FORK',
  'HOLD_CARRIER_MUTATION', 'REJECT_ARTIFACT_DISCLOSURE',
  'REJECT_AUTHORITY_OR_IDENTITY_CLAIM'
]);
const ARTIFACT_KEYS = new Set(['artifact_digest', 'artifactDigest', 'raw_bytes', 'rawBytes', 'raw_content', 'file_content']);
const AUTHORITY_KEYS = new Set([
  'identity_proof', 'authorship_proof', 'ownership_proof', 'permission_proof',
  'causation_proof', 'location_proof', 'cooccurrence_proof',
  'automatic_ash_action', 'prediction_authorized', 'doctrine_writeback'
]);
const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
function randomId(prefix, cryptoImpl = globalThis.crypto) {
  if (!cryptoImpl?.getRandomValues) throw new Error('Secure random values are unavailable.');
  const bytes = new Uint8Array(10); cryptoImpl.getRandomValues(bytes);
  return prefix + Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}
function active(value) {
  return ![null, undefined, '', false].includes(value)
    && !(Array.isArray(value) && value.length === 0)
    && !(value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0);
}
function walk(value, visit, path = '$') {
  if (Array.isArray(value)) return value.forEach((child, index) => walk(child, visit, `${path}[${index}]`));
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    const childPath = `${path}.${key}`; visit(key, child, childPath); walk(child, visit, childPath);
  }
}
function authorityClaimPaths(envelope) {
  const hits = [];
  walk(envelope, (key, child, path) => {
    if (AUTHORITY_KEYS.has(key) && active(child)) hits.push(path);
    if (/^(relation_is_identity|relation_is_causation|relation_is_permission)$/u.test(key) && child !== false) hits.push(path);
    if (key === 'marrowline_confirmation_authority' && child !== false) hits.push(path);
  });
  return hits;
}
function auditSubject(audit) { const output = clone(audit); delete output.audit_digest; return output; }
export const computeRelationAuditDigest = (audit, options = {}) => canonicalDigest(
  PHASE5_DIGEST_DOMAINS.apertureAudit, auditSubject(audit), options
);

async function baseChecks({ envelope, ashReceipt, flowcoreReceipt, roundTripReceipt,
  key, artifactDigest, cryptoImpl, TextEncoderImpl }) {
  const rejected = []; const holds = []; const warnings = []; const accepted = [];
  if (!envelope || envelope.schema !== RELATION_ENVELOPE_SCHEMA) {
    holds.push('unsupported_relation_envelope_schema'); return { rejected, holds, warnings, accepted };
  }
  if (await computeRelationDigest(envelope, { cryptoImpl, TextEncoderImpl }) !== envelope.relation_digest) {
    holds.push('relation_digest_mismatch');
  } else accepted.push('relation_digest_verified');
  const forbidden = findForbiddenRelationFields(envelope);
  const artifactDisclosure = forbidden.filter(path => ARTIFACT_KEYS.has(path.split('.').at(-1)));
  if (artifactDisclosure.length) rejected.push(`artifact_disclosure:${artifactDisclosure.join('|')}`);
  const authority = authorityClaimPaths(envelope);
  if (authority.length) rejected.push(`authority_or_identity_claim:${authority.join('|')}`);
  try {
    await validateAshCustodyReceiptIntegrity(ashReceipt, {
      requireArtifactDigest: envelope.assurance_class === R1_ROUTE_SCOPED_ARTIFACT_REFERENCE,
      artifactDigest,
      cryptoImpl,
      TextEncoderImpl
    });
    accepted.push('ash_receipt_digest_and_artifact_commitment_verified');
  } catch (error) { holds.push(`ash_receipt:${error.message}`); }
  try {
    validateFlowCoreContextReceipt(flowcoreReceipt); accepted.push('flowcore_receipt_reference');
  } catch (error) { holds.push(`flowcore_receipt:${error.message}`); }
  try {
    const result = await validateRoundTripReceipt(roundTripReceipt, flowcoreReceipt, { cryptoImpl, TextEncoderImpl });
    accepted.push(`round_trip_replay:${result.replay.status}`);
  } catch (error) { holds.push(`round_trip_receipt:${error.message}`); }

  const refs = envelope.references || {};
  if (refs.ash_custody_receipt_id !== ashReceipt?.receipt_id
    || refs.flowcore_context_receipt_id !== flowcoreReceipt?.receipt_id
    || refs.aperture_round_trip_receipt_id !== roundTripReceipt?.receipt_id
    || roundTripReceipt?.context?.receipt?.receipt_id !== flowcoreReceipt?.receipt_id) {
    holds.push('source_reference_mismatch');
  } else accepted.push('source_reference_consistency');

  if (envelope.assurance_class === R0_RECEIPT_REFERENCES_ONLY) {
    if (envelope.ash_reference !== null || envelope.hmac !== null) holds.push('r0_must_not_claim_hmac_reference');
    else accepted.push('r0_reference_posture');
  } else if (envelope.assurance_class === R1_ROUTE_SCOPED_ARTIFACT_REFERENCE) {
    if (ashReceipt?.assurance_class !== 'L1_BROWSER_LOCAL_ARTIFACT_DIGEST') holds.push('r1_requires_l1_ash_receipt');
    if (!/^hmac-sha256:[0-9a-f]{64}$/.test(String(envelope.ash_reference || ''))) holds.push('r1_reference_missing_or_malformed');
    if (envelope.hmac?.profile !== 'td613.phase5.route-scoped-reference/v0.1'
      || envelope.hmac?.algorithm !== 'HMAC-SHA-256'
      || envelope.hmac?.key_exported !== false || envelope.hmac?.key_extractable !== false) {
      holds.push('r1_hmac_profile_mismatch');
    }
    if (!key) holds.push('r1_local_key_unavailable');
    else if (key.extractable !== false) rejected.push('relation_key_exportable');
    else if (!artifactDigest) holds.push('r1_local_artifact_digest_unavailable');
    else if (!await verifyAshReference({
      key, ashReference: envelope.ash_reference, artifactDigest,
      contextNonce: envelope.context_nonce, routeScope: envelope.route?.route_scope,
      cryptoImpl, TextEncoderImpl
    })) holds.push('route_scoped_reference_mismatch');
    else accepted.push('r1_route_scoped_reference_verified');
  } else holds.push('unsupported_assurance_class');

  if (!envelope.context_nonce || !envelope.route?.route_scope || !envelope.route?.binding_purpose) holds.push('nonce_route_or_purpose_missing');
  if (envelope.visibility?.posture !== 'PRIVATE_LOCAL_DEFAULT'
    || envelope.visibility?.server_persistence !== false || envelope.visibility?.public_export !== false) {
    rejected.push('visibility_boundary_breach');
  }
  if (envelope.automatic_relation_creation !== false || envelope.automatic_confirmation !== false
    || envelope.automatic_ash_action !== false || envelope.prediction_authorized !== false
    || envelope.open_field_promotion !== false) rejected.push('automatic_authority_boundary_breach');
  else { accepted.push('authority_nontransfer'); accepted.push('open_field_nonpromotion'); }
  if (String(envelope.route?.task_intent_route || '').startsWith('OPEN_FIELD_')) warnings.push('open_field_relation_available_not_promoted');
  return { rejected, holds, warnings, accepted };
}
function chooseOutcome({ rejected, holds, warnings }, confirmed = false) {
  if (rejected.some(item => item.startsWith('artifact_disclosure'))) return 'REJECT_ARTIFACT_DISCLOSURE';
  if (rejected.length) return 'REJECT_AUTHORITY_OR_IDENTITY_CLAIM';
  if (holds.includes('nonce_reuse')) return 'HOLD_NONCE_REUSE';
  if (holds.some(item => item.includes('reference_mismatch') || item.includes('digest_mismatch')
    || item.includes('artifact commitment'))) return 'HOLD_REFERENCE_MISMATCH';
  if (holds.some(item => item.includes('local_key_unavailable'))) return 'HOLD_KEY_UNAVAILABLE';
  if (holds.length) return 'HOLD_INSUFFICIENT_RELATA';
  if (warnings.length) return 'RELATION_ADMISSIBLE_WITH_WARNINGS';
  return confirmed ? 'RELATION_CONFIRMED_WITHIN_SCOPE' : 'RELATION_PROPOSAL_ADMISSIBLE';
}
function buildAudit(envelope, checks, stage, { auditId, createdAt, cryptoImpl }) {
  return {
    schema: APERTURE_RELATION_AUDIT_SCHEMA,
    audit_id: auditId || randomId('relaud_', cryptoImpl),
    relation_id: envelope?.relation_id || null,
    relation_digest: envelope?.relation_digest || null,
    created_at: createdAt || new Date().toISOString(),
    time_posture: 'local-clock-not-trusted-time', stage, outcome: null,
    accepted: checks.accepted, rejected: checks.rejected, holds: checks.holds,
    warnings: [...new Set(checks.warnings)],
    authority_transfer_detected: checks.rejected.some(item => item.includes('authority')),
    artifact_disclosure_detected: checks.rejected.some(item => item.startsWith('artifact_disclosure')),
    open_field_promotion: false, recommendation_not_command: true,
    operator_confirmation_required: true, automatic_ash_action: false,
    prediction_authorized: false, network_called: false, storage_mutated: false, seal: '⟐'
  };
}
export async function auditRelationProposal(proposalBundle, options = {}) {
  const envelope = proposalBundle?.envelope || proposalBundle;
  const { ashReceipt, flowcoreReceipt, roundTripReceipt, key = proposalBundle?.key || null,
    artifactDigest = null, nonceRegistry = null, auditId = null, createdAt = null,
    cryptoImpl = globalThis.crypto, TextEncoderImpl = globalThis.TextEncoder } = options;
  const checks = await baseChecks({ envelope, ashReceipt, flowcoreReceipt, roundTripReceipt,
    key, artifactDigest, cryptoImpl, TextEncoderImpl });
  if (envelope?.state !== 'PROPOSED') checks.holds.push('proposal_state_must_be_proposed');
  if (envelope?.operator_confirmation?.status !== 'UNCONFIRMED') checks.rejected.push('automatic_or_prior_confirmation_detected');
  if (nonceRegistry != null) {
    if (!(nonceRegistry instanceof NonceRegistry)) throw new TypeError('nonceRegistry must be a Phase V NonceRegistry.');
    if (envelope?.context_nonce && await nonceRegistry.has(envelope.context_nonce)) checks.holds.push('nonce_reuse');
  }
  const audit = buildAudit(envelope, checks, 'PROPOSAL', { auditId, createdAt, cryptoImpl });
  audit.outcome = chooseOutcome(checks, false);
  audit.audit_digest = await computeRelationAuditDigest(audit, { cryptoImpl, TextEncoderImpl });
  return Object.freeze(audit);
}
export async function auditConfirmedRelation(confirmedBundle, options = {}) {
  const envelope = confirmedBundle?.envelope || confirmedBundle;
  const confirmation = confirmedBundle?.confirmation_receipt || options.confirmationReceipt || null;
  const { ashReceipt, flowcoreReceipt, roundTripReceipt, key = confirmedBundle?.key || options.key || null,
    artifactDigest = null, auditId = null, createdAt = null,
    cryptoImpl = globalThis.crypto, TextEncoderImpl = globalThis.TextEncoder } = options;
  const checks = await baseChecks({ envelope, ashReceipt, flowcoreReceipt, roundTripReceipt,
    key, artifactDigest, cryptoImpl, TextEncoderImpl });
  if (envelope?.state !== 'CONFIRMED') checks.holds.push('confirmed_state_missing');
  if (!confirmation || envelope?.operator_confirmation?.status !== 'CONFIRMED'
    || envelope?.operator_confirmation?.confirmation_receipt_id !== confirmation.confirmation_receipt_id) {
    checks.holds.push('confirmation_receipt_reference_missing');
  } else {
    if (await computeConfirmationDigest(confirmation, { cryptoImpl, TextEncoderImpl }) !== confirmation.confirmation_digest) {
      checks.holds.push('confirmation_digest_mismatch');
    }
    if (confirmation.relation_id !== envelope.relation_id || confirmation.explicit_operator_action !== true) {
      checks.holds.push('confirmation_reference_mismatch');
    }
    if (confirmedBundle?.proposal_envelope
      && confirmation.proposal_digest !== confirmedBundle.proposal_envelope.relation_digest) {
      checks.holds.push('confirmation_proposal_digest_mismatch');
    }
  }
  const audit = buildAudit(envelope, checks, 'CONFIRMED', { auditId, createdAt, cryptoImpl });
  audit.outcome = checks.rejected.length ? chooseOutcome(checks, true)
    : checks.holds.length ? 'HOLD_LIFECYCLE_CONTRADICTION'
      : checks.warnings.length ? 'RELATION_ADMISSIBLE_WITH_WARNINGS'
        : 'RELATION_CONFIRMED_WITHIN_SCOPE';
  audit.audit_digest = await computeRelationAuditDigest(audit, { cryptoImpl, TextEncoderImpl });
  return Object.freeze(audit);
}
export async function auditCarrierIntegrity(originalEnvelope, carriedEnvelope, options = {}) {
  const { auditId = null, createdAt = null, cryptoImpl = globalThis.crypto,
    TextEncoderImpl = globalThis.TextEncoder } = options;
  let mutation = !originalEnvelope || !carriedEnvelope
    || originalEnvelope.relation_id !== carriedEnvelope.relation_id
    || originalEnvelope.relation_digest !== carriedEnvelope.relation_digest;
  if (!mutation) {
    const originalDigest = await computeRelationDigest(originalEnvelope, { cryptoImpl, TextEncoderImpl });
    const carriedDigest = await computeRelationDigest(carriedEnvelope, { cryptoImpl, TextEncoderImpl });
    mutation = originalDigest !== originalEnvelope.relation_digest
      || carriedDigest !== carriedEnvelope.relation_digest
      || originalDigest !== carriedDigest;
  }
  const checks = {
    accepted: mutation ? [] : ['carrier_digest_preserved', 'carrier_authority_absent'],
    rejected: [], holds: mutation ? ['carrier_mutation_detected'] : [],
    warnings: ['marrowline_carried_envelope']
  };
  const audit = buildAudit(originalEnvelope || carriedEnvelope, checks, 'MARROWLINE_CARRIER', { auditId, createdAt, cryptoImpl });
  audit.outcome = mutation ? 'HOLD_CARRIER_MUTATION' : 'RELATION_REPLAY_ADMISSIBLE';
  audit.marrowline_created_relation = false; audit.marrowline_confirmed_relation = false;
  audit.marrowline_key_access = false;
  audit.audit_digest = await computeRelationAuditDigest(audit, { cryptoImpl, TextEncoderImpl });
  return Object.freeze(audit);
}
