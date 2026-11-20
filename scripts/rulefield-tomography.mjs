#!/usr/bin/env node
/** 𝌋 Review-only source-linked 559-record ledger + Temporal Guardian II. */
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {buildResidualTriage,validateResidualTriage,inspectResidual} from '../packages/rulefield/rulefields/residual_triage.mjs';
import {evidenceConditionedPriority,validateEvidencePriority,futurePriorityScenario} from '../packages/rulefield/rulefields/evidence_priority.mjs';
const [cmd='help',arg1,arg2]=process.argv.slice(2);
const print=x=>process.stdout.write(JSON.stringify(x,null,2)+'\n');
function safeFile(filename){
 if(!/^[\w.-]{1,90}\.json$/.test(filename||'')||filename.includes('..'))throw Error('UNSAFE_FILENAME');
 return resolve(filename);
}
try{
 if(cmd==='help')print({commands:['triage-summary','triage ID','triage-export FILE.json','rank-empty AS_OF',
  'rank-file FILE.json AS_OF','scenario FILE.json AS_OF FUTURE_AS_OF'],
  contract:'Receipt-file JSON is input DATA only. All output is review-only and never changes canonical files.'});
 else if(cmd==='triage-summary'){
  const t=buildResidualTriage();
  if(!validateResidualTriage(t))throw Error('INVALID_RESIDUAL_TRIAGE');
  print({status:t.status,counts:t.counts,digest:t.digest,authority:t.authority});
 }else if(cmd==='triage'){
  const t=buildResidualTriage();if(!validateResidualTriage(t))throw Error('INVALID_RESIDUAL_TRIAGE');
  print(inspectResidual(arg1,t)||{status:'UNKNOWN_OR_PREVIOUSLY_AUDITED_ID',id:arg1});
 }else if(cmd==='triage-export'){
  const t=buildResidualTriage();if(!validateResidualTriage(t))throw Error('INVALID_RESIDUAL_TRIAGE');
  const target=safeFile(arg1);writeFileSync(target,JSON.stringify(t,null,2)+'\n',{flag:'wx',mode:0o600});
  print({status:'STAGED_UNADJUDICATED_LEDGER',file:target,digest:t.digest,rows:t.rows.length});
 }else if(cmd==='rank-empty'){
  const p=evidenceConditionedPriority({as_of:arg1});
  if(!validateEvidencePriority(p))throw Error('INVALID_RANKING_PREVIEW');
  print({status:p.status,counts:p.counts,moves:p.moves,digest:p.digest,authority:p.authority});
 }else if(cmd==='rank-file'){
  const evidence=JSON.parse(readFileSync(safeFile(arg1),'utf8'));
  const p=evidenceConditionedPriority({receipts:evidence,as_of:arg2});
  if(!validateEvidencePriority(p))throw Error('INVALID_RANKING_PREVIEW');
  print(p);
 }else if(cmd==='scenario'){
  const receipts=JSON.parse(readFileSync(safeFile(arg1),'utf8'));
  print(futurePriorityScenario({receipts,present_as_of:arg2,future_as_of:process.argv[5]}));
 }else throw Error('UNKNOWN_COMMAND');
}catch(e){console.error(JSON.stringify({status:'HELD',error:e.code||e.message}));process.exitCode=1;}
