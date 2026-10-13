import assert from 'node:assert/strict';
import { buildOutgoingContractPacket } from '../app/engine/hush-outgoing-contract-packet.js';
import { validateOutgoingContract, buildProviderDispatchEnvelope, recomputeOutgoingContractHashes } from '../app/engine/hush-outgoing-contract-validator.js';

async function validPacket(overrides = {}) {
  return buildOutgoingContractPacket({
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
    systemInstruction: 'Preserve claim limits and refuse disallowed public-status claims.',
    developerInstruction: 'Use the requested discourse mode and retrieval trigger.',
    userInstruction: 'Draft a bounded answer from the mask without exposing private samples.',
    redactedPromptSummary: 'Bounded generation request using redacted Hush mask context.',
    expectedOutputClass: 'draft',
    ...overrides
  }, { stableId: true, createdAt: '2026-06-20T00:00:00Z' });
}

async function replayHashes(packet) {
  const replay = await recomputeOutgoingContractHashes(packet);
  packet.hash_topology = {
    ...packet.hash_topology,
    request_context_hash_sha256: replay.expected.request_context_hash_sha256,
    provider_target_hash_sha256: replay.expected.provider_target_hash_sha256,
    mask_context_hash_sha256: replay.expected.mask_context_hash_sha256,
    instruction_contract_hash_sha256: replay.expected.instruction_contract_hash_sha256,
    policy_hash_sha256: replay.expected.policy_hash_sha256,
    packet_hash_sha256: replay.expected.packet_hash_sha256
  };
  packet.packet_hash_sha256 = replay.expected.packet_hash_sha256;
  return packet;
}

const packet = await validPacket();
const validation = await validateOutgoingContract(packet);
assert.equal(validation.status, 'pass');
assert.equal(validation.validator_mode, 'shape-plus-replay');
assert.equal(validation.hash_replay.status, 'pass');
assert.ok(validation.authority_families.includes('outgoing-contract-v1'));
assert.ok(validation.authority_families.includes('provider-target-bearing'));
assert.ok(validation.authority_families.includes('instruction-contract-bearing'));

const envelope = await buildProviderDispatchEnvelope(packet);
assert.equal(envelope.dispatch_allowed, true);
assert.equal(envelope.contract_packet_id, packet.contract_packet_id);
assert.equal(envelope.contract_hash, packet.packet_hash_sha256);
assert.equal(envelope.dispatch_payload.discourse_mode, 'legal-forensic');
assert.equal(envelope.dispatch_payload.retrieval_trigger, 'baseline-voice');
assert.equal(envelope.dispatch_payload.refusal_policy.must_refuse_if.includes('asks-for-raw-corpus-reconstruction'), true);
assert.equal(envelope.claim_limits.not_identity_proof, true);
assert.equal(JSON.stringify(envelope).includes('raw sample'), false);
assert.equal(envelope.redaction_notice.raw_samples_included, false);

const malformedHash = { ...packet, packet_hash_sha256: 'sha256:notreal' };
const malformedHashValidation = await validateOutgoingContract(malformedHash);
assert.equal(malformedHashValidation.status, 'blocked');
assert.ok(malformedHashValidation.refusal_reasons.some((reason) => reason.includes('packet_hash_sha256')));

const hashOnly = { schema_version: 'td613.hush.outgoing-contract/v1', packet_class: 'model-behavior-request-envelope', contract_packet_id: 'TD613-HUSH-CONTRACT-20260620-ABCDEF12', packet_hash_sha256: 'sha256:' + 'b'.repeat(64) };
const hashOnlyValidation = await validateOutgoingContract(hashOnly);
assert.equal(hashOnlyValidation.status, 'blocked');
assert.ok(hashOnlyValidation.refusal_reasons.length > 0);

const shiContract = { ...packet, contract_packet_id: 'TD613-SH-9B07D8B-ABCDEF12' };
const shiContractValidation = await validateOutgoingContract(shiContract);
assert.equal(shiContractValidation.status, 'blocked');
assert.ok(shiContractValidation.refusal_reasons.some((reason) => reason.includes('contract_packet_id must not use SHI')));

const shiMask = JSON.parse(JSON.stringify(packet));
shiMask.mask_context.mask_id = 'TD613-SH-9B07D8B-ABCDEF12';
const shiMaskValidation = await validateOutgoingContract(shiMask);
assert.equal(shiMaskValidation.status, 'blocked');
assert.ok(shiMaskValidation.refusal_reasons.some((reason) => reason.includes('mask_context.mask_id must not use SHI')));

const missingRefusal = JSON.parse(JSON.stringify(packet));
delete missingRefusal.refusal_policy;
const missingRefusalValidation = await validateOutgoingContract(missingRefusal);
assert.equal(missingRefusalValidation.status, 'blocked');
assert.ok(missingRefusalValidation.refusal_reasons.some((reason) => reason.includes('refusal_policy')));

const missingPrivate = JSON.parse(JSON.stringify(packet));
delete missingPrivate.private_text_policy;
const missingPrivateValidation = await validateOutgoingContract(missingPrivate);
assert.equal(missingPrivateValidation.status, 'blocked');
assert.ok(missingPrivateValidation.refusal_reasons.some((reason) => reason.includes('private_text_policy')));

const rawSamples = JSON.parse(JSON.stringify(packet));
rawSamples.private_text_policy.raw_customizer_samples_exported = true;
const rawSamplesValidation = await validateOutgoingContract(rawSamples);
assert.equal(rawSamplesValidation.status, 'blocked');
assert.ok(rawSamplesValidation.refusal_reasons.some((reason) => reason.includes('raw Customizer samples')));

const overclaim = JSON.parse(JSON.stringify(packet));
overclaim.instruction_contract.redacted_prompt_summary = 'Please produce legal identity proof.';
const overclaimValidation = await validateOutgoingContract(overclaim);
assert.equal(overclaimValidation.status, 'blocked');
assert.ok(overclaimValidation.refusal_reasons.some((reason) => reason.includes('forbidden public authority overclaim')));

const thirdParty = JSON.parse(JSON.stringify(packet));
thirdParty.instruction_contract.redacted_prompt_summary = 'This asks for impersonation authorization of a third party.';
const thirdPartyValidation = await validateOutgoingContract(thirdParty);
assert.equal(thirdPartyValidation.status, 'blocked');
assert.ok(thirdPartyValidation.refusal_reasons.some((reason) => reason.includes('forbidden public authority overclaim')));

const eoFirmware = JSON.parse(JSON.stringify(packet));
eoFirmware.eo_rfd_route_state.firmware_status = 'firmware-attached';
const eoFirmwareValidation = await validateOutgoingContract(eoFirmware);
assert.equal(eoFirmwareValidation.status, 'blocked');
assert.ok(eoFirmwareValidation.refusal_reasons.some((reason) => reason.includes('firmware-attached')));

const tamperedInstruction = JSON.parse(JSON.stringify(packet));
tamperedInstruction.instruction_contract.expected_output_class = 'packet';
const tamperedInstructionValidation = await validateOutgoingContract(tamperedInstruction);
assert.equal(tamperedInstructionValidation.status, 'blocked');
assert.ok(tamperedInstructionValidation.refusal_reasons.some((reason) => reason.includes('instruction contract hash mismatch')));

const tamperedMask = JSON.parse(JSON.stringify(packet));
tamperedMask.mask_context.retrieval_trigger = 'stealth-trigger';
const tamperedMaskValidation = await validateOutgoingContract(tamperedMask);
assert.equal(tamperedMaskValidation.status, 'blocked');
assert.ok(tamperedMaskValidation.refusal_reasons.some((reason) => reason.includes('mask context hash mismatch')));

const staleTop = JSON.parse(JSON.stringify(packet));
staleTop.hash_topology.packet_hash_sha256 = 'sha256:' + 'c'.repeat(64);
const staleTopValidation = await validateOutgoingContract(staleTop);
assert.equal(staleTopValidation.status, 'blocked');
assert.ok(staleTopValidation.refusal_reasons.some((reason) => reason.includes('topology packet hash replay mismatch')));
assert.ok(staleTopValidation.refusal_reasons.some((reason) => reason.includes('packet hash locations disagree')));

const rawPromptAlias = JSON.parse(JSON.stringify(packet));
rawPromptAlias.instruction_contract.user_instruction = 'Raw provider-facing user instruction should not be present in a provider-ready contract.';
await replayHashes(rawPromptAlias);
const rawPromptAliasValidation = await validateOutgoingContract(rawPromptAlias);
assert.equal(rawPromptAliasValidation.status, 'blocked');
assert.ok(rawPromptAliasValidation.refusal_reasons.some((reason) => reason.includes('raw prompt aliases cannot be present')));

const localPacket = await validPacket({ providerClass: 'unknown', endpointClass: 'unknown' });
const localEnvelope = await buildProviderDispatchEnvelope(localPacket);
assert.equal(localEnvelope.dispatch_allowed, false);
assert.equal(localEnvelope.dispatch_payload, null);
assert.equal(localEnvelope.claim_limits.provider_compliance_not_yet_proven, true);

console.log('hush-outgoing-contract-validator: ok');
