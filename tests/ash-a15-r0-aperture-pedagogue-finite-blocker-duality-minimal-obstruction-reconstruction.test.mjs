import assert from 'node:assert/strict';
import { finiteBlockerDualityMinimalObstructionReconstructionCertificate as certificate } from '../app/dome-world/previews/a15-r0/finite-blocker-duality-minimal-obstruction-reconstruction.js';

const c=certificate();
assert.equal(c.parent_receipt,'633cd75baaaebcc5f357bd503024aefbbcf11057');
assert.equal(c.parent_exact,true);
assert.equal(c.inherited,'1111111110');

const expected={
  specialization_comparability:{witnesses:20,families:1048576,blockers:22,counts:[981696,714560,319040,61888,0],minimum:[1,2,4,6,null]},
  principal_open_identity:{witnesses:5,families:32,blockers:4,counts:[27,14,3,0,0],minimum:[1,2,4,null,null]},
  principal_open_size:{witnesses:5,families:32,blockers:4,counts:[18,2,0,0,0],minimum:[2,4,null,null,null]},
  cut_orientation:{witnesses:10,families:1024,blockers:16,counts:[765,247,0,0,0],minimum:[2,4,null,null,null]},
};

for(const [name,e] of Object.entries(expected)){
  const row=c.classes[name];
  assert.equal(row.witness_count,e.witnesses,name);
  assert.equal(row.parent_witness_count,e.witnesses,name);
  assert.equal(row.witness_universe_exact,true,name);
  assert.equal(row.family_count,e.families,name);
  assert.equal(row.transport_labelled_edge_count,3,name);
  assert.ok(row.distinct_edge_count>=1&&row.distinct_edge_count<=3,name);
  assert.ok(row.clutter_edge_count>=1&&row.clutter_edge_count<=row.distinct_edge_count,name);
  assert.equal(row.parent_blocker_member_count,e.blockers,name);
  assert.equal(row.recomputed_first_blocker.length,e.blockers,name);
  assert.equal(row.first_blocker_vs_parent_mismatches,0,name);
  assert.equal(row.double_blocker_vs_clutter_mismatches,0,name);
  assert.equal(row.mu_original_vs_clutter_mismatches,0,name);
  assert.deepEqual(row.clutter_multicover_family_counts_depth_1_to_5,e.counts,name);
  assert.deepEqual(row.clutter_minimum_multicover_width_depth_1_to_5,e.minimum,name);
  assert.equal(row.multicover_counts_match_parent,true,name);
  assert.equal(row.minimum_widths_match_parent,true,name);
  assert.equal(row.transport_label_permutation_controls.length,6,name);
  assert.ok(row.transport_label_permutation_controls.every(control=>control.unchanged),name);
  assert.equal(row.transport_label_relabelling_changes_unlabelled_blocker,false,name);
  assert.equal(row.passed,true,name);
}

assert.equal(c.ledger.selected_family_count,1049664);
assert.equal(c.ledger.first_blocker_vs_parent_mismatches,0);
assert.equal(c.ledger.double_blocker_vs_clutter_mismatches,0);
assert.equal(c.ledger.mu_original_vs_clutter_mismatches,0);
assert.equal(c.ledger.multicover_count_mismatches,0);
assert.equal(c.ledger.minimum_width_mismatches,0);
assert.equal(c.ledger.label_relabelling_controls,24);
assert.equal(c.ledger.label_relabelling_failures,0);
assert.ok(c.laws.includes('DOUBLE_BLOCKER_OF_TRANSPORT_SEPARATION_HYPERGRAPH_EQUALS_ITS_MINIMAL_EDGE_CLUTTER_IN_EACH_DECLARED_FINITE_CLASS'));
assert.ok(c.laws.includes('MINIMAL_INHERITED_ORIGIN_IDENTIFYING_FAMILIES_RECONSTRUCT_THE_MINIMAL_UNLABELLED_TRANSPORT_OBSTRUCTION_CLUTTER'));
assert.ok(c.laws.includes('CLUTTERIZATION_PRESERVES_MU_TR_AND_ALL_EARNED_EXACT_ERASURE_ROBUSTNESS_DEPTHS_IN_EACH_DECLARED_FINITE_CLASS'));
assert.ok(c.membranes.includes('BLOCKER_DUAL_RECOVERY != TRANSPORT_LABEL_RECOVERY'));
assert.equal(c.passed,true);

console.log(JSON.stringify({
  schema:c.schema,
  ledger:c.ledger,
  discovery:Object.fromEntries(Object.entries(c.classes).map(([name,row])=>[name,{
    distinct_edge_count:row.distinct_edge_count,
    clutter_edge_count:row.clutter_edge_count,
    duplicate_edge_count_removed:row.duplicate_edge_count_removed,
    strict_superedge_count_removed:row.strict_superedge_count_removed,
    clutter_edges:row.clutter_edges,
    double_blocker:row.double_blocker,
  }])),
},null,2));
