import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawn,spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {digest,canonical} from '../experiment-b-resumable/journal.mjs';
import {codexArgs} from '../experiment-b-codex-exec-adapter.mjs';
import {conservativeInputMeasurement,validateEffectiveLimits,quotaWindowCommitment} from './input-accounting.mjs';
import {mathServerSource,correlateKernelEvents,MATH_POLICY,MAX_TYPED_RESULT_BYTES,MAX_MATH_RECEIPT_BYTES} from './typed-math.mjs';
import {NATIVE_SETTINGS} from './native-settings.mjs';
import {verifyRestrictedCatalog,enforceNoCompactionGuard} from './restricted-model-catalog.mjs';

export const PINNED_IMAGE='sha256:0f5db0645aa3187055a001ca12e123ae4cd5c15e50561f04973dd58f3bbb537a';
export const CLI_SHA256='6253fb59fc4c21a9134b2f73237650eaec4a3d9380e5af12f3f1e9040dc24c14';
const sha=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const fail=code=>{throw Object.assign(Error(code),{code});};
const docker=(args,input,timeout=30000)=>{
  const r=spawnSync('docker',args,{input,encoding:'utf8',windowsHide:true,timeout,maxBuffer:40*1024*1024,stdio:['pipe','pipe','pipe']});
  if(r.error||r.status!==0)fail('DOCKER_CONTROL_OPERATION_HOLD');return r.stdout;
};
const inspect=id=>JSON.parse(docker(['inspect',id]))[0];
const options=['--network','none','--read-only','--log-driver','none','--cap-drop','ALL',
  '--security-opt','no-new-privileges=true','--pids-limit','64','--memory','512m','--cpus','1',
  '--ipc','none','--user','65534:65534','--workdir','/scratch',
  '--tmpfs','/scratch:rw,noexec,nosuid,nodev,size=64m,uid=65534,gid=65534','--env','HOME=/scratch'];
const idOf=s=>{const id=s.trim();if(!/^[a-f0-9]{64}$/.test(id))fail('CONTAINER_ID_REQUIRED');return id;};
const repositoryRoot=fs.realpathSync(new URL('../../',import.meta.url));
function assertPrivateDirectory(dir){
  if(!path.isAbsolute(dir??''))fail('PRIVATE_CAPTURE_DIRECTORY_REQUIRED');
  const real=fs.realpathSync(dir),relative=path.relative(repositoryRoot,real);
  if(relative===''||(!relative.startsWith('..'+path.sep)&&relative!=='..'&&!path.isAbsolute(relative))||
     fs.lstatSync(dir).isSymbolicLink()||!fs.statSync(real).isDirectory())fail('PRIVATE_CAPTURE_OUTSIDE_CHECKOUT_REQUIRED');
  if(process.platform==='win32'){
    const script="$a=Get-Acl -LiteralPath $env:TD613_CHECK_PRIVATE_DIR; $o=$a.GetOwner([System.Security.Principal.SecurityIdentifier]).Value; $bad=@($a.Access|Where-Object {$_.AccessControlType -eq 'Allow' -and $_.IdentityReference.Translate([System.Security.Principal.SecurityIdentifier]).Value -notin @($o,'S-1-5-18','S-1-5-32-544')}); if($bad.Count -gt 0){exit 1}";
    const r=spawnSync('powershell',['-NoProfile','-NonInteractive','-Command',script],{env:{...process.env,TD613_CHECK_PRIVATE_DIR:real},windowsHide:true,timeout:10000,stdio:'ignore'});
    if(r.status!==0)fail('OWNER_PRIVATE_CAPTURE_ACL_REQUIRED');
  }else if((fs.statSync(real).mode&0o077)!==0||fs.statSync(real).uid!==process.getuid())fail('OWNER_PRIVATE_CAPTURE_MODE_REQUIRED');
}

function assertWorker(c, volumes) {
  const h=c.HostConfig,e=c.Config;
  const actual=c.Mounts.filter(m=>m.Type==='volume').map(m=>[m.Name,m.Destination,m.RW]).sort();
  if(c.Image!==PINNED_IMAGE||h.NetworkMode!=='none'||!h.ReadonlyRootfs||h.Privileged||
     h.Binds?.length||h.Devices?.length||h.DeviceRequests?.length||h.PidMode||h.IpcMode!=='none'||
     h.Memory!==536870912||h.NanoCpus!==1000000000||h.PidsLimit!==64||e.User!=='65534:65534'||
     h.LogConfig.Type!=='none'||!h.CapDrop?.includes('ALL')||
     !h.SecurityOpt?.includes('no-new-privileges=true')||
     canonical(actual)!==canonical([...volumes].sort())||
     c.Mounts.some(m=>!['volume','tmpfs'].includes(m.Type))||
     e.Env.some(v=>/^(OPENAI|GEMINI|ANTHROPIC|MCP|SSH|AWS|AZURE)/.test(v)))fail('ACTUAL_CHILD_POLICY_MISMATCH');
}
function helper(volume, source, root=false,input) {
  const args=['run','--rm',...(input!==undefined?['--interactive']:[]),...options,'--mount',`type=volume,src=${volume},dst=/capture`,
    ...(root?['--user','0:0','--cap-add','CHOWN']:[]),'--entrypoint','node',PINNED_IMAGE,
    '--input-type=module','-e',source];
  return JSON.parse(docker(args,input));
}
const readFiles=`import fs from 'node:fs';import crypto from 'node:crypto';
const s=fs.lstatSync('/capture/final',{bigint:true});
if(!s.isFile()||s.nlink!==1n||s.uid!==65534n||(s.mode&511n)!==384n||s.size>16777216n)throw Error('FINAL_FILE_POLICY');
const b=fs.readFileSync('/capture/final');const after=fs.lstatSync('/capture/final',{bigint:true});
if(s.ino!==after.ino||s.size!==after.size||s.mtimeNs!==after.mtimeNs)throw Error('FINAL_CHANGED_DURING_READ');
let receipts=[];if(fs.existsSync('/capture/kernel.jsonl')){const k=fs.lstatSync('/capture/kernel.jsonl');if(!k.isFile()||k.nlink!==1||k.size>KERNEL_STORAGE_BOUND)throw Error('KERNEL_FILE_POLICY');
receipts=fs.readFileSync('/capture/kernel.jsonl','utf8').split('\\n').filter(Boolean).map(JSON.parse);}
console.log(JSON.stringify({bytes:b.toString('base64'),inode:String(s.ino),device:String(s.dev),size:Number(s.size),mtime:String(s.mtimeNs),ctime:String(s.ctimeNs),receipts}));`;

/** Source-free fixture mode and native mode have separate construction paths.
 * No environment flag selects a fixture transport for a native dispatch.
 * Native mode additionally requires the external, digest-bound authority below.
 */
function createBoundary(config, fixture) {
  if(config.image!==PINNED_IMAGE)fail('PINNED_RUNTIME_IMAGE_REQUIRED');
  if(!Number.isSafeInteger(config.captureStorageBytes)||config.captureStorageBytes<16*1024*1024||
     config.captureStorageBytes>128*1024*1024||!Number.isSafeInteger(config.timeoutMs)||
     config.timeoutMs<1000||config.timeoutMs>3600000)fail('FINITE_CAPTURE_POLICY_REQUIRED');
  const pending=new Map();
  const persist=(ticket,type,record)=>{
    // Must be an owner-private, operator-provisioned directory. Nothing in this
    // control log is a grant; the protected runner independently authenticates it.
    const file=path.join(config.privateCaptureDirectory,ticket.captureId+'.jsonl');
    const fd=fs.openSync(file,fs.constants.O_WRONLY|fs.constants.O_CREAT|fs.constants.O_APPEND|fs.constants.O_NOFOLLOW,0o600);
    try{fs.writeSync(fd,JSON.stringify({type,...record})+'\n');fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
  };
  const prepare=async binding=>{
    if(!binding.dispatchId||!binding.attempt||binding.executableSHA256!==CLI_SHA256||pending.has(binding.dispatchId))fail('CAPTURE_BINDING_REJECTED');
    assertPrivateDirectory(config.privateCaptureDirectory);
    const attemptLock=fs.openSync(path.join(config.privateCaptureDirectory,'attempt-'+digest(binding.attempt)+'.lock'),'wx',0o600);
    try{fs.writeSync(attemptLock,JSON.stringify(binding));fs.fsyncSync(attemptLock);}finally{fs.closeSync(attemptLock);}
    const captureId=crypto.randomUUID(), volume='td613-capture-'+crypto.randomBytes(16).toString('hex');
    const ticket=Object.freeze({captureId,dispatchId:binding.dispatchId,outputFile:'/capture/final'});
    const entry={binding:structuredClone(binding),ticket,volume,initial:null,phase:'PREPARING'};
    pending.set(binding.dispatchId,entry);persist(ticket,'PREPARING',{binding,volume,fixture:!!fixture});
    docker(['volume','create','--label','td613.capture='+captureId,volume]);
    const initial=helper(volume,`import fs from 'node:fs';
      const fd=fs.openSync('/capture/final','wx',0o600);fs.fchownSync(fd,65534,65534);fs.fsyncSync(fd);fs.closeSync(fd);
      const s=fs.lstatSync('/capture/final',{bigint:true});
      fs.chmodSync('/capture',0o700);fs.chownSync('/capture',65534,65534);
      console.log(JSON.stringify({inode:String(s.ino),device:String(s.dev),mtime:String(s.mtimeNs),ctime:String(s.ctimeNs)}));`,true);
    entry.initial=initial;entry.phase='PREPARED';persist(ticket,'PREPARED',{binding,volume,initial,evidenceClass:fixture?'ACTUAL_OFFLINE_BOUNDARY_WITH_SYNTHETIC_OUTPUT':'LOCAL_EXTERNAL_CAPTURE_SERVICE'});
    return ticket;
  };
  const spawnNative=async request=>{
    const entry=pending.get(request.dispatchId);
    if(!entry||entry.phase!=='PREPARED'||request.executable!=='codex'||typeof request.input!=='string'||!request.input.isWellFormed()||typeof request.capture!=='function')fail('CAPTURE_PREPARATION_REQUIRED');
    const expected=codexArgs({model:'gpt-6.1-sol',workspace:config.workspace});
    expected.splice(expected.length-1,0,'-c','model_reasoning_effort="xhigh"');
    expected.splice(expected.length-1,0,'--output-last-message',entry.ticket.outputFile);
    if(canonical(request.args)!==canonical(expected))fail('UNFROZEN_NATIVE_ARGUMENTS');
    let state,authority,measurement,restrictedCatalog;
    if(!fixture){
      const limits=validateEffectiveLimits(config.effectiveLimits);
      measurement=conservativeInputMeasurement(request.input,config.inputPolicy);
      if(measurement.upperBound+limits.outputAndReasoningTokens>limits.contextTokens)fail('D04_CONTEXT_RESERVATION_HOLD');
      // This is a real external service, not a caller Boolean. The authority
      // module and acceptance record are frozen in observeRuntime. No service
      // is supplied by this package and missing provision fails before launch.
      authority=await loadAuthority(config.dispatchAuthority);
      const sourceModel=readPrivateJSON(config.sourceModelFile);
      restrictedCatalog=readPrivateJSON(config.restrictedCatalogFile);
      const catalogEvidence=verifyRestrictedCatalog(sourceModel,restrictedCatalog);
      if(catalogEvidence.restrictedCatalogDigest!==config.restrictedCatalogDigest||catalogEvidence.sourceModelDigest!==config.sourceModelDigest)
        fail('FROZEN_NATIVE_CATALOG_REQUIRED');
      enforceNoCompactionGuard(sourceModel,measurement,config.effectiveLimits);
      if(!Number.isSafeInteger(config.nativeToolOutputEnvelopeUpperBoundBytes)||config.nativeToolOutputEnvelopeUpperBoundBytes<0||
        !Number.isSafeInteger(config.toolOutputTokenLimit)||config.toolOutputTokenLimit<MAX_TYPED_RESULT_BYTES+config.nativeToolOutputEnvelopeUpperBoundBytes||
        !sha(config.toolOutputRetentionEvidenceDigest))fail('AUDITED_COMPLETE_TYPED_TOOL_OUTPUT_RETENTION_REQUIRED');
      if(!Number.isSafeInteger(config.kernelStorageBytes)||config.kernelStorageBytes<1||config.kernelStorageBytes>16*1024*1024||
        config.mathMaxCallsPerTurn*MAX_MATH_RECEIPT_BYTES>config.kernelStorageBytes)fail('COMPLETE_FINITE_KERNEL_RECEIPT_CAPACITY_REQUIRED');
      state=readSession(config);
      await verifyGateway(state);
    }
    const args=[...request.args];args[args.indexOf('--cd')+1]='/scratch';
    args.splice(args.length-1,0,'--ignore-rules','--strict-config');
    for(const [key,value] of Object.entries(NATIVE_SETTINGS))args.splice(args.length-1,0,'-c',`${key}=${JSON.stringify(value)}`);
    let source;
    if(fixture)source=fixture;
    else{
      entry.policyVolume='td613-policy-'+crypto.randomBytes(16).toString('hex');
      docker(['volume','create','--label','td613.capture='+entry.ticket.captureId,entry.policyVolume]);
      helper(entry.policyVolume,`import fs from 'node:fs';let text='';for await(const b of process.stdin){text+=b;if(Buffer.byteLength(text)>2097152)throw Error('POLICY_BOUND');}
        const fd=fs.openSync('/capture/catalog.json','wx',0o444);fs.writeSync(fd,text);fs.fsyncSync(fd);fs.closeSync(fd);fs.chmodSync('/capture',0o555);console.log(JSON.stringify({written:true}));`,true,JSON.stringify(restrictedCatalog));
      args.splice(args.length-1,0,'-c','model_catalog_json="/policy/catalog.json"');
      args.splice(args.length-1,0,'-c','tool_output_token_limit='+config.toolOutputTokenLimit,
        '-c','model_post_turn_compact_threshold_percent=0');
      persist(entry.ticket,'POLICY_FROZEN',{policyVolume:entry.policyVolume,restrictedCatalogDigest:config.restrictedCatalogDigest});
      if(!Number.isSafeInteger(config.mathMaxCallsPerTurn)||config.mathMaxCallsPerTurn<1||config.mathMaxCallsPerTurn>4096)fail('FROZEN_MATH_CALL_AUTHORITY_REQUIRED');
      args.splice(args.length-1,0,'-c','mcp_servers.td613_math.command="node"','-c',
        'mcp_servers.td613_math.args='+JSON.stringify(['--input-type=module','-e',mathServerSource.replace('++calls>64','++calls>'+config.mathMaxCallsPerTurn)]));
      // A private, runtime-owned first-party auth profile is mounted read-only.
      // Each dispatch has a fresh ephemeral CODEX_HOME. No account database is
      // copied, no token is injected, and a refresh requiring a write will HOLD.
      source=`import fs from 'node:fs';import {spawn} from 'node:child_process';
        fs.mkdirSync('/scratch/codex',{mode:0o700});fs.symlinkSync('/credentials/native/auth.json','/scratch/codex/auth.json');
        const bridge=spawn('node',['/tcp-repository/egress/loopback-bridge.mjs'],{stdio:'ignore'});
        await new Promise(r=>setTimeout(r,250));
        const child=spawn('/usr/local/bin/codex',${JSON.stringify(args)},{stdio:['pipe','inherit','inherit']});
        process.stdin.pipe(child.stdin);child.on('exit',(code)=>{bridge.kill();process.exitCode=code??1;});`;
    }
    const volumes=[[entry.volume,'/capture',true]], mountArgs=['--mount',`type=volume,src=${entry.volume},dst=/capture`];
    if(!fixture){volumes.push([state.socketVolume,'/bridge',false],[state.authVolume,'/credentials',false],[entry.policyVolume,'/policy',false]);
      mountArgs.push('--mount',`type=volume,src=${state.socketVolume},dst=/bridge,readonly`,'--mount',`type=volume,src=${state.authVolume},dst=/credentials,readonly`,
        '--mount',`type=volume,src=${entry.policyVolume},dst=/policy,readonly`);}
    const envArgs=fixture?[]:['--env','CODEX_HOME=/scratch/codex','--env','HTTP_PROXY=http://127.0.0.1:8787',
      '--env','HTTPS_PROXY=http://127.0.0.1:8787','--env','ALL_PROXY=','--env','NO_PROXY='];
    const container=idOf(docker(['create','--interactive',...options,...mountArgs,...envArgs,'--entrypoint','node',PINNED_IMAGE,'--input-type=module','-e',source]));
    assertWorker(inspect(container),volumes);entry.container=container;
    const executionBinding={...entry.binding,promptSHA256:digest(Buffer.from(request.input)),
      image:PINNED_IMAGE,argumentsDigest:digest(args),runtimePolicyDigest:digest(publicPolicy(config)),
      captureId:entry.ticket.captureId,inputMeasurementDigest:measurement?digest(measurement):'SYNTHETIC_NO_TOKEN_CLAIM'};
    // No inference is started until the externally controlled service atomically
    // consumes an independently accepted, purpose-appropriate dispatch permit.
    if(!fixture && await authority.authorizeAndConsume(executionBinding)!==true){docker(['rm',container]);fail('EXTERNAL_DISPATCH_AUTHORIZATION_REQUIRED');}
    const effectiveConfiguration={args,workspaceMapping:{from:config.workspace,to:'/scratch'},
      image:PINNED_IMAGE,cliExecutableSHA256:CLI_SHA256,nativeSettings:NATIVE_SETTINGS,
      inputMeasurement:measurement??null,providerServedIdentityAttested:false,
      evidenceClass:fixture?'SYNTHETIC_OUTPUT_WITH_ACTUAL_OFFLINE_BOUNDARY':'LOCAL_NATIVE_CONFIGURATION_OBSERVATION'};
    entry.phase='DISPATCHED';entry.executionBinding=executionBinding;persist(entry.ticket,'DISPATCHED',{container,executionBinding,effectiveConfiguration,fixture:!!fixture});
    const stdout=[],stderr=[];let size=0,failure=null;
    const files={};for(const channel of ['stdout','stderr'])files[channel]=fs.openSync(path.join(config.privateCaptureDirectory,entry.ticket.captureId+'.'+channel),'wx',0o600);
    try{
      const result=await new Promise(resolve=>{
        const child=spawn('docker',['start','--attach','--interactive',container],{windowsHide:true,stdio:['pipe','pipe','pipe']});
        const stop=code=>{if(failure)return;failure=code;try{docker(['stop','--time','1',container]);}catch{}child.kill();};
        const timer=setTimeout(()=>stop('FINITE_DISPATCH_TIMEOUT_UNCERTAIN_HOLD'),config.timeoutMs);
        const capture=(channel,chunk)=>{if(failure)return;try{
          fs.writeSync(files[channel],chunk);fs.fsyncSync(files[channel]);
          request.capture(channel,chunk);size+=chunk.length;
          if(size>config.captureStorageBytes){stop('CAPTURE_STORAGE_AUTHORITY_EXHAUSTED_HOLD');return;}
          (channel==='stdout'?stdout:stderr).push(Buffer.from(chunk));
        }catch{stop('DURABLE_CAPTURE_WRITE_UNCERTAIN_HOLD');}};
        child.stdout.on('data',b=>capture('stdout',b));child.stderr.on('data',b=>capture('stderr',b));
        child.on('error',()=>{failure='NATIVE_PROCESS_UNCERTAIN_HOLD';clearTimeout(timer);resolve(null);});
        child.on('close',code=>{clearTimeout(timer);resolve(code);});child.stdin.on('error',()=>{});child.stdin.end(Buffer.from(request.input));
      });
      const observed=inspect(container);entry.state=observed.State;
      entry.stdout=Buffer.concat(stdout);entry.stderr=Buffer.concat(stderr);
      persist(entry.ticket,'TERMINAL',{exitCode:entry.state.ExitCode,attachExitCode:result,
        oomKilled:entry.state.OOMKilled,running:entry.state.Running,failure,
        stdoutSHA256:digest(entry.stdout),stderrSHA256:digest(entry.stderr),retainedBytes:size});
      if(failure)fail(failure);
      if(result!==0||entry.state.ExitCode!==0||entry.state.Running||entry.state.OOMKilled)fail('NATIVE_TERMINAL_UNVERIFIED');
      if(!entry.stdout.equals(Buffer.from(entry.stdout.toString('utf8')))||!entry.stderr.equals(Buffer.from(entry.stderr.toString('utf8'))))fail('NON_UTF8_NATIVE_RECORD_HOLD');
      entry.phase='COMPLETED';
      return {exitCode:entry.state.ExitCode,stdout:entry.stdout.toString('utf8'),stderr:entry.stderr.toString('utf8'),
        effectiveConfiguration,
        evidenceClass:fixture?'ACTUAL_OFFLINE_BOUNDARY_SYNTHETIC_PROVIDER_OUTPUT':'NATIVE_OUTPUT_NOT_PROVIDER_ATTESTATION'};
    }finally{for(const fd of Object.values(files))fs.closeSync(fd);}
  };
  const collect=async binding=>{
    const e=pending.get(binding.dispatchId);
    if(!e||e.phase!=='COMPLETED'||canonical(e.binding)!==canonical({dispatchId:binding.dispatchId,attempt:binding.attempt,executableSHA256:binding.executableSHA256})||
      canonical(e.ticket)!==canonical(binding.ticket))fail('TERMINAL_CAPTURE_BINDING_REJECTED');
    const state=inspect(e.container).State;
    if(state.Running||state.ExitCode!==0||state.OOMKilled)fail('TERMINAL_CAPTURE_STATE_REJECTED');
    const record=helper(e.volume,readFiles.replace('KERNEL_STORAGE_BOUND',String(fixture?2*1024*1024:config.kernelStorageBytes)));
    if(record.inode!==e.initial.inode||record.device!==e.initial.device||record.size===0||
      (record.mtime===e.initial.mtime && record.ctime===e.initial.ctime))fail('STALE_OR_REPLACED_FINAL_FILE');
    e.final=record;e.proof={evidenceClass:fixture?'ACTUAL_OFFLINE_CAPTURE_SYNTHETIC_OUTPUT':'LOCAL_CAPTURE_OBSERVATION_NOT_PROVIDER_ATTESTATION',
      recordDigest:digest({record,execution:e.executionBinding,stdoutSHA256:digest(e.stdout),stderrSHA256:digest(e.stderr)}),
      captureId:e.ticket.captureId};
    persist(e.ticket,'FINAL_COLLECTED',{record,proof:e.proof});
    return {bytes:Buffer.from(record.bytes,'base64'),proof:e.proof};
  };
  const kernelEvidence=async dispatchId=>{
    const e=pending.get(dispatchId);if(!e?.final)fail('CAPTURE_COLLECTION_REQUIRED');
    const events=e.stdout.toString('utf8').trim().split(/\r?\n/).map(JSON.parse);
    const correlated=correlateKernelEvents(events,e.final.receipts,fixture?64:config.mathMaxCallsPerTurn);
    e.kernel=correlated;return correlated;
  };
  const verify=async(evidence,proof)=>{
    const e=pending.get(evidence.dispatchId);if(!e||e.phase!=='COMPLETED'||!e.final||canonical(proof)!==canonical(e.proof))return false;
    const again=helper(e.volume,readFiles.replace('KERNEL_STORAGE_BOUND',String(fixture?2*1024*1024:config.kernelStorageBytes)));
    if(canonical(again)!==canonical(e.final)||evidence.captureId!==e.ticket.captureId||evidence.attempt!==e.binding.attempt||
      evidence.executableSHA256!==CLI_SHA256||evidence.outputFile!==e.ticket.outputFile||evidence.exitCode!==0||
      evidence.threadId!==JSON.parse(e.stdout.toString('utf8').split(/\r?\n/)[0]).thread_id||
      evidence.jsonlSHA256!==digest(e.stdout)||evidence.stderrSHA256!==digest(e.stderr)||
      evidence.finalSHA256!==digest(Buffer.from(e.final.bytes,'base64')))return false;
    e.phase='VERIFIED';persist(e.ticket,'VERIFIED',{evidence,proof});return true;
  };
  // Only synthetic test resources may be removed automatically. Real uncertain
  // dispatches and all their volumes are left for private checkpoint recovery.
  const disposeSynthetic=()=>{if(!fixture)fail('LIVE_CAPTURE_RETENTION_RESERVED');for(const e of pending.values()){
    if(e.container){try{docker(['rm','--force',e.container]);}catch{}}
    try{docker(['volume','rm',e.volume]);}catch{}}
  };
  return {captureService:{prepare,collect,verify,kernelEvidence},spawnNative,disposeSynthetic};
}

function readPrivateJSON(file) {
  if(!path.isAbsolute(file??'')||fs.lstatSync(file).isSymbolicLink()||!fs.lstatSync(file).isFile())fail('PRIVATE_RUNTIME_CONFIGURATION_REQUIRED');
  return JSON.parse(fs.readFileSync(file,'utf8'));
}
function readSession(config){
  const s=readPrivateJSON(config.sessionFile);
  if(s.image!==PINNED_IMAGE||!/^td613-egress-[a-f0-9]{32}$/.test(s.socketVolume)||
    !/^td613-auth-[a-f0-9]{32}$/.test(s.authVolume)||!sha(s.gateway)||
    s.stage!=='AUTHENTICATED_PROFILE_WITH_HARDENED_EGRESS')fail('ACCEPTED_PRIVATE_SESSION_REQUIRED');return s;
}
async function verifyGateway(s){
  const c=inspect(s.gateway),h=c.HostConfig;
  if(!c.State.Running||c.Image!==PINNED_IMAGE||h.NetworkMode!=='bridge'||!h.ReadonlyRootfs||h.Privileged||
    h.Binds?.length||c.Config.User!=='65534:65534'||!h.CapDrop?.includes('ALL')||
    !h.SecurityOpt?.includes('no-new-privileges=true')||h.LogConfig.Type!=='none'||
    c.Mounts.some(m=>m.Type==='volume'&&(m.Name!==s.socketVolume||m.Destination!=='/bridge'))||
    c.Mounts.some(m=>m.Type==='bind'||m.Name===s.authVolume)||
    c.Config.Env.some(v=>/^(OPENAI|GEMINI|ANTHROPIC|CODEX)/.test(v)))fail('ACTUAL_PROVIDER_GATEWAY_POLICY_HOLD');
  return c;
}
async function loadAuthority(spec){
  if(!spec?.module||!sha(spec.sha256)||!sha(spec.independentAcceptanceDigest))fail('EXTERNAL_DISPATCH_AUTHORITY_UNPROVISIONED');
  if(digest(fs.readFileSync(spec.module))!==spec.sha256)fail('DISPATCH_AUTHORITY_CODE_DRIFT');
  const service=await import(pathToFileURL(path.resolve(spec.module)).href);
  if(typeof service.authorizeAndConsume!=='function')fail('EXTERNAL_ATOMIC_DISPATCH_AUTHORITY_REQUIRED');return service;
}
function dependencyInventory(){
  const names=['docker-capture-runtime.mjs','native-runtime.mjs','native-settings.mjs','restricted-model-catalog.mjs','input-accounting.mjs','typed-math.mjs','read-account-metadata.mjs','private-account-receipt.mjs',
    '../experiment-b-codex-exec-adapter.mjs','../experiment-b-resumable/terminal-capture.mjs',
    'provider-egress/loopback-bridge.mjs','provider-egress/egress-gateway.mjs','provider-egress/tls-client-hello.mjs'];
  return Object.fromEntries(names.map(name=>[name,digest(fs.readFileSync(new URL(name,import.meta.url)))]));
}
function publicPolicy(c){return {schema:'TD613_NATIVE_RUNTIME_V1',image:PINNED_IMAGE,cliExecutableSHA256:CLI_SHA256,
  modelRequested:'gpt-6.1-sol',effortRequested:'xhigh',contextPolicy:c.inputPolicy??null,
  effectiveLimits:c.effectiveLimits??null,captureStorageBytes:c.captureStorageBytes,timeoutMs:c.timeoutMs,
  sourceModelDigest:c.sourceModelDigest??null,restrictedCatalogDigest:c.restrictedCatalogDigest??null,
  toolOutputRetention:{tokenLimit:c.toolOutputTokenLimit??null,typedResultUpperBoundBytes:MAX_TYPED_RESULT_BYTES,
    nativeEnvelopeUpperBoundBytes:c.nativeToolOutputEnvelopeUpperBoundBytes??null,evidenceDigest:c.toolOutputRetentionEvidenceDigest??null},
  math:{...MATH_POLICY,maxCallsPerTurn:c.mathMaxCallsPerTurn??null,sourceSHA256:digest(mathServerSource),
    configuredSourceSHA256:Number.isSafeInteger(c.mathMaxCallsPerTurn)?digest(mathServerSource.replace('++calls>64','++calls>'+c.mathMaxCallsPerTurn)):null},
  kernelReceiptCapacityBytes:c.kernelStorageBytes??null,
  dispatchAuthority:c.dispatchAuthority?{sha256:c.dispatchAuthority.sha256,independentAcceptanceDigest:c.dispatchAuthority.independentAcceptanceDigest}:null,
  tools:['td613_math.exact_integer'],supervisorAttempts:1,nativeSettings:NATIVE_SETTINGS,
  nativeRetrySuppression:'REQUESTED_ZERO_NOT_LIVE_ATTESTED',providerAttestation:'UNAVAILABLE',
  dependencies:dependencyInventory(),privateConfigurationDigest:digest(c),privateCheckpointPolicyDigest:c.privateCheckpointPolicyDigest??null,
  stage2Contract:c.stage2?.contract??null};}

export function createOperationalRuntime(config){
  const boundary=createBoundary(config,null);
  const assertProvisioned=async()=>{
    assertPrivateDirectory(config.privateCaptureDirectory);
    const limits=validateEffectiveLimits(config.effectiveLimits);
    const measurement=conservativeInputMeasurement('',config.inputPolicy);
    await loadAuthority(config.dispatchAuthority);
    const original=readPrivateJSON(config.sourceModelFile),restricted=readPrivateJSON(config.restrictedCatalogFile);
    const e=verifyRestrictedCatalog(original,restricted);
    if(e.sourceModelDigest!==config.sourceModelDigest||e.restrictedCatalogDigest!==config.restrictedCatalogDigest)
      fail('FROZEN_NATIVE_CATALOG_REQUIRED');
    enforceNoCompactionGuard(original,measurement,limits);
    if(!Number.isSafeInteger(config.mathMaxCallsPerTurn)||config.mathMaxCallsPerTurn<1||config.mathMaxCallsPerTurn>4096||
      !Number.isSafeInteger(config.kernelStorageBytes)||config.kernelStorageBytes<1||config.kernelStorageBytes>16*1024*1024||
      config.mathMaxCallsPerTurn*MAX_MATH_RECEIPT_BYTES>config.kernelStorageBytes||
      !Number.isSafeInteger(config.nativeToolOutputEnvelopeUpperBoundBytes)||config.nativeToolOutputEnvelopeUpperBoundBytes<0||
      !Number.isSafeInteger(config.toolOutputTokenLimit)||config.toolOutputTokenLimit<MAX_TYPED_RESULT_BYTES+config.nativeToolOutputEnvelopeUpperBoundBytes||
      !sha(config.toolOutputRetentionEvidenceDigest)||!sha(config.privateCheckpointPolicyDigest)||
      !sha(config.providerPolicyAcceptanceDigest))fail('COMPLETE_FROZEN_RUNTIME_POLICY_REQUIRED');
  };
  const observeRuntime=async()=>{
    const s=readSession(config);await verifyGateway(s);
    const id=idOf(docker(['create',...options,'--entrypoint','node',PINNED_IMAGE,'-e',
      "const f=require('fs'),c=require('crypto');console.log(JSON.stringify({sha256:c.createHash('sha256').update(f.readFileSync('/usr/local/bin/codex')).digest('hex'),node:process.version}))"]));
    let check;
    try{assertWorker(inspect(id),[]);check=docker(['start','--attach',id]);
      const state=inspect(id).State;if(state.ExitCode!==0||state.Running||state.OOMKilled)fail('RUNTIME_PROBE_TERMINAL_HOLD');
    }finally{try{docker(['rm',id]);}catch{}}
    const identity=JSON.parse(check);if(identity.sha256!==CLI_SHA256)fail('CLI_EXECUTABLE_DRIFT');
    return {...publicPolicy(config),node:identity.node,cliVersion:'0.166.0-alpha.5.1',
      isolation:{evidenceClass:'ACTUAL_NON_INFERENTIAL_PROBE_CONTAINER_POLICY_INSPECTED',
        workerNetwork:'none',providerProxy:'ACTUAL_GATEWAY_INSPECTED_EXACT_CONNECT_AND_VISIBLE_TLS_SNI',nonRoot:true,readOnlyRoot:true,
        capabilities:'ALL_DROPPED',hostBinds:0,credentialMountPolicy:'RUNTIME_OWNED_FIRST_PARTY_READ_ONLY',
        credentialMountObservedInLiveNativeChild:false},
      model_served_independently_attested:false,providerConfidentialityIndependentlyAttested:false,
      nativeContextCeilingIndependentlyAttested:false};
  };
  const confirmQuotaWindow=async windowId=>{
    // Account evidence may be obtained only by the existing supported reader.
    // A private fresh receipt is evidence, not a new spending authorization.
    if(typeof windowId!=='string'||!windowId||!Number.isSafeInteger(config.quotaMaxAgeMs)||
      config.quotaMaxAgeMs<1||config.quotaMaxAgeMs>3600000)fail('FINITE_QUOTA_FRESHNESS_POLICY_REQUIRED');
    const state=readSession(config);await verifyGateway(state);assertPrivateDirectory(config.privateCaptureDirectory);
    const name='quota-'+crypto.randomUUID()+'.json',inner='/custody/metadata/'+name;
    const metadataReader=fs.readFileSync(new URL('read-account-metadata.mjs',import.meta.url),'utf8');
    const source=`import fs from 'node:fs';import {spawn} from 'node:child_process';
      fs.mkdirSync('/custody/metadata',{recursive:true,mode:0o700});
      const bridge=spawn('node',['/tcp-repository/egress/loopback-bridge.mjs'],{stdio:'ignore'});
      await new Promise(r=>setTimeout(r,250));
      const child=spawn('node',['--input-type=module','-'],{cwd:'/tcp-repository/scripts/experiment-b-operational',stdio:['pipe','inherit','inherit']});
      child.stdin.end(${JSON.stringify(metadataReader)});
      child.on('exit',code=>{bridge.kill();process.exitCode=code??1;});`;
    const id=idOf(docker(['create',...options,'--mount',`type=volume,src=${state.socketVolume},dst=/bridge,readonly`,
      '--mount',`type=volume,src=${state.authVolume},dst=/custody`,'--env','CODEX_HOME=/custody/native',
      '--env','TD613_ACCOUNT_METADATA_PRIVATE_PATH='+inner,'--env','HTTP_PROXY=http://127.0.0.1:8787',
      '--env','HTTPS_PROXY=http://127.0.0.1:8787','--env','NO_PROXY=','--entrypoint','node',PINNED_IMAGE,'--input-type=module','-e',source]));
    assertWorker(inspect(id),[[state.socketVolume,'/bridge',false],[state.authVolume,'/custody',true]]);
    let q;
    try{
      const status=JSON.parse(docker(['start','--attach',id],undefined,60000).trim());
      if(status.status!=='METADATA_READ_COMPLETED'||status.privateReceiptWritten!==true)return false;
      const text=docker(['run','--rm',...options,'--mount',`type=volume,src=${state.authVolume},dst=/custody,readonly`,
        '--entrypoint','node',PINNED_IMAGE,'-e',`const fs=require('fs');const p=${JSON.stringify(inner)};const s=fs.lstatSync(p);if(!s.isFile()||s.size>65536||(s.mode&511)!==384)throw Error('PRIVATE_METADATA_FILE_REQUIRED');process.stdout.write(fs.readFileSync(p))`]);
      q=JSON.parse(text);
      const fd=fs.openSync(path.join(config.privateCaptureDirectory,name),'wx',0o600);
      try{fs.writeSync(fd,text);fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
    }finally{try{docker(['rm',id]);}catch{}}
    const age=Date.now()-Date.parse(q.observedAt);
    if(q.evidenceClass!=='NATIVE_NON_INFERENTIAL_ACCOUNT_METADATA'||q.status!=='METADATA_READ_COMPLETED'||
      q.authRoute!=='chatgpt'||q.ordinaryUsageAllowed!==true||q.spendControlReached===true||
      !Number.isFinite(age)||age<0||age>config.quotaMaxAgeMs)return false;
    try{return windowId===quotaWindowCommitment(q);}catch{return false;}
  };
  const measureInput=text=>{validateEffectiveLimits(config.effectiveLimits);return conservativeInputMeasurement(text,config.inputPolicy);};
  const freezeStage2Packets=async ({events,binding})=>{
    const s=config.stage2;if(!s?.packetFile||!sha(s.packetDigest)||s.contract?.binding!==binding||
      !s.contract.model||!s.contract.effort||!s.contract.independentPrincipalBinding||
      !s.contract.credentialClassBinding||!s.contract.witnessRootsBinding||
      !s.contract.semanticReviewPolicyDigest||!s.contract.proofReviewPolicyDigest||
      !s.contract.completeCandidatePolicyDigest||!s.contract.finiteResourcePolicyDigest)
      fail('INDEPENDENT_STAGE2_PACKET_SERVICE_REQUIRED');
    const packets=readPrivateJSON(s.packetFile);
    const acceptedHashes=events.filter(e=>e.type==='TURN_ACCEPTED').map(e=>e.hash);
    if(digest(packets)!==s.packetDigest||packets.binding!==binding||!packets.semanticMaskingReview||
      !packets.negativeControls||!packets.frozenCandidates||
      canonical(packets.acceptedTurnHashes)!==canonical(acceptedHashes)||
      packets.contractDigest!==digest(s.contract))fail('INDEPENDENT_COMPLETE_PACKET_BINDING_HOLD');
    return packets;
  };
  const collectIndependentStage2=async({packets,packetDigest})=>{
    const s=config.stage2;if(!s?.resultFile||!fs.existsSync(s.resultFile))return null;
    const result=readPrivateJSON(s.resultFile);
    if(digest(packets)!==packetDigest||result.packetDigest!==packetDigest||result.binding!==s.contract?.binding||
      !result.proofVerification||!result.semanticLeakageReview||!result.attestation||!result.resultSignature)fail('INDEPENDENT_STAGE2_RECEIPT_BINDING_HOLD');
    // Authenticity and independent witness verification remain in the protected
    // runner. Retrieval does not assert that an evaluator exists or is genuine.
    return result;
  };
  return {...boundary,assertProvisioned,observeRuntime,confirmQuotaWindow,measureInput,freezeStage2Packets,collectIndependentStage2};
}

/** Explicit non-inferential fixture factory. It cannot select a Codex program,
 * mount credentials or use the provider socket. Source is fixed by the test
 * harness and all output remains marked synthetic. Not a Flight runtime. */
export function createOfflineCaptureFixture(config,scenario='equal'){
  if(!['equal','mismatch','absent','stale','replaced','post-terminal','unexpected-tool','incomplete-tool','math','oversized'].includes(scenario))fail('SYNTHETIC_SCENARIO_REQUIRED');
  const source=`import fs from 'node:fs';import {spawn} from 'node:child_process';
    for await(const chunk of process.stdin){};
    const scenario=${JSON.stringify(scenario)};
    let math=[];
    if(scenario==='math'){
      const child=spawn('node',['--input-type=module','-e',${JSON.stringify(mathServerSource)}],{stdio:['pipe','pipe','inherit']});
      let text='';child.stdout.on('data',b=>text+=b);const done=new Promise(r=>child.on('close',r));
      child.stdin.end([JSON.stringify({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2024-11-05'}}),
        JSON.stringify({jsonrpc:'2.0',method:'notifications/initialized'}),JSON.stringify({jsonrpc:'2.0',id:2,method:'tools/list'}),
        JSON.stringify({jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'exact_integer',arguments:{operations:[{op:'add',a:'7',b:'8'},{op:'subtract',a:'7',b:'8'},{op:'multiply',a:'7',b:'8'},{op:'gcd',a:'7',b:'8'}]}}})].join('\\n')+'\\n');
      if(await done!==0)throw Error('SYNTHETIC_MCP_FAILED');const r=text.split('\\n').filter(Boolean).map(JSON.parse).find(x=>x.id===3).result;
      const item={id:'synthetic-tool',type:'mcp_tool_call',server:'td613_math',tool:'exact_integer',arguments:{operations:[{op:'add',a:'7',b:'8'},{op:'subtract',a:'7',b:'8'},{op:'multiply',a:'7',b:'8'},{op:'gcd',a:'7',b:'8'}]}};
      math=[{type:'item.started',item},{type:'item.completed',item:{...item,status:'completed',result:{content:r.content,structured_content:null}}}];
    }
    if(scenario==='absent')fs.unlinkSync('/capture/final');
    else if(scenario==='replaced'){fs.writeFileSync('/capture/other','SYNTHETIC_FINAL');fs.renameSync('/capture/other','/capture/final');}
    else if(scenario!=='stale')fs.writeFileSync('/capture/final',scenario==='mismatch'?'DIFFERENT':'SYNTHETIC_FINAL');
    const events=[{type:'thread.started',thread_id:'SYNTHETIC_THREAD'},{type:'turn.started'},...math,
      ...(scenario==='unexpected-tool'?[{type:'item.started',item:{type:'command_execution',id:'forbidden'}}]:[]),
      ...(scenario==='incomplete-tool'?[{type:'item.started',item:{type:'mcp_tool_call',id:'unfinished',server:'td613_math',tool:'exact_integer'}}]:[]),
      ...(scenario==='oversized'?[{type:'item.completed',item:{id:'long',type:'reasoning',text:'x'.repeat(17*1024*1024)}}]:[]),
      {type:'item.completed',item:{id:'answer',type:'agent_message',text:'SYNTHETIC_FINAL'}},{type:'turn.completed',usage:{input_tokens:1,output_tokens:1}}];
    if(scenario==='post-terminal')events.push({type:'turn.started'});
    process.stdout.write(events.map(JSON.stringify).join('\\n')+'\\n');`;
  return createBoundary(config,source);
}
