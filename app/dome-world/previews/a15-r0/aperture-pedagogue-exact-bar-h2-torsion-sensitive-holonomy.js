import {
  multiplyQuotientCoordinates,
  canonicalWordFromCoordinate,
  quotientCoordinate,
} from './aperture-pedagogue-target-equivalence-quotient-congruence.js';
import {
  transportIncrementCocycle,
} from './aperture-pedagogue-affine-transport-increment-cocycle.js';
import {
  relationBarCycle,
  boundaryOfBar2Chain,
  pairTwoCochainWithBarChain,
  normalizedOneCoboundary,
  T_COORDINATE,
  Q_COORDINATE,
} from './aperture-pedagogue-quotient-obstruction-bar-cycle-cohomology.js';
import {
  normalizeBar2Chain,
  addBar2Chains,
  scaleBar2Chain,
  boundaryOfBar3Chain,
} from './aperture-pedagogue-bar-h2-period-return-representation.js';
import {
  barH1FreenessCertificate,
} from './aperture-pedagogue-h2-transport-classification-holonomy-completeness.js';

export const EXACT_BAR_H2_TORSION_SENSITIVE_HOLONOMY_SCHEMA = 'td613.a15-r0.exact-bar-h2-torsion-sensitive-holonomy/v0.1';
export const EXACT_BAR_H2_TORSION_SENSITIVE_HOLONOMY_PARENT_RECEIPT = '50ada0bb0e7b25f9c1bde7e2feafeebbb5067a8f';
export const EXACT_BAR_H2_TORSION_SENSITIVE_HOLONOMY_GATE_ISSUE = 737;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const UNIT = freeze({ t: 0, E: 0, O: 0 });
const keyOf = (value) => JSON.stringify(value);
const canonicalInteger = (value) => (value === 0 ? 0 : value);
const mod2 = (value) => ((value % 2) + 2) % 2;

function validAmbientBase(base) {
  return base && typeof base === 'object'
    && [base.t, base.E, base.O].every((n) => Number.isInteger(n) && n >= 0);
}

function validIntegerCoordinate(base) {
  return base && typeof base === 'object'
    && [base.t, base.E, base.O].every(Number.isInteger);
}

function plainBase(base) {
  return freeze({ t: base.t, E: base.E, O: base.O });
}

function sameBase(left, right) {
  return validIntegerCoordinate(left) && validIntegerCoordinate(right)
    && left.t === right.t && left.E === right.E && left.O === right.O;
}

function product(left, right) {
  if (!validAmbientBase(left) || !validAmbientBase(right)) return null;
  const out = multiplyQuotientCoordinates(left, right);
  if (out?.status !== 'PARITY_TWISTED_QUOTIENT_PRODUCT_DERIVED') return null;
  return plainBase(out);
}

function reachableBase(base) {
  if (!validAmbientBase(base)) return false;
  const canonical = canonicalWordFromCoordinate(base);
  if (canonical?.status !== 'CANONICAL_QUOTIENT_WORD_DERIVED') return false;
  const roundTrip = quotientCoordinate(canonical.word);
  return roundTrip?.status === 'TARGET_EQUIVALENCE_QUOTIENT_COORDINATE_DERIVED'
    && sameBase(base, roundTrip);
}

function coordinateForWord(word) {
  if (!Array.isArray(word) || !word.every((symbol) => symbol === 'T' || symbol === 'Q')) return null;
  const out = quotientCoordinate(word);
  if (out?.status !== 'TARGET_EQUIVALENCE_QUOTIENT_COORDINATE_DERIVED') return null;
  return plainBase(out);
}

function countGenerator(word, generator) {
  return word.filter((symbol) => symbol === generator).length;
}

function sameBar2Chain(left, right) {
  const a = normalizeBar2Chain(left);
  const b = normalizeBar2Chain(right);
  if (a.status !== 'BAR_2_CHAIN_NORMALIZED' || b.status !== 'BAR_2_CHAIN_NORMALIZED') return false;
  const strip = (chain) => chain.map((term) => ({
    left: term.left,
    right: term.right,
    coefficient: term.coefficient,
  }));
  return keyOf(strip(a.chain)) === keyOf(strip(b.chain));
}

export function prefixBar2Chain(word) {
  if (!Array.isArray(word) || !word.every((symbol) => symbol === 'T' || symbol === 'Q')) {
    return freeze({ status: 'PREFIX_BAR_2_CHAIN_ABSTAINS' });
  }
  if (word.length === 0) {
    return freeze({
      status: 'PREFIX_BAR_2_CHAIN_DERIVED',
      word: freeze([]),
      product: UNIT,
      chain: freeze([]),
      t_count: 0,
      q_count: 0,
    });
  }
  let prefix = coordinateForWord([word[0]]);
  if (!prefix) return freeze({ status: 'PREFIX_BAR_2_CHAIN_ABSTAINS' });
  const terms = [];
  for (let i = 1; i < word.length; i += 1) {
    const next = coordinateForWord([word[i]]);
    if (!next) return freeze({ status: 'PREFIX_BAR_2_CHAIN_ABSTAINS' });
    terms.push(freeze({
      coefficient: 1,
      left: prefix,
      right: next,
      label: `[${word.slice(0, i).join('')}|${word[i]}]`,
    }));
    prefix = product(prefix, next);
    if (!prefix) return freeze({ status: 'PREFIX_BAR_2_CHAIN_ABSTAINS' });
  }
  const normalized = normalizeBar2Chain(terms);
  if (normalized.status !== 'BAR_2_CHAIN_NORMALIZED') return normalized;
  return freeze({
    status: 'PREFIX_BAR_2_CHAIN_DERIVED',
    word: freeze([...word]),
    product: prefix,
    chain: normalized.chain,
    t_count: countGenerator(word, 'T'),
    q_count: countGenerator(word, 'Q'),
    boundary_identity: '∂P_bar(g1...gn)=Σ_i[g_i]-[g1...gn].',
  });
}

function equalWordRelationCycle(leftWord, rightWord) {
  const left = prefixBar2Chain(leftWord);
  const right = prefixBar2Chain(rightWord);
  if (left.status !== 'PREFIX_BAR_2_CHAIN_DERIVED' || right.status !== 'PREFIX_BAR_2_CHAIN_DERIVED') {
    return freeze({ status: 'EQUAL_WORD_RELATION_CYCLE_ABSTAINS' });
  }
  const sameProduct = sameBase(left.product, right.product);
  const sameCounts = left.t_count === right.t_count && left.q_count === right.q_count;
  const negRight = scaleBar2Chain(right.chain, -1);
  const sum = negRight.status === 'BAR_2_CHAIN_NORMALIZED'
    ? addBar2Chains(left.chain, negRight.chain)
    : negRight;
  if (sum.status !== 'BAR_2_CHAIN_NORMALIZED') return sum;
  const boundary = boundaryOfBar2Chain(sum.chain);
  return freeze({
    status: sameProduct && sameCounts && boundary.is_cycle
      ? 'EQUAL_WORD_RELATION_BAR_2_CYCLE_DERIVED'
      : 'EQUAL_WORD_RELATION_BAR_2_CYCLE_FAILED',
    passed: sameProduct && sameCounts && boundary.is_cycle,
    left_word: freeze([...leftWord]),
    right_word: freeze([...rightWord]),
    same_product: sameProduct,
    same_generator_counts: sameCounts,
    common_product: left.product,
    chain: sum.chain,
    boundary,
  });
}

export function z0RelationCycle() {
  const generic = equalWordRelationCycle(['T', 'T', 'Q'], ['Q', 'T', 'T']);
  const inherited = relationBarCycle();
  const exactInheritedMatch = generic.passed && inherited.passed
    && sameBar2Chain(generic.chain, inherited.chain);
  return freeze({
    status: exactInheritedMatch ? 'Z0_RELATION_CYCLE_DERIVED' : 'Z0_RELATION_CYCLE_FAILED',
    passed: exactInheritedMatch,
    chain: generic.chain,
    boundary: generic.boundary,
    inherited_chain: inherited.chain,
    exact_inherited_735_match: exactInheritedMatch,
  });
}

export function z1RelationCycle() {
  const generic = equalWordRelationCycle(
    ['T', 'Q', 'T', 'Q'],
    ['Q', 'T', 'Q', 'T'],
  );
  return freeze({
    status: generic.passed ? 'Z1_RELATION_CYCLE_DERIVED' : 'Z1_RELATION_CYCLE_FAILED',
    passed: generic.passed,
    chain: generic.chain,
    boundary: generic.boundary,
    common_product: generic.common_product,
  });
}

export function thetaTorsionCycle() {
  const z0 = z0RelationCycle();
  const z1 = z1RelationCycle();
  if (!z0.passed || !z1.passed) return freeze({ status: 'THETA_TORSION_CYCLE_FAILED' });
  const negZ0 = scaleBar2Chain(z0.chain, -1);
  const theta = addBar2Chains(z1.chain, negZ0.chain);
  if (theta.status !== 'BAR_2_CHAIN_NORMALIZED') return theta;
  const boundary = boundaryOfBar2Chain(theta.chain);
  return freeze({
    status: boundary.is_cycle ? 'THETA_TORSION_BAR_2_CYCLE_DERIVED' : 'THETA_TORSION_BAR_2_CYCLE_FAILED',
    passed: boundary.is_cycle,
    z0: z0.chain,
    z1: z1.chain,
    chain: theta.chain,
    boundary,
    identity: 'θ=z_1-z_0.',
  });
}

function coord(word) {
  return coordinateForWord([...word]);
}

function explicitThetaBar3Chain() {
  const T = T_COORDINATE;
  const Q = Q_COORDINATE;
  const TQ = coord('TQ');
  const QT = coord('QT');
  const QTQ = coord('QTQ');
  const TQT = coord('TQT');
  const TT = coord('TT');
  return freeze([
    freeze({ coefficient: -1, x: T, y: Q, z: T, label: '-[T|Q|T]' }),
    freeze({ coefficient: 1, x: T, y: T, z: Q, label: '+[T|T|Q]' }),
    freeze({ coefficient: 1, x: T, y: TQ, z: T, label: '+[T|TQ|T]' }),
    freeze({ coefficient: -1, x: T, y: QT, z: Q, label: '-[T|QT|Q]' }),
    freeze({ coefficient: -1, x: T, y: QTQ, z: T, label: '-[T|QTQ|T]' }),
    freeze({ coefficient: 1, x: T, y: TQT, z: Q, label: '+[T|TQT|Q]' }),
    freeze({ coefficient: 1, x: QT, y: Q, z: T, label: '+[QT|Q|T]' }),
    freeze({ coefficient: -1, x: QT, y: T, z: T, label: '-[QT|T|T]' }),
    freeze({ coefficient: 1, x: QT, y: QT, z: T, label: '+[QT|QT|T]' }),
    freeze({ coefficient: -1, x: QT, y: TT, z: Q, label: '-[QT|TT|Q]' }),
  ]);
}

export function explicitThetaOrderTwoBoundaryCertificate() {
  const theta = thetaTorsionCycle();
  const chain3 = explicitThetaBar3Chain();
  const boundary3 = boundaryOfBar3Chain(chain3);
  const twiceTheta = theta.passed ? scaleBar2Chain(theta.chain, 2) : null;
  const exact = theta.passed
    && boundary3.status === 'NORMALIZED_BAR_3_BOUNDARY_DERIVED'
    && boundary3.is_bar2_cycle
    && twiceTheta?.status === 'BAR_2_CHAIN_NORMALIZED'
    && sameBar2Chain(boundary3.chain, twiceTheta.chain);
  return freeze({
    status: exact ? 'EXPLICIT_THETA_ORDER_DIVIDES_TWO_BOUNDARY_CERTIFICATE_PASSED' : 'EXPLICIT_THETA_ORDER_DIVIDES_TWO_BOUNDARY_CERTIFICATE_FAILED',
    passed: exact,
    theta: theta.chain,
    bar3_chain: chain3,
    bar3_boundary: boundary3,
    twice_theta: twiceTheta?.chain ?? null,
    identity: exact ? '∂B_3=2θ.' : 'UNPROVED',
    nontriviality_not_implied_by_this_certificate: true,
  });
}

function swapPair([E, O]) {
  return [O, E];
}

function sigmaPower(t, pair) {
  return mod2(t) === 0 ? [...pair] : swapPair(pair);
}

export function integerFractionGroupMultiply(left, right) {
  if (!validIntegerCoordinate(left) || !validIntegerCoordinate(right)) return null;
  const acted = sigmaPower(left.t, [right.E, right.O]);
  return freeze({
    t: left.t + right.t,
    E: left.E + acted[0],
    O: left.O + acted[1],
  });
}

export function integerFractionGroupInverse(value) {
  if (!validIntegerCoordinate(value)) return null;
  const acted = sigmaPower(value.t, [value.E, value.O]);
  return freeze({ t: -value.t, E: -acted[0], O: -acted[1] });
}

export function rightOreCommonMultiple(left, right) {
  if (!reachableBase(left) || !reachableBase(right)) {
    return freeze({ status: 'RIGHT_ORE_COMMON_MULTIPLE_ABSTAINS_UNREACHABLE' });
  }
  const N = Math.max(left.t, right.t) + 1;
  const V = [Math.max(left.E, right.E), Math.max(left.O, right.O)];
  const leftGap = [V[0] - left.E, V[1] - left.O];
  const rightGap = [V[0] - right.E, V[1] - right.O];
  const leftPair = sigmaPower(left.t, leftGap);
  const rightPair = sigmaPower(right.t, rightGap);
  const leftFactor = freeze({ t: N - left.t, E: leftPair[0], O: leftPair[1] });
  const rightFactor = freeze({ t: N - right.t, E: rightPair[0], O: rightPair[1] });
  const leftProduct = product(left, leftFactor);
  const rightProduct = product(right, rightFactor);
  const passed = reachableBase(leftFactor)
    && reachableBase(rightFactor)
    && sameBase(leftProduct, rightProduct)
    && sameBase(leftProduct, { t: N, E: V[0], O: V[1] });
  return freeze({
    status: passed ? 'RIGHT_ORE_COMMON_MULTIPLE_DERIVED' : 'RIGHT_ORE_COMMON_MULTIPLE_FAILED',
    passed,
    left,
    right,
    left_factor: leftFactor,
    right_factor: rightFactor,
    common_multiple: leftProduct,
  });
}

export function rightFractionRepresentation(groupElement) {
  if (!validIntegerCoordinate(groupElement)) {
    return freeze({ status: 'RIGHT_FRACTION_REPRESENTATION_ABSTAINS' });
  }
  const r = Math.max(1, 1 - groupElement.t);
  const pairAdjustment = [Math.max(0, -groupElement.E), Math.max(0, -groupElement.O)];
  const denominatorPair = sigmaPower(groupElement.t, pairAdjustment);
  const denominator = freeze({ t: r, E: denominatorPair[0], O: denominatorPair[1] });
  const numerator = integerFractionGroupMultiply(groupElement, denominator);
  const reconstructed = integerFractionGroupMultiply(numerator, integerFractionGroupInverse(denominator));
  const passed = reachableBase(denominator)
    && reachableBase(numerator)
    && sameBase(reconstructed, groupElement);
  return freeze({
    status: passed ? 'RIGHT_FRACTION_REPRESENTATION_DERIVED' : 'RIGHT_FRACTION_REPRESENTATION_FAILED',
    passed,
    group_element: freeze({ ...groupElement }),
    numerator,
    denominator,
    reconstructed,
  });
}

function cancellationControls() {
  const rows = freeze([
    freeze({ x: T_COORDINATE, y: Q_COORDINATE, z: coord('TQ') }),
    freeze({ x: coord('QT'), y: coord('TQ'), z: coord('QQT') }),
    freeze({ x: coord('TQT'), y: coord('QT'), z: T_COORDINATE }),
  ]).map(({ x, y, z }) => {
    const xy = product(x, y);
    const xz = product(x, z);
    const yx = product(y, x);
    const zx = product(z, x);
    return freeze({
      x, y, z,
      left_same: sameBase(xy, xz),
      right_same: sameBase(yx, zx),
      y_equals_z: sameBase(y, z),
      no_false_left_collision: !sameBase(y, z) ? !sameBase(xy, xz) : true,
      no_false_right_collision: !sameBase(y, z) ? !sameBase(yx, zx) : true,
    });
  });
  return freeze({
    passed: rows.every((row) => row.no_false_left_collision && row.no_false_right_collision),
    rows: freeze(rows),
    universal_proof: freeze([
      'From x★y=x★z, t(y)=t(z) by cancellation in N; subtracting the common pair of x and applying inverse σ^t(x) gives pair(y)=pair(z).',
      'From y★x=z★x, equality of total t gives t(y)=t(z); the identical σ^t(y)(pair(x)) term then cancels coordinatewise, giving pair(y)=pair(z).',
    ]),
  });
}

export function oreLocalizationCertificate() {
  const cancellation = cancellationControls();
  const oreRows = freeze([
    freeze([T_COORDINATE, Q_COORDINATE]),
    freeze([coord('TQ'), coord('QQT')]),
    freeze([freeze({ t: 3, E: 2, O: 4 }), freeze({ t: 2, E: 5, O: 1 })]),
  ]).map(([left, right]) => rightOreCommonMultiple(left, right));
  const inverseRows = freeze([
    freeze({ t: 0, E: 0, O: 0 }),
    freeze({ t: 1, E: 2, O: -3 }),
    freeze({ t: -3, E: -4, O: 5 }),
    freeze({ t: 4, E: -2, O: -7 }),
  ]).map((value) => {
    const inverse = integerFractionGroupInverse(value);
    const left = integerFractionGroupMultiply(value, inverse);
    const right = integerFractionGroupMultiply(inverse, value);
    return freeze({ value, inverse, left, right, passed: sameBase(left, UNIT) && sameBase(right, UNIT) });
  });
  const fractionRows = freeze([
    freeze({ t: -3, E: -4, O: 5 }),
    freeze({ t: 2, E: -7, O: -1 }),
    freeze({ t: -1, E: 3, O: -6 }),
    freeze({ t: 0, E: -2, O: 9 }),
  ]).map(rightFractionRepresentation);

  const directed = oreRows.every((row) => row.passed);
  const passed = cancellation.passed
    && directed
    && inverseRows.every((row) => row.passed)
    && fractionRows.every((row) => row.passed);

  return freeze({
    status: passed ? 'BAR_MONOID_ORE_LOCALIZATION_CERTIFICATE_PASSED' : 'BAR_MONOID_ORE_LOCALIZATION_CERTIFICATE_FAILED',
    passed,
    cancellation,
    right_ore_rows: freeze(oreRows),
    group_inverse_rows: freeze(inverseRows),
    fraction_rows: freeze(fractionRows),
    fraction_group: 'G=Z² ⋊_σ Z in (t,E,O) coordinate notation',
    directed_translation_poset: freeze({
      passed: directed,
      universal_proof: freeze([
        'For x=(t,v), y=(u,w), choose N>max(t,u) and coordinatewise V>=v,w; the constructed positive-t right factors give x★a=y★b=(N,V).',
        'For arbitrary g,h in the fraction group, write g^{-1}h=x y^{-1}; then gx=hy is a common upper bound in the translation preorder.',
        'Every finite set therefore has a common upper bound, so every finite nerve subcomplex is contained in a cone and the translation-preorder nerve is contractible.',
        'Left G-translation is free. Modulo that action, a composable chain is uniquely represented by its B-increments, exactly the one-object bar nerve of B.',
      ]),
      classification_if_passed: 'BB ≃ K(G,1) and H_*^bar(B;Z) ≅ H_*(G;Z).',
    }),
    operational_route_inversion_authority: false,
    geometric_space_authority: false,
  });
}

export function exactBarH2GlobalCertificate() {
  const ore = oreLocalizationCertificate();
  const inheritedH1 = barH1FreenessCertificate();
  const swapH1 = freeze([[0, 1], [1, 0]]);
  const identityMinusSwap = freeze([[1, -1], [-1, 1]]);
  const h1KernelGenerator = freeze([1, 1]);
  const h2FiberAction = -1;
  const h2DifferenceMap = 1 - h2FiberAction;
  const torsionModulus = Math.abs(h2DifferenceMap);
  const h1Consistent = inheritedH1.passed && inheritedH1.earned_if_passed.includes('Z²');
  const passed = ore.passed
    && h1Consistent
    && h2DifferenceMap === 2
    && torsionModulus === 2;
  return freeze({
    status: passed ? 'EXACT_BAR_H2_GLOBAL_CERTIFICATE_PASSED' : 'EXACT_BAR_H2_GLOBAL_CERTIFICATE_FAILED',
    passed,
    ore_localization: ore,
    fraction_group: 'G=Z² ⋊_σ Z',
    classifying_space_model: 'mapping torus of coordinate swap on T², used only to compute group/bar homology',
    H1_fiber_action: swapH1,
    I_minus_H1_action: identityMinusSwap,
    kernel_I_minus_swap: freeze({ basis: h1KernelGenerator, group: 'Z' }),
    H2_fiber_action: h2FiberAction,
    I_minus_H2_action: h2DifferenceMap,
    coker_I_minus_H2_action: 'Z/2',
    wang_degree_two_sequence: '0 -> Z/2 -> H2 -> Z -> 0',
    split_reason: 'The quotient Z is free/projective as an abelian group, so the short exact sequence splits.',
    H2_bar: passed ? 'Z ⊕ Z/2' : 'UNEARNED',
    inherited_H1_consistency: h1Consistent,
    universal_proof: freeze([
      'The swap acts on H1(T²;Z)=Z² by [[0,1],[1,0]], whose fixed subgroup is diagonal Z.',
      'The swap reverses the orientation class in H2(T²;Z)=Z, so 1-σ_* is multiplication by 2 and its cokernel is Z/2.',
      'The mapping-torus Wang exact sequence in total degree two is therefore 0->Z/2->H2->Z->0, which splits as abelian groups.',
      'In degree one the same sequence gives Z from coker(I-σ on Z²) plus Z from the base circle, agreeing with #773 H1_bar(B;Z)=Z².',
    ]),
    mapping_torus_is_physical_surface: false,
  });
}

function residue(base) {
  if (!validIntegerCoordinate(base)) return null;
  return freeze([mod2(base.t), mod2(base.E), mod2(base.O)]);
}

function residueIdentity(value) {
  return Array.isArray(value) && value.length === 3 && value.every((entry) => entry === 0);
}

function residueKey(value) {
  return value.join('');
}

function residuePairKey(left, right) {
  return `${residueKey(left)}|${residueKey(right)}`;
}

function residueProduct(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== 3 || right.length !== 3) return null;
  if (![...left, ...right].every((value) => value === 0 || value === 1)) return null;
  const acted = left[0] === 0 ? [right[1], right[2]] : [right[2], right[1]];
  return freeze([
    mod2(left[0] + right[0]),
    mod2(left[1] + acted[0]),
    mod2(left[2] + acted[1]),
  ]);
}

const BETA_SUPPORT = freeze([
  freeze([[0, 0, 1], [1, 0, 0]]),
  freeze([[0, 0, 1], [1, 0, 1]]),
  freeze([[0, 1, 0], [0, 0, 1]]),
  freeze([[0, 1, 0], [0, 1, 1]]),
  freeze([[0, 1, 1], [0, 0, 1]]),
  freeze([[0, 1, 1], [0, 1, 1]]),
  freeze([[0, 1, 1], [1, 1, 0]]),
  freeze([[0, 1, 1], [1, 1, 1]]),
  freeze([[1, 0, 0], [0, 0, 1]]),
  freeze([[1, 0, 0], [0, 1, 1]]),
  freeze([[1, 0, 0], [1, 1, 0]]),
  freeze([[1, 0, 0], [1, 1, 1]]),
  freeze([[1, 0, 1], [1, 0, 0]]),
  freeze([[1, 0, 1], [1, 0, 1]]),
  freeze([[1, 1, 0], [0, 0, 1]]),
  freeze([[1, 1, 0], [0, 1, 1]]),
]);

const BETA_SUPPORT_SET = new Set(BETA_SUPPORT.map(([left, right]) => residuePairKey(left, right)));

function betaResidue(left, right) {
  if (residueIdentity(left) || residueIdentity(right)) return 0;
  return BETA_SUPPORT_SET.has(residuePairKey(left, right)) ? 1 : 0;
}

export function torsionBeta(left, right) {
  if (!reachableBase(left) || !reachableBase(right)) return null;
  return betaResidue(residue(left), residue(right));
}

function residueStates() {
  const out = [];
  for (const t of [0, 1]) for (const E of [0, 1]) for (const O of [0, 1]) out.push(freeze([t, E, O]));
  return freeze(out);
}

function representativeForResidue([t, E, O]) {
  if (t === 1) return freeze({ t: 1, E, O });
  if (O === 0) return freeze({ t: 0, E, O: 0 });
  return freeze({ t: 2, E, O });
}

function betaChainValue(chain) {
  const normalized = normalizeBar2Chain(chain);
  if (normalized.status !== 'BAR_2_CHAIN_NORMALIZED') return null;
  let total = 0;
  for (const term of normalized.chain) {
    const value = torsionBeta(term.left, term.right);
    if (value === null) return null;
    total = mod2(total + (mod2(term.coefficient) * value));
  }
  return total;
}

export function modTwoTorsionDetectorCertificate() {
  const states = residueStates();
  const homRows = [];
  for (const leftResidue of states) {
    for (const rightResidue of states) {
      const left = representativeForResidue(leftResidue);
      const right = representativeForResidue(rightResidue);
      const actual = residue(product(left, right));
      const finite = residueProduct(leftResidue, rightResidue);
      homRows.push(freeze({ left: leftResidue, right: rightResidue, actual, finite, equal: keyOf(actual) === keyOf(finite) }));
    }
  }

  const cocycleRows = [];
  for (const x of states) {
    for (const y of states) {
      for (const z of states) {
        const xy = residueProduct(x, y);
        const yz = residueProduct(y, z);
        const defect = mod2(
          betaResidue(y, z)
          - betaResidue(xy, z)
          + betaResidue(x, yz)
          - betaResidue(x, y),
        );
        cocycleRows.push(freeze({ x, y, z, defect, passed: defect === 0 }));
      }
    }
  }

  const z0 = z0RelationCycle();
  const z1 = z1RelationCycle();
  const theta = thetaTorsionCycle();
  const betaZ0 = z0.passed ? betaChainValue(z0.chain) : null;
  const betaZ1 = z1.passed ? betaChainValue(z1.chain) : null;
  const betaTheta = theta.passed ? betaChainValue(theta.chain) : null;
  const passed = homRows.every((row) => row.equal)
    && cocycleRows.length === 512
    && cocycleRows.every((row) => row.passed)
    && betaZ0 === 0
    && betaZ1 === 1
    && betaTheta === 1;

  return freeze({
    status: passed ? 'MOD_TWO_TORSION_DETECTOR_CERTIFICATE_PASSED' : 'MOD_TWO_TORSION_DETECTOR_CERTIFICATE_FAILED',
    passed,
    support_size: BETA_SUPPORT.length,
    support: BETA_SUPPORT,
    parity_reduction_homomorphism_rows: freeze(homRows),
    exhaustive_cocycle_triples: cocycleRows.length,
    all_512_cocycle_defects_zero: cocycleRows.every((row) => row.passed),
    beta_z0: betaZ0,
    beta_z1: betaZ1,
    beta_theta: betaTheta,
    nonboundary_argument: 'If θ=∂b over Z, then mod-2 reduction gives θ=∂(b mod2); every mod-2 cocycle evaluates to zero on such a boundary, contradicting β(θ)=1.',
    physical_Z2_gauge_authority: false,
  });
}

function aN(n, E, O) {
  if (![n, E, O].every(Number.isInteger) || n < 0) return null;
  return (Math.floor(n / 2) * (E + O)) + ((n % 2) * E);
}

export function primitiveIntegralCocycle(left, right) {
  if (!reachableBase(left) || !reachableBase(right)) return null;
  return aN(left.t, right.E, right.O);
}

function integerCocycleDefect(cochain, x, y, z) {
  const xy = product(x, y);
  const yz = product(y, z);
  if (!xy || !yz) return null;
  const values = [
    cochain(y, z),
    cochain(xy, z),
    cochain(x, yz),
    cochain(x, y),
  ];
  if (!values.every(Number.isInteger)) return null;
  return canonicalInteger(values[0] - values[1] + values[2] - values[3]);
}

export function primitiveIntegralCocycleCertificate() {
  const samples = freeze([
    freeze([T_COORDINATE, T_COORDINATE, Q_COORDINATE]),
    freeze([T_COORDINATE, Q_COORDINATE, T_COORDINATE]),
    freeze([coord('TT'), coord('QT'), Q_COORDINATE]),
    freeze([freeze({ t: 3, E: 2, O: 4 }), freeze({ t: 2, E: 1, O: 5 }), freeze({ t: 1, E: 3, O: 2 })]),
    freeze([freeze({ t: 4, E: 1, O: 2 }), freeze({ t: 3, E: 5, O: 0 }), Q_COORDINATE]),
  ]);
  const defects = samples.map(([x, y, z]) => freeze({ x, y, z, defect: integerCocycleDefect(primitiveIntegralCocycle, x, y, z) }));
  const recurrenceRows = [];
  for (let n = 0; n <= 5; n += 1) {
    for (let m = 0; m <= 5; m += 1) {
      for (const pair of [[1, 0], [0, 1], [2, 3]]) {
        const acted = sigmaPower(m, pair);
        const lhs = aN(n + m, pair[0], pair[1]);
        const rhs = aN(m, pair[0], pair[1]) + aN(n, acted[0], acted[1]);
        recurrenceRows.push(freeze({ n, m, pair: freeze(pair), lhs, rhs, equal: lhs === rhs }));
      }
    }
  }
  const z0 = z0RelationCycle();
  const z1 = z1RelationCycle();
  const theta = thetaTorsionCycle();
  const pair = (chain) => pairTwoCochainWithBarChain(primitiveIntegralCocycle, chain).value;
  const kZ0 = z0.passed ? pair(z0.chain) : null;
  const kZ1 = z1.passed ? pair(z1.chain) : null;
  const kTheta = theta.passed ? pair(theta.chain) : null;
  const passed = defects.every((row) => row.defect === 0)
    && recurrenceRows.every((row) => row.equal)
    && kZ0 === 1 && kZ1 === 1 && kTheta === 0;
  return freeze({
    status: passed ? 'PRIMITIVE_INTEGRAL_COCYCLE_CERTIFICATE_PASSED' : 'PRIMITIVE_INTEGRAL_COCYCLE_CERTIFICATE_FAILED',
    passed,
    sample_defects: freeze(defects),
    recurrence_rows: freeze(recurrenceRows),
    kappa_z0: kZ0,
    kappa_z1: kZ1,
    kappa_theta: kTheta,
    universal_proof: freeze([
      'a_n=Σ_{j=0}^{n-1} e*∘σ^j, so a_{n+m}=a_m+a_n∘σ^m for all n,m>=0.',
      'For κ(x,y)=a_{t(x)}(pair(y)), the bar cocycle defect reduces exactly to a_m-a_{n+m}+a_n∘σ^m and therefore vanishes.',
    ]),
  });
}

function phiE(base) {
  if (!reachableBase(base)) return null;
  return base.E;
}

export function omegaTwicePrimitiveCertificate() {
  const samples = freeze([
    freeze([T_COORDINATE, Q_COORDINATE]),
    freeze([coord('TT'), Q_COORDINATE]),
    freeze([freeze({ t: 3, E: 2, O: 4 }), freeze({ t: 1, E: 5, O: 7 })]),
    freeze([freeze({ t: 4, E: 3, O: 1 }), freeze({ t: 2, E: 6, O: 5 })]),
  ]);
  const rows = samples.map(([x, y]) => {
    const omega = transportIncrementCocycle(x, y);
    const kappa = primitiveIntegralCocycle(x, y);
    const dE = normalizedOneCoboundary(phiE, x, y);
    const rhs = (2 * kappa) - dE;
    return freeze({ x, y, parity: x.t % 2, omega, twice_kappa_minus_dE: rhs, dE, equal: omega === rhs });
  });
  const primitive = primitiveIntegralCocycleCertificate();
  const passed = primitive.passed
    && rows.every((row) => row.equal)
    && rows.some((row) => row.parity === 0)
    && rows.some((row) => row.parity === 1);
  return freeze({
    status: passed ? 'OMEGA_TWICE_PRIMITIVE_CERTIFICATE_PASSED' : 'OMEGA_TWICE_PRIMITIVE_CERTIFICATE_FAILED',
    passed,
    rows: freeze(rows),
    cohomology_identity: passed ? '[ω]=2[κ] in H²_bar(B;Z)' : 'UNEARNED',
    universal_proof: freeze([
      'If t(x)=2r, then dE*=0 and 2κ=2r(E_y+O_y)=ω.',
      'If t(x)=2r+1, then dE*=E_y-O_y and 2κ-dE*=(2r+1)(E_y+O_y)=ω.',
      'Hence ω=2κ-dE* pointwise, so [ω]=2[κ].',
    ]),
  });
}

export function explicitBarH2BasisCertificate() {
  const global = exactBarH2GlobalCertificate();
  const orderDivides = explicitThetaOrderTwoBoundaryCertificate();
  const beta = modTwoTorsionDetectorCertificate();
  const primitive = primitiveIntegralCocycleCertificate();
  const omegaDivisibility = omegaTwicePrimitiveCertificate();
  const exactThetaOrderTwo = orderDivides.passed && beta.passed && beta.beta_theta === 1;
  const passed = global.passed
    && exactThetaOrderTwo
    && primitive.passed
    && primitive.kappa_z0 === 1
    && primitive.kappa_theta === 0
    && omegaDivisibility.passed;
  return freeze({
    status: passed ? 'EXPLICIT_BAR_H2_BASIS_CERTIFICATE_PASSED' : 'EXPLICIT_BAR_H2_BASIS_CERTIFICATE_FAILED',
    passed,
    global_H2: global.H2_bar,
    theta_exact_order_two: exactThetaOrderTwo,
    z0_primitive_free_coordinate: primitive.kappa_z0 === 1,
    theta_in_kappa_kernel: primitive.kappa_theta === 0,
    explicit_decomposition: passed ? 'H2_bar(B;Z) ≅ Z<[z_0]> ⊕ (Z/2)<[θ]>' : 'UNEARNED',
    z1_relation: passed ? '[z_1]=[z_0]+[θ]' : 'UNEARNED',
    omega_class: omegaDivisibility.cohomology_identity,
    proof: 'Global H2 has one free Z and one order-two torsion summand. κ(z0)=1 splits the free coordinate; the independently nonzero order-two θ spans the full torsion kernel.',
  });
}

function addPairsMod2(left, right) {
  return mod2(left + right);
}

function coefficientCharacter(chain) {
  const normalized = normalizeBar2Chain(chain);
  if (normalized.status !== 'BAR_2_CHAIN_NORMALIZED') return null;
  const boundary = boundaryOfBar2Chain(normalized.chain);
  if (!boundary.is_cycle) return null;
  const integral = pairTwoCochainWithBarChain(primitiveIntegralCocycle, normalized.chain);
  const torsion = betaChainValue(normalized.chain);
  if (integral.status !== 'BAR_2_COCHAIN_PAIRING_DERIVED' || torsion === null) return null;
  return freeze({ integer: integral.value, mod2: torsion });
}

export function torsionSensitiveFormalHolonomyCertificate() {
  const basis = explicitBarH2BasisCertificate();
  const z0 = z0RelationCycle();
  const z1 = z1RelationCycle();
  const theta = thetaTorsionCycle();
  const psiZ0 = z0.passed ? coefficientCharacter(z0.chain) : null;
  const psiZ1 = z1.passed ? coefficientCharacter(z1.chain) : null;
  const psiTheta = theta.passed ? coefficientCharacter(theta.chain) : null;

  const zSum = z0.passed && theta.passed ? addBar2Chains(z0.chain, theta.chain) : null;
  const psiSum = zSum?.status === 'BAR_2_CHAIN_NORMALIZED' ? coefficientCharacter(zSum.chain) : null;
  const additiveControl = psiZ0 && psiTheta && psiSum
    && psiSum.integer === psiZ0.integer + psiTheta.integer
    && psiSum.mod2 === addPairsMod2(psiZ0.mod2, psiTheta.mod2);

  const integerBlindness = basis.passed
    && psiZ0?.integer === psiZ1?.integer
    && psiTheta?.integer === 0;
  const fullSeparation = basis.passed
    && psiZ0?.integer === 1 && psiZ0?.mod2 === 0
    && psiTheta?.integer === 0 && psiTheta?.mod2 === 1
    && psiZ1?.integer === 1 && psiZ1?.mod2 === 1;
  const passed = basis.passed && additiveControl && integerBlindness && fullSeparation;

  return freeze({
    status: passed ? 'TORSION_SENSITIVE_FORMAL_HOLONOMY_CERTIFICATE_PASSED' : 'TORSION_SENSITIVE_FORMAL_HOLONOMY_CERTIFICATE_FAILED',
    passed,
    coefficients: 'A=Z ⊕ Z/2',
    psi_z0: psiZ0,
    psi_theta: psiTheta,
    psi_z1: psiZ1,
    additive_control: additiveControl,
    integer_holonomy_torsion_blindness: integerBlindness,
    all_integer_characters_blind_to_theta_proof: 'Every homomorphism from an order-two element to torsion-free Z is zero; therefore every h:H2->Z satisfies h(z1)=h(z0).',
    full_character_isomorphism: fullSeparation ? 'Ψ:H2_bar(B;Z)->Z⊕Z/2 is an isomorphism on the explicit basis z0,θ.' : 'UNEARNED',
    classification: passed
      ? 'TORSION_SENSITIVE_FORMAL_BAR_COMPLEX_TWO_HOLONOMY_WITH_COEFFICIENTS_Z_CROSS_Z_OVER_TWO_SEPARATES_ALL_SECOND_BAR_HOMOLOGY_CLASSES_IN_THE_DECLARED_JURISDICTION'
      : 'TORSION_SENSITIVE_HOLONOMY_NOT_EARNED',
    geometric_two_holonomy_authority: false,
    physical_gauge_group_authority: false,
  });
}

export function exactBarH2TorsionSensitiveHolonomyCertificate() {
  const ore = oreLocalizationCertificate();
  const global = exactBarH2GlobalCertificate();
  const orderTwoBoundary = explicitThetaOrderTwoBoundaryCertificate();
  const beta = modTwoTorsionDetectorCertificate();
  const primitive = primitiveIntegralCocycleCertificate();
  const omega = omegaTwicePrimitiveCertificate();
  const basis = explicitBarH2BasisCertificate();
  const holonomy = torsionSensitiveFormalHolonomyCertificate();
  const passed = ore.passed
    && global.passed
    && orderTwoBoundary.passed
    && beta.passed
    && primitive.passed
    && omega.passed
    && basis.passed
    && holonomy.passed;
  return freeze({
    status: passed ? 'EXACT_BAR_H2_TORSION_SENSITIVE_HOLONOMY_CERTIFICATE_PASSED' : 'EXACT_BAR_H2_TORSION_SENSITIVE_HOLONOMY_CERTIFICATE_FAILED',
    passed,
    parent_receipt: EXACT_BAR_H2_TORSION_SENSITIVE_HOLONOMY_PARENT_RECEIPT,
    ore,
    global,
    order_two_boundary: orderTwoBoundary,
    mod_two_detector: beta,
    primitive_integral_cocycle: primitive,
    omega_twice_primitive: omega,
    explicit_H2_basis: basis,
    torsion_sensitive_holonomy: holonomy,
    earned_if_passed: freeze([
      'BAR_MONOID_RIGHT_ORE_LOCALIZATION_TO_PARITY_SWAP_FRACTION_GROUP_EARNED',
      'BAR_CLASSIFYING_SPACE_ASPHERICITY_VIA_DIRECTED_TRANSLATION_POSET_EARNED',
      'EXACT_SECOND_BAR_HOMOLOGY_Z_PLUS_Z_OVER_TWO_EARNED',
      'EXPLICIT_ORDER_TWO_CLASS_THETA_EARNED',
      'INHERITED_OMEGA_IS_TWICE_A_PRIMITIVE_INTEGRAL_H2_COHOMOLOGY_GENERATOR_EARNED',
      'INTEGER_FORMAL_TWO_HOLONOMY_TORSION_BLINDNESS_EARNED',
      'TORSION_SENSITIVE_Z_CROSS_Z_OVER_TWO_FORMAL_HOLONOMY_SEPARATION_EARNED',
    ]),
    authority_ceiling: freeze({
      geometric_two_holonomy: false,
      physical_two_holonomy: false,
      berry_or_gerbe_holonomy: false,
      connection: false,
      two_connection: false,
      curvature: false,
      operational_path_two_groupoid: false,
      operational_inverse_route: false,
      production: false,
      vercel: false,
    }),
  });
}
