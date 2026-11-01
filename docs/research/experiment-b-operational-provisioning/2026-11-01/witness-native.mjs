import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
const run=args=>spawnSync('docker',args,{encoding:'utf8',windowsHide:true,timeout:120000,maxBuffer:256*1024});
try {
 const built=run(['build','--quiet','--network','none','work/operational/build']);
 const image=built.stdout.trim().split(/\r?\n/).at(-1);
 if(built.status!==0||!/^sha256:[a-f0-9]{64}$/.test(image??''))throw Error('NATIVE_IMAGE_BUILD_FAILED');
 const policy=['run','--rm','--network','none','--read-only','--cap-drop','ALL','--security-opt','no-new-privileges=true','--pids-limit','32','--memory','128m','--cpus','1','--user','65534:65534','--ipc','none','--workdir','/scratch','--tmpfs','/scratch:rw,noexec,nosuid,nodev,size=16m,uid=65534,gid=65534','--env','HOME=/scratch','--env','CODEX_HOME=/scratch/.codex'];
 const version=run([...policy,image,'--version']);
 if(version.status!==0||version.stdout.trim()!=='codex-cli 0.166.0-alpha.5.1')throw Error('NATIVE_OFFLINE_VERSION_MISMATCH');
 const hash=run([...policy,'--entrypoint','sha256sum',image,'/usr/local/bin/codex']);
 const sha=hash.stdout.trim().split(/\s+/)[0];
 const expected=JSON.parse(fs.readFileSync('work/operational/native-package-receipt.json','utf8')).executableSHA256;
 if(hash.status!==0||sha!==expected)throw Error('NATIVE_IMAGE_ARTIFACT_MISMATCH');
 const receipt={evidenceClass:'ACTUAL_OFFLINE_NATIVE_VERSION_ONLY',image,version:version.stdout.trim(),executableSHA256:sha,network:'none',hostMounts:0,credentialsInjected:0,modelRequests:0,exitCode:version.status,protectedArchiveOperations:0};
 fs.writeFileSync('work/operational/native-version-receipt.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
}catch(error){console.log(JSON.stringify({nativeVersionWitness:false,errorCode:error.message}));process.exitCode=1;}
