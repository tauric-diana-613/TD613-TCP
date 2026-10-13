import { freeze } from '../../../engine/flowcore-pedagogue-utils.js';

export const KNOWN_FORWARD_RELATIONAL_RECONSTRUCTION_SCHEMA = 'td613.ash.a15-r0.known-forward-relational-reconstruction/v0.1';

const ORACLE_STATE = Object.freeze([2, 3, 5]);
const OPERATOR_IDS = Object.freeze(['F12', 'F23', 'F13']);
const A = Object.freeze([
  Object.freeze([1, 1, 0]),
  Object.freeze([0, 1, 1]),
  Object.freeze([1, 0, 1])
]);
const A_REPEAT = Object.freeze([
  Object.freeze([1, 1, 0]),
  Object.freeze([1, 1, 0]),
  Object.freeze([1, 1, 0])
]);
const HELDOUT_OPERATOR = Object.freeze([1, 2, 3]);

function round15(value) {
  return Number(value.toFixed(15));
}

function determinant3(matrix) {
  const [[a,b,c],[d,e,f],[g,h,i]] = matrix;
  return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
}

function matrixRank(matrix, tolerance = 1e-12) {
  const work = matrix.map(row => [...row].map(Number));
  const rows = work.length;
  const cols = work[0].length;
  let rank = 0;
  let pivotCol = 0;

  while (rank < rows && pivotCol < cols) {
    let pivotRow = rank;
    for (let r = rank + 1; r < rows; r += 1) {
      if (Math.abs(work[r][pivotCol]) > Math.abs(work[pivotRow][pivotCol])) pivotRow = r;
    }
    if (Math.abs(work[pivotRow][pivotCol]) <= tolerance) {
      pivotCol += 1;
      continue;
    }
    [work[rank], work[pivotRow]] = [work[pivotRow], work[rank]];
    const pivot = work[rank][pivotCol];
    for (let c = pivotCol; c < cols; c += 1) work[rank][c] /= pivot;
    for (let r = 0; r < rows; r += 1) {
      if (r === rank) continue;
      const factor = work[r][pivotCol];
      for (let c = pivotCol; c < cols; c += 1) work[r][c] -= factor * work[rank][c];
    }
    rank += 1;
    pivotCol += 1;
  }
  return rank;
}

function applyOperator(row, state) {
  return row.reduce((sum, coefficient, index) => sum + coefficient * state[index], 0);
}

function applyMatrix(matrix, state) {
  return matrix.map(row => applyOperator(row, state));
}

function l2(vector) {
  return Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
}

function reconstructPairwise({ O12, O23, O13 }) {
  return [
    (O12 + O13 - O23) / 2,
    (O12 + O23 - O13) / 2,
    (O13 + O23 - O12) / 2
  ].map(round15);
}

function residualVector(predicted, observed) {
  return predicted.map((value, index) => round15(value - observed[index]));
}

function reconstructionReceipt({ binding, provenanceValid, heldoutObserved = 23 }) {
  const state = reconstructPairwise(binding);
  const observationVector = [binding.O12, binding.O23, binding.O13];
  const predicted = applyMatrix(A, state).map(round15);
  const residual = residualVector(predicted, observationVector);
  const heldoutPrediction = round15(applyOperator(HELDOUT_OPERATOR, state));
  const heldoutResidual = round15(Math.abs(heldoutPrediction - heldoutObserved));

  return freeze({
    latent_dimension: 3,
    operator_ids: freeze([...OPERATOR_IDS]),
    operator_matrix: A,
    operator_rank: matrixRank(A),
    operator_nullity: 3 - matrixRank(A),
    observation_vector: freeze(observationVector),
    observation_to_operator_binding: freeze({ ...binding }),
    inverse_method: 'CLOSED_FORM_PAIRWISE_LINEAR_INVERSE',
    reconstructed_state: freeze(state),
    in_sample_residual_vector: freeze(residual),
    in_sample_residual_l2: round15(l2(residual)),
    heldout_operator_id: 'H_ASYMMETRIC',
    heldout_operator: HELDOUT_OPERATOR,
    heldout_observation: heldoutObserved,
    heldout_prediction: heldoutPrediction,
    heldout_residual: heldoutResidual,
    operator_provenance_valid: provenanceValid,
    reconstruction_claim_admitted: provenanceValid && heldoutResidual === 0
  });
}

export function runKnownForwardRelationalReconstructionGauntlet() {
  const exactBinding = freeze({ O12: 5, O23: 8, O13: 7 });
  const exactReceipt = reconstructionReceipt({ binding: exactBinding, provenanceValid: true });
  const exactError = exactReceipt.reconstructed_state.map((value, index) => round15(value - ORACLE_STATE[index]));

  const repeatRank = matrixRank(A_REPEAT);
  const repeatControl = freeze({
    operator_matrix: A_REPEAT,
    observation_vector: freeze([5, 5, 5]),
    rank: repeatRank,
    nullity: 3 - repeatRank,
    compatible_family: 'x + y = 5; z unconstrained',
    unique_reconstruction: false,
    repetition_promoted_to_operator_diversity: false,
    classification: 'REPEATED_FORWARD_OPERATOR_REMAINS_UNDERDETERMINED'
  });

  const redundantControl = freeze({
    operator_ids: freeze(['G1', 'G2', 'G3']),
    duplicate_of: freeze({ G1: 'F12', G2: 'F12', G3: 'F12' }),
    operator_matrix: A_REPEAT,
    rank: repeatRank,
    nullity: 3 - repeatRank,
    unique_reconstruction: false,
    classification: 'REDUNDANT_OPERATOR_LABELS_DO_NOT_INCREASE_RECONSTRUCTION_RANK'
  });

  const noisyBinding = freeze({ O12: 5.1, O23: 7.9, O13: 7.0 });
  const noisyState = reconstructPairwise(noisyBinding);
  const noisyError = noisyState.map((value, index) => round15(value - ORACLE_STATE[index]));
  const noisy = freeze({
    observation_binding: noisyBinding,
    reconstructed_state: freeze(noisyState),
    error_vector: freeze(noisyError),
    error_l2: round15(l2(noisyError)),
    classification: 'KNOWN_FORWARD_RECONSTRUCTION_PERTURBATION_PROPAGATED',
    noise_model_inferred: false,
    uncertainty_distribution_estimated: false,
    empirical_error_rate_claim: false
  });

  const correctValidation = freeze({
    ...exactReceipt,
    classification: 'RECONSTRUCTION_PASSES_HELDOUT_OPERATOR_VALIDATION'
  });

  const swappedBinding = freeze({ O12: 5, O23: 7, O13: 8 });
  const swappedReceipt = reconstructionReceipt({ binding: swappedBinding, provenanceValid: false });
  const swappedValidation = freeze({
    ...swappedReceipt,
    classification: 'OPERATOR_OBSERVATION_BINDING_FAILURE_DETECTED_BY_HELDOUT_VALIDATOR'
  });

  const fullRank = matrixRank(A);
  const det = determinant3(A);
  const passed =
    fullRank === 3 &&
    det === 2 &&
    JSON.stringify(exactReceipt.reconstructed_state) === JSON.stringify([2, 3, 5]) &&
    exactReceipt.in_sample_residual_l2 === 0 &&
    exactReceipt.heldout_residual === 0 &&
    round15(l2(exactError)) === 0 &&
    repeatControl.rank === 1 &&
    repeatControl.nullity === 2 &&
    redundantControl.rank === 1 &&
    JSON.stringify(noisy.reconstructed_state) === JSON.stringify([2.1, 3, 4.9]) &&
    noisy.error_l2 === 0.14142135623731 &&
    JSON.stringify(swappedValidation.reconstructed_state) === JSON.stringify([3, 2, 5]) &&
    swappedValidation.in_sample_residual_l2 === 0 &&
    swappedValidation.heldout_prediction === 22 &&
    swappedValidation.heldout_residual === 1 &&
    swappedValidation.operator_provenance_valid === false &&
    swappedValidation.reconstruction_claim_admitted === false;

  if (!passed) throw new Error('Known-forward relational reconstruction violated an authored expectation.');

  return freeze({
    schema: KNOWN_FORWARD_RELATIONAL_RECONSTRUCTION_SCHEMA,
    source_status: 'SIMULATED',
    authority_class: 'A2_DERIVATIONAL',
    manifestly_fictional: true,
    oracle: freeze({
      latent_state: freeze([...ORACLE_STATE]),
      oracle_state_exposed_to_reconstructor: false
    }),
    forward_model: freeze({
      operator_ids: freeze([...OPERATOR_IDS]),
      definitions: freeze({ F12: 'x+y', F23: 'y+z', F13: 'x+z' }),
      matrix: A,
      determinant: det,
      rank: fullRank,
      nullity: 3 - fullRank,
      forward_operator_known: true
    }),
    exact: freeze({
      ...exactReceipt,
      reconstruction_error_vector: freeze(exactError),
      reconstruction_error_l2: 0,
      unique_reconstruction_within_declared_model: true,
      classification: 'KNOWN_FORWARD_RELATIONAL_RECONSTRUCTION_EXACT_IN_SYNTHETIC_FIXTURE'
    }),
    controls: freeze({ repetition: repeatControl, redundant_labels: redundantControl }),
    noisy,
    heldout_validation: freeze({ correct: correctValidation, swapped_binding: swappedValidation }),
    inverse_problem_status: 'KNOWN_FORWARD_LINEAR_INVERSE_PROBLEM_EXECUTED_IN_BOUNDED_SYNTHETIC_FIXTURE',
    tomography_grammar: freeze({
      abstract_experimental_reconstruction_grammar_earned: true,
      physical_tomography: false,
      quantum_state_tomography: false,
      medical_tomography: false,
      blind_tomography: false,
      unknown_operator_reconstruction: false
    }),
    gauntlet_status: 'KNOWN_FORWARD_RELATIONAL_RECONSTRUCTION_GRAMMAR_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE',
    reusable_relation_status: 'RESEARCH_REFINEMENT_CANDIDATE_ONLY',
    reusable_relations: freeze([
      'an inverse reconstruction receipt is inseparable from its forward operators + observation/operator binding + validation residual',
      'repeated precision along one operator cannot substitute for missing operator rank'
    ]),
    next_learning_action: 'TEST_SELF_CALIBRATING_RECONSTRUCTION_WITH_PARTIALLY_UNKNOWN_FORWARD_OPERATOR',
    claims: freeze({
      physical_tomography: false,
      quantum_state_tomography: false,
      medical_tomography: false,
      blind_tomography: false,
      universal_inverse_problem_solvability: false,
      live_td613_latent_state_reconstruction: false,
      empirical_sensor_calibration: false,
      connection: false,
      curvature: false,
      holonomy: false,
      berry_structure: false,
      physical_phasons: false,
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
