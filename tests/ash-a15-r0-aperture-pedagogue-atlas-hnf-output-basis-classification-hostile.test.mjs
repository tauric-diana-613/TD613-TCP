import assert from 'node:assert/strict';
import {
  atlasClassifyHnfOutputBasis,
  atlasHnfOutputBasisClassificationCertificate,
  atlasRowHermiteNormalForm,
} from '../app/dome-world/previews/a15-r0/atlas-hnf-output-basis-classification.js';

const pop=x=>{let c=0;while(x){c+=x&1;x>>>=1;}return c;};
const subs=n=>{const a=[];for(let x=1;x<(1<<n);x++)a.push(x);a.sort((x,y)=>pop(x)-pop(y)||x-y);return a;};
const ident=n=>Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?1n:0n));
function Z(n){const s=subs(n);return s.map((S,i)=>s.map((T,j)=>BigInt(pop(S)<=2?(((T&S)===S)?1:0):(i===j?1:0))));}
function mul(A,B){return A.map(r=>B[0].map((_,j)=>r.reduce((q,x,k)=>q+BigInt(x)*BigInt(B[k][j]),0n)));}
function invUnit(A){const n=A.length,I=ident(n),X=Array.from({length:n},()=>Array(n).fill(0n));for(let col=0;col<n;col++){const x=Array(n).fill(0n);for(let i=n-1;i>=0;i--){let rhs=I[i][col];for(let k=i+1;k<n;k++)rhs-=A[i][k]*x[k];x[i]=rhs;}for(let i=0;i<n;i++)X[i][col]=x[i];}return X;}
function U(d,v){const M=ident(d);if(d===1){if(v%2)M[0][0]=-1n;return M;}const sw=(v%(d-1))+1;[M[0],M[sw]]=[M[sw],M[0]];const neg=v%d;M[neg]=M[neg].map(x=>-x);const t=(v+1)%d,s=(t+1)%d,q=BigInt((v%3)+1);M[t]=M[t].map((x,j)=>x+q*M[s][j]);return M;}
function H(d,v){const M=ident(d),p=[1n,2n,3n,5n][v];for(let j=0;j<d;j++){M[j][j]=p;for(let i=0;i<j;i++)M[i][j]=v===0?0n:BigInt(((i+1)*(j+v+1))%Number(p));}return M;}
const strings=A=>A.map(r=>r.map(String));

let orbit=0,distinct=0;
for(let n=1;n<=4;n++){
  const A0=Z(n),Zi=invUnit(A0),d=A0.length,keys=[];
  for(let h=0;h<4;h++){
    const expected=H(d,h),expectedStrings=strings(expected),local=new Set();
    assert.deepEqual(atlasRowHermiteNormalForm(expected),expectedStrings);
    for(let u=0;u<4;u++){
      orbit++;
      const relative=mul(U(d,u),expected),receiver=mul(relative,A0);
      const c=atlasClassifyHnfOutputBasis(receiver,A0,Zi);
      assert.equal(c.valid,true);
      assert.equal(c.hnf_conditions_hold,true);
      assert.deepEqual(c.row_hnf,expectedStrings);
      local.add(c.output_basis_class_key);
    }
    assert.equal(local.size,1,'one left-GL(Z) orbit must have one HNF key');
    keys.push([...local][0]);
  }
  for(let i=0;i<keys.length;i++)for(let j=i+1;j<keys.length;j++){distinct++;assert.notEqual(keys[i],keys[j],'distinct canonical HNFs must remain distinct output-basis classes');}
}
assert.equal(orbit,64);
assert.equal(distinct,24);

// Determinant/index is deliberately too coarse: these canonical classes both have index 4.
{
  const A0=Z(2),Zi=invUnit(A0);
  const H1=[[1n,0n,0n],[0n,2n,0n],[0n,0n,2n]];
  const H2=[[1n,0n,0n],[0n,1n,0n],[0n,0n,4n]];
  const c1=atlasClassifyHnfOutputBasis(mul(H1,A0),A0,Zi);
  const c2=atlasClassifyHnfOutputBasis(mul(H2,A0),A0,Zi);
  assert.equal(c1.lattice_index,'4');
  assert.equal(c2.lattice_index,'4');
  assert.notEqual(c1.output_basis_class_key,c2.output_basis_class_key);
}

// Regression scar from superseded #952 run 2428: signed Number zero must collapse before integer HNF comparison.
assert.deepEqual(
  atlasRowHermiteNormalForm([[-0,2],[-1,0]]),
  atlasRowHermiteNormalForm([[0,2],[-1,0]]),
);

const cert=atlasHnfOutputBasisClassificationCertificate();
for(const scar of [
  'HNF_OUTPUT_BASIS_CLASSIFICATION != INPUT_SUPPORT_RELABELING',
  'HNF_OUTPUT_BASIS_CLASSIFICATION != SMITH_NORMAL_FORM_CLASSIFICATION',
  'LEFT_GL_Z_EQUIVALENCE != LEFT_RIGHT_GL_Z_EQUIVALENCE',
  'SAME_DETERMINANT_INDEX != SAME_OUTPUT_BASIS_CLASS',
  'CANONICAL_HNF != UNIQUE_ENCODING',
  'METALLURGICAL_REFINEMENT_METAPHOR != MATHEMATICAL_PROOF',
])assert.equal(cert.membranes.includes(scar),true,`missing membrane: ${scar}`);
assert.equal(cert.passed,true);

console.log('Ash A15-R0 Atlas HNF output-basis classification hostile tests passed.');