import assert from 'node:assert/strict';
import { buildCustomizerPacket, isSha256 } from '../app/engine/hush-customizer-packet.js';

const sampleText = 'This is a deliberately long Hush Customizer sample with enough structure to pass the seventy five word floor. It contains several sentence shapes, a little pressure, and enough ordinary language to produce a stylometric ledger. The point is not beauty. The point is architecture. This sample should be measured, hashed, redacted, and placed into the Customizer packet without leaking the raw corpus text into the public export path.';

const samples = Array.from({ length: 24 }, (_, index) => ({
  text: `${sampleText} Sample number ${index + 1} adds a small variation so every hash has separate material.`,
  discourseMode: index % 2 ? 'legal-forensic' : 'casual-conversational',
  retrievalTrigger: index % 3 ? 'baseline-voice' : 'corrective-repair'
}));

const packet = await buildCustomizerPacket({ id: 'custom-test-mask', label: 'Test Mask', samples }, { stableId: true, updatedAt: '2026-06-20T00:00:00Z' });

assert.equal(packet.schema_version, 'td613.hush.customizer-packet/v1');
assert.equal(packet.packet_class, 'local-stylometric-mask-corpus');
assert.ok(packet.customizer_packet_id.startsWith('TD613-HUSH-CUSTOMIZER-20260620-'));
assert.equal(isSha256(packet.packet_hash_sha256), true);
assert.equal(isSha256(packet.sample_hash_topology.sample_ledger_hash_sha256), true);
assert.equal(isSha256(packet.sample_hash_topology.profile_hash_sha256), true);
assert.equal(packet.sample_ledger.length, 24);
assert.equal(packet.sample_ledger[0].text, null);
assert.equal(packet.sample_ledger[0].text_included, false);
assert.equal(packet.sample_ledger[0].raw_text_exported, false);
assert.equal(isSha256(packet.sample_ledger[0].text_hash_sha256), true);
assert.equal(packet.private_text_policy.sample_text_exported, false);
assert.equal(packet.private_text_policy.raw_samples_local_only, true);
assert.equal(packet.corpus_readiness.status, 'operational');
assert.equal(packet.customizer_release_discipline.release_class, 'operational-local');
assert.ok(packet.routing_profile.discourse_modes['legal-forensic']);
assert.ok(packet.routing_profile.retrieval_triggers['baseline-voice']);
assert.equal(packet.claim_limits.not_identity_proof, true);
assert.equal(packet.ontology_profile.style_permissions.impersonation_allowed, false);

console.log('hush-customizer-packet: ok');
