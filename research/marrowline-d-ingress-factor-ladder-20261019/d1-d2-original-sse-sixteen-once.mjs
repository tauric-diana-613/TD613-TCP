// 𝌋 TD613 · D1→D2 section/identity/prohibition factorial boundary.
// Sixteen original Google SSE requests maximum, exactly once on the protected
// exact-main, first-attempt merge event. Never a production API or product route.
import assert from 'node:assert/strict';
import {createHash,randomInt} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {
  preregisterD1D2Boundary,buildD1D2BoundaryArms,ARMS,BLOCKS
} from './d1-d2-boundary-factor-prereg.mjs';
import {measureOriginalText} from './d2-d3-eight-prereg.mjs';
import {decodeGoogleSse} from './d0-d1-original-sse-once.mjs';
import {geminiStreamGenerateContentUrl,geminiRequestHeaders} from '../../server/gemini-provider-transport.js';

export const SCHEMA='td613.marrowline.d1d2-original-google-sse-sixteen-once/v1';
export const ACTIVATION='research(marrowline): execute frozen D1 D2 original SSE sixteen once on main';
export const AUTH='D1D2_SIXTEEN_EXACT_MAIN_FIRST_ATTEMPT';
export const CALL_CAP=16;
const MAX_SSE_BYTES=6_000_000;
const MAX_TOKENS_PER_RETURN=20_000;
const MAX_TOTAL_TOKENS=320_000;
const TIMEOUT_MS=170_000;
const hash=b=>createHash('sha256').update(b).digest('hex');

export function verifyFrozenSixteen(){
  const p=preregisterD1D2Boundary();
  const {model,serialized}=buildD1D2BoundaryArms();
  assert.equal(p.state,'HELD_NOT_AUTHORIZED');
  assert.equal(model,p.model);
  assert.equal(model,'gemini-3.8-flash');
  assert.equal(p.thinkingLevel,'medium');
  assert.equal(p.capIfSeparatelyAuthorized,CALL_CAP);
  assert.equal(p.plannedOrder.length,CALL_CAP);
  assert.deepEqual(p.plannedOrder,BLOCKS.flat());
  for(const arm of ARMS){
    const actual=serialized[arm].observation,expected=p.requestObservations[arm];
    assert.equal(actual.bodySha256,expected.bodySha256);
    assert.equal(actual.systemInstructionSha256,expected.systemInstructionSha256);
    assert.equal(actual.contentsSha256,expected.contentsSha256);
    assert.equal(actual.generationConfigSha256,expected.generationConfigSha256);
  }
  for(const s of p.proposedSlots)
    assert.equal(s.requestBodySha256,serialized[s.arm].observation.bodySha256);
  return {prereg:p,model,serialized};
}

export function blockSummary(records){
  return [1,2,3,4].map(block=>{
    const found=records.filter(x=>x.block===block);
    if(found.length!==4 || found.some(x=>x.holdReason||!x.measurement))
      return {block,complete:false};
    const byArm=Object.fromEntries(found.map(x=>[x.arm,x]));
    if(ARMS.some(x=>!byArm[x]))return {block,complete:false};
    const value=arm=>byArm[arm].measurement.wholeTextMorphology.stackedAmongMarked;
    const slash=arm=>byArm[arm].measurement.wholeTextMorphology.slashFamilyAmongCombining;
    const diff=(a,b)=>a===null||b===null||a===undefined||b===undefined?null:b-a;
    return {block,complete:true,order:found.map(x=>x.arm),
      sectionMinusD1StackShare:diff(value('D1'),value('SECTION')),
      namedMinusSectionStackShare:diff(value('SECTION'),value('NAMED')),
      d2MinusNamedStackShare:diff(value('NAMED'),value('D2')),
      sectionMinusD1SlashShare:diff(slash('D1'),slash('SECTION')),
      namedMinusSectionSlashShare:diff(slash('SECTION'),slash('NAMED')),
      d2MinusNamedSlashShare:diff(slash('NAMED'),slash('D2'))};
  });
}
function hardGate(){
  assert.equal(process.env.TD613_D1D2_AUTH,AUTH);
  assert.equal(process.env.GITHUB_EVENT_NAME,'push');
  assert.equal(process.env.GITHUB_REF,'refs/heads/main');
  assert.equal(process.env.GITHUB_ACTOR,'tauric-diana-613');
  assert.equal(process.env.GITHUB_RUN_ATTEMPT,'1');
  assert.match(process.env.TD613_D1D2_EXACT_HEAD||'',/^[a-f0-9]{40}$/);
  assert.equal(process.env.GITHUB_SHA,process.env.TD613_D1D2_EXACT_HEAD);
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
export async function acquireSixteen(){
  hardGate();
  const {prereg,model,serialized}=verifyFrozenSixteen();
  const target=process.env.TD613_D1D2_EVIDENCE_DIR;
  assert.ok(typeof target==='string'&&target.length>1,'EVIDENCE_DIR_REQUIRED');
  const dir=resolve(target);
  await mkdir(dir,{recursive:true});
  const manifest={
    schema:SCHEMA,state:'HELD',sourceHead:process.env.GITHUB_SHA,
    runId:process.env.GITHUB_RUN_ID,runAttempt:process.env.GITHUB_RUN_ATTEMPT,
    branch:'refs/heads/main',model,thinkingLevel:'medium',
    startedAt:new Date().toISOString(),maxProviderCalls:CALL_CAP,
    maxTotalProviderTokens:MAX_TOTAL_TOKENS,automatedRetries:0,
    plannedOrder:[...prereg.plannedOrder],sourceParent:prereg.sourceParent,
    requestObservations:prereg.requestObservations,evidence:[],
    caveat:'Contradictory neutral no-headings/no-personas instructions remain unchanged; this is a finite provider experiment, not artistically proven Screaming Grove restoration.'
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
  for(const {ordinal,block,position,arm,requestBodySha256} of prereg.proposedSlots){
    assert.ok(manifest.evidence.length<CALL_CAP,'SIXTEEN_CALL_CAP');
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
          rec.originalSseEventCount=decoded.events;
          rec.originalSseSha256=hash(raw);
          rec.outputTextSha256=hash(Buffer.from(decoded.text,'utf8'));
          rec.servedModel=decoded.model;
          rec.finishReason=decoded.finish;
          rec.usage=decoded.usage;
          rec.measurement=measureOriginalText(decoded.text);
          rec.armRequiresNamedHeading=['NAMED','D2'].includes(arm);
          rec.namedHeadingComplianceApplicable=rec.armRequiresNamedHeading;
          if(decoded.model!==model||decoded.finish!=='STOP'||!decoded.gotCandidate||!decoded.events||!decoded.text.length)
            rec.holdReason='UPSTREAM_SSE_INCOMPLETE_WRONG_MODEL_OR_NONSTOP';
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
      ?'OBSERVED_SIXTEEN_PENDING_BLINDED_ARTISTIC_REVIEW':'HELD';
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
      'TD613 D1-D2 blind artistic review. Score each sample independently, without access to the source manifest or sealed-blinding-key.json. Record creative vitality, distinctiveness, wit, and native typography separately from headings, and mark unspecified/absent speaker identities N/A. Two independent readers must seal scores before unblinding.\n',{mode:0o600});
    manifest.blindedSamplesCreated=key.length;
  }
  manifest.completedAt=new Date().toISOString();
  await save();
  return manifest;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  if(process.argv.includes('--execute')){
    if(!process.argv.includes('--ack-sixteen-paid-calls'))
      throw Error('SIXTEEN_PAID_CALL_ACK_REQUIRED');
    acquireSixteen().then(m=>{
      // Only scalar instrument findings enter the public log. Original complete text
      // and the independent reader assignment key remain in the protected artifact.
      process.stdout.write('D1D2_SIXTEEN_RESULT '+JSON.stringify({
        state:m.state,sourceHead:m.sourceHead,runId:m.runId,order:m.plannedOrder,
        evidence:m.evidence,blocks:m.blocks,holdReason:m.holdReason||null,
        totalProviderTokens:m.totalProviderTokens,
        blindedSamplesCreated:m.blindedSamplesCreated||0
      })+'\n');
      if(m.state!=='OBSERVED_SIXTEEN_PENDING_BLINDED_ARTISTIC_REVIEW')process.exitCode=1;
    }).catch(err=>{console.error('D1D2_GATE '+(err?.name||'Error'));process.exitCode=1;});
  }else{
    const p=verifyFrozenSixteen();
    process.stdout.write(JSON.stringify({
      schema:SCHEMA,mode:'OFFLINE_ONLY',order:p.prereg.plannedOrder,
      maxProviderCalls:CALL_CAP,model:p.model,requestObservations:p.prereg.requestObservations
    },null,2)+'\n');
  }
}
