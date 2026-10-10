import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import {
  ASSAY_A20_RUN_ID, ASSAY_A20_PROGRAM, ASSAY_A19_PROGRAM,
  ASSAY_RECOVERY_POLICY_SCHEMA, ASSAY_ACTIVATION_RUN_IDS,
  validateAssayPolicy, requireTrialFamily, buildAssayProviderWire
} from '../server/loom-assay-contract.js';
const sha256 = s => createHash('sha256').update(s).digest('hex');
const dir = new URL('../research/portable-loom-a20-activation-20261010/', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('TRIAL_MANIFEST_A20.json', dir), 'utf8'));
const artifact = readFileSync(new URL('candidate-reviewed/portable-loom-conformance-candidate.md', dir), 'utf8');
const caseMap = new Map(manifest.receivers.map(x => [x.case_id, x]));
function policy() {
  return {
    schema: ASSAY_RECOVERY_POLICY_SCHEMA,
    run_id: ASSAY_A20_RUN_ID,
    protocol_commit: 'a'.repeat(40),
    artifact_sha256: manifest.artifact_sha256,
    expires_at: '2027-12-31T23:59:59Z',
    receiver_output_tokens: 8192,
    program: ASSAY_A20_PROGRAM,
    binding: {
      provider: 'GEMINI_GENERATE_CONTENT',
      protocol_commit: 'a'.repeat(40),
      trial_family: 'FIRST_CONFIGURED_RECEIVER', credential_env: 'GEMINI_API_KEY',
      model: 'gemini-3.8-flash', tools: 'DISABLED', retrieval: 'DISABLED', retries: 0,
      response_model_ids: ['gemini-3.8-flash'],
      generation_parameters: {temperature: null,top_p: null,thinking_level:'medium'},
      pricing: {input_usd_per_million: 0.75,output_usd_per_million:3.75, source: 'FROZEN_RESEARCH_PRICING',verified_at:'2026-10-10T00:00:00Z'},
      limits:{max_calls:4,max_cost_usd:1,max_input_tokens_per_call:200000,max_output_tokens_per_call:8192,timeout_ms:240000,max_response_bytes:2000000},
      authorization:{record:'A20_DRAFT_REVIEW_ONLY',scope:'MECHANICAL_SOURCE_VALIDATION_NO_PROVIDER_CALLS'}
    }
  };
}
function req(p,caseId,turnIndex,predecessor='SYNTHETIC_NOT_PROVIDER_OUTPUT') {
  const c=caseMap.get(caseId);const m=[{role:'user',content:artifact+c.first_user_suffix}];
  if(turnIndex){m.push({role:'assistant',content:predecessor},{role:'user',content:c.later_user_messages[0]});}
  return {schema:'td613.loom.server-assay-request/v0.1',run_id:p.run_id,protocol_commit:p.protocol_commit,artifact_sha256:p.artifact_sha256,trial:{trial_id:`FIRST_CONFIGURED_RECEIVER-${caseId}-1`,case_id:caseId,role:'RECEIVER',turn_index:turnIndex},messages:m};
}
test('Vercel A20 bundle includes the manifest-selected reviewed candidate, and no stale path',()=>{
  const config=JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url),'utf8'));
  const included=config.functions['api/khonapolit.js'].includeFiles;
  const listed=included.slice(1,-1).split(',');
  const manifestPath='research/portable-loom-a20-activation-20261010/TRIAL_MANIFEST_A20.json';
  const a20Prefix='research/portable-loom-a20-activation-20261010/';
  assert(included.length<=256,'Vercel includeFiles must remain under platform schema bound');
  assert.deepEqual(listed.slice(0,3),['server/loom-assay-run-config.json','research/portable-loom-server-transport-20261009/TRIAL_MANIFEST.json','research/portable-loom-receiver-repair-20261010/candidate-artifact/portable-loom-standard.md']);
  assert.equal(listed[3],a20Prefix+'**','A20 candidate must be carried by bounded research-directory glob');
  assert.equal(listed.length,4,'Do not widen file carriage beyond the reviewed scope');
  assert(manifestPath.startsWith(a20Prefix));
  assert(manifest.artifact_path.startsWith(a20Prefix));
  for(const p of [...listed.slice(0,3),manifestPath,manifest.artifact_path])assert.doesNotThrow(()=>readFileSync(new URL('../'+p,import.meta.url)),'missing Vercel-carried file: '+p);
  assert.equal(sha256(readFileSync(new URL('../'+manifest.artifact_path,import.meta.url))),manifest.artifact_sha256);
});

test('reviewed candidate and exact R02/R06 suffix-hashes match A20 manifest',()=>{
  assert.equal(sha256(artifact),'fcb4d3d82f4919d23c13d729144ffb21860e07b292d0f384dd9e63cecda92021');
  assert.equal(sha256(artifact),manifest.artifact_sha256);
  assert.deepEqual([...caseMap.keys()],['R02','R06']);
  assert.equal(manifest.comparison.length,0);
  for(const c of manifest.receivers)assert.equal(sha256(artifact+c.first_user_suffix),c.first_user_message_sha256);
});
test('A20 enables one run and preserves A19 original 88/$10 program',()=>{
  assert(ASSAY_ACTIVATION_RUN_IDS.includes(ASSAY_A20_RUN_ID));
  assert.equal(ASSAY_A19_PROGRAM.max_cost_usd,10);
  assert.equal(ASSAY_A19_PROGRAM.max_calls,88);
  assert(!ASSAY_A19_PROGRAM.run_ids.includes(ASSAY_A20_RUN_ID));
  assert.deepEqual(ASSAY_A20_PROGRAM,{id:ASSAY_A19_PROGRAM.id,run_ids:[...ASSAY_A19_PROGRAM.run_ids,ASSAY_A20_RUN_ID],max_calls:88,max_cost_usd:11});
});
test('A20 policy explicitly bounds the model, 4 calls, $1, and unchanged 8192 limit',()=>{
  const p=policy(); assert.equal(validateAssayPolicy(p),p);
  for (const [field,v] of [['max_calls',5],['max_cost_usd',1.01],['max_output_tokens_per_call',4096]]){
    const copy=structuredClone(p);copy.binding.limits[field]=v;
    assert.throws(()=>validateAssayPolicy(copy),/ASSAY_A20_SCOPE_UNBOUND|ASSAY_RECOVERY_MEASUREMENT_CHANGED/);
  }
  const wrong=structuredClone(p); wrong.program={...wrong.program,max_cost_usd:10};assert.throws(()=>validateAssayPolicy(wrong),/ASSAY_RECOVERY_PROGRAM_UNBOUND/);
});
test('four exact R06 then R02 calls build deterministic provider wire with no paid request',()=>{
  const p=policy();
  let total=0;
  for(const id of ['R06','R02'])for(const turn of [0,1]){
    const wire=buildAssayProviderWire(req(p,id,turn),p,manifest,artifact);
    assert(wire.reserved_cost_nanos<=250000000);
    assert.equal(wire.prior_assistant_sha256.length,turn);
    const body=JSON.parse(wire.body);
    assert.equal(body.generationConfig.maxOutputTokens,8192);
    assert.deepEqual(body.generationConfig.thinkingConfig,{thinkingLevel:'medium'});
    assert(!Object.hasOwn(body.generationConfig,'temperature'));
    assert(!Object.hasOwn(body.generationConfig,'topP'));
    assert(!Object.hasOwn(body,'tools'));
    total+=wire.reserved_cost_nanos;
  }
  assert(total<=1000000000);
});
test('R09 and unsupported R02/R06 turn 2 fail before reservation',()=>{
  const p=policy();
  for(const t of [{trial_id:'FIRST_CONFIGURED_RECEIVER-R09-1',case_id:'R09',role:'RECEIVER',turn_index:0},{trial_id:'FIRST_CONFIGURED_RECEIVER-R06-1',case_id:'R06',role:'RECEIVER',turn_index:2}]) assert.throws(()=>requireTrialFamily(p,t),/ASSAY_A20_TRIAL_UNBOUND/);
});
test('tampered first message and later user suffix are rejected',()=>{
  const p=policy();
  const a=req(p,'R02',0);a.messages[0].content+='\n'; assert.throws(()=>buildAssayProviderWire(a,p,manifest,artifact),/ASSAY_USER_INPUT_CHANGED/);
  const b=req(p,'R06',1);b.messages[2].content+=' modified'; assert.throws(()=>buildAssayProviderWire(b,p,manifest,artifact),/ASSAY_USER_INPUT_CHANGED/);
});
test('A20 per-call cap rejects oversized conservative reservation even if run budget fits',()=>{
  const p=policy();assert.equal(validateAssayPolicy(p),p);
  const a=req(p,'R02',0);a.messages[0].content += 'X'.repeat(150000);
  assert.throws(()=>buildAssayProviderWire(a,p,manifest,artifact),/ASSAY_USER_INPUT_CHANGED/);
});
