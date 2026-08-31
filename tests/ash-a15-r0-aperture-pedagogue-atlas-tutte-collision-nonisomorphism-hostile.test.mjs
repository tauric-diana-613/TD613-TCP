import assert from 'node:assert/strict';

const E=[0,1,2,3,4,5];
const popcount=n=>n.toString(2).replace(/0/g,'').length;
const subseteq=(a,b)=>(a&~b)===0;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

function rankTable(H){
  const hs=new Set(H);
  return Array.from({length:64},(_,m)=>{
    const k=popcount(m);
    if(k<3) return k;
    if(k===3&&hs.has(m)) return 2;
    return 3;
  });
}
const D=rankTable([7,56]);
const M=rankTable([7,25]);

function audit(R){
  let norm=R[0]===0?0:1,bound=0,monoPairs=0,monoPrem=0,monoFail=0,subPairs=0,subFail=0;
  for(let a=0;a<64;a++){
    if(R[a]<0||R[a]>Math.min(3,popcount(a))) bound++;
    for(let b=0;b<64;b++){
      monoPairs++;
      if(subseteq(a,b)){ monoPrem++; if(R[a]>R[b]) monoFail++; }
      subPairs++;
      if(R[a]+R[b]<R[a|b]+R[a&b]) subFail++;
    }
  }
  return {norm,bound,monoPairs,monoPrem,monoFail,subPairs,subFail};
}
assert.deepEqual(audit(D),{norm:0,bound:0,monoPairs:4096,monoPrem:729,monoFail:0,subPairs:4096,subFail:0});
assert.deepEqual(audit(M),{norm:0,bound:0,monoPairs:4096,monoPrem:729,monoFail:0,subPairs:4096,subFail:0});

function circuits(R){
  const out=[];
  for(let m=1;m<64;m++){
    if(R[m]===popcount(m)) continue;
    let minimal=true;
    for(const e of E) if((m>>e)&1){ const s=m&~(1<<e); if(R[s]<popcount(s)) minimal=false; }
    if(minimal) out.push(m);
  }
  return out;
}
function hyperplanes(R){
  const out=[];
  for(let m=0;m<64;m++){
    if(R[m]!==2) continue;
    let maximal=true;
    for(const e of E) if(((m>>e)&1)===0&&R[m|(1<<e)]===2) maximal=false;
    if(maximal) out.push(m);
  }
  return out;
}
function CH(R){ const c=new Set(circuits(R)); return hyperplanes(R).filter(m=>c.has(m)); }
const chD=CH(D),chM=CH(M);
assert.deepEqual(chD,[7,56]);
assert.deepEqual(chM,[7,25]);
assert.equal(popcount(chD[0]&chD[1]),0);
assert.equal(popcount(chM[0]&chM[1]),1);

function add(map,a,b,c=1){ const k=`${a},${b}`; map[k]=(map[k]||0)+c; if(map[k]===0) delete map[k]; }
function Rpoly(R){ const out={}; for(let m=0;m<64;m++) add(out,3-R[m],popcount(m)-R[m]); return Object.fromEntries(Object.entries(out).sort()); }
function choose(n,k){ if(k<0||k>n) return 0; let v=1; for(let i=1;i<=k;i++) v=v*(n-k+i)/i; return v; }
function Tpoly(RG){ const out={}; for(const [key,c] of Object.entries(RG)){ const [a,b]=key.split(',').map(Number); for(let i=0;i<=a;i++) for(let j=0;j<=b;j++) add(out,i,j,c*choose(a,i)*choose(b,j)*((-1)**((a-i)+(b-j)))); } return Object.fromEntries(Object.entries(out).sort()); }
const expectedR={'0,0':18,'0,1':15,'0,2':6,'0,3':1,'1,0':15,'1,1':2,'2,0':6,'3,0':1};
const expectedT={'0,1':4,'0,2':3,'0,3':1,'1,0':4,'1,1':2,'2,0':3,'3,0':1};
assert.deepEqual(Rpoly(D),expectedR);
assert.deepEqual(Rpoly(M),expectedR);
assert.deepEqual(Tpoly(Rpoly(D)),expectedT);
assert.deepEqual(Tpoly(Rpoly(M)),expectedT);

function perms(xs){ const out=[]; const rec=(p,r)=>{ if(!r.length){out.push(p);return;} for(let i=0;i<r.length;i++) rec([...p,r[i]],[...r.slice(0,i),...r.slice(i+1)]); }; rec([],xs); return out; }
const P=perms(E);
assert.equal(P.length,720);
function pmask(mask,p){ let out=0; for(const e of E) if((mask>>e)&1) out|=1<<p[e]; return out; }
function search(A,B){ let comps=0,matches=0; for(const p of P){ let ok=true; for(let m=0;m<64;m++){ comps++; if(A[m]!==B[pmask(m,p)]) ok=false; } if(ok) matches++; } return {permutations:P.length,rank_comparisons:comps,matches}; }
assert.deepEqual(search(D,M),{permutations:720,rank_comparisons:46080,matches:0});
assert.deepEqual(search(D,D),{permutations:720,rank_comparisons:46080,matches:72});
assert.deepEqual(search(M,M),{permutations:720,rank_comparisons:46080,matches:8});

// Only after independent reconstruction is fixed may the child be imported.
const child=await import('../app/dome-world/previews/a15-r0/atlas-tutte-collision-nonisomorphism.js');
const c=child.atlasTutteCollisionNonisomorphismCertificate();
assert.equal(c.passed,true);
assert.deepEqual(c.M_disj.rank_values,D);
assert.deepEqual(c.M_meet.rank_values,M);
assert.deepEqual(c.common_rank_generating,expectedR);
assert.deepEqual(c.common_tutte,expectedT);
assert.equal(c.cross_isomorphism.match_count,0);
assert.equal(c.self_automorphisms.M_disj.match_count,72);
assert.equal(c.self_automorphisms.M_meet.match_count,8);
assert.equal(c.aggregate_burden.permutation_rank_comparisons,138240);
assert.equal(c.laws.tutte_is_complete_matroid_isomorphism_invariant_in_this_control,false);

console.log('Ash A15-R0 Atlas Tutte collision nonisomorphism hostile contract passed.');
