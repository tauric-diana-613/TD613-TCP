import assert from 'node:assert/strict';
import { buildPhase10FixturePacket } from '../app/engine/hush-phase10-release-discipline.js';

const liveProviderNoRuntime = buildPhase10FixturePacket({
  provider_contract_validation: { pass: true, mode: 'live', preserved_propositions: ['FILE-72'], dropped_propositions: [], new_claims: [], risk_flags: [], drift_classified: true },
  runtime_flight_validation: { pass: false, status: 'pending' }
});
assert.equal(liveProviderNoRuntime.release_status, 'runtime-flight-pending');

const fakeRuntimePass = buildPhase10FixturePacket({
  release_status: 'runtime-flight-pass',
  runtime_flight_validation: { pass: false, status: 'pending' }
});
assert.equal(fakeRuntimePass.release_status, 'blocked');
assert.ok(fakeRuntimePass.hard_blockers.includes('runtime flight missing but status marked runtime-flight-pass'));

const fullRuntime = {
  pass: true,
  status: 'complete',
  url: 'https://td613.com/hush',
  build_or_commit: 'phase10-test',
  console_network_notes: 'none',
  outbound_contract_artifact: 'artifact://outbound',
  inbound_provider_log_artifact: 'artifact://inbound',
  export_artifact: 'artifact://export',
  candidate_output: 'candidate hash present',
  mask_selector_state: 'Luz of the Index',
  public_default_state: false,
  raw_exposure_state: 'excluded'
};

const runtimeWithoutSafeHarborAssessment = buildPhase10FixturePacket({
  provider_contract_validation: { pass: true, mode: 'live', preserved_propositions: ['FILE-72'], dropped_propositions: [], new_claims: [], risk_flags: [], drift_classified: true },
  runtime_flight_validation: fullRuntime,
  safe_harbor_boundary: { assessed: false, eligible: false, receipt_treated_as_proof: false },
  aperture_boundary: { checked: true, release_authority: false, validator_bypass: false }
});
assert.equal(runtimeWithoutSafeHarborAssessment.release_status, 'runtime-flight-pass');
assert.equal(runtimeWithoutSafeHarborAssessment.evidence_ladder_level, 6);

const runtimeWithoutApertureBoundary = buildPhase10FixturePacket({
  provider_contract_validation: { pass: true, mode: 'live', preserved_propositions: ['FILE-72'], dropped_propositions: [], new_claims: [], risk_flags: [], drift_classified: true },
  runtime_flight_validation: fullRuntime,
  safe_harbor_boundary: { assessed: true, eligible: true, receipt_treated_as_proof: false },
  aperture_boundary: { checked: false, release_authority: false, validator_bypass: false }
});
assert.equal(runtimeWithoutApertureBoundary.release_status, 'runtime-flight-pass');
assert.equal(runtimeWithoutApertureBoundary.evidence_ladder_level, 7);

const prematureReleaseCandidate = buildPhase10FixturePacket({
  release_status: 'release-candidate',
  provider_contract_validation: { pass: true, mode: 'live', preserved_propositions: ['FILE-72'], dropped_propositions: [], new_claims: [], risk_flags: [], drift_classified: true },
  runtime_flight_validation: fullRuntime,
  safe_harbor_boundary: { assessed: false, eligible: false, receipt_treated_as_proof: false },
  aperture_boundary: { checked: false, release_authority: false, validator_bypass: false }
});
assert.equal(prematureReleaseCandidate.release_status, 'blocked');
assert.ok(prematureReleaseCandidate.hard_blockers.includes('release status assigned before Safe Harbor assessment'));
assert.ok(prematureReleaseCandidate.hard_blockers.includes('release status assigned before Aperture boundary check'));

console.log('hush-phase10-runtime-evidence-gate: ok');
