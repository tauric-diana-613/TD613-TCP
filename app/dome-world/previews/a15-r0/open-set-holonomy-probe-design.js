import {
  determinant2,
  observeOperator,
  probeRow,
  rankMod
} from './discrete-transport-tomography-closed-loop.js';

export const OPEN_SET_HOLONOMY_SCHEMA='td613.ash.open-set-holonomy-probe-design/v0.1';
export const OPEN_SET_SPEC_HEAD='d5f98c5b0475b4e97feac16cd2d9479f053a16f6';

export const H1=Object.freeze([[3,5],[1,2]].map(row=>Object.freeze(row)));
export const H2=Object.freeze([[3,26],[2,28]].map(row=>Object.freeze(row)));
export const H_U=Object.freeze([[3,5],[2,2]].map(row=>Object.freeze(row)));

export const P_ALIAS=Object.freeze([
  Object.freeze({probe_id:'A1',x:Object.freeze([1,0]),p:Object.freeze([1,0])}),
  Object.freeze({probe_id:'A2',x:Object.freeze([0,1]),p:Object.freeze([1,0])}),
  Object.freeze({probe_id:'A3',x:Object.freeze([1,1]),p:Object.freeze([1,0])})
]);
export const P_DIVERSE=Object.freeze([
  Object.freeze({probe_id:'D1',x:Object.freeze([1,0]),p:Object.freeze([1,0])}),
  Object.freeze({probe_id:'D2',x:Object.freeze([0,1]),p:Object.freeze([1,0])}),
  Object.freeze({probe_id:'D3',x:Object.freeze([1,0]),p:Object.freeze([0,1])})
]);

function freeze(value){
  if(value&&typeof value==='object'&&!Object.isFrozen(value)){
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
}
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

function signature(operator,schedule){ return freeze(schedule.map(probe=>observeOperator(operator,probe))); }

function evaluate({case_id,oracle,schedule,classification_if_rejected,classification_if_survives}){
  const candidates=freeze({H1:signature(H1,schedule),H2:signature(H2,schedule)});
  const observed=signature(oracle,schedule);
  const survivors=Object.entries(candidates).filter(([,sig])=>equal(sig,observed)).map(([id])=>id);
  const rejected=survivors.length===0;
  return freeze({
    case_id,
    schedule_id:schedule===P_ALIAS?'P_ALIAS':'P_DIVERSE',
    observation_count:schedule.length,
    schedule_rank:rankMod(schedule.map(probeRow)),
    observed_signature:observed,
    candidate_signatures:candidates,
    surviving_candidate_set:freeze(survivors),
    open_set_rejection_earned:rejected,
    classification:rejected?classification_if_rejected:classification_if_survives
  });
}

export function runOpenSetHolonomyProbeDesignAssay(){
  const aliasBase=evaluate({
    case_id:'OUTSIDE_ALIAS',oracle:H_U,schedule:P_ALIAS,
    classification_if_rejected:'ALIAS_CASE_REJECTED_UNEXPECTEDLY',
    classification_if_survives:'OPEN_SET_REJECTION_NOT_EARNED_ALIAS'
  });
  const alias=freeze({
    ...aliasBase,
    oracle_truth_id:'H_U',
    oracle_truth_in_candidate_family:false,
    oracle_truth_exposed_to_decoder:false,
    oracle_override_applied:false,
    unconditional_truth_identification:false,
    model_family_validated_universally:false
  });
  const diverseBase=evaluate({
    case_id:'OUTSIDE_DIVERSE',oracle:H_U,schedule:P_DIVERSE,
    classification_if_rejected:'OPEN_SET_REJECTION_EARNED_BY_DECLARED_PROJECTION_CRITERION',
    classification_if_survives:'DIVERSE_CASE_FAILED_TO_REJECT_OUTSIDE_OPERATOR'
  });
  const diverse=freeze({
    ...diverseBase,
    oracle_truth_id:'H_U',
    oracle_truth_in_candidate_family:false,
    oracle_truth_exposed_to_decoder:false,
    oracle_override_applied:false,
    outside_operator_identified_by_name:false
  });
  const controlBase=evaluate({
    case_id:'H1_CONTROL',oracle:H1,schedule:P_DIVERSE,
    classification_if_rejected:'ADMITTED_CONTROL_REJECTED_UNEXPECTEDLY',
    classification_if_survives:'ADMITTED_H1_CONTROL_SURVIVES_EXACT_SIGNATURE_CRITERION'
  });
  const control=freeze({
    ...controlBase,
    oracle_truth_id:'H1',
    oracle_truth_in_candidate_family:true,
    failure_to_reject_is_universal_validation:false
  });

  const aliasPass=alias.schedule_rank===2&&equal(alias.observed_signature,[3,5,8])&&equal(alias.surviving_candidate_set,['H1'])&&!alias.open_set_rejection_earned&&!alias.oracle_override_applied;
  const diversePass=diverse.schedule_rank===3&&equal(diverse.observed_signature,[3,5,2])&&diverse.surviving_candidate_set.length===0&&diverse.open_set_rejection_earned;
  const controlPass=equal(control.surviving_candidate_set,['H1'])&&!control.open_set_rejection_earned;
  const matchedBudget=alias.observation_count===3&&diverse.observation_count===3;
  const pass=determinant2(H_U)===27&&matchedBudget&&aliasPass&&diversePass&&controlPass;

  return freeze({
    schema:OPEN_SET_HOLONOMY_SCHEMA,
    spec_head:OPEN_SET_SPEC_HEAD,
    arithmetic_domain:'F_31',
    candidate_family:freeze(['H1','H2']),
    out_of_family_oracle:freeze({operator:H_U,determinant:determinant2(H_U),oracle_exposed_to_decoder:false}),
    schedules:freeze({
      alias:freeze({rows:P_ALIAS.map(probeRow),rank:rankMod(P_ALIAS.map(probeRow)),observation_count:3}),
      diverse:freeze({rows:P_DIVERSE.map(probeRow),rank:rankMod(P_DIVERSE.map(probeRow)),observation_count:3})
    }),
    cases:freeze({alias,diverse,control}),
    findings:freeze({
      matched_three_scalar_budget:matchedBudget,
      out_of_family_truth_aliases_admitted_candidate_under_blind_schedule:aliasPass,
      same_out_of_family_truth_earns_rejection_under_diverse_schedule:diversePass,
      admitted_control_survives_diverse_schedule:controlPass,
      oracle_outside_truth_does_not_override_observed_criterion:true,
      open_set_model_adequacy_is_projection_dependent:pass,
      assay_mechanism_validated:pass
    }),
    bounded_answer:pass
      ? 'OPEN_SET_MODEL_ADEQUACY_IS_PROJECTION_DEPENDENT_IN_AUTHORED_FINITE_LOOP_FIXTURE'
      : 'OPEN_SET_HOLONOMY_PROBE_DESIGN_ASSAY_FAILED',
    claims:freeze({
      exact_finite_open_set_projection_geometry:pass,
      unknown_operator_identified:false,
      universal_open_set_recognition:false,
      universal_probe_optimality:false,
      physical_holonomy:false,
      physical_curvature:false,
      deployed_robustness:false,
      proto_loom:false,
      production_authority:false,
      vercel_authority:false
    }),
    promotion_authority:false,
    production_mutated:false,
    human_closure_required:true
  });
}
