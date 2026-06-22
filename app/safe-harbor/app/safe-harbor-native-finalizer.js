import { buildSafeHarborRichStylometry } from './safe-harbor-rich-stylometry-adapter.js';
import { buildV3Issuance, canIssueV3, stableCanonicalJson } from './safe-harbor-stylometry-v3.js';
import { attachPhase4Authority, verifyV3Replay } from './safe-harbor-authority-verifier.js';
import { buildPhase5ReplayHardening, applyPhase5Quarantine, detectStaleV3 } from './safe-harbor-phase5-replay-hardening.js';

const LANES = ['future_self', 'past_self', 'higher_self'];
const RICH_PROFILE_SCHEMA = 'td613.safe-harbor.lane-rich-profile/v1';
const FINALIZER_SCHEMA = 'td613.safe-harbor.native-finalizer/v1';
const NATIVE_SPINE_SCHEMA = 'td613.safe-harbor.native-spine-purification/v1';
const HASH_TOPOLOGY_SCHEMA = 'td613.safe-harbor.hash-topology/v1';
const PHASE6_MIGRATION_SCHEMA = 'td613.safe-harbor.phase6-migration-policy/v1';

const HASH_EXCLUDES = Object.freeze([
  'packet_hash_sha256',
  'phase5_replay_hardening',
  'export_quarantine',
  'phase5_hash_semantics',
  'hash_topology',
  'native_spine_purification',
  'phase6_migration_policy',
  'packet_authority_surface',
  'recall_governance',
  'public_default_policy',
  'phase4_recall_intake',
  'renderer_authority_metadata',
  'step1_countersignature',
  'countersignatory_intake',
  'svg_authority_metadata',
  'signature_overlay_authority',
  'tcp_hook_authority',
  'eo_hook_authority',
  'outside_witness_receipt',
  'outside_witness_alignment',
  'phase8_public_default_gate',
  'phase8_receipt_policy',
  'phase9_release_discipline',
  'phase9_release_receipt',
  'signature.sig',
  'signature.attached_at',
  'renderer_authority_metadata.packet_hash_sha256'
]);

function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function isObject(value) { return Boolean(value && typeof value === 'object' && !Array.isArray(value)); }
function getPath(value, path) {
  return String(path || '').split('.').reduce((node, key) => (node && Object.prototype.hasOwnProperty.call(node, key) ? node[key] : undefined), value);
}
function deletePath(value, path) {
  const parts = String(path || '').split('.');
  let node = value;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const key = parts[i];
    if (!node || typeof node !== 'object' || !Object.prototype.hasOwnProperty.call(node, key)) return;
    node = node[key];
  }
  if (node && typeof node === 'object') delete node[parts[parts.length - 1]];
}
function round(value, places = 4) {
  const num = Number(value || 0);
  return Number.isFinite(num) ? Number(num.toFixed(places)) : 0;
}
function topWeighted(profile = {}, max = 80) {
  return Object.fromEntries(Object.entries(profile || {})
    .filter(([, value]) => Number(value || 0) > 0)
    .sort((left, right) => Number(right[1] || 0) - Number(left[1] || 0) || String(left[0]).localeCompare(String(right[0])))
    .slice(0, max)
    .map(([key, value]) => [key, round(value, 5)]));
}
function compactLaneRichProfile(profile) {
  if (!isObject(profile)) return null;
  return {
    contentWordComplexity: round(profile.contentWordComplexity),
    modifierDensity: round(profile.modifierDensity),
    hedgeDensity: round(profile.hedgeDensity),
    abstractionPosture: round(profile.abstractionPosture),
    directness: round(profile.directness),
    latinatePreference: round(profile.latinatePreference),
    abbreviationDensity: round(profile.abbreviationDensity),
    orthographicLooseness: round(profile.orthographicLooseness),
    fragmentPressure: round(profile.fragmentPressure),
    conversationalPosture: round(profile.conversationalPosture),
    syntacticBranchingDepth: round(profile.syntacticBranchingDepth),
    structuralFriction: round(profile.structuralFriction),
    lexicalEntropyScore: round(profile.lexicalEntropyScore),
    characterEntropyBits: round(profile.characterEntropyBits),
    tokenEntropyBits: round(profile.tokenEntropyBits),
    transitionVariance: round(profile.transitionVariance),
    acousticWeight: round(profile.acousticWeight),
    registerMode: String(profile.registerMode || ''),
    surfaceMarkerProfile: clone(profile.surfaceMarkerProfile || {}),
    functionWordProfile: clone(profile.functionWordProfile || {}),
    wordLengthProfile: clone(profile.wordLengthProfile || {}),
    charTrigramProfile: topWeighted(profile.charTrigramProfile || {}, 80)
  };
}
function compactRichProvenance(rich) {
  if (!isObject(rich)) return null;
  return {
    schema_version: rich.schema_version,
    rich_fingerprint: rich.rich_fingerprint,
    engine: clone(rich.engine),
    triad_profile: clone(rich.triad_profile),
    cross_lane_divergence: clone(rich.cross_lane_divergence),
    traceability_surface: clone(rich.traceability_surface),
    compatibility_note: 'Native finalizer provenance. v2 remains primary recall unless public-default policy changes.'
  };
}
function hasSegments(segments = {}) {
  return isObject(segments) && LANES.every((key) => typeof segments[key] === 'string' && segments[key].trim().length > 0);
}
function allRichProfilesPresent(packet) {
  const signatures = packet && packet.analysis && packet.analysis.segment_cadence_signatures;
  return Boolean(signatures && LANES.every((key) => signatures[key] && signatures[key].rich_profile_schema === RICH_PROFILE_SCHEMA && signatures[key].rich_profile));
}
async function sha256Hex(text) {
  const value = String(text || '');
  if (globalThis.crypto && globalThis.crypto.subtle && globalThis.TextEncoder) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  const nodeCrypto = await import('node:crypto');
  return nodeCrypto.createHash('sha256').update(value).digest('hex');
}
async function sha256Tagged(value) {
  return 'sha256:' + await sha256Hex(typeof value === 'string' ? value : stableCanonicalJson(value));
}

export function buildPacketHashMaterial(packet, options = {}) {
  const material = clone(packet || {});
  const excludes = options.excludes || HASH_EXCLUDES;
  for (const path of excludes) deletePath(material, path);
  if (getPath(material, 'signature.status') === 'sealed') material.signature.status = 'declared';
  return material;
}

export async function computePacketHash(packet, options = {}) {
  return sha256Tagged(buildPacketHashMaterial(packet, options));
}

export function promoteNativeRichLaneProfiles(packet, rich, options = {}) {
  if (!packet || !isObject(packet) || !rich || !isObject(rich)) return packet;
  const mode = options.mode || 'native';
  packet.analysis = isObject(packet.analysis) ? packet.analysis : {};
  packet.analysis.segment_cadence_signatures = isObject(packet.analysis.segment_cadence_signatures) ? packet.analysis.segment_cadence_signatures : {};
  packet.analysis.rich_stylometry = clone(rich);
  packet.issuance = isObject(packet.issuance) ? packet.issuance : {};
  packet.issuance.stylometric_provenance = isObject(packet.issuance.stylometric_provenance) ? packet.issuance.stylometric_provenance : {};
  packet.issuance.stylometric_provenance.rich_stylometry = compactRichProvenance(rich);
  packet.issuance.stylometric_provenance.rich_lane_profile_semantics = {
    status: 'present',
    birthplace: mode,
    claim_supported: mode === 'native' ? 'native per-lane authorship-signal enrichment' : 'export-hardened per-lane authorship-signal enrichment',
    claim_limit: 'packet-internal authorship custody evidence only; not civil identity or external legal status'
  };
  for (const key of LANES) {
    const lane = packet.analysis.segment_cadence_signatures[key];
    if (!lane || !isObject(lane)) continue;
    const compact = compactLaneRichProfile(rich.per_lane_profiles && rich.per_lane_profiles[key]);
    lane.rich_profile_schema = compact ? RICH_PROFILE_SCHEMA : null;
    lane.rich_profile_source = compact ? 'app/engine/stylometry.extractCadenceProfile + StylometricDeepMetrics.analyze' : 'not available';
    lane.rich_profile_birthplace = compact ? mode : 'unavailable';
    lane.rich_profile = compact;
  }
  return packet;
}

export function buildNativeHashTopology(packet, options = {}) {
  const mode = options.mode || 'native';
  return Object.freeze({
    schema_version: HASH_TOPOLOGY_SCHEMA,
    packet_hash_algorithm: 'SHA-256 over stable canonical packet hash material',
    packet_hash_material_excludes: HASH_EXCLUDES.slice(),
    v3_preimage_packet_hash_sha256: options.v3PreimageHash || getPath(packet, 'rich_stylometry_hash_semantics.v3_preimage_packet_hash_sha256') || null,
    final_packet_hash_sha256: options.finalPacketHash || packet && packet.packet_hash_sha256 || null,
    finalizer_mode: mode,
    phase5_hash_semantics: {
      phase5_replay_hardening_hash_covered: false,
      phase5_replay_hardening_hash_excluded: true,
      reason: 'Phase 5 replay hardening audits packet hash and authority surfaces; it is explicitly hash-excluded to avoid self-referential replay material.'
    },
    verification_rule: 'Recompute v3 preimage hash after rich lane profile promotion and before v3 issuance; recompute final packet hash after v3 and authority surfaces while excluding Phase 5 replay hardening and lineage metadata.'
  });
}

export function buildNativeSpinePurification(packet, options = {}) {
  const mode = options.mode || 'native';
  const native = mode === 'native';
  const exportNormalized = mode === 'export-normalized';
  return Object.freeze({
    schema_version: NATIVE_SPINE_SCHEMA,
    status: native ? 'native' : exportNormalized ? 'export-hardened' : mode === 'legacy-repair' ? 'legacy' : 'blocked',
    native_constructor: 'app/safe-harbor/app/main.js::composePacket',
    shared_finalizer: 'app/safe-harbor/app/safe-harbor-native-finalizer.js',
    rich_profile_birthplace: allRichProfilesPresent(packet) ? (native ? 'native' : 'export-normalized') : 'unavailable',
    v3_issuance_birthplace: getPath(packet, 'issuance.v3.status') === 'issued' ? (native ? 'native' : 'export-normalized') : getPath(packet, 'issuance.v3.status') === 'blocked' ? 'blocked' : 'unavailable',
    phase4_authority_birthplace: packet && packet.packet_authority_surface ? (native ? 'native' : 'export-normalized') : 'unavailable',
    phase5_hardening_birthplace: packet && packet.phase5_replay_hardening ? (native ? 'native' : 'export-normalized') : 'unavailable',
    normalizer_role: native ? 'verification-only' : exportNormalized ? 'export-hardening-fallback' : 'legacy-repair',
    raw_text_exported: false,
    claim_supported: 'The packet authority surfaces identify where rich profiles, v3 issuance, and replay hardening entered the packet lifecycle.',
    claim_limit: 'This object describes packet authority lineage, not civil identity or external legal status.'
  });
}

export function buildPhase6MigrationPolicy() {
  return Object.freeze({
    schema_version: PHASE6_MIGRATION_SCHEMA,
    legacy_v2_packets: 'preserve as v2-authoritative',
    phase3_phase5_export_hardened_packets: 'preserve as export-hardened',
    phase6_packets: 'native-born only when finalized through the native Safe Harbor construction path',
    retroactive_native_claims_allowed: false,
    raw_text_required_for_native_upgrade: true,
    raw_text_exported: false,
    operator_note: 'A packet may be verified or export-hardened later, but it cannot become native-born retroactively without native finalization at packet construction.'
  });
}

function markRichHashSemantics(packet, v3PreimageHash, mode = 'native') {
  if (!packet || !allRichProfilesPresent(packet)) return packet;
  packet.rich_stylometry_hash_semantics = {
    native_lane_rich_profile_hash_covered: true,
    bridge_rich_stylometry_hash_covered: true,
    v3_preimage_packet_hash_sha256: v3PreimageHash || packet.packet_hash_sha256 || null,
    finalizer_mode: mode,
    notes: mode === 'native'
      ? 'Phase 6 native finalizer promoted lane rich_profile, issued v3 when eligible, and recomputed packet_hash_sha256 before public export.'
      : 'Shared finalizer export-hardening path promoted lane rich_profile, issued v3 when eligible, and recomputed packet_hash_sha256 before public export.'
  };
  return packet;
}
function markPhase5HashSemantics(packet) {
  packet.phase5_hash_semantics = {
    phase5_replay_hardening_hash_covered: false,
    phase5_replay_hardening_hash_excluded: true,
    reason: 'Phase 5 replay hardening audits packet hash and authority surfaces; it is explicitly hash-excluded to avoid self-referential replay material.'
  };
  return packet;
}

async function settleNativePacketHash(packet, mode, preimageHash) {
  let governed = packet;
  let settledHash = governed && governed.packet_hash_sha256 ? governed.packet_hash_sha256 : null;
  for (let i = 0; i < 4; i += 1) {
    const nextHash = await computePacketHash(governed);
    governed.packet_hash_sha256 = nextHash;
    governed.hash_topology = buildNativeHashTopology(governed, { mode, v3PreimageHash: preimageHash, finalPacketHash: nextHash });
    governed = await attachPhase4Authority(governed, { mode, packetHashRecomputed: true });
    governed.native_spine_purification = buildNativeSpinePurification(governed, { mode });
    governed.phase6_migration_policy = buildPhase6MigrationPolicy();
    governed.hash_topology = buildNativeHashTopology(governed, { mode, v3PreimageHash: preimageHash, finalPacketHash: nextHash });
    const checkHash = await computePacketHash(governed);
    if (checkHash === nextHash || checkHash === settledHash) {
      governed.packet_hash_sha256 = checkHash;
      governed.hash_topology = buildNativeHashTopology(governed, { mode, v3PreimageHash: preimageHash, finalPacketHash: checkHash });
      return governed;
    }
    settledHash = nextHash;
  }
  const finalHash = await computePacketHash(governed);
  governed.packet_hash_sha256 = finalHash;
  governed.hash_topology = buildNativeHashTopology(governed, { mode, v3PreimageHash: preimageHash, finalPacketHash: finalHash });
  return governed;
}

export async function attachNativeV3Issuance(packet, options = {}) {
  if (!packet || !allRichProfilesPresent(packet)) return packet;
  packet.issuance = isObject(packet.issuance) ? packet.issuance : {};
  const allowV3Rebuild = Boolean(options.allowV3Rebuild);
  if (packet.issuance.v3 && packet.issuance.v3.status === 'issued') {
    const replay = await verifyV3Replay(packet);
    if (replay.status === 'pass') return packet;
    packet.stale_v3_policy = await detectStaleV3(packet);
    if (!allowV3Rebuild) return packet;
  }
  packet.issuance.v3 = await buildV3Issuance(packet);
  packet.issuance.badge_number_v3 = packet.issuance.v3.badge_number_v3 || null;
  packet.issuance.stylometric_fingerprint_v3 = packet.issuance.v3.stylometric_fingerprint_v3 || null;
  return packet;
}

export async function finalizeSafeHarborPacket(packet, context = {}) {
  if (!packet || typeof packet !== 'object') return packet;
  const mode = context.mode || 'native';
  const out = clone(packet);
  if (hasSegments(context.segments)) {
    const rich = buildSafeHarborRichStylometry(context.segments, { compactCharTrigrams: true, maxCharTrigrams: 120 });
    promoteNativeRichLaneProfiles(out, rich, { mode });
  }
  const preimageHash = await computePacketHash(out);
  out.packet_hash_sha256 = preimageHash;
  markRichHashSemantics(out, preimageHash, mode);
  await attachNativeV3Issuance(out, { allowV3Rebuild: context.allowV3Rebuild === true });
  let governed = await attachPhase4Authority(out, { mode, packetHashRecomputed: true });
  governed.native_spine_purification = buildNativeSpinePurification(governed, { mode });
  governed.phase6_migration_policy = buildPhase6MigrationPolicy();
  governed.hash_topology = buildNativeHashTopology(governed, { mode, v3PreimageHash: preimageHash, finalPacketHash: null });
  const finalHash = await computePacketHash(governed);
  governed.packet_hash_sha256 = finalHash;
  governed.hash_topology = buildNativeHashTopology(governed, { mode, v3PreimageHash: preimageHash, finalPacketHash: finalHash });
  governed = await attachPhase4Authority(governed, { mode, packetHashRecomputed: true });
  governed.native_spine_purification = buildNativeSpinePurification(governed, { mode });
  governed.phase6_migration_policy = buildPhase6MigrationPolicy();
  governed.hash_topology = buildNativeHashTopology(governed, { mode, v3PreimageHash: preimageHash, finalPacketHash: finalHash });
  governed = await settleNativePacketHash(governed, mode, preimageHash);
  if (context.includePhase5 !== false) {
    markPhase5HashSemantics(governed);
    const hardening = await buildPhase5ReplayHardening(governed, { includeTamperFixtures: Boolean(context.includeTamperFixtures) });
    governed.phase5_replay_hardening = hardening;
    if (hardening.status === 'quarantine' || hardening.status === 'fail') return applyPhase5Quarantine(governed, hardening);
    governed.native_spine_purification = buildNativeSpinePurification(governed, { mode });
  }
  return governed;
}

export function classifyNativeFinalizationMode(packet) {
  const spine = packet && packet.native_spine_purification;
  if (spine && spine.status) return spine.status;
  if (packet && packet.packet_authority_surface && packet.packet_authority_surface.rich_profile_promotion === 'native') return 'native';
  if (packet && packet.packet_authority_surface && packet.packet_authority_surface.rich_profile_promotion === 'export-normalized') return 'export-hardened';
  return allRichProfilesPresent(packet) ? 'native-rich-unattested' : 'legacy';
}

if (typeof window !== 'undefined') {
  window.TD613_SAFE_HARBOR_NATIVE_FINALIZER = Object.freeze({
    schema_version: FINALIZER_SCHEMA,
    finalizeSafeHarborPacket,
    promoteNativeRichLaneProfiles,
    buildPacketHashMaterial,
    computePacketHash,
    buildNativeHashTopology,
    buildNativeSpinePurification,
    buildPhase6MigrationPolicy,
    attachNativeV3Issuance,
    classifyNativeFinalizationMode
  });
  window.dispatchEvent(new CustomEvent('td613:safe-harbor:native-finalizer-ready', { detail: { version: FINALIZER_SCHEMA } }));
}
