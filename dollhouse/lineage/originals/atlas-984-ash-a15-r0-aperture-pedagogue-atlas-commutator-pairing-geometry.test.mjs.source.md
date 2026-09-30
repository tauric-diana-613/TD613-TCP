import assert from 'node:assert/strict';
import {
  ATLAS_COMMUTATOR_PAIRING_GEOMETRY_SCHEMA,
  ATLAS_COMMUTATOR_PAIRING_GEOMETRY_PARENT_RECEIPT,
  atlasCommutatorPairingGeometryCertificate,
} from '../app/dome-world/previews/a15-r0/atlas-commutator-pairing-geometry.js';

assert.equal(ATLAS_COMMUTATOR_PAIRING_GEOMETRY_SCHEMA,'td613.dome-world.atlas-commutator-pairing-geometry/v0.1');
assert.equal(ATLAS_COMMUTATOR_PAIRING_GEOMETRY_PARENT_RECEIPT,'5fc0678c440e81b393663b39d4659ebc6eeb5e29');

const c=atlasCommutatorPairingGeometryCertificate();
assert.equal(c.parent_exact,true);
assert.equal(c.transport_group.size,8);
assert.equal(c.transport_group.derived_subgroup_size,2);
assert.equal(c.transport_group.center_size,2);
assert.equal(c.transport_group.center_equals_derived,true);
assert.equal(c.quotient.size,4);
assert.deepEqual(c.quotient.class_sizes,[2,2,2,2]);
assert.deepEqual(c.pairing.table,[[0,0,0,0],[0,0,1,1],[0,1,0,1],[0,1,1,0]]);
assert.equal(c.pairing.zero_values,10);
assert.equal(c.pairing.one_values,6);
assert.equal(c.pairing.representative_independence_checks,64);
assert.equal(c.pairing.representative_independence_failures,0);
assert.equal(c.audits.alternating_checks,4);
assert.equal(c.audits.alternating_failures,0);
assert.equal(c.audits.first_slot_bilinearity_checks,64);
assert.equal(c.audits.first_slot_bilinearity_failures,0);
assert.equal(c.audits.second_slot_bilinearity_checks,64);
assert.equal(c.audits.second_slot_bilinearity_failures,0);
assert.equal(c.audits.symmetry_checks,16);
assert.equal(c.audits.symmetry_failures,0);
assert.deepEqual(c.audits.radical,[0]);
assert.deepEqual(c.audits.row_one_counts,[0,2,2,2]);
assert.equal(c.audits.nonzero_vectors_with_nontrivial_partner,3);
assert.deepEqual(c.basis_matrix.matrix,[[0,1],[1,0]]);
assert.equal(c.basis_matrix.rank_F2,2);
assert.equal(c.basis_matrix.det_F2,1);
assert.equal(c.laws.well_defined_on_central_quotient,true);
assert.equal(c.laws.alternating,true);
assert.equal(c.laws.bilinear_over_F2,true);
assert.equal(c.laws.symmetric_in_characteristic_two,true);
assert.equal(c.laws.nondegenerate,true);
assert.equal(c.laws.full_central_extension_reconstruction_claimed,false);
assert.equal(c.laws.physical_symplectic_claimed,false);
assert.equal(c.membranes.includes('D8_AND_Q8_CAN_SHARE_THE_SAME_COMMUTATOR_PAIRING'),true);
assert.equal(c.passed,true);

console.log('Ash A15-R0 Atlas commutator pairing geometry canonical contract passed.');
