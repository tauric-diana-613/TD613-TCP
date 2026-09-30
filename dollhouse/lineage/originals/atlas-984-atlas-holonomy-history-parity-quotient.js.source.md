import {
  HOLONOMY_LOOM_MOSS_LANTERN_DISCRETE_TRANSPORT_SCHEMA,
  holonomyLoomMossLanternDiscreteTransportCertificate,
} from './holonomy-loom-moss-lantern-discrete-transport.js';

export const ATLAS_HOLONOMY_HISTORY_PARITY_QUOTIENT_SCHEMA='td613.dome-world.atlas-holonomy-history-parity-quotient/v0.1';
export const ATLAS_HOLONOMY_HISTORY_PARITY_QUOTIENT_PARENT_RECEIPT='6df04aebd040fd16c8f67188a61dd6380956c46e';

const STATES=Object.freeze([[0,0],[0,1],[1,0],[1,1]].map(row=>Object.freeze(row)));
const INDEX=new Map(STATES.map((row,index)=>[row.join(''),index]));
const WINDOW=Object.freeze(Array.from({length:17},(_,index)=>index-8));
const ENDPOINT='returned-practice-capsule';
let cached=null;

function freeze(value){
  if(value&&typeof value==='object'&&!Object.isFrozen(value)){ Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
const pairId=pair=>pair.join('');
const samePair=(a,b)=>a[0]===b[0]&&a[1]===b[1];
const ID=state=>Object.freeze([...state]);
const A=([x,y])=>Object.freeze([x^1,y]);
const B=([x,y])=>Object.freeze([x,y^x]);
const MARKER=([,y])=>y;
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
function power(map,n,group){
  const identity=mapOf(ID);
  if(n===0) return identity;
  const base=n<0?inverseIn(group,map):map;
  if(!base) throw new Error('negative loop power requires invertible holonomy');
  let result=identity;
  for(let i=0;i<Math.abs(n);i+=1) result=compose(result,base);
  return result;
}
function parentHolonomyMap(parent){
  const byStart=new Map(parent.holonomy.rows.map(row=>[row.start,row.end]));
  return Object.freeze(STATES.map(state=>{
    const end=byStart.get(pairId(state));
    if(!end) throw new Error(`missing parent holonomy row for ${pairId(state)}`);
    return Object.freeze(end.split('').map(Number));
  }));
}

export function atlasHolonomyHistoryParityQuotientCertificate(){
  if(cached) return cached;

  const parent=holonomyLoomMossLanternDiscreteTransportCertificate();
  const parentExact=parent.passed===true&&
    HOLONOMY_LOOM_MOSS_LANTERN_DISCRETE_TRANSPORT_SCHEMA==='td613.dome-world.holonomy-loom-moss-lantern-discrete-transport/v0.1'&&
    parent.laws?.formal_discrete_holonomy_nontrivial===true&&
    parent.laws?.holonomy_order_two===true&&
    parent.transport?.group_size===8&&
    parent.controls?.memoryless_endpoint_divergences===0;

  const idMap=mapOf(ID),aMap=mapOf(A),bMap=mapOf(B);
  const group=closure([aMap,bMap]);
  const holonomy=parentHolonomyMap(parent);
  const holonomyInverse=inverseIn(group,holonomy);
  let generatorOrder=null;
  for(let k=1;k<=group.length;k+=1){
    if(isIdentity(power(holonomy,k,group))){ generatorOrder=k; break; }
  }

  const windingRows=[];
  const imageIds=new Set();
  let windingFiberEvaluations=0;
  let visibleEndpointDivergences=0;
  let evenWindings=0,oddWindings=0;
  for(const n of WINDOW){
    const action=power(holonomy,n,group);
    const id=mapId(action);
    imageIds.add(id);
    const outputs=[];
    for(const start of STATES){
      windingFiberEvaluations+=1;
      outputs.push(freeze({start:pairId(start),end:pairId(applyMap(action,start)),marker:MARKER(applyMap(action,start))}));
    }
    if(ENDPOINT!=='returned-practice-capsule') visibleEndpointDivergences+=1;
    if(n%2===0) evenWindings+=1; else oddWindings+=1;
    windingRows.push(freeze({winding:n,action_id:id,parity:n%2===0?'EVEN':'ODD',outputs:freeze(outputs),visible_endpoint:ENDPOINT}));
  }

  let unorderedPairs=0,sameParityPairs=0,oppositeParityPairs=0;
  let actionParityMismatches=0;
  let sameParityFutureComparisons=0,sameParityFutureReadoutMismatches=0;
  let oppositeParityImmediateComparisons=0,oppositeParityImmediateFailures=0;
  const pairRows=[];
  for(let i=0;i<WINDOW.length;i+=1){
    for(let j=i+1;j<WINDOW.length;j+=1){
      unorderedPairs+=1;
      const n=WINDOW[i],m=WINDOW[j];
      const left=power(holonomy,n,group),right=power(holonomy,m,group);
      const sameParity=((n-m)%2===0);
      const sameAction=mapId(left)===mapId(right);
      if(sameParity!==sameAction) actionParityMismatches+=1;
      if(sameParity){
        sameParityPairs+=1;
        for(const start of STATES){
          const leftState=applyMap(left,start),rightState=applyMap(right,start);
          for(const future of group){
            sameParityFutureComparisons+=1;
            const l=MARKER(applyMap(future,leftState));
            const r=MARKER(applyMap(future,rightState));
            if(l!==r) sameParityFutureReadoutMismatches+=1;
          }
        }
      }else{
        oppositeParityPairs+=1;
        for(const start of STATES){
          oppositeParityImmediateComparisons+=1;
          const l=MARKER(applyMap(left,start));
          const r=MARKER(applyMap(right,start));
          if(l===r) oppositeParityImmediateFailures+=1;
        }
      }
      pairRows.push(freeze({left:n,right:m,same_parity:sameParity,same_action:sameAction}));
    }
  }

  const representativePairs=freeze([
    {left:0,right:2,expected:'SAME'},
    {left:0,right:-2,expected:'SAME'},
    {left:1,right:3,expected:'SAME'},
    {left:1,right:-1,expected:'SAME'},
    {left:0,right:1,expected:'DIFFERENT'},
    {left:1,right:2,expected:'DIFFERENT'},
  ].map(row=>freeze({...row,observed:mapId(power(holonomy,row.left,group))===mapId(power(holonomy,row.right,group))?'SAME':'DIFFERENT'})));

  const representativeExact=representativePairs.every(row=>row.expected===row.observed);
  const magnitudeLost=mapId(power(holonomy,1,group))===mapId(power(holonomy,3,group));
  const signLost=mapId(power(holonomy,1,group))===mapId(power(holonomy,-1,group));
  const visibleClasses=1;
  const apparatusClasses=imageIds.size;
  const kernelDescription=generatorOrder===2?'2Z':'UNRESOLVED';
  const quotientDescription=generatorOrder===2&&apparatusClasses===2?'Z/2Z':'UNRESOLVED';

  const exact=parentExact&&group.length===8&&holonomyInverse!==null&&generatorOrder===2&&
    WINDOW.length===17&&evenWindings===9&&oddWindings===8&&windingFiberEvaluations===68&&visibleEndpointDivergences===0&&
    unorderedPairs===136&&sameParityPairs===64&&oppositeParityPairs===72&&actionParityMismatches===0&&
    sameParityFutureComparisons===2048&&sameParityFutureReadoutMismatches===0&&
    oppositeParityImmediateComparisons===288&&oppositeParityImmediateFailures===0&&
    visibleClasses===1&&apparatusClasses===2&&kernelDescription==='2Z'&&quotientDescription==='Z/2Z'&&
    representativeExact&&magnitudeLost&&signLost;

  cached=freeze({
    schema:ATLAS_HOLONOMY_HISTORY_PARITY_QUOTIENT_SCHEMA,
    parent_receipt:ATLAS_HOLONOMY_HISTORY_PARITY_QUOTIENT_PARENT_RECEIPT,
    parent_exact:parentExact,
    history_domain:freeze({generator:'gamma',domain:'integer loop powers gamma^n',group:'Z',full_path_space_claim:false}),
    representations:freeze({
      visible:freeze({image_size:visibleClasses,kernel:'Z',history_classes:visibleClasses,endpoint:ENDPOINT}),
      apparatus:freeze({generator_order:generatorOrder,image_size:apparatusClasses,kernel:kernelDescription,history_classes:apparatusClasses,quotient:quotientDescription,equivalence:'n congruent m mod 2'}),
    }),
    window:freeze({min:-8,max:8,size:WINDOW.length,even:evenWindings,odd:oddWindings,rows:freeze(windingRows),unordered_distinct_pairs:unorderedPairs,same_parity_pairs:sameParityPairs,opposite_parity_pairs:oppositeParityPairs}),
    continuation:freeze({same_parity_future_transport_marker_comparisons:sameParityFutureComparisons,same_parity_future_readout_mismatches:sameParityFutureReadoutMismatches,opposite_parity_immediate_marker_comparisons:oppositeParityImmediateComparisons,opposite_parity_immediate_marker_failures:oppositeParityImmediateFailures}),
    witnesses:freeze({representative_pairs:representativePairs,winding_magnitude_lost:magnitudeLost,winding_sign_lost:signLost,exact_winding_decoder_available:false}),
    laws:freeze({
      loop_power_holonomy_representation_factors_through_parity:generatorOrder===2&&apparatusClasses===2&&actionParityMismatches===0,
      apparatus_history_equivalence_iff_winding_parity:actionParityMismatches===0,
      visible_history_quotient_strictly_coarser:visibleClasses===1&&apparatusClasses===2,
      same_parity_future_continuation_equivalent:sameParityFutureReadoutMismatches===0,
      opposite_parity_immediately_distinguishable:oppositeParityImmediateFailures===0,
      holonomy_class_forgets_winding_magnitude_and_sign:magnitudeLost&&signLost,
    }),
    execution_ledger:freeze({transport_group_size:group.length,winding_fiber_evaluations:windingFiberEvaluations,unordered_winding_pair_checks:unorderedPairs,same_parity_future_transport_marker_comparisons:sameParityFutureComparisons,opposite_parity_immediate_marker_comparisons:oppositeParityImmediateComparisons}),
    membranes:freeze(['LOOP_POWER_HISTORY_QUOTIENT != FULL_PATH_SPACE_QUOTIENT','HOLONOMY_PARITY != EXACT_WINDING_NUMBER','HOLONOMY_PARITY != ROUTE_RECONSTRUCTION','VISIBLE_ENDPOINT_EQUIVALENCE != APPARATUS_HISTORY_EQUIVALENCE','Z_MOD_2Z_HISTORY_QUOTIENT != PHYSICAL_TOPOLOGICAL_PHASE','FORMAL_LOOP_WINDING != PHYSICAL_WINDING','HISTORY_RESIDUAL_CLASS != HISTORICAL_SOURCE_PROVENANCE','FINITE_WITNESS_WINDOW != PROOF_BY_SAMPLING','ATLAS_REGISTRATION != LIVE_RUNTIME_STATE']),
    passed:exact,
  });
  return cached;
}

export const ATLAS_HOLONOMY_HISTORY_PARITY_QUOTIENT_CERTIFICATE=atlasHolonomyHistoryParityQuotientCertificate();
