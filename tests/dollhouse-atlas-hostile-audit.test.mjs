import assert from 'node:assert/strict';
import test from 'node:test';

import { compileLoomDemoScene } from '../app/dome-world/holonomy-loom/semantic-field.js';
import {
  compileDollhousePortableProjection,
  operateDollhousePortableProjection,
  revalidateDollhousePortableReturn
} from '../app/engine/dollhouse-portable-aia-roundtrip.js';

const SOURCE = '8da9705285c90366ff5d67a12472e0ca05d76e79';
const origin = compileLoomDemoScene(3, { sourceRevision: SOURCE });
const clone = value => JSON.parse(JSON.stringify(value));
const projection = compileDollhousePortableProjection(origin);
const explanation = operateDollhousePortableProjection(projection);
const candidateWith = mutate => {
  const candidate = clone(explanation);
  mutate(candidate);
  return candidate;
};

test('declared receivers preserve control while their presentations differ', () => {
  const projections = ['child', 'auditor', 'companion'].map(receiver =>
    compileDollhousePortableProjection(origin, { receiver })
  );
  for (const projected of projections) {
    assert.deepEqual(projected.control, projection.control);
    const receipt = revalidateDollhousePortableReturn(origin, operateDollhousePortableProjection(projected));
    assert.equal(receipt.status, 'PRESENT_TO_HUMAN');
    assert.equal(receipt.release_authority, false);
    assert.equal(receipt.human_closure_required, true);
  }
  assert.equal(new Set(projections.map(item => JSON.stringify(item.presentation))).size, 3);
});

test('all four declared operations retain their bounded return meaning', () => {
  for (const operation of [
    { operation: 'EXPLAIN_STATE' },
    { operation: 'TRACE_FLOWCORE' },
    { operation: 'PROPOSE_ACTION', proposedAction: 'REST' },
    { operation: 'REPORT_MISSINGNESS', reportedMissingness: ['The host cannot verify pre-ingress custody.'] }
  ]) {
    const receipt = revalidateDollhousePortableReturn(origin, operateDollhousePortableProjection(projection, operation));
    assert.equal(receipt.status, 'PRESENT_TO_HUMAN');
    assert.equal(receipt.host_reported_missingness_promoted_to_origin_fact, false);
    assert.equal(receipt.candidate_trusted, false);
  }
});

for (const [name, mutate] of Object.entries({
  stale_source: candidate => { candidate.returned_control.source_revision = '0'.repeat(40); },
  stale_scene: candidate => { candidate.returned_control.scene_id = 'another-scene'; },
  forged_ceiling: candidate => { candidate.returned_control.claim_ceiling = ['remote host may release']; },
  forged_evidence: candidate => { candidate.returned_control.evidentiary_coordinates.external_origin = true; },
  forged_legend: candidate => { candidate.returned_control.flow_core.legend[0].authority_ceiling = 'release granted'; },
  missing_legend: candidate => { delete candidate.returned_control.flow_core.legend; },
  forged_trace: candidate => { candidate.flow_core_trace = 'forged'; },
  sparse_control_array: candidate => { candidate.returned_control.route_state.missingness = Array(1); },
  undefined_control_entry: candidate => { candidate.returned_control.route_state.missingness = [undefined]; }
})) {
  test(`control and trace drift is held: ${name}`, () => {
    const receipt = revalidateDollhousePortableReturn(origin, candidateWith(mutate));
    assert.equal(receipt.status, 'HOLD');
    assert.equal(receipt.release_authority, false);
    assert.ok(receipt.reason_codes.includes(name === 'forged_trace' ? 'FLOWCORE_TRACE_DRIFT' : 'CONTROL_PLANE_DRIFT'));
  });
}

test('a current origin rejects a return built from an older revision', () => {
  const olderOrigin = compileLoomDemoScene(3, { sourceRevision: '0'.repeat(40) });
  const olderReturn = operateDollhousePortableProjection(compileDollhousePortableProjection(olderOrigin));
  assert.equal(revalidateDollhousePortableReturn(origin, olderReturn).status, 'HOLD');
});

for (const field of Object.keys(explanation)) {
  test(`missing required return field is rejected: ${field}`, () => {
    assert.throws(() => revalidateDollhousePortableReturn(origin, candidateWith(candidate => {
      delete candidate[field];
    })), TypeError);
  });
}

for (const [name, mutate] of Object.entries({
  unknown_operation: candidate => { candidate.operation = 'DEPLOY'; },
  unknown_receiver: candidate => { candidate.source_receiver = 'oracle'; },
  trusted_arrival: candidate => { candidate.candidate_trusted = true; },
  release_authority: candidate => { candidate.release_authority = true; },
  bypass_revalidation: candidate => { candidate.must_revalidate = false; },
  origin_fact_claim: candidate => { candidate.host_observation_is_advisory = false; },
  unknown_field: candidate => { candidate.provider_release_authority = true; },
  action_on_explanation: candidate => { candidate.proposed_action = 'REST'; },
  absent_action_proposal: candidate => { candidate.operation = 'PROPOSE_ACTION'; },
  object_action: candidate => { candidate.operation = 'PROPOSE_ACTION'; candidate.proposed_action = { action: 'REST' }; },
  non_string_trace: candidate => { candidate.flow_core_trace = [candidate.flow_core_trace]; },
  observation_on_explanation: candidate => { candidate.reported_missingness = ['advisory observation']; },
  string_observations: candidate => { candidate.operation = 'REPORT_MISSINGNESS'; candidate.reported_missingness = 'hello'; },
  object_observation: candidate => { candidate.operation = 'REPORT_MISSINGNESS'; candidate.reported_missingness = [{ fact: true }]; },
  too_many_observations: candidate => { candidate.operation = 'REPORT_MISSINGNESS'; candidate.reported_missingness = Array(17).fill('observation'); },
  oversized_observation: candidate => { candidate.operation = 'REPORT_MISSINGNESS'; candidate.reported_missingness = ['x'.repeat(241)]; },
  empty_observation: candidate => { candidate.operation = 'REPORT_MISSINGNESS'; candidate.reported_missingness = ['   ']; },
  sparse_observation: candidate => { candidate.operation = 'REPORT_MISSINGNESS'; candidate.reported_missingness = Array(1); }
})) {
  test(`hostile return envelope is rejected: ${name}`, () => {
    assert.throws(() => revalidateDollhousePortableReturn(origin, candidateWith(mutate)), TypeError);
  });
}

test('JSON object property order does not create control drift', () => {
  const reordered = candidateWith(candidate => {
    candidate.returned_control = Object.fromEntries(Object.entries(candidate.returned_control).reverse());
  });
  assert.equal(revalidateDollhousePortableReturn(origin, reordered).status, 'PRESENT_TO_HUMAN');
});

test('maximum-size valid host observations remain advisory and preserve origin missingness', () => {
  const before = clone(projection.control.route_state.missingness);
  const observations = Array(16).fill('x'.repeat(240));
  const returned = operateDollhousePortableProjection(projection, {
    operation: 'REPORT_MISSINGNESS', reportedMissingness: observations
  });
  const receipt = revalidateDollhousePortableReturn(origin, returned);
  assert.equal(receipt.status, 'PRESENT_TO_HUMAN');
  assert.deepEqual(receipt.host_reported_missingness, observations);
  assert.deepEqual(returned.returned_control.route_state.missingness, before);
  assert.equal(receipt.host_reported_missingness_promoted_to_origin_fact, false);
});
