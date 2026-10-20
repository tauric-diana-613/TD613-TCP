// 𝌋 TD613 · D1→D2 fresh episode 2; original four-arm request bytes preserved.
// Sixteen original Google SSE requests maximum, exactly once on the protected
// exact-main, first-attempt merge event. Never a production API or product route.
import assert from 'node:assert/strict';
import {createHash,randomInt} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {frozenFullVoiceManifest,buildFullVoiceRequests,ARMS,ORDER,MODEL} from './full-voice-current-restored-offline.mjs';
import {serializeGeminiRequest} from '../../server/khonapolit-quality.js';
import {measureOriginalText} from '../marrowline-d-ingress-factor-ladder-20261019/d2-d3-eight-prereg.mjs';
import {decodeGoogleSse} from '../marrowline-d-ingress-factor-ladder-20261019/d0-d1-original-sse-once.mjs';
import {observeGoogleSseTerminal} from '../marrowline-d-ingress-factor-ladder-20261019/d1d2-terminal-feedback-observer.mjs';
import {geminiStreamGenerateContentUrl,geminiRequestHeaders} from '../../server/gemini-provider-transport.js';

export const SCHEMA='td613.marrowline.full-dual-voice-original-google-sse-twelve/v1';
export const ACTIVATION='research(marrowline): execute early October full voice twelve SSE once on main';
export const AUTH='MARROWLINE_FULL_VOICE_12_EXACT_MAIN_FIRST_ATTEMPT';
export const CALL_CAP=12;
const MAX_SSE_BYTES=6_000_000;
const MAX_TOKENS_PER_RETURN=25_000;
const MAX_TOTAL_TOKENS=300_000;
const TIMEOUT_MS=170_000;
const hash=b=>createHash('sha256').update(b).digest('hex');

export function verifyFrozenTwelve(){
 const prereg=frozenFullVoiceManifest();
 const {requests,observations}=buildFullVoiceRequests();
 assert.equal(prereg.state,'SOURCE_ONLY_NO_PROVIDER_EXECUTION');
 assert.equal(prereg.model,MODEL);
 assert.equal(prereg.maxIfSeparatelyAuthorized,CALL_CAP);
 assert.deepEqual(prereg.order,[...ORDER]);
 const serialized=Object.fromEntries(ARMS.map(a=>[a,serializeGeminiRequest(requests[a],MODEL)]));
 for(const arm of ARMS){
  assert.deepEqual(serialized[arm].observation,prereg.armObservations[arm],'REQUEST_DRIFT_'+arm);
  assert.deepEqual(serialized[arm].observation,observations[arm]);
 }
 for(const x of prereg.orderedSlots)assert.equal(x.requestBodySha256,serialized[x.arm].observation.bodySha256);
 return {prereg,model:MODEL,serialized};
}
const delta=(a,b)=>a==null||b==null?null:b-a;
export function blockSummary(records){
 return [1,2,3].map(block=>{
  const rows=records.filter(r=>r.block===block);
  if(rows.length!==4||rows.some(r=>r.holdReason||!r.measurement))return {block,complete:false};
  const by=Object.fromEntries(rows.map(r=>[r.arm,r]));
  if(ARMS.some(arm=>!by[arm]))return {block,complete:false};
  const voice=arm=>by[arm].measurement.voiceMorphology?.[1]?.stackedAmongMarked??null;
  return {block,complete:true,order:rows.map(r=>r.arm),
   farceRestoredMinusCurrentBotsStack:delta(voice('CURRENT_FARCE'),voice('RESTORED_FARCE')),
   forensicRestoredMinusCurrentBotsStack:delta(voice('CURRENT_FORENSIC'),voice('RESTORED_FORENSIC')),
   farceStructural:{current:by.CURRENT_FARCE.measurement.nonemptyTwoVoices,restored:by.RESTORED_FARCE.measurement.nonemptyTwoVoices},
   forensicStructural:{current:by.CURRENT_FORENSIC.measurement.nonemptyTwoVoices,restored:by.RESTORED_FORENSIC.measurement.nonemptyTwoVoices}
  };
 });
}

function hardGate(){
  assert.equal(process.env.TD613_FULL_VOICE_12_AUTH,AUTH);
  assert.equal(process.env.GITHUB_EVENT_NAME,'push');
  assert.equal(process.env.GITHUB_REF,'refs/heads/main');
  assert.equal(process.env.GITHUB_ACTOR,'tauric-diana-613');
  assert.equal(process.env.GITHUB_RUN_ATTEMPT,'1');
  assert.match(process.env.TD613_FULL_VOICE_12_EXACT_HEAD||'',/^[a-f0-9]{40}$/);
  assert.equal(process.env.GITHUB_SHA,process.env.TD613_FULL_VOICE_12_EXACT_HEAD);
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
export async function acquireTwelve(){
  hardGate();
  const {prereg,model,serialized}=verifyFrozenTwelve();
  const target=process.env.TD613_FULL_VOICE_12_EVIDENCE_DIR;
  assert.ok(typeof target==='string'&&target.length>1,'EVIDENCE_DIR_REQUIRED');
  const dir=resolve(target);
  await mkdir(dir,{recursive:true});
  const manifest={
    schema:SCHEMA,state:'HELD',episode:'EARLY_OCTOBER_FULL_VOICE_TWELVE',
    priorCapabilityEpisode:{runId:'39367182083',class:'synthetic-creative-morphology-only'},
    sourceHead:process.env.GITHUB_SHA,
    runId:process.env.GITHUB_RUN_ID,runAttempt:process.env.GITHUB_RUN_ATTEMPT,
    branch:'refs/heads/main',model,thinkingLevel:'medium',
    startedAt:new Date().toISOString(),maxProviderCalls:CALL_CAP,
    maxTotalProviderTokens:MAX_TOTAL_TOKENS,automatedRetries:0,
    plannedOrder:[...prereg.order],sourceParent:prereg.sourceParent,
    requestObservations:prereg.armObservations,taskHashes:prereg.taskHashes,evidence:[],
    caveat:'Real full Marrowline request frames with current versus reconstructed Oct 2 style instructions. RESTORED is a modern hybrid. Morphology and headings cannot establish literary quality.'
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
  for(const {slot,block,arm,requestBodySha256} of prereg.orderedSlots){
    const ordinal=slot,position=(slot-1)%4+1;
    assert.ok(manifest.evidence.length<CALL_CAP,'TWELVE_CALL_CAP');
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
      ?'OBSERVED_TWELVE_PENDING_BLIND_ARTISTIC_REVIEW':'HELD';
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
      'TD613 Screaming Grove independent blind artistic review: two readers, each score Kʰonapolit inference specificity, high-academia comic wit, Tauric Diana bots distinct choral personality, handoff/new dramatic consequence, native typography integrated as voice, and sustained theatrical continuity. Score each category 0–5, N/A if missing. Heading compliance and diacritics are separate objective measures. Each reader sign/date scores before unblinding; never share the sealed arm key during review.\n',{mode:0o600});
    manifest.blindedSamplesCreated=key.length;
  }
  manifest.completedAt=new Date().toISOString();
  await save();
  return manifest;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  if(process.argv.includes('--execute')){
    if(!process.argv.includes('--ack-twelve-paid-calls'))
      throw Error('TWELVE_PAID_CALL_ACK_REQUIRED');
    acquireTwelve().then(m=>{
      // Only scalar instrument findings enter the public log. Original complete text
      // and the independent reader assignment key remain in the protected artifact.
      process.stdout.write('FULL_VOICE_TWELVE_RESULT '+JSON.stringify({
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
      if(m.state!=='OBSERVED_TWELVE_PENDING_BLIND_ARTISTIC_REVIEW')process.exitCode=1;
    }).catch(err=>{console.error('FULL_VOICE_SOURCE_GATE '+(err?.name||'Error'));process.exitCode=1;});
  }else{
    const p=verifyFrozenTwelve();
    process.stdout.write(JSON.stringify({
      schema:SCHEMA,mode:'OFFLINE_ONLY',order:p.prereg.order,
      maxProviderCalls:CALL_CAP,model:p.model,requestObservations:p.prereg.armObservations
    },null,2)+'\n');
  }
}
