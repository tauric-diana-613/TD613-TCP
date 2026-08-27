import { claimFactorsThrough, runTranscriptCompressionCollisionGauntlet } from './aperture-pedagogue-transcript-compression-collision.js';
import { runRouteTranscriptRobustnessGauntlet } from './aperture-pedagogue-route-transcript-robustness.js';

export const PARTIAL_EVENT_CUSTODY_PROJECTION_SCHEMA = 'td613.a15-r0.aperture-pedagogue-partial-event-custody-projection/v0.1';

const EPS = 1e-12;
const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const overlaps = (a, b) => !(a.hi < b.lo || b.hi < a.lo);
const intersection = (a, b) => overlaps(a, b)
  ? freeze({ lo: Math.max(a.lo, b.lo), hi: Math.min(a.hi, b.hi) })
  : null;
const approx = (a, b) => Math.abs(a - b) <= EPS;

const sumProjection = (record) => record.transcript[0] + record.transcript[1];
const aEventProjection = (record) => freeze({ action_id: 'A', scalar_response: record.transcript[0] });
const bEventProjection = (record) => freeze({ action_id: 'B', scalar_response: record.transcript[1] });
const jointProjection = (record) => freeze({
  cumulative_response: sumProjection(record),
  A_labeled_scalar: record.transcript[0],
});
const decisionD6 = (record) => sumProjection(record) >= 6;
const routeClaim = (record) => record.route_label;

export function exactClaimConditionedViews(collisionResult = runTranscriptCompressionCollisionGauntlet()) {
  if (!collisionResult?.passed) {
    return freeze({
      status: 'PARENT_COMPRESSION_COLLISION_NOT_WITNESSED_BY_EXECUTABLE',
      disposition: 'ABSTAIN_BEFORE_PARTIAL_CUSTODY_ANALYSIS',
    });
  }

  const universe = collisionResult.universe;
  const routePair = universe.filter((record) => record.id === 'AB' || record.id === 'BA');

  return freeze({
    status: 'EXACT_CLAIM_CONDITIONED_VIEWS_COMPUTED',
    domain_U_ids: universe.map((record) => record.id),
    domain_R_ids: routePair.map((record) => record.id),
    projections: {
      sum: universe.map((record) => ({ id: record.id, value: sumProjection(record) })),
      A_labeled_event: universe.map((record) => ({ id: record.id, value: aEventProjection(record) })),
      B_labeled_event: universe.map((record) => ({ id: record.id, value: bEventProjection(record) })),
      joint_sum_plus_A: universe.map((record) => ({ id: record.id, value: jointProjection(record) })),
    },
    factorization: {
      sum_for_decision_on_U: claimFactorsThrough(universe, sumProjection, decisionD6),
      sum_for_route_on_R: claimFactorsThrough(routePair, sumProjection, routeClaim),
      A_event_for_route_on_R: claimFactorsThrough(routePair, aEventProjection, routeClaim),
      A_event_for_decision_on_U: claimFactorsThrough(universe, aEventProjection, decisionD6),
      B_event_for_route_on_R: claimFactorsThrough(routePair, bEventProjection, routeClaim),
      B_event_for_decision_on_U: claimFactorsThrough(universe, bEventProjection, decisionD6),
      joint_for_decision_on_U: claimFactorsThrough(universe, jointProjection, decisionD6),
      joint_for_history_on_U: claimFactorsThrough(universe, jointProjection, routeClaim),
      certificate_only_for_route_on_R: claimFactorsThrough(
        routePair,
        () => 'ROBUST_ROUTE_TRANSCRIPT_SEPARATION_OVER_DECLARED_TRANSITION_AND_ERROR_FAMILY',
        routeClaim,
      ),
    },
  });
}

export function robustLabelCustodyViews(robustnessResult = runRouteTranscriptRobustnessGauntlet()) {
  if (!robustnessResult?.passed) {
    return freeze({
      status: 'PARENT_ROUTE_ROBUSTNESS_NOT_WITNESSED_BY_EXECUTABLE',
      disposition: 'ABSTAIN_BEFORE_ROBUST_PARTIAL_CUSTODY_ANALYSIS',
    });
  }

  const boxes = robustnessResult.robust_family.observed_boxes;
  const labeledASeparated = !overlaps(boxes.AB.A, boxes.BA.A);
  const labeledBSeparated = !overlaps(boxes.AB.B, boxes.BA.B);

  const ABUnlabeled = freeze([
    freeze({ source_action: 'A', interval: boxes.AB.A }),
    freeze({ source_action: 'B', interval: boxes.AB.B }),
  ]);
  const BAUnlabeled = freeze([
    freeze({ source_action: 'A', interval: boxes.BA.A }),
    freeze({ source_action: 'B', interval: boxes.BA.B }),
  ]);

  const crossRouteOverlaps = [];
  for (const left of ABUnlabeled) {
    for (const right of BAUnlabeled) {
      const overlap = intersection(left.interval, right.interval);
      if (overlap) {
        crossRouteOverlaps.push(freeze({
          AB_source_action: left.source_action,
          BA_source_action: right.source_action,
          overlap,
        }));
      }
    }
  }

  const endpointIdentity = robustnessResult.shared_endpoint_family
    .pointwise_endpoint_identity_certified_over_declared_family === true;

  return freeze({
    status: 'ROBUST_PARTIAL_CUSTODY_VIEWS_COMPUTED',
    parent_boxes: boxes,
    A_labeled: {
      separated: labeledASeparated,
      classification: labeledASeparated ? 'A_ACTION_LABELED_EVENT_RETAINS_ROUTE_SEPARATION' : 'A_ACTION_LABELED_EVENT_ROUTE_SEPARATION_UNRESOLVED',
    },
    B_labeled: {
      separated: labeledBSeparated,
      classification: labeledBSeparated ? 'B_ACTION_LABELED_EVENT_RETAINS_ROUTE_SEPARATION' : 'B_ACTION_LABELED_EVENT_ROUTE_SEPARATION_UNRESOLVED',
    },
    unlabeled_one_event: {
      AB_support: ABUnlabeled,
      BA_support: BAUnlabeled,
      cross_route_overlaps: crossRouteOverlaps,
      uniformly_route_sufficient: crossRouteOverlaps.length === 0,
      classification: crossRouteOverlaps.length === 0
        ? 'UNLABELED_SINGLE_EVENT_RETAINS_UNIFORM_ROUTE_SEPARATION'
        : 'ACTION_LABEL_ERASURE_DESTROYS_UNIFORM_SINGLE_EVENT_ROUTE_SUFFICIENCY_IN_AUTHORED_FAMILY',
    },
    endpoint_only: {
      shared_endpoint_identity_certified: endpointIdentity,
      route_identified: false,
      classification: endpointIdentity
        ? 'COMMON_ENDPOINT_CUSTODY_DOES_NOT_IDENTIFY_ROUTE_HISTORY'
        : 'ENDPOINT_EQUIVALENCE_NOT_ESTABLISHED_ABSTAIN',
    },
    family_certificate_only: {
      certificate: robustnessResult.robust_family.classification,
      historical_route_identified: false,
      classification: 'FAMILY_SEPARATION_CERTIFICATE_DOES_NOT_IDENTIFY_HISTORICAL_ROUTE',
    },
  });
}

export function runPartialEventCustodyProjectionGauntlet() {
  const collisionParent = runTranscriptCompressionCollisionGauntlet();
  const robustnessParent = runRouteTranscriptRobustnessGauntlet();

  const collisionSnapshotBefore = JSON.stringify(collisionParent.universe);
  const robustnessSnapshotBefore = JSON.stringify({
    robust_family: robustnessParent.robust_family,
    shared_endpoint_family: robustnessParent.shared_endpoint_family,
  });

  const exact = exactClaimConditionedViews(collisionParent);
  const robust = robustLabelCustodyViews(robustnessParent);

  const collisionSnapshotAfter = JSON.stringify(collisionParent.universe);
  const robustnessSnapshotAfter = JSON.stringify({
    robust_family: robustnessParent.robust_family,
    shared_endpoint_family: robustnessParent.shared_endpoint_family,
  });

  const expectedOverlap = robust.unlabeled_one_event.cross_route_overlaps.find((entry) => (
    entry.AB_source_action === 'B'
    && entry.BA_source_action === 'A'
    && approx(entry.overlap.lo, 3.85)
    && approx(entry.overlap.hi, 4.15)
  ));

  const claimCeiling = freeze({
    generic_sufficient_statistic_theorem_earned: false,
    generic_information_loss_theorem_earned: false,
    shannon_information_quantity_earned: false,
    minimal_representation_theorem_earned: false,
    optimal_custody_schema_earned: false,
    causal_history_reconstruction_theorem_earned: false,
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
    a16_reopened: false,
    live_ash_mutation: false,
    merge_authority: false,
    production_authority: false,
    vercel_authority: false,
  });

  const criteria = freeze({
    C1_parent_compression_collision_passes: collisionParent.passed === true,
    C2_parent_route_robustness_passes: robustnessParent.passed === true,
    C3_sum_decision_yes_route_no: exact.factorization.sum_for_decision_on_U.factors === true && exact.factorization.sum_for_route_on_R.factors === false,
    C4_A_event_route_yes_decision_no: exact.factorization.A_event_for_route_on_R.factors === true && exact.factorization.A_event_for_decision_on_U.factors === false,
    C5_B_event_route_yes_decision_no: exact.factorization.B_event_for_route_on_R.factors === true && exact.factorization.B_event_for_decision_on_U.factors === false,
    C6_joint_view_supports_both_declared_claims: exact.factorization.joint_for_decision_on_U.factors === true && exact.factorization.joint_for_history_on_U.factors === true,
    C7_A_labeled_robust_event_separates_routes: robust.A_labeled.separated === true,
    C8_B_labeled_robust_event_separates_routes: robust.B_labeled.separated === true,
    C9_unlabeled_event_has_explicit_cross_route_overlap: robust.unlabeled_one_event.uniformly_route_sufficient === false && Boolean(expectedOverlap),
    C10_endpoint_only_refuses_route_history: robust.endpoint_only.shared_endpoint_identity_certified === true && robust.endpoint_only.route_identified === false,
    C11_family_certificate_refuses_historical_identity: exact.factorization.certificate_only_for_route_on_R.factors === false && robust.family_certificate_only.historical_route_identified === false,
    C12_parent_custody_unchanged_after_projection: collisionSnapshotBefore === collisionSnapshotAfter && robustnessSnapshotBefore === robustnessSnapshotAfter,
    C13_claim_ceiling_remains_closed: Object.values(claimCeiling).every((value) => value === false),
  });

  const passed = Object.values(criteria).every(Boolean);

  return freeze({
    schema: PARTIAL_EVENT_CUSTODY_PROJECTION_SCHEMA,
    exact_claim_conditioned_views: exact,
    robust_label_custody_views: robust,
    criteria,
    passed,
    classification: passed ? 'CLAIM_CONDITIONED_PARTIAL_EVENT_CUSTODY_WITH_ACTION_LABEL_PROVENANCE_EFFECT' : null,
    canonical_bounded_scientific_claim: passed
      ? 'IN_THE_AUTHORED_FINITE_AND_ROBUST_ROUTE_FIXTURES_PARTIAL_EVENT_CUSTODY_IS_CLAIM_CONDITIONED_THE_CUMULATIVE_SCALAR_CAN_RETAIN_A_DECLARED_DECISION_WHILE_ERASING_THE_SAME_ENDPOINT_ROUTE_PAIR_AN_ACTION_LABELED_SINGLE_EVENT_CAN_RETAIN_THAT_ROUTE_PAIR_WHILE_FAILING_THE_DECISION_OVER_A_LARGER_FINITE_UNIVERSE_A_SMALL_JOINT_VIEW_CAN_SUPPORT_BOTH_DECLARED_CLAIMS_AND_ERASING_THE_ACTION_LABEL_FROM_ONE_ROBUST_EVENT_DESTROYS_UNIFORM_ROUTE_SUFFICIENCY_WITHOUT_DELETING_THE_UNDERLYING_CUSTODY'
      : null,
    next_learning_action: passed ? 'HUMAN_𝄐_REQUIRED_BEFORE_SELECTING_ANY_COMPOSITIONAL_PATH_OBJECT_OR_TRANSPORT_GRAMMAR' : null,
    ...claimCeiling,
  });
}
