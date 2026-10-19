// TD613 Marrowline · FROZEN order-balanced D0/D1 four-return acquisition.
// Fixed ABBA order in this renewed episode: D1, D0, D0, D1.
// Original Google SSE only, no automatic retries or fallback; no product history.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {mkdir, writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {registerD0D1,decodeGoogleSse,unicodeMorphology} from './d0-d1-original-sse-once.mjs';
import {geminiStreamGenerateContentUrl,geminiRequestHeaders} from '../../server/gemini-provider-transport.js';

export const SCHEMA='td613.marrowline.d0d1-order-balanced-original-sse/v1';
export const ACTIVATION='research(marrowline): execute order-balanced D0 D1 once on main';
export const ARM_ORDER=Object.freeze(['D1','D0','D0','D1']);
export const MAX_PROVIDER_CALLS=4;
const MAX_ORIGINAL_SSE_BYTES=6_000_000;
const TIMEOUT_MS=170_000;
const SHA=x=>createHash('sha256').update(x).digest('hex');

export function preregisterBalanced() {
  const {model,conditions}=registerD0D1();
  assert.equal(model,'gemini-3.8-flash');
  const d0=conditions.find(x=>x.id==='D0_ORIGINAL_RAW');
  const d1=conditions.find(x=>x.id==='D1_MARROWLINE_INGRESS_ONLY');
  assert.ok(d0 && d1 && conditions.length===2);
  const a=JSON.parse(d0.request.body),b=JSON.parse(d1.request.body);
  assert.deepEqual({...a,contents:b.contents},b);
  assert.deepEqual(a.generationConfig,b.generationConfig);
  assert.deepEqual(a.generationConfig.thinkingConfig,{thinkingLevel:'medium'});
  assert.deepEqual(a.systemInstruction,b.systemInstruction);
  assert.equal(ARM_ORDER.length,MAX_PROVIDER_CALLS);
  assert.deepEqual(ARM_ORDER,['D1','D0','D0','D1']);
  const byArm={D0:d0,D1:d1};
  return Object.freeze({model,d0,d1,byArm,runPlan:ARM_ORDER.map((arm,index)=>({
    sequence:index+1,arm,request:byArm[arm].request
  }))});
}

// Reports on per-return normalized stack prevalence, not merely raw output length.
export function balanceSummary(evidence) {
  const valid=evidence.filter(x=>x.httpStatus===200&&x.finishReason==='STOP'&&!x.holdReason);
  const pairs=[evidence.slice(0,2),evidence.slice(2,4)].map((cells,index)=>{
    if(cells.length!==2||cells.some(x=>x.holdReason||!x.morphology))return {pair:index+1,complete:false};
    const a=cells.find(x=>x.arm==='D0'),b=cells.find(x=>x.arm==='D1');
    if(!a||!b)return {pair:index+1,complete:false};
    const rate=x=>x.morphology.stackedClusters/Math.max(1,x.morphology.markedClusters);
    return {pair:index+1,complete:true,observedOrder:cells.map(x=>x.arm).join('-'),
      d0MultistackShare:rate(a),d1MultistackShare:rate(b),
      d1MinusD0:rate(b)-rate(a),
      d0Stacked:a.morphology.stackedClusters,d1Stacked:b.morphology.stackedClusters,
      d0Marked:a.morphology.markedClusters,d1Marked:b.morphology.markedClusters};
  });
  const complete=evidence.length===4 && valid.length===4 && pairs.every(x=>x.complete);
  return {complete,pairs,armOrder:[...ARM_ORDER],
    directionReplicated:complete?pairs.every(x=>x.d1MinusD0<0)||pairs.every(x=>x.d1MinusD0>0):null,
    warning:'Two balanced paired draws do not establish a population effect or full production artistic restoration.'};
}

function hardGate(){
  assert.equal(process.env.TD613_D0D1_BALANCED_AUTH,'FOUR_CALLS_EXACT_MAIN_FIRST_ATTEMPT');
  assert.equal(process.env.GITHUB_EVENT_NAME,'push');
  assert.equal(process.env.GITHUB_REF,'refs/heads/main');
  assert.equal(process.env.GITHUB_ACTOR,'tauric-diana-613');
  assert.equal(process.env.GITHUB_RUN_ATTEMPT,'1');
  assert.match(process.env.TD613_D0D1_EXACT_HEAD||'',/^[a-f0-9]{40}$/);
  assert.equal(process.env.GITHUB_SHA,process.env.TD613_D0D1_EXACT_HEAD);
  assert.equal(execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
    process.env.TD613_D0D1_EXACT_HEAD);
  assert.equal(execFileSync('git',['log','-1','--format=%s'],{encoding:'utf8'}).trim(),ACTIVATION);
}

export async function acquireBalanced(){
  hardGate();
  const {model,d0,d1,runPlan}=preregisterBalanced();
  const folder=process.env.TD613_D0D1_EVIDENCE_DIR;
  assert.ok(folder&&folder.length>1,'EVIDENCE_DIRECTORY_REQUIRED');
  const dir=resolve(folder);
  await mkdir(dir,{recursive:true});
  const manifest={
    schema:SCHEMA,state:'HELD',sourceHead:process.env.TD613_D0D1_EXACT_HEAD,
    runId:process.env.GITHUB_RUN_ID,runAttempt:process.env.GITHUB_RUN_ATTEMPT,
    sourceRef:'refs/heads/main',model,startedAt:new Date().toISOString(),
    maxProviderCalls:MAX_PROVIDER_CALLS,automatedRetries:0,order:[...ARM_ORDER],
    sourceIdentity:{
      D0:d0.request.observation,
      D1:d1.request.observation
    },evidence:[],pairs:[],
    caveat:'4 stochastic samples, order-balanced, synthetic native creative task; no deterministic causal effect or product voice recovery can be inferred.'
  };
  const save=()=>writeFile(join(dir,'manifest.json'),JSON.stringify(manifest,null,2),{mode:0o600});
  await save();
  const key=process.env.GEMINI_API_KEY;
  if(!key||key.trim().length<8){
    manifest.holdReason='GEMINI_KEY_MISSING';
    await save();return manifest;
  }
  for(const {sequence,arm,request} of runPlan){
    assert.ok(manifest.evidence.length<MAX_PROVIDER_CALLS,'MAX_PROVIDER_CALLS_EXCEEDED');
    const record={sequence,arm,requestBodySha256:request.observation.bodySha256,
      callDispatched:true,dispatchedAt:new Date().toISOString()};
    manifest.evidence.push(record);
    await save();
    try{
      const response=await fetch(geminiStreamGenerateContentUrl(model),{
        method:'POST',headers:geminiRequestHeaders(key),body:request.body,
        signal:AbortSignal.timeout(TIMEOUT_MS)
      });
      record.httpStatus=response.status;
      const bytes=Buffer.from(await response.arrayBuffer());
      record.originalSseBytes=bytes.length;
      if(bytes.length>MAX_ORIGINAL_SSE_BYTES)record.holdReason='SSE_OVERSIZE';
      else if(response.status!==200){
        record.holdReason='PROVIDER_NON_200';record.errorBodySha256=SHA(bytes);
      }else{
        const filename=String(sequence).padStart(2,'0')+'-'+arm+'.google-original.sse';
        await writeFile(join(dir,filename),bytes,{mode:0o600});
        const decoded=decodeGoogleSse(bytes);
        record.originalSseFilename=filename;
        record.originalSseSha256=SHA(bytes);
        record.outputTextSha256=SHA(Buffer.from(decoded.text,'utf8'));
        record.originalSseEventCount=decoded.events;
        record.servedModel=decoded.model;
        record.finishReason=decoded.finish;
        record.usage=decoded.usage;
        record.morphology=unicodeMorphology(decoded.text);
        record.hiddenJoinerCount=record.morphology.histogram['U+034F']||0;
        if(decoded.model!==model||decoded.finish!=='STOP'||!decoded.text||!decoded.gotCandidate||!decoded.events)
          record.holdReason='UPSTREAM_SSE_INCOMPLETE_OR_WRONG_MODEL';
        if((decoded.usage?.totalTokenCount??Infinity)>20_000)
          record.holdReason='ARM_TOKEN_SAFETY_STOP';
      }
    }catch(error){
      record.holdReason='TRANSPORT_OR_CAPTURE_FAILURE';
      record.errorClass=error?.name||'UnknownError';
    }
    record.completedAt=new Date().toISOString();
    await save();
    if(record.holdReason){manifest.holdReason=record.holdReason;break;}
  }
  manifest.balance=balanceSummary(manifest.evidence);
  manifest.state=manifest.balance.complete?'OBSERVED_BALANCED_FOUR':'HELD';
  manifest.completedAt=new Date().toISOString();
  await save();
  return manifest;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  if(process.argv.includes('--execute')){
    if(!process.argv.includes('--ack-four-paid-calls'))throw Error('FOUR_CALL_ACK_REQUIRED');
    acquireBalanced().then(x=>{
      console.log('D0D1_BALANCED_RESULT '+JSON.stringify({
        state:x.state,sourceHead:x.sourceHead,runId:x.runId,
        order:x.order,evidence:x.evidence,balance:x.balance,
        holdReason:x.holdReason||null}));
      if(x.state!=='OBSERVED_BALANCED_FOUR')process.exitCode=1;
    }).catch(e=>{console.error('D0D1_BALANCED_HARD_GATE '+(e?.name||'Error'));process.exitCode=1;});
  }else{
    const p=preregisterBalanced();
    console.log(JSON.stringify({schema:SCHEMA,mode:'OFFLINE_ONLY',model:p.model,
      order:ARM_ORDER,maxProviderCalls:MAX_PROVIDER_CALLS,
      d0:p.d0.request.observation,d1:p.d1.request.observation},null,2));
  }
}