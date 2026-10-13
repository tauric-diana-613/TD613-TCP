import assert from 'node:assert/strict';
import {
  ATLAS_HOLONOMY_HISTORY_PARITY_QUOTIENT_SCHEMA,
  atlasHolonomyHistoryParityQuotientCertificate,
} from '../app/dome-world/previews/a15-r0/atlas-holonomy-history-parity-quotient.js';

const parent=atlasHolonomyHistoryParityQuotientCertificate();
assert.equal(parent.passed,true);
assert.equal(ATLAS_HOLONOMY_HISTORY_PARITY_QUOTIENT_SCHEMA,'td613.dome-world.atlas-holonomy-history-parity-quotient/v0.1');
assert.equal(parent.representations.apparatus.history_classes,2);

const STATES=[[0,0],[0,1],[1,0],[1,1]];
const INDEX=new Map(STATES.map((row,index)=>[row.join(''),index]));
const LETTERS=['a','A','b','B'];
const INV={a:'A',A:'a',b:'B',B:'b'};
const ENDPOINT='returned-practice-capsule';
const same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
const id=s=>[...s];
const af=([x,y])=>[x^1,y];
const bf=([x,y])=>[x,y^x];
const mapOf=fn=>STATES.map(s=>fn(s));
const mapId=map=>map.map(row=>row.join('')).join('|');
const apply=(map,state)=>map[INDEX.get(state.join(''))];
const compose=(left,right)=>STATES.map((state,index)=>[...apply(right,left[index])]);
const isIdentity=map=>STATES.every((state,index)=>same(state,map[index]));
const isBijective=map=>new Set(map.map(row=>row.join(''))).size===4;
const inverseIn=(group,map)=>group.find(candidate=>isIdentity(compose(map,candidate))&&isIdentity(compose(candidate,map)))||null;

function closure(generators){
  const identity=mapOf(id);
  const byId=new Map([[mapId(identity),identity]]);
  let changed=true;
  while(changed){
    changed=false;
    const current=[...byId.values()];
    for(const left of current) for(const right of [...generators,...current]) for(const candidate of [compose(left,right),compose(right,left)]){
      const key=mapId(candidate);
      if(!byId.has(key)){ byId.set(key,candidate); changed=true; }
    }
  }
  return [...byId.values()];
}
function orderOf(map,group){
  let value=mapOf(id);
  for(let k=1;k<=16;k+=1){ value=compose(value,map); if(isIdentity(value)) return k; }
  return null;
}
function commutator(left,right,group){
  const li=inverseIn(group,left),ri=inverseIn(group,right);
  assert.ok(li&&ri);
  return compose(compose(compose(left,right),li),ri);
}
function subgroupClosure(seed,group){
  const byId=new Map([[mapId(mapOf(id)),mapOf(id)],...seed.map(map=>[mapId(map),map])]);
  let changed=true;
  while(changed){
    changed=false;
    const current=[...byId.values()];
    for(const left of current) for(const right of current){
      const candidate=compose(left,right),key=mapId(candidate);
      if(!byId.has(key)){ byId.set(key,candidate); changed=true; }
    }
  }
  assert.equal([...byId.keys()].every(key=>group.some(map=>mapId(map)===key)),true);
  return [...byId.values()];
}
const cosetId=(map,subgroup)=>subgroup.map(h=>mapId(compose(map,h))).sort().join('::');

const I=mapOf(id),A=mapOf(af),B=mapOf(bf);
const G=closure([A,B]);
assert.equal(G.length,8);
assert.equal(G.filter(isBijective).length,8);
assert.equal(G.filter(map=>inverseIn(G,map)===null).length,0);
assert.equal(orderOf(A,G),2);
assert.equal(orderOf(B,G),2);
assert.equal(orderOf(compose(A,B),G),4);
let noncommuting=0;
for(const left of G) for(const right of G) if(mapId(compose(left,right))!==mapId(compose(right,left))) noncommuting+=1;
assert.equal(noncommuting,24);

const commutatorMaps=new Map();
let commutatorChecks=0;
for(const left of G) for(const right of G){ commutatorChecks+=1; const c=commutator(left,right,G); commutatorMaps.set(mapId(c),c); }
assert.equal(commutatorChecks,64);
const derived=subgroupClosure([...commutatorMaps.values()],G);
assert.equal(derived.length,2);

const cosets=new Map();
for(const map of G){ const key=cosetId(map,derived); if(!cosets.has(key)) cosets.set(key,[]); cosets.get(key).push(map); }
assert.equal(cosets.size,4);
const cosetKeys=[...cosets.keys()];
const cIndex=new Map(cosetKeys.map((key,index)=>[key,index]));
const table=Array.from({length:4},()=>Array(4).fill(null));
let quotientChecks=0;
for(let i=0;i<4;i++) for(let j=0;j<4;j++){
  const targets=new Set();
  for(const left of cosets.get(cosetKeys[i])) for(const right of cosets.get(cosetKeys[j])){ quotientChecks+=1; targets.add(cosetId(compose(left,right),derived)); }
  assert.equal(targets.size,1);
  table[i][j]=cIndex.get([...targets][0]);
}
assert.equal(quotientChecks,64);
for(let i=0;i<4;i++) for(let j=0;j<4;j++) assert.equal(table[i][j],table[j][i]);
const identityClass=cIndex.get(cosetId(I,derived));
assert.equal([0,1,2,3].filter(i=>i!==identityClass&&table[i][i]===identityClass).length,3);

const aInv=inverseIn(G,A),bInv=inverseIn(G,B);
const letterMap={a:A,A:aInv,b:B,B:bInv};
function reducedWords(max){
  const by=[['']];
  for(let length=1;length<=max;length++){
    const rows=[];
    const walk=prefix=>{
      if(prefix.length===length){ rows.push(prefix); return; }
      for(const ch of LETTERS){ const previous=prefix.at(-1); if(previous&&INV[previous]===ch) continue; walk(prefix+ch); }
    };
    walk(''); by.push(rows);
  }
  return {by,all:by.flat()};
}
function evalWord(word){ let result=I; for(const ch of word) result=compose(result,letterMap[ch]); return result; }
const words=reducedWords(4);
assert.deepEqual(words.by.map(rows=>rows.length),[1,4,12,36,108]);
assert.equal(words.all.length,161);
const holCounts=new Map(),abCounts=new Map();
const rows=words.all.map(word=>{
  const hol=evalWord(word),hid=mapId(hol),aid=cosetId(hol,derived);
  holCounts.set(hid,(holCounts.get(hid)||0)+1); abCounts.set(aid,(abCounts.get(aid)||0)+1);
  return {word,hid,aid};
});
assert.equal(holCounts.size,8);
assert.equal(abCounts.size,4);
assert.deepEqual([...holCounts.values()].sort((a,b)=>b-a),[33,32,28,28,12,12,8,8]);
assert.deepEqual([...abCounts.values()].sort((a,b)=>b-a),[65,56,20,20]);

let pairs=0,sameHol=0,sameAb=0,abOnly=0,diffAb=0,futureChecks=0,futureMismatch=0;
for(let i=0;i<rows.length;i++) for(let j=i+1;j<rows.length;j++){
  pairs+=1;
  const h=rows[i].hid===rows[j].hid,a=rows[i].aid===rows[j].aid;
  if(h){
    sameHol+=1;
    const lm=evalWord(rows[i].word),rm=evalWord(rows[j].word);
    for(const future of G){ futureChecks+=1; if(mapId(compose(lm,future))!==mapId(compose(rm,future))) futureMismatch+=1; }
  }
  if(a) sameAb+=1; else diffAb+=1;
  if(a&&!h) abOnly+=1;
}
assert.equal(pairs,12880);
assert.equal(sameHol,1968);
assert.equal(sameAb,4000);
assert.equal(abOnly,2032);
assert.equal(diffAb,8880);
assert.equal(futureChecks,15744);
assert.equal(futureMismatch,0);

assert.notEqual('aa','');
assert.equal(mapId(evalWord('aa')),mapId(evalWord('')));
assert.notEqual(mapId(evalWord('abAB')),mapId(evalWord('')));
assert.equal(cosetId(evalWord('abAB'),derived),cosetId(evalWord(''),derived));
assert.notEqual(cosetId(evalWord('a'),derived),cosetId(evalWord(''),derived));
assert.equal(ENDPOINT,'returned-practice-capsule');

const child=await import('../app/dome-world/previews/a15-r0/atlas-nonabelian-two-loop-history-descent.js');
const certificate=child.atlasNonabelianTwoLoopHistoryDescentCertificate();
assert.equal(certificate.passed,true);
assert.equal(certificate.transport_group.size,G.length);
assert.equal(certificate.transport_group.noncommuting_ordered_pairs,noncommuting);
assert.equal(certificate.abelianization.derived_subgroup_size,derived.length);
assert.equal(certificate.abelianization.coset_count,cosets.size);
assert.equal(certificate.hostile_window.words,words.all.length);
assert.equal(certificate.pair_census.same_holonomy_future_group_continuation_checks,futureChecks);
assert.equal(certificate.laws.strict_receiver_chain,true);

console.log('Ash A15-R0 Atlas nonabelian two-loop history hostile tests passed.');
