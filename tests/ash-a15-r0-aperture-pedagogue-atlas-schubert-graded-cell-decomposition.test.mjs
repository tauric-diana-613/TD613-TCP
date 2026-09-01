import assert from 'node:assert/strict';
import {
  ATLAS_SCHUBERT_GRADED_CELL_DECOMPOSITION_CERTIFICATE as cert,
  ATLAS_SCHUBERT_GRADED_CELL_DECOMPOSITION_PARENT_RECEIPT,
  atlasEvaluatePolynomial,
  atlasGaussianPolynomial,
  atlasSchubertCellDimension,
  atlasSchubertCompositionPolynomial,
} from '../app/dome-world/previews/a15-r0/atlas-schubert-graded-cell-decomposition.js';

assert.equal(ATLAS_SCHUBERT_GRADED_CELL_DECOMPOSITION_PARENT_RECEIPT,'0372405b055bcdff990f715cc65eed9354b2a4a0');
assert.equal(cert.parent_exact,true);
assert.equal(cert.formal_polynomial_controls,42);
assert.equal(cert.formal_polynomial_failures,0);
assert.equal(cert.prime_evaluation_controls,168);
assert.equal(cert.prime_evaluation_failures,0);
assert.equal(cert.exhaustive_cells,28);
assert.equal(cert.exhaustive_hnf_points,3210);
assert.equal(cert.coordinate_dimension_failures,0);
assert.equal(cert.stratum_cardinality_failures,0);
assert.equal(cert.image_collision_failures,0);
assert.equal(cert.exhaustive_count_failures,0);

assert.equal(atlasSchubertCellDimension([0,2],2),2);
assert.deepEqual(atlasSchubertCompositionPolynomial(3,2),['1','1','2','1','1']);
assert.deepEqual(atlasGaussianPolynomial(3,2),['1','1','2','1','1']);
assert.equal(atlasEvaluatePolynomial(atlasSchubertCompositionPolynomial(3,2),2),'35');

assert.equal(cert.anchor.d,7);
assert.equal(cert.anchor.k,3);
assert.equal(cert.anchor.degree,18);
assert.equal(cert.anchor.composition_count,84);
assert.deepEqual(cert.anchor.histogram,[1,1,2,3,4,5,7,7,8,8,8,7,7,5,4,3,2,1,1]);
assert.equal(cert.anchor.evaluation_p2,'788035');
assert.equal(cert.anchor.passed,true);

for(const membrane of [
  'FORMAL_Q != FIELD_PRIME_P',
  'SCHUBERT_CELL_DIMENSION != PHYSICAL_DIMENSION',
  'HNF_EXPONENT_STRATUM != ATLAS_SUPPORT_STRATUM',
  'CELL_DECOMPOSITION != BRUHAT_CLOSURE_ORDER',
  'GAUSSIAN_POLYNOMIAL != ASYMPTOTIC_LIMIT',
  'POLYNOMIAL_EVALUATION_AT_COMPOSITE_Q != FINITE_FIELD_REALIZATION',
])assert.equal(cert.membranes.includes(membrane),true);

assert.equal(cert.laws.bruhat_closure_order_claimed,false);
assert.equal(cert.laws.basis_free_geometry_claimed,false);
assert.equal(cert.laws.asymptotic_claimed,false);
assert.equal(cert.passed,true);
console.log('Ash A15-R0 Atlas Schubert graded cell decomposition canonical tests passed.');
