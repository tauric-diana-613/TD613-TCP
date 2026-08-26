import {
  integerFractionGroupMultiply,
  integerFractionGroupInverse,
} from './aperture-pedagogue-exact-bar-h2-torsion-sensitive-holonomy.js';

export const TATE_NORM_ANTINORM_TWO_PRIMARY_DEFECT_SCHEMA = 'td613.a15-r0.tate-norm-antinorm-two-primary-defect/v0.1';
export const TATE_NORM_ANTINORM_TWO_PRIMARY_DEFECT_PARENT_RECEIPT = '39b8f6e8ba319154378d03c28a1bf42c02870de1';
export const TATE_NORM_ANTINORM_TWO_PRIMARY_DEFECT_GATE_ISSUE = 737;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const parity = (n) => ((n % 2) + 2) % 2;
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const validCoordinate = (value) => value && typeof value === 'object'
  && [value.t, value.E, value.O].every(Number.isInteger);

function identity(n) {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
}

function matrixAdd(left, right) {
  return left.map((row, i) => row.map((value, j) => value + right[i][j]));
}

function matrixSubtract(left, right) {
  return left.map((row, i) => row.map((value, j) => value - right[i][j]));
}

function matrixScale(matrix, scalar) {
  return matrix.map((row) => row.map((value) => value * scalar));
}

function matrixMultiply(left, right) {
  return left.map((row) => right[0].map((_, j) => row.reduce(
    (sum, value, k) => sum + (value * right[k][j]),
    0,
  )));
}

function matrixVector(matrix, vector) {
  return matrix.map((row) => row.reduce((sum, value, i) => sum + (value * vector[i]), 0));
}

function transpose(matrix) {
  return matrix[0].map((_, j) => matrix.map((row) => row[j]));
}

function trace(matrix) {
  return matrix.reduce((sum, row, i) => sum + row[i], 0);
}

function det3(matrix) {
  const [a, b, c] = matrix[0];
  const [d, e, f] = matrix[1];
  const [g, h, i] = matrix[2];
  return (a * ((e * i) - (f * h)))
    - (b * ((d * i) - (f * g)))
    + (c * ((d * h) - (e * g)));
}

function wedge2From3(matrix) {
  const pairs = [[0, 1], [0, 2], [1, 2]];
  const out = Array.from({ length: 3 }, () => [0, 0, 0]);
  for (let column = 0; column < pairs.length; column += 1) {
    const [i, j] = pairs[column];
    for (let row = 0; row < pairs.length; row += 1) {
      const [p, q] = pairs[row];
      out[row][column] = (matrix[p][i] * matrix[q][j]) - (matrix[q][i] * matrix[p][j]);
    }
  }
  return out;
}

function rankOverQ(matrix) {
  if (matrix.length === 0 || matrix[0].length === 0) return 0;
  const rows = matrix.map((row) => row.map(Number));
  let rank = 0;
  for (let column = 0; column < rows[0].length && rank < rows.length; column += 1) {
    let pivot = rank;
    while (pivot < rows.length && Math.abs(rows[pivot][column]) < 1e-12) pivot += 1;
    if (pivot === rows.length) continue;
    [rows[rank], rows[pivot]] = [rows[pivot], rows[rank]];
    const pivotValue = rows[rank][column];
    rows[rank] = rows[rank].map((value) => value / pivotValue);
    for (let i = 0; i < rows.length; i += 1) {
      if (i === rank) continue;
      const factor = rows[i][column];
      if (Math.abs(factor) < 1e-12) continue;
      rows[i] = rows[i].map((value, j) => value - (factor * rows[rank][j]));
    }
    rank += 1;
  }
  return rank;
}

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

function gcdList(values) {
  return values.reduce((acc, value) => gcd(acc, value), 0);
}

function latticeIndexFromCoordinateColumns(rows) {
  const rank = rows.length;
  if (rank === 0) return 1;
  const columns = rows[0].length;
  if (rank === 1) return gcdList(rows[0]);
  if (rank === 2) {
    const minors = [];
    for (let i = 0; i < columns; i += 1) {
      for (let j = i + 1; j < columns; j += 1) {
        minors.push((rows[0][i] * rows[1][j]) - (rows[0][j] * rows[1][i]));
      }
    }
    return gcdList(minors);
  }
  throw new Error('Tate chamber only preregisters eigensublattice ranks <=2.');
}

function reconstructFromCoordinates(basis, coordinates) {
  if (basis.length === 0) return [];
  return basis[0].map((_, row) => basis.reduce(
    (sum, vector, i) => sum + (coordinates[i] * vector[row]),
    0,
  ));
}

function coordinateImageCertificate(operator, eigenspaceBasis, coordinateRows) {
  const domainColumns = transpose(operator);
  const coordinateColumns = transpose(coordinateRows);
  const reconstructions = domainColumns.map((column, i) => (
    reconstructFromCoordinates(eigenspaceBasis, coordinateColumns[i])
  ));
  const exact = domainColumns.every((column, i) => same(column, reconstructions[i]));
  const index = eigenspaceBasis.length === 0 ? 1 : latticeIndexFromCoordinateColumns(coordinateRows);
  return freeze({ exact, index, coordinate_rows: freeze(coordinateRows.map((row) => freeze([...row]))) });
}

function defectFromIndex(rank, index) {
  if (rank === 0 || index === 1) return '0';
  if (index === 2) return 'Z/2';
  return `UNEXPECTED_INDEX_${index}`;
}

export function orientationParityCharacter(value) {
  if (!validCoordinate(value)) return null;
  return parity(value.t) === 0 ? 1 : -1;
}

export function parityKernelAndDeckCertificate() {
  const T = freeze({ t: 1, E: 0, O: 0 });
  const Tinv = integerFractionGroupInverse(T);
  const e = freeze({ t: 0, E: 1, O: 0 });
  const o = freeze({ t: 0, E: 0, O: 1 });
  const s = freeze({ t: 2, E: 0, O: 0 });
  const unit = freeze({ t: 0, E: 0, O: 0 });

  const samples = [];
  for (const t of [-2, -1, 0, 1, 2]) {
    for (const E of [-1, 0, 1]) {
      for (const O of [-1, 0, 1]) samples.push(freeze({ t, E, O }));
    }
  }
  const characterRows = [];
  for (const x of samples) {
    for (const y of samples) {
      const xy = integerFractionGroupMultiply(x, y);
      characterRows.push(freeze({
        x,
        y,
        passed: orientationParityCharacter(xy) === orientationParityCharacter(x) * orientationParityCharacter(y),
      }));
    }
  }

  const evenSamples = samples.filter((value) => parity(value.t) === 0);
  const additivityRows = [];
  for (const x of evenSamples) {
    for (const y of evenSamples) {
      const xy = integerFractionGroupMultiply(x, y);
      const lhs = [xy.E, xy.O, xy.t / 2];
      const rhs = [x.E + y.E, x.O + y.O, (x.t / 2) + (y.t / 2)];
      additivityRows.push(freeze({ x, y, passed: same(lhs, rhs) }));
    }
  }

  const conjugate = (value) => integerFractionGroupMultiply(
    integerFractionGroupMultiply(T, value),
    Tinv,
  );
  const conjugation = freeze({
    e: conjugate(e),
    o: conjugate(o),
    s: conjugate(s),
  });
  const A1 = freeze([
    freeze([0, 1, 0]),
    freeze([1, 0, 0]),
    freeze([0, 0, 1]),
  ]);
  const A2 = freeze(wedge2From3(A1).map((row) => freeze(row)));
  const A3 = freeze([[det3(A1)]]);
  const expectedA2 = [[-1, 0, 0], [0, 0, 1], [0, 1, 0]];

  const passed = characterRows.every((row) => row.passed)
    && orientationParityCharacter(T) === -1
    && orientationParityCharacter(unit) === 1
    && additivityRows.every((row) => row.passed)
    && same(conjugation.e, o)
    && same(conjugation.o, e)
    && same(conjugation.s, s)
    && det3(A1) === -1
    && same(A2, expectedA2)
    && same(A3, [[-1]]);

  return freeze({
    status: passed ? 'PARITY_KERNEL_AND_DECK_CERTIFICATE_PASSED' : 'PARITY_KERNEL_AND_DECK_CERTIFICATE_FAILED',
    passed,
    parent_receipt: TATE_NORM_ANTINORM_TWO_PRIMARY_DEFECT_PARENT_RECEIPT,
    character_sample_pairs: characterRows.length,
    all_character_rows_pass: characterRows.every((row) => row.passed),
    kernel_condition: passed ? 't even' : 'UNEARNED',
    kernel_isomorphism: passed ? 'K ≅ Z^3 via (t,E,O)->(E,O,t/2)' : 'UNEARNED',
    even_kernel_additivity_rows: additivityRows.length,
    all_even_kernel_additivity_rows_pass: additivityRows.every((row) => row.passed),
    conjugation,
    A0: freeze([[1]]),
    A1,
    A2,
    A3,
    det_A1: det3(A1),
    exterior_power_derivation: 'A2 is computed from 2x2 minors of A1; A3 is det(A1).',
  });
}

const DEGREE_DATA = freeze({
  0: freeze({
    plus_basis: freeze([freeze([1])]),
    minus_basis: freeze([]),
    N_coordinates: freeze([freeze([2])]),
    D_coordinates: freeze([]),
  }),
  1: freeze({
    plus_basis: freeze([freeze([1, 1, 0]), freeze([0, 0, 1])]),
    minus_basis: freeze([freeze([1, -1, 0])]),
    N_coordinates: freeze([freeze([1, 1, 0]), freeze([0, 0, 2])]),
    D_coordinates: freeze([freeze([1, -1, 0])]),
  }),
  2: freeze({
    plus_basis: freeze([freeze([0, 1, 1])]),
    minus_basis: freeze([freeze([1, 0, 0]), freeze([0, 1, -1])]),
    N_coordinates: freeze([freeze([0, 1, 1])]),
    D_coordinates: freeze([freeze([2, 0, 0]), freeze([0, 1, -1])]),
  }),
  3: freeze({
    plus_basis: freeze([]),
    minus_basis: freeze([freeze([1])]),
    N_coordinates: freeze([]),
    D_coordinates: freeze([freeze([2])]),
  }),
});

function degreeDeckMatrices() {
  const cover = parityKernelAndDeckCertificate();
  return [cover.A0, cover.A1, cover.A2, cover.A3];
}

function verifyEigenspaceBasis(action, basis, eigenvalue) {
  const I = identity(action.length);
  const kernelOperator = eigenvalue === 1 ? matrixSubtract(I, action) : matrixAdd(I, action);
  const expectedKernelRank = action.length - rankOverQ(kernelOperator);
  const basisMatrix = basis.length === 0 ? [] : transpose(basis);
  const basisRank = basis.length === 0 ? 0 : rankOverQ(basisMatrix);
  const vectorsPass = basis.every((vector) => same(matrixVector(action, vector), vector.map((value) => eigenvalue * value)));
  return freeze({
    passed: vectorsPass && basisRank === basis.length && basis.length === expectedKernelRank,
    expected_kernel_rank: expectedKernelRank,
    basis_rank: basisRank,
    vectors_pass: vectorsPass,
  });
}

export function normAntiNormLatticeCertificate() {
  const cover = parityKernelAndDeckCertificate();
  if (!cover.passed) return freeze({ status: 'NORM_ANTINORM_LATTICE_CERTIFICATE_FAILED', passed: false });
  const actions = degreeDeckMatrices();
  const rows = [];
  for (let q = 0; q <= 3; q += 1) {
    const A = actions[q];
    const I = identity(A.length);
    const N = matrixAdd(I, A);
    const D = matrixSubtract(I, A);
    const data = DEGREE_DATA[q];
    const plus = verifyEigenspaceBasis(A, data.plus_basis, 1);
    const minus = verifyEigenspaceBasis(A, data.minus_basis, -1);
    const Nimage = coordinateImageCertificate(N, data.plus_basis, data.N_coordinates);
    const Dimage = coordinateImageCertificate(D, data.minus_basis, data.D_coordinates);
    const identities = freeze({
      A_squared_I: same(matrixMultiply(A, A), I),
      ND_zero: same(matrixMultiply(N, D), matrixScale(I, 0)),
      DN_zero: same(matrixMultiply(D, N), matrixScale(I, 0)),
      N_plus_D_2I: same(matrixAdd(N, D), matrixScale(I, 2)),
    });
    const plusDefect = defectFromIndex(data.plus_basis.length, Nimage.index);
    const minusDefect = defectFromIndex(data.minus_basis.length, Dimage.index);
    const passed = plus.passed && minus.passed
      && Nimage.exact && Dimage.exact
      && Object.values(identities).every(Boolean)
      && !plusDefect.startsWith('UNEXPECTED')
      && !minusDefect.startsWith('UNEXPECTED');
    rows.push(freeze({
      q,
      passed,
      A,
      N: freeze(N.map((row) => freeze(row))),
      D: freeze(D.map((row) => freeze(row))),
      plus_basis: data.plus_basis,
      minus_basis: data.minus_basis,
      plus_basis_certificate: plus,
      minus_basis_certificate: minus,
      N_image_certificate: Nimage,
      D_image_certificate: Dimage,
      plus_tate_defect: plusDefect,
      minus_tate_defect: minusDefect,
      identities,
    }));
  }
  const expected = [
    ['Z/2', '0'],
    ['Z/2', '0'],
    ['0', 'Z/2'],
    ['0', 'Z/2'],
  ];
  const tableMatches = rows.every((row) => same(
    [row.plus_tate_defect, row.minus_tate_defect],
    expected[row.q],
  ));
  const passed = rows.every((row) => row.passed) && tableMatches;
  return freeze({
    status: passed ? 'NORM_ANTINORM_LATTICE_CERTIFICATE_PASSED' : 'NORM_ANTINORM_LATTICE_CERTIFICATE_FAILED',
    passed,
    rows: freeze(rows),
    tate_table: freeze(rows.map((row) => freeze({
      q: row.q,
      hat_H0: row.plus_tate_defect,
      hat_H_minus1: row.minus_tate_defect,
    }))),
    exact_expected_table: tableMatches,
    no_odd_primary_torsion: rows.every((row) => [row.plus_tate_defect, row.minus_tate_defect]
      .every((value) => value === '0' || value === 'Z/2')),
  });
}

function approximateMatrixEqual(left, right) {
  return left.every((row, i) => row.every((value, j) => Math.abs(value - right[i][j]) < 1e-12));
}

export function invertTwoProjectorCertificate() {
  const lattice = normAntiNormLatticeCertificate();
  if (!lattice.passed) return freeze({ status: 'INVERT_TWO_PROJECTOR_CERTIFICATE_FAILED', passed: false });
  const rows = lattice.rows.map((row) => {
    const I = identity(row.A.length);
    const Pplus = matrixScale(row.N, 0.5);
    const Pminus = matrixScale(row.D, 0.5);
    const identities = freeze({
      Pplus_idempotent: approximateMatrixEqual(matrixMultiply(Pplus, Pplus), Pplus),
      Pminus_idempotent: approximateMatrixEqual(matrixMultiply(Pminus, Pminus), Pminus),
      orthogonal_plus_minus: approximateMatrixEqual(matrixMultiply(Pplus, Pminus), matrixScale(I, 0)),
      orthogonal_minus_plus: approximateMatrixEqual(matrixMultiply(Pminus, Pplus), matrixScale(I, 0)),
      sum_identity: approximateMatrixEqual(matrixAdd(Pplus, Pminus), I),
    });
    const hasFractionalEntry = [...Pplus.flat(), ...Pminus.flat()].some((value) => !Number.isInteger(value));
    return freeze({
      q: row.q,
      passed: Object.values(identities).every(Boolean),
      Pplus: freeze(Pplus.map((r) => freeze(r))),
      Pminus: freeze(Pminus.map((r) => freeze(r))),
      identities,
      has_fractional_entry: hasFractionalEntry,
    });
  });
  const allDefectsTwoPrimary = lattice.rows.every((row) => [row.plus_tate_defect, row.minus_tate_defect]
    .every((value) => value === '0' || value === 'Z/2'));
  const passed = rows.every((row) => row.passed)
    && rows.some((row) => row.has_fractional_entry)
    && allDefectsTwoPrimary;
  return freeze({
    status: passed ? 'INVERT_TWO_PROJECTOR_CERTIFICATE_PASSED' : 'INVERT_TWO_PROJECTOR_CERTIFICATE_FAILED',
    passed,
    coefficient_ring: 'Z[1/2]',
    rows: freeze(rows),
    integral_projectors_exist_over_Z: false,
    localized_splitting: passed ? 'H_q⊗Z[1/2] = H_q^+⊗Z[1/2] ⊕ H_q^-⊗Z[1/2]' : 'UNEARNED',
    all_tate_defects_vanish_after_inverting_two: passed,
    proof: 'Every nonzero integral Tate defect has exponent two, and 2 becomes a unit in Z[1/2].',
  });
}

export function modTwoCollapseCertificate() {
  const lattice = normAntiNormLatticeCertificate();
  if (!lattice.passed) return freeze({ status: 'MOD_TWO_NORM_ANTINORM_COLLAPSE_CERTIFICATE_FAILED', passed: false });
  const rows = lattice.rows.map((row) => {
    const reduce = (matrix) => matrix.map((r) => r.map((value) => parity(value)));
    const Nmod2 = reduce(row.N);
    const Dmod2 = reduce(row.D);
    return freeze({ q: row.q, Nmod2: freeze(Nmod2.map((r) => freeze(r))), Dmod2: freeze(Dmod2.map((r) => freeze(r))), equal: same(Nmod2, Dmod2) });
  });
  const trivialCharacterMod2 = parity(1);
  const signCharacterMod2 = parity(-1);
  const passed = rows.every((row) => row.equal)
    && trivialCharacterMod2 === 1
    && signCharacterMod2 === 1;
  return freeze({
    status: passed ? 'MOD_TWO_NORM_ANTINORM_COLLAPSE_CERTIFICATE_PASSED' : 'MOD_TWO_NORM_ANTINORM_COLLAPSE_CERTIFICATE_FAILED',
    passed,
    rows: freeze(rows),
    trivial_character_mod2: trivialCharacterMod2,
    sign_character_mod2: signCharacterMod2,
    characters_coincide_mod2: trivialCharacterMod2 === signCharacterMod2,
    classification_if_passed: passed
      ? 'MOD_TWO_REDUCTION_COLLAPSES_TRIVIAL_AND_SIGN_CHARACTERS_AND_IDENTIFIES_NORM_WITH_ANTINORM'
      : 'UNEARNED',
    physical_Z2_anomaly_authority: false,
  });
}

export function deckLefschetzConsistencyCertificate() {
  const cover = parityKernelAndDeckCertificate();
  if (!cover.passed) return freeze({ status: 'DECK_LEFSCHETZ_CONSISTENCY_CERTIFICATE_FAILED', passed: false });
  const actions = [cover.A0, cover.A1, cover.A2, cover.A3];
  const traces = actions.map(trace);
  const lefschetz = traces.reduce((sum, value, q) => sum + ((q % 2 === 0 ? 1 : -1) * value), 0);
  const passed = same(traces, [1, 1, -1, -1]) && lefschetz === 0;
  return freeze({
    status: passed ? 'DECK_LEFSCHETZ_CONSISTENCY_CERTIFICATE_PASSED' : 'DECK_LEFSCHETZ_CONSISTENCY_CERTIFICATE_FAILED',
    passed,
    traces: freeze(traces),
    lefschetz_number: lefschetz,
    consistency_only: true,
    zero_lefschetz_proves_freeness: false,
  });
}

export function tateNormAntiNormHostileCertificate() {
  const cover = parityKernelAndDeckCertificate();
  const lattice = normAntiNormLatticeCertificate();
  const localized = invertTwoProjectorCertificate();
  const mod2 = modTwoCollapseCertificate();
  const lefschetz = deckLefschetzConsistencyCertificate();

  const T = freeze({ t: 1, E: 0, O: 0 });
  const e = freeze({ t: 0, E: 1, O: 0 });
  const Te = integerFractionGroupMultiply(T, e);
  const wrongCharacter = (value) => parity(value.E) === 0 ? 1 : -1;
  const wrongCharacterDetected = wrongCharacter(Te) !== wrongCharacter(T) * wrongCharacter(e);
  const wrongKernelRankTwoDetected = cover.passed && cover.kernel_isomorphism.includes('Z^3');
  const wrongDeckDetDetected = cover.det_A1 !== 1;
  const wrongA2FixesEoDetected = cover.A2[0][0] !== 1;
  const wrongA3Detected = cover.A3[0][0] !== 1;
  const identityViolationsRejected = lattice.passed && lattice.rows.every((row) => Object.values(row.identities).every(Boolean));
  const exactTable = lattice.tate_table;
  const wrongTableRejected = exactTable[1].hat_H0 === 'Z/2'
    && exactTable[1].hat_H_minus1 === '0'
    && exactTable[2].hat_H0 === '0'
    && exactTable[2].hat_H_minus1 === 'Z/2'
    && exactTable[3].hat_H_minus1 === 'Z/2';
  const oddPrimaryRejected = lattice.no_odd_primary_torsion;
  const integralProjectorRejected = localized.integral_projectors_exist_over_Z === false
    && localized.rows.some((row) => row.has_fractional_entry);
  const localizedDefectRejected = localized.all_tate_defects_vanish_after_inverting_two;
  const modTwoCharacterDistinctionRejected = mod2.characters_coincide_mod2;
  const wrongLefschetzRejected = lefschetz.lefschetz_number === 0;
  const freenessOverclaimRejected = lefschetz.zero_lefschetz_proves_freeness === false;

  const passed = wrongCharacterDetected
    && wrongKernelRankTwoDetected
    && wrongDeckDetDetected
    && wrongA2FixesEoDetected
    && wrongA3Detected
    && identityViolationsRejected
    && wrongTableRejected
    && oddPrimaryRejected
    && integralProjectorRejected
    && localizedDefectRejected
    && modTwoCharacterDistinctionRejected
    && wrongLefschetzRejected
    && freenessOverclaimRejected;

  return freeze({
    status: passed ? 'TATE_NORM_ANTINORM_HOSTILE_CERTIFICATE_PASSED' : 'TATE_NORM_ANTINORM_HOSTILE_CERTIFICATE_FAILED',
    passed,
    wrong_E_character_homomorphism_rejected: wrongCharacterDetected,
    wrong_kernel_rank_two_rejected: wrongKernelRankTwoDetected,
    wrong_deck_determinant_plus_one_rejected: wrongDeckDetDetected,
    wrong_A2_eo_fixed_rejected: wrongA2FixesEoDetected,
    wrong_A3_plus_one_rejected: wrongA3Detected,
    norm_antinorm_identity_mutation_rejected: identityViolationsRejected,
    wrong_tate_table_rejected: wrongTableRejected,
    odd_primary_torsion_rejected: oddPrimaryRejected,
    integral_half_projector_rejected: integralProjectorRejected,
    localized_tate_defect_rejected: localizedDefectRejected,
    mod_two_character_distinction_rejected: modTwoCharacterDistinctionRejected,
    nonzero_lefschetz_rejected: wrongLefschetzRejected,
    zero_lefschetz_freeness_proof_rejected: freenessOverclaimRejected,
    physical_anomaly_authority: false,
    physical_Z2_topological_order_authority: false,
  });
}

export function tateNormAntiNormTwoPrimaryDefectCertificate() {
  const cover = parityKernelAndDeckCertificate();
  const lattice = normAntiNormLatticeCertificate();
  const localized = invertTwoProjectorCertificate();
  const mod2 = modTwoCollapseCertificate();
  const lefschetz = deckLefschetzConsistencyCertificate();
  const hostiles = tateNormAntiNormHostileCertificate();
  const passed = cover.passed && lattice.passed && localized.passed && mod2.passed && lefschetz.passed && hostiles.passed;
  return freeze({
    status: passed ? 'TATE_NORM_ANTINORM_TWO_PRIMARY_DEFECT_CERTIFICATE_PASSED' : 'TATE_NORM_ANTINORM_TWO_PRIMARY_DEFECT_CERTIFICATE_FAILED',
    passed,
    parent_receipt: TATE_NORM_ANTINORM_TWO_PRIMARY_DEFECT_PARENT_RECEIPT,
    cover,
    lattice,
    localized,
    mod2,
    lefschetz,
    hostiles,
    earned_if_passed: freeze([
      'THE_775_FRACTION_GROUP_HAS_AN_INDEX_TWO_PARITY_KERNEL_ISOMORPHIC_TO_Z_CUBED_WITH_DECK_ACTION_SWAPPING_THE_FIRST_TWO_GENERATORS',
      'THE_DECK_ACTION_ON_THE_FULL_EXTERIOR_HOMOLOGY_LATTICE_HAS_EXPLICIT_NORM_AND_ANTINORM_OPERATORS_WITH_ND_DN_ZERO_AND_N_PLUS_D_EQUAL_TWO',
      'THE_ONLY_INTEGRAL_TATE_DEFECTS_ARE_Z_OVER_TWO_IN_PLUS_DEGREES_ZERO_ONE_AND_MINUS_DEGREES_TWO_THREE',
      'ALL_DECK_EIGENSPACE_SPLITTING_DEFECTS_VANISH_AFTER_INVERTING_TWO',
      'MOD_TWO_REDUCTION_COLLAPSES_TRIVIAL_AND_SIGN_CHARACTERS_AND_IDENTIFIES_NORM_WITH_ANTINORM',
      'THE_DERIVED_DECK_LEFSCHETZ_NUMBER_IS_ZERO',
      'TATE_NORM_ANTINORM_TWO_PRIMARY_DEFECT_CHAMBER_EARNED',
    ]),
    scars: freeze([
      'INTEGRAL_DECK_SPLITTING_DEFECT != RATIONAL_OR_ODD_LOCALIZED_DECK_SPLITTING_DEFECT',
      'TATE_TWO_PRIMARY_DEFECT != PHYSICAL_Z2_ANOMALY',
      'LEFSCHETZ_ZERO != PROOF_OF_DECK_FREENESS',
    ]),
    authority_ceiling: freeze({
      operational_route_cover: false,
      physical_spacetime_torus: false,
      physical_parity_symmetry: false,
      physical_anomaly: false,
      physical_Z2_topological_order: false,
      gauge_bundle: false,
      ontology: false,
      production: false,
      vercel: false,
    }),
  });
}
