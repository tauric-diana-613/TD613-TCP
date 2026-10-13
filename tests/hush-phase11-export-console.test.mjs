import assert from 'node:assert/strict';
import { buildPhase10FixturePacket } from '../app/engine/hush-phase10-release-discipline.js';
import { buildHushPhase11DashboardState } from '../app/engine/hush-phase11-dashboard-state.js';
import { evaluateHushPhase11Action } from '../app/engine/hush-phase11-action-gates.js';

const clean = buildHushPhase11DashboardState({ phase10_packet: buildPhase10FixturePacket() });
const allowed = evaluateHushPhase11Action('export-redacted', clean);
assert.equal(allowed.allowed, true);
assert.equal(allowed.export_kind, 'redacted-export');
assert.ok(allowed.repair.includes('packet id'));

const publicDefaultUndefined = buildHushPhase11DashboardState({
  phase10_packet: buildPhase10FixturePacket({
    export_policy_validation: { pass: false, raw_sample_export_allowed: false, raw_candidate_export_allowed: false }
  })
});
const undefinedGate = evaluateHushPhase11Action('export-redacted', publicDefaultUndefined);
assert.equal(undefinedGate.allowed, false);
assert.ok(undefinedGate.blocking_fields.includes('hard_blockers'));

const privateBackup = evaluateHushPhase11Action('export-private-backup', clean);
assert.equal(privateBackup.allowed, true);
assert.equal(privateBackup.gate_status, 'review-required');
assert.ok(privateBackup.warnings.includes('operator-private'));
assert.ok(privateBackup.reason.includes('not share-safe'));

console.log('hush-phase11-export-console: ok');
