import assert from 'node:assert/strict';
import {
  ATLAS_MARGINAL_RELATIONAL_INCIDENCE_SEPARATION_SCHEMA,
  ATLAS_MARGINAL_RELATIONAL_INCIDENCE_SEPARATION_PARENT_RECEIPT,
  atlasMarginalRelationalIncidenceSeparationCertificate,
} from '../app/dome-world/previews/a15-r0/atlas-marginal-relational-incidence-separation.js';

assert.equal(ATLAS_MARGINAL_RELATIONAL_INCIDENCE_SEPARATION_SCHEMA,'td613.dome-world.atlas-marginal-relational-incidence-separation/v0.1');
assert.equal(ATLAS_MARGINAL_RELATIONAL_INCIDENCE_SEPARATION_PARENT_RECEIPT,'94e644f8e718581c4764b0c1f43bd35017e0d476');
const c=atlasMarginalRelationalIncidenceSeparationCertificate();
assert.equal(c.parent_exact,true);
assert.equal(c.passed,true);
assert.deepEqual(c.M_tail.circuit_hyperplanes,[7,25,42,196]);
assert.deepEqual(c.M_cycle.circuit_hyperplanes,[7,25,98,168]);
assert.deepEqual(c.M_tail.rank_frequency,{'0':1,'1':8,'2':32,'3':215});
assert.deepEqual(c.M_cycle.rank_frequency,{'0':1,'1':8,'2':32,'3':215});
assert.deepEqual(c.M_tail.element_degree_multiset,[2,2,2,2,1,1,1,1]);
assert.deepEqual(c.M_cycle.element_degree_multiset,[2,2,2,2,1,1,1,1]);
assert.deepEqual(c.M_tail.moments_k1_to_k8,[12,20,36,68,132,260,516,1028]);
assert.deepEqual(c.M_cycle.moments_k1_to_k8,[12,20,36,68,132,260,516,1028]);
assert.equal(c.all_k_moment_identity.degree_multisets_equal,true);
assert.equal(c.all_k_moment_identity.formula,'m_k=4*2^k+4 for every integer k>=1');
assert.deepEqual(c.overlap_double_count,{M_tail:4,M_cycle:4});
assert.equal(c.M_tail.overlap_graph.edge_count,4);
assert.equal(c.M_cycle.overlap_graph.edge_count,4);
assert.deepEqual(c.M_tail.overlap_graph.degree_profile,[3,2,2,1]);
assert.deepEqual(c.M_cycle.overlap_graph.degree_profile,[2,2,2,2]);
assert.equal(c.M_tail.overlap_graph.max_degree,3);
assert.equal(c.M_cycle.overlap_graph.max_degree,2);
assert.deepEqual(c.receiver_class_counts,{tutte:1,tutte_plus_degree_multiset:1,tutte_plus_all_one_point_power_sum_moments:1,tutte_plus_degree_multiset_plus_total_overlap:1,tutte_plus_degree_multiset_plus_max_overlap_degree:2});
assert.equal(c.cross_isomorphism.relabelings,40320);
assert.equal(c.cross_isomorphism.mapped_circuit_hyperplane_membership_checks,161280);
assert.equal(c.cross_isomorphism.match_count,0);
assert.deepEqual(c.aggregate_burden,{rank_bound_checks:512,monotonicity_candidate_pairs:131072,monotonicity_inclusion_premises:13122,submodularity_pairs:131072,polynomial_subset_terms:512,overlap_pair_checks:12,cross_relabelings:40320,cross_membership_checks:161280});
assert.equal(c.laws.same_tutte_polynomial,true);
assert.equal(c.laws.same_complete_element_degree_multiset,true);
assert.equal(c.laws.all_one_point_power_sum_moments_collide,true);
assert.equal(c.laws.total_pairwise_overlap_collides,true);
assert.equal(c.laws.relational_overlap_graph_degree_profile_separates,true);
assert.equal(c.laws.max_overlap_degree_repairs_declared_pair,true);
assert.equal(c.laws.exhaustive_cross_isomorphism_has_zero_matches,true);
assert.equal(c.laws.complete_matroid_classifier_claimed,false);
assert.equal(c.laws.physical_network_claimed,false);
assert.equal(c.laws.universal_moment_incompleteness_rate_claimed,false);
console.log('Ash A15-R0 Atlas marginal-relational incidence separation canonical tests passed.');