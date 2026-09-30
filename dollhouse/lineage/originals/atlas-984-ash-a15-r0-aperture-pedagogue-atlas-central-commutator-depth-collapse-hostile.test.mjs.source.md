import assert from 'node:assert/strict';

const STATES=Object.freeze([[0,0],[0,1],[1,0],[1,1]].map(row=>Object.freeze(row)));
const INDEX=new Map(STATES.map((row,index)=>[row.join(''),index]));
const INV_SYMBOL=Object.freeze({a:'A',A:'a',b:'B',B:'b'});
const pairId=pair=>pair.join('');
const samePair=(a,b)=>a[0]===b[0]&&a[1]===b[1];
const ID=state=>Object.freeze([...state]);
const A=([x,y])=>Object.freeze([x^1,y]);
const B=([x,y])=>Object.freeze([x,y^x]);
const H=([x,y])=>Object.freeze([x,y^1]);
function mapOf(fn){ return Object.freeze(STATES.map(state=>Object.freeze([...fn(state)]))); }
function mapId(map){ return map.map(pairId).join('|'); }
function apply(map,state){ return map[INDEX.get(pairId(state))]; }
function compose(left,right){ return Object.freeze(STATES.map(state=>Object.freeze([...apply(right,apply(left,state))]))); }
function identity(map){ return STATES.every((state,index)=>samePair(state,map[index])); }
function closure(generators){
  const id=mapOf(ID),seen=new Map([[mapId(id),id]]);
  let changed=true;
  while(changed){
    changed=false;
    const current=[...seen.values()];
    for(const left of current) for(const right of [...generators,...current]) for(const value of [compose(left,right),compose(right,left)]){
      const key=mapId(value);
      if(!seen.has(key)){ seen.set(key,value); changed=true; }
    }
  }
  return [...seen.values()].sort((a,b)=>mapId(a).localeCompare(mapId(b)));
}
function inverse(group,map){
  for(const candidate of group) if(identity(compose(map,candidate))&&identity(compose(candidate,map))) return candidate;
  return null;
}
function comm(left,right,group){
  const li=inverse(group,left),ri=inverse(group,right);
  assert.ok(li&&ri);
  return compose(compose(compose(left,right),li),ri);
}
function subgroup(seed,group){
  const id=mapOf(ID),seen=new Map([[mapId(id),id],...seed.map(map=>[mapId(map),map])]);
  let changed=true;
  while(changed){
    changed=false;
    const current=[...seen.values()];
    for(const left of current) for(const right of current){
      const value=compose(left,right),key=mapId(value);
      if(!seen.has(key)){ seen.set(key,value); changed=true; }
    }
  }
  const groupIds=new Set(group.map(mapId));
  assert.equal([...seen.keys()].every(id=>groupIds.has(id)),true);
  return [...seen.values()].sort((a,b)=>mapId(a).localeCompare(mapId(b)));
}
function sameSet(a,b){ return JSON.stringify(a.map(mapId).sort())===JSON.stringify(b.map(mapId).sort()); }
function reduce(word){
  const stack=[];
  for(const symbol of word){
    if(stack.length&&INV_SYMBOL[stack.at(-1)]===symbol) stack.pop(); else stack.push(symbol);
  }
  return stack.join('');
}
function invWord(word){ return [...word].reverse().map(symbol=>INV_SYMBOL[symbol]).join(''); }
function commWord(left,right){ return reduce(left+right+invWord(left)+invWord(right)); }
function evalWord(word,maps){ let result=mapOf(ID); for(const symbol of word) result=compose(result,maps[symbol]); return result; }

// Independent reconstruction before child import.
const id=mapOf(ID),a=mapOf(A),b=mapOf(B),hExpected=mapOf(H);
const group=closure([a,b]);
assert.equal(group.length,8);
const ai=inverse(group,a),bi=inverse(group,b);
assert.ok(ai&&bi);
const maps={a,A:ai,b,B:bi};

let multiplicationChecks=0;
const groupIds=new Set(group.map(mapId));
for(const left of group) for(const right of group){ multiplicationChecks+=1; assert.equal(groupIds.has(mapId(compose(left,right))),true); }
assert.equal(multiplicationChecks,64);

const commCounts=new Map(),commValues=new Map();
let firstChecks=0;
for(const left of group) for(const right of group){
  firstChecks+=1;
  const value=comm(left,right,group),key=mapId(value);
  commCounts.set(key,(commCounts.get(key)||0)+1);
  commValues.set(key,value);
}
assert.equal(firstChecks,64);
assert.equal(commValues.size,2);
assert.equal(commCounts.get(mapId(id)),40);
assert.equal(64-commCounts.get(mapId(id)),24);
const nonidentity=[...commValues.values()].filter(value=>!identity(value));
assert.equal(nonidentity.length,1);
assert.equal(mapId(nonidentity[0]),mapId(hExpected));
const derived=subgroup([...commValues.values()],group);
assert.equal(derived.length,2);

let centerRelations=0;
const center=[];
for(const candidate of group){
  let central=true;
  for(const other of group){
    centerRelations+=1;
    if(mapId(compose(candidate,other))!==mapId(compose(other,candidate))) central=false;
  }
  if(central) center.push(candidate);
}
assert.equal(centerRelations,64);
assert.equal(center.length,2);
assert.equal(sameSet(center,derived),true);

let derivedCentrality=0;
for(const d of derived) for(const g of group){
  derivedCentrality+=1;
  assert.equal(mapId(compose(d,g)),mapId(compose(g,d)));
}
assert.equal(derivedCentrality,16);

const gamma3Seed=[];
let gamma3Checks=0;
for(const d of derived) for(const g of group){ gamma3Checks+=1; gamma3Seed.push(comm(d,g,group)); }
assert.equal(gamma3Checks,16);
assert.equal(gamma3Seed.every(identity),true);
const gamma3=subgroup(gamma3Seed,group);
assert.equal(gamma3.length,1);

const derived2Seed=[];
let derived2Checks=0;
for(const left of derived) for(const right of derived){ derived2Checks+=1; derived2Seed.push(comm(left,right,group)); }
assert.equal(derived2Checks,4);
assert.equal(derived2Seed.every(identity),true);
assert.equal(subgroup(derived2Seed,group).length,1);

let leftTriples=0,rightTriples=0;
for(const g of group) for(const h of group) for(const k of group){
  leftTriples+=1; assert.equal(identity(comm(comm(g,h,group),k,group)),true);
  rightTriples+=1; assert.equal(identity(comm(g,comm(h,k,group),group)),true);
}
assert.equal(leftTriples,512);
assert.equal(rightTriples,512);

const first=commWord('a','b');
const tripleA=commWord(first,'a');
const tripleB=commWord(first,'b');
assert.equal(first,'abAB');
assert.equal(tripleA,'abABabaBAA');
assert.equal(tripleB,'abAbaBAB');
assert.notEqual(first,'');
assert.notEqual(tripleA,'');
assert.notEqual(tripleB,'');
assert.equal(identity(evalWord(first,maps)),false);
assert.equal(identity(evalWord(tripleA,maps)),true);
assert.equal(identity(evalWord(tripleB,maps)),true);
assert.equal(reduce('aa'),'aa');
assert.equal(identity(evalWord('aa',maps)),true); // independent kernel relation forbids gamma3=kernel promotion

const child=await import('../app/dome-world/previews/a15-r0/atlas-central-commutator-depth-collapse.js');
const certificate=child.atlasCentralCommutatorDepthCollapseCertificate();
assert.equal(certificate.passed,true);
assert.equal(certificate.group.size,group.length);
assert.equal(certificate.first_commutators.identity,40);
assert.equal(certificate.first_commutators.nonidentity,24);
assert.deepEqual(certificate.lower_central.sizes,[8,2,1]);
assert.deepEqual(certificate.derived_series.sizes,[8,2,1]);
assert.equal(certificate.center.equals_derived_subgroup,true);
assert.equal(certificate.laws.exact_nilpotency_class_two,true);
assert.equal(certificate.laws.gamma3_kernel_equality_claimed,false);

console.log('Ash A15-R0 Atlas central commutator depth collapse hostile contract passed.');
