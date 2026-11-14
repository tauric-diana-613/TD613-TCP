/**
 * 𝌋 Source-free comparative toy assays for recovered Rulefield methods.
 * Formal models are reproducible conceptual instruments, not external evidence,
 * not diagnoses, and not a physical/social thermodynamics equivalence proof.
 */
const fail=code=>{throw Object.assign(new Error(code),{code})};
export function evelynReprocess({source,receivers}){
 if(typeof source!=='string'||!Array.isArray(receivers)||receivers.length<2)fail('RECEIVER_MODEL_INVALID');
 const results=receivers.map(r=>{
  if(!r||typeof r.id!=='string'||typeof r.lens!=='string')fail('RECEIVER_INVALID');
  return {receiver:r.id,rendered_interpretation:r.lens+' :: '+source,
   source_bytes_unchanged:true,authority_added:false,receiver_knowledge_not_guaranteed:true};
 });
 return {model:'EV_REPROCESS_V1',results,actual_human_response_observed:false,
  same_source_distinct_lenses:results[0].rendered_interpretation!==results[1].rendered_interpretation,
  authorization_transferred:false,empirical_claim_ceiling:'FINITE_SYNTHETIC_CONSTRUCTION'};
}
export function latifaOpenField({existing,candidates}){
 if(!Array.isArray(existing)||!Array.isArray(candidates))fail('OPEN_FIELD_INVALID');
 const seen=new Set(existing);const additions=[];
 for(const c of candidates){if(typeof c!=='string'||!c.trim())fail('OPEN_FIELD_CANDIDATE_INVALID');if(!seen.has(c)){seen.add(c);additions.push(c)}}
 return {model:'LATIFA_OPEN_FIELD_V1',hypotheses:[...seen],new_hypotheses:additions,
  tested_hypotheses:0,proved_hypotheses:0,authority_escalated:false,
  condition:'Each candidate requires its own falsifier, null and external witness before empirical promotion'};
}
export function zeroBounce({launches,registrations,independent_witness=null}){
 for(const k of [launches,registrations])if(!Number.isInteger(k)||k<0)fail('EVENT_COUNT_INVALID');
 if(registrations>launches)fail('REGISTERED_COUNT_EXCEEDS_DECLARED_LAUNCHES_IN_SIMPLE_MODEL');
 const observation=registrations===0?'ZERO_REGISTERED_BOUNCES':'SOME_REGISTERED_BOUNCES';
 return {model:'ZERO_BOUNCE_OBSERVABILITY_V1',declared_internal_launches:launches,registered_events:registrations,
  observation,zero_bounce_anomaly:launches>0&&registrations===0,
  observation_alone_cannot_distinguish_no_launch_from_unregistered_launch:registrations===0,
  independent_witness:independent_witness===null?'NOT_SUPPLIED':independent_witness,
  independent_source_authenticated:false,
  epistemic_state:'DECLARED_INTERNAL_COUNTER_NOT_A_REGISTERED_SENSOR_WITNESS',
  counterworlds:registrations===0?[
   {world:'W0',internal_launches:0,registered_bounces:0},
   {world:'W1',internal_launches:Math.max(1,launches),registered_bounces:0}
  ]:[],
  claim_ceiling:'FINITE_SYNTHETIC_OBSERVABILITY_WITNESS_NOT_EXTERNAL_PHYSICAL_PROOF'};
}
const clamp=x=>Math.min(1,Math.max(0,x));
export function coupledFeedback({steps=8,x0=.12,a0=.12,alpha=.6,beta=.6,delta=.10,gamma=.10,feedback=true}={}){
 if(!Number.isInteger(steps)||steps<1||steps>128)fail('FEEDBACK_HORIZON_INVALID');
 for(const v of [x0,a0,alpha,beta,delta,gamma])if(!Number.isFinite(v)||v<0||v>1)fail('FEEDBACK_PARAMETER_INVALID');
 let x=x0,a=a0;const trajectory=[{t:0,human_state:x,agent_state:a}];
 for(let t=1;t<=steps;t++){
  const nx=clamp((1-delta)*x + alpha*a);
  const na=clamp((1-gamma)*a + (feedback?beta*x:0));
  x=nx;a=na;
  trajectory.push({t,human_state:x,agent_state:a});
 }
 return {model:'HUMAN_AGENT_ABSTRACT_FEEDBACK_V1',params:{steps,x0,a0,alpha,beta,delta,gamma,feedback},
  trajectory,final_human_state:x,final_agent_state:a,
  observed_subjects:0,diagnoses_made:0,
  interpretation:'Conditional amplification in stipulated model; real human experiences, clinical outcomes and prevalence not inferred.',
  claim_ceiling:'FINITE_SYNTHETIC_MODEL_ONLY'};
}
export function feedbackAblation(opts={}){
 const withFeedback=coupledFeedback({...opts,feedback:true});
 const nullFeedback=coupledFeedback({...opts,feedback:false});
 return {model:'INFORMATION_MATCHED_FEEDBACK_ABLATION_V1',
  candidate:withFeedback,null_model:nullFeedback,
  final_difference:withFeedback.final_human_state-nullFeedback.final_human_state,
  epistemic_credit:'MODEL_COMPARISON_ONLY',real_world_diagnosis:false};
}
export function shannonEntropy(probs,{unit='bits'}={}){
 if(!Array.isArray(probs)||probs.length===0||probs.some(p=>!Number.isFinite(p)||p<0))fail('PROBABILITY_VECTOR_INVALID');
 const total=probs.reduce((a,b)=>a+b,0);
 if(Math.abs(total-1)>1e-10)fail('PROBABILITIES_MUST_SUM_TO_ONE');
 if(!['bits','nats'].includes(unit))fail('ENTROPY_UNIT_INVALID');
 const divisor=unit==='bits'?Math.log(2):1;
 return -probs.filter(p=>p>0).reduce((a,p)=>a+p*Math.log(p),0)/divisor;
}
export function typedThermodynamicEmbedding({thermodynamic_variables,social_variables,mapping,preserved_relations=[]}){
 if(!Array.isArray(thermodynamic_variables)||!Array.isArray(social_variables)||!Array.isArray(mapping))fail('EMBEDDING_INPUT_INVALID');
 const src=new Map(thermodynamic_variables.map(x=>[x.id,x]));
 const dest=new Map(social_variables.map(x=>[x.id,x]));
 const outputs=new Set();const issues=[];
 for(const m of mapping){
  if(!src.has(m.from)||!dest.has(m.to))issues.push('UNDECLARED_MAPPED_VARIABLE');
  if(outputs.has(m.to))issues.push('NONINJECTIVE_MAPPING');
  outputs.add(m.to);
  const a=src.get(m.from),b=dest.get(m.to);
  if(a&&b&&a.units!==b.units&&!m.declared_dimensionless_normalization)issues.push('UNSUPPORTED_DIMENSION_TRANSFER:'+m.from);
 }
 for(const relation of preserved_relations){
  if(!relation?.source_predicate||!relation?.target_predicate||relation.test_witness!==true)issues.push('RELATION_PRESERVATION_UNWITNESSED');
 }
 if(preserved_relations.length===0)issues.push('NO_RELATIONS_TESTED');
 const candidate=issues.length===0;
 return {schema:'td613.rulefield.partial-thermosocial-embedding/v1',
  literal_operator_notation:'thermodynamics ∈₌ social field theory',
  interpretation:'partial typed map Φ defined on a subdomain; not standard mathematical operator',
  formal_candidate:'Φ:D⊆ThermodynamicModel→SocialFieldModel',
  map_admissibility:candidate?'FORMALLY_ADMISSIBLE_WITH_DECLARED_TESTS_ONLY':'HELD_UNPROVED_MAPPING',
  issues,physical_law_transferred:false,social_thermodynamic_equivalence_proved:false,
  claim_ceiling:'TOY_TYPED_MAPPING_NOT_EMPIRICAL_VALIDATION'};
}
