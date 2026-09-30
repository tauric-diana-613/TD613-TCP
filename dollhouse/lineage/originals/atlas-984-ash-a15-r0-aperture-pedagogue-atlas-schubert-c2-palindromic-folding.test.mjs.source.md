import assert from 'node:assert/strict';
import {
  ATLAS_SCHUBERT_C2_PALINDROMIC_FOLDING_CERTIFICATE as C,
  ATLAS_SCHUBERT_C2_PALINDROMIC_FOLDING_PARENT_RECEIPT,
  ATLAS_SCHUBERT_C2_PALINDROMIC_FOLDING_SCHEMA,
  atlasSchubertC2ForcedCenter,
  atlasSchubertC2PathIsPalindrome,
  atlasSchubertC2PalindromicFold,
  atlasSchubertC2PalindromicUnfold,
} from '../app/dome-world/previews/a15-r0/atlas-schubert-c2-palindromic-folding.js';

assert.equal(ATLAS_SCHUBERT_C2_PALINDROMIC_FOLDING_SCHEMA,'td613.dome-world.atlas-schubert-c2-palindromic-folding/v0.1');
assert.equal(ATLAS_SCHUBERT_C2_PALINDROMIC_FOLDING_PARENT_RECEIPT,'3c3a3dac296a819fad7c896fc2042510a6709ea9');
assert.equal(C.parent_exact,true);
assert.equal(C.formal_cells,42);
assert.equal(C.gap_slices,112);
assert.equal(C.support_objects,9912);
assert.equal(C.fixed_objects,190);
assert.equal(C.centerless_fixed_objects,64);
assert.equal(C.E_centered_fixed_objects,31);
assert.equal(C.N_centered_fixed_objects,64);
assert.equal(C.D_centered_fixed_objects,31);
assert.equal(C.centerless_slices,20);
assert.equal(C.E_centered_slices,14);
assert.equal(C.N_centered_slices,20);
assert.equal(C.D_centered_slices,14);
assert.equal(C.parity_impossible_slices,44);
for(const key of ['path_equivariance_failures','fixed_palindrome_failures','fold_unfold_failures','decode_failures','center_parity_failures','closed_count_failures','middle_rank_failures'])assert.equal(C[key],0,key);
assert.equal(atlasSchubertC2PathIsPalindrome(['E','D','E']),true);
assert.equal(atlasSchubertC2PathIsPalindrome(['E','N']),false);
assert.deepEqual(atlasSchubertC2PalindromicFold(['E','D','E']),{half:['E'],center:'D'});
assert.deepEqual(atlasSchubertC2PalindromicUnfold(['E'],'D'),['E','D','E']);
assert.equal(atlasSchubertC2ForcedCenter(3,2,0),'E');
assert.equal(atlasSchubertC2ForcedCenter(2,2,1),'IMPOSSIBLE');
assert.equal(C.passed,true);
console.log('Ash A15-R0 Atlas Schubert C2 palindromic folding canonical tests passed.');
