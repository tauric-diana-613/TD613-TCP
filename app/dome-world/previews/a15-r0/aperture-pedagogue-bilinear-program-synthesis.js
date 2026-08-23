export const BILINEAR_PROGRAM_SYNTHESIS_SCHEMA = 'td613.a15-r0.aperture-pedagogue-bilinear-program-synthesis/v0.1';

const EPS = 1e-10;
const T = Object.freeze([[2, 1], [1, 3]].map(Object.freeze));
const N = Object.freeze([1, -1, -1, 1]);

const P1 = Object.freeze({ id: 'TRACE_E1', cost: 1, r: Object.freeze([1, 0]), x: Object.freeze([1, 0]) });
const P2 = Object.freeze({ id: 'TRACE_E2', cost: 1, r: Object.freeze([0, 1]), x: Object.freeze([0, 1]) });
const GOOD = Object.freeze({ id: 'GOOD_SINGLE', cost: 1, r: Object.freeze([1, 0]), x: Object.freeze([1, 0]) });

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0);
const norm = (a) => Math.sqrt(dot(a, a));
const row = (r, x) => [r[0] * x[0], r[0] * x[1], r[1] * x[0], r[1] * x[1]].map((v) => Object.is(v, -0) ? 0 : v);
const add = (a, b) => a.map((value, i) => value + b[i]);
const mv = (M, x) => M.map((r) => dot(r, x));
const response = (M, probe) => dot(probe.r, mv(M, probe.x));
const det = (h) => h[0] * h[3] - h[1] * h[2];
const rank2 = (h) => Math.abs(det(h)) > EPS ? 2 : (norm(h) > EPS ? 1 : 0);
const sensitivity = (h, nullDirection) => Math.abs(dot(h, nullDirection)) / norm(h);

export const oneActionRow = (probe) => freeze(row(probe.r, probe.x));

// Geometry-only program analysis. This is the only surface available to the selector.
// It receives the current declared null direction explicitly and never touches T or any response oracle.
export function programGeometry(program, nullDirection) {
  if (!Array.isArray(nullDirection) || nullDirection.length !== 4) {
    throw new Error('DECLARED_NULLSPACE_STATE_REQUIRED_FOR_PROGRAM_SELECTION');
  }
  const rows = program.map(oneActionRow);
  const aggregate = rows.reduce(add, [0, 0, 0, 0]);
  return freeze({
    action_count: program.reduce((sum, probe) => sum + probe.cost, 0),
    component_rows: rows,
    aggregate_row: aggregate,
    aggregate_rank: rank2(aggregate),
    aggregate_sensitivity: sensitivity(aggregate, nullDirection),
  });
}

// Fixture execution is deliberately separate from selection geometry.
// The synthetic evaluator may use T to produce/check responses after a program is specified.
export function synthesizeProgram(program) {
  const geometry = programGeometry(program, N);
  const responses = program.map((probe) => response(T, probe));
  return freeze({
    ...geometry,
    component_responses: responses,
    aggregate_response: responses.reduce((a, b) => a + b, 0),
  });
}

export function programSelector(input) {
  for (const key of ['T_star', 'future_responses', 'synthetic_oracle', 'observed_responses']) {
    if (key in input) throw new Error('REJECT_ORACLE_LEAKAGE_IN_PROGRAM_SELECTION');
  }
  if (!Array.isArray(input.null_direction) || input.null_direction.length !== 4) {
    throw new Error('DECLARED_NULLSPACE_STATE_REQUIRED_FOR_PROGRAM_SELECTION');
  }

  const scored = input.programs
    .map((program) => {
      const geometry = programGeometry(program.actions, input.null_direction);
      return {
        program_id: program.program_id,
        action_count: geometry.action_count,
        sensitivity: geometry.aggregate_sensitivity,
        efficiency: geometry.aggregate_sensitivity / geometry.action_count,
      };
    })
    .sort((a, b) => b.efficiency - a.efficiency || a.program_id.localeCompare(b.program_id));

  return freeze({ selected_program_id: scored[0].program_id, scored });
}

export function runBilinearProgramSynthesisGauntlet() {
  const target = [1, 0, 0, 1];
  const forward = synthesizeProgram([P1, P2]);
  const reverse = synthesizeProgram([P2, P1]);
  const good = synthesizeProgram([GOOD]);
  const selector = programSelector({
    null_direction: N,
    programs: [
      { program_id: 'TRACE_PROGRAM', actions: [P1, P2] },
      { program_id: 'GOOD_SINGLE', actions: [GOOD] },
    ],
  });

  let leakRejected = false;
  try {
    programSelector({ null_direction: N, programs: [], T_star: T });
  } catch (error) {
    leakRejected = /REJECT_ORACLE/.test(String(error.message));
  }

  let missingStateRejected = false;
  try {
    programSelector({ programs: [] });
  } catch (error) {
    missingStateRejected = /DECLARED_NULLSPACE_STATE_REQUIRED/.test(String(error.message));
  }

  const criteria = freeze({
    B1_target_rank2: rank2(target) === 2 && Math.abs(det(target) - 1) < EPS,
    B2_each_component_rank1: forward.component_rows.every((h) => rank2(h) === 1 && Math.abs(det(h)) < EPS),
    B3_exact_composite: forward.aggregate_row.every((v, i) => Math.abs(v - target[i]) < EPS),
    B4_composite_response_computed: Math.abs(forward.aggregate_response - (T[0][0] + T[1][1])) < EPS,
    B5_minimum_cost_not_one: rank2(target) === 2 && forward.action_count === 2,
    B6_static_order_control: forward.aggregate_response === reverse.aggregate_response && forward.aggregate_row.every((v, i) => v === reverse.aggregate_row[i]),
    B7_cost_changes_preference: Math.abs(forward.aggregate_sensitivity - Math.SQRT2) < EPS && Math.abs(forward.aggregate_sensitivity / 2 - Math.SQRT1_2) < EPS && selector.selected_program_id === 'GOOD_SINGLE',
    B8_oracle_leak_rejected: leakRejected,
    B9_declared_nullspace_state_required: missingStateRejected,
  });

  const passed = Object.values(criteria).every(Boolean);
  return freeze({
    schema: BILINEAR_PROGRAM_SYNTHESIS_SCHEMA,
    target_functional: { row: target, rank: rank2(target) },
    trace_program: forward,
    reverse_order_control: reverse,
    good_single: good,
    selector,
    criteria,
    passed,
    canonical_bounded_scientific_claim: passed
      ? 'A_LINEAR_FUNCTIONAL_INADMISSIBLE_AS_ONE_DECLARED_BILINEAR_ACTION_CAN_BE_EXACTLY_REALIZED_AS_A_HIGHER_ACTION_COUNT_SUM_OF_ADMISSIBLE_RANK_ONE_BILINEAR_PROBES_IN_THE_AUTHORED_STATIC_2X2_FIXTURE_WHILE_PROGRAM_REALIZABILITY_DOES_NOT_IMPLY_COST_OPTIMALITY'
      : null,
    next_learning_action: passed ? 'HELD_FOR_TRANSITION_SENSITIVE_PROGRAM_COMPOSITION_AFTER_WITNESS_RECEIPT' : null,
    endogenous_sequential_transport_earned: false,
    path_category_earned: false,
    path_groupoid_earned: false,
    canonical_operator_tomography_promotion_authority: false,
    holonomy_earned: false,
    curvature_earned: false,
    proto_loom_earned: false,
    a16_reopened: false,
    merge_authority: false,
    production_authority: false,
    vercel_authority: false,
  });
}
