import { canonicalDigest } from '../dome-world/ash/canonical-json.js';
import {
  APERTURE_RELATION_AUDIT_SCHEMA,
  PHASE5_DIGEST_DOMAINS,
  RELATION_ENVELOPE_SCHEMA,
  findForbiddenRelationFields,
  validateAshCustodyReceiptIntegrity,
  validateFlowCoreContextReceipt,
  validateRoundTripReceipt
} from './phase5-relation-envelope.js';
import {
  NonceRegistry,
  R0_RECEIPT_REFERENCES_ONLY,
  R1_ROUTE_SCOPED_ARTIFACT_REFERENCE
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
const ARTIFACT_DISCLOSURE_KEYS = new Set([
  'artifact_digest', 'artifactDigest', 'raw_bytes', 'rawBytes', 'raw_content', 'file_content'
]);
const AUTHORITY_KEYS = new Set([
  'identity_proof', 'authorship_proof', 'ownership_proof', 'permission_proof',
  'causation_proof', 'location_proof', 'cooccurrence_proof',
  'automatic_ash_action', 'prediction_authorized', 'doctrine_writeback'
]);
function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function randomId(prefix, cryptoImpl = globalThis.crypto) {
  if (!cryptoImpl?.getRandomValues) throw new Error('Secure random values are unavailable.');
  const bytes = new Uint8Array(10); cryptoImpl.getRandomValues(bytes);
  return `${prefix}${Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')}`;
}
function active(value) {
  return ![null, undefined, '', false].includes(value)
    && !(Array.isArray(value) && value.length === 0)
    && !(value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0);
}
function walk(value, visit, path = '$') {
  if (Array.isArray(value)) { value.forEach((child, index) => walk(child, visit, `${path}[${index}]`)); return; }
  if (value && typeof value === 'object') for (const [key, child] of Object.entries(value)) {
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
function auditDigestSubject(audit) { const subject = clone(audit); delete subject.audit_digest; return subject; }
export function computeRelationAuditDigest(audit, options = {}) {
  return canonicalDigest(PHASE5_DIGEST_DOMAINS.apertureAudit, auditDigestSubject(audit), options);
}

async function baseChecks({ envelope, ashReceipt, flowcoreReceipt, roundTripReceipt, key, cryptoImpl, TextEncoderImpl }) {
  const rejected = []; const holds = []; const warnings = []; const accepted = [];
  if (!envelope || envelope.schema !== RELATION_ENVELOPE_SCHEMA) {
    holds.push('unsupported_relation_envelope_schema');
    return { rejected, holds, warnings, accepted };
  }
  const forbidden = findForbiddenRelationFields(envelope);
  const artifactDisclosure = forbidden.filter(path => ARTIFACT_DISCLOSURE_KEYS.has(path.split('.').at(-1)));
  if (artifactDisclosure.length) rejected.push(`artifact_disclosure:${artifactDisclosure.join('|')}`);
  const authority = authorityClaimPaths(envelope);
  if (authority.length) rejected.push(`authority_or_identity_claim:${authority.join('|')}`);
  try {
    await validateAshCustodyReceiptIntegrity(ashReceipt, { cryptoImpl, TextEncoderImpl });
    accepted.push('ash_receipt_digest_verified');
  } catch (error) { holds.push(`ash_receipt:${error.message}`); }
  try {
    validateFlowCoreContextReceipt(flowcoreReceipt);
    accepted.push('flowcore_receipt_reference');
  } catch (error) { holds.push(`flowcore_receipt:${error.message}`); }
  try {
    const result = await validateRoundTripReceipt(roundTripReceipt, flowcoreReceipt, { cryptoImpl, TextEncoderImpl });
    accepted.push(`round_trip_replay:${result.replay.status}`);
  } catch (error) { holds.push(`round_trip_receipt:${error.message}`); }

  const refs = envelope.references || {};
  if (refs.ash_custody_receipt_id !== ashReceipt?.receipt_id
    || refs.flowcore_context_receipt_id !== flowcoreReceipt?.receipt_id
    || refs.aperture_round_trip_receipt_id !== roundTripReceipt?.receipt_id
    || roundTripReceipt?.context?.receipt?.receipt_id !== flowcoreReceipt?.receipt_id) holds.push('source_reference_mismatch');
  else accepted.push('source_reference_consistency');

  if (envelope.assurance_class === R0_RECEIPT_REFERENCES_ONLY) {
    if (envelope.ash_reference !== null || envelope.hmac !== null) holds.push('r0_must_not_claim_hmac_reference');
    else accepted.push('r0_reference_posture');
  } else if (envelope.assurance_class === R1_ROUTE_SCOPED_ARTIFACT_REFERENCE) {
    if (ashReceipt?.assurance_class !== 'L1_BROWSER_LOCAL_ARTIFACT_DIGEST') holds.push('r1_requires_l1_ash_receipt');
    if (!/^hmac-sha256:[0-9a-f]{64}$/.test(String(envelope.ash_reference || ''))) holds.push('r1_reference_missing_or_malformed');
    if (envelope.hmac?.profile !== 'td613.phase5.route-scoped-reference/v0.1'
      || envelope.hmac?.algorithm !== 'HMAC-SHA-256'
      || envelope.hmac?.key_exported !== false
      || envelope.hmac?.key_extractable !== false) holds.push('r1_hmac_profile_mismatch');
    if (!key) holds.push('r1_local_key_unavailable');
    else if (key.extractable !== false) rejected.push('relation_key_exportable');
    else accepted.push('r1_route_scoped_reference');
  } else holds.push('unsupported_assurance_class');

  if (!envelope.context_nonce || !envelope.route?.route_scope || !envelope.route?.binding_purpose) holds.push('nonce_route_or_purpose_missing');
  if (envelope.visibility?.posture !== 'PRIVATE_LOCAL_DEFAULT'
    || envelope.visibility?.server_persistence !== false
    || envelope.visibility?.public_export !== false) rejected.push('visibility_boundary_breach');
  if (envelope.automatic_relation_creation !== false
    || envelope.automatic_confirmation !== false
    || envelope.automatic_ash_action !== false
    || envelope.prediction_authorized !== false
    || envelope.open_field_promotion !== false) rejected.push('automatic_authority_boundary_breach');
  else { accepted.push('authority_nontransfer'); accepted.push('open_field_nonpromotion'); }
  if (String(envelope.route?.task_intent_route || '').startsWith('OPEN_FIELD_')) warnings.push('open_field_relation_available_not_promoted');
  return { rejected, holds, warnings, accepted };
}
function chooseOutcome({ rejected, holds, warnings }, confirmed = false) {
  if (rejected.some(item => item.startsWith('artifact_disclosure'))) return 'REJECT_ARTIFACT_DISCLOSURE';
  if (rejected.length) return 'REJECT_AUTHORITY_OR_IDENTITY_CLAIM';
  if (holds.includes('nonce_reuse')) return 'HOLD_NONCE_REUSE';
  if (holds.some(item => item.includes('reference_mismatch'))) return 'HOLD_REFERENCE_MISMATCH';
  if (holds.some(item => item.includes('local_key_unavailable'))) return 'HOLD_KEY_UNAVAILABLE';
  if (holds.length) return 'HOLD_INSUFFICIENT_RELATA';
  if (warnings.length) return 'RELATION_ADMISSIBLE_WITH_WARNINGS';
  return confirmed ? 'RELATION_CONFIRMED_WITHIN_SCOPE' : 'RELATION_PROPOSAL_ADMISSIBLE';
}
export async function auditRelationProposal(
  proposalBundle,
  {
    ashReceipt, flowcoreReceipt, roundTripReceipt, key = proposalBundle?.key || null,
    nonceRegistry = null, auditId = null, createdAt = null,
    cryptoImpl = globalThis.crypto, TextEncoderImpl = globalThis.TextEncoder
  } = {}
) {
  const envelope = proposalBundle?.envelope || proposalBundle;
  const checks = await baseChecks({ envelope, ashReceipt, flowcoreReceipt, roundTripReceipt, key, cryptoImpl, TextEncoderImpl });
  if (envelope?.state !== 'PROPOSED') checks.holds.push('proposal_state_must_be_proposed');
  if (envelope?.operator_confirmation?.status !== 'UNCONFIRMED') checks.rejected.push('automatic_or_prior_confirmation_detected');
  if (nonceRegistry != null) {
    if (!(nonceRegistry instanceof NonceRegistry)) throw new TypeError('nonceRegistry must be a Phase V NonceRegistry.');
    if (envelope?.context_nonce && await nonceRegistry.has(envelope.context_nonce)) checks.holds.push('nonce_reuse');
  }
  const audit = {
    schema: APERTURE_RELATION_AUDIT_SCHEMA,
    audit_id: auditId || randomId('relaud_', cryptoImpl),
    relation_id: envelope?.relation_id || null,
    relation_digest: envelope?.relation_digest || null,
    created_at: createdAt || new Date().toISOString(),
    time_posture: 'local-clock-not-trusted-time',
    stage: 'PROPOSAL',
    outcome: null,
    accepted: checks.accepted,
    rejected: checks.rejected,
    holds: checks.holds,
    warnings: [...new Set(checks.warnings)],
    authority_transfer_detected: checks.rejected.length > 0,
    artifact_disclosure_detected: checks.rejected.some(item => item.startsWith('artifact_disclosure')),
    open_field_promotion: false,
    recommendation_not_command: true,
    operator_confirmation_required: true,
    automatic_ash_action: false,
    prediction_authorized: false,
    network_called: false,
    storage_mutated: false,
    seal: '⟐'
  };
  audit.outcome = chooseOutcome(checks, false);
  audit.audit_digest = await computeRelationAuditDigest(audit, { cryptoImpl, TextEncoderImpl });
  return Object.freeze(audit);
}
export async function auditConfirmedRelation(confirmedBundle, sourceOptions = {}) {
  const envelope = confirmedBundle?.envelope || confirmedBundle;
  const audit = await auditRelationProposal({
    envelope: { ...clone(envelope), state: 'PROPOSED', operator_confirmation: { status: 'UNCONFIRMED', confirmation_receipt_id: null } },
    key: confirmedBundle?.key || sourceOptions.key
  }, sourceOptions);
  const copy = clone(audit);
  copy.stage = 'CONFIRMED'; copy.relation_id = envelope?.relation_id || null; copy.relation_digest = envelope?.relation_digest || null;
  copy.holds = copy.holds.filter(item => item !== 'proposal_state_must_be_proposed');
  if (envelope?.state !== 'CONFIRMED') copy.holds.push('confirmed_state_missing');
  if (envelope?.operator_confirmation?.status !== 'CONFIRMED' || !envelope?.operator_confirmation?.confirmation_receipt_id) copy.holds.push('confirmation_receipt_reference_missing');
  copy.outcome = copy.rejected.length ? chooseOutcome(copy, true)
    : copy.holds.length ? 'HOLD_LIFECYCLE_CONTRADICTION'
      : copy.warnings.length ? 'RELATION_ADMISSIBLE_WITH_WARNINGS'
        : 'RELATION_CONFIRMED_WITHIN_SCOPE';
  delete copy.audit_digest;
  copy.audit_digest = await computeRelationAuditDigest(copy, sourceOptions);
  return Object.freeze(copy);
}
export async function auditCarrierIntegrity(
  originalEnvelope, carriedEnvelope,
  { auditId = null, createdAt = null, cryptoImpl = globalThis.crypto, TextEncoderImpl = globalThis.TextEncoder } = {}
) {
  const mutation = !originalEnvelope || !carriedEnvelope
    || originalEnvelope.relation_id !== carriedEnvelope.relation_id
    || originalEnvelope.relation_digest !== carriedEnvelope.relation_digest
    || JSON.stringify(originalEnvelope) !== JSON.stringify(carriedEnvelope);
  const audit = {
    schema: APERTURE_RELATION_AUDIT_SCHEMA,
    audit_id: auditId || randomId('relaud_', cryptoImpl),
    relation_id: originalEnvelope?.relation_id || carriedEnvelope?.relation_id || null,
    relation_digest: originalEnvelope?.relation_digest || null,
    created_at: createdAt || new Date().toISOString(),
    time_posture: 'local-clock-not-trusted-time',
    stage: 'MARROWLINE_CARRIER',
    outcome: mutation ? 'HOLD_CARRIER_MUTATION' : 'RELATION_REPLAY_ADMISSIBLE',
    accepted: mutation ? [] : ['carrier_digest_preserved', 'carrier_authority_absent'],
    rejected: [], holds: mutation ? ['carrier_mutation_detected'] : [],
    warnings: ['marrowline_carried_envelope'],
    marrowline_created_relation: false, marrowline_confirmed_relation: false,
    marrowline_key_access: false, recommendation_not_command: true,
    network_called: false, storage_mutated: false, seal: '⟐'
  };
  audit.audit_digest = await computeRelationAuditDigest(audit, { cryptoImpl, TextEncoderImpl });
  return Object.freeze(audit);
}
