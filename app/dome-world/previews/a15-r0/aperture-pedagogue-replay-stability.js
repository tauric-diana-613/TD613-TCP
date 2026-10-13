import { freeze } from '../../../engine/flowcore-pedagogue-utils.js';
import { auditTypedEpistemicDeficit } from '../../../engine/aperture-v32-typed-epistemic-deficit.js';
import {
  singularValuePosture2
} from './aperture-pedagogue-conditioning-widening.js';
import {
  classifyCovariance2,
  whitenByFullCovariance,
  selectCorrelatedNoiseWidening
} from './aperture-pedagogue-correlated-noise-geometry.js';
import {
  DEFAULT_FIXTURE_THRESHOLDS,
  diagnoseExperimentDesignState
} from './aperture-pedagogue-experiment-design-state.js';

export const APERTURE_PEDAGOGUE_REPLAY_STABILITY_SCHEMA =
  'td613.ash.a15-r0.aperture-pedagogue-replay-stability/v0.1';

const STRUCTURAL_OPERATOR = Object.freeze([[1, 0]]);
const STRUCTURAL_CANDIDATES = Object.freeze([
  Object.freeze({ probe_id:'R_DUP', gradient:Object.freeze([1,0]) }),
  Object.freeze({ probe_id:'R_NEAR', gradient:Object.freeze([1,0.001]) }),
  Object.freeze({ probe_id:'R_ORTH', gradient:Object.freeze([0,1]) })
]);
const THRESHOLD_BOUNDARY_OPERATOR = Object.freeze([
  Object.freeze([1,0]),
  Object.freeze([0,0.25])
]);
const IDENTITY_OPERATOR = Object.freeze([
  Object.freeze([1,0]),
  Object.freeze([0,1])
]);
const NOMINAL_THRESHOLDS = Object.freeze({
  sigma_min_floor:0.25,
  condition_number_ceiling:10,
  minimum_sigma_min_gain_for_stability_widening:0.05
});

function round(value, digits = 15) {
  return Number(value.toFixed(digits));
}

function dispositionForResearchClass(deficitClass) {
  if (deficitClass === 'STRUCTURAL_RANK_DEFICIT' || deficitClass === 'NUMERICAL_STABILITY_DEFICIT') return 'PROPOSE';
  if (deficitClass === 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT') return 'ASK_NOTHING';
  if (deficitClass === 'NOISE_GEOMETRY_INCOMPLETE') return 'ABSTAIN';
  if (deficitClass === 'INVALID_NOISE_GEOMETRY') return 'REJECT';
  return 'UNRESOLVED';
}

function criterionForResearchClass(deficitClass) {
  if (deficitClass === 'STRUCTURAL_RANK_DEFICIT') return 'SEEK_PREDECLARED_NULLSPACE_CONTRACTING_OBSERVATION_THEN_AUDIT_STABILITY';
  if (deficitClass === 'NUMERICAL_STABILITY_DEFICIT') return 'SEEK_PREDECLARED_STABILIZING_OBSERVATION_WITHOUT_REQUIRING_RANK_LIFT';
  if (deficitClass === 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT') return 'DO_NOT_MANUFACTURE_A_QUESTION';
  return null;
}

function researchDiagnosticSignature(state) {
  return freeze({
    deficit_class:state.deficit_class,
    disposition:dispositionForResearchClass(state.deficit_class),
    admissible_question_criterion:criterionForResearchClass(state.deficit_class),
    uncertainty_geometry_status:state.uncertainty_geometry_status
  });
}

function installedAuditForFullRank(operator, thresholds = NOMINAL_THRESHOLDS) {
  const posture = singularValuePosture2(operator);
  if (posture.condition_number_2 === null) throw new Error('installed full-rank audit requires finite conditioning posture.');
  const receipt = auditTypedEpistemicDeficit({
    latent_dimension:2,
    current_rank:2,
    sigma_min:posture.sigma_min,
    condition_number:posture.condition_number_2,
    uncertainty_status:'VALID_DECLARED',
    sigma_min_floor:thresholds.sigma_min_floor,
    condition_number_ceiling:thresholds.condition_number_ceiling,
    threshold_authority:'OPERATOR_DECLARED_LOCAL_SYNTHETIC_FIXTURE'
  });
  return freeze({ posture, receipt });
}

function covariance(rho) {
  return freeze([
    freeze([1,rho]),
    freeze([rho,1])
  ]);
}

function thresholdReplayStructuralInterior() {
  const floors = [0.225,0.25,0.275];
  const ceilings = [9,10,11];
  const replays = [];
  for (const floor of floors) {
    for (const ceiling of ceilings) {
      const state = diagnoseExperimentDesignState({
        operator:STRUCTURAL_OPERATOR,
        candidates:STRUCTURAL_CANDIDATES,
        thresholds:{
          ...DEFAULT_FIXTURE_THRESHOLDS,
          sigma_min_floor:floor,
          condition_number_ceiling:ceiling
        }
      });
      replays.push(freeze({
        sigma_min_floor:floor,
        condition_number_ceiling:ceiling,
        diagnostic:researchDiagnosticSignature(state),
        selection_status:state.selection_status,
        selected_probe_id:state.selected_probe_id
      }));
    }
  }
  const diagnosticStable = replays.every(item =>
    item.diagnostic.deficit_class === 'STRUCTURAL_RANK_DEFICIT' &&
    item.diagnostic.disposition === 'PROPOSE' &&
    item.diagnostic.admissible_question_criterion === 'SEEK_PREDECLARED_NULLSPACE_CONTRACTING_OBSERVATION_THEN_AUDIT_STABILITY'
  );
  const selectionStable = replays.every(item => item.selected_probe_id === 'R_ORTH');
  return freeze({
    replay_count:replays.length,
    replays:freeze(replays),
    diagnostic_stable:diagnosticStable,
    question_selection_stable:selectionStable,
    classification:'STABLE_STRUCTURAL_INTERIOR_WITHIN_DECLARED_THRESHOLD_ENVELOPE'
  });
}

function thresholdBoundaryReplay() {
  const floors = [0.24,0.25,0.26];
  const replays = floors.map(floor => {
    const { posture, receipt } = installedAuditForFullRank(THRESHOLD_BOUNDARY_OPERATOR, {
      ...NOMINAL_THRESHOLDS,
      sigma_min_floor:floor
    });
    return freeze({
      sigma_min_floor:floor,
      sigma_min:posture.sigma_min,
      condition_number:posture.condition_number_2,
      deficit_class:receipt.deficit_class,
      disposition:receipt.disposition,
      criterion:receipt.admissible_question_criterion
    });
  });
  const classes = replays.map(item => item.deficit_class);
  const diagnosticStable = new Set(classes).size === 1;
  return freeze({
    replays:freeze(replays),
    diagnostic_stable:diagnosticStable,
    expected_boundary_exposed:
      replays[0].deficit_class === 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT' &&
      replays[1].deficit_class === 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT' &&
      replays[2].deficit_class === 'NUMERICAL_STABILITY_DEFICIT',
    classification:'THRESHOLD_SENSITIVE_DIAGNOSTIC_CLASSIFICATION'
  });
}

function noiseModelBoundaryReplay() {
  const rhos = [0.978,0.98,0.982];
  const replays = rhos.map(rho => {
    const declaredCovariance = covariance(rho);
    const covarianceClass = classifyCovariance2(declaredCovariance);
    if (!covarianceClass.positive_definite) throw new Error(`noise replay covariance rho=${rho} must remain SPD.`);
    const whitened = whitenByFullCovariance(IDENTITY_OPERATOR, declaredCovariance);
    const posture = singularValuePosture2(whitened);
    const receipt = auditTypedEpistemicDeficit({
      latent_dimension:2,
      current_rank:2,
      sigma_min:posture.sigma_min,
      condition_number:posture.condition_number_2,
      uncertainty_status:'VALID_DECLARED',
      sigma_min_floor:NOMINAL_THRESHOLDS.sigma_min_floor,
      condition_number_ceiling:NOMINAL_THRESHOLDS.condition_number_ceiling,
      threshold_authority:'OPERATOR_DECLARED_LOCAL_SYNTHETIC_FIXTURE'
    });
    return freeze({
      rho,
      covariance_status:covarianceClass.status,
      covariance_determinant:covarianceClass.determinant,
      sigma_min:posture.sigma_min,
      condition_number:posture.condition_number_2,
      deficit_class:receipt.deficit_class,
      disposition:receipt.disposition,
      criterion:receipt.admissible_question_criterion
    });
  });
  const diagnosticStable = new Set(replays.map(item => item.deficit_class)).size === 1;
  return freeze({
    raw_operator_unchanged:true,
    replays:freeze(replays),
    diagnostic_stable:diagnosticStable,
    expected_boundary_exposed:
      replays[0].deficit_class === 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT' &&
      replays[1].deficit_class === 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT' &&
      replays[2].deficit_class === 'NUMERICAL_STABILITY_DEFICIT',
    classification:'VALID_NOISE_MODEL_PERTURBATION_CAN_CHANGE_DIAGNOSTIC_CLASSIFICATION'
  });
}

function correlatedCandidate(probeId, gradient, rho) {
  return freeze({
    probe_id:probeId,
    definition:probeId === 'P_ORTH' ? 'orthogonal y' : 'diagonal x+y',
    gradient:freeze([...gradient]),
    covariance:covariance(rho),
    covariance_source_status:'DECLARED_SYNTHETIC_FULL_COVARIANCE'
  });
}

function selectionBoundaryReplay() {
  const currentState = diagnoseExperimentDesignState({
    operator:STRUCTURAL_OPERATOR,
    candidates:[
      { probe_id:'P_ORTH', gradient:[0,1] },
      { probe_id:'P_DIAG', gradient:[1,1] }
    ]
  });
  const diagnostic = researchDiagnosticSignature(currentState);
  const rhos = [0.545,0.547];
  const replays = rhos.map(rho => {
    const selection = selectCorrelatedNoiseWidening([
      correlatedCandidate('P_ORTH',[0,1],rho),
      correlatedCandidate('P_DIAG',[1,1],rho)
    ]);
    return freeze({
      rho,
      deficit_class:diagnostic.deficit_class,
      disposition:diagnostic.disposition,
      admissible_question_criterion:diagnostic.admissible_question_criterion,
      selection_status:selection.selection_status,
      selected_probe_id:selection.selected_probe_id,
      candidate_receipts:selection.scores
    });
  });
  const diagnosticStable = replays.every(item =>
    item.deficit_class === replays[0].deficit_class &&
    item.disposition === replays[0].disposition &&
    item.admissible_question_criterion === replays[0].admissible_question_criterion
  );
  const questionSelectionStable = replays.every(item => item.selected_probe_id === replays[0].selected_probe_id);
  return freeze({
    replays:freeze(replays),
    diagnostic_stable:diagnosticStable,
    question_selection_stable:questionSelectionStable,
    expected_selection_flip:
      replays[0].selected_probe_id === 'P_ORTH' &&
      replays[1].selected_probe_id === 'P_DIAG',
    classification:'DIAGNOSTIC_STABILITY_WITH_QUESTION_SELECTION_SENSITIVITY'
  });
}

function invalidIncompleteControls() {
  const incomplete = diagnoseExperimentDesignState({
    operator:STRUCTURAL_OPERATOR,
    candidates:[
      { probe_id:'M_ORTH', gradient:[0,1], noise_geometry_status:'DECLARED_EQUAL_VARIANCE' },
      { probe_id:'M_DIAG', gradient:[1,1], noise_geometry_status:'UNRESOLVED' }
    ]
  });
  const invalid = diagnoseExperimentDesignState({
    operator:STRUCTURAL_OPERATOR,
    candidates:[
      { probe_id:'I_ORTH', gradient:[0,1], noise_geometry_status:'DECLARED_EQUAL_VARIANCE' },
      { probe_id:'I_BAD', gradient:[1,1], noise_geometry_status:'INVALID_NOISE_GEOMETRY_NOT_POSITIVE_DEFINITE' }
    ]
  });
  return freeze({
    incomplete:freeze({
      deficit_class:incomplete.deficit_class,
      selection_status:incomplete.selection_status,
      selected_probe_id:incomplete.selected_probe_id
    }),
    invalid:freeze({
      deficit_class:invalid.deficit_class,
      selection_status:invalid.selection_status,
      selected_probe_id:invalid.selected_probe_id
    }),
    categorical_gate_preserved:
      incomplete.deficit_class === 'NOISE_GEOMETRY_INCOMPLETE' &&
      incomplete.selected_probe_id === null &&
      invalid.deficit_class === 'INVALID_NOISE_GEOMETRY' &&
      invalid.selected_probe_id === null
  });
}

export function runAperturePedagogueReplayStabilityGauntlet() {
  const structuralInterior = thresholdReplayStructuralInterior();
  const thresholdBoundary = thresholdBoundaryReplay();
  const noiseModelBoundary = noiseModelBoundaryReplay();
  const selectionBoundary = selectionBoundaryReplay();
  const uncertaintyControls = invalidIncompleteControls();

  const noiseConditions = noiseModelBoundary.replays.map(item => item.condition_number);
  const selectionRhos = selectionBoundary.replays.map(item => item.rho);

  const passed =
    structuralInterior.diagnostic_stable === true &&
    structuralInterior.question_selection_stable === true &&
    thresholdBoundary.diagnostic_stable === false &&
    thresholdBoundary.expected_boundary_exposed === true &&
    noiseModelBoundary.diagnostic_stable === false &&
    noiseModelBoundary.expected_boundary_exposed === true &&
    noiseConditions[0] > 9.47 && noiseConditions[0] < 9.50 &&
    noiseConditions[1] > 9.94 && noiseConditions[1] < 9.96 &&
    noiseConditions[2] > 10.48 && noiseConditions[2] < 10.51 &&
    selectionBoundary.diagnostic_stable === true &&
    selectionBoundary.question_selection_stable === false &&
    selectionBoundary.expected_selection_flip === true &&
    round(selectionRhos[1] - selectionRhos[0], 3) === 0.002 &&
    uncertaintyControls.categorical_gate_preserved === true;

  if (!passed) {
    throw new Error('Aperture × Pedagogue replay-stability gauntlet violated an authored expectation.');
  }

  return freeze({
    schema:APERTURE_PEDAGOGUE_REPLAY_STABILITY_SCHEMA,
    source_status:'SIMULATED',
    authority_class:'A2_DERIVATIONAL',
    manifestly_fictional:true,
    experiment_host:'DOME_WORLD_A15_R0',
    replay_families:freeze({
      structural_interior:structuralInterior,
      threshold_boundary:thresholdBoundary,
      noise_model_boundary:noiseModelBoundary,
      selection_boundary:selectionBoundary,
      invalid_incomplete_controls:uncertaintyControls
    }),
    replay_dimensions:freeze([
      'diagnostic_class',
      'disposition',
      'admissible_question_criterion',
      'uncertainty_geometry',
      'selection_status',
      'selected_probe'
    ]),
    bounded_results:freeze([
      'INTERIOR_TYPED_DEFICIT_REPLAY_STABILITY_SUPPORTED_IN_BOUNDED_SYNTHETIC_ENVELOPE',
      'THRESHOLD_SENSITIVE_DIAGNOSTIC_BOUNDARY_WITNESSED_IN_BOUNDED_SYNTHETIC_FIXTURE',
      'VALID_NOISE_MODEL_SENSITIVITY_OF_DIAGNOSTIC_CLASSIFICATION_WITNESSED_IN_BOUNDED_SYNTHETIC_FIXTURE',
      'DIAGNOSTIC_STABILITY_WITH_QUESTION_SELECTION_SENSITIVITY_WITNESSED_IN_BOUNDED_SYNTHETIC_FIXTURE'
    ]),
    reusable_relation_status:'RESEARCH_REFINEMENT_CANDIDATE_ONLY',
    reusable_relations:freeze([
      'replay stability is multi-axis: stability of the deficit diagnosis does not imply stability of the preferred next question',
      'a typed deficit can be stable in the interior of a declared local regime while remaining threshold-sensitive near its decision boundary',
      'valid nearby uncertainty models can change the admitted stability classification without changing the raw forward operator',
      'invalid or incomplete uncertainty remains a categorical abstention/rejection gate rather than a perturbation to average away'
    ]),
    anti_equivalences:freeze([
      'diagnostic stability != question-selection stability',
      'threshold sensitivity != classifier failure',
      'raw operator invariance != uncertainty-geometry invariance',
      'valid nearby noise model != identical experimental-design state',
      'replay count != replay authority',
      'research witness != installed-release promotion'
    ]),
    no_scalar_crown:true,
    installed_aperture_replay_flag_mutated:false,
    installed_aperture_replay_flag_expected:'HELD_NOT_YET_WITNESSED',
    next_learning_action:'TEST_REPLAY_ENVELOPE_GEOMETRY_AND_HELD_OUT_DECISION_CONSEQUENCE_BEFORE_ANY_REPLAY_PROMOTION_OR_OPTIMAL_DESIGN_CLAIM',
    claims:freeze({
      universal_threshold_robustness:false,
      universal_perturbation_radius:false,
      optimal_experimental_design:false,
      active_learning_optimality:false,
      fisher_information_optimality:false,
      information_geometry:false,
      physical_sensor_design:false,
      physical_sensor_calibration:false,
      physical_tomography:false,
      blind_tomography:false,
      operator_tomography:false,
      live_td613_reconstruction:false,
      autonomous_observation:false,
      autonomous_experiment_execution:false,
      connection:false,
      curvature:false,
      holonomy:false,
      berry_structure:false,
      quantum_behavior:false,
      proto_loom:false,
      production_authority:false,
      release_authority:false
    }),
    promotion_authority:false,
    automatic_execution:false,
    production_mutated:false,
    standalone_aperture_ui_mutated:false,
    human_closure_required:true
  });
}
