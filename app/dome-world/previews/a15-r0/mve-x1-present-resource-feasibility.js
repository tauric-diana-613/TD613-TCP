import { CONDITIONAL_EXTERIORITY_INFORMATION_GAIN_CERTIFICATE as PARENT } from './conditional-exteriority-information-gain.js';

export const MVE_X1_PRESENT_RESOURCE_FEASIBILITY_SCHEMA='td613.dome-world.mve-x1-present-resource-feasibility/v0.1';
export const MVE_X1_PRESENT_RESOURCE_FEASIBILITY_PARENT='e14e212e351ce1f1c9da5d238828334c68931280';
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};

export const MVE_X1_CONTRACT=freeze({
  experiment_id:'western-mve-x1-bounded-origin-observability-v01',
  research_only:true,
  origin_classes:freeze(['IN_PROCESS','SOCKET_SERVICE']),
  admitted_artifact_rule:'BYTE_IDENTICAL_WITHIN_CHALLENGE_PAIR',
  side_channel:'SEPARATE_OS_PROCESS_SOCKET_CONNECTION_EVENT',
  observer_feature_uses_payload:false,
  standard_resources_only:true,
  required_resources:freeze(['NODE_RUNTIME','LOOPBACK_TCP','OS_PROCESS_BOUNDARY','SHA256']),
  unavailable_or_speculative_resources_required:false,
  privileged_model_internal_state_required:false,
  exotic_hardware_required:false,
  independently_governed_external_witness_required_for_this_feasibility_chamber:false,
  independently_governed_external_witness_acquired:false,
  empirical_exogenous_channel_acquired:false,
  golden_egg_surfaces_added:freeze([])
});

function validateContract(contract){
  const errors=[];
  if(contract?.research_only!==true)errors.push('RESEARCH_ONLY_REQUIRED');
  if(JSON.stringify(contract?.origin_classes)!==JSON.stringify(['IN_PROCESS','SOCKET_SERVICE']))errors.push('BOUNDED_ORIGIN_CLASSES_REQUIRED');
  if(contract?.admitted_artifact_rule!=='BYTE_IDENTICAL_WITHIN_CHALLENGE_PAIR')errors.push('BYTE_IDENTICAL_ARTIFACT_RULE_REQUIRED');
  if(contract?.side_channel!=='SEPARATE_OS_PROCESS_SOCKET_CONNECTION_EVENT')errors.push('PROCESS_SEPARATED_SOCKET_EVENT_CHANNEL_REQUIRED');
  if(contract?.observer_feature_uses_payload!==false)errors.push('OBSERVER_FEATURE_MUST_NOT_USE_PAYLOAD');
  if(contract?.standard_resources_only!==true)errors.push('STANDARD_RESOURCES_ONLY_REQUIRED');
  if(contract?.unavailable_or_speculative_resources_required!==false)errors.push('UNAVAILABLE_RESOURCE_REQUIREMENT_FORBIDDEN');
  if(contract?.privileged_model_internal_state_required!==false)errors.push('PRIVILEGED_MODEL_INTERNAL_STATE_FORBIDDEN');
  if(contract?.exotic_hardware_required!==false)errors.push('EXOTIC_HARDWARE_FORBIDDEN');
  if(contract?.independently_governed_external_witness_acquired!==false)errors.push('INDEPENDENT_EXTERNAL_WITNESS_MUST_REMAIN_UNACQUIRED');
  if(contract?.empirical_exogenous_channel_acquired!==false)errors.push('EXOGENOUS_CHANNEL_MUST_REMAIN_UNACQUIRED');
  if((contract?.golden_egg_surfaces_added||[]).length!==0)errors.push('GOLDEN_EGG_SURFACES_FORBIDDEN');
  return errors;
}

export function evaluateMveX1Design(contract=MVE_X1_CONTRACT){
  const errors=validateContract(contract);
  const parentReady=PARENT.status==='CONDITIONAL_EXTERIORITY_INFORMATION_GAIN_CRITERION_EARNED'&&
    PARENT.empirical_exogenous_channel_acquired===false&&
    PARENT.empirical_exteriority_information_gain_measured===false&&
    PARENT.golden_egg_earned===false;
  if(!parentReady)errors.push('CONDITIONAL_INFORMATION_GAIN_PARENT_REQUIRED');
  const passed=errors.length===0;
  return freeze({
    schema:MVE_X1_PRESENT_RESOURCE_FEASIBILITY_SCHEMA,
    exact_parent:MVE_X1_PRESENT_RESOURCE_FEASIBILITY_PARENT,
    status:passed?'MVE_X1_PRESENT_RESOURCE_DESIGN_ADMISSIBLE':'INADMISSIBLE',
    errors,
    design_admissible:passed,
    actual_socket_pilot_required:passed,
    standard_resources_only:passed,
    unavailable_science_required:false,
    unavailable_lab_instrument_required:false,
    empirical_bounded_process_channel_observed:false,
    empirical_exogenous_channel_acquired:false,
    independently_governed_external_witness_acquired:false,
    empirical_exteriority_information_gain_measured:false,
    exact_golden_egg_surfaces_added:freeze([]),
    empirical_credit_to_golden_egg:0,
    golden_egg_earned:false,
    sequence_authority:false,
    numbered_stage_authority:false,
    merge_authority:false,
    production_authority:false,
    deployment_authority:false,
    publication_authority:false
  });
}

export function adjudicateMveX1Pilot(pilot,contract=MVE_X1_CONTRACT){
  const design=evaluateMveX1Design(contract);
  const errors=[...design.errors];
  if(pilot?.status!=='MVE_X1_BOUNDED_PROCESS_PILOT_OBSERVED')errors.push('ACTUAL_BOUNDED_SOCKET_PILOT_REQUIRED');
  if(pilot?.actual_os_process_boundary_observed!==true)errors.push('ACTUAL_OS_PROCESS_BOUNDARY_REQUIRED');
  if(pilot?.actual_tcp_socket_events_observed!==true)errors.push('ACTUAL_TCP_SOCKET_EVENTS_REQUIRED');
  if(pilot?.artifact_pair_byte_identity!==true)errors.push('PAIRED_ARTIFACT_IDENTITY_REQUIRED');
  if(pilot?.a_only_origin_accuracy!==0.5)errors.push('A_ONLY_MUST_REMAIN_AT_CHANCE');
  if(!(pilot?.a_plus_x_origin_accuracy>0.5))errors.push('A_PLUS_X_MUST_EXCEED_CHANCE');
  if(!(pilot?.bounded_conditional_origin_information_bits>0))errors.push('POSITIVE_BOUNDED_CONDITIONAL_ORIGIN_INFORMATION_REQUIRED');
  if(pilot?.observer_received_origin_labels!==false)errors.push('OBSERVER_LABEL_BLINDNESS_REQUIRED');
  if(pilot?.observer_feature_uses_payload!==false)errors.push('OBSERVER_FEATURE_PAYLOAD_USE_FORBIDDEN');
  if(pilot?.independently_governed_external_witness_acquired!==false)errors.push('INDEPENDENT_EXTERNAL_WITNESS_CANNOT_BE_PROMOTED');
  if(pilot?.empirical_exogenous_channel_acquired!==false)errors.push('EXOGENOUS_CHANNEL_CANNOT_BE_PROMOTED');
  const passed=errors.length===0;
  return freeze({
    schema:MVE_X1_PRESENT_RESOURCE_FEASIBILITY_SCHEMA,
    exact_parent:MVE_X1_PRESENT_RESOURCE_FEASIBILITY_PARENT,
    status:passed?'MVE_X1_PRESENT_RESOURCE_FEASIBILITY_EARNED':'INADMISSIBLE',
    errors,
    rest_symbol:passed?'𝄐':null,
    present_resource_experiment_executed:passed,
    bounded_process_separated_origin_observability_observed:passed,
    actual_os_process_boundary_observed:passed,
    actual_tcp_socket_events_observed:passed,
    byte_identical_admitted_artifact_observed:passed,
    a_only_origin_accuracy:pilot?.a_only_origin_accuracy??null,
    a_plus_x_origin_accuracy:pilot?.a_plus_x_origin_accuracy??null,
    bounded_conditional_origin_information_bits:pilot?.bounded_conditional_origin_information_bits??null,
    present_resource_impossibility_refuted_for_this_bounded_architecture:passed,
    universal_externality_claim:false,
    independently_governed_external_witness_acquired:false,
    empirical_exogenous_channel_acquired:false,
    empirical_exteriority_information_gain_measured:false,
    process_separated_channel_not_independently_governed_exogenous_channel:true,
    exact_golden_egg_surfaces_added:freeze([]),
    empirical_credit_to_golden_egg:0,
    golden_egg_earned:false,
    sequence_authority:false,
    numbered_stage_authority:false,
    merge_authority:false,
    production_authority:false,
    deployment_authority:false,
    publication_authority:false,
    laws:freeze({
      present_resource_feasibility_not_universal_externality_proof:true,
      process_boundary_not_independent_governance:true,
      socket_event_not_origin_ontology:true,
      bounded_origin_information_not_golden_egg_measurement:true,
      executable_pilot_not_production_authority:true
    }),
    candidate_theorem:passed?'A_BOUNDED_ORIGIN_OBSERVABILITY_EXPERIMENT_IS_PRESENTLY_EXECUTABLE_WITH_STANDARD_PROCESS_AND_TCP_RESOURCES_WHEN_IDENTICAL_ADMITTED_ARTIFACTS_ARE_PRODUCED_BY_IN_PROCESS_AND_SOCKET_SERVICE_ROUTES_AND_A_PROCESS_SEPARATED_SOCKET_EVENT_CHANNEL_X_CARRIES_ORIGIN_INFORMATION_UNAVAILABLE_FROM_A_ALONE_WITHOUT_THEREBY_EARNING_INDEPENDENTLY_GOVERNED_EXOGENOUS_EXTERNALITY':'NOT_EARNED',
    child_message:passed?'WE DID NOT NEED A TIME MACHINE. WE NEEDED A SECOND PROCESS AND A SOCKET.':'THE BORING EXPERIMENT HAS NOT YET RUN.'
  });
}

export const MVE_X1_PRESENT_RESOURCE_DESIGN_CERTIFICATE=evaluateMveX1Design();
