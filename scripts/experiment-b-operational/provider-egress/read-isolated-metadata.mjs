import fs from 'node:fs';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const state=JSON.parse(fs.readFileSync('work/provider-private/authenticated-runtime-session.json','utf8'));
const source=fs.readFileSync('work/tcp-operational-1623/scripts/experiment-b-operational/read-account-metadata.mjs','utf8');
const target='/custody/metadata/account-'+crypto.randomUUID()+'.json';
const boot='umask 077; mkdir -p /custody/metadata; node /tcp-repository/egress/loopback-bridge.mjs >/scratch/bridge.log 2>&1 & sleep 1; exec node --input-type=module -';
const args=['run','--rm','--interactive','--read-only','--network','none','--log-driver','none','--cap-drop','ALL','--security-opt','no-new-privileges=true','--pids-limit','32','--memory','128m','--cpus','1','--ipc','none','--user','65534:65534','--mount',`type=volume,src=${state.socketVolume},dst=/bridge,readonly`,'--mount',`type=volume,src=${state.authVolume},dst=/custody`,'--tmpfs','/scratch:rw,noexec,nosuid,nodev,size=16m,uid=65534,gid=65534','--workdir','/tcp-repository/scripts/experiment-b-operational','--env','HOME=/scratch','--env','CODEX_HOME=/custody/native','--env','HTTPS_PROXY=http://127.0.0.1:8787','--env','HTTP_PROXY=http://127.0.0.1:8787','--env','NO_PROXY=','--env','ALL_PROXY=','--env','TD613_ACCOUNT_METADATA_PRIVATE_PATH='+target,'--entrypoint','sh',state.image,'-c',boot];
const result=spawnSync('docker',args,{input:source,encoding:'utf8',windowsHide:true,timeout:60000,maxBuffer:65536});
let status;try{status=JSON.parse(result.stdout.trim());}catch{status={status:'ISOLATED_METADATA_INTERFACE_FAILED'};}
const receipt={evidenceClass:'ACTUAL_RESTRICTED_NATIVE_METADATA_READ',sourceRevision:'46f40e5768afeceb3304c12170f334ec590dfecf',image:state.image,exitCode:result.status,status:status.status,modelRequests:0,privateReceiptWritten:status.privateReceiptWritten===true,identityAndQuotaPublished:false,workerNetwork:'none',providerEgress:'EXACT_CONNECT_AND_TLS_SNI_ALLOWLIST'};
fs.writeFileSync('work/provider-egress/isolated-metadata-public-receipt.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
if(result.status!==0||status.status!=='METADATA_READ_COMPLETED'||!status.privateReceiptWritten)process.exitCode=1;
