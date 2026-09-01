import assert from 'node:assert/strict';
import {
  ATLAS_SCHUBERT_GRADED_CELL_DECOMPOSITION_CERTIFICATE as cert,
  atlasEvaluatePolynomial,
  atlasGaussianPolynomial,
  atlasSchubertCellDimension,
  atlasSchubertCompositionPolynomial,
} from '../app/dome-world/previews/a15-r0/atlas-schubert-graded-cell-decomposition.js';

assert.throws(()=>atlasSchubertCellDimension([],0),/nonempty/);
assert.throws(()=>atlasSchubertCellDimension([1,-1],0),/nonnegative integer/);
assert.throws(()=>atlasSchubertCellDimension([1,0.5],1),/nonnegative integer/);
assert.throws(()=>atlasSchubertCellDimension([1,1],3),/sum mismatch/);
assert.throws(()=>atlasSchubertCompositionPolynomial(0,2),/d>=1/);
assert.throws(()=>atlasGaussianPolynomial(2,-1),/k>=0/);
assert.throws(()=>atlasEvaluatePolynomial(['1'],-1),/q>=0/);

const leftHeavy=[3,0,0,0,0,0,0];
const rightHeavy=[0,0,0,0,0,0,3];
assert.equal(atlasSchubertCellDimension(leftHeavy,3),0);
assert.equal(atlasSchubertCellDimension(rightHeavy,3),18);
assert.equal(cert.hostile_controls.standard_flag_dependence,true);

const formal=atlasSchubertCompositionPolynomial(3,2);
assert.deepEqual(formal,['1','1','2','1','1']);
assert.equal(atlasEvaluatePolynomial(formal,4),'357');
assert.equal(cert.hostile_controls.composite_q_arithmetic_value,'357');
assert.equal(cert.hostile_controls.finite_field_realization_at_composite_q_claimed,false);

for(let d=1;d<=7;d++)for(let k=0;k<=5;k++){
  const composition=atlasSchubertCompositionPolynomial(d,k);
  const recurrence=atlasGaussianPolynomial(d,k);
  assert.deepEqual(composition,recurrence);
  assert.equal(composition.length<=k*(d-1)+1,true);
}

assert.equal(cert.laws.bruhat_closure_order_claimed,false);
assert.equal(cert.laws.basis_free_geometry_claimed,false);
assert.equal(cert.laws.asymptotic_claimed,false);
assert.equal(cert.membranes.includes('FINITE_GEOMETRY != PHYSICAL_GEOMETRY'),true);
assert.equal(cert.membranes.includes('AFFINE_COORDINATE_CHART != BASIS_FREE_CANONICAL_GEOMETRY'),true);
assert.equal(cert.passed,true);
console.log('Ash A15-R0 Atlas Schubert graded cell decomposition hostile tests passed.');
