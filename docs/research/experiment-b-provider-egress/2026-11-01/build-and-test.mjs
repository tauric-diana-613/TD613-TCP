import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const run=args=>spawnSync('docker',args,{encoding:'utf8',windowsHide:true,timeout:180000,maxBuffer:1024*1024});
try{
 const build=run(['build','--quiet','--network','none','work/provider-egress/build']);const image=build.stdout.trim().split(/\r?\n/).at(-1);
 if(build.status!==0||!/^sha256:[a-f0-9]{64}$/.test(image??''))throw Error('PUBLIC_FIXTURE_IMAGE_BUILD_FAILED');
 fs.writeFileSync('work/provider-egress/image.json',JSON.stringify({image})+'\n');
 const r=run(['run','--rm','--network','none','--read-only','--cap-drop','ALL','--security-opt','no-new-privileges=true','--pids-limit','32','--memory','128m','--cpus','1','--user','65534:65534','--ipc','none','--tmpfs','/scratch:rw,noexec,nosuid,nodev,size=16m,uid=65534,gid=65534','--env','TMPDIR=/scratch',image,'--test','--test-reporter=tap','/tcp-repository/tests/experiment-b-private-account-receipt.test.mjs']);
 fs.writeFileSync('work/provider-egress/pr1623-linux-tests.tap',r.stdout+r.stderr);
 console.log(JSON.stringify({image,exitCode:r.status,counts:(r.stdout.match(/# (?:tests|pass|fail|skipped) \d+/g)||[])}));
 if(r.status!==0)process.exitCode=1;
}catch(error){console.log(JSON.stringify({errorCode:error.message}));process.exitCode=1;}
