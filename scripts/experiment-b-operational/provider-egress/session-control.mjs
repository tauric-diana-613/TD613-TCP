import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
const sourceRoot=path.resolve(process.env.TD613_REVIEW_CHECKOUT??'work/tcp-operational-1623');
const {validatePrivateAccountReceiptPath,writePrivateAccountReceipt}=await import(pathToFileURL(path.join(sourceRoot,'scripts/experiment-b-operational/private-account-receipt.mjs')));
const stateFile=validatePrivateAccountReceiptPath(process.env.TD613_OPERATIONAL_STATE_FILE);
const image=JSON.parse(fs.readFileSync('work/provider-egress/image.json','utf8')).image;
if(!/^sha256:[a-f0-9]{64}$/.test(image))throw Error('PINNED_IMAGE_REQUIRED');
const docker=args=>{const r=spawnSync('docker',args,{encoding:'utf8',windowsHide:true,timeout:60000,maxBuffer:1024*1024});if(r.status!==0)throw Object.assign(Error('DOCKER_OPERATION_FAILED'),{exitCode:r.status});return r.stdout.trim();};
const suffix=crypto.randomUUID().replaceAll('-','');
const state={image,socketVolume:'td613-egress-'+suffix,authVolume:'td613-auth-'+suffix,createdContainers:[],stage:'PROVISIONING'};
const common=['--read-only','--cap-drop','ALL','--security-opt','no-new-privileges=true','--pids-limit','32','--memory','128m','--cpus','1','--ipc','none'];
try{
 docker(['volume','create',state.socketVolume]);docker(['volume','create',state.authVolume]);
 docker(['run','--rm','--network','none','--read-only','--cap-drop','ALL','--cap-add','CHOWN','--security-opt','no-new-privileges=true','--user','0:0','--mount',`type=volume,src=${state.socketVolume},dst=/bridge`,'--mount',`type=volume,src=${state.authVolume},dst=/custody`,'--entrypoint','node',image,'-e',"const fs=require('fs');for(const p of ['/bridge','/custody']){fs.chmodSync(p,0o700);fs.chownSync(p,65534,65534)}"]);
 const gateway=docker(['create',...common,'--network','bridge','--log-driver','none','--user','65534:65534','--mount',`type=volume,src=${state.socketVolume},dst=/bridge`,'--entrypoint','node',image,'/tcp-repository/egress/egress-gateway.mjs']);
 if(!/^[a-f0-9]{64}$/.test(gateway))throw Error('CONTAINER_ID_REQUIRED');state.gateway=gateway;state.createdContainers.push(gateway);docker(['start',gateway]);
 let ready=false;for(let i=0;i<10;i++){try{docker(['exec',gateway,'node','-e',"if(!require('fs').existsSync('/bridge/gateway.sock'))process.exit(1)"]);ready=true;break;}catch{await new Promise(r=>setTimeout(r,250));}}
 if(!ready)throw Error('GATEWAY_START_FAILED');
 const probe=docker(['create',...common,'--network','none','--log-driver','none','--user','65534:65534','--mount',`type=volume,src=${state.socketVolume},dst=/bridge,readonly`,'--tmpfs','/scratch:rw,noexec,nosuid,nodev,size=16m,uid=65534,gid=65534','--entrypoint','sh',image,'-c','node /tcp-repository/egress/loopback-bridge.mjs >/scratch/bridge.log 2>&1 & sleep 1; node /tcp-repository/egress/egress-probe.mjs']);
 if(!/^[a-f0-9]{64}$/.test(probe))throw Error('CONTAINER_ID_REQUIRED');state.createdContainers.push(probe);
 const inspection=JSON.parse(docker(['inspect',probe]))[0];
 if(inspection.HostConfig.NetworkMode!=='none'||inspection.HostConfig.ReadonlyRootfs!==true||inspection.HostConfig.Binds?.length||inspection.HostConfig.Privileged||inspection.Config.User!=='65534:65534'||inspection.Mounts.some(m=>m.Type!=='volume'||m.RW!==false))throw Error('PROBE_SECURITY_POLICY_REJECTED');
 const output=docker(['start','--attach',probe]);
 const observed=JSON.parse(output.trim().split(/\r?\n/).at(-1));
 const ended=JSON.parse(docker(['inspect',probe]))[0].State;
 const successful=ended.ExitCode===0 && observed['auth.openai.com:443']?.verifiedTLS===true && observed['chatgpt.com:443']?.verifiedTLS===true;
 fs.writeFileSync('work/provider-egress/egress-observation.json',JSON.stringify({image,...observed,workerNetwork:'none',sharedSocketMount:'read_only_named_volume',hostBindMounts:0,exitCode:ended.ExitCode},null,2)+'\n');
 docker(['rm',probe]);state.createdContainers=state.createdContainers.filter(id=>id!==probe);
 if(!successful)throw Error('EGRESS_ENFORCEMENT_PROBE_FAILED');
 state.stage='RESTRICTED_EGRESS_READY';writePrivateAccountReceipt(stateFile,state);
 console.log(JSON.stringify({status:state.stage,privateStateWritten:true,modelRequests:0,allowedOrigins:['auth.openai.com:443','chatgpt.com:443'],actualEgressProbePassed:true}));
}catch(error){
 for(const id of state.createdContainers)if(/^[a-f0-9]{64}$/.test(id)){try{docker(['rm','--force',id]);}catch{}}
 for(const v of [state.socketVolume,state.authVolume])if(/^td613-(egress|auth)-[a-f0-9]{32}$/.test(v)){try{docker(['volume','rm',v]);}catch{}}
 console.log(JSON.stringify({status:'EGRESS_PROVISIONING_HELD',errorCode:error.message,modelRequests:0}));process.exitCode=1;
}
