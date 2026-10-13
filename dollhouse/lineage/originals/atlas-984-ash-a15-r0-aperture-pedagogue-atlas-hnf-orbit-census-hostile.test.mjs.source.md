import assert from 'node:assert/strict';
import {
  atlasHnfOrbitCount,
  atlasHnfOrbitCensusCertificate,
} from '../app/dome-world/previews/a15-r0/atlas-hnf-orbit-census.js';

function diagonalFactorizations(d,N){
  N=BigInt(N);const out=[];
  function rec(i,rem,prefix){
    if(i===d-1){out.push([...prefix,rem]);return;}
    for(let h=1n;h<=rem;h++)if(rem%h===0n)rec(i+1,rem/h,[...prefix,h]);
  }
  rec(0,N,[]);return out;
}
function enumerateResiduesForDiagonal(diag){
  const d=diag.length,H=Array.from({length:d},(_,i)=>Array.from({length:d},(_,j)=>i===j?diag[i]:0n));
  const slots=[];for(let j=0;j<d;j++)for(let i=0;i<j;i++)slots.push([i,j]);
  let count=0n;
  function rec(s){
    if(s===slots.length){
      for(let i=0;i<d;i++){
        assert.ok(H[i][i]>0n);
        for(let j=0;j<i;j++)assert.equal(H[i][j],0n);
        for(let r=0;r<i;r++){assert.ok(H[r][i]>=0n);assert.ok(H[r][i]<H[i][i]);}
      }
      count++;return;
    }
    const [i,j]=slots[s];
    for(let v=0n;v<diag[j];v++){H[i][j]=v;rec(s+1);}
  }
  rec(0);return count;
}
function bruteHnfCount(d,N){return diagonalFactorizations(d,N).reduce((s,diag)=>s+enumerateResiduesForDiagonal(diag),0n);}

let total=0n,cells=0;
for(let d=1;d<=3;d++)for(let N=1;N<=8;N++){
  cells++;
  const brute=bruteHnfCount(d,N),child=BigInt(atlasHnfOrbitCount(d,N));
  assert.equal(brute,child,`HNF brute census mismatch d=${d} N=${N}`);
  total+=brute;
}
assert.equal(cells,24);
assert.equal(total,454n);

const gcd=(a,b)=>{while(b)[a,b]=[b,a%b];return a;};
let mult=0;
for(let d=1;d<=5;d++)for(let m=1;m<=12;m++)for(let n=m;n<=12;n++)if(gcd(m,n)===1){
  mult++;
  assert.equal(BigInt(atlasHnfOrbitCount(d,m*n)),BigInt(atlasHnfOrbitCount(d,m))*BigInt(atlasHnfOrbitCount(d,n)));
}
assert.equal(mult,230);
assert.equal(atlasHnfOrbitCount(2,4),'7');
assert.equal((BigInt(atlasHnfOrbitCount(2,2))**2n).toString(),'9');

function localCoefficient(d,p,k){
  p=BigInt(p);let a=Array(k+1).fill(0n);a[0]=1n;
  for(let j=0;j<d;j++){
    const q=p**BigInt(j),b=Array(k+1).fill(0n);
    for(let old=0;old<=k;old++)for(let add=0;old+add<=k;add++)b[old+add]+=a[old]*(q**BigInt(add));
    a=b;
  }
  return a[k];
}
let local=0;
for(const p of [2,3,5])for(let d=1;d<=5;d++)for(let k=0;k<=4;k++){
  local++;
  assert.equal(BigInt(atlasHnfOrbitCount(d,BigInt(p)**BigInt(k))),localCoefficient(d,p,k));
}
assert.equal(local,75);

const c=atlasHnfOrbitCensusCertificate();
for(const scar of [
  'HNF_ORBIT_COUNT != RAW_RECEIVER_COUNT',
  'MULTIPLICATIVE != COMPLETELY_MULTIPLICATIVE',
  'FORMAL_DIRICHLET_FACTOR != ANALYTIC_CONTINUATION_CLAIM',
  'SUBLATTICE_INDEX != SHANNON_INFORMATION',
  'OUTPUT_BASIS_ORBIT_CENSUS != INPUT_SUPPORT_RELABELING_CENSUS',
  'METALLURGICAL_REFINEMENT_METAPHOR != ARITHMETIC_PROOF',
])assert.equal(c.membranes.includes(scar),true,`missing membrane: ${scar}`);
assert.equal(c.passed,true);

console.log('Ash A15-R0 Atlas HNF orbit census hostile tests passed.');