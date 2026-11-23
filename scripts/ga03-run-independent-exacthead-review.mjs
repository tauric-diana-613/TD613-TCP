/**
 * GA03 independent exact-head synthetic-only challenge. Runs in GitHub Actions
 * against immutable draft candidate SHA; no provider requests or protected data.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const candidate='577bab7b334c82b2024a1797caabc70eafb79228';
const home=process.cwd(),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'td613-ga03-review-'));
const checkout=path.join(tmp,'candidate');
const dest=path.join(home,'artifacts/ga03-sourcefree-independent-review');
fs.mkdirSync(dest,{recursive:true});
const exec=(c,a,opts={})=>spawnSync(c,a,{cwd:home,encoding:'utf8',timeout:180000,maxBuffer:8*1024*1024,...opts});
const result={schema:'td613.ga03.exact-head-independent-review/v1',
 docket:'TD613_GA03_20261103_SOURCEFREE',candidate,
 sealed_wendbine_epoch_unchanged:true,encrypted_artifact_not_downloaded:true,
 private_key_read:false,source_originals_admitted:0,external_provider_calls:0,
 scientific_flight:'HELD',human_release:'RESERVED',
 source_free_results:[],status:'UNEXECUTED'};
let failure=0;
try{
 let g=exec('git',['fetch','--no-tags','origin',candidate]);
 if(g.status!==0)throw Error('PINNED_CANDIDATE_FETCH_FAIL: '+g.stderr.slice(0,900));
 g=exec('git',['worktree','add','--detach',checkout,candidate]);
 if(g.status!==0)throw Error('ISOLATED_CHECKOUT_FAIL: '+g.stderr.slice(0,900));
 g=exec('git',['rev-parse','HEAD'],{cwd:checkout});
 if(g.status!==0||g.stdout.trim()!==candidate)throw Error('EXACT_HEAD_DRIFT');
 if(fs.existsSync(path.join(home,'node_modules')))
  fs.symlinkSync(path.join(home,'node_modules'),path.join(checkout,'node_modules'),'dir');
 const cases=[
   {name:'CANDIDATE_TYPED_PROJECTION',cmd:process.execPath,args:['--test','tests/ga03-typed-projection-sourcefree.test.mjs'],cwd:checkout},
   {name:'CANDIDATE_MEDIATED_REVOCATION',cmd:process.execPath,args:['--test','tests/ga03-mediated-revocation-sourcefree.test.mjs'],cwd:checkout},
   {name:'INDEPENDENT_BOUNDARY_CHALLENGE',cmd:process.execPath,args:['--test',path.join(home,'tests/ga03-independent-boundary-challenge.test.mjs')],cwd:home,env:{...process.env,GA03_EXACT_CHECKOUT:checkout}}
 ];
 for(const t of cases){
   const r=exec(t.cmd,t.args,{cwd:t.cwd,...(t.env?{env:t.env}:{})});
   const row={test:t.name,exit_code:r.status,status:r.status===0?'EXECUTED_PASS':'EXECUTED_FAIL',
      stdout:r.stdout.slice(-11000),stderr:r.stderr.slice(-7000)};
   result.source_free_results.push(row);
   if(r.status!==0)failure++;
   console.log(t.name+' '+row.status);
 }
 result.status=failure?'SOURCE_FREE_DEFECT_REPRODUCED_HELD':'SOURCE_FREE_BOUNDED_PASS_WITH_LIMITATIONS';
}catch(e){result.status='SOURCE_FREE_REVIEW_INCOMPLETE_HELD';result.error=String(e);failure++;}
finally{
 fs.writeFileSync(path.join(dest,'exact-head-review.json'),JSON.stringify(result,null,2)+'\n',{mode:0o600});
 if(fs.existsSync(checkout))exec('git',['worktree','remove','--force',checkout]);
 try{fs.rmSync(tmp,{recursive:true,force:true})}catch{}
 if(failure)process.exitCode=1;
 console.log(JSON.stringify({status:result.status,errors:failure,candidate,receipt:'artifacts/ga03-sourcefree-independent-review/exact-head-review.json'}));
}
