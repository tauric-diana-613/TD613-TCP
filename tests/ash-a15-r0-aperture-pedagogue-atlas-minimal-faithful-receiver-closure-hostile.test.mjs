import assert from 'node:assert/strict';

// Independent hostile reconstruction. Do not import the child until the complete finite subset surface is rebuilt.
const V=[[0,0],[1,0],[0,1],[1,1]],VI=new Map(V.map((v,i)=>[v.join(''),i]));
const add=(u,v)=>[u[0]^v[0],u[1]^v[1]],addIndex=(i,j)=>VI.get(add(V[i],V[j]).join(''));
const qD=[0,0,0,1],qQ=[0,1,1,1];
const beta=Array.from({length:4},(_,u)=>Array.from({length:4},(_,v)=>qD[addIndex(u,v)]^qD[u]^qD[v]));
const qid=q=>q.join('');
function funcs(){const out=[];for(let n=0;n<16;n++)out.push([3,2,1,0].map(s=>(n>>s)&1));return out;}
const refinements=[];let polarizationChecks=0;
for(const q of funcs()){let ok=true;for(let u=0;u<4;u++)for(let v=0;v<4;v++){polarizationChecks++;if((q[addIndex(u,v)]^q[u]^q[v])!==beta[u][v])ok=false;}if(ok)refinements.push(q);}
assert.equal(polarizationChecks,256);assert.deepEqual(refinements.map(qid),['0001','0010','0100','0111']);
const RI=new Map(refinements.map((q,i)=>[qid(q),i]));

function mats(){const out=[];for(let n=0;n<16;n++)out.push([[n&1,(n>>1)&1],[(n>>2)&1,(n>>3)&1]]);return out;}
const det=m=>((m[0][0]&m[1][1])^(m[0][1]&m[1][0]))&1;
function tx(m,i){const[x,y]=V[i],o=[(m[0][0]&x)^(m[0][1]&y),(m[1][0]&x)^(m[1][1]&y)];return VI.get(o.join(''));}
function inv(m,gl){return gl.find(c=>[0,1,2,3].every(i=>tx(c,tx(m,i))===i));}
const pBeta=m=>{for(let u=0;u<4;u++)for(let v=0;v<4;v++)if(beta[tx(m,u)][tx(m,v)]!==beta[u][v])return false;return true;};
const pQ=(m,q)=>q.every((x,i)=>q[tx(m,i)]===x);
const all=mats(),gl=all.filter(m=>det(m)===1),pair=gl.filter(pBeta),dNative=pair.filter(m=>pQ(m,qD)),qNative=pair.filter(m=>pQ(m,qQ));
assert.equal(all.length,16);assert.equal(gl.length,6);assert.equal(pair.length,6);assert.equal(dNative.length,2);assert.equal(qNative.length,6);
function pull(q,m){const mi=inv(m,gl);return V.map((_,i)=>q[tx(mi,i)]);}
function perms(group){return group.map(m=>refinements.map(q=>RI.get(qid(pull(q,m)))));}
const dP=perms(dNative),qP=perms(qNative);

function audit(P){
  const G=P.length,rows=[];let sigChecks=0,pairChecks=0,closureChecks=0,indexFailures=0,closureFailures=0;
  for(let mask=0;mask<16;mask++){
    const S=[0,1,2,3].filter(i=>(mask>>i)&1),ids=[];
    for(const p of P){sigChecks++;ids.push(JSON.stringify(S.map(i=>p[i])));}
    const fibers=new Map();for(const id of ids)fibers.set(id,(fibers.get(id)||0)+1);
    for(let i=0;i<G;i++)for(let j=i+1;j<G;j++)pairChecks++;
    const stab=P.filter(p=>S.every(i=>p[i]===i));
    if(G/stab.length!==fibers.size)indexFailures++;
    const closure=[];
    for(let x=0;x<4;x++){
      let determined=true;
      for(let g=0;g<G;g++)for(let h=0;h<G;h++){
        closureChecks++;
        const agree=S.every(i=>P[g][i]===P[h][i]);
        if(agree&&P[g][x]!==P[h][x])determined=false;
      }
      if(determined)closure.push(x);
    }
    const fixed=[0,1,2,3].filter(x=>stab.every(p=>p[x]===x));if(JSON.stringify(closure)!==JSON.stringify(fixed))closureFailures++;
    rows.push({mask,S,classes:fibers.size,outerFibers:[...fibers.values()].sort((a,b)=>a-b),stab:stab.length,closure});
  }
  const faithful=rows.filter(r=>r.classes===G),rank=Math.min(...faithful.map(r=>r.S.length));
  return{rows,sigChecks,pairChecks,closureChecks,indexFailures,closureFailures,faithful,rank,minMasks:faithful.filter(r=>r.S.length===rank).map(r=>r.mask)};
}
const D=audit(dP),Q=audit(qP);
const dClasses=[1,1,2,2,2,2,2,2,1,1,2,2,2,2,2,2],qClasses=[1,3,3,6,3,6,6,6,1,3,3,6,3,6,6,6];
assert.deepEqual(D.rows.map(r=>r.classes),dClasses);assert.deepEqual(Q.rows.map(r=>r.classes),qClasses);
assert.equal(D.sigChecks,32);assert.equal(Q.sigChecks,96);assert.equal(D.pairChecks,16);assert.equal(Q.pairChecks,240);assert.equal(D.closureChecks,256);assert.equal(Q.closureChecks,2304);
assert.equal(D.indexFailures,0);assert.equal(Q.indexFailures,0);assert.equal(D.closureFailures,0);assert.equal(Q.closureFailures,0);
assert.equal(D.rank,1);assert.deepEqual(D.minMasks,[2,4]);assert.equal(D.faithful.length,12);assert.deepEqual(D.rows[0].closure,[0,3]);assert.deepEqual(D.rows[1].closure,[0,3]);assert.deepEqual(D.rows[2].closure,[0,1,2,3]);
assert.equal(Q.rank,2);assert.deepEqual(Q.minMasks,[3,5,6]);assert.equal(Q.faithful.length,8);assert.deepEqual(Q.rows[0].closure,[3]);assert.deepEqual(Q.rows[1].closure,[0,3]);assert.deepEqual(Q.rows[2].closure,[1,3]);assert.deepEqual(Q.rows[4].closure,[2,3]);assert.deepEqual(Q.rows[3].closure,[0,1,2,3]);
const freq=(rows,key)=>rows.reduce((o,r)=>{const k=String(key(r));o[k]=(o[k]||0)+1;return o;},{});
assert.deepEqual(freq(D.rows,r=>r.classes),{'1':4,'2':12});assert.deepEqual(freq(Q.rows,r=>r.classes),{'1':2,'3':6,'6':8});
assert.deepEqual(freq(D.rows,r=>r.closure.length),{'2':4,'4':12});assert.deepEqual(freq(Q.rows,r=>r.closure.length),{'1':2,'2':6,'4':8});
for(const r of D.rows){const af=r.outerFibers.map(n=>n*4).sort((a,b)=>a-b);assert.deepEqual(af,r.classes===1?[8]:[4,4]);}
for(const r of Q.rows){const af=r.outerFibers.map(n=>n*4).sort((a,b)=>a-b);assert.deepEqual(af,r.classes===1?[24]:(r.classes===3?[8,8,8]:[4,4,4,4,4,4]));}
assert.equal(D.sigChecks+Q.sigChecks,128);assert.equal(D.pairChecks+Q.pairChecks,256);assert.equal(D.closureChecks+Q.closureChecks,2560);

const child=await import('../app/dome-world/previews/a15-r0/atlas-minimal-faithful-receiver-closure.js');
const c=child.atlasMinimalFaithfulReceiverClosureCertificate();
assert.equal(c.passed,true);
assert.equal(c.D.receiver_separation_rank,D.rank);assert.deepEqual(c.D.minimum_faithful_masks,D.minMasks);
assert.equal(c.Q.receiver_separation_rank,Q.rank);assert.deepEqual(c.Q.minimum_faithful_masks,Q.minMasks);
assert.deepEqual(c.D.rows.map(r=>r.class_count),dClasses);assert.deepEqual(c.Q.rows.map(r=>r.class_count),qClasses);
assert.equal(c.burden.subset_receiver_signature_checks,128);assert.equal(c.burden.subset_signature_pair_checks,256);assert.equal(c.burden.closure_ordered_pair_checks,2560);

console.log('Ash A15-R0 Atlas minimal faithful receiver closure independent hostile passed.');