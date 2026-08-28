import assert from 'node:assert/strict';

import {
  FACTORIZATION_BOUNDARY_NONRECOVERABILITY_PARENT_RECEIPT,
  auditFactorizationBoundaryScheme,
  decodeFactorizationBoundaryIndex,
  encodeFactorizationBoundaryIndex,
  fixedWidthBoundaryNonrecoverabilityWitness,
  minimumFactorizationBoundaryCustody,
  onePlusOneFactorizationFiber,
  recoverUniqueBoundaryFromExactProduct,
  runFactorizationBoundaryNonrecoverabilityChamber,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-factorization-boundary-nonrecoverability.js';

assert.equal(
  FACTORIZATION_BOUNDARY_NONRECOVERABILITY_PARENT_RECEIPT,
  '8556e0d417f55c3190d7be317ef738354cc38364',
  'factorization-boundary chamber must remain pinned to the #742 receipt',
);

const smallest = onePlusOneFactorizationFiber({ t: 2, E: 0, O: 1 }, 0);
assert.equal(smallest.status, 'EXACT_ONE_PLUS_ONE_QUOTIENT_FACTORIZATION_FIBER_DERIVED');
assert.equal(smallest.cardinality, 2);
assert.deepEqual(smallest.rows[0].left, { t: 1, E: 0, O: 0 });
assert.deepEqual(smallest.rows[0].right, { t: 1, E: 1, O: 0 });
assert.deepEqual(smallest.rows[1].left, { t: 1, E: 0, O: 1 });
assert.deepEqual(smallest.rows[1].right, { t: 1, E: 0, O: 0 });
assert.equal(smallest.distinct_pairs, true);
assert.equal(smallest.same_unsegmented_word, true);

const mixed = onePlusOneFactorizationFiber({ t: 2, E: 3, O: 4 }, 2);
assert.equal(mixed.status, 'EXACT_ONE_PLUS_ONE_QUOTIENT_FACTORIZATION_FIBER_DERIVED');
assert.equal(mixed.cardinality, 5);
assert.equal(mixed.rows.length, 5);
for (let k = 0; k <= 4; k += 1) {
  const row = mixed.rows[k];
  assert.equal(row.k, k);
  assert.deepEqual(row.left, { t: 1, E: 1, O: k });
  assert.deepEqual(row.right, { t: 1, E: 4 - k, O: 2 });
  assert.deepEqual(row.derived_product, { t: 2, E: 3, O: 4 });
  assert.equal(row.composed.output_R, 2);
  assert.equal(row.output_coordinate.P, 8);
}
assert.equal(mixed.same_unsegmented_word, true);
for (const row of mixed.rows) assert.deepEqual(row.unsegmented_word, mixed.common_unsegmented_word);

const invalidRank = onePlusOneFactorizationFiber({ t: 2, E: 3, O: 4 }, 4);
assert.equal(invalidRank.status, 'ONE_PLUS_ONE_FACTORIZATION_FIBER_ABSTAINS');

const req = minimumFactorizationBoundaryCustody({ t: 2, E: 3, O: 4 }, 2);
assert.equal(req.status, 'MINIMUM_FACTORIZATION_BOUNDARY_CUSTODY_REQUIREMENT_DERIVED');
assert.equal(req.boundary_cardinality, 5);
assert.equal(req.minimum_alphabet_cardinality, 5);
assert.equal(req.minimum_fixed_width_binary_bits, 3);

for (const row of mixed.rows) {
  const encoded = encodeFactorizationBoundaryIndex(mixed.product, mixed.R, row.left, row.right);
  assert.equal(encoded.status, 'FACTORIZATION_BOUNDARY_INDEX_ENCODED');
  assert.equal(encoded.K, row.k);
  const decoded = decodeFactorizationBoundaryIndex(mixed.product, mixed.R, encoded.K);
  assert.equal(decoded.status, 'FACTORIZATION_BOUNDARY_INDEX_DECODED');
  assert.deepEqual(decoded.left, row.left);
  assert.deepEqual(decoded.right, row.right);
}

const exactAudit = auditFactorizationBoundaryScheme(
  mixed.product,
  mixed.R,
  mixed.rows.map((row) => ({ K: row.k, label: row.k })),
  mixed.cardinality,
);
assert.equal(exactAudit.exact, true);
assert.equal(exactAudit.classification, 'EXACT_FACTORIZATION_BOUNDARY_CUSTODY_SCHEME_WITNESSED');

const undersizedAudit = auditFactorizationBoundaryScheme(
  { t: 2, E: 0, O: 2 },
  0,
  [
    { K: 0, label: 0 },
    { K: 1, label: 1 },
    { K: 2, label: 0 },
  ],
  2,
);
assert.equal(undersizedAudit.required_alphabet_size, 3);
assert.equal(undersizedAudit.undersized, true);
assert.ok(undersizedAudit.collisions.length >= 1);
assert.equal(undersizedAudit.exact, false);
assert.equal(
  undersizedAudit.classification,
  'EXACT_FACTORIZATION_BOUNDARY_RECOVERY_FORBIDDEN_BY_FINITE_CUSTODY_LOWER_BOUND',
);

const collisionAudit = auditFactorizationBoundaryScheme(
  { t: 2, E: 1, O: 2 },
  1,
  [
    { K: 0, label: 'A' },
    { K: 1, label: 'A' },
    { K: 2, label: 'C' },
  ],
  3,
);
assert.equal(collisionAudit.undersized, false);
assert.equal(collisionAudit.collisions.length, 1);
assert.equal(collisionAudit.exact, false);

const ambiguous = recoverUniqueBoundaryFromExactProduct({ t: 2, E: 0, O: 7 }, 0);
assert.equal(ambiguous.status, 'EXACT_PRODUCT_STATE_LEAVES_FACTORIZATION_BOUNDARY_AMBIGUOUS_ABSTAINS');
assert.equal(ambiguous.lawful_boundary_count, 8);

const unique = recoverUniqueBoundaryFromExactProduct({ t: 2, E: 4, O: 0 }, 3);
assert.equal(unique.status, 'UNIQUE_FACTORIZATION_BOUNDARY_RECOVERED_FROM_EXACT_PRODUCT_STATE');
assert.deepEqual(unique.left, { t: 1, E: 1, O: 0 });
assert.deepEqual(unique.right, { t: 1, E: 0, O: 3 });

for (let bits = 0; bits <= 10; bits += 1) {
  const witness = fixedWidthBoundaryNonrecoverabilityWitness(bits);
  assert.equal(witness.status, 'FINITE_FACTORIZATION_BOUNDARY_WIDTH_COUNTEREXAMPLE_DERIVED');
  assert.equal(witness.required_boundary_cardinality, 2 ** bits + 1);
  assert.equal(witness.minimum_boundary_bits, bits + 1);
}

const assay = runFactorizationBoundaryNonrecoverabilityChamber();
assert.equal(assay.status, 'FACTORIZATION_BOUNDARY_NONRECOVERABILITY_CHAMBER_PASSED');
assert.equal(assay.passed, true);
for (const certificate of Object.values(assay.certificates)) assert.equal(certificate.passed, true);
assert.equal(
  assay.canonical_candidate,
  'THE_EXACT_1_PLUS_1_QUOTIENT_FACTORIZATION_FIBER_OVER_LAWFUL_PRODUCT_STATE_((2,A,B),R)_HAS_CARDINALITY_B_PLUS_1_AND_IS_PARAMETERIZED_BY_K_IN_0_DOT_DOT_B',
);
assert.equal(
  assay.consequential_candidate,
  'EXACT_PRODUCT_FIRST_MOMENT_CUSTODY_CAN_LEAVE_ARBITRARILY_LARGE_FINITE_FACTORIZATION_BOUNDARY_AMBIGUITY_AND_NO_FIXED_FINITE_BOUNDARY_WIDTH_UNIVERSALLY_RECOVERS_IT',
);
assert.equal(
  assay.architectural_candidate,
  'OUTPUT_EXACTNESS_DOES_NOT_SUBSUME_DERIVATION_BOUNDARY_CUSTODY_SO_BOUNDARY_CLAIMS_REQUIRE_SEPARATE_WITNESSED_EVIDENCE',
);

console.log('Ash A15-R0 factorization-boundary nonrecoverability tests passed.');
