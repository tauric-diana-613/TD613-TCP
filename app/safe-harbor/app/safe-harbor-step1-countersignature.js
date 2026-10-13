import {
  buildPhase4RecallIntake,
  buildPublicDefaultPolicy,
  classifyAuthoritySurface,
  verifyHashReplay,
  verifyV2Replay,
  verifyV3Replay
} from './safe-harbor-authority-verifier.js';
import { compactSafeHarborApertureContext, safeHarborTauricIntakeContext } from './safe-harbor-aperture-context.js';

const STEP1_SCHEMA = 'td613.safe-harbor.step1-countersignature/v2';
const INTAKE_SCHEMA = 'td613.safe-harbor.countersignatory-intake/v1';

function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function getPath(value, path) { return String(path || '').split('.').reduce((node, key) => (node && Object.prototype.hasOwnProperty.call(node, key) ? node[key] : undefined), value); }
function hasLaneRichProfiles(packet) {
  const signatures = packet && packet.analysis && packet.analysis.segment_cadence_signatures;
  const lanes = ['future_self', 'past_self', 'higher_self'];
  return Boolean(signatures && lanes.every((key) => signatures[key] && signatures[key].rich_profile_schema === 'td613.safe-harbor.lane-rich-profile/v1' && signatures[key].rich_profile));
}
function phase5Status(packet) { return getPath(packet, 'phase5_replay_hardening.status') || 'unavailable'; }
function publicDefault(packet) { return getPath(packet, 'public_default_policy.default_public_credential') || 'v2'; }
function nativeLineage(packet) {
  const p5 = phase5Status(packet);
  if (p5 === 'quarantine' || p5 === 'fail') return 'quarantined';
  const spine = getPath(packet, 'native_spine_purification.status');
  if (spine === 'native') return 'native';
  if (spine === 'export-hardened') return 'export-hardened';
  if (spine === 'legacy') return 'legacy';
  if (spine === 'blocked') return 'blocked';
  const surface = classifyAuthoritySurface(packet).status;
  if (surface === 'native') return 'native';
  if (surface === 'export-hardened') return 'export-hardened';
  if (surface === 'legacy') return 'legacy';
  return surface === 'bridge-only' ? 'blocked' : 'legacy';
}
function v3Role(packet) {
  const v3Status = getPath(packet, 'issuance.v3.status');
  const promotion = getPath(packet, 'recall_governance.v3.promotion_status');
  const status = getPath(packet, 'recall_governance.v3.status');
  if (!v3Status) return 'unavailable';
  if (v3Status === 'blocked' || status === 'blocked') return 'blocked';
  if (promotion === 'v3-dual-verification-ready') return 'dual-verification-ready';
  if (promotion === 'v3-public-default-ready') return 'dual-verification-ready';
  return 'forensic-secondary';
}
function sourceStatus(packet) {
  if (hasLaneRichProfiles(packet) || getPath(packet, 'analysis.rich_stylometry')) return 'packet-observed rich stylometry present';
  if (getPath(packet, 'issuance.stylometric_provenance') || getPath(packet, 'issuance.stylometric_fingerprint')) return 'packet exposes legacy thin stylometry only';
  return 'unavailable';
}
function rendererMismatches(packet) {
  const renderer = getPath(packet, 'renderer_authority_metadata');
  if (!renderer) return [];
  const mismatches = [];
  const expectedHash = packet && packet.packet_hash_sha256 ? packet.packet_hash_sha256 : null;
  const expectedV3Status = getPath(packet, 'issuance.v3.status') || 'unavailable';
  const expectedV3Badge = getPath(packet, 'issuance.v3.badge_number_v3') || null;
  if (renderer.packet_hash_sha256 && renderer.packet_hash_sha256 !== expectedHash) mismatches.push('renderer metadata packet hash mismatch');
  if (renderer.badge_number_v3 !== expectedV3Badge) mismatches.push('renderer metadata v3 badge mismatch');
  if (renderer.v3_status !== expectedV3Status) mismatches.push('renderer metadata v3 status mismatch');
  if (renderer.raw_text_included !== false) mismatches.push('renderer metadata raw_text_included must be false');
  if (renderer.public_default_credential && renderer.public_default_credential !== 'v2') mismatches.push('renderer metadata attempted public-default promotion');
  if (renderer.native_spine_status === 'native' && getPath(packet, 'native_spine_purification.status') !== 'native') mismatches.push('renderer metadata marked native without native spine');
  return mismatches;
}
function hookAuthorityMismatches(packet, context = {}) {
  const mismatches = [];
  const expectedDefault = publicDefault(packet);
  const expectedRole = v3Role(packet);
  const expectedLineage = nativeLineage(packet);
  const expectedP5 = phase5Status(packet);
  const check = (name, hook) => {
    if (!hook) return;
    const actualDefault = hook.public_default || hook.observed_public_default;
    const actualRole = hook.v3_role || hook.observed_v3_role;
    const actualLineage = hook.native_spine_status || hook.observed_lineage;
    const actualP5 = hook.phase5_status || hook.observed_phase5_status;
    if (actualDefault && actualDefault !== expectedDefault) mismatches.push(`${name} public_default mismatch`);
    if (actualRole && actualRole !== expectedRole) mismatches.push(`${name} v3_role mismatch`);
    if (actualLineage && actualLineage !== expectedLineage) mismatches.push(`${name} lineage mismatch`);
    if (actualP5 && actualP5 !== expectedP5) mismatches.push(`${name} phase5 mismatch`);
  };
  check('tcp_hook', context.tcp_hook_authority || context.tcpHookAuthority);
  check('eo_hook', context.eo_hook_authority || context.eoHookAuthority);
  return mismatches;
}
function lineageConflicts(packet) {
  const conflicts = [];
  const spine = getPath(packet, 'native_spine_purification.status');
  const surfacePromotion = getPath(packet, 'packet_authority_surface.rich_profile_promotion');
  const normalizerRole = getPath(packet, 'native_spine_purification.normalizer_role');
  if (spine === 'native' && surfacePromotion && surfacePromotion !== 'native') conflicts.push('native spine conflicts with packet authority surface');
  if (surfacePromotion === 'native' && !spine) conflicts.push('native authority surface without native spine');
  if (surfacePromotion === 'native' && normalizerRole === 'export-hardening-fallback') conflicts.push('native authority claimed through export-hardening fallback');
  if (spine === 'legacy' && surfacePromotion === 'native') conflicts.push('legacy packet labeled native');
  if (spine === 'export-hardened' && surfacePromotion === 'native') conflicts.push('export-hardened packet labeled native');
  return conflicts;
}
function rawTextFound(value) {
  const seen = new Set();
  const scan = (node, key = '') => {
    if (node == null) return false;
    if (typeof node === 'string') {
      if (key === 'raw_text' && node.trim()) return true;
      return /future self will carry route|past self remembers residue|higher self names pattern/u.test(node);
    }
    if (typeof node !== 'object') return false;
    if (seen.has(node)) return false;
    seen.add(node);
    if (Array.isArray(node)) return node.some((item) => scan(item, key));
    return Object.entries(node).some(([childKey, child]) => childKey === 'raw_text' || scan(child, childKey));
  };
  return scan(value);
}

export async function buildStep1Countersignature(packet, context = {}) {
  const hash = await verifyHashReplay(packet);
  const v2 = verifyV2Replay(packet);
  const v3 = await verifyV3Replay(packet);
  const p5 = phase5Status(packet);
  const lineage = nativeLineage(packet);
  const publicDefaultCredential = publicDefault(packet);
  const role = v3Role(packet);
  const refusal = [];
  if (p5 === 'fail' || p5 === 'quarantine') refusal.push(`Phase 5 status is ${p5}`);
  if (hash.status === 'fail') refusal.push('hash replay failed');
  if (getPath(packet, 'issuance.v3.status') === 'issued' && v3.status !== 'pass') refusal.push('v3 exists but v3 replay failed');
  if (publicDefaultCredential !== 'v2') refusal.push('public default attempted to move beyond v2 before Phase 8');
  refusal.push(...rendererMismatches(packet));
  refusal.push(...lineageConflicts(packet));
  refusal.push(...hookAuthorityMismatches(packet, context));
  const envelope = {
    schema_version: STEP1_SCHEMA,
    aperture_context: compactSafeHarborApertureContext(packet?.aperture_context || packet?.bridge?.aperture_context || {}),
    tauric_intake_context: packet?.tauric_intake_context || packet?.intake?.tauric_intake_context || safeHarborTauricIntakeContext(packet),
    source_status: sourceStatus(packet),
    packet_lineage: lineage,
    hash_replay: hash.status,
    v2_replay: v2.status,
    v3_replay: v3.status,
    phase5_status: p5,
    public_default: 'v2',
    v3_role: role,
    recommended_action: 'legacy-recall',
    can_countersign: true,
    refusal_reasons: refusal,
    claim_limit: 'Countersignature confirms packet authority reading and replay posture only; it is not civil identity proof, legal adjudication, or public-default promotion.'
  };
  if (refusal.length) {
    envelope.recommended_action = p5 === 'fail' || hash.status === 'fail' ? 'block' : 'refuse';
    envelope.can_countersign = false;
  } else if (v3.status === 'pass' && role === 'dual-verification-ready') {
    envelope.recommended_action = 'dual-verify';
  } else if (v3.status === 'pass' && role === 'forensic-secondary') {
    envelope.recommended_action = 'dual-verify';
  } else if (v3.status === 'blocked') {
    envelope.recommended_action = 'legacy-recall';
  }
  if (rawTextFound(envelope)) {
    envelope.can_countersign = false;
    envelope.recommended_action = 'refuse';
    envelope.refusal_reasons.push('raw text appeared in Step 1 envelope');
  }
  return Object.freeze(envelope);
}

export async function buildCountersignatoryIntake(packet, context = {}) {
  const step1 = await buildStep1Countersignature(packet, context);
  const recognized = [];
  const missing = [];
  const surfaces = ['native_spine_purification', 'hash_topology', 'packet_authority_surface', 'recall_governance', 'public_default_policy', 'phase5_replay_hardening', 'phase4_recall_intake', 'renderer_authority_metadata'];
  for (const surface of surfaces) (getPath(packet, surface) ? recognized : missing).push(surface);
  if (getPath(packet, 'aperture_audit')) recognized.push('aperture_audit');
  if (getPath(packet, 'forensic_schema')) recognized.push('forensic_schema');
  if (getPath(packet, 'tauric_intake_context') || getPath(packet, 'intake.tauric_intake_context')) recognized.push('tauric_intake_context');
  if (context.signature_overlay_authority) recognized.push('signature_overlay_authority');
  else missing.push('signature_overlay_authority');
  if (context.tcp_hook_authority || context.tcpHookAuthority) recognized.push('tcp_hook_authority');
  else missing.push('tcp_hook_authority');
  if (context.eo_hook_authority || context.eoHookAuthority) recognized.push('eo_hook_authority');
  else missing.push('eo_hook_authority');
  const conflicting = step1.refusal_reasons.slice();
  const required = [];
  if (missing.includes('tcp_hook_authority')) required.push('TCP hook pending');
  if (missing.includes('eo_hook_authority')) required.push('EO hook pending');
  if (conflicting.length) required.push('Resolve countersignature refusal reasons before signing');
  return Object.freeze({
    schema_version: INTAKE_SCHEMA,
    aperture_context: compactSafeHarborApertureContext(packet?.aperture_context || packet?.bridge?.aperture_context || {}),
    tauric_intake_context: packet?.tauric_intake_context || packet?.intake?.tauric_intake_context || safeHarborTauricIntakeContext(packet),
    intake_status: conflicting.length ? 'refused' : missing.length ? 'review' : 'ready',
    packet_lineage: step1.packet_lineage,
    recognized_surfaces: recognized,
    missing_surfaces: missing,
    conflicting_surfaces: conflicting,
    required_actions: required,
    safe_to_countersign: step1.can_countersign && conflicting.length === 0
  });
}

export function buildPhase4CountersignatureEvidenceReview(packet, step1) {
  const intake = getPath(packet, 'phase4_recall_intake') || buildPhase4RecallIntake(packet);
  return Object.freeze(Object.assign({}, clone(intake), {
    countersignature_evidence_review: {
      schema_version: 'td613.safe-harbor.countersignature-evidence-review/v1',
      step1_can_countersign: Boolean(step1 && step1.can_countersign),
      step1_recommended_action: step1 && step1.recommended_action ? step1.recommended_action : 'unavailable',
      refusal_reasons: step1 && step1.refusal_reasons ? step1.refusal_reasons.slice() : [],
      public_default: 'v2',
      raw_text_exported: false
    }
  }));
}

if (typeof window !== 'undefined') {
  window.TD613_SAFE_HARBOR_STEP1 = Object.freeze({
    buildStep1Countersignature,
    buildCountersignatoryIntake,
    buildPhase4CountersignatureEvidenceReview
  });
  window.dispatchEvent(new CustomEvent('td613:safe-harbor:step1-ready', { detail: { version: STEP1_SCHEMA } }));
}
