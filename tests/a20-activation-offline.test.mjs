import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  ASSAY_A20_RUN_ID, ASSAY_A20_PROGRAM, ASSAY_A19_PROGRAM,
  ASSAY_ACTIVATION_RUN_IDS, ASSAY_RECOVERY_POLICY_SCHEMA,
  buildAssayProviderWire, validateAssayPolicy, requireTrialFamily, sha256
} from '../server/loom-assay-contract.js';

const root=resolve(import.meta.dirname,'..');
const manifest=JSON.parse(readFileSync(resolve(root,'research/portable-loom-a20-activation-20261010/TRIAL_MANIFEST_A20.json'),'utf8'));
const artifact=readFileSync(resolve(root,manifest.artifact_path),'utf8');
const commit='a'.repeat(40);
const binding={
 provider:'GEMINI_GENERATE_CONTENT',protocol_commit:commit,trial_family:'FIRST_CONFIGURED_RECEIVER',
 credential_env:'GEMINI_API_KEY',model:'gemini-3.8-flash',response_model_ids:['gemini-3.8-flash'],
 tools:'DISABLED',retrieval:'DISABLED',retries:0,
 limits:{max_calls:4,max_cost_usd:1,max_input_tokens_per_call:200000,max_output_tokens_per_call:8192,max_response_bytes:2000000,timeout_ms:240000},
 generation_parameters:{temperature:null,top_p:null,thinking_level:'medium'},
 pricing:{input_usd_per_million:.75,output_usd_per_million:3.75,source:'historical_approved_pricing',verified_at:'2026-10-10T00:00:00Z'},
 authorization:{record:'A20_EXECUTION_REQUIRES_SEPARATE_GESTURE',scope:'A20_DRAFT_TEST_ONLY'}
};
const p={schema:ASSAY_RECOVERY_POLICY_SCHEMA,run_id:ASSAY_A20_RUN_ID,protocol_commit:commit,artifact_sha256:manifest.artifact_sha256,expires_at:'2026-12-01T00:00:00Z',binding,receiver_output_tokens:8192,program:ASSAY_A20_PROGRAM};

test('A20 is an explicit future route; legacy 88/$10 frozen program survives',()=>{
 assert.equal(ASSAY_ACTIVATION_RUN_IDS.at(-1),ASSAY_A20_RUN_ID);
 assert.equal(ASSAY_A19_PROGRAM.max_calls,88);assert.equal(ASSAY_A19_PROGRAM.max_cost_usd,10);
 assert.equal(ASSAY_A20_PROGRAM.max_calls,88);assert.equal(ASSAY_A20_PROGRAM.max_cost_usd,11);
 assert.deepEqual(ASSAY_A20_PROGRAM.run_ids.slice(0,-1),ASSAY_A19_PROGRAM.run_ids);
 validateAssayPolicy(p);
 assert.throws(()=>validateAssayPolicy({...p,binding:{...binding,limits:{...binding.limits,max_cost_usd:1.01}}}),/ASSAY_A20_SCOPE_UNBOUND/);
 assert.throws(()=>validateAssayPolicy({...p,program:{...ASSAY_A20_PROGRAM,max_cost_usd:12}}),/ASSAY_RECOVERY_PROGRAM_UNBOUND/);
});
test('Only exact R06-1 / R02-1 turns 0 and 1, no R09 or third turn',()=>{
 for(const case_id of ['R06','R02'])for(const turn_index of [0,1])assert.doesNotThrow(()=>requireTrialFamily(p,{case_id,trial_id:`FIRST_CONFIGURED_RECEIVER-${case_id}-1`,role:'RECEIVER',turn_index}));
 for(const t of [{case_id:'R09',trial_id:'FIRST_CONFIGURED_RECEIVER-R09-1',role:'RECEIVER',turn_index:0},{case_id:'R02',trial_id:'FIRST_CONFIGURED_RECEIVER-R02-1',role:'RECEIVER',turn_index:2},{case_id:'R06',trial_id:'FIRST_CONFIGURED_RECEIVER-R06-2',role:'RECEIVER',turn_index:1}])assert.throws(()=>requireTrialFamily(p,t),/ASSAY_A20_TRIAL_UNBOUND/);
});
test('Reviewed artifact and exact historical suffix bind the first-user prompt',()=>{
 assert.equal(sha256(artifact), 'fcb4d3d82f4919d23c13d729144ffb21860e07b292d0f384dd9e63cecda92021');
 const expected={R02:'7302afa1b99699517e132157fd99453f1db9e2112082262fada10e7a2316d7e2',R06:'84aaa820bc379234d8ba45ebc9cf1015131e749b9833cb5750a05ef69c0ab0f4'};
 for(const c of manifest.receivers){assert.equal(sha256(artifact+c.first_user_suffix),expected[c.case_id]); assert.equal(c.first_user_message_sha256,expected[c.case_id]);}
});
test('A20 call builder yields bounded provider wire without contacting provider',()=>{
 for(const c of manifest.receivers){const trial={case_id:c.case_id,trial_id:`FIRST_CONFIGURED_RECEIVER-${c.case_id}-1`,role:'RECEIVER',turn_index:0}; const req={schema:'td613.loom.server-assay-request/v0.1',run_id:p.run_id,protocol_commit:commit,artifact_sha256:manifest.artifact_sha256,trial,messages:[{role:'user',content:artifact+c.first_user_suffix}]};const wire=buildAssayProviderWire(req,p,manifest,artifact);assert.equal(wire.output_limit,8192);assert.ok(wire.reserved_cost_nanos<=250000000);assert.equal(wire.prior_assistant_sha256.length,0);assert.deepEqual(JSON.parse(wire.body).contents[0].parts[0].text,artifact+c.first_user_suffix);}
});

test('Vercel function bundle contains manifest-selected A20 candidate and exact file paths',()=>{
 const cfg=JSON.parse(readFileSync(resolve(root,'vercel.json'),'utf8'));
 const listed=cfg.functions['api/khonapolit.js'].includeFiles.slice(1,-1).split(',');
 assert.ok(cfg.functions['api/khonapolit.js'].includeFiles.length<=256,'Vercel includeFiles must stay within schema limit');
 const a20Prefix='research/portable-loom-a20-activation-20261010/';
 assert.deepEqual(listed.slice(0,3),['server/loom-assay-run-config.json','research/portable-loom-server-transport-20261009/TRIAL_MANIFEST.json','research/portable-loom-receiver-repair-20261010/candidate-artifact/portable-loom-standard.md']);
 assert.equal(listed[3],a20Prefix+'**','A20 must be carried inside its own bounded subtree');
 assert.equal(listed.length,4,'No unrelated carriage globs');
 assert.ok(('research/portable-loom-a20-activation-20261010/TRIAL_MANIFEST_A20.json').startsWith(a20Prefix));
 assert.ok(manifest.artifact_path.startsWith(a20Prefix));
 for(const file of [...listed.slice(0,3),a20Prefix+'TRIAL_MANIFEST_A20.json',manifest.artifact_path]) assert.doesNotThrow(()=>readFileSync(resolve(root,file)), 'missing Vercel-carried file: '+file);
 assert.equal(sha256(readFileSync(resolve(root,manifest.artifact_path))),manifest.artifact_sha256);
});
