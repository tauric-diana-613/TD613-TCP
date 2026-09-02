import assert from 'node:assert/strict';
import {
  ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_CERTIFICATE as cert,
  ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_PARENT_RECEIPT,
  ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_SCHEMA,
  atlasSchubertGaussianDelannoyClosedPolynomial,
  atlasSchubertGaussianDelannoyEvaluate,
  atlasSchubertGaussianDelannoyRecursivePolynomial,
  atlasSchubertGaussianDelannoyWordPolynomial,
} from '../app/dome-world/previews/a15-r0/atlas-schubert-gaussian-delannoy.js';

assert.equal(ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_SCHEMA,'td613.dome-world.atlas-schubert-gaussian-delannoy/v0.1');
assert.equal(ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_PARENT_RECEIPT,'00b3772c46181747dbb5f7101a5a11f7bf4ba6b9');
assert.equal(cert.parent_exact,true);
assert.equal(cert.formal_cells,42);
assert.equal(cert.pivot_words,1715);
assert.equal(cert.marked_descent_objects,9912);
assert.equal(cert.t_slices,112);
assert.equal(cert.rectangular_coefficient_slots,1428);
assert.equal(cert.word_recurrence_failures,0);
assert.equal(cert.word_closed_form_failures,0);
assert.equal(cert.coefficient_slot_failures,0);
assert.equal(cert.closed_form_slice_failures,0);
assert.equal(cert.gaussian_specialization_failures,0);
assert.equal(cert.delannoy_specialization_failures,0);
assert.equal(cert.top_cancellation_failures,0);
assert.equal(cert.bottom_cancellation_failures,0);
assert.equal(cert.reciprocity_failures,0);
assert.equal(cert.transpose_checks,36);
assert.equal(cert.transpose_failures,0);

const tiny=[['1','1'],['1']];
assert.deepEqual(atlasSchubertGaussianDelannoyWordPolynomial(2,1),tiny);
assert.deepEqual(atlasSchubertGaussianDelannoyRecursivePolynomial(2,1),tiny);
assert.deepEqual(atlasSchubertGaussianDelannoyClosedPolynomial(2,1),tiny);

const square=atlasSchubertGaussianDelannoyClosedPolynomial(3,2);
assert.deepEqual(square[0],['1','1','2','1','1']);
assert.deepEqual(square[1],['1','2','2','1']);
assert.deepEqual(square[2],['0','1']);
assert.equal(atlasSchubertGaussianDelannoyEvaluate(square,1,1),'13');
assert.equal(atlasSchubertGaussianDelannoyEvaluate(square,2,-1),'16');
assert.equal(atlasSchubertGaussianDelannoyEvaluate(square,2,-2),'1');

assert.deepEqual(cert.anchor.q1_t_coefficients,[84,168,105,20]);
assert.equal(cert.anchor.q_degree,18);
assert.equal(cert.anchor.q2_t0,'788035');
assert.equal(cert.anchor.q2_t1,'1644634');
assert.equal(cert.anchor.q2_t_minus1,'262144');
assert.equal(cert.anchor.q2_t_minus2,'1');
assert.equal(cert.anchor.passed,true);

assert.equal(cert.hostile_controls.triangular_q_shift_required,true);
assert.equal(cert.hostile_controls.lower_rank_weight_required,true);
assert.equal(cert.hostile_controls.finite_field_realization_at_composite_q_claimed,false);

for(const membrane of [
  'GAUSSIAN_GRADING != MOBIUS_SUPPORT_GRADING',
  'TWO_VARIABLE_DEFORMATION != TWO_PHYSICAL_DIMENSIONS',
  'FORMAL_Q != FIELD_PRIME_P',
  'FORMAL_T != TIME_PARAMETER',
  'Q_RECIPROCITY != TEMPORAL_REVERSAL',
  'EXTREMAL_CANCELLATION != NEW_GENERAL_MOBIUS_THEOREM',
  'FINITE_TRANSPOSE_SYMMETRY != ATLAS_PHYSICAL_DUALITY',
  'SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY',
])assert.equal(cert.membranes.includes(membrane),true);

assert.equal(cert.laws.bounded_transpose_symmetry,true);
assert.equal(cert.laws.basis_free_canonical_geometry_claimed,false);
assert.equal(cert.laws.physical_claimed,false);
assert.equal(cert.laws.temporal_reversal_claimed,false);
assert.equal(cert.laws.probability_claimed,false);
assert.equal(cert.passed,true);

console.log('Ash A15-R0 Atlas Schubert Gaussian-Delannoy deformation canonical tests passed.');
