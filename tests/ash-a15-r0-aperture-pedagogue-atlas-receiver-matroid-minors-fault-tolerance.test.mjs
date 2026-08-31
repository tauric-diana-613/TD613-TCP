import assert from 'node:assert/strict';
import {
  ATLAS_RECEIVER_MATROID_MINORS_FAULT_TOLERANCE_SCHEMA,
  ATLAS_RECEIVER_MATROID_MINORS_FAULT_TOLERANCE_PARENT_RECEIPT,
  atlasReceiverMatroidMinorsFaultToleranceCertificate,
} from '../app/dome-world/previews/a15-r0/atlas-receiver-matroid-minors-fault-tolerance.js';

assert.equal(ATLAS_RECEIVER_MATROID_MINORS_FAULT_TOLERANCE_SCHEMA,'td613.dome-world.atlas-receiver-matroid-minors-fault-tolerance/v0.1');
assert.equal(ATLAS_RECEIVER_MATROID_MINORS_FAULT_TOLERANCE_PARENT_RECEIPT,'431898a8bc7f14c466f401d71dfe20feaaf7c447');

const c=atlasReceiverMatroidMinorsFaultToleranceCertificate();
assert.equal(c.passed,true);
assert.equal(c.parent_exact,true);
assert.deepEqual(c.ground_set,['q00','q01','q10','q11']);
assert.equal(c.deletion_mask_evaluations,32);

assert.deepEqual(c.D.deletion.rank_preserving_masks,[0,1,2,3,4,5,8,9,10,11,12,13]);
assert.deepEqual(c.D.deletion.rank_destroying_masks,[6,7,14,15]);
assert.deepEqual(c.D.deletion.cocircuit_masks,[6]);
assert.deepEqual(c.D.deletion.rank_preserving_by_size,[1,4,5,2,0]);
assert.deepEqual(c.D.deletion.rank_destroying_by_size,[0,0,1,2,1]);
assert.equal(c.D.deletion.rank_preserving_enumerator,'1 + 4 z + 5 z^2 + 2 z^3');
assert.equal(c.D.deletion.rank_destroying_enumerator,'z^2 + 2 z^3 + z^4');
assert.deepEqual(c.D.deletion.single_deletion_ranks,[1,1,1,1]);
assert.deepEqual(c.D.deletion.coloop_indices,[]);
assert.equal(c.D.deletion.deletion_distance,2);
assert.deepEqual(c.D.deletion_minor_type_frequency,{U_1_2_PLUS_ONE_LOOP:2,U_1_1_PLUS_TWO_LOOPS:2});
assert.deepEqual(c.D.contraction_minor_type_frequency,{U_1_2_PLUS_ONE_LOOP:2,U_0_3:2});

assert.deepEqual(c.Q.deletion.rank_preserving_masks,[0,1,2,4,8,9,10,12]);
assert.deepEqual(c.Q.deletion.rank_destroying_masks,[3,5,6,7,11,13,14,15]);
assert.deepEqual(c.Q.deletion.cocircuit_masks,[3,5,6]);
assert.deepEqual(c.Q.deletion.rank_preserving_by_size,[1,4,3,0,0]);
assert.deepEqual(c.Q.deletion.rank_destroying_by_size,[0,0,3,4,1]);
assert.equal(c.Q.deletion.rank_preserving_enumerator,'1 + 4 z + 3 z^2');
assert.equal(c.Q.deletion.rank_destroying_enumerator,'3 z^2 + 4 z^3 + z^4');
assert.deepEqual(c.Q.deletion.single_deletion_ranks,[2,2,2,2]);
assert.deepEqual(c.Q.deletion.coloop_indices,[]);
assert.equal(c.Q.deletion.deletion_distance,2);
assert.deepEqual(c.Q.deletion_minor_type_frequency,{U_2_2_PLUS_ONE_LOOP:3,U_2_3:1});
assert.deepEqual(c.Q.contraction_minor_type_frequency,{U_1_2_PLUS_ONE_LOOP:3,U_2_3:1});

assert.deepEqual(c.minor_burden,{
  normalization_checks:16,normalization_failures:0,
  rank_upper_bound_checks:128,rank_upper_bound_failures:0,
  monotonicity_candidate_pairs:1024,monotonicity_inclusion_premises:432,monotonicity_failures:0,
  submodularity_pairs:1024,submodularity_failures:0,
  single_element_minors:16,minor_rank_values:128,
});

assert.equal(c.cross_control_bridge.obligations,6);
assert.equal(c.cross_control_bridge.rows.length,6);
assert.equal(c.cross_control_bridge.passed,true);
for(const row of c.cross_control_bridge.rows){
  assert.equal(row.q_contract_type,'U_1_2_PLUS_ONE_LOOP');
  assert.equal(row.d_delete_type,'U_1_2_PLUS_ONE_LOOP');
  assert.equal(row.d_contract_type,'U_1_2_PLUS_ONE_LOOP');
  assert.equal(row.q_contract_isomorphic_d_delete,true);
  assert.equal(row.q_contract_isomorphic_d_contract,true);
}

assert.equal(c.laws.all_single_coordinate_deletions_preserve_full_rank,true);
assert.equal(c.laws.both_deletion_distances_equal_two,true);
assert.equal(c.laws.cocircuit_multiplicity_differs,true);
assert.equal(c.laws.rank_preserving_deletion_enumerators_differ,true);
assert.equal(c.laws.Q_nonloop_contractions_match_D_loop_minors,true);
assert.equal(c.laws.loop_deletion_equals_loop_contraction_in_rank_table,true);
assert.equal(c.laws.D_nonloop_contractions_collapse_to_U_0_3,true);
assert.equal(c.laws.Q_nonloop_contraction_is_parent_D,false);
assert.equal(c.laws.physical_sensor_failure_claimed,false);
assert.equal(c.laws.causal_intervention_claimed,false);
assert.equal(c.laws.physical_reliability_curve_claimed,false);

for(const e of [1,2]){
  assert.equal(c.D.minors.contraction[e].type,'U_0_3');
  assert.equal(c.D.minors.contraction[e].full_rank,0);
}
for(const e of [0,1,2]) assert.equal(c.Q.minors.contraction[e].type,'U_1_2_PLUS_ONE_LOOP');
assert.equal(c.Q.minors.contraction[3].type,'U_2_3');

console.log('Ash A15-R0 Atlas receiver matroid minors fault tolerance canonical passed.');
