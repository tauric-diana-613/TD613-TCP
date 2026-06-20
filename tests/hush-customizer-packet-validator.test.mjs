import assert from 'node:assert/strict';
import { buildCustomizerPacket } from '../app/engine/hush-customizer-packet.js';
import { validateCustomizerPacket, buildCustomizerRestoreSession } from '../app/engine/hush-customizer-packet-validator.js';

const body = 'This reference sample has enough words to count as a real stylometric unit. It carries ordinary sentences, a few clauses, and enough cadence to create a useful ledger entry. The sample should be hashed, summarized, and redacted. It should not travel as raw text when the packet is being treated as a redacted Customizer profile. That distinction is the whole point of the packet upgrade.';
const samples = Array.from({ length: 12 }, (_, index) => ({ text: `${body} Extra variation ${index}.`, discourseMode: index % 2 ? 'argumentative' : 'explanatory', retrievalTrigger: index % 2 ? 'high-pressure' : 'baseline-voice' }));
const packet = await buildCustomizerPacket({ id: 'custom-validator-mask', label: 'Validator Mask', samples }, { stableId: true, updatedAt: '2026-06-20T00:00:00Z' });

const validation = await validateCustomizerPacket(packet);
assert.equal(validation.status, 'pass');
assert.equal(validation.validator_mode, 'shape-plus-replay');
assert.equal(validation.hash_replay.status, 'pass');
assert.ok(validation.authority_families.includes('customizer-packet-v1'));
assert.ok(validation.authority_families.includes('packet-hash-bearing'));
assert.ok(validation.authority_families.includes('corpus-readiness-bearing'));
assert.ok(validation.authority_families.includes('routing-bearing'));

const session = await buildCustomizerRestoreSession(packet);
assert.equal(session.activeMask.source, 'customizer-packet-restore');
assert.equal(session.activeMask.sampleCount, 12);
assert.equal(session.validation.status, 'pass');
assert.equal(session.activeMask.samples[0].text, null);
assert.equal(session.activeMask.samples[0].textIncluded, false);
assert.equal(session.activeMask.samples[0].text_included, false);
assert.equal(session.activeMask.samples[0].raw_text, undefined);
assert.equal(session.activeMask.samples[0].sample_text, undefined);

const fakeHash = { ...packet, packet_hash_sha256: 'sha256:notreal' };
const fakeHashValidation = await validateCustomizerPacket(fakeHash);
assert.equal(fakeHashValidation.status, 'blocked');
assert.ok(fakeHashValidation.refusal_reasons.some((reason) => reason.includes('packet_hash_sha256')));

const hashOnly = { schema_version: 'td613.hush.customizer-packet/v1', packet_class: 'local-stylometric-mask-corpus', customizer_packet_id: 'TD613-HUSH-CUSTOMIZER-20260620-ABCDEF12', packet_hash_sha256: 'sha256:' + 'a'.repeat(64) };
const hashOnlyValidation = await validateCustomizerPacket(hashOnly);
assert.equal(hashOnlyValidation.status, 'blocked');
assert.ok(hashOnlyValidation.refusal_reasons.some((reason) => reason.includes('hash-only')) || hashOnlyValidation.refusal_reasons.length > 0);

const rawLeak = JSON.parse(JSON.stringify(packet));
rawLeak.sample_ledger[0].text = 'raw sample should not be here';
rawLeak.sample_ledger[0].raw_text_exported = true;
rawLeak.private_text_policy.sample_text_exported = true;
const rawLeakValidation = await validateCustomizerPacket(rawLeak);
assert.equal(rawLeakValidation.status, 'blocked');
assert.ok(rawLeakValidation.refusal_reasons.some((reason) => reason.includes('raw sample text') || reason.includes('sample text')));

const rawAlias = JSON.parse(JSON.stringify(packet));
rawAlias.sample_ledger[0].rawText = 'raw alias should not pass';
let rawAliasValidation = await validateCustomizerPacket(rawAlias);
assert.equal(rawAliasValidation.status, 'blocked');
assert.ok(rawAliasValidation.refusal_reasons.some((reason) => reason.includes('explicit operator confirmation')));
rawAliasValidation = await validateCustomizerPacket(rawAlias, { allowPrivateText: true });
assert.equal(rawAliasValidation.status, 'blocked');
assert.ok(rawAliasValidation.refusal_reasons.some((reason) => reason.includes('sample ledger hash mismatch') || reason.includes('packet hash replay mismatch')));

const shiPacketIdMisuse = { ...packet, customizer_packet_id: 'TD613-SH-9B07D8B-ABCDEF12' };
const shiPacketValidation = await validateCustomizerPacket(shiPacketIdMisuse);
assert.equal(shiPacketValidation.status, 'blocked');
assert.ok(shiPacketValidation.refusal_reasons.some((reason) => reason.includes('customizer_packet_id must not use SHI')));

const shiMaskMisuse = { ...packet, mask_id: 'TD613-SH-9B07D8B-ABCDEF12' };
const shiMaskValidation = await validateCustomizerPacket(shiMaskMisuse);
assert.equal(shiMaskValidation.status, 'blocked');
assert.ok(shiMaskValidation.refusal_reasons.some((reason) => reason.includes('mask_id must not use SHI')));

const tamperedLedger = JSON.parse(JSON.stringify(packet));
tamperedLedger.sample_ledger[0].wordCount += 1;
const tamperedLedgerValidation = await validateCustomizerPacket(tamperedLedger);
assert.equal(tamperedLedgerValidation.status, 'blocked');
assert.ok(tamperedLedgerValidation.refusal_reasons.some((reason) => reason.includes('sample ledger hash mismatch')));
assert.ok(tamperedLedgerValidation.refusal_reasons.some((reason) => reason.includes('packet hash replay mismatch')));

const tamperedRouting = JSON.parse(JSON.stringify(packet));
tamperedRouting.routing_profile.retrieval_triggers['new-trigger'] = 99;
const tamperedRoutingValidation = await validateCustomizerPacket(tamperedRouting);
assert.equal(tamperedRoutingValidation.status, 'blocked');
assert.ok(tamperedRoutingValidation.refusal_reasons.some((reason) => reason.includes('routing hash mismatch')));

const tamperedRelease = JSON.parse(JSON.stringify(packet));
tamperedRelease.customizer_release_discipline.release_class = 'operator-private';
const tamperedReleaseValidation = await validateCustomizerPacket(tamperedRelease);
assert.equal(tamperedReleaseValidation.status, 'blocked');
assert.ok(tamperedReleaseValidation.refusal_reasons.some((reason) => reason.includes('policy hash mismatch')));

const missingRouting = JSON.parse(JSON.stringify(packet));
delete missingRouting.routing_profile;
const missingRoutingValidation = await validateCustomizerPacket(missingRouting);
assert.equal(missingRoutingValidation.status, 'blocked');
assert.ok(missingRoutingValidation.refusal_reasons.some((reason) => reason.includes('routing_profile is required')));

const tamperedTopologyPacketHash = JSON.parse(JSON.stringify(packet));
tamperedTopologyPacketHash.sample_hash_topology.packet_hash_sha256 = 'sha256:' + 'f'.repeat(64);
const tamperedTopologyPacketHashValidation = await validateCustomizerPacket(tamperedTopologyPacketHash);
assert.equal(tamperedTopologyPacketHashValidation.status, 'blocked');
assert.ok(tamperedTopologyPacketHashValidation.refusal_reasons.some((reason) => reason.includes('topology packet hash replay mismatch')));
assert.ok(tamperedTopologyPacketHashValidation.refusal_reasons.some((reason) => reason.includes('packet hash locations disagree')));

console.log('hush-customizer-packet-validator: ok');
