// 𝌋 TD613 · D1→D2 fresh episode 2; original four-arm request bytes preserved.
// Sixteen original Google SSE requests maximum, exactly once on the protected
// exact-main, first-attempt merge event. Never a production API or product route.
import assert from 'node:assert/strict';
import {createHash,randomInt} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {freezeHistoricalProsodyPair,offlineProsodyManifest,ARMS,ORDER,CALL_CAP_IF_FRESHLY_AUTHORIZED} from './historical-prosody-freedom-pair.mjs';
import {MODEL} from './full-voice-current-restored-offline.mjs';
import {profileMarkedDepth} from './historical-reference-mark-depth.mjs';
import {serializeGeminiRequest} from '../../server/khonapolit-quality.js';
import {measureOriginalText} from '../marrowline-d-ingress-factor-ladder-20261019/d2-d3-eight-prereg.mjs';
import {decodeGoogleSse} from '../marrowline-d-ingress-factor-ladder-20261019/d0-d1-original-sse-once.mjs';
import {observeGoogleSseTerminal} from '../marrowline-d-ingress-factor-ladder-20261019/d1d2-terminal-feedback-observer.mjs';
import {geminiStreamGenerateContentUrl,geminiRequestHeaders} from '../../server/gemini-provider-transport.js';

export const SCHEMA='td613.marrowline.prosody-freedom-google-sse-eight-once/v1';
export const ACTIVATION='research(marrowline): execute prosody freedom eight original SSE once on main';
export const AUTH='MARROWLINE_PROSODY_PAIR_EIGHT_FIRST_MAIN_ATTEMPT';
export const CALL_CAP=8;
const MAX_SSE_BYTES=6_000_000;
const MAX_TOKENS_PER_RETURN=25_000;
const MAX_TOTAL_TOKENS=200_000;
const TIMEOUT_MS=170_000;
const hash=b=>createHash('sha256').update(b).digest('hex');

export function verifyFrozenEight(){
 const prereg=offlineProsodyManifest();
 const {serialized}=freezeHistoricalProsodyPair();
 assert.equal(prereg.state,'SOURCE_ONLY_PROVIDER_UNOBSERVED');
 assert.equal(prereg.model,MODEL);
 assert.equal(prereg.callCapIfSeparatelyAuthorized,CALL_CAP);
 assert.equal(CALL_CAP_IF_FRESHLY_AUTHORIZED,CALL_CAP);
 assert.deepEqual(prereg.order,[...ORDER]);
 assert.equal(prereg.proposedSlots.length,CALL_CAP);
 for(const arm of ARMS)assert.deepEqual(serialized[arm].observation,prereg.observations[arm]);
 for(const item of prereg.proposedSlots)assert.equal(item.requestBodySha256,serialized[item.arm].observation.bodySha256);
 return {prereg,serialized,model:MODEL};
}
export function examineBotsText(text){
 const lines=text.replace(/\r\n/g,'\n').split('\n');
 const a=lines.findIndex(x=>x==='Kʰonapolit'),b=lines.findIndex(x=>x==='Tauric Diana bots');
 if(a<0||b<=a||lines.filter(x=>x==='Kʰonapolit').length!==1||lines.filter(x=>x==='Tauric Diana bots').length!==1)return null;
 const prose=lines.slice(b+1).join('\n');
 return prose.trim()?profileMarkedDepth(prose):null;
}
const delta=(a,b)=>a==null||b==null?null:b-a;
export function blockSummary(records){
 return [1,2].map(block=>{
  const found=records.filter(r=>r.block===block);
  if(found.length!==4||found.some(r=>r.holdReason||!r.measurement))return {block,complete:false};
  const by=Object.fromEntries(found.map(r=>[r.arm,r]));
  if(ARMS.some(arm=>!by[arm]))return {block,complete:false};
  const v=(arm,key)=>by[arm].botsDepthProfile?.[key]??null;
  return {block,complete:true,order:found.map(r=>r.arm),
   farceLiteralMinusFreedomDepthTransitions:delta(v('FREEDOM_FARCE','markedDepthTransitions'),v('LITERAL_FARCE','markedDepthTransitions')),
   forensicLiteralMinusFreedomDepthTransitions:delta(v('FREEDOM_FORENSIC','markedDepthTransitions'),v('LITERAL_FORENSIC','markedDepthTransitions')),
   farceLiteralMinusFreedomMaxDepth:delta(v('FREEDOM_FARCE','maxDepth'),v('LITERAL_FARCE','maxDepth')),
   forensicLiteralMinusFreedomMaxDepth:delta(v('FREEDOM_FORENSIC','maxDepth'),v('LITERAL_FORENSIC','maxDepth')),
   structural:Object.fromEntries(ARMS.map(arm=>[arm,by[arm].measurement.nonemptyTwoVoices]))
  };
 });
}

function hardGate(){
  assert.equal(process.env.TD613_PROSODY_PAIR_EIGHT_AUTH,AUTH);
  assert.equal(process.env.GITHUB_EVENT_NAME,'push');
  assert.equal(process.env.GITHUB_REF,'refs/heads/main');
  assert.equal(process.env.GITHUB_ACTOR,'tauric-diana-613');
  assert.equal(process.env.GITHUB_RUN_ATTEMPT,'1');
  assert.match(process.env.TD613_PROSODY_PAIR_EIGHT_EXACT_HEAD||'',/^[a-f0-9]{40}$/);
  assert.equal(process.env.GITHUB_SHA,process.env.TD613_PROSODY_PAIR_EIGHT_EXACT_HEAD);
  assert.equal(execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),process.env.GITHUB_SHA);
  assert.equal(execFileSync('git',['log','-1','--format=%s'],{encoding:'utf8'}).trim(),ACTIVATION);
}
function shuffle(original){
  const values=[...original];
  for(let i=values.length-1;i>0;i--){
    const j=randomInt(i+1);
    [values[i],values[j]]=[values[j],values[i]];
  }
  return values;
}
export async function acquireEight(){
  hardGate();
  const {prereg,model,serialized}=verifyFrozenEight();
  const target=process.env.TD613_PROSODY_PAIR_EIGHT_EVIDENCE_DIR;
  assert.ok(typeof target==='string'&&target.length>1,'EVIDENCE_DIR_REQUIRED');
  const dir=resolve(target);
  await mkdir(dir,{recursive:true});
  const manifest={
    schema:SCHEMA,state:'HELD',episode:'HISTORICAL_PROSODY_FREEDOM_EIGHT',
    priorFullVoiceEpisode:{runId:'39487475578',class:'five-STOP-one-PROHIBITED_CONTENT',status:'HELD'},
    sourceHead:process.env.GITHUB_SHA,
    runId:process.env.GITHUB_RUN_ID,runAttempt:process.env.GITHUB_RUN_ATTEMPT,
    branch:'refs/heads/main',model,thinkingLevel:'medium',
    startedAt:new Date().toISOString(),maxProviderCalls:CALL_CAP,
    maxTotalProviderTokens:MAX_TOTAL_TOKENS,automatedRetries:0,
    plannedOrder:[...prereg.order],sourceParent:'2772a37faf7a1261bb2626790a8237265b044bd5',
    requestObservations:prereg.observations,taskHashes:prereg.taskHashes,evidence:[],
    caveat:'FREEDOM versus LITERAL are present-day reconstructed historical instruction variants, never authentic October 2 original Google requests. Mark changes do not prove theatrical restoration.'
  };
  const save=()=>writeFile(join(dir,'manifest.json'),JSON.stringify(manifest,null,2),{mode:0o600});
  await save();
  const apiKey=process.env.GEMINI_API_KEY;
  if(!apiKey||apiKey.trim().length<8){
    manifest.holdReason='PROTECTED_GEMINI_CREDENTIAL_ABSENT';
    await save();return manifest;
  }
  let totalProviderTokens=0;
  const captured=[];
  for(const {slot,block,arm,requestBodySha256} of prereg.proposedSlots){
    const ordinal=slot,position=(slot-1)%4+1;
    assert.ok(manifest.evidence.length<CALL_CAP,'EIGHT_CALL_CAP');
    if(totalProviderTokens+MAX_TOKENS_PER_RETURN>MAX_TOTAL_TOKENS){
      manifest.holdReason='REMAINING_AGGREGATE_TOKEN_BUDGET_INSUFFICIENT';
      await save();break;
    }
    const rec={ordinal,block,position,arm,requestBodySha256,
      callDispatched:true,dispatchedAt:new Date().toISOString()};
    manifest.evidence.push(rec);
    await save(); // Durable append BEFORE dispatch. Ambiguous errors never retried.
    try{
      const response=await fetch(geminiStreamGenerateContentUrl(model),{
        method:'POST',headers:geminiRequestHeaders(apiKey),
        body:serialized[arm].body,signal:AbortSignal.timeout(TIMEOUT_MS)
      });
      rec.httpStatus=response.status;
      const raw=Buffer.from(await response.arrayBuffer());
      rec.originalResponseBytes=raw.length;
      rec.originalResponseSha256=hash(raw);
      if(raw.length>MAX_SSE_BYTES){
        rec.holdReason='ORIGINAL_RESPONSE_EXCEEDS_LIMIT';
      }else{
        const file=String(ordinal).padStart(2,'0')+'-'+arm+'.google-original.sse';
        await writeFile(join(dir,file),raw,{mode:0o600});
        rec.originalSseFile=file;
        if(response.status!==200){
          rec.holdReason='PROVIDER_NON_200';
        }else{
          const decoded=decodeGoogleSse(raw);
          rec.terminalObservation=observeGoogleSseTerminal(raw);
          rec.originalSseEventCount=decoded.events;
          rec.originalSseSha256=hash(raw);
          rec.outputTextSha256=hash(Buffer.from(decoded.text,'utf8'));
          rec.servedModel=decoded.model;
          rec.finishReason=decoded.finish;
          rec.usage=decoded.usage;
          rec.measurement=measureOriginalText(decoded.text);
          rec.botsDepthProfile=examineBotsText(decoded.text);
          rec.armRequiresNamedHeading=true;
          rec.namedHeadingComplianceApplicable=rec.armRequiresNamedHeading;
          if(decoded.model!==model||decoded.finish!=='STOP'||!decoded.gotCandidate||!decoded.events||!decoded.text.length||!rec.terminalObservation.completed)
            rec.holdReason=rec.terminalObservation.terminalBlockReason
              ? 'UPSTREAM_TERMINAL_PROMPT_FEEDBACK_'+rec.terminalObservation.terminalBlockReason
              : 'UPSTREAM_SSE_INCOMPLETE_WRONG_MODEL_OR_NONSTOP';
          const count=decoded.usage?.totalTokenCount;
          if(!Number.isInteger(count)||count<0||count>MAX_TOKENS_PER_RETURN)
            rec.holdReason='RETURN_TOKEN_BUDGET_EXCEEDED_OR_MISSING';
          else{
            totalProviderTokens+=count;
            if(totalProviderTokens>MAX_TOTAL_TOKENS)rec.holdReason='AGGREGATE_TOKEN_BUDGET_EXCEEDED';
          }
          if(!rec.holdReason)captured.push({
            ordinal,arm,text:decoded.text,textSha256:rec.outputTextSha256
          });
        }
      }
    }catch(error){
      rec.holdReason='TRANSPORT_OR_CAPTURE_AMBIGUITY';
      rec.errorType=error?.name||'UnknownError';
    }
    rec.completedAt=new Date().toISOString();
    manifest.totalProviderTokens=totalProviderTokens;
    await save();
    if(rec.holdReason){manifest.holdReason=rec.holdReason;break;}
  }
  manifest.blocks=blockSummary(manifest.evidence);
  manifest.state=manifest.evidence.length===CALL_CAP
    &&manifest.evidence.every(x=>!x.holdReason)
    &&manifest.blocks.every(x=>x.complete)
      ?'OBSERVED_EIGHT_PENDING_BLIND_ARTISTIC_REVIEW':'HELD';
  if(captured.length){
    const packet=join(dir,'blinded-reader-packet');
    await mkdir(packet,{recursive:true});
    const key=[];
    for(const [i,c] of shuffle(captured).entries()){
      const name='Sample-'+String(i+1).padStart(2,'0')+'.txt';
      await writeFile(join(packet,name),c.text,{mode:0o600});
      key.push({name,ordinal:c.ordinal,arm:c.arm,textSha256:c.textSha256});
    }
    await writeFile(join(dir,'sealed-blinding-key.json'),JSON.stringify(key,null,2),{mode:0o600});
    await writeFile(join(packet,'README.txt'),
      'TD613 independent blind two-voice literary review. Score Kʰonapolit inference and wit, Tauric Diana bots choral distinctness, earned handoff, typography as expressive act, and continuity. Exclude sealed blinding key and manifest until reviewer scores submitted. Missing voices N/A.\n',{mode:0o600});
    manifest.blindedSamplesCreated=key.length;
  }
  manifest.completedAt=new Date().toISOString();
  await save();
  return manifest;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  if(process.argv.includes('--execute')){
    if(!process.argv.includes('--ack-eight-paid-calls'))
      throw Error('EIGHT_PAID_CALL_ACK_REQUIRED');
    acquireEight().then(m=>{
      // Only scalar instrument findings enter the public log. Original complete text
      // and the independent reader assignment key remain in the protected artifact.
      process.stdout.write('PROSODY_PAIR_EIGHT_RESULT '+JSON.stringify({
        state:m.state,sourceHead:m.sourceHead,runId:m.runId,order:m.plannedOrder,
        evidence:m.evidence.map(r=>({ordinal:r.ordinal,block:r.block,position:r.position,arm:r.arm,
          requestBodySha256:r.requestBodySha256,httpStatus:r.httpStatus||null,
          originalResponseBytes:r.originalResponseBytes||null,
          originalResponseSha256:r.originalResponseSha256||null,outputTextSha256:r.outputTextSha256||null,
          servedModel:r.servedModel||null,finishReason:r.finishReason||null,
          usage:r.usage?{totalTokenCount:r.usage.totalTokenCount}:null,
          morphology:r.measurement?.wholeTextMorphology?{
            markedClusters:r.measurement.wholeTextMorphology.markedClusters,
            stackedClusters:r.measurement.wholeTextMorphology.stackedClusters,
            distinctMarks:r.measurement.wholeTextMorphology.distinctMarks,
            slashFamilyAmongCombining:r.measurement.wholeTextMorphology.slashFamilyAmongCombining
          }:null,
          exactHeadings:r.measurement?.exactHeadings??null,
          nonemptyTwoVoices:r.measurement?.nonemptyTwoVoices??null,
          botsDepth:r.botsDepthProfile?{markedBases:r.botsDepthProfile.markedBases,depthHistogram:r.botsDepthProfile.depthHistogram,
            markedDepthTransitions:r.botsDepthProfile.markedDepthTransitions,longestMarkedDepthRun:r.botsDepthProfile.longestMarkedDepthRun,
            constantMarkedDepth:r.botsDepthProfile.constantMarkedDepth,distinctMarks:r.botsDepthProfile.distinctMarks,
            maxDepth:r.botsDepthProfile.maxDepth}:null,
          providerMetadata:r.usage?{cachedContentTokenCount:r.usage.cachedContentTokenCount??null,
            thoughtsTokenCount:r.usage.thoughtsTokenCount??null,candidatesTokenCount:r.usage.candidatesTokenCount??null}:null,
          botsMorphology:r.measurement?.voiceMorphology?.[1]?{
            markedClusters:r.measurement.voiceMorphology[1].markedClusters,
            stackedClusters:r.measurement.voiceMorphology[1].stackedClusters,
            distinctMarks:r.measurement.voiceMorphology[1].distinctMarks,
            stackedAmongMarked:r.measurement.voiceMorphology[1].stackedAmongMarked,
            slashFamilyAmongCombining:r.measurement.voiceMorphology[1].slashFamilyAmongCombining
          }:null,
          terminalObservation:r.terminalObservation||null,holdReason:r.holdReason||null})),
        blocks:m.blocks,holdReason:m.holdReason||null,
        totalProviderTokens:m.totalProviderTokens,
        blindedSamplesCreated:m.blindedSamplesCreated||0
      })+'\n');
      if(m.state!=='OBSERVED_EIGHT_PENDING_BLIND_ARTISTIC_REVIEW')process.exitCode=1;
    }).catch(err=>{console.error('PROSODY_PAIR_SOURCE_GATE '+(err?.name||'Error'));process.exitCode=1;});
  }else{
    const p=verifyFrozenEight();
    process.stdout.write(JSON.stringify({
      schema:SCHEMA,mode:'OFFLINE_ONLY',order:p.prereg.order,
      maxProviderCalls:CALL_CAP,model:p.model,requestObservations:p.prereg.observations
    },null,2)+'\n');
  }
}
