import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  NOISY_OPEN_SET_NEAR_MISS_SCHEMA,
  runNoisyOpenSetNearMissGauntlet
} from '../app/dome-world/previews/a15-r0/noisy-open-set-near-miss.js';

const receipt = runNoisyOpenSetNearMissGauntlet();

assert.equal(receipt.schema, NOISY_OPEN_SET_NEAR_MISS_SCHEMA);
assert.equal(receipt.source_status, 'SIMULATED');
assert.equal(receipt.authority_class, 'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional, true);
assert.deepEqual(receipt.candidate_family, ['RX', 'RY', 'RZ']);
assert.deepEqual(receipt.candidate_parameters, { RX: 0.7, RY: 0.5, RZ: 0.3 });
assert.equal(receipt.hostile_oracle.true_route, 'RU');
assert.equal(receipt.hostile_oracle.parameter, 0.95);
assert.equal(receipt.hostile_oracle.truth_in_candidate_family, false);

assert.equal(receipt.criterion.role, 'FORMAL_DIAGNOSTIC');
assert.equal(receipt.criterion.sample_size, 100);
assert.equal(receipt.criterion.alpha_family, 0.01);
assert.equal(receipt.criterion.alpha_member, 0.0033333333333333335);
assert.equal(receipt.criterion.hoeffding_radius, 0.178842523679579);
assert.equal(receipt.criterion.predeclared, true);
assert.equal(receipt.criterion.selected_after_observation, false);
assert.equal(receipt.criterion.universal_threshold_claim, false);
assert.equal(receipt.criterion.empirical_validation_claim, false);

const hostile = receipt.cases.hostile;
assert.equal(hostile.ones, 95);
assert.equal(hostile.zeros, 5);
assert.equal(hostile.empirical_rate, 0.95);
assert.equal(hostile.oracle_truth, 'RU');
assert.equal(hostile.oracle_truth_in_candidate_family, false);
assert.equal(hostile.oracle_truth_exposed_to_decoder, false);
assert.deepEqual(hostile.candidate_distances, { RX: 0.25, RY: 0.45, RZ: 0.65 });
assert.equal(hostile.all_candidate_likelihoods_nonzero, true);
assert.ok(Object.values(hostile.candidate_likelihoods).every(value => value > 0));
assert.deepEqual(hostile.surviving_adequacy_set, []);
assert.equal(hostile.open_set_rejection_earned, true);
assert.equal(hostile.all_candidates_outside_predeclared_adequacy_band, true);
assert.equal(hostile.selected_route, 'NONE');
assert.equal(hostile.open_set_state, 'OPEN_SET_UNRESOLVED');
assert.equal(hostile.abstention_earned, true);
assert.equal(hostile.truth_identified, false);
assert.equal(hostile.classification, 'NOISY_OPEN_SET_REJECTION_EARNED');

const nearMiss = receipt.cases.near_miss;
assert.equal(nearMiss.ones, 85);
assert.equal(nearMiss.zeros, 15);
assert.equal(nearMiss.empirical_rate, 0.85);
assert.equal(nearMiss.oracle_truth, 'RU');
assert.equal(nearMiss.oracle_truth_in_candidate_family, false);
assert.equal(nearMiss.all_candidate_likelihoods_nonzero, true);
assert.deepEqual(nearMiss.candidate_distances, { RX: 0.15, RY: 0.35, RZ: 0.55 });
assert.deepEqual(nearMiss.surviving_adequacy_set, ['RX']);
assert.equal(nearMiss.open_set_rejection_earned, false);
assert.equal(nearMiss.classification, 'OPEN_SET_REJECTION_NOT_EARNED_NEAR_MISS');
assert.equal(nearMiss.oracle_outside_truth_used_to_override_criterion, false);
assert.equal(nearMiss.abstention_earned, false);
assert.equal(nearMiss.model_validated, false);
assert.equal(nearMiss.RX_truth_identified, false);
assert.equal(nearMiss.failure_to_reject_is_validation, false);

const control = receipt.cases.control;
assert.equal(control.ones, 72);
assert.equal(control.zeros, 28);
assert.equal(control.empirical_rate, 0.72);
assert.equal(control.oracle_truth, 'RX');
assert.equal(control.oracle_truth_in_candidate_family, true);
assert.equal(control.all_candidate_likelihoods_nonzero, true);
assert.deepEqual(control.candidate_distances, { RX: 0.02, RY: 0.22, RZ: 0.42 });
assert.deepEqual(control.surviving_adequacy_set, ['RX']);
assert.equal(control.open_set_rejection_earned, false);
assert.equal(control.classification, 'ADMITTED_CONTROL_SURVIVES_PREDECLARED_ADEQUACY_BAND');
assert.equal(control.surviving_candidate, 'RX');
assert.equal(control.criterion_conditioned_membership_support, true);
assert.equal(control.unconditional_truth_identification, false);
assert.equal(control.model_family_validated_universally, false);
assert.equal(control.failure_to_reject_is_validation, false);

assert.equal(receipt.controls.threshold_mutation.classification, 'POSTHOC_REJECTION_THRESHOLD_MUTATION_REJECTED');
assert.equal(receipt.controls.threshold_mutation.threshold_mutated, false);
assert.equal(receipt.controls.oracle_override.classification, 'ORACLE_OVERRIDE_OF_OBSERVED_CRITERION_REJECTED');
assert.equal(receipt.controls.oracle_override.oracle_override_applied, false);
assert.equal(receipt.controls.failure_to_reject_is_validation, false);

assert.equal(receipt.gauntlet_status, 'NOISY_OPEN_SET_NEAR_MISS_GRAMMAR_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE');
assert.equal(receipt.reusable_relation_status, 'RESEARCH_REFINEMENT_CANDIDATE_ONLY');
assert.match(receipt.reusable_relation, /predeclared evidence criteria/);
assert.match(receipt.reusable_relation, /nonzero candidate likelihood/);
assert.equal(receipt.next_learning_action, 'TEST_MULTI_PROBE_OPEN_SET_REJECTION_UNDER_MATCHED_OBSERVATION_BUDGETS');
assert.equal(receipt.promotion_authority, false);
assert.equal(receipt.production_mutated, false);
assert.equal(receipt.live_ash_binding, false);
assert.equal(receipt.human_closure_required, true);
assert.equal(receipt.claims.universal_open_set_recognition, false);
assert.equal(receipt.claims.universal_optimal_rejection_threshold, false);
assert.equal(receipt.claims.empirical_calibration_live_data, false);
assert.equal(receipt.claims.universal_hoeffding_optimality, false);
assert.equal(receipt.claims.causal_identification, false);
assert.equal(receipt.claims.live_td613_stochastic_behavior, false);
assert.equal(receipt.claims.tomography, false);
assert.equal(receipt.claims.connection, false);
assert.equal(receipt.claims.curvature, false);
assert.equal(receipt.claims.holonomy, false);
assert.equal(receipt.claims.berry_structure, false);
assert.equal(receipt.claims.quantum_behavior, false);
assert.equal(receipt.claims.proto_loom, false);
assert.equal(receipt.claims.production_authority, false);

const spec = fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/PEDAGOGUE_NOISY_OPEN_SET_NEAR_MISS_GAUNTLET_SPEC_V0_1.md', 'utf8');
assert.match(spec, /sqrt\(log\(600\) \/ 200\)/);
assert.match(spec, /0\.178842523679579/);
assert.match(spec, /NOISY_OPEN_SET_REJECTION_EARNED/);
assert.match(spec, /OPEN_SET_REJECTION_NOT_EARNED_NEAR_MISS/);
assert.match(spec, /ADMITTED_CONTROL_SURVIVES_PREDECLARED_ADEQUACY_BAND/);
assert.match(spec, /POSTHOC_REJECTION_THRESHOLD_MUTATION_REJECTED/);
assert.match(spec, /ORACLE_OVERRIDE_OF_OBSERVED_CRITERION_REJECTED/);
assert.match(spec, /failure to reject[\s\S]*model validation/i);
assert.match(spec, /measurement diversity > raw repetition/);

console.log(JSON.stringify({
  ok: true,
  schema: receipt.schema,
  criterion_radius: receipt.criterion.hoeffding_radius,
  hostile: hostile.classification,
  hostile_survivors: hostile.surviving_adequacy_set,
  near_miss: nearMiss.classification,
  near_miss_survivors: nearMiss.surviving_adequacy_set,
  control: control.classification,
  control_survivors: control.surviving_adequacy_set,
  next_learning_action: receipt.next_learning_action,
  promotion_authority: receipt.promotion_authority
}, null, 2));
