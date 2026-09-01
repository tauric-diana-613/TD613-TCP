import {
  ATLAS_HNF_SCHUBERT_DIGIT_BIJECTION_SCHEMA,
  atlasHnfSchubertDigitBijectionCertificate,
  atlasHnfToGrassmannianPoint,
} from './atlas-hnf-schubert-digit-bijection.js';
import {atlasGaussianBinomialPrimePower} from './atlas-prime-power-gaussian-binomial.js';

export const ATLAS_SCHUBERT_GRADED_CELL_DECOMPOSITION_SCHEMA='td613.dome-world.atlas-schubert-graded-cell-decomposition/v0.1';
export const ATLAS_SCHUBERT_GRADED_CELL_DECOMPOSITION_PARENT_RECEIPT='0372405b055bcdff990f715cc65eed9354b2a4a0';

let cached=null;
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const sameArray=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);

function validateDK(d,k){
  if(!Number.isInteger(d)||d<1||!Number.isInteger(k)||k<0)throw new Error('requires integer d>=1 and k>=0');
}
function compositions(k,d){
  validateDK(d,k);const out=[];
  function rec(j,rem,prefix){if(j===d-1){out.push([...prefix,rem]);return;}for(let e=0;e<=rem;e++)rec(j+1,rem-e,[...prefix,e]);}
  rec(0,k,[]);return out;
}
function validateExponents(e,expectedK=null){
  if(!Array.isArray(e)||e.length<1||e.some(x=>!Number.isInteger(x)||x<0))throw new Error('requires nonempty nonnegative integer exponent vector');
  const k=e.reduce((a,b)=>a+b,0);
  if(expectedK!==null&&k!==expectedK)throw new Error('exponent sum mismatch');
  return {d:e.length,k};
}

export function atlasSchubertCellDimension(exponents,expectedK=null){
  validateExponents(exponents,expectedK);
  return exponents.reduce((m,e,j)=>m+j*e,0);
}

export function atlasSchubertCompositionPolynomial(d,k){
  validateDK(d,k);const coeff=Array(k*(d-1)+1).fill(0n);
  for(const e of compositions(k,d))coeff[atlasSchubertCellDimension(e,k)]++;
  return coeff.map(String);
}

const trim=a=>{let n=a.length;while(n>1&&a[n-1]===0n)n--;return a.slice(0,n);};
const add=(a,b)=>{const c=Array(Math.max(a.length,b.length)).fill(0n);for(let i=0;i<c.length;i++)c[i]=(a[i]??0n)+(b[i]??0n);return trim(c);};
const shift=(a,s)=>Array(s).fill(0n).concat(a);
const polyMemo=new Map();
export function atlasGaussianPolynomial(d,k){
  validateDK(d,k);const key=`${d}:${k}`;if(polyMemo.has(key))return [...polyMemo.get(key)];
  let value;
  if(k===0||d===1)value=[1n];
  else value=add(atlasGaussianPolynomial(d-1,k).map(BigInt),shift(atlasGaussianPolynomial(d,k-1).map(BigInt),d-1));
  value=trim(value);polyMemo.set(key,value);return value.map(String);
}
export function atlasEvaluatePolynomial(coeff,q){
  q=BigInt(q);if(q<0n)throw new Error('requires q>=0');let value=0n,power=1n;
  for(const c of coeff){value+=BigInt(c)*power;power*=q;}
  return value.toString();
}

function enumerateHnfs(d,p,k,visit){
  const P=BigInt(p);
  for(const e of compositions(k,d)){
    const H=Array.from({length:d},()=>Array(d).fill(0n));
    for(let j=0;j<d;j++)H[j][j]=P**BigInt(e[j]);
    const vars=[];for(let j=0;j<d;j++)for(let r=0;r<j;r++)vars.push([r,j,P**BigInt(e[j])]);
    function rec(v){
      if(v===vars.length){visit(H.map(r=>[...r]),e);return;}
      const [r,j,limit]=vars[v];for(let x=0n;x<limit;x++){H[r][j]=x;rec(v+1);}H[r][j]=0n;
    }
    rec(0);
  }
}
function pointFreeDimension(point){
  const pivots=point.pivot_positions,pivotSet=new Set(pivots);let dim=0;
  for(const pivot of pivots)for(let c=0;c<pivot;c++)if(!pivotSet.has(c))dim++;
  return dim;
}

export function atlasSchubertGradedCellDecompositionCertificate(){
  if(cached)return cached;
  const parent=atlasHnfSchubertDigitBijectionCertificate();
  const parentExact=parent.passed===true&&ATLAS_HNF_SCHUBERT_DIGIT_BIJECTION_SCHEMA==='td613.dome-world.atlas-hnf-schubert-digit-bijection/v0.1';

  let formalControls=0,formalFailures=0,primeControls=0,primeFailures=0;
  const formalProfiles={};
  for(let d=1;d<=7;d++)for(let k=0;k<=5;k++){
    formalControls++;
    const c=atlasSchubertCompositionPolynomial(d,k),g=atlasGaussianPolynomial(d,k);
    if(!sameArray(c,g))formalFailures++;
    formalProfiles[`d${d}k${k}`]=freeze([...c]);
    for(const p of [2,3,5,7]){
      primeControls++;
      if(atlasEvaluatePolynomial(c,p)!==atlasGaussianBinomialPrimePower(d,k,p))primeFailures++;
    }
  }

  let exhaustiveCells=0,exhaustivePoints=0,coordinateFailures=0,stratumFailures=0,collisionFailures=0,countFailures=0;
  const exhaustiveProfiles={};
  for(const [p,maxD] of [[2,4],[3,3]])for(let d=1;d<=maxD;d++)for(let k=0;k<=3;k++){
    exhaustiveCells++;let count=0;const pointKeys=new Set(),strata=new Map();
    enumerateHnfs(d,p,k,(H,e)=>{
      count++;exhaustivePoints++;
      const g=atlasHnfToGrassmannianPoint(H,p),m=atlasSchubertCellDimension(e,k),ek=e.join(',');
      strata.set(ek,(strata.get(ek)??0)+1);
      if(!g.valid||!sameArray(g.exponents,e)||pointFreeDimension(g)!==m)coordinateFailures++;
      if(g.valid){if(pointKeys.has(g.point_key))collisionFailures++;pointKeys.add(g.point_key);}
    });
    for(const e of compositions(k,d)){
      const expected=Number(BigInt(p)**BigInt(atlasSchubertCellDimension(e,k)));
      if((strata.get(e.join(','))??0)!==expected)stratumFailures++;
    }
    const expected=Number(atlasGaussianBinomialPrimePower(d,k,p));
    if(count!==expected||pointKeys.size!==expected)countFailures++;
    exhaustiveProfiles[`p${p}d${d}k${k}`]=freeze({count,expected,strata:strata.size});
  }

  const anchorHistogram=atlasSchubertCompositionPolynomial(7,3).map(Number);
  const expectedHistogram=[1,1,2,3,4,5,7,7,8,8,8,7,7,5,4,3,2,1,1];
  const anchorPass=sameArray(anchorHistogram,expectedHistogram)&&anchorHistogram.reduce((a,b)=>a+b,0)===84&&anchorHistogram.length-1===18&&atlasEvaluatePolynomial(anchorHistogram,2)==='788035';
  const flagDependence=atlasSchubertCellDimension([3,0,0,0,0,0,0],3)===0&&atlasSchubertCellDimension([0,0,0,0,0,0,3],3)===18;
  const compositeArithmetic=atlasEvaluatePolynomial(atlasSchubertCompositionPolynomial(3,2),4);

  const exact=parentExact&&formalControls===42&&formalFailures===0&&primeControls===168&&primeFailures===0&&exhaustiveCells===28&&exhaustivePoints===3210&&coordinateFailures===0&&stratumFailures===0&&collisionFailures===0&&countFailures===0&&anchorPass&&flagDependence;
  cached=freeze({
    schema:ATLAS_SCHUBERT_GRADED_CELL_DECOMPOSITION_SCHEMA,
    parent_receipt:ATLAS_SCHUBERT_GRADED_CELL_DECOMPOSITION_PARENT_RECEIPT,
    parent_exact:parentExact,
    formal_polynomial_controls:formalControls,
    formal_polynomial_failures:formalFailures,
    prime_evaluation_controls:primeControls,
    prime_evaluation_failures:primeFailures,
    exhaustive_cells:exhaustiveCells,
    exhaustive_hnf_points:exhaustivePoints,
    coordinate_dimension_failures:coordinateFailures,
    stratum_cardinality_failures:stratumFailures,
    image_collision_failures:collisionFailures,
    exhaustive_count_failures:countFailures,
    formal_profiles:freeze(formalProfiles),
    exhaustive_profiles:freeze(exhaustiveProfiles),
    anchor:freeze({d:7,k:3,degree:18,composition_count:84,histogram:freeze(anchorHistogram),evaluation_p2:'788035',passed:anchorPass}),
    hostile_controls:freeze({standard_flag_dependence:flagDependence,composite_q_arithmetic_value:compositeArithmetic,finite_field_realization_at_composite_q_claimed:false}),
    laws:freeze({
      cell_dimension:'m(e)=sum_(j=1)^d (j-1)e_j',
      fixed_exponent_stratum_cardinality:'|H_e(p)|=p^m(e)',
      formal_polynomial:'sum_{e_1+...+e_d=k} q^m(e)=GaussianBinomial(d+k-1,k;q)',
      generating_function:'sum_{k>=0} P_(d,k)(q)t^k=product_{j=0}^{d-1}(1-q^j t)^(-1)',
      recurrence:'P_(d,k)=P_(d-1,k)+q^(d-1)P_(d,k-1)',
      bruhat_closure_order_claimed:false,
      basis_free_geometry_claimed:false,
      asymptotic_claimed:false,
    }),
    membranes:freeze([
      'FORMAL_Q != FIELD_PRIME_P',
      'SCHUBERT_CELL_DIMENSION != PHYSICAL_DIMENSION',
      'HNF_EXPONENT_STRATUM != ATLAS_SUPPORT_STRATUM',
      'CELL_DECOMPOSITION != BRUHAT_CLOSURE_ORDER',
      'AFFINE_COORDINATE_CHART != BASIS_FREE_CANONICAL_GEOMETRY',
      'STANDARD_FLAG_DEPENDENCE != CANONICALITY',
      'GAUSSIAN_POLYNOMIAL != ASYMPTOTIC_LIMIT',
      'FINITE_GEOMETRY != PHYSICAL_GEOMETRY',
      'POLYNOMIAL_EVALUATION_AT_COMPOSITE_Q != FINITE_FIELD_REALIZATION',
      'SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY',
      'ATLAS_REGISTRATION != LIVE_RUNTIME_STATE',
    ]),
    passed:exact,
  });
  return cached;
}

export const ATLAS_SCHUBERT_GRADED_CELL_DECOMPOSITION_CERTIFICATE=atlasSchubertGradedCellDecompositionCertificate();
