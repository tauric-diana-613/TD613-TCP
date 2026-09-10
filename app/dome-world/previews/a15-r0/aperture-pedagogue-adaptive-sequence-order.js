import {
  auditTypedEpistemicDeficit
} from '../../../engine/aperture-v32-typed-epistemic-deficit.js';
import {
  operatorGeometry
} from './aperture-pedagogue-endogenous-observation-reaudit.js';

export const ADAPTIVE_SEQUENCE_ORDER_SCHEMA =
  'td613.a15-r0.aperture-pedagogue-adaptive-sequence-order/v0.1';

const EPSILON = 0.001;
const TOLERANCE = 1e-10;
const ANCHOR_ROW = Object.freeze([1, 0]);
const INITIAL_RESPONSIVE_ROW = Object.freeze([1, 0]);
const LOCAL_THRESHOLDS = Object.freeze({
  sigma_min_floor:0.25,
  condition_number_ceiling:10,
  uncertainty_status:'VALID_DECLARED',
  threshold_authority:'A15_R0_SYNTHETIC_LOCAL'
});

export const Q_A_MATRIX = Object.freeze([
  Object.freeze([1, 0]),
  Object.freeze([EPSILON, 1])
]);

export const Q_B_MATRIX = Object.freeze([
  Object.freeze([1, -1 / EPSILON]),
  Object.freeze([-EPSILON, (1 + EPSILON) / EPSILON])
]);

const Q_STABILIZE_MATRIX = Object.freeze([
  Object.freeze([0, 1]),
  Object.freeze([1, 0])
]);

const MAIN_TRANSITIONS = Object.freeze({
  Q_A:Object.freeze({ question_id:'Q_A', transition_status:'DECLARED_SYNTHETIC', matrix:Q_A_MATRIX }),
  Q_B:Object.freeze({ question_id:'Q_B', transition_status:'DECLARED_SYNTHETIC', matrix:Q_B_MATRIX }),
  Q_STABILIZE:Object.freeze({ question_id:'Q_STABILIZE', transition_status:'DECLARED_SYNTHETIC', matrix:Q_STABILIZE_MATRIX }),
  Q_UNDECLARED:Object.freeze({ question_id:'Q_UNDECLARED', transition_status:'UNDECLARED', matrix:null })
});

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

function finite(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError(`${label} must be finite`);
  return number;
}

function row2(row, label = 'row') {
  if (!Array.isArray(row) || row.length !== 2) throw new TypeError(`${label} must be a two-component row`);
  return row.map((value, index) => finite(value, `${label}[${index}]`));
}

function matrix2(matrix, label = 'matrix') {
  if (!Array.isArray(matrix) || matrix.length !== 2) throw new TypeError(`${label} must be 2x2`);
  return matrix.map((row, index) => row2(row, `${label}[${index}]`));
}

export function multiplyMatrixVector(matrix, vector) {
  const m = matrix2(matrix);
  const v = row2(vector, 'vector');
  return deepFreeze([
    m[0][0] * v[0] + m[0][1] * v[1],
    m[1][0] * v[0] + m[1][1] * v[1]
  ]);
}

export function multiplyMatrices(left, right) {
  const a = matrix2(left, 'left');
  const b = matrix2(right, 'right');
  return deepFreeze([
    deepFreeze([
      a[0][0] * b[0][0] + a[0][1] * b[1][0],
      a[0][0] * b[0][1] + a[0][1] * b[1][1]
    ]),
    deepFreeze([
      a[1][0] * b[0][0] + a[1][1] * b[1][0],
      a[1][0] * b[0][1] + a[1][1] * b[1][1]
    ])
  ]);
}

export function matrixDifferenceNorm(left, right) {
  const a = matrix2(left, 'left');
  const b = matrix2(right, 'right');
  let sum = 0;
  for (let i = 0; i < 2; i += 1) {
    for (let j = 0; j < 2; j += 1) {
      const delta = a[i][j] - b[i][j];
      sum += delta * delta;
    }
  }
  return Math.sqrt(sum);
}

function vectorDistance(left, right) {
  const a = row2(left, 'left');
  const b = row2(right, 'right');
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function auditRows(rows) {
  const geometry = operatorGeometry(rows);
  const aperture = auditTypedEpistemicDeficit({
    latent_dimension:geometry.latent_dimension,
    current_rank:geometry.rank,
    sigma_min:geometry.sigma_min,
    condition_number:geometry.condition_number,
    ...LOCAL_THRESHOLDS
  });
  return deepFreeze({ geometry, aperture });
}

function operatorRows(responsiveRow) {
  return [ANCHOR_ROW, row2(responsiveRow, 'responsiveRow')];
}

export function evaluateCounterfactualSequence(questionIds, transitions = MAIN_TRANSITIONS) {
  if (!Array.isArray(questionIds) || questionIds.length === 0) throw new TypeError('questionIds must be a non-empty array');
  let responsiveRow = [...INITIAL_RESPONSIVE_ROW];
  let audit = auditRows(operatorRows(responsiveRow));
  const steps = [];
  let terminalStatus = 'SEQUENCE_COUNTERFACTUAL_COMPLETE';

  for (let index = 0; index < questionIds.length; index += 1) {
    const questionId = String(questionIds[index]);
    const transition = transitions?.[questionId];

    if (audit.aperture.disposition !== 'PROPOSE') {
      terminalStatus = 'SECOND_QUESTION_NOT_NEEDED';
      steps.push(deepFreeze({
        step:index + 1,
        question_id:questionId,
        applied:false,
        hold_reason:'CURRENT_APERTURE_DOES_NOT_PROPOSE_ANOTHER_QUESTION',
        pre_step_aperture:audit.aperture,
        responsive_row_before:deepFreeze([...responsiveRow]),
        responsive_row_after:null,
        counterfactual_only:true,
        observation_executed:false
      }));
      break;
    }

    if (!transition || transition.transition_status !== 'DECLARED_SYNTHETIC' || !transition.matrix) {
      terminalStatus = 'SEQUENCE_OPERATOR_MODEL_INCOMPLETE';
      steps.push(deepFreeze({
        step:index + 1,
        question_id:questionId,
        applied:false,
        hold_reason:'ABSTAIN_BEFORE_SEQUENCE_COMPLETION',
        pre_step_aperture:audit.aperture,
        responsive_row_before:deepFreeze([...responsiveRow]),
        responsive_row_after:null,
        counterfactual_only:true,
        observation_executed:false
      }));
      break;
    }

    const before = [...responsiveRow];
    responsiveRow = [...multiplyMatrixVector(transition.matrix, responsiveRow)];
    audit = auditRows(operatorRows(responsiveRow));
    steps.push(deepFreeze({
      step:index + 1,
      question_id:questionId,
      applied:true,
      transition_status:'DECLARED_SYNTHETIC',
      responsive_row_before:deepFreeze(before),
      responsive_row_after:deepFreeze([...responsiveRow]),
      post_step_geometry:audit.geometry,
      post_step_aperture:audit.aperture,
      counterfactual_only:true,
      observation_executed:false
    }));
  }

  return deepFreeze({
    question_ids:questionIds.map(String),
    same_multiset_key:questionIds.map(String).sort().join('|'),
    initial:auditRows(operatorRows(INITIAL_RESPONSIVE_ROW)),
    steps,
    final_responsive_row:deepFreeze([...responsiveRow]),
    final:audit,
    terminal_status:terminalStatus,
    automatic_execution:false,
    observation_executed:false,
    promotion_authority:false
  });
}

function evaluateDriftControl(order) {
  const updates = {
    D1:Object.freeze([0, EPSILON]),
    D2:Object.freeze([0, 2 * EPSILON])
  };
  let row = [...INITIAL_RESPONSIVE_ROW];
  const history = [];
  for (const id of order) {
    const delta = updates[id];
    if (!delta) throw new Error(`Unknown drift update ${id}`);
    const before = [...row];
    row = [row[0] + delta[0], row[1] + delta[1]];
    history.push(deepFreeze({ id, before:deepFreeze(before), after:deepFreeze([...row]) }));
  }
  return deepFreeze({
    order:[...order],
    history,
    final_row:deepFreeze([...row]),
    final:auditRows(operatorRows(row))
  });
}

function runAccumulatedDriftControl() {
  const forward = evaluateDriftControl(['D1', 'D2']);
  const reverse = evaluateDriftControl(['D2', 'D1']);
  const distance = vectorDistance(forward.final_row, reverse.final_row);
  return deepFreeze({
    classification:'ACCUMULATED_DRIFT_ORDER_INVARIANT',
    forward,
    reverse,
    final_row_distance:distance,
    final_operator_equal:distance <= TOLERANCE,
    operator_motion_present:vectorDistance(INITIAL_RESPONSIVE_ROW, forward.final_row) > TOLERANCE
  });
}

function evaluateLatchControl(order) {
  let state = { row:[...INITIAL_RESPONSIVE_ROW], locked:false, decorated:false };
  const history = [];
  for (const id of order) {
    const before = { row:[...state.row], locked:state.locked, decorated:state.decorated };
    if (id === 'Q_LOCK') {
      state = { ...state, row:[1, EPSILON], locked:true };
    } else if (id === 'Q_DECORATE') {
      state = state.locked
        ? { ...state, decorated:true }
        : { ...state, row:[1, -EPSILON], decorated:true };
    } else {
      throw new Error(`Unknown latch question ${id}`);
    }
    history.push(deepFreeze({
      id,
      before:deepFreeze(before),
      after:deepFreeze({ row:[...state.row], locked:state.locked, decorated:state.decorated })
    }));
  }
  return deepFreeze({
    order:[...order],
    history,
    final_state:deepFreeze({ row:[...state.row], locked:state.locked, decorated:state.decorated }),
    final:auditRows(operatorRows(state.row))
  });
}

function runIrreversibleMutationControl() {
  const decorateThenLock = evaluateLatchControl(['Q_DECORATE', 'Q_LOCK']);
  const lockThenDecorate = evaluateLatchControl(['Q_LOCK', 'Q_DECORATE']);
  const distance = vectorDistance(decorateThenLock.final_state.row, lockThenDecorate.final_state.row);
  const historiesDiffer =
    vectorDistance(
      decorateThenLock.history[0].after.row,
      lockThenDecorate.history[0].after.row
    ) > TOLERANCE;
  return deepFreeze({
    classification:'IRREVERSIBLE_MUTATION_ORDER_INVARIANT_FINAL_OPERATOR',
    decorate_then_lock:decorateThenLock,
    lock_then_decorate:lockThenDecorate,
    final_row_distance:distance,
    final_operator_equal:distance <= TOLERANCE,
    irreversible_latch_present:decorateThenLock.final_state.locked && lockThenDecorate.final_state.locked,
    intermediate_histories_differ:historiesDiffer
  });
}

function runHealthyStopControl() {
  return evaluateCounterfactualSequence(['Q_STABILIZE', 'Q_A']);
}

function runMissingSecondStepControl() {
  return evaluateCounterfactualSequence(['Q_A', 'Q_UNDECLARED']);
}

export function runAdaptiveSequenceOrderGauntlet() {
  const initial = auditRows(operatorRows(INITIAL_RESPONSIVE_ROW));
  const ab = evaluateCounterfactualSequence(['Q_A', 'Q_B']);
  const ba = evaluateCounterfactualSequence(['Q_B', 'Q_A']);
  const drift = runAccumulatedDriftControl();
  const irreversible = runIrreversibleMutationControl();
  const missing = runMissingSecondStepControl();
  const healthyStop = runHealthyStopControl();

  const productAB = multiplyMatrices(Q_B_MATRIX, Q_A_MATRIX);
  const productBA = multiplyMatrices(Q_A_MATRIX, Q_B_MATRIX);
  const productDistance = matrixDifferenceNorm(productAB, productBA);

  const abFirst = ab.steps[0];
  const baFirst = ba.steps[0];

  const passed =
    initial.geometry.rank === 1 &&
    initial.aperture.deficit_class === 'STRUCTURAL_RANK_DEFICIT' &&
    initial.aperture.disposition === 'PROPOSE' &&
    ab.same_multiset_key === ba.same_multiset_key &&
    abFirst.post_step_aperture.deficit_class === 'NUMERICAL_STABILITY_DEFICIT' &&
    abFirst.post_step_aperture.disposition === 'PROPOSE' &&
    baFirst.post_step_aperture.deficit_class === 'NUMERICAL_STABILITY_DEFICIT' &&
    baFirst.post_step_aperture.disposition === 'PROPOSE' &&
    vectorDistance(abFirst.responsive_row_after, [1, EPSILON]) <= TOLERANCE &&
    vectorDistance(baFirst.responsive_row_after, [1, -EPSILON]) <= TOLERANCE &&
    vectorDistance(ab.final_responsive_row, [0, 1]) <= TOLERANCE &&
    ab.final.aperture.deficit_class === 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT' &&
    ab.final.aperture.disposition === 'ASK_NOTHING' &&
    vectorDistance(ba.final_responsive_row, [1, 0]) <= TOLERANCE &&
    ba.final.aperture.deficit_class === 'STRUCTURAL_RANK_DEFICIT' &&
    ba.final.aperture.disposition === 'PROPOSE' &&
    productDistance > TOLERANCE &&
    drift.final_operator_equal === true &&
    drift.operator_motion_present === true &&
    irreversible.final_operator_equal === true &&
    irreversible.irreversible_latch_present === true &&
    irreversible.intermediate_histories_differ === true &&
    missing.terminal_status === 'SEQUENCE_OPERATOR_MODEL_INCOMPLETE' &&
    missing.steps[0].post_step_aperture.disposition === 'PROPOSE' &&
    missing.steps[1].hold_reason === 'ABSTAIN_BEFORE_SEQUENCE_COMPLETION' &&
    healthyStop.steps[0].post_step_aperture.disposition === 'ASK_NOTHING' &&
    healthyStop.terminal_status === 'SECOND_QUESTION_NOT_NEEDED' &&
    healthyStop.steps[1].applied === false;

  if (!passed) throw new Error('Adaptive sequence-order gauntlet violated an authored expectation.');

  return deepFreeze({
    schema:ADAPTIVE_SEQUENCE_ORDER_SCHEMA,
    source_status:'SIMULATED',
    authority_class:'A2_DERIVATIONAL',
    manifestly_fictional:true,
    epsilon:EPSILON,
    initial,
    order_sensitive_pair:deepFreeze({
      same_question_multiset:true,
      sequence_ab:ab,
      sequence_ba:ba,
      transition_product_ab:productAB,
      transition_product_ba:productBA,
      transition_product_difference_norm:productDistance,
      classification:'ORDER_SENSITIVE_OPERATOR_TRANSITION_IN_BOUNDED_SYNTHETIC_FIXTURE'
    }),
    controls:deepFreeze({
      accumulated_drift:drift,
      irreversible_mutation:irreversible,
      missing_second_step:missing,
      healthy_stop:healthyStop
    }),
    gauntlet_status:'ADAPTIVE_QUESTION_ORDER_BOUNDARY_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE',
    bounded_refinement_candidate:'within the authored finite transition model, the same two predeclared questions can each leave a first-step PROPOSE state while their order changes the terminal observation operator and typed Aperture diagnosis; accumulated drift and irreversible mutation controls remain terminally order-invariant',
    anti_equivalences:deepFreeze([
      'operator changed != order mattered',
      'intermediate path differed != final operator differed',
      'irreversible mutation != order sensitivity',
      'order sensitivity != holonomy',
      'matrix noncommutation != physical transport',
      'adaptive counterfactual sequence != autonomous experiment execution',
      'same question multiset != same terminal aperture'
    ]),
    next_learning_action:'TEST_ADAPTIVE_SEQUENCE_REPLAY_UNDER_SMALL_TRANSITION_MODEL_PERTURBATIONS_AND_DECISION_CONSEQUENCES_BEFORE_ANY_PATH_DEPENDENT_DESIGN_OR_HOLONOMY_PROMOTION',
    claims:deepFreeze({
      general_path_dependence_theorem:false,
      optimal_adaptive_experiment_design:false,
      active_learning_optimality:false,
      causal_intervention_law:false,
      performative_prediction_theorem:false,
      physical_sensor_feedback:false,
      physical_tomography:false,
      blind_tomography:false,
      operator_tomography:false,
      physical_transport:false,
      connection_or_gauge_field:false,
      berry_structure:false,
      physical_holonomy:false,
      continuum_holonomy:false,
      quantum_measurement_disturbance:false,
      td613_general_aia_theorem:false,
      proto_loom:false,
      production_authority:false,
      vercel_authority:false,
      autonomous_experiment_execution:false
    }),
    scalar_collapse_used:false,
    installed_aperture_mutated:false,
    pedagogue_law_promoted:false,
    automatic_observation:false,
    automatic_experiment_execution:false,
    production_mutation:false,
    promotion_authority:false,
    human_closure_required:true
  });
}
