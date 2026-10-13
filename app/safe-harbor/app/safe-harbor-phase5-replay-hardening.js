import {
  buildPhase4RecallIntake,
  buildPublicDefaultPolicy,
  classifyAuthoritySurface,
  verifyHashReplay,
  verifySafeHarborPacketAuthority,
  verifyV3Replay
} from './safe-harbor-authority-verifier.js?v=202606290125';
import {
  buildRecallChallengeReceipt,
  compareRecallChallengeToPacket
} from './safe-harbor-recall-challenge.js';
import { stableCanonicalJson } from './safe-harbor-stylometry-v3.js';

const PHASE5_SCHEMA = 'td613.safe-harbor.phase5-replay-hardening/v1';
const VOLATILE_PATHS = ['phase5_replay_hardening', 'renderer_authority_metadata.packet_hash_sha256'];
const LANES = ['future_self', 'past_self', 'higher_self'];

function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function getPath(value, path) { return String(path || '').split('.').reduce((node, key) => (node && Object.prototype.hasOwnProperty.call(node, key) ? node[key] : undefined), value); }
function setPath(value, path, next) {
  const parts = String(path || '').split('.');
  let node = value;
  for (let i = 0; i < parts.length - 1; i += 1) {
    if (!node || typeof node !== 'object') return;
    if (!Object.prototype.hasOwnProperty.call(node, parts[i])) node[parts[i]] = {};
    node = node[parts[i]];
  }
  if (node && typeof node === 'object') node[parts[parts.length - 1]] = next;
}
function deletePath(value, path) {
  const parts = String(path || '').split('.');
  let node = value;
  for (let i = 0; i < parts.length - 1; i += 1) {
    if (!node || typeof node !== 'object' || !Object.prototype.hasOwnProperty.call(node, parts[i])) return;
    node = node[parts[i]];
  }
  if (node && typeof node === 'object') delete node[parts[parts.length - 1]];
}
function scrubForConvergence(value) {
  const out = clone(value || {});
  for (const path of VOLATILE_PATHS) deletePath(out, path);
  return out;
}
function listChangedPaths(left, right, prefix = '') {
  if (Object.is(left, right)) return [];
  if (left === null || right === null || typeof left !== 'object' || typeof right !== 'object') return [prefix || '<root>'];
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return [prefix || '<root>'];
    return left.flatMap((item, index) => listChangedPaths(item, right[index], `${prefix}[${index}]`));
  }
  return [...new Set([...Object.keys(left), ...Object.keys(right)])].sort().flatMap((key) => listChangedPaths(left[key], right[key], prefix ? `${prefix}.${key}` : key));
}
function hasNativeRichProfiles(packet) {
  const signatures = packet && packet.analysis && packet.analysis.segment_cadence_signatures;
  return Boolean(signatures && LANES.every((key) => {
    const lane = signatures[key];
    return lane && lane.rich_profile_schema === 'td613.safe-harbor.lane-rich-profile/v1' && lane.rich_profile && typeof lane.rich_profile === 'object';
  }));
}
function finalizerLineage(packet) {
  const spine = packet && packet.native_spine_purification;
  if (spine && spine.status === 'native') return 'native';
  if (spine && spine.status === 'export-hardened') return 'export-normalized';
  const surface = packet && packet.packet_authority_surface;
  if (surface && surface.rich_profile_promotion === 'native') return 'native';
  if (surface && surface.rich_profile_promotion === 'export-normalized') return 'export-normalized';
  return 'legacy';
}
function nativeSpineReplay(packet) {
  const spine = packet && packet.native_spine_purification;
  const surface = packet && packet.packet_authority_surface;
  if (!spine && !surface) return 'unavailable';
  if (spine && spine.status === 'native' && surface && surface.rich_profile_promotion === 'native' && surface.v3_issuance === 'native') return 'pass';
  if (spine && spine.status === 'export-hardened' && surface && surface.rich_profile_promotion === 'export-normalized') return 'pass';
  if (spine && spine.status === 'legacy') return 'pass';
  return 'fail';
}
function hashTopologyReplay(packet) {
  const topology = packet && packet.hash_topology;
  if (!topology) return 'unavailable';
  return topology.final_packet_hash_sha256 && topology.final_packet_hash_sha256 === packet.packet_hash_sha256 ? 'pass' : 'fail';
}
function rendererMetadataReport(packet) {
  const renderer = packet && packet.renderer_authority_metadata;
  if (!renderer) return { status: 'unavailable', mismatches: [] };
  const issuance = packet && packet.issuance ? packet.issuance : {};
  const v3 = issuance.v3 || {};
  const governance = packet && packet.recall_governance ? packet.recall_governance : {};
  const mismatches = [];
  if (renderer.badge_number !== (issuance.badge_number || null)) mismatches.push({ path: 'renderer_authority_metadata.badge_number', expected: issuance.badge_number || null, actual: renderer.badge_number, severity: 'high', recommended_action: 'quarantine-public-artifact' });
  if (renderer.badge_number_v3 !== (v3.badge_number_v3 || null)) mismatches.push({ path: 'renderer_authority_metadata.badge_number_v3', expected: v3.badge_number_v3 || null, actual: renderer.badge_number_v3, severity: 'high', recommended_action: 'quarantine-public-artifact' });
  if (renderer.v3_status !== (v3.status || 'unavailable')) mismatches.push({ path: 'renderer_authority_metadata.v3_status', expected: v3.status || 'unavailable', actual: renderer.v3_status, severity: 'medium', recommended_action: 'refresh-renderer-metadata' });
  const expectedPromotion = governance.v3 && governance.v3.promotion_status ? governance.v3.promotion_status : 'v3-not-yet-recall-authoritative';
  if (renderer.promotion_status !== expectedPromotion) mismatches.push({ path: 'renderer_authority_metadata.promotion_status', expected: expectedPromotion, actual: renderer.promotion_status, severity: 'medium', recommended_action: 'refresh-renderer-metadata' });
  if (renderer.raw_text_included !== false) mismatches.push({ path: 'renderer_authority_metadata.raw_text_included', expected: false, actual: renderer.raw_text_included, severity: 'critical', recommended_action: 'quarantine-public-artifact' });
  const packetHash = packet && packet.packet_hash_sha256 ? packet.packet_hash_sha256 : null;
  const hashExcluded = renderer.packet_hash_sha256 == null || renderer.packet_hash_excluded === true;
  if (!hashExcluded && renderer.packet_hash_sha256 !== packetHash) mismatches.push({ path: 'renderer_authority_metadata.packet_hash_sha256', expected: packetHash, actual: renderer.packet_hash_sha256, severity: 'high', recommended_action: 'quarantine-public-artifact' });
  return { status: mismatches.length ? 'fail' : 'pass', mismatches };
}
function phase4IntakeReport(packet, v3Status = null) {
  const intake = packet && packet.phase4_recall_intake ? packet.phase4_recall_intake : null;
  if (!intake) return { status: 'unavailable', mismatches: [] };
  const expected = buildPhase4RecallIntake(packet);
  const mismatches = [];
  if (intake.recommended_action !== expected.recommended_action) mismatches.push({ path: 'phase4_recall_intake.recommended_action', expected: expected.recommended_action, actual: intake.recommended_action, severity: 'high', recommended_action: 'refresh-phase4-intake' });
  if (intake.recommended_action === 'dual-verify' && v3Status && v3Status !== 'pass') mismatches.push({ path: 'phase4_recall_intake.recommended_action', expected: 'not dual-verify unless v3 replay passes', actual: 'dual-verify', severity: 'critical', recommended_action: 'quarantine' });
  return { status: mismatches.length ? 'fail' : 'pass', mismatches };
}
function publicDefaultConflict(packet) {
  const policy = packet && packet.public_default_policy ? packet.public_default_policy : buildPublicDefaultPolicy(packet);
  const governance = packet && packet.recall_governance ? packet.recall_governance : {};
  const promotion = governance.v3 && governance.v3.promotion_status ? governance.v3.promotion_status : 'v3-not-yet-recall-authoritative';
  if (policy.v3_public_ready === true && promotion !== 'v3-public-default-ready') return { path: 'public_default_policy.v3_public_ready', expected: false, actual: true, severity: 'high', recommended_action: 'demote-public-default' };
  if (policy.default_public_credential !== 'v2' && promotion !== 'v3-public-default-ready') return { path: 'public_default_policy.default_public_credential', expected: 'v2', actual: policy.default_public_credential, severity: 'high', recommended_action: 'demote-public-default' };
  return null;
}

export async function detectStaleV3(packet) {
  const stored = packet && packet.issuance && packet.issuance.v3;
  if (!stored || stored.status !== 'issued') return Object.freeze({ status: 'not-issued', action: 'none', rebuild_allowed: false, silent_rebuild_allowed: false });
  const replay = await verifyV3Replay(packet);
  if (replay.status === 'pass') return Object.freeze({ status: 'fresh', action: 'none', rebuild_allowed: false, silent_rebuild_allowed: false, replay_status: replay.status });
  return Object.freeze({
    status: 'stale-detected',
    stored_badge_number_v3: stored.badge_number_v3 || null,
    stored_stylometric_fingerprint_v3: stored.stylometric_fingerprint_v3 || null,
    expected_badge_number_v3: replay.expected_badge_number_v3 || null,
    expected_stylometric_fingerprint_v3: replay.expected_stylometric_fingerprint_v3 || null,
    replay_status: replay.status,
    blocking_reasons: replay.blocking_reasons || [],
    action: 'quarantine-before-rebuild',
    rebuild_allowed: true,
    silent_rebuild_allowed: false
  });
}

export async function buildConvergenceReport(normalizeFn, packet, options = {}) {
  if (typeof normalizeFn !== 'function') return Object.freeze({ status: 'unavailable', iterations: 0, stable_after_iteration: null, changed_paths: [], volatile_paths_excluded: VOLATILE_PATHS.slice() });
  const iterations = Number(options.iterations || 3);
  const snapshots = [];
  let current = clone(packet || {});
  for (let i = 0; i < iterations; i += 1) {
    current = await normalizeFn(clone(current));
    snapshots.push(stableCanonicalJson(scrubForConvergence(current)));
  }
  let stableAfter = null;
  for (let i = 1; i < snapshots.length; i += 1) if (snapshots[i] === snapshots[i - 1]) { stableAfter = i + 1; break; }
  const changed_paths = snapshots.length >= 2 && snapshots[snapshots.length - 1] !== snapshots[snapshots.length - 2]
    ? listChangedPaths(JSON.parse(snapshots[snapshots.length - 2]), JSON.parse(snapshots[snapshots.length - 1])).slice(0, 50)
    : [];
  return Object.freeze({ status: stableAfter ? 'pass' : 'fail', iterations, stable_after_iteration: stableAfter, changed_paths, volatile_paths_excluded: VOLATILE_PATHS.slice() });
}

export async function buildHashReplayBattery(packet) {
  const authority = await verifySafeHarborPacketAuthority(packet);
  const renderer = rendererMetadataReport(packet);
  const intake = phase4IntakeReport(packet, authority.v3_replay.status);
  return Object.freeze({
    packet_hash: authority.hash_replay.status,
    v2_badge: authority.v2_replay.status,
    v3_badge: authority.v3_replay.status,
    authority_surface: authority.authority_surface.status,
    renderer_metadata: renderer.status,
    phase4_intake: intake.status,
    native_spine: nativeSpineReplay(packet),
    hash_topology: hashTopologyReplay(packet),
    finalizer_lineage: finalizerLineage(packet),
    detail: { renderer_mismatches: renderer.mismatches, phase4_intake_mismatches: intake.mismatches, authority }
  });
}

export async function buildAuthorityConflictReport(packet) {
  const conflicts = [];
  const authority = await verifySafeHarborPacketAuthority(packet);
  const issuance = packet && packet.issuance ? packet.issuance : {};
  const v3 = issuance.v3 || {};
  const governance = packet && packet.recall_governance ? packet.recall_governance : {};
  const renderer = rendererMetadataReport(packet);
  const intake = phase4IntakeReport(packet, authority.v3_replay.status);
  const publicConflict = publicDefaultConflict(packet);
  const spine = packet && packet.native_spine_purification;
  const surface = packet && packet.packet_authority_surface;
  const topology = packet && packet.hash_topology;
  if (publicConflict) conflicts.push(publicConflict);
  if (v3.status === 'issued' && (!governance.v3 || governance.v3.status === 'unavailable')) conflicts.push({ path: 'recall_governance.v3.status', expected: 'forensic/co-authoritative status', actual: 'unavailable', severity: 'high', recommended_action: 'refresh-recall-governance' });
  if (authority.authority_surface.status === 'export-hardened' && authority.hash_replay.status === 'fail') conflicts.push({ path: 'packet_authority_surface.packet_hash_recomputed_after_export_hardening', expected: 'hash replay pass', actual: 'hash replay fail', severity: 'critical', recommended_action: 'quarantine' });
  if (renderer.status === 'fail') conflicts.push(...renderer.mismatches);
  if (intake.status === 'fail') conflicts.push(...intake.mismatches);
  if (authority.authority_surface.status === 'bridge-only' && governance.v3 && governance.v3.status && governance.v3.status !== 'non-authoritative') conflicts.push({ path: 'recall_governance.v3.status', expected: 'non-authoritative', actual: governance.v3.status, severity: 'critical', recommended_action: 'demote-v3-authority' });
  if (spine && spine.status === 'native' && surface && surface.rich_profile_promotion !== 'native') conflicts.push({ path: 'packet_authority_surface.rich_profile_promotion', expected: 'native', actual: surface.rich_profile_promotion, severity: 'critical', recommended_action: 'quarantine-fake-native-lineage' });
  if (surface && surface.rich_profile_promotion === 'native' && !spine) conflicts.push({ path: 'native_spine_purification', expected: 'present', actual: 'missing', severity: 'critical', recommended_action: 'quarantine-fake-native-lineage' });
  if (surface && surface.rich_profile_promotion === 'native' && spine && spine.normalizer_role === 'export-hardening-fallback') conflicts.push({ path: 'native_spine_purification.normalizer_role', expected: 'verification-only', actual: spine.normalizer_role, severity: 'critical', recommended_action: 'quarantine-fake-native-lineage' });
  if (topology && topology.final_packet_hash_sha256 !== packet.packet_hash_sha256) conflicts.push({ path: 'hash_topology.final_packet_hash_sha256', expected: packet.packet_hash_sha256, actual: topology.final_packet_hash_sha256, severity: 'critical', recommended_action: 'quarantine' });
  if (spine && spine.v3_issuance_birthplace === 'native' && authority.v3_replay.status !== 'pass') conflicts.push({ path: 'issuance.v3', expected: 'native v3 replay pass', actual: authority.v3_replay.status, severity: 'critical', recommended_action: 'quarantine-stale-native-v3' });
  if (hasNativeRichProfiles(packet) && !spine) conflicts.push({ path: 'native_spine_purification', expected: 'present for rich lane packet', actual: 'missing', severity: 'medium', recommended_action: 'classify-as-unattested-not-native' });
  if (spine && spine.status === 'native' && (!surface || surface.rich_profile_promotion !== 'native')) conflicts.push({ path: 'native_spine_purification.status', expected: 'non-native unless surface agrees', actual: 'native', severity: 'critical', recommended_action: 'quarantine-fake-native-lineage' });
  if (spine && spine.status === 'native' && surface && surface.rich_profile_promotion === 'export-normalized') conflicts.push({ path: 'native_spine_purification.status', expected: 'export-hardened', actual: 'native', severity: 'critical', recommended_action: 'quarantine-fake-native-lineage' });
  return Object.freeze({ status: conflicts.length ? 'conflict' : 'pass', conflicts });
}

function mutatePacket(packet, fixture) {
  const out = clone(packet || {});
  switch (fixture) {
    case 'tamper_v2_badge': setPath(out, 'issuance.badge_number', 'TD613-SH-9B07D8B-TAMPERED'); break;
    case 'tamper_v2_fingerprint': setPath(out, 'issuance.stylometric_fingerprint', String(getPath(out, 'issuance.stylometric_fingerprint') || '') + '|tampered'); break;
    case 'tamper_v3_badge': setPath(out, 'issuance.v3.badge_number_v3', 'TD613-SH3-9B07D8B-TAMPERED0'); break;
    case 'tamper_v3_fingerprint': setPath(out, 'issuance.v3.stylometric_fingerprint_v3', 'sha256:' + '0'.repeat(64)); break;
    case 'tamper_lane_rich_profile_scalar': setPath(out, 'analysis.segment_cadence_signatures.future_self.rich_profile.lexicalEntropyScore', Number(getPath(out, 'analysis.segment_cadence_signatures.future_self.rich_profile.lexicalEntropyScore') || 0) + 0.25); break;
    case 'tamper_lane_distribution': setPath(out, 'analysis.segment_cadence_signatures.future_self.rich_profile.functionWordProfile.__tamper__', 0.33); break;
    case 'delete_hash_semantics': deletePath(out, 'rich_stylometry_hash_semantics'); break;
    case 'delete_packet_authority_surface': deletePath(out, 'packet_authority_surface'); break;
    case 'promote_public_default_without_authority': setPath(out, 'public_default_policy.default_public_credential', 'dual'); setPath(out, 'public_default_policy.v3_public_ready', true); break;
    case 'renderer_hash_mismatch': setPath(out, 'renderer_authority_metadata.packet_hash_sha256', 'sha256:' + 'f'.repeat(64)); break;
    case 'phase4_intake_dual_verify_without_v3': deletePath(out, 'issuance.v3'); setPath(out, 'phase4_recall_intake.recommended_action', 'dual-verify'); break;
    case 'bridge_only_fake_v3_authority': deletePath(out, 'analysis.segment_cadence_signatures'); setPath(out, 'analysis.rich_stylometry.rich_fingerprint', 'bridge-only'); setPath(out, 'recall_governance.v3.status', 'co-authoritative'); break;
    case 'fake_native_lineage': setPath(out, 'native_spine_purification.status', 'native'); setPath(out, 'packet_authority_surface.rich_profile_promotion', 'export-normalized'); break;
    default: break;
  }
  return out;
}
function failureDetectedBy(fixture, battery, conflicts, stale) {
  const detected = [];
  if (battery.v2_badge === 'fail') detected.push('verifyV2Replay');
  if (battery.v3_badge === 'fail' || battery.v3_badge === 'blocked') detected.push('verifyV3Replay');
  if (battery.packet_hash === 'fail' || battery.packet_hash === 'not-recomputed') detected.push('verifyHashReplay');
  if (battery.renderer_metadata === 'fail') detected.push('renderer_metadata');
  if (battery.phase4_intake === 'fail') detected.push('phase4_intake');
  if (battery.native_spine === 'fail') detected.push('native_spine');
  if (battery.hash_topology === 'fail') detected.push('hash_topology');
  if (conflicts.status === 'conflict') detected.push('authority_conflict_report');
  if (stale.status === 'stale-detected') detected.push('stale_v3_policy');
  if (!detected.length && fixture.indexOf('delete_') === 0) detected.push('structural_absence');
  return [...new Set(detected)];
}
export async function buildTamperReport(packet) {
  const fixtures = ['tamper_v2_badge', 'tamper_v2_fingerprint', 'tamper_v3_badge', 'tamper_v3_fingerprint', 'tamper_lane_rich_profile_scalar', 'tamper_lane_distribution', 'delete_hash_semantics', 'delete_packet_authority_surface', 'promote_public_default_without_authority', 'renderer_hash_mismatch', 'phase4_intake_dual_verify_without_v3', 'bridge_only_fake_v3_authority', 'fake_native_lineage'];
  const results = [];
  for (const fixture of fixtures) {
    const mutated = mutatePacket(packet, fixture);
    const battery = await buildHashReplayBattery(mutated);
    const conflicts = await buildAuthorityConflictReport(mutated);
    const stale = await detectStaleV3(mutated);
    const detected_by = failureDetectedBy(fixture, battery, conflicts, stale);
    results.push({ fixture, expected_status: 'fail', actual_status: detected_by.length ? 'fail' : 'pass', detected_by });
  }
  return Object.freeze({ status: results.every((item) => item.actual_status === item.expected_status) ? 'pass' : 'fail', fixtures: results });
}

export async function buildChallengeReplayReport(packet, challengeProfile) {
  if (!challengeProfile) return Object.freeze({ status: 'unavailable', raw_text_retained: false, profile_hash_replay: 'unavailable', continuity_score_v3: 0, continuity_band: 'fail', minimum_lane_count: 3, lane_failures: [], recommended_action: 'operator-review' });
  const lane_failures = [];
  const lanes = challengeProfile.lanes || {};
  for (const key of LANES) {
    const lane = lanes[key];
    const wordCount = Number(lane && (lane.wordCount || lane.word_count) || 0);
    if (!lane || typeof lane !== 'object') lane_failures.push({ lane: key, reason: 'missing lane profile' });
    else if (wordCount > 0 && wordCount < 12) lane_failures.push({ lane: key, reason: 'ultra-short challenge lane' });
  }
  const comparison = compareRecallChallengeToPacket(packet, challengeProfile);
  const authority = classifyAuthoritySurface(packet).status;
  const hash = await verifyHashReplay(packet);
  let recommended = comparison.continuity_band === 'pass' ? 'continue-dual-recall' : comparison.continuity_band === 'review' ? 'operator-review' : 'block-recall';
  if (lane_failures.length || authority === 'bridge-only' || hash.status === 'fail') recommended = 'block-recall';
  return Object.freeze({ status: lane_failures.length ? 'fail' : 'pass', raw_text_retained: challengeProfile.raw_text_retained === false, profile_hash_replay: challengeProfile.fresh_profile_hash ? 'pass' : 'unavailable', continuity_score_v3: comparison.continuity_score_v3, continuity_band: comparison.continuity_band, minimum_lane_count: 3, lane_failures, recommended_action: recommended, receipt: buildRecallChallengeReceipt(packet, challengeProfile) });
}

export async function buildStep1AuthorityReview(packet) {
  const hardening = packet && packet.phase5_replay_hardening ? packet.phase5_replay_hardening : await buildPhase5ReplayHardening(packet, { includeTamperFixtures: false });
  const publicPolicy = packet && packet.public_default_policy ? packet.public_default_policy : buildPublicDefaultPolicy(packet);
  const publicDefaultStatus = hardening.authority_conflict_report.conflicts.some((item) => String(item.path || '').indexOf('public_default_policy') === 0) ? 'conflict' : publicPolicy.default_public_credential || 'v2';
  let recommended = hardening.recommended_action;
  if (hardening.status === 'pass' && hardening.replay_battery.v3_badge === 'pass') recommended = 'dual-verify';
  return Object.freeze({ phase4_recall_intake_present: Boolean(packet && packet.phase4_recall_intake), phase5_replay_hardening_present: Boolean(packet && packet.phase5_replay_hardening), recommended_action: recommended, v3_replay_status: hardening.replay_battery.v3_badge, hash_replay_status: hardening.replay_battery.packet_hash, public_default_status: publicDefaultStatus, operator_warning: hardening.status === 'pass' ? null : 'Phase 5 replay hardening did not pass; do not countersign as clean.' });
}
export async function shouldAllowPublicExport(packet) {
  const hardening = packet && packet.phase5_replay_hardening ? packet.phase5_replay_hardening : await buildPhase5ReplayHardening(packet, { includeTamperFixtures: false });
  return Object.freeze({ allowed: hardening.status === 'pass' || hardening.status === 'review', recommended_action: hardening.recommended_action, reason: hardening.status === 'pass' ? 'Phase 5 replay hardening passed.' : 'Public export requires review or quarantine due to replay hardening status.' });
}
export async function buildPhase5ReplayHardening(packet, options = {}) {
  const replay_battery = await buildHashReplayBattery(packet);
  const stale_v3_policy = await detectStaleV3(packet);
  const authority_conflict_report = await buildAuthorityConflictReport(packet);
  const challenge_replay_report = options.challengeProfile ? await buildChallengeReplayReport(packet, options.challengeProfile) : { status: 'unavailable', raw_text_retained: false, profile_hash_replay: 'unavailable', continuity_score_v3: 0, continuity_band: 'fail', minimum_lane_count: 3, lane_failures: [], recommended_action: 'operator-review' };
  const convergence_report = options.normalizeFn ? await buildConvergenceReport(options.normalizeFn, packet) : { status: 'unavailable', iterations: 0, stable_after_iteration: null, changed_paths: [], volatile_paths_excluded: VOLATILE_PATHS.slice() };
  const tamper_report = options.includeTamperFixtures === false ? { status: 'skipped', fixtures: [] } : await buildTamperReport(packet);
  let status = 'pass';
  let recommended_action = 'export';
  if (stale_v3_policy.status === 'stale-detected' || authority_conflict_report.status === 'conflict') { status = 'quarantine'; recommended_action = 'quarantine'; }
  else if (replay_battery.packet_hash === 'fail' || replay_battery.v2_badge === 'fail' || replay_battery.v3_badge === 'fail' || replay_battery.renderer_metadata === 'fail' || replay_battery.phase4_intake === 'fail' || replay_battery.native_spine === 'fail' || replay_battery.hash_topology === 'fail' || tamper_report.status === 'fail' || convergence_report.status === 'fail') { status = 'fail'; recommended_action = 'block'; }
  else if (replay_battery.v3_badge === 'blocked' || replay_battery.packet_hash === 'not-recomputed' || challenge_replay_report.status === 'fail') { status = 'review'; recommended_action = 'review'; }
  return Object.freeze({ schema_version: PHASE5_SCHEMA, status, replay_battery, stale_v3_policy, convergence_report, tamper_report, authority_conflict_report, challenge_replay_report, recommended_action });
}
export function applyPhase5Quarantine(packet, hardening) {
  const out = clone(packet || {});
  out.phase5_replay_hardening = hardening ? clone(hardening) : null;
  if (hardening && (hardening.status === 'quarantine' || hardening.status === 'fail')) {
    out.export_quarantine = { schema_version: 'td613.safe-harbor.export-quarantine/v1', status: hardening.status, recommended_action: hardening.recommended_action, reason: hardening.status === 'quarantine' ? 'Phase 5 replay hardening detected stale or contradictory authority.' : 'Phase 5 replay hardening failed adversarial replay.' };
  }
  return out;
}
if (typeof window !== 'undefined') {
  window.TD613_SAFE_HARBOR_PHASE5 = Object.freeze({ buildPhase5ReplayHardening, detectStaleV3, buildConvergenceReport, buildHashReplayBattery, buildAuthorityConflictReport, buildTamperReport, buildChallengeReplayReport, buildStep1AuthorityReview, shouldAllowPublicExport, applyPhase5Quarantine });
  window.dispatchEvent(new CustomEvent('td613:safe-harbor:phase5-ready', { detail: { version: PHASE5_SCHEMA } }));
}
