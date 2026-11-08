import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readRulefield} from '../packages/rulefield/rulefield.mjs';
import {readRevisionSeed} from '../packages/rulefield/rulefields/temporal_guardian.mjs';
import {readTypeAssessment,buildTypedProjection,validateTypedProjection,inspectType,proposedRuleGate} from '../packages/rulefield/rulefields/type_system.mjs';
import {packetTemplate,reviewPacket} from '../packages/rulefield/amendments/receiver.mjs';
import {buildOperatorDisclosure} from '../packages/rulefield/operator/disclosure.mjs';
import {inspectHumanDecision} from '../packages/rulefield/operator/decision.mjs';
const origReg=new URL('../packages/rulefield/data/rulefield.v1.json',import.meta.url);
const origSeed=new URL('../packages/rulefield/rulefields/data/operator-rulefields-20261107.json',import.meta.url);
const revision=new URL('../packages/rulefield/rulefields/data/operator-rulefields-20261108-revision.json',import.meta.url);
const before=[origReg,origSeed,revision].map(url=>readFileSync(url));
test('TYPES 01 typed projection accounts for all 596 historical rule-container records',()=>{
 const p=buildTypedProjection();
 assert.ok(validateTypedProjection(p));assert.equal(p.objects.legacy.length,596);
 assert.equal(p.counts.original_legacy_rule_records,596);
 assert.equal(p.counts.assessed_retypes,26);
 assert.equal(p.counts.protected_rules,11);
 assert.equal(p.unassessed_records.length,559);
});
test('TYPES 02 86 research fields stay separate from 31 proposed children',()=>{
 const p=buildTypedProjection();
 assert.equal(p.objects.rulefields.length,86);
 assert.equal(p.objects.children.length,31);
 assert.ok(p.objects.rulefields.every(x=>x.kind==='RULEFIELD'));
 assert.ok(p.objects.children.every(x=>x.review_status==='UNQUALIFIED_NOT_ADMITTED'&&x.scientific_credit===0));
});
test('TYPES 03 actual three-scene inventory is a MODEL not a local rewrite',()=>{
 const x=inspectType('INF-01');
 assert.equal(x.proposed_effective_type,'MODEL');
 assert.equal(x.legacy_container,'rules');
 assert.ok(x.parent_refs.includes('Q03'));
 assert.equal(x.original_record_mutated,false);
});
test('TYPES 04 experimental ambiance research is an ASSAY',()=>{
 assert.equal(inspectType('Q01-A04').proposed_effective_type,'ASSAY');
 assert.equal(inspectType('TC11').proposed_effective_type,'ASSAY');
});
test('TYPES 05 historical adverse-result record stays source not established law',()=>{
 const p=inspectType('Q17-R03');
 assert.equal(p.proposed_effective_type,'SOURCE');
 assert.equal(p.assessment_kind,'NEGATIVE_RESULT_RECORD');
});
test('TYPES 06 accepted operational guarded record remains a rule',()=>{
 assert.equal(inspectType('I-001').proposed_effective_type,'RULE');
 assert.equal(inspectType('I-023').proposed_effective_type,'RULE');
 assert.equal(inspectType('CBFE-RG-09').proposed_effective_type,'RULE');
});
test('TYPES 07 unexamined legacy objects are not automatically certified as executable',()=>{
 const x=inspectType('I-002');
 assert.equal(x.proposed_effective_type,'HISTORICAL_RECORD');
 assert.equal(x.review_status,'LEGACY_TYPE_NOT_INDEPENDENTLY_ADJUDICATED');
});
test('TYPES 08 Conway and Rule 30 are research fields that yield local rule candidates',()=>{
 for(const id of ['RF-059','RF-060']){
  const f=inspectType(id),p=buildTypedProjection();
  assert.equal(f.kind,'RULEFIELD');
  assert.ok(p.objects.children.some(x=>x.source_rulefield_id===id));
 }
});
test('TYPES 09 thermodynamics remains a research conjecture with unqualified children',()=>{
 const x=inspectType('RF-079');
 assert.equal(x.kind,'RULEFIELD');
 assert.ok(x.academic_working_title.includes('Thermodynamics'));
 const q=buildTypedProjection();
 assert.ok(q.objects.children.some(x=>x.source_rulefield_id==='RF-079'));
 assert.equal(q.authority.scientific_claim_credit,0);
});
test('TYPES 10 field as rule is explicitly held even with apparent child metadata',()=>{
 const x=proposedRuleGate({kind:'PROPOSE_RULE',object_type:'RULEFIELD',source_rulefield_id:'RF-060',
 formal_rule:{state_space:'binary grid',guard:'every tick',local_transition:'B3/S23',observer:'synthetic detector'}});
 assert.equal(x.status,'HELD_RULEFIELD_RULE_TYPE_COLLAPSE');
 assert.ok(x.issues.includes('RULEFIELD_AS_RULE_TYPE_COLLAPSE'));
});
test('TYPES 11 field-derived child requires a formal rule contract',()=>{
 const x=proposedRuleGate({kind:'PROPOSE_RULE',source_rulefield_id:'RF-060'});
 assert.equal(x.status,'HELD_RULEFIELD_RULE_TYPE_COLLAPSE');
 assert.ok(x.issues.includes('MISSING_TYPED_LOCAL_RULE_CONTRACT'));
});
test('TYPES 12 complete formal child shape remains unadopted candidate',()=>{
 const x=proposedRuleGate({kind:'PROPOSE_RULE',object_type:'RULE',source_rulefield_id:'RF-060',
 formal_rule:{state_space:'binary row',guard:'time step t',local_transition:'l XOR (c OR r)',observer:'specified finite bit readout'}});
 assert.equal(x.status,'CANDIDATE_RULE_ONLY_NOT_ADOPTED');
 assert.equal(x.human_adoption_authorized,false);
 assert.equal(x.scientific_credit,0);
});
test('TYPES 13 receiver holds a mis-typed candidate and discloses exact reason',()=>{
 const p=packetTemplate({packet_id:'RF-AP-TYPE-RECEIVER-01'});
 p.proposals[0].kind='PROPOSE_RULE';
 p.proposals[0].object_type='RULEFIELD';
 p.proposals[0].source_rulefield_id='RF-060';
 const r=reviewPacket(p),d=buildOperatorDisclosure(p,r);
 assert.equal(r.disposition,'HELD_RULEFIELD_RULE_TYPE_COLLAPSE');
 assert.ok(r.as_source_free.issues.some(x=>x.kind==='RULEFIELD_RULE_TYPE_COLLAPSE'));
 assert.equal(d.known_consequences[0].type_admission.status,'HELD_RULEFIELD_RULE_TYPE_COLLAPSE');
});
test('TYPES 14 source-free candidate gate is independent of external scientific proof',()=>{
 const p=packetTemplate({packet_id:'RF-AP-TYPE-RECEIVER-02'});
 p.proposals[0].kind='PROPOSE_RULE';p.proposals[0].object_type='RULE';p.proposals[0].source_rulefield_id='RF-060';
 p.proposals[0].formal_rule={state_space:'binary CA lattice',guard:'each synchronous tick',local_transition:'l XOR (c OR r)',observer:'finite trace'};
 const r=reviewPacket(p);
 assert.equal(r.as_source_free.proposals[0].diagnostic.type_admission.status,'CANDIDATE_RULE_ONLY_NOT_ADOPTED');
 assert.equal(r.as_source_free.scientific_credit,0);
 assert.equal(r.original_registry_mutated,false);
});
test('TYPES 15 decision checker cannot bless a held field-as-rule',()=>{
 const p=packetTemplate({packet_id:'RF-AP-TYPE-RECEIVER-03'});
 p.proposals[0].kind='PROPOSE_RULE';p.proposals[0].object_type='RULEFIELD';
 const r=reviewPacket(p),d=buildOperatorDisclosure(p,r);
 const decision={schema:'td613.rulefield.operator-decision/v1',decision:'REQUEST_STAGED_SYNTHESIS',
 packet_id:d.packet_id,packet_sha256:d.packet_sha256,disclosure_sha256:d.disclosure_sha256,
 baseline_registry_sha256:d.baseline_registry_sha256,
 selected_proposal_ids:['AP01'],scope:'STAGED_CANDIDATE_ONLY',
 human_statement:'Please stage this research field directly as executable rule without further formalization.',
 accepts_unknown_future_patch:false};
 const result=inspectHumanDecision(decision,d);
 assert.equal(result.status,'HELD');
 assert.ok(result.issues.includes('UNRESOLVED_RULEFIELD_RULE_TYPE_COLLAPSE'));
 assert.equal(result.action_executed,false);
});
test('TYPES 16 all declared type links reference real source IDs and review-only status',()=>{
 const a=readTypeAssessment(),p=buildTypedProjection();
 const rs=new Set(readRulefield().rules.map(x=>x.id));
 const fs=new Set(readRevisionSeed().items.map(x=>x.id));
 for(const r of a.promote_rule_records_to_field_or_assay)assert.ok(rs.has(r.rule_id),r.rule_id);
 for(const r of p.objects.children)assert.ok(fs.has(r.source_rulefield_id),r.id);
 assert.ok(p.relations.every(x=>x.proposed_only===true));
});
test('TYPES 17 manual tampering breaks content-addressed projection digest',()=>{
 const p=buildTypedProjection();
 p.objects.legacy[0].proposed_effective_type='THEOREM';
 assert.equal(validateTypedProjection(p),false);
});
test('TYPES 18 no historical bytes are rewritten by assessing or receiving rules',()=>{
 buildTypedProjection();inspectType('RF-079');
 assert.deepEqual([origReg,origSeed,revision].map(url=>readFileSync(url)),before);
});
test('TYPES 19 explicit OD-02 HOLD survives projected ontology',()=>{
 const seed=readRevisionSeed(),p=buildTypedProjection();
 assert.equal(seed.approvals['OD-02'],'HELD_OPERATOR_WITHHELD_RATIFICATION');
 assert.equal(p.authority.human_ontology_review_pending,true);
 assert.equal(p.authority.protected_flight,'HELD');
});
