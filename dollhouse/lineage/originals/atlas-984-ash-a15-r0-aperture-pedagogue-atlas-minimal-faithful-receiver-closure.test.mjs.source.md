import assert from 'node:assert/strict';
import {
  ATLAS_MINIMAL_FAITHFUL_RECEIVER_CLOSURE_SCHEMA,
  ATLAS_MINIMAL_FAITHFUL_RECEIVER_CLOSURE_PARENT_RECEIPT,
  atlasMinimalFaithfulReceiverClosureCertificate,
} from '../app/dome-world/previews/a15-r0/atlas-minimal-faithful-receiver-closure.js';

const c=atlasMinimalFaithfulReceiverClosureCertificate();
assert.equal(ATLAS_MINIMAL_FAITHFUL_RECEIVER_CLOSURE_SCHEMA,'td613.dome-world.atlas-minimal-faithful-receiver-closure/v0.1');
assert.equal(ATLAS_MINIMAL_FAITHFUL_RECEIVER_CLOSURE_PARENT_RECEIPT,'b56e7bbea41e93bdc9f9d59e053be4733a1d5e41');
assert.equal(c.parent_exact,true);
assert.equal(c.refinement_count,4);
assert.equal(c.subset_count,16);
assert.deepEqual(c.geometry,{GL2F2_size:6,pairing_automorphisms:6,D_native_size:2,Q_native_size:6});
assert.deepEqual(c.burden,{subset_receiver_signature_checks:128,subset_signature_pair_checks:256,closure_ordered_pair_checks:2560});

assert.equal(c.D.receiver_separation_rank,1);
assert.deepEqual(c.D.minimum_faithful_masks,[2,4]);
assert.equal(c.D.faithful_subset_count,12);
assert.deepEqual(c.D.receiver_class_frequency,{'1':4,'2':12});
assert.deepEqual(c.D.closure_size_frequency,{'2':4,'4':12});
assert.deepEqual(c.D.empty_closure,[0,3]);
assert.deepEqual(c.D.rows.map(r=>r.class_count),[1,1,2,2,2,2,2,2,1,1,2,2,2,2,2,2]);
assert.deepEqual(c.D.rows[0].automorphism_fiber_sizes,[8]);
assert.deepEqual(c.D.rows[2].automorphism_fiber_sizes,[4,4]);
assert.deepEqual(c.D.rows[1].closure,[0,3]);
assert.deepEqual(c.D.rows[2].closure,[0,1,2,3]);

assert.equal(c.Q.receiver_separation_rank,2);
assert.deepEqual(c.Q.minimum_faithful_masks,[3,5,6]);
assert.equal(c.Q.faithful_subset_count,8);
assert.deepEqual(c.Q.receiver_class_frequency,{'1':2,'3':6,'6':8});
assert.deepEqual(c.Q.closure_size_frequency,{'1':2,'2':6,'4':8});
assert.deepEqual(c.Q.empty_closure,[3]);
assert.deepEqual(c.Q.rows.map(r=>r.class_count),[1,3,3,6,3,6,6,6,1,3,3,6,3,6,6,6]);
assert.deepEqual(c.Q.rows[0].automorphism_fiber_sizes,[24]);
assert.deepEqual(c.Q.rows[1].automorphism_fiber_sizes,[8,8,8]);
assert.deepEqual(c.Q.rows[3].automorphism_fiber_sizes,[4,4,4,4,4,4]);
assert.deepEqual(c.Q.rows[1].closure,[0,3]);
assert.deepEqual(c.Q.rows[2].closure,[1,3]);
assert.deepEqual(c.Q.rows[4].closure,[2,3]);
assert.deepEqual(c.Q.rows[3].closure,[0,1,2,3]);

assert.equal(c.D.index_law_failures,0);
assert.equal(c.Q.index_law_failures,0);
assert.equal(c.D.closure_fixedset_failures,0);
assert.equal(c.Q.closure_fixedset_failures,0);
assert.equal(c.laws.D_minimal_faithful_receiver_rank_one,true);
assert.equal(c.laws.Q_minimal_faithful_receiver_rank_two,true);
assert.equal(c.laws.minimal_receiver_rank_native_symmetry_dependent,true);
assert.equal(c.laws.receiver_class_count_equals_pointwise_stabilizer_index,true);
assert.equal(c.laws.receiver_closure_equals_pointwise_stabilizer_fixed_set,true);
assert.equal(c.laws.globally_fixed_refinements_can_enter_empty_closure_without_outer_identifiability,true);
assert.equal(c.laws.native_receiver_rank_equated_to_action_evaluation_rank,false);
assert.equal(c.laws.physical_sensor_minimum_claimed,false);
assert.equal(c.laws.shannon_capacity_theorem_claimed,false);
assert.equal(c.passed,true);

console.log('Ash A15-R0 Atlas minimal faithful receiver closure canonical contract passed.');