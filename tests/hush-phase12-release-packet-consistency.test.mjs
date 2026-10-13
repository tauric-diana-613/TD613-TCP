import assert from 'node:assert/strict';
import { buildPhase10FixturePacket } from '../app/engine/hush-phase10-release-discipline.js';
import { buildHushPhase11DashboardState } from '../app/engine/hush-phase11-dashboard-state.js';
import { evaluateHushPhase11Action } from '../app/engine/hush-phase11-action-gates.js';

const contradictoryProvider = buildPhase10FixturePacket({
  provider_contract_validation: {
    pass: true,
    mode: 'live',
    preserved_propositions: ['FILE-72'],
    dropped_propositions: ['footer mismatch'],
    new_claims: [],
    risk_flags: [],
    drift_classified: true
  }
});
const providerDrawer = buildHushPhase11DashboardState({ phase10_packet: contradictoryProvider });
assert.equal(contradictoryProvider.release_status, 'blocked');
assert.ok(contradictoryProvider.hard_blockers.includes('provider proposition dropped'));
assert.equal(providerDrawer.release_discipline.release_status, 'blocked');
assert.equal(evaluateHushPhase11Action('export-redacted', providerDrawer).allowed, false);
assert.equal(evaluateHushPhase11Action('mark-release-candidate', providerDrawer).allowed, false);

const cleanFixture = buildPhase10FixturePacket();
const forgedReleasePacket = {
  ...cleanFixture,
  release_status: 'harbor-eligible',
  release_recommendation: 'harbor-eligible',
  hard_blockers: [],
  provider_contract_validation: {
    pass: true,
    mode: 'fixture-backed',
    preserved_propositions: ['FILE-72'],
    dropped_propositions: ['footer mismatch'],
    new_claims: [],
    risk_flags: [],
    drift_classified: true
  }
};
const forgedDrawer = buildHushPhase11DashboardState({ phase10_packet: forgedReleasePacket });
assert.equal(forgedDrawer.release_discipline.release_status, 'blocked');
assert.ok(forgedDrawer.hard_blockers.includes('provider proposition dropped'));
assert.equal(evaluateHushPhase11Action('mark-sealed', forgedDrawer).allowed, false);

const unsupportedLocalPass = buildPhase10FixturePacket({
  local_validation: { pass: true }
});
assert.equal(unsupportedLocalPass.release_status, 'blocked');
assert.ok(unsupportedLocalPass.hard_blockers.includes('mandatory anchor retention undefined'));
assert.ok(unsupportedLocalPass.hard_blockers.includes('source obligations undefined'));

const unsafeRuntime = buildPhase10FixturePacket({
  provider_contract_validation: {
    pass: true,
    mode: 'live',
    preserved_propositions: ['FILE-72'],
    dropped_propositions: [],
    new_claims: [],
    risk_flags: [],
    drift_classified: true
  },
  runtime_flight_validation: {
    pass: true,
    status: 'complete',
    url: 'https://td613.com/hush',
    build_or_commit: 'phase12-consistency-test',
    console_network_notes: 'none',
    outbound_contract_artifact: 'artifact://outbound',
    inbound_provider_log_artifact: 'artifact://inbound',
    export_artifact: 'artifact://export',
    candidate_output: 'candidate hash present',
    mask_selector_state: 'Luz of the Index',
    public_default_state: true,
    raw_exposure_state: 'candidate-visible'
  }
});
assert.equal(unsafeRuntime.release_status, 'blocked');
assert.ok(unsafeRuntime.hard_blockers.includes('runtime public default allowed'));
assert.ok(unsafeRuntime.hard_blockers.includes('runtime raw exposure not excluded'));

console.log('hush-phase12-release-packet-consistency: ok');
