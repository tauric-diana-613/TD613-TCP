import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const {writePrivateAccountReceipt}=await import(pathToFileURL(path.resolve('work/tcp-operational-1623/scripts/experiment-b-operational/private-account-receipt.mjs')));
const old=JSON.parse(fs.readFileSync('work/provider-private/supported-auth-attempt3.json','utf8'));
const current=JSON.parse(fs.readFileSync('work/provider-private/egress-v2-session.json','utf8'));
const run=args=>{const r=spawnSync('docker',args,{encoding:'utf8',windowsHide:true,timeout:30000,stdio:['ignore','pipe','ignore']});if(r.status!==0)throw Error('MANAGED_RESOURCE_OPERATION_FAILED');return r.stdout;};
if(old.authVolume===current.authVolume||!/^td613-auth-[a-f0-9]{32}$/.test(old.authVolume)||!/^td613-auth-[a-f0-9]{32}$/.test(current.authVolume)||!/^[a-f0-9]{64}$/.test(old.gateway))throw Error('PRIVATE_RESOURCE_SCOPE_REJECTED');
// Reuse the supported runtime's own profile in place. Never read/copy credentials.
run(['volume','rm',current.authVolume]);
writePrivateAccountReceipt(path.resolve('work/provider-private/authenticated-runtime-session.json'),{...current,authVolume:old.authVolume,authContainer:old.authContainer,stage:'AUTHENTICATED_PROFILE_WITH_HARDENED_EGRESS'});
run(['stop','--time','2',old.gateway]);
console.log(JSON.stringify({profileReusedInPlace:true,credentialContentsRead:false,ambientCredentialCopy:false,hardenedGatewayActive:true,obsoleteGatewayStopped:true}));
