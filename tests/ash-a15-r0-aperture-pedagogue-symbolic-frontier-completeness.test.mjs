import assert from 'node:assert/strict';

import {
  SYMBOLIC_FRONTIER_COMPLETENESS_SCHEMA,
  runSymbolicFrontierCompletenessAssay,
  simplexClosedFormCount,
  simplexParametersThroughHorizon,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-symbolic-frontier-completeness.js';

const result = runSymbolicFrontierCompletenessAssay();

assert.equal(result.schema, SYMBOLIC_FRONTIER_COMPLETENESS_SCHEMA);
assert.equal(result.passed, true, 'The preregistered symbolic frontier-completeness theorem audition must either earn every obligation or fail loudly.');
assert.equal(result.status, 'SYMBOLIC_FRONTIER_COMPLETENESS_ROUND_CLOSED');
assert.equal(
  result.canonical_classification,
  'ALL_H_SYMBOLIC_COMMON_FUTURE_SIMPLEX_WITH_COMPLETE_MINIMAL_FRONTIER_AND_BINOMIAL_COUNT',
);

assert.equal(result.source_domain.last_action, 'Q_PHASE_PULSE');
assert.equal(result.source_domain.path_object, 'K_period4');
assert.deepEqual(result.source_domain.generators, ['T', 'Q']);
assert.deepEqual(result.source_domain.forcing_seasons_retained, ['S0', 'S1', 'S2', 'S3']);
assert.equal(result.source_domain.finite_control_seasons, 4);
assert.equal(result.source_domain.unbounded_integer_counters_retained, true);
assert.equal(result.source_domain.finite_state_space_claimed, false);

const equalizer = result.equalizer_certificate;
assert.equal(equalizer.passed, true);
assert.equal(equalizer.all_finite_word_capture_inherited, true);
assert.equal(equalizer.final_season_equality_implies_tick_difference_multiple_of_four, true);
assert.deepEqual(equalizer.four_tick_cycle_endpoint_delta, [3, 3, 3, 3]);
assert.equal(equalizer.all_question_deltas_zero_on_coordinates_1_and_2, true);
assert.equal(equalizer.cycle_delta_nonzero_on_coordinates_1_and_2, true);
assert.equal(equalizer.equal_operational_targets_force_equal_total_tick_count, true);
assert.equal(equalizer.with_ticks_equal_endpoint_equality_forces_equal_question_counts_by_phase_class, true);
assert.equal(equalizer.branch_prefix_Q_forces_source_phase_question_count_at_least_one, true);
assert.equal(equalizer.branch_prefix_T_plus_equal_source_phase_question_count_forces_total_ticks_at_least_two, true);
assert.equal(equalizer.rows.length, 4);
for (const row of equalizer.rows) {
  assert.equal(row.passed, true, `${row.source_season} must satisfy the finite-control equalizer certificate.`);
  assert.equal(row.period_two_source_identity, true);
  assert.equal(row.period_two_opposite_identity, true);
  assert.equal(row.question_support_disjoint, true);
  assert.equal(row.one_tick_leaves_source_phase, true);
  assert.equal(row.two_ticks_return_source_phase, true);
}

const factorization = result.factorization_tick_certificate;
assert.equal(factorization.passed, true);
assert.equal(factorization.rows.length, 16);
for (const row of factorization.rows) {
  assert.equal(row.passed, true, `${row.source_season} residue ${row.extra_tick_residue} must satisfy the all-a tick factorization identity.`);
  assert.deepEqual(row.symbolic_cycle_coefficient_left, [3, 3, 3, 3]);
  assert.deepEqual(row.symbolic_cycle_coefficient_right, [3, 3, 3, 3]);
  assert.deepEqual(row.constant_left, row.constant_right);
}

const antichain = result.frontier_antichain_certificate;
assert.equal(antichain.passed, true);
assert.equal(
  antichain.classification,
  'ALL_FORMAL_FRONTIER_STRATA_PAIRWISE_INCOMPARABLE_UNDER_DECLARED_TQ_GRAMMAR',
);
assert.equal(antichain.rows.length, 4);
for (const row of antichain.rows) {
  assert.equal(row.passed, true, `${row.source_season} frontier family must pass the symbolic antichain obstruction.`);
  assert.equal(row.period_two_frontier_question_identity, true);
  assert.equal(row.supports_disjoint, true);
  assert.equal(row.positive_multiple_of_four_ticks_changes_middle_coordinates, true);
}

const simplex = result.common_future_simplex;
assert.equal(simplex.passed, true);
assert.equal(simplex.arbitrary_equal_target_reduction, true);
assert.equal(simplex.injectivity.passed, true);
assert.equal(simplex.surjectivity.passed, true);
assert.equal(simplex.factorization.passed, true);
assert.equal(simplex.frontier_identification.inherited_from_parent_reconvergence_family, true);
assert.equal(simplex.classification, 'ALL_FORMAL_COMMON_FUTURES_PARAMETERIZED_BY_NONNEGATIVE_INTEGER_SIMPLEX');
assert.equal(simplex.rows.length, 4);
for (const row of simplex.rows) assert.equal(row.passed, true);

// Exact combinatorial controls. These exercise the closed-form/simplex code at
// horizons not used by the parent census without evaluating a single T/Q path.
const expectedCounts = new Map([
  [2, 1],
  [3, 4],
  [4, 10],
  [5, 20],
  [6, 35],
  [7, 56],
  [12, 286],
  [20, 1330],
]);
for (const [H, expected] of expectedCounts) {
  assert.equal(simplexClosedFormCount(H), expected, `C(H+1,3) closed form must hold at H=${H}.`);
  assert.equal(simplexParametersThroughHorizon(H).length, expected, `Integer simplex cardinality must match the closed form at H=${H}.`);
}
assert.deepEqual(simplexParametersThroughHorizon(1), []);
assert.equal(simplexClosedFormCount(1), null);

const h2 = simplexParametersThroughHorizon(2);
assert.deepEqual(h2, [{
  k_opposite_phase_questions: 0,
  a_extra_ticks: 0,
  b_extra_source_phase_questions: 0,
}]);
const h3Frontier = simplexParametersThroughHorizon(3).filter((row) => row.a_extra_ticks === 0 && row.b_extra_source_phase_questions === 0);
assert.deepEqual(h3Frontier.map((row) => row.k_opposite_phase_questions), [0, 1]);

assert.equal(result.all_H_consequences.domain, 'formal integer H >= 2 under the parent per-child continuation-horizon convention');
assert.equal(result.all_H_consequences.parameter_set, 'P_H = {(k,a,b) in N^3 : k+a+b <= H-2}');
assert.equal(result.all_H_consequences.common_future_count, 'C(H+1,3)');
assert.equal(result.all_H_consequences.minimal_frontier, '{(k,0,0) : 0 <= k <= H-2}');
assert.equal(result.all_H_consequences.minimal_frontier_width, 'H-1');
assert.equal(result.all_H_consequences.frontier_pairwise_incomparable, true);
assert.equal(result.all_H_consequences.minimum_total_continuation_cost, 4);
assert.equal(result.all_H_consequences.H8_enumeration_used, false);
assert.equal(result.all_H_consequences.larger_horizon_enumeration_used, false);
assert.match(result.all_H_consequences.least_common_future.H_equals_2, /least/);
assert.match(result.all_H_consequences.least_common_future.H_at_least_3, /none/);

const controls = result.retrospective_controls;
assert.equal(controls.passed, true);
assert.deepEqual(controls.horizons, [4, 5, 6, 7]);
assert.equal(controls.maximum_enumerated_control_horizon, 7);
assert.equal(controls.h8_or_larger_enumerated, false);
assert.equal(controls.rows.length, 44);
for (const row of controls.rows) {
  assert.equal(row.passed, true, `${row.source_node_id} H${row.horizon} must match the already-witnessed parent common-future set exactly.`);
  assert.equal(row.all_routes_within_horizon, true);
  assert.equal(row.all_realizations_equal, true);
  assert.equal(row.injection_control, true);
  assert.equal(row.exact_parent_common_set_match, true);
  assert.equal(row.exact_parent_frontier_set_match, true);
  assert.equal(row.count_matches_closed_form, true);
  assert.equal(row.frontier_width_matches_H_minus_one, true);
  assert.equal(row.generated_unique_target_count, row.parent_common_future_count);
  assert.equal(row.generated_frontier_count, row.parent_minimal_frontier_count);
}

assert.equal(result.season_dependence.source_season_erased, false);
assert.equal(result.season_dependence.endpoint_templates_remain_season_conditioned, true);
assert.equal(result.season_dependence.same_count_does_not_imply_source_independent_geometry, true);
assert.equal(result.route_provenance.erased, false);
assert.equal(result.route_provenance.target_parameterization_is_not_route_identity, true);
assert.equal(result.parent_custody_unchanged, true);
assert.equal(result.parent_custody_classification, 'PARENT_718_720_723_724_CUSTODY_UNCHANGED');

for (const [claim, value] of Object.entries(result.claim_ceiling)) {
  assert.equal(value, false, `${claim} must remain outside the symbolic frontier-completeness chamber.`);
}
assert.equal(result.stop, 'HUMAN_𝄐_REQUIRED_BEFORE_ANY_FINITE_CONTROL_QUOTIENT_OR_REWRITE_SYSTEM_AUDITION');

console.log('A15-R0 symbolic frontier-completeness summary:', JSON.stringify({
  equalizer_cycle: equalizer.four_tick_cycle_endpoint_delta,
  simplex: {
    parameter_set: result.all_H_consequences.parameter_set,
    count: result.all_H_consequences.common_future_count,
    frontier: result.all_H_consequences.minimal_frontier,
    width: result.all_H_consequences.minimal_frontier_width,
  },
  retrospective_controls: controls.rows.map((row) => ({
    source: row.source_node_id,
    season: row.source_season,
    H: row.horizon,
    common: row.generated_unique_target_count,
    frontier: row.generated_frontier_count,
  })),
}));
console.log('Ash A15-R0 Aperture × Pedagogue symbolic frontier-completeness tests passed.');
