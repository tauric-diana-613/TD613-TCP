#!/usr/bin/env node
import {buildOperatorDocket,validateOperatorDocket,renderOperatorDocket,chatDocketPayload,stageDocket,readNomenclature} from '../packages/rulefield/operator/docket.mjs';
const [cmd='help',dest]=process.argv.slice(2);
const print=x=>console.log(JSON.stringify(x,null,2));
try{
 if(cmd==='help')print({name:'𝌋 Rulefield Operator Docket',commands:['validate','names','render','chat','export [output-folder]'],
  scope:'Full 70+80 human review; no automatic GitHub/registry mutation.'});
 else if(cmd==='names')print(readNomenclature());
 else{
  const d=buildOperatorDocket();
  if(cmd==='validate')print({status:validateOperatorDocket(d)?'PASS':'FAIL',digest:d.docket_sha256,
   names:'FROZEN_V1',historic:d.counts.historical_priorities,rulefields:d.counts.proposed_rulefields});
  else if(cmd==='render')process.stdout.write(renderOperatorDocket(d));
  else if(cmd==='chat')print(chatDocketPayload(d));
  else if(cmd==='export')print(stageDocket(d,{folder:dest}));
  else throw Error('INVALID_DOCKET_COMMAND');
 }
}catch(e){console.error(JSON.stringify({status:'HELD',error:e.message}));process.exitCode=1;}