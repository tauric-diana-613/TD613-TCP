import test from 'node:test';
import assert from 'node:assert/strict';
import { runTaskConditionedCalibrationEcologyAssay } from '../app/dome-world/previews/a15-r0/task-conditioned-calibration-ecology.js';

test('task-conditioned kernel cover preserves target tomography with explicit global sacrifice',()=>{
 const r=runTaskConditionedCalibrationEcologyAssay();
 assert.equal(r.spec_head,'c7f017d29f493df13c1c2ea50ed4a2978e3c179b');
 assert.equal(r.decoder_class,'ZERO_BUCKET_KERNEL_DECODER');
 assert.deepEqual(r.target_family,[[1,7],[1,5],[1,13],[1,9]]);
 assert.deepEqual(r.derived_kernel_states.map(s=>s.id),['D_22','D_6','D_19','D_24']);
 assert.equal(r.distinct_target_kernel_count,4);
 assert.equal(r.constructed_cardinality,5);
 assert.equal(r.decoder_class_lower_bound,5);
 assert.ok(r.target_decoding.every(x=>x.passes));

 assert.equal(r.global_coverage.projective_direction_count,32);
 assert.equal(r.global_coverage.decodable_direction_count,4);
 assert.equal(r.global_coverage.undecodable_direction_count,28);
 assert.equal(r.global_coverage.coverage_fraction,'1/8');

 assert.equal(r.leave_one_kernel_out.records.length,4);
 assert.equal(r.leave_one_kernel_out.all_pass,true);
 assert.ok(r.leave_one_kernel_out.records.every(x=>x.displaced_target_fails&&x.other_targets_remain_decodable));

 assert.deepEqual(r.matched_size_wrong_ecology.displaced_target,[1,13]);
 assert.equal(r.matched_size_wrong_ecology.displaced_kernel_state_id,'D_19');
 assert.equal(r.matched_size_wrong_ecology.replacement_state.id,'D_0');
 assert.equal(r.matched_size_wrong_ecology.ecology.length,5);
 assert.equal(r.matched_size_wrong_ecology.results.filter(x=>x.passes).length,3);
 assert.equal(r.matched_size_wrong_ecology.passes,true);

 assert.equal(r.partition_only_loop_reconstruction.rank,3);
 assert.equal(r.partition_only_loop_reconstruction.nullity,1);
 assert.deepEqual(r.partition_only_loop_reconstruction.recovered,[[1,12],[21,11]]);
 assert.deepEqual(r.partition_only_loop_reconstruction.heldout_predicted,[1,9]);
 assert.deepEqual(r.partition_only_loop_reconstruction.heldout_decoded,[1,9]);
 assert.equal(r.partition_only_loop_reconstruction.oracle_projective_match,true);
 assert.equal(r.partition_only_loop_reconstruction.passes,true);

 assert.equal(r.findings.kernel_cover_ecology_is_cardinality_minimal_within_declared_decoder_class,true);
 assert.equal(r.findings.all_four_target_readouts_decode,true);
 assert.equal(r.findings.task_ecology_preserves_partition_only_projective_holonomy_tomography,true);
 assert.equal(r.findings.task_specialization_reduces_global_readout_coverage_to_one_eighth,true);
 assert.equal(r.findings.same_ecology_cardinality_does_not_guarantee_same_task_adequacy,true);
 assert.equal(r.findings.assay_mechanism_validated,true);

 assert.equal(r.research_label,'TASK_CONDITIONED_TOMOGRAPHIC_ECOLOGY_DESIGN');
 assert.equal(r.claim_ceiling.minimality_within_declared_decoder_class,true);
 assert.equal(r.claim_ceiling.universal_minimal_ecology,false);
 assert.equal(r.claim_ceiling.physical_tomography,false);
 assert.equal(r.claim_ceiling.proto_loom,false);
 assert.equal(r.claim_ceiling.production_authority,false);
 assert.equal(r.claim_ceiling.vercel_authority,false);
});
