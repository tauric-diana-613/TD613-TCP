import {
  ATLAS_SCHUBERT_MOBIUS_DELANNOY_CERTIFICATE,
  ATLAS_SCHUBERT_MOBIUS_DELANNOY_SCHEMA,
  atlasSchubertMobiusDelannoyClosedPolynomial,
} from './atlas-schubert-mobius-delannoy.js';
import {
  ATLAS_SCHUBERT_GRADED_CELL_DECOMPOSITION_CERTIFICATE,
  atlasGaussianPolynomial,
} from './atlas-schubert-graded-cell-decomposition.js';

export const ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_SCHEMA='td613.dome-world.atlas-schubert-gaussian-delannoy/v0.1';
export const ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_PARENT_RECEIPT='00b3772c46181747dbb5f7101a5a11f7bf4ba6b9';

let cached=null;
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const sameArray=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
const trim=a=>{let n=a.length;while(n>1&&a[n-1]===0n)n--;return a.slice(0,n);};
const addQ=(a,b)=>{const n=Math.max(a.length,b.length),c=Array(n).fill(0n);for(let i=0;i<n;i++)c[i]=(a[i]??0n)+(b[i]??0n);return trim(c);};
const shiftQ=(a,s)=>trim(Array(s).fill(0n).concat(a));
const mulQ=(a,b)=>{const c=Array(a.length+b.length-1).fill(0n);for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)c[i+j]+=a[i]*b[j];return trim(c);};
const cloneBi=p=>p.map(row=>[...row]);
const trimBi=p=>{const out=p.map(trim);let n=out.length;while(n>1&&out[n-1].every(x=>x===0n))n--;return out.slice(0,n);};
function addBi(...polys){
  const t=Math.max(0,...polys.map(p=>p.length)),out=Array.from({length:t},()=>[0n]);
  for(const p of polys)for(let s=0;s<p.length;s++)out[s]=addQ(out[s],p[s]);
  return trimBi(out);
}
function shiftBi(p,tShift,qShift){
  const out=Array.from({length:p.length+tShift},()=>[0n]);
  for(let s=0;s<p.length;s++)out[s+tShift]=shiftQ(p[s],qShift);
  return trimBi(out);
}
function toStrings(p){return p.map(row=>row.map(String));}
function toBigIntBi(p){return p.map(row=>row.map(BigInt));}
function validateDK(d,k){if(!Number.isInteger(d)||d<1||!Number.isInteger(k)||k<0)throw new Error('requires integer d>=1 and k>=0');}
function binaryWords(a,b){
  if(!Number.isInteger(a)||a<0||!Number.isInteger(b)||b<0)throw new Error('requires nonnegative zero/one counts');
  const out=[];
  function rec(z,o,prefix){
    if(z===0&&o===0){out.push(prefix);return;}
    if(z>0)rec(z-1,o,[...prefix,0]);
    if(o>0)rec(z,o-1,[...prefix,1]);
  }
  rec(a,b,[]);return out;
}
function rank01(word){
  let zeros=0,rank=0;
  for(const bit of word){if(bit===0)zeros++;else rank+=zeros;}
  return rank;
}
function descents10(word){let n=0;for(let i=0;i+1<word.length;i++)if(word[i]===1&&word[i+1]===0)n++;return n;}
function bitCount(x){let n=0;while(x){n+=x&1;x>>=1;}return n;}

const qbinMemo=new Map();
function qBinomial(n,r){
  if(!Number.isInteger(n)||n<0||!Number.isInteger(r)||r<0||r>n)return [0n];
  const key=`${n}:${r}`;if(qbinMemo.has(key))return [...qbinMemo.get(key)];
  let value;
  if(r===0||r===n)value=[1n];
  else value=addQ(qBinomial(n-1,r),shiftQ(qBinomial(n-1,r-1),n-r));
  qbinMemo.set(key,value);return [...value];
}

export function atlasSchubertGaussianDelannoyWordPolynomial(d,k){
  validateDK(d,k);const a=d-1,maxT=Math.min(a,k),out=Array.from({length:maxT+1},()=>Array(a*k+1).fill(0n));
  for(const word of binaryWords(a,k)){
    const rank=rank01(word),r=descents10(word),limit=1<<r;
    for(let mask=0;mask<limit;mask++)out[bitCount(mask)][rank]++;
  }
  return toStrings(trimBi(out));
}

const recurrenceMemo=new Map();
function recurrenceInternal(a,b){
  const key=`${a}:${b}`;if(recurrenceMemo.has(key))return cloneBi(recurrenceMemo.get(key));
  let value;
  if(a===0||b===0)value=[[1n]];
  else value=addBi(
    recurrenceInternal(a-1,b),
    shiftBi(recurrenceInternal(a,b-1),0,a),
    shiftBi(recurrenceInternal(a-1,b-1),1,a-1),
  );
  recurrenceMemo.set(key,cloneBi(value));return cloneBi(value);
}

export function atlasSchubertGaussianDelannoyRecursivePolynomial(d,k){validateDK(d,k);return toStrings(recurrenceInternal(d-1,k));}

export function atlasSchubertGaussianDelannoyClosedPolynomial(d,k){
  validateDK(d,k);const a=d-1,out=[];
  for(let s=0;s<=Math.min(a,k);s++){
    const product=mulQ(qBinomial(a+k-s,a),qBinomial(a,s));
    out.push(shiftQ(product,s*(s-1)/2));
  }
  return toStrings(trimBi(out));
}

export function atlasSchubertGaussianDelannoyEvaluate(poly,q,t){
  q=BigInt(q);t=BigInt(t);let total=0n,tPower=1n;
  for(const row of poly){
    let qPower=1n,rowValue=0n;
    for(const coeff of row){rowValue+=BigInt(coeff)*qPower;qPower*=q;}
    total+=rowValue*tPower;tPower*=t;
  }
  return total.toString();
}

function specializeQOne(poly){return poly.map(row=>row.reduce((a,c)=>a+BigInt(c),0n).toString());}
function specializeT(poly,t){
  t=BigInt(t);const rows=toBigIntBi(poly),out=[0n];let power=1n;
  for(const row of rows){
    const scaled=row.map(c=>c*power);const sum=addQ(out,scaled);out.splice(0,out.length,...sum);power*=t;
  }
  return trim(out).map(String);
}
function specializeTMinusQ(poly){
  const rows=toBigIntBi(poly);let out=[0n];
  for(let s=0;s<rows.length;s++){
    const sign=s%2===0?1n:-1n,shifted=shiftQ(rows[s].map(c=>c*sign),s);out=addQ(out,shifted);
  }
  return trim(out).map(String);
}
function monomial(power){const out=Array(power+1).fill('0');out[power]='1';return out;}

export function atlasSchubertGaussianDelannoyCertificate(){
  if(cached)return cached;
  const parent=ATLAS_SCHUBERT_MOBIUS_DELANNOY_CERTIFICATE,graded=ATLAS_SCHUBERT_GRADED_CELL_DECOMPOSITION_CERTIFICATE;
  const parentExact=parent.passed===true&&ATLAS_SCHUBERT_MOBIUS_DELANNOY_SCHEMA==='td613.dome-world.atlas-schubert-mobius-delannoy/v0.1'&&graded.passed===true;

  let formalCells=0,pivotWords=0,markedObjects=0,tSlices=0,coefficientSlots=0;
  let wordRecurrenceFailures=0,wordClosedFailures=0,coefficientSlotFailures=0,closedSliceFailures=0;
  let gaussianFailures=0,delannoyFailures=0,topCancellationFailures=0,bottomCancellationFailures=0,reciprocityFailures=0;
  let transposeChecks=0,transposeFailures=0;
  const formalProfiles={};

  for(let d=1;d<=7;d++)for(let k=0;k<=5;k++){
    formalCells++;const a=d-1,words=binaryWords(a,k),word=atlasSchubertGaussianDelannoyWordPolynomial(d,k),rec=atlasSchubertGaussianDelannoyRecursivePolynomial(d,k),closed=atlasSchubertGaussianDelannoyClosedPolynomial(d,k);
    pivotWords+=words.length;
    for(const w of words)markedObjects+=1<<descents10(w);
    tSlices+=Math.min(a,k)+1;
    coefficientSlots+=(a*k+1)*(Math.min(a,k)+1);

    if(JSON.stringify(word)!==JSON.stringify(rec))wordRecurrenceFailures++;
    if(JSON.stringify(word)!==JSON.stringify(closed))wordClosedFailures++;

    for(let s=0;s<=Math.min(a,k);s++){
      const wrow=word[s]??['0'],rrow=rec[s]??['0'],crow=closed[s]??['0'];let sliceFailure=false;
      for(let qdeg=0;qdeg<=a*k;qdeg++){
        const w=BigInt(wrow[qdeg]??'0'),r=BigInt(rrow[qdeg]??'0'),c=BigInt(crow[qdeg]??'0');
        if(w!==r||w!==c){coefficientSlotFailures++;sliceFailure=true;}
      }
      if(sliceFailure)closedSliceFailures++;
      const reciprocityPower=a*k-s;
      for(let qdeg=0;qdeg<=reciprocityPower;qdeg++){
        if(BigInt(crow[qdeg]??'0')!==BigInt(crow[reciprocityPower-qdeg]??'0')){reciprocityFailures++;break;}
      }
    }

    const gaussian=atlasGaussianPolynomial(d,k);
    if(!sameArray(closed[0]??['1'],gaussian))gaussianFailures++;
    const delannoy=specializeQOne(closed).map(Number),parentPoly=atlasSchubertMobiusDelannoyClosedPolynomial(d,k);
    if(!sameArray(delannoy,parentPoly))delannoyFailures++;
    if(!sameArray(specializeT(closed,-1),monomial(a*k)))topCancellationFailures++;
    if(!sameArray(specializeTMinusQ(closed),['1']))bottomCancellationFailures++;

    formalProfiles[`d${d}k${k}`]=freeze({a,k,q_degree:a*k,t_degree:Math.min(a,k),q1_t_coefficients:freeze([...delannoy]),marked_objects:delannoy.reduce((x,y)=>x+y,0)});
  }

  for(let a=0;a<=5;a++)for(let b=0;b<=5;b++){
    transposeChecks++;
    if(JSON.stringify(atlasSchubertGaussianDelannoyClosedPolynomial(a+1,b))!==JSON.stringify(atlasSchubertGaussianDelannoyClosedPolynomial(b+1,a)))transposeFailures++;
  }

  const anchor=atlasSchubertGaussianDelannoyClosedPolynomial(7,3),anchorQ1=specializeQOne(anchor).map(Number);
  const anchorPass=
    sameArray(anchor[0],[1,1,2,3,4,5,7,7,8,8,8,7,7,5,4,3,2,1,1].map(String))&&
    sameArray(anchor[1],[1,2,4,6,9,12,15,17,18,18,17,15,12,9,6,4,2,1].map(String))&&
    sameArray(anchor[2],[0,1,2,4,6,9,11,13,13,13,11,9,6,4,2,1].map(String))&&
    sameArray(anchor[3],[0,0,0,1,1,2,3,3,3,3,2,1,1].map(String))&&
    sameArray(anchorQ1,[84,168,105,20])&&
    atlasSchubertGaussianDelannoyEvaluate(anchor,2,0)==='788035'&&
    atlasSchubertGaussianDelannoyEvaluate(anchor,2,1)==='1644634'&&
    atlasSchubertGaussianDelannoyEvaluate(anchor,2,-1)==='262144'&&
    atlasSchubertGaussianDelannoyEvaluate(anchor,2,-2)==='1';

  const triangularShiftPass=sameArray(atlasSchubertGaussianDelannoyClosedPolynomial(3,2)[2],['0','1']);
  const lowerRankWeightPass=sameArray(atlasSchubertGaussianDelannoyWordPolynomial(2,1),[['1','1'],['1']]);
  const compositeArithmetic=atlasSchubertGaussianDelannoyEvaluate(anchor,4,0);

  const exact=parentExact&&formalCells===42&&pivotWords===1715&&markedObjects===9912&&tSlices===112&&coefficientSlots===1428&&wordRecurrenceFailures===0&&wordClosedFailures===0&&coefficientSlotFailures===0&&closedSliceFailures===0&&gaussianFailures===0&&delannoyFailures===0&&topCancellationFailures===0&&bottomCancellationFailures===0&&reciprocityFailures===0&&transposeChecks===36&&transposeFailures===0&&anchorPass&&triangularShiftPass&&lowerRankWeightPass;

  cached=freeze({
    schema:ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_SCHEMA,
    parent_receipt:ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_PARENT_RECEIPT,
    parent_exact:parentExact,
    formal_cells:formalCells,
    pivot_words:pivotWords,
    marked_descent_objects:markedObjects,
    t_slices:tSlices,
    rectangular_coefficient_slots:coefficientSlots,
    word_recurrence_failures:wordRecurrenceFailures,
    word_closed_form_failures:wordClosedFailures,
    coefficient_slot_failures:coefficientSlotFailures,
    closed_form_slice_failures:closedSliceFailures,
    gaussian_specialization_failures:gaussianFailures,
    delannoy_specialization_failures:delannoyFailures,
    top_cancellation_failures:topCancellationFailures,
    bottom_cancellation_failures:bottomCancellationFailures,
    reciprocity_failures:reciprocityFailures,
    transpose_checks:transposeChecks,
    transpose_failures:transposeFailures,
    formal_profiles:freeze(formalProfiles),
    anchor:freeze({d:7,k:3,a:6,b:3,q_degree:18,q1_t_coefficients:freeze(anchorQ1),q2_t0:'788035',q2_t1:'1644634',q2_t_minus1:'262144',q2_t_minus2:'1',passed:anchorPass}),
    hostile_controls:freeze({triangular_q_shift_required:triangularShiftPass,lower_rank_weight_required:lowerRankWeightPass,composite_q_arithmetic_value:compositeArithmetic,finite_field_realization_at_composite_q_claimed:false}),
    laws:freeze({
      definition:'G_(a,b)(q,t)=sum_{mu(f,e)!=0} q^r(f) t^(r(e)-r(f))',
      word_model:'G=sum_w q^r(w)(1+t)^des10(w)',
      closed_form:'[t^s]G=q^(s(s-1)/2) GaussianMultinomial_q(a+b-s;a-s,b-s,s)',
      recurrence:'G(a,b)=G(a-1,b)+q^a G(a,b-1)+t q^(a-1) G(a-1,b-1)',
      gaussian_specialization:'G(q,0)=GaussianBinomial_q(a+b,b)',
      delannoy_specialization:'G(1,t)=earned Delannoy/Mobius-support polynomial',
      top_cancellation:'G(q,-1)=q^(ab)',
      bottom_cancellation:'G(q,-q)=1',
      q_reciprocity:'[t^s]G(q,t)=q^(ab-s)[t^s]G(q^-1,t)',
      bounded_transpose_symmetry:true,
      basis_free_canonical_geometry_claimed:false,
      physical_claimed:false,
      temporal_reversal_claimed:false,
      probability_claimed:false,
    }),
    membranes:freeze([
      'GAUSSIAN_GRADING != MOBIUS_SUPPORT_GRADING',
      'TWO_VARIABLE_DEFORMATION != TWO_PHYSICAL_DIMENSIONS',
      'FORMAL_Q != FIELD_PRIME_P',
      'FORMAL_T != TIME_PARAMETER',
      'Q_RECIPROCITY != TEMPORAL_REVERSAL',
      'T_MINUS_ONE_CANCELLATION != DELETION_OF_EVIDENCE',
      'T_MINUS_Q_CANCELLATION != PHYSICAL_ANNIHILATION',
      'EXTREMAL_CANCELLATION != NEW_GENERAL_MOBIUS_THEOREM',
      'GAUSSIAN_MULTINOMIAL != PROBABILITY_DISTRIBUTION',
      'FINITE_TRANSPOSE_SYMMETRY != ATLAS_PHYSICAL_DUALITY',
      'FINITE_Q_POLYNOMIAL != ASYMPTOTIC_GEOMETRY',
      'ORDERED_FIXED_FLAG_MODEL != BASIS_FREE_CANONICAL_GEOMETRY',
      'ORDER_ISOMORPHISM != FUNCTORIAL_EQUIVALENCE',
      'SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY',
      'ATLAS_REGISTRATION != LIVE_RUNTIME_STATE',
    ]),
    passed:exact,
  });
  return cached;
}

export const ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_CERTIFICATE=atlasSchubertGaussianDelannoyCertificate();
