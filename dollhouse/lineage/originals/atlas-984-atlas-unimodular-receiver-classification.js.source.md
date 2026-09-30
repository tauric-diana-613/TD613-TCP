import {
  ATLAS_MINIMAL_ADDITIVE_RECEIVER_RANK_SCHEMA,
  atlasMinimalAdditiveReceiverRankCertificate,
} from './atlas-minimal-additive-receiver-rank.js';

export const ATLAS_UNIMODULAR_RECEIVER_CLASSIFICATION_SCHEMA='td613.dome-world.atlas-unimodular-receiver-classification/v0.1';
export const ATLAS_UNIMODULAR_RECEIVER_CLASSIFICATION_PARENT_RECEIPT='c20ee814c02f5779b80560b229078b89e703dfae';

let cached=null;
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const popcount=x=>{let c=0;while(x){c+=x&1;x>>>=1;}return c;};
const contains=(sup,sub)=>(sup&sub)===sub;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const identity=n=>Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?1:0));

function supports(n){const xs=[];for(let m=1;m<(1<<n);m++)xs.push(m);xs.sort((a,b)=>popcount(a)-popcount(b)||a-b);return xs;}
function atlasMatrix(n){
  const ss=supports(n);
  return ss.map((S,i)=>ss.map((T,j)=>popcount(S)<=2?(contains(T,S)?1:0):(i===j?1:0)));
}
function detBareiss(A){
  if(A.length===0)return 1n;
  const M=A.map(r=>r.map(BigInt));let sign=1n,prev=1n,n=M.length;
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
function matMul(A,B){return A.map(r=>B[0].map((_,j)=>r.reduce((s,x,k)=>s+x*B[k][j],0)));}
function matVec(A,v){return A.map(r=>r.reduce((s,x,j)=>s+x*v[j],0));}
function unitUpperInverse(A){
  const n=A.length,I=identity(n),X=Array.from({length:n},()=>Array(n).fill(0));
  for(let col=0;col<n;col++){
    const x=Array(n).fill(0);
    for(let i=n-1;i>=0;i--){
      let rhs=I[i][col];for(let k=i+1;k<n;k++)rhs-=A[i][k]*x[k];
      if(A[i][i]!==1)throw new Error('expected unit upper triangular matrix');
      x[i]=rhs;
    }
    for(let i=0;i<n;i++)X[i][col]=x[i];
  }
  return X;
}
function unimodularBasis(d,variant){
  const U=identity(d);
  if(d===1){if(variant%2)U[0][0]=-1;return U;}
  const swap=(variant%(d-1))+1;[U[0],U[swap]]=[U[swap],U[0]];
  const neg=variant%d;for(let j=0;j<d;j++)U[neg][j]*=-1;
  const target=(variant+1)%d,source=(target+1)%d,q=(variant%3)+1;
  for(let j=0;j<d;j++)U[target][j]+=q*U[source][j];
  return U;
}
function properSublattice(Z,k){return Z.map((r,i)=>i===0?r.map(x=>k*x):[...r]);}
function singularControl(Z){return Z.map((r,i)=>i===0?r.map(()=>0):[...r]);}
function splitKernel(z){return {positive:z.map(x=>x>0?x:0),negative:z.map(x=>x<0?-x:0)};}

export function atlasClassifyMinimalIntegerReceiver(A,Z,Zinv){
  const d=Z.length;
  if(A.length!==d||A.some(r=>r.length!==d))return freeze({valid:false,reason:'dimension mismatch'});
  const det=Number(detBareiss(A)),injective=det!==0,latticeSurjective=Math.abs(det)===1;
  const U=matMul(A,Zinv),detU=Number(detBareiss(U));
  const reconstructs=same(matMul(U,Z),A);
  const atlasEquivalent=latticeSurjective&&Math.abs(detU)===1&&reconstructs;
  return freeze({
    valid:true,
    determinant:det,
    injective_on_support_module:injective,
    lattice_surjective:latticeSurjective,
    lattice_index:injective?Math.abs(det):null,
    recovered_output_basis_change:freeze(U.map(r=>freeze(r))),
    recovered_output_basis_determinant:detU,
    atlas_integer_output_basis_equivalent:atlasEquivalent,
    reconstruction_exact:reconstructs,
  });
}

export function atlasUnimodularReceiverClassificationCertificate(){
  if(cached)return cached;
  const parent=atlasMinimalAdditiveReceiverRankCertificate();
  const parentExact=parent.passed===true&&ATLAS_MINIMAL_ADDITIVE_RECEIVER_RANK_SCHEMA==='td613.dome-world.atlas-minimal-additive-receiver-rank/v0.1';
  const profiles={};let atlasFailures=0,unimodularControls=0,unimodularFailures=0,properControls=0,properFailures=0,singularControls=0,singularFailures=0;
  for(let n=1;n<=5;n++){
    const Z=atlasMatrix(n),Zinv=unitUpperInverse(Z),d=Z.length,detZ=Number(detBareiss(Z));
    if(detZ!==1||!same(matMul(Z,Zinv),identity(d))||!same(matMul(Zinv,Z),identity(d)))atlasFailures++;
    profiles[n]=freeze({dimension:d,atlas_determinant:detZ,inverse_integer_exact:true});
    for(let variant=0;variant<6;variant++){
      unimodularControls++;
      const U=unimodularBasis(d,variant),detU=Number(detBareiss(U)),A=matMul(U,Z),c=atlasClassifyMinimalIntegerReceiver(A,Z,Zinv);
      if(Math.abs(detU)!==1||Math.abs(c.determinant)!==1||!c.injective_on_support_module||!c.lattice_surjective||!c.atlas_integer_output_basis_equivalent||!same(c.recovered_output_basis_change,U))unimodularFailures++;
    }
    for(const k of [2,3,5,7]){
      properControls++;
      const A=properSublattice(Z,k),c=atlasClassifyMinimalIntegerReceiver(A,Z,Zinv);
      if(c.determinant!==k||!c.injective_on_support_module||c.lattice_surjective||c.atlas_integer_output_basis_equivalent||c.lattice_index!==k)properFailures++;
    }
    singularControls++;
    const S=singularControl(Z),cS=atlasClassifyMinimalIntegerReceiver(S,Z,Zinv);
    const kernel=Zinv.map(r=>r[0]),{positive,negative}=splitKernel(kernel);
    const collision=!same(positive,negative)&&same(matVec(S,positive),matVec(S,negative));
    if(cS.determinant!==0||cS.injective_on_support_module||cS.lattice_surjective||cS.atlas_integer_output_basis_equivalent||!collision)singularFailures++;
  }
  const exact=parentExact&&atlasFailures===0&&unimodularControls===30&&unimodularFailures===0&&properControls===20&&properFailures===0&&singularControls===5&&singularFailures===0;
  cached=freeze({
    schema:ATLAS_UNIMODULAR_RECEIVER_CLASSIFICATION_SCHEMA,
    parent_receipt:ATLAS_UNIMODULAR_RECEIVER_CLASSIFICATION_PARENT_RECEIPT,
    parent_exact:parentExact,
    profiles:freeze(profiles),
    atlas_inverse_failures:atlasFailures,
    unimodular_orbit_controls:unimodularControls,
    unimodular_orbit_failures:unimodularFailures,
    proper_sublattice_controls:properControls,
    proper_sublattice_failures:properFailures,
    singular_square_controls:singularControls,
    singular_square_failures:singularFailures,
    laws:freeze({
      minimal_rank_injective_iff_nonzero_determinant:true,
      lattice_surjective_iff_absolute_determinant_one:true,
      atlas_output_basis_equivalent_iff_unimodular:true,
      unimodular_receivers_single_left_GLZ_orbit:true,
      full_rank_nonunimodular_can_remain_state_injective:true,
      unique_encoding_claimed:false,
      nonlinear_equivalence_claimed:false,
      universal_compression_claimed:false,
    }),
    membranes:freeze([
      'GL_Z_ORBIT_UNIQUENESS != UNIQUE_ENCODING',
      'UNIMODULAR_EQUIVALENCE != ARBITRARY_NONLINEAR_EQUIVALENCE',
      'LATTICE_SURJECTIVE != REQUIRED_FOR_STATE_INJECTIVITY',
      'DETERMINANT_INDEX != SHANNON_INFORMATION',
      'PROPER_SUBLATTICE != INFORMATION_LOSS_ON_VALID_IMAGE',
      'OUTPUT_BASIS_EQUIVALENCE != INPUT_RELABELING_EQUIVALENCE',
      'MINIMAL_ADDITIVE_CLASSIFICATION != UNIVERSAL_COMPRESSION_THEOREM',
      'ATLAS_REGISTRATION != LIVE_RUNTIME_STATE',
    ]),
    passed:exact,
  });
  return cached;
}

export const ATLAS_UNIMODULAR_RECEIVER_CLASSIFICATION_CERTIFICATE=atlasUnimodularReceiverClassificationCertificate();
