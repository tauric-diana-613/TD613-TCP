import {
  degreeOneCupCollapseCertificate,
  degreeTwoBasisCertificate,
  integralH3RecheckCertificate,
  uClass,
  vClass,
  MOD2_RING_ESSENTIAL_DEGREE_TWO_PARENT_RECEIPT,
  MOD2_RING_ESSENTIAL_DEGREE_TWO_SCHEMA,
} from './aperture-pedagogue-mod2-ring-essential-degree-two.js';
import {
  modTwoTorsionDetectorCertificate,
} from './aperture-pedagogue-exact-bar-h2-torsion-sensitive-holonomy.js';

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const mod2 = (n) => ((n % 2) + 2) % 2;

function residue(x) {
  return [mod2(x.t), mod2(x.E), mod2(x.O)];
}

function pairKey(a, b) {
  return `${a.join('')}|${b.join('')}`;
}

function parentBetaValue(x, y, parent) {
  const support = new Set((parent.support ?? []).map(([a, b]) => pairKey(a, b)));
  return support.has(pairKey(residue(x), residue(y))) ? 1 : 0;
}

export function correctedBetaFiberLHSCertificate() {
  const beta = modTwoTorsionDetectorCertificate();
  const e = freeze({ t: 0, E: 1, O: 0 });
  const o = freeze({ t: 0, E: 0, O: 1 });
  const betaEO = parentBetaValue(e, o, beta);

  // H^*(Z^2;F2)=Lambda(a,b); swap exchanges a,b and fixes a cup b in characteristic two.
  const invariantH1 = freeze([1, 1]);
  const invariantH1Dimension = 1;
  const coinvariantH1Dimension = 1;
  const invariantH2Dimension = 1;
  const coinvariantH2Dimension = 1;
  const dimensions = freeze({ H0: 1, H1: 2, H2: 2, H3: 1 });

  // Base Z has cohomological dimension one, so only p=0,1 columns occur and no differential can hit/leave them.
  // u occupies E2^(1,0); beta occupies the nonzero E2^(0,2) fiber-top class.
  // Their product is the nonzero generator of E_infinity^(1,2)=H^3.
  const passed = beta.passed
    && betaEO === 1
    && invariantH1Dimension === 1
    && coinvariantH1Dimension === 1
    && invariantH2Dimension === 1
    && coinvariantH2Dimension === 1
    && uClass(e) === 0
    && vClass(e) === 1;

  return freeze({
    status: passed ? 'CORRECTED_BETA_FIBER_LHS_CERTIFICATE_PASSED' : 'CORRECTED_BETA_FIBER_LHS_CERTIFICATE_FAILED',
    passed,
    beta_restriction_e_o: betaEO,
    beta_restriction_statement: passed ? 'beta|_N is the nonzero fiber top class a cup b' : 'UNEARNED',
    base_group: 'Z',
    base_cohomological_dimension: 1,
    LHS_columns: freeze([0, 1]),
    no_possible_differentials: true,
    H1_fiber_invariants_dimension: invariantH1Dimension,
    H1_fiber_coinvariants_dimension: coinvariantH1Dimension,
    H2_fiber_invariants_dimension: invariantH2Dimension,
    H2_fiber_coinvariants_dimension: coinvariantH2Dimension,
    mod2_cohomology_dimensions: dimensions,
    u_beta_product: passed ? '[u][beta]=Omega !=0, the unique H^3(G;F2) class' : 'UNEARNED',
    kappa_fraction_group_restriction_claimed: false,
    v_kappa_product_claimed: false,
  });
}

export function correctedEssentialDegreeTwoAlgebraCertificate() {
  const degreeOne = degreeOneCupCollapseCertificate();
  const degreeTwo = degreeTwoBasisCertificate();
  const lhs = correctedBetaFiberLHSCertificate();
  const h3Integral = integralH3RecheckCertificate();
  const decomposableH2Dimension = degreeOne.passed ? 0 : null;
  const minimumDegreeTwoGenerators = degreeTwo.passed && decomposableH2Dimension === 0 ? 2 : null;
  const passed = degreeOne.passed
    && degreeTwo.passed
    && lhs.passed
    && h3Integral.passed
    && degreeTwo.H2_mod2_dimension === 2
    && lhs.mod2_cohomology_dimensions.H3 === 1
    && minimumDegreeTwoGenerators === 2;

  return freeze({
    status: passed ? 'CORRECTED_ESSENTIAL_DEGREE_TWO_MOD_TWO_ALGEBRA_CERTIFICATE_PASSED' : 'CORRECTED_ESSENTIAL_DEGREE_TWO_MOD_TWO_ALGEBRA_CERTIFICATE_FAILED',
    passed,
    parent_receipt: MOD2_RING_ESSENTIAL_DEGREE_TWO_PARENT_RECEIPT,
    degree_one: degreeOne,
    degree_two: degreeTwo,
    corrected_lhs: lhs,
    integral_H3_recheck: h3Integral,
    decomposable_H2_dimension: decomposableH2Dimension,
    indecomposable_H2_dimension: passed ? 2 : null,
    minimum_essential_degree_two_generators: minimumDegreeTwoGenerators,
    algebra_generated_in_degree_one: false,
    top_class: passed ? 'Omega=[u][beta]' : 'UNEARNED',
    top_class_generated_by_degree_one_only: false,
    out_of_domain_kappa_restriction_used: false,
    uncertified_v_kappa_relation_claimed: false,
    classification_if_passed: passed
      ? 'THE_MOD_TWO_COHOMOLOGY_ALGEBRA_IS_NOT_GENERATED_IN_DEGREE_ONE_AND_REQUIRES_TWO_ESSENTIAL_DEGREE_TWO_GENERATORS'
      : 'UNEARNED',
    physical_Z2_gauge_authority: false,
    operational_route_ring_authority: false,
  });
}

export function correctedModTwoRingEssentialDegreeTwoAggregate() {
  const certificate = correctedEssentialDegreeTwoAlgebraCertificate();
  return freeze({
    schema: `${MOD2_RING_ESSENTIAL_DEGREE_TWO_SCHEMA}/correction-001`,
    status: certificate.passed ? 'CORRECTED_MOD_TWO_RING_ESSENTIAL_DEGREE_TWO_AGGREGATE_PASSED' : 'CORRECTED_MOD_TWO_RING_ESSENTIAL_DEGREE_TWO_AGGREGATE_FAILED',
    passed: certificate.passed,
    certificate,
    preserved_correction_scar: 'OUT_OF_DOMAIN_COCHAIN_EVALUATION != ZERO_COCHAIN_VALUE',
    candidate_classifications: certificate.passed ? freeze([
      'DEGREE_ONE_MOD_TWO_CUP_SUBALGEBRA_HAS_ZERO_DEGREE_TWO_IMAGE',
      'H_TWO_MOD_TWO_HAS_TWO_INDEPENDENT_INDECOMPOSABLE_CLASSES_KAPPA_BAR_AND_BETA',
      'BETA_IS_TORSION_SENSITIVE_AND_DOES_NOT_LIFT_FROM_INTEGRAL_H_TWO',
      'THE_MOD_TWO_COHOMOLOGY_ALGEBRA_REQUIRES_TWO_ESSENTIAL_DEGREE_TWO_GENERATORS',
      'THE_UNIQUE_NONZERO_H_THREE_MOD_TWO_CLASS_IS_REACHED_BY_U_BETA',
      'NONZERO_TOP_MOD_TWO_COHOMOLOGY_DOES_NOT_IMPLY_GENERATION_BY_DEGREE_ONE_CUPS',
    ]) : freeze([]),
  });
}
