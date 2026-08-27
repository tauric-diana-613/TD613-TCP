import assert from 'node:assert/strict';

import {
  H2_TRANSPORT_CLASSIFICATION_HOLONOMY_COMPLETENESS_PARENT_RECEIPT,
  barH1Coordinate,
  barH1CoordinateOfChain,
  barH1FreenessCertificate,
  effectiveRelativeCocycle,
  strictFormalTransportClassificationCertificate,
  formalBoundaryRezeroingClassificationCertificate,
  universalCoefficientHolonomyBridgeCertificate,
  closedFormalTwoHolonomyCompletenessCertificate,
  h2TransportClassificationHolonomyCompletenessCertificate,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-h2-transport-classification-holonomy-completeness.js';
import {
  T_COORDINATE,
  Q_COORDINATE,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-quotient-obstruction-bar-cycle-cohomology.js';
import {
  multiplyQuotientCoordinates,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-target-equivalence-quotient-congruence.js';
import {
  finiteBoundaryFraming,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-separately-framed-bar-2-gluing-seam-defect.js';
import {
  transportIncrementCocycle,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-affine-transport-increment-cocycle.js';

assert.equal(
  H2_TRANSPORT_CLASSIFICATION_HOLONOMY_COMPLETENESS_PARENT_RECEIPT,
  '1da4875227a97af4a8a41d00955c73b4ed45112d',
  'the chamber must remain pinned to the exact #772 receipt',
);

const tClass = barH1Coordinate(T_COORDINATE);
const qClass = barH1Coordinate(Q_COORDINATE);
assert.equal(tClass.status, 'BAR_H1_COORDINATE_DERIVED');
assert.equal(qClass.status, 'BAR_H1_COORDINATE_DERIVED');
assert.deepEqual(tClass.vector, [1, 0]);
assert.deepEqual(qClass.vector, [0, 1]);

const tq = multiplyQuotientCoordinates(T_COORDINATE, Q_COORDINATE);
assert.equal(tq.status, 'PARITY_TWISTED_QUOTIENT_PRODUCT_DERIVED');
assert.deepEqual(
  { t: tq.t, E: tq.E, O: tq.O },
  { t: 1, E: 0, O: 1 },
  'T★Q must expose the parity swap used by the fake-E hostile',
);
assert.equal(tq.E, 0);
assert.equal(T_COORDINATE.E + Q_COORDINATE.E, 1);
assert.notEqual(tq.E, T_COORDINATE.E + Q_COORDINATE.E, 'E alone is not additive');
assert.equal(tq.E + tq.O, 1, 'total q=E+O remains additive');

const unreachable = barH1Coordinate({ t: 0, E: 0, O: 1 });
assert.equal(
  unreachable.status,
  'BAR_H1_COORDINATE_ABSTAINS_UNREACHABLE_QUOTIENT_COORDINATE',
  'syntactically valid but unreachable triples must not be smuggled into B',
);

const signedChain = barH1CoordinateOfChain([
  { coordinate: T_COORDINATE, coefficient: 3 },
  { coordinate: Q_COORDINATE, coefficient: -2 },
]);
assert.equal(signedChain.status, 'BAR_H1_CHAIN_COORDINATE_DERIVED');
assert.deepEqual(signedChain.vector, [3, -2]);

const h1 = barH1FreenessCertificate();
assert.equal(h1.status, 'BAR_H1_FREENESS_CERTIFICATE_PASSED');
assert.equal(h1.passed, true);
assert.equal(h1.torsion_free_if_passed, true);
assert.equal(h1.parity_sensitive_fake_E_hostile.passed, true);
assert.equal(h1.parity_sensitive_fake_E_hostile.E_product, 0);
assert.equal(h1.parity_sensitive_fake_E_hostile.E_left_plus_right, 1);
assert.equal(h1.reductions.every((row) => row.passed), true);
assert.equal(h1.boundary_rows.every((row) => row.passed), true);
assert.match(h1.earned_if_passed, /H1_bar\(B;Z\) ≅ Z²/);

const transports = strictFormalTransportClassificationCertificate();
assert.equal(transports.status, 'STRICT_FORMAL_TRANSPORT_CLASSIFICATION_CERTIFICATE_PASSED');
assert.equal(transports.passed, true);
assert.equal(transports.omega_defects.every((value) => value === 0), true);
assert.equal(transports.swapped_defects.every((value) => value === 0), true);
assert.deepEqual(
  transports.parity_fragile_fake_witness,
  { x: T_COORDINATE, y: T_COORDINATE, z: Q_COORDINATE },
  'Repair 001 pins the representative-invariance hostile to the same T,T,Q witness used for dκ_E',
);
assert.notEqual(transports.parity_fragile_fake_defect, 0, 'noncocycle hostile must actually fail dκ=0');
assert.equal(transports.additive_pairing_control, true);
assert.equal(transports.omega_on_bar3_boundary, 0);
assert.notEqual(transports.fake_on_bar3_boundary, 0, 'noncocycle must fail representative invariance on the explicit bar-3 boundary');
assert.equal(
  transports.fake_on_bar3_boundary,
  transports.parity_fragile_fake_defect,
  'the explicit bar-3 boundary pairing must equal the independently computed cocycle defect on T,T,Q',
);
assert.equal(transports.fake_boundary_matches_defect, true);
assert.equal(transports.classification, 'Z_bar^2(B;Z) ≅ Rep_bar^2(B;Z)');
assert.equal(transports.geometric_transport_authority, false);

const rezeroing = formalBoundaryRezeroingClassificationCertificate();
assert.equal(rezeroing.status, 'FORMAL_BOUNDARY_REZEROING_CLASSIFICATION_CERTIFICATE_PASSED');
assert.equal(rezeroing.passed, true);
assert.equal(rezeroing.effective_cocycle_rows.every((row) => row.equal), true);
assert.equal(rezeroing.open_boundary_identity.passed, true);
assert.equal(rezeroing.closed_control.passed, true);
assert.equal(
  rezeroing.classification,
  'Rep_bar^2(B;Z)/formal-boundary-rezeroing ≅ H_bar^2(B;Z)',
);
assert.equal(rezeroing.connection_gauge_authority, false);

const zeroFraming = finiteBoundaryFraming([]);
const effective = effectiveRelativeCocycle(transportIncrementCocycle, zeroFraming);
assert.equal(typeof effective, 'function');
assert.equal(effective(T_COORDINATE, Q_COORDINATE), transportIncrementCocycle(T_COORDINATE, Q_COORDINATE));
const badFraming = () => 1;
assert.equal(effectiveRelativeCocycle(transportIncrementCocycle, badFraming), null, 'non-normalized framing must abstain');

const uct = universalCoefficientHolonomyBridgeCertificate();
assert.equal(uct.status, 'UNIVERSAL_COEFFICIENT_HOLONOMY_BRIDGE_CERTIFICATE_PASSED');
assert.equal(uct.passed, true);
assert.equal(uct.authored_h1, 'Z²');
assert.equal(uct.authored_ext_term, '0');
assert.equal(uct.evaluation_map_isomorphism, true);
assert.equal(uct.resulting_isomorphism, 'H^2_bar(B;Z) ≅ Hom(H2_bar(B;Z),Z)');
assert.equal(uct.synthetic_torsion_hostile.ext_nonzero, true, 'torsion control must keep the Ext obstruction visible');
assert.match(uct.synthetic_torsion_hostile.ext_group, /Z\/2Z/);
assert.equal(uct.full_h2_group_computed, false);
assert.equal(uct.full_h2_generator_claim, false);

const holonomy = closedFormalTwoHolonomyCompletenessCertificate();
assert.equal(holonomy.status, 'CLOSED_FORMAL_TWO_HOLONOMY_COMPLETENESS_CERTIFICATE_PASSED');
assert.equal(holonomy.passed, true);
assert.equal(holonomy.z_holonomy.value, 2);
assert.equal(holonomy.negative_z_holonomy.value, -2);
assert.equal(holonomy.swapped_class_z_holonomy.value, -2);
assert.equal(holonomy.cohomologous_presentation_z_holonomy.value, 2);
assert.equal(holonomy.open_transport.status, 'FORMAL_BAR_TWO_TRANSPORT_DERIVED');
assert.equal(holonomy.open_holonomy_rejection.status, 'FORMAL_BAR_TWO_HOLONOMY_REJECTS_OPEN_TWO_CELL');
assert.equal(holonomy.anti_single_cycle_shortcut.z_is_proved_generator_of_full_H2, false);
assert.equal(holonomy.anti_single_cycle_shortcut.agreement_on_z_authorizes_global_equivalence, false);
assert.equal(holonomy.formal_bar_complex_two_holonomy_cohomologically_complete, true);
assert.equal(holonomy.geometric_two_holonomy_authority, false);
assert.equal(holonomy.connection_authority, false);
assert.equal(holonomy.operational_path_two_groupoid_authority, false);

const aggregate = h2TransportClassificationHolonomyCompletenessCertificate();
assert.equal(aggregate.status, 'H2_TRANSPORT_CLASSIFICATION_HOLONOMY_COMPLETENESS_CERTIFICATE_PASSED');
assert.equal(aggregate.passed, true);
assert.equal(
  aggregate.consequential_marker,
  'FORMAL_BAR_COMPLEX_TWO_HOLONOMY_IS_COHOMOLOGICALLY_COMPLETE_FOR_THE_DECLARED_B_SQUARED_Z_TRANSPORT_JURISDICTION',
);
assert.equal(aggregate.canonical_classifications.length, 4);
assert.equal(aggregate.formal_bar_complex_two_holonomy_authority, true);
assert.equal(aggregate.geometric_two_holonomy_authority, false);
assert.equal(aggregate.physical_two_holonomy_authority, false);
assert.equal(aggregate.berry_or_gerbe_holonomy_authority, false);
assert.equal(aggregate.connection_authority, false);
assert.equal(aggregate.two_connection_authority, false);
assert.equal(aggregate.operational_path_two_groupoid_authority, false);
assert.equal(aggregate.curvature_authority, false);
assert.equal(aggregate.full_h2_group_computed, false);
assert.equal(aggregate.z_generates_full_h2, false);
assert.equal(
  aggregate.quarantines.includes('agreement on one witnessed class [z] != agreement on all H2 classes'),
  true,
);

console.log('Ash A15-R0 H2 transport classification and closed formal 2-holonomy completeness tests passed.');
