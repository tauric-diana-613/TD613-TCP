import assert from 'node:assert/strict';
import {
  ATLAS_SCHUBERT_C2_PALINDROMIC_FOLDING_CERTIFICATE as C,
  atlasSchubertC2ForcedCenter,
  atlasSchubertC2PathIsPalindrome,
  atlasSchubertC2PalindromicFold,
  atlasSchubertC2PalindromicUnfold,
} from '../app/dome-world/previews/a15-r0/atlas-schubert-c2-palindromic-folding.js';

assert.equal(C.hostile_controls.EN_swap_rejected,true);
assert.equal(C.hostile_controls.free_center_rejected,true);
assert.equal(C.hostile_controls.half_only_rejected,true);
assert.equal(C.hostile_controls.count_only_rejected,true);

assert.throws(()=>atlasSchubertC2PalindromicFold(['E','N']),/palindromic/);
assert.equal(atlasSchubertC2ForcedCenter(2,2,1),'IMPOSSIBLE');
assert.equal(atlasSchubertC2ForcedCenter(3,2,0),'E');
assert.notDeepEqual(['E','N'],['N','E']);
assert.equal(atlasSchubertC2PathIsPalindrome(['E','N']),false);
assert.deepEqual(atlasSchubertC2PalindromicUnfold(['E','N'],null),['E','N','N','E']);
assert.deepEqual(atlasSchubertC2PalindromicUnfold(['E','N'],'D'),['E','N','D','N','E']);
assert.equal(C.fixed_objects,C.centerless_fixed_objects+C.E_centered_fixed_objects+C.N_centered_fixed_objects+C.D_centered_fixed_objects);
assert.equal(C.gap_slices,C.centerless_slices+C.E_centered_slices+C.N_centered_slices+C.D_centered_slices+C.parity_impossible_slices);
assert.equal(C.passed,true);
console.log('Ash A15-R0 Atlas Schubert C2 palindromic folding hostile tests passed.');
