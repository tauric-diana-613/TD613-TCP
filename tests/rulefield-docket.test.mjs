import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {readSeed} from '../packages/rulefield/rulefields/engine.mjs';
import {readNomenclature,buildOperatorDocket,validateOperatorDocket,renderOperatorDocket,chatDocketPayload,stageDocket} from '../packages/rulefield/operator/docket.mjs';
const source=new URL('../packages/rulefield/data/rulefield.v1.json',import.meta.url);
const seed=new URL('../packages/rulefield/rulefields/data/operator-rulefields-20261107.json',import.meta.url);
const originalRegistry=readFileSync(source),originalSeed=readFileSync(seed);
const docket=()=>buildOperatorDocket({rev:{sha:'a'.repeat(40),kind:'TEST_FIXTURE'}});

test('DOCKET 01 frozen v1 naming and non-equivalent term types',()=>{
 const n=readNomenclature();
 assert.equal(n.state,'FROZEN_V1_COMPATIBILITY_CONTRACT');
 assert.equal(n.edition,'1.0.0');
 assert.ok(['RULEFIELD','RULE','PRIORITY','RSR','RAP','PSD','ROD','ODS','SSC','RHB'].every(k=>n.terms.some(t=>t.id===k)));
 assert.equal(n.terms.find(x=>x.id==='ROD').name,'Rulefield Operator Docket');
 assert.equal(n.decisions.forbidden_in_docket.includes('MERGE'),true);
});
test('DOCKET 02 every original field has an identical original in the source seed',()=>{
 const d=docket(),s=readSeed();
 assert.equal(d.counts.proposed_rulefields,80);
 assert.ok(d.fields.every((f,i)=>f.human_original_expression===s.items[i].original_expression));
 assert.ok(d.fields.every((f,i)=>f.academic_working_title===s.items[i].proposed_academic_label));
 assert.equal(d.fields.at(-1).id,'RF-080');
});
test('DOCKET 03 preserve all seventy historical priorities at original coordinates',()=>{
 const d=docket();
 assert.equal(d.counts.agenda_total,150);
 assert.deepEqual(d.inherited_priorities.map(x=>x.rank),Array.from({length:70},(_,i)=>i+1));
 assert.equal(d.authority.canonical_registry_mutated,false);
 assert.equal(d.authority.merge_allowed,false);
 assert.equal(d.authority.protected_flight,'HELD');
});
test('DOCKET 04 eight groups fully cover the eighty original expressions once',()=>{
 const d=docket(),ids=d.reviewer_groups.flatMap(g=>g.ids);
 assert.equal(d.reviewer_groups.length,8);
 assert.deepEqual(ids,d.fields.map(x=>x.id));
 assert.ok(d.reviewer_groups.every(g=>g.count===10));
 assert.ok(validateOperatorDocket(d));
});
test('DOCKET 05 native human Markdown prints all eighty items, not just headline examples',()=>{
 const d=docket(),md=renderOperatorDocket(d);
 for(const f of d.fields){
  assert.ok(md.includes(f.academic_working_title),f.id);
  assert.ok(md.includes(f.human_original_expression.replaceAll('|','\\|').replace(/\r?\n/g,' ⏎ ')),f.id);
 }
 assert.match(md,/HEAVY/);assert.match(md,/70/);assert.match(md,/80/);
 assert.match(md,/RF-OD-0001/);
});
test('DOCKET 06 in-chat payload includes all source fields and 70 inherited priorities',()=>{
 const d=docket(),p=chatDocketPayload(d);
 assert.equal(p.fields_visible,80);assert.equal(p.historical_priorities_visible,70);
 assert.equal(p.groups.flatMap(g=>g.fields).length,80);
 assert.ok(p.groups.flatMap(g=>g.fields).every(x=>x.original.length>0&&x.label.length>0));
 assert.equal(p.options.length,5);
});
test('DOCKET 07 decision messages are scoped, digest-bound and cannot perform side effects',()=>{
 const d=docket(),p=chatDocketPayload(d);
 for(const option of p.options){
  assert.ok(option.draft_message.includes(d.id));
  assert.ok(option.draft_message.includes(d.docket_sha256));
  assert.match(option.draft_message,/no canonical mutation/);
 }
 assert.equal(p.canonical_mutation,false);
});
test('DOCKET 08 altering academic label, rank or digest invalidates snapshot',()=>{
 const d=docket();
 d.fields[0].academic_working_title='CHANGED WITHOUT NEW DIGEST';
 assert.equal(validateOperatorDocket(d),false);
});
test('DOCKET 09 status is research review, never pre-signed human permission',()=>{
 const d=docket();
 assert.equal(d.disposition,'AWAITING_OPERATOR_REVIEW');
 assert.equal(d.authority.operator_approval_recorded,false);
 assert.equal(d.counts.canonical_changes,0);
 assert.equal(d.workstreams.length,7);
});
test('DOCKET 10 all unresolved issues and conceptual limits remain present',()=>{
 const d=docket(),md=renderOperatorDocket(d);
 assert.ok(d.unresolved_issues.some(x=>x.id==='REFERENTS'));
 assert.ok(d.unresolved_issues.some(x=>x.id==='OVERLAP'));
 assert.ok(d.unknowns.length>=3);
 assert.match(md,/Source|unknown|Unverified|not/i);
});
test('DOCKET 11 identical snapshots are byte-stable and cannot overwrite a changed file',()=>{
 const dir=mkdtempSync(join(tmpdir(),'rf-docket-v1-'));
 try{
  const a=stageDocket(docket(),{folder:dir});
  const b=stageDocket(docket(),{folder:dir});
  assert.deepEqual(a,b);
  assert.equal(a.files.length,3);
  assert.ok(a.files.some(x=>x.path.endsWith('.docket.md')));
 }finally{rmSync(dir,{recursive:true,force:true})}
});
test('DOCKET 12 a source revision change requires a new digest',()=>{
 const a=buildOperatorDocket({rev:{sha:'a'.repeat(40),kind:'TEST_FIXTURE'}});
 const b=buildOperatorDocket({rev:{sha:'b'.repeat(40),kind:'TEST_FIXTURE'}});
 assert.notEqual(a.docket_sha256,b.docket_sha256);
});
test('DOCKET 13 source-free reports leave registry and human seed byte-identical',()=>{
 docket();renderOperatorDocket(docket());chatDocketPayload(docket());
 assert.deepEqual(readFileSync(source),originalRegistry);
 assert.deepEqual(readFileSync(seed),originalSeed);
});
test('DOCKET 14 only scoped decisions are present, no direct release or merge',()=>{
 const n=readNomenclature(),d=docket();
 assert.deepEqual(d.decision_options,n.decisions.allow);
 assert.ok(!d.decision_options.includes('ADOPT_CANONICAL'));
 assert.ok(!d.decision_options.includes('DEPLOY'));
});
test('DOCKET 15 full in-chat procedural contract and human file are present',()=>{
 const p=new URL('../packages/rulefield/operator/IN_CHAT_DECISION_PROTOCOL.md',import.meta.url);
 const s=readFileSync(p,'utf8');
 assert.match(s,/same chat response/);
 assert.match(s,/GenUI.issueNewTurn/);
 assert.match(s,/all 80 original field expressions/);
});
