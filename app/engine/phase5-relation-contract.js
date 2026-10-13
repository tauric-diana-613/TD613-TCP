import { canonicalDigest, verifyReceiptDigests } from '../dome-world/ash/canonical-json.js';
import { replayRoundTripReceipt } from './aperture-v3-reciprocal-bridge.js';
import {
  NonceRegistry,
  R0_RECEIPT_REFERENCES_ONLY,
  R1_ROUTE_SCOPED_ARTIFACT_REFERENCE,
  createRouteScopedReference
} from './phase5-relation-crypto.js';

export const RELATION_ENVELOPE_SCHEMA = 'td613.relation-envelope/v0.1';
export const RELATION_CONFIRMATION_SCHEMA = 'td613.relation-confirmation-receipt/v0.1';
export const APERTURE_RELATION_AUDIT_SCHEMA = 'td613.aperture.relation-audit/v0.1';
export const ASH_CUSTODY_SCHEMA = 'td613.ash.custody-receipt/v0.8';
export const FLOWCORE_CONTEXT_SCHEMA = 'td613.flowcore.context-receipt/v0.1';
export const APERTURE_ROUND_TRIP_SCHEMA = 'td613.aperture.round-trip-receipt/v3.0-alpha';
export const PHASE5_DIGEST_DOMAINS = Object.freeze({
  relationEnvelope: 'TD613:PHASE5:RELATION-ENVELOPE:v1',
  confirmation: 'TD613:PHASE5:RELATION-CONFIRMATION:v1',
  apertureAudit: 'TD613:PHASE5:APERTURE-RELATION-AUDIT:v1',
  phasonEvent: 'TD613:PHASE5:PHASON-RELATION-EVENT:v1',
  phasonChain: 'TD613:PHASE5:PHASON-RELATION-CHAIN:v1',
  replay: 'TD613:PHASE5:RELATION-REPLAY:v1',
  ashReference: 'TD613:PHASE5:ASH-REFERENCE:v1'
});
export const RELATION_STATES = Object.freeze(['PROPOSED', 'CONFIRMED', 'REVISED', 'WITHDRAWN', 'SUPERSEDED']);
export const FORBIDDEN_RELATION_FIELDS = Object.freeze([
  'artifact_digest', 'artifactDigest', 'raw_bytes', 'rawBytes', 'raw_content', 'file_content',
  'identity_proof', 'authorship_proof', 'ownership_proof', 'permission_proof', 'causation_proof',
  'location_proof', 'cooccurrence_proof', 'automatic_ash_action', 'prediction_authorized', 'doctrine_writeback'
]);
export const RELATION_NONCLAIMS = Object.freeze([
  'identity', 'authorship', 'possession', 'ownership', 'permission', 'location',
  'co-occurrence', 'causation', 'truth', 'trusted-time'
]);

const HEX64 = /^sha256:[0-9a-f]{64}$/;
const IDS = Object.freeze({
  ash: /^ashc_[0-9a-f]{20}$/,
  flow: /^flowctx_[A-Za-z0-9_-]{6,128}$/,
  roundTrip: /^aprt_[A-Za-z0-9_-]{6,128}$/
});
export const cloneRelationValue = value => value == null ? value : JSON.parse(JSON.stringify(value));
export function deepFreezeRelationValue(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreezeRelationValue);
  return Object.freeze(value);
}
export function randomRelationId(prefix, cryptoImpl = globalThis.crypto) {
  if (!cryptoImpl?.getRandomValues) throw new Error('Secure random values are unavailable.');
  const bytes = new Uint8Array(10); cryptoImpl.getRandomValues(bytes);
  return prefix + Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}
export function relationDigestSubject(value, digestField) {
  const output = cloneRelationValue(value); delete output[digestField]; return output;
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
export function findForbiddenRelationFields(value) {
  const forbidden = new Set(FORBIDDEN_RELATION_FIELDS); const hits = [];
  walk(value, (key, child, path) => { if (forbidden.has(key) && active(child)) hits.push(path); });
  return Object.freeze(hits);
}
function requireId(value, pattern, label) {
  if (!pattern.test(String(value || ''))) throw new Error(`${label} is missing or malformed.`);
}
export function ashCommittedArtifactDigest(receipt) {
  return receipt?.manifest?.artifact_metadata?.artifact_digest
    || receipt?.manifest?.local_commitment?.artifact_digest
    || null;
}

export function validateAshCustodyReceipt(receipt, {
  requireArtifactDigest = false, artifactDigest = null
} = {}) {
  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) throw new TypeError('Phase V requires an Ash custody receipt object.');
  if (receipt.schema !== ASH_CUSTODY_SCHEMA) throw new Error('Unsupported Ash custody receipt schema.');
  requireId(receipt.receipt_id, IDS.ash, 'Ash receipt ID');
  if (!['L0_METADATA_ONLY', 'L1_BROWSER_LOCAL_ARTIFACT_DIGEST'].includes(receipt.assurance_class)) throw new Error('Ash assurance class is unsupported.');
  const committed = ashCommittedArtifactDigest(receipt);
  if (receipt.assurance_class === 'L1_BROWSER_LOCAL_ARTIFACT_DIGEST') {
    if (receipt.artifact_digest_present !== true || !HEX64.test(String(committed || ''))) {
      throw new Error('L1 Ash receipt must contain a browser-local artifact commitment.');
    }
    if (artifactDigest != null && artifactDigest !== committed) {
      throw new Error('Local artifact digest does not match the Ash custody commitment.');
    }
  } else if (committed != null) {
    throw new Error('L0 Ash receipt cannot carry an artifact commitment.');
  }
  if (requireArtifactDigest && receipt.assurance_class !== 'L1_BROWSER_LOCAL_ARTIFACT_DIGEST') throw new Error('R1 requires an L1 Ash receipt.');
  if (requireArtifactDigest && !HEX64.test(String(artifactDigest || ''))) throw new Error('R1 requires the local artifact digest committed by Ash.');
  return receipt;
}
export async function validateAshCustodyReceiptIntegrity(receipt, options = {}) {
  validateAshCustodyReceipt(receipt, options);
  const verification = await verifyReceiptDigests(receipt, options);
  if (!verification.valid) throw new Error('Ash custody receipt failed independent digest verification.');
  return Object.freeze({ receipt, verification });
}
export function validateFlowCoreContextReceipt(receipt) {
  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) throw new TypeError('Phase V requires a Flow-Core context receipt object.');
  if (receipt.schema !== FLOWCORE_CONTEXT_SCHEMA) throw new Error('Unsupported Flow-Core context schema.');
  requireId(receipt.receipt_id, IDS.flow, 'Flow-Core receipt ID');
  if (receipt.artifact_reference !== null || receipt.artifact_blind !== true) throw new Error('Flow-Core context receipt must remain artifact-blind.');
  if (receipt.automatic_ash_action !== false || receipt.prediction_authorized !== false) throw new Error('Flow-Core authority boundary mismatch.');
  return receipt;
}
export async function validateRoundTripReceipt(receipt, flowcoreReceipt, { replay = replayRoundTripReceipt, ...options } = {}) {
  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) throw new TypeError('Phase V requires an Aperture round-trip receipt object.');
  if (receipt.schema !== APERTURE_ROUND_TRIP_SCHEMA) throw new Error('Unsupported Aperture round-trip schema.');
  requireId(receipt.receipt_id, IDS.roundTrip, 'Round-trip receipt ID');
  if (receipt.context?.receipt?.receipt_id !== flowcoreReceipt.receipt_id) throw new Error('Round-trip receipt does not reference the selected Flow-Core receipt.');
  const jurisdiction = receipt.jurisdiction || {};
  if (jurisdiction.automatic_ash_action !== false || jurisdiction.prediction_authorized !== false
    || jurisdiction.reciprocal_authority !== false || jurisdiction.artifact_relation !== false) {
    throw new Error('Round-trip receipt authority boundary mismatch.');
  }
  const replayed = await replay(receipt, options);
  if (!String(replayed?.status || '').startsWith('ROUND_TRIP_VERIFIED')) throw new Error(`Round-trip receipt failed independent replay: ${replayed?.status || 'unknown'}.`);
  return Object.freeze({ receipt, replay: replayed });
}

export const relationEnvelopeDigestSubject = envelope => relationDigestSubject(envelope, 'relation_digest');
export const confirmationDigestSubject = receipt => relationDigestSubject(receipt, 'confirmation_digest');
export const computeRelationDigest = (envelope, options = {}) => canonicalDigest(
  PHASE5_DIGEST_DOMAINS.relationEnvelope, relationEnvelopeDigestSubject(envelope), options
);
export const computeConfirmationDigest = (receipt, options = {}) => canonicalDigest(
  PHASE5_DIGEST_DOMAINS.confirmation, confirmationDigestSubject(receipt), options
);

export async function compileRelationProposal(input, options = {}) {
  const {
    ashReceipt, flowcoreReceipt, roundTripReceipt,
    assuranceClass = R0_RECEIPT_REFERENCES_ONLY,
    routeScope = 'local-research-review', taskIntentRoute = null,
    bindingPurpose = 'operator-declared-contextual-review', artifactDigest = null,
    contextNonce = null, relationId = null, createdAt = null,
    revisionOf = null, supersedesRelationId = null
  } = input || {};
  const { cryptoImpl = globalThis.crypto, TextEncoderImpl = globalThis.TextEncoder,
    replay = replayRoundTripReceipt, nonceRegistry = null } = options;
  await validateAshCustodyReceiptIntegrity(ashReceipt, {
    requireArtifactDigest: assuranceClass === R1_ROUTE_SCOPED_ARTIFACT_REFERENCE,
    artifactDigest, cryptoImpl, TextEncoderImpl
  });
  validateFlowCoreContextReceipt(flowcoreReceipt);
  const roundTripValidation = await validateRoundTripReceipt(roundTripReceipt, flowcoreReceipt, { replay, cryptoImpl, TextEncoderImpl });
  if (nonceRegistry != null && !(nonceRegistry instanceof NonceRegistry)) throw new TypeError('nonceRegistry must be a Phase V NonceRegistry.');
  const route = {
    route_scope: String(routeScope || '').trim(),
    task_intent_route: String(taskIntentRoute || roundTripReceipt.route?.task_intent?.primary_route || 'REQUESTED_SYNTHESIS').trim(),
    binding_purpose: String(bindingPurpose || '').trim()
  };
  if (!route.route_scope || !route.task_intent_route || !route.binding_purpose) throw new Error('Relation route scope, task intent, and binding purpose are required.');
  const reference = await createRouteScopedReference({
    assuranceClass, ashAssuranceClass: ashReceipt.assurance_class,
    artifactDigest, contextNonce, routeScope: route.route_scope,
    key: null, cryptoImpl, TextEncoderImpl
  });
  if (nonceRegistry && await nonceRegistry.has(reference.context_nonce)) throw new Error('HOLD_NONCE_REUSE');
  const envelope = {
    schema: RELATION_ENVELOPE_SCHEMA,
    relation_id: relationId || randomRelationId('rel_', cryptoImpl),
    created_at: createdAt || new Date().toISOString(),
    time_posture: 'local-clock-not-trusted-time', state: 'PROPOSED', assurance_class: assuranceClass,
    references: {
      ash_custody_receipt_id: ashReceipt.receipt_id, ash_custody_receipt_schema: ashReceipt.schema,
      ash_assurance_class: ashReceipt.assurance_class,
      flowcore_context_receipt_id: flowcoreReceipt.receipt_id, flowcore_context_receipt_schema: flowcoreReceipt.schema,
      aperture_round_trip_receipt_id: roundTripReceipt.receipt_id, aperture_round_trip_receipt_schema: roundTripReceipt.schema
    },
    route, context_nonce: reference.context_nonce, ash_reference: reference.ash_reference,
    hmac: assuranceClass === R1_ROUTE_SCOPED_ARTIFACT_REFERENCE ? {
      profile: 'td613.phase5.route-scoped-reference/v0.1', algorithm: 'HMAC-SHA-256',
      key_scope: 'single-relation', key_exported: false, key_extractable: false, verification: 'local-key-required'
    } : null,
    operator_confirmation: { status: 'UNCONFIRMED', confirmation_receipt_id: null },
    visibility: { posture: 'PRIVATE_LOCAL_DEFAULT', session_mode: 'SESSION_MEMORY_ONLY', server_persistence: false, public_export: false },
    lineage: { revision_of: revisionOf, supersedes_relation_id: supersedesRelationId },
    open_field_promotion: false, automatic_relation_creation: false, automatic_confirmation: false,
    automatic_ash_action: false, prediction_authorized: false, relation_is_identity: false,
    relation_is_causation: false, relation_is_permission: false, marrowline_confirmation_authority: false,
    does_not_establish: [...RELATION_NONCLAIMS], seal: '⟐'
  };
  const forbidden = findForbiddenRelationFields(envelope);
  if (forbidden.length) throw new Error(`Relation proposal contains forbidden fields: ${forbidden.join(', ')}`);
  envelope.relation_digest = await computeRelationDigest(envelope, { cryptoImpl, TextEncoderImpl });
  return deepFreezeRelationValue({
    envelope, key: reference.key,
    source_validation: {
      ash: assuranceClass === R1_ROUTE_SCOPED_ARTIFACT_REFERENCE
        ? 'DIGEST_VERIFIED_AND_ARTIFACT_COMMITMENT_MATCHED'
        : 'DIGEST_VERIFIED',
      flowcore: 'VALIDATED_REFERENCE',
      round_trip: roundTripValidation.replay.status
    },
    side_effects: { network_called: false, storage_mutated: false, phason_event_created: false, confirmed: false, ash_action_triggered: false }
  });
}
