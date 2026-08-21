import { compileObservationAperture } from '../../../engine/flowcore-observation-aperture.js';
import {
  MOSS_LANTERN_COMMUTING_NULL_OPERATORS,
  MOSS_LANTERN_ORDER_SENSITIVE_OPERATORS,
  buildMossLanternTemporalRoutes,
  forwardMossLanternTemporalWitness
} from './moss-lantern-temporal-order-assay.js';
import {
  ORDER_IDENTIFIABILITY_CANDIDATE_MECHANISM,
  ORDER_IDENTIFIABILITY_REFINEMENT_ID
} from './order-identifiability-refinement.js';

export const MOSS_LANTERN_ALIASING_DISCRIMINATOR_SCHEMA = 'td613.ash.a15-r0.moss-lantern-aliasing-discriminator/v0.1';

const freeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
};

const round6 = value => Number(value.toFixed(6));
const key = signature => JSON.stringify(signature);

function validateFixture(fixture) {
  if (!fixture || fixture.fixture_id !== 'ash-loom.moss-lantern-calibration/v0.1') {
    throw new Error('ML3.5 requires the canonical Moss Lantern calibration fixture.');
  }
  if (fixture.manifestly_fictional !== true || fixture.runtime_binding !== false) {
    throw new Error('ML3.5 requires a fictional, non-runtime Moss Lantern fixture.');
  }
}

function validateRefinement(refinement) {
  if (!refinement || refinement.schema !== 'td613.flowcore.pedagogue-research-mechanism-refinement/v0.1') {
    throw new Error('ML3.5 requires a governed Pedagogue mechanism refinement.');
  }
  if (refinement.proposal_id !== ORDER_IDENTIFIABILITY_REFINEMENT_ID) {
    throw new Error('ML3.5 received the wrong Pedagogue refinement proposal.');
  }
  if (refinement.candidate_mechanism_id !== ORDER_IDENTIFIABILITY_CANDIDATE_MECHANISM) {
    throw new Error('ML3.5 requires the governed order-identifiability candidate mechanism.');
  }
  if (refinement.epistemic_kind !== 'OPERATIONAL_CRITERION') {
    throw new Error('ML3.5 requires the order-identifiability refinement to be classified as an OPERATIONAL_CRITERION.');
  }
  if (refinement.formal_scope !== 'FINITE_DETERMINISTIC_TERMINAL_SIGNATURE_MODEL') {
    throw new Error('ML3.5 requires the finite deterministic terminal-signature formal scope.');
  }
  if (refinement.refinement_status !== 'MULTI_CONTEXT_MOTIVATED_OPERATIONAL_CRITERION') {
    throw new Error('ML3.5 requires a multi-context-motivated operational criterion before instrumentation validation.');
  }
  if (refinement.empirical_truth_claim !== false || refinement.instrumentation_validation_applicable !== true) {
    throw new Error('ML3.5 may validate instrumentation for the criterion but may not treat the criterion as an empirical truth claim.');
  }
  if (refinement.authority?.pedagogue_law_promoted !== false || refinement.authority?.production_mutation_authorized !== false) {
    throw new Error('ML3.5 requires closed Pedagogue-law and production authority.');
  }
}

function observeRich(state) {
  return freeze([...state]);
}

function observeDropV(state) {
  return freeze([state[0]]);
}

function candidateMetrics(forwardStates, observe) {
  const observed = forwardStates.map(observe);
  const forwardCounts = new Map();
  const observedCounts = new Map();
  forwardStates.forEach(state => forwardCounts.set(key(state), (forwardCounts.get(key(state)) || 0) + 1));
  observed.forEach(signature => observedCounts.set(key(signature), (observedCounts.get(key(signature)) || 0) + 1));
  const candidateSizes = observed.map(signature => observedCounts.get(key(signature)));
  const latentRouteCount = forwardStates.length;
  const forwardUnique = forwardCounts.size;
  const observedUnique = observedCounts.size;
  const forwardAliasDeficit = latentRouteCount - forwardUnique;
  const observationAliasDeficit = forwardUnique - observedUnique;
  const exactUniqueRecoveryRate = candidateSizes.filter(size => size === 1).length / latentRouteCount;

  let classification = 'INCONCLUSIVE';
  if (forwardAliasDeficit > 0) classification = observationAliasDeficit > 0
    ? 'DYNAMIC_AND_OBSERVATIONAL_ALIASING'
    : 'DYNAMIC_ALIASING';
  else if (observationAliasDeficit > 0) classification = 'OBSERVATIONAL_ALIASING';
  else if (exactUniqueRecoveryRate === 1) classification = 'SEPARATED';

  return freeze({
    latent_route_count: latentRouteCount,
    forward_unique_terminal_state_count: forwardUnique,
    observed_unique_signature_count: observedUnique,
    forward_alias_deficit: forwardAliasDeficit,
    observation_alias_deficit: observationAliasDeficit,
    exact_unique_route_recovery_rate: round6(exactUniqueRecoveryRate),
    mean_candidate_set_size: round6(candidateSizes.reduce((sum, size) => sum + size, 0) / candidateSizes.length),
    maximum_candidate_set_size: Math.max(...candidateSizes),
    classification
  });
}

function forwardStates(routes, operators) {
  return freeze(routes.map(route => forwardMossLanternTemporalWitness(route, operators)));
}

export function runMossLanternAliasingDiscriminator({ fixture, refinement } = {}) {
  validateFixture(fixture);
  validateRefinement(refinement);
  const routes = buildMossLanternTemporalRoutes();
  const separatingForward = forwardStates(routes, MOSS_LANTERN_ORDER_SENSITIVE_OPERATORS);
  const erasingForward = forwardStates(routes, MOSS_LANTERN_COMMUTING_NULL_OPERATORS);

  const conditions = freeze({
    A_SEPARATING_RICH: candidateMetrics(separatingForward, observeRich),
    B_SEPARATING_DROP_V: candidateMetrics(separatingForward, observeDropV),
    C_ERASING_RICH: candidateMetrics(erasingForward, observeRich),
    D_ERASING_DROP_V: candidateMetrics(erasingForward, observeDropV)
  });

  const A = conditions.A_SEPARATING_RICH;
  const B = conditions.B_SEPARATING_DROP_V;
  const C = conditions.C_ERASING_RICH;
  const D = conditions.D_ERASING_DROP_V;

  const discriminatorValidated = (
    A.forward_unique_terminal_state_count === 24
    && A.observed_unique_signature_count === 24
    && A.forward_alias_deficit === 0
    && A.observation_alias_deficit === 0
    && A.exact_unique_route_recovery_rate === 1
    && A.classification === 'SEPARATED'
    && B.forward_unique_terminal_state_count === 24
    && B.observed_unique_signature_count < 24
    && B.forward_alias_deficit === 0
    && B.observation_alias_deficit > 0
    && B.exact_unique_route_recovery_rate < 1
    && B.classification === 'OBSERVATIONAL_ALIASING'
    && C.forward_unique_terminal_state_count === 1
    && C.observed_unique_signature_count === 1
    && C.forward_alias_deficit === 23
    && C.observation_alias_deficit === 0
    && C.exact_unique_route_recovery_rate === 0
    && C.classification === 'DYNAMIC_ALIASING'
    && D.forward_unique_terminal_state_count === 1
    && D.observed_unique_signature_count === 1
    && D.forward_alias_deficit === 23
    && D.observation_alias_deficit === 0
    && D.exact_unique_route_recovery_rate === 0
    && D.classification === 'DYNAMIC_ALIASING'
  );

  const aperture = compileObservationAperture({
    source_ids: ['moss-lantern-practice-capsule'],
    source_count: 1,
    instrument_scope: ['pedagogue-order-identifiability-operational-criterion', 'moss-lantern-ml3.5-aliasing-discriminator'],
    condition_scope: [
      'F_sep x O_rich',
      'F_sep x O_drop_v',
      'F_erase x O_rich',
      'F_erase x O_drop_v'
    ],
    matching_posture: 'DECLARED_2X2_FORWARD_OBSERVATION_INSTRUMENT_VALIDATION',
    filter_flags: {
      live_ash_runtime: false,
      raw_source_transport: false,
      route_labels_exposed_to_observer: false,
      absolute_timestamps_used: false,
      hidden_intermediate_states_used: false,
      lossy_aperture_changed_after_results: false,
      criterion_empirically_discovered: false
    },
    context_labels: ['A15-R0', 'Moss Lantern', 'ML3.5', 'operational-criterion-instrument-validation'],
    practice_mode: true,
    identity_redacted: true
  });

  return freeze({
    schema: MOSS_LANTERN_ALIASING_DISCRIMINATOR_SCHEMA,
    source_status: 'SIMULATED',
    authority_class: 'A2_DERIVATIONAL',
    fixture_id: fixture.fixture_id,
    manifestly_fictional: true,
    prerequisite_refinement_id: refinement.proposal_id,
    candidate_mechanism_id: refinement.candidate_mechanism_id,
    epistemic_kind: refinement.epistemic_kind,
    formal_scope: refinement.formal_scope,
    criterion_empirical_truth_claim: false,
    criterion_empirically_discovered: false,
    latent_route_count: routes.length,
    forward_process_factor: freeze({
      separating: 'ML3_ORDER_SENSITIVE_Z31_OPERATOR_TRAIN',
      erasing: 'ML3_COMMUTING_DIAGONAL_OPERATOR_NULL'
    }),
    observation_aperture_factor: freeze({
      rich: 'O_rich([u,v])=[u,v]',
      lossy: 'O_drop_v([u,v])=[u]',
      lossy_aperture_predeclared_in_spec: true,
      lossy_aperture_changed_after_results: false
    }),
    conditions,
    observation_aperture: aperture,
    findings: freeze({
      rich_aperture_preserves_separating_dynamics: A.classification === 'SEPARATED',
      coordinate_ablation_creates_observational_aliasing: B.classification === 'OBSERVATIONAL_ALIASING',
      commuting_forward_process_creates_dynamic_aliasing: C.classification === 'DYNAMIC_ALIASING' && D.classification === 'DYNAMIC_ALIASING',
      alias_location_instrument_validated: discriminatorValidated
    }),
    hypothesis_status: freeze({
      H_ALIAS_LOCATION_DISCRIMINATOR: discriminatorValidated
        ? 'INSTRUMENT_VALIDATED_IN_BOUNDED_FACTORIAL_FIXTURE'
        : 'INSTRUMENT_NOT_VALIDATED_IN_BOUNDED_FACTORIAL_FIXTURE'
    }),
    refinement_evaluation: discriminatorValidated
      ? 'INSTRUMENTATION_VALIDATED_FOR_OPERATIONAL_CRITERION'
      : 'INSTRUMENTATION_NOT_VALIDATED_FOR_OPERATIONAL_CRITERION',
    next_learning_action: discriminatorValidated
      ? 'TEST_SCOPE_BOUNDARY_OUTSIDE_DETERMINISTIC_TERMINAL_SIGNATURE_MODEL'
      : 'REVISE_INSTRUMENTATION_OR_OPERATIONAL_CRITERION',
    observer_firewall: freeze({
      hidden_route_identity_received: false,
      route_labels_received_as_observations: false,
      absolute_timestamps_received: false,
      transition_timestamps_received: false,
      hidden_intermediate_states_received: false,
      pedagogue_route_memory_used: false,
      levenshtein_distance_used: false,
      undeclared_second_coordinate_used_in_lossy_condition: false
    }),
    parent_mechanism_replaced: false,
    pedagogue_law_promoted: false,
    statistical_independence_claim: false,
    connection_declared: false,
    curvature_claim: false,
    holonomy_claim: false,
    quantum_behavior_claim: false,
    physical_realization_claim: false,
    promotion_authority: false,
    production_mutated: false,
    live_ash_binding: false,
    proto_loom_implementation: false,
    external_transmission: false,
    human_closure_required: true,
    claim_ceiling: 'FINITE_CLASSICAL_MOSS_LANTERN_ALIAS_LOCATION_INSTRUMENT_VALIDATION_ONLY; validates that the declared 2x2 instrumentation distinguishes dynamic from observational collision stages according to the operational criterion. The criterion is not empirically discovered. No universal theory of history, statistical independence, live TD613 temporal-order identifiability, quantum process tomography, physical noncommutativity, connection, curvature, holonomy, Berry structure, phasons, D3 physical geometry, A16, Proto-Loom, or production authority follows.'
  });
}
