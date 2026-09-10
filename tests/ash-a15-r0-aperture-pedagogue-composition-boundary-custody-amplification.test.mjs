import assert from 'node:assert/strict';

import {
  COMPOSITION_BOUNDARY_CUSTODY_AMPLIFICATION_PARENT_RECEIPT,
  boundaryErasureExpansion,
  composeFirstMomentRanks,
  compositionBoundaryOffset,
  constructFactorizedRouteForOutputRank,
  factorizationConditionedRankSpectrum,
  fixedWidthCompositionNonclosureWitness,
  runCompositionBoundaryCustodyAmplificationChamber,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-composition-boundary-custody-amplification.js';

assert.equal(
  COMPOSITION_BOUNDARY_CUSTODY_AMPLIFICATION_PARENT_RECEIPT,
  '5415eafb5da59beba68fcffc83475d04c19db1d4',
  'composition-boundary chamber must remain pinned to the #741 receipt',
);

// Exact affine rank transport: even-left and odd-left cases.
const evenLeft = { t: 2, E: 1, O: 2 };
const oddLeft = { t: 3, E: 1, O: 2 };
const right = { t: 2, E: 3, O: 4 };
assert.equal(compositionBoundaryOffset(evenLeft, right), 7);
assert.equal(compositionBoundaryOffset(oddLeft, right), 11);

const evenComposed = composeFirstMomentRanks(evenLeft, 0, right, 1);
assert.equal(evenComposed.status, 'AFFINE_FIRST_MOMENT_RANK_COMPOSITION_DERIVED');
assert.equal(evenComposed.output_R, 8);

const oddComposed = composeFirstMomentRanks(oddLeft, 1, right, 1);
assert.equal(oddComposed.status, 'AFFINE_FIRST_MOMENT_RANK_COMPOSITION_DERIVED');
assert.equal(oddComposed.output_R, 13);

// Odd-left +G term must survive.
const oddGLeft = { t: 1, E: 0, O: 0 };
const oddGRight = { t: 1, E: 0, O: 3 };
assert.equal(compositionBoundaryOffset(oddGLeft, oddGRight), 3);
const oddGComposed = composeFirstMomentRanks(oddGLeft, 0, oddGRight, 0);
assert.equal(oddGComposed.output_R, 3);

// Exact factorization-conditioned spectrum and constructive no-gap witness.
const factorLeft = { t: 3, E: 2, O: 1 };
const factorRight = { t: 2, E: 1, O: 2 };
const conditioned = factorizationConditionedRankSpectrum(factorLeft, factorRight);
assert.equal(conditioned.status, 'EXACT_FACTORIZATION_CONDITIONED_FIRST_MOMENT_RANK_SPECTRUM_DERIVED');
assert.ok(conditioned.cardinality > 2);
assert.deepEqual(
  conditioned.values,
  Array.from({ length: conditioned.cardinality }, (_, i) => conditioned.min + i),
);
for (const R of conditioned.values) {
  const witness = constructFactorizedRouteForOutputRank(factorLeft, factorRight, R);
  assert.equal(witness.status, 'FACTORIZATION_CONDITIONED_OUTPUT_RANK_ROUTE_CONSTRUCTED');
  assert.equal(witness.output_R, R);
}

// Lower omitted tail.
const lowerExpansion = boundaryErasureExpansion(
  { t: 2, E: 0, O: 0 },
  { t: 1, E: 1, O: 0 },
);
assert.equal(lowerExpansion.status, 'EXACT_COMPOSITION_BOUNDARY_ERASURE_EXPANSION_DERIVED');
assert.equal(lowerExpansion.lower_omitted_tail_cardinality, 1);
assert.equal(lowerExpansion.upper_omitted_tail_cardinality, 0);
assert.equal(lowerExpansion.conditioned.min, 1);
assert.equal(lowerExpansion.full_rank_min, 0);

// Upper omitted tail.
const upperExpansion = boundaryErasureExpansion(
  { t: 1, E: 1, O: 0 },
  { t: 1, E: 0, O: 0 },
);
assert.equal(upperExpansion.status, 'EXACT_COMPOSITION_BOUNDARY_ERASURE_EXPANSION_DERIVED');
assert.equal(upperExpansion.lower_omitted_tail_cardinality, 0);
assert.equal(upperExpansion.upper_omitted_tail_cardinality, 1);
assert.equal(upperExpansion.conditioned.cardinality, 1);
assert.equal(upperExpansion.full_rank_cardinality, 2);

// Every finite sampled width: two zero-bit inputs leave D_b after composition.
for (let bits = 0; bits <= 10; bits += 1) {
  const witness = fixedWidthCompositionNonclosureWitness(bits);
  assert.equal(witness.status, 'FINITE_FIXED_WIDTH_COMPOSITION_NONCLOSURE_WITNESS_DERIVED');
  assert.equal(witness.left_requirement.minimum_fixed_width_binary_bits, 0);
  assert.equal(witness.right_requirement.minimum_fixed_width_binary_bits, 0);
  assert.equal(witness.product_requirement.minimum_fixed_width_binary_bits, bits + 1);
  assert.equal(witness.left_admissibility_at_b.admissible, true);
  assert.equal(witness.right_admissibility_at_b.admissible, true);
  assert.equal(witness.product_admissibility_at_b.admissible, false);
  assert.equal(witness.boundary_expansion.conditioned.cardinality, 1);
  assert.equal(witness.boundary_expansion.full_rank_cardinality, 2 ** bits + 1);
  assert.equal(witness.boundary_expansion.boundary_expansion_rank_candidates, 2 ** bits);
}

const assay = runCompositionBoundaryCustodyAmplificationChamber();
assert.equal(assay.status, 'COMPOSITION_BOUNDARY_CUSTODY_AMPLIFICATION_CHAMBER_PASSED');
assert.equal(assay.passed, true);
for (const certificate of Object.values(assay.certificates)) assert.equal(certificate.passed, true);
assert.equal(
  assay.canonical_candidate,
  'FIRST_MOMENT_RANK_COMPOSES_AFFINELY_WITH_EXACT_BOUNDARY_OFFSET_AND_RETAINED_FACTORIZATION_DEFINES_A_STRICTLY_SMALLER_CONDITIONED_LIFT_SPECTRUM_WHEN_BOUNDARY_EXPANSION_IS_POSITIVE',
);
assert.equal(
  assay.consequential_candidate,
  'FOR_EVERY_FINITE_WIDTH_b_TWO_ZERO_ADDITIONAL_CUSTODY_INPUTS_CAN_COMPOSE_TO_AN_OUTPUT_REQUIRING_b_PLUS_1_BITS_SO_NO_D_b_IS_COMPOSITION_CLOSED',
);
assert.equal(
  assay.architectural_candidate,
  'COMPOSITION_MUST_REVALIDATE_OR_WIDEN_CUSTODY_BECAUSE_LOCAL_INPUT_TRUTHFULNESS_DOES_NOT_INHERIT_TO_A_BOUNDARY_ERASED_OUTPUT',
);

console.log('Ash A15-R0 composition-boundary custody amplification tests passed.');
