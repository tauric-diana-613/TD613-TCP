import assert from 'node:assert/strict';

import {
  FINITE_ADMISSIBILITY_DESCENT_THEOREM_PARENT_RECEIPT,
  auditFiniteSurvivingSupport,
  bridgeRouteErasureToFiniteAdmissibility,
  finiteAdmissibilityDescentProfile,
  finiteMinimalDistortionChoice,
  materializeExactDescendedRule,
  runFiniteAdmissibilityDescentTheoremChamber,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-finite-admissibility-descent-theorem.js';

assert.equal(
  FINITE_ADMISSIBILITY_DESCENT_THEOREM_PARENT_RECEIPT,
  'b9a0d13e43d80f59769788da31d87951ec8ea8ee',
);

const exactRows = [
  { antecedent: 'a', quotient: 'y', support: [0, 1] },
  { antecedent: 'b', quotient: 'y', support: [1, 0] },
  { antecedent: 'c', quotient: 'z', support: [2] },
];
const exactProfile = finiteAdmissibilityDescentProfile(exactRows);
assert.equal(exactProfile.status, 'FINITE_ADMISSIBILITY_DESCENT_PROFILE_DERIVED');
assert.equal(exactProfile.exact_descended_rule_exists, true);
assert.equal(exactProfile.support_constant_on_every_occupied_fiber, true);
assert.equal(exactProfile.all_irreducible_gaps_empty, true);
assert.deepEqual(exactProfile.occupied_fibers.map((fiber) => fiber.irreducible_gap_cardinality), [0, 0]);

const exactRule = materializeExactDescendedRule(exactRows);
assert.equal(exactRule.status, 'EXACT_FINITE_DESCENDED_ADMISSIBILITY_RULE_MATERIALIZED');
assert.equal(exactRule.unoccupied_quotient_states_receive_no_rule, true);

const disjointRows = [
  { antecedent: 'a', quotient: 'y', support: [0] },
  { antecedent: 'b', quotient: 'y', support: [1] },
];
const disjoint = finiteAdmissibilityDescentProfile(disjointRows);
assert.equal(disjoint.exact_descended_rule_exists, false);
assert.equal(disjoint.occupied_fibers[0].union_cardinality, 2);
assert.equal(disjoint.occupied_fibers[0].intersection_cardinality, 0);
assert.equal(disjoint.occupied_fibers[0].irreducible_gap_cardinality, 2);
assert.equal(materializeExactDescendedRule(disjointRows).status, 'EXACT_DESCENDED_RULE_FORBIDDEN_BY_NONCONSTANT_FIBER_SUPPORTS');

for (const candidate of [[], [0], [1], [0, 1]]) {
  const audit = auditFiniteSurvivingSupport(disjointRows, 'y', candidate);
  assert.equal(audit.status, 'FINITE_SURVIVING_SUPPORT_AUDITED');
  assert.equal(audit.discrepancy_score, 2);
  assert.equal(audit.gap_lower_bound, 2);
  assert.equal(audit.exact_gap_identity_witnessed, true);
  assert.equal(audit.achieves_gap_lower_bound, true);
  assert.equal(audit.inside_minimal_envelope, true);
  assert.equal(audit.exact_sound_and_complete, false);
}

const overlapRows = [
  { antecedent: 'a', quotient: 'y', support: [0, 1] },
  { antecedent: 'b', quotient: 'y', support: [1, 2] },
];
const overlap = finiteAdmissibilityDescentProfile(overlapRows);
const overlapFiber = overlap.occupied_fibers[0];
assert.deepEqual(overlapFiber.union_support, [0, 1, 2]);
assert.deepEqual(overlapFiber.intersection_support, [1]);
assert.deepEqual(overlapFiber.irreducible_gap, [0, 2]);
assert.equal(overlapFiber.irreducible_gap_cardinality, 2);

const intersectionAudit = auditFiniteSurvivingSupport(overlapRows, 'y', [1]);
assert.equal(intersectionAudit.universally_sound, true);
assert.equal(intersectionAudit.universally_complete, false);
assert.equal(intersectionAudit.false_admission_cardinality, 0);
assert.equal(intersectionAudit.omission_cardinality, 2);
assert.equal(intersectionAudit.discrepancy_score, 2);

const unionAudit = auditFiniteSurvivingSupport(overlapRows, 'y', [0, 1, 2]);
assert.equal(unionAudit.universally_complete, true);
assert.equal(unionAudit.universally_sound, false);
assert.equal(unionAudit.false_admission_cardinality, 2);
assert.equal(unionAudit.omission_cardinality, 0);
assert.equal(unionAudit.discrepancy_score, 2);

const middleAudit = auditFiniteSurvivingSupport(overlapRows, 'y', [0, 1]);
assert.equal(middleAudit.false_admission_cardinality, 1);
assert.equal(middleAudit.omission_cardinality, 1);
assert.equal(middleAudit.discrepancy_score, 2);
assert.equal(middleAudit.equality_iff_between_intersection_and_union, true);

const outsideAudit = auditFiniteSurvivingSupport(overlapRows, 'y', [0, 1, 2, 3]);
assert.equal(outsideAudit.outside_union_cardinality, 1);
assert.equal(outsideAudit.discrepancy_score, 3);
assert.equal(outsideAudit.gap_lower_bound, 2);
assert.equal(outsideAudit.achieves_gap_lower_bound, false);
assert.equal(outsideAudit.exact_gap_identity_rhs, 3);

const belowAudit = auditFiniteSurvivingSupport(overlapRows, 'y', [0]);
assert.equal(belowAudit.omitted_intersection_cardinality, 1);
assert.equal(belowAudit.discrepancy_score, 3);
assert.equal(belowAudit.achieves_gap_lower_bound, false);
assert.equal(belowAudit.exact_gap_identity_rhs, 3);

const frontier = finiteMinimalDistortionChoice(overlapRows, 'y', [0]);
assert.equal(frontier.status, 'FINITE_MINIMAL_DISTORTION_CHOICE_DERIVED');
assert.deepEqual(frontier.candidate_support, [0, 1]);
assert.deepEqual(frontier.admitted_gap_partition, [0]);
assert.deepEqual(frontier.omitted_gap_partition, [2]);
assert.equal(frontier.false_admission_cardinality, 1);
assert.equal(frontier.omission_cardinality, 1);
assert.equal(frontier.discrepancy_score, 2);

const emptyAudit = auditFiniteSurvivingSupport(
  [{ antecedent: 'a', quotient: 'occupied', support: [0] }],
  'unoccupied',
  [],
);
assert.equal(emptyAudit.status, 'UNOCCUPIED_QUOTIENT_STATE_HAS_NO_DESCENT_AUTHORITY');

const mixedRows = [
  { antecedent: 'a', quotient: 'good', support: [0, 1] },
  { antecedent: 'b', quotient: 'good', support: [1, 0] },
  { antecedent: 'c', quotient: 'bad', support: [2] },
  { antecedent: 'd', quotient: 'bad', support: [3] },
];
const mixed = finiteAdmissibilityDescentProfile(mixedRows);
assert.equal(mixed.exact_descended_rule_exists, false);
assert.equal(mixed.occupied_fibers.find((fiber) => fiber.quotient === 'good').irreducible_gap_cardinality, 0);
assert.equal(mixed.occupied_fibers.find((fiber) => fiber.quotient === 'bad').irreducible_gap_cardinality, 2);

const equalCardinalityUnequalSupport = finiteAdmissibilityDescentProfile([
  { antecedent: 'a', quotient: 'y', support: [0, 1] },
  { antecedent: 'b', quotient: 'y', support: [1, 2] },
]);
assert.deepEqual(equalCardinalityUnequalSupport.occupied_fibers[0].antecedent_supports.map((row) => row.support_cardinality), [2, 2]);
assert.equal(equalCardinalityUnequalSupport.exact_descended_rule_exists, false);

const inherited = bridgeRouteErasureToFiniteAdmissibility(5, 0, 3, 9);
assert.equal(inherited.status, 'ROUTE_ERASURE_IS_EXACT_INSTANCE_OF_FINITE_ADMISSIBILITY_DESCENT');
assert.equal(inherited.general_profile.exact_descended_rule_exists, false);
assert.equal(inherited.general_profile.occupied_fibers[0].union_cardinality, 6);
assert.equal(inherited.general_profile.occupied_fibers[0].intersection_cardinality, 2);
assert.equal(inherited.general_profile.occupied_fibers[0].irreducible_gap_cardinality, 4);

const inheritedPositive = bridgeRouteErasureToFiniteAdmissibility(3, 0, 1, 1);
assert.equal(inheritedPositive.status, 'ROUTE_ERASURE_IS_EXACT_INSTANCE_OF_FINITE_ADMISSIBILITY_DESCENT');
assert.equal(inheritedPositive.general_profile.exact_descended_rule_exists, true);
assert.equal(inheritedPositive.general_profile.occupied_fibers[0].irreducible_gap_cardinality, 0);

const chamber = runFiniteAdmissibilityDescentTheoremChamber();
assert.equal(chamber.status, 'FINITE_ADMISSIBILITY_DESCENT_THEOREM_CHAMBER_PASSED');
assert.equal(chamber.passed, true);
for (const [name, certificate] of Object.entries(chamber.certificates)) {
  assert.equal(certificate.passed, true, `certificate failed: ${name}`);
}
assert.equal(
  chamber.canonical_candidate,
  'FINITE_ADMISSIBILITY_DESCENDS_EXACTLY_THROUGH_A_FINITE_QUOTIENT_IF_AND_ONLY_IF_THE_ANTECEDENT_LAWFUL_SUPPORT_MAP_IS_CONSTANT_ON_EVERY_QUOTIENT_FIBER',
);
assert.equal(chamber.landing.irreducible_gap_must_remain_visible, true);
assert.equal(chamber.landing.minimal_distortion_does_not_choose_a_unique_surviving_rule, true);

console.log('Ash A15-R0 finite admissibility descent theorem tests passed.');
