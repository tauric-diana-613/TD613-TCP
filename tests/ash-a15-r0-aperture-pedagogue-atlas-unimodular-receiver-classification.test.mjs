import assert from 'node:assert/strict';
import {
  ATLAS_UNIMODULAR_RECEIVER_CLASSIFICATION_SCHEMA,
  ATLAS_UNIMODULAR_RECEIVER_CLASSIFICATION_PARENT_RECEIPT,
  atlasUnimodularReceiverClassificationCertificate,
} from '../app/dome-world/previews/a15-r0/atlas-unimodular-receiver-classification.js';

const c=atlasUnimodularReceiverClassificationCertificate();
assert.equal(ATLAS_UNIMODULAR_RECEIVER_CLASSIFICATION_SCHEMA,'td613.dome-world.atlas-unimodular-receiver-classification/v0.1');
assert.equal(ATLAS_UNIMODULAR_RECEIVER_CLASSIFICATION_PARENT_RECEIPT,'c20ee814c02f5779b80560b229078b89e703dfae');
assert.equal(c.parent_exact,true);
assert.equal(c.atlas_inverse_failures,0);
assert.deepEqual(Object.fromEntries(Object.entries(c.profiles).map(([n,p])=>[n,p.dimension])),{1:1,2:3,3:7,4:15,5:31});
for(const p of Object.values(c.profiles))assert.equal(p.atlas_determinant,1);
assert.equal(c.unimodular_orbit_controls,30);
assert.equal(c.unimodular_orbit_failures,0);
assert.equal(c.proper_sublattice_controls,20);
assert.equal(c.proper_sublattice_failures,0);
assert.equal(c.singular_square_controls,5);
assert.equal(c.singular_square_failures,0);
assert.equal(c.laws.minimal_rank_injective_iff_nonzero_determinant,true);
assert.equal(c.laws.lattice_surjective_iff_absolute_determinant_one,true);
assert.equal(c.laws.atlas_output_basis_equivalent_iff_unimodular,true);
assert.equal(c.laws.unimodular_receivers_single_left_GLZ_orbit,true);
assert.equal(c.laws.full_rank_nonunimodular_can_remain_state_injective,true);
assert.equal(c.laws.unique_encoding_claimed,false);
assert.equal(c.laws.nonlinear_equivalence_claimed,false);
assert.equal(c.laws.universal_compression_claimed,false);
assert.equal(c.passed,true);

console.log('Ash A15-R0 Atlas unimodular receiver classification canonical tests passed.');