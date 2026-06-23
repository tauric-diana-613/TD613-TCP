import assert from 'node:assert/strict';
import { buildHushMaskGalleryRegistry, summarizePhase7RegistryForPhase8 } from '../app/engine/hush-mask-gallery-registry.js';
import { buildHushPerMaskPacket } from '../app/engine/hush-per-mask-packet.js';
import { buildHushPerMaskPacketWithMetricPassport, replayHushPerMaskMetricPassportHashes } from '../app/engine/hush-per-mask-metric-passport.js';
import { assertPhase8MetricWrapperEntrypoint } from '../app/engine/hush-phase8-candidate-presence-gate.js';

const registry = await buildHushMaskGalleryRegistry({ stableId: true, createdAt: '2026-06-20T00:00:00Z' });
const handoff = summarizePhase7RegistryForPhase8(registry);
const pixie = handoff.masks.find((mask) => mask.mask_id === 'phase28-transform-to-chatspeak');

const base = await buildHushPerMaskPacket(pixie, { stableId: true, createdAt: '2026-06-20T00:01:00Z' });
const baseAssertion = assertPhase8MetricWrapperEntrypoint(base);
assert.equal(baseAssertion.status, 'blocked');
assert.equal(baseAssertion.metric_wrapper_present, false);
assert.ok(baseAssertion.block_reasons.includes('metric_wrapper_present'));

const wrapped = await buildHushPerMaskPacketWithMetricPassport(pixie, {
  stableId: true,
  createdAt: '2026-06-20T00:02:00Z',
  queue: { registry_id: handoff.registry_id, registry_hash_sha256: handoff.registry_hash_sha256 },
  sourceText: 'FILE-72 has export minute footer mismatch before review.',
  candidate: 'FILE-72 keeps export minute + footer mismatch visible before review.',
  sourceObligation: { derive_source_anchors: false, mandatory_anchors: ['FILE-72', 'export', 'minute', 'footer', 'mismatch', 'review'] }
});
const wrappedAssertion = assertPhase8MetricWrapperEntrypoint(wrapped);
assert.equal(wrappedAssertion.status, 'passed');
assert.equal(wrapped.entrypoint_assertion.status, 'passed');
assert.equal(wrapped.entrypoint_assertion.required_entrypoint, 'buildHushPerMaskPacketWithMetricPassport');
assert.equal(wrapped.entrypoint_assertion.base_packet_builder_allowed_alone, false);
assert.equal(wrapped.candidate_presence_gate.status, 'passed');
assert.ok(wrapped.metric_hash_replay.section_hashes.candidate_presence_gate_hash_sha256.startsWith('sha256:'));
const replay = await replayHushPerMaskMetricPassportHashes(wrapped);
assert.equal(replay.status, 'passed');

console.log('hush-phase8-wrapper-only-entrypoint: ok');
