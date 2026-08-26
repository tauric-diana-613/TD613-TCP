import {
  UNIVERSAL_COEFFICIENT_HOLONOMY_REPRESENTABILITY_PARENT_RECEIPT,
  universalIdentityTransportCertificate,
  coefficientNaturalityCertificate,
  cyclicCoefficientParityCertificate,
  faithfulTargetCriterionCertificate,
  universalCoefficientHolonomyRepresentabilityCertificate as originalAggregate,
} from './aperture-pedagogue-universal-coefficient-holonomy-representability.js';
import {
  explicitBarH2BasisCertificate,
} from './aperture-pedagogue-exact-bar-h2-torsion-sensitive-holonomy.js';

export const UNIVERSAL_COEFFICIENT_HOLONOMY_REPRESENTABILITY_CORRECTION_001_SCHEMA = 'td613.a15-r0.universal-coefficient-holonomy-representability-correction-001/v0.1';
export const UNIVERSAL_COEFFICIENT_HOLONOMY_REPRESENTABILITY_CORRECTION_001_PARENT_RECEIPT = '39b8f6e8ba319154378d03c28a1bf42c02870de1';

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

export function correctedUniversalCoefficientTheoremCertificate() {
  const basis = explicitBarH2BasisCertificate();
  const passed = basis.passed && basis.global_H2 === 'Z ⊕ Z/2';
  return freeze({
    status: passed ? 'UNIVERSAL_COEFFICIENT_THEOREM_CERTIFICATE_PASSED' : 'UNIVERSAL_COEFFICIENT_THEOREM_CERTIFICATE_FAILED',
    passed,
    inherited_H1: 'H1_bar(B;Z) ≅ Z²',
    inherited_H2: basis.global_H2,
    chain_groups_free_abelian: true,
    ext_vanishing_for_every_A: 'Ext_Z^1(Z²,A)=0 for every abelian A because Z² is free/projective.',
    canonical_natural_evaluation: 'H^2_bar(B;A) -> Hom(H2_bar(B;Z),A) is an isomorphism after the Ext kernel vanishes.',
    transport_classification: 'T_2(A)≅H^2_bar(B;A)≅Hom(H,A) naturally in every abelian coefficient group A.',
    coefficient_formula: 'Hom(Z⊕Z/2,A)≅A⊕A[2].',
    wrapper_correction: 'Exact inherited payload is "Z ⊕ Z/2"; the first aggregate accidentally compared it to a longer prose wrapper.',
    theorem_changed: false,
  });
}

export function correctedUniversalCoefficientHolonomyRepresentabilityCertificate() {
  const original = originalAggregate();
  const uct = correctedUniversalCoefficientTheoremCertificate();
  const universal = universalIdentityTransportCertificate();
  const naturality = coefficientNaturalityCertificate();
  const cyclic = cyclicCoefficientParityCertificate();
  const faithful = faithfulTargetCriterionCertificate();
  const examplesPassed = original.examples
    && Object.values(original.examples).every((row) => row?.passed === true);

  const passed = uct.passed
    && universal.passed
    && naturality.passed
    && cyclic.passed
    && faithful.passed
    && examplesPassed;

  return freeze({
    status: passed
      ? 'UNIVERSAL_COEFFICIENT_HOLONOMY_REPRESENTABILITY_CERTIFICATE_PASSED'
      : 'UNIVERSAL_COEFFICIENT_HOLONOMY_REPRESENTABILITY_CERTIFICATE_FAILED',
    passed,
    parent_receipt: UNIVERSAL_COEFFICIENT_HOLONOMY_REPRESENTABILITY_PARENT_RECEIPT,
    original_aggregate_status: original.status,
    original_aggregate_passed: original.passed,
    prewitness_wrapper_correction_applied: true,
    uct,
    universal_identity: universal,
    coefficient_naturality: naturality,
    cyclic_parity: cyclic,
    faithful_target_criterion: faithful,
    examples: original.examples,
    represented_functor: passed ? 'T_2(-) ≅ Hom(H2_bar(B;Z),-) naturally on Ab.' : 'UNEARNED',
    coefficient_classification: passed ? 'T_2(A) ≅ A⊕A[2] for every abelian A.' : 'UNEARNED',
    universal_class: passed ? 'The #775 (kappa,beta) H-valued class U corresponds to id_H and every coefficient-valued class is its unique coefficient pushforward.' : 'UNEARNED',
    classifications: passed ? freeze([
      'THE_FORMAL_DEGREE_TWO_TRANSPORT_EQUIVALENCE_FUNCTOR_ON_ABELIAN_COEFFICIENT_GROUPS_IS_NATURALLY_REPRESENTED_BY_H2_BAR_B_Z',
      'FOR_EVERY_ABELIAN_A_STRICT_B_SQUARED_A_FORMAL_TWO_TRANSPORT_CLASSES_MODULO_FORMAL_BOUNDARY_REZEROING_ARE_NATURALLY_A_CROSS_A_TWO_TORSION',
      'THE_775_KAPPA_BETA_CLASS_IS_THE_UNIVERSAL_IDENTITY_TRANSPORT_CLASS_AND_EVERY_COEFFICIENT_VALUED_FORMAL_TRANSPORT_CLASS_IS_ITS_UNIQUE_COEFFICIENT_PUSHFORWARD',
      'AN_ABELIAN_COEFFICIENT_TARGET_ADMITS_A_FAITHFUL_SINGLE_CLOSED_FORMAL_TWO_HOLONOMY_CHARACTER_IFF_IT_CONTAINS_BOTH_AN_INFINITE_ORDER_ELEMENT_AND_NONZERO_TWO_TORSION',
      'EVERY_FAITHFUL_CHARACTER_HAS_CORE_IMAGE_ISOMORPHIC_TO_Z_CROSS_Z_OVER_TWO_SO_THE_775_TARGET_IS_MINIMAL_IN_THE_EXACT_IMAGE_THEORETIC_SENSE',
    ]) : freeze([]),
    consequential_bearing: passed ? 'UNIVERSAL_COEFFICIENT_FORMAL_TWO_HOLONOMY_REPRESENTABILITY_EARNED' : 'UNEARNED',
    authority_ceiling: original.authority_ceiling,
    scars: freeze([
      ...(original.scars ?? []),
      'exact parent payload != prose wrapper string',
    ]),
  });
}
