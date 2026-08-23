import assert from 'node:assert/strict';
import { runPartialEventCustodyGauntlet } from '../app/dome-world/previews/a15-r0/aperture-pedagogue-partial-event-custody.js';

const result = runPartialEventCustodyGauntlet();
assert.equal(result.passed, true);
assert.equal(result.classification, 'CROSSED_CLAIM_CONDITIONED_PARTIAL_EVENT_CUSTODY');
assert.deepEqual(result.claim_domains, {
  decision: 'U_AB_BA_FROZEN',
  route: 'R_AB_BA_ONLY',
});

for (const [key, value] of Object.entries(result.criteria)) {
  assert.equal(value, true, `${key} must hold`);
}

const endpoint = result.projections.endpoint_only;
assert.equal(endpoint.D6_on_U.claim_domain, 'U_AB_BA_FROZEN');
assert.equal(endpoint.route_on_R.claim_domain, 'R_AB_BA_ONLY');
assert.equal(endpoint.D6_on_U.factors, true);
assert.equal(endpoint.route_on_R.factors, false);
assert.equal(endpoint.classification.decision, 'ENDPOINT_ONLY_CUSTODY_IS_D6_SUFFICIENT_ON_DECLARED_UNIVERSE');
assert.equal(endpoint.classification.route, 'ENDPOINT_ONLY_CUSTODY_IS_ROUTE_INSUFFICIENT_ON_AB_BA_DOMAIN');
assert.equal(endpoint.D6_on_U.fibers.length, 2, 'Endpoint-only custody must produce the shared AB/BA endpoint fiber plus the FROZEN endpoint fiber.');
const sharedEndpointFiber = endpoint.route_on_R.fibers.find((fiber) => fiber.members.length === 2);
assert.ok(sharedEndpointFiber, 'AB and BA must remain in one route-erasing endpoint fiber.');
assert.deepEqual(sharedEndpointFiber.members.map((member) => member.id).sort(), ['AB', 'BA']);

const aOnly = result.projections.A_labeled_response_only;
assert.equal(aOnly.route_on_R.factors, true);
assert.equal(aOnly.D6_on_U.factors, false);
assert.equal(aOnly.classification.route, 'A_LABELED_RESPONSE_CUSTODY_IS_ROUTE_SUFFICIENT_ON_AB_BA_DOMAIN');
assert.equal(aOnly.classification.decision, 'A_LABELED_RESPONSE_CUSTODY_IS_D6_INSUFFICIENT_ON_DECLARED_UNIVERSE');
const aCollision = aOnly.D6_on_U.fibers.find((fiber) => fiber.members.some((m) => m.id === 'AB') && fiber.members.some((m) => m.id === 'FROZEN'));
assert.ok(aCollision, 'A-only custody must visibly retain the AB/FROZEN decision collision.');

const bOnly = result.projections.B_labeled_response_only;
assert.equal(bOnly.route_on_R.factors, true);
assert.equal(bOnly.D6_on_U.factors, false);
assert.equal(bOnly.classification.route, 'B_LABELED_RESPONSE_CUSTODY_IS_ROUTE_SUFFICIENT_ON_AB_BA_DOMAIN');
assert.equal(bOnly.classification.decision, 'B_LABELED_RESPONSE_CUSTODY_IS_D6_INSUFFICIENT_ON_DECLARED_UNIVERSE');
const bCollision = bOnly.D6_on_U.fibers.find((fiber) => fiber.members.some((m) => m.id === 'BA') && fiber.members.some((m) => m.id === 'FROZEN'));
assert.ok(bCollision, 'B-only custody must visibly retain the BA/FROZEN decision collision.');

const full = result.projections.full_action_indexed_responses;
assert.equal(full.D6_on_U.factors, true);
assert.equal(full.route_on_R.factors, true);

const actionSet = result.projections.action_set_only;
assert.equal(actionSet.D6_on_U.factors, false);
assert.equal(actionSet.route_on_R.factors, false);
assert.equal(actionSet.D6_on_U.fibers.length, 1, 'Action-set-only custody must collapse all declared records into one fiber.');
assert.equal(actionSet.route_on_R.fibers.length, 1, 'Action-set-only custody must collapse AB and BA into one route fiber.');

assert.equal(
  result.canonical_bounded_scientific_claim,
  'IN_THE_AUTHORED_FINITE_ROUTE_FIXTURE_PARTIAL_EVENT_CUSTODY_IS_CLAIM_CONDITIONED_IN_BOTH_DIRECTIONS_ENDPOINT_ONLY_CUSTODY_PRESERVES_THE_DECLARED_D6_DECISION_WHILE_ERASING_AB_VS_BA_ROUTE_HISTORY_WHEREAS_EITHER_SINGLE_ACTION_LABELED_RESPONSE_DISTINGUISHES_AB_FROM_BA_BUT_FAILS_TO_PRESERVE_D6_OVER_THE_FULL_DECLARED_UNIVERSE',
);
assert.equal(result.next_learning_action, 'STOP_FOR_HUMAN_𝄐_BEFORE_SELECTING_COMPOSITIONAL_PATH_OBJECT_OR_TRANSPORT_GRAMMAR');

for (const key of [
  'generic_sufficient_statistic_theorem_earned',
  'generic_information_loss_theorem_earned',
  'shannon_information_channel_capacity_claim_earned',
  'causal_history_reconstruction_theorem_earned',
  'general_path_dependence_theorem_earned',
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
  endpoint_decision: endpoint.classification.decision,
  endpoint_route: endpoint.classification.route,
  A_route: aOnly.classification.route,
  A_decision: aOnly.classification.decision,
  B_route: bOnly.classification.route,
  B_decision: bOnly.classification.decision,
  claim: result.canonical_bounded_scientific_claim,
  next: result.next_learning_action,
}));
