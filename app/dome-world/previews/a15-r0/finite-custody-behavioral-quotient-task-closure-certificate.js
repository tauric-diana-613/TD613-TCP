import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import {
  FINITE_CUSTODY_BEHAVIORAL_QUOTIENT_TASK_CLOSURE_SCHEMA,
  finiteCustodyBehavioralQuotientTaskClosureCertificate,
} from './finite-custody-behavioral-quotient-task-closure.js';

const AUTHORITY_KEYS=Object.freeze([
  'inverse','encoder','custody_mutation','source_state_transform','new_sensor_measurement',
  'release','production','physical_claim','continuum_claim','cryptographic_key',
  'authentication_credential','retrocausal_channel','retention_policy',
]);

function freeze(value) {
  if(value&&typeof value==='object'&&!Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
const zeroAuthority=()=>freeze(Object.fromEntries(AUTHORITY_KEYS.map(key=>[key,false])));

export function compileFiniteCustodyBehavioralQuotientTaskClosureProjection(receiver) {
  const certificate=finiteCustodyBehavioralQuotientTaskClosureCertificate();
  if(!certificate.passed) throw new Error('cannot project uncertified finite custody behavioral quotient');
  let payload;
  if(receiver===AIA_RECEIVERS.ASH) payload=freeze({
    payload_schema:'td613.dome-world.finite-custody-behavioral-quotient-child-legible/v0.1',
    truths:freeze([
      'THE_ALREADY_EARNED_CUSTODY_QUESTIONS_GROUP_THE_762_CONTEXTS_INTO_36_EXACT_BEHAVIOR_CLASSES_IN_THIS_FIXED_FIXTURE',
      'TWO_CONTEXTS_CAN_ANSWER_EVERY_DECLARED_CUSTODY_QUESTION_THE_SAME_WAY_AND_STILL_HAVE_DIFFERENT_SUPPORT_LABELLED_TRAJECTORIES',
      'THE_COMPACT_BEHAVIOR_SIGNATURE_IS_A_FIXED_TASK_QUOTIENT_NOT_A_UNIVERSAL_MEANING_OR_MEMORY_CODE',
    ]),
    context_count:certificate.domain.contexts,
    behavior_class_count:certificate.partitions.Phi_declared_task_behavior_classes,
    support_trajectory_class_count:certificate.partitions.D_support_labelled_trajectory_classes,
    birth_class_count:certificate.partitions.birth_classes,
    full_support_tables_exposed:false,
    full_context_rows_exposed:false,
    ablation_witness_tables_exposed:false,
  });
  else if(receiver===AIA_RECEIVERS.LOOM) payload=freeze({
    payload_schema:'td613.dome-world.finite-custody-behavioral-quotient-loom-technical/v0.1',
    partitions:certificate.partitions,
    compact_quotient:freeze({
      kappa_classes:certificate.compact_quotient.kappa_classes,
      partition_equivalent:certificate.compact_quotient.partition_equivalent,
    }),
    birth_recovery:certificate.birth_recovery,
    semantic_noncollapse:freeze({
      singleton_Phi_classes_under_D_identity:certificate.semantic_noncollapse.singleton_Phi_classes_under_D_identity,
      minimum_distinct_D_per_Phi:certificate.semantic_noncollapse.minimum_distinct_D_per_Phi,
    }),
    full_support_tables_exposed:false,
    full_context_rows_exposed:false,
    ablation_witness_tables_exposed:false,
  });
  else throw new Error(`undeclared behavioral quotient receiver ${receiver}`);

  return freeze({
    schema:FINITE_CUSTODY_BEHAVIORAL_QUOTIENT_TASK_CLOSURE_SCHEMA,
    receiver,
    payload,
    authority:zeroAuthority(),
    research_only:true,
    runtime_binding:false,
    claim_ceiling:freeze({
      universal_sufficient_statistic:false,
      semantic_closure:false,
      future_task_closure:false,
      minimum_bit_length:false,
      unique_encoding:false,
      shannon_capacity:false,
      entropy:false,
      mutual_information:false,
      natural_language_semantic_reconstruction:false,
      physical_holonomy:false,
      operational_path_groupoid:false,
      category_functor_theorem:false,
      source_state_mutation:false,
      merge:false,
      deploy:false,
      publish:false,
      release:false,
      vercel:false,
    }),
  });
}

export function rejectFiniteCustodyBehavioralQuotientOverreach(candidate) {
  const forbidden=[
    'universal_sufficient_statistic','semantic_closure','future_task_closure','minimum_bit_length',
    'unique_encoding','shannon_capacity','entropy','mutual_information','natural_language_semantic_reconstruction',
    'physical_holonomy','operational_path_groupoid','category_functor_theorem','source_state_mutation',
  ];
  const violation=forbidden.some(key=>candidate?.[key]===true)
    || Object.values(candidate?.authority??{}).some(Boolean)
    || Object.values(candidate?.claim_ceiling??{}).some(Boolean)
    || candidate?.payload?.full_support_tables_exposed===true
    || candidate?.payload?.full_context_rows_exposed===true
    || candidate?.payload?.ablation_witness_tables_exposed===true;
  if(violation) throw new Error('finite custody behavioral quotient claim ceiling exceeded');
  return true;
}
