import assert from 'node:assert/strict';
import {
  simulateRoute,
  simulateFinalStateSampling,
  runRouteConditionedObservationTranscriptGauntlet,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-route-conditioned-observation-transcript.js';

const primaryAB = simulateRoute(['A', 'B'], { timing: 'sample_before_transition' });
const primaryBA = simulateRoute(['B', 'A'], { timing: 'sample_before_transition' });

assert.equal(primaryAB.status, 'ROUTE_TRANSCRIPT_COMPLETE');
assert.equal(primaryBA.status, 'ROUTE_TRANSCRIPT_COMPLETE');
assert.deepEqual(primaryAB.final_operator, [[4, 1], [1, 4]]);
assert.deepEqual(primaryBA.final_operator, [[4, 1], [1, 4]]);
assert.deepEqual(primaryAB.action_indexed_responses, { A: 2, B: 4 });
assert.deepEqual(primaryBA.action_indexed_responses, { A: 4, B: 3 });
assert.equal(primaryAB.cumulative_response, 6);
assert.equal(primaryBA.cumulative_response, 7);

assert.deepEqual(primaryAB.events[0], {
  action_id: 'A',
  step_index: 0,
  operator_before: [[2, 1], [1, 3]],
  probe_r: [1, 0],
  probe_x: [1, 0],
  scalar_response: 2,
  transition_delta: [[0, 0], [0, 1]],
  operator_after: [[2, 1], [1, 4]],
});
assert.deepEqual(primaryAB.events[1].operator_before, [[2, 1], [1, 4]]);
assert.equal(primaryAB.events[1].scalar_response, 4);

assert.equal(Object.isFrozen(primaryAB.events[0]), true);
assert.equal(Object.isFrozen(primaryAB.events[0].operator_before), true);
assert.equal(Object.isFrozen(primaryAB.events[0].operator_before[0]), true);
assert.throws(() => { primaryAB.events[0].operator_before[0][0] = 999; }, TypeError);
assert.deepEqual(primaryAB.events[0].operator_before, [[2, 1], [1, 3]]);

const missingTiming = simulateRoute(['A', 'B']);
assert.equal(missingTiming.status, 'SEQUENTIAL_OBSERVATION_TIMING_UNDECLARED');
assert.equal(missingTiming.disposition, 'ABSTAIN_BEFORE_ROUTE_TRANSCRIPT_COMPARISON');
assert.deepEqual(missingTiming.events, []);

assert.throws(
  () => simulateRoute(['A', 'A'], { timing: 'sample_before_transition' }),
  /EXACTLY_ACTIONS_A_AND_B_ONCE/,
);

const finalAB = simulateFinalStateSampling(['A', 'B']);
const finalBA = simulateFinalStateSampling(['B', 'A']);
assert.deepEqual(finalAB.final_operator, finalBA.final_operator);
assert.deepEqual(finalAB.action_indexed_responses, { A: 4, B: 4 });
assert.deepEqual(finalAB.action_indexed_responses, finalBA.action_indexed_responses);

const result = runRouteConditionedObservationTranscriptGauntlet();
assert.equal(result.passed, true);
for (const [key, value] of Object.entries(result.criteria)) {
  assert.equal(value, true, `${key} must hold`);
}
assert.equal(result.classification, 'IDENTICAL_FINAL_OPERATOR_WITH_ROUTE_CONDITIONED_OBSERVATION_TRANSCRIPT_DIVERGENCE');
assert.equal(
  result.canonical_bounded_scientific_claim,
  'COMMUTING_ADDITIVE_OPERATOR_TRANSITIONS_CAN_TERMINATE_AT_THE_SAME_FINAL_OPERATOR_WHILE_PRODUCING_DIFFERENT_ACTION_INDEXED_SCALAR_OBSERVATION_TRANSCRIPTS_WHEN_RESPONSES_ARE_SAMPLED_AT_DIFFERENT_INTERMEDIATE_OPERATOR_STATES_IN_THE_AUTHORED_2X2_FIXTURE',
);
assert.equal(
  result.next_learning_action,
  'HELD_FOR_ROUTE_TRANSCRIPT_ROBUSTNESS_UNDER_SMALL_TRANSITION_PERTURBATIONS_AND_DECLARED_MEASUREMENT_NOISE_AFTER_WITNESS_RECEIPT',
);

for (const key of [
  'general_path_dependence_theorem_earned',
  'path_category_earned',
  'path_groupoid_earned',
  'transport_functor_earned',
  'connection_earned',
  'holonomy_earned',
  'curvature_earned',
  'berry_structure_earned',
  'quantum_behavior_earned',
  'canonical_operator_tomography_promotion_authority',
  'proto_loom_earned',
  'a16_reopened',
  'merge_authority',
  'production_authority',
  'vercel_authority',
]) {
  assert.equal(result[key], false, `${key} must remain false`);
}

console.log(JSON.stringify({
  schema: result.schema,
  AB: result.primary.AB.action_indexed_responses,
  BA: result.primary.BA.action_indexed_responses,
  final: result.primary.AB.final_operator,
  classification: result.classification,
  claim: result.canonical_bounded_scientific_claim,
  next: result.next_learning_action,
}));
