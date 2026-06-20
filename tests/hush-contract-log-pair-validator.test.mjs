import assert from 'node:assert/strict';
import { buildOutgoingContractPacket } from '../app/engine/hush-outgoing-contract-packet.js';
import { buildProviderDispatchEnvelope } from '../app/engine/hush-outgoing-contract-validator.js';
import { buildProviderLogPacket } from '../app/engine/hush-provider-log-packet.js';
import { stableStringify, sha256Text } from '../app/engine/hush-customizer-packet.js';
import { buildContractLogPairPacket } from '../app/engine/hush-contract-log-pair-packet.js';
import { validateContractLogPair } from '../app/engine/hush-contract-log-pair-validator.js';

function clone(value) { return JSON.parse(JSON.stringify(value)); }
async function expectBlocked(basePacket, mutator, reasonFragment = null, options = {}) {
  const candidate = clone(basePacket);
  mutator(candidate);
  const result = await validateContractLogPair(candidate, options);
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
  mask_context: { mask_source: 'customizer', mask_id: 'pair-validator-mask', mask_release_class: 'operational-local', discourse_mode: 'legal-forensic', retrieval_trigger: 'baseline-voice' },
  customizer_packet_ref: { customizer_packet_id: 'TD613-HUSH-CUSTOMIZER-20260620-ABCDEF12', customizer_packet_hash_sha256: 'sha256:' + 'a'.repeat(64), customizer_release_class: 'operational-local', sample_text_exported: false, sample_count: 24, accepted_words: 2400 },
  systemInstruction: 'Preserve claim limits.',
  developerInstruction: 'Use the requested mode and trigger.',
  userInstruction: 'Draft a bounded answer.',
  redactedPromptSummary: 'Bounded pair validator request.',
  expectedOutputClass: 'draft'
}, { stableId: true, createdAt: '2026-06-20T00:00:00Z' });
const dispatchEnvelope = await buildProviderDispatchEnvelope(contract);
const dispatchEnvelopeWithHash = { ...dispatchEnvelope, dispatch_envelope_hash_sha256: await sha256Text(stableStringify(dispatchEnvelope)) };
const providerLog = await buildProviderLogPacket({
  outgoing_contract_packet: contract,
  dispatch_envelope: dispatchEnvelopeWithHash,
  provider_target_observed: { provider_class: 'local', provider_name: 'Local Test', model_name: 'local-test', endpoint_class: 'local-runtime', api_surface: 'local', network_dispatch_observed: true, provider_request_id: 'req-pair-v', provider_response_id: 'res-pair-v' },
  rawResponseText: 'Redacted response body for hashing only.',
  redactedResponseSummary: 'Provider returned a bounded redacted draft.',
  response_observation: { finish_reason: 'stop', provider_reported_status: 'success' }
}, { stableId: true, createdAt: '2026-06-20T00:01:00Z' });
const pair = await buildContractLogPairPacket({ outgoing_contract_packet: contract, provider_log_packet: providerLog }, { stableId: true, createdAt: '2026-06-20T00:02:00Z' });

const validation = await validateContractLogPair(pair);
assert.equal(validation.status, 'pass');
assert.equal(validation.validator_mode, 'shape-plus-replay');
assert.equal(validation.hash_replay.status, 'pass');
assert.ok(validation.authority_families.includes('contract-log-pair-v1'));
assert.ok(validation.authority_families.includes('linked-contract-bearing'));
assert.ok(validation.authority_families.includes('linked-provider-log-bearing'));

await expectBlocked(pair, (p) => { p.pair_packet_id = 'BAD-PAIR-ID'; }, 'pair_packet_id must match');
await expectBlocked(pair, (p) => { p.pair_packet_id = 'TD613-SH-9B07D8B-ABCDEF12'; }, 'pair_packet_id must not use SHI');
await expectBlocked(pair, (p) => { delete p.linked_contract; }, 'linked_contract is required');
await expectBlocked(pair, (p) => { delete p.linked_provider_log; }, 'linked_provider_log is required');
await expectBlocked(pair, (p) => { p.linked_contract.contract_packet_id = 'BAD-CONTRACT-ID'; }, 'linked_contract.contract_packet_id is malformed');
await expectBlocked(pair, (p) => { p.linked_provider_log.provider_log_packet_id = 'BAD-PROVIDER-ID'; }, 'linked_provider_log.provider_log_packet_id is malformed');

const hashOnly = { schema_version: 'td613.hush.contract-log-pair/v1', packet_class: 'contract-provider-event-comparison', pair_packet_id: 'TD613-HUSH-PAIR-20260620-ABCDEF12', packet_hash_sha256: 'sha256:' + 'b'.repeat(64) };
assert.equal((await validateContractLogPair(hashOnly)).status, 'blocked');

await expectBlocked(pair, (p) => { p.packet_hash_sha256 = 'sha256:notreal'; }, 'packet_hash_sha256');
await expectBlocked(pair, (p) => { p.contract_snapshot.provider_target.provider_class = 'tampered'; }, 'contract snapshot hash mismatch');
await expectBlocked(pair, (p) => { p.provider_log_snapshot.provider_target_observed.provider_class = 'tampered'; }, 'provider log snapshot hash mismatch');
await expectBlocked(pair, (p) => { p.comparison_result.summary = 'tampered summary'; }, 'comparison result hash mismatch');
await expectBlocked(pair, (p) => { p.hash_topology.packet_hash_sha256 = 'sha256:' + 'c'.repeat(64); }, 'topology packet hash replay mismatch');
await expectBlocked(pair, (p) => { p.hash_topology.packet_hash_sha256 = 'sha256:' + 'c'.repeat(64); }, 'packet hash locations disagree');

await expectBlocked(pair, (p) => { p.contract_snapshot.raw_prompt = 'raw prompt should not be here'; }, 'raw prompt');
await expectBlocked(pair, (p) => { p.provider_log_snapshot.raw_response = 'raw response should not be here'; }, 'raw response');
await expectBlocked(pair, (p) => { p.contract_snapshot.raw_customizer_samples = ['sample']; }, 'raw_customizer_samples');
await expectBlocked(pair, (p) => { p.contract_snapshot.raw_mask_material = 'mask body'; }, 'raw_mask_material');
await expectBlocked(pair, (p) => { p.comparison_result.summary = 'voice authenticity confirmed'; }, 'cannot claim final proof');
await expectBlocked(pair, (p) => { p.comparison_result.summary = 'output quality proof'; }, 'cannot claim final proof');
await expectBlocked(pair, (p) => { p.comparison_result.summary = 'EO-RFD firmware proof'; }, 'cannot claim final proof');

console.log('hush-contract-log-pair-validator: ok');
