#!/usr/bin/env node
/** 𝌋 RF-OD-0003 instrument: source-linked semantic review and finite paired qualification. */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {buildSemanticReview,validateSemanticReview,semanticInspection} from '../packages/rulefield/rulefields/semantic_review.mjs';
import {pairedPriorityPreview,validatePairedPriority} from '../packages/rulefield/rulefields/paired_priority.mjs';
const [cmd='help',arg1,arg2]=process.argv.slice(2),show=x=>process.stdout.write(JSON.stringify(x,null,2)+'\n');
const safeFile=x=>{
 if(typeof x!=='string'||!/^[\w.-]{1,100}\.json$/.test(x)||x.includes('..'))throw Error('UNSAFE_FILENAME');
 return resolve(x);
};
try{
 if(cmd==='help')show({name:'𝌋 Semantic Casebook & Paired Priority v3',
  commands:['semantic-summary','semantic ID','semantic-export OUTPUT.json',
   'paired-empty AS_OF','paired-file INPUT.json AS_OF','paired-export OUTPUT.json AS_OF'],
  gate:'SOURCE_DECLARED_ONLY; OD02 HELD; no human acceptance, canonical mutation, or Flight'});
 else if(cmd==='semantic-summary'){
  const x=buildSemanticReview();if(!validateSemanticReview(x))throw Error('INVALID_SEMANTIC_REVIEW');
  show({status:x.status,digest:x.digest,totals:x.totals,authority:x.authority});
 }else if(cmd==='semantic'){
  const x=buildSemanticReview();if(!validateSemanticReview(x))throw Error('INVALID_SEMANTIC_REVIEW');
  show(semanticInspection(arg1,x)||{id:arg1,status:'NOT_A_RESIDUAL_OBJECT'});
 }else if(cmd==='semantic-export'){
  const x=buildSemanticReview();if(!validateSemanticReview(x))throw Error('INVALID_SEMANTIC_REVIEW');
  const target=safeFile(arg1);writeFileSync(target,JSON.stringify(x,null,2)+'\n',{flag:'wx',mode:0o600});
  show({status:'STAGED_SOURCE_BOUND_SEMANTIC_PROPOSALS',file:target,digest:x.digest,rows:x.rows.length});
 }else if(cmd==='paired-empty'){
  const x=pairedPriorityPreview({as_of:arg1});if(!validatePairedPriority(x))throw Error('INVALID_PAIRED_PRIORITY');
  show({status:x.status,digest:x.digest,counts:x.counts,authority:x.authority});
 }else if(cmd==='paired-file'){
  const episodes=JSON.parse(readFileSync(safeFile(arg1),'utf8'));
  const x=pairedPriorityPreview({episodes,as_of:arg2});
  if(!validatePairedPriority(x))throw Error('INVALID_PAIRED_PRIORITY');
  show(x);
 }else if(cmd==='paired-export'){
  const x=pairedPriorityPreview({as_of:arg2});
  if(!validatePairedPriority(x))throw Error('INVALID_PAIRED_PRIORITY');
  const target=safeFile(arg1);writeFileSync(target,JSON.stringify(x,null,2)+'\n',{flag:'wx',mode:0o600});
  show({status:'STAGED_EMPTY_EVIDENCE_PRIORITY',file:target,digest:x.digest,counts:x.counts});
 }else throw Error('UNKNOWN_QUALIFICATION_COMMAND');
}catch(e){console.error(JSON.stringify({status:'HELD',reason:e.code||e.message}));process.exitCode=1;}
