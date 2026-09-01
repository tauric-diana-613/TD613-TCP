import assert from 'node:assert/strict';
import {
  ATLAS_CAPACITY_VECTOR_MARKED_2SECTION_RECONSTRUCTION_SCHEMA,
  ATLAS_CAPACITY_VECTOR_MARKED_2SECTION_RECONSTRUCTION_PARENT_RECEIPT,
  atlasCapacityVectorMarked2SectionReconstructionCertificate,
} from '../app/dome-world/previews/a15-r0/atlas-capacity-vector-marked-2section-reconstruction.js';

assert.equal(ATLAS_CAPACITY_VECTOR_MARKED_2SECTION_RECONSTRUCTION_SCHEMA,'td613.dome-world.atlas-capacity-vector-marked-2section-reconstruction/v0.1');
assert.equal(ATLAS_CAPACITY_VECTOR_MARKED_2SECTION_RECONSTRUCTION_PARENT_RECEIPT,'93abc6fa561d1992c5dc0322a8016212688c98bd');
const c=atlasCapacityVectorMarked2SectionReconstructionCertificate();
assert.equal(c.parent_exact,true);
assert.deepEqual(c.census,{
  ambient_candidate_families:125671,
  pair_linearity_candidate_checks:368550,
  admitted_families:27426,
  admitted_by_block_count:{1:91,2:2275,3:25060},
  total_admitted_block_occurrences:79821,
  raw_membership_evaluations:558747,
  incidence_neighborhood_entries:161287,
  total_overlap_edges:57820,
  total_concurrency_marks:2345,
  mark_count_profile:{0:25081,1:2345},
  nonuniform_admitted_families:23765,
  marked_admitted_families:2345,
  nonuniform_marked_families:2100,
  roundtrip_successes:27426,
  roundtrip_failures:0,
});
assert.deepEqual(c.capacity_label_control,{
  same_overlap_edges:true,
  same_sorted_capacity_multiset:true,
  A_capacity_vector:[2,4,3],
  B_capacity_vector:[4,2,3],
  graph_isomorphisms:2,
  capacity_preserving_graph_isomorphisms:0,
  raw_incidence_neighborhoods_equal:false,
  A_roundtrip_exact:true,
  B_roundtrip_exact:true,
});
assert.equal(c.proof_ledger.private_multiplicity_formula,'p_i=c_i-s_i');
assert.equal(c.proof_ledger.global_uniformity_used,false);
assert.equal(c.laws.capacity_vector_roundtrip_exact_on_declared_nonuniform_assay,true);
assert.equal(c.laws.global_uniformity_not_required_by_reconstruction_law,true);
assert.equal(c.laws.sorted_capacity_inventory_alone_insufficient_in_declared_control,true);
assert.equal(c.laws.capacity_vector_universally_minimal_claimed,false);
assert.equal(c.laws.nonlinear_multiplicity_repaired_claimed,false);
assert.equal(c.laws.degree_zero_ground_recovered_claimed,false);
assert.equal(c.passed,true);

console.log('Ash A15-R0 Atlas capacity-vector marked 2-section reconstruction canonical tests passed.');
