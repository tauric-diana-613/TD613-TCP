import assert from 'node:assert/strict';

import {
  SEASON_CONDITIONED_SYMBOLIC_NORMAL_FORM_SCHEMA,
  runSeasonConditionedSymbolicNormalFormAssay,
  summarizeSeasonConditionedWord,
  tickDepartureCounts,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-season-conditioned-symbolic-normal-form.js';

const result = runSeasonConditionedSymbolicNormalFormAssay();

assert.equal(result.schema, SEASON_CONDITIONED_SYMBOLIC_NORMAL_FORM_SCHEMA);
assert.equal(result.passed, true, 'The season-conditioned symbolic normal-form proof audition must pass before any proof promotion.');
assert.equal(result.status, 'SEASON_CONDITIONED_SYMBOLIC_NORMAL_FORM_ROUND_CLOSED');
assert.equal(
  result.canonical_classification,
  'FINITE_CONTROL_SEASON_CONDITIONED_SYMBOLIC_NORMAL_FORM_WITH_ALL_FINITE_WORD_STRUCTURAL_INDUCTION_AND_FORMAL_RECONVERGENCE_FAMILY',
);

assert.deepEqual(result.source_domain.source_seasons, ['S0', 'S1', 'S2', 'S3']);
assert.equal(result.source_domain.last_action, 'Q_PHASE_PULSE');
assert.equal(result.source_domain.finite_control_seasons, 4);
assert.equal(result.source_domain.unbounded_integer_counters_retained, true);
assert.equal(result.source_domain.finite_state_automaton_claimed, false);

const expectedDQ = {
  S0: [0, 0, 0, 1],
  S1: [1, 0, 0, 0],
  S2: [0, 0, 0, 1],
  S3: [1, 0, 0, 0],
};
const expectedFQ = {
  S0: [1, 1, 0, 0],
  S1: [0, 0, 1, 1],
  S2: [2, 2, 0, 0],
  S3: [0, 0, 2, 2],
};

assert.deepEqual(result.generator_tables.D_Q, expectedDQ, 'Question deltas must be derived exactly from the parent law.');
assert.deepEqual(result.generator_tables.F_Q, expectedFQ, 'Tick deltas under Q last-action must be derived exactly from the parent period-four law.');
assert.equal(result.generator_tables.period_two_question_delta, true);

assert.equal(result.structural_induction.base.passed, true);
assert.equal(result.structural_induction.T_extension.passed, true);
assert.equal(result.structural_induction.Q_extension.passed, true);
assert.equal(result.structural_induction.structural_induction_earned, true);
assert.equal(
  result.structural_induction.classification,
  'ALL_FINITE_TQ_WORDS_RECONSTRUCT_BY_SEASON_CONDITIONED_NORMAL_FORM_IN_AUTHORED_Q_LAST_ACTION_DOMAIN',
);
assert.equal(result.structural_induction.T_extension.residue_certificate.proofs.length, 16);
for (const proof of result.structural_induction.T_extension.residue_certificate.proofs) {
  assert.equal(proof.passed, true, `${proof.source_season} residue ${proof.residue} must add exactly one tick departure at the current season.`);
  assert.deepEqual(proof.symbolic_m_coefficient_before, [1, 1, 1, 1]);
  assert.deepEqual(proof.symbolic_m_coefficient_after, [1, 1, 1, 1]);
}

// Closed form tick-count controls use large t values without enumerating path words.
assert.deepEqual(tickDepartureCounts('S0', 0), [0, 0, 0, 0]);
assert.deepEqual(tickDepartureCounts('S0', 4), [1, 1, 1, 1]);
assert.deepEqual(tickDepartureCounts('S1', 9), [2, 3, 2, 2]);
assert.deepEqual(tickDepartureCounts('S3', 14), [4, 3, 3, 4]);

const summary = summarizeSeasonConditionedWord('S3', ['Q', 'T', 'Q', 'T', 'T', 'Q']);
assert.equal(summary.status, 'SEASON_CONDITIONED_WORD_SUMMARIZED');
assert.equal(summary.t, 3);
assert.deepEqual(summary.q_by_season, [1, 0, 1, 1]);
assert.equal(summary.q_total, 3);
assert.equal(summary.final_season, 'S2');
assert.equal(summary.final_phase, 'P0');

assert.equal(result.concrete_reconstruction_controls.passed, true);
assert.equal(result.concrete_reconstruction_controls.rows.length, 36);
for (const row of result.concrete_reconstruction_controls.rows) {
  assert.equal(row.equal, true, `${row.source_season} ${row.word.join('')} must reconstruct the exact K_period4 target.`);
}

assert.equal(result.route_provenance_control.passed, true);
assert.equal(result.route_provenance_control.rows.length, 4);
assert.equal(result.route_provenance_control.anti_equivalence, 'SYMBOLIC_TARGET_NORMAL_FORM_IS_NOT_ROUTE_PROVENANCE');
for (const row of result.route_provenance_control.rows) {
  assert.equal(row.words_distinct, true);
  assert.equal(row.target_equal, true, `${row.source_season} full-cycle Q placement must preserve the operational target while route provenance differs.`);
  assert.equal(row.classification, 'DISTINCT_ROUTE_WORDS_COLLAPSE_TO_EQUAL_OPERATIONAL_TARGET_AFTER_FULL_SEASON_CYCLE');
}

const expectedTemplates = {
  S0: { constant: [1, 1, 1, 2], k: [1, 0, 0, 0], final: 'S2' },
  S1: { constant: [3, 2, 1, 1], k: [0, 0, 0, 1], final: 'S3' },
  S2: { constant: [2, 2, 2, 3], k: [1, 0, 0, 0], final: 'S0' },
  S3: { constant: [2, 1, 2, 2], k: [0, 0, 0, 1], final: 'S1' },
};

assert.equal(result.symbolic_reconvergence_family.passed, true);
assert.equal(result.symbolic_reconvergence_family.four_season_conditioned_templates_exposed, true);
assert.equal(
  result.symbolic_reconvergence_family.formal_reconvergence_classification,
  'SEASON_CONDITIONED_SYMBOLIC_RECONVERGENCE_FAMILY_EARNED_FOR_ALL_FORMAL_K_IN_AUTHORED_Q_LAST_ACTION_DOMAIN',
);
assert.equal(result.symbolic_reconvergence_family.rows.length, 4);
for (const row of result.symbolic_reconvergence_family.rows) {
  const expected = expectedTemplates[row.source_season];
  assert.ok(expected);
  assert.equal(row.passed, true);
  assert.equal(row.period_two_question_delta_identity, true);
  assert.equal(row.endpoint_formal_equality, true);
  assert.equal(row.T_count_left, 2);
  assert.equal(row.T_count_right, 2);
  assert.deepEqual(row.Q_lineage_increment_left, { k_coefficient: 1, constant: 1 });
  assert.deepEqual(row.Q_lineage_increment_right, { k_coefficient: 1, constant: 1 });
  assert.deepEqual(row.endpoint_left.constant, expected.constant);
  assert.deepEqual(row.endpoint_right.constant, expected.constant);
  assert.deepEqual(row.endpoint_left.k_coefficient, expected.k);
  assert.deepEqual(row.endpoint_right.k_coefficient, expected.k);
  assert.equal(row.final_season, expected.final);
  assert.equal(row.final_phase, row.source_phase);
}

const consequence = result.symbolic_reconvergence_family.bounded_horizon_consequence;
assert.equal(consequence.domain, 'formal H >= 2');
assert.equal(consequence.k_range, '0 <= k <= H-2');
assert.equal(consequence.explicitly_constructed_common_future_witness_count, 'H-1');
assert.equal(consequence.frontier_completeness_claimed, false);
assert.equal(consequence.minimal_frontier_completeness_claimed, false);
assert.equal(consequence.ambient_common_future_count_formula_claimed, false);

assert.equal(result.season_dependence.forcing_season_erased, false);
assert.equal(result.season_dependence.four_templates_retained, true);
assert.equal(result.season_dependence.source_independent_frontier_profile_claimed, false);
assert.equal(
  result.season_dependence.classification,
  'SAME_SYMBOLIC_RECURRENCE_FAMILY_DOES_NOT_IMPLY_SOURCE_INDEPENDENT_NORMALIZED_FRONTIER_PROFILE',
);
assert.equal(result.parent_custody_unchanged, true);
assert.equal(result.parent_custody_classification, 'PARENT_718_719_720_722_723_CUSTODY_UNCHANGED');

for (const [claim, value] of Object.entries(result.claim_ceiling)) {
  assert.equal(value, false, `${claim} must remain outside this symbolic proof chamber.`);
}
assert.equal(result.stop, 'HUMAN_𝄐_QUALIFIED_FOR_SEPARATE_FRONTIER_COMPLETENESS_OR_FINITE_CONTROL_QUOTIENT_AUDITION');

console.log('A15-R0 season-conditioned symbolic normal-form summary:', JSON.stringify({
  generator_tables: {
    D_Q: result.generator_tables.D_Q,
    F_Q: result.generator_tables.F_Q,
  },
  induction: result.structural_induction.classification,
  route_family: result.symbolic_reconvergence_family.rows.map((row) => ({
    source_season: row.source_season,
    final_season: row.final_season,
    constant: row.endpoint_left.constant,
    k_coefficient: row.endpoint_left.k_coefficient,
  })),
  route_compression: result.route_provenance_control.rows.map((row) => ({
    source_season: row.source_season,
    classification: row.classification,
  })),
}));
console.log('Ash A15-R0 Aperture × Pedagogue season-conditioned symbolic normal-form tests passed.');
