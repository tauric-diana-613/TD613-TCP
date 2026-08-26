import {
  multiplyQuotientCoordinates,
  canonicalWordFromCoordinate,
  quotientCoordinate,
} from './aperture-pedagogue-target-equivalence-quotient-congruence.js';
import {
  transportIncrementCocycle,
} from './aperture-pedagogue-affine-transport-increment-cocycle.js';
import {
  swappedTransportCocycle,
  T_COORDINATE,
  Q_COORDINATE,
} from './aperture-pedagogue-quotient-obstruction-bar-cycle-cohomology.js';

export const FILTERED_H2_TWO_TORSION_HOLONOMY_BLINDNESS_SCHEMA = 'td613.a15-r0.filtered-h2-two-torsion-holonomy-blindness/v0.1';
export const FILTERED_H2_TWO_TORSION_HOLONOMY_BLINDNESS_PARENT_RECEIPT = '50ada0bb0e7b25f9c1bde7e2feafeebbb5067a8f';
export const FILTERED_H2_TWO_TORSION_HOLONOMY_BLINDNESS_GATE_ISSUE = 737;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const UNIT = freeze({ t: 0, E: 0, O: 0 });
const T = T_COORDINATE;
const Q = Q_COORDINATE;

function validBase(base) {
  return base && typeof base === 'object'
    && [base.t, base.E, base.O].every((n) => Number.isInteger(n) && n >= 0);
}

function plainBase(base) {
  return freeze({ t: base.t, E: base.E, O: base.O });
}

function sameBase(a, b) {
  return validBase(a) && validBase(b)
    && a.t === b.t && a.E === b.E && a.O === b.O;
}

function isUnit(base) {
  return sameBase(base, UNIT);
}

function keyBase(base) {
  return `${base.t},${base.E},${base.O}`;
}

function keyTuple(tuple) {
  return tuple.map(keyBase).join('|');
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

function reachableBase(base) {
  if (!validBase(base)) return false;
  const canonical = canonicalWordFromCoordinate(base);
  if (canonical?.status !== 'CANONICAL_QUOTIENT_WORD_DERIVED') return false;
  const roundTrip = quotientCoordinate(canonical.word);
  return roundTrip?.status === 'TARGET_EQUIVALENCE_QUOTIENT_COORDINATE_DERIVED'
    && sameBase(base, roundTrip);
}

export function filteredBarWeight(base) {
  if (!reachableBase(base)) return null;
  return base.t + base.E + base.O;
}

function totalTupleWeight(tuple) {
  let total = 0;
  for (const base of tuple) {
    const w = filteredBarWeight(base);
    if (!Number.isInteger(w) || isUnit(base)) return null;
    total += w;
  }
  return total;
}

function enumerateReachableNonunits(maxWeight) {
  if (!Number.isInteger(maxWeight) || maxWeight < 1) return freeze([]);
  const values = [];
  for (let weight = 1; weight <= maxWeight; weight += 1) {
    for (let t = 0; t <= weight; t += 1) {
      for (let E = 0; E <= weight - t; E += 1) {
        const O = weight - t - E;
        const base = { t, E, O };
        if (reachableBase(base) && !isUnit(base)) values.push(plainBase(base));
      }
    }
  }
  return freeze(values);
}

function enumerateBarBasis(degree, maxWeight) {
  if (!Number.isInteger(degree) || degree < 1 || !Number.isInteger(maxWeight) || maxWeight < degree) {
    return freeze([]);
  }
  const elements = enumerateReachableNonunits(maxWeight);
  const output = [];
  const walk = (prefix, startWeight) => {
    if (prefix.length === degree) {
      output.push(freeze([...prefix]));
      return;
    }
    for (const base of elements) {
      const w = filteredBarWeight(base);
      const nextWeight = startWeight + w;
      if (nextWeight > maxWeight) continue;
      walk([...prefix, base], nextWeight);
    }
  };
  walk([], 0);
  return freeze(output);
}

export function filteredBarBasis(degree, maxWeight) {
  const basis = enumerateBarBasis(degree, maxWeight);
  return freeze({
    status: 'FILTERED_NORMALIZED_BAR_BASIS_DERIVED',
    degree,
    max_weight: maxWeight,
    size: basis.length,
    basis,
  });
}

function addTupleCoefficient(map, tuple, coefficient) {
  if (!Number.isInteger(coefficient) || coefficient === 0) return;
  const key = keyTuple(tuple);
  const current = map.get(key) ?? { tuple: freeze([...tuple]), coefficient: 0 };
  current.coefficient += coefficient;
  if (current.coefficient === 0) map.delete(key);
  else map.set(key, current);
}

function normalizeTupleChain(map) {
  return freeze([...map.values()]
    .sort((a, b) => keyTuple(a.tuple).localeCompare(keyTuple(b.tuple)))
    .map(({ tuple, coefficient }) => freeze({ tuple, coefficient })));
}

function boundary2Terms(left, right) {
  const xy = product(left, right);
  if (!xy || isUnit(left) || isUnit(right)) return null;
  return freeze([
    freeze({ tuple: freeze([right]), coefficient: 1 }),
    freeze({ tuple: freeze([xy]), coefficient: -1 }),
    freeze({ tuple: freeze([left]), coefficient: 1 }),
  ]);
}

function boundary3Terms(x, y, z) {
  const xy = product(x, y);
  const yz = product(y, z);
  if (!xy || !yz || [x, y, z].some(isUnit)) return null;
  return freeze([
    freeze({ tuple: freeze([y, z]), coefficient: 1 }),
    freeze({ tuple: freeze([xy, z]), coefficient: -1 }),
    freeze({ tuple: freeze([x, yz]), coefficient: 1 }),
    freeze({ tuple: freeze([x, y]), coefficient: -1 }),
  ]);
}

function boundaryOfBar2Chain(chain) {
  const map = new Map();
  for (const term of chain) {
    if (!term || !Number.isInteger(term.coefficient) || !reachableBase(term.left) || !reachableBase(term.right)) {
      return freeze({ status: 'FILTERED_BAR_2_BOUNDARY_ABSTAINS', terms: freeze([]), is_cycle: false });
    }
    const pieces = boundary2Terms(term.left, term.right);
    if (!pieces) return freeze({ status: 'FILTERED_BAR_2_BOUNDARY_ABSTAINS', terms: freeze([]), is_cycle: false });
    for (const piece of pieces) addTupleCoefficient(map, piece.tuple, term.coefficient * piece.coefficient);
  }
  const terms = normalizeTupleChain(map);
  return freeze({
    status: 'FILTERED_BAR_2_BOUNDARY_DERIVED',
    terms,
    is_cycle: terms.length === 0,
  });
}

function boundaryOfBar3Chain(chain) {
  const map = new Map();
  for (const term of chain) {
    if (!term || !Number.isInteger(term.coefficient)
      || !reachableBase(term.x) || !reachableBase(term.y) || !reachableBase(term.z)) {
      return freeze({ status: 'FILTERED_BAR_3_BOUNDARY_ABSTAINS', terms: freeze([]) });
    }
    const pieces = boundary3Terms(term.x, term.y, term.z);
    if (!pieces) return freeze({ status: 'FILTERED_BAR_3_BOUNDARY_ABSTAINS', terms: freeze([]) });
    for (const piece of pieces) addTupleCoefficient(map, piece.tuple, term.coefficient * piece.coefficient);
  }
  return freeze({ status: 'FILTERED_BAR_3_BOUNDARY_DERIVED', terms: normalizeTupleChain(map) });
}

function combineBar2Chains(...chains) {
  const map = new Map();
  for (const chain of chains) {
    for (const term of chain) {
      const tuple = [term.left, term.right];
      addTupleCoefficient(map, tuple, term.coefficient);
    }
  }
  return freeze(normalizeTupleChain(map).map((term) => freeze({
    coefficient: term.coefficient,
    left: term.tuple[0],
    right: term.tuple[1],
  })));
}

function scaleBar2Chain(chain, scalar) {
  return freeze(chain.map((term) => freeze({ ...term, coefficient: term.coefficient * scalar })));
}

function tupleChainEqualsBar2Terms(tupleTerms, bar2Terms) {
  const left = new Map();
  for (const term of tupleTerms) addTupleCoefficient(left, term.tuple, term.coefficient);
  const right = new Map();
  for (const term of bar2Terms) addTupleCoefficient(right, [term.left, term.right], term.coefficient);
  const L = normalizeTupleChain(left);
  const R = normalizeTupleChain(right);
  return JSON.stringify(L) === JSON.stringify(R);
}

function fanChain(word) {
  if (!Array.isArray(word) || word.length < 2 || word.some((symbol) => symbol !== 'T' && symbol !== 'Q')) {
    return freeze({ status: 'RELATION_FAN_ABSTAINS', chain: freeze([]), boundary_identity: null });
  }
  const chain = [];
  for (let i = 1; i < word.length; i += 1) {
    const prefix = coordinateForWord(word.slice(0, i));
    const next = word[i] === 'T' ? T : Q;
    if (!prefix || !next) return freeze({ status: 'RELATION_FAN_ABSTAINS', chain: freeze([]), boundary_identity: null });
    chain.push(freeze({ coefficient: 1, left: prefix, right: next }));
  }
  return freeze({
    status: 'RELATION_FAN_DERIVED',
    chain: freeze(chain),
    product: coordinateForWord(word),
    t_letters: word.filter((x) => x === 'T').length,
    q_letters: word.filter((x) => x === 'Q').length,
    boundary_identity: '∂Fan(a1...am)=Σ_i[a_i]-[product(a1...am)].',
  });
}

export function filteredRelationCycle(k) {
  if (!Number.isInteger(k) || k < 0) return freeze({ status: 'FILTERED_RELATION_CYCLE_ABSTAINS' });
  const leftWord = freeze(['T', ...Array(k).fill('Q'), 'T', 'Q']);
  const rightWord = freeze(['Q', 'T', ...Array(k).fill('Q'), 'T']);
  const left = fanChain(leftWord);
  const right = fanChain(rightWord);
  if (left.status !== 'RELATION_FAN_DERIVED' || right.status !== 'RELATION_FAN_DERIVED') {
    return freeze({ status: 'FILTERED_RELATION_CYCLE_ABSTAINS' });
  }
  const signedRight = right.chain.map((term) => freeze({ ...term, coefficient: -term.coefficient }));
  const chain = combineBar2Chains(left.chain, signedRight);
  const boundary = boundaryOfBar2Chain(chain);
  const passed = sameBase(left.product, right.product)
    && left.t_letters === right.t_letters
    && left.q_letters === right.q_letters
    && boundary.is_cycle;
  return freeze({
    status: passed ? 'FILTERED_RELATION_BAR_2_CYCLE_DERIVED' : 'FILTERED_RELATION_CYCLE_FAILED',
    k,
    left_word: leftWord,
    right_word: rightWord,
    common_product: left.product,
    chain,
    boundary,
    total_weight: Math.max(...chain.map((term) => totalTupleWeight([term.left, term.right]))),
    passed,
  });
}

function thetaChain() {
  const r0 = filteredRelationCycle(0);
  const r1 = filteredRelationCycle(1);
  if (!r0.passed || !r1.passed) return freeze({ status: 'FILTERED_THETA_ABSTAINS' });
  const negativeR0 = r0.chain.map((term) => freeze({ ...term, coefficient: -term.coefficient }));
  const chain = combineBar2Chains(r1.chain, negativeR0);
  const boundary = boundaryOfBar2Chain(chain);
  return freeze({
    status: boundary.is_cycle ? 'FILTERED_THETA_CYCLE_DERIVED' : 'FILTERED_THETA_CYCLE_FAILED',
    chain,
    boundary,
    r0,
    r1,
    passed: boundary.is_cycle,
  });
}

function coord(word) {
  const value = coordinateForWord([...word]);
  if (!value) throw new Error(`unreachable witness word ${word.join('')}`);
  return value;
}

function predeclaredThreeChain() {
  const TQ = coord(['T', 'Q']);
  const QT = coord(['Q', 'T']);
  const QTQ = coord(['Q', 'T', 'Q']);
  const TQT = coord(['T', 'Q', 'T']);
  const TT = coord(['T', 'T']);
  return freeze([
    freeze({ coefficient: -1, x: T, y: Q, z: T, label: '-[T|Q|T]' }),
    freeze({ coefficient: 1, x: T, y: T, z: Q, label: '[T|T|Q]' }),
    freeze({ coefficient: 1, x: T, y: TQ, z: T, label: '[T|TQ|T]' }),
    freeze({ coefficient: -1, x: T, y: QT, z: Q, label: '-[T|QT|Q]' }),
    freeze({ coefficient: -1, x: T, y: QTQ, z: T, label: '-[T|QTQ|T]' }),
    freeze({ coefficient: 1, x: T, y: TQT, z: Q, label: '[T|TQT|Q]' }),
    freeze({ coefficient: 1, x: QT, y: Q, z: T, label: '[QT|Q|T]' }),
    freeze({ coefficient: -1, x: QT, y: T, z: T, label: '-[QT|T|T]' }),
    freeze({ coefficient: 1, x: QT, y: QT, z: T, label: '[QT|QT|T]' }),
    freeze({ coefficient: -1, x: QT, y: TT, z: Q, label: '-[QT|TT|Q]' }),
  ]);
}

function sparseBoundaryColumns(degree, maxWeight) {
  const domain = enumerateBarBasis(degree, maxWeight);
  const codomain = enumerateBarBasis(degree - 1, maxWeight);
  const rowIndex = new Map(codomain.map((tuple, index) => [keyTuple(tuple), index]));
  const columns = domain.map((tuple) => {
    const pieces = degree === 2 ? boundary2Terms(tuple[0], tuple[1]) : boundary3Terms(tuple[0], tuple[1], tuple[2]);
    const map = new Map();
    for (const piece of pieces ?? []) {
      const row = rowIndex.get(keyTuple(piece.tuple));
      if (!Number.isInteger(row)) throw new Error('filtered boundary left codomain');
      map.set(row, (map.get(row) ?? 0) + piece.coefficient);
    }
    return freeze([...map.entries()].filter(([, coefficient]) => coefficient !== 0));
  });
  return freeze({ domain, codomain, columns });
}

function rankF2FromSparseColumns(columns) {
  const pivots = new Map();
  let rank = 0;
  for (const column of columns) {
    let vector = 0n;
    for (const [row, coefficient] of column) {
      if (Math.abs(coefficient) % 2 === 1) vector ^= (1n << BigInt(row));
    }
    while (vector !== 0n) {
      const pivotBit = vector & (-vector);
      const key = pivotBit.toString();
      const prior = pivots.get(key);
      if (prior === undefined) {
        pivots.set(key, vector);
        rank += 1;
        break;
      }
      vector ^= prior;
    }
  }
  return rank;
}

function bar2ChainAsSparseColumn(chain, basis) {
  const index = new Map(basis.map((tuple, i) => [keyTuple(tuple), i]));
  const map = new Map();
  for (const term of chain) {
    const row = index.get(keyTuple([term.left, term.right]));
    if (!Number.isInteger(row)) return null;
    map.set(row, (map.get(row) ?? 0) + term.coefficient);
  }
  return freeze([...map.entries()].filter(([, coefficient]) => coefficient !== 0));
}

function rankModPrimeFromSparseColumns(columns, rowCount, prime) {
  const matrix = Array.from({ length: rowCount }, () => new Uint8Array(columns.length));
  for (let col = 0; col < columns.length; col += 1) {
    for (const [row, coefficient] of columns[col]) {
      const normalized = ((coefficient % prime) + prime) % prime;
      matrix[row][col] = normalized;
    }
  }
  let rank = 0;
  for (let col = 0; col < columns.length && rank < rowCount; col += 1) {
    let pivot = -1;
    for (let row = rank; row < rowCount; row += 1) {
      if (matrix[row][col] !== 0) { pivot = row; break; }
    }
    if (pivot < 0) continue;
    if (pivot !== rank) [matrix[pivot], matrix[rank]] = [matrix[rank], matrix[pivot]];
    const pivotValue = matrix[rank][col];
    const inverse = pivotValue === 1 ? 1 : prime === 3 && pivotValue === 2 ? 2 : (() => {
      for (let i = 1; i < prime; i += 1) if ((pivotValue * i) % prime === 1) return i;
      throw new Error('no modular inverse');
    })();
    for (let c = col; c < columns.length; c += 1) matrix[rank][c] = (matrix[rank][c] * inverse) % prime;
    for (let row = 0; row < rowCount; row += 1) {
      if (row === rank || matrix[row][col] === 0) continue;
      const factor = matrix[row][col];
      for (let c = col; c < columns.length; c += 1) {
        matrix[row][c] = ((matrix[row][c] - factor * matrix[rank][c]) % prime + prime) % prime;
      }
    }
    rank += 1;
  }
  return rank;
}

function mod2NonBoundaryCertificate(maxWeight, theta) {
  const d3 = sparseBoundaryColumns(3, maxWeight);
  const thetaColumn = bar2ChainAsSparseColumn(theta.chain, d3.codomain);
  if (!thetaColumn) return freeze({ passed: false, status: 'FILTERED_MOD2_NONBOUNDARY_ABSTAINS' });
  const baseRank = rankF2FromSparseColumns(d3.columns);
  const augmentedRank = rankF2FromSparseColumns([...d3.columns, thetaColumn]);
  return freeze({
    status: 'FILTERED_MOD2_NONBOUNDARY_RANK_CERTIFICATE_DERIVED',
    max_weight: maxWeight,
    c2_size: d3.codomain.length,
    c3_size: d3.domain.length,
    rank_im_d3_mod2: baseRank,
    rank_augmented_with_theta_mod2: augmentedRank,
    theta_nonboundary_mod2: augmentedRank === baseRank + 1,
    passed: augmentedRank === baseRank + 1,
  });
}

function finiteWindowScarCertificate(theta) {
  const d2F4 = sparseBoundaryColumns(2, 4);
  const d3F4 = sparseBoundaryColumns(3, 4);
  const r0 = theta.r0;
  const r1 = theta.r1;
  const r0Column = bar2ChainAsSparseColumn(r0.chain, d3F4.codomain);
  const r1Column = bar2ChainAsSparseColumn(r1.chain, d3F4.codomain);
  if (!r0Column || !r1Column) return freeze({ passed: false, status: 'FILTERED_WINDOW_SCAR_ABSTAINS' });
  const rankD2Mod3 = rankModPrimeFromSparseColumns(d2F4.columns, d2F4.codomain.length, 3);
  const rankD3Mod3 = rankModPrimeFromSparseColumns(d3F4.columns, d3F4.codomain.length, 3);
  const rankWithR0 = rankModPrimeFromSparseColumns([...d3F4.columns, r0Column], d3F4.codomain.length, 3);
  const rankWithR0R1 = rankModPrimeFromSparseColumns([...d3F4.columns, r0Column, r1Column], d3F4.codomain.length, 3);
  const c2Size = d2F4.domain.length;
  const upperBoundQ = c2Size - rankD2Mod3 - rankD3Mod3;
  const independentMod3 = rankWithR0 === rankD3Mod3 + 1 && rankWithR0R1 === rankD3Mod3 + 2;
  const exactH2QDimensionF4 = independentMod3 && upperBoundQ === 2 ? 2 : null;
  const omegaR0 = pairCochain(transportIncrementCocycle, r0.chain);
  const imageF4toF5DimensionQ = exactH2QDimensionF4 === 2 && omegaR0 === 2 ? 1 : null;
  return freeze({
    status: 'FILTERED_WINDOW_NONSTABILIZATION_SCAR_DERIVED',
    F4: freeze({
      c1_size: d2F4.codomain.length,
      c2_size: d2F4.domain.length,
      c3_size: d3F4.domain.length,
      rank_d2_mod3: rankD2Mod3,
      rank_d3_mod3: rankD3Mod3,
      rank_d3_plus_r0_mod3: rankWithR0,
      rank_d3_plus_r0_r1_mod3: rankWithR0R1,
      exact_h2_tensor_Q_dimension: exactH2QDimensionF4,
    }),
    F4_to_F5: freeze({
      theta_is_r1_minus_r0: true,
      two_theta_boundary_implies_theta_rational_boundary: true,
      omega_r0: omegaR0,
      common_image_nonzero: omegaR0 !== 0,
      exact_image_dimension_over_Q: imageF4toF5DimensionQ,
    }),
    lesson: 'A finite filtration can have two-dimensional H2 tensor Q while its image in the next filtration is only one-dimensional; adjacent dimension counts do not prove colimit stabilization.',
    passed: exactH2QDimensionF4 === 2 && imageF4toF5DimensionQ === 1,
  });
}

function pairCochain(cochain, chain) {
  let total = 0;
  for (const term of chain) {
    const value = cochain(term.left, term.right);
    if (!Number.isInteger(value)) return null;
    total += term.coefficient * value;
  }
  return total === 0 ? 0 : total;
}

function falseRelationHostile() {
  const left = fanChain(['T', 'Q']);
  const right = fanChain(['Q', 'T']);
  const sameProduct = sameBase(left.product, right.product);
  return freeze({
    passed: !sameProduct,
    left_product: left.product,
    right_product: right.product,
    classification: 'FALSE_RELATION_WITH_DISTINCT_QUOTIENT_PRODUCTS_RECEIVES_NO_RELATION_CYCLE_AUTHORITY',
  });
}

function invalidControls() {
  const unreachable = freeze({ t: 0, E: 0, O: 1 });
  const unitSlotWeight = totalTupleWeight([UNIT, T]);
  const overflow = totalTupleWeight([coord(['T', 'Q', 'T']), coord(['Q', 'T', 'Q'])]);
  return freeze({
    unreachable_coordinate_abstains: filteredBarWeight(unreachable) === null,
    normalized_unit_slot_abstains: unitSlotWeight === null,
    F5_overflow_detected: Number.isInteger(overflow) && overflow > 5,
    false_relation_rejected: falseRelationHostile().passed,
  });
}

export function filteredH2TwoTorsionHolonomyBlindnessCertificate() {
  const theta = thetaChain();
  const Btheta = predeclaredThreeChain();
  const boundaryB = boundaryOfBar3Chain(Btheta);
  const twoTheta = scaleBar2Chain(theta.chain, 2);
  const exactDoubleBoundary = boundaryB.status === 'FILTERED_BAR_3_BOUNDARY_DERIVED'
    && tupleChainEqualsBar2Terms(boundaryB.terms, twoTheta);
  const BMaxWeight = Math.max(...Btheta.map((term) => totalTupleWeight([term.x, term.y, term.z])));

  const mod2F5 = mod2NonBoundaryCertificate(5, theta);
  const mod2F6 = mod2NonBoundaryCertificate(6, theta);

  const omegaR0 = pairCochain(transportIncrementCocycle, theta.r0.chain);
  const omegaR1 = pairCochain(transportIncrementCocycle, theta.r1.chain);
  const omegaTheta = pairCochain(transportIncrementCocycle, theta.chain);
  const swapR0 = pairCochain(swappedTransportCocycle, theta.r0.chain);
  const swapR1 = pairCochain(swappedTransportCocycle, theta.r1.chain);
  const swapTheta = pairCochain(swappedTransportCocycle, theta.chain);

  const exactF5OrderTwo = theta.passed
    && exactDoubleBoundary
    && BMaxWeight <= 5
    && mod2F5.passed
    && mod2F5.rank_im_d3_mod2 === 123
    && mod2F5.rank_augmented_with_theta_mod2 === 124;

  const exactF6OrderTwo = exactF5OrderTwo
    && mod2F6.passed
    && mod2F6.rank_im_d3_mod2 === 302
    && mod2F6.rank_augmented_with_theta_mod2 === 303;

  const holonomyBlindness = exactF5OrderTwo
    && omegaR0 === 2
    && omegaR1 === 2
    && omegaTheta === 0
    && swapR0 === -2
    && swapR1 === -2
    && swapTheta === 0;

  const windowScar = finiteWindowScarCertificate(theta);
  const invalids = invalidControls();
  const invalidsPassed = Object.values(invalids).every(Boolean);

  const passed = exactF5OrderTwo && exactF6OrderTwo && holonomyBlindness && windowScar.passed && invalidsPassed;

  return freeze({
    status: passed ? 'FILTERED_H2_TWO_TORSION_HOLONOMY_BLINDNESS_CERTIFICATE_PASSED' : 'FILTERED_H2_TWO_TORSION_HOLONOMY_BLINDNESS_CERTIFICATE_FAILED',
    passed,
    schema: FILTERED_H2_TWO_TORSION_HOLONOMY_BLINDNESS_SCHEMA,
    parent_receipt: FILTERED_H2_TWO_TORSION_HOLONOMY_BLINDNESS_PARENT_RECEIPT,
    relation_cycles: freeze({
      r0: theta.r0,
      r1: theta.r1,
      r0_is_inherited_z: theta.r0.k === 0 && theta.r0.chain.length === 4,
    }),
    theta: freeze({
      chain: theta.chain,
      boundary: theta.boundary,
      is_cycle: theta.passed,
      definition: 'theta = r1-r0',
    }),
    double_boundary: freeze({
      B_theta: Btheta,
      B_theta_max_weight: BMaxWeight,
      boundary: boundaryB,
      exact_boundary_equals_two_theta: exactDoubleBoundary,
    }),
    F5: freeze({
      exact_order_two: exactF5OrderTwo,
      mod2_nonboundary: mod2F5,
      classification: exactF5OrderTwo ? 'FILTERED_BAR_H2_EXACT_TWO_TORSION_CLASS_EARNED_IN_F5' : 'UNEARNED',
    }),
    F6: freeze({
      exact_order_two: exactF6OrderTwo,
      mod2_nonboundary: mod2F6,
      classification: exactF6OrderTwo ? 'FILTERED_BAR_H2_TWO_TORSION_PERSISTS_THROUGH_F6' : 'UNEARNED',
    }),
    integer_holonomy: freeze({
      omega_r0: omegaR0,
      omega_r1: omegaR1,
      omega_theta: omegaTheta,
      swapped_r0: swapR0,
      swapped_r1: swapR1,
      swapped_theta: swapTheta,
      all_integer_characters_kill_theta: exactF5OrderTwo,
      proof: 'For every h:H2(F5;Z)->Z, 2h([theta])=h(2[theta])=0; torsion-freeness of Z forces h([theta])=0.',
      translation_return: exactF5OrderTwo ? 'tau_0=id for every integer-valued formal 2-holonomy character on [theta]' : null,
      classification: holonomyBlindness ? 'INTEGER_VALUED_FORMAL_TWO_HOLONOMY_BLINDNESS_TO_FILTERED_TWO_TORSION_EARNED' : 'UNEARNED',
    }),
    finite_window_scar: windowScar,
    invalid_controls: invalids,
    consequential_bearing: passed ? 'FORMAL_TWO_HOLONOMY_CAN_BE_COHOMOLOGICALLY_COMPLETE_FOR_INTEGER_TRANSPORT_CLASSES_WHILE_REMAINING_NONFAITHFUL_ON_TORSION_HOMOLOGY_CLASSES' : 'UNEARNED',
    ceilings: freeze({
      full_H2_torsion_authority: false,
      all_N_persistence_authority: false,
      filtered_colimit_stabilization_authority: false,
      geometric_two_holonomy_authority: false,
      physical_two_holonomy_authority: false,
      connection_authority: false,
      two_connection_authority: false,
      curvature_authority: false,
      operational_path_two_groupoid_authority: false,
    }),
    scars: freeze([
      'F5 torsion != full H2(B;Z) torsion',
      'F6 persistence != all-N persistence',
      'stable-looking finite H2 dimension != stable filtered-colimit image',
      'integer-character blindness to torsion != failure of #773 transport classification',
      'filtered bar homology != operational T/Q loop space',
      'mod-2 detector != physical Z2 gauge field',
    ]),
  });
}
