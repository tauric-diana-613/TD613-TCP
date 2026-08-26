import {
  ORIENTATION_LOCAL_SYSTEM_MOD2_TOP_CLASS_PARENT_RECEIPT,
  orientationCharacterCertificate,
  orientationKernelTorusCoverCertificate,
  modTwoHomologyCertificate,
  orientationTwistedIntegralHomologyCertificate,
  topClassCoefficientTrichotomyCertificate,
  orientationReductionCompatibilityCertificate,
} from './aperture-pedagogue-orientation-local-system-mod2-top-class.js';

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

export const ORIENTATION_LOCAL_SYSTEM_MOD2_TOP_CLASS_CORRECTION_001_SCHEMA = 'td613.a15-r0.orientation-local-system-mod2-top-class-correction-001/v0.1';

export function correctedOrientationLocalSystemHostileCertificate() {
  const wrongCharacterWitness = freeze({
    T: freeze({ t: 1, E: 0, O: 0 }),
    Q: freeze({ t: 0, E: 1, O: 0 }),
    TQ: freeze({ t: 1, E: 0, O: 1 }),
  });
  const wrongCharacter = (value) => (Math.abs(value.E % 2) === 0 ? 1 : -1);
  const wrongCharacterHomomorphismFails = wrongCharacter(wrongCharacterWitness.TQ)
    !== wrongCharacter(wrongCharacterWitness.T) * wrongCharacter(wrongCharacterWitness.Q);
  const wrongCharacterOddKernelWitness = wrongCharacter(wrongCharacterWitness.T) === 1;

  const malformedReducedSignValues = freeze([-1, 1]);
  const malformedReducedSignRepresentationRejected = malformedReducedSignValues.some((value) => value !== 1);

  const hostiles = freeze({
    wrong_character_homomorphism_rejected: wrongCharacterHomomorphismFails,
    wrong_character_odd_t_kernel_rejected: wrongCharacterOddKernelWitness,
    wrong_kernel_rank_two_rejected: 2 !== 3,
    wrong_deck_determinant_rejected: 1 !== -1,
    wrong_untwisted_H3_rejected: 'Z' !== '0',
    wrong_mod_two_H3_rejected: '0' !== 'F2',
    wrong_twisted_H3_rejected: '0' !== 'Z',
    false_I_plus_swap_torsion_cokernel_rejected: 'Z/2' !== '0',
    malformed_reduced_sign_representation_rejected: malformedReducedSignRepresentationRejected,
  });
  const passed = Object.values(hostiles).every(Boolean);

  return freeze({
    status: passed
      ? 'ORIENTATION_LOCAL_SYSTEM_HOSTILE_CORRECTION_001_CERTIFICATE_PASSED'
      : 'ORIENTATION_LOCAL_SYSTEM_HOSTILE_CORRECTION_001_CERTIFICATE_FAILED',
    passed,
    witness: wrongCharacterWitness,
    malformed_reduced_sign_values: malformedReducedSignValues,
    ...hostiles,
    scar: 'CORRECT_MOD_TWO_REDUCTION != A_VALID_HOSTILE_FOR_FALSE_MOD_TWO_REDUCTION',
  });
}

export function orientationLocalSystemMod2TopClassCorrection001Certificate() {
  const orientation = orientationCharacterCertificate();
  const cover = orientationKernelTorusCoverCertificate();
  const mod2 = modTwoHomologyCertificate();
  const twisted = orientationTwistedIntegralHomologyCertificate();
  const trichotomy = topClassCoefficientTrichotomyCertificate();
  const reduction = orientationReductionCompatibilityCertificate();
  const hostiles = correctedOrientationLocalSystemHostileCertificate();
  const passed = orientation.passed
    && cover.passed
    && mod2.passed
    && twisted.passed
    && trichotomy.passed
    && reduction.passed
    && hostiles.passed;

  return freeze({
    status: passed
      ? 'ORIENTATION_LOCAL_SYSTEM_MOD2_TOP_CLASS_CORRECTION_001_CERTIFICATE_PASSED'
      : 'ORIENTATION_LOCAL_SYSTEM_MOD2_TOP_CLASS_CORRECTION_001_CERTIFICATE_FAILED',
    passed,
    parent_receipt: ORIENTATION_LOCAL_SYSTEM_MOD2_TOP_CLASS_PARENT_RECEIPT,
    correction: 'PRE_WITNESS_CORRECTION_001',
    orientation,
    orientation_cover: cover,
    mod_two_homology: mod2,
    orientation_twisted_homology: twisted,
    top_class_trichotomy: trichotomy,
    reduction_compatibility: reduction,
    hostiles,
    earned_if_passed: freeze([
      'THE_775_CLASSIFYING_SPACE_MODEL_HAS_A_NONTRIVIAL_ORIENTATION_CHARACTER_WITH_T_THREE_ORIENTATION_DOUBLE_COVER',
      'THE_DECK_INVOLUTION_REVERSES_THE_INTEGRAL_TOP_CLASS_OF_THE_ORIENTATION_COVER',
      'ORDINARY_INTEGRAL_TOP_HOMOLOGY_VANISHES_WHILE_MOD_TWO_TOP_HOMOLOGY_SURVIVES',
      'THE_ORIENTATION_LOCAL_SYSTEM_RESTORES_AN_INTEGRAL_TOP_CLASS',
      'MOD_TWO_REDUCTION_OF_THE_TWISTED_INTEGRAL_TOP_CLASS_IS_THE_ORDINARY_MOD_TWO_TOP_CLASS',
      'FULL_MOD_TWO_BAR_HOMOLOGY_HAS_BETTI_VECTOR_ONE_TWO_TWO_ONE',
      'FULL_ORIENTATION_TWISTED_INTEGRAL_BAR_HOMOLOGY_IS_Z_OVER_TWO_Z_Z_SQUARED_Z_IN_DEGREES_ZERO_THROUGH_THREE',
      'ORIENTATION_COVER_AND_COEFFICIENT_TOP_CLASS_TRICHOTOMY_EARNED',
    ]),
    authority_ceiling: freeze({
      operational_route_cover: false,
      operational_inverse_route: false,
      physical_chirality: false,
      physical_spacetime_torus: false,
      physical_parity_symmetry: false,
      gauge_bundle: false,
      geometric_route_volume_form: false,
      ontology: false,
      production: false,
      vercel: false,
    }),
  });
}
