import assert from 'node:assert/strict';
import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import {
  FINITE_CUSTODY_BEHAVIORAL_QUOTIENT_TASK_CLOSURE_PARENT_RECEIPT,
  finiteCustodyBehavioralQuotientTaskClosureCertificate,
} from '../app/dome-world/previews/a15-r0/finite-custody-behavioral-quotient-task-closure.js';
import {
  compileFiniteCustodyBehavioralQuotientTaskClosureProjection,
  rejectFiniteCustodyBehavioralQuotientOverreach,
} from '../app/dome-world/previews/a15-r0/finite-custody-behavioral-quotient-task-closure-certificate.js';

const certificate=finiteCustodyBehavioralQuotientTaskClosureCertificate();
assert.equal(FINITE_CUSTODY_BEHAVIORAL_QUOTIENT_TASK_CLOSURE_PARENT_RECEIPT,'d94c1b6cd47dbb611ae4a6a3297522ee99bb29ef');
assert.equal(certificate.parent_receipt,FINITE_CUSTODY_BEHAVIORAL_QUOTIENT_TASK_CLOSURE_PARENT_RECEIPT);
assert.equal(certificate.exact,true);
assert.equal(certificate.passed,true);
assert.equal(certificate.research_only,true);
assert.equal(certificate.runtime_binding,false);
assert.equal(Object.values(certificate.authority).some(Boolean),false);

assert.deepEqual(certificate.domain,{
  states:125,schedules:6,antecedents:750,bundles_per_schedule:127,contexts:762,registered_stages:4,
});

assert.equal(certificate.partitions.D_support_labelled_trajectory_classes,762);
assert.equal(certificate.partitions.C_schedule_conditioned_cardinality_classes,154);
assert.equal(certificate.partitions.Phi_declared_task_behavior_classes,36);
assert.equal(certificate.partitions.birth_classes,4);
assert.deepEqual(certificate.partitions.D_by_birth,{'1':26,'2':80,'3':208,INF:448});
assert.deepEqual(certificate.partitions.C_by_birth,{'1':18,'2':32,'3':40,INF:64});
assert.deepEqual(certificate.partitions.Phi_by_birth,{'1':5,'2':10,'3':20,INF:1});
assert.deepEqual(certificate.partitions.C_to_Phi_merge_spectrum,{'2':28,'4':4,'6':3,'64':1});

assert.equal(certificate.compact_quotient.kappa_classes,36);
assert.equal(certificate.compact_quotient.kappa_to_Phi_ambiguity_classes,0);
assert.equal(certificate.compact_quotient.Phi_to_kappa_ambiguity_classes,0);
assert.equal(certificate.compact_quotient.partition_equivalent,true);
assert.deepEqual(certificate.compact_quotient.definition,{
  INF:['INF'],q1:[1,'m0'],q2:[2,'m1','m0'],q3:[3,'n2','m1','m0'],
});

assert.equal(certificate.birth_recovery.matches,762);
assert.equal(certificate.birth_recovery.mismatches,0);
assert.deepEqual(certificate.birth_recovery.distribution,{'1':26,'2':80,'3':208,INF:448});

assert.deepEqual(certificate.declared_task_replay,{r858:1180,r860:784,r862:208,r864:208,total:2380});

assert.equal(certificate.semantic_noncollapse.singleton_Phi_classes_under_D_identity,0);
assert.equal(certificate.semantic_noncollapse.all_Phi_classes_merge_multiple_D,true);
assert.equal(certificate.semantic_noncollapse.minimum_distinct_D_per_Phi>=2,true);
assert.equal(certificate.semantic_noncollapse.named_collision.same_Phi,true);
assert.equal(certificate.semantic_noncollapse.named_collision.same_D,false);

const expectedAblations={
  q1_drop_m0:{ambiguous_keys:1,contexts:26,Phi_classes:5,maximum_Phi_multiplicity:5},
  q2_drop_m1:{ambiguous_keys:1,contexts:24,Phi_classes:2,maximum_Phi_multiplicity:2},
  q2_drop_m0:{ambiguous_keys:3,contexts:80,Phi_classes:10,maximum_Phi_multiplicity:6},
  q3_drop_n2:{ambiguous_keys:4,contexts:32,Phi_classes:8,maximum_Phi_multiplicity:2},
  q3_drop_m1:{ambiguous_keys:4,contexts:32,Phi_classes:8,maximum_Phi_multiplicity:2},
  q3_drop_m0:{ambiguous_keys:5,contexts:200,Phi_classes:19,maximum_Phi_multiplicity:6},
};
for(const [name,expected] of Object.entries(expectedAblations)) {
  const actual=certificate.coordinate_ablations[name];
  for(const [key,value] of Object.entries(expected)) assert.equal(actual[key],value,`${name}.${key}`);
  assert.notEqual(actual.witness.left.phi,actual.witness.right.phi,`${name} witness must split Φ`);
  assert.notDeepEqual(actual.witness.left.kappa,undefined);
  assert.notDeepEqual(actual.witness.right.kappa,undefined);
}

assert.deepEqual(certificate.execution_ledger,{
  stage_support_profile_reconstructions:3048,
  predecessor_task_replay_rows:2380,
  birth_recovery_checks:762,
  kappa_signature_constructions:762,
  Phi_signature_constructions:762,
  D_fingerprint_constructions:762,
  C_class_to_Phi_mapping_checks:154,
  Phi_semantic_noncollapse_class_checks:36,
  coordinate_ablation_context_checks:810,
  synthetic_information_quantity_claimed:false,
});

for(const receiver of [AIA_RECEIVERS.ASH,AIA_RECEIVERS.LOOM]) {
  const projection=compileFiniteCustodyBehavioralQuotientTaskClosureProjection(receiver);
  assert.equal(projection.receiver,receiver);
  assert.equal(projection.research_only,true);
  assert.equal(projection.runtime_binding,false);
  assert.equal(Object.values(projection.authority).some(Boolean),false);
  assert.equal(Object.values(projection.claim_ceiling).some(Boolean),false);
  assert.equal(projection.payload.full_support_tables_exposed,false);
  assert.equal(projection.payload.full_context_rows_exposed,false);
  assert.equal(projection.payload.ablation_witness_tables_exposed,false);
  assert.equal(rejectFiniteCustodyBehavioralQuotientOverreach(projection),true);
}

for(const key of [
  'universal_sufficient_statistic','semantic_closure','future_task_closure','minimum_bit_length',
  'unique_encoding','shannon_capacity','entropy','mutual_information','natural_language_semantic_reconstruction',
  'physical_holonomy','operational_path_groupoid','category_functor_theorem','source_state_mutation',
]) assert.throws(()=>rejectFiniteCustodyBehavioralQuotientOverreach({[key]:true}),/claim ceiling exceeded/);

assert.throws(()=>rejectFiniteCustodyBehavioralQuotientOverreach({authority:{merge:true}}),/claim ceiling exceeded/);
assert.throws(()=>rejectFiniteCustodyBehavioralQuotientOverreach({payload:{full_support_tables_exposed:true}}),/claim ceiling exceeded/);

console.log('Ash A15-R0 finite custody behavioral quotient / exact declared-task closure canonical tests passed.');
