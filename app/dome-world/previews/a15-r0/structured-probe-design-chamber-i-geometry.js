import {
  BASELINE_RELOCK_SHA,
  BASELINE_SOURCE_PACKET,
  CHAMBER_I_FIXTURE_ID,
  CYCLIC_LOCAL_BLOCKS,
  FANO_BLOCKS,
  RELATIONS,
  compileChamberICombinatorialReceipt
} from './structured-probe-design-chamber-i.js';

export const CHAMBER_I_OPERATOR_GEOMETRY_SCHEMA = 'td613.pedagogue.structured-probe-design.chamber-i-operator-geometry/v0.1';
const TOLERANCE = 1e-10;
const PERTURBATION_DELTA = 0.05;
const Z_STAR = Object.freeze([2, 3, 5, 7, 11, 13, 17]);
const H_SUM_STAR = 58;

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

function exactScienceHead(value) {
  const head = String(value ?? '').trim().toLowerCase();
  if (!/^[0-9a-f]{40}$/.test(head)) throw new TypeError('scienceHead must be an exact 40-character Git SHA');
  return head;
}

function round15(value) {
  if (value === null) return null;
  const rounded = Number(Number(value).toFixed(15));
  return Object.is(rounded, -0) ? 0 : rounded;
}

function finiteMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0]) || matrix[0].length === 0) {
    throw new TypeError('matrix must be non-empty and rectangular');
  }
  const width = matrix[0].length;
  return matrix.map((row, r) => {
    if (!Array.isArray(row) || row.length !== width) throw new TypeError('matrix must be rectangular');
    return row.map((value, c) => {
      if (!Number.isFinite(value)) throw new TypeError(`matrix[${r}][${c}] must be finite`);
      return Number(value);
    });
  });
}

function rref(matrix, tolerance = TOLERANCE) {
  const work = finiteMatrix(matrix).map((row) => [...row]);
  const pivots = [];
  let row = 0;
  for (let col = 0; col < work[0].length && row < work.length; col += 1) {
    let pivot = row;
    for (let r = row + 1; r < work.length; r += 1) {
      if (Math.abs(work[r][col]) > Math.abs(work[pivot][col])) pivot = r;
    }
    if (Math.abs(work[pivot][col]) <= tolerance) continue;
    [work[row], work[pivot]] = [work[pivot], work[row]];
    const divisor = work[row][col];
    for (let c = 0; c < work[row].length; c += 1) work[row][c] /= divisor;
    for (let r = 0; r < work.length; r += 1) {
      if (r === row) continue;
      const factor = work[r][col];
      if (Math.abs(factor) <= tolerance) continue;
      for (let c = 0; c < work[r].length; c += 1) work[r][c] -= factor * work[row][c];
    }
    pivots.push(col);
    row += 1;
  }
  return { matrix: work, pivots };
}

export function chamberIMatrixRank(matrix, tolerance = TOLERANCE) {
  return rref(matrix, tolerance).pivots.length;
}

export function chamberINullspaceBasis(matrix, tolerance = TOLERANCE) {
  const source = finiteMatrix(matrix);
  const { matrix: reduced, pivots } = rref(source, tolerance);
  const width = source[0].length;
  const pivotSet = new Set(pivots);
  const free = Array.from({ length: width }, (_, index) => index).filter((index) => !pivotSet.has(index));
  return deepFreeze(free.map((freeColumn) => {
    const vector = Array(width).fill(0);
    vector[freeColumn] = 1;
    pivots.forEach((pivotColumn, pivotRow) => {
      vector[pivotColumn] = -reduced[pivotRow][freeColumn];
    });
    const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
    const normalized = vector.map((value) => value / norm);
    const first = normalized.find((value) => Math.abs(value) > tolerance) ?? 0;
    const sign = first < 0 ? -1 : 1;
    return normalized.map((value) => round15(Math.abs(value) <= tolerance ? 0 : value * sign));
  }));
}

function transpose(matrix) {
  return matrix[0].map((_, column) => matrix.map((row) => row[column]));
}

function multiplyMatrices(left, right) {
  const rightT = transpose(right);
  return left.map((row) => rightT.map((column) => row.reduce((sum, value, index) => sum + value * column[index], 0)));
}

function multiplyMatrixVector(matrix, vector) {
  return matrix.map((row) => row.reduce((sum, value, index) => sum + value * vector[index], 0));
}

function symmetricEigenvaluesJacobi(matrix, tolerance = 1e-14, maxSweeps = 200) {
  const a = finiteMatrix(matrix).map((row) => [...row]);
  if (a.length !== a[0].length) throw new TypeError('Jacobi eigensolver requires a square matrix');
  const n = a.length;
  for (let sweep = 0; sweep < maxSweeps * n * n; sweep += 1) {
    let p = 0;
    let q = 1;
    let max = 0;
    for (let i = 0; i < n; i += 1) {
      for (let j = i + 1; j < n; j += 1) {
        const magnitude = Math.abs(a[i][j]);
        if (magnitude > max) {
          max = magnitude;
          p = i;
          q = j;
        }
      }
    }
    if (max <= tolerance) break;
    const app = a[p][p];
    const aqq = a[q][q];
    const apq = a[p][q];
    const theta = 0.5 * Math.atan2(2 * apq, aqq - app);
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    for (let k = 0; k < n; k += 1) {
      if (k === p || k === q) continue;
      const akp = a[k][p];
      const akq = a[k][q];
      a[k][p] = c * akp - s * akq;
      a[p][k] = a[k][p];
      a[k][q] = s * akp + c * akq;
      a[q][k] = a[k][q];
    }
    a[p][p] = c * c * app - 2 * s * c * apq + s * s * aqq;
    a[q][q] = s * s * app + 2 * s * c * apq + c * c * aqq;
    a[p][q] = 0;
    a[q][p] = 0;
  }
  return a.map((row, index) => row[index]).sort((x, y) => y - x);
}

export function chamberISingularValues(matrix) {
  const source = finiteMatrix(matrix);
  const gram = multiplyMatrices(transpose(source), source);
  return deepFreeze(symmetricEigenvaluesJacobi(gram)
    .map((value) => Math.sqrt(Math.max(0, Math.abs(value) <= 1e-13 ? 0 : value)))
    .sort((a, b) => b - a)
    .map(round15));
}

function solveSquareSystem(matrix, vector, tolerance = TOLERANCE) {
  const a = finiteMatrix(matrix).map((row, index) => [...row, Number(vector[index])]);
  if (a.length !== a[0].length - 1) throw new TypeError('solveSquareSystem requires a square matrix');
  const n = a.length;
  for (let col = 0; col < n; col += 1) {
    let pivot = col;
    for (let row = col + 1; row < n; row += 1) {
      if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row;
    }
    if (Math.abs(a[pivot][col]) <= tolerance) throw new Error('SINGULAR_OPERATOR_ABSTAIN');
    [a[col], a[pivot]] = [a[pivot], a[col]];
    for (let row = col + 1; row < n; row += 1) {
      const factor = a[row][col] / a[col][col];
      for (let c = col; c <= n; c += 1) a[row][c] -= factor * a[col][c];
    }
  }
  const x = Array(n).fill(0);
  for (let row = n - 1; row >= 0; row -= 1) {
    let rhs = a[row][n];
    for (let col = row + 1; col < n; col += 1) rhs -= a[row][col] * x[col];
    x[row] = rhs / a[row][row];
  }
  return x;
}

function l2Norm(vector) {
  return Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function chamberIMeasurementMatrix(blocks, { centered = false } = {}) {
  const raw = blocks.map((block) => RELATIONS.map((relation) => block.includes(relation) ? 1 : 0));
  if (!centered) return deepFreeze(raw);
  return deepFreeze(raw.map((row) => row.map((value) => round15(value - (3 / 7)))));
}

function perturbationFamily(matrix) {
  const y = multiplyMatrixVector(matrix, Z_STAR);
  const family = [];
  for (let coordinate = 0; coordinate < matrix.length; coordinate += 1) {
    for (const sign of [1, -1]) {
      const perturbation = Array(matrix.length).fill(0);
      perturbation[coordinate] = sign * PERTURBATION_DELTA;
      const zHat = solveSquareSystem(matrix, y.map((value, index) => value + perturbation[index]));
      const deltaZ = zHat.map((value, index) => value - Z_STAR[index]);
      family.push(deepFreeze({
        observation_coordinate: coordinate,
        sign,
        perturbation_l2: round15(l2Norm(perturbation)),
        reconstruction_error_l2: round15(l2Norm(deltaZ)),
        heldout_sum_error: round15(Math.abs(zHat.reduce((sum, value) => sum + value, 0) - H_SUM_STAR))
      }));
    }
  }
  const errors = family.map((item) => item.reconstruction_error_l2);
  const heldout = family.map((item) => item.heldout_sum_error);
  return deepFreeze({
    delta: PERTURBATION_DELTA,
    family,
    max_error_l2: round15(Math.max(...errors)),
    median_error_l2: round15(median(errors)),
    max_heldout_error: round15(Math.max(...heldout)),
    median_heldout_error: round15(median(heldout))
  });
}

export function computeChamberIOperatorGeometry(blocks, { centered = false } = {}) {
  const matrix = chamberIMeasurementMatrix(blocks, { centered });
  const rank = chamberIMatrixRank(matrix);
  const width = matrix[0].length;
  const nullity = width - rank;
  const singularValues = chamberISingularValues(matrix);
  const positive = singularValues.filter((value) => value > TOLERANCE);
  const sigmaMax = positive.length ? positive[0] : null;
  const sigmaMin = rank === width ? positive[positive.length - 1] : 0;
  const condition = rank === width ? sigmaMax / sigmaMin : null;
  const onesResidual = multiplyMatrixVector(matrix, Array(width).fill(1))
    .map((value) => Math.abs(value) <= TOLERANCE ? 0 : round15(value));
  return deepFreeze({
    measurement_matrix: matrix,
    rank,
    nullity,
    singular_values: singularValues,
    sigma_min: round15(sigmaMin),
    kappa_2: condition === null ? null : round15(condition),
    nullspace_witnesses: chamberINullspaceBasis(matrix),
    global_offset_residual: onesResidual,
    global_offset_annihilated: onesResidual.every((value) => Math.abs(value) <= TOLERANCE),
    perturbation_amplification_bound: rank === width ? round15(1 / sigmaMin) : null,
    perturbation_family: rank === width ? perturbationFamily(matrix) : null,
    heldout_sum_reconstruction: rank === width
      ? 'EVALUATED_UNDER_INVERTIBLE_OPERATOR'
      : 'ABSTAIN_UNIDENTIFIABLE_GLOBAL_OFFSET'
  });
}

export function compileChamberIOperatorGeometryReceipt({ scienceHead }) {
  const head = exactScienceHead(scienceHead);
  const structural = compileChamberICombinatorialReceipt({ scienceHead: head });
  const cyclic = computeChamberIOperatorGeometry(CYCLIC_LOCAL_BLOCKS);
  const fano = computeChamberIOperatorGeometry(FANO_BLOCKS);
  const centeredFano = computeChamberIOperatorGeometry(FANO_BLOCKS, { centered: true });
  const rawConditioningGain = fano.sigma_min > cyclic.sigma_min && fano.kappa_2 < cyclic.kappa_2;
  const hostileNullspace = centeredFano.rank === 6 && centeredFano.nullity === 1 && centeredFano.global_offset_annihilated;

  return deepFreeze({
    schema: CHAMBER_I_OPERATOR_GEOMETRY_SCHEMA,
    stage: 'CHAMBER_I_OPERATOR_GEOMETRY',
    science_head: head,
    baseline_source_packet: BASELINE_SOURCE_PACKET,
    baseline_relock_sha: BASELINE_RELOCK_SHA,
    fixture_id: CHAMBER_I_FIXTURE_ID,
    structural_receipt: structural,
    authored_state: [...Z_STAR],
    heldout_functional: { id: 'H_SUM', expected_value: H_SUM_STAR },
    operators: {
      CYCLIC_LOCAL_DIVERSITY: cyclic,
      FANO_CONTROLLED_INCIDENCE: fano,
      FANO_CENTERED_HOSTILE: centeredFano
    },
    bounded_relations: {
      structured_pair_coverage_improves_conditioning_in_authored_matched_fixture: rawConditioningGain,
      combinatorial_coverage_does_not_guarantee_epistemically_relevant_operator_coverage: hostileNullspace,
      coverage_receipt_equals_geometry_receipt: false
    },
    contradiction_ledger: [
      'RAW_FANO_PAIR_COVERAGE_COMPLETE_AND_FULL_RANK',
      'CENTERED_FANO_PAIR_COVERAGE_IDENTICAL_BUT_GLOBAL_OFFSET_NULLSPACE_PRESENT',
      'COVERAGE_RECEIPT_NE_GEOMETRY_RECEIPT'
    ],
    scientific_verdict: rawConditioningGain && hostileNullspace
      ? 'CHAMBER_I_BOUNDED_OPERATOR_GEOMETRY_SURVIVES_WITH_HOSTILE_NULLSPACE'
      : 'CHAMBER_I_RESULT_REQUIRES_REVIEW',
    scalar_winner: null,
    universal_optimality_claim: false,
    physical_tomography_claim: false,
    promotion_authority: false,
    production_mutated: false,
    vercel_authority: false,
    human_closure_required: true
  });
}
