import { freeze } from '../../../engine/flowcore-pedagogue-utils.js';
import { matrixRank } from './identifiability-deficit-targeting.js';
import {
  normalizeProbeRow,
  singularValuePosture2
} from './aperture-pedagogue-conditioning-widening.js';

export const APERTURE_PEDAGOGUE_EXPERIMENT_DESIGN_STATE_SCHEMA =
  'td613.ash.a15-r0.aperture-pedagogue-experiment-design-state/v0.1';

const TOLERANCE = 1e-12;
export const DEFAULT_FIXTURE_THRESHOLDS = Object.freeze({
  sigma_min_floor: 0.25,
  condition_number_ceiling: 10,
  minimum_sigma_min_gain_for_stability_widening: 0.05
});

const NOISE_STATUS = Object.freeze({
  DECLARED: 'DECLARED_EQUAL_VARIANCE',
  UNRESOLVED: 'UNRESOLVED',
  INVALID: 'INVALID_NOISE_GEOMETRY_NOT_POSITIVE_DEFINITE'
});

function round(value, digits = 15) {
  return Number(value.toFixed(digits));
}

function validateTwoColumnOperator(operator, label = 'operator') {
  if (!Array.isArray(operator) || operator.length === 0) {
    throw new TypeError(`${label} must be a non-empty matrix.`);
  }
  return operator.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length !== 2 || row.some(value => !Number.isFinite(value))) {
      throw new TypeError(`${label}[${rowIndex}] must contain two finite values.`);
    }
    return row.map(Number);
  });
}

function validateThresholds(thresholds) {
  const merged = { ...DEFAULT_FIXTURE_THRESHOLDS, ...(thresholds || {}) };
  if (!Number.isFinite(merged.sigma_min_floor) || merged.sigma_min_floor < 0) {
    throw new TypeError('sigma_min_floor must be a non-negative finite number.');
  }
  if (!Number.isFinite(merged.condition_number_ceiling) || merged.condition_number_ceiling <= 0) {
    throw new TypeError('condition_number_ceiling must be a positive finite number.');
  }
  if (!Number.isFinite(merged.minimum_sigma_min_gain_for_stability_widening) || merged.minimum_sigma_min_gain_for_stability_widening < 0) {
    throw new TypeError('minimum_sigma_min_gain_for_stability_widening must be a non-negative finite number.');
  }
  return freeze(merged);
}

function appendProbe(operator, probe) {
  const normalized = normalizeProbeRow(probe.gradient);
  return {
    normalized,
    augmented: [...operator.map(row => [...row]), [...normalized]]
  };
}

function candidateNoiseStatus(probe) {
  return probe.noise_geometry_status || NOISE_STATUS.DECLARED;
}

function scoreCandidate(operator, probe, currentPosture) {
  if (!probe || typeof probe.probe_id !== 'string' || !Array.isArray(probe.gradient)) {
    throw new TypeError('candidate probe must provide probe_id and gradient.');
  }
  const { normalized, augmented } = appendProbe(operator, probe);
  const rankAfter = matrixRank(augmented, TOLERANCE);
  const postureAfter = singularValuePosture2(augmented, TOLERANCE);
  const sigmaGain = postureAfter.sigma_min - currentPosture.sigma_min;
  return freeze({
    probe_id: probe.probe_id,
    definition: probe.definition || probe.probe_id,
    normalized_gradient: normalized,
    noise_geometry_status: candidateNoiseStatus(probe),
    rank_after: rankAfter,
    rank_lift: rankAfter - currentPosture.rank,
    sigma_min_after: postureAfter.sigma_min,
    sigma_min_gain: round(sigmaGain),
    condition_number_after: postureAfter.condition_number_2,
    full_rank_after: rankAfter === 2
  });
}

function basePosture(operator) {
  const rank = matrixRank(operator, TOLERANCE);
  const spectral = singularValuePosture2(operator, TOLERANCE);
  return freeze({
    rank,
    nullity: 2 - rank,
    sigma_min: spectral.sigma_min,
    sigma_max: spectral.sigma_max,
    condition_number: spectral.condition_number_2
  });
}

function potentialCandidateForDeficit(score, base, thresholds) {
  if (base.rank < 2) return score.rank_lift > 0;
  const stabilityDeficit = base.sigma_min < thresholds.sigma_min_floor ||
    (base.condition_number !== null && base.condition_number > thresholds.condition_number_ceiling);
  if (stabilityDeficit) {
    return score.full_rank_after && score.sigma_min_gain >= thresholds.minimum_sigma_min_gain_for_stability_widening;
  }
  return false;
}

export function diagnoseExperimentDesignState({
  operator,
  latent_dimension = 2,
  candidates = [],
  thresholds = DEFAULT_FIXTURE_THRESHOLDS
}) {
  if (latent_dimension !== 2) throw new Error('v0.1 supports latent_dimension=2 only.');
  const normalizedOperator = validateTwoColumnOperator(operator);
  const declaredThresholds = validateThresholds(thresholds);
  const base = basePosture(normalizedOperator);
  const scores = candidates.map(probe => scoreCandidate(normalizedOperator, probe, base));
  const materiallyRelevant = scores.filter(score => potentialCandidateForDeficit(score, base, declaredThresholds));

  const invalid = materiallyRelevant.filter(score => score.noise_geometry_status.startsWith('INVALID_NOISE_GEOMETRY_'));
  if (invalid.length > 0) {
    return freeze({
      schema: APERTURE_PEDAGOGUE_EXPERIMENT_DESIGN_STATE_SCHEMA,
      source_status: 'SIMULATED',
      authority_class: 'A2_DERIVATIONAL',
      latent_dimension,
      operator_basis: freeze(normalizedOperator.map(row => freeze([...row]))),
      current_rank: base.rank,
      current_nullity: base.nullity,
      current_sigma_min: base.sigma_min,
      current_condition_number: base.condition_number,
      thresholds: declaredThresholds,
      uncertainty_geometry_status: 'INVALID',
      deficit_class: 'INVALID_NOISE_GEOMETRY',
      deficit_reason: 'MATERIALLY_RELEVANT_CANDIDATE_HAS_INVALID_DECLARED_NOISE_GEOMETRY',
      candidate_probe_receipts: freeze(scores),
      missingness: freeze([]),
      selection_posture: 'REJECT_BEFORE_RANKING',
      selection_status: 'INVALID_NOISE_GEOMETRY_PRESENT_NO_SELECTION',
      selected_probe_id: null,
      held_out_not_used_for_selection: true,
      automatic_execution: false
    });
  }

  const unresolved = materiallyRelevant.filter(score => score.noise_geometry_status === NOISE_STATUS.UNRESOLVED);
  if (unresolved.length > 0) {
    return freeze({
      schema: APERTURE_PEDAGOGUE_EXPERIMENT_DESIGN_STATE_SCHEMA,
      source_status: 'SIMULATED',
      authority_class: 'A2_DERIVATIONAL',
      latent_dimension,
      operator_basis: freeze(normalizedOperator.map(row => freeze([...row]))),
      current_rank: base.rank,
      current_nullity: base.nullity,
      current_sigma_min: base.sigma_min,
      current_condition_number: base.condition_number,
      thresholds: declaredThresholds,
      uncertainty_geometry_status: 'INCOMPLETE',
      deficit_class: 'NOISE_GEOMETRY_INCOMPLETE',
      deficit_reason: 'MATERIALLY_RELEVANT_CANDIDATE_LACKS_COMPARABLE_NOISE_GEOMETRY',
      candidate_probe_receipts: freeze(scores),
      missingness: freeze(unresolved.map(score => `noise_geometry:${score.probe_id}`)),
      selection_posture: 'ABSTAIN_GLOBALLY',
      selection_status: 'NO_GLOBAL_WIDENING_SELECTION_MISSING_NOISE_GEOMETRY',
      selected_probe_id: null,
      held_out_not_used_for_selection: true,
      automatic_execution: false
    });
  }

  if (base.rank < latent_dimension) {
    const admissible = scores.filter(score => score.noise_geometry_status === NOISE_STATUS.DECLARED && score.rank_lift > 0);
    const ranked = [...admissible].sort((left, right) =>
      right.sigma_min_after - left.sigma_min_after ||
      (left.condition_number_after ?? Infinity) - (right.condition_number_after ?? Infinity) ||
      left.probe_id.localeCompare(right.probe_id)
    );
    return freeze({
      schema: APERTURE_PEDAGOGUE_EXPERIMENT_DESIGN_STATE_SCHEMA,
      source_status: 'SIMULATED',
      authority_class: 'A2_DERIVATIONAL',
      latent_dimension,
      operator_basis: freeze(normalizedOperator.map(row => freeze([...row]))),
      current_rank: base.rank,
      current_nullity: base.nullity,
      current_sigma_min: base.sigma_min,
      current_condition_number: base.condition_number,
      thresholds: declaredThresholds,
      uncertainty_geometry_status: 'COMPLETE_EQUAL_VARIANCE_FIXTURE',
      deficit_class: 'STRUCTURAL_RANK_DEFICIT',
      deficit_reason: 'CURRENT_OPERATOR_HAS_NONZERO_NULLITY',
      candidate_probe_receipts: freeze(scores),
      missingness: freeze([]),
      selection_posture: 'REQUIRE_POSITIVE_RANK_LIFT_THEN_AUDIT_STABILITY',
      selection_status: ranked[0] ? 'STRUCTURAL_RANK_DEFICIT_PROBE_PROPOSED' : 'NO_ADMISSIBLE_RANK_LIFTING_PROBE',
      selected_probe_id: ranked[0]?.probe_id || null,
      held_out_not_used_for_selection: true,
      automatic_execution: false
    });
  }

  const stabilityDeficit = base.sigma_min < declaredThresholds.sigma_min_floor ||
    (base.condition_number !== null && base.condition_number > declaredThresholds.condition_number_ceiling);

  if (stabilityDeficit) {
    const admissible = scores.filter(score =>
      score.noise_geometry_status === NOISE_STATUS.DECLARED &&
      score.full_rank_after &&
      score.sigma_min_gain >= declaredThresholds.minimum_sigma_min_gain_for_stability_widening
    );
    const ranked = [...admissible].sort((left, right) =>
      right.sigma_min_after - left.sigma_min_after ||
      (left.condition_number_after ?? Infinity) - (right.condition_number_after ?? Infinity) ||
      left.probe_id.localeCompare(right.probe_id)
    );
    return freeze({
      schema: APERTURE_PEDAGOGUE_EXPERIMENT_DESIGN_STATE_SCHEMA,
      source_status: 'SIMULATED',
      authority_class: 'A2_DERIVATIONAL',
      latent_dimension,
      operator_basis: freeze(normalizedOperator.map(row => freeze([...row]))),
      current_rank: base.rank,
      current_nullity: base.nullity,
      current_sigma_min: base.sigma_min,
      current_condition_number: base.condition_number,
      thresholds: declaredThresholds,
      uncertainty_geometry_status: 'COMPLETE_EQUAL_VARIANCE_FIXTURE',
      deficit_class: 'NUMERICAL_STABILITY_DEFICIT',
      deficit_reason: 'CURRENT_OPERATOR_FULL_RANK_BUT_BELOW_DECLARED_STABILITY_POSTURE',
      candidate_probe_receipts: freeze(scores),
      missingness: freeze([]),
      selection_posture: 'REQUIRE_STABILITY_GAIN_WITHOUT_REQUIRING_RANK_LIFT',
      selection_status: ranked[0] ? 'NUMERICAL_STABILITY_WIDENING_PROPOSED' : 'NO_ADMISSIBLE_STABILITY_IMPROVING_PROBE',
      selected_probe_id: ranked[0]?.probe_id || null,
      held_out_not_used_for_selection: true,
      automatic_execution: false
    });
  }

  return freeze({
    schema: APERTURE_PEDAGOGUE_EXPERIMENT_DESIGN_STATE_SCHEMA,
    source_status: 'SIMULATED',
    authority_class: 'A2_DERIVATIONAL',
    latent_dimension,
    operator_basis: freeze(normalizedOperator.map(row => freeze([...row]))),
    current_rank: base.rank,
    current_nullity: base.nullity,
    current_sigma_min: base.sigma_min,
    current_condition_number: base.condition_number,
    thresholds: declaredThresholds,
    uncertainty_geometry_status: 'COMPLETE_EQUAL_VARIANCE_FIXTURE',
    deficit_class: 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT',
    deficit_reason: 'CURRENT_OPERATOR_SATISFIES_PREDECLARED_LOCAL_RANK_AND_STABILITY_POSTURE',
    candidate_probe_receipts: freeze(scores),
    missingness: freeze([]),
    selection_posture: 'DO_NOT_MANUFACTURE_A_QUESTION',
    selection_status: 'NO_WIDENING_PROPOSED_NO_DECLARED_LOCAL_DEFICIT',
    selected_probe_id: null,
    held_out_not_used_for_selection: true,
    automatic_execution: false
  });
}

export function runTypedExperimentDesignStateGauntlet() {
  const rankContext = diagnoseExperimentDesignState({
    operator: [[1,0]],
    candidates: [
      { probe_id:'R_DUP', gradient:[1,0] },
      { probe_id:'R_NEAR', gradient:[1,0.001] },
      { probe_id:'R_ORTH', gradient:[0,1] }
    ]
  });

  const fragileContext = diagnoseExperimentDesignState({
    operator: [[1,0], normalizeProbeRow([1,0.001])],
    candidates: [
      { probe_id:'Q_DUP', gradient:[1,0] },
      { probe_id:'Q_NEAR', gradient:[1,0.002] },
      { probe_id:'Q_DIAG', gradient:[1,1] },
      { probe_id:'Q_STAB', gradient:[0,1] }
    ]
  });

  const goodContext = diagnoseExperimentDesignState({
    operator: [[1,0],[0,1]],
    candidates: [
      { probe_id:'N_DUP_X', gradient:[1,0] },
      { probe_id:'N_DUP_Y', gradient:[0,1] },
      { probe_id:'N_DIAG', gradient:[1,1] }
    ]
  });

  const missingContext = diagnoseExperimentDesignState({
    operator: [[1,0]],
    candidates: [
      { probe_id:'M_ORTH', gradient:[0,1], noise_geometry_status:NOISE_STATUS.DECLARED },
      { probe_id:'M_DIAG', gradient:[1,1], noise_geometry_status:NOISE_STATUS.UNRESOLVED }
    ]
  });

  const invalidContext = diagnoseExperimentDesignState({
    operator: [[1,0]],
    candidates: [
      { probe_id:'I_ORTH', gradient:[0,1], noise_geometry_status:NOISE_STATUS.DECLARED },
      { probe_id:'I_BAD', gradient:[1,1], noise_geometry_status:NOISE_STATUS.INVALID }
    ]
  });

  const qById = Object.fromEntries(fragileContext.candidate_probe_receipts.map(score => [score.probe_id, score]));
  const rById = Object.fromEntries(rankContext.candidate_probe_receipts.map(score => [score.probe_id, score]));

  const passed =
    rankContext.deficit_class === 'STRUCTURAL_RANK_DEFICIT' &&
    rankContext.selected_probe_id === 'R_ORTH' &&
    rById.R_DUP.rank_lift === 0 &&
    rById.R_NEAR.rank_lift === 1 &&
    rById.R_ORTH.rank_lift === 1 &&
    fragileContext.deficit_class === 'NUMERICAL_STABILITY_DEFICIT' &&
    fragileContext.current_rank === 2 &&
    fragileContext.current_nullity === 0 &&
    fragileContext.selected_probe_id === 'Q_STAB' &&
    qById.Q_STAB.rank_lift === 0 &&
    qById.Q_STAB.sigma_min_gain > 0.99 &&
    qById.Q_DUP.sigma_min_gain < DEFAULT_FIXTURE_THRESHOLDS.minimum_sigma_min_gain_for_stability_widening &&
    goodContext.deficit_class === 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT' &&
    goodContext.selected_probe_id === null &&
    goodContext.selection_status === 'NO_WIDENING_PROPOSED_NO_DECLARED_LOCAL_DEFICIT' &&
    missingContext.deficit_class === 'NOISE_GEOMETRY_INCOMPLETE' &&
    missingContext.selected_probe_id === null &&
    missingContext.selection_status === 'NO_GLOBAL_WIDENING_SELECTION_MISSING_NOISE_GEOMETRY' &&
    invalidContext.deficit_class === 'INVALID_NOISE_GEOMETRY' &&
    invalidContext.selected_probe_id === null &&
    invalidContext.selection_status === 'INVALID_NOISE_GEOMETRY_PRESENT_NO_SELECTION';

  if (!passed) {
    throw new Error('Typed experiment-design state gauntlet violated an authored expectation.');
  }

  return freeze({
    schema: APERTURE_PEDAGOGUE_EXPERIMENT_DESIGN_STATE_SCHEMA,
    source_status: 'SIMULATED',
    authority_class: 'A2_DERIVATIONAL',
    manifestly_fictional: true,
    experiment_host: 'DOME_WORLD_A15_R0',
    thresholds: DEFAULT_FIXTURE_THRESHOLDS,
    contexts: freeze({
      structural_rank_deficit: rankContext,
      numerical_stability_deficit: fragileContext,
      no_declared_local_deficit: goodContext,
      noise_geometry_incomplete: missingContext,
      invalid_noise_geometry: invalidContext
    }),
    bounded_results: freeze([
      'TYPED_EXPERIMENT_DESIGN_STATE_SUPPORTED_IN_BOUNDED_SYNTHETIC_FIXTURES',
      'DEFICIT_CONDITIONAL_QUESTION_DESIGN_REFINEMENT_CANDIDATE',
      'NO_DEFICIT_NO_QUESTION_ABSTENTION_SUPPORTED_IN_BOUNDED_SYNTHETIC_FIXTURE'
    ]),
    reusable_relation_status: 'RESEARCH_REFINEMENT_CANDIDATE_ONLY',
    reusable_relations: freeze([
      'the admissible criterion for a next observation depends on the declared type of current reconstruction deficit',
      'rank_lift = 0 can denote either useless repetition or valuable stabilization when the current operator is already full rank',
      'candidate availability does not itself establish a need for further observation',
      'question design should preserve abstention and rejection when uncertainty geometry is incomplete or invalid'
    ]),
    anti_equivalences: freeze([
      'rank deficit != stability deficit',
      'rank_lift = 0 != useless observation',
      'full rank != sufficient stability',
      'available candidate != needed question',
      'more observations != more recoverability',
      'operator diversity != uncertainty diversity',
      'missing noise geometry != neutral noise geometry',
      'invalid covariance != approximately valid covariance',
      'proposal != execution',
      'widening != validation'
    ]),
    decision_architecture: 'STATE_TO_TYPED_DEFICIT_TO_DEFICIT_APPROPRIATE_ADMISSION_TO_UNCERTAINTY_AUDIT_TO_PROPOSAL_OR_ABSTENTION_OR_REJECTION',
    scalar_magic_score_used: false,
    held_out_used_for_selection: false,
    oracle_identity_consulted: false,
    automatic_execution: false,
    next_learning_action: 'TEST_REPLAY_STABILITY_OF_TYPED_EXPERIMENT_DESIGN_STATE_UNDER_SMALL_THRESHOLD_AND_NOISE_MODEL_PERTURBATIONS_BEFORE_ANY_OPTIMAL_DESIGN_OR_INFORMATION_GEOMETRY_PROMOTION',
    claims: freeze({
      optimal_experimental_design:false,
      active_learning_theorem:false,
      fisher_information_optimality:false,
      information_geometry:false,
      physical_sensor_design:false,
      physical_sensor_calibration:false,
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
      production_authority:false,
      release_authority:false
    }),
    promotion_authority:false,
    production_mutated:false,
    standalone_aperture_ui_mutated:false,
    live_ash_binding:false,
    human_closure_required:true
  });
}
