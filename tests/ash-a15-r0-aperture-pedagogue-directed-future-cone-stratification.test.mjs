import assert from 'node:assert/strict';

import {
  DIRECTED_FUTURE_CONE_STRATIFICATION_SCHEMA,
  runDirectedFutureConeStratificationAssay,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-directed-future-cone-stratification.js';

const result = runDirectedFutureConeStratificationAssay();

assert.equal(result.schema, DIRECTED_FUTURE_CONE_STRATIFICATION_SCHEMA);
assert.equal(result.passed, true, 'The preregistered directed future-cone stratification assay must complete without forcing any positive pattern outcome.');
assert.equal(result.status, 'DIRECTED_FUTURE_CONE_STRATIFICATION_ROUND_CLOSED');
assert.equal(result.reconvergent_fork_count, 11);
assert.equal(result.h7_preregistered_word_count_per_child, 255);
assert.equal(result.fork_audits.length, 11);
assert.equal(result.parent_custody_unchanged, true);
assert.equal(result.parent_custody_classification, 'PARENT_718_719_720_722_CUSTODY_UNCHANGED');
assert.equal(
  result.canonical_classification,
  'FINITE_H4_H7_DIRECTED_MINIMAL_COMMON_FUTURE_FRONTIER_STRATIFICATION_WITH_PROSPECTIVE_H7_EXTENSION',
);

for (const fork of result.fork_audits) {
  assert.equal(fork.passed, true, `${fork.source_node_id} must complete the H4-H7 stratification audit.`);
  assert.equal(fork.h7.passed, true, `${fork.source_node_id} H7 enumeration/order must pass.`);
  assert.equal(fork.h7.horizon, 7);
  assert.equal(fork.h7.continuation_word_count, 255);
  assert.equal(fork.h7.order_checks.reflexive, true);
  assert.equal(fork.h7.order_checks.antisymmetric, true);
  assert.equal(fork.h7.order_checks.transitive, true);
  assert.deepEqual(fork.horizons.map((row) => row.horizon), [4, 5, 6, 7]);
  assert.equal(fork.analyses.length, 4);
  assert.equal(fork.count_rows.length, 4);

  for (const row of fork.count_rows) {
    assert.ok(row.common_future_count > 0);
    assert.ok(row.minimal_frontier_width > 0);
    assert.ok(row.least_count >= 0);
    assert.ok(row.minimum_join_cost >= 0);
    assert.equal(typeof row.width_matches_H_minus_1, 'boolean');
    assert.equal(typeof row.common_count_matches_binomial, 'boolean');
  }

  for (const analysis of fork.analyses) {
    assert.ok(analysis.frontier_width > 0);
    assert.equal(analysis.strata.length, analysis.frontier_width);
    assert.equal(analysis.question_lineage_increments.length, analysis.frontier_width);
    assert.equal(typeof analysis.consecutive_question_lineage, 'boolean');
    assert.equal(typeof analysis.one_based_question_lineage_interval, 'boolean');
    assert.equal(typeof analysis.frontier_preserves_source_phase, 'boolean');
    assert.equal(typeof analysis.frontier_is_source_plus_two_seasons, 'boolean');
    assert.equal(typeof analysis.unit_single_coordinate_stratification, 'boolean');
    assert.equal(typeof analysis.matches_opposite_phase_question_coordinate, 'boolean');
    assert.equal(typeof analysis.route_normal_form_matches, 'boolean');
    assert.equal(typeof analysis.affine_cost_matches_2k_plus_4, 'boolean');
    assert.equal(typeof analysis.pairwise_antichain, 'boolean');
  }
}

const patterns = result.h4_h7_pattern_results;
for (const key of [
  'minimal_frontier_width_matches_H_minus_one',
  'common_future_count_matches_binomial',
  'question_lineage_consecutive',
  'frontier_preserves_source_phase',
  'frontier_is_source_plus_two_seasons',
  'opposite_phase_coordinate_stratification',
  'route_normal_form',
  'affine_cost',
  'antichain_persistence',
  'source_relative_profiles_identical',
]) {
  assert.equal(typeof patterns[key], 'boolean', `${key} must report measured truth rather than remain implicit.`);
}

assert.equal(result.classifications.length, 10);
assert.equal(
  result.classifications[0],
  patterns.minimal_frontier_width_matches_H_minus_one
    ? 'MINIMAL_FRONTIER_WIDTH_MATCHES_H_MINUS_ONE_THROUGH_H7'
    : 'MINIMAL_FRONTIER_WIDTH_PATTERN_BREAKS_BY_H7',
);
assert.equal(
  result.classifications[1],
  patterns.common_future_count_matches_binomial
    ? 'COMMON_FUTURE_COUNT_MATCHES_BINOMIAL_C_H_PLUS_1_CHOOSE_3_THROUGH_H7'
    : 'COMMON_FUTURE_COUNT_BINOMIAL_PATTERN_BREAKS_BY_H7',
);
assert.equal(
  result.classifications[2],
  patterns.question_lineage_consecutive
    ? 'MINIMAL_COMMON_FUTURE_FRONTIER_IS_CONSECUTIVELY_STRATIFIED_BY_QUESTION_LINEAGE_DEPTH'
    : 'QUESTION_LINEAGE_STRATIFICATION_NOT_UNIFORM_THROUGH_H7',
);
assert.equal(
  result.classifications[3],
  patterns.frontier_preserves_source_phase
    ? 'MINIMAL_FRONTIER_PRESERVES_SOURCE_PHASE'
    : 'MINIMAL_FRONTIER_PHASE_ANCHOR_BREAKS',
);
assert.equal(
  result.classifications[4],
  patterns.frontier_is_source_plus_two_seasons
    ? 'MINIMAL_FRONTIER_OCCUPIES_SOURCE_PLUS_TWO_FORCING_SEASON'
    : 'MINIMAL_FRONTIER_SEASON_OFFSET_BREAKS',
);
assert.equal(
  result.classifications[5],
  patterns.opposite_phase_coordinate_stratification
    ? 'MINIMAL_FRONTIER_STRATA_ADVANCE_ALONG_OPPOSITE_PHASE_QUESTION_COORDINATE'
    : 'MINIMAL_FRONTIER_ENDPOINT_COORDINATE_PATTERN_BREAKS',
);
assert.equal(
  result.classifications[6],
  patterns.route_normal_form
    ? 'MINIMAL_FRONTIER_ROUTE_NORMAL_FORM_MATCHES_T_QK_TQ_VS_Q_T_QK_T_THROUGH_H7'
    : 'MINIMAL_FRONTIER_ROUTE_NORMAL_FORM_BREAKS_BY_H7',
);
assert.equal(
  result.classifications[7],
  patterns.affine_cost
    ? 'MINIMUM_RECONVERGENCE_COST_MATCHES_AFFINE_STRATUM_INDEX_THROUGH_H7'
    : 'MINIMUM_RECONVERGENCE_COST_AFFINE_PATTERN_BREAKS_BY_H7',
);
assert.equal(
  result.classifications[8],
  patterns.antichain_persistence
    ? 'MINIMAL_COMMON_FUTURE_FRONTIER_REMAINS_AN_ANTICHAIN_THROUGH_H7'
    : 'MINIMAL_FRONTIER_ANTICHAIN_PATTERN_BREAKS_BY_H7',
);
assert.equal(
  result.classifications[9],
  patterns.source_relative_profiles_identical
    ? 'RECONVERGENT_MINIMAL_FRONTIERS_COLLAPSE_TO_COMMON_SOURCE_RELATIVE_STRATIFICATION_PROFILE_THROUGH_H7'
    : 'SOURCE_RELATIVE_MINIMAL_FRONTIER_PROFILES_RETAIN_SEASON_DEPENDENT_STRUCTURE',
);

// Post-witness confirmation layer. Run 2101 established assay execution without
// forcing a positive pattern outcome. Run 2102 then falsified the all-positive
// confirmation. Run 2103 preserved the full measured truth vector as a failed-
// job diagnostic artifact, showing that the sole negative pattern is source-
// relative profile identity. This expectation records that observed break.
const postWitnessExpectedPatterns = {
  minimal_frontier_width_matches_H_minus_one: true,
  common_future_count_matches_binomial: true,
  question_lineage_consecutive: true,
  frontier_preserves_source_phase: true,
  frontier_is_source_plus_two_seasons: true,
  opposite_phase_coordinate_stratification: true,
  route_normal_form: true,
  affine_cost: true,
  antichain_persistence: true,
  source_relative_profiles_identical: false,
};

for (const [key, expected] of Object.entries(postWitnessExpectedPatterns)) {
  assert.equal(patterns[key], expected, `Post-witness H7 confirmation failed for ${key}.`);
}

for (const fork of result.fork_audits) {
  const h7 = fork.count_rows.find((row) => row.horizon === 7);
  assert.ok(h7, `${fork.source_node_id} must expose the preregistered H7 census row.`);
  assert.equal(h7.common_future_count, 56, `${fork.source_node_id} H7 common-future count must match C(8,3).`);
  assert.equal(h7.minimal_frontier_width, 6, `${fork.source_node_id} H7 minimal frontier must match H-1.`);
  assert.equal(h7.least_count, 0, `${fork.source_node_id} H7 bounded least-common-future count must remain zero.`);
  assert.equal(h7.minimum_join_cost, 4, `${fork.source_node_id} H7 minimum total continuation cost must remain four.`);
}

assert.equal(result.claim_ceiling.all_H_recurrence_theorem, false);
assert.equal(result.claim_ceiling.induction_conclusion, false);
assert.equal(result.claim_ceiling.closed_form_beyond_H7, false);
assert.equal(result.claim_ceiling.rewrite_system_theorem, false);
assert.equal(result.claim_ceiling.church_rosser, false);
assert.equal(result.claim_ceiling.global_confluence, false);
assert.equal(result.claim_ceiling.ambient_join_or_lattice, false);
assert.equal(result.claim_ceiling.domain_theory, false);
assert.equal(result.claim_ceiling.fiber_bundle_or_gauge, false);
assert.equal(result.claim_ceiling.transport_or_connection, false);
assert.equal(result.claim_ceiling.holonomy, false);
assert.equal(result.claim_ceiling.curvature, false);
assert.equal(result.claim_ceiling.proto_loom, false);
assert.equal(result.claim_ceiling.a16, false);
assert.equal(result.claim_ceiling.live_ash, false);
assert.equal(result.claim_ceiling.merge, false);
assert.equal(result.claim_ceiling.production, false);
assert.equal(result.claim_ceiling.vercel, false);
assert.equal(result.stop, 'HUMAN_𝄐_QUALIFIED_FOR_SYMBOLIC_RECURRENCE_AND_INDUCTIVE_PROOF_AUDITION');

const h7Summary = result.fork_audits.map((fork) => {
  const row = fork.count_rows.find((candidate) => candidate.horizon === 7);
  return {
    source_node_id: fork.source_node_id,
    common_future_count: row.common_future_count,
    minimal_frontier_width: row.minimal_frontier_width,
    least_count: row.least_count,
    minimum_join_cost: row.minimum_join_cost,
  };
});

console.log('A15-R0 directed future-cone stratification summary:', JSON.stringify({
  h7: h7Summary,
  patterns,
  classifications: result.classifications,
}));
console.log('Ash A15-R0 Aperture × Pedagogue directed future-cone stratification tests passed.');