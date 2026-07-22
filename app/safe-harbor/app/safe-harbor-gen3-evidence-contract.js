import { stableCanonicalJson } from './safe-harbor-stylometry-v3.js';

export const GEN3_STAGE1_VERSION = 'td613.safe-harbor.gen3-stage1/v1';
export const AUTHORSHIP_EVIDENCE_SCHEMA = 'td613.safe-harbor.authorship-evidence/v1';
export const ENTRANT_BINDING_SCHEMA = 'td613.safe-harbor.entrant-authorship-binding/v1';
export const ELICITATION_CONTEXT_SCHEMA = 'td613.safe-harbor.elicitation-context/v1';
export const SAMPLING_SUFFICIENCY_POLICY = 'td613.safe-harbor.sampling-sufficiency/v1';
export const HISTORICAL_EXAMPLE = 'TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] · payload 5 · 2025-10-17 · ⟐';
export const SYNTHETIC_SHI = 'TD613-SH-9B07D8B-A1B2C3D4';
export const SHI_PATTERN = /^TD613-SH-9B07D8B-[0-9A-F]{8}$/u;

const LANES = Object.freeze(['future_self', 'past_self', 'higher_self']);
const CHECKPOINT_TARGETS = Object.freeze([120, 240, 360]);
const SIGNED_SCOPE = Object.freeze([
  'shi_number',
  'packet_hash_sha256',
  'stylometric_fingerprint',
  'stability_digest',
  'blind_challenge_precommitment_digest',
  'blind_challenge_result_digest',
  'restoration_receipt_digest',
  'authorship_and_custody_assertion'
]);

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function isObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function words(text) {
  return String(text || '').trim().split(/\s+/u).filter(Boolean);
}

function sufficiencyState(count) {
  if (count < 120) return 'insufficient';
  if (count < 240) return 'provisional';
  if (count < 360) return 'comparative';
  return 'stability-eligible';
}

async function sha256Hex(input) {
  const source = String(input || '');
  if (globalThis.crypto?.subtle && globalThis.TextEncoder) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(source));
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  const crypto = await import('node:crypto');
  return crypto.createHash('sha256').update(source).digest('hex');
}

async function sha256Tagged(value) {
  const source = typeof value === 'string' ? value : stableCanonicalJson(value);
  return `sha256:${await sha256Hex(source)}`;
}

function publicPacketHold(packet, blocker, detail) {
  const out = packet;
  out.bridge = isObject(out.bridge) ? out.bridge : {};
  out.bridge.export_gate = isObject(out.bridge.export_gate) ? out.bridge.export_gate : {};
  const blockers = Array.isArray(out.bridge.export_gate.blockers) ? out.bridge.export_gate.blockers.slice() : [];
  if (!blockers.includes(blocker)) blockers.push(blocker);
  out.bridge.export_gate.ready = false;
  out.bridge.export_gate.state = 'hold';
  out.bridge.export_gate.blockers = blockers;
  out.gen3_evidence_contract = isObject(out.gen3_evidence_contract) ? out.gen3_evidence_contract : {};
  out.gen3_evidence_contract.export_hold = { blocker, detail };
  return out;
}

export function buildSamplingSufficiency(segments = {}) {
  const lanes = {};
  for (const lane of LANES) {
    const observed = words(segments[lane]).length;
    lanes[lane] = {
      observed_words: observed,
      checkpoint_coverage: CHECKPOINT_TARGETS.map((target) => observed >= target),
      state: sufficiencyState(observed)
    };
  }
  const states = LANES.map((lane) => lanes[lane].state);
  const triadState = states.every((state) => state === 'stability-eligible')
    ? 'stability-eligible'
    : states.some((state) => state === 'insufficient')
      ? 'insufficient'
      : states.some((state) => state === 'provisional')
        ? 'provisional'
        : 'comparative';
  return {
    policy_version: SAMPLING_SUFFICIENCY_POLICY,
    target_words_per_lane: 360,
    checkpoint_targets: CHECKPOINT_TARGETS.slice(),
    counts_hidden_in_public_ui: true,
    lanes,
    triad_state: triadState
  };
}

export function buildElicitationContext(context = {}) {
  return {
    schema_version: ELICITATION_CONTEXT_SCHEMA,
    prompt_set_version: context.promptSetVersion || 'temporal-triad/v2',
    ui_version: context.uiVersion || 'pre-temporal-bloom',
    lane_order: LANES.slice(),
    checkpoint_targets: CHECKPOINT_TARGETS.slice(),
    public_counts_visible: false,
    keystroke_telemetry_collected: false,
    pause_timing_collected: false,
    revision_history_exported: false,
    raw_text_exported: false,
    prompt_text_digests: clone(context.promptTextDigests || {}),
    accessibility_mode: {
      reduced_motion: Boolean(context.reducedMotion)
    }
  };
}

export function buildTemporalLineage(packet = {}) {
  return {
    root_binding_authority: {
      recorded_ts_utc: '2025-08-11T03:58:39Z',
      authority_class: 'heritage-covenant-namespace-binding'
    },
    badge_protocol_history: {
      recorded_date: '2025-10-17',
      authority_class: 'first-preserved-operational-badge-specimen',
      historical_example_ref: 'historical_example',
      historical_example: HISTORICAL_EXAMPLE
    },
    entrant_credential_authority: {
      recorded_ts_utc: packet?.intake?.ts_utc || packet?.created_at || null,
      authority_class: 'packet-specific-stylometric-intake'
    },
    entrant_countersignature_authority: {
      recorded_ts_utc: null,
      authority_class: 'packet-scoped-authorship-and-custody-assertion'
    }
  };
}

export function buildAuthorshipEvidenceContract(packet = {}, context = {}) {
  const existing = isObject(packet.authorship_evidence) ? clone(packet.authorship_evidence) : {};
  return {
    schema_version: AUTHORSHIP_EVIDENCE_SCHEMA,
    sampling_sufficiency: existing.sampling_sufficiency || buildSamplingSufficiency(context.segments || {}),
    checkpoint_snapshots: existing.checkpoint_snapshots || {},
    within_lane_invariants: existing.within_lane_invariants || {},
    cross_lane_invariants: existing.cross_lane_invariants || {},
    prompt_conditioned_features: existing.prompt_conditioned_features || {},
    elicitation_context: existing.elicitation_context || buildElicitationContext(context),
    stability_receipt: existing.stability_receipt || {
      schema_version: 'td613.safe-harbor.stability-receipt/v1',
      status: 'pending-stage2-measurement',
      stability_digest: null,
      raw_text_included: false,
      identity_probability: null
    },
    blind_custody_challenge: existing.blind_custody_challenge || null,
    perturbation_invariance: existing.perturbation_invariance || null,
    evidence_contract: {
      schema_version: GEN3_STAGE1_VERSION,
      packet_validity_separate_from_sample_sufficiency: true,
      sample_sufficiency_separate_from_evidence_maturity: true,
      identity_or_ownership_adjudication: false,
      raw_text_included: false,
      historical_example: HISTORICAL_EXAMPLE,
      claim_ceiling: 'Packet-internal stylometric recurrence and custody evidence only; not civil identity, exclusive ownership, third-party text attribution, or universal authorship proof.'
    }
  };
}

export function applyGen3Stage1Prehash(packet, context = {}) {
  if (!isObject(packet) || packet.schema_version !== 'td613.safe-harbor.packet/v1') return packet;
  const out = clone(packet);
  const shi = out?.issuance?.badge_number || null;
  out.canon = isObject(out.canon) ? out.canon : {};
  if (shi) out.canon.shi_number = shi;
  out.authorship_evidence = buildAuthorshipEvidenceContract(out, context);
  out.temporal_lineage = buildTemporalLineage(out);
  out.gen3_evidence_contract = {
    schema_version: GEN3_STAGE1_VERSION,
    stage: 'stage1-prehash',
    authorship_evidence_hash_covered: true,
    forensic_authorship_hash_covered: false,
    entrant_binding_overlay_hash_covered: false,
    native_hash_drift_policy: 'no silent SH3 fingerprint migration',
    historical_example: HISTORICAL_EXAMPLE
  };
  return out;
}

export function buildEntrantAuthorshipBinding(packet = {}) {
  const shi = packet?.issuance?.badge_number || null;
  return {
    schema_version: ENTRANT_BINDING_SCHEMA,
    namespace_anchor: {
      principal: 'tauric.diana.613',
      claimed_pua: 'U+10D613',
      utf16_surrogate_pair: '\\uDBF5\\uDE13',
      binding_fragment: '#9B07D8B',
      sac: 'SAC[X6ZNK5NO51]'
    },
    entrant_credential: {
      shi_number: shi,
      packet_hash_sha256: packet.packet_hash_sha256 || null,
      stylometric_fingerprint: packet?.issuance?.stylometric_fingerprint || null,
      stability_digest: packet?.authorship_evidence?.stability_receipt?.stability_digest || null,
      blind_challenge_precommitment_digest: packet?.authorship_evidence?.blind_custody_challenge?.precommitment?.precommitment_digest || null,
      blind_challenge_result_digest: packet?.authorship_evidence?.blind_custody_challenge?.result_digest || null,
      restoration_receipt_digest: packet?.authorship_evidence?.perturbation_invariance?.restoration_receipt?.restoration_receipt_digest || null
    },
    custody_assertion: {
      claimant_role: 'entrant',
      claim: 'custody of the packet-derived stylometric evidence and authorship assertion attached to the declared sealed source material',
      state: 'pending-countersignature'
    },
    countersignature: {
      status: 'unsigned',
      signed_at_utc: null,
      signature_type: null,
      signature_digest: null,
      signed_scope: SIGNED_SCOPE.slice()
    },
    claim_ceiling: {
      attests: [
        'entrant assertion of authorship over the declared sealed source material',
        'entrant custody of packet-derived stylometric evidence',
        'relationship between SHI and the sealed packet',
        'presentation under the TD613 U+10D613 provenance namespace'
      ],
      does_not_independently_prove: [
        'civil or legal identity',
        'legal ownership against all third parties',
        'authorship of unsealed external texts',
        'absence of coercion',
        'trusted time beyond the signature and timestamp authority used'
      ]
    }
  };
}

export function validateGen3ShiExactMatch(packet, surfaces = {}) {
  if (!isObject(packet)) return { status: 'hold', reason: 'packet-missing', values: [] };
  const values = [
    packet?.issuance?.badge_number,
    packet?.canon?.shi_number,
    packet?.binding_provenance?.entrant_authorship_binding?.entrant_credential?.shi_number
  ];
  if (Object.prototype.hasOwnProperty.call(surfaces, 'domShi')) values.push(surfaces.domShi);
  if (Object.prototype.hasOwnProperty.call(surfaces, 'svgShi')) values.push(surfaces.svgShi);
  const normalized = values.map((value) => typeof value === 'string' ? value : null);
  if (normalized.some((value) => !value)) return { status: 'hold', reason: 'missing-shi', values: normalized };
  if (normalized.some((value) => !SHI_PATTERN.test(value))) return { status: 'hold', reason: 'invalid-shi-format', values: normalized };
  if (!normalized.every((value) => value === normalized[0])) return { status: 'hold', reason: 'shi-mismatch', values: normalized };
  return { status: 'pass', reason: null, shi_number: normalized[0], values: normalized };
}

export function finalizeGen3Stage1Overlay(packet, surfaces = {}) {
  if (!isObject(packet) || packet.schema_version !== 'td613.safe-harbor.packet/v1') return packet;
  const out = clone(packet);
  out.binding_provenance = isObject(out.binding_provenance) ? out.binding_provenance : {};
  out.binding_provenance.entrant_authorship_binding = buildEntrantAuthorshipBinding(out);
  const exact = validateGen3ShiExactMatch(out, surfaces);
  out.gen3_evidence_contract = isObject(out.gen3_evidence_contract) ? out.gen3_evidence_contract : {};
  out.gen3_evidence_contract.stage = 'stage1-finalized';
  out.gen3_evidence_contract.shi_exact_match = exact;
  if (exact.status !== 'pass') return publicPacketHold(out, 'gen3-shi-exact-match', exact.reason);
  return out;
}

export async function countersignEntrantAuthorshipBinding(packet, signature = {}) {
  const out = finalizeGen3Stage1Overlay(packet);
  const exact = validateGen3ShiExactMatch(out);
  if (exact.status !== 'pass') return publicPacketHold(out, 'gen3-countersignature-shi-hold', exact.reason);
  const binding = out.binding_provenance.entrant_authorship_binding;
  const signedMaterial = {
    schema_version: binding.schema_version,
    signed_scope: SIGNED_SCOPE.slice(),
    entrant_credential: clone(binding.entrant_credential),
    authorship_and_custody_assertion: clone(binding.custody_assertion),
    signature_type: signature.signatureType || 'entrant-declared-local-digest',
    signed_at_utc: signature.signedAtUtc || new Date().toISOString()
  };
  binding.countersignature = {
    status: 'countersigned',
    signed_at_utc: signedMaterial.signed_at_utc,
    signature_type: signedMaterial.signature_type,
    signature_digest: await sha256Tagged(signedMaterial),
    signed_scope: SIGNED_SCOPE.slice()
  };
  binding.custody_assertion.state = 'countersigned';
  out.temporal_lineage.entrant_countersignature_authority.recorded_ts_utc = signedMaterial.signed_at_utc;
  return out;
}

export function evidenceContractContainsRawText(packet) {
  const evidence = packet?.authorship_evidence;
  if (!isObject(evidence)) return false;
  const serialized = stableCanonicalJson(evidence);
  return /"(?:raw_text|source_text|entrant_text|window_text)"\s*:/u.test(serialized);
}

export function signedScope() {
  return SIGNED_SCOPE.slice();
}
