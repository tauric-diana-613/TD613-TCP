import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
  phasonicObservationMatrix,
  observePhasonicState,
} from './phasonic-supermoire-dromological-tomography.js';
import { DROMOLOGICAL_S3_SCHEDULES } from './dromological-s3-schedule-atlas-first-stratum-gate.js';
import { bitemporalProspectiveReplayMinimalObservationPolicyCertificate } from './bitemporal-prospective-replay-minimal-observation-policy.js';
import { claimBundleMinimalSufficientCustodyFrontierCertificate } from './claim-bundle-minimal-sufficient-custody-frontier.js';
import { finiteCustodyBehavioralQuotientTaskClosureCanonicalCertificate } from './finite-custody-behavioral-quotient-task-closure-certificate.js';

export const FINITE_CUSTODY_TASK_DEPENDENCY_POSET_SCHEMA =
  'td613.dome-world.finite-custody-task-dependency-poset/v0.1';
export const FINITE_CUSTODY_TASK_DEPENDENCY_POSET_PARENT_RECEIPT =
  '8a17d896a74d76f284081c29badd0ec5028c5ab1';

const TASKS=Object.freeze(['B','R','T','A','M']);
const STAGES=Object.freeze([0,1,2,3]);
const RULES=Object.freeze([
  Object.freeze(['R','B']),Object.freeze(['R','T']),Object.freeze(['T','A']),Object.freeze(['M','A']),
]);
const EXPECTED_SUBSETS=Object.freeze({
  EMPTY:{closure:'EMPTY',classes:1},B:{closure:'B',classes:4},R:{closure:'BRTA',classes:32},
  T:{closure:'TA',classes:27},A:{closure:'A',classes:17},M:{closure:'AM',classes:21},
  BR:{closure:'BRTA',classes:32},BT:{closure:'BTA',classes:28},BA:{closure:'BA',classes:19},BM:{closure:'BAM',classes:23},
  RT:{closure:'BRTA',classes:32},RA:{closure:'BRTA',classes:32},RM:{closure:'BRTAM',classes:36},TA:{closure:'TA',classes:27},TM:{closure:'TAM',classes:31},AM:{closure:'AM',classes:21},
  BRT:{closure:'BRTA',classes:32},BRA:{closure:'BRTA',classes:32},BRM:{closure:'BRTAM',classes:36},BTA:{closure:'BTA',classes:28},BTM:{closure:'BTAM',classes:32},BAM:{closure:'BAM',classes:23},
  RTA:{closure:'BRTA',classes:32},RTM:{closure:'BRTAM',classes:36},RAM:{closure:'BRTAM',classes:36},TAM:{closure:'TAM',classes:31},
  BRTA:{closure:'BRTA',classes:32},BRTM:{closure:'BRTAM',classes:36},BRAM:{closure:'BRTAM',classes:36},BTAM:{closure:'BTAM',classes:32},RTAM:{closure:'BRTAM',classes:36},BRTAM:{closure:'BRTAM',classes:36},
});
const EXPECTED_CLOSED=Object.freeze({
  EMPTY:{classes:1,subset_preimages:1},B:{classes:4,subset_preimages:1},A:{classes:17,subset_preimages:1},BA:{classes:19,subset_preimages:1},
  TA:{classes:27,subset_preimages:2},AM:{classes:21,subset_preimages:2},BTA:{classes:28,subset_preimages:2},BAM:{classes:23,subset_preimages:2},
  TAM:{classes:31,subset_preimages:2},BRTA:{classes:32,subset_preimages:8},BTAM:{classes:32,subset_preimages:2},BRTAM:{classes:36,subset_preimages:8},
});
const EXPECTED_DELETION=Object.freeze({'R->B':8,'R->T':8,'T->A':6,'M->A':2});
const AUTHORITY_KEYS=Object.freeze([
  'inverse','encoder','custody_mutation','source_state_transform','new_sensor_measurement',
  'release','production','physical_claim','continuum_claim','cryptographic_key',
  'authentication_credential','retrocausal_channel','retention_policy',
]);
let cachedCertificate=null;

function freeze(value){
  if(value&&typeof value==='object'&&!Object.isFrozen(value)){
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
}
const canonical=value=>JSON.stringify(value);
const zeroAuthority=()=>freeze(Object.fromEntries(AUTHORITY_KEYS.map(key=>[key,false])));
const setEqual=(a,b)=>a.size===b.size&&[...a].every(value=>b.has(value));
const subsetOf=(a,b)=>[...a].every(value=>b.has(value));
const union=(a,b)=>new Set([...a,...b]);
const intersection=(a,b)=>new Set([...a].filter(value=>b.has(value)));
function orderedSet(values){ return new Set(TASKS.filter(task=>values.has(task))); }
function setId(values){ const text=TASKS.filter(task=>values.has(task)).join(''); return text||'EMPTY'; }
function idSet(id){ return new Set(id==='EMPTY'?[]:TASKS.filter(task=>id.includes(task))); }
function scheduleId(schedule){
  const letters={PHI_PAIR_WIRE:'P',HEXAGONAL_MOIRE:'H',ICOSAHEDRAL_PHASON:'I'};
  return schedule.map(stratum=>letters[stratum]).join('-');
}
function stateCube(){
  const out=[];
  for(let x1=-2;x1<=2;x1+=1) for(let x2=-2;x2<=2;x2+=1) for(let x3=-2;x3<=2;x3+=1) out.push(freeze([x1,x2,x3]));
  return freeze(out);
}
function buildAntecedents(policy){
  const bySchedule=new Map(policy.policy_geometry.map(row=>[row.schedule_id,row]));
  const out=[];
  for(const schedule of DROMOLOGICAL_S3_SCHEDULES){
    const id=scheduleId(schedule),matrix=phasonicObservationMatrix(schedule),p=bySchedule.get(id);
    if(!p) throw new Error(`missing policy schedule ${id}`);
    for(const state of stateCube()) out.push(freeze({
      schedule:freeze([...schedule]),schedule_id:id,first_stratum:schedule[0],state,
      matrix,observation:observePhasonicState(state,schedule),replay_required:p.replay_required,
    }));
  }
  return freeze(out);
}
function quotientValue(stage,a){
  if(stage===0) return freeze(['NULL_REGISTERED_TRACE']);
  return freeze([a.matrix.slice(0,stage),a.observation.slice(0,stage)]);
}
function claimValue(claim,a){
  if(claim==='FIRST_STRATUM') return a.first_stratum;
  if(claim==='SCHEDULE') return a.schedule_id;
  if(claim==='X1') return a.state[0];
  if(claim==='X2') return a.state[1];
  if(claim==='X3') return a.state[2];
  if(claim==='FULL_STATE') return a.state;
  if(claim==='REPLAY_REQUIRED_FOR_EXACT_STATE') return a.replay_required;
  throw new Error(`unknown task-poset claim ${claim}`);
}
const bundleValue=(claims,a)=>freeze(claims.map(claim=>freeze([claim,claimValue(claim,a)])));
function globalAtlas(antecedents){
  const atlas=new Map();
  for(const stage of STAGES){
    const fibres=new Map();
    for(const a of antecedents){
      const key=canonical(quotientValue(stage,a));
      if(!fibres.has(key)) fibres.set(key,[]);
      fibres.get(key).push(a);
    }
    atlas.set(stage,fibres);
  }
  return atlas;
}
function profile(atlas,targets,stage,claims){
  const keys=[...new Set(targets.map(a=>canonical(quotientValue(stage,a))))].sort();
  const cards=[];
  for(const key of keys){
    const support=new Set(atlas.get(stage).get(key).map(a=>canonical(bundleValue(claims,a))));
    cards.push(support.size);
  }
  cards.sort((a,b)=>a-b);
  return freeze({stage,cards:freeze(cards),maximum:Math.max(...cards),all_singleton:cards.every(value=>value===1),occupied_fibres:keys.length});
}
function buildContexts(bundleParent,antecedents,atlas){
  const targets=new Map(DROMOLOGICAL_S3_SCHEDULES.map(schedule=>{
    const id=scheduleId(schedule); return [id,antecedents.filter(a=>a.schedule_id===id)];
  }));
  const contexts=[];
  let stageProfiles=0;
  for(const row of bundleParent.bundle_support_certificate.rows){
    const p={};
    for(const stage of STAGES){ p[stage]=profile(atlas,targets.get(row.schedule_id),stage,row.claims); stageProfiles+=1; }
    contexts.push(freeze({row,p:freeze(p)}));
  }
  return freeze({contexts:freeze(contexts),stage_profile_reconstructions:stageProfiles});
}
function uniformProfileKey(p){
  const values=[...new Set(p.cards)];
  return values.length===1?`${p.cards.length}x${values[0]}`:`${p.cards.length}xMIXED:${p.cards.join(',')}`;
}
function taskR(context){
  const birth=context.row.actual_birth;
  if(birth==='INF') return freeze([]);
  const out=[];
  for(let fine=birth;fine<=3;fine+=1) for(let coarse=0;coarse<fine;coarse+=1){
    const p=context.p[coarse];
    out.push(freeze([fine,coarse,coarse<birth?freeze(['RESTORE',p.maximum]):freeze(['PRESERVE',p.all_singleton])]));
  }
  return freeze(out);
}
function taskT(context){
  const birth=context.row.actual_birth;
  if(birth==='INF'||birth<2) return freeze([]);
  const out=[];
  for(let fine=birth;fine<=3;fine+=1) for(let middle=1;middle<birth;middle+=1){
    if(middle>=fine) continue;
    for(let coarse=0;coarse<middle;coarse+=1){
      const md=context.p[middle].maximum,mc=context.p[coarse].maximum;
      out.push(freeze([fine,middle,coarse,md,mc,md===mc]));
    }
  }
  return freeze(out);
}
function taskA(context){
  if(context.row.actual_birth!==3) return null;
  const m2=context.p[2].maximum,m1=context.p[1].maximum,m0=context.p[0].maximum;
  return freeze([m2,m1,m0,m1===m2?'FLAT':'EXPAND',m0===m1?'FLAT':'EXPAND']);
}
function taskM(context){
  if(context.row.actual_birth!==3) return null;
  const p2=context.p[2],p1=context.p[1],p0=context.p[0];
  return freeze([p2.maximum,p1.maximum,p0.maximum,uniformProfileKey(p2),uniformProfileKey(p1)]);
}
function attachTasks(contexts){
  let rRows=0,tRows=0,aRows=0,mRows=0;
  const out=contexts.map(context=>{
    const R=taskR(context),T=taskT(context),A=taskA(context),M=taskM(context);
    rRows+=R.length;tRows+=T.length;if(A) aRows+=1;if(M) mRows+=1;
    return freeze({...context,tasks:freeze({B:context.row.actual_birth,R,T,A,M})});
  });
  return freeze({contexts:freeze(out),replay_rows:freeze({R:rRows,T:tRows,A:aRows,M:mRows,total:rRows+tRows+aRows+mRows})});
}
function allSubsets(){
  const out=[];
  function walk(index,current){
    if(index===TASKS.length){ out.push(orderedSet(new Set(current))); return; }
    walk(index+1,current);current.push(TASKS[index]);walk(index+1,current);current.pop();
  }
  walk(0,[]); return out.sort((a,b)=>a.size-b.size||TASKS.map(t=>Number(b.has(t))-Number(a.has(t))).find(v=>v!==0)||0);
}
function subsetSignature(context,S){ return canonical(TASKS.filter(task=>S.has(task)).map(task=>freeze([task,context.tasks[task]]))); }
function taskValueKey(context,task){ return canonical(context.tasks[task]); }
function groupBySubset(contexts,S){
  const groups=new Map();
  for(const context of contexts){
    const key=subsetSignature(context,S);
    if(!groups.has(key)) groups.set(key,[]);
    groups.get(key).push(context);
  }
  return groups;
}
function empiricalClosure(groups){
  const closure=new Set();
  let observations=0;
  for(const task of TASKS){
    let determined=true;
    for(const group of groups.values()){
      const values=new Set();
      for(const context of group){ values.add(taskValueKey(context,task)); observations+=1; }
      if(values.size>1) determined=false;
    }
    if(determined) closure.add(task);
  }
  return {closure:orderedSet(closure),observations};
}
function ruleClosure(S,rules=RULES){
  const out=new Set(S); let changed=true;
  while(changed){
    changed=false;
    for(const [from,to] of rules) if(out.has(from)&&!out.has(to)){ out.add(to); changed=true; }
  }
  return orderedSet(out);
}
function closedRows(table){
  const byClosure=new Map();
  for(const row of table.values()){
    if(!byClosure.has(row.closure_id)) byClosure.set(row.closure_id,{count:0});
    byClosure.get(row.closure_id).count+=1;
  }
  return freeze(Object.fromEntries([...byClosure.entries()].map(([id,row])=>[id,freeze({
    classes:table.get(id).classes,subset_preimages:row.count,
  })])));
}
function minimalFullGenerators(table){
  const top=new Set(TASKS);
  const full=[...table.values()].filter(row=>setEqual(row.closure,top));
  return full.filter(row=>!full.some(other=>other.subset.size<row.subset.size&&subsetOf(other.subset,row.subset)))
    .map(row=>row.subset_id);
}

export function finiteCustodyTaskDependencyPosetCertificate(){
  if(cachedCertificate) return cachedCertificate;
  const parent=finiteCustodyBehavioralQuotientTaskClosureCanonicalCertificate();
  const bundleParent=claimBundleMinimalSufficientCustodyFrontierCertificate();
  const policy=bitemporalProspectiveReplayMinimalObservationPolicyCertificate();
  const antecedents=buildAntecedents(policy);
  const atlas=globalAtlas(antecedents);
  const built=buildContexts(bundleParent,antecedents,atlas);
  const tasked=attachTasks(built.contexts);
  const contexts=tasked.contexts;
  const subsets=allSubsets();
  const table=new Map();
  let subsetSignatureConstructions=0,closureConstancyObservations=0;
  const groupsById=new Map();

  for(const S of subsets){
    const id=setId(S),groups=groupBySubset(contexts,S);
    subsetSignatureConstructions+=contexts.length;
    const derived=empiricalClosure(groups); closureConstancyObservations+=derived.observations;
    const row=freeze({subset:S,subset_id:id,closure:derived.closure,closure_id:setId(derived.closure),classes:groups.size});
    table.set(id,row);groupsById.set(id,groups);
  }

  const subsetTable=freeze(Object.fromEntries([...table.entries()].map(([id,row])=>[id,freeze({closure:row.closure_id,classes:row.classes})])));
  const subsetExact=Object.entries(EXPECTED_SUBSETS).every(([id,expected])=>subsetTable[id]?.closure===expected.closure&&subsetTable[id]?.classes===expected.classes)
    && Object.keys(subsetTable).length===32;

  let ruleMismatches=0;
  for(const row of table.values()) if(!setEqual(ruleClosure(row.subset),row.closure)) ruleMismatches+=1;
  const deletion={};
  for(const [from,to] of RULES){
    const reduced=RULES.filter(rule=>!(rule[0]===from&&rule[1]===to));
    let mismatches=0;
    for(const row of table.values()) if(!setEqual(ruleClosure(row.subset,reduced),row.closure)) mismatches+=1;
    deletion[`${from}->${to}`]=mismatches;
  }
  const deletionExact=Object.entries(EXPECTED_DELETION).every(([key,value])=>deletion[key]===value);

  const closed=closedRows(table);
  const closedExact=Object.entries(EXPECTED_CLOSED).every(([id,expected])=>closed[id]?.classes===expected.classes&&closed[id]?.subset_preimages===expected.subset_preimages)
    && Object.keys(closed).length===12;

  let extensivity=0,idempotence=0,monotonePairs=0,monotoneFailures=0,unionChecks=0,unionFailures=0;
  for(const row of table.values()){
    if(subsetOf(row.subset,row.closure)) extensivity+=1;
    const reclosed=table.get(row.closure_id)?.closure;
    if(reclosed&&setEqual(reclosed,row.closure)) idempotence+=1;
  }
  const rows=[...table.values()];
  for(const left of rows) for(const right of rows){
    if(subsetOf(left.subset,right.subset)){
      monotonePairs+=1;if(!subsetOf(left.closure,right.closure)) monotoneFailures+=1;
    }
    unionChecks+=1;
    const unionId=setId(orderedSet(union(left.subset,right.subset)));
    const lhs=table.get(unionId).closure,rhs=orderedSet(union(left.closure,right.closure));
    if(!setEqual(lhs,rhs)) unionFailures+=1;
  }

  const closedSets=Object.keys(closed).map(idSet);
  const closedIdSet=new Set(Object.keys(closed));
  let latticePairs=0,latticeFailures=0,distributiveTriples=0,firstDistFailures=0,secondDistFailures=0;
  for(const X of closedSets) for(const Y of closedSets){
    latticePairs+=1;
    if(!closedIdSet.has(setId(orderedSet(intersection(X,Y))))||!closedIdSet.has(setId(orderedSet(union(X,Y))))) latticeFailures+=1;
  }
  for(const X of closedSets) for(const Y of closedSets) for(const Z of closedSets){
    distributiveTriples+=1;
    const firstLeft=intersection(X,union(Y,Z)),firstRight=union(intersection(X,Y),intersection(X,Z));
    const secondLeft=union(X,intersection(Y,Z)),secondRight=intersection(union(X,Y),union(X,Z));
    if(!setEqual(firstLeft,firstRight)) firstDistFailures+=1;
    if(!setEqual(secondLeft,secondRight)) secondDistFailures+=1;
  }

  const fullGenerators=[...table.values()].filter(row=>row.closure_id==='BRTAM').map(row=>row.subset_id);
  const minimalGenerators=minimalFullGenerators(table);
  const rGroups=groupsById.get('R');
  let splitRClasses=0,splitRContexts=0,splitAllQ3=true;
  for(const group of rGroups.values()){
    if(new Set(group.map(context=>taskValueKey(context,'M'))).size>1){
      splitRClasses+=1;splitRContexts+=group.length;
      if(!group.every(context=>context.row.actual_birth===3)) splitAllQ3=false;
    }
  }
  const namedLeft=contexts.find(context=>context.row.schedule_id==='P-H-I'&&context.row.bundle_id==='X3');
  const namedRight=contexts.find(context=>context.row.schedule_id==='H-P-I'&&context.row.bundle_id==='X3');
  const namedSplit=freeze({
    left:freeze({schedule_id:namedLeft?.row.schedule_id,bundle_id:namedLeft?.row.bundle_id,R:namedLeft?.tasks.R,M:namedLeft?.tasks.M}),
    right:freeze({schedule_id:namedRight?.row.schedule_id,bundle_id:namedRight?.row.bundle_id,R:namedRight?.tasks.R,M:namedRight?.tasks.M}),
    same_R:namedLeft&&namedRight?taskValueKey(namedLeft,'R')===taskValueKey(namedRight,'R'):false,
    same_M:namedLeft&&namedRight?taskValueKey(namedLeft,'M')===taskValueKey(namedRight,'M'):true,
  });

  const parentExact=parent.passed===true
    && FINITE_CUSTODY_TASK_DEPENDENCY_POSET_PARENT_RECEIPT==='8a17d896a74d76f284081c29badd0ec5028c5ab1'
    && parent.partitions?.Phi_declared_task_behavior_classes===36;
  const exact=parentExact&&bundleParent.passed&&policy.passed
    && antecedents.length===750&&contexts.length===762&&built.stage_profile_reconstructions===3048
    && tasked.replay_rows.R===1180&&tasked.replay_rows.T===784&&tasked.replay_rows.A===208&&tasked.replay_rows.M===208&&tasked.replay_rows.total===2380
    && subsets.length===32&&subsetSignatureConstructions===24384&&closureConstancyObservations===121920&&subsetExact
    && ruleMismatches===0&&deletionExact&&closedExact
    && table.get('EMPTY').closure_id==='EMPTY'&&extensivity===32&&idempotence===32&&monotonePairs===243&&monotoneFailures===0&&unionChecks===1024&&unionFailures===0
    && latticePairs===144&&latticeFailures===0&&distributiveTriples===1728&&firstDistFailures===0&&secondDistFailures===0
    && table.get('R').classes===32&&table.get('M').classes===21&&table.get('RM').classes===36
    && minimalGenerators.length===1&&minimalGenerators[0]==='RM'
    && splitRClasses===4&&splitRContexts===32&&splitAllQ3
    && namedSplit.same_R===true&&namedSplit.same_M===false
    && canonical(namedSplit.left.M)===canonical([5,5,5,'25x5','5x5'])
    && canonical(namedSplit.right.M)===canonical([5,5,5,'9x5','9x5']);
  const passed=exact;

  cachedCertificate=freeze({
    schema:FINITE_CUSTODY_TASK_DEPENDENCY_POSET_SCHEMA,
    parent_receipt:FINITE_CUSTODY_TASK_DEPENDENCY_POSET_PARENT_RECEIPT,
    domain:freeze({contexts:contexts.length,tasks:TASKS.length,task_subsets:subsets.length}),
    task_legend:freeze({B:'AUTHORITY_BIRTH',R:'R858_RESTORATION',T:'R860_TRANSPORT',A:'R862_ANTICIPATORY',M:'R864_MARGINAL_ALIAS'}),
    subset_table:subsetTable,
    dependency_poset:freeze({
      transitive_reduction:freeze(RULES.map(rule=>freeze([...rule]))),
      empirical_rule_mismatches:ruleMismatches,
      single_edge_deletion_mismatches:freeze({...deletion}),
      singleton_closures:freeze(Object.fromEntries(TASKS.map(task=>[task,table.get(task).closure_id]))),
    }),
    closed_set_lattice:freeze({
      closed_state_count:Object.keys(closed).length,states:closed,
      ordered_pair_checks:latticePairs,meet_join_failures:latticeFailures,
      ordered_triple_checks:distributiveTriples,first_distributivity_failures:firstDistFailures,second_distributivity_failures:secondDistFailures,
    }),
    finite_task_closure:freeze({
      empty_closure_empty:table.get('EMPTY').closure_id==='EMPTY',extensive_subsets:extensivity,idempotent_subsets:idempotence,
      monotone_ordered_inclusion_pairs:monotonePairs,monotonicity_failures:monotoneFailures,
      ordered_union_pairs:unionChecks,union_law_failures:unionFailures,
      kuratowski_finite_closure:table.get('EMPTY').closure_id==='EMPTY'&&extensivity===32&&idempotence===32&&monotoneFailures===0&&unionFailures===0,
      finite_alexandrov_style_corollary:true,
    }),
    generator:freeze({
      full_behavior_classes:36,full_generating_subsets:freeze(fullGenerators),minimal_full_generators:freeze(minimalGenerators),
      R_classes:table.get('R').classes,M_classes:table.get('M').classes,RM_classes:table.get('RM').classes,
      R_classes_split_by_M:splitRClasses,R_contexts_split_by_M:splitRContexts,split_contexts_all_q3_birth:splitAllQ3,named_split:namedSplit,
    }),
    execution_ledger:freeze({
      stage_support_profile_reconstructions:built.stage_profile_reconstructions,
      predecessor_task_replay_rows:tasked.replay_rows.total,
      task_output_values:contexts.length*TASKS.length,
      subset_context_signature_constructions:subsetSignatureConstructions,
      closure_constancy_context_task_observations:closureConstancyObservations,
      closure_extensivity_checks:32,closure_idempotence_checks:32,closure_monotonicity_pairs:monotonePairs,closure_union_pairs:unionChecks,
      rule_deletion_subset_comparisons:RULES.length*subsets.length,
      lattice_ordered_pair_checks:latticePairs,distributivity_ordered_triples:distributiveTriples,
    }),
    exact,passed,
    classifications:freeze(passed?[
      'IN_THE_FIXED_FIVE_TASK_SEVEN_HUNDRED_SIXTY_TWO_CONTEXT_CUSTODY_DOMAIN_THE_EMPIRICAL_FUNCTIONAL_CLOSURE_OF_ALL_THIRTY_TWO_TASK_SUBSETS_HAS_EXACTLY_TWELVE_CLOSED_STATES',
      'THE_EMPIRICAL_SINGLETON_TASK_DEPENDENCY_ORDER_HAS_FOUR_COVER_RELATIONS_R_TO_B_R_TO_T_T_TO_A_AND_M_TO_A_AND_THEIR_REACHABILITY_REPRODUCES_ALL_THIRTY_TWO_OBSERVED_CLOSURES',
      'THE_TWELVE_CLOSED_TASK_STATES_FORM_A_DISTRIBUTIVE_FINITE_SET_LATTICE_UNDER_INTERSECTION_AND_UNION_AND_THE_ASSOCIATED_EMPIRICAL_CLOSURE_SATISFIES_THE_PREREGISTERED_FINITE_KURATOWSKI_LAWS',
      'THE_PAIR_OF_ALREADY_EARNED_TASK_OUTPUTS_R858_RESTORATION_AND_R864_MARGINAL_ALIAS_IS_THE_UNIQUE_INCLUSION_MINIMAL_NAMED_TASK_SUBSET_GENERATING_THE_FULL_THIRTY_SIX_CLASS_DECLARED_BEHAVIOR_PARTITION_IN_THIS_FIXED_DOMAIN',
      'R858_RESTORATION_ALONE_LEAVES_EXACTLY_FOUR_EQUIVALENCE_CLASSES_COVERING_THIRTY_TWO_Q3_BIRTH_CONTEXTS_THAT_ARE_SPLIT_BY_THE_R864_TWO_SURFACE_MARGINAL_TASK',
    ]:[]),
    scars:freeze([
      'TASK_FUNCTIONAL_DEPENDENCY != SCIENTIFIC_ANCESTRY','TASK_FUNCTIONAL_DEPENDENCY != CAUSAL_DERIVATION','TASK_DEPENDENCY_ORDER != TEMPORAL_ORDER',
      'BEHAVIORAL_OUTPUT_REDUNDANCY != THEOREM_REDUNDANCY','FINITE_TASK_CLOSURE != FUTURE_TASK_CLOSURE','DISTRIBUTIVE_TASK_LATTICE != UNIVERSAL_INFORMATION_LATTICE',
      'FINITE_TASK_TOPOLOGY != MODEL_STATE_TOPOLOGY','FINITE_TASK_TOPOLOGY != PHYSICAL_SPACE','FINITE_TASK_TOPOLOGY != INFORMATION_GEOMETRY',
      'UNIQUE_MINIMAL_TASK_GENERATOR != UNIQUE_ENCODING','UNIQUE_MINIMAL_TASK_GENERATOR != MINIMUM_BIT_LENGTH','UNIQUE_MINIMAL_TASK_GENERATOR != UNIVERSAL_MINIMAL_EXPERIMENT',
      'R_PLUS_M_FULL_TASK_GENERATION != SEMANTIC_COMPLETENESS','TASK_CLOSURE != SOURCE_TRUTH','TASK_CLOSURE != RECEIVER_AUTHORITY','WITNESS_ROUTING != SCIENTIFIC_ANCESTRY',
    ]),
    custody_witness:PHASONIC_CUPOLA_CUSTODY_WITNESS,authority:zeroAuthority(),research_only:true,runtime_binding:false,
  });
  return cachedCertificate;
}

export function compileFiniteCustodyTaskDependencyPosetProjection(receiver){
  const certificate=finiteCustodyTaskDependencyPosetCertificate();
  if(!certificate.passed) throw new Error('cannot project uncertified finite custody task dependency poset');
  let payload;
  if(receiver===AIA_RECEIVERS.ASH) payload=freeze({
    payload_schema:'td613.dome-world.finite-custody-task-dependency-poset-child-legible/v0.1',
    truths:freeze([
      'FIVE_ALREADY_EARNED_CUSTODY_QUESTIONS_COLLAPSE_TO_TWELVE_CLOSED_TASK_STATES_UNDER_EXACT_FUNCTIONAL_DETERMINATION_IN_THIS_FIXED_FIXTURE',
      'RESTORATION_AND_TWO_SURFACE_MARGINAL_BEHAVIOR_TOGETHER_GENERATE_ALL_DECLARED_TASK_BEHAVIOR_HERE_WHILE_RESTORATION_ALONE_LEAVES_FOUR_Q3_BIRTH_CLASSES_UNRESOLVED',
      'THE_TASK_CLOSURE_HAS_A_FINITE_DISTRIBUTIVE_POSET_FORM_WITHOUT_TURNING_TASK_DEPENDENCY_INTO_CAUSALITY_OR_SCIENTIFIC_ANCESTRY',
    ]),
    closed_task_states:certificate.closed_set_lattice.closed_state_count,
    full_behavior_classes:certificate.generator.full_behavior_classes,
    minimal_generator:certificate.generator.minimal_full_generators,
    full_context_rows_exposed:false,full_task_value_tables_exposed:false,full_support_tables_exposed:false,
  });
  else if(receiver===AIA_RECEIVERS.LOOM) payload=freeze({
    payload_schema:'td613.dome-world.finite-custody-task-dependency-poset-loom-technical/v0.1',
    task_legend:certificate.task_legend,
    transitive_reduction:certificate.dependency_poset.transitive_reduction,
    closed_state_count:certificate.closed_set_lattice.closed_state_count,
    finite_closure:certificate.finite_task_closure,
    generator:freeze({minimal_full_generators:certificate.generator.minimal_full_generators,R_classes:32,M_classes:21,RM_classes:36}),
    full_context_rows_exposed:false,full_task_value_tables_exposed:false,full_support_tables_exposed:false,
  });
  else throw new Error(`undeclared task-dependency receiver ${receiver}`);
  return freeze({
    schema:FINITE_CUSTODY_TASK_DEPENDENCY_POSET_SCHEMA,receiver,custody_witness:PHASONIC_CUPOLA_CUSTODY_WITNESS,payload,
    authority:zeroAuthority(),research_only:true,runtime_binding:false,
    claim_ceiling:freeze({
      scientific_ancestry_from_task_edge:false,causal_derivation:false,temporal_order:false,future_task_closure:false,universal_information_lattice:false,
      model_state_topology:false,physical_topology:false,information_geometry:false,minimum_bit_length:false,unique_encoding:false,shannon_capacity:false,
      entropy:false,mutual_information:false,universal_database_dependency:false,category_functor_theorem:false,physical_holonomy:false,operational_path_groupoid:false,
      source_state_mutation:false,merge:false,deploy:false,publish:false,release:false,vercel:false,
    }),
  });
}

export function rejectFiniteCustodyTaskDependencyPosetOverreach(candidate){
  const forbidden=[
    'scientific_ancestry_from_task_edge','causal_derivation','temporal_order','future_task_closure','universal_information_lattice','model_state_topology','physical_topology',
    'information_geometry','minimum_bit_length','unique_encoding','shannon_capacity','entropy','mutual_information','universal_database_dependency','category_functor_theorem',
    'physical_holonomy','operational_path_groupoid','source_state_mutation',
  ];
  const violation=forbidden.some(key=>candidate?.[key]===true)
    || Object.values(candidate?.authority??{}).some(Boolean)
    || Object.values(candidate?.claim_ceiling??{}).some(Boolean)
    || candidate?.payload?.full_context_rows_exposed===true
    || candidate?.payload?.full_task_value_tables_exposed===true
    || candidate?.payload?.full_support_tables_exposed===true;
  if(violation) throw new Error('finite custody task dependency poset claim ceiling exceeded');
  return true;
}
