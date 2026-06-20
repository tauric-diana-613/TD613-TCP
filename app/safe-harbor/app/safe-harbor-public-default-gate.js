import {
  verifySafeHarborPacketAuthority,
  verifyV2Replay,
  verifyV3Replay,
  verifyHashReplay
} from './safe-harbor-authority-verifier.js';
import {
  buildOutsideWitnessAlignment,
  buildRendererAuthorityV2,
  buildSvgAuthorityMetadata,
  buildSignatureOverlayAuthority,
  buildTcpHookAuthority,
  buildEoHookAuthority,
  buildOperatorReceipt
} from './safe-harbor-outside-witness-alignment.js';

const GATE_SCHEMA = 'td613.safe-harbor.public-default-gate/v1';
const POLICY_SCHEMA = 'td613.safe-harbor.public-default-policy/v2';
const RENDERER_SCHEMA = 'td613.safe-harbor.renderer-authority/v3';
const SVG_SCHEMA = 'td613.safe-harbor.svg-authority-metadata/v2';
const RECEIPT_SCHEMA = 'td613.safe-harbor.phase8-receipt-policy/v1';

function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function getPath(value, path) { return String(path || '').split('.').reduce((node, key) => (node && Object.prototype.hasOwnProperty.call(node, key) ? node[key] : undefined), value); }
function phase5Status(packet) { return getPath(packet, 'phase5_replay_hardening.status') || 'unavailable'; }
function nativeSpineStatus(packet) {
  const p5 = phase5Status(packet);
  if (p5 === 'quarantine' || p5 === 'fail') return 'quarantined';
  const spine = getPath(packet, 'native_spine_purification.status');
  if (['native', 'export-hardened', 'legacy', 'blocked'].includes(spine)) return spine;
  const surface = getPath(packet, 'packet_authority_surface.rich_profile_promotion');
  if (surface === 'native') return 'native';
  if (surface === 'export-normalized') return 'export-hardened';
  return 'legacy';
}
function outsideStatus(packet) { return getPath(packet, 'outside_witness_alignment.status') || 'unavailable'; }
function packetHash(packet) { return packet && packet.packet_hash_sha256 ? packet.packet_hash_sha256 : null; }
function hashTopologyFinal(packet) { return getPath(packet, 'hash_topology.final_packet_hash_sha256') || null; }
function publicPolicy(packet) { return packet && packet.public_default_policy ? packet.public_default_policy : {}; }
function step1(packet) { return packet && packet.step1_countersignature ? packet.step1_countersignature : null; }
function signature(packet) { return packet && packet.signature_overlay_authority ? packet.signature_overlay_authority : null; }
function renderer(packet) { return packet && packet.renderer_authority_metadata ? packet.renderer_authority_metadata : null; }
function svg(packet) { return packet && packet.svg_authority_metadata ? packet.svg_authority_metadata : null; }
function tcp(packet) { return packet && packet.tcp_hook_authority ? packet.tcp_hook_authority : null; }
function eo(packet) { return packet && packet.eo_hook_authority ? packet.eo_hook_authority : null; }
function rawTextExported(value) {
  const body = JSON.stringify(value || {});
  return /"raw_text"\s*:|Future self will carry|Past self remembers|Higher self names|Blood Rite 613 public credential/u.test(body);
}
function explicitPolicy(context = {}, packet = {}) {
  const policy = context.phase8Policy || context.publicDefaultPolicy || publicPolicy(packet).phase8_policy || {};
  return {
    allowV3Visible: Boolean(policy.allowV3Visible || policy.allow_v3_visible || policy.public_display_mode === 'v2-primary-v3-visible' || policy.public_default_mode === 'v2-primary-v3-visible'),
    allowDualDisplay: Boolean(policy.allowDualDisplay || policy.allow_dual_display || policy.public_display_mode === 'dual-v2-v3' || policy.public_default_mode === 'dual-v2-v3'),
    allowExportHardenedVisible: Boolean(policy.allowExportHardenedVisible || policy.allow_export_hardened_visible),
    raw: clone(policy)
  };
}
function witnessStatus(value, alignedValue = 'aligned') {
  if (!value) return 'unavailable';
  if (value.status) return value.status;
  if (value.signature_can_bind === false) return 'refused';
  if (value.can_countersign === false) return 'refused';
  return alignedValue;
}
function rendererStatus(packet) {
  const item = renderer(packet);
  if (!item) return 'unavailable';
  if (item.public_default_credential && item.public_default_credential !== 'v2') return 'mismatch';
  if (item.packet_hash_sha256 && item.packet_hash_sha256 !== packetHash(packet)) return 'mismatch';
  if (item.hash_topology_final && hashTopologyFinal(packet) && item.hash_topology_final !== hashTopologyFinal(packet)) return 'mismatch';
  if (item.raw_text_included !== false) return 'mismatch';
  return 'aligned';
}
function svgStatus(packet) {
  const item = svg(packet);
  if (!item) return 'unavailable';
  if (item['data-td613-public-default'] && item['data-td613-public-default'] !== 'v2') return 'mismatch';
  if (item['data-td613-packet-hash'] && item['data-td613-packet-hash'] !== packetHash(packet)) return 'mismatch';
  if (item['data-td613-hash-topology-final'] && hashTopologyFinal(packet) && item['data-td613-hash-topology-final'] !== hashTopologyFinal(packet)) return 'mismatch';
  if (item['data-td613-raw-text-included'] !== 'false') return 'mismatch';
  return 'aligned';
}
function signatureStatus(packet) {
  const item = signature(packet);
  if (!item) return 'unavailable';
  if (item.signature_can_bind === false) return 'refused';
  if (item.packet_hash_at_signature && item.packet_hash_at_signature !== packetHash(packet)) return 'refused';
  if (item.public_default_at_signature && item.public_default_at_signature !== 'v2') return 'refused';
  return 'aligned';
}
function tcpStatus(packet) {
  const item = tcp(packet);
  if (!item) return 'unavailable';
  if (item.status === 'pending') return 'pending';
  if (item.status === 'blocked') return 'blocked';
  if (item.public_default && item.public_default !== 'v2') return 'mismatch';
  if (item.packet_hash_sha256 && item.packet_hash_sha256 !== packetHash(packet)) return 'mismatch';
  return item.status || 'aligned';
}
function eoStatus(packet) {
  const item = eo(packet);
  if (!item) return 'unavailable';
  if (item.status === 'pending') return 'pending';
  if (item.status === 'blocked') return 'blocked';
  if (item.observed_public_default && item.observed_public_default !== 'v2') return 'mismatch';
  if (item.observed_packet_hash && item.observed_packet_hash !== packetHash(packet)) return 'mismatch';
  return item.status || 'aligned';
}
function legacyV2Reopen(packet, v2Replay) { return v2Replay && v2Replay.status === 'pass' ? 'pass' : v2Replay && v2Replay.status === 'fail' ? 'fail' : 'unavailable'; }
function canStep1Countersign(packet) { const item = step1(packet); return item ? item.can_countersign === true : false; }
function noAuthorityClaimPending(status) { return status === 'aligned' || status === 'pending' || status === 'unavailable'; }

export function buildPublicDisplayRoles(packet, gate) {
  const mode = gate ? gate.public_default_after : 'v2-only';
  if (mode === 'dual-v2-v3') return Object.freeze({ v2: 'primary', v3: 'dual-verification-companion' });
  if (mode === 'v2-primary-v3-visible') return Object.freeze({ v2: 'primary', v3: 'forensic-secondary-visible' });
  if (mode === 'blocked') return Object.freeze({ v2: 'public-default', v3: 'blocked' });
  return Object.freeze({ v2: 'public-default', v3: getPath(packet, 'issuance.v3.status') === 'issued' ? 'hidden' : 'blocked' });
}

export async function buildPublicDefaultGate(packet, context = {}) {
  const authority = await verifySafeHarborPacketAuthority(packet);
  const v2 = authority.v2_replay || verifyV2Replay(packet);
  const v3 = authority.v3_replay || await verifyV3Replay(packet);
  const hash = authority.hash_replay || await verifyHashReplay(packet);
  const p5 = phase5Status(packet);
  const native = nativeSpineStatus(packet);
  const outside = outsideStatus(packet);
  const policy = explicitPolicy(context, packet);
  const rStatus = rendererStatus(packet);
  const sStatus = svgStatus(packet);
  const sigStatus = signatureStatus(packet);
  const tStatus = tcpStatus(packet);
  const eStatus = eoStatus(packet);
  const stepCan = canStep1Countersign(packet);
  const legacy = legacyV2Reopen(packet, v2);
  const rawText = rawTextExported({
    step1_countersignature: step1(packet),
    renderer_authority_metadata: renderer(packet),
    svg_authority_metadata: svg(packet),
    signature_overlay_authority: signature(packet),
    tcp_hook_authority: tcp(packet),
    eo_hook_authority: eo(packet),
    outside_witness_receipt: packet && packet.outside_witness_receipt
  });
  const refusal = [];
  if (v2.status === 'fail') refusal.push('v2 replay failed');
  if (v2.status === 'unavailable') refusal.push('v2 replay unavailable');
  if (hash.status === 'fail') refusal.push('hash replay failed');
  if (p5 === 'fail' || p5 === 'quarantine') refusal.push(`Phase 5 status is ${p5}`);
  if (v3.status === 'fail') refusal.push('v3 replay failed');
  if (outside === 'blocked') refusal.push('outside witnesses blocked');
  if (!stepCan) refusal.push('Step 1 cannot countersign');
  if (rStatus === 'mismatch') refusal.push('renderer authority mismatch');
  if (sStatus === 'mismatch') refusal.push('SVG authority mismatch');
  if (sigStatus === 'refused') refusal.push('signature overlay refused');
  if (tStatus === 'mismatch' || tStatus === 'blocked') refusal.push('TCP hook mismatch or block');
  if (eStatus === 'mismatch' || eStatus === 'blocked') refusal.push('EO hook mismatch or block');
  if (legacy === 'fail') refusal.push('legacy v2 reopen failed');
  if (rawText) refusal.push('raw text appeared in public display artifact');
  const majorBlock = refusal.length > 0;
  const inputs = Object.freeze({
    v2_replay: v2.status,
    v3_replay: v3.status,
    hash_replay: hash.status,
    phase5_status: p5,
    native_spine_status: native,
    outside_witness_alignment: outside,
    step1_can_countersign: stepCan,
    renderer_authority: rStatus,
    svg_authority: sStatus,
    signature_overlay: sigStatus,
    tcp_hook: tStatus,
    eo_hook: eStatus,
    legacy_v2_reopen: legacy,
    raw_text_exported: rawText
  });
  let gate_decision = 'keep-v2-only';
  let public_default_after = 'v2-only';
  let status = 'review';
  const allCore = v2.status === 'pass' && v3.status === 'pass' && hash.status === 'pass' && (p5 === 'pass' || p5 === 'review') && native === 'native' && outside === 'aligned' && stepCan && rStatus === 'aligned' && sStatus === 'aligned' && sigStatus === 'aligned' && noAuthorityClaimPending(tStatus) && noAuthorityClaimPending(eStatus) && legacy === 'pass' && rawText === false;
  if (majorBlock) {
    gate_decision = 'block';
    public_default_after = 'blocked';
    status = 'blocked';
  } else if (v3.status === 'blocked' || v3.status === 'unavailable' || native !== 'native') {
    gate_decision = 'keep-v2-only';
    public_default_after = 'v2-only';
    status = native === 'legacy' ? 'unavailable' : 'review';
  } else if (!allCore) {
    gate_decision = outside === 'partial' || tStatus === 'pending' || eStatus === 'pending' ? 'keep-v2-only' : 'keep-v2-only';
    public_default_after = 'v2-only';
    status = 'review';
  } else if (policy.allowDualDisplay && getPath(packet, 'recall_governance.v3.promotion_status') === 'v3-dual-verification-ready' && getPath(packet, 'public_default_policy.v3_public_ready') === true && getPath(packet, 'step1_countersignature.recommended_action') === 'dual-verify') {
    gate_decision = 'allow-dual-display';
    public_default_after = 'dual-v2-v3';
    status = 'pass';
  } else if (policy.allowV3Visible) {
    gate_decision = 'allow-v3-visible';
    public_default_after = 'v2-primary-v3-visible';
    status = 'pass';
  } else {
    gate_decision = 'keep-v2-only';
    public_default_after = 'v2-only';
    status = 'review';
  }
  const gate = {
    schema_version: GATE_SCHEMA,
    status,
    public_default_before: 'v2',
    public_default_after,
    gate_decision,
    gate_inputs: inputs,
    public_display_roles: null,
    refusal_reasons: [...new Set(refusal)],
    claim_supported: 'The public-default gate determines whether v3 may be displayed beside v2 under packet replay, native lineage, witness alignment, and public-default policy.',
    claim_limit: 'This gate does not prove civil identity, legal identity, public law approval, authorship ownership, or v3 supremacy.'
  };
  gate.public_display_roles = buildPublicDisplayRoles(packet, gate);
  return Object.freeze(gate);
}

export async function verifyPublicDefaultGate(packet, context = {}) {
  const gate = await buildPublicDefaultGate(packet, context);
  return Object.freeze({ status: gate.status, gate_decision: gate.gate_decision, public_default_after: gate.public_default_after, refusal_reasons: gate.refusal_reasons });
}

export function refusePublicDefaultPromotion(packet, reasons = []) {
  return Object.freeze({
    schema_version: GATE_SCHEMA,
    status: 'blocked',
    public_default_before: 'v2',
    public_default_after: 'blocked',
    gate_decision: 'block',
    gate_inputs: {},
    public_display_roles: { v2: 'public-default', v3: 'blocked' },
    refusal_reasons: reasons.length ? reasons.slice() : ['public-default promotion refused'],
    claim_supported: 'The public-default gate refused v3 visibility or dual display.',
    claim_limit: 'Refusal preserves v2 public default and does not adjudicate identity.'
  });
}

export function buildPhase8PublicDefaultPolicy(packet, gate) {
  const mode = gate && gate.public_default_after ? gate.public_default_after : 'v2-only';
  const decision = gate && gate.gate_decision ? gate.gate_decision : 'keep-v2-only';
  const displayMode = mode === 'dual-v2-v3' ? 'dual-display' : mode === 'v2-primary-v3-visible' ? 'v3-visible' : mode === 'blocked' ? 'blocked' : 'legacy-compatible';
  return Object.freeze({
    schema_version: POLICY_SCHEMA,
    display_mode: displayMode,
    public_shi: mode === 'v2-only' ? 'v2' : mode === 'blocked' ? 'blocked' : 'v2+v3',
    default_public_credential: 'v2',
    public_default_mode: mode,
    v3_public_visible: mode === 'v2-primary-v3-visible' || mode === 'dual-v2-v3',
    v3_public_ready: mode === 'dual-v2-v3',
    phase8_gate_status: gate ? gate.status : 'unavailable',
    phase8_gate_decision: decision,
    reason: 'v2 remains public default unless Phase 8 gate permits v3 companion display.'
  });
}

export function buildPhase8RendererPolicy(packet, gate) {
  const roles = buildPublicDisplayRoles(packet, gate);
  return Object.freeze({
    schema_version: RENDERER_SCHEMA,
    badge_number: getPath(packet, 'issuance.badge_number') || null,
    badge_number_v3: getPath(packet, 'issuance.v3.badge_number_v3') || null,
    v2_role: roles.v2,
    v3_role: roles.v3,
    public_default_credential: 'v2',
    public_display_mode: gate ? gate.public_default_after : 'v2-only',
    phase8_gate_status: gate ? gate.status : 'unavailable',
    phase8_gate_decision: gate ? gate.gate_decision : 'keep-v2-only',
    native_spine_status: nativeSpineStatus(packet),
    phase5_status: phase5Status(packet),
    outside_witness_alignment: outsideStatus(packet),
    packet_hash_sha256: packetHash(packet),
    hash_topology_final: hashTopologyFinal(packet),
    raw_text_included: false,
    renderer_claim_limit: 'Renderer metadata displays Phase 8 policy; it does not create public authority.'
  });
}

export function buildPhase8SvgPolicy(packet, gate) {
  const roles = buildPublicDisplayRoles(packet, gate);
  return Object.freeze({
    schema_version: SVG_SCHEMA,
    'data-td613-public-default': 'v2',
    'data-td613-public-display-mode': gate ? gate.public_default_after : 'v2-only',
    'data-td613-v2-role': roles.v2,
    'data-td613-v3-role': roles.v3,
    'data-td613-phase8-gate': gate ? gate.status : 'unavailable',
    'data-td613-phase8-decision': gate ? gate.gate_decision : 'keep-v2-only',
    'data-td613-native-spine': nativeSpineStatus(packet),
    'data-td613-phase5-status': phase5Status(packet),
    'data-td613-outside-witnesses': outsideStatus(packet),
    'data-td613-packet-hash': packetHash(packet),
    'data-td613-hash-topology-final': hashTopologyFinal(packet),
    'data-td613-raw-text-included': 'false'
  });
}

export function buildPhase8ReceiptPolicy(packet, gate) {
  return Object.freeze({
    schema_version: RECEIPT_SCHEMA,
    public_default: 'v2',
    public_display_mode: gate ? gate.public_default_after : 'v2-only',
    gate_status: gate ? gate.status : 'unavailable',
    gate_decision: gate ? gate.gate_decision : 'keep-v2-only',
    v2_role: gate && gate.public_display_roles ? gate.public_display_roles.v2 : 'public-default',
    v3_role: gate && gate.public_display_roles ? gate.public_display_roles.v3 : 'hidden',
    phase5_status: phase5Status(packet),
    outside_witness_alignment: outsideStatus(packet),
    raw_text_exported: false,
    claim_limit: 'Receipt reports Phase 8 public-display policy; it does not create public authority.'
  });
}

export async function applyPublicDefaultGate(packet, context = {}) {
  let out = clone(packet || {});
  if (!out.outside_witness_alignment) {
    out.outside_witness_alignment = await buildOutsideWitnessAlignment(out);
  }
  let gate = await buildPublicDefaultGate(out, context);
  out.phase8_public_default_gate = gate;
  out.public_default_policy = buildPhase8PublicDefaultPolicy(out, gate);
  out.renderer_authority_metadata = buildPhase8RendererPolicy(out, gate);
  out.svg_authority_metadata = buildPhase8SvgPolicy(out, gate);
  out.phase8_receipt_policy = buildPhase8ReceiptPolicy(out, gate);
  if (out.outside_witness_receipt) out.outside_witness_receipt.phase8_public_default_gate = clone(out.phase8_receipt_policy);
  if (out.step1_countersignature) {
    out.step1_countersignature.phase8_public_default_gate = {
      status: gate.status,
      gate_decision: gate.gate_decision,
      public_display_mode: gate.public_default_after
    };
    if (gate.status === 'blocked' && !out.step1_countersignature.refusal_reasons.includes('Phase 8 gate blocked public display')) {
      out.step1_countersignature.refusal_reasons.push('Phase 8 gate blocked public display');
      out.step1_countersignature.can_countersign = false;
      out.step1_countersignature.recommended_action = 'block';
    }
  }
  out.outside_witness_alignment = await buildOutsideWitnessAlignment(out, {
    renderer_authority_metadata: out.renderer_authority_metadata,
    svg_metadata: out.svg_authority_metadata,
    step1_envelope: out.step1_countersignature,
    signature_overlay_authority: out.signature_overlay_authority,
    tcp_hook_authority: out.tcp_hook_authority,
    eo_hook_authority: out.eo_hook_authority,
    operator_receipt: out.outside_witness_receipt
  });
  return out;
}

if (typeof window !== 'undefined') {
  window.TD613_SAFE_HARBOR_PUBLIC_DEFAULT_GATE = Object.freeze({
    buildPublicDefaultGate,
    verifyPublicDefaultGate,
    applyPublicDefaultGate,
    buildPublicDisplayRoles,
    buildPhase8RendererPolicy,
    buildPhase8SvgPolicy,
    buildPhase8ReceiptPolicy,
    buildPhase8PublicDefaultPolicy,
    refusePublicDefaultPromotion
  });
  window.dispatchEvent(new CustomEvent('td613:safe-harbor:public-default-gate-ready', { detail: { version: GATE_SCHEMA } }));
}
