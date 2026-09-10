import assert from 'node:assert/strict';

import {
  auditFixedC1JointCustody,
  decodeFixedC1JointRank,
  encodeFixedC1JointRank,
  enumerateFixedC1JointFiber,
  fixedC1JointCount,
  fixedC1JointGeneratingPolynomial,
  jointFromSeamSplitVector,
  routeConditionalSeamCardinality,
  runFixedC1JointRouteSeamFiberChamber,
  seamSplitParityPolynomial,
  seamSplitSlotWeights,
  seamSplitVectorFromJoint,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-fixed-c1-joint-route-seam-fiber.js';

const chamber = runFixedC1JointRouteSeamFiberChamber();
assert.equal(chamber.status, 'FIXED_C1_JOINT_ROUTE_SEAM_FIBER_CHAMBER_PASSED');
assert.equal(chamber.passed, true);

// Every parity receives exactly t seam-split slots: endpoints once, internal blocks twice.
for (let t = 1; t <= 8; t += 1) {
  for (const parity of [0, 1]) {
    const slots = seamSplitSlotWeights(t, parity);
    assert.equal(slots.status, 'JOINT_ROUTE_SEAM_SLOT_WEIGHTS_DERIVED');
    assert.equal(slots.slot_count, t);
  }
}

// Inherited wound: exact joint polynomial and exact coefficient five.
const woundPoly = fixedC1JointGeneratingPolynomial(3, 1, 1);
assert.equal(woundPoly.status, 'FIXED_C1_JOINT_GENERATING_POLYNOMIAL_DERIVED');
assert.deepEqual(woundPoly.product_coefficients, ['2', '5', '2']);
assert.equal(woundPoly.total_joint_fixed_base_count, '9');

const woundCount = fixedC1JointCount(3, 1, 1, 3);
assert.equal(woundCount.status, 'FIXED_C1_JOINT_COUNT_DERIVED');
assert.equal(woundCount.joint_count, '5');
assert.equal(woundCount.minimum_fixed_width_binary_bits, 3);

const woundFiber = enumerateFixedC1JointFiber(3, 1, 1, 3);
assert.equal(woundFiber.status, 'FIXED_C1_JOINT_FIBER_ENUMERATED');
assert.equal(woundFiber.rows.length, 5);

const byRoute = new Map();
for (const row of woundFiber.rows) {
  const k = JSON.stringify(row.blocks);
  byRoute.set(k, (byRoute.get(k) ?? 0) + 1);
}
assert.equal(byRoute.get(JSON.stringify([0, 1, 1, 0])), 4);
assert.equal(byRoute.get(JSON.stringify([1, 0, 0, 1])), 1);

// Same local seam vector lives beneath two distinct routes.
const zeroZero = woundFiber.rows.filter((row) => JSON.stringify(row.seams) === JSON.stringify([0, 0]));
assert.equal(zeroZero.length, 2);
assert.equal(new Set(zeroZero.map((row) => JSON.stringify(row.blocks))).size, 2);

// Seam-split bijection round trip.
for (const row of woundFiber.rows) {
  const split = seamSplitVectorFromJoint(row.blocks, row.seams);
  assert.equal(split.status, 'SEAM_SPLIT_VECTOR_DERIVED');
  assert.equal(split.split_vector.length, 6);
  const restored = jointFromSeamSplitVector(3, split.split_vector);
  assert.equal(restored.status, 'JOINT_FROM_SEAM_SPLIT_VECTOR_DERIVED');
  assert.deepEqual(restored.blocks, row.blocks);
  assert.deepEqual(restored.seams, row.seams);
}

// Route-conditioned seam burden is nonuniform inside one fixed C1 fiber.
assert.equal(routeConditionalSeamCardinality([0, 1, 1, 0]).cardinality, '4');
assert.equal(routeConditionalSeamCardinality([1, 0, 0, 1]).cardinality, '1');

// Exact joint rank is a reversible label, not priority.
for (const row of woundFiber.rows) {
  const encoded = encodeFixedC1JointRank(3, 1, 1, 3, row.blocks, row.seams);
  assert.equal(encoded.status, 'FIXED_C1_JOINT_RANK_ENCODED');
  const decoded = decodeFixedC1JointRank(3, 1, 1, 3, encoded.joint_rank);
  assert.equal(decoded.status, 'FIXED_C1_JOINT_RANK_DECODED');
  assert.deepEqual(decoded.blocks, row.blocks);
  assert.deepEqual(decoded.seams, row.seams);
}
assert.equal(decodeFixedC1JointRank(3, 1, 1, 3, '5').status, 'FIXED_C1_JOINT_RANK_DECODER_LABEL_OUTSIDE_LAWFUL_ALPHABET');

// Tight custody and hostile capacity/collision cases.
const exactRows = woundFiber.rows.map((row) => ({ blocks: row.blocks, seams: row.seams, label: row.joint_rank }));
const exactAudit = auditFixedC1JointCustody(3, 1, 1, 3, exactRows, 5);
assert.equal(exactAudit.exact, true);

const collisionRows = woundFiber.rows.map((row, index) => ({
  blocks: row.blocks,
  seams: row.seams,
  label: index === 4 ? '3' : String(index),
}));
const collisionAudit = auditFixedC1JointCustody(3, 1, 1, 3, collisionRows, 5);
assert.equal(collisionAudit.undersized, false);
assert.equal(collisionAudit.collisions.length, 1);
assert.equal(collisionAudit.exact, false);

const undersizedRows = woundFiber.rows.map((row, index) => ({
  blocks: row.blocks,
  seams: row.seams,
  label: String(index % 4),
}));
const undersizedAudit = auditFixedC1JointCustody(3, 1, 1, 3, undersizedRows, 4);
assert.equal(undersizedAudit.undersized, true);
assert.equal(undersizedAudit.exact, false);

// t=0 and t=1 edges are singleton joint fibers.
assert.equal(fixedC1JointCount(0, 12, 0, 0).joint_count, '1');
assert.equal(enumerateFixedC1JointFiber(0, 12, 0, 0).rows.length, 1);
assert.equal(fixedC1JointCount(1, 5, 9, 9).joint_count, '1');
assert.equal(enumerateFixedC1JointFiber(1, 5, 9, 9).rows.length, 1);

// t=2: fixed C1 already fixes the route; only q1=O seam ambiguity remains.
for (let E = 0; E <= 4; E += 1) {
  for (let O = 0; O <= 4; O += 1) {
    for (let R = 0; R <= E; R += 1) {
      const P = O + (2 * R);
      assert.equal(fixedC1JointCount(2, E, O, P).joint_count, String(O + 1));
    }
  }
}

// q=1 consistency: each parity is an ordinary composition over exactly t split slots.
const even = seamSplitParityPolynomial(5, 0, 2);
const odd = seamSplitParityPolynomial(5, 1, 2);
assert.equal(even.value_at_one, '15'); // C(2+5-1,2)=15
assert.equal(odd.value_at_one, '15');
const basePoly = fixedC1JointGeneratingPolynomial(5, 2, 2);
assert.equal(basePoly.total_joint_fixed_base_count, '225');
assert.equal(basePoly.expected_total_joint_fixed_base_count, '225');

assert.equal(
  chamber.canonical_candidate,
  'THE_FIXED_C1_JOINT_AUTHORED_ROUTE_X_LINEAR_SEAM_FIBER_IS_BIJECTIVE_TO_FINITE_SEAM_SPLIT_BLOCK_ALLOCATIONS_AND_IS_COUNTED_BY_THE_q^R_COEFFICIENT_OF_THE_DUPLICATED_INTERNAL_SLOT_POLYNOMIAL',
);
assert.equal(
  chamber.consequential_candidate,
  'ROUTES_SHARING_ONE_EXACT_C1_STATE_CAN_CARRY_DIFFERENT_EXACT_SEAM_FIBER_CARDINALITIES_SO_ROUTE_AND_SEAM_CUSTODY_ARE_SEPARATE_BUT_COUPLED_FINITE_RESOURCES',
);

console.log('Ash A15-R0 fixed-C1 joint route-seam fiber tests passed.');