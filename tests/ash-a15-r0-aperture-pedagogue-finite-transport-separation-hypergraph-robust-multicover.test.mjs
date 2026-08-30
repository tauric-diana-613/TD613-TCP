import assert from 'node:assert/strict';
import { finiteTransportSeparationHypergraphRobustMulticoverCertificate as certificate } from '../app/dome-world/previews/a15-r0/finite-transport-separation-hypergraph-robust-multicover.js';

const c=certificate();
assert.equal(c.parent_receipt,'891cb4125e626c1145b4a6dcb3b1a82074bee510');
assert.equal(c.parent_exact,true);
assert.equal(c.inherited,'1111111110');
assert.deepEqual(c.group,['id','(B M)','(A R)','(A R)(B M)']);
assert.deepEqual(c.inherited_point_stabilizer,['id']);

const expected={
  specialization_comparability:{witnesses:20,families:1048576,counts:[981696,714560,319040,61888,0],minimum:[1,2,4,6,null]},
  principal_open_identity:{witnesses:5,families:32,counts:[27,14,3,0,0],minimum:[1,2,4,null,null]},
  principal_open_size:{witnesses:5,families:32,counts:[18,2,0,0,0],minimum:[2,4,null,null,null]},
  cut_orientation:{witnesses:10,families:1024,counts:[765,247,0,0,0],minimum:[2,4,null,null,null]},
};

for(const [name,e] of Object.entries(expected)){
  const row=c.classes[name];
  assert.equal(row.witness_count,e.witnesses,name);
  assert.equal(row.family_count,e.families,name);
  assert.equal(row.transport_labelled_edges.length,3,name);
  assert.ok(row.transport_labelled_edges.every(edge=>edge.size>0),`${name} transport edge must be nonempty`);
  assert.ok(row.deduplicated_edge_count>=1&&row.deduplicated_edge_count<=3,name);
  assert.equal(row.residual_transport_edge_avoidance_mismatches,0,name);
  assert.equal(row.origin_identification_transversal_mismatches,0,name);
  assert.equal(row.mu_hypergraph_vs_mu_tr_mismatches,0,name);
  assert.deepEqual(row.multicover_family_counts_depth_1_to_5,e.counts,name);
  assert.deepEqual(row.robust_transport_rank_e0_to_e4,e.minimum,name);
  assert.equal(row.transversal_number,e.minimum[0],name);
  assert.equal(row.parent_robust_family_counts_match,true,name);
  assert.equal(row.parent_minimum_widths_match,true,name);
  assert.equal(row.blocker_member_count,row.direct_minimal_identifying_family_count,name);
  assert.equal(row.blocker_vs_inclusion_minimal_identifying_family_mismatches,0,name);
  assert.ok(row.blocker_member_count>0,name);
  assert.equal(row.passed,true,name);
}

assert.deepEqual(c.ledger,{
  selected_family_count:1049664,
  family_transport_intersection_checks:3148992,
  multicover_depth_checks_1_to_5:5248320,
  all_family_single_witness_deletion_checks_for_blocker_minimality:10491040,
  residual_transport_edge_avoidance_mismatches:0,
  origin_identification_transversal_mismatches:0,
  mu_hypergraph_vs_mu_tr_mismatches:0,
  blocker_vs_inclusion_minimal_identifying_family_mismatches:0,
  same_rank_distinct_incidence_examples:c.same_rank_distinct_incidence_examples.length,
});
assert.ok(c.same_rank_distinct_incidence_examples.length>0);
assert.ok(c.same_rank_distinct_incidence_examples.some(row=>row.classes.includes('specialization_comparability')&&row.classes.includes('principal_open_identity')&&row.rank===1));
assert.ok(c.same_rank_distinct_incidence_examples.some(row=>row.classes.includes('principal_open_size')&&row.classes.includes('cut_orientation')&&row.rank===2));
assert.ok(c.laws.includes('TRANSPORT_SEPARATING_RANK_EQUALS_TRANSPORT_SEPARATION_HYPERGRAPH_TRANSVERSAL_NUMBER_IN_EACH_DECLARED_FINITE_CLASS'));
assert.ok(c.laws.includes('EXACT_E_ERASURE_ROBUSTNESS_EQUALS_E_PLUS_ONE_FOLD_TRANSPORT_EDGE_MULTICOVER_IN_EACH_DECLARED_FINITE_CLASS'));
assert.ok(c.laws.includes('INCLUSION_MINIMAL_ORIGIN_IDENTIFYING_FAMILIES_EQUAL_THE_HYPERGRAPH_BLOCKER'));
assert.ok(c.membranes.includes('TRANSPORT_EDGE_MULTICOVER != ERROR_CORRECTION_CAPACITY'));
assert.equal(c.passed,true);

console.log(JSON.stringify({
  schema:c.schema,
  ledger:c.ledger,
  discovery:Object.fromEntries(Object.entries(c.classes).map(([name,row])=>[name,{
    edges:row.transport_labelled_edges,
    deduplicated_edge_count:row.deduplicated_edge_count,
    edge_size_spectrum:row.edge_size_spectrum,
    transversal_number:row.transversal_number,
    blocker_member_count:row.blocker_member_count,
    blocker_width_spectrum:row.blocker_width_spectrum,
    essential_witness_vertices:row.essential_witness_vertices,
    never_minimal_witness_vertices:row.never_minimal_witness_vertices,
    incidence_fingerprint:row.incidence_fingerprint,
  }])),
  same_rank_distinct_incidence_examples:c.same_rank_distinct_incidence_examples,
},null,2));
