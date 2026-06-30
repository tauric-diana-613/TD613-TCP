import assert from 'node:assert/strict';
import { buildOutgoingContractPacket, HUSH_OUTGOING_CONTRACT_SCHEMA, HUSH_OUTGOING_CONTRACT_CLASS } from '../app/engine/hush-outgoing-contract-packet.js';
import { isSha256 } from '../app/engine/hush-customizer-packet.js';

const packet = await buildOutgoingContractPacket({
  requestKind: 'generation',
  surface: 'provider-bridge',
  sourceEvent: 'manual',
  providerClass: 'openai',
  providerName: 'OpenAI',
  modelName: 'gpt-test',
  endpointClass: 'responses',
  mask_context: {
    mask_source: 'customizer',
    mask_id: 'custom-test-mask',
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
  systemInstruction: 'Preserve claim limits and refuse identity proof claims.',
  developerInstruction: 'Use the requested discourse mode and retrieval trigger.',
  userInstruction: 'Draft a bounded answer from the mask without exposing private samples.',
  redactedPromptSummary: 'Bounded generation request using redacted Hush mask context.',
  expectedOutputClass: 'draft'
}, { stableId: true, createdAt: '2026-06-20T00:00:00Z' });

assert.equal(packet.schema_version, HUSH_OUTGOING_CONTRACT_SCHEMA);
assert.equal(packet.packet_class, HUSH_OUTGOING_CONTRACT_CLASS);
assert.ok(packet.contract_packet_id.startsWith('TD613-HUSH-CONTRACT-20260620-'));
assert.equal(packet.contract_packet_id.includes('TD613-SH-'), false);
assert.equal(packet.provider_target.provider_class, 'openai');
assert.equal(packet.provider_target.endpoint_class, 'responses');
assert.equal(packet.mask_context.mask_id, 'custom-test-mask');
assert.equal(packet.mask_context.discourse_mode, 'legal-forensic');
assert.equal(packet.mask_context.retrieval_trigger, 'baseline-voice');
assert.equal(packet.customizer_packet_ref.sample_text_exported, false);
assert.equal(packet.instruction_contract.raw_prompt_exported, false);
assert.equal(isSha256(packet.instruction_contract.system_instruction_hash_sha256), true);
assert.equal(isSha256(packet.instruction_contract.developer_instruction_hash_sha256), true);
assert.equal(isSha256(packet.instruction_contract.user_instruction_hash_sha256), true);
assert.equal(isSha256(packet.instruction_contract.assembled_prompt_hash_sha256), true);
assert.equal(packet.private_text_policy.raw_customizer_samples_exported, false);
assert.ok(packet.refusal_policy.must_refuse_if.includes('asks-for-identity-proof'));
assert.equal(packet.claim_limits.not_identity_proof, true);
assert.equal(packet.claim_limits.provider_compliance_not_yet_proven, true);
assert.equal(packet.eo_rfd_route_state.firmware_status, 'interface-only');
assert.equal(packet.eo_rfd_route_state.aperture_context.aperture_version, 'v2.9.4');
assert.equal(packet.eo_rfd_route_state.aperture_context.aperture_schema, 'td613-aperture/v2.9.4');
assert.equal(packet.eo_rfd_route_state.aperture_context.aperture_feature_version, 'v2.9.4-sigma-dynamical-instrument');
assert.equal(packet.eo_rfd_route_state.aperture_context.authority, 'design-signal');
assert.equal(packet.eo_rfd_route_state.operational_state, 'interface_context');
assert.equal(packet.eo_rfd_route_state.claim_authority, 'design_signal');
assert.equal(packet.eo_rfd_route_state.dome_world_context.raw_exact_coordinates_allowed, false);
assert.equal(isSha256(packet.hash_topology.request_context_hash_sha256), true);
assert.equal(isSha256(packet.hash_topology.provider_target_hash_sha256), true);
assert.equal(isSha256(packet.hash_topology.mask_context_hash_sha256), true);
assert.equal(isSha256(packet.hash_topology.instruction_contract_hash_sha256), true);
assert.equal(isSha256(packet.hash_topology.policy_hash_sha256), true);
assert.equal(isSha256(packet.hash_topology.packet_hash_sha256), true);
assert.equal(packet.hash_topology.packet_hash_sha256, packet.packet_hash_sha256);
assert.equal(packet.release_discipline.release_class, 'provider-ready');
assert.equal(packet.release_discipline.provider_dispatch_allowed, true);

console.log('hush-outgoing-contract-packet: ok');
