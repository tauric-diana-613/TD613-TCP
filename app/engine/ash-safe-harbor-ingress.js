import { canonicalDigest } from '../dome-world/ash/canonical-json.js';

export const SAFE_HARBOR_INGRESS_SCHEMA = 'td613.ash.safe-harbor-ingress/v0.1';
export const SAFE_HARBOR_INGRESS_TOKEN_SCHEMA = 'td613.ash.safe-harbor-ingress-token/v0.1';
export const SAFE_HARBOR_CUSTODY_CONSIDERATION_SCHEMA = 'td613.ash.safe-harbor-custody-consideration/v0.1';
export const SAFE_HARBOR_INGRESS_REPLAY_SCHEMA = 'td613.ash.safe-harbor-ingress-replay/v0.1';

const ENVELOPE_DOMAIN = 'TD613:ASH:SAFE-HARBOR-INGRESS:v1';
const TOKEN_DOMAIN = 'TD613:ASH:SAFE-HARBOR-INGRESS-TOKEN:v1';
const CONSIDERATION_DOMAIN = 'TD613:ASH:SAFE-HARBOR-CUSTODY-CONSIDERATION:v1';
const REPLAY_DOMAIN = 'TD613:ASH:SAFE-HARBOR-INGRESS-REPLAY:v1';
const SHA256 = /^sha256:[0-9a-f]{64}$/i;
const MAX_LOCAL_TTL_MS = 15 * 60 * 1000;
const FORBIDDEN_KEYS = Object.freeze([
  'raw_text',
  'raw_corpus',
  'corpus',
  'segments',
  'sealed',
  'plaintext',
  'capsule_plaintext',
  'room_key',
  'room_keys',
  'complete_route_memory',
  'route_memory',
  'case_map',
  'private_alias',
  'private_aliases',
  'filesystem_path',
  'local_path'
]);

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function without(value, ...fields) {
  const out = clone(value);
  for (const field of fields) delete out[field];
  return out;
}

function clean(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function uniqueSorted(values = []) {
  return [...new Set(values.map(value => String(value).trim()).filter(Boolean))].sort();
}

function randomTokenId(cryptoImpl = globalThis.crypto) {
  if (cryptoImpl?.randomUUID) return `ash_ingress_${cryptoImpl.randomUUID().replace(/-/g, '')}`;
  const bytes = new Uint8Array(16);
  if (cryptoImpl?.getRandomValues) cryptoImpl.getRandomValues(bytes);
  else for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
  return `ash_ingress_${Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')}`;
}

function hasForbiddenKey(value, path = '$') {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const result = hasForbiddenKey(value[index], `${path}[${index}]`);
      if (result) return result;
    }
    return null;
  }
  if (!value || typeof value !== 'object') return null;
  for (const [key, item] of Object.entries(value)) {
    const normalized = String(key).toLowerCase();
    if (FORBIDDEN_KEYS.includes(normalized)) return `${path}.${key}`;
    const result = hasForbiddenKey(item, `${path}.${key}`);
    if (result) return result;
  }
  return null;
}

function packetHash(packet) {
  return clean(packet?.packet_hash_sha256)
    || clean(packet?.hash_topology?.final_packet_hash_sha256)
    || null;
}

function signatureLane(packet) {
  const overlay = packet?.signature_overlay_authority || {};
  const binding = packet?.binding_provenance?.binding_event || {};
  return {
    lane: clean(overlay.lane) || clean(packet?.bridge?.signature_lane?.lane) || 'none',
    status: clean(overlay.status) || clean(binding.signature_status) || 'unsigned',
    source_status: clean(overlay.source_status) || 'SAFE_HARBOR_PACKET_REFERENCE'
  };
}

export function selectSafeHarborIngressReferences(packet = {}) {
  const binding = packet.binding_provenance || {};
  const declaration = binding.canonical_declaration || {};
  const event = binding.binding_event || {};
  const legacyRoot = binding.legacy_corpus_root || {};
  const issuance = packet.issuance || {};
  const receipt = packet.receipt || {};
  const phase5 = packet.phase5_replay_hardening || {};
  const phase8 = packet.phase8_public_default_gate || {};
  const phase9 = packet.phase9_release_discipline || {};
  const pipeline = packet.pipeline_state || {};

  return {
    packet: {
      schema_version: clean(packet.schema_version),
      packet_id: clean(packet.packet_id),
      packet_hash_sha256: packetHash(packet),
      receipt_id: clean(receipt.receipt_id),
      receipt_state: clean(receipt.state),
      minted_at: clean(receipt.minted_at)
    },
    binding: {
      declaration_sha256: declaration.sha256 ? `sha256:${String(declaration.sha256).replace(/^sha256:/i, '').toLowerCase()}` : null,
      binding_event_envelope_sha256: event.envelope_sha256 ? `sha256:${String(event.envelope_sha256).replace(/^sha256:/i, '').toLowerCase()}` : null,
      binding_event_signature_status: clean(event.signature_status),
      legacy_corpus_root_sha256: legacyRoot.sha256 ? `sha256:${String(legacyRoot.sha256).replace(/^sha256:/i, '').toLowerCase()}` : null,
      claim_ceiling: clean(binding.claim_ceiling)
    },
    issuance: {
      badge_number: clean(issuance.badge_number),
      badge_number_v3: clean(issuance.badge_number_v3),
      assignment_basis: clean(issuance.assignment_basis)
    },
    signature_lane: signatureLane(packet),
    governance: {
      phase5_status: clean(phase5.status),
      phase8_status: clean(phase8.status),
      phase9_release_class: clean(phase9.release_class),
      pipeline_version: clean(pipeline.pipeline_version)
    }
  };
}

function envelopeState(failures) {
  if (failures.some(value => value.includes('raw-body'))) return 'RAW_BODY_HOLD';
  if (failures.some(value => value.includes('origin'))) return 'ORIGIN_HOLD';
  if (failures.some(value => value.includes('expiry'))) return 'EXPIRY_POSTURE_HOLD';
  if (failures.some(value => value.includes('tamper'))) return 'TAMPER_HOLD';
  if (failures.some(value => value.includes('malformed'))) return 'MALFORMED_PACKET_HOLD';
  if (failures.some(value => value.includes('missing'))) return 'MISSING_REFERENCE_HOLD';
  return 'INGRESS_ENVELOPE_READY';
}

export async function compileSafeHarborIngressEnvelope(input = {}, options = {}) {
  const packet = input.packet || {};
  const failures = [];
  const origin = clean(input.origin);
  const createdAt = clean(input.createdAt) || new Date().toISOString();
  const ttlMs = Number.isSafeInteger(input.ttlMs) ? input.ttlMs : 5 * 60 * 1000;
  const references = input.selectedReferences ? clone(input.selectedReferences) : selectSafeHarborIngressReferences(packet);

  if (!packet || typeof packet !== 'object' || Array.isArray(packet)) failures.push('malformed-packet');
  if (!clean(packet.schema_version) || !clean(packet.packet_id)) failures.push('missing-packet-identity');
  if (!SHA256.test(String(packetHash(packet) || ''))) failures.push('missing-packet-hash');
  if (!origin || !/^https?:\/\//i.test(origin)) failures.push('origin-missing-or-invalid');
  if (!Number.isSafeInteger(ttlMs) || ttlMs <= 0 || ttlMs > MAX_LOCAL_TTL_MS) failures.push('expiry-posture-invalid');
  const forbiddenPath = hasForbiddenKey(references);
  if (forbiddenPath) failures.push(`raw-body-reference-forbidden:${forbiddenPath}`);

  const referenceDigest = await canonicalDigest(
    `${ENVELOPE_DOMAIN}:SELECTED-REFERENCES`,
    references,
    options
  );

  const state = envelopeState(uniqueSorted(failures));
  const envelope = {
    schema: SAFE_HARBOR_INGRESS_SCHEMA,
    version: 'v0.1',
    envelope_id: clean(input.envelopeId) || randomTokenId(options.cryptoImpl),
    created_at: createdAt,
    source_origin: origin,
    target_surface: 'ASH_KEEP_CUSTODY_ROOT_CONSIDERATION',
    operator_intent: clean(input.operatorIntent) || 'CONSIDER_REFERENCE_FOR_LOCAL_CUSTODY_ROOT',
    local_expiry_posture: {
      ttl_ms: ttlMs,
      trusted_external_time_claimed: false,
      browser_clock_is_trusted_time: false,
      operator_declaration_is_trusted_time: false
    },
    selected_references: references,
    selected_reference_digest: referenceDigest,
    declared_omissions: uniqueSorted([
      ...(Array.isArray(input.declaredOmissions) ? input.declaredOmissions : []),
      'raw-corpus',
      'safe-harbor-ingress-segments',
      'room-keys',
      'complete-route-memory',
      'case-map',
      'capsule-plaintext',
      'private-aliases',
      'local-filesystem-paths'
    ]),
    checks: {
      packet_identity_present: Boolean(clean(packet.schema_version) && clean(packet.packet_id)),
      packet_hash_present: SHA256.test(String(packetHash(packet) || '')),
      selected_references_body_free: !forbiddenPath,
      origin_bound: Boolean(origin),
      expiry_posture_bounded: Number.isSafeInteger(ttlMs) && ttlMs > 0 && ttlMs <= MAX_LOCAL_TTL_MS
    },
    failures: uniqueSorted(failures),
    state,
    ingress_eligible: state === 'INGRESS_ENVELOPE_READY',
    arrival_is_custody: false,
    packet_is_authenticity_proof: false,
    packet_is_identity_proof: false,
    packet_is_relation_proof: false,
    packet_is_truth_proof: false,
    case_created: false,
    custody_root_created: false,
    server_custody_authorized: false,
    provider_call_authorized: false,
    release_authorized: false,
    transport_authorized: false,
    suppression_authorized: false,
    cinder_action_authorized: false,
    envelope_digest: null
  };
  envelope.envelope_digest = await canonicalDigest(
    ENVELOPE_DOMAIN,
    without(envelope, 'envelope_digest'),
    options
  );
  return Object.freeze(envelope);
}

export async function verifySafeHarborIngressEnvelope(envelope, options = {}) {
  if (!envelope || envelope.schema !== SAFE_HARBOR_INGRESS_SCHEMA) return false;
  if (hasForbiddenKey(envelope.selected_references)) return false;
  const referenceDigest = await canonicalDigest(
    `${ENVELOPE_DOMAIN}:SELECTED-REFERENCES`,
    envelope.selected_references,
    options
  );
  if (referenceDigest !== envelope.selected_reference_digest) return false;
  const expected = await canonicalDigest(
    ENVELOPE_DOMAIN,
    without(envelope, 'envelope_digest'),
    options
  );
  return expected === envelope.envelope_digest
    && envelope.ingress_eligible === (envelope.state === 'INGRESS_ENVELOPE_READY')
    && envelope.arrival_is_custody === false
    && envelope.server_custody_authorized === false
    && envelope.transport_authorized === false;
}

export async function compileSafeHarborIngressToken(envelope, input = {}, options = {}) {
  const verified = await verifySafeHarborIngressEnvelope(envelope, options);
  const failures = [];
  if (!verified || envelope.ingress_eligible !== true) failures.push('envelope-unverified');
  const tokenId = clean(input.tokenId) || randomTokenId(options.cryptoImpl);
  const origin = clean(input.origin) || clean(envelope?.source_origin);
  if (!origin || origin !== envelope?.source_origin) failures.push('origin-mismatch');
  const record = {
    schema: SAFE_HARBOR_INGRESS_TOKEN_SCHEMA,
    version: 'v0.1',
    token_id: tokenId,
    envelope_id: envelope?.envelope_id || null,
    envelope_digest: envelope?.envelope_digest || null,
    origin,
    created_at: clean(input.createdAt) || envelope?.created_at || new Date().toISOString(),
    local_ttl_ms: envelope?.local_expiry_posture?.ttl_ms || null,
    one_time: true,
    consumed: false,
    failures: uniqueSorted(failures),
    state: failures.length ? 'TOKEN_HOLD' : 'TOKEN_READY',
    token_digest: null
  };
  record.token_digest = await canonicalDigest(TOKEN_DOMAIN, without(record, 'token_digest'), options);
  return Object.freeze(record);
}

export async function verifySafeHarborIngressToken(token, envelope, options = {}) {
  if (!token || token.schema !== SAFE_HARBOR_INGRESS_TOKEN_SCHEMA) return false;
  if (!await verifySafeHarborIngressEnvelope(envelope, options)) return false;
  const expected = await canonicalDigest(TOKEN_DOMAIN, without(token, 'token_digest'), options);
  return expected === token.token_digest
    && token.envelope_id === envelope.envelope_id
    && token.envelope_digest === envelope.envelope_digest
    && token.origin === envelope.source_origin
    && token.one_time === true
    && token.consumed === false
    && token.state === 'TOKEN_READY';
}

function considerationState(failures) {
  if (failures.includes('cancelled')) return 'CANCELLED_HOLD';
  if (failures.some(value => value.includes('duplicate'))) return 'DUPLICATE_HOLD';
  if (failures.some(value => value.includes('replay') || value.includes('consumed'))) return 'REPLAY_HOLD';
  if (failures.some(value => value.includes('origin'))) return 'ORIGIN_HOLD';
  if (failures.some(value => value.includes('expired'))) return 'EXPIRED_LOCAL_POSTURE_HOLD';
  if (failures.some(value => value.includes('tamper') || value.includes('unverified'))) return 'TAMPER_HOLD';
  if (failures.some(value => value.includes('missing') || value.includes('choice'))) return 'MISSING_REFERENCE_HOLD';
  return 'CUSTODY_ROOT_CONSIDERATION_READY';
}

export async function compileSafeHarborCustodyConsideration(input = {}, options = {}) {
  const failures = [];
  const envelope = input.envelope;
  const token = input.token;
  const choice = String(input.custodyLevel || '').toUpperCase();
  if (input.cancelled === true) failures.push('cancelled');
  if (input.duplicateDetected === true) failures.push('duplicate-reference');
  if (input.localExpiryObserved === true) failures.push('expired-local-posture');
  if (input.tokenConsumed === true) failures.push('token-consumed-replay');
  if (!['L0', 'L1'].includes(choice)) failures.push('custody-level-choice-required');
  if (!await verifySafeHarborIngressEnvelope(envelope, options)) failures.push('envelope-unverified-or-tampered');
  if (!await verifySafeHarborIngressToken(token, envelope, options)) failures.push('token-unverified-or-tampered');
  if (clean(input.currentOrigin) !== clean(envelope?.source_origin)) failures.push('origin-mismatch');

  const state = considerationState(uniqueSorted(failures));
  const ready = state === 'CUSTODY_ROOT_CONSIDERATION_READY';
  const record = {
    schema: SAFE_HARBOR_CUSTODY_CONSIDERATION_SCHEMA,
    version: 'v0.1',
    consideration_id: clean(input.considerationId) || randomTokenId(options.cryptoImpl),
    considered_at: clean(input.consideredAt) || new Date().toISOString(),
    envelope_reference: envelope?.envelope_id || null,
    envelope_digest: envelope?.envelope_digest || null,
    packet_reference: envelope?.selected_references?.packet || null,
    selected_reference_digest: envelope?.selected_reference_digest || null,
    requested_level: ['L0', 'L1'].includes(choice) ? choice : null,
    resulting_posture: ready
      ? (choice === 'L1' ? 'PROVISIONAL_CUSTODY_ROOT_REFERENCE' : 'ARRIVAL_REFERENCE_ONLY')
      : 'HELD',
    failures: uniqueSorted(failures),
    state,
    consideration_eligible: ready,
    token_consumption_required: ready,
    token_consumed_by_this_receipt: ready,
    custody_root_verified: false,
    custody_root_final: false,
    case_created: false,
    relation_created: false,
    authenticity_concluded: false,
    identity_concluded: false,
    truth_concluded: false,
    trusted_time_concluded: false,
    raw_body_ingested: false,
    server_custody_authorized: false,
    provider_call_authorized: false,
    release_authorized: false,
    transport_authorized: false,
    suppression_authorized: false,
    cinder_action_authorized: false,
    consideration_digest: null
  };
  record.consideration_digest = await canonicalDigest(
    CONSIDERATION_DOMAIN,
    without(record, 'consideration_digest'),
    options
  );
  return Object.freeze(record);
}

export async function verifySafeHarborCustodyConsideration(record, options = {}) {
  if (!record || record.schema !== SAFE_HARBOR_CUSTODY_CONSIDERATION_SCHEMA) return false;
  const expected = await canonicalDigest(
    CONSIDERATION_DOMAIN,
    without(record, 'consideration_digest'),
    options
  );
  return expected === record.consideration_digest
    && record.consideration_eligible === (record.state === 'CUSTODY_ROOT_CONSIDERATION_READY')
    && record.custody_root_verified === false
    && record.raw_body_ingested === false
    && record.transport_authorized === false;
}

export async function replaySafeHarborIngress(envelope, token, consideration, options = {}) {
  const envelopeVerified = await verifySafeHarborIngressEnvelope(envelope, options);
  const tokenVerified = await verifySafeHarborIngressToken(token, envelope, options);
  const considerationVerified = await verifySafeHarborCustodyConsideration(consideration, options);
  const replay = {
    schema: SAFE_HARBOR_INGRESS_REPLAY_SCHEMA,
    version: 'v0.1',
    envelope_digest: envelope?.envelope_digest || null,
    token_digest: token?.token_digest || null,
    consideration_digest: consideration?.consideration_digest || null,
    envelope_verified: envelopeVerified,
    token_verified: tokenVerified,
    consideration_verified: considerationVerified,
    raw_body_reexecuted: false,
    provider_reexecuted: false,
    server_contacted: false,
    status: envelopeVerified && tokenVerified && considerationVerified
      ? 'SAFE_HARBOR_INGRESS_REPLAY_VERIFIED'
      : 'SAFE_HARBOR_INGRESS_REPLAY_HOLD',
    replay_digest: null
  };
  replay.replay_digest = await canonicalDigest(REPLAY_DOMAIN, without(replay, 'replay_digest'), options);
  return Object.freeze(replay);
}

export async function verifySafeHarborIngressReplay(replay, options = {}) {
  if (!replay || replay.schema !== SAFE_HARBOR_INGRESS_REPLAY_SCHEMA) return false;
  const expected = await canonicalDigest(REPLAY_DOMAIN, without(replay, 'replay_digest'), options);
  return expected === replay.replay_digest
    && replay.raw_body_reexecuted === false
    && replay.provider_reexecuted === false
    && replay.server_contacted === false;
}
