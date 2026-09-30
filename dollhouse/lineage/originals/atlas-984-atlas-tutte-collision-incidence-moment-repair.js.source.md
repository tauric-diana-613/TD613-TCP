import {
  ATLAS_TUTTE_COLLISION_NONISOMORPHISM_SCHEMA,
  atlasTutteCollisionNonisomorphismCertificate,
} from './atlas-tutte-collision-nonisomorphism.js';

export const ATLAS_TUTTE_COLLISION_INCIDENCE_MOMENT_REPAIR_SCHEMA='td613.dome-world.atlas-tutte-collision-incidence-moment-repair/v0.1';
export const ATLAS_TUTTE_COLLISION_INCIDENCE_MOMENT_REPAIR_PARENT_RECEIPT='2b06eb8d2262135ed6b111dc103867c2d7e973af';

const E=Object.freeze([0,1,2,3,4,5]);
let cached=null;

function freeze(value){ if(value&&typeof value==='object'&&!Object.isFrozen(value)){ Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
const popcount=n=>n.toString(2).replace(/0/g,'').length;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

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

function incidenceSummary(ch){
  const labeled=E.map(e=>ch.reduce((s,h)=>s+(((h>>e)&1)?1:0),0));
  const sorted=[...labeled].sort((a,b)=>b-a);
  const m1=labeled.reduce((s,d)=>s+d,0);
  const m2=labeled.reduce((s,d)=>s+d*d,0);
  const overlapDegree=labeled.reduce((s,d)=>s+d*(d-1)/2,0);
  const overlapMoment=(m2-m1)/2;
  let overlapDirect=0;
  for(let i=0;i<ch.length;i++) for(let j=i+1;j<ch.length;j++) overlapDirect+=popcount(ch[i]&ch[j]);
  return freeze({
    labeled_incidence_degrees:freeze(labeled),
    sorted_incidence_degrees:freeze(sorted),
    m1,m2,
    pair_overlap_from_degrees:overlapDegree,
    pair_overlap_from_moments:overlapMoment,
    pair_overlap_direct:overlapDirect,
  });
}

function permutations(xs){
  const out=[];
  function rec(prefix,rest){
    if(rest.length===0){ out.push(Object.freeze([...prefix])); return; }
    for(let i=0;i<rest.length;i++) rec([...prefix,rest[i]],[...rest.slice(0,i),...rest.slice(i+1)]);
  }
  rec([],xs);
  return Object.freeze(out);
}
const PERMS=permutations(E);
function permuteMask(mask,p){ let out=0; for(const e of E) if((mask>>e)&1) out|=1<<p[e]; return out; }

function auditRelabelings(ch,baseline){
  let incidenceMembershipEvaluations=0,failures=0;
  for(const p of PERMS){
    const permuted=ch.map(h=>permuteMask(h,p));
    incidenceMembershipEvaluations+=E.length*permuted.length;
    const row=incidenceSummary(permuted);
    if(!same(row.sorted_incidence_degrees,baseline.sorted_incidence_degrees)) failures+=1;
    if(row.m1!==baseline.m1) failures+=1;
    if(row.m2!==baseline.m2) failures+=1;
    if(row.pair_overlap_from_moments!==baseline.pair_overlap_from_moments) failures+=1;
  }
  return freeze({
    permutations:PERMS.length,
    incidence_membership_evaluations:incidenceMembershipEvaluations,
    invariant_checks:PERMS.length*4,
    failures,
  });
}

function classCount(signatures){ return new Set(signatures.map(v=>JSON.stringify(v))).size; }

export function atlasTutteCollisionIncidenceMomentRepairCertificate(){
  if(cached) return cached;
  const parent=atlasTutteCollisionNonisomorphismCertificate();
  const expectedT={'0,1':4,'0,2':3,'0,3':1,'1,0':4,'1,1':2,'2,0':3,'3,0':1};
  const parentExact=parent.passed===true&&
    ATLAS_TUTTE_COLLISION_NONISOMORPHISM_SCHEMA==='td613.dome-world.atlas-tutte-collision-nonisomorphism/v0.1'&&
    same(parent.common_tutte,expectedT)&&
    parent.cross_isomorphism?.match_count===0&&
    parent.self_automorphisms?.M_disj?.match_count===72&&parent.self_automorphisms?.M_meet?.match_count===8&&
    same(parent.M_disj?.circuit_hyperplane_intersection_profile,[0])&&same(parent.M_meet?.circuit_hyperplane_intersection_profile,[1]);

  const disjCH=circuitHyperplanes(parent.M_disj.rank_values);
  const meetCH=circuitHyperplanes(parent.M_meet.rank_values);
  const M_disj=freeze({circuit_hyperplanes:disjCH,...incidenceSummary(disjCH)});
  const M_meet=freeze({circuit_hyperplanes:meetCH,...incidenceSummary(meetCH)});

  const R0=[parent.common_tutte,parent.common_tutte];
  const R1=[[parent.common_tutte,M_disj.m1],[parent.common_tutte,M_meet.m1]];
  const R2=[[parent.common_tutte,M_disj.m1,M_disj.m2],[parent.common_tutte,M_meet.m1,M_meet.m2]];
  const classCounts=freeze({R0:classCount(R0),R1:classCount(R1),R2:classCount(R2)});
  let separationDepth=null;
  if(classCounts.R1===2) separationDepth=1;
  else if(classCounts.R2===2) separationDepth=2;

  const relabelDisj=auditRelabelings(disjCH,M_disj);
  const relabelMeet=auditRelabelings(meetCH,M_meet);
  const relabeling=freeze({
    permutations_per_control:PERMS.length,
    total_relabelings:relabelDisj.permutations+relabelMeet.permutations,
    incidence_membership_evaluations:relabelDisj.incidence_membership_evaluations+relabelMeet.incidence_membership_evaluations,
    invariant_checks:relabelDisj.invariant_checks+relabelMeet.invariant_checks,
    failures:relabelDisj.failures+relabelMeet.failures,
  });

  const overlapEqualityFailures=[M_disj,M_meet].reduce((s,m)=>s+(m.pair_overlap_from_degrees===m.pair_overlap_from_moments?0:1)+(m.pair_overlap_from_degrees===m.pair_overlap_direct?0:1),0);

  const exact=parentExact&&
    same(disjCH,[7,56])&&same(meetCH,[7,25])&&
    same(M_disj.labeled_incidence_degrees,[1,1,1,1,1,1])&&same(M_disj.sorted_incidence_degrees,[1,1,1,1,1,1])&&M_disj.m1===6&&M_disj.m2===6&&M_disj.pair_overlap_from_moments===0&&M_disj.pair_overlap_direct===0&&
    same(M_meet.labeled_incidence_degrees,[2,1,1,1,1,0])&&same(M_meet.sorted_incidence_degrees,[2,1,1,1,1,0])&&M_meet.m1===6&&M_meet.m2===8&&M_meet.pair_overlap_from_moments===1&&M_meet.pair_overlap_direct===1&&
    same(classCounts,{R0:1,R1:1,R2:2})&&separationDepth===2&&
    relabeling.total_relabelings===1440&&relabeling.incidence_membership_evaluations===17280&&relabeling.failures===0&&
    overlapEqualityFailures===0;

  cached=freeze({
    schema:ATLAS_TUTTE_COLLISION_INCIDENCE_MOMENT_REPAIR_SCHEMA,
    parent_receipt:ATLAS_TUTTE_COLLISION_INCIDENCE_MOMENT_REPAIR_PARENT_RECEIPT,
    parent_exact:parentExact,
    common_tutte:freeze(expectedT),
    M_disj,M_meet,
    receiver_ladder:freeze({
      class_counts:classCounts,
      incidence_moment_separation_depth:separationDepth,
      extra_scalar_coordinates_needed_after_tutte:1,
      first_moment_adds_no_separation:classCounts.R0===classCounts.R1,
      second_moment_repairs_declared_collision:classCounts.R2===2,
    }),
    overlap_identity:freeze({
      equality_checks:4,
      failures:overlapEqualityFailures,
      formula:'sum_e C(d(e),2) = (m2-m1)/2 = sum_{i<j}|H_i∩H_j|',
    }),
    relabeling,
    aggregate_burden:freeze({
      base_incidence_membership_evaluations:24,
      relabeling_incidence_membership_evaluations:17280,
      receiver_signatures:6,
      overlap_exact_equalities:4,
      relabelings:1440,
    }),
    laws:freeze({
      exact_parent_tutte_collision_inherited:parentExact,
      first_incidence_moment_preserves_collision:M_disj.m1===M_meet.m1,
      second_incidence_moment_separates_collision:M_disj.m2!==M_meet.m2,
      declared_incidence_moment_separation_depth_is_two:separationDepth===2,
      second_moment_excess_recovers_overlap:overlapEqualityFailures===0&&M_disj.pair_overlap_from_moments===0&&M_meet.pair_overlap_from_moments===1,
      relabeling_invariant:relabeling.failures===0,
      complete_matroid_invariant_claimed:false,
      universal_required_moment_order_claimed:false,
      universal_classifier_claimed:false,
      physical_sensor_incidence_claimed:false,
      shannon_information_claimed:false,
      causal_interaction_claimed:false,
      lossless_compression_claimed:false,
    }),
    membranes:freeze([
      'SECOND_INCIDENCE_MOMENT != COMPLETE_MATROID_INVARIANT',
      'MOMENT_SEPARATION_DEPTH_TWO != UNIVERSAL_REQUIRED_MOMENT_ORDER',
      'TUTTE_PLUS_M2_SEPARATES_DECLARED_PAIR != UNIVERSAL_CLASSIFIER',
      'CIRCUIT_HYPERPLANE_INCIDENCE != PHYSICAL_SENSOR_INCIDENCE',
      'INCIDENCE_MOMENT != SHANNON_INFORMATION',
      'OVERLAP_COUNT != CAUSAL_INTERACTION',
      'FINITE_COLLISION_REPAIR != LOSSLESS_COMPRESSION',
      'LABEL_INVARIANCE != SOURCE_INDEPENDENCE',
      'MATROID_RECEIVER != LIVE_RECEIVER',
      'ATLAS_REGISTRATION != LIVE_RUNTIME_STATE',
    ]),
    passed:exact,
  });
  return cached;
}

export const ATLAS_TUTTE_COLLISION_INCIDENCE_MOMENT_REPAIR_CERTIFICATE=atlasTutteCollisionIncidenceMomentRepairCertificate();
