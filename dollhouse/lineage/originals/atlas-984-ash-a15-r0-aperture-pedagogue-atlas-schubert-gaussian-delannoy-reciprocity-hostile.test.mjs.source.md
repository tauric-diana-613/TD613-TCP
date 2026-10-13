import assert from 'node:assert/strict';
import { atlasSchubertGaussianDelannoyClosedPolynomial } from '../app/dome-world/previews/a15-r0/atlas-schubert-gaussian-delannoy.js';

const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function words(a,b){const out=[];const rec=(z,o,p)=>{if(!z&&!o){out.push(p);return;}if(z)rec(z-1,o,[...p,0]);if(o)rec(z,o-1,[...p,1]);};rec(a,b,[]);return out;}
function desc(w){const out=[];for(let i=0;i+1<w.length;i++)if(w[i]===1&&w[i+1]===0)out.push(i);return out;}
function subsets(xs){const out=[[]];for(const x of xs){const n=out.length;for(let i=0;i<n;i++)out.push([...out[i],x]);}return out;}
function swap(w,marks){const x=[...w];for(const p of marks){x[p]=0;x[p+1]=1;}return x;}
function rank(w){let z=0,r=0;for(const b of w){if(b===0)z++;else r+=z;}return r;}

let objects=0,fixed=0,failures=0,sliceFailures=0;
for(let d=1;d<=7;d++)for(let k=0;k<=5;k++){
  const a=d-1,hist={};
  for(const lower of words(a,k))for(const marks of subsets(desc(lower))){
    objects++;const upper=swap(lower,marks),n=lower.length,s=marks.length;
    const lowerPrime=[...upper].reverse(),upperPrime=[...lower].reverse(),marksPrime=[...marks].map(p=>n-2-p).sort((x,y)=>x-y);
    if(!same(swap(lowerPrime,marksPrime),upperPrime))failures++;
    const lower2=[...upperPrime].reverse(),upper2=[...lowerPrime].reverse(),marks2=[...marksPrime].map(p=>n-2-p).sort((x,y)=>x-y);
    if(!same(lower2,lower)||!same(upper2,upper)||!same(marks2,marks))failures++;
    if(rank(lower)+rank(lowerPrime)!==a*k-s)failures++;
    if(rank(upper)+rank(upperPrime)!==a*k+s)failures++;
    hist[s]??={};hist[s][rank(lower)]=(hist[s][rank(lower)]??0)+1;
    if(same(lower,lowerPrime)&&same(marks,marksPrime)){fixed++;if(2*rank(lower)!==a*k-s)failures++;}
  }
  const poly=atlasSchubertGaussianDelannoyClosedPolynomial(d,k);
  for(let s=0;s<poly.length;s++){const degree=a*k-s;for(let q=0;q<=degree;q++)if((hist[s]?.[q]??0)!==Number(poly[s][q]??'0')||(hist[s]?.[q]??0)!==(hist[s]?.[degree-q]??0)){sliceFailures++;break;}}
}
assert.equal(objects,9912);
assert.equal(fixed,190);
assert.equal(failures,0);
assert.equal(sliceFailures,0);

const v01=[1,0,0];const badV01=[...v01].reverse().map(b=>1-b);
assert.notEqual(badV01.filter(x=>x===0).length,v01.filter(x=>x===0).length);
const lower=[1,0],marks=[0],upper=swap(lower,marks),badLower=[...lower].reverse(),goodLower=[...upper].reverse();
assert.notDeepEqual(badLower,goodLower);
const w=[1,0,1,0],m=[0,2],u=swap(w,m),lp=[...u].reverse(),bad=m.map(p=>w.length-1-p);
assert.equal(bad.some(p=>!desc(lp).includes(p)),true);

console.log('Ash A15-R0 Atlas Schubert Gaussian-Delannoy reciprocity hostile tests passed.');
