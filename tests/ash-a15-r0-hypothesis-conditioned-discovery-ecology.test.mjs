import test from 'node:test';
import assert from 'node:assert/strict';
import { runHypothesisConditionedDiscoveryEcologyAssay } from '../app/dome-world/previews/a15-r0/hypothesis-conditioned-discovery-ecology.js';

test('prior-union ecology supports oracle-independent in-family partition discovery',()=>{
 const r=runHypothesisConditionedDiscoveryEcologyAssay();
 assert.equal(r.spec_head,'d134503cf3d6fecedccb59ac81f5b9d9a1f0a8d5');
 assert.equal(r.preflight.all_hypotheses_invertible_and_projectively_distinct,true);
 assert.deepEqual(r.prediction_table,{
  H0:[[1,7],[1,5],[1,13],[1,9]],
  H1:[[1,4],[1,8],[1,12],[1,20]],
  H2:[[1,24],[1,28],[1,19],[1,18]],
  H3:[[1,7],[1,25],[1,20],[1,29]]
 });
 assert.equal(r.prior_union_ecology.kernel_state_count,14);
 assert.equal(r.prior_union_ecology.state_count,15);
 assert.equal(r.prior_union_ecology.state_count_reduction_vs_global_33,18);
 assert.equal(r.prior_union_ecology.constructed_from_full_hypothesis_family,true);
 assert.equal(r.prior_union_ecology.constructed_from_true_identity,false);

 assert.equal(r.in_family_trials.length,4);
 assert.ok(r.in_family_trials.every(t=>t.primary_unique&&t.selected_hypothesis===t.true_loop_id&&t.heldout_pass));
 assert.ok(r.in_family_trials.every(t=>t.firewall.true_loop_exposed_to_ecology_constructor===false&&t.firewall.true_loop_exposed_to_partition_decoder===false&&t.firewall.true_loop_exposed_to_classifier===false));
 assert.equal(r.in_family_all_unique_and_heldout_validated,true);

 assert.equal(r.exclusive_kernel_usage.H0.length,3);
 assert.equal(r.exclusive_kernel_usage.H1.length,3);
 assert.equal(r.exclusive_kernel_usage.H2.length,4);
 assert.equal(r.exclusive_kernel_usage.H3.length,2);
 assert.equal(r.prior_family_ablations.all_pass,true);
 assert.ok(r.prior_family_ablations.records.every(x=>x.decoder_failure_exposed===true));

 assert.deepEqual(r.outside_family_control.primary_decoded_signature,[[1,5],[1,12],[1,7]]);
 assert.deepEqual(r.outside_family_control.surviving_hypotheses,[]);
 assert.equal(r.outside_family_control.classification,'OUTSIDE_LOOP_OBSERVATIONS_DEFEAT_HYPOTHESIS_FAMILY');
 assert.equal(r.outside_family_control.oracle_outside_identity_used_to_force_rejection,false);

 assert.equal(r.findings.prior_union_ecology_supports_every_candidate_prediction,true);
 assert.equal(r.findings.every_in_family_loop_identified_on_first_three_partitions,true);
 assert.equal(r.findings.every_in_family_heldout_fourth_validated,true);
 assert.equal(r.findings.calibration_support_and_hypothesis_adequacy_are_distinct,true);
 assert.equal(r.findings.oracle_independent_hypothesis_conditioned_discovery_earned_in_fixture,true);
 assert.equal(r.findings.assay_mechanism_validated,true);

 assert.equal(r.research_label,'HYPOTHESIS_CONDITIONED_PARTITION_ONLY_HOLONOMY_DISCOVERY');
 assert.equal(r.claim_ceiling.oracle_independent_discovery_within_declared_hypothesis_family,true);
 assert.equal(r.claim_ceiling.unrestricted_open_set_discovery,false);
 assert.equal(r.claim_ceiling.physical_tomography,false);
 assert.equal(r.claim_ceiling.proto_loom,false);
 assert.equal(r.claim_ceiling.production_authority,false);
 assert.equal(r.claim_ceiling.vercel_authority,false);
});
