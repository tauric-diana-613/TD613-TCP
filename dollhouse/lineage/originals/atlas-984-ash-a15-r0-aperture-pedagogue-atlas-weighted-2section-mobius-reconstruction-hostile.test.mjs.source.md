import assert from 'node:assert/strict';

const G=[0,1,2,3,4,5];
function comb(xs,k){const out=[];function r(s,p){if(p.length===k){out.push([...p]);return;}for(let i=s;i<xs.length;i++)r(i+1,[...p,xs[i]]);}r(0,[]);return out;}
const blocks=[2,3,4].flatMap(k=>comb(G,k));
const isect=(a,b)=>a.filter(x=>b.includes(x)).length;
const key=s=>`${s.length}:${s.join(',')}`;
const canon=xs=>[...xs].map(x=>[...x].sort((a,b)=>a-b)).sort((a,b)=>key(a).localeCompare(key(b)));
function raw(H){return canon(G.filter(e=>H.some(b=>b.includes(e))).map(e=>H.map((b,i)=>b.includes(e)?i:null).filter(i=>i!==null)));}
function mult(xs,min=1){const M=new Map();for(const s of xs)if(s.length>=min){const k=s.join(',');if(!M.has(k))M.set(k,{support:[...s],multiplicity:0});M.get(k).multiplicity++;}return [...M.values()].sort((a,b)=>key(a.support).localeCompare(key(b.support)));}
function recv(H,weighted){const x=raw(H),pairs=[];for(let i=0;i<H.length;i++)for(let j=i+1;j<H.length;j++){const w=isect(H[i],H[j]);if(w)pairs.push([i,j,weighted?w:1]);}return {capacities:H.map(b=>b.length),pairs,high:mult(x,3)};}
function highC(high,i,j){return high.reduce((n,x)=>n+((x.support.includes(i)&&x.support.includes(j))?x.multiplicity:0),0);}
function dec(R){const out=[],p=new Map();for(const x of R.high)for(let q=0;q<x.multiplicity;q++)out.push([...x.support]);for(const [i,j,w] of R.pairs){const v=w-highC(R.high,i,j);if(v<0)return null;p.set(`${i},${j}`,v);for(let q=0;q<v;q++)out.push([i,j]);}for(let i=0;i<R.capacities.length;i++){let sh=R.high.reduce((n,x)=>n+(x.support.includes(i)?x.multiplicity:0),0);for(const [k,v] of p){const [a,b]=k.split(',').map(Number);if(a===i||b===i)sh+=v;}const v=R.capacities[i]-sh;if(v<0)return null;for(let q=0;q<v;q++)out.push([i]);}return canon(out);}
function nonlinear(H){for(let i=0;i<H.length;i++)for(let j=i+1;j<H.length;j++)if(isect(H[i],H[j])>1)return true;return false;}
function nonuniform(H){return new Set(H.map(x=>x.length)).size>1;}

let total=0,nonlin=0,nonuni=0,both=0,marked=0,nonlinMarked=0,wok=0,uok=0,pairChecks=0,totalBlocks=0,membership=0,supportEntries=0,posPairs=0,pairSum=0,posResid=0,residSum=0,residGt1=0,highDistinct=0,highElems=0,maxW=0,maxH=0,maxR=0;
const by={},hist={},uFail=new Set(),nlSet=new Set();
for(let r=1;r<=3;r++)for(const H of comb(blocks,r)){
  total++;by[r]=(by[r]||0)+1;totalBlocks+=r;pairChecks+=r*(r-1)/2;membership+=6*r;
  const x=raw(H),Rw=recv(H,true),Ru=recv(H,false),nl=nonlinear(H),nu=nonuniform(H),code=H.map(b=>b.join('')).join('|');supportEntries+=x.length;
  if(nl){nonlin++;nlSet.add(code);}if(nu)nonuni++;if(nl&&nu)both++;if(Rw.high.length){marked++;if(nl)nonlinMarked++;}
  highDistinct+=Rw.high.length;for(const h of Rw.high){hist[h.multiplicity]=(hist[h.multiplicity]||0)+1;highElems+=h.multiplicity;maxH=Math.max(maxH,h.multiplicity);}
  for(const [i,j,w] of Rw.pairs){posPairs++;pairSum+=w;maxW=Math.max(maxW,w);const z=w-highC(Rw.high,i,j);if(z>0){posResid++;residSum+=z;maxR=Math.max(maxR,z);}if(z>1)residGt1++;}
  const a=dec(Rw),b=dec(Ru),sw=JSON.stringify(a)===JSON.stringify(x),su=JSON.stringify(b)===JSON.stringify(x);if(sw)wok++;if(su)uok++;else uFail.add(code);
}
assert.deepEqual(by,{1:50,2:1225,3:19600});
assert.equal(total,20875);assert.equal(totalBlocks,61300);assert.equal(pairChecks,60025);assert.equal(membership,367800);assert.equal(supportEntries,109500);
assert.equal(nonuni,18375);assert.equal(nonlin,16490);assert.equal(both,14820);assert.equal(marked,11405);assert.equal(nonlinMarked,11015);
assert.equal(highDistinct,11405);assert.equal(highElems,13800);assert.deepEqual(hist,{1:9090,2:2235,3:80});
assert.equal(posPairs,53655);assert.equal(pairSum,88200);assert.equal(posResid,37500);assert.equal(residSum,46800);assert.equal(residGt1,8700);
assert.equal(maxW,3);assert.equal(maxH,3);assert.equal(maxR,3);assert.equal(wok,20875);assert.equal(uok,4385);assert.deepEqual([...uFail].sort(),[...nlSet].sort());

// Necessity of capacities: same weighted pair/high strata, different singleton stratum.
const capA=[[0,1],[0,2]],capB=[[0,1,3],[0,2]],ra=recv(capA,true),rb=recv(capB,true);
assert.deepEqual({pairs:ra.pairs,high:ra.high},{pairs:rb.pairs,high:rb.high});assert.notDeepEqual(raw(capA),raw(capB));
// Necessity of exact high-support multiplicity: same capacities and pair weights, different bundling.
const hiA=[[0,3],[1,3],[2,3]],hiB=[[0,1],[0,2],[1,2]],ha=recv(hiA,true),hb=recv(hiB,true);
assert.deepEqual({capacities:ha.capacities,pairs:ha.pairs},{capacities:hb.capacities,pairs:hb.pairs});assert.notDeepEqual(raw(hiA),raw(hiB));

const {atlasWeighted2SectionMobiusReconstructionCertificate}=await import('../app/dome-world/previews/a15-r0/atlas-weighted-2section-mobius-reconstruction.js');
const child=atlasWeighted2SectionMobiusReconstructionCertificate();
assert.equal(child.passed,true);assert.equal(child.census.weighted_successes,wok);assert.equal(child.census.unweighted_failures,uFail.size);assert.equal(child.census.nonlinear_families,nlSet.size);
console.log('Ash A15-R0 Atlas weighted 2-section Möbius reconstruction hostile tests passed.');
