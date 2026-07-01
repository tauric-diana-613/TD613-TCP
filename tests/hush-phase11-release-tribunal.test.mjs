import assert from 'node:assert/strict';
import { buildPhase10FixturePacket } from '../app/engine/hush-phase10-release-discipline.js';
import { buildHushPhase11DashboardState } from '../app/engine/hush-phase11-dashboard-state.js';
import { evaluateHushPhase11Action } from '../app/engine/hush-phase11-action-gates.js';

const phase8Missing = buildHushPhase11DashboardState({
  phase10_packet: buildPhase10FixturePacket({ phase8_mask_validation: { pass: false, fixture_bank_present: false, docs_present: false } })
});
assert.equal(phase8Missing.release_discipline.release_status, 'local-pass');
assert.equal(phase8Missing.release_discipline.evidence_ladder_level, 1);
assert.equal(evaluateHushPhase11Action('mark-release-candidate', phase8Missing).allowed, false);

const runtimeReadyButBoundaryPending = buildHushPhase11DashboardState({
  phase10_packet: buildPhase10FixturePacket({
    provider_contract_validation: { pass: true, mode: 'live', preserved_propositions: ['FILE-72'], dropped_propositions: [], new_claims: [], risk_flags: [], drift_classified: true },
    runtime_flight_validation: {
      pass: true,
      status: 'complete',
      url: 'https://td613.com/hush',
      build_or_commit: 'phase11-test',
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
  })
});
assert.equal(runtimeReadyButBoundaryPending.release_discipline.release_status, 'runtime-flight-pass');
assert.equal(runtimeReadyButBoundaryPending.boundary_posture.safe_harbor.status, 'not-assessed');
assert.equal(evaluateHushPhase11Action('mark-release-candidate', runtimeReadyButBoundaryPending).allowed, false);

const harborEligible = buildHushPhase11DashboardState({
  phase10_packet: buildPhase10FixturePacket({
    provider_contract_validation: { pass: true, mode: 'live', preserved_propositions: ['FILE-72'], dropped_propositions: [], new_claims: [], risk_flags: [], drift_classified: true },
    runtime_flight_validation: {
      pass: true,
      status: 'complete',
      url: 'https://td613.com/hush',
      build_or_commit: 'phase11-test',
      console_network_notes: 'none',
      outbound_contract_artifact: 'artifact://outbound',
      inbound_provider_log_artifact: 'artifact://inbound',
      export_artifact: 'artifact://export',
      candidate_output: 'candidate hash present',
      mask_selector_state: 'Luz of the Index',
      public_default_state: false,
      raw_exposure_state: 'excluded'
    },
    safe_harbor_boundary: { assessed: true, eligible: true, receipt_treated_as_proof: false },
    aperture_boundary: { checked: true, release_authority: false, validator_bypass: false }
  })
});
assert.equal(harborEligible.release_discipline.release_status, 'harbor-eligible');
assert.equal(evaluateHushPhase11Action('mark-sealed', harborEligible).gate_status, 'review-required');

console.log('hush-phase11-release-tribunal: ok');
