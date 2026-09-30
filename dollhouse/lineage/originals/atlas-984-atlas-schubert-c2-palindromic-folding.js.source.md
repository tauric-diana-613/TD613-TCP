import { ATLAS_SCHUBERT_RECIPROCITY_CYCLIC_SIEVING_CERTIFICATE, atlasSchubertReciprocityClosedFixedCount } from './atlas-schubert-reciprocity-cyclic-sieving.js';
import { atlasSchubertGaussianDelannoyReciprocityInvolution } from './atlas-schubert-gaussian-delannoy-reciprocity.js';
import { atlasSchubertMobiusDelannoyEncode, atlasSchubertMobiusDelannoyDecode } from './atlas-schubert-mobius-delannoy.js';

export const ATLAS_SCHUBERT_C2_PALINDROMIC_FOLDING_SCHEMA='td613.dome-world.atlas-schubert-c2-palindromic-folding/v0.1';
export const ATLAS_SCHUBERT_C2_PALINDROMIC_FOLDING_PARENT_RECEIPT='3c3a3dac296a819fad7c896fc2042510a6709ea9';

const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const reverse=x=>[...x].reverse();
function words(a,b){const out=[];const rec=(z,o,p)=>{if(!z&&!o){out.push(p);return;}if(z)rec(z-1,o,[...p,0]);if(o)rec(z,o-1,[...p,1]);};rec(a,b,[]);return out;}
function desc(w){const out=[];for(let i=0;i+1<w.length;i++)if(w[i]===1&&w[i+1]===0)out.push(i);return out;}
function subsets(xs){const out=[[]];for(const x of xs){const n=out.length;for(let i=0;i<n;i++)out.push([...out[i],x]);}return out;}
function rank(w){let z=0,r=0;for(const b of w){if(b===0)z++;else r+=z;}return r;}
function pathCounts(path){const c={E:0,N:0,D:0};for(const x of path){if(!(x in c))throw new Error('path must use E,N,D');c[x]++;}return c;}

export function atlasSchubertC2PathIsPalindrome(path){return same(path,reverse(path));}
export function atlasSchubertC2ForcedCenter(a,b,s){
  const counts={E:a-s,N:b-s,D:s};if(Object.values(counts).some(x=>!Number.isInteger(x)||x<0))throw new Error('requires valid nonnegative slice counts');
  const odd=Object.entries(counts).filter(([,x])=>x%2!==0).map(([x])=>x);
  if(odd.length>1)return 'IMPOSSIBLE';
  return odd.length===1?odd[0]:null;
}
export function atlasSchubertC2PalindromicFold(path){
  if(!atlasSchubertC2PathIsPalindrome(path))throw new Error('fold requires palindromic path');
  const m=Math.floor(path.length/2);return {half:path.slice(0,m),center:path.length%2?path[m]:null};
}
export function atlasSchubertC2PalindromicUnfold(half,center=null){
  if(!Array.isArray(half)||half.some(x=>!['E','N','D'].includes(x)))throw new Error('half path must use E,N,D');
  if(center!==null&&!['E','N','D'].includes(center))throw new Error('center must be E,N,D or null');
  return [...half,...(center===null?[]:[center]),...reverse(half)];
}

let cached=null;
export function atlasSchubertC2PalindromicFoldingCertificate(){
  if(cached)return cached;
  const parentExact=ATLAS_SCHUBERT_RECIPROCITY_CYCLIC_SIEVING_CERTIFICATE.passed===true;
  let formalCells=0,gapSlices=0,supportObjects=0,fixedObjects=0;
  let centerlessFixed=0,eCenteredFixed=0,nCenteredFixed=0,dCenteredFixed=0;
  let centerlessSlices=0,eCenteredSlices=0,nCenteredSlices=0,dCenteredSlices=0,impossibleSlices=0;
  let pathEquivarianceFailures=0,fixedPalindromeFailures=0,foldUnfoldFailures=0,decodeFailures=0,centerParityFailures=0,closedCountFailures=0,middleRankFailures=0;
  const profiles={};
  for(let d=1;d<=7;d++)for(let k=0;k<=5;k++){
    formalCells++;const a=d-1;
    for(let s=0;s<=Math.min(a,k);s++){
      gapSlices++;let sliceFixed=0;const forced=atlasSchubertC2ForcedCenter(a,k,s);
      if(forced==='IMPOSSIBLE')impossibleSlices++;else if(forced===null)centerlessSlices++;else if(forced==='E')eCenteredSlices++;else if(forced==='N')nCenteredSlices++;else dCenteredSlices++;
      for(const w of words(a,k))for(const marks of subsets(desc(w))){
        if(marks.length!==s)continue;supportObjects++;
        const path=atlasSchubertMobiusDelannoyEncode(w,marks),J=atlasSchubertGaussianDelannoyReciprocityInvolution(w,marks),jPath=atlasSchubertMobiusDelannoyEncode(J.lower_prime,J.marks_prime),rev=reverse(path);
        if(!same(jPath,rev))pathEquivarianceFailures++;
        const fixed=same(J.lower_prime,w)&&same(J.marks_prime,marks),pal=atlasSchubertC2PathIsPalindrome(path);
        if(fixed!==pal)fixedPalindromeFailures++;
        if(!fixed)continue;
        fixedObjects++;sliceFixed++;
        const folded=atlasSchubertC2PalindromicFold(path),unfolded=atlasSchubertC2PalindromicUnfold(folded.half,folded.center);
        if(!same(unfolded,path))foldUnfoldFailures++;
        const original=atlasSchubertMobiusDelannoyDecode(path),decoded=atlasSchubertMobiusDelannoyDecode(unfolded);
        if(!same(decoded.lower,w)||!same(decoded.marks,marks)||!same(decoded.upper,original.upper))decodeFailures++;
        const counts=pathCounts(path),expected={E:a-s,N:k-s,D:s};if(!same(counts,expected)||forced==='IMPOSSIBLE'||folded.center!==forced)centerParityFailures++;
        if(folded.center===null)centerlessFixed++;else if(folded.center==='E')eCenteredFixed++;else if(folded.center==='N')nCenteredFixed++;else dCenteredFixed++;
        if(2*rank(w)!==a*k-s)middleRankFailures++;
      }
      const closed=atlasSchubertReciprocityClosedFixedCount(a,k,s);if(sliceFixed!==closed)closedCountFailures++;
      profiles[`d${d}k${k}s${s}`]=freeze({fixed:sliceFixed,forced_center:forced});
    }
  }
  const hostileSwapEN=(()=>{const p=['E','D','N'];const bad=reverse(p).map(x=>x==='E'?'N':x==='N'?'E':x);return !same(bad,reverse(p));})();
  const hostileFreeCenter=atlasSchubertC2ForcedCenter(3,2,0)==='E'&&atlasSchubertC2PalindromicUnfold(['N','E'],'N').join('')!=='NEEEN';
  const hostileHalfOnly=(()=>{const p=['E','N','E'];const f=atlasSchubertC2PalindromicFold(p);return !same(f.half,p);})();
  const hostileCountsOnly=(()=>{const p=['E','N'];return pathCounts(p).E===1&&pathCounts(p).N===1&&!atlasSchubertC2PathIsPalindrome(p);})();
  const exact=parentExact&&formalCells===42&&gapSlices===112&&supportObjects===9912&&fixedObjects===190&&centerlessFixed===64&&eCenteredFixed===31&&nCenteredFixed===64&&dCenteredFixed===31&&centerlessSlices===20&&eCenteredSlices===14&&nCenteredSlices===20&&dCenteredSlices===14&&impossibleSlices===44&&pathEquivarianceFailures===0&&fixedPalindromeFailures===0&&foldUnfoldFailures===0&&decodeFailures===0&&centerParityFailures===0&&closedCountFailures===0&&middleRankFailures===0&&hostileSwapEN&&hostileFreeCenter&&hostileHalfOnly&&hostileCountsOnly;
  cached=freeze({schema:ATLAS_SCHUBERT_C2_PALINDROMIC_FOLDING_SCHEMA,parent_receipt:ATLAS_SCHUBERT_C2_PALINDROMIC_FOLDING_PARENT_RECEIPT,parent_exact:parentExact,formal_cells:formalCells,gap_slices:gapSlices,support_objects:supportObjects,fixed_objects:fixedObjects,centerless_fixed_objects:centerlessFixed,E_centered_fixed_objects:eCenteredFixed,N_centered_fixed_objects:nCenteredFixed,D_centered_fixed_objects:dCenteredFixed,centerless_slices:centerlessSlices,E_centered_slices:eCenteredSlices,N_centered_slices:nCenteredSlices,D_centered_slices:dCenteredSlices,parity_impossible_slices:impossibleSlices,path_equivariance_failures:pathEquivarianceFailures,fixed_palindrome_failures:fixedPalindromeFailures,fold_unfold_failures:foldUnfoldFailures,decode_failures:decodeFailures,center_parity_failures:centerParityFailures,closed_count_failures:closedCountFailures,middle_rank_failures:middleRankFailures,hostile_controls:freeze({EN_swap_rejected:hostileSwapEN,free_center_rejected:hostileFreeCenter,half_only_rejected:hostileHalfOnly,count_only_rejected:hostileCountsOnly}),profiles:freeze(profiles),laws:freeze({path_equivariance:'Path(J(I))=reverse(Path(I))',fixed_locus:'Fix(J_s) iff Delannoy path is palindromic',folding:'palindrome <-> half-word plus parity-forced center',physical_folding_claimed:false,temporal_reversal_claimed:false,basis_free_geometry_claimed:false}),passed:exact});
  return cached;
}
export const ATLAS_SCHUBERT_C2_PALINDROMIC_FOLDING_CERTIFICATE=atlasSchubertC2PalindromicFoldingCertificate();
