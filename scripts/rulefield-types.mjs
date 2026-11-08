#!/usr/bin/env node
/** 𝌋 Typed Rulefield audit — all commands read-only except optional staged export. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {readTypeAssessment,buildTypedProjection,validateTypedProjection,inspectType,proposedRuleGate} from '../packages/rulefield/rulefields/type_system.mjs';
const args=process.argv.slice(2),cmd=args[0]||'help',show=o=>console.log(JSON.stringify(o,null,2));
try{
 if(cmd==='help')show({name:'TD613 Typed Rulefield Projection v1',
  commands:['validate — source and type invariants','summary — type counts and authority',
   'rule ID — typed historical record','field RF-ID — research domain and child candidates',
   'children RF-ID — candidate child-rule or assay derivations','gate FILE.json — inspect prospective PROPOSE_RULE contract',
   'export OUTPUT.json — proposed typed snapshot; never the historical registry'],
  non_equivalence:'RULEFIELD ≠ RULE ≠ ASSAY ≠ CLAIM ≠ SOURCE',
  human_authorization:'NOT_OBTAINED',protected_flight:'HELD'});
 else if(cmd==='gate'){
  if(args.length!==2||!/^[\w.-]{1,90}\.json$/.test(args[1])||args[1].includes('..'))throw Error('UNSAFE_GATE_INPUT');
  const spec=JSON.parse(readFileSync(resolve(args[1]),'utf8'));show(proposedRuleGate(spec));
 }
 else{
  const q=buildTypedProjection();
  if(cmd==='validate')show({status:validateTypedProjection(q)?'PASS':'HELD_INVALID_TYPE_PROJECTION',digest:q.projection_sha256,
    counts:q.counts,canonical_mutated:false,protected_flight:'HELD'});
  else if(cmd==='summary')show({schema:q.schema,digest:q.projection_sha256,status:q.status,counts:q.counts,
    assessed_rule_ids:q.objects.legacy.filter(x=>x.assessment_kind).map(x=>x.id),
    remaining_unadjudicated:q.unassessed_records.length,authority:q.authority});
  else if(cmd==='rule')show(inspectType(args[1],{projection:q}));
  else if(cmd==='field')show({field:inspectType(args[1],{projection:q}),
    children:q.objects.children.filter(x=>x.source_rulefield_id===args[1])});
  else if(cmd==='children')show({source_rulefield_id:args[1],
    candidates:q.objects.children.filter(x=>x.source_rulefield_id===args[1])});
  else if(cmd==='export'){
   if(args.length!==2||!/^[\w.-]{1,90}\.json$/.test(args[1])||args[1].includes('..'))throw Error('UNSAFE_TYPED_OUTPUT_NAME');
   const f=resolve(args[1]);mkdirSync(resolve('.'),{recursive:true});
   writeFileSync(f,JSON.stringify(q,null,2)+'\n',{flag:'wx',mode:0o600});
   show({status:'STAGED_TYPE_PROJECTION_ONLY',path:f,digest:q.projection_sha256,canonical_mutated:false});
  }
  else throw Error('UNKNOWN_TYPE_COMMAND');
 }
}catch(e){console.error(JSON.stringify({status:'HELD',code:e.code||'TYPE_CLI_FAILURE',message:e.message}));process.exitCode=1;}
