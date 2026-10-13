import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync,existsSync,globSync,copyFileSync,mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,resolve} from 'node:path';
import {ASSAY_SOURCE_REGISTRATION_ALIGNED_RUN_ID as runId,ASSAY_SOURCE_REGISTRATION_ALIGNED_PROMPT_SHA256 as promptHash,
  ASSAY_REGISTERED_SOURCE_CONTROL_PROVIDER_CREDENTIAL_SHA256 as providerHash,sha256,validateAssayPolicy,requireTrialFamily} from '../server/loom-assay-contract.js';
import {createLoomAssayHandler,loadApprovedRunConfiguration} from '../server/loom-assay.js';
import {loadServerManifest,prepareServerRequest,captureServerCall} from '../research/portable-loom-server-transport-20261009/server-client.mjs';
import {inspectPortableLoomReceiverConformance} from '../app/engine/portable-loom-receiver-conformance.js';
import {portableLoomFooterText} from '../app/engine/portable-loom-output.js';
import {inspectAlignedSourceNegativeOutput} from '../research/portable-loom-registered-source-control-20261011/source-negative-v1_1/inspect-alignment.mjs';

const base='research/portable-loom-registered-source-control-20261011/source-negative-v1_1/';
const head='b'.repeat(40),trial={trial_id:'FIRST_CONFIGURED_RECEIVER-R01-1',case_id:'R01',role:'RECEIVER',turn_index:0};
const scoring=JSON.parse(readFileSync(base+'SCORING_CONTRACT.json'));
const historicBase='research/portable-loom-registered-source-control-20261011/source-negative-v1/';

test('n02 retains every n01 prompt byte, origin/source/scoring identity, and the two historical failures',()=>{
  const original=readFileSync(historicBase+'PROMPT.txt'),aligned=readFileSync(base+'PROMPT.txt');
  assert.deepEqual(aligned.subarray(0,original.length),original);
  assert.match(aligned.subarray(original.length).toString(),/receiver_declaration/);
  for(const name of ['SCORING_CONTRACT.json','SOURCE.txt','SOURCE_INVENTORY.json','INLINE_SOURCE.json'])
    assert.deepEqual(readFileSync(base+name),readFileSync(historicBase+name));
  assert.equal(sha256(readFileSync(base+'SCORING_CONTRACT.json')),'6b7cd461399568c48c9c91baa33971a2af08d8be021ca9d7110e9f96dec2bbc1');
  const answer=readFileSync('tests/fixtures/loom/source-registration-negative-n01-answer.txt','utf8');
  assert.equal(sha256(answer),'7ecbdd6fb2434200d8009ef305fc4c96ce633668efb4aba5cb97e40ff05ec159');
  const old=inspectAlignedSourceNegativeOutput(answer,scoring);
  assert.equal(old.inspector.status,'HOLD');assert.deepEqual(old.inspector.findings,['SOURCE_IDENTIFIER_UNREGISTERED']);
  assert.equal(old.checks.exact_receiver_declaration,false);assert.equal(old.checks.prose_missing_registration,false);
  assert.equal(old.checks.prose_origin_registration_request,false);assert.equal(old.structural_acceptance,false);
});

function alignedAnswer({declaration='DECLARED_UNVERIFIED_UNADMITTED',missing=['SOURCE_IDENTIFIER_UNREGISTERED'],used=[],body=null,footer=null,receiptChanges={}}={}){
  const receipt={schema:'td613.loom.portable-session-receiver-turn/v0.1',...scoring.expected,turn_index:1,
    used_document_ids:used,missing_information:missing,receiver_declaration:declaration,...receiptChanges};
  return (body??'The public fee is USD 120.\n\nThe receiver receipt is declared, unverified and unadmitted; independent verification and custody admission remain pending. Source registration is missing; origin registration is requested.')
    +'\n\n```json\n'+JSON.stringify(receipt)+'\n```\n\n'+(footer??'Phase: proceeding | Session: n02 | Route: UNKNOWN | Posture: MINIMUM_DISCLOSURE_NON_AUTHORITATIVE | Auth: UNKNOWN\nReceipt: DECLARED_UNVERIFIED_UNADMITTED | HOLD: SOURCE_ACCOUNTING (SOURCE_IDENTIFIER_UNREGISTERED) | Gate: NOT_CHECKED_FOR_THIS_OUTPUT | Scope: CURRENT_TASK | 米 Check Loom Gate ⟐');
}
test('full aligned assembly retains exactly the expected source HOLD and zero admission authority',()=>{
  const result=inspectAlignedSourceNegativeOutput(alignedAnswer(),scoring);
  assert.equal(result.structural_acceptance,true,JSON.stringify(result.checks));
  assert.deepEqual(result.inspector.findings,['SOURCE_IDENTIFIER_UNREGISTERED']);
  assert.equal(result.admission_authority,false);assert.equal(result.scientific_status,'NOT_ADMITTED');
});
test('strict aligned criteria reject lost declaration, body request, source marker, identity, fee and footer coordinates',()=>{
  for(const opts of [
    {declaration:'A descriptive declaration'}, {missing:[]}, {used:['registered_fee_source_v1']},
    {receiptChanges:{turn_index:2}}, {receiptChanges:{session_root_ref:'a'.repeat(64)}},
    {receiptChanges:{operator_task:'different task'}}, {receiptChanges:{extra_field:true}},
    {body:'The public fee is USD 120. The receipt is declared, unverified and unadmitted; independent verification and custody admission remain pending.'},
    {body:'The public fee is USD 121. The receipt is declared, unverified and unadmitted; independent verification and custody admission remain pending. Source registration is missing; origin registration is requested.'},
    {body:'The public fee is USD 120. The receiver receipt is independently verified. Source registration is missing; origin registration is requested.'},
    {footer:'Phase: proceeding | Session: n02 | Route: UNKNOWN | Posture: INSTRUCTION_ONLY | Auth: UNKNOWN | Receipt: DECLARED_UNVERIFIED_UNADMITTED | HOLD: NONE | Gate: NOT_CHECKED_FOR_THIS_OUTPUT | Scope: CURRENT_TASK | 米 Check Loom Gate ⟐'},
  ]) assert.equal(inspectAlignedSourceNegativeOutput(alignedAnswer(opts),scoring).structural_acceptance,false,JSON.stringify(opts));
  for(const replace of [s=>s.replace('Route: UNKNOWN','Route: CHATGPT'),s=>s.replace('Gate: NOT_CHECKED_FOR_THIS_OUTPUT','Gate: PASS'),
    s=>s.replace('米 Check Loom Gate ⟐','米 Check Loom Gate'),s=>s+'\nAfter the footer.',s=>s.replace('Phase: proceeding |','Phase: proceeding\n\n')])
    assert.equal(inspectAlignedSourceNegativeOutput(replace(alignedAnswer()),scoring).structural_acceptance,false);
});
function policy(){const p=JSON.parse(readFileSync(base+'POLICY.template.json'));
  p.protocol_commit=p.binding.protocol_commit=head;p.expires_at=new Date(Date.now()+6*3600000).toISOString();
  return validateAssayPolicy(p);}
async function fixture({runtimeRoot=process.cwd(),missingExpectation=false,alterRequest=false}={}){
  const p=policy(),{request,provider_wire}=prepareServerRequest(p,trial),operations=[],sent=[];
  if(alterRequest)request.messages[0].content+='changed';
  const token='A'.repeat(40),handler=createLoomAssayHandler({environment:{GEMINI_API_KEY:'synthetic-key',
    TD613_LOOM_ASSAY_ACCESS_SHA256:sha256(token),VERCEL_GIT_COMMIT_SHA:head},
    budget:async(op,input)=>{operations.push(op);if(op==='inspect')return{policy:p};
      if(op==='reserve')return{durable_reservation:true,request_sha256:input.request_sha256,
        call_key:'FIRST_CONFIGURED_RECEIVER-R01-1:RECEIVER:0',reserved_cost_nanos:String(provider_wire.reserved_cost_nanos)};
      return{retained:true,call_key:input.call_key,status:input.status};},
    fetchImpl:async(url,options)=>{sent.push({url,options});return new Response(JSON.stringify({modelVersion:'gemini-3.8-flash',
      usageMetadata:{promptTokenCount:100,totalTokenCount:110,serviceTier:'standard'},
      candidates:[{finishReason:'STOP',content:{parts:[{text:'Synthetic local result.'}]}}]}),
      {status:200,headers:{'x-gemini-service-tier':'standard'}});}});
  const res={setHeader(){},end(text){this.body=JSON.parse(text);}},previous=process.cwd();
  try{process.chdir(runtimeRoot);await handler({method:'POST',headers:{authorization:`Bearer ${token}`,
    'x-vercel-oidc-token':'synthetic-oidc',...(missingExpectation?{}:{'x-td613-expected-credential-sha256':providerHash})},body:request},res);}
  finally{process.chdir(previous);}return{res,operations,sent};
}
test('n02 binds its distinct manifest, prompt, wire bytes and one conservative reservation',()=>{
  const p=policy(),loaded=loadServerManifest(process.cwd(),runId),prepared=prepareServerRequest(p,trial);
  assert.ok(loadApprovedRunConfiguration().run_ids.includes(runId));
  assert.equal(loaded.manifest.artifact_sha256,promptHash);assert.equal(sha256(loaded.artifact),promptHash);
  assert.equal(Buffer.byteLength(loaded.artifact),107100);
  assert.equal(prepared.provider_wire.body,readFileSync(base+'PROVIDER_REQUEST.body.json','utf8'));
  assert.equal(prepared.provider_wire.request_sha256,'76f22c2632185a0a892e72c4746e47998b6688b476cdca83d85afe6ecf21c5f0');
  assert.equal(prepared.provider_wire.reserved_cost_nanos,491184000);
  const prior=JSON.parse(readFileSync('research/portable-loom-registered-source-control-20261011/priority-v1/POLICY.template.json'));
  prior.run_id='portable-loom-registered-source-control-20261011-r06';prior.protocol_commit=prior.binding.protocol_commit=head;
  prior.expires_at=p.expires_at;
  const oldBody=JSON.parse(prepareServerRequest(prior,trial).provider_wire.body),newBody=JSON.parse(prepared.provider_wire.body);
  delete oldBody.contents;delete newBody.contents;assert.deepEqual(newBody,oldBody);
  assert.deepEqual(scoring.origin_source_context,{registered_document_ids:[],observed_used_document_ids:[],unidentified_source_count:1});
});
test('n02 rejects widened scope, decoding, pricing, expiry and trial identities',()=>{
  for(const mutate of [p=>p.binding.limits.max_calls=2,p=>p.binding.limits.max_cost_usd=.51,
    p=>p.artifact_sha256='d703dcebb9869152df5d95541bbe5400d1ed9b92d1f11565aa10c9382cfd35c6',
    p=>p.binding.model='gemini-3.8-pro',p=>p.binding.generation_parameters.thinking_level='low',
    p=>p.binding.limits.max_output_tokens_per_call=p.receiver_output_tokens=8192,p=>p.binding.limits.timeout_ms=120000,
    p=>p.binding.pricing.input_usd_per_million=.75,p=>p.binding.pricing.output_usd_per_million=3.75,
    p=>delete p.binding.service_tier,p=>p.binding.service_tier='flex',p=>p.binding.retries=1,
    p=>p.binding.tools='ENABLED',p=>p.expires_at=new Date(Date.now()+7*3600000).toISOString()]){
    const p=policy();mutate(p);assert.throws(()=>validateAssayPolicy(p),/ASSAY_/);}
  for(const changed of [{trial_id:'FIRST_CONFIGURED_RECEIVER-R01-2'},{turn_index:1},{case_id:'R02'}])
    assert.throws(()=>requireTrialFamily(policy(),{...trial,...changed}),/ASSAY_/);
});
test('n02 dispatches its exact wire once and retains a declared tier downgrade',async()=>{
  const {res,operations,sent}=await fixture();assert.equal(res.statusCode,200);
  assert.deepEqual(operations,['inspect','reserve','complete']);assert.equal(sent.length,1);
  assert.equal(sent[0].options.body,readFileSync(base+'PROVIDER_REQUEST.body.json','utf8'));
  assert.equal(sent[0].url,'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent');
  assert.equal(res.body.status,'CAPTURED_NOT_ADMITTED');assert.equal(res.body.retries,0);
  assert.equal(res.body.service_tier.status,'DECLARED_STANDARD_DOWNGRADE');
});
test('n02 missing credential expectation holds before budget inspection',async()=>{
  const {res,operations,sent}=await fixture({missingExpectation:true});assert.equal(res.statusCode,409);
  assert.equal(res.body.error,'ASSAY_PROVIDER_CREDENTIAL_EXPECTATION_REQUIRED');
  assert.deepEqual(operations,[]);assert.deepEqual(sent,[]);
});
test('n02 changed prompt and absent deployed assets hold before reservation',async()=>{
  const root=mkdtempSync(join(tmpdir(),'negative-assets-'));
  try{for(const opts of [{alterRequest:true},{runtimeRoot:root}]){const {res,operations,sent}=await fixture(opts);
    assert.equal(res.statusCode,409);assert.equal(res.body.error,opts.alterRequest?'ASSAY_USER_INPUT_CHANGED':'ASSAY_PREFLIGHT_HELD');
    assert.deepEqual(operations,['inspect']);assert.deepEqual(sent,[]);}}
  finally{rmSync(root,{recursive:true,force:true});}
});
test('the actual Vercel includeFiles selection carries n02 manifest and prompt',async()=>{
  const root=mkdtempSync(join(tmpdir(),'negative-packaged-'));
  try{const config=JSON.parse(readFileSync('vercel.json'));
    assert.equal(config.functions['api/khonapolit.js'].maxDuration,300);
    const selected=new Set(globSync(config.functions['api/khonapolit.js'].includeFiles));
    for(const name of ['TRIAL_MANIFEST.json','PROMPT.txt']){const path=base+name;assert.ok(selected.has(path));
      const destination=resolve(root,path);mkdirSync(dirname(destination),{recursive:true});copyFileSync(path,destination);}
    const {res,sent}=await fixture({runtimeRoot:root});assert.equal(res.statusCode,200);assert.equal(sent.length,1);
  }finally{rmSync(root,{recursive:true,force:true});}
});
test('n02 client rejects a wrong private caller before creating an attempt or calling out',async()=>{
  const root=mkdtempSync(join(tmpdir(),'negative-client-'));let calls=0;
  try{const p=policy(),{request}=prepareServerRequest(p,trial),attempt=join(root,'attempt');
    await assert.rejects(captureServerCall(p,request,attempt,{environment:{TD613_LOOM_ASSAY_TOKEN:'A'.repeat(40),
      TD613_LOOM_ASSAY_EXPECTED_CREDENTIAL_SHA256:providerHash},fetchImpl:async()=>{calls++;throw Error('no call');}}),/ASSAY_REGISTERED_SOURCE_NEXT_CREDENTIAL_BINDING/);
    assert.equal(calls,0);assert.equal(existsSync(attempt),false);
  }finally{rmSync(root,{recursive:true,force:true});}
});
test('n02 keeps unregistered source HOLD even with empty registered-ID arrays; invented IDs cannot pass',()=>{
  const receipt={schema:'td613.loom.portable-session-receiver-turn/v0.1',...scoring.expected,turn_index:1,
    used_document_ids:[],missing_information:['SOURCE_IDENTIFIER_UNREGISTERED'],receiver_declaration:'DECLARED_UNVERIFIED_UNADMITTED'};
  const inspect=r=>inspectPortableLoomReceiverConformance({answer:'The public fee is USD 120. The receipt is declared, unverified and unadmitted. Source registration is missing; origin registration is requested.\n\n```json\n'+JSON.stringify(r)+'\n```\n\n'+portableLoomFooterText({receiptStatus:'DECLARED_UNVERIFIED_UNADMITTED'}),
    expected:scoring.expected,source_context:scoring.origin_source_context,receipt_required:true,review_body_required:true});
  const good=inspect(receipt);assert.equal(good.status,'HOLD');assert.deepEqual(good.findings,['SOURCE_IDENTIFIER_UNREGISTERED']);
  assert.equal(good.admission_authority,false);
  const invented=structuredClone(receipt);invented.used_document_ids=['registered_fee_source_v1'];
  assert.ok(inspect(invented).findings.includes('RECEIPT_SOURCE_NOT_REGISTERED'));
  const erased=structuredClone(receipt);erased.missing_information=[];
  assert.notDeepEqual(inspect(erased).findings,['SOURCE_IDENTIFIER_UNREGISTERED']);
});
