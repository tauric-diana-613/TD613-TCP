import assert from 'node:assert/strict';
import { buildPhase10FixturePacket } from '../app/engine/hush-phase10-release-discipline.js';
import { buildHushPhase11DashboardState } from '../app/engine/hush-phase11-dashboard-state.js';

const pending = buildHushPhase11DashboardState({ phase10_packet: buildPhase10FixturePacket() });
assert.equal(pending.runtime_flight_posture.status, 'pending');
assert.ok(pending.runtime_flight_posture.missing_fields.includes('url'));
assert.match(pending.runtime_flight_posture.note, /Vercel ready is not runtime-flight-pass/);

const partial = buildHushPhase11DashboardState({
  phase10_packet: buildPhase10FixturePacket({
    provider_contract_validation: { pass: true, mode: 'live', preserved_propositions: ['FILE-72'], dropped_propositions: [], new_claims: [], risk_flags: [], drift_classified: true },
    runtime_flight_validation: { pass: true, status: 'complete', url: 'https://td613.com/hush' }
  })
});
assert.equal(partial.runtime_flight_posture.status, 'partial');
assert.ok(partial.runtime_flight_posture.missing_fields.includes('build_or_commit'));
assert.equal(partial.release_discipline.release_status, 'runtime-flight-pending');

const complete = buildHushPhase11DashboardState({
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
    safe_harbor_boundary: { assessed: true, eligible: false, receipt_treated_as_proof: false },
    aperture_boundary: { checked: true, release_authority: false, validator_bypass: false }
  })
});
assert.equal(complete.runtime_flight_posture.status, 'complete');
assert.deepEqual(complete.runtime_flight_posture.missing_fields, []);
assert.equal(complete.release_discipline.release_status, 'release-candidate');

console.log('hush-phase11-runtime-evidence-panel: ok');
