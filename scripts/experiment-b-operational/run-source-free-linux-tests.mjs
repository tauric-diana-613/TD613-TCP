import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=fileURLToPath(new URL('../../',import.meta.url));
const entries=['tests/experiment-b-resumable.test.mjs','tests/experiment-b-final-integration.test.mjs',
  'tests/experiment-b-private-account-receipt.test.mjs','tests/experiment-b-runtime-integration.test.mjs',
  'scripts/experiment-b-operational/provider-egress/tls-client-hello.test.mjs'];
const files=new Map();
function add(name){
  name=name.split(path.sep).join('/');if(files.has(name))return;
  if(name.startsWith('../')||!name.endsWith('.mjs')&&!name.endsWith('.js'))throw Error('SOURCE_CLOSURE_ESCAPE');
  const text=fs.readFileSync(path.join(root,name),'utf8');files.set(name,text);
  const refs=[...text.matchAll(/(?:from\s*|import\s*\(|new URL\s*\()\s*['"]([^'"]+)['"]/g)].map(m=>m[1]);
  for(const ref of refs){if(ref.startsWith('node:'))continue;if(!ref.startsWith('.'))continue;
    const resolved=path.relative(root,path.resolve(root,path.dirname(name),ref));
    if(/\.(mjs|js)$/.test(resolved))add(resolved);
  }
}
entries.forEach(add);
const payload=JSON.stringify([...files].map(([name,text])=>({name,text})));
if(Buffer.byteLength(payload)>8*1024*1024)throw Error('SOURCE_CLOSURE_BOUND');
const invoke=(args,input)=>{const r=spawnSync('docker',args,{input,encoding:'utf8',windowsHide:true,timeout:60000,maxBuffer:4*1024*1024,stdio:['pipe','pipe','pipe']});if(r.error)throw Error('LINUX_TEST_CONTROL_HOLD');return r;};
const image='sha256:3ab1d8a775153425c45ac8c6434c8717fae5866d9dc3e494dc7eb8550d71c75f';
const volume='td613-public-tests-'+crypto.randomBytes(16).toString('hex');
try{
  if(invoke(['volume','create',volume]).status!==0)throw Error('LINUX_TEST_VOLUME_HOLD');
  const install="const fs=require('fs'),p=require('path');let t='';process.stdin.on('data',b=>t+=b);process.stdin.on('end',()=>{for(const f of JSON.parse(t)){if(f.name.includes('..')||p.isAbsolute(f.name))throw Error('ESCAPE');const n=p.join('/source',f.name);fs.mkdirSync(p.dirname(n),{recursive:true});fs.writeFileSync(n,f.text,{flag:'wx',mode:292});}})";
  const loaded=invoke(['run','--rm','--interactive','--network','none','--read-only','--cap-drop','ALL','--security-opt','no-new-privileges=true',
    '--user','0:0','--mount',`type=volume,src=${volume},dst=/source`,'--entrypoint','node',image,'-e',install],payload);
  if(loaded.status!==0)throw Error('LINUX_TEST_SOURCE_LOAD_HOLD');
  const result=invoke(['run','--rm','--network','none','--read-only','--log-driver','none','--cap-drop','ALL',
    '--security-opt','no-new-privileges=true','--pids-limit','64','--memory','512m','--cpus','1','--ipc','none','--user','65534:65534',
    '--mount',`type=volume,src=${volume},dst=/tcp-repository,readonly`,'--tmpfs','/tmp:rw,noexec,nosuid,nodev,size=128m',
    '--workdir','/tcp-repository','--env','HOME=/tmp','--entrypoint','node',image,'--test','--test-concurrency=1',...entries]);
  process.stdout.write(result.stdout);process.stderr.write(result.stderr);
  console.log(JSON.stringify({evidenceClass:'ACTUAL_OFFLINE_LINUX_SYNTHETIC_SUITES',image,node:'v24.4.0',
    sourceClosureFiles:files.size,sourceClosureSHA256:crypto.createHash('sha256').update(payload).digest('hex'),
    exitCode:result.status,modelRequests:0,protectedArchiveOperations:0,credentialMounts:0,network:'none'}));
  process.exitCode=result.status??1;
}finally{invoke(['volume','rm',volume]);}
