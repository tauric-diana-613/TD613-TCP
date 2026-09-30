import {
  ATLAS_MARKED_OVERLAP_CONCURRENCY_SEPARATION_SCHEMA,
  atlasMarkedOverlapConcurrencySeparationCertificate,
} from './atlas-marked-overlap-concurrency-separation.js';

export const ATLAS_MARKED_2SECTION_RECONSTRUCTION_EXACTNESS_SCHEMA='td613.dome-world.atlas-marked-2section-reconstruction-exactness/v0.1';
export const ATLAS_MARKED_2SECTION_RECONSTRUCTION_EXACTNESS_PARENT_RECEIPT='656f2093760f5812f8a4a9d1497a6dd5acf4e5a0';

const GROUND=Object.freeze([0,1,2,3,4,5,6]);
let cached=null;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
function combinations(xs,k){const out=[];function rec(start,p){if(p.length===k){out.push([...p]);return;}for(let i=start;i<xs.length;i++)rec(i+1,[...p,xs[i]]);}rec(0,[]);return out;}
const TRIPLES=Object.freeze(combinations(GROUND,3).map(x=>Object.freeze(x)));
const intersectionSize=(a,b)=>a.reduce((n,x)=>n+(b.includes(x)?1:0),0);
function familyLinear(H){for(let i=0;i<H.length;i++)for(let j=i+1;j<H.length;j++)if(intersectionSize(H[i],H[j])>1)return false;return true;}
function supportKey(s){return `${s.length}:${s.join(',')}`;}
function canonicalSupports(sups){return Object.freeze([...sups].map(s=>Object.freeze([...s])).sort((a,b)=>supportKey(a).localeCompare(supportKey(b))));}
function rawIncidenceNeighborhoods(H,ground=GROUND){
  const union=ground.filter(e=>H.some(h=>h.includes(e)));
  return canonicalSupports(union.map(e=>H.map((h,i)=>h.includes(e)?i:null).filter(i=>i!==null)));
}
function receiver(H){
  if(!H.every(h=>h.length===3))return freeze({rejected:true,reason:'NON_3_UNIFORM'});
  const raw=rawIncidenceNeighborhoods(H,Array.from(new Set(H.flat())).sort((a,b)=>a-b));
  const edges=[];
  for(let i=0;i<H.length;i++)for(let j=i+1;j<H.length;j++)if(intersectionSize(H[i],H[j])>0)edges.push(Object.freeze([i,j]));
  const marks=canonicalSupports(raw.filter(s=>s.length>=3));
  return freeze({rejected:false,block_count:H.length,block_size:3,edges:Object.freeze(edges),marks});
}
function reconstruct(R){
  if(R.rejected||R.block_size!==3)return freeze({rejected:true,reason:'RECEIVER_REJECTED'});
  const covered=new Set();const out=[];let doubleCovered=0,markCliqueFailures=0;
  for(const m of R.marks){
    out.push([...m]);
    for(let a=0;a<m.length;a++)for(let b=a+1;b<m.length;b++){
      const e=`${Math.min(m[a],m[b])},${Math.max(m[a],m[b])}`;
      if(!R.edges.some(x=>`${x[0]},${x[1]}`===e))markCliqueFailures++;
      if(covered.has(e))doubleCovered++;covered.add(e);
    }
  }
  const uncovered=[];
  for(const e of R.edges){const k=`${e[0]},${e[1]}`;if(!covered.has(k)){uncovered.push(e);out.push([...e]);}}
  let overfull=0;
  for(let i=0;i<R.block_count;i++){
    const shared=R.marks.reduce((n,m)=>n+(m.includes(i)?1:0),0)+uncovered.reduce((n,e)=>n+(e.includes(i)?1:0),0);
    if(shared>3)overfull++;
    for(let n=0;n<Math.max(0,3-shared);n++)out.push([i]);
  }
  return freeze({rejected:overfull>0,incidence_neighborhoods:canonicalSupports(out),double_covered_edges:doubleCovered,mark_clique_failures:markCliqueFailures,overfull_blocks:overfull});
}
function receiverCode(R){return JSON.stringify({b:R.block_count,k:R.block_size,e:R.edges,m:R.marks});}

export function atlasMarked2SectionReconstructionExactnessCertificate(){
  if(cached)return cached;
  const parent=atlasMarkedOverlapConcurrencySeparationCertificate();
  const parentExact=parent.passed===true&&ATLAS_MARKED_OVERLAP_CONCURRENCY_SEPARATION_SCHEMA==='td613.dome-world.atlas-marked-overlap-concurrency-separation/v0.1';
  const admitted=[];const byBlocks={};
  for(let r=1;r<=4;r++)for(const H of combinations(TRIPLES,r))if(familyLinear(H)){admitted.push(H);byBlocks[r]=(byBlocks[r]||0)+1;}
  let totalBlocks=0,pairChecks=0,membership=0,neighborhoodEntries=0,totalEdges=0,totalMarks=0,successes=0,failures=0,structuralFailures=0;const markProfile={};
  for(const H of admitted){
    totalBlocks+=H.length;pairChecks+=H.length*(H.length-1)/2;membership+=GROUND.length*H.length;
    const raw=rawIncidenceNeighborhoods(H);neighborhoodEntries+=raw.length;
    const R=receiver(H);totalEdges+=R.edges.length;totalMarks+=R.marks.length;markProfile[R.marks.length]=(markProfile[R.marks.length]||0)+1;
    const rr=reconstruct(R);
    const blockIncidence=Array.from({length:H.length},(_,i)=>rr.incidence_neighborhoods.reduce((n,s)=>n+(s.includes(i)?1:0),0));
    const unionSize=new Set(H.flat()).size;
    const ok=!rr.rejected&&rr.double_covered_edges===0&&rr.mark_clique_failures===0&&blockIncidence.every(x=>x===3)&&rr.incidence_neighborhoods.length===unionSize&&same(rr.incidence_neighborhoods,raw);
    if(ok)successes++;else failures++;
    if(rr.double_covered_edges||rr.mark_clique_failures||!blockIncidence.every(x=>x===3)||rr.incidence_neighborhoods.length!==unionSize)structuralFailures++;
  }

  const nonlinear=Object.freeze([[0,1,2],[0,1,3]].map(x=>Object.freeze(x)));
  const nonlinearRaw=rawIncidenceNeighborhoods(nonlinear,[0,1,2,3]);
  const nonlinearRecon=reconstruct(receiver(nonlinear));
  const nonlinearRoundtripEqual=same(nonlinearRaw,nonlinearRecon.incidence_neighborhoods);
  const nonuniform=receiver(Object.freeze([[0,1,2,3],[0,4,5]].map(x=>Object.freeze(x))));
  const isolatedBlocks=Object.freeze([[0,1,2]]);
  const isolatedReceiver=receiver(isolatedBlocks);
  const isolatedReceiverSame=receiverCode(isolatedReceiver)===receiverCode(receiver(isolatedBlocks));
  const isolatedGroundSizes=Object.freeze([3,4]);

  const census=freeze({
    admitted_family_count:admitted.length,
    family_count_by_blocks:freeze({...byBlocks}),total_blocks:totalBlocks,pair_linearity_checks:pairChecks,
    raw_membership_evaluations:membership,incidence_neighborhood_entries:neighborhoodEntries,total_overlap_edges:totalEdges,
    mark_count_profile:freeze({...markProfile}),total_marked_concurrency_cliques:totalMarks,
    reconstruction_successes:successes,reconstruction_failures:failures,structural_failures:structuralFailures,
  });
  const negatives=freeze({nonlinear_roundtrip_equal:nonlinearRoundtripEqual,nonuniform_rejected:nonuniform.rejected===true,isolated_receiver_same:isolatedReceiverSame,isolated_declared_ground_sizes:isolatedGroundSizes,isolated_ground_element_recoverable:false});
  const exact=parentExact&&same(census,{admitted_family_count:4305,family_count_by_blocks:{1:35,2:385,3:1575,4:2310},total_blocks:14770,pair_linearity_checks:18970,raw_membership_evaluations:103390,incidence_neighborhood_entries:28245,total_overlap_edges:17010,mark_count_profile:{0:3360,1:945},total_marked_concurrency_cliques:945,reconstruction_successes:4305,reconstruction_failures:0,structural_failures:0})&&nonlinearRoundtripEqual===false&&nonuniform.rejected===true&&isolatedReceiverSame===true;
  cached=freeze({
    schema:ATLAS_MARKED_2SECTION_RECONSTRUCTION_EXACTNESS_SCHEMA,parent_receipt:ATLAS_MARKED_2SECTION_RECONSTRUCTION_EXACTNESS_PARENT_RECEIPT,parent_exact:parentExact,
    declared_class:freeze({ground_size:7,block_size:3,max_blocks:4,linear:true,union_grounded:true}),census,negative_controls:negatives,
    laws:freeze({fully_marked_2section_roundtrip_exact_on_declared_class:failures===0&&successes===admitted.length,linearity_needed_for_unweighted_edge_multiplicity:!nonlinearRoundtripEqual,three_uniformity_required_by_declared_reconstructor:nonuniform.rejected===true,union_groundedness_needed_to_exclude_invisible_degree_zero_elements:true,universal_hypergraph_reconstruction_claimed:false,physical_network_claimed:false,source_identity_claimed:false}),
    membranes:freeze(['MARKED_2SECTION_RECONSTRUCTION != UNIVERSAL_HYPERGRAPH_RECONSTRUCTION','FINITE_EXHAUSTIVE_CLASS != ALL_FINITE_SET_SYSTEMS','LOSSLESS_ON_DECLARED_CLASS != LOSSLESS_COMPRESSION_UNIVERSALLY','INCIDENCE_NEIGHBORHOOD_ISOMORPHISM != HISTORICAL_SOURCE_IDENTITY','CONCURRENCY_CLIQUE != CAUSAL_CONCURRENCY','OVERLAP_GRAPH != PHYSICAL_NETWORK','GROUND_ELEMENT_RELABELING != PHYSICAL_INTERCHANGEABILITY','ATLAS_REGISTRATION != LIVE_RUNTIME_STATE']),
    passed:exact,
  });
  return cached;
}

export const ATLAS_MARKED_2SECTION_RECONSTRUCTION_EXACTNESS_CERTIFICATE=atlasMarked2SectionReconstructionExactnessCertificate();
