import assert from 'node:assert/strict';
import { buildPhase10FixturePacket } from '../app/engine/hush-phase10-release-discipline.js';
import { buildHushPhase11DashboardState } from '../app/engine/hush-phase11-dashboard-state.js';
import { evaluateHushPhase11Action } from '../app/engine/hush-phase11-action-gates.js';

const clean = buildHushPhase11DashboardState({ phase10_packet: buildPhase10FixturePacket() });
assert.equal(evaluateHushPhase11Action('export-redacted', clean).allowed, true);
assert.equal(evaluateHushPhase11Action('export-private-backup', clean).gate_status, 'review-required');

const rawSample = buildHushPhase11DashboardState({
  phase10_packet: buildPhase10FixturePacket({
    export_policy_validation: { pass: false, public_default_allowed: false, raw_sample_export_allowed: true, raw_sample_exported: true, raw_candidate_export_allowed: false, raw_candidate_exported: false }
  })
});
assert.equal(evaluateHushPhase11Action('export-redacted', rawSample).allowed, false);
assert.equal(evaluateHushPhase11Action('export-private-backup', rawSample).allowed, true);

const rawCandidate = buildHushPhase11DashboardState({
  phase10_packet: buildPhase10FixturePacket({
    export_policy_validation: { pass: false, public_default_allowed: false, raw_sample_export_allowed: false, raw_sample_exported: false, raw_candidate_export_allowed: true, raw_candidate_exported: true }
  })
});
assert.equal(evaluateHushPhase11Action('export-redacted', rawCandidate).allowed, false);
assert.equal(evaluateHushPhase11Action('copy-dashboard-summary', rawCandidate).allowed, true);
assert.equal(evaluateHushPhase11Action('copy-dashboard-summary', rawCandidate).gate_status, 'review-required');

const publicDefault = buildHushPhase11DashboardState({
  phase10_packet: buildPhase10FixturePacket({
    export_policy_validation: { pass: false, public_default_allowed: true, raw_sample_export_allowed: false, raw_sample_exported: false, raw_candidate_export_allowed: false, raw_candidate_exported: false }
  })
});
assert.equal(evaluateHushPhase11Action('export-redacted', publicDefault).allowed, false);
assert.ok(publicDefault.hard_blockers.includes('public_default_allowed true'));

const publicDefaultUndefined = buildHushPhase11DashboardState({
  phase10_packet: buildPhase10FixturePacket({
    export_policy_validation: { pass: false, raw_sample_export_allowed: false, raw_candidate_export_allowed: false }
  })
});
assert.equal(evaluateHushPhase11Action('export-redacted', publicDefaultUndefined).allowed, false);
assert.ok(publicDefaultUndefined.hard_blockers.includes('public_default_allowed undefined'));

console.log('hush-phase12-export-surface-parity: ok');
