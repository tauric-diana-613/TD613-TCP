// One-shot raw Google SSE provenance witness via the established plain-h API.
// Must run only after exact-source #1512 production release and GET feature marker.
import {createHash} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const endpoint='https://td613.com/api/khonapolit';
const model='gemini-3.8-flash';
const message='In a fictional town, a committee counts only returned forms and concludes that every silent resident is content. Locate the denominator error, pursue its consequence, and complete the connected Kʰonapolit and Tauric Diana bots movements. Let the voices author their own prose and native typography.';
const request={message,history:[],mode:'issued-conjunction',shi:'',waiveIssuance:true};
const sha=buf=>createHash('sha256').update(buf).digest('hex');
const execute=process.argv.includes('--execute');
const out=process.env.TD613_RAW_SSE_OUT;
function decodeOriginalSse(input){
  let text='',partCount=0,events=0,finish=null,servedVersion=null;
  const original=input.toString('utf8');
  for(const chunk of original.split(/\r?\n\r?\n/)){
    const data=chunk.split(/\r?\n/).filter(l=>l.startsWith('data:')).map(l=>l.slice(5).trimStart()).join('\n');
    if(!data||data==='[DONE]')continue;
    const evt=JSON.parse(data);events+=1;
    servedVersion=evt.modelVersion??servedVersion;
    const candidate=evt?.candidates?.[0]||{};
    finish=candidate.finishReason??finish;
    for(const p of candidate?.content?.parts||[]){
      if(typeof p.text==='string'&&p.thought!==true){text+=p.text;partCount+=1;}
    }
  }
  return {text,partCount,events,finish,servedVersion};
}
function morphology(output){
  const cut=output.search(/(?:^|\n)[ \t]*Tauric Diana bots[ \t]*(?:\r?\n|$)/imu);
  const bots=cut<0?'':output.slice(cut);
  const marks=[...bots.matchAll(/\p{M}/gu)].map(m=>m[0].codePointAt(0));
  const histogram={};for(const n of marks){const k='U+'+n.toString(16).padStart(4,'0').toUpperCase();histogram[k]=(histogram[k]||0)+1;}
  return {botsHeadingPresent:cut>=0,count:marks.length,distinct:Object.keys(histogram).length,marks:histogram};
}
async function main(){
  const plan={schema:'td613.marrowline.raw-provider-sse-observation/v1',model,syntheticPromptHash:sha(message),providerCallsMax:1,retries:0,externalOriginClaim:'server-observed-upstream-http-response-not-independent-network-provenance'};
  if(!execute){console.log(JSON.stringify({preflight:true,...plan},null,2));return;}
  if(!process.argv.includes('--ack-paid'))throw Error('PAID_CALL_NOT_ACKNOWLEDGED');
  if(!out)throw Error('EPISODE_OUT_REQUIRED');
  const dir=resolve(out);await mkdir(dir,{recursive:true});
  const record={...plan,startedAt:new Date().toISOString(),providerRequests:0};
  async function save(){await writeFile(resolve(dir,'manifest.json'),JSON.stringify(record,null,2),{mode:0o600});}
  await save();
  const info=await fetch(endpoint,{signal:AbortSignal.timeout(20000)});
  const meta=await info.json();
  record.productionWitnessMarker=meta.nativeSseWitness||null;
  if(!info.ok||meta.nativeSseWitness!=='synthetic-canary-only-v1') {
    record.held='PRODUCTION_INSTRUMENT_NOT_PRESENT';await save();console.log(JSON.stringify({held:record.held}));return;
  }
  const ready=await fetch(endpoint+'?operation=gemini-readiness',{signal:AbortSignal.timeout(30000)});
  const readiness=await ready.json();
  if(!ready.ok||readiness?.hasGeminiKey!==true||!(readiness?.routes?.khonapolit?.plan?.callableModels||[]).includes(model)){
    record.held='MODEL_CREDENTIAL_NOT_READY';await save();console.log(JSON.stringify({held:record.held}));return;
  }
  record.providerRequests=1;
  await save();
  try{
    const result=await fetch(endpoint,{method:'POST',signal:AbortSignal.timeout(210000),
       headers:{'content-type':'application/json',accept:'application/json','x-td613-release-canary':'1',
                'x-td613-canary-model':model,'x-td613-native-sse-witness':'1'},
       body:JSON.stringify(request)});
    const raw=await result.text();
    await writeFile(resolve(dir,'native-response.original.json'),raw,{mode:0o600});
    const payload=JSON.parse(raw);
    const attempt=payload.receipt?.provider?.attempts?.[0];
    const evidence=attempt?.providerStream?.nativeSseEvidence;
    record.httpStatus=result.status;record.apiResultOk=payload.ok;record.modelVersion=attempt?.output?.modelVersion;
    record.finish=attempt?.output?.finishReason;record.providerAttempts=payload.receipt?.provider?.attempts?.length;
    record.requestHash=attempt?.output?.submittedRequest?.bodySha256;
    record.usage=attempt?.output?.usage??null;
    if(!evidence){record.held='RAW_UPSTREAM_WITNESS_ABSENT';await save();console.log(JSON.stringify(record));return;}
    record.evidence={...evidence};
    delete record.evidence.rawSseBase64;
    const wire=evidence.rawSseBase64?Buffer.from(evidence.rawSseBase64,'base64'):null;
    if(wire)await writeFile(resolve(dir,'provider-google-original.sse'),wire,{mode:0o600});
    if(!wire){record.held='RAW_UPSTREAM_CAPTURE_INCOMPLETE';await save();console.log(JSON.stringify(record));return;}
    const direct=decodeOriginalSse(wire);
    const downstream=payload.text??'';
    record.verify={
      rawByteCountMatches:wire.byteLength===evidence.rawSseBytes,
      rawByteDigestMatches:sha(wire)===evidence.rawSseSha256,
      independentRawTextDigestMatches:sha(direct.text)===evidence.originalEventTextSha256,
      mergedTextDigestMatches:sha(downstream)===evidence.mergedTextSha256,
      exactProviderTextEqualsReturnedText:direct.text===downstream,
      modelVersionMatches:direct.servedVersion===record.modelVersion,
      finishReasonMatches:direct.finish===record.finish,
      parsedEvents:direct.events,parsedParts:direct.partCount,
      morphology:morphology(direct.text)
    };
    record.verify.allMatch=Object.entries(record.verify).filter(([,v])=>typeof v==='boolean').every(([,v])=>v===true);
    if(!record.verify.allMatch)record.held='RAW_PROVIDER_TD613_MISMATCH';
  }catch(e){record.held=e?.name||'FETCH_ERROR';record.error=String(e?.message||e).slice(0,180);}
  record.endedAt=new Date().toISOString();await save();
  const summary={...record};delete summary.evidence;
  console.log('NATIVE_SSE_WITNESS '+JSON.stringify(summary));
}
main().catch(e=>{console.error(String(e?.message||e));process.exitCode=1;});
