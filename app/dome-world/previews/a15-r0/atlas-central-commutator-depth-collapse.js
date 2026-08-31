import {
  ATLAS_NONABELIAN_TWO_LOOP_HISTORY_DESCENT_SCHEMA,
  atlasNonabelianTwoLoopHistoryDescentCertificate,
} from './atlas-nonabelian-two-loop-history-descent.js';

export const ATLAS_CENTRAL_COMMUTATOR_DEPTH_COLLAPSE_SCHEMA='td613.dome-world.atlas-central-commutator-depth-collapse/v0.1';
export const ATLAS_CENTRAL_COMMUTATOR_DEPTH_COLLAPSE_PARENT_RECEIPT='6343ced7cf274b5f3981cfcb68e3a255447ffcd6';

const STATES=Object.freeze([[0,0],[0,1],[1,0],[1,1]].map(row=>Object.freeze(row)));
const INDEX=new Map(STATES.map((row,index)=>[row.join(''),index]));
const INVERSE_SYMBOL=Object.freeze({a:'A',A:'a',b:'B',B:'b'});
let cached=null;

function freeze(value){
  if(value&&typeof value==='object'&&!Object.isFrozen(value)){ Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
const pairId=pair=>pair.join('');
const samePair=(a,b)=>a[0]===b[0]&&a[1]===b[1];
const ID=state=>Object.freeze([...state]);
const A_TRANSPORT=([x,y])=>Object.freeze([x^1,y]);
const B_TRANSPORT=([x,y])=>Object.freeze([x,y^x]);
const Y_FLIP=([x,y])=>Object.freeze([x,y^1]);
function mapOf(fn){ return Object.freeze(STATES.map(state=>Object.freeze([...fn(state)]))); }
function mapId(map){ return map.map(pairId).join('|'); }
function applyMap(map,state){ return map[INDEX.get(pairId(state))]; }
function compose(left,right){ return Object.freeze(STATES.map(state=>Object.freeze([...applyMap(right,applyMap(left,state))]))); }
function isIdentity(map){ return STATES.every((state,index)=>samePair(state,map[index])); }
function inverseIn(group,map){
  for(const candidate of group) if(isIdentity(compose(map,candidate))&&isIdentity(compose(candidate,map))) return candidate;
  return null;
}
function closure(generators){
  const identity=mapOf(ID);
  const byId=new Map([[mapId(identity),identity]]);
  let changed=true;
  while(changed){
    changed=false;
    const current=[...byId.values()];
    for(const left of current) for(const right of [...generators,...current]){
      for(const candidate of [compose(left,right),compose(right,left)]){
        const id=mapId(candidate);
        if(!byId.has(id)){ byId.set(id,candidate); changed=true; }
      }
    }
  }
  return Object.freeze([...byId.values()].sort((a,b)=>mapId(a).localeCompare(mapId(b))));
}
function commutator(left,right,group){
  const leftInv=inverseIn(group,left),rightInv=inverseIn(group,right);
  if(!leftInv||!rightInv) throw new Error('commutator requires invertible transports');
  return compose(compose(compose(left,right),leftInv),rightInv);
}
function subgroupClosure(seed,group){
  const identity=mapOf(ID);
  const byId=new Map([[mapId(identity),identity],...seed.map(map=>[mapId(map),map])]);
  let changed=true;
  while(changed){
    changed=false;
    const current=[...byId.values()];
    for(const left of current) for(const right of current){
      const candidate=compose(left,right);
      const id=mapId(candidate);
      if(!byId.has(id)){ byId.set(id,candidate); changed=true; }
    }
  }
  const groupIds=new Set(group.map(mapId));
  if([...byId.keys()].some(id=>!groupIds.has(id))) throw new Error('subgroup closure escaped parent group');
  return Object.freeze([...byId.values()].sort((a,b)=>mapId(a).localeCompare(mapId(b))));
}
function sameMapSet(left,right){
  const a=[...left].map(mapId).sort();
  const b=[...right].map(mapId).sort();
  return JSON.stringify(a)===JSON.stringify(b);
}
function reduceWord(word){
  const stack=[];
  for(const symbol of word){
    if(stack.length&&INVERSE_SYMBOL[stack.at(-1)]===symbol) stack.pop();
    else stack.push(symbol);
  }
  return stack.join('');
}
function inverseWord(word){ return [...word].reverse().map(symbol=>INVERSE_SYMBOL[symbol]).join(''); }
function commutatorWord(left,right){ return reduceWord(left+right+inverseWord(left)+inverseWord(right)); }
function evaluateWord(word,letterMaps){
  let result=mapOf(ID);
  for(const symbol of word) result=compose(result,letterMaps[symbol]);
  return result;
}

export function atlasCentralCommutatorDepthCollapseCertificate(){
  if(cached) return cached;

  const parent=atlasNonabelianTwoLoopHistoryDescentCertificate();
  const parentExact=parent.passed===true&&
    ATLAS_NONABELIAN_TWO_LOOP_HISTORY_DESCENT_SCHEMA==='td613.dome-world.atlas-nonabelian-two-loop-history-descent/v0.1'&&
    parent.transport_group?.size===8&&
    parent.transport_group?.classification==='D8'&&
    parent.transport_group?.noncommuting_ordered_pairs===24&&
    parent.abelianization?.derived_subgroup_size===2&&
    parent.abelianization?.classification==='C2xC2'&&
    parent.pair_census?.same_holonomy_future_mismatches===0;

  const idMap=mapOf(ID),aMap=mapOf(A_TRANSPORT),bMap=mapOf(B_TRANSPORT),expectedNontrivialCommutator=mapOf(Y_FLIP);
  const group=closure([aMap,bMap]);
  const aInv=inverseIn(group,aMap),bInv=inverseIn(group,bMap);
  if(!aInv||!bInv) throw new Error('declared generators must remain invertible');
  const letterMaps=Object.freeze({a:aMap,A:aInv,b:bMap,B:bInv});

  let groupMultiplicationChecks=0,groupMultiplicationEscapes=0;
  const groupIds=new Set(group.map(mapId));
  for(const left of group) for(const right of group){
    groupMultiplicationChecks+=1;
    if(!groupIds.has(mapId(compose(left,right)))) groupMultiplicationEscapes+=1;
  }

  let firstCommutatorChecks=0;
  const firstCommutatorCounts=new Map();
  const firstCommutatorMaps=new Map();
  for(const left of group) for(const right of group){
    firstCommutatorChecks+=1;
    const value=commutator(left,right,group);
    const id=mapId(value);
    firstCommutatorCounts.set(id,(firstCommutatorCounts.get(id)||0)+1);
    firstCommutatorMaps.set(id,value);
  }
  const derived=subgroupClosure([...firstCommutatorMaps.values()],group);
  const identityFirstCommutators=firstCommutatorCounts.get(mapId(idMap))||0;
  const nonidentityFirstCommutators=firstCommutatorChecks-identityFirstCommutators;
  const nonidentityFirstMaps=[...firstCommutatorMaps.values()].filter(map=>!isIdentity(map));
  const uniqueNonidentityIsEarnedHolonomy=nonidentityFirstMaps.length===1&&mapId(nonidentityFirstMaps[0])===mapId(expectedNontrivialCommutator);

  let centerRelationChecks=0;
  const center=[];
  for(const candidate of group){
    let central=true;
    for(const other of group){
      centerRelationChecks+=1;
      if(mapId(compose(candidate,other))!==mapId(compose(other,candidate))) central=false;
    }
    if(central) center.push(candidate);
  }
  const centerEqualsDerived=sameMapSet(center,derived);

  let derivedCentralityChecks=0,derivedCentralityFailures=0;
  for(const d of derived) for(const g of group){
    derivedCentralityChecks+=1;
    if(mapId(compose(d,g))!==mapId(compose(g,d))) derivedCentralityFailures+=1;
  }

  let gamma2ByGroupChecks=0,gamma2ByGroupNonidentity=0;
  const gamma3Seeds=[];
  for(const d of derived) for(const g of group){
    gamma2ByGroupChecks+=1;
    const value=commutator(d,g,group);
    gamma3Seeds.push(value);
    if(!isIdentity(value)) gamma2ByGroupNonidentity+=1;
  }
  const gamma3=subgroupClosure(gamma3Seeds,group);

  let secondDerivedChecks=0,secondDerivedNonidentity=0;
  const secondDerivedSeeds=[];
  for(const left of derived) for(const right of derived){
    secondDerivedChecks+=1;
    const value=commutator(left,right,group);
    secondDerivedSeeds.push(value);
    if(!isIdentity(value)) secondDerivedNonidentity+=1;
  }
  const secondDerived=subgroupClosure(secondDerivedSeeds,group);

  let leftTripleChecks=0,leftTripleNonidentity=0,rightTripleChecks=0,rightTripleNonidentity=0;
  for(const g of group) for(const h of group) for(const k of group){
    const leftNested=commutator(commutator(g,h,group),k,group);
    leftTripleChecks+=1;
    if(!isIdentity(leftNested)) leftTripleNonidentity+=1;
    const rightNested=commutator(g,commutator(h,k,group),group);
    rightTripleChecks+=1;
    if(!isIdentity(rightNested)) rightTripleNonidentity+=1;
  }

  const firstFreeCommutator=commutatorWord('a','b');
  const leftTripleFreeA=commutatorWord(firstFreeCommutator,'a');
  const leftTripleFreeB=commutatorWord(firstFreeCommutator,'b');
  const firstFreeMap=evaluateWord(firstFreeCommutator,letterMaps);
  const leftTripleAMap=evaluateWord(leftTripleFreeA,letterMaps);
  const leftTripleBMap=evaluateWord(leftTripleFreeB,letterMaps);
  const aaWord=reduceWord('aa');
  const aaMap=evaluateWord(aaWord,letterMaps);

  const firstFreeSurvives=firstFreeCommutator==='abAB'&&firstFreeCommutator.length>0&&!isIdentity(firstFreeMap);
  const leftTripleAExact=leftTripleFreeA==='abABabaBAA'&&leftTripleFreeA.length>0&&isIdentity(leftTripleAMap);
  const leftTripleBExact=leftTripleFreeB==='abAbaBAB'&&leftTripleFreeB.length>0&&isIdentity(leftTripleBMap);
  const independentKernelWitness=aaWord==='aa'&&aaWord.length>0&&isIdentity(aaMap);

  const lowerCentralSizes=Object.freeze([group.length,derived.length,gamma3.length]);
  const derivedSeriesSizes=Object.freeze([group.length,derived.length,secondDerived.length]);
  const nilpotencyClass=derived.length>1&&gamma3.length===1?2:null;
  const derivedLength=derived.length>1&&secondDerived.length===1?2:null;
  const gamma3FreeHistoryMapsTriviallyByHomomorphism=gamma3.length===1;

  const exact=parentExact&&group.length===8&&groupMultiplicationChecks===64&&groupMultiplicationEscapes===0&&
    firstCommutatorChecks===64&&firstCommutatorMaps.size===2&&identityFirstCommutators===40&&nonidentityFirstCommutators===24&&uniqueNonidentityIsEarnedHolonomy&&
    derived.length===2&&centerRelationChecks===64&&center.length===2&&centerEqualsDerived&&
    derivedCentralityChecks===16&&derivedCentralityFailures===0&&
    gamma2ByGroupChecks===16&&gamma2ByGroupNonidentity===0&&gamma3.length===1&&
    secondDerivedChecks===4&&secondDerivedNonidentity===0&&secondDerived.length===1&&
    leftTripleChecks===512&&leftTripleNonidentity===0&&rightTripleChecks===512&&rightTripleNonidentity===0&&
    nilpotencyClass===2&&derivedLength===2&&
    firstFreeSurvives&&leftTripleAExact&&leftTripleBExact&&gamma3FreeHistoryMapsTriviallyByHomomorphism&&independentKernelWitness;

  cached=freeze({
    schema:ATLAS_CENTRAL_COMMUTATOR_DEPTH_COLLAPSE_SCHEMA,
    parent_receipt:ATLAS_CENTRAL_COMMUTATOR_DEPTH_COLLAPSE_PARENT_RECEIPT,
    parent_exact:parentExact,
    group:freeze({size:group.length,multiplication_checks:groupMultiplicationChecks,multiplication_escapes:groupMultiplicationEscapes}),
    first_commutators:freeze({checks:firstCommutatorChecks,distinct_values:firstCommutatorMaps.size,identity:identityFirstCommutators,nonidentity:nonidentityFirstCommutators,unique_nonidentity_equals_earned_holonomy:uniqueNonidentityIsEarnedHolonomy}),
    center:freeze({relation_checks:centerRelationChecks,size:center.length,equals_derived_subgroup:centerEqualsDerived,derived_centrality_checks:derivedCentralityChecks,derived_centrality_failures:derivedCentralityFailures}),
    lower_central:freeze({sizes:lowerCentralSizes,gamma2_by_group_checks:gamma2ByGroupChecks,gamma2_by_group_nonidentity:gamma2ByGroupNonidentity,nilpotency_class:nilpotencyClass}),
    derived_series:freeze({sizes:derivedSeriesSizes,second_step_checks:secondDerivedChecks,second_step_nonidentity:secondDerivedNonidentity,derived_length:derivedLength}),
    triple_commutators:freeze({left_normed_checks:leftTripleChecks,left_normed_nonidentity:leftTripleNonidentity,right_normed_checks:rightTripleChecks,right_normed_nonidentity:rightTripleNonidentity}),
    free_history_witnesses:freeze({
      first_commutator:freeze({word:firstFreeCommutator,nonempty:firstFreeCommutator.length>0,holonomy_identity:isIdentity(firstFreeMap)}),
      left_triple_a:freeze({word:leftTripleFreeA,nonempty:leftTripleFreeA.length>0,holonomy_identity:isIdentity(leftTripleAMap)}),
      left_triple_b:freeze({word:leftTripleFreeB,nonempty:leftTripleFreeB.length>0,holonomy_identity:isIdentity(leftTripleBMap)}),
      independent_kernel:freeze({word:aaWord,nonempty:aaWord.length>0,holonomy_identity:isIdentity(aaMap)}),
    }),
    laws:freeze({
      nonabelian_history_survives_first_commutator_layer:derived.length===2&&nonidentityFirstCommutators>0,
      derived_subgroup_equals_center:centerEqualsDerived&&derived.length===2,
      all_third_level_commutators_collapse:gamma3.length===1&&leftTripleNonidentity===0&&rightTripleNonidentity===0,
      exact_nilpotency_class_two:nilpotencyClass===2,
      exact_derived_length_two:derivedLength===2,
      gamma3_free_history_maps_trivially_by_homomorphism:gamma3FreeHistoryMapsTriviallyByHomomorphism,
      gamma3_kernel_equality_claimed:false,
    }),
    execution_ledger:freeze({group_multiplication_checks:groupMultiplicationChecks,first_commutator_checks:firstCommutatorChecks,center_relation_checks:centerRelationChecks,derived_centrality_checks:derivedCentralityChecks,gamma2_by_group_checks:gamma2ByGroupChecks,second_derived_checks:secondDerivedChecks,left_triple_checks:leftTripleChecks,right_triple_checks:rightTripleChecks}),
    membranes:freeze([
      'NILPOTENCY_CLASS_2 != PHYSICAL_DYNAMICAL_COMPLEXITY',
      'LOWER_CENTRAL_SERIES != TEMPORAL_STAGE_SEQUENCE',
      'COMMUTATOR_DEPTH != CAUSAL_DEPTH',
      'CENTER_OF_FORMAL_TRANSPORT_GROUP != PHYSICAL_SYMMETRY_CENTER',
      'TRIPLE_COMMUTATOR_COLLAPSE != EXACT_HISTORY_ERASURE',
      'GAMMA3_SUBSET_KERNEL != KERNEL_EQUALITY',
      'SOLVABLE_GROUP != SOLVABLE_REAL_WORLD_SYSTEM',
      'FREE_GROUP_HISTORY != LIVE_ROUTE_HISTORY',
      'FORMAL_DISCRETE_HOLONOMY != GEOMETRIC_OR_PHYSICAL_HOLONOMY',
      'ATLAS_REGISTRATION != LIVE_RUNTIME_STATE',
    ]),
    passed:exact,
  });
  return cached;
}

export const ATLAS_CENTRAL_COMMUTATOR_DEPTH_COLLAPSE_CERTIFICATE=atlasCentralCommutatorDepthCollapseCertificate();
