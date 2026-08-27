import assert from 'node:assert/strict';
import {
  boundaryFramedRelativeBar2Pairing,
  relativeBar2Rezeroing,
  boundaryFramedRelativeBar2PairingCertificate,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-boundary-framed-relative-bar-2-pairing.js';
import {
  T_COORDINATE,
  Q_COORDINATE,
  relationBarCycle,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-quotient-obstruction-bar-cycle-cohomology.js';
import {
  defaultOpenCellPhi,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-open-bar-2-cell-gauge-covariance-seam-cancellation.js';

const zero = (base) => (
  base && [base.t, base.E, base.O].every((n) => Number.isInteger(n) && n >= 0)
    ? 0
    : null
);

const open = Object.freeze([
  Object.freeze({
    coefficient: 1,
    left: T_COORDINATE,
    right: Q_COORDINATE,
    label: '[T|Q]',
  }),
]);

const cert = boundaryFramedRelativeBar2PairingCertificate();
assert.equal(cert.passed, true);
assert.equal(cert.status, 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_CERTIFICATE_PASSED');

// Explicit open simplex: raw interior presentation moves 1 -> 0 while the
// paired boundary framing absorbs exactly that boundary-supported change.
const paired = relativeBar2Rezeroing(open, zero, defaultOpenCellPhi);
assert.equal(paired.status, 'RELATIVE_BAR_2_REZEROING_DERIVED');
assert.equal(paired.original.interior.value, 1);
assert.equal(paired.transformed.interior.value, 0);
assert.equal(paired.original.value, 1);
assert.equal(paired.transformed.value, 1);
assert.equal(paired.delta, 0);
assert.equal(paired.predicted_residual.value, 0);
assert.equal(paired.exact_mismatch_law_passed, true);

// Interior-only and boundary-only changes remain visible with opposite signs.
const interiorOnly = relativeBar2Rezeroing(open, zero, defaultOpenCellPhi, zero);
assert.equal(interiorOnly.delta, -1);
assert.equal(interiorOnly.predicted_residual.value, -1);
assert.equal(interiorOnly.exact_mismatch_law_passed, true);

const boundaryOnly = relativeBar2Rezeroing(open, zero, zero, defaultOpenCellPhi);
assert.equal(boundaryOnly.delta, 1);
assert.equal(boundaryOnly.predicted_residual.value, 1);
assert.equal(boundaryOnly.exact_mismatch_law_passed, true);

// Mismatched paired re-zeroing obeys the exact residual boundary law.
const twicePhi = (base) => {
  const value = defaultOpenCellPhi(base);
  return Number.isInteger(value) ? 2 * value : null;
};
const mismatch = relativeBar2Rezeroing(open, zero, defaultOpenCellPhi, twicePhi);
assert.equal(mismatch.delta, 1);
assert.equal(mismatch.predicted_residual.value, 1);
assert.equal(mismatch.exact_mismatch_law_passed, true);

// Closed cycles discard the boundary framing and reduce exactly to #765.
const z = relationBarCycle();
assert.equal(z.passed, true);
const closed = boundaryFramedRelativeBar2Pairing(z.chain, defaultOpenCellPhi);
assert.equal(closed.status, 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_DERIVED');
assert.equal(closed.is_closed, true);
assert.equal(closed.boundary_pairing.value, 0);
assert.equal(closed.value, 2);

// The certificate must preserve seam orientation, additivity, fixed-boundary
// representative invariance, framing abstention, and receipt externality.
assert.equal(cert.lawful_pasting_additivity.passed, true);
assert.equal(cert.lawful_pasting_additivity.face_a.boundary_pairing.value, -1);
assert.equal(cert.lawful_pasting_additivity.face_b.boundary_pairing.value, 1);
assert.equal(cert.lawful_pasting_additivity.whole.boundary_pairing.value, 0);
assert.equal(
  cert.lawful_pasting_additivity.whole.value,
  cert.lawful_pasting_additivity.face_a.value + cert.lawful_pasting_additivity.face_b.value,
);
assert.equal(cert.wrong_orientation.passed, true);
assert.equal(cert.wrong_orientation.result.boundary_pairing.value, -2);
assert.equal(cert.orientation_reversal.passed, true);
assert.equal(cert.fixed_boundary_representative_shift.passed, true);
assert.equal(cert.invalid_framing_abstention.passed, true);
assert.equal(cert.receipt_externality.passed, true);

assert.deepEqual(cert.canonical_classifications, [
  'BOUNDARY_FRAMED_RELATIVE_BAR_TWO_PAIRING_IS_INVARIANT_UNDER_SIMULTANEOUS_COHOMOLOGOUS_INTERIOR_AND_BOUNDARY_REZEROING',
  'MISMATCHED_INTERIOR_AND_BOUNDARY_REZEROING_LEAVES_THE_EXACT_RESIDUAL_PAIRING_OF_THE_DIFFERENCE_ONE_COCHAIN_WITH_THE_BAR_ONE_BOUNDARY',
  'THE_BOUNDARY_FRAMED_RELATIVE_PAIRING_REDUCES_TO_THE_INHERITED_CLOSED_BAR_H2_PERIOD_ON_CYCLES_AND_IS_ADDITIVE_AND_ORIENTED_ON_FINITE_BAR_TWO_CHAINS_UNDER_ONE_COMMON_FRAMING',
]);

assert.equal(cert.quarantines.includes('RELATIVE_BAR_2_REZEROING_INVARIANCE_NOT_CONNECTION_GAUGE_INVARIANCE'), true);
assert.equal(cert.quarantines.includes('BOUNDARY_FRAMING_NOT_2_CONNECTION'), true);
assert.equal(cert.quarantines.includes('RELATIVE_BAR_2_PAIRING_NOT_2_HOLONOMY'), true);
assert.equal(cert.relative_2_transport_candidate_bearing_only, true);
assert.equal(cert.two_holonomy_promoted, false);
assert.equal(cert.connection_promoted, false);

console.log('Ash A15-R0 boundary-framed relative bar-2 pairing tests passed.');
