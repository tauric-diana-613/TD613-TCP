import {
  ATLAS_PARAMETRIC_MARKED_2SECTION_RECONSTRUCTION_SCHEMA,
  atlasParametricMarked2SectionReconstructionCertificate,
} from './atlas-parametric-marked-2section-reconstruction.js';

export const ATLAS_CAPACITY_VECTOR_MARKED_2SECTION_RECONSTRUCTION_SCHEMA='td613.dome-world.atlas-capacity-vector-marked-2section-reconstruction/v0.1';
export const ATLAS_CAPACITY_VECTOR_MARKED_2SECTION_RECONSTRUCTION_PARENT_RECEIPT='93abc6fa561d1992c5dc0322a8016212688c98bd';

const GROUND=Object.freeze([0,1,2,3,4,5,6]);
let cached=null;
function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function combinations(xs,k){const out=[];function rec(s,p){if(p.length===k){out.push([...p]);return;}for(let i=s;i<xs.length;i++)rec(i+1,[...p,xs[i]]);}rec(0,[]);return out;}
const BLOCKS=Object.freeze([2,3,4].flatMap(k=>combinations(GROUND,k)).map(x=>Object.freeze(x)));
const intersectionSize=(a,b)=>a.reduce((n,x)=>n+(b.includes(x)?1:0),0);
function supportKey(s){return `${s.length}:${s.join(',')}`;}
function canonicalSupports(sups){return Object.freeze([...sups].map(s=>Object.freeze([...s])).sort((a,b)=>supportKey(a).localeCompare(supportKey(b))));}
function rawSupports(H){
  const union=[...new Set(H.flat())].sort((a,b)=>a-b);
  return canonicalSupports(union.map(e=>H.map((b,i)=>b.includes(e)?i:null).filter(i=>i!==null)));
}
function auditLinearity(H){let checks=0,failures=0;for(let i=0;i<H.length;i++)for(let j=i+1;j<H.length;j++){checks++;if(intersectionSize(H[i],H[j])>1)failures++;}return {checks,failures};}
function receiver(H){
  const raw=rawSupports(H);
  const edges=[];
  for(let i=0;i<H.length;i++)for(let j=i+1;j<H.length;j++)if(intersectionSize(H[i],H[j])>0)edges.push(Object.freeze([i,j]));
  return freeze({block_count:H.length,capacities:Object.freeze(H.map(b=>b.length)),edges:Object.freeze(edges),marks:canonicalSupports(raw.filter(s=>s.length>=3))});
}
function edgeKey(a,b){return `${Math.min(a,b)},${Math.max(a,b)}`;}
function reconstruct(R){
  const covered=new Set(),out=[];let doubleCovered=0,markCliqueFailures=0;
  for(const mark of R.marks){
    out.push([...mark]);
    for(let a=0;a<mark.length;a++)for(let b=a+1;b<mark.length;b++){
      const k=edgeKey(mark[a],mark[b]);
      if(!R.edges.some(e=>edgeKey(e[0],e[1])===k))markCliqueFailures++;
      if(covered.has(k))doubleCovered++;covered.add(k);
    }
  }
  const residual=[];
  for(const e of R.edges){const k=edgeKey(e[0],e[1]);if(!covered.has(k)){residual.push(e);out.push([...e]);}}
  let overfull=0;
  const privateCounts=[];
  for(let i=0;i<R.block_count;i++){
    const shared=R.marks.reduce((n,m)=>n+(m.includes(i)?1:0),0)+residual.reduce((n,e)=>n+(e.includes(i)?1:0),0);
    const privateCount=R.capacities[i]-shared;privateCounts.push(privateCount);
    if(!Number.isInteger(privateCount)||privateCount<0){overfull++;continue;}
    for(let n=0;n<privateCount;n++)out.push([i]);
  }
  return freeze({rejected:overfull>0||doubleCovered>0||markCliqueFailures>0,incidence_neighborhoods:canonicalSupports(out),private_counts:Object.freeze(privateCounts),double_covered_edges:doubleCovered,mark_clique_failures:markCliqueFailures,overfull_blocks:overfull});
}
function perms(xs){const out=[];function rec(p,r){if(!r.length){out.push([...p]);return;}for(let i=0;i<r.length;i++)rec([...p,r[i]],[...r.slice(0,i),...r.slice(i+1)]);}rec([],xs);return out;}
function graphIsomorphismAudit(RA,RB){
  const ps=perms(Array.from({length:RA.block_count},(_,i)=>i));let graph=0,capacity=0;
  const edgesB=new Set(RB.edges.map(e=>edgeKey(e[0],e[1])));
  for(const p of ps){let ok=true;for(let i=0;i<RA.block_count;i++)for(let j=i+1;j<RA.block_count;j++){
    const a=RA.edges.some(e=>edgeKey(e[0],e[1])===edgeKey(i,j));
    const b=edgesB.has(edgeKey(p[i],p[j]));if(a!==b)ok=false;
  }if(ok){graph++;if(RA.capacities.every((c,i)=>c===RB.capacities[p[i]]))capacity++;}}
  return freeze({graph_isomorphisms:graph,capacity_preserving_graph_isomorphisms:capacity});
}

export function atlasCapacityVectorMarked2SectionReconstructionCertificate(){
  if(cached)return cached;
  const parent=atlasParametricMarked2SectionReconstructionCertificate();
  const parentExact=parent.passed===true&&ATLAS_PARAMETRIC_MARKED_2SECTION_RECONSTRUCTION_SCHEMA==='td613.dome-world.atlas-parametric-marked-2section-reconstruction/v0.1';
  let ambient=0,pairChecks=0,admitted=0,totalBlocks=0,membership=0,entries=0,edges=0,marks=0,successes=0,failures=0,nonuniform=0,marked=0,nonuniformMarked=0;
  const byBlocks={},markProfile={};
  for(let r=1;r<=3;r++)for(const H0 of combinations(BLOCKS,r)){
    ambient++;const H=H0.map(b=>b);const lin=auditLinearity(H);pairChecks+=lin.checks;if(lin.failures)continue;
    admitted++;byBlocks[r]=(byBlocks[r]||0)+1;totalBlocks+=r;membership+=GROUND.length*r;
    const raw=rawSupports(H),R=receiver(H),rr=reconstruct(R);entries+=raw.length;edges+=R.edges.length;marks+=R.marks.length;markProfile[R.marks.length]=(markProfile[R.marks.length]||0)+1;
    const isNonuniform=new Set(H.map(b=>b.length)).size>1;if(isNonuniform)nonuniform++;if(R.marks.length){marked++;if(isNonuniform)nonuniformMarked++;}
    const blockIncidence=Array.from({length:r},(_,i)=>rr.incidence_neighborhoods.reduce((n,s)=>n+(s.includes(i)?1:0),0));
    const ok=!rr.rejected&&same(rr.incidence_neighborhoods,raw)&&blockIncidence.every((n,i)=>n===R.capacities[i]);if(ok)successes++;else failures++;
  }

  const A=Object.freeze([[0,1],[0,2,3,4],[2,5,6]].map(x=>Object.freeze(x)));
  const B=Object.freeze([[0,1,3,4],[0,2],[2,5,6]].map(x=>Object.freeze(x)));
  const RA=receiver(A),RB=receiver(B),rawA=rawSupports(A),rawB=rawSupports(B),rrA=reconstruct(RA),rrB=reconstruct(RB),iso=graphIsomorphismAudit(RA,RB);
  const control=freeze({
    same_overlap_edges:same(RA.edges,RB.edges),
    same_sorted_capacity_multiset:same([...RA.capacities].sort((a,b)=>a-b),[...RB.capacities].sort((a,b)=>a-b)),
    A_capacity_vector:RA.capacities,B_capacity_vector:RB.capacities,
    graph_isomorphisms:iso.graph_isomorphisms,capacity_preserving_graph_isomorphisms:iso.capacity_preserving_graph_isomorphisms,
    raw_incidence_neighborhoods_equal:same(rawA,rawB),
    A_roundtrip_exact:same(rawA,rrA.incidence_neighborhoods),B_roundtrip_exact:same(rawB,rrB.incidence_neighborhoods),
  });
  const census=freeze({ambient_candidate_families:ambient,pair_linearity_candidate_checks:pairChecks,admitted_families:admitted,admitted_by_block_count:freeze({...byBlocks}),total_admitted_block_occurrences:totalBlocks,raw_membership_evaluations:membership,incidence_neighborhood_entries:entries,total_overlap_edges:edges,total_concurrency_marks:marks,mark_count_profile:freeze({...markProfile}),nonuniform_admitted_families:nonuniform,marked_admitted_families:marked,nonuniform_marked_families:nonuniformMarked,roundtrip_successes:successes,roundtrip_failures:failures});
  const exact=parentExact&&same(census,{ambient_candidate_families:125671,pair_linearity_candidate_checks:368550,admitted_families:27426,admitted_by_block_count:{1:91,2:2275,3:25060},total_admitted_block_occurrences:79821,raw_membership_evaluations:558747,incidence_neighborhood_entries:161287,total_overlap_edges:57820,total_concurrency_marks:2345,mark_count_profile:{0:25081,1:2345},nonuniform_admitted_families:23765,marked_admitted_families:2345,nonuniform_marked_families:2100,roundtrip_successes:27426,roundtrip_failures:0})&&same(control,{same_overlap_edges:true,same_sorted_capacity_multiset:true,A_capacity_vector:[2,4,3],B_capacity_vector:[4,2,3],graph_isomorphisms:2,capacity_preserving_graph_isomorphisms:0,raw_incidence_neighborhoods_equal:false,A_roundtrip_exact:true,B_roundtrip_exact:true});
  cached=freeze({schema:ATLAS_CAPACITY_VECTOR_MARKED_2SECTION_RECONSTRUCTION_SCHEMA,parent_receipt:ATLAS_CAPACITY_VECTOR_MARKED_2SECTION_RECONSTRUCTION_PARENT_RECEIPT,parent_exact:parentExact,census,capacity_label_control:control,proof_ledger:freeze({marked_supports_recover_degree_ge_3:true,linearity_makes_pair_support_unique:true,residual_edges_recover_degree_2:true,private_multiplicity_formula:'p_i=c_i-s_i',global_uniformity_used:false}),laws:freeze({capacity_vector_roundtrip_exact_on_declared_nonuniform_assay:failures===0&&successes===admitted,global_uniformity_not_required_by_reconstruction_law:true,sorted_capacity_inventory_alone_insufficient_in_declared_control:control.graph_isomorphisms>0&&control.capacity_preserving_graph_isomorphisms===0&&control.raw_incidence_neighborhoods_equal===false,capacity_vector_universally_minimal_claimed:false,nonlinear_multiplicity_repaired_claimed:false,degree_zero_ground_recovered_claimed:false}),membranes:freeze(['CAPACITY_VECTOR_RECONSTRUCTION != UNIVERSAL_HYPERGRAPH_RECONSTRUCTION','LOCAL_BLOCK_CAPACITY != PHYSICAL_CAPACITY','LOSSLESS_INCIDENCE_RECONSTRUCTION != HISTORICAL_SOURCE_IDENTITY','FINITE_NONUNIFORM_ASSAY != PROOF_BY_SAMPLING','SORTED_CAPACITY_MULTISET_INSUFFICIENT != CAPACITY_VECTOR_UNIVERSALLY_MINIMAL','LINEAR_INCIDENCE != PHYSICAL_LINEARITY','ATLAS_REGISTRATION != LIVE_RUNTIME_STATE']),passed:exact});
  return cached;
}

export const ATLAS_CAPACITY_VECTOR_MARKED_2SECTION_RECONSTRUCTION_CERTIFICATE=atlasCapacityVectorMarked2SectionReconstructionCertificate();
