import assert from 'node:assert/strict';

// Independent hostile reconstruction. Do not import the child until every finite target below is rebuilt.
const STATES=[[0,0],[0,1],[1,0],[1,1]],SI=new Map(STATES.map((v,i)=>[v.join(''),i]));
const V=[[0,0],[1,0],[0,1],[1,1]],VI=new Map(V.map((v,i)=>[v.join(''),i]));
const mid=m=>m.map(v=>v.join('')).join('|');
const mapOf=fn=>STATES.map(s=>fn([...s]));
const apply=(m,s)=>m[SI.get(s.join(''))];
const compose=(l,r)=>STATES.map(s=>[...apply(r,apply(l,s))]);
const ID=([x,y])=>[x,y],A=([x,y])=>[x^1,y],B=([x,y])=>[x,y^x];
function mapClosure(gens){ const by=new Map([[mid(mapOf(ID)),mapOf(ID)]]); let changed=true; while(changed){ changed=false; const cur=[...by.values()]; for(const l of cur) for(const r of [...gens,...cur]) for(const c of [compose(l,r),compose(r,l)]) if(!by.has(mid(c))){by.set(mid(c),c);changed=true;} } return [...by.values()].sort((a,b)=>mid(a).localeCompare(mid(b))); }
function structure(elements,mul,eq=(a,b)=>a===b){ const n=elements.length,t=Array.from({length:n},()=>Array(n).fill(-1)); let checks=0,esc=0; for(let i=0;i<n;i++) for(let j=0;j<n;j++){checks++;const out=mul(elements[i],elements[j]);const k=elements.findIndex(x=>eq(x,out));t[i][j]=k;if(k<0)esc++;} const e=elements.findIndex((_,i)=>elements.every((__,j)=>t[i][j]===j&&t[j][i]===j)); const inv=Array(n).fill(-1); for(let i=0;i<n;i++) inv[i]=elements.findIndex((_,j)=>t[i][j]===e&&t[j][i]===e); return {elements,t,e,inv,checks,esc}; }
function* perms(a,k=0){if(k===a.length){yield [...a];return;}for(let i=k;i<a.length;i++){[a[k],a[i]]=[a[i],a[k]];yield* perms(a,k+1);[a[k],a[i]]=[a[i],a[k]];}}
function autoCensus(s){let candidates=0,checks=0;const autos=[];for(const p of perms([...Array(s.elements.length).keys()])){candidates++;let ok=true;for(let i=0;i<8;i++)for(let j=0;j<8;j++){checks++;if(p[s.t[i][j]]!==s.t[p[i]][p[j]])ok=false;}if(ok)autos.push(p);}return{candidates,checks,autos};}
const pid=p=>p.join(',');
function inners(s){const by=new Map();for(let g=0;g<8;g++){const gi=s.inv[g],p=s.elements.map((_,x)=>s.t[s.t[g][x]][gi]);by.set(pid(p),p);}return [...by.values()];}
function center(s){return s.elements.map((_,i)=>i).filter(i=>s.elements.every((__,j)=>s.t[i][j]===s.t[j][i]));}
const cid=c=>[...c].sort((a,b)=>a-b).join(',');
function quotient(s,e1,e2){const z=center(s),cos=g=>z.map(x=>s.t[g][x]).sort((a,b)=>a-b),reps=[s.e,e1,e2,s.t[e1][e2]],cs=reps.map(cos),ids=cs.map(cid),ix=new Map(ids.map((x,i)=>[x,i])),el=Array(8).fill(-1);for(let g=0;g<8;g++)el[g]=ix.get(cid(cos(g)));const add=Array.from({length:4},()=>Array(4).fill(-1));for(let i=0;i<4;i++)for(let j=0;j<4;j++)add[i][j]=el[s.t[cs[i][0]][cs[j][0]]];const nz=z.find(x=>x!==s.e),q=cs.map(c=>{const bits=c.map(g=>{const sq=s.t[g][g];return sq===s.e?0:sq===nz?1:null});assert.equal(new Set(bits).size,1);return bits[0];});return{z,cs,el,add,q};}
function mats(){const out=[];for(let n=0;n<16;n++)out.push([[n&1,(n>>1)&1],[(n>>2)&1,(n>>3)&1]]);return out;}
const det=m=>((m[0][0]&m[1][1])^(m[0][1]&m[1][0]))&1,matid=m=>m.flat().join('');
function tx(m,i){const[x,y]=V[i],v=[(m[0][0]&x)^(m[0][1]&y),(m[1][0]&x)^(m[1][1]&y)];return VI.get(v.join(''));}
const beta=(q,a)=>Array.from({length:4},(_,u)=>Array.from({length:4},(_,v)=>q[a[u][v]]^q[u]^q[v]));
const pBeta=(m,b)=>{for(let u=0;u<4;u++)for(let v=0;v<4;v++)if(b[tx(m,u)][tx(m,v)]!==b[u][v])return false;return true;};
const pQ=(m,q)=>q.every((x,i)=>q[tx(m,i)]===x);
function induced(auto,Q){const i1=Q.el[auto[Q.cs[1][0]]],i2=Q.el[auto[Q.cs[2][0]]],c1=V[i1],c2=V[i2],m=[[c1[0],c2[0]],[c1[1],c2[1]]];for(let i=0;i<4;i++)assert.equal(tx(m,i),Q.el[auto[Q.cs[i][0]]]);return m;}
function action(autos,inner,Q,orth,pair){const fibers=new Map(),kernel=[];for(const a of autos){const id=matid(induced(a,Q));if(!fibers.has(id))fibers.set(id,[]);fibers.get(id).push(a);if(id==='1001')kernel.push(a);}const image=new Set(fibers.keys()),oids=new Set(orth.map(matid)),pids=new Set(pair.map(matid));const iid=new Set(inner.map(pid)),kid=new Set(kernel.map(pid));return{fibers,kernel,imageEquals:image.size===oids.size&&[...image].every(x=>oids.has(x)),kernelEquals:iid.size===kid.size&&[...iid].every(x=>kid.has(x)),forbidden:[...pids].filter(x=>!oids.has(x)).reduce((n,x)=>n+(fibers.get(x)?.length||0),0),nonorth:[...pids].filter(x=>!oids.has(x)).length};}

const dMaps=mapClosure([mapOf(A),mapOf(B)]),dS=structure(dMaps,compose,(a,b)=>mid(a)===mid(b));
const dA=dMaps.findIndex(x=>mid(x)===mid(mapOf(A))),dB=dMaps.findIndex(x=>mid(x)===mid(mapOf(B))),dQ=quotient(dS,dA,dB),dC=autoCensus(dS),dI=inners(dS);
assert.equal(dMaps.length,8);assert.equal(dC.candidates,40320);assert.equal(dC.checks,2580480);assert.equal(dC.autos.length,8);assert.equal(dI.length,4);assert.deepEqual(dQ.q,[0,0,0,1]);

const QN=['1','-1','i','-i','j','-j','k','-k'];
function qmul(a,b){const parse=s=>({sg:s.startsWith('-')?-1:1,b:s.startsWith('-')?s.slice(1):s}),x=parse(a),y=parse(b);let sg=x.sg*y.sg,bb;if(x.b==='1')bb=y.b;else if(y.b==='1')bb=x.b;else if(x.b===y.b){sg*=-1;bb='1';}else{const key=x.b+y.b,pos={ij:'k',jk:'i',ki:'j'},neg={ji:'k',kj:'i',ik:'j'};if(pos[key])bb=pos[key];else{bb=neg[key];sg*=-1;}}return`${sg<0?'-':''}${bb}`;}
const qS=structure(QN,qmul),qQ=quotient(qS,QN.indexOf('i'),QN.indexOf('j')),qC=autoCensus(qS),qI=inners(qS);
assert.equal(qS.checks,64);assert.equal(qS.esc,0);assert.equal(qC.candidates,40320);assert.equal(qC.checks,2580480);assert.equal(qC.autos.length,24);assert.equal(qI.length,4);assert.deepEqual(qQ.q,[0,1,1,1]);

const all=mats(),gl=all.filter(m=>det(m)===1);assert.equal(all.length,16);assert.equal(gl.length,6);
const bd=beta(dQ.q,dQ.add),bq=beta(qQ.q,qQ.add);assert.deepEqual(bd,bq);
const dp=gl.filter(m=>pBeta(m,bd)),qp=gl.filter(m=>pBeta(m,bq)),doo=dp.filter(m=>pQ(m,dQ.q)),qoo=qp.filter(m=>pQ(m,qQ.q));
assert.equal(dp.length,6);assert.equal(qp.length,6);assert.equal(doo.length,2);assert.equal(qoo.length,6);
const da=action(dC.autos,dI,dQ,doo,dp),qa=action(qC.autos,qI,qQ,qoo,qp);
assert.equal(da.imageEquals,true);assert.equal(da.kernelEquals,true);assert.equal(da.kernel.length,4);assert.deepEqual([...da.fibers.values()].map(x=>x.length).sort((a,b)=>a-b),[4,4]);assert.equal(da.nonorth,4);assert.equal(da.forbidden,0);
assert.equal(qa.imageEquals,true);assert.equal(qa.kernelEquals,true);assert.equal(qa.kernel.length,4);assert.deepEqual([...qa.fibers.values()].map(x=>x.length).sort((a,b)=>a-b),[4,4,4,4,4,4]);assert.equal(qa.nonorth,0);assert.equal(qa.forbidden,0);
assert.equal(dC.checks+qC.checks,5160960);

const child=await import('../app/dome-world/previews/a15-r0/atlas-automorphism-lift-exactness.js');
const c=child.atlasAutomorphismLiftExactnessCertificate();
assert.equal(c.passed,true);
assert.equal(c.D.automorphisms,dC.autos.length);assert.equal(c.Q.automorphisms,qC.autos.length);
assert.deepEqual(c.D.lift_fiber_sizes,[4,4]);assert.deepEqual(c.Q.lift_fiber_sizes,[4,4,4,4,4,4]);
assert.equal(c.D.nonquadratic_lifts,0);

console.log('Ash A15-R0 Atlas automorphism lift exactness independent hostile passed.');
