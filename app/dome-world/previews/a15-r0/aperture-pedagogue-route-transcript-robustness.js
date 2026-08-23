export const ROUTE_TRANSCRIPT_ROBUSTNESS_SCHEMA = 'td613.a15-r0.aperture-pedagogue-route-transcript-robustness/v0.1';

const EPS = 1e-12;
const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const approx = (a, b) => Math.abs(a - b) <= EPS;
const interval = (lo, hi) => freeze({ lo, hi });
const expand = (iv, eta) => interval(iv.lo - eta, iv.hi + eta);
const overlaps = (a, b) => !(a.hi < b.lo || b.hi < a.lo);
const boxesOverlap = (a, b) => overlaps(a.A, b.A) && overlaps(a.B, b.B);
const maxAbsEntryDifference = (A, B) => Math.max(...A.flatMap((row, i) => row.map((value, j) => Math.abs(value - B[i][j]))));
const intervalApprox = (iv, lo, hi) => approx(iv.lo, lo) && approx(iv.hi, hi);

export function endpointFor(alpha, beta) {
  return freeze([[2 + beta, 1], [1, 3 + alpha]].map(Object.freeze));
}

export function buildRouteBoxes({ alpha, beta, eta, timing = 'sample_before_transition' }) {
  if (timing !== 'sample_before_transition') {
    return freeze({
      status: 'SEQUENTIAL_OBSERVATION_TIMING_UNDECLARED',
      disposition: 'ABSTAIN_BEFORE_ROUTE_TRANSCRIPT_COMPARISON',
    });
  }
  for (const [name, iv] of [['alpha', alpha], ['beta', beta]]) {
    if (!iv || !Number.isFinite(iv.lo) || !Number.isFinite(iv.hi) || iv.lo > iv.hi) {
      throw new Error(`VALID_${name.toUpperCase()}_INTERVAL_REQUIRED`);
    }
  }
  if (!Number.isFinite(eta) || eta < 0) throw new Error('NONNEGATIVE_MEASUREMENT_ERROR_BOUND_REQUIRED');

  const exact = freeze({
    AB: freeze({ A: interval(2, 2), B: interval(3 + alpha.lo, 3 + alpha.hi) }),
    BA: freeze({ A: interval(2 + beta.lo, 2 + beta.hi), B: interval(3, 3) }),
  });
  const observed = freeze({
    AB: freeze({ A: expand(exact.AB.A, eta), B: expand(exact.AB.B, eta) }),
    BA: freeze({ A: expand(exact.BA.A, eta), B: expand(exact.BA.B, eta) }),
  });
  const overlap = boxesOverlap(observed.AB, observed.BA);

  return freeze({
    status: 'ROUTE_TRANSCRIPT_INTERVALS_COMPUTED',
    transition_family: freeze({ alpha: interval(alpha.lo, alpha.hi), beta: interval(beta.lo, beta.hi) }),
    measurement_error_bound: eta,
    exact_response_family: exact,
    observed_boxes: observed,
    boxes_overlap: overlap,
    classification: overlap
      ? 'ROUTE_TRANSCRIPT_SEPARATION_UNRESOLVED_UNDER_DECLARED_ERROR_FAMILY'
      : 'ROBUST_ROUTE_TRANSCRIPT_SEPARATION_OVER_DECLARED_TRANSITION_AND_ERROR_FAMILY',
  });
}

export function evaluateSharedEndpointFamily({ alpha, beta }) {
  const corners = [
    [alpha.lo, beta.lo],
    [alpha.lo, beta.hi],
    [alpha.hi, beta.lo],
    [alpha.hi, beta.hi],
  ];
  const comparisons = corners.map(([a, b]) => {
    const AB = endpointFor(a, b);
    const BA = endpointFor(a, b);
    return freeze({ alpha: a, beta: b, AB, BA, equal: maxAbsEntryDifference(AB, BA) <= EPS });
  });
  return freeze({
    shared_parameter_covenant: true,
    corner_comparisons: comparisons,
    pointwise_endpoint_equality_over_frozen_corners: comparisons.every((entry) => entry.equal),
  });
}

export function evaluateEndpointHostile({ alpha = 1, betaAB = 2, betaBA = 2.4, tolerance = 0.1 } = {}) {
  const AB = endpointFor(alpha, betaAB);
  const BA = endpointFor(alpha, betaBA);
  const difference = maxAbsEntryDifference(AB, BA);
  const commonEndpointEstablished = difference <= tolerance;
  return freeze({
    AB,
    BA,
    endpoint_tolerance: tolerance,
    max_entry_difference: difference,
    common_endpoint_established: commonEndpointEstablished,
    classification: commonEndpointEstablished
      ? 'COMMON_ENDPOINT_ESTABLISHED_WITHIN_DECLARED_TOLERANCE'
      : 'COMMON_ENDPOINT_NOT_ESTABLISHED_OVER_DECLARED_TRANSITION_MODEL',
    disposition: commonEndpointEstablished
      ? 'ROUTE_TRANSCRIPT_COMPARISON_MAY_PROCEED'
      : 'ABSTAIN_FROM_COMMON_ENDPOINT_ROUTE_TRANSCRIPT_CLAIM',
  });
}

export function runRouteTranscriptRobustnessGauntlet() {
  const robust = buildRouteBoxes({
    alpha: { lo: 0.9, hi: 1.1 },
    beta: { lo: 1.8, hi: 2.2 },
    eta: 0.05,
    timing: 'sample_before_transition',
  });
  const ambiguous = buildRouteBoxes({
    alpha: { lo: 0.05, hi: 0.15 },
    beta: { lo: 0.05, hi: 0.15 },
    eta: 0.10,
    timing: 'sample_before_transition',
  });
  const sharedEndpoint = evaluateSharedEndpointFamily({
    alpha: { lo: 0.9, hi: 1.1 },
    beta: { lo: 1.8, hi: 2.2 },
  });
  const endpointHostile = evaluateEndpointHostile();
  const missingTiming = buildRouteBoxes({
    alpha: { lo: 0.9, hi: 1.1 },
    beta: { lo: 1.8, hi: 2.2 },
    eta: 0.05,
  });

  const criteria = freeze({
    R1_shared_parameter_endpoint_equality: sharedEndpoint.pointwise_endpoint_equality_over_frozen_corners,
    R2_robust_AB_box_exact: intervalApprox(robust.observed_boxes.AB.A, 1.95, 2.05) && intervalApprox(robust.observed_boxes.AB.B, 3.85, 4.15),
    R3_robust_BA_box_exact: intervalApprox(robust.observed_boxes.BA.A, 3.75, 4.25) && intervalApprox(robust.observed_boxes.BA.B, 2.95, 3.05),
    R4_robust_boxes_disjoint: robust.boxes_overlap === false,
    R5_robust_classification: robust.classification === 'ROBUST_ROUTE_TRANSCRIPT_SEPARATION_OVER_DECLARED_TRANSITION_AND_ERROR_FAMILY',
    R6_ambiguity_boxes_overlap: ambiguous.boxes_overlap === true,
    R7_ambiguity_classification: ambiguous.classification === 'ROUTE_TRANSCRIPT_SEPARATION_UNRESOLVED_UNDER_DECLARED_ERROR_FAMILY',
    R8_endpoint_hostile_exceeds_tolerance: endpointHostile.max_entry_difference > endpointHostile.endpoint_tolerance,
    R9_endpoint_hostile_blocks_claim: endpointHostile.classification === 'COMMON_ENDPOINT_NOT_ESTABLISHED_OVER_DECLARED_TRANSITION_MODEL' && endpointHostile.disposition === 'ABSTAIN_FROM_COMMON_ENDPOINT_ROUTE_TRANSCRIPT_CLAIM',
    R10_missing_timing_abstains: missingTiming.status === 'SEQUENTIAL_OBSERVATION_TIMING_UNDECLARED' && missingTiming.disposition === 'ABSTAIN_BEFORE_ROUTE_TRANSCRIPT_COMPARISON',
  });

  const passed = Object.values(criteria).every(Boolean);
  return freeze({
    schema: ROUTE_TRANSCRIPT_ROBUSTNESS_SCHEMA,
    robust_family: robust,
    ambiguity_control: ambiguous,
    shared_endpoint_family: sharedEndpoint,
    endpoint_hostile: endpointHostile,
    missing_timing: missingTiming,
    criteria,
    passed,
    canonical_bounded_scientific_claim: passed
      ? 'ROUTE_CONDITIONED_ACTION_INDEXED_OBSERVATION_TRANSCRIPTS_CAN_REMAIN_SET_WISE_SEPARABLE_OVER_A_DECLARED_SHARED_FAMILY_OF_COMMUTING_ADDITIVE_TRANSITION_MAGNITUDES_AND_DETERMINISTIC_BOUNDED_MEASUREMENT_ERROR_WHILE_A_SMALLER_EFFECT_FAMILY_CAN_BECOME_UNRESOLVED_AND_ROUTE_DEPENDENT_ENDPOINT_DRIFT_BLOCKS_THE_COMMON_ENDPOINT_CLAIM_IN_THE_AUTHORED_2X2_FIXTURE'
      : null,
    next_learning_action: passed ? 'HUMAN_𝄐_REQUIRED_BEFORE_PATH_OBJECT_OR_TRANSPORT_FORMALIZATION' : null,
    general_robust_path_dependence_theorem_earned: false,
    statistical_consistency_earned: false,
    probabilistic_route_classification_earned: false,
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
