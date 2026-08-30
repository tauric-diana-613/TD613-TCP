import assert from 'node:assert/strict';
import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import {
  FINITE_METRIC_CUT_SKELETON_TOPOLOGICAL_ORIENTATION_PARENT_RECEIPT,
  finiteMetricCutSkeletonTopologicalOrientationCertificate,
  compileFiniteMetricCutSkeletonTopologicalOrientationProjection,
} from '../app/dome-world/previews/a15-r0/finite-metric-cut-skeleton-topological-orientation-nonidentifiability.js';

const receipt='29a8879571341d0ee68b14f3e52bef76005b438e';
assert.equal(FINITE_METRIC_CUT_SKELETON_TOPOLOGICAL_ORIENTATION_PARENT_RECEIPT,receipt);
const c=finiteMetricCutSkeletonTopologicalOrientationCertificate();
assert.equal(c.parent_receipt,receipt);
assert.equal(c.exact,true);
assert.equal(c.passed,true);
assert.deepEqual(c.domain,{roles:5,pairs:10,nontrivial_unoriented_cuts:15,role_permutations:120});

assert.equal(c.raw_integer_inversion.decomposition_count,5);
assert.equal(c.raw_integer_inversion.unique,false);
assert.equal(c.raw_integer_inversion.expected_solution_set_match,true);
assert.deepEqual(c.raw_integer_inversion.decompositions,[
  {A:0,AB:2,AT:1,AM:2,AR:0,ABT:1,ABM:0,ABR:0,ATM:1,ATR:1,AMR:0,ABTM:1,ABTR:0,ABMR:0,ATMR:0},
  {A:0,AB:2,AT:2,AM:2,AR:0,ABT:0,ABM:0,ABR:0,ATM:0,ATR:0,AMR:0,ABTM:2,ABTR:1,ABMR:0,ATMR:1},
  {A:1,AB:1,AT:0,AM:1,AR:0,ABT:2,ABM:1,ABR:0,ATM:2,ATR:1,AMR:0,ABTM:0,ABTR:0,ABMR:0,ATMR:0},
  {A:1,AB:1,AT:1,AM:1,AR:0,ABT:1,ABM:1,ABR:0,ATM:1,ATR:0,AMR:0,ABTM:1,ABTR:1,ABMR:0,ATMR:1},
  {A:2,AB:0,AT:0,AM:0,AR:0,ABT:2,ABM:2,ABR:0,ATM:2,ATR:0,AMR:0,ABTM:0,ABTR:1,ABMR:0,ATMR:1},
]);

assert.equal(c.distinct_unit_inversion.families_enumerated,32768);
assert.equal(c.distinct_unit_inversion.exact_decomposition_count,1);
assert.equal(c.distinct_unit_inversion.support_size,10);
assert.equal(c.distinct_unit_inversion.inherited_ten_distinct_unit_probe_prior,true);
assert.deepEqual(c.distinct_unit_inversion.unique_support,['A','AB','AT','AM','ABT','ABM','ATM','ABTM','ABTR','ATMR']);

assert.equal(c.orientation_fibre.orientations_enumerated,1024);
assert.equal(c.orientation_fibre.pairwise_union_intersection_checks,294912);
assert.equal(c.orientation_fibre.compatible_topology_count,4);
assert.deepEqual(c.orientation_fibre.compatible_orientation_bits,['0000000001','0000000010','1111111101','1111111110']);
assert.equal(c.orientation_fibre.inherited_orientation_bits,'1111111110');
assert.equal(c.orientation_fibre.inherited_matches_parent_topology,true);
const expectedCovers={
  '0000000001':['M<A','R<B','R<T','T<A'],
  '0000000010':['B<A','R<M','R<T','T<A'],
  '1111111101':['A<B','A<T','M<R','T<R'],
  '1111111110':['A<M','A<T','B<R','T<R'],
};
for(const row of c.orientation_fibre.topologies){
  assert.equal(row.audit.unique_open_count,12);
  assert.equal(row.audit.closure_failures,0);
  assert.equal(row.properties.T0,true);
  assert.equal(row.properties.T1,false);
  assert.equal(row.properties.connected,true);
  assert.equal(row.properties.clopen_count,2);
  assert.equal(row.properties.finite_alexandrov,true);
  assert.equal(row.properties.automorphism_count,1);
  assert.deepEqual(row.properties.covers,expectedCovers[row.bits]);
}

assert.equal(c.metric_isometry_action.metric_isometry_count,4);
assert.deepEqual(new Set(c.metric_isometry_action.isometry_names),new Set(['id','(B M)','(A R)','(A R)(B M)']));
assert.equal(c.metric_isometry_action.action_checks,16);
assert.equal(c.metric_isometry_action.action_closed,true);
assert.equal(c.metric_isometry_action.inherited_orbit_size,4);
assert.equal(c.metric_isometry_action.inherited_stabilizer_size,1);
assert.equal(c.metric_isometry_action.free,true);
assert.equal(c.metric_isometry_action.transitive,true);
const inheritedAction=Object.fromEntries(c.metric_isometry_action.action_rows.filter(row=>row.source==='1111111110').map(row=>[row.isometry,row.target]));
assert.deepEqual(inheritedAction,{
  id:'1111111110','(A R)':'0000000010','(B M)':'1111111101','(A R)(B M)':'0000000001',
});

assert.equal(c.execution_ledger.integer_cut_variables,15);
assert.equal(c.execution_ledger.binary_cut_families,32768);
assert.equal(c.execution_ledger.orientation_assignments,1024);
assert.equal(c.execution_ledger.topology_closure_operation_checks,294912);
assert.equal(c.execution_ledger.topology_automorphism_permutation_checks,480);
assert.equal(c.execution_ledger.metric_isometry_permutation_checks,120);
assert.equal(c.execution_ledger.isometry_topology_action_checks,16);

for(const scar of [
  'RAW_METRIC_DECOMPOSITION != UNIQUE_CUT_SKELETON','INTEGER_CUT_DECOMPOSITION != REAL_CUT_CONE_UNIQUENESS',
  'TEN_DISTINCT_UNIT_PROBE_PRIOR != METRIC_ONLY_INFORMATION','UNORIENTED_CUT != OPEN_SET','CUT_SKELETON_RECOVERY != TOPOLOGY_RECOVERY',
  'TOPOLOGICAL_ORIENTATION != PHYSICAL_ORIENTATION','SPECIALIZATION_ORDER != CAUSAL_ORDER','METRIC_ISOMETRY_ACTION != PHYSICAL_DYNAMICS',
  'FREE_TRANSITIVE_FINITE_ACTION != GAUGE_THEORY','ORIENTATION_FIBRE != HIDDEN_STATE_SPACE',
]) assert.equal(c.scars.includes(scar),true,`missing scar ${scar}`);

for(const receiver of [AIA_RECEIVERS.ASH,AIA_RECEIVERS.LOOM]){
  const projection=compileFiniteMetricCutSkeletonTopologicalOrientationProjection(receiver);
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

console.log('Ash A15-R0 metric cut-skeleton / topological-orientation canonical contract passed.');
