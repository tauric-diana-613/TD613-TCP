import test from 'node:test';
import assert from 'node:assert/strict';
import { runRobustnessAwareProbeEcologyCodesignAssay } from '../app/dome-world/previews/a15-r0/robustness-aware-probe-ecology-codesign.js';

test('robustness-aware co-design exposes guarantee-relative observation architecture',()=>{
 const r=runRobustnessAwareProbeEcologyCodesignAssay();
 assert.equal(r.spec_head,'d36e2b8280bb6cd4f9166c73adf1c5eef97b1dce');
 assert.equal(r.source_status,'DERIVATIONAL');
 assert.equal(r.complete_subset_census.length,15);

 const row=key=>r.complete_subset_census.find(d=>d.probes.join('+')===key);
 assert.equal(row('q1').identification_admissible,false);
 for(const q of ['q2','q3','q4']){
  assert.equal(row(q).identification_admissible,true);
  assert.equal(row(q).probe_count,1);
  assert.equal(row(q).ecology_state_count,5);
  assert.equal(row(q).minimum_clean_signature_distance,2);
 }

 assert.equal(row('q3+q4').identification_admissible,true);
 assert.equal(row('q3+q4').probe_count,2);
 assert.equal(row('q3+q4').ecology_state_count,8);
 assert.equal(row('q3+q4').minimum_clean_signature_distance,4);

 assert.equal(row('q2+q3+q4').probe_count,3);
 assert.equal(row('q2+q3+q4').ecology_state_count,12);
 assert.equal(row('q2+q3+q4').minimum_clean_signature_distance,6);

 assert.equal(row('q1+q2+q3+q4').probe_count,4);
 assert.equal(row('q1+q2+q3+q4').ecology_state_count,15);
 assert.equal(row('q1+q2+q3+q4').minimum_clean_signature_distance,6);
 assert.deepEqual(row('q1+q2+q3+q4').bottleneck_hypothesis_pairs,['H0:H3']);

 const frontier=r.pareto_frontier.map(x=>x.probes.join('+')).sort();
 assert.deepEqual(frontier,['q2','q2+q3+q4','q3','q3+q4','q4'].sort());
 assert.equal(r.designs_with_minimum_distance_above_four.length,2);
 assert.deepEqual(r.designs_with_minimum_distance_above_four.map(x=>x.probes.join('+')).sort(),['q1+q2+q3+q4','q2+q3+q4'].sort());

 assert.equal(r.comparisons.efficiency_pair.minimum_clean_signature_distance,4);
 assert.equal(r.comparisons.robustness_triple.minimum_clean_signature_distance,6);
 assert.equal(r.comparisons.redundant_q1_control.q1_H0_H3_alias,true);
 assert.equal(r.comparisons.redundant_q1_control.added_probe_increases_minimum_distance,false);

 assert.equal(r.findings.all_fifteen_nonempty_subsets_censused,true);
 assert.equal(r.findings.inherited_q3_q4_design_reproduces_minimum_distance_four,true);
 assert.equal(r.findings.q2_q3_q4_triple_reaches_minimum_distance_six,true);
 assert.equal(r.findings.adding_q1_to_robustness_triple_adds_cost_without_increasing_minimum_distance,true);
 assert.equal(r.findings.pareto_frontier_matches_exact_finite_census,true);
 assert.equal(r.findings.design_optimality_changes_with_declared_epistemic_guarantee,true);
 assert.equal(r.findings.assay_mechanism_validated,true);

 assert.equal(r.claim_ceiling.universal_experimental_design_theorem,false);
 assert.equal(r.claim_ceiling.generic_coding_theorem,false);
 assert.equal(r.claim_ceiling.cryptographic_integrity,false);
 assert.equal(r.claim_ceiling.proto_loom,false);
 assert.equal(r.claim_ceiling.production_authority,false);
 assert.equal(r.claim_ceiling.vercel_authority,false);
});
