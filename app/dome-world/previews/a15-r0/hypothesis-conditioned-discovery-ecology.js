export const HYPOTHESIS_DISCOVERY_ECOLOGY_SCHEMA='td613.aia.hypothesis-conditioned-discovery-ecology/v0.1';
export const HYPOTHESIS_DISCOVERY_ECOLOGY_SPEC_HEAD='d134503cf3d6fecedccb59ac81f5b9d9a1f0a8d5';
export const MODULUS=31;

const HYPOTHESES=Object.freeze({
 H0:Object.freeze([[3,5],[1,2]].map(r=>Object.freeze(r))),
 H1:Object.freeze([[1,1],[0,1]].map(r=>Object.freeze(r))),
 H2:Object.freeze([[1,0],[1,1]].map(r=>Object.freeze(r))),
 H3:Object.freeze([[2,1],[1,1]].map(r=>Object.freeze(r)))
});
const H_OUT=Object.freeze([[4,1],[1,1]].map(r=>Object.freeze(r)));
const INPUTS=Object.freeze([[1,3],[1,7],[1,11],[1,19]].map(r=>Object.freeze(r)));

function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
function mod(v){return ((Number(v)%MODULUS)+MODULUS)%MODULUS;}
function inv(v){const a=mod(v);if(!a)throw new Error('zero inverse');for(let k=1;k<MODULUS;k+=1)if(mod(a*k)===1)return k;throw new Error('inverse missing');}
function rowMatrix(r,m){return freeze(m[0].map((_,j)=>mod(r.reduce((s,x,i)=>s+x*m[i][j],0))));}
function rowVector(r,v){return mod(r.reduce((s,x,i)=>s+x*v[i],0));}
function det2(m){return mod(m[0][0]*m[1][1]-m[0][1]*m[1][0]);}
function normalize(r){const [a,b]=r.map(mod);if(a){const s=inv(a);return freeze([1,mod(b*s)]);}if(b)return freeze([0,1]);throw new Error('zero direction');}
function canonicalMatrix(m){const v=[m[0][0],m[0][1],m[1][0],m[1][1]].map(mod);const first=v.find(x=>x!==0),s=inv(first);return freeze([[mod(v[0]*s),mod(v[1]*s)],[mod(v[2]*s),mod(v[3]*s)]]);}
function kernelRep(r){const [a,b]=r;if(b)return freeze([1,mod(-a*inv(b))]);return freeze([0,1]);}
function stateId(v){const n=normalize(v);return n[0]===0?'D_inf':`D_${n[1]}`;}
function makeState(v){return freeze({id:stateId(v),vector:normalize(v)});}
function outputSignature(H){return freeze(INPUTS.map(q=>normalize(rowMatrix(q,H))));}

function buildPredictionTable(){return freeze(Object.fromEntries(Object.entries(HYPOTHESES).map(([id,H])=>[id,outputSignature(H)])));}
function buildPriorEcology(predictions){
 const byId=new Map();
 for(const signature of Object.values(predictions))for(const output of signature){const state=makeState(kernelRep(output));byId.set(state.id,state);}
 return freeze([freeze({id:'ZERO',vector:freeze([0,0])}),...([...byId.values()].sort((a,b)=>a.id.localeCompare(b.id)))]);
}
function partition(r,ecology){const buckets=new Map();for(const s of ecology){const val=rowVector(r,s.vector);if(!buckets.has(val))buckets.set(val,[]);buckets.get(val).push(s.id);}return freeze({memberships:freeze([...buckets.values()].map(ids=>freeze([...ids].sort())).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))))});}
function zeroBucket(p){return p.memberships.find(b=>b.includes('ZERO'))??null;}
function decode(p,ecology){const zb=zeroBucket(p);if(!zb)return freeze({status:'KERNEL_DECODER_UNAVAILABLE_WITHOUT_ZERO_ANCHOR',recovered:null});const nz=zb.filter(id=>id!=='ZERO');if(nz.length===0)return freeze({status:'KERNEL_DIRECTION_NOT_REPRESENTED_IN_CALIBRATION_ECOLOGY',recovered:null});if(nz.length!==1)return freeze({status:'KERNEL_DECODER_AMBIGUOUS_ZERO_BUCKET',recovered:null});const state=ecology.find(s=>s.id===nz[0]);const [x,y]=state.vector;return freeze({status:'PROJECTIVE_READOUT_RECOVERED_FROM_ZERO_BUCKET',kernel_state_id:state.id,recovered:normalize([y,mod(-x)])});}
function trial(trueId,trueH,ecology,predictions){
 const observed=INPUTS.map(q=>decode(partition(rowMatrix(q,trueH),ecology),ecology));
 const primary=observed.slice(0,3).map(x=>x.recovered);
 const decoderSupported=primary.every(Boolean);
 const survivors=decoderSupported?Object.entries(predictions).filter(([,sig])=>JSON.stringify(sig.slice(0,3))===JSON.stringify(primary)).map(([id])=>id):[];
 const selected=survivors.length===1?survivors[0]:null;
 const heldoutDecoded=observed[3].recovered;
 const heldoutPredicted=selected?predictions[selected][3]:null;
 return freeze({true_loop_id:trueId,decoder_records:freeze(observed),primary_decoded_signature:freeze(primary),surviving_hypotheses:freeze(survivors),selected_hypothesis:selected,primary_unique:survivors.length===1,heldout_decoded:heldoutDecoded,heldout_predicted:heldoutPredicted,heldout_pass:selected!==null&&JSON.stringify(heldoutDecoded)===JSON.stringify(heldoutPredicted),firewall:freeze({true_loop_exposed_to_ecology_constructor:false,true_loop_exposed_to_partition_decoder:false,true_loop_exposed_to_classifier:false,hypothesis_family_exposed_to_ecology_constructor:true,hypothesis_prediction_table_exposed_to_classifier:true})});
}

export function runHypothesisConditionedDiscoveryEcologyAssay(){
 const ids=Object.keys(HYPOTHESES);const canonicalClasses=ids.map(id=>JSON.stringify(canonicalMatrix(HYPOTHESES[id])));const preflight=ids.every(id=>det2(HYPOTHESES[id])!==0)&&new Set(canonicalClasses).size===ids.length&&det2(H_OUT)!==0&&!canonicalClasses.includes(JSON.stringify(canonicalMatrix(H_OUT)));
 const predictions=buildPredictionTable();const ecology=buildPriorEcology(predictions);const trials=freeze(ids.map(id=>trial(id,HYPOTHESES[id],ecology,predictions)));
 const allInFamilyPass=trials.every(t=>t.primary_unique&&t.selected_hypothesis===t.true_loop_id&&t.heldout_pass);

 const usage=new Map();for(const [hid,sig] of Object.entries(predictions))for(const output of sig){const kid=stateId(kernelRep(output));if(!usage.has(kid))usage.set(kid,new Set());usage.get(kid).add(hid);}
 const exclusiveByHypothesis=freeze(Object.fromEntries(ids.map(id=>[id,freeze([...usage.entries()].filter(([,owners])=>owners.size===1&&owners.has(id)).map(([kid])=>kid).sort())])));
 const priorAblations=freeze(ids.map(id=>{
   const exclusive=exclusiveByHypothesis[id];
   if(exclusive.length===0)return freeze({hypothesis:id,status:'NO_HYPOTHESIS_EXCLUSIVE_KERNEL_STATES_IN_THIS_FIXTURE'});
   const ablated=freeze(ecology.filter(s=>!exclusive.includes(s.id)));const t=trial(id,HYPOTHESES[id],ablated,predictions);const failures=t.decoder_records.map((d,index)=>d.recovered===null?index:null).filter(x=>x!==null);
   return freeze({hypothesis:id,removed_exclusive_kernel_states:exclusive,failed_probe_indices:freeze(failures),decoder_failure_exposed:failures.length>0});
 }));
 const ablationPass=priorAblations.every(a=>a.status==='NO_HYPOTHESIS_EXCLUSIVE_KERNEL_STATES_IN_THIS_FIXTURE'||a.decoder_failure_exposed);

 const outside=trial('H_out',H_OUT,ecology,predictions);let outsideClassification;
 if(outside.decoder_records.slice(0,3).some(d=>d.recovered===null))outsideClassification='OUTSIDE_LOOP_EXCEEDS_PRIOR_CALIBRATION_SUPPORT';
 else if(outside.surviving_hypotheses.length===0)outsideClassification='OUTSIDE_LOOP_OBSERVATIONS_DEFEAT_HYPOTHESIS_FAMILY';
 else if(outside.surviving_hypotheses.length===1&&outside.heldout_pass)outsideClassification='OUTSIDE_LOOP_OBSERVATIONALLY_ALIASES_CANDIDATE_UNDER_FULL_ASSAY_NO_REJECTION_EARNED';
 else outsideClassification='OUTSIDE_LOOP_PRIMARY_ALIAS_REJECTED_OR_UNRESOLVED_BY_HELDOUT';

 const pass=preflight&&ecology.length<33&&allInFamilyPass&&ablationPass&&outsideClassification==='OUTSIDE_LOOP_OBSERVATIONS_DEFEAT_HYPOTHESIS_FAMILY';
 return freeze({
  schema:HYPOTHESIS_DISCOVERY_ECOLOGY_SCHEMA,spec_head:HYPOTHESIS_DISCOVERY_ECOLOGY_SPEC_HEAD,source_status:'SIMULATED',arithmetic_domain:'F_31',
  preflight:freeze({all_hypotheses_invertible_and_projectively_distinct:preflight,hypothesis_ids:freeze(ids),outside_projectively_distinct:true}),
  prediction_table:predictions,
  prior_union_ecology:freeze({state_count:ecology.length,kernel_state_count:ecology.length-1,states:ecology,state_count_reduction_vs_global_33:33-ecology.length,constructed_from_full_hypothesis_family:true,constructed_from_true_identity:false}),
  in_family_trials:trials,
  in_family_all_unique_and_heldout_validated:allInFamilyPass,
  exclusive_kernel_usage:exclusiveByHypothesis,
  prior_family_ablations:freeze({records:priorAblations,all_pass:ablationPass}),
  outside_family_control:freeze({...outside,classification:outsideClassification,oracle_outside_identity_used_to_force_rejection:false}),
  findings:freeze({prior_union_ecology_supports_every_candidate_prediction:Object.values(predictions).flat().every(output=>decode(partition(output,ecology),ecology).recovered!==null),every_in_family_loop_identified_on_first_three_partitions:trials.every(t=>t.primary_unique&&t.selected_hypothesis===t.true_loop_id),every_in_family_heldout_fourth_validated:trials.every(t=>t.heldout_pass),calibration_support_and_hypothesis_adequacy_are_distinct:outside.decoder_records.slice(0,3).every(d=>d.recovered!==null)&&outside.surviving_hypotheses.length===0,oracle_independent_hypothesis_conditioned_discovery_earned_in_fixture:pass,assay_mechanism_validated:pass}),
  bounded_answer:pass?'A_CALIBRATION_ECOLOGY_BUILT_FROM_THE_UNION_OF_PREDICTED_KERNELS_OF_A_PREREGISTERED_LOOP_HYPOTHESIS_FAMILY_SUPPORTS_ORACLE_INDEPENDENT_PARTITION_ONLY_IDENTIFICATION_AND_HELDOUT_VALIDATION_OF_EACH_IN_FAMILY_LOOP_IN_THIS_AUTHORED_F31_FIXTURE':'HYPOTHESIS_CONDITIONED_DISCOVERY_ECOLOGY_ASSAY_FAILED',
  research_label:pass?'HYPOTHESIS_CONDITIONED_PARTITION_ONLY_HOLONOMY_DISCOVERY':'NOT_EARNED',
  claim_ceiling:freeze({oracle_independent_discovery_within_declared_hypothesis_family:pass,unrestricted_open_set_discovery:false,universal_ecological_optimality:false,physical_tomography:false,physical_holonomy:false,proto_loom:false,production_authority:false,vercel_authority:false}),
  promotion_authority:false,production_mutated:false,human_closure_required:true
 });
}
