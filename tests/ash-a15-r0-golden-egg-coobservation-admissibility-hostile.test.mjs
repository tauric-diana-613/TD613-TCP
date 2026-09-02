import assert from 'node:assert/strict';
import { assessGoldenEggEpisode, GOLDEN_EGG_COOBSERVATION_ADMISSIBILITY_CERTIFICATE as C } from '../app/dome-world/previews/a15-r0/golden-egg-coobservation-admissibility.js';

const transplanted={
  source_id:'TRANSPLANTED_METRICS',
  episode_id:'target-e1',
  evidence_class:'PUBLIC_EMPIRICAL_CASE',
  surfaces:[
    {name:'observer',episode_id:'donor-e2',value:0.1,measured:true},
    {name:'reconstruction',episode_id:'donor-e2',value:0.1,measured:true},
    {name:'joining',episode_id:'donor-e2',value:0.05,measured:true},
    {name:'geometry',episode_id:'target-e1',value:1,measured:true},
    {name:'matched_return',episode_id:'target-e1',value:1,measured:true}
  ]
};
const t=assessGoldenEggEpisode(transplanted);
assert.equal(t.empirical,true);
assert.equal(t.core_same_episode,false);
assert.equal(t.thresholds_pass,false);
assert.equal(t.core_joint_realized,false);
assert.equal(t.operational_return_eligible,false);

const thresholdFail={
  source_id:'SAME_EPISODE_THRESHOLD_FAIL',episode_id:'e3',evidence_class:'PUBLIC_EMPIRICAL_CASE',surfaces:[
    {name:'observer',episode_id:'e3',value:0.6,measured:true},
    {name:'reconstruction',episode_id:'e3',value:0.1,measured:true},
    {name:'joining',episode_id:'e3',value:0.05,measured:true},
    {name:'geometry',episode_id:'e3',value:1,measured:true},
    {name:'matched_return',episode_id:'e3',value:1,measured:true}
  ]
};
const f=assessGoldenEggEpisode(thresholdFail);
assert.equal(f.core_same_episode,true);
assert.equal(f.thresholds_pass,false);
assert.equal(f.core_joint_realized,false);
assert.equal(f.operational_return_eligible,false);

assert.equal(C.hostiles.frankenstein_union_complete,true);
assert.equal(C.hostiles.frankenstein_same_episode_intersection,0);
assert.equal(C.hostiles.cross_episode_transplant_rejected,true);
assert.equal(C.laws.marginal_empirical_support_not_joint_realization,true);
assert.equal(C.laws.surface_union_not_same_episode_intersection,true);
assert.equal(C.laws.threshold_pass_not_evidence_admissibility,true);
assert.equal(C.laws.recovery_tail_not_matched_counterfactual_return,true);
assert.equal(C.laws.synthetic_geometry_not_empirical_return_witness,true);

console.log('Ash A15-R0 Golden Egg co-observation hostile tests passed.');
