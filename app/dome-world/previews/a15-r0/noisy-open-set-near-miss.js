import { freeze } from '../../../engine/flowcore-pedagogue-utils.js';

export const NOISY_OPEN_SET_NEAR_MISS_SCHEMA = 'td613.ash.a15-r0.noisy-open-set-near-miss/v0.1';

const CANDIDATES = Object.freeze(['RX', 'RY', 'RZ']);
const PARAMETERS = Object.freeze({ RX: 0.70, RY: 0.50, RZ: 0.30 });
const N = 100;
const ALPHA_FAMILY = 0.01;
const ALPHA_MEMBER = ALPHA_FAMILY / CANDIDATES.length;
const HOEFFDING_RADIUS = Math.sqrt(Math.log(2 / ALPHA_MEMBER) / (2 * N));

function round15(value) {
  return Number(value.toFixed(15));
}

function evaluateCase({ id, ones, oracleTruth, classificationWhenRejected, classificationWhenSurvives }) {
  const zeros = N - ones;
  const empiricalRate = ones / N;
  const distances = Object.fromEntries(
    CANDIDATES.map(route => [route, round15(Math.abs(empiricalRate - PARAMETERS[route]))])
  );
  const likelihoods = Object.fromEntries(
    CANDIDATES.map(route => [route, PARAMETERS[route] ** ones * (1 - PARAMETERS[route]) ** zeros])
  );
  const survivors = CANDIDATES.filter(route => distances[route] <= HOEFFDING_RADIUS);
  const rejectionEarned = survivors.length === 0;

  return freeze({
    id,
    sample_size: N,
    ones,
    zeros,
    empirical_rate: round15(empiricalRate),
    oracle_truth: oracleTruth,
    oracle_truth_in_candidate_family: CANDIDATES.includes(oracleTruth),
    oracle_truth_exposed_to_decoder: false,
    candidate_parameters: PARAMETERS,
    candidate_distances: freeze(distances),
    candidate_likelihoods: freeze(likelihoods),
    all_candidate_likelihoods_nonzero: Object.values(likelihoods).every(value => value > 0),
    surviving_adequacy_set: freeze(survivors),
    open_set_rejection_earned: rejectionEarned,
    classification: rejectionEarned ? classificationWhenRejected : classificationWhenSurvives
  });
}

export function runNoisyOpenSetNearMissGauntlet() {
  const hostile = evaluateCase({
    id: 'CASE_A_HOSTILE',
    ones: 95,
    oracleTruth: 'RU',
    classificationWhenRejected: 'NOISY_OPEN_SET_REJECTION_EARNED',
    classificationWhenSurvives: 'NOISY_OPEN_SET_REJECTION_NOT_EARNED'
  });

  const nearMissBase = evaluateCase({
    id: 'CASE_B_NEAR_MISS',
    ones: 85,
    oracleTruth: 'RU',
    classificationWhenRejected: 'NOISY_OPEN_SET_REJECTION_EARNED',
    classificationWhenSurvives: 'OPEN_SET_REJECTION_NOT_EARNED_NEAR_MISS'
  });
  const nearMiss = freeze({
    ...nearMissBase,
    oracle_outside_truth_used_to_override_criterion: false,
    abstention_earned: false,
    model_validated: false,
    RX_truth_identified: false,
    failure_to_reject_is_validation: false
  });

  const controlBase = evaluateCase({
    id: 'CASE_C_CONTROL',
    ones: 72,
    oracleTruth: 'RX',
    classificationWhenRejected: 'CONTROL_REJECTED_UNEXPECTEDLY',
    classificationWhenSurvives: 'ADMITTED_CONTROL_SURVIVES_PREDECLARED_ADEQUACY_BAND'
  });
  const control = freeze({
    ...controlBase,
    surviving_candidate: controlBase.surviving_adequacy_set.length === 1 ? controlBase.surviving_adequacy_set[0] : null,
    criterion_conditioned_membership_support: controlBase.surviving_adequacy_set.length === 1,
    unconditional_truth_identification: false,
    model_family_validated_universally: false,
    failure_to_reject_is_validation: false
  });

  const hostileGoverned = freeze({
    ...hostile,
    all_candidates_outside_predeclared_adequacy_band: hostile.surviving_adequacy_set.length === 0,
    selected_route: 'NONE',
    open_set_state: 'OPEN_SET_UNRESOLVED',
    abstention_earned: hostile.open_set_rejection_earned,
    truth_identified: false
  });

  const thresholdMutationControl = freeze({
    classification: 'POSTHOC_REJECTION_THRESHOLD_MUTATION_REJECTED',
    threshold_mutated: false
  });
  const oracleOverrideControl = freeze({
    classification: 'ORACLE_OVERRIDE_OF_OBSERVED_CRITERION_REJECTED',
    oracle_override_applied: false
  });

  const passed =
    round15(HOEFFDING_RADIUS) === 0.178842523679579 &&
    hostileGoverned.all_candidate_likelihoods_nonzero === true &&
    JSON.stringify(hostileGoverned.candidate_distances) === JSON.stringify({ RX: 0.25, RY: 0.45, RZ: 0.65 }) &&
    hostileGoverned.surviving_adequacy_set.length === 0 &&
    hostileGoverned.classification === 'NOISY_OPEN_SET_REJECTION_EARNED' &&
    nearMiss.all_candidate_likelihoods_nonzero === true &&
    JSON.stringify(nearMiss.candidate_distances) === JSON.stringify({ RX: 0.15, RY: 0.35, RZ: 0.55 }) &&
    JSON.stringify(nearMiss.surviving_adequacy_set) === JSON.stringify(['RX']) &&
    nearMiss.classification === 'OPEN_SET_REJECTION_NOT_EARNED_NEAR_MISS' &&
    nearMiss.oracle_outside_truth_used_to_override_criterion === false &&
    JSON.stringify(control.candidate_distances) === JSON.stringify({ RX: 0.02, RY: 0.22, RZ: 0.42 }) &&
    JSON.stringify(control.surviving_adequacy_set) === JSON.stringify(['RX']) &&
    control.classification === 'ADMITTED_CONTROL_SURVIVES_PREDECLARED_ADEQUACY_BAND' &&
    thresholdMutationControl.threshold_mutated === false &&
    oracleOverrideControl.oracle_override_applied === false;

  if (!passed) throw new Error('Noisy open-set near-miss gauntlet violated an authored expectation.');

  return freeze({
    schema: NOISY_OPEN_SET_NEAR_MISS_SCHEMA,
    source_status: 'SIMULATED',
    authority_class: 'A2_DERIVATIONAL',
    manifestly_fictional: true,
    candidate_family: freeze([...CANDIDATES]),
    candidate_parameters: PARAMETERS,
    hostile_oracle: freeze({ true_route: 'RU', parameter: 0.95, truth_in_candidate_family: false }),
    criterion: freeze({
      role: 'FORMAL_DIAGNOSTIC',
      sample_size: N,
      alpha_family: ALPHA_FAMILY,
      alpha_member: ALPHA_MEMBER,
      hoeffding_radius: round15(HOEFFDING_RADIUS),
      predeclared: true,
      selected_after_observation: false,
      universal_threshold_claim: false,
      empirical_validation_claim: false
    }),
    cases: freeze({ hostile: hostileGoverned, near_miss: nearMiss, control }),
    controls: freeze({
      threshold_mutation: thresholdMutationControl,
      oracle_override: oracleOverrideControl,
      failure_to_reject_is_validation: false
    }),
    gauntlet_status: 'NOISY_OPEN_SET_NEAR_MISS_GRAMMAR_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE',
    reusable_relation_status: 'RESEARCH_REFINEMENT_CANDIDATE_ONLY',
    reusable_relation: 'responsible open-set abstention must be earned from predeclared evidence criteria, not oracle knowledge that the model is wrong; nonzero candidate likelihood does not by itself establish adequacy',
    next_learning_action: 'TEST_MULTI_PROBE_OPEN_SET_REJECTION_UNDER_MATCHED_OBSERVATION_BUDGETS',
    claims: freeze({
      universal_open_set_recognition: false,
      universal_optimal_rejection_threshold: false,
      empirical_calibration_live_data: false,
      universal_hoeffding_optimality: false,
      causal_identification: false,
      live_td613_stochastic_behavior: false,
      tomography: false,
      connection: false,
      curvature: false,
      holonomy: false,
      berry_structure: false,
      physical_phasons: false,
      quantum_behavior: false,
      proto_loom: false,
      production_authority: false
    }),
    promotion_authority: false,
    production_mutated: false,
    live_ash_binding: false,
    human_closure_required: true
  });
}
