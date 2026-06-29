import { finalizeSafeHarborPacket } from './safe-harbor-native-finalizer.js?v=202606290125';
import { buildPhase5ReplayHardening, applyPhase5Quarantine } from './safe-harbor-phase5-replay-hardening.js?v=202606290125';
import { buildOutsideWitnessAlignment } from './safe-harbor-outside-witness-alignment.js';
import { applyPublicDefaultGate } from './safe-harbor-public-default-gate.js?v=202606290205';
import { applyReleaseDiscipline } from './safe-harbor-release-discipline.js';
import { SAFE_HARBOR_RUNTIME_MARKERS } from './safe-harbor-policy-constants.js';
import { verifyHashReplay } from './safe-harbor-authority-verifier.js?v=202606290125';

export const PIPELINE_VERSION = 'safe-harbor-packet-pipeline/v2-phase9-1-maintenance-seal-stabilized-runtime';

function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function getPath(value, path) { return String(path || '').split('.').reduce((node, key) => (node && Object.prototype.hasOwnProperty.call(node, key) ? node[key] : undefined), value); }
function nativeBorn(packet) { return Boolean(getPath(packet, 'native_spine_purification.status') === 'native'); }
function exportHardened(packet) { return Boolean(getPath(packet, 'native_spine_purification.status') === 'export-hardened'); }

export function rawSegmentsFromSaved(saved) {
  let source = saved && saved.ingress && saved.ingress.segments ? saved.ingress.segments : null;
  if (!source && saved && saved.sealed && saved.sealed.segments) source = saved.sealed.segments;
  if (!source || typeof source !== 'object') return null;
  const out = {};
  ['future_self', 'past_self', 'higher_self'].forEach((key) => {
    const value = source[key];
    out[key] = typeof value === 'string' ? value : (value && typeof value.raw_text === 'string' ? value.raw_text : '');
  });
  return out.future_self && out.past_self && out.higher_self ? out : null;
}

export function hasRawSegments(saved) {
  return Boolean(rawSegmentsFromSaved(saved));
}

export function buildPipelineRuntimeMarker() {
  return Object.freeze({ ...SAFE_HARBOR_RUNTIME_MARKERS, pipeline_version: PIPELINE_VERSION });
}

export async function refreshPhase5ThroughPipeline(packet, options = {}) {
  let out = clone(packet || {});
  const hardening = await buildPhase5ReplayHardening(out, { includeTamperFixtures: Boolean(options.includeTamperFixtures) });
  out.phase5_replay_hardening = hardening;
  out = applyPhase5Quarantine(out, hardening);
  return out;
}

async function canReusePhase5(packet) {
  if (getPath(packet, 'phase5_replay_hardening.status') !== 'pass') return false;
  const replay = await verifyHashReplay(packet);
  return replay.status === 'pass';
}

export async function attachOutsideWitnessesThroughPipeline(packet) {
  const out = clone(packet || {});
  const alignment = await buildOutsideWitnessAlignment(out);
  out.outside_witness_alignment = alignment;
  out.step1_countersignature = alignment.step1_countersignature;
  out.countersignatory_intake = alignment.countersignatory_intake;
  out.renderer_authority_metadata = { ...(alignment.renderer_authority_metadata || {}), ...(out.renderer_authority_metadata || {}) };
  out.svg_authority_metadata = { ...(alignment.svg_authority_metadata || {}), ...(out.svg_authority_metadata || {}) };
  out.signature_overlay_authority = alignment.signature_overlay_authority;
  out.tcp_hook_authority = alignment.tcp_hook_authority;
  out.eo_hook_authority = alignment.eo_hook_authority;
  out.outside_witness_receipt = alignment.outside_witness_receipt;
  return out;
}

export async function applyPublicGateThroughPipeline(packet, options = {}) {
  return applyPublicDefaultGate(packet, options.phase8Context || { phase8Policy: { public_display_mode: 'v2-only' } });
}

export async function applyReleaseDisciplineThroughPipeline(packet, options = {}) {
  return applyReleaseDiscipline(packet, options.phase9Context || {});
}

export function attachPipelineState(packet) {
  const out = clone(packet || {});
  out.pipeline_state = {
    schema_version: 'td613.safe-harbor.pipeline-state/v1',
    pipeline_version: PIPELINE_VERSION,
    last_applied_hash: out.packet_hash_sha256 || null,
    phase5_status: getPath(out, 'phase5_replay_hardening.status') || 'unavailable',
    outside_witness_status: getPath(out, 'outside_witness_alignment.status') || 'unavailable',
    phase8_gate_status: getPath(out, 'phase8_public_default_gate.status') || 'unavailable',
    phase9_release_class: getPath(out, 'phase9_release_discipline.release_class') || 'operator-only'
  };
  return out;
}

export async function finalizePacketThroughPipeline(packet, saved, options = {}) {
  if (!packet || typeof packet !== 'object') return packet;
  if (nativeBorn(packet)) return normalizePacketThroughPipeline(packet, saved, { ...options, skipFinalize: true });
  const segments = rawSegmentsFromSaved(saved);
  const mode = options.mode || (segments ? 'native' : 'legacy-repair');
  if (!segments && mode !== 'native') return normalizePacketThroughPipeline(packet, saved, { ...options, skipFinalize: true });
  const finalized = await finalizeSafeHarborPacket(packet, {
    mode,
    segments,
    includePhase5: true,
    includeTamperFixtures: Boolean(options.includeTamperFixtures),
    allowV3Rebuild: false,
    rawTextExportAllowed: false
  });
  return normalizePacketThroughPipeline(finalized, saved, { ...options, skipFinalize: true });
}

export async function normalizePacketThroughPipeline(packet, saved, options = {}) {
  if (!packet || typeof packet !== 'object') return packet;
  let out = clone(packet);
  if (!options.skipFinalize && !nativeBorn(out) && !exportHardened(out)) {
    return finalizePacketThroughPipeline(out, saved, { ...options, mode: hasRawSegments(saved) ? 'native' : 'export-normalized' });
  }
  if (!(await canReusePhase5(out))) out = await refreshPhase5ThroughPipeline(out, options);
  out = await attachOutsideWitnessesThroughPipeline(out, options);
  out = await applyPublicGateThroughPipeline(out, options);
  out = await applyReleaseDisciplineThroughPipeline(out, options);
  return attachPipelineState(out);
}

export function packetExportReadyAfterPipeline(packet) {
  if (!packet || !packet.bridge || !packet.bridge.export_gate || !packet.bridge.export_gate.ready) return false;
  const phase5 = getPath(packet, 'phase5_replay_hardening.status');
  const phase8 = getPath(packet, 'phase8_public_default_gate.status');
  const phase9 = getPath(packet, 'phase9_release_discipline.release_class');
  if (phase5 !== 'pass') return false;
  if (!['pass', 'review'].includes(phase8)) return false;
  return ['verification-ready', 'public-readable'].includes(phase9);
}

if (typeof window !== 'undefined') {
  window.TD613_SAFE_HARBOR_PACKET_PIPELINE = Object.freeze({
    PIPELINE_VERSION,
    rawSegmentsFromSaved,
    hasRawSegments,
    buildPipelineRuntimeMarker,
    finalizePacketThroughPipeline,
    normalizePacketThroughPipeline,
    refreshPhase5ThroughPipeline,
    attachOutsideWitnessesThroughPipeline,
    applyPublicGateThroughPipeline,
    applyReleaseDisciplineThroughPipeline,
    packetExportReadyAfterPipeline
  });
  window.dispatchEvent(new CustomEvent('td613:safe-harbor:maintenance-seal-ready', { detail: { version: PIPELINE_VERSION } }));
}
