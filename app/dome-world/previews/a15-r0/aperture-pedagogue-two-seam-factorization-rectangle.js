import {
  multiplyQuotientCoordinates,
  quotientCoordinate,
} from './aperture-pedagogue-target-equivalence-quotient-congruence.js';
import {
  firstMomentCoordinate,
} from './aperture-pedagogue-first-moment-weaker-transport-quotient.js';

export const TWO_SEAM_FACTORIZATION_RECTANGLE_SCHEMA = 'td613.a15-r0.aperture-pedagogue-two-seam-factorization-rectangle/v0.1';
export const TWO_SEAM_FACTORIZATION_RECTANGLE_PARENT_RECEIPT = '8a9b537e685eb3bebf0ef05308e7b3deb6809f38';
export const TWO_SEAM_FACTORIZATION_RECTANGLE_GATE_ISSUE = 737;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const keyOf = (value) => JSON.stringify(value);
const Q = (n) => Array.from({ length: n }, () => 'Q');

function validNat(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function validWordParameters(a, m, n, f) {
  return [a, m, n, f].every(validNat);
}

function countT(word) {
  return Array.isArray(word) ? word.filter((generator) => generator === 'T').length : -1;
}

function concatWords(...words) {
  return freeze(words.flat());
}

function sameWord(left, right) {
  return keyOf(left) === keyOf(right);
}

function sameBase(left, right) {
  return left && right
    && left.t === right.t
    && left.E === right.E
    && left.O === right.O;
}

function minimumBitsForCardinality(cardinality) {
  if (!Number.isSafeInteger(cardinality) || cardinality < 1) return null;
  if (cardinality === 1) return 0;
  return Math.ceil(Math.log2(cardinality));
}

export function exactThreeTWord(a, m, n, f) {
  if (!validWordParameters(a, m, n, f)) {
    return freeze({ status: 'TWO_SEAM_EXACT_WORD_PARAMETERS_ABSTAIN' });
  }
  const word = freeze([
    ...Q(a), 'T', ...Q(m), 'T', ...Q(n), 'T', ...Q(f),
  ]);
  return freeze({
    status: 'TWO_SEAM_EXACT_THREE_T_WORD_DERIVED',
    parameters: freeze({ a, m, n, f }),
    word,
  });
}

export function predictedThreeFactorSplit(a, m, n, f, i, j) {
  if (!validWordParameters(a, m, n, f)
      || !validNat(i) || !validNat(j)
      || i > m || j > n) {
    return freeze({ status: 'TWO_SEAM_PREDICTED_SPLIT_ABSTAINS' });
  }

  const x = freeze([...Q(a), 'T', ...Q(i)]);
  const y = freeze([...Q(m - i), 'T', ...Q(j)]);
  const z = freeze([...Q(n - j), 'T', ...Q(f)]);
  const concatenated = concatWords(x, y, z);
  const target = exactThreeTWord(a, m, n, f);

  const X = quotientCoordinate(x);
  const Y = quotientCoordinate(y);
  const Z = quotientCoordinate(z);
  const XY = multiplyQuotientCoordinates(X, Y);
  const XYZ = multiplyQuotientCoordinates(XY, Z);
  const c1 = firstMomentCoordinate(concatenated);
  const expectedBase = freeze({ t: 3, E: a + n, O: m + f });
  const expectedRank = n + f;
  const derivedRank = c1?.status === 'FIRST_MOMENT_WEAKER_TRANSPORT_COORDINATE_DERIVED'
    ? (c1.P - c1.O) / 2
    : null;

  const passed = target.status === 'TWO_SEAM_EXACT_THREE_T_WORD_DERIVED'
    && sameWord(concatenated, target.word)
    && countT(x) === 1
    && countT(y) === 1
    && countT(z) === 1
    && X?.status === 'TARGET_EQUIVALENCE_QUOTIENT_COORDINATE_DERIVED'
    && Y?.status === 'TARGET_EQUIVALENCE_QUOTIENT_COORDINATE_DERIVED'
    && Z?.status === 'TARGET_EQUIVALENCE_QUOTIENT_COORDINATE_DERIVED'
    && X.t === 1 && X.E === a && X.O === i
    && Y.t === 1 && Y.E === m - i && Y.O === j
    && Z.t === 1 && Z.E === n - j && Z.O === f
    && XYZ?.status === 'PARITY_TWISTED_QUOTIENT_PRODUCT_DERIVED'
    && sameBase(XYZ, expectedBase)
    && Number.isSafeInteger(derivedRank)
    && derivedRank === expectedRank;

  return freeze({
    status: passed
      ? 'TWO_SEAM_PREDICTED_1_PLUS_1_PLUS_1_SPLIT_DERIVED'
      : 'TWO_SEAM_PREDICTED_SPLIT_INTERNAL_MISMATCH',
    parameters: freeze({ a, m, n, f }),
    seam: freeze({ i, j }),
    x,
    y,
    z,
    concatenated,
    quotient_factors: freeze({ X, Y, Z }),
    quotient_product: XYZ,
    first_moment_coordinate: c1,
    expected_product_base: expectedBase,
    expected_product_rank: expectedRank,
  });
}

export function predictedTwoSeamRectangle(a, m, n, f) {
  if (!validWordParameters(a, m, n, f)) {
    return freeze({ status: 'TWO_SEAM_RECTANGLE_PARAMETERS_ABSTAIN' });
  }
  const rows = [];
  for (let i = 0; i <= m; i += 1) {
    for (let j = 0; j <= n; j += 1) {
      rows.push(predictedThreeFactorSplit(a, m, n, f, i, j));
    }
  }
  const expectedCardinality = (m + 1) * (n + 1);
  const safe = Number.isSafeInteger(expectedCardinality);
  const seamKeys = rows.map((row) => keyOf(row.seam));
  const unique = new Set(seamKeys).size === rows.length;
  const passed = safe
    && rows.length === expectedCardinality
    && rows.every((row) => row.status === 'TWO_SEAM_PREDICTED_1_PLUS_1_PLUS_1_SPLIT_DERIVED')
    && unique;
  return freeze({
    status: passed
      ? 'EXACT_TWO_SEAM_FACTORIZATION_RECTANGLE_DERIVED'
      : 'TWO_SEAM_FACTORIZATION_RECTANGLE_INTERNAL_MISMATCH',
    parameters: freeze({ a, m, n, f }),
    cardinality: safe ? expectedCardinality : null,
    rows: freeze(rows),
    seam_coordinates_unique: unique,
  });
}

function seamFromLiteralFactors(x, y, z, parameters) {
  const { a, m, n, f } = parameters;
  const i = x.length - (a + 1);
  const j = y.length - ((m - i) + 1);
  if (!validNat(i) || !validNat(j) || i > m || j > n) return null;
  const predicted = predictedThreeFactorSplit(a, m, n, f, i, j);
  if (predicted.status !== 'TWO_SEAM_PREDICTED_1_PLUS_1_PLUS_1_SPLIT_DERIVED') return null;
  if (!sameWord(x, predicted.x) || !sameWord(y, predicted.y) || !sameWord(z, predicted.z)) return null;
  return freeze({ i, j });
}

export function enumerateLiteralOneOneOneSplits(a, m, n, f) {
  const target = exactThreeTWord(a, m, n, f);
  if (target.status !== 'TWO_SEAM_EXACT_THREE_T_WORD_DERIVED') {
    return freeze({ status: target.status });
  }
  const rows = [];
  const word = target.word;

  for (let cut1 = 1; cut1 <= word.length - 2; cut1 += 1) {
    for (let cut2 = cut1 + 1; cut2 <= word.length - 1; cut2 += 1) {
      const x = freeze(word.slice(0, cut1));
      const y = freeze(word.slice(cut1, cut2));
      const z = freeze(word.slice(cut2));
      if (countT(x) !== 1 || countT(y) !== 1 || countT(z) !== 1) continue;
      const seam = seamFromLiteralFactors(x, y, z, target.parameters);
      rows.push(freeze({
        cut1,
        cut2,
        x,
        y,
        z,
        seam,
        passed: seam !== null,
      }));
    }
  }

  return freeze({
    status: rows.every((row) => row.passed)
      ? 'LITERAL_1_PLUS_1_PLUS_1_SPLITS_ENUMERATED'
      : 'LITERAL_1_PLUS_1_PLUS_1_SPLIT_MAPPING_FAILED',
    parameters: target.parameters,
    word,
    cardinality: rows.length,
    rows: freeze(rows),
  });
}

export function rectangleCompletenessCertificate(a, m, n, f) {
  const predicted = predictedTwoSeamRectangle(a, m, n, f);
  const literal = enumerateLiteralOneOneOneSplits(a, m, n, f);
  if (predicted.status !== 'EXACT_TWO_SEAM_FACTORIZATION_RECTANGLE_DERIVED'
      || literal.status !== 'LITERAL_1_PLUS_1_PLUS_1_SPLITS_ENUMERATED') {
    return freeze({ status: 'TWO_SEAM_RECTANGLE_COMPLETENESS_ABSTAINS', predicted, literal });
  }
  const predictedKeys = predicted.rows.map((row) => keyOf(row.seam)).sort();
  const literalKeys = literal.rows.map((row) => keyOf(row.seam)).sort();
  const equal = keyOf(predictedKeys) === keyOf(literalKeys);
  return freeze({
    status: equal
      ? 'EXACT_TWO_SEAM_RECTANGLE_COMPLETENESS_WITNESSED'
      : 'TWO_SEAM_RECTANGLE_COMPLETENESS_FAILED',
    parameters: predicted.parameters,
    predicted_cardinality: predicted.cardinality,
    literal_cardinality: literal.cardinality,
    predicted_keys: freeze(predictedKeys),
    literal_keys: freeze(literalKeys),
    equal,
  });
}

export function twoSeamCustodyRequirement(a, m, n, f) {
  const rectangle = predictedTwoSeamRectangle(a, m, n, f);
  if (rectangle.status !== 'EXACT_TWO_SEAM_FACTORIZATION_RECTANGLE_DERIVED') {
    return freeze({ status: rectangle.status });
  }
  const cardinality = rectangle.cardinality;
  const bits = minimumBitsForCardinality(cardinality);
  if (bits === null) return freeze({ status: 'TWO_SEAM_CUSTODY_NUMERIC_DOMAIN_ABSTAINS' });
  return freeze({
    status: 'EXACT_TWO_SEAM_CUSTODY_REQUIREMENT_DERIVED',
    parameters: rectangle.parameters,
    minimum_alphabet_cardinality: cardinality,
    minimum_fixed_width_binary_bits: bits,
    first_seam_alphabet_cardinality: m + 1,
    second_seam_alphabet_cardinality: n + 1,
    first_seam_minimum_bits: minimumBitsForCardinality(m + 1),
    second_seam_minimum_bits: minimumBitsForCardinality(n + 1),
  });
}

export function marginalSecondSeamFiber(a, m, n, f, i) {
  if (!validWordParameters(a, m, n, f) || !validNat(i) || i > m) {
    return freeze({ status: 'SECOND_SEAM_MARGINAL_FIBER_ABSTAINS' });
  }
  const rows = Array.from({ length: n + 1 }, (_, j) => predictedThreeFactorSplit(a, m, n, f, i, j));
  return freeze({
    status: rows.every((row) => row.status === 'TWO_SEAM_PREDICTED_1_PLUS_1_PLUS_1_SPLIT_DERIVED')
      ? 'EXACT_SECOND_SEAM_MARGINAL_FIBER_DERIVED'
      : 'SECOND_SEAM_MARGINAL_FIBER_INTERNAL_MISMATCH',
    known_first_seam: i,
    cardinality: n + 1,
    rows: freeze(rows),
  });
}

export function marginalFirstSeamFiber(a, m, n, f, j) {
  if (!validWordParameters(a, m, n, f) || !validNat(j) || j > n) {
    return freeze({ status: 'FIRST_SEAM_MARGINAL_FIBER_ABSTAINS' });
  }
  const rows = Array.from({ length: m + 1 }, (_, i) => predictedThreeFactorSplit(a, m, n, f, i, j));
  return freeze({
    status: rows.every((row) => row.status === 'TWO_SEAM_PREDICTED_1_PLUS_1_PLUS_1_SPLIT_DERIVED')
      ? 'EXACT_FIRST_SEAM_MARGINAL_FIBER_DERIVED'
      : 'FIRST_SEAM_MARGINAL_FIBER_INTERNAL_MISMATCH',
    known_second_seam: j,
    cardinality: m + 1,
    rows: freeze(rows),
  });
}

export function auditTwoSeamCustodyScheme(a, m, n, f, rows, declaredAlphabetSize) {
  const rectangle = predictedTwoSeamRectangle(a, m, n, f);
  if (rectangle.status !== 'EXACT_TWO_SEAM_FACTORIZATION_RECTANGLE_DERIVED'
      || !Array.isArray(rows)
      || !Number.isSafeInteger(declaredAlphabetSize)
      || declaredAlphabetSize < 1) {
    return freeze({ status: 'TWO_SEAM_CUSTODY_SCHEME_AUDIT_ABSTAINS' });
  }

  const lawful = new Set(rectangle.rows.map((row) => keyOf(row.seam)));
  const seamToLabel = new Map();
  const labelToSeam = new Map();
  const collisions = [];
  const duplicateSeams = [];
  const unlawfulSeams = [];

  rows.forEach((row) => {
    const seam = row?.seam;
    const seamKey = keyOf(seam);
    if (!seam || !validNat(seam.i) || !validNat(seam.j) || !lawful.has(seamKey)
        || !Object.prototype.hasOwnProperty.call(row, 'label')) {
      unlawfulSeams.push(seam ?? null);
      return;
    }
    if (seamToLabel.has(seamKey)) duplicateSeams.push(seam);
    seamToLabel.set(seamKey, row.label);
    const labelKey = keyOf(row.label);
    if (labelToSeam.has(labelKey) && labelToSeam.get(labelKey) !== seamKey) {
      collisions.push(freeze({ label: row.label, left: JSON.parse(labelToSeam.get(labelKey)), right: seam }));
    } else {
      labelToSeam.set(labelKey, seamKey);
    }
  });

  const missingSeams = rectangle.rows
    .map((row) => row.seam)
    .filter((seam) => !seamToLabel.has(keyOf(seam)));
  const undersized = declaredAlphabetSize < rectangle.cardinality;
  const alphabetOverrun = labelToSeam.size > declaredAlphabetSize;
  const exact = !undersized
    && !alphabetOverrun
    && collisions.length === 0
    && duplicateSeams.length === 0
    && unlawfulSeams.length === 0
    && missingSeams.length === 0
    && seamToLabel.size === rectangle.cardinality;

  return freeze({
    status: 'TWO_SEAM_CUSTODY_SCHEME_AUDITED',
    parameters: rectangle.parameters,
    required_alphabet_size: rectangle.cardinality,
    declared_alphabet_size: declaredAlphabetSize,
    distinct_labels_used: labelToSeam.size,
    undersized,
    alphabet_overrun: alphabetOverrun,
    collisions: freeze(collisions),
    duplicate_seams: freeze(duplicateSeams),
    unlawful_seams: freeze(unlawfulSeams),
    missing_seams: freeze(missingSeams),
    exact,
    classification: exact
      ? 'EXACT_TWO_SEAM_CUSTODY_SCHEME_WITNESSED'
      : undersized
        ? 'EXACT_TWO_SEAM_RECOVERY_FORBIDDEN_BY_FINITE_CUSTODY_LOWER_BOUND'
        : 'TWO_SEAM_CUSTODY_CAPACITY_OR_MAPPING_INSUFFICIENT_FOR_EXACT_RECOVERY',
  });
}

export function powerAlignedTwoSeamWitness(p, q) {
  if (![p, q].every((value) => Number.isSafeInteger(value) && value >= 0 && value <= 20)) {
    return freeze({ status: 'POWER_ALIGNED_TWO_SEAM_WITNESS_ABSTAINS' });
  }
  const m = (2 ** p) - 1;
  const n = (2 ** q) - 1;
  const requirement = twoSeamCustodyRequirement(0, m, n, 0);
  const expectedCardinality = 2 ** (p + q);
  const passed = requirement.status === 'EXACT_TWO_SEAM_CUSTODY_REQUIREMENT_DERIVED'
    && requirement.minimum_alphabet_cardinality === expectedCardinality
    && requirement.minimum_fixed_width_binary_bits === p + q
    && requirement.first_seam_minimum_bits === p
    && requirement.second_seam_minimum_bits === q;
  return freeze({
    status: passed
      ? 'POWER_ALIGNED_TWO_SEAM_ADDITIVE_WIDTH_WITNESS_DERIVED'
      : 'POWER_ALIGNED_TWO_SEAM_ADDITIVE_WIDTH_WITNESS_FAILED',
    p,
    q,
    m,
    n,
    expected_cardinality: expectedCardinality,
    requirement,
  });
}

function symbolicRectangleCertificate() {
  return freeze({
    passed: true,
    completeness: 'Each factor must contain exactly one T. Therefore seam 1 lies somewhere in the m-Q run between T1 and T2, and seam 2 lies somewhere in the n-Q run between T2 and T3.',
    parameterization: 'Let i be the number of the m intermediate Qs retained by factor 1 and j the number of the n intermediate Qs retained by factor 2. Then 0<=i<=m and 0<=j<=n uniquely determine x=Q^aTQ^i, y=Q^(m-i)TQ^j, z=Q^(n-j)TQ^f.',
    injectivity: 'Different (i,j) change at least one declared cut and therefore produce a different ordered factor triple.',
    surjectivity: 'Every lawful ordered 1+1+1 split has exactly such i and j by counting Q generators adjacent to the two cuts.',
    cardinality: 'The Cartesian rectangle has (m+1)(n+1) points.',
    authority: 'ALL_NONNEGATIVE_a_m_n_f_BY_EXACT_WORD_CUT_GEOMETRY_NOT_HORIZON_ENUMERATION',
  });
}

function symbolicProductStateCertificate() {
  return freeze({
    passed: true,
    quotient: '(1,a,i)★(1,m-i,j)=(2,a+j,m), then ★(1,n-j,f)=(3,a+n,m+f), independent of i,j.',
    rank: 'Every t=1 factor has rank 0. #742 affine composition gives R_xy=j and R_xyz=j+(n-j+f)=n+f, independent of i,j.',
    exact_word: 'Literal concatenation cancels the split exponents: Q^aTQ^i Q^(m-i)TQ^j Q^(n-j)TQ^f = Q^aTQ^mTQ^nTQ^f.',
    authority: '#729_QUOTIENT_PRODUCT_PLUS_#742_AFFINE_RANK_COMPOSITION_PLUS_LITERAL_WORD_IDENTITY',
  });
}

function symbolicCustodyCertificate() {
  return freeze({
    passed: true,
    necessity: 'Exact decoding of the ordered seam pair forces an injective encoder on a fiber of size (m+1)(n+1).',
    tightness: 'The pair label K=(i,j) is a bijection to the exact factorization rectangle.',
    binary: 'A fixed-width b-bit field has at most 2^b labels, so exact joint seam recovery requires b>=ceil(log2((m+1)(n+1))).',
    marginals: 'With i known exactly, only j varies and there are n+1 candidates; with j known exactly, only i varies and there are m+1 candidates.',
    power_aligned: 'm=2^p-1,n=2^q-1 gives exactly 2^(p+q) seam pairs and therefore exactly p+q fixed-width bits.',
    authority: 'FINITE_INJECTIVITY_PLUS_EXACT_RECTANGLE_BIJECTION',
  });
}

function finiteEnumerationCorroboration() {
  const rows = [];
  for (let a = 0; a <= 2; a += 1) {
    for (let m = 0; m <= 4; m += 1) {
      for (let n = 0; n <= 4; n += 1) {
        for (let f = 0; f <= 2; f += 1) {
          const certificate = rectangleCompletenessCertificate(a, m, n, f);
          rows.push(freeze({ a, m, n, f, certificate, passed: certificate.status === 'EXACT_TWO_SEAM_RECTANGLE_COMPLETENESS_WITNESSED' }));
        }
      }
    }
  }
  return freeze({
    passed: rows.every((row) => row.passed),
    rows: freeze(rows),
    authority: 'FINITE_LITERAL_SPLIT_CORROBORATION_ONLY_NOT_UNIVERSAL_PROOF',
  });
}

function undersizedAlphabetHostile() {
  const rectangle = predictedTwoSeamRectangle(0, 1, 1, 0);
  const rows = rectangle.rows.map((row, index) => freeze({ seam: row.seam, label: index % 3 }));
  const audit = auditTwoSeamCustodyScheme(0, 1, 1, 0, rows, 3);
  return freeze({
    passed: rectangle.cardinality === 4
      && audit.undersized
      && audit.collisions.length >= 1
      && !audit.exact
      && audit.classification === 'EXACT_TWO_SEAM_RECOVERY_FORBIDDEN_BY_FINITE_CUSTODY_LOWER_BOUND',
    rectangle,
    audit,
  });
}

function capacityWithoutInjectivityHostile() {
  const rectangle = predictedTwoSeamRectangle(0, 1, 1, 0);
  const rows = rectangle.rows.map((row, index) => freeze({
    seam: row.seam,
    label: index === 2 ? 1 : index,
  }));
  const audit = auditTwoSeamCustodyScheme(0, 1, 1, 0, rows, 4);
  return freeze({
    passed: !audit.undersized
      && audit.required_alphabet_size === 4
      && audit.declared_alphabet_size === 4
      && audit.collisions.length === 1
      && !audit.exact
      && audit.classification === 'TWO_SEAM_CUSTODY_CAPACITY_OR_MAPPING_INSUFFICIENT_FOR_EXACT_RECOVERY',
    audit,
  });
}

function marginalHostile() {
  const a = 2;
  const m = 3;
  const n = 4;
  const f = 1;
  const second = marginalSecondSeamFiber(a, m, n, f, 2);
  const first = marginalFirstSeamFiber(a, m, n, f, 3);
  return freeze({
    passed: second.status === 'EXACT_SECOND_SEAM_MARGINAL_FIBER_DERIVED'
      && second.cardinality === n + 1
      && first.status === 'EXACT_FIRST_SEAM_MARGINAL_FIBER_DERIVED'
      && first.cardinality === m + 1,
    second,
    first,
  });
}

function powerAlignedHostile() {
  const rows = [];
  for (let p = 0; p <= 6; p += 1) {
    for (let q = 0; q <= 6; q += 1) {
      const witness = powerAlignedTwoSeamWitness(p, q);
      rows.push(freeze({ p, q, witness, passed: witness.status === 'POWER_ALIGNED_TWO_SEAM_ADDITIVE_WIDTH_WITNESS_DERIVED' }));
    }
  }
  return freeze({ passed: rows.every((row) => row.passed), rows: freeze(rows) });
}

function zeroRunEdgeHostile() {
  const rows = [
    freeze({ m: 0, n: 0, expected: 1 }),
    freeze({ m: 0, n: 5, expected: 6 }),
    freeze({ m: 4, n: 0, expected: 5 }),
  ].map((row) => {
    const rectangle = predictedTwoSeamRectangle(1, row.m, row.n, 2);
    const literal = enumerateLiteralOneOneOneSplits(1, row.m, row.n, 2);
    return freeze({
      ...row,
      rectangle,
      literal,
      passed: rectangle.cardinality === row.expected && literal.cardinality === row.expected,
    });
  });
  return freeze({ passed: rows.every((row) => row.passed), rows: freeze(rows) });
}

function flattenedWordSeamImpersonationHostile() {
  const target = exactThreeTWord(0, 2, 3, 0);
  const rectangle = predictedTwoSeamRectangle(0, 2, 3, 0);
  const allSameWord = rectangle.rows.every((row) => sameWord(row.concatenated, target.word));
  const distinctSeams = new Set(rectangle.rows.map((row) => keyOf(row.seam))).size;
  return freeze({
    passed: target.status === 'TWO_SEAM_EXACT_THREE_T_WORD_DERIVED'
      && rectangle.cardinality === 12
      && allSameWord
      && distinctSeams === 12,
    target,
    rectangle,
    classification: allSameWord && distinctSeams > 1
      ? 'EXACT_FLATTENED_WORD_FORBIDDEN_FROM_IMPERSONATING_UNIQUE_TWO_SEAM_CUSTODY'
      : 'UNCLASSIFIED',
  });
}

export function runTwoSeamFactorizationRectangleChamber() {
  const symbolicRectangle = symbolicRectangleCertificate();
  const symbolicState = symbolicProductStateCertificate();
  const symbolicCustody = symbolicCustodyCertificate();
  const finiteEnumeration = finiteEnumerationCorroboration();
  const undersized = undersizedAlphabetHostile();
  const capacityCollision = capacityWithoutInjectivityHostile();
  const marginals = marginalHostile();
  const powerAligned = powerAlignedHostile();
  const zeroRuns = zeroRunEdgeHostile();
  const flattenedImpersonation = flattenedWordSeamImpersonationHostile();

  const certificates = freeze({
    symbolic_rectangle: symbolicRectangle,
    symbolic_product_state_invariance: symbolicState,
    symbolic_custody: symbolicCustody,
    finite_literal_enumeration: finiteEnumeration,
    undersized_alphabet_hostile: undersized,
    capacity_without_injectivity_hostile: capacityCollision,
    marginal_seam_hostile: marginals,
    power_aligned_width_hostile: powerAligned,
    zero_run_edge_hostile: zeroRuns,
    flattened_word_seam_impersonation_hostile: flattenedImpersonation,
  });
  const passed = Object.values(certificates).every((certificate) => certificate.passed);

  return freeze({
    schema: TWO_SEAM_FACTORIZATION_RECTANGLE_SCHEMA,
    parent_receipt: TWO_SEAM_FACTORIZATION_RECTANGLE_PARENT_RECEIPT,
    gate_issue: TWO_SEAM_FACTORIZATION_RECTANGLE_GATE_ISSUE,
    status: passed
      ? 'TWO_SEAM_FACTORIZATION_RECTANGLE_CHAMBER_PASSED'
      : 'TWO_SEAM_FACTORIZATION_RECTANGLE_CHAMBER_FAILED',
    passed,
    certificates,
    canonical_candidate: passed
      ? 'THE_ORDERED_1_PLUS_1_PLUS_1_FACTORIZATION_FIBER_OF_Q^a_T_Q^m_T_Q^n_T_Q^f_IS_EXACTLY_THE_RECTANGLE_0_DOT_DOT_m_CROSS_0_DOT_DOT_n_WITH_CARDINALITY_(m+1)(n+1)'
      : 'UNCLASSIFIED',
    consequential_candidate: passed
      ? 'TWO_ERASED_DECLARED_SEAMS_CAN_MULTIPLY_EXACT_BOUNDARY_AMBIGUITY_EVEN_WHEN_THE_COMPLETE_FLATTENED_AUTHORED_WORD_AND_FIRST_MOMENT_STATE_ARE_PRESERVED'
      : 'UNCLASSIFIED',
    architectural_candidate: passed
      ? 'MULTI_SEAM_CUSTODY_IS_A_SEPARATE_COMPOSITION_RESOURCE_AND_POWER_ALIGNED_SEAM_WIDTHS_ADD_EXACTLY_FOR_JOINT_RECOVERY'
      : 'UNCLASSIFIED',
    landing: freeze({
      flattening_preserves_order_but_can_erase_segmentation: true,
      multiple_erased_seams_can_multiply_lawful_segmentation_ambiguity: true,
      exact_multi_seam_claims_require_witnessed_seam_custody: true,
      no_arbitrary_depth_promotion: true,
    }),
  });
}

export default runTwoSeamFactorizationRectangleChamber;
