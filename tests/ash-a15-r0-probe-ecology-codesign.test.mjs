import test from 'node:test';
import assert from 'node:assert/strict';
import { runProbeEcologyCodesignAssay } from '../app/dome-world/previews/a15-r0/probe-ecology-codesign.js';

test('joint probe-ecology search reduces bounded discovery cost without losing truth coverage',()=>{
 const r=runProbeEcologyCodesignAssay();
 assert.equal(r.spec_head,'7e7063f443c15cf75ab8cf79c98ca2659f8320df');
 assert.equal(r.design_candidates.length,12);
 assert.equal(r.selected_design.primary,'q3');
 assert.equal(r.selected_design.heldout,'q4');
 assert.equal(r.selected_design.primary_prediction_count,4);
 assert.equal(r.selected_design.primary_admissible,true);
 assert.equal(r.selected_design.heldout_distinct_prediction_count,4);
 assert.equal(r.selected_design.ecology_state_count,8);
 assert.deepEqual(r.selected_design.kernel_state_ids,['D_12','D_13','D_16','D_17','D_18','D_19','D_24']);
 assert.equal(r.selected_ecology.length,8);

 assert.equal(r.truth_trials.length,4);
 assert.ok(r.truth_trials.every(t=>t.primary_unique&&t.selected_hypothesis===t.true_loop_id&&t.heldout_pass));

 assert.equal(r.baseline.primary_probe_count,3);
 assert.equal(r.baseline.ecology_state_count,15);
 assert.equal(r.comparison.primary_probe_count_reduction,2);
 assert.equal(r.comparison.ecology_state_count_reduction,7);
 assert.equal(r.comparison.heldout_validation_retained,true);

 assert.equal(r.hostile_controls.q1_cardinality_temptations.length,3);
 assert.ok(r.hostile_controls.q1_cardinality_temptations.every(d=>d.ecology_state_count===8&&d.primary_admissible===false));
 assert.equal(r.hostile_controls.low_cost_ambiguous_primary_rejected,true);
 assert.equal(r.hostile_controls.heldout_used_for_primary_selection,false);
 assert.equal(r.hostile_controls.hidden_truth_identity_used_for_design,false);

 assert.equal(r.findings.joint_search_selects_q3_primary_q4_heldout,true);
 assert.equal(r.findings.selected_primary_alone_separates_all_four_hypotheses,true);
 assert.equal(r.findings.selected_ecology_has_eight_states,true);
 assert.equal(r.findings.all_four_truths_identified_and_heldout_validated,true);
 assert.equal(r.findings.lower_ecology_cost_alone_does_not_make_ambiguous_primary_admissible,true);
 assert.equal(r.findings.joint_codesign_improves_both_declared_primary_measurement_and_ecology_cost_vs_parent,true);
 assert.equal(r.findings.assay_mechanism_validated,true);

 assert.equal(r.research_label,'CLAIM_CONDITIONED_PROBE_ECOLOGY_CODESIGN');
 assert.equal(r.claim_ceiling.bounded_joint_codesign_result,true);
 assert.equal(r.claim_ceiling.universal_optimality,false);
 assert.equal(r.claim_ceiling.proto_loom,false);
 assert.equal(r.claim_ceiling.production_authority,false);
 assert.equal(r.claim_ceiling.vercel_authority,false);
});
