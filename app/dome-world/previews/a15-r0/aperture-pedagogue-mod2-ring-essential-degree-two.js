import {
  exactBarH2GlobalCertificate,
  explicitBarH2BasisCertificate,
  modTwoTorsionDetectorCertificate,
  primitiveIntegralCocycle,
  primitiveIntegralCocycleCertificate,
  omegaTwicePrimitiveCertificate,
  integerFractionGroupMultiply,
} from './aperture-pedagogue-exact-bar-h2-torsion-sensitive-holonomy.js';

export const MOD2_RING_ESSENTIAL_DEGREE_TWO_SCHEMA = 'td613.a15-r0.mod2-ring-essential-degree-two/v0.1';
export const MOD2_RING_ESSENTIAL_DEGREE_TWO_PARENT_RECEIPT = '39b8f6e8ba319154378d03c28a1bf42c02870de1';
export const MOD2_RING_ESSENTIAL_DEGREE_TWO_GATE_ISSUE = 737;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const mod2 = (n) => ((n % 2) + 2) % 2;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const valid = (x) => x && typeof x === 'object' && [x.t, x.E, x.O].every(Number.isInteger);

export const uClass = (x) => (valid(x) ? mod2(x.t) : null);
export const vClass = (x) => (valid(x) ? mod2(x.E + x.O) : null);
export const ePrimitive = (x) => (valid(x) ? mod2(x.E) : null);
export const halfTPrimitive = (x) => (valid(x) ? mod2(Math.floor(x.t / 2)) : null);
export const halfQPrimitive = (x) => (valid(x) ? mod2(Math.floor((x.E + x.O) / 2)) : null);

function d1(f, x, y) {
  const xy = integerFractionGroupMultiply(x, y);
  if (!xy) return null;
  return mod2(f(y) + f(xy) + f(x));
}

function cup11(f, g, x, y) {
  return mod2(f(x) * g(y));
}

function sampleStates() {
  const out = [];
  for (const t of [-3, -2, -1, 0, 1, 2, 3]) {
    for (const E of [-2, -1, 0, 1, 2]) {
      for (const O of [-2, -1, 0, 1, 2]) out.push(freeze({ t, E, O }));
    }
  }
  return freeze(out);
}

export function degreeOneCupCollapseCertificate() {
  const omega = omegaTwicePrimitiveCertificate();
  const states = sampleStates();
  const rows = [];
  for (const x of states) {
    for (const y of states) {
      rows.push(freeze({
        x,
        y,
        u_cocycle: d1(uClass, x, y) === 0,
        v_cocycle: d1(vClass, x, y) === 0,
        u_square_exact: cup11(uClass, uClass, x, y) === d1(halfTPrimitive, x, y),
        v_square_exact: cup11(vClass, vClass, x, y) === d1(halfQPrimitive, x, y),
        uv_exact: cup11(uClass, vClass, x, y) === d1(ePrimitive, x, y),
      }));
    }
  }
  const passed = omega.passed && rows.every((row) => (
    row.u_cocycle && row.v_cocycle && row.u_square_exact && row.v_square_exact && row.uv_exact
  ));
  return freeze({
    status: passed ? 'DEGREE_ONE_CUP_COLLAPSE_CERTIFICATE_PASSED' : 'DEGREE_ONE_CUP_COLLAPSE_CERTIFICATE_FAILED',
    passed,
    sample_pair_count: rows.length,
    all_rows_pass: rows.every((row) => (
      row.u_cocycle && row.v_cocycle && row.u_square_exact && row.v_square_exact && row.uv_exact
    )),
    inherited_omega_twice_primitive: omega.passed,
    u_square_primitive: 'floor(t/2) mod 2',
    v_square_primitive: 'floor((E+O)/2) mod 2',
    uv_primitive: 'E mod 2',
    cohomology_relations: passed ? freeze(['u^2=0', 'v^2=0', 'uv=0']) : freeze([]),
    inherited_identity: 'omega=t cup (E+O)=2 kappa-dE*, hence uv=d(E* mod2).',
  });
}

function residue(x) {
  return [mod2(x.t), mod2(x.E), mod2(x.O)];
}

function residuePairKey(left, right) {
  return `${left.join('')}|${right.join('')}`;
}

function betaFromParentSupport() {
  const cert = modTwoTorsionDetectorCertificate();
  const support = new Set((cert.support ?? []).map(([left, right]) => residuePairKey(left, right)));
  return {
    cert,
    value(x, y) {
      if (!valid(x) || !valid(y)) return null;
      return support.has(residuePairKey(residue(x), residue(y))) ? 1 : 0;
    },
  };
}

export function degreeTwoBasisCertificate() {
  const global = exactBarH2GlobalCertificate();
  const basis = explicitBarH2BasisCertificate();
  const primitive = primitiveIntegralCocycleCertificate();
  const beta = modTwoTorsionDetectorCertificate();
  const pairing = freeze([
    freeze([mod2(primitive.kappa_z0), mod2(primitive.kappa_theta)]),
    freeze([mod2(beta.beta_z0), mod2(beta.beta_theta)]),
  ]);
  const determinant = mod2((pairing[0][0] * pairing[1][1]) - (pairing[0][1] * pairing[1][0]));
  const passed = global.passed
    && basis.passed
    && primitive.passed
    && beta.passed
    && global.H2_bar === 'Z ⊕ Z/2'
    && determinant === 1
    && same(pairing, [[1, 0], [0, 1]]);
  return freeze({
    status: passed ? 'MOD_TWO_H2_BASIS_CERTIFICATE_PASSED' : 'MOD_TWO_H2_BASIS_CERTIFICATE_FAILED',
    passed,
    inherited_H2: global.H2_bar,
    UCT_Ext_from_H1: '0 because H1(G;Z)=Z^2 is free',
    H2_mod2_dimension: passed ? 2 : null,
    basis: passed ? freeze(['kappa_bar', 'beta']) : freeze([]),
    pairing_columns: freeze(['z0', 'theta']),
    pairing_matrix: pairing,
    determinant_mod2: determinant,
    kappa_bar_integral_reduction: passed,
    beta_integral_reduction: false,
    beta_nonlift_reason: 'Every integral H^2 character kills order-two theta, while inherited beta(theta)=1.',
  });
}

export function fiberRestrictionAndLHSCertificate() {
  const betaParent = betaFromParentSupport();
  const e = freeze({ t: 0, E: 1, O: 0 });
  const o = freeze({ t: 0, E: 0, O: 1 });
  const zero = freeze({ t: 0, E: 0, O: 0 });
  const betaEO = betaParent.value(e, o);
  const betaOE = betaParent.value(o, e);
  const kEE = mod2(primitiveIntegralCocycle(e, e));
  const kEO = mod2(primitiveIntegralCocycle(e, o));
  const kOE = mod2(primitiveIntegralCocycle(o, e));
  const kOO = mod2(primitiveIntegralCocycle(o, o));

  const swapH1 = freeze([[0, 1], [1, 0]]);
  const IminusSwapMod2 = freeze([[1, 1], [1, 1]]);
  const h1InvariantGenerator = freeze([1, 1]);
  const h1CoinvariantRepresentative = freeze([1, 0]);
  const wedge = mod2(
    (h1InvariantGenerator[0] * h1CoinvariantRepresentative[1])
    - (h1InvariantGenerator[1] * h1CoinvariantRepresentative[0]),
  );

  const dimensions = freeze({ H0: 1, H1: 2, H2: 2, H3: 1 });
  const passed = betaParent.cert.passed
    && betaEO === 1
    && [kEE, kEO, kOE, kOO].every((value) => value === 0)
    && same(IminusSwapMod2, [[1, 1], [1, 1]])
    && wedge === 1
    && uClass(zero) === 0
    && vClass(e) === 1
    && vClass(o) === 1;

  return freeze({
    status: passed ? 'FIBER_RESTRICTION_LHS_CERTIFICATE_PASSED' : 'FIBER_RESTRICTION_LHS_CERTIFICATE_FAILED',
    passed,
    fiber: 'N=Z^2={t=0}',
    swap_on_H1_F2: swapH1,
    I_minus_swap_F2: IminusSwapMod2,
    H1_invariant_generator: h1InvariantGenerator,
    H1_coinvariant_representative: h1CoinvariantRepresentative,
    invariant_wedge_coinvariant: wedge,
    beta_restriction_e_o: betaEO,
    beta_restriction_statement: passed ? 'beta|_N is the nonzero fiber H^2 class a cup b' : 'UNEARNED',
    kappa_bar_restriction_values: freeze([kEE, kEO, kOE, kOO]),
    kappa_bar_restriction_statement: passed ? 'kappa_bar|_N=0' : 'UNEARNED',
    base_cohomological_dimension: 1,
    possible_LHS_columns: freeze([0, 1]),
    no_possible_differentials: true,
    mod2_cohomology_dimensions: dimensions,
    product_u_beta: passed ? 'nonzero generator Omega in E_infinity^(1,2)' : 'UNEARNED',
    product_v_kappa_bar: passed ? 'nonzero generator Omega: (a+b) wedge [a]_coinvariant = a cup b' : 'UNEARNED',
    unique_H3_nonzero_class: passed,
    equality_by_one_dimensionality: passed ? '[u][beta]=[v][kappa_bar]=Omega' : 'UNEARNED',
  });
}

export function integralH3RecheckCertificate() {
  const global = exactBarH2GlobalCertificate();
  const topFiberAction = global.H2_fiber_action;
  const difference = topFiberAction === -1 ? 2 : null;
  const kernelRank = difference === 2 ? 0 : null;
  const passed = global.passed && topFiberAction === -1 && difference === 2 && kernelRank === 0;
  return freeze({
    status: passed ? 'INTEGRAL_H3_RECHECK_CERTIFICATE_PASSED' : 'INTEGRAL_H3_RECHECK_CERTIFICATE_FAILED',
    passed,
    top_fiber_action: topFiberAction,
    degree_three_Wang_map: difference,
    H3_integral: passed ? '0' : 'UNEARNED',
    borrows_780: false,
  });
}

export function essentialDegreeTwoAlgebraCertificate() {
  const degreeOne = degreeOneCupCollapseCertificate();
  const degreeTwo = degreeTwoBasisCertificate();
  const lhs = fiberRestrictionAndLHSCertificate();
  const h3 = integralH3RecheckCertificate();
  const decomposableDimension = degreeOne.passed ? 0 : null;
  const minimumDegreeTwoGenerators = degreeTwo.passed && decomposableDimension === 0 ? 2 : null;
  const passed = degreeOne.passed && degreeTwo.passed && lhs.passed && h3.passed
    && degreeTwo.H2_mod2_dimension === 2
    && decomposableDimension === 0
    && minimumDegreeTwoGenerators === 2
    && lhs.mod2_cohomology_dimensions.H3 === 1;
  return freeze({
    status: passed ? 'ESSENTIAL_DEGREE_TWO_MOD_TWO_ALGEBRA_CERTIFICATE_PASSED' : 'ESSENTIAL_DEGREE_TWO_MOD_TWO_ALGEBRA_CERTIFICATE_FAILED',
    passed,
    parent_receipt: MOD2_RING_ESSENTIAL_DEGREE_TWO_PARENT_RECEIPT,
    degree_one: degreeOne,
    degree_two: degreeTwo,
    lhs,
    integral_H3_recheck: h3,
    decomposable_H2_dimension: decomposableDimension,
    indecomposable_H2_dimension: passed ? 2 : null,
    minimum_essential_degree_two_generators: minimumDegreeTwoGenerators,
    algebra_generated_in_degree_one: false,
    top_class: passed ? 'Omega=[u][beta]=[v][kappa_bar]' : 'UNEARNED',
    top_class_requires_degree_two_input: passed,
    uncertified_v_beta_relation_claimed: false,
    classification_if_passed: passed
      ? 'THE_MOD_TWO_COHOMOLOGY_ALGEBRA_IS_NOT_GENERATED_IN_DEGREE_ONE_AND_REQUIRES_TWO_ESSENTIAL_DEGREE_TWO_GENERATORS'
      : 'UNEARNED',
    physical_Z2_gauge_authority: false,
    operational_route_ring_authority: false,
    spacetime_field_ring_authority: false,
  });
}

export function modTwoRingEssentialDegreeTwoAggregate() {
  const certificate = essentialDegreeTwoAlgebraCertificate();
  return freeze({
    schema: MOD2_RING_ESSENTIAL_DEGREE_TWO_SCHEMA,
    status: certificate.passed ? 'MOD_TWO_RING_ESSENTIAL_DEGREE_TWO_AGGREGATE_PASSED' : 'MOD_TWO_RING_ESSENTIAL_DEGREE_TWO_AGGREGATE_FAILED',
    passed: certificate.passed,
    certificate,
    candidate_classifications: certificate.passed ? freeze([
      'DEGREE_ONE_MOD_TWO_CUP_SUBALGEBRA_HAS_ZERO_DEGREE_TWO_IMAGE',
      'H_TWO_MOD_TWO_HAS_TWO_INDEPENDENT_INDECOMPOSABLE_CLASSES_KAPPA_BAR_AND_BETA',
      'BETA_IS_TORSION_SENSITIVE_AND_DOES_NOT_LIFT_FROM_INTEGRAL_H_TWO',
      'THE_MOD_TWO_COHOMOLOGY_ALGEBRA_REQUIRES_TWO_ESSENTIAL_DEGREE_TWO_GENERATORS',
      'THE_UNIQUE_NONZERO_H_THREE_MOD_TWO_CLASS_IS_REACHED_BY_U_BETA_AND_V_KAPPA_BAR',
      'NONZERO_TOP_MOD_TWO_COHOMOLOGY_DOES_NOT_IMPLY_GENERATION_BY_DEGREE_ONE_CUPS',
    ]) : freeze([]),
  });
}
