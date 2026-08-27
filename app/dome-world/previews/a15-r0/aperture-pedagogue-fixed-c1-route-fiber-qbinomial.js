import {
  firstMomentCoordinate,
} from './aperture-pedagogue-first-moment-weaker-transport-quotient.js';

export const FIXED_C1_ROUTE_FIBER_QBINOMIAL_SCHEMA = 'td613.a15-r0.fixed-c1-route-fiber-qbinomial/v0.1';
export const FIXED_C1_ROUTE_FIBER_QBINOMIAL_PARENT_RECEIPT = '0b123f0d94ad28b73f31f9cb80603042dc7881b2';
export const FIXED_C1_ROUTE_FIBER_QBINOMIAL_GATE_ISSUE = 737;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const nat = (value) => Number.isSafeInteger(value) && value >= 0;
const key = (value) => JSON.stringify(value);
const Q = (n) => Array.from({ length: n }, () => 'Q');

function countT(word) {
  return word.filter((g) => g === 'T').length;
}

function bigintBitsForCardinality(value) {
  if (typeof value !== 'bigint' || value < 1n) return null;
  if (value === 1n) return 0;
  return (value - 1n).toString(2).length;
}

function chooseBigInt(n, k) {
  if (!nat(n) || !nat(k) || k > n) return null;
  const r = Math.min(k, n - k);
  let out = 1n;
  for (let i = 1; i <= r; i += 1) {
    out = (out * BigInt(n - r + i)) / BigInt(i);
  }
  return out;
}

function convolveBigInt(left, right) {
  const out = Array.from({ length: left.length + right.length - 1 }, () => 0n);
  for (let i = 0; i < left.length; i += 1) {
    for (let j = 0; j < right.length; j += 1) {
      out[i + j] += left[i] * right[j];
    }
  }
  return out;
}

// Coefficients count nonnegative allocations c_0..c_maxPart with
// sum c_j=itemCount and weighted sum sum j*c_j=weight.
// This is the Gaussian polynomial [itemCount+maxPart choose itemCount]_q
// through the standard bounded-partition/multiset bijection.
function rectangleAllocationPolynomialBigInt(itemCount, maxPart) {
  if (!nat(itemCount) || !nat(maxPart)) return null;
  const maxWeight = itemCount * maxPart;
  if (!Number.isSafeInteger(maxWeight)) return null;
  let states = Array.from({ length: itemCount + 1 }, () =>
    Array.from({ length: maxWeight + 1 }, () => 0n));
  states[0][0] = 1n;

  for (let part = 0; part <= maxPart; part += 1) {
    const next = Array.from({ length: itemCount + 1 }, () =>
      Array.from({ length: maxWeight + 1 }, () => 0n));
    for (let used = 0; used <= itemCount; used += 1) {
      for (let weight = 0; weight <= maxWeight; weight += 1) {
        const base = states[used][weight];
        if (base === 0n) continue;
        for (let copies = 0; used + copies <= itemCount; copies += 1) {
          const w2 = weight + (copies * part);
          if (w2 > maxWeight) break;
          next[used + copies][w2] += base;
        }
      }
    }
    states = next;
  }
  return states[itemCount];
}

function serializePolynomial(coefficients) {
  return freeze(coefficients.map((x) => x.toString()));
}

export function routeWordFromBlocks(blocks) {
  if (!Array.isArray(blocks) || blocks.length < 1 || !blocks.every(nat)) {
    return freeze({ status: 'FIXED_C1_ROUTE_BLOCKS_ABSTAIN' });
  }
  const word = [];
  blocks.forEach((qCount, index) => {
    word.push(...Q(qCount));
    if (index < blocks.length - 1) word.push('T');
  });
  return freeze({
    status: 'FIXED_C1_ROUTE_WORD_DERIVED',
    blocks: freeze([...blocks]),
    word: freeze(word),
  });
}

export function c1FromBlocks(blocks) {
  const route = routeWordFromBlocks(blocks);
  if (route.status !== 'FIXED_C1_ROUTE_WORD_DERIVED') return route;
  const c1 = firstMomentCoordinate(route.word);
  if (c1?.status !== 'FIRST_MOMENT_WEAKER_TRANSPORT_COORDINATE_DERIVED') {
    return freeze({ status: 'FIXED_C1_ROUTE_C1_INTERNAL_MISMATCH', route, c1 });
  }
  return freeze({
    status: 'FIXED_C1_ROUTE_C1_DERIVED',
    route,
    c1: freeze({ t: c1.t, E: c1.E, O: c1.O, P: c1.P }),
  });
}

export function analyzeFixedC1State(t, E, O, P) {
  if (![t, E, O, P].every(nat)) {
    return freeze({ status: 'FIXED_C1_STATE_PARAMETERS_ABSTAIN' });
  }

  if (t === 0) {
    const lawful = O === 0 && P === 0;
    return freeze({
      status: lawful ? 'FIXED_C1_STATE_LAWFUL_T0' : 'FIXED_C1_STATE_UNLAWFUL_T0',
      lawful,
      t, E, O, P,
      a: 0,
      b: null,
      R: lawful ? 0 : null,
      M: lawful ? 0 : null,
    });
  }

  const a = Math.floor(t / 2);
  const b = Math.floor((t - 1) / 2);
  const delta = P - O;
  const parityOkay = delta % 2 === 0;
  const R = parityOkay ? delta / 2 : null;
  const M = (a * E) + (b * O);
  const lawful = parityOkay && R >= 0 && R <= M;

  return freeze({
    status: lawful ? 'FIXED_C1_STATE_LAWFUL' : 'FIXED_C1_STATE_UNLAWFUL',
    lawful,
    t, E, O, P, a, b, R, M,
    parity_okay: parityOkay,
  });
}

export function gaussianRectanglePolynomial(itemCount, maxPart) {
  const coefficients = rectangleAllocationPolynomialBigInt(itemCount, maxPart);
  if (!coefficients) return freeze({ status: 'GAUSSIAN_RECTANGLE_POLYNOMIAL_ABSTAIN' });
  const total = coefficients.reduce((acc, x) => acc + x, 0n);
  const expectedAtOne = chooseBigInt(itemCount + maxPart, itemCount);
  const passed = expectedAtOne !== null && total === expectedAtOne;
  return freeze({
    status: passed ? 'GAUSSIAN_RECTANGLE_POLYNOMIAL_DERIVED' : 'GAUSSIAN_RECTANGLE_POLYNOMIAL_INTERNAL_MISMATCH',
    item_count: itemCount,
    max_part: maxPart,
    coefficients: serializePolynomial(coefficients),
    value_at_one: total.toString(),
    expected_value_at_one: expectedAtOne?.toString() ?? null,
  });
}

export function fixedC1RouteGeneratingPolynomial(t, E, O) {
  if (![t, E, O].every(nat) || t < 1) {
    return freeze({ status: 'FIXED_C1_ROUTE_GENERATING_POLYNOMIAL_ABSTAIN' });
  }
  const a = Math.floor(t / 2);
  const b = Math.floor((t - 1) / 2);
  const even = rectangleAllocationPolynomialBigInt(E, a);
  const odd = rectangleAllocationPolynomialBigInt(O, b);
  if (!even || !odd) return freeze({ status: 'FIXED_C1_ROUTE_GENERATING_POLYNOMIAL_NUMERIC_ABSTAIN' });
  const product = convolveBigInt(even, odd);
  const total = product.reduce((acc, x) => acc + x, 0n);
  const evenCount = chooseBigInt(E + a, E);
  const oddCount = chooseBigInt(O + b, O);
  if (evenCount === null || oddCount === null) {
    return freeze({ status: 'FIXED_C1_ROUTE_GENERATING_POLYNOMIAL_NUMERIC_ABSTAIN' });
  }
  const expected = evenCount * oddCount;
  const passed = total === expected;
  return freeze({
    status: passed ? 'FIXED_C1_ROUTE_GENERATING_POLYNOMIAL_DERIVED' : 'FIXED_C1_ROUTE_GENERATING_POLYNOMIAL_INTERNAL_MISMATCH',
    t, E, O, a, b,
    even_gaussian_coefficients: serializePolynomial(even),
    odd_gaussian_coefficients: serializePolynomial(odd),
    product_coefficients: serializePolynomial(product),
    total_route_count: total.toString(),
    expected_total_route_count: expected.toString(),
  });
}

export function fixedC1RouteCount(t, E, O, P) {
  const state = analyzeFixedC1State(t, E, O, P);
  if (!state.lawful) {
    return freeze({ status: 'FIXED_C1_ROUTE_COUNT_ABSTAINS_UNLAWFUL_STATE', state });
  }
  if (t === 0) {
    return freeze({
      status: 'FIXED_C1_ROUTE_COUNT_DERIVED',
      state,
      route_count: '1',
      minimum_alphabet_cardinality: '1',
      minimum_fixed_width_binary_bits: 0,
    });
  }
  const polynomial = fixedC1RouteGeneratingPolynomial(t, E, O);
  if (polynomial.status !== 'FIXED_C1_ROUTE_GENERATING_POLYNOMIAL_DERIVED') {
    return freeze({ status: 'FIXED_C1_ROUTE_COUNT_POLYNOMIAL_ABSTAIN', state, polynomial });
  }
  const count = BigInt(polynomial.product_coefficients[state.R] ?? '0');
  if (count < 1n) {
    return freeze({ status: 'FIXED_C1_ROUTE_COUNT_INTERNAL_ZERO', state, polynomial });
  }
  return freeze({
    status: 'FIXED_C1_ROUTE_COUNT_DERIVED',
    state,
    polynomial,
    route_count: count.toString(),
    minimum_alphabet_cardinality: count.toString(),
    minimum_fixed_width_binary_bits: bigintBitsForCardinality(count),
  });
}

function compositions(total, slots) {
  if (!nat(total) || !nat(slots) || slots < 1) return [];
  const out = [];
  const current = Array.from({ length: slots }, () => 0);
  const walk = (index, remaining) => {
    if (index === slots - 1) {
      current[index] = remaining;
      out.push([...current]);
      return;
    }
    for (let value = 0; value <= remaining; value += 1) {
      current[index] = value;
      walk(index + 1, remaining - value);
    }
  };
  walk(0, total);
  return out;
}

function interleaveBlocks(t, evenAllocation, oddAllocation) {
  const blocks = Array.from({ length: t + 1 }, () => 0);
  evenAllocation.forEach((value, j) => { blocks[2 * j] = value; });
  oddAllocation.forEach((value, j) => { blocks[(2 * j) + 1] = value; });
  return blocks;
}

export function enumerateFixedBaseRoutes(t, E, O) {
  if (![t, E, O].every(nat)) return freeze({ status: 'FIXED_BASE_ROUTE_ENUMERATION_ABSTAIN' });
  if (t === 0) {
    if (O !== 0) return freeze({ status: 'FIXED_BASE_ROUTE_ENUMERATION_ABSTAINS_UNLAWFUL_T0' });
    const blocks = [E];
    const derived = c1FromBlocks(blocks);
    const row = freeze({
      evenAllocation: freeze([E]),
      oddAllocation: freeze([]),
      blocks: freeze(blocks),
      derived,
    });
    return freeze({ status: 'FIXED_BASE_ROUTE_ENUMERATION_DERIVED', t, E, O, rows: freeze([row]) });
  }
  const a = Math.floor(t / 2);
  const b = Math.floor((t - 1) / 2);
  const evens = compositions(E, a + 1);
  const odds = compositions(O, b + 1);
  const rows = [];
  evens.forEach((evenAllocation) => {
    odds.forEach((oddAllocation) => {
      const blocks = interleaveBlocks(t, evenAllocation, oddAllocation);
      const derived = c1FromBlocks(blocks);
      rows.push(freeze({ evenAllocation: freeze(evenAllocation), oddAllocation: freeze(oddAllocation), blocks: freeze(blocks), derived }));
    });
  });
  const passed = rows.every((row) => row.derived.status === 'FIXED_C1_ROUTE_C1_DERIVED'
    && row.derived.c1.t === t && row.derived.c1.E === E && row.derived.c1.O === O);
  return freeze({
    status: passed ? 'FIXED_BASE_ROUTE_ENUMERATION_DERIVED' : 'FIXED_BASE_ROUTE_ENUMERATION_INTERNAL_MISMATCH',
    t, E, O, rows: freeze(rows),
  });
}

export function enumerateFixedC1RouteFiber(t, E, O, P) {
  const count = fixedC1RouteCount(t, E, O, P);
  if (count.status !== 'FIXED_C1_ROUTE_COUNT_DERIVED') {
    return freeze({ status: 'FIXED_C1_ROUTE_FIBER_ENUMERATION_ABSTAINS', count });
  }
  const base = enumerateFixedBaseRoutes(t, E, O);
  if (base.status !== 'FIXED_BASE_ROUTE_ENUMERATION_DERIVED') {
    return freeze({ status: 'FIXED_C1_ROUTE_FIBER_ENUMERATION_BASE_ABSTAIN', count, base });
  }
  const rows = base.rows
    .filter((row) => row.derived.c1.P === P)
    .sort((left, right) => key(left.blocks).localeCompare(key(right.blocks)))
    .map((row, routeRank) => freeze({ ...row, route_rank: routeRank }));
  const passed = BigInt(rows.length) === BigInt(count.route_count)
    && new Set(rows.map((row) => key(row.blocks))).size === rows.length;
  return freeze({
    status: passed ? 'FIXED_C1_ROUTE_FIBER_ENUMERATED' : 'FIXED_C1_ROUTE_FIBER_ENUMERATION_COUNT_MISMATCH',
    t, E, O, P,
    predicted_route_count: count.route_count,
    rows: freeze(rows),
  });
}

export function auditFixedC1RouteCustody(t, E, O, P, labelRows, declaredAlphabetSize) {
  const fiber = enumerateFixedC1RouteFiber(t, E, O, P);
  if (fiber.status !== 'FIXED_C1_ROUTE_FIBER_ENUMERATED'
      || !Array.isArray(labelRows)
      || !nat(declaredAlphabetSize) || declaredAlphabetSize < 1) {
    return freeze({ status: 'FIXED_C1_ROUTE_CUSTODY_AUDIT_ABSTAIN' });
  }
  const lawful = new Set(fiber.rows.map((row) => key(row.blocks)));
  const routeToLabel = new Map();
  const labelToRoute = new Map();
  const collisions = [];
  const unlawful = [];
  const duplicates = [];
  labelRows.forEach((row) => {
    const blocksKey = key(row?.blocks);
    if (!lawful.has(blocksKey) || !Object.prototype.hasOwnProperty.call(row, 'label')) {
      unlawful.push(row?.blocks ?? null);
      return;
    }
    if (routeToLabel.has(blocksKey)) duplicates.push(row.blocks);
    routeToLabel.set(blocksKey, row.label);
    const labelKey = key(row.label);
    if (labelToRoute.has(labelKey) && labelToRoute.get(labelKey) !== blocksKey) {
      collisions.push(freeze({ label: row.label, left: JSON.parse(labelToRoute.get(labelKey)), right: row.blocks }));
    } else {
      labelToRoute.set(labelKey, blocksKey);
    }
  });
  const missing = fiber.rows.filter((row) => !routeToLabel.has(key(row.blocks))).map((row) => row.blocks);
  const required = fiber.rows.length;
  const undersized = declaredAlphabetSize < required;
  const alphabetOverrun = labelToRoute.size > declaredAlphabetSize;
  const exact = !undersized && !alphabetOverrun && collisions.length === 0
    && unlawful.length === 0 && duplicates.length === 0 && missing.length === 0
    && routeToLabel.size === required;
  return freeze({
    status: 'FIXED_C1_ROUTE_CUSTODY_SCHEME_AUDITED',
    required_alphabet_size: required,
    declared_alphabet_size: declaredAlphabetSize,
    undersized,
    alphabet_overrun: alphabetOverrun,
    collisions: freeze(collisions),
    unlawful_routes: freeze(unlawful),
    duplicate_routes: freeze(duplicates),
    missing_routes: freeze(missing),
    exact,
    classification: exact
      ? 'EXACT_FIXED_C1_AUTHORED_ROUTE_CUSTODY_WITNESSED'
      : undersized
        ? 'EXACT_FIXED_C1_AUTHORED_ROUTE_RECOVERY_FORBIDDEN_BY_FINITE_CUSTODY_LOWER_BOUND'
        : 'FIXED_C1_ROUTE_CUSTODY_CAPACITY_OR_MAPPING_INSUFFICIENT',
  });
}

function symbolicPartitionCertificate() {
  return freeze({
    passed: true,
    block_identity: 'q_(2j)=e_j and q_(2j+1)=o_j split the unique authored block vector into even and odd allocations.',
    coordinate_identity: 'R=(P-O)/2=sum_j j*e_j+sum_j j*o_j.',
    even_bijection: 'An even allocation with sum E maps to a partition inside the E x a rectangle by repeating part j exactly e_j times; inverse multiplicities recover e_j.',
    odd_bijection: 'An odd allocation with sum O maps to a partition inside the O x b rectangle by repeating part j exactly o_j times; inverse multiplicities recover o_j.',
    coefficient_product: 'Pairs of rectangle partitions with weights summing to R are counted by the q^R coefficient of the product of the two Gaussian polynomials.',
    authority: 'ALL_FINITE_LAWFUL_t_E_O_P_BY_EXACT_BLOCK_VECTOR_BIJECTION_NOT_HORIZON_ENUMERATION',
  });
}

function inheritedTwoRouteHostile() {
  const fiber = enumerateFixedC1RouteFiber(3, 1, 1, 3);
  const words = fiber.status === 'FIXED_C1_ROUTE_FIBER_ENUMERATED'
    ? fiber.rows.map((row) => row.derived.route.word.join(''))
    : [];
  const expected = ['QTTTQ', 'TQTQT'].sort();
  return freeze({
    passed: fiber.status === 'FIXED_C1_ROUTE_FIBER_ENUMERATED'
      && fiber.predicted_route_count === '2'
      && key([...words].sort()) === key(expected),
    fiber,
    words: freeze(words),
  });
}

function exhaustiveSmallCorroboration() {
  const rows = [];
  for (let t = 0; t <= 5; t += 1) {
    for (let E = 0; E <= 4; E += 1) {
      for (let O = 0; O <= 4; O += 1) {
        const base = enumerateFixedBaseRoutes(t, E, O);
        if (base.status !== 'FIXED_BASE_ROUTE_ENUMERATION_DERIVED') {
          if (t === 0 && O > 0) continue;
          rows.push(freeze({ t, E, O, passed: false, reason: base.status }));
          continue;
        }
        const byP = new Map();
        base.rows.forEach((row) => {
          const P = row.derived.c1.P;
          byP.set(P, (byP.get(P) ?? 0) + 1);
        });
        let passed = true;
        for (const [P, observed] of byP.entries()) {
          const predicted = fixedC1RouteCount(t, E, O, P);
          if (predicted.status !== 'FIXED_C1_ROUTE_COUNT_DERIVED'
              || BigInt(observed) !== BigInt(predicted.route_count)) {
            passed = false;
            break;
          }
        }
        rows.push(freeze({ t, E, O, observed_total: base.rows.length, strata: byP.size, passed }));
      }
    }
  }
  return freeze({ passed: rows.every((row) => row.passed), rows: freeze(rows), authority: 'FINITE_CORROBORATION_ONLY' });
}

function custodyHostiles() {
  const fiber = enumerateFixedC1RouteFiber(3, 1, 1, 3);
  const exactRows = fiber.rows.map((row) => freeze({ blocks: row.blocks, label: row.route_rank }));
  const exact = auditFixedC1RouteCustody(3, 1, 1, 3, exactRows, 2);
  const undersizedRows = fiber.rows.map((row) => freeze({ blocks: row.blocks, label: 0 }));
  const undersized = auditFixedC1RouteCustody(3, 1, 1, 3, undersizedRows, 1);
  const collision = auditFixedC1RouteCustody(3, 1, 1, 3, undersizedRows, 2);
  return freeze({
    passed: exact.exact
      && undersized.undersized && !undersized.exact
      && !collision.undersized && collision.collisions.length === 1 && !collision.exact,
    exact,
    undersized,
    collision,
  });
}

function edgeHostiles() {
  const t0 = fixedC1RouteCount(0, 7, 0, 0);
  const t0Fiber = enumerateFixedC1RouteFiber(0, 7, 0, 0);
  const t1 = fixedC1RouteCount(1, 4, 3, 3);
  const parity = fixedC1RouteCount(3, 1, 1, 2);
  const high = fixedC1RouteCount(3, 1, 1, 9);
  return freeze({
    passed: t0.route_count === '1' && t0.minimum_fixed_width_binary_bits === 0
      && t0Fiber.status === 'FIXED_C1_ROUTE_FIBER_ENUMERATED'
      && t0Fiber.rows.length === 1
      && key(t0Fiber.rows[0].blocks) === key([7])
      && t1.route_count === '1' && t1.minimum_fixed_width_binary_bits === 0
      && parity.status === 'FIXED_C1_ROUTE_COUNT_ABSTAINS_UNLAWFUL_STATE'
      && high.status === 'FIXED_C1_ROUTE_COUNT_ABSTAINS_UNLAWFUL_STATE',
    t0, t0Fiber, t1, parity, high,
  });
}

function sumRuleHostile() {
  const rows = [];
  for (let t = 1; t <= 5; t += 1) {
    for (let E = 0; E <= 4; E += 1) {
      for (let O = 0; O <= 4; O += 1) {
        const poly = fixedC1RouteGeneratingPolynomial(t, E, O);
        rows.push(freeze({
          t, E, O,
          passed: poly.status === 'FIXED_C1_ROUTE_GENERATING_POLYNOMIAL_DERIVED'
            && poly.total_route_count === poly.expected_total_route_count,
          poly,
        }));
      }
    }
  }
  return freeze({ passed: rows.every((row) => row.passed), rows: freeze(rows) });
}

function seamAntiImpersonationControl() {
  const route = routeWordFromBlocks([0, 1, 1, 0]); // T Q T Q T
  return freeze({
    passed: route.status === 'FIXED_C1_ROUTE_WORD_DERIVED' && countT(route.word) === 3,
    classification: 'COMPLETE_UNSEGMENTED_AUTHORED_ROUTE_WORD_DOES_NOT_BY_ITSELF_DECLARE_COMPOSITION_SEAMS',
    route,
    authority: '#743_#744_#745_SEAM_CUSTODY_REMAINS_SEPARATE',
  });
}

export function runFixedC1RouteFiberQBinomialChamber() {
  const symbolic = symbolicPartitionCertificate();
  const inherited = inheritedTwoRouteHostile();
  const finite = exhaustiveSmallCorroboration();
  const custody = custodyHostiles();
  const edges = edgeHostiles();
  const sumRule = sumRuleHostile();
  const seamControl = seamAntiImpersonationControl();
  const certificates = freeze({
    symbolic_partition_bijection: symbolic,
    inherited_same_c1_different_route_hostile: inherited,
    finite_exhaustive_corroboration: finite,
    route_custody_hostiles: custody,
    edge_hostiles: edges,
    base_to_c1_sum_rule: sumRule,
    seam_anti_impersonation_control: seamControl,
  });
  const passed = Object.values(certificates).every((certificate) => certificate.passed);
  return freeze({
    schema: FIXED_C1_ROUTE_FIBER_QBINOMIAL_SCHEMA,
    parent_receipt: FIXED_C1_ROUTE_FIBER_QBINOMIAL_PARENT_RECEIPT,
    gate_issue: FIXED_C1_ROUTE_FIBER_QBINOMIAL_GATE_ISSUE,
    status: passed ? 'FIXED_C1_ROUTE_FIBER_QBINOMIAL_CHAMBER_PASSED' : 'FIXED_C1_ROUTE_FIBER_QBINOMIAL_CHAMBER_FAILED',
    passed,
    certificates,
    canonical_candidate: passed
      ? 'THE_FIXED_C1_AUTHORED_ROUTE_WORD_FIBER_HAS_EXACT_CARDINALITY_EQUAL_TO_THE_q^R_COEFFICIENT_OF_[E+a_CHOOSE_E]_q_[O+b_CHOOSE_O]_q'
      : 'UNCLASSIFIED',
    consequential_candidate: passed
      ? 'EXACT_FIRST_MOMENT_CUSTODY_CAN_LEAVE_NONTRIVIAL_FINITE_COMPLETE_ROUTE_MULTIPLICITY_WITH_AN_EXACT_GAUSSIAN_POLYNOMIAL_COUNT'
      : 'UNCLASSIFIED',
    architectural_candidate: passed
      ? 'COMPLETE_AUTHORED_ROUTE_CUSTODY_IS_A_SEPARATE_FINITE_RESOURCE_ABOVE_C1_AND_BELOW_ANY_CLAIM_OF_REAL_WORLD_PROVENANCE'
      : 'UNCLASSIFIED',
    landing: freeze({
      exact_first_moment_not_exact_authored_route: true,
      route_multiplicity_stays_visible: true,
      route_count_not_probability: true,
      route_rank_not_historical_priority: true,
      seam_custody_not_route_custody: true,
      missing_route_evidence_requires_fiber_or_abstention: true,
    }),
  });
}
