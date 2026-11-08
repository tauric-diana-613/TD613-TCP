/**
 * 𝌋 Temporal Guardian III — measured paired-episode priority (source-declared research).
 *
 * Quantifies a predeclared, held-out paired binary task versus a competent matched null.
 * Estimates are CONDITIONAL on sampling assumptions and supplied records. Source digests
 * and CI test success do not authenticate external origin. No adoption or source mutation.
 */
import {createHash} from 'node:crypto';
import {proposedTemporalPriority,temporalWitness} from './temporal_guardian.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
const fail=s=>{throw Object.assign(new Error(s),{code:s})};
const shaOK=x=>typeof x==='string'&&/^[0-9a-f]{64}$/i.test(x);
const iso=s=>typeof s==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(s)&&Number.isFinite(Date.parse(s));
const PREC=['RF-081','RF-082','RF-083','RF-084','RF-085','RF-086'],ANCHOR='RF-079';
const FINITE=n=>typeof n==='number'&&Number.isFinite(n);
const sampleList=x=>Array.isArray(x)&&x.length>=64&&x.length<=4096;
const ordered=(a,b)=>iso(a)&&iso(b)&&Date.parse(a)<=Date.parse(b);
function nullScore(id,reasons,diagnostics={}){
 return {rulefield_id:id,standing:'HELD_UNQUALIFIED_PAIRED_EPISODE',reasons:[...new Set(reasons)],
  measures:null,assay_diagnostics:diagnostics,independent_exteriority_witness:false,scientific_utility_proved:false};
}
export function evaluatePairedEpisode(episode,{as_of,familywise_tests=1}={}){
 const id=episode?.rulefield_id??'UNKNOWN',errors=[];
 if(!episode||episode.schema!=='td613.rulefield.paired-episode/v1')errors.push('EPISODE_SCHEMA_INVALID');
 if(!iso(as_of))errors.push('AS_OF_INVALID');
 if(!Number.isInteger(familywise_tests)||familywise_tests<1||familywise_tests>86)errors.push('INVALID_MULTIPLICITY_CORRECTION');
 for(const key of ['evaluation_source_sha256','training_source_sha256','protocol_sha256','cohort_sha256',
   'comparison_frame_sha256','preregistration_sha256','randomization_commitment_sha256']){
  if(!shaOK(episode?.[key]))errors.push('MISSING_OR_INVALID_'+key.toUpperCase());
 }
 if(!iso(episode?.preregistered_at))errors.push('PREREGISTRATION_TIME_INVALID');
 if(!['BINARY_PAIRED_GAIN'].includes(episode?.metric))errors.push('METRIC_NOT_PREREGISTERED_BINARY_PAIRED_GAIN');
 if(episode?.training_source_sha256===episode?.evaluation_source_sha256)errors.push('TRAIN_EVALUATION_SOURCE_COLLISION');
 if(episode?.competent_null_declared!==true)errors.push('NO_COMPETENT_NULL_DECLARED');
 if(episode?.blinded_evaluation_declared!==true)errors.push('BLINDING_NOT_DECLARED');
 if(episode?.task_population_declared!==true)errors.push('UNDECLARED_TARGET_POPULATION');
 if(episode?.iid_trial_assumption_declared!==true)errors.push('INDEPENDENCE_ASSUMPTION_MISSING');
 if(episode?.external_witness_authenticated===true)errors.push('UNVERIFIED_SELF_ATTESTED_EXTERIORITY');
 if(episode?.alpha!==0.05)errors.push('UNSUPPORTED_CONFIDENCE_ALPHA');
 if(episode?.budget_unit!=='TOKENS'&&episode?.budget_unit!=='COST_UNITS')errors.push('BUDGET_UNIT_UNDECLARED');
 if(!FINITE(episode?.budget_per_trial)||episode.budget_per_trial<=0)errors.push('BUDGET_INVALID');
 if(!sampleList(episode?.trials))errors.push('TRIAL_SAMPLE_OUTSIDE_DECLARED_BOUNDS');
 const seen=new Set(),deltas=[],ids=[];
 if(Array.isArray(episode?.trials)){
  for(const t of episode.trials){
   if(!t||typeof t.trial_id!=='string'||!t.trial_id.trim()||seen.has(t.trial_id))
    {errors.push('DUPLICATE_OR_MISSING_TRIAL_ID');continue;}
   seen.add(t.trial_id);ids.push(t.trial_id);
   if(typeof t.candidate_correct!=='boolean'||typeof t.competent_null_correct!=='boolean'){
    errors.push('BINARY_OUTCOME_REQUIRED');continue;
   }
   if(!FINITE(t.candidate_budget)||!FINITE(t.null_budget)||t.candidate_budget<=0||
     t.candidate_budget!==t.null_budget||t.candidate_budget!==episode.budget_per_trial)
    errors.push('UNMATCHED_TRIAL_BUDGET');
   const c=t.clocks;
   if(!c||!ordered(c.event_time,c.recorded_at)||!ordered(c.recorded_at,c.available_at)||
       !ordered(episode.preregistered_at,c.event_time)||!ordered(c.available_at,as_of)){
    errors.push('INVALID_OR_RETROACTIVE_TRIAL_CLOCKS');continue;
   }
   try{
    if(temporalWitness({id:t.trial_id,...c},{as_of}).eligibility!=='SOURCE_EVIDENCE_ADMISSIBLE_AS_OF')
     errors.push('TEMPORAL_WITNESS_HELD');
   }catch{errors.push('TEMPORAL_WITNESS_HELD');}
   deltas.push(Number(t.candidate_correct)-Number(t.competent_null_correct));
  }
 }
 if(errors.length)return nullScore(id,errors,{declared_trials:episode?.trials?.length??0,unique_ids:seen.size});
 const n=deltas.length,mean=deltas.reduce((a,b)=>a+b,0)/n;
 // Hoeffding for [-1,1] independent bounded paired differences:
 // P(|mean-Edelta| >= eps) <= 2 exp(-n*eps^2/2).
 const eps=Math.sqrt(2*Math.log(2*familywise_tests/episode.alpha)/n);
 const bounds=[Math.max(-1,mean-eps),Math.min(1,mean+eps)];
 const positive=deltas.filter(x=>x===1).length,negative=deltas.filter(x=>x===-1).length;
 const report={rulefield_id:id,standing:'QUALIFIED_WITHIN_DECLARED_FINITE_EPISODE_EXTERIORITY_HELD',
  reasons:[],assay_diagnostics:{metric:episode.metric,confidence_assumption:'INDEPENDENT_BOUNDED_PAIRS_DECLARED_NOT_EXTERNALLY_VERIFIED',
   statistical_interval:'TWO_SIDED_HOEFFDING_BONFERRONI_UP_TO_86',population_generalization:false,
   placebo_or_randomization_checks_independently_validated:false,preregistration_time_independently_verified:false},
  frame:{evaluation_source_sha256:episode.evaluation_source_sha256,
   protocol_sha256:episode.protocol_sha256,cohort_sha256:episode.cohort_sha256,
   comparison_frame_sha256:episode.comparison_frame_sha256,randomization_commitment_sha256:episode.randomization_commitment_sha256,
   budget_unit:episode.budget_unit,budget_per_trial:episode.budget_per_trial,
   preregistration_sha256:episode.preregistration_sha256,
   trial_set_sha256:hash(JSON.stringify([...ids].sort()))},
  measures:{n,mean_paired_gain:mean,confidence_bounds:bounds,
   positive_pairs:positive,negative_pairs:negative,ties:n-positive-negative,
   familywise_tests,conditional_joint_coverage_at_least:1-episode.alpha,confidence_lower_above_zero:bounds[0]>0},
  independent_exteriority_witness:false,scientific_utility_proved:false,
  human_authorization:false};
 return report;
}
function compatible(x,y){
 if(x.standing!=='QUALIFIED_WITHIN_DECLARED_FINITE_EPISODE_EXTERIORITY_HELD'||
   y.standing!=='QUALIFIED_WITHIN_DECLARED_FINITE_EPISODE_EXTERIORITY_HELD')return false;
 const fields=['evaluation_source_sha256','protocol_sha256','cohort_sha256','comparison_frame_sha256','randomization_commitment_sha256',
  'budget_unit','budget_per_trial','trial_set_sha256'];
 return fields.every(k=>x.frame[k]===y.frame[k])&&x.measures.n===y.measures.n;
}
export function pairedPriorityPreview({episodes={},as_of,plan=proposedTemporalPriority()}={}){
 if(!plan||plan.schema!=='td613.rulefield.temporal-priority-proposal/v1'||plan.historical?.length!==70||
   plan.proposed_rulefield_order?.length!==86)fail('PRIORITY_BASELINE_INVALID');
 if(!iso(as_of))fail('AS_OF_INVALID');
 if(!episodes||typeof episodes!=='object'||Array.isArray(episodes))fail('INVALID_EPISODE_MAPPING');
 const ids=new Set(plan.proposed_rulefield_order);
 for(const id of Object.keys(episodes)){
  if(!ids.has(id)||episodes[id]?.rulefield_id!==id)fail('UNKNOWN_OR_MISMATCHED_FIELD_EPISODE');
 }
 const evaluations=Object.fromEntries(plan.proposed_rulefield_order.map(id=>
  [id,evaluatePairedEpisode(episodes[id],{as_of,familywise_tests:86})]));
 const order=[...plan.proposed_rulefield_order],comparisons=[];
 // Adjacent, information/budget/cohort matched tests; no jumps past missing evidence.
 for(let pass=0;pass<86;pass++){
  let changed=false;
  for(let i=0;i<85;i++){
   const left=evaluations[order[i]],right=evaluations[order[i+1]];
   if(!compatible(left,right))continue;
   const [ll,lu]=left.measures.confidence_bounds,[rl,ru]=right.measures.confidence_bounds;
   const outcome=rl>lu?'RIGHT_STRICTLY_DOMINATES':ll>ru?'LEFT_STRICTLY_DOMINATES':'OVERLAPPING_UNCERTAINTY';
   comparisons.push({left:order[i],right:order[i+1],outcome,matched_frame:true,
    scientific_utility_proved:false,operator_adoption:false});
   if(outcome==='RIGHT_STRICTLY_DOMINATES'){[order[i],order[i+1]]=[order[i+1],order[i]];changed=true;}
  }
  if(!changed)break;
 }
 const depOK=PREC.every(x=>order.indexOf(x)<order.indexOf(ANCHOR));
 const final=depOK?order:[...plan.proposed_rulefield_order];
 const moves=final.map((id,i)=>({id,from:plan.proposed_rulefield_order.indexOf(id)+71,to:i+71}))
  .filter(x=>x.from!==x.to);
 const body={schema:'td613.rulefield.paired-empirical-priority/v1',status:'DECLARED_FINITE_COMPARATIVE_PRIORITY_NOT_EXTERIORITY_VERIFIED',
  as_of,ranked_ids:final,original_70:plan.historical.map(x=>({id:x.id,rank:x.rank})),
  evaluations,comparisons,moves,counts:{provisional_fields:86,qualified_internal:Object.values(evaluations)
   .filter(x=>x.standing==='QUALIFIED_WITHIN_DECLARED_FINITE_EPISODE_EXTERIORITY_HELD').length,
   held:Object.values(evaluations).filter(x=>x.standing!=='QUALIFIED_WITHIN_DECLARED_FINITE_EPISODE_EXTERIORITY_HELD').length,
   moves:moves.length},
  constraints:{prerequisites:PREC,precedes:ANCHOR,all_historical_70_unchanged:true,
   dependency_preserved:depOK||moves.length===0,independent_witness_verified:false,
   score_is_binary_accuracy_gain_not_shannon_information:true,
   synthetic_fixtures_only_in_CI:true},
  authority:{merge:false,canonical_mutation:false,operator_acceptance:false,od02:'HELD',
   protected_flight:'HELD',human_scientific_closure:'RESERVED',exteriority_claim:false}};
 return {...body,digest:hash(JSON.stringify(body))};
}
export function validatePairedPriority(p,plan=proposedTemporalPriority()){
 if(p?.schema!=='td613.rulefield.paired-empirical-priority/v1')return false;
 const {digest,...b}=p;
 return hash(JSON.stringify(b))===digest&&p.ranked_ids.length===86&&
 new Set(p.ranked_ids).size===86&&
 p.original_70.length===70&&p.original_70.every((x,i)=>x.id===plan.historical[i].id&&x.rank===plan.historical[i].rank)&&
 PREC.every(x=>p.ranked_ids.indexOf(x)<p.ranked_ids.indexOf(ANCHOR))&&
 p.authority.canonical_mutation===false&&p.authority.protected_flight==='HELD';
}
