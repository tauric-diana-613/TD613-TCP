import fs from 'node:fs';
import {createInterface} from 'node:readline';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {CustodyStore} from './store.mjs';
import {digest} from '../../experiment-b-resumable/journal.mjs';
import {windowsAudit} from './windows-audit.mjs';

export async function handleCustodyRequest(store,request){
  const reply=body=>({...body,requestId:request?.requestId??null});
  try{
    if(!request||typeof request.operation!=='string'||typeof request.requestId!=='string'||!request.requestId||request.requestId.length>128||
      Object.keys(request).some(k=>!['requestId','operation','mandateId','episode','payload'].includes(k)))throw Error('DECLARED_CUSTODY_OPERATION_REQUIRED');
    const m=store.mandate(request.mandateId);
    if(request.episode!==m.context.episode)throw Error('CUSTODIAN_EPISODE_SCOPE_HOLD');
    const exact=(v,keys)=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&
      Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k));
    if(request.operation==='dispatch.lookup'&&!exact(request.payload,['attempt']))throw Error('PERMIT_METADATA_ONLY_REQUEST_REQUIRED');
    if(request.operation==='terminal.record'&&(!exact(request.payload,['attempt','evidence'])||
      !exact(request.payload.evidence,['journalHash','finalSHA256','jsonlSHA256'])))throw Error('TERMINAL_METADATA_ONLY_REQUEST_REQUIRED');
    let result;
    switch(request.operation){
      case 'dispatch.authorize':result=await store.authorizeAndConsume(request.mandateId,request.payload);break;
      case 'dispatch.lookup':result=store.lookup(request.payload.attempt,request.mandateId);break;
      case 'anchor.read':result=store.anchor(request.episode);break;
      case 'anchor.publish':result=store.publishAnchor(request.episode,request.payload);break;
      case 'terminal.record':{
        if(store.anchor(request.episode)?.hash!==request.payload.evidence?.journalHash)throw Error('ANCHORED_TERMINAL_COMMITMENT_REQUIRED');
        result=store.recordTerminal(request.payload.attempt,request.payload.evidence,request.mandateId);break;
      }
      default:throw Error('UNDECLARED_CUSTODY_OPERATION_REFUSED');
    }
    return reply({status:'OK',result});
  }catch(error){
    const raw=String(error.code??error.message??'');
    const code=/^[A-Z][A-Z0-9_]{1,100}$/.test(raw)?raw:'CUSTODY_TRANSACTION_OR_SCOPE_HOLD';
    let receipt=null;try{receipt=store.refusal(code,digest(request??null));}catch{}
    return reply({status:'HOLD',code,receipt});
  }
}

// Production entry: the Windows broker owns stdin and never accepts key/policy
// overrides from IPC. No init, approve, revoke, arbitrary signing or file API.
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  let store;
  try{
    const configFile=process.argv[2],c=JSON.parse(fs.readFileSync(configFile,'utf8'));
    if(process.platform!=='win32')throw Error('WINDOWS_CUSTODIAN_IDENTITY_REQUIRED');
    const sid=spawnSync(c.pwsh,['-NoLogo','-NoProfile','-NonInteractive','-Command',
      '$i=[Security.Principal.WindowsIdentity]::GetCurrent();if(@($i.Groups|ForEach-Object{$_.Value}) -contains "S-1-5-32-544"){exit 2};$i.User.Value'],{encoding:'utf8',windowsHide:true,timeout:5000});
    if(sid.status!==0||sid.stdout.trim()!==c.custodianSid||c.custodianSid===c.controllerSid||c.custodianSid===c.engineeringSid)throw Error('SEPARATE_CUSTODIAN_OS_IDENTITY_REQUIRED');
    const key=fs.readFileSync(c.keyFile),checkpointKey=fs.readFileSync(c.checkpointKeyFile);
    store=new CustodyStore({...c,key,checkpointKey,externalAudit:windowsAudit(c)});key.fill(0);checkpointKey.fill(0);
    const input=createInterface({input:process.stdin,crlfDelay:Infinity});
    for await(const line of input){
      if(Buffer.byteLength(line)>65536){process.stdout.write('{"status":"HOLD","code":"CUSTODY_REQUEST_BOUND"}\n');continue;}
      let request;try{request=JSON.parse(line);}catch{process.stdout.write('{"status":"HOLD","code":"CUSTODY_REQUEST_JSON"}\n');continue;}
      process.stdout.write(JSON.stringify(await handleCustodyRequest(store,request))+'\n');
    }
  }catch{process.stderr.write('CUSTODIAN_STARTUP_OR_IDENTITY_HOLD\n');process.exitCode=1;}
  finally{store?.close();}
}
