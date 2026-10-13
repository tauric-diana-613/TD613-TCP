import assert from 'node:assert/strict';
import { buildOutgoingContractPacket } from '../app/engine/hush-outgoing-contract-packet.js';
import { buildProviderDispatchEnvelope } from '../app/engine/hush-outgoing-contract-validator.js';
import { buildProviderLogPacket } from '../app/engine/hush-provider-log-packet.js';
import { buildContractLogPairPacket } from '../app/engine/hush-contract-log-pair-packet.js';
import { stableStringify, sha256Text, isSha256 } from '../app/engine/hush-customizer-packet.js';
import { buildStylometryAuditPacket, HUSH_STYLOMETRY_AUDIT_SCHEMA, HUSH_STYLOMETRY_AUDIT_CLASS } from '../app/engine/hush-stylometry-audit-packet.js';

const contract = await buildOutgoingContractPacket({
  requestKind: 'generation',
  surface: 'provider-bridge',
  sourceEvent: 'manual',
  providerClass: 'local',
  providerName: 'Local Test',
  modelName: 'local-test',
  endpointClass: 'local-runtime',
  mask_context: { mask_source: 'customizer', mask_id: 'stylo-mask', mask_release_class: 'operational-local', discourse_mode: 'legal-forensic', retrieval_trigger: 'baseline-voice' },
  customizer_packet_ref: { customizer_packet_id: 'TD613-HUSH-CUSTOMIZER-20260620-ABCDEF12', customizer_packet_hash_sha256: 'sha256:' + 'a'.repeat(64), customizer_release_class: 'operational-local', sample_text_exported: false, sample_count: 24, accepted_words: 2400 },
  systemInstruction: 'Preserve claim limits.',
  developerInstruction: 'Use the requested mode and trigger.',
  userInstruction: 'Draft a bounded answer.',
  redactedPromptSummary: 'Bounded stylometry audit request.',
  expectedOutputClass: 'draft'
}, { stableId: true, createdAt: '2026-06-20T00:00:00Z' });

const dispatchEnvelope = await buildProviderDispatchEnvelope(contract);
const dispatchEnvelopeWithHash = { ...dispatchEnvelope, dispatch_envelope_hash_sha256: await sha256Text(stableStringify(dispatchEnvelope)) };
const providerLog = await buildProviderLogPacket({
  outgoing_contract_packet: contract,
  dispatch_envelope: dispatchEnvelopeWithHash,
  provider_target_observed: { provider_class: 'local', provider_name: 'Local Test', model_name: 'local-test', endpoint_class: 'local-runtime', api_surface: 'local', network_dispatch_observed: true, provider_request_id: 'req-stylo-1', provider_response_id: 'res-stylo-1' },
  rawResponseText: 'Redacted response body for hashing only.',
  redactedResponseSummary: 'Provider returned a bounded redacted draft.',
  response_observation: { finish_reason: 'stop', provider_reported_status: 'success' }
}, { stableId: true, createdAt: '2026-06-20T00:01:00Z' });
const pair = await buildContractLogPairPacket({ outgoing_contract_packet: contract, provider_log_packet: providerLog }, { stableId: true, createdAt: '2026-06-20T00:02:00Z' });

const baseInput = {
  contract_log_pair_packet: pair,
  stylometry_profile: {
    stylometry_profile_id: 'TD613-HUSH-STYLO-PROFILE-20260620-ABCDEF12',
    profile_hash_sha256: 'sha256:' + 'b'.repeat(64),
    profile_source: 'customizer',
    sample_release_class: 'redacted',
    metric_set_version: 'hush-stylometry-core/v1'
  },
  audit_input_profile: {
    audit_mode: 'feature-vector',
    response_feature_vector_hash_sha256: 'sha256:' + 'c'.repeat(64)
  },
  cadence_alignment: { overall_alignment_score: 0.82, confidence: 'medium' },
  pressure_preservation: { pressure_preservation_score: 0.76 },
  flattening_detection: { flattening_score: 0.1 },
  risk_profile: { unsafe_identifiability_risk: 'low', overfit_risk: 'low', private_cadence_exposure_risk: 'low', public_release_allowed: false, operator_review_required: true }
};

const audit = await buildStylometryAuditPacket(baseInput, { stableId: true, createdAt: '2026-06-20T00:03:00Z' });

assert.equal(audit.schema_version, HUSH_STYLOMETRY_AUDIT_SCHEMA);
assert.equal(audit.packet_class, HUSH_STYLOMETRY_AUDIT_CLASS);
assert.ok(audit.stylometry_audit_packet_id.startsWith('TD613-HUSH-STYLO-20260620-'));
assert.equal(audit.stylometry_audit_packet_id.includes('TD613-SH-'), false);
assert.equal(audit.linked_pair.pair_packet_id, pair.pair_packet_id);
assert.equal(audit.linked_pair.pair_packet_hash_sha256, pair.packet_hash_sha256);
assert.equal(audit.linked_customizer_profile.profile_hash_sha256, 'sha256:' + 'b'.repeat(64));
assert.equal(audit.audit_input_profile.audit_mode, 'feature-vector');
assert.equal(audit.audit_input_profile.raw_text_stored_in_packet, false);
assert.equal(audit.metric_profile.metric_set_version, 'hush-stylometry-core/v1');
assert.ok(audit.metric_profile.metric_families.includes('rhetorical-pressure'));
assert.equal(audit.cadence_alignment.alignment_band, 'aligned');
assert.equal(audit.pressure_preservation.pressure_band, 'preserved');
assert.equal(audit.flattening_detection.flattening_band, 'none');
assert.equal(audit.constraint_preservation.schema_version, 'td613.hush.constraint-preservation/v1');
assert.equal(audit.risk_profile.unsafe_identifiability_risk, 'low');
assert.equal(audit.release_recommendation.release_class, 'release-safe');
assert.equal(audit.release_recommendation.next_action, 'accept');
assert.equal(audit.claim_limits.not_identity_proof, true);
assert.equal(audit.claim_limits.stylometry_is_probabilistic, true);
assert.equal(isSha256(audit.hash_topology.linked_pair_hash_sha256), true);
assert.equal(isSha256(audit.hash_topology.linked_profile_hash_sha256), true);
assert.equal(isSha256(audit.hash_topology.audit_input_profile_hash_sha256), true);
assert.equal(isSha256(audit.hash_topology.metric_profile_hash_sha256), true);
assert.equal(isSha256(audit.hash_topology.cadence_alignment_hash_sha256), true);
assert.equal(isSha256(audit.hash_topology.risk_profile_hash_sha256), true);
assert.equal(audit.hash_topology.packet_hash_sha256, audit.packet_hash_sha256);
const body = JSON.stringify(audit);
assert.equal(body.includes('Draft a bounded answer.'), false);
assert.equal(body.includes('Redacted response body for hashing only.'), false);

const localPrivateRaw = await buildStylometryAuditPacket({
  ...baseInput,
  audit_input_profile: { audit_mode: 'local-private-raw', response_feature_vector_hash_sha256: 'sha256:' + 'c'.repeat(64) },
  release_recommendation: { release_class: 'release-safe' }
}, { stableId: true, createdAt: '2026-06-20T00:04:00Z' });
assert.equal(localPrivateRaw.release_recommendation.public_release_allowed, false);
assert.equal(localPrivateRaw.release_recommendation.next_action, 'run-adversarial-audit');

const blockRelease = await buildStylometryAuditPacket({ ...baseInput, release_recommendation: { release_class: 'block-release' } }, { stableId: true, createdAt: '2026-06-20T00:05:00Z' });
assert.equal(blockRelease.release_recommendation.next_action, 'block');

const reviseBeforeRelease = await buildStylometryAuditPacket({ ...baseInput, release_recommendation: { release_class: 'revise-before-release' } }, { stableId: true, createdAt: '2026-06-20T00:06:00Z' });
assert.equal(reviseBeforeRelease.release_recommendation.next_action, 'revise');

const responseHashOnly = await buildStylometryAuditPacket({ ...baseInput, audit_input_profile: { audit_mode: 'response-hash-only', response_feature_vector_hash_sha256: 'sha256:' + 'c'.repeat(64) } }, { stableId: true, createdAt: '2026-06-20T00:07:00Z' });
assert.equal(responseHashOnly.release_recommendation.next_action, 'collect-more-evidence');

console.log('hush-stylometry-audit-packet: ok');
