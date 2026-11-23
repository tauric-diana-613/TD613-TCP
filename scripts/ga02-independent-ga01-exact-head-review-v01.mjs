/**
 * GA02: independent GA01 review harness. Fetches the specific source-free
 * candidate at an immutable Git SHA, executes it in detached runner worktree,
 * and retains a negative as an adverse result. No real archive inputs.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const CANDIDATE='acddfa958c1202578c102e89873f09678c5fda42';
const WORK='GA01_SOURCE_FREE_INTEGRATION';
const root=process.cwd();
const sandbox=fs.mkdtempSync(path.join(os.tmpdir(),'td613-ga02-review-'));
const directory=path.join(sandbox,'candidate');
const destination=path.join(root,'artifacts/ga01-ga02-readonly-review');
fs.mkdirSync(destination,{recursive:true});
const execute=(cmd,args,options={})=>spawnSync(cmd,args,{
 cwd:root,encoding:'utf8',timeout:180000,maxBuffer:6*1024*1024,...options
});
const receipt={schema:'td613.ga02.independent-exact-head-review/v1',
 docket:'PEFB-NEXT-20261103-v1',candidate_head:CANDIDATE,
 created_at:new Date().toISOString(),source_free:true,
 protected_source_bytes_seen:0,private_artifact_downloaded:false,
 private_key_read:false,provider_inference_executed:false,
 experiment_b_flight:'HELD',operator_closure:'RESERVED',
 independent_research_replication:false,
 tests:[],disposition:'NOT_EXECUTED'};
let failures=0;
try{
 const f=execute('git',['fetch','--no-tags','origin',CANDIDATE]);
 if(f.status!==0)throw Error('EXACT_HEAD_FETCH_REFUSED:'+f.stderr.slice(0,500));
 const w=execute('git',['worktree','add','--detach',directory,CANDIDATE]);
 if(w.status!==0)throw Error('WORKTREE_CREATION_FAILED:'+w.stderr.slice(0,500));
 const h=execute('git',['rev-parse','HEAD'],{cwd:directory});
 if(h.status!==0||h.stdout.trim()!==CANDIDATE)throw Error('EXACT_HEAD_MISMATCH');
 // Dependencies if needed are borrowed from checkout; no npm install in child.
 if(fs.existsSync(path.join(root,'node_modules')))
  fs.symlinkSync(path.join(root,'node_modules'),path.join(directory,'node_modules'),'dir');
 const suite=execute(process.execPath,['--test','tests/ga01-integrated-sourcefree-products-v01.test.mjs'],
  {cwd:directory,timeout:180000});
 receipt.tests.push({name:'GA01_CANDIDATE_LOCAL_TESTS',exit_code:suite.status,
  stdout:suite.stdout.slice(-22000),stderr:suite.stderr.slice(-9000)});
 if(suite.status!==0)failures++;
 const independent=execute(process.execPath,[path.join(root,'tests/ga02-independent-ga01-adverse-probes-v01.mjs'),directory],
  {cwd:root,timeout:180000});
 receipt.tests.push({name:'GA02_SEPARATE_ADVERSE_PROBES',exit_code:independent.status,
  stdout:independent.stdout.slice(-12000),stderr:independent.stderr.slice(-8000)});
 if(independent.status!==0)failures++;
 receipt.disposition=failures?'DEFECT_REPRODUCED_HELD':'SOURCE_FREE_INTEGRATION_EXECUTED_WITH_HELD_LIMITATIONS';
}catch(e){receipt.disposition='INDEPENDENT_REVIEW_NOT_COMPLETED_HELD';
 receipt.error=String(e);failures++;
}finally{
 fs.writeFileSync(path.join(destination,'ga01-exact-head-review.json'),
  JSON.stringify(receipt,null,2)+'\n',{mode:0o600});
 if(fs.existsSync(directory))execute('git',['worktree','remove','--force',directory]);
 try{fs.rmSync(sandbox,{force:true,recursive:true})}catch{}
 console.log(JSON.stringify({status:receipt.disposition,candidate_head:CANDIDATE,
  test_count:receipt.tests.length,failures,report:'artifacts/ga01-ga02-readonly-review/ga01-exact-head-review.json'}));
 if(failures)process.exitCode=1;
}
