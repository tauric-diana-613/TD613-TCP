import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve('work/frozen2');
const out=path.resolve('work/evidence'); fs.mkdirSync(out,{recursive:true});
const receipts=path.resolve('work/native-receipts');fs.mkdirSync(receipts,{recursive:true});
const env={...process.env,TEMP:receipts,TMP:receipts};delete env.TD613_UPDATE_RECEIPTS;
const cmds=[
 ['vixen',['--test','packages/vixen_cybernetics/test-vixen-cybernetics.mjs']],
 ['apfr0',['--test','packages/four_crossing_capstone/test-a-pfr0-redo-readiness.mjs']],
 ['custodial',['--test','packages/four_crossing_capstone/test-custodial-and-time-boundaries.mjs']],
 ['twin-world',['packages/four_crossing_capstone/run-twin-world-assay.mjs']],
 ['dollhouse',['scripts/run-dollhouse-skill-audit.mjs','-i','packages/four_crossing_capstone/fixtures/audit-spec-a-pfr0.json','-o',path.join(out,'dollhouse-author-fixture.json'),'--format','both']],
];
const results=[];
for(const [name,args] of cmds){const start=new Date().toISOString();const r=spawnSync(process.execPath,args,{cwd:root,env,encoding:'utf8'});fs.writeFileSync(path.join(out,name+'.log'),r.stdout+'\n'+r.stderr);results.push({name,args,start,status:r.status,error:r.error?.message});console.log(name,r.status);}
fs.writeFileSync(path.join(out,'baseline-results.json'),JSON.stringify({node:process.version,versions:process.versions,platform:process.platform,arch:process.arch,results},null,2));
