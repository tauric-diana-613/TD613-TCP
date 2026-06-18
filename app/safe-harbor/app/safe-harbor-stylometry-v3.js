const LANES = ['future_self', 'past_self', 'higher_self'];
const LANE_RICH_PROFILE_SCHEMA = 'td613.safe-harbor.lane-rich-profile/v1';
const ISSUANCE_V3_SCHEMA = 'td613.safe-harbor.issuance-v3/v1';
const FINGERPRINT_V3_SCHEMA = 'td613.safe-harbor.stylometric-fingerprint/v3';
const MIGRATION_ATTESTATION_SCHEMA = 'td613.safe-harbor.migration-attestation/v1';

const SCALAR_FIELDS = [
  'contentWordComplexity',
  'modifierDensity',
  'hedgeDensity',
  'abstractionPosture',
  'directness',
  'latinatePreference',
  'abbreviationDensity',
  'orthographicLooseness',
  'fragmentPressure',
  'conversationalPosture',
  'syntacticBranchingDepth',
  'structuralFriction',
  'lexicalEntropyScore',
  'characterEntropyBits',
  'tokenEntropyBits',
  'transitionVariance',
  'acousticWeight',
  'registerMode'
];

const NUMERIC_SCALAR_FIELDS = SCALAR_FIELDS.filter((key) => key !== 'registerMode');
const DISTRIBUTION_FIELDS = ['functionWordProfile', 'wordLengthProfile', 'charTrigramProfile', 'surfaceMarkerProfile'];

const DISTRIBUTION_POLICY = Object.freeze({
  functionWordProfile: { key: 'functionWordProfileDigest', topK: 32, step: 0.0001 },
  wordLengthProfile: { key: 'wordLengthProfileDigest', topK: null, step: 0.0001 },
  charTrigramProfile: { key: 'charTrigramProfileDigest', topK: 64, step: 0.0001 },
  surfaceMarkerProfile: { key: 'surfaceMarkerProfileDigest', topK: 32, step: 0.0001 }
});

const QUANTIZATION = Object.freeze({
  posture: 0.001,
  entropy: 0.001,
  structure: 0.01,
  distribution: 0.0001,
  traceability: 0.001,
  divergence: 0.001
});

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function bindingFragment(packet) {
  const value = packet && packet.canon && packet.canon.binding_fragment ? String(packet.canon.binding_fragment) : '#9B07D8B';
  return value.charAt(0) === '#' ? value : '#' + value;
}

function sacText(packet) {
  const value = packet && packet.canon && packet.canon.sac ? String(packet.canon.sac) : 'SAC[X6ZNK5NO51]';
  return value.indexOf('SAC[') === 0 ? value : 'SAC[' + value + ']';
}

function principal(packet) {
  return packet && packet.canon && packet.canon.principal ? String(packet.canon.principal) : 'tauric.diana.613';
}

function stableIssuedAt(packet) {
  const value = packet && packet.intake && packet.intake.ts_utc
    ? packet.intake.ts_utc
    : packet && packet.created_at
      ? packet.created_at
      : new Date().toISOString();
  return String(value).replace(/\.\d{3}Z$/, 'Z');
}

function q(value, step = 0.001) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  const quantized = Math.round(num / step) * step;
  const places = step >= 0.01 ? 2 : step >= 0.001 ? 3 : 4;
  return Number(quantized.toFixed(places));
}

function quantizeScalar(key, value) {
  if (key === 'registerMode') return String(value || '');
  if (key.indexOf('Entropy') !== -1 || key === 'transitionVariance') return q(value, QUANTIZATION.entropy);
  if (key === 'syntacticBranchingDepth' || key === 'structuralFriction' || key === 'acousticWeight') return q(value, QUANTIZATION.structure);
  return q(value, QUANTIZATION.posture);
}

function isLaneMap(value) {
  if (!isPlainObject(value)) return false;
  const keys = Object.keys(value);
  return keys.length === LANES.length && LANES.every((key) => Object.prototype.hasOwnProperty.call(value, key));
}

export function stableCanonicalJson(value) {
  if (value === undefined) return undefined;
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map((item) => stableCanonicalJson(item)).join(',') + ']';
  const keys = isLaneMap(value)
    ? LANES.slice()
    : Object.keys(value).filter((key) => value[key] !== undefined).sort();
  return '{' + keys.map((key) => JSON.stringify(key) + ':' + stableCanonicalJson(value[key])).join(',') + '}';
}

async function sha256Hex(text) {
  const value = String(text || '');
  if (globalThis.crypto && globalThis.crypto.subtle && globalThis.TextEncoder) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  try {
    const nodeCrypto = await import('node:crypto');
    return nodeCrypto.createHash('sha256').update(value).digest('hex');
  } catch (error) {
    throw new Error('SHA-256 unavailable: crypto.subtle or node:crypto is required for v3 derivation');
  }
}

async function sha256Tagged(value) {
  return 'sha256:' + await sha256Hex(typeof value === 'string' ? value : stableCanonicalJson(value));
}

export async function digestDistribution(profile = {}, topK = 64, quantizationStep = QUANTIZATION.distribution) {
  const entries = Object.entries(profile || {})
    .filter(([, value]) => Number(value || 0) > 0)
    .sort((left, right) => {
      const delta = Number(right[1] || 0) - Number(left[1] || 0);
      return delta || String(left[0]).localeCompare(String(right[0]));
    })
    .slice(0, topK == null ? undefined : Number(topK))
    .map(([key, value]) => [String(key), q(value, quantizationStep)]);
  return Object.freeze({
    top_k: topK == null ? 'full' : Number(topK),
    entries,
    digest: await sha256Tagged({ top_k: topK == null ? 'full' : Number(topK), entries })
  });
}

function fingerprintSchemaV3() {
  return Object.freeze({
    schema: FINGERPRINT_V3_SCHEMA,
    lane_order: LANES.slice(),
    scalar_fields: SCALAR_FIELDS.slice(),
    distribution_policy: clone(DISTRIBUTION_POLICY),
    quantization_policy: clone(QUANTIZATION),
    raw_text_included: false,
    volatile_timestamps_included: false,
    lane_source_required: LANE_RICH_PROFILE_SCHEMA
  });
}

function missingRichProfileFields(profile) {
  const missing = [];
  if (!isPlainObject(profile)) return SCALAR_FIELDS.concat(DISTRIBUTION_FIELDS);
  for (const key of NUMERIC_SCALAR_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(profile, key) || !Number.isFinite(Number(profile[key]))) missing.push(key);
  }
  if (!Object.prototype.hasOwnProperty.call(profile, 'registerMode') || typeof profile.registerMode !== 'string' || profile.registerMode.trim() === '') missing.push('registerMode');
  for (const key of DISTRIBUTION_FIELDS) {
    if (!isPlainObject(profile[key]) || Object.keys(profile[key]).length === 0) missing.push(key);
  }
  return missing;
}

async function lanePreimage(signature) {
  const profile = signature && signature.rich_profile ? signature.rich_profile : {};
  const lane = {};
  for (const key of SCALAR_FIELDS) lane[key] = quantizeScalar(key, profile[key]);
  for (const [sourceKey, policy] of Object.entries(DISTRIBUTION_POLICY)) {
    lane[policy.key] = await digestDistribution(profile[sourceKey] || {}, policy.topK, policy.step);
  }
  return lane;
}

function bridgeRichHashCovered(packet) {
  const semantics = packet && packet.rich_stylometry_hash_semantics;
  return Boolean(semantics && semantics.bridge_rich_stylometry_hash_covered === true);
}

function traceability(packet) {
  const richAllowed = bridgeRichHashCovered(packet);
  const rich = richAllowed && packet && packet.analysis && packet.analysis.rich_stylometry ? packet.analysis.rich_stylometry : null;
  const surface = rich && rich.traceability_surface ? rich.traceability_surface : null;
  return {
    score: richAllowed ? q(surface && surface.score, QUANTIZATION.traceability) : null,
    band: richAllowed && surface && surface.band ? String(surface.band) : null,
    packet_hash_sha256: packet && packet.packet_hash_sha256 ? String(packet.packet_hash_sha256) : null,
    hash_semantics: clone(packet && packet.rich_stylometry_hash_semantics ? packet.rich_stylometry_hash_semantics : null)
  };
}

function divergence(packet) {
  const richAllowed = bridgeRichHashCovered(packet);
  const rich = richAllowed && packet && packet.analysis && packet.analysis.rich_stylometry ? packet.analysis.rich_stylometry : null;
  const richDivergence = rich && rich.cross_lane_divergence ? rich.cross_lane_divergence : null;
  return {
    legacy_divergence_signature: clone(packet && packet.issuance && packet.issuance.stylometric_provenance ? packet.issuance.stylometric_provenance.divergence_signature : null),
    rich_cross_lane_stability: richAllowed ? q(richDivergence && richDivergence.cross_lane_stability, QUANTIZATION.divergence) : null,
    rich_cross_lane_spread: richAllowed ? q(richDivergence && richDivergence.cross_lane_spread, QUANTIZATION.divergence) : null,
    strongest_pair: richAllowed ? clone(richDivergence && richDivergence.strongest_pair ? richDivergence.strongest_pair : null) : null,
    widest_pair: richAllowed ? clone(richDivergence && richDivergence.widest_pair ? richDivergence.widest_pair : null) : null
  };
}

function triad(packet) {
  const analysis = packet && packet.analysis ? packet.analysis : {};
  const issuance = packet && packet.issuance ? packet.issuance : {};
  return {
    triad_word_counts: clone(issuance.triad_word_counts || null),
    triad_shortfalls: clone(issuance.triad_shortfalls || null),
    triad_resonance: q(analysis.triad_resonance, QUANTIZATION.divergence),
    cross_lane_stability: q(analysis.cross_lane_stability, QUANTIZATION.divergence),
    cross_lane_spread: q(analysis.cross_lane_spread, QUANTIZATION.divergence)
  };
}

export function canIssueV3(packet) {
  const reasons = [];
  const signatures = packet && packet.analysis && packet.analysis.segment_cadence_signatures;
  if (!signatures || typeof signatures !== 'object') reasons.push('segment_cadence_signatures missing');
  for (const key of LANES) {
    const lane = signatures && signatures[key];
    if (!lane || typeof lane !== 'object') {
      reasons.push('native ' + key + ' signature missing');
      continue;
    }
    if (!lane.rich_profile || typeof lane.rich_profile !== 'object') reasons.push('native ' + key + ' rich_profile missing');
    else {
      const missing = missingRichProfileFields(lane.rich_profile);
      if (missing.length) reasons.push('native ' + key + ' rich_profile incomplete: ' + missing.join(', '));
    }
    if (lane.rich_profile_schema !== LANE_RICH_PROFILE_SCHEMA) reasons.push('native ' + key + ' rich_profile_schema mismatch');
  }
  const issuance = packet && packet.issuance ? packet.issuance : {};
  if (!issuance.badge_number) reasons.push('legacy v2 badge_number missing');
  if (!issuance.stylometric_fingerprint) reasons.push('legacy v2 stylometric_fingerprint missing');
  const semantics = packet && packet.rich_stylometry_hash_semantics;
  if (!semantics || semantics.native_lane_rich_profile_hash_covered !== true) {
    const bridgeOnly = Boolean(packet && packet.analysis && packet.analysis.rich_stylometry);
    reasons.push(bridgeOnly ? 'bridge-only rich stylometry present; native lane rich_profile absent or not hash-covered' : 'native lane rich_profile hash coverage not attested');
  }
  return Object.freeze({ ready: reasons.length === 0, blocking_reasons: reasons });
}

async function buildPreimage(packet) {
  const signatures = packet.analysis.segment_cadence_signatures;
  const lanes = {};
  for (const key of LANES) lanes[key] = await lanePreimage(signatures[key]);
  return Object.freeze({
    schema: FINGERPRINT_V3_SCHEMA,
    principal: principal(packet),
    binding_fragment: bindingFragment(packet),
    sac: sacText(packet),
    legacy_v2_badge_number: packet.issuance.badge_number,
    legacy_v2_fingerprint: String(packet.issuance.stylometric_fingerprint),
    lanes,
    triad: triad(packet),
    divergence: divergence(packet),
    traceability: traceability(packet)
  });
}

export async function buildStylometricFingerprintV3(packet) {
  const gate = canIssueV3(packet);
  if (!gate.ready) return Object.freeze({ status: 'blocked', blocking_reasons: gate.blocking_reasons, canonical_preimage: null, canonical_preimage_json: null, stylometric_fingerprint_v3: null });
  const canonical_preimage = await buildPreimage(packet);
  const canonical_preimage_json = stableCanonicalJson(canonical_preimage);
  const stylometric_fingerprint_v3 = await sha256Tagged(canonical_preimage_json);
  return Object.freeze({ status: 'issued', canonical_preimage, canonical_preimage_json, stylometric_fingerprint_v3 });
}

export async function buildShiV3(packet, fingerprintResult = null) {
  const fingerprint = fingerprintResult || await buildStylometricFingerprintV3(packet);
  if (!fingerprint || fingerprint.status !== 'issued') return null;
  const seed_components = [
    { index: 0, kind: 'literal', value: 'td613.shi/v3' },
    { index: 1, kind: 'principal', value: principal(packet) },
    { index: 2, kind: 'binding_fragment', value: bindingFragment(packet) },
    { index: 3, kind: 'sac', value: sacText(packet) },
    { index: 4, kind: 'legacy_v2_badge_number', value: packet.issuance.badge_number },
    { index: 5, kind: 'legacy_v2_fingerprint', value: String(packet.issuance.stylometric_fingerprint) },
    { index: 6, kind: 'stylometric_fingerprint_v3', value: fingerprint.stylometric_fingerprint_v3 }
  ];
  const seed = seed_components.map((part) => String(part.value || '')).join('|');
  const seed_hash_sha256 = await sha256Tagged(seed);
  const suffix = seed_hash_sha256.replace(/^sha256:/, '').slice(0, 10).toUpperCase();
  const badge_number_v3 = 'TD613-SH3-' + bindingFragment(packet).replace('#', '') + '-' + suffix;
  return Object.freeze({
    badge_number_v3,
    shi_derivation_v3: {
      algorithm: 'TD613-SH3-<binding_fragment>-<10_hex>',
      seed_components,
      seed_join_delimiter: '|',
      hash: { name: 'SHA-256', badge_slice: '0..10', case: 'uppercase', seed_hash_sha256 },
      verification_rule: 'Rebuild the v3 canonical preimage from native lane rich_profile fields, hash it with SHA-256, then hash the v3 seed components and take the first 10 uppercase hex characters.'
    }
  });
}

export function buildV2V3Verification(packet, v3 = {}) {
  const issuance = packet && packet.issuance ? packet.issuance : {};
  return Object.freeze({
    v2: {
      role: 'primary_recall_credential',
      badge_number: issuance.badge_number || null,
      stylometric_fingerprint: issuance.stylometric_fingerprint == null ? null : String(issuance.stylometric_fingerprint),
      status: 'unchanged'
    },
    v3: {
      role: 'forensic_secondary_credential',
      badge_number_v3: v3.badge_number_v3 || null,
      stylometric_fingerprint_v3: v3.stylometric_fingerprint_v3 || null,
      status: v3.status || 'blocked'
    },
    promotion_status: 'v3-not-yet-recall-authoritative',
    compatibility_note: 'v2 remains authoritative for reopen and legacy verification until an explicit dual-recall phase changes the validator.'
  });
}

export function buildMigrationAttestation(packet, mode = 'blocked', blockingReason = null) {
  const issued = mode === 'issued';
  return Object.freeze(issued ? {
    schema_version: MIGRATION_ATTESTATION_SCHEMA,
    from: 'stylometric-provenance/v2',
    to: 'stylometric-provenance/v3',
    mode: 'dual-track',
    source: 'native lane rich_profile',
    legacy_fields_preserved: true,
    raw_text_included: false,
    backfilled: false,
    packet_rewrite: false,
    issued_at: stableIssuedAt(packet),
    claim_supported: 'v3 forensic credential derived from native rich stylometric features',
    claim_limit: 'does not replace v2 recall credential or perform real-world identity adjudication'
  } : {
    schema_version: MIGRATION_ATTESTATION_SCHEMA,
    mode: 'blocked',
    source: packet && packet.analysis && packet.analysis.rich_stylometry ? 'bridge-only or legacy stylometry' : 'legacy stylometry',
    blocking_reason: blockingReason || 'native rich_profile absent',
    legacy_fields_preserved: true,
    raw_text_included: false,
    claim_supported: 'legacy packet remains analyzable',
    claim_limit: 'not v3-derivable'
  });
}

export async function buildV3Issuance(packet) {
  const base = {
    schema_version: ISSUANCE_V3_SCHEMA,
    status: 'blocked',
    badge_number_v3: null,
    stylometric_fingerprint_v3: null,
    fingerprint_schema_v3: fingerprintSchemaV3(),
    shi_derivation_v3: {},
    v2_v3_verification: {},
    migration_attestation: {}
  };
  const gate = canIssueV3(packet);
  if (!gate.ready) {
    const blocking_reason = gate.blocking_reasons.join('; ');
    const blocked = Object.assign({}, base, {
      blocking_reason,
      v2_v3_verification: buildV2V3Verification(packet, { status: 'blocked' }),
      migration_attestation: buildMigrationAttestation(packet, 'blocked', blocking_reason)
    });
    return Object.freeze(blocked);
  }
  const fingerprint = await buildStylometricFingerprintV3(packet);
  const shi = await buildShiV3(packet, fingerprint);
  const issued = Object.assign({}, base, {
    status: 'issued',
    badge_number_v3: shi.badge_number_v3,
    stylometric_fingerprint_v3: fingerprint.stylometric_fingerprint_v3,
    shi_derivation_v3: shi.shi_derivation_v3,
    v2_v3_verification: buildV2V3Verification(packet, {
      status: 'issued',
      badge_number_v3: shi.badge_number_v3,
      stylometric_fingerprint_v3: fingerprint.stylometric_fingerprint_v3
    }),
    migration_attestation: buildMigrationAttestation(packet, 'issued')
  });
  return Object.freeze(issued);
}

if (typeof window !== 'undefined') {
  window.TD613_SAFE_HARBOR_STYLOMETRY_V3 = Object.freeze({
    version: ISSUANCE_V3_SCHEMA,
    stableCanonicalJson,
    digestDistribution,
    canIssueV3,
    buildStylometricFingerprintV3,
    buildShiV3,
    buildV2V3Verification,
    buildMigrationAttestation,
    buildV3Issuance
  });
  window.dispatchEvent(new CustomEvent('td613:safe-harbor:stylometry-v3-ready', {
    detail: { version: ISSUANCE_V3_SCHEMA }
  }));
}
