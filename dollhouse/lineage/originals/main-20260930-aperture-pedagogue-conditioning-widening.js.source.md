import { freeze } from '../../../engine/flowcore-pedagogue-utils.js';
import {
  evaluatePredeclaredProbeLibrary,
  matrixRank
} from './identifiability-deficit-targeting.js';

export const APERTURE_PEDAGOGUE_CONDITIONING_WIDENING_SCHEMA =
  'td613.ash.a15-r0.aperture-pedagogue-conditioning-widening/v0.1';

const TOLERANCE = 1e-12;
const BASE_OPERATOR = Object.freeze([[1, 0]]);
const LATENT_TRUTH = Object.freeze([2, 3]);
const PERTURBATION = Object.freeze([0.01, -0.01]);
const PROBES = Object.freeze([
  Object.freeze({ probe_id:'P_DUP', definition:'duplicate x', gradient:Object.freeze([1, 0]) }),
  Object.freeze({ probe_id:'P_NEAR', definition:'near-parallel x + 0.001y', gradient:Object.freeze([1, 0.001]) }),
  Object.freeze({ probe_id:'P_ORTH', definition:'orthogonal y', gradient:Object.freeze([0, 1]) })
]);

function round(value, digits = 15) {
  return Number(value.toFixed(digits));
}

function finiteMatrix(matrix, label = 'matrix') {
  if (!Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0]) || matrix[0].length !== 2) {
    throw new TypeError(`${label} must be a non-empty two-column numeric matrix.`);
  }
  return matrix.map((row, r) => {
    if (!Array.isArray(row) || row.length !== 2) throw new TypeError(`${label} must contain two-column rows.`);
    return row.map((value, c) => {
      if (!Number.isFinite(value)) throw new TypeError(`${label}[${r}][${c}] must be finite.`);
      return Number(value);
    });
  });
}

export function normalizeProbeRow(row, tolerance = TOLERANCE) {
  if (!Array.isArray(row) || row.length !== 2 || row.some(value => !Number.isFinite(value))) {
    throw new TypeError('probe row must contain two finite values.');
  }
  if (!Number.isFinite(tolerance) || tolerance < 0) throw new TypeError('tolerance must be a non-negative finite number.');
  const norm = Math.hypot(row[0], row[1]);
  if (norm <= tolerance) throw new Error('zero probe row cannot be normalized.');
  return freeze(row.map(value => round(value / norm)));
}

export function singularValuePosture2(matrix, tolerance = TOLERANCE) {
  const source = finiteMatrix(matrix);
  let g11 = 0;
  let g12 = 0;
  let g22 = 0;
  for (const [a, b] of source) {
    g11 += a * a;
    g12 += a * b;
    g22 += b * b;
  }
  const trace = g11 + g22;
  const discriminant = Math.sqrt(Math.max(0, (g11 - g22) ** 2 + 4 * g12 ** 2));
  const lambdaMax = Math.max(0, (trace + discriminant) / 2);
  const lambdaMin = Math.max(0, (trace - discriminant) / 2);
  const sigmaMax = Math.sqrt(lambdaMax);
  const sigmaMin = Math.sqrt(lambdaMin);
  const rank = matrixRank(source, tolerance);
  const singular = rank < 2 || sigmaMin <= tolerance;
  return freeze({
    sigma_max: round(sigmaMax),
    sigma_min: singular ? 0 : round(sigmaMin),
    condition_number_2: singular ? null : round(sigmaMax / sigmaMin),
    noise_amplification_proxy: singular ? null : round(1 / sigmaMin),
    conditioning_status: singular ? 'SINGULAR' : 'FINITE'
  });
}

function appendNormalizedProbe(baseMatrix, probe) {
  const base = finiteMatrix(baseMatrix, 'baseMatrix');
  if (!probe || typeof probe.probe_id !== 'string' || !Array.isArray(probe.gradient)) {
    throw new TypeError('probe must provide probe_id and gradient.');
  }
  const normalized = normalizeProbeRow(probe.gradient);
  return {
    normalized,
    augmented: [...base.map(row => [...row]), [...normalized]]
  };
}

export function evaluateConditioningCandidate(baseMatrix, probe, tolerance = TOLERANCE) {
  const base = finiteMatrix(baseMatrix, 'baseMatrix');
  const rankBefore = matrixRank(base, tolerance);
  const { normalized, augmented } = appendNormalizedProbe(base, probe);
  const rankAfter = matrixRank(augmented, tolerance);
  const posture = singularValuePosture2(augmented, tolerance);
  return freeze({
    probe_id: probe.probe_id,
    definition: probe.definition || probe.probe_id,
    raw_gradient: freeze([...probe.gradient]),
    normalized_gradient: normalized,
    rank_before: rankBefore,
    rank_after: rankAfter,
    rank_lift: rankAfter - rankBefore,
    sigma_max: posture.sigma_max,
    sigma_min: posture.sigma_min,
    condition_number_2: posture.condition_number_2,
    noise_amplification_proxy: posture.noise_amplification_proxy,
    conditioning_status: posture.conditioning_status
  });
}

export function selectConditioningAwareWidening(baseMatrix, probes = PROBES, tolerance = TOLERANCE) {
  if (!Array.isArray(probes) || probes.length === 0) throw new TypeError('probes must be a non-empty predeclared array.');
  const scores = probes.map(probe => evaluateConditioningCandidate(baseMatrix, probe, tolerance));
  const rankLifters = scores.filter(score => score.rank_lift > 0 && score.conditioning_status === 'FINITE');
  const ranked = [...rankLifters].sort((left, right) =>
    right.rank_lift - left.rank_lift ||
    right.sigma_min - left.sigma_min ||
    left.condition_number_2 - right.condition_number_2 ||
    left.probe_id.localeCompare(right.probe_id)
  );
  const selected = ranked[0] || null;
  return freeze({
    source_status: 'DERIVED',
    authority_class: 'A2_DERIVATIONAL',
    predeclared_library_only: true,
    oracle_identity_consulted: false,
    held_out_used_for_selection: false,
    normalization_law: 'UNIT_EUCLIDEAN_ROW_NORM_UNDER_DECLARED_EQUAL_VARIANCE_SYNTHETIC_POSTURE',
    scores: freeze(scores),
    selected_probe_id: selected?.probe_id || null,
    selected_rank_lift: selected?.rank_lift || 0,
    selected_sigma_min: selected?.sigma_min ?? 0,
    selected_condition_number_2: selected?.condition_number_2 ?? null,
    automatic_widening_execution: false,
    classification: selected
      ? 'CONDITIONING_AWARE_RANK_AUGMENTING_WIDENING_PROPOSED'
      : 'NO_FINITE_CONDITIONING_RANK_AUGMENTING_CANDIDATE'
  });
}

function multiply(matrix, vector) {
  return matrix.map(row => row[0] * vector[0] + row[1] * vector[1]);
}

function leastSquares2(matrix, observations, tolerance = TOLERANCE) {
  const source = finiteMatrix(matrix);
  if (!Array.isArray(observations) || observations.length !== source.length || observations.some(value => !Number.isFinite(value))) {
    throw new TypeError('observations must match matrix rows and be finite.');
  }
  let g11 = 0, g12 = 0, g22 = 0, b1 = 0, b2 = 0;
  source.forEach(([a, b], index) => {
    const y = observations[index];
    g11 += a * a;
    g12 += a * b;
    g22 += b * b;
    b1 += a * y;
    b2 += b * y;
  });
  const det = g11 * g22 - g12 * g12;
  if (Math.abs(det) <= tolerance) return null;
  return freeze([
    round((g22 * b1 - g12 * b2) / det),
    round((-g12 * b1 + g11 * b2) / det)
  ]);
}

function l2Distance(left, right) {
  return Math.hypot(left[0] - right[0], left[1] - right[1]);
}

function validationWitness(baseMatrix, probe) {
  const { normalized, augmented } = appendNormalizedProbe(baseMatrix, probe);
  const rank = matrixRank(augmented);
  if (rank < 2) {
    return freeze({
      probe_id: probe.probe_id,
      normalized_gradient: normalized,
      rank_after: rank,
      reconstruction: null,
      perturbation_reconstruction_error: null,
      held_out_residual: null,
      validation_classification: 'RANK_DEFICIENT'
    });
  }
  const clean = multiply(augmented, LATENT_TRUTH);
  const observed = clean.map((value, index) => value + PERTURBATION[index]);
  const reconstruction = leastSquares2(augmented, observed);
  const error = l2Distance(reconstruction, LATENT_TRUTH);
  const trueHeldOut = LATENT_TRUTH[0] - LATENT_TRUTH[1];
  const reconstructedHeldOut = reconstruction[0] - reconstruction[1];
  return freeze({
    probe_id: probe.probe_id,
    normalized_gradient: normalized,
    rank_after: rank,
    reconstruction,
    perturbation_reconstruction_error: round(error),
    held_out_residual: round(Math.abs(reconstructedHeldOut - trueHeldOut)),
    validation_classification: 'FULL_RANK_PENDING_RELATIVE_CLASSIFICATION'
  });
}

export function runAperturePedagogueConditioningWideningGauntlet() {
  const rankOnly = evaluatePredeclaredProbeLibrary(BASE_OPERATOR, PROBES);
  const apertureSelection = selectConditioningAwareWidening(BASE_OPERATOR, PROBES);
  const validationById = Object.fromEntries(PROBES.map(probe => [probe.probe_id, validationWitness(BASE_OPERATOR, probe)]));

  const fullRankConditions = apertureSelection.scores
    .filter(score => score.rank_lift > 0 && score.condition_number_2 !== null)
    .map(score => score.condition_number_2);
  const bestCondition = Math.min(...fullRankConditions);

  const candidates = apertureSelection.scores.map(score => {
    const witness = validationById[score.probe_id];
    const relativeClass = score.rank_lift === 0
      ? 'RANK_DEFICIENT'
      : Math.abs(score.condition_number_2 - bestCondition) <= 1e-12
        ? 'FULL_RANK_ROBUST_RELATIVE_TO_CANDIDATE_FAMILY'
        : 'FULL_RANK_FRAGILE_UNDER_DECLARED_SCALE_NOISE_POSTURE';
    return freeze({ ...score, ...witness, validation_classification: relativeClass });
  });

  const near = candidates.find(item => item.probe_id === 'P_NEAR');
  const orth = candidates.find(item => item.probe_id === 'P_ORTH');
  const duplicate = candidates.find(item => item.probe_id === 'P_DUP');

  const scaledOrth = evaluateConditioningCandidate(BASE_OPERATOR, {
    probe_id:'P_ORTH_SCALED',
    definition:'1000y scale hostile control',
    gradient:[0,1000]
  });

  const passed =
    rankOnly.selected_probe_id === 'P_NEAR' &&
    rankOnly.selected_rank_lift === 1 &&
    apertureSelection.selected_probe_id === 'P_ORTH' &&
    apertureSelection.held_out_used_for_selection === false &&
    apertureSelection.oracle_identity_consulted === false &&
    near.rank_lift === 1 &&
    orth.rank_lift === 1 &&
    duplicate.rank_lift === 0 &&
    near.condition_number_2 > 1900 &&
    orth.condition_number_2 === 1 &&
    near.perturbation_reconstruction_error > 19 &&
    orth.perturbation_reconstruction_error < 0.02 &&
    near.held_out_residual > 20 &&
    orth.held_out_residual < 0.021 &&
    near.validation_classification === 'FULL_RANK_FRAGILE_UNDER_DECLARED_SCALE_NOISE_POSTURE' &&
    orth.validation_classification === 'FULL_RANK_ROBUST_RELATIVE_TO_CANDIDATE_FAMILY' &&
    duplicate.validation_classification === 'RANK_DEFICIENT' &&
    scaledOrth.condition_number_2 === orth.condition_number_2 &&
    JSON.stringify(scaledOrth.normalized_gradient) === JSON.stringify(orth.normalized_gradient);

  if (!passed) throw new Error('Aperture × Pedagogue conditioning-aware widening gauntlet violated an authored expectation.');

  return freeze({
    schema: APERTURE_PEDAGOGUE_CONDITIONING_WIDENING_SCHEMA,
    source_status: 'SIMULATED',
    authority_class: 'A2_DERIVATIONAL',
    manifestly_fictional: true,
    experiment_host: 'DOME_WORLD_A15_R0',
    aperture_role: 'CONDITIONING_AUDIT_OF_PROPOSED_OBSERVABILITY_WIDENING',
    pedagogue_rank_only_baseline: freeze({
      selected_probe_id: rankOnly.selected_probe_id,
      selected_rank_lift: rankOnly.selected_rank_lift,
      law_retained: true,
      scope: 'FORMAL_LOCAL_IDENTIFIABILITY_ONLY'
    }),
    aperture_conditioning_selection: apertureSelection,
    candidate_receipts: freeze(candidates),
    scale_hostile_control: scaledOrth,
    noise_posture: freeze({
      kind:'DETERMINISTIC_PERTURBATION_WITNESS',
      eta:PERTURBATION,
      equal_variance_comparison_assumption:true,
      empirical_error_rate_claim:false
    }),
    operator_basis: freeze({
      latent_truth:LATENT_TRUTH,
      base_operator:BASE_OPERATOR,
      held_out_operator:'H(S)=x-y',
      held_out_used_for_selection:false
    }),
    alternatives: freeze([
      'full-rank candidate may remain practically unstable under perturbation',
      'raw probe scale may create misleading geometry unless comparison posture is declared',
      'different noise covariance could alter the preferred probe'
    ]),
    missingness: freeze([
      'no empirical sensor covariance',
      'no nonlinear global stability analysis',
      'no physical instrument calibration',
      'no live TD613 observations'
    ]),
    abstention: 'NO_AUTONOMOUS_WIDENING_OR_VALIDATION_AUTHORITY',
    bounded_result: 'CONDITIONING_AWARE_IDENTIFIABILITY_REFINEMENT_CANDIDATE',
    reusable_relation_status: 'RESEARCH_REFINEMENT_CANDIDATE_ONLY',
    reusable_relation: 'rank lift can establish formal local identifiability while poor conditioning leaves reconstruction fragile under declared perturbation; observability widening therefore requires a separate stability audit',
    aperture_laws: freeze([
      'widening != validation',
      'rank_lift != practical_recoverability',
      'formal_identifiability != stable_reconstruction'
    ]),
    next_learning_action: 'TEST_DECLARED_NOISE_COVARIANCE_AND_WHITENED_OPERATOR_GEOMETRY_BEFORE_ANY_DESIGN_HEURISTIC_PROMOTION',
    claims: freeze({
      optimal_experimental_design:false,
      active_learning_theorem:false,
      fisher_information_optimality:false,
      physical_sensor_design:false,
      physical_tomography:false,
      blind_tomography:false,
      operator_tomography:false,
      live_td613_reconstruction:false,
      autonomous_aperture_widening:false,
      autonomous_experiment_execution:false,
      connection:false,
      curvature:false,
      holonomy:false,
      quantum_behavior:false,
      proto_loom:false,
      production_authority:false
    }),
    promotion_authority:false,
    production_mutated:false,
    standalone_aperture_ui_mutated:false,
    live_ash_binding:false,
    human_closure_required:true
  });
}
