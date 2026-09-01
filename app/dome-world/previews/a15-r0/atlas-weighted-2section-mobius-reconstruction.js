import {
  ATLAS_CAPACITY_VECTOR_MARKED_2SECTION_RECONSTRUCTION_SCHEMA,
  atlasCapacityVectorMarked2SectionReconstructionCertificate,
} from './atlas-capacity-vector-marked-2section-reconstruction.js';

export const ATLAS_WEIGHTED_2SECTION_MOBIUS_RECONSTRUCTION_SCHEMA='td613.dome-world.atlas-weighted-2section-mobius-reconstruction/v0.1';
export const ATLAS_WEIGHTED_2SECTION_MOBIUS_RECONSTRUCTION_PARENT_RECEIPT='578be6f432cffa67dbaf6da0a47cb9d36c0fb68f';

const GROUND=Object.freeze([0,1,2,3,4,5]);
let cached=null;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
function combinations(xs,k){const out=[];function rec(s,p){if(p.length===k){out.push([...p]);return;}for(let i=s;i<xs.length;i++)rec(i+1,[...p,xs[i]]);}rec(0,[]);return out;}
const BLOCKS=Object.freeze([2,3,4].flatMap(k=>combinations(GROUND,k)).map(x=>Object.freeze(x)));
const intersectionSize=(a,b)=>a.reduce((n,x)=>n+(b.includes(x)?1:0),0);
function supportKey(s){return `${s.length}:${s.join(',')}`;}
function canonicalSupports(xs){return Object.freeze([...xs].map(s=>Object.freeze([...s].sort((a,b)=>a-b))).sort((a,b)=>supportKey(a).localeCompare(supportKey(b))));}
function rawSupports(H){
  const union=GROUND.filter(e=>H.some(b=>b.includes(e)));
  return canonicalSupports(union.map(e=>H.map((b,i)=>b.includes(e)?i:null).filter(i=>i!==null)));
}
function multiplicities(raw,minSize=1){
  const m=new Map();
  for(const s of raw)if(s.length>=minSize){const k=s.join(',');const prior=m.get(k);if(prior)prior.multiplicity++;else m.set(k,{support:[...s],multiplicity:1});}
  return Object.freeze([...m.values()].sort((a,b)=>supportKey(a.support).localeCompare(supportKey(b.support))).map(x=>freeze(x)));
}
function receiver(H,{weighted=true}={}){
  const raw=rawSupports(H),pair_weights=[];
  for(let i=0;i<H.length;i++)for(let j=i+1;j<H.length;j++){
    const w=intersectionSize(H[i],H[j]);
    if(w>0)pair_weights.push(Object.freeze([i,j,weighted?w:1]));
  }
  return freeze({block_count:H.length,capacities:Object.freeze(H.map(b=>b.length)),pair_weights:Object.freeze(pair_weights),high_supports:multiplicities(raw,3)});
}
function highContribution(high,i,j){let n=0;for(const x of high)if(x.support.includes(i)&&x.support.includes(j))n+=x.multiplicity;return n;}
function reconstruct(R){
  const out=[];let negative_pair_residuals=0,negative_singleton_residuals=0;
  for(const x of R.high_supports)for(let n=0;n<x.multiplicity;n++)out.push([...x.support]);
  const pairMultiplicity=new Map();
  for(const [i,j,w] of R.pair_weights){
    const residual=w-highContribution(R.high_supports,i,j);
    if(!Number.isInteger(residual)||residual<0){negative_pair_residuals++;continue;}
    pairMultiplicity.set(`${i},${j}`,residual);
    for(let n=0;n<residual;n++)out.push([i,j]);
  }
  const singletonMultiplicity=[];
  for(let i=0;i<R.block_count;i++){
    let shared=0;
    for(const x of R.high_supports)if(x.support.includes(i))shared+=x.multiplicity;
    for(const [k,v] of pairMultiplicity){if(v<=0)continue;const [a,b]=k.split(',').map(Number);if(a===i||b===i)shared+=v;}
    const residual=R.capacities[i]-shared;singletonMultiplicity.push(residual);
    if(!Number.isInteger(residual)||residual<0){negative_singleton_residuals++;continue;}
    for(let n=0;n<residual;n++)out.push([i]);
  }
  return freeze({rejected:negative_pair_residuals>0||negative_singleton_residuals>0,incidence_neighborhoods:canonicalSupports(out),negative_pair_residuals,negative_singleton_residuals,singleton_multiplicities:Object.freeze(singletonMultiplicity)});
}
function isNonlinear(H){for(let i=0;i<H.length;i++)for(let j=i+1;j<H.length;j++)if(intersectionSize(H[i],H[j])>1)return true;return false;}
function isNonuniform(H){return new Set(H.map(b=>b.length)).size>1;}
function highMultiplicityHistogram(R,h){for(const x of R.high_supports)h[x.multiplicity]=(h[x.multiplicity]||0)+1;}
function receiverWithoutCapacity(R){return JSON.stringify({pair_weights:R.pair_weights,high_supports:R.high_supports});}
function receiverWithoutHigh(R){return JSON.stringify({capacities:R.capacities,pair_weights:R.pair_weights});}

export function atlasWeighted2SectionMobiusReconstructionCertificate(){
  if(cached)return cached;
  const parent=atlasCapacityVectorMarked2SectionReconstructionCertificate();
  const parentExact=parent.passed===true&&ATLAS_CAPACITY_VECTOR_MARKED_2SECTION_RECONSTRUCTION_SCHEMA==='td613.dome-world.atlas-capacity-vector-marked-2section-reconstruction/v0.1';
  let families=0,totalBlocks=0,pairChecks=0,membership=0,supportEntries=0,nonuniform=0,nonlinear=0,nonlinearNonuniform=0,marked=0,nonlinearMarked=0,positivePairEntries=0,pairWeightSum=0,positiveResidualPairEntries=0,residualPairSum=0,residualGt1=0,weightedSuccess=0,weightedFailures=0,unweightedSuccess=0,unweightedFailures=0,highSupportElements=0,highSupportDistinct=0,maxPairWeight=0,maxHighMultiplicity=0,maxResidualPairMultiplicity=0;
  const byBlocks={},highHist={};
  const weightedFailureCodes=[],unweightedFailureCodes=[],nonlinearCodes=[];
  for(let r=1;r<=3;r++)for(const H0 of combinations(BLOCKS,r)){
    const H=H0.map(b=>b);families++;byBlocks[r]=(byBlocks[r]||0)+1;totalBlocks+=r;membership+=GROUND.length*r;pairChecks+=r*(r-1)/2;
    const raw=rawSupports(H),Rw=receiver(H,{weighted:true}),Ru=receiver(H,{weighted:false});supportEntries+=raw.length;
    const code=H.map(b=>b.join('')).join('|');const nl=isNonlinear(H),nu=isNonuniform(H);if(nl){nonlinear++;nonlinearCodes.push(code);}if(nu)nonuniform++;if(nl&&nu)nonlinearNonuniform++;
    if(Rw.high_supports.length){marked++;if(nl)nonlinearMarked++;}
    highMultiplicityHistogram(Rw,highHist);
    highSupportDistinct+=Rw.high_supports.length;for(const x of Rw.high_supports){highSupportElements+=x.multiplicity;maxHighMultiplicity=Math.max(maxHighMultiplicity,x.multiplicity);}
    for(const [i,j,w] of Rw.pair_weights){positivePairEntries++;pairWeightSum+=w;maxPairWeight=Math.max(maxPairWeight,w);const residual=w-highContribution(Rw.high_supports,i,j);if(residual>0){positiveResidualPairEntries++;residualPairSum+=residual;maxResidualPairMultiplicity=Math.max(maxResidualPairMultiplicity,residual);}if(residual>1)residualGt1++;}
    const rw=reconstruct(Rw),ru=reconstruct(Ru),okW=!rw.rejected&&same(rw.incidence_neighborhoods,raw),okU=!ru.rejected&&same(ru.incidence_neighborhoods,raw);
    if(okW)weightedSuccess++;else{weightedFailures++;weightedFailureCodes.push(code);}if(okU)unweightedSuccess++;else{unweightedFailures++;unweightedFailureCodes.push(code);}
  }

  const capA=[[0,1],[0,2]],capB=[[0,1,3],[0,2]];
  const capRA=receiver(capA),capRB=receiver(capB);
  const highA=[[0,3],[1,3],[2,3]],highB=[[0,1],[0,2],[1,2]];
  const highRA=receiver(highA),highRB=receiver(highB);
  const necessity=freeze({
    capacity_removed_receiver_equal:receiverWithoutCapacity(capRA)===receiverWithoutCapacity(capRB),
    capacity_removed_raw_equal:same(rawSupports(capA),rawSupports(capB)),
    high_support_removed_receiver_equal:receiverWithoutHigh(highRA)===receiverWithoutHigh(highRB),
    high_support_removed_raw_equal:same(rawSupports(highA),rawSupports(highB)),
    isolated_degree_zero_recoverable:false,
  });
  const census=freeze({family_count_by_blocks:freeze({...byBlocks}),families,total_blocks:totalBlocks,pair_checks:pairChecks,membership_evaluations:membership,support_entries:supportEntries,nonuniform_families:nonuniform,nonlinear_families:nonlinear,nonlinear_nonuniform_families:nonlinearNonuniform,marked_families:marked,nonlinear_marked_families:nonlinearMarked,high_support_distinct_entries:highSupportDistinct,high_support_element_multiplicity:highSupportElements,high_support_multiplicity_histogram:freeze({...highHist}),positive_pair_entries:positivePairEntries,pair_weight_sum:pairWeightSum,positive_residual_pair_entries:positiveResidualPairEntries,residual_pair_multiplicity_sum:residualPairSum,residual_pair_entries_multiplicity_gt1:residualGt1,weighted_successes:weightedSuccess,weighted_failures:weightedFailures,unweighted_successes:unweightedSuccess,unweighted_failures:unweightedFailures,max_pair_weight:maxPairWeight,max_high_support_multiplicity:maxHighMultiplicity,max_residual_pair_multiplicity:maxResidualPairMultiplicity,unweighted_failure_set_equals_nonlinear_set:same([...unweightedFailureCodes].sort(),[...nonlinearCodes].sort()),weighted_failure_codes:Object.freeze(weightedFailureCodes)});
  const expected={family_count_by_blocks:{1:50,2:1225,3:19600},families:20875,total_blocks:61300,pair_checks:60025,membership_evaluations:367800,support_entries:109500,nonuniform_families:18375,nonlinear_families:16490,nonlinear_nonuniform_families:14820,marked_families:11405,nonlinear_marked_families:11015,high_support_distinct_entries:11405,high_support_element_multiplicity:13800,high_support_multiplicity_histogram:{1:9090,2:2235,3:80},positive_pair_entries:53655,pair_weight_sum:88200,positive_residual_pair_entries:37500,residual_pair_multiplicity_sum:46800,residual_pair_entries_multiplicity_gt1:8700,weighted_successes:20875,weighted_failures:0,unweighted_successes:4385,unweighted_failures:16490,max_pair_weight:3,max_high_support_multiplicity:3,max_residual_pair_multiplicity:3,unweighted_failure_set_equals_nonlinear_set:true,weighted_failure_codes:[]};
  const exact=parentExact&&same(census,expected)&&same(necessity,{capacity_removed_receiver_equal:true,capacity_removed_raw_equal:false,high_support_removed_receiver_equal:true,high_support_removed_raw_equal:false,isolated_degree_zero_recoverable:false});
  cached=freeze({schema:ATLAS_WEIGHTED_2SECTION_MOBIUS_RECONSTRUCTION_SCHEMA,parent_receipt:ATLAS_WEIGHTED_2SECTION_MOBIUS_RECONSTRUCTION_PARENT_RECEIPT,parent_exact:parentExact,census,necessity_controls:necessity,proof_ledger:freeze({capacity_zeta_identity:'c_i=sum_{S superset {i}} mu(S)',pair_zeta_identity:'w_ij=sum_{S superset {i,j}} mu(S)',pair_residual_formula:'mu({i,j})=w_ij-sum_{S superset {i,j}, |S|>=3}mu(S)',singleton_residual_formula:'mu({i})=c_i-sum_{S contains i, |S|>=2}mu(S)',degree_zero_fixed_by_union_groundedness:true,linearity_used:false,uniformity_used:false}),laws:freeze({weighted_reconstruction_exact_on_declared_exhaustive_assay:weightedFailures===0&&weightedSuccess===families,unweighted_failure_set_equals_nonlinear_set_in_declared_assay:census.unweighted_failure_set_equals_nonlinear_set,general_theorem_authority_is_algebraic_not_sampling:true,capacity_labels_needed_for_singleton_stratum:necessity.capacity_removed_receiver_equal&&!necessity.capacity_removed_raw_equal,high_support_multiplicities_needed_to_disaggregate_pair_weights:necessity.high_support_removed_receiver_equal&&!necessity.high_support_removed_raw_equal,receiver_minimality_claimed:false,historical_source_identity_claimed:false,physical_network_claimed:false}),membranes:freeze(['WEIGHTED_2SECTION_PLUS_HIGH_SUPPORTS != UNIVERSAL_COMPRESSION','SUPPORT_MULTIPLICITY_RECONSTRUCTION != HISTORICAL_SOURCE_IDENTITY','ZETA_MOBIUS_RECONSTRUCTION != CAUSAL_INVERSION','PAIR_INTERSECTION_WEIGHT != PHYSICAL_EDGE_WEIGHT','HIGH_SUPPORT_MULTIPLICITY != CAUSAL_CONCURRENCY','FINITE_EXHAUSTIVE_ASSAY != PROOF_BY_SAMPLING','ATLAS_REGISTRATION != LIVE_RUNTIME_STATE']),passed:exact});
  return cached;
}

export const ATLAS_WEIGHTED_2SECTION_MOBIUS_RECONSTRUCTION_CERTIFICATE=atlasWeighted2SectionMobiusReconstructionCertificate();
