// TD613 one-shot system-level prosody paragraph ablation through plain-h production khonapolit.
// A and B: SAME model/setting/content/history, one system paragraph present versus absent.
// Do not derive artistic value from mere mark counts; no fallback, retries or local repaint.
import {createHash} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const URL='https://td613.com/api/khonapolit';
const MODEL='gemini-3.8-flash';
const MSG='In a fictional town, a committee counts only returned forms and concludes that every silent resident is content. Locate the denominator error, pursue its consequence, and complete the connected Kʰonapolit and Tauric Diana bots movements. Let the voices author their own prose and native typography.';
const body={message:MSG,history:[],mode:'issued-conjunction',shi:'',waiveIssuance:true};
const variants=[{id:'A_FULL_SYSTEM',ablation:false},{id:'B_ONE_PARAGRAPH_REMOVED',ablation:true}];
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const OUT=process.env.TD613_SYSTEM_ABLATION_OUT;
const cap=2;
const timeout=210000;
function extractOriginalSse(bytes) {
 const source=bytes.toString('utf8');
 let text='',events=0,parts=0,finish=null,version=null;
 for(const block of source.split(/\r?\n\r?\n/)){
  const data=block.split(/\r?\n/).filter(row=>row.startsWith('data:')).map(row=>row.slice(5).trimStart()).join('\n');
  if(!data||data==='[DONE]')continue;
  const event=JSON.parse(data);events+=1;
  version=event?.modelVersion??version;
  const candidate=event?.candidates?.[0];
  finish=candidate?.finishReason??finish;
  for(const part of candidate?.content?.parts||[])if(typeof part.text==='string'&&part.thought!==true){text+=part.text;parts+=1;}
 }
 return {text,events,parts,finish,version};
}
function morphology(text){
 const match=String(text).match(/(?:^|\n)[ \t]*Tauric Diana bots[ \t]*(?:\r?\n|$)/imu);
 const bots=match?String(text).slice(match.index+match[0].length):'';
 let clusters=[],current=null;for(const ch of bots){
  if(/\p{M}/u.test(ch)){if(current)current.marks.push(ch.codePointAt(0));}
  else {current={base:ch,marks:[]};clusters.push(current);}
 }
 const tally={};let marks=0,vertical=0,maxDepth=0;
 for(const c of clusters){marks+=c.marks.length;maxDepth=Math.max(maxDepth,c.marks.length);
  for(const cp of c.marks){const label='U+'+cp.toString(16).toUpperCase().padStart(4,'0');tally[label]=(tally[label]??0)+1;if(![0x0334,0x0335,0x0336,0x0337,0x0338].includes(cp))vertical+=1;}
 }
 return {botsFound:!!match,botsCodePoints:[...bots].length,totalMarks:marks,distinctMarks:Object.keys(tally).length,
  marksOutsideFivePlanarFamily:vertical,stackedClusters:clusters.filter(c=>c.marks.length>=2).length,
  maxMarksPerBase:maxDepth,markedNewlines:clusters.filter(c=>/\r|\n/.test(c.base)&&c.marks.length).length,
  distribution:tally};
}
async function run(){
 const episode={schema:'td613.marrowline.system-prosody-ablation/v1',task:'one-system-paragraph-removal-only',
   model:MODEL,bodySha256:hash(JSON.stringify(body)),conditions:variants,
   maximumProviderCalls:cap,automaticRetries:0,releaseCanary:true,rawSseRequired:true,
   limitation:'one A/B pair with provider-default randomness cannot establish population causal rates',observed:[]};
 if(!process.argv.includes('--execute')){console.log(JSON.stringify({preflight:true,...episode},null,2));return;}
 if(!process.argv.includes('--ack-paid'))throw Error('PAID_ABLATION_NOT_ACKNOWLEDGED');
 if(!OUT)throw Error('OUTPUT_DIRECTORY_REQUIRED');
 const dir=resolve(OUT);await mkdir(dir,{recursive:true});
 const write=()=>writeFile(resolve(dir,'manifest.json'),JSON.stringify(episode,null,2),{mode:0o600});
 await write();const read=await fetch(URL,{signal:AbortSignal.timeout(25000)});const meta=await read.json();
 if(!read.ok||meta.syntheticProsodyAssay!=='one-system-paragraph-ablation-v1'||meta.nativeSseWitness!=='synthetic-canary-only-v1'){
   episode.held='PRODUCTION_ABLATION_OR_UPSTREAM_WITNESS_NOT_DEPLOYED';await write();console.log(JSON.stringify({held:episode.held}));return;
 }
 const ready=await fetch(URL+'?operation=gemini-readiness',{signal:AbortSignal.timeout(30000)});const models=await ready.json();
 if(!ready.ok||models?.hasGeminiKey!==true||!(models?.routes?.khonapolit?.plan?.callableModels||[]).includes(MODEL)){
   episode.held='CREDENTIAL_SCOPED_MODEL_NOT_READY';await write();console.log(JSON.stringify({held:episode.held}));return;
 }
 for(const variant of variants){
  const x={name:variant.id,requestedModel:MODEL,providerCall:true};
  const headers={'content-type':'application/json',accept:'application/json',
    'x-td613-release-canary':'1','x-td613-canary-model':MODEL,'x-td613-native-sse-witness':'1'};
  if(variant.ablation)headers['x-td613-prosody-assay']='ablate-one-prosody-paragraph';
  try{
   const response=await fetch(URL,{method:'POST',headers,body:JSON.stringify(body),signal:AbortSignal.timeout(timeout)});
   const text=await response.text(); x.outerHttp=response.status; x.apiJsonSha256=hash(text);
   await writeFile(resolve(dir,variant.id+'.response.json'),text,{mode:0o600});
   const payload=JSON.parse(text);
   const attempt=payload?.receipt?.provider?.attempts?.[0]??payload?.attempts?.[0]??null;
   const evidence=attempt?.providerStream?.nativeSseEvidence;
   x.outerApiOk=payload?.ok===true;
   x.providerStatus=attempt?.status??null;
   x.servedModel=attempt?.output?.modelVersion??null;
   x.providerAttempts=(payload?.receipt?.provider?.attempts??payload?.attempts??[]).length;
   x.usage=attempt?.output?.usage??null;
   x.submittedRequest=attempt?.output?.submittedRequest??null;
   x.googleFinishReason=attempt?.output?.finishReason??null;
   x.originalWire={available:!!evidence,bytes:evidence?.rawSseBytes??null,fullCapture:evidence?.captureComplete??null,
     sha256:evidence?.rawSseSha256??null,eventTextHash:evidence?.originalEventTextSha256??null,
     assembledTextHash:evidence?.mergedTextSha256??null};
   if(!evidence?.rawSseBase64) {x.held='RAW_ORIGINAL_SSE_NOT_PRESENT';}
   else{
    const bytes=Buffer.from(evidence.rawSseBase64,'base64');
    await writeFile(resolve(dir,variant.id+'.google-original.sse'),bytes,{mode:0o600});
    const original=extractOriginalSse(bytes);
    x.originalWire.parity={
      rawHash:hash(bytes)===evidence.rawSseSha256,
      upstreamTextHash:hash(original.text)===evidence.originalEventTextSha256,
      mergedTextHash:hash(original.text)===evidence.mergedTextSha256,
      messageTextParity:typeof payload.text==='string'?original.text===payload.text:null,
      modelVersionParity:original.version===x.servedModel,
      finishReasonParity:original.finish===x.googleFinishReason,
    };
    x.originalWire.events=original.events;
    x.originalWire.parts=original.parts;
    x.morphology=morphology(original.text);
    x.originalTextSha256=hash(original.text);
    if(Object.entries(x.originalWire.parity).some(([,pass])=>pass===false))x.held='UPSTREAM_WIRE_PARITY_FAILURE';
   }
   if(x.servedModel!==MODEL||x.providerAttempts!==1)x.held='MODEL_OR_ATTEMPT_MISMATCH';
  }catch(err){x.held=err?.name||'TRANSPORT_FAILURE';x.message=String(err?.message||'').slice(0,190);}
  episode.observed.push(x);await write();
  const safe={...x};delete safe.submittedRequest;console.log('ABLATED_SYSTEM_OBSERVATION '+JSON.stringify(safe));
  if(x.held || x.providerStatus!==200)break;
  const n=x.usage?.totalTokenCount??0;
  if(n>15000){episode.held='FIRST_RETURN_TOKEN_BUDGET';await write();break;}
 }
 if(episode.observed.length===2){
  const [a,b]=episode.observed;
  const aReq=a.submittedRequest||{},bReq=b.submittedRequest||{};
  episode.comparison={
   sameServedModel:a.servedModel===b.servedModel&&a.servedModel===MODEL,
   identicalContents:aReq.contentsSha256===bReq.contentsSha256,
   identicalGenerationConfig:aReq.generationConfigSha256===bReq.generationConfigSha256,
   distinctSystemParagraph:aReq.systemInstructionSha256!==bReq.systemInstructionSha256,
   originalWireParityBoth:episode.observed.every(x=>x.originalWire?.parity&&Object.values(x.originalWire.parity).filter(x=>x!==null).every(Boolean)),
   completeBoth:episode.observed.every(x=>x.outerHttp===200&&x.googleFinishReason==='STOP')
  };
  episode.comparison.isolatedRequestChange=episode.comparison.sameServedModel&&episode.comparison.identicalContents&&episode.comparison.identicalGenerationConfig&&episode.comparison.distinctSystemParagraph&&episode.comparison.originalWireParityBoth;
  if(!episode.comparison.isolatedRequestChange)episode.held='REQUEST_COMPARISON_CONFOUND';
  if(!episode.comparison.completeBoth)episode.held=(episode.held?episode.held+';':'')+'COMPLETION_HELD';
 }
 episode.completedAt=new Date().toISOString();await write();
 console.log('ABLATED_SYSTEM_FINAL '+JSON.stringify({calls:episode.observed.filter(x=>x.providerCall).length,held:episode.held??null,comparison:episode.comparison??null}));
}
run().catch(e=>{console.error(String(e?.message||e));process.exitCode=1;});
