import assert from 'node:assert/strict';
import { buildCustomizerPacket } from '../app/engine/hush-customizer-packet.js';
import { validateCustomizerPacket, buildCustomizerRestoreSession } from '../app/engine/hush-customizer-packet-validator.js';

const body = 'This reference sample has enough words to count as a real stylometric unit. It carries ordinary sentences, a few clauses, and enough cadence to create a useful ledger entry. The sample should be hashed, summarized, and redacted. It should not travel as raw text when the packet is being treated as a redacted Customizer profile. That distinction is the whole point of the packet upgrade.';
const samples = Array.from({ length: 12 }, (_, index) => ({ text: `${body} Extra variation ${index}.`, discourseMode: index % 2 ? 'argumentative' : 'explanatory', retrievalTrigger: index % 2 ? 'high-pressure' : 'baseline-voice' }));
const packet = await buildCustomizerPacket({ id: 'custom-validator-mask', label: 'Validator Mask', samples }, { stableId: true, updatedAt: '2026-06-20T00:00:00Z' });

const validation = validateCustomizerPacket(packet);
assert.equal(validation.status, 'pass');
assert.ok(validation.authority_families.includes('customizer-packet-v1'));
assert.ok(validation.authority_families.includes('packet-hash-bearing'));
assert.ok(validation.authority_families.includes('corpus-readiness-bearing'));
assert.ok(validation.authority_families.includes('routing-bearing'));

const session = buildCustomizerRestoreSession(packet);
assert.equal(session.activeMask.source, 'customizer-packet-restore');
assert.equal(session.activeMask.sampleCount, 12);
assert.equal(session.validation.status, 'pass');

const fakeHash = { ...packet, packet_hash_sha256: 'sha256:notreal' };
const fakeHashValidation = validateCustomizerPacket(fakeHash);
assert.equal(fakeHashValidation.status, 'blocked');
assert.ok(fakeHashValidation.refusal_reasons.some((reason) => reason.includes('packet_hash_sha256')));

const hashOnly = { schema_version: 'td613.hush.customizer-packet/v1', packet_class: 'local-stylometric-mask-corpus', customizer_packet_id: 'TD613-HUSH-CUSTOMIZER-20260620-ABCDEF12', packet_hash_sha256: 'sha256:' + 'a'.repeat(64) };
const hashOnlyValidation = validateCustomizerPacket(hashOnly);
assert.equal(hashOnlyValidation.status, 'blocked');
assert.ok(hashOnlyValidation.refusal_reasons.some((reason) => reason.includes('hash-only')) || hashOnlyValidation.refusal_reasons.length > 0);

const rawLeak = JSON.parse(JSON.stringify(packet));
rawLeak.sample_ledger[0].text = 'raw sample should not be here';
rawLeak.sample_ledger[0].raw_text_exported = true;
rawLeak.private_text_policy.sample_text_exported = true;
const rawLeakValidation = validateCustomizerPacket(rawLeak);
assert.equal(rawLeakValidation.status, 'blocked');
assert.ok(rawLeakValidation.refusal_reasons.some((reason) => reason.includes('raw text') || reason.includes('sample text')));

const shiMisuse = { ...packet, customizer_packet_id: 'TD613-SH-9B07D8B-ABCDEF12' };
const shiValidation = validateCustomizerPacket(shiMisuse);
assert.equal(shiValidation.status, 'blocked');
assert.ok(shiValidation.refusal_reasons.some((reason) => reason.includes('SHI')));

console.log('hush-customizer-packet-validator: ok');
