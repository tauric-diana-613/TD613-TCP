import { conjugacyFingerprint, mod } from './gauge-blind-gl2-f31-holonomy-conjugacy.js';

export const CLAIM_SUFFICIENT_STOPPING_SCHEMA = 'td613.pedagogue.claim-sufficient-stopping/v0.1';
export const CLAIM_SUFFICIENT_STOPPING_SPEC_HEAD = '0195468decef93eea37df9a62748f984b9a3c9cc';
export const MODULUS = 31;

const PROBES = Object.freeze({
  P_RAW:Object.freeze({ probe_id:'P_RAW', evaluate:matrix=>mod(matrix[0][1]) }),
  P_CLAIM:Object.freeze({ probe_id:'P_CLAIM', evaluate:matrix=>mod(matrix[1][1]) })
});
const OUTSIDER = Object.freeze([[2,11],[0,6]].map(row=>Object.freeze(row)));

function freeze(value) {
  if(value && typeof value==='object' && !Object.isFrozen(value)) {
    for(const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
function stableKey(value) { return JSON.stringify(value); }

function candidateUniverse() {
  const out=[];
  for(const d of [5,7]) for(let b=0;b<MODULUS;b+=1) out.push(freeze({
    candidate_id:`D${d}_B${b}`,
    matrix:freeze([[2,b],[0,d]].map(row=>Object.freeze(row)))
  }));
  return freeze(out);
}

function claimValue(matrix,claimId) {
  if(claimId==='RAW_MATRIX') return matrix;
  if(claimId==='CONJUGACY_FINGERPRINT') return conjugacyFingerprint(matrix).fingerprint;
  throw new Error(`unknown target claim ${claimId}`);
}

function claimState(family,claimId) {
  if(family.length===0) return freeze({ ready:false, distinct_value_count:0, value:null, classification:'COMPATIBLE_SET_EMPTY' });
  const values=[];
  const keys=new Set();
  for(const candidate of family) {
    const value=claimValue(candidate.matrix,claimId);
    const key=stableKey(value);
    if(!keys.has(key)) { keys.add(key); values.push(value); }
  }
  return freeze({
    ready:values.length===1,
    distinct_value_count:values.length,
    value:values.length===1 ? values[0] : null,
    classification:values.length===1 ? 'CLAIM_LICENSE_READY' : 'CLAIM_REMAINS_WITHHELD'
  });
}

function updateCompatible(family,probe,outcome) {
  return freeze(family.filter(candidate=>probe.evaluate(candidate.matrix)===outcome));
}

function runPolicyForTruth({ truth, targetClaimId, probeSequence }) {
  let family=candidateUniverse();
  const steps=[];
  const initialClaim=claimState(family,targetClaimId);
  if(initialClaim.ready) return freeze({
    target_claim_id:targetClaimId,
    truth_id:truth.candidate_id??'OUTSIDER',
    steps:freeze([]),
    measurement_count:0,
    target_claim_licensed:true,
    raw_matrix_identified:family.length===1,
    remaining_raw_count:family.length,
    remaining_target_class_count:initialClaim.distinct_value_count,
    stop_reason:'TARGET_CLAIM_ALREADY_LICENSED'
  });

  for(const probeId of probeSequence) {
    const probe=PROBES[probeId];
    const outcome=probe.evaluate(truth.matrix);
    const priorCount=family.length;
    const updated=updateCompatible(family,probe,outcome);
    if(updated.length===0) {
      steps.push(freeze({
        step_index:steps.length+1,
        probe_id:probeId,
        observed_outcome:outcome,
        prior_compatible_count:priorCount,
        updated_compatible_count:0,
        target_claim_state:null,
        classification:'OBSERVATION_OUTSIDE_CURRENT_MODEL_SUPPORT'
      }));
      return freeze({
        target_claim_id:targetClaimId,
        truth_id:truth.candidate_id??'OUTSIDER',
        steps:freeze(steps),
        measurement_count:steps.length,
        target_claim_licensed:false,
        raw_matrix_identified:false,
        remaining_raw_count:0,
        remaining_target_class_count:0,
        forced_nearest_candidate:false,
        measurement_sequence_stops:true,
        stop_reason:'OBSERVATION_OUTSIDE_CURRENT_MODEL_SUPPORT'
      });
    }
    family=updated;
    const state=claimState(family,targetClaimId);
    steps.push(freeze({
      step_index:steps.length+1,
      probe_id:probeId,
      observed_outcome:outcome,
      prior_compatible_count:priorCount,
      updated_compatible_count:family.length,
      target_claim_state:state,
      classification:state.ready ? 'TARGET_CLAIM_LICENSED' : 'TARGET_CLAIM_STILL_WITHHELD'
    }));
    if(state.ready) {
      return freeze({
        target_claim_id:targetClaimId,
        truth_id:truth.candidate_id??'OUTSIDER',
        steps:freeze(steps),
        measurement_count:steps.length,
        target_claim_licensed:true,
        target_claim_value:state.value,
        raw_matrix_identified:family.length===1,
        remaining_raw_count:family.length,
        remaining_target_class_count:state.distinct_value_count,
        forced_nearest_candidate:false,
        measurement_sequence_stops:true,
        stop_reason:'TARGET_CLAIM_LICENSED'
      });
    }
  }
  const state=claimState(family,targetClaimId);
  return freeze({
    target_claim_id:targetClaimId,
    truth_id:truth.candidate_id??'OUTSIDER',
    steps:freeze(steps),
    measurement_count:steps.length,
    target_claim_licensed:state.ready,
    target_claim_value:state.value,
    raw_matrix_identified:family.length===1,
    remaining_raw_count:family.length,
    remaining_target_class_count:state.distinct_value_count,
    forced_nearest_candidate:false,
    measurement_sequence_stops:true,
    stop_reason:state.ready ? 'TARGET_CLAIM_LICENSED' : 'PROBE_SEQUENCE_EXHAUSTED_TARGET_UNRESOLVED'
  });
}

export function runClaimSufficientStoppingAssay() {
  const candidates=candidateUniverse();
  const goalCases=candidates.map(truth=>freeze({
    candidate_id:truth.candidate_id,
    goal_policy:runPolicyForTruth({truth,targetClaimId:'CONJUGACY_FINGERPRINT',probeSequence:['P_CLAIM']}),
    raw_first_policy:runPolicyForTruth({truth,targetClaimId:'CONJUGACY_FINGERPRINT',probeSequence:['P_RAW','P_CLAIM']})
  }));

  const goalUniform=goalCases.every(item=>
    item.goal_policy.measurement_count===1 && item.goal_policy.target_claim_licensed &&
    item.goal_policy.remaining_raw_count===31 && !item.goal_policy.raw_matrix_identified &&
    item.raw_first_policy.steps[0].target_claim_state.ready===false &&
    item.raw_first_policy.measurement_count===2 && item.raw_first_policy.target_claim_licensed &&
    item.raw_first_policy.remaining_raw_count===1 && item.raw_first_policy.raw_matrix_identified
  );

  const rawGoalClaimFirst=candidates.map(truth=>runPolicyForTruth({truth,targetClaimId:'RAW_MATRIX',probeSequence:['P_CLAIM','P_RAW']}));
  const rawGoalRawFirst=candidates.map(truth=>runPolicyForTruth({truth,targetClaimId:'RAW_MATRIX',probeSequence:['P_RAW','P_CLAIM']}));
  const rawGoalUniform=[...rawGoalClaimFirst,...rawGoalRawFirst].every(result=>
    result.measurement_count===2 && result.target_claim_licensed && result.raw_matrix_identified && result.remaining_raw_count===1
  );

  const outsiderTruth=freeze({ candidate_id:'OUTSIDER_D6_B11', matrix:OUTSIDER });
  const outsider=runPolicyForTruth({truth:outsiderTruth,targetClaimId:'CONJUGACY_FINGERPRINT',probeSequence:['P_CLAIM']});
  const outsiderPass=
    outsider.measurement_count===1 && outsider.steps[0].observed_outcome===6 &&
    outsider.remaining_raw_count===0 && !outsider.target_claim_licensed &&
    outsider.forced_nearest_candidate===false && outsider.stop_reason==='OBSERVATION_OUTSIDE_CURRENT_MODEL_SUPPORT';

  const pass=goalUniform && rawGoalUniform && outsiderPass;

  return freeze({
    schema:CLAIM_SUFFICIENT_STOPPING_SCHEMA,
    spec_head:CLAIM_SUFFICIENT_STOPPING_SPEC_HEAD,
    source_status:'SIMULATED',
    arithmetic_domain:'F_31',
    candidate_count:candidates.length,
    policies:freeze({
      goal_conditioned:freeze({ target_claim:'CONJUGACY_FINGERPRINT', probe_sequence:freeze(['P_CLAIM']), stop_when_claim_license_ready:true }),
      raw_state_first:freeze({ target_claim:'CONJUGACY_FINGERPRINT', probe_sequence:freeze(['P_RAW','P_CLAIM']), stop_when_claim_license_ready:true })
    }),
    exhaustive_in_model_goal_cases:freeze({ case_count:goalCases.length, cases:freeze(goalCases), uniform_relation_holds:goalUniform }),
    raw_state_goal_control:freeze({
      target_claim:'RAW_MATRIX',
      claim_first_policy_all_require_two:rawGoalClaimFirst.every(result=>result.measurement_count===2),
      raw_first_policy_all_require_two:rawGoalRawFirst.every(result=>result.measurement_count===2),
      all_end_singleton:rawGoalUniform
    }),
    outsider_control:freeze({
      truth_matrix:OUTSIDER,
      oracle_outside_label_used_to_override_support_test:false,
      result:outsider,
      control_pass:outsiderPass
    }),
    measurement_count_ledger:freeze({
      conjugacy_goal_conditioned:1,
      conjugacy_raw_first:2,
      raw_matrix_goal:2
    }),
    findings:freeze({
      goal_conditioned_policy_stops_before_raw_reconstruction_for_every_in_model_candidate:goalUniform,
      raw_state_first_policy_requires_extra_scalar_to_license_same_target_claim:goalUniform,
      raw_state_goal_still_requires_both_measurements:rawGoalUniform,
      out_of_model_observation_stops_with_model_inadequacy_not_forced_classification:outsiderPass,
      assay_validated:pass
    }),
    bounded_answer:pass
      ? 'CLAIM_SUFFICIENT_STOPPING_CAN_REDUCE_SYNTHETIC_MEASUREMENT_COUNT_RELATIVE_TO_RAW_STATE_FIRST_RECONSTRUCTION_FOR_A_PREDECLARED_HOLONOMY_CLAIM'
      : 'CLAIM_SUFFICIENT_STOPPING_ASSAY_FAILED',
    pedagogue_relation:pass
      ? 'PEDAGOGUE_CAN_STOP_WHEN_THE_REQUESTED_CLAIM_IS_CONSTANT_OVER_THE_SURVIVING_COMPATIBLE_FAMILY_WITHOUT_WAITING_FOR_A_POINT_ESTIMATE_IN_THIS_SYNTHETIC_MODEL'
      : null,
    hostile_relation:outsiderPass
      ? 'OUT_OF_MODEL_OBSERVATION_STOPS_WITH_MODEL_INADEQUACY_NOT_FORCED_CLASSIFICATION'
      : null,
    claim_ceiling:freeze({
      universal_active_learning_law:false,
      bayesian_optimality:false,
      live_autonomous_experimentation:false,
      physical_sensing:false,
      proto_loom:false,
      production_authority:false,
      vercel_authority:false
    }),
    promotion_authority:false,
    production_mutated:false,
    human_closure_required:true
  });
}
