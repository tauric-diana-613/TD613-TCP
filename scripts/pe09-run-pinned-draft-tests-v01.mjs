/** PEFB-20261103 / PE09 exact SHA reproducibility witness.
 * Read-only source-free test execution; no merges, protected source, provider calls or sync.
 * Fresh CI checkout; a green parent CI does not count as a child-test execution.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const ITEMS=[
  {
    "pe": "PE01",
    "pr": 1644,
    "sha": "d8f4d8482ce5bd347926e510f91af905e87913dc",
    "tests": [
      "tests/wendbine-gatee-sourcefree-v02.test.mjs",
      "tests/wendbine-gatee-sourcefree-second-challenge.test.mjs"
    ]
  },
  {
    "pe": "PE02",
    "pr": 1647,
    "sha": "e329364696b19f3a68b2d5154df6d3137b821f20",
    "tests": [
      "tests/wendbine-gatee-synthetic-local-index-v01.test.mjs"
    ]
  },
  {
    "pe": "PE03",
    "pr": 1648,
    "sha": "8ee7a87b6c4f24fa672e9883307da1ebac7f162a",
    "tests": [
      "tests/wendbine-pe03-incremental-plan-v01.test.mjs"
    ]
  },
  {
    "pe": "PE04",
    "pr": 1649,
    "sha": "e2e123ecd537e99b571961d99080db5bfd9f1ff9",
    "tests": [
      "tests/pe04-native-method-census-v01.test.mjs"
    ]
  },
  {
    "pe": "PE05",
    "pr": 1646,
    "sha": "188b8324480ef1aeb099760346166ee0ec71896a",
    "tests": [
      "tests/td613-preflight-twin-products-v01.test.mjs"
    ]
  },
  {
    "pe": "PE06",
    "pr": 1650,
    "sha": "41a06334098ae278602b5e7e2797ccd81763bedd",
    "tests": [
      "tests/pe06-source-matched-reciprocal-v01.test.mjs"
    ]
  },
  {
    "pe": "PE07",
    "pr": 1651,
    "sha": "ddc9af078ee471d93f793a8fae78ac684b8c3bef",
    "tests": [
      "tests/pe07-sourcefree-runtime-guards-v01.test.mjs"
    ]
  },
  {
    "pe": "PE08",
    "pr": 1652,
    "sha": "df72e1b99112e78dea59680192508bc01714df84",
    "tests": [
      "tests/pe08-decision-packet-validator-v01.test.mjs"
    ]
  }
];
const run=(cmd,args,opts={})=>spawnSync(cmd,args,{cwd:process.cwd(),encoding:'utf8',
 timeout:120000,maxBuffer:4*1024*1024,...opts});
const root=process.cwd(),scratch=fs.mkdtempSync(path.join(os.tmpdir(),'td613-pe09-'));
const receipts=[],outDir=path.join(root,'artifacts/pefb-sourcefree-review');
fs.mkdirSync(outDir,{recursive:true});
let failures=0;
for(const item of ITEMS){
 const folder=path.join(scratch,item.pe.toLowerCase());
 const entry={work_order:item.pe,pr:item.pr,expected_head:item.sha,tests:item.tests,
  source_free_only:true,real_source_admitted:false,provider_inference_executed:false};
 try{
  const fetched=run('git',['fetch','--no-tags','origin',item.sha]);
  if(fetched.status!==0)throw Error('PE09_HISTORICAL_COMMIT_UNAVAILABLE:'+fetched.stderr.slice(0,800));
  const added=run('git',['worktree','add','--detach',folder,item.sha]);
  if(added.status!==0)throw Error('PE09_WORKTREE_FAILED:'+added.stderr.slice(0,800));
  const actual=run('git',['rev-parse','HEAD'],{cwd:folder});
  if(actual.status!==0||actual.stdout.trim()!==item.sha)throw Error('PE09_EXACT_HEAD_MISMATCH');
  const modules=path.join(root,'node_modules');
  if(fs.existsSync(modules))fs.symlinkSync(modules,path.join(folder,'node_modules'),'dir');
  const test=run(process.execPath,['--test',...item.tests],{cwd:folder,timeout:120000});
  entry.exit_code=test.status;
  entry.status=test.status===0?'TESTS_EXECUTED_PASS':'TESTS_EXECUTED_FAIL';
  entry.stdout=test.stdout.slice(-18000);entry.stderr=test.stderr.slice(-8000);
  if(test.status!==0)failures++;
 }catch(e){entry.status='TESTS_NOT_COMPLETED_HELD';entry.error=String(e);failures++;}
 finally{
   receipts.push(entry);
   if(fs.existsSync(folder))run('git',['worktree','remove','--force',folder]);
   console.log(item.pe+' PR#'+item.pr+' '+entry.status+' '+item.sha.slice(0,12));
 }
}
try{fs.rmSync(scratch,{force:true,recursive:true})}catch{}
const receipt={schema:'td613.pe09.exact-head-sourcefree-ci/v1',docket:'PEFB-20261103-v1',
 created_at:new Date().toISOString(),source_free_only:true,work_orders:receipts,
 passed:receipts.filter(x=>x.status==='TESTS_EXECUTED_PASS').length,
 failed_or_held:failures,real_source_admission_count:0,
 protected_experiment_b_flight:'HELD',human_scientific_closure:'RESERVED'};
fs.writeFileSync(path.join(outDir,'exact-head-review.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'w',mode:0o600});
if(failures)process.exitCode=1;
