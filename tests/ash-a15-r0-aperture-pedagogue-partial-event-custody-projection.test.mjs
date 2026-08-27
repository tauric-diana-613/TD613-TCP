import assert from 'node:assert/strict';
import {
  exactClaimConditionedViews,
  robustLabelCustodyViews,
  runPartialEventCustodyProjectionGauntlet,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-partial-event-custody-projection.js';
import { runTranscriptCompressionCollisionGauntlet } from '../app/dome-world/previews/a15-r0/aperture-pedagogue-transcript-compression-collision.js';
import { runRouteTranscriptRobustnessGauntlet } from '../app/dome-world/previews/a15-r0/aperture-pedagogue-route-transcript-robustness.js';

const collisionParent = runTranscriptCompressionCollisionGauntlet();
const robustnessParent = runRouteTranscriptRobustnessGauntlet();
assert.equal(collisionParent.passed, true);
assert.equal(robustnessParent.passed, true);

const collisionBefore = JSON.stringify(collisionParent.universe);
const robustnessBefore = JSON.stringify({
  robust_family: robustnessParent.robust_family,
  shared_endpoint_family: robustnessParent.shared_endpoint_family,
});

const exact = exactClaimConditionedViews(collisionParent);
assert.equal(exact.status, 'EXACT_CLAIM_CONDITIONED_VIEWS_COMPUTED');
assert.deepEqual(exact.domain_U_ids, ['AB', 'BA', 'FROZEN']);
assert.deepEqual(exact.domain_R_ids, ['AB', 'BA']);

assert.deepEqual(exact.projections.sum, [
  { id: 'AB', value: 6 },
  { id: 'BA', value: 6 },
  { id: 'FROZEN', value: 5 },
]);
assert.deepEqual(exact.projections.A_labeled_event, [
  { id: 'AB', value: { action_id: 'A', scalar_response: 2 } },
  { id: 'BA', value: { action_id: 'A', scalar_response: 3 } },
  { id: 'FROZEN', value: { action_id: 'A', scalar_response: 2 } },
]);
assert.deepEqual(exact.projections.B_labeled_event, [
  { id: 'AB', value: { action_id: 'B', scalar_response: 4 } },
  { id: 'BA', value: { action_id: 'B', scalar_response: 3 } },
  { id: 'FROZEN', value: { action_id: 'B', scalar_response: 3 } },
]);
assert.deepEqual(exact.projections.joint_sum_plus_A, [
  { id: 'AB', value: { cumulative_response: 6, A_labeled_scalar: 2 } },
  { id: 'BA', value: { cumulative_response: 6, A_labeled_scalar: 3 } },
  { id: 'FROZEN', value: { cumulative_response: 5, A_labeled_scalar: 2 } },
]);

assert.equal(exact.factorization.sum_for_decision_on_U.factors, true);
assert.equal(exact.factorization.sum_for_route_on_R.factors, false);
assert.equal(exact.factorization.A_event_for_route_on_R.factors, true);
assert.equal(exact.factorization.A_event_for_decision_on_U.factors, false);
assert.equal(exact.factorization.B_event_for_route_on_R.factors, true);
assert.equal(exact.factorization.B_event_for_decision_on_U.factors, false);
assert.equal(exact.factorization.joint_for_decision_on_U.factors, true);
assert.equal(exact.factorization.joint_for_history_on_U.factors, true);
assert.equal(exact.factorization.certificate_only_for_route_on_R.factors, false);

const robust = robustLabelCustodyViews(robustnessParent);
assert.equal(robust.status, 'ROBUST_PARTIAL_CUSTODY_VIEWS_COMPUTED');
assert.equal(robust.A_labeled.separated, true);
assert.equal(robust.A_labeled.classification, 'A_ACTION_LABELED_EVENT_RETAINS_ROUTE_SEPARATION');
assert.equal(robust.B_labeled.separated, true);
assert.equal(robust.B_labeled.classification, 'B_ACTION_LABELED_EVENT_RETAINS_ROUTE_SEPARATION');
assert.equal(robust.unlabeled_one_event.uniformly_route_sufficient, false);
assert.equal(
  robust.unlabeled_one_event.classification,
  'ACTION_LABEL_ERASURE_DESTROYS_UNIFORM_SINGLE_EVENT_ROUTE_SUFFICIENCY_IN_AUTHORED_FAMILY',
);

const labelErasureWitness = robust.unlabeled_one_event.cross_route_overlaps.find((entry) => (
  entry.AB_source_action === 'B'
  && entry.BA_source_action === 'A'
));
assert.ok(labelErasureWitness);
assert.equal(Math.abs(labelErasureWitness.overlap.lo - 3.85) <= 1e-12, true);
assert.equal(Math.abs(labelErasureWitness.overlap.hi - 4.15) <= 1e-12, true);

assert.equal(robust.endpoint_only.shared_endpoint_identity_certified, true);
assert.equal(robust.endpoint_only.route_identified, false);
assert.equal(robust.endpoint_only.classification, 'COMMON_ENDPOINT_CUSTODY_DOES_NOT_IDENTIFY_ROUTE_HISTORY');
assert.equal(robust.family_certificate_only.historical_route_identified, false);
assert.equal(
  robust.family_certificate_only.classification,
  'FAMILY_SEPARATION_CERTIFICATE_DOES_NOT_IDENTIFY_HISTORICAL_ROUTE',
);

assert.equal(JSON.stringify(collisionParent.universe), collisionBefore);
assert.equal(JSON.stringify({
  robust_family: robustnessParent.robust_family,
  shared_endpoint_family: robustnessParent.shared_endpoint_family,
}), robustnessBefore);

assert.equal(exactClaimConditionedViews({ passed: false }).status, 'PARENT_COMPRESSION_COLLISION_NOT_WITNESSED_BY_EXECUTABLE');
assert.equal(robustLabelCustodyViews({ passed: false }).status, 'PARENT_ROUTE_ROBUSTNESS_NOT_WITNESSED_BY_EXECUTABLE');

const result = runPartialEventCustodyProjectionGauntlet();
assert.equal(result.passed, true);
for (const [key, value] of Object.entries(result.criteria)) {
  assert.equal(value, true, `${key} must hold`);
}
assert.equal(result.classification, 'CLAIM_CONDITIONED_PARTIAL_EVENT_CUSTODY_WITH_ACTION_LABEL_PROVENANCE_EFFECT');
assert.equal(
  result.canonical_bounded_scientific_claim,
  'IN_THE_AUTHORED_FINITE_AND_ROBUST_ROUTE_FIXTURES_PARTIAL_EVENT_CUSTODY_IS_CLAIM_CONDITIONED_THE_CUMULATIVE_SCALAR_CAN_RETAIN_A_DECLARED_DECISION_WHILE_ERASING_THE_SAME_ENDPOINT_ROUTE_PAIR_AN_ACTION_LABELED_SINGLE_EVENT_CAN_RETAIN_THAT_ROUTE_PAIR_WHILE_FAILING_THE_DECISION_OVER_A_LARGER_FINITE_UNIVERSE_A_SMALL_JOINT_VIEW_CAN_SUPPORT_BOTH_DECLARED_CLAIMS_AND_ERASING_THE_ACTION_LABEL_FROM_ONE_ROBUST_EVENT_DESTROYS_UNIFORM_ROUTE_SUFFICIENCY_WITHOUT_DELETING_THE_UNDERLYING_CUSTODY',
);
assert.equal(
  result.next_learning_action,
  'HUMAN_𝄐_REQUIRED_BEFORE_SELECTING_ANY_COMPOSITIONAL_PATH_OBJECT_OR_TRANSPORT_GRAMMAR',
);

for (const key of [
  'generic_sufficient_statistic_theorem_earned',
  'generic_information_loss_theorem_earned',
  'shannon_information_quantity_earned',
  'minimal_representation_theorem_earned',
  'optimal_custody_schema_earned',
  'causal_history_reconstruction_theorem_earned',
  'general_robust_path_dependence_theorem_earned',
  'path_object_earned',
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
  classification: result.classification,
  sum_decision: result.exact_claim_conditioned_views.factorization.sum_for_decision_on_U.factors,
  sum_route: result.exact_claim_conditioned_views.factorization.sum_for_route_on_R.factors,
  A_route: result.exact_claim_conditioned_views.factorization.A_event_for_route_on_R.factors,
  A_decision: result.exact_claim_conditioned_views.factorization.A_event_for_decision_on_U.factors,
  unlabeled_uniform_route_sufficiency: result.robust_label_custody_views.unlabeled_one_event.uniformly_route_sufficient,
  next: result.next_learning_action,
}));
