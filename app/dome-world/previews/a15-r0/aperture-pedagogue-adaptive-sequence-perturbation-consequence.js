import {
  Q_B_MATRIX,
  evaluateCounterfactualSequence
} from './aperture-pedagogue-adaptive-sequence-order.js';

export const ADAPTIVE_SEQUENCE_PERTURBATION_CONSEQUENCE_SCHEMA =
  'td613.a15-r0.aperture-pedagogue-adaptive-sequence-perturbation-consequence/v0.1';

export const EPSILON = 0.001;
export const LOCAL_DELTAS = Object.freeze([
  -1e-4,
  -1e-5,
  -1e-6,
  0,
  1e-6,
  1e-5,
  1e-4
]);
export const STRESS_DELTA = -0.0007;

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

function finite(value, label = 'value') {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError(`${label} must be finite`);
  return number;
}

function rowDistance(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== 2 || right.length !== 2) {
    throw new TypeError('rowDistance requires two-component rows');
  }
  return Math.hypot(Number(left[0]) - Number(right[0]), Number(left[1]) - Number(right[1]));
}

export const CONSEQUENCE_LEDGER = deepFreeze({
  ASK_NOTHING: {
    STOP: 0,
    CONTINUE_ONE_DECLARED_QUESTION: 1
  },
  PROPOSE: {
    STOP: 5,
    CONTINUE_ONE_DECLARED_QUESTION: 1
  }
});

export function perturbedQAMatrix(delta) {
  const d = finite(delta, 'delta');
  return deepFreeze([
    deepFreeze([1, 0]),
    deepFreeze([EPSILON + d, 1])
  ]);
}

function transitionsForDelta(delta) {
  return deepFreeze({
    Q_A: {
      question_id: 'Q_A',
      transition_status: 'DECLARED_SYNTHETIC',
      matrix: perturbedQAMatrix(delta)
    },
    Q_B: {
      question_id: 'Q_B',
      transition_status: 'DECLARED_SYNTHETIC',
      matrix: Q_B_MATRIX
    },
    Q_UNDECLARED: {
      question_id: 'Q_UNDECLARED',
      transition_status: 'UNDECLARED',
      matrix: null
    }
  });
}

export function consequenceForAperture(aperture) {
  if (!aperture || typeof aperture !== 'object') throw new TypeError('aperture receipt is required');
  const disposition = String(aperture.disposition || '');
  const losses = CONSEQUENCE_LEDGER[disposition];
  if (!losses) throw new Error(`No declared consequence row for Aperture disposition ${disposition || 'MISSING'}`);

  const stopLoss = finite(losses.STOP, 'STOP loss');
  const continueLoss = finite(losses.CONTINUE_ONE_DECLARED_QUESTION, 'CONTINUE_ONE_DECLARED_QUESTION loss');
  let selectedAction = null;
  if (stopLoss < continueLoss) selectedAction = 'STOP';
  if (continueLoss < stopLoss) selectedAction = 'CONTINUE_ONE_DECLARED_QUESTION';

  return deepFreeze({
    disposition,
    losses: deepFreeze({
      STOP: stopLoss,
      CONTINUE_ONE_DECLARED_QUESTION: continueLoss
    }),
    selected_action: selectedAction,
    tie: stopLoss === continueLoss,
    consequence_scope: 'FROZEN_LOCAL_LEDGER_ONLY',
    optimal_design_claim: false,
    decision_theory_theorem_claim: false
  });
}

function analyticTerminalRows(delta) {
  const d = finite(delta, 'delta');
  return deepFreeze({
    AB: deepFreeze([
      -d / EPSILON,
      1 + ((1 + EPSILON) / EPSILON) * d
    ]),
    BA: deepFreeze([1, d])
  });
}

function isConfirmatoryDelta(delta) {
  return LOCAL_DELTAS.some(item => Object.is(item, delta));
}

export function evaluatePerturbationPoint(delta, { confirmatory = false } = {}) {
  const d = finite(delta, 'delta');
  if (confirmatory && !isConfirmatoryDelta(d)) {
    throw new RangeError('confirmatory delta must belong to the frozen local grid');
  }

  const transitions = transitionsForDelta(d);
  const sequenceAB = evaluateCounterfactualSequence(['Q_A', 'Q_B'], transitions);
  const sequenceBA = evaluateCounterfactualSequence(['Q_B', 'Q_A'], transitions);
  const analytic = analyticTerminalRows(d);
  const abAnalyticError = rowDistance(sequenceAB.final_responsive_row, analytic.AB);
  const baAnalyticError = rowDistance(sequenceBA.final_responsive_row, analytic.BA);

  return deepFreeze({
    delta: d,
    epsilon_fraction: d / EPSILON,
    confirmatory,
    q_a_matrix: transitions.Q_A.matrix,
    q_b_parent_matrix_reused: transitions.Q_B.matrix === Q_B_MATRIX,
    sequence_ab: sequenceAB,
    sequence_ba: sequenceBA,
    analytic_terminal_rows: analytic,
    analytic_error: deepFreeze({ AB: abAnalyticError, BA: baAnalyticError }),
    consequence_ab: consequenceForAperture(sequenceAB.final.aperture),
    consequence_ba: consequenceForAperture(sequenceBA.final.aperture),
    counterfactual_only: true,
    observation_executed: false,
    promotion_authority: false
  });
}

export function evaluateConfirmatoryDelta(delta) {
  return evaluatePerturbationPoint(delta, { confirmatory: true });
}

function runMissingTransitionControl() {
  const transitions = transitionsForDelta(0);
  const heldTransitions = deepFreeze({
    ...transitions,
    Q_B: {
      question_id: 'Q_B',
      transition_status: 'UNDECLARED',
      matrix: null
    }
  });
  return evaluateCounterfactualSequence(['Q_A', 'Q_B'], heldTransitions);
}

function localPointPasses(point) {
  const firstAB = point.sequence_ab.steps[0];
  const firstBA = point.sequence_ba.steps[0];
  const baExpectedClass = point.delta === 0
    ? 'STRUCTURAL_RANK_DEFICIT'
    : 'NUMERICAL_STABILITY_DEFICIT';

  return (
    point.confirmatory === true &&
    point.q_b_parent_matrix_reused === true &&
    point.analytic_error.AB <= 1e-9 &&
    point.analytic_error.BA <= 1e-9 &&
    firstAB?.post_step_aperture?.deficit_class === 'NUMERICAL_STABILITY_DEFICIT' &&
    firstAB?.post_step_aperture?.disposition === 'PROPOSE' &&
    firstBA?.post_step_aperture?.deficit_class === 'NUMERICAL_STABILITY_DEFICIT' &&
    firstBA?.post_step_aperture?.disposition === 'PROPOSE' &&
    point.sequence_ab.final.aperture.deficit_class === 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT' &&
    point.sequence_ab.final.aperture.disposition === 'ASK_NOTHING' &&
    point.sequence_ba.final.aperture.deficit_class === baExpectedClass &&
    point.sequence_ba.final.aperture.disposition === 'PROPOSE' &&
    point.consequence_ab.selected_action === 'STOP' &&
    point.consequence_ba.selected_action === 'CONTINUE_ONE_DECLARED_QUESTION'
  );
}

export function runAdaptiveSequencePerturbationConsequenceGauntlet() {
  const local = deepFreeze(LOCAL_DELTAS.map(delta => evaluateConfirmatoryDelta(delta)));
  const stress = evaluatePerturbationPoint(STRESS_DELTA);
  const missing = runMissingTransitionControl();
  const localPassVector = deepFreeze(local.map(localPointPasses));
  const localPassCount = localPassVector.filter(Boolean).length;
  const nonzeroLocal = local.filter(point => point.delta !== 0);
  const zeroPoint = local.find(point => point.delta === 0);

  const stressPasses =
    stress.confirmatory === false &&
    stress.sequence_ab.final.aperture.disposition === 'PROPOSE' &&
    stress.sequence_ba.final.aperture.disposition === 'PROPOSE' &&
    stress.consequence_ab.selected_action === 'CONTINUE_ONE_DECLARED_QUESTION' &&
    stress.consequence_ba.selected_action === 'CONTINUE_ONE_DECLARED_QUESTION';

  const subtypeKnifeEdge =
    zeroPoint?.sequence_ba.final.aperture.deficit_class === 'STRUCTURAL_RANK_DEFICIT' &&
    nonzeroLocal.every(point =>
      point.sequence_ba.final.geometry.rank === 2 &&
      point.sequence_ba.final.aperture.deficit_class === 'NUMERICAL_STABILITY_DEFICIT'
    );

  const missingTransitionHeld =
    missing.terminal_status === 'SEQUENCE_OPERATOR_MODEL_INCOMPLETE' &&
    missing.steps[1]?.applied === false &&
    missing.steps[1]?.hold_reason === 'ABSTAIN_BEFORE_SEQUENCE_COMPLETION';

  const fullSuccess =
    local.length === LOCAL_DELTAS.length &&
    localPassCount === LOCAL_DELTAS.length &&
    subtypeKnifeEdge &&
    stressPasses &&
    missingTransitionHeld &&
    Object.isFrozen(CONSEQUENCE_LEDGER) &&
    Object.isFrozen(CONSEQUENCE_LEDGER.ASK_NOTHING) &&
    Object.isFrozen(CONSEQUENCE_LEDGER.PROPOSE);

  if (!fullSuccess) {
    throw new Error('Adaptive sequence perturbation + consequence gauntlet violated a preregistered expectation.');
  }

  return deepFreeze({
    schema: ADAPTIVE_SEQUENCE_PERTURBATION_CONSEQUENCE_SCHEMA,
    source_status: 'SIMULATED',
    authority_class: 'A2_DERIVATIONAL',
    manifestly_fictional: true,
    epsilon: EPSILON,
    local_deltas: deepFreeze([...LOCAL_DELTAS]),
    stress_delta: STRESS_DELTA,
    local_results: local,
    stress_control: stress,
    missing_transition_control: missing,
    consequence_ledger: CONSEQUENCE_LEDGER,
    local_pass_vector: localPassVector,
    local_pass_count: localPassCount,
    local_disposition_contrast_robust: true,
    ba_structural_subtype_robust: false,
    ba_structural_subtype_classification: 'KNIFE_EDGE_AT_DELTA_ZERO_WITH_LOCAL_NONZERO_RANK_LIFT',
    nonzero_local_ba_rank_lift_count: nonzeroLocal.filter(point => point.sequence_ba.final.geometry.rank === 2).length,
    stress_collapses_disposition_contrast: true,
    missing_transition_held: true,
    gauntlet_status: 'LOCAL_ORDER_CONSEQUENCE_ROBUSTNESS_WITH_KNIFE_EDGE_DEFICIT_SUBTYPE',
    bounded_refinement_candidate: 'inside the frozen finite perturbation grid, AB remains ASK_NOTHING while BA remains PROPOSE even though the exact BA structural-rank subtype lifts to numerical instability for every nonzero local perturbation; the farther preregistered stress point collapses that disposition contrast',
    anti_equivalences: deepFreeze([
      'robust terminal disposition != robust deficit subtype',
      'rank lift under perturbation != recovered stability',
      'noncommuting transition products != holonomy',
      'local perturbation envelope != global robustness',
      'lower declared loss != optimal design',
      'question burden ledger != decision theory theorem',
      'counterfactual transition replay != real intervention',
      'operator-model perturbation != physical sensor noise',
      'path-conditioned action != autonomous experiment policy'
    ]),
    next_learning_action: 'TEST_BRANCHING_ADAPTIVE_POLICY_REPLAY_WHERE_THE_SECOND_QUESTION_IS_SELECTED_FROM_THE_POST_FIRST_STEP_TYPED_DEFICIT_AND_COMPARE_ROUTE_TREE_CONSEQUENCES_WITH_FIXED_SEQUENCE_CONTROLS_BEFORE_ANY_ACTIVE_LEARNING_OR_HOLONOMY_PROMOTION',
    claims: deepFreeze({
      general_path_dependent_design_law: false,
      active_learning_optimality: false,
      optimal_experimental_design: false,
      expected_utility_theorem: false,
      connection: false,
      curvature: false,
      berry_structure: false,
      holonomy: false,
      physical_tomography: false,
      quantum_measurement_disturbance: false,
      td613_general_aia_theorem: false,
      proto_loom: false,
      production_authority: false,
      vercel_authority: false
    }),
    installed_aperture_mutated: false,
    production_mutated: false,
    automatic_experiment_execution: false,
    promotion_authority: false
  });
}
