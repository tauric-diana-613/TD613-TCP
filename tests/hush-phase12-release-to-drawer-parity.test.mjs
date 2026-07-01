import assert from 'node:assert/strict';
import { buildPhase10FixturePacket } from '../app/engine/hush-phase10-release-discipline.js';
import { buildHushPhase11DashboardState } from '../app/engine/hush-phase11-dashboard-state.js';
import { evaluateHushPhase11Action } from '../app/engine/hush-phase11-action-gates.js';

const fixturePass = buildPhase10FixturePacket();
const fixtureDrawer = buildHushPhase11DashboardState({ phase10_packet: fixturePass });
assert.equal(fixtureDrawer.release_discipline.release_status, fixturePass.release_status);
assert.equal(fixtureDrawer.release_discipline.evidence_ladder_level, fixturePass.evidence_ladder_level);
assert.deepEqual(fixtureDrawer.release_discipline.hard_blockers, fixturePass.hard_blockers);
assert.equal(fixtureDrawer.runtime_flight_posture.status, 'pending');

const runtimeCompleteNoBoundary = buildPhase10FixturePacket({
  provider_contract_validation: { pass: true, mode: 'live', preserved_propositions: ['FILE-72'], dropped_propositions: [], new_claims: [], risk_flags: [], drift_classified: true },
  runtime_flight_validation: {
    pass: true,
    status: 'complete',
    url: 'https://td613.com/hush',
    build_or_commit: 'phase12-test',
    console_network_notes: 'none',
    outbound_contract_artifact: 'artifact://outbound',
    inbound_provider_log_artifact: 'artifact://inbound',
    export_artifact: 'artifact://export',
    candidate_output: 'candidate hash present',
    mask_selector_state: 'Luz of the Index',
    public_default_state: false,
    raw_exposure_state: 'excluded'
  },
  safe_harbor_boundary: { assessed: false, eligible: false, receipt_treated_as_proof: false },
  aperture_boundary: { checked: true, release_authority: false, validator_bypass: false }
});
const runtimeDrawer = buildHushPhase11DashboardState({ phase10_packet: runtimeCompleteNoBoundary });
assert.equal(runtimeDrawer.release_discipline.release_status, 'runtime-flight-pass');
assert.equal(runtimeDrawer.runtime_flight_posture.status, 'complete');
assert.equal(runtimeDrawer.boundary_posture.safe_harbor.status, 'not-assessed');
assert.equal(evaluateHushPhase11Action('mark-release-candidate', runtimeDrawer).allowed, false);

const phase8Missing = buildPhase10FixturePacket({ phase8_mask_validation: { pass: false, fixture_bank_present: false, docs_present: false } });
const phase8Drawer = buildHushPhase11DashboardState({ phase10_packet: phase8Missing });
assert.equal(phase8Drawer.release_discipline.release_status, 'local-pass');
assert.equal(phase8Drawer.release_discipline.evidence_ladder_level, 1);
assert.equal(evaluateHushPhase11Action('mark-release-candidate', phase8Drawer).allowed, false);

console.log('hush-phase12-release-to-drawer-parity: ok');
