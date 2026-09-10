import assert from 'node:assert/strict';

import {
  FIXED_WIDTH_CUSTODY_ADMISSIBILITY_FRONTIER_PARENT_RECEIPT,
  decodeFirstMomentFixedWidth,
  encodeFirstMomentFixedWidth,
  fixedWidthCapacity,
  fixedWidthCustodyAdmissibility,
  fixedWidthRoundTripCertificate,
  runFixedWidthCustodyAdmissibilityFrontierChamber,
  universalFixedWidthCounterexample,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-fixed-width-custody-admissibility-frontier.js';

assert.equal(
  FIXED_WIDTH_CUSTODY_ADMISSIBILITY_FRONTIER_PARENT_RECEIPT,
  '76e3726ba58f7b4b5594c0a41557e26d58e4b62a',
  'fixed-width frontier chamber must remain pinned to the #740 receipt',
);

assert.equal(fixedWidthCapacity(0), 1);
assert.equal(fixedWidthCapacity(1), 2);
assert.equal(fixedWidthCapacity(2), 4);
assert.equal(fixedWidthCapacity(5), 32);
assert.equal(fixedWidthCapacity(-1), null);
assert.equal(fixedWidthCapacity(53), null);

for (const { bits, inside, outside, insideN, outsideN } of [
  { bits: 0, inside: { t: 2, E: 0, O: 0 }, outside: { t: 2, E: 1, O: 0 }, insideN: 1, outsideN: 2 },
  { bits: 1, inside: { t: 2, E: 1, O: 0 }, outside: { t: 2, E: 2, O: 0 }, insideN: 2, outsideN: 3 },
  { bits: 2, inside: { t: 2, E: 3, O: 0 }, outside: { t: 2, E: 4, O: 0 }, insideN: 4, outsideN: 5 },
  { bits: 3, inside: { t: 2, E: 7, O: 0 }, outside: { t: 2, E: 8, O: 0 }, insideN: 8, outsideN: 9 },
]) {
  const inAudit = fixedWidthCustodyAdmissibility(inside, bits);
  const outAudit = fixedWidthCustodyAdmissibility(outside, bits);
  assert.equal(inAudit.status, 'FIXED_WIDTH_FIRST_MOMENT_CUSTODY_ADMISSIBILITY_CLASSIFIED');
  assert.equal(inAudit.admissible, true);
  assert.equal(inAudit.lift_cardinality, insideN);
  assert.equal(outAudit.status, 'FIXED_WIDTH_FIRST_MOMENT_CUSTODY_ADMISSIBILITY_CLASSIFIED');
  assert.equal(outAudit.admissible, false);
  assert.equal(outAudit.lift_cardinality, outsideN);
}

const mixedInside = fixedWidthCustodyAdmissibility({ t: 3, E: 1, O: 2 }, 2);
assert.equal(mixedInside.M, 3);
assert.equal(mixedInside.lift_cardinality, 4);
assert.equal(mixedInside.admissible, true);

const mixedOutside = fixedWidthCustodyAdmissibility({ t: 3, E: 2, O: 2 }, 2);
assert.equal(mixedOutside.M, 4);
assert.equal(mixedOutside.lift_cardinality, 5);
assert.equal(mixedOutside.admissible, false);

const roundTripBase = { t: 3, E: 1, O: 2 };
const roundTrip = fixedWidthRoundTripCertificate(roundTripBase, 2);
assert.equal(roundTrip.status, 'FIXED_WIDTH_EXACT_FIRST_MOMENT_ROUND_TRIP_WITNESSED');
assert.equal(roundTrip.injective, true);
assert.equal(roundTrip.rows.length, 4);
assert.equal(roundTrip.unused_label_count, 0);
for (const row of roundTrip.rows) {
  assert.equal(row.passed, true);
  assert.equal(row.encoded.label.length, 2);
  assert.equal(row.decoded.P, row.P);
}

const sparseBase = { t: 2, E: 1, O: 0 };
const sparse = fixedWidthCustodyAdmissibility(sparseBase, 2);
assert.equal(sparse.admissible, true);
assert.equal(sparse.lift_cardinality, 2);
const p0 = encodeFirstMomentFixedWidth(sparseBase, 0, 2);
const p2 = encodeFirstMomentFixedWidth(sparseBase, 2, 2);
assert.equal(p0.label, '00');
assert.equal(p2.label, '01');
assert.equal(decodeFirstMomentFixedWidth(sparseBase, '00', 2).P, 0);
assert.equal(decodeFirstMomentFixedWidth(sparseBase, '01', 2).P, 2);
assert.equal(
  decodeFirstMomentFixedWidth(sparseBase, '10', 2).status,
  'FIXED_WIDTH_LABEL_UNUSED_FOR_THIS_BASE_ABSTAINS',
);
assert.equal(
  decodeFirstMomentFixedWidth(sparseBase, '11', 2).status,
  'FIXED_WIDTH_LABEL_UNUSED_FOR_THIS_BASE_ABSTAINS',
);

const forbiddenBase = { t: 2, E: 2, O: 0 };
assert.equal(
  encodeFirstMomentFixedWidth(forbiddenBase, 0, 1).status,
  'FIXED_WIDTH_EXACT_FIRST_MOMENT_ENCODING_FORBIDDEN_OUTSIDE_ADMISSIBILITY_DOMAIN',
);
assert.equal(
  decodeFirstMomentFixedWidth(forbiddenBase, '0', 1).status,
  'FIXED_WIDTH_EXACT_FIRST_MOMENT_DECODING_FORBIDDEN_OUTSIDE_ADMISSIBILITY_DOMAIN',
);

for (let bits = 0; bits <= 10; bits += 1) {
  const witness = universalFixedWidthCounterexample(bits);
  assert.equal(witness.status, 'FINITE_FIXED_WIDTH_UNIVERSALITY_COUNTEREXAMPLE_DERIVED');
  assert.deepEqual(witness.base, { t: 2, E: 2 ** bits, O: 0 });
  assert.equal(witness.label_capacity, 2 ** bits);
  assert.equal(witness.required_lift_cardinality, 2 ** bits + 1);
  assert.equal(witness.admissibility.admissible, false);
}

for (const bits of [0, 1, 2, 4]) {
  const lawfulT0 = fixedWidthCustodyAdmissibility({ t: 0, E: 25, O: 0 }, bits);
  assert.equal(lawfulT0.admissible, true);
  assert.equal(lawfulT0.lift_cardinality, 1);
}
assert.equal(
  fixedWidthCustodyAdmissibility({ t: 0, E: 25, O: 1 }, 4).status,
  'FIRST_MOMENT_LIFT_SPECTRUM_BASE_NOT_ROUTE_REALIZABLE',
);

const chamber = runFixedWidthCustodyAdmissibilityFrontierChamber();
assert.equal(chamber.status, 'FIXED_WIDTH_CUSTODY_ADMISSIBILITY_FRONTIER_CHAMBER_PASSED');
assert.equal(chamber.passed, true);
assert.equal(chamber.certificates.symbolic_frontier.passed, true);
assert.equal(chamber.certificates.symbolic_universal_impossibility.passed, true);
assert.equal(chamber.certificates.finite_grid_corroboration.passed, true);
assert.equal(chamber.certificates.sharp_boundary_hostile.passed, true);
assert.equal(chamber.certificates.mixed_boundary_hostile.passed, true);
assert.equal(chamber.certificates.off_by_one_frontier_hostile.passed, true);
assert.equal(chamber.certificates.unused_label_hostile.passed, true);
assert.equal(chamber.certificates.collision_laundering_hostile.passed, true);
assert.equal(chamber.certificates.t_zero_route_realizability_hostile.passed, true);
assert.equal(chamber.certificates.complete_route_impersonation_hostile.passed, true);
assert.equal(
  chamber.candidate_classification,
  'FIXED_b_BIT_FIRST_MOMENT_CUSTODY_IS_EXACTLY_ADMISSIBLE_ON_THE_SHARP_DOMAIN_N_x_LE_2_POW_b',
);
assert.equal(
  chamber.consequential_candidate,
  'NO_FINITE_GLOBALLY_FIXED_BINARY_CUSTODY_WIDTH_CAN_UNIVERSALLY_PRESERVE_EXACT_FIRST_MOMENT_HISTORY_OVER_ALL_ROUTE_REALIZABLE_BASES',
);

console.log('Ash A15-R0 fixed-width custody admissibility-frontier tests passed.');
