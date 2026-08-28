import assert from 'node:assert/strict';

import {
  parallelLiftFiberReturn,
  parallelLiftFiberReturnCertificate,
  routeFiberInverseTransport,
  routeFiberTransport,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-parallel-lift-fiber-return.js';

const certificate = parallelLiftFiberReturnCertificate();

assert.equal(certificate.passed, true);
assert.equal(
  certificate.status,
  'PARALLEL_LIFT_INTEGER_FIBER_RETURN_AUTOMORPHISM_CERTIFIED',
);

assert.equal(certificate.transport_bijection.passed, true);
assert.equal(certificate.inherited_TTQ_QTT_wound.passed, true);
assert.equal(certificate.comparison_composition.passed, true);
assert.equal(certificate.all_finite_Rk_family.passed, true);
assert.equal(certificate.same_base_same_P_distinct_route_hostile.passed, true);
assert.equal(certificate.different_base_abstention_hostile.passed, true);
assert.equal(certificate.extension_consistency.passed, true);

// Foundational return: same quotient base, distinct first-moment lift.
const ttqQtt = parallelLiftFiberReturn(['T', 'T', 'Q'], ['Q', 'T', 'T'], 41);
assert.equal(ttqQtt.status, 'PARALLEL_LIFT_SAME_BASE_FIBER_RETURN_AUTOMORPHISM_DERIVED');
assert.deepEqual(ttqQtt.base, { t: 2, E: 1, O: 0 });
assert.equal(ttqQtt.P_u, 2);
assert.equal(ttqQtt.P_v, 0);
assert.equal(ttqQtt.translation, 2);
assert.equal(ttqQtt.output_fiber, 43);
assert.equal(ttqQtt.nonidentity, true);

// Reverse comparison is the inverse integer translation.
const qttTtq = parallelLiftFiberReturn(['Q', 'T', 'T'], ['T', 'T', 'Q'], 43);
assert.equal(qttTtq.translation, -2);
assert.equal(qttTtq.output_fiber, 41);

// Fiber inverse is exact but explicitly quarantined from route inverse claims.
const forward = routeFiberTransport(['T', 'T', 'Q'], -9);
const inverse = routeFiberInverseTransport(['T', 'T', 'Q'], forward.target_fiber);
assert.equal(inverse.target_fiber, -9);
assert.equal(inverse.quarantine, 'INVERSE_FIBER_BIJECTION_NOT_INVERSE_TQ_ROUTE');

// Three same-base lifts compose by translation differences.
const u = ['T', 'T', 'Q', 'Q'];
const v = ['Q', 'T', 'T', 'Q'];
const w = ['Q', 'Q', 'T', 'T'];
const uv = parallelLiftFiberReturn(u, v, 5);
const vw = parallelLiftFiberReturn(v, w, uv.output_fiber);
const uw = parallelLiftFiberReturn(u, w, 5);
assert.equal(uv.translation, 2);
assert.equal(vw.translation, 2);
assert.equal(uw.translation, 4);
assert.equal(vw.output_fiber, uw.output_fiber);

// All-finite R_k theorem is symbolic; these are implementation hostiles only.
for (const k of [0, 1, 2, 7, 19, 31]) {
  const left = ['T', ...Array(k).fill('Q'), 'T', 'Q'];
  const right = ['Q', 'T', ...Array(k).fill('Q'), 'T'];
  const result = parallelLiftFiberReturn(left, right, -100);
  assert.equal(result.status, 'PARALLEL_LIFT_SAME_BASE_FIBER_RETURN_AUTOMORPHISM_DERIVED');
  assert.deepEqual(result.base, { t: 2, E: 1, O: k });
  assert.equal(result.P_u, k + 2);
  assert.equal(result.P_v, k);
  assert.equal(result.translation, 2);
  assert.equal(result.output_fiber, -98);
}

// Distinct route does not imply a nonidentity fiber return.
const sameP = parallelLiftFiberReturn(
  ['T', 'Q', 'T', 'Q', 'T'],
  ['Q', 'T', 'T', 'T', 'Q'],
  13,
);
assert.equal(sameP.status, 'PARALLEL_LIFT_SAME_BASE_FIBER_RETURN_AUTOMORPHISM_DERIVED');
assert.equal(sameP.P_u, 3);
assert.equal(sameP.P_v, 3);
assert.equal(sameP.translation, 0);
assert.equal(sameP.output_fiber, 13);
assert.equal(sameP.nonidentity, false);

// Different quotient targets cannot be silently compared as one return fiber.
const differentBase = parallelLiftFiberReturn(['T'], ['Q'], 0);
assert.equal(differentBase.status, 'PARALLEL_LIFT_FIBER_RETURN_ABSTAINS_DIFFERENT_BASE');

assert.deepEqual(certificate.quarantines, [
  'INVERSE_FIBER_BIJECTION_NOT_INVERSE_TQ_ROUTE',
  'SAME_BASE_PARALLEL_COMPARISON_NOT_OPERATIONAL_CLOSED_PATH',
  'FIBER_RETURN_AUTOMORPHISM_NOT_HOLONOMY',
  'NO_CONNECTION_OR_CURVATURE_PROMOTION',
]);

console.log('Ash A15-R0 parallel-lift integer fiber return tests passed.');
