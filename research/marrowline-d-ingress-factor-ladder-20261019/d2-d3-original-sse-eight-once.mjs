// 𝌋 TD613 · D2/D3 frozen original Google SSE. Eight calls maximum; exact main head.
// No product traffic, fallback, retries, or Vercel. Protected CI execution only.
import assert from 'node:assert/strict';
import {createHash,randomInt} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {preregisterD2D3,measureOriginalText,ORDER,MAX_FUTURE_PROVIDER_CALLS} from './d2-d3-eight-prereg.mjs';
import {buildDIngressFactorLadder} from './d-ingress-ladder.mjs';
import {serializeGeminiRequest} from '../../server/khonapolit-quality.js';
import {decodeGoogleSse} from './d0-d1-original-sse-once.mjs';
import {geminiStreamGenerateContentUrl,geminiRequestHeaders} from '../../server/gemini-provider-transport.js';

export const SCHEMA='td613.marrowline.d2d3-original-sse-eight-once/v1';
export const ACTIVATION='research(marrowline): execute frozen D2 D3 original SSE eight once on main';
export const AUTH='EIGHT_ORIGINAL_SSE_EXACT_MAIN_FIRST_ATTEMPT';
const MAX_SSE_BYTES=6_000_000;
const MAX_TOKENS_PER_RETURN=20_000;
const TIMEOUT_MS=170_000;
const sha=b=>createHash('sha256').update(b).digest('hex');

export function verifyFrozenPlan(){
  const frozen=preregisterD2D3();
  const {model,d2,d3}=buildDIngressFactorLadder();
  assert.equal(model,'gemini-3.8-flash');
  assert.equal(frozen.state,'HELD_NOT_AUTHORIZED');
  assert.deepEqual(frozen.plannedOrder,ORDER);
  assert.equal(ORDER.length,MAX_FUTURE_PROVIDER_CALLS);
  const serialized={D2:serializeGeminiRequest(d2,model),D3:serializeGeminiRequest(d3,model)};
  for(const arm of ['D2','D3']){
    assert.equal(serialized[arm].observation.bodySha256,frozen.armObservations[arm].bodySha256);
    assert.equal(serialized[arm].observation.contentsSha256,frozen.armObservations[arm].contentsSha256);
    assert.equal(serialized[arm].observation.generationConfigSha256,frozen.armObservations[arm].generationConfigSha256);
  }
  assert.equal(serialized.D2.observation.contentsSha256,serialized.D3.observation.contentsSha256);
  assert.equal(serialized.D2.observation.generationConfigSha256,serialized.D3.observation.generationConfigSha256);
  for(let i=0;i<ORDER.length;i++){
    assert.equal(frozen.runPlan[i].requestBodySha256,serialized[ORDER[i]].observation.bodySha256);
  }
  return {frozen,model,serialized};
}
export function pairSummary(records){
  return [0,1,2,3].map(i=>{
    const slots=records.filter(x=>x.pair===i+1);
    if(slots.length!==2||slots.some(x=>x.holdReason||!x.measurement))
      return {pair:i+1,complete:false};
    const a=slots.find(x=>x.arm==='D2'),b=slots.find(x=>x.arm==='D3');
    if(!a||!b)return {pair:i+1,complete:false};
    const diff=(x,y)=>x===null||y===null||x===undefined||y===undefined?null:y-x;
    const sm=x=>x.measurement.wholeTextMorphology.stackedAmongMarked;
    const sl=x=>x.measurement.wholeTextMorphology.slashFamilyAmongCombining;
    return {pair:i+1,complete:true,order:slots.map(x=>x.arm),
      d3MinusD2StackShare:diff(sm(a),sm(b)),
      d3MinusD2SlashShare:diff(sl(a),sl(b)),
      d3MinusD2ExactHeading:Number(b.measurement.exactHeadings)-Number(a.measurement.exactHeadings),
      d3MinusD2TwoNonemptyVoices:Number(b.measurement.nonemptyTwoVoices)-Number(a.measurement.nonemptyTwoVoices),
      d3MinusD2MinimumVoiceStackShare:diff(a.measurement.minVoiceStackShare,b.measurement.minVoiceStackShare)};
  });
}
function hardGate(){
  assert.equal(process.env.TD613_D2D3_AUTH,AUTH);
  assert.equal(process.env.GITHUB_EVENT_NAME,'push');
  assert.equal(process.env.GITHUB_REF,'refs/heads/main');
  assert.equal(process.env.GITHUB_ACTOR,'tauric-diana-613');
  assert.equal(process.env.GITHUB_RUN_ATTEMPT,'1');
  assert.match(process.env.TD613_D2D3_EXACT_HEAD||'',/^[a-f0-9]{40}$/);
  assert.equal(process.env.GITHUB_SHA,process.env.TD613_D2D3_EXACT_HEAD);
  assert.equal(execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),process.env.GITHUB_SHA);
  assert.equal(execFileSync('git',['log','-1','--format=%s'],{encoding:'utf8'}).trim(),ACTIVATION);
}
function shuffle(entries){
  const copy=entries.slice();
  for(let i=copy.length-1;i>0;i--){
    const j=randomInt(i+1);
    [copy[i],copy[j]]=[copy[j],copy[i]];
  }
  return copy;
}
export async function acquireEight(){
  hardGate();
  const {frozen,model,serialized}=verifyFrozenPlan();
  const folder=process.env.TD613_D2D3_EVIDENCE_DIR;
  assert.ok(typeof folder==='string'&&folder.length>1,'EVIDENCE_DIR_REQUIRED');
  const dir=resolve(folder);
  await mkdir(dir,{recursive:true});
  const manifest={schema:SCHEMA,state:'HELD',sourceHead:process.env.GITHUB_SHA,
    runId:process.env.GITHUB_RUN_ID,runAttempt:process.env.GITHUB_RUN_ATTEMPT,
    branch:'refs/heads/main',model,thinkingLevel:'medium',
    startedAt:new Date().toISOString(),
    maxProviderCalls:MAX_FUTURE_PROVIDER_CALLS,automatedRetries:0,
    plannedOrder:[...ORDER],sourceParent:frozen.historicalParent,
    requestObservations:frozen.armObservations,evidence:[],
    caveat:'Synthetic conflicting-instruction assay; eight stochastic calls do not prove a unique causal mechanism or complete production restoration.'};
  const save=()=>writeFile(join(dir,'manifest.json'),JSON.stringify(manifest,null,2),{mode:0o600});
  await save();
  const key=process.env.GEMINI_API_KEY;
  if(!key||key.trim().length<8){
    manifest.holdReason='PROTECTED_GEMINI_CREDENTIAL_ABSENT';await save();return manifest;
  }
  const texts=[];
  for(const {sequence,pair,arm,requestBodySha256} of frozen.runPlan){
    assert.ok(manifest.evidence.length<MAX_FUTURE_PROVIDER_CALLS,'EIGHT_CALL_CAP');
    const rec={sequence,pair,arm,requestBodySha256,callDispatched:true,
      dispatchedAt:new Date().toISOString()};
    manifest.evidence.push(rec);await save();
    try{
      const res=await fetch(geminiStreamGenerateContentUrl(model),{
        method:'POST',headers:geminiRequestHeaders(key),
        body:serialized[arm].body,signal:AbortSignal.timeout(TIMEOUT_MS)
      });
      rec.httpStatus=res.status;
      const bytes=Buffer.from(await res.arrayBuffer());
      rec.originalSseBytes=bytes.length;
      if(bytes.length>MAX_SSE_BYTES)rec.holdReason='ORIGINAL_SSE_EXCEEDS_LIMIT';
      else if(res.status!==200){
        rec.holdReason='PROVIDER_NON_200';
        rec.providerErrorSha256=sha(bytes);
      }else{
        const file=String(sequence).padStart(2,'0')+'-'+arm+'.google-original.sse';
        await writeFile(join(dir,file),bytes,{mode:0o600});
        const decoded=decodeGoogleSse(bytes);
        rec.originalSseFile=file;
        rec.originalSseSha256=sha(bytes);
        rec.originalSseEventCount=decoded.events;
        rec.outputTextSha256=sha(Buffer.from(decoded.text,'utf8'));
        rec.servedModel=decoded.model;
        rec.finishReason=decoded.finish;
        rec.usage=decoded.usage;
        rec.measurement=measureOriginalText(decoded.text);
        if(decoded.model!==model||decoded.finish!=='STOP'||!decoded.gotCandidate||!decoded.events||!decoded.text.length)
          rec.holdReason='UPSTREAM_SSE_INCOMPLETE_WRONG_MODEL_OR_NONSTOP';
        if((decoded.usage?.totalTokenCount??Infinity)>MAX_TOKENS_PER_RETURN)
          rec.holdReason='RETURN_TOKEN_BUDGET_EXCEEDED';
        if(!rec.holdReason){
          texts.push({sequence,arm,text:decoded.text,textSha256:rec.outputTextSha256});
        }
      }
    }catch(error){
      rec.holdReason='TRANSPORT_OR_CAPTURE_AMBIGUITY';
      rec.errorType=error?.name||'UnknownError';
    }
    rec.completedAt=new Date().toISOString();
    await save();
    if(rec.holdReason){manifest.holdReason=rec.holdReason;break;}
  }
  manifest.pairs=pairSummary(manifest.evidence);
  manifest.state=manifest.evidence.length===8&&manifest.evidence.every(x=>!x.holdReason)
    &&manifest.pairs.every(x=>x.complete)?'OBSERVED_EIGHT_PENDING_BLINDED_ARTISTIC_REVIEW':'HELD';
  if(texts.length){
    const blindDir=join(dir,'blinded-reader-packet');
    await mkdir(blindDir,{recursive:true});
    const keyMap=[];
    for(const [i,x] of shuffle(texts).entries()){
      const name='Sample-'+String(i+1).padStart(2,'0')+'.txt';
      await writeFile(join(blindDir,name),x.text,{mode:0o600});
      keyMap.push({name,sequence:x.sequence,arm:x.arm,textSha256:x.textSha256});
    }
    await writeFile(join(dir,'sealed-blinding-key.json'),JSON.stringify(keyMap,null,2),{mode:0o600});
    manifest.blindedSamplesCreated=keyMap.length;
  }
  manifest.completedAt=new Date().toISOString();
  await save();
  return manifest;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  if(process.argv.includes('--execute')){
    if(!process.argv.includes('--ack-eight-paid-calls'))throw Error('EIGHT_PAID_CALL_ACK_REQUIRED');
    acquireEight().then(m=>{
      // Structured metrics only. Original text and arm-blinding key remain private artifacts.
      process.stdout.write('D2D3_EIGHT_RESULT '+JSON.stringify({
        state:m.state,sourceHead:m.sourceHead,runId:m.runId,order:m.plannedOrder,
        evidence:m.evidence,pairs:m.pairs,holdReason:m.holdReason||null,
        blindedSamplesCreated:m.blindedSamplesCreated||0
      })+'\n');
      if(m.state!=='OBSERVED_EIGHT_PENDING_BLINDED_ARTISTIC_REVIEW')process.exitCode=1;
    }).catch(e=>{console.error('D2D3_EXACT_HEAD_GATE '+(e?.name||'Error'));process.exitCode=1;});
  }else{
    const p=verifyFrozenPlan();
    process.stdout.write(JSON.stringify({schema:SCHEMA,mode:'OFFLINE_ONLY',
      order:[...ORDER],maxProviderCalls:MAX_FUTURE_PROVIDER_CALLS,
      model:p.model,requestObservations:p.frozen.armObservations},null,2)+'\n');
  }
}
