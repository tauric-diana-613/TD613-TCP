import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {
 readRulefield,validateRulefield,searchRules,traceRule,inspectPriority,inspectCrossing,
 priorityLens,negativeResults,unresolvedAliases,proposeRule,verifySourceNonMutation
} from '../packages/rulefield/rulefield.mjs';
const index=readRulefield();
const sourceGarden=JSON.parse(readFileSync(new URL('../packages/rulefield/sources/nks-garden-190.snapshot.json',import.meta.url),'utf8'));
const sourceRecovery=JSON.parse(readFileSync(new URL('../packages/rulefield/sources/emergence-recovery-112.snapshot.json',import.meta.url),'utf8'));
test('RULEFIELD: all invariants validate, no protected work or unearned novelty',()=>{
 const d=validateRulefield(index);
 assert.equal(d.status,'VALIDATED_SOURCE_FREE_REGISTRY_ONLY');
 assert.deepEqual(d.classes,{I:50,P:45,X:95});
 assert.equal(d.rules,596);assert.equal(d.crossings,88);assert.equal(d.queue,70);
 assert.equal(d.protected_flight,'HELD');
 assert.equal(d.scientific_credit,0);
});
test('RULEFIELD: original Garden 190 retained verbatim as structured records',()=>{
 assert.equal(sourceGarden.rules.length,190);
 for(const source of sourceGarden.rules){
 const actual=index.rules.find(r=>r.id===source.id);
 assert.equal(actual.lane,'HISTORICAL_NKS');
 assert.deepEqual(actual.record,source);
 assert.equal(actual.inherited_class,source.class_);
 }
 assert.deepEqual(index.crossings.slice(0,30).map(r=>r.id),sourceGarden.crossings.map(r=>r.id));
});
test('RULEFIELD: recovery annotations retained separately, not rewritten into original',()=>{
 for(const r of sourceRecovery.existing_rules){
 const target=index.rules.find(x=>x.id===r.id);
 assert.deepEqual(target.prior_promotion_annotations,r.promoted_associations||[]);
 assert.equal(target.record.original_class_preserved,undefined);
 }
});
test('RULEFIELD: every source lane reconciles without silent duplicate ID',()=>{
 const totals=index.totals.lanes;
 assert.deepEqual(totals,{
 HISTORICAL_NKS:190,RECOVERED_SOURCE_PROPOSAL:112,QUEUE_PROPOSAL:245,
 OPERAHOUSE_MEMBRANE:16,THINKER_CONDITION:20,CBFE_DD02:12,FUTURE_RULE_HYPOTHESIS:1
 });
 assert.equal(new Set(index.rules.map(x=>x.id)).size,596);
});
test('RULEFIELD: original queue reorder exactly one adjacent swap, no top override',()=>{
 assert.equal(index.priority_queue[3].title,'Computational Black feminist epistemology');
 assert.equal(index.priority_queue[4].title,'Dromology and temporal rationality');
 assert.match(index.priority_queue[14].title,/OPERAHOUSE/);
 assert.match(index.priority_queue[15].title,/Palace Act I/);
 assert.match(index.priority_queue[16].title,/Palace Act II/);
 assert.match(index.priority_queue[46].title,/^Black feminist epistemology/);
 assert.deepEqual(priorityLens(index).map(x=>x.rank),Array.from({length:70},(_,i)=>i+1));
});
test('RULEFIELD: priority 4 provides executable ideas without substituting for lived intellectual tradition',()=>{
 const t=inspectPriority(index,4);
 assert.equal(t.rank,4);
 assert.ok(t.members.some(x=>x.id==='CBFE-RG-11'));
 assert.ok(t.members.some(x=>x.id==='CBFE-RG-PATH-FIBER-01'));
 assert.ok(t.members.some(x=>x.id==='TC01'));
 assert.ok(!t.members.some(x=>x.lane==='HISTORICAL_NKS'&&x.id==='HISTORICAL_FAKE_RULE'));
});
test('RULEFIELD: query supports source term and evidence class filtering',()=>{
 const a=searchRules(index,{term:'standing',queue_rank:4,limit:8});
 assert.ok(a.total>0);
 assert.ok(a.returned.every(r=>r.queue_refs.includes('Q04')));
 const b=searchRules(index,{term:'path',lane:'FUTURE_RULE_HYPOTHESIS'});
 assert.equal(b.total,1);
});
test('RULEFIELD: trace preserves rule, related crossings, custody status and source handles',()=>{
 const a=traceRule(index,'CBFE-RG-11');
 assert.equal(a.rule.lane,'CBFE_DD02');
 assert.ok(a.crossings.some(c=>c.id==='RF-X01'));
 assert.equal(a.scientific_ceiling,'SOURCE_FREE_BOUNDED_TIE_NOT_NEW_DISCOVERY');
 const b=traceRule(index,'I-001');
 assert.equal(b.rule.inherited_class,'I');
});
test('RULEFIELD: unresolved aliases are surfaced, never silently bound to convenient topics',()=>{
 const a=unresolvedAliases(index);
 assert.equal(a.count,index.totals.unresolved_aliases);
 assert.ok(a.count>0);
 const e=inspectCrossing(index,'QC-02');
 assert.ok(e.unresolved.some(x=>x.source_token==='palace_act_ii'));
});
test('RULEFIELD: source-free null and history-fiber candidate remain distinct',()=>{
 const n=negativeResults(index);
 assert.equal(n.status,'SOURCE_FREE_BOUNDED_TIE');
 assert.deepEqual(n.accuracy,{candidate:384,competent_union:384,intentionally_incomplete_static:49});
 assert.equal(n.novelty_credit,0);
 assert.equal(n.next_candidate.claim_state,'PROPOSED_NOT_QUALIFIED');
});
test('RULEFIELD: RGI-01 can stage a documented candidate without automatic adoption',()=>{
 const proposed=proposeRule(index,{
  id:'RF-P-007',title:'Recoverable provenance paths',
  statement:'Find at least one source-warranted route distinction not recoverable by a matched complete-history comparator.',
  source_ids:['SOURCE-FINITE-SYNTHETIC'],queue_rank:4,
  falsifier:'Matched strong union recovers all same admissible routes.',
  competent_null:'Independent exhaustive source-free enumerator with matched authority.'
 });
 assert.equal(proposed.status,'STAGED_PROPOSED_NO_AUTHORITY');
 assert.equal(proposed.auto_committed,false);
 assert.ok(!index.rules.some(x=>x.id===proposed.id));
 assert.throws(()=>proposeRule(index,{id:'RF-P-008',title:'Premature rule',statement:'This is a new untested claim that should not be adopted',source_ids:['SOURCE-A'],queue_rank:4}),{code:'NO_FALSIFIER'});
 assert.throws(()=>proposeRule(index,{id:'I-002',title:'Collision test',statement:'Do not silently assume historical provenance and override',source_ids:['SOURCE-A'],queue_rank:4}),{code:'INVALID_NEW_RULE_NAMESPACE'});
});
test('RULEFIELD: historical identity mutation is rejected',()=>{
 const clone=structuredClone(index);
 const t=clone.rules.find(x=>x.id==='I-001');t.record.rule='changed';
 assert.throws(()=>verifySourceNonMutation(index,clone),{code:'HISTORICAL_RULE_MUTATED'});
 assert.equal(verifySourceNonMutation(index,index),true);
});
test('RULEFIELD: hostile credit or release mutation fails closed',()=>{
 const clone=structuredClone(index);clone.authority.release_authority=true;
 assert.throws(()=>validateRulefield(clone),{code:'PROTECTED_FLIGHT_OR_PROMOTION_ESCALATION'});
 const alt=structuredClone(index);alt.crossings[0].scientific_credit=1;
 assert.throws(()=>validateRulefield(alt),{code:'UNEARNED_CROSSING_SCIENTIFIC_CREDIT'});
});
test('RULEFIELD: CLI actually executes query and closed-form validation',()=>{
 const cli=fileURLToPath(new URL('../scripts/rulefield.mjs',import.meta.url));
 const a=JSON.parse(execFileSync(process.execPath,[cli,'validate'],{encoding:'utf8'}));
 const b=JSON.parse(execFileSync(process.execPath,[cli,'priority','4','--limit','10'],{encoding:'utf8'}));
 const c=JSON.parse(execFileSync(process.execPath,[cli,'frontier'],{encoding:'utf8'}));
 assert.equal(a.rules,596);assert.equal(b.rank,4);assert.equal(c.novelty_credit,0);
});
