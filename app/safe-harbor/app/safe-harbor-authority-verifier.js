import { buildV3Issuance, canIssueV3, stableCanonicalJson } from './safe-harbor-stylometry-v3.js';

const LANES = ['future_self', 'past_self', 'higher_self'];
const AUTHORITY_SURFACE_SCHEMA = 'td613.safe-harbor.packet-authority-surface/v1';
const RECALL_GOVERNANCE_SCHEMA = 'td613.safe-harbor.recall-governance/v1';
const PUBLIC_DEFAULT_POLICY_SCHEMA = 'td613.safe-harbor.public-default-policy/v1';
const PHASE4_INTAKE_SCHEMA = 'td613.safe-harbor.phase4-recall-intake/v1';

function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function principal(packet) { return packet && packet.canon && packet.canon.principal ? String(packet.canon.principal) : 'tauric.diana.613'; }
function bindingFragment(packet) {
  const value = packet && packet.canon && packet.canon.binding_fragment ? String(packet.canon.binding_fragment) : '#9B07D8B';
  return value.charAt(0) === '#' ? value : '#' + value;
}
function hash64(text) {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  for (let i = 0; i < String(text || '').length; i += 1) {
    hash ^= BigInt(String(text || '').charCodeAt(i));
    hash = (hash * prime) & 0xffffffffffffffffn;
  }
  return hash.toString(16).padStart(16, '0');
}
async function sha256Hex(text) {
  const value = String(text || '');
  if (globalThis.crypto && globalThis.crypto.subtle && globalThis.TextEncoder) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  try {
    const nodeCrypto = await import('node:crypto');
    return nodeCrypto.createHash('sha256').update(value).digest('hex');
  } catch (error) {
    return null;
  }
}
function stableForPacketHash(value) {
  if (value === undefined) return undefined;
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map((item) => stableForPacketHash(item)).join(',') + ']';
  return '{' + Object.keys(value).filter((key) => value[key] !== undefined).sort().map((key) => JSON.stringify(key) + ':' + stableForPacketHash(value[key])).join(',') + '}';
}
function packetHashReplayMaterial(packet) {
  const material = clone(packet || {});
  delete material.packet_hash_sha256;
  if (material.renderer_authority_metadata) material.renderer_authority_metadata.packet_hash_sha256 = null;
  if (material.signature) {
    material.signature.sig = null;
    material.signature.attached_at = null;
    if (material.signature.status === 'sealed') material.signature.status = 'declared';
  }
  return material;
}
function hasAllNativeRichProfiles(packet) {
  const signatures = packet && packet.analysis && packet.analysis.segment_cadence_signatures;
  return Boolean(signatures && LANES.every((key) => {
    const lane = signatures[key];
    return lane && lane.rich_profile_schema === 'td613.safe-harbor.lane-rich-profile/v1' && lane.rich_profile && typeof lane.rich_profile === 'object';
  }));
}
function packetForV3Replay(packet) {
  const replay = clone(packet || {});
  const preimageHash = replay && replay.rich_stylometry_hash_semantics && replay.rich_stylometry_hash_semantics.v3_preimage_packet_hash_sha256;
  if (preimageHash) replay.packet_hash_sha256 = preimageHash;
  return replay;
}

export function expectedV2BadgeNumber(packet) {
  const issuance = packet && packet.issuance ? packet.issuance : {};
  const fingerprint = issuance.stylometric_fingerprint == null ? null : String(issuance.stylometric_fingerprint);
  if (!fingerprint) return null;
  const seed = ['td613.shi/v1', principal(packet), bindingFragment(packet), fingerprint].join('|');
  return 'TD613-SH-' + bindingFragment(packet).replace('#', '') + '-' + hash64(seed).slice(0, 8).toUpperCase();
}
export function verifyV2Replay(packet) {
  const issuance = packet && packet.issuance ? packet.issuance : {};
  const badge = issuance.badge_number || null;
  const fingerprint = issuance.stylometric_fingerprint == null ? null : String(issuance.stylometric_fingerprint);
  const expected = badge && fingerprint ? expectedV2BadgeNumber(packet) : null;
  return Object.freeze({ status: expected && expected === badge ? 'pass' : expected ? 'fail' : 'unavailable', badge_number: badge, stylometric_fingerprint: fingerprint, expected_badge_number: expected });
}
export async function verifyV3Replay(packet) {
  const issuance = packet && packet.issuance ? packet.issuance : {};
  const stored = issuance.v3 || null;
  if (!stored || !stored.badge_number_v3 || !stored.stylometric_fingerprint_v3) {
    const gate = canIssueV3(packet);
    return Object.freeze({ status: gate.ready ? 'unavailable' : 'blocked', badge_number_v3: stored && stored.badge_number_v3 ? stored.badge_number_v3 : null, stylometric_fingerprint_v3: stored && stored.stylometric_fingerprint_v3 ? stored.stylometric_fingerprint_v3 : null, expected_badge_number_v3: null, expected_stylometric_fingerprint_v3: null, blocking_reasons: gate.ready ? [] : gate.blocking_reasons });
  }
  const replayPacket = packetForV3Replay(packet);
  const gate = canIssueV3(replayPacket);
  if (!gate.ready) return Object.freeze({ status: 'blocked', badge_number_v3: stored.badge_number_v3, stylometric_fingerprint_v3: stored.stylometric_fingerprint_v3, expected_badge_number_v3: null, expected_stylometric_fingerprint_v3: null, blocking_reasons: gate.blocking_reasons });
  const replay = await buildV3Issuance(replayPacket);
  const expectedBadge = replay && replay.badge_number_v3 ? replay.badge_number_v3 : null;
  const expectedFingerprint = replay && replay.stylometric_fingerprint_v3 ? replay.stylometric_fingerprint_v3 : null;
  const pass = stored.badge_number_v3 === expectedBadge && stored.stylometric_fingerprint_v3 === expectedFingerprint;
  return Object.freeze({ status: pass ? 'pass' : 'fail', badge_number_v3: stored.badge_number_v3, stylometric_fingerprint_v3: stored.stylometric_fingerprint_v3, expected_badge_number_v3: expectedBadge, expected_stylometric_fingerprint_v3: expectedFingerprint, blocking_reasons: [] });
}
export async function verifyHashReplay(packet) {
  const declared = packet && packet.packet_hash_sha256 ? String(packet.packet_hash_sha256) : null;
  if (!declared) return Object.freeze({ status: 'unavailable', packet_hash_sha256: null, expected_packet_hash_sha256: null });
  const surface = packet && packet.packet_authority_surface ? packet.packet_authority_surface : null;
  if (!surface || surface.packet_hash_recomputed_after_export_hardening !== true) return Object.freeze({ status: 'not-recomputed', packet_hash_sha256: declared, expected_packet_hash_sha256: null });
  const digest = await sha256Hex(stableForPacketHash(packetHashReplayMaterial(packet)));
  if (!digest) return Object.freeze({ status: 'not-recomputed', packet_hash_sha256: declared, expected_packet_hash_sha256: null });
  const expected = 'sha256:' + digest;
  return Object.freeze({ status: expected === declared ? 'pass' : 'fail', packet_hash_sha256: declared, expected_packet_hash_sha256: expected });
}
export function classifyAuthoritySurface(packet) {
  const surface = packet && packet.packet_authority_surface ? packet.packet_authority_surface : null;
  if (surface && surface.rich_profile_promotion === 'native' && surface.v3_issuance === 'native') return Object.freeze({ status: 'native', packet_authority_surface: clone(surface) });
  if (surface && surface.packet_hash_recomputed_after_export_hardening === true) return Object.freeze({ status: 'export-hardened', packet_authority_surface: clone(surface) });
  if (hasAllNativeRichProfiles(packet)) return Object.freeze({ status: 'native-rich-unattested', packet_authority_surface: clone(surface) });
  if (packet && packet.analysis && packet.analysis.rich_stylometry) return Object.freeze({ status: 'bridge-only', packet_authority_surface: clone(surface) });
  return Object.freeze({ status: 'legacy', packet_authority_surface: clone(surface) });
}
export function buildPacketAuthoritySurface(packet, options = {}) {
  const mode = options.mode || (hasAllNativeRichProfiles(packet) ? 'export-normalized' : 'legacy');
  const native = mode === 'native';
  return Object.freeze({ schema_version: AUTHORITY_SURFACE_SCHEMA, native_constructor: 'app/safe-harbor/app/main.js::composePacket', export_hardening_layer: native ? 'verification-only' : 'app/safe-harbor/app/safe-harbor-pr169-packet-vault-direct.js', rich_profile_promotion: native ? 'native' : (hasAllNativeRichProfiles(packet) ? 'export-normalized' : 'legacy'), v3_issuance: native ? 'native' : (options.v3Issued ? 'export-normalized' : 'blocked-or-unavailable'), packet_hash_recomputed_after_export_hardening: !native && Boolean(options.packetHashRecomputed), authority_note: native ? 'Native constructor finalized this packet.' : 'Export hardening finalized this packet for public export.' });
}
export function buildRecallGovernance(packet) {
  const issuance = packet && packet.issuance ? packet.issuance : {};
  const v3 = issuance.v3 || {};
  const authority = classifyAuthoritySurface(packet).status;
  const v3Issued = v3.status === 'issued' && Boolean(v3.badge_number_v3 && v3.stylometric_fingerprint_v3);
  let promotionStatus = v3 && v3.v2_v3_verification && v3.v2_v3_verification.promotion_status ? v3.v2_v3_verification.promotion_status : 'v3-not-yet-recall-authoritative';
  if (v3Issued && (authority === 'native' || authority === 'export-hardened') && promotionStatus === 'v3-not-yet-recall-authoritative') promotionStatus = 'v3-dual-verification-ready';
  const v3Status = promotionStatus === 'v3-dual-verification-ready' ? 'co-authoritative' : promotionStatus === 'v3-challenge-authoritative' ? 'challenge-authoritative' : 'non-authoritative';
  return Object.freeze({ schema_version: RECALL_GOVERNANCE_SCHEMA, v2: { credential: 'badge_number', role: 'primary_recall_credential', status: issuance.badge_number ? 'authoritative' : 'unavailable' }, v3: { credential: 'badge_number_v3', role: 'forensic_secondary_credential', status: v3Status, promotion_status: promotionStatus }, recall_modes: { legacy_v2: { allowed: Boolean(issuance.badge_number), requires: ['badge_number', 'sealed packet replay or existing v2 cadence continuity'], action: 'legacy-recall' }, dual_v2_v3: { allowed: Boolean(issuance.badge_number && v3Issued && promotionStatus === 'v3-dual-verification-ready'), requires: ['badge_number', 'badge_number_v3', 'stylometric_fingerprint_v3 replay'], action: 'dual-verify' }, v3_challenge: { allowed: promotionStatus === 'v3-challenge-authoritative', requires: ['badge_number_v3', 'triad-fresh-sample challenge', 'packet lineage proof'], action: 'challenge' }, blocked_recall: { applies_when: 'bridge-only rich stylometry or missing native/export-hardened lane profile attestation', action: 'block' } } });
}
export function buildPublicDefaultPolicy(packet, options = {}) {
  const governance = options.recallGovernance || buildRecallGovernance(packet);
  const promotion = governance.v3 && governance.v3.promotion_status ? governance.v3.promotion_status : 'v3-not-yet-recall-authoritative';
  const v3PublicReady = promotion === 'v3-public-default-ready';
  return Object.freeze({ schema_version: PUBLIC_DEFAULT_POLICY_SCHEMA, display_mode: options.displayMode || 'legacy-compatible', public_shi: v3PublicReady ? 'dual' : 'v2', default_public_credential: v3PublicReady ? 'dual' : 'v2', v3_public_ready: v3PublicReady, reason: v3PublicReady ? 'v3 renderer metadata, Step 1 countersignature, packet replay, and UI labels are aligned.' : 'v3 remains forensic-secondary until dual recall and renderer metadata pass.' });
}
export function buildPhase4RecallIntake(packet) {
  const issuance = packet && packet.issuance ? packet.issuance : {};
  const v3 = issuance.v3 || {};
  const governance = packet && packet.recall_governance ? packet.recall_governance : buildRecallGovernance(packet);
  const authority = classifyAuthoritySurface(packet).status;
  const recognized = [];
  if (v3.status) recognized.push('issuance.v3');
  if (hasAllNativeRichProfiles(packet)) recognized.push('analysis.segment_cadence_signatures.*.rich_profile');
  if (packet && packet.rich_stylometry_hash_semantics) recognized.push('rich_stylometry_hash_semantics');
  if (issuance.stylometric_provenance) recognized.push('issuance.stylometric_provenance');
  let recommended = 'legacy-recall';
  if (authority === 'bridge-only') recommended = 'block';
  else if (governance.v3 && governance.v3.promotion_status === 'v3-challenge-authoritative') recommended = 'challenge';
  else if (governance.recall_modes && governance.recall_modes.dual_v2_v3 && governance.recall_modes.dual_v2_v3.allowed) recommended = 'dual-verify';
  return Object.freeze({ schema_version: PHASE4_INTAKE_SCHEMA, v2_badge_present: Boolean(issuance.badge_number), v3_badge_present: Boolean(v3.badge_number_v3), v3_status: v3.status || 'unavailable', v3_authority: governance.v3 && governance.v3.status ? governance.v3.status.replace('non-authoritative', 'forensic_secondary') : 'forensic_secondary', recognized_surfaces: recognized, recommended_action: recommended });
}
export function buildRendererAuthorityMetadata(packet) {
  const issuance = packet && packet.issuance ? packet.issuance : {};
  const v3 = issuance.v3 || {};
  const governance = packet && packet.recall_governance ? packet.recall_governance : buildRecallGovernance(packet);
  return Object.freeze({ schema_version: 'td613.safe-harbor.renderer-authority/v1', badge_number: issuance.badge_number || null, badge_number_v3: v3.badge_number_v3 || null, v3_status: v3.status || 'unavailable', promotion_status: governance.v3 && governance.v3.promotion_status ? governance.v3.promotion_status : 'v3-not-yet-recall-authoritative', packet_hash_sha256: packet && packet.packet_hash_sha256 ? packet.packet_hash_sha256 : null, raw_text_included: false });
}
export async function verifySafeHarborPacketAuthority(packet) {
  const v2 = verifyV2Replay(packet);
  const v3 = await verifyV3Replay(packet);
  const hash = await verifyHashReplay(packet);
  const authority = classifyAuthoritySurface(packet);
  return Object.freeze({ v2_replay: v2, v3_replay: v3, hash_replay: hash, authority_surface: authority, recall_governance: buildRecallGovernance(packet), public_default_policy: buildPublicDefaultPolicy(packet), phase4_recall_intake: buildPhase4RecallIntake(packet), renderer_authority_metadata: buildRendererAuthorityMetadata(packet), canonical_replay_json: stableCanonicalJson({ v2, v3, hash, authority }) });
}
export async function attachPhase4Authority(packet, options = {}) {
  if (!packet || typeof packet !== 'object') return packet;
  const out = clone(packet);
  const v3Issued = Boolean(out.issuance && out.issuance.v3 && out.issuance.v3.status === 'issued');
  out.packet_authority_surface = buildPacketAuthoritySurface(out, { mode: options.mode || 'export-normalized', v3Issued, packetHashRecomputed: Boolean(options.packetHashRecomputed) });
  out.recall_governance = buildRecallGovernance(out);
  if (out.issuance && out.issuance.v3 && out.issuance.v3.v2_v3_verification) out.issuance.v3.v2_v3_verification.promotion_status = out.recall_governance.v3.promotion_status;
  out.public_default_policy = buildPublicDefaultPolicy(out, { recallGovernance: out.recall_governance });
  out.phase4_recall_intake = buildPhase4RecallIntake(out);
  out.renderer_authority_metadata = buildRendererAuthorityMetadata(out);
  return out;
}
if (typeof window !== 'undefined') {
  window.TD613_SAFE_HARBOR_AUTHORITY = Object.freeze({ verifySafeHarborPacketAuthority, verifyV2Replay, verifyV3Replay, verifyHashReplay, classifyAuthoritySurface, buildPacketAuthoritySurface, buildRecallGovernance, buildPublicDefaultPolicy, buildPhase4RecallIntake, buildRendererAuthorityMetadata, attachPhase4Authority });
  window.dispatchEvent(new CustomEvent('td613:safe-harbor:authority-ready', { detail: { version: RECALL_GOVERNANCE_SCHEMA } }));
}
