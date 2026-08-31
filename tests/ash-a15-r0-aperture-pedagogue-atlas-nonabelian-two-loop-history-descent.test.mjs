import assert from 'node:assert/strict';
import {
  ATLAS_NONABELIAN_TWO_LOOP_HISTORY_DESCENT_SCHEMA,
  atlasNonabelianTwoLoopHistoryDescentCertificate,
} from '../app/dome-world/previews/a15-r0/atlas-nonabelian-two-loop-history-descent.js';

const certificate=atlasNonabelianTwoLoopHistoryDescentCertificate();

assert.equal(ATLAS_NONABELIAN_TWO_LOOP_HISTORY_DESCENT_SCHEMA,'td613.dome-world.atlas-nonabelian-two-loop-history-descent/v0.1');
assert.equal(certificate.parent_receipt,'34d55447a798c24599bc84402ceef2ce29849247');
assert.equal(certificate.parent_exact,true);
assert.equal(certificate.passed,true);

assert.equal(certificate.transport_group.size,8);
assert.equal(certificate.transport_group.bijective_elements,8);
assert.equal(certificate.transport_group.inverse_failures,0);
assert.equal(certificate.transport_group.A_order,2);
assert.equal(certificate.transport_group.B_order,2);
assert.equal(certificate.transport_group.AB_order,4);
assert.equal(certificate.transport_group.noncommuting_ordered_pairs,24);
assert.equal(certificate.transport_group.classification,'D8');

assert.equal(certificate.abelianization.commutator_checks,64);
assert.equal(certificate.abelianization.derived_subgroup_size,2);
assert.equal(certificate.abelianization.coset_count,4);
assert.equal(certificate.abelianization.well_defined_checks,64);
assert.equal(certificate.abelianization.well_defined_failures,0);
assert.equal(certificate.abelianization.commutativity_failures,0);
assert.equal(certificate.abelianization.nonidentity_order_two_classes,3);
assert.equal(certificate.abelianization.classification,'C2xC2');

assert.equal(certificate.receivers.exact_word.global_classes,'INFINITE');
assert.equal(certificate.receivers.holonomy.classes,8);
assert.equal(certificate.receivers.abelianized.classes,4);
assert.equal(certificate.receivers.visible.classes,1);

assert.deepEqual(certificate.hostile_window.length_counts,[1,4,12,36,108]);
assert.equal(certificate.hostile_window.words,161);
assert.equal(certificate.hostile_window.holonomy_classes,8);
assert.equal(certificate.hostile_window.abelianized_classes,4);
assert.equal(certificate.hostile_window.visible_classes,1);
assert.deepEqual(certificate.hostile_window.holonomy_population_multiset,[33,32,28,28,12,12,8,8]);
assert.deepEqual(certificate.hostile_window.abelianized_population_multiset,[65,56,20,20]);

assert.equal(certificate.pair_census.unordered_distinct_word_pairs,12880);
assert.equal(certificate.pair_census.same_holonomy_pairs,1968);
assert.equal(certificate.pair_census.same_abelianized_pairs,4000);
assert.equal(certificate.pair_census.same_abelianized_different_holonomy_pairs,2032);
assert.equal(certificate.pair_census.different_abelianized_pairs,8880);
assert.equal(certificate.pair_census.same_holonomy_future_group_continuation_checks,15744);
assert.equal(certificate.pair_census.same_holonomy_future_mismatches,0);

assert.equal(certificate.strict_witnesses.word_to_holonomy.strict,true);
assert.equal(certificate.strict_witnesses.holonomy_to_abelianized.strict,true);
assert.equal(certificate.strict_witnesses.abelianized_to_visible.strict,true);
assert.equal(certificate.laws.two_loop_holonomy_image_nonabelian_D8,true);
assert.equal(certificate.laws.abelianization_C2xC2,true);
assert.equal(certificate.laws.strict_receiver_chain,true);
assert.equal(certificate.laws.same_holonomy_stable_under_future_group_continuation,true);

assert.equal(certificate.membranes.includes('FREE_GROUP_LOOP_WORD != LIVE_ROUTE_HISTORY'),true);
assert.equal(certificate.membranes.includes('D8_CLASSIFICATION != PHYSICAL_DIHEDRAL_SYMMETRY'),true);
assert.equal(certificate.membranes.includes('GROUP_ABELIANIZATION != INFORMATION_THEORETIC_COMPRESSION'),true);
assert.equal(certificate.membranes.includes('FINITE_WORD_WINDOW != PROOF_BY_SAMPLING'),true);

console.log('Ash A15-R0 Atlas nonabelian two-loop history descent tests passed.');
