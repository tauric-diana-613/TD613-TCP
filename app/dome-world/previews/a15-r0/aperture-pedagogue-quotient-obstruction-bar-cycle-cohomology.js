import {
  multiplyQuotientCoordinates,
  quotientCoordinate,
} from './aperture-pedagogue-target-equivalence-quotient-congruence.js';
import {
  firstMomentCoordinate,
} from './aperture-pedagogue-first-moment-weaker-transport-quotient.js';
import {
  baseQ,
  transportIncrementCocycle,
} from './aperture-pedagogue-affine-transport-increment-cocycle.js';

export const QUOTIENT_OBSTRUCTION_BAR_CYCLE_COHOMOLOGY_SCHEMA = 'td613.a15-r0.aperture-pedagogue-quotient-obstruction-bar-cycle-cohomology/v0.1';
export const QUOTIENT_OBSTRUCTION_BAR_CYCLE_COHOMOLOGY_PARENT_RECEIPT = '6bc000024f02e5780910ee24694561d5dc542003';

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const keyOf = (value) => JSON.stringify(value);

function validBase(x) {
  return x && [x.t, x.E, x.O].every((n) => Number.isInteger(n) && n >= 0);
}

function plainBase(x) {
  return freeze({ t: x.t, E: x.E, O: x.O });
}

function sameBase(a, b) {
  return validBase(a) && validBase(b)
    && a.t === b.t && a.E === b.E && a.O === b.O;
}

function product(left, right) {
  const out = multiplyQuotientCoordinates(left, right);
  if (out?.status !== 'PARITY_TWISTED_QUOTIENT_PRODUCT_DERIVED') return null;
  return plainBase(out);
}

function coordinateForWord(word) {
  const out = quotientCoordinate(word);
  if (out?.status !== 'TARGET_EQUIVALENCE_QUOTIENT_COORDINATE_DERIVED') return null;
  return plainBase(out);
}

export const T_COORDINATE = freeze({ t: 1, E: 0, O: 0 });
export const Q_COORDINATE = freeze({ t: 0, E: 1, O: 0 });

function addCoefficient(map, coordinate, coefficient) {
  const key = keyOf(coordinate);
  const current = map.get(key) ?? { coordinate, coefficient: 0 };
  current.coefficient += coefficient;
  if (current.coefficient === 0) map.delete(key);
  else map.set(key, current);
}

export function boundaryOfBar2Chain(chain) {
  const coefficients = new Map();
  for (const term of chain) {
    if (!Number.isInteger(term.coefficient) || !validBase(term.left) || !validBase(term.right)) {
      return freeze({ status: 'BAR_2_BOUNDARY_ABSTAINS', terms: freeze([]), is_cycle: false });
    }
    const xy = product(term.left, term.right);
    if (!xy) return freeze({ status: 'BAR_2_BOUNDARY_ABSTAINS', terms: freeze([]), is_cycle: false });
    // ∂[x|y] = [y] - [x★y] + [x].
    addCoefficient(coefficients, term.right, term.coefficient);
    addCoefficient(coefficients, xy, -term.coefficient);
    addCoefficient(coefficients, term.left, term.coefficient);
  }
  const terms = [...coefficients.values()]
    .map(({ coordinate, coefficient }) => freeze({ coordinate: plainBase(coordinate), coefficient }))
    .sort((a, b) => keyOf(a.coordinate).localeCompare(keyOf(b.coordinate)));
  return freeze({
    status: 'NORMALIZED_BAR_2_BOUNDARY_DERIVED',
    terms: freeze(terms),
    is_cycle: terms.length === 0,
  });
}

export function relationBarCycle() {
  const T = T_COORDINATE;
  const Q = Q_COORDINATE;
  const TT = product(T, T);
  const QT = product(Q, T);
  const TTQ = product(TT, Q);
  const QTT = product(QT, T);
  const chain = freeze([
    freeze({ coefficient: 1, left: T, right: T, label: '[T|T]' }),
    freeze({ coefficient: 1, left: TT, right: Q, label: '[TT|Q]' }),
    freeze({ coefficient: -1, left: Q, right: T, label: '-[Q|T]' }),
    freeze({ coefficient: -1, left: QT, right: T, label: '-[QT|T]' }),
  ]);
  const boundary = boundaryOfBar2Chain(chain);
  return freeze({
    status: 'QUOTIENT_RELATION_BAR_2_CYCLE_DERIVED',
    T,
    Q,
    TT,
    QT,
    TTQ,
    QTT,
    common_target_equal: sameBase(TTQ, QTT),
    common_target: TTQ,
    chain,
    boundary,
    passed: sameBase(TTQ, QTT) && boundary.is_cycle,
    symbolic_boundary: '([T]-[TT]+[T])+([Q]-[TTQ]+[TT])-([T]-[QT]+[Q])-([T]-[QTT]+[QT]) = -[TTQ]+[QTT] = 0 because TTQ=QTT in B.',
  });
}

export function pairTwoCochainWithBarChain(cochain, chain) {
  let total = 0;
  const terms = [];
  for (const term of chain) {
    const value = cochain(term.left, term.right);
    if (!Number.isInteger(value)) return freeze({ status: 'BAR_PAIRING_ABSTAINS', value: null, terms: freeze([]) });
    const contribution = term.coefficient * value;
    total += contribution;
    terms.push(freeze({ label: term.label, coefficient: term.coefficient, cochain_value: value, contribution }));
  }
  return freeze({ status: 'BAR_2_COCHAIN_PAIRING_DERIVED', value: total, terms: freeze(terms) });
}

export function normalizedOneCoboundary(phi, left, right) {
  if (!validBase(left) || !validBase(right)) return null;
  const xy = product(left, right);
  if (!xy) return null;
  const a = phi(left);
  const b = phi(right);
  const c = phi(xy);
  if (![a, b, c].every(Number.isInteger)) return null;
  return a + b - c;
}

function formalCoboundaryTelescopingCertificate(cycle) {
  // Pairing dφ with z equals pairing φ with ∂z.  Compute the latter as
  // formal coefficients of every quotient coordinate, without choosing φ.
  const boundary = boundaryOfBar2Chain(cycle.chain);
  return freeze({
    passed: boundary.is_cycle && boundary.terms.length === 0,
    arbitrary_phi_coefficients: boundary.terms,
    identity: '<dφ,z>=<φ,∂z>=0 for every normalized integer-valued 1-cochain φ because ∂z=0.',
    quantifier: 'ALL_NORMALIZED_INTEGER_VALUED_1_COCHAINS_ON_B',
  });
}

function concreteCoboundaryControls(cycle) {
  const phiA = (x) => x.t * x.t + x.E + x.O;
  const phiB = (x) => (3 * x.t) - (2 * x.E) + (5 * x.O);
  const cochains = freeze([
    freeze({ name: 'phi_quadratic', fn: phiA }),
    freeze({ name: 'phi_linear_asymmetric', fn: phiB }),
  ]);
  const rows = cochains.map(({ name, fn }) => {
    const dphi = (x, y) => normalizedOneCoboundary(fn, x, y);
    const pairing = pairTwoCochainWithBarChain(dphi, cycle.chain);
    return freeze({ name, pairing: pairing.value, passed: pairing.value === 0 });
  });
  return freeze({ passed: rows.every((row) => row.passed), rows: freeze(rows) });
}

export function swappedTransportCocycle(left, right) {
  if (!validBase(left) || !validBase(right)) return null;
  return baseQ(left) * right.t;
}

function chi(left) {
  return -(left.t * baseQ(left));
}

function swappedClassRelationCertificate(cycle) {
  const samples = freeze([
    freeze([freeze({ t: 0, E: 0, O: 0 }), freeze({ t: 1, E: 0, O: 0 })]),
    freeze([T_COORDINATE, Q_COORDINATE]),
    freeze([Q_COORDINATE, T_COORDINATE]),
    freeze([freeze({ t: 3, E: 2, O: 1 }), freeze({ t: 4, E: 5, O: 7 })]),
    freeze([freeze({ t: 2, E: 4, O: 1 }), freeze({ t: 1, E: 3, O: 6 })]),
  ]);
  const rows = samples.map(([x, y]) => {
    const dChi = normalizedOneCoboundary(chi, x, y);
    const sum = transportIncrementCocycle(x, y) + swappedTransportCocycle(x, y);
    return freeze({ x, y, d_chi: dChi, omega_plus_swap: sum, equal: dChi === sum });
  });
  const omegaPair = pairTwoCochainWithBarChain(transportIncrementCocycle, cycle.chain);
  const swapPair = pairTwoCochainWithBarChain(swappedTransportCocycle, cycle.chain);
  return freeze({
    passed: rows.every((row) => row.equal) && omegaPair.value === 2 && swapPair.value === -2,
    rows: freeze(rows),
    omega_pairing: omegaPair.value,
    swapped_pairing: swapPair.value,
    symbolic: 'For χ=-tq and additive t,q: dχ=-t_xq_x-t_yq_y+(t_x+t_y)(q_x+q_y)=t_xq_y+t_yq_x=ω+ω_swap. Hence [ω_swap]=-[ω] in the declared integer monoid cohomology.',
  });
}

function cocycleDefect(cochain, x, y, z) {
  const xy = product(x, y);
  const yz = product(y, z);
  if (!xy || !yz) return null;
  return cochain(y, z) - cochain(xy, z) + cochain(x, yz) - cochain(x, y);
}

function parityFragileQuarantine() {
  const omegaE = (x, y) => x.t * y.E;
  const defect = cocycleDefect(omegaE, T_COORDINATE, T_COORDINATE, Q_COORDINATE);
  return freeze({
    passed: defect !== 0,
    defect_T_T_Q: defect,
    classification: 'PARITY_FRAGILE_tE_REMAINS_OUTSIDE_Z2_AND_RECEIVES_NO_COHOMOLOGY_CLASS',
  });
}

function fakeCycleRejection() {
  const fake = freeze([
    freeze({ coefficient: 1, left: T_COORDINATE, right: Q_COORDINATE, label: '[T|Q]' }),
    freeze({ coefficient: -1, left: Q_COORDINATE, right: T_COORDINATE, label: '-[Q|T]' }),
  ]);
  const boundary = boundaryOfBar2Chain(fake);
  return freeze({
    passed: !boundary.is_cycle && boundary.terms.length > 0,
    chain: fake,
    boundary,
    lesson: 'A visually loop-like difference of two directed products is not a bar cycle unless its boundary actually cancels.',
  });
}

function routePrimitive(word) {
  const c = firstMomentCoordinate(word);
  if (c?.status !== 'FIRST_MOMENT_WEAKER_TRANSPORT_COORDINATE_DERIVED') return null;
  return c.P === 0 ? 0 : -c.P;
}

function pulledBackCoboundary(u, v) {
  const su = routePrimitive(u);
  const sv = routePrimitive(v);
  const suv = routePrimitive([...u, ...v]);
  if (![su, sv, suv].every(Number.isInteger)) return null;
  return su + sv - suv;
}

function upstairsPrimitiveCertificate() {
  const pairs = freeze([
    freeze([freeze([]), freeze([])]),
    freeze([freeze(['T']), freeze(['Q'])]),
    freeze([freeze(['Q']), freeze(['T'])]),
    freeze([freeze(['T', 'T']), freeze(['Q'])]),
    freeze([freeze(['Q', 'T']), freeze(['T', 'Q'])]),
    freeze([freeze(['T', 'Q', 'T']), freeze(['Q', 'T', 'T', 'Q'])]),
  ]);
  const rows = pairs.map(([u, v]) => {
    const cu = coordinateForWord(u);
    const cv = coordinateForWord(v);
    const dS = pulledBackCoboundary(u, v);
    const omega = transportIncrementCocycle(cu, cv);
    return freeze({ u, v, d_s: dS, pulled_back_omega: omega, equal: dS === omega });
  });
  return freeze({
    passed: rows.every((row) => row.equal),
    rows: freeze(rows),
    all_finite_identity: 'With s=-P and #733 P(uv)=P(u)+t(u)q(v)+P(v), ds=-P(u)-P(v)+P(uv)=t(u)q(v)=ω(πu,πv) for every finite authored route pair.',
    classification: 'PULLBACK_COCYCLE_EXACT_ON_FREE_ROUTE_MONOID_BY_ROUTE_PRIMITIVE_MINUS_P',
  });
}

function primitiveDescentFailureCertificate() {
  const leftWord = freeze(['T', 'T', 'Q']);
  const rightWord = freeze(['Q', 'T', 'T']);
  const leftBase = coordinateForWord(leftWord);
  const rightBase = coordinateForWord(rightWord);
  const leftMoment = firstMomentCoordinate(leftWord);
  const rightMoment = firstMomentCoordinate(rightWord);
  const leftPrimitive = routePrimitive(leftWord);
  const rightPrimitive = routePrimitive(rightWord);
  return freeze({
    passed: sameBase(leftBase, rightBase)
      && leftMoment.P === 2
      && rightMoment.P === 0
      && leftPrimitive === -2
      && rightPrimitive === 0,
    left_word: leftWord,
    right_word: rightWord,
    common_base: leftBase,
    P_left: leftMoment.P,
    P_right: rightMoment.P,
    s_left: leftPrimitive,
    s_right: rightPrimitive,
    conclusion: 'The route-level primitive s=-P is not constant on π-fibers and therefore cannot descend to a single-valued 1-cochain B->Z.',
  });
}

function integerCohomologyObstructionCertificate(cycle) {
  const omegaPairing = pairTwoCochainWithBarChain(transportIncrementCocycle, cycle.chain);
  const telescope = formalCoboundaryTelescopingCertificate(cycle);
  const concrete = concreteCoboundaryControls(cycle);
  const nControls = freeze([-3, -1, 0, 1, 2, 5].map((n) => freeze({
    n,
    pairing: n * omegaPairing.value,
    expected: 2 * n,
    equal: n * omegaPairing.value === 2 * n,
  })));
  return freeze({
    passed: cycle.passed
      && omegaPairing.value === 2
      && telescope.passed
      && concrete.passed
      && nControls.every((row) => row.equal),
    omega_pairing: omegaPairing,
    arbitrary_coboundary_pairing: telescope,
    concrete_coboundaries: concrete,
    integer_multiple_controls: nControls,
    universal_multiple_identity: '<nω,z>=n<ω,z>=2n; over Z this is zero iff n=0.',
    cohomology_conclusion: 'ω is not a coboundary, so [ω] is nonzero in the declared normalized H^2(B;Z); no nonzero integer multiple is a coboundary, so this class has infinite additive order.',
    homology_conclusion: 'Because ω is a cocycle and <ω,z>=2, z cannot be a bar 2-boundary in the declared integer complex. The same pairing shows no nonzero integer multiple of [z] vanishes.',
    scope: 'DECLARED_NORMALIZED_MONOID_BAR_COMPLEX_WITH_TRIVIAL_INTEGER_COEFFICIENTS_ONLY',
  });
}

function coefficientBoundaryCertificate(cycle) {
  const pairing = pairTwoCochainWithBarChain(transportIncrementCocycle, cycle.chain).value;
  return freeze({
    passed: pairing === 2 && ((pairing % 2) + 2) % 2 === 0,
    integer_pairing: pairing,
    reduction_mod_2_of_this_detector: 0,
    claim: 'The integer nonzero-pairing certificate does not transfer automatically to mod-2 coefficients. Mod-2 cohomology is not audited here.',
  });
}

function receiptExternalityCertificate() {
  const base = coordinateForWord(['T', 'T', 'Q']);
  const a = freeze({ receipt: 'R1', base });
  const b = freeze({ receipt: 'R1_DUP', base });
  const omegaA = transportIncrementCocycle(a.base, Q_COORDINATE);
  const omegaB = transportIncrementCocycle(b.base, Q_COORDINATE);
  return freeze({
    passed: a.receipt !== b.receipt && omegaA === omegaB,
    receipt_a: a.receipt,
    receipt_b: b.receipt,
    cocycle_value: omegaA,
    conclusion: 'Receipt identity remains external to quotient cochain evaluation.',
  });
}

export function runQuotientObstructionBarCycleCohomologyAssay() {
  const cycle = relationBarCycle();
  const obstruction = integerCohomologyObstructionCertificate(cycle);
  const upstairs = upstairsPrimitiveCertificate();
  const descent = primitiveDescentFailureCertificate();
  const swapped = swappedClassRelationCertificate(cycle);
  const fakeCycle = fakeCycleRejection();
  const parityFragile = parityFragileQuarantine();
  const coefficientBoundary = coefficientBoundaryCertificate(cycle);
  const receiptExternality = receiptExternalityCertificate();

  const passed = [
    cycle.passed,
    obstruction.passed,
    upstairs.passed,
    descent.passed,
    swapped.passed,
    fakeCycle.passed,
    parityFragile.passed,
    coefficientBoundary.passed,
    receiptExternality.passed,
  ].every(Boolean);

  return freeze({
    schema: QUOTIENT_OBSTRUCTION_BAR_CYCLE_COHOMOLOGY_SCHEMA,
    parent_receipt: QUOTIENT_OBSTRUCTION_BAR_CYCLE_COHOMOLOGY_PARENT_RECEIPT,
    passed,
    relation_cycle: cycle,
    cohomology_obstruction: obstruction,
    upstairs_route_primitive: upstairs,
    primitive_descent_failure: descent,
    swapped_directed_class_relation: swapped,
    fake_cycle_rejection: fakeCycle,
    parity_fragile_quarantine: parityFragile,
    coefficient_boundary: coefficientBoundary,
    receipt_externality: receiptExternality,
    canonical_classification: passed
      ? 'QUOTIENT_DESCENT_FAILURE_OF_ROUTE_PRIMITIVE_YIELDS_EXPLICIT_NONZERO_INFINITE_ORDER_NORMALIZED_MONOID_H2_CLASS_DETECTED_BY_FINITE_BAR_2_CYCLE'
      : 'QUOTIENT_OBSTRUCTION_BAR_CYCLE_COHOMOLOGY_AUDITION_FAILED',
    secondary_classification: passed
      ? 'EXPLICIT_BAR_RELATION_2_CYCLE_PAIRS_TO_TWO_WITH_TRANSPORT_COCYCLE_AND_IS_NONBOUNDARY_IN_DECLARED_INTEGER_BAR_COMPLEX'
      : null,
    upstairs_classification: passed
      ? 'PULLED_BACK_TRANSPORT_COCYCLE_IS_EXACT_ON_FREE_ROUTE_MONOID_WHILE_ITS_PRIMITIVE_FAILS_TARGET_QUOTIENT_DESCENT'
      : null,
    claim_ceiling: freeze([
      'NO_FULL_H2_COMPUTATION',
      'NO_MOD_P_CLASSIFICATION',
      'NO_GROUP_COMPLETION_OR_GROUP_COHOMOLOGY',
      'NO_OPERATIONAL_INVERSE_OR_GROUPOID',
      'BAR_2_CYCLE_NOT_OPERATIONAL_NONIDENTITY_LOOP',
      'NO_CONNECTION_HOLONOMY_CURVATURE_OR_BERRY_PROMOTION',
      'NO_HIGHER_MOMENT_COMPLETENESS_OR_ASYMPTOTIC_HIERARCHY',
      'NO_PROTO_LOOM_A16_LIVE_ASH_MERGE_PRODUCTION_OR_VERCEL_AUTHORITY',
    ]),
  });
}
