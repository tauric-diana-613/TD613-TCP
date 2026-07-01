import assert from 'node:assert/strict';
import { buildPhase10FixturePacket } from '../app/engine/hush-phase10-release-discipline.js';
import {
  HUSH_PHASE11_DASHBOARD_STATE_SCHEMA,
  buildHushPhase11DashboardState,
  summarizeHushPhase11DashboardState
} from '../app/engine/hush-phase11-dashboard-state.js';

const phase10 = buildPhase10FixturePacket();
const state = buildHushPhase11DashboardState({ phase10_packet: phase10 });

assert.equal(state.schema, HUSH_PHASE11_DASHBOARD_STATE_SCHEMA);
assert.equal(state.release_discipline.release_status, 'fixture-provider-pass');
assert.equal(state.runtime_flight_posture.status, 'pending');
assert.equal(state.boundary_posture.safe_harbor.status, 'assessed-not-eligible');
assert.equal(state.boundary_posture.aperture.status, 'checked');
assert.equal(state.export_posture.redacted_export_possible, true);
assert.ok(state.chain_spine.some((lane) => lane.lane === 'phase10_release' && lane.status === 'present'));
assert.ok(state.surface_registry.some((surface) => surface.surface_id === 'export-console'));

const summary = summarizeHushPhase11DashboardState(state);
assert.equal(summary.release_status, 'fixture-provider-pass');
assert.equal(summary.runtime_status, 'pending');
assert.equal(summary.redacted_export_possible, true);
assert.ok(summary.non_claims.includes('authorship proof'));

const blocked = buildHushPhase11DashboardState({
  phase10_packet: buildPhase10FixturePacket({
    export_policy_validation: { pass: false, public_default_allowed: false, raw_sample_export_allowed: false, raw_candidate_export_allowed: true, raw_candidate_exported: true }
  })
});
assert.equal(blocked.release_discipline.release_status, 'blocked');
assert.ok(blocked.hard_blockers.includes('raw candidate exported'));
assert.equal(blocked.export_posture.redacted_export_possible, false);

console.log('hush-phase11-dashboard-state: ok');
