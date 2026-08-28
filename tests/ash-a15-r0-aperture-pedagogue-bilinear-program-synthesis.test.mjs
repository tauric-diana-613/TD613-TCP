import assert from 'node:assert/strict';
import {
  oneActionRow,
  programGeometry,
  synthesizeProgram,
  programSelector,
  runBilinearProgramSynthesisGauntlet,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-bilinear-program-synthesis.js';

const n = [1, -1, -1, 1];
const p1 = { id: 'TRACE_E1', cost: 1, r: [1, 0], x: [1, 0] };
const p2 = { id: 'TRACE_E2', cost: 1, r: [0, 1], x: [0, 1] };

assert.deepEqual(oneActionRow(p1), [1, 0, 0, 0]);
assert.deepEqual(oneActionRow(p2), [0, 0, 0, 1]);

const geometry = programGeometry([p1, p2], n);
assert.deepEqual(geometry.aggregate_row, [1, 0, 0, 1]);
assert.equal(geometry.action_count, 2);
assert.equal(geometry.aggregate_rank, 2);
assert.equal('component_responses' in geometry, false);
assert.equal('aggregate_response' in geometry, false);

const forward = synthesizeProgram([p1, p2]);
assert.deepEqual(forward.aggregate_row, [1, 0, 0, 1]);
assert.equal(forward.action_count, 2);
assert.deepEqual(forward.component_responses, [2, 3]);
assert.equal(forward.aggregate_response, 5);
assert.equal(forward.aggregate_rank, 2);

const reverse = synthesizeProgram([p2, p1]);
assert.deepEqual(reverse.aggregate_row, forward.aggregate_row);
assert.equal(reverse.aggregate_response, forward.aggregate_response);

const selector = programSelector({
  null_direction: n,
  programs: [
    { program_id: 'TRACE_PROGRAM', actions: [p1, p2] },
    { program_id: 'GOOD_SINGLE', actions: [p1] },
  ],
});
assert.equal(selector.selected_program_id, 'GOOD_SINGLE');
assert.equal(selector.scored.some((entry) => 'response' in entry || 'component_responses' in entry), false);

assert.throws(
  () => programSelector({ null_direction: n, programs: [], T_star: [[2, 1], [1, 3]] }),
  /REJECT_ORACLE/,
);
assert.throws(
  () => programSelector({ null_direction: n, programs: [], future_responses: [5] }),
  /REJECT_ORACLE/,
);
assert.throws(
  () => programSelector({ null_direction: n, programs: [], synthetic_oracle: { trace: 5 } }),
  /REJECT_ORACLE/,
);
assert.throws(
  () => programSelector({ null_direction: n, programs: [], observed_responses: [2, 3] }),
  /REJECT_ORACLE/,
);
assert.throws(
  () => programSelector({ programs: [{ program_id: 'GOOD_SINGLE', actions: [p1] }] }),
  /DECLARED_NULLSPACE_STATE_REQUIRED/,
);

const result = runBilinearProgramSynthesisGauntlet();
assert.equal(result.passed, true);
for (const [key, value] of Object.entries(result.criteria)) {
  assert.equal(value, true, `${key} must hold`);
}
assert.equal(
  result.canonical_bounded_scientific_claim,
  'A_LINEAR_FUNCTIONAL_INADMISSIBLE_AS_ONE_DECLARED_BILINEAR_ACTION_CAN_BE_EXACTLY_REALIZED_AS_A_HIGHER_ACTION_COUNT_SUM_OF_ADMISSIBLE_RANK_ONE_BILINEAR_PROBES_IN_THE_AUTHORED_STATIC_2X2_FIXTURE_WHILE_PROGRAM_REALIZABILITY_DOES_NOT_IMPLY_COST_OPTIMALITY',
);
assert.equal(result.next_learning_action, 'HELD_FOR_TRANSITION_SENSITIVE_PROGRAM_COMPOSITION_AFTER_WITNESS_RECEIPT');
for (const key of [
  'endogenous_sequential_transport_earned',
  'path_category_earned',
  'path_groupoid_earned',
  'canonical_operator_tomography_promotion_authority',
  'holonomy_earned',
  'curvature_earned',
  'proto_loom_earned',
  'a16_reopened',
  'merge_authority',
  'production_authority',
  'vercel_authority',
]) {
  assert.equal(result[key], false, `${key} must remain false`);
}

console.log(JSON.stringify({
  schema: result.schema,
  trace_cost: result.trace_program.action_count,
  trace_response: result.trace_program.aggregate_response,
  selected: result.selector.selected_program_id,
  claim: result.canonical_bounded_scientific_claim,
  next: result.next_learning_action,
}));
