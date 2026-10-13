import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync, existsSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ASSAY_REGISTERED_SOURCE_CONTROL_PRIORITY_RUN_ID, ASSAY_REGISTERED_SOURCE_CONTROL_PROVIDER_CREDENTIAL_SHA256,
  sha256, validateAssayPolicy, requireTrialFamily, observeAssayServiceTier } from '../server/loom-assay-contract.js';
import { createLoomAssayHandler, loadApprovedRunConfiguration } from '../server/loom-assay.js';
import { loadServerManifest, prepareServerRequest, captureServerCall } from '../research/portable-loom-server-transport-20261009/server-client.mjs';

import { preparePriorityRun } from '../research/portable-loom-registered-source-control-20261011/priority-v1/prepare-priority.mjs';

const base = 'research/portable-loom-registered-source-control-20261011/priority-v1/';
const head = 'b'.repeat(40), trial = { trial_id: 'FIRST_CONFIGURED_RECEIVER-R01-1', case_id:'R01', role:'RECEIVER', turn_index:0 };
function policy() {
  const p = JSON.parse(readFileSync(base + 'POLICY.template.json'));
  p.protocol_commit = p.binding.protocol_commit = head;
  p.expires_at = '2026-12-31T23:59:59Z';
  return validateAssayPolicy(p);
}
const payload = tier => ({ modelVersion:'gemini-3.8-flash', usageMetadata:{promptTokenCount:100,totalTokenCount:110,
  ...(tier === undefined ? {} : {serviceTier:tier})}, candidates:[{finishReason:'STOP',content:{parts:[{text:'Synthetic local result.'}]}}] });

async function fixture({headerTier, bodyTier, httpStatus=200, missingExpectation=false} = {}) {
  const p=policy(), {request,provider_wire}=prepareServerRequest(p,trial), operations=[], sent=[];
  const token='A'.repeat(40), handler=createLoomAssayHandler({environment:{GEMINI_API_KEY:'synthetic-key',
    TD613_LOOM_ASSAY_ACCESS_SHA256:sha256(token),VERCEL_GIT_COMMIT_SHA:head},
    budget:async(op,input)=>{operations.push(op);
      if(op==='inspect')return {policy:p};
      if(op==='reserve')return {durable_reservation:true,request_sha256:input.request_sha256,
        call_key:'FIRST_CONFIGURED_RECEIVER-R01-1:RECEIVER:0',reserved_cost_nanos:String(provider_wire.reserved_cost_nanos)};
      return {retained:true,call_key:input.call_key,status:input.status};},
    fetchImpl:async(url,options)=>{sent.push({url,options});
      return new Response(JSON.stringify(httpStatus===200?payload(bodyTier):{error:{code:httpStatus,status:'UNAVAILABLE',message:'Synthetic capacity rejection.'}}),
        {status:httpStatus,headers:headerTier===undefined?{}:{'x-gemini-service-tier':headerTier}});}});
  const res={setHeader(){},end(text){this.body=JSON.parse(text);}};
  await handler({method:'POST',headers:{authorization:`Bearer ${token}`,'x-vercel-oidc-token':'synthetic-oidc',
    ...(missingExpectation?{}:{'x-td613-expected-credential-sha256':ASSAY_REGISTERED_SOURCE_CONTROL_PROVIDER_CREDENTIAL_SHA256})},body:request},res);
  return {res,operations,sent};
}

test('r06 requests only Priority on the frozen route, with unchanged prompt and decoding',()=>{
  const p=policy(), old=structuredClone(p);old.run_id='portable-loom-registered-source-control-20261011-r05';
  delete old.binding.service_tier;old.binding.limits.max_cost_usd=.3;
  old.binding.pricing.input_usd_per_million=.75;old.binding.pricing.output_usd_per_million=3.75;
  const next=prepareServerRequest(p,trial), previous=prepareServerRequest(old,trial);
  assert.deepEqual(next.request.messages,previous.request.messages);
  const body=JSON.parse(next.provider_wire.body);assert.equal(body.serviceTier,'priority');delete body.serviceTier;
  assert.deepEqual(body,JSON.parse(previous.provider_wire.body));
  assert.equal(next.provider_wire.url,previous.provider_wire.url);
  assert.equal(previous.provider_wire.request_sha256,'47dcecf8c2ecf1b56a671dcae04f4d01d3976aa2431e946ff2b3cc6edb44a3c6');
  assert.equal(next.provider_wire.reserved_cost_nanos,491184000);
  assert.ok(loadApprovedRunConfiguration().run_ids.includes(ASSAY_REGISTERED_SOURCE_CONTROL_PRIORITY_RUN_ID));
  assert.equal(loadServerManifest(process.cwd(),p.run_id).manifest.artifact_sha256,p.artifact_sha256);
  for(let i=6;i<=10;i++){const q=structuredClone(p);q.run_id=`portable-loom-registered-source-control-20261011-r${String(i).padStart(2,'0')}`;
    assert.equal(prepareServerRequest(q,trial).provider_wire.body,next.provider_wire.body);
    assert.ok(loadApprovedRunConfiguration().run_ids.includes(q.run_id));}
  const invalid=structuredClone(p);invalid.run_id='portable-loom-registered-source-control-20261011-r11';
  assert.throws(()=>validateAssayPolicy(invalid),/ASSAY_SERVICE_TIER_UNBOUND/);
});

test('tier cannot silently widen historic runs, substitute pricing, add calls or change decoding',()=>{
  for(const id of ['portable-loom-registered-source-control-20261011-r03','portable-loom-registered-source-control-20261011-r04',
    'portable-loom-registered-source-control-20261011-r05','unrelated']){
    const p=policy();p.run_id=id;assert.throws(()=>validateAssayPolicy(p),/ASSAY_SERVICE_TIER_UNBOUND/);
  }
  for(const mutate of [p=>{delete p.binding.service_tier;},p=>{p.binding.service_tier='standard';},p=>{p.binding.service_tier='flex';},
    p=>{p.binding.pricing.input_usd_per_million=.75;},p=>{p.binding.pricing.output_usd_per_million=3.75;},
    p=>{p.binding.limits.max_calls=2;},p=>{p.binding.retries=1;},p=>{p.binding.limits.max_cost_usd=.51;},
    p=>{p.binding.generation_parameters.thinking_level='low';},p=>{p.binding.limits.timeout_ms=120000;},
    p=>{p.artifact_sha256='0'.repeat(64);},p=>{p.expires_at='2027-01-01T00:00:00Z';}]){
    const p=policy();mutate(p);assert.throws(()=>validateAssayPolicy(p),/ASSAY_/);
  }
  assert.throws(()=>requireTrialFamily(policy(),{...trial,trial_id:'FIRST_CONFIGURED_RECEIVER-R01-2'}),/TRIAL_UNBOUND/);
});

test('Priority server emits the exact root field and retains the returned tier',async()=>{
  const {res,operations,sent}=await fixture({headerTier:'priority',bodyTier:'priority'});
  assert.equal(res.statusCode,200);assert.deepEqual(operations,['inspect','reserve','complete']);assert.equal(sent.length,1);
  assert.equal(sent[0].url,'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent');
  assert.equal(sent[0].options.headers['x-goog-api-key'],'synthetic-key');
  assert.equal(JSON.parse(sent[0].options.body).serviceTier,'priority');
  assert.equal(res.body.service_tier.status,'CONFIRMED_REQUESTED_TIER');assert.equal(res.body.retries,0);
});

test('downgrade, missing and conflicting reports retain a complete answer and never resend',async()=>{
  for(const [headerTier,bodyTier,status] of [['standard','standard','DECLARED_STANDARD_DOWNGRADE'],
    [undefined,undefined,'UNCONFIRMED'],['priority','standard','CONFLICT'],['unknown','priority','UNCONFIRMED']]){
    const {res,sent}=await fixture({headerTier,bodyTier});assert.equal(res.statusCode,200);
    assert.equal(res.body.status,'CAPTURED_NOT_ADMITTED');assert.ok(res.body.returned.text);
    assert.equal(res.body.service_tier.status,status);assert.equal(sent.length,1);assert.equal(res.body.retries,0);
  }
});

test('Priority rejection retains complete raw error bytes, reservation and zero retries',async()=>{
  const {res,operations,sent}=await fixture({httpStatus:503,headerTier:'priority'});
  assert.equal(res.statusCode,409);assert.equal(res.body.http_status,503);assert.equal(res.body.response_complete,true);
  assert.equal(res.body.returned,null);assert.equal(res.body.reservation.reserved_cost_nanos,'491184000');
  const bytes=Buffer.from(res.body.provider_response_base64,'base64');assert.equal(sha256(bytes),res.body.provider_response_sha256);
  assert.equal(JSON.parse(bytes).error.status,'UNAVAILABLE');assert.equal(sent.length,1);assert.equal(res.body.retries,0);
  assert.deepEqual(operations,['inspect','reserve','complete']);
});

test('missing provider expectation holds r06 before ledger inspection or spending',async()=>{
  const {res,operations,sent}=await fixture({missingExpectation:true});assert.equal(res.statusCode,409);
  assert.equal(res.body.error,'ASSAY_PROVIDER_CREDENTIAL_EXPECTATION_REQUIRED');assert.deepEqual(operations,[]);assert.deepEqual(sent,[]);
});

test('tier observer suppresses unknown header strings and independently decodes body reports',()=>{
  const p=policy();const b=Buffer.from(JSON.stringify(payload('priority')));
  assert.equal(observeAssayServiceTier(b,null,p).status,'CONFIRMED_REQUESTED_TIER');
  const v=observeAssayServiceTier(b,'synthetic-private-value',p);
  assert.equal(v.response_header,'UNRECOGNIZED');assert.ok(!JSON.stringify(v).includes('synthetic-private-value'));
  assert.equal(observeAssayServiceTier(Buffer.from('incomplete'),null,p).status,'UNCONFIRMED');
});

test('r06 client rejects an unapproved private caller before creating an attempt or outbound request',async()=>{
  const root=mkdtempSync(join(tmpdir(),'priority-client-gate-'));let calls=0;
  try{const p=policy(),{request}=prepareServerRequest(p,trial);
    await assert.rejects(captureServerCall(p,request,join(root,'attempt'),{environment:{TD613_LOOM_ASSAY_TOKEN:'A'.repeat(40),
      TD613_LOOM_ASSAY_EXPECTED_CREDENTIAL_SHA256:ASSAY_REGISTERED_SOURCE_CONTROL_PROVIDER_CREDENTIAL_SHA256},
      fetchImpl:async()=>{calls++;throw new Error('no call');}}),/ASSAY_REGISTERED_SOURCE_NEXT_CREDENTIAL_BINDING/);
    assert.equal(calls,0);
  }finally{rmSync(root,{recursive:true,force:true});}
});


test('the proposed protocol cannot prepare fresh execution from an inactive authority file',()=>{
  const root=mkdtempSync(join(tmpdir(),'priority-inactive-'));
  const inactive=join(root,'inactive.json');
  writeFileSync(inactive,JSON.stringify({status:'PREPARED_NOT_ACTIVATED'}));
  try {const output=join(root,'new-run');
    assert.throws(()=>preparePriorityRun(output,inactive,'portable-loom-registered-source-control-20261011-r06'),/ASSAY_PRIORITY_EXECUTION_NOT_ACTIVATED/);
    assert.equal(existsSync(output),false);
  }finally{rmSync(root,{recursive:true,force:true});}
});
