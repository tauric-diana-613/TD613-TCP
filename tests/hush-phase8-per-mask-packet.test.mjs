import assert from 'node:assert/strict';
import { buildHushMaskGalleryRegistry, summarizePhase7RegistryForPhase8 } from '../app/engine/hush-mask-gallery-registry.js';
import {
  HUSH_PER_MASK_PACKET_SCHEMA,
  HUSH_PER_MASK_PACKET_PHASE,
  buildHushPerMaskPacket,
  getPhase8ReadyMaskQueue,
  isPerMaskPacketId,
  replayHushPerMaskPacketHashes
} from '../app/engine/hush-per-mask-packet.js';

const H = 'sha256:' + 'e'.repeat(64);

const registry = await buildHushMaskGalleryRegistry({ stableId: true, createdAt: '2026-06-20T00:10:00Z' });
const handoff = summarizePhase7RegistryForPhase8(registry);
const queue = getPhase8ReadyMaskQueue(handoff);
const mask = queue.masks[0];
const packet = await buildHushPerMaskPacket(mask, { stableId: true, createdAt: '2026-06-20T00:11:00Z', queue });

assert.equal(packet.schema, HUSH_PER_MASK_PACKET_SCHEMA);
assert.equal(packet.phase, HUSH_PER_MASK_PACKET_PHASE);
assert.equal(isPerMaskPacketId(packet.mask_packet_id), true);
assert.equal(packet.mask_id, mask.mask_id);
assert.equal(packet.label, mask.label);
assert.equal(packet.source.source_file, mask.source_file);
assert.equal(packet.source.source_index, mask.source_index);
assert.equal(packet.source.registry_record_hash_sha256, mask.registry_record_hash_sha256);
assert.equal(packet.phase7_registry_ref.registry_hash_sha256, queue.registry_hash_sha256);
assert.equal(packet.sample_seed_policy.raw_sample_text_included, false);
assert.equal(packet.sample_seed_policy.raw_sample_export_allowed, false);
assert.equal(packet.sample_seed_policy.treat_as_pattern_only, true);
assert.equal(packet.sample_seed_policy.do_not_reuse_sample_wording, true);
assert.ok(packet.sample_seed_policy.sample_seed_hash_sha256.startsWith('sha256:'));
assert.equal(packet.authorship_protection.stylometric_transformation_profile_only, true);
assert.equal(packet.authorship_protection.not_identity_proof, true);
assert.equal(packet.public_default_allowed, false);
assert.equal(packet.raw_sample_text_included, false);
assert.equal(packet.packet_status, 'calibrated');
assert.equal(packet.hash_replay.status, 'passed');
assert.equal(packet.hash_replay.hash_only_packet_blocked, true);
assert.equal(packet.hash_replay.packet_hash_sha256, packet.packet_hash_sha256);
assert.equal(packet.hash_replay.hash_topology_packet_hash_sha256, packet.packet_hash_sha256);
assert.equal(packet.phase9_handoff.sample_export_allowed, false);
assert.equal(packet.phase9_handoff.public_default_allowed, false);
assert.equal(packet.phase9_handoff.ready_for_cross_mask_collision_audit, true);

const replay = await replayHushPerMaskPacketHashes(packet);
assert.equal(replay.status, 'passed');
assert.equal(replay.hash_only_packet_blocked, true);

const hashOnly = await replayHushPerMaskPacketHashes({ packet_hash_sha256: H });
assert.equal(hashOnly.status, 'failed');
assert.ok(hashOnly.refusal_reasons.some((reason) => reason.includes('hash-only')));

const blockedPacket = await buildHushPerMaskPacket({ ...mask, phase6_audit_summary: { packet_status: 'blocked' } }, { stableId: true, createdAt: '2026-06-20T00:12:00Z', queue });
assert.equal(blockedPacket.packet_status, 'blocked');
assert.ok(blockedPacket.packet_status_reasons.some((reason) => reason.includes('Phase 6')));
assert.equal(blockedPacket.phase9_handoff.ready_for_cross_mask_collision_audit, false);

const collisionPacket = await buildHushPerMaskPacket({ ...mask, collision_status: 'needs_collision_review', collision_refs: [] }, { stableId: true, createdAt: '2026-06-20T00:13:00Z', queue });
assert.equal(collisionPacket.packet_status, 'repair_required');
assert.ok(collisionPacket.packet_status_reasons.some((reason) => reason.includes('collision')));

await assert.rejects(() => buildHushPerMaskPacket([mask], { stableId: true }), /exactly one mask/);

console.log('hush-phase8-per-mask-packet: ok');
