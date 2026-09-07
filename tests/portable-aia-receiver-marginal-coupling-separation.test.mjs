import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  PORTABLE_AIA_RECEIVER_MARGINAL_COUPLING_SEPARATION_ASSAY_SCHEMA,
  RECEIVER_COUPLING_MU0,
  RECEIVER_COUPLING_MU1,
  RECEIVER_COUPLING_TOTAL_WEIGHT,
  runPortableAiaReceiverMarginalCouplingSeparationAssay
} from '../scripts/portable-aia-receiver-marginal-coupling-separation-assay.mjs';

const report = runPortableAiaReceiverMarginalCouplingSeparationAssay();
assert.equal(report.schema, PORTABLE_AIA_RECEIVER_MARGINAL_COUPLING_SEPARATION_ASSAY_SCHEMA);
assert.equal(report.status, 'PASS');
assert.equal(report.assay_local_only, true);
assert.equal(RECEIVER_COUPLING_TOTAL_WEIGHT, 84);
assert.equal(report.parent_structure.canonical_projection_count, 21);
assert.equal(report.parent_structure.meet_class_count, 21);
assert.equal(report.parent_structure.meet_singleton_class_count, 21);
assert.equal(report.parent_structure.join_class_count, 1);
assert.equal(report.parent_structure.generated_sublattice_element_count, 4);
assert.equal(report.parent_structure.generated_sublattice_B2, true);
assert.equal(report.parent_structure.measure_free_structure_unchanged, true);

assert.deepEqual(RECEIVER_COUPLING_MU0, Array.from({length:7}, () => [4,4,4]));
assert.deepEqual(RECEIVER_COUPLING_MU1, [[5,3,4],[3,5,4],[4,4,4],[4,4,4],[4,4,4],[4,4,4],[4,4,4]]);
for (const measure of [report.measures.mu0, report.measures.mu1]) {
  assert.equal(measure.total, 84);
  assert.deepEqual(measure.row_sums, [12,12,12,12,12,12,12]);
  assert.deepEqual(measure.column_sums, [28,28,28]);
  assert.equal(measure.full_support, true);
  assert.equal(measure.positive_cell_count, 21);
}

assert.equal(report.measures.mu0.exact_independence.exact_integer_test, true);
assert.equal(report.measures.mu0.exact_independence.independent, true);
assert.equal(report.measures.mu0.exact_independence.violation_count, 0);
assert.equal(report.measures.mu1.exact_independence.exact_integer_test, true);
assert.equal(report.measures.mu1.exact_independence.independent, false);
assert.equal(report.measures.mu1.exact_independence.violation_count, 4);
assert.deepEqual(report.measures.mu1.exact_independence.violations, [
  {row:0,column:0},{row:0,column:1},{row:1,column:0},{row:1,column:1}
]);
for (const cell of report.measures.mu0.exact_independence.cells) {
  assert.equal(cell.observed_cross_product, cell.factorized_cross_product);
}
assert.deepEqual(
  report.measures.mu1.exact_independence.cells.filter(cell => !cell.independent).map(cell => [cell.row,cell.column]),
  [[0,0],[0,1],[1,0],[1,1]]
);

assert.equal(report.receiver_marginals.policy_identical, true);
assert.equal(report.receiver_marginals.boundary_identical, true);
assert.deepEqual(report.receiver_marginals.policy_vector, [12,12,12,12,12,12,12]);
assert.deepEqual(report.receiver_marginals.boundary_vector, [28,28,28]);
assert.equal(report.receiver_marginals.either_single_receiver_marginal_distinguishes_measures, false);
assert.equal(report.joint_coupling.paired_receiver_joint_table_distinguishes_measures, true);
assert.equal(report.joint_coupling.changed_cell_count, 4);
assert.equal(report.joint_coupling.mu0_independent, true);
assert.equal(report.joint_coupling.mu1_independent, false);

assert.equal(report.exact_separation.l1_weight_numerator, 4);
assert.equal(report.exact_separation.common_total_weight, 84);
assert.deepEqual(report.exact_separation.total_variation, {numerator:1,denominator:42});
assert.deepEqual(report.exact_separation.e_plus_cells, [{row:0,column:0},{row:1,column:1}]);
assert.equal(report.exact_separation.e_plus_mu0_weight, 8);
assert.equal(report.exact_separation.e_plus_mu1_weight, 10);
assert.deepEqual(report.exact_separation.e_plus_difference, {numerator:1,denominator:42});
assert.equal(report.exact_separation.e_plus_attains_tv_bound, true);
assert.equal(report.exact_separation.floating_point_authority, false);

assert.equal(report.hostile_semantic_relabel.position_weights_unchanged, true);
assert.equal(report.hostile_semantic_relabel.semantic_identity_mapping_unchanged, false);
assert.equal(report.hostile_semantic_relabel.semantic_identity_mismatch_count, 2);
assert.equal(report.hostile_semantic_relabel.positional_weight_equality_is_semantic_equivalence, false);

for (const key of [
  'partition_complementarity_implies_statistical_independence',
  'same_receiver_marginals_imply_same_joint_coupling',
  'full_support_implies_independence',
  'statistical_independence_claimed_for_real_td613_observations',
  'empirical_user_distribution_claimed',
  'causal_dependence_claimed',
  'production_probability_model_added',
  'new_production_receiver_added',
  'product_source_mutated',
  'counts_as_exogenous_witness'
]) assert.equal(report[key], false, `${key} must remain false`);
assert.equal(report.golden_egg_credit, 0);
assert.equal(report.authority.release_authority, false);
assert.equal(report.authority.provider_call_performed, false);
assert.equal(report.authority.production_mutation, false);
assert.equal(report.authority.human_closure_required, true);
assert.equal(report.claim_ceiling, 'exact-current-21-cell-synthetic-same-marginal-distinct-joint-coupling-counterexample-only');

const assaySource = fs.readFileSync('scripts/portable-aia-receiver-marginal-coupling-separation-assay.mjs', 'utf8');
const prereg = fs.readFileSync('docs/pedagogue/experiments/PORTABLE_AIA_RECEIVER_MARGINAL_COUPLING_SEPARATION_V0_1_PREREGISTRATION_20260907.md', 'utf8');
const portableSource = fs.readFileSync('app/dome-world/portable-aia-three-route-invariance.js', 'utf8');
assert.match(assaySource, /cell\.weight|observed_cross_product/);
assert.match(assaySource, /observedCrossProduct === factorizedCrossProduct/);
assert.match(assaySource, /floating_point_authority:false/);
assert.doesNotMatch(assaySource, /mutualInformation|Math\.log|Math\.log2|entropy/i);
assert.match(prereg, /PARTITION_COMPLEMENTARITY != STATISTICAL_INDEPENDENCE/);
assert.match(prereg, /ONE_EXACT_COUNTEREXAMPLE != ENTITLEMENT_TO_MEASURE_ENUMERATION/);
assert.match(prereg, /NO 𝄐 YET/);
assert.match(portableSource, /PORTABLE_AIA_ATLAS_RECEIVERS/);
assert.doesNotMatch(assaySource, /PORTABLE_AIA_ATLAS_RECEIVERS\.push|COMBINED_RECEIVER|PROBABILITY_RECEIVER/);

console.log('Portable AIA receiver-marginal coupling separation hostile contract: PASS');
