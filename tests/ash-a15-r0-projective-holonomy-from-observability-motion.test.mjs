import test from 'node:test';
import assert from 'node:assert/strict';
import { runProjectiveHolonomyFromObservabilityMotionAssay } from '../app/dome-world/previews/a15-r0/projective-holonomy-from-observability-motion.js';

test('projective holonomy class reconstructs from readout-direction motion',()=>{
  const receipt=runProjectiveHolonomyFromObservabilityMotionAssay();
  assert.equal(receipt.spec_head,'0476aaf88fb3299f50c7f6d012d8eb580e4a4817');
  assert.deepEqual(receipt.preregistered_inputs,[[1,3],[1,7],[1,11],[1,19]]);
  assert.deepEqual(receipt.derived_outputs,[[1,7],[1,5],[1,13],[1,9]]);

  assert.equal(receipt.two_correspondence_control.constraint_rank,2);
  assert.equal(receipt.two_correspondence_control.nullspace_dimension,2);
  assert.equal(receipt.two_correspondence_control.underidentified,true);
  assert.equal(receipt.two_correspondence_control.materialized_distinct_projective_candidates.length,2);
  assert.deepEqual(receipt.two_correspondence_control.materialized_distinct_projective_candidates.map(c=>c.matrix),[
    [[1,24],[0,15]],
    [[1,10],[9,0]]
  ]);
  assert.notDeepEqual(
    receipt.two_correspondence_control.materialized_distinct_projective_candidates[0].heldout_predictions,
    receipt.two_correspondence_control.materialized_distinct_projective_candidates[1].heldout_predictions
  );

  assert.equal(receipt.three_correspondence_reconstruction.constraint_rank,3);
  assert.equal(receipt.three_correspondence_reconstruction.nullspace_dimension,1);
  assert.equal(receipt.three_correspondence_reconstruction.recovered_invertible,true);
  assert.deepEqual(receipt.three_correspondence_reconstruction.recovered_projective_matrix,[[1,12],[21,11]]);
  assert.equal(receipt.three_correspondence_reconstruction.oracle_projective_match,true);
  assert.deepEqual(receipt.heldout_fourth.predicted,[1,9]);
  assert.equal(receipt.heldout_fourth.passes,true);

  assert.deepEqual(receipt.contradictory_fourth.hostile_output,[1,10]);
  assert.equal(receipt.contradictory_fourth.constraint_rank,4);
  assert.equal(receipt.contradictory_fourth.nullspace_dimension,0);
  assert.equal(receipt.contradictory_fourth.recovered_projective_matrix,null);
  assert.equal(receipt.contradictory_fourth.classification,'PROJECTIVE_LOOP_MODEL_DEFEATED_BY_INCONSISTENT_OBSERVABILITY_CORRESPONDENCE');

  assert.deepEqual(receipt.gauge_control.H_prime_oracle,[[26,17],[28,10]]);
  assert.deepEqual(receipt.gauge_control.outputs,[[1,3],[1,21],[1,16],[1,25]]);
  assert.equal(receipt.gauge_control.reconstruction.constraint_rank,3);
  assert.deepEqual(receipt.gauge_control.reconstruction.recovered_projective_matrix,[[1,9],[13,29]]);
  assert.equal(receipt.gauge_control.passes,true);

  assert.equal(receipt.scale_control.lambda,7);
  assert.equal(receipt.scale_control.all_projective_outputs_identical,true);
  assert.equal(receipt.scale_control.absolute_GL2_scale_identified,false);
  assert.equal(receipt.solver_firewall.oracle_matrix_exposed_to_solver,false);
  assert.equal(receipt.solver_firewall.gauge_matrix_exposed_to_solver,false);

  assert.equal(receipt.findings.two_correspondences_underidentify_projective_loop_class,true);
  assert.equal(receipt.findings.three_correspondences_reconstruct_one_projective_loop_class,true);
  assert.equal(receipt.findings.heldout_fourth_direction_predicted,true);
  assert.equal(receipt.findings.inconsistent_fourth_direction_defeats_projective_loop_model,true);
  assert.equal(receipt.findings.gauge_clone_reconstructs_conjugate_projective_loop_class,true);
  assert.equal(receipt.findings.projective_only_observations_do_not_identify_GL2_scale,true);
  assert.equal(receipt.findings.assay_mechanism_validated,true);

  assert.equal(receipt.research_label,'PROJECTIVE_HOLONOMY_TOMOGRAPHY_FROM_OBSERVABILITY_MOTION');
  assert.equal(receipt.claim_ceiling.projective_holonomy_tomography_in_authored_F31_fixture,true);
  assert.equal(receipt.claim_ceiling.absolute_GL2_scale,false);
  assert.equal(receipt.claim_ceiling.physical_holonomy,false);
  assert.equal(receipt.claim_ceiling.continuum_tomography,false);
  assert.equal(receipt.claim_ceiling.proto_loom,false);
  assert.equal(receipt.claim_ceiling.production_authority,false);
  assert.equal(receipt.claim_ceiling.vercel_authority,false);
});
