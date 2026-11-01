import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const state=JSON.parse(fs.readFileSync('work/provider-private/authenticated-runtime-session.json','utf8'));
const original=JSON.parse(fs.readFileSync('work/provider-private/supported-auth-attempt3.json','utf8'));
if(original.authVolume!==state.authVolume||original.authContainer!==state.authContainer)throw Error('AUTH_PROFILE_LINEAGE_REQUIRED');
const code="const fs=require('fs');const d=fs.statSync('/custody/native'),f=fs.statSync('/custody/native/auth.json');console.log(JSON.stringify({directoryMode:(d.mode&511).toString(8),fileMode:(f.mode&511).toString(8),ownerIsRuntimeUser:f.uid===65534,regularFile:f.isFile(),nonEmpty:f.size>0}))";
const result=spawnSync('docker',['run','--rm','--network','none','--read-only','--cap-drop','ALL','--security-opt','no-new-privileges=true','--user','65534:65534','--mount','type=volume,src='+state.authVolume+',dst=/custody,readonly','--entrypoint','node',state.image,'-e',code],{encoding:'utf8',windowsHide:true,timeout:30000,stdio:['ignore','pipe','ignore']});
if(result.status!==0){console.log('CREDENTIAL_METADATA_CHECK_FAILED');process.exit(1);}
const observed=JSON.parse(result.stdout);
const inspection=spawnSync('docker',['inspect',state.gateway,state.authContainer],{encoding:'utf8',windowsHide:true,timeout:30000,stdio:['ignore','pipe','ignore']});
if(inspection.status!==0)throw Error('ACTUAL_CREDENTIAL_MOUNT_INSPECTION_REQUIRED');
const [gateway,auth]=JSON.parse(inspection.stdout);
const receipt={evidenceClass:'ACTUAL_AUTH_FILE_PERMISSION_METADATA_ONLY',...observed,contentsRead:false,ambientStoreCopied:false,
 gatewayAuthVolumeMounted:gateway.Mounts.some(m=>m.Name===state.authVolume),
 gatewayCredentialEnvironment:gateway.Config.Env.some(e=>/^(OPENAI_API_KEY|GEMINI_API_KEY|ANTHROPIC_API_KEY|CODEX_ACCESS_TOKEN)=/.test(e)),
 authWorkerNetwork:auth.HostConfig.NetworkMode,authLogDriver:auth.HostConfig.LogConfig.Type,
 authHostBindMounts:auth.Mounts.filter(m=>m.Type==='bind').length,
 bridgeMountReadOnly:auth.Mounts.find(m=>m.Name===original.socketVolume)?.RW===false,
 currentGatewaySocketScopeMatched:gateway.Mounts.some(m=>m.Name===state.socketVolume&&m.Destination==='/bridge'),
 originalLoginProfilePreserved:true};
if(observed.directoryMode!=='700'||observed.fileMode!=='600'||!observed.ownerIsRuntimeUser||!observed.regularFile||!observed.nonEmpty)throw Error('PRIVATE_CREDENTIAL_MODE_REQUIRED');
if(receipt.gatewayAuthVolumeMounted||receipt.gatewayCredentialEnvironment||receipt.authWorkerNetwork!=='none'||receipt.authLogDriver!=='none'||receipt.authHostBindMounts!==0||!receipt.bridgeMountReadOnly||!receipt.currentGatewaySocketScopeMatched)throw Error('CREDENTIAL_CONFINEMENT_POLICY_REQUIRED');
fs.writeFileSync('work/provider-egress/credential-confinement-receipt.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
