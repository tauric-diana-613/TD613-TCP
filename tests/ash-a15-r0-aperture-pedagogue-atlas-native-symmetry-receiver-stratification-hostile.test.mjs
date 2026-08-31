import assert from 'node:assert/strict';
import { atlasAutomorphismLiftExactnessCertificate } from '../app/dome-world/previews/a15-r0/atlas-automorphism-lift-exactness.js';

// Independent hostile reconstruction from the earned #920 parent. Do not import the child until every new finite target is rebuilt.
const parent=atlasAutomorphismLiftExactnessCertificate();
assert.equal(parent.passed,true);
assert.equal(parent.D.automorphisms,8);
assert.equal(parent.Q.automorphisms,24);
assert.deepEqual(parent.D.lift_fiber_sizes,[4,4]);
assert.deepEqual(parent.Q.lift_fiber_sizes,[4,4,4,4,4,4]);

const V=[[0,0],[1,0],[0,1],[1,1]],VI=new Map(V.map((v,i)=>[v.join(''),i]));
const beta=parent.geometry.D_beta;
assert.deepEqual(beta,parent.geometry.Q_beta);
const qid=q=>q.join('');
const add=(u,v)=>[u[0]^v[0],u[1]^v[1]];
const addi=(i,j)=>VI.get(add(V[i],V[j]).join(''));

let polarizationChecks=0;
const refinements=[];
for(let n=0;n<16;n++){
  const q=[3,2,1,0].map(s=>(n>>s)&1); let ok=true;
  for(let u=0;u<4;u++) for(let v=0;v<4;v++){
    polarizationChecks++;
    if((q[addi(u,v)]^q[u]^q[v])!==beta[u][v]) ok=false;
  }
  if(ok) refinements.push(q);
}
assert.equal(polarizationChecks,256);
assert.deepEqual(refinements,[[0,0,0,1],[0,0,1,0],[0,1,0,0],[0,1,1,1]]);

const mats=[];
for(let n=0;n<16;n++) mats.push([[n&1,(n>>1)&1],[(n>>2)&1,(n>>3)&1]]);
const det=m=>((m[0][0]&m[1][1])^(m[0][1]&m[1][0]))&1;
const gl=mats.filter(m=>det(m)===1);
assert.equal(mats.length,16);assert.equal(gl.length,6);
const tx=(m,i)=>{const[x,y]=V[i],o=[(m[0][0]&x)^(m[0][1]&y),(m[1][0]&x)^(m[1][1]&y)];return VI.get(o.join(''));};
const inv=m=>gl.find(n=>V.every((_,i)=>tx(n,tx(m,i))===i));
const pb=(q,m)=>{const mi=inv(m);return V.map((_,i)=>q[tx(mi,i)]);};
const pBeta=m=>{for(let u=0;u<4;u++)for(let v=0;v<4;v++)if(beta[tx(m,u)][tx(m,v)]!==beta[u][v])return false;return true;};
const pQ=(m,q)=>q.every((x,i)=>q[tx(m,i)]===x);
const pairing=gl.filter(pBeta);assert.equal(pairing.length,6);
const dNative=pairing.filter(m=>pQ(m,parent.D.q)),qNative=pairing.filter(m=>pQ(m,parent.Q.q));
assert.equal(dNative.length,2);assert.equal(qNative.length,6);
assert.equal(dNative.length,parent.D.quotient_action_image);assert.equal(qNative.length,parent.Q.quotient_action_image);

function audit(group){
  const index=new Map(refinements.map((q,i)=>[qid(q),i]));
  const count=Array.from({length:4},()=>Array(4).fill(0)),images=Array.from({length:4},()=>new Set()),signatures=[];
  for(const m of group){
    const sig=[];
    for(let i=0;i<4;i++){
      const j=index.get(qid(pb(refinements[i],m)));assert.notEqual(j,undefined);count[i][j]++;images[i].add(j);sig.push(j);
    }
    signatures.push(sig);
  }
  const seen=new Set(),orbits=[];
  for(let s=0;s<4;s++){
    if(seen.has(s))continue;const orb=new Set([s]),queue=[s];
    while(queue.length){const c=queue.shift();for(const n of images[c])if(!orb.has(n)){orb.add(n);queue.push(n);}}
    for(const i of orb)seen.add(i);orbits.push([...orb].sort((a,b)=>a-b));
  }
  orbits.sort((a,b)=>b.length-a.length||a[0]-b[0]);
  let pairChecks=0,collisions=0;
  for(let i=0;i<signatures.length;i++)for(let j=i+1;j<signatures.length;j++){pairChecks++;if(JSON.stringify(signatures[i])===JSON.stringify(signatures[j]))collisions++;}
  return{count,orbits,sizes:orbits.map(o=>o.length),stabs:count.map((r,i)=>r[i]),signatures,pairChecks,collisions};
}
const da=audit(dNative),qa=audit(qNative);
assert.deepEqual(da.count,[[2,0,0,0],[0,1,1,0],[0,1,1,0],[0,0,0,2]]);
assert.deepEqual(da.orbits,[[1,2],[0],[3]]);assert.deepEqual(da.sizes,[2,1,1]);assert.deepEqual(da.stabs,[2,1,1,2]);assert.equal(da.pairChecks,1);assert.equal(da.collisions,0);
assert.deepEqual(qa.count,[[2,2,2,0],[2,2,2,0],[2,2,2,0],[0,0,0,6]]);
assert.deepEqual(qa.orbits,[[0,1,2],[3]]);assert.deepEqual(qa.sizes,[3,1]);assert.deepEqual(qa.stabs,[2,2,2,6]);assert.equal(qa.pairChecks,15);assert.equal(qa.collisions,0);
assert.equal(new Set(da.signatures.map(JSON.stringify)).size,2);assert.equal(new Set(qa.signatures.map(JSON.stringify)).size,6);

const bases=[];for(let u=1;u<4;u++)for(let v=1;v<4;v++)if(beta[u][v]===1)bases.push([u,v]);
let arfChecks=0;const arf=[];
for(const q of refinements){const bits=bases.map(([u,v])=>{arfChecks++;return q[u]&q[v];});assert.equal(new Set(bits).size,1);arf.push(bits[0]);}
assert.equal(bases.length,6);assert.equal(arfChecks,24);assert.deepEqual(arf,[0,0,0,1]);
const arfPartition=['[0,1,2]','[3]'].sort();
const dPartition=da.orbits.map(o=>JSON.stringify(o)).sort(),qPartition=qa.orbits.map(o=>JSON.stringify(o)).sort();
assert.notDeepEqual(dPartition,arfPartition);assert.deepEqual(qPartition,arfPartition);
assert.equal(da.orbits.filter(o=>o.some(i=>arf[i]===0)).length,2);
assert.equal(qa.orbits.filter(o=>o.some(i=>arf[i]===0)).length,1);
assert.equal(dNative.filter(m=>qid(pb(refinements[0],m))===qid(refinements[0])).length,2);
assert.equal(qNative.filter(m=>qid(pb(refinements[3],m))===qid(refinements[3])).length,6);
assert.deepEqual([parent.D.automorphisms,dNative.length,1],[8,2,1]);
assert.deepEqual([parent.Q.automorphisms,qNative.length,1],[24,6,1]);

const child=await import('../app/dome-world/previews/a15-r0/atlas-native-symmetry-receiver-stratification.js');
const c=child.atlasNativeSymmetryReceiverStratificationCertificate();
assert.equal(c.passed,true);
assert.deepEqual(c.D.action_count_matrix,da.count);assert.deepEqual(c.Q.action_count_matrix,qa.count);
assert.deepEqual(c.D.orbit_sizes,[2,1,1]);assert.deepEqual(c.Q.orbit_sizes,[3,1]);
assert.equal(c.laws.invariant_completeness_is_admitted_symmetry_relative,true);

console.log('Ash A15-R0 Atlas native symmetry receiver stratification independent hostile passed.');