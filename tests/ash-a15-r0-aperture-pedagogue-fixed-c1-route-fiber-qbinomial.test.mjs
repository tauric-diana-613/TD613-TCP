import assert from 'node:assert/strict';

import {
  analyzeFixedC1State,
  auditFixedC1RouteCustody,
  enumerateFixedC1RouteFiber,
  fixedC1RouteCount,
  fixedC1RouteGeneratingPolynomial,
  gaussianRectanglePolynomial,
  runFixedC1RouteFiberQBinomialChamber,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-fixed-c1-route-fiber-qbinomial.js';

const chamber = runFixedC1RouteFiberQBinomialChamber();
assert.equal(chamber.status, 'FIXED_C1_ROUTE_FIBER_QBINOMIAL_CHAMBER_PASSED');
assert.equal(chamber.passed, true);

// Classical rectangle coefficient sanity: [4 choose 2]_q=1+q+2q^2+q^3+q^4.
const rectangle22 = gaussianRectanglePolynomial(2, 2);
assert.equal(rectangle22.status, 'GAUSSIAN_RECTANGLE_POLYNOMIAL_DERIVED');
assert.deepEqual(rectangle22.coefficients, ['1', '1', '2', '1', '1']);
assert.equal(rectangle22.value_at_one, '6');

// Inherited #733 hostile closes exactly at multiplicity two.
const wound = enumerateFixedC1RouteFiber(3, 1, 1, 3);
assert.equal(wound.status, 'FIXED_C1_ROUTE_FIBER_ENUMERATED');
assert.equal(wound.predicted_route_count, '2');
assert.deepEqual(
  wound.rows.map((row) => row.derived.route.word.join('')).sort(),
  ['QTTTQ', 'TQTQT'],
);
assert.deepEqual(
  wound.rows.map((row) => row.blocks).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
  [[0, 1, 1, 0], [1, 0, 0, 1]],
);

const generating311 = fixedC1RouteGeneratingPolynomial(3, 1, 1);
assert.equal(generating311.status, 'FIXED_C1_ROUTE_GENERATING_POLYNOMIAL_DERIVED');
assert.deepEqual(generating311.product_coefficients, ['1', '2', '1']);
assert.equal(generating311.total_route_count, '4');

const count3113 = fixedC1RouteCount(3, 1, 1, 3);
assert.equal(count3113.route_count, '2');
assert.equal(count3113.minimum_fixed_width_binary_bits, 1);

// Exact route labels are tight; capacity without injectivity is insufficient.
const exactRows = wound.rows.map((row) => ({ blocks: row.blocks, label: row.route_rank }));
const exactAudit = auditFixedC1RouteCustody(3, 1, 1, 3, exactRows, 2);
assert.equal(exactAudit.exact, true);

const collisionRows = wound.rows.map((row) => ({ blocks: row.blocks, label: 0 }));
const collisionAudit = auditFixedC1RouteCustody(3, 1, 1, 3, collisionRows, 2);
assert.equal(collisionAudit.undersized, false);
assert.equal(collisionAudit.collisions.length, 1);
assert.equal(collisionAudit.exact, false);

const undersizedAudit = auditFixedC1RouteCustody(3, 1, 1, 3, collisionRows, 1);
assert.equal(undersizedAudit.undersized, true);
assert.equal(undersizedAudit.exact, false);

// Edge laws, including the pre-freeze t=0 row-shape repair.
const t0Fiber = enumerateFixedC1RouteFiber(0, 12, 0, 0);
assert.equal(fixedC1RouteCount(0, 12, 0, 0).route_count, '1');
assert.equal(fixedC1RouteCount(0, 12, 0, 0).minimum_fixed_width_binary_bits, 0);
assert.equal(t0Fiber.status, 'FIXED_C1_ROUTE_FIBER_ENUMERATED');
assert.equal(t0Fiber.rows.length, 1);
assert.deepEqual(t0Fiber.rows[0].blocks, [12]);
assert.equal(t0Fiber.rows[0].derived.route.word.join(''), 'Q'.repeat(12));
assert.equal(fixedC1RouteCount(1, 5, 9, 9).route_count, '1');
assert.equal(fixedC1RouteCount(1, 5, 9, 9).minimum_fixed_width_binary_bits, 0);
assert.equal(analyzeFixedC1State(3, 1, 1, 2).lawful, false);
assert.equal(analyzeFixedC1State(3, 1, 1, 9).lawful, false);

// A slightly larger exact stratum: compare coefficient directly.
const poly = fixedC1RouteGeneratingPolynomial(5, 2, 2);
assert.equal(poly.status, 'FIXED_C1_ROUTE_GENERATING_POLYNOMIAL_DERIVED');
for (let R = 0; R < poly.product_coefficients.length; R += 1) {
  const P = 2 + (2 * R);
  const count = fixedC1RouteCount(5, 2, 2, P);
  assert.equal(count.status, 'FIXED_C1_ROUTE_COUNT_DERIVED');
  assert.equal(count.route_count, poly.product_coefficients[R]);
}

assert.equal(
  chamber.canonical_candidate,
  'THE_FIXED_C1_AUTHORED_ROUTE_WORD_FIBER_HAS_EXACT_CARDINALITY_EQUAL_TO_THE_q^R_COEFFICIENT_OF_[E+a_CHOOSE_E]_q_[O+b_CHOOSE_O]_q',
);
assert.equal(
  chamber.architectural_candidate,
  'COMPLETE_AUTHORED_ROUTE_CUSTODY_IS_A_SEPARATE_FINITE_RESOURCE_ABOVE_C1_AND_BELOW_ANY_CLAIM_OF_REAL_WORLD_PROVENANCE',
);

console.log('Ash A15-R0 fixed-C1 route-fiber q-binomial tests passed.');