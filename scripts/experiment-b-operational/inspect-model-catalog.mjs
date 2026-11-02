import fs from 'node:fs';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {PINNED_IMAGE} from './docker-capture-runtime.mjs';
import {NATIVE_SETTINGS} from './native-settings.mjs';
const state=JSON.parse(fs.readFileSync(process.env.TD613_OPERATIONAL_STATE_FILE,'utf8'));
if(state.image!==PINNED_IMAGE||!/^td613-egress-[a-f0-9]{32}$/.test(state.socketVolume)||!/^td613-auth-[a-f0-9]{32}$/.test(state.authVolume))throw Error('ACCEPTED_PRIVATE_SESSION_REQUIRED');
const target='/custody/metadata/catalog-'+crypto.randomUUID()+'.json';
const settings=Object.entries(NATIVE_SETTINGS).flatMap(([k,v])=>['-c',k+'='+JSON.stringify(v)]);
const source=`import fs from 'node:fs';import {spawn} from 'node:child_process';
const child=spawn('codex',['app-server','--stdio',...${JSON.stringify(settings)}],{stdio:['pipe','pipe','ignore']});
let pending='',done=false,pages=0,data=[];
const timer=setTimeout(()=>finish({status:'CATALOG_TIMEOUT'}),30000);
function send(id,method,params){if(!['initialize','model/list'].includes(method))throw Error('NON_INFERENTIAL_METHOD_ONLY');child.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\\n');}
function finish(publicResult){if(done)return;done=true;clearTimeout(timer);child.kill();console.log(JSON.stringify({...publicResult,modelRequests:0,accountValuesPublished:false,servedModelAttested:false}));}
child.on('error',()=>finish({status:'CATALOG_INTERFACE_UNAVAILABLE'}));child.on('exit',()=>{if(!done)finish({status:'CATALOG_INTERFACE_EXITED'});});child.stdin.on('error',()=>{});
child.stdout.on('data',b=>{pending+=b;if(Buffer.byteLength(pending)>1048576)return finish({status:'CATALOG_FRAME_BOUND'});let n;while(!done&&(n=pending.indexOf('\\n'))>=0){const line=pending.slice(0,n);pending=pending.slice(n+1);let m;try{m=JSON.parse(line)}catch{continue;}
if(m.id===1){if(m.error)return finish({status:'CATALOG_INITIALIZATION_REJECTED'});child.stdin.write(JSON.stringify({method:'initialized'})+'\\n');send(2,'model/list',{limit:100,includeHidden:false});}
else if(m.id===2){if(m.error||!Array.isArray(m.result?.data))return finish({status:'CATALOG_READ_REJECTED'});
data.push(...m.result.data);if(m.result.nextCursor){if(++pages>=8)return finish({status:'CATALOG_PAGE_BOUND'});send(2,'model/list',{limit:100,includeHidden:false,cursor:m.result.nextCursor});continue;}
fs.mkdirSync('/custody/metadata',{recursive:true,mode:448});const fd=fs.openSync(${JSON.stringify(target)},'wx',384);fs.writeSync(fd,JSON.stringify({method:'model/list',data,observedAt:new Date().toISOString()}));fs.fsyncSync(fd);fs.closeSync(fd);
const sol=data.find(x=>x.model==='gpt-6.1-sol'||x.id==='gpt-6.1-sol');finish({status:'NATIVE_MODEL_LIST_COMPLETED',requestedModelPresent:!!sol,
supportedReasoningEfforts:sol?.supportedReasoningEfforts?.map(x=>x.reasoningEffort??x.effort??x)??[],
defaultReasoningEffort:sol?.defaultReasoningEffort??null,contextAndOutputCeilingFieldsPresent:sol?Object.keys(sol).some(k=>/context|output.*(limit|max)/i.test(k)):false,
catalogProvenance:'REMOTE_OR_BUNDLED_NOT_ATTESTED',privateCatalogReceiptWritten:true});}
}});
send(1,'initialize',{clientInfo:{name:'td613_catalog_non_inferential',version:'1.0.0'},capabilities:{experimentalApi:true}});`;
const boot=`import {spawn} from 'node:child_process';const bridge=spawn('node',['/tcp-repository/egress/loopback-bridge.mjs'],{stdio:'ignore'});await new Promise(r=>setTimeout(r,250));
const child=spawn('node',['--input-type=module','-'],{stdio:['pipe','inherit','inherit']});child.stdin.end(${JSON.stringify(source)});child.on('exit',c=>{bridge.kill();process.exitCode=c??1;});`;
const r=spawnSync('docker',['run','--rm','--network','none','--read-only','--log-driver','none','--cap-drop','ALL',
  '--security-opt','no-new-privileges=true','--user','65534:65534','--pids-limit','64','--memory','512m','--cpus','1','--ipc','none',
  '--mount',`type=volume,src=${state.socketVolume},dst=/bridge,readonly`,'--mount',`type=volume,src=${state.authVolume},dst=/custody`,
  '--tmpfs','/scratch:rw,noexec,nosuid,nodev,size=64m,uid=65534,gid=65534','--workdir','/scratch',
  '--env','HOME=/scratch','--env','CODEX_HOME=/custody/native','--env','HTTP_PROXY=http://127.0.0.1:8787',
  '--env','HTTPS_PROXY=http://127.0.0.1:8787','--env','NO_PROXY=','--env','ALL_PROXY=',
  '--entrypoint','node',PINNED_IMAGE,'--input-type=module','-e',boot],{encoding:'utf8',windowsHide:true,timeout:45000,maxBuffer:65536,stdio:['ignore','pipe','pipe']});
let result;try{result=JSON.parse(r.stdout.trim());}catch{result={status:'CATALOG_CONTROL_HOLD',modelRequests:0};}
console.log(JSON.stringify({evidenceClass:'ACTUAL_NATIVE_NON_INFERENTIAL_MODEL_CATALOG',image:PINNED_IMAGE,exitCode:r.status,...result},null,2));
if(r.status!==0||result.status!=='NATIVE_MODEL_LIST_COMPLETED')process.exitCode=1;
