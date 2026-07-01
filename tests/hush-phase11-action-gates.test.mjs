import assert from 'node:assert/strict';
import { buildPhase10FixturePacket } from '../app/engine/hush-phase10-release-discipline.js';
import { buildHushPhase11DashboardState } from '../app/engine/hush-phase11-dashboard-state.js';
import {
  buildHushPhase11ActionGateReport,
  evaluateHushPhase11Action,
  explainBlockedHushPhase11Action
} from '../app/engine/hush-phase11-action-gates.js';

const clean = buildHushPhase11DashboardState({ phase10_packet: buildPhase10FixturePacket() });
assert.equal(evaluateHushPhase11Action('copy-dashboard-summary', clean).allowed, true);
assert.equal(evaluateHushPhase11Action('copy-non-claim-summary', clean).allowed, true);
assert.equal(evaluateHushPhase11Action('export-redacted', clean).allowed, true);
assert.equal(evaluateHushPhase11Action('mark-release-candidate', clean).allowed, false);
assert.match(explainBlockedHushPhase11Action('mark-release-candidate', clean), /below release-candidate/);

const rawCandidate = buildHushPhase11DashboardState({
  phase10_packet: buildPhase10FixturePacket({
    export_policy_validation: { pass: false, public_default_allowed: false, raw_sample_export_allowed: false, raw_candidate_export_allowed: true, raw_candidate_exported: true }
  })
});
const redactedGate = evaluateHushPhase11Action('export-redacted', rawCandidate);
assert.equal(redactedGate.allowed, false);
assert.equal(redactedGate.gate_status, 'blocked');
assert.ok(redactedGate.reason.includes('hard blocker'));

const providerFailed = buildHushPhase11DashboardState({
  phase10_packet: buildPhase10FixturePacket({
    provider_contract_validation: { pass: false, mode: 'fixture-backed', preserved_propositions: ['FILE-72'], dropped_propositions: ['footer mismatch'], new_claims: [], risk_flags: [], drift_classified: true }
  })
});
assert.equal(providerFailed.release_discipline.release_status, 'blocked');
assert.equal(evaluateHushPhase11Action('copy-dashboard-summary', providerFailed).gate_status, 'review-required');
assert.equal(evaluateHushPhase11Action('export-redacted', providerFailed).allowed, false);

const report = buildHushPhase11ActionGateReport(clean);
assert.equal(report.gates.length > 10, true);
assert.ok(report.gates.some((gate) => gate.action === 'export-private-backup' && gate.gate_status === 'review-required'));

console.log('hush-phase11-action-gates: ok');
