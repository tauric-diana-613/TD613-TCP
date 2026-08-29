import assert from 'node:assert/strict';
import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import {
  FINITE_TASK_HOMOTOPY_AMNESIA_ROLE_TOMOGRAPHY_PARENT_RECEIPT,
  finiteTaskHomotopyAmnesiaRoleTomographyCertificate,
  compileFiniteTaskHomotopyAmnesiaRoleTomographyProjection,
} from '../app/dome-world/previews/a15-r0/finite-task-homotopy-amnesia-role-tomography.js';

const receipt='7c4cef95d4f704f05615d663e252d5a53775bdbe';
assert.equal(FINITE_TASK_HOMOTOPY_AMNESIA_ROLE_TOMOGRAPHY_PARENT_RECEIPT,receipt);
const c=finiteTaskHomotopyAmnesiaRoleTomographyCertificate();
assert.equal(c.parent_receipt,receipt);
assert.equal(c.exact,true);
assert.equal(c.passed,true);
assert.deepEqual(c.domain,{task_points:5,open_sets:12,self_functions:3125});

assert.deepEqual(c.local_role_tomography.closure_sizes,{A:1,B:1,T:2,M:2,R:4});
assert.deepEqual(c.local_role_tomography.minimal_open_sizes,{A:4,B:2,T:2,M:1,R:1});
assert.deepEqual(c.local_role_tomography.joint_fingerprints,{A:[1,4],B:[1,2],T:[2,2],M:[2,1],R:[4,1]});
assert.equal(c.local_role_tomography.closure_size_partition.length,3);
assert.equal(c.local_role_tomography.minimal_open_size_partition.length,3);
assert.equal(c.local_role_tomography.joint_partition.length,5);
assert.equal(c.local_role_tomography.joint_role_classes,5);
assert.equal(c.local_role_tomography.joint_ambiguity,0);

assert.equal(c.endomorphism_census.all_self_functions,3125);
assert.equal(c.endomorphism_census.order_continuity_agreement,3125);
assert.equal(c.endomorphism_census.order_continuity_mismatches,0);
assert.equal(c.endomorphism_census.continuous_endomorphisms,128);
assert.equal(c.endomorphism_census.noncontinuous_functions,2997);
assert.deepEqual(c.endomorphism_census.image_size_spectrum,{'1':5,'2':50,'3':60,'4':12,'5':1});
assert.equal(c.endomorphism_census.idempotent_continuous_endomorphisms,61);
assert.deepEqual(c.endomorphism_census.idempotent_image_size_spectrum,{'1':5,'2':26,'3':21,'4':8,'5':1});
assert.equal(c.endomorphism_census.bijective_continuous_endomorphisms,1);
assert.equal(c.endomorphism_census.identity_is_unique_bijective,true);

assert.equal(c.map_comparability_graph.vertices,128);
assert.equal(c.map_comparability_graph.edges,1528);
assert.equal(c.map_comparability_graph.components,1);
assert.equal(c.map_comparability_graph.diameter,3);
assert.equal(c.map_comparability_graph.unordered_pairs,8128);
assert.deepEqual(c.map_comparability_graph.unordered_pair_distance_spectrum,{'1':1528,'2':5435,'3':1165});
assert.deepEqual(c.map_comparability_graph.identity_distance_spectrum,{'0':1,'1':6,'2':49,'3':72});
assert.deepEqual(c.map_comparability_graph.identity_to_constants,{A:2,B:3,T:3,M:3,R:2});

assert.equal(c.beat_collapse.complete_sequences,36);
assert.equal(c.beat_collapse.reachable_subspaces,19);
assert.deepEqual(c.beat_collapse.reachable_by_size,{'1':5,'2':5,'3':5,'4':3,'5':1});
assert.deepEqual(c.beat_collapse.terminal_multiplicity,{R:12,A:12,M:3,T:6,B:3});
assert.deepEqual(new Set(c.beat_collapse.initial_beats.map(row=>row.point)),new Set(['B','T','M']));
const B=c.beat_collapse.initial_beats.find(row=>row.point==='B');
const T=c.beat_collapse.initial_beats.find(row=>row.point==='T');
const M=c.beat_collapse.initial_beats.find(row=>row.point==='M');
assert.equal(B.upper_minimum,'R');
assert.equal(T.upper_minimum,'R');
assert.equal(T.lower_maximum,'A');
assert.equal(M.lower_maximum,'A');
for(const sequence of c.beat_collapse.sequences){
  assert.equal(sequence.deletions.length,4);
  assert.equal(sequence.witnesses.length,4);
  assert.equal(sequence.witnesses.every(witness=>witness.is_beat),true);
}

assert.deepEqual(c.order_complex.full.f_vector,[5,5,1]);
assert.equal(c.order_complex.full.euler_characteristic,1);
assert.deepEqual(c.order_complex.full.betti_f2,[1,0,0]);
assert.deepEqual(c.order_complex.deletions.A.f_vector,[4,2,0]);
assert.deepEqual(c.order_complex.deletions.R.f_vector,[4,2,0]);
assert.deepEqual(c.order_complex.deletions.B.f_vector,[4,4,1]);
assert.deepEqual(c.order_complex.deletions.M.f_vector,[4,4,1]);
assert.deepEqual(c.order_complex.deletions.T.f_vector,[4,3,0]);
assert.deepEqual(c.order_complex.deletions.A.betti_f2,[2,0,0]);
assert.deepEqual(c.order_complex.deletions.R.betti_f2,[2,0,0]);
for(const point of ['B','T','M']) assert.deepEqual(c.order_complex.deletions[point].betti_f2,[1,0,0]);
assert.equal(c.order_complex.delete_f_partition.length,3);
assert.equal(c.order_complex.delete_betti_partition.length,2);
assert.equal(c.order_complex.beat_terminal_multiplicity_partition.length,3);

assert.deepEqual(c.aperture_ladder.role_class_counts,[5,3,2,1]);
assert.equal(c.aperture_ladder.full_joint_local.length,5);
assert.equal(c.aperture_ladder.delete_f_vector.length,3);
assert.equal(c.aperture_ladder.delete_betti_f2.length,2);
assert.equal(c.aperture_ladder.global_homotopy_homology_role_classes,1);

assert.equal(c.execution_ledger.self_functions,3125);
assert.equal(c.execution_ledger.order_relation_cell_checks,78125);
assert.equal(c.execution_ledger.open_preimage_checks,37500);
assert.equal(c.execution_ledger.continuous_endomorphisms,128);
assert.equal(c.execution_ledger.continuous_unordered_pairs,8128);
assert.equal(c.execution_ledger.bfs_runs,128);
assert.equal(c.execution_ledger.beat_sequences,36);

for(const scar of [
  'TASK_TOPOLOGY_RIGIDITY != HOMOTOPY_RIGIDITY',
  'AUTOMORPHISM_RIGIDITY != HOMOTOPY_IDENTITY_RIGIDITY',
  'CONTINUOUS_ENDOMORPHISM != AUTOMORPHISM',
  'HOMOTOPY_EQUIVALENCE != TASK_ROLE_IDENTITY',
  'CONTRACTIBLE != TOPOLOGICALLY_TRIVIAL',
  'BEAT_POINT_REMOVAL != SEMANTIC_TASK_DELETION',
  'BEAT_COLLAPSE_TERMINAL_POINT != STRUCTURAL_ROLE_IDENTITY',
  'ORDER_COMPLEX != PHYSICAL_GEOMETRY',
  'SIMPLICIAL_HOMOLOGY != INFORMATION_CONTENT',
  'BETTI_EQUIVALENCE != TASK_ROLE_EQUIVALENCE',
  'EULER_CHARACTERISTIC != SEMANTIC_COMPLETENESS',
  'COARSE_TOPOLOGICAL_INVARIANT != FULL_TASK_TOPOLOGY',
  'LOCAL_SCALAR_APERTURE_ALIASING != ROLE_IDENTITY',
  'JOINT_LOCAL_FINGERPRINT_RECOVERY != UNIVERSAL_TOMOGRAPHY',
  'FINITE_CONTINUITY_CENSUS != UNIVERSAL_DYNAMICAL_SYSTEM',
  'POINTWISE_COMPARABILITY_GRAPH != PHYSICAL_EVOLUTION',
  'HOMOTOPY_CLASS_COLLAPSE != SOURCE_STATE_COLLAPSE',
  'ROLE_DISTINGUISHABILITY_LADDER != SHANNON_INFORMATION_LADDER',
  'FINITE_ROLE_TOMOGRAPHY != NATURAL_LANGUAGE_SEMANTIC_RECONSTRUCTION',
  'WITNESS_ROUTING != SCIENTIFIC_ANCESTRY',
]) assert.equal(c.scars.includes(scar),true,`missing scar ${scar}`);

for(const receiver of [AIA_RECEIVERS.ASH,AIA_RECEIVERS.LOOM]){
  const projection=compileFiniteTaskHomotopyAmnesiaRoleTomographyProjection(receiver);
  assert.equal(projection.receiver,receiver);
  assert.equal(projection.authority.custody_mutation,false);
  assert.equal(projection.authority.source_state_transform,false);
  assert.equal(projection.authority.release,false);
  assert.equal(projection.authority.production,false);
  assert.equal(projection.authority.physical_claim,false);
  assert.equal(projection.authority.continuum_claim,false);
  assert.equal(projection.research_only,true);
  assert.equal(projection.runtime_binding,false);
}
const ash=compileFiniteTaskHomotopyAmnesiaRoleTomographyProjection(AIA_RECEIVERS.ASH);
assert.deepEqual(ash.payload.role_class_ladder,[5,3,2,1]);
assert.equal(ash.payload.semantic_task_names_inherited,true);
assert.equal(ash.payload.natural_language_semantics_claim,false);
assert.equal(ash.payload.physical_topology_claim,false);

console.log('Ash A15-R0 finite task homotopy-amnesia / role-tomography canonical contract passed.');
