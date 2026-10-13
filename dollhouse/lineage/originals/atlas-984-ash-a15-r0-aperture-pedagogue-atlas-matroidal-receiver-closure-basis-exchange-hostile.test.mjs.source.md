import assert from 'node:assert/strict';

// Independent hostile reconstruction. Do not import the child until native actions,
// all 16 receiver closures, closure axioms, rank, bases, circuits, and exchange are rebuilt.
const E=[0,1,2,3],V=[[0,0],[1,0],[0,1],[1,1]],VI=new Map(V.map((v,i)=>[v.join(''),i]));
const add=(u,v)=>[u[0]^v[0],u[1]^v[1]],addIndex=(i,j)=>VI.get(add(V[i],V[j]).join(''));
const qD=[0,0,0,1],qQ=[0,1,1,1],qid=q=>q.join('');
const beta=Array.from({length:4},(_,u)=>Array.from({length:4},(_,v)=>qD[addIndex(u,v)]^qD[u]^qD[v]));
function funcs(){const out=[];for(let n=0;n<16;n++)out.push([3,2,1,0].map(s=>(n>>s)&1));return out;}
const refinements=[];let polarizationChecks=0;
for(const q of funcs()){let ok=true;for(let u=0;u<4;u++)for(let v=0;v<4;v++){polarizationChecks++;if((q[addIndex(u,v)]^q[u]^q[v])!==beta[u][v])ok=false;}if(ok)refinements.push(q);}
assert.equal(polarizationChecks,256);assert.deepEqual(refinements.map(qid),['0001','0010','0100','0111']);
const RI=new Map(refinements.map((q,i)=>[qid(q),i]));
function mats(){const out=[];for(let n=0;n<16;n++)out.push([[n&1,(n>>1)&1],[(n>>2)&1,(n>>3)&1]]);return out;}
const det=m=>((m[0][0]&m[1][1])^(m[0][1]&m[1][0]))&1;
function tx(m,i){const[x,y]=V[i],o=[(m[0][0]&x)^(m[0][1]&y),(m[1][0]&x)^(m[1][1]&y)];return VI.get(o.join(''));}
function inv(m,gl){return gl.find(c=>E.every(i=>tx(c,tx(m,i))===i));}
const pBeta=m=>{for(let u=0;u<4;u++)for(let v=0;v<4;v++)if(beta[tx(m,u)][tx(m,v)]!==beta[u][v])return false;return true;};
const pQ=(m,q)=>q.every((x,i)=>q[tx(m,i)]===x);
const all=mats(),gl=all.filter(m=>det(m)===1),pair=gl.filter(pBeta),dNative=pair.filter(m=>pQ(m,qD)),qNative=pair.filter(m=>pQ(m,qQ));
assert.equal(all.length,16);assert.equal(gl.length,6);assert.equal(pair.length,6);assert.equal(dNative.length,2);assert.equal(qNative.length,6);
function pull(q,m){const mi=inv(m,gl);return V.map((_,i)=>q[tx(mi,i)]);}
function perms(group){return group.map(m=>refinements.map(q=>RI.get(qid(pull(q,m)))));}
const dP=perms(dNative),qP=perms(qNative);
const maskIndices=mask=>E.filter(i=>(mask>>i)&1),maskOf=xs=>xs.reduce((m,i)=>m|(1<<i),0),popcount=m=>maskIndices(m).length,subseteq=(a,b)=>(a&~b)===0;

function receiverClosures(P){
  const rows=[];
  for(let mask=0;mask<16;mask++){
    const S=maskIndices(mask),stab=P.filter(p=>S.every(i=>p[i]===i)),closure=[];
    for(let x=0;x<4;x++) if(stab.every(p=>p[x]===x)) closure.push(x);
    rows.push({mask,closure,closureMask:maskOf(closure)});
  }
  return rows;
}
const dRows=receiverClosures(dP),qRows=receiverClosures(qP);
assert.deepEqual(dRows.map(r=>r.closureMask),[9,9,15,15,15,15,15,15,9,9,15,15,15,15,15,15]);
assert.deepEqual(qRows.map(r=>r.closureMask),[8,9,10,15,12,15,15,15,8,9,10,15,12,15,15,15]);

function rank(closure,mask){let best=Infinity;for(let w=0;w<16;w++)if(subseteq(mask,closure[w]))best=Math.min(best,popcount(w));return best;}
function audit(rows){
  const closure=rows.map(r=>r.closureMask),ranks=Array.from({length:16},(_,m)=>rank(closure,m));
  let ext=0,idem=0,monoCandidates=0,monoPremises=0,monoFail=0,steCandidates=0,steAnte=0,steFail=0,rc=0,rcFail=0,subPairs=0,subFail=0;
  for(let s=0;s<16;s++){if(!subseteq(s,closure[s]))ext++;if(closure[closure[s]]!==closure[s])idem++;}
  for(let s=0;s<16;s++)for(let t=0;t<16;t++){monoCandidates++;if(subseteq(s,t)){monoPremises++;if(!subseteq(closure[s],closure[t]))monoFail++;}}
  for(let s=0;s<16;s++)for(const x of E)for(const y of E){steCandidates++;const xb=1<<x,yb=1<<y;if((closure[s|xb]&yb)!==0&&(closure[s]&yb)===0){steAnte++;if((closure[s|yb]&xb)===0)steFail++;}}
  for(let s=0;s<16;s++)for(const e of E){rc++;const inside=(closure[s]&(1<<e))!==0,sameRank=ranks[s|(1<<e)]===ranks[s];if(inside!==sameRank)rcFail++;}
  for(let s=0;s<16;s++)for(let t=0;t<16;t++){subPairs++;if(ranks[s]+ranks[t]<ranks[s|t]+ranks[s&t])subFail++;}
  const independent=[];for(let m=0;m<16;m++)if(ranks[m]===popcount(m))independent.push(m);const I=new Set(independent),fullRank=ranks[15],bases=independent.filter(m=>popcount(m)===fullRank),B=new Set(bases),circuits=[];
  for(let m=1;m<16;m++){if(I.has(m))continue;const xs=maskIndices(m);if(xs.every(x=>I.has(m&~(1<<x))))circuits.push(m);}
  const loops=circuits.filter(m=>popcount(m)===1).map(m=>maskIndices(m)[0]),L=new Set(loops),parallel=[];
  for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){if(L.has(i)||L.has(j))continue;const m=(1<<i)|(1<<j);if(circuits.includes(m))parallel.push([i,j]);}
  let beObl=0,beFail=0;for(const b1 of bases)for(const b2 of bases)for(const x of maskIndices(b1&~b2)){beObl++;if(!maskIndices(b2&~b1).some(y=>B.has((b1&~(1<<x))|(1<<y))))beFail++;}
  const freq={};for(const r of ranks)freq[String(r)]=(freq[String(r)]||0)+1;
  return{closure,ranks,rankFrequency:freq,fullRank,independent,bases,circuits,loops,parallel,ext,idem,monoCandidates,monoPremises,monoFail,steCandidates,steAnte,steFail,rc,rcFail,subPairs,subFail,beObl,beFail};
}
const D=audit(dRows),Q=audit(qRows);
assert.equal(D.ext,0);assert.equal(Q.ext,0);assert.equal(D.idem,0);assert.equal(Q.idem,0);assert.equal(D.monoCandidates,256);assert.equal(Q.monoCandidates,256);assert.equal(D.monoPremises,81);assert.equal(Q.monoPremises,81);assert.equal(D.monoFail,0);assert.equal(Q.monoFail,0);
assert.equal(D.steCandidates,256);assert.equal(Q.steCandidates,256);assert.equal(D.steAnte,16);assert.equal(Q.steAnte,30);assert.equal(D.steFail,0);assert.equal(Q.steFail,0);
assert.equal(D.rc,64);assert.equal(Q.rc,64);assert.equal(D.rcFail,0);assert.equal(Q.rcFail,0);assert.equal(D.subPairs,256);assert.equal(Q.subPairs,256);assert.equal(D.subFail,0);assert.equal(Q.subFail,0);
assert.equal(D.fullRank,1);assert.deepEqual(D.rankFrequency,{'0':4,'1':12});assert.deepEqual(D.independent,[0,2,4]);assert.deepEqual(D.bases,[2,4]);assert.deepEqual(D.circuits,[1,6,8]);assert.deepEqual(D.loops,[0,3]);assert.deepEqual(D.parallel,[[1,2]]);assert.equal(D.beObl,2);assert.equal(D.beFail,0);
assert.equal(Q.fullRank,2);assert.deepEqual(Q.rankFrequency,{'0':2,'1':6,'2':8});assert.deepEqual(Q.independent,[0,1,2,3,4,5,6]);assert.deepEqual(Q.bases,[3,5,6]);assert.deepEqual(Q.circuits,[7,8]);assert.deepEqual(Q.loops,[3]);assert.deepEqual(Q.parallel,[]);assert.equal(Q.beObl,6);assert.equal(Q.beFail,0);
assert.equal(D.steAnte+Q.steAnte,46);assert.equal(D.beObl+Q.beObl,8);

const child=await import('../app/dome-world/previews/a15-r0/atlas-matroidal-receiver-closure-basis-exchange.js');
const c=child.atlasMatroidalReceiverClosureBasisExchangeCertificate();
assert.equal(c.passed,true);assert.equal(c.failure_total,0);
assert.equal(c.D.matroid_type,'U_1_2_PLUS_TWO_LOOPS');assert.equal(c.Q.matroid_type,'U_2_3_PLUS_ONE_LOOP');
assert.deepEqual(c.D.combinatorics.basis_masks,D.bases);assert.deepEqual(c.Q.combinatorics.basis_masks,Q.bases);
assert.deepEqual(c.D.combinatorics.circuit_masks,D.circuits);assert.deepEqual(c.Q.combinatorics.circuit_masks,Q.circuits);
assert.equal(c.D.closure_axioms.steinitz_true_antecedents,D.steAnte);assert.equal(c.Q.closure_axioms.steinitz_true_antecedents,Q.steAnte);
assert.equal(c.combined_burden.steinitz_true_antecedents,46);assert.equal(c.combined_burden.basis_exchange_obligations,8);

console.log('Ash A15-R0 Atlas matroidal receiver closure basis exchange independent hostile passed.');