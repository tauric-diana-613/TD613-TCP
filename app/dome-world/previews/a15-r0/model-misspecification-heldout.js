import { freeze } from '../../../engine/flowcore-pedagogue-utils.js';

export const MODEL_MISSPECIFICATION_HELDOUT_SCHEMA = 'td613.ash.a15-r0.model-misspecification-heldout/v0.1';

const EPSILON = 1e-12;
const CANDIDATES = Object.freeze(['R0', 'R1', 'R2']);
const TRUE_ROUTE = 'RX';
const EQUAL_PRIOR = 1 / CANDIDATES.length;

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
  RX: Object.freeze([0.4, 0.4, 0.2])
});

const W_SYMBOLS = Object.freeze(['a', 'b', 'c']);
const TRAINING_SAMPLE = Object.freeze([0, 0, 0, 0, 0, 0]);

function round12(value) {
  return Number(value.toFixed(12));
}

function lawsEqual(left, right) {
  return left.length === right.length && left.every((value, index) => Math.abs(value - right[index]) <= EPSILON);
}

function populationIdentifiedSet(candidateRoutes, targetLaw) {
  return candidateRoutes.filter(route => lawsEqual(Y[route], targetLaw)).sort();
}

function sequenceLikelihood(law, sample) {
  return sample.reduce((likelihood, observedSymbol) => likelihood * law[observedSymbol], 1);
}

function trainingPosterior() {
  const likelihoods = Object.fromEntries(CANDIDATES.map(route => [route, sequenceLikelihood(Y[route], TRAINING_SAMPLE)]));
  const weighted = Object.fromEntries(CANDIDATES.map(route => [route, EQUAL_PRIOR * likelihoods[route]]));
  const evidence = Object.values(weighted).reduce((sum, value) => sum + value, 0);
  const posterior = Object.fromEntries(CANDIDATES.map(route => [route, round12(weighted[route] / evidence)]));
  const mapRoute = [...CANDIDATES].sort((left, right) => posterior[right] - posterior[left])[0];
  return freeze({
    sample: freeze([...TRAINING_SAMPLE]),
    n_train: TRAINING_SAMPLE.length,
    likelihoods: freeze(Object.fromEntries(Object.entries(likelihoods).map(([route, value]) => [route, round12(value)]))),
    prior_weighted_likelihoods: freeze(Object.fromEntries(Object.entries(weighted).map(([route, value]) => [route, round12(value)]))),
    marginal_evidence: round12(evidence),
    posterior: freeze(posterior),
    map_route: mapRoute,
    map_posterior: posterior[mapRoute]
  });
}

function heldoutCandidateProbabilities(symbol) {
  const index = W_SYMBOLS.indexOf(symbol);
  if (index < 0) throw new Error(`Unknown held-out symbol: ${symbol}`);
  return Object.fromEntries(CANDIDATES.map(route => [route, W[route][index]]));
}

function marginalHeldoutProbability(symbol) {
  const probabilities = heldoutCandidateProbabilities(symbol);
  return Object.values(probabilities).reduce((sum, value) => sum + EQUAL_PRIOR * value, 0);
}

export function runModelMisspecificationHeldoutGauntlet() {
  const populationSet = populationIdentifiedSet(CANDIDATES, Y[TRUE_ROUTE]);
  const training = trainingPosterior();

  const hardProbabilities = heldoutCandidateProbabilities('c');
  const hardEvidence = marginalHeldoutProbability('c');
  const hardAllZero = Object.values(hardProbabilities).every(value => value === 0);
  const hardHoldout = freeze({
    event: 'c',
    candidate_event_probabilities: freeze(hardProbabilities),
    marginal_evidence_under_declared_model: round12(hardEvidence),
    all_admitted_candidates_assign_zero_probability: hardAllZero,
    classification: 'MODEL_CLASS_FALSIFIED_BY_HELDOUT_EVENT',
    candidate_family_adequate_after_event: false,
    within_model_training_posterior_still_historical: true,
    posterior_update_under_declared_candidate_family: 'UNDEFINED_ZERO_EVIDENCE',
    silent_probability_smoothing_applied: false,
    truth_identified: false,
    omitted_route_identified: false
  });

  const softProbabilities = heldoutCandidateProbabilities('a');
  const softEvidence = marginalHeldoutProbability('a');
  const softHoldout = freeze({
    event: 'a',
    candidate_event_probabilities: freeze(softProbabilities),
    marginal_evidence_under_declared_model: round12(softEvidence),
    classification: 'NO_HELDOUT_FALSIFICATION_OBSERVED',
    model_validated: false,
    candidate_family_complete: false,
    truth_membership_in_candidate_family: false
  });

  const posthocExpansion = freeze({
    candidate_family: freeze([...CANDIDATES, TRUE_ROUTE]),
    provenance: 'POSTHOC_ORACLE_REVEALED',
    independent_confirmation: false,
    omitted_route_event_probability: W[TRUE_ROUTE][W_SYMBOLS.indexOf('c')],
    classification: 'POSTHOC_CANDIDATE_EXPANSION_NOT_CONFIRMATORY',
    RX_identified_from_heldout_event: false,
    outside_alternative_uniquely_identified: false
  });

  const population = freeze({
    candidate_family: freeze([...CANDIDATES]),
    true_route: TRUE_ROUTE,
    truth_in_candidate_family: CANDIDATES.includes(TRUE_ROUTE),
    candidate_family_complete: false,
    target_training_law: freeze([...Y[TRUE_ROUTE]]),
    identified_set: freeze(populationSet),
    classification: 'POINT_IDENTIFIED_WITHIN_MISSPECIFIED_DECLARED_MODEL',
    point_identified_within_declared_model: populationSet.length === 1,
    truth_identified: false,
    model_adequacy_established: false
  });

  const caseA = freeze({
    ...training,
    classification: 'HIGH_CONFIDENCE_WITHIN_MISSPECIFIED_MODEL',
    high_confidence_truth_claim: false,
    model_adequacy_established: false,
    candidate_family_completeness_inferred: false
  });

  const passed =
    JSON.stringify(population.identified_set) === JSON.stringify(['R0']) &&
    population.truth_in_candidate_family === false &&
    caseA.map_route === 'R0' &&
    caseA.map_posterior === 0.971436770999 &&
    hardHoldout.all_admitted_candidates_assign_zero_probability === true &&
    hardHoldout.marginal_evidence_under_declared_model === 0 &&
    hardHoldout.posterior_update_under_declared_candidate_family === 'UNDEFINED_ZERO_EVIDENCE' &&
    hardHoldout.silent_probability_smoothing_applied === false &&
    softHoldout.marginal_evidence_under_declared_model > 0 &&
    softHoldout.model_validated === false &&
    posthocExpansion.provenance === 'POSTHOC_ORACLE_REVEALED' &&
    posthocExpansion.RX_identified_from_heldout_event === false;

  if (!passed) throw new Error('Model-misspecification held-out gauntlet violated an authored expectation.');

  return freeze({
    schema: MODEL_MISSPECIFICATION_HELDOUT_SCHEMA,
    source_status: 'SIMULATED',
    authority_class: 'A2_DERIVATIONAL',
    manifestly_fictional: true,
    candidate_family: freeze([...CANDIDATES]),
    oracle_truth: freeze({
      route: TRUE_ROUTE,
      exposed_to_decoder: false,
      truth_membership_in_declared_candidate_family: false
    }),
    priors: freeze(Object.fromEntries(CANDIDATES.map(route => [route, EQUAL_PRIOR]))),
    observation_laws: freeze({ Y, W }),
    heldout_contract: freeze({
      heldout_channel_predeclared: true,
      heldout_channel_used_for_training: false,
      heldout_channel_used_for_candidate_selection: false
    }),
    training_population: population,
    cases: freeze({
      A_training_sample: caseA,
      B_hard_holdout: hardHoldout,
      C_soft_holdout: softHoldout,
      D_posthoc_expansion: posthocExpansion
    }),
    question_status: freeze({
      within_model_identification: 'ANSWERED',
      within_model_finite_sample_decision: 'ANSWERED',
      heldout_model_adequacy_test: 'ANSWERED_FOR_FROZEN_EVENTS',
      outside_truth_identification: 'UNRESOLVED'
    }),
    gauntlet_status: 'MODEL_MISSPECIFICATION_AND_HELDOUT_ADEQUACY_GRAMMAR_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE',
    reusable_relation_status: 'RESEARCH_REFINEMENT_CANDIDATE_ONLY',
    reusable_relation: 'identification inside a model and adequacy of the model are different questions; held-out falsification can reject a declared ontology without naming the ontology that should replace it',
    next_learning_action: 'TEST_PREDECLARED_CANDIDATE_EXPANSION_AND_OUT_OF_MODEL_RECOVERY',
    claims: freeze({
      universal_model_misspecification_theorem: false,
      universal_bayesian_calibration: false,
      causal_identification: false,
      live_td613_stochastic_behavior: false,
      complete_ontology_of_omitted_alternatives: false,
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
