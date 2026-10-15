// Marrowline same-model prompt-sensitivity assay: frozen pair, one changed user clause.
// Plain-h production API; no private data, no server patch, no local Unicode repaint.
import {createHash} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const endpoint='https://td613.com/api/khonapolit';
const MODEL='gemini-3.8-flash';
const baseline='In a fictional town, a committee counts only returned forms and concludes that every silent resident is content. Locate the denominator error, pursue its consequence, and complete the connected Kʰonapolit and Tauric Diana bots movements. Let the voices author their own prose and native typography.';
const oneAddedClause=' When Tauric Diana bots speaks, favor deeply stacked combining crowns ABOVE letters and roots BELOW them rather than strokes through the middle; she remains free to sustain one register or change it wherever her own argument leads.';
const conditions=[
 {name:'A_REPLICATE',message:baseline},
 {name:'B_VERTICAL_CUE',message:baseline+oneAddedClause}
];
const hash=s=>createHash('sha256').update(s).digest('hex');
const request=(message)=>({message,history:[],mode:'issued-conjunction',shi:'',waiveIssuance:true});
const head={'content-type':'application/json',accept:'application/json','x-td613-release-canary':'1','x-td613-canary-model':MODEL};
const codepoints=/\p{M}/gu;
const planar=new Set([0x0303,0x0304,0x0305,0x0330,0x0331,0x0332,0x0334,0x0335,0x0336,0x0337,0x0338,0x0360,0x0361]);
const out=process.env.TD613_SAME_MODEL_OUT;
function measure(text='') {
 const boundary=String(text).search(/(?:^|\n)[ \t]*Tauric Diana bots[ \t]*(?:\r?\n|$)/imu);
 const bots=boundary===-1?'':String(text).slice(boundary);
 const seq=[...bots.matchAll(codepoints)].map(m=>m[0].codePointAt(0));
 const counts={};for(const cp of seq){const k='U+'+cp.toString(16).toUpperCase().padStart(4,'0');counts[k]=(counts[k]||0)+1;}
 return {botsHeading:boundary>=0,combiningMarks:seq.length,distinctTypes:Object.keys(counts).length,planarMarks:seq.filter(x=>planar.has(x)).length,
 nonplanarMarks:seq.filter(x=>!planar.has(x)).length,counts,sourceTextSha256:hash(text)};
}
function submitted(x) {
 const a=x?.receipt?.provider?.attempts||[];
 return {
 model:x?.receipt?.provider?.model??null,
 modelVersion:x?.receipt?.provider?.output?.modelVersion??null,
 thinking:x?.receipt?.provider?.output?.thinkingLevel??null,
 usage:x?.receipt?.provider?.output?.usage??null,
 attempts:a.length,
 finish:a[0]?.output?.finishReason??null,
 hashes:a[0]?.output?.submittedRequest??null,
 admission:x?.relay?.admission?.quality??null,
 warnings:x?.relay?.admission?.qualityWarnings??[]
 };
}
async function main(){
 const manifest={schema:'td613.marrowline.same-model-cue-ab/v1',date:'2026-10-15',route:endpoint,model:MODEL,
 countLimit:2,retries:0,history:[],onlyChangedFactor:'added lower-priority user-message cue',modelSettings:'production MEDIUM thinking',
 interpretation:'One A/B pair is a case comparison, not a causal frequency estimate; system or settings hash differences invalidate isolated-cue inference',
 conditions:conditions.map(c=>({name:c.name,messageSha256:hash(c.message),bodySha256:hash(JSON.stringify(request(c.message)))})),observed:[]};
 if(!process.argv.includes('--execute')){console.log(JSON.stringify({preflight:true,...manifest},null,2));return;}
 if(!process.argv.includes('--ack-paid'))throw Error('OPERATOR_PAID_ACK_REQUIRED');
 if(!out)throw Error('PRIVATE_OUTPUT_PATH_REQUIRED');
 const dir=resolve(out);await mkdir(dir,{recursive:true});
 const persist=()=>writeFile(resolve(dir,'manifest.json'),JSON.stringify(manifest,null,2),{mode:0o600});
 await persist();
 const ready=await fetch(endpoint+'?operation=gemini-readiness',{headers:{accept:'application/json'},signal:AbortSignal.timeout(35000)});
 const data=await ready.json();
 manifest.readiness={status:ready.status,key:Boolean(data?.hasGeminiKey),callable:data?.routes?.khonapolit?.plan?.callableModels||[]};
 await persist();
 if(!ready.ok||!manifest.readiness.key||!manifest.readiness.callable.includes(MODEL)){manifest.held='CREDENTIAL_SCOPED_MODEL_NOT_READY';await persist();console.log(JSON.stringify({held:manifest.held}));return;}
 for(const c of conditions){
   const result={name:c.name,requestedModel:MODEL,providerCall:true};
   try {
      const res=await fetch(endpoint,{method:'POST',headers:head,body:JSON.stringify(request(c.message)),signal:AbortSignal.timeout(210000)});
      const raw=await res.text();
      result.http=res.status;result.originalJsonSha256=hash(raw);
      await writeFile(resolve(dir,c.name+'.original.json'),raw,{mode:0o600});
      const payload=JSON.parse(raw);
      Object.assign(result,submitted(payload));
      result.quality=measure(payload.text??'');
      result.ok=payload.ok===true;
      result.held=(!result.ok||res.status!==200||result.attempts!==1||result.model!==MODEL||result.modelVersion!==MODEL||result.finish!=='STOP')
          ? 'PROVIDER_IDENTITY_OR_COMPLETION_HELD':null;
   } catch(e){result.held=e?.name||'TRANSPORT_ERROR';result.reason=String(e?.message||'').slice(0,180);}
   manifest.observed.push(result);
   await persist();
   console.log('SAME_MODEL_OBSERVATION '+JSON.stringify(result));
   if(result.held)break;
   const u=result.usage||{},tokens=Number(u.totalTokenCount??(Number(u.promptTokenCount||0)+Number(u.candidatesTokenCount||0)+Number(u.thoughtsTokenCount||0)));
   if(tokens>15000){manifest.held='TOKEN_WITNESS_LIMIT';await persist();break;}
 }
 if(manifest.observed.length===2) {
  const [a,b]=manifest.observed;
  const x=a.hashes||{},y=b.hashes||{};
  manifest.comparability={
   sameSystem:x.systemInstructionSha256===y.systemInstructionSha256,
   sameGenerationConfig:x.generationConfigSha256===y.generationConfigSha256,
   distinctContents:x.contentsSha256!==y.contentsSha256,
   sameServedModel:a.modelVersion===b.modelVersion,
   identicalHistory:true,
   singleUserClauseOnly:true
  };
  manifest.comparability.valid=manifest.comparability.sameSystem&&manifest.comparability.sameGenerationConfig&&manifest.comparability.distinctContents&&manifest.comparability.sameServedModel;
  if(!manifest.comparability.valid)manifest.held='PROMPT_CAUSAL_CONFOUND';
 }
 await persist();
 console.log('FINAL '+JSON.stringify({calls:manifest.observed.filter(z=>z.providerCall).length,held:manifest.held??null,comparability:manifest.comparability??null}));
}
main().catch(e=>{console.error('FINITE_DESCENT_ERROR '+String(e?.message||e));process.exitCode=1;});
