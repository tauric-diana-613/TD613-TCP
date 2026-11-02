import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {PINNED_IMAGE} from './docker-capture-runtime.mjs';
import {NATIVE_SETTINGS} from './native-settings.mjs';
import {verifyRestrictedCatalog} from './restricted-model-catalog.mjs';
const parent=process.env.TD613_PRIVATE_CAPTURE_DIRECTORY;
const descriptor=JSON.parse(fs.readFileSync(path.join(parent,'catalog-candidate.json'),'utf8'));
const source=JSON.parse(fs.readFileSync(descriptor.sourceModelFile,'utf8'));
const catalog=JSON.parse(fs.readFileSync(descriptor.restrictedCatalogFile,'utf8'));
const evidence=verifyRestrictedCatalog(source,catalog);
const volume='td613-catalog-test-'+crypto.randomBytes(16).toString('hex');
const call=(args,input)=>{const r=spawnSync('docker',args,{input,encoding:'utf8',windowsHide:true,timeout:30000,maxBuffer:2*1024*1024,stdio:['pipe','pipe','pipe']});if(r.status!==0)throw Error('OFFLINE_CATALOG_CONTROL_HOLD');return r.stdout;};
const safe=['--network','none','--read-only','--log-driver','none','--cap-drop','ALL','--security-opt','no-new-privileges=true',
  '--pids-limit','64','--memory','512m','--cpus','1','--ipc','none','--user','65534:65534','--workdir','/scratch',
  '--tmpfs','/scratch:rw,noexec,nosuid,nodev,size=64m,uid=65534,gid=65534','--env','HOME=/scratch','--env','CODEX_HOME=/scratch/codex'];
try{
  call(['volume','create',volume]);
  call(['run','--rm','--interactive',...safe,'--user','0:0','--mount',`type=volume,src=${volume},dst=/policy`,
    '--entrypoint','node',PINNED_IMAGE,'--input-type=module','-e',
    "import fs from 'node:fs';let t='';for await(const b of process.stdin)t+=b;const f=fs.openSync('/policy/catalog.json','wx',292);fs.writeSync(f,t);fs.fsyncSync(f);fs.closeSync(f);fs.chmodSync('/policy',365);"],JSON.stringify(catalog));
  const settings=Object.entries(NATIVE_SETTINGS).flatMap(([k,v])=>['-c',k+'='+JSON.stringify(v)]);
  const program=`import fs from 'node:fs';import {spawn} from 'node:child_process';
    fs.mkdirSync('/scratch/codex',{mode:448});let writeDenial;try{fs.writeFileSync('/policy/catalog.json','FORBIDDEN')}catch(e){writeDenial=e.code;}
    if(!['EROFS','EACCES'].includes(writeDenial))throw Error('POLICY_NOT_READ_ONLY');
    const child=spawn('codex',['app-server','--stdio',...${JSON.stringify(settings)},'-c','model_catalog_json="/policy/catalog.json"'],{stdio:['pipe','pipe','ignore']});
    let text='',finished=false;const end=r=>{if(finished)return;finished=true;clearTimeout(timer);child.kill();console.log(JSON.stringify(r));};
    const timer=setTimeout(()=>end({status:'OFFLINE_CATALOG_TIMEOUT'}),15000);
    child.on('error',()=>end({status:'OFFLINE_CATALOG_START_HOLD'}));child.stdin.on('error',()=>{});
    child.stdout.on('data',b=>{text+=b;let n;while((n=text.indexOf('\\n'))>=0){const line=text.slice(0,n);text=text.slice(n+1);const m=JSON.parse(line);
      if(m.id===1){if(m.error)return end({status:'OFFLINE_CATALOG_INITIALIZE_HOLD'});child.stdin.write(JSON.stringify({method:'initialized'})+'\\n');child.stdin.write(JSON.stringify({id:2,method:'model/list',params:{includeHidden:true,limit:100}})+'\\n');}
      else if(m.id===2){if(m.error)return end({status:'OFFLINE_CATALOG_LIST_HOLD'});const data=m.result?.data??[];end({status:'OFFLINE_STATIC_CATALOG_LOADED',modelCount:data.length,onlyRequestedModel:data.length===1&&data[0].model==='gpt-6.1-sol',hasXhigh:data[0]?.supportedReasoningEfforts?.some(x=>x.reasoningEffort==='xhigh'),policyWriteDenial:writeDenial});}}});
    child.stdin.write(JSON.stringify({id:1,method:'initialize',params:{clientInfo:{name:'td613_static_catalog_offline',version:'1.0.0'}}})+'\\n');`;
  const result=JSON.parse(call(['run','--rm',...safe,'--mount',`type=volume,src=${volume},dst=/policy,readonly`,
    '--entrypoint','node',PINNED_IMAGE,'--input-type=module','-e',program]).trim());
  console.log(JSON.stringify({evidenceClass:'ACTUAL_OFFLINE_NATIVE_STARTUP_CATALOG_OBSERVATION',...evidence,...result,
    network:'none',credentialMounts:0,hostBindMounts:0,modelRequests:0,providerAttestation:false},null,2));
  if(result.status!=='OFFLINE_STATIC_CATALOG_LOADED'||!result.onlyRequestedModel||!result.hasXhigh)process.exitCode=1;
}catch{console.log(JSON.stringify({status:'OFFLINE_CATALOG_CONTROL_HOLD',modelRequests:0}));process.exitCode=1;}
finally{try{call(['volume','rm',volume]);}catch{}}
