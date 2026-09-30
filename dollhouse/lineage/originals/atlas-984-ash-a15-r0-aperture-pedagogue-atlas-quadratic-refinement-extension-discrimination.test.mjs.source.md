import assert from 'node:assert/strict';
import {
  ATLAS_QUADRATIC_REFINEMENT_EXTENSION_DISCRIMINATION_SCHEMA,
  atlasQuadraticRefinementExtensionDiscriminationCertificate,
} from '../app/dome-world/previews/a15-r0/atlas-quadratic-refinement-extension-discrimination.js';

const certificate=atlasQuadraticRefinementExtensionDiscriminationCertificate();
const beta=[[0,0,0,0],[0,0,1,1],[0,1,0,1],[0,1,1,0]];
const add=[[0,1,2,3],[1,0,3,2],[2,3,0,1],[3,2,1,0]];

assert.equal(ATLAS_QUADRATIC_REFINEMENT_EXTENSION_DISCRIMINATION_SCHEMA,'td613.dome-world.atlas-quadratic-refinement-extension-discrimination/v0.1');
assert.equal(certificate.parent_receipt,'abfc2a801127b85fea870b56d253882951cca241');
assert.equal(certificate.parent_exact,true);
assert.equal(certificate.passed,true);

assert.deepEqual(certificate.earned_D8.q,[0,0,0,1]);
assert.deepEqual(certificate.quaternion_control.q,[0,1,1,1]);
assert.deepEqual(certificate.earned_D8.quotient_addition,add);
assert.deepEqual(certificate.quaternion_control.quotient_addition,add);
assert.deepEqual(certificate.shared_polar_form.D_table,beta);
assert.deepEqual(certificate.shared_polar_form.Q_table,beta);
assert.equal(certificate.shared_polar_form.cross_cell_checks,16);
assert.equal(certificate.shared_polar_form.cross_mismatches,0);
assert.equal(certificate.shared_polar_form.q_vector_differences,2);

assert.equal(certificate.square_well_definedness.D_representative_evaluations,8);
assert.equal(certificate.square_well_definedness.D_outside_center,0);
assert.equal(certificate.square_well_definedness.D_representative_disagreements,0);
assert.equal(certificate.square_well_definedness.Q_representative_evaluations,8);
assert.equal(certificate.square_well_definedness.Q_outside_center,0);
assert.equal(certificate.square_well_definedness.Q_representative_disagreements,0);

assert.equal(certificate.earned_D8.element_square_checks,8);
assert.equal(certificate.earned_D8.element_square_identity,6);
assert.equal(certificate.earned_D8.element_square_nonidentity_center,2);
assert.equal(certificate.quaternion_control.element_square_checks,8);
assert.equal(certificate.quaternion_control.element_square_identity,2);
assert.equal(certificate.quaternion_control.element_square_nonidentity_center,6);

assert.equal(certificate.polarization.D_checks,16);
assert.equal(certificate.polarization.D_failures,0);
assert.equal(certificate.polarization.Q_checks,16);
assert.equal(certificate.polarization.Q_failures,0);

assert.equal(certificate.arf.ordered_symplectic_bases,6);
assert.deepEqual(certificate.arf.D_bits,[0,0,0,0,0,0]);
assert.deepEqual(certificate.arf.Q_bits,[1,1,1,1,1,1]);
assert.equal(certificate.arf.D_bit,0);
assert.equal(certificate.arf.Q_bit,1);

assert.equal(certificate.linear_isometry_audit.binary_matrix_candidates,16);
assert.equal(certificate.linear_isometry_audit.GL2F2_size,6);
assert.equal(certificate.linear_isometry_audit.pairing_preservers,6);
assert.equal(certificate.linear_isometry_audit.D_q_stabilizer,2);
assert.equal(certificate.linear_isometry_audit.Q_q_stabilizer,6);
assert.equal(certificate.linear_isometry_audit.cross_D_to_Q_q_isometries,0);
assert.equal(certificate.linear_isometry_audit.cross_Q_to_D_q_isometries,0);

assert.equal(certificate.laws.square_map_well_defined_on_D_central_quotient,true);
assert.equal(certificate.laws.square_map_well_defined_on_Q_central_quotient,true);
assert.equal(certificate.laws.D_q_polarizes_to_earned_pairing,true);
assert.equal(certificate.laws.Q_q_polarizes_to_same_pairing,true);
assert.equal(certificate.laws.same_pairing_distinct_quadratic_refinements,true);
assert.equal(certificate.laws.opposite_Arf_bits,true);
assert.equal(certificate.laws.quadratic_forms_nonisometric_under_GL2F2,true);
assert.equal(certificate.laws.universal_extension_classification_claimed,false);
assert.equal(certificate.laws.physical_quadratic_or_quantum_claimed,false);

for(const membrane of [
  'QUADRATIC_REFINEMENT != QUANTUM_STATE',
  'PAIRING_EQUALITY != EXTENSION_EQUALITY',
  'QUADRATIC_REFINEMENT_DISCRIMINATION != UNIVERSAL_GROUP_CLASSIFICATION',
  'Q8_SYMBOLIC_CONTROL != QUATERNIONIC_PHYSICS',
]) assert.equal(certificate.membranes.includes(membrane),true,`missing membrane: ${membrane}`);

console.log('Ash A15-R0 Atlas quadratic refinement extension discrimination canonical contract passed.');
