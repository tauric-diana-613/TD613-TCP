import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  HOSTILE_SAME_MARGINAL_INTERSECTION_MATRIX,
  PORTABLE_AIA_ATLAS_CROSSCUTTING_RECEIVER_LATTICE_ASSAY_SCHEMA,
  PORTABLE_AIA_ATLAS_CROSSCUTTING_ROUTE_MODES,
  PORTABLE_AIA_ATLAS_CROSSCUTTING_RULE_IDS,
  runPortableAiaAtlasCrosscuttingReceiverLatticeAssay
} from '../scripts/portable-aia-atlas-crosscutting-receiver-lattice-assay.mjs';

const report = runPortableAiaAtlasCrosscuttingReceiverLatticeAssay();

assert.equal(report.schema, PORTABLE_AIA_ATLAS_CROSSCUTTING_RECEIVER_LATTICE_ASSAY_SCHEMA);
assert.equal(report.status, 'PASS');
assert.equal(report.assay_local_only, true);
assert.equal(PORTABLE_AIA_ATLAS_CROSSCUTTING_RULE_IDS.length, 7);
assert.equal(PORTABLE_AIA_ATLAS_CROSSCUTTING_ROUTE_MODES.length, 3);
assert.equal(report.domain.canonical_projection_count, 21);
assert.equal(new Set(report.domain.point_ids).size, 21);

assert.equal(report.policy_partition.class_count, 7);
assert.deepEqual(report.policy_partition.class_size_spectrum, { 3: 7 });
assert.ok(report.policy_partition.classes.every(entry => entry.members.length === 3));
assert.equal(report.boundary_partition.class_count, 3);
assert.deepEqual(report.boundary_partition.class_size_spectrum, { 7: 3 });
assert.ok(report.boundary_partition.classes.every(entry => entry.members.length === 7));

assert.equal(report.incomparability.policy_refines_boundary, false);
assert.equal(report.incomparability.boundary_refines_policy, false);
assert.equal(report.incomparability.witnesses.policy_not_refines_boundary.policy_equivalent, true);
assert.equal(report.incomparability.witnesses.policy_not_refines_boundary.boundary_equivalent, false);
assert.equal(report.incomparability.witnesses.boundary_not_refines_policy.boundary_equivalent, true);
assert.equal(report.incomparability.witnesses.boundary_not_refines_policy.policy_equivalent, false);

assert.equal(report.meet.class_count, 21);
assert.equal(report.meet.singleton_class_count, 21);
assert.equal(report.meet.intersection_table.length, 7);
assert.ok(report.meet.intersection_table.every(row => row.length === 3));
assert.ok(report.meet.intersection_table.flat().every(cell => cell.size === 1 && cell.members.length === 1));
assert.equal(report.meet.paired_existing_receiver_keys_injective, true);

assert.equal(report.join.class_count, 1);
assert.equal(report.join.classes.length, 1);
assert.equal(report.join.classes[0].length, 21);
assert.equal(report.join.policy_union_edges, 21);
assert.equal(report.join.boundary_union_edges, 63);

assert.equal(report.ordered_pair_census.ordered_pair_controls, 441);
assert.equal(report.ordered_pair_census.policy_equivalent_ordered_pairs, 63);
assert.equal(report.ordered_pair_census.boundary_equivalent_ordered_pairs, 147);
assert.equal(report.ordered_pair_census.meet_equivalent_ordered_pairs, 21);
assert.equal(report.ordered_pair_census.paired_existing_receiver_key_count, 21);

assert.deepEqual(report.marginal_arithmetic, {
  policy_block_count: 7,
  policy_block_size: 3,
  boundary_block_count: 3,
  boundary_block_size: 7,
  universe_size: 21,
  gcd_block_sizes: 1,
  lcm_block_sizes: 21,
  incomparability_forced_by_uniform_block_sizes: true,
  universal_join_forced_by_coprime_uniform_block_sizes: true,
  discrete_meet_forced_by_marginals: false
});

assert.deepEqual(HOSTILE_SAME_MARGINAL_INTERSECTION_MATRIX, [
  [3,0,0],
  [3,0,0],
  [1,2,0],
  [0,3,0],
  [0,2,1],
  [0,0,3],
  [0,0,3]
]);
assert.deepEqual(report.hostile_same_marginal_countercontrol.row_sums, [3,3,3,3,3,3,3]);
assert.deepEqual(report.hostile_same_marginal_countercontrol.column_sums, [7,7,7]);
assert.equal(report.hostile_same_marginal_countercontrol.nonempty_intersections, 9);
assert.equal(report.hostile_same_marginal_countercontrol.maximum_intersection_size, 3);
assert.equal(report.hostile_same_marginal_countercontrol.same_uniform_marginals_as_canonical, true);
assert.equal(report.hostile_same_marginal_countercontrol.discrete_meet, false);

assert.deepEqual(report.generated_sublattice.elements, [
  'DISCRETE_21', 'POLICY_ONLY', 'BOUNDARY_AWARE', 'UNIVERSAL_21'
]);
assert.equal(report.generated_sublattice.element_count, 4);
assert.equal(report.generated_sublattice.order_isomorphic_to_B2, true);
assert.equal(report.generated_sublattice.full_partition_lattice_classified, false);

for (const key of [
  'existing_receiver_code_modified',
  'new_production_receiver_added',
  'route_label_injected_as_key',
  'presentation_injected_as_key',
  'raw_source_used',
  'statistical_independence_claimed',
  'shannon_claimed',
  'causal_independence_claimed',
  'physical_orthogonality_claimed',
  'external_truth_claimed',
  'counts_as_exogenous_witness'
]) assert.equal(report[key], false, `${key} must remain false`);
assert.equal(report.golden_egg_credit, 0);
assert.equal(report.authority.release_authority, false);
assert.equal(report.authority.provider_call_performed, false);
assert.equal(report.authority.production_mutation, false);
assert.equal(report.authority.human_closure_required, true);
assert.equal(report.claim_ceiling, 'exact-current-7x3-portable-aia-two-receiver-generated-partition-sublattice-only');

const portableSource = fs.readFileSync('app/dome-world/portable-aia-three-route-invariance.js', 'utf8');
const assaySource = fs.readFileSync('scripts/portable-aia-atlas-crosscutting-receiver-lattice-assay.mjs', 'utf8');
const preregistration = fs.readFileSync(
  'docs/pedagogue/experiments/PORTABLE_AIA_ATLAS_CROSSCUTTING_RECEIVER_LATTICE_V0_1_PREREGISTRATION_20260907.md',
  'utf8'
);
const correction = fs.readFileSync(
  'docs/pedagogue/experiments/PORTABLE_AIA_ATLAS_CROSSCUTTING_RECEIVER_LATTICE_V0_1_PREREGISTRATION_CORRECTION_20260907.md',
  'utf8'
);

assert.match(portableSource, /export const PORTABLE_AIA_ATLAS_RECEIVERS = Object\.freeze\(\[\n  'POLICY_ONLY',\n  'BOUNDARY_AWARE'\n\]\);/);
assert.match(portableSource, /return receiverToken === 'POLICY_ONLY'\n    \? policyReceiverKey\(projection\)\n    : boundaryReceiverKey\(projection\);/);
assert.match(portableSource, /route_label_used_in_key: false/);
assert.match(portableSource, /presentation_used_in_key: false/);
assert.match(portableSource, /raw_source_used_in_key: false/);
assert.doesNotMatch(assaySource, /PORTABLE_AIA_ATLAS_RECEIVERS\.push|POLICY_X_BOUNDARY|COMBINED_RECEIVER/);
assert.match(assaySource, /paired_existing_receiver_key_count/);
assert.match(assaySource, /generated receiver join is not universal/);
assert.match(assaySource, /canonical receiver meet is not discrete/);

assert.match(preregistration, /CROSS_CUTTING_RECEIVERS != RECEIVER_HIERARCHY/);
assert.match(preregistration, /GENERATED_B2 != FULL_PARTITION_LATTICE/);
assert.match(preregistration, /NO 𝄐 YET/);
assert.match(correction, /UNIFORM_BLOCK_MARGINALS_CAN_FORCE_INCOMPARABILITY_AND_UNIVERSAL_JOIN/);
assert.match(correction, /UNIFORM_BLOCK_MARGINALS_DO_NOT_FORCE_DISCRETE_MEET/);
assert.match(correction, /DISCRETE_MEET_REQUIRES_EXACT_INTERSECTION_STRUCTURE/);
assert.match(correction, /Counterexample intersection matrix/);

console.log('Portable AIA × Atlas cross-cutting receiver partition lattice hostile contract: PASS');

// #1073 adds a synthetic measure on the already-earned 21 semantic cells. Equal
// one-receiver marginals must not be promoted to joint equality or independence.
await import('./portable-aia-receiver-marginal-coupling-separation.test.mjs');
