import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readRulefield} from '../packages/rulefield/rulefield.mjs';
import {buildResidualTriage,validateResidualTriage,CURATOR_EXEMPLARS,inspectResidual} from '../packages/rulefield/rulefields/residual_triage.mjs';
import {evidenceConditionedPriority,validateEvidencePriority,futurePriorityScenario} from '../packages/rulefield/rulefields/evidence_priority.mjs';
const canonical=new URL('../packages/rulefield/data/rulefield.v1.json',import.meta.url);
const before=readFileSync(canonical);
const ASOF='2026-11-08T12:00:00Z';
const d='a'.repeat(64),protocol='b'.repeat(64),metric=(lo,hi)=>({discrimination_bits_bounds:[lo,hi],assay_cost_units:1,falsification_readiness:1});
function receipt(lo,hi,{frame='MATCHED',kind='SYNTHETIC',available_at='2026-01-04T00:00:00Z',recorded_at='2026-01-02T00:00:00Z',verification_time='2026-01-05T00:00:00Z',protocol_sha=protocol}={}){
 return {evidence_id:'ASSAY-FIXTURE-'+lo,source_sha256:d,comparison_frame:frame,
  measurement_protocol_sha256:protocol_sha,evidence_kind:kind,
  event_time:'2026-01-01T00:00:00Z',recorded_at,available_at,verification_time,
  metric:metric(lo,hi)};
}
test('TOM-01 ledger covers exactly the 559 previously unassessed objects',()=>{
 const t=buildResidualTriage();
 assert.ok(validateResidualTriage(t));
 assert.equal(t.rows.length,559);
 assert.equal(t.counts.prior_audited,37);
 assert.equal(t.counts.curator_read,Object.keys(CURATOR_EXEMPLARS).length);
 assert.equal(t.counts.remaining,559);
 assert.equal(t.counts.curator_read+t.counts.deterministic_only,559);
});
test('TOM-02 original source bytes and all source statements remain unchanged',()=>{
 const t=buildResidualTriage(),source=readRulefield();
 assert.deepEqual(readFileSync(canonical),before);
 for(const row of t.rows){
  const src=source.rules.find(r=>r.id===row.id);
  assert.equal(row.source_statement,src.statement);
  assert.equal(row.claim_credit_added,0);
  assert.equal(row.scientific_adjudication_complete,false);
  assert.equal(row.authority_transfer,false);
 }
});
test('TOM-03 prior curated 37 are excluded without being erased',()=>{
 const t=buildResidualTriage();
 for(const id of ['INF-01','TC19','I-001','CBFE-RG-09'])assert.equal(inspectResidual(id,t),null);
 assert.equal(t.rows.length+37,596);
});
test('TOM-04 legacy source kind cannot automatically produce executable authority',()=>{
 const t=buildResidualTriage();
 const r=inspectResidual('I-003',t);
 assert.equal(r.proposed_primary_role,'RULE');
 assert.equal(r.executable_rule_contract_verified,false);
 assert.equal(r.review_status,'CURATOR_INTERPRETED_PROPOSAL');
});
test('TOM-05 inherited rewrite is not forced into an executable rule',()=>{
 const r=inspectResidual('I-010');
 assert.equal(r.inherited_kind,'rewrite');
 assert.equal(r.proposed_primary_role,'MODEL');
});
test('TOM-06 ambiguous roles remain visible and no speculative origin is claimed',()=>{
 const t=buildResidualTriage();
 assert.ok(t.rows.some(r=>r.alternative_role_candidates.length));
 assert.equal(t.authority.independent_empirical_credit,0);
 assert.equal(t.authority.od02,'HELD');
});
test('TOM-07 empty receipts preserve 70 historical plus 86 proposed positions',()=>{
 const p=evidenceConditionedPriority({as_of:ASOF});
 assert.ok(validateEvidencePriority(p));
 assert.equal(p.counts.rankable,0);
 assert.equal(p.counts.held,86);
 assert.equal(p.counts.moved,0);
 assert.equal(p.authority.canonical_mutation,false);
});
test('TOM-08 overlapping scoring intervals cannot authorize reordering',()=>{
 const p=evidenceConditionedPriority({as_of:ASOF,receipts:{
  'RF-001':receipt(1,2),'RF-002':receipt(1.5,2.5)}});
 assert.equal(p.counts.rankable,2);
 assert.equal(p.counts.moved,0);
 assert.ok(p.comparisons.some(x=>x.relation==='INCOMPARABLE_INTERVALS'));
});
test('TOM-09 comparable strictly dominating synthetic candidate can exchange proposed positions',()=>{
 const p=evidenceConditionedPriority({as_of:ASOF,receipts:{
  'RF-001':receipt(.5,.8),'RF-002':receipt(2,2.4)}});
 assert.ok(validateEvidencePriority(p));
 assert.equal(p.proposed_field_order[0],'RF-002');
 assert.equal(p.proposed_field_order[1],'RF-001');
 assert.equal(p.counts.moved,2);
 assert.equal(p.authority.real_world_utility_verified,false);
});
test('TOM-10 differing comparison frames and protocols block non-matched swaps',()=>{
 const p=evidenceConditionedPriority({as_of:ASOF,receipts:{
  'RF-001':receipt(.5,.8),'RF-002':receipt(2,2.4,{protocol_sha:'c'.repeat(64)})}});
 assert.equal(p.counts.moved,0);
});
test('TOM-11 anomalous future recording fails closed even with earlier available-at',()=>{
 const p=evidenceConditionedPriority({as_of:'2026-02-01T00:00:00Z',receipts:{
  'RF-001':receipt(1,2,{recorded_at:'2026-03-01T00:00:00Z',available_at:'2026-01-04T00:00:00Z'})}});
 assert.equal(p.counts.rankable,0);
 assert.ok(p.assessments['RF-001'].reasons.includes('EVIDENCE_NOT_AVAILABLE_AS_OF'));
});
test('TOM-12 missing receipt integrity/uncertainty fields cannot earn a score',()=>{
 const p=evidenceConditionedPriority({as_of:ASOF,receipts:{'RF-001':{
  evidence_id:'weak',event_time:'2026-01-01T00:00:00Z',recorded_at:'2026-01-02T00:00:00Z',
  available_at:'2026-01-03T00:00:00Z'}}});
 assert.equal(p.assessments['RF-001'].score,null);
 assert.equal(p.counts.rankable,0);
});
test('TOM-13 six thermodynamic prerequisites remain earlier than RF-079',()=>{
 const p=evidenceConditionedPriority({as_of:ASOF,receipts:{
  'RF-079':receipt(100,110),'RF-081':receipt(.1,.2)}});
 assert.ok(validateEvidencePriority(p));
 for(const id of ['RF-081','RF-082','RF-083','RF-084','RF-085','RF-086'])
  assert.ok(p.proposed_field_order.indexOf(id)<p.proposed_field_order.indexOf('RF-079'));
});
test('TOM-14 future scenario cannot change present epistemic state',()=>{
 const e={'RF-001':receipt(1,2,{available_at:'2027-01-04T00:00:00Z',verification_time:'2027-01-05T00:00:00Z'})};
 const out=futurePriorityScenario({receipts:e,present_as_of:ASOF,future_as_of:'2027-02-01T00:00:00Z'});
 assert.equal(out.scenario_only,true);
 assert.equal(out.current.counts.rankable,0);
 assert.equal(out.future.counts.rankable,1);
 assert.equal(out.no_retroactive_historical_evidence,true);
});
test('TOM-15 unknown field receipts cannot contaminate candidate priority map',()=>{
 assert.throws(()=>evidenceConditionedPriority({as_of:ASOF,receipts:{'RF-999':receipt(1,2)}}),/UNKNOWN_RECEIPT_RULEFIELD/);
});
