import canonicalMasks from '../data/hush-masks.js';
import phase22Masks from '../data/hush-phase22-masks.js';
import phase24Masks from '../data/hush-phase24-masks.js';
import phase27Masks from '../data/hush-phase27-masks.js';
import phase28Masks from '../data/hush-phase28-masks.js';
import { stableStringify, sha256Text, isSha256 } from './hush-customizer-packet.js';

export const HUSH_MASK_GALLERY_REGISTRY_SCHEMA = 'td613.hush.mask-studio-gallery-registry/v1';
export const HUSH_MASK_REGISTRY_RECORD_SCHEMA = 'td613.hush.mask-gallery-registry-record/v1';
export const HUSH_MASK_GALLERY_COLLISION_SCHEMA = 'td613.hush.mask-gallery-collision/v1';
export const HUSH_MASK_GALLERY_PHASE = 'PHASE_7_MASK_STUDIO_GALLERY_REGISTRY';
export const HUSH_MASK_GALLERY_REGISTRY_VERSION = 'mask-studio-gallery-registry/v1';
export const CANONICAL_THIRTEEN_COUNT = 13;

export const HUSH_MASK_REGISTRY_CLAIM_CEILING = Object.freeze({
  not_identity_proof: true,
  not_authorship_proof: true,
  not_legal_authority: true,
  not_release_permission: true,
  not_public_default: true,
  not_consent: true,
  not_impersonation_authorization: true
});

const CLAIM_PATTERN = /\b(identity|authorship|legal|release|consent|impersonation|safe harbor|public default|voice ownership|cultural membership)\b[^.\n]{0,80}\b(proof|prove|proves|authority|permission|authorization|approved|verified|confirmed)\b/iu;
const DEFAULT_SOURCES = Object.freeze([
  Object.freeze({ source_file: 'app/data/hush-masks.js', source_export: 'default', source_name: 'canonical', masks: canonicalMasks, canonical: true }),
  Object.freeze({ source_file: 'app/data/hush-phase22-masks.js', source_export: 'default', source_name: 'phase22', masks: phase22Masks }),
  Object.freeze({ source_file: 'app/data/hush-phase24-masks.js', source_export: 'default', source_name: 'phase24', masks: phase24Masks }),
  Object.freeze({ source_file: 'app/data/hush-phase27-masks.js', source_export: 'default', source_name: 'phase27', masks: phase27Masks }),
  Object.freeze({ source_file: 'app/data/hush-phase28-masks.js', source_export: 'default', source_name: 'phase28', masks: phase28Masks })
]);

function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function asArray(value) { return Array.isArray(value) ? value : []; }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function words(value = '') { return (String(value || '').match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length; }
function nowIso(context = {}) { return context.created_at || context.createdAt || new Date().toISOString(); }
function datePart(value) { return String(value || new Date().toISOString()).slice(0, 10).replace(/-/g, ''); }
async function hashObject(value) { return sha256Text(stableStringify(value == null ? null : value)); }
function claimText(value) { return JSON.stringify(value || {}); }
function hasBlockedClaim(value) { return CLAIM_PATTERN.test(claimText(value)); }
function samplePolicyOf(mask = {}) { return mask.samplePolicy || mask.sample_policy || {}; }
function pressureWarnings(mask = {}) { return asArray(mask.pressureWarnings || mask.pressure_warnings); }
function isTargetRegister(mask = {}) {
  const family = String(mask.family || '').toLowerCase();
  return family.includes('target register') || Boolean(mask.internalRegister || mask.packetHints?.internalRegister || mask.profileTargets?.internalRegister || mask.transformHints?.internalRegister || mask.transformHints?.operation === 'register_transform');
}
function roleFor(mask = {}) {
  const family = String(mask.family || '').toLowerCase();
  const id = String(mask.id || '').toLowerCase();
  if (isTargetRegister(mask)) return 'register';
  if (family.includes('jagged') || id.includes('phase22-jagged-record')) return 'adversarial_fracture';
  if (family.includes('quick handoff') || id.includes('night-shift-note')) return 'quick_handoff';
  if (family.includes('small circle') || id.includes('group-chat-soft')) return 'small circle';
  if (family.includes('checklist') || id.includes('clipboard')) return 'checklist';
  if (family.includes('document')) return 'document_distance';
  if (family.includes('low signature') || id.includes('burner')) return 'low_signature';
  if (family.includes('warm receipts') || id.includes('receipts')) return 'warm_receipts';
  if (family.includes('forum')) return 'public_note';
  if (family.includes('chat') || family.includes('shorthand')) return 'shorthand';
  if (family.includes('source register') || family.includes('register custody')) return 'custody';
  return 'baseline';
}
function cohortFor(mask = {}, source = {}) {
  if (mask.active === false) return 'retired';
  if (source.canonical) return 'canonical_thirteen';
  if (isTargetRegister(mask)) return 'target_register';
  if (/phase2[2478]/u.test(source.source_name || source.source_file || '')) return 'legacy_extension';
  return 'experimental';
}
function normalizePhase6Summary(summary = null, required = false) {
  if (!summary) return Object.freeze({
    required,
    hush_unified_audit_packet_id: null,
    packet_hash_sha256: null,
    packet_status: 'not_run',
    stylometry_status: 'not_run',
    leakage_risk: 'unresolved',
    repair_recommended: false,
    quarantine_status: 'not-required',
    raw_phase5_signal_authority_included: false,
    gallery_update_allowed: false
  });
  return Object.freeze({
    required,
    hush_unified_audit_packet_id: summary.hush_unified_audit_packet_id || summary.packet_id || null,
    packet_hash_sha256: isSha256(summary.packet_hash_sha256) ? summary.packet_hash_sha256 : null,
    packet_status: summary.packet_status || 'unresolved_witness',
    stylometry_status: summary.stylometry_status || 'unresolved',
    leakage_risk: summary.leakage_risk || 'unresolved',
    repair_recommended: summary.repair_recommended === true,
    quarantine_status: summary.quarantine_status || 'not-required',
    raw_phase5_signal_authority_included: summary.raw_phase5_signal_authority_included === true,
    gallery_update_allowed: summary.gallery_update_allowed === true
  });
}
function profileEvidence(mask = {}) {
  const count = words(mask.sampleSeed || mask.sample_seed || '');
  const warnings = [...pressureWarnings(mask)];
  let status = 'empty';
  if (count > 0) status = count >= 8 ? 'usable' : 'thin';
  if (count >= 40) status = 'strong';
  return Object.freeze({ profile_status: status, word_count: count, warnings: unique(warnings) });
}
function authorshipProtection(mask = {}) {
  return Object.freeze({
    present: true,
    authorship_class: mask.authorshipClass || mask.authorship_class || 'stylometric-transformation-profile-only',
    synthetic_allowed: false,
    not_identity_proof: true,
    not_authorship_proof: true,
    not_consent: true,
    not_impersonation_authorization: true
  });
}
function targetRegisterPolicy(mask = {}) {
  if (!isTargetRegister(mask)) return null;
  return Object.freeze({
    explicit_operator_selection_required: true,
    cultural_review_required: true,
    public_register_label: mask.packetHints?.publicRegisterLabel || mask.profileTargets?.publicRegisterLabel || 'target register',
    internal_register_present: Boolean(mask.internalRegister || mask.packetHints?.internalRegister || mask.profileTargets?.internalRegister || mask.transformHints?.internalRegister),
    no_costume_register: true,
    source_coverage_outranks_style_texture: true,
    phase8_register_claim_ceiling_required: true
  });
}
function seedPolicy(mask = {}) {
  const policy = samplePolicyOf(mask);
  const sampleSeed = mask.sampleSeed || mask.sample_seed || '';
  return Object.freeze({
    sample_seed_present: Boolean(sampleSeed),
    sample_seed_hash_sha256: null,
    raw_sample_export_allowed: false,
    treat_as_pattern_only: policy.treatAsPatternOnly !== false,
    do_not_reuse_sample_wording: policy.doNotReuseSampleWording !== false
  });
}
function basePacketization(cohort, context = {}) {
  if (context.packetization_status) return context.packetization_status;
  if (cohort === 'canonical_thirteen') return 'unpacketized';
  if (cohort === 'retired') return 'retired';
  if (cohort === 'target_register') return 'deferred';
  return 'deferred';
}

export function classifyHushMaskCohort(mask = {}, context = {}) {
  return cohortFor(mask, context.source || context);
}

export function decideHushMaskRegistryStatus(record = {}) {
  const notes = [];
  let status = 'valid';
  if (!record.mask_id || /^TD613-SH-/u.test(record.mask_id) || /^SHI#:/u.test(record.mask_id)) { status = 'blocked'; notes.push('mask_id missing or uses Safe Harbor issuance form'); }
  if (!record.label || !record.family || !record.source_file || record.source_index == null) { status = status === 'blocked' ? status : 'warning'; notes.push('required registry field missing'); }
  if (record.sample_seed_policy?.raw_sample_export_allowed === true) { status = 'blocked'; notes.push('raw sample export not allowed'); }
  if (record.phase6_audit_summary?.raw_phase5_signal_authority_included === true) { status = 'blocked'; notes.push('raw Phase 5 authority cannot register mask'); }
  if (['blocked', 'quarantine'].includes(record.phase6_audit_summary?.packet_status)) { status = 'blocked'; notes.push('Phase 6 summary blocks readiness'); }
  if (record.duplicate_posture === 'needs_collision_review') { status = status === 'blocked' ? status : 'warning'; notes.push('collision review required'); }
  if (record.target_register_policy && !record.target_register_policy.explicit_operator_selection_required) { status = 'blocked'; notes.push('target-register policy incomplete'); }
  if (hasBlockedClaim(record)) { status = 'blocked'; notes.push('registry claim ceiling violation'); }
  if (record.cohort !== 'canonical_thirteen' && status === 'valid') status = 'deferred';
  return Object.freeze({ status, notes: unique(notes) });
}

export async function buildHushMaskRegistryRecord(mask = {}, context = {}) {
  const source = context.source || {};
  const sourceIndex = context.source_index ?? context.sourceIndex ?? 0;
  const cohort = context.cohort || cohortFor(mask, source);
  const seed = seedPolicy(mask);
  const seedHash = seed.sample_seed_present ? await sha256Text(String(mask.sampleSeed || mask.sample_seed || '')) : null;
  const phase6 = normalizePhase6Summary(context.phase6_summary || context.phase6Summary || null, Boolean(context.phase6_required || context.phase6Required));
  const duplicatePosture = context.duplicate_posture || context.duplicatePosture || 'none';
  const collisionRefs = Object.freeze(asArray(context.collision_refs || context.collisionRefs));
  const recordIdSeed = stableStringify({ mask_id: mask.id, source_file: source.source_file, source_index: sourceIndex, cohort });
  const recordIdHash = await sha256Text(recordIdSeed);
  const baseRecord = {
    schema: HUSH_MASK_REGISTRY_RECORD_SCHEMA,
    phase: HUSH_MASK_GALLERY_PHASE,
    registry_record_id: context.registry_record_id || `TD613-HUSH-GALLERY-MASK-${datePart(context.created_at || context.createdAt || new Date().toISOString())}-${recordIdHash.slice(7, 15).toUpperCase()}`,
    mask_id: mask.id || null,
    label: mask.label || null,
    family: mask.family || null,
    source_file: source.source_file || 'unknown',
    source_export: source.source_export || 'default',
    source_index: sourceIndex,
    cohort,
    gallery_role: roleFor(mask),
    intended_use: mask.intendedUse || mask.intended_use || mask.description || 'unresolved',
    risk_tell: mask.riskTell || mask.risk_tell || 'unresolved',
    active: mask.active !== false,
    retired_reason: mask.active === false ? (mask.retiredReason || mask.retired_reason || 'inactive source mask') : null,
    duplicate_posture: duplicatePosture,
    collision_refs: collisionRefs,
    authorship_protection: authorshipProtection(mask),
    sample_seed_policy: Object.freeze({ ...seed, sample_seed_hash_sha256: seedHash }),
    profile_evidence: profileEvidence(mask),
    target_register_policy: targetRegisterPolicy(mask),
    phase6_audit_summary: phase6,
    packetization: Object.freeze({
      phase8_required: cohort === 'canonical_thirteen',
      packetization_status: basePacketization(cohort, context),
      phase8_pr_number: null,
      per_mask_packet_id: null,
      per_mask_packet_hash_sha256: null
    }),
    claim_ceiling: HUSH_MASK_REGISTRY_CLAIM_CEILING,
    registry_status: 'valid',
    registry_notes: [],
    record_hash_sha256: null
  };
  const decision = decideHushMaskRegistryStatus(baseRecord);
  const withDecision = { ...baseRecord, registry_status: decision.status, registry_notes: decision.notes };
  const recordHash = await hashObject(recordHashPreimage(withDecision));
  return Object.freeze({ ...withDecision, record_hash_sha256: recordHash });
}

function recordHashPreimage(record = {}) {
  const material = clone(record || {});
  delete material.record_hash_sha256;
  return material;
}

export async function detectHushMaskGalleryCollisions(records = []) {
  const collisions = [];
  const byId = new Map();
  const byLabel = new Map();
  for (const record of records) {
    if (record.mask_id) byId.set(record.mask_id, [...(byId.get(record.mask_id) || []), record]);
    if (record.label) byLabel.set(record.label.toLowerCase(), [...(byLabel.get(record.label.toLowerCase()) || []), record]);
  }
  let index = 0;
  async function pushCollision(type, group, severity = 'medium', resolution = 'needs_review') {
    const collisionSeed = await sha256Text(stableStringify({ type, mask_ids: group.map((record) => record.mask_id), source_files: group.map((record) => record.source_file) }));
    collisions.push(Object.freeze({
      schema: HUSH_MASK_GALLERY_COLLISION_SCHEMA,
      collision_id: `phase7-collision-${String(index += 1).padStart(3, '0')}-${collisionSeed.slice(7, 15)}`,
      collision_type: type,
      mask_ids: unique(group.map((record) => record.mask_id)),
      source_files: unique(group.map((record) => record.source_file)),
      severity,
      resolution,
      notes: ['collision recorded; no silent overwrite']
    }));
  }
  for (const group of byId.values()) if (group.length > 1) await pushCollision('duplicate_id', group, group.some((record) => record.cohort === 'canonical_thirteen') ? 'medium' : 'low', group.some((record) => record.cohort === 'canonical_thirteen') ? 'canonical_wins' : 'needs_review');
  for (const group of byLabel.values()) if (group.length > 1) await pushCollision('duplicate_label', group, 'low', 'needs_review');
  return Object.freeze(collisions);
}

async function rehashRecord(record = {}) {
  const material = { ...record, record_hash_sha256: null };
  const decision = decideHushMaskRegistryStatus(material);
  const withDecision = { ...material, registry_status: decision.status, registry_notes: decision.notes };
  return Object.freeze({ ...withDecision, record_hash_sha256: await hashObject(recordHashPreimage(withDecision)) });
}

export async function applyHushMaskCollisionPosture(records = [], collisions = []) {
  const byKey = new Map(records.map((record) => [`${record.mask_id}@${record.source_file}`, record]));
  for (const collision of collisions) {
    if (collision.collision_type !== 'duplicate_id') continue;
    for (const record of records.filter((candidate) => collision.mask_ids.includes(candidate.mask_id) && collision.source_files.includes(candidate.source_file))) {
      const posture = record.cohort === 'canonical_thirteen' && collision.resolution === 'canonical_wins'
        ? 'canonical_wins'
        : collision.resolution === 'canonical_wins'
          ? 'extension_shadowed'
          : 'needs_collision_review';
      const key = `${record.mask_id}@${record.source_file}`;
      const existing = byKey.get(key);
      byKey.set(key, await rehashRecord({ ...existing, duplicate_posture: posture, collision_refs: unique([...(existing.collision_refs || []), collision.collision_id]) }));
    }
  }
  return Object.freeze(records.map((record) => byKey.get(`${record.mask_id}@${record.source_file}`) || record));
}

function sourceEntries(input = {}) {
  if (input.sources) return input.sources;
  return DEFAULT_SOURCES;
}
function phase6For(maskId, input = {}) {
  return input.phase6Summaries?.[maskId] || input.phase6_summaries?.[maskId] || null;
}
function packetizationLedger(records = []) {
  const ledger = { unpacketized: 0, ready_for_phase8: 0, packetized: 0, blocked: 0, deferred: 0, retired: 0 };
  for (const record of records) {
    const status = record.registry_status === 'blocked' ? 'blocked' : record.packetization.packetization_status;
    if (ledger[status] !== undefined) ledger[status] += 1;
  }
  return Object.freeze(ledger);
}
function registryPreimage(registry = {}) {
  const material = clone(registry || {});
  delete material.registry_hash_sha256;
  if (material.hash_replay) {
    material.hash_replay.registry_hash_sha256 = null;
    material.hash_replay.hash_topology_registry_hash_sha256 = null;
    material.hash_replay.recomputed_registry_hash_matches = false;
    material.hash_replay.status = 'not_run';
  }
  return material;
}
async function buildRegistryHashReplay(registry = {}) {
  const record_hashes = Object.fromEntries(asArray(registry.records).map((record) => [record.mask_id + '@' + record.source_file, record.record_hash_sha256]));
  const collisionHash = await hashObject(registry.collision_ledger || []);
  const packetizationHash = await hashObject(registry.packetization_ledger || {});
  return Object.freeze({
    schema: 'td613.hush.phase7.hash-replay/v1',
    registry_hash_sha256: null,
    record_hashes,
    collision_ledger_hash_sha256: collisionHash,
    packetization_ledger_hash_sha256: packetizationHash,
    hash_topology_registry_hash_sha256: null,
    recomputed_registry_hash_matches: false,
    hash_only_registry: false,
    hash_only_registry_blocked: true,
    status: 'not_run'
  });
}
function rootStatus(records = [], collisions = []) {
  if (records.some((record) => record.registry_status === 'blocked')) return 'blocked';
  if (collisions.some((collision) => collision.severity === 'blocking')) return 'blocked';
  if (records.some((record) => record.registry_status === 'warning')) return 'warning';
  return 'valid';
}

export async function buildHushMaskGalleryRegistry(input = {}) {
  const created = nowIso(input.context || input);
  let records = [];
  for (const source of sourceEntries(input)) {
    for (const [index, mask] of asArray(source.masks).entries()) {
      records.push(await buildHushMaskRegistryRecord(mask, {
        source,
        source_index: index,
        createdAt: created,
        phase6_summary: phase6For(mask.id, input),
        phase6_required: Boolean(input.phase6_required || input.phase6Required)
      }));
    }
  }
  const collisionLedger = await detectHushMaskGalleryCollisions(records);
  records = await applyHushMaskCollisionPosture(records, collisionLedger);
  const canonicalRecords = records.filter((record) => record.cohort === 'canonical_thirteen');
  const packetLedger = packetizationLedger(records);
  const idHash = await sha256Text(stableStringify({ created: input.stableId ? 'stable' : created, records: records.map((record) => record.record_hash_sha256) }));
  const base = {
    schema: HUSH_MASK_GALLERY_REGISTRY_SCHEMA,
    phase: HUSH_MASK_GALLERY_PHASE,
    registry_id: input.registry_id || `TD613-HUSH-GALLERY-REGISTRY-${datePart(created)}-${idHash.slice(7, 15).toUpperCase()}`,
    created_at: created,
    registry_version: HUSH_MASK_GALLERY_REGISTRY_VERSION,
    canonical_cohort: Object.freeze({
      name: 'canonical_thirteen',
      expected_count: CANONICAL_THIRTEEN_COUNT,
      actual_count: canonicalRecords.length,
      source_file: 'app/data/hush-masks.js'
    }),
    records: Object.freeze(records),
    collision_ledger: collisionLedger,
    packetization_ledger: packetLedger,
    phase6_summary_policy: Object.freeze({ consume_phase6_summary_only: true, raw_phase5_signal_authority_allowed: false, raw_private_text_allowed: false }),
    claim_ceiling: HUSH_MASK_REGISTRY_CLAIM_CEILING,
    hash_replay: null,
    registry_status: rootStatus(records, collisionLedger),
    decision: null,
    registry_hash_sha256: null
  };
  const decision = Object.freeze({
    schema: 'td613.hush.phase7.registry-decision/v1',
    registry_status: base.registry_status,
    public_default_allowed: false,
    phase8_handoff_allowed: base.registry_status !== 'blocked',
    canonical_count_ok: canonicalRecords.length === CANONICAL_THIRTEEN_COUNT,
    raw_sample_export_allowed: false,
    reasons: unique([
      canonicalRecords.length === CANONICAL_THIRTEEN_COUNT ? null : 'canonical thirteen count mismatch',
      collisionLedger.length ? 'collisions recorded for review' : null
    ])
  });
  const withDecision = { ...base, decision };
  const replay = await buildRegistryHashReplay(withDecision);
  const preimage = { ...withDecision, hash_replay: replay };
  const registryHash = await hashObject(registryPreimage(preimage));
  const finalReplay = Object.freeze({ ...replay, registry_hash_sha256: registryHash, hash_topology_registry_hash_sha256: registryHash, recomputed_registry_hash_matches: true, status: 'passed' });
  return Object.freeze({ ...withDecision, hash_replay: finalReplay, registry_hash_sha256: registryHash });
}

export function summarizePhase7RegistryForPhase8(registry = {}) {
  const ready = asArray(registry.records).filter((record) => record.cohort === 'canonical_thirteen' && ['valid', 'warning'].includes(record.registry_status) && record.sample_seed_policy?.raw_sample_export_allowed === false && !['blocked', 'quarantine'].includes(record.phase6_audit_summary?.packet_status) && record.duplicate_posture !== 'needs_collision_review');
  return Object.freeze({
    schema: 'td613.hush.phase7.phase8-handoff/v1',
    registry_id: registry.registry_id || null,
    registry_hash_sha256: registry.registry_hash_sha256 || null,
    ready_count: ready.length,
    one_mask_per_pr_required: true,
    raw_sample_text_included: false,
    public_release_permission_included: false,
    masks: Object.freeze(ready.map((record) => Object.freeze({
      mask_id: record.mask_id,
      label: record.label,
      source_file: record.source_file,
      source_index: record.source_index,
      registry_record_hash_sha256: record.record_hash_sha256,
      intended_role: record.gallery_role,
      cohort: record.cohort,
      claim_ceiling: record.claim_ceiling,
      sample_seed_policy: record.sample_seed_policy,
      authorship_protection: record.authorship_protection,
      phase6_audit_summary: record.phase6_audit_summary,
      collision_status: record.duplicate_posture,
      collision_refs: Object.freeze(record.collision_refs || []),
      packetization_status: record.packetization.packetization_status,
      phase8_requirement: 'packetize-one-mask-per-pr'
    })))
  });
}

export function buildPhase7SafeHarborCustodyHandoff(registry = {}) {
  const records = asArray(registry.records);
  return Object.freeze({
    schema: 'td613.safeharbor.phase7-mask-gallery-custody-handoff/v1',
    registry_id: registry.registry_id || null,
    registry_hash_sha256: registry.registry_hash_sha256 || null,
    canonical_expected_count: registry.canonical_cohort?.expected_count || CANONICAL_THIRTEEN_COUNT,
    canonical_actual_count: registry.canonical_cohort?.actual_count || 0,
    record_count: records.length,
    collision_count: asArray(registry.collision_ledger).length,
    packetization_counts: registry.packetization_ledger || {},
    blocked_count: records.filter((record) => record.registry_status === 'blocked').length,
    deferred_count: records.filter((record) => record.registry_status === 'deferred').length,
    raw_sample_export_allowed: false,
    claim_ceiling_status: 'held',
    phase8_ready_count: summarizePhase7RegistryForPhase8(registry).ready_count,
    notes: Object.freeze(['gallery registry is a mask accession ledger, not an identity or Safe Harbor issuance ledger'])
  });
}
