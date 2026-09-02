import fs from 'node:fs';
import crypto from 'node:crypto';
import {
  A16_OPERATOR_WITNESS_EXTERIORITY_CERTIFICATE as PARENT
} from './a16-operator-witness-exteriority.js';

export const A16_OPERATOR_WITNESS_SOCKET_SCHEMA='td613.dome-world.a16-operator-witness-socket/v0.1';
export const A16_OPERATOR_WITNESS_SOCKET_PARENT='a3bcd4f30780bcefee77a906bc854d8d40876662';

const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const digest=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

export const REQUIRED_OPERATOR_REVIEW_FIELDS=freeze([
  'production_url_and_observation_date',
  'desktop_and_mobile_device_browser_posture',
  'profile_and_journey_entered',
  'principal_workspace_material_distinction',
  'flowcore_field_and_play_visibility',
  'child_legible_relation_before_technical_terminology',
  'hold_missingness_and_recovery_legibility',
  'profile_and_aia_route_meaningful_difference',
  'visual_control_or_authority_defects',
  'rest_return_and_exit_without_penalty'
]);

export const A16_OPERATOR_WITNESS_SOCKET_TEMPLATE=freeze({
  schema:'td613.dome-world.human-operator-production-observation-record/v0.1',
  evidence_class:'HUMAN_OPERATOR_PRODUCTION_OBSERVATION_RECORD',
  observation_id:null,
  production_url_and_observation_date:null,
  desktop_and_mobile_device_browser_posture:null,
  profile_and_journey_entered:null,
  principal_workspace_material_distinction:null,
  flowcore_field_and_play_visibility:null,
  child_legible_relation_before_technical_terminology:null,
  hold_missingness_and_recovery_legibility:null,
  profile_and_aia_route_meaningful_difference:null,
  visual_control_or_authority_defects:null,
  rest_return_and_exit_without_penalty:null,
  operator_finding:null,
  bounded_a15_visual_repair_erratum_required:null,
  provenance_claim:{
    claimed_source:'HUMAN_OPERATOR_PRODUCTION_OBSERVATION',
    observer_identity_disclosed_to_repository:null,
    observation_recorded_at:null
  },
  claim_ceiling:'OPERATOR_REVIEW_FINDING_NOT_LEARNER_STUDY_NOT_UNIVERSAL_USABILITY_NOT_GOLDEN_EGG_MEASUREMENT'
});

function handoffContractPresent(){
  const text=fs.readFileSync('app/dome-world/docs/ash/closure/ASH_KEEP_A16_A19_ENTRY_HANDOFF_V0_1.md','utf8');
  return [
    'operator review recorded = required',
    'A16 start before review = forbidden',
    'review finding ≠ learner study',
    'review finding ≠ universal usability claim'
  ].every(x=>text.includes(x));
}

function fieldPresent(v){
  if(v===null||v===undefined)return false;
  if(typeof v==='string')return v.trim().length>0;
  if(Array.isArray(v))return v.length>0;
  if(typeof v==='object')return Object.keys(v).length>0;
  return true;
}

export function inspectA16OperatorWitnessRecord(record=A16_OPERATOR_WITNESS_SOCKET_TEMPLATE){
  const schemaValid=record?.schema==='td613.dome-world.human-operator-production-observation-record/v0.1';
  const evidenceClassValid=record?.evidence_class==='HUMAN_OPERATOR_PRODUCTION_OBSERVATION_RECORD';
  const missingFields=REQUIRED_OPERATOR_REVIEW_FIELDS.filter(k=>!fieldPresent(record?.[k]));
  const observationIdPresent=fieldPresent(record?.observation_id);
  const findingPresent=fieldPresent(record?.operator_finding);
  const provenanceClaimPresent=record?.provenance_claim?.claimed_source==='HUMAN_OPERATOR_PRODUCTION_OBSERVATION';
  const recordShapeComplete=Boolean(schemaValid&&evidenceClassValid&&missingFields.length===0&&observationIdPresent&&findingPresent&&provenanceClaimPresent);
  const canonicalRecordDigest=digest(record);

  return freeze({
    schema:A16_OPERATOR_WITNESS_SOCKET_SCHEMA,
    status:recordShapeComplete?'CANDIDATE_OPERATOR_WITNESS_SHAPE_COMPLETE':'AWAITING_HUMAN_OPERATOR_OBSERVATION',
    schema_valid:schemaValid,
    evidence_class_valid:evidenceClassValid,
    required_field_count:REQUIRED_OPERATOR_REVIEW_FIELDS.length,
    missing_required_fields:missingFields,
    record_shape_complete:recordShapeComplete,
    provenance_claim_present:provenanceClaimPresent,
    record_digest:canonicalRecordDigest,
    machine_verifiable_dimensions:freeze(['SCHEMA','FIELD_COMPLETENESS','INTERNAL_CONSISTENCY','DIGEST','CLAIM_CEILING']),
    human_origin_verifiable_from_record_alone:false,
    operator_review_admitted:false,
    a16_gate_open:false,
    a16_implementation_authority:false,
    laws:freeze({
      complete_record_shape_not_verified_human_origin:true,
      provenance_claim_not_independent_origin_witness:true,
      digest_integrity_not_human_observation:true,
      schema_completeness_not_operator_acceptance:true
    })
  });
}

export function constructOperatorWitnessOriginTwinWorld(){
  const admittedRecord={
    schema:'td613.dome-world.human-operator-production-observation-record/v0.1',
    evidence_class:'HUMAN_OPERATOR_PRODUCTION_OBSERVATION_RECORD',
    observation_id:'synthetic-origin-identifiability-control',
    production_url_and_observation_date:{url:'https://production.example.invalid',date:'2099-01-01'},
    desktop_and_mobile_device_browser_posture:['desktop chromium','mobile webkit'],
    profile_and_journey_entered:{profile:'CONTROL_PROFILE',journey:'CONTROL_JOURNEY'},
    principal_workspace_material_distinction:{home:true,map:true,work:true,choir:true,capsule:true},
    flowcore_field_and_play_visibility:{visible:true,finite:true},
    child_legible_relation_before_technical_terminology:true,
    hold_missingness_and_recovery_legibility:true,
    profile_and_aia_route_meaningful_difference:true,
    visual_control_or_authority_defects:[],
    rest_return_and_exit_without_penalty:true,
    operator_finding:'CONTROL_RECORD_ONLY_DO_NOT_TREAT_AS_OBSERVATION',
    bounded_a15_visual_repair_erratum_required:false,
    provenance_claim:{claimed_source:'HUMAN_OPERATOR_PRODUCTION_OBSERVATION',observer_identity_disclosed_to_repository:false,observation_recorded_at:'2099-01-01T00:00:00Z'},
    claim_ceiling:'OPERATOR_REVIEW_FINDING_NOT_LEARNER_STUDY_NOT_UNIVERSAL_USABILITY_NOT_GOLDEN_EGG_MEASUREMENT'
  };
  const bytes=JSON.stringify(admittedRecord);
  const worldHuman={hidden_origin:'ACTUAL_HUMAN_PRODUCTION_OBSERVATION',admitted_bytes:bytes};
  const worldFabricated={hidden_origin:'INTERNAL_FABRICATION',admitted_bytes:bytes};
  const observationallyIdentical=worldHuman.admitted_bytes===worldFabricated.admitted_bytes;
  return freeze({
    observationally_identical:observationallyIdentical,
    admitted_record_digest:digest(admittedRecord),
    human_world_record_inspection:inspectA16OperatorWitnessRecord(admittedRecord),
    fabricated_world_record_inspection:inspectA16OperatorWitnessRecord(admittedRecord),
    hidden_origins_differ:worldHuman.hidden_origin!==worldFabricated.hidden_origin,
    record_only_verifier_can_discriminate_origin:false
  });
}

export function runA16OperatorWitnessSocket(){
  const parentReady=PARENT.status==='A16_OPERATOR_WITNESS_EXTERIORITY_EARNED'&&PARENT.a16_operator_witness_exteriority_earned===true;
  const contractReady=handoffContractPresent();
  const emptyInspection=inspectA16OperatorWitnessRecord();
  const twins=constructOperatorWitnessOriginTwinWorld();
  const earned=Boolean(
    parentReady&&contractReady&&
    emptyInspection.status==='AWAITING_HUMAN_OPERATOR_OBSERVATION'&&
    twins.observationally_identical===true&&twins.hidden_origins_differ===true&&
    twins.record_only_verifier_can_discriminate_origin===false&&
    twins.human_world_record_inspection.record_shape_complete===true&&
    twins.fabricated_world_record_inspection.record_shape_complete===true&&
    twins.human_world_record_inspection.operator_review_admitted===false
  );

  const subject={
    exact_parent:A16_OPERATOR_WITNESS_SOCKET_PARENT,
    parent_exteriority_digest:PARENT.exteriority_digest,
    required_fields:REQUIRED_OPERATOR_REVIEW_FIELDS,
    handoff_contract_present:contractReady,
    twin_record_digest:twins.admitted_record_digest
  };

  return freeze({
    schema:A16_OPERATOR_WITNESS_SOCKET_SCHEMA,
    exact_parent:A16_OPERATOR_WITNESS_SOCKET_PARENT,
    status:earned?'A16_OPERATOR_WITNESS_SOCKET_SEPARATION_EARNED':'INADMISSIBLE',
    errors:earned?[]:['A16_OPERATOR_WITNESS_SOCKET_SEPARATION_NOT_ESTABLISHED'],
    rest_symbol:earned?'𝄐':null,
    socket_digest:digest(subject),
    source_class:'PRE_A16_HUMAN_WITNESS_SOCKET_AND_ORIGIN_IDENTIFIABILITY_ASSAY',
    required_operator_review_fields:REQUIRED_OPERATOR_REVIEW_FIELDS,
    empty_socket_state:emptyInspection.status,
    machine_can_preregister_witness_shape:earned,
    machine_can_validate_record_shape:earned,
    machine_can_validate_record_digest:earned,
    machine_can_certify_human_origin_from_record_alone:false,
    byte_identical_human_and_fabricated_records_constructible:twins.observationally_identical,
    hidden_origin_nonidentifiability_from_record_alone:earned,
    human_observation_still_required:true,
    operator_review_recorded:false,
    operator_review_admitted:false,
    a16_gate_open:false,
    a16_readmission_earned:false,
    a16_implementation_authority:false,
    a16_product_mutation_authority:false,
    western_horizon_successor_stage_claimed:false,
    golden_egg_earned:false,
    empirical_credit_to_golden_egg:0,
    merge_authority:false,
    production_authority:false,
    deployment_authority:false,
    publication_authority:false,
    laws:freeze({
      witness_socket_not_witness:true,
      complete_record_not_verified_human_origin:true,
      provenance_claim_not_independent_origin_witness:true,
      byte_identical_record_not_origin_discriminator:true,
      internal_validator_not_human_observer:true,
      socket_readiness_not_a16_admission:true,
      structural_exteriority_not_western_horizon_successor:true
    }),
    theorem:'A16_CAN_PREREGISTER_AND_MACHINE_VALIDATE_THE_SCHEMA_COMPLETENESS_DIGEST_AND_CLAIM_CEILING_OF_A_HUMAN_OPERATOR_PRODUCTION_OBSERVATION_RECORD_WITHOUT_GAINING_POWER_TO_CERTIFY_THE_RECORDS_HUMAN_ORIGIN_FROM_ITS_BYTES_ALONE; BYTE_IDENTICAL_HUMAN_ORIGIN_AND_INTERNALLY_FABRICATED_RECORDS_REMAIN_OBSERVATIONALLY_INDISTINGUISHABLE_TO_THE_RECORD_ONLY_VERIFIER_SO_THE_WITNESS_SOCKET_CAN_BE_BUILT_INSIDE_THE_REPOSITORY_WHILE_THE_WITNESS_ITSELF_REMAINS_EXOGENOUS_AND_A16_ADMISSION_REMAINS_HELD',
    child_message:'WE CAN BUILD THE EMPTY CHAIR, CHECK ITS SHAPE, AND SEAL ITS NAMEPLATE. WE CANNOT PRETEND SOMEONE SAT IN IT.'
  });
}

export const A16_OPERATOR_WITNESS_SOCKET_CERTIFICATE=runA16OperatorWitnessSocket();
