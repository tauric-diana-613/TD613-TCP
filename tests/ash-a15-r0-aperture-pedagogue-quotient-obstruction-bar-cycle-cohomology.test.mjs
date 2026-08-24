import assert from 'node:assert/strict';

import {
  QUOTIENT_OBSTRUCTION_BAR_CYCLE_COHOMOLOGY_PARENT_RECEIPT,
  Q_COORDINATE,
  T_COORDINATE,
  boundaryOfBar2Chain,
  normalizedOneCoboundary,
  pairTwoCochainWithBarChain,
  relationBarCycle,
  runQuotientObstructionBarCycleCohomologyAssay,
  swappedTransportCocycle,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-quotient-obstruction-bar-cycle-cohomology.js';
import {
  transportIncrementCocycle,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-affine-transport-increment-cocycle.js';

assert.equal(
  QUOTIENT_OBSTRUCTION_BAR_CYCLE_COHOMOLOGY_PARENT_RECEIPT,
  '6bc000024f02e5780910ee24694561d5dc542003',
  'The cohomology chamber must remain pinned to the #734 receipt head.',
);

const cycle = relationBarCycle();
assert.equal(cycle.passed, true, 'The preregistered TTQ=QTT relation chain must be a bar 2-cycle.');
assert.deepEqual(cycle.TTQ, { t: 2, E: 1, O: 0 }, 'TTQ must land at the frozen #729 quotient coordinate.');
assert.deepEqual(cycle.QTT, { t: 2, E: 1, O: 0 }, 'QTT must land at the same frozen #729 quotient coordinate.');
assert.deepEqual(cycle.boundary.terms, [], 'The explicit relation chain must have exactly zero bar boundary.');

const omegaPairing = pairTwoCochainWithBarChain(transportIncrementCocycle, cycle.chain);
assert.equal(omegaPairing.value, 2, 'The witnessed transport cocycle must pair to exactly +2 with the relation cycle.');

const swappedPairing = pairTwoCochainWithBarChain(swappedTransportCocycle, cycle.chain);
assert.equal(swappedPairing.value, -2, 'The swapped directed cocycle must pair to exactly -2 with the same cycle.');

for (const phi of [
  (x) => x.t * x.t + x.E + x.O,
  (x) => (3 * x.t) - (2 * x.E) + (5 * x.O),
]) {
  const dphi = (x, y) => normalizedOneCoboundary(phi, x, y);
  assert.equal(
    pairTwoCochainWithBarChain(dphi, cycle.chain).value,
    0,
    'Every concrete normalized coboundary control must annihilate the relation cycle.',
  );
}

const fake = [
  { coefficient: 1, left: T_COORDINATE, right: Q_COORDINATE, label: '[T|Q]' },
  { coefficient: -1, left: Q_COORDINATE, right: T_COORDINATE, label: '-[Q|T]' },
];
assert.equal(boundaryOfBar2Chain(fake).is_cycle, false, 'A merely order-reversed pair must not be promoted to a cycle when its boundary is nonzero.');

const assay = runQuotientObstructionBarCycleCohomologyAssay();
assert.equal(assay.passed, true, JSON.stringify(assay, null, 2));
assert.equal(
  assay.canonical_classification,
  'QUOTIENT_DESCENT_FAILURE_OF_ROUTE_PRIMITIVE_YIELDS_EXPLICIT_NONZERO_INFINITE_ORDER_NORMALIZED_MONOID_H2_CLASS_DETECTED_BY_FINITE_BAR_2_CYCLE',
);
assert.equal(
  assay.secondary_classification,
  'EXPLICIT_BAR_RELATION_2_CYCLE_PAIRS_TO_TWO_WITH_TRANSPORT_COCYCLE_AND_IS_NONBOUNDARY_IN_DECLARED_INTEGER_BAR_COMPLEX',
);
assert.equal(
  assay.upstairs_classification,
  'PULLED_BACK_TRANSPORT_COCYCLE_IS_EXACT_ON_FREE_ROUTE_MONOID_WHILE_ITS_PRIMITIVE_FAILS_TARGET_QUOTIENT_DESCENT',
);
assert.equal(assay.cohomology_obstruction.omega_pairing.value, 2);
assert.equal(assay.primitive_descent_failure.P_left, 2);
assert.equal(assay.primitive_descent_failure.P_right, 0);
assert.equal(assay.primitive_descent_failure.s_left, -2);
assert.equal(assay.primitive_descent_failure.s_right, 0);
assert.equal(
  Object.is(assay.primitive_descent_failure.s_right, 0),
  true,
  'The integer-valued route primitive must emit canonical +0 rather than IEEE-754 negative zero.',
);
assert.equal(assay.swapped_directed_class_relation.omega_pairing, 2);
assert.equal(assay.swapped_directed_class_relation.swapped_pairing, -2);
assert.equal(assay.fake_cycle_rejection.passed, true);
assert.equal(assay.parity_fragile_quarantine.passed, true);
assert.notEqual(assay.parity_fragile_quarantine.defect_T_T_Q, 0);
assert.equal(assay.coefficient_boundary.integer_pairing, 2);
assert.equal(assay.coefficient_boundary.reduction_mod_2_of_this_detector, 0);
assert.equal(assay.receipt_externality.passed, true);

for (const n of [-11, -3, -1, 1, 2, 9]) {
  assert.notEqual(2 * n, 0, 'The integer pairing detects every nonzero tested multiple without horizon inference.');
}

assert.ok(
  assay.claim_ceiling.includes('BAR_2_CYCLE_NOT_OPERATIONAL_NONIDENTITY_LOOP'),
  'The bar-cycle result must remain quarantined from an operational loop promotion.',
);
assert.ok(
  assay.claim_ceiling.includes('NO_HIGHER_MOMENT_COMPLETENESS_OR_ASYMPTOTIC_HIERARCHY'),
  'The chamber must explicitly quarantine asymptotic or infinite-hierarchy promotion.',
);

console.log('A15-R0 quotient-obstruction bar-cycle cohomology tests passed.');
