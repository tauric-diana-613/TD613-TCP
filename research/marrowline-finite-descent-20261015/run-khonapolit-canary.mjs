// One-shot production-native Marrowline witness through https://td613.com/api/khonapolit.
// Separate from the equal-thinking direct Gemini laboratory probe.
// Synthetic fictional prompt ONLY. No actual user conversation or private files.
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const url = 'https://td613.com/api/khonapolit';
const models = ['gemini-3.8-flash', 'gemini-3.6-flash'];
const message = 'In a fictional town, a committee counts only returned forms and concludes that every silent resident is content. Locate the denominator error, pursue its consequence, and complete the connected Kʰonapolit and Tauric Diana bots movements. Let the voices author their own prose and native typography.';
const source = {message,history:[],mode:'issued-conjunction',shi:'',waiveIssuance:true};
const hash = s => createHash('sha256').update(s).digest('hex');
const marks = /\p{M}/gu;
const OUTPUT = process.env.TD613_ROUTE_CANARY_OUT;
const actual = process.argv.includes('--execute');
const TARGET_CALLS = 2;
const MAX_TOTAL_REQUESTS = 2;
const CALL_TIMEOUT_MS = 210000;
function measure(fullText) {
  const text = String(fullText??'');
  const split = text.search(/(?:^|\n)[ \t]*Tauric Diana bots[ \t]*(?:\r?\n|$)/imu);
  const bots = split < 0 ? '' : text.slice(split);
  const list = [...bots.matchAll(marks)].map(x=>x[0].codePointAt(0));
  const count = new Map(); for(const n of list)count.set(n, (count.get(n)||0)+1);
  const planar = new Set([0x0303,0x0304,0x0305,0x0330,0x0331,0x0332,0x0334,0x0335,0x0336,0x0337,0x0338,0x0360,0x0361]);
  return {botsFound:split>=0, botsTextLength:bots.length, combiningMarkCount:list.length, distinctMarks:count.size,
    planarMarks:list.filter(x=>planar.has(x)).length, otherMarks:list.filter(x=>!planar.has(x)).length,
    mostCommon:[...count.entries()].sort((a,b)=>b[1]-a[1]).slice(0,12).map(([n,v])=>['U+'+n.toString(16).toUpperCase(),v]),
    receivedTextSha256:hash(text)};
}
async function main() {
  const freeze={schema:'td613.marrowline.production-native-canary/v1',productionUrl:url,syntheticPromptSha256:hash(message),
    models,bodySha256:hash(JSON.stringify(source)),maxCalls:TARGET_CALLS,maxTotalRequests:MAX_TOTAL_REQUESTS,
    retries:0,repairsDisabledByCanaryHeader:true,
    warning:'Live endpoint uses per-model production thinking settings and a 65,536-output-token ceiling. NOT equal-config/model-only trial; monetary limit not service-enforced.'};
  if(!actual){process.stdout.write(JSON.stringify({preflight:true,...freeze},null,2)+'\n');return;}
  if(!process.argv.includes('--ack-paid'))throw Error('PAID_REQUEST_ACKNOWLEDGEMENT_REQUIRED');
  if(!OUTPUT)throw Error('PRIVATE_OUTPUT_DIRECTORY_REQUIRED');
  const dest=resolve(OUTPUT);await mkdir(dest,{recursive:true});
  const manifest={...freeze,startedAt:new Date().toISOString(),observed:[]};
  async function persist(){await writeFile(resolve(dest,'manifest.json'),JSON.stringify(manifest,null,2),{mode:0o600});}
  await persist();
  const read=await fetch(url+'?operation=gemini-readiness',{method:'GET',headers:{accept:'application/json'},signal:AbortSignal.timeout(45000)});
  const readiness=await read.json();
  const eligible=read.ok && readiness?.ok===true && readiness?.hasGeminiKey===true;
  const callable=readiness?.routes?.khonapolit?.plan?.callableModels||[];
  manifest.readiness={httpStatus:read.status,providerListingOk:readiness?.providerModelListing?.ok,eligible,callableModels:callable};
  await persist();
  if(!eligible){process.stdout.write(JSON.stringify({HELD:'route-not-ready',readiness:manifest.readiness})+'\n');return;}
  for (const model of models) {
    if(!callable.includes(model)) {
      manifest.observed.push({requestedModel:model,held:'NOT_IN_CREDENTIAL_SCOPED_CALLABLE_MODELS',providerCalls:0});
      await persist();
      continue;
    }
    if(manifest.observed.filter(x=>x.providerCall===true).length>=MAX_TOTAL_REQUESTS)break;
    const attemptIndex=manifest.observed.length+1;
    let output={requestedModel:model,providerCall:true,startedAt:new Date().toISOString()};
    try{
      const response=await fetch(url,{method:'POST',headers:{'content-type':'application/json','accept':'application/json',
        'x-td613-release-canary':'1','x-td613-canary-model':model},body:JSON.stringify(source),
        signal:AbortSignal.timeout(CALL_TIMEOUT_MS)});
      const raw=await response.text();
      output.httpStatus=response.status;
      output.rawJsonSha256=hash(raw);
      await writeFile(resolve(dest,'attempt-'+attemptIndex+'.response.json'),raw,{mode:0o600});
      let payload;
      try{payload=JSON.parse(raw);}catch{output.held='RESPONSE_JSON_PARSE_FAILED';}
      if(payload) {
        const rec=payload.receipt??{};
        const attempts=rec.provider?.attempts??[];
        const servedRequest=rec.provider?.model??response.headers.get('x-td613-gemini-model')??null;
        output.servedRequestedModel=servedRequest;
        output.modelMismatch=!!servedRequest&&servedRequest!==model;
        output.servedVersion=rec.provider?.output?.modelVersion??null;
        output.completion=rec.provider?.completion??null;
        output.usage=rec.provider?.output?.usage??null;
        output.attemptCount=attempts.length;
        output.providerStatuses=attempts.map(x=>({model:x.model,status:x.status,finishReason:x.output?.finishReason,servedVersion:x.output?.modelVersion}));
        output.serverTelemetry=payload.relay?.highZalgo??{};
        output.measured=measure(payload.text);
        output.receivedContent=typeof payload.text==='string';
        output.providerResponseOk=payload.ok===true;
        output.error=payload.error??null;
        output.held=output.modelMismatch?'CANARY_MODEL_MISMATCH':output.held??null;
      }
    }catch(e){output.held=e?.name||'TRANSPORT_FAILURE';output.errorText=String(e?.message||'').slice(0,190);}
    output.finishedAt=new Date().toISOString();
    manifest.observed.push(output);
    await persist();
    const compact={...output};delete compact.serverTelemetry;delete compact.completion;
    process.stdout.write('CANARY_OBSERVATION '+JSON.stringify(compact)+'\n');
    if (output.modelMismatch||output.held||output.attemptCount>1||output.httpStatus!==200)break;
    const tokens=(output.usage?.promptTokenCount??0)+(output.usage?.candidatesTokenCount??0)+(output.usage?.thoughtsTokenCount??0);
    if(tokens>15000) {manifest.finalControl='SECOND_CALL_HELD_FOR_TOKEN_USE';await persist();break;}
  }
  manifest.endedAt=new Date().toISOString();await persist();
  process.stdout.write('RESULT '+JSON.stringify({out:dest,observed:manifest.observed.length,paidCalls:manifest.observed.filter(x=>x.providerCall).length})+'\n');
}
main().catch(e=>{process.stderr.write(String(e?.message||e)+'\n');process.exitCode=1;});