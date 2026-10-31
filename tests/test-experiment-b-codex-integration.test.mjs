import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {codexArgs,parseCodexEvents,runSourceFreeCodexTurn,SYNTHETIC,codexCliReadiness} from '../scripts/experiment-b-codex-exec-adapter.mjs';
import {planFlight,prepareBlindPackets,ARMS} from '../scripts/experiment-b-codex-flight-controls.mjs';
import {skillRefreshPacket} from '../scripts/export-dollhouse-work-skill-packets.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function fakeCodex(exe,args,opts){
 assert.equal(exe,'codex');assert.ok(args.includes('--ephemeral'));assert.ok(args.includes('--json'));
 assert.ok(args.includes('read-only'));assert.ok(opts.input.includes('SYNTHETIC DOCUMENT'));
 return {status:0,stdout:[
  JSON.stringify({type:'thread.started',thread_id:'FAKE-THREAD-1'}),
  JSON.stringify({type:'item.completed',item:{type:'agent_message',text:'Test fixture contains synthetic decay.'}}),
  JSON.stringify({type:'turn.completed',usage:{input_tokens:5,output_tokens:8}})
 ].join('\n')};
}
test('B-CODEX-01 command flags and mandatory model pin',()=>{
 const a=codexArgs({model:'gpt-6',workspace:path.resolve('/tmp/demo')});
 assert.ok(a.includes('read-only'));assert.ok(a.includes('--ignore-user-config'));assert.equal(a.at(-1),'-');
 assert.throws(()=>codexArgs({workspace:'/tmp',model:''}),/MODEL_PIN_REQUIRED/);
});
test('B-CODEX-02 JSONL cannot omit authentic-shaped thread and completion',()=>{
 assert.equal(parseCodexEvents(fakeCodex('codex',['--ephemeral','--json','read-only'],{input:'SYNTHETIC DOCUMENT'}).stdout).model_served_independently_attested,false);
 assert.throws(()=>parseCodexEvents('{"type":"turn.completed"}'),/THREAD_ID/);
 assert.throws(()=>parseCodexEvents('{"type":"thread.started","thread_id":"t"}'),/TURN_COMPLETION/);
 assert.throws(()=>parseCodexEvents('INVALID'),/JSONL_INVALID/);
});
test('B-CODEX-03 source-free only; stub credit must remain zero',()=>{
 const fixture={evidence_class:SYNTHETIC,content:'Synthetic oscillator: x(t)=0.5^t'};
 const r=runSourceFreeCodexTurn({arm:'ARM_2A_MODULAR',model:'gpt-6',fixture,prompt:'Check geometric decay',authorized:true,spawnImpl:fakeCodex});
 assert.equal(r.evidence_class,'TEST_STUB_ONLY');assert.equal(r.empirical_replication_credit,0);
 assert.equal(r.model_served_independently_attested,false);assert.equal(r.google_rest_calls,0);
 assert.throws(()=>runSourceFreeCodexTurn({arm:'ARM_2A_MODULAR',model:'gpt-6',fixture,prompt:'Test',spawnImpl:fakeCodex}),/AUTHORIZATION_REQUIRED/);
 assert.throws(()=>runSourceFreeCodexTurn({arm:'ARM_2A_MODULAR',model:'gpt-6',fixture:{...fixture,filePath:'/Em.zip'},prompt:'Test',authorized:true,spawnImpl:fakeCodex}),/PROTECTED_OR_UNCLASSIFIED/);
});
test('B-CODEX-04 schedule represents full episode and no Gemini dollar governor',()=>{
 const p=planFlight({documents:24,permutations:3,replications:1,factorialCells:1});
 assert.equal(p.arm2a_model_calls,144);assert.equal(p.arm2b_model_calls,72);
 assert.equal(p.planned_high_water_attempts,p.base_model_attempts+p.retry_capacity_reserve);
 assert.equal(Object.hasOwn(p,'max_cost_usd'),false);assert.equal(p.gate_f,'HELD');
 assert.deepEqual(ARMS,['ARM_0_TRANSPORT','ARM_1_ARCHIVAL','ARM_2A_MODULAR','ARM_2B_MATCHED_UNION']);
});
test('B-CODEX-05 deterministic explicit label leakage is blocked, semantic blindness held',()=>{
 const b=prepareBlindPackets([{arm:'ARM_2A_MODULAR',candidate_id:'C-A',text:'A possible relation is found.'},
 {arm:'ARM_2B_MATCHED_UNION',candidate_id:'C-B',text:'A competing bounded result.'}],{seed:'12345678901234567890'});
 assert.equal(b.semantic_blindness_verified,false);assert.equal(b.independent_evaluator_verified,false);
 assert.doesNotMatch(JSON.stringify(b.evaluator_only_payload),/ARM_2A|ARM_2B/);
 assert.throws(()=>prepareBlindPackets([{arm:'ARM_2A_MODULAR',text:'Pedagogue proposes a claim'}],{seed:'12345678901234567890'}),/LEAKAGE/);
});
test('B-CODEX-06 both exact-checkout Work skill exports retain engines separately',()=>{
 const p=skillRefreshPacket({root});
 assert.match(p.exact_checkout_revision,/^[a-f0-9]{40}$/);
 assert.deepEqual(Object.keys(p.skill_packages).sort(),['dollhouse-audit','dollhouse-design']);
 assert.equal(p.protected_flight_authority,false);
 assert.ok(p.engine_manifest.every(e=>/^[a-f0-9]{64}$/.test(e.sha256)));
 assert.throws(()=>skillRefreshPacket({root,expectedCommit:'f'.repeat(40)}),/SOURCE_REVISION_DRIFT/);
});
test('B-CODEX-07 CLI availability probe never claims real model access',()=>{
 const r=codexCliReadiness(()=>({status:1,error:Error('missing')}));
 assert.equal(r.cli_found,false);assert.equal(r.account_access_verified,false);
});
