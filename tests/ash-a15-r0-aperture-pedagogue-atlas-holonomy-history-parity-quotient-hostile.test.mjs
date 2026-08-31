import assert from 'node:assert/strict';
import {
  holonomyLoomMossLanternDiscreteTransportCertificate,
} from '../app/dome-world/previews/a15-r0/holonomy-loom-moss-lantern-discrete-transport.js';

const STATES=Object.freeze([[0,0],[0,1],[1,0],[1,1]]);
const INDEX=new Map(STATES.map((row,index)=>[row.join(''),index]));
const WINDOW=Object.freeze(Array.from({length:17},(_,i)=>i-8));
const pairId=row=>row.join('');
const same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
const ID=state=>[...state];
const A=([x,y])=>[x^1,y];
const B=([x,y])=>[x,y^x];
const MARKER=([,y])=>y;
const mapOf=fn=>STATES.map(state=>fn(state));
const mapId=map=>map.map(pairId).join('|');
const apply=(map,state)=>map[INDEX.get(pairId(state))];
const compose=(left,right)=>STATES.map(state=>apply(right,apply(left,state)));
const identity=map=>STATES.every((state,index)=>same(state,map[index]));
function inverseIn(group,map){
  return group.find(candidate=>identity(compose(map,candidate))&&identity(compose(candidate,map)))||null;
}
function closure(generators){
  const byId=new Map([[mapId(mapOf(ID)),mapOf(ID)]]);
  let changed=true;
  while(changed){
    changed=false;
    const current=[...byId.values()];
    for(const left of current) for(const right of [...generators,...current]){
      for(const value of [compose(left,right),compose(right,left)]){
        if(!byId.has(mapId(value))){ byId.set(mapId(value),value); changed=true; }
      }
    }
  }
  return [...byId.values()];
}
function power(map,n,group){
  let result=mapOf(ID);
  const base=n<0?inverseIn(group,map):map;
  assert.ok(base);
  for(let i=0;i<Math.abs(n);i+=1) result=compose(result,base);
  return result;
}

// Independent reconstruction of the earned parent loop before child import.
const parent=holonomyLoomMossLanternDiscreteTransportCertificate();
assert.equal(parent.passed,true);
assert.equal(parent.laws.formal_discrete_holonomy_nontrivial,true);
assert.equal(parent.laws.holonomy_order_two,true);
const parentByStart=new Map(parent.holonomy.rows.map(row=>[row.start,row.end]));
const holonomy=STATES.map(state=>parentByStart.get(pairId(state)).split('').map(Number));
const idMap=mapOf(ID);
assert.notEqual(mapId(holonomy),mapId(idMap));
const group=closure([mapOf(A),mapOf(B)]);
assert.equal(group.length,8);
assert.ok(inverseIn(group,holonomy));
assert.equal(identity(power(holonomy,2,group)),true);
assert.equal(identity(power(holonomy,1,group)),false);

let windingFiberEvaluations=0;
const images=new Set();
for(const n of WINDOW){
  const action=power(holonomy,n,group);
  images.add(mapId(action));
  for(const start of STATES){ windingFiberEvaluations+=1; apply(action,start); }
}
assert.equal(WINDOW.length,17);
assert.equal(WINDOW.filter(n=>n%2===0).length,9);
assert.equal(WINDOW.filter(n=>n%2!==0).length,8);
assert.equal(windingFiberEvaluations,68);
assert.equal(images.size,2);

let pairs=0,sameParityPairs=0,oppositeParityPairs=0,parityActionMismatches=0;
let sameParityFutureComparisons=0,sameParityFutureMismatches=0;
let oppositeParityImmediateComparisons=0,oppositeParityImmediateFailures=0;
for(let i=0;i<WINDOW.length;i+=1){
  for(let j=i+1;j<WINDOW.length;j+=1){
    pairs+=1;
    const n=WINDOW[i],m=WINDOW[j];
    const left=power(holonomy,n,group),right=power(holonomy,m,group);
    const sameParity=(n-m)%2===0;
    const sameAction=mapId(left)===mapId(right);
    if(sameParity!==sameAction) parityActionMismatches+=1;
    if(sameParity){
      sameParityPairs+=1;
      for(const start of STATES){
        const l0=apply(left,start),r0=apply(right,start);
        for(const future of group){
          sameParityFutureComparisons+=1;
          if(MARKER(apply(future,l0))!==MARKER(apply(future,r0))) sameParityFutureMismatches+=1;
        }
      }
    }else{
      oppositeParityPairs+=1;
      for(const start of STATES){
        oppositeParityImmediateComparisons+=1;
        if(MARKER(apply(left,start))===MARKER(apply(right,start))) oppositeParityImmediateFailures+=1;
      }
    }
  }
}
assert.equal(pairs,136);
assert.equal(sameParityPairs,64);
assert.equal(oppositeParityPairs,72);
assert.equal(parityActionMismatches,0);
assert.equal(sameParityFutureComparisons,2048);
assert.equal(sameParityFutureMismatches,0);
assert.equal(oppositeParityImmediateComparisons,288);
assert.equal(oppositeParityImmediateFailures,0);

const sameClass=[[0,2],[0,-2],[1,3],[1,-1]];
const differentClass=[[0,1],[1,2]];
for(const [n,m] of sameClass) assert.equal(mapId(power(holonomy,n,group)),mapId(power(holonomy,m,group)));
for(const [n,m] of differentClass) assert.notEqual(mapId(power(holonomy,n,group)),mapId(power(holonomy,m,group)));
assert.equal(mapId(power(holonomy,1,group)),mapId(power(holonomy,3,group)));
assert.equal(mapId(power(holonomy,1,group)),mapId(power(holonomy,-1,group)));

// Only after the independent reconstruction may the child be imported.
const { atlasHolonomyHistoryParityQuotientCertificate }=await import('../app/dome-world/previews/a15-r0/atlas-holonomy-history-parity-quotient.js');
const child=atlasHolonomyHistoryParityQuotientCertificate();
assert.equal(child.passed,true);
assert.equal(child.representations.visible.history_classes,1);
assert.equal(child.representations.apparatus.history_classes,2);
assert.equal(child.representations.apparatus.kernel,'2Z');
assert.equal(child.representations.apparatus.quotient,'Z/2Z');
assert.equal(child.continuation.same_parity_future_transport_marker_comparisons,sameParityFutureComparisons);
assert.equal(child.continuation.opposite_parity_immediate_marker_comparisons,oppositeParityImmediateComparisons);
assert.equal(child.witnesses.winding_magnitude_lost,true);
assert.equal(child.witnesses.winding_sign_lost,true);
assert.equal(child.witnesses.exact_winding_decoder_available,false);

console.log('Ash A15-R0 Atlas holonomy-history parity quotient hostile tests passed.');
