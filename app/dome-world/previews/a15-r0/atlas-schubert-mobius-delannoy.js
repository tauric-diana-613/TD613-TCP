import {
  ATLAS_SCHUBERT_MOBIUS_INCIDENCE_CERTIFICATE,
  ATLAS_SCHUBERT_MOBIUS_INCIDENCE_SCHEMA,
  atlasSchubertMobiusRecursive,
} from './atlas-schubert-mobius-incidence.js';
import {
  ATLAS_SCHUBERT_CLOSURE_POSET_CERTIFICATE,
  atlasSchubertClosureContains,
} from './atlas-schubert-closure-poset.js';
import { atlasSchubertCellDimension } from './atlas-schubert-graded-cell-decomposition.js';

export const ATLAS_SCHUBERT_MOBIUS_DELANNOY_SCHEMA='td613.dome-world.atlas-schubert-mobius-delannoy/v0.1';
export const ATLAS_SCHUBERT_MOBIUS_DELANNOY_PARENT_RECEIPT='776c6ef78011157d3458daf924bbb7cda7566785';

let cached=null;
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const sameArray=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
const key=e=>e.join(',');
const pairKey=(lower,upper)=>`${key(lower)}|${key(upper)}`;

function validateDK(d,k){
  if(!Number.isInteger(d)||d<1||!Number.isInteger(k)||k<0)throw new Error('requires integer d>=1 and k>=0');
}
function validateBinaryWord(word){
  if(!Array.isArray(word)||word.some(x=>x!==0&&x!==1))throw new Error('requires a binary word');
  return word;
}
function validatePath(path){
  if(!Array.isArray(path)||path.some(x=>x!=='E'&&x!=='N'&&x!=='D'))throw new Error('requires a Delannoy step word over E,N,D');
  return path;
}
function compositions(k,d){
  validateDK(d,k);const out=[];
  function rec(j,rem,prefix){
    if(j===d-1){out.push([...prefix,rem]);return;}
    for(let x=0;x<=rem;x++)rec(j+1,rem-x,[...prefix,x]);
  }
  rec(0,k,[]);return out;
}
function binaryWords(m,k){
  if(!Number.isInteger(m)||m<0||!Number.isInteger(k)||k<0)throw new Error('requires nonnegative integer zero/one counts');
  const out=[];
  function rec(z,o,prefix){
    if(z===0&&o===0){out.push([...prefix]);return;}
    if(z>0)rec(z-1,o,[...prefix,0]);
    if(o>0)rec(z,o-1,[...prefix,1]);
  }
  rec(m,k,[]);return out;
}
function compositionFromWord(word){
  validateBinaryWord(word);const e=[];let count=0;
  for(const b of word){if(b===1)count++;else{e.push(count);count=0;}}
  e.push(count);return e;
}
function descents10(word){
  validateBinaryWord(word);const out=[];
  for(let i=0;i+1<word.length;i++)if(word[i]===1&&word[i+1]===0)out.push(i);
  return out;
}
function subsets(items){
  const out=[[]];
  for(const item of items){const n=out.length;for(let i=0;i<n;i++)out.push([...out[i],item]);}
  return out;
}
function validateMarks(word,marks){
  validateBinaryWord(word);
  if(!Array.isArray(marks)||marks.some(x=>!Number.isInteger(x)))throw new Error('marks must be integer descent starts');
  const sorted=[...marks].sort((a,b)=>a-b);
  if(new Set(sorted).size!==sorted.length)throw new Error('duplicate descent mark');
  for(let i=0;i<sorted.length;i++){
    const p=sorted[i];
    if(p<0||p+1>=word.length||word[p]!==1||word[p+1]!==0)throw new Error('mark must select an actual 10 descent');
    if(i>0&&sorted[i]-sorted[i-1]<2)throw new Error('marked descents must be disjoint');
  }
  return sorted;
}
function applyMarkedSwaps(word,marks){
  const sorted=validateMarks(word,marks),out=[...word];
  for(const p of sorted){out[p]=0;out[p+1]=1;}
  return out;
}

export function atlasSchubertMobiusDelannoyEncode(lowerWord,marks){
  validateBinaryWord(lowerWord);const sorted=validateMarks(lowerWord,marks),marked=new Set(sorted),path=[];
  for(let i=0;i<lowerWord.length;){
    if(marked.has(i)){path.push('D');i+=2;continue;}
    path.push(lowerWord[i]===0?'E':'N');i++;
  }
  return path;
}

export function atlasSchubertMobiusDelannoyDecode(path){
  validatePath(path);const lower=[],marks=[];
  for(const step of path){
    if(step==='D'){marks.push(lower.length);lower.push(1,0);}
    else lower.push(step==='E'?0:1);
  }
  return {lower,upper:applyMarkedSwaps(lower,marks),marks};
}

export function atlasSchubertMobiusDelannoyPathEndpoint(path){
  validatePath(path);let x=0,y=0,diagonal=0;
  for(const step of path){if(step==='E')x++;else if(step==='N')y++;else{x++;y++;diagonal++;}}
  return {x,y,diagonal};
}

function factorialBigInt(n){let x=1n;for(let i=2n;i<=BigInt(n);i++)x*=i;return x;}
function safeNumber(x){const n=Number(x);if(!Number.isSafeInteger(n))throw new Error('exact coefficient exceeds Number safe-integer range');return n;}

export function atlasSchubertMobiusDelannoyCoefficient(d,k,s){
  validateDK(d,k);const m=d-1;
  if(!Number.isInteger(s)||s<0||s>Math.min(m,k))return 0;
  return safeNumber(factorialBigInt(m+k-s)/(factorialBigInt(m-s)*factorialBigInt(k-s)*factorialBigInt(s)));
}

export function atlasSchubertMobiusDelannoyClosedPolynomial(d,k){
  validateDK(d,k);const out=[];
  for(let s=0;s<=Math.min(d-1,k);s++)out.push(atlasSchubertMobiusDelannoyCoefficient(d,k,s));
  return out;
}

function addPoly(...polys){
  const n=Math.max(0,...polys.map(p=>p.length)),out=Array(n).fill(0);
  for(const p of polys)for(let i=0;i<p.length;i++)out[i]+=p[i];
  return out;
}
function shiftPoly(p){return [0,...p];}
const recurrenceCache=new Map();
export function atlasSchubertMobiusDelannoyRecursivePolynomial(d,k){
  validateDK(d,k);const m=d-1;
  function rec(a,b){
    const q=`${a}:${b}`;if(recurrenceCache.has(q))return recurrenceCache.get(q);
    const value=a===0||b===0?[1]:addPoly(rec(a-1,b),rec(a,b-1),shiftPoly(rec(a-1,b-1)));
    recurrenceCache.set(q,value);return value;
  }
  return [...rec(m,k)];
}
function evalPoly(p,t){let sum=0,pow=1;for(const c of p){sum+=c*pow;pow*=t;}return sum;}

export function atlasSchubertMobiusDelannoyCertificate(){
  if(cached)return cached;
  const parent=ATLAS_SCHUBERT_MOBIUS_INCIDENCE_CERTIFICATE,closure=ATLAS_SCHUBERT_CLOSURE_POSET_CERTIFICATE;
  const parentExact=parent.passed===true&&ATLAS_SCHUBERT_MOBIUS_INCIDENCE_SCHEMA==='td613.dome-world.atlas-schubert-mobius-incidence/v0.1';

  let formalCells=0,lowerWords=0,pathInstances=0,roundTripFailures=0,endpointFailures=0,rankGapFailures=0,signFailures=0,duplicateIntervalFailures=0;
  let comparableChecks=0,supportMembershipFailures=0,coefficientChecks=0,coefficientFailures=0,recurrenceCells=0,recurrenceCoefficientChecks=0,recurrenceFailures=0;
  let specializationFailures=0,transposeChecks=0,transposeFailures=0,directCancellationFailures=0;
  const aggregateHistogram=Array(6).fill(0),formalProfiles={};

  for(let d=1;d<=7;d++)for(let k=0;k<=5;k++){
    formalCells++;const m=d-1,words=binaryWords(m,k),labels=compositions(k,d),generated=new Set(),hist=Array(Math.min(m,k)+1).fill(0);
    let cellPaths=0,cellSignedBySubsets=0;

    lowerWords+=words.length;
    for(const lowerWord of words){
      const lower=compositionFromWord(lowerWord),markedSubsets=subsets(descents10(lowerWord));let lowerSigned=0;
      for(const marks of markedSubsets){
        pathInstances++;cellPaths++;
        const path=atlasSchubertMobiusDelannoyEncode(lowerWord,marks),decoded=atlasSchubertMobiusDelannoyDecode(path),upperWord=applyMarkedSwaps(lowerWord,marks),upper=compositionFromWord(upperWord);
        const endpoint=atlasSchubertMobiusDelannoyPathEndpoint(path),gap=atlasSchubertCellDimension(upper,k)-atlasSchubertCellDimension(lower,k),sign=marks.length%2===0?1:-1;
        if(!sameArray(decoded.lower,lowerWord)||!sameArray(decoded.upper,upperWord)||!sameArray(decoded.marks,[...marks].sort((a,b)=>a-b))||!sameArray(atlasSchubertMobiusDelannoyEncode(decoded.lower,decoded.marks),path))roundTripFailures++;
        if(endpoint.x!==m||endpoint.y!==k||endpoint.diagonal!==marks.length)endpointFailures++;
        if(gap!==marks.length)rankGapFailures++;
        if(atlasSchubertMobiusRecursive(upper,lower)!==sign)signFailures++;
        const pk=pairKey(lower,upper);if(generated.has(pk))duplicateIntervalFailures++;generated.add(pk);
        hist[marks.length]++;aggregateHistogram[marks.length]++;lowerSigned+=sign;
      }
      cellSignedBySubsets+=lowerSigned;
    }
    if(cellSignedBySubsets!==1)directCancellationFailures++;

    let cellComparable=0,cellParentNonzero=0;
    for(const upper of labels)for(const lower of labels){
      if(!atlasSchubertClosureContains(upper,lower))continue;
      comparableChecks++;cellComparable++;
      const parentNonzero=atlasSchubertMobiusRecursive(upper,lower)!==0,generatedNonzero=generated.has(pairKey(lower,upper));
      if(parentNonzero)cellParentNonzero++;
      if(parentNonzero!==generatedNonzero)supportMembershipFailures++;
    }

    const closed=atlasSchubertMobiusDelannoyClosedPolynomial(d,k),recursive=atlasSchubertMobiusDelannoyRecursivePolynomial(d,k);
    for(let s=0;s<Math.max(closed.length,hist.length);s++){
      coefficientChecks++;
      if((closed[s]??0)!==(hist[s]??0))coefficientFailures++;
    }
    if(m>=1&&k>=1){
      recurrenceCells++;
      for(let s=0;s<Math.max(recursive.length,closed.length);s++){
        recurrenceCoefficientChecks++;
        if((recursive[s]??0)!==(closed[s]??0))recurrenceFailures++;
      }
    }

    const inheritedClosure=closure.formal_profiles[`d${d}k${k}`],inheritedMobius=parent.formal_profiles[`d${d}k${k}`];
    const t0=evalPoly(closed,0),t1=evalPoly(closed,1),tm1=evalPoly(closed,-1),positive=closed.reduce((a,c,s)=>a+(s%2===0?c:0),0),negative=closed.reduce((a,c,s)=>a+(s%2===1?c:0),0);
    if(t0!==inheritedClosure.labels||(closed[1]??0)!==inheritedClosure.covers||t1!==inheritedMobius.mobius_nonzero||tm1!==1||positive!==inheritedMobius.mobius_positive||negative!==inheritedMobius.mobius_negative||positive-negative!==1||cellPaths!==generated.size||cellPaths!==cellParentNonzero||cellComparable!==inheritedClosure.relations)specializationFailures++;

    formalProfiles[`d${d}k${k}`]=freeze({labels:words.length,comparable:cellComparable,polynomial:freeze([...hist]),nonzero:cellPaths,positive,negative,signed:cellSignedBySubsets});
  }

  for(let m=0;m<=5;m++)for(let k=0;k<=5;k++){
    transposeChecks++;
    if(!sameArray(atlasSchubertMobiusDelannoyClosedPolynomial(m+1,k),atlasSchubertMobiusDelannoyClosedPolynomial(k+1,m)))transposeFailures++;
  }

  const aggregateExpected=[1715,3829,3101,1099,161,7];
  const aggregatePass=sameArray(aggregateHistogram,aggregateExpected)&&aggregateHistogram.reduce((a,b)=>a+b,0)===9912&&aggregateHistogram[0]===1715&&aggregateHistogram[1]===3829&&aggregateHistogram.slice(2).reduce((a,b)=>a+b,0)===4368;
  const anchor=formalProfiles.d7k3;
  const anchorPass=sameArray(anchor.polynomial,[84,168,105,20])&&anchor.labels===84&&anchor.comparable===2520&&anchor.nonzero===377&&anchor.positive===189&&anchor.negative===188&&anchor.signed===1;

  const descentFreeWord=[0,0,0,1,1],descentFreePass=descents10(descentFreeWord).length===0&&subsets(descents10(descentFreeWord)).length===1;
  const twoDescentWord=[1,0,1,0],twoDescentPass=descents10(twoDescentWord).length===2&&subsets(descents10(twoDescentWord)).length===4;
  const unmarkedPass=sameArray(atlasSchubertMobiusDelannoyEncode([1,0],[]),['N','E'])&&sameArray(atlasSchubertMobiusDelannoyEncode([1,0],[0]),['D']);
  const diagonalRoundTrip=atlasSchubertMobiusDelannoyDecode(['D']);
  const diagonalMarkPass=sameArray(diagonalRoundTrip.lower,[1,0])&&sameArray(diagonalRoundTrip.upper,[0,1])&&sameArray(diagonalRoundTrip.marks,[0]);
  const rankTwoNoncoverPass=parent.hostile_controls.noncover_nonzero===true&&parent.hostile_controls.comparable_rank_two_zero===true;

  const exact=parentExact&&formalCells===42&&lowerWords===1715&&pathInstances===9912&&roundTripFailures===0&&endpointFailures===0&&rankGapFailures===0&&signFailures===0&&duplicateIntervalFailures===0&&comparableChecks===113828&&supportMembershipFailures===0&&coefficientChecks===112&&coefficientFailures===0&&recurrenceCells===30&&recurrenceCoefficientChecks===100&&recurrenceFailures===0&&specializationFailures===0&&transposeChecks===36&&transposeFailures===0&&directCancellationFailures===0&&aggregatePass&&anchorPass&&descentFreePass&&twoDescentPass&&unmarkedPass&&diagonalMarkPass&&rankTwoNoncoverPass;

  cached=freeze({
    schema:ATLAS_SCHUBERT_MOBIUS_DELANNOY_SCHEMA,parent_receipt:ATLAS_SCHUBERT_MOBIUS_DELANNOY_PARENT_RECEIPT,parent_exact:parentExact,
    formal_cells:formalCells,lower_pivot_words:lowerWords,path_instances:pathInstances,round_trip_failures:roundTripFailures,endpoint_failures:endpointFailures,rank_gap_failures:rankGapFailures,mobius_sign_failures:signFailures,duplicate_interval_failures:duplicateIntervalFailures,
    comparable_membership_checks:comparableChecks,support_membership_failures:supportMembershipFailures,coefficient_checks:coefficientChecks,coefficient_failures:coefficientFailures,recurrence_cells:recurrenceCells,recurrence_coefficient_checks:recurrenceCoefficientChecks,recurrence_failures:recurrenceFailures,specialization_failures:specializationFailures,transpose_checks:transposeChecks,transpose_failures:transposeFailures,direct_cancellation_failures:directCancellationFailures,
    aggregate_polynomial:freeze([...aggregateHistogram]),formal_profiles:freeze(formalProfiles),anchor:freeze({d:7,k:3,...anchor,passed:anchorPass}),
    hostile_controls:freeze({descent_free_only_reflexive:descentFreePass,two_descents_four_subsets:twoDescentPass,unmarked_10_stays_axial:unmarkedPass,diagonal_preserves_mark:diagonalMarkPass,higher_noncover_support_and_rank_two_zero_control:rankTwoNoncoverPass}),
    laws:freeze({
      path_bijection:'nonzero Mobius intervals <-> marked 10 descents <-> Delannoy E/N/D paths from (0,0) to (d-1,k)',rank_gap:'number of diagonal steps equals m(upper)-m(lower)',coefficient:'[t^s]M=(d+k-1-s)!/((d-1-s)!(k-s)!s!)',weighted_recurrence:'M(m,k)=M(m-1,k)+M(m,k-1)+t*M(m-1,k-1)',t0:'M(0)=number of strata labels',coefficient_t1:'[t]M=upward cover count',t1:'M(1)=Delannoy(d-1,k)=nonzero Mobius support count',t_minus_1:'M(-1)=1 cellwise',transpose_symmetry:'M(m,k;t)=M(k,m;t)',physical_trajectory_claimed:false,causal_jump_claimed:false,probability_claimed:false,basis_free_canonical_geometry_claimed:false,
    }),
    membranes:freeze([
      'MOBIUS_SUPPORT != ENTIRE_CLOSURE_RELATION','DELANNOY_PATH != PHYSICAL_TRAJECTORY','DIAGONAL_STEP != CAUSAL_JUMP','PATH_BIJECTION != RUNTIME_ROUTE','PATH_COUNT != PROBABILITY','MOBIUS_SIGN != PATH_ORIENTATION','SIGNED_CANCELLATION != DELETION_OF_EVIDENCE','M_DK_MINUS_ONE_EQUALS_ONE != SINGLE_SURVIVING_INTERVAL','COEFFICIENT_ONE_EQUALS_COVER_COUNT != MOBIUS_SUPPORT_EQUALS_HASSE_DIAGRAM','RECTANGLE_TRANSPOSE_SYMMETRY != ATLAS_PHYSICAL_DUALITY','SUPPORT_AXIS_COUNT != PRIME_EXPONENT_IDENTITY','FORMAL_PARAMETER_SYMMETRY != FUNCTORIAL_EQUIVALENCE','FINITE_DELANNOY_CORRESPONDENCE != ASYMPTOTIC_GEOMETRY','FIXED_FLAG_PATH_MODEL != BASIS_FREE_CANONICAL_GEOMETRY','SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY','ATLAS_REGISTRATION != LIVE_RUNTIME_STATE',
    ]),
    passed:exact,
  });
  return cached;
}

export const ATLAS_SCHUBERT_MOBIUS_DELANNOY_CERTIFICATE=atlasSchubertMobiusDelannoyCertificate();
