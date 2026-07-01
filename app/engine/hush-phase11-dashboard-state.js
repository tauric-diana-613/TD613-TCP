import {
  HUSH_RELEASE_EVIDENCE_LADDER,
  HUSH_PHASE10_NON_CLAIMS
} from '../data/hush-phase10-release-statuses.js';
import { buildHushPhase10ReleasePacket } from './hush-phase10-release-discipline.js';
import { listHushPhase11Surfaces } from './hush-phase11-surface-registry.js';

export const HUSH_PHASE11_DASHBOARD_STATE_SCHEMA = 'td613.hush.phase11.dashboard-state/v1';

const CHAIN_LANES = Object.freeze([
  ['customizer', 'Customizer packet'],
  ['outgoing_contract', 'Outgoing contract'],
  ['provider_log', 'Provider log'],
  ['contract_log_pair', 'Contract-log pair'],
  ['stylometry_audit', 'Stylometry audit'],
  ['eorfd_interface', 'EO-RFD interface'],
  ['unified_audit', 'Unified audit packet'],
  ['mask_gallery', 'Mask gallery registry'],
  ['mask_packet', 'Per-mask packet'],
  ['phase9_collision', 'Phase 9 collision audit'],
  ['phase10_release', 'Phase 10 release discipline']
]);

const RUNTIME_FIELDS = Object.freeze([
  'url',
  'build_or_commit',
  'console_network_notes',
  'outbound_contract_artifact',
  'inbound_provider_log_artifact',
  'export_artifact',
  'candidate_output',
  'mask_selector_state',
  'public_default_state',
  'raw_exposure_state'
]);

function valuePresent(value) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && value !== '';
}

function packetStatus(packet, key) {
  if (!packet) return key === 'phase10_release' ? 'missing' : 'missing';
  if (packet.blocked === true || packet.release_status === 'blocked') return 'blocked';
  if (packet.deferred === true) return 'deferred';
  return 'present';
}

function packetId(packet) {
  return packet?.packet_id || packet?.contract_packet_id || packet?.provider_log_packet_id || packet?.pair_packet_id || packet?.mask_packet_id || packet?.dashboard_id || null;
}

function packetSchema(packet) {
  return packet?.schema || packet?.schema_version || null;
}

function buildChainSpine(sourcePackets, phase10Packet) {
  return Object.freeze(CHAIN_LANES.map(([key, label]) => {
    const packet = key === 'phase10_release' ? phase10Packet : sourcePackets[key];
    return Object.freeze({
      lane: key,
      label,
      status: packetStatus(packet, key),
      packet_id: packetId(packet),
      schema: packetSchema(packet),
      evidence_class: key === 'provider_log' ? 'provider testimony' : key === 'phase10_release' ? 'release discipline' : 'packet surface',
      blocker: packet?.hard_blockers?.[0] || null
    });
  }));
}

function buildEvidenceLadder(phase10Packet) {
  const level = phase10Packet.evidence_ladder_level ?? 0;
  const hardBlockers = phase10Packet.hard_blockers || [];
  return Object.freeze(HUSH_RELEASE_EVIDENCE_LADDER.map((entry) => {
    let status = 'missing';
    if (hardBlockers.length && entry.level >= level) status = 'blocked';
    else if (entry.level < level) status = 'complete';
    else if (entry.level === level) status = phase10Packet.release_status === 'blocked' ? 'blocked' : 'current';
    if (phase10Packet.release_status === 'runtime-flight-pending' && entry.id === 'L6') status = 'deferred';
    return Object.freeze({
      ...entry,
      status,
      source_phase: entry.level >= 6 ? 'phase10-runtime-boundary' : 'phase10-release-discipline',
      blocking_reason: status === 'blocked' ? hardBlockers[0] || 'blocked upstream' : null
    });
  }));
}

function buildRuntimePosture(runtime = {}) {
  const missing = RUNTIME_FIELDS.filter((field) => !valuePresent(runtime[field]));
  let status = 'not-run';
  if (runtime.pass === true && missing.length === 0) status = 'complete';
  else if (runtime.pass === true && missing.length > 0) status = 'partial';
  else if (runtime.status === 'pending') status = 'pending';
  return Object.freeze({
    status,
    pass: runtime.pass === true,
    required_fields: RUNTIME_FIELDS,
    missing_fields: Object.freeze(missing),
    note: 'Vercel ready is not runtime-flight-pass; packet artifacts must be captured.'
  });
}

function buildBoundaryPosture(phase10Packet = {}) {
  const safeHarbor = phase10Packet.safe_harbor_boundary || {};
  const aperture = phase10Packet.aperture_boundary || {};
  const eorfd = phase10Packet.eorfd_boundary || { firmware_status: 'not-attached' };
  return Object.freeze({
    safe_harbor: Object.freeze({
      assessed: safeHarbor.assessed === true,
      eligible: safeHarbor.eligible === true,
      receipt_treated_as_proof: safeHarbor.receipt_treated_as_proof === true,
      status: safeHarbor.assessed === true ? (safeHarbor.eligible === true ? 'harbor-eligible' : 'assessed-not-eligible') : 'not-assessed'
    }),
    aperture: Object.freeze({
      checked: aperture.checked === true,
      release_authority: aperture.release_authority === true,
      validator_bypass: aperture.validator_bypass === true,
      status: aperture.checked === true ? 'checked' : 'unchecked'
    }),
    eorfd: Object.freeze({
      firmware_status: eorfd.firmware_status || 'interface-only',
      status: eorfd.firmware_status === 'firmware-adapter-verified' ? 'adapter-verified' : 'interface-only'
    })
  });
}

function buildExportPosture(phase10Packet = {}) {
  const policy = phase10Packet.export_policy_validation || {};
  return Object.freeze({
    public_default_allowed: policy.public_default_allowed === true,
    public_default_defined: policy.public_default_allowed !== undefined,
    raw_sample_exported: policy.raw_sample_exported === true || policy.raw_sample_export_allowed === true,
    raw_candidate_exported: policy.raw_candidate_exported === true || policy.raw_candidate_export_allowed === true,
    redacted_export_possible: policy.pass === true && policy.public_default_allowed === false && policy.raw_sample_exported !== true && policy.raw_candidate_exported !== true && policy.raw_sample_export_allowed !== true && policy.raw_candidate_export_allowed !== true,
    operator_private_required: policy.raw_sample_exported === true || policy.raw_candidate_exported === true || policy.raw_sample_export_allowed === true || policy.raw_candidate_export_allowed === true
  });
}

export function buildHushPhase11DashboardState(input = {}) {
  const sourcePackets = input.source_packets || {};
  const phase10Packet = input.phase10_packet || buildHushPhase10ReleasePacket(input.release_packet || {});
  const hardBlockers = Object.freeze([...(phase10Packet.hard_blockers || []), ...(input.hard_blockers || [])]);
  const warnings = Object.freeze(input.warnings || []);
  const dashboard = {
    schema: HUSH_PHASE11_DASHBOARD_STATE_SCHEMA,
    dashboard_id: input.dashboard_id || 'HUSH-P11-DASHBOARD-LOCAL',
    created_at: input.created_at || '2026-07-01T00:00:00Z',
    source_packets: sourcePackets,
    chain_spine: buildChainSpine(sourcePackets, phase10Packet),
    evidence_ladder: buildEvidenceLadder(phase10Packet),
    release_discipline: Object.freeze({
      release_status: phase10Packet.release_status,
      release_recommendation: phase10Packet.release_recommendation,
      evidence_ladder_level: phase10Packet.evidence_ladder_level,
      hard_blockers: Object.freeze(hardBlockers),
      missing_evidence: Object.freeze(phase10Packet.missing_evidence || [])
    }),
    surface_registry: Object.freeze(listHushPhase11Surfaces()),
    export_posture: buildExportPosture(phase10Packet),
    runtime_flight_posture: buildRuntimePosture(phase10Packet.runtime_flight_validation || {}),
    boundary_posture: buildBoundaryPosture(phase10Packet),
    hard_blockers: hardBlockers,
    warnings,
    operator_next_actions: Object.freeze(input.operator_next_actions || []),
    non_claims: Object.freeze(input.non_claims || phase10Packet.non_claims || HUSH_PHASE10_NON_CLAIMS)
  };
  return Object.freeze(dashboard);
}

export function summarizeHushPhase11DashboardState(dashboardState) {
  const state = dashboardState?.schema === HUSH_PHASE11_DASHBOARD_STATE_SCHEMA ? dashboardState : buildHushPhase11DashboardState(dashboardState || {});
  return Object.freeze({
    dashboard_id: state.dashboard_id,
    release_status: state.release_discipline.release_status,
    evidence_ladder_level: state.release_discipline.evidence_ladder_level,
    hard_blocker_count: state.hard_blockers.length,
    runtime_status: state.runtime_flight_posture.status,
    safe_harbor_status: state.boundary_posture.safe_harbor.status,
    aperture_status: state.boundary_posture.aperture.status,
    redacted_export_possible: state.export_posture.redacted_export_possible,
    non_claims: state.non_claims
  });
}
