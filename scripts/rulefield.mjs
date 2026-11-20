#!/usr/bin/env node
/**
 * 𝌋 Living Rulefield — offline, read-only research viewer.
 * Run: node scripts/rulefield.mjs [stats|validate|queue|priority|search|trace|crossing|aliases|frontier].
 */
import {readRulefield,validateRulefield,searchRules,traceRule,inspectPriority,inspectCrossing,priorityLens,negativeResults,unresolvedAliases,proposeRule} from '../packages/rulefield/rulefield.mjs';
function help(){return {
 commands:{
  stats:"Overview: node scripts/rulefield.mjs stats",
  validate:"Run registry integrity and closure checks",
  queue:"Print the 70-item ranked queue (read-only)",
  priority:"node scripts/rulefield.mjs priority 4",
  search:"node scripts/rulefield.mjs search standing [--rank 4] [--limit 12]",
  trace:"node scripts/rulefield.mjs trace CBFE-RG-11",
  crossing:"node scripts/rulefield.mjs crossing RF-X01",
  aliases:"Unresolved topic/crossing aliases requiring adjudication",
  frontier:"Source-free bounded-null result and unqualified path-fiber candidate",
  sample_proposal:"Demonstrate RGI-01 fail-closed proposal; DOES NOT write any file"
 },
 safeguards:"No protected Flight, model calls, source acquisition, machine promotion, merge or release.",
 authority:"SAC[X6ZNK5NO51] · human closure RESERVED"
};}
const args=process.argv.slice(2),command=args[0]||'help',field=(flag,defaultValue=null)=>{const i=args.indexOf(flag);return i===-1?defaultValue:args[i+1]};
try{
 const index=readRulefield();
 if(command==='help'){console.log(JSON.stringify(help(),null,2));process.exit(0)}
 const state=validateRulefield(index);
 let output;
 if(command==='stats')output={...state,by_kind:index.totals.lanes,source_issues:index.issues,v04:index.v04_competent_null,priority_4:index.priority_queue[3].title,priority_47:index.priority_queue[46].title};
 else if(command==='validate')output=state;
 else if(command==='queue')output=priorityLens(index);
 else if(command==='priority')output=inspectPriority(index,Number(args[1]),{limit:Number(field('--limit',100))});
 else if(command==='search')output=searchRules(index,{term:args.slice(1).filter(x=>!x.startsWith('--')&&x!==field('--rank')&&x!==field('--limit')).join(' '),queue_rank:field('--rank'),limit:Number(field('--limit',15))});
 else if(command==='trace')output=traceRule(index,args[1]);
 else if(command==='crossing')output=inspectCrossing(index,args[1]);
 else if(command==='aliases')output=unresolvedAliases(index,{limit:Number(field('--limit',60))});
 else if(command==='frontier')output=negativeResults(index);
 else if(command==='sample_proposal')output=proposeRule(index,{id:'RF-P-001',title:'Comparison of equal-cost path histories',statement:'Test whether holding all consenting and withheld route histories recovers a distinct warranted statement beyond a competent full-history policy.',source_ids:['CBFE_DD02_COMPETENT_NULL_RESULT_V04.json'],queue_rank:4,falsifier:'No additional warranted statement survives the information-matched comparison.',competent_null:'Full-history policy with the same clocks, authority gates and source access.'});
 else {console.log(JSON.stringify(help(),null,2));process.exitCode=2;process.exit();}
 console.log(JSON.stringify(output,null,2));
}catch(e){console.error(JSON.stringify({status:'FAIL_CLOSED',code:e.code||'ERROR',message:e.message}));process.exitCode=1;}
