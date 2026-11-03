/**
 * TD613 Atelier prospective assay gates v0.2.
 * Ensures commitments/predictions are byte-consistent, not that an external
 * timestamp, randomized control, participant consent or independent witness exists.
 * Do not retroactively "complete" held 2026 Wendbine controls using this module.
 */
import { createHash } from 'node:crypto';
const guard=(v,msg)=>{if(!v)throw Error(msg)};
const str=x=>typeof x==='string'&&x.trim().length>0;
function canonical(x){
 if(Array.isArray(x))return '['+x.map(canonical).join(',')+']';
 if(x&&typeof x==='object'){
  return '{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}';
 }
 return JSON.stringify(x);
}
const sha=x=>createHash('sha256').update(canonical(x)).digest('hex');
export function lockProspectivePlan({trial_id,snapshot_id,heldout_ids,comparison_frame,
  controls,independent_preoutcome_witness=null,operator_preoutcome_attestation=false}){
 guard(str(trial_id)&&str(snapshot_id)&&str(comparison_frame),'PLAN_ID_EPOCH_FRAME');
 guard(Array.isArray(heldout_ids)&&heldout_ids.length>0&&heldout_ids.every(str)
  &&new Set(heldout_ids).size===heldout_ids.length,'PLAN_HELDOUT_TARGET_INVALID');
 guard(Array.isArray(controls)&&['C0','C1','C2','C3','C4'].every(k=>controls.includes(k)),
  'PLAN_CONTROLS_INCOMPLETE');
 const spec={trial_id,snapshot_id,heldout_ids:[...heldout_ids].sort(),comparison_frame,
  controls:[...new Set(controls)].sort()};
 const commitment=sha(spec);
 const external=str(independent_preoutcome_witness)&&operator_preoutcome_attestation===true;
 return {schema:'td613.atelier-prospective-plan/v0.2',spec,
  sha256:commitment,
  independent_preoutcome_witness:external?independent_preoutcome_witness:null,
  chronological_preoutcome_verification:external?'WITNESS_DECLARED_NOT_INDEPENDENTLY_CHECKED':'UNESTABLISHED',
  state:'LOCKED_BYTES_TIMING_NOT_INDEPENDENTLY_VERIFIED',
  original_historical_held_states_unmodified:true};
}
export function commitHeldoutPrediction({plan,target_id,prediction,local_lock_label}){
 guard(plan?.schema==='td613.atelier-prospective-plan/v0.2'&&str(plan.sha256),'PLAN_REQUIRED');
 guard(plan.spec.heldout_ids.includes(target_id)&&str(local_lock_label),'PREDICTION_TARGET_OR_LOCK_LABEL');
 guard(prediction&&Array.isArray(prediction.graph_families)&&
  prediction.graph_families.every(str),'PREDICTION_CONTENT_INVALID');
 const payload={plan_sha256:plan.sha256,target_id,
  graph_families:[...new Set(prediction.graph_families)].sort(),
  local_lock_label};
 return {schema:'td613.atelier-prediction-commitment/v0.2',
  sha256:sha(payload),payload,
  chronology:'LOCAL_DIGEST_ONLY_PRE_REVEAL_ORDER_NOT_EXTERNALLY_VERIFIED',
  target_observation_included:false,
  state:'COMMITTED_LOCALLY_UNADJUDICATED'};
}
export function adjudicateCommittedPrediction({plan,commitment,prediction_reveal,actual_families,
  independent_reveal_witness=null}){
 guard(plan?.schema==='td613.atelier-prospective-plan/v0.2'&&
  commitment?.schema==='td613.atelier-prediction-commitment/v0.2','PLAN_PREDICTION_SCHEMA');
 guard(commitment.payload.plan_sha256===plan.sha256&&
  sha(plan.spec)===plan.sha256,'PLAN_TAMPERED');
 guard(Array.isArray(actual_families)&&actual_families.every(str),'ACTUAL_GRAPH_FAMILIES_INVALID');
 guard(prediction_reveal&&Array.isArray(prediction_reveal.graph_families)&&
  prediction_reveal.graph_families.every(str),'PREDICTION_REVEAL_INVALID');
 const replay={plan_sha256:plan.sha256,target_id:commitment.payload.target_id,
  graph_families:[...new Set(prediction_reveal.graph_families)].sort(),
  local_lock_label:commitment.payload.local_lock_label};
 guard(sha(replay)===commitment.sha256,'PREDICTION_COMMITMENT_MISMATCH');
 const p=new Set(replay.graph_families),actual=new Set(actual_families);
 const correct=[...p].filter(x=>actual.has(x)).length;
 const denom=p.size+actual.size;
 const dice=denom?2*correct/denom:null;
 return {schema:'td613.atelier-prospective-adjudication/v0.2',
  plan_sha256:plan.sha256,target_id:replay.target_id,score_dice:dice,
  matching_graph_families:correct,actual_count:actual.size,predicted_count:p.size,
  bytes_binding_verified:true,
  independent_preoutcome_witness_verified:false,
  independent_reveal_witness_declared: str(independent_reveal_witness),
  readiness:'LOCAL_SCORE_ONLY_PROSPECTIVE_TIMING_UNESTABLISHED',
  original_historical_held_states_unmodified:true,
  scientific_novelty_earned:false,
  claim_ceiling:'DIGEST_BOUND_SOURCE_CLASS_SCORE_NO_INDEPENDENT_CHRONOLOGY_CAUSALITY_OR_NOVELTY'};
}
