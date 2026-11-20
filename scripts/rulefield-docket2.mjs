#!/usr/bin/env node
import {buildRevisionDocket,validateRevisionDocket,renderRevisionDocket,chatRevisionDocket,stageRevisionDocket} from '../packages/rulefield/rulefields/revised_docket.mjs';
const [cmd='help',folder]=process.argv.slice(2),print=x=>console.log(JSON.stringify(x,null,2));
try{
 if(cmd==='help')print({name:'𝌋 RF-OD-0002: content-complete human successor docket',
  commands:['validate','render','chat','export [directory]'],
  scientific_standing:'SOURCE_FREE_RESEARCH_ONLY',od02:'HELD',source_registry_changed:false});
 else{
  const d=buildRevisionDocket();
  if(cmd==='validate')print({valid:validateRevisionDocket(d),id:d.id,sha256:d.sha256,
   fields:d.fields.length,historical_ranks:d.original_priorities.length,
   multi_role_examples:d.ontology.counts.multi_role_examples,od02:d.authority.od02});
  else if(cmd==='render')process.stdout.write(renderRevisionDocket(d));
  else if(cmd==='chat')print(chatRevisionDocket(d));
  else if(cmd==='export')print(stageRevisionDocket(d,{folder}));
  else throw Error('INVALID_COMMAND');
 }
}catch(e){console.error(JSON.stringify({status:'HELD',code:e.code||'ROD2_COMMAND_ERROR',detail:e.message}));process.exitCode=1;}
