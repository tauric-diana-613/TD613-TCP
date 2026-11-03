import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {checkSyntheticAdvancingWitness,checkPreimportManifest,checkSyntheticUsage,rejectUnexpectedNativeActivities,flightGate} from '../scripts/experiment-b-preflight/pe07-sourcefree-runtime-guards-v01.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
test('PE07: independent simulated current-head witness rejects whole-store rollback',()=>{
 const witness={type:'SIMULATED_EXTERNAL_SEPARATE_CUSTODIAN',ordinal:3,head:hash('head3')};
 const current={evidence_class:'SYNTHETIC_LOCAL_ONLY',ordinal:3,head:witness.head};
 const proposal={evidence_class:'SYNTHETIC_LOCAL_ONLY',ordinal:4,previous_head:witness.head,payload_sha256:hash('p4')};
 const good=checkSyntheticAdvancingWitness({retainedWitness:witness,current,proposal});
 assert.equal(good.ordinal,4);assert.equal(good.external_current_head_authority,'UNATTESTED_SIMULATION_ONLY');
 assert.throws(()=>checkSyntheticAdvancingWitness({retainedWitness:witness,current:{...current,ordinal:1,head:hash('old')},proposal}),/PE07_WHOLE_STORE_ROLLBACK_OR_FORK_HELD/);
 assert.throws(()=>checkSyntheticAdvancingWitness({retainedWitness:witness,current,proposal:{...proposal,ordinal:5}}),/PE07_NON_MONOTONIC_OR_FORK_PROPOSAL/);
});
test('PE07: preimport byte drift and path substitution rejected',()=>{
 const b=Buffer.from('fixture');const files=[{path:'synthetic/module.mjs',bytes:b}],expected=[{path:'synthetic/module.mjs',sha256:hash(b)}];
 assert.equal(checkPreimportManifest({files,expected}).authenticated_original_publisher,false);
 assert.throws(()=>checkPreimportManifest({files:[{...files[0],bytes:Buffer.from('changed')}],expected}),/PE07_PREIMPORT_CODE_DRIFT/);
 assert.throws(()=>checkPreimportManifest({files,expected:[{...expected[0],path:'../malicious'}]}),/PE07_UNTRUSTED_MANIFEST_PATH/);
});
test('PE07: finite resource/accounting and forbidden activity refusal',()=>{
 const good=checkSyntheticUsage({reservation:10,reported:7,maximum:100});
 assert.equal(good.remaining,93);assert.equal(good.financial_authority,false);
 assert.throws(()=>checkSyntheticUsage({reservation:101,reported:7,maximum:100}),/PE07_BUDGET_RESERVATION_OVER_CAP/);
 assert.throws(()=>checkSyntheticUsage({reservation:10,reported:11,maximum:100}),/PE07_UNACCOUNTED_USAGE_HOLD/);
 assert.equal(rejectUnexpectedNativeActivities([{type:'agent_message'}]).physical_process_isolation,'NOT_MEASURED');
 assert.throws(()=>rejectUnexpectedNativeActivities([{type:'provider_request'}]),/PE07_UNAUTHORIZED_EXTERNAL_ACTIVITY_HELD/);
 assert.equal(flightGate.d20,'HELD_NO_SIGNED_EXTERNAL_GRANT');
});
