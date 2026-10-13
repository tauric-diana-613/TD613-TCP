import {
  ATLAS_UNIMODULAR_RECEIVER_CLASSIFICATION_SCHEMA,
  atlasUnimodularReceiverClassificationCertificate,
} from './atlas-unimodular-receiver-classification.js';

export const ATLAS_HNF_OUTPUT_BASIS_CLASSIFICATION_SCHEMA='td613.dome-world.atlas-hnf-output-basis-classification/v0.1';
export const ATLAS_HNF_OUTPUT_BASIS_CLASSIFICATION_PARENT_RECEIPT='4b731c16721b43e5319843da84955b3b80210cec';

let cached=null;
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const abs=x=>x<0n?-x:x;
const identity=n=>Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?1n:0n));
const clone=A=>A.map(r=>r.map(x=>BigInt(x)));
const same=(A,B)=>A.length===B.length&&A.every((r,i)=>r.length===B[i].length&&r.every((x,j)=>x===B[i][j]));
const key=A=>A.map(r=>r.map(String).join(',')).join(';');
const out=A=>A.map(r=>r.map(String));
const popcount=x=>{let c=0;while(x){c+=x&1;x>>>=1;}return c;};
const contains=(sup,sub)=>(sup&sub)===sub;

function supports(n){const xs=[];for(let m=1;m<(1<<n);m++)xs.push(m);xs.sort((a,b)=>popcount(a)-popcount(b)||a-b);return xs;}
function atlasMatrix(n){
  const ss=supports(n);
  return ss.map((S,i)=>ss.map((T,j)=>BigInt(popcount(S)<=2?(contains(T,S)?1:0):(i===j?1:0))));
}
function matMul(A,B){return A.map(r=>B[0].map((_,j)=>r.reduce((s,x,k)=>s+x*B[k][j],0n)));}
function detBareiss(A){
  if(A.length===0)return 1n;
  const M=clone(A),n=M.length;let sign=1n,prev=1n;
  for(let k=0;k<n-1;k++){
    let p=k;while(p<n&&M[p][k]===0n)p++;if(p===n)return 0n;
    if(p!==k){[M[p],M[k]]=[M[k],M[p]];sign=-sign;}
    const pivot=M[k][k];
    for(let i=k+1;i<n;i++)for(let j=k+1;j<n;j++)M[i][j]=(M[i][j]*pivot-M[i][k]*M[k][j])/prev;
    for(let i=k+1;i<n;i++)M[i][k]=0n;
    prev=pivot;
  }
  return sign*M[n-1][n-1];
}
function unitUpperInverse(A){
  const n=A.length,I=identity(n),X=Array.from({length:n},()=>Array(n).fill(0n));
  for(let col=0;col<n;col++){
    const x=Array(n).fill(0n);
    for(let i=n-1;i>=0;i--){let rhs=I[i][col];for(let k=i+1;k<n;k++)rhs-=A[i][k]*x[k];if(A[i][i]!==1n)throw new Error('expected unit upper triangular Atlas matrix');x[i]=rhs;}
    for(let i=0;i<n;i++)X[i][col]=x[i];
  }
  return X;
}
function egcd(a,b){
  const sa=a<0n?-1n:1n,sb=b<0n?-1n:1n;let oldr=abs(a),r=abs(b),olds=1n,s=0n,oldt=0n,t=1n;
  while(r!==0n){const q=oldr/r;[oldr,r]=[r,oldr-q*r];[olds,s]=[s,olds-q*s];[oldt,t]=[t,oldt-q*t];}
  return {g:oldr,x:olds*sa,y:oldt*sb};
}
function floorQuotient(a,p){let q=a/p,r=a%p;if(r<0n){q-=1n;r+=p;}return q;}
function rowHnfFullRank(A){
  const M=clone(A),n=M.length;
  if(n===0||M.some(r=>r.length!==n))throw new Error('row HNF requires a nonempty square matrix');
  if(detBareiss(M)===0n)throw new Error('row HNF classifier requires full rank');
  for(let k=0;k<n;k++){
    if(M[k][k]===0n){const p=M.findIndex((r,i)=>i>k&&r[k]!==0n);if(p<0)throw new Error('full-rank pivot missing');[M[k],M[p]]=[M[p],M[k]];}
    for(let i=k+1;i<n;i++){
      const b=M[i][k];if(b===0n)continue;
      const a=M[k][k],{g,x,y}=egcd(a,b),rk=[...M[k]],ri=[...M[i]];
      M[k]=rk.map((v,j)=>x*v+y*ri[j]);
      M[i]=rk.map((v,j)=>(-b/g)*v+(a/g)*ri[j]);
    }
    if(M[k][k]<0n)M[k]=M[k].map(x=>-x);
    const pivot=M[k][k];
    for(let i=0;i<k;i++){
      const q=floorQuotient(M[i][k],pivot);
      M[i]=M[i].map((x,j)=>x-q*M[k][j]);
    }
  }
  return M;
}
function hnfConditions(H){
  for(let i=0;i<H.length;i++){
    if(H[i][i]<=0n)return false;
    for(let j=0;j<i;j++)if(H[i][j]!==0n)return false;
    for(let r=0;r<i;r++)if(H[r][i]<0n||H[r][i]>=H[i][i])return false;
  }
  return true;
}
function unimodularBasis(d,variant){
  const U=identity(d);
  if(d===1){if(variant%2)U[0][0]=-1n;return U;}
  const swap=(variant%(d-1))+1;[U[0],U[swap]]=[U[swap],U[0]];
  const neg=variant%d;U[neg]=U[neg].map(x=>-x);
  const target=(variant+1)%d,source=(target+1)%d,q=BigInt((variant%3)+1);
  U[target]=U[target].map((x,j)=>x+q*U[source][j]);
  return U;
}
function hnfTemplate(d,variant){
  const H=identity(d),pivot=[1n,2n,3n,5n][variant];
  for(let j=0;j<d;j++){
    H[j][j]=pivot;
    for(let i=0;i<j;i++)H[i][j]=variant===0?0n:BigInt(((i+1)*(j+variant+1))%Number(pivot));
  }
  return H;
}

export function atlasRowHermiteNormalForm(matrix){return freeze(out(rowHnfFullRank(matrix)));}

export function atlasClassifyHnfOutputBasis(receiver,Z,Zinv){
  const A=clone(receiver),ZZ=clone(Z),Zi=clone(Zinv),d=ZZ.length;
  if(d===0||A.length!==d||A.some(r=>r.length!==d)||Zi.length!==d||Zi.some(r=>r.length!==d))return freeze({valid:false,reason:'dimension mismatch'});
  const detA=detBareiss(A);
  if(detA===0n)return freeze({valid:false,reason:'minimum-rank receiver is singular',injective_on_support_module:false});
  const B=matMul(A,Zi),H=rowHnfFullRank(B),detH=detBareiss(H),canonical=hnfConditions(H);
  return freeze({
    valid:canonical&&same(matMul(ZZ,Zi),identity(d))&&same(matMul(Zi,ZZ),identity(d)),
    injective_on_support_module:true,
    receiver_determinant:detA.toString(),
    lattice_index:abs(detA).toString(),
    relative_determinant:detBareiss(B).toString(),
    hnf_determinant:detH.toString(),
    row_hnf:freeze(out(H).map(freeze)),
    output_basis_class_key:key(H),
    atlas_identity_class:same(H,identity(d)),
    hnf_conditions_hold:canonical,
  });
}

export function atlasHnfOutputBasisClassificationCertificate(){
  if(cached)return cached;
  const parent=atlasUnimodularReceiverClassificationCertificate();
  const parentExact=parent.passed===true&&ATLAS_UNIMODULAR_RECEIVER_CLASSIFICATION_SCHEMA==='td613.dome-world.atlas-unimodular-receiver-classification/v0.1';
  const profiles={};let atlasFailures=0,orbitControls=0,orbitFailures=0,distinctPairs=0,distinctFailures=0;
  for(let n=1;n<=4;n++){
    const Z=atlasMatrix(n),Zi=unitUpperInverse(Z),d=Z.length;
    if(!same(matMul(Z,Zi),identity(d))||!same(matMul(Zi,Z),identity(d))||detBareiss(Z)!==1n)atlasFailures++;
    const classKeys=[];
    for(let variant=0;variant<4;variant++){
      const H=hnfTemplate(d,variant),expectedKey=key(H);classKeys.push(expectedKey);
      if(!hnfConditions(H)||!same(rowHnfFullRank(H),H))orbitFailures++;
      for(let uVariant=0;uVariant<4;uVariant++){
        orbitControls++;
        const U=unimodularBasis(d,uVariant),B=matMul(U,H),A=matMul(B,Z),c=atlasClassifyHnfOutputBasis(A,Z,Zi);
        if(abs(detBareiss(U))!==1n||!c.valid||c.output_basis_class_key!==expectedKey||c.hnf_determinant!==abs(detBareiss(H)).toString())orbitFailures++;
      }
    }
    for(let i=0;i<classKeys.length;i++)for(let j=i+1;j<classKeys.length;j++){distinctPairs++;if(classKeys[i]===classKeys[j])distinctFailures++;}
    profiles[n]=freeze({dimension:d,templates:4,left_transforms_per_template:4,orbit_controls:16,distinct_template_pairs:6});
  }
  const Z3=atlasMatrix(2),Zi3=unitUpperInverse(Z3);
  const H1=[[1n,0n,0n],[0n,2n,0n],[0n,0n,2n]],H2=[[1n,0n,0n],[0n,1n,0n],[0n,0n,4n]];
  const c1=atlasClassifyHnfOutputBasis(matMul(H1,Z3),Z3,Zi3),c2=atlasClassifyHnfOutputBasis(matMul(H2,Z3),Z3,Zi3);
  const sameIndexDifferentHnf=c1.valid&&c2.valid&&c1.lattice_index==='4'&&c2.lattice_index==='4'&&c1.output_basis_class_key!==c2.output_basis_class_key;
  const exact=parentExact&&atlasFailures===0&&orbitControls===64&&orbitFailures===0&&distinctPairs===24&&distinctFailures===0&&sameIndexDifferentHnf;
  cached=freeze({
    schema:ATLAS_HNF_OUTPUT_BASIS_CLASSIFICATION_SCHEMA,
    parent_receipt:ATLAS_HNF_OUTPUT_BASIS_CLASSIFICATION_PARENT_RECEIPT,
    parent_exact:parentExact,
    profiles:freeze(profiles),
    atlas_transform_failures:atlasFailures,
    exact_orbit_controls:orbitControls,
    exact_orbit_failures:orbitFailures,
    distinct_template_pair_controls:distinctPairs,
    distinct_template_pair_failures:distinctFailures,
    same_index_different_hnf_control:freeze({index:4,passed:sameIndexDifferentHnf,class_1:c1.output_basis_class_key,class_2:c2.output_basis_class_key}),
    laws:freeze({
      relative_matrix_formula:'B_A = A Z_n^{-1}',
      output_basis_action:'B_(UA) = U B_A',
      row_hnf_complete_for_left_GLZ_orbits:true,
      equivalent_iff_equal_row_hnf:true,
      atlas_is_identity_hnf_class:true,
      determinant_index_is_not_complete_orbit_invariant:true,
      smith_normal_form_claimed:false,
      input_basis_change_claimed:false,
      nonlinear_receiver_classification_claimed:false,
    }),
    membranes:freeze([
      'HNF_OUTPUT_BASIS_CLASSIFICATION != INPUT_SUPPORT_RELABELING',
      'HNF_OUTPUT_BASIS_CLASSIFICATION != SMITH_NORMAL_FORM_CLASSIFICATION',
      'LEFT_GL_Z_EQUIVALENCE != LEFT_RIGHT_GL_Z_EQUIVALENCE',
      'SAME_DETERMINANT_INDEX != SAME_OUTPUT_BASIS_CLASS',
      'CANONICAL_HNF != UNIQUE_ENCODING',
      'INTEGER_LATTICE_CLASSIFICATION != SHANNON_INFORMATION',
      'HNF_CLASSIFICATION != ARBITRARY_NONLINEAR_RECEIVER_CLASSIFICATION',
      'METALLURGICAL_REFINEMENT_METAPHOR != MATHEMATICAL_PROOF',
      'ATLAS_REGISTRATION != LIVE_RUNTIME_STATE',
    ]),
    passed:exact,
  });
  return cached;
}

export const ATLAS_HNF_OUTPUT_BASIS_CLASSIFICATION_CERTIFICATE=atlasHnfOutputBasisClassificationCertificate();
