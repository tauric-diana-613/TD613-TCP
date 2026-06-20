import assert from 'node:assert/strict';
import { buildOutgoingContractPacket } from '../app/engine/hush-outgoing-contract-packet.js';
import { buildProviderDispatchEnvelope } from '../app/engine/hush-outgoing-contract-validator.js';
import { buildProviderLogPacket } from '../app/engine/hush-provider-log-packet.js';
import { stableStringify, sha256Text, isSha256 } from '../app/engine/hush-customizer-packet.js';
import { buildContractLogPairPacket, HUSH_CONTRACT_LOG_PAIR_SCHEMA, HUSH_CONTRACT_LOG_PAIR_CLASS } from '../app/engine/hush-contract-log-pair-packet.js';

const contract = await buildOutgoingContractPacket({
  requestKind: 'generation',
  surface: 'provider-bridge',
  sourceEvent: 'manual',
  providerClass: 'local',
  providerName: 'Local Test',
  modelName: 'local-test',
  endpointClass: 'local-runtime',
  mask_context: { mask_source: 'customizer', mask_id: 'pair-mask', mask_release_class: 'operational-local', discourse_mode: 'legal-forensic', retrieval_trigger: 'baseline-voice' },
  customizer_packet_ref: { customizer_packet_id: 'TD613-HUSH-CUSTOMIZER-20260620-ABCDEF12', customizer_packet_hash_sha256: 'sha256:' + 'a'.repeat(64), customizer_release_class: 'operational-local', sample_text_exported: false, sample_count: 24, accepted_words: 2400 },
  systemInstruction: 'Preserve claim limits.',
  developerInstruction: 'Use the requested mode and trigger.',
  userInstruction: 'Draft a bounded answer.',
  redactedPromptSummary: 'Bounded pair packet request.',
  expectedOutputClass: 'draft'
}, { stableId: true, createdAt: '2026-06-20T00:00:00Z' });

const dispatchEnvelope = await buildProviderDispatchEnvelope(contract);
const dispatchEnvelopeWithHash = { ...dispatchEnvelope, dispatch_envelope_hash_sha256: await sha256Text(stableStringify(dispatchEnvelope)) };
const providerLog = await buildProviderLogPacket({
  outgoing_contract_packet: contract,
  dispatch_envelope: dispatchEnvelopeWithHash,
  provider_target_observed: { provider_class: 'local', provider_name: 'Local Test', model_name: 'local-test', endpoint_class: 'local-runtime', api_surface: 'local', network_dispatch_observed: true, provider_request_id: 'req-pair-1', provider_response_id: 'res-pair-1' },
  rawResponseText: 'Redacted response body for hashing only.',
  redactedResponseSummary: 'Provider returned a bounded redacted draft.',
  response_observation: { finish_reason: 'stop', provider_reported_status: 'success' }
}, { stableId: true, createdAt: '2026-06-20T00:01:00Z' });

const pair = await buildContractLogPairPacket({ outgoing_contract_packet: contract, provider_log_packet: providerLog }, { stableId: true, createdAt: '2026-06-20T00:02:00Z' });

assert.equal(pair.schema_version, HUSH_CONTRACT_LOG_PAIR_SCHEMA);
assert.equal(pair.packet_class, HUSH_CONTRACT_LOG_PAIR_CLASS);
assert.ok(pair.pair_packet_id.startsWith('TD613-HUSH-PAIR-20260620-'));
assert.equal(pair.pair_packet_id.includes('TD613-SH-'), false);
assert.equal(pair.linked_contract.contract_packet_id, contract.contract_packet_id);
assert.equal(pair.linked_provider_log.provider_log_packet_id, providerLog.provider_log_packet_id);
assert.equal(pair.contract_snapshot.provider_target.provider_class, 'local');
assert.equal(pair.provider_log_snapshot.provider_target_observed.provider_class, 'local');
assert.equal(pair.provider_target_comparison.status, 'aligned');
assert.equal(pair.dispatch_comparison.status, 'aligned');
assert.equal(pair.payload_comparison.status, 'aligned');
assert.equal(pair.privacy_comparison.status, 'aligned');
assert.equal(pair.refusal_comparison.status, 'no-refusal');
assert.equal(pair.safety_comparison.status, 'no-safety-event');
assert.equal(pair.release_comparison.status, 'ready-for-audit');
assert.equal(pair.eo_rfd_route_comparison.status, 'aligned-interface');
assert.equal(pair.stylometry_audit_routing.status, 'audit-required');
assert.equal(pair.adversarial_audit_routing.status, 'audit-required');
assert.equal(pair.comparison_result.status, 'aligned');
assert.ok(pair.comparison_result.audit_routes.includes('stylometry'));
assert.ok(pair.comparison_result.audit_routes.includes('adversarial'));
assert.equal(pair.claim_limits.not_identity_proof, true);
assert.equal(pair.claim_limits.not_output_quality_proof, true);
assert.equal(pair.claim_limits.comparison_not_final_audit, true);
assert.equal(pair.pair_release_discipline.release_class, 'audit-route-ready');
assert.equal(isSha256(pair.hash_topology.linked_contract_hash_sha256), true);
assert.equal(isSha256(pair.hash_topology.linked_provider_log_hash_sha256), true);
assert.equal(isSha256(pair.hash_topology.contract_snapshot_hash_sha256), true);
assert.equal(isSha256(pair.hash_topology.provider_log_snapshot_hash_sha256), true);
assert.equal(isSha256(pair.hash_topology.comparison_surfaces_hash_sha256), true);
assert.equal(isSha256(pair.hash_topology.comparison_result_hash_sha256), true);
assert.equal(isSha256(pair.hash_topology.policy_hash_sha256), true);
assert.equal(pair.hash_topology.packet_hash_sha256, pair.packet_hash_sha256);
const body = JSON.stringify(pair);
assert.equal(body.includes('Draft a bounded answer.'), false);
assert.equal(body.includes('Redacted response body for hashing only.'), false);

console.log('hush-contract-log-pair-packet: ok');
