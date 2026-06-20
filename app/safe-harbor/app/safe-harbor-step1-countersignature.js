import {
  buildPhase4RecallIntake,
  classifyAuthoritySurface,
  verifyHashReplay,
  verifyV2Replay,
  verifyV3Replay
} from './safe-harbor-authority-verifier.js';

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
  if (promotion === 'v3-dual-verification-ready' || promotion === 'v3-public-default-ready') return 'dual-verification-ready';
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
  if (renderer.v3_status && renderer.v3_status !== expectedV3Status) mismatches.push('renderer metadata v3 status mismatch');
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
  check('tcp_hook', context.tcp_hook_authority || context.tcpHookAuthority || getPath(packet, 'tcp_hook_authority'));
  check('eo_hook', context.eo_hook_authority || context.eoHookAuthority || getPath(packet, 'eo_hook_authority'));
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
function phase8Gate(packet) { return getPath(packet, 'phase8_public_default_gate') || null; }
function phase8Refusals(packet) {
  const gate = phase8Gate(packet);
  if (!gate) return [];
  const reasons = [];
  if (gate.status === 'blocked') reasons.push('Phase 8 gate blocked public display');
  if ((gate.gate_decision === 'allow-v3-visible' || gate.gate_decision === 'allow-dual-display') && getPath(packet, 'issuance.v3.status') === 'issued') {
    if (getPath(packet, 'phase8_public_default_gate.gate_inputs.v3_replay') !== 'pass') reasons.push('Phase 8 gate allowed display while v3 replay did not pass');
    if (getPath(packet, 'phase8_public_default_gate.gate_inputs.signature_overlay') === 'refused') reasons.push('Phase 8 gate allowed display while signature overlay refused');
    if (getPath(packet, 'phase8_public_default_gate.gate_inputs.legacy_v2_reopen') === 'fail') reasons.push('Phase 8 gate allowed display while legacy v2 reopen failed');
  }
  if (gate.gate_decision === 'allow-dual-display' && getPath(packet, 'outside_witness_alignment.status') !== 'aligned') reasons.push('Phase 8 gate allowed dual display without aligned outside witnesses');
  if (gate.public_default_before !== 'v2') reasons.push('Phase 8 public_default_before must be v2');
  return reasons;
}
function rawTextFound(value) {
  const body = JSON.stringify(value || {});
  return /raw_text|future self will carry route|past self remembers residue|higher self names pattern/u.test(body);
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
  refusal.push(...phase8Refusals(packet));
  const gate = phase8Gate(packet);
  const envelope = {
    schema_version: STEP1_SCHEMA,
    source_status: sourceStatus(packet),
    packet_lineage: lineage,
    hash_replay: hash.status,
    v2_replay: v2.status,
    v3_replay: v3.status,
    phase5_status: p5,
    public_default: 'v2',
    v3_role: role,
    phase8_public_default_gate: gate ? { status: gate.status, gate_decision: gate.gate_decision, public_display_mode: gate.public_default_after } : { status: 'unavailable', gate_decision: 'keep-v2-only', public_display_mode: 'v2-only' },
    recommended_action: 'legacy-recall',
    can_countersign: true,
    refusal_reasons: [...new Set(refusal)],
    claim_limit: 'Countersignature confirms packet authority reading and replay posture only; it is not civil identity proof, legal adjudication, or public-default promotion.'
  };
  if (envelope.refusal_reasons.length) {
    envelope.recommended_action = p5 === 'fail' || hash.status === 'fail' || (gate && gate.status === 'blocked') ? 'block' : 'refuse';
    envelope.can_countersign = false;
  } else if (v3.status === 'pass' && (role === 'dual-verification-ready' || role === 'forensic-secondary')) {
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
  const surfaces = ['native_spine_purification', 'hash_topology', 'packet_authority_surface', 'recall_governance', 'public_default_policy', 'phase5_replay_hardening', 'phase4_recall_intake', 'renderer_authority_metadata', 'phase8_public_default_gate'];
  for (const surface of surfaces) (getPath(packet, surface) ? recognized : missing).push(surface);
  if (context.signature_overlay_authority || getPath(packet, 'signature_overlay_authority')) recognized.push('signature_overlay_authority'); else missing.push('signature_overlay_authority');
  if (context.tcp_hook_authority || context.tcpHookAuthority || getPath(packet, 'tcp_hook_authority')) recognized.push('tcp_hook_authority'); else missing.push('tcp_hook_authority');
  if (context.eo_hook_authority || context.eoHookAuthority || getPath(packet, 'eo_hook_authority')) recognized.push('eo_hook_authority'); else missing.push('eo_hook_authority');
  const conflicting = step1.refusal_reasons.slice();
  const required = [];
  if (missing.includes('tcp_hook_authority')) required.push('TCP hook pending');
  if (missing.includes('eo_hook_authority')) required.push('EO hook pending');
  if (missing.includes('phase8_public_default_gate')) required.push('Phase 8 gate pending');
  if (conflicting.length) required.push('Resolve countersignature refusal reasons before signing');
  return Object.freeze({
    schema_version: INTAKE_SCHEMA,
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
      phase8_public_default_gate: step1 && step1.phase8_public_default_gate ? clone(step1.phase8_public_default_gate) : { status: 'unavailable', gate_decision: 'keep-v2-only', public_display_mode: 'v2-only' },
      refusal_reasons: step1 && step1.refusal_reasons ? step1.refusal_reasons.slice() : [],
      public_default: 'v2',
      raw_text_exported: false
    }
  }));
}

if (typeof window !== 'undefined') {
  window.TD613_SAFE_HARBOR_STEP1 = Object.freeze({ buildStep1Countersignature, buildCountersignatoryIntake, buildPhase4CountersignatureEvidenceReview });
  window.dispatchEvent(new CustomEvent('td613:safe-harbor:step1-ready', { detail: { version: STEP1_SCHEMA } }));
}
