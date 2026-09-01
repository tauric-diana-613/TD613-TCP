import {
  ATLAS_TUTTE_COLLISION_INCIDENCE_MOMENT_REPAIR_SCHEMA,
  atlasTutteCollisionIncidenceMomentRepairCertificate,
} from './atlas-tutte-collision-incidence-moment-repair.js';

export const ATLAS_MARGINAL_RELATIONAL_INCIDENCE_SEPARATION_SCHEMA='td613.dome-world.atlas-marginal-relational-incidence-separation/v0.1';
export const ATLAS_MARGINAL_RELATIONAL_INCIDENCE_SEPARATION_PARENT_RECEIPT='94e644f8e718581c4764b0c1f43bd35017e0d476';

const E=Object.freeze([0,1,2,3,4,5,6,7]);
const ALL=(1<<8)-1;
const TAIL_H=Object.freeze([7,25,42,196]);
const CYCLE_H=Object.freeze([7,25,98,168]);
let cached=null;

function freeze(value){ if(value&&typeof value==='object'&&!Object.isFrozen(value)){ Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
const popcount=n=>n.toString(2).replace(/0/g,'').length;
const subseteq=(a,b)=>(a&~b)===0;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function frequency(values){ const out={}; for(const v of values) out[String(v)]=(out[String(v)]||0)+1; return out; }

function rankTable(Hs){
  const H=new Set(Hs);
  return freeze(Array.from({length:256},(_,m)=>{
    const k=popcount(m);
    if(k<3) return k;
    if(k===3&&H.has(m)) return 2;
    return 3;
  }));
}
function auditRank(rank){
  let bounds=0,boundFailures=0,monoCandidates=0,monoPremises=0,monoFailures=0,subPairs=0,subFailures=0;
  for(let m=0;m<256;m++){ bounds++; if(rank[m]<0||rank[m]>Math.min(3,popcount(m))) boundFailures++; }
  for(let a=0;a<256;a++) for(let b=0;b<256;b++){
    monoCandidates++;
    if(subseteq(a,b)){ monoPremises++; if(rank[a]>rank[b]) monoFailures++; }
    subPairs++;
    if(rank[a]+rank[b]<rank[a|b]+rank[a&b]) subFailures++;
  }
  return freeze({rank_bound_checks:bounds,rank_bound_failures:boundFailures,monotonicity_candidate_pairs:monoCandidates,monotonicity_inclusion_premises:monoPremises,monotonicity_failures:monoFailures,submodularity_pairs:subPairs,submodularity_failures:subFailures});
}
function circuits(rank){
  const out=[];
  for(let m=1;m<256;m++){
    if(rank[m]===popcount(m)) continue;
    let minimal=true;
    for(const e of E) if((m>>e)&1){ const sub=m&~(1<<e); if(rank[sub]<popcount(sub)) minimal=false; }
    if(minimal) out.push(m);
  }
  return out;
}
function hyperplanes(rank){
  const out=[];
  for(let m=0;m<256;m++){
    if(rank[m]!==2) continue;
    let maximal=true;
    for(const e of E) if(((m>>e)&1)===0&&rank[m|(1<<e)]===2) maximal=false;
    if(maximal) out.push(m);
  }
  return out;
}
function circuitHyperplanes(rank){ const C=new Set(circuits(rank)); return freeze(hyperplanes(rank).filter(m=>C.has(m)).sort((a,b)=>a-b)); }

function add(map,a,b,c=1){ const k=`${a},${b}`; map[k]=(map[k]||0)+c; if(map[k]===0) delete map[k]; }
function rankGenerating(rank){ const out={}; const rE=rank[ALL]; for(let m=0;m<256;m++) add(out,rE-rank[m],popcount(m)-rank[m]); return freeze(Object.fromEntries(Object.entries(out).sort())); }
function choose(n,k){ if(k<0||k>n) return 0; if(k===0||k===n) return 1; let v=1; for(let i=1;i<=k;i++) v=v*(n-k+i)/i; return v; }
function tutteFromR(R){ const out={}; for(const [key,c] of Object.entries(R)){ const [a,b]=key.split(',').map(Number); for(let i=0;i<=a;i++) for(let j=0;j<=b;j++) add(out,i,j,c*choose(a,i)*choose(b,j)*((-1)**((a-i)+(b-j)))); } return freeze(Object.fromEntries(Object.entries(out).sort())); }

function incidenceDegrees(Hs){ return freeze(E.map(e=>Hs.reduce((s,h)=>s+(((h>>e)&1)?1:0),0))); }
function moment(degrees,k){ return degrees.reduce((s,d)=>s+d**k,0); }
function sortedDesc(xs){ return freeze([...xs].sort((a,b)=>b-a)); }
function overlapGraph(Hs){
  const deg=Array(Hs.length).fill(0); let edges=0,pairChecks=0;
  for(let i=0;i<Hs.length;i++) for(let j=i+1;j<Hs.length;j++){
    pairChecks++; if((Hs[i]&Hs[j])!==0){ edges++; deg[i]++; deg[j]++; }
  }
  return freeze({pair_checks:pairChecks,edge_count:edges,degree_profile:sortedDesc(deg),max_degree:Math.max(...deg)});
}

function permutations(xs){ const out=[]; function rec(prefix,rest){ if(rest.length===0){ out.push(Object.freeze([...prefix])); return; } for(let i=0;i<rest.length;i++) rec([...prefix,rest[i]],[...rest.slice(0,i),...rest.slice(i+1)]); } rec([],xs); return freeze(out); }
const PERMS=permutations(E);
function permuteMask(mask,p){ let out=0; for(const e of E) if((mask>>e)&1) out|=1<<p[e]; return out; }
function crossSearch(leftHs,rightHs){
  const target=new Set(rightHs); let checks=0,matches=0;
  for(const p of PERMS){ let ok=true; for(const h of leftHs){ checks++; if(!target.has(permuteMask(h,p))) ok=false; } if(ok) matches++; }
  return freeze({relabelings:PERMS.length,mapped_circuit_hyperplane_membership_checks:checks,match_count:matches});
}
function analyze(rank){
  const Hs=circuitHyperplanes(rank),degrees=incidenceDegrees(Hs),sortedDegrees=sortedDesc(degrees),graph=overlapGraph(Hs);
  return freeze({rank_values:rank,rank_frequency:freeze(frequency(rank)),rank_audit:auditRank(rank),circuit_hyperplanes:Hs,element_incidence_degrees:degrees,element_degree_multiset:sortedDegrees,moments_k1_to_k8:freeze(Array.from({length:8},(_,i)=>moment(degrees,i+1))),overlap_graph:graph,rank_generating:rankGenerating(rank)});
}

export function atlasMarginalRelationalIncidenceSeparationCertificate(){
  if(cached) return cached;
  const parent=atlasTutteCollisionIncidenceMomentRepairCertificate();
  const parentExact=parent.passed===true&&ATLAS_TUTTE_COLLISION_INCIDENCE_MOMENT_REPAIR_SCHEMA==='td613.dome-world.atlas-tutte-collision-incidence-moment-repair/v0.1';
  const tail=analyze(rankTable(TAIL_H)),cycle=analyze(rankTable(CYCLE_H));
  const Ttail=tutteFromR(tail.rank_generating),Tcycle=tutteFromR(cycle.rank_generating);
  const cross=crossSearch(tail.circuit_hyperplanes,cycle.circuit_hyperplanes);
  const expectedR={'0,0':52,'0,1':70,'0,2':56,'0,3':28,'0,4':8,'0,5':1,'1,0':28,'1,1':4,'2,0':8,'3,0':1};
  const expectedT={'0,1':11,'0,2':10,'0,3':6,'0,4':3,'0,5':1,'1,0':11,'1,1':4,'2,0':5,'3,0':1};
  const expectedDegrees=[2,2,2,2,1,1,1,1],expectedMoments=[12,20,36,68,132,260,516,1028];
  const auditFailures=[tail.rank_audit,cycle.rank_audit].reduce((s,a)=>s+a.rank_bound_failures+a.monotonicity_failures+a.submodularity_failures,0);
  const allKMomentEqualityFromDegreeMultiset=same(tail.element_degree_multiset,cycle.element_degree_multiset)&&same(tail.element_degree_multiset,expectedDegrees);
  const tailOverlapFromMarginal=(tail.moments_k1_to_k8[1]-tail.moments_k1_to_k8[0])/2;
  const cycleOverlapFromMarginal=(cycle.moments_k1_to_k8[1]-cycle.moments_k1_to_k8[0])/2;
  const classCounts=freeze({tutte:1,tutte_plus_degree_multiset:1,tutte_plus_all_one_point_power_sum_moments:1,tutte_plus_degree_multiset_plus_total_overlap:1,tutte_plus_degree_multiset_plus_max_overlap_degree:tail.overlap_graph.max_degree===cycle.overlap_graph.max_degree?1:2});
  const exact=parentExact&&auditFailures===0&&
    same(tail.circuit_hyperplanes,[7,25,42,196])&&same(cycle.circuit_hyperplanes,[7,25,98,168])&&
    same(tail.rank_frequency,{'0':1,'1':8,'2':32,'3':215})&&same(cycle.rank_frequency,{'0':1,'1':8,'2':32,'3':215})&&
    same(tail.rank_generating,expectedR)&&same(cycle.rank_generating,expectedR)&&same(Ttail,expectedT)&&same(Tcycle,expectedT)&&
    same(tail.element_degree_multiset,expectedDegrees)&&same(cycle.element_degree_multiset,expectedDegrees)&&same(tail.moments_k1_to_k8,expectedMoments)&&same(cycle.moments_k1_to_k8,expectedMoments)&&allKMomentEqualityFromDegreeMultiset&&
    tail.overlap_graph.edge_count===4&&cycle.overlap_graph.edge_count===4&&tailOverlapFromMarginal===4&&cycleOverlapFromMarginal===4&&
    same(tail.overlap_graph.degree_profile,[3,2,2,1])&&same(cycle.overlap_graph.degree_profile,[2,2,2,2])&&tail.overlap_graph.max_degree===3&&cycle.overlap_graph.max_degree===2&&
    same(classCounts,{tutte:1,tutte_plus_degree_multiset:1,tutte_plus_all_one_point_power_sum_moments:1,tutte_plus_degree_multiset_plus_total_overlap:1,tutte_plus_degree_multiset_plus_max_overlap_degree:2})&&
    cross.relabelings===40320&&cross.mapped_circuit_hyperplane_membership_checks===161280&&cross.match_count===0;
  cached=freeze({
    schema:ATLAS_MARGINAL_RELATIONAL_INCIDENCE_SEPARATION_SCHEMA,parent_receipt:ATLAS_MARGINAL_RELATIONAL_INCIDENCE_SEPARATION_PARENT_RECEIPT,parent_exact:parentExact,
    ground_set:freeze([...E]),M_tail:tail,M_cycle:cycle,common_tutte:freeze(expectedT),common_rank_generating:freeze(expectedR),
    all_k_moment_identity:freeze({degree_multisets_equal:allKMomentEqualityFromDegreeMultiset,formula:'m_k=4*2^k+4 for every integer k>=1'}),
    overlap_double_count:freeze({M_tail:tailOverlapFromMarginal,M_cycle:cycleOverlapFromMarginal}),receiver_class_counts:classCounts,cross_isomorphism:cross,
    aggregate_burden:freeze({rank_bound_checks:tail.rank_audit.rank_bound_checks+cycle.rank_audit.rank_bound_checks,monotonicity_candidate_pairs:tail.rank_audit.monotonicity_candidate_pairs+cycle.rank_audit.monotonicity_candidate_pairs,monotonicity_inclusion_premises:tail.rank_audit.monotonicity_inclusion_premises+cycle.rank_audit.monotonicity_inclusion_premises,submodularity_pairs:tail.rank_audit.submodularity_pairs+cycle.rank_audit.submodularity_pairs,polynomial_subset_terms:512,overlap_pair_checks:tail.overlap_graph.pair_checks+cycle.overlap_graph.pair_checks,cross_relabelings:cross.relabelings,cross_membership_checks:cross.mapped_circuit_hyperplane_membership_checks}),
    laws:freeze({same_tutte_polynomial:same(Ttail,Tcycle),same_complete_element_degree_multiset:same(tail.element_degree_multiset,cycle.element_degree_multiset),all_one_point_power_sum_moments_collide:allKMomentEqualityFromDegreeMultiset,total_pairwise_overlap_collides:tailOverlapFromMarginal===cycleOverlapFromMarginal,relational_overlap_graph_degree_profile_separates:!same(tail.overlap_graph.degree_profile,cycle.overlap_graph.degree_profile),max_overlap_degree_repairs_declared_pair:tail.overlap_graph.max_degree!==cycle.overlap_graph.max_degree,exhaustive_cross_isomorphism_has_zero_matches:cross.match_count===0,complete_matroid_classifier_claimed:false,physical_network_claimed:false,universal_moment_incompleteness_rate_claimed:false}),
    membranes:freeze(['IDENTICAL_INCIDENCE_DEGREE_MULTISET != IDENTICAL_MATROID','ALL_ONE_POINT_MOMENTS_COLLIDE != UNIVERSAL_MOMENT_INCOMPLETENESS_RATE','OVERLAP_GRAPH != PHYSICAL_NETWORK','OVERLAP_GRAPH_MAX_DEGREE != PHYSICAL_CONNECTIVITY','RELATIONAL_INCIDENCE_REPAIR != COMPLETE_MATROID_CLASSIFIER','TUTTE_PLUS_DELTA_SEPARATES_DECLARED_PAIR != UNIVERSAL_CLASSIFIER','FINITE_COUNTEREXAMPLE != STATISTICAL_PREVALENCE','ATLAS_REGISTRATION != LIVE_RUNTIME_STATE']),
    passed:exact,
  });
  return cached;
}

export const ATLAS_MARGINAL_RELATIONAL_INCIDENCE_SEPARATION_CERTIFICATE=atlasMarginalRelationalIncidenceSeparationCertificate();