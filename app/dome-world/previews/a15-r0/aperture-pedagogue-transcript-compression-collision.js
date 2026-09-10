import { simulateRoute } from './aperture-pedagogue-route-conditioned-observation-transcript.js';

export const TRANSCRIPT_COMPRESSION_COLLISION_SCHEMA = 'td613.a15-r0.aperture-pedagogue-transcript-compression-collision/v0.1';

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const COLLISION_TRANSITIONS = freeze({
  A: [[0, 0], [0, 1]],
  B: [[1, 0], [0, 0]],
});
const ZERO_TRANSITIONS = freeze({
  A: [[0, 0], [0, 0]],
  B: [[0, 0], [0, 0]],
});

const endpointKey = (M) => JSON.stringify(M);
const transcriptVector = (route) => freeze([route.action_indexed_responses.A, route.action_indexed_responses.B]);
const sumProjection = ([A, B]) => A + B;
const weightedProjection = ([A, B]) => A + (2 * B);
const decisionD6 = ([A, B]) => A + B >= 6;

export function finiteFibers(records, projection) {
  const fibers = new Map();
  for (const record of records) {
    const key = JSON.stringify(projection(record));
    if (!fibers.has(key)) fibers.set(key, []);
    fibers.get(key).push(record);
  }
  return freeze([...fibers.entries()].map(([key, members]) => ({ key, members: [...members] })));
}

export function claimFactorsThrough(records, projection, claim) {
  const fibers = finiteFibers(records, projection);
  const homogeneous = fibers.every(({ members }) => {
    const first = JSON.stringify(claim(members[0]));
    return members.every((member) => JSON.stringify(claim(member)) === first);
  });
  return freeze({ factors: homogeneous, fibers });
}

export function runTranscriptCompressionCollisionGauntlet() {
  const AB = simulateRoute(['A', 'B'], { timing: 'sample_before_transition', transitions: COLLISION_TRANSITIONS });
  const BA = simulateRoute(['B', 'A'], { timing: 'sample_before_transition', transitions: COLLISION_TRANSITIONS });
  const FROZEN = simulateRoute(['A', 'B'], { timing: 'sample_before_transition', transitions: ZERO_TRANSITIONS });
  const missingTiming = simulateRoute(['A', 'B'], { transitions: COLLISION_TRANSITIONS });

  const records = freeze([
    { id: 'AB', route_label: 'AB', transcript: transcriptVector(AB), endpoint: AB.final_operator },
    { id: 'BA', route_label: 'BA', transcript: transcriptVector(BA), endpoint: BA.final_operator },
    { id: 'FROZEN', route_label: 'FROZEN', transcript: transcriptVector(FROZEN), endpoint: FROZEN.final_operator },
  ]);

  const sumFactorDecision = claimFactorsThrough(records, (r) => sumProjection(r.transcript), (r) => decisionD6(r.transcript));
  const sumFactorRoute = claimFactorsThrough(records, (r) => sumProjection(r.transcript), (r) => r.route_label);
  const weightedFactorRoute = claimFactorsThrough(records, (r) => weightedProjection(r.transcript), (r) => r.route_label);
  const fullFactorRoute = claimFactorsThrough(records, (r) => r.transcript, (r) => r.route_label);
  const decisionValues = new Set(records.map((r) => decisionD6(r.transcript)));

  const criteria = freeze({
    C1_same_action_multiset_and_declared_timing: AB.status === 'ROUTE_TRANSCRIPT_COMPLETE' && BA.status === 'ROUTE_TRANSCRIPT_COMPLETE' && [...AB.order].sort().join('') === 'AB' && [...BA.order].sort().join('') === 'AB',
    C2_identical_final_operator_for_route_pair: endpointKey(AB.final_operator) === endpointKey([[3, 1], [1, 4]]) && endpointKey(BA.final_operator) === endpointKey(AB.final_operator),
    C3_AB_transcript: endpointKey(transcriptVector(AB)) === endpointKey([2, 4]),
    C4_BA_transcript: endpointKey(transcriptVector(BA)) === endpointKey([3, 3]),
    C5_sum_collision_at_6: sumProjection(transcriptVector(AB)) === 6 && sumProjection(transcriptVector(BA)) === 6,
    C6_full_transcripts_distinct: endpointKey(transcriptVector(AB)) !== endpointKey(transcriptVector(BA)),
    C7_frozen_support_state: endpointKey(transcriptVector(FROZEN)) === endpointKey([2, 3]) && sumProjection(transcriptVector(FROZEN)) === 5 && endpointKey(FROZEN.final_operator) !== endpointKey(AB.final_operator),
    C8_downstream_decision_nonconstant_over_universe: decisionValues.size === 2,
    C9_decision_factors_through_sum: sumFactorDecision.factors === true,
    C10_route_does_not_factor_through_sum: sumFactorRoute.factors === false,
    C11_weighted_scalar_retains_route_custody: weightedProjection(transcriptVector(AB)) === 10 && weightedProjection(transcriptVector(BA)) === 9 && weightedProjection(transcriptVector(FROZEN)) === 8 && weightedFactorRoute.factors === true,
    C12_full_transcript_retains_route_custody: fullFactorRoute.factors === true,
    C13_missing_timing_abstains: missingTiming.status === 'SEQUENTIAL_OBSERVATION_TIMING_UNDECLARED' && missingTiming.disposition === 'ABSTAIN_BEFORE_ROUTE_TRANSCRIPT_COMPARISON',
  });

  const passed = Object.values(criteria).every(Boolean);
  return freeze({
    schema: TRANSCRIPT_COMPRESSION_COLLISION_SCHEMA,
    universe: records,
    route_pair: { AB, BA },
    support_control: FROZEN,
    representations: {
      full: records.map((r) => ({ id: r.id, value: r.transcript })),
      sum: records.map((r) => ({ id: r.id, value: sumProjection(r.transcript) })),
      weighted: records.map((r) => ({ id: r.id, value: weightedProjection(r.transcript) })),
    },
    factorization: {
      decision_through_sum: sumFactorDecision,
      route_through_sum: sumFactorRoute,
      route_through_weighted: weightedFactorRoute,
      route_through_full: fullFactorRoute,
    },
    downstream_decision: { id: 'D6', rule: 'A_PLUS_B_GTE_6', values: records.map((r) => ({ id: r.id, value: decisionD6(r.transcript) })) },
    missing_timing: missingTiming,
    criteria,
    passed,
    classification: passed ? 'DECISION_SUFFICIENT_COMPRESSION_WITH_ROUTE_CUSTODY_COLLISION' : null,
    canonical_bounded_scientific_claim: passed
      ? 'A_DECLARED_SCALAR_COMPRESSION_CAN_BE_SUFFICIENT_FOR_ONE_FINITE_DOWNSTREAM_DECISION_WHILE_INSUFFICIENT_FOR_ROUTE_CUSTODY_EVEN_WHEN_THE_FULL_ACTION_INDEXED_TRANSCRIPT_RETAINS_THE_ROUTE_DISTINCTION_AND_AN_ALTERNATE_ONE_DIMENSIONAL_PROJECTION_CAN_RETAIN_IT_IN_THE_AUTHORED_FIXTURE'
      : null,
    next_learning_action: passed ? 'TEST_PARTIAL_EVENT_CUSTODY_AS_A_CLAIM_CONDITIONED_PROJECTION' : null,
    generic_sufficient_statistic_theorem_earned: false,
    generic_information_loss_theorem_earned: false,
    shannon_information_quantity_earned: false,
    minimal_representation_theorem_earned: false,
    optimal_compression_theorem_earned: false,
    causal_history_reconstruction_earned: false,
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
    live_ash_mutation: false,
    merge_authority: false,
    production_authority: false,
    vercel_authority: false,
  });
}
