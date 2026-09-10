import assert from 'node:assert/strict';

import {
  MINIMUM_FIRST_MOMENT_CUSTODY_BOUND_PARENT_RECEIPT,
  auditCustodyScheme,
  decodeFirstMomentRank,
  encodeFirstMomentRank,
  minimumCustodyRequirement,
  rankCustodyScheme,
  runMinimumFirstMomentCustodyBoundAssay,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-minimum-first-moment-custody-bound.js';

assert.equal(
  MINIMUM_FIRST_MOMENT_CUSTODY_BOUND_PARENT_RECEIPT,
  'ffa5756d63f10fa6dc211e4cb07f38fbdc4bee0a',
  'minimum-custody chamber must remain pinned to the #739 receipt',
);

const n3 = minimumCustodyRequirement({ t: 2, E: 2, O: 0 });
assert.equal(n3.status, 'MINIMUM_FIRST_MOMENT_CUSTODY_REQUIREMENT_DERIVED');
assert.equal(n3.lift_cardinality, 3);
assert.equal(n3.minimum_alphabet_cardinality, 3);
assert.equal(n3.minimum_fixed_width_binary_bits, 2);
assert.equal(n3.zero_additional_binary_payload, false);

const n4 = minimumCustodyRequirement({ t: 3, E: 2, O: 1 });
assert.equal(n4.lift_cardinality, 4);
assert.equal(n4.minimum_fixed_width_binary_bits, 2);

const n8 = minimumCustodyRequirement({ t: 4, E: 2, O: 3 });
assert.equal(n8.lift_cardinality, 8);
assert.equal(n8.minimum_fixed_width_binary_bits, 3);

for (const base of [
  { t: 0, E: 9, O: 0 },
  { t: 1, E: 7, O: 8 },
  { t: 2, E: 0, O: 9 },
  { t: 5, E: 0, O: 0 },
]) {
  const req = minimumCustodyRequirement(base);
  assert.equal(req.lift_cardinality, 1);
  assert.equal(req.minimum_alphabet_cardinality, 1);
  assert.equal(req.minimum_fixed_width_binary_bits, 0);
  assert.equal(req.zero_additional_binary_payload, true);
}

const nontrivialBase = { t: 5, E: 2, O: 3 };
const scheme = rankCustodyScheme(nontrivialBase);
assert.equal(scheme.status, 'TIGHT_FIRST_MOMENT_RANK_CUSTODY_SCHEME_DERIVED');
assert.equal(scheme.rows.length, scheme.declared_alphabet_size);
assert.ok(scheme.rows.length > 1);
for (const row of scheme.rows) {
  assert.equal(row.round_trip, true);
  const encoded = encodeFirstMomentRank(nontrivialBase, row.P);
  const decoded = decodeFirstMomentRank(nontrivialBase, encoded.R);
  assert.equal(encoded.status, 'FIRST_MOMENT_RANK_ENCODED');
  assert.equal(decoded.status, 'FIRST_MOMENT_RANK_DECODED');
  assert.equal(decoded.P, row.P);
}

const exactAudit = auditCustodyScheme(
  nontrivialBase,
  scheme.rows.map((row) => ({ P: row.P, label: row.label })),
  scheme.declared_alphabet_size,
);
assert.equal(exactAudit.exact, true);
assert.equal(exactAudit.classification, 'EXACT_FIRST_MOMENT_CUSTODY_SCHEME_WITNESSED');

const undersizedAudit = auditCustodyScheme(
  { t: 2, E: 2, O: 0 },
  [
    { P: 0, label: 0 },
    { P: 2, label: 1 },
    { P: 4, label: 0 },
  ],
  2,
);
assert.equal(undersizedAudit.required_alphabet_size, 3);
assert.equal(undersizedAudit.undersized, true);
assert.ok(undersizedAudit.collisions.length >= 1);
assert.equal(undersizedAudit.exact, false);
assert.equal(
  undersizedAudit.classification,
  'EXACT_FIRST_MOMENT_RECOVERY_FORBIDDEN_BY_FINITE_CUSTODY_LOWER_BOUND',
);

const enoughCapacityButCollision = auditCustodyScheme(
  { t: 2, E: 2, O: 0 },
  [
    { P: 0, label: 'A' },
    { P: 2, label: 'A' },
    { P: 4, label: 'C' },
  ],
  3,
);
assert.equal(enoughCapacityButCollision.undersized, false);
assert.equal(enoughCapacityButCollision.collisions.length, 1);
assert.equal(enoughCapacityButCollision.exact, false);
assert.equal(
  enoughCapacityButCollision.classification,
  'FIRST_MOMENT_CUSTODY_CAPACITY_OR_MAPPING_INSUFFICIENT_FOR_EXACT_RECOVERY',
);

const assay = runMinimumFirstMomentCustodyBoundAssay();
assert.equal(assay.status, 'MINIMUM_FIRST_MOMENT_CUSTODY_BOUND_ASSAY_PASSED');
assert.equal(assay.passed, true);
assert.equal(assay.symbolic_lower_bound.passed, true);
assert.equal(assay.finite_grid_corroboration.passed, true);
assert.equal(assay.pigeonhole_collision_hostile.passed, true);
assert.equal(assay.off_by_one_bit_hostile.passed, true);
assert.equal(assay.capacity_not_injectivity_hostile.passed, true);
assert.equal(assay.rank_tightness_hostile.passed, true);
assert.equal(assay.zero_bit_locus_hostile.passed, true);
assert.equal(assay.complete_route_impersonation_hostile.passed, true);
assert.equal(assay.raw_P_control.passed, true);
assert.equal(assay.receipt_externality_hostile.passed, true);
assert.equal(
  assay.canonical_candidate,
  'EXACT_FIRST_MOMENT_RECOVERY_OVER_FIXED_BASE_REQUIRES_AND_ADMITS_A_MINIMUM_CUSTODY_ALPHABET_EQUAL_TO_THE_ROUTE_REALIZABLE_LIFT_MULTIPLICITY',
);
assert.equal(
  assay.consequential_candidate,
  'UNDERSIZED_CUSTODY_CHANNELS_ARE_FINITE_CERTIFICATES_OF_NONRECOVERABILITY_WHILE_THE_RANK_COORDINATE_GIVES_A_TIGHT_DATA_MINIMIZING_RECOVERY_SCHEME',
);

console.log('Ash A15-R0 minimum first-moment custody-bound tests passed.');
