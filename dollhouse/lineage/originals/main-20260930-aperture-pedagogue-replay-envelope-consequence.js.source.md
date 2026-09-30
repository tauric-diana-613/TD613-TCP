import { freeze } from '../../../engine/flowcore-pedagogue-utils.js';
import { auditTypedEpistemicDeficit } from '../../../engine/aperture-v32-typed-epistemic-deficit.js';
import {
  normalizeProbeRow,
  singularValuePosture2
} from './aperture-pedagogue-conditioning-widening.js';
import {
  classifyCovariance2,
  whitenByFullCovariance,
  selectCorrelatedNoiseWidening
} from './aperture-pedagogue-correlated-noise-geometry.js';

export const APERTURE_PEDAGOGUE_REPLAY_ENVELOPE_CONSEQUENCE_SCHEMA =
  'td613.ash.a15-r0.aperture-pedagogue-replay-envelope-consequence/v0.1';

const TOLERANCE = 1e-12;
const CONDITION_CEILING = 10;
const SIGMA_FLOOR = 0.25;
const IDENTITY_OPERATOR = Object.freeze([
  Object.freeze([1,0]),
  Object.freeze([0,1])
]);
const SIGMA_BOUNDARY_OPERATOR = Object.freeze([
  Object.freeze([1,0]),
  Object.freeze([0,SIGMA_FLOOR])
]);
const HELD_OUT_FUNCTIONALS = Object.freeze([
  Object.freeze({ id:'H_Y', row:Object.freeze([0,1]) }),
  Object.freeze({ id:'H_DIFF', row:Object.freeze([1,-1]) }),
  Object.freeze({ id:'H_SUM', row:Object.freeze([1,1]) })
]);

function round(value,digits=15){ return Number(value.toFixed(digits)); }
function covariance(rho){ return freeze([freeze([1,rho]),freeze([rho,1])]); }

function candidate(probeId,gradient,rho){
  return freeze({
    probe_id:probeId,
    definition:probeId === 'P_ORTH' ? 'orthogonal y' : 'normalized diagonal x+y',
    gradient:freeze([...gradient]),
    covariance:covariance(rho),
    covariance_source_status:'DECLARED_SYNTHETIC_FULL_COVARIANCE'
  });
}

function selectionAt(rho){
  const selection = selectCorrelatedNoiseWidening([
    candidate('P_ORTH',[0,1],rho),
    candidate('P_DIAG',[1,1],rho)
  ]);
  if (selection.selection_status !== 'FULL_COVARIANCE_WIDENING_PROPOSED') {
    throw new Error(`selection envelope requires complete valid covariance at rho=${rho}.`);
  }
  return selection;
}

function auditFullRank(operator,{sigmaMinFloor=SIGMA_FLOOR,conditionCeiling=CONDITION_CEILING}={}){
  const posture = singularValuePosture2(operator);
  const receipt = auditTypedEpistemicDeficit({
    latent_dimension:2,
    current_rank:2,
    sigma_min:posture.sigma_min,
    condition_number:posture.condition_number_2,
    uncertainty_status:'VALID_DECLARED',
    sigma_min_floor:sigmaMinFloor,
    condition_number_ceiling:conditionCeiling,
    threshold_authority:'OPERATOR_DECLARED_LOCAL_SYNTHETIC_FIXTURE'
  });
  return freeze({ posture, receipt });
}

function sigmaFloorBoundary(){
  const floors = [SIGMA_FLOOR-1e-6,SIGMA_FLOOR,SIGMA_FLOOR+1e-6];
  const replays = floors.map(floor => {
    const {posture,receipt} = auditFullRank(SIGMA_BOUNDARY_OPERATOR,{sigmaMinFloor:floor});
    return freeze({
      sigma_min_floor:round(floor,6),
      observed_sigma_min:posture.sigma_min,
      condition_number:posture.condition_number_2,
      deficit_class:receipt.deficit_class,
      disposition:receipt.disposition
    });
  });
  return freeze({
    analytic_boundary:SIGMA_FLOOR,
    replays:freeze(replays),
    expected_boundary_exposed:
      replays[0].deficit_class === 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT' &&
      replays[1].deficit_class === 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT' &&
      replays[2].deficit_class === 'NUMERICAL_STABILITY_DEFICIT'
  });
}

function correlatedDiagnosticBoundary(){
  const analytic = (CONDITION_CEILING**2 - 1) / (CONDITION_CEILING**2 + 1);
  const rhos = [analytic-1e-6,analytic,analytic+1e-6];
  const replays = rhos.map(rho => {
    const sigma = covariance(rho);
    const covarianceClass = classifyCovariance2(sigma);
    if (!covarianceClass.positive_definite) throw new Error('analytic diagnostic boundary must remain inside valid covariance domain.');
    const whitened = whitenByFullCovariance(IDENTITY_OPERATOR,sigma);
    const posture = singularValuePosture2(whitened);
    const receipt = auditTypedEpistemicDeficit({
      latent_dimension:2,
      current_rank:2,
      sigma_min:posture.sigma_min,
      condition_number:posture.condition_number_2,
      uncertainty_status:'VALID_DECLARED',
      sigma_min_floor:SIGMA_FLOOR,
      condition_number_ceiling:CONDITION_CEILING,
      threshold_authority:'OPERATOR_DECLARED_LOCAL_SYNTHETIC_FIXTURE'
    });
    return freeze({
      rho:round(rho,12),
      condition_number:posture.condition_number_2,
      deficit_class:receipt.deficit_class,
      disposition:receipt.disposition
    });
  });
  return freeze({
    condition_number_ceiling:CONDITION_CEILING,
    analytic_boundary:round(analytic,15),
    analytic_fraction:'99/101',
    raw_operator_unchanged:true,
    replays:freeze(replays),
    expected_boundary_exposed:
      replays[0].deficit_class === 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT' &&
      replays[2].deficit_class === 'NUMERICAL_STABILITY_DEFICIT'
  });
}

function selectionBoundary(){
  let lower = 0.545;
  let upper = 0.547;
  const lowerSelection = selectionAt(lower).selected_probe_id;
  const upperSelection = selectionAt(upper).selected_probe_id;
  if (lowerSelection !== 'P_ORTH' || upperSelection !== 'P_DIAG') {
    throw new Error('selection-boundary seed interval no longer brackets P_ORTH -> P_DIAG.');
  }
  let iterations = 0;
  while (upper-lower >= 1e-10 && iterations < 80) {
    const midpoint = (lower+upper)/2;
    const selected = selectionAt(midpoint).selected_probe_id;
    if (selected === 'P_ORTH') lower = midpoint;
    else if (selected === 'P_DIAG') upper = midpoint;
    else throw new Error(`unexpected selection ${selected} inside bracket.`);
    iterations += 1;
  }
  const lowerReceipt = selectionAt(lower);
  const upperReceipt = selectionAt(upper);
  return freeze({
    seed_interval:freeze([0.545,0.547]),
    lower:round(lower,15),
    upper:round(upper,15),
    midpoint:round((lower+upper)/2,15),
    width:round(upper-lower,15),
    iterations,
    lower_selected_probe_id:lowerReceipt.selected_probe_id,
    upper_selected_probe_id:upperReceipt.selected_probe_id,
    bracket_valid:
      lowerReceipt.selected_probe_id === 'P_ORTH' &&
      upperReceipt.selected_probe_id === 'P_DIAG' &&
      lower > 0.545 && upper < 0.547 &&
      upper-lower < 1e-8
  });
}

function inverse2(matrix){
  const [[a,b],[c,d]] = matrix;
  const determinant = a*d-b*c;
  if (Math.abs(determinant) <= TOLERANCE) throw new Error('held-out consequence matrix must be invertible.');
  return [
    [d/determinant,-b/determinant],
    [-c/determinant,a/determinant]
  ];
}

function transpose(matrix){ return matrix[0].map((_,column)=>matrix.map(row=>row[column])); }
function multiplyMatrices(left,right){
  return left.map(row => right[0].map((_,column) =>
    row.reduce((sum,value,index)=>sum+value*right[index][column],0)
  ));
}
function quadratic(row,matrix){
  const product = matrix.map(matrixRow=>matrixRow.reduce((sum,value,index)=>sum+value*row[index],0));
  return row.reduce((sum,value,index)=>sum+value*product[index],0);
}

function candidateObservationMatrix(probeId){
  const gradient = probeId === 'P_ORTH' ? [0,1] : [1,1];
  const normalized = normalizeProbeRow(gradient);
  return [[1,0],[...normalized]];
}

function heldOutRiskVector(probeId,rho){
  const A = candidateObservationMatrix(probeId);
  const inv = inverse2(A);
  const reconstructionCovariance = multiplyMatrices(
    multiplyMatrices(inv,covariance(rho)),
    transpose(inv)
  );
  const variances = {};
  for (const functional of HELD_OUT_FUNCTIONALS) {
    variances[functional.id] = round(quadratic(functional.row,reconstructionCovariance),12);
  }
  return freeze({
    probe_id:probeId,
    rho:round(rho,15),
    normalized_probe_row:freeze([...A[1]]),
    held_out_variances:freeze(variances)
  });
}

function consequenceEnvelope(boundary){
  const points = freeze([
    freeze({id:'LEFT',rho:0.545}),
    freeze({id:'BOUNDARY_MID',rho:boundary.midpoint}),
    freeze({id:'RIGHT',rho:0.547})
  ]);
  const evaluations = points.map(point => {
    const selection = selectionAt(point.rho);
    const orth = heldOutRiskVector('P_ORTH',point.rho);
    const diag = heldOutRiskVector('P_DIAG',point.rho);
    const winners = {};
    for (const functional of HELD_OUT_FUNCTIONALS) {
      const id = functional.id;
      const orthValue = orth.held_out_variances[id];
      const diagValue = diag.held_out_variances[id];
      winners[id] = orthValue < diagValue ? 'P_ORTH' : diagValue < orthValue ? 'P_DIAG' : 'TIE';
    }
    const selectedVector = selection.selected_probe_id === 'P_ORTH'
      ? orth.held_out_variances
      : diag.held_out_variances;
    return freeze({
      point_id:point.id,
      rho:point.rho,
      selected_probe_id:selection.selected_probe_id,
      orth,
      diag,
      functional_winners:freeze(winners),
      selected_policy_consequence_vector:selectedVector
    });
  });

  const left = evaluations[0];
  const right = evaluations[2];
  const candidateContinuity = {};
  for (const probeId of ['P_ORTH','P_DIAG']) {
    const key = probeId === 'P_ORTH' ? 'orth' : 'diag';
    const deltas = {};
    for (const functional of HELD_OUT_FUNCTIONALS) {
      const id = functional.id;
      deltas[id] = round(Math.abs(
        left[key].held_out_variances[id] - right[key].held_out_variances[id]
      ),12);
    }
    candidateContinuity[probeId] = freeze({
      left_to_right_absolute_deltas:freeze(deltas),
      locally_smooth:Object.values(deltas).every(value=>value<0.02)
    });
  }

  const winnersStable = HELD_OUT_FUNCTIONALS.every(functional =>
    left.functional_winners[functional.id] === right.functional_winners[functional.id]
  );
  const winnerSet = new Set(Object.values(left.functional_winners));
  const mixedCriterionWinners = winnerSet.has('P_ORTH') && winnerSet.has('P_DIAG');

  const nearBoundaryLeft = heldOutRiskVector('P_ORTH',boundary.lower);
  const nearBoundaryRight = heldOutRiskVector('P_DIAG',boundary.upper);
  const policyJump = {};
  for (const functional of HELD_OUT_FUNCTIONALS) {
    const id = functional.id;
    policyJump[id] = round(
      nearBoundaryRight.held_out_variances[id] - nearBoundaryLeft.held_out_variances[id],
      12
    );
  }

  return freeze({
    held_out_functionals:HELD_OUT_FUNCTIONALS,
    evaluations:freeze(evaluations),
    candidate_continuity:freeze(candidateContinuity),
    functional_winners_stable_across_neighborhood:winnersStable,
    mixed_functional_winners:mixedCriterionWinners,
    selected_question_flips:left.selected_probe_id === 'P_ORTH' && right.selected_probe_id === 'P_DIAG',
    selected_policy_boundary_jump_vector:freeze(policyJump),
    no_scalar_aggregation:true,
    held_out_used_for_selection:false
  });
}

export function runAperturePedagogueReplayEnvelopeConsequenceAssay(){
  const sigmaBoundary = sigmaFloorBoundary();
  const noiseBoundary = correlatedDiagnosticBoundary();
  const questionBoundary = selectionBoundary();
  const consequence = consequenceEnvelope(questionBoundary);

  const passed =
    sigmaBoundary.expected_boundary_exposed === true &&
    sigmaBoundary.analytic_boundary === 0.25 &&
    noiseBoundary.raw_operator_unchanged === true &&
    noiseBoundary.expected_boundary_exposed === true &&
    Math.abs(noiseBoundary.analytic_boundary - 99/101) < 1e-12 &&
    questionBoundary.bracket_valid === true &&
    consequence.candidate_continuity.P_ORTH.locally_smooth === true &&
    consequence.candidate_continuity.P_DIAG.locally_smooth === true &&
    consequence.functional_winners_stable_across_neighborhood === true &&
    consequence.mixed_functional_winners === true &&
    consequence.selected_question_flips === true &&
    consequence.no_scalar_aggregation === true &&
    consequence.held_out_used_for_selection === false;

  if (!passed) throw new Error('Aperture × Pedagogue replay-envelope consequence assay violated an authored falsifier.');

  return freeze({
    schema:APERTURE_PEDAGOGUE_REPLAY_ENVELOPE_CONSEQUENCE_SCHEMA,
    source_status:'SIMULATED',
    authority_class:'A2_DERIVATIONAL',
    manifestly_fictional:true,
    experiment_host:'DOME_WORLD_A15_R0',
    boundary_map:freeze({
      sigma_floor:sigmaBoundary,
      correlated_noise_diagnostic:noiseBoundary,
      question_selection:questionBoundary
    }),
    held_out_consequence:consequence,
    bounded_results:freeze([
      'LOCAL_TYPED_DIAGNOSTIC_BOUNDARIES_MAPPED_IN_BOUNDED_SYNTHETIC_FIXTURE',
      'QUESTION_SELECTION_BOUNDARY_NUMERICALLY_BRACKETED_IN_BOUNDED_SYNTHETIC_FIXTURE',
      'CANDIDATE_HELD_OUT_CONSEQUENCE_SURFACES_REMAIN_LOCAL_SMOOTH_ACROSS_SELECTION_SWITCH',
      'DISCRETE_SELECTION_POLICY_CAN_CHANGE_REALIZED_CONSEQUENCE_VECTOR_WITHOUT_UNDERLYING_PERFORMANCE_CLIFF',
      'MULTIPLE_HELD_OUT_FUNCTIONALS_REFUSE_UNIVERSAL_BEST_QUESTION_CROWN'
    ]),
    reusable_relation_status:'RESEARCH_REFINEMENT_CANDIDATE_ONLY',
    reusable_relations:freeze([
      'a categorical decision boundary can be real without being a physical or universal performance cliff',
      'smooth candidate consequence functions can coexist with a discontinuous selected-policy consequence because the policy switches candidates',
      'question selection under one declared criterion does not establish universal downstream optimality',
      'local replay-envelope mapping should preserve separate diagnosis, selection, and consequence objects'
    ]),
    anti_equivalences:freeze([
      'categorical decision boundary != physical/performance cliff',
      'smooth candidate consequence surface != smooth selected-policy consequence',
      'question selected by one declared criterion != universally best question',
      'local boundary map != universal robustness radius',
      'held-out consequence audit != held-out-driven selection',
      'research witness != installed release authority'
    ]),
    no_scalar_crown:true,
    next_learning_action:'TEST_MULTI_DIMENSIONAL_REPLAY_ENVELOPE_INTERSECTIONS_AND_PREDECLARED_DECISION_LOSS_WITHOUT_OPTIMAL_DESIGN_OR_INFORMATION_GEOMETRY_PROMOTION',
    installed_aperture_replay_flag_mutated:false,
    installed_aperture_replay_flag_expected:'HELD_NOT_YET_WITNESSED',
    promotion_authority:false,
    automatic_execution:false,
    production_mutated:false,
    standalone_aperture_ui_mutated:false,
    human_closure_required:true,
    claims:freeze({
      universal_robustness_radius:false,
      universal_best_question:false,
      optimal_experimental_design:false,
      active_learning_optimality:false,
      information_geometry:false,
      physical_sensor_design:false,
      physical_tomography:false,
      medical_tomography:false,
      blind_tomography:false,
      operator_tomography:false,
      live_td613_reconstruction:false,
      autonomous_experiment_execution:false,
      connection:false,
      curvature:false,
      holonomy:false,
      berry_structure:false,
      quantum_behavior:false,
      proto_loom:false,
      production_authority:false,
      release_authority:false
    })
  });
}
