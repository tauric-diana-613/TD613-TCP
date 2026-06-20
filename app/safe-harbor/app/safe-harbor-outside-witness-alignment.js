import {
  buildCountersignatoryIntake,
  buildStep1Countersignature,
  buildPhase4CountersignatureEvidenceReview
} from './safe-harbor-step1-countersignature.js';
import { verifyHashReplay, verifyV2Replay, verifyV3Replay } from './safe-harbor-authority-verifier.js';

const OUTSIDE_WITNESS_SCHEMA = 'td613.safe-harbor.outside-witness-alignment/v1';
const RENDERER_SCHEMA = 'td613.safe-harbor.renderer-authority/v2';
const SVG_SCHEMA = 'td613.safe-harbor.svg-authority-metadata/v1';
const SIGNATURE_SCHEMA = 'td613.safe-harbor.signature-overlay-authority/v1';
const TCP_SCHEMA = 'td613.safe-harbor.tcp-hook-authority/v1';
const EO_SCHEMA = 'td613.safe-harbor.eo-hook-authority/v1';
const RECEIPT_SCHEMA = 'td613.safe-harbor.outside-witness-receipt/v1';

function getPath(value, path) { return String(path || '').split('.').reduce((node, key) => (node && Object.prototype.hasOwnProperty.call(node, key) ? node[key] : undefined), value); }
function publicDefault(packet) { return getPath(packet, 'public_default_policy.default_public_credential') || 'v2'; }
function phase5Status(packet) { return getPath(packet, 'phase5_replay_hardening.status') || 'unavailable'; }
function lineage(packet) {
  const p5 = phase5Status(packet);
  if (p5 === 'quarantine' || p5 === 'fail') return 'quarantined';
  const spine = getPath(packet, 'native_spine_purification.status');
  if (spine === 'native') return 'native';
  if (spine === 'export-hardened') return 'export-hardened';
  if (spine === 'legacy') return 'legacy';
  if (spine === 'blocked') return 'blocked';
  const surface = getPath(packet, 'packet_authority_surface.rich_profile_promotion');
  if (surface === 'native') return 'native';
  if (surface === 'export-normalized') return 'export-hardened';
  return 'legacy';
}
function v3Role(packet) {
  const issued = getPath(packet, 'issuance.v3.status');
  const promotion = getPath(packet, 'recall_governance.v3.promotion_status');
  if (!issued) return 'unavailable';
  if (issued === 'blocked') return 'blocked';
  if (promotion === 'v3-dual-verification-ready' || promotion === 'v3-public-default-ready') return 'dual-verification-ready';
  return 'forensic-secondary';
}
function packetHash(packet) { return packet && packet.packet_hash_sha256 ? packet.packet_hash_sha256 : null; }
function hashTopologyFinal(packet) { return getPath(packet, 'hash_topology.final_packet_hash_sha256') || null; }
function rawTextFound(value) { return /raw_text|Future self|Past self|Higher self|future self will carry|past self remembers|higher self names/u.test(JSON.stringify(value || {})); }
function grammar(packet, step1Action = 'legacy-recall', hashReplay = 'unavailable') {
  return Object.freeze({
    public_default: 'v2',
    v3_role: v3Role(packet),
    native_spine_status: lineage(packet),
    phase5_status: phase5Status(packet),
    hash_replay: hashReplay,
    step1_action: step1Action
  });
}

export function buildRendererAuthorityV2(packet) {
  return Object.freeze({
    schema_version: RENDERER_SCHEMA,
    badge_number: getPath(packet, 'issuance.badge_number') || null,
    badge_number_v3: getPath(packet, 'issuance.v3.badge_number_v3') || null,
    v2_role: 'public-default',
    v3_role: v3Role(packet),
    public_default_credential: 'v2',
    native_spine_status: lineage(packet),
    phase5_status: phase5Status(packet),
    packet_hash_sha256: packetHash(packet),
    hash_topology_final: hashTopologyFinal(packet),
    raw_text_included: false,
    renderer_claim_limit: 'Renderer metadata displays packet authority; it does not create authority.'
  });
}

export function buildSvgAuthorityMetadata(packet) {
  const renderer = buildRendererAuthorityV2(packet);
  return Object.freeze({
    schema_version: SVG_SCHEMA,
    'data-td613-public-default': 'v2',
    'data-td613-v2-role': 'public-default',
    'data-td613-v3-role': renderer.v3_role,
    'data-td613-native-spine': renderer.native_spine_status,
    'data-td613-phase5-status': renderer.phase5_status,
    'data-td613-packet-hash': renderer.packet_hash_sha256,
    'data-td613-hash-topology-final': renderer.hash_topology_final,
    'data-td613-raw-text-included': 'false'
  });
}

export async function buildSignatureOverlayAuthority(packet, context = {}) {
  const hash = await verifyHashReplay(packet);
  const renderer = context.renderer_authority_metadata || buildRendererAuthorityV2(packet);
  const refusal = [];
  const p5 = phase5Status(packet);
  if (p5 === 'fail' || p5 === 'quarantine') refusal.push(`Phase 5 status is ${p5}`);
  if (hash.status === 'fail') refusal.push('hash replay failed');
  if (publicDefault(packet) !== 'v2') refusal.push('public default attempted to move beyond v2 before Phase 8');
  if (renderer.packet_hash_sha256 && renderer.packet_hash_sha256 !== packetHash(packet)) refusal.push('renderer metadata disagrees with packet hash');
  if (renderer.public_default_credential && renderer.public_default_credential !== 'v2') refusal.push('renderer metadata attempted public-default promotion');
  return Object.freeze({
    schema_version: SIGNATURE_SCHEMA,
    signature_status: context.signature_status || (getPath(packet, 'signature.sig') ? 'attached' : 'absent'),
    packet_lineage_at_signature: lineage(packet),
    packet_hash_at_signature: packetHash(packet),
    phase5_status_at_signature: p5,
    public_default_at_signature: 'v2',
    v3_role_at_signature: v3Role(packet),
    signature_can_bind: refusal.length === 0,
    binding_refusal_reasons: refusal
  });
}

export function buildTcpHookAuthority(packet, context = {}) {
  const p5 = phase5Status(packet);
  const blocked = p5 === 'fail' || p5 === 'quarantine';
  return Object.freeze({
    schema_version: TCP_SCHEMA,
    status: context.status || (blocked ? 'blocked' : 'aligned'),
    packet_hash_sha256: packetHash(packet),
    native_spine_status: lineage(packet),
    phase5_status: p5,
    public_default: 'v2',
    v3_role: v3Role(packet),
    route_state: blocked ? 'refused' : lineage(packet) === 'native' ? 'native-witness' : lineage(packet) === 'export-hardened' ? 'export-witness' : 'legacy-witness',
    claim_limit: 'TCP hook carries packet authority state; it does not create authority.'
  });
}

export function buildEoHookAuthority(packet, context = {}) {
  const p5 = phase5Status(packet);
  const blocked = p5 === 'fail' || p5 === 'quarantine';
  return Object.freeze({
    schema_version: EO_SCHEMA,
    status: context.status || (blocked ? 'blocked' : 'aligned'),
    observed_packet_hash: packetHash(packet),
    observed_lineage: lineage(packet),
    observed_phase5_status: p5,
    observed_public_default: 'v2',
    observed_v3_role: v3Role(packet),
    exposure_rule: 'no raw text; packet-state only',
    claim_limit: 'EO hook observes packet authority posture; it does not infer identity or promote public authority.'
  });
}

export function buildOperatorReceipt(packet, witnesses = {}) {
  return Object.freeze({
    schema_version: RECEIPT_SCHEMA,
    packet_lineage: lineage(packet),
    public_default: 'v2',
    v3_role: v3Role(packet),
    hash_replay: witnesses.hash_replay || 'unavailable',
    phase5_status: phase5Status(packet),
    step1_status: witnesses.step1_status || 'unavailable',
    renderer_status: witnesses.renderer_status || 'unavailable',
    svg_status: witnesses.svg_status || 'unavailable',
    signature_overlay_status: witnesses.signature_overlay_status || 'unavailable',
    tcp_hook_status: witnesses.tcp_hook_status || 'unavailable',
    eo_hook_status: witnesses.eo_hook_status || 'unavailable',
    raw_text_exported: false
  });
}

function compareWitness(packet, name, witness, expected) {
  if (!witness) return { status: 'unavailable', reasons: [] };
  const reasons = [];
  const compare = (label, actual, want) => { if (actual !== undefined && actual !== null && want !== undefined && want !== null && actual !== want) reasons.push(`${name} ${label} mismatch`); };
  if (name === 'renderer_metadata') {
    compare('public_default', witness.public_default_credential, 'v2');
    compare('v3_role', witness.v3_role, expected.v3_role);
    compare('lineage', witness.native_spine_status, expected.native_spine_status);
    compare('phase5', witness.phase5_status, expected.phase5_status);
    compare('packet_hash', witness.packet_hash_sha256, packetHash(packet));
    compare('hash_topology_final', witness.hash_topology_final, hashTopologyFinal(packet));
    compare('raw_text', witness.raw_text_included, false);
  } else if (name === 'svg_metadata') {
    compare('public_default', witness['data-td613-public-default'], 'v2');
    compare('v3_role', witness['data-td613-v3-role'], expected.v3_role);
    compare('lineage', witness['data-td613-native-spine'], expected.native_spine_status);
    compare('phase5', witness['data-td613-phase5-status'], expected.phase5_status);
    compare('packet_hash', witness['data-td613-packet-hash'], packetHash(packet));
    compare('hash_topology_final', witness['data-td613-hash-topology-final'], hashTopologyFinal(packet));
    compare('raw_text', witness['data-td613-raw-text-included'], 'false');
  } else if (name === 'tcp_hook') {
    compare('public_default', witness.public_default, 'v2');
    compare('v3_role', witness.v3_role, expected.v3_role);
    compare('lineage', witness.native_spine_status, expected.native_spine_status);
    compare('phase5', witness.phase5_status, expected.phase5_status);
    compare('packet_hash', witness.packet_hash_sha256, packetHash(packet));
  } else if (name === 'eo_hook') {
    compare('public_default', witness.observed_public_default, 'v2');
    compare('v3_role', witness.observed_v3_role, expected.v3_role);
    compare('lineage', witness.observed_lineage, expected.native_spine_status);
    compare('phase5', witness.observed_phase5_status, expected.phase5_status);
    compare('packet_hash', witness.observed_packet_hash, packetHash(packet));
  } else if (name === 'signature_overlay') {
    compare('public_default', witness.public_default_at_signature, 'v2');
    compare('v3_role', witness.v3_role_at_signature, expected.v3_role);
    compare('lineage', witness.packet_lineage_at_signature, expected.native_spine_status);
    compare('phase5', witness.phase5_status_at_signature, expected.phase5_status);
    compare('packet_hash', witness.packet_hash_at_signature, packetHash(packet));
    if (witness.signature_can_bind === false) reasons.push('signature overlay refused binding');
  } else if (name === 'step1_envelope') {
    compare('public_default', witness.public_default, 'v2');
    compare('v3_role', witness.v3_role, expected.v3_role);
    compare('lineage', witness.packet_lineage, expected.native_spine_status);
    compare('phase5', witness.phase5_status, expected.phase5_status);
    compare('hash_replay', witness.hash_replay, expected.hash_replay);
    if (witness.can_countersign === false) reasons.push('Step 1 refused countersignature');
  }
  if (rawTextFound(witness)) reasons.push(`${name} contains raw text marker`);
  const status = reasons.length ? (name === 'step1_envelope' || name === 'signature_overlay' ? 'refused' : 'mismatch') : 'aligned';
  return { status, reasons };
}

export async function verifyOutsideWitnessAlignment(packet, witnesses = {}) {
  const hash = await verifyHashReplay(packet);
  const expected = grammar(packet, witnesses.step1_envelope && witnesses.step1_envelope.recommended_action ? witnesses.step1_envelope.recommended_action : 'legacy-recall', hash.status);
  const map = {
    step1_envelope: witnesses.step1_envelope,
    countersignatory_intake: witnesses.countersignatory_intake,
    renderer_metadata: witnesses.renderer_authority_metadata || witnesses.renderer_metadata,
    svg_metadata: witnesses.svg_metadata,
    signature_overlay: witnesses.signature_overlay_authority || witnesses.signature_overlay,
    tcp_hook: witnesses.tcp_hook_authority || witnesses.tcp_hook,
    eo_hook: witnesses.eo_hook_authority || witnesses.eo_hook,
    operator_receipt: witnesses.operator_receipt || witnesses.outside_witness_receipt
  };
  const aligned = [];
  const pending = [];
  const mismatched = [];
  const blocked = [];
  const refusal = [];
  for (const [name, value] of Object.entries(map)) {
    if (!value) { pending.push(name); continue; }
    let result;
    if (name === 'countersignatory_intake') result = { status: value.safe_to_countersign === false && value.intake_status === 'refused' ? 'refused' : value.intake_status === 'review' ? 'pending' : 'aligned', reasons: value.conflicting_surfaces || [] };
    else if (name === 'operator_receipt') result = { status: value.raw_text_exported === false ? 'aligned' : 'mismatch', reasons: value.raw_text_exported === false ? [] : ['operator receipt raw text exported'] };
    else result = compareWitness(packet, name, value, expected);
    if (result.status === 'aligned') aligned.push(name);
    else if (result.status === 'pending' || result.status === 'unavailable') pending.push(name);
    else if (result.status === 'refused' || result.status === 'blocked') { blocked.push(name); refusal.push(...result.reasons); }
    else { mismatched.push(name); refusal.push(...result.reasons); }
  }
  const status = blocked.length || mismatched.length ? 'blocked' : pending.length ? 'partial' : 'aligned';
  return Object.freeze({ status, aligned_witnesses: aligned, pending_witnesses: pending, mismatched_witnesses: mismatched, blocked_witnesses: blocked, refusal_reasons: [...new Set(refusal)] });
}

export async function buildOutsideWitnessAlignment(packet, witnesses = {}) {
  const hash = await verifyHashReplay(packet);
  const v2 = verifyV2Replay(packet);
  const v3 = await verifyV3Replay(packet);
  const step1 = witnesses.step1_envelope || await buildStep1Countersignature(packet, witnesses);
  const intake = witnesses.countersignatory_intake || await buildCountersignatoryIntake(packet, witnesses);
  const renderer = witnesses.renderer_authority_metadata || witnesses.renderer_metadata || buildRendererAuthorityV2(packet);
  const svg = witnesses.svg_metadata || buildSvgAuthorityMetadata(packet);
  const signature = witnesses.signature_overlay_authority || witnesses.signature_overlay || await buildSignatureOverlayAuthority(packet, { renderer_authority_metadata: renderer });
  const tcp = witnesses.tcp_hook_authority || witnesses.tcp_hook || buildTcpHookAuthority(packet);
  const eo = witnesses.eo_hook_authority || witnesses.eo_hook || buildEoHookAuthority(packet);
  const receipt = witnesses.operator_receipt || buildOperatorReceipt(packet, {
    hash_replay: hash.status,
    step1_status: step1.can_countersign ? 'aligned' : 'refused',
    renderer_status: 'aligned',
    svg_status: 'aligned',
    signature_overlay_status: signature.signature_can_bind ? 'aligned' : 'refused',
    tcp_hook_status: tcp.status === 'aligned' ? 'aligned' : tcp.status,
    eo_hook_status: eo.status === 'aligned' ? 'aligned' : eo.status
  });
  const verification = await verifyOutsideWitnessAlignment(packet, {
    step1_envelope: step1,
    countersignatory_intake: intake,
    renderer_metadata: renderer,
    svg_metadata: svg,
    signature_overlay: signature,
    tcp_hook: tcp,
    eo_hook: eo,
    operator_receipt: receipt
  });
  const status = verification.status === 'aligned' ? 'aligned' : verification.status === 'blocked' ? 'blocked' : 'partial';
  return Object.freeze({
    schema_version: OUTSIDE_WITNESS_SCHEMA,
    status,
    witnesses: {
      step1_envelope: verification.blocked_witnesses.includes('step1_envelope') ? 'refused' : verification.pending_witnesses.includes('step1_envelope') ? 'pending' : 'aligned',
      countersignatory_intake: intake.intake_status === 'refused' ? 'refused' : intake.intake_status === 'review' ? 'pending' : 'aligned',
      renderer_metadata: verification.mismatched_witnesses.includes('renderer_metadata') ? 'mismatch' : 'aligned',
      svg_metadata: verification.mismatched_witnesses.includes('svg_metadata') ? 'mismatch' : 'aligned',
      signature_overlay: signature.signature_can_bind ? 'aligned' : 'refused',
      tcp_hook: tcp.status || 'aligned',
      eo_hook: eo.status || 'aligned',
      operator_receipt: verification.mismatched_witnesses.includes('operator_receipt') ? 'mismatch' : 'aligned'
    },
    authority_grammar: grammar(packet, step1.recommended_action, hash.status),
    refusal_reasons: verification.refusal_reasons,
    raw_text_exported: false,
    claim_supported: 'Outside witnesses align to packet-declared authority, replay, lineage, and public-default policy.',
    claim_limit: 'Outside witnesses attest packet-reading discipline; they do not prove civil identity, legal identity, public law status, or public-default promotion.',
    step1_countersignature: step1,
    countersignatory_intake: intake,
    renderer_authority_metadata: renderer,
    svg_authority_metadata: svg,
    signature_overlay_authority: signature,
    tcp_hook_authority: tcp,
    eo_hook_authority: eo,
    outside_witness_receipt: receipt,
    replay_snapshot: { hash_replay: hash.status, v2_replay: v2.status, v3_replay: v3.status }
  });
}

if (typeof window !== 'undefined') {
  window.TD613_SAFE_HARBOR_OUTSIDE_WITNESS = Object.freeze({
    buildOutsideWitnessAlignment,
    buildStep1Countersignature,
    buildCountersignatoryIntake,
    buildRendererAuthorityV2,
    buildSvgAuthorityMetadata,
    buildSignatureOverlayAuthority,
    buildTcpHookAuthority,
    buildEoHookAuthority,
    buildOperatorReceipt,
    verifyOutsideWitnessAlignment,
    buildPhase4CountersignatureEvidenceReview
  });
  window.dispatchEvent(new CustomEvent('td613:safe-harbor:outside-witness-ready', { detail: { version: OUTSIDE_WITNESS_SCHEMA } }));
}
