import { ENTROBENCH_EXOGENOUS_WITNESS_ADMISSION_CERTIFICATE as E } from './entrobench-exogenous-witness-admission.js';

export const AGENTMARK_HETEROSTRATIGRAPHIC_SCHEMA='td613.dome-world.agentmark-heterostratigraphic-provenance-carrier-separation/v0.1';
export const AGENTMARK_HETEROSTRATIGRAPHIC_PARENT='b7b72dc96b3225a94a92af69e78b08a664f9c65e';
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const unique=a=>[...new Set(a)];

export const AGENTMARK_EXTERNAL_WITNESS=freeze({
  witness_id:'acl-2026-agentmark-dual-stratum-provenance',
  evidence_class:'INDEPENDENT_2026_PUBLISHED_EMPIRICAL_WORK',
  title:'AgentMark: Utility-Preserving Behavioral Watermarking for Agents',
  authors:['Kaibo Huang','Jin Tan','Yukun Wei','Wanling Li','Zipei Zhang','Hui Tian','Zhongliang Yang','Linna Zhou'],
  venue:'Proceedings of the 64th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers)',
  publication_month:'2026-07',
  anthology_id:'2026.acl-long.573',
  doi:'10.18653/v1/2026.acl-long.573',
  publication_host:'ACL Anthology',
  publication_url:'https://aclanthology.org/2026.acl-long.573/',
  code_repository:'Tooooa/AgentMark',
  code_head:'070daa1cb57aa3c053d89ff5b3a788f6585824ea',
  code_tree:'aa78b3daa59feea7c31140877ec7e877f9cc159b',
  live_retrieval_event_date:'2026-09-02',
  absent_from_frozen_td613_parent_search:true,
  carriers:Object.freeze([
    {name:'planning_behavior',layer:'process-planning',signal:'multi-bit behavioral watermark'},
    {name:'action_content',layer:'execution-output',signal:'SynthID-Text content watermark'}
  ]),
  utility_capacity:Object.freeze({
    alfworld_id:{baseline_success_percent:89.5,agentmark_success_percent:89.3,rg_success_percent:78.8,bits_per_step:1.19,bits_per_task:25.5},
    toolbench:{baseline_success_percent:59.9,agentmark_success_percent:59.7,rg_success_percent:58.5,bits_per_step:0.49,bits_per_task:4.93}
  }),
  semantic_rewrite:Object.freeze({
    benchmark:'ALFWorld-OOD',tasks:134,steps:2326,
    behavior_match_percent:49.45,behavior_match_sd:16.90,
    avg_kl:3.227,avg_kl_sd:1.802,
    bit_recovery_percent:16.84,bit_recovery_sd:19.56
  }),
  false_positive:Object.freeze({
    k8_unwatermarked_percent:0.40,
    k8_wrong_key_percent:0.50,
    k14plus_unwatermarked_percent:0.00,
    k14plus_wrong_key_percent:0.00
  }),
  dual_channel:Object.freeze({
    benchmark:'ToolBench',
    both_enabled:true,
    behavior_decoding_percent:100.0,
    synthid_content_detection_percent:96.6,
    same_study:true
  }),
  source_claim_ceiling:'EXTERNAL_EMPIRICAL_DUAL_CARRIER_PROVENANCE_WITNESS_NOT_TD613_COORDINATE_IDENTITY_AND_NOT_GOLDEN_EGG_EPISODE'
});

function validateWitness(w){
  const errors=[];
  if(w?.evidence_class!=='INDEPENDENT_2026_PUBLISHED_EMPIRICAL_WORK')errors.push('EXTERNAL_2026_PUBLISHED_EMPIRICAL_CLASS_REQUIRED');
  if(w?.publication_host!=='ACL Anthology')errors.push('ACL_PUBLICATION_HOST_REQUIRED');
  if(w?.anthology_id!=='2026.acl-long.573')errors.push('ANTHOLOGY_ID_MISMATCH');
  if(w?.doi!=='10.18653/v1/2026.acl-long.573')errors.push('DOI_MISMATCH');
  if(w?.code_repository!=='Tooooa/AgentMark')errors.push('EXTERNAL_CODE_REPOSITORY_MISMATCH');
  if(w?.code_head!=='070daa1cb57aa3c053d89ff5b3a788f6585824ea')errors.push('EXTERNAL_CODE_HEAD_MISMATCH');
  if(w?.absent_from_frozen_td613_parent_search!==true)errors.push('PARENT_ABSENCE_CHECK_REQUIRED');
  const names=(w?.carriers||[]).map(x=>x?.name);
  if(names.length!==2||new Set(names).size!==2||!names.includes('planning_behavior')||!names.includes('action_content'))errors.push('TWO_DISTINCT_PROVENANCE_CARRIERS_REQUIRED');
  if(w?.dual_channel?.same_study!==true||w?.dual_channel?.both_enabled!==true)errors.push('SAME_STUDY_DUAL_CHANNEL_WITNESS_REQUIRED');
  if(w?.dual_channel?.behavior_decoding_percent!==100.0)errors.push('EXPECTED_BEHAVIORAL_DECODING_WITNESS_REQUIRED');
  if(w?.dual_channel?.synthid_content_detection_percent!==96.6)errors.push('EXPECTED_CONTENT_DETECTION_WITNESS_REQUIRED');
  if(w?.semantic_rewrite?.behavior_match_percent!==49.45||w?.semantic_rewrite?.bit_recovery_percent!==16.84)errors.push('SEMANTIC_REWRITE_DEFORMATION_WITNESS_REQUIRED');
  if(w?.utility_capacity?.toolbench?.agentmark_success_percent!==59.7||w?.utility_capacity?.toolbench?.baseline_success_percent!==59.9)errors.push('TOOLBENCH_UTILITY_WITNESS_REQUIRED');
  if(w?.utility_capacity?.toolbench?.bits_per_step!==0.49||w?.utility_capacity?.toolbench?.bits_per_task!==4.93)errors.push('TOOLBENCH_CAPACITY_WITNESS_REQUIRED');
  return unique(errors);
}

export function evaluateAgentMarkHeterostratigraphicProvenance(witness=AGENTMARK_EXTERNAL_WITNESS){
  const errors=validateWitness(witness);
  const parentReady=E.status==='REOPENED_EXOGENOUS_WITNESS_ADMITTED'&&E.exogenous_witness_acquired===true&&E.western_research_field_reopened===true&&E.golden_egg_earned===false;
  if(!parentReady)errors.push('ENTROBENCH_REOPENED_PARENT_REQUIRED');
  const passed=errors.length===0;
  return freeze({
    schema:AGENTMARK_HETEROSTRATIGRAPHIC_SCHEMA,
    exact_parent:AGENTMARK_HETEROSTRATIGRAPHIC_PARENT,
    status:passed?'HETEROSTRATIGRAPHIC_PROVENANCE_CARRIER_SEPARATION_EARNED':'INADMISSIBLE',
    errors,
    rest_symbol:passed?'𝄐':null,
    external_agentmark_witness_admitted:passed,
    independent_external_witness_count_increment:passed?1:0,
    planning_behavior_carrier_admitted:passed,
    action_content_carrier_admitted:passed,
    same_study_dual_channel_composability_observed:passed,
    provenance_observability_heterostratigraphic:passed,
    provenance_observability_route_sensitive:passed,
    output_content_observability_scalar_proxy_for_process_provenance:false,
    process_provenance_universally_invariant:false,
    cross_study_entrobench_agentmark_same_episode:false,
    cross_study_comparison_credit:'CONTEXTUAL_COMPARATIVE_ONLY',
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
    candidate_theorem:passed?'AGENTMARK_DUAL_CHANNEL_EMPIRICISM_ESTABLISHES_BOUNDED_HETEROSTRATIGRAPHIC_PROVENANCE_CARRIER_SEPARATION_PLANNING_BEHAVIOR_AND_ACTION_CONTENT_CAN_CARRY_SIMULTANEOUS_NON_IDENTICAL_PROVENANCE_SIGNALS_WITH_DISTINCT_FAILURE_ENVELOPES_SO_OUTPUT_CONTENT_OBSERVABILITY_CANNOT_SERVE_AS_A_SCALAR_PROXY_FOR_PROCESS_PROVENANCE_OBSERVABILITY':'NOT_EARNED',
    laws:{
      planning_behavior_provenance_not_td613_process_identifiability_p:true,
      action_content_provenance_not_td613_trace_observability_v:true,
      dual_channel_composability_not_universal_stratum_independence:true,
      semantic_rewrite_deformation_not_universal_route_law:true,
      partial_log_recovery_not_complete_trajectory_reconstruction:true,
      cross_study_comparison_not_same_episode_coobservation:true,
      external_empirical_witness_not_golden_egg_measurement:true,
      heterostratigraphic_provenance_carrier_separation_not_golden_egg_earned:true
    },
    child_message:passed?'THE MARK ON WHAT THE AGENT DID AND THE MARK ON HOW THE AGENT PLANNED ARE DIFFERENT THREADS.':'THE THREADS HAVE NOT BEEN SEPARATED.'
  });
}

export const AGENTMARK_HETEROSTRATIGRAPHIC_PROVENANCE_CERTIFICATE=evaluateAgentMarkHeterostratigraphicProvenance();
