import assert from 'node:assert/strict';
import { buildOutgoingContractPacket } from '../app/engine/hush-outgoing-contract-packet.js';
import { buildProviderDispatchEnvelope } from '../app/engine/hush-outgoing-contract-validator.js';
import { stableStringify, sha256Text } from '../app/engine/hush-customizer-packet.js';
import { buildProviderLogPacket } from '../app/engine/hush-provider-log-packet.js';
import { validateProviderLog, buildContractLogAttachment } from '../app/engine/hush-provider-log-validator.js';

function clone(value) { return JSON.parse(JSON.stringify(value)); }
async function expectBlocked(basePacket, mutator, reasonFragment = null) {
  const candidate = clone(basePacket);
  mutator(candidate);
  const result = await validateProviderLog(candidate);
  assert.equal(result.status, 'blocked');
  if (reasonFragment) assert.ok(result.refusal_reasons.some((reason) => reason.includes(reasonFragment)), `${reasonFragment} not found in ${JSON.stringify(result.refusal_reasons)}`);
  return result;
}

const contract = await buildOutgoingContractPacket({
  requestKind: 'generation',
  surface: 'provider-bridge',
  sourceEvent: 'manual',
  providerClass: 'openai',
  providerName: 'OpenAI',
  modelName: 'gpt-test',
  endpointClass: 'responses',
  mask_context: { mask_source: 'customizer', mask_id: 'provider-log-mask', mask_release_class: 'operational-local', discourse_mode: 'legal-forensic', retrieval_trigger: 'baseline-voice' },
  customizer_packet_ref: { customizer_packet_id: 'TD613-HUSH-CUSTOMIZER-20260620-ABCDEF12', customizer_packet_hash_sha256: 'sha256:' + 'a'.repeat(64), customizer_release_class: 'operational-local', sample_text_exported: false, sample_count: 24, accepted_words: 2400 },
  systemInstruction: 'Preserve claim limits.',
  developerInstruction: 'Use the requested mode and trigger.',
  userInstruction: 'Draft a bounded answer.',
  redactedPromptSummary: 'Bounded provider-log test request.',
  expectedOutputClass: 'draft'
}, { stableId: true, createdAt: '2026-06-20T00:00:00Z' });

const dispatchEnvelope = await buildProviderDispatchEnvelope(contract);
const dispatchEnvelopeWithHash = { ...dispatchEnvelope, dispatch_envelope_hash_sha256: await sha256Text(stableStringify(dispatchEnvelope)) };

const packet = await buildProviderLogPacket({
  outgoing_contract_packet: contract,
  dispatch_envelope: dispatchEnvelopeWithHash,
  provider_target_observed: { provider_class: 'local', provider_name: 'Local Test', model_name: 'local-test', endpoint_class: 'local-runtime', api_surface: 'local', network_dispatch_observed: true, provider_request_id: 'req-test-1', provider_response_id: 'res-test-1' },
  rawResponseText: 'A redacted response body for hashing.',
  redactedResponseSummary: 'Provider returned a bounded redacted draft.',
  response_observation: { finish_reason: 'stop', provider_reported_status: 'success' }
}, { stableId: true, createdAt: '2026-06-20T00:01:00Z' });

const validation = await validateProviderLog(packet);
assert.equal(validation.status, 'pass');
assert.equal(validation.validator_mode, 'shape-plus-replay');
assert.equal(validation.hash_replay.status, 'pass');
assert.ok(validation.authority_families.includes('provider-log-v1'));
assert.ok(validation.authority_families.includes('linked-contract-bearing'));

const attachment = await buildContractLogAttachment(packet, contract);
assert.equal(attachment.contract_packet_id, contract.contract_packet_id);
assert.equal(attachment.provider_log_packet_id, packet.provider_log_packet_id);
assert.equal(attachment.comparison_required, true);
assert.equal(attachment.compliance_status, 'not-evaluated');
assert.equal(attachment.validation.status, 'pass');

await expectBlocked(packet, (p) => { p.packet_hash_sha256 = 'sha256:notreal'; }, 'packet_hash_sha256');

const hashOnly = { schema_version: 'td613.hush.provider-log/v1', packet_class: 'model-provider-boundary-receipt', provider_log_packet_id: 'TD613-HUSH-PROVIDER-20260620-ABCDEF12', packet_hash_sha256: 'sha256:' + 'b'.repeat(64) };
assert.equal((await validateProviderLog(hashOnly)).status, 'blocked');

await expectBlocked(packet, (p) => { delete p.linked_contract; }, 'linked_contract is required');
await expectBlocked(packet, (p) => { p.response_observation.redacted_response_summary = 'Tampered response summary.'; }, 'response observation hash mismatch');
await expectBlocked(packet, (p) => { p.hash_topology.packet_hash_sha256 = 'sha256:' + 'c'.repeat(64); }, 'topology packet hash replay mismatch');
await expectBlocked(packet, (p) => { p.hash_topology.packet_hash_sha256 = 'sha256:' + 'c'.repeat(64); }, 'packet hash locations disagree');

for (const [field, reason] of [
  ['raw_prompt_sent', 'raw prompt'],
  ['raw_customizer_samples_sent', 'raw Customizer samples'],
  ['raw_mask_material_sent', 'raw mask material'],
  ['private_text_sent', 'private text']
]) await expectBlocked(packet, (p) => { p.request_payload_observation[field] = true; }, reason);

await expectBlocked(packet, (p) => { p.response_observation.raw_response_exported = true; }, 'raw response');
await expectBlocked(packet, (p) => { p.response_observation.contains_private_text_echo = true; }, 'private text echo');
await expectBlocked(packet, (p) => { p.redaction_profile.raw_request_exported = true; }, 'raw request');
await expectBlocked(packet, (p) => { p.redaction_profile.raw_response_exported = true; }, 'raw response');
await expectBlocked(packet, (p) => { p.redaction_profile.private_text_echo_detected = true; }, 'private text echo');

await expectBlocked(packet, (p) => { p.contract_compliance = { status: 'aligned' }; }, 'cannot claim compliance or output quality');
await expectBlocked(packet, (p) => { p.compliance_status = 'aligned'; }, 'cannot claim compliance or output quality');
await expectBlocked(packet, (p) => { p.provider_compliance_claim = true; }, 'cannot claim compliance or output quality');
await expectBlocked(packet, (p) => { p.output_quality_claim = true; }, 'cannot claim compliance or output quality');

await expectBlocked(packet, (p) => { p.response_observation.redacted_response_summary = 'stylometric authenticity asserted'; }, 'cannot claim stylometric authenticity');
await expectBlocked(packet, (p) => { p.response_observation.redacted_response_summary = 'authentic voice confirmed'; }, 'cannot claim stylometric authenticity');
await expectBlocked(packet, (p) => { p.response_observation.redacted_response_summary = 'voice authenticity confirmed'; }, 'cannot claim stylometric authenticity');

await expectBlocked(packet, (p) => { p.eo_rfd_route_observation.firmware_status = 'firmware-attached'; p.eo_rfd_route_observation.firmware_adapter_verified = false; }, 'firmware-attached claim requires verified adapter proof');
await expectBlocked(packet, (p) => { p.eo_rfd_route_observation.operator_note = 'executive order authority'; }, 'must not claim legal or executive-order authority');
await expectBlocked(packet, (p) => { p.eo_rfd_route_observation.operator_note = 'legal authority'; }, 'must not claim legal or executive-order authority');
await expectBlocked(packet, (p) => { p.eo_rfd_route_observation.operator_note = 'public law'; }, 'must not claim legal or executive-order authority');

await expectBlocked(packet, (p) => { p.refusal_observation.matches_contract_refusal_policy = 'aligned'; }, 'cannot adjudicate contract refusal alignment before Phase 3');
const refusalUnknown = clone(packet);
refusalUnknown.refusal_observation.matches_contract_refusal_policy = 'unknown';
assert.equal((await validateProviderLog(refusalUnknown)).status, 'pass');

for (const [surface, reason] of [
  ['provider_target_observed', 'provider_target_observed is required'],
  ['dispatch_observation', 'dispatch_observation is required'],
  ['request_payload_observation', 'request_payload_observation is required'],
  ['redaction_profile', 'redaction_profile is required'],
  ['provider_log_release_discipline', 'provider_log_release_discipline is required'],
  ['claim_limits', 'claim_limits are required']
]) await expectBlocked(packet, (p) => { delete p[surface]; }, reason);
await expectBlocked(packet, (p) => { delete p.response_observation; delete p.refusal_observation; }, 'response_observation or refusal_observation is required');

await expectBlocked(packet, (p) => { p.linked_contract.contract_packet_id = 'BAD-CONTRACT-ID'; }, 'linked_contract.contract_packet_id is malformed');
await expectBlocked(packet, (p) => { p.linked_contract.contract_packet_id = 'TD613-SH-9B07D8B-ABCDEF12'; }, 'linked_contract.contract_packet_id must not use SHI');
await expectBlocked(packet, (p) => { p.linked_contract.contract_packet_hash_sha256 = 'sha256:notreal'; }, 'linked_contract.contract_packet_hash_sha256');
await expectBlocked(packet, (p) => { delete p.linked_contract.dispatch_envelope_hash_sha256; p.dispatch_observation.dispatch_attempted = true; }, 'linked_contract.dispatch_envelope_hash_sha256 is required when dispatch was attempted');

await expectBlocked(packet, (p) => { p.linked_contract.contract_release_class = 'tampered'; }, 'linked contract hash mismatch');
await expectBlocked(packet, (p) => { p.provider_target_observed.model_name = 'tampered-model'; }, 'provider target observed hash mismatch');
await expectBlocked(packet, (p) => { p.dispatch_observation.dispatch_status = 'tampered-status'; }, 'dispatch observation hash mismatch');
await expectBlocked(packet, (p) => { p.request_payload_observation.redacted_payload_summary = 'tampered payload summary'; }, 'request payload observation hash mismatch');
await expectBlocked(packet, (p) => { p.redaction_profile.redaction_method = 'tampered-redaction'; }, 'redaction profile hash mismatch');
await expectBlocked(packet, (p) => { p.provider_log_release_discipline.operator_next_action = 'tampered-action'; }, 'policy hash mismatch');
await expectBlocked(packet, (p) => { p.packet_hash_sha256 = 'sha256:' + 'd'.repeat(64); }, 'packet hash replay mismatch');
await expectBlocked(packet, (p) => { p.packet_hash_sha256 = 'sha256:' + 'd'.repeat(64); }, 'packet hash locations disagree');

console.log('hush-provider-log-validator: ok');
