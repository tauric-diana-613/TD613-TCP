/** 𝌋 RF-OD-0003 — context-indexed semantic review overlay, NEVER in-place reclassification.
 * 94 newly source-read agent interpretations + 38 earlier manually authored exemplars
 * remain proposals. 427 others retain deterministic triage pending source reading.
 */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readRulefield} from '../rulefield.mjs';
import {buildResidualTriage,validateResidualTriage,CURATOR_EXEMPLARS} from './residual_triage.mjs';
const casebookURL=new URL('./type_assessment/SEMANTIC_CASEBOOK_ROD0003.json',import.meta.url);
const sha=x=>createHash('sha256').update(x).digest('hex');
const fail=x=>{throw Object.assign(new Error(x),{code:x})};
const ALLOWED=new Set(['RULE','RULEFIELD','ASSAY','MODEL','SOURCE','CLAIM','THEOREM','EVIDENCE_BOUNDARY','RESEARCH_PROGRAM','UNRESOLVED']);
export function readSemanticCasebook(){
 const json=JSON.parse(readFileSync(casebookURL,'utf8'));
 if(json.schema!=='td613.rulefield.semantic-casebook/v2'||json.parent_docket!=='RF-OD-0002'||
   json.successor_stage!=='RF-OD-0003'||json.status!=='AGENT_EXAMINED_SOURCE_BOUND_REVIEW_ONLY')fail('CASEBOOK_SCHEMA_OR_AUTHORITY_INVALID');
 return json;
}
export function buildSemanticReview({registry=readRulefield(),triage=buildResidualTriage(),casebook=readSemanticCasebook()}={}){
 if(!validateResidualTriage(triage,{registry}))fail('SEMANTIC_REQUIRES_VALID_559_TRIAGE');
 if(!Array.isArray(casebook.cases)||casebook.cases.length!==casebook.case_count||
   casebook.case_count!==94||casebook.prior_curated_sample!==38)fail('CASEBOOK_COUNT_INVALID');
 const sample=new Map(),prior=new Set(Object.keys(CURATOR_EXEMPLARS));
 const source=new Map(registry.rules.map(x=>[x.id,x]));
 const residual=new Set(triage.rows.map(x=>x.id));
 for(const entry of casebook.cases){
  const original=source.get(entry.id);
  if(!residual.has(entry.id)||prior.has(entry.id)||sample.has(entry.id))fail('CASEBOOK_SOURCE_OR_DUPLICATE_CONFLICT');
  if(!original||entry.source_statement!==original.statement||entry.source_lane!==original.lane)fail('CASEBOOK_ORIGINAL_DRIFT');
  if(!ALLOWED.has(entry.proposed_primary_role)||typeof entry.interpretation!=='string'||entry.interpretation.length<18||
     typeof entry.discriminating_challenge!=='string'||entry.discriminating_challenge.length<18)fail('CASEBOOK_MISSING_SEMANTIC_CHALLENGE');
  if(entry.human_ratified!==false||entry.independent_witness!==false)fail('CASEBOOK_UNAUTHORIZED_CLAIM');
  sample.set(entry.id,entry);
 }
 const rows=triage.rows.map(row=>{
  const examined=sample.get(row.id),oldCurator=prior.has(row.id),chosen=examined?.proposed_primary_role||row.proposed_primary_role;
  const level=examined?'AGENT_SOURCE_READ_WITH_DISCRIMINATING_CHALLENGE':
   oldCurator?'EARLIER_AGENT_SOURCE_READ_PROPOSAL':'DETERMINISTIC_TRIAGE_ONLY';
  const explanation=examined?.interpretation??row.curator_note??null;
  const challenge=examined?.discriminating_challenge??null;
  return {...row,proposed_primary_role:chosen,previous_triage_primary_role:row.proposed_primary_role,
   semantic_review_level:level,semantic_interpretation:explanation,discriminating_challenge:challenge,
   changed_from_preliminary_role:!!examined&&chosen!==row.proposed_primary_role,
   human_ratified:false,role_assignment_scientifically_adjudicated:false,
   local_execution_authorized:false,empirical_consequence_witnessed:false,
   explicit_context_qualifier:'PROPOSED_ROLE_VIEW_WITHOUT_CROSS_ROLE_AUTHORITY'};
 });
 const roles={},byLane={},transitions={};
 for(const r of rows){
  roles[r.proposed_primary_role]=(roles[r.proposed_primary_role]||0)+1;
  byLane[r.lane]=(byLane[r.lane]||0)+1;
  if(r.changed_from_preliminary_role){
   const k=r.previous_triage_primary_role+' -> '+r.proposed_primary_role;
   transitions[k]=(transitions[k]||0)+1;
  }
 }
 const changeCount=rows.filter(x=>x.changed_from_preliminary_role).length;
 const body={schema:'td613.rulefield.semantic-review-overlay/v3',
  source_registry_sha256:triage.source_registry_sha256,parent_residual_digest:triage.digest,
  casebook_sha256:sha(readFileSync(casebookURL,'utf8')),status:'132_AGENT_INTERPRETATIONS_427_AUTOMATED_HOLDS_NOT_596_ADJUDICATIONS',
  methodology:'38 prior author-curated exemplar statements + 94 new directly read source statements, each with testable discriminant; remaining 427 deterministic proposals. Purposive selections prohibit population error-rate claims.',
  totals:{original:596,prior_selected:37,residual:559,curator_previous:38,curator_new:94,
   selected_agent_interpretations:132,deterministic_only:427,changed_during_second_pass:changeCount,
   by_proposed_primary_role:roles,by_lane:byLane,observed_role_changes_in_purposive_cases:transitions,
   scientific_adjudications:0,adopted_local_rules:0},
  rows,authority:{canonical_mutation:false,original_ids_preserved:true,operator_approval:false,
   od02:'HELD',scientific_closure:'RESERVED',protected_flight:'HELD',no_retroactive_proof:true,
   no_generalization_from_purposive_subset:true,independent_empirical_credit:0}};
 return {...body,digest:sha(JSON.stringify(body))};
}
export function validateSemanticReview(review,{registry=readRulefield()}={}){
 if(review?.schema!=='td613.rulefield.semantic-review-overlay/v3'||review.rows?.length!==559)return false;
 const {digest,...other}=review;if(digest!==sha(JSON.stringify(other)))return false;
 const source=new Map(registry.rules.map(x=>[x.id,x]));
 return review.totals.selected_agent_interpretations===132&&
   review.totals.deterministic_only===427&&review.totals.scientific_adjudications===0&&
   new Set(review.rows.map(x=>x.id)).size===559&&review.rows.every(x=>
    source.get(x.id)?.statement===x.source_statement&&
    x.human_ratified===false&&x.local_execution_authorized===false&&
    x.role_assignment_scientifically_adjudicated===false)&&
   review.authority.canonical_mutation===false&&review.authority.protected_flight==='HELD';
}
export function semanticInspection(id,review=buildSemanticReview()){
 return review.rows.find(x=>x.id===id)||null;
}
