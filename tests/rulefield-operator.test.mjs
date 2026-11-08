import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {packetTemplate,reviewPacket} from '../packages/rulefield/amendments/receiver.mjs';
import {buildOperatorDisclosure,renderOperatorDisclosure,validateDisclosure} from '../packages/rulefield/operator/disclosure.mjs';
import {inspectHumanDecision} from '../packages/rulefield/operator/decision.mjs';
const before=readFileSync(new URL('../packages/rulefield/data/rulefield.v1.json',import.meta.url));
const mk=()=>{
 const p=packetTemplate({packet_id:'RF-AP-20261107-OPERATOR'});
 p.context.unknown_future={odd_machine_extension:'PRESERVE THIS TEXT EVEN IF SCHEMA DOES NOT KNOW IT'};
 return p;
};
const disclose=p=>buildOperatorDisclosure(p,reviewPacket(p));
test('OPERATOR 01 packet and review fully bound, no human authorization',()=>{
 const p=mk(),d=disclose(p);
 assert.equal(d.packet_id,p.packet_id);
 assert.equal(d.proposal_count,1);
 assert.equal(d.human_authorization_received,false);
 assert.equal(d.effect_and_authority_boundary.adoption_authority,false);
 assert.equal(d.effect_and_authority_boundary.exact_integration_diff,'NO_EXACT_INTEGRATION_DIFF_AVAILABLE');
 assert.ok(validateDisclosure(d));
});
test('OPERATOR 02 all extension fields survive the complete disclosure',()=>{
 const p=mk();p.top_level_unknown_attribute='inherited experiment speculation';
 const d=disclose(p),md=renderOperatorDisclosure(d);
 assert.equal(d.complete_input_packet.top_level_unknown_attribute,'inherited experiment speculation');
 assert.match(md,/odd_machine_extension/);
 assert.match(md,/inherited experiment speculation/);
 assert.match(md,/COMPLETE/i);
});
test('OPERATOR 03 Light / Medium / Heavy share one identical bound data source',()=>{
 const md=renderOperatorDisclosure(disclose(mk()));
 assert.match(md,/LIGHT · Decision briefing/);
 assert.match(md,/MEDIUM · All candidate consequences/);
 assert.match(md,/HEAVY · Forensic record/);
 assert.match(md,/Complete source packet/);
 assert.match(md,/Complete independent receiver review/);
 assert.match(md,/Human scientific closure|human closure/i);
});
test('OPERATOR 04 reject packet mutated after receiver review',()=>{
 const p=mk(),r=reviewPacket(p);p.proposals[0].hypothesis='A later, unreviewed claim that deliberately changes the packet fingerprint';
 assert.throws(()=>buildOperatorDisclosure(p,r),{code:'DISCLOSURE_PACKET_DIGEST_MISMATCH'});
});
test('OPERATOR 05 reject receipt for a different packet ID',()=>{
 const p=mk(),r=reviewPacket(p);r.packet_id='DIFFERENT';
 assert.throws(()=>buildOperatorDisclosure(p,r),{code:'DISCLOSURE_PACKET_REVIEW_MISMATCH'});
});
test('OPERATOR 06 refuse truncating 64 source-free amendment entries',()=>{
 const p=mk();
 p.proposals=Array.from({length:64},(_,i)=>({...p.proposals[0],id:'AP'+String(i+1).padStart(2,'0'),experiment:undefined}));
 const d=disclose(p),md=renderOperatorDisclosure(d);
 assert.equal(d.proposal_count,64);
 assert.equal(d.known_consequences.length,64);
 assert.equal(d.complete_receiver_review.as_source_free.proposals.length,64);
 for(const id of d.proposal_ids)assert.ok(md.includes(' '+id+' — '),id);
});
test('OPERATOR 07 duplicate proposal IDs invalidate completeness',()=>{
 const p=mk();p.proposals=[p.proposals[0],{...p.proposals[0]}];
 // The legacy receiver tolerates ID duplication; the disclosure cannot treat
 // duplicate branch IDs as independent proposals without an explicit refusal.
 const d=disclose(p);
 assert.deepEqual(d.proposal_ids,['AP01','AP01']);
 assert.ok(!d.completeness.all_packet_proposals_unique);
});
test('OPERATOR 08 a missing source or control still appears in the dossier',()=>{
 const p=mk();p.proposals[0].controls.falsifier='';
 p.proposals[0].evidence.source_refs=[];
 const d=disclose(p);
 assert.equal(d.receiver_disposition,'HELD_REVIEW_GAPS');
 assert.equal(d.review_issues.length,1);
 const md=renderOperatorDisclosure(d);
 assert.match(md,/FALSIFIER_UNSPECIFIED/);
 assert.match(md,/SOURCE_NOT_REGISTERED/);
});
test('OPERATOR 09 staged decision must bind packet and dossier',()=>{
 const d=disclose(mk());
 const a={schema:'td613.rulefield.operator-decision/v1',decision:'REQUEST_STAGED_SYNTHESIS',packet_id:d.packet_id,
  packet_sha256:d.packet_sha256,disclosure_sha256:d.disclosure_sha256,
  baseline_registry_sha256:d.baseline_registry_sha256,selected_proposal_ids:['AP01'],scope:'STAGED_CANDIDATE_ONLY',
  human_statement:'I am requesting an unmerged source-free stage only and will inspect the exact future patch.',
  accepts_unknown_future_patch:false};
 const r=inspectHumanDecision(a,d);
 assert.equal(r.status,'READY_FOR_INDEPENDENT_HUMAN_CONFIRMATION');
 assert.equal(r.action_executed,false);
 assert.equal(r.witnessed_human_identity,false);
 assert.equal(r.merge_authority,false);
});
test('OPERATOR 10 a copied signature or forged-looking statement proves no human identity',()=>{
 const d=disclose(mk()),a={schema:'td613.rulefield.operator-decision/v1',decision:'REQUEST_STAGED_SYNTHESIS',
 packet_id:d.packet_id,packet_sha256:d.packet_sha256,disclosure_sha256:d.disclosure_sha256,
 baseline_registry_sha256:d.baseline_registry_sha256,selected_proposal_ids:['AP01'],
 scope:'STAGED_CANDIDATE_ONLY',human_statement:'I definitely authorize staged synthesis without canonical changes.',
 accepts_unknown_future_patch:false,human_authority_attestation:'fake signature'};
 assert.equal(inspectHumanDecision(a,d).witnessed_human_identity,false);
});
test('OPERATOR 11 stale or wrong dossier hash fails closed',()=>{
 const d=disclose(mk()),a={schema:'td613.rulefield.operator-decision/v1',decision:'DEFER',
 packet_id:d.packet_id,packet_sha256:d.packet_sha256,disclosure_sha256:'0'.repeat(64),
 baseline_registry_sha256:d.baseline_registry_sha256,selected_proposal_ids:[],scope:'STAGED_CANDIDATE_ONLY',
 human_statement:'I defer at this time',accepts_unknown_future_patch:false};
 assert.equal(inspectHumanDecision(a,d).status,'HELD');
 assert.ok(inspectHumanDecision(a,d).issues.includes('DOSSIER_BINDING_MISMATCH'));
});
test('OPERATOR 12 unknown selected proposal IDs fail',()=>{
 const d=disclose(mk()),a={schema:'td613.rulefield.operator-decision/v1',decision:'REQUEST_STAGED_SYNTHESIS',
 packet_id:d.packet_id,packet_sha256:d.packet_sha256,disclosure_sha256:d.disclosure_sha256,
 baseline_registry_sha256:d.baseline_registry_sha256,selected_proposal_ids:['GHOST'],scope:'STAGED_CANDIDATE_ONLY',
 human_statement:'I request staging a proposed candidate, with no canonical adoption.',
 accepts_unknown_future_patch:false};
 assert.ok(inspectHumanDecision(a,d).issues.includes('SELECTED_PROPOSAL_IDS_INVALID'));
});
test('OPERATOR 13 prospective report rejects any apparent retroactive authority',()=>{
 const d=disclose(mk());assert.equal(d.effect_and_authority_boundary.release_or_experiment_b_authority,false);
 assert.equal(d.executive_summary.protected_experiment_b,'HELD');
 assert.equal(d.effect_and_authority_boundary.staged_synthesis_requires_contemporaneous_human_decision,true);
});
test('OPERATOR 14 human-only form is actually separate from generated report',()=>{
 const path=new URL('../packages/rulefield/operator/templates/HUMAN_RESEARCH_SUBMISSION_FORM.md',import.meta.url);
 const s=readFileSync(path,'utf8');assert.match(s,/HUMAN-AUTHORED ONLY/);assert.match(s,/agent must/i);
});
test('OPERATOR 15 all protected source bytes preserved through a pure review',()=>{
 assert.deepEqual(readFileSync(new URL('../packages/rulefield/data/rulefield.v1.json',import.meta.url)),before);
});
test('OPERATOR 16 a dossier alteration invalidates its own content fingerprint',()=>{
 const d=disclose(mk());d.known_consequences[0].falsifier='modified';assert.equal(validateDisclosure(d),false);
});
test('OPERATOR 17 the operator manual and activation exist as complete documents',()=>{
 for(const path of ['ACTIVATION_PROMPT.md','OPERATOR_GUIDE.md','DISCLOSURE_PROTOCOL.md','INTAKE_AND_SYNC.md']){
  const s=readFileSync(new URL('../packages/rulefield/operator/'+path,import.meta.url),'utf8');
  assert.ok(s.length>1000,path);
 }
});