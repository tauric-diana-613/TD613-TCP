/** 𝌋 Temporal Guardian II: evidence-conditioned, conservative priority tomography.
 * Ranks are ONLY reversible policy previews. No absent evidence becomes a low score.
 * Internal or synthetic receipts never supply independently authenticated exteriority.
 */
import {createHash} from 'node:crypto';
import {proposedTemporalPriority,temporalWitness} from './temporal_guardian.mjs';
const sha=s=>createHash('sha256').update(s).digest('hex');
const fail=s=>{throw Object.assign(new Error(s),{code:s})};
const PRE=['RF-081','RF-082','RF-083','RF-084','RF-085','RF-086'];
const ANCHOR='RF-079';
const decimal=n=>Math.round(n*1e9)/1e9;
function hasValidNumber(v){return typeof v==='number'&&Number.isFinite(v);}
function validateMetric(m){
 if(!m||typeof m!=='object'||!Array.isArray(m.discrimination_bits_bounds)||m.discrimination_bits_bounds.length!==2)return false;
 const [l,u]=m.discrimination_bits_bounds;
 return hasValidNumber(l)&&hasValidNumber(u)&&l>=0&&u>=l&&
   hasValidNumber(m.assay_cost_units)&&m.assay_cost_units>0&&
   hasValidNumber(m.falsification_readiness)&&m.falsification_readiness>=0&&m.falsification_readiness<=1;
}
function assessReceipt(id,r,as_of){
 const reasons=[];
 if(!r||typeof r!=='object'||Array.isArray(r))return {id,eligible:false,reasons:['NO_DECLARED_EVIDENCE'],score:null};
 let temporal=null;
 try{temporal=temporalWitness({id,event_time:r.event_time,recorded_at:r.recorded_at,
  available_at:r.available_at,operator_decided_at:r.operator_decided_at??null,
  projected_future_at:r.projected_future_at??null},{as_of});}
 catch{reasons.push('INVALID_EVENT_CLOCKS');}
 if(temporal&&temporal.eligibility!=='SOURCE_EVIDENCE_ADMISSIBLE_AS_OF')reasons.push('EVIDENCE_NOT_AVAILABLE_AS_OF');
 if(temporal?.flags.includes('COUNTERFACTUAL_FUTURE_IS_NOT_CURRENT_EVIDENCE'))reasons.push('FUTURE_SCENARIO_NOT_CURRENT_EVIDENCE');
 if(typeof r.evidence_id!=='string'||!r.evidence_id.trim())reasons.push('MISSING_EVIDENCE_ID');
 if(typeof r.source_sha256!=='string'||!/^[a-f0-9]{64}$/i.test(r.source_sha256))reasons.push('MISSING_SOURCE_DIGEST');
 if(typeof r.comparison_frame!=='string'||!r.comparison_frame.trim())reasons.push('MISSING_COMPARISON_FRAME');
 if(!['SYNTHETIC','INTERNAL_PROVENANCE','DECLARED_EXTERNAL'].includes(r.evidence_kind))reasons.push('UNKNOWN_EVIDENCE_KIND');
 if(!validateMetric(r.metric))reasons.push('UNQUALIFIED_COMPARATIVE_METRIC');
 // Matching a frame label alone does not prove source/assay equivalence; it is declared.
 if(typeof r.measurement_protocol_sha256!=='string'||!/^[a-f0-9]{64}$/i.test(r.measurement_protocol_sha256))
  reasons.push('MISSING_MEASUREMENT_PROTOCOL_DIGEST');
 if(typeof r.verification_time!=='string')reasons.push('MISSING_VERIFICATION_TIME');
 else {
  try{
   const t=temporalWitness({id:id+'-verification',event_time:r.event_time,
    recorded_at:r.recorded_at,available_at:r.verification_time},{as_of});
   if(t.eligibility!=='SOURCE_EVIDENCE_ADMISSIBLE_AS_OF')reasons.push('VERIFICATION_NOT_AVAILABLE_AS_OF');
   if(r.available_at&&Date.parse(r.verification_time)<Date.parse(r.available_at))
    reasons.push('VERIFICATION_PRECEDES_AVAILABILITY');
  }catch{reasons.push('INVALID_VERIFICATION_TIME');}
 }
 const eligible=reasons.length===0;
 const [lower,upper]=eligible?r.metric.discrimination_bits_bounds:[0,0];
 const readiness=eligible?r.metric.falsification_readiness:0;
 const cost=eligible?r.metric.assay_cost_units:1;
 return {id,eligible,reasons,temporal:temporal?.eligibility??'HELD',
  comparison_frame:r.comparison_frame??null,measurement_protocol_sha256:r.measurement_protocol_sha256??null,
  evidence_kind:r.evidence_kind??null,source_sha256:r.source_sha256??null,
  score:eligible?{lower:decimal(lower*readiness/cost),upper:decimal(upper*readiness/cost),
    unit:'DECLARED_BITS_PER_COST_UNIT_WEIGHTED_BY_FALSIFIABILITY',
    evidence_status:'RECEIPT_DECLARED_NOT_INDEPENDENTLY_AUTHENTICATED',
    scientific_utility_proved:false}:null};
}
function strictDominance(a,b){
 return a.score.lower>b.score.upper?'A_OVER_B':b.score.lower>a.score.upper?'B_OVER_A':'INCOMPARABLE_INTERVALS';
}
export function evidenceConditionedPriority({plan=proposedTemporalPriority(),receipts={},as_of}={}){
 if(!plan||plan.schema!=='td613.rulefield.temporal-priority-proposal/v1'||plan.historical.length!==70||
   plan.proposed_rulefield_order.length!==86)fail('TEMPORAL_PRIORITY_BASELINE_INVALID');
 if(typeof as_of!=='string')fail('MISSING_AS_OF_CUTOFF');
 // Validate time even if no receipts; bad as-of may not silently certify an empty queue.
 temporalWitness({id:'cutoff',event_time:as_of,recorded_at:as_of,available_at:as_of},{as_of});
 if(!receipts||typeof receipts!=='object'||Array.isArray(receipts))fail('INVALID_RECEIPT_MAP');
 const validIDs=new Set(plan.proposed_rulefield_order);
 for(const id of Object.keys(receipts))if(!validIDs.has(id))fail('UNKNOWN_RECEIPT_RULEFIELD');
 const assessments=Object.fromEntries(plan.proposed_rulefield_order.map(id=>[id,assessReceipt(id,receipts[id],as_of)]));
 const output=[...plan.proposed_rulefield_order];
 const groups=new Map();
 for(const id of output){
  const a=assessments[id];
  if(!a.eligible)continue;
  const group=a.comparison_frame+'|'+a.measurement_protocol_sha256;
  if(!groups.has(group))groups.set(group,[]);
  groups.get(group).push(id);
 }
 const comparisons=[],moves=[];
 for(const [frame,ids] of groups){
  if(ids.length<2)continue;
  const positions=ids.map(id=>output.indexOf(id)).sort((a,b)=>a-b);
  const sorted=positions.map(i=>output[i]);
  // Stable repeated adjacent dominance sweeps. Overlapping intervals do not authorize reversal.
  for(let pass=0;pass<sorted.length;pass++)for(let j=0;j<sorted.length-1;j++){
   const left=assessments[sorted[j]],right=assessments[sorted[j+1]];
   const relation=strictDominance(left,right);
   comparisons.push({left:sorted[j],right:sorted[j+1],frame,relation,
     actual_independent_empirical_witness:false});
   if(relation==='B_OVER_A'){const t=sorted[j];sorted[j]=sorted[j+1];sorted[j+1]=t;}
  }
  positions.forEach((idx,i)=>{output[idx]=sorted[i]});
 }
 const idx=output.indexOf(ANCHOR);
 const dependencyOk=PRE.every(x=>output.indexOf(x)<idx);
 const finalOrder=dependencyOk?output:[...plan.proposed_rulefield_order];
 const old=plan.proposed_rulefield_order;
 for(let i=0;i<86;i++)if(finalOrder[i]!==old[i])moves.push({field:finalOrder[i],
  inherited_proposed_rank:old.indexOf(finalOrder[i])+71,preview_rank:i+71});
 const historical=plan.historical.map(x=>({...x}));
 const agenda=historical.concat(finalOrder.map((id,i)=>({
  id,rank:i+71,type:'RULEFIELD_PRIORITY_PREVIEW',
  source_proposed_rank:old.indexOf(id)+71,
  evidence_status:assessments[id].eligible?'DECLARED_COMPARABLE_EVIDENCE':'NO_RANKABLE_EVIDENCE',
  score:assessments[id].score
 })));
 const body={schema:'td613.rulefield.evidence-conditioned-temporal-priority/v1',
  status:'REVERSIBLE_SOURCE_DECLARED_PRIORITY_PREVIEW_ONLY',
  as_of,original_historical_70_unchanged:true,prior_field_order:old,proposed_field_order:finalOrder,
  agenda,assessments,comparisons,moves,dependency:{prerequisites:PRE,anchor:ANCHOR,
    preserved:dependencyOk,reversion_performed:!dependencyOk},
  counts:{historical:70,fields:86,total:156,rankable:Object.values(assessments).filter(x=>x.eligible).length,
   held:86-Object.values(assessments).filter(x=>x.eligible).length,moved: moves.length},
  methodology:'Only same declared comparison frame + protocol SHA may be compared; intervals must not overlap for a reversal. Scientific utility is not independently proven by declared metrics.',
  authority:{canonical_mutation:false,historical_priority_mutation:false,od02:'HELD',protected_flight:'HELD',
   real_world_utility_verified:false,external_origin_authenticated:false,human_closure:'RESERVED'}};
 return {...body,digest:sha(JSON.stringify(body))};
}
export function futurePriorityScenario({plan=proposedTemporalPriority(),receipts={},present_as_of,future_as_of}={}){
 if(Date.parse(future_as_of)<=Date.parse(present_as_of))fail('SCENARIO_MUST_BE_FUTURE');
 const current=evidenceConditionedPriority({plan,receipts,as_of:present_as_of});
 const future=evidenceConditionedPriority({plan,receipts,as_of:future_as_of});
 return {schema:'td613.rulefield.counterfactual-priority/v1',present_as_of,future_as_of,
  current,future,scenario_only:true,no_retroactive_historical_evidence:true,
  future_verification_not_present_knowledge:true,operator_adoption:false};
}
export function validateEvidencePriority(x,plan=proposedTemporalPriority()){
 if(x?.schema!=='td613.rulefield.evidence-conditioned-temporal-priority/v1')return false;
 const {digest,...body}=x;
 return sha(JSON.stringify(body))===digest&&x.agenda.length===156&&x.counts.total===156&&
 x.agenda.slice(0,70).every((y,i)=>y.id===plan.historical[i].id&&y.rank===plan.historical[i].rank)&&
 new Set(x.proposed_field_order).size===86&&
 PRE.every(id=>x.proposed_field_order.indexOf(id)<x.proposed_field_order.indexOf(ANCHOR))&&
 x.authority.canonical_mutation===false&&x.authority.od02==='HELD';
}
