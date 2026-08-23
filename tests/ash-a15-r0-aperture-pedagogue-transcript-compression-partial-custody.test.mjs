import assert from 'node:assert/strict';
import {
  projectTranscriptBox,
  evaluateScalarCompression,
  evaluateLabeledCoordinateCustody,
  evaluateUnlabeledSingleEventCustody,
  evaluateEndpointOnlyCustody,
  evaluateSeparationCertificateCustody,
  runTranscriptCompressionPartialCustodyGauntlet,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-transcript-compression-partial-custody.js';
import { runRouteTranscriptRobustnessGauntlet } from '../app/dome-world/previews/a15-r0/aperture-pedagogue-route-transcript-robustness.js';

const approx = (a, b, eps = 1e-12) => Math.abs(a - b) <= eps;
const assertInterval = (actual, lo, hi) => {
  assert.equal(approx(actual.lo, lo), true, `interval lo ${actual.lo} != ${lo}`);
  assert.equal(approx(actual.hi, hi), true, `interval hi ${actual.hi} != ${hi}`);
};

const parent = runRouteTranscriptRobustnessGauntlet();
assert.equal(parent.passed, true, 'Compression chamber may only inherit a passing #708 robustness object.');
const boxes = parent.robust_family.observed_boxes;

const sum = evaluateScalarCompression(boxes, { A: 1, B: 1 });
assertInterval(sum.image_intervals.AB, 5.8, 6.2);
assertInterval(sum.image_intervals.BA, 6.7, 7.3);
assert.equal(sum.images_overlap, false);
assert.equal(sum.route_separation_retained, true);
assert.equal(sum.classification, 'SCALAR_COMPRESSION_RETAINS_ROUTE_SEPARATION_FOR_DECLARED_FIXTURE');

const collision = evaluateScalarCompression(boxes, { A: 1, B: 2 });
assertInterval(collision.image_intervals.AB, 9.65, 10.35);
assertInterval(collision.image_intervals.BA, 9.65, 10.35);
assert.equal(collision.images_overlap, true);
assert.equal(collision.route_separation_retained, false);
assert.equal(collision.classification, 'SCALAR_COMPRESSION_ERASES_ROUTE_SEPARATION_FOR_DECLARED_FIXTURE');
assert.notDeepEqual(sum.weights, collision.weights, 'Same scalar output dimension may not erase compression-map provenance.');

const negativeWeight = projectTranscriptBox(boxes.AB, { A: -1, B: 0 });
assertInterval(negativeWeight, -2.05, -1.95);
assert.throws(() => projectTranscriptBox(boxes.AB, { A: Number.NaN, B: 1 }), /FINITE_COMPRESSION_WEIGHTS_REQUIRED/);

const aOnly = evaluateLabeledCoordinateCustody(boxes, 'A');
assertInterval(aOnly.retained_intervals.AB, 1.95, 2.05);
assertInterval(aOnly.retained_intervals.BA, 3.75, 4.25);
assert.equal(aOnly.intervals_overlap, false);
assert.equal(aOnly.route_separation_retained, true);
assert.equal(aOnly.classification, 'SINGLE_ACTION_LABELED_COORDINATE_RETAINS_ROUTE_SEPARATION_FOR_DECLARED_FIXTURE');

const bOnly = evaluateLabeledCoordinateCustody(boxes, 'B');
assertInterval(bOnly.retained_intervals.AB, 3.85, 4.15);
assertInterval(bOnly.retained_intervals.BA, 2.95, 3.05);
assert.equal(bOnly.intervals_overlap, false);
assert.equal(bOnly.route_separation_retained, true);
assert.equal(bOnly.classification, 'SINGLE_ACTION_LABELED_COORDINATE_RETAINS_ROUTE_SEPARATION_FOR_DECLARED_FIXTURE');

const unlabeledAction = evaluateLabeledCoordinateCustody(boxes);
assert.equal(unlabeledAction.status, 'ACTION_LABEL_UNDECLARED');
assert.equal(unlabeledAction.disposition, 'ABSTAIN_FROM_ACTION_LABELED_PARTIAL_CUSTODY_CLAIM');

const unlabeledOneEvent = evaluateUnlabeledSingleEventCustody(boxes);
assert.equal(unlabeledOneEvent.retained_action_label, false);
assert.equal(unlabeledOneEvent.uniformly_route_sufficient, false);
assert.equal(unlabeledOneEvent.classification, 'UNLABELED_SINGLE_EVENT_CUSTODY_NOT_UNIFORMLY_ROUTE_SUFFICIENT');
const overlapWitness = unlabeledOneEvent.cross_route_overlap_witnesses.find((entry) => entry.AB_action === 'B' && entry.BA_action === 'A');
assert.ok(overlapWitness, 'Action-label erasure must retain the explicit cross-route overlap witness.');
assertInterval(overlapWitness.intersection, 3.85, 4.15);

const endpointOnly = evaluateEndpointOnlyCustody(parent);
assert.equal(endpointOnly.shared_endpoint_identity, true);
assert.equal(endpointOnly.historical_route_identified, false);
assert.equal(endpointOnly.classification, 'COMMON_ENDPOINT_CUSTODY_DOES_NOT_IDENTIFY_ROUTE_HISTORY');

const certificateOnly = evaluateSeparationCertificateCustody(parent);
assert.equal(certificateOnly.family_separation_certified, true);
assert.equal(certificateOnly.historical_route_identified_from_certificate_alone, false);
assert.equal(certificateOnly.classification, 'FAMILY_SEPARATION_CERTIFICATE_DOES_NOT_IDENTIFY_HISTORICAL_ROUTE');

const result = runTranscriptCompressionPartialCustodyGauntlet();
assert.equal(result.passed, true);
for (const [key, value] of Object.entries(result.criteria)) {
  assert.equal(value, true, `${key} must hold`);
}
assert.equal(
  result.canonical_bounded_scientific_claim,
  'IN_THE_AUTHORED_ROBUST_2X2_ROUTE_FIXTURE_ROUTE_CUSTODY_IS_REPRESENTATION_DEPENDENT_A_ONE_SCALAR_SUM_COMPRESSION_AND_EITHER_SINGLE_ACTION_LABELED_COORDINATE_RETAIN_SET_WISE_ROUTE_SEPARATION_WHILE_A_DIFFERENT_ONE_SCALAR_LINEAR_COMPRESSION_COLLAPSES_BOTH_ROUTE_BOXES_TO_THE_SAME_INTERVAL_UNLABELED_SINGLE_EVENT_CUSTODY_IS_NOT_UNIFORMLY_ROUTE_SUFFICIENT_AND_COMMON_ENDPOINT_OR_FAMILY_SEPARATION_CERTIFICATE_CUSTODY_ALONE_DOES_NOT_IDENTIFY_THE_HISTORICAL_ROUTE',
);
assert.equal(result.next_learning_action, 'STOP_FOR_HUMAN_𝄐_BEFORE_SELECTING_COMPOSITIONAL_PATH_OBJECT_OR_TRANSPORT_GRAMMAR');

for (const key of [
  'general_sufficient_statistic_theorem_earned',
  'general_information_loss_theorem_earned',
  'shannon_channel_capacity_claim_earned',
  'probabilistic_route_classification_earned',
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
  sum: result.sum_compression.classification,
  collision: result.collision_compression.classification,
  unlabeled: result.unlabeled_single_event_custody.classification,
  endpoint: result.endpoint_only_custody.classification,
  certificate: result.separation_certificate_only_custody.classification,
  claim: result.canonical_bounded_scientific_claim,
  next: result.next_learning_action,
}));
