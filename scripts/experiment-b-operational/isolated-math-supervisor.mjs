import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';

// Engineering capability candidate. No Codex launch, credential mount, or provider route.
const worker = String.raw`
import fs from 'node:fs';
import net from 'node:net';
let input='';for await (const chunk of process.stdin) input+=chunk;
if(Buffer.byteLength(input)>8192)throw Error('INPUT_BOUND');
const request=JSON.parse(input);
const integer=value=>{if(typeof value!=='string'||!/^[-]?[0-9]{1,512}$/.test(value))throw Error('INTEGER_REQUIRED');return BigInt(value);};
const gcd=(a,b)=>{a=a<0n?-a:a;b=b<0n?-b:b;while(b){const r=a%b;a=b;b=r;}return a;};
let output;
if(request.kind==='probe'){
 fs.writeFileSync('/scratch/invented.txt','SYNTHETIC');
 let rootWrite='unexpected_success';try{fs.writeFileSync('/etc/td613-invented-probe','SYNTHETIC');}catch(error){rootWrite=error.code;}
 const network=await new Promise(resolve=>{const socket=net.connect({host:'192.0.2.1',port:9});const finish=value=>{socket.destroy();resolve(value);};socket.once('connect',()=>finish('unexpected_success'));socket.once('error',error=>finish(error.code));socket.setTimeout(1000,()=>finish('TIMEOUT'));});
 const status=fs.readFileSync('/proc/self/status','utf8');
 output={uid:process.getuid(),rootWrite,network,scratchRead:fs.readFileSync('/scratch/invented.txt','utf8'),hostMountPresent:fs.existsSync('/host'),ambientCodex:fs.existsSync('/scratch/.codex'),credentialEnvironment:Object.keys(process.env).filter(name=>/OPENAI|GEMINI|ANTHROPIC|CODEX|MCP/.test(name)),capabilities:status.match(/^CapEff:\s*(\w+)/m)?.[1],noNewPrivileges:status.match(/^NoNewPrivs:\s*(\d+)/m)?.[1],seccomp:status.match(/^Seccomp:\s*(\d+)/m)?.[1]};
}else if(request.kind==='math'&&Array.isArray(request.operations)&&request.operations.length<=8){
 output=request.operations.map(item=>{const a=integer(item.a),b=integer(item.b);switch(item.op){case 'add':return String(a+b);case 'subtract':return String(a-b);case 'multiply':return String(a*b);case 'gcd':return String(gcd(a,b));default:throw Error('OPERATION_REFUSED');}});
}else throw Error('REQUEST_REFUSED');
process.stdout.write(JSON.stringify(output));
`;
const invoke = (args, input) => execFileSync('docker', args, { input, encoding:'utf8', timeout:30000, maxBuffer:256*1024, windowsHide:true, stdio:['pipe','pipe','pipe'] });
const reviewedEngineeringImages=new Set([
  'sha256:3ab1d8a775153425c45ac8c6434c8717fae5866d9dc3e494dc7eb8550d71c75f',
  'sha256:ea839611d049c0dc768c90e7055d370473e247010d98cf4988d5acefc8bb20c0'
]);
export function isolatedRequest({ image, arm, kind, operations }) {
  if(!reviewedEngineeringImages.has(image) || !['ARM_2A','ARM_2B'].includes(arm))throw Error('PINNED_IMAGE_AND_ARM_REQUIRED');
  if(!['math','probe'].includes(kind))throw Error('REQUEST_REFUSED');
  if(kind==='math'&&(!Array.isArray(operations)||operations.length>8||operations.some(item=>!['add','subtract','multiply','gcd'].includes(item?.op)||!['a','b'].every(key=>typeof item[key]==='string'&&/^[-]?[0-9]{1,512}$/.test(item[key])))))throw Error('TYPED_OPERATIONS_REQUIRED');
  const input=JSON.stringify({kind,operations});if(Buffer.byteLength(input)>8192)throw Error('INPUT_BOUND');
  let id;
  try {
    id=invoke(['create','--interactive','--network','none','--read-only','--cap-drop','ALL','--security-opt','no-new-privileges=true','--pids-limit','32','--memory','128m','--cpus','1','--user','65534:65534','--ipc','none','--workdir','/scratch','--tmpfs','/scratch:rw,noexec,nosuid,nodev,size=16m,uid=65534,gid=65534','--env','HOME=/scratch','--entrypoint','node',image,'--input-type=module','-e',worker]).trim();
    if(!/^[a-f0-9]{64}$/.test(id))throw Error('CONTAINER_ID_REQUIRED');
    const inspection=JSON.parse(invoke(['inspect',id]))[0];const h=inspection.HostConfig,c=inspection.Config;
    if(h.NetworkMode!=='none'||h.ReadonlyRootfs!==true||h.Privileged||h.Binds?.length||inspection.Mounts?.some(m=>m.Type!=='tmpfs'||m.Destination!=='/scratch')||h.Devices?.length||h.DeviceRequests?.length||h.PidMode||h.IpcMode!=='none'||c.User!=='65534:65534'||h.Memory!==134217728||h.PidsLimit!==32||h.NanoCpus!==1000000000||!h.CapDrop?.includes('ALL')||!h.SecurityOpt?.includes('no-new-privileges=true')||c.Env.some(e=>/^(OPENAI|GEMINI|ANTHROPIC|CODEX|MCP)/.test(e)))throw Error('ACTUAL_CONTAINER_POLICY_MISMATCH');
    const stdout=invoke(['start','--attach','--interactive',id],input);
    const state=JSON.parse(invoke(['inspect',id]))[0].State;
    if(state.ExitCode!==0||state.OOMKilled||state.Running)throw Error('TERMINAL_WORKER_UNVERIFIED');
    return {arm,result:JSON.parse(stdout),evidence:{image,workerSHA256:crypto.createHash('sha256').update(worker).digest('hex'),network:'none',hostMounts:0,readOnlyRoot:true,capabilities:'ALL_DROPPED',noNewPrivileges:true,user:'65534:65534',memoryBytes:h.Memory,pids:h.PidsLimit,attempts:1,exitCode:state.ExitCode}};
  } catch(error) { throw Object.assign(Error('ISOLATED_WORKER_HOLD'),{code:'ISOLATED_WORKER_HOLD',causeCode:error.code??'POLICY_OR_TERMINAL_FAILURE'}); }
  finally {if(/^[a-f0-9]{64}$/.test(id??'')){try{invoke(['rm','--force',id]);}catch{throw Error('CREATED_CONTAINER_CLEANUP_HOLD');}}}
}
