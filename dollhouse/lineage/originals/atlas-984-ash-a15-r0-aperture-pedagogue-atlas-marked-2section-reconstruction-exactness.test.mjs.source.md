import assert from 'node:assert/strict';
import {atlasMarked2SectionReconstructionExactnessCertificate} from '../app/dome-world/previews/a15-r0/atlas-marked-2section-reconstruction-exactness.js';

const c=atlasMarked2SectionReconstructionExactnessCertificate();
assert.equal(c.parent_exact,true);
assert.equal(c.passed,true);
assert.deepEqual(c.declared_class,{ground_size:7,block_size:3,max_blocks:4,linear:true,union_grounded:true});
assert.deepEqual(c.census,{
  admitted_family_count:4305,
  family_count_by_blocks:{1:35,2:385,3:1575,4:2310},
  total_blocks:14770,
  pair_linearity_checks:18970,
  raw_membership_evaluations:103390,
  incidence_neighborhood_entries:28245,
  total_overlap_edges:17010,
  mark_count_profile:{0:3360,1:945},
  total_marked_concurrency_cliques:945,
  reconstruction_successes:4305,
  reconstruction_failures:0,
  structural_failures:0,
});
assert.equal(c.negative_controls.nonlinear_roundtrip_equal,false);
assert.equal(c.negative_controls.nonuniform_rejected,true);
assert.equal(c.negative_controls.isolated_receiver_same,true);
assert.deepEqual(c.negative_controls.isolated_declared_ground_sizes,[3,4]);
assert.equal(c.negative_controls.isolated_ground_element_recoverable,false);
assert.equal(c.laws.fully_marked_2section_roundtrip_exact_on_declared_class,true);
assert.equal(c.laws.linearity_needed_for_unweighted_edge_multiplicity,true);
assert.equal(c.laws.three_uniformity_required_by_declared_reconstructor,true);
assert.equal(c.laws.union_groundedness_needed_to_exclude_invisible_degree_zero_elements,true);
assert.equal(c.laws.universal_hypergraph_reconstruction_claimed,false);
assert.ok(c.membranes.includes('MARKED_2SECTION_RECONSTRUCTION != UNIVERSAL_HYPERGRAPH_RECONSTRUCTION'));
console.log('Ash A15-R0 Atlas marked 2-section reconstruction exactness canonical tests passed.');
