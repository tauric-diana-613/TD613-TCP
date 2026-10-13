import assert from 'node:assert/strict';

// Reconstruct the two finite controls before importing the child certificate.
const STATES=[[0,0],[0,1],[1,0],[1,1]];
const INDEX=new Map(STATES.map((row,index)=>[row.join(''),index]));
const COORDS=[[0,0],[1,0],[0,1],[1,1]];
const COORD_INDEX=new Map(COORDS.map((row,index)=>[row.join(''),index]));
const pid=p=>p.join('');
const ID=s=>[...s];
const A=([x,y])=>[x^1,y];
const B=([x,y])=>[x,y^x];
const mapOf=fn=>STATES.map(state=>fn(state));
const mid=map=>map.map(pid).join('|');
const apply=(map,state)=>map[INDEX.get(pid(state))];
const compose=(left,right)=>STATES.map(state=>[...apply(right,apply(left,state))]);
const identity=map=>STATES.every((state,index)=>pid(state)===pid(map[index]));
function closure(gens){
  const by=new Map([[mid(mapOf(ID)),mapOf(ID)]]); let changed=true;
  while(changed){ changed=false; const cur=[...by.values()];
    for(const l of cur) for(const r of [...gens,...cur]) for(const c of [compose(l,r),compose(r,l)]) if(!by.has(mid(c))){ by.set(mid(c),c); changed=true; }
  }
  return [...by.values()].sort((x,y)=>mid(x).localeCompare(mid(y)));
}
function inv(group,map){ return group.find(c=>identity(compose(map,c))&&identity(compose(c,map))); }
function comm(l,r,g){ const li=inv(g,l),ri=inv(g,r); return compose(compose(compose(l,r),li),ri); }
function subgroup(seed,g){
  const by=new Map([[mid(mapOf(ID)),mapOf(ID)],...seed.map(x=>[mid(x),x])]); let changed=true;
  while(changed){ changed=false; const cur=[...by.values()]; for(const l of cur) for(const r of cur){ const c=compose(l,r); if(!by.has(mid(c))){by.set(mid(c),c);changed=true;} } }
  assert.equal([...by.keys()].every(id=>g.some(x=>mid(x)===id)),true); return [...by.values()];
}
const dGroup=closure([mapOf(A),mapOf(B)]);
assert.equal(dGroup.length,8);
const dComms=[]; for(const l of dGroup) for(const r of dGroup) dComms.push(comm(l,r,dGroup));
const dDerived=subgroup(dComms,dGroup);
const dCenter=dGroup.filter(c=>dGroup.every(o=>mid(compose(c,o))===mid(compose(o,c))));
assert.equal(dCenter.length,2); assert.equal(dDerived.length,2);
assert.deepEqual(new Set(dCenter.map(mid)),new Set(dDerived.map(mid)));
const dNon=dCenter.find(x=>!identity(x));
const dReps=[mapOf(ID),mapOf(A),mapOf(B),compose(mapOf(A),mapOf(B))];
const dCoset=x=>dCenter.map(z=>compose(x,z)).sort((p,q)=>mid(p).localeCompare(mid(q)));
const dCid=x=>dCoset(x).map(mid).join('::');
const dCosets=dReps.map(dCoset); const dIndex=new Map(dCosets.map((c,i)=>[dCid(c[0]),i]));
const dAdd=Array.from({length:4},()=>Array(4));
for(let i=0;i<4;i++) for(let j=0;j<4;j++) dAdd[i][j]=dIndex.get(dCid(compose(dCosets[i][0],dCosets[j][0])));
assert.deepEqual(dAdd,[[0,1,2,3],[1,0,3,2],[2,3,0,1],[3,2,1,0]]);
const dbit=x=>identity(x)?0:(mid(x)===mid(dNon)?1:null);
const qD=dCosets.map(c=>{ const bits=c.map(rep=>dbit(compose(rep,rep))); assert.equal(new Set(bits).size,1); return bits[0]; });
assert.deepEqual(qD,[0,0,0,1]);
let dSq0=0,dSq1=0; for(const g of dGroup){ const bit=dbit(compose(g,g)); if(bit===0)dSq0++; if(bit===1)dSq1++; }
assert.equal(dSq0,6); assert.equal(dSq1,2);
const betaD=Array.from({length:4},()=>Array(4));
for(let i=0;i<4;i++) for(let j=0;j<4;j++){
  const bits=[]; for(const l of dCosets[i]) for(const r of dCosets[j]) bits.push(dbit(comm(l,r,dGroup)));
  assert.equal(new Set(bits).size,1); betaD[i][j]=bits[0];
}

const QE=['1','-1','i','-i','j','-j','k','-k']; const QS=new Set(QE);
const PM={
  '1':{'1':[0,'1'],i:[0,'i'],j:[0,'j'],k:[0,'k']},
  i:{'1':[0,'i'],i:[1,'1'],j:[0,'k'],k:[1,'j']},
  j:{'1':[0,'j'],i:[1,'k'],j:[1,'1'],k:[0,'i']},
  k:{'1':[0,'k'],i:[0,'j'],j:[1,'i'],k:[1,'1']},
};
const parse=x=>x.startsWith('-')?[1,x.slice(1)]:[0,x];
const fmt=(s,u)=>s?`-${u}`:u;
function qm(a,b){ const [sa,ua]=parse(a),[sb,ub]=parse(b),[sc,uc]=PM[ua][ub]; return fmt(sa^sb^sc,uc); }
const qi=x=>QE.find(y=>qm(x,y)==='1'&&qm(y,x)==='1');
const qc=(a,b)=>qm(qm(qm(a,b),qi(a)),qi(b));
let closureChecks=0; for(const a of QE) for(const b of QE){ closureChecks++; assert.equal(QS.has(qm(a,b)),true); }
assert.equal(closureChecks,64); for(const x of QE) assert.ok(qi(x));
const qCenter=QE.filter(x=>QE.every(y=>qm(x,y)===qm(y,x))).sort(); assert.deepEqual(qCenter,['-1','1']);
const qComms=[]; for(const a of QE) for(const b of QE) qComms.push(qc(a,b));
function qsub(seed){ const s=new Set(['1',...seed]); let changed=true; while(changed){changed=false; const c=[...s]; for(const a of c) for(const b of c){const v=qm(a,b);if(!s.has(v)){s.add(v);changed=true;}}} return [...s].sort(); }
const qDerived=qsub(qComms); assert.deepEqual(qDerived,['-1','1']);
const qReps=['1','i','j','k']; const qCoset=x=>qCenter.map(z=>qm(x,z)).sort(); const qCid=x=>qCoset(x).join('::');
const qCosets=qReps.map(qCoset),qIndex=new Map(qCosets.map((c,i)=>[qCid(c[0]),i]));
const qAdd=Array.from({length:4},()=>Array(4)); for(let i=0;i<4;i++) for(let j=0;j<4;j++) qAdd[i][j]=qIndex.get(qCid(qm(qCosets[i][0],qCosets[j][0])));
assert.deepEqual(qAdd,dAdd);
const qbit=x=>x==='1'?0:(x==='-1'?1:null);
const qQ=qCosets.map(c=>{ const bits=c.map(rep=>qbit(qm(rep,rep))); assert.equal(new Set(bits).size,1); return bits[0]; });
assert.deepEqual(qQ,[0,1,1,1]);
let qSq0=0,qSq1=0; for(const g of QE){ const bit=qbit(qm(g,g)); if(bit===0)qSq0++; if(bit===1)qSq1++; }
assert.equal(qSq0,2); assert.equal(qSq1,6);
const betaQ=Array.from({length:4},()=>Array(4));
for(let i=0;i<4;i++) for(let j=0;j<4;j++){
  const bits=[]; for(const l of qCosets[i]) for(const r of qCosets[j]) bits.push(qbit(qc(l,r)));
  assert.equal(new Set(bits).size,1); betaQ[i][j]=bits[0];
}
const targetBeta=[[0,0,0,0],[0,0,1,1],[0,1,0,1],[0,1,1,0]];
assert.deepEqual(betaD,targetBeta); assert.deepEqual(betaQ,targetBeta);
let dPolar=0,qPolar=0; for(let u=0;u<4;u++) for(let v=0;v<4;v++){
  dPolar++; assert.equal(qD[dAdd[u][v]]^qD[u]^qD[v],betaD[u][v]);
  qPolar++; assert.equal(qQ[qAdd[u][v]]^qQ[u]^qQ[v],betaQ[u][v]);
}
assert.equal(dPolar,16); assert.equal(qPolar,16);
const bases=[]; for(let e=1;e<4;e++) for(let f=1;f<4;f++) if(betaD[e][f]===1) bases.push([e,f]);
assert.equal(bases.length,6); assert.deepEqual(bases.map(([e,f])=>qD[e]&qD[f]),[0,0,0,0,0,0]); assert.deepEqual(bases.map(([e,f])=>qQ[e]&qQ[f]),[1,1,1,1,1,1]);
const mats=[]; for(let a=0;a<2;a++)for(let b=0;b<2;b++)for(let c=0;c<2;c++)for(let d=0;d<2;d++)if(((a*d)^(b*c))===1)mats.push([[a,b],[c,d]]);
assert.equal(mats.length,6);
const tx=(m,i)=>{ const [x,y]=COORDS[i],[[a,b],[c,d]]=m; return COORD_INDEX.get(`${(a*x)^(b*y)}${(c*x)^(d*y)}`); };
let pairPres=0,dStab=0,qStab=0,crossDQ=0,crossQD=0;
for(const m of mats){ let pb=true,ds=true,qs=true,dq=true,qd=true; for(let u=0;u<4;u++){ const tu=tx(m,u); if(qD[tu]!==qD[u])ds=false;if(qQ[tu]!==qQ[u])qs=false;if(qD[tu]!==qQ[u])dq=false;if(qQ[tu]!==qD[u])qd=false; for(let v=0;v<4;v++){const tv=tx(m,v);if(betaD[tu][tv]!==betaD[u][v])pb=false;} } if(pb)pairPres++;if(ds)dStab++;if(qs)qStab++;if(pb&&dq)crossDQ++;if(pb&&qd)crossQD++; }
assert.equal(pairPres,6); assert.equal(dStab,2); assert.equal(qStab,6); assert.equal(crossDQ,0); assert.equal(crossQD,0);
assert.equal(qD.filter((x,i)=>i>0&&x===0).length,2); assert.equal(qQ.filter((x,i)=>i>0&&x===0).length,0);
assert.equal(qD.filter((x,i)=>x!==qQ[i]).length,2);

const {
  ATLAS_QUADRATIC_REFINEMENT_EXTENSION_DISCRIMINATION_SCHEMA,
  atlasQuadraticRefinementExtensionDiscriminationCertificate,
}=await import('../app/dome-world/previews/a15-r0/atlas-quadratic-refinement-extension-discrimination.js');
const child=atlasQuadraticRefinementExtensionDiscriminationCertificate();
assert.equal(ATLAS_QUADRATIC_REFINEMENT_EXTENSION_DISCRIMINATION_SCHEMA,'td613.dome-world.atlas-quadratic-refinement-extension-discrimination/v0.1');
assert.equal(child.passed,true);
assert.deepEqual(child.earned_D8.q,qD);
assert.deepEqual(child.quaternion_control.q,qQ);
assert.deepEqual(child.shared_polar_form.D_table,betaD);
assert.deepEqual(child.shared_polar_form.Q_table,betaQ);
assert.equal(child.linear_isometry_audit.cross_D_to_Q_q_isometries,0);
assert.equal(child.linear_isometry_audit.cross_Q_to_D_q_isometries,0);
assert.equal(child.laws.universal_extension_classification_claimed,false);
assert.equal(child.laws.physical_quadratic_or_quantum_claimed,false);
console.log('Ash A15-R0 Atlas quadratic refinement extension discrimination hostile passed.');
