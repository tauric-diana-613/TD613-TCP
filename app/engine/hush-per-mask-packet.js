import { stableStringify, sha256Text, isSha256 } from './hush-customizer-packet.js';
import { summarizePhase7RegistryForPhase8 } from './hush-mask-gallery-registry.js';
import { buildPerMaskStylometricCalibration, buildHumanImperfectionLedger } from './hush-mask-stylometric-calibration.js';
import { runMaskAntiSlopAudit } from './hush-anti-slop-audit.js';

export const HUSH_PER_MASK_PACKET_SCHEMA = 'td613.hush.per-mask-packet/v1';
export const HUSH_PER_MASK_PACKET_PHASE = 'PHASE_8_PER_MASK_PACKETIZATION';
export const HUSH_PER_MASK_PACKET_VERSION = 'hush-per-mask-packet/v1-human-stylometric-bench';

export const HUSH_PER_MASK_CLAIM_CEILING = Object.freeze({
  not_identity_proof: true,
  not_authorship_proof: true,
  not_legal_authority: true,
  not_release_permission: true,
  not_public_default: true,
  not_consent: true,
  not_impersonation_authorization: true,
  not_cultural_membership_proof: true,
  not_voice_ownership_proof: true
});

const CLAIM_PATTERN = /\b(identity|authorship|legal|release|consent|impersonation|cultural membership|voice ownership|public default)\b[^.\n]{0,80}\b(proof|prove|proves|authority|permission|authorization|approved|verified|confirmed)\b/iu;
const MASK_PACKET_ID = /^TD613-HUSH-MASK-\d{8}-[A-F0-9]{8}$/u;

function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function asArray(value) { return Array.isArray(value) ? value : []; }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function nowIso(context = {}) { return context.created_at || context.createdAt || new Date().toISOString(); }
function datePart(value) { return String(value || new Date().toISOString()).slice(0, 10).replace(/-/g, ''); }
async function hashObject(value) { return sha256Text(stableStringify(value == null ? null : value)); }
function claimText(value) { return JSON.stringify(value || {}); }
function hasBlockedClaim(value) { return CLAIM_PATTERN.test(claimText(value)); }
function safeHash(value) { return isSha256(value) ? value : null; }

export function isPerMaskPacketId(value) {
  return MASK_PACKET_ID.test(String(value || '').trim());
}

export function getPhase8ReadyMaskQueue(registryOrHandoff = {}, options = {}) {
  const handoff = registryOrHandoff.schema === 'td613.hush.phase7.phase8-handoff/v1'
    ? registryOrHandoff
    : summarizePhase7RegistryForPhase8(registryOrHandoff);
  const blockers = [];
  if (handoff.one_mask_per_pr_required !== true) blockers.push('one mask per PR flag missing');
  if (!isSha256(handoff.registry_hash_sha256)) blockers.push('registry hash missing or malformed');
  if (handoff.raw_sample_text_included === true) blockers.push('raw sample text cannot enter Phase 8 queue');
  if (handoff.public_release_permission_included === true) blockers.push('public release permission cannot enter Phase 8 queue');
  const masks = asArray(handoff.masks).map((mask, index) => {
    const maskBlockers = [];
    if (!mask.mask_id) maskBlockers.push('mask id missing');
    if (!mask.source_file) maskBlockers.push('source file missing');
    if (mask.source_index == null) maskBlockers.push('source index missing');
    if (!isSha256(mask.registry_record_hash_sha256)) maskBlockers.push('registry record hash missing');
    if (mask.sample_seed_policy?.raw_sample_export_allowed === true) maskBlockers.push('raw sample export not allowed');
    if (mask.raw_phase5_signal_authority_included === true || mask.phase6_audit_summary?.raw_phase5_signal_authority_included === true) maskBlockers.push('raw Phase 5 authority cannot enter Phase 8');
    if (mask.collision_status && !['none', 'canonical_wins'].includes(mask.collision_status) && !asArray(mask.collision_refs).length) maskBlockers.push('collision refs required for nontrivial collision posture');
    if (options.includeExtensions !== true && mask.cohort && mask.cohort !== 'canonical_thirteen') maskBlockers.push('extension mask not selected for canonical Phase 8 queue');
    return Object.freeze({ ...mask, queue_index: index, phase8_ready: blockers.length === 0 && maskBlockers.length === 0, queue_blockers: Object.freeze(maskBlockers) });
  });
  return Object.freeze({
    schema: 'td613.hush.phase8.ready-mask-queue/v1',
    registry_id: handoff.registry_id || null,
    registry_hash_sha256: safeHash(handoff.registry_hash_sha256),
    one_mask_per_pr_required: handoff.one_mask_per_pr_required === true,
    raw_sample_text_included: handoff.raw_sample_text_included === true,
    public_release_permission_included: handoff.public_release_permission_included === true,
    queue_blockers: Object.freeze(blockers),
    masks: Object.freeze(masks),
    ready_count: masks.filter((mask) => mask.phase8_ready).length
  });
}

function phase7Ref(maskRef = {}, queue = {}) {
  return Object.freeze({
    registry_id: queue.registry_id || maskRef.registry_id || null,
    registry_hash_sha256: safeHash(queue.registry_hash_sha256 || maskRef.registry_hash_sha256),
    registry_record_hash_sha256: safeHash(maskRef.registry_record_hash_sha256),
    source_file: maskRef.source_file || null,
    source_index: maskRef.source_index ?? null,
    one_mask_per_pr_required: true
  });
}

function collisionPosture(maskRef = {}) {
  const collisionStatus = maskRef.collision_status || 'none';
  return Object.freeze({
    duplicate_posture: collisionStatus,
    collision_status: collisionStatus === 'none' ? 'none' : asArray(maskRef.collision_refs).length ? 'collision-recorded' : collisionStatus === 'canonical_wins' ? 'collision-recorded' : 'needs_review',
    collision_refs: Object.freeze(asArray(maskRef.collision_refs))
  });
}

function sampleSeedPolicy(maskRef = {}) {
  const policy = maskRef.sample_seed_policy || {};
  return Object.freeze({
    sample_seed_present: policy.sample_seed_present === true,
    sample_seed_hash_sha256: safeHash(policy.sample_seed_hash_sha256),
    raw_sample_text_included: false,
    raw_sample_export_allowed: false,
    treat_as_pattern_only: policy.treat_as_pattern_only !== false,
    do_not_reuse_sample_wording: policy.do_not_reuse_sample_wording !== false
  });
}

function authorshipProtection(maskRef = {}) {
  const source = maskRef.authorship_protection || {};
  return Object.freeze({
    stylometric_transformation_profile_only: true,
    not_identity_proof: true,
    not_authorship_proof: true,
    not_consent: true,
    not_impersonation_authorization: true,
    synthetic_allowed: source.synthetic_allowed === true ? false : false
  });
}

function perMaskPreimage(packet = {}) {
  const material = clone(packet || {});
  delete material.packet_hash_sha256;
  if (material.hash_replay) {
    material.hash_replay.packet_hash_sha256 = null;
    material.hash_replay.hash_topology_packet_hash_sha256 = null;
    material.hash_replay.recomputed_packet_hash_matches = false;
    material.hash_replay.status = 'not_run';
  }
  return material;
}

async function sectionHashes(packet = {}) {
  return Object.freeze({
    phase7_registry_ref_hash_sha256: await hashObject(packet.phase7_registry_ref || {}),
    phase6_audit_summary_hash_sha256: await hashObject(packet.phase6_audit_summary || {}),
    collision_posture_hash_sha256: await hashObject(packet.collision_posture || {}),
    authorship_protection_hash_sha256: await hashObject(packet.authorship_protection || {}),
    sample_seed_policy_hash_sha256: await hashObject(packet.sample_seed_policy || {}),
    stylometric_calibration_hash_sha256: await hashObject(packet.stylometric_calibration || {}),
    human_imperfection_ledger_hash_sha256: await hashObject(packet.human_imperfection_ledger || {}),
    anti_slop_audit_hash_sha256: await hashObject(packet.anti_slop_audit || {}),
    claim_ceiling_hash_sha256: await hashObject(packet.claim_ceiling || {})
  });
}

function decidePacketStatus(packet = {}, options = {}) {
  const reasons = [];
  let status = 'calibrated';
  if (packet.sample_seed_policy?.raw_sample_text_included === true || packet.sample_seed_policy?.raw_sample_export_allowed === true) { status = 'blocked'; reasons.push('raw sample text/export blocked'); }
  if (packet.public_default_allowed === true) { status = 'blocked'; reasons.push('public-default blocked in Phase 8'); }
  if (hasBlockedClaim(packet)) { status = 'blocked'; reasons.push('claim ceiling violation'); }
  if (['blocked', 'quarantine'].includes(packet.phase6_audit_summary?.packet_status)) { status = 'blocked'; reasons.push('Phase 6 summary blocks packetization'); }
  if (packet.collision_posture?.collision_status === 'needs_review') { status = status === 'blocked' ? status : 'repair_required'; reasons.push('collision review required'); }
  if (packet.stylometric_calibration?.calibration_status === 'blocked') { status = 'blocked'; reasons.push('calibration blocked'); }
  if (packet.anti_slop_audit?.status === 'blocked') { status = status === 'blocked' ? status : 'repair_required'; reasons.push('anti-slop audit requires repair'); }
  if (options.status === 'draft') status = 'draft';
  if (options.seal === true && status === 'calibrated') status = 'sealed';
  return Object.freeze({ status, reasons: Object.freeze(unique(reasons)) });
}

export async function buildHushPerMaskPacket(maskRef = {}, options = {}) {
  const created = nowIso(options);
  const queue = options.queue || {};
  if (options.assertOneMask !== false && Array.isArray(maskRef)) throw new Error('Phase 8 requires exactly one mask per packet');
  const idSeed = await sha256Text(stableStringify({ created: options.stableId ? 'stable' : created, mask_id: maskRef.mask_id, registry_record_hash_sha256: maskRef.registry_record_hash_sha256 }));
  const maskPacketId = options.mask_packet_id || `TD613-HUSH-MASK-${datePart(created)}-${idSeed.slice(7, 15).toUpperCase()}`;
  const calibration = await buildPerMaskStylometricCalibration(maskRef, options.calibration || {});
  const ledger = await buildHumanImperfectionLedger(maskRef, calibration);
  const antiSlop = await runMaskAntiSlopAudit(options.candidate || options.candidateText || '', calibration, maskRef, options.antiSlop || options.anti_slop || {});
  const base = {
    schema: HUSH_PER_MASK_PACKET_SCHEMA,
    phase: HUSH_PER_MASK_PACKET_PHASE,
    packet_version: HUSH_PER_MASK_PACKET_VERSION,
    mask_packet_id: maskPacketId,
    created_at: created,
    mask_id: maskRef.mask_id || null,
    label: maskRef.label || null,
    source: Object.freeze({
      source_file: maskRef.source_file || null,
      source_index: maskRef.source_index ?? null,
      registry_record_hash_sha256: safeHash(maskRef.registry_record_hash_sha256)
    }),
    phase7_registry_ref: phase7Ref(maskRef, queue),
    phase6_audit_summary: maskRef.phase6_audit_summary || {},
    collision_posture: collisionPosture(maskRef),
    authorship_protection: authorshipProtection(maskRef),
    sample_seed_policy: sampleSeedPolicy(maskRef),
    stylometric_calibration: calibration,
    human_imperfection_ledger: ledger,
    anti_slop_audit: antiSlop,
    claim_ceiling: HUSH_PER_MASK_CLAIM_CEILING,
    hash_replay: null,
    packet_status: 'calibrated',
    public_default_allowed: false,
    raw_sample_text_included: false,
    phase9_handoff: null,
    packet_hash_sha256: null
  };
  const decision = decidePacketStatus(base, options);
  const withStatus = { ...base, packet_status: decision.status, packet_status_reasons: decision.reasons };
  const replayShell = Object.freeze({
    schema: 'td613.hush.phase8.hash-replay/v1',
    packet_hash_sha256: null,
    hash_topology_packet_hash_sha256: null,
    section_hashes: await sectionHashes(withStatus),
    recomputed_packet_hash_matches: false,
    hash_only_packet: false,
    hash_only_packet_blocked: true,
    status: 'not_run'
  });
  const preimage = { ...withStatus, hash_replay: replayShell };
  const packetHash = await hashObject(perMaskPreimage(preimage));
  const finalReplay = Object.freeze({ ...replayShell, packet_hash_sha256: packetHash, hash_topology_packet_hash_sha256: packetHash, recomputed_packet_hash_matches: true, status: 'passed' });
  const phase9 = Object.freeze({
    schema: 'td613.hush.phase8.phase9-handoff/v1',
    mask_packet_id: maskPacketId,
    mask_packet_hash_sha256: packetHash,
    mask_status: decision.status,
    registry_record_hash_sha256: safeHash(maskRef.registry_record_hash_sha256),
    collision_refs: Object.freeze(asArray(maskRef.collision_refs)),
    sample_export_allowed: false,
    public_default_allowed: false,
    ready_for_cross_mask_collision_audit: ['calibrated', 'sealed'].includes(decision.status)
  });
  return Object.freeze({ ...withStatus, hash_replay: finalReplay, phase9_handoff: phase9, packet_hash_sha256: packetHash });
}

export async function replayHushPerMaskPacketHashes(packet = {}) {
  const reasons = [];
  if (!isPerMaskPacketId(packet.mask_packet_id)) reasons.push('mask packet id malformed');
  if (!isSha256(packet.packet_hash_sha256)) reasons.push('packet_hash_sha256 malformed');
  if (!isSha256(packet.hash_replay?.packet_hash_sha256)) reasons.push('hash_replay packet hash malformed');
  if (!isSha256(packet.hash_replay?.hash_topology_packet_hash_sha256)) reasons.push('hash topology packet hash malformed');
  const expectedSections = await sectionHashes(packet);
  const declared = packet.hash_replay?.section_hashes || {};
  for (const [key, expected] of Object.entries(expectedSections)) if (declared[key] !== expected) reasons.push(`${key} mismatch`);
  const expectedPacketHash = await hashObject(perMaskPreimage(packet));
  if (packet.packet_hash_sha256 !== expectedPacketHash) reasons.push('packet hash mismatch');
  if (packet.hash_replay?.packet_hash_sha256 !== expectedPacketHash) reasons.push('hash replay packet hash mismatch');
  if (packet.hash_replay?.hash_topology_packet_hash_sha256 !== expectedPacketHash) reasons.push('hash topology packet hash mismatch');
  const hasOnlyHash = Boolean(packet.packet_hash_sha256) && !packet.mask_id && !packet.stylometric_calibration;
  if (hasOnlyHash) reasons.push('hash-only per-mask packet blocked');
  return Object.freeze({
    schema: 'td613.hush.phase8.hash-replay-result/v1',
    status: reasons.length ? 'failed' : 'passed',
    refusal_reasons: Object.freeze(unique(reasons)),
    expected_packet_hash_sha256: expectedPacketHash,
    hash_only_packet_blocked: true
  });
}

if (typeof window !== 'undefined') {
  window.TD613_HUSH_PER_MASK_PACKET = Object.freeze({ HUSH_PER_MASK_PACKET_SCHEMA, HUSH_PER_MASK_PACKET_PHASE, HUSH_PER_MASK_PACKET_VERSION, HUSH_PER_MASK_CLAIM_CEILING, isPerMaskPacketId, getPhase8ReadyMaskQueue, buildHushPerMaskPacket, replayHushPerMaskPacketHashes });
}
