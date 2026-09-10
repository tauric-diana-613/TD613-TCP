export const ROUTE_CONDITIONED_TRANSCRIPT_SCHEMA = 'td613.a15-r0.aperture-pedagogue-route-conditioned-observation-transcript/v0.1';

const T0 = Object.freeze([[2, 1], [1, 3]].map(Object.freeze));
const ZERO = Object.freeze([[0, 0], [0, 0]].map(Object.freeze));

const ACTIONS = Object.freeze({
  A: Object.freeze({ id: 'A', r: Object.freeze([1, 0]), x: Object.freeze([1, 0]) }),
  B: Object.freeze({ id: 'B', r: Object.freeze([0, 1]), x: Object.freeze([0, 1]) }),
});

const PRIMARY_TRANSITIONS = Object.freeze({
  A: Object.freeze([[0, 0], [0, 1]].map(Object.freeze)),
  B: Object.freeze([[2, 0], [0, 0]].map(Object.freeze)),
});

const SELF_ONLY_TRANSITIONS = Object.freeze({
  A: Object.freeze([[1, 0], [0, 0]].map(Object.freeze)),
  B: Object.freeze([[0, 0], [0, 1]].map(Object.freeze)),
});

const FROZEN_TRANSITIONS = Object.freeze({ A: ZERO, B: ZERO });

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const cloneMatrix = (M) => M.map((row) => [...row]);
const addMatrix = (A, B) => A.map((row, i) => row.map((value, j) => value + B[i][j]));
const equalMatrix = (A, B) => A.every((row, i) => row.every((value, j) => value === B[i][j]));
const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0);
const mv = (M, x) => M.map((row) => dot(row, x));
const response = (M, action) => dot(action.r, mv(M, action.x));

const canonicalActionResponses = (events) => freeze(Object.fromEntries([...events]
  .sort((a, b) => a.action_id.localeCompare(b.action_id))
  .map((event) => [event.action_id, event.scalar_response])));

export function simulateRoute(order, { timing, transitions = PRIMARY_TRANSITIONS } = {}) {
  if (timing !== 'sample_before_transition') {
    return freeze({
      status: 'SEQUENTIAL_OBSERVATION_TIMING_UNDECLARED',
      disposition: 'ABSTAIN_BEFORE_ROUTE_TRANSCRIPT_COMPARISON',
      events: [],
    });
  }
  if (!Array.isArray(order) || order.length !== 2 || [...order].sort().join('') !== 'AB') {
    throw new Error('ROUTE_MUST_CONTAIN_EXACTLY_ACTIONS_A_AND_B_ONCE');
  }

  let operator = cloneMatrix(T0);
  const events = [];

  for (let step = 0; step < order.length; step += 1) {
    const actionId = order[step];
    const action = ACTIONS[actionId];
    const delta = transitions[actionId];
    if (!delta) throw new Error(`DECLARED_TRANSITION_REQUIRED_FOR_${actionId}`);

    const before = cloneMatrix(operator);
    const z = response(before, action);
    const after = addMatrix(before, delta);

    events.push(freeze({
      action_id: actionId,
      step_index: step,
      operator_before: cloneMatrix(before),
      probe_r: [...action.r],
      probe_x: [...action.x],
      scalar_response: z,
      transition_delta: cloneMatrix(delta),
      operator_after: cloneMatrix(after),
    }));

    operator = after;
  }

  const actionIndexed = canonicalActionResponses(events);
  return freeze({
    status: 'ROUTE_TRANSCRIPT_COMPLETE',
    order: [...order],
    events,
    action_indexed_responses: actionIndexed,
    cumulative_response: events.reduce((sum, event) => sum + event.scalar_response, 0),
    final_operator: cloneMatrix(operator),
  });
}

export function simulateFinalStateSampling(order, transitions = PRIMARY_TRANSITIONS) {
  if (!Array.isArray(order) || order.length !== 2 || [...order].sort().join('') !== 'AB') {
    throw new Error('ROUTE_MUST_CONTAIN_EXACTLY_ACTIONS_A_AND_B_ONCE');
  }
  let operator = cloneMatrix(T0);
  for (const actionId of order) operator = addMatrix(operator, transitions[actionId]);
  const actionIndexed = freeze({
    A: response(operator, ACTIONS.A),
    B: response(operator, ACTIONS.B),
  });
  return freeze({
    final_operator: cloneMatrix(operator),
    action_indexed_responses: actionIndexed,
    cumulative_response: actionIndexed.A + actionIndexed.B,
  });
}

export function runRouteConditionedObservationTranscriptGauntlet() {
  const primaryAB = simulateRoute(['A', 'B'], { timing: 'sample_before_transition', transitions: PRIMARY_TRANSITIONS });
  const primaryBA = simulateRoute(['B', 'A'], { timing: 'sample_before_transition', transitions: PRIMARY_TRANSITIONS });
  const frozenAB = simulateRoute(['A', 'B'], { timing: 'sample_before_transition', transitions: FROZEN_TRANSITIONS });
  const frozenBA = simulateRoute(['B', 'A'], { timing: 'sample_before_transition', transitions: FROZEN_TRANSITIONS });
  const selfAB = simulateRoute(['A', 'B'], { timing: 'sample_before_transition', transitions: SELF_ONLY_TRANSITIONS });
  const selfBA = simulateRoute(['B', 'A'], { timing: 'sample_before_transition', transitions: SELF_ONLY_TRANSITIONS });
  const finalAB = simulateFinalStateSampling(['A', 'B'], PRIMARY_TRANSITIONS);
  const finalBA = simulateFinalStateSampling(['B', 'A'], PRIMARY_TRANSITIONS);
  const missingTiming = simulateRoute(['A', 'B'], { transitions: PRIMARY_TRANSITIONS });

  const additiveAB = addMatrix(addMatrix(T0, PRIMARY_TRANSITIONS.A), PRIMARY_TRANSITIONS.B);
  const additiveBA = addMatrix(addMatrix(T0, PRIMARY_TRANSITIONS.B), PRIMARY_TRANSITIONS.A);

  const firstEvent = primaryAB.events[0];
  const retainedBefore = JSON.stringify(firstEvent.operator_before);
  const retainedResponse = firstEvent.scalar_response;
  const immutableCustody = Object.isFrozen(firstEvent)
    && Object.isFrozen(firstEvent.operator_before)
    && Object.isFrozen(firstEvent.operator_before[0])
    && Object.isFrozen(firstEvent.transition_delta)
    && JSON.stringify(firstEvent.operator_before) === retainedBefore
    && firstEvent.scalar_response === retainedResponse;

  const criteria = freeze({
    S1_primary_transitions_additively_commute: equalMatrix(additiveAB, additiveBA),
    S2_same_action_multiset: [...primaryAB.order].sort().join('') === [...primaryBA.order].sort().join('') && [...primaryAB.order].sort().join('') === 'AB',
    S3_identical_final_operator: equalMatrix(primaryAB.final_operator, [[4, 1], [1, 4]]) && equalMatrix(primaryBA.final_operator, [[4, 1], [1, 4]]),
    S4_AB_action_indexed_transcript: primaryAB.action_indexed_responses.A === 2 && primaryAB.action_indexed_responses.B === 4,
    S5_BA_action_indexed_transcript: primaryBA.action_indexed_responses.A === 4 && primaryBA.action_indexed_responses.B === 3,
    S6_cumulative_responses_diverge: primaryAB.cumulative_response === 6 && primaryBA.cumulative_response === 7,
    S7_intermediate_custody_immutable: immutableCustody,
    S8_frozen_operator_control_invariant: frozenAB.action_indexed_responses.A === 2 && frozenAB.action_indexed_responses.B === 3 && JSON.stringify(frozenAB.action_indexed_responses) === JSON.stringify(frozenBA.action_indexed_responses) && frozenAB.cumulative_response === 5 && frozenBA.cumulative_response === 5,
    S9_self_only_transition_control_invariant: equalMatrix(selfAB.final_operator, [[3, 1], [1, 4]]) && equalMatrix(selfBA.final_operator, [[3, 1], [1, 4]]) && JSON.stringify(selfAB.action_indexed_responses) === JSON.stringify({ A: 2, B: 3 }) && JSON.stringify(selfBA.action_indexed_responses) === JSON.stringify({ A: 2, B: 3 }),
    S10_common_final_state_sampling_erases_difference: equalMatrix(finalAB.final_operator, finalBA.final_operator) && JSON.stringify(finalAB.action_indexed_responses) === JSON.stringify({ A: 4, B: 4 }) && JSON.stringify(finalAB.action_indexed_responses) === JSON.stringify(finalBA.action_indexed_responses),
    S11_undeclared_timing_abstains: missingTiming.status === 'SEQUENTIAL_OBSERVATION_TIMING_UNDECLARED' && missingTiming.disposition === 'ABSTAIN_BEFORE_ROUTE_TRANSCRIPT_COMPARISON',
  });

  const passed = Object.values(criteria).every(Boolean);
  return freeze({
    schema: ROUTE_CONDITIONED_TRANSCRIPT_SCHEMA,
    primary: { AB: primaryAB, BA: primaryBA },
    controls: { frozen_operator: { AB: frozenAB, BA: frozenBA }, self_only: { AB: selfAB, BA: selfBA }, final_state_sampling: { AB: finalAB, BA: finalBA }, missing_timing: missingTiming },
    criteria,
    passed,
    classification: passed ? 'IDENTICAL_FINAL_OPERATOR_WITH_ROUTE_CONDITIONED_OBSERVATION_TRANSCRIPT_DIVERGENCE' : null,
    canonical_bounded_scientific_claim: passed ? 'COMMUTING_ADDITIVE_OPERATOR_TRANSITIONS_CAN_TERMINATE_AT_THE_SAME_FINAL_OPERATOR_WHILE_PRODUCING_DIFFERENT_ACTION_INDEXED_SCALAR_OBSERVATION_TRANSCRIPTS_WHEN_RESPONSES_ARE_SAMPLED_AT_DIFFERENT_INTERMEDIATE_OPERATOR_STATES_IN_THE_AUTHORED_2X2_FIXTURE' : null,
    next_learning_action: passed ? 'HELD_FOR_ROUTE_TRANSCRIPT_ROBUSTNESS_UNDER_SMALL_TRANSITION_PERTURBATIONS_AND_DECLARED_MEASUREMENT_NOISE_AFTER_WITNESS_RECEIPT' : null,
    general_path_dependence_theorem_earned: false,
    path_category_earned: false,
    path_groupoid_earned: false,
    transport_functor_earned: false,
    connection_earned: false,
    holonomy_earned: false,
    curvature_earned: false,
    berry_structure_earned: false,
    quantum_behavior_earned: false,
    canonical_operator_tomography_promotion_authority: false,
    proto_loom_earned: false,
    a16_reopened: false,
    merge_authority: false,
    production_authority: false,
    vercel_authority: false,
  });
}
