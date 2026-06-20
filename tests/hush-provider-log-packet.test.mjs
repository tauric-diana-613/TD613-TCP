import assert from 'node:assert/strict';
import { buildOutgoingContractPacket } from '../app/engine/hush-outgoing-contract-packet.js';
import { buildProviderDispatchEnvelope } from '../app/engine/hush-outgoing-contract-validator.js';
import { stableStringify, sha256Text } from '../app/engine/hush-customizer-packet.js';
import {
  HUSH_PROVIDER_LOG_SCHEMA,
  HUSH_PROVIDER_LOG_VERSION,
  HUSH_PROVIDER_LOG_CLASS,
  HUSH_PROVIDER_LOG_CLAIM_LIMITS,
  isProviderLogPacketId,
  buildProviderLogPacket
} from '../app/engine/hush-provider-log-packet.js';

const contract = await buildOutgoingContractPacket({
  requestKind: 'generation',
  surface: 'provider-bridge',
  sourceEvent: 'manual',
  providerClass: 'openai',
  providerName: 'OpenAI',
  modelName: 'gpt-test',
  endpointClass: 'responses',
  mask_context: {
    mask_source: 'customizer',
    mask_id: 'provider-log-mask',
    mask_release_class: 'operational-local',
    discourse_mode: 'legal-forensic',
    retrieval_trigger: 'baseline-voice'
  },
  customizer_packet_ref: {
    customizer_packet_id: 'TD613-HUSH-CUSTOMIZER-20260620-ABCDEF12',
    customizer_packet_hash_sha256: 'sha256:' + 'a'.repeat(64),
    customizer_release_class: 'operational-local',
    sample_text_exported: false,
    sample_count: 24,
    accepted_words: 2400
  },
  systemInstruction: 'Preserve claim limits and refuse disallowed claims.',
  developerInstruction: 'Use the requested discourse mode and retrieval trigger.',
  userInstruction: 'Draft a bounded answer from the mask without exposing private samples.',
  redactedPromptSummary: 'Bounded provider-log test request.',
  expectedOutputClass: 'draft'
}, { stableId: true, createdAt: '2026-06-20T00:00:00Z' });

const dispatchEnvelope = await buildProviderDispatchEnvelope(contract);
dispatchEnvelope.dispatch_envelope_hash_sha256 = await sha256Text(stableStringify(dispatchEnvelope));

const packet = await buildProviderLogPacket({
  outgoing_contract_packet: contract,
  dispatch_envelope: dispatchEnvelope,
  provider_target_observed: {
    provider_class: 'gemini',
    provider_name: 'Google Gemini',
    model_name: 'gemini-flash-lite-latest',
    endpoint_class: 'responses',
    api_surface: 'fetch',
    network_dispatch_observed: true,
    provider_request_id: 'req-test-1',
    provider_response_id: 'res-test-1'
  },
  rawResponseText: 'A redacted provider response body for hash purposes only.',
  redactedResponseSummary: 'Provider returned a bounded redacted draft.',
  response_observation: { finish_reason: 'stop', provider_reported_status: 'success' },
  latency_profile: { dispatch_duration_ms: 1200, client_observed_latency_ms: 1200 },
  token_profile: { input_tokens: 100, output_tokens: 80, total_tokens: 180, provider_reported: true },
  stylometry_observation_seed: { candidate_drift_flags: ['generic-polish'] }
}, { stableId: true, createdAt: '2026-06-20T00:01:00Z' });

assert.equal(packet.schema_version, HUSH_PROVIDER_LOG_SCHEMA);
assert.equal(packet.packet_version, HUSH_PROVIDER_LOG_VERSION);
assert.equal(packet.packet_class, HUSH_PROVIDER_LOG_CLASS);
assert.equal(isProviderLogPacketId(packet.provider_log_packet_id), true);
assert.equal(packet.linked_contract.contract_packet_id, contract.contract_packet_id);
assert.equal(packet.linked_contract.contract_packet_hash_sha256, contract.packet_hash_sha256);
assert.equal(packet.provider_target_observed.provider_class, 'gemini');
assert.equal(packet.dispatch_observation.dispatch_status, 'sent');
assert.equal(packet.request_payload_observation.raw_prompt_sent, false);
assert.equal(packet.response_observation.raw_response_exported, false);
assert.equal(packet.redaction_profile.redaction_method, 'hash-and-summary');
assert.equal(packet.claim_limits.not_provider_compliance_proof, true);
assert.deepEqual(packet.claim_limits, HUSH_PROVIDER_LOG_CLAIM_LIMITS);
assert.ok(packet.hash_topology.linked_contract_hash_sha256.startsWith('sha256:'));
assert.ok(packet.hash_topology.provider_target_observed_hash_sha256.startsWith('sha256:'));
assert.ok(packet.hash_topology.dispatch_observation_hash_sha256.startsWith('sha256:'));
assert.ok(packet.hash_topology.request_payload_observation_hash_sha256.startsWith('sha256:'));
assert.ok(packet.hash_topology.response_observation_hash_sha256.startsWith('sha256:'));
assert.ok(packet.hash_topology.redaction_profile_hash_sha256.startsWith('sha256:'));
assert.ok(packet.hash_topology.policy_hash_sha256.startsWith('sha256:'));
assert.equal(packet.hash_topology.packet_hash_sha256, packet.packet_hash_sha256);

console.log('hush-provider-log-packet: ok');
