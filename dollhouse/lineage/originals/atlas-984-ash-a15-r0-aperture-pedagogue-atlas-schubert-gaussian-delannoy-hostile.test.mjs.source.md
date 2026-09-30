import assert from 'node:assert/strict';
import {
  atlasSchubertGaussianDelannoyClosedPolynomial,
  atlasSchubertGaussianDelannoyEvaluate,
} from '../app/dome-world/previews/a15-r0/atlas-schubert-gaussian-delannoy.js';
import { atlasSchubertMobiusRecursive } from '../app/dome-world/previews/a15-r0/atlas-schubert-mobius-incidence.js';
import { atlasSchubertClosureContains } from '../app/dome-world/previews/a15-r0/atlas-schubert-closure-poset.js';
import { atlasGaussianPolynomial, atlasSchubertCellDimension } from '../app/dome-world/previews/a15-r0/atlas-schubert-graded-cell-decomposition.js';
import { atlasSchubertMobiusDelannoyClosedPolynomial } from '../app/dome-world/previews/a15-r0/atlas-schubert-mobius-delannoy.js';

const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function compositions(k,d){
  const out=[];
  function rec(j,rem,prefix){if(j===d-1){out.push([...prefix,rem]);return;}for(let x=0;x<=rem;x++)rec(j+1,rem-x,[...prefix,x]);}
  rec(0,k,[]);return out;
}
function trim(a){let n=a.length;while(n>1&&a[n-1]===0n)n--;return a.slice(0,n);}
function toStrings(p){return p.map(row=>trim(row).map(String));}
function independentIntervalPolynomial(d,k){
  const a=d-1,labels=compositions(k,d),out=Array.from({length:Math.min(a,k)+1},()=>Array(a*k+1).fill(0n));
  let comparable=0,nonzero=0;
  for(const upper of labels)for(const lower of labels){
    if(!atlasSchubertClosureContains(upper,lower))continue;
    comparable++;
    const mu=atlasSchubertMobiusRecursive(upper,lower);if(mu===0)continue;
    const lo=atlasSchubertCellDimension(lower,k),hi=atlasSchubertCellDimension(upper,k),gap=hi-lo;
    assert.equal(mu,gap%2===0?1:-1);
    out[gap][lo]++;nonzero++;
  }
  return {poly:toStrings(out),comparable,nonzero};
}
function evalQOne(poly){return poly.map(row=>row.reduce((a,c)=>a+BigInt(c),0n).toString());}
function tMinusOneAsQ(poly){
  let out=[0n];
  for(let s=0;s<poly.length;s++){
    if(out.length<poly[s].length)out.length=poly[s].length;
    for(let q=0;q<poly[s].length;q++)out[q]=(out[q]??0n)+(s%2===0?1n:-1n)*BigInt(poly[s][q]);
  }
  return trim(out).map(String);
}
function tMinusQAsQ(poly){
  let out=[0n];
  for(let s=0;s<poly.length;s++){
    const need=poly[s].length+s;if(out.length<need)out.length=need;
    for(let q=0;q<poly[s].length;q++)out[q+s]=(out[q+s]??0n)+(s%2===0?1n:-1n)*BigInt(poly[s][q]);
  }
  return trim(out).map(String);
}
function monomial(n){const a=Array(n+1).fill('0');a[n]='1';return a;}

let cells=0,comparableChecks=0,nonzeroIntervals=0,intervalPolynomialFailures=0,gaussianFailures=0,delannoyFailures=0,topFailures=0,bottomFailures=0,reciprocitySliceChecks=0,reciprocityFailures=0;
for(let d=1;d<=7;d++)for(let k=0;k<=5;k++){
  cells++;const a=d-1,ind=independentIntervalPolynomial(d,k),closed=atlasSchubertGaussianDelannoyClosedPolynomial(d,k);
  comparableChecks+=ind.comparable;nonzeroIntervals+=ind.nonzero;
  if(!same(ind.poly,closed))intervalPolynomialFailures++;
  if(!same(closed[0],atlasGaussianPolynomial(d,k)))gaussianFailures++;
  if(!same(evalQOne(closed).map(Number),atlasSchubertMobiusDelannoyClosedPolynomial(d,k)))delannoyFailures++;
  if(!same(tMinusOneAsQ(closed),monomial(a*k)))topFailures++;
  if(!same(tMinusQAsQ(closed),['1']))bottomFailures++;
  for(let s=0;s<closed.length;s++){
    reciprocitySliceChecks++;
    const power=a*k-s,row=closed[s];
    for(let r=0;r<=power;r++)if(BigInt(row[r]??'0')!==BigInt(row[power-r]??'0')){reciprocityFailures++;break;}
  }
}
assert.equal(cells,42);
assert.equal(comparableChecks,113828);
assert.equal(nonzeroIntervals,9912);
assert.equal(intervalPolynomialFailures,0);
assert.equal(gaussianFailures,0);
assert.equal(delannoyFailures,0);
assert.equal(topFailures,0);
assert.equal(bottomFailures,0);
assert.equal(reciprocitySliceChecks,112);
assert.equal(reciprocityFailures,0);

// The triangular q-shift is invisible at q=1 but mandatory in the graded polynomial.
const square=atlasSchubertGaussianDelannoyClosedPolynomial(3,2);
assert.deepEqual(square[2],['0','1']);
assert.notDeepEqual(square[2],['1']);

// Lower-rank weighting places the unique rank-one interval in q-degree zero, not q-degree one.
assert.deepEqual(atlasSchubertGaussianDelannoyClosedPolynomial(2,1),[['1','1'],['1']]);
assert.notDeepEqual(atlasSchubertGaussianDelannoyClosedPolynomial(2,1)[1],['0','1']);

// Adjacent descents, not all inversions: 1100 has one adjacent 10 boundary but four 10 inversion pairs.
const word=[1,1,0,0];
const adjacent=word.slice(0,-1).reduce((n,bit,i)=>n+(bit===1&&word[i+1]===0?1:0),0);
let inversions=0;for(let i=0;i<word.length;i++)for(let j=i+1;j<word.length;j++)if(word[i]===1&&word[j]===0)inversions++;
assert.equal(adjacent,1);
assert.equal(inversions,4);

const anchor=atlasSchubertGaussianDelannoyClosedPolynomial(7,3);
assert.equal(atlasSchubertGaussianDelannoyEvaluate(anchor,4,0),atlasSchubertGaussianDelannoyEvaluate([anchor[0]],4,0));
assert.equal(atlasSchubertGaussianDelannoyEvaluate(anchor,2,-1),'262144');
assert.equal(atlasSchubertGaussianDelannoyEvaluate(anchor,2,-2),'1');

console.log('Ash A15-R0 Atlas Schubert Gaussian-Delannoy hostile interval witness passed.');
