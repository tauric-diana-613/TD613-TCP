import assert from 'node:assert/strict';
import {
  ATLAS_SCHUBERT_RECIPROCITY_CYCLIC_SIEVING_CERTIFICATE as C,
  ATLAS_SCHUBERT_RECIPROCITY_CYCLIC_SIEVING_PARENT_RECEIPT,
  atlasSchubertReciprocityClosedFixedCount,
  atlasSchubertReciprocityNormalizedSlice,
} from '../app/dome-world/previews/a15-r0/atlas-schubert-reciprocity-cyclic-sieving.js';

assert.equal(ATLAS_SCHUBERT_RECIPROCITY_CYCLIC_SIEVING_PARENT_RECEIPT,'5cdbbd3713ccf5798523ff96d6db75df0367fadd');
assert.equal(C.parent_exact,true);
assert.equal(C.formal_cells,42);
assert.equal(C.gap_slices,112);
assert.equal(C.support_objects,9912);
assert.equal(C.fixed_objects,190);
assert.equal(C.nonfixed_two_cycles,4861);
assert.equal(C.slices_with_fixed_points,68);
assert.equal(C.slices_without_fixed_points,44);
for(const k of ['H_at_1_failures','H_at_minus_1_failures','closed_fixed_formula_failures','orbit_decomposition_failures','multiple_odd_parts_zero_failures'])assert.equal(C[k],0,k);
assert.equal(C.hostile_controls.triangular_normalization_required,true);
assert.equal(C.hostile_controls.multiple_odd_parts_force_zero,true);
assert.equal(C.laws.cyclic_sieving,'H(1)=|X| and H(-1)=|Fix(J_s)|');
assert.equal(C.laws.negative_field_size_claimed,false);
assert.equal(C.laws.temporal_periodicity_claimed,false);
assert.equal(C.laws.general_csp_claimed,false);
assert.equal(C.passed,true);

assert.equal(atlasSchubertReciprocityClosedFixedCount(6,4,2),12);
assert.equal(atlasSchubertReciprocityClosedFixedCount(2,2,1),0);
const anchor=atlasSchubertReciprocityNormalizedSlice(7,4,2);
assert.ok(anchor.length>1);

console.log('Ash A15-R0 Atlas Schubert reciprocity C2 cyclic-sieving tests passed.');
