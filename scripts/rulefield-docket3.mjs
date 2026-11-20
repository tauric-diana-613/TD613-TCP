#!/usr/bin/env node
/** 𝌋 RF-OD-0003 provenance-bound operator review docket. No authorizing writes. */
import {buildDocket3,validateDocket3,renderDocket3,chatDocket3,stageDocket3} from '../packages/rulefield/operator/docket3.mjs';
const [cmd='help',folder]=process.argv.slice(2),show=x=>console.log(JSON.stringify(x,null,2));
try{
 if(cmd==='help')show({commands:['validate','render','chat','export [folder]'],
  status:'REVIEW_ONLY_ALL_559_SOURCE_COMPLETE',operator_decision:'PENDING',protected_flight:'HELD'});
 else{
  const d=buildDocket3();
  if(cmd==='validate')show({valid:validateDocket3(d),id:d.id,digest:d.digest,source_head:d.source_head,
   reviewed:d.agent_reviewed_total,deterministic_only:d.auto_only,operator_approval:false});
  else if(cmd==='render')process.stdout.write(renderDocket3(d));
  else if(cmd==='chat')show(chatDocket3(d));
  else if(cmd==='export')show(stageDocket3(d,{folder}));
  else throw Error('INVALID_COMMAND');
 }
}catch(e){console.error(JSON.stringify({status:'HELD',code:e.code||e.message}));process.exitCode=1;}
