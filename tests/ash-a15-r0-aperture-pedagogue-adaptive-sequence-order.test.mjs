import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  ADAPTIVE_SEQUENCE_ORDER_SCHEMA,
  Q_A_MATRIX,
  Q_B_MATRIX,
  multiplyMatrixVector,
  multiplyMatrices,
  matrixDifferenceNorm,
  evaluateCounterfactualSequence,
  runAdaptiveSequenceOrderGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-adaptive-sequence-order.js';

const EPSILON = 0.001;
const TOLERANCE = 1e-10;

function vectorDistance(left, right) {
  return Math.hypot(left[0] - right[0], left[1] - right[1]);
}

const r0 = [1,0];
const afterA = multiplyMatrixVector(Q_A_MATRIX, r0);
const afterB = multiplyMatrixVector(Q_B_MATRIX, r0);
assert.ok(vectorDistance(afterA, [1, EPSILON]) <= TOLERANCE);
assert.ok(vectorDistance(afterB, [1, -EPSILON]) <= TOLERANCE);

const afterAB = multiplyMatrixVector(Q_B_MATRIX, afterA);
const afterBA = multiplyMatrixVector(Q_A_MATRIX, afterB);
assert.ok(vectorDistance(afterAB, [0,1]) <= TOLERANCE);
assert.ok(vectorDistance(afterBA, [1,0]) <= TOLERANCE);

const productAB = multiplyMatrices(Q_B_MATRIX, Q_A_MATRIX);
const productBA = multiplyMatrices(Q_A_MATRIX, Q_B_MATRIX);
assert.ok(matrixDifferenceNorm(productAB, productBA) > TOLERANCE);

assert.throws(() => multiplyMatrixVector([[1,0]], [1,0]), /must contain two values|2x2/);
assert.throws(() => multiplyMatrixVector(Q_A_MATRIX, [1,0,2]), /two-component row/);
assert.throws(() => multiplyMatrices(Q_A_MATRIX, [[1,0],[0,Number.NaN]]), /must be finite/);

const ab = evaluateCounterfactualSequence(['Q_A','Q_B']);
const ba = evaluateCounterfactualSequence(['Q_B','Q_A']);
assert.equal(ab.same_multiset_key, ba.same_multiset_key);
assert.equal(ab.steps.length, 2);
assert.equal(ba.steps.length, 2);

for (const first of [ab.steps[0], ba.steps[0]]) {
  assert.equal(first.applied, true);
  assert.equal(first.post_step_geometry.rank, 2);
  assert.equal(first.post_step_aperture.deficit_class, 'NUMERICAL_STABILITY_DEFICIT');
  assert.equal(first.post_step_aperture.disposition, 'PROPOSE');
  assert.ok(first.post_step_geometry.sigma_min > 0);
  assert.ok(first.post_step_geometry.sigma_min < 0.001);
  assert.ok(first.post_step_geometry.condition_number > 1999);
  assert.ok(first.post_step_geometry.condition_number < 2001);
  assert.equal(first.observation_executed, false);
}

assert.ok(vectorDistance(ab.final_responsive_row, [0,1]) <= TOLERANCE);
assert.equal(ab.final.geometry.rank, 2);
assert.ok(Math.abs(ab.final.geometry.condition_number - 1) <= TOLERANCE);
assert.equal(ab.final.aperture.deficit_class, 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT');
assert.equal(ab.final.aperture.disposition, 'ASK_NOTHING');

assert.ok(vectorDistance(ba.final_responsive_row, [1,0]) <= TOLERANCE);
assert.equal(ba.final.geometry.rank, 1);
assert.equal(ba.final.aperture.deficit_class, 'STRUCTURAL_RANK_DEFICIT');
assert.equal(ba.final.aperture.disposition, 'PROPOSE');

const missing = evaluateCounterfactualSequence(['Q_A','Q_UNDECLARED']);
assert.equal(missing.steps[0].post_step_aperture.disposition, 'PROPOSE');
assert.equal(missing.steps[1].applied, false);
assert.equal(missing.steps[1].hold_reason, 'ABSTAIN_BEFORE_SEQUENCE_COMPLETION');
assert.equal(missing.terminal_status, 'SEQUENCE_OPERATOR_MODEL_INCOMPLETE');

const healthyStop = evaluateCounterfactualSequence(['Q_STABILIZE','Q_A']);
assert.equal(healthyStop.steps[0].post_step_aperture.deficit_class, 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT');
assert.equal(healthyStop.steps[0].post_step_aperture.disposition, 'ASK_NOTHING');
assert.equal(healthyStop.steps[1].applied, false);
assert.equal(healthyStop.steps[1].hold_reason, 'CURRENT_APERTURE_DOES_NOT_PROPOSE_ANOTHER_QUESTION');
assert.equal(healthyStop.terminal_status, 'SECOND_QUESTION_NOT_NEEDED');

const receipt = runAdaptiveSequenceOrderGauntlet();
assert.equal(receipt.schema, ADAPTIVE_SEQUENCE_ORDER_SCHEMA);
assert.equal(receipt.source_status, 'SIMULATED');
assert.equal(receipt.authority_class, 'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional, true);
assert.equal(receipt.initial.aperture.deficit_class, 'STRUCTURAL_RANK_DEFICIT');
assert.equal(receipt.initial.aperture.disposition, 'PROPOSE');
assert.equal(receipt.order_sensitive_pair.same_question_multiset, true);
assert.equal(receipt.order_sensitive_pair.classification, 'ORDER_SENSITIVE_OPERATOR_TRANSITION_IN_BOUNDED_SYNTHETIC_FIXTURE');
assert.ok(receipt.order_sensitive_pair.transition_product_difference_norm > TOLERANCE);
assert.equal(receipt.order_sensitive_pair.sequence_ab.final.aperture.disposition, 'ASK_NOTHING');
assert.equal(receipt.order_sensitive_pair.sequence_ba.final.aperture.deficit_class, 'STRUCTURAL_RANK_DEFICIT');

const drift = receipt.controls.accumulated_drift;
assert.equal(drift.classification, 'ACCUMULATED_DRIFT_ORDER_INVARIANT');
assert.equal(drift.operator_motion_present, true);
assert.equal(drift.final_operator_equal, true);
assert.ok(drift.final_row_distance <= TOLERANCE);
assert.ok(vectorDistance(drift.forward.final_row, [1,0.003]) <= TOLERANCE);
assert.ok(vectorDistance(drift.reverse.final_row, [1,0.003]) <= TOLERANCE);

const irreversible = receipt.controls.irreversible_mutation;
assert.equal(irreversible.classification, 'IRREVERSIBLE_MUTATION_ORDER_INVARIANT_FINAL_OPERATOR');
assert.equal(irreversible.irreversible_latch_present, true);
assert.equal(irreversible.intermediate_histories_differ, true);
assert.equal(irreversible.final_operator_equal, true);
assert.ok(irreversible.final_row_distance <= TOLERANCE);
assert.deepEqual(irreversible.decorate_then_lock.final_state, {
  row:[1,EPSILON],
  locked:true,
  decorated:true
});
assert.deepEqual(irreversible.lock_then_decorate.final_state, {
  row:[1,EPSILON],
  locked:true,
  decorated:true
});

assert.equal(receipt.controls.missing_second_step.terminal_status, 'SEQUENCE_OPERATOR_MODEL_INCOMPLETE');
assert.equal(receipt.controls.healthy_stop.terminal_status, 'SECOND_QUESTION_NOT_NEEDED');
assert.equal(receipt.gauntlet_status, 'ADAPTIVE_QUESTION_ORDER_BOUNDARY_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE');
assert.match(receipt.bounded_refinement_candidate, /same two predeclared questions/);
assert.ok(receipt.anti_equivalences.includes('order sensitivity != holonomy'));
assert.ok(receipt.anti_equivalences.includes('irreversible mutation != order sensitivity'));
assert.ok(receipt.anti_equivalences.includes('matrix noncommutation != physical transport'));
assert.match(receipt.next_learning_action, /TRANSITION_MODEL_PERTURBATIONS/);
assert.equal(receipt.scalar_collapse_used, false);
assert.equal(receipt.claims.general_path_dependence_theorem, false);
assert.equal(receipt.claims.physical_transport, false);
assert.equal(receipt.claims.connection_or_gauge_field, false);
assert.equal(receipt.claims.physical_holonomy, false);
assert.equal(receipt.claims.proto_loom, false);
assert.equal(receipt.claims.production_authority, false);
assert.equal(receipt.claims.vercel_authority, false);
assert.equal(receipt.installed_aperture_mutated, false);
assert.equal(receipt.pedagogue_law_promoted, false);
assert.equal(receipt.automatic_observation, false);
assert.equal(receipt.automatic_experiment_execution, false);
assert.equal(receipt.production_mutation, false);
assert.equal(receipt.promotion_authority, false);
assert.equal(receipt.human_closure_required, true);

const spec = fs.readFileSync(
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_ADAPTIVE_SEQUENCE_ORDER_GAUNTLET_SPEC_V0_1.md',
  'utf8'
);
assert.match(spec, /ordinary accumulated drift/);
assert.match(spec, /irreversible mutation/);
assert.match(spec, /order sensitivity != holonomy/);
assert.match(spec, /both possible first questions legitimately leave a typed reason to ask another question/);
assert.match(spec, /SEQUENCE_OPERATOR_MODEL_INCOMPLETE/);
assert.match(spec, /SECOND_QUESTION_NOT_NEEDED/);
assert.match(spec, /TEST_ADAPTIVE_SEQUENCE_REPLAY_UNDER_SMALL_TRANSITION_MODEL_PERTURBATIONS/);

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  initial_deficit:receipt.initial.aperture.deficit_class,
  first_after_q_a:receipt.order_sensitive_pair.sequence_ab.steps[0].post_step_aperture.deficit_class,
  first_after_q_b:receipt.order_sensitive_pair.sequence_ba.steps[0].post_step_aperture.deficit_class,
  ab_final_deficit:receipt.order_sensitive_pair.sequence_ab.final.aperture.deficit_class,
  ab_final_disposition:receipt.order_sensitive_pair.sequence_ab.final.aperture.disposition,
  ba_final_deficit:receipt.order_sensitive_pair.sequence_ba.final.aperture.deficit_class,
  transition_product_difference_norm:receipt.order_sensitive_pair.transition_product_difference_norm,
  drift_control:drift.classification,
  irreversible_control:irreversible.classification,
  missing_second_step:receipt.controls.missing_second_step.terminal_status,
  healthy_stop:receipt.controls.healthy_stop.terminal_status,
  next_learning_action:receipt.next_learning_action,
  promotion_authority:receipt.promotion_authority
}, null, 2));
