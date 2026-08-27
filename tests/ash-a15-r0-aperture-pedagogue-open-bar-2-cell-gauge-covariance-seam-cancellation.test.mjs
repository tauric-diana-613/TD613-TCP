import assert from 'node:assert/strict';
import {
  rawBar2InteriorValue,
  openBar2PresentationCovariance,
  cohomologousPresentation,
  associativityPasting,
  defaultOpenCellPhi,
  openBar2CellGaugeCovarianceSeamCancellationCertificate,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-open-bar-2-cell-gauge-covariance-seam-cancellation.js';
import {
  transportIncrementCocycle,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-affine-transport-increment-cocycle.js';
import {
  barH2Period,
  scaleBar2Chain,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-bar-h2-period-return-representation.js';
import {
  relationBarCycle,
  T_COORDINATE,
  Q_COORDINATE,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-quotient-obstruction-bar-cycle-cohomology.js';

const cert = openBar2CellGaugeCovarianceSeamCancellationCertificate();
assert.equal(cert.passed, true);
assert.equal(cert.status, 'OPEN_BAR_TWO_CELL_COVARIANCE_SEAM_CANCELLATION_CERTIFIED');
assert.equal(cert.parent_receipt, '4c8018df2aa1857456cde76e65a9ca694715926e');

// H1: closure recovers #765 exactly rather than inventing a second closed-cycle rule.
assert.equal(cert.closed_cycle_reduction.passed, true);
assert.equal(cert.closed_cycle_reduction.covariance.is_closed, true);
assert.equal(cert.closed_cycle_reduction.covariance.delta, 0);
assert.equal(cert.closed_cycle_reduction.original_period, 2);
assert.equal(cert.closed_cycle_reduction.changed_period, 2);

// H2: an open simplex has a raw interior value but no bar-H2 period authority.
const tq = Object.freeze([
  Object.freeze({ coefficient: 1, left: T_COORDINATE, right: Q_COORDINATE, label: '[T|Q]' }),
]);
const rawTQ = rawBar2InteriorValue(tq);
assert.equal(rawTQ.status, 'RAW_BAR_2_INTERIOR_VALUE_DERIVED');
assert.equal(rawTQ.value, 1);
assert.equal(rawTQ.homology_class_authority, false);
assert.equal(barH2Period(tq).status, 'BAR_H2_PERIOD_ABSTAINS_NONCYCLE');

const single = openBar2PresentationCovariance(tq, defaultOpenCellPhi);
assert.equal(single.status, 'OPEN_BAR_2_PRESENTATION_COVARIANCE_DERIVED');
assert.equal(single.is_closed, false);
assert.equal(single.original.value, 1);
assert.equal(single.transformed.value, 0);
assert.equal(single.delta, -1);
assert.equal(single.boundary_pairing.value, -1);
assert.equal(single.passed, true);

// Pointwise presentation change is visibly nontrivial on the same inherited hostile.
const changed = cohomologousPresentation(transportIncrementCocycle, defaultOpenCellPhi);
assert.equal(transportIncrementCocycle(T_COORDINATE, Q_COORDINATE), 1);
assert.equal(changed(T_COORDINATE, Q_COORDINATE), 0);

// H3/H7: lawful associativity pasting cancels the internal seam exactly.
const paste = associativityPasting(T_COORDINATE, Q_COORDINATE, T_COORDINATE);
assert.equal(paste.status, 'BAR_2_ASSOCIATIVITY_PASTING_DERIVED');
assert.equal(paste.seam_coefficient_first_face, -1);
assert.equal(paste.seam_coefficient_second_face, 1);
assert.equal(paste.seam_coefficient_sum, 0);
assert.equal(paste.same_external_boundary, true);
assert.equal(paste.differs_by_inherited_bar3_boundary, true);

const leftCov = openBar2PresentationCovariance(paste.left_chain, defaultOpenCellPhi);
const rightCov = openBar2PresentationCovariance(paste.right_chain, defaultOpenCellPhi);
assert.equal(leftCov.delta, -2);
assert.equal(leftCov.boundary_pairing.value, -2);
assert.equal(rightCov.delta, -2);
assert.equal(rightCov.boundary_pairing.value, -2);
assert.equal(rawBar2InteriorValue(paste.left_chain).value, rawBar2InteriorValue(paste.right_chain).value);

// The certificate also tests a cochain supported only on the internal seam: lawful pasting removes it.
assert.equal(cert.lawful_pasted_seam_cancellation.seam_marker_covariance.delta, 0);
assert.equal(cert.lawful_pasted_seam_cancellation.seam_marker_covariance.boundary_pairing.value, 0);

// H4: orientation reversal reverses interior, boundary, and covariance signs together.
assert.equal(cert.orientation_reversal.passed, true);
assert.equal(
  cert.orientation_reversal.reversed_raw.value,
  -cert.orientation_reversal.original_raw.value,
);
assert.equal(
  cert.orientation_reversal.reversed_covariance.delta,
  -cert.orientation_reversal.original_covariance.delta,
);

// Independent direct reversal control on the open simplex.
const minusTQ = scaleBar2Chain(tq, -1);
const minusCov = openBar2PresentationCovariance(minusTQ.chain, defaultOpenCellPhi);
assert.equal(minusCov.delta, 1);
assert.equal(minusCov.boundary_pairing.value, 1);

// H5: wrong orientation preserves the seam with coefficient -2; same label alone earns nothing.
assert.equal(cert.fake_pasting_preserves_uncancelled_seam.passed, true);
assert.equal(cert.fake_pasting_preserves_uncancelled_seam.seam_coefficient, -2);
assert.equal(cert.fake_pasting_preserves_uncancelled_seam.seam_marker_covariance.delta, -2);
assert.equal(cert.fake_pasting_preserves_uncancelled_seam.seam_marker_covariance.boundary_pairing.value, -2);

// H6: adding an inherited bar-3 boundary changes neither the open boundary nor its covariance law.
assert.equal(cert.open_representative_bar3_boundary_shift.passed, true);
assert.deepEqual(
  cert.open_representative_bar3_boundary_shift.shifted_boundary.terms,
  cert.open_representative_bar3_boundary_shift.original_boundary.terms,
);
assert.equal(
  cert.open_representative_bar3_boundary_shift.raw_shifted.value,
  cert.open_representative_bar3_boundary_shift.raw_original.value,
);
assert.equal(
  cert.open_representative_bar3_boundary_shift.covariance_shifted.delta,
  cert.open_representative_bar3_boundary_shift.covariance_original.delta,
);

// H8: custody labels remain external to the algebra.
assert.equal(cert.receipt_externality.passed, true);
assert.notEqual(cert.receipt_externality.receipt_a, cert.receipt_externality.receipt_b);
assert.equal(
  cert.receipt_externality.covariance_a.delta,
  cert.receipt_externality.covariance_b.delta,
);

// A non-normalized section presentation abstains rather than receiving authority.
const nonNormalizedPhi = () => 1;
assert.equal(openBar2PresentationCovariance(tq, nonNormalizedPhi).status, 'OPEN_BAR_2_PRESENTATION_COVARIANCE_ABSTAINS');

// The only earned classifications are the preregistered finite boundary-covariance laws.
assert.deepEqual(cert.canonical_classifications, [
  'OPEN_BAR_TWO_CHAIN_COHOMOLOGOUS_PRESENTATION_CHANGE_IS_EXACTLY_THE_PAIRING_OF_THE_ONE_COCHAIN_WITH_THE_CHAIN_BOUNDARY',
  'PASTED_BAR_TWO_CELLS_CANCEL_INTERNAL_BOUNDARY_PRESENTATION_TERMS_AND_LEAVE_ONLY_EXTERNAL_BOUNDARY_COVARIANCE',
]);

// H9: preserve the naming ceiling and the parallel-work collision membrane.
assert.equal(cert.quarantines.includes('COHOMOLOGOUS_PRESENTATION_COVARIANCE_NOT_CONNECTION_GAUGE_COVARIANCE'), true);
assert.equal(cert.quarantines.includes('BAR_2_CELL_NOT_OPERATIONAL_OR_GEOMETRIC_SURFACE'), true);
assert.equal(cert.quarantines.includes('OPEN_BAR_TWO_CELL_COVARIANCE_NOT_2_HOLONOMY'), true);
assert.equal(cert.quarantines.includes('NO_BOUNDARY_FRAMING_LAMBDA_IN_THIS_CHAMBER'), true);
assert.equal(cert.collision_membrane.src_atelier_731_758_759_mutated, false);
assert.equal(cert.collision_membrane.pasted_diamond_767_mutated, false);
assert.equal(cert.collision_membrane.scientific_parent_only, '#765');

// The known closed class remains available as the inherited control and still carries period 2.
const z = relationBarCycle();
assert.equal(z.passed, true);
assert.equal(barH2Period(z.chain).period, 2);

console.log('Ash A15-R0 open bar-2-cell covariance and seam-cancellation tests passed.');
