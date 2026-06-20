import assert from 'node:assert/strict';
import {
  HUSH_CUSTOMIZER_PACKET_SCHEMA,
  HUSH_CUSTOMIZER_PACKET_VERSION,
  buildCustomizerPacket
} from '../app/engine/hush-customizer-packet.js';

function sampleText(index) {
  return `Sample ${index} carries a clear writing cadence with enough structure to measure. It explains one topic through steady clauses, varied sentence length, a few commas, and a clean record of how the sample moves from setup to point. The sample adds another paragraph of ordinary material so the word floor is safely crossed without borrowing any special protected phrase. It keeps the language calm, concrete, and useful for packet tests. This final sentence preserves a distinct discourse trace for the Customizer packet builder while staying redacted after the ledger is built.`;
}

const samples = Array.from({ length: 24 }, (_, index) => ({
  text: sampleText(index + 1),
  promptCategory: index % 3 === 0 ? 'legal-forensic' : index % 3 === 1 ? 'casual' : 'poetic-symbolic',
  contextLabel: index % 2 === 0 ? 'baseline-voice' : 'corrective-repair'
}));

const packet = await buildCustomizerPacket({ label: 'Glitching Cassandra', samples });

assert.equal(packet.schema_version, HUSH_CUSTOMIZER_PACKET_SCHEMA);
assert.equal(packet.packet_version, HUSH_CUSTOMIZER_PACKET_VERSION);
assert.ok(packet.customizer_packet_id.startsWith('TD613-HUSH-CUSTOMIZER-'));
assert.match(packet.packet_hash_sha256, /^sha256:[a-f0-9]{64}$/);
assert.match(packet.hash_topology.sample_ledger_hash_sha256, /^sha256:[a-f0-9]{64}$/);
assert.equal(packet.private_text_policy.sample_text_exported, false);
assert.equal(packet.sample_ledger.every((sample) => sample.text === null && sample.text_included === false), true);
assert.equal(packet.sample_ledger.every((sample) => /^sha256:[a-f0-9]{64}$/i.test(sample.text_hash)), true);
assert.equal(packet.corpus_readiness.status, 'operational');
assert.equal(packet.customizer_release_discipline.release_class, 'operational-local');
assert.ok(packet.routing_profile.discourse_modes['legal-forensic'] > 0);
assert.ok(packet.routing_profile.retrieval_triggers['corrective-repair'] > 0);
assert.equal(packet.claim_limits.not_identity_proof, true);

const legacy = await buildCustomizerPacket({ label: 'Legacy Migration', samples: [{ text: sampleText(99), sampleCategory: 'technical', contextLabel: 'scene-note' }] });
assert.equal(legacy.sample_ledger[0].discourse_mode, 'technical-operational');
assert.equal(legacy.sample_ledger[0].retrieval_trigger, 'scene-note');

console.log('hush-customizer-packet: ok');
