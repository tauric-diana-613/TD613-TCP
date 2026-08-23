import assert from 'node:assert/strict';
import {
  claimFactorsThrough,
  runTranscriptCompressionCollisionGauntlet,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-transcript-compression-collision.js';

const result = runTranscriptCompressionCollisionGauntlet();
assert.equal(result.passed, true);
for (const [key, value] of Object.entries(result.criteria)) assert.equal(value, true, `${key} must hold`);

assert.deepEqual(result.route_pair.AB.final_operator, [[3, 1], [1, 4]]);
assert.deepEqual(result.route_pair.BA.final_operator, [[3, 1], [1, 4]]);
assert.deepEqual(result.route_pair.AB.action_indexed_responses, { A: 2, B: 4 });
assert.deepEqual(result.route_pair.BA.action_indexed_responses, { A: 3, B: 3 });
assert.equal(result.route_pair.AB.cumulative_response, 6);
assert.equal(result.route_pair.BA.cumulative_response, 6);

assert.deepEqual(result.representations.full, [
  { id: 'AB', value: [2, 4] },
  { id: 'BA', value: [3, 3] },
  { id: 'FROZEN', value: [2, 3] },
]);
assert.deepEqual(result.representations.sum, [
  { id: 'AB', value: 6 },
  { id: 'BA', value: 6 },
  { id: 'FROZEN', value: 5 },
]);
assert.deepEqual(result.representations.weighted, [
  { id: 'AB', value: 10 },
  { id: 'BA', value: 9 },
  { id: 'FROZEN', value: 8 },
]);
assert.deepEqual(result.downstream_decision.values, [
  { id: 'AB', value: true },
  { id: 'BA', value: true },
  { id: 'FROZEN', value: false },
]);

assert.equal(result.factorization.decision_through_sum.factors, true);
assert.equal(result.factorization.route_through_sum.factors, false);
assert.equal(result.factorization.route_through_weighted.factors, true);
assert.equal(result.factorization.route_through_full.factors, true);

const routeCollisionFiber = result.factorization.route_through_sum.fibers.find((fiber) => fiber.key === '6');
assert.ok(routeCollisionFiber);
assert.deepEqual(routeCollisionFiber.members.map((member) => member.route_label).sort(), ['AB', 'BA']);

const generic = [
  { compressed: 0, decision: 'x', route: 'r1' },
  { compressed: 0, decision: 'x', route: 'r2' },
  { compressed: 1, decision: 'y', route: 'r3' },
];
assert.equal(claimFactorsThrough(generic, (r) => r.compressed, (r) => r.decision).factors, true);
assert.equal(claimFactorsThrough(generic, (r) => r.compressed, (r) => r.route).factors, false);

assert.equal(result.classification, 'DECISION_SUFFICIENT_COMPRESSION_WITH_ROUTE_CUSTODY_COLLISION');
assert.equal(
  result.canonical_bounded_scientific_claim,
  'A_DECLARED_SCALAR_COMPRESSION_CAN_BE_SUFFICIENT_FOR_ONE_FINITE_DOWNSTREAM_DECISION_WHILE_INSUFFICIENT_FOR_ROUTE_CUSTODY_EVEN_WHEN_THE_FULL_ACTION_INDEXED_TRANSCRIPT_RETAINS_THE_ROUTE_DISTINCTION_AND_AN_ALTERNATE_ONE_DIMENSIONAL_PROJECTION_CAN_RETAIN_IT_IN_THE_AUTHORED_FIXTURE',
);
assert.equal(result.next_learning_action, 'TEST_PARTIAL_EVENT_CUSTODY_AS_A_CLAIM_CONDITIONED_PROJECTION');

for (const key of [
  'generic_sufficient_statistic_theorem_earned',
  'generic_information_loss_theorem_earned',
  'shannon_information_quantity_earned',
  'minimal_representation_theorem_earned',
  'optimal_compression_theorem_earned',
  'causal_history_reconstruction_earned',
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
]) assert.equal(result[key], false, `${key} must remain false`);

console.log(JSON.stringify({
  schema: result.schema,
  classification: result.classification,
  sum_projection: result.representations.sum,
  weighted_projection: result.representations.weighted,
  decision_through_sum: result.factorization.decision_through_sum.factors,
  route_through_sum: result.factorization.route_through_sum.factors,
  claim: result.canonical_bounded_scientific_claim,
  next: result.next_learning_action,
}));
