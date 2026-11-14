#!/usr/bin/env node
/** 𝌋 Rulefield NKS Laboratory — source-free offline interface.
 * Example: node scripts/rulefield-lab.mjs suite
 *          node scripts/rulefield-lab.mjs diamond
 *          node scripts/rulefield-lab.mjs critical
 *          node scripts/rulefield-lab.mjs ca 30
 */
import {enumerate,criticalPairs,resolveFork,finiteCA,runReferenceSuite} from '../packages/rulefield/lab/multiway_lab.mjs';
import {readFileSync} from 'node:fs';
const [command='help',arg]=process.argv.slice(2);
const print=o=>console.log(JSON.stringify(o,null,2));
const prompt=()=>({commands:{
 suite:'Run finite source-free multiway and CA reference suite; print a JSON receipt.',
 diamond:'Enumerate all depth-two A→B substitution paths from AA; compare merged and unmerged states.',
 critical:'Show unresolved AB fork and counterfactual BA→AA completion, with witness scope.',
 ca:'Run elementary cellular automaton: node scripts/rulefield-lab.mjs ca 30 or ca 90.',
 tools:'Display vetted public Wolfram/NKS, NetLogo and Santa Fe tools with honest execution status.'
},scope:'Finite synthetic computational experiments only; no physical causal-invariance or protected Flight credit.'});
try{
 if(command==='help')print(prompt());
 else if(command==='suite')print(runReferenceSuite());
 else if(command==='diamond'){
  const rules=[{id:'R',from:'A',to:'B'}];
  const result=enumerate('AA',rules,{depth:2,maxPaths:100});
  print({experiment:'COMMUTING_DIAMOND_UNDER_UNIFORM_PATH_WEIGHT',result,
   interpretation:'Two event histories reach identical BB; state-only projection loses 1 bit under a uniform distribution over histories.'});
 }
 else if(command==='critical'){
  const old=[{id:'R1',from:'AB',to:'BA'},{id:'R2',from:'AB',to:'AA'}];
  const proposed=[...old,{id:'R3',from:'BA',to:'AA'}];
  print({experiment:'CRITICAL_PAIRS_WITH_COUNTERFACTUAL_COMPLETION',
    before:criticalPairs('AB',old,{depth:1,horizon:4}),
    proposed_not_adopted:{rule:proposed.at(-1),status:'CANDIDATE_GENERATED_WITHOUT_AUTHORITY'},
    after:criticalPairs('AB',proposed,{depth:1,horizon:4}),
    warning:'Completing this finite fork is not a global causal-invariance or semantic-equivalence proof.'});
 }
 else if(command==='ca'){
  const rule=Number(arg);if(!Number.isInteger(rule))throw new Error('Provide integer rule 0–255');
  print(finiteCA(rule,{width:41,steps:24,perturb:22}));
 }
 else if(command==='tools')print(JSON.parse(readFileSync(new URL('../packages/rulefield/lab/tool_registry.json',import.meta.url),'utf8')));
 else{print(prompt());process.exitCode=2;}
}catch(e){console.error(JSON.stringify({error:'SOURCE_FREE_LAB_FAILURE',reason:e.message}));process.exitCode=1;}
