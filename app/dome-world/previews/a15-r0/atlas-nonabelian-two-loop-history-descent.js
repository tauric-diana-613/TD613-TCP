import {
  ATLAS_HOLONOMY_HISTORY_PARITY_QUOTIENT_SCHEMA,
  atlasHolonomyHistoryParityQuotientCertificate,
} from './atlas-holonomy-history-parity-quotient.js';

export const ATLAS_NONABELIAN_TWO_LOOP_HISTORY_DESCENT_SCHEMA='td613.dome-world.atlas-nonabelian-two-loop-history-descent/v0.1';
export const ATLAS_NONABELIAN_TWO_LOOP_HISTORY_DESCENT_PARENT_RECEIPT='34d55447a798c24599bc84402ceef2ce29849247';

const STATES=Object.freeze([[0,0],[0,1],[1,0],[1,1]].map(row=>Object.freeze(row)));
const INDEX=new Map(STATES.map((row,index)=>[row.join(''),index]));
const ENDPOINT='returned-practice-capsule';
const LETTERS=Object.freeze(['a','A','b','B']);
const INVERSE=Object.freeze({a:'A',A:'a',b:'B',B:'b'});
const MAX_WORD_LENGTH=4;
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
function mapOf(fn){ return Object.freeze(STATES.map(state=>Object.freeze([...fn(state)]))); }
function mapId(map){ return map.map(pairId).join('|'); }
function applyMap(map,state){ return map[INDEX.get(pairId(state))]; }
function compose(left,right){ return Object.freeze(STATES.map(state=>Object.freeze([...applyMap(right,applyMap(left,state))]))); }
function isIdentity(map){ return STATES.every((state,index)=>samePair(state,map[index])); }
function isBijective(map){ return new Set(map.map(pairId)).size===STATES.length; }
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
function orderOf(map,group){
  const identity=mapOf(ID);
  let value=identity;
  for(let k=1;k<=group.length*2;k+=1){
    value=compose(value,map);
    if(isIdentity(value)) return k;
  }
  return null;
}
function commutator(left,right,group){
  const leftInv=inverseIn(group,left),rightInv=inverseIn(group,right);
  if(!leftInv||!rightInv) throw new Error('commutator requires group inverses');
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
  if([...byId.keys()].some(id=>!groupIds.has(id))) throw new Error('derived subgroup escaped transport group');
  return Object.freeze([...byId.values()].sort((a,b)=>mapId(a).localeCompare(mapId(b))));
}
function cosetId(map,subgroup){
  return subgroup.map(h=>mapId(compose(map,h))).sort().join('::');
}
function reducedWords(maxLength){
  const byLength=Array.from({length:maxLength+1},()=>[]);
  byLength[0].push('');
  for(let length=1;length<=maxLength;length+=1){
    const walk=(prefix)=>{
      if(prefix.length===length){ byLength[length].push(prefix); return; }
      for(const letter of LETTERS){
        const previous=prefix.at(-1);
        if(previous&&INVERSE[previous]===letter) continue;
        walk(prefix+letter);
      }
    };
    walk('');
  }
  return Object.freeze({by_length:Object.freeze(byLength.map(rows=>Object.freeze([...rows]))),all:Object.freeze(byLength.flat())});
}
function evaluateWord(word,letterMaps){
  let result=mapOf(ID);
  for(const letter of word) result=compose(result,letterMaps[letter]);
  return result;
}
function sortedCounts(counter){ return [...counter.values()].sort((a,b)=>b-a); }

export function atlasNonabelianTwoLoopHistoryDescentCertificate(){
  if(cached) return cached;

  const parent=atlasHolonomyHistoryParityQuotientCertificate();
  const parentExact=parent.passed===true&&
    ATLAS_HOLONOMY_HISTORY_PARITY_QUOTIENT_SCHEMA==='td613.dome-world.atlas-holonomy-history-parity-quotient/v0.1'&&
    parent.laws?.apparatus_history_equivalence_iff_winding_parity===true&&
    parent.representations?.apparatus?.history_classes===2&&
    parent.representations?.visible?.history_classes===1;

  const idMap=mapOf(ID),aMap=mapOf(A_TRANSPORT),bMap=mapOf(B_TRANSPORT);
  const group=closure([aMap,bMap]);
  const aInv=inverseIn(group,aMap),bInv=inverseIn(group,bMap);
  if(!aInv||!bInv) throw new Error('declared two-loop transports must be invertible');
  const letterMaps=Object.freeze({a:aMap,A:aInv,b:bMap,B:bInv});

  const groupBijections=group.filter(isBijective).length;
  const groupInverseFailures=group.filter(map=>inverseIn(group,map)===null).length;
  const aOrder=orderOf(aMap,group),bOrder=orderOf(bMap,group);
  const abMap=compose(aMap,bMap);
  const abOrder=orderOf(abMap,group);
  let noncommutingOrderedPairs=0;
  for(const left of group) for(const right of group) if(mapId(compose(left,right))!==mapId(compose(right,left))) noncommutingOrderedPairs+=1;

  let commutatorChecks=0;
  const commutatorIds=new Map();
  for(const left of group) for(const right of group){
    commutatorChecks+=1;
    const value=commutator(left,right,group);
    commutatorIds.set(mapId(value),value);
  }
  const derived=subgroupClosure([...commutatorIds.values()],group);

  const cosetById=new Map();
  for(const map of group){
    const id=cosetId(map,derived);
    if(!cosetById.has(id)) cosetById.set(id,[]);
    cosetById.get(id).push(map);
  }
  const cosetIds=[...cosetById.keys()].sort();
  const cosetIndex=new Map(cosetIds.map((id,index)=>[id,index]));
  const cosetRepresentatives=cosetIds.map(id=>cosetById.get(id)[0]);
  let quotientWellDefinedChecks=0,quotientWellDefinedFailures=0,quotientCommutativityFailures=0;
  const quotientProduct=Array.from({length:cosetIds.length},()=>Array(cosetIds.length).fill(null));
  for(let i=0;i<cosetIds.length;i+=1){
    for(let j=0;j<cosetIds.length;j+=1){
      const memberProducts=new Set();
      for(const left of cosetById.get(cosetIds[i])) for(const right of cosetById.get(cosetIds[j])){
        quotientWellDefinedChecks+=1;
        memberProducts.add(cosetId(compose(left,right),derived));
      }
      if(memberProducts.size!==1) quotientWellDefinedFailures+=1;
      quotientProduct[i][j]=cosetIndex.get([...memberProducts][0]);
    }
  }
  for(let i=0;i<cosetIds.length;i+=1) for(let j=0;j<cosetIds.length;j+=1) if(quotientProduct[i][j]!==quotientProduct[j][i]) quotientCommutativityFailures+=1;
  const identityCoset=cosetIndex.get(cosetId(idMap,derived));
  let nonidentityCosetOrderTwo=0;
  for(let i=0;i<cosetIds.length;i+=1){
    if(i===identityCoset) continue;
    if(quotientProduct[i][i]===identityCoset) nonidentityCosetOrderTwo+=1;
  }

  const finiteGroupClassification=group.length===8&&aOrder===2&&bOrder===2&&abOrder===4&&noncommutingOrderedPairs>0?'D8':'UNRESOLVED';
  const abelianizationClassification=cosetIds.length===4&&quotientCommutativityFailures===0&&nonidentityCosetOrderTwo===3?'C2xC2':'UNRESOLVED';

  const words=reducedWords(MAX_WORD_LENGTH);
  const expectedLengthCounts=[1,4,12,36,108];
  const lengthCounts=words.by_length.map(rows=>rows.length);
  const wordRows=[];
  const holonomyCounts=new Map(),abelianCounts=new Map();
  for(const word of words.all){
    const hol=evaluateWord(word,letterMaps);
    const holId=mapId(hol);
    const abId=cosetId(hol,derived);
    holonomyCounts.set(holId,(holonomyCounts.get(holId)||0)+1);
    abelianCounts.set(abId,(abelianCounts.get(abId)||0)+1);
    wordRows.push(freeze({word,holonomy_id:holId,abelianized_class:cosetIndex.get(abId),visible_endpoint:ENDPOINT}));
  }

  let unorderedWordPairs=0,sameHolonomyPairs=0,sameAbelianizedPairs=0,sameAbelianDifferentHolonomyPairs=0,differentAbelianizedPairs=0;
  let sameHolonomyFutureChecks=0,sameHolonomyFutureMismatches=0;
  for(let i=0;i<wordRows.length;i+=1){
    for(let j=i+1;j<wordRows.length;j+=1){
      unorderedWordPairs+=1;
      const left=wordRows[i],right=wordRows[j];
      const sameHol=left.holonomy_id===right.holonomy_id;
      const sameAb=left.abelianized_class===right.abelianized_class;
      if(sameHol){
        sameHolonomyPairs+=1;
        const leftMap=evaluateWord(left.word,letterMaps),rightMap=evaluateWord(right.word,letterMaps);
        for(const future of group){
          sameHolonomyFutureChecks+=1;
          if(mapId(compose(leftMap,future))!==mapId(compose(rightMap,future))) sameHolonomyFutureMismatches+=1;
        }
      }
      if(sameAb) sameAbelianizedPairs+=1; else differentAbelianizedPairs+=1;
      if(sameAb&&!sameHol) sameAbelianDifferentHolonomyPairs+=1;
    }
  }

  const emptyMap=evaluateWord('',letterMaps);
  const aaMap=evaluateWord('aa',letterMaps);
  const commutatorMap=evaluateWord('abAB',letterMaps);
  const aWordMap=evaluateWord('a',letterMaps);
  const wordToHolonomyStrict='aa'!==''&&mapId(aaMap)===mapId(emptyMap);
  const holonomyToAbelianStrict=mapId(commutatorMap)!==mapId(emptyMap)&&cosetId(commutatorMap,derived)===cosetId(emptyMap,derived);
  const abelianToVisibleStrict=cosetId(aWordMap,derived)!==cosetId(emptyMap,derived)&&ENDPOINT===ENDPOINT;

  const exact=parentExact&&group.length===8&&groupBijections===8&&groupInverseFailures===0&&
    aOrder===2&&bOrder===2&&abOrder===4&&noncommutingOrderedPairs>0&&finiteGroupClassification==='D8'&&
    commutatorChecks===64&&derived.length===2&&cosetIds.length===4&&quotientWellDefinedFailures===0&&quotientCommutativityFailures===0&&nonidentityCosetOrderTwo===3&&abelianizationClassification==='C2xC2'&&
    JSON.stringify(lengthCounts)===JSON.stringify(expectedLengthCounts)&&words.all.length===161&&holonomyCounts.size===8&&abelianCounts.size===4&&
    JSON.stringify(sortedCounts(holonomyCounts))===JSON.stringify([33,32,28,28,12,12,8,8])&&
    JSON.stringify(sortedCounts(abelianCounts))===JSON.stringify([65,56,20,20])&&
    unorderedWordPairs===12880&&sameHolonomyPairs===1968&&sameAbelianizedPairs===4000&&sameAbelianDifferentHolonomyPairs===2032&&differentAbelianizedPairs===8880&&
    sameHolonomyFutureChecks===15744&&sameHolonomyFutureMismatches===0&&
    wordToHolonomyStrict&&holonomyToAbelianStrict&&abelianToVisibleStrict;

  cached=freeze({
    schema:ATLAS_NONABELIAN_TWO_LOOP_HISTORY_DESCENT_SCHEMA,
    parent_receipt:ATLAS_NONABELIAN_TWO_LOOP_HISTORY_DESCENT_PARENT_RECEIPT,
    parent_exact:parentExact,
    history_domain:freeze({base_graph:'bouquet of two based loops',group:'F(a,b)',alphabet:freeze([...LETTERS]),inverse_symbols:freeze({...INVERSE}),live_route_space_claim:false}),
    transport_group:freeze({size:group.length,bijective_elements:groupBijections,inverse_failures:groupInverseFailures,A_order:aOrder,B_order:bOrder,AB_order:abOrder,noncommuting_ordered_pairs:noncommutingOrderedPairs,classification:finiteGroupClassification}),
    abelianization:freeze({commutator_checks:commutatorChecks,derived_subgroup_size:derived.length,coset_count:cosetIds.length,well_defined_checks:quotientWellDefinedChecks,well_defined_failures:quotientWellDefinedFailures,commutativity_failures:quotientCommutativityFailures,nonidentity_order_two_classes:nonidentityCosetOrderTwo,classification:abelianizationClassification}),
    receivers:freeze({exact_word:freeze({domain:'free reduced words',global_classes:'INFINITE'}),holonomy:freeze({classes:group.length}),abelianized:freeze({classes:cosetIds.length}),visible:freeze({classes:1,endpoint:ENDPOINT})}),
    hostile_window:freeze({max_length:MAX_WORD_LENGTH,length_counts:freeze(lengthCounts),words:wordRows.length,holonomy_classes:holonomyCounts.size,abelianized_classes:abelianCounts.size,visible_classes:1,holonomy_population_multiset:freeze(sortedCounts(holonomyCounts)),abelianized_population_multiset:freeze(sortedCounts(abelianCounts))}),
    pair_census:freeze({unordered_distinct_word_pairs:unorderedWordPairs,same_holonomy_pairs:sameHolonomyPairs,same_abelianized_pairs:sameAbelianizedPairs,same_abelianized_different_holonomy_pairs:sameAbelianDifferentHolonomyPairs,different_abelianized_pairs:differentAbelianizedPairs,same_holonomy_future_group_continuation_checks:sameHolonomyFutureChecks,same_holonomy_future_mismatches:sameHolonomyFutureMismatches}),
    strict_witnesses:freeze({word_to_holonomy:freeze({left:'aa',right:'',strict:wordToHolonomyStrict}),holonomy_to_abelianized:freeze({left:'abAB',right:'',strict:holonomyToAbelianStrict}),abelianized_to_visible:freeze({left:'a',right:'',strict:abelianToVisibleStrict})}),
    laws:freeze({two_loop_holonomy_image_nonabelian_D8:finiteGroupClassification==='D8',abelianization_C2xC2:abelianizationClassification==='C2xC2',strict_word_to_holonomy_loss:wordToHolonomyStrict,strict_holonomy_to_abelianized_loss:holonomyToAbelianStrict,strict_abelianized_to_visible_loss:abelianToVisibleStrict,same_holonomy_stable_under_future_group_continuation:sameHolonomyFutureMismatches===0,strict_receiver_chain:wordToHolonomyStrict&&holonomyToAbelianStrict&&abelianToVisibleStrict}),
    execution_ledger:freeze({transport_group_elements:group.length,group_commutator_checks:commutatorChecks,quotient_well_defined_checks:quotientWellDefinedChecks,reduced_words:wordRows.length,unordered_word_pair_checks:unorderedWordPairs,future_group_continuation_checks:sameHolonomyFutureChecks}),
    membranes:freeze(['FREE_GROUP_LOOP_WORD != LIVE_ROUTE_HISTORY','NONABELIAN_FORMAL_HOLONOMY_GROUP != PHYSICAL_SYMMETRY_GROUP','D8_CLASSIFICATION != PHYSICAL_DIHEDRAL_SYMMETRY','GROUP_ABELIANIZATION != INFORMATION_THEORETIC_COMPRESSION','COMMUTATOR_SUBGROUP != PHYSICAL_CURVATURE','EXACT_WORD_LOSS != HISTORICAL_SOURCE_ERASURE','GLOBAL_HOLONOMY_OPERATOR != SINGLE_FIBER_ENDPOINT','HOLONOMY_EQUIVALENCE != EXACT_ROUTE_EQUIVALENCE','ABELIANIZED_HISTORY != COMPLETE_HOLONOMY_HISTORY','VISIBLE_ENDPOINT_HISTORY != APPARATUS_HISTORY','FINITE_WORD_WINDOW != PROOF_BY_SAMPLING','FORMAL_DISCRETE_HOLONOMY != GEOMETRIC_OR_PHYSICAL_HOLONOMY','ATLAS_REGISTRATION != LIVE_RUNTIME_STATE']),
    passed:exact,
  });
  return cached;
}

export const ATLAS_NONABELIAN_TWO_LOOP_HISTORY_DESCENT_CERTIFICATE=atlasNonabelianTwoLoopHistoryDescentCertificate();
