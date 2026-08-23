import {
  claimFactorsThrough,
  runTranscriptCompressionCollisionGauntlet,
} from './aperture-pedagogue-transcript-compression-collision.js';

export const PARTIAL_EVENT_CUSTODY_SCHEMA = 'td613.a15-r0.aperture-pedagogue-partial-event-custody/v0.1';

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const endpointProjection = (record) => record.endpoint;
const aResponseProjection = (record) => record.transcript[0];
const bResponseProjection = (record) => record.transcript[1];
const fullResponseProjection = (record) => record.transcript;
const actionSetProjection = () => ['A', 'B'];
const d6Claim = (record) => record.transcript[0] + record.transcript[1] >= 6;
const routeClaim = (record) => record.route_label;

function evaluateProjection({ id, records, projection, claim, domain }) {
  if (!Array.isArray(records) || records.length === 0) throw new Error('NONEMPTY_DECLARED_CLAIM_DOMAIN_REQUIRED');
  if (!domain) throw new Error('EXPLICIT_CLAIM_DOMAIN_ID_REQUIRED');
  const factorization = claimFactorsThrough(records, projection, claim);
  return freeze({
    projection_id: id,
    claim_domain: domain,
    factors: factorization.factors,
    fibers: factorization.fibers,
  });
}

export function runPartialEventCustodyGauntlet() {
  const parent = runTranscriptCompressionCollisionGauntlet();
  if (parent.passed !== true) {
    return freeze({
      schema: PARTIAL_EVENT_CUSTODY_SCHEMA,
      status: 'PARENT_TRANSCRIPT_COMPRESSION_COLLISION_NOT_ESTABLISHED',
      disposition: 'ABSTAIN_BEFORE_PARTIAL_EVENT_CUSTODY_CLAIMS',
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

  const U = freeze([...parent.universe]);
  const R = freeze(U.filter((record) => record.id === 'AB' || record.id === 'BA'));
  if (U.length !== 3 || R.length !== 2) throw new Error('DECLARED_PARTIAL_CUSTODY_DOMAINS_MALFORMED');

  const domainIds = freeze({
    decision: 'U_AB_BA_FROZEN',
    route: 'R_AB_BA_ONLY',
  });

  const endpointD6 = evaluateProjection({ id: 'ENDPOINT_ONLY', records: U, projection: endpointProjection, claim: d6Claim, domain: domainIds.decision });
  const endpointRoute = evaluateProjection({ id: 'ENDPOINT_ONLY', records: R, projection: endpointProjection, claim: routeClaim, domain: domainIds.route });

  const aRoute = evaluateProjection({ id: 'A_LABELED_RESPONSE_ONLY', records: R, projection: aResponseProjection, claim: routeClaim, domain: domainIds.route });
  const aD6 = evaluateProjection({ id: 'A_LABELED_RESPONSE_ONLY', records: U, projection: aResponseProjection, claim: d6Claim, domain: domainIds.decision });

  const bRoute = evaluateProjection({ id: 'B_LABELED_RESPONSE_ONLY', records: R, projection: bResponseProjection, claim: routeClaim, domain: domainIds.route });
  const bD6 = evaluateProjection({ id: 'B_LABELED_RESPONSE_ONLY', records: U, projection: bResponseProjection, claim: d6Claim, domain: domainIds.decision });

  const fullD6 = evaluateProjection({ id: 'FULL_ACTION_INDEXED_RESPONSES', records: U, projection: fullResponseProjection, claim: d6Claim, domain: domainIds.decision });
  const fullRoute = evaluateProjection({ id: 'FULL_ACTION_INDEXED_RESPONSES', records: R, projection: fullResponseProjection, claim: routeClaim, domain: domainIds.route });

  const actionSetD6 = evaluateProjection({ id: 'ACTION_SET_ONLY', records: U, projection: actionSetProjection, claim: d6Claim, domain: domainIds.decision });
  const actionSetRoute = evaluateProjection({ id: 'ACTION_SET_ONLY', records: R, projection: actionSetProjection, claim: routeClaim, domain: domainIds.route });

  const endpointClassification = freeze({
    decision: endpointD6.factors
      ? 'ENDPOINT_ONLY_CUSTODY_IS_D6_SUFFICIENT_ON_DECLARED_UNIVERSE'
      : 'ENDPOINT_ONLY_CUSTODY_IS_D6_INSUFFICIENT_ON_DECLARED_UNIVERSE',
    route: endpointRoute.factors
      ? 'ENDPOINT_ONLY_CUSTODY_IS_ROUTE_SUFFICIENT_ON_AB_BA_DOMAIN'
      : 'ENDPOINT_ONLY_CUSTODY_IS_ROUTE_INSUFFICIENT_ON_AB_BA_DOMAIN',
  });
  const aClassification = freeze({
    route: aRoute.factors
      ? 'A_LABELED_RESPONSE_CUSTODY_IS_ROUTE_SUFFICIENT_ON_AB_BA_DOMAIN'
      : 'A_LABELED_RESPONSE_CUSTODY_IS_ROUTE_INSUFFICIENT_ON_AB_BA_DOMAIN',
    decision: aD6.factors
      ? 'A_LABELED_RESPONSE_CUSTODY_IS_D6_SUFFICIENT_ON_DECLARED_UNIVERSE'
      : 'A_LABELED_RESPONSE_CUSTODY_IS_D6_INSUFFICIENT_ON_DECLARED_UNIVERSE',
  });
  const bClassification = freeze({
    route: bRoute.factors
      ? 'B_LABELED_RESPONSE_CUSTODY_IS_ROUTE_SUFFICIENT_ON_AB_BA_DOMAIN'
      : 'B_LABELED_RESPONSE_CUSTODY_IS_ROUTE_INSUFFICIENT_ON_AB_BA_DOMAIN',
    decision: bD6.factors
      ? 'B_LABELED_RESPONSE_CUSTODY_IS_D6_SUFFICIENT_ON_DECLARED_UNIVERSE'
      : 'B_LABELED_RESPONSE_CUSTODY_IS_D6_INSUFFICIENT_ON_DECLARED_UNIVERSE',
  });

  const criteria = freeze({
    P1_parent_709_passes: parent.passed === true,
    P2_explicit_claim_domains_preserved: domainIds.decision === 'U_AB_BA_FROZEN' && domainIds.route === 'R_AB_BA_ONLY' && U.length === 3 && R.length === 2,
    P3_endpoint_only_factors_D6_on_U: endpointD6.factors === true,
    P4_endpoint_only_does_not_factor_route_on_R: endpointRoute.factors === false,
    P5_A_only_factors_route_on_R: aRoute.factors === true,
    P6_A_only_does_not_factor_D6_on_U: aD6.factors === false,
    P7_B_only_factors_route_on_R: bRoute.factors === true,
    P8_B_only_does_not_factor_D6_on_U: bD6.factors === false,
    P9_full_response_custody_factors_both_claims: fullD6.factors === true && fullRoute.factors === true,
    P10_action_set_only_factors_neither_claim: actionSetD6.factors === false && actionSetRoute.factors === false,
  });

  const passed = Object.values(criteria).every(Boolean);
  return freeze({
    schema: PARTIAL_EVENT_CUSTODY_SCHEMA,
    parent_schema: parent.schema,
    claim_domains: domainIds,
    projections: freeze({
      endpoint_only: freeze({ D6_on_U: endpointD6, route_on_R: endpointRoute, classification: endpointClassification }),
      A_labeled_response_only: freeze({ route_on_R: aRoute, D6_on_U: aD6, classification: aClassification }),
      B_labeled_response_only: freeze({ route_on_R: bRoute, D6_on_U: bD6, classification: bClassification }),
      full_action_indexed_responses: freeze({ D6_on_U: fullD6, route_on_R: fullRoute }),
      action_set_only: freeze({ D6_on_U: actionSetD6, route_on_R: actionSetRoute }),
    }),
    criteria,
    passed,
    classification: passed ? 'CROSSED_CLAIM_CONDITIONED_PARTIAL_EVENT_CUSTODY' : null,
    canonical_bounded_scientific_claim: passed
      ? 'IN_THE_AUTHORED_FINITE_ROUTE_FIXTURE_PARTIAL_EVENT_CUSTODY_IS_CLAIM_CONDITIONED_IN_BOTH_DIRECTIONS_ENDPOINT_ONLY_CUSTODY_PRESERVES_THE_DECLARED_D6_DECISION_WHILE_ERASING_AB_VS_BA_ROUTE_HISTORY_WHEREAS_EITHER_SINGLE_ACTION_LABELED_RESPONSE_DISTINGUISHES_AB_FROM_BA_BUT_FAILS_TO_PRESERVE_D6_OVER_THE_FULL_DECLARED_UNIVERSE'
      : null,
    anti_equivalences: freeze([
      'CHANGING_CLAIM_DOMAIN_SILENTLY_NE_VALID_FACTORIZATION_COMPARISON',
      'COMMON_ENDPOINT_NE_COMMON_ROUTE_HISTORY',
      'ROUTE_SUFFICIENT_PARTIAL_CUSTODY_NE_DECISION_SUFFICIENT_PARTIAL_CUSTODY',
      'DECISION_SUFFICIENT_PARTIAL_CUSTODY_NE_ROUTE_SUFFICIENT_PARTIAL_CUSTODY',
      'ACTION_SET_CUSTODY_NE_RESPONSE_OR_ORDER_CUSTODY',
      'FINITE_CLAIM_FACTORIZATION_NE_GENERIC_SUFFICIENT_STATISTIC_THEOREM',
    ]),
    next_learning_action: passed ? 'STOP_FOR_HUMAN_𝄐_BEFORE_SELECTING_COMPOSITIONAL_PATH_OBJECT_OR_TRANSPORT_GRAMMAR' : null,
    generic_sufficient_statistic_theorem_earned: false,
    generic_information_loss_theorem_earned: false,
    shannon_information_channel_capacity_claim_earned: false,
    causal_history_reconstruction_theorem_earned: false,
    general_path_dependence_theorem_earned: false,
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
