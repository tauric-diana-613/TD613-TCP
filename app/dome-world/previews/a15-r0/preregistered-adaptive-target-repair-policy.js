import crypto from 'node:crypto';
import { MINIMAL_TARGET_SEPARATING_ACQUISITION_COVER_CERTIFICATE as PARENT } from './minimal-target-separating-acquisition-cover.js';

export const PREREGISTERED_ADAPTIVE_TARGET_REPAIR_SCHEMA='td613.dome-world.preregistered-adaptive-target-repair-policy/v0.1';
export const PREREGISTERED_ADAPTIVE_TARGET_REPAIR_PARENT='99a3dc13638ddb74b5b65336fb3d306b50f59dff';
export const PREREGISTERED_POLICY_DIGEST='daf12e7188e768680db65caba450c7de98b008a1666c058d6ebdae4b01a8fa24';

const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const stable=v=>{if(Array.isArray(v))return `[${v.map(stable).join(',')}]`;if(v&&typeof v==='object')return `{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${stable(v[k])}`).join(',')}}`;return JSON.stringify(v);};
const digest=v=>crypto.createHash('sha256').update(stable(v)).digest('hex');
const pairKey=(a,b)=>[a,b].sort().join('|');

export const ADAPTIVE_REPAIR_POLICY=freeze({
  policy_id:'western-adaptive-target-repair-v01',
  target_id:'THETA',
  frozen_before_outcomes:true,
  start:'Z_BRANCH',
  branch_map:{
    A_SEPARATED:{next:'Z_BC',stop_if_complete:true},
    C_SEPARATED:{next:'Z_AB',stop_if_complete:true}
  },
  stop_rule:'STOP_WHEN_UNRESOLVED_TARGET_PAIR_COUNT_IS_ZERO',
  objective:'MIN_EXPECTED_TOTAL_COST',
  costs:{Z_BRANCH:1,Z_AB:1,Z_BC:1},
  outcome_probabilities:{A_SEPARATED:0.5,C_SEPARATED:0.5}
});

export const ADAPTIVE_REPAIR_FIXTURE=freeze({
  target_id:'THETA',
  hypotheses:['THETA_A','THETA_B','THETA_C'],
  base_unresolved_pairs:[['THETA_A','THETA_B'],['THETA_A','THETA_C'],['THETA_B','THETA_C']],
  acquisitions:{
    Z_BRANCH:{
      outcomes:{
        A_SEPARATED:{resolves:[['THETA_A','THETA_B'],['THETA_A','THETA_C']]},
        C_SEPARATED:{resolves:[['THETA_A','THETA_C'],['THETA_B','THETA_C']]}
      }
    },
    Z_AB:{outcomes:{SUCCESS:{resolves:[['THETA_A','THETA_B']]}}},
    Z_BC:{outcomes:{SUCCESS:{resolves:[['THETA_B','THETA_C']]}}}
  }
});

function validatePolicy(policy=ADAPTIVE_REPAIR_POLICY){
  const errors=[];
  if(PARENT.status!=='MINIMAL_TARGET_SEPARATING_ACQUISITION_COVER_EARNED')errors.push('MINIMAL_TARGET_SEPARATING_PARENT_REQUIRED');
  if(policy?.target_id!=='THETA')errors.push('DECLARED_TARGET_THETA_REQUIRED');
  if(policy?.frozen_before_outcomes!==true)errors.push('POLICY_MUST_BE_FROZEN_BEFORE_OUTCOMES');
  if(policy?.start!=='Z_BRANCH')errors.push('PREREGISTERED_START_REQUIRED');
  if(policy?.stop_rule!=='STOP_WHEN_UNRESOLVED_TARGET_PAIR_COUNT_IS_ZERO')errors.push('PREREGISTERED_STOP_RULE_REQUIRED');
  if(policy?.objective!=='MIN_EXPECTED_TOTAL_COST')errors.push('DECLARED_OBJECTIVE_REQUIRED');
  if(digest(policy)!==PREREGISTERED_POLICY_DIGEST)errors.push('PREREGISTERED_POLICY_DIGEST_MISMATCH');
  if(policy?.branch_map?.A_SEPARATED?.next!=='Z_BC')errors.push('A_BRANCH_NEXT_ACQUISITION_MISMATCH');
  if(policy?.branch_map?.C_SEPARATED?.next!=='Z_AB')errors.push('C_BRANCH_NEXT_ACQUISITION_MISMATCH');
  const probs=Object.values(policy?.outcome_probabilities||{});
  if(probs.length!==2||probs.some(x=>!Number.isFinite(x)||x<0)||Math.abs(probs.reduce((a,b)=>a+b,0)-1)>1e-12)errors.push('VALID_PREREGISTERED_OUTCOME_PROBABILITIES_REQUIRED');
  for(const [k,v] of Object.entries(policy?.costs||{}))if(!Number.isFinite(v)||v<0)errors.push(`NONNEGATIVE_COST_REQUIRED:${k}`);
  return [...new Set(errors)];
}

function applyResolved(unresolved,resolves){
  const r=new Set((resolves||[]).map(([a,b])=>pairKey(a,b)));
  return unresolved.filter(([a,b])=>!r.has(pairKey(a,b)));
}

export function predictedAdaptiveLedger(policy=ADAPTIVE_REPAIR_POLICY,fixture=ADAPTIVE_REPAIR_FIXTURE){
  const errors=validatePolicy(policy);
  if(errors.length)throw new Error(errors.join('|'));
  const base=fixture.base_unresolved_pairs.length;
  const branch=fixture.acquisitions.Z_BRANCH.outcomes;
  const outcomes=Object.entries(policy.outcome_probabilities).map(([outcome,p])=>{
    const remaining=applyResolved(fixture.base_unresolved_pairs,branch[outcome].resolves);
    return {outcome,probability:p,predicted_unresolved_pairs:remaining.length,predicted_pairs_resolved:base-remaining.length,next_acquisition:policy.branch_map[outcome].next};
  });
  const expectedUnresolved=outcomes.reduce((s,x)=>s+x.probability*x.predicted_unresolved_pairs,0);
  const expectedResolved=base-expectedUnresolved;
  const expectedTotalCost=policy.costs.Z_BRANCH+outcomes.reduce((s,x)=>s+x.probability*policy.costs[x.next_acquisition],0);
  return freeze({
    policy_digest:PREREGISTERED_POLICY_DIGEST,
    ledger_kind:'PREDICTED_BEFORE_OUTCOME',
    target_id:policy.target_id,
    base_unresolved_pairs:base,
    branch_predictions:outcomes,
    expected_unresolved_pairs_after_first_acquisition:expectedUnresolved,
    expected_pairs_resolved_after_first_acquisition:expectedResolved,
    expected_total_policy_cost:expectedTotalCost,
    realized_outcome:null,
    realized_refinement:null
  });
}

export function executeAdaptiveRepairTrace(trace,{policy=ADAPTIVE_REPAIR_POLICY,fixture=ADAPTIVE_REPAIR_FIXTURE}={}){
  const errors=validatePolicy(policy);
  if(errors.length)throw new Error(errors.join('|'));
  if(!Array.isArray(trace)||trace.length<2)throw new Error('TWO_STAGE_REALIZED_TRACE_REQUIRED');
  if(trace[0]?.acquisition!=='Z_BRANCH')throw new Error('PREREGISTERED_START_ACQUISITION_REQUIRED');
  const firstOutcome=trace[0]?.outcome;
  if(!policy.branch_map[firstOutcome])throw new Error('UNDECLARED_FIRST_OUTCOME');
  const firstSpec=fixture.acquisitions.Z_BRANCH.outcomes[firstOutcome];
  if(!firstSpec)throw new Error('FIRST_OUTCOME_NOT_IN_FIXTURE');
  let unresolved=applyResolved(fixture.base_unresolved_pairs,firstSpec.resolves);
  const expectedNext=policy.branch_map[firstOutcome].next;
  if(trace[1]?.acquisition!==expectedNext)throw new Error('POSTHOC_RESELECTION_FORBIDDEN');
  if(trace[1]?.outcome!=='SUCCESS')throw new Error('DECLARED_SECOND_STAGE_SUCCESS_OUTCOME_REQUIRED');
  const secondSpec=fixture.acquisitions[expectedNext]?.outcomes?.SUCCESS;
  if(!secondSpec)throw new Error('SECOND_STAGE_FIXTURE_REQUIRED');
  unresolved=applyResolved(unresolved,secondSpec.resolves);
  if(unresolved.length!==0)throw new Error('STOP_RULE_NOT_MET');
  if(trace.length!==2)throw new Error('POST_STOP_ACQUISITION_FORBIDDEN');
  const totalCost=policy.costs.Z_BRANCH+policy.costs[expectedNext];
  return freeze({
    schema:PREREGISTERED_ADAPTIVE_TARGET_REPAIR_SCHEMA,
    exact_parent:PREREGISTERED_ADAPTIVE_TARGET_REPAIR_PARENT,
    policy_digest:PREREGISTERED_POLICY_DIGEST,
    ledger_kind:'REALIZED_AFTER_OUTCOME',
    target_id:policy.target_id,
    realized_first_outcome:firstOutcome,
    realized_second_acquisition:expectedNext,
    realized_trace:trace,
    realized_unresolved_target_pairs:0,
    realized_complete_identification:true,
    realized_total_cost:totalCost,
    policy_branch_followed:true,
    posthoc_reselection_used:false,
    stop_rule_met:true,
    empirical_target_outcome_acquired:false,
    synthetic_outcome_fixture:true,
    empirical_supplemental_probe_repair_earned:false,
    external_origin_of_artifact_proven:false,
    exact_golden_egg_surfaces_added:freeze([]),
    empirical_credit_to_golden_egg:0,
    golden_egg_earned:false
  });
}

export function runPreregisteredAdaptiveTargetRepairPolicy(policy=ADAPTIVE_REPAIR_POLICY,fixture=ADAPTIVE_REPAIR_FIXTURE){
  const errors=validatePolicy(policy);
  if(errors.length)return freeze({status:'INADMISSIBLE',errors});
  const predicted=predictedAdaptiveLedger(policy,fixture);
  const a=executeAdaptiveRepairTrace([{acquisition:'Z_BRANCH',outcome:'A_SEPARATED'},{acquisition:'Z_BC',outcome:'SUCCESS'}],{policy,fixture});
  const c=executeAdaptiveRepairTrace([{acquisition:'Z_BRANCH',outcome:'C_SEPARATED'},{acquisition:'Z_AB',outcome:'SUCCESS'}],{policy,fixture});
  const nonadaptiveGuaranteedCost=policy.costs.Z_BRANCH+policy.costs.Z_AB+policy.costs.Z_BC;
  const adaptiveExpectedCost=predicted.expected_total_policy_cost;
  const passed=predicted.expected_unresolved_pairs_after_first_acquisition===1&&predicted.expected_pairs_resolved_after_first_acquisition===2&&adaptiveExpectedCost===2&&a.realized_complete_identification&&c.realized_complete_identification&&a.realized_total_cost===2&&c.realized_total_cost===2&&nonadaptiveGuaranteedCost===3;
  return freeze({
    schema:PREREGISTERED_ADAPTIVE_TARGET_REPAIR_SCHEMA,
    exact_parent:PREREGISTERED_ADAPTIVE_TARGET_REPAIR_PARENT,
    status:passed?'PREREGISTERED_ADAPTIVE_TARGET_REPAIR_POLICY_EARNED':'INADMISSIBLE',
    errors:passed?[]:['ADAPTIVE_POLICY_FIXTURE_FAILED'],
    rest_symbol:passed?'𝄐':null,
    policy_digest:PREREGISTERED_POLICY_DIGEST,
    policy_frozen_before_outcomes:true,
    predicted_ledger:predicted,
    realized_branch_receipts:{A_SEPARATED:a,C_SEPARATED:c},
    expected_target_refinement_not_realized_target_refinement:true,
    adaptation_rule_preregistered_before_outcomes:true,
    outcome_contingent_next_acquisition_admitted:true,
    posthoc_reselection_forbidden:true,
    adaptive_expected_total_cost:adaptiveExpectedCost,
    nonadaptive_guaranteed_total_cost:nonadaptiveGuaranteedCost,
    adaptive_cost_lower_in_fixture:adaptiveExpectedCost<nonadaptiveGuaranteedCost,
    empirical_target_outcome_acquired:false,
    synthetic_outcome_fixture:true,
    stochastic_probe_failure_model_earned:false,
    variable_realized_cost_model_earned:false,
    empirical_supplemental_probe_repair_earned:false,
    external_empirical_exteriority_witness_acquired:false,
    empirical_exteriority_information_gain_measured:false,
    external_origin_of_artifact_proven:false,
    exact_golden_egg_surfaces_added:freeze([]),
    empirical_credit_to_golden_egg:0,
    golden_egg_earned:false,
    sequence_authority:false,
    numbered_stage_authority:false,
    live_loom_mutated:false,
    merge_authority:false,
    production_authority:false,
    deployment_authority:false,
    publication_authority:false,
    laws:freeze({
      expected_target_refinement_not_realized_target_refinement:true,
      static_complete_cover_not_adaptive_empirical_repair:true,
      preregistered_adaptation_not_posthoc_reselection:true,
      policy_branching_not_unbounded_reselection:true,
      predicted_coverage_not_realized_coverage:true,
      synthetic_outcome_policy_assay_not_empirical_supplemental_probe_repair:true,
      adaptive_target_repair_not_empirical_exteriority:true,
      adaptive_target_repair_not_golden_egg_measurement:true
    }),
    theorem:passed?'A_TARGET_REPAIR_POLICY_MAY_ADAPT_TO_INTERIM_OUTCOMES_WITHOUT_POSTHOC_RESELECTION_WHEN_THE_BRANCHING_RULES_STOPPING_RULE_OBJECTIVE_AND_COSTS_ARE_FROZEN_BEFORE_ACQUISITION_AND_REALIZED_IDENTIFYING_CREDIT_IS_ADJUDICATED_ONLY_FROM_OBSERVED_BRANCH_OUTCOMES':'NOT_EARNED',
    child_message:passed?'THE PLAN MAY TURN AFTER THE RESULT, BUT THE TURN HAD TO EXIST BEFORE THE RESULT ARRIVED.':'THE ADAPTIVE REPAIR POLICY HAS NOT BEEN EARNED.'
  });
}

export const PREREGISTERED_ADAPTIVE_TARGET_REPAIR_CERTIFICATE=runPreregisteredAdaptiveTargetRepairPolicy();
