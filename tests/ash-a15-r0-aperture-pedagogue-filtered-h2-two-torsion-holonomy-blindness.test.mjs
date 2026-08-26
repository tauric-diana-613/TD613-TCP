import assert from 'node:assert/strict';

import {
  FILTERED_H2_TWO_TORSION_HOLONOMY_BLINDNESS_PARENT_RECEIPT,
  filteredBarBasis,
  filteredBarWeight,
  filteredRelationCycle,
  filteredH2TwoTorsionHolonomyBlindnessCertificate,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-filtered-h2-two-torsion-holonomy-blindness.js';

assert.equal(
  FILTERED_H2_TWO_TORSION_HOLONOMY_BLINDNESS_PARENT_RECEIPT,
  '50ada0bb0e7b25f9c1bde7e2feafeebbb5067a8f',
  'filtered torsion chamber must bind exact #773 receipt ancestry',
);

assert.equal(filteredBarWeight({ t: 1, E: 2, O: 3 }), 6);
assert.equal(filteredBarWeight({ t: 0, E: 0, O: 1 }), null, 'unreachable ambient triples must abstain');

const F4C1 = filteredBarBasis(1, 4);
const F4C2 = filteredBarBasis(2, 4);
const F4C3 = filteredBarBasis(3, 4);
assert.equal(F4C1.size, 24);
assert.equal(F4C2.size, 64);
assert.equal(F4C3.size, 56);

const F5C2 = filteredBarBasis(2, 5);
const F5C3 = filteredBarBasis(3, 5);
assert.equal(F5C2.size, 164);
assert.equal(F5C3.size, 236);

const F6C2 = filteredBarBasis(2, 6);
const F6C3 = filteredBarBasis(3, 6);
assert.equal(F6C2.size, 365);
assert.equal(F6C3.size, 768);

const r0 = filteredRelationCycle(0);
const r1 = filteredRelationCycle(1);
assert.equal(r0.status, 'FILTERED_RELATION_BAR_2_CYCLE_DERIVED');
assert.equal(r1.status, 'FILTERED_RELATION_BAR_2_CYCLE_DERIVED');
assert.equal(r0.passed, true);
assert.equal(r1.passed, true);
assert.deepEqual(r0.left_word, ['T', 'T', 'Q']);
assert.deepEqual(r0.right_word, ['Q', 'T', 'T']);
assert.equal(r0.chain.length, 4, 'r0 must reduce exactly to inherited z relation fan');
assert.deepEqual(r1.left_word, ['T', 'Q', 'T', 'Q']);
assert.deepEqual(r1.right_word, ['Q', 'T', 'Q', 'T']);
assert.equal(r1.chain.length, 6);

const cert = filteredH2TwoTorsionHolonomyBlindnessCertificate();
assert.equal(cert.status, 'FILTERED_H2_TWO_TORSION_HOLONOMY_BLINDNESS_CERTIFICATE_PASSED');
assert.equal(cert.passed, true);

assert.equal(cert.theta.definition, 'theta = r1-r0');
assert.equal(cert.theta.is_cycle, true);
assert.equal(cert.theta.boundary.is_cycle, true);

assert.equal(cert.double_boundary.B_theta.length, 10, 'torsion witness must use the preregistered ten-term bar-3 chain');
assert.equal(cert.double_boundary.B_theta_max_weight, 5);
assert.equal(cert.double_boundary.exact_boundary_equals_two_theta, true);
assert.deepEqual(
  cert.double_boundary.B_theta.map((term) => term.label),
  [
    '-[T|Q|T]',
    '[T|T|Q]',
    '[T|TQ|T]',
    '-[T|QT|Q]',
    '-[T|QTQ|T]',
    '[T|TQT|Q]',
    '[QT|Q|T]',
    '-[QT|T|T]',
    '[QT|QT|T]',
    '-[QT|TT|Q]',
  ],
);

assert.equal(cert.F5.mod2_nonboundary.c2_size, 164);
assert.equal(cert.F5.mod2_nonboundary.c3_size, 236);
assert.equal(cert.F5.mod2_nonboundary.rank_im_d3_mod2, 123);
assert.equal(cert.F5.mod2_nonboundary.rank_augmented_with_theta_mod2, 124);
assert.equal(cert.F5.mod2_nonboundary.theta_nonboundary_mod2, true);
assert.equal(cert.F5.exact_order_two, true);
assert.equal(cert.F5.classification, 'FILTERED_BAR_H2_EXACT_TWO_TORSION_CLASS_EARNED_IN_F5');

assert.equal(cert.F6.mod2_nonboundary.c2_size, 365);
assert.equal(cert.F6.mod2_nonboundary.c3_size, 768);
assert.equal(cert.F6.mod2_nonboundary.rank_im_d3_mod2, 302);
assert.equal(cert.F6.mod2_nonboundary.rank_augmented_with_theta_mod2, 303);
assert.equal(cert.F6.mod2_nonboundary.theta_nonboundary_mod2, true);
assert.equal(cert.F6.exact_order_two, true);
assert.equal(cert.F6.classification, 'FILTERED_BAR_H2_TWO_TORSION_PERSISTS_THROUGH_F6');

assert.equal(cert.integer_holonomy.omega_r0, 2);
assert.equal(cert.integer_holonomy.omega_r1, 2);
assert.equal(cert.integer_holonomy.omega_theta, 0);
assert.equal(cert.integer_holonomy.swapped_r0, -2);
assert.equal(cert.integer_holonomy.swapped_r1, -2);
assert.equal(cert.integer_holonomy.swapped_theta, 0);
assert.equal(cert.integer_holonomy.all_integer_characters_kill_theta, true);
assert.equal(cert.integer_holonomy.translation_return, 'tau_0=id for every integer-valued formal 2-holonomy character on [theta]');
assert.equal(cert.integer_holonomy.classification, 'INTEGER_VALUED_FORMAL_TWO_HOLONOMY_BLINDNESS_TO_FILTERED_TWO_TORSION_EARNED');

assert.equal(cert.finite_window_scar.F4.c1_size, 24);
assert.equal(cert.finite_window_scar.F4.c2_size, 64);
assert.equal(cert.finite_window_scar.F4.c3_size, 56);
assert.equal(cert.finite_window_scar.F4.rank_d2_mod3, 22);
assert.equal(cert.finite_window_scar.F4.rank_d3_mod3, 40);
assert.equal(cert.finite_window_scar.F4.rank_d3_plus_r0_mod3, 41);
assert.equal(cert.finite_window_scar.F4.rank_d3_plus_r0_r1_mod3, 42);
assert.equal(cert.finite_window_scar.F4.exact_h2_tensor_Q_dimension, 2);
assert.equal(cert.finite_window_scar.F4_to_F5.two_theta_boundary_implies_theta_rational_boundary, true);
assert.equal(cert.finite_window_scar.F4_to_F5.omega_r0, 2);
assert.equal(cert.finite_window_scar.F4_to_F5.common_image_nonzero, true);
assert.equal(cert.finite_window_scar.F4_to_F5.exact_image_dimension_over_Q, 1);
assert.equal(cert.finite_window_scar.passed, true);

assert.equal(cert.invalid_controls.unreachable_coordinate_abstains, true);
assert.equal(cert.invalid_controls.normalized_unit_slot_abstains, true);
assert.equal(cert.invalid_controls.F5_overflow_detected, true);
assert.equal(cert.invalid_controls.false_relation_rejected, true);

assert.equal(
  cert.consequential_bearing,
  'FORMAL_TWO_HOLONOMY_CAN_BE_COHOMOLOGICALLY_COMPLETE_FOR_INTEGER_TRANSPORT_CLASSES_WHILE_REMAINING_NONFAITHFUL_ON_TORSION_HOMOLOGY_CLASSES',
);

assert.equal(cert.ceilings.full_H2_torsion_authority, false);
assert.equal(cert.ceilings.all_N_persistence_authority, false);
assert.equal(cert.ceilings.filtered_colimit_stabilization_authority, false);
assert.equal(cert.ceilings.geometric_two_holonomy_authority, false);
assert.equal(cert.ceilings.physical_two_holonomy_authority, false);
assert.equal(cert.ceilings.connection_authority, false);
assert.equal(cert.ceilings.two_connection_authority, false);
assert.equal(cert.ceilings.curvature_authority, false);
assert.equal(cert.ceilings.operational_path_two_groupoid_authority, false);

assert.ok(cert.scars.includes('F5 torsion != full H2(B;Z) torsion'));
assert.ok(cert.scars.includes('stable-looking finite H2 dimension != stable filtered-colimit image'));
assert.ok(cert.scars.includes('integer-character blindness to torsion != failure of #773 transport classification'));

console.log(JSON.stringify({
  status: cert.status,
  F5_order_two: cert.F5.exact_order_two,
  F6_order_two: cert.F6.exact_order_two,
  theta_integer_holonomy: cert.integer_holonomy.omega_theta,
  F4_H2_Q_dimension: cert.finite_window_scar.F4.exact_h2_tensor_Q_dimension,
  F4_to_F5_image_Q_dimension: cert.finite_window_scar.F4_to_F5.exact_image_dimension_over_Q,
  consequential_bearing: cert.consequential_bearing,
}, null, 2));
