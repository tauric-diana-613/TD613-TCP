import fs from 'node:fs';
import path from 'node:path';
import {spawnSync,spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const sourceRoot=path.resolve(process.env.TD613_REVIEW_CHECKOUT??'work/tcp-operational-1623');
const {validatePrivateAccountReceiptPath,writePrivateAccountReceipt}=await import(pathToFileURL(path.join(sourceRoot,'scripts/experiment-b-operational/private-account-receipt.mjs')));
const stateFile=process.env.TD613_OPERATIONAL_STATE_FILE;
const authStateFile=validatePrivateAccountReceiptPath(process.env.TD613_AUTH_STATE_FILE);
if(!path.isAbsolute(stateFile??'')||fs.lstatSync(stateFile).isSymbolicLink())throw Error('PRIVATE_SESSION_REQUIRED');
const state=JSON.parse(fs.readFileSync(stateFile,'utf8'));
if(state.stage!=='RESTRICTED_EGRESS_READY'||!/^sha256:[a-f0-9]{64}$/.test(state.image)||!/^td613-egress-[a-f0-9]{32}$/.test(state.socketVolume)||!/^td613-auth-[a-f0-9]{32}$/.test(state.authVolume)||!/^[a-f0-9]{64}$/.test(state.gateway))throw Error('PRIVATE_SESSION_BINDING_REJECTED');
const docker=args=>{const r=spawnSync('docker',args,{encoding:'utf8',windowsHide:true,timeout:30000,maxBuffer:256*1024});if(r.status!==0)throw Error('AUTH_MANAGEMENT_OPERATION_FAILED');return r.stdout.trim();};
const gateway=JSON.parse(docker(['inspect',state.gateway]))[0];if(!gateway.State.Running||gateway.Image!==state.image)throw Error('CURRENT_EGRESS_SERVICE_REQUIRED');
const boot='umask 077; mkdir -p /custody/native; node /tcp-repository/egress/loopback-bridge.mjs >/scratch/bridge.log 2>&1 & sleep 1; exec /usr/local/bin/codex login --device-auth -c cli_auth_credentials_store="file" -c forced_login_method="chatgpt" -c analytics.enabled=false -c check_for_update_on_startup=false';
const id=docker(['create','--read-only','--network','none','--log-driver','none','--cap-drop','ALL','--security-opt','no-new-privileges=true','--pids-limit','32','--memory','128m','--cpus','1','--ipc','none','--user','65534:65534','--mount',`type=volume,src=${state.socketVolume},dst=/bridge,readonly`,'--mount',`type=volume,src=${state.authVolume},dst=/custody`,'--tmpfs','/scratch:rw,noexec,nosuid,nodev,size=16m,uid=65534,gid=65534','--workdir','/scratch','--env','HOME=/scratch','--env','CODEX_HOME=/custody/native','--env','HTTPS_PROXY=http://127.0.0.1:8787','--env','HTTP_PROXY=http://127.0.0.1:8787','--env','NO_PROXY=','--env','ALL_PROXY=','--entrypoint','sh',state.image,'-c',boot]);
if(!/^[a-f0-9]{64}$/.test(id))throw Error('AUTH_CONTAINER_ID_REQUIRED');
const inspected=JSON.parse(docker(['inspect',id]))[0];
if(inspected.HostConfig.NetworkMode!=='none'||inspected.HostConfig.LogConfig.Type!=='none'||inspected.HostConfig.Binds?.length||inspected.HostConfig.Privileged||inspected.Config.User!=='65534:65534')throw Error('AUTH_CONTAINER_POLICY_REJECTED');
writePrivateAccountReceipt(authStateFile,{...state,authContainer:id,stage:'SUPPORTED_DEVICE_AUTH_INITIATED'});
const receipt={evidenceClass:'SUPPORTED_FIRST_PARTY_DEVICE_AUTH',image:state.image,workerNetwork:'none',gatewayOrigins:['auth.openai.com:443','chatgpt.com:443'],hostBindMounts:0,ambientCredentialsCopied:false,modelRequests:0,stage:'AUTH_STARTING'};
let collected='',presented=false,finished=false;
const child=spawn('docker',['start','--attach',id],{windowsHide:true,stdio:['ignore','pipe','pipe']});
const timer=setTimeout(()=>{child.kill();try{docker(['stop','--time','2',id]);}catch{}},16*60*1000);
function observe(chunk){
 collected=(collected+chunk.toString('utf8').replace(/\x1b\[[0-9;]*m/g,'')).slice(-40000);
 const url=collected.match(/https:\/\/auth\.openai\.com\/codex\/device/);
 const code=collected.match(/\b[A-Z0-9]{4,8}-[A-Z0-9]{4,8}\b/);
 if(!presented&&url&&code){presented=true;receipt.stage='WAITING_FOR_ACCOUNT_HOLDER';fs.writeFileSync('work/provider-egress/auth-public-receipt.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({stage:receipt.stage,verificationURL:url[0],deviceCode:code[0],expiresAfterSeconds:900}));}
}
child.stdout.on('data',observe);child.stderr.on('data',observe);
child.on('exit',code=>{if(finished)return;finished=true;clearTimeout(timer);receipt.exitCode=code;receipt.stage=code===0?'FIRST_PARTY_SIGN_IN_COMPLETED':presented?'SIGN_IN_NOT_COMPLETED':'SIGN_IN_CHALLENGE_UNAVAILABLE';if(!presented){if(/not enabled|enable device code/i.test(collected))receipt.dependency='PROVIDER_DEVICE_AUTH_SETTING';else if(/device code request failed with status (\d+)/.test(collected))receipt.providerStatus=Number(collected.match(/device code request failed with status (\d+)/)[1]);}if(code!==0)writePrivateAccountReceipt(authStateFile+'.diagnostic.json',{stage:receipt.stage,output:collected});fs.writeFileSync('work/provider-egress/auth-public-receipt.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));});
child.on('error',()=>{clearTimeout(timer);receipt.stage='AUTH_INTERFACE_UNAVAILABLE';fs.writeFileSync('work/provider-egress/auth-public-receipt.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));});
