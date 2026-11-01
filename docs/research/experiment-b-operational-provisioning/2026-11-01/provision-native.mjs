import fs from 'node:fs';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
try {
  const version='0.166.0-alpha.5.1-linux-x64';
  const response=await fetch('https://registry.npmjs.org/@openai%2Fcodex/'+version,{signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw Error('PACKAGE_METADATA_UNAVAILABLE');
  const metadata=await response.json();
  if(metadata.version!==version || !metadata.dist.integrity.startsWith('sha512-') || new URL(metadata.dist.tarball).hostname!=='registry.npmjs.org')throw Error('PACKAGE_BINDING_REJECTED');
  const root='work/operational/build';fs.mkdirSync(root,{recursive:true});
  let bytes;
  if(fs.existsSync(root+'/native.tgz')) bytes=fs.readFileSync(root+'/native.tgz');
  else {const download=await fetch(metadata.dist.tarball,{signal:AbortSignal.timeout(180000)});if(!download.ok)throw Error('PACKAGE_DOWNLOAD_FAILED');bytes=Buffer.from(await download.arrayBuffer());}
  const integrity='sha512-'+crypto.createHash('sha512').update(bytes).digest('base64');
  if(integrity!==metadata.dist.integrity)throw Error('PACKAGE_INTEGRITY_REJECTED');
  fs.writeFileSync(root+'/native.tgz',bytes);
  const listing=spawnSync('tar',['-tzf',root+'/native.tgz'],{encoding:'utf8',windowsHide:true});
  if(listing.status!==0)throw Error('PACKAGE_LIST_FAILED');
  const entries=listing.stdout.trim().split(/\r?\n/).filter(x=>/\/codex$/.test(x));
  if(entries.length!==1 || !/^package\/[A-Za-z0-9_./-]+$/.test(entries[0]) || entries[0].split('/').includes('..'))throw Error('PACKAGE_EXECUTABLE_AMBIGUOUS');
  const listingVerbose=spawnSync('tar',['-tvzf',root+'/native.tgz',entries[0]],{encoding:'utf8',windowsHide:true,maxBuffer:65536});
  if(listingVerbose.status!==0 || !/^-[rwx-]+\s+\d+\s+\S+\s+\S+\s+(\d+)/.test(listingVerbose.stdout))throw Error('NATIVE_SIZE_UNAVAILABLE');
  const declaredSize=Number(listingVerbose.stdout.match(/^-[rwx-]+\s+\d+\s+\S+\s+\S+\s+(\d+)/)[1]);
  if(!Number.isSafeInteger(declaredSize)||declaredSize>512*1024*1024)throw Error('NATIVE_SIZE_BOUND');
  const fd=fs.openSync(root+'/codex','wx');
  let extracted;try{extracted=spawnSync('tar',['-xOf',root+'/native.tgz',entries[0]],{windowsHide:true,timeout:30000,stdio:['ignore',fd,'pipe'],maxBuffer:65536});}finally{fs.closeSync(fd);}
  const magic=Buffer.alloc(4);const input=fs.openSync(root+'/codex','r');try{fs.readSync(input,magic,0,4,0);}finally{fs.closeSync(input);}
  if(extracted.status!==0||fs.statSync(root+'/codex').size!==declaredSize||magic.toString('hex')!=='7f454c46')throw Error('NATIVE_ARTIFACT_REJECTED');
  const hash=crypto.createHash('sha256');for await(const chunk of fs.createReadStream(root+'/codex'))hash.update(chunk);
  const receipt={package:metadata.name,version,integrity,tarball:metadata.dist.tarball,bytes:declaredSize,executableSHA256:hash.digest('hex')};
  fs.writeFileSync('work/operational/native-package-receipt.json',JSON.stringify(receipt,null,2)+'\n');
  console.log(JSON.stringify({packageVerified:true,...receipt}));
} catch(error) {console.log(JSON.stringify({packageVerified:false,errorCode:error.message}));process.exitCode=1;}
