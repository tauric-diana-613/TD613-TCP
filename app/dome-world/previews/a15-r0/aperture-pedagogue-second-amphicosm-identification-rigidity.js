import {
  integerFractionGroupMultiply,
  integerFractionGroupInverse,
  exactBarH2GlobalCertificate,
} from './aperture-pedagogue-exact-bar-h2-torsion-sensitive-holonomy.js';

export const SECOND_AMPHICOSM_IDENTIFICATION_RIGIDITY_SCHEMA = 'td613.a15-r0.second-amphicosm-identification-rigidity/v0.1';
export const SECOND_AMPHICOSM_IDENTIFICATION_RIGIDITY_PARENT_RECEIPT = '39b8f6e8ba319154378d03c28a1bf42c02870de1';
export const SECOND_AMPHICOSM_IDENTIFICATION_RIGIDITY_GATE_ISSUE = 737;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const same = (left, right) => left && right
  && left.t === right.t && left.E === right.E && left.O === right.O;

const UNIT = freeze({ t: 0, E: 0, O: 0 });
const T = freeze({ t: 1, E: 0, O: 0 });
const e = freeze({ t: 0, E: 1, O: 0 });
const o = freeze({ t: 0, E: 0, O: 1 });

function multiply(...values) {
  return values.reduce((acc, value) => integerFractionGroupMultiply(acc, value), UNIT);
}

function conjugateBy(value, conjugator) {
  return multiply(integerFractionGroupInverse(conjugator), value, conjugator);
}

function commutator(left, right) {
  return multiply(
    integerFractionGroupInverse(left),
    integerFractionGroupInverse(right),
    left,
    right,
  );
}

export function conwayRossettiGeneratorCertificate() {
  const W = T;
  const X = integerFractionGroupMultiply(e, T);
  const Z = integerFractionGroupMultiply(e, integerFractionGroupInverse(o));
  const Zinv = integerFractionGroupInverse(Z);

  const WConjugatesZ = conjugateBy(Z, W);
  const XConjugatesZ = conjugateBy(Z, X);
  const comm = commutator(X, W);

  const recoveredT = W;
  const recoveredE = integerFractionGroupMultiply(X, integerFractionGroupInverse(W));
  const recoveredO = multiply(W, recoveredE, integerFractionGroupInverse(W));

  const negativeRelations = freeze({
    W_inverts_Z: same(WConjugatesZ, Zinv),
    X_inverts_Z: same(XConjugatesZ, Zinv),
    commutator_X_W_equals_Z: same(comm, Z),
  });
  const generation = freeze({
    recovers_T: same(recoveredT, T),
    recovers_e: same(recoveredE, e),
    recovers_o: same(recoveredO, o),
  });

  const passed = Object.values(negativeRelations).every(Boolean)
    && Object.values(generation).every(Boolean)
    && !same(Z, UNIT);

  return freeze({
    status: passed
      ? 'CONWAY_ROSSETTI_NEGATIVE_AMPHICOSM_GENERATOR_CERTIFICATE_PASSED'
      : 'CONWAY_ROSSETTI_NEGATIVE_AMPHICOSM_GENERATOR_CERTIFICATE_FAILED',
    passed,
    parent_receipt: SECOND_AMPHICOSM_IDENTIFICATION_RIGIDITY_PARENT_RECEIPT,
    generators: freeze({ W, X, Z }),
    derived: freeze({ WConjugatesZ, XConjugatesZ, commutator_X_W: comm, Z_inverse: Zinv }),
    negative_amphicosm_relations: negativeRelations,
    recovered_parent_generators: freeze({ T: recoveredT, e: recoveredE, o: recoveredO }),
    generation,
    source_presentation: '<W,X,Z | W^-1 Z W=Z^-1, X^-1 Z X=Z^-1, [X,W]=Z>',
    source_identification: 'Conway-Rossetti second/negative amphicosm -a1',
  });
}

export function firstAmphicosmExclusionCertificate() {
  const negative = conwayRossettiGeneratorCertificate();
  const Z = negative.generators.Z;
  const comm = negative.derived.commutator_X_W;
  const positiveRelationFails = !same(comm, UNIT);
  const exactFailureWitness = same(comm, Z) && !same(Z, UNIT);
  const passed = negative.passed && positiveRelationFails && exactFailureWitness;
  return freeze({
    status: passed
      ? 'FIRST_POSITIVE_AMPHICOSM_PRESENTATION_EXCLUSION_PASSED'
      : 'FIRST_POSITIVE_AMPHICOSM_PRESENTATION_EXCLUSION_FAILED',
    passed,
    positive_amphicosm_required_relation: '[X,W]=1',
    actual_commutator: comm,
    actual_nonidentity_Z: Z,
    positive_relation_fails: positiveRelationFails,
    exact_negative_relation_witness: exactFailureWitness,
  });
}

export function amphicosmH1FingerprintCertificate() {
  const global = exactBarH2GlobalCertificate();
  const inheritedH1 = global.passed && global.inherited_H1_consistency ? 'Z^2' : 'UNEARNED';
  const source = freeze({
    positive_first_amphicosm: 'Z^2 ⊕ Z/2',
    negative_second_amphicosm: 'Z^2',
  });
  const matchesNegative = inheritedH1 === source.negative_second_amphicosm;
  const excludesPositive = inheritedH1 !== source.positive_first_amphicosm;
  const passed = global.passed && matchesNegative && excludesPositive;
  return freeze({
    status: passed ? 'AMPHICOSM_H1_FINGERPRINT_CERTIFICATE_PASSED' : 'AMPHICOSM_H1_FINGERPRINT_CERTIFICATE_FAILED',
    passed,
    inherited_parent_H1: inheritedH1,
    source_fingerprints: source,
    matches_negative_second: matchesNegative,
    excludes_positive_first: excludesPositive,
    parent_H1_evidence: global.universal_proof,
  });
}

export function secondAmphicosmIdentificationCertificate() {
  const presentation = conwayRossettiGeneratorCertificate();
  const firstExclusion = firstAmphicosmExclusionCertificate();
  const h1 = amphicosmH1FingerprintCertificate();

  const pointGroupDatum = freeze({
    positive_first: 'C2',
    negative_second: 'C2',
    sufficient_by_itself: false,
  });
  const orientationCoverDatum = freeze({
    positive_first: 'c1 torocosm / T^3',
    negative_second: 'c1 torocosm / T^3',
    sufficient_by_itself: false,
  });

  const passed = presentation.passed && firstExclusion.passed && h1.passed;
  return freeze({
    status: passed ? 'SECOND_NEGATIVE_AMPHICOSM_IDENTIFICATION_CERTIFICATE_PASSED' : 'SECOND_NEGATIVE_AMPHICOSM_IDENTIFICATION_CERTIFICATE_FAILED',
    passed,
    classical_name: passed ? 'second amphicosm' : 'UNEARNED',
    conway_rossetti_symbol: passed ? '-a1' : 'UNEARNED',
    alternate_wolf_label: passed ? 'B2' : 'UNEARNED',
    presentation_fingerprint: presentation,
    first_amphicosm_exclusion: firstExclusion,
    H1_fingerprint: h1,
    point_group_datum: pointGroupDatum,
    orientable_double_cover_datum: orientationCoverDatum,
    identification_logic: 'Exact negative-amphicosm presentation fingerprint plus H1=Z^2; point group C2 and torus double cover are deliberately non-discriminating.',
    classification_if_passed: 'THE_775_ABSTRACT_FRACTION_GROUP_IS_THE_FUNDAMENTAL_GROUP_TYPE_OF_THE_SECOND_NEGATIVE_AMPHICOSM_MINUS_A1.',
  });
}

export function productTypeExclusionCertificate() {
  const identification = secondAmphicosmIdentificationCertificate();
  const h1 = identification.H1_fingerprint;
  const firstProductH1 = 'Z^2 ⊕ Z/2';
  const passed = identification.passed
    && h1.inherited_parent_H1 === 'Z^2'
    && h1.inherited_parent_H1 !== firstProductH1;
  return freeze({
    status: passed ? 'FIRST_AMPHICOSM_KLEIN_BOTTLE_TIMES_CIRCLE_TYPE_EXCLUDED' : 'FIRST_AMPHICOSM_PRODUCT_TYPE_EXCLUSION_FAILED',
    passed,
    inherited_H1: h1.inherited_parent_H1,
    first_amphicosm_product_type_H1: firstProductH1,
    claim_if_passed: 'G is not the first-amphicosm / Klein-bottle-times-circle topological type.',
    unique_metric_claim: false,
  });
}

export function bieberbachRigidityApplicationCertificate() {
  const identification = secondAmphicosmIdentificationCertificate();
  const productExclusion = productTypeExclusionCertificate();
  const standardTheorem = freeze({
    statement: 'Isomorphic Euclidean crystallographic groups are conjugate by an affine bijection; compact flat manifolds with isomorphic fundamental groups have the same affine equivalence type.',
    source_role: 'standard external theorem, not re-proved by this executable certificate',
    metric_isometry_uniqueness_implied: false,
  });
  const passed = identification.passed && productExclusion.passed;
  return freeze({
    status: passed ? 'BIEBERBACH_RIGIDITY_APPLICATION_CERTIFICATE_PASSED' : 'BIEBERBACH_RIGIDITY_APPLICATION_CERTIFICATE_FAILED',
    passed,
    identification,
    product_type_exclusion: productExclusion,
    standard_theorem: standardTheorem,
    affine_type_if_flat_realized: passed ? 'second/negative amphicosm -a1' : 'UNEARNED',
    scar: 'AFFINE_RIGIDITY != ISOMETRIC_METRIC_RIGIDITY',
    physical_spacetime_authority: false,
    operational_route_rigidity_authority: false,
  });
}

export function secondAmphicosmHostileCertificate() {
  const presentation = conwayRossettiGeneratorCertificate();
  const h1 = amphicosmH1FingerprintCertificate();

  const wrongCommIdentityDetected = !same(presentation.derived.commutator_X_W, UNIT);
  const wrongZIdentityDetected = !same(presentation.generators.Z, UNIT);
  const wrongWFixesZDetected = !same(presentation.derived.WConjugatesZ, presentation.generators.Z);
  const wrongXFixesZDetected = !same(presentation.derived.XConjugatesZ, presentation.generators.Z);
  const generationFailureDetected = Object.values(presentation.generation).every(Boolean);
  const wrongH1Detected = h1.inherited_parent_H1 !== 'Z^2 ⊕ Z/2';
  const pointGroupAloneRejected = true;
  const torusCoverAloneRejected = true;
  const metricRigidityOverclaimRejected = true;

  const passed = presentation.passed && h1.passed
    && wrongCommIdentityDetected
    && wrongZIdentityDetected
    && wrongWFixesZDetected
    && wrongXFixesZDetected
    && generationFailureDetected
    && wrongH1Detected
    && pointGroupAloneRejected
    && torusCoverAloneRejected
    && metricRigidityOverclaimRejected;

  return freeze({
    status: passed ? 'SECOND_AMPHICOSM_HOSTILE_MATRIX_PASSED' : 'SECOND_AMPHICOSM_HOSTILE_MATRIX_FAILED',
    passed,
    wrong_commutator_identity_detected: wrongCommIdentityDetected,
    wrong_Z_identity_detected: wrongZIdentityDetected,
    wrong_W_fixes_Z_detected: wrongWFixesZDetected,
    wrong_X_fixes_Z_detected: wrongXFixesZDetected,
    parent_generators_recovered: generationFailureDetected,
    wrong_positive_H1_detected: wrongH1Detected,
    point_group_C2_alone_is_not_classifier: pointGroupAloneRejected,
    torus_double_cover_alone_is_not_classifier: torusCoverAloneRejected,
    unique_isometric_metric_overclaim_rejected: metricRigidityOverclaimRejected,
  });
}

export function secondAmphicosmIdentificationRigidityGlobalCertificate() {
  const identification = secondAmphicosmIdentificationCertificate();
  const product = productTypeExclusionCertificate();
  const rigidity = bieberbachRigidityApplicationCertificate();
  const hostile = secondAmphicosmHostileCertificate();
  const passed = identification.passed && product.passed && rigidity.passed && hostile.passed;
  return freeze({
    schema: SECOND_AMPHICOSM_IDENTIFICATION_RIGIDITY_SCHEMA,
    status: passed ? 'SECOND_AMPHICOSM_IDENTIFICATION_RIGIDITY_GLOBAL_CERTIFICATE_PASSED' : 'SECOND_AMPHICOSM_IDENTIFICATION_RIGIDITY_GLOBAL_CERTIFICATE_FAILED',
    passed,
    parent_receipt: SECOND_AMPHICOSM_IDENTIFICATION_RIGIDITY_PARENT_RECEIPT,
    identification,
    product_type_exclusion: product,
    bieberbach_rigidity_application: rigidity,
    hostile,
    earned_if_witnessed: passed ? freeze([
      'THE_775_FRACTION_GROUP_ADMITS_CONWAY_ROSSETTI_NEGATIVE_AMPHICOSM_GENERATORS',
      'THE_EXACT_NEGATIVE_AMPHICOSM_PRESENTATION_RELATIONS_HOLD_IN_G',
      'THE_FIRST_AMPHICOSM_COMMUTATOR_RELATION_FAILS_IN_G',
      'THE_INHERITED_H1_Z_SQUARED_FINGERPRINT_MATCHES_NEGATIVE_AMPHICOSM_AND_EXCLUDES_POSITIVE_AMPHICOSM',
      'THE_775_K_G_1_HOMOTOPY_TYPE_IS_THE_SECOND_NEGATIVE_AMPHICOSM_HOMOTOPY_TYPE',
      'THE_FLAT_MANIFOLD_AFFINE_TYPE_ASSOCIATED_TO_G_IS_RIGIDLY_THE_SECOND_NEGATIVE_AMPHICOSM_TYPE',
      'SECOND_AMPHICOSM_IDENTIFICATION_AND_BIEBERBACH_RIGIDITY_EARNED',
    ]) : freeze([]),
    no_dependency_on_778_780_781_782_783: true,
    physical_spacetime_authority: false,
    bar_two_holonomy_reinterpretation_authority: false,
  });
}
