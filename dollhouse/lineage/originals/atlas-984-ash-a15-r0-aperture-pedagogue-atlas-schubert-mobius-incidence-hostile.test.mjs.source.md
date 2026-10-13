import assert from 'node:assert/strict';
import {
  atlasSchubertClosureContains,
  atlasSchubertCoverContains,
} from '../app/dome-world/previews/a15-r0/atlas-schubert-closure-poset.js';
import { atlasSchubertCellDimension } from '../app/dome-world/previews/a15-r0/atlas-schubert-graded-cell-decomposition.js';
import {
  ATLAS_SCHUBERT_MOBIUS_INCIDENCE_CERTIFICATE as cert,
  atlasSchubertMobiusCandidate,
} from '../app/dome-world/previews/a15-r0/atlas-schubert-mobius-incidence.js';

function compositions(k,d){
  const out=[];
  function rec(j,rem,prefix){if(j===d-1){out.push([...prefix,rem]);return;}for(let x=0;x<=rem;x++)rec(j+1,rem-x,[...prefix,x]);}
  rec(0,k,[]);return out;
}
const lex=(a,b)=>{for(let i=0;i<a.length;i++){if(a[i]!==b[i])return a[i]-b[i];}return 0;};
const key=e=>e.join(',');

// Independent hostile recurrence. It intentionally knows only the earned
// closure predicate and rank ordering. It never calls the candidate gap,
// rook-strip, partition, or canonical-recursion machinery.
function hostileMobiusTable(d,k){
  const labels=compositions(k,d).sort((a,b)=>atlasSchubertCellDimension(a,k)-atlasSchubertCellDimension(b,k)||lex(a,b));
  const n=labels.length,index=new Map(labels.map((e,i)=>[key(e),i]));
  const leq=Array.from({length:n},()=>new Uint8Array(n));
  for(let i=0;i<n;i++)for(let j=i;j<n;j++)if(atlasSchubertClosureContains(labels[j],labels[i]))leq[i][j]=1;
  const mu=Array.from({length:n},()=>new Int32Array(n));
  for(let i=0;i<n;i++){
    mu[i][i]=1;
    for(let j=i+1;j<n;j++){
      if(!leq[i][j])continue;
      let subtotal=0;
      for(let z=i;z<j;z++)if(leq[i][z]&&leq[z][j])subtotal+=mu[i][z];
      mu[i][j]=-subtotal;
    }
  }
  return {labels,index,leq,mu};
}

let cells=0,pairs=0,relations=0,nonzero=0,positive=0,negative=0,zeroComparable=0,mismatches=0,largeMagnitude=0,coverFailures=0;
let anchor=null;
for(let d=1;d<=7;d++)for(let k=0;k<=5;k++){
  cells++;const table=hostileMobiusTable(d,k);let cellRelations=0,cellNonzero=0,cellPositive=0,cellNegative=0;
  for(const upper of table.labels)for(const lower of table.labels){
    pairs++;
    if(!atlasSchubertClosureContains(upper,lower))continue;
    relations++;cellRelations++;
    const i=table.index.get(key(lower)),j=table.index.get(key(upper)),actual=table.mu[i][j];
    const expected=atlasSchubertMobiusCandidate(upper,lower);
    if(actual!==expected)mismatches++;
    if(Math.abs(actual)>1)largeMagnitude++;
    if(atlasSchubertCoverContains(upper,lower)&&actual!==-1)coverFailures++;
    if(actual===0)zeroComparable++;
    else{
      nonzero++;cellNonzero++;
      if(actual===1){positive++;cellPositive++;}
      if(actual===-1){negative++;cellNegative++;}
    }
  }
  if(d===7&&k===3)anchor={labels:table.labels.length,relations:cellRelations,nonzero:cellNonzero,positive:cellPositive,negative:cellNegative};
}

assert.equal(cells,42);
assert.equal(pairs,376467);
assert.equal(relations,113828);
assert.equal(nonzero,9912);
assert.equal(positive,4977);
assert.equal(negative,4935);
assert.equal(zeroComparable,103916);
assert.equal(mismatches,0);
assert.equal(largeMagnitude,0);
assert.equal(coverFailures,0);
assert.deepEqual(anchor,{labels:84,relations:2520,nonzero:377,positive:189,negative:188});

assert.equal(atlasSchubertMobiusCandidate([0,1,1],[1,1,0]),1);
assert.equal(atlasSchubertMobiusCandidate([0,2,0],[2,0,0]),0);
assert.equal(atlasSchubertMobiusCandidate([1,0,1],[2,0,0]),0);
assert.equal(atlasSchubertMobiusCandidate([0,1,1,1],[1,1,1,0]),-1);
assert.equal(atlasSchubertCoverContains([0,1,1],[1,1,0]),false);
assert.equal(atlasSchubertMobiusCandidate([0,1,1],[1,1,0]),1);

assert.equal(cert.recursive_formula_failures,0);
assert.equal(cert.mobius_nonzero,nonzero);
assert.equal(cert.mobius_zero_comparable,zeroComparable);
assert.equal(cert.passed,true);

console.log('Ash A15-R0 Atlas Schubert Möbius incidence inversion hostile recurrence tests passed.');
