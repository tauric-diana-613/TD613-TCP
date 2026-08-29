import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import {
  FINITE_CUSTODY_BEHAVIORAL_QUOTIENT_TASK_CLOSURE_SCHEMA,
  FINITE_CUSTODY_BEHAVIORAL_QUOTIENT_TASK_CLOSURE_PARENT_RECEIPT,
  finiteCustodyBehavioralQuotientTaskClosureCertificate as initialBehavioralQuotientCertificate,
} from './finite-custody-behavioral-quotient-task-closure.js';
import {
  trajectoryCustodyFunctionalClosureCanonicalCertificate,
} from './trajectory-custody-functional-closure-certificate.js';

const AUTHORITY_KEYS=Object.freeze([
  'inverse','encoder','custody_mutation','source_state_transform','new_sensor_measurement',
  'release','production','physical_claim','continuum_claim','cryptographic_key',
  'authentication_credential','retrocausal_channel','retention_policy',
]);

let cachedCanonicalCertificate=null;

function freeze(value) {
  if(value&&typeof value==='object'&&!Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
const zeroAuthority=()=>freeze(Object.fromEntries(AUTHORITY_KEYS.map(key=>[key,false])));

export function finiteCustodyBehavioralQuotientTaskClosureCanonicalCertificate() {
  if(cachedCanonicalCertificate) return cachedCanonicalCertificate;
  const initial=initialBehavioralQuotientCertificate();
  const canonicalParent=trajectoryCustodyFunctionalClosureCanonicalCertificate();
  const exact=initial.exact===true;
  const passed=canonicalParent.passed===true
    && FINITE_CUSTODY_BEHAVIORAL_QUOTIENT_TASK_CLOSURE_PARENT_RECEIPT==='d94c1b6cd47dbb611ae4a6a3297522ee99bb29ef'
    && initial.parent_receipt===FINITE_CUSTODY_BEHAVIORAL_QUOTIENT_TASK_CLOSURE_PARENT_RECEIPT
    && exact;

  cachedCanonicalCertificate=freeze({
    schema:FINITE_CUSTODY_BEHAVIORAL_QUOTIENT_TASK_CLOSURE_SCHEMA,
    parent_receipt:FINITE_CUSTODY_BEHAVIORAL_QUOTIENT_TASK_CLOSURE_PARENT_RECEIPT,
    initial_implementation_passed:initial.passed,
    parent_binding_repair:freeze({
      kind:'CANONICAL_PARENT_ENTRY_POINT_BINDING_ONLY',
      red_candidate_head:'d35796c3c9c923d4f8713f0522b74ac1eb56fe76',
      red_witness_run:2376,
      red_witness_run_id:33272893426,
      failed_assertion:'INITIAL_CHILD_CERTIFICATE_PASSED',
      initial_parent_entry_point:'trajectoryCustodyFunctionalClosureCertificate',
      corrected_parent_entry_point:'trajectoryCustodyFunctionalClosureCanonicalCertificate',
      parent_science_mutated:false,
      child_exact_predicate_changed:false,
      finite_counts_changed:false,
      compact_quotient_changed:false,
      preregistration_rewritten:false,
      initial_red_specimen_preserved:true,
    }),
    domain:initial.domain,
    partitions:initial.partitions,
    compact_quotient:initial.compact_quotient,
    birth_recovery:initial.birth_recovery,
    declared_task_replay:initial.declared_task_replay,
    semantic_noncollapse:initial.semantic_noncollapse,
    coordinate_ablations:initial.coordinate_ablations,
    execution_ledger:initial.execution_ledger,
    exact,
    passed,
    classifications:freeze(passed?[
      'IN_THE_FIXED_S3_AIA_FIXTURE_THE_COMPLETE_ALREADY_EARNED_CUSTODY_TASK_FAMILY_INDUCES_EXACTLY_THIRTY_SIX_BEHAVIORAL_EQUIVALENCE_CLASSES_OVER_THE_SEVEN_HUNDRED_SIXTY_TWO_SCHEDULE_BUNDLE_CONTEXTS',
      'THE_PIECEWISE_COMPACT_SIGNATURE_KAPPA_INF_OR_1_M0_OR_2_M1_M0_OR_3_N2_M1_M0_REALIZES_EXACTLY_THE_SAME_FINITE_PARTITION_AS_THE_INDEPENDENTLY_RECONSTRUCTED_DECLARED_TASK_BEHAVIOR_SIGNATURE',
      'THE_INHERITED_AUTHORITY_BIRTH_INDEX_IS_FUNCTIONALLY_RECOVERABLE_ON_ALL_SEVEN_HUNDRED_SIXTY_TWO_CONTEXTS_AS_THE_FIRST_REGISTERED_STAGE_WHOSE_TARGET_OCCUPIED_SUPPORT_MAXIMUM_IS_ONE_ELSE_INF',
      'EVERY_DECLARED_TASK_BEHAVIOR_CLASS_CONTAINS_MULTIPLE_DISTINCT_SUPPORT_LABELLED_AMBIENT_TRAJECTORIES_SO_EXACT_DECLARED_TASK_CLOSURE_DOES_NOT_IMPLY_SUPPORT_SEMANTIC_IDENTITY',
      'WITHIN_THE_DECLARED_KAPPA_FEATURE_FAMILY_EVERY_RETAINED_FINITE_BIRTH_COORDINATE_HAS_AN_EXPLICIT_DROP_COLLISION_BETWEEN_DISTINCT_DECLARED_TASK_BEHAVIORS',
    ]:[]),
    scars:freeze([
      ...initial.scars,
      'INITIAL_CHILD_PARENT_BINDING != CANONICAL_PARENT_BINDING',
      'RED_PARENT_ENTRY_POINT_FAILURE != THEOREM_FAILURE',
      'CANONICAL_PARENT_BINDING_REPAIR != THEOREM_WEAKENING',
      'CANONICAL_PARENT_BINDING_REPAIR != PARENT_SCIENCE_MUTATION',
      'INITIAL_RED_SPECIMEN != CANONICAL_CHILD_CERTIFICATE',
      'PARENT_CERTIFICATE_INTERFACE != SCIENTIFIC_PARENT_COMMIT_IDENTITY',
    ]),
    authority:zeroAuthority(),
    research_only:true,
    runtime_binding:false,
  });
  return cachedCanonicalCertificate;
}

export function compileFiniteCustodyBehavioralQuotientTaskClosureProjection(receiver) {
  const certificate=finiteCustodyBehavioralQuotientTaskClosureCanonicalCertificate();
  if(!certificate.passed) throw new Error('cannot project uncertified canonical finite custody behavioral quotient');
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
