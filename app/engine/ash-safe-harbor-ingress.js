import { canonicalDigest } from '../dome-world/ash/canonical-json.js';
import { clone, freeze, randomId } from './aperture-v31-core.js';
import { verifyAuthorityContext } from './ash-constitutional-convergence.js';

export const SAFE_HARBOR_INGRESS_SCHEMA = 'td613.ash.safe-harbor-ingress/v0.1';
export const SAFE_HARBOR_CUSTODY_BINDING_SCHEMA = 'td613.ash.safe-harbor-custody-binding/v0.1';
const ENVELOPE_DOMAIN = 'TD613:ASH:SAFE-HARBOR-INGRESS:v1';
const BINDING_DOMAIN = 'TD613:ASH:SAFE-HARBOR-CUSTODY-BINDING:v1';
const SHA256 = /^sha256:[0-9a-f]{64}$/;
const TOKEN = /^ash_ingress_[A-Za-z0-9_-]{12,160}$/;
const LEVELS = new Set(['L0', 'L1']);
const MAX_REFERENCES = 16;
const DEFAULT_TTL_MS = 15 * 60 * 1000;

function without(value, field) {
  const output = clone(value);
  delete output[field];
  return output;
}

function strings(values = []) {
  return [...new Set(values.map(value => String(value).trim()).filter(Boolean))].sort();
}

function digestOrNull(value) {
  const text = String(value || '');
  return SHA256.test(text) ? text : null;
}

function collectReferences(packet = {}) {
  const provenance = packet.binding_provenance || {};
  const issuance = packet.issuance || {};
  const v3 = issuance.v3 || {};
  const candidates = [
    ['packet_hash', packet.packet_hash_sha256],
    ['canonical_declaration', provenance.canonical_declaration_sha256],
    ['legacy_root', provenance.legacy_root_sha256],
    ['binding_receipt', provenance.binding_receipt_sha256],
    ['seal_receipt', provenance.seal_receipt_sha256],
    ['v3_fingerprint', v3.stylometric_fingerprint_v3_sha256],
    ['outside_witness', packet.outside_witness_receipt?.receipt_digest],
    ['release_receipt', packet.phase9_release_receipt?.receipt_digest]
  ];
  const seen = new Set();
  return candidates.flatMap(([kind, value]) => {
    const digest = digestOrNull(value);
    if (!digest || seen.has(digest)) return [];
    seen.add(digest);
    return [{ kind, digest }];
  }).slice(0, MAX_REFERENCES);
}

function signatureLane(packet = {}) {
  const signature = packet.signature || {};
  const overlay = packet.signature_overlay_authority || {};
  return {
    status: String(signature.status || overlay.status || 'absent').toUpperCase(),
    detached_signature_present: Boolean(signature.sig || overlay.detached_signature_present),
    operator_signature_claimed: Boolean(signature.operator_signature_claimed || overlay.operator_signature_claimed),
    signature_verified_by_adapter: false
  };
}

function envelopeState(failures) {
  if (failures.some(value => value.includes('tamper') || value.includes('packet-hash'))) return 'TAMPER_HOLD';
  if (failures.some(value => value.includes('origin'))) return 'ORIGIN_MISMATCH_HOLD';
  if (failures.some(value => value.includes('expired'))) return 'EXPIRED_LOCAL_POSTURE_HOLD';
  if (failures.some(value => value.includes('replay'))) return 'REPLAY_HOLD';
  if (failures.some(value => value.includes('duplicate'))) return 'DUPLICATE_REVIEW_HOLD';
  if (failures.some(value => value.includes('missing-reference'))) return 'MISSING_REFERENCE_HOLD';
  if (failures.some(value => value.includes('malformed') || value.includes('missing') || value.includes('cap'))) return 'MALFORMED_PACKET_HOLD';
  return 'INGRESS_ENVELOPE_ELIGIBLE';
}

export function createSafeHarborIngressToken(options = {}) {
  return randomId('ash_ingress_', options.cryptoImpl || globalThis.crypto);
}

export async function compileSafeHarborIngressEnvelope(packet = {}, input = {}, options = {}) {
  const failures = [];
  const token = String(input.token || createSafeHarborIngressToken(options));
  const origin = String(input.origin || '').trim();
  const createdAt = String(input.createdAt || new Date().toISOString());
  const ttlMs = Number.isSafeInteger(input.ttlMs) ? input.ttlMs : DEFAULT_TTL_MS;
  const packetHash = digestOrNull(packet.packet_hash_sha256);
  const packetId = String(packet.packet_id || packet.packetId || '').trim();
  const packetSchema = String(packet.schema_version || packet.schema || '').trim();
  const references = collectReferences(packet);

  if (!TOKEN.test(token)) failures.push('malformed-token');
  if (!origin || !/^https?:\/\//.test(origin)) failures.push('missing-origin');
  if (!packetId) failures.push('missing-packet-id');
  if (!packetSchema) failures.push('missing-packet-schema');
  if (!packetHash) failures.push('packet-hash-missing-or-malformed');
  if (input.packetHashVerified !== true) failures.push('packet-hash-not-verified');
  if (!references.length) failures.push('missing-reference:all');
  if (references.length > MAX_REFERENCES) failures.push('reference-cap-exceeded');
  if (!Number.isSafeInteger(ttlMs) || ttlMs < 60_000 || ttlMs > 86_400_000) failures.push('malformed-local-ttl');
  if (input.rawBodyIncluded === true) failures.push('malformed-raw-body-included');

  const record = {
    schema: SAFE_HARBOR_INGRESS_SCHEMA,
    version: 'v0.1',
    envelope_id: input.envelopeId || randomId('harboringress_', options.cryptoImpl || globalThis.crypto),
    token,
    created_at: createdAt,
    local_expiry_posture: {
      ttl_ms: ttlMs,
      elapsed_ms_at_compile: Number.isSafeInteger(input.elapsedMs) ? input.elapsedMs : 0,
      locally_expired: Number.isSafeInteger(input.elapsedMs) ? input.elapsedMs > ttlMs : false,
      trusted_external_time_used: false
    },
    origin,
    packet: {
      packet_id: packetId || null,
      schema_version: packetSchema || null,
      packet_hash_sha256: packetHash,
      source_status: String(input.sourceStatus || packet.source_status || 'OPERATOR_STAGED').toUpperCase(),
      authority_surface_status: String(input.authoritySurfaceStatus || 'UNCLASSIFIED').toUpperCase(),
      hash_replay_status: input.packetHashVerified === true ? 'PASS' : 'HOLD'
    },
    selected_provenance_references: references,
    signature_lane: signatureLane(packet),
    declared_omissions: strings(input.declaredOmissions || [
      'raw corpus', 'triad plaintext', 'room keys', 'complete Route Memory', 'Case Map',
      'Capsule plaintext', 'private aliases', 'local filesystem paths', 'provider credentials'
    ]),
    operator_intent: String(input.operatorIntent || 'CONSIDER_SAFE_HARBOR_REFERENCE_IN_ASH'),
    raw_body_included: false,
    raw_corpus_included: false,
    complete_case_map_included: false,
    complete_route_memory_included: false,
    room_keys_included: false,
    capsule_plaintext_included: false,
    private_aliases_included: false,
    local_filesystem_paths_included: false,
    universal_join_key: null,
    server_custody_created: false,
    provider_called: false,
    network_called_by_envelope: false,
    destination_transport_authorized: false,
    release_authorized: false,
    suppression_authorized: false,
    cinder_action_authorized: false,
    automatic_case_creation: false,
    automatic_relation_creation: false,
    automatic_custody_root_creation: false,
    duplicate_review_required: Boolean(input.duplicateDetected),
    replay_detected: Boolean(input.replayDetected),
    source_status: String(input.sourceStatus || 'DERIVED').toUpperCase(),
    state: null,
    ingress_eligible: false,
    failed_checks: [],
    envelope_digest: null
  };

  if (record.local_expiry_posture.locally_expired) failures.push('expired-local-posture');
  if (record.replay_detected) failures.push('replay-detected');
  if (record.duplicate_review_required && input.duplicateReviewed !== true) failures.push('duplicate-review-required');
  record.failed_checks = strings(failures);
  record.state = envelopeState(record.failed_checks);
  record.ingress_eligible = record.state === 'INGRESS_ENVELOPE_ELIGIBLE';
  record.envelope_digest = await canonicalDigest(ENVELOPE_DOMAIN, without(record, 'envelope_digest'), options);
  return freeze(record);
}

export async function verifySafeHarborIngressEnvelope(value, options = {}) {
  return Boolean(value && value.schema === SAFE_HARBOR_INGRESS_SCHEMA
    && TOKEN.test(String(value.token || ''))
    && SHA256.test(String(value.envelope_digest || ''))
    && value.envelope_digest === await canonicalDigest(ENVELOPE_DOMAIN, without(value, 'envelope_digest'), options));
}

function bindingState(failures) {
  if (failures.includes('cancelled')) return 'CANCELLED_HOLD';
  if (failures.some(value => value.includes('tamper'))) return 'TAMPER_HOLD';
  if (failures.some(value => value.includes('authority') || value.includes('case'))) return 'STALE_CASE_HOLD';
  if (failures.some(value => value.includes('envelope'))) return 'INGRESS_ENVELOPE_HOLD';
  if (failures.some(value => value.includes('level'))) return 'BINDING_LEVEL_HOLD';
  return 'CUSTODY_REFERENCE_BOUND';
}

export async function compileSafeHarborCustodyBinding(envelope, input = {}, options = {}) {
  const failures = [];
  const envelopeVerified = await verifySafeHarborIngressEnvelope(envelope, options);
  const level = String(input.bindingLevel || '').toUpperCase();
  if (!envelopeVerified || envelope?.ingress_eligible !== true) failures.push('envelope-unverified-or-ineligible');
  if (!LEVELS.has(level)) failures.push('binding-level-invalid');
  if (input.cancelled === true) failures.push('cancelled');
  if (input.operatorGesture !== 'BIND_SAFE_HARBOR_REFERENCE') failures.push('binding-level-operator-gesture-missing');

  const currentCaseRequired = level === 'L1';
  const authorityVerified = currentCaseRequired
    ? Boolean(input.authorityContext && await verifyAuthorityContext(input.authorityContext, {
      caseId: input.caseMap?.case_id,
      caseMapDigest: input.caseMap?.case_map_digest,
      routeMemoryDigest: input.routeMemory?.route_memory_digest
    }, options))
    : true;
  if (!authorityVerified) failures.push('authority-context-stale-or-unverified');

  const failedChecks = strings(failures);
  const state = bindingState(failedChecks);
  const record = {
    schema: SAFE_HARBOR_CUSTODY_BINDING_SCHEMA,
    version: 'v0.1',
    binding_id: input.bindingId || randomId('harborbinding_', options.cryptoImpl || globalThis.crypto),
    created_at: input.createdAt || new Date().toISOString(),
    envelope_id: envelope?.envelope_id || null,
    envelope_digest: envelope?.envelope_digest || null,
    packet_id: envelope?.packet?.packet_id || null,
    packet_hash_sha256: envelope?.packet?.packet_hash_sha256 || null,
    binding_level: LEVELS.has(level) ? level : null,
    binding_scope: level === 'L1' ? 'VERIFIED_PROVENANCE_REFERENCE_WITH_CURRENT_CASE' : 'REFERENCE_ONLY_NO_CASE_REQUIRED',
    case_id: level === 'L1' ? input.caseMap?.case_id || null : null,
    case_map_digest: level === 'L1' ? input.caseMap?.case_map_digest || null : null,
    route_memory_digest: level === 'L1' ? input.routeMemory?.route_memory_digest || null : null,
    authority_context_reference: level === 'L1' ? input.authorityContext?.receipt_id || null : null,
    authority_context_digest: level === 'L1' ? input.authorityContext?.authority_context_digest || null : null,
    selected_provenance_references: clone(envelope?.selected_provenance_references || []),
    checks: {
      envelope_verified: envelopeVerified,
      envelope_eligible: envelope?.ingress_eligible === true,
      operator_gesture_verified: input.operatorGesture === 'BIND_SAFE_HARBOR_REFERENCE',
      binding_level_verified: LEVELS.has(level),
      current_authority_context_verified: authorityVerified,
      raw_body_absent: envelope?.raw_body_included === false,
      universal_join_key_absent: envelope?.universal_join_key == null
    },
    state,
    custody_reference_bound: state === 'CUSTODY_REFERENCE_BOUND',
    custody_root_created: false,
    case_created: false,
    relation_created: false,
    authenticity_concluded: false,
    identity_concluded: false,
    authorship_concluded: false,
    truth_concluded: false,
    trusted_external_time_observed: false,
    server_custody_created: false,
    provider_called: false,
    network_called: false,
    destination_transport_authorized: false,
    release_authorized: false,
    suppression_authorized: false,
    cinder_action_authorized: false,
    failed_checks: failedChecks,
    closure: { required: true, status: String(input.closureStatus || 'OPEN') },
    binding_digest: null
  };
  record.binding_digest = await canonicalDigest(BINDING_DOMAIN, without(record, 'binding_digest'), options);
  return freeze(record);
}

export async function verifySafeHarborCustodyBinding(value, options = {}) {
  return Boolean(value && value.schema === SAFE_HARBOR_CUSTODY_BINDING_SCHEMA
    && SHA256.test(String(value.binding_digest || ''))
    && value.binding_digest === await canonicalDigest(BINDING_DOMAIN, without(value, 'binding_digest'), options));
}
