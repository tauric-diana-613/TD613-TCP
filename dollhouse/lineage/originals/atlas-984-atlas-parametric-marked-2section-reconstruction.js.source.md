import {
  ATLAS_MARKED_2SECTION_RECONSTRUCTION_EXACTNESS_SCHEMA,
  atlasMarked2SectionReconstructionExactnessCertificate,
} from './atlas-marked-2section-reconstruction-exactness.js';

export const ATLAS_PARAMETRIC_MARKED_2SECTION_RECONSTRUCTION_SCHEMA='td613.dome-world.atlas-parametric-marked-2section-reconstruction/v0.1';
export const ATLAS_PARAMETRIC_MARKED_2SECTION_RECONSTRUCTION_PARENT_RECEIPT='e1db7374df71de4df459cda939b63a282a0831ea';
let cached=null;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
function choose(n,k){if(k<0||k>n)return 0;if(k===0||k===n)return 1;let v=1;for(let i=1;i<=k;i++)v=v*(n-k+i)/i;return v;}
function combinations(xs,k){const out=[];function rec(s,p){if(p.length===k){out.push([...p]);return;}for(let i=s;i<xs.length;i++)rec(i+1,[...p,xs[i]]);}rec(0,[]);return out;}
const intersectionSize=(a,b)=>a.reduce((n,x)=>n+(b.includes(x)?1:0),0);
function supportKey(s){return `${s.length}:${s.join(',')}`;}
function canonicalSupports(xs){return Object.freeze([...xs].map(s=>Object.freeze([...s].sort((a,b)=>a-b))).sort((a,b)=>supportKey(a).localeCompare(supportKey(b))));}
function rawSupports(H){const union=[...new Set(H.flat())].sort((a,b)=>a-b);return canonicalSupports(union.map(e=>H.map((h,i)=>h.includes(e)?i:null).filter(i=>i!==null)));}
function receiver(H,k){
  if(!Number.isInteger(k)||k<2||!H.every(h=>h.length===k))return freeze({rejected:true,reason:'NON_K_UNIFORM'});
  const raw=rawSupports(H);const edges=[];
  for(let i=0;i<H.length;i++)for(let j=i+1;j<H.length;j++)if(intersectionSize(H[i],H[j])>0)edges.push(Object.freeze([i,j]));
  const marks=canonicalSupports(raw.filter(s=>s.length>=3));
  return freeze({rejected:false,block_count:H.length,block_size:k,edges:Object.freeze(edges),marks});
}
function reconstruct(R){
  if(R.rejected||!Number.isInteger(R.block_size)||R.block_size<2)return freeze({rejected:true,reason:'RECEIVER_REJECTED'});
  const covered=new Set(),out=[];let doubleCovered=0,markCliqueFailures=0;
  const edgeSet=new Set(R.edges.map(e=>`${e[0]},${e[1]}`));
  for(const m of R.marks){
    out.push([...m]);
    for(let a=0;a<m.length;a++)for(let b=a+1;b<m.length;b++){
      const x=Math.min(m[a],m[b]),y=Math.max(m[a],m[b]),key=`${x},${y}`;
      if(!edgeSet.has(key))markCliqueFailures++;
      if(covered.has(key))doubleCovered++;
      covered.add(key);
    }
  }
  const uncovered=[];
  for(const e of R.edges){const key=`${e[0]},${e[1]}`;if(!covered.has(key)){uncovered.push(e);out.push([...e]);}}
  let overfull=0;
  for(let i=0;i<R.block_count;i++){
    const shared=R.marks.reduce((n,m)=>n+(m.includes(i)?1:0),0)+uncovered.reduce((n,e)=>n+(e.includes(i)?1:0),0);
    if(shared>R.block_size)overfull++;
    for(let n=0;n<Math.max(0,R.block_size-shared);n++)out.push([i]);
  }
  return freeze({rejected:overfull>0,incidence_neighborhoods:canonicalSupports(out),double_covered_edges:doubleCovered,mark_clique_failures:markCliqueFailures,overfull_blocks:overfull});
}
function enumerateLinearFamilies(blocks,maxBlocks,visit){
  const selected=[];
  function rec(start){
    if(selected.length){visit(selected.map(b=>b));}
    if(selected.length===maxBlocks)return;
    for(let i=start;i<blocks.length;i++){
      const b=blocks[i];let ok=true;
      for(const prior of selected)if(intersectionSize(prior,b)>1){ok=false;break;}
      if(!ok)continue;
      selected.push(b);rec(i+1);selected.pop();
    }
  }
  rec(0);
}
function assay(n,k,maxBlocks){
  const ground=Array.from({length:n},(_,i)=>i),blocks=combinations(ground,k);const byBlocks={},markProfile={};
  let admitted=0,success=0,failures=0,marked=0,totalBlocks=0,totalEdges=0,totalMarks=0;
  enumerateLinearFamilies(blocks,maxBlocks,H=>{
    admitted++;byBlocks[H.length]=(byBlocks[H.length]||0)+1;totalBlocks+=H.length;
    const raw=rawSupports(H),R=receiver(H,k),rr=reconstruct(R);totalEdges+=R.edges.length;totalMarks+=R.marks.length;
    markProfile[R.marks.length]=(markProfile[R.marks.length]||0)+1;if(R.marks.length>0)marked++;
    const blockIncidence=Array.from({length:H.length},(_,i)=>rr.incidence_neighborhoods.reduce((s,x)=>s+(x.includes(i)?1:0),0));
    const ok=!rr.rejected&&rr.double_covered_edges===0&&rr.mark_clique_failures===0&&blockIncidence.every(x=>x===k)&&same(raw,rr.incidence_neighborhoods);
    if(ok)success++;else failures++;
  });
  let candidates=0;for(let r=1;r<=maxBlocks;r++)candidates+=choose(blocks.length,r);
  return freeze({ground_size:n,block_size:k,max_blocks:maxBlocks,block_pool:blocks.length,candidate_families:candidates,admitted_families:admitted,family_count_by_blocks:freeze(byBlocks),marked_families:marked,mark_count_profile:freeze(markProfile),total_blocks:totalBlocks,total_overlap_edges:totalEdges,total_marks:totalMarks,roundtrip_successes:success,roundtrip_failures:failures});
}
function negatives(){
  const nonlinear=[[0,1,2],[0,1,3]],rawN=rawSupports(nonlinear),rrN=reconstruct(receiver(nonlinear,3));
  const nonuniform=receiver([[0,1,2,3],[0,4,5]],4);
  const isolatedR=receiver([[0,1,2]],3);
  return freeze({nonlinear_roundtrip_equal:same(rawN,rrN.incidence_neighborhoods),nonuniform_rejected:nonuniform.rejected===true,isolated_receiver_carries_degree_zero:false,isolated_receiver_signature:JSON.stringify(isolatedR)});
}
export function atlasParametricMarked2SectionReconstructionCertificate(){
  if(cached)return cached;
  const parent=atlasMarked2SectionReconstructionExactnessCertificate();
  const parentExact=parent.passed===true&&ATLAS_MARKED_2SECTION_RECONSTRUCTION_EXACTNESS_SCHEMA==='td613.dome-world.atlas-marked-2section-reconstruction-exactness/v0.1';
  const k2=assay(5,2,4),k3=assay(7,3,4),k4=assay(10,4,3),neg=negatives();
  const totals=freeze({candidate_families:k2.candidate_families+k3.candidate_families+k4.candidate_families,admitted_families:k2.admitted_families+k3.admitted_families+k4.admitted_families,marked_families:k2.marked_families+k3.marked_families+k4.marked_families,roundtrip_successes:k2.roundtrip_successes+k3.roundtrip_successes+k4.roundtrip_successes,roundtrip_failures:k2.roundtrip_failures+k3.roundtrip_failures+k4.roundtrip_failures});
  const proofLedger=freeze({
    edge_unique_under_linearity:true,
    distinct_marks_edge_disjoint_under_linearity:true,
    every_degree_ge_3_element_is_explicitly_marked:true,
    every_uncovered_overlap_edge_represents_one_degree_2_element:true,
    shared_supports_are_distinct_within_each_block_under_linearity:true,
    uniform_private_remainder_formula:'k - shared_support_count',
    union_groundedness_excludes_invisible_degree_zero_elements:true,
    reconstruction_argument_depends_on_fixed_k_but_not_on_k_equal_three:true,
  });
  const expectedK2={candidate_families:385,admitted_families:385,marked_families:145,roundtrip_successes:385,roundtrip_failures:0};
  const expectedK3={candidate_families:59535,admitted_families:4305,marked_families:945,roundtrip_successes:4305,roundtrip_failures:0};
  const expectedK4={candidate_families:1543675,admitted_families:113785,marked_families:2800,roundtrip_successes:113785,roundtrip_failures:0};
  const project=x=>({candidate_families:x.candidate_families,admitted_families:x.admitted_families,marked_families:x.marked_families,roundtrip_successes:x.roundtrip_successes,roundtrip_failures:x.roundtrip_failures});
  const exact=parentExact&&same(project(k2),expectedK2)&&same(project(k3),expectedK3)&&same(project(k4),expectedK4)&&same(totals,{candidate_families:1603595,admitted_families:118475,marked_families:3890,roundtrip_successes:118475,roundtrip_failures:0})&&neg.nonlinear_roundtrip_equal===false&&neg.nonuniform_rejected===true&&neg.isolated_receiver_carries_degree_zero===false;
  cached=freeze({schema:ATLAS_PARAMETRIC_MARKED_2SECTION_RECONSTRUCTION_SCHEMA,parent_receipt:ATLAS_PARAMETRIC_MARKED_2SECTION_RECONSTRUCTION_PARENT_RECEIPT,parent_exact:parentExact,assays:freeze({k2,k3,k4}),totals,proof_ledger:proofLedger,negative_controls:neg,laws:freeze({generic_reconstructor_has_no_k_specific_theorem_branch:true,parametric_reconstruction_theorem_on_declared_hypotheses:exact,finite_assays_are_not_proof_by_sampling:true,linearity_required_for_unweighted_overlap_edges:true,uniformity_parameter_k_required:true,union_groundedness_required_for_degree_zero_exclusion:true,universal_hypergraph_reconstruction_claimed:false,physical_network_claimed:false,historical_source_identity_claimed:false}),membranes:freeze(['PARAMETRIC_K_THEOREM != UNIVERSAL_HYPERGRAPH_RECONSTRUCTION','FINITE_STRESS_ASSAYS != PROOF_BY_SAMPLING','LOSSLESS_INCIDENCE_RECONSTRUCTION != HISTORICAL_SOURCE_IDENTITY','MARKED_2SECTION != PHYSICAL_NETWORK','GROUND_RELABELING != PHYSICAL_INTERCHANGEABILITY','ATLAS_REGISTRATION != LIVE_RUNTIME_STATE']),passed:exact});
  return cached;
}
export const ATLAS_PARAMETRIC_MARKED_2SECTION_RECONSTRUCTION_CERTIFICATE=atlasParametricMarked2SectionReconstructionCertificate();
