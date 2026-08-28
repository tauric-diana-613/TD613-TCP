import {
  sameBaseComparisonArrow,
  sectionRezeroedComparisonReturn,
} from './aperture-pedagogue-same-base-comparison-representation.js';
import {
  quotientBaseForRoute,
  firstMomentForRoute,
} from './aperture-pedagogue-parallel-lift-fiber-return.js';
import {
  transportIncrementCocycle,
} from './aperture-pedagogue-affine-transport-increment-cocycle.js';
import {
  relationBarCycle,
  pairTwoCochainWithBarChain,
} from './aperture-pedagogue-quotient-obstruction-bar-cycle-cohomology.js';

export const RELATION_GROUPOID_EXACTNESS_DESCENT_OBSTRUCTION_SCHEMA = 'td613.a15-r0.relation-groupoid-exactness-descent-obstruction/v0.1';
export const RELATION_GROUPOID_EXACTNESS_DESCENT_OBSTRUCTION_PARENT_RECEIPT = '6af55b5bca86a4578c8cb6edbfa3721d427207d9';
export const RELATION_GROUPOID_EXACTNESS_DESCENT_OBSTRUCTION_GATE_ISSUE = 737;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const canonicalInteger = (value) => (value === 0 ? 0 : value);
const keyOf = (value) => JSON.stringify(value);

function validWord(word) {
  return Array.isArray(word) && word.every((token) => token === 'T' || token === 'Q');
}

function sameWord(a, b) {
  return validWord(a) && validWord(b) && keyOf(a) === keyOf(b);
}

function routeCounts(word) {
  if (!validWord(word)) return null;
  let t = 0;
  let q = 0;
  for (const token of word) {
    if (token === 'T') t += 1;
    else q += 1;
  }
  return freeze({ t, q });
}

function baseFor(word) {
  const out = quotientBaseForRoute(word);
  if (out?.status !== 'PARALLEL_LIFT_ROUTE_BASE_DERIVED') return null;
  return freeze({ t: out.base.t, E: out.base.E, O: out.base.O });
}

function momentFor(word) {
  const out = firstMomentForRoute(word);
  if (out?.status !== 'PARALLEL_LIFT_FIRST_MOMENT_DERIVED') return null;
  return out.P;
}

export function relationGroupoidOneCocycle(u, v) {
  const arrow = sameBaseComparisonArrow(u, v);
  if (arrow.status !== 'FORMAL_SAME_BASE_COMPARISON_ARROW_DERIVED') {
    return freeze({ status: 'RELATION_GROUPOID_ONE_COCYCLE_ABSTAINS', parent: arrow });
  }
  return freeze({
    status: 'RELATION_GROUPOID_EXACT_ONE_COCYCLE_DERIVED',
    source: arrow.source,
    target: arrow.target,
    base: arrow.base,
    c: arrow.translation,
    P_source: arrow.P_source,
    P_target: arrow.P_target,
    exact_potential_identity: arrow.translation === arrow.P_target - arrow.P_source,
  });
}

export function routeWiseTrivializedComparison(u, v, coordinate = 0) {
  if (!Number.isInteger(coordinate)) {
    return freeze({ status: 'ROUTE_WISE_TRIVIALIZATION_ABSTAINS_NONINTEGER_COORDINATE' });
  }
  const c = relationGroupoidOneCocycle(u, v);
  if (c.status !== 'RELATION_GROUPOID_EXACT_ONE_COCYCLE_DERIVED') return c;

  // g_w(n)=n-P(w).  Therefore g_v^{-1}(n)=n+P(v).
  const sourceRaw = coordinate + c.P_source;
  const represented = sourceRaw + c.c;
  const targetGauged = canonicalInteger(represented - c.P_target);

  return freeze({
    status: 'ROUTE_WISE_COMPARISON_TRIVIALIZATION_DERIVED',
    input_coordinate: coordinate,
    source_raw_coordinate: sourceRaw,
    represented_coordinate: represented,
    target_gauged_coordinate: targetGauged,
    identity_after_conjugation: targetGauged === coordinate,
    symbolic: 'g_u o rho([u<-v]) o g_v^-1(n)=(n+P(v))+(P(u)-P(v))-P(u)=n.',
    jurisdiction: 'ROUTE_OBJECT_DEPENDENT_GAUGE_ON_RELATION_GROUPOID',
  });
}

export function closedRelationComparisonCycle(routes) {
  if (!Array.isArray(routes) || routes.length < 2 || !routes.every(validWord)) {
    return freeze({ status: 'RELATION_COMPARISON_CYCLE_ABSTAINS' });
  }
  const arrows = [];
  let total = 0;
  for (let i = 0; i < routes.length; i += 1) {
    const source = routes[i];
    const target = routes[(i + 1) % routes.length];
    const arrow = relationGroupoidOneCocycle(target, source);
    if (arrow.status !== 'RELATION_GROUPOID_EXACT_ONE_COCYCLE_DERIVED') {
      return freeze({ status: 'RELATION_COMPARISON_CYCLE_ABSTAINS_NONCOMPOSABLE', failed_edge: freeze({ source, target }) });
    }
    total += arrow.c;
    arrows.push(arrow);
  }
  return freeze({
    status: 'CLOSED_RELATION_COMPARISON_CIRCULATION_DERIVED',
    arrows: freeze(arrows),
    total_translation: canonicalInteger(total),
    zero_circulation: total === 0,
    symbolic: 'sum_i(P(u_(i+1))-P(u_i))=0 on every finite closed comparison cycle by telescoping.',
  });
}

function exactOneCocycleCertificate() {
  const u = freeze(['T', 'T', 'Q', 'Q']);
  const v = freeze(['Q', 'T', 'T', 'Q']);
  const w = freeze(['Q', 'Q', 'T', 'T']);
  const uv = relationGroupoidOneCocycle(u, v);
  const vu = relationGroupoidOneCocycle(v, u);
  const vv = relationGroupoidOneCocycle(v, v);
  const uw = relationGroupoidOneCocycle(u, w);
  const vw = relationGroupoidOneCocycle(v, w);
  const cycle = closedRelationComparisonCycle(freeze([u, v, w]));
  return freeze({
    passed: uv.c === 2
      && vu.c === -2
      && vv.c === 0
      && uw.c === uv.c + vw.c
      && [uv, vu, vv, uw, vw].every((row) => row.exact_potential_identity)
      && cycle.zero_circulation,
    identity: vv,
    inverse_pair: freeze({ uv, vu }),
    compositional_pair: freeze({ uv, vw, uw }),
    closed_cycle: cycle,
    universal_identity: 'For every same-base pair c(u,v)=P(u)-P(v), hence c is the exact relation-groupoid 1-coboundary delta P; all finite closed comparison circulations telescope to zero.',
  });
}

function routeWiseGaugeCertificate() {
  const pairs = freeze([
    freeze([freeze(['T', 'T', 'Q']), freeze(['Q', 'T', 'T'])]),
    freeze([freeze(['T', 'T', 'Q', 'Q']), freeze(['Q', 'Q', 'T', 'T'])]),
    freeze([freeze(['T', 'Q', 'T', 'Q', 'T']), freeze(['Q', 'T', 'T', 'T', 'Q'])]),
  ]);
  const coordinates = freeze([-9, 0, 7]);
  const rows = [];
  for (const [u, v] of pairs) {
    for (const n of coordinates) {
      const row = routeWiseTrivializedComparison(u, v, n);
      rows.push(freeze({ u, v, n, row, passed: row.identity_after_conjugation }));
    }
  }
  return freeze({
    passed: rows.every((row) => row.passed),
    rows: freeze(rows),
    all_finite_identity: 'The conjugation identity is algebraic in P(u),P(v),n and therefore holds for every lawful same-base authored pair and every integer fiber coordinate.',
  });
}

function baseSectionNontrivializationCertificate() {
  const u = freeze(['T', 'T', 'Q']);
  const v = freeze(['Q', 'T', 'T']);
  const phiA = (b) => (b.t * b.t) + b.E + b.O;
  const phiB = (b) => (3 * b.t) - (2 * b.E) + (5 * b.O);
  const original = relationGroupoidOneCocycle(u, v);
  const a = sectionRezeroedComparisonReturn(u, v, phiA);
  const b = sectionRezeroedComparisonReturn(u, v, phiB);
  return freeze({
    passed: original.c === 2
      && a.invariant && b.invariant
      && a.transformed_translation === 2
      && b.transformed_translation === 2,
    original,
    section_a: a,
    section_b: b,
    universal_identity: '[P(u)+phi(pi(u))]-[P(v)+phi(pi(v))]=P(u)-P(v) whenever pi(u)=pi(v).',
    conclusion: 'A route-object-dependent trivializer is outside inherited base-section jurisdiction unless its route potential descends through pi.',
  });
}

function freeMonoidHomomorphismDescentLemma() {
  const generatorValues = freeze([
    freeze({ aT: 1, aQ: 0 }),
    freeze({ aT: 0, aQ: 1 }),
    freeze({ aT: -3, aQ: 5 }),
  ]);
  const words = freeze([
    freeze([]),
    freeze(['T']),
    freeze(['Q']),
    freeze(['T', 'Q', 'T', 'Q', 'Q']),
    freeze(['Q', 'T', 'T', 'Q', 'T', 'Q']),
  ]);
  const rows = [];
  for (const coeff of generatorValues) {
    for (const word of words) {
      const counts = routeCounts(word);
      const base = baseFor(word);
      const routeValue = (coeff.aT * counts.t) + (coeff.aQ * counts.q);
      const baseValue = (coeff.aT * base.t) + (coeff.aQ * (base.E + base.O));
      rows.push(freeze({ coeff, word, counts, base, route_value: routeValue, base_value: baseValue, equal: routeValue === baseValue }));
    }
  }
  return freeze({
    passed: rows.every((row) => row.equal),
    rows: freeze(rows),
    all_finite_identity: 'Any monoid homomorphism h:{T,Q}*->Z is h(T)#T+h(Q)#Q.  Under pi, #T=t and #Q=E+O, so h=lambda o pi with lambda(t,E,O)=h(T)t+h(Q)(E+O).',
  });
}

function pulledBackCocycleIdentityCertificate() {
  const pairs = freeze([
    freeze([freeze([]), freeze([])]),
    freeze([freeze(['T']), freeze(['Q'])]),
    freeze([freeze(['Q']), freeze(['T'])]),
    freeze([freeze(['T', 'T']), freeze(['Q'])]),
    freeze([freeze(['Q', 'T']), freeze(['T', 'Q'])]),
  ]);
  const rows = pairs.map(([u, v]) => {
    const bu = baseFor(u);
    const bv = baseFor(v);
    const Pu = momentFor(u);
    const Pv = momentFor(v);
    const Puv = momentFor(freeze([...u, ...v]));
    const dMinusP = (-Pu) + (-Pv) - (-Puv);
    const omega = transportIncrementCocycle(bu, bv);
    return freeze({ u, v, d_minus_P: dMinusP, pulled_back_omega: omega, equal: dMinusP === omega });
  });
  return freeze({
    passed: rows.every((row) => row.equal),
    rows: freeze(rows),
    all_finite_identity: '#733 gives P(uv)=P(u)+P(v)+omega(pi(u),pi(v)); therefore d(-P)=pi*omega for every finite authored route pair.',
  });
}

function descentCoboundaryEquivalenceCertificate() {
  const countLemma = freeMonoidHomomorphismDescentLemma();
  const pullback = pulledBackCocycleIdentityCertificate();
  const cycle = relationBarCycle();
  const omegaPairing = pairTwoCochainWithBarChain(transportIncrementCocycle, cycle.chain);
  const u = freeze(['T', 'T', 'Q']);
  const v = freeze(['Q', 'T', 'T']);
  const arrow = relationGroupoidOneCocycle(u, v);

  return freeze({
    passed: countLemma.passed
      && pullback.passed
      && cycle.passed
      && omegaPairing.value === 2
      && arrow.c === 2,
    free_monoid_homomorphism_descent: countLemma,
    pulled_back_cocycle_identity: pullback,
    inherited_bar_cycle: freeze({
      boundary_zero: cycle.boundary.is_cycle,
      omega_pairing: omegaPairing.value,
      inherited_consequence: '<omega,z>=2 while every coboundary pairs 0 with the witnessed bar cycle; #735 therefore established omega non-coboundary in the declared integer complex.',
    }),
    concrete_non_descent_witness: freeze({
      u,
      v,
      same_base: arrow.status === 'RELATION_GROUPOID_EXACT_ONE_COCYCLE_DERIVED',
      P_u: arrow.P_target,
      P_v: arrow.P_source,
      return_translation: arrow.c,
    }),
    equivalence: freeze([
      'rho is identity on every same-base arrow iff P is constant on every pi-fiber (exact #763 kernel).',
      'P is constant on every pi-fiber iff P descends to a function Pbar on the surjective authored quotient image B.',
      'If P=Pbar o pi, then d(-P)=pi*omega and surjectivity imply omega=d(-Pbar), so omega is a coboundary.',
      'If omega=d phi, then h=-P-phi o pi has dh=0 and is a monoid homomorphism on the free T/Q monoid. Every such h descends through B because B retains #T=t and #Q=E+O. Thus h=lambda o pi and P=-(phi+lambda) o pi descends.',
    ]),
    actual_domain_consequence: '[omega] != 0 => P does not descend => rho is nonidentity on at least one same-base comparison; TTQ/QTT witnesses tau_2.',
  });
}

function antiOverclaimCertificate() {
  const exact = exactOneCocycleCertificate();
  const routeGauge = routeWiseGaugeCertificate();
  return freeze({
    passed: exact.passed && routeGauge.passed,
    statements: freeze([
      'EXACT_RELATION_GROUPOID_ONE_COCYCLE_NOT_HOLONOMY_REPRESENTATION',
      'ROUTE_WISE_GAUGE_TRIVIALITY_NOT_LAWFUL_BASE_SECTION_GAUGE_TRIVIALITY',
      'NONTRIVIAL_DOWNSTAIRS_H2_CLASS_NOT_OPERATIONAL_LOOP',
      'BAR_2_CYCLE_NOT_OPERATIONAL_TQ_LOOP',
      'FORMAL_RELATION_GROUPOID_NOT_OPERATIONAL_PATH_GROUPOID',
      'NO_CONNECTION_CURVATURE_TWO_HOLONOMY_GERBE_OR_BERRY_PROMOTION',
    ]),
  });
}

export function relationGroupoidExactnessDescentObstructionCertificate() {
  const exact = exactOneCocycleCertificate();
  const routeGauge = routeWiseGaugeCertificate();
  const baseGauge = baseSectionNontrivializationCertificate();
  const descent = descentCoboundaryEquivalenceCertificate();
  const quarantine = antiOverclaimCertificate();
  const passed = [exact.passed, routeGauge.passed, baseGauge.passed, descent.passed, quarantine.passed].every(Boolean);

  return freeze({
    schema: RELATION_GROUPOID_EXACTNESS_DESCENT_OBSTRUCTION_SCHEMA,
    parent_receipt: RELATION_GROUPOID_EXACTNESS_DESCENT_OBSTRUCTION_PARENT_RECEIPT,
    gate_issue: RELATION_GROUPOID_EXACTNESS_DESCENT_OBSTRUCTION_GATE_ISSUE,
    status: passed
      ? 'RELATION_GROUPOID_EXACTNESS_AND_DOWNSTAIRS_DESCENT_OBSTRUCTION_CERTIFIED'
      : 'RELATION_GROUPOID_EXACTNESS_AND_DOWNSTAIRS_DESCENT_OBSTRUCTION_FAILED',
    passed,
    exact_relation_groupoid_one_cocycle: exact,
    route_wise_trivialization: routeGauge,
    base_section_nontrivialization: baseGauge,
    descent_coboundary_equivalence: descent,
    anti_overclaim: quarantine,
    canonical_classifications: freeze(passed ? [
      'THE_SAME_BASE_RETURN_REPRESENTATION_IS_AN_EXACT_RELATION_GROUPOID_ONE_COBOUNDARY_UPSTAIRS_AND_HAS_ZERO_CLOSED_COMPARISON_CIRCULATION',
      'TRIVIALITY_OF_ALL_SAME_BASE_RETURNS_IS_EQUIVALENT_IN_THE_AUTHORED_FREE_MONOID_QUOTIENT_TO_DESCENT_OF_P_AND_TO_COBOUNDARY_TRIVIALITY_OF_THE_DOWNSTAIRS_INTEGER_TWO_COCYCLE',
      'THE_NONZERO_DOWNSTAIRS_TWO_COHOMOLOGY_CLASS_IS_EXACTLY_THE_OBSTRUCTION_TO_DESCENDING_THE_ROUTE_WISE_TRIVIALIZING_PRIMITIVE_THROUGH_THE_TARGET_QUOTIENT',
    ] : []),
    bearing: passed
      ? 'THE_CURRENT_NONIDENTITY_COMPARISON_RETURNS_ARE_NOT_INTRINSIC_ONE_HOLONOMY_OF_THE_ROUTE_RELATION_GROUPOID; THEIR_NONTRIVIAL_BASE_DESCENT_CONTENT_LIVES_ONE_COHOMOLOGICAL_DEGREE_HIGHER_IN_THE_DOWNSTAIRS_TWO_COCYCLE_OBSTRUCTION.'
      : null,
    claim_ceiling: freeze([
      'NO_OPERATIONAL_TQ_LOOP_OR_PATH_GROUPOID',
      'NO_HOLONOMY_REPRESENTATION_PROMOTION',
      'NO_CONNECTION_OR_CURVATURE',
      'NO_TWO_HOLONOMY_OR_GERBE_PROMOTION',
      'NO_BERRY_OR_QUANTUM_ANALOGY',
      'NO_PROTO_LOOM_A16_MERGE_PUBLICATION_PRODUCTION_OR_VERCEL',
    ]),
  });
}
