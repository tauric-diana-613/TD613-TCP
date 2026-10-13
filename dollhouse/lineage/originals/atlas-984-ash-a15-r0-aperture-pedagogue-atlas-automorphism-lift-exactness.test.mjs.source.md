import assert from 'node:assert/strict';
import {
  ATLAS_AUTOMORPHISM_LIFT_EXACTNESS_SCHEMA,
  ATLAS_AUTOMORPHISM_LIFT_EXACTNESS_PARENT_RECEIPT,
  atlasAutomorphismLiftExactnessCertificate,
} from '../app/dome-world/previews/a15-r0/atlas-automorphism-lift-exactness.js';

const c=atlasAutomorphismLiftExactnessCertificate();
assert.equal(ATLAS_AUTOMORPHISM_LIFT_EXACTNESS_SCHEMA,'td613.dome-world.atlas-automorphism-lift-exactness/v0.1');
assert.equal(ATLAS_AUTOMORPHISM_LIFT_EXACTNESS_PARENT_RECEIPT,'fb4f10524d4f93c35fc4d1a48c6b86c6f5aa1487');
assert.equal(c.parent_exact,true);
assert.deepEqual(c.exhaustive_census,{per_group_permutation_candidates:40320,total_permutation_candidates:80640,per_group_multiplication_checks:2580480,total_multiplication_checks:5160960});
assert.equal(c.D.group_size,8);
assert.equal(c.D.automorphisms,8);
assert.equal(c.D.inner_unique,4);
assert.equal(c.D.pairing_automorphisms,6);
assert.equal(c.D.orthogonal_stabilizer,2);
assert.equal(c.D.quotient_action_image,2);
assert.equal(c.D.quotient_action_kernel,4);
assert.deepEqual(c.D.lift_fiber_sizes,[4,4]);
assert.equal(c.D.image_equals_orthogonal,true);
assert.equal(c.D.kernel_equals_inner,true);
assert.equal(c.D.nonquadratic_pairing_automorphisms,4);
assert.equal(c.D.nonquadratic_lifts,0);
assert.equal(c.Q.group_size,8);
assert.equal(c.Q.closure_products,64);
assert.equal(c.Q.closure_escapes,0);
assert.equal(c.Q.automorphisms,24);
assert.equal(c.Q.inner_unique,4);
assert.equal(c.Q.pairing_automorphisms,6);
assert.equal(c.Q.orthogonal_stabilizer,6);
assert.equal(c.Q.quotient_action_image,6);
assert.equal(c.Q.quotient_action_kernel,4);
assert.deepEqual(c.Q.lift_fiber_sizes,[4,4,4,4,4,4]);
assert.equal(c.Q.image_equals_orthogonal,true);
assert.equal(c.Q.kernel_equals_inner,true);
assert.deepEqual(c.D.q,[0,0,0,1]);
assert.deepEqual(c.Q.q,[0,1,1,1]);
assert.equal(c.geometry.GL2F2_size,6);
assert.deepEqual(c.geometry.D_beta,c.geometry.Q_beta);
assert.equal(c.laws.D_exact_sequence,true);
assert.equal(c.laws.Q_exact_sequence,true);
assert.equal(c.laws.D_quadratic_preservation_exact_liftability_obstruction,true);
assert.equal(c.laws.every_D_orthogonal_map_has_four_lifts,true);
assert.equal(c.laws.every_Q_orthogonal_map_has_four_lifts,true);
assert.equal(c.laws.universal_extension_lift_theorem_claimed,false);
assert.equal(c.laws.physical_symmetry_claimed,false);
assert.equal(c.passed,true);

console.log('Ash A15-R0 Atlas automorphism lift exactness canonical contract passed.');
