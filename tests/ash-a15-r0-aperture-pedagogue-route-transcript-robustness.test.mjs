import assert from 'node:assert/strict';
import {
  routeEndpointAffineFormula,
  endpointFor,
  buildRouteBoxes,
  evaluateSharedEndpointFamily,
  evaluateEndpointHostile,
  runRouteTranscriptRobustnessGauntlet,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-route-transcript-robustness.js';

const approx = (a, b, eps = 1e-12) => Math.abs(a - b) <= eps;
const assertInterval = (actual, lo, hi) => {
  assert.equal(approx(actual.lo, lo), true, `interval lo ${actual.lo} != ${lo}`);
  assert.equal(approx(actual.hi, hi), true, `interval hi ${actual.hi} != ${hi}`);
};

const formulaAB = routeEndpointAffineFormula(['A', 'B']);
const formulaBA = routeEndpointAffineFormula(['B', 'A']);
assert.deepEqual(formulaAB, formulaBA);
assert.deepEqual(formulaAB, [
  [{ constant: 2, alpha: 0, beta: 1 }, { constant: 1, alpha: 0, beta: 0 }],
  [{ constant: 1, alpha: 0, beta: 0 }, { constant: 3, alpha: 1, beta: 0 }],
]);
assert.throws(() => routeEndpointAffineFormula(['A', 'A']), /EXACTLY_A_AND_B_ONCE/);

assert.deepEqual(endpointFor(1, 2), [[4, 1], [1, 4]]);

const robust = buildRouteBoxes({
  alpha: { lo: 0.9, hi: 1.1 },
  beta: { lo: 1.8, hi: 2.2 },
  eta: 0.05,
  timing: 'sample_before_transition',
});
assert.equal(robust.status, 'ROUTE_TRANSCRIPT_INTERVALS_COMPUTED');
assertInterval(robust.observed_boxes.AB.A, 1.95, 2.05);
assertInterval(robust.observed_boxes.AB.B, 3.85, 4.15);
assertInterval(robust.observed_boxes.BA.A, 3.75, 4.25);
assertInterval(robust.observed_boxes.BA.B, 2.95, 3.05);
assert.equal(robust.boxes_overlap, false);
assert.equal(robust.classification, 'ROBUST_ROUTE_TRANSCRIPT_SEPARATION_OVER_DECLARED_TRANSITION_AND_ERROR_FAMILY');

const ambiguous = buildRouteBoxes({
  alpha: { lo: 0.05, hi: 0.15 },
  beta: { lo: 0.05, hi: 0.15 },
  eta: 0.10,
  timing: 'sample_before_transition',
});
assertInterval(ambiguous.observed_boxes.AB.A, 1.90, 2.10);
assertInterval(ambiguous.observed_boxes.AB.B, 2.95, 3.25);
assertInterval(ambiguous.observed_boxes.BA.A, 1.95, 2.25);
assertInterval(ambiguous.observed_boxes.BA.B, 2.90, 3.10);
assert.equal(ambiguous.boxes_overlap, true);
assert.equal(ambiguous.classification, 'ROUTE_TRANSCRIPT_SEPARATION_UNRESOLVED_UNDER_DECLARED_ERROR_FAMILY');

const shared = evaluateSharedEndpointFamily({
  alpha: { lo: 0.9, hi: 1.1 },
  beta: { lo: 1.8, hi: 2.2 },
});
assert.equal(shared.shared_parameter_covenant, true);
assert.deepEqual(shared.affine_endpoint_formula_AB, shared.affine_endpoint_formula_BA);
assert.deepEqual(shared.affine_endpoint_formula_AB, formulaAB);
assert.equal(shared.pointwise_endpoint_identity_certified_over_declared_family, true);
assert.equal(shared.corner_comparisons_are_diagnostic_only, true);
assert.equal(shared.corner_comparisons.length, 4);
assert.equal(shared.all_frozen_corners_agree, true);
assert.equal(shared.anti_equivalence, 'FOUR_AGREEING_CORNERS_DO_NOT_PROVE_AN_ARBITRARY_NONLINEAR_FAMILY');
for (const comparison of shared.corner_comparisons) {
  assert.equal(comparison.equal, true);
  assert.deepEqual(comparison.AB, comparison.BA);
}

const hostile = evaluateEndpointHostile();
assert.deepEqual(hostile.AB, [[4, 1], [1, 4]]);
assert.deepEqual(hostile.BA, [[4.4, 1], [1, 4]]);
assert.equal(hostile.max_entry_difference > hostile.endpoint_tolerance, true);
assert.equal(hostile.common_endpoint_established, false);
assert.equal(hostile.classification, 'COMMON_ENDPOINT_NOT_ESTABLISHED_OVER_DECLARED_TRANSITION_MODEL');
assert.equal(hostile.disposition, 'ABSTAIN_FROM_COMMON_ENDPOINT_ROUTE_TRANSCRIPT_CLAIM');

const missingTiming = buildRouteBoxes({
  alpha: { lo: 0.9, hi: 1.1 },
  beta: { lo: 1.8, hi: 2.2 },
  eta: 0.05,
});
assert.equal(missingTiming.status, 'SEQUENTIAL_OBSERVATION_TIMING_UNDECLARED');
assert.equal(missingTiming.disposition, 'ABSTAIN_BEFORE_ROUTE_TRANSCRIPT_COMPARISON');

assert.throws(
  () => buildRouteBoxes({ alpha: { lo: 1, hi: 0 }, beta: { lo: 1, hi: 2 }, eta: 0.1, timing: 'sample_before_transition' }),
  /VALID_ALPHA_INTERVAL_REQUIRED/,
);
assert.throws(
  () => buildRouteBoxes({ alpha: { lo: 0, hi: 1 }, beta: { lo: 1, hi: 2 }, eta: -0.1, timing: 'sample_before_transition' }),
  /NONNEGATIVE_MEASUREMENT_ERROR_BOUND_REQUIRED/,
);

const result = runRouteTranscriptRobustnessGauntlet();
assert.equal(result.passed, true);
for (const [key, value] of Object.entries(result.criteria)) {
  assert.equal(value, true, `${key} must hold`);
}
assert.equal(result.representation_epsilon, 1e-12);
assert.equal(
  result.canonical_bounded_scientific_claim,
  'ROUTE_CONDITIONED_ACTION_INDEXED_OBSERVATION_TRANSCRIPTS_CAN_REMAIN_SET_WISE_SEPARABLE_OVER_A_DECLARED_SHARED_FAMILY_OF_COMMUTING_ADDITIVE_TRANSITION_MAGNITUDES_AND_DETERMINISTIC_BOUNDED_MEASUREMENT_ERROR_WHILE_A_SMALLER_EFFECT_FAMILY_CAN_BECOME_UNRESOLVED_AND_ROUTE_DEPENDENT_ENDPOINT_DRIFT_BLOCKS_THE_COMMON_ENDPOINT_CLAIM_IN_THE_AUTHORED_2X2_FIXTURE',
);
assert.equal(result.next_learning_action, 'CONTINUE_TO_BOUNDED_TRANSCRIPT_COMPRESSION_AND_PARTIAL_CUSTODY_ASSAYS_BEFORE_HUMAN_𝄐');

for (const key of [
  'general_robust_path_dependence_theorem_earned',
  'statistical_consistency_earned',
  'probabilistic_route_classification_earned',
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
  'live_ash_mutation',
  'merge_authority',
  'production_authority',
  'vercel_authority',
]) {
  assert.equal(result[key], false, `${key} must remain false`);
}

console.log(JSON.stringify({
  schema: result.schema,
  robust_classification: result.robust_family.classification,
  ambiguity_classification: result.ambiguity_control.classification,
  endpoint_hostile: result.endpoint_hostile.classification,
  claim: result.canonical_bounded_scientific_claim,
  next: result.next_learning_action,
}));
