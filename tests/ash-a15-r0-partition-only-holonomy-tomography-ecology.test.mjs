import test from 'node:test';
import assert from 'node:assert/strict';
import { runPartitionOnlyHolonomyTomographyEcologyAssay } from '../app/dome-world/previews/a15-r0/partition-only-holonomy-tomography-ecology.js';

test('calibration ecology recovers projective holonomy from unlabeled partition motion',()=>{
 const r=runPartitionOnlyHolonomyTomographyEcologyAssay();
 assert.equal(r.spec_head,'5271b57d7138afaa3631dc561ce8882a50244bb7');
 assert.equal(r.scalar_label_firewall.partition_decoder_receives_scalar_values,false);

 assert.equal(r.sparse_ecology.state_count,4);
 assert.deepEqual(r.sparse_ecology.diagnostics.map(x=>x.compatible_direction_count),[28,28,28,28]);
 assert.equal(r.sparse_ecology.underidentification_observed,true);

 assert.equal(r.calibration_ecology.state_count,33);
 assert.equal(r.calibration_ecology.projective_direction_representative_count,32);
 assert.equal(r.calibration_ecology.exhaustive_direction_decoder.length,32);
 assert.equal(r.calibration_ecology.all_32_directions_recovered,true);
 assert.ok(r.calibration_ecology.exhaustive_direction_decoder.every(x=>x.zero_bucket.length===2&&x.passes));

 assert.deepEqual(r.partition_only_post_loop_recovery.recovered_output_directions,[[1,7],[1,5],[1,13],[1,9]]);
 assert.deepEqual(r.partition_only_post_loop_recovery.recovered_output_directions,r.partition_only_post_loop_recovery.oracle_output_directions);
 assert.equal(r.partition_only_post_loop_recovery.all_match,true);

 assert.equal(r.projective_loop_inverse.constraint_rank,3);
 assert.equal(r.projective_loop_inverse.nullspace_dimension,1);
 assert.deepEqual(r.projective_loop_inverse.recovered,[[1,12],[21,11]]);
 assert.equal(r.projective_loop_inverse.oracle_projective_match,true);
 assert.deepEqual(r.projective_loop_inverse.heldout_decoded_direction,[1,9]);
 assert.deepEqual(r.projective_loop_inverse.heldout_predicted_direction,[1,9]);
 assert.equal(r.projective_loop_inverse.heldout_pass,true);

 assert.equal(r.ecology_ablations.without_zero.decoder_status,'KERNEL_DECODER_UNAVAILABLE_WITHOUT_ZERO_ANCHOR');
 assert.equal(r.ecology_ablations.missing_each_kernel_representative.length,32);
 assert.equal(r.ecology_ablations.all_missing_kernel_ablations_refuse,true);
 assert.ok(r.ecology_ablations.missing_each_kernel_representative.every(x=>x.zero_bucket.length===1&&x.zero_bucket[0]==='ZERO'));

 assert.equal(r.gauge_control.partition_memberships_preserved,true);
 assert.equal(r.gauge_control.decoder_pass,true);
 assert.deepEqual(r.gauge_control.recovered_transformed_readout_directions,r.gauge_control.expected_transformed_readout_directions);

 assert.equal(r.findings.sparse_ecology_can_alias_many_projective_readout_directions,true);
 assert.equal(r.findings.kernel_complete_ecology_recovers_all_32_projective_readout_directions_from_unlabeled_partitions,true);
 assert.equal(r.findings.partition_only_readout_recovery_supports_projective_loop_reconstruction,true);
 assert.equal(r.findings.zero_anchor_and_kernel_direction_coverage_are_explicit_decoder_dependencies,true);
 assert.equal(r.findings.tomographic_identifiability_depends_on_observed_ecology_design_in_this_fixture,true);
 assert.equal(r.findings.assay_mechanism_validated,true);

 assert.equal(r.research_label,'PARTITION_ONLY_PROJECTIVE_HOLONOMY_TOMOGRAPHY_VIA_CALIBRATION_ECOLOGY');
 assert.equal(r.claim_ceiling.partition_only_projective_holonomy_tomography_in_authored_calibration_ecology,true);
 assert.equal(r.claim_ceiling.arbitrary_ecology_sufficiency,false);
 assert.equal(r.claim_ceiling.physical_tomography,false);
 assert.equal(r.claim_ceiling.proto_loom,false);
 assert.equal(r.claim_ceiling.production_authority,false);
 assert.equal(r.claim_ceiling.vercel_authority,false);
});
