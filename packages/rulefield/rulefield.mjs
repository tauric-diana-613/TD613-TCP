/**
 * TD613 Living Rulefield — source-free query, validation and candidate generation.
 * Dynamic proposals remain STAGED; no protected data access, promotion or deployment.
 * Node.js >=18; no external dependencies.
 */
import {readFileSync} from 'node:fs';
const src = new URL('./data/rulefield.v1.json',import.meta.url);
export const readRulefield = () => JSON.parse(readFileSync(src,'utf8'));
const stop=(code,reason)=>{const e=new Error(reason||code);e.code=code;throw e;};
const check=(ok,code)=>{if(!ok)stop(code)};
export function validateRulefield(index){
 check(index?.schema==='td613.rulefield.v1/rc1','INVALID_RULEFIELD_SCHEMA');
 const {rules,priority_queue,crossings,authority,totals}=index;
 for(const [name,data] of [['rules',rules],['priority_queue',priority_queue],['crossings',crossings]])check(Array.isArray(data),'MISSING_'+name.toUpperCase());
 const ids=new Set();
 for(const r of rules){check(typeof r.id==='string'&&r.id.length>0,'BAD_RULE_ID');check(!ids.has(r.id),'DUPLICATE_RULE_ID');ids.add(r.id);check(Array.isArray(r.queue_refs),'NO_QUEUE_REFS');check(typeof r.statement==='string'&&r.statement.length>0,'MISSING_RULE_PROPOSITION')}
 const edgeIds=new Set();
 const ranks=new Map();
 for(let i=0;i<priority_queue.length;i++){
   const q=priority_queue[i];check(q.rank===i+1,'RANK_REORDERED');check(q.id==='Q'+String(q.rank).padStart(2,'0'),'QUEUE_ID_DRIFT');ranks.set(q.id,q);
   check(Array.isArray(q.rule_links),'MISSING_LINKS');
   for(const l of q.rule_links)check(ids.has(l.id),'QUEUE_LINK_WITHOUT_RULE');
 }
 for(const r of rules)for(const id of r.queue_refs)check(ranks.has(id)&&ranks.get(id).rule_links.some(x=>x.id===r.id),'NONRECIPROCAL_QUEUE_LINK');
 let aliases=0;
 for(const c of crossings){
   check(!edgeIds.has(c.id),'DUPLICATE_EDGE');edgeIds.add(c.id);
   check(Array.isArray(c.endpoints),'UNTYPED_EDGE');
   for(const x of c.endpoints){
     if(x.type==='RULE')check(ids.has(x.id),'EDGE_UNKNOWN_RULE');
     else if(x.type==='QUEUE_TOPIC')check(ranks.has(x.id),'EDGE_UNKNOWN_QUEUE');
     else if(x.type==='UNRESOLVED_ALIAS'){aliases++;check(typeof x.source_token==='string','ALIAS_WITHOUT_ORIGINAL_TOKEN')}
     else stop('UNKNOWN_ENDPOINT_TYPE');
   }
   check(c.scientific_credit===0,'UNEARNED_CROSSING_SCIENTIFIC_CREDIT');
 }
 const inherited=rules.filter(x=>x.lane==='HISTORICAL_NKS');
 const classes={I:0,P:0,X:0};
 for(const r of inherited){check(r.inherited_class in classes,'INVALID_INHERITED_CLASS');classes[r.inherited_class]++;}
 for(const r of rules.filter(x=>x.lane!=='HISTORICAL_NKS'))check(r.inherited_class===null,'HISTORICAL_CLASS_PROMOTION');
 const required={rules:596,queue:70,crossings:88};
 check(rules.length===required.rules&&priority_queue.length===required.queue&&crossings.length===required.crossings,'MIGRATION_CARDINALITY_DRIFT');
 check(classes.I===50&&classes.P===45&&classes.X===95,'HISTORICAL_IPX_CLASS_DRIFT');
 check(priority_queue[3].title==='Computational Black feminist epistemology'&&priority_queue[46].title.startsWith('Black feminist epistemology'),'BFE_QUEUE_CONFLATION');
 check(priority_queue[14].title.startsWith('OPERAHOUSE')&&priority_queue[15].title.startsWith('Palace Act I')&&priority_queue[16].title.startsWith('Palace Act II'),'QUEUE_PRIORITY_OVERRIDE');
 check(aliases===index.unresolved_crossing_aliases.length,'ALIAS_LEDGER_INCONSISTENT');
 check(authority.protected_experiment_b==='HELD'&&!authority.automatic_promotion&&!authority.release_authority,'PROTECTED_FLIGHT_OR_PROMOTION_ESCALATION');
 check(index.v04_competent_null.sample_size===384&&index.v04_competent_null.accuracy.candidate===384&&index.v04_competent_null.accuracy.competent_union===384&&index.v04_competent_null.decision==='SOURCE_FREE_BOUNDED_TIE','UNEARNED_NOVELTY_CLAIM');
 check(totals.unranked===rules.filter(r=>r.queue_refs.length===0).length,'UNRANKED_COUNT_DRIFT');
 return Object.freeze({status:'VALIDATED_SOURCE_FREE_REGISTRY_ONLY',rules:rules.length,crossings:crossings.length,queue:priority_queue.length,classes,unresolved_aliases:aliases,unranked_rules:totals.unranked,scientific_credit:0,protected_flight:'HELD'});
}
const normalize=v=>String(v).toLowerCase();
export function searchRules(index,{term='',lane=null,queue_rank=null,limit=20}={}){
 const rank=queue_rank==null?null:'Q'+String(queue_rank).padStart(2,'0'),needle=normalize(term).trim();
 if(rank && !index.priority_queue.some(q=>q.id===rank))stop('UNKNOWN_PRIORITY_RANK');
 const list=index.rules.filter(r=>(!lane||r.lane===lane)&&(!rank||r.queue_refs.includes(rank))&&(!needle||normalize([r.id,r.statement,r.title,r.lane,r.claim_state].join(' ')).includes(needle)));
 const sorted=list.sort((a,b)=>{
  const x=Math.min(999,...a.queue_refs.map(z=>Number(z.slice(1)))),y=Math.min(999,...b.queue_refs.map(z=>Number(z.slice(1))));
  return x-y||a.id.localeCompare(b.id);
 });
 return {total:list.length,limit,returned:sorted.slice(0,limit).map(r=>({id:r.id,lane:r.lane,statement:r.statement,claim_state:r.claim_state,queue_refs:r.queue_refs,scientific_disposition:r.scientific_disposition}))};
}
export function traceRule(index,id){
 const r=index.rules.find(x=>x.id===id);if(!r)stop('UNKNOWN_RULE_ID',id);
 return {rule:r,topics:index.priority_queue.filter(q=>r.queue_refs.includes(q.id)).map(q=>({rank:q.rank,title:q.title,links:q.rule_links.filter(x=>x.id===id)})),
 crossings:index.crossings.filter(c=>c.endpoints.some(e=>e.type==='RULE'&&e.id===id)),
 source_resolution:r.sources.map(s=>({key:s,source_kind:s.split(':')[0],independent_external_origin_attested:false})),
 scientific_ceiling:r.scientific_disposition};
}
export function inspectPriority(index,rank,{limit=100}={}){
 const q=index.priority_queue.find(x=>x.rank===Number(rank));if(!q)stop('UNKNOWN_PRIORITY_RANK');
 const members=q.rule_links.slice(0,limit).map(x=>({id:x.id,role:x.role,lane:index.rules.find(r=>r.id===x.id).lane}));
 return {rank:q.rank,title:q.title,total:q.rule_links.length,members};
}
export function inspectCrossing(index,id){
 const c=index.crossings.find(c=>c.id===id);if(!c)stop('UNKNOWN_CROSSING_ID');
 return {crossing:c,unresolved:c.endpoints.filter(x=>x.type==='UNRESOLVED_ALIAS'),scientific_claim:'NOT_AUTOMATICALLY_ADMITTED'};
}
export function priorityLens(index,{limit=70}={}){
 return index.priority_queue.slice(0,limit).map(q=>({rank:q.rank,title:q.title,linked_rules:q.rule_links.length,historical:q.rule_links.filter(x=>index.rules.find(r=>r.id===x.id).lane==='HISTORICAL_NKS').length}));
}
export function negativeResults(index){return {case:'DD02_V04',status:index.v04_competent_null.decision,accuracy:index.v04_competent_null.accuracy,novelty_credit:0,next_candidate:index.rules.find(x=>x.id==='CBFE-RG-PATH-FIBER-01')}};
export function unresolvedAliases(index,{limit=60}={}){return {count:index.unresolved_crossing_aliases.length,items:index.unresolved_crossing_aliases.slice(0,limit),status:'EXPLICIT_ADJUDICATION_REQUIRED_NO_AUTOMERGE'}};
export function proposeRule(index,{id,title,statement,source_ids,queue_rank,falsifier,competent_null}={}){
 check(typeof id==='string'&&/^RF-P-\d{3,}$/.test(id),'INVALID_NEW_RULE_NAMESPACE');
 check(!index.rules.some(x=>x.id===id),'CANDIDATE_ID_COLLISION');
 check(typeof title==='string'&&title.length>=5,'MISSING_TITLE');
 check(typeof statement==='string'&&statement.length>=25,'MISSING_RESEARCH_PROPOSITION');
 check(Array.isArray(source_ids)&&source_ids.length>0&&source_ids.every(x=>typeof x==='string'&&x.length>3),'NO_SOURCE_LINEAGE');
 check(typeof falsifier==='string'&&falsifier.length>=15,'NO_FALSIFIER');
 check(typeof competent_null==='string'&&competent_null.length>=15,'NO_COMPETENT_NULL');
 check(index.priority_queue.some(q=>q.rank===queue_rank),'UNKNOWN_PRIORITY_RANK');
 return Object.freeze({
   id,title,statement,source_ids,queue_rank,falsifier,competent_null,
   status:'STAGED_PROPOSED_NO_AUTHORITY',scientific_credit:0,independent_replication:0,auto_committed:false,
   operator_review_required:true,protected_flight:'HELD',
   possible_history_event:{event:'PROPOSE_NEW_RESEARCH_RULE',proposal:id,does_not_mutate_K0:true}
 });
}
export function verifySourceNonMutation(before,after){
 if(before.rules.filter(x=>x.lane==='HISTORICAL_NKS').length!==after.rules.filter(x=>x.lane==='HISTORICAL_NKS').length)stop('HISTORICAL_CARDINALITY_MUTATED');
 for(const a of before.rules.filter(x=>x.lane==='HISTORICAL_NKS')){
  const b=after.rules.find(x=>x.id===a.id);
  if(!b||JSON.stringify(a.record)!==JSON.stringify(b.record))stop('HISTORICAL_RULE_MUTATED',a.id);
 }
 return true;
}
