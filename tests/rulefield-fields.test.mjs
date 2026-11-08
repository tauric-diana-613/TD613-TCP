import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {readRulefield} from '../packages/rulefield/rulefield.mjs';
import {readSeed,fieldStatus,validateSeed,buildQueue,sourceGleaningPlan,proposePriorityPermutation,humanPriorityMarkdown,writeStagedReview} from '../packages/rulefield/rulefields/engine.mjs';
const canonicalPath = new URL('../packages/rulefield/data/rulefield.v1.json',import.meta.url);
const seedPath = new URL('../packages/rulefield/rulefields/data/operator-rulefields-20261107.json',import.meta.url);
const original = readFileSync(canonicalPath);
const originalSeed = readFileSync(seedPath);
test('FIELD 01 preserves all eighty original expressions in a distinct research field type',()=>{
 const s=readSeed(),v=validateSeed(s);
 assert.equal(s.items.length,80);
 assert.equal(v.seed_fields,80);
 assert.deepEqual(s.items.map(x=>x.original_sequence),Array.from({length:80},(_,i)=>i+1));
 assert.ok(s.items.every(x=>x.object_type==='RULEFIELD'&&x.original_expression));
 assert.ok(s.items.every(x=>x.scientific_claim_ceiling==='UNQUALIFIED_RESEARCH_INTENT'));
});
test('FIELD 02 retains literal pair of antiequivalences as operator-supplied, not automatic theorem',()=>{
 const s=readSeed();
 assert.match(s.items[0].original_expression,/not|not\\Rightarrow|Rightarrow|\\not/);
 assert.equal(s.items[1].original_expression,'rulefield ≠ rule');
 assert.match(s.theoretical_axiom.non_identity,/RULEFIELD/);
});
test('FIELD 03 preserves exact canonical 70 queue and original source bytes',()=>{
 const q=buildQueue(),canonical=readRulefield();
 assert.equal(q.historical_priority_count,70);
 assert.equal(q.proposed_rulefield_count,80);
 assert.equal(q.agenda.length,150);
 for(let i=0;i<70;i++){
   assert.equal(q.agenda[i].id,canonical.priority_queue[i].id);
   assert.equal(q.agenda[i].rank,i+1);
   assert.equal(q.agenda[i].title,canonical.priority_queue[i].title);
 }
 assert.deepEqual(readFileSync(canonicalPath),original);
});
test('FIELD 04 proposed positions start after canonical without silent relocation',()=>{
 const q=buildQueue();
 assert.deepEqual(q.agenda.slice(70).map(x=>x.rank),Array.from({length:80},(_,i)=>71+i));
 assert.ok(q.agenda.slice(70).every(x=>x.kind==='PROPOSED_RULEFIELD'));
 assert.equal(q.gates.human_authority_to_adopt,false);
});
test('FIELD 05 independent scholarly labels never overwrite the human input',()=>{
 const s=readSeed(),q=buildQueue();
 for(let i=0;i<80;i++){
  assert.equal(q.rulefields[i].original_expression,s.items[i].original_expression);
  assert.equal(q.rulefields[i].proposed_academic_label,s.items[i].proposed_academic_label);
 }
});
test('FIELD 06 lexical similarity is a lead only; not a semantic or emergence finding',()=>{
 const q=buildQueue();
 for(const f of q.rulefields){
   assert.equal(f.duplicate_review.semantic_equivalence_proven,false);
   assert.equal(f.verification,'NOT_COMPUTATIONALLY_TESTED');
   assert.ok(f.proposed_rule_associations.every(a=>a.source_role==='SEARCH_LEAD_ONLY'&&a.scientific_credit===0));
 }
});
test('FIELD 07 obvious duplicate field in same packet enters held evidence',()=>{
 const s=readSeed();
 s.items[3].original_expression=s.items[2].original_expression;
 s.items[3].proposed_academic_label=s.items[2].proposed_academic_label;
 const q=buildQueue({seed:s});
 const f=q.rulefields[3];
 assert.equal(f.duplicate_review.status,fieldStatus.EXACT);
 assert.equal(f.duplicate_review.matches[0].id,'RF-003');
});
test('FIELD 08 exact historical domain citation does not imply novel rule or author',()=>{
 const index=readRulefield(),seed=readSeed();
 seed.items[0].original_expression=index.rules[0].statement;
 const q=buildQueue({seed,index});
 assert.equal(q.rulefields[0].duplicate_review.status,fieldStatus.EXACT);
 assert.ok(q.rulefields[0].duplicate_review.matches.some(x=>x.kind==='EXISTING_RULE'));
});
test('FIELD 09 unqueried source plan explicitly distinguishes authorized and unqueried',()=>{
 const p=sourceGleaningPlan('RF-002');
 assert.equal(p.rulefield_id,'RF-002');
 assert.equal(p.candidate_sources[0].status,'UNQUERIED');
 assert.ok(p.candidate_sources.some(x=>x.status==='ACCESS_AND_CONSENT_NOT_ASSUMED'));
 assert.equal(p.no_hidden_crawl_execution,true);
});
test('FIELD 10 stable ID priority reordering is a non-mutating suggestion',()=>{
 const base=buildQueue();
 const q=proposePriorityPermutation(base,[{op:'MOVE_BEFORE',item_id:'RF-002',reference_id:'Q05'}]);
 assert.equal(q.agenda.find(x=>x.id==='RF-002').rank,5);
 assert.equal(q.historical_relative_order_preserved,true);
 assert.equal(q.status,'STAGED_NOT_CANONICALLY_APPLIED');
 assert.equal(q.canonical_queue_mutated,false);
 assert.deepEqual(readFileSync(canonicalPath),original);
});
test('FIELD 11 moving an existing priority relative to another historical position is HELD',()=>{
 const base=buildQueue(),q=proposePriorityPermutation(base,[{op:'MOVE_BEFORE',item_id:'Q05',reference_id:'Q01'}]);
 assert.equal(q.historical_relative_order_preserved,false);
 assert.equal(q.status,'HELD_HISTORICAL_REORDER_REQUIRES_EXPLICIT_AUTHORIZATION');
 assert.equal(q.canonical_queue_mutated,false);
});
test('FIELD 12 a missing or same-ID move fails closed',()=>{
 const q=buildQueue();
 assert.throws(()=>proposePriorityPermutation(q,[{op:'MOVE_BEFORE',item_id:'RF-009',reference_id:'RF-009'}]),{code:'PRIORITY_ITEM_NOT_FOUND'});
 assert.throws(()=>proposePriorityPermutation(q,[{op:'MOVE_BEFORE',item_id:'GHOST',reference_id:'RF-001'}]),{code:'PRIORITY_ITEM_NOT_FOUND'});
});
test('FIELD 13 100 operation bound and no unsupported actions',()=>{
 const q=buildQueue(),op={op:'MOVE_AFTER',item_id:'RF-001',reference_id:'RF-002'};
 assert.throws(()=>proposePriorityPermutation(q,Array.from({length:101},()=>op)),{code:'INVALID_PRIORITY_OPERATION_COUNT'});
 assert.throws(()=>proposePriorityPermutation(q,[{...op,op:'MERGE'}]),{code:'INVALID_PRIORITY_OPERATION'});
});
test('FIELD 14 full human report contains all 80 original expressions and a held marker',()=>{
 const q=buildQueue(),md=humanPriorityMarkdown(q,{full:true});
 assert.ok(md.includes('RF-080'));
 assert.ok(md.includes(q.rulefields[79].original_expression));
 assert.equal((md.match(/\| RF-\d{3} \|/g)||[]).length,80);
 assert.match(md,/Original human expression|Human wording/);
});
test('FIELD 15 no source-free report may silently mutate canonical or human expressions',()=>{
 const tmp=mkdtempSync(join(tmpdir(),'rulefields-test-'));
 try{
  const x=writeStagedReview(buildQueue(),{filename:'rulefield-proposed-review.json',folder:tmp});
  assert.equal(x.canonical_mutated,false);
  assert.throws(()=>writeStagedReview('different',{filename:'rulefield-proposed-review.json',folder:tmp}),{code:'STAGED_REVIEW_NAME_COLLISION'});
 }finally{rmSync(tmp,{recursive:true,force:true})}
 assert.deepEqual(readFileSync(canonicalPath),original);
 assert.deepEqual(readFileSync(seedPath),originalSeed);
});
test('FIELD 16 a malformed human field gets no promotion',()=>{
 const s=readSeed();s.items[0].object_type='RULE';
 assert.throws(()=>validateSeed(s),{code:'RULEFIELD_RULE_TYPE_COLLAPSE'});
});
test('FIELD 17 a source-free field queue cannot release a protected experiment',()=>{
 const q=buildQueue();
 assert.equal(q.gates.protected_experiment_b,'HELD');
 assert.equal(q.claim_ceiling,'OPERATOR_RESEARCH_INTENT_NOT_SCIENTIFIC_DISCOVERY');
});
test('FIELD 18 linked executable rule leads are explicitly unverified until source retrieval',()=>{
 const p=sourceGleaningPlan('RF-080');
 assert.ok(p.initial_lexical_leads.every(x=>x.source_role==='SEARCH_LEAD_ONLY'));
 assert.equal(p.controls.require_falsifier_for_new_executable_rule,true);
});
test('FIELD 19 queue text remains readable without a graphical interaction or drag/drop UI',()=>{
 const q=buildQueue(),md=humanPriorityMarkdown(q);
 assert.ok(md.includes('| Position | ID |'));
 assert.equal((md.match(/\| RF-\d{3} \|/g)||[]).length,80);
 assert.ok(!md.includes('<button'));
});
