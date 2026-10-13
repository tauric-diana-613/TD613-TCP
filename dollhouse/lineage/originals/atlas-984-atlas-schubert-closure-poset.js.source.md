import {
  ATLAS_SCHUBERT_GRADED_CELL_DECOMPOSITION_SCHEMA,
  atlasSchubertCellDimension,
  atlasSchubertGradedCellDecompositionCertificate,
} from './atlas-schubert-graded-cell-decomposition.js';

export const ATLAS_SCHUBERT_CLOSURE_POSET_SCHEMA='td613.dome-world.atlas-schubert-closure-poset/v0.1';
export const ATLAS_SCHUBERT_CLOSURE_POSET_PARENT_RECEIPT='d19d4f8d48c10df624f9c0574aeee9c687cfb4af';

let cached=null;
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const sameArray=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);

function validateDK(d,k){
  if(!Number.isInteger(d)||d<1||!Number.isInteger(k)||k<0)throw new Error('requires integer d>=1 and k>=0');
}
function validateComposition(e,expectedK=null){
  if(!Array.isArray(e)||e.length<1||e.some(x=>!Number.isInteger(x)||x<0))throw new Error('requires nonempty nonnegative integer weak composition');
  const k=e.reduce((a,b)=>a+b,0);
  if(expectedK!==null&&k!==expectedK)throw new Error('composition sum mismatch');
  return {d:e.length,k};
}
function validatePair(upper,lower){
  const a=validateComposition(upper),b=validateComposition(lower);
  if(a.d!==b.d||a.k!==b.k)throw new Error('composition shape/sum mismatch');
  return a;
}
function compositions(k,d){
  validateDK(d,k);const out=[];
  function rec(j,rem,prefix){if(j===d-1){out.push([...prefix,rem]);return;}for(let e=0;e<=rem;e++)rec(j+1,rem-e,[...prefix,e]);}
  rec(0,k,[]);return out;
}

export function atlasSchubertPivotWord(exponents){
  validateComposition(exponents);const word=[];
  for(let j=0;j<exponents.length;j++){
    for(let t=0;t<exponents[j];t++)word.push(1);
    if(j<exponents.length-1)word.push(0);
  }
  return word;
}

export function atlasSchubertPivotPositions(exponents){
  return atlasSchubertPivotWord(exponents).map((b,i)=>b?i:null).filter(i=>i!==null);
}

export function atlasSchubertClosureContains(upper,lower){
  const {d}=validatePair(upper,lower);let U=0,L=0;
  for(let j=0;j<d-1;j++){
    U+=upper[j];L+=lower[j];
    if(L<U)return false;
  }
  return true;
}

export function atlasSchubertPivotClosureContains(upper,lower){
  validatePair(upper,lower);
  const I=atlasSchubertPivotPositions(upper),J=atlasSchubertPivotPositions(lower);
  return I.every((x,r)=>J[r]<=x);
}

export function atlasSchubertComparable(a,b){
  validatePair(a,b);
  return atlasSchubertClosureContains(a,b)||atlasSchubertClosureContains(b,a);
}

export function atlasSchubertCoverContains(upper,lower){
  const {d}=validatePair(upper,lower);
  if(!atlasSchubertClosureContains(upper,lower))return false;
  for(let j=0;j<d-1;j++){
    if(lower[j]<1)continue;
    let ok=true;
    for(let i=0;i<d;i++){
      const expected=i===j?lower[i]-1:i===j+1?lower[i]+1:lower[i];
      if(upper[i]!==expected){ok=false;break;}
    }
    if(ok)return true;
  }
  return false;
}

function isPrimeNumber(p){
  if(!Number.isInteger(p)||p<2)return false;
  for(let q=2;q*q<=p;q++)if(p%q===0)return false;
  return true;
}
function validatePrime(p){p=Number(p);if(!isPrimeNumber(p))throw new Error('requires prime p');return p;}
function mod(x,p){const y=Number(x)%p;return y<0?y+p:y;}
function inverseMod(a,p){a=mod(a,p);for(let x=1;x<p;x++)if((a*x)%p===1)return x;throw new Error('noninvertible field pivot');}
function rankModP(A,p){
  p=validatePrime(p);if(A.length===0)return 0;
  const M=A.map(r=>r.map(x=>mod(x,p))),m=M.length,n=M[0].length;
  if(M.some(r=>r.length!==n))throw new Error('rank matrix rows must have equal length');
  let rank=0;
  for(let c=0;c<n&&rank<m;c++){
    let pivot=rank;while(pivot<m&&M[pivot][c]===0)pivot++;
    if(pivot===m)continue;
    [M[rank],M[pivot]]=[M[pivot],M[rank]];
    const inv=inverseMod(M[rank][c],p);
    for(let j=c;j<n;j++)M[rank][j]=mod(M[rank][j]*inv,p);
    for(let r=0;r<m;r++)if(r!==rank&&M[r][c]!==0){
      const f=M[r][c];for(let j=c;j<n;j++)M[r][j]=mod(M[r][j]-f*M[rank][j],p);
    }
    rank++;
  }
  return rank;
}

function pointInFixedFlagClosure(R,upperPivots,p){
  const k=upperPivots.length;if(k===0)return true;
  if(!Array.isArray(R)||R.length!==k)throw new Error('reverse-RREF point row count mismatch');
  const n=R[0].length;if(R.some(r=>r.length!==n))throw new Error('reverse-RREF point rows must have equal length');
  for(let r=0;r<k;r++){
    const suffix=R.map(row=>row.slice(upperPivots[r]+1));
    const intersectionDimension=k-rankModP(suffix,p);
    if(intersectionDimension<r+1)return false;
  }
  return true;
}

function chooseSubsets(n,k){
  const out=[];
  function rec(start,left,prefix){if(left===0){out.push([...prefix]);return;}for(let x=start;x<=n-left;x++)rec(x+1,left-1,[...prefix,x]);}
  rec(0,k,[]);return out;
}
function compositionFromPivots(pivots,n){
  const pivotSet=new Set(pivots),e=[];let count=0;
  for(let c=0;c<n;c++){
    if(pivotSet.has(c))count++;
    else{e.push(count);count=0;}
  }
  e.push(count);return e;
}
function enumerateReverseRref(d,p,k,visit){
  validateDK(d,k);p=validatePrime(p);const n=d+k-1;
  for(const pivots of chooseSubsets(n,k)){
    const pivotSet=new Set(pivots),R=Array.from({length:k},()=>Array(n).fill(0));
    for(let r=0;r<k;r++)R[r][pivots[r]]=1;
    const free=[];
    for(let r=0;r<k;r++)for(let c=0;c<pivots[r];c++)if(!pivotSet.has(c))free.push([r,c]);
    function rec(v){
      if(v===free.length){visit(R.map(row=>[...row]),[...pivots]);return;}
      const [r,c]=free[v];for(let x=0;x<p;x++){R[r][c]=x;rec(v+1);}R[r][c]=0;
    }
    rec(0);
  }
}

export function atlasSchubertClosurePosetCertificate(){
  if(cached)return cached;
  const parent=atlasSchubertGradedCellDecompositionCertificate();
  const parentExact=parent.passed===true&&ATLAS_SCHUBERT_GRADED_CELL_DECOMPOSITION_SCHEMA==='td613.dome-world.atlas-schubert-graded-cell-decomposition/v0.1';

  let formalCells=0,pairControls=0,relationPairs=0,coverPairs=0,pivotOrderFailures=0,coverFailures=0;
  const formalProfiles={};
  for(let d=1;d<=7;d++)for(let k=0;k<=5;k++){
    formalCells++;const labels=compositions(k,d);let cellRelations=0,cellCovers=0;
    for(const upper of labels)for(const lower of labels){
      pairControls++;
      const cumulative=atlasSchubertClosureContains(upper,lower),pivot=atlasSchubertPivotClosureContains(upper,lower);
      if(cumulative!==pivot)pivotOrderFailures++;
      if(cumulative){relationPairs++;cellRelations++;}
      const cover=atlasSchubertCoverContains(upper,lower),delta=atlasSchubertCellDimension(upper,k)-atlasSchubertCellDimension(lower,k);
      if(cover){coverPairs++;cellCovers++;if(!cumulative||delta!==1)coverFailures++;}
      if(cumulative&&delta===1&&!sameArray(upper,lower)&&!cover)coverFailures++;
    }
    formalProfiles[`d${d}k${k}`]=freeze({labels:labels.length,relations:cellRelations,covers:cellCovers});
  }

  let exhaustiveCells=0,independentPoints=0,rankIncidenceChecks=0,rankIncidenceFailures=0,independentCountFailures=0;
  const exhaustiveProfiles={};
  for(const [p,maxD] of [[2,4],[3,3]])for(let d=1;d<=maxD;d++)for(let k=0;k<=3;k++){
    exhaustiveCells++;const labels=compositions(k,d),upperData=labels.map(e=>({e,pivots:atlasSchubertPivotPositions(e)}));let points=0,checks=0;
    enumerateReverseRref(d,p,k,(R,lowerPivots)=>{
      points++;independentPoints++;const lower=compositionFromPivots(lowerPivots,d+k-1);
      for(const upper of upperData){
        checks++;rankIncidenceChecks++;
        const incidence=pointInFixedFlagClosure(R,upper.pivots,p),atlas=atlasSchubertClosureContains(upper.e,lower);
        if(incidence!==atlas)rankIncidenceFailures++;
      }
    });
    const inherited=parent.exhaustive_profiles[`p${p}d${d}k${k}`]?.count;
    if(points!==inherited)independentCountFailures++;
    exhaustiveProfiles[`p${p}d${d}k${k}`]=freeze({points,expected:inherited,closure_checks:checks});
  }

  const low=[1,0],high=[0,1];
  const orientationPass=atlasSchubertClosureContains(high,low)&&!atlasSchubertClosureContains(low,high)&&atlasSchubertPivotPositions(low)[0]===0&&atlasSchubertPivotPositions(high)[0]===1;
  const equalA=[0,2,0],equalB=[1,0,1];
  const equalDimensionIncomparable=atlasSchubertCellDimension(equalA,2)===atlasSchubertCellDimension(equalB,2)&&!atlasSchubertComparable(equalA,equalB);
  const highIncomparable=[0,3,0],lowIncomparable=[2,0,1];
  const unequalDimensionIncomparable=atlasSchubertCellDimension(highIncomparable,3)>atlasSchubertCellDimension(lowIncomparable,3)&&!atlasSchubertComparable(highIncomparable,lowIncomparable);
  const nonCoverUpper=[0,0,2],nonCoverLower=[2,0,0];
  const nonCoverComparable=atlasSchubertClosureContains(nonCoverUpper,nonCoverLower)&&!atlasSchubertCoverContains(nonCoverUpper,nonCoverLower)&&atlasSchubertCellDimension(nonCoverUpper,2)-atlasSchubertCellDimension(nonCoverLower,2)===4;
  const anchor=formalProfiles.d7k3;
  const anchorPass=anchor.labels===84&&anchor.relations===2520&&anchor.covers===168&&atlasSchubertCellDimension([0,0,0,0,0,0,3],3)===18;

  const exact=parentExact&&formalCells===42&&pairControls===376467&&relationPairs===113828&&coverPairs===3829&&pivotOrderFailures===0&&coverFailures===0&&exhaustiveCells===28&&independentPoints===3210&&rankIncidenceChecks===44517&&rankIncidenceFailures===0&&independentCountFailures===0&&orientationPass&&equalDimensionIncomparable&&unequalDimensionIncomparable&&nonCoverComparable&&anchorPass;
  cached=freeze({
    schema:ATLAS_SCHUBERT_CLOSURE_POSET_SCHEMA,
    parent_receipt:ATLAS_SCHUBERT_CLOSURE_POSET_PARENT_RECEIPT,
    parent_exact:parentExact,
    formal_cells:formalCells,
    ordered_composition_pair_controls:pairControls,
    ordered_closure_incidences:relationPairs,
    upward_cover_incidences:coverPairs,
    pivot_order_failures:pivotOrderFailures,
    cover_failures:coverFailures,
    exhaustive_cells:exhaustiveCells,
    independent_reverse_rref_points:independentPoints,
    independent_rank_incidence_checks:rankIncidenceChecks,
    independent_rank_incidence_failures:rankIncidenceFailures,
    independent_count_failures:independentCountFailures,
    formal_profiles:freeze(formalProfiles),
    exhaustive_profiles:freeze(exhaustiveProfiles),
    anchor:freeze({d:7,k:3,labels:84,rank:18,relations:2520,covers:168,passed:anchorPass}),
    hostile_controls:freeze({
      orientation_reversal_rejected:orientationPass,
      equal_dimension_incomparable:equalDimensionIncomparable,
      unequal_dimension_incomparable:unequalDimensionIncomparable,
      comparable_noncover:nonCoverComparable,
    }),
    laws:freeze({
      closure_orientation:'C_f subset closure(C_e) iff prefix_j(f)>=prefix_j(e) for every j<d',
      pivot_orientation:'C_f subset closure(C_e) iff pivot_r(f)<=pivot_r(e) for every r',
      cover_orientation:'one upward cover moves one exponent unit from block j to block j+1',
      fixed_flag_closure_poset_correspondence:true,
      basis_free_canonical_geometry_claimed:false,
      functorial_equivalence_claimed:false,
      physical_causal_order_claimed:false,
    }),
    membranes:freeze([
      'CELL_DECOMPOSITION != BRUHAT_CLOSURE_ORDER',
      'CELL_DIMENSION_EQUALITY != BRUHAT_COMPARABILITY',
      'CELL_DIMENSION_INEQUALITY != BRUHAT_COMPARABILITY',
      'BRUHAT_COMPARABILITY != COVER_RELATION',
      'WEAK_COMPOSITION_LABEL != ATLAS_SUPPORT_STRATUM',
      'FIXED_FLAG_CLOSURE_POSET != BASIS_FREE_CANONICAL_GEOMETRY',
      'STANDARD_FLAG_DEPENDENCE != CANONICALITY',
      'FINITE_SCHUBERT_POSET != PHYSICAL_CAUSAL_ORDER',
      'FORMAL_POSET != RUNTIME_SCHEDULER',
      'ORDER_ISOMORPHISM != FUNCTORIAL_EQUIVALENCE',
      'FINITE_CONTROLS != ASYMPTOTIC_GEOMETRY',
      'SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY',
      'ATLAS_REGISTRATION != LIVE_RUNTIME_STATE',
    ]),
    passed:exact,
  });
  return cached;
}

export const ATLAS_SCHUBERT_CLOSURE_POSET_CERTIFICATE=atlasSchubertClosurePosetCertificate();
