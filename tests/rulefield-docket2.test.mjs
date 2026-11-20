import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildRevisionDocket,validateRevisionDocket,renderRevisionDocket,chatRevisionDocket,stageRevisionDocket} from '../packages/rulefield/rulefields/revised_docket.mjs';
import {proposedTemporalPriority,temporalWitness} from '../packages/rulefield/rulefields/temporal_guardian.mjs';
import {evelynReprocess,latifaOpenField,zeroBounce,feedbackAblation,shannonEntropy,typedThermodynamicEmbedding} from '../packages/rulefield/rulefields/operator_models.mjs';
const canon=new URL('../packages/rulefield/data/rulefield.v1.json',import.meta.url),original=readFileSync(canon);
const docket=()=>buildRevisionDocket({revision:{head:'a'.repeat(40),standing:'TEST_ONLY'}});
test('ROD2 01 source complete 86 fields and 70 inherited priority positions',()=>{
 const d=docket();assert.equal(d.fields.length,86);assert.equal(d.original_priorities.length,70);
 assert.deepEqual(d.original_priorities.map(x=>x.rank),Array.from({length:70},(_,i)=>i+1));
 assert.ok(d.fields.every(f=>f.original_expression.length>0));
});
test('ROD2 02 type audit and role multiplicity are fully documented',()=>{
 const d=docket();assert.equal(d.ontology.role_bindings.length,10);
 assert.equal(d.ontology.historical_retyping.length,26);
 assert.equal(d.ontology.child_candidates.length,31);
 assert.equal(d.ontology.protected_rules.length,11);
 assert.equal(d.ontology.protected_fields.length,14);
 assert.equal(d.ontology.unexamined_legacy_ids.length,559);
 assert.ok(d.ontology.role_nonidentity_without_disjointness);
});
test('ROD2 03 nine review groups cover all 86 IDs exactly once',()=>{
 const d=docket(),ids=d.groups.flatMap(x=>x.ids);
 assert.equal(d.groups.length,9);assert.equal(ids.length,86);
 assert.equal(new Set(ids).size,86);assert.ok(validateRevisionDocket(d));
});
test('ROD2 04 complete human Markdown includes every original and all historical ranks',()=>{
 const d=docket(),md=renderRevisionDocket(d);
 for(const f of d.fields)assert.ok(md.includes(f.original_expression.replaceAll('|','\\|').replace(/\r?\n/g,' ⏎ ')),f.id);
 for(const r of d.original_priorities)assert.ok(md.includes(r.title.replaceAll('|','\\|')),r.id);
 assert.match(md,/OD-02/);assert.match(md,/RF-079/);
});
test('ROD2 05 chat review contains every item, each choice bound to exact digest',()=>{
 const d=docket(),c=chatRevisionDocket(d);
 assert.equal(c.groups.flatMap(x=>x.items).length,86);
 assert.equal(c.decisions.length,5);
 assert.ok(c.decisions.every(x=>x.draft.includes(d.sha256)));
 assert.equal(c.canonical_mutation,false);
});
test('ROD2 06 original operator-held academic labels and Flight remain HELD',()=>{
 const d=docket();assert.equal(d.authority.od02,'HELD');
 assert.equal(d.authority.protected_flight,'HELD');
 assert.equal(d.authority.merge_allowed,false);
});
test('ROD2 07 proposed temporal priority includes six prerequisites before RF-079',()=>{
 const plan=proposedTemporalPriority(),ids=plan.proposed_rulefield_order;
 const center=ids.indexOf('RF-079');
 assert.deepEqual(ids.slice(center-6,center),['RF-081','RF-082','RF-083','RF-084','RF-085','RF-086']);
 assert.equal(plan.historical.length,70);assert.equal(plan.counts.total,156);
});
test('ROD2 08 later available source cannot enter historical observer state retroactively',()=>{
 const t=temporalWitness({id:'late',event_time:'2026-01-01T00:00:00Z',
   recorded_at:'2026-01-02T00:00:00Z',available_at:'2026-02-01T00:00:00Z'},
   {as_of:'2026-01-15T00:00:00Z'});
 assert.equal(t.eligibility,'HELD_TEMPORAL_EVIDENCE');
 assert.ok(t.flags.includes('SOURCE_NOT_YET_AVAILABLE'));
});
test('ROD2 09 operators Evelyn and Latifa remain interpreted source-free methods',()=>{
 const e=evelynReprocess({source:'same text',receivers:[{id:'one',lens:'A'},{id:'two',lens:'B'}]});
 assert.equal(e.authorization_transferred,false);
 const l=latifaOpenField({existing:['a'],candidates:['a','b']});
 assert.deepEqual(l.new_hypotheses,['b']);assert.equal(l.proved_hypotheses,0);
});
test('ROD2 10 zero registered bounces does not identify hidden launch',()=>{
 const z=zeroBounce({launches:1,registrations:0});
 assert.equal(z.zero_bounce_anomaly,true);
 assert.equal(z.counterworlds.length,2);
});
test('ROD2 11 coupled-feedback ablation reports synthetic difference, no diagnosis',()=>{
 const x=feedbackAblation({steps:6});
 assert.equal(x.real_world_diagnosis,false);
 assert.equal(x.epistemic_credit,'MODEL_COMPARISON_ONLY');
});
test('ROD2 12 Shannon functional and thermo-social map have distinct proof obligations',()=>{
 assert.ok(Math.abs(shannonEntropy([0.5,0.5])-1)<1e-12);
 const x=typedThermodynamicEmbedding({
  thermodynamic_variables:[{id:'entropy',units:'joule/kelvin'}],
  social_variables:[{id:'prestige',units:'not-defined'}],
  mapping:[{from:'entropy',to:'prestige'}]
 });
 assert.equal(x.map_admissibility,'HELD_UNPROVED_MAPPING');
 assert.equal(x.social_thermodynamic_equivalence_proved,false);
});
test('ROD2 13 immutable staged reports require a fresh digest if source changes',()=>{
 const a=docket(),b=buildRevisionDocket({revision:{head:'b'.repeat(40),standing:'TEST_ONLY'}});
 assert.notEqual(a.sha256,b.sha256);
 const dir=mkdtempSync(join(tmpdir(),'rod2-'));
 try{
  const x=stageRevisionDocket(a,{folder:dir}),y=stageRevisionDocket(a,{folder:dir});
  assert.deepEqual(x,y);assert.equal(x.files.length,3);
 }finally{rmSync(dir,{recursive:true,force:true})}
 assert.deepEqual(readFileSync(canon),original);
});
test('ROD2 14 a modified source-derived field invalidates docket',()=>{
 const d=docket();d.fields[0].academic_working_title='unapproved reinterpretation';
 assert.equal(validateRevisionDocket(d),false);
});

test('ROD2 15 future-recorded event cannot become admissible through earlier source availability',()=>{
 const t=temporalWitness({id:'future-record',event_time:'2026-01-01T00:00:00Z',
  recorded_at:'2026-03-01T00:00:00Z',available_at:'2026-01-10T00:00:00Z'},
  {as_of:'2026-02-01T00:00:00Z'});
 assert.equal(t.eligibility,'HELD_TEMPORAL_EVIDENCE');
 assert.ok(t.flags.includes('RECORD_NOT_YET_CREATED'));
 assert.ok(t.flags.includes('SOURCE_AVAILABLE_BEFORE_RECORD_ANOMALY'));
});
test('ROD2 16 missing source-record time fails closed instead of becoming a historical witness',()=>{
 const t=temporalWitness({id:'unrecorded',event_time:'2026-01-01T00:00:00Z',
  available_at:'2026-01-05T00:00:00Z'},{as_of:'2026-02-01T00:00:00Z'});
 assert.equal(t.eligibility,'HELD_TEMPORAL_EVIDENCE');
 assert.ok(t.flags.includes('RECORD_TIME_UNKNOWN'));
});
test('ROD2 17 ordered event-record-availability clocks admit historical evidence only by cutoff',()=>{
 const row={id:'ordered',event_time:'2026-01-01T00:00:00Z',
  recorded_at:'2026-01-02T00:00:00Z',available_at:'2026-01-05T00:00:00Z'};
 const before=temporalWitness(row,{as_of:'2026-01-04T00:00:00Z'});
 const after=temporalWitness(row,{as_of:'2026-01-06T00:00:00Z'});
 assert.equal(before.eligibility,'HELD_TEMPORAL_EVIDENCE');
 assert.equal(after.eligibility,'SOURCE_EVIDENCE_ADMISSIBLE_AS_OF');
 assert.equal(after.no_human_authorization_inferred,true);
});
