import {
  ATLAS_SCHUBERT_CLOSURE_POSET_CERTIFICATE,
  ATLAS_SCHUBERT_CLOSURE_POSET_SCHEMA,
  atlasSchubertClosureContains,
  atlasSchubertCoverContains,
  atlasSchubertPivotPositions,
} from './atlas-schubert-closure-poset.js';
import { atlasSchubertCellDimension } from './atlas-schubert-graded-cell-decomposition.js';

export const ATLAS_SCHUBERT_MOBIUS_INCIDENCE_SCHEMA='td613.dome-world.atlas-schubert-mobius-incidence/v0.1';
export const ATLAS_SCHUBERT_MOBIUS_INCIDENCE_PARENT_RECEIPT='f083e506f2a16f1d98b3af9a9b963d65694efc47';

let cached=null;
const tableCache=new Map();
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const sameArray=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
const lex=(a,b)=>{for(let i=0;i<Math.min(a.length,b.length);i++){if(a[i]!==b[i])return a[i]-b[i];}return a.length-b.length;};
const key=e=>e.join(',');
const pairKey=(lower,upper)=>`${key(lower)}|${key(upper)}`;

function validateDK(d,k){
  if(!Number.isInteger(d)||d<1||!Number.isInteger(k)||k<0)throw new Error('requires integer d>=1 and k>=0');
}
function validateComposition(e){
  if(!Array.isArray(e)||e.length<1||e.some(x=>!Number.isInteger(x)||x<0))throw new Error('requires nonempty nonnegative integer weak composition');
  return {d:e.length,k:e.reduce((a,b)=>a+b,0)};
}
function validatePair(upper,lower){
  const a=validateComposition(upper),b=validateComposition(lower);
  if(a.d!==b.d||a.k!==b.k)throw new Error('composition shape/sum mismatch');
  return a;
}
function compositions(k,d){
  validateDK(d,k);const out=[];
  function rec(j,rem,prefix){if(j===d-1){out.push([...prefix,rem]);return;}for(let x=0;x<=rem;x++)rec(j+1,rem-x,[...prefix,x]);}
  rec(0,k,[]);return out;
}

export function atlasSchubertPrefixGaps(upper,lower){
  const {d}=validatePair(upper,lower);const out=[];let U=0,L=0;
  for(let j=0;j<d-1;j++){U+=upper[j];L+=lower[j];out.push(L-U);}
  return out;
}

export function atlasSchubertPivotDisplacements(upper,lower){
  validatePair(upper,lower);
  const U=atlasSchubertPivotPositions(upper),L=atlasSchubertPivotPositions(lower);
  return U.map((x,r)=>x-L[r]);
}

export function atlasSchubertRectanglePartition(exponents){
  const {d}=validateComposition(exponents);const out=[];
  for(let j=d-1;j>=0;j--)for(let t=0;t<exponents[j];t++)out.push(j);
  return out;
}

export function atlasSchubertPartitionContains(upper,lower){
  validatePair(upper,lower);
  const U=atlasSchubertRectanglePartition(upper),L=atlasSchubertRectanglePartition(lower);
  return U.every((x,r)=>x>=L[r]);
}

export function atlasSchubertSkewIsRookStrip(upper,lower){
  validatePair(upper,lower);
  if(!atlasSchubertPartitionContains(upper,lower))return false;
  const U=atlasSchubertRectanglePartition(upper),L=atlasSchubertRectanglePartition(lower);
  const columns=new Set();
  for(let r=0;r<U.length;r++){
    const width=U[r]-L[r];
    if(width>1)return false;
    if(width===1){const c=U[r];if(columns.has(c))return false;columns.add(c);}
  }
  return true;
}

export function atlasSchubertMobiusCandidate(upper,lower){
  const {k}=validatePair(upper,lower);
  if(!atlasSchubertClosureContains(upper,lower))return 0;
  const prefixBoolean=atlasSchubertPrefixGaps(upper,lower).every(x=>x===0||x===1);
  const pivotBoolean=atlasSchubertPivotDisplacements(upper,lower).every(x=>x===0||x===1);
  if(!prefixBoolean||!pivotBoolean)return 0;
  const gap=atlasSchubertCellDimension(upper,k)-atlasSchubertCellDimension(lower,k);
  return gap%2===0?1:-1;
}

function mobiusTable(d,k){
  validateDK(d,k);const cacheKey=`${d}:${k}`;if(tableCache.has(cacheKey))return tableCache.get(cacheKey);
  const labels=compositions(k,d).sort((a,b)=>atlasSchubertCellDimension(a,k)-atlasSchubertCellDimension(b,k)||lex(a,b));
  const n=labels.length;
  const leq=Array.from({length:n},()=>new Uint8Array(n));
  for(let i=0;i<n;i++)for(let j=i;j<n;j++)if(atlasSchubertClosureContains(labels[j],labels[i]))leq[i][j]=1;
  const mu=Array.from({length:n},()=>new Int32Array(n));
  for(let i=0;i<n;i++){
    mu[i][i]=1;
    for(let j=i+1;j<n;j++){
      if(!leq[i][j])continue;
      let sum=0;
      for(let z=i;z<j;z++)if(leq[i][z]&&leq[z][j])sum+=mu[i][z];
      mu[i][j]=-sum;
    }
  }
  const index=new Map(labels.map((e,i)=>[key(e),i]));
  const table={labels,leq,mu,index};tableCache.set(cacheKey,table);return table;
}

export function atlasSchubertMobiusRecursive(upper,lower){
  const {d,k}=validatePair(upper,lower);
  if(!atlasSchubertClosureContains(upper,lower))return 0;
  const table=mobiusTable(d,k),i=table.index.get(key(lower)),j=table.index.get(key(upper));
  if(i===undefined||j===undefined)throw new Error('composition missing from finite Möbius table');
  return table.mu[i][j];
}

export function atlasSchubertMobiusIncidenceCertificate(){
  if(cached)return cached;
  const parent=ATLAS_SCHUBERT_CLOSURE_POSET_CERTIFICATE;
  const parentExact=parent.passed===true&&ATLAS_SCHUBERT_CLOSURE_POSET_SCHEMA==='td613.dome-world.atlas-schubert-closure-poset/v0.1';

  let formalCells=0,orderedPairs=0,comparablePairs=0,nonzero=0,positive=0,negative=0,zeroComparable=0;
  let recurrenceFailures=0,rankIdentityFailures=0,partitionOrderFailures=0,rookSupportFailures=0,coverCoefficientFailures=0;
  const formalProfiles={};

  for(let d=1;d<=7;d++)for(let k=0;k<=5;k++){
    formalCells++;const labels=compositions(k,d);const table=mobiusTable(d,k);
    let relations=0,cellNonzero=0,cellPositive=0,cellNegative=0;
    for(const upper of labels)for(const lower of labels){
      orderedPairs++;
      const comparable=atlasSchubertClosureContains(upper,lower);
      const partitionComparable=atlasSchubertPartitionContains(upper,lower);
      if(comparable!==partitionComparable)partitionOrderFailures++;
      if(!comparable)continue;
      comparablePairs++;relations++;
      const prefix=atlasSchubertPrefixGaps(upper,lower),pivot=atlasSchubertPivotDisplacements(upper,lower);
      const rankGap=atlasSchubertCellDimension(upper,k)-atlasSchubertCellDimension(lower,k);
      if(prefix.reduce((a,b)=>a+b,0)!==rankGap||pivot.reduce((a,b)=>a+b,0)!==rankGap)rankIdentityFailures++;
      const prefixBoolean=prefix.every(x=>x===0||x===1),pivotBoolean=pivot.every(x=>x===0||x===1);
      const candidate=prefixBoolean&&pivotBoolean?(rankGap%2===0?1:-1):0;
      const rook=atlasSchubertSkewIsRookStrip(upper,lower);
      if(rook!==(prefixBoolean&&pivotBoolean))rookSupportFailures++;
      const i=table.index.get(key(lower)),j=table.index.get(key(upper)),recursive=table.mu[i][j];
      if(recursive!==candidate)recurrenceFailures++;
      if(atlasSchubertCoverContains(upper,lower)&&recursive!==-1)coverCoefficientFailures++;
      if(recursive===0)zeroComparable++;
      else{
        nonzero++;cellNonzero++;
        if(recursive===1){positive++;cellPositive++;}
        else if(recursive===-1){negative++;cellNegative++;}
        else recurrenceFailures++;
      }
    }
    formalProfiles[`d${d}k${k}`]=freeze({labels:labels.length,relations,mobius_nonzero:cellNonzero,mobius_positive:cellPositive,mobius_negative:cellNegative});
  }

  const rankTwoNonzero=atlasSchubertMobiusRecursive([0,1,1],[1,1,0])===1&&atlasSchubertMobiusCandidate([0,1,1],[1,1,0])===1;
  const columnCollisionZero=atlasSchubertMobiusRecursive([0,2,0],[2,0,0])===0&&sameArray(atlasSchubertPrefixGaps([0,2,0],[2,0,0]),[2,0]);
  const rowCollisionZero=atlasSchubertMobiusRecursive([1,0,1],[2,0,0])===0&&sameArray(atlasSchubertPrefixGaps([1,0,1],[2,0,0]),[1,1])&&sameArray(atlasSchubertPivotDisplacements([1,0,1],[2,0,0]),[0,2]);
  const rankThreeNegative=atlasSchubertMobiusRecursive([0,1,1,1],[1,1,1,0])===-1&&atlasSchubertMobiusCandidate([0,1,1,1],[1,1,1,0])===-1;
  const nonCoverNonzero=atlasSchubertMobiusRecursive([0,1,1],[1,1,0])===1&&!atlasSchubertCoverContains([0,1,1],[1,1,0]);
  const comparableRankTwoZero=atlasSchubertClosureContains([0,2,0],[2,0,0])&&atlasSchubertMobiusRecursive([0,2,0],[2,0,0])===0;
  const anchor=formalProfiles.d7k3;
  const anchorPass=anchor.labels===84&&anchor.relations===2520&&anchor.mobius_nonzero===377&&anchor.mobius_positive===189&&anchor.mobius_negative===188;

  const exact=parentExact&&formalCells===42&&orderedPairs===376467&&comparablePairs===113828&&nonzero===9912&&positive===4977&&negative===4935&&zeroComparable===103916&&recurrenceFailures===0&&rankIdentityFailures===0&&partitionOrderFailures===0&&rookSupportFailures===0&&coverCoefficientFailures===0&&rankTwoNonzero&&columnCollisionZero&&rowCollisionZero&&rankThreeNegative&&nonCoverNonzero&&comparableRankTwoZero&&anchorPass;

  cached=freeze({
    schema:ATLAS_SCHUBERT_MOBIUS_INCIDENCE_SCHEMA,
    parent_receipt:ATLAS_SCHUBERT_MOBIUS_INCIDENCE_PARENT_RECEIPT,
    parent_exact:parentExact,
    formal_cells:formalCells,
    ordered_composition_pairs:orderedPairs,
    ordered_comparable_pairs:comparablePairs,
    mobius_nonzero:nonzero,
    mobius_positive:positive,
    mobius_negative:negative,
    mobius_zero_comparable:zeroComparable,
    recursive_formula_failures:recurrenceFailures,
    rank_identity_failures:rankIdentityFailures,
    partition_order_failures:partitionOrderFailures,
    rook_support_failures:rookSupportFailures,
    cover_coefficient_failures:coverCoefficientFailures,
    formal_profiles:freeze(formalProfiles),
    anchor:freeze({d:7,k:3,...anchor,passed:anchorPass}),
    hostile_controls:freeze({rank_two_nonzero:rankTwoNonzero,column_collision_zero:columnCollisionZero,row_collision_zero:rowCollisionZero,rank_three_negative:rankThreeNegative,noncover_nonzero:nonCoverNonzero,comparable_rank_two_zero:comparableRankTwoZero}),
    laws:freeze({
      partition_translation:'lambda(e)=((d-1)^e_d,...,1^e_2,0^e_1) inside the finite k x (d-1) rectangle',
      rank_gap_identity:'m(upper)-m(lower)=sum prefix gaps=sum pivot displacements',
      mobius_support:'mu(lower,upper) is nonzero iff every proper-prefix gap and every pivot displacement is 0 or 1',
      mobius_value:'on nonzero support mu(lower,upper)=(-1)^(m(upper)-m(lower)); otherwise 0',
      rook_strip_translation:'nonzero support iff the finite rectangle skew difference is a rook strip',
      coefficient_range:freeze([-1,0,1]),
      basis_free_canonical_geometry_claimed:false,
      causal_reversal_claimed:false,
      physical_claimed:false,
    }),
    membranes:freeze([
      'CLOSURE_POSET != MOBIUS_INCIDENCE_ALGEBRA',
      'MOBIUS_NONZERO != COVER_RELATION',
      'COMPARABILITY != MOBIUS_NONZERO',
      'RANK_DIFFERENCE != MOBIUS_MAGNITUDE',
      'MOBIUS_ZERO != UNTESTED_INTERVAL',
      'MOBIUS_COEFFICIENT != PROBABILITY_WEIGHT',
      'MOBIUS_SIGN != PHYSICAL_ORIENTATION',
      'INCIDENCE_INVERSION != CAUSAL_REVERSAL',
      'FINITE_DISTRIBUTIVE_LATTICE_MODEL != BASIS_FREE_CANONICAL_GEOMETRY',
      'RECTANGLE_PARTITION_LABEL != PHYSICAL_SHAPE',
      'ROOK_STRIP_CRITERION != SPATIAL_OCCLUSION_RULE',
      'ORDER_ISOMORPHISM != FUNCTORIAL_EQUIVALENCE',
      'FINITE_CONTROLS != ASYMPTOTIC_GEOMETRY',
      'SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY',
      'ATLAS_REGISTRATION != LIVE_RUNTIME_STATE',
    ]),
    passed:exact,
  });
  return cached;
}

export const ATLAS_SCHUBERT_MOBIUS_INCIDENCE_CERTIFICATE=atlasSchubertMobiusIncidenceCertificate();
