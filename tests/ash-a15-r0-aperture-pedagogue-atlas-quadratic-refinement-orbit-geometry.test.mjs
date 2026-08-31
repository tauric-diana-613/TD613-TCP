import assert from 'node:assert/strict';
import {
  ATLAS_QUADRATIC_REFINEMENT_ORBIT_GEOMETRY_SCHEMA,
  ATLAS_QUADRATIC_REFINEMENT_ORBIT_GEOMETRY_PARENT_RECEIPT,
  atlasQuadraticRefinementOrbitGeometryCertificate,
} from '../app/dome-world/previews/a15-r0/atlas-quadratic-refinement-orbit-geometry.js';

const c=atlasQuadraticRefinementOrbitGeometryCertificate();
assert.equal(ATLAS_QUADRATIC_REFINEMENT_ORBIT_GEOMETRY_SCHEMA,'td613.dome-world.atlas-quadratic-refinement-orbit-geometry/v0.1');
assert.equal(ATLAS_QUADRATIC_REFINEMENT_ORBIT_GEOMETRY_PARENT_RECEIPT,'83a3eff9ceb7f29a3f4d850c36f226dacffc80d0');
assert.equal(c.parent_exact,true);
assert.equal(c.refinement_census.boolean_function_candidates,16);
assert.equal(c.refinement_census.polarization_checks,256);
assert.equal(c.refinement_census.admitted,4);
assert.deepEqual(c.refinement_census.vectors,[[0,0,0,1],[0,0,1,0],[0,1,0,0],[0,1,1,1]]);
assert.equal(c.affine_torsor.linearity_checks,256);
assert.equal(c.affine_torsor.linear_functionals,4);
assert.deepEqual(c.affine_torsor.linear_vectors,[[0,0,0,0],[0,0,1,1],[0,1,0,1],[0,1,1,0]]);
assert.equal(c.affine_torsor.ordered_translation_checks,16);
assert.equal(c.affine_torsor.translation_uniqueness_failures,0);
assert.equal(c.pairing_automorphisms.binary_matrix_candidates,16);
assert.equal(c.pairing_automorphisms.GL2F2_size,6);
assert.equal(c.pairing_automorphisms.pairing_preservers,6);
assert.equal(c.pairing_automorphisms.beta_preservation_cell_checks,96);
assert.equal(c.action.checks,24);
assert.equal(c.action.escapes,0);
assert.deepEqual(c.action.count_matrix,[[2,2,2,0],[2,2,2,0],[2,2,2,0],[0,0,0,6]]);
assert.deepEqual(c.action.orbit_sizes,[3,1]);
assert.deepEqual(c.action.stabilizer_sizes,[2,2,2,6]);
assert.equal(c.arf.ordered_symplectic_bases,6);
assert.equal(c.arf.checks,24);
assert.equal(c.arf.failures,0);
assert.deepEqual(c.arf.bits,[0,0,0,1]);
assert.equal(c.arf.partition_equals_orbit_partition,true);
assert.equal(c.inherited_controls.D_refinement_index,0);
assert.equal(c.inherited_controls.Q_refinement_index,3);
assert.equal(c.inherited_controls.D_Q_same_orbit,false);
assert.equal(c.laws.complete_refinement_family_size_four,true);
assert.equal(c.laws.refinement_family_affine_Vdual_torsor,true);
assert.equal(c.laws.pairing_automorphism_orbit_split_three_plus_one,true);
assert.equal(c.laws.Arf_exactly_classifies_declared_orbits,true);
assert.equal(c.laws.D_and_Q_refinements_in_distinct_pairing_automorphism_orbits,true);
assert.equal(c.laws.universal_quadratic_form_classification_claimed,false);
assert.equal(c.laws.physical_symmetry_breaking_claimed,false);
assert.equal(c.passed,true);
console.log('Ash A15-R0 Atlas quadratic-refinement orbit geometry canonical contract passed.');