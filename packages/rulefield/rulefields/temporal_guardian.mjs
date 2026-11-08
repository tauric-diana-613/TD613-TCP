/**
 * 𝌋 Temporal-Custodian Rulefield Tomography (source-free).
 * Retains original 70-ranked archive, revises operator-field staging only.
 * Temporal admission precedes proposed rank; future scenarios are never
 * retroactive evidence or automatic operator authority.
 */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readRulefield} from '../rulefield.mjs';
import {readSeed} from './engine.mjs';
const sha=x=>createHash('sha256').update(x).digest('hex');
const fail=(reason)=>{throw Object.assign(new Error(reason),{code:reason})};
const V2=new URL('./data/operator-rulefields-20261108-revision.json',import.meta.url);
const BASE=new URL('./data/operator-rulefields-20261107.json',import.meta.url);
const REG=new URL('../data/rulefield.v1.json',import.meta.url);
const six=['RF-081','RF-082','RF-083','RF-084','RF-085','RF-086'];
const anchor='RF-079';
export function readRevisionSeed(){return JSON.parse(readFileSync(V2,'utf8'));}
export function validateRevision(seed=readRevisionSeed(),old=readSeed(),index=readRulefield()){
 if(seed.schema!=='td613.rulefield.operator-field-revision/v2'||seed.parent_docket!=='RF-OD-0001'||seed.successor_docket!=='RF-OD-0002')fail('REVISION_PARENT_OR_SCHEMA_INVALID');
 if(seed.count!==86||seed.items?.length!==86||old.items.length!==80||index.priority_queue.length!==70)fail('REVISION_ITEM_COUNTS_INVALID');
 if(seed.approvals?.['OD-02']!=='HELD_OPERATOR_WITHHELD_RATIFICATION')fail('OD02_OPERATOR_HOLD_LOST');
 if(seed.operator_original_notation!=='thermodynamics ∈₌ social field theory')fail('OPERATOR_NOTATION_LOST');
 for(let i=0;i<86;i++){
  const item=seed.items[i];
  if(item.id!=='RF-'+String(i+1).padStart(3,'0')||item.object_type!=='RULEFIELD')fail('RULEFIELD_TYPE_OR_ID_INVALID');
  if(i<80){
   if(item.original_expression!==old.items[i].original_expression||
      item.proposed_academic_label!==old.items[i].proposed_academic_label)fail('ROD0001_HISTORICAL_DATA_MUTATED');
  }else if(item.priority_request?.anchor!=='RF-079')fail('MISSING_EXPLICIT_PRECEDENCE');
 }
 if(seed.items[7].revision_overlay?.operator_corrected_expression!=='Rudolf Steiner')fail('STEINER_OPERATOR_CORRECTION_MISSING');
 if(!seed.items[78].revision_overlay?.prerequisite_rulefields?.every(x=>six.includes(x)))fail('THERMO_PREREQUISITE_MISSING');
 const expectRefs=new Map([['RF-085','TC19'],['RF-086','TC11']]);
 for(const [id,ref]of expectRefs){
  const f=seed.items.find(x=>x.id===id);
  if(!f.source_concept_links?.includes(ref)||!index.rules.some(r=>r.id===ref))fail('SHANNON_BOURDIEU_SOURCE_LINK_MISSING');
 }
 if(index.authority.protected_experiment_b!=='HELD')fail('PROTECTED_FLIGHT_OPEN');
 return {status:'VALID_SOURCE_FREE_PROPOSED_REVISION',parent_docket:seed.parent_docket,
  successor_docket:seed.successor_docket,fields:86,historical_priorities:70,
  canonical_sha256:sha(readFileSync(REG)),original_seed_sha256:sha(readFileSync(BASE)),
  revised_seed_sha256:sha(readFileSync(V2)),operator_held_workstreams:['OD-02'],
  historical_rule_or_priority_mutation:false};
}
function dateValue(s){
 if(typeof s!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(s))fail('TEMPORAL_TIMESTAMP_INVALID');
 const n=Date.parse(s);if(!Number.isFinite(n)||new Date(n).toISOString().slice(0,19)!==s.slice(0,19))fail('TEMPORAL_TIMESTAMP_INVALID');
 return n;
}
export function temporalWitness(event,{as_of}={}){
 if(!event||typeof event!=='object')fail('TEMPORAL_EVENT_INVALID');
 const asof=dateValue(as_of);
 const times={};
 for(const name of ['event_time','recorded_at','available_at','operator_decided_at','projected_future_at']){
  const val=event[name];times[name]=val==null?null:dateValue(val);
 }
 const missing=Object.entries(times).filter(([k,v])=>v===null).map(([k])=>k);
 const flags=[];
 if(times.event_time!==null&&times.event_time>asof)flags.push('FUTURE_EVENT_HYPOTHETICAL');
 if(times.recorded_at!==null&&times.event_time!==null&&times.recorded_at<times.event_time)flags.push('RECORDED_BEFORE_EVENT_ANOMALY');
 if(times.available_at!==null&&times.available_at>asof)flags.push('SOURCE_NOT_YET_AVAILABLE');
 if(times.projected_future_at!==null)flags.push('COUNTERFACTUAL_FUTURE_IS_NOT_CURRENT_EVIDENCE');
 if(times.operator_decided_at!==null&&times.operator_decided_at>asof)flags.push('DECISION_IN_THE_FUTURE_NOT_YET_AUTHORIZED');
 // Source availability must be chronologically possible and witnessed by the cutoff.
 // An unrecorded or future-recorded source cannot enter an earlier observer state.
 if(times.recorded_at===null)flags.push('RECORD_TIME_UNKNOWN');
 if(times.recorded_at!==null&&times.recorded_at>asof)flags.push('RECORD_NOT_YET_CREATED');
 if(times.available_at!==null&&times.recorded_at!==null&&times.available_at<times.recorded_at)
  flags.push('SOURCE_AVAILABLE_BEFORE_RECORD_ANOMALY');
 const eligible=times.event_time!==null&&times.event_time<=asof&&
  times.recorded_at!==null&&times.recorded_at>=times.event_time&&times.recorded_at<=asof&&
  times.available_at!==null&&times.available_at>=times.recorded_at&&times.available_at<=asof;
 return {schema:'td613.rulefield.temporal-witness/v1',event_id:event.id||'UNKNOWN',as_of,
  clocks:{event_time:event.event_time??null,recorded_at:event.recorded_at??null,available_at:event.available_at??null,
   operator_decided_at:event.operator_decided_at??null,projected_future_at:event.projected_future_at??null},
  flags,missing,eligibility:eligible?'SOURCE_EVIDENCE_ADMISSIBLE_AS_OF':'HELD_TEMPORAL_EVIDENCE',
  epistemic_nonretroactivity:true,
  historical_observer_knew_future:false,
  no_human_authorization_inferred:true};
}
export function proposedTemporalPriority({seed=readRevisionSeed(),index=readRulefield()}={}){
 const validated=validateRevision(seed,readSeed(),index);
 const sourceOrder=seed.items.map(x=>x.id);
 const insertion=sourceOrder.indexOf(anchor);
 if(insertion<0||insertion!==78)fail('ANCHOR_MISSING_OR_MOVED');
 // Append all six prerequisites just before RF-079, never ahead of Q ranks.
 const afterSource=sourceOrder.filter(x=>!six.includes(x));
 const anchorAt=afterSource.indexOf(anchor);
 afterSource.splice(anchorAt,0,...six);
 if(afterSource.length!==86||new Set(afterSource).size!==86)fail('PRIORITY_LOSS_OR_DUPLICATION');
 const historical=index.priority_queue.map(x=>({id:x.id,rank:x.rank,title:x.title,type:'HISTORICAL_PRIORITY',unchanged:true}));
 const agenda=historical.concat(afterSource.map((id,i)=>{
  const x=seed.items.find(x=>x.id===id);
  return {id,rank:71+i,title:x.revision_overlay?.revised_academic_working_label||x.proposed_academic_label,
   raw_expression:x.original_expression,corrected_expression:x.revision_overlay?.operator_corrected_expression||null,
   type:'PROVISIONAL_RULEFIELD',source_order:x.original_sequence,
   time_scope:'SOURCE_INGESTION_OR_OPERATOR_INTENT_ONLY',source_availability:'NOT_INDIVIDUALLY_ATTESTED',
   scholarly_status:'WORKING_LABEL_UNRATIFIED_OD02'};
 }));
 const moves=agenda.slice(70).filter(x=>x.source_order!==x.rank-70).map(x=>({id:x.id,source_position:70+x.source_order,proposed_position:x.rank}));
 return {schema:'td613.rulefield.temporal-priority-proposal/v1',
  disposition:'AWAITING_OPERATOR_REVIEW',
  rationale:'Two-pass temporal tomography: compare event/record/availability/decision clocks; then prioritize only source-admissible proposals. No future-source retroactivity.',
  historical:historical,agenda,proposed_rulefield_order:afterSource,
  explicit_operator_dependency:{prerequisites:six,anchor:'RF-079',constraint:'MUST_PRECEDE_IN_STAGED_REVIEW'},
  moves,counts:{historical:70,proposed:86,total:156,canonically_adopted:0},
  source_fingerprints:validated,
  decision_constraints:{operator_held:['OD-02'],historical_priority_reorder:false,
   future_scenario_rank_is_not_historical_fact:true,canonical_mutation:false,protected_flight:'HELD'}};
}
export function temporalCounterfactual(original,{as_of,scenario}={}){
 const witness=temporalWitness({...original,projected_future_at:scenario},{as_of});
 return {proposal_status:'HYPOTHETICAL_FORECAST_ONLY',scenario,
  witness,does_not_change_admissibility_as_of:witness.eligibility,
  retrospective_authority_upgrade:false};
}
export function orderWithEvidence(plan,readiness={}){
 if(plan.schema!=='td613.rulefield.temporal-priority-proposal/v1')fail('PRIORITY_PLAN_INVALID');
 // Only annotate; source time and consequences cannot be guessed from titles.
 return plan.agenda.map(p=>{
  const w=readiness[p.id]??null;
  const ready=w?temporalWitness({id:p.id,...w},{as_of:w.as_of}):null;
  return {...p,evidence_readiness:ready?.eligibility??'UNMEASURED',
   priority_data_completeness:ready?'DECLARED_EVENT_CLOCKS_ONLY':'INSUFFICIENT_FOR_EMPIRICAL_PRIORITY_SCORE',
   scientific_priority_score:null};
 });
}
