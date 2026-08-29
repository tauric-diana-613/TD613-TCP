import assert from 'node:assert/strict';
import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import {
  FINITE_TASK_TOPOLOGY_RIGIDITY_BIRKHOFF_PARENT_RECEIPT,
  finiteTaskTopologyRigidityBirkhoffCertificate,
  compileFiniteTaskTopologyRigidityBirkhoffProjection,
} from '../app/dome-world/previews/a15-r0/finite-task-topology-rigidity-birkhoff-dual.js';

const receipt='d76ab8a3166916ebed1d189eee01343233ee3cfd';
assert.equal(FINITE_TASK_TOPOLOGY_RIGIDITY_BIRKHOFF_PARENT_RECEIPT,receipt);

const c=finiteTaskTopologyRigidityBirkhoffCertificate();
assert.equal(c.parent_receipt,receipt);
assert.equal(c.domain.task_points,5);
assert.equal(c.domain.parent_task_subsets,32);
assert.equal(c.domain.closed_states,12);
assert.equal(c.exact,true);
assert.equal(c.passed,true);

assert.equal(c.topology.closed_states.length,12);
assert.equal(c.topology.open_states.length,12);
assert.deepEqual(new Set(c.topology.clopen_states),new Set(['EMPTY','BRTAM']));
assert.equal(c.topology.T0,true);
assert.equal(c.topology.T1,false);
assert.equal(c.topology.connected,true);
assert.equal(c.topology.finite_alexandrov,true);
assert.equal(c.topology.closed_intersection_checks,144);
assert.equal(c.topology.closed_intersection_failures,0);
assert.equal(c.topology.closed_union_checks,144);
assert.equal(c.topology.closed_union_failures,0);
assert.equal(c.topology.open_union_checks,144);
assert.equal(c.topology.open_union_failures,0);
assert.equal(c.topology.open_intersection_checks,144);
assert.equal(c.topology.open_intersection_failures,0);
assert.equal(c.topology.point_separation_pairs,10);

assert.deepEqual(c.topology.principal_closures,{B:'B',R:'BRTA',T:'TA',A:'A',M:'AM'});
assert.deepEqual(c.topology.minimal_open_neighborhoods,{B:'BR',R:'R',T:'RT',A:'RTAM',M:'M'});
assert.deepEqual(c.topology.intrinsic_point_fingerprints.B,[1,2]);
assert.deepEqual(c.topology.intrinsic_point_fingerprints.A,[1,4]);
assert.deepEqual(c.topology.intrinsic_point_fingerprints.T,[2,2]);
assert.deepEqual(c.topology.intrinsic_point_fingerprints.M,[2,1]);
assert.deepEqual(c.topology.intrinsic_point_fingerprints.R,[4,1]);
assert.equal(c.topology.fingerprint_duplicate_count,0);

assert.equal(c.lattice_dual.element_count,12);
assert.equal(c.lattice_dual.hasse_cover_count,18);
assert.deepEqual(new Set(c.lattice_dual.join_irreducibles),new Set(['B','A','TA','AM','BRTA']));
assert.deepEqual(new Set(c.lattice_dual.meet_irreducibles),new Set(['B','BAM','TAM','BRTA','BTAM']));
assert.deepEqual(
  new Set(c.lattice_dual.join_irreducible_covers.map(pair=>pair.join('<'))),
  new Set(['B<BRTA','A<TA','A<AM','TA<BRTA']),
);
assert.equal(c.lattice_dual.candidate_join_irreducible_subsets,32);
assert.equal(c.lattice_dual.downset_count,12);
assert.equal(c.lattice_dual.birkhoff_image_count,12);
assert.equal(c.lattice_dual.birkhoff_exact,true);
assert.deepEqual(c.lattice_dual.rank_distribution,{'0':1,'1':2,'2':3,'3':3,'4':2,'5':1});

assert.equal(c.specialization_order.convention,'x<=y iff x in cl({y})');
assert.deepEqual(
  new Set(c.specialization_order.covers.map(pair=>pair.join('<'))),
  new Set(['B<R','A<T','A<M','T<R']),
);
assert.deepEqual(new Set(c.specialization_order.maximal_points),new Set(['R','M']));
assert.deepEqual(new Set(c.specialization_order.minimal_points),new Set(['A','B']));
assert.deepEqual(c.specialization_order.unique_parent_minimal_full_generator,['RM']);
assert.equal(c.specialization_order.generator_equals_maximal_points,true);

assert.equal(c.rigidity.permutations_tested,120);
assert.equal(c.rigidity.relation_cell_comparisons,3000);
assert.equal(c.rigidity.closure_family_image_checks,1440);
assert.equal(c.rigidity.preserving_automorphism_count,1);
assert.equal(c.rigidity.nonidentity_preserving_count,0);
assert.equal(c.rigidity.rigid,true);
assert.deepEqual(c.rigidity.preserving_automorphisms[0],{B:'B',R:'R',T:'T',A:'A',M:'M'});

assert.equal(c.execution_ledger.parent_subset_rows,32);
assert.equal(c.execution_ledger.lattice_order_relation_cells,144);
assert.equal(c.execution_ledger.topology_closed_pair_checks,288);
assert.equal(c.execution_ledger.topology_open_pair_checks,288);
assert.equal(c.execution_ledger.join_irreducible_order_cells,25);
assert.equal(c.execution_ledger.candidate_downsets,32);
assert.equal(c.execution_ledger.birkhoff_state_images,12);
assert.equal(c.execution_ledger.task_permutations,120);
assert.equal(c.execution_ledger.permutation_relation_cells,3000);
assert.equal(c.execution_ledger.permutation_closure_family_images,1440);

for(const scar of [
  'FINITE_TASK_TOPOLOGY != MODEL_STATE_TOPOLOGY',
  'FINITE_TASK_TOPOLOGY != PHYSICAL_SPACE',
  'SPECIALIZATION_ORDER != SCIENTIFIC_ANCESTRY',
  'SPECIALIZATION_ORDER != CAUSAL_ORDER',
  'MAXIMAL_SPECIALIZATION_POINT != CAUSAL_ROOT',
  'TOPOLOGICAL_RIGIDITY != SEMANTIC_NAME_RECOVERY_FROM_NOTHING',
  'TOPOLOGICAL_RIGIDITY != UNIQUE_ENCODING',
  'BIRKHOFF_REPRESENTATION != CATEGORY_OR_FUNCTOR_THEOREM',
  'JOIN_IRREDUCIBLE != INDEPENDENT_SCIENTIFIC_PRIMITIVE',
  'CONNECTED_TOPOLOGY != DYNAMICAL_COUPLING',
  'T0_TASK_SPACE != SOURCE_STATE_IDENTIFIABILITY',
  'FINITE_ALEXANDROV != CONTINUUM_TOPOLOGY',
  'AUTOMORPHISM_TRIVIALITY != UNIVERSAL_TASK_IDENTIFIABILITY',
  'WITNESS_ROUTING != SCIENTIFIC_ANCESTRY',
]) assert.equal(c.scars.includes(scar),true,`missing scar ${scar}`);

for(const receiver of [AIA_RECEIVERS.ASH,AIA_RECEIVERS.LOOM]){
  const projection=compileFiniteTaskTopologyRigidityBirkhoffProjection(receiver);
  assert.equal(projection.receiver,receiver);
  assert.equal(projection.authority.inverse,false);
  assert.equal(projection.authority.custody_mutation,false);
  assert.equal(projection.authority.source_state_transform,false);
  assert.equal(projection.authority.release,false);
  assert.equal(projection.authority.production,false);
  assert.equal(projection.authority.physical_claim,false);
  assert.equal(projection.authority.continuum_claim,false);
  assert.equal(projection.research_only,true);
  assert.equal(projection.runtime_binding,false);
}

const ash=compileFiniteTaskTopologyRigidityBirkhoffProjection(AIA_RECEIVERS.ASH);
assert.equal(ash.payload.semantic_task_names_inherited,true);
assert.equal(ash.payload.model_state_topology_claim,false);
assert.equal(ash.payload.physical_topology_claim,false);
assert.equal(ash.payload.preserving_automorphisms,1);

console.log('Ash A15-R0 finite task topology rigidity / Birkhoff dual canonical contract passed.');
