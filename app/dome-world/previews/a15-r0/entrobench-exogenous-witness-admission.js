import { WESTERN_HORIZON_EMPIRICAL_SHORE_REST_CERTIFICATE as R } from './western-horizon-empirical-shore-rest.js';

export const ENTROBENCH_EXOGENOUS_WITNESS_SCHEMA='td613.dome-world.entrobench-exogenous-provenance-deformation-witness-admission/v0.1';
export const ENTROBENCH_EXOGENOUS_WITNESS_PARENT='22d8596c846322804c11fd94992f719d1f9cd9bd';

const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};

export const ENTROBENCH_EXTERNAL_WITNESS=freeze({
  witness_id:'acl-2026-entrobench-provenance-deformation',
  evidence_class:'INDEPENDENT_2026_PUBLISHED_EMPIRICAL_WORK',
  title:'EntroBench: Evaluating LLM Watermarking Under Multi-Entropy Scenarios and Practical User Operations',
  authors:['Pengyuan Qin','Linnan Tu','Yuhan Ke','Hefei Ling'],
  venue:'Findings of the Association for Computational Linguistics: ACL 2026',
  publication_month:'2026-07',
  anthology_id:'2026.findings-acl.2089',
  doi:'10.18653/v1/2026.findings-acl.2089',
  publication_host:'ACL Anthology',
  publication_url:'https://aclanthology.org/2026.findings-acl.2089/',
  code_repository:'py-qin/EntroBench',
  code_head:'375d40601826e775b4bd7d790a19563b477bc5b6',
  code_tree:'bb65a4bbd01ff7d7735adb314319bb486e858848',
  code_repository_created_at:'2026-04-13T06:12:59Z',
  live_retrieval_event_date:'2026-09-02',
  live_retrieval_channels:['ACL_ANTHOLOGY_WEB','EXTERNAL_GITHUB_PUBLIC_REPOSITORY'],
  absent_from_frozen_td613_parent_search:true,
  empirical_metric:'TPR_AT_1_PERCENT_FPR',
  calibration:{dataset:'C4',target_tpr:0.98},
  observed_route_deformation:[
    {method:'KGW',operation:'SUMMARIZE',surrogate:'GPT-4o',pre_tpr:0.98,post_tpr:0.266},
    {method:'SynthID-Text',operation:'SUMMARIZE',surrogate:'GPT-4o',pre_tpr:0.98,post_tpr:0.078},
    {method:'DiPMark',operation:'SUMMARIZE',surrogate:'GPT-4o',pre_tpr:0.98,post_tpr:0.026},
    {method:'Unigram',operation:'BULLET_POINTS',surrogate:'Llama2-13B-chat',pre_tpr:0.98,post_tpr:0.720}
  ],
  source_claim_ceiling:'EXTERNAL_EMPIRICAL_PROVENANCE_SIGNAL_DEFORMATION_WITNESS_NOT_GOLDEN_EGG_EPISODE'
});

function validWitness(w){
  const errors=[];
  if(w?.evidence_class!=='INDEPENDENT_2026_PUBLISHED_EMPIRICAL_WORK')errors.push('EXTERNAL_2026_PUBLISHED_EMPIRICAL_CLASS_REQUIRED');
  if(w?.publication_host!=='ACL Anthology')errors.push('INDEPENDENT_PUBLICATION_HOST_REQUIRED');
  if(w?.publication_month!=='2026-07')errors.push('EXPECTED_2026_PUBLICATION_REQUIRED');
  if(w?.anthology_id!=='2026.findings-acl.2089')errors.push('ANTHOLOGY_ID_MISMATCH');
  if(w?.doi!=='10.18653/v1/2026.findings-acl.2089')errors.push('DOI_MISMATCH');
  if(w?.code_repository!=='py-qin/EntroBench')errors.push('EXTERNAL_CODE_REPOSITORY_MISMATCH');
  if(w?.code_head!=='375d40601826e775b4bd7d790a19563b477bc5b6')errors.push('EXTERNAL_CODE_HEAD_MISMATCH');
  if(w?.absent_from_frozen_td613_parent_search!==true)errors.push('PARENT_ABSENCE_CHECK_REQUIRED');
  if(!Array.isArray(w?.observed_route_deformation)||w.observed_route_deformation.length<1)errors.push('EMPIRICAL_ROUTE_DEFORMATION_OBSERVATION_REQUIRED');
  for(const x of w?.observed_route_deformation||[]){
    if(!(Number.isFinite(x.pre_tpr)&&Number.isFinite(x.post_tpr)&&x.post_tpr<x.pre_tpr))errors.push('OBSERVED_DEFORMATION_MUST_REDUCE_DETECTABILITY');
  }
  return [...new Set(errors)];
}

export function admitEntroBenchExogenousWitness(witness=ENTROBENCH_EXTERNAL_WITNESS){
  const errors=validWitness(witness);
  const parentReady=R.passed===true&&R.status==='OFFICIAL_RESEARCH_REST'&&R.reopen_condition==='INDEPENDENT_EXOGENOUS_EMPIRICAL_WITNESS_ADMISSION';
  if(!parentReady)errors.push('EMPIRICAL_SHORE_REST_PARENT_REQUIRED');
  const admitted=errors.length===0;
  return freeze({
    schema:ENTROBENCH_EXOGENOUS_WITNESS_SCHEMA,
    exact_parent:ENTROBENCH_EXOGENOUS_WITNESS_PARENT,
    status:admitted?'REOPENED_EXOGENOUS_WITNESS_ADMITTED':'INADMISSIBLE',
    errors,
    parent_rest_status:R.status,
    parent_reopen_condition:R.reopen_condition,
    witness_id:witness?.witness_id||null,
    witness_source_class:witness?.evidence_class||null,
    external_publication_admitted:admitted,
    exogenous_witness_acquired:admitted,
    exogenous_witness_admitted:admitted,
    materially_new_evidentiary_substrate_present:admitted,
    empirical_provenance_deformation_observed:admitted,
    western_research_field_reopened:admitted,
    sequence_authority:false,
    numbered_stage_authority:false,
    externality_reproved_by_internal_ci:false,
    external_origin_claim_from_record_alone:false,
    exact_golden_egg_surfaces_added:[],
    golden_egg_matched_return_acquired:false,
    golden_egg_earned:false,
    empirical_credit_to_golden_egg:0,
    live_loom_mutated:false,
    merge_authority:false,
    production_authority:false,
    deployment_authority:false,
    publication_authority:false,
    laws:{
      live_external_retrieval_event_not_internal_self_attestation:true,
      recorded_external_witness_not_external_origin_proof_from_record_alone:true,
      external_provenance_deformation_witness_not_golden_egg_measurement:true,
      exogenous_witness_admission_not_five_surface_acquisition:true,
      exogenous_witness_admission_reopens_research_without_numbered_stage_authority:true,
      internal_ci_validates_custody_not_external_origin:true
    }
  });
}

export const ENTROBENCH_EXOGENOUS_WITNESS_ADMISSION_CERTIFICATE=admitEntroBenchExogenousWitness();
