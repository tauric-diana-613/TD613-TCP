import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 PACKET_SCHEMA,packetTemplate,inspectPacket,reviewPacket,registryDigest,
 runDeclaredFiniteExperiment,receiverCapabilities,intakeOne
} from '../packages/rulefield/amendments/receiver.mjs';
const sourceFile=new URL('../packages/rulefield/data/rulefield.v1.json',import.meta.url);
const config=()=>packetTemplate({packet_id:'RF-AP-20261107-CONTROL'});
const sample=()=>{
 const p=config();
 p.proposals[0].experiment={engine:'FINITE_STRING_MULTIWAY',initial:'AA',
  rules:[{id:'R',from:'A',to:'B'}],depth:2,maxPaths:100,maxLength:8};
 return p;
};
test('RECEIVER 01 valid packet is staged not applied',()=>{
 const p=sample(),r=inspectPacket(p);
 assert.equal(p.schema,PACKET_SCHEMA);assert.equal(r.status,'STAGED_FOR_REVIEW');
 assert.equal(r.proposal_count,1);assert.equal(r.release_authority,false);
 assert.equal(r.proposals[0].scientific_state,'STAGED_RESEARCH_PROPOSAL_ONLY');
});
test('RECEIVER 02 finite multiway experiment retains history identity',()=>{
 const r=reviewPacket(sample()).as_source_free.proposals[0].declared_finite_experiment;
 assert.equal(r.scope,'EXECUTED_LOCAL_FINITE_SOURCE_FREE_MODEL');
 assert.equal(r.endpoint.path_count,2);
 assert.equal(r.endpoint.unique_states,1);
 assert.equal(r.endpoint.conditional_history_entropy_bits,1);
 assert.equal(r.event_count,4);
 assert.equal(r.branch_pair_count,1);
 assert.equal(r.overlapping_branch_pair_count,0);
});
test('RECEIVER 03 critical pair comparator distinguishes terminal nonjoinability',()=>{
 const r=runDeclaredFiniteExperiment({engine:'FINITE_CRITICAL_PAIRS',initial:'AB',
  rules:[{id:'R1',from:'AB',to:'BA'},{id:'R2',from:'AB',to:'AA'}],depth:1,horizon:3});
 assert.equal(r.critical_pair_count,1);
 assert.equal(r.pairs[0].resolution.disposition,'PROVEN_NONJOINABLE_TERMINAL_PAIR');
 assert.equal(r.global_confluence_proven,false);
});
test('RECEIVER 04 elementary CA engine emits exact finite rule 90 step',()=>{
 const r=runDeclaredFiniteExperiment({engine:'ELEMENTARY_CA',rule:90,width:7,steps:1,boundary:'zero'});
 assert.deepEqual(r.rows,['0001000','0010100']);
 assert.equal(r.proof_of_chaos,false);
});
test('RECEIVER 05 out-of-scope engine rejects arbitrary instructions',()=>{
 assert.throws(()=>runDeclaredFiniteExperiment({engine:'EVAL_UNTRUSTED_JS',code:'process.exit()'}),{code:'EXPERIMENT_ENGINE_NOT_IMPLEMENTED'});
});
test('RECEIVER 06 excessive experiment bounds rejected before execution',()=>{
 assert.throws(()=>runDeclaredFiniteExperiment({engine:'FINITE_STRING_MULTIWAY',initial:'AA',
 rules:[{id:'R',from:'A',to:'B'}],depth:200}),{code:'INVALID_EXPERIMENT_BOUND_DEPTH'});
});
test('RECEIVER 07 stale source registry baseline fails closed',()=>{
 const p=sample();p.baseline.registry_sha256='0'.repeat(64);
 assert.throws(()=>reviewPacket(p),{code:'STALE_REGISTRY_BASELINE'});
});
test('RECEIVER 08 consent cannot be upgraded by a packet',()=>{
 const p=sample();p.operator_authority.auto_merge=true;
 assert.throws(()=>reviewPacket(p),{code:'AUTHORITY_ESCAPE_ATTEMPT'});
});
test('RECEIVER 09 unresolved anchors produce HELD without fake mapping',()=>{
 const p=sample();p.proposals[0].anchors.rules=['GHOST_RULE'];
 const r=inspectPacket(p);
 assert.equal(r.status,'HELD_REVIEW_GAPS');
 assert.deepEqual(r.issues[0].items,[{kind:'RULE',token:'GHOST_RULE'}]);
});
test('RECEIVER 10 omitted falsifier and source evidence remain visibly deficient',()=>{
 const p=sample();p.proposals[0].controls.falsifier='';
 p.proposals[0].evidence.source_refs=[];
 const r=inspectPacket(p);
 assert.equal(r.status,'HELD_REVIEW_GAPS');
 assert.ok(r.issues[0].items.includes('FALSIFIER_UNSPECIFIED'));
 assert.ok(r.issues[0].items.includes('SOURCE_NOT_REGISTERED'));
});
test('RECEIVER 11 repeated pure review is byte-identical and does not mutate registry',()=>{
 const before=readFileSync(sourceFile);
 const a=JSON.stringify(reviewPacket(sample()));
 const b=JSON.stringify(reviewPacket(sample()));
 assert.equal(a,b);assert.deepEqual(before,readFileSync(sourceFile));
});
test('RECEIVER 12 current registry digest is exact and present',()=>{
 const p=sample();assert.equal(p.baseline.registry_sha256,registryDigest());
 assert.match(registryDigest(),/^[a-f0-9]{64}$/);
});
test('RECEIVER 13 unsafe path is rejected before filesystem access',()=>{
 assert.throws(()=>intakeOne('../secret.json'),{code:'UNSAFE_PACKET_FILENAME'});
});
test('RECEIVER 14 no automatic protected work is advertised',()=>{
 assert.ok(receiverCapabilities.forbidden_actions.includes('AUTO_APPLY_TO_REGISTRY'));
 assert.ok(receiverCapabilities.forbidden_actions.includes('UNBLIND_PROTECTED_FLIGHT'));
 assert.deepEqual(receiverCapabilities.automatic_actions,['SCAN_INBOX','WRITE_OUTBOX_RECEIPT']);
});
