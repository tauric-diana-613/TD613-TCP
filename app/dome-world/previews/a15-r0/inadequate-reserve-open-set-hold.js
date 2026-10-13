import { freeze } from '../../../engine/flowcore-pedagogue-utils.js';

export const INADEQUATE_RESERVE_OPEN_SET_HOLD_SCHEMA = 'td613.ash.a15-r0.inadequate-reserve-open-set-hold/v0.1';

const PRIMARY = Object.freeze(['R0', 'R1', 'R2']);
const RESERVE = Object.freeze(['RX', 'RY', 'RZ']);
const ORACLE_TRUTH = 'RU';
const PRIMARY_PRIOR = 1 / PRIMARY.length;
const TRAINING_SAMPLE = Object.freeze([0, 0, 0, 0, 0, 0]);

const Y = Object.freeze({
  R0: Object.freeze([0.9, 0.1]),
  R1: Object.freeze([0.5, 0.5]),
  R2: Object.freeze([0.1, 0.9]),
  RU: Object.freeze([0.9, 0.1])
});

const W = Object.freeze({
  R0: Object.freeze([0.8, 0.2, 0.0]),
  R1: Object.freeze([0.5, 0.5, 0.0]),
  R2: Object.freeze([0.2, 0.8, 0.0]),
  RX: Object.freeze([0.4, 0.4, 0.2]),
  RY: Object.freeze([0.3, 0.3, 0.4]),
  RZ: Object.freeze([0.2, 0.2, 0.6]),
  RU: Object.freeze([0.25, 0.25, 0.5])
});

const Q = Object.freeze({
  RX: Object.freeze([0.7, 0.3, 0.0]),
  RY: Object.freeze([0.4, 0.6, 0.0]),
  RZ: Object.freeze([0.2, 0.8, 0.0]),
  RU: Object.freeze([0.2, 0.3, 0.5])
});

const W_SYMBOLS = Object.freeze(['a', 'b', 'c']);
const Q_SYMBOLS = Object.freeze(['m', 'n', 'o']);

function round12(value) {
  return Number(value.toFixed(12));
}

function eventProbability(law, event, alphabet) {
  const index = alphabet.indexOf(event);
  if (index < 0) throw new Error(`Unknown symbol ${event}.`);
  return law[index];
}

function eventProbabilities(routes, laws, event, alphabet) {
  return Object.fromEntries(routes.map(route => [route, eventProbability(laws[route], event, alphabet)]));
}

function primaryTrainingReceipt() {
  const likelihoods = Object.fromEntries(
    PRIMARY.map(route => [
      route,
      TRAINING_SAMPLE.reduce((probability, symbol) => probability * Y[route][symbol], 1)
    ])
  );
  const weighted = Object.fromEntries(PRIMARY.map(route => [route, PRIMARY_PRIOR * likelihoods[route]]));
  const evidence = Object.values(weighted).reduce((sum, value) => sum + value, 0);
  const posterior = Object.fromEntries(PRIMARY.map(route => [route, round12(weighted[route] / evidence)]));
  const mapRoute = [...PRIMARY].sort((left, right) => posterior[right] - posterior[left])[0];

  return freeze({
    candidate_family: freeze([...PRIMARY]),
    reserve_participated: false,
    sample: freeze([...TRAINING_SAMPLE]),
    map_route: mapRoute,
    map_posterior: posterior[mapRoute],
    posterior: freeze(posterior),
    status: 'PRIMARY_DECISION_RETAINED_AS_HISTORICAL_RECEIPT'
  });
}

export function runInadequateReserveOpenSetHoldGauntlet() {
  const primaryTraining = primaryTrainingReceipt();

  const triggerEvent = 'c';
  const primaryTriggerProbabilities = eventProbabilities(PRIMARY, W, triggerEvent, W_SYMBOLS);
  const reserveTriggerProbabilities = eventProbabilities(RESERVE, W, triggerEvent, W_SYMBOLS);
  const primaryTriggerMarginal = round12(
    Object.values(primaryTriggerProbabilities).reduce((sum, value) => sum + PRIMARY_PRIOR * value, 0)
  );
  const activationTriggered = primaryTriggerMarginal === 0;

  const activation = freeze({
    event: triggerEvent,
    primary_event_probabilities: freeze(primaryTriggerProbabilities),
    reserve_event_probabilities: freeze(reserveTriggerProbabilities),
    primary_marginal_probability: primaryTriggerMarginal,
    activation_rule: 'ACTIVATE_RESERVE_IFF_PRIMARY_MARGINAL_PROBABILITY_TRIGGER_EVENT_EQUALS_ZERO',
    activation_rule_predeclared: true,
    activation_triggered: activationTriggered,
    classification: activationTriggered
      ? 'PRIMARY_MODEL_FALSIFIED_RESERVE_ACTIVATED'
      : 'PRIMARY_MODEL_NOT_FALSIFIED_RESERVE_INACTIVE',
    evidence_role: 'ACTIVATION_EVIDENCE_ONLY',
    reserve_member_identified_from_trigger: false,
    reserve_map_from_trigger: 'NOT_COMPUTED_BY_DESIGN'
  });

  const reserveAdequacyEvent = 'o';
  const reserveAdequacyProbabilities = eventProbabilities(RESERVE, Q, reserveAdequacyEvent, Q_SYMBOLS);
  const reserveFalsified = Object.values(reserveAdequacyProbabilities).every(value => value === 0);

  const reserveAdequacy = freeze({
    event: reserveAdequacyEvent,
    reserve_event_probabilities: freeze(reserveAdequacyProbabilities),
    reserve_model_falsified: reserveFalsified,
    primary_model_adequate: false,
    reserve_model_adequate: !reserveFalsified,
    selected_route: 'NONE',
    forced_nearest_candidate: false,
    open_set_state: 'OPEN_SET_UNRESOLVED',
    abstention_earned: activationTriggered && reserveFalsified,
    truth_identified: false,
    classification: activationTriggered && reserveFalsified
      ? 'PRIMARY_AND_RESERVE_MODELS_FALSIFIED_OPEN_SET_HOLD'
      : 'OPEN_SET_HOLD_NOT_EARNED'
  });

  const unknownGovernance = freeze({
    token: 'UNKNOWN_OUTSIDE_DECLARED_FAMILIES',
    unknown_token_is_candidate: false,
    unknown_token_has_route_likelihood: false,
    unknown_token_has_prior_probability: false,
    unknown_token_can_win_map: false
  });

  const negativeSpace = freeze({
    classification: 'BOUNDED_NEGATIVE_SPACE_RECEIPT',
    excluded_primary_family: freeze([...PRIMARY]),
    excluded_reserve_family: freeze([...RESERVE]),
    exclusion_basis_primary: 'W:c',
    exclusion_basis_reserve: 'Q:o',
    outside_truth_identity: 'UNRESOLVED'
  });

  const forcedChoiceControl = freeze({
    classification: 'FORCED_CHOICE_AFTER_MODEL_EXHAUSTION_REJECTED',
    route_returned: 'NONE',
    historical_primary_map_reused: false,
    reserve_trigger_probability_used_as_recovery_rank: false,
    arbitrary_distance_fallback_used: false
  });

  const posthocSynthesisControl = freeze({
    proposed_candidate: 'R_NEW',
    classification: 'POSTHOC_CANDIDATE_SYNTHESIS_NOT_ADMITTED',
    new_candidate_synthesis_authorized: false,
    automatic_ontology_reopening_authorized: false,
    independent_predeclaration_or_new_governed_assay_required: true
  });

  const softEvent = 'm';
  const softReserveProbabilities = eventProbabilities(RESERVE, Q, softEvent, Q_SYMBOLS);
  const softReserveFalsified = Object.values(softReserveProbabilities).every(value => value === 0);
  const softReserveControl = freeze({
    event: softEvent,
    reserve_event_probabilities: freeze(softReserveProbabilities),
    classification: softReserveFalsified
      ? 'RESERVE_FALSIFIED_BY_CONTROL_EVENT'
      : 'RESERVE_NOT_FALSIFIED_BY_CONTROL_EVENT',
    reserve_validated: false,
    reserve_complete: false
  });

  const passed =
    primaryTraining.map_route === 'R0' &&
    primaryTraining.map_posterior === 0.971436770999 &&
    activation.activation_triggered === true &&
    JSON.stringify(Object.values(activation.primary_event_probabilities)) === JSON.stringify([0, 0, 0]) &&
    JSON.stringify(Object.values(activation.reserve_event_probabilities)) === JSON.stringify([0.2, 0.4, 0.6]) &&
    reserveAdequacy.classification === 'PRIMARY_AND_RESERVE_MODELS_FALSIFIED_OPEN_SET_HOLD' &&
    JSON.stringify(reserveAdequacy.reserve_event_probabilities) === JSON.stringify({ RX: 0, RY: 0, RZ: 0 }) &&
    reserveAdequacy.selected_route === 'NONE' &&
    reserveAdequacy.abstention_earned === true &&
    unknownGovernance.unknown_token_is_candidate === false &&
    negativeSpace.outside_truth_identity === 'UNRESOLVED' &&
    forcedChoiceControl.route_returned === 'NONE' &&
    posthocSynthesisControl.new_candidate_synthesis_authorized === false &&
    JSON.stringify(softReserveControl.reserve_event_probabilities) === JSON.stringify({ RX: 0.7, RY: 0.4, RZ: 0.2 }) &&
    softReserveControl.classification === 'RESERVE_NOT_FALSIFIED_BY_CONTROL_EVENT' &&
    softReserveControl.reserve_validated === false;

  if (!passed) throw new Error('Inadequate reserve open-set hold gauntlet violated an authored expectation.');

  return freeze({
    schema: INADEQUATE_RESERVE_OPEN_SET_HOLD_SCHEMA,
    source_status: 'SIMULATED',
    authority_class: 'A2_DERIVATIONAL',
    manifestly_fictional: true,
    primary_candidate_family: freeze([...PRIMARY]),
    reserve_candidate_family: freeze([...RESERVE]),
    reserve_predeclaration_status: 'PREDECLARED_AND_FROZEN',
    reserve_contract: freeze({
      predeclared_before_training: true,
      predeclared_before_trigger_event: true,
      predeclared_before_recovery_event: true,
      active_during_primary_training: false,
      eligible_for_primary_map_decision: false,
      activation_rule_frozen: true
    }),
    oracle: freeze({
      true_route: ORACLE_TRUTH,
      truth_in_primary_family: PRIMARY.includes(ORACLE_TRUTH),
      truth_in_reserve_family: RESERVE.includes(ORACLE_TRUTH),
      oracle_truth_exposed_to_decoder: false
    }),
    observation_laws: freeze({ Y, W, Q }),
    primary_training: primaryTraining,
    activation,
    reserve_adequacy: reserveAdequacy,
    unknown_governance: unknownGovernance,
    negative_space: negativeSpace,
    controls: freeze({
      forced_choice: forcedChoiceControl,
      posthoc_synthesis: posthocSynthesisControl,
      soft_reserve: softReserveControl
    }),
    scope_ledger: freeze({
      primary_candidate_family: freeze([...PRIMARY]),
      reserve_candidate_family: freeze([...RESERVE]),
      truth_in_primary_family: false,
      truth_in_reserve_family: false,
      primary_training_scope: 'Y:[0,0,0,0,0,0]',
      reserve_activation_scope: 'W:c',
      reserve_adequacy_scope: 'Q:o',
      primary_falsification_status: 'FALSIFIED',
      reserve_falsification_status: 'FALSIFIED',
      open_set_state: 'OPEN_SET_UNRESOLVED',
      oracle_truth_exposed_to_decoder: false
    }),
    gauntlet_status: 'INADEQUATE_RESERVE_AND_OPEN_SET_HOLD_GRAMMAR_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE',
    reusable_relation_status: 'RESEARCH_REFINEMENT_CANDIDATE_ONLY',
    reusable_relation: 'a responsible inference system needs an earned abstention state when every admitted model family fails, preserving negative-space evidence without fabricating a positive ontology',
    next_learning_action: 'TEST_NOISY_OPEN_SET_REJECTION_WITH_NONZERO_NEAR_MISS_SUPPORT',
    claims: freeze({
      universal_open_set_recognition: false,
      universal_abstention_optimality: false,
      universal_model_rejection_threshold: false,
      causal_identification: false,
      empirical_recovery_outside_fixture: false,
      complete_omitted_ontology: false,
      live_td613_stochastic_behavior: false,
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
