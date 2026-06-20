import assert from 'node:assert/strict';
import { buildOutgoingContractPacket } from '../app/engine/hush-outgoing-contract-packet.js';
import { buildProviderDispatchEnvelope } from '../app/engine/hush-outgoing-contract-validator.js';
import { stableStringify, sha256Text } from '../app/engine/hush-customizer-packet.js';
import { buildProviderLogPacket } from '../app/engine/hush-provider-log-packet.js';
import { validateProviderLog, buildContractLogAttachment } from '../app/engine/hush-provider-log-validator.js';

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

const malformedHash = { ...packet, packet_hash_sha256: 'sha256:notreal' };
assert.equal((await validateProviderLog(malformedHash)).status, 'blocked');

const hashOnly = { schema_version: 'td613.hush.provider-log/v1', packet_class: 'model-provider-boundary-receipt', provider_log_packet_id: 'TD613-HUSH-PROVIDER-20260620-ABCDEF12', packet_hash_sha256: 'sha256:' + 'b'.repeat(64) };
assert.equal((await validateProviderLog(hashOnly)).status, 'blocked');

const missingLinked = JSON.parse(JSON.stringify(packet));
delete missingLinked.linked_contract;
assert.equal((await validateProviderLog(missingLinked)).status, 'blocked');

const tamperedResponse = JSON.parse(JSON.stringify(packet));
tamperedResponse.response_observation.redacted_response_summary = 'Tampered response summary.';
const tamperedResponseValidation = await validateProviderLog(tamperedResponse);
assert.equal(tamperedResponseValidation.status, 'blocked');
assert.ok(tamperedResponseValidation.refusal_reasons.some((reason) => reason.includes('response observation hash mismatch')));

const staleTopology = JSON.parse(JSON.stringify(packet));
staleTopology.hash_topology.packet_hash_sha256 = 'sha256:' + 'c'.repeat(64);
const staleTopologyValidation = await validateProviderLog(staleTopology);
assert.equal(staleTopologyValidation.status, 'blocked');
assert.ok(staleTopologyValidation.refusal_reasons.some((reason) => reason.includes('topology packet hash replay mismatch')));
assert.ok(staleTopologyValidation.refusal_reasons.some((reason) => reason.includes('packet hash locations disagree')));

console.log('hush-provider-log-validator: ok');
