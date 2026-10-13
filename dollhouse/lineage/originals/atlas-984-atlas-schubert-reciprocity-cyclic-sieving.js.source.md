import { atlasSchubertGaussianDelannoyClosedPolynomial } from './atlas-schubert-gaussian-delannoy.js';
import { ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_RECIPROCITY_CERTIFICATE, atlasSchubertGaussianDelannoyReciprocityInvolution } from './atlas-schubert-gaussian-delannoy-reciprocity.js';

export const ATLAS_SCHUBERT_RECIPROCITY_CYCLIC_SIEVING_SCHEMA='td613.dome-world.atlas-schubert-reciprocity-cyclic-sieving/v0.1';
export const ATLAS_SCHUBERT_RECIPROCITY_CYCLIC_SIEVING_PARENT_RECEIPT='5cdbbd3713ccf5798523ff96d6db75df0367fadd';

const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function words(a,b){const out=[];const rec=(z,o,p)=>{if(!z&&!o){out.push(p);return;}if(z)rec(z-1,o,[...p,0]);if(o)rec(z,o-1,[...p,1]);};rec(a,b,[]);return out;}
function desc(w){const out=[];for(let i=0;i+1<w.length;i++)if(w[i]===1&&w[i+1]===0)out.push(i);return out;}
function subsets(xs){const out=[[]];for(const x of xs){const n=out.length;for(let i=0;i<n;i++)out.push([...out[i],x]);}return out;}
function evaluate(coeffs,q){q=BigInt(q);let p=1n,v=0n;for(const c of coeffs){v+=BigInt(c)*p;p*=q;}return v;}
function factorial(n){let v=1n;for(let i=2n;i<=BigInt(n);i++)v*=i;return v;}
export function atlasSchubertReciprocityClosedFixedCount(a,b,s){
  const parts=[a-s,b-s,s];if(parts.some(x=>x<0)||parts.filter(x=>x%2!==0).length>1)return 0;
  const halves=parts.map(x=>Math.floor(x/2)),N=Math.floor((a+b-s)/2);
  let v=factorial(N);for(const x of halves)v/=factorial(x);return Number(v);
}
export function atlasSchubertReciprocityNormalizedSlice(d,k,s){
  const poly=atlasSchubertGaussianDelannoyClosedPolynomial(d,k);const shift=s*(s-1)/2,row=poly[s]??['0'];
  return row.slice(shift).map(String);
}

let cached=null;
export function atlasSchubertReciprocityCyclicSievingCertificate(){
  if(cached)return cached;
  const parentExact=ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_RECIPROCITY_CERTIFICATE.passed===true;
  let formalCells=0,gapSlices=0,supportObjects=0,fixedObjects=0,nonfixedTwoCycles=0,slicesWithFixed=0,slicesWithoutFixed=0;
  let h1Failures=0,hMinus1Failures=0,closedFormulaFailures=0,orbitFailures=0,oddPartsZeroFailures=0;
  const profiles={};
  for(let d=1;d<=7;d++)for(let k=0;k<=5;k++){
    formalCells++;const a=d-1;
    for(let s=0;s<=Math.min(a,k);s++){
      gapSlices++;let support=0,fixed=0;
      for(const w of words(a,k))for(const marks of subsets(desc(w))){if(marks.length!==s)continue;support++;const J=atlasSchubertGaussianDelannoyReciprocityInvolution(w,marks);if(same(J.lower_prime,w)&&same(J.marks_prime,marks))fixed++;}
      supportObjects+=support;fixedObjects+=fixed;const twoCycles=(support-fixed)/2;nonfixedTwoCycles+=twoCycles;
      if(fixed)slicesWithFixed++;else slicesWithoutFixed++;
      const H=atlasSchubertReciprocityNormalizedSlice(d,k,s),h1=Number(evaluate(H,1)),hm1=Number(evaluate(H,-1)),closed=atlasSchubertReciprocityClosedFixedCount(a,k,s);
      if(h1!==support)h1Failures++;
      if(hm1!==fixed)hMinus1Failures++;
      if(closed!==fixed||closed!==hm1)closedFormulaFailures++;
      if(support!==fixed+2*twoCycles||!Number.isInteger(twoCycles))orbitFailures++;
      const oddParts=[a-s,k-s,s].filter(x=>x%2!==0).length;if(oddParts>1&&(fixed!==0||hm1!==0))oddPartsZeroFailures++;
      profiles[`d${d}k${k}s${s}`]=freeze({support,fixed,nonfixed_two_cycles:twoCycles,H_at_1:h1,H_at_minus_1:hm1,closed_fixed_count:closed});
    }
  }
  const rawNegativeControl=(()=>{const s=2,row=atlasSchubertGaussianDelannoyClosedPolynomial(5,4)[s];return Number(evaluate(row,-1))<0&&Number(evaluate(atlasSchubertReciprocityNormalizedSlice(5,4,s),-1))>0;})();
  const multipleOddZeroControl=atlasSchubertReciprocityClosedFixedCount(2,2,1)===0;
  const exact=parentExact&&formalCells===42&&gapSlices===112&&supportObjects===9912&&fixedObjects===190&&nonfixedTwoCycles===4861&&slicesWithFixed===68&&slicesWithoutFixed===44&&h1Failures===0&&hMinus1Failures===0&&closedFormulaFailures===0&&orbitFailures===0&&oddPartsZeroFailures===0&&rawNegativeControl&&multipleOddZeroControl;
  cached=freeze({schema:ATLAS_SCHUBERT_RECIPROCITY_CYCLIC_SIEVING_SCHEMA,parent_receipt:ATLAS_SCHUBERT_RECIPROCITY_CYCLIC_SIEVING_PARENT_RECEIPT,parent_exact:parentExact,formal_cells:formalCells,gap_slices:gapSlices,support_objects:supportObjects,fixed_objects:fixedObjects,nonfixed_two_cycles:nonfixedTwoCycles,slices_with_fixed_points:slicesWithFixed,slices_without_fixed_points:slicesWithoutFixed,H_at_1_failures:h1Failures,H_at_minus_1_failures:hMinus1Failures,closed_fixed_formula_failures:closedFormulaFailures,orbit_decomposition_failures:orbitFailures,multiple_odd_parts_zero_failures:oddPartsZeroFailures,hostile_controls:freeze({triangular_normalization_required:rawNegativeControl,multiple_odd_parts_force_zero:multipleOddZeroControl}),profiles:freeze(profiles),laws:freeze({normalized_slice:'H=q^(-s(s-1)/2)[t^s]G',C2_action:'<J_s>',cyclic_sieving:'H(1)=|X| and H(-1)=|Fix(J_s)|',closed_fixed_count:'0 if >1 odd part; otherwise multinomial of half-parts',negative_field_size_claimed:false,temporal_periodicity_claimed:false,general_csp_claimed:false}),passed:exact});
  return cached;
}
export const ATLAS_SCHUBERT_RECIPROCITY_CYCLIC_SIEVING_CERTIFICATE=atlasSchubertReciprocityCyclicSievingCertificate();
