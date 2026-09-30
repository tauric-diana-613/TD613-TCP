import assert from 'node:assert/strict';
import {atlasGaussianBinomialPrimePower} from '../app/dome-world/previews/a15-r0/atlas-prime-power-gaussian-binomial.js';
import {
  atlasGrassmannianPointToHnf,
  atlasHnfToGrassmannianPoint,
} from '../app/dome-world/previews/a15-r0/atlas-hnf-schubert-digit-bijection.js';

function choose(n,k){
  const out=[];
  function rec(start,left,prefix){if(left===0){out.push([...prefix]);return;}for(let x=start;x<=n-left;x++)rec(x+1,left-1,[...prefix,x]);}
  rec(0,k,[]);return out;
}
function pointKey(n,R){return `${n}|${R.map(r=>r.join(',')).join(';')}`;}
function hnfKey(H){return H.map(r=>r.join(',')).join(';');}
function enumerateReverseRref(p,d,k,visit){
  const n=d+k-1;
  for(const pivots of choose(n,k)){
    const pivotSet=new Set(pivots),nonpivots=[];for(let c=0;c<n;c++)if(!pivotSet.has(c))nonpivots.push(c);
    const free=[];for(let r=0;r<k;r++)for(const c of nonpivots)if(c<pivots[r])free.push([r,c]);
    const R=Array.from({length:k},()=>Array(n).fill(0));for(let r=0;r<k;r++)R[r][pivots[r]]=1;
    function rec(i){
      if(i===free.length){visit(R.map(row=>[...row]));return;}
      const [r,c]=free[i];for(let x=0;x<p;x++){R[r][c]=x;rec(i+1);}R[r][c]=0;
    }
    rec(0);
  }
}

let cells=0,total=0,roundtripFailures=0,countFailures=0,collisions=0;
for(const [p,maxD] of [[2,4],[3,3]])for(let d=1;d<=maxD;d++)for(let k=0;k<=3;k++){
  cells++;let count=0;const hKeys=new Set(),pointKeys=new Set();
  enumerateReverseRref(p,d,k,R=>{
    count++;total++;
    const point={n:d+k-1,reverse_rref:R.map(row=>row.map(String))};
    const inv=atlasGrassmannianPointToHnf(point,p);
    if(!inv.valid||inv.d!==d||inv.k!==k){roundtripFailures++;return;}
    const hKey=hnfKey(inv.hnf);if(hKeys.has(hKey))collisions++;hKeys.add(hKey);
    const fwd=atlasHnfToGrassmannianPoint(inv.hnf,p);
    if(!fwd.valid||pointKey(point.n,R.map(row=>row.map(String)))!==pointKey(fwd.n,fwd.reverse_rref))roundtripFailures++;
    if(pointKeys.has(fwd.point_key))collisions++;pointKeys.add(fwd.point_key);
  });
  const expected=Number(atlasGaussianBinomialPrimePower(d,k,p));
  if(count!==expected||hKeys.size!==expected||pointKeys.size!==expected)countFailures++;
}
assert.equal(cells,28);
assert.equal(total,3210);
assert.equal(roundtripFailures,0);
assert.equal(countFailures,0);
assert.equal(collisions,0);

const H0=[[1n,0n],[0n,4n]],H2=[[1n,2n],[0n,4n]];
const mod2=H=>H.map(r=>r.map(x=>String(BigInt(x)%2n)).join(',')).join(';');
assert.equal(mod2(H0),mod2(H2));
assert.notEqual(atlasHnfToGrassmannianPoint(H0,2).point_key,atlasHnfToGrassmannianPoint(H2,2).point_key);

assert.throws(()=>atlasHnfToGrassmannianPoint([[1n]],4),/prime p/);
assert.equal(atlasGrassmannianPointToHnf({n:2,reverse_rref:[['1','2']]},3).valid,false);
assert.equal(atlasGrassmannianPointToHnf({n:3,reverse_rref:[['0','1','0'],['0','1','1']]},2).valid,false);

const anchor=Array.from({length:7},(_,i)=>Array.from({length:7},(_,j)=>i===j?1n:0n));
anchor[6][6]=8n;for(let r=0;r<6;r++)anchor[r][6]=BigInt(r+1);
const anchorPoint=atlasHnfToGrassmannianPoint(anchor,2);
assert.equal(anchorPoint.valid,true);
assert.equal(anchorPoint.n,9);
assert.equal(anchorPoint.k,3);
assert.deepEqual(atlasGrassmannianPointToHnf(anchorPoint,2).hnf,anchor.map(r=>r.map(String)));

console.log('Ash A15-R0 Atlas HNF-Schubert digit bijection hostile tests passed.');
