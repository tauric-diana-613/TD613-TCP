import assert from 'node:assert/strict';

import {
  ALL_FINITE_SEAM_HYPERRECTANGLE_PARENT_RECEIPT,
  allFiniteSeamCustodyRequirement,
  auditAllFiniteSeamCustodyScheme,
  decodeSeamVectorMixedRadix,
  encodeSeamVectorMixedRadix,
  exactFiniteTWord,
  hyperrectangleCompletenessCertificate,
  powerAlignedAllFiniteSeamWitness,
  predictedLinearSegmentation,
  predictedSeamHyperrectangle,
  residualSeamFiberCardinality,
  runAllFiniteSeamHyperrectangleChamber,
  seamHyperrectangleCardinality,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-all-finite-seam-hyperrectangle.js';

assert.equal(
  ALL_FINITE_SEAM_HYPERRECTANGLE_PARENT_RECEIPT,
  '3babfbea1952c54619a19571a112b472e9d80d89',
  '#745 must remain pinned to the #744 receipt',
);

// r=1: empty seam product has one segmentation and zero additional seam bits.
const oneFactorWord = exactFiniteTWord([4, 7]);
assert.equal(oneFactorWord.status, 'ALL_FINITE_EXACT_TQ_WORD_DERIVED');
assert.equal(oneFactorWord.factor_count, 1);
assert.equal(seamHyperrectangleCardinality([4, 7]), 1);
const oneFactorHyper = predictedSeamHyperrectangle([4, 7]);
assert.equal(oneFactorHyper.status, 'EXACT_ALL_FINITE_LINEAR_SEAM_HYPERRECTANGLE_DERIVED');
assert.equal(oneFactorHyper.cardinality, 1);
assert.deepEqual(oneFactorHyper.rows[0].seams, []);
const oneFactorReq = allFiniteSeamCustodyRequirement([4, 7]);
assert.equal(oneFactorReq.minimum_alphabet_cardinality, 1);
assert.equal(oneFactorReq.minimum_fixed_width_binary_bits, 0);

// #744 reduction: r=3 gives the exact two-seam rectangle cardinality.
const q744 = [2, 3, 4, 1];
const h744 = predictedSeamHyperrectangle(q744);
assert.equal(h744.cardinality, (3 + 1) * (4 + 1));
assert.equal(h744.rows.length, 20);
assert.ok(h744.rows.some((row) => row.seams[0] === 3 && row.seams[1] === 4));
assert.equal(hyperrectangleCompletenessCertificate(q744).status, 'EXACT_ALL_FINITE_HYPERRECTANGLE_COMPLETENESS_WITNESSED');

// Three seams: exact box cardinality and one explicit endpoint segmentation.
const qBox = [1, 2, 3, 4, 2];
const box = predictedSeamHyperrectangle(qBox);
assert.equal(box.status, 'EXACT_ALL_FINITE_LINEAR_SEAM_HYPERRECTANGLE_DERIVED');
assert.equal(box.cardinality, 3 * 4 * 5);
assert.equal(box.seam_count, 3);
const endpoint = predictedLinearSegmentation(qBox, [2, 3, 4]);
assert.equal(endpoint.status, 'ALL_FINITE_PREDICTED_ONE_T_PER_FACTOR_SEGMENTATION_DERIVED');
assert.equal(endpoint.factors.length, 4);
assert.ok(endpoint.factors.every((factor) => factor.filter((g) => g === 'T').length === 1));

// Mixed-radix coordinate is a bijection over the full seam fiber.
const encodedLabels = new Set();
for (const row of box.rows) {
  const encoded = encodeSeamVectorMixedRadix(qBox, row.seams);
  assert.equal(encoded.status, 'ALL_FINITE_SEAM_VECTOR_MIXED_RADIX_ENCODED');
  assert.ok(encoded.rank >= 0 && encoded.rank < box.cardinality);
  encodedLabels.add(encoded.rank);
  const decoded = decodeSeamVectorMixedRadix(qBox, encoded.rank);
  assert.equal(decoded.status, 'ALL_FINITE_SEAM_VECTOR_MIXED_RADIX_DECODED');
  assert.deepEqual(decoded.seams, row.seams);
}
assert.equal(encodedLabels.size, box.cardinality);
assert.equal(decodeSeamVectorMixedRadix(qBox, box.cardinality).status, 'MIXED_RADIX_SEAM_DECODER_LABEL_OUTSIDE_LAWFUL_ALPHABET');

// Partial seam custody removes exactly the retained radices from the residual product.
assert.equal(residualSeamFiberCardinality(qBox, []).residual_cardinality, 3 * 4 * 5);
assert.equal(residualSeamFiberCardinality(qBox, [0]).residual_cardinality, 4 * 5);
assert.equal(residualSeamFiberCardinality(qBox, [1]).residual_cardinality, 3 * 5);
assert.equal(residualSeamFiberCardinality(qBox, [2]).residual_cardinality, 3 * 4);
assert.equal(residualSeamFiberCardinality(qBox, [0, 2]).residual_cardinality, 4);
assert.equal(residualSeamFiberCardinality(qBox, [0, 1, 2]).residual_cardinality, 1);
assert.equal(residualSeamFiberCardinality(qBox, [0, 0]).status, 'RESIDUAL_SEAM_FIBER_RETAINED_INDEX_ABSTAINS');

// Exact finite custody is tight; undersized or colliding maps fail.
const exactRows = box.rows.map((row) => {
  const encoded = encodeSeamVectorMixedRadix(qBox, row.seams);
  return { seams: row.seams, label: encoded.rank };
});
const exactAudit = auditAllFiniteSeamCustodyScheme(qBox, exactRows, box.cardinality);
assert.equal(exactAudit.exact, true);
assert.equal(exactAudit.classification, 'EXACT_ALL_FINITE_SEAM_CUSTODY_SCHEME_WITNESSED');

const undersizedRows = box.rows.map((row, index) => ({ seams: row.seams, label: index % (box.cardinality - 1) }));
const undersizedAudit = auditAllFiniteSeamCustodyScheme(qBox, undersizedRows, box.cardinality - 1);
assert.equal(undersizedAudit.undersized, true);
assert.equal(undersizedAudit.exact, false);
assert.equal(undersizedAudit.classification, 'EXACT_ALL_FINITE_SEAM_RECOVERY_FORBIDDEN_BY_FINITE_CUSTODY_LOWER_BOUND');

const collisionRows = exactRows.map((row, index) => ({ ...row, label: index === 2 ? 1 : row.label }));
const collisionAudit = auditAllFiniteSeamCustodyScheme(qBox, collisionRows, box.cardinality);
assert.equal(collisionAudit.undersized, false);
assert.equal(collisionAudit.collisions.length, 1);
assert.equal(collisionAudit.exact, false);
assert.equal(collisionAudit.classification, 'ALL_FINITE_SEAM_CUSTODY_CAPACITY_OR_MAPPING_INSUFFICIENT_FOR_EXACT_RECOVERY');

// Zero-length internal runs contribute one seam position, not zero.
assert.equal(seamHyperrectangleCardinality([3, 0, 0, 4]), 1);
assert.equal(seamHyperrectangleCardinality([3, 0, 5, 4]), 6);
assert.equal(hyperrectangleCompletenessCertificate([1, 0, 2, 0]).status, 'EXACT_ALL_FINITE_HYPERRECTANGLE_COMPLETENESS_WITNESSED');

// Power-aligned finite family has exact additive fixed-width seam custody.
for (const bits of [[], [0], [1], [1, 2], [2, 1, 3], [3, 0, 2, 1]]) {
  const witness = powerAlignedAllFiniteSeamWitness(bits);
  assert.equal(witness.status, 'POWER_ALIGNED_ALL_FINITE_SEAM_ADDITIVE_WIDTH_WITNESS_DERIVED');
  assert.equal(witness.requirement.minimum_fixed_width_binary_bits, bits.reduce((sum, value) => sum + value, 0));
}

const chamber = runAllFiniteSeamHyperrectangleChamber();
assert.equal(chamber.status, 'ALL_FINITE_LINEAR_SEAM_HYPERRECTANGLE_CHAMBER_PASSED');
assert.equal(chamber.passed, true);
assert.equal(chamber.certificates.symbolic_hyperrectangle.passed, true);
assert.equal(chamber.certificates.symbolic_custody.passed, true);
assert.equal(chamber.certificates.finite_literal_corroboration.passed, true);
assert.equal(chamber.certificates.mixed_radix_round_trip_hostile.passed, true);
assert.equal(chamber.certificates.partial_custody_residual_hostile.passed, true);
assert.equal(chamber.certificates.undersized_custody_hostile.passed, true);
assert.equal(chamber.certificates.capacity_without_injectivity_hostile.passed, true);
assert.equal(chamber.certificates.reduction_to_744_hostile.passed, true);
assert.equal(chamber.certificates.power_aligned_additive_width_hostile.passed, true);
assert.equal(chamber.certificates.flattened_word_seam_impersonation_hostile.passed, true);

assert.equal(
  chamber.canonical_candidate,
  'THE_ALL_FINITE_ORDERED_ONE_T_PER_FACTOR_SEGMENTATION_FIBER_OF_Q^a0_T_Q^a1_T_..._T_Q^ar_IS_EXACTLY_THE_HYPERRECTANGLE_PRODUCT_j_1_TO_r_MINUS_1_0_DOT_DOT_a_j',
);
assert.equal(
  chamber.consequential_candidate,
  'FINITE_LINEAR_SEAM_AMBIGUITY_MULTIPLIES_ACROSS_INTERNAL_Q_RUNS_EVEN_WHEN_THE_COMPLETE_FLATTENED_AUTHORED_WORD_AND_FIRST_MOMENT_STATE_ARE_EXACTLY_PRESERVED',
);
assert.equal(
  chamber.architectural_candidate,
  'ALL_FINITE_LINEAR_SEAM_CUSTODY_HAS_EXACT_PRODUCT_CARDINALITY_MIXED_RADIX_RECOVERY_AND_POWER_ALIGNED_FIXED_WIDTHS_ADD_WITHOUT_PROMOTING_TO_GENERAL_WORKFLOW_PROVENANCE',
);

console.log('Ash A15-R0 all-finite linear seam hyperrectangle tests passed.');
