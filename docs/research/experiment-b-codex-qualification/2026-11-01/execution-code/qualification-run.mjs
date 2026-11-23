import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const root=process.cwd(),out=path.join(root,'outputs/qualification');
const plan=JSON.parse(fs.readFileSync(path.join(root,'work/qualification-plan.json'),'utf8'));
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const write=(p,s)=>{const f=path.join(out,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,typeof s==='string'?s:JSON.stringify(s,null,2));};
write('qualification-plan.json',plan);
const sourcePayloads=JSON.parse(fs.readFileSync(path.join(root,'work/github-source-payloads.json'),'utf8'));
const sourceManifest=[];
for(const f of sourcePayloads){
 const b=Buffer.from(f.content,'utf8');
 const blob=crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex');
 if(blob!==f.sha)throw Error('GITHUB_BLOB_MISMATCH '+f.path);
 write('sources/'+f.path,f.content);
 sourceManifest.push({path:f.path,bytes:b.length,sha256:hash(b),git_blob_sha1:blob,github_blob_matches:true,url:f.display_url});
}
write('source-manifest.json',sourceManifest);
const original=fs.readFileSync(path.join(root,'work/qualification-probe.mjs'),'utf8');
write('execution-code/qualification-probe.mjs',original);
write('execution-code/qualification-run.mjs',fs.readFileSync(new URL(import.meta.url),'utf8'));
const catalog=JSON.parse(fs.readFileSync('<LOCAL_PATH>','utf8'));
write('receipts/model-catalog-selection.json',{provenance:'local CLI cache; not provider attestation',selected:catalog.models.filter(x=>x.slug===plan.model_requested).map(x=>({slug:x.slug,display_name:x.display_name,default_reasoning_level:x.default_reasoning_level,supported_reasoning_levels:x.supported_reasoning_levels,visibility:x.visibility}))});
const envKeys=['PATH','HOME','USERPROFILE','CODEX_HOME','TMPDIR','TMP','TEMP','LANG','LC_ALL','SystemRoot','SYSTEMROOT','HTTPS_PROXY','HTTP_PROXY','NO_PROXY','SSL_CERT_FILE'];
const env=Object.fromEntries(envKeys.filter(k=>typeof process.env[k]==='string').map(k=>[k,process.env[k]]));
const exe='<LOCAL_PATH>';
for(const [label,args] of [['version',['--version']],['login-status',['login','status']],['exec-help',['exec','--help']]]){
 const r=spawnSync(exe,args,{encoding:'utf8',env,windowsHide:true,timeout:10000});
 write('receipts/'+label+'.json',{executable:exe,args,status:r.status,stdout:r.stdout,stderr:r.stderr});
}
write('receipts/environment.json',{utc:new Date().toISOString(),client_timezone:'America/New_York',platform:process.platform,architecture:process.arch,node:process.version,working_directory:root,executable:exe,executable_sha256:hash(fs.readFileSync(exe)),env_variable_names:Object.keys(env),api_keys_forwarded:false,config_ignored:true});
const arm0=[];
for(const doc of plan.documents){write('synthetic-documents/'+doc.id+'.txt',doc.content);write('arm0-transport/'+doc.id+'.txt',doc.content);arm0.push({document:doc.id,bytes:Buffer.byteLength(doc.content),sha256:hash(doc.content),copy_verified:fs.readFileSync(path.join(out,'arm0-transport/'+doc.id+'.txt'),'utf8')===doc.content});}
write('receipts/arm0.json',{arm:'ARM_0_TRANSPORT',evidence_class:'LOCAL_DETERMINISTIC_BYTE_COPY',records:arm0,model_calls:0});
write('receipts/arm1.json',{arm:'ARM_1_ARCHIVAL',status:'NOT_EXECUTED',role:'Authentic repository Encyclopedia and Wendbine archival control, no autonomous synthesis',reason:'Qualification uses six exact-ref source files, not an executable full baseline checkout. No mock archival substitute used.',model_calls:0});
const parse=raw=>raw.trim().split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
const initialEvents=parse(fs.readFileSync(path.join(out,'receipts/attempt-03-stdout.jsonl'),'utf8'));
const firstText=initialEvents.filter(x=>x.item?.type==='agent_message').map(x=>x.item.text).join('\n');
const histories={ARM_2A_MODULAR:[{document:'D1',stage:1,text:firstText,receipt:'attempt-03.json',usage:initialEvents.find(x=>x.type==='turn.completed').usage}],ARM_2B_MATCHED_UNION:[]};
let next=4;
const generic='SOURCE-FREE SYNTHETIC QUALIFICATION. Use only inline documents and the exact prior final messages below. Do not use any tool, inspect files, search, or delegate. Report externally reviewable claims, calculations, commitments and uncertainty only. Do not provide private internal reasoning. Do not infer an observation not yet supplied. Keep answer under 200 words. No treatment labels or chamber names in the answer. Return a JSON object with keys proposition, evidence, prior_commitment_status, calculation, limitation. All values must be strings.';
function invoke(arm,doc,stage,input){
 const prefix='attempt-'+String(next++).padStart(2,'0');
 const workspace=path.join(root,'work/source-free-lanes',arm);fs.mkdirSync(workspace,{recursive:true});
 const args=['exec','--json','--ephemeral','--ignore-user-config','--sandbox','read-only','--skip-git-repo-check','--cd',workspace,'--model',plan.model_requested,'-c','model_provider="openai"','-c','model_reasoning_effort="medium"','-c','web_search="disabled"','-c','features.shell_tool=false','-c','project_doc_max_bytes=0','-'];
 write('receipts/'+prefix+'-input.txt',input);
 const started=new Date();
 const r=spawnSync(exe,args,{cwd:workspace,input,encoding:'utf8',env,windowsHide:true,timeout:90000,maxBuffer:16*1024*1024});
 write('receipts/'+prefix+'-stdout.jsonl',r.stdout||'');write('receipts/'+prefix+'-stderr.txt',r.stderr||'');
 const events=parse(r.stdout||'');
 const receipt={attempt:next-1,arm,document:doc.id,stage,start_utc:started.toISOString(),end_utc:new Date().toISOString(),executable:exe,args,cwd:workspace,environment_variable_names:Object.keys(env),input_sha256:hash(input),exit_code:r.status,signal:r.signal,error:r.error?{message:r.error.message,code:r.error.code}:null,thread_id:events.find(x=>x.type==='thread.started')?.thread_id,usage:events.find(x=>x.type==='turn.completed')?.usage||null,tool_events:events.filter(x=>x.item&&x.item.type!=='agent_message'),served_model_independently_attested:false,provider_session_isolation_attested:false};
 write('receipts/'+prefix+'.json',receipt);
 if(r.status!==0||events.some(x=>['error','turn.failed'].includes(x.type))||!receipt.usage)throw Error('STOP_ON_INVOCATION_FAILURE '+prefix);
 const text=events.filter(x=>x.item?.type==='agent_message').map(x=>x.item.text).join('\n');
 if(!text)throw Error('NO_AUTHENTIC_OUTPUT '+prefix);
 console.log(JSON.stringify({attempt:receipt.attempt,arm,document:doc.id,stage,usage:receipt.usage}));
 return {document:doc.id,stage,text,receipt:prefix+'.json',usage:receipt.usage,thread_id:receipt.thread_id};
}
for(const doc of plan.documents){
 for(const arm of Object.keys(histories)){
  for(const stage of [1,2]){
   if(arm==='ARM_2A_MODULAR'&&doc.id==='D1'&&stage===1)continue;
   const prior=arm==='ARM_2A_MODULAR'?histories[arm].filter(x=>x.stage===stage):histories[arm];
   const history=prior.map(x=>({document:x.document,stage:x.stage,actual_final_message:x.text}));
   let evidence,task;
   if(arm==='ARM_2A_MODULAR'&&stage===2){evidence=histories[arm].filter(x=>x.document===doc.id&&x.stage===1).at(-1).text;task='Second jurisdiction: from the current handoff alone, audit relation identity, exact finite bounds, valid or invalid extrapolation and candidate falsification. Preserve or revise your own prior commitments. Do not recover the raw document from outside this input.';}
   else if(arm==='ARM_2A_MODULAR'){evidence=doc.content;task='First jurisdiction: assess observation limits, consequence of adopting the claim, identifiable parameters and contradictions. Produce a precise handoff with all supplied mathematical observations needed for a second jurisdiction to assess.';}
   else{evidence=doc.content;task=stage===1?'Flat unified reasoning pass: evaluate the mathematical proposition, observation limits, prior revision, identity and falsification opportunities together. Preserve own actual prior commitments.':'Flat unified verification pass: independently check your immediately preceding candidate, derive or falsify what current observations permit, and record revised commitment and limits. You have the raw current document and own prior outputs.';}
   const input=generic+'\nEXACT OWN PRIOR FINAL MESSAGES:\n'+JSON.stringify(history)+'\nCURRENT '+(arm==='ARM_2A_MODULAR'&&stage===2?'HANDOFF':'SYNTHETIC DOCUMENT')+' '+doc.id+':\n'+evidence+'\nTASK:\n'+task;
   const result=invoke(arm,doc,stage,input);histories[arm].push(result);write('histories/'+arm+'.json',histories[arm]);
  }
 }
}
write('receipts/reasoning-summary.json',Object.fromEntries(Object.entries(histories).map(([arm,h])=>[arm,{calls:h.length,usage:h.reduce((a,x)=>{for(const [k,v] of Object.entries(x.usage))a[k]=(a[k]||0)+v;return a;},{}),retention_method:plan.history_method}])));
console.log('REASONING_SEQUENCE_COMPLETED');
