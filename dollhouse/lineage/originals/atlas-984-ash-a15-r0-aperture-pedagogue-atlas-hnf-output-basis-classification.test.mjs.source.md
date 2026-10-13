import assert from 'node:assert/strict';
import {
  ATLAS_HNF_OUTPUT_BASIS_CLASSIFICATION_SCHEMA,
  ATLAS_HNF_OUTPUT_BASIS_CLASSIFICATION_PARENT_RECEIPT,
  atlasHnfOutputBasisClassificationCertificate,
} from '../app/dome-world/previews/a15-r0/atlas-hnf-output-basis-classification.js';

const c=atlasHnfOutputBasisClassificationCertificate();
assert.equal(ATLAS_HNF_OUTPUT_BASIS_CLASSIFICATION_SCHEMA,'td613.dome-world.atlas-hnf-output-basis-classification/v0.1');
assert.equal(ATLAS_HNF_OUTPUT_BASIS_CLASSIFICATION_PARENT_RECEIPT,'4b731c16721b43e5319843da84955b3b80210cec');
assert.equal(c.parent_exact,true);
assert.equal(c.atlas_transform_failures,0);
assert.deepEqual(Object.fromEntries(Object.entries(c.profiles).map(([n,p])=>[n,p.dimension])),{1:1,2:3,3:7,4:15});
for(const p of Object.values(c.profiles)){
  assert.equal(p.templates,4);
  assert.equal(p.left_transforms_per_template,4);
  assert.equal(p.orbit_controls,16);
  assert.equal(p.distinct_template_pairs,6);
}
assert.equal(c.exact_orbit_controls,64);
assert.equal(c.exact_orbit_failures,0);
assert.equal(c.distinct_template_pair_controls,24);
assert.equal(c.distinct_template_pair_failures,0);
assert.equal(c.same_index_different_hnf_control.index,4);
assert.equal(c.same_index_different_hnf_control.passed,true);
assert.notEqual(c.same_index_different_hnf_control.class_1,c.same_index_different_hnf_control.class_2);
assert.equal(c.laws.relative_matrix_formula,'B_A = A Z_n^{-1}');
assert.equal(c.laws.output_basis_action,'B_(UA) = U B_A');
assert.equal(c.laws.row_hnf_complete_for_left_GLZ_orbits,true);
assert.equal(c.laws.equivalent_iff_equal_row_hnf,true);
assert.equal(c.laws.atlas_is_identity_hnf_class,true);
assert.equal(c.laws.determinant_index_is_not_complete_orbit_invariant,true);
assert.equal(c.laws.smith_normal_form_claimed,false);
assert.equal(c.laws.input_basis_change_claimed,false);
assert.equal(c.laws.nonlinear_receiver_classification_claimed,false);
assert.equal(c.passed,true);

console.log('Ash A15-R0 Atlas HNF output-basis classification canonical tests passed.');