import {
  multiplyQuotientCoordinates,
  quotientCoordinate,
} from './aperture-pedagogue-target-equivalence-quotient-congruence.js';
import {
  firstMomentCoordinate,
} from './aperture-pedagogue-first-moment-weaker-transport-quotient.js';
import {
  transportIncrementCocycle,
} from './aperture-pedagogue-affine-transport-increment-cocycle.js';
import {
  Q_COORDINATE,
  T_COORDINATE,
  pairTwoCochainWithBarChain,
  relationBarCycle,
  swappedTransportCocycle,
} from './aperture-pedagogue-quotient-obstruction-bar-cycle-cohomology.js';

export const COCYCLE_EXTENSION_SPLITTING_OBSTRUCTION_SCHEMA = 'td613.a15-r0.aperture-pedagogue-cocycle-extension-splitting-obstruction/v0.1';
export const COCYCLE_EXTENSION_SPLITTING_OBSTRUCTION_RECEIVING_PARENT = 'e9228f0f2225bcc5944f413197ce98bb52d45b39';
export const COCYCLE_EXTENSION_SPLITTING_OBSTRUCTION_SCIENTIFIC_PARENT = 'f0f8239d14fbce6ca1cc72c8588a61a8ec16149a';
export const COCYCLE_EXTENSION_SPLITTING_OBSTRUCTION_GATE_ISSUE = 737;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const keyOf = (value) => JSON.stringify(value);
const canonicalInteger = (value) => (value === 0 ? 0 : value);

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

function baseProduct(left, right) {
  const out = multiplyQuotientCoordinates(left, right);
  if (out?.status !== 'PARITY_TWISTED_QUOTIENT_PRODUCT_DERIVED') return null;
  return plainBase(out);
}

function baseForWord(word) {
  const out = quotientCoordinate(word);
  if (out?.status !== 'TARGET_EQUIVALENCE_QUOTIENT_COORDINATE_DERIVED') return null;
  return plainBase(out);
}

function validExtensionPoint(point) {
  return point && Number.isInteger(point.fiber) && validBase(point.base);
}

function sameExtensionPoint(a, b) {
  return validExtensionPoint(a) && validExtensionPoint(b)
    && a.fiber === b.fiber && sameBase(a.base, b.base);
}

export function extensionIdentity() {
  return freeze({ fiber: 0, base: freeze({ t: 0, E: 0, O: 0 }) });
}

export function cocycleExtensionProduct(left, right, omega = transportIncrementCocycle) {
  if (!validExtensionPoint(left) || !validExtensionPoint(right) || typeof omega !== 'function') {
    return freeze({ status: 'COCYCLE_EXTENSION_PRODUCT_ABSTAINS' });
  }
  const product = baseProduct(left.base, right.base);
  const cocycleValue = omega(left.base, right.base);
  if (!product || !Number.isInteger(cocycleValue)) {
    return freeze({ status: 'COCYCLE_EXTENSION_PRODUCT_ABSTAINS' });
  }
  return freeze({
    status: 'DECLARED_INTEGER_COCYCLE_EXTENSION_PRODUCT_DERIVED',
    fiber: canonicalInteger(left.fiber + right.fiber + cocycleValue),
    base: product,
  });
}

export function projectExtension(point) {
  if (!validExtensionPoint(point)) return freeze({ status: 'COCYCLE_EXTENSION_PROJECTION_ABSTAINS' });
  return freeze({
    status: 'COCYCLE_EXTENSION_PROJECTION_DERIVED',
    base: plainBase(point.base),
  });
}

export function sectionLift(base, f = () => 0) {
  if (!validBase(base) || typeof f !== 'function') return freeze({ status: 'COCYCLE_EXTENSION_SECTION_ABSTAINS' });
  const fiber = f(base);
  if (!Number.isInteger(fiber)) return freeze({ status: 'COCYCLE_EXTENSION_SECTION_ABSTAINS' });
  return freeze({
    status: 'COCYCLE_EXTENSION_SECTION_POINT_DERIVED',
    fiber: canonicalInteger(fiber),
    base: plainBase(base),
  });
}

export function normalizedOneCoboundary(f, left, right) {
  if (typeof f !== 'function' || !validBase(left) || !validBase(right)) return null;
  const xy = baseProduct(left, right);
  if (!xy) return null;
  const values = [f(left), f(right), f(xy)];
  if (!values.every(Number.isInteger)) return null;
  return canonicalInteger(values[0] + values[1] - values[2]);
}

export function sectionMultiplicativityDefect(f, left, right) {
  if (typeof f !== 'function' || !validBase(left) || !validBase(right)) return null;
  const xy = baseProduct(left, right);
  if (!xy) return null;
  const values = [f(left), f(right), f(xy), transportIncrementCocycle(left, right)];
  if (!values.every(Number.isInteger)) return null;
  return canonicalInteger(values[0] + values[1] + values[3] - values[2]);
}

function symbolicAssociativityCertificate() {
  const leftMonomials = freeze([
    'm', 'n', 'r', 'omega(x,y)', 'omega(x★y,z)',
  ]);
  const rightMonomials = freeze([
    'm', 'n', 'r', 'omega(y,z)', 'omega(x,y★z)',
  ]);
  return freeze({
    passed: true,
    left_fiber: 'm+n+r+ω(x,y)+ω(x★y,z)',
    right_fiber: 'm+n+r+ω(y,z)+ω(x,y★z)',
    associator_difference: 'ω(x,y)+ω(x★y,z)-ω(y,z)-ω(x,y★z)=0',
    authority: 'ALL_B_COORDINATES_BY_THE_WITNESSED_#734_NORMALIZED_2_COCYCLE_IDENTITY',
    left_monomials: leftMonomials,
    right_monomials: rightMonomials,
  });
}

function concreteAssociativityControls() {
  const points = freeze([
    freeze({ fiber: 0, base: freeze({ t: 0, E: 0, O: 0 }) }),
    freeze({ fiber: 2, base: T_COORDINATE }),
    freeze({ fiber: -3, base: Q_COORDINATE }),
    freeze({ fiber: 5, base: freeze({ t: 2, E: 3, O: 1 }) }),
    freeze({ fiber: -7, base: freeze({ t: 3, E: 2, O: 4 }) }),
  ]);
  const triples = freeze([
    freeze([points[1], points[2], points[3]]),
    freeze([points[2], points[1], points[4]]),
    freeze([points[3], points[4], points[1]]),
    freeze([points[0], points[4], points[2]]),
  ]);
  const rows = triples.map(([a, b, c]) => {
    const left = cocycleExtensionProduct(cocycleExtensionProduct(a, b), c);
    const right = cocycleExtensionProduct(a, cocycleExtensionProduct(b, c));
    return freeze({ a, b, c, left, right, equal: sameExtensionPoint(left, right) });
  });
  return freeze({
    passed: rows.every((row) => row.equal),
    rows: freeze(rows),
    authority: 'FINITE_IMPLEMENTATION_CORROBORATION_ONLY_NOT_UNIVERSAL_PROOF',
  });
}

function identityCertificate() {
  const e = extensionIdentity();
  const samples = freeze([
    freeze({ fiber: 0, base: T_COORDINATE }),
    freeze({ fiber: -4, base: Q_COORDINATE }),
    freeze({ fiber: 9, base: freeze({ t: 3, E: 2, O: 5 }) }),
  ]);
  const rows = samples.map((point) => {
    const left = cocycleExtensionProduct(e, point);
    const right = cocycleExtensionProduct(point, e);
    return freeze({ point, left, right, left_equal: sameExtensionPoint(left, point), right_equal: sameExtensionPoint(right, point) });
  });
  return freeze({
    passed: rows.every((row) => row.left_equal && row.right_equal),
    identity: e,
    rows: freeze(rows),
    symbolic: 'Normalization gives ω(e,x)=ω(x,e)=0, so (0,e_B) is a two-sided identity.',
  });
}

function projectionCertificate() {
  const samples = freeze([
    freeze([freeze({ fiber: 2, base: T_COORDINATE }), freeze({ fiber: -1, base: Q_COORDINATE })]),
    freeze([freeze({ fiber: 7, base: freeze({ t: 2, E: 3, O: 1 }) }), freeze({ fiber: 4, base: freeze({ t: 1, E: 5, O: 2 }) })]),
  ]);
  const rows = samples.map(([left, right]) => {
    const extensionProduct = cocycleExtensionProduct(left, right);
    const projectedProduct = projectExtension(extensionProduct);
    const base = baseProduct(left.base, right.base);
    return freeze({ left, right, projected_product: projectedProduct, base_product: base, equal: sameBase(projectedProduct.base, base) });
  });
  return freeze({
    passed: rows.every((row) => row.equal)
      && sameBase(projectExtension(extensionIdentity()).base, extensionIdentity().base),
    rows: freeze(rows),
    symbolic: 'p((m,x)◇(n,y))=x★y=p(m,x)★p(n,y).',
  });
}

function canonicalSectionDefectCertificate() {
  const zero = () => 0;
  const defectTQ = sectionMultiplicativityDefect(zero, T_COORDINATE, Q_COORDINATE);
  const product = cocycleExtensionProduct(sectionLift(T_COORDINATE), sectionLift(Q_COORDINATE));
  const tq = baseProduct(T_COORDINATE, Q_COORDINATE);
  const direct = sectionLift(tq);
  return freeze({
    passed: defectTQ === 1
      && product.fiber === 1
      && direct.fiber === 0
      && sameBase(product.base, direct.base),
    defect_T_Q: defectTQ,
    product_of_zero_section_points: product,
    zero_section_of_product: direct,
    symbolic: 'Def_0(x,y)=0+0+ω(x,y)-0=ω(x,y); in particular Def_0(T,Q)=1.',
  });
}

function generalSectionCriterionCertificate() {
  const functions = freeze([
    freeze({ name: 'linear', fn: (x) => (2 * x.t) + x.E - (3 * x.O) }),
    freeze({ name: 'quadratic', fn: (x) => (x.t * x.t) + x.E + x.O }),
  ]);
  const pairs = freeze([
    freeze([T_COORDINATE, Q_COORDINATE]),
    freeze([Q_COORDINATE, T_COORDINATE]),
    freeze([freeze({ t: 3, E: 2, O: 1 }), freeze({ t: 2, E: 4, O: 5 })]),
  ]);
  const rows = [];
  for (const { name, fn } of functions) {
    for (const [x, y] of pairs) {
      const df = normalizedOneCoboundary(fn, x, y);
      const omega = transportIncrementCocycle(x, y);
      const defect = sectionMultiplicativityDefect(fn, x, y);
      rows.push(freeze({ name, x, y, df, omega, defect, expected: canonicalInteger(df + omega), equal: defect === canonicalInteger(df + omega) }));
    }
  }
  return freeze({
    passed: rows.every((row) => row.equal),
    rows: freeze(rows),
    graph_form: 'Every section σ of p has σ(x)=(f(x),x) because its second coordinate must equal x; f is unique as the first coordinate.',
    criterion: 'σ_f homomorphic iff f(x★y)=f(x)+f(y)+ω(x,y), equivalently df=-ω under #735 d-convention.',
    identity_requirement: 'A monoid-homomorphic section preserves identity, so f(e_B)=0.',
  });
}

function downstairsNonSplittingCertificate() {
  const cycle = relationBarCycle();
  const omegaPair = pairTwoCochainWithBarChain(transportIncrementCocycle, cycle.chain);
  const negativeOmegaPair = -omegaPair.value;
  return freeze({
    passed: cycle.passed && omegaPair.value === 2 && negativeOmegaPair === -2,
    cycle_boundary_zero: cycle.boundary.is_cycle,
    omega_pairing: omegaPair.value,
    negative_omega_pairing: negativeOmegaPair,
    certificate: 'Every normalized integer coboundary pairs to 0 with #735 z. If df=-ω, then <df,z>=-2, contradiction. Equivalently ω=d(-f), contradicting #735.',
    conclusion: 'NO_GLOBAL_MONOID_HOMOMORPHIC_SECTION_OF_p_EXISTS_ON_DECLARED_E_OMEGA_OVER_B',
    scope: 'INHERITED_#735_NORMALIZED_INTEGER_BAR_COMPLEX_ONLY',
  });
}

function routeMoment(word) {
  const coordinate = firstMomentCoordinate(word);
  if (coordinate?.status !== 'FIRST_MOMENT_WEAKER_TRANSPORT_COORDINATE_DERIVED') return null;
  return canonicalInteger(coordinate.P);
}

function validRouteLift(point) {
  return point && Number.isInteger(point.fiber) && Array.isArray(point.word)
    && point.word.every((token) => token === 'T' || token === 'Q');
}

function sameRouteLift(a, b) {
  return validRouteLift(a) && validRouteLift(b)
    && a.fiber === b.fiber && keyOf(a.word) === keyOf(b.word);
}

export function pullbackExtensionProduct(left, right) {
  if (!validRouteLift(left) || !validRouteLift(right)) {
    return freeze({ status: 'PULLBACK_COCYCLE_EXTENSION_PRODUCT_ABSTAINS' });
  }
  const leftBase = baseForWord(left.word);
  const rightBase = baseForWord(right.word);
  const omega = transportIncrementCocycle(leftBase, rightBase);
  if (!leftBase || !rightBase || !Number.isInteger(omega)) {
    return freeze({ status: 'PULLBACK_COCYCLE_EXTENSION_PRODUCT_ABSTAINS' });
  }
  return freeze({
    status: 'FREE_ROUTE_PULLBACK_COCYCLE_EXTENSION_PRODUCT_DERIVED',
    fiber: canonicalInteger(left.fiber + right.fiber + omega),
    word: freeze([...left.word, ...right.word]),
  });
}

export function firstMomentRouteSection(word, sign = 1) {
  if (!Array.isArray(word) || !word.every((token) => token === 'T' || token === 'Q') || ![1, -1].includes(sign)) {
    return freeze({ status: 'FREE_ROUTE_FIRST_MOMENT_SECTION_ABSTAINS' });
  }
  const P = routeMoment(word);
  if (!Number.isInteger(P)) return freeze({ status: 'FREE_ROUTE_FIRST_MOMENT_SECTION_ABSTAINS' });
  return freeze({
    status: sign === 1 ? 'FREE_ROUTE_FIRST_MOMENT_P_SECTION_DERIVED' : 'FREE_ROUTE_WRONG_SIGN_MINUS_P_SECTION_DERIVED',
    fiber: canonicalInteger(sign * P),
    word: freeze([...word]),
  });
}

function freeRouteSplittingCertificate() {
  const pairs = freeze([
    freeze([freeze([]), freeze([])]),
    freeze([freeze(['T']), freeze(['Q'])]),
    freeze([freeze(['Q']), freeze(['T'])]),
    freeze([freeze(['T', 'T']), freeze(['Q'])]),
    freeze([freeze(['Q', 'T']), freeze(['T', 'Q'])]),
    freeze([freeze(['T', 'Q', 'T']), freeze(['Q', 'T', 'T', 'Q'])]),
  ]);
  const rows = pairs.map(([u, v]) => {
    const lhs = firstMomentRouteSection([...u, ...v]);
    const rhs = pullbackExtensionProduct(firstMomentRouteSection(u), firstMomentRouteSection(v));
    return freeze({ u, v, section_of_concat: lhs, product_of_sections: rhs, equal: sameRouteLift(lhs, rhs) });
  });
  return freeze({
    passed: rows.every((row) => row.equal),
    rows: freeze(rows),
    universal_identity: 'P(uv)=P(u)+P(v)+ω(πu,πv) from #733, hence Σ_P(uv)=Σ_P(u)◇_pullΣ_P(v) for every finite authored route pair.',
    identity: 'P(empty)=0.',
    classification: 'FREE_ROUTE_PULLBACK_SPLITS_HOMOMORPHICALLY_BY_FIRST_MOMENT_P',
  });
}

function wrongSignHostile() {
  const u = freeze(['T']);
  const v = freeze(['Q']);
  const direct = firstMomentRouteSection([...u, ...v], -1);
  const product = pullbackExtensionProduct(firstMomentRouteSection(u, -1), firstMomentRouteSection(v, -1));
  return freeze({
    passed: !sameRouteLift(direct, product)
      && direct.fiber === -1
      && product.fiber === 1,
    u,
    v,
    minus_P_of_concat: direct,
    product_of_minus_P_sections: product,
    lesson: 'The splitting sign is P, not -P, because the homomorphic-section criterion is df=-ω and dP=-ω.',
  });
}

function multiplyCanonicalWordLifts(word, omega = transportIncrementCocycle) {
  let point = extensionIdentity();
  for (const token of word) {
    const base = token === 'T' ? T_COORDINATE : Q_COORDINATE;
    point = cocycleExtensionProduct(point, sectionLift(base), omega);
    if (point.status !== 'DECLARED_INTEGER_COCYCLE_EXTENSION_PRODUCT_DERIVED') return point;
  }
  return point;
}

function routeCollisionFiberCertificate() {
  const leftWord = freeze(['T', 'T', 'Q']);
  const rightWord = freeze(['Q', 'T', 'T']);
  const left = multiplyCanonicalWordLifts(leftWord);
  const right = multiplyCanonicalWordLifts(rightWord);
  const leftBase = baseForWord(leftWord);
  const rightBase = baseForWord(rightWord);
  return freeze({
    passed: sameBase(leftBase, rightBase)
      && sameBase(left.base, right.base)
      && left.fiber === 2
      && right.fiber === 0
      && Object.is(right.fiber, 0),
    left_word: leftWord,
    right_word: rightWord,
    common_base: leftBase,
    left_lift: left,
    right_lift: right,
    interpretation: 'Same quotient base admits distinct cocycle-extension lifts. The fiber witnesses first-moment displacement only; it is not promoted to complete route provenance.',
  });
}

function swappedCocycleHostile() {
  const word = freeze(['T', 'Q']);
  const swappedLift = multiplyCanonicalWordLifts(word, swappedTransportCocycle);
  const expectedP = routeMoment(word);
  return freeze({
    passed: swappedLift.status === 'DECLARED_INTEGER_COCYCLE_EXTENSION_PRODUCT_DERIVED'
      && swappedLift.fiber === 0
      && expectedP === 1
      && swappedLift.fiber !== expectedP,
    word,
    swapped_lift: swappedLift,
    witnessed_first_moment_P: expectedP,
    lesson: 'Cocyclehood alone does not select the #733 transport dynamics; ω_swap fails the witnessed P law on TQ.',
  });
}

function cocycleDefect(omega, x, y, z) {
  const xy = baseProduct(x, y);
  const yz = baseProduct(y, z);
  if (!xy || !yz) return null;
  const values = [omega(x, y), omega(xy, z), omega(y, z), omega(x, yz)];
  if (!values.every(Number.isInteger)) return null;
  return canonicalInteger(values[0] + values[1] - values[2] - values[3]);
}

function parityFragileAssociativityHostile() {
  const omegaE = (x, y) => x.t * y.E;
  const defect = cocycleDefect(omegaE, T_COORDINATE, T_COORDINATE, Q_COORDINATE);
  const a = sectionLift(T_COORDINATE);
  const b = sectionLift(T_COORDINATE);
  const c = sectionLift(Q_COORDINATE);
  const left = cocycleExtensionProduct(cocycleExtensionProduct(a, b, omegaE), c, omegaE);
  const right = cocycleExtensionProduct(a, cocycleExtensionProduct(b, c, omegaE), omegaE);
  return freeze({
    passed: defect === 1
      && validExtensionPoint(left)
      && validExtensionPoint(right)
      && !sameExtensionPoint(left, right),
    defect_T_T_Q: defect,
    left_bracketing: left,
    right_bracketing: right,
    lesson: 'ω_E=t(x)E(y) has nonzero cocycle defect on T,T,Q; its induced product is nonassociative and receives no monoid promotion.',
  });
}

function receiptExternalityCertificate() {
  const leftA = freeze({ fiber: 2, base: T_COORDINATE, receipt_id: 'R1' });
  const leftB = freeze({ fiber: 2, base: T_COORDINATE, receipt_id: 'R1_DUP' });
  const right = freeze({ fiber: 0, base: Q_COORDINATE, receipt_id: 'R2' });
  const productA = cocycleExtensionProduct(leftA, right);
  const productB = cocycleExtensionProduct(leftB, right);
  return freeze({
    passed: sameExtensionPoint(productA, productB)
      && leftA.receipt_id !== leftB.receipt_id,
    product_R1: productA,
    product_R1_DUP: productB,
    custody_ids_distinct: true,
    claim: 'Receipt/custody identity is external to B, ω, and the declared extension product.',
  });
}

export function runCocycleExtensionSplittingObstructionAssay() {
  const symbolicAssociativity = symbolicAssociativityCertificate();
  const concreteAssociativity = concreteAssociativityControls();
  const identity = identityCertificate();
  const projection = projectionCertificate();
  const canonicalSectionDefect = canonicalSectionDefectCertificate();
  const generalSectionCriterion = generalSectionCriterionCertificate();
  const downstairsNonSplitting = downstairsNonSplittingCertificate();
  const freeRouteSplitting = freeRouteSplittingCertificate();
  const wrongSign = wrongSignHostile();
  const routeCollision = routeCollisionFiberCertificate();
  const swapped = swappedCocycleHostile();
  const parityFragile = parityFragileAssociativityHostile();
  const receiptExternality = receiptExternalityCertificate();

  const passed = [
    symbolicAssociativity,
    concreteAssociativity,
    identity,
    projection,
    canonicalSectionDefect,
    generalSectionCriterion,
    downstairsNonSplitting,
    freeRouteSplitting,
    wrongSign,
    routeCollision,
    swapped,
    parityFragile,
    receiptExternality,
  ].every((certificate) => certificate.passed);

  return freeze({
    schema: COCYCLE_EXTENSION_SPLITTING_OBSTRUCTION_SCHEMA,
    receiving_parent: COCYCLE_EXTENSION_SPLITTING_OBSTRUCTION_RECEIVING_PARENT,
    scientific_parent: COCYCLE_EXTENSION_SPLITTING_OBSTRUCTION_SCIENTIFIC_PARENT,
    gate_issue: COCYCLE_EXTENSION_SPLITTING_OBSTRUCTION_GATE_ISSUE,
    passed,
    canonical_classification: passed
      ? 'DECLARED_INTEGER_COCYCLE_EXTENSION_MONOID_HAS_NONSPLITTING_PROJECTION_TO_B_WHILE_FREE_ROUTE_PULLBACK_SPLITS_BY_FIRST_MOMENT_P'
      : 'COCYCLE_EXTENSION_SPLITTING_OBSTRUCTION_AUDITION_NOT_EARNED',
    secondary_classification: passed
      ? 'SAME_QUOTIENT_BASE_CAN_CARRY_DISTINCT_COCYCLE_EXTENSION_LIFTS_WITHOUT_PROMOTING_EXTENSION_FIBER_TO_COMPLETE_ROUTE_PROVENANCE'
      : null,
    symbolic_associativity: symbolicAssociativity,
    concrete_associativity: concreteAssociativity,
    identity,
    projection,
    canonical_section_defect: canonicalSectionDefect,
    general_section_criterion: generalSectionCriterion,
    downstairs_non_splitting: downstairsNonSplitting,
    free_route_splitting: freeRouteSplitting,
    wrong_sign_hostile: wrongSign,
    route_collision_fiber: routeCollision,
    swapped_cocycle_hostile: swapped,
    parity_fragile_hostile: parityFragile,
    receipt_externality: receiptExternality,
    claim_ceiling: freeze([
      'NO_FULL_H2_COMPUTATION',
      'NO_GENERAL_MONOID_EXTENSION_CLASSIFICATION',
      'NO_CENTRAL_EXTENSION_CLASSIFICATION_THEOREM',
      'NO_GROUP_COMPLETION_OR_GROUP_COHOMOLOGY',
      'NO_INVERSES_OR_GROUPOID',
      'NO_OPERATIONAL_NONIDENTITY_CLOSED_LOOP',
      'NO_CONNECTION_HOLONOMY_CURVATURE_OR_BERRY_PROMOTION',
      'NO_HIGHER_MOMENT_COMPLETENESS_OR_ASYMPTOTIC_HIERARCHY',
      'EXTENSION_FIBER_NOT_COMPLETE_ROUTE_LEDGER',
      'NO_SOURCE_SEASON_OR_RECEIPT_IDENTITY_ERASURE',
      'NO_PROTO_LOOM_A16_LIVE_ASH_MERGE_PUBLICATION_PRODUCTION_OR_VERCEL_AUTHORITY',
    ]),
  });
}
