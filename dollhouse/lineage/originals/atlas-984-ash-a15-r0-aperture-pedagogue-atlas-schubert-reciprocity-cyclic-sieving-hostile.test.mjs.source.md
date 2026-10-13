import assert from 'node:assert/strict';
import { atlasSchubertGaussianDelannoyClosedPolynomial } from '../app/dome-world/previews/a15-r0/atlas-schubert-gaussian-delannoy.js';

function words(a,b){const out=[];const rec=(z,o,p)=>{if(!z&&!o){out.push(p);return;}if(z)rec(z-1,o,[...p,0]);if(o)rec(z,o-1,[...p,1]);};rec(a,b,[]);return out;}
function desc(w){const out=[];for(let i=0;i+1<w.length;i++)if(w[i]===1&&w[i+1]===0)out.push(i);return out;}
function subsets(xs){const out=[[]];for(const x of xs){const n=out.length;for(let i=0;i<n;i++)out.push([...out[i],x]);}return out;}
function swap(w,marks){const x=[...w];for(const p of marks){x[p]=0;x[p+1]=1;}return x;}
function same(a,b){return JSON.stringify(a)===JSON.stringify(b);}
function evalPoly(row,q){q=BigInt(q);let p=1n,v=0n;for(const c of row){v+=BigInt(c)*p;p*=q;}return Number(v);}
function fact(n){let v=1n;for(let i=2n;i<=BigInt(n);i++)v*=i;return v;}
function closedFix(a,b,s){const parts=[a-s,b-s,s];if(parts.filter(x=>x%2!==0).length>1)return 0;const hs=parts.map(x=>Math.floor(x/2)),N=Math.floor((a+b-s)/2);let v=fact(N);for(const x of hs)v/=fact(x);return Number(v);}

let slices=0,objects=0,fixedTotal=0,twoCycles=0,withFixed=0,withoutFixed=0,failures=0;
for(let d=1;d<=7;d++)for(let k=0;k<=5;k++){
  const a=d-1,poly=atlasSchubertGaussianDelannoyClosedPolynomial(d,k);
  for(let s=0;s<=Math.min(a,k);s++){
    slices++;let support=0,fixed=0;
    for(const w of words(a,k))for(const marks of subsets(desc(w))){if(marks.length!==s)continue;support++;const u=swap(w,marks),lp=[...u].reverse(),mp=[...marks].map(p=>w.length-2-p).sort((x,y)=>x-y);if(same(lp,w)&&same(mp,marks))fixed++;}
    objects+=support;fixedTotal+=fixed;twoCycles+=(support-fixed)/2;if(fixed)withFixed++;else withoutFixed++;
    const shift=s*(s-1)/2,H=poly[s].slice(shift),h1=evalPoly(H,1),hm1=evalPoly(H,-1),formula=closedFix(a,k,s);
    if(h1!==support||hm1!==fixed||formula!==fixed||support!==fixed+2*((support-fixed)/2))failures++;
    if([a-s,k-s,s].filter(x=>x%2!==0).length>1&&(fixed!==0||hm1!==0))failures++;
  }
}
assert.equal(slices,112);
assert.equal(objects,9912);
assert.equal(fixedTotal,190);
assert.equal(twoCycles,4861);
assert.equal(withFixed,68);
assert.equal(withoutFixed,44);
assert.equal(failures,0);

// Normalization is mathematically necessary: the raw s=2 slice has negative q=-1 value.
const raw=atlasSchubertGaussianDelannoyClosedPolynomial(5,4)[2];
assert.ok(evalPoly(raw,-1)<0);
assert.ok(evalPoly(raw.slice(1),-1)>0);
// Multiple odd half-parts force the q=-1 fixed count to vanish.
assert.equal(closedFix(2,2,1),0);

console.log('Ash A15-R0 Atlas Schubert reciprocity C2 cyclic-sieving hostile tests passed.');
