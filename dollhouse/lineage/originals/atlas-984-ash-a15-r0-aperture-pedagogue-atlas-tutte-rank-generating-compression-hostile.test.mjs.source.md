import assert from 'node:assert/strict';

// Independent hostile reconstruction. No child or parent module import before the finite surface is fixed.
const popcount=n=>n.toString(2).replace(/0/g,'').length;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function binom(n,k){ if(k<0||k>n)return 0;if(k===0||k===n)return 1;let o=1;for(let i=1;i<=k;i++)o=o*(n-k+i)/i;return o; }
function add(map,a,b,c){if(!c)return;const k=`${a},${b}`;map.set(k,(map.get(k)||0)+c);}
function terms(map){return [...map.entries()].map(([k,c])=>{const[a,b]=k.split(',').map(Number);return{a,b,c};}).filter(t=>t.c).sort((p,q)=>p.a-q.a||p.b-q.b);}
function R(rank){const m=new Map(),r=rank.at(-1);let count=0;for(let s=0;s<rank.length;s++){count++;add(m,r-rank[s],popcount(s)-rank[s],1);}const t=terms(m);return{r,count,t,sum:t.reduce((z,x)=>z+x.c,0)};}
function T(rt){const m=new Map();let raw=0;for(const t of rt)for(let i=0;i<=t.a;i++)for(let j=0;j<=t.b;j++){raw++;add(m,i,j,t.c*binom(t.a,i)*((t.a-i)%2?-1:1)*binom(t.b,j)*((t.b-j)%2?-1:1));}return{t:terms(m),raw};}
function evalP(ts,x,y){return ts.reduce((s,t)=>s+t.c*x**t.a*y**t.b,0);}
function addP(a,b){const m=new Map();for(const t of [...a,...b])add(m,t.a,t.b,t.c);return terms(m);}
function mulVar(ts,axis){return ts.map(t=>({a:t.a+(axis==='x'?1:0),b:t.b+(axis==='y'?1:0),c:t.c}));}
function derive(rank){const r=R(rank),t=T(r.t);return{R:r,T:t};}
function deletionCoeffs(rt,n,r){const a=Array(n+1).fill(0);for(const t of rt)if(t.a===0){const k=n-r-t.b;if(k>=0&&k<=n)a[k]+=t.c;}return a;}

// Earned #926 structural facts reconstructed directly.
const Drank=Array.from({length:16},(_,m)=>(m&0b0110)?1:0); // q00,q11 loops; q01,q10 parallel nonloops
const Qrank=Array.from({length:16},(_,m)=>Math.min(2,popcount(m&0b0111))); // q11 loop; U_2_3 on q00,q01,q10
assert.deepEqual(Drank,[0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1]);
assert.deepEqual(Qrank,[0,1,1,2,1,2,2,2,0,1,1,2,1,2,2,2]);

const D=derive(Drank),Q=derive(Qrank);
assert.equal(D.R.count+Q.R.count,32);
assert.equal(D.R.sum,16);assert.equal(Q.R.sum,16);
assert.deepEqual(D.R.t,[{a:0,b:0,c:2},{a:0,b:1,c:5},{a:0,b:2,c:4},{a:0,b:3,c:1},{a:1,b:0,c:1},{a:1,b:1,c:2},{a:1,b:2,c:1}]);
assert.deepEqual(Q.R.t,[{a:0,b:0,c:3},{a:0,b:1,c:4},{a:0,b:2,c:1},{a:1,b:0,c:3},{a:1,b:1,c:3},{a:2,b:0,c:1},{a:2,b:1,c:1}]);
assert.equal(D.T.raw,22);assert.equal(Q.T.raw,21);assert.equal(D.T.raw+Q.T.raw,43);
assert.deepEqual(D.T.t,[{a:0,b:3,c:1},{a:1,b:2,c:1}]);
assert.deepEqual(Q.T.t,[{a:0,b:2,c:1},{a:1,b:1,c:1},{a:2,b:1,c:1}]);

assert.deepEqual([evalP(D.T.t,1,1),evalP(D.T.t,2,1),evalP(D.T.t,1,2),evalP(D.T.t,2,2)],[2,3,12,16]);
assert.deepEqual([evalP(Q.T.t,1,1),evalP(Q.T.t,2,1),evalP(Q.T.t,1,2),evalP(Q.T.t,2,2)],[3,7,8,16]);
assert.deepEqual(deletionCoeffs(D.R.t,4,1),[1,4,5,2,0]);
assert.deepEqual(deletionCoeffs(Q.R.t,4,2),[1,4,3,0,0]);

function originalMask(localMask,remaining){let out=0;for(let i=0;i<3;i++)if((localMask>>i)&1)out|=1<<remaining[i];return out;}
function minorRank(parent,e,op){const rem=[0,1,2,3].filter(i=>i!==e),re=parent[1<<e],out=[];for(let m=0;m<8;m++){const om=originalMask(m,rem);out.push(op==='delete'?parent[om]:parent[om|(1<<e)]-re);}return out;}
function cls(rank,e){if(rank[1<<e]===0)return'loop';if(rank[15]-rank[15&~(1<<e)]===1)return'coloop';return'ordinary';}

const expectedMinor={
  XY_PLUS_Y2:[{a:0,b:2,c:1},{a:1,b:1,c:1}],
  XY2:[{a:1,b:2,c:1}],
  Y3:[{a:0,b:3,c:1}],
  X2_PLUS_X_PLUS_Y:[{a:0,b:1,c:1},{a:1,b:0,c:1},{a:2,b:0,c:1}],
  X2Y:[{a:2,b:1,c:1}],
};
let minorRankTerms=0,recurrences=0,loops=0,coloops=0,ordinary=0;
for(const [name,parent,parentT] of [['D',Drank,D.T.t],['Q',Qrank,Q.T.t]]){
  for(let e=0;e<4;e++){
    const dr=minorRank(parent,e,'delete'),cr=minorRank(parent,e,'contract');minorRankTerms+=16;
    const dt=derive(dr).T.t,ct=derive(cr).T.t,c=cls(parent,e);
    if(name==='D'&&(e===0||e===3)){assert.deepEqual(dt,expectedMinor.XY_PLUS_Y2);assert.deepEqual(ct,expectedMinor.XY_PLUS_Y2);}
    if(name==='D'&&(e===1||e===2)){assert.deepEqual(dt,expectedMinor.XY2);assert.deepEqual(ct,expectedMinor.Y3);}
    if(name==='Q'&&e===3){assert.deepEqual(dt,expectedMinor.X2_PLUS_X_PLUS_Y);assert.deepEqual(ct,expectedMinor.X2_PLUS_X_PLUS_Y);}
    if(name==='Q'&&e<3){assert.deepEqual(dt,expectedMinor.X2Y);assert.deepEqual(ct,expectedMinor.XY_PLUS_Y2);}
    let rhs;if(c==='loop'){loops++;rhs=mulVar(dt,'y');}else if(c==='coloop'){coloops++;rhs=mulVar(ct,'x');}else{ordinary++;rhs=addP(dt,ct);}recurrences++;
    assert.deepEqual(rhs,parentT,`${name} element ${e} deletion-contraction failed`);
  }
}
assert.equal(minorRankTerms,128);assert.equal(recurrences,8);assert.equal(loops,3);assert.equal(coloops,0);assert.equal(ordinary,5);

const child=await import('../app/dome-world/previews/a15-r0/atlas-tutte-rank-generating-compression.js');
const c=child.atlasTutteRankGeneratingCompressionCertificate();
assert.equal(c.passed,true);
assert.deepEqual(c.D.rank_generating_terms,D.R.t.map(t=>({u:t.a,v:t.b,c:t.c})));
assert.deepEqual(c.Q.rank_generating_terms,Q.R.t.map(t=>({u:t.a,v:t.b,c:t.c})));
assert.deepEqual(c.D.tutte_terms,D.T.t.map(t=>({x:t.a,y:t.b,c:t.c})));
assert.deepEqual(c.Q.tutte_terms,Q.T.t.map(t=>({x:t.a,y:t.b,c:t.c})));
assert.deepEqual(c.D.spanning_slice_deletion_coefficients,[1,4,5,2,0]);
assert.deepEqual(c.Q.spanning_slice_deletion_coefficients,[1,4,3,0,0]);
assert.deepEqual(c.aggregate,{parent_subset_rank_terms:32,coefficient_sum_identities:2,raw_substitution_contributions:43,minor_rank_terms:128,deletion_contraction_identities:8,loop_identities:3,coloop_identities:0,ordinary_identities:5,specialization_identities:8,deletion_enumerator_recoveries:2,failures:0});
assert.equal(c.laws.complete_matroid_isomorphism_invariant_claimed,false);
assert.equal(c.laws.lossless_history_reconstruction_claimed,false);

console.log('Ash A15-R0 Atlas Tutte rank-generating compression independent hostile passed.');
