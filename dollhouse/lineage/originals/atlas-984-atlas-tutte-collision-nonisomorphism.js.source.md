import {
  ATLAS_TUTTE_RANK_GENERATING_COMPRESSION_SCHEMA,
  atlasTutteRankGeneratingCompressionCertificate,
} from './atlas-tutte-rank-generating-compression.js';

export const ATLAS_TUTTE_COLLISION_NONISOMORPHISM_SCHEMA='td613.dome-world.atlas-tutte-collision-nonisomorphism/v0.1';
export const ATLAS_TUTTE_COLLISION_NONISOMORPHISM_PARENT_RECEIPT='b34d04f078791bada782bdb88d2d22307c891595';

const E=Object.freeze([0,1,2,3,4,5]);
const ALL=(1<<6)-1;
const DISJ_H=Object.freeze([7,56]);
const MEET_H=Object.freeze([7,25]);
let cached=null;

function freeze(value){ if(value&&typeof value==='object'&&!Object.isFrozen(value)){ Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
const popcount=n=>n.toString(2).replace(/0/g,'').length;
const subseteq=(a,b)=>(a&~b)===0;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function frequency(values){ const out={}; for(const value of values){ const k=String(value); out[k]=(out[k]||0)+1; } return out; }

function rankTable(circuitHyperplanes){
  const H=new Set(circuitHyperplanes);
  return Object.freeze(Array.from({length:64},(_,mask)=>{
    const k=popcount(mask);
    if(k<3) return k;
    if(k===3&&H.has(mask)) return 2;
    return 3;
  }));
}

function auditRank(rank){
  let normalizationChecks=1,normalizationFailures=rank[0]===0?0:1;
  let boundChecks=0,boundFailures=0,monotonicityCandidatePairs=0,monotonicityPremises=0,monotonicityFailures=0,submodularityPairs=0,submodularityFailures=0;
  for(let m=0;m<64;m++){
    boundChecks+=1;
    if(rank[m]<0||rank[m]>Math.min(3,popcount(m))) boundFailures+=1;
  }
  for(let a=0;a<64;a++) for(let b=0;b<64;b++){
    monotonicityCandidatePairs+=1;
    if(subseteq(a,b)){
      monotonicityPremises+=1;
      if(rank[a]>rank[b]) monotonicityFailures+=1;
    }
    submodularityPairs+=1;
    if(rank[a]+rank[b]<rank[a|b]+rank[a&b]) submodularityFailures+=1;
  }
  return freeze({normalization_checks:normalizationChecks,normalization_failures:normalizationFailures,rank_bound_checks:boundChecks,rank_bound_failures:boundFailures,monotonicity_candidate_pairs:monotonicityCandidatePairs,monotonicity_premises:monotonicityPremises,monotonicity_failures:monotonicityFailures,submodularity_pairs:submodularityPairs,submodularity_failures:submodularityFailures});
}

function circuits(rank){
  const out=[];
  for(let m=1;m<64;m++){
    if(rank[m]===popcount(m)) continue;
    let minimal=true;
    for(const e of E) if((m>>e)&1){
      const sub=m&~(1<<e);
      if(rank[sub]<popcount(sub)) minimal=false;
    }
    if(minimal) out.push(m);
  }
  return Object.freeze(out);
}

function hyperplanes(rank){
  const out=[];
  for(let m=0;m<64;m++){
    if(rank[m]!==2) continue;
    let maximal=true;
    for(const e of E) if(((m>>e)&1)===0&&rank[m|(1<<e)]===2) maximal=false;
    if(maximal) out.push(m);
  }
  return Object.freeze(out);
}

function circuitHyperplanes(rank){
  const C=new Set(circuits(rank));
  return Object.freeze(hyperplanes(rank).filter(m=>C.has(m)));
}

function intersectionProfile(masks){
  const out=[];
  for(let i=0;i<masks.length;i++) for(let j=i+1;j<masks.length;j++) out.push(popcount(masks[i]&masks[j]));
  return Object.freeze(out.sort((a,b)=>a-b));
}

function add(map,a,b,c=1){ const key=`${a},${b}`; map[key]=(map[key]||0)+c; if(map[key]===0) delete map[key]; }
function rankGenerating(rank){
  const out={}; const rE=rank[ALL];
  for(let m=0;m<64;m++) add(out,rE-rank[m],popcount(m)-rank[m],1);
  return freeze(Object.fromEntries(Object.entries(out).sort()));
}
function choose(n,k){ if(k<0||k>n) return 0; if(k===0||k===n) return 1; let v=1; for(let i=1;i<=k;i++) v=v*(n-k+i)/i; return v; }
function tutteFromR(R){
  const out={};
  for(const [key,c] of Object.entries(R)){
    const [a,b]=key.split(',').map(Number);
    for(let i=0;i<=a;i++) for(let j=0;j<=b;j++) add(out,i,j,c*choose(a,i)*choose(b,j)*((-1)**((a-i)+(b-j))));
  }
  return freeze(Object.fromEntries(Object.entries(out).sort()));
}

function permutations(xs){
  const out=[];
  function rec(prefix,rest){ if(rest.length===0){ out.push(Object.freeze([...prefix])); return; } for(let i=0;i<rest.length;i++) rec([...prefix,rest[i]],[...rest.slice(0,i),...rest.slice(i+1)]); }
  rec([],xs); return Object.freeze(out);
}
const PERMS=permutations(E);
function permuteMask(mask,p){ let out=0; for(const e of E) if((mask>>e)&1) out|=1<<p[e]; return out; }
function searchIsomorphisms(left,right){
  let rankComparisons=0; const matches=[];
  for(let pi=0;pi<PERMS.length;pi++){
    const p=PERMS[pi]; let match=true;
    for(let m=0;m<64;m++){
      rankComparisons+=1;
      if(left[m]!==right[permuteMask(m,p)]) match=false;
    }
    if(match) matches.push(pi);
  }
  return freeze({permutations:PERMS.length,rank_comparisons:rankComparisons,match_count:matches.length,match_permutation_indices:freeze(matches)});
}

function analyze(rank){
  const rankAudit=auditRank(rank);
  const ch=circuitHyperplanes(rank);
  return freeze({
    rank_values:rank,
    rank_frequency:freeze(frequency(rank)),
    rank_audit:rankAudit,
    circuits:circuits(rank),
    hyperplanes:hyperplanes(rank),
    circuit_hyperplanes:ch,
    circuit_hyperplane_intersection_profile:intersectionProfile(ch),
    rank_generating:rankGenerating(rank),
  });
}

export function atlasTutteCollisionNonisomorphismCertificate(){
  if(cached) return cached;
  const parent=atlasTutteRankGeneratingCompressionCertificate();
  const parentExact=parent.passed===true&&ATLAS_TUTTE_RANK_GENERATING_COMPRESSION_SCHEMA==='td613.dome-world.atlas-tutte-rank-generating-compression/v0.1';

  const disjRank=rankTable(DISJ_H),meetRank=rankTable(MEET_H);
  const M_disj=analyze(disjRank),M_meet=analyze(meetRank);
  const T_disj=tutteFromR(M_disj.rank_generating),T_meet=tutteFromR(M_meet.rank_generating);
  const cross=searchIsomorphisms(disjRank,meetRank);
  const autoDisj=searchIsomorphisms(disjRank,disjRank);
  const autoMeet=searchIsomorphisms(meetRank,meetRank);

  const expectedR={'0,0':18,'0,1':15,'0,2':6,'0,3':1,'1,0':15,'1,1':2,'2,0':6,'3,0':1};
  const expectedT={'0,1':4,'0,2':3,'0,3':1,'1,0':4,'1,1':2,'2,0':3,'3,0':1};
  const auditFailureTotal=[M_disj.rank_audit,M_meet.rank_audit].reduce((s,a)=>s+a.normalization_failures+a.rank_bound_failures+a.monotonicity_failures+a.submodularity_failures,0);
  const aggregate=freeze({
    rank_entries_constructed:128,
    rank_bound_checks:M_disj.rank_audit.rank_bound_checks+M_meet.rank_audit.rank_bound_checks,
    monotonicity_candidate_pairs:M_disj.rank_audit.monotonicity_candidate_pairs+M_meet.rank_audit.monotonicity_candidate_pairs,
    monotonicity_premises:M_disj.rank_audit.monotonicity_premises+M_meet.rank_audit.monotonicity_premises,
    submodularity_pairs:M_disj.rank_audit.submodularity_pairs+M_meet.rank_audit.submodularity_pairs,
    polynomial_subset_terms:128,
    permutation_searches:cross.permutations+autoDisj.permutations+autoMeet.permutations,
    permutation_rank_comparisons:cross.rank_comparisons+autoDisj.rank_comparisons+autoMeet.rank_comparisons,
  });

  const exact=parentExact&&auditFailureTotal===0&&
    same(M_disj.rank_frequency,{'0':1,'1':6,'2':17,'3':40})&&same(M_meet.rank_frequency,{'0':1,'1':6,'2':17,'3':40})&&
    same(M_disj.circuit_hyperplanes,[7,56])&&same(M_meet.circuit_hyperplanes,[7,25])&&same(M_disj.circuit_hyperplane_intersection_profile,[0])&&same(M_meet.circuit_hyperplane_intersection_profile,[1])&&
    same(M_disj.rank_generating,expectedR)&&same(M_meet.rank_generating,expectedR)&&same(T_disj,expectedT)&&same(T_meet,expectedT)&&
    cross.permutations===720&&cross.rank_comparisons===46080&&cross.match_count===0&&
    autoDisj.permutations===720&&autoDisj.rank_comparisons===46080&&autoDisj.match_count===72&&
    autoMeet.permutations===720&&autoMeet.rank_comparisons===46080&&autoMeet.match_count===8&&
    same(aggregate,{rank_entries_constructed:128,rank_bound_checks:128,monotonicity_candidate_pairs:8192,monotonicity_premises:1458,submodularity_pairs:8192,polynomial_subset_terms:128,permutation_searches:2160,permutation_rank_comparisons:138240});

  cached=freeze({
    schema:ATLAS_TUTTE_COLLISION_NONISOMORPHISM_SCHEMA,
    parent_receipt:ATLAS_TUTTE_COLLISION_NONISOMORPHISM_PARENT_RECEIPT,
    parent_exact:parentExact,
    ground_set:freeze([...E]),
    M_disj,M_meet,
    common_rank_generating:freeze(expectedR),
    common_tutte:freeze(expectedT),
    cross_isomorphism:cross,
    self_automorphisms:freeze({M_disj:autoDisj,M_meet:autoMeet}),
    aggregate_burden:aggregate,
    rank_axiom_failure_total:auditFailureTotal,
    laws:freeze({
      both_declared_controls_are_matroids:auditFailureTotal===0,
      exact_tutte_collision:same(T_disj,T_meet)&&same(T_disj,expectedT),
      exhaustive_cross_isomorphism_search_has_zero_matches:cross.match_count===0,
      circuit_hyperplane_intersection_geometry_differs:!same(M_disj.circuit_hyperplane_intersection_profile,M_meet.circuit_hyperplane_intersection_profile),
      automorphism_group_orders_differ:autoDisj.match_count===72&&autoMeet.match_count===8,
      tutte_is_complete_matroid_isomorphism_invariant_in_this_control:false,
      universal_tutte_collision_rate_claimed:false,
      physical_system_nonidentity_claimed:false,
      history_nonidentity_inferred_from_tutte_claimed:false,
    }),
    membranes:freeze([
      'TUTTE_COLLISION != UNIVERSAL_CLASSIFICATION_FAILURE_RATE',
      'NONISOMORPHIC_MATROIDS != DIFFERENT_PHYSICAL_SYSTEMS',
      'AUTOMORPHISM_GROUP_ORDER != PHYSICAL_SYMMETRY_COUNT',
      'CIRCUIT_HYPERPLANE_INTERSECTION != PHYSICAL_INTERSECTION',
      'FINITE_COUNTEREXAMPLE != STATISTICAL_PREVALENCE',
      'TUTTE_POLYNOMIAL != COMPLETE_MATROID_ISOMORPHISM_INVARIANT',
      'MATROID_COLLISION != HISTORY_COLLISION',
      'ATLAS_REGISTRATION != LIVE_RUNTIME_STATE',
    ]),
    passed:exact,
  });
  return cached;
}

export const ATLAS_TUTTE_COLLISION_NONISOMORPHISM_CERTIFICATE=atlasTutteCollisionNonisomorphismCertificate();
