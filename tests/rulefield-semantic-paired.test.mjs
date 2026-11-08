import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildSemanticReview,validateSemanticReview,semanticInspection,readSemanticCasebook} from '../packages/rulefield/rulefields/semantic_review.mjs';
import {buildResidualTriage} from '../packages/rulefield/rulefields/residual_triage.mjs';
import {evaluatePairedEpisode,pairedPriorityPreview,validatePairedPriority} from '../packages/rulefield/rulefields/paired_priority.mjs';
const registryURL=new URL('../packages/rulefield/data/rulefield.v1.json',import.meta.url),before=readFileSync(registryURL);
const d='a'.repeat(64),e='b'.repeat(64),p='c'.repeat(64),q='d'.repeat(64),h='e'.repeat(64),r='f'.repeat(64);
const ASOF='2026-02-01T00:00:00Z';
function episode(id,mode='high',{n=256,taskOffset=0,cohort=q,budget=1,source=e}={}){
 return {schema:'td613.rulefield.paired-episode/v1',rulefield_id:id,
  training_source_sha256:d,evaluation_source_sha256:source,
  protocol_sha256:p,cohort_sha256:cohort,comparison_frame_sha256:h,
  preregistration_sha256:q,randomization_commitment_sha256:r,
  preregistered_at:'2025-12-01T00:00:00Z',metric:'BINARY_PAIRED_GAIN',alpha:0.05,
  competent_null_declared:true,blinded_evaluation_declared:true,task_population_declared:true,
  iid_trial_assumption_declared:true,budget_unit:'TOKENS',budget_per_trial:budget,
  external_witness_authenticated:false,
  trials:Array.from({length:n},(_,i)=>({trial_id:'TASK-'+(i+taskOffset),
   candidate_correct:mode==='high'?true:mode==='low'?(i%10<3):(i%2===0),
   competent_null_correct:mode==='high'?false:mode==='low'?(i%10<2):(i%2===0),
   candidate_budget:budget,null_budget:budget,clocks:{
    event_time:'2026-01-01T00:00:00Z',recorded_at:'2026-01-02T00:00:00Z',
    available_at:'2026-01-03T00:00:00Z'}}))};
}
test('R3 01 casebook 94 records all share current exact 596-source statement and retain human hold',()=>{
 const c=readSemanticCasebook();assert.equal(c.cases.length,94);
 assert.ok(c.cases.every(x=>x.human_ratified===false&&x.independent_witness===false));
 assert.ok(validateSemanticReview(buildSemanticReview()));
});
test('R3 02 38+94=132 individually read; remaining 427 deterministic and source-present',()=>{
 const r=buildSemanticReview();
 assert.equal(r.rows.length,559);
 assert.equal(r.totals.curator_previous,38);assert.equal(r.totals.curator_new,94);
 assert.equal(r.totals.selected_agent_interpretations,132);
 assert.equal(r.totals.deterministic_only,427);
 assert.equal(r.totals.original,596);
 assert.equal(r.totals.scientific_adjudications,0);
 assert.equal(r.totals.adopted_local_rules,0);
 assert.deepEqual(readFileSync(registryURL),before);
});
test('R3 03 cross-role controls prohibit all 559 automatic execution promotions',()=>{
 const r=buildSemanticReview();
 assert.ok(r.rows.every(x=>x.human_ratified===false&&x.local_execution_authorized===false));
 assert.ok(r.rows.some(x=>x.changed_from_preliminary_role));
 assert.equal(r.authority.od02,'HELD');
});
test('R3 04 source-record interpretations and source-normalized counterexample gate',()=>{
 const x=semanticInspection('Q21-R03');
 assert.equal(x.proposed_primary_role,'SOURCE');
 assert.match(x.discriminating_challenge,/finite|episode/i);
 const m=semanticInspection('X-025');
 assert.equal(m.proposed_primary_role,'MODEL');
 assert.match(m.semantic_interpretation,/taxonomy/i);
 const no=semanticInspection('Q21-R01');
 assert.equal(no.semantic_review_level,'EARLIER_AGENT_SOURCE_READ_PROPOSAL');
});
test('R3 05 count complete and no source-equivalence from casebook',()=>{
 const r=buildSemanticReview(),base=buildResidualTriage();
 assert.equal(r.parent_residual_digest,base.digest);
 assert.equal(new Set(r.rows.map(x=>x.id)).size,559);
 assert.ok(r.rows.filter(x=>x.changed_from_preliminary_role).every(x=>x.semantic_review_level==='AGENT_SOURCE_READ_WITH_DISCRIMINATING_CHALLENGE'));
});
test('R3 06 matched paired episode produces bounded source-declared statistics only',()=>{
 const x=evaluatePairedEpisode(episode('RF-001'),{as_of:ASOF});
 assert.equal(x.standing,'QUALIFIED_WITHIN_DECLARED_FINITE_EPISODE_EXTERIORITY_HELD');
 assert.equal(x.measures.n,256);
 assert.equal(x.measures.positive_pairs,256);
 assert.ok(x.measures.confidence_lower_above_zero);
 assert.equal(x.independent_exteriority_witness,false);
 assert.equal(x.scientific_utility_proved,false);
});
test('R3 07 paired sample with identical outcome controls has zero observed advantage',()=>{
 const x=evaluatePairedEpisode(episode('RF-001','equal'),{as_of:ASOF});
 assert.equal(x.measures.mean_paired_gain,0);
 assert.equal(x.measures.confidence_lower_above_zero,false);
});
test('R3 08 Bonferroni correction becomes wider for 86 fields',()=>{
 const x=evaluatePairedEpisode(episode('RF-001','low'),{as_of:ASOF,familywise_tests:1});
 const y=evaluatePairedEpisode(episode('RF-001','low'),{as_of:ASOF,familywise_tests:86});
 assert.ok(y.measures.confidence_bounds[0]<=x.measures.confidence_bounds[0]);
 assert.ok(y.measures.confidence_bounds[1]>=x.measures.confidence_bounds[1]);
 assert.equal(y.measures.familywise_tests,86);
});
test('R3 09 chronologically impossible or late preregistration fails closed',()=>{
 const x=episode('RF-001');
 x.preregistered_at='2026-01-05T00:00:00Z';
 const r=evaluatePairedEpisode(x,{as_of:ASOF});
 assert.equal(r.standing,'HELD_UNQUALIFIED_PAIRED_EPISODE');
 assert.ok(r.reasons.includes('INVALID_OR_RETROACTIVE_TRIAL_CLOCKS'));
});
test('R3 10 duplicate paired trial IDs and score changes are rejected',()=>{
 const x=episode('RF-001');x.trials[1].trial_id=x.trials[0].trial_id;
 const a=evaluatePairedEpisode(x,{as_of:ASOF});
 assert.ok(a.reasons.includes('DUPLICATE_OR_MISSING_TRIAL_ID'));
 const y=episode('RF-001');y.trials[0].candidate_correct='yes';
 assert.ok(evaluatePairedEpisode(y,{as_of:ASOF}).reasons.includes('BINARY_OUTCOME_REQUIRED'));
});
test('R3 11 model-training/evaluation collision and unequal budgets hold',()=>{
 const x=episode('RF-001');x.training_source_sha256=x.evaluation_source_sha256;
 assert.ok(evaluatePairedEpisode(x,{as_of:ASOF}).reasons.includes('TRAIN_EVALUATION_SOURCE_COLLISION'));
 const y=episode('RF-001');y.trials[4].null_budget=3;
 assert.ok(evaluatePairedEpisode(y,{as_of:ASOF}).reasons.includes('UNMATCHED_TRIAL_BUDGET'));
});
test('R3 12 self-declared external authentication cannot become exteriority',()=>{
 const x=episode('RF-001');x.external_witness_authenticated=true;
 const y=evaluatePairedEpisode(x,{as_of:ASOF});
 assert.ok(y.reasons.includes('UNVERIFIED_SELF_ATTESTED_EXTERIORITY'));
 assert.equal(y.independent_exteriority_witness,false);
});
test('R3 13 empty measured input holds all 86 priorities',()=>{
 const p=pairedPriorityPreview({as_of:ASOF});
 assert.ok(validatePairedPriority(p));assert.equal(p.moves.length,0);
 assert.equal(p.counts.held,86);assert.equal(p.counts.qualified_internal,0);
});
test('R3 14 strongly separated, matched 256-task episodes allow two-position preview',()=>{
 const p=pairedPriorityPreview({as_of:ASOF,episodes:{
  'RF-001':episode('RF-001','low'),'RF-002':episode('RF-002','high')}});
 assert.ok(validatePairedPriority(p));
 assert.deepEqual(p.ranked_ids.slice(0,2),['RF-002','RF-001']);
 assert.equal(p.counts.moves,2);
 assert.equal(p.authority.operator_acceptance,false);
});
test('R3 15 different task sets make evidence incomparable',()=>{
 const p=pairedPriorityPreview({as_of:ASOF,episodes:{
  'RF-001':episode('RF-001','low'),'RF-002':episode('RF-002','high',{taskOffset:1})}});
 assert.equal(p.counts.moves,0);
});
test('R3 16 missing intervening source blocks leapfrog priority',()=>{
 const p=pairedPriorityPreview({as_of:ASOF,episodes:{
  'RF-001':episode('RF-001','low'),'RF-003':episode('RF-003','high')}});
 assert.equal(p.counts.moves,0);
 assert.deepEqual(p.ranked_ids.slice(0,3),['RF-001','RF-002','RF-003']);
});
test('R3 17 nonmatching protocol, budget and cohort prevent comparisons',()=>{
 for(const args of [{cohort:'1'.repeat(64)},{budget:2},{source:'9'.repeat(64)}]){
  const p=pairedPriorityPreview({as_of:ASOF,episodes:{
   'RF-001':episode('RF-001','low'),'RF-002':episode('RF-002','high',args)}});
  assert.equal(p.counts.moves,0);
 }
});
test('R3 18 prerequisite monotonicity and unchanged historical 70 are preserved',()=>{
 const p=pairedPriorityPreview({as_of:ASOF,episodes:{
  'RF-079':episode('RF-079','high'),'RF-081':episode('RF-081','low')}});
 assert.ok(validatePairedPriority(p));
 for(const id of ['RF-081','RF-082','RF-083','RF-084','RF-085','RF-086'])
  assert.ok(p.ranked_ids.indexOf(id)<p.ranked_ids.indexOf('RF-079'));
 assert.equal(p.original_70.length,70);
});
test('R3 19 finite CI assay cannot claim Golden Egg or independent external evidence',()=>{
 const p=pairedPriorityPreview({as_of:ASOF,episodes:{
  'RF-001':episode('RF-001','low'),'RF-002':episode('RF-002','high')}});
 assert.equal(p.authority.exteriority_claim,false);
 assert.equal(p.constraints.independent_witness_verified,false);
 assert.equal(p.authority.protected_flight,'HELD');
});

test('R3 20 impossible calendar dates fail before any paired-outcome interpretation',()=>{
 const x=episode('RF-001');x.trials[0].clocks.recorded_at='2026-02-30T00:00:00Z';
 const report=evaluatePairedEpisode(x,{as_of:'2026-04-01T00:00:00Z'});
 assert.equal(report.standing,'HELD_UNQUALIFIED_PAIRED_EPISODE');
 assert.ok(report.reasons.includes('INVALID_OR_RETROACTIVE_TRIAL_CLOCKS'));
});

test('R3 21 fourteen non-exclusive research views preserve original ID and no execution authority',()=>{
 const r=buildSemanticReview();
 const qualified=r.rows.filter(x=>x.additional_rulefield_view_proposed);
 assert.equal(qualified.length,14);
 for(const x of qualified){
  assert.equal(x.role_bindings.length,2);
  assert.equal(x.role_bindings[0].view_ref,'legacy_rule:'+x.id+'#role:'+x.proposed_primary_role.toLowerCase());
  assert.equal(x.role_bindings[1].view_ref,'legacy_rule:'+x.id+'#role:rulefield');
  assert.equal(x.role_bindings[1].role,'RULEFIELD');
  assert.notEqual(x.role_bindings[0].context,x.role_bindings[1].context);
  assert.ok(x.role_bindings.every(y=>y.executable_authority===false));
 }
 assert.equal(r.totals.nonexclusive_new_research_role_views,14);
});
