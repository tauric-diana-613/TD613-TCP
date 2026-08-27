import assert from 'node:assert/strict';
import {
  deriveTemporalHistoryUniverse,
  evaluateRepresentativeIndependence,
  runExogenousEvolutionCongruenceGauntlet,
  stepPhiTick,
  stepPhiTwoTicks,
  stepQuestionPhasePulse,
  temporalCandidateAbstractions,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-exogenous-evolution-congruence.js';
import { runCompositionalReplayClosureGauntlet } from '../app/dome-world/previews/a15-r0/aperture-pedagogue-compositional-replay-closure.js';

const parent = runCompositionalReplayClosureGauntlet();
assert.equal(parent.passed, true);

const temporal = deriveTemporalHistoryUniverse(parent);
assert.equal(temporal.status, 'TEMPORAL_HISTORY_UNIVERSE_DERIVED_FROM_PARENT_CUSTODY');
assert.deepEqual(temporal.phases, ['P0', 'P1']);
assert.deepEqual(temporal.histories.map((history) => history.id), [
  'T_AB_P0',
  'T_AB_DUP_P0',
  'T_AB_P1',
  'T_BA_P0',
]);

const byId = new Map(temporal.histories.map((history) => [history.id, history]));
const T_AB_P0 = byId.get('T_AB_P0');
const T_AB_DUP_P0 = byId.get('T_AB_DUP_P0');
const T_AB_P1 = byId.get('T_AB_P1');
const T_BA_P0 = byId.get('T_BA_P0');

assert.ok(T_AB_P0);
assert.ok(T_AB_DUP_P0);
assert.ok(T_AB_P1);
assert.ok(T_BA_P0);
assert.notEqual(T_AB_P0.receipt_variant, T_AB_DUP_P0.receipt_variant);
assert.deepEqual(
  temporalCandidateAbstractions.K_temporal(T_AB_P0),
  temporalCandidateAbstractions.K_temporal(T_AB_DUP_P0),
);
assert.deepEqual(
  temporalCandidateAbstractions.K_operational(T_AB_P0),
  temporalCandidateAbstractions.K_operational(T_AB_P1),
);
assert.notDeepEqual(
  temporalCandidateAbstractions.K_temporal(T_AB_P0),
  temporalCandidateAbstractions.K_temporal(T_AB_P1),
);

const phiABP0 = stepPhiTick(T_AB_P0);
assert.deepEqual(phiABP0.endpoint, [[3, 2], [1, 4]]);
assert.equal(phiABP0.clock_phase, 'P1');
assert.equal(phiABP0.last_action, 'B');
assert.deepEqual(phiABP0.operational_lineage, ['A', 'B']);
assert.equal(phiABP0.evolution_events.length, 1);
assert.equal(phiABP0.evolution_events[0].evolution_id, 'PHI_TICK');

const phiABP1 = stepPhiTick(T_AB_P1);
assert.deepEqual(phiABP1.endpoint, [[3, 1], [1, 5]]);
assert.equal(phiABP1.clock_phase, 'P0');
assert.notDeepEqual(
  temporalCandidateAbstractions.K_operational(phiABP0),
  temporalCandidateAbstractions.K_operational(phiABP1),
);

const phi2ABP0 = stepPhiTwoTicks(T_AB_P0);
const phiIteratedABP0 = stepPhiTick(stepPhiTick(T_AB_P0));
assert.deepEqual(phi2ABP0.endpoint, [[3, 2], [1, 5]]);
assert.equal(phi2ABP0.clock_phase, 'P0');
assert.deepEqual(
  temporalCandidateAbstractions.K_temporal(phi2ABP0),
  temporalCandidateAbstractions.K_temporal(phiIteratedABP0),
);

const qABP0 = stepQuestionPhasePulse(T_AB_P0);
assert.deepEqual(qABP0.endpoint, [[3, 1], [1, 5]]);
assert.equal(qABP0.clock_phase, 'P0');
assert.equal(qABP0.last_action, 'Q_PHASE_PULSE');
assert.deepEqual(qABP0.operational_lineage, ['A', 'B', 'Q_PHASE_PULSE']);

const qAfterPhiABP0 = stepQuestionPhasePulse(stepPhiTick(T_AB_P0));
const phiAfterQABP0 = stepPhiTick(stepQuestionPhasePulse(T_AB_P0));
assert.deepEqual(qAfterPhiABP0.endpoint, [[4, 2], [1, 4]]);
assert.deepEqual(phiAfterQABP0.endpoint, [[4, 2], [1, 5]]);
assert.notDeepEqual(
  temporalCandidateAbstractions.K_temporal(qAfterPhiABP0),
  temporalCandidateAbstractions.K_temporal(phiAfterQABP0),
);
assert.deepEqual(qAfterPhiABP0.operational_lineage, phiAfterQABP0.operational_lineage);
assert.equal(qAfterPhiABP0.clock_phase, phiAfterQABP0.clock_phase);
assert.equal(qAfterPhiABP0.last_action, phiAfterQABP0.last_action);

const operationalPhi = evaluateRepresentativeIndependence(
  temporal.histories,
  temporalCandidateAbstractions.K_operational,
  stepPhiTick,
  'PHI_TICK',
);
assert.equal(operationalPhi.representative_independent, false);
assert.ok(operationalPhi.violations.some((entry) => (
  entry.source_member_ids.includes('T_AB_P0')
  && entry.source_member_ids.includes('T_AB_P1')
)));

for (const [operationId, operation] of [
  ['PHI_TICK', stepPhiTick],
  ['PHI_TWO_TICKS', stepPhiTwoTicks],
  ['Q_PHASE_PULSE', stepQuestionPhasePulse],
  ['Q_AFTER_PHI', (history) => stepQuestionPhasePulse(stepPhiTick(history))],
  ['PHI_AFTER_Q', (history) => stepPhiTick(stepQuestionPhasePulse(history))],
]) {
  const evaluation = evaluateRepresentativeIndependence(
    temporal.histories,
    temporalCandidateAbstractions.K_temporal,
    operation,
    operationId,
  );
  assert.equal(evaluation.representative_independent, true, `${operationId} must remain representative-independent`);
  const duplicateFiber = evaluation.non_singleton_fibers.find((fiber) => (
    fiber.member_ids.includes('T_AB_P0')
    && fiber.member_ids.includes('T_AB_DUP_P0')
  ));
  assert.ok(duplicateFiber, `${operationId} must retain a nontrivial receipt-distinct fiber`);
}

const phiBA = stepPhiTick(T_BA_P0);
assert.deepEqual(phiBA.endpoint, [[4, 1], [1, 4]]);
assert.equal(phiBA.clock_phase, 'P1');
const phi2BA = stepPhiTwoTicks(T_BA_P0);
assert.deepEqual(phi2BA.endpoint, [[4, 1], [2, 4]]);
assert.equal(phi2BA.clock_phase, 'P0');

const unsupported = stepPhiTick(Object.freeze({
  ...T_AB_P0,
  id: 'T_UNDECLARED',
  last_action: 'UNDECLARED_ACTION',
}));
assert.equal(unsupported.status, 'UNDECLARED_LAST_ACTION_ABSTAINS');
assert.equal(unsupported.disposition, 'ABSTAIN_BEFORE_EXOGENOUS_EVOLUTION');

assert.equal(
  deriveTemporalHistoryUniverse({ passed: false }).status,
  'PARENT_COMPOSITIONAL_REPLAY_CLOSURE_NOT_WITNESSED_BY_EXECUTABLE',
);

const result = runExogenousEvolutionCongruenceGauntlet();
assert.equal(result.passed, true);
for (const [key, value] of Object.entries(result.criteria)) {
  assert.equal(value, true, `${key} must hold`);
}
assert.equal(
  result.phase_erasure_hostile.classification,
  'TEMPORAL_PHASE_ERASURE_BREAKS_EXOGENOUS_EVOLUTION_CONGRUENCE',
);
assert.equal(result.question_time_order.order_sensitive, true);
assert.equal(
  result.question_time_order.classification,
  'QUESTION_TIME_ORDER_IS_SENSITIVE_WHILE_EACH_ORDER_REMAINS_REPRESENTATIVE_INDEPENDENT',
);
assert.equal(
  result.classification,
  'FINITE_TEMPORAL_PHASE_AUGMENTATION_RESTORES_DECLARED_EXOGENOUS_EVOLUTION_CONGRUENCE_WITH_ORDER_SENSITIVE_QUESTION_TIME_INTERACTION',
);
assert.equal(
  result.canonical_bounded_scientific_claim,
  'IN_THE_AUTHORED_FINITE_TEMPORAL_FIXTURE_THE_PREVIOUS_OPERATIONAL_ABSTRACTION_CAN_COLLAPSE_EQUAL_OPERATIONAL_HISTORIES_WHOSE_DECLARED_CLOCK_PHASES_PRODUCE_DIFFERENT_NO_QUESTION_SUCCESSORS_WHILE_A_PHASE_AUGMENTED_NONTRIVIAL_QUOTIENT_REMAINS_REPRESENTATIVE_INDEPENDENT_UNDER_ONE_TICK_TWO_TICK_QUESTION_AND_BOTH_QUESTION_TIME_ORDERINGS_DIRECT_TWO_TICK_EVOLUTION_MATCHES_TWO_ITERATED_ONE_TICK_EVOLUTIONS_AND_QUESTION_INDUCED_AND_TIME_INDUCED_MAPS_CAN_REMAIN_LAWFUL_WHILE_FAILING_TO_COMMUTE',
);
assert.equal(
  result.next_learning_action,
  'HUMAN_𝄐_REQUIRED_BEFORE_DECIDING_WHETHER_THE_TEMPORALLY_AUGMENTED_QUOTIENT_MAY_BECOME_THE_FIRST_BOUNDED_PATH_OBJECT_OR_REQUIRES_A_LONGER_HORIZON_TIME_ASSAY',
);

for (const key of [
  'generic_time_augmentation_theorem_earned',
  'time_homogeneous_markov_theorem_earned',
  'markov_state_theorem_earned',
  'nonautonomous_dynamical_system_identification_earned',
  'skew_product_theorem_earned',
  'semigroup_theorem_earned',
  'flow_theorem_earned',
  'generator_theorem_earned',
  'lie_bracket_identification_earned',
  'baker_campbell_hausdorff_structure_earned',
  'control_system_theorem_earned',
  'stationarity_theorem_earned',
  'ergodicity_theorem_earned',
  'causal_state_theorem_earned',
  'minimal_state_theorem_earned',
  'optimal_state_theorem_earned',
  'generic_right_congruence_theorem_earned',
  'myhill_nerode_theorem_earned',
  'bisimulation_theorem_earned',
  'predictive_state_theorem_earned',
  'path_object_promotion_authority',
  'path_category_earned',
  'path_groupoid_earned',
  'transport_functor_earned',
  'connection_earned',
  'loop_endomorphism_earned',
  'holonomy_earned',
  'curvature_earned',
  'berry_structure_earned',
  'quantum_behavior_earned',
  'canonical_operator_tomography_promotion_authority',
  'proto_loom_earned',
  'td613_general_theorem_earned',
  'a16_reopened',
  'live_ash_mutation',
  'merge_authority',
  'production_authority',
  'vercel_authority',
]) {
  assert.equal(result[key], false, `${key} must remain false`);
}

console.log(JSON.stringify({
  schema: result.schema,
  classification: result.classification,
  phase_erasure_breaks_time_congruence: !result.phase_erasure_hostile.one_tick_operational_projection_equal,
  temporal_phi_congruent: result.temporal_candidate.phi_tick.representative_independent,
  temporal_phi2_congruent: result.temporal_candidate.phi_two_ticks.representative_independent,
  direct_two_tick_consistent: result.two_tick_composition_consistency.every((entry) => entry.equal),
  question_time_order_sensitive: result.question_time_order.order_sensitive,
  next: result.next_learning_action,
}));
