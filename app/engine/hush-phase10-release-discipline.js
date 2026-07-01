import {
  HUSH_PHASE10_SCHEMA,
  HUSH_PHASE10_NON_CLAIMS,
  HUSH_PHASE10_RUNTIME_FIELDS,
  isKnownHushReleaseStatus
} from '../data/hush-phase10-release-statuses.js';

function hasValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && value !== '';
}

function allRuntimeFieldsPresent(runtime = {}) {
  return HUSH_PHASE10_RUNTIME_FIELDS.every((field) => hasValue(runtime[field]));
}

function nonClaimsPresent(nonClaims = []) {
  return HUSH_PHASE10_NON_CLAIMS.every((claim) => nonClaims.includes(claim));
}

function releaseStatusRequiresBoundary(status) {
  return ['release-candidate', 'harbor-eligible', 'sealed'].includes(status);
}

export function collectHushPhase10HardBlockers(packet = {}) {
  const blockers = [];
  const exportPolicy = packet.export_policy_validation || {};
  const provider = packet.provider_contract_validation || {};
  const runtime = packet.runtime_flight_validation || {};
  const safeHarbor = packet.safe_harbor_boundary || {};
  const aperture = packet.aperture_boundary || {};
  const phase9 = packet.phase9_collision_validation || {};

  if (exportPolicy.public_default_allowed === true) blockers.push('public_default_allowed true');
  if (exportPolicy.public_default_allowed === undefined) blockers.push('public_default_allowed undefined');
  if (exportPolicy.raw_sample_exported === true || exportPolicy.raw_sample_export_allowed === true) blockers.push('raw sample exported');
  if (exportPolicy.raw_candidate_exported === true || exportPolicy.raw_candidate_export_allowed === true) blockers.push('raw candidate exported');
  if (packet.local_validation?.mandatory_anchors_preserved === false) blockers.push('mandatory anchor dropped');
  if (provider.new_claims?.length) blockers.push('new factual claim added');
  if (provider.mode && provider.mode !== 'none' && provider.pass === false) blockers.push('provider validation failed');
  if (packet.local_validation?.claim_boundary_inflated === true) blockers.push('claim boundary inflated');
  if (packet.expected_mask_id && packet.mask_id !== packet.expected_mask_id) blockers.push('wrong mask id');
  if (packet.expected_mask_label && packet.mask_label !== packet.expected_mask_label) blockers.push('wrong mask label');
  if (packet.internal_register_public === true) blockers.push('internal register exposed publicly');
  if (provider.risk_flags?.length && provider.drift_classified !== true) blockers.push('provider drift unclassified');
  if (packet.release_status === 'runtime-flight-pass' && !runtime.pass) blockers.push('runtime flight missing but status marked runtime-flight-pass');
  if (provider.mode === 'fixture-backed' && provider.status === 'live-provider-pass') blockers.push('fixture-backed provider evidence marked live-provider-pass');
  if (releaseStatusRequiresBoundary(packet.release_status) && safeHarbor.assessed !== true) blockers.push('release status assigned before Safe Harbor assessment');
  if (releaseStatusRequiresBoundary(packet.release_status) && aperture.checked !== true) blockers.push('release status assigned before Aperture boundary check');
  if (safeHarbor.receipt_treated_as_proof === true) blockers.push('Safe Harbor receipt treated as proof');
  if (aperture.release_authority === true) blockers.push('Aperture treated as release authority');
  if (!nonClaimsPresent(packet.non_claims || [])) blockers.push('non-claims missing');
  if (aperture.validator_bypass === true) blockers.push('validator bypass implied');
  if (phase9.max_collision_severity >= 3) blockers.push('collision severity 3');

  return Object.freeze([...new Set([...(packet.hard_blockers || []), ...blockers])]);
}

export function recommendHushRelease(packet = {}) {
  const blockers = collectHushPhase10HardBlockers(packet);
  if (blockers.length) return 'blocked';
  if (!packet.local_validation?.pass) return 'draft';
  if (!packet.phase8_mask_validation?.pass) return 'local-pass';
  if (!packet.phase9_collision_validation?.pass) return 'local-pass';
  if (!packet.export_policy_validation?.pass) return 'blocked';
  if (packet.phase9_collision_validation?.max_collision_severity >= 2) return 'local-pass';
  if (!packet.provider_contract_validation?.pass) return 'local-pass';
  if (packet.provider_contract_validation?.mode === 'fixture-backed') return 'fixture-provider-pass';
  if (!packet.runtime_flight_validation?.pass) return 'runtime-flight-pending';
  if (!allRuntimeFieldsPresent(packet.runtime_flight_validation || {})) return 'runtime-flight-pending';
  if (packet.safe_harbor_boundary?.assessed !== true) return 'runtime-flight-pass';
  if (packet.aperture_boundary?.checked !== true) return 'runtime-flight-pass';
  if (!packet.safe_harbor_boundary?.eligible) return 'release-candidate';
  return 'harbor-eligible';
}

export function evidenceLevelForReleasePacket(packet = {}) {
  if (!packet.local_validation?.pass) return 0;
  if (!packet.phase8_mask_validation?.pass) return 1;
  if (!packet.export_policy_validation?.pass) return 2;
  if (!packet.phase9_collision_validation?.pass) return 3;
  if (!packet.provider_contract_validation?.pass) return 4;
  if (!packet.runtime_flight_validation?.pass) return 5;
  if (!packet.safe_harbor_boundary?.assessed) return 6;
  if (!packet.aperture_boundary?.checked) return 7;
  if (['release-candidate', 'harbor-eligible', 'sealed'].includes(packet.release_status)) return 9;
  return 8;
}

export function buildHushPhase10ReleasePacket(input = {}) {
  const base = {
    schema: HUSH_PHASE10_SCHEMA,
    packet_id: input.packet_id || 'HUSH-PHASE10-PACKET',
    source_packet_id: input.source_packet_id || null,
    mask_id: input.mask_id || null,
    mask_label: input.mask_label || null,
    native_role: input.native_role || null,
    release_status: input.release_status || 'draft',
    evidence_ladder_level: input.evidence_ladder_level ?? 0,
    local_validation: input.local_validation || { pass: false },
    phase8_mask_validation: input.phase8_mask_validation || { pass: false },
    phase9_collision_validation: input.phase9_collision_validation || { pass: false },
    provider_contract_validation: input.provider_contract_validation || { pass: false, mode: 'none' },
    runtime_flight_validation: input.runtime_flight_validation || { pass: false, status: 'pending' },
    export_policy_validation: input.export_policy_validation || { pass: false },
    safe_harbor_boundary: input.safe_harbor_boundary || { assessed: false, eligible: false, receipt_treated_as_proof: false },
    aperture_boundary: input.aperture_boundary || { checked: false, release_authority: false, validator_bypass: false },
    non_claims: input.non_claims || HUSH_PHASE10_NON_CLAIMS,
    hard_blockers: input.hard_blockers || [],
    missing_evidence: input.missing_evidence || [],
    release_recommendation: input.release_recommendation || null,
    created_at: input.created_at || '2026-06-30T23:10:00Z'
  };
  const hardBlockers = collectHushPhase10HardBlockers(base);
  const releaseStatus = hardBlockers.length ? 'blocked' : recommendHushRelease({ ...base, hard_blockers: hardBlockers });
  const evidenceLevel = evidenceLevelForReleasePacket({ ...base, release_status: releaseStatus, hard_blockers: hardBlockers });
  return Object.freeze({
    ...base,
    release_status: isKnownHushReleaseStatus(releaseStatus) ? releaseStatus : 'blocked',
    evidence_ladder_level: evidenceLevel,
    hard_blockers: hardBlockers,
    release_recommendation: releaseStatus
  });
}

export function buildPhase10FixturePacket(overrides = {}) {
  return buildHushPhase10ReleasePacket({
    packet_id: 'HUSH-P10-CLEAN-LOCAL',
    source_packet_id: 'P9-001',
    mask_id: 'hush-luz-index',
    mask_label: 'Luz of the Index',
    native_role: 'care-aware custodial index',
    local_validation: { pass: true, mandatory_anchors_preserved: true, source_obligations_exist: true },
    phase8_mask_validation: { pass: true, fixture_bank_present: true, docs_present: true },
    phase9_collision_validation: { pass: true, max_collision_severity: 0, dangerous_pair_available: true },
    provider_contract_validation: { pass: true, mode: 'fixture-backed', preserved_propositions: ['FILE-72'], dropped_propositions: [], new_claims: [], risk_flags: [], drift_classified: true },
    runtime_flight_validation: { pass: false, status: 'pending' },
    export_policy_validation: { pass: true, public_default_allowed: false, raw_sample_export_allowed: false, raw_candidate_export_allowed: false, raw_sample_exported: false, raw_candidate_exported: false },
    safe_harbor_boundary: { assessed: true, eligible: false, receipt_treated_as_proof: false },
    aperture_boundary: { checked: true, release_authority: false, validator_bypass: false },
    ...overrides
  });
}

export function buildPhase10CaseBank() {
  return Object.freeze([
    buildPhase10FixturePacket({ packet_id: 'P10-CASE-1-CLEAN-LOCAL' }),
    buildPhase10FixturePacket({ packet_id: 'P10-CASE-2-RAW-CANDIDATE-LEAK', export_policy_validation: { pass: false, public_default_allowed: false, raw_sample_export_allowed: false, raw_candidate_export_allowed: true, raw_candidate_exported: true } }),
    buildPhase10FixturePacket({ packet_id: 'P10-CASE-3-PUBLIC-DEFAULT-UNDEFINED', export_policy_validation: { pass: false, raw_sample_export_allowed: false, raw_candidate_export_allowed: false } }),
    buildPhase10FixturePacket({ packet_id: 'P10-CASE-4-HARBOR-RECEIPT-RUNTIME-MISSING', safe_harbor_boundary: { assessed: true, eligible: true, receipt_treated_as_proof: false } }),
    buildPhase10FixturePacket({ packet_id: 'P10-CASE-5-PROVIDER-ADDS-CLAIM', provider_contract_validation: { pass: false, mode: 'fixture-backed', preserved_propositions: ['FILE-72'], dropped_propositions: [], new_claims: ['proves the whole story'], risk_flags: ['new claim'], drift_classified: true } }),
    buildPhase10FixturePacket({ packet_id: 'P10-CASE-6-COLLISION-SEVERITY-2', phase9_collision_validation: { pass: true, max_collision_severity: 2, dangerous_pair_available: true } }),
    buildPhase10FixturePacket({ packet_id: 'P10-CASE-7-COLLISION-SEVERITY-3', phase9_collision_validation: { pass: false, max_collision_severity: 3, dangerous_pair_available: true } })
  ]);
}
