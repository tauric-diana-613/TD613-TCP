import assert from 'node:assert/strict';

// Independent hostile reconstruction. Do not import the child certificate until the finite result is rebuilt.
const V=[[0,0],[1,0],[0,1],[1,1]];
const idx=new Map(V.map((v,i)=>[v.join(''),i]));
const beta=[[0,0,0,0],[0,0,1,1],[0,1,0,1],[0,1,1,0]];
const addIndex=(i,j)=>idx.get([V[i][0]^V[j][0],V[i][1]^V[j][1]].join(''));
const functions=[];
for(let n=0;n<16;n+=1) functions.push([3,2,1,0].map(s=>(n>>s)&1));
const id=q=>q.join('');

let polarizationChecks=0;
const refinements=[];
for(const q of functions){
  let good=true;
  for(let u=0;u<4;u+=1) for(let v=0;v<4;v+=1){
    polarizationChecks+=1;
    if((q[addIndex(u,v)]^q[u]^q[v])!==beta[u][v]) good=false;
  }
  if(good) refinements.push(q);
}
refinements.sort((a,b)=>id(a).localeCompare(id(b)));
assert.equal(polarizationChecks,256);
assert.deepEqual(refinements.map(id),['0001','0010','0100','0111']);

let linearityChecks=0;
const linears=[];
for(const f of functions){
  let good=f[0]===0;
  for(let u=0;u<4;u+=1) for(let v=0;v<4;v+=1){
    linearityChecks+=1;
    if(f[addIndex(u,v)]!==(f[u]^f[v])) good=false;
  }
  if(good) linears.push(f);
}
linears.sort((a,b)=>id(a).localeCompare(id(b)));
assert.equal(linearityChecks,256);
assert.deepEqual(linears.map(id),['0000','0011','0101','0110']);
const linearIds=new Set(linears.map(id));
let translationChecks=0;
for(const q of refinements) for(const r of refinements){
  translationChecks+=1;
  const diff=q.map((bit,k)=>bit^r[k]);
  assert.equal(linearIds.has(id(diff)),true);
}
assert.equal(translationChecks,16);

const matrices=[];
for(let n=0;n<16;n+=1){
  const b=[3,2,1,0].map(s=>(n>>s)&1);
  matrices.push([[b[0],b[1]],[b[2],b[3]]]);
}
const det=m=>((m[0][0]*m[1][1])^(m[0][1]*m[1][0]))&1;
const gl=matrices.filter(m=>det(m)===1);
assert.equal(gl.length,6);
const mv=(m,v)=>[(m[0][0]*v[0]^m[0][1]*v[1])&1,(m[1][0]*v[0]^m[1][1]*v[1])&1];
const mm=(a,b)=>[[0,0],[0,0]].map((row,i)=>row.map((_,j)=>((a[i][0]*b[0][j])^(a[i][1]*b[1][j]))&1));
const sameM=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const eye=[[1,0],[0,1]];
const inv=m=>gl.find(n=>sameM(mm(m,n),eye)&&sameM(mm(n,m),eye));
const ti=(m,i)=>idx.get(mv(m,V[i]).join(''));
let betaChecks=0;
for(const m of gl) for(let u=0;u<4;u+=1) for(let v=0;v<4;v+=1){
  betaChecks+=1;
  assert.equal(beta[ti(m,u)][ti(m,v)],beta[u][v]);
}
assert.equal(betaChecks,96);
const pull=(q,m)=>{ const n=inv(m); return V.map((_,i)=>q[ti(n,i)]); };
const rIndex=new Map(refinements.map((q,i)=>[id(q),i]));
const counts=Array.from({length:4},()=>Array(4).fill(0));
const edges=Array.from({length:4},()=>new Set());
let actionChecks=0;
for(let s=0;s<4;s+=1) for(const m of gl){
  actionChecks+=1;
  const t=rIndex.get(id(pull(refinements[s],m)));
  assert.notEqual(t,undefined);
  counts[s][t]+=1;
  edges[s].add(t);
}
assert.equal(actionChecks,24);
assert.deepEqual(counts,[[2,2,2,0],[2,2,2,0],[2,2,2,0],[0,0,0,6]]);
assert.deepEqual(counts.map((row,i)=>row[i]),[2,2,2,6]);

const seen=new Set(),orbits=[];
for(let s=0;s<4;s++){
  if(seen.has(s)) continue;
  const O=new Set([s]),queue=[s];
  while(queue.length){
    const x=queue.shift();
    for(const y of edges[x]) if(!O.has(y)){ O.add(y); queue.push(y); }
  }
  for(const x of O) seen.add(x);
  orbits.push([...O].sort((a,b)=>a-b));
}
orbits.sort((a,b)=>b.length-a.length||a[0]-b[0]);
assert.deepEqual(orbits,[[0,1,2],[3]]);

const bases=[];
for(let u=1;u<4;u+=1) for(let v=1;v<4;v+=1) if(beta[u][v]===1) bases.push([u,v]);
assert.equal(bases.length,6);
let arfChecks=0;
const arfs=[];
for(const q of refinements){
  const bits=bases.map(([u,v])=>{ arfChecks+=1; return q[u]&q[v]; });
  assert.equal(new Set(bits).size,1);
  arfs.push(bits[0]);
}
assert.equal(arfChecks,24);
assert.deepEqual(arfs,[0,0,0,1]);
assert.deepEqual(orbits.map(O=>[...new Set(O.map(i=>arfs[i]))]),[[0],[1]]);
assert.equal(orbits[0].includes(0),true);   // earned D refinement
assert.equal(orbits[1].includes(3),true);   // Q8 control refinement

const {
  ATLAS_QUADRATIC_REFINEMENT_ORBIT_GEOMETRY_SCHEMA,
  ATLAS_QUADRATIC_REFINEMENT_ORBIT_GEOMETRY_PARENT_RECEIPT,
  atlasQuadraticRefinementOrbitGeometryCertificate,
}=await import('../app/dome-world/previews/a15-r0/atlas-quadratic-refinement-orbit-geometry.js');
const c=atlasQuadraticRefinementOrbitGeometryCertificate();
assert.equal(ATLAS_QUADRATIC_REFINEMENT_ORBIT_GEOMETRY_SCHEMA,'td613.dome-world.atlas-quadratic-refinement-orbit-geometry/v0.1');
assert.equal(ATLAS_QUADRATIC_REFINEMENT_ORBIT_GEOMETRY_PARENT_RECEIPT,'83a3eff9ceb7f29a3f4d850c36f226dacffc80d0');
assert.deepEqual(c.refinement_census.vectors,refinements);
assert.deepEqual(c.affine_torsor.linear_vectors,linears);
assert.deepEqual(c.action.count_matrix,counts);
assert.deepEqual(c.action.orbits,orbits);
assert.deepEqual(c.arf.bits,arfs);
assert.equal(c.inherited_controls.D_Q_same_orbit,false);
assert.equal(c.passed,true);
console.log('Ash A15-R0 Atlas quadratic-refinement orbit geometry hostile reconstruction passed.');