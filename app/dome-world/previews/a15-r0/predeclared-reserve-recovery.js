import { freeze } from '../../../engine/flowcore-pedagogue-utils.js';

export const PREDECLARED_RESERVE_RECOVERY_SCHEMA = 'td613.ash.a15-r0.predeclared-reserve-recovery/v0.1';

const PRIMARY = Object.freeze(['R0', 'R1', 'R2']);
const RESERVE = Object.freeze(['RX', 'RY', 'RZ']);
const ORACLE_TRUTH = 'RX';
const PRIMARY_PRIOR = 1 / PRIMARY.length;
const TRAINING_SAMPLE = Object.freeze([0, 0, 0, 0, 0, 0]);
const RECOVERY_SEQUENCE = Object.freeze(['u', 'v']);

const Y = Object.freeze({
  R0: Object.freeze([0.9, 0.1]),
  R1: Object.freeze([0.5, 0.5]),
  R2: Object.freeze([0.1, 0.9]),
  RX: Object.freeze([0.9, 0.1])
});

const W = Object.freeze({
  R0: Object.freeze([0.8, 0.2, 0.0]),
  R1: Object.freeze([0.5, 0.5, 0.0]),
  R2: Object.freeze([0.2, 0.8, 0.0]),
  RX: Object.freeze([0.4, 0.4, 0.2]),
  RY: Object.freeze([0.3, 0.3, 0.4]),
  RZ: Object.freeze([0.2, 0.2, 0.6])
});

const V = Object.freeze({
  RX: Object.freeze([0.7, 0.3, 0.0]),
  RY: Object.freeze([0.7, 0.0, 0.3]),
  RZ: Object.freeze([0.0, 0.7, 0.3])
});

const W_SYMBOLS = Object.freeze(['a', 'b', 'c']);
const V_SYMBOLS = Object.freeze(['u', 'v', 'x']);

function round12(value) {
  return Number(value.toFixed(12));
}

function sequenceLikelihood(law, sample, alphabet) {
  return sample.reduce((likelihood, symbol) => {
    const index = alphabet.indexOf(symbol);
    if (index < 0) throw new Error(`Unknown symbol ${symbol}.`);
    return likelihood * law[index];
  }, 1);
}

function primaryTrainingReceipt() {
  const likelihoods = Object.fromEntries(PRIMARY.map(route => [route, TRAINING_SAMPLE.reduce((p, symbol) => p * Y[route][symbol], 1)]));
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

function eventProbabilities(routes, event) {
  const index = W_SYMBOLS.indexOf(event);
  if (index < 0) throw new Error(`Unknown trigger symbol ${event}.`);
  return Object.fromEntries(routes.map(route => [route, W[route][index]]));
}

function primaryMarginal(event) {
  const probabilities = eventProbabilities(PRIMARY, event);
  return Object.values(probabilities).reduce((sum, value) => sum + PRIMARY_PRIOR * value, 0);
}

function recoveryLikelihoods(sequence) {
  return Object.fromEntries(RESERVE.map(route => [route, round12(sequenceLikelihood(V[route], sequence, V_SYMBOLS))]));
}

export function evaluatePosthocReserveMutation(proposedReserve) {
  if (!Array.isArray(proposedReserve)) throw new TypeError('proposedReserve must be an array.');
  const exact = proposedReserve.length === RESERVE.length && proposedReserve.every((route, index) => route === RESERVE[index]);
  return freeze({
    proposed_reserve: freeze([...proposedReserve]),
    frozen_reserve: freeze([...RESERVE]),
    mutation_detected: !exact,
    classification: exact ? 'NO_RESERVE_MUTATION_DETECTED' : 'POSTHOC_RESERVE_MUTATION_REJECTED',
    reserve_mutated: false
  });
}

export function runPredeclaredReserveRecoveryGauntlet() {
  const primaryTraining = primaryTrainingReceipt();
  const triggerEvent = 'c';
  const primaryTriggerProbabilities = eventProbabilities(PRIMARY, triggerEvent);
  const reserveTriggerProbabilities = eventProbabilities(RESERVE, triggerEvent);
  const primaryTriggerMarginal = round12(primaryMarginal(triggerEvent));
  const activationTriggered = primaryTriggerMarginal === 0;

  const activation = freeze({
    event: triggerEvent,
    primary_event_probabilities: freeze(primaryTriggerProbabilities),
    reserve_event_probabilities: freeze(reserveTriggerProbabilities),
    primary_marginal_probability: primaryTriggerMarginal,
    activation_rule: 'ACTIVATE_RESERVE_IFF_PRIMARY_MARGINAL_PROBABILITY_TRIGGER_EVENT_EQUALS_ZERO',
    activation_rule_predeclared: true,
    activation_triggered: activationTriggered,
    reserve_family_posthoc_modified: false,
    classification: activationTriggered ? 'PRIMARY_MODEL_FALSIFIED_RESERVE_ACTIVATED' : 'PRIMARY_MODEL_NOT_FALSIFIED_RESERVE_INACTIVE',
    evidence_role: 'ACTIVATION_EVIDENCE_ONLY',
    reserve_member_identified_from_trigger: false,
    reserve_map_from_trigger: 'NOT_COMPUTED_BY_DESIGN'
  });

  const triggerOnly = freeze({
    activation_triggered: activationTriggered,
    recovery_evidence_present: false,
    classification: activationTriggered ? 'RESERVE_ACTIVATED_RECOVERY_UNRESOLVED' : 'RESERVE_INACTIVE',
    reserve_member_identified: false
  });

  const recoverySequenceLikelihoods = recoveryLikelihoods(RECOVERY_SEQUENCE);
  const recoveryIdentifiedSet = RESERVE.filter(route => recoverySequenceLikelihoods[route] > 0).sort();
  const recovery = freeze({
    sequence: freeze([...RECOVERY_SEQUENCE]),
    reserve_sequence_likelihoods: freeze(recoverySequenceLikelihoods),
    identified_set: freeze(recoveryIdentifiedSet),
    recovered_route: recoveryIdentifiedSet.length === 1 ? recoveryIdentifiedSet[0] : null,
    classification: activationTriggered && recoveryIdentifiedSet.length === 1
      ? 'RECOVERED_WITHIN_PREDECLARED_RESERVE_MODEL'
      : 'RESERVE_RECOVERY_UNRESOLVED',
    recovery_evidence_independent_of_trigger_channel: true,
    recovery_is_within_declared_finite_reserve_scope: true,
    universal_truth_identification: false
  });

  const inactiveReserveControl = freeze({
    activation_triggered: false,
    recovery_sequence_available: true,
    classification: 'RECOVERY_EVIDENCE_HELD_OUTSIDE_INACTIVE_RESERVE',
    primary_decision_mutated: false,
    reserve_member_promoted: false
  });

  const posthocMutationControl = evaluatePosthocReserveMutation(['RX', 'RZ']);

  const passed =
    primaryTraining.map_route === 'R0' &&
    primaryTraining.map_posterior === 0.971436770999 &&
    primaryTraining.reserve_participated === false &&
    activation.activation_triggered === true &&
    Object.values(activation.primary_event_probabilities).every(value => value === 0) &&
    JSON.stringify(Object.values(activation.reserve_event_probabilities)) === JSON.stringify([0.2, 0.4, 0.6]) &&
    activation.reserve_map_from_trigger === 'NOT_COMPUTED_BY_DESIGN' &&
    triggerOnly.classification === 'RESERVE_ACTIVATED_RECOVERY_UNRESOLVED' &&
    JSON.stringify(recovery.reserve_sequence_likelihoods) === JSON.stringify({ RX: 0.21, RY: 0, RZ: 0 }) &&
    JSON.stringify(recovery.identified_set) === JSON.stringify(['RX']) &&
    recovery.classification === 'RECOVERED_WITHIN_PREDECLARED_RESERVE_MODEL' &&
    inactiveReserveControl.primary_decision_mutated === false &&
    posthocMutationControl.classification === 'POSTHOC_RESERVE_MUTATION_REJECTED' &&
    posthocMutationControl.reserve_mutated === false;

  if (!passed) throw new Error('Predeclared reserve recovery gauntlet violated an authored expectation.');

  return freeze({
    schema: PREDECLARED_RESERVE_RECOVERY_SCHEMA,
    source_status: 'SIMULATED',
    authority_class: 'A2_DERIVATIONAL',
    manifestly_fictional: true,
    primary_candidate_family: freeze([...PRIMARY]),
    reserve_candidate_family: freeze([...RESERVE]),
    reserve_predeclaration_status: 'PREDECLARED_AND_FROZEN',
    reserve_contract: freeze({
      predeclared_before_training: true,
      predeclared_before_trigger_event: true,
      active_during_primary_training: false,
      eligible_for_primary_map_decision: false,
      activation_rule_frozen: true
    }),
    oracle: freeze({
      true_route: ORACLE_TRUTH,
      truth_in_reserve: RESERVE.includes(ORACLE_TRUTH),
      truth_in_primary: PRIMARY.includes(ORACLE_TRUTH),
      oracle_truth_exposed_to_decoder: false
    }),
    observation_laws: freeze({ Y, W, V }),
    primary_training: primaryTraining,
    activation,
    controls: freeze({
      trigger_only: triggerOnly,
      inactive_reserve: inactiveReserveControl,
      posthoc_mutation: posthocMutationControl
    }),
    recovery,
    scope_ledger: freeze({
      primary_candidate_family: freeze([...PRIMARY]),
      reserve_candidate_family: freeze([...RESERVE]),
      reserve_predeclaration_status: 'PREDECLARED_AND_FROZEN',
      activation_evidence: 'W:c',
      recovery_observation_scope: 'V:[u,v]',
      recovery_candidate_scope: freeze([...RESERVE]),
      oracle_truth_exposed_to_decoder: false
    }),
    gauntlet_status: 'PREDECLARED_RESERVE_ACTIVATION_AND_RECOVERY_GRAMMAR_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE',
    reusable_relation_status: 'RESEARCH_REFINEMENT_CANDIDATE_ONLY',
    reusable_relation: 'responsible out-of-model recovery requires provenance for what alternatives existed before failure, what evidence activated them, and what distinct evidence discriminated among them',
    next_learning_action: 'TEST_OPEN_SET_RECOVERY_WHEN_PREDECLARED_RESERVE_IS_ALSO_INADEQUATE',
    claims: freeze({
      universal_open_set_recognition: false,
      universal_bayesian_model_selection: false,
      causal_identification: false,
      reserve_family_complete: false,
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
