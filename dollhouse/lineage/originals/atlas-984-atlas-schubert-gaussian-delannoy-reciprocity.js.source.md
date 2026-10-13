import { ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_CERTIFICATE, atlasSchubertGaussianDelannoyClosedPolynomial } from './atlas-schubert-gaussian-delannoy.js';
import { atlasSchubertMobiusDelannoyEncode, atlasSchubertMobiusDelannoyDecode } from './atlas-schubert-mobius-delannoy.js';

export const ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_RECIPROCITY_SCHEMA='td613.dome-world.atlas-schubert-gaussian-delannoy-reciprocity/v0.1';
export const ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_RECIPROCITY_PARENT_RECEIPT='235770c9984c74e0b518fe69577bf1ceb1404fd3';

const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function words(a,b){const out=[];const rec=(z,o,p)=>{if(!z&&!o){out.push(p);return;}if(z)rec(z-1,o,[...p,0]);if(o)rec(z,o-1,[...p,1]);};rec(a,b,[]);return out;}
function desc(w){const out=[];for(let i=0;i+1<w.length;i++)if(w[i]===1&&w[i+1]===0)out.push(i);return out;}
function subsets(xs){const out=[[]];for(const x of xs){const n=out.length;for(let i=0;i<n;i++)out.push([...out[i],x]);}return out;}
function swap(w,marks){const x=[...w];for(const p of marks){x[p]=0;x[p+1]=1;}return x;}
function rank(w){let z=0,r=0;for(const b of w){if(b===0)z++;else r+=z;}return r;}
function count(w,bit){return w.reduce((n,x)=>n+(x===bit),0);}

export function atlasSchubertGaussianDelannoyReciprocityInvolution(lower,marks){
  const upper=swap(lower,marks),n=lower.length;
  const lowerPrime=[...upper].reverse();
  const marksPrime=[...marks].map(p=>n-2-p).sort((a,b)=>a-b);
  const upperPrime=swap(lowerPrime,marksPrime);
  return {lower:[...lower],upper,marks:[...marks],lower_prime:lowerPrime,upper_prime:upperPrime,marks_prime:marksPrime};
}

let cached=null;
export function atlasSchubertGaussianDelannoyReciprocityCertificate(){
  if(cached)return cached;
  const parentExact=ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_CERTIFICATE.passed===true;
  let formalCells=0,objects=0,fixed=0,fixedCellFailures=0,supportFailures=0,markFailures=0,gapFailures=0,involutionFailures=0,lowerRankFailures=0,upperRankFailures=0,sliceFailures=0,fixedRankFailures=0;
  const profiles={};
  for(let d=1;d<=7;d++)for(let k=0;k<=5;k++){
    formalCells++;const a=d-1,hist={},pairHist={};let cellObjects=0,cellFixed=0;
    for(const w of words(a,k))for(const marks of subsets(desc(w))){
      const J=atlasSchubertGaussianDelannoyReciprocityInvolution(w,marks),s=marks.length,r=rank(w),rp=rank(J.lower_prime);objects++;cellObjects++;
      if(count(J.lower_prime,0)!==a||count(J.lower_prime,1)!==k||count(J.upper_prime,0)!==a||count(J.upper_prime,1)!==k)fixedCellFailures++;
      const validMarks=desc(J.lower_prime);if(J.marks_prime.some(p=>!validMarks.includes(p)))markFailures++;
      const decoded=atlasSchubertMobiusDelannoyDecode(atlasSchubertMobiusDelannoyEncode(J.lower_prime,J.marks_prime));if(!same(decoded.lower,J.lower_prime)||!same(decoded.upper,J.upper_prime))supportFailures++;
      if(rank(J.upper_prime)-rp!==s)gapFailures++;
      const JJ=atlasSchubertGaussianDelannoyReciprocityInvolution(J.lower_prime,J.marks_prime);if(!same(JJ.lower_prime,w)||!same(JJ.marks_prime,marks)||!same(JJ.upper_prime,J.upper))involutionFailures++;
      if(r+rp!==a*k-s)lowerRankFailures++;
      if(rank(J.upper)+rank(J.upper_prime)!==a*k+s)upperRankFailures++;
      hist[s]??={};hist[s][r]=(hist[s][r]??0)+1;pairHist[s]??={};pairHist[s][rp]=(pairHist[s][rp]??0)+1;
      if(same(J.lower_prime,w)&&same(J.marks_prime,marks)){fixed++;cellFixed++;if(2*r!==a*k-s)fixedRankFailures++;}
    }
    const poly=atlasSchubertGaussianDelannoyClosedPolynomial(d,k);
    for(let s=0;s<poly.length;s++){
      const row=poly[s],degree=a*k-s;
      for(let q=0;q<=degree;q++)if(Number(row[q]??'0')!==(hist[s]?.[q]??0)||Number(row[degree-q]??'0')!==(pairHist[s]?.[q]??0)){sliceFailures++;break;}
    }
    profiles[`d${d}k${k}`]=freeze({objects:cellObjects,fixed:cellFixed});
  }
  const hostileV01=(()=>{const w=[1,0,0],x=[...w].reverse().map(b=>1-b);return count(x,0)!==count(w,0)||count(x,1)!==count(w,1);})();
  const hostileReverseLower=(()=>{const w=[1,0],marks=[0],bad=[...w].reverse();return rank(w)+rank(bad)!==1-1;})();
  const hostileBadOffset=(()=>{const w=[1,0,1,0],marks=[0,2],n=w.length,bad=marks.map(p=>n-1-p);return bad.some(p=>!desc(swap(w,marks).reverse()).includes(p));})();
  const passed=parentExact&&formalCells===42&&objects===9912&&fixed===190&&fixedCellFailures===0&&supportFailures===0&&markFailures===0&&gapFailures===0&&involutionFailures===0&&lowerRankFailures===0&&upperRankFailures===0&&sliceFailures===0&&fixedRankFailures===0&&hostileV01&&hostileReverseLower&&hostileBadOffset;
  cached=freeze({schema:ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_RECIPROCITY_SCHEMA,parent_receipt:ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_RECIPROCITY_PARENT_RECEIPT,parent_exact:parentExact,formal_cells:formalCells,support_objects:objects,fixed_objects:fixed,fixed_cell_failures:fixedCellFailures,support_failures:supportFailures,mark_transport_failures:markFailures,gap_failures:gapFailures,involution_failures:involutionFailures,lower_rank_complement_failures:lowerRankFailures,upper_rank_complement_failures:upperRankFailures,slice_histogram_failures:sliceFailures,fixed_point_rank_failures:fixedRankFailures,hostile_controls:freeze({failed_v0_1_reverse_complement_rejected:hostileV01,reverse_lower_rejected:hostileReverseLower,bad_mark_offset_rejected:hostileBadOffset}),profiles:freeze(profiles),laws:freeze({involution:'J(w,u)=(reverse(u),reverse(w))',mark_transport:'p -> n-2-p',lower_rank_sum:'r_low+r_low_prime=ab-s',upper_rank_sum:'r_up+r_up_prime=ab+s',physical_time_reversal_claimed:false,basis_free_duality_claimed:false}),passed});
  return cached;
}
export const ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_RECIPROCITY_CERTIFICATE=atlasSchubertGaussianDelannoyReciprocityCertificate();
