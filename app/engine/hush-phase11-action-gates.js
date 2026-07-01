import {
  HUSH_PHASE11_DASHBOARD_STATE_SCHEMA,
  buildHushPhase11DashboardState,
  summarizeHushPhase11DashboardState
} from './hush-phase11-dashboard-state.js';

export const HUSH_PHASE11_ACTION_GATE_SCHEMA = 'td613.hush.phase11.action-gate/v1';

export const HUSH_PHASE11_ACTIONS = Object.freeze([
  'build-contract',
  'attach-provider-log',
  'build-contract-log-pair',
  'build-stylometry-audit',
  'attach-eorfd-signal',
  'build-unified-audit',
  'open-boundary-review',
  'open-mask-registry',
  'run-phase9-collision-audit',
  'run-phase10-release-audit',
  'attach-runtime-flight-evidence',
  'export-redacted',
  'export-private-backup',
  'copy-dashboard-summary',
  'copy-non-claim-summary',
  'mark-release-candidate',
  'mark-sealed',
  'revoke-release'
]);

function normalizeState(input) {
  return input?.schema === HUSH_PHASE11_DASHBOARD_STATE_SCHEMA ? input : buildHushPhase11DashboardState(input || {});
}

function makeGate(action, allowed, gateStatus, sourcePhase, reason, repair, extras = {}) {
  return Object.freeze({
    schema: HUSH_PHASE11_ACTION_GATE_SCHEMA,
    action,
    allowed,
    gate_status: gateStatus,
    source_phase: sourcePhase,
    reason,
    repair,
    ...extras
  });
}

function hasHardBlockers(state) {
  return (state.hard_blockers || []).length > 0;
}

function releaseCanCandidate(status) {
  return ['release-candidate', 'harbor-eligible', 'sealed'].includes(status);
}

function boundariesReady(state) {
  return state.boundary_posture?.safe_harbor?.assessed === true && state.boundary_posture?.aperture?.checked === true;
}

export function evaluateHushPhase11Action(action, input = {}) {
  const state = normalizeState(input);
  const releaseStatus = state.release_discipline.release_status;
  const blockers = state.hard_blockers || [];
  const nonClaims = state.non_claims || [];

  if (!HUSH_PHASE11_ACTIONS.includes(action)) {
    return makeGate(action, false, 'blocked', 'phase11', 'unknown action', 'register the action before exposing it', { blocking_fields: ['action'] });
  }

  if (action === 'copy-dashboard-summary') {
    return makeGate(action, true, blockers.length ? 'review-required' : 'available', 'phase11', 'summary copy preserves blockers and non-claims', 'include blockers in copied summary', { summary: summarizeHushPhase11DashboardState(state), blockers });
  }

  if (action === 'copy-non-claim-summary') {
    return makeGate(action, nonClaims.length > 0, nonClaims.length ? 'available' : 'blocked', 'phase10', nonClaims.length ? 'non-claims are present' : 'non-claims missing', 'restore non-claims before copying', { non_claims: nonClaims });
  }

  if (['build-contract', 'attach-provider-log', 'build-contract-log-pair', 'build-stylometry-audit', 'build-unified-audit', 'open-boundary-review', 'open-mask-registry', 'run-phase9-collision-audit', 'run-phase10-release-audit', 'attach-runtime-flight-evidence', 'attach-eorfd-signal'].includes(action)) {
    return makeGate(action, true, 'available', 'phase11', 'evidence or repair action is allowed', 'run validators before export or release', { blockers });
  }

  if (action === 'export-redacted') {
    const posture = state.export_posture;
    if (hasHardBlockers(state)) return makeGate(action, false, 'blocked', 'phase10', 'hard blocker present', 'repair blockers before redacted export', { blockers, blocking_fields: ['hard_blockers'] });
    if (posture.raw_candidate_exported) return makeGate(action, false, 'blocked', 'phase10', 'raw candidate surface present', 'remove raw candidate surface or use private backup', { blocking_fields: ['export_policy_validation.raw_candidate_exported'] });
    if (posture.raw_sample_exported) return makeGate(action, false, 'blocked', 'phase10', 'raw sample surface present', 'remove raw sample surface or use private backup', { blocking_fields: ['export_policy_validation.raw_sample_exported'] });
    if (posture.public_default_allowed || !posture.public_default_defined) return makeGate(action, false, 'blocked', 'phase10', 'public-default posture is unsafe or undefined', 'set public_default_allowed false through release discipline', { blocking_fields: ['export_policy_validation.public_default_allowed'] });
    if (!nonClaims.length) return makeGate(action, false, 'blocked', 'phase10', 'non-claims missing', 'restore non-claims before export', { blocking_fields: ['non_claims'] });
    return makeGate(action, true, 'available', 'phase11', 'redacted export is allowed under current packet posture', 'include packet id, release status, evidence rung, exposure state, and non-claims', { export_kind: 'redacted-export' });
  }

  if (action === 'export-private-backup') {
    return makeGate(action, true, 'review-required', 'phase11', 'private backup may contain local material and is not share-safe', 'label as operator-private and not release evidence', { export_kind: 'private-backup', warnings: ['operator-private', 'not-share-safe'] });
  }

  if (action === 'mark-release-candidate') {
    if (hasHardBlockers(state)) return makeGate(action, false, 'blocked', 'phase10', 'hard blocker present', 'repair blockers before release-candidate action', { blockers });
    if (!releaseCanCandidate(releaseStatus)) return makeGate(action, false, 'blocked', 'phase10', `release status ${releaseStatus} is below release-candidate`, 'complete runtime and boundary evidence first', { blocking_fields: ['release_status'] });
    if (!boundariesReady(state)) return makeGate(action, false, 'blocked', 'phase10', 'boundary assessment incomplete', 'complete Safe Harbor assessment and Aperture check', { blocking_fields: ['boundary_posture'] });
    return makeGate(action, true, 'available', 'phase10', 'release-candidate action is supported by release discipline', 'preserve non-claims and operator confirmation', { release_status: releaseStatus });
  }

  if (action === 'mark-sealed') {
    if (hasHardBlockers(state)) return makeGate(action, false, 'blocked', 'phase10', 'hard blocker present', 'repair blockers before seal action', { blockers });
    if (releaseStatus !== 'harbor-eligible' && releaseStatus !== 'sealed') return makeGate(action, false, 'blocked', 'phase10', `release status ${releaseStatus} is not harbor-eligible`, 'complete harbor eligibility before seal action', { blocking_fields: ['release_status'] });
    if (!boundariesReady(state)) return makeGate(action, false, 'blocked', 'phase10', 'boundary assessment incomplete', 'complete Safe Harbor assessment and Aperture check', { blocking_fields: ['boundary_posture'] });
    return makeGate(action, true, 'review-required', 'phase11', 'seal action requires operator confirmation', 'confirm without adding proof claims', { release_status: releaseStatus });
  }

  if (action === 'revoke-release') {
    return makeGate(action, true, 'review-required', 'phase11', 'revocation is allowed as a protective action', 'record revocation reason and preserve prior packet trail', { release_status: releaseStatus });
  }

  return makeGate(action, false, 'blocked', 'phase11', 'unhandled action', 'add gate coverage before exposing this action');
}

export function buildHushPhase11ActionGateReport(input = {}) {
  const state = normalizeState(input);
  return Object.freeze({
    schema: 'td613.hush.phase11.action-gate-report/v1',
    dashboard_id: state.dashboard_id,
    release_status: state.release_discipline.release_status,
    gates: Object.freeze(HUSH_PHASE11_ACTIONS.map((action) => evaluateHushPhase11Action(action, state)))
  });
}

export function explainBlockedHushPhase11Action(action, input = {}) {
  const result = evaluateHushPhase11Action(action, input);
  if (result.allowed) return `${action} is allowed: ${result.reason}`;
  return `${action} is ${result.gate_status}: ${result.reason}. Repair: ${result.repair}`;
}
