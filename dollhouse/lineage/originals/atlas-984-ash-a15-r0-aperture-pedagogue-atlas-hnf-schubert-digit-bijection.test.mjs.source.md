import assert from 'node:assert/strict';
import {
  ATLAS_HNF_SCHUBERT_DIGIT_BIJECTION_CERTIFICATE as cert,
  ATLAS_HNF_SCHUBERT_DIGIT_BIJECTION_PARENT_RECEIPT,
  atlasGrassmannianPointToHnf,
  atlasHnfToGrassmannianPoint,
} from '../app/dome-world/previews/a15-r0/atlas-hnf-schubert-digit-bijection.js';

assert.equal(ATLAS_HNF_SCHUBERT_DIGIT_BIJECTION_PARENT_RECEIPT,'879f68feb64214259f10b70cc194eb43f659ff55');
assert.equal(cert.parent_exact,true);
assert.equal(cert.exhaustive_cells,28);
assert.equal(cert.exhaustive_points,3210);
assert.equal(cert.roundtrip_failures,0);
assert.equal(cert.count_failures,0);
assert.equal(cert.image_collision_failures,0);
assert.equal(cert.non_naive_mod_p_control.passed,true);
assert.equal(cert.anchor.passed,true);
assert.equal(cert.anchor.grassmannian_count,'788035');
assert.equal(cert.laws.explicit_coordinate_relative_bijection,true);
assert.equal(cert.laws.basis_free_canonical_claimed,false);
assert.equal(cert.laws.functorial_natural_claimed,false);
assert.equal(cert.laws.naive_mod_p_reduction_claimed,false);
assert.equal(cert.laws.global_composite_index_bijection_claimed,false);

const H=[[1n,2n],[0n,4n]];
const point=atlasHnfToGrassmannianPoint(H,2);
assert.equal(point.valid,true);
assert.deepEqual(point.exponents,[0,2]);
assert.deepEqual(point.pivot_word,[0,1,1]);
assert.deepEqual(point.reverse_rref,[['0','1','0'],['1','0','1']]);
const back=atlasGrassmannianPointToHnf(point,2);
assert.equal(back.valid,true);
assert.deepEqual(back.hnf,[['1','2'],['0','4']]);

const indexOne=atlasHnfToGrassmannianPoint([[1n,0n,0n],[0n,1n,0n],[0n,0n,1n]],2);
assert.equal(indexOne.valid,true);
assert.equal(indexOne.k,0);
assert.equal(indexOne.n,2);
assert.deepEqual(indexOne.reverse_rref,[]);
assert.deepEqual(atlasGrassmannianPointToHnf(indexOne,2).hnf,[['1','0','0'],['0','1','0'],['0','0','1']]);

for(const membrane of [
  'EXPLICIT_COORDINATE_RELATIVE_BIJECTION != BASIS_FREE_CANONICAL_EQUIVALENCE',
  'SET_BIJECTION != FUNCTORIAL_OR_NATURAL_EQUIVALENCE',
  'HNF_DIGITIZATION != NAIVE_MOD_P_REDUCTION',
  'STANDARD_FLAG_DEPENDENCE != CANONICALITY',
  'PRIME_POWER_LOCAL_BIJECTION != GLOBAL_COMPOSITE_INDEX_BIJECTION',
])assert.equal(cert.membranes.includes(membrane),true);

assert.equal(cert.passed,true);
console.log('Ash A15-R0 Atlas HNF-Schubert digit bijection canonical tests passed.');
