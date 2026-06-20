import assert from 'node:assert/strict';
import { buildOutgoingContractPacket } from '../app/engine/hush-outgoing-contract-packet.js';
import { buildProviderDispatchEnvelope } from '../app/engine/hush-outgoing-contract-validator.js';
import { buildProviderLogPacket } from '../app/engine/hush-provider-log-packet.js';
import { buildContractLogPairPacket } from '../app/engine/hush-contract-log-pair-packet.js';
import { stableStringify, sha256Text } from '../app/engine/hush-customizer-packet.js';
import { buildStylometryAuditPacket } from '../app/engine/hush-stylometry-audit-packet.js';
import { validateStylometryAudit } from '../app/engine/hush-stylometry-audit-validator.js';

function clone(value) { return JSON.parse(JSON.stringify(value)); }
async function expectBlocked(basePacket, mutator, reasonFragment = null) {
  const candidate = clone(basePacket);
  mutator(candidate);
  const result = await validateStylometryAudit(candidate);
  assert.equal(result.status, 'blocked');
  if (reasonFragment) assert.ok(result.refusal_reasons.some((reason) => reason.includes(reasonFragment)), `${reasonFragment} not found in ${JSON.stringify(result.refusal_reasons)}`);
  return result;
}

const contract = await buildOutgoingContractPacket({
  requestKind: 'generation',
  surface: 'provider-bridge',
  sourceEvent: 'manual',
  providerClass: 'local',
  providerName: 'Local Test',
  modelName: 'local-test',
  endpointClass: 'local-runtime',
  mask_context: { mask_source: 'customizer', mask_id: 'stylo-validator-mask', mask_release_class: 'operational-local', discourse_mode: 'legal-forensic', retrieval_trigger: 'baseline-voice' },
  customizer_packet_ref: { customizer_packet_id: 'TD613-HUSH-CUSTOMIZER-20260620-ABCDEF12', customizer_packet_hash_sha256: 'sha256:' + 'a'.repeat(64), customizer_release_class: 'operational-local', sample_text_exported: false, sample_count: 24, accepted_words: 2400 },
  systemInstruction: 'Preserve claim limits.',
  developerInstruction: 'Use the requested mode and trigger.',
  userInstruction: 'Draft a bounded answer.',
  redactedPromptSummary: 'Bounded stylometry validator request.',
  expectedOutputClass: 'draft'
}, { stableId: true, createdAt: '2026-06-20T00:00:00Z' });
const dispatchEnvelope = await buildProviderDispatchEnvelope(contract);
const dispatchEnvelopeWithHash = { ...dispatchEnvelope, dispatch_envelope_hash_sha256: await sha256Text(stableStringify(dispatchEnvelope)) };
const providerLog = await buildProviderLogPacket({
  outgoing_contract_packet: contract,
  dispatch_envelope: dispatchEnvelopeWithHash,
  provider_target_observed: { provider_class: 'local', provider_name: 'Local Test', model_name: 'local-test', endpoint_class: 'local-runtime', api_surface: 'local', network_dispatch_observed: true, provider_request_id: 'req-stylo-v', provider_response_id: 'res-stylo-v' },
  rawResponseText: 'Redacted response body for hashing only.',
  redactedResponseSummary: 'Provider returned a bounded redacted draft.',
  response_observation: { finish_reason: 'stop', provider_reported_status: 'success' }
}, { stableId: true, createdAt: '2026-06-20T00:01:00Z' });
const pair = await buildContractLogPairPacket({ outgoing_contract_packet: contract, provider_log_packet: providerLog }, { stableId: true, createdAt: '2026-06-20T00:02:00Z' });
const audit = await buildStylometryAuditPacket({
  contract_log_pair_packet: pair,
  stylometry_profile: { stylometry_profile_id: 'TD613-HUSH-STYLO-PROFILE-20260620-ABCDEF12', profile_hash_sha256: 'sha256:' + 'b'.repeat(64), profile_source: 'customizer', sample_release_class: 'redacted' },
  audit_input_profile: { audit_mode: 'feature-vector', response_feature_vector_hash_sha256: 'sha256:' + 'c'.repeat(64) },
  cadence_alignment: { overall_alignment_score: 0.82, confidence: 'medium' },
  pressure_preservation: { pressure_preservation_score: 0.76 },
  flattening_detection: { flattening_score: 0.1 },
  risk_profile: { unsafe_identifiability_risk: 'low', overfit_risk: 'low', private_cadence_exposure_risk: 'low', public_release_allowed: false, operator_review_required: true }
}, { stableId: true, createdAt: '2026-06-20T00:03:00Z' });

const validation = await validateStylometryAudit(audit);
assert.equal(validation.status, 'pass');
assert.equal(validation.validator_mode, 'shape-plus-replay');
assert.equal(validation.hash_replay.status, 'pass');
assert.ok(validation.authority_families.includes('stylometry-audit-v1'));
assert.ok(validation.authority_families.includes('linked-pair-bearing'));

await expectBlocked(audit, (p) => { p.stylometry_audit_packet_id = 'BAD-STYLO-ID'; }, 'stylometry_audit_packet_id must match');
await expectBlocked(audit, (p) => { p.stylometry_audit_packet_id = 'TD613-SH-9B07D8B-ABCDEF12'; }, 'stylometry_audit_packet_id must not use SHI');
await expectBlocked(audit, (p) => { delete p.linked_pair; }, 'linked_pair is required');
await expectBlocked(audit, (p) => { p.linked_pair.pair_packet_id = 'BAD-PAIR-ID'; }, 'linked_pair.pair_packet_id is malformed');
await expectBlocked(audit, (p) => { delete p.linked_customizer_profile.profile_hash_sha256; }, 'linked_customizer_profile.profile_hash_sha256');
await expectBlocked(audit, (p) => { delete p.metric_profile; }, 'metric_profile is required');
await expectBlocked(audit, (p) => { delete p.cadence_alignment; }, 'cadence_alignment is required');
await expectBlocked(audit, (p) => { delete p.risk_profile; }, 'risk_profile is required');
await expectBlocked(audit, (p) => { p.packet_hash_sha256 = 'sha256:notreal'; }, 'packet_hash_sha256');

const hashOnly = { schema_version: 'td613.hush.stylometry-audit/v1', packet_class: 'cadence-alignment-audit', stylometry_audit_packet_id: 'TD613-HUSH-STYLO-20260620-ABCDEF12', packet_hash_sha256: 'sha256:' + 'd'.repeat(64) };
assert.equal((await validateStylometryAudit(hashOnly)).status, 'blocked');

await expectBlocked(audit, (p) => { p.cadence_alignment.overall_alignment_score = 0.11; }, 'cadence alignment hash mismatch');
await expectBlocked(audit, (p) => { p.risk_profile.unsafe_identifiability_risk = 'high'; }, 'risk profile hash mismatch');
await expectBlocked(audit, (p) => { p.audit_input_profile.raw_text = 'secret raw response'; }, 'raw text');
await expectBlocked(audit, (p) => { p.cadence_alignment.interpretation = 'identity proof confirmed'; }, 'cannot claim identity');
await expectBlocked(audit, (p) => { p.pressure_preservation.notes = ['authorship proven']; }, 'cannot claim identity');
await expectBlocked(audit, (p) => { p.release_recommendation.reasons = ['output quality proof']; }, 'cannot claim identity');
await expectBlocked(audit, (p) => { p.risk_profile.unsafe_identifiability_risk = 'high'; p.release_recommendation.public_release_allowed = true; }, 'public release cannot be allowed with high identifiability risk');
await expectBlocked(audit, (p) => { p.risk_profile.overfit_risk = 'high'; p.release_recommendation.public_release_allowed = true; }, 'public release cannot be allowed with high overfit risk');
await expectBlocked(audit, (p) => { p.hash_topology.packet_hash_sha256 = 'sha256:' + 'e'.repeat(64); }, 'topology packet hash replay mismatch');
await expectBlocked(audit, (p) => { p.hash_topology.packet_hash_sha256 = 'sha256:' + 'e'.repeat(64); }, 'packet hash locations disagree');

console.log('hush-stylometry-audit-validator: ok');
