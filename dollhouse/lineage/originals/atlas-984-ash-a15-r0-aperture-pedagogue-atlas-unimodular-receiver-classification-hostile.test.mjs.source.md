import assert from 'node:assert/strict';
import {
  atlasClassifyMinimalIntegerReceiver,
  atlasUnimodularReceiverClassificationCertificate,
} from '../app/dome-world/previews/a15-r0/atlas-unimodular-receiver-classification.js';

const pop=x=>{let c=0;while(x){c+=x&1;x>>>=1;}return c;};
const subs=n=>{const a=[];for(let x=1;x<(1<<n);x++)a.push(x);a.sort((x,y)=>pop(x)-pop(y)||x-y);return a;};
const ident=n=>Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?1:0));
function Z(n){const s=subs(n);return s.map((S,i)=>s.map((T,j)=>pop(S)<=2?((T&S)===S?1:0):(i===j?1:0)));}
function mul(A,B){return A.map(r=>B[0].map((_,j)=>r.reduce((q,x,k)=>q+x*B[k][j],0)));}
function invUnit(A){const n=A.length,I=ident(n),X=Array.from({length:n},()=>Array(n).fill(0));for(let col=0;col<n;col++){const x=Array(n).fill(0);for(let i=n-1;i>=0;i--){let rhs=I[i][col];for(let k=i+1;k<n;k++)rhs-=A[i][k]*x[k];x[i]=rhs;}for(let i=0;i<n;i++)X[i][col]=x[i];}return X;}
function U(d,v){const M=ident(d);if(d===1){if(v%2)M[0][0]=-1;return M;}const sw=(v%(d-1))+1;[M[0],M[sw]]=[M[sw],M[0]];const neg=v%d;for(let j=0;j<d;j++)M[neg][j]=M[neg][j]===0?0:-M[neg][j];const t=(v+1)%d,s=(t+1)%d,q=(v%3)+1;for(let j=0;j<d;j++)M[t][j]+=q*M[s][j];return M;}

let uni=0,proper=0,singular=0;
for(let n=1;n<=5;n++){
  const A0=Z(n),Zi=invUnit(A0),d=A0.length;
  assert.deepEqual(mul(A0,Zi),ident(d));
  assert.deepEqual(mul(Zi,A0),ident(d));

  for(let v=0;v<6;v++){
    uni++;
    const change=U(d,v),A=mul(change,A0),c=atlasClassifyMinimalIntegerReceiver(A,A0,Zi);
    assert.equal(c.valid,true);
    assert.equal(c.injective_on_support_module,true);
    assert.equal(c.lattice_surjective,true);
    assert.equal(c.atlas_integer_output_basis_equivalent,true);
    assert.deepEqual(c.recovered_output_basis_change,change);
  }

  for(const k of [2,3,5,7]){
    proper++;
    const A=A0.map((r,i)=>i===0?r.map(x=>k*x):[...r]);
    const c=atlasClassifyMinimalIntegerReceiver(A,A0,Zi);
    assert.equal(c.valid,true);
    assert.equal(c.determinant,k);
    assert.equal(c.injective_on_support_module,true);
    assert.equal(c.lattice_surjective,false);
    assert.equal(c.lattice_index,k);
    assert.equal(c.atlas_integer_output_basis_equivalent,false);
  }

  singular++;
  const S=A0.map((r,i)=>i===0?r.map(()=>0):[...r]);
  const c=atlasClassifyMinimalIntegerReceiver(S,A0,Zi);
  assert.equal(c.determinant,0);
  assert.equal(c.injective_on_support_module,false);
  assert.equal(c.lattice_surjective,false);
  assert.equal(c.atlas_integer_output_basis_equivalent,false);
}
assert.equal(uni,30);
assert.equal(proper,20);
assert.equal(singular,5);

const cert=atlasUnimodularReceiverClassificationCertificate();
for(const scar of [
  'GL_Z_ORBIT_UNIQUENESS != UNIQUE_ENCODING',
  'UNIMODULAR_EQUIVALENCE != ARBITRARY_NONLINEAR_EQUIVALENCE',
  'LATTICE_SURJECTIVE != REQUIRED_FOR_STATE_INJECTIVITY',
  'DETERMINANT_INDEX != SHANNON_INFORMATION',
  'PROPER_SUBLATTICE != INFORMATION_LOSS_ON_VALID_IMAGE',
  'OUTPUT_BASIS_EQUIVALENCE != INPUT_RELABELING_EQUIVALENCE',
])assert.equal(cert.membranes.includes(scar),true,`missing membrane: ${scar}`);
assert.equal(cert.passed,true);

console.log('Ash A15-R0 Atlas unimodular receiver classification hostile tests passed.');