import {
  ATLAS_PRIME_POWER_GAUSSIAN_BINOMIAL_SCHEMA,
  atlasGaussianBinomialPrimePower,
  atlasPrimePowerGaussianBinomialCertificate,
} from './atlas-prime-power-gaussian-binomial.js';

export const ATLAS_HNF_SCHUBERT_DIGIT_BIJECTION_SCHEMA='td613.dome-world.atlas-hnf-schubert-digit-bijection/v0.1';
export const ATLAS_HNF_SCHUBERT_DIGIT_BIJECTION_PARENT_RECEIPT='879f68feb64214259f10b70cc194eb43f659ff55';

let cached=null;
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const clone=A=>A.map(r=>r.map(x=>BigInt(x)));
const out=A=>A.map(r=>r.map(String));
const same=(A,B)=>A.length===B.length&&A.every((r,i)=>r.length===B[i].length&&r.every((x,j)=>BigInt(x)===BigInt(B[i][j])));
const identity=n=>Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?1n:0n));

function isPrimeNumber(p){
  if(!Number.isInteger(p)||p<2)return false;
  for(let q=2;q*q<=p;q++)if(p%q===0)return false;
  return true;
}
function validatePrime(p){p=Number(p);if(!isPrimeNumber(p))throw new Error('requires prime p');return p;}
function pExponent(x,p){
  x=BigInt(x);const P=BigInt(p);if(x<1n)return -1;
  let e=0;while(x%P===0n){x/=P;e++;}
  return x===1n?e:-1;
}
function analyzeHnf(H,p){
  p=validatePrime(p);const M=clone(H),d=M.length;
  if(d<1||M.some(r=>r.length!==d))return {valid:false,reason:'requires nonempty square HNF'};
  const e=[];let k=0;
  for(let j=0;j<d;j++){
    const ej=pExponent(M[j][j],p);if(ej<0)return {valid:false,reason:'diagonal is not a positive p-power'};
    e.push(ej);k+=ej;
    for(let r=j+1;r<d;r++)if(M[r][j]!==0n)return {valid:false,reason:'entries below HNF diagonal must be zero'};
    for(let r=0;r<j;r++)if(M[r][j]<0n||M[r][j]>=M[j][j])return {valid:false,reason:'HNF residue outside pivot range'};
  }
  return {valid:true,matrix:M,d,e,k,p};
}
function pivotWordFromExponents(e){
  const word=[];
  for(let j=0;j<e.length;j++){
    for(let t=0;t<e[j];t++)word.push(1);
    if(j<e.length-1)word.push(0);
  }
  return word;
}
function pointKey(point){return `${point.n}|${point.pivot_word.join('')}|${point.reverse_rref.map(r=>r.join(',')).join(';')}`;}

export function atlasHnfToGrassmannianPoint(H,p){
  const a=analyzeHnf(H,p);if(!a.valid)return freeze(a);
  const {matrix:M,d,e,k}=a,P=BigInt(a.p),word=pivotWordFromExponents(e),n=word.length;
  const pivots=[],nonpivots=[];word.forEach((b,i)=>(b?pivots:nonpivots).push(i));
  const R=Array.from({length:k},()=>Array(n).fill(0n));
  let row=0;
  for(let j=0;j<d;j++)for(let t=0;t<e[j];t++){
    const pivot=pivots[row];R[row][pivot]=1n;
    const place=P**BigInt(t);
    for(let r=0;r<j;r++)R[row][nonpivots[r]]=(M[r][j]/place)%P;
    row++;
  }
  const point=freeze({
    valid:true,
    p:a.p,d,k,n,
    exponents:freeze([...e]),
    pivot_word:freeze([...word]),
    pivot_positions:freeze([...pivots]),
    reverse_rref:freeze(out(R).map(freeze)),
  });
  return freeze({...point,point_key:pointKey(point)});
}

export function atlasGrassmannianPointToHnf(point,p){
  p=validatePrime(p);const P=BigInt(p);
  if(!point||typeof point!=='object'||!Array.isArray(point.reverse_rref))return freeze({valid:false,reason:'point requires reverse_rref matrix'});
  const R=point.reverse_rref.map(r=>r.map(BigInt)),k=R.length;
  const n=k>0?R[0].length:Number(point.n);
  if(!Number.isInteger(n)||n<k||R.some(r=>r.length!==n))return freeze({valid:false,reason:'invalid Grassmannian matrix dimensions'});
  if(R.some(r=>r.some(x=>x<0n||x>=P)))return freeze({valid:false,reason:'field coordinate outside F_p representative range'});
  const pivots=[];
  for(let i=0;i<k;i++){
    let pivot=-1;for(let c=n-1;c>=0;c--)if(R[i][c]!==0n){pivot=c;break;}
    if(pivot<0||R[i][pivot]!==1n)return freeze({valid:false,reason:'reverse-RREF row lacks unit rightmost pivot'});
    if(i>0&&pivot<=pivots[i-1])return freeze({valid:false,reason:'reverse-RREF pivots must increase'});
    pivots.push(pivot);
  }
  for(let i=0;i<k;i++)for(let r=0;r<k;r++)if(R[r][pivots[i]]!==(r===i?1n:0n))return freeze({valid:false,reason:'pivot columns must form identity'});
  const pivotSet=new Set(pivots),nonpivots=[];for(let c=0;c<n;c++)if(!pivotSet.has(c))nonpivots.push(c);
  const d=nonpivots.length+1;if(n!==k+d-1||d<1)return freeze({valid:false,reason:'stars-and-bars dimension mismatch'});
  const rowsByBlock=Array.from({length:d},()=>[]);let block=0,pivotRow=0;
  for(let c=0;c<n;c++){
    if(pivotSet.has(c)){rowsByBlock[block].push(pivotRow);pivotRow++;}
    else block++;
  }
  if(block!==d-1||pivotRow!==k)return freeze({valid:false,reason:'pivot word decomposition failed'});
  const e=rowsByBlock.map(xs=>xs.length),H=Array.from({length:d},()=>Array(d).fill(0n));
  for(let j=0;j<d;j++){
    H[j][j]=P**BigInt(e[j]);
    for(let r=0;r<j;r++){
      let value=0n,place=1n;
      for(const row of rowsByBlock[j]){value+=R[row][nonpivots[r]]*place;place*=P;}
      H[r][j]=value;
    }
  }
  const fwd=atlasHnfToGrassmannianPoint(H,p);
  const inputPoint={n,pivot_word:Array.from({length:n},(_,c)=>pivotSet.has(c)?1:0),reverse_rref:out(R)};
  if(!fwd.valid||pointKey(fwd)!==pointKey(inputPoint))return freeze({valid:false,reason:'matrix is not canonical reverse-RREF for the fixed standard flag'});
  return freeze({valid:true,p,d,k,exponents:freeze(e),hnf:freeze(out(H).map(freeze)),hnf_key:out(H).map(r=>r.join(',')).join(';')});
}

function compositions(k,d){
  const ans=[];
  function rec(j,rem,prefix){if(j===d-1){ans.push([...prefix,rem]);return;}for(let e=0;e<=rem;e++)rec(j+1,rem-e,[...prefix,e]);}
  rec(0,k,[]);return ans;
}
function enumerateHnfs(d,p,k,visit){
  const P=BigInt(p);
  for(const e of compositions(k,d)){
    const H=Array.from({length:d},()=>Array(d).fill(0n));
    for(let j=0;j<d;j++)H[j][j]=P**BigInt(e[j]);
    const vars=[];for(let j=0;j<d;j++)for(let r=0;r<j;r++)vars.push([r,j,P**BigInt(e[j])]);
    function rec(v){
      if(v===vars.length){visit(H.map(r=>[...r]));return;}
      const [r,j,limit]=vars[v];for(let x=0n;x<limit;x++){H[r][j]=x;rec(v+1);}H[r][j]=0n;
    }
    rec(0);
  }
}
function modKey(H,p){const P=BigInt(p);return H.map(r=>r.map(x=>((BigInt(x)%P)+P)%P).join(',')).join(';');}

export function atlasHnfSchubertDigitBijectionCertificate(){
  if(cached)return cached;
  const parent=atlasPrimePowerGaussianBinomialCertificate();
  const parentExact=parent.passed===true&&ATLAS_PRIME_POWER_GAUSSIAN_BINOMIAL_SCHEMA==='td613.dome-world.atlas-prime-power-gaussian-binomial/v0.1';
  let cells=0,points=0,roundtripFailures=0,countFailures=0,collisionFailures=0;
  const profiles={};
  for(const [p,maxD] of [[2,4],[3,3]])for(let d=1;d<=maxD;d++)for(let k=0;k<=3;k++){
    cells++;let count=0;const keys=new Set();
    enumerateHnfs(d,p,k,H=>{
      count++;points++;
      const g=atlasHnfToGrassmannianPoint(H,p);if(!g.valid){roundtripFailures++;return;}
      const back=atlasGrassmannianPointToHnf(g,p);if(!back.valid||!same(H,back.hnf))roundtripFailures++;
      if(keys.has(g.point_key))collisionFailures++;keys.add(g.point_key);
    });
    const expected=Number(atlasGaussianBinomialPrimePower(d,k,p));
    if(count!==expected||keys.size!==expected)countFailures++;
    profiles[`p${p}d${d}k${k}`]=freeze({count,expected,unique_images:keys.size});
  }
  const H0=[[1n,0n],[0n,4n]],H2=[[1n,2n],[0n,4n]],g0=atlasHnfToGrassmannianPoint(H0,2),g2=atlasHnfToGrassmannianPoint(H2,2);
  const nonNaive=modKey(H0,2)===modKey(H2,2)&&g0.valid&&g2.valid&&g0.point_key!==g2.point_key;
  const A=identity(7);A[6][6]=8n;for(let r=0;r<6;r++)A[r][6]=BigInt(r+1);
  const anchor=atlasHnfToGrassmannianPoint(A,2),anchorBack=anchor.valid?atlasGrassmannianPointToHnf(anchor,2):{valid:false};
  const anchorPass=anchor.valid&&anchor.k===3&&anchor.n===9&&anchorBack.valid&&same(A,anchorBack.hnf)&&atlasGaussianBinomialPrimePower(7,3,2)==='788035';
  const exact=parentExact&&cells===28&&points===3210&&roundtripFailures===0&&countFailures===0&&collisionFailures===0&&nonNaive&&anchorPass;
  cached=freeze({
    schema:ATLAS_HNF_SCHUBERT_DIGIT_BIJECTION_SCHEMA,
    parent_receipt:ATLAS_HNF_SCHUBERT_DIGIT_BIJECTION_PARENT_RECEIPT,
    parent_exact:parentExact,
    exhaustive_cells:cells,
    exhaustive_points:points,
    roundtrip_failures:roundtripFailures,
    count_failures:countFailures,
    image_collision_failures:collisionFailures,
    profiles:freeze(profiles),
    non_naive_mod_p_control:freeze({passed:nonNaive,same_mod_p:modKey(H0,2)===modKey(H2,2),distinct_points:g0.point_key!==g2.point_key}),
    anchor:freeze({p:2,d:7,k:3,grassmannian_count:'788035',passed:anchorPass}),
    laws:freeze({
      explicit_coordinate_relative_bijection:true,
      weak_composition_to_pivot_word:'1^e1 0 1^e2 0 ... 0 1^ed',
      hnf_residue_digits_fill_opposite_schubert_coordinates:true,
      inverse_recovers_exponents_and_integer_residues:true,
      basis_free_canonical_claimed:false,
      functorial_natural_claimed:false,
      naive_mod_p_reduction_claimed:false,
      global_composite_index_bijection_claimed:false,
    }),
    membranes:freeze([
      'EXPLICIT_COORDINATE_RELATIVE_BIJECTION != BASIS_FREE_CANONICAL_EQUIVALENCE',
      'SET_BIJECTION != FUNCTORIAL_OR_NATURAL_EQUIVALENCE',
      'GRASSMANNIAN_POINT != PHYSICAL_RECEIVER',
      'HNF_DIGITIZATION != NAIVE_MOD_P_REDUCTION',
      'SCHUBERT_CELL_COORDINATES != INPUT_OUTPUT_DUALITY',
      'STANDARD_FLAG_DEPENDENCE != CANONICALITY',
      'PRIME_POWER_LOCAL_BIJECTION != GLOBAL_COMPOSITE_INDEX_BIJECTION',
      'FINITE_FIELD_REALIZATION_OF_ORBIT_LABELS != FINITE_FIELD_REALIZATION_OF_RECEIVER_DYNAMICS',
      'METALLURGICAL_OR_ALCHEMICAL_RESONANCE != PROOF',
      'ATLAS_REGISTRATION != LIVE_RUNTIME_STATE',
    ]),
    passed:exact,
  });
  return cached;
}

export const ATLAS_HNF_SCHUBERT_DIGIT_BIJECTION_CERTIFICATE=atlasHnfSchubertDigitBijectionCertificate();
