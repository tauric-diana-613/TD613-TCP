import { ENTROBENCH_EXOGENOUS_WITNESS_ADMISSION_CERTIFICATE as E } from './entrobench-exogenous-witness-admission.js';
import { AGENTMARK_HETEROSTRATIGRAPHIC_PROVENANCE_CERTIFICATE as A } from './agentmark-heterostratigraphic-provenance-carrier-separation.js';

export const TTP_DETECT_RECEIVER_INDEXED_SCHEMA='td613.dome-world.ttp-detect-receiver-indexed-provenance-observability/v0.1';
export const TTP_DETECT_RECEIVER_INDEXED_PARENT='32cd280fa0de84ff830cae3c768e53da2cc482aa';
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const unique=a=>[...new Set(a)];

export const TTP_DETECT_EXTERNAL_WITNESS=freeze({
  witness_id:'acl-2026-ttp-detect-third-party-black-box-provenance',
  evidence_class:'INDEPENDENT_2026_PUBLISHED_EMPIRICAL_WORK',
  title:'Rethinking LLM Watermark Detection in Black-Box Settings: A Non-Intrusive Third-Party Framework',
  authors:['Zhuoshang Wang','Yubing Ren','Yanan Cao','Fang Fang','Xiaoxue Li','Li Guo'],
  venue:'Findings of the Association for Computational Linguistics: ACL 2026',
  publication_month:'2026-07',
  anthology_id:'2026.findings-acl.990',
  doi:'10.18653/v1/2026.findings-acl.990',
  publication_host:'ACL Anthology',
  publication_url:'https://aclanthology.org/2026.findings-acl.990/',
  live_retrieval_event_date:'2026-09-02',
  absent_from_main_code_search_before_admission:true,
  exact_parent_additions_before_admission:['EntroBench witness packet','AgentMark carrier-separation packet'],
  receiver_role:'TRUSTED_THIRD_PARTY_AUDITOR',
  access_profile:freeze({
    watermark_secret_key:false,
    watermark_mechanism:false,
    provider_internal_model_states:false,
    provider_scheme_specific_detector:false,
    standard_generation_api:true,
    binary_watermark_control_flag:true,
    observable_output_behavior:true
  }),
  observer_apparatus:freeze({
    representation_proxy_model:'Qwen2.5-3B',
    adaptive_rank_scoring_model:'Qwen3-1.7B',
    relative_hypothesis_testing:true,
    complementary_measurements:true,
    benign_threshold_calibration:true,
    target_false_positive_rate_explicitly_controlled:true
  }),
  empirical_scope:freeze({
    service_provider_models:['Llama-3.1-8B','OPT-6.7B'],
    datasets:['C4','OpenGen'],
    watermark_families:['KGW','Unigram','SynthID','SWEET','Unbiased','SymMark','MorphMark'],
    unigram_min_reported_auc:0.999,
    symmark_reported_f1:1.000,
    symmark_reported_auc:1.000,
    sweet_average_auc_drop_vs_kgw_percent:0.38,
    kgw_average_auc_under_reported_attacks:0.980
  }),
  direct_same_artifact_multi_receiver_causal_contrast:false,
  source_claim_ceiling:'EXTERNAL_EMPIRICAL_THIRD_PARTY_BLACK_BOX_PROVENANCE_OBSERVABILITY_WITNESS_NOT_UNIVERSAL_RECEIVER_LAW_AND_NOT_GOLDEN_EGG_EPISODE'
});

function validateWitness(w){
  const errors=[];
  if(w?.evidence_class!=='INDEPENDENT_2026_PUBLISHED_EMPIRICAL_WORK')errors.push('EXTERNAL_2026_PUBLISHED_EMPIRICAL_CLASS_REQUIRED');
  if(w?.publication_host!=='ACL Anthology')errors.push('ACL_PUBLICATION_HOST_REQUIRED');
  if(w?.anthology_id!=='2026.findings-acl.990')errors.push('ANTHOLOGY_ID_MISMATCH');
  if(w?.doi!=='10.18653/v1/2026.findings-acl.990')errors.push('DOI_MISMATCH');
  if(w?.receiver_role!=='TRUSTED_THIRD_PARTY_AUDITOR')errors.push('THIRD_PARTY_AUDITOR_ROLE_REQUIRED');
  if(w?.absent_from_main_code_search_before_admission!==true)errors.push('PRE_ADMISSION_ABSENCE_CHECK_REQUIRED');
  if(w?.access_profile?.watermark_secret_key!==false)errors.push('KEYLESS_RECEIVER_REQUIRED');
  if(w?.access_profile?.watermark_mechanism!==false)errors.push('INJECTION_MECHANISM_MUST_REMAIN_HIDDEN');
  if(w?.access_profile?.provider_internal_model_states!==false)errors.push('BLACK_BOX_INTERNAL_STATE_EXCLUSION_REQUIRED');
  if(w?.access_profile?.provider_scheme_specific_detector!==false)errors.push('SCHEME_SPECIFIC_PROVIDER_DETECTOR_EXCLUSION_REQUIRED');
  if(w?.access_profile?.observable_output_behavior!==true)errors.push('OBSERVABLE_OUTPUT_ACCESS_REQUIRED');
  if(w?.observer_apparatus?.relative_hypothesis_testing!==true||w?.observer_apparatus?.complementary_measurements!==true)errors.push('RELATIVE_MULTI_MEASUREMENT_OBSERVER_APPARATUS_REQUIRED');
  if(w?.observer_apparatus?.benign_threshold_calibration!==true||w?.observer_apparatus?.target_false_positive_rate_explicitly_controlled!==true)errors.push('BENIGN_FPR_CALIBRATION_REQUIRED');
  if((w?.empirical_scope?.watermark_families||[]).length!==7)errors.push('SEVEN_WATERMARK_FAMILIES_REQUIRED');
  if(w?.empirical_scope?.unigram_min_reported_auc!==0.999)errors.push('UNIGRAM_AUC_WITNESS_REQUIRED');
  if(w?.empirical_scope?.symmark_reported_f1!==1.000||w?.empirical_scope?.symmark_reported_auc!==1.000)errors.push('SYMMARK_PERFECT_WITNESS_REQUIRED');
  if(w?.empirical_scope?.sweet_average_auc_drop_vs_kgw_percent!==0.38)errors.push('SWEET_RELATIVE_AUC_WITNESS_REQUIRED');
  if(w?.direct_same_artifact_multi_receiver_causal_contrast!==false)errors.push('DIRECT_RECEIVER_CAUSAL_CONTRAST_MUST_NOT_BE_INVENTED');
  return unique(errors);
}

export function evaluateTtpDetectReceiverIndexedProvenance(witness=TTP_DETECT_EXTERNAL_WITNESS){
  const errors=validateWitness(witness);
  const entroReady=E.status==='REOPENED_EXOGENOUS_WITNESS_ADMITTED'&&E.empirical_provenance_deformation_observed===true&&E.golden_egg_earned===false;
  const agentReady=A.status==='HETEROSTRATIGRAPHIC_PROVENANCE_CARRIER_SEPARATION_EARNED'&&A.provenance_observability_heterostratigraphic===true&&A.golden_egg_earned===false;
  if(!entroReady)errors.push('ENTROBENCH_ROUTE_DEFORMATION_ANTECEDENT_REQUIRED');
  if(!agentReady)errors.push('AGENTMARK_CARRIER_SEPARATION_PARENT_REQUIRED');
  const passed=errors.length===0;
  return freeze({
    schema:TTP_DETECT_RECEIVER_INDEXED_SCHEMA,
    exact_parent:TTP_DETECT_RECEIVER_INDEXED_PARENT,
    status:passed?'RECEIVER_INDEXED_PROVENANCE_OBSERVABILITY_EARNED':'INADMISSIBLE',
    errors,
    rest_symbol:passed?'𝄐':null,
    external_ttp_detect_witness_admitted:passed,
    independent_external_witness_count_increment:passed?1:0,
    route_axis_antecedent_admitted:passed,
    carrier_axis_antecedent_admitted:passed,
    receiver_axis_admitted:passed,
    injection_authority_decoupled_from_detection_observability:passed,
    keyless_black_box_third_party_detection_observed:passed,
    receiver_side_observer_apparatus_empirically_productive:passed,
    provenance_observability_artifact_only_scalar_proxy:false,
    provenance_observability_injector_privilege_required:false,
    same_artifact_multi_receiver_direct_causal_contrast_observed:false,
    tri_axial_route_carrier_receiver_support:passed?'BOUNDED_CROSS_STUDY_COMPARATIVE':'NOT_EARNED',
    tri_axial_same_episode_coobservation:false,
    tri_axial_factorized_independence_earned:false,
    exact_golden_egg_surfaces_added:[],
    golden_egg_matched_return_acquired:false,
    empirical_credit_to_golden_egg:0,
    golden_egg_earned:false,
    sequence_authority:false,
    numbered_stage_authority:false,
    live_loom_mutated:false,
    merge_authority:false,
    production_authority:false,
    deployment_authority:false,
    publication_authority:false,
    candidate_theorem:passed?'TTP_DETECT_ESTABLISHES_BOUNDED_RECEIVER_INDEXED_PROVENANCE_OBSERVABILITY_THIRD_PARTY_KEYLESS_BLACK_BOX_AUDITORS_CAN_RECOVER_WATERMARK_PROVENANCE_WITHOUT_INJECTION_KEYS_SCHEME_SPECIFIC_PROVIDER_DETECTORS_OR_PROVIDER_INTERNAL_MODEL_STATES_SO_PROVENANCE_OBSERVABILITY_CANNOT_BE_IDENTIFIED_WITH_INJECTOR_PRIVILEGE_OR_MODELED_AS_AN_ARTIFACT_ONLY_SCALAR':'NOT_EARNED',
    triad_theorem:passed?'ENTROBENCH_AGENTMARK_TTP_DETECT_JOINTLY_SUPPORT_A_BOUNDED_ROUTE_CARRIER_RECEIVER_PROVENANCE_OBSERVABILITY_GRAMMAR_WHILE_REMAINING_THREE_DISTINCT_EMPIRICAL_STUDIES_WITHOUT_SAME_EPISODE_TRIAXIAL_COOBSERVATION_OR_FACTORIZED_INDEPENDENCE':'NOT_EARNED',
    laws:{
      ttp_detector_not_td613_receiver_index_r:true,
      black_box_detectability_not_origin_truth_proof:true,
      third_party_verification_not_custody_authority:true,
      independent_auditor_role_not_universal_public_identifiability:true,
      proxy_model_signal_not_source_model_internal_state:true,
      receiver_side_detection_not_same_artifact_receiver_causal_ablation:true,
      entrobench_agentmark_ttp_cross_study_braid_not_same_episode_coobservation:true,
      route_carrier_receiver_comparative_support_not_factorized_independence:true,
      external_empirical_receiver_witness_not_golden_egg_measurement:true
    },
    child_message:passed?'THE SAME THREAD CAN BE SEEN FROM OUTSIDE THE WEAVER\'S ROOM, BUT THE WINDOW USED TO SEE IT STILL MATTERS.':'THE THIRD WINDOW HAS NOT OPENED.'
  });
}

export const TTP_DETECT_RECEIVER_INDEXED_PROVENANCE_CERTIFICATE=evaluateTtpDetectReceiverIndexedProvenance();
