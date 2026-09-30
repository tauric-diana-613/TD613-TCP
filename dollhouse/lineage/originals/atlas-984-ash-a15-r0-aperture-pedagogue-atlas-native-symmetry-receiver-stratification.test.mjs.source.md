import assert from 'node:assert/strict';
import {
  ATLAS_NATIVE_SYMMETRY_RECEIVER_STRATIFICATION_SCHEMA,
  ATLAS_NATIVE_SYMMETRY_RECEIVER_STRATIFICATION_PARENT_RECEIPT,
  atlasNativeSymmetryReceiverStratificationCertificate,
} from '../app/dome-world/previews/a15-r0/atlas-native-symmetry-receiver-stratification.js';

const c=atlasNativeSymmetryReceiverStratificationCertificate();
assert.equal(ATLAS_NATIVE_SYMMETRY_RECEIVER_STRATIFICATION_SCHEMA,'td613.dome-world.atlas-native-symmetry-receiver-stratification/v0.1');
assert.equal(ATLAS_NATIVE_SYMMETRY_RECEIVER_STRATIFICATION_PARENT_RECEIPT,'568dbf7ff91c47361a7de9502e17a2d90063093e');
assert.equal(c.parent_exact,true);
assert.deepEqual(c.refinement_reconstruction,{boolean_function_candidates:16,polarization_checks:256,admitted:4,vectors:[[0,0,0,1],[0,0,1,0],[0,1,0,0],[0,1,1,1]]});
assert.equal(c.geometry.binary_matrix_candidates,16);
assert.equal(c.geometry.GL2F2_size,6);
assert.equal(c.geometry.pairing_automorphisms,6);
assert.deepEqual(c.geometry.ambient_pairing_orbit_sizes,[3,1]);
assert.deepEqual(c.arf,{ordered_symplectic_bases:6,checks:24,failures:0,bits:[0,0,0,1]});

assert.equal(c.D.automorphisms,8);
assert.equal(c.D.native_outer_size,2);
assert.equal(c.D.action_checks,8);
assert.deepEqual(c.D.action_count_matrix,[[2,0,0,0],[0,1,1,0],[0,1,1,0],[0,0,0,2]]);
assert.deepEqual(c.D.orbit_sizes,[2,1,1]);
assert.deepEqual(c.D.stabilizer_sizes,[2,1,1,2]);
assert.equal(c.D.family_action_signatures,2);
assert.equal(c.D.signature_pair_checks,1);
assert.equal(c.D.signature_collisions,0);
assert.equal(c.D.arf_partition_equals_native_orbits,false);
assert.equal(c.D.arf_zero_native_orbits,2);
assert.equal(c.D.distinguished_refinement_fixed,2);
assert.deepEqual(c.D.lift_fiber_sizes,[4,4]);
assert.deepEqual(c.D.receiver_class_counts,[8,2,1]);

assert.equal(c.Q.automorphisms,24);
assert.equal(c.Q.native_outer_size,6);
assert.equal(c.Q.action_checks,24);
assert.deepEqual(c.Q.action_count_matrix,[[2,2,2,0],[2,2,2,0],[2,2,2,0],[0,0,0,6]]);
assert.deepEqual(c.Q.orbit_sizes,[3,1]);
assert.deepEqual(c.Q.stabilizer_sizes,[2,2,2,6]);
assert.equal(c.Q.family_action_signatures,6);
assert.equal(c.Q.signature_pair_checks,15);
assert.equal(c.Q.signature_collisions,0);
assert.equal(c.Q.arf_partition_equals_native_orbits,true);
assert.equal(c.Q.arf_zero_native_orbits,1);
assert.equal(c.Q.distinguished_refinement_fixed,6);
assert.deepEqual(c.Q.lift_fiber_sizes,[4,4,4,4,4,4]);
assert.deepEqual(c.Q.receiver_class_counts,[24,6,1]);

assert.equal(c.laws.invariant_completeness_is_admitted_symmetry_relative,true);
assert.equal(c.laws.D_Arf_zero_splits_under_native_liftable_symmetry,true);
assert.equal(c.laws.Q_Arf_partition_exactly_native_orbits,true);
assert.equal(c.laws.complete_refinement_family_faithful_for_D_outer_action,true);
assert.equal(c.laws.complete_refinement_family_faithful_for_Q_outer_action,true);
assert.equal(c.laws.distinguished_native_refinement_collapses_outer_action_D,true);
assert.equal(c.laws.distinguished_native_refinement_collapses_outer_action_Q,true);
assert.equal(c.laws.universal_invariant_completeness_claimed,false);
assert.equal(c.laws.physical_symmetry_claimed,false);
assert.equal(c.passed,true);

console.log('Ash A15-R0 Atlas native symmetry receiver stratification canonical contract passed.');