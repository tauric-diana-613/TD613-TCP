import { conjugacyFingerprint, determinant2, mod } from './gauge-blind-gl2-f31-holonomy-conjugacy.js';

export const CLAIM_TARGETED_MEASUREMENT_SCHEMA = 'td613.pedagogue.claim-targeted-next-measurement-design/v0.1';
export const CLAIM_TARGETED_SPEC_HEAD = '18b9f23ed853126af8bb790e75e61d61e9ff5c89';
export const MODULUS = 31;

const PROBE_LIBRARY = Object.freeze([
  Object.freeze({ probe_id:'P_RAW', row:Object.freeze([0,1,0,0]), meaning:'t12' }),
  Object.freeze({ probe_id:'P_CLAIM', row:Object.freeze([0,0,0,1]), meaning:'t22' }),
  Object.freeze({ probe_id:'P_MIX', row:Object.freeze([0,1,0,1]), meaning:'t12+t22' }),
  Object.freeze({ probe_id:'P_REDUNDANT', row:Object.freeze([1,0,0,0]), meaning:'t11' })
]);

function freeze(value) {
  if(value && typeof value==='object' && !Object.isFrozen(value)) {
    for(const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
function stableKey(value) { return JSON.stringify(value); }
function matrixVector(matrix) { return [matrix[0][0],matrix[0][1],matrix[1][0],matrix[1][1]].map(mod); }
function observe(matrix,probe) {
  const vector=matrixVector(matrix);
  return mod(probe.row.reduce((sum,value,index)=>sum+value*vector[index],0));
}
function targetFingerprint(matrix) { return conjugacyFingerprint(matrix).fingerprint; }
function targetKey(matrix) { return stableKey(targetFingerprint(matrix)); }

function candidateUniverse() {
  const out=[];
  for(const t22 of [5,7]) {
    for(let b=0;b<MODULUS;b+=1) {
      const matrix=freeze([[2,b],[0,t22]].map(row=>Object.freeze(row)));
      out.push(freeze({ candidate_id:`D${t22}_B${b}`, b, t22, matrix, target_fingerprint:targetFingerprint(matrix) }));
    }
  }
  return freeze(out);
}

function targetClasses(candidates) {
  const groups=new Map();
  for(const candidate of candidates) {
    const key=stableKey(candidate.target_fingerprint);
    if(!groups.has(key)) groups.set(key,[]);
    groups.get(key).push(candidate.candidate_id);
  }
  return freeze([...groups.entries()].map(([key,ids],index)=>freeze({
    target_class_id:`T${index+1}`,
    fingerprint:JSON.parse(key),
    member_count:ids.length,
    member_ids:freeze(ids)
  })));
}

function compileProbePartition(probe,candidates) {
  const bucketMap=new Map();
  for(const candidate of candidates) {
    const outcome=observe(candidate.matrix,probe);
    if(!bucketMap.has(outcome)) bucketMap.set(outcome,[]);
    bucketMap.get(outcome).push(candidate);
  }
  const buckets=[...bucketMap.entries()].sort(([a],[b])=>a-b).map(([outcome,members])=>{
    const targetMap=new Map();
    for(const candidate of members) {
      const key=targetKey(candidate.matrix);
      if(!targetMap.has(key)) targetMap.set(key,[]);
      targetMap.get(key).push(candidate.candidate_id);
    }
    return freeze({
      outcome,
      raw_candidate_count:members.length,
      candidate_ids:freeze(members.map(item=>item.candidate_id)),
      target_claim_class_count:targetMap.size,
      target_claim_classes:freeze([...targetMap.keys()].map(key=>JSON.parse(key))),
      target_pure:targetMap.size===1
    });
  });
  const bucketByOutcome=Object.fromEntries(buckets.map(bucket=>[String(bucket.outcome),bucket]));
  const candidateCountResolved=candidates.filter(candidate=>bucketByOutcome[String(observe(candidate.matrix,probe))].target_claim_class_count===1).length;
  const rawSizes=buckets.map(bucket=>bucket.raw_candidate_count);
  const targetCounts=buckets.map(bucket=>bucket.target_claim_class_count);
  return freeze({
    probe_id:probe.probe_id,
    row:probe.row,
    meaning:probe.meaning,
    scalar_observation_count:1,
    outcome_count:buckets.length,
    buckets:freeze(buckets),
    maximum_raw_bucket_size:Math.max(...rawSizes),
    minimum_raw_bucket_size:Math.min(...rawSizes),
    maximum_target_class_count_per_bucket:Math.max(...targetCounts),
    minimum_target_class_count_per_bucket:Math.min(...targetCounts),
    all_nonempty_buckets_target_pure:buckets.every(bucket=>bucket.target_pure),
    candidate_count_with_target_resolved:candidateCountResolved,
    candidate_fraction_with_target_resolved:`${candidateCountResolved}/${candidates.length}`
  });
}

function selectRaw(partitions) {
  const ranked=[...partitions].sort((left,right)=>
    left.maximum_raw_bucket_size-right.maximum_raw_bucket_size ||
    PROBE_LIBRARY.findIndex(probe=>probe.probe_id===left.probe_id)-PROBE_LIBRARY.findIndex(probe=>probe.probe_id===right.probe_id)
  );
  return freeze({
    selector_id:'RAW_STATE_WORST_CASE_AMBIGUITY_MINIMIZER',
    oracle_candidate_consulted:false,
    selected_probe_id:ranked[0].probe_id,
    selected_maximum_raw_bucket_size:ranked[0].maximum_raw_bucket_size,
    target_claim_consulted:false
  });
}

function selectClaim(partitions) {
  const ranked=[...partitions].sort((left,right)=>
    left.maximum_target_class_count_per_bucket-right.maximum_target_class_count_per_bucket ||
    left.maximum_raw_bucket_size-right.maximum_raw_bucket_size ||
    PROBE_LIBRARY.findIndex(probe=>probe.probe_id===left.probe_id)-PROBE_LIBRARY.findIndex(probe=>probe.probe_id===right.probe_id)
  );
  return freeze({
    selector_id:'TARGET_CLAIM_WORST_CASE_CLASS_AMBIGUITY_MINIMIZER',
    target_claim_id:'CONJUGACY_FINGERPRINT',
    oracle_candidate_consulted:false,
    selected_probe_id:ranked[0].probe_id,
    selected_maximum_target_class_count:ranked[0].maximum_target_class_count_per_bucket,
    selected_maximum_raw_bucket_size:ranked[0].maximum_raw_bucket_size
  });
}

function exhaustiveSelectorComparison(candidates,partitionById,rawSelector,claimSelector) {
  const rawPartition=partitionById[rawSelector.selected_probe_id];
  const claimPartition=partitionById[claimSelector.selected_probe_id];
  const rawBuckets=Object.fromEntries(rawPartition.buckets.map(bucket=>[String(bucket.outcome),bucket]));
  const claimBuckets=Object.fromEntries(claimPartition.buckets.map(bucket=>[String(bucket.outcome),bucket]));
  const rawProbe=PROBE_LIBRARY.find(probe=>probe.probe_id===rawSelector.selected_probe_id);
  const claimProbe=PROBE_LIBRARY.find(probe=>probe.probe_id===claimSelector.selected_probe_id);
  const cases=candidates.map(candidate=>{
    const rawOutcome=observe(candidate.matrix,rawProbe);
    const claimOutcome=observe(candidate.matrix,claimProbe);
    const rawBucket=rawBuckets[String(rawOutcome)];
    const claimBucket=claimBuckets[String(claimOutcome)];
    return freeze({
      candidate_id:candidate.candidate_id,
      true_target_fingerprint:candidate.target_fingerprint,
      raw_selector_outcome:rawOutcome,
      raw_selector_remaining_raw_count:rawBucket.raw_candidate_count,
      raw_selector_remaining_target_class_count:rawBucket.target_claim_class_count,
      claim_selector_outcome:claimOutcome,
      claim_selector_remaining_raw_count:claimBucket.raw_candidate_count,
      claim_selector_remaining_target_class_count:claimBucket.target_claim_class_count
    });
  });
  return freeze({
    case_count:cases.length,
    cases:freeze(cases),
    every_candidate_raw_selector_leaves_two_raw_and_two_target_classes:cases.every(item=>item.raw_selector_remaining_raw_count===2&&item.raw_selector_remaining_target_class_count===2),
    every_candidate_claim_selector_leaves_thirty_one_raw_and_one_target_class:cases.every(item=>item.claim_selector_remaining_raw_count===31&&item.claim_selector_remaining_target_class_count===1)
  });
}

export function runClaimTargetedNextMeasurementDesignBridge() {
  const candidates=candidateUniverse();
  const classes=targetClasses(candidates);
  const partitions=freeze(PROBE_LIBRARY.map(probe=>compileProbePartition(probe,candidates)));
  const partitionById=Object.fromEntries(partitions.map(partition=>[partition.probe_id,partition]));
  const rawSelector=selectRaw(partitions);
  const claimSelector=selectClaim(partitions);
  const exhaustive=exhaustiveSelectorComparison(candidates,partitionById,rawSelector,claimSelector);

  const class5=candidates.filter(candidate=>candidate.t22===5);
  const class7=candidates.filter(candidate=>candidate.t22===7);
  const class5Keys=new Set(class5.map(candidate=>targetKey(candidate.matrix)));
  const class7Keys=new Set(class7.map(candidate=>targetKey(candidate.matrix)));
  const candidateModelPass=
    candidates.length===62 && candidates.every(candidate=>determinant2(candidate.matrix)!==0) &&
    class5Keys.size===1 && class7Keys.size===1 && [...class5Keys][0]!==[...class7Keys][0];
  const probeGeometryPass=
    partitionById.P_RAW.maximum_raw_bucket_size===2 &&
    partitionById.P_MIX.maximum_raw_bucket_size===2 &&
    partitionById.P_CLAIM.maximum_raw_bucket_size===31 &&
    partitionById.P_REDUNDANT.maximum_raw_bucket_size===62 &&
    partitionById.P_CLAIM.all_nonempty_buckets_target_pure===true &&
    partitionById.P_RAW.maximum_target_class_count_per_bucket===2 &&
    partitionById.P_MIX.maximum_target_class_count_per_bucket===2 &&
    partitionById.P_REDUNDANT.maximum_target_class_count_per_bucket===2;
  const pass=
    candidateModelPass && classes.length===2 && probeGeometryPass &&
    rawSelector.selected_probe_id==='P_RAW' && claimSelector.selected_probe_id==='P_CLAIM' &&
    rawSelector.oracle_candidate_consulted===false && claimSelector.oracle_candidate_consulted===false &&
    exhaustive.every_candidate_raw_selector_leaves_two_raw_and_two_target_classes &&
    exhaustive.every_candidate_claim_selector_leaves_thirty_one_raw_and_one_target_class;

  return freeze({
    schema:CLAIM_TARGETED_MEASUREMENT_SCHEMA,
    spec_head:CLAIM_TARGETED_SPEC_HEAD,
    source_status:'SIMULATED',
    arithmetic_domain:'F_31',
    current_aperture:freeze({ fixed_coordinates:freeze({t11:2,t21:0}), candidate_model_t22:freeze([5,7]), free_coordinate:'t12', compatible_candidate_count:candidates.length }),
    candidate_universe:candidates,
    target_claim:freeze({ claim_id:'CONJUGACY_FINGERPRINT', target_classes:classes, target_class_count:classes.length }),
    probe_library:PROBE_LIBRARY,
    probe_partitions:partitions,
    selectors:freeze({ raw_state:rawSelector, target_claim:claimSelector }),
    exhaustive_no_oracle_evaluation:exhaustive,
    findings:freeze({
      raw_state_and_target_claim_selectors_diverge:rawSelector.selected_probe_id!==claimSelector.selected_probe_id,
      raw_selector_minimizes_worst_case_raw_ambiguity_but_never_resolves_target_claim:rawSelector.selected_probe_id==='P_RAW' && partitionById.P_RAW.candidate_count_with_target_resolved===0,
      claim_selector_resolves_target_for_every_candidate_while_leaving_more_raw_candidates:claimSelector.selected_probe_id==='P_CLAIM' && partitionById.P_CLAIM.candidate_count_with_target_resolved===62 && partitionById.P_CLAIM.maximum_raw_bucket_size>partitionById.P_RAW.maximum_raw_bucket_size,
      target_conditioned_measurement_design_bridge_validated:pass
    }),
    contradiction_ledger:freeze([
      'THE_PROBE_THAT_MINIMIZES_WORST_CASE_RAW_AMBIGUITY_CAN_FAIL_TO_RESOLVE_THE_TARGET_CLAIM',
      'A_PROBE_THAT_LEAVES_MORE_RAW_STATES_ALIVE_CAN_RESOLVE_THE_PREDECLARED_TARGET_CLAIM_FOR_EVERY_COMPATIBLE_CANDIDATE',
      'RAW_CANDIDATE_SHRINKAGE_NE_TARGET_CLAIM_RESOLUTION'
    ]),
    bounded_answer:pass
      ? 'CLAIM_TARGETED_NEXT_MEASUREMENT_DESIGN_CAN_DIVERGE_FROM_RAW_STATE_AMBIGUITY_MINIMIZATION_IN_AUTHORED_HOLONOMY_COMPATIBLE_FAMILY'
      : 'CLAIM_TARGETED_NEXT_MEASUREMENT_DESIGN_BRIDGE_FAILED',
    bridge_relation:pass
      ? 'PEDAGOGUE_PROBE_SELECTION_CAN_BE_CONDITIONED_ON_THE_CLAIM_LICENSE_SOUGHT_WITHOUT_REQUIRING_FULL_RAW_RECONSTRUCTION_IN_THIS_SYNTHETIC_MODEL'
      : null,
    claim_ceiling:freeze({
      universal_experiment_optimality:false,
      mutual_information_optimality:false,
      bayesian_active_learning:false,
      causal_experimental_design:false,
      live_autonomous_measurement_authority:false,
      physical_sensor_design:false,
      physical_holonomy:false,
      proto_loom:false,
      production_authority:false,
      vercel_authority:false
    }),
    promotion_authority:false,
    production_mutated:false,
    human_closure_required:true
  });
}
