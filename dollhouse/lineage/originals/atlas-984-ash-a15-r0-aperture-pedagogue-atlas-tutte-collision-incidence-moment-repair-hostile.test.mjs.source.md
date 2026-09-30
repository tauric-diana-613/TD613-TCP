import assert from 'node:assert/strict';

const E=[0,1,2,3,4,5];
const popcount=n=>n.toString(2).replace(/0/g,'').length;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

function rankTable(special){
  const H=new Set(special);
  return Array.from({length:64},(_,m)=>{
    const k=popcount(m);
    if(k<3) return k;
    if(k===3&&H.has(m)) return 2;
    return 3;
  });
}
function circuits(rank){
  const out=[];
  for(let m=1;m<64;m++){
    if(rank[m]===popcount(m)) continue;
    let minimal=true;
    for(const e of E) if((m>>e)&1){ const sub=m&~(1<<e); if(rank[sub]<popcount(sub)) minimal=false; }
    if(minimal) out.push(m);
  }
  return out;
}
function hyperplanes(rank){
  const out=[];
  for(let m=0;m<64;m++){
    if(rank[m]!==2) continue;
    let maximal=true;
    for(const e of E) if(((m>>e)&1)===0&&rank[m|(1<<e)]===2) maximal=false;
    if(maximal) out.push(m);
  }
  return out;
}
function circuitHyperplanes(rank){ const C=new Set(circuits(rank)); return hyperplanes(rank).filter(m=>C.has(m)); }
function incidence(ch){
  const d=E.map(e=>ch.reduce((s,h)=>s+(((h>>e)&1)?1:0),0));
  const sorted=[...d].sort((a,b)=>b-a);
  const m1=d.reduce((s,x)=>s+x,0),m2=d.reduce((s,x)=>s+x*x,0);
  const overlapDegree=d.reduce((s,x)=>s+x*(x-1)/2,0);
  let overlapDirect=0; for(let i=0;i<ch.length;i++) for(let j=i+1;j<ch.length;j++) overlapDirect+=popcount(ch[i]&ch[j]);
  return {d,sorted,m1,m2,overlapDegree,overlapMoment:(m2-m1)/2,overlapDirect};
}
function add(map,a,b,c=1){ const k=`${a},${b}`; map[k]=(map[k]||0)+c; if(map[k]===0) delete map[k]; }
function rankGenerating(rank){ const out={},rE=rank[63]; for(let m=0;m<64;m++) add(out,rE-rank[m],popcount(m)-rank[m]); return Object.fromEntries(Object.entries(out).sort()); }
function choose(n,k){ if(k<0||k>n)return 0; if(k===0||k===n)return 1; let v=1; for(let i=1;i<=k;i++)v=v*(n-k+i)/i; return v; }
function tutte(R){ const out={}; for(const [key,c] of Object.entries(R)){ const [a,b]=key.split(',').map(Number); for(let i=0;i<=a;i++)for(let j=0;j<=b;j++)add(out,i,j,c*choose(a,i)*choose(b,j)*((-1)**((a-i)+(b-j)))); } return Object.fromEntries(Object.entries(out).sort()); }
function permutations(xs){ const out=[]; function rec(p,r){ if(!r.length){out.push([...p]);return;} for(let i=0;i<r.length;i++)rec([...p,r[i]],[...r.slice(0,i),...r.slice(i+1)]); } rec([],xs); return out; }
const PERMS=permutations(E);
function permuteMask(mask,p){ let out=0; for(const e of E) if((mask>>e)&1) out|=1<<p[e]; return out; }
function relabelAudit(ch,base){
  let incidenceMembershipEvaluations=0,failures=0;
  for(const p of PERMS){
    const row=incidence(ch.map(h=>permuteMask(h,p)));
    incidenceMembershipEvaluations+=12;
    if(!same(row.sorted,base.sorted)) failures++;
    if(row.m1!==base.m1) failures++;
    if(row.m2!==base.m2) failures++;
    if(row.overlapMoment!==base.overlapMoment) failures++;
  }
  return {permutations:PERMS.length,incidenceMembershipEvaluations,failures};
}

// Independent reconstruction before child import.
const disjRank=rankTable([7,56]);
const meetRank=rankTable([7,25]);
const disjCH=circuitHyperplanes(disjRank),meetCH=circuitHyperplanes(meetRank);
assert.deepEqual(disjCH,[7,56]);
assert.deepEqual(meetCH,[7,25]);
const D=incidence(disjCH),M=incidence(meetCH);
assert.deepEqual(D.d,[1,1,1,1,1,1]);
assert.deepEqual(M.d,[2,1,1,1,1,0]);
assert.deepEqual(D.sorted,[1,1,1,1,1,1]);
assert.deepEqual(M.sorted,[2,1,1,1,1,0]);
assert.deepEqual([D.m1,M.m1],[6,6]);
assert.deepEqual([D.m2,M.m2],[6,8]);
assert.deepEqual([D.overlapDegree,D.overlapMoment,D.overlapDirect],[0,0,0]);
assert.deepEqual([M.overlapDegree,M.overlapMoment,M.overlapDirect],[1,1,1]);
const expectedT={'0,1':4,'0,2':3,'0,3':1,'1,0':4,'1,1':2,'2,0':3,'3,0':1};
assert.deepEqual(tutte(rankGenerating(disjRank)),expectedT);
assert.deepEqual(tutte(rankGenerating(meetRank)),expectedT);
const receiverClassCounts={
  R0:new Set([JSON.stringify(expectedT),JSON.stringify(expectedT)]).size,
  R1:new Set([JSON.stringify([expectedT,D.m1]),JSON.stringify([expectedT,M.m1])]).size,
  R2:new Set([JSON.stringify([expectedT,D.m1,D.m2]),JSON.stringify([expectedT,M.m1,M.m2])]).size,
};
assert.deepEqual(receiverClassCounts,{R0:1,R1:1,R2:2});
const separationDepth=receiverClassCounts.R1===2?1:receiverClassCounts.R2===2?2:null;
assert.equal(separationDepth,2);
const relD=relabelAudit(disjCH,D),relM=relabelAudit(meetCH,M);
assert.equal(relD.permutations+relM.permutations,1440);
assert.equal(relD.incidenceMembershipEvaluations+relM.incidenceMembershipEvaluations,17280);
assert.equal(relD.failures+relM.failures,0);

const child=await import('../app/dome-world/previews/a15-r0/atlas-tutte-collision-incidence-moment-repair.js');
const c=child.atlasTutteCollisionIncidenceMomentRepairCertificate();
assert.equal(c.parent_exact,true);
assert.deepEqual(c.M_disj.circuit_hyperplanes,disjCH);
assert.deepEqual(c.M_meet.circuit_hyperplanes,meetCH);
assert.deepEqual(c.M_disj.labeled_incidence_degrees,D.d);
assert.deepEqual(c.M_meet.labeled_incidence_degrees,M.d);
assert.deepEqual(c.M_disj.sorted_incidence_degrees,D.sorted);
assert.deepEqual(c.M_meet.sorted_incidence_degrees,M.sorted);
assert.deepEqual([c.M_disj.m1,c.M_meet.m1],[D.m1,M.m1]);
assert.deepEqual([c.M_disj.m2,c.M_meet.m2],[D.m2,M.m2]);
assert.deepEqual(c.receiver_ladder.class_counts,receiverClassCounts);
assert.equal(c.receiver_ladder.incidence_moment_separation_depth,separationDepth);
assert.equal(c.relabeling.total_relabelings,1440);
assert.equal(c.relabeling.incidence_membership_evaluations,17280);
assert.equal(c.relabeling.failures,0);
assert.equal(c.overlap_identity.failures,0);
assert.equal(c.passed,true);

console.log('Ash A15-R0 Atlas Tutte collision incidence-moment repair hostile contract passed.');
