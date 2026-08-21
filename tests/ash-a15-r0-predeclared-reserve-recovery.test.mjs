import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PREDECLARED_RESERVE_RECOVERY_SCHEMA,
  evaluatePosthocReserveMutation,
  runPredeclaredReserveRecoveryGauntlet
} from '../app/dome-world/previews/a15-r0/predeclared-reserve-recovery.js';

const receipt = runPredeclaredReserveRecoveryGauntlet();

assert.equal(receipt.schema, PREDECLARED_RESERVE_RECOVERY_SCHEMA);
assert.equal(receipt.source_status, 'SIMULATED');
assert.equal(receipt.authority_class, 'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional, true);
assert.deepEqual(receipt.primary_candidate_family, ['R0', 'R1', 'R2']);
assert.deepEqual(receipt.reserve_candidate_family, ['RX', 'RY', 'RZ']);
assert.equal(receipt.reserve_predeclaration_status, 'PREDECLARED_AND_FROZEN');
assert.equal(receipt.reserve_contract.predeclared_before_training, true);
assert.equal(receipt.reserve_contract.predeclared_before_trigger_event, true);
assert.equal(receipt.reserve_contract.active_during_primary_training, false);
assert.equal(receipt.reserve_contract.eligible_for_primary_map_decision, false);
assert.equal(receipt.reserve_contract.activation_rule_frozen, true);
assert.equal(receipt.oracle.true_route, 'RX');
assert.equal(receipt.oracle.truth_in_reserve, true);
assert.equal(receipt.oracle.truth_in_primary, false);
assert.equal(receipt.oracle.oracle_truth_exposed_to_decoder, false);

assert.equal(receipt.primary_training.map_route, 'R0');
assert.equal(receipt.primary_training.map_posterior, 0.971436770999);
assert.equal(receipt.primary_training.reserve_participated, false);
assert.equal(receipt.primary_training.status, 'PRIMARY_DECISION_RETAINED_AS_HISTORICAL_RECEIPT');

assert.equal(receipt.activation.event, 'c');
assert.deepEqual(receipt.activation.primary_event_probabilities, { R0: 0, R1: 0, R2: 0 });
assert.deepEqual(receipt.activation.reserve_event_probabilities, { RX: 0.2, RY: 0.4, RZ: 0.6 });
assert.equal(receipt.activation.primary_marginal_probability, 0);
assert.equal(receipt.activation.activation_rule_predeclared, true);
assert.equal(receipt.activation.activation_triggered, true);
assert.equal(receipt.activation.reserve_family_posthoc_modified, false);
assert.equal(receipt.activation.classification, 'PRIMARY_MODEL_FALSIFIED_RESERVE_ACTIVATED');
assert.equal(receipt.activation.evidence_role, 'ACTIVATION_EVIDENCE_ONLY');
assert.equal(receipt.activation.reserve_member_identified_from_trigger, false);
assert.equal(receipt.activation.reserve_map_from_trigger, 'NOT_COMPUTED_BY_DESIGN');

assert.equal(receipt.controls.trigger_only.classification, 'RESERVE_ACTIVATED_RECOVERY_UNRESOLVED');
assert.equal(receipt.controls.trigger_only.reserve_member_identified, false);

assert.deepEqual(receipt.recovery.sequence, ['u', 'v']);
assert.deepEqual(receipt.recovery.reserve_sequence_likelihoods, { RX: 0.21, RY: 0, RZ: 0 });
assert.deepEqual(receipt.recovery.identified_set, ['RX']);
assert.equal(receipt.recovery.recovered_route, 'RX');
assert.equal(receipt.recovery.classification, 'RECOVERED_WITHIN_PREDECLARED_RESERVE_MODEL');
assert.equal(receipt.recovery.recovery_evidence_independent_of_trigger_channel, true);
assert.equal(receipt.recovery.recovery_is_within_declared_finite_reserve_scope, true);
assert.equal(receipt.recovery.universal_truth_identification, false);

assert.equal(receipt.controls.inactive_reserve.classification, 'RECOVERY_EVIDENCE_HELD_OUTSIDE_INACTIVE_RESERVE');
assert.equal(receipt.controls.inactive_reserve.primary_decision_mutated, false);
assert.equal(receipt.controls.inactive_reserve.reserve_member_promoted, false);

const deletionAttempt = evaluatePosthocReserveMutation(['RX', 'RZ']);
assert.equal(deletionAttempt.mutation_detected, true);
assert.equal(deletionAttempt.classification, 'POSTHOC_RESERVE_MUTATION_REJECTED');
assert.equal(deletionAttempt.reserve_mutated, false);
const additionAttempt = evaluatePosthocReserveMutation(['RX', 'RY', 'RZ', 'RA']);
assert.equal(additionAttempt.mutation_detected, true);
assert.equal(additionAttempt.classification, 'POSTHOC_RESERVE_MUTATION_REJECTED');
assert.equal(additionAttempt.reserve_mutated, false);
const exactReserve = evaluatePosthocReserveMutation(['RX', 'RY', 'RZ']);
assert.equal(exactReserve.mutation_detected, false);
assert.equal(exactReserve.classification, 'NO_RESERVE_MUTATION_DETECTED');

assert.deepEqual(receipt.scope_ledger, {
  primary_candidate_family: ['R0', 'R1', 'R2'],
  reserve_candidate_family: ['RX', 'RY', 'RZ'],
  reserve_predeclaration_status: 'PREDECLARED_AND_FROZEN',
  activation_evidence: 'W:c',
  recovery_observation_scope: 'V:[u,v]',
  recovery_candidate_scope: ['RX', 'RY', 'RZ'],
  oracle_truth_exposed_to_decoder: false
});
assert.equal(receipt.gauntlet_status, 'PREDECLARED_RESERVE_ACTIVATION_AND_RECOVERY_GRAMMAR_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE');
assert.equal(receipt.reusable_relation_status, 'RESEARCH_REFINEMENT_CANDIDATE_ONLY');
assert.match(receipt.reusable_relation, /what alternatives existed before failure/);
assert.equal(receipt.next_learning_action, 'TEST_OPEN_SET_RECOVERY_WHEN_PREDECLARED_RESERVE_IS_ALSO_INADEQUATE');
assert.equal(receipt.promotion_authority, false);
assert.equal(receipt.production_mutated, false);
assert.equal(receipt.live_ash_binding, false);
assert.equal(receipt.human_closure_required, true);
assert.equal(receipt.claims.universal_open_set_recognition, false);
assert.equal(receipt.claims.universal_bayesian_model_selection, false);
assert.equal(receipt.claims.causal_identification, false);
assert.equal(receipt.claims.reserve_family_complete, false);
assert.equal(receipt.claims.live_td613_stochastic_behavior, false);
assert.equal(receipt.claims.connection, false);
assert.equal(receipt.claims.curvature, false);
assert.equal(receipt.claims.holonomy, false);
assert.equal(receipt.claims.berry_structure, false);
assert.equal(receipt.claims.quantum_behavior, false);
assert.equal(receipt.claims.proto_loom, false);
assert.equal(receipt.claims.production_authority, false);

const spec = fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/PEDAGOGUE_PREDECLARED_RESERVE_RECOVERY_GAUNTLET_SPEC_V0_1.md', 'utf8');
assert.match(spec, /P\(R0\|Y_train,C_primary\) = 0\.971436770999/);
assert.match(spec, /ACTIVATION_EVIDENCE_ONLY/);
assert.match(spec, /reserve_map_from_trigger = NOT_COMPUTED_BY_DESIGN/);
assert.match(spec, /L_V\(RX\) = 0\.7 \* 0\.3 = 0\.21/);
assert.match(spec, /RECOVERED_WITHIN_PREDECLARED_RESERVE_MODEL/);
assert.match(spec, /POSTHOC_RESERVE_MUTATION_REJECTED/);
assert.match(spec, /prepared answer waiting in the next drawer/);

console.log(JSON.stringify({
  ok: true,
  schema: receipt.schema,
  primary_map: receipt.primary_training.map_route,
  primary_posterior: receipt.primary_training.map_posterior,
  activation: receipt.activation.classification,
  trigger_role: receipt.activation.evidence_role,
  recovery: receipt.recovery.classification,
  recovered_route: receipt.recovery.recovered_route,
  posthoc_mutation: deletionAttempt.classification,
  gauntlet_status: receipt.gauntlet_status,
  next_learning_action: receipt.next_learning_action,
  promotion_authority: receipt.promotion_authority
}, null, 2));
