import assert from 'node:assert/strict';
import { lockProspectivePlan,commitHeldoutPrediction,adjudicateCommittedPrediction }
 from '../packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/atelier-prospective-controls-v02.mjs';

const plan=lockProspectivePlan({
 trial_id:'SYNTH_NEW_2026',snapshot_id:'NEW_UNOBSERVED_TARGETS',
 heldout_ids:['TARGET_ALPHA'],comparison_frame:'FROZEN_COMPARISON_FRAME',
 controls:['C0','C1','C2','C3','C4']
});
assert.equal(plan.chronological_preoutcome_verification,'UNESTABLISHED');
assert.equal(plan.original_historical_held_states_unmodified,true);
const commitment=commitHeldoutPrediction({
 plan,target_id:'TARGET_ALPHA',prediction:{graph_families:['G_R','G_D']},
 local_lock_label:'BEFORE_SYNTHETIC_REVEAL'
});
assert.equal(commitment.target_observation_included,false);
const x=adjudicateCommittedPrediction({
 plan,commitment,prediction_reveal:{graph_families:['G_D','G_R']},
 actual_families:['G_R']
});
assert.equal(x.bytes_binding_verified,true);
assert.equal(x.score_dice,2/3);
assert.equal(x.independent_preoutcome_witness_verified,false);
assert.equal(x.readiness,'LOCAL_SCORE_ONLY_PROSPECTIVE_TIMING_UNESTABLISHED');
assert.equal(x.original_historical_held_states_unmodified,true);
assert.equal(x.scientific_novelty_earned,false);
assert.throws(()=>adjudicateCommittedPrediction({
 plan,commitment,prediction_reveal:{graph_families:['G_R','G_OTHER']},
 actual_families:['G_R']}),/PREDICTION_COMMITMENT_MISMATCH/);
assert.throws(()=>adjudicateCommittedPrediction({
 plan:{...plan,spec:{...plan.spec,snapshot_id:'FORGED'}},
 commitment,prediction_reveal:{graph_families:['G_R','G_D']},
 actual_families:['G_R']}),/PLAN_TAMPERED/);
assert.throws(()=>lockProspectivePlan({
 trial_id:'INCOMPLETE',snapshot_id:'S',heldout_ids:['X'],
 comparison_frame:'SYNTH',controls:['C0','C1','C2','C3']
}),/PLAN_CONTROLS_INCOMPLETE/);
const declared=lockProspectivePlan({
 trial_id:'DECLARED_WITNESS',snapshot_id:'NEW_SOURCE',
 heldout_ids:['NEW_TEST'],comparison_frame:'FROZEN',
 controls:['C0','C1','C2','C3','C4'],
 independent_preoutcome_witness:'externally-asserted-identifier',
 operator_preoutcome_attestation:true
});
assert.equal(declared.chronological_preoutcome_verification,'WITNESS_DECLARED_NOT_INDEPENDENTLY_CHECKED');
console.log('Prospective assay digest, tamper refusal, missing C4 and chronology caution: PASS. Ex ante independent witness never automatically certified.');
