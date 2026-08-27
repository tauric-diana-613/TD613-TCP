import assert from 'node:assert/strict';

import {
  TWO_SEAM_FACTORIZATION_RECTANGLE_PARENT_RECEIPT,
  auditTwoSeamCustodyScheme,
  enumerateLiteralOneOneOneSplits,
  exactThreeTWord,
  marginalFirstSeamFiber,
  marginalSecondSeamFiber,
  powerAlignedTwoSeamWitness,
  predictedThreeFactorSplit,
  predictedTwoSeamRectangle,
  rectangleCompletenessCertificate,
  runTwoSeamFactorizationRectangleChamber,
  twoSeamCustodyRequirement,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-two-seam-factorization-rectangle.js';

assert.equal(
  TWO_SEAM_FACTORIZATION_RECTANGLE_PARENT_RECEIPT,
  '8a9b537e685eb3bebf0ef05308e7b3deb6809f38',
  'two-seam chamber must remain pinned to the #743 receipt',
);

const word = exactThreeTWord(2, 3, 4, 1);
assert.equal(word.status, 'TWO_SEAM_EXACT_THREE_T_WORD_DERIVED');
assert.deepEqual(
  word.word,
  ['Q', 'Q', 'T', 'Q', 'Q', 'Q', 'T', 'Q', 'Q', 'Q', 'Q', 'T', 'Q'],
);

const split = predictedThreeFactorSplit(2, 3, 4, 1, 2, 3);
assert.equal(split.status, 'TWO_SEAM_PREDICTED_1_PLUS_1_PLUS_1_SPLIT_DERIVED');
assert.deepEqual(split.seam, { i: 2, j: 3 });
assert.deepEqual(split.concatenated, word.word);
assert.deepEqual(
  { t: split.quotient_product.t, E: split.quotient_product.E, O: split.quotient_product.O },
  { t: 3, E: 6, O: 4 },
);
assert.equal(split.expected_product_rank, 5);
assert.equal((split.first_moment_coordinate.P - split.first_moment_coordinate.O) / 2, 5);

const rectangle = predictedTwoSeamRectangle(2, 3, 4, 1);
assert.equal(rectangle.status, 'EXACT_TWO_SEAM_FACTORIZATION_RECTANGLE_DERIVED');
assert.equal(rectangle.cardinality, 20);
assert.equal(rectangle.seam_coordinates_unique, true);
assert.equal(rectangle.rows.length, 20);

const literal = enumerateLiteralOneOneOneSplits(2, 3, 4, 1);
assert.equal(literal.status, 'LITERAL_1_PLUS_1_PLUS_1_SPLITS_ENUMERATED');
assert.equal(literal.cardinality, 20);
assert.ok(literal.rows.every((row) => row.passed));

const completeness = rectangleCompletenessCertificate(2, 3, 4, 1);
assert.equal(completeness.status, 'EXACT_TWO_SEAM_RECTANGLE_COMPLETENESS_WITNESSED');
assert.equal(completeness.predicted_cardinality, 20);
assert.equal(completeness.literal_cardinality, 20);
assert.equal(completeness.equal, true);

const requirement = twoSeamCustodyRequirement(2, 3, 4, 1);
assert.equal(requirement.status, 'EXACT_TWO_SEAM_CUSTODY_REQUIREMENT_DERIVED');
assert.equal(requirement.minimum_alphabet_cardinality, 20);
assert.equal(requirement.minimum_fixed_width_binary_bits, 5);
assert.equal(requirement.first_seam_alphabet_cardinality, 4);
assert.equal(requirement.first_seam_minimum_bits, 2);
assert.equal(requirement.second_seam_alphabet_cardinality, 5);
assert.equal(requirement.second_seam_minimum_bits, 3);

const exactRows = rectangle.rows.map((row) => ({ seam: row.seam, label: [row.seam.i, row.seam.j] }));
const exactAudit = auditTwoSeamCustodyScheme(2, 3, 4, 1, exactRows, 20);
assert.equal(exactAudit.exact, true);
assert.equal(exactAudit.classification, 'EXACT_TWO_SEAM_CUSTODY_SCHEME_WITNESSED');

const undersizedRows = predictedTwoSeamRectangle(0, 1, 1, 0).rows.map((row, index) => ({
  seam: row.seam,
  label: index % 3,
}));
const undersizedAudit = auditTwoSeamCustodyScheme(0, 1, 1, 0, undersizedRows, 3);
assert.equal(undersizedAudit.required_alphabet_size, 4);
assert.equal(undersizedAudit.undersized, true);
assert.ok(undersizedAudit.collisions.length >= 1);
assert.equal(undersizedAudit.exact, false);
assert.equal(
  undersizedAudit.classification,
  'EXACT_TWO_SEAM_RECOVERY_FORBIDDEN_BY_FINITE_CUSTODY_LOWER_BOUND',
);

const collisionRows = predictedTwoSeamRectangle(0, 1, 1, 0).rows.map((row, index) => ({
  seam: row.seam,
  label: index === 2 ? 1 : index,
}));
const collisionAudit = auditTwoSeamCustodyScheme(0, 1, 1, 0, collisionRows, 4);
assert.equal(collisionAudit.undersized, false);
assert.equal(collisionAudit.collisions.length, 1);
assert.equal(collisionAudit.exact, false);
assert.equal(
  collisionAudit.classification,
  'TWO_SEAM_CUSTODY_CAPACITY_OR_MAPPING_INSUFFICIENT_FOR_EXACT_RECOVERY',
);

const secondMarginal = marginalSecondSeamFiber(2, 3, 4, 1, 2);
assert.equal(secondMarginal.status, 'EXACT_SECOND_SEAM_MARGINAL_FIBER_DERIVED');
assert.equal(secondMarginal.cardinality, 5);
assert.ok(secondMarginal.rows.every((row) => row.seam.i === 2));

const firstMarginal = marginalFirstSeamFiber(2, 3, 4, 1, 3);
assert.equal(firstMarginal.status, 'EXACT_FIRST_SEAM_MARGINAL_FIBER_DERIVED');
assert.equal(firstMarginal.cardinality, 4);
assert.ok(firstMarginal.rows.every((row) => row.seam.j === 3));

for (const [p, q] of [[0, 0], [1, 2], [3, 3], [4, 2]]) {
  const witness = powerAlignedTwoSeamWitness(p, q);
  assert.equal(witness.status, 'POWER_ALIGNED_TWO_SEAM_ADDITIVE_WIDTH_WITNESS_DERIVED');
  assert.equal(witness.requirement.minimum_alphabet_cardinality, 2 ** (p + q));
  assert.equal(witness.requirement.minimum_fixed_width_binary_bits, p + q);
  assert.equal(witness.requirement.first_seam_minimum_bits, p);
  assert.equal(witness.requirement.second_seam_minimum_bits, q);
}

for (const [m, n, expected] of [[0, 0, 1], [0, 5, 6], [4, 0, 5]]) {
  const edgeRectangle = predictedTwoSeamRectangle(1, m, n, 2);
  const edgeLiteral = enumerateLiteralOneOneOneSplits(1, m, n, 2);
  assert.equal(edgeRectangle.cardinality, expected);
  assert.equal(edgeLiteral.cardinality, expected);
}

const assay = runTwoSeamFactorizationRectangleChamber();
assert.equal(assay.status, 'TWO_SEAM_FACTORIZATION_RECTANGLE_CHAMBER_PASSED');
assert.equal(assay.passed, true);
assert.equal(assay.certificates.symbolic_rectangle.passed, true);
assert.equal(assay.certificates.symbolic_product_state_invariance.passed, true);
assert.equal(assay.certificates.symbolic_custody.passed, true);
assert.equal(assay.certificates.finite_literal_enumeration.passed, true);
assert.equal(assay.certificates.undersized_alphabet_hostile.passed, true);
assert.equal(assay.certificates.capacity_without_injectivity_hostile.passed, true);
assert.equal(assay.certificates.marginal_seam_hostile.passed, true);
assert.equal(assay.certificates.power_aligned_width_hostile.passed, true);
assert.equal(assay.certificates.zero_run_edge_hostile.passed, true);
assert.equal(assay.certificates.flattened_word_seam_impersonation_hostile.passed, true);
assert.equal(
  assay.canonical_candidate,
  'THE_ORDERED_1_PLUS_1_PLUS_1_FACTORIZATION_FIBER_OF_Q^a_T_Q^m_T_Q^n_T_Q^f_IS_EXACTLY_THE_RECTANGLE_0_DOT_DOT_m_CROSS_0_DOT_DOT_n_WITH_CARDINALITY_(m+1)(n+1)',
);
assert.equal(
  assay.consequential_candidate,
  'TWO_ERASED_DECLARED_SEAMS_CAN_MULTIPLY_EXACT_BOUNDARY_AMBIGUITY_EVEN_WHEN_THE_COMPLETE_FLATTENED_AUTHORED_WORD_AND_FIRST_MOMENT_STATE_ARE_PRESERVED',
);
assert.equal(
  assay.architectural_candidate,
  'MULTI_SEAM_CUSTODY_IS_A_SEPARATE_COMPOSITION_RESOURCE_AND_POWER_ALIGNED_SEAM_WIDTHS_ADD_EXACTLY_FOR_JOINT_RECOVERY',
);

console.log('Ash A15-R0 two-seam factorization-rectangle tests passed.');
