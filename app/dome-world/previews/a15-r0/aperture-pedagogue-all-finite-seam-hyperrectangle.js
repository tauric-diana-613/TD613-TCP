import {
  firstMomentCoordinate,
} from './aperture-pedagogue-first-moment-weaker-transport-quotient.js';
import {
  quotientCoordinate,
} from './aperture-pedagogue-target-equivalence-quotient-congruence.js';
import {
  predictedTwoSeamRectangle,
} from './aperture-pedagogue-two-seam-factorization-rectangle.js';

export const ALL_FINITE_SEAM_HYPERRECTANGLE_SCHEMA = 'td613.a15-r0.aperture-pedagogue-all-finite-seam-hyperrectangle/v0.1';
export const ALL_FINITE_SEAM_HYPERRECTANGLE_PARENT_RECEIPT = '3babfbea1952c54619a19571a112b472e9d80d89';
export const ALL_FINITE_SEAM_HYPERRECTANGLE_GATE_ISSUE = 737;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const keyOf = (value) => JSON.stringify(value);
const Q = (n) => Array.from({ length: n }, () => 'Q');
const validNat = (value) => Number.isSafeInteger(value) && value >= 0;

function validQRuns(qRuns) {
  return Array.isArray(qRuns)
    && qRuns.length >= 2
    && qRuns.every(validNat);
}

function countT(word) {
  return Array.isArray(word) ? word.filter((generator) => generator === 'T').length : -1;
}

function sameWord(left, right) {
  return keyOf(left) === keyOf(right);
}

function safeProduct(values) {
  let product = 1;
  for (const value of values) {
    product *= value;
    if (!Number.isSafeInteger(product)) return null;
  }
  return product;
}

function minimumBitsForCardinality(cardinality) {
  if (!Number.isSafeInteger(cardinality) || cardinality < 1) return null;
  return cardinality === 1 ? 0 : Math.ceil(Math.log2(cardinality));
}

export function exactFiniteTWord(qRuns) {
  if (!validQRuns(qRuns)) return freeze({ status: 'ALL_FINITE_SEAM_Q_RUNS_ABSTAIN' });
  const r = qRuns.length - 1;
  const word = [];
  for (let i = 0; i < qRuns.length; i += 1) {
    word.push(...Q(qRuns[i]));
    if (i < r) word.push('T');
  }
  return freeze({
    status: 'ALL_FINITE_EXACT_TQ_WORD_DERIVED',
    q_runs: freeze([...qRuns]),
    factor_count: r,
    seam_count: r - 1,
    word: freeze(word),
  });
}

function validSeamVector(qRuns, seams) {
  if (!validQRuns(qRuns) || !Array.isArray(seams) || seams.length !== qRuns.length - 2) return false;
  return seams.every((value, index) => validNat(value) && value <= qRuns[index + 1]);
}

export function predictedLinearSegmentation(qRuns, seams) {
  const target = exactFiniteTWord(qRuns);
  if (target.status !== 'ALL_FINITE_EXACT_TQ_WORD_DERIVED' || !validSeamVector(qRuns, seams)) {
    return freeze({ status: 'ALL_FINITE_PREDICTED_SEGMENTATION_ABSTAINS' });
  }

  const r = target.factor_count;
  const factors = [];
  if (r === 1) {
    factors.push(target.word);
  } else {
    factors.push(freeze([...Q(qRuns[0]), 'T', ...Q(seams[0])]));
    for (let j = 1; j < r - 1; j += 1) {
      factors.push(freeze([
        ...Q(qRuns[j] - seams[j - 1]),
        'T',
        ...Q(seams[j]),
      ]));
    }
    factors.push(freeze([
      ...Q(qRuns[r - 1] - seams[r - 2]),
      'T',
      ...Q(qRuns[r]),
    ]));
  }

  const concatenated = freeze(factors.flat());
  const everyOneT = factors.every((factor) => countT(factor) === 1);
  const same = sameWord(concatenated, target.word);
  const quotient = quotientCoordinate(concatenated);
  const firstMoment = firstMomentCoordinate(concatenated);
  const expectedE = qRuns.reduce((sum, value, index) => sum + (index % 2 === 0 ? value : 0), 0);
  const expectedO = qRuns.reduce((sum, value, index) => sum + (index % 2 === 1 ? value : 0), 0);
  const expectedP = qRuns.reduce((sum, value, index) => sum + index * value, 0);
  const passed = everyOneT
    && same
    && quotient?.status === 'TARGET_EQUIVALENCE_QUOTIENT_COORDINATE_DERIVED'
    && quotient.t === r
    && quotient.E === expectedE
    && quotient.O === expectedO
    && firstMoment?.status === 'FIRST_MOMENT_WEAKER_TRANSPORT_COORDINATE_DERIVED'
    && firstMoment.P === expectedP;

  return freeze({
    status: passed
      ? 'ALL_FINITE_PREDICTED_ONE_T_PER_FACTOR_SEGMENTATION_DERIVED'
      : 'ALL_FINITE_PREDICTED_SEGMENTATION_INTERNAL_MISMATCH',
    q_runs: target.q_runs,
    factor_count: r,
    seams: freeze([...seams]),
    factors: freeze(factors),
    concatenated,
    quotient,
    first_moment_coordinate: firstMoment,
    expected: freeze({ t: r, E: expectedE, O: expectedO, P: expectedP }),
  });
}

export function seamHyperrectangleCardinality(qRuns) {
  if (!validQRuns(qRuns)) return null;
  const internal = qRuns.slice(1, -1).map((value) => value + 1);
  return safeProduct(internal);
}

function enumerateVectors(radices) {
  const rows = [];
  const current = Array.from({ length: radices.length }, () => 0);
  const visit = (index) => {
    if (index === radices.length) {
      rows.push(freeze([...current]));
      return;
    }
    for (let value = 0; value < radices[index]; value += 1) {
      current[index] = value;
      visit(index + 1);
    }
  };
  visit(0);
  return rows;
}

export function predictedSeamHyperrectangle(qRuns) {
  if (!validQRuns(qRuns)) return freeze({ status: 'ALL_FINITE_HYPERRECTANGLE_Q_RUNS_ABSTAIN' });
  const radices = qRuns.slice(1, -1).map((value) => value + 1);
  const cardinality = seamHyperrectangleCardinality(qRuns);
  if (cardinality === null || cardinality > 200000) {
    return freeze({ status: 'ALL_FINITE_HYPERRECTANGLE_OUTSIDE_SAFE_ENUMERATION_DOMAIN' });
  }
  const vectors = enumerateVectors(radices);
  const rows = vectors.map((seams) => predictedLinearSegmentation(qRuns, seams));
  const uniqueSeams = new Set(rows.map((row) => keyOf(row.seams))).size === rows.length;
  const passed = rows.length === cardinality
    && uniqueSeams
    && rows.every((row) => row.status === 'ALL_FINITE_PREDICTED_ONE_T_PER_FACTOR_SEGMENTATION_DERIVED');
  return freeze({
    status: passed
      ? 'EXACT_ALL_FINITE_LINEAR_SEAM_HYPERRECTANGLE_DERIVED'
      : 'ALL_FINITE_LINEAR_SEAM_HYPERRECTANGLE_INTERNAL_MISMATCH',
    q_runs: freeze([...qRuns]),
    factor_count: qRuns.length - 1,
    seam_count: qRuns.length - 2,
    radices: freeze(radices),
    cardinality,
    rows: freeze(rows),
  });
}

function allCutTuples(wordLength, cutCount) {
  const tuples = [];
  const current = [];
  const visit = (nextMinimum) => {
    if (current.length === cutCount) {
      tuples.push(freeze([...current]));
      return;
    }
    const remaining = cutCount - current.length;
    const max = wordLength - remaining;
    for (let cut = nextMinimum; cut <= max; cut += 1) {
      current.push(cut);
      visit(cut + 1);
      current.pop();
    }
  };
  if (cutCount === 0) return [freeze([])];
  visit(1);
  return tuples;
}

function factorsFromCuts(word, cuts) {
  const boundaries = [0, ...cuts, word.length];
  return freeze(boundaries.slice(0, -1).map((start, index) => freeze(word.slice(start, boundaries[index + 1]))));
}

function seamsFromLiteralFactors(qRuns, factors) {
  const r = qRuns.length - 1;
  if (factors.length !== r || !factors.every((factor) => countT(factor) === 1)) return null;
  if (r === 1) return freeze([]);
  const seams = [];
  let consumed = 0;
  const target = exactFiniteTWord(qRuns);
  if (target.status !== 'ALL_FINITE_EXACT_TQ_WORD_DERIVED') return null;

  for (let j = 0; j < r - 1; j += 1) {
    consumed += factors[j].length;
    const tPosition = qRuns.slice(0, j + 1).reduce((sum, value) => sum + value, 0) + (j + 1);
    const seam = consumed - tPosition;
    if (!validNat(seam) || seam > qRuns[j + 1]) return null;
    seams.push(seam);
  }
  const predicted = predictedLinearSegmentation(qRuns, seams);
  if (predicted.status !== 'ALL_FINITE_PREDICTED_ONE_T_PER_FACTOR_SEGMENTATION_DERIVED') return null;
  if (keyOf(predicted.factors) !== keyOf(factors)) return null;
  return freeze(seams);
}

export function enumerateLiteralOneTPerFactorSplits(qRuns) {
  const target = exactFiniteTWord(qRuns);
  if (target.status !== 'ALL_FINITE_EXACT_TQ_WORD_DERIVED') return freeze({ status: target.status });
  if (target.word.length > 60 || target.factor_count > 8) {
    return freeze({ status: 'ALL_FINITE_LITERAL_SPLIT_OUTSIDE_SAFE_ENUMERATION_DOMAIN' });
  }
  const cuts = allCutTuples(target.word.length, target.factor_count - 1);
  const rows = [];
  for (const cutTuple of cuts) {
    const factors = factorsFromCuts(target.word, cutTuple);
    if (!factors.every((factor) => countT(factor) === 1)) continue;
    const seams = seamsFromLiteralFactors(qRuns, factors);
    rows.push(freeze({
      cuts: cutTuple,
      factors,
      seams,
      passed: seams !== null,
    }));
  }
  return freeze({
    status: rows.every((row) => row.passed)
      ? 'ALL_FINITE_LITERAL_ONE_T_PER_FACTOR_SPLITS_ENUMERATED'
      : 'ALL_FINITE_LITERAL_ONE_T_PER_FACTOR_SPLIT_MAPPING_FAILED',
    q_runs: target.q_runs,
    factor_count: target.factor_count,
    word: target.word,
    cardinality: rows.length,
    rows: freeze(rows),
  });
}

export function hyperrectangleCompletenessCertificate(qRuns) {
  const predicted = predictedSeamHyperrectangle(qRuns);
  const literal = enumerateLiteralOneTPerFactorSplits(qRuns);
  if (predicted.status !== 'EXACT_ALL_FINITE_LINEAR_SEAM_HYPERRECTANGLE_DERIVED'
      || literal.status !== 'ALL_FINITE_LITERAL_ONE_T_PER_FACTOR_SPLITS_ENUMERATED') {
    return freeze({ status: 'ALL_FINITE_HYPERRECTANGLE_COMPLETENESS_ABSTAINS', predicted, literal });
  }
  const predictedKeys = predicted.rows.map((row) => keyOf(row.seams)).sort();
  const literalKeys = literal.rows.map((row) => keyOf(row.seams)).sort();
  const equal = keyOf(predictedKeys) === keyOf(literalKeys);
  return freeze({
    status: equal
      ? 'EXACT_ALL_FINITE_HYPERRECTANGLE_COMPLETENESS_WITNESSED'
      : 'ALL_FINITE_HYPERRECTANGLE_COMPLETENESS_FAILED',
    q_runs: predicted.q_runs,
    predicted_cardinality: predicted.cardinality,
    literal_cardinality: literal.cardinality,
    equal,
  });
}

export function encodeSeamVectorMixedRadix(qRuns, seams) {
  if (!validSeamVector(qRuns, seams)) return freeze({ status: 'MIXED_RADIX_SEAM_ENCODER_ABSTAINS' });
  const radices = qRuns.slice(1, -1).map((value) => value + 1);
  let rank = 0;
  let multiplier = 1;
  for (let index = 0; index < seams.length; index += 1) {
    rank += seams[index] * multiplier;
    multiplier *= radices[index];
    if (!Number.isSafeInteger(rank) || !Number.isSafeInteger(multiplier)) {
      return freeze({ status: 'MIXED_RADIX_SEAM_ENCODER_NUMERIC_DOMAIN_ABSTAINS' });
    }
  }
  return freeze({
    status: 'ALL_FINITE_SEAM_VECTOR_MIXED_RADIX_ENCODED',
    q_runs: freeze([...qRuns]),
    seams: freeze([...seams]),
    rank,
    cardinality: multiplier,
  });
}

export function decodeSeamVectorMixedRadix(qRuns, rank) {
  if (!validQRuns(qRuns) || !validNat(rank)) return freeze({ status: 'MIXED_RADIX_SEAM_DECODER_ABSTAINS' });
  const radices = qRuns.slice(1, -1).map((value) => value + 1);
  const cardinality = safeProduct(radices);
  if (cardinality === null || rank >= cardinality) {
    return freeze({ status: 'MIXED_RADIX_SEAM_DECODER_LABEL_OUTSIDE_LAWFUL_ALPHABET' });
  }
  let residual = rank;
  const seams = [];
  for (const radix of radices) {
    seams.push(residual % radix);
    residual = Math.floor(residual / radix);
  }
  return freeze({
    status: 'ALL_FINITE_SEAM_VECTOR_MIXED_RADIX_DECODED',
    q_runs: freeze([...qRuns]),
    rank,
    seams: freeze(seams),
    cardinality,
  });
}

export function allFiniteSeamCustodyRequirement(qRuns) {
  if (!validQRuns(qRuns)) return freeze({ status: 'ALL_FINITE_SEAM_CUSTODY_Q_RUNS_ABSTAIN' });
  const cardinality = seamHyperrectangleCardinality(qRuns);
  const bits = minimumBitsForCardinality(cardinality);
  if (cardinality === null || bits === null) return freeze({ status: 'ALL_FINITE_SEAM_CUSTODY_NUMERIC_DOMAIN_ABSTAINS' });
  return freeze({
    status: 'EXACT_ALL_FINITE_LINEAR_SEAM_CUSTODY_REQUIREMENT_DERIVED',
    q_runs: freeze([...qRuns]),
    factor_count: qRuns.length - 1,
    seam_count: qRuns.length - 2,
    minimum_alphabet_cardinality: cardinality,
    minimum_fixed_width_binary_bits: bits,
    seam_alphabet_cardinalities: freeze(qRuns.slice(1, -1).map((value) => value + 1)),
  });
}

export function residualSeamFiberCardinality(qRuns, retainedIndices) {
  if (!validQRuns(qRuns) || !Array.isArray(retainedIndices)) {
    return freeze({ status: 'RESIDUAL_SEAM_FIBER_ABSTAINS' });
  }
  const seamCount = qRuns.length - 2;
  const retained = new Set(retainedIndices);
  if (retained.size !== retainedIndices.length
      || retainedIndices.some((index) => !Number.isSafeInteger(index) || index < 0 || index >= seamCount)) {
    return freeze({ status: 'RESIDUAL_SEAM_FIBER_RETAINED_INDEX_ABSTAINS' });
  }
  const factors = qRuns.slice(1, -1).map((value, index) => (retained.has(index) ? 1 : value + 1));
  const cardinality = safeProduct(factors);
  if (cardinality === null) return freeze({ status: 'RESIDUAL_SEAM_FIBER_NUMERIC_DOMAIN_ABSTAINS' });
  return freeze({
    status: 'EXACT_PARTIAL_CUSTODY_RESIDUAL_SEAM_FIBER_CARDINALITY_DERIVED',
    q_runs: freeze([...qRuns]),
    retained_indices: freeze([...retainedIndices].sort((a, b) => a - b)),
    residual_cardinality: cardinality,
  });
}

export function auditAllFiniteSeamCustodyScheme(qRuns, rows, declaredAlphabetSize) {
  const predicted = predictedSeamHyperrectangle(qRuns);
  if (predicted.status !== 'EXACT_ALL_FINITE_LINEAR_SEAM_HYPERRECTANGLE_DERIVED'
      || !Array.isArray(rows)
      || !Number.isSafeInteger(declaredAlphabetSize)
      || declaredAlphabetSize < 1) {
    return freeze({ status: 'ALL_FINITE_SEAM_CUSTODY_SCHEME_AUDIT_ABSTAINS' });
  }
  const lawful = new Set(predicted.rows.map((row) => keyOf(row.seams)));
  const seamToLabel = new Map();
  const labelToSeam = new Map();
  const collisions = [];
  const unlawful = [];

  for (const row of rows) {
    const seamKey = keyOf(row?.seams);
    if (!lawful.has(seamKey) || !Object.prototype.hasOwnProperty.call(row ?? {}, 'label')) {
      unlawful.push(row?.seams ?? null);
      continue;
    }
    seamToLabel.set(seamKey, row.label);
    const labelKey = keyOf(row.label);
    if (labelToSeam.has(labelKey) && labelToSeam.get(labelKey) !== seamKey) {
      collisions.push(freeze({ label: row.label, left: JSON.parse(labelToSeam.get(labelKey)), right: row.seams }));
    } else {
      labelToSeam.set(labelKey, seamKey);
    }
  }

  const missing = predicted.rows.map((row) => row.seams).filter((seams) => !seamToLabel.has(keyOf(seams)));
  const undersized = declaredAlphabetSize < predicted.cardinality;
  const exact = !undersized
    && collisions.length === 0
    && unlawful.length === 0
    && missing.length === 0
    && seamToLabel.size === predicted.cardinality
    && labelToSeam.size <= declaredAlphabetSize;

  return freeze({
    status: 'ALL_FINITE_SEAM_CUSTODY_SCHEME_AUDITED',
    required_alphabet_size: predicted.cardinality,
    declared_alphabet_size: declaredAlphabetSize,
    undersized,
    collisions: freeze(collisions),
    unlawful_seams: freeze(unlawful),
    missing_seams: freeze(missing),
    exact,
    classification: exact
      ? 'EXACT_ALL_FINITE_SEAM_CUSTODY_SCHEME_WITNESSED'
      : undersized
        ? 'EXACT_ALL_FINITE_SEAM_RECOVERY_FORBIDDEN_BY_FINITE_CUSTODY_LOWER_BOUND'
        : 'ALL_FINITE_SEAM_CUSTODY_CAPACITY_OR_MAPPING_INSUFFICIENT_FOR_EXACT_RECOVERY',
  });
}

export function powerAlignedAllFiniteSeamWitness(bitWidths) {
  if (!Array.isArray(bitWidths)
      || bitWidths.some((value) => !Number.isSafeInteger(value) || value < 0 || value > 16)
      || bitWidths.reduce((sum, value) => sum + value, 0) > 40) {
    return freeze({ status: 'POWER_ALIGNED_ALL_FINITE_SEAM_WITNESS_ABSTAINS' });
  }
  const internal = bitWidths.map((bits) => (2 ** bits) - 1);
  const qRuns = freeze([0, ...internal, 0]);
  const requirement = allFiniteSeamCustodyRequirement(qRuns);
  const sumBits = bitWidths.reduce((sum, value) => sum + value, 0);
  const expectedCardinality = 2 ** sumBits;
  const passed = requirement.status === 'EXACT_ALL_FINITE_LINEAR_SEAM_CUSTODY_REQUIREMENT_DERIVED'
    && requirement.minimum_alphabet_cardinality === expectedCardinality
    && requirement.minimum_fixed_width_binary_bits === sumBits;
  return freeze({
    status: passed
      ? 'POWER_ALIGNED_ALL_FINITE_SEAM_ADDITIVE_WIDTH_WITNESS_DERIVED'
      : 'POWER_ALIGNED_ALL_FINITE_SEAM_ADDITIVE_WIDTH_WITNESS_FAILED',
    bit_widths: freeze([...bitWidths]),
    q_runs: qRuns,
    expected_cardinality: expectedCardinality,
    expected_joint_bits: sumBits,
    requirement,
  });
}

function symbolicHyperrectangleCertificate() {
  return freeze({
    passed: true,
    seam_location: 'With exactly one T in each of r ordered factors, seam j must lie in the disjoint internal Q-run a_j between T_j and T_(j+1).',
    parameterization: 'k_j counts Qs from a_j assigned left; independently 0<=k_j<=a_j.',
    injectivity: 'Different seam vectors change at least one literal cut and therefore the ordered factor list.',
    surjectivity: 'Every lawful one-T-per-factor segmentation yields exactly one k_j in each internal Q-run.',
    cardinality: 'Independent finite seam coordinates give Π_(j=1)^(r-1)(a_j+1), with empty product 1 for r=1.',
    authority: 'ALL_FINITE_r_BY_EXACT_DISJOINT_INTERNAL_RUN_CUT_GEOMETRY_NOT_HORIZON_ENUMERATION',
  });
}

function symbolicCustodyCertificate() {
  return freeze({
    passed: true,
    lower_bound: 'Exact seam-vector decoding forces an injective encoder on the finite hyperrectangle.',
    mixed_radix: 'The declared S coordinate is the standard finite mixed-radix bijection over radices a_j+1.',
    fixed_width: 'b bits carry at most 2^b labels, so exact recovery requires b>=ceil(log2 Π(a_j+1)).',
    partial: 'Retaining seam subset S fixes exactly those coordinates; the residual fiber is the Cartesian product over unretained coordinates.',
    power_aligned: 'a_j=2^(b_j)-1 gives exactly 2^(Σb_j) seam vectors and joint width Σb_j.',
    nonprobabilistic: 'All products and bit counts are finite deterministic cardinality statements, not entropy or statistical independence.',
  });
}

function finiteLiteralCorroboration() {
  const rows = [];
  for (let r = 1; r <= 5; r += 1) {
    const vectors = enumerateVectors(Array.from({ length: r + 1 }, () => 3));
    for (const qRuns of vectors) {
      const certificate = hyperrectangleCompletenessCertificate(qRuns);
      rows.push(freeze({ q_runs: qRuns, certificate, passed: certificate.status === 'EXACT_ALL_FINITE_HYPERRECTANGLE_COMPLETENESS_WITNESSED' }));
    }
  }
  return freeze({
    passed: rows.every((row) => row.passed),
    rows: freeze(rows),
    authority: 'FINITE_LITERAL_CUT_CORROBORATION_ONLY_NOT_UNIVERSAL_PROOF',
  });
}

function mixedRadixHostile() {
  const grids = [
    [0, 0],
    [1, 0, 2],
    [0, 2, 3, 0],
    [1, 1, 2, 3, 1],
  ];
  const rows = [];
  for (const qRuns of grids) {
    const predicted = predictedSeamHyperrectangle(qRuns);
    for (const row of predicted.rows) {
      const encoded = encodeSeamVectorMixedRadix(qRuns, row.seams);
      const decoded = encoded.status === 'ALL_FINITE_SEAM_VECTOR_MIXED_RADIX_ENCODED'
        ? decodeSeamVectorMixedRadix(qRuns, encoded.rank)
        : freeze({ status: 'MIXED_RADIX_HOSTILE_ENCODING_FAILED' });
      rows.push(freeze({
        q_runs: qRuns,
        seams: row.seams,
        encoded,
        decoded,
        passed: encoded.status === 'ALL_FINITE_SEAM_VECTOR_MIXED_RADIX_ENCODED'
          && decoded.status === 'ALL_FINITE_SEAM_VECTOR_MIXED_RADIX_DECODED'
          && keyOf(decoded.seams) === keyOf(row.seams),
      }));
    }
  }
  return freeze({ passed: rows.every((row) => row.passed), rows: freeze(rows) });
}

function partialCustodyHostile() {
  const qRuns = freeze([0, 2, 3, 4, 0]);
  const cases = freeze([
    freeze({ retained: [], expected: 3 * 4 * 5 }),
    freeze({ retained: [0], expected: 4 * 5 }),
    freeze({ retained: [1], expected: 3 * 5 }),
    freeze({ retained: [2], expected: 3 * 4 }),
    freeze({ retained: [0, 2], expected: 4 }),
    freeze({ retained: [0, 1, 2], expected: 1 }),
  ]);
  const rows = cases.map((entry) => {
    const result = residualSeamFiberCardinality(qRuns, entry.retained);
    return freeze({ ...entry, result, passed: result.residual_cardinality === entry.expected });
  });
  return freeze({ passed: rows.every((row) => row.passed), rows: freeze(rows) });
}

function undersizedCustodyHostile() {
  const qRuns = freeze([0, 1, 1, 1, 0]);
  const predicted = predictedSeamHyperrectangle(qRuns);
  const rows = predicted.rows.map((row, index) => freeze({ seams: row.seams, label: index % 7 }));
  const audit = auditAllFiniteSeamCustodyScheme(qRuns, rows, 7);
  return freeze({
    passed: predicted.cardinality === 8
      && audit.undersized
      && audit.collisions.length >= 1
      && !audit.exact
      && audit.classification === 'EXACT_ALL_FINITE_SEAM_RECOVERY_FORBIDDEN_BY_FINITE_CUSTODY_LOWER_BOUND',
    audit,
  });
}

function capacityWithoutInjectivityHostile() {
  const qRuns = freeze([0, 1, 1, 0]);
  const predicted = predictedSeamHyperrectangle(qRuns);
  const rows = predicted.rows.map((row, index) => freeze({ seams: row.seams, label: index === 2 ? 1 : index }));
  const audit = auditAllFiniteSeamCustodyScheme(qRuns, rows, predicted.cardinality);
  return freeze({
    passed: !audit.undersized
      && audit.collisions.length === 1
      && !audit.exact
      && audit.classification === 'ALL_FINITE_SEAM_CUSTODY_CAPACITY_OR_MAPPING_INSUFFICIENT_FOR_EXACT_RECOVERY',
    audit,
  });
}

function reductionTo744Hostile() {
  const cases = freeze([
    freeze([0, 2, 3, 0]),
    freeze([1, 0, 4, 2]),
    freeze([2, 3, 0, 1]),
  ]);
  const rows = cases.map(([a, m, n, f]) => {
    const current = predictedSeamHyperrectangle([a, m, n, f]);
    const parent = predictedTwoSeamRectangle(a, m, n, f);
    const currentKeys = current.rows.map((row) => keyOf({ i: row.seams[0], j: row.seams[1] })).sort();
    const parentKeys = parent.rows.map((row) => keyOf(row.seam)).sort();
    return freeze({
      parameters: freeze({ a, m, n, f }),
      current_cardinality: current.cardinality,
      parent_cardinality: parent.cardinality,
      passed: current.cardinality === parent.cardinality && keyOf(currentKeys) === keyOf(parentKeys),
    });
  });
  return freeze({ passed: rows.every((row) => row.passed), rows: freeze(rows) });
}

function powerAlignedHostile() {
  const cases = freeze([
    freeze([]),
    freeze([0]),
    freeze([1]),
    freeze([1, 2]),
    freeze([2, 1, 3]),
    freeze([3, 0, 2, 1]),
  ]);
  const rows = cases.map((bits) => {
    const witness = powerAlignedAllFiniteSeamWitness(bits);
    return freeze({ bits, witness, passed: witness.status === 'POWER_ALIGNED_ALL_FINITE_SEAM_ADDITIVE_WIDTH_WITNESS_DERIVED' });
  });
  return freeze({ passed: rows.every((row) => row.passed), rows: freeze(rows) });
}

function flattenedWordImpersonationHostile() {
  const qRuns = freeze([0, 1, 2, 1, 0]);
  const target = exactFiniteTWord(qRuns);
  const predicted = predictedSeamHyperrectangle(qRuns);
  const allSameWord = predicted.rows.every((row) => sameWord(row.concatenated, target.word));
  const distinct = new Set(predicted.rows.map((row) => keyOf(row.seams))).size;
  return freeze({
    passed: target.status === 'ALL_FINITE_EXACT_TQ_WORD_DERIVED'
      && predicted.cardinality === 12
      && allSameWord
      && distinct === 12,
    classification: allSameWord && distinct > 1
      ? 'EXACT_FLATTENED_WORD_FORBIDDEN_FROM_IMPERSONATING_UNIQUE_ALL_FINITE_LINEAR_SEAM_VECTOR'
      : 'UNCLASSIFIED',
  });
}

export function runAllFiniteSeamHyperrectangleChamber() {
  const certificates = freeze({
    symbolic_hyperrectangle: symbolicHyperrectangleCertificate(),
    symbolic_custody: symbolicCustodyCertificate(),
    finite_literal_corroboration: finiteLiteralCorroboration(),
    mixed_radix_round_trip_hostile: mixedRadixHostile(),
    partial_custody_residual_hostile: partialCustodyHostile(),
    undersized_custody_hostile: undersizedCustodyHostile(),
    capacity_without_injectivity_hostile: capacityWithoutInjectivityHostile(),
    reduction_to_744_hostile: reductionTo744Hostile(),
    power_aligned_additive_width_hostile: powerAlignedHostile(),
    flattened_word_seam_impersonation_hostile: flattenedWordImpersonationHostile(),
  });
  const passed = Object.values(certificates).every((certificate) => certificate.passed);
  return freeze({
    schema: ALL_FINITE_SEAM_HYPERRECTANGLE_SCHEMA,
    parent_receipt: ALL_FINITE_SEAM_HYPERRECTANGLE_PARENT_RECEIPT,
    gate_issue: ALL_FINITE_SEAM_HYPERRECTANGLE_GATE_ISSUE,
    status: passed
      ? 'ALL_FINITE_LINEAR_SEAM_HYPERRECTANGLE_CHAMBER_PASSED'
      : 'ALL_FINITE_LINEAR_SEAM_HYPERRECTANGLE_CHAMBER_FAILED',
    passed,
    certificates,
    canonical_candidate: passed
      ? 'THE_ALL_FINITE_ORDERED_ONE_T_PER_FACTOR_SEGMENTATION_FIBER_OF_Q^a0_T_Q^a1_T_..._T_Q^ar_IS_EXACTLY_THE_HYPERRECTANGLE_PRODUCT_j_1_TO_r_MINUS_1_0_DOT_DOT_a_j'
      : 'UNCLASSIFIED',
    consequential_candidate: passed
      ? 'FINITE_LINEAR_SEAM_AMBIGUITY_MULTIPLIES_ACROSS_INTERNAL_Q_RUNS_EVEN_WHEN_THE_COMPLETE_FLATTENED_AUTHORED_WORD_AND_FIRST_MOMENT_STATE_ARE_EXACTLY_PRESERVED'
      : 'UNCLASSIFIED',
    architectural_candidate: passed
      ? 'ALL_FINITE_LINEAR_SEAM_CUSTODY_HAS_EXACT_PRODUCT_CARDINALITY_MIXED_RADIX_RECOVERY_AND_POWER_ALIGNED_FIXED_WIDTHS_ADD_WITHOUT_PROMOTING_TO_GENERAL_WORKFLOW_PROVENANCE'
      : 'UNCLASSIFIED',
    landing: freeze({
      flattened_order_is_not_segmentation_custody: true,
      one_witnessed_seam_is_not_another_witnessed_seam: true,
      all_finite_linear_seam_ambiguity_stays_explicit: true,
      mixed_radix_recovers_only_the_preserved_seam_vector: true,
      missing_seam_evidence_requires_narrowing_or_abstention: true,
    }),
  });
}

export default runAllFiniteSeamHyperrectangleChamber;
