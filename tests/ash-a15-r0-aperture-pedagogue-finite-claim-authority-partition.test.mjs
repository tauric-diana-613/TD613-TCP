import assert from 'node:assert/strict';

import {
  FINITE_CLAIM_AUTHORITY_PARTITION_SCHEMA,
  FINITE_CLAIM_AUTHORITY_PARTITION_PARENT_RECEIPT,
  finiteClaimAuthorityProfile,
  classifyClaimAuthority,
  auditAuthorityClassifier,
  binaryUniversalClaimAudit,
  bridgeRouteErasureToClaimAuthority,
  runFiniteClaimAuthorityPartitionChamber,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-finite-claim-authority-partition.js';

assert.equal(FINITE_CLAIM_AUTHORITY_PARTITION_SCHEMA, 'td613.a15-r0.finite-claim-authority-partition/v0.1');
assert.equal(FINITE_CLAIM_AUTHORITY_PARTITION_PARENT_RECEIPT, '11eec2d52c7e1aa722e8664c0df4cd1a61d704f1');

const rows = [
  { antecedent: 'a', quotient: 'y', support: [0, 1] },
  { antecedent: 'b', quotient: 'y', support: [0, 2] },
];
const ambient = [0, 1, 2, 3];
const profile = finiteClaimAuthorityProfile(rows, 'y', ambient);
assert.equal(profile.status, 'EXACT_FINITE_CLAIM_AUTHORITY_PARTITION_DERIVED');
assert.deepEqual(profile.universally_admissible, [0]);
assert.deepEqual(profile.conditioning_dependent, [1, 2]);
assert.deepEqual(profile.universally_inadmissible, [3]);
assert.equal(profile.minimum_exact_authority_label_count, 3);
assert.equal(profile.binary_universal_claim_error_minimum, 2);
assert.equal(profile.binary_error_minimum_equals_irreducible_gap, true);
assert.equal(profile.exact_partition, true);
assert.equal(profile.exact_universal_semantics, true);

assert.equal(classifyClaimAuthority(rows, 'y', ambient, 0).authority, 'UNIVERSALLY_ADMISSIBLE');
assert.equal(classifyClaimAuthority(rows, 'y', ambient, 1).authority, 'CONDITIONING_DEPENDENT');
assert.equal(classifyClaimAuthority(rows, 'y', ambient, 2).authority, 'CONDITIONING_DEPENDENT');
assert.equal(classifyClaimAuthority(rows, 'y', ambient, 3).authority, 'UNIVERSALLY_INADMISSIBLE');

const ternary = auditAuthorityClassifier(rows, 'y', ambient, [
  { value: 0, label: 'ALL' },
  { value: 1, label: 'DEPENDENT' },
  { value: 2, label: 'DEPENDENT' },
  { value: 3, label: 'NONE' },
]);
assert.equal(ternary.status, 'AUTHORITY_CLASSIFIER_AUDITED');
assert.equal(ternary.universal_authority_exact, true);
assert.equal(ternary.labels_used, 3);
assert.equal(ternary.reaches_theoretical_minimum, true);

const binaryCollapse = auditAuthorityClassifier(rows, 'y', ambient, [
  { value: 0, label: 'YES' },
  { value: 1, label: 'YES' },
  { value: 2, label: 'NO' },
  { value: 3, label: 'NO' },
]);
assert.equal(binaryCollapse.universal_authority_exact, false);
assert.equal(binaryCollapse.labels_used, 2);

const binarySemantic = binaryUniversalClaimAudit(rows, 'y', ambient, [
  { value: 0, claim: 'UNIVERSALLY_ADMISSIBLE' },
  { value: 1, claim: 'UNIVERSALLY_ADMISSIBLE' },
  { value: 2, claim: 'UNIVERSALLY_INADMISSIBLE' },
  { value: 3, claim: 'UNIVERSALLY_INADMISSIBLE' },
]);
assert.equal(binarySemantic.status, 'BINARY_UNIVERSAL_CLAIM_AUDITED');
assert.equal(binarySemantic.false_universal_claims, 2);
assert.equal(binarySemantic.lower_bound, 2);
assert.equal(binarySemantic.tight, true);

// Any additional wrong universal claim increases the error beyond the irreducible gap.
const worseBinary = binaryUniversalClaimAudit(rows, 'y', ambient, [
  { value: 0, claim: 'UNIVERSALLY_INADMISSIBLE' },
  { value: 1, claim: 'UNIVERSALLY_ADMISSIBLE' },
  { value: 2, claim: 'UNIVERSALLY_INADMISSIBLE' },
  { value: 3, claim: 'UNIVERSALLY_INADMISSIBLE' },
]);
assert.equal(worseBinary.false_universal_claims, 3);
assert.equal(worseBinary.lower_bound_respected, true);
assert.equal(worseBinary.tight, false);

// Exact descent collapses the mixed region and only two authority classes remain.
const exactRows = [
  { antecedent: 'a', quotient: 'y', support: [0, 1] },
  { antecedent: 'b', quotient: 'y', support: [0, 1] },
];
const exactProfile = finiteClaimAuthorityProfile(exactRows, 'y', [0, 1, 2]);
assert.equal(exactProfile.conditioning_dependent_cardinality, 0);
assert.equal(exactProfile.minimum_exact_authority_label_count, 2);
assert.equal(exactProfile.binary_universal_claim_error_minimum, 0);

// A single nonempty class needs one label, not three by ritual.
const allRows = [
  { antecedent: 'a', quotient: 'y', support: [0, 1] },
  { antecedent: 'b', quotient: 'y', support: [0, 1] },
];
const allProfile = finiteClaimAuthorityProfile(allRows, 'y', [0, 1]);
assert.equal(allProfile.minimum_exact_authority_label_count, 1);
assert.equal(allProfile.universally_admissible_cardinality, 2);
assert.equal(allProfile.universally_inadmissible_cardinality, 0);
assert.equal(allProfile.conditioning_dependent_cardinality, 0);

// Ambient set must contain every antecedent-lawful value; absent values cannot be silently erased.
assert.equal(
  finiteClaimAuthorityProfile(rows, 'y', [0, 1, 3]).status,
  'FINITE_CLAIM_AUTHORITY_AMBIENT_DOES_NOT_CONTAIN_ALL_ANTECEDENT_SUPPORT',
);
assert.equal(
  finiteClaimAuthorityProfile(rows, 'unoccupied', ambient).status,
  'UNOCCUPIED_QUOTIENT_STATE_HAS_NO_CLAIM_AUTHORITY',
);
assert.equal(
  classifyClaimAuthority(rows, 'y', ambient, 99).status,
  'CLAIM_AUTHORITY_VALUE_OUTSIDE_DECLARED_AMBIENT',
);

// #751 route-erasure hostile remains an exact instance when an explicit ambient is supplied.
const routeAmbient = [
  [0, 0, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 2, 0],
  [0, 0, 3, 0],
  [1, 0, 0, 0],
  [1, 0, 1, 0],
  [9, 9, 9, 9],
];
const routeBridge = bridgeRouteErasureToClaimAuthority(5, 0, 3, 9, routeAmbient);
assert.equal(routeBridge.status, 'ROUTE_ERASURE_IS_EXACT_INSTANCE_OF_FINITE_CLAIM_AUTHORITY_PARTITION');
assert.equal(routeBridge.authority.conditioning_dependent_cardinality, 4);
assert.equal(routeBridge.authority.universally_admissible_cardinality, 2);
assert.equal(routeBridge.authority.universally_inadmissible_cardinality, 1);
assert.equal(routeBridge.authority.binary_universal_claim_error_minimum, 4);

const chamber = runFiniteClaimAuthorityPartitionChamber();
assert.equal(chamber.status, 'FINITE_CLAIM_AUTHORITY_PARTITION_CHAMBER_PASSED');
assert.equal(chamber.passed, true);
assert.equal(chamber.certificates.symbolic.passed, true);
assert.equal(chamber.certificates.three_region_hostile.passed, true);
assert.equal(chamber.certificates.exact_descent_control.passed, true);
assert.equal(chamber.certificates.ambient_and_unoccupied_discipline.passed, true);
assert.equal(chamber.certificates.inherited_751_752_bridge.passed, true);

console.log('Ash A15-R0 finite claim-authority partition tests passed.');
