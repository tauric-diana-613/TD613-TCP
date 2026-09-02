import assert from 'node:assert/strict';
import {
  ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_RECIPROCITY_CERTIFICATE as C,
  ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_RECIPROCITY_PARENT_RECEIPT,
  atlasSchubertGaussianDelannoyReciprocityInvolution,
} from '../app/dome-world/previews/a15-r0/atlas-schubert-gaussian-delannoy-reciprocity.js';

assert.equal(ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_RECIPROCITY_PARENT_RECEIPT,'235770c9984c74e0b518fe69577bf1ceb1404fd3');
assert.equal(C.parent_exact,true);
assert.equal(C.formal_cells,42);
assert.equal(C.support_objects,9912);
assert.equal(C.fixed_objects,190);
for(const k of ['fixed_cell_failures','support_failures','mark_transport_failures','gap_failures','involution_failures','lower_rank_complement_failures','upper_rank_complement_failures','slice_histogram_failures','fixed_point_rank_failures'])assert.equal(C[k],0,k);
assert.equal(C.hostile_controls.failed_v0_1_reverse_complement_rejected,true);
assert.equal(C.hostile_controls.reverse_lower_rejected,true);
assert.equal(C.hostile_controls.bad_mark_offset_rejected,true);
assert.equal(C.laws.involution,'J(w,u)=(reverse(u),reverse(w))');
assert.equal(C.laws.mark_transport,'p -> n-2-p');
assert.equal(C.laws.physical_time_reversal_claimed,false);
assert.equal(C.laws.basis_free_duality_claimed,false);
assert.equal(C.passed,true);

const anchor=atlasSchubertGaussianDelannoyReciprocityInvolution([1,0,1,0],[0,2]);
assert.deepEqual(anchor.upper,[0,1,0,1]);
assert.deepEqual(anchor.lower_prime,[1,0,1,0]);
assert.deepEqual(anchor.marks_prime,[0,2]);
assert.deepEqual(anchor.upper_prime,[0,1,0,1]);

console.log('Ash A15-R0 Atlas Schubert Gaussian-Delannoy reciprocity involution tests passed.');
