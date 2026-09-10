import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  AFFINE_TRANSPORT_INCREMENT_COCYCLE_PARENT_RECEIPT,
  baseQ,
  multiplyByTransportCocycle,
  runAffineTransportIncrementCocycleAssay,
  transformedTransportIncrementCocycle,
  transportIncrementCocycle,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-affine-transport-increment-cocycle.js';

const EXPECTED_PARENT = 'fd632f912982914a36807f83b02f750945c230a7';
assert.equal(AFFINE_TRANSPORT_INCREMENT_COCYCLE_PARENT_RECEIPT, EXPECTED_PARENT);
execFileSync('git', ['cat-file', '-e', `${EXPECTED_PARENT}^{commit}`], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', EXPECTED_PARENT, 'HEAD'], { stdio: 'pipe' });

const T = Object.freeze({ t: 1, E: 0, O: 0 });
const Q = Object.freeze({ t: 0, E: 1, O: 0 });
const I = Object.freeze({ t: 0, E: 0, O: 0 });

assert.equal(baseQ(T), 0);
assert.equal(baseQ(Q), 1);
assert.equal(transportIncrementCocycle(T, Q), 1);
assert.equal(transportIncrementCocycle(Q, T), 0);
assert.equal(transportIncrementCocycle(I, Q), 0);
assert.equal(transportIncrementCocycle(T, I), 0);
assert.equal(transportIncrementCocycle({ t: -1, E: 0, O: 0 }, Q), null);

const tq = multiplyByTransportCocycle(
  { t: 1, E: 0, O: 0, P: 0 },
  { t: 0, E: 1, O: 0, P: 0 },
);
assert.equal(tq.status, 'AFFINE_TRANSPORT_COCYCLE_EXTENSION_PRODUCT_DERIVED');
assert.deepEqual(
  { t: tq.t, E: tq.E, O: tq.O, P: tq.P },
  { t: 1, E: 0, O: 1, P: 1 },
);

const transformed = transformedTransportIncrementCocycle(T, Q);
assert.equal(Number.isInteger(transformed), true);

const result = runAffineTransportIncrementCocycleAssay();
assert.equal(result.passed, true, JSON.stringify(result, null, 2));
assert.equal(result.status, 'AFFINE_TRANSPORT_INCREMENT_COCYCLE_ROUND_CLOSED');
assert.equal(
  result.canonical_classification,
  'FIRST_MOMENT_AFFINE_CROSS_TERM_IS_WELL_DEFINED_NORMALIZED_MONOID_2_COCYCLE_RECOVERING_WITNESSED_TRANSPORT_EXTENSION_WITH_SECTION_CHANGE_COVARIANCE',
);

assert.equal(result.homomorphisms.passed, true);
assert.equal(result.normalization.passed, true);
assert.equal(result.symbolic.passed, true);
assert.equal(result.concrete.passed, true);
assert.equal(result.recovery.passed, true);
assert.equal(result.concatenation.passed, true);
assert.equal(result.representatives.passed, true);
assert.equal(result.order.passed, true);
assert.equal(result.swapped.passed, true);
assert.equal(result.parity.passed, true);
assert.equal(result.section.passed, true);
assert.equal(result.receipt.passed, true);

assert.equal(result.order.omega_TQ, 1);
assert.equal(result.order.omega_QT, 0);
assert.equal(result.order.cohomology_class_claim, false);
assert.notEqual(result.parity.defect_T_T_Q, 0);
assert.equal(result.section.cohomology_claim, false);
assert.equal(result.section.normalization, true);
assert.equal(result.concrete.rows.every((row) => row.defect === 0), true);
assert.equal(result.representatives.representative_u.join(''), 'TTQ');
assert.equal(result.representatives.representative_v.join(''), 'QTT');
assert.equal(result.receipt.receipt_a, 'R1');
assert.equal(result.receipt.receipt_b, 'R1_DUP');
assert.equal(result.receipt.cocycle_equal, true);

for (const forbidden of [
  'nontrivial_cohomology_class',
  'coboundary_classification',
  'H2_computation',
  'group_cohomology',
  'group_completion',
  'inverse_transport',
  'groupoid',
  'connection',
  'closed_nonidentity_loop',
  'holonomy',
  'curvature',
  'berry_quantum_analogy',
  'higher_moment_completeness',
  'proto_loom',
  'a16',
  'live_ash_mutation',
  'merge',
  'production',
  'vercel',
]) {
  assert.equal(result.claim_ceiling[forbidden], false, `${forbidden} must remain outside #734 authority.`);
}

assert.equal(
  result.stop,
  'HUMAN_𝄐_REQUIRED_BEFORE_ANY_COHOMOLOGY_CLASS_NONTRIVIALITY_OR_HIGHER_MOMENT_HIERARCHY_AUDITION',
);

console.log('Ash A15-R0 affine transport-increment cocycle assay passed.');
console.log(JSON.stringify({
  schema: result.schema,
  classification: result.canonical_classification,
  cocycle: result.cocycle,
  omega_TQ: result.order.omega_TQ,
  omega_QT: result.order.omega_QT,
  parity_fragile_defect_T_T_Q: result.parity.defect_T_T_Q,
  section_change: result.section.classification,
  stop: result.stop,
}, null, 2));
