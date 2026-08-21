export const MOSS_LANTERN_STOCHASTIC_BOUNDARY_SCHEMA = 'td613.ash.a15-r0.moss-lantern-stochastic-identifiability-boundary/v0.1';

export const MOSS_LANTERN_STOCHASTIC_DISTRIBUTIONS = Object.freeze({
  R_A: Object.freeze([0.9, 0.1]),
  R_B: Object.freeze([0.1, 0.9]),
  R_C: Object.freeze([0.5, 0.5]),
  R_D: Object.freeze([0.5, 0.5])
});

const round6 = value => Number(value.toFixed(6));
const freeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
};

function validateDistribution(distribution, label) {
  if (!Array.isArray(distribution) || distribution.length !== 2) {
    throw new Error(`${label} must be a binary discrete distribution.`);
  }
  if (!distribution.every(value => Number.isFinite(value) && value >= 0 && value <= 1)) {
    throw new Error(`${label} contains an invalid probability.`);
  }
  const total = distribution.reduce((sum, value) => sum + value, 0);
  if (Math.abs(total - 1) > 1e-12) throw new Error(`${label} probabilities must sum to 1.`);
}

function validateInputs({ fixture, refinement, ml35 } = {}) {
  if (!fixture || fixture.fixture_id !== 'ash-loom.moss-lantern-calibration/v0.1') {
    throw new Error('ML3.6 requires the canonical Moss Lantern calibration fixture.');
  }
  if (fixture.manifestly_fictional !== true || fixture.runtime_binding !== false) {
    throw new Error('ML3.6 requires a fictional, non-runtime Moss Lantern fixture.');
  }
  if (!refinement || refinement.schema !== 'td613.flowcore.pedagogue-research-mechanism-refinement/v0.1') {
    throw new Error('ML3.6 requires the governed Pedagogue order-identifiability refinement.');
  }
  if (refinement.epistemic_kind !== 'OPERATIONAL_CRITERION') {
    throw new Error('ML3.6 requires an OPERATIONAL_CRITERION refinement.');
  }
  if (refinement.formal_scope !== 'FINITE_DETERMINISTIC_TERMINAL_SIGNATURE_MODEL') {
    throw new Error('ML3.6 requires the deterministic terminal-signature scope as the boundary being exited.');
  }
  if (!ml35 || ml35.schema !== 'td613.ash.a15-r0.moss-lantern-aliasing-discriminator/v0.1') {
    throw new Error('ML3.6 requires the governed ML3.5 alias-location instrument receipt.');
  }
  if (ml35.refinement_evaluation !== 'INSTRUMENTATION_VALIDATED_FOR_OPERATIONAL_CRITERION') {
    throw new Error('ML3.6 requires validated deterministic-scope instrumentation before crossing the scope boundary.');
  }
  if (ml35.criterion_empirically_discovered !== false || ml35.pedagogue_law_promoted !== false) {
    throw new Error('ML3.6 requires the operational criterion to remain non-empirical and unpromoted.');
  }
}

function support(distribution) {
  return distribution
    .map((probability, symbol) => ({ probability, symbol }))
    .filter(item => item.probability > 0)
    .map(item => item.symbol);
}

function arraysEqual(left, right, tolerance = 1e-12) {
  return left.length === right.length && left.every((value, index) => Math.abs(value - right[index]) <= tolerance);
}

function totalVariation(left, right) {
  return 0.5 * left.reduce((sum, value, index) => sum + Math.abs(value - right[index]), 0);
}

function productDistribution(base, sampleCount) {
  let states = new Map([['', 1]]);
  for (let sample = 0; sample < sampleCount; sample += 1) {
    const next = new Map();
    for (const [prefix, probability] of states.entries()) {
      for (let symbol = 0; symbol < base.length; symbol += 1) {
        const key = `${prefix}${symbol}`;
        next.set(key, (next.get(key) || 0) + probability * base[symbol]);
      }
    }
    states = next;
  }
  return [...states.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([sequence, probability]) => freeze({ sequence, probability }));
}

function pairMetrics(left, right, sampleCount) {
  validateDistribution(left, 'left distribution');
  validateDistribution(right, 'right distribution');
  const leftProduct = productDistribution(left, sampleCount);
  const rightProduct = productDistribution(right, sampleCount);
  const leftProbabilities = leftProduct.map(item => item.probability);
  const rightProbabilities = rightProduct.map(item => item.probability);
  const tv = totalVariation(leftProbabilities, rightProbabilities);
  return freeze({
    sample_count: sampleCount,
    base_support_equal: JSON.stringify(support(left)) === JSON.stringify(support(right)),
    base_distributions_equal: arraysEqual(left, right),
    product_distribution_equal: arraysEqual(leftProbabilities, rightProbabilities),
    total_variation: round6(tv),
    equal_prior_bayes_optimal_error: round6((1 - tv) / 2)
  });
}

export function runMossLanternStochasticIdentifiabilityBoundary({ fixture, refinement, ml35 } = {}) {
  validateInputs({ fixture, refinement, ml35 });
  const distributions = MOSS_LANTERN_STOCHASTIC_DISTRIBUTIONS;
  const distinguishable = freeze({
    n1: pairMetrics(distributions.R_A, distributions.R_B, 1),
    n3: pairMetrics(distributions.R_A, distributions.R_B, 3)
  });
  const nullPair = freeze({
    n1: pairMetrics(distributions.R_C, distributions.R_D, 1),
    n3: pairMetrics(distributions.R_C, distributions.R_D, 3)
  });

  const boundaryDemonstrated = (
    distinguishable.n1.base_support_equal === true
    && distinguishable.n1.base_distributions_equal === false
    && distinguishable.n1.total_variation === 0.8
    && distinguishable.n1.equal_prior_bayes_optimal_error === 0.1
    && distinguishable.n3.total_variation === 0.944
    && distinguishable.n3.equal_prior_bayes_optimal_error === 0.028
    && distinguishable.n3.equal_prior_bayes_optimal_error < distinguishable.n1.equal_prior_bayes_optimal_error
    && nullPair.n1.base_distributions_equal === true
    && nullPair.n1.total_variation === 0
    && nullPair.n1.equal_prior_bayes_optimal_error === 0.5
    && nullPair.n3.total_variation === 0
    && nullPair.n3.equal_prior_bayes_optimal_error === 0.5
  );

  return freeze({
    schema: MOSS_LANTERN_STOCHASTIC_BOUNDARY_SCHEMA,
    source_status: 'SIMULATED',
    authority_class: 'A2_DERIVATIONAL',
    fixture_id: fixture.fixture_id,
    manifestly_fictional: true,
    prerequisite_refinement_id: refinement.proposal_id,
    prerequisite_epistemic_kind: refinement.epistemic_kind,
    exited_formal_scope: refinement.formal_scope,
    stochastic_model_scope: 'FINITE_ROUTE_CONDITIONED_DISCRETE_OBSERVATION_DISTRIBUTIONS',
    observation_object: 'ROUTE_CONDITIONED_PROBABILITY_DISTRIBUTION',
    observation_alphabet: freeze([0, 1]),
    declared_sample_budgets: freeze([1, 3]),
    deterministic_point_signature_applicable: false,
    route_conditioned_distributions: distributions,
    distinguishable_pair: distinguishable,
    identical_distribution_null: nullPair,
    diagnostics: freeze({
      total_variation_is_formal_diagnostic: true,
      equal_prior_bayes_error_identity_is_formal_diagnostic: true,
      empirical_discovery_claim: false,
      monte_carlo_used: false,
      finite_sequence_enumeration_exact: true
    }),
    findings: freeze({
      same_support_can_hide_distributional_difference: distinguishable.n1.base_support_equal && !distinguishable.n1.base_distributions_equal,
      repeated_samples_improve_declared_pair_discrimination: distinguishable.n3.equal_prior_bayes_optimal_error < distinguishable.n1.equal_prior_bayes_optimal_error,
      identical_distributions_remain_indistinguishable: nullPair.n3.equal_prior_bayes_optimal_error === 0.5,
      deterministic_criterion_scope_boundary_demonstrated: boundaryDemonstrated
    }),
    hypothesis_status: freeze({
      H_DETERMINISTIC_CRITERION_SCOPE_BOUNDARY: boundaryDemonstrated
        ? 'SCOPE_BOUNDARY_DEMONSTRATED_IN_BOUNDED_STOCHASTIC_FIXTURE'
        : 'SCOPE_BOUNDARY_NOT_DEMONSTRATED_IN_BOUNDED_STOCHASTIC_FIXTURE'
    }),
    previous_criterion_scope_status: 'VALID_INSIDE_DECLARED_DETERMINISTIC_SCOPE',
    scope_boundary_status: boundaryDemonstrated
      ? 'DETERMINISTIC_POINT_SIGNATURE_GRAMMAR_INSUFFICIENT_FOR_STOCHASTIC_OBSERVATION_MODEL'
      : 'STOCHASTIC_SCOPE_BOUNDARY_UNRESOLVED',
    next_learning_action: boundaryDemonstrated
      ? 'AUTHOR_STOCHASTIC_IDENTIFIABILITY_CRITERION_CANDIDATES'
      : 'REVISE_STOCHASTIC_BOUNDARY_ASSAY',
    equivalence_posture: freeze({
      support_equality_is_not_distribution_equality: true,
      distribution_equality_is_explicit_null_equivalence: true,
      partial_or_probabilistic_identifiability_must_remain_distinct_from_exact_recovery: true
    }),
    parent_mechanism_replaced: false,
    previous_operational_criterion_falsified_inside_scope: false,
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
    claim_ceiling: 'FINITE_STOCHASTIC_SCOPE_BOUNDARY_FIXTURE_ONLY; demonstrates that a deterministic one-route-to-one-signature grammar is not a complete inverse object for the declared route-conditioned stochastic observation model. It does not establish a universal stochastic identifiability theorem, an optimal divergence, asymptotic consistency, HMM identifiability, causal identification, live TD613 stochastic behavior, quantum measurement, connection, curvature, holonomy, Berry structure, phasons, D3 physical geometry, A16, Proto-Loom, or production authority.'
  });
}
