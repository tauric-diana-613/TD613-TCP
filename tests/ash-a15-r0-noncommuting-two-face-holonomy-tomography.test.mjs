import test from 'node:test';
import assert from 'node:assert/strict';
import { runNoncommutingTwoFaceHolonomyTomographyHoldout } from '../app/dome-world/previews/a15-r0/noncommuting-two-face-holonomy-tomography.js';

test('all 14 directed edge operators reconstruct exactly and satisfy independent orientation inversion', () => {
  const receipt=runNoncommutingTwoFaceHolonomyTomographyHoldout();
  assert.equal(Object.keys(receipt.directed_edge_receipts).length,14);
  for(const edge of Object.values(receipt.directed_edge_receipts)) {
    assert.equal(edge.projection_rank,4);
    assert.equal(edge.oracle_match,true);
    assert.equal(edge.invertible,true);
    assert.equal(edge.legacy_validator_residual,0);
    assert.equal(edge.guard_validator_residual,0);
    assert.equal(edge.orientation_inverse_consistent,true);
  }
});

test('fresh holdout local face loops are noncommuting', () => {
  const s=runNoncommutingTwoFaceHolonomyTomographyHoldout().surface;
  assert.deepEqual(s.left_face_loop_A,[[16,17],[30,29]]);
  assert.deepEqual(s.right_face_loop_B,[[12,19],[24,29]]);
  assert.deepEqual(s.right_face_loop_A,[[26,13],[24,15]]);
  assert.equal(s.face_loops_commute,false);
});

test('correct common-basepoint ordered product reconstructs outer boundary', () => {
  const s=runNoncommutingTwoFaceHolonomyTomographyHoldout().surface;
  assert.deepEqual(s.outer_boundary_loop_A,[[18,29],[19,19]]);
  assert.deepEqual(s.ordered_common_basepoint_product,[[18,29],[19,19]]);
  assert.equal(s.outer_equals_ordered_common_basepoint_product,true);
  assert.equal(s.shared_edge_cancellation_ledger.exact_reduction_matches_outer,true);
});

test('wrong-basepoint and wrong-order controls both fail on the preregistered holdout', () => {
  const s=runNoncommutingTwoFaceHolonomyTomographyHoldout().surface;
  assert.deepEqual(s.wrong_basepoint_product,[[11,22],[2,16]]);
  assert.deepEqual(s.wrong_order_product,[[0,13],[28,6]]);
  assert.equal(s.wrong_basepoint_matches_outer,false);
  assert.equal(s.wrong_order_matches_outer,false);
});

test('gauge clone preserves basepoint conjugacy and noncommuting surface composition', () => {
  const receipt=runNoncommutingTwoFaceHolonomyTomographyHoldout();
  const relations=receipt.gauge_clone.relations;
  assert.equal(relations.all_frames_invertible,true);
  assert.equal(relations.left_face_conjugacy,true);
  assert.equal(relations.right_face_B_conjugacy,true);
  assert.equal(relations.right_face_A_conjugacy,true);
  assert.equal(relations.outer_boundary_conjugacy,true);
  assert.equal(relations.transformed_surface_composition,true);
  assert.deepEqual(receipt.gauge_clone.surface.outer_boundary_loop_A,[[26,11],[14,11]]);
});

test('claim ceiling remains discrete and synthetic', () => {
  const receipt=runNoncommutingTwoFaceHolonomyTomographyHoldout();
  assert.equal(receipt.findings.assay_mechanism_validated,true);
  assert.equal(receipt.claim_ceiling.discrete_noncommuting_face_holonomy_tomography_candidate,true);
  assert.equal(receipt.claim_ceiling.continuum_nonabelian_stokes_theorem,false);
  assert.equal(receipt.claim_ceiling.yang_mills_field,false);
  assert.equal(receipt.claim_ceiling.berry_curvature,false);
  assert.equal(receipt.claim_ceiling.quantum_holonomy,false);
  assert.equal(receipt.claim_ceiling.proto_loom,false);
  assert.equal(receipt.claim_ceiling.production_authority,false);
  assert.equal(receipt.claim_ceiling.vercel_authority,false);
});
