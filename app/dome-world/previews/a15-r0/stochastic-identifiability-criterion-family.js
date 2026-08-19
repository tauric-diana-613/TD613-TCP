import { freeze } from '../../../engine/flowcore-pedagogue-utils.js';
import {
  PEDAGOGUE_RESEARCH_CRITERION_FAMILY_SCHEMA,
  compilePedagogueResearchCriterionFamily
} from '../../../engine/pedagogue-research-criterion-family.js';

export const STOCHASTIC_CRITERION_HOSTILE_ASSAY_SCHEMA = 'td613.ash.a15-r0.stochastic-criterion-hostile-assay/v0.1';

const EPSILON = 1e-12;
const round = value => Number(value.toFixed(12));

function assertDistribution(values, label) {
  if (!Array.isArray(values) || values.length < 2 || values.some(value => !Number.isFinite(value) || value < 0)) {
    throw new TypeError(`${label} must be a finite discrete probability vector.`);
  }
  const sum = values.reduce((total, value) => total + value, 0);
  if (Math.abs(sum - 1) > EPSILON) throw new Error(`${label} must sum to one.`);
  return [...values];
}

function distributionEqual(a, b) {
  return a.length === b.length && a.every((value, index) => Math.abs(value - b[index]) <= EPSILON);
}

function supportEqual(a, b) {
  return a.length === b.length && a.every((value, index) => (value > 0) === (b[index] > 0));
}

function totalVariation(a, b) {
  if (a.length !== b.length) throw new Error('Total-variation inputs must share an alphabet.');
  return round(0.5 * a.reduce((sum, value, index) => sum + Math.abs(value - b[index]), 0));
}

function enumerateProductDistribution(base, n) {
  if (!Number.isInteger(n) || n < 1) throw new Error('Sample budget must be a positive integer.');
  const map = new Map([['', 1]]);
  for (let step = 0; step < n; step += 1) {
    const next = new Map();
    for (const [prefix, probability] of map.entries()) {
      base.forEach((p, symbol) => {
        const key = `${prefix}${symbol}`;
        next.set(key, (next.get(key) || 0) + probability * p);
      });
    }
    map.clear();
    for (const [key, probability] of next.entries()) map.set(key, probability);
  }
  return map;
}

function mapTotalVariation(a, b) {
  const keys = new Set([...a.keys(), ...b.keys()]);
  let sum = 0;
  for (const key of keys) sum += Math.abs((a.get(key) || 0) - (b.get(key) || 0));
  return round(0.5 * sum);
}

function binaryEqualPriorBayesError(a, b) {
  return round((1 - totalVariation(a, b)) / 2);
}

function mapBinaryEqualPriorBayesError(a, b) {
  return round((1 - mapTotalVariation(a, b)) / 2);
}

function equivalenceClasses(routeDistributions) {
  const entries = Object.entries(routeDistributions);
  const classes = [];
  const consumed = new Set();
  for (const [route, distribution] of entries) {
    if (consumed.has(route)) continue;
    const members = entries
      .filter(([candidate, other]) => !consumed.has(candidate) && distributionEqual(distribution, other))
      .map(([candidate]) => candidate)
      .sort();
    members.forEach(member => consumed.add(member));
    classes.push(members);
  }
  return classes.sort((a, b) => a[0].localeCompare(b[0]));
}

function multiclassBayesError(routeDistributions, prior) {
  const routes = Object.keys(routeDistributions);
  const alphabetSize = routeDistributions[routes[0]].length;
  let accuracy = 0;
  for (let y = 0; y < alphabetSize; y += 1) {
    accuracy += Math.max(...routes.map(route => prior[route] * routeDistributions[route][y]));
  }
  return freeze({ accuracy: round(accuracy), error: round(1 - accuracy) });
}

export function buildStochasticIdentifiabilityCriterionFamily() {
  return compilePedagogueResearchCriterionFamily({
    family_id: 'STOCHASTIC_IDENTIFIABILITY_CRITERION_FAMILY',
    research_question: 'How should stochastic identifiability statements separate population equivalence, finite-budget decision risk, formal diagnostics, and empirical validation?',
    parent_scope_boundary_reference: 'MOSS_LANTERN_ML3_6_STOCHASTIC_SCOPE_BOUNDARY',
    model_class: 'FINITE_ROUTE_CONDITIONED_DISCRETE_OBSERVATION_DISTRIBUTIONS',
    observation_object: 'ROUTE_CONDITIONED_PROBABILITY_DISTRIBUTION',
    equivalence_relation: 'r ~_P s iff P(Y|r)=P(Y|s) for every admitted Y',
    members: [
      {
        criterion_id: 'STOCHASTIC_OBSERVATIONAL_EQUIVALENCE_BY_DISTRIBUTION',
        role: 'POPULATION_EQUIVALENCE',
        epistemic_kind: 'OPERATIONAL_CRITERION',
        question_answered: 'Which candidate routes are observationally equivalent under the complete declared stochastic observation law?',
        formal_scope: 'FINITE_DISCRETE_ROUTE_CONDITIONED_OBSERVATION_LAWS',
        required_assumptions: ['complete declared finite observation alphabet', 'fully specified route-conditioned distributions'],
        required_parameters: ['candidate_route_set', 'observation_law'],
        criterion_statement: 'Routes share one population equivalence class exactly when their complete admitted route-conditioned distributions are equal.',
        success_language: 'Population equivalence classes compiled inside the declared finite stochastic model.',
        failure_language: 'Population equivalence cannot be compiled from incomplete or malformed observation laws.',
        forbidden_inferences: ['population equivalence implies arbitrary-budget recoverability', 'non-singleton equivalence class means decoder failure'],
        next_validation: 'TEST_PARTIAL_IDENTIFICATION_AND_MODEL_MISSPECIFICATION_BOUNDARIES'
      },
      {
        criterion_id: 'STOCHASTIC_BAYES_DECISION_RECOVERABILITY_AT_BUDGET',
        role: 'FINITE_BUDGET_DECISION',
        epistemic_kind: 'OPERATIONAL_CRITERION',
        question_answered: 'How well can the Bayes-optimal declared decision problem recover route identity at sample budget n?',
        formal_scope: 'FINITE_DECLARED_HYPOTHESIS_DECISION_PROBLEM',
        required_assumptions: ['declared candidate family', 'declared prior or route weighting', 'declared loss', 'declared observation law'],
        required_parameters: ['sample_budget', 'candidate_route_set', 'prior_or_route_weighting', 'loss_function', 'observation_law', 'acceptable_error_threshold'],
        criterion_statement: 'Decision recoverability is evaluated by Bayes risk at the declared budget, prior, loss, candidate set, and observation law.',
        success_language: 'Finite-budget decision risk meets the declared threshold for this decision problem.',
        failure_language: 'Finite-budget decision risk exceeds the declared threshold or required decision parameters are absent.',
        forbidden_inferences: ['decision success proves universal population point-identifiability', 'changing sample budget changes population equivalence'],
        next_validation: 'TEST_MULTICLASS_PRIOR_AND_LOSS_SENSITIVITY'
      },
      {
        criterion_id: 'TOTAL_VARIATION_PAIRWISE_DIAGNOSTIC',
        role: 'FORMAL_DIAGNOSTIC',
        epistemic_kind: 'FORMAL_IDENTITY',
        question_answered: 'What pairwise total-variation separation holds for two declared finite observation laws?',
        formal_scope: 'PAIRWISE_FINITE_DISCRETE_PROBABILITY_LAWS',
        required_assumptions: ['shared declared observation alphabet'],
        required_parameters: [],
        criterion_statement: 'TV(P,Q)=1/2 sum_y |P(y)-Q(y)| for the declared pair.',
        success_language: 'Pairwise total variation calculated as a formal diagnostic.',
        failure_language: 'Pairwise total variation is not applicable to malformed or incomparable laws.',
        forbidden_inferences: ['positive total variation guarantees practical recoverability at arbitrary n', 'pairwise total variation is the universal stochastic identifiability definition'],
        next_validation: 'COMPARE_WITH_TASK_SPECIFIC_DECISION_RISK'
      },
      {
        criterion_id: 'EQUAL_PRIOR_BINARY_BAYES_ERROR_DIAGNOSTIC',
        role: 'FORMAL_DIAGNOSTIC',
        epistemic_kind: 'FORMAL_IDENTITY',
        question_answered: 'What Bayes-optimal 0-1 error follows for two simple hypotheses with equal priors?',
        formal_scope: 'TWO_SIMPLE_HYPOTHESES_EQUAL_PRIOR_ZERO_ONE_LOSS',
        required_assumptions: ['exactly two simple hypotheses', 'equal priors', '0-1 loss'],
        required_parameters: [],
        criterion_statement: 'BayesError(P,Q)=(1-TV(P,Q))/2 inside the declared binary equal-prior decision problem.',
        success_language: 'Binary equal-prior Bayes error calculated inside its formal scope.',
        failure_language: 'Diagnostic marked NOT_APPLICABLE outside the binary equal-prior scope.',
        forbidden_inferences: ['binary pairwise Bayes error substitutes for multiclass Bayes risk'],
        next_validation: 'REJECT_MULTICLASS_SUBSTITUTION'
      },
      {
        criterion_id: 'HELDOUT_STOCHASTIC_DECODER_RECOVERABILITY',
        role: 'EMPIRICAL_VALIDATION',
        epistemic_kind: 'DESIGN_HEURISTIC',
        question_answered: 'Does an implemented decoder achieve declared held-out performance under an independently generated sample process?',
        formal_scope: 'DECLARED_HELDOUT_DECODER_EVALUATION',
        required_assumptions: ['independently generated held-out observations', 'frozen decoder and evaluation protocol'],
        required_parameters: ['heldout_sample_process', 'decoder', 'sample_budget', 'performance_metric'],
        criterion_statement: 'Held-out decoder performance validates practical implementation only under the declared evaluation protocol.',
        success_language: 'Held-out decoder meets the declared bounded performance target.',
        failure_language: 'Held-out decoder misses the declared target or empirical validation remains unexecuted.',
        forbidden_inferences: ['held-out decoder success proves population point-identifiability', 'formal enumeration counts as held-out empirical validation'],
        next_validation: 'RUN_HELDOUT_DECODER_ONLY_AFTER_FORMAL_FAMILY_SURVIVES'
      }
    ],
    forbidden_collapses: [
      'population_identifiability != finite_sample_accuracy',
      'pairwise_distribution_separation != multiclass_recoverability',
      'support_equality != distribution_equality',
      'positive_divergence != practical_recoverability_at_arbitrary_n',
      'heldout_decoder_success != population_point_identifiability',
      'partial_identifiability != failed_identifiability',
      'identified_up_to_equivalence != uniquely_identified',
      'model_class + observation_object + equivalence_relation must remain explicit',
      'prior_or_route_weighting + loss_or_decision_target + sample_budget belong to finite-budget decision scope'
    ],
    claim_ceiling: 'This criterion family governs question separation inside declared finite stochastic models. It does not establish a universal stochastic identifiability theorem, privileged divergence, live TD613 stochastic behavior, connection, curvature, holonomy, Berry structure, physical phasons, A16 admission, Proto-Loom, or production authority.',
    next_learning_action: 'TEST_STOCHASTIC_CRITERION_FAMILY_ON_MULTICLASS_AND_PARTIAL_IDENTIFICATION_CASES'
  });
}

export function runStochasticCriterionFamilyHostileAssay() {
  const family = buildStochasticIdentifiabilityCriterionFamily();
  if (family.schema !== PEDAGOGUE_RESEARCH_CRITERION_FAMILY_SCHEMA) throw new Error('Hostile assay requires the governed stochastic criterion family.');

  const A0 = assertDistribution([0.6, 0.4], 'A0');
  const A1 = assertDistribution([0.4, 0.6], 'A1');
  const C0 = assertDistribution([0.5, 0.5], 'C0');
  const C1 = assertDistribution([0.5, 0.5], 'C1');
  const D0 = assertDistribution([0.8, 0.1, 0.1], 'D0');
  const D1 = assertDistribution([0.1, 0.8, 0.1], 'D1');
  const D2 = assertDistribution([0.1, 0.1, 0.8], 'D2');

  const aBase = { A0, A1 };
  const cBase = { C0, C1 };
  const dBase = { D0, D1, D2 };
  const A0n3 = enumerateProductDistribution(A0, 3);
  const A1n3 = enumerateProductDistribution(A1, 3);
  const C0n3 = enumerateProductDistribution(C0, 3);
  const C1n3 = enumerateProductDistribution(C1, 3);

  const dPrior = { D0: 1 / 3, D1: 1 / 3, D2: 1 / 3 };
  const dMulticlass = multiclassBayesError(dBase, dPrior);
  const dPairs = [
    ['D0', 'D1', D0, D1],
    ['D0', 'D2', D0, D2],
    ['D1', 'D2', D1, D2]
  ].map(([left, right, p, q]) => freeze({
    pair: `${left}:${right}`,
    total_variation: totalVariation(p, q),
    equal_prior_binary_bayes_error: binaryEqualPriorBayesError(p, q)
  }));

  const caseA = freeze({
    population_equivalence_classes: freeze(equivalenceClasses(aBase).map(group => freeze(group))),
    sample_budget: 1,
    support_equal: supportEqual(A0, A1),
    distributions_equal: distributionEqual(A0, A1),
    total_variation: totalVariation(A0, A1),
    bayes_error: binaryEqualPriorBayesError(A0, A1)
  });
  const caseB = freeze({
    population_equivalence_classes: freeze(equivalenceClasses(aBase).map(group => freeze(group))),
    sample_budget: 3,
    total_variation: mapTotalVariation(A0n3, A1n3),
    bayes_error: mapBinaryEqualPriorBayesError(A0n3, A1n3)
  });
  const caseC = freeze({
    population_equivalence_classes: freeze(equivalenceClasses(cBase).map(group => freeze(group))),
    n1: freeze({ total_variation: totalVariation(C0, C1), bayes_error: binaryEqualPriorBayesError(C0, C1) }),
    n3: freeze({ total_variation: mapTotalVariation(C0n3, C1n3), bayes_error: mapBinaryEqualPriorBayesError(C0n3, C1n3) })
  });
  const caseD = freeze({
    population_equivalence_classes: freeze(equivalenceClasses(dBase).map(group => freeze(group))),
    sample_budget: 1,
    pairwise_diagnostics: freeze(dPairs),
    binary_pairwise_diagnostic_as_multiclass_criterion: 'NOT_APPLICABLE',
    multiclass_bayes_accuracy: dMulticlass.accuracy,
    multiclass_bayes_error: dMulticlass.error
  });

  const passed =
    JSON.stringify(caseA.population_equivalence_classes) === JSON.stringify([['A0'], ['A1']]) &&
    JSON.stringify(caseB.population_equivalence_classes) === JSON.stringify(caseA.population_equivalence_classes) &&
    caseA.total_variation === 0.2 && caseA.bayes_error === 0.4 &&
    caseB.total_variation === 0.296 && caseB.bayes_error === 0.352 && caseB.bayes_error < caseA.bayes_error &&
    JSON.stringify(caseC.population_equivalence_classes) === JSON.stringify([['C0', 'C1']]) &&
    caseC.n1.total_variation === 0 && caseC.n1.bayes_error === 0.5 &&
    caseC.n3.total_variation === 0 && caseC.n3.bayes_error === 0.5 &&
    caseD.pairwise_diagnostics.every(pair => pair.total_variation === 0.7 && pair.equal_prior_binary_bayes_error === 0.15) &&
    caseD.multiclass_bayes_accuracy === 0.8 && caseD.multiclass_bayes_error === 0.2 &&
    caseD.binary_pairwise_diagnostic_as_multiclass_criterion === 'NOT_APPLICABLE';

  if (!passed) throw new Error('Stochastic criterion-family hostile assay violated an authored expectation.');

  return freeze({
    schema: STOCHASTIC_CRITERION_HOSTILE_ASSAY_SCHEMA,
    source_status: 'SIMULATED',
    authority_class: 'A2_DERIVATIONAL',
    manifestly_fictional: true,
    family,
    cases: freeze({ A: caseA, B: caseB, C: caseC, D: caseD }),
    empirical_validation_status: 'UNEXECUTED_EMPIRICAL_VALIDATION',
    formal_enumeration_relabelled_as_empirical: false,
    population_equivalence_depends_on_sample_budget: false,
    criterion_family_status: 'CRITERION_FAMILY_SEPARATION_VALIDATED_IN_HOSTILE_FIXTURE',
    next_learning_action: family.next_learning_action,
    claims: freeze({
      universal_stochastic_identifiability_theorem: false,
      privileged_divergence: false,
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
    human_closure_required: true,
    claim_ceiling: family.claim_ceiling
  });
}
