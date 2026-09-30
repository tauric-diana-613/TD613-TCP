import assert from 'node:assert/strict';

const STATES=[[0,0],[0,1],[1,0],[1,1]];
const INDEX=new Map(STATES.map((s,i)=>[s.join(''),i]));
const ID=s=>[...s];
const A=([x,y])=>[x^1,y];
const B=([x,y])=>[x,y^x];
const mapOf=fn=>STATES.map(s=>fn(s));
const mapId=m=>m.map(s=>s.join('')).join('|');
const apply=(m,s)=>m[INDEX.get(s.join(''))];
const compose=(l,r)=>STATES.map(s=>apply(r,apply(l,s)));
const I=mapOf(ID),AM=mapOf(A),BM=mapOf(B),AB=compose(AM,BM);
const isIdentity=m=>mapId(m)===mapId(I);
function closure(gens){
  const by=new Map([[mapId(I),I]]); let changed=true;
  while(changed){ changed=false; const cur=[...by.values()];
    for(const l of cur) for(const r of [...gens,...cur]) for(const c of [compose(l,r),compose(r,l)]) if(!by.has(mapId(c))){ by.set(mapId(c),c); changed=true; }
  }
  return [...by.values()].sort((a,b)=>mapId(a).localeCompare(mapId(b)));
}
const G=closure([AM,BM]);
assert.equal(G.length,8);
function inv(m){ return G.find(c=>isIdentity(compose(m,c))&&isIdentity(compose(c,m))); }
function comm(l,r){ return compose(compose(compose(l,r),inv(l)),inv(r)); }
function subgroup(seed){
  const by=new Map([[mapId(I),I],...seed.map(m=>[mapId(m),m])]); let changed=true;
  while(changed){ changed=false; const cur=[...by.values()]; for(const l of cur) for(const r of cur){ const c=compose(l,r); if(!by.has(mapId(c))){ by.set(mapId(c),c); changed=true; } } }
  return [...by.values()].sort((a,b)=>mapId(a).localeCompare(mapId(b)));
}
const comms=[]; for(const g of G) for(const h of G) comms.push(comm(g,h));
assert.equal(comms.length,64);
const derived=subgroup([...new Map(comms.map(m=>[mapId(m),m])).values()]);
assert.equal(derived.length,2);
const center=G.filter(g=>G.every(h=>mapId(compose(g,h))===mapId(compose(h,g))));
assert.equal(center.length,2);
assert.deepEqual(center.map(mapId).sort(),derived.map(mapId).sort());
const z=center.find(m=>!isIdentity(m)); assert.ok(z);
const members=m=>center.map(c=>compose(m,c)).sort((a,b)=>mapId(a).localeCompare(mapId(b)));
const cid=m=>members(m).map(mapId).join('::');
const byCoset=new Map(); for(const g of G) if(!byCoset.has(cid(g))) byCoset.set(cid(g),members(g));
assert.equal(byCoset.size,4);
const ids=[cid(I),cid(AM),cid(BM),cid(AB)]; assert.equal(new Set(ids).size,4);
const cosets=ids.map(id=>byCoset.get(id)); assert.deepEqual(cosets.map(c=>c.length),[2,2,2,2]);
const index=new Map(ids.map((id,i)=>[id,i]));
const add=Array.from({length:4},()=>Array(4));
for(let i=0;i<4;i++) for(let j=0;j<4;j++) add[i][j]=index.get(cid(compose(cosets[i][0],cosets[j][0])));
assert.deepEqual(add,[[0,1,2,3],[1,0,3,2],[2,3,0,1],[3,2,1,0]]);
const bit=m=>isIdentity(m)?0:(mapId(m)===mapId(z)?1:null);
const table=Array.from({length:4},()=>Array(4)); let repChecks=0;
for(let i=0;i<4;i++) for(let j=0;j<4;j++){
  const vals=[]; for(const g of cosets[i]) for(const h of cosets[j]){ repChecks++; vals.push(bit(comm(g,h))); }
  assert.equal(new Set(vals).size,1); assert.notEqual(vals[0],null); table[i][j]=vals[0];
}
assert.equal(repChecks,64);
assert.deepEqual(table,[[0,0,0,0],[0,0,1,1],[0,1,0,1],[0,1,1,0]]);
assert.equal(table.flat().filter(x=>x===0).length,10);
assert.equal(table.flat().filter(x=>x===1).length,6);
for(let v=0;v<4;v++) assert.equal(table[v][v],0);
let first=0,second=0;
for(let u=0;u<4;u++) for(let v=0;v<4;v++) for(let w=0;w<4;w++){
  first++; assert.equal(table[add[u][v]][w],table[u][w]^table[v][w]);
  second++; assert.equal(table[u][add[v][w]],table[u][v]^table[u][w]);
}
assert.equal(first,64); assert.equal(second,64);
for(let i=0;i<4;i++) for(let j=0;j<4;j++) assert.equal(table[i][j],table[j][i]);
const radical=[0,1,2,3].filter(i=>table[i].every(x=>x===0));
assert.deepEqual(radical,[0]);
assert.deepEqual(table.map(row=>row.filter(x=>x===1).length),[0,2,2,2]);
const J=[[table[1][1],table[1][2]],[table[2][1],table[2][2]]];
assert.deepEqual(J,[[0,1],[1,0]]);
assert.equal((J[0][0]*J[1][1]^J[0][1]*J[1][0])&1,1);

const {atlasCommutatorPairingGeometryCertificate}=await import('../app/dome-world/previews/a15-r0/atlas-commutator-pairing-geometry.js');
const c=atlasCommutatorPairingGeometryCertificate();
assert.deepEqual(c.pairing.table,table);
assert.deepEqual(c.quotient.addition_table,add);
assert.deepEqual(c.audits.radical,[0]);
assert.equal(c.basis_matrix.det_F2,1);
assert.equal(c.laws.full_central_extension_reconstruction_claimed,false);
assert.equal(c.membranes.includes('PAIRING_GEOMETRY != FULL_CENTRAL_EXTENSION_CLASS'),true);
assert.equal(c.membranes.includes('D8_AND_Q8_CAN_SHARE_THE_SAME_COMMUTATOR_PAIRING'),true);
assert.equal(c.passed,true);

console.log('Ash A15-R0 Atlas commutator pairing geometry hostile reconstruction passed.');
