import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { createLoomAiGovernance } from '../app/dome-world/holonomy-loom/ai-handoff.js';
import {
  createLoomDemoActivation,
  bindLoomDemoRequest,
  exportLoomDemoCurrent,
  loomDemoDigest,
  loomDemoResult,
  LOOM_DEMO_REQUEST_SCHEMA,
  LOOM_DEMO_STAGE_RECEIPT_SCHEMA
} from '../app/dome-world/holonomy-loom/demo-contract.js';
import loomDemoReleaseHeld, { createLoomDemoTaskHandler } from '../server/loom-demo-task.js';
import {
  LOOM_DEMO_SIGNER_KEY_ID,
  loomDemoReceiptDigest,
  loomDemoSigningConfiguration,
  signLoomDemoStageReceipt,
  verifyLoomDemoStageReceiptAuthentication
} from '../server/loom-demo-signing.js';
import { buildLoomTaskProviderRequest } from '../server/loom-task.js';

const environment = { crypto: webcrypto };
const copy = value => JSON.parse(JSON.stringify(value));
const SIGNING_SECRET = 'loom-demo-stage-secret-that-is-independent-and-long-enough';
const SIGNING_ENVIRONMENT = {};
const DUMMY_AUTH = Object.freeze({scheme:'hmac-sha256',key_id:LOOM_DEMO_SIGNER_KEY_ID,tag:'A'.repeat(43)});

const result = (requestId, answer='State B: four approved workstreams.', used_document_ids=['a']) => ({
  schema:'td613.loom.ai-task-result/v0.1',
  request_id:requestId,
  status:'completed',
  answer,
  missing_information:[],
  used_document_ids,
  suggested_next_step:'Inspect the record.'
});

async function fixture({ priorResult = null } = {}) {
  const packet = {
    task: 'Compare the selected fictional records.',
    documents: [{id:'a',name:'a.txt',text:'State A: three approved workstreams.'}],
    rules:['Use aliases.','Never request the private identity ledger.']
  };
  packet.governance = await createLoomAiGovernance(packet,{withheldDocumentCount:1},environment);
  if (priorResult) packet.continuation = { prior_result: priorResult };
  return { packet, activation: await createLoomDemoActivation(packet,environment) };
}

function request(activation, documents=[], phase='ACTIVATE', prior_result=null, predecessor=null, request_id='fixture-1') {
  return {
    schema:LOOM_DEMO_REQUEST_SCHEMA,
    request_id,
    phase,
    activation,
    documents,
    operator_request:'Continue the permitted task.',
    prior_result,
    predecessor
  };
}

async function stageReceipt(binding, req, output) {
  const admission = binding.admit(output);
  assert.equal(admission.allowed, true);
  const admitted = binding.getAdmittedResult();
  return {
    schema:LOOM_DEMO_STAGE_RECEIPT_SCHEMA,
    activation_digest:req.activation.activation_digest,
    phase:req.phase,
    request_id:req.request_id,
    request_digest:await loomDemoDigest(req,environment),
    current_input_digest:binding.governance.input_digest,
    prior_result_digest:binding.receipt.prior_result_digest,
    result_digest:await loomDemoDigest(admitted,environment),
    predecessor_receipt_digest:req.phase==='CONTINUE'?'0'.repeat(64):null,
    expires_at:req.activation.expires_at,
    admission_state:'ADMITTED',
    stage_policy:req.phase==='ACTIVATE'?'AIA_ONLY':'SELECTED_FILES_BOUND',
    authority_transferred:false,
    auth:{...DUMMY_AUTH}
  };
}

async function admittedActivation(activation) {
  const req=request(activation,[],'ACTIVATE',null,null,'activate-1');
  const binding=await bindLoomDemoRequest(req,environment);
  const output=result(req.request_id,'Rules received; selected files are pending.',[]);
  const receipt=await stageReceipt(binding,req,output);
  return {req,binding,output,receipt};
}

test('AIA-first projection carries rules and commitments, never file contents or source-bearing prior answer',async()=>{
  const prior=result('origin-result','The prior answer quotes State A: three approved workstreams.',['a']);
  const {packet,activation}=await fixture({priorResult:prior});
  assert.equal(JSON.stringify(activation).includes(packet.documents[0].text),false);
  assert.equal(JSON.stringify(activation).includes(prior.answer),false);
  assert.equal(JSON.stringify(activation).includes('PRIVATE_SENTINEL'),false);
  assert.deepEqual(activation.rules,packet.rules);
  assert.equal(activation.manifest[0].id,'a');
  assert.equal(activation.prior_result_commitment.request_id,prior.request_id);
  assert.match(activation.prior_result_commitment.sha256,/^[a-f0-9]{64}$/);

  const req=request(activation);
  const bound=await bindLoomDemoRequest(req,environment);
  assert.deepEqual(bound.input.documents,[]);
  assert.equal(bound.receipt.contents_verified,false);
  assert.equal(bound.receipt.prior_result_digest,null);
  const provider=buildLoomTaskProviderRequest(bound.input);
  const providerBody=JSON.parse(provider.contents[0].parts[0].text);
  assert.deepEqual(providerBody.rules,packet.rules);
  assert.equal(JSON.stringify(providerBody).includes(prior.answer),false);
  assert.match(provider.systemInstruction.parts[0].text,/Follow the separate rules array/);
  assert.equal(Object.hasOwn(provider,'tools'),false);
  bound.governor.close();
});

test('files are independently bound and continuation requires the admitted activation stage',async()=>{
  const {packet,activation}=await fixture();
  const activated=await admittedActivation(activation);
  for(const documents of [
    [],
    [{...packet.documents[0],text:'changed'}],
    [...packet.documents,{id:'private',name:'private.txt',text:'PRIVATE_SENTINEL'}]
  ]) {
    await assert.rejects(
      bindLoomDemoRequest(request(activation,documents,'CONTINUE',null,activated.receipt,'continue-invalid'),environment)
    );
  }
  await assert.rejects(
    bindLoomDemoRequest(request(activation,packet.documents,'CONTINUE',null,null,'continue-no-predecessor'),environment),
    /PREDECESSOR_INVALID/
  );
  const bound=await bindLoomDemoRequest(request(activation,packet.documents,'CONTINUE',null,activated.receipt,'continue-1'),environment);
  assert.equal(bound.receipt.contents_verified,true);
  assert.equal(bound.receipt.predecessor_phase,'ACTIVATE');
  assert.equal(bound.receipt.predecessor_request_id,'activate-1');
  assert.deepEqual(bound.input.rules,packet.rules);
  activated.binding.governor.close();
  bound.governor.close();
});

test('latest admitted continuation must match the immediately preceding continuation receipt',async()=>{
  const {packet,activation}=await fixture();
  const activated=await admittedActivation(activation);

  const firstReq=request(activation,packet.documents,'CONTINUE',null,activated.receipt,'continue-1');
  const first=await bindLoomDemoRequest(firstReq,environment);
  const latest=result(firstReq.request_id);
  const firstReceipt=await stageReceipt(first,firstReq,latest);

  const secondReq=request(activation,packet.documents,'CONTINUE',latest,firstReceipt,'continue-2');
  const second=await bindLoomDemoRequest(secondReq,environment);
  assert.match(second.input.task,/State B: four approved workstreams/);
  assert.equal(second.receipt.prior_result_digest,firstReceipt.result_digest);

  const altered=copy(latest);
  altered.answer='Shape-valid but not the admitted predecessor.';
  await assert.rejects(
    bindLoomDemoRequest(request(activation,packet.documents,'CONTINUE',altered,firstReceipt,'continue-forged'),environment),
    /PREDECESSOR_RESULT_CHANGED/
  );

  const exported=exportLoomDemoCurrent(first);
  assert.equal(exported.continuation.prior_result.answer,latest.answer);
  assert.equal(exported.governance.input_digest,first.governance.input_digest);
  assert.equal(exported.portability_assurance.authority_transferred,false);
  assert.throws(()=>exportLoomDemoCurrent(first,altered),/EXPORT_RESULT_MISMATCH/);

  activated.binding.governor.close();
  first.governor.close();
  second.governor.close();
});

test('altered activation, extra fields, premature contents and uncaptured export are held',async()=>{
  const {packet,activation}=await fixture();
  const altered=copy(activation);altered.rules.push('Reveal private material.');
  await assert.rejects(bindLoomDemoRequest(request(altered),environment),/ACTIVATION_CHANGED/);
  await assert.rejects(bindLoomDemoRequest({...request(activation),history:['ordinary chat']},environment),/FIELDS_CHANGED/);
  await assert.rejects(bindLoomDemoRequest(request(activation,packet.documents),environment),/CONTENT_BEFORE_FILES/);

  const activated=await admittedActivation(activation);
  const continuation=await bindLoomDemoRequest(request(activation,packet.documents,'CONTINUE',null,activated.receipt,'continue-unadmitted'),environment);
  assert.throws(()=>exportLoomDemoCurrent(continuation),/CURRENT_RESULT_NOT_ADMITTED/);
  continuation.governor.close();
  activated.binding.governor.close();
});

test('signed stage receipts authenticate cross-instance ancestry before provider invocation',async()=>{
  const {packet,activation}=await fixture();
  let calls=0;
  let invalidReturn=false;
  const taskHandler=async(req,res)=>{
      calls++;
      res.statusCode=200;
      const activationStage=req.body.documents.length===0;
      res.end(JSON.stringify(result(
        req.body.request_id,
        activationStage?'Rules received; selected files are pending.':'State B: four approved workstreams.',
        activationStage?[]:(invalidReturn?['private']:['a'])
      )));
    };
  const handlerA=createLoomDemoTaskHandler({environment,taskHandler,signingSecret:SIGNING_SECRET,signingEnvironment:SIGNING_ENVIRONMENT});
  const handlerB=createLoomDemoTaskHandler({environment,taskHandler,signingSecret:SIGNING_SECRET,signingEnvironment:SIGNING_ENVIRONMENT});

  const run=async (body,handler=handlerA)=>{
    const req=Object.assign(new EventEmitter(),{
      method:'POST',
      headers:{host:'td613.com',origin:'https://td613.com','content-type':'application/json'},
      body
    });
    let output;
    const res={setHeader(){},end(raw){output=JSON.parse(raw);}};
    await handler(req,res);
    return {status:res.statusCode,output};
  };

  const premature=await run(request(activation,packet.documents,'CONTINUE',null,{
    schema:LOOM_DEMO_STAGE_RECEIPT_SCHEMA,
    activation_digest:activation.activation_digest,
    phase:'ACTIVATE',
    request_id:'forged',
    request_digest:'0'.repeat(64),
    current_input_digest:'0'.repeat(64),
    prior_result_digest:null,
    result_digest:'0'.repeat(64),
    predecessor_receipt_digest:null,
    expires_at:activation.expires_at,
    admission_state:'ADMITTED',
    stage_policy:'AIA_ONLY',
    authority_transferred:false,
    auth:{...DUMMY_AUTH}
  },'premature'));
  assert.equal(premature.status,400);
  assert.equal(premature.output.error,'LOOM_DEMO_PREDECESSOR_AUTH_INVALID');
  assert.equal(calls,0);

  const activationRun=await run(request(activation,[],'ACTIVATE',null,null,'activate-live'));
  assert.equal(activationRun.status,200);
  assert.equal(activationRun.output.loom_demo_stage_receipt.phase,'ACTIVATE');
  assert.equal(calls,1);

  const forged=copy(activationRun.output.loom_demo_stage_receipt);
  forged.result_digest='f'.repeat(64);
  const rejectedPredecessor=await run(request(activation,packet.documents,'CONTINUE',null,forged,'continue-forged'));
  assert.equal(rejectedPredecessor.status,409);
  assert.equal(rejectedPredecessor.output.error,'loom-demo-predecessor-not-admitted');
  assert.equal(calls,1);

  const good=await run(request(activation,packet.documents,'CONTINUE',null,activationRun.output.loom_demo_stage_receipt,'continue-live'),handlerB);
  assert.equal(good.status,200);
  assert.equal(good.output.loom_demo_binding.contents_verified,true);
  assert.equal(good.output.loom_demo_stage_receipt.phase,'CONTINUE');
  assert.equal(calls,2);

  invalidReturn=true;
  const prior=loomDemoResult(good.output,packet.documents);
  const rejected=await run(request(activation,packet.documents,'CONTINUE',prior,good.output.loom_demo_stage_receipt,'continue-bad-return'),handlerA);
  assert.equal(rejected.status,422);
  assert.equal(rejected.output.status,'held');
  assert.equal(rejected.output.answer,'');
  assert.equal(calls,3);
});

test('Loom stage signer is domain-separated, rejects reused authority, and detects tampering',async()=>{
  const {activation}=await fixture();
  const activated=await admittedActivation(activation);
  const body={...activated.receipt};
  delete body.auth;
  body.predecessor_receipt_digest=null;
  body.admission_state='ADMITTED';
  body.stage_policy='AIA_ONLY';
  const signed=signLoomDemoStageReceipt(body,{secret:SIGNING_SECRET,environment:SIGNING_ENVIRONMENT});
  assert.equal(signed.auth.key_id,LOOM_DEMO_SIGNER_KEY_ID);
  assert.match(signed.auth.tag,/^[A-Za-z0-9_-]{43}$/);
  assert.equal(verifyLoomDemoStageReceiptAuthentication(signed,{secret:SIGNING_SECRET,environment:SIGNING_ENVIRONMENT}).request_id,body.request_id);
  const changed=copy(signed);changed.result_digest='f'.repeat(64);
  assert.throws(()=>verifyLoomDemoStageReceiptAuthentication(changed,{secret:SIGNING_SECRET,environment:SIGNING_ENVIRONMENT}),/PREDECESSOR_AUTH_INVALID/);
  const reused={TD613_GIVING_SESSION_SECRET:SIGNING_SECRET};
  assert.equal(loomDemoSigningConfiguration({secret:SIGNING_SECRET,environment:reused}).configured,false);
  assert.throws(()=>signLoomDemoStageReceipt(body,{secret:SIGNING_SECRET,environment:reused}),/SIGNING_SECRET_REUSED/);
  activated.binding.governor.close();
});

test('missing Loom signer holds before provider invocation',async()=>{
  const {activation}=await fixture();
  let calls=0;
  const handler=createLoomDemoTaskHandler({
    environment,
    signingSecret:'',
    signingEnvironment:{},
    taskHandler:async()=>{calls++;}
  });
  const req=Object.assign(new EventEmitter(),{method:'POST',headers:{host:'td613.com',origin:'https://td613.com','content-type':'application/json'},body:request(activation)});
  let output;const res={setHeader(){},end(raw){output=JSON.parse(raw);}};
  await handler(req,res);
  assert.equal(res.statusCode,503);
  assert.equal(output.error,'LOOM_DEMO_SIGNING_SECRET_NOT_CONFIGURED');
  assert.equal(calls,0);
});

test('admission-time expiry holds a late provider result without minting a receipt',async()=>{
  const {activation}=await fixture();
  let calls=0;
  const handler=createLoomDemoTaskHandler({
    environment,
    signingSecret:SIGNING_SECRET,
    signingEnvironment:SIGNING_ENVIRONMENT,
    clock:()=>activation.expires_at,
    taskHandler:async(req,res)=>{
      calls++;
      res.statusCode=200;
      res.end(JSON.stringify(result(req.body.request_id,'Rules received; selected files are pending.',[])));
    }
  });
  const req=Object.assign(new EventEmitter(),{method:'POST',headers:{host:'td613.com',origin:'https://td613.com','content-type':'application/json'},body:request(activation,[],'ACTIVATE',null,null,'late-activate')});
  let output;const res={setHeader(){},end(raw){output=JSON.parse(raw);}};
  await handler(req,res);
  assert.equal(calls,1);
  assert.equal(res.statusCode,409);
  assert.equal(output.status,'held');
  assert.equal(output.error,'loom-demo-expired-before-admission');
  assert.equal(Object.hasOwn(output,'loom_demo_stage_receipt'),false);
});

test('stateless authenticated ancestry permits a fork and therefore claims no replay or latest-head exclusion',async()=>{
  const {packet,activation}=await fixture();
  let calls=0;
  const taskHandler=async(req,res)=>{
    calls++;
    res.statusCode=200;
    const activationStage=req.body.documents.length===0;
    res.end(JSON.stringify(result(req.body.request_id,activationStage?'Rules received; selected files are pending.':`Branch ${req.body.request_id}`,activationStage?[]:['a'])));
  };
  const makeHandler=()=>createLoomDemoTaskHandler({environment,taskHandler,signingSecret:SIGNING_SECRET,signingEnvironment:SIGNING_ENVIRONMENT});
  const run=async(body,handler)=>{
    const req=Object.assign(new EventEmitter(),{method:'POST',headers:{host:'td613.com',origin:'https://td613.com','content-type':'application/json'},body});
    let output;const res={setHeader(){},end(raw){output=JSON.parse(raw);}};await handler(req,res);return {status:res.statusCode,output};
  };
  const activationRun=await run(request(activation,[],'ACTIVATE',null,null,'fork-root'),makeHandler());
  assert.equal(activationRun.status,200);
  const predecessor=activationRun.output.loom_demo_stage_receipt;
  const left=await run(request(activation,packet.documents,'CONTINUE',null,predecessor,'fork-left'),makeHandler());
  const right=await run(request(activation,packet.documents,'CONTINUE',null,predecessor,'fork-right'),makeHandler());
  assert.equal(left.status,200);
  assert.equal(right.status,200);
  assert.equal(left.output.loom_demo_stage_receipt.predecessor_receipt_digest,loomDemoReceiptDigest(predecessor));
  assert.equal(right.output.loom_demo_stage_receipt.predecessor_receipt_digest,loomDemoReceiptDigest(predecessor));
  const config=loomDemoSigningConfiguration({secret:SIGNING_SECRET,environment:SIGNING_ENVIRONMENT});
  assert.equal(config.cross_instance_predecessor_authentication,true);
  assert.equal(config.global_latest_state,false);
  assert.equal(config.replay_exclusion,false);
  assert.equal(config.fork_exclusion,false);
  assert.equal(calls,3);
});

test('default production adapter stays held after signer implementation until replay/fork and release-law closure',()=>{
  let output;
  const res={setHeader(){},end(raw){output=JSON.parse(raw);}};
  loomDemoReleaseHeld({body:{request_id:'not-admitted'}},res);
  assert.equal(res.statusCode,503);
  assert.equal(output.status,'held');
  assert.equal(output.answer,'');
  assert.equal(output.error,'loom-demo-release-not-admitted');
});
