import {
  TATE_NORM_ANTINORM_TWO_PRIMARY_DEFECT_PARENT_RECEIPT,
  parityKernelAndDeckCertificate,
} from './aperture-pedagogue-tate-norm-antinorm-two-primary-defect.js';

export const TATE_CORRECTION_001_SCHEMA = 'td613.a15-r0.tate-norm-antinorm-two-primary-defect/correction-001';

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const parity = (n) => ((n % 2) + 2) % 2;
const I = (n) => Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => (r === c ? 1 : 0)));
const add = (a, b) => a.map((row, r) => row.map((v, c) => v + b[r][c]));
const sub = (a, b) => a.map((row, r) => row.map((v, c) => v - b[r][c]));
const scale = (a, s) => a.map((row) => row.map((v) => v * s));
const mul = (a, b) => a.map((row) => b[0].map((_, c) => row.reduce((sum, v, k) => sum + v * b[k][c], 0)));
const mv = (a, v) => a.map((row) => row.reduce((sum, x, i) => sum + x * v[i], 0));
const transpose = (a) => a[0].map((_, c) => a.map((row) => row[c]));
const trace = (a) => a.reduce((sum, row, i) => sum + row[i], 0);

function rankQ(matrix) {
  if (matrix.length === 0 || matrix[0].length === 0) return 0;
  const a = matrix.map((row) => row.map(Number));
  let rank = 0;
  for (let c = 0; c < a[0].length && rank < a.length; c += 1) {
    let p = rank;
    while (p < a.length && Math.abs(a[p][c]) < 1e-12) p += 1;
    if (p === a.length) continue;
    [a[rank], a[p]] = [a[p], a[rank]];
    const d = a[rank][c];
    a[rank] = a[rank].map((x) => x / d);
    for (let r = 0; r < a.length; r += 1) {
      if (r === rank) continue;
      const f = a[r][c];
      if (Math.abs(f) < 1e-12) continue;
      a[r] = a[r].map((x, j) => x - f * a[rank][j]);
    }
    rank += 1;
  }
  return rank;
}

function gcd(a, b) {
  let x = Math.abs(a); let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}
const gcdList = (xs) => xs.reduce((acc, x) => gcd(acc, x), 0);

function latticeIndex(rows) {
  if (rows.length === 0) return 1;
  if (rows.length === 1) return gcdList(rows[0]);
  if (rows.length === 2) {
    const minors = [];
    for (let i = 0; i < rows[0].length; i += 1) {
      for (let j = i + 1; j < rows[0].length; j += 1) {
        minors.push(rows[0][i] * rows[1][j] - rows[0][j] * rows[1][i]);
      }
    }
    return gcdList(minors);
  }
  throw new Error('Correction 001 only needs eigensublattice rank <= 2.');
}

function reconstruct(basis, coords) {
  return basis[0].map((_, r) => basis.reduce((sum, vector, i) => sum + coords[i] * vector[r], 0));
}

function correctedImage(operator, basis, coordinateRows) {
  if (basis.length === 0) {
    const zero = operator.every((row) => row.every((v) => v === 0));
    return freeze({ exact: zero, index: 1, coordinate_rows: freeze([]), zero_rank_operator_zero: zero });
  }
  const domainColumns = transpose(operator);
  const coordinateColumns = transpose(coordinateRows);
  const exact = domainColumns.every((column, i) => same(column, reconstruct(basis, coordinateColumns[i])));
  return freeze({
    exact,
    index: latticeIndex(coordinateRows),
    coordinate_rows: freeze(coordinateRows.map((row) => freeze([...row]))),
    zero_rank_operator_zero: null,
  });
}

function eigenspace(action, basis, sign) {
  const op = sign === 1 ? sub(I(action.length), action) : add(I(action.length), action);
  const expected = action.length - rankQ(op);
  const basisRank = basis.length === 0 ? 0 : rankQ(transpose(basis));
  const vectors = basis.every((v) => same(mv(action, v), v.map((x) => sign * x)));
  return freeze({ passed: vectors && basisRank === basis.length && expected === basis.length, expected, basis_rank: basisRank, vectors });
}

const DATA = freeze({
  0: freeze({ plus: freeze([freeze([1])]), minus: freeze([]), Ncoords: freeze([freeze([2])]), Dcoords: freeze([]) }),
  1: freeze({ plus: freeze([freeze([1, 1, 0]), freeze([0, 0, 1])]), minus: freeze([freeze([1, -1, 0])]), Ncoords: freeze([freeze([1, 1, 0]), freeze([0, 0, 2])]), Dcoords: freeze([freeze([1, -1, 0])]) }),
  2: freeze({ plus: freeze([freeze([0, 1, 1])]), minus: freeze([freeze([1, 0, 0]), freeze([0, 1, -1])]), Ncoords: freeze([freeze([0, 1, 1])]), Dcoords: freeze([freeze([2, 0, 0]), freeze([0, 1, -1])]) }),
  3: freeze({ plus: freeze([]), minus: freeze([freeze([1])]), Ncoords: freeze([]), Dcoords: freeze([freeze([2])]) }),
});

const defect = (rank, index) => {
  if (rank === 0 || index === 1) return '0';
  if (index === 2) return 'Z/2';
  return `UNEXPECTED_INDEX_${index}`;
};

export function correctedNormAntiNormLatticeCertificate() {
  const cover = parityKernelAndDeckCertificate();
  if (!cover.passed) return freeze({ status: 'TATE_CORRECTION_001_LATTICE_FAILED', passed: false });
  const actions = [cover.A0, cover.A1, cover.A2, cover.A3];
  const expected = [['Z/2', '0'], ['Z/2', '0'], ['0', 'Z/2'], ['0', 'Z/2']];
  const rows = actions.map((A, q) => {
    const id = I(A.length); const N = add(id, A); const D = sub(id, A); const data = DATA[q];
    const plus = eigenspace(A, data.plus, 1); const minus = eigenspace(A, data.minus, -1);
    const nImage = correctedImage(N, data.plus, data.Ncoords); const dImage = correctedImage(D, data.minus, data.Dcoords);
    const ids = freeze({
      A2eqI: same(mul(A, A), id),
      ND0: same(mul(N, D), scale(id, 0)),
      DN0: same(mul(D, N), scale(id, 0)),
      NplusD2I: same(add(N, D), scale(id, 2)),
    });
    const plusDefect = defect(data.plus.length, nImage.index); const minusDefect = defect(data.minus.length, dImage.index);
    const passed = plus.passed && minus.passed && nImage.exact && dImage.exact
      && Object.values(ids).every(Boolean) && same([plusDefect, minusDefect], expected[q]);
    return freeze({ q, passed, A, N: freeze(N.map((r) => freeze(r))), D: freeze(D.map((r) => freeze(r))), plus_basis: data.plus, minus_basis: data.minus, plus, minus, N_image: nImage, D_image: dImage, hat_H0: plusDefect, hat_H_minus1: minusDefect, identities: ids });
  });
  const passed = rows.every((row) => row.passed);
  return freeze({
    status: passed ? 'TATE_CORRECTION_001_LATTICE_PASSED' : 'TATE_CORRECTION_001_LATTICE_FAILED',
    passed,
    rows: freeze(rows),
    table: freeze(rows.map((r) => freeze({ q: r.q, hat_H0: r.hat_H0, hat_H_minus1: r.hat_H_minus1 }))),
    zero_rank_cases: freeze({ degree0_minus: rows[0].D_image.zero_rank_operator_zero, degree3_plus: rows[3].N_image.zero_rank_operator_zero }),
    no_odd_primary_torsion: rows.every((r) => [r.hat_H0, r.hat_H_minus1].every((x) => x === '0' || x === 'Z/2')),
  });
}

function approx(a, b) { return a.every((row, r) => row.every((v, c) => Math.abs(v - b[r][c]) < 1e-12)); }

export function correctedInvertTwoProjectorCertificate() {
  const lattice = correctedNormAntiNormLatticeCertificate();
  if (!lattice.passed) return freeze({ status: 'TATE_CORRECTION_001_INVERT_TWO_FAILED', passed: false });
  const rows = lattice.rows.map((row) => {
    const id = I(row.A.length); const Pp = scale(row.N, 0.5); const Pm = scale(row.D, 0.5);
    const identities = freeze({
      Pp2: approx(mul(Pp, Pp), Pp), Pm2: approx(mul(Pm, Pm), Pm),
      PpPm0: approx(mul(Pp, Pm), scale(id, 0)), PmPp0: approx(mul(Pm, Pp), scale(id, 0)), sumI: approx(add(Pp, Pm), id),
    });
    return freeze({ q: row.q, passed: Object.values(identities).every(Boolean), identities, has_fractional_entry: [...Pp.flat(), ...Pm.flat()].some((x) => !Number.isInteger(x)) });
  });
  const passed = rows.every((r) => r.passed) && rows.some((r) => r.has_fractional_entry) && lattice.no_odd_primary_torsion;
  return freeze({ status: passed ? 'TATE_CORRECTION_001_INVERT_TWO_PASSED' : 'TATE_CORRECTION_001_INVERT_TWO_FAILED', passed, rows: freeze(rows), integral_projectors_over_Z: false, all_tate_defects_vanish_after_inverting_two: passed, localized_splitting: passed ? 'H_q⊗Z[1/2]=H_q^+⊗Z[1/2]⊕H_q^-⊗Z[1/2]' : 'UNEARNED' });
}

export function correctedModTwoCollapseCertificate() {
  const lattice = correctedNormAntiNormLatticeCertificate();
  if (!lattice.passed) return freeze({ status: 'TATE_CORRECTION_001_MOD2_FAILED', passed: false });
  const rows = lattice.rows.map((row) => {
    const reduce = (m) => m.map((r) => r.map((x) => parity(x)));
    const n = reduce(row.N); const d = reduce(row.D);
    return freeze({ q: row.q, equal: same(n, d), Nmod2: freeze(n.map((r) => freeze(r))), Dmod2: freeze(d.map((r) => freeze(r))) });
  });
  const passed = rows.every((r) => r.equal) && parity(1) === parity(-1);
  return freeze({ status: passed ? 'TATE_CORRECTION_001_MOD2_PASSED' : 'TATE_CORRECTION_001_MOD2_FAILED', passed, rows: freeze(rows), trivial_character_mod2: parity(1), sign_character_mod2: parity(-1), characters_coincide_mod2: parity(1) === parity(-1), physical_Z2_anomaly_authority: false });
}

export function correctedDeckLefschetzCertificate() {
  const cover = parityKernelAndDeckCertificate();
  if (!cover.passed) return freeze({ status: 'TATE_CORRECTION_001_LEFSCHETZ_FAILED', passed: false });
  const traces = [cover.A0, cover.A1, cover.A2, cover.A3].map(trace);
  const L = traces.reduce((sum, x, q) => sum + (q % 2 === 0 ? x : -x), 0);
  const passed = same(traces, [1, 1, -1, -1]) && L === 0;
  return freeze({ status: passed ? 'TATE_CORRECTION_001_LEFSCHETZ_PASSED' : 'TATE_CORRECTION_001_LEFSCHETZ_FAILED', passed, traces: freeze(traces), lefschetz_number: L, consistency_only: true, zero_lefschetz_proves_freeness: false });
}

export function correctedTateHostileCertificate() {
  const lattice = correctedNormAntiNormLatticeCertificate(); const inv = correctedInvertTwoProjectorCertificate(); const mod2 = correctedModTwoCollapseCertificate(); const lef = correctedDeckLefschetzCertificate(); const cover = parityKernelAndDeckCertificate();
  const passed = lattice.passed && inv.passed && mod2.passed && lef.passed
    && cover.det_A1 === -1 && cover.A2[0][0] === -1 && cover.A3[0][0] === -1
    && same(lattice.table, [{ q: 0, hat_H0: 'Z/2', hat_H_minus1: '0' }, { q: 1, hat_H0: 'Z/2', hat_H_minus1: '0' }, { q: 2, hat_H0: '0', hat_H_minus1: 'Z/2' }, { q: 3, hat_H0: '0', hat_H_minus1: 'Z/2' }])
    && inv.integral_projectors_over_Z === false && inv.all_tate_defects_vanish_after_inverting_two
    && mod2.characters_coincide_mod2 && lef.zero_lefschetz_proves_freeness === false;
  return freeze({ status: passed ? 'TATE_CORRECTION_001_HOSTILES_PASSED' : 'TATE_CORRECTION_001_HOSTILES_FAILED', passed, physical_anomaly_authority: false, physical_Z2_topological_order_authority: false });
}

export function correctedTateNormAntiNormTwoPrimaryDefectCertificate() {
  const cover = parityKernelAndDeckCertificate(); const lattice = correctedNormAntiNormLatticeCertificate(); const localized = correctedInvertTwoProjectorCertificate(); const mod2 = correctedModTwoCollapseCertificate(); const lefschetz = correctedDeckLefschetzCertificate(); const hostiles = correctedTateHostileCertificate();
  const passed = cover.passed && lattice.passed && localized.passed && mod2.passed && lefschetz.passed && hostiles.passed;
  return freeze({
    status: passed ? 'TATE_NORM_ANTINORM_TWO_PRIMARY_DEFECT_CORRECTION_001_PASSED' : 'TATE_NORM_ANTINORM_TWO_PRIMARY_DEFECT_CORRECTION_001_FAILED',
    passed,
    parent_receipt: TATE_NORM_ANTINORM_TWO_PRIMARY_DEFECT_PARENT_RECEIPT,
    correction: 'ZERO_RANK_EIGENSPACE_IMAGE_HANDLING', cover, lattice, localized, mod2, lefschetz, hostiles,
    earned_if_passed: freeze([
      'THE_775_FRACTION_GROUP_HAS_AN_INDEX_TWO_PARITY_KERNEL_ISOMORPHIC_TO_Z_CUBED_WITH_DECK_ACTION_SWAPPING_THE_FIRST_TWO_GENERATORS',
      'THE_DECK_ACTION_ON_THE_FULL_EXTERIOR_HOMOLOGY_LATTICE_HAS_EXPLICIT_NORM_AND_ANTINORM_OPERATORS_WITH_ND_DN_ZERO_AND_N_PLUS_D_EQUAL_TWO',
      'THE_ONLY_INTEGRAL_TATE_DEFECTS_ARE_Z_OVER_TWO_IN_PLUS_DEGREES_ZERO_ONE_AND_MINUS_DEGREES_TWO_THREE',
      'ALL_DECK_EIGENSPACE_SPLITTING_DEFECTS_VANISH_AFTER_INVERTING_TWO',
      'MOD_TWO_REDUCTION_COLLAPSES_TRIVIAL_AND_SIGN_CHARACTERS_AND_IDENTIFIES_NORM_WITH_ANTINORM',
      'THE_DERIVED_DECK_LEFSCHETZ_NUMBER_IS_ZERO',
      'TATE_NORM_ANTINORM_TWO_PRIMARY_DEFECT_CHAMBER_EARNED',
    ]),
    authority_ceiling: freeze({ operational_route_cover: false, physical_spacetime_torus: false, physical_parity_symmetry: false, physical_anomaly: false, physical_Z2_topological_order: false, ontology: false, production: false, vercel: false }),
  });
}
