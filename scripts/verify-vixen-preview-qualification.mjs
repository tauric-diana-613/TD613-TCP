#!/usr/bin/env node
/** Trusted default-branch gate. Fixtures test policy; only GitHub API reads authorize a live request. */
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
export const PRODUCT_BRANCH='research/vixen-dual-estate-encyclopedia-20261108';
export const REQUIRED_WITNESSES=Object.freeze([
 'Source and constitutional contracts',
 'Historical original source and native route',
 'Source-first desktop geometry',
 'Dedicated iPhone first frame',
 'G1-G8 integration and portable extracted replay',
 'QA04 human acceptance remains HELD'
]);
const demand=(ok,code)=>{if(!ok)throw Error(code)};
export function verifyQualification({pr,run,jobs,sha,repository}){
 demand(/^[a-f0-9]{40}$/.test(sha),'FULL_SHA_REQUIRED');
 demand(pr.number===1730&&pr.state==='open'&&!pr.merged&&pr.head.sha===sha&&pr.head.ref===PRODUCT_BRANCH&&pr.head.repo.full_name===repository&&pr.base.ref==='main','CURRENT_PRODUCT_PR_REQUIRED');
 demand(run.head_sha===sha&&run.head_branch===PRODUCT_BRANCH&&run.repository.full_name===repository&&run.path==='.github/workflows/td613-ci.yml'&&run.status==='completed'&&run.conclusion==='success','EXACT_SOURCE_CI_REQUIRED');
 demand(run.event==='pull_request'&&run.pull_requests?.some(p=>p.number===1730&&p.head.sha===sha&&p.head.ref===PRODUCT_BRANCH)||run.event==='workflow_dispatch','PRODUCT_EVENT_SCOPE_REQUIRED');
 // Dispatch is equivalent only when every substantive step below actually executed
 // on the product ref; a successful standard dispatch has no such job.
 const matches=jobs.filter(j=>j.name==='Vixen source-bound engineering qualification');
 demand(matches.length===1,'NAMED_QUALIFICATION_JOB_REQUIRED');
 const job=matches[0];
 demand(job.run_id===run.id&&job.status==='completed'&&job.conclusion==='success','MATCHING_EXECUTION_REQUIRED');
 for(const name of REQUIRED_WITNESSES){
  const steps=job.steps?.filter(s=>s.name===name)||[];
  demand(steps.length===1&&steps[0].status==='completed'&&steps[0].conclusion==='success'&&steps[0].started_at&&steps[0].completed_at,'REQUIRED_EXECUTION_MISSING:'+name);
 }
 return Object.freeze({schema:'td613.vixen.preview-qualification/v2',source_sha:sha,run_id:run.id,job_id:job.id,engineering_scope:'NAMED_MACHINE_WITNESSES_ONLY',human_acceptance:'HELD',scientific_closure:'HELD',production_authorized:false});
}
function api(path){return JSON.parse(execFileSync('gh',['api',path],{encoding:'utf8',maxBuffer:8*1024*1024}));}
export function qualifyLive(sha,repository){
 demand(repository==='tauric-diana-613/TD613-TCP','REPOSITORY_REQUIRED');
 const pr=api(`repos/${repository}/pulls/1730`);
 const runs=api(`repos/${repository}/actions/workflows/td613-ci.yml/runs?head_sha=${sha}&per_page=100`).workflow_runs;
 const failures=[];
 for(const run of runs){
  const jobs=[];
  for(let page=1;;page++){
   const batch=api(`repos/${repository}/actions/runs/${run.id}/jobs?filter=latest&per_page=100&page=${page}`).jobs;
   jobs.push(...batch);if(batch.length<100)break;
  }
  try{return verifyQualification({pr,run,jobs,sha,repository});}catch(e){failures.push({run:run.id,reason:e.message});}
 }
 throw Error('HELD_NO_CURRENT_NAMED_WITNESSES '+JSON.stringify(failures));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{const r=qualifyLive(process.argv[2],process.env.GITHUB_REPOSITORY);process.stdout.write(JSON.stringify(r)+'\n');}
 catch(e){console.error(e.message);process.exitCode=2;}
}
