#!/usr/bin/env node
/**
 * Wendbine / Vixen machine-only Maestro methodology continuity assay.
 * The state machine changes its hypotheses in response to a recorded observation,
 * but never treats the operator's report as verified historical source evidence.
 * No external network access, original-archive mutations, or Vixen performer import.
 */
import {createHash} from 'node:crypto';
import {runNativeWendbineAssay} from './wendbine-proscenium-assay.mjs';

const h=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const hold=x=>{throw Error(x)};
const accepts=x=>typeof x==='string'&&x.length<=500;
const maxSteps=12; // computational loop bound, NOT an arbitrary research stage count.
function seal(record){
 const payload={...record};
 return {...payload,receipt_sha256:h(payload)};
}
export function verifyPriorStep(prior){
 if(!prior||prior.schema!=='td613.wendbine.maestro-loop/v1'||!/^[a-f0-9]{64}$/.test(prior.receipt_sha256||''))
  hold('HELD_MAESTRO_PRIOR_RECEIPT_REQUIRED');
 const {receipt_sha256,...remainder}=prior;
 if(receipt_sha256!==h(remainder))hold('HELD_MAESTRO_PRIOR_HASH_MISMATCH');
 if(prior.step_index<0||prior.step_index>=maxSteps)hold('HELD_MAESTRO_STEP_BOUND');
 if(prior.human_closure_required!==true||prior.scientific_credit!==0||
    prior.source_promotion!==false)hold('HELD_MAESTRO_CLAIM_ESCALATION');
 return prior;
}
export function advanceMaestroObservation(prior,observation){
 verifyPriorStep(prior);
 if(prior.state==='STOPPED_EVIDENCE_BOUNDARY'||prior.state==='FINISHED_HELD')
  hold('HELD_MAESTRO_STOPPED_REQUIRES_NEW_SESSION');
 if(!observation||typeof observation!=='object'||Array.isArray(observation))
  hold('HELD_MAESTRO_TYPED_OBSERVATION_REQUIRED');
 const code=String(observation.kind||'');
 const allowed=['CONTROL_MATCHED_BASELINE','SOURCE_PROVENANCE_DISPUTED',
  'OPERATOR_REPORTED_SOURCE','NO_NEW_EVIDENCE','CONTROL_DISTINGUISHED_BASELINE'];
 if(!allowed.includes(code))hold('HELD_MAESTRO_UNKNOWN_OBSERVATION');
 if(Object.keys(observation).some(k=>!['kind','source_id','note'].includes(k)))
  hold('HELD_MAESTRO_UNKNOWN_REPORT_FIELDS');
 const source_id=observation.source_id||null;
 if(source_id!==null&&!/^reddit:t3_[a-z0-9]{5,12}$/.test(source_id))
  hold('HELD_MAESTRO_SOURCE_ID_INVALID');
 const note=observation.note??null;
 if(note!==null&&!accepts(note))hold('HELD_MAESTRO_UNBOUNDED_REPORT');
 const nextIndex=prior.step_index+1;
 const key={
  CONTROL_MATCHED_BASELINE:{
   hypothesis:'GENERIC_VOCABULARY_OR_RETROSPECTIVE_LABEL_LEAKAGE',
   tension:'ADVERSE_CONTROL_NOT_WORSE_THAN_RECONSTRUCTION',
   next:{kind:'DESIGN_BLINDED_DISCRIMINATOR',human_action_required:true,
    instructions:'Obtain a source-bound target concealed from the predictor and record a predeclared metric before revealing outcome'}},
  SOURCE_PROVENANCE_DISPUTED:{
   hypothesis:'CUSTODY_OR_VERSION_CONFLICT_UNRESOLVED',
   tension:'OBSERVED_CLAIM_DEPENDS_ON_DISPUTED_CAPTURE',
   next:{kind:'RETRIEVE_ORIGINAL_VERSION_AND_CAPTURE_PROOF',human_action_required:true,
    instructions:'Inspect title/body hashes, capture times and external origin receipts; do not substitute paraphrase'}},
  OPERATOR_REPORTED_SOURCE:{
   hypothesis:'NEW_SOURCE_PROPOSED_UNVERIFIED',
   tension:'PERSON_REPORT_IS_NOT_A_BYTE_VERIFIED_OBSERVATION',
   next:{kind:'VERIFY_EXTERNAL_SOURCE_BEFORE_RERANKING',human_action_required:true,
    instructions:'Supply a lawful immutable source receipt and an independent acquisition timestamp for later admission review'}},
  NO_NEW_EVIDENCE:{
   hypothesis:'HYPOTHESIS_INDETERMINATE_AT_OBSERVABILITY_SHORE',
   tension:'NO_NEW_EXOGENOUS_WITNESS',
   next:{kind:'STOP_AND_HOLD',human_action_required:false,
    instructions:'No new result is available; preserve existing uncertainty'}},
  CONTROL_DISTINGUISHED_BASELINE:{
   hypothesis:'POSSIBLE_PUBLIC_TOPOLOGY_CONSTRAINT_PENDING_REPLICATION',
   tension:'SINGLE_RETROSPECTIVE_CONTROL_DIFFERENCE_NOT_ESTABLISHMENT',
   next:{kind:'SEEK_NEW_PREREGISTERED_TARGET',human_action_required:true,
    instructions:'Preregister independent targets and controls before their observation; seek time-matched capture'}},
 }[code];
 const stop=code==='NO_NEW_EVIDENCE'||nextIndex>=maxSteps;
 return seal({
  schema:'td613.wendbine.maestro-loop/v1',step_index:nextIndex,
  parent_receipt_sha256:prior.receipt_sha256,
  original_target_source_id:prior.original_target_source_id,
  public_snapshot_id:prior.public_snapshot_id,
  latest_observation_kind:code,latest_observation_source_id:source_id,
  operator_report_sha256:note===null?null:h(note),
  report_evidence_class:'UNVERIFIED_OPERATOR_REPORT_NOT_ARCHIVED_SOURCE',
  hypothesis:key.hypothesis,tension:key.tension,
  next_action:stop?{kind:'STOP_AND_HOLD',human_action_required:false,
    instructions:'Reached evidence/finite computation boundary'}:key.next,
  alternate_hypotheses:prior.alternate_hypotheses,
  state:stop?'STOPPED_EVIDENCE_BOUNDARY':'HUMAN_ACTION_REQUIRED',
  source_promotion:false,external_source_verified:false,
  research_estate:'WENDBINE_PUBLIC_SNAPSHOT_ONLY',
  public_vixen_performers_added:0,
  native_method_parity:'HELD_UNPROVEN',scientific_credit:0,
  human_closure_required:true});
}
export async function startMaestroMethodJourney({target_source_id,question=null}={}){
 if(!/^reddit:t3_[a-z0-9]{5,12}$/.test(target_source_id||''))
  hold('HELD_MAESTRO_REGISTERED_TARGET_REQUIRED');
 if(question!==null&&!accepts(question))hold('HELD_MAESTRO_QUERY_BOUNDS');
 const native=await runNativeWendbineAssay({mode:'journey',target_source_id,question});
 const body=native.journey;
 if(!body||native.state!=='HELD_RECONSTRUCTION_NOT_ADJUDICATED')
  hold('HELD_MAESTRO_ORIGINAL_ASSAY_RECEIPT_REQUIRED');
 const opposing=native.controls.C2.scoring.graph_hits>=native.controls.C0.scoring.graph_hits;
 const next=opposing?{
   kind:'TEST_NEGATIVE_CONTROL_AND_TITLE_LEAKAGE',human_action_required:true,
   instructions:'A permuted-label counterworld did not lose ground; obtain a genuinely blinded source-bound target before drawing architectural conclusions'}:
   body.next_steps[0];
 return seal({schema:'td613.wendbine.maestro-loop/v1',
  step_index:0,parent_receipt_sha256:null,
  original_target_source_id:target_source_id,
  public_snapshot_id:native.snapshot_id,
  baseline_assay_receipt_sha256:h(native),
  latest_observation_kind:'NATIVE_PUBLIC_RETROSPECTIVE_ASSAY',
  latest_observation_source_id:null,operator_report_sha256:null,
  report_evidence_class:'ORIGINAL_PUBLIC_REGISTRY_PLUS_TD613_DERIVED_ASSAY',
  hypothesis:body.hypothesis,tension:opposing?'NEGATIVE_CONTROL_CHALLENGES_BASELINE':'UNVERIFIED_RETROSPECTIVE_BASELINE',
  next_action:next,
  alternate_hypotheses:body.alternate_hypotheses,
  state:'HUMAN_ACTION_REQUIRED',
  source_promotion:false,external_source_verified:false,
  research_estate:'WENDBINE_PUBLIC_SNAPSHOT_ONLY',
  public_vixen_performers_added:0,
  native_method_parity:'HELD_UNPROVEN',scientific_credit:0,
  human_closure_required:true});
}
export async function invokeMaestroMethodLoop(payload={}){
 const action=String(payload.action||'start');
 if(action==='start')return startMaestroMethodJourney(payload);
 if(action==='report')return advanceMaestroObservation(payload.previous_receipt,payload.observation);
 if(action==='finish'){
  const prior=verifyPriorStep(payload.previous_receipt);
  return seal({...prior,step_index:prior.step_index+1,
   parent_receipt_sha256:prior.receipt_sha256,
   state:'FINISHED_HELD',next_action:{kind:'STOP_AND_HOLD',human_action_required:false},
   latest_observation_kind:'OPERATOR_ENDED_SESSION',
   receipt_sha256:undefined});
 }
 hold('HELD_MAESTRO_ACTION_NOT_ALLOWED');
}
