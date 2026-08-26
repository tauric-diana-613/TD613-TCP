import assert from 'node:assert/strict';

import {
  ORIENTATION_LOCAL_SYSTEM_MOD2_TOP_CLASS_PARENT_RECEIPT,
  orientationCharacter,
  orientationCharacterCertificate,
  orientationKernelTorusCoverCertificate,
  modTwoHomologyCertificate,
  orientationTwistedIntegralHomologyCertificate,
  topClassCoefficientTrichotomyCertificate,
  orientationReductionCompatibilityCertificate,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-orientation-local-system-mod2-top-class.js';
import {
  correctedOrientationLocalSystemHostileCertificate,
  orientationLocalSystemMod2TopClassCorrection001Certificate,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-orientation-local-system-mod2-top-class-correction-001.js';

assert.equal(
  ORIENTATION_LOCAL_SYSTEM_MOD2_TOP_CLASS_PARENT_RECEIPT,
  '39b8f6e8ba319154378d03c28a1bf42c02870de1',
);

assert.equal(orientationCharacter({ t: 0, E: 99, O: -22 }), 1);
assert.equal(orientationCharacter({ t: 1, E: 0, O: 0 }), -1);
assert.equal(orientationCharacter({ t: -1, E: 4, O: 7 }), -1);
assert.equal(orientationCharacter({ t: 2, E: -3, O: 8 }), 1);
assert.equal(orientationCharacter({ t: 0.5, E: 0, O: 0 }), null);

const orientation = orientationCharacterCertificate();
assert.equal(orientation.status, 'ORIENTATION_CHARACTER_CERTIFICATE_PASSED');
assert.equal(orientation.passed, true);
assert.equal(orientation.sample_pair_count, 2025);
assert.equal(orientation.all_sample_homomorphism_rows_pass, true);
assert.equal(orientation.generator_T_value, -1);
assert.equal(orientation.unit_value, 1);
assert.equal(orientation.image, '{+1,-1}');
assert.equal(orientation.kernel_condition, 't is even');

const cover = orientationKernelTorusCoverCertificate();
assert.equal(cover.status, 'ORIENTATION_KERNEL_T3_COVER_CERTIFICATE_PASSED');
assert.equal(cover.passed, true);
assert.equal(cover.kernel, 'ker(w)={t even}');
assert.equal(cover.kernel_group, 'Z^3');
assert.equal(cover.kernel_isomorphism, '(t,E,O) |-> (E,O,t/2)');
assert.equal(cover.pair_rows.length, 729);
assert.equal(cover.pair_rows.every((row) => row.passed), true);
assert.equal(cover.round_trip_rows.length, 27);
assert.equal(cover.round_trip_rows.every((row) => row.passed), true);
assert.equal(cover.orientation_cover_classifying_space, 'B ker(w) ≃ T^3');
assert.equal(cover.deck_conjugation_rows.every((row) => row.passed), true);
assert.deepEqual(cover.deck_H1_matrix, [[0, 1, 0], [1, 0, 0], [0, 0, 1]]);
assert.equal(cover.deck_determinant, -1);
assert.equal(cover.deck_top_class_action, '-1');
assert.equal(
  cover.classification_if_passed,
  'THE_775_CLASSIFYING_SPACE_MODEL_HAS_A_NONTRIVIAL_ORIENTATION_CHARACTER_WITH_T_THREE_ORIENTATION_DOUBLE_COVER',
);
assert.equal(cover.operational_route_cover_authority, false);
assert.equal(cover.physical_spacetime_torus_authority, false);

const mod2 = modTwoHomologyCertificate();
assert.equal(mod2.status, 'MOD_TWO_BAR_HOMOLOGY_CERTIFICATE_PASSED');
assert.equal(mod2.passed, true);
assert.equal(mod2.coefficient_field, 'F2');
assert.equal(mod2.minus_one_equals_plus_one, true);
assert.deepEqual(mod2.I_minus_swap_on_H1_mod2, [[1, 1], [1, 1]]);
assert.equal(mod2.I_minus_swap_rank, 1);
assert.equal(mod2.H1_kernel_dimension, 1);
assert.equal(mod2.H1_cokernel_dimension, 1);
assert.deepEqual(mod2.betti_vector_degrees_0_through_3, [1, 2, 2, 1]);
assert.equal(mod2.H0, 'F2');
assert.equal(mod2.H1, 'F2^2');
assert.equal(mod2.H2, 'F2^2');
assert.equal(mod2.H3, 'F2');
assert.equal(mod2.higher_in_mapping_torus_model, '0 for n>3');

const twisted = orientationTwistedIntegralHomologyCertificate();
assert.equal(twisted.status, 'ORIENTATION_TWISTED_INTEGRAL_HOMOLOGY_CERTIFICATE_PASSED');
assert.equal(twisted.passed, true);
assert.equal(twisted.coefficient_module, 'Z^w');
assert.equal(twisted.effective_monodromy_rule, '-sigma_*');
assert.equal(twisted.q0_difference, 2);
assert.deepEqual(twisted.q1_difference_matrix, [[1, 1], [1, 1]]);
assert.equal(twisted.q2_difference, 0);
assert.deepEqual(twisted.q1_kernel_generator, [1, -1]);
assert.equal(twisted.q1_kernel_rank, 1);
assert.equal(twisted.q1_cokernel_free_rank, 1);
assert.equal(twisted.q1_cokernel_torsion, '0');
assert.equal(twisted.q0_kernel, '0');
assert.equal(twisted.q0_cokernel, 'Z/2');
assert.equal(twisted.q2_kernel, 'Z');
assert.equal(twisted.q2_cokernel, 'Z');
assert.equal(twisted.H0, 'Z/2');
assert.equal(twisted.H1, 'Z');
assert.equal(twisted.H2, 'Z^2');
assert.equal(twisted.H3, 'Z');
assert.match(twisted.H2_split_reason, /free\/projective/);

const trichotomy = topClassCoefficientTrichotomyCertificate();
assert.equal(trichotomy.status, 'TOP_CLASS_COEFFICIENT_TRICHOTOMY_CERTIFICATE_PASSED');
assert.equal(trichotomy.passed, true);
assert.equal(trichotomy.untwisted_integral_top_difference, 2);
assert.equal(trichotomy.H3_Z, '0');
assert.equal(trichotomy.H3_F2, 'F2');
assert.equal(trichotomy.H3_Zw, 'Z');
assert.equal(trichotomy.trichotomy, 'H3(Z)=0; H3(F2)=F2; H3(Z^w)=Z');
assert.match(trichotomy.scar, /COEFFICIENT_BLINDNESS/);
assert.equal(trichotomy.relies_on_778, false);
assert.equal(trichotomy.relies_on_780, false);

const reduction = orientationReductionCompatibilityCertificate();
assert.equal(reduction.status, 'ORIENTATION_REDUCTION_COMPATIBILITY_CERTIFICATE_PASSED');
assert.equal(reduction.passed, true);
assert.equal(reduction.integral_orientation_module, 'Z^w');
assert.equal(reduction.reduced_module, 'F2 with trivial sign action');
assert.deepEqual(reduction.sign_values, [-1, 1]);
assert.deepEqual(reduction.reduced_sign_values, [1, 1]);
assert.equal(reduction.sign_action_trivial_mod_two, true);
assert.match(reduction.top_generator_reduction, /ordinary mod-two top generator/);
assert.equal(reduction.physical_parity_authority, false);
assert.equal(reduction.gauge_bundle_authority, false);

const hostiles = correctedOrientationLocalSystemHostileCertificate();
assert.equal(hostiles.status, 'ORIENTATION_LOCAL_SYSTEM_HOSTILE_CORRECTION_001_CERTIFICATE_PASSED');
assert.equal(hostiles.passed, true);
assert.equal(hostiles.wrong_character_homomorphism_rejected, true);
assert.equal(hostiles.wrong_character_odd_t_kernel_rejected, true);
assert.equal(hostiles.wrong_kernel_rank_two_rejected, true);
assert.equal(hostiles.wrong_deck_determinant_rejected, true);
assert.equal(hostiles.wrong_untwisted_H3_rejected, true);
assert.equal(hostiles.wrong_mod_two_H3_rejected, true);
assert.equal(hostiles.wrong_twisted_H3_rejected, true);
assert.equal(hostiles.false_I_plus_swap_torsion_cokernel_rejected, true);
assert.equal(hostiles.malformed_reduced_sign_representation_rejected, true);
assert.deepEqual(hostiles.malformed_reduced_sign_values, [-1, 1]);
assert.match(hostiles.scar, /CORRECT_MOD_TWO_REDUCTION/);

const aggregate = orientationLocalSystemMod2TopClassCorrection001Certificate();
assert.equal(aggregate.status, 'ORIENTATION_LOCAL_SYSTEM_MOD2_TOP_CLASS_CORRECTION_001_CERTIFICATE_PASSED');
assert.equal(aggregate.passed, true);
assert.equal(aggregate.parent_receipt, '39b8f6e8ba319154378d03c28a1bf42c02870de1');
assert.equal(aggregate.correction, 'PRE_WITNESS_CORRECTION_001');
assert.equal(aggregate.earned_if_passed.length, 8);
assert.equal(aggregate.authority_ceiling.operational_route_cover, false);
assert.equal(aggregate.authority_ceiling.operational_inverse_route, false);
assert.equal(aggregate.authority_ceiling.physical_chirality, false);
assert.equal(aggregate.authority_ceiling.physical_spacetime_torus, false);
assert.equal(aggregate.authority_ceiling.gauge_bundle, false);
assert.equal(aggregate.authority_ceiling.ontology, false);
assert.equal(aggregate.authority_ceiling.production, false);
assert.equal(aggregate.authority_ceiling.vercel, false);

console.log('Ash A15-R0 orientation local system, T^3 cover, and coefficient top-class tests passed.');
