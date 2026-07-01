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

console.log('hush-phase10-runtime-evidence-gate: ok');
