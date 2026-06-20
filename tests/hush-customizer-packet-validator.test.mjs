import assert from 'node:assert/strict';
import { buildCustomizerPacket } from '../app/engine/hush-customizer-packet.js';
import { isSha256, validateCustomizerPacket, buildCustomizerSession } from '../app/engine/hush-customizer-packet-validator.js';

function sampleText(index) {
  return `Reference ${index} gives the packet builder enough language to measure. It uses clear transitions, stable rhythm, useful punctuation, and enough words to qualify for the local Customizer corpus. The point of this paragraph is ordinary: create a safe sample that can become hash metadata without exporting the original text.`;
}

const samples = Array.from({ length: 12 }, (_, index) => ({ text: sampleText(index + 1), discourseMode: 'explanatory', retrievalTrigger: index % 2 ? 'edit-note' : 'baseline-voice' }));
const packet = await buildCustomizerPacket({ label: 'Validator Mask', samples });

assert.equal(isSha256(packet.packet_hash_sha256), true);
const result = validateCustomizerPacket(packet);
assert.equal(result.status, 'pass');
assert.ok(result.authority_families.includes('sample-ledger'));
assert.ok(result.authority_families.includes('hash-topology'));
assert.ok(result.authority_families.includes('customizer-release-discipline'));

const session = buildCustomizerSession(packet);
assert.equal(session.customizer_packet_id, packet.customizer_packet_id);
assert.equal(session.activeMask.samples.every((sample) => sample.text === null), true);

const fakeHash = { ...packet, packet_hash_sha256: 'sha256:notreal' };
const fakeResult = validateCustomizerPacket(fakeHash);
assert.equal(fakeResult.status, 'blocked');
assert.ok(fakeResult.refusal_reasons.some((reason) => reason.includes('packet_hash_sha256')));

const hashOnly = {
  schema_version: 'td613.hush.customizer-packet/v1',
  customizer_packet_id: 'TD613-HUSH-CUSTOMIZER-20260620-HASHONLY',
  packet_hash_sha256: 'sha256:' + 'a'.repeat(64),
  hash_topology: {
    schema_version: 'td613.hush.hash-topology/v1',
    packet_hash_sha256: 'sha256:' + 'a'.repeat(64),
    sample_ledger_hash_sha256: 'sha256:' + 'b'.repeat(64),
    profile_hash_sha256: 'sha256:' + 'c'.repeat(64),
    routing_hash_sha256: 'sha256:' + 'd'.repeat(64),
    policy_hash_sha256: 'sha256:' + 'e'.repeat(64)
  }
};
const hashOnlyResult = validateCustomizerPacket(hashOnly);
assert.equal(hashOnlyResult.status, 'blocked');
assert.ok(hashOnlyResult.refusal_reasons.some((reason) => reason.includes('required corpus')));

const textIncluded = JSON.parse(JSON.stringify(packet));
textIncluded.sample_ledger[0].text = 'sample body should not appear in a redacted packet';
const textIncludedResult = validateCustomizerPacket(textIncluded);
assert.equal(textIncludedResult.status, 'blocked');
assert.ok(textIncludedResult.refusal_reasons.some((reason) => reason.includes('raw sample text')));

console.log('hush-customizer-packet-validator: ok');
