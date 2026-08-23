import { runRouteTranscriptRobustnessGauntlet } from './aperture-pedagogue-route-transcript-robustness.js';

export const TRANSCRIPT_COMPRESSION_PARTIAL_CUSTODY_SCHEMA = 'td613.a15-r0.aperture-pedagogue-transcript-compression-partial-custody/v0.1';

const EPS = 1e-12;
const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const interval = (lo, hi) => freeze({ lo, hi });
const overlaps = (a, b) => !(a.hi < b.lo || b.hi < a.lo);
const intersection = (a, b) => overlaps(a, b) ? interval(Math.max(a.lo, b.lo), Math.min(a.hi, b.hi)) : null;
const approx = (a, b) => Math.abs(a - b) <= EPS;
const intervalApprox = (iv, lo, hi) => approx(iv.lo, lo) && approx(iv.hi, hi);

const assertInterval = (iv, label) => {
  if (!iv || !Number.isFinite(iv.lo) || !Number.isFinite(iv.hi) || iv.lo > iv.hi) {
    throw new Error(`VALID_${label.toUpperCase()}_INTERVAL_REQUIRED`);
  }
};

const scaleInterval = (iv, weight) => {
  if (!Number.isFinite(weight)) throw new Error('FINITE_COMPRESSION_WEIGHTS_REQUIRED');
  const lo = iv.lo * weight;
  const hi = iv.hi * weight;
  return weight >= 0 ? interval(lo, hi) : interval(hi, lo);
};

const addIntervals = (a, b) => interval(a.lo + b.lo, a.hi + b.hi);

export function projectTranscriptBox(box, weights) {
  if (!box || !weights) throw new Error('TRANSCRIPT_BOX_AND_WEIGHTS_REQUIRED');
  assertInterval(box.A, 'A');
  assertInterval(box.B, 'B');
  if (!Number.isFinite(weights.A) || !Number.isFinite(weights.B)) throw new Error('FINITE_COMPRESSION_WEIGHTS_REQUIRED');
  return addIntervals(scaleInterval(box.A, weights.A), scaleInterval(box.B, weights.B));
}

export function evaluateScalarCompression(observedBoxes, weights) {
  if (!observedBoxes?.AB || !observedBoxes?.BA) throw new Error('ROUTE_OBSERVED_BOXES_REQUIRED');
  const AB = projectTranscriptBox(observedBoxes.AB, weights);
  const BA = projectTranscriptBox(observedBoxes.BA, weights);
  const overlap = overlaps(AB, BA);
  return freeze({
    weights: freeze({ A: weights.A, B: weights.B }),
    image_intervals: freeze({ AB, BA }),
    images_overlap: overlap,
    route_separation_retained: !overlap,
    classification: overlap
      ? 'SCALAR_COMPRESSION_ERASES_ROUTE_SEPARATION_FOR_DECLARED_FIXTURE'
      : 'SCALAR_COMPRESSION_RETAINS_ROUTE_SEPARATION_FOR_DECLARED_FIXTURE',
  });
}

export function evaluateLabeledCoordinateCustody(observedBoxes, action) {
  if (!observedBoxes?.AB || !observedBoxes?.BA) throw new Error('ROUTE_OBSERVED_BOXES_REQUIRED');
  if (action !== 'A' && action !== 'B') {
    return freeze({
      status: 'ACTION_LABEL_UNDECLARED',
      disposition: 'ABSTAIN_FROM_ACTION_LABELED_PARTIAL_CUSTODY_CLAIM',
    });
  }
  const AB = observedBoxes.AB[action];
  const BA = observedBoxes.BA[action];
  assertInterval(AB, `${action}_AB`);
  assertInterval(BA, `${action}_BA`);
  const overlap = overlaps(AB, BA);
  return freeze({
    action,
    retained_intervals: freeze({ AB: interval(AB.lo, AB.hi), BA: interval(BA.lo, BA.hi) }),
    intervals_overlap: overlap,
    route_separation_retained: !overlap,
    classification: overlap
      ? 'SINGLE_ACTION_LABELED_COORDINATE_ROUTE_SEPARATION_UNRESOLVED_FOR_DECLARED_FIXTURE'
      : 'SINGLE_ACTION_LABELED_COORDINATE_RETAINS_ROUTE_SEPARATION_FOR_DECLARED_FIXTURE',
  });
}

export function evaluateUnlabeledSingleEventCustody(observedBoxes) {
  if (!observedBoxes?.AB || !observedBoxes?.BA) throw new Error('ROUTE_OBSERVED_BOXES_REQUIRED');
  const AB = ['A', 'B'].map((action) => freeze({ action, interval: interval(observedBoxes.AB[action].lo, observedBoxes.AB[action].hi) }));
  const BA = ['A', 'B'].map((action) => freeze({ action, interval: interval(observedBoxes.BA[action].lo, observedBoxes.BA[action].hi) }));

  const overlapWitnesses = [];
  for (const left of AB) {
    for (const right of BA) {
      const iv = intersection(left.interval, right.interval);
      if (iv) overlapWitnesses.push(freeze({ AB_action: left.action, BA_action: right.action, intersection: iv }));
    }
  }

  const uniformlyRouteSufficient = overlapWitnesses.length === 0;
  return freeze({
    retained_action_label: false,
    possible_intervals: freeze({ AB, BA }),
    cross_route_overlap_witnesses: freeze(overlapWitnesses),
    uniformly_route_sufficient: uniformlyRouteSufficient,
    classification: uniformlyRouteSufficient
      ? 'UNLABELED_SINGLE_EVENT_CUSTODY_UNIFORMLY_ROUTE_SUFFICIENT_FOR_DECLARED_FIXTURE'
      : 'UNLABELED_SINGLE_EVENT_CUSTODY_NOT_UNIFORMLY_ROUTE_SUFFICIENT',
  });
}

export function evaluateEndpointOnlyCustody(parentResult) {
  const identity = parentResult?.shared_endpoint_family?.pointwise_endpoint_identity_certified_over_declared_family === true;
  return freeze({
    shared_endpoint_identity: identity,
    historical_route_identified: false,
    classification: identity
      ? 'COMMON_ENDPOINT_CUSTODY_DOES_NOT_IDENTIFY_ROUTE_HISTORY'
      : 'ENDPOINT_EQUIVALENCE_NOT_ESTABLISHED_ABSTAIN_FROM_ENDPOINT_ONLY_ROUTE_CUSTODY_CLAIM',
  });
}

export function evaluateSeparationCertificateCustody(parentResult) {
  const certificate = parentResult?.robust_family?.classification ?? null;
  const certified = certificate === 'ROBUST_ROUTE_TRANSCRIPT_SEPARATION_OVER_DECLARED_TRANSITION_AND_ERROR_FAMILY';
  return freeze({
    family_separation_certificate: certificate,
    family_separation_certified: certified,
    historical_route_identified_from_certificate_alone: false,
    classification: certified
      ? 'FAMILY_SEPARATION_CERTIFICATE_DOES_NOT_IDENTIFY_HISTORICAL_ROUTE'
      : 'FAMILY_SEPARATION_NOT_CERTIFIED',
  });
}

export function runTranscriptCompressionPartialCustodyGauntlet() {
  const parent = runRouteTranscriptRobustnessGauntlet();
  if (parent.passed !== true) {
    return freeze({
      schema: TRANSCRIPT_COMPRESSION_PARTIAL_CUSTODY_SCHEMA,
      status: 'PARENT_ROUTE_TRANSCRIPT_ROBUSTNESS_NOT_ESTABLISHED',
      disposition: 'ABSTAIN_BEFORE_COMPRESSION_OR_PARTIAL_CUSTODY_CLAIMS',
      passed: false,
      path_object_earned: false,
      path_category_earned: false,
      path_groupoid_earned: false,
      transport_functor_earned: false,
      connection_earned: false,
      holonomy_earned: false,
      curvature_earned: false,
      berry_structure_earned: false,
      quantum_behavior_earned: false,
      proto_loom_earned: false,
      a16_reopened: false,
      live_ash_mutation: false,
      merge_authority: false,
      production_authority: false,
      vercel_authority: false,
    });
  }

  const observedBoxes = parent.robust_family.observed_boxes;
  const sumCompression = evaluateScalarCompression(observedBoxes, { A: 1, B: 1 });
  const collisionCompression = evaluateScalarCompression(observedBoxes, { A: 1, B: 2 });
  const aOnly = evaluateLabeledCoordinateCustody(observedBoxes, 'A');
  const bOnly = evaluateLabeledCoordinateCustody(observedBoxes, 'B');
  const unlabeledOneEvent = evaluateUnlabeledSingleEventCustody(observedBoxes);
  const endpointOnly = evaluateEndpointOnlyCustody(parent);
  const separationCertificateOnly = evaluateSeparationCertificateCustody(parent);

  const criteria = freeze({
    C1_parent_robust_result_passes: parent.passed === true,
    C2_sum_images_exact: intervalApprox(sumCompression.image_intervals.AB, 5.8, 6.2) && intervalApprox(sumCompression.image_intervals.BA, 6.7, 7.3),
    C3_sum_images_disjoint: sumCompression.route_separation_retained === true && sumCompression.images_overlap === false,
    C4_collision_images_exact_and_equal: intervalApprox(collisionCompression.image_intervals.AB, 9.65, 10.35) && intervalApprox(collisionCompression.image_intervals.BA, 9.65, 10.35),
    C5_collision_erases_route_separation: collisionCompression.images_overlap === true && collisionCompression.route_separation_retained === false,
    C6_A_labeled_custody_disjoint: aOnly.route_separation_retained === true && aOnly.intervals_overlap === false,
    C7_B_labeled_custody_disjoint: bOnly.route_separation_retained === true && bOnly.intervals_overlap === false,
    C8_unlabeled_one_event_has_cross_route_overlap: unlabeledOneEvent.uniformly_route_sufficient === false && unlabeledOneEvent.cross_route_overlap_witnesses.some((entry) => entry.AB_action === 'B' && entry.BA_action === 'A' && intervalApprox(entry.intersection, 3.85, 4.15)),
    C9_endpoint_only_refuses_route_identity: endpointOnly.classification === 'COMMON_ENDPOINT_CUSTODY_DOES_NOT_IDENTIFY_ROUTE_HISTORY' && endpointOnly.historical_route_identified === false,
    C10_family_certificate_refuses_historical_route_identity: separationCertificateOnly.classification === 'FAMILY_SEPARATION_CERTIFICATE_DOES_NOT_IDENTIFY_HISTORICAL_ROUTE' && separationCertificateOnly.historical_route_identified_from_certificate_alone === false,
  });

  const passed = Object.values(criteria).every(Boolean);
  return freeze({
    schema: TRANSCRIPT_COMPRESSION_PARTIAL_CUSTODY_SCHEMA,
    representation_epsilon: EPS,
    parent_schema: parent.schema,
    parent_claim: parent.canonical_bounded_scientific_claim,
    sum_compression: sumCompression,
    collision_compression: collisionCompression,
    labeled_coordinate_custody: freeze({ A: aOnly, B: bOnly }),
    unlabeled_single_event_custody: unlabeledOneEvent,
    endpoint_only_custody: endpointOnly,
    separation_certificate_only_custody: separationCertificateOnly,
    criteria,
    passed,
    canonical_bounded_scientific_claim: passed
      ? 'IN_THE_AUTHORED_ROBUST_2X2_ROUTE_FIXTURE_ROUTE_CUSTODY_IS_REPRESENTATION_DEPENDENT_A_ONE_SCALAR_SUM_COMPRESSION_AND_EITHER_SINGLE_ACTION_LABELED_COORDINATE_RETAIN_SET_WISE_ROUTE_SEPARATION_WHILE_A_DIFFERENT_ONE_SCALAR_LINEAR_COMPRESSION_COLLAPSES_BOTH_ROUTE_BOXES_TO_THE_SAME_INTERVAL_UNLABELED_SINGLE_EVENT_CUSTODY_IS_NOT_UNIFORMLY_ROUTE_SUFFICIENT_AND_COMMON_ENDPOINT_OR_FAMILY_SEPARATION_CERTIFICATE_CUSTODY_ALONE_DOES_NOT_IDENTIFY_THE_HISTORICAL_ROUTE'
      : null,
    anti_equivalences: freeze([
      'SMALLER_REPRESENTATION_NE_WEAKER_REPRESENTATION_FOR_EVERY_CLAIM',
      'SAME_OUTPUT_DIMENSION_NE_SAME_CLAIM_SUFFICIENCY',
      'FAMILY_LEVEL_SEPARATION_CERTIFICATE_NE_EVENT_LEVEL_ROUTE_CUSTODY',
      'ENDPOINT_CUSTODY_NE_ROUTE_HISTORY_CUSTODY',
      'UNLABELED_RETAINED_EVENT_NE_ACTION_LABELED_RETAINED_EVENT',
      'OVERLAPPING_COMPRESSED_IMAGES_NE_ROUTE_EFFECT_DISPROVED',
    ]),
    next_learning_action: passed ? 'STOP_FOR_HUMAN_𝄐_BEFORE_SELECTING_COMPOSITIONAL_PATH_OBJECT_OR_TRANSPORT_GRAMMAR' : null,
    general_sufficient_statistic_theorem_earned: false,
    general_information_loss_theorem_earned: false,
    shannon_channel_capacity_claim_earned: false,
    probabilistic_route_classification_earned: false,
    general_robust_path_dependence_theorem_earned: false,
    path_object_earned: false,
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
    td613_general_theorem_earned: false,
    a16_reopened: false,
    live_ash_mutation: false,
    merge_authority: false,
    production_authority: false,
    vercel_authority: false,
  });
}
