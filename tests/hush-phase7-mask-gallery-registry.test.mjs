import assert from 'node:assert/strict';
import canonicalMasks from '../app/data/hush-masks.js';
import {
  CANONICAL_THIRTEEN_COUNT,
  HUSH_MASK_GALLERY_REGISTRY_SCHEMA,
  HUSH_MASK_GALLERY_PHASE,
  buildHushMaskGalleryRegistry,
  summarizePhase7RegistryForPhase8,
  buildPhase7SafeHarborCustodyHandoff,
  replayHushMaskGalleryRegistryHashes
} from '../app/engine/hush-mask-gallery-registry.js';

const H = 'sha256:' + 'd'.repeat(64);

function phase6(status = 'clean', extras = {}) {
  return {
    hush_unified_audit_packet_id: 'hush-audit-20260620-abcdef12',
    packet_hash_sha256: H,
    packet_status: status,
    stylometry_status: status === 'clean' ? 'pass' : status === 'warned' ? 'warn' : 'block',
    leakage_risk: status === 'clean' ? 'low' : 'unresolved',
    repair_recommended: status === 'repair_required',
    quarantine_status: status === 'quarantine' ? 'required' : 'not-required',
    gallery_update_allowed: status === 'clean' || status === 'warned',
    raw_phase5_signal_authority_included: false,
    ...extras
  };
}

const registry = await buildHushMaskGalleryRegistry({ stableId: true, createdAt: '2026-06-20T00:00:00Z' });
assert.equal(registry.schema, HUSH_MASK_GALLERY_REGISTRY_SCHEMA);
assert.equal(registry.phase, HUSH_MASK_GALLERY_PHASE);
assert.equal(registry.canonical_cohort.expected_count, CANONICAL_THIRTEEN_COUNT);
assert.equal(registry.canonical_cohort.actual_count, 13);
assert.ok(registry.records.length > 13);
assert.equal(registry.packetization_ledger.unpacketized, 13);
assert.ok(registry.packetization_ledger.deferred > 0);
assert.equal(registry.phase6_summary_policy.consume_phase6_summary_only, true);
assert.equal(registry.phase6_summary_policy.raw_phase5_signal_authority_allowed, false);
assert.equal(registry.phase6_summary_policy.raw_private_text_allowed, false);
assert.equal(registry.decision.public_default_allowed, false);

const canonical = registry.records.filter((record) => record.cohort === 'canonical_thirteen');
assert.equal(canonical.length, 13);
for (const [index, record] of canonical.entries()) {
  assert.equal(record.source_file, 'app/data/hush-masks.js');
  assert.equal(record.source_index, index);
  assert.ok(record.mask_id);
  assert.ok(record.label);
  assert.ok(record.family);
  assert.ok(record.intended_use);
  assert.ok(record.risk_tell);
  assert.equal(record.packetization.packetization_status, 'unpacketized');
  assert.equal(record.sample_seed_policy.raw_sample_export_allowed, false);
  assert.equal(record.sample_seed_policy.treat_as_pattern_only, true);
  assert.equal(record.sample_seed_policy.do_not_reuse_sample_wording, true);
  assert.equal(record.authorship_protection.present, true);
  assert.equal(record.authorship_protection.synthetic_allowed, false);
  assert.ok(record.record_hash_sha256.startsWith('sha256:'));
}

const extensions = registry.records.filter((record) => record.cohort !== 'canonical_thirteen');
assert.ok(extensions.length >= 1);
assert.ok(extensions.every((record) => ['deferred', 'blocked'].includes(record.registry_status) || record.cohort === 'retired'));
assert.ok(extensions.every((record) => record.packetization.packetization_status === 'deferred' || record.packetization.packetization_status === 'retired'));

const duplicateIds = registry.collision_ledger.filter((collision) => collision.collision_type === 'duplicate_id');
assert.ok(duplicateIds.length >= 1);
assert.ok(duplicateIds.some((collision) => collision.mask_ids.includes('phase28-transform-to-aave')));
assert.ok(registry.records.some((record) => record.mask_id === 'phase28-transform-to-aave' && record.source_file === 'app/data/hush-masks.js'));
assert.ok(registry.records.some((record) => record.mask_id === 'phase28-transform-to-aave' && record.source_file === 'app/data/hush-phase28-masks.js'));

const targetRegister = registry.records.find((record) => record.mask_id === 'phase28-transform-to-aave' && record.source_file === 'app/data/hush-masks.js');
assert.equal(targetRegister.target_register_policy.explicit_operator_selection_required, true);
assert.equal(targetRegister.target_register_policy.cultural_review_required, true);
assert.equal(targetRegister.target_register_policy.no_costume_register, true);

const phase6Registry = await buildHushMaskGalleryRegistry({
  stableId: true,
  createdAt: '2026-06-20T00:10:00Z',
  phase6Summaries: {
    [canonicalMasks[0].id]: phase6('blocked'),
    [canonicalMasks[1].id]: phase6('quarantine'),
    [canonicalMasks[2].id]: phase6('clean'),
    [canonicalMasks[3].id]: phase6('warned'),
    [canonicalMasks[4].id]: phase6('clean', { raw_phase5_signal_authority_included: true })
  }
});
const blocked = phase6Registry.records.find((record) => record.mask_id === canonicalMasks[0].id && record.source_file === 'app/data/hush-masks.js');
const quarantined = phase6Registry.records.find((record) => record.mask_id === canonicalMasks[1].id && record.source_file === 'app/data/hush-masks.js');
const cleanSummary = phase6Registry.records.find((record) => record.mask_id === canonicalMasks[2].id && record.source_file === 'app/data/hush-masks.js');
const warnedSummary = phase6Registry.records.find((record) => record.mask_id === canonicalMasks[3].id && record.source_file === 'app/data/hush-masks.js');
const rawPhase5 = phase6Registry.records.find((record) => record.mask_id === canonicalMasks[4].id && record.source_file === 'app/data/hush-masks.js');
assert.equal(blocked.registry_status, 'blocked');
assert.equal(quarantined.registry_status, 'blocked');
assert.equal(cleanSummary.phase6_audit_summary.packet_status, 'clean');
assert.notEqual(cleanSummary.registry_status, 'blocked');
assert.equal(warnedSummary.phase6_audit_summary.packet_status, 'warned');
assert.notEqual(warnedSummary.registry_status, 'blocked');
assert.equal(rawPhase5.registry_status, 'blocked');

const phase8 = summarizePhase7RegistryForPhase8(registry);
assert.equal(phase8.one_mask_per_pr_required, true);
assert.equal(phase8.raw_sample_text_included, false);
assert.equal(phase8.public_release_permission_included, false);
assert.equal(phase8.ready_count, 13);
assert.ok(phase8.masks.every((mask) => mask.source_file === 'app/data/hush-masks.js'));
assert.ok(phase8.masks.every((mask) => mask.sample_seed_policy.raw_sample_export_allowed === false));

const safeHarbor = buildPhase7SafeHarborCustodyHandoff(registry);
assert.equal(safeHarbor.schema, 'td613.safeharbor.phase7-mask-gallery-custody-handoff/v1');
assert.equal(safeHarbor.custody_facts_only, true);
assert.equal(safeHarbor.raw_sample_export_allowed, false);
assert.equal(safeHarbor.canonical_actual_count, 13);
assert.equal(safeHarbor.phase8_ready_count, 13);

const replay = await replayHushMaskGalleryRegistryHashes(registry);
assert.equal(replay.status, 'passed');
assert.equal(replay.hash_only_registry_blocked, true);

const hashOnly = await replayHushMaskGalleryRegistryHashes({ registry_hash_sha256: H });
assert.equal(hashOnly.status, 'failed');
assert.ok(hashOnly.refusal_reasons.some((reason) => reason.includes('hash-only registry')));

console.log('hush-phase7-mask-gallery-registry: ok');
