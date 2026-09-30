import {
  ATLAS_MATROIDAL_RECEIVER_CLOSURE_BASIS_EXCHANGE_SCHEMA,
  atlasMatroidalReceiverClosureBasisExchangeCertificate,
} from './atlas-matroidal-receiver-closure-basis-exchange.js';

export const ATLAS_RECEIVER_MATROID_MINORS_FAULT_TOLERANCE_SCHEMA='td613.dome-world.atlas-receiver-matroid-minors-fault-tolerance/v0.1';
export const ATLAS_RECEIVER_MATROID_MINORS_FAULT_TOLERANCE_PARENT_RECEIPT='431898a8bc7f14c466f401d71dfe20feaaf7c447';

const E4=Object.freeze([0,1,2,3]);
const E3=Object.freeze([0,1,2]);
const ALL4=15;
const ALL3=7;
let cached=null;

function freeze(value){ if(value&&typeof value==='object'&&!Object.isFrozen(value)){ Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
const popcount=n=>n.toString(2).replace(/0/g,'').length;
const subseteq=(a,b)=>(a&~b)===0;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function frequency(values){ const out={}; for(const value of values){ const k=String(value); out[k]=(out[k]||0)+1; } return out; }
function frequencyType(rows){ const out={}; for(const row of rows) out[row.type]=(out[row.type]||0)+1; return out; }
function bySize(masks,max=4){ return Object.freeze(Array.from({length:max+1},(_,k)=>masks.filter(m=>popcount(m)===k).length)); }
function polynomial(coeffs){
  const terms=[];
  coeffs.forEach((c,k)=>{ if(!c) return; if(k===0) terms.push(String(c)); else if(k===1) terms.push(`${c===1?'':c+' '}z`); else terms.push(`${c===1?'':c+' '}z^${k}`); });
  return terms.join(' + ')||'0';
}

function auditDeletion(rankValues){
  const fullRank=rankValues[ALL4],preserving=[],destroying=[];
  for(let deletionMask=0;deletionMask<16;deletionMask++){
    const surviving=ALL4&~deletionMask;
    (rankValues[surviving]===fullRank?preserving:destroying).push(deletionMask);
  }
  const cocircuits=destroying.filter(mask=>{
    for(let sub=0;sub<16;sub++) if(sub!==mask&&subseteq(sub,mask)&&destroying.includes(sub)) return false;
    return true;
  });
  const singleDeletionRanks=E4.map(e=>rankValues[ALL4&~(1<<e)]);
  const coloops=E4.filter(e=>singleDeletionRanks[e]<fullRank);
  const preservingBySize=bySize(preserving),destroyingBySize=bySize(destroying);
  return freeze({
    full_rank:fullRank,
    rank_preserving_masks:freeze(preserving),
    rank_destroying_masks:freeze(destroying),
    cocircuit_masks:freeze(cocircuits),
    rank_preserving_by_size:preservingBySize,
    rank_destroying_by_size:destroyingBySize,
    rank_preserving_enumerator:polynomial(preservingBySize),
    rank_destroying_enumerator:polynomial(destroyingBySize),
    single_deletion_ranks:freeze(singleDeletionRanks),
    coloop_indices:freeze(coloops),
    deletion_distance:Math.min(...destroying.map(popcount)),
  });
}

function originalMaskFromLocal(localMask,remaining){
  let out=0;
  for(let local=0;local<3;local++) if((localMask>>local)&1) out|=1<<remaining[local];
  return out;
}

function deriveMinorRank(parentRank,e,operation){
  const remaining=E4.filter(i=>i!==e),rE=parentRank[1<<e];
  const values=[];
  for(let localMask=0;localMask<8;localMask++){
    const originalMask=originalMaskFromLocal(localMask,remaining);
    values.push(operation==='delete'?parentRank[originalMask]:parentRank[originalMask|(1<<e)]-rE);
  }
  return freeze({remaining_original_indices:freeze(remaining),values:freeze(values)});
}

function analyzeMinor(rank){
  let normalizationChecks=1,normalizationFailures=rank[0]===0?0:1;
  let upperChecks=0,upperFailures=0,monotonicityCandidatePairs=0,monotonicityInclusionPremises=0,monotonicityFailures=0,submodularityPairs=0,submodularityFailures=0;
  for(let s=0;s<8;s++){
    upperChecks+=1;
    if(rank[s]<0||rank[s]>popcount(s)) upperFailures+=1;
  }
  for(let s=0;s<8;s++) for(let t=0;t<8;t++){
    monotonicityCandidatePairs+=1;
    if(subseteq(s,t)){
      monotonicityInclusionPremises+=1;
      if(rank[s]>rank[t]) monotonicityFailures+=1;
    }
    submodularityPairs+=1;
    if(rank[s]+rank[t]<rank[s|t]+rank[s&t]) submodularityFailures+=1;
  }
  const fullRank=rank[ALL3];
  const independent=[];
  for(let m=0;m<8;m++) if(rank[m]===popcount(m)) independent.push(m);
  const independentSet=new Set(independent);
  const bases=independent.filter(m=>rank[m]===fullRank&&popcount(m)===fullRank);
  const circuits=[];
  for(let m=1;m<8;m++){
    if(independentSet.has(m)) continue;
    let minimal=true;
    for(const e of E3) if((m>>e)&1){ if(!independentSet.has(m&~(1<<e))) minimal=false; }
    if(minimal) circuits.push(m);
  }
  const loops=circuits.filter(m=>popcount(m)===1).map(m=>E3.find(e=>m===(1<<e)));
  const coloops=E3.filter(e=>rank[ALL3&~(1<<e)]<fullRank);
  let type=null;
  if(fullRank===0&&same(loops,[0,1,2])) type='U_0_3';
  else if(fullRank===1&&loops.length===2&&coloops.length===1) type='U_1_1_PLUS_TWO_LOOPS';
  else if(fullRank===1&&loops.length===1&&coloops.length===0) type='U_1_2_PLUS_ONE_LOOP';
  else if(fullRank===2&&loops.length===1&&coloops.length===2) type='U_2_2_PLUS_ONE_LOOP';
  else if(fullRank===2&&loops.length===0&&coloops.length===0&&same(circuits,[7])) type='U_2_3';
  return freeze({
    full_rank:fullRank,
    independent_masks:freeze(independent),basis_masks:freeze(bases),circuit_masks:freeze(circuits),loop_indices:freeze(loops),coloop_indices:freeze(coloops),type,
    axioms:freeze({
      normalization_checks:normalizationChecks,normalization_failures:normalizationFailures,
      rank_upper_bound_checks:upperChecks,rank_upper_bound_failures:upperFailures,
      monotonicity_candidate_pairs:monotonicityCandidatePairs,monotonicity_inclusion_premises:monotonicityInclusionPremises,monotonicity_failures:monotonicityFailures,
      submodularity_pairs:submodularityPairs,submodularity_failures:submodularityFailures,
    }),
  });
}

function buildSingleElementMinors(parentRank){
  const deletion=[],contraction=[];
  for(const e of E4){
    const d=deriveMinorRank(parentRank,e,'delete'),c=deriveMinorRank(parentRank,e,'contract');
    deletion.push(freeze({element:e,...d,...analyzeMinor(d.values)}));
    contraction.push(freeze({element:e,...c,...analyzeMinor(c.values)}));
  }
  return freeze({deletion:freeze(deletion),contraction:freeze(contraction)});
}

const PERMS3=Object.freeze([
  Object.freeze([0,1,2]),Object.freeze([0,2,1]),Object.freeze([1,0,2]),
  Object.freeze([1,2,0]),Object.freeze([2,0,1]),Object.freeze([2,1,0]),
]);
function permuteMask(mask,perm){ let out=0; for(let i=0;i<3;i++) if((mask>>i)&1) out|=1<<perm[i]; return out; }
function isomorphicRankTables(a,b){
  return PERMS3.some(perm=>{ for(let m=0;m<8;m++) if(a[m]!==b[permuteMask(m,perm)]) return false; return true; });
}

function aggregateMinorAxioms(...families){
  const rows=families.flatMap(f=>[...f.deletion,...f.contraction]);
  const sums={normalization_checks:0,normalization_failures:0,rank_upper_bound_checks:0,rank_upper_bound_failures:0,monotonicity_candidate_pairs:0,monotonicity_inclusion_premises:0,monotonicity_failures:0,submodularity_pairs:0,submodularity_failures:0};
  for(const row of rows) for(const key of Object.keys(sums)) sums[key]+=row.axioms[key];
  return freeze(sums);
}

export function atlasReceiverMatroidMinorsFaultToleranceCertificate(){
  if(cached) return cached;
  const parent=atlasMatroidalReceiverClosureBasisExchangeCertificate();
  const parentExact=parent.passed===true&&ATLAS_MATROIDAL_RECEIVER_CLOSURE_BASIS_EXCHANGE_SCHEMA==='td613.dome-world.atlas-matroidal-receiver-closure-basis-exchange/v0.1'&&
    parent.D?.matroid_type==='U_1_2_PLUS_TWO_LOOPS'&&parent.Q?.matroid_type==='U_2_3_PLUS_ONE_LOOP'&&
    parent.D?.rank?.full_rank===1&&parent.Q?.rank?.full_rank===2&&
    same(parent.D?.combinatorics?.basis_masks,[2,4])&&same(parent.Q?.combinatorics?.basis_masks,[3,5,6])&&
    same(parent.D?.combinatorics?.loop_indices,[0,3])&&same(parent.Q?.combinatorics?.loop_indices,[3]);

  const DDeletion=auditDeletion(parent.D.rank.values),QDeletion=auditDeletion(parent.Q.rank.values);
  const DMinors=buildSingleElementMinors(parent.D.rank.values),QMinors=buildSingleElementMinors(parent.Q.rank.values);
  const minorAxioms=aggregateMinorAxioms(DMinors,QMinors);

  const DDeletionTypes=freeze(frequencyType(DMinors.deletion));
  const DContractionTypes=freeze(frequencyType(DMinors.contraction));
  const QDeletionTypes=freeze(frequencyType(QMinors.deletion));
  const QContractionTypes=freeze(frequencyType(QMinors.contraction));

  const bridge=[];
  for(const qNonloop of [0,1,2]) for(const dLoop of [0,3]){
    const qC=QMinors.contraction[qNonloop],dD=DMinors.deletion[dLoop],dC=DMinors.contraction[dLoop];
    bridge.push(freeze({
      q_nonloop:qNonloop,d_loop:dLoop,
      q_contract_type:qC.type,d_delete_type:dD.type,d_contract_type:dC.type,
      q_contract_isomorphic_d_delete:isomorphicRankTables(qC.values,dD.values),
      q_contract_isomorphic_d_contract:isomorphicRankTables(qC.values,dC.values),
    }));
  }
  const bridgePassed=bridge.length===6&&bridge.every(row=>row.q_contract_type==='U_1_2_PLUS_ONE_LOOP'&&row.d_delete_type==='U_1_2_PLUS_ONE_LOOP'&&row.d_contract_type==='U_1_2_PLUS_ONE_LOOP'&&row.q_contract_isomorphic_d_delete&&row.q_contract_isomorphic_d_contract);

  const DLoopDeleteContractEqual=[0,3].every(e=>same(DMinors.deletion[e].values,DMinors.contraction[e].values));
  const QLoopDeleteContractEqual=same(QMinors.deletion[3].values,QMinors.contraction[3].values);
  const DNonloopContractionCollapses=[1,2].every(e=>DMinors.contraction[e].type==='U_0_3'&&DMinors.contraction[e].full_rank===0);

  const exact=parentExact&&
    same(DDeletion.rank_preserving_masks,[0,1,2,3,4,5,8,9,10,11,12,13])&&same(DDeletion.rank_destroying_masks,[6,7,14,15])&&same(DDeletion.cocircuit_masks,[6])&&
    same(DDeletion.rank_preserving_by_size,[1,4,5,2,0])&&same(DDeletion.rank_destroying_by_size,[0,0,1,2,1])&&same(DDeletion.single_deletion_ranks,[1,1,1,1])&&same(DDeletion.coloop_indices,[])&&DDeletion.deletion_distance===2&&
    same(QDeletion.rank_preserving_masks,[0,1,2,4,8,9,10,12])&&same(QDeletion.rank_destroying_masks,[3,5,6,7,11,13,14,15])&&same(QDeletion.cocircuit_masks,[3,5,6])&&
    same(QDeletion.rank_preserving_by_size,[1,4,3,0,0])&&same(QDeletion.rank_destroying_by_size,[0,0,3,4,1])&&same(QDeletion.single_deletion_ranks,[2,2,2,2])&&same(QDeletion.coloop_indices,[])&&QDeletion.deletion_distance===2&&
    same(DDeletionTypes,{U_1_2_PLUS_ONE_LOOP:2,U_1_1_PLUS_TWO_LOOPS:2})&&same(DContractionTypes,{U_1_2_PLUS_ONE_LOOP:2,U_0_3:2})&&
    same(QDeletionTypes,{U_2_2_PLUS_ONE_LOOP:3,U_2_3:1})&&same(QContractionTypes,{U_1_2_PLUS_ONE_LOOP:3,U_2_3:1})&&
    same(minorAxioms,{normalization_checks:16,normalization_failures:0,rank_upper_bound_checks:128,rank_upper_bound_failures:0,monotonicity_candidate_pairs:1024,monotonicity_inclusion_premises:432,monotonicity_failures:0,submodularity_pairs:1024,submodularity_failures:0})&&
    bridgePassed&&DLoopDeleteContractEqual&&QLoopDeleteContractEqual&&DNonloopContractionCollapses;

  cached=freeze({
    schema:ATLAS_RECEIVER_MATROID_MINORS_FAULT_TOLERANCE_SCHEMA,
    parent_receipt:ATLAS_RECEIVER_MATROID_MINORS_FAULT_TOLERANCE_PARENT_RECEIPT,
    parent_exact:parentExact,
    ground_set:freeze(['q00','q01','q10','q11']),
    deletion_mask_evaluations:32,
    D:freeze({deletion:DDeletion,minors:DMinors,deletion_minor_type_frequency:DDeletionTypes,contraction_minor_type_frequency:DContractionTypes}),
    Q:freeze({deletion:QDeletion,minors:QMinors,deletion_minor_type_frequency:QDeletionTypes,contraction_minor_type_frequency:QContractionTypes}),
    minor_burden:freeze({...minorAxioms,single_element_minors:16,minor_rank_values:128}),
    cross_control_bridge:freeze({obligations:6,rows:freeze(bridge),passed:bridgePassed}),
    laws:freeze({
      all_single_coordinate_deletions_preserve_full_rank:DDeletion.coloop_indices.length===0&&QDeletion.coloop_indices.length===0,
      both_deletion_distances_equal_two:DDeletion.deletion_distance===2&&QDeletion.deletion_distance===2,
      cocircuit_multiplicity_differs:DDeletion.cocircuit_masks.length===1&&QDeletion.cocircuit_masks.length===3,
      rank_preserving_deletion_enumerators_differ:!same(DDeletion.rank_preserving_by_size,QDeletion.rank_preserving_by_size),
      Q_nonloop_contractions_match_D_loop_minors:bridgePassed,
      loop_deletion_equals_loop_contraction_in_rank_table:DLoopDeleteContractEqual&&QLoopDeleteContractEqual,
      D_nonloop_contractions_collapse_to_U_0_3:DNonloopContractionCollapses,
      Q_nonloop_contraction_is_parent_D:false,
      physical_sensor_failure_claimed:false,
      causal_intervention_claimed:false,
      physical_reliability_curve_claimed:false,
    }),
    membranes:freeze([
      'MATROID_DELETION != PHYSICAL_SENSOR_FAILURE',
      'MATROID_CONTRACTION != CAUSAL_INTERVENTION',
      'COCIRCUIT != PHYSICAL_COMMON_MODE_FAILURE',
      'COGIRTH != ENGINEERING_RELIABILITY_RATING',
      'RANK_PRESERVING_DELETION_ENUMERATOR != PHYSICAL_RELIABILITY_CURVE',
      'MINIMAL_RANK_DESTROYING_SET != ATTACK_SET',
      'MINOR_ISOMORPHISM != PHYSICAL_SYSTEM_EQUIVALENCE',
      'SHARED_MATROID_MINOR != SHARED_HIDDEN_STATE',
      'NO_COLOOP != NO_SINGLE_POINT_OF_OPERATIONAL_FAILURE',
      'RECEIVER_FAULT_TOLERANCE_IN_THIS_FIXTURE != LIVE_RECEIVER_REDUNDANCY',
      'ATLAS_REGISTRATION != LIVE_RUNTIME_STATE',
    ]),
    passed:exact,
  });
  return cached;
}

export const ATLAS_RECEIVER_MATROID_MINORS_FAULT_TOLERANCE_CERTIFICATE=atlasReceiverMatroidMinorsFaultToleranceCertificate();
