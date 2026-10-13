import { freeze } from '../../../engine/flowcore-pedagogue-utils.js';

export const IDENTIFIABILITY_DEFICIT_TARGETING_SCHEMA = 'td613.ash.a15-r0.identifiability-deficit-targeting/v0.1';
const TOLERANCE = 1e-12;

function finiteMatrix(matrix, label = 'matrix') {
  if (!Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0]) || matrix[0].length === 0) {
    throw new TypeError(`${label} must be a non-empty rectangular numeric matrix.`);
  }
  const width = matrix[0].length;
  const out = matrix.map((row, r) => {
    if (!Array.isArray(row) || row.length !== width) throw new TypeError(`${label} must be rectangular.`);
    return row.map((value, c) => {
      if (!Number.isFinite(value)) throw new TypeError(`${label}[${r}][${c}] must be finite.`);
      return Number(value);
    });
  });
  return out;
}

function rref(matrix, tolerance = TOLERANCE) {
  const work = finiteMatrix(matrix).map(row => [...row]);
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
  const cleaned = work.map(items => items.map(value => Math.abs(value) <= tolerance ? 0 : value));
  return { matrix: cleaned, pivots };
}

export function matrixRank(matrix, tolerance = TOLERANCE) {
  if (!Number.isFinite(tolerance) || tolerance < 0) throw new TypeError('tolerance must be a non-negative finite number.');
  return rref(matrix, tolerance).pivots.length;
}

export function nullspaceBasis(matrix, tolerance = TOLERANCE) {
  if (!Number.isFinite(tolerance) || tolerance < 0) throw new TypeError('tolerance must be a non-negative finite number.');
  const source = finiteMatrix(matrix);
  const { matrix: reduced, pivots } = rref(source, tolerance);
  const width = source[0].length;
  const pivotSet = new Set(pivots);
  const freeColumns = Array.from({ length: width }, (_, index) => index).filter(index => !pivotSet.has(index));
  const basis = freeColumns.map(freeCol => {
    const vector = Array(width).fill(0);
    vector[freeCol] = 1;
    pivots.forEach((pivotCol, pivotRow) => {
      vector[pivotCol] = -reduced[pivotRow][freeCol];
    });
    const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
    const normalized = norm > tolerance ? vector.map(value => value / norm) : vector;
    const first = normalized.find(value => Math.abs(value) > tolerance) || 0;
    const sign = first < 0 ? -1 : 1;
    return freeze(normalized.map(value => Math.abs(value) <= tolerance ? 0 : Number((value * sign).toFixed(15))));
  });
  return freeze(basis);
}

function dot(left, right) {
  if (left.length !== right.length) throw new TypeError('dot-product vectors must have equal length.');
  return left.reduce((sum, value, index) => sum + value * right[index], 0);
}

function appendRow(matrix, row) {
  const source = finiteMatrix(matrix);
  if (!Array.isArray(row) || row.length !== source[0].length || row.some(value => !Number.isFinite(value))) {
    throw new TypeError('candidate gradient must match the operator width and contain finite values.');
  }
  return [...source.map(items => [...items]), row.map(Number)];
}

function evaluateProbe(currentMatrix, probe, tolerance = TOLERANCE) {
  if (!probe || typeof probe !== 'object' || typeof probe.probe_id !== 'string' || probe.probe_id.trim() === '') {
    throw new TypeError('probe requires a non-empty probe_id.');
  }
  const base = finiteMatrix(currentMatrix);
  const gradient = probe.gradient;
  const rankBefore = matrixRank(base, tolerance);
  const basis = nullspaceBasis(base, tolerance);
  const augmented = appendRow(base, gradient);
  const rankAfter = matrixRank(augmented, tolerance);
  const sensitivities = basis.map(vector => Number(dot(gradient, vector).toFixed(15)));
  return freeze({
    probe_id: probe.probe_id,
    definition: probe.definition || probe.probe_id,
    gradient: freeze([...gradient]),
    rank_before: rankBefore,
    rank_after: rankAfter,
    rank_lift: rankAfter - rankBefore,
    nullity_before: base[0].length - rankBefore,
    nullity_after: base[0].length - rankAfter,
    nullspace_sensitivities: freeze(sensitivities),
    sensitive_to_current_nullspace: sensitivities.some(value => Math.abs(value) > tolerance),
    locally_redundant: rankAfter === rankBefore
  });
}

export function evaluatePredeclaredProbeLibrary(currentMatrix, probes, tolerance = TOLERANCE) {
  if (!Array.isArray(probes) || probes.length === 0) throw new TypeError('probes must be a non-empty predeclared array.');
  const ids = probes.map(probe => probe?.probe_id);
  if (new Set(ids).size !== ids.length) throw new Error('predeclared probe ids must be unique.');
  const scores = probes.map(probe => evaluateProbe(currentMatrix, probe, tolerance));
  const ranked = [...scores].sort((left, right) =>
    right.rank_lift - left.rank_lift ||
    Number(right.sensitive_to_current_nullspace) - Number(left.sensitive_to_current_nullspace) ||
    left.probe_id.localeCompare(right.probe_id)
  );
  return freeze({
    oracle_identity_consulted: false,
    predeclared_library_only: true,
    current_rank: matrixRank(currentMatrix, tolerance),
    current_nullity: finiteMatrix(currentMatrix)[0].length - matrixRank(currentMatrix, tolerance),
    current_nullspace_basis: nullspaceBasis(currentMatrix, tolerance),
    scores: freeze(scores),
    selected_probe_id: ranked[0].probe_id,
    selected_rank_lift: ranked[0].rank_lift,
    selected_nullity_after: ranked[0].nullity_after,
    automatic_measurement_execution: false,
    classification: ranked[0].rank_lift > 0
      ? 'RANK_AUGMENTING_NEXT_OBSERVATION_PROPOSED'
      : 'NO_RANK_AUGMENTING_CANDIDATE_IN_PREDECLARED_LIBRARY'
  });
}

function multiplyMatrixVector(matrix, vector) {
  return matrix.map(row => row.reduce((sum, value, index) => sum + value * vector[index], 0));
}

function allNearZero(values, tolerance = TOLERANCE) {
  return values.every(value => Math.abs(value) <= tolerance);
}

export function runIdentifiabilityDeficitTargetingGauntlet() {
  const confoundedJacobian = freeze([[1,2,2],[2,1,2],[1,-1,0]]);
  const canonicalNullDirection = freeze([2,2,-3]);
  const contextAProbes = freeze([
    freeze({ probe_id:'C1', definition:'theta*x', gradient:freeze([2,0,2]) }),
    freeze({ probe_id:'C2', definition:'x+y', gradient:freeze([1,1,0]) }),
    freeze({ probe_id:'C3', definition:'x+theta*y', gradient:freeze([1,2,2]) })
  ]);
  const contextA = evaluatePredeclaredProbeLibrary(confoundedJacobian, contextAProbes);
  const contextAScores = Object.fromEntries(contextA.scores.map(score => [score.probe_id, score]));
  const canonicalNullResidual = multiplyMatrixVector(confoundedJacobian, canonicalNullDirection);
  const canonicalSensitivities = Object.fromEntries(contextAProbes.map(probe => [
    probe.probe_id,
    dot(probe.gradient, canonicalNullDirection)
  ]));

  const repeatedKnownForward = freeze([[1,1,0],[1,1,0],[1,1,0]]);
  const contextBProbes = freeze([
    freeze({ probe_id:'G_13', definition:'x+z', gradient:freeze([1,0,1]) }),
    freeze({ probe_id:'G_23', definition:'y+z', gradient:freeze([0,1,1]) }),
    freeze({ probe_id:'G_DUP', definition:'renamed x+y', gradient:freeze([1,1,0]) })
  ]);
  const contextBFirst = evaluatePredeclaredProbeLibrary(repeatedKnownForward, contextBProbes);
  const firstScore = contextBFirst.scores.find(score => score.probe_id === contextBFirst.selected_probe_id);
  const firstGradient = contextBProbes.find(probe => probe.probe_id === contextBFirst.selected_probe_id).gradient;
  const afterFirst = freeze([...repeatedKnownForward.map(row => freeze([...row])), freeze([...firstGradient])]);
  const remaining = contextBProbes.filter(probe => probe.probe_id !== contextBFirst.selected_probe_id);
  const contextBSecond = evaluatePredeclaredProbeLibrary(afterFirst, remaining);
  const contextBScoresFirst = Object.fromEntries(contextBFirst.scores.map(score => [score.probe_id, score]));
  const contextBScoresSecond = Object.fromEntries(contextBSecond.scores.map(score => [score.probe_id, score]));

  const passed =
    contextA.current_rank === 2 &&
    contextA.current_nullity === 1 &&
    allNearZero(canonicalNullResidual) &&
    contextAScores.C1.rank_lift === 1 &&
    contextAScores.C2.rank_lift === 1 &&
    contextAScores.C3.rank_lift === 0 &&
    canonicalSensitivities.C1 === -2 &&
    canonicalSensitivities.C2 === 4 &&
    canonicalSensitivities.C3 === 0 &&
    contextA.selected_probe_id === 'C1' &&
    contextA.oracle_identity_consulted === false &&
    contextBFirst.current_rank === 1 &&
    contextBFirst.current_nullity === 2 &&
    contextBScoresFirst.G_DUP.rank_lift === 0 &&
    contextBScoresFirst.G_13.rank_lift === 1 &&
    contextBScoresFirst.G_23.rank_lift === 1 &&
    firstScore.rank_after === 2 &&
    contextBSecond.current_rank === 2 &&
    contextBSecond.selected_rank_lift === 1 &&
    contextBSecond.selected_nullity_after === 0 &&
    (contextBScoresSecond.G_DUP?.rank_lift ?? 0) === 0 &&
    contextBSecond.oracle_identity_consulted === false;

  if (!passed) throw new Error('Identifiability-deficit targeting gauntlet violated an authored expectation.');

  return freeze({
    schema: IDENTIFIABILITY_DEFICIT_TARGETING_SCHEMA,
    source_status: 'SIMULATED',
    authority_class: 'A2_DERIVATIONAL',
    manifestly_fictional: true,
    operational_scope: 'LOCAL_LINEARIZED_PREDECLARED_PROBE_LIBRARY',
    context_a_state_instrument: freeze({
      rank_before: contextA.current_rank,
      nullity_before: contextA.current_nullity,
      numerical_nullspace_basis: contextA.current_nullspace_basis,
      canonical_null_direction: canonicalNullDirection,
      canonical_null_residual: freeze(canonicalNullResidual),
      canonical_probe_sensitivities: freeze(canonicalSensitivities),
      probe_scores: contextA.scores,
      selected_probe_id: contextA.selected_probe_id,
      selected_rank_lift: contextA.selected_rank_lift,
      classification: contextA.classification
    }),
    context_b_known_forward: freeze({
      initial_rank: contextBFirst.current_rank,
      initial_nullity: contextBFirst.current_nullity,
      first_probe_scores: contextBFirst.scores,
      first_selected_probe_id: contextBFirst.selected_probe_id,
      rank_after_first: firstScore.rank_after,
      nullity_after_first: firstScore.nullity_after,
      second_probe_scores: contextBSecond.scores,
      second_selected_probe_id: contextBSecond.selected_probe_id,
      final_rank: contextBSecond.current_rank + contextBSecond.selected_rank_lift,
      final_nullity: contextBSecond.selected_nullity_after,
      duplicate_probe_never_lifts_rank: contextBScoresFirst.G_DUP.rank_lift === 0 && (contextBScoresSecond.G_DUP?.rank_lift ?? 0) === 0
    }),
    cross_context: freeze({
      internal_context_family_count: 2,
      context_families: freeze(['KNOWN_FORWARD_RELATIONAL_STATE','PARTIALLY_UNKNOWN_STATE_INSTRUMENT']),
      criterion_status: 'IDENTIFIABILITY_DEFICIT_TARGETING_VALIDATED_IN_TWO_BOUNDED_SYNTHETIC_CONTEXTS',
      candidate_mechanism_id: 'LOCAL_IDENTIFIABILITY_DEFICIT_GUIDES_PREDECLARED_PROBE_SELECTION',
      operational_definition: 'Prefer a predeclared candidate observation that increases local operator/Jacobian rank and therefore contracts current local nullity; renamed or already-spanned probes receive zero rank-lift credit.',
      oracle_identity_consulted: false,
      statistical_independence_claim: false,
      pedagogue_law_promoted: false
    }),
    next_learning_action: 'TEST_CONDITIONING_AND_NOISY_NEAR_SINGULAR_CASES_BEFORE_ANY_DESIGN_HEURISTIC_PROMOTION',
    claims: freeze({
      optimal_experimental_design: false,
      active_learning_theorem: false,
      global_identifiability: false,
      stability_guarantee: false,
      blind_tomography: false,
      operator_tomography: false,
      physical_tomography: false,
      physical_sensor_control: false,
      autonomous_experiment_execution: false,
      connection: false,
      curvature: false,
      holonomy: false,
      quantum_behavior: false,
      proto_loom: false,
      production_authority: false
    }),
    promotion_authority: false,
    production_mutated: false,
    live_ash_binding: false,
    human_closure_required: true
  });
}
