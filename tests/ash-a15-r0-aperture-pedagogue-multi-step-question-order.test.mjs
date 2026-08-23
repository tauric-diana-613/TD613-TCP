import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  MULTI_STEP_QUESTION_ORDER_SCHEMA,
  QUESTION_TRANSITIONS,
  multiply2,
  determinant2,
  simulateGovernedQuestionSequence,
  analyzeIrreversibleOrderControl,
  runMultiStepQuestionOrderGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-multi-step-question-order.js';

assert.deepEqual(multiply2([[1,0],[0,1]], [[2,3],[4,5]]), [[2,3],[4,5]]);
assert.equal(determinant2(QUESTION_TRANSITIONS.A.matrix), 1.25);
assert.equal(determinant2(QUESTION_TRANSITIONS.B.matrix), 2.5);
assert.throws(() => multiply2([[1,0,0],[0,1,0]], [[1,0],[0,1]]), /two values|2x2/);

const AB = simulateGovernedQuestionSequence(['A','B']);
const BA = simulateGovernedQuestionSequence(['B','A']);
assert.equal(AB.applied_step_count, 2);
assert.equal(BA.applied_step_count, 2);
assert.equal(AB.route[0].aperture_after.deficit_class, 'NUMERICAL_STABILITY_DEFICIT');
assert.equal(AB.route[0].aperture_after.disposition, 'PROPOSE');
assert.equal(BA.route[0].aperture_after.deficit_class, 'NUMERICAL_STABILITY_DEFICIT');
assert.equal(BA.route[0].aperture_after.disposition, 'PROPOSE');
assert.equal(AB.terminal_aperture.deficit_class, 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT');
assert.equal(AB.terminal_aperture.disposition, 'ASK_NOTHING');
assert.equal(AB.stop_reason, 'DEFICIT_CLOSED_AT_DECLARED_SEQUENCE_END');
assert.deepEqual(AB.terminal_operator, [[-1.25,0],[0,-0.25]]);
assert.ok(Math.abs(AB.terminal_geometry.sigma_min - 0.25) < 1e-12);
assert.ok(Math.abs(AB.terminal_geometry.condition_number - 5) < 1e-12);
assert.equal(BA.terminal_geometry.rank, 2);
assert.equal(BA.terminal_aperture.deficit_class, 'NUMERICAL_STABILITY_DEFICIT');
assert.equal(BA.terminal_aperture.disposition, 'PROPOSE');
assert.equal(BA.stop_reason, 'DECLARED_SEQUENCE_EXHAUSTED_WITH_OPEN_DEFICIT');
assert.ok(BA.terminal_geometry.sigma_min > 0.13 && BA.terminal_geometry.sigma_min < 0.14);
assert.ok(BA.terminal_geometry.condition_number > 17 && BA.terminal_geometry.condition_number < 18);

const CD = simulateGovernedQuestionSequence(['C','D']);
const DC = simulateGovernedQuestionSequence(['D','C']);
assert.equal(CD.applied_step_count, 2);
assert.equal(DC.applied_step_count, 2);
assert.deepEqual(CD.terminal_operator, DC.terminal_operator);
assert.deepEqual(CD.terminal_operator, [[1,0],[0,0.30000000000000004]]);
assert.equal(CD.terminal_aperture.disposition, 'ASK_NOTHING');
assert.equal(DC.terminal_aperture.disposition, 'ASK_NOTHING');

const missing = simulateGovernedQuestionSequence(['U']);
assert.equal(missing.applied_step_count, 0);
assert.equal(missing.stop_reason, 'QUESTION_TRANSITION_MODEL_INCOMPLETE');
assert.equal(missing.route[0].stop_reason, 'ABSTAIN_BEFORE_SEQUENCE_REAUDIT');
assert.equal(missing.real_observation_executed, false);

const needGate = simulateGovernedQuestionSequence(['C','D','A']);
assert.equal(needGate.applied_step_count, 2);
assert.equal(needGate.route[2].transition_status, 'NOT_APPLIED_NEED_GATE_CLOSED');
assert.equal(needGate.route[2].stop_reason, 'APERTURE_NO_FURTHER_QUESTION_NEEDED');

const irreversible = analyzeIrreversibleOrderControl();
assert.equal(irreversible.control_class, 'IRREVERSIBLE_MUTATION_ORDER_CONTROL');
assert.equal(irreversible.projection_determinant, 0);
assert.equal(irreversible.terminal_matrices_differ, true);
assert.equal(irreversible.RS_aperture.deficit_class, 'STRUCTURAL_RANK_DEFICIT');
assert.equal(irreversible.SR_aperture.deficit_class, 'STRUCTURAL_RANK_DEFICIT');
assert.equal(irreversible.reusable_transport_inference_permitted, false);
assert.equal(irreversible.holonomy_inference_permitted, false);

const receipt = runMultiStepQuestionOrderGauntlet();
assert.equal(receipt.schema, MULTI_STEP_QUESTION_ORDER_SCHEMA);
assert.equal(receipt.source_status, 'SIMULATED');
assert.equal(receipt.authority_class, 'A2_DERIVATIONAL');
assert.equal(receipt.current.aperture.deficit_class, 'NUMERICAL_STABILITY_DEFICIT');
assert.equal(receipt.reusable_main_pair.noncommuting_in_declared_finite_fixture, true);
assert.equal(receipt.reusable_main_pair.AB.terminal_aperture.disposition, 'ASK_NOTHING');
assert.equal(receipt.reusable_main_pair.BA.terminal_aperture.disposition, 'PROPOSE');
assert.equal(receipt.commuting_control.terminal_operators_equal, true);
assert.equal(receipt.irreversible_control.reusable_transport_inference_permitted, false);
assert.equal(receipt.missing_transition_control.stop_reason, 'QUESTION_TRANSITION_MODEL_INCOMPLETE');
assert.match(receipt.next_learning_action, /REFLEXIVE_QUESTION_POLICY/);
assert.ok(receipt.anti_equivalences.includes('question order dependence != holonomy'));
assert.ok(receipt.anti_equivalences.includes('reusable invertible transition != irreversible overwrite'));
assert.equal(receipt.claims.connection, false);
assert.equal(receipt.claims.curvature, false);
assert.equal(receipt.claims.physical_holonomy, false);
assert.equal(receipt.claims.quantum_measurement_disturbance, false);
assert.equal(receipt.claims.production_authority, false);
assert.equal(receipt.claims.vercel_authority, false);
assert.equal(receipt.installed_aperture_mutated, false);
assert.equal(receipt.pedagogue_law_promoted, false);
assert.equal(receipt.automatic_experiment_execution, false);
assert.equal(receipt.promotion_authority, false);

const spec = fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_MULTI_STEP_QUESTION_ORDER_GAUNTLET_SPEC_V0_1.md','utf8');
assert.match(spec, /same question multiset != same ordered route/);
assert.match(spec, /IRREVERSIBLE_MUTATION_ORDER_CONTROL/);
assert.match(spec, /commuting order-independent control/i);
assert.match(spec, /TEST_REFLEXIVE_QUESTION_POLICY/);
assert.match(spec, /question order dependence != holonomy/);

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  starting_deficit:receipt.current.aperture.deficit_class,
  AB_terminal_deficit:receipt.reusable_main_pair.AB.terminal_aperture.deficit_class,
  AB_terminal_condition_number:receipt.reusable_main_pair.AB.terminal_geometry.condition_number,
  BA_terminal_deficit:receipt.reusable_main_pair.BA.terminal_aperture.deficit_class,
  BA_terminal_condition_number:receipt.reusable_main_pair.BA.terminal_geometry.condition_number,
  main_pair_noncommuting:receipt.reusable_main_pair.noncommuting_in_declared_finite_fixture,
  commuting_control_equal:receipt.commuting_control.terminal_operators_equal,
  irreversible_control:receipt.irreversible_control.control_class,
  missing_transition:receipt.missing_transition_control.stop_reason,
  next_learning_action:receipt.next_learning_action,
  promotion_authority:receipt.promotion_authority
},null,2));
