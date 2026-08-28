import {
  analyzeFixedC1State,
  enumerateFixedBaseRoutes,
  enumerateFixedC1RouteFiber,
} from './aperture-pedagogue-fixed-c1-route-fiber-qbinomial.js';
import {
  predictedSeamHyperrectangle,
} from './aperture-pedagogue-all-finite-seam-hyperrectangle.js';

export const FIXED_C1_JOINT_ROUTE_SEAM_SCHEMA = 'td613.a15-r0.fixed-c1-joint-route-seam-fiber/v0.1';
export const FIXED_C1_JOINT_ROUTE_SEAM_PARENT_RECEIPT = 'f15ab5e46c7ee7de43a44386c8fea36e272dba9b';
export const FIXED_C1_JOINT_ROUTE_SEAM_GATE_ISSUE = 737;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const nat = (value) => Number.isSafeInteger(value) && value >= 0;
const key = (value) => JSON.stringify(value);

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

function serializePolynomial(coefficients) {
  return freeze(coefficients.map((value) => value.toString()));
}

function parseRank(value) {
  if (typeof value === 'bigint') return value >= 0n ? value : null;
  if (typeof value === 'number') return nat(value) ? BigInt(value) : null;
  if (typeof value === 'string' && /^(0|[1-9][0-9]*)$/.test(value)) return BigInt(value);
  return null;
}

export function seamSplitSlotWeights(t, parity) {
  if (!nat(t) || (parity !== 0 && parity !== 1) || t < 1) {
    return freeze({ status: 'JOINT_ROUTE_SEAM_SLOT_WEIGHTS_ABSTAIN' });
  }
  const weights = [];
  for (let i = 0; i <= t; i += 1) {
    if (i % 2 !== parity) continue;
    const copies = i === 0 || i === t ? 1 : 2;
    for (let copy = 0; copy < copies; copy += 1) {
      weights.push(Math.floor(i / 2));
    }
  }
  return freeze({
    status: weights.length === t
      ? 'JOINT_ROUTE_SEAM_SLOT_WEIGHTS_DERIVED'
      : 'JOINT_ROUTE_SEAM_SLOT_WEIGHT_COUNT_MISMATCH',
    t,
    parity,
    slot_count: weights.length,
    weights: freeze(weights),
  });
}

function allocationPolynomialForWeights(total, weights) {
  if (!nat(total) || !Array.isArray(weights) || weights.length < 1 || !weights.every(nat)) return null;
  const maxWeight = Math.max(...weights, 0);
  const maxRank = total * maxWeight;
  if (!Number.isSafeInteger(maxRank) || maxRank > 250000 || total > 2500 || weights.length > 2500) return null;

  let states = Array.from({ length: total + 1 }, () =>
    Array.from({ length: maxRank + 1 }, () => 0n));
  states[0][0] = 1n;

  for (const slotWeight of weights) {
    const next = Array.from({ length: total + 1 }, () =>
      Array.from({ length: maxRank + 1 }, () => 0n));
    for (let used = 0; used <= total; used += 1) {
      for (let rank = 0; rank <= maxRank; rank += 1) {
        const base = states[used][rank];
        if (base === 0n) continue;
        for (let n = 0; used + n <= total; n += 1) {
          const rank2 = rank + (slotWeight * n);
          if (rank2 > maxRank) break;
          next[used + n][rank2] += base;
        }
      }
    }
    states = next;
  }

  return states[total];
}

export function seamSplitParityPolynomial(t, parity, total) {
  if (!nat(total)) return freeze({ status: 'JOINT_ROUTE_SEAM_PARITY_POLYNOMIAL_ABSTAIN' });
  const slots = seamSplitSlotWeights(t, parity);
  if (slots.status !== 'JOINT_ROUTE_SEAM_SLOT_WEIGHTS_DERIVED') {
    return freeze({ status: 'JOINT_ROUTE_SEAM_PARITY_POLYNOMIAL_SLOT_ABSTAIN', slots });
  }
  const coefficients = allocationPolynomialForWeights(total, slots.weights);
  if (!coefficients) return freeze({ status: 'JOINT_ROUTE_SEAM_PARITY_POLYNOMIAL_NUMERIC_ABSTAIN', slots });
  const totalCount = coefficients.reduce((sum, value) => sum + value, 0n);
  const expected = chooseBigInt(total + t - 1, total);
  const passed = expected !== null && totalCount === expected;
  return freeze({
    status: passed
      ? 'JOINT_ROUTE_SEAM_PARITY_POLYNOMIAL_DERIVED'
      : 'JOINT_ROUTE_SEAM_PARITY_POLYNOMIAL_SUM_MISMATCH',
    t,
    parity,
    total,
    slot_weights: slots.weights,
    coefficients: serializePolynomial(coefficients),
    value_at_one: totalCount.toString(),
    expected_value_at_one: expected?.toString() ?? null,
  });
}

export function fixedC1JointGeneratingPolynomial(t, E, O) {
  if (![t, E, O].every(nat) || t < 1) {
    return freeze({ status: 'FIXED_C1_JOINT_GENERATING_POLYNOMIAL_ABSTAIN' });
  }
  const even = seamSplitParityPolynomial(t, 0, E);
  const odd = seamSplitParityPolynomial(t, 1, O);
  if (even.status !== 'JOINT_ROUTE_SEAM_PARITY_POLYNOMIAL_DERIVED'
      || odd.status !== 'JOINT_ROUTE_SEAM_PARITY_POLYNOMIAL_DERIVED') {
    return freeze({ status: 'FIXED_C1_JOINT_GENERATING_POLYNOMIAL_COMPONENT_ABSTAIN', even, odd });
  }
  const product = convolveBigInt(
    even.coefficients.map((value) => BigInt(value)),
    odd.coefficients.map((value) => BigInt(value)),
  );
  const total = product.reduce((sum, value) => sum + value, 0n);
  const expectedEven = chooseBigInt(E + t - 1, E);
  const expectedOdd = chooseBigInt(O + t - 1, O);
  if (expectedEven === null || expectedOdd === null) {
    return freeze({ status: 'FIXED_C1_JOINT_GENERATING_POLYNOMIAL_NUMERIC_ABSTAIN' });
  }
  const expected = expectedEven * expectedOdd;
  const passed = total === expected;
  return freeze({
    status: passed
      ? 'FIXED_C1_JOINT_GENERATING_POLYNOMIAL_DERIVED'
      : 'FIXED_C1_JOINT_GENERATING_POLYNOMIAL_SUM_MISMATCH',
    t, E, O,
    even_coefficients: even.coefficients,
    odd_coefficients: odd.coefficients,
    product_coefficients: serializePolynomial(product),
    total_joint_fixed_base_count: total.toString(),
    expected_total_joint_fixed_base_count: expected.toString(),
  });
}

export function routeConditionalSeamCardinality(blocks) {
  if (!Array.isArray(blocks) || blocks.length < 1 || !blocks.every(nat)) {
    return freeze({ status: 'ROUTE_CONDITIONAL_SEAM_CARDINALITY_ABSTAIN' });
  }
  let count = 1n;
  for (let i = 1; i < blocks.length - 1; i += 1) {
    count *= BigInt(blocks[i] + 1);
  }
  return freeze({
    status: 'ROUTE_CONDITIONAL_SEAM_CARDINALITY_DERIVED',
    blocks: freeze([...blocks]),
    seam_count: Math.max(0, blocks.length - 2),
    cardinality: count.toString(),
    minimum_fixed_width_binary_bits: bigintBitsForCardinality(count),
  });
}

export function fixedC1JointCount(t, E, O, P) {
  const state = analyzeFixedC1State(t, E, O, P);
  if (!state.lawful) {
    return freeze({ status: 'FIXED_C1_JOINT_COUNT_ABSTAINS_UNLAWFUL_STATE', state });
  }
  if (t === 0) {
    return freeze({
      status: 'FIXED_C1_JOINT_COUNT_DERIVED',
      state,
      joint_count: '1',
      minimum_alphabet_cardinality: '1',
      minimum_fixed_width_binary_bits: 0,
    });
  }
  const polynomial = fixedC1JointGeneratingPolynomial(t, E, O);
  if (polynomial.status !== 'FIXED_C1_JOINT_GENERATING_POLYNOMIAL_DERIVED') {
    return freeze({ status: 'FIXED_C1_JOINT_COUNT_POLYNOMIAL_ABSTAIN', state, polynomial });
  }
  const count = BigInt(polynomial.product_coefficients[state.R] ?? '0');
  if (count < 1n) {
    return freeze({ status: 'FIXED_C1_JOINT_COUNT_INTERNAL_ZERO', state, polynomial });
  }
  return freeze({
    status: 'FIXED_C1_JOINT_COUNT_DERIVED',
    state,
    polynomial,
    joint_count: count.toString(),
    minimum_alphabet_cardinality: count.toString(),
    minimum_fixed_width_binary_bits: bigintBitsForCardinality(count),
  });
}

function validSeamsForBlocks(blocks, seams) {
  return Array.isArray(blocks)
    && blocks.length >= 1
    && blocks.every(nat)
    && Array.isArray(seams)
    && seams.length === Math.max(0, blocks.length - 2)
    && seams.every((value, index) => nat(value) && value <= blocks[index + 1]);
}

export function seamSplitVectorFromJoint(blocks, seams) {
  if (!validSeamsForBlocks(blocks, seams)) {
    return freeze({ status: 'SEAM_SPLIT_VECTOR_FROM_JOINT_ABSTAIN' });
  }
  if (blocks.length === 1) {
    return freeze({
      status: 'SEAM_SPLIT_VECTOR_DERIVED',
      blocks: freeze([...blocks]),
      seams: freeze([]),
      split_vector: freeze([blocks[0]]),
    });
  }
  const split = [blocks[0]];
  for (let i = 1; i < blocks.length - 1; i += 1) {
    const left = seams[i - 1];
    split.push(left, blocks[i] - left);
  }
  split.push(blocks.at(-1));
  return freeze({
    status: 'SEAM_SPLIT_VECTOR_DERIVED',
    blocks: freeze([...blocks]),
    seams: freeze([...seams]),
    split_vector: freeze(split),
  });
}

export function jointFromSeamSplitVector(t, splitVector) {
  if (!nat(t) || !Array.isArray(splitVector) || !splitVector.every(nat)) {
    return freeze({ status: 'JOINT_FROM_SEAM_SPLIT_VECTOR_ABSTAIN' });
  }
  if (t === 0) {
    if (splitVector.length !== 1) return freeze({ status: 'JOINT_FROM_SEAM_SPLIT_VECTOR_LENGTH_ABSTAIN' });
    return freeze({ status: 'JOINT_FROM_SEAM_SPLIT_VECTOR_DERIVED', blocks: freeze([splitVector[0]]), seams: freeze([]) });
  }
  if (splitVector.length !== 2 * t) {
    return freeze({ status: 'JOINT_FROM_SEAM_SPLIT_VECTOR_LENGTH_ABSTAIN' });
  }
  const blocks = [splitVector[0]];
  const seams = [];
  let cursor = 1;
  for (let i = 1; i < t; i += 1) {
    const left = splitVector[cursor];
    const right = splitVector[cursor + 1];
    seams.push(left);
    blocks.push(left + right);
    cursor += 2;
  }
  blocks.push(splitVector[cursor]);
  return freeze({
    status: 'JOINT_FROM_SEAM_SPLIT_VECTOR_DERIVED',
    blocks: freeze(blocks),
    seams: freeze(seams),
  });
}

function seamRankBigInt(blocks, seams) {
  if (!validSeamsForBlocks(blocks, seams)) return null;
  let rank = 0n;
  let multiplier = 1n;
  for (let i = 0; i < seams.length; i += 1) {
    rank += BigInt(seams[i]) * multiplier;
    multiplier *= BigInt(blocks[i + 1] + 1);
  }
  return freeze({ rank, cardinality: multiplier });
}

function seamVectorFromRankBigInt(blocks, rank) {
  const parsed = parseRank(rank);
  if (!Array.isArray(blocks) || blocks.length < 1 || !blocks.every(nat) || parsed === null) return null;
  const cardinality = BigInt(routeConditionalSeamCardinality(blocks).cardinality);
  if (parsed >= cardinality) return null;
  let residual = parsed;
  const seams = [];
  for (let i = 1; i < blocks.length - 1; i += 1) {
    const radix = BigInt(blocks[i] + 1);
    seams.push(Number(residual % radix));
    residual /= radix;
  }
  return freeze(seams);
}

export function enumerateFixedC1JointFiber(t, E, O, P) {
  const predicted = fixedC1JointCount(t, E, O, P);
  if (predicted.status !== 'FIXED_C1_JOINT_COUNT_DERIVED') {
    return freeze({ status: 'FIXED_C1_JOINT_FIBER_ENUMERATION_ABSTAINS', predicted });
  }
  if (t === 0) {
    const routeFiber = enumerateFixedC1RouteFiber(t, E, O, P);
    if (routeFiber.status !== 'FIXED_C1_ROUTE_FIBER_ENUMERATED' || routeFiber.rows.length !== 1) {
      return freeze({ status: 'FIXED_C1_JOINT_FIBER_T0_ROUTE_ABSTAIN', predicted, routeFiber });
    }
    const row = freeze({
      route_rank: 0,
      blocks: routeFiber.rows[0].blocks,
      word: routeFiber.rows[0].derived.route.word,
      seams: freeze([]),
      local_seam_rank: '0',
      joint_rank: '0',
    });
    return freeze({
      status: 'FIXED_C1_JOINT_FIBER_ENUMERATED',
      t, E, O, P,
      predicted_joint_count: '1',
      rows: freeze([row]),
    });
  }

  const routeFiber = enumerateFixedC1RouteFiber(t, E, O, P);
  if (routeFiber.status !== 'FIXED_C1_ROUTE_FIBER_ENUMERATED') {
    return freeze({ status: 'FIXED_C1_JOINT_FIBER_ROUTE_ABSTAIN', predicted, routeFiber });
  }

  const rows = [];
  let offset = 0n;
  for (const routeRow of routeFiber.rows) {
    const seamFiber = predictedSeamHyperrectangle(routeRow.blocks);
    if (seamFiber.status !== 'EXACT_ALL_FINITE_LINEAR_SEAM_HYPERRECTANGLE_DERIVED') {
      return freeze({ status: 'FIXED_C1_JOINT_FIBER_SEAM_ABSTAIN', predicted, route: routeRow, seamFiber });
    }
    for (const seamRow of seamFiber.rows) {
      const local = seamRankBigInt(routeRow.blocks, seamRow.seams);
      if (!local) return freeze({ status: 'FIXED_C1_JOINT_FIBER_LOCAL_RANK_ABSTAIN' });
      rows.push(freeze({
        route_rank: routeRow.route_rank,
        blocks: routeRow.blocks,
        word: routeRow.derived.route.word,
        seams: seamRow.seams,
        local_seam_rank: local.rank.toString(),
        joint_rank: (offset + local.rank).toString(),
      }));
    }
    offset += BigInt(routeConditionalSeamCardinality(routeRow.blocks).cardinality);
  }

  const predictedCount = BigInt(predicted.joint_count);
  const ranks = rows.map((row) => row.joint_rank);
  const passed = BigInt(rows.length) === predictedCount
    && offset === predictedCount
    && new Set(rows.map((row) => key([row.blocks, row.seams]))).size === rows.length
    && new Set(ranks).size === rows.length;
  return freeze({
    status: passed
      ? 'FIXED_C1_JOINT_FIBER_ENUMERATED'
      : 'FIXED_C1_JOINT_FIBER_ENUMERATION_COUNT_MISMATCH',
    t, E, O, P,
    predicted_joint_count: predicted.joint_count,
    rows: freeze(rows),
  });
}

export function encodeFixedC1JointRank(t, E, O, P, blocks, seams) {
  if (!validSeamsForBlocks(blocks, seams)) return freeze({ status: 'FIXED_C1_JOINT_RANK_ENCODER_ABSTAIN' });
  const routeFiber = enumerateFixedC1RouteFiber(t, E, O, P);
  if (routeFiber.status !== 'FIXED_C1_ROUTE_FIBER_ENUMERATED') {
    return freeze({ status: 'FIXED_C1_JOINT_RANK_ENCODER_ROUTE_ABSTAIN' });
  }
  const routeIndex = routeFiber.rows.findIndex((row) => key(row.blocks) === key(blocks));
  if (routeIndex < 0) return freeze({ status: 'FIXED_C1_JOINT_RANK_ENCODER_UNLAWFUL_ROUTE' });
  let offset = 0n;
  for (let i = 0; i < routeIndex; i += 1) {
    offset += BigInt(routeConditionalSeamCardinality(routeFiber.rows[i].blocks).cardinality);
  }
  const local = seamRankBigInt(blocks, seams);
  if (!local) return freeze({ status: 'FIXED_C1_JOINT_RANK_ENCODER_SEAM_ABSTAIN' });
  const joint = fixedC1JointCount(t, E, O, P);
  if (joint.status !== 'FIXED_C1_JOINT_COUNT_DERIVED') return freeze({ status: 'FIXED_C1_JOINT_RANK_ENCODER_COUNT_ABSTAIN' });
  return freeze({
    status: 'FIXED_C1_JOINT_RANK_ENCODED',
    route_rank: routeIndex,
    blocks: freeze([...blocks]),
    seams: freeze([...seams]),
    local_seam_rank: local.rank.toString(),
    route_prefix_offset: offset.toString(),
    joint_rank: (offset + local.rank).toString(),
    joint_cardinality: joint.joint_count,
  });
}

export function decodeFixedC1JointRank(t, E, O, P, rank) {
  const parsed = parseRank(rank);
  const joint = fixedC1JointCount(t, E, O, P);
  if (parsed === null || joint.status !== 'FIXED_C1_JOINT_COUNT_DERIVED') {
    return freeze({ status: 'FIXED_C1_JOINT_RANK_DECODER_ABSTAIN' });
  }
  if (parsed >= BigInt(joint.joint_count)) {
    return freeze({ status: 'FIXED_C1_JOINT_RANK_DECODER_LABEL_OUTSIDE_LAWFUL_ALPHABET' });
  }
  const routeFiber = enumerateFixedC1RouteFiber(t, E, O, P);
  if (routeFiber.status !== 'FIXED_C1_ROUTE_FIBER_ENUMERATED') {
    return freeze({ status: 'FIXED_C1_JOINT_RANK_DECODER_ROUTE_ABSTAIN' });
  }
  let offset = 0n;
  for (const routeRow of routeFiber.rows) {
    const size = BigInt(routeConditionalSeamCardinality(routeRow.blocks).cardinality);
    if (parsed < offset + size) {
      const local = parsed - offset;
      const seams = seamVectorFromRankBigInt(routeRow.blocks, local);
      if (!seams) return freeze({ status: 'FIXED_C1_JOINT_RANK_DECODER_SEAM_ABSTAIN' });
      return freeze({
        status: 'FIXED_C1_JOINT_RANK_DECODED',
        joint_rank: parsed.toString(),
        route_rank: routeRow.route_rank,
        blocks: routeRow.blocks,
        word: routeRow.derived.route.word,
        seams,
        local_seam_rank: local.toString(),
        route_prefix_offset: offset.toString(),
        joint_cardinality: joint.joint_count,
      });
    }
    offset += size;
  }
  return freeze({ status: 'FIXED_C1_JOINT_RANK_DECODER_INTERNAL_MISMATCH' });
}

export function auditFixedC1JointCustody(t, E, O, P, labelRows, declaredAlphabetSize) {
  const fiber = enumerateFixedC1JointFiber(t, E, O, P);
  if (fiber.status !== 'FIXED_C1_JOINT_FIBER_ENUMERATED'
      || !Array.isArray(labelRows)
      || !nat(declaredAlphabetSize) || declaredAlphabetSize < 1) {
    return freeze({ status: 'FIXED_C1_JOINT_CUSTODY_AUDIT_ABSTAIN' });
  }
  const lawful = new Set(fiber.rows.map((row) => key([row.blocks, row.seams])));
  const stateToLabel = new Map();
  const labelToState = new Map();
  const collisions = [];
  const unlawful = [];
  const duplicates = [];

  for (const row of labelRows) {
    const stateKey = key([row?.blocks, row?.seams]);
    if (!lawful.has(stateKey) || !Object.prototype.hasOwnProperty.call(row ?? {}, 'label')) {
      unlawful.push(freeze({ blocks: row?.blocks ?? null, seams: row?.seams ?? null }));
      continue;
    }
    if (stateToLabel.has(stateKey)) duplicates.push(freeze({ blocks: row.blocks, seams: row.seams }));
    stateToLabel.set(stateKey, row.label);
    const labelKey = key(row.label);
    if (labelToState.has(labelKey) && labelToState.get(labelKey) !== stateKey) {
      collisions.push(freeze({ label: row.label, left: JSON.parse(labelToState.get(labelKey)), right: JSON.parse(stateKey) }));
    } else {
      labelToState.set(labelKey, stateKey);
    }
  }

  const missing = fiber.rows
    .filter((row) => !stateToLabel.has(key([row.blocks, row.seams])))
    .map((row) => freeze({ blocks: row.blocks, seams: row.seams }));
  const required = fiber.rows.length;
  const undersized = declaredAlphabetSize < required;
  const alphabetOverrun = labelToState.size > declaredAlphabetSize;
  const exact = !undersized && !alphabetOverrun && collisions.length === 0
    && unlawful.length === 0 && duplicates.length === 0 && missing.length === 0
    && stateToLabel.size === required;
  return freeze({
    status: 'FIXED_C1_JOINT_CUSTODY_SCHEME_AUDITED',
    required_alphabet_size: required,
    declared_alphabet_size: declaredAlphabetSize,
    undersized,
    alphabet_overrun: alphabetOverrun,
    collisions: freeze(collisions),
    unlawful_states: freeze(unlawful),
    duplicate_states: freeze(duplicates),
    missing_states: freeze(missing),
    exact,
    classification: exact
      ? 'EXACT_FIXED_C1_JOINT_ROUTE_SEAM_CUSTODY_WITNESSED'
      : undersized
        ? 'EXACT_FIXED_C1_JOINT_ROUTE_SEAM_RECOVERY_FORBIDDEN_BY_FINITE_CUSTODY_LOWER_BOUND'
        : 'FIXED_C1_JOINT_ROUTE_SEAM_CUSTODY_CAPACITY_OR_MAPPING_INSUFFICIENT',
  });
}

function symbolicSeamSplitCertificate() {
  return freeze({
    passed: true,
    forward: 'Each internal block q_i with seam k_i maps to nonnegative pair (k_i,q_i-k_i); endpoints remain single coordinates.',
    inverse: 'Each split pair (left_i,right_i) recovers q_i=left_i+right_i and k_i=left_i, so route and seam are recovered uniquely.',
    parity: 'Splitting preserves block parity, hence E and O totals.',
    rank: 'Both pieces inherit floor(i/2), so R=sum_i floor(i/2)q_i is preserved exactly.',
    slot_count: 'For every t>=1 each parity has exactly t seam-split slots: endpoints once, internal indices twice.',
    authority: 'ALL_FINITE_LAWFUL_t_BY_EXACT_SEAM_SPLIT_BIJECTION_NOT_HORIZON_ENUMERATION',
  });
}

function inheritedFiveStateHostile() {
  const polynomial = fixedC1JointGeneratingPolynomial(3, 1, 1);
  const fiber = enumerateFixedC1JointFiber(3, 1, 1, 3);
  const grouped = new Map();
  if (fiber.status === 'FIXED_C1_JOINT_FIBER_ENUMERATED') {
    for (const row of fiber.rows) {
      const k = key(row.blocks);
      grouped.set(k, (grouped.get(k) ?? 0) + 1);
    }
  }
  return freeze({
    passed: polynomial.status === 'FIXED_C1_JOINT_GENERATING_POLYNOMIAL_DERIVED'
      && key(polynomial.product_coefficients) === key(['2', '5', '2'])
      && fiber.status === 'FIXED_C1_JOINT_FIBER_ENUMERATED'
      && fiber.predicted_joint_count === '5'
      && grouped.get(key([0, 1, 1, 0])) === 4
      && grouped.get(key([1, 0, 0, 1])) === 1,
    polynomial,
    fiber,
    route_conditioned_counts: freeze(Object.fromEntries(grouped)),
  });
}

function seamSplitRoundTripHostile() {
  const fiber = enumerateFixedC1JointFiber(3, 1, 1, 3);
  const rows = fiber.rows.map((row) => {
    const split = seamSplitVectorFromJoint(row.blocks, row.seams);
    const restored = split.status === 'SEAM_SPLIT_VECTOR_DERIVED'
      ? jointFromSeamSplitVector(3, split.split_vector)
      : freeze({ status: 'SEAM_SPLIT_ROUND_TRIP_FORWARD_FAILED' });
    return freeze({
      blocks: row.blocks,
      seams: row.seams,
      split,
      restored,
      passed: restored.status === 'JOINT_FROM_SEAM_SPLIT_VECTOR_DERIVED'
        && key(restored.blocks) === key(row.blocks)
        && key(restored.seams) === key(row.seams),
    });
  });
  return freeze({ passed: rows.length === 5 && rows.every((row) => row.passed), rows: freeze(rows) });
}

function seamLabelCollisionHostile() {
  const fiber = enumerateFixedC1JointFiber(3, 1, 1, 3);
  const zero = fiber.rows.filter((row) => key(row.seams) === key([0, 0]));
  return freeze({
    passed: zero.length === 2 && new Set(zero.map((row) => key(row.blocks))).size === 2,
    classification: zero.length === 2
      ? 'SAME_LOCAL_SEAM_VECTOR_FORBIDDEN_FROM_IMPERSONATING_EXACT_ROUTE_IDENTITY'
      : 'UNCLASSIFIED',
    rows: freeze(zero),
  });
}

function routeAloneHostile() {
  const seam = routeConditionalSeamCardinality([0, 1, 1, 0]);
  return freeze({
    passed: seam.status === 'ROUTE_CONDITIONAL_SEAM_CARDINALITY_DERIVED' && seam.cardinality === '4',
    classification: seam.cardinality === '4'
      ? 'EXACT_ROUTE_WITH_NON_SINGLETON_SEAM_FIBER_FORBIDDEN_FROM_IMPERSONATING_EXACT_JOINT_STATE'
      : 'UNCLASSIFIED',
    seam,
  });
}

function edgeAndT2Hostiles() {
  const t0 = fixedC1JointCount(0, 7, 0, 0);
  const t0Fiber = enumerateFixedC1JointFiber(0, 7, 0, 0);
  const t1 = fixedC1JointCount(1, 4, 3, 3);
  const t1Fiber = enumerateFixedC1JointFiber(1, 4, 3, 3);
  const t2Rows = [];
  for (let E = 0; E <= 3; E += 1) {
    for (let O = 0; O <= 3; O += 1) {
      for (let R = 0; R <= E; R += 1) {
        const P = O + (2 * R);
        const count = fixedC1JointCount(2, E, O, P);
        t2Rows.push(freeze({ E, O, P, count, passed: count.joint_count === String(O + 1) }));
      }
    }
  }
  return freeze({
    passed: t0.joint_count === '1'
      && t0Fiber.status === 'FIXED_C1_JOINT_FIBER_ENUMERATED' && t0Fiber.rows.length === 1
      && t1.joint_count === '1'
      && t1Fiber.status === 'FIXED_C1_JOINT_FIBER_ENUMERATED' && t1Fiber.rows.length === 1
      && t2Rows.every((row) => row.passed),
    t0, t0Fiber, t1, t1Fiber, t2_rows: freeze(t2Rows),
  });
}

function fixedBaseSumRuleHostile() {
  const rows = [];
  for (let t = 1; t <= 5; t += 1) {
    for (let E = 0; E <= 3; E += 1) {
      for (let O = 0; O <= 3; O += 1) {
        const poly = fixedC1JointGeneratingPolynomial(t, E, O);
        const expectedEven = chooseBigInt(E + t - 1, E);
        const expectedOdd = chooseBigInt(O + t - 1, O);
        const expected = expectedEven * expectedOdd;
        rows.push(freeze({
          t, E, O,
          observed: poly.total_joint_fixed_base_count,
          expected: expected.toString(),
          passed: poly.status === 'FIXED_C1_JOINT_GENERATING_POLYNOMIAL_DERIVED'
            && poly.total_joint_fixed_base_count === expected.toString(),
        }));
      }
    }
  }
  return freeze({ passed: rows.every((row) => row.passed), rows: freeze(rows) });
}

function finiteCorroborationHostile() {
  const rows = [];
  for (let t = 0; t <= 4; t += 1) {
    for (let E = 0; E <= 2; E += 1) {
      for (let O = 0; O <= 2; O += 1) {
        const base = enumerateFixedBaseRoutes(t, E, O);
        if (base.status !== 'FIXED_BASE_ROUTE_ENUMERATION_DERIVED') {
          if (t === 0 && O > 0) continue;
          rows.push(freeze({ t, E, O, passed: false, reason: base.status }));
          continue;
        }
        const observedByP = new Map();
        for (const routeRow of base.rows) {
          const P = routeRow.derived.c1.P;
          const seam = routeConditionalSeamCardinality(routeRow.blocks);
          observedByP.set(P, (observedByP.get(P) ?? 0n) + BigInt(seam.cardinality));
        }
        let passed = true;
        for (const [P, observed] of observedByP.entries()) {
          const predicted = fixedC1JointCount(t, E, O, P);
          if (predicted.status !== 'FIXED_C1_JOINT_COUNT_DERIVED'
              || BigInt(predicted.joint_count) !== observed) {
            passed = false;
            break;
          }
        }
        rows.push(freeze({ t, E, O, strata: observedByP.size, passed }));
      }
    }
  }
  return freeze({ passed: rows.every((row) => row.passed), rows: freeze(rows), authority: 'FINITE_CORROBORATION_ONLY' });
}

function jointRankHostile() {
  const cases = [
    [0, 5, 0, 0],
    [1, 2, 1, 1],
    [2, 2, 1, 3],
    [3, 1, 1, 3],
    [4, 1, 1, 3],
  ];
  const rows = [];
  for (const [t, E, O, P] of cases) {
    const fiber = enumerateFixedC1JointFiber(t, E, O, P);
    if (fiber.status !== 'FIXED_C1_JOINT_FIBER_ENUMERATED') {
      rows.push(freeze({ t, E, O, P, passed: false, reason: fiber.status }));
      continue;
    }
    for (const row of fiber.rows) {
      const encoded = encodeFixedC1JointRank(t, E, O, P, row.blocks, row.seams);
      const decoded = encoded.status === 'FIXED_C1_JOINT_RANK_ENCODED'
        ? decodeFixedC1JointRank(t, E, O, P, encoded.joint_rank)
        : freeze({ status: 'JOINT_RANK_HOSTILE_ENCODING_FAILED' });
      rows.push(freeze({
        t, E, O, P,
        blocks: row.blocks,
        seams: row.seams,
        encoded,
        decoded,
        passed: decoded.status === 'FIXED_C1_JOINT_RANK_DECODED'
          && key(decoded.blocks) === key(row.blocks)
          && key(decoded.seams) === key(row.seams),
      }));
    }
  }
  return freeze({ passed: rows.length > 0 && rows.every((row) => row.passed), rows: freeze(rows) });
}

function custodyHostiles() {
  const fiber = enumerateFixedC1JointFiber(3, 1, 1, 3);
  const exactRows = fiber.rows.map((row) => freeze({ blocks: row.blocks, seams: row.seams, label: row.joint_rank }));
  const exact = auditFixedC1JointCustody(3, 1, 1, 3, exactRows, 5);
  const collidingRows = fiber.rows.map((row, index) => freeze({ blocks: row.blocks, seams: row.seams, label: index === 4 ? '3' : String(index) }));
  const collision = auditFixedC1JointCustody(3, 1, 1, 3, collidingRows, 5);
  const undersizedRows = fiber.rows.map((row, index) => freeze({ blocks: row.blocks, seams: row.seams, label: String(index % 4) }));
  const undersized = auditFixedC1JointCustody(3, 1, 1, 3, undersizedRows, 4);
  return freeze({
    passed: exact.exact
      && !collision.undersized && collision.collisions.length === 1 && !collision.exact
      && undersized.undersized && !undersized.exact,
    exact, collision, undersized,
  });
}

export function runFixedC1JointRouteSeamFiberChamber() {
  const certificates = freeze({
    symbolic_seam_split_bijection: symbolicSeamSplitCertificate(),
    inherited_five_state_hostile: inheritedFiveStateHostile(),
    seam_split_round_trip_hostile: seamSplitRoundTripHostile(),
    same_seam_label_cross_route_hostile: seamLabelCollisionHostile(),
    route_alone_not_joint_hostile: routeAloneHostile(),
    edge_and_t2_reduction_hostiles: edgeAndT2Hostiles(),
    fixed_base_sum_rule_hostile: fixedBaseSumRuleHostile(),
    finite_weighted_corroboration: finiteCorroborationHostile(),
    joint_rank_round_trip_hostile: jointRankHostile(),
    joint_custody_hostiles: custodyHostiles(),
  });
  const passed = Object.values(certificates).every((certificate) => certificate.passed);
  return freeze({
    schema: FIXED_C1_JOINT_ROUTE_SEAM_SCHEMA,
    parent_receipt: FIXED_C1_JOINT_ROUTE_SEAM_PARENT_RECEIPT,
    gate_issue: FIXED_C1_JOINT_ROUTE_SEAM_GATE_ISSUE,
    status: passed
      ? 'FIXED_C1_JOINT_ROUTE_SEAM_FIBER_CHAMBER_PASSED'
      : 'FIXED_C1_JOINT_ROUTE_SEAM_FIBER_CHAMBER_FAILED',
    passed,
    certificates,
    canonical_candidate: passed
      ? 'THE_FIXED_C1_JOINT_AUTHORED_ROUTE_X_LINEAR_SEAM_FIBER_IS_BIJECTIVE_TO_FINITE_SEAM_SPLIT_BLOCK_ALLOCATIONS_AND_IS_COUNTED_BY_THE_q^R_COEFFICIENT_OF_THE_DUPLICATED_INTERNAL_SLOT_POLYNOMIAL'
      : 'UNCLASSIFIED',
    consequential_candidate: passed
      ? 'ROUTES_SHARING_ONE_EXACT_C1_STATE_CAN_CARRY_DIFFERENT_EXACT_SEAM_FIBER_CARDINALITIES_SO_ROUTE_AND_SEAM_CUSTODY_ARE_SEPARATE_BUT_COUPLED_FINITE_RESOURCES'
      : 'UNCLASSIFIED',
    architectural_candidate: passed
      ? 'EXACT_JOINT_ROUTE_SEAM_RECOVERY_REQUIRES_CUSTODY_OVER_THE_COUPLED_JOINT_FIBER_OR_EQUIVALENT_ROUTE_PLUS_ROUTE_CONDITIONAL_SEAM_EVIDENCE'
      : 'UNCLASSIFIED',
    landing: freeze({
      exact_c1_not_exact_joint_route_seam: true,
      exact_route_not_exact_seam_when_conditional_fiber_non_singleton: true,
      local_seam_label_not_route_identity: true,
      route_and_seam_custody_are_coupled_not_interchangeable: true,
      joint_rank_is_decoder_label_not_historical_priority: true,
      missing_claim_specific_evidence_requires_visible_ambiguity_or_abstention: true,
    }),
  });
}

export default runFixedC1JointRouteSeamFiberChamber;