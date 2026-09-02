import { TTP_DETECT_RECEIVER_INDEXED_PROVENANCE_CERTIFICATE as PARENT } from './ttp-detect-receiver-indexed-provenance-observability.js';

export const RECEIVER_SWAP_CAUSAL_ADMISSIBILITY_SCHEMA='td613.dome-world.receiver-swap-causal-admissibility/v0.1';
export const RECEIVER_SWAP_CAUSAL_ADMISSIBILITY_PARENT='066965424365eb0d76b6cbf2fe0f940cb744b498';
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const unique=a=>[...new Set(a)];

export const RECEIVER_SWAP_PREREGISTERED_PAIR=freeze({
  pair_id:'western-receiver-swap-preregistered-pair-v01',
  research_only:true,
  measurement_values_present_at_freeze:false,
  shared:freeze({
    artifact_digest:'sha256:receiver-swap-artifact-fixed',
    route_digest:'sha256:receiver-swap-route-fixed',
    carrier_id:'provenance-carrier-fixed',
    provenance_state:'WATERMARK_PRESENT_FIXED',
    source_custody_id:'receiver-swap-source-custody-fixed',
    observation_window:'T0_TO_T1_FIXED'
  }),
  receivers:freeze([
    freeze({apparatus_id:'rho_0',access_profile:'apparatus-profile-0'}),
    freeze({apparatus_id:'rho_1',access_profile:'apparatus-profile-1'})
  ]),
  allowed_difference:'RECEIVER_APPARATUS_ONLY',
  synthetic_design_fixture:true,
  externally_measured:false,
  empirical_receiver_outcomes:null
});

function validatePair(pair){
  const errors=[];
  if(pair?.research_only!==true)errors.push('RESEARCH_ONLY_REQUIRED');
  if(pair?.measurement_values_present_at_freeze!==false)errors.push('MEASUREMENTS_MUST_BE_ABSENT_AT_FREEZE');
  if(pair?.allowed_difference!=='RECEIVER_APPARATUS_ONLY')errors.push('RECEIVER_APPARATUS_MUST_BE_SOLE_ALLOWED_DIFFERENCE');
  if(pair?.synthetic_design_fixture!==true)errors.push('FORMAL_FIXTURE_MUST_REMAIN_SYNTHETIC');
  if(pair?.externally_measured!==false)errors.push('EXTERNAL_MEASUREMENT_MUST_REMAIN_UNACQUIRED');
  if(pair?.empirical_receiver_outcomes!==null)errors.push('EMPIRICAL_OUTCOMES_MUST_REMAIN_EMPTY');
  const s=pair?.shared||{};
  for(const key of ['artifact_digest','route_digest','carrier_id','provenance_state','source_custody_id','observation_window']){
    if(typeof s[key]!=='string'||s[key].length===0)errors.push(`SHARED_${key.toUpperCase()}_REQUIRED`);
  }
  const receivers=pair?.receivers||[];
  if(receivers.length!==2)errors.push('EXACTLY_TWO_RECEIVER_APPARATUSES_REQUIRED');
  const ids=receivers.map(r=>r?.apparatus_id);
  if(ids.some(x=>typeof x!=='string'||x.length===0)||new Set(ids).size!==2)errors.push('DISTINCT_RECEIVER_APPARATUSES_REQUIRED');
  return unique(errors);
}

export function evaluateReceiverSwapCausalAdmissibility(pair=RECEIVER_SWAP_PREREGISTERED_PAIR){
  const errors=validatePair(pair);
  const parentReady=PARENT.status==='RECEIVER_INDEXED_PROVENANCE_OBSERVABILITY_EARNED'&&
    PARENT.receiver_axis_admitted===true&&
    PARENT.same_artifact_multi_receiver_direct_causal_contrast_observed===false&&
    PARENT.golden_egg_earned===false;
  if(!parentReady)errors.push('RECEIVER_INDEXED_PARENT_WITH_OPEN_CAUSAL_CONTRAST_REQUIRED');
  const passed=errors.length===0;
  return freeze({
    schema:RECEIVER_SWAP_CAUSAL_ADMISSIBILITY_SCHEMA,
    exact_parent:RECEIVER_SWAP_CAUSAL_ADMISSIBILITY_PARENT,
    status:passed?'RECEIVER_SWAP_CAUSAL_ADMISSIBILITY_CRITERION_EARNED':'INADMISSIBLE',
    errors,
    rest_symbol:passed?'𝄐':null,
    receiver_swap_design_admissible:passed,
    shared_artifact_digest_fixed:passed,
    shared_route_digest_fixed:passed,
    shared_carrier_id_fixed:passed,
    shared_provenance_state_fixed:passed,
    shared_source_custody_fixed:passed,
    shared_observation_window_fixed:passed,
    distinct_receiver_apparatus_required:passed,
    single_allowed_difference_receiver_apparatus:passed,
    formal_contrast_ready_for_empirical_acquisition:passed,
    receiver_effect_observed:false,
    receiver_effect_empirically_estimated:false,
    same_artifact_receiver_causal_ablation_acquired:false,
    synthetic_design_fixture:true,
    externally_measured:false,
    empirical_credit_from_formal_design:0,
    exact_golden_egg_surfaces_added:[],
    empirical_credit_to_golden_egg:0,
    golden_egg_earned:false,
    sequence_authority:false,
    numbered_stage_authority:false,
    live_loom_mutated:false,
    merge_authority:false,
    production_authority:false,
    deployment_authority:false,
    publication_authority:false,
    candidate_theorem:passed?'A_RECEIVER_CAUSAL_PROVENANCE_CLAIM_REQUIRES_A_CONTROLLED_RECEIVER_SWAP_IN_WHICH_ARTIFACT_ROUTE_CARRIER_PROVENANCE_STATE_SOURCE_CUSTODY_AND_OBSERVATION_WINDOW_ARE_HELD_FIXED_AND_RECEIVER_APPARATUS_IS_THE_SOLE_ALLOWED_EXPERIMENTAL_DIFFERENCE':'NOT_EARNED',
    laws:freeze({
      receiver_swap_design_not_receiver_effect_observed:true,
      formal_admissibility_not_empirical_causality:true,
      synthetic_design_not_external_measurement:true,
      same_artifact_not_same_receiver:true,
      different_receiver_not_different_route:true,
      receiver_score_difference_not_origin_truth_proof:true,
      ttp_receiver_axis_not_direct_receiver_ablation:true,
      receiver_swap_contract_not_golden_egg_measurement:true
    }),
    child_message:passed?'TO TEST THE WINDOW, KEEP THE THREAD AND THE JOURNEY STILL.':'THE WINDOW TEST IS NOT YET CONTROLLED.'
  });
}

export const RECEIVER_SWAP_CAUSAL_ADMISSIBILITY_CERTIFICATE=evaluateReceiverSwapCausalAdmissibility();
