#!/usr/bin/env node
/**
 * 𝌋 Source-free Rulefield Agenda / NKS rulefield-intake CLI.
 * No network; no visual UI; never mutates data/rulefield.v1.json.
 */
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {
 readSeed,validateSeed,buildQueue,proposePriorityPermutation,sourceGleaningPlan,
 humanPriorityMarkdown,writeStagedReview
} from '../packages/rulefield/rulefields/engine.mjs';
const args=process.argv.slice(2),cmd=args[0]||'help';
const print=x=>console.log(JSON.stringify(x,null,2));
try{
 const queue=cmd==='help'?null:buildQueue();
 if(cmd==='help')print({name:'𝌋 Rulefields Engine',type_boundary:'RULEFIELD ≠ RULE',
  commands:[
   'validate — 70-item legacy source and 80 human-named field invariants',
   'stats — item counts, overlap holds, and custody',
   'fields — complete working labels and original human expressions (JSON)',
   'queue — append-only staged 150-item priority order (JSON)',
   'queue-md — human-scannable staged queue',
   'field RF-NNN — full field dossier and unexecuted source-gleaning plan',
   'move RF-NNN before Q05 — dry-run reversible prioritized permutation',
   'move Q03 after RF-001 — HELD historical rerank preview; no source mutation',
   'plan filename.json — apply validated plan of bounded move operations to staged preview (stdout)',
   'export queue|full|json — write current proposal only to ignored rulefields/outbox'
  ],no_interactive_ui:true,no_canonical_writes:true,flight:'HELD'});
 else if(cmd==='validate')print(validateSeed());
 else if(cmd==='stats')print({status:queue.status,legacy:queue.historical_priority_count,rulefields:queue.proposed_rulefield_count,
  held:queue.duplicate_hold_count,source_sha256:queue.canonical_sha256,seed_sha256:queue.field_seed_sha256,
  non_equivalence:'RULEFIELD_NOT_RULE',ui_status:'ROADMAP_ONLY',canonical_mutated:false});
 else if(cmd==='fields')print({schema:'td613.rulefield.field-catalog/v1',items:queue.rulefields});
 else if(cmd==='queue')print(queue);
 else if(cmd==='queue-md')process.stdout.write(humanPriorityMarkdown(queue));
 else if(cmd==='field'){
  const field=queue.rulefields.find(x=>x.id===args[1]);
  if(!field)throw Object.assign(new Error('FIELD_NOT_FOUND'),{code:'FIELD_NOT_FOUND'});
  print({field,source_gleaning_plan:sourceGleaningPlan(args[1])});
 }
 else if(cmd==='move'){
  if(args.length!==4||!['before','after'].includes(args[2]))throw Error('MOVE_SYNTAX: move ID before|after REFERENCE');
  print(proposePriorityPermutation(queue,[{item_id:args[1],op:args[2]==='before'?'MOVE_BEFORE':'MOVE_AFTER',reference_id:args[3]}]));
 }
 else if(cmd==='plan'){
  if(args.length!==2)throw Error('PLAN_FILE_REQUIRED');
  const full=fileURLToPath(new URL('../packages/rulefield/rulefields/plans/',import.meta.url));
  if(!/^[A-Za-z0-9][A-Za-z0-9_-]{1,96}\.json$/.test(args[1]))throw Error('UNSAFE_PRIORITY_PLAN_PATH');
  const plan=JSON.parse(readFileSync(full+args[1],'utf8'));
  if(plan.schema!=='td613.rulefield.priority-plan/v1')throw Error('PRIORITY_PLAN_SCHEMA_INVALID');
  if(plan.canonical_sha256!==queue.canonical_sha256||plan.field_seed_sha256!==queue.field_seed_sha256)throw Error('STALE_PRIORITY_PLAN_BASELINE');
  print(proposePriorityPermutation(queue,plan.operations));
 }
 else if(cmd==='export'){
  const type=args[1]||'queue';
  if(!['queue','full','json'].includes(type))throw Error('INVALID_EXPORT_TYPE');
  const data=type==='json'?queue:humanPriorityMarkdown(queue,{full:type==='full'});
  const name='rulefield-priority-20261107-'+type+(type==='json'?'.json':'.md');
  print(writeStagedReview(data,{filename:name}));
 }
 else throw Error('UNKNOWN_COMMAND');
}catch(e){console.error(JSON.stringify({status:'HELD',code:e.code||'RULEFIELD_CLI_ERROR',message:e.message}));process.exitCode=1;}
