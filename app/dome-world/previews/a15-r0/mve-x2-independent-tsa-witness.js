import { MVE_X1_PRESENT_RESOURCE_DESIGN_CERTIFICATE as X1_PARENT } from './mve-x1-present-resource-feasibility.js';

export const MVE_X2_INDEPENDENT_TSA_WITNESS_SCHEMA='td613.dome-world.mve-x2-independent-tsa-witness/v0.1';
export const MVE_X2_INDEPENDENT_TSA_WITNESS_PARENT='a339d5a5bbaac1a63b4d1f88e6dc8668b611b345';
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};

export const MVE_X2_CONTRACT=freeze({
  experiment_id:'western-mve-x2-independent-rfc3161-witness-v01',
  research_only:true,
  exact_parent:MVE_X2_INDEPENDENT_TSA_WITNESS_PARENT,
  origin_classes:freeze(['LOCAL_ONLY','FREETSA_RFC3161_WITNESSED']),
  admitted_artifact_rule:'BYTE_IDENTICAL_WITHIN_CHALLENGE_PAIR',
  external_witness_protocol:'RFC3161',
  external_witness_provider:'FreeTSA',
  external_witness_endpoint:'https://freetsa.org/tsr',
  external_witness_receives_origin_label:false,
  external_witness_receives_raw_artifact:false,
  external_witness_receives_message_imprint_only:true,
  tsa_ca_certificate_sha256_der:'2151b61137ffa86bf664691ba67e7da0b19f98c758e3d228d5d8ebf27e044438',
  tsa_signer_certificate_sha256_der:'8bfb0305bb64e2571ca507552ef3245cb1c2fee8728e0ff8689225081ea13467',
  certificate_fingerprints_preregistered:true,
  maximum_external_timestamp_requests:2,
  same_run_signed_receipt_custody_required:true,
  custody_path:'artifacts/pedagogue-observation-custody/mve-x2-rfc3161-observation.json',
  paid_subscription_required:false,
  service_credentials_required:false,
  public_transparency_log_required:false,
  unavailable_or_speculative_resources_required:false,
  privileged_model_internal_state_required:false,
  exotic_hardware_required:false,
  external_authority_under_experiment_orchestrator_control:false,
  golden_egg_surfaces_added:freeze([])
});

function validateContract(contract){
  const errors=[];
  if(contract?.research_only!==true)errors.push('RESEARCH_ONLY_REQUIRED');
  if(contract?.exact_parent!==MVE_X2_INDEPENDENT_TSA_WITNESS_PARENT)errors.push('EXACT_MVE_X1_PARENT_REQUIRED');
  if(JSON.stringify(contract?.origin_classes)!==JSON.stringify(['LOCAL_ONLY','FREETSA_RFC3161_WITNESSED']))errors.push('BOUNDED_ROUTE_CLASSES_REQUIRED');
  if(contract?.admitted_artifact_rule!=='BYTE_IDENTICAL_WITHIN_CHALLENGE_PAIR')errors.push('BYTE_IDENTICAL_ARTIFACT_RULE_REQUIRED');
  if(contract?.external_witness_protocol!=='RFC3161')errors.push('RFC3161_WITNESS_REQUIRED');
  if(contract?.external_witness_provider!=='FreeTSA')errors.push('PREREGISTERED_EXTERNAL_TSA_REQUIRED');
  if(contract?.external_witness_endpoint!=='https://freetsa.org/tsr')errors.push('PREREGISTERED_TSA_ENDPOINT_REQUIRED');
  if(contract?.external_witness_receives_origin_label!==false)errors.push('ORIGIN_LABEL_DISCLOSURE_FORBIDDEN');
  if(contract?.external_witness_receives_raw_artifact!==false)errors.push('RAW_ARTIFACT_DISCLOSURE_FORBIDDEN');
  if(contract?.external_witness_receives_message_imprint_only!==true)errors.push('MESSAGE_IMPRINT_ONLY_REQUIRED');
  if(contract?.tsa_ca_certificate_sha256_der!=='2151b61137ffa86bf664691ba67e7da0b19f98c758e3d228d5d8ebf27e044438')errors.push('PINNED_TSA_CA_FINGERPRINT_REQUIRED');
  if(contract?.tsa_signer_certificate_sha256_der!=='8bfb0305bb64e2571ca507552ef3245cb1c2fee8728e0ff8689225081ea13467')errors.push('PINNED_TSA_SIGNER_FINGERPRINT_REQUIRED');
  if(contract?.certificate_fingerprints_preregistered!==true)errors.push('CERTIFICATE_PREREGISTRATION_REQUIRED');
  if(contract?.maximum_external_timestamp_requests!==2)errors.push('TWO_REQUEST_CEILING_REQUIRED');
  if(contract?.same_run_signed_receipt_custody_required!==true)errors.push('SAME_RUN_SIGNED_RECEIPT_CUSTODY_REQUIRED');
  if(contract?.custody_path!=='artifacts/pedagogue-observation-custody/mve-x2-rfc3161-observation.json')errors.push('CANONICAL_CUSTODY_PATH_REQUIRED');
  if(contract?.paid_subscription_required!==false)errors.push('PAID_SUBSCRIPTION_FORBIDDEN');
  if(contract?.service_credentials_required!==false)errors.push('SERVICE_CREDENTIALS_FORBIDDEN');
  if(contract?.public_transparency_log_required!==false)errors.push('PUBLIC_LOG_PUBLICATION_FORBIDDEN');
  if(contract?.unavailable_or_speculative_resources_required!==false)errors.push('UNAVAILABLE_RESOURCE_REQUIREMENT_FORBIDDEN');
  if(contract?.privileged_model_internal_state_required!==false)errors.push('PRIVILEGED_MODEL_INTERNAL_STATE_FORBIDDEN');
  if(contract?.exotic_hardware_required!==false)errors.push('EXOTIC_HARDWARE_FORBIDDEN');
  if(contract?.external_authority_under_experiment_orchestrator_control!==false)errors.push('EXTERNAL_AUTHORITY_CONTROL_FORBIDDEN');
  if((contract?.golden_egg_surfaces_added||[]).length!==0)errors.push('GOLDEN_EGG_SURFACES_FORBIDDEN');
  return errors;
}

export function evaluateMveX2Design(contract=MVE_X2_CONTRACT){
  const errors=validateContract(contract);
  const parentReady=X1_PARENT.status==='MVE_X1_PRESENT_RESOURCE_DESIGN_ADMISSIBLE'&&
    X1_PARENT.golden_egg_earned===false&&
    X1_PARENT.empirical_exogenous_channel_acquired===false;
  if(!parentReady)errors.push('MVE_X1_PRESENT_RESOURCE_PARENT_REQUIRED');
  const passed=errors.length===0;
  return freeze({
    schema:MVE_X2_INDEPENDENT_TSA_WITNESS_SCHEMA,
    exact_parent:MVE_X2_INDEPENDENT_TSA_WITNESS_PARENT,
    status:passed?'MVE_X2_INDEPENDENT_TSA_DESIGN_ADMISSIBLE':'INADMISSIBLE',
    errors,
    design_admissible:passed,
    actual_external_tsa_pilot_required:passed,
    exact_external_request_ceiling:2,
    paid_specialized_service_required:false,
    privileged_resource_required:false,
    independent_external_receipt_acquired:false,
    bounded_empirical_exteriority_information_gain_measured:false,
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

export function adjudicateMveX2Pilot(pilot,contract=MVE_X2_CONTRACT){
  const design=evaluateMveX2Design(contract);
  const errors=[...design.errors];
  if(pilot?.status!=='MVE_X2_INDEPENDENT_TSA_PILOT_OBSERVED')errors.push('ACTUAL_EXTERNAL_TSA_PILOT_REQUIRED');
  if(pilot?.pairs!==2||pilot?.external_requests_issued!==2)errors.push('EXACT_TWO_EXTERNAL_REQUESTS_REQUIRED');
  if(pilot?.artifact_pair_byte_identity!==true)errors.push('PAIRED_ARTIFACT_IDENTITY_REQUIRED');
  if(pilot?.actual_externally_signed_rfc3161_receipts_observed!==true)errors.push('SIGNED_RFC3161_RECEIPTS_REQUIRED');
  if(pilot?.pinned_external_tsa_certificate_fingerprints_verified!==true)errors.push('PINNED_EXTERNAL_CERTIFICATES_REQUIRED');
  if(pilot?.same_run_signed_receipt_custody_required!==true)errors.push('SIGNED_RECEIPT_CUSTODY_REQUIREMENT_REQUIRED');
  if(pilot?.signed_receipts_preserved_in_same_run_custody!==true)errors.push('SIGNED_RECEIPTS_MUST_BE_PRESERVED');
  if(pilot?.custody_record_written!==true)errors.push('CUSTODY_RECORD_REQUIRED');
  if(pilot?.custody_record_contains_raw_artifact!==false)errors.push('RAW_ARTIFACT_IN_CUSTODY_FORBIDDEN');
  if(pilot?.custody_record_contains_origin_labels!==false)errors.push('ORIGIN_LABEL_IN_CUSTODY_FORBIDDEN');
  if(pilot?.external_witness_received_origin_labels!==false)errors.push('EXTERNAL_WITNESS_LABEL_BLINDNESS_REQUIRED');
  if(pilot?.external_witness_received_raw_artifact!==false)errors.push('RAW_ARTIFACT_DISCLOSURE_FORBIDDEN');
  if(pilot?.external_witness_received_message_imprint_only!==true)errors.push('MESSAGE_IMPRINT_ONLY_REQUIRED');
  if(pilot?.external_authority_under_experiment_orchestrator_control!==false)errors.push('INDEPENDENT_EXTERNAL_AUTHORITY_REQUIRED');
  if(pilot?.external_authority_distinct_trust_anchor_observed!==true)errors.push('DISTINCT_EXTERNAL_TRUST_ANCHOR_REQUIRED');
  if(pilot?.paid_subscription_used!==false)errors.push('PAID_SUBSCRIPTION_FORBIDDEN');
  if(pilot?.service_credentials_used!==false)errors.push('SERVICE_CREDENTIALS_FORBIDDEN');
  if(pilot?.public_transparency_log_written!==false)errors.push('PUBLIC_TRANSPARENCY_WRITE_FORBIDDEN');
  if(pilot?.specialized_lab_hardware_used!==false)errors.push('SPECIALIZED_LAB_HARDWARE_FORBIDDEN');
  if(pilot?.privileged_model_internal_state_used!==false)errors.push('PRIVILEGED_MODEL_INTERNALS_FORBIDDEN');
  if(pilot?.a_only_origin_accuracy!==0.5)errors.push('A_ONLY_MUST_REMAIN_AT_CHANCE');
  if(!(pilot?.a_plus_x_origin_accuracy>0.5))errors.push('A_PLUS_X_MUST_EXCEED_CHANCE');
  if(!(pilot?.bounded_conditional_origin_information_bits>0))errors.push('POSITIVE_CONDITIONAL_INFORMATION_REQUIRED');
  if(pilot?.independently_governed_external_witness_acquired!==true)errors.push('INDEPENDENT_EXTERNAL_WITNESS_REQUIRED');
  if(pilot?.empirical_exogenous_channel_acquired!==true)errors.push('EMPIRICAL_EXOGENOUS_CHANNEL_REQUIRED');
  if(pilot?.bounded_empirical_exteriority_information_gain_measured!==true)errors.push('BOUNDED_EXTERIORITY_INFORMATION_GAIN_REQUIRED');
  if(pilot?.external_origin_of_admitted_artifact_proven!==false)errors.push('ARTIFACT_ORIGIN_PROOF_OVERCLAIM_FORBIDDEN');
  if(pilot?.golden_egg_earned!==false||pilot?.empirical_credit_to_golden_egg!==0)errors.push('GOLDEN_EGG_CREDIT_FORBIDDEN');
  const passed=errors.length===0;
  return freeze({
    schema:MVE_X2_INDEPENDENT_TSA_WITNESS_SCHEMA,
    exact_parent:MVE_X2_INDEPENDENT_TSA_WITNESS_PARENT,
    status:passed?'MVE_X2_INDEPENDENT_RFC3161_WITNESS_EARNED':'INADMISSIBLE',
    errors,
    rest_symbol:passed?'𝄐':null,
    external_tsa_experiment_executed:passed,
    byte_identical_admitted_artifact_observed:passed,
    externally_signed_rfc3161_receipts_observed:passed,
    pinned_external_trust_anchor_verified:passed,
    signed_external_witness_material_preserved_in_same_run_custody:passed,
    independently_governed_external_witness_acquired:passed,
    empirical_exogenous_channel_acquired:passed,
    bounded_empirical_exteriority_information_gain_measured:passed,
    empirical_exteriority_scope:passed?'BOUNDED_ROUTE_WITNESS_ONLY':null,
    a_only_origin_accuracy:pilot?.a_only_origin_accuracy??null,
    a_plus_x_origin_accuracy:pilot?.a_plus_x_origin_accuracy??null,
    bounded_conditional_origin_information_bits:pilot?.bounded_conditional_origin_information_bits??null,
    paid_specialized_service_required:false,
    service_credentials_required:false,
    specialized_lab_hardware_required:false,
    external_origin_of_admitted_artifact_proven:false,
    universal_externality_claim:false,
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
      external_signed_witness_not_artifact_origin_proof:true,
      distinct_trust_anchor_not_universal_independence_theorem:true,
      zero_paid_service_fee_not_zero_total_infrastructure_cost:true,
      bounded_route_exteriority_not_golden_egg_measurement:true,
      rfc3161_receipt_not_causal_production_proof:true,
      external_witness_acquisition_not_publication_authority:true
    }),
    candidate_theorem:passed?'A_BOUNDED_ROUTE_ORIGIN_EXPERIMENT_CAN_ACQUIRE_POSITIVE_CONDITIONAL_INFORMATION_BEYOND_BYTE_IDENTICAL_ADMITTED_ARTIFACT_A_FROM_AN_EXTERNALLY_SIGNED_RFC3161_WITNESS_X_ISSUED_UNDER_A_DISTINCT_PREREGISTERED_TRUST_ANCHOR_WITHOUT_PAID_SPECIALIZED_LAB_INFRASTRUCTURE_WHILE_NOT_PROVING_THE_CAUSAL_PRODUCTION_ORIGIN_OF_A':'NOT_EARNED',
    child_message:passed?'THE SCHOOL DID NOT BUY A LAB. THE WITNESS SIGNED THE HASH.':'THE OUTSIDE WITNESS HAS NOT SIGNED THE HASH.'
  });
}

export const MVE_X2_INDEPENDENT_TSA_DESIGN_CERTIFICATE=evaluateMveX2Design();
