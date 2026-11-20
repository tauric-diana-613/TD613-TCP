/**
 * 𝌋 Rulefield Ontology and Priority Engine, v1.
 * RULEFIELD != RULE: topic space ≠ executable local transition.
 * Read-only canonical 70-topic registry, proposed 80-item append, optional
 * reversible priority permutation, source-free retrieval *suggestions*.
 */
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {readRulefield,validateRulefield} from '../rulefield.mjs';
const seedPath=new URL('./data/operator-rulefields-20261107.json',import.meta.url);
const registryPath=new URL('../data/rulefield.v1.json',import.meta.url);
const outbox=fileURLToPath(new URL('./outbox/',import.meta.url));
const sha=x=>createHash('sha256').update(x).digest('hex');
function requireOk(x,code){if(!x)throw Object.assign(new Error(code),{code});}
const norm=x=>String(x??'').normalize('NFC').toLowerCase().replace(/\s+/g,' ').replace(/[.。]+$/u,'').trim();
const tokens=x=>new Set(String(x??'').normalize('NFKC').toLowerCase().match(/[\p{L}\p{N}]+/gu)||[]);
const stops=new Set(['the','a','an','and','or','of','in','for','on','by','to','as','with','from','under','at','are','is','be','it','that','this','into','does','can','how','not']);
function similarity(a,b){const x=tokens(a),y=tokens(b);for(const q of stops){x.delete(q);y.delete(q)}if(Math.min(x.size,y.size)<3)return 0;let n=0;for(const w of x)if(y.has(w))n++;return n/(x.size+y.size-n||1);}
export const fieldStatus=Object.freeze({EXACT:'HELD_EXISTING_RULEFIELD',POSSIBLE:'HELD_POSSIBLE_RULEFIELD_OVERLAP',NEW:'STAGED_RULEFIELD_CANDIDATE'});
export function readSeed(){return JSON.parse(readFileSync(seedPath,'utf8'));}
export function fingerprints(){return {canonical_sha256:sha(readFileSync(registryPath)),field_seed_sha256:sha(readFileSync(seedPath))};}
export function validateSeed(seed=readSeed(),index=readRulefield()){
 validateRulefield(index);
 requireOk(seed?.schema==='td613.rulefield.operator-field-seed/v1','FIELD_SEED_SCHEMA_INVALID');
 requireOk(Array.isArray(seed.items)&&seed.count===seed.items.length&&seed.items.length>0,'FIELD_SEED_COUNT_MISMATCH');
 const ids=new Set();
 for(let i=0;i<seed.items.length;i++){
  const f=seed.items[i];
  requireOk(f.id==='RF-'+String(i+1).padStart(3,'0')&&!ids.has(f.id),'FIELD_SEED_ID_DRIFT');ids.add(f.id);
  requireOk(f.object_type==='RULEFIELD'&&f.original_sequence===i+1,'RULEFIELD_RULE_TYPE_COLLAPSE');
  requireOk(typeof f.original_expression==='string'&&f.original_expression.trim()&&typeof f.proposed_academic_label==='string'&&f.proposed_academic_label.trim(),'FIELD_SOURCE_OR_LABEL_MISSING');
  requireOk(f.scientific_claim_ceiling==='UNQUALIFIED_RESEARCH_INTENT'&&f.review_status==='STAGED_RULEFIELD_CANDIDATE','UNAUTHORIZED_FIELD_PROMOTION');
 }
 requireOk(index.priority_queue.length===70&&seed.items.length===80,'CURRENT_PILOT_BASELINE_MISMATCH');
 requireOk(index.authority.protected_experiment_b==='HELD','PROTECTED_FLIGHT_UNEXPECTEDLY_OPEN');
 return {status:'SOURCE_FREE_VALIDATED_FIELDS_NOT_SCIENTIFIC_RULES',priorities:70,seed_fields:seed.items.length,...fingerprints(),source_registry_unchanged:true,protected_flight:'HELD'};
}
function dedupStatus(field,index,prior){
 const matches=[];
 const candidate=field.proposed_academic_label;
 const compare=(id,kind,title,otherExpression)=>{
  if(norm(field.original_expression)===norm(otherExpression)||norm(candidate)===norm(title)){
   matches.push({id,kind,comparison:'EXACT_TEXT_OR_LABEL',confidence:'EXACT_LEXICAL_ONLY',source_not_externally_verified:true});
  }else{
   const score=Math.max(similarity(candidate,title),similarity(field.original_expression,otherExpression));
   if(score>=.78)matches.push({id,kind,comparison:'TOKEN_JACCARD',score:Math.round(score*1000)/1000,confidence:'POSSIBLE_SEMANTIC_OVERLAP_NOT_EQUIVALENCE',source_not_externally_verified:true});
  }
 };
 for(const q of index.priority_queue)compare(q.id,'HISTORICAL_PRIORITY',q.title,q.title);
 for(const p of prior)compare(p.id,'SAME_OPERATOR_BATCH',p.proposed_academic_label,p.original_expression);
 // Existing executable rules can be related to field descriptions, but do not
 // conflate a short topical domain with a concrete transition predicate.
 for(const r of index.rules){
  if(norm(field.original_expression)===norm(r.statement))matches.push({id:r.id,kind:'EXISTING_RULE',comparison:'EXACT_STATEMENT_CROSS_TYPE',confidence:'SOURCE_TEXT_MATCH_NOT_DOMAIN_IDENTITY'});
 }
 matches.sort((a,b)=>a.comparison.localeCompare(b.comparison)||a.id.localeCompare(b.id));
 const exact=matches.some(x=>x.comparison.startsWith('EXACT'));
 return {status:exact?fieldStatus.EXACT:matches.length?fieldStatus.POSSIBLE:fieldStatus.NEW,
  matches,semantic_equivalence_proven:false,
  explanation:'Lexical matching is a bounded preflight, not an exhaustive novelty certificate or source interpretation.'};
}
function suggestedRuleAssociations(f,index,max=5){
 const q=tokens(f.proposed_academic_label+' '+f.original_expression);
 for(const t of stops)q.delete(t);
 return index.rules.map(r=>{
  const rt=tokens(r.title+' '+r.statement);
  for(const t of stops)rt.delete(t);
  let intersection=0;const common=[];
  for(const x of q)if(rt.has(x)){intersection++;common.push(x)}
  return {rule_id:r.id,rule_title:r.title,common_terms:common.slice(0,12),lexical_overlap_count:intersection,score:intersection/(Math.sqrt(q.size*rt.size)||1)};
 }).filter(r=>r.lexical_overlap_count>=2&&r.score>=.24).sort((a,b)=>b.score-a.score||a.rule_id.localeCompare(b.rule_id)).slice(0,max).map(x=>({...x,source_role:'SEARCH_LEAD_ONLY',scientific_credit:0}));
}
export function buildQueue({seed=readSeed(),index=readRulefield()}={}){
 const validation=validateSeed(seed,index),historical=index.priority_queue.map(q=>({
  id:q.id,kind:'HISTORICAL_PRIORITY_TOPIC',title:q.title,original_title:q.title,
  rank:q.rank,source_rank:q.rank,rule_links:q.rule_links,
  change_state:'IMMUTABLE_CANONICAL_SOURCE',scientific_credit:0
 }));
 const proposed=[];
 for(const f of seed.items){
  const overlaps=dedupStatus(f,index,proposed);
  proposed.push({...f,duplicate_review:overlaps,
   proposed_rank:historical.length+proposed.length+1,
   proposed_rule_associations:suggestedRuleAssociations(f,index),
   source_admission:'OPERATOR_NAMED_TOPIC_ONLY',verification:'NOT_COMPUTATIONALLY_TESTED'});
 }
 const agenda=historical.map(({rank,id,title,original_title,source_rank,kind,change_state})=>({rank,id,title,kind,source_rank,change_state}))
 .concat(proposed.map(x=>({rank:x.proposed_rank,id:x.id,title:x.proposed_academic_label,kind:'PROPOSED_RULEFIELD',
  original_expression:x.original_expression,source_rank:x.proposed_rank,change_state:x.duplicate_review.status})));
 return {schema:'td613.rulefield.proposed-priority-queue/v1',status:'STAGED_APPEND_PREVIEW_NOT_CANONICAL_RERANK',
  claim_ceiling:'OPERATOR_RESEARCH_INTENT_NOT_SCIENTIFIC_DISCOVERY',...validation,
  historical_priority_count:historical.length,proposed_rulefield_count:proposed.length,
  agenda,historical,rulefields:proposed,
  gates:{no_mutation:true,human_authority_to_adopt:false,rulefield_not_rule:true,protected_experiment_b:'HELD'},
  duplicate_hold_count:proposed.filter(x=>x.duplicate_review.status!==fieldStatus.NEW).length};
}
export function proposePriorityPermutation(base,operations){
 requireOk(base?.schema==='td613.rulefield.proposed-priority-queue/v1','UNKNOWN_PRIORITY_PROPOSAL');
 requireOk(Array.isArray(operations)&&operations.length<=100,'INVALID_PRIORITY_OPERATION_COUNT');
 const agenda=base.agenda.map(x=>({...x})),ids=base.agenda.map(x=>x.id);
 for(const op of operations){
  requireOk(op&&['MOVE_BEFORE','MOVE_AFTER'].includes(op.op),'INVALID_PRIORITY_OPERATION');
  requireOk(ids.includes(op.item_id)&&ids.includes(op.reference_id)&&op.item_id!==op.reference_id,'PRIORITY_ITEM_NOT_FOUND');
  const at=agenda.findIndex(x=>x.id===op.item_id);
  const [moving]=agenda.splice(at,1);
  const dest=agenda.findIndex(x=>x.id===op.reference_id);
  agenda.splice(dest+(op.op==='MOVE_AFTER'?1:0),0,moving);
 }
 const oldIndex=new Map(base.agenda.map((x,i)=>[x.id,i+1]));
 const rank_changes=agenda.map((x,i)=>({id:x.id,from:oldIndex.get(x.id),to:i+1})).filter(x=>x.from!==x.to);
 const originalBaseOrder=base.historical.map(x=>x.id);
 const historicalAfter=agenda.filter(x=>x.kind==='HISTORICAL_PRIORITY_TOPIC').map(x=>x.id);
 const originalOrderPreserved=JSON.stringify(originalBaseOrder)===JSON.stringify(historicalAfter);
 const proposal={schema:'td613.rulefield.priority-permutation-review/v1',
  source_sha256:base.canonical_sha256,field_seed_sha256:base.field_seed_sha256,
  operations,rank_changes,
  agenda:agenda.map((x,i)=>({...x,rank:i+1})),
  historical_relative_order_preserved:originalOrderPreserved,
  status:originalOrderPreserved?'STAGED_NOT_CANONICALLY_APPLIED':'HELD_HISTORICAL_REORDER_REQUIRES_EXPLICIT_AUTHORIZATION',
  rulefield_count:base.proposed_rulefield_count,human_authorization_received:false,
  canonical_queue_mutated:false,protected_experiment_b:'HELD'};
 return {...proposal,review_sha256:sha(JSON.stringify(proposal))};
}
export function sourceGleaningPlan(id,{index=readRulefield(),seed=readSeed()}={}){
 const f=seed.items.find(x=>x.id===id);
 requireOk(f,'RULEFIELD_NOT_FOUND');
 const ranked=buildQueue({index,seed}).rulefields.find(x=>x.id===id);
 return {schema:'td613.rulefield.source-gleaning-plan/v1',rulefield_id:id,
  operator_expression:f.original_expression,academic_working_title:f.proposed_academic_label,
  candidate_sources:[
    {surface:'GITHUB_REPOSITORY',query:[f.original_expression,f.proposed_academic_label],status:'UNQUERIED'},
    {surface:'AUTHORIZED_CONVERSATION_OR_LIBRARY',query:[f.original_expression],status:'ACCESS_AND_CONSENT_NOT_ASSUMED'},
    {surface:'PUBLIC_SCHOLARLY_SOURCES',query:[f.proposed_academic_label],status:'UNQUERIED_CITATION_REQUIRED'}
  ],initial_lexical_leads:ranked.proposed_rule_associations,
  controls:{source_witness_required:true,retain_unknowns:true,distinguish_referent_identity:true,
    compare_information_matched_null:true,require_falsifier_for_new_executable_rule:true},
  proposal_status:ranked.duplicate_review.status,
  no_hidden_crawl_execution:true};
}
export function humanPriorityMarkdown(queue=buildQueue(),{full=false}={}){
 const lines=['# 𝌋 Rulefield Priority Agenda — Source-Free Staged Preview','',
  '**Existing canonical queue:** 70 preserved · **Operator-named field candidates:** '+queue.proposed_rulefield_count+
  ' · **Duplicate/overlap holds:** '+queue.duplicate_hold_count,
  '**Status:** proposed appended research fields, not 80 certified rules or an adopted re-ranking.','',
  '| Position | ID | Research-grade working title | Standing |','|---:|---|---|---|'];
 for(const q of queue.agenda){
  const title=String(q.title).replaceAll('|','\\|');
  const state=q.change_state||'STAGED';
  lines.push('| '+q.rank+' | '+q.id+' | '+title+' | '+state+' |');
 }
 if(full){
  lines.push('','## Every original human expression and candidate research lead');
  for(const f of queue.rulefields)lines.push('','### '+f.id+' · '+f.proposed_academic_label,'',
   '**Human wording:** '+f.original_expression,'',
   '**Type:** RULEFIELD · '+f.domain_class+' · **Potential assay:** '+f.assay_family,
   '**Status:** '+f.duplicate_review.status+' · **Assay actually executed:** NONE',
   '**Lexical source leads (unverified):** '+f.proposed_rule_associations.map(x=>x.rule_id).join(', '));
 }
 lines.push('','Human closure RESERVED · Protected Experiment B HELD · Original queue not mutated.');
 return lines.join('\n')+'\n';
}
export function writeStagedReview(data,{filename,folder=outbox}={}){
 requireOk(/^[A-Za-z0-9][\w.-]{2,100}\.(json|md)$/.test(filename||'')&&!filename.includes('..'),'UNSAFE_REVIEW_FILENAME');
 mkdirSync(folder,{recursive:true});
 const contents=typeof data==='string'?data:JSON.stringify(data,null,2)+'\n';
 const file=join(folder,filename);
 if(existsSync(file))requireOk(readFileSync(file,'utf8')===contents,'STAGED_REVIEW_NAME_COLLISION');
 else writeFileSync(file,contents,{flag:'wx',mode:0o600});
 return {status:'STAGED_REVIEW_ONLY',filename:file,sha256:sha(contents),canonical_mutated:false};
}
