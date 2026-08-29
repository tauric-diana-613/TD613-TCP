import assert from 'node:assert/strict';
import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import { PHASONIC_CUPOLA_CUSTODY_WITNESS } from '../app/dome-world/previews/a15-r0/phasonic-supermoire-dromological-tomography.js';
import {
  FINITE_CUSTODY_TASK_DEPENDENCY_POSET_SCHEMA,
  FINITE_CUSTODY_TASK_DEPENDENCY_POSET_PARENT_RECEIPT,
  finiteCustodyTaskDependencyPosetCertificate,
  compileFiniteCustodyTaskDependencyPosetProjection,
  rejectFiniteCustodyTaskDependencyPosetOverreach,
} from '../app/dome-world/previews/a15-r0/finite-custody-task-dependency-poset.js';

const EXPECTED_SUBSETS={
  EMPTY:['EMPTY',1],B:['B',4],R:['BRTA',32],T:['TA',27],A:['A',17],M:['AM',21],
  BR:['BRTA',32],BT:['BTA',28],BA:['BA',19],BM:['BAM',23],RT:['BRTA',32],RA:['BRTA',32],RM:['BRTAM',36],TA:['TA',27],TM:['TAM',31],AM:['AM',21],
  BRT:['BRTA',32],BRA:['BRTA',32],BRM:['BRTAM',36],BTA:['BTA',28],BTM:['BTAM',32],BAM:['BAM',23],RTA:['BRTA',32],RTM:['BRTAM',36],RAM:['BRTAM',36],TAM:['TAM',31],
  BRTA:['BRTA',32],BRTM:['BRTAM',36],BRAM:['BRTAM',36],BTAM:['BTAM',32],RTAM:['BRTAM',36],BRTAM:['BRTAM',36],
};
const EXPECTED_CLOSED={
  EMPTY:[1,1],B:[4,1],A:[17,1],BA:[19,1],TA:[27,2],AM:[21,2],BTA:[28,2],BAM:[23,2],TAM:[31,2],BRTA:[32,8],BTAM:[32,2],BRTAM:[36,8],
};

const certificate=finiteCustodyTaskDependencyPosetCertificate();
assert.equal(certificate.schema,FINITE_CUSTODY_TASK_DEPENDENCY_POSET_SCHEMA);
assert.equal(FINITE_CUSTODY_TASK_DEPENDENCY_POSET_PARENT_RECEIPT,'8a17d896a74d76f284081c29badd0ec5028c5ab1');
assert.equal(certificate.parent_receipt,FINITE_CUSTODY_TASK_DEPENDENCY_POSET_PARENT_RECEIPT);
assert.equal(certificate.domain.contexts,762);
assert.equal(certificate.domain.tasks,5);
assert.equal(certificate.domain.task_subsets,32);

for(const [id,[closure,classes]] of Object.entries(EXPECTED_SUBSETS)){
  assert.equal(certificate.subset_table[id].closure,closure,id);
  assert.equal(certificate.subset_table[id].classes,classes,id);
}
assert.equal(Object.keys(certificate.subset_table).length,32);

assert.deepEqual(certificate.dependency_poset.transitive_reduction,[['R','B'],['R','T'],['T','A'],['M','A']]);
assert.equal(certificate.dependency_poset.empirical_rule_mismatches,0);
assert.deepEqual(certificate.dependency_poset.single_edge_deletion_mismatches,{'R->B':8,'R->T':8,'T->A':6,'M->A':2});
assert.deepEqual(certificate.dependency_poset.singleton_closures,{B:'B',R:'BRTA',T:'TA',A:'A',M:'AM'});

assert.equal(certificate.closed_set_lattice.closed_state_count,12);
for(const [id,[classes,preimages]] of Object.entries(EXPECTED_CLOSED)){
  assert.equal(certificate.closed_set_lattice.states[id].classes,classes,id);
  assert.equal(certificate.closed_set_lattice.states[id].subset_preimages,preimages,id);
}
assert.equal(certificate.closed_set_lattice.ordered_pair_checks,144);
assert.equal(certificate.closed_set_lattice.meet_join_failures,0);
assert.equal(certificate.closed_set_lattice.ordered_triple_checks,1728);
assert.equal(certificate.closed_set_lattice.first_distributivity_failures,0);
assert.equal(certificate.closed_set_lattice.second_distributivity_failures,0);

assert.equal(certificate.finite_task_closure.empty_closure_empty,true);
assert.equal(certificate.finite_task_closure.extensive_subsets,32);
assert.equal(certificate.finite_task_closure.idempotent_subsets,32);
assert.equal(certificate.finite_task_closure.monotone_ordered_inclusion_pairs,243);
assert.equal(certificate.finite_task_closure.monotonicity_failures,0);
assert.equal(certificate.finite_task_closure.ordered_union_pairs,1024);
assert.equal(certificate.finite_task_closure.union_law_failures,0);
assert.equal(certificate.finite_task_closure.kuratowski_finite_closure,true);
assert.equal(certificate.finite_task_closure.finite_alexandrov_style_corollary,true);

assert.equal(certificate.generator.full_behavior_classes,36);
assert.equal(certificate.generator.R_classes,32);
assert.equal(certificate.generator.M_classes,21);
assert.equal(certificate.generator.RM_classes,36);
assert.deepEqual(certificate.generator.minimal_full_generators,['RM']);
assert.equal(certificate.generator.R_classes_split_by_M,4);
assert.equal(certificate.generator.R_contexts_split_by_M,32);
assert.equal(certificate.generator.split_contexts_all_q3_birth,true);
assert.equal(certificate.generator.named_split.same_R,true);
assert.equal(certificate.generator.named_split.same_M,false);
assert.deepEqual(certificate.generator.named_split.left.M,[5,5,5,'25x5','5x5']);
assert.deepEqual(certificate.generator.named_split.right.M,[5,5,5,'9x5','9x5']);

assert.equal(certificate.execution_ledger.stage_support_profile_reconstructions,3048);
assert.equal(certificate.execution_ledger.predecessor_task_replay_rows,2380);
assert.equal(certificate.execution_ledger.task_output_values,3810);
assert.equal(certificate.execution_ledger.subset_context_signature_constructions,24384);
assert.equal(certificate.execution_ledger.closure_constancy_context_task_observations,121920);
assert.equal(certificate.execution_ledger.rule_deletion_subset_comparisons,128);
assert.equal(certificate.exact,true);
assert.equal(certificate.passed,true);

const ash=compileFiniteCustodyTaskDependencyPosetProjection(AIA_RECEIVERS.ASH);
const loom=compileFiniteCustodyTaskDependencyPosetProjection(AIA_RECEIVERS.LOOM);
assert.deepEqual(ash.custody_witness,PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(loom.custody_witness,PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.equal(Object.values(ash.authority).some(Boolean),false);
assert.equal(Object.values(loom.authority).some(Boolean),false);
assert.equal(Object.values(ash.claim_ceiling).some(Boolean),false);
assert.equal(Object.values(loom.claim_ceiling).some(Boolean),false);
assert.equal(ash.payload.full_context_rows_exposed,false);
assert.equal(ash.payload.full_task_value_tables_exposed,false);
assert.equal(loom.payload.full_support_tables_exposed,false);

for(const hostile of [
  {...loom,scientific_ancestry_from_task_edge:true},{...loom,causal_derivation:true},{...loom,temporal_order:true},
  {...loom,future_task_closure:true},{...loom,universal_information_lattice:true},{...loom,model_state_topology:true},
  {...loom,physical_topology:true},{...loom,information_geometry:true},{...loom,minimum_bit_length:true},
  {...loom,unique_encoding:true},{...loom,shannon_capacity:true},{...loom,entropy:true},{...loom,mutual_information:true},
  {...loom,universal_database_dependency:true},{...loom,category_functor_theorem:true},{...loom,physical_holonomy:true},
  {...loom,operational_path_groupoid:true},{...loom,source_state_mutation:true},
  {...ash,payload:{...ash.payload,full_context_rows_exposed:true}},
  {...ash,payload:{...ash.payload,full_task_value_tables_exposed:true}},
  {...ash,payload:{...ash.payload,full_support_tables_exposed:true}},
]) assert.throws(()=>rejectFiniteCustodyTaskDependencyPosetOverreach(hostile));

assert.equal(rejectFiniteCustodyTaskDependencyPosetOverreach(loom),true);
console.log('Ash A15-R0 finite custody task dependency poset canonical tests passed.');
