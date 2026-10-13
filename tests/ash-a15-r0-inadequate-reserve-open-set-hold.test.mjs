import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  INADEQUATE_RESERVE_OPEN_SET_HOLD_SCHEMA,
  runInadequateReserveOpenSetHoldGauntlet
} from '../app/dome-world/previews/a15-r0/inadequate-reserve-open-set-hold.js';

const receipt = runInadequateReserveOpenSetHoldGauntlet();

assert.equal(receipt.schema, INADEQUATE_RESERVE_OPEN_SET_HOLD_SCHEMA);
assert.equal(receipt.source_status, 'SIMULATED');
assert.equal(receipt.authority_class, 'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional, true);
assert.deepEqual(receipt.primary_candidate_family, ['R0', 'R1', 'R2']);
assert.deepEqual(receipt.reserve_candidate_family, ['RX', 'RY', 'RZ']);
assert.equal(receipt.reserve_predeclaration_status, 'PREDECLARED_AND_FROZEN');
assert.equal(receipt.reserve_contract.predeclared_before_training, true);
assert.equal(receipt.reserve_contract.predeclared_before_trigger_event, true);
assert.equal(receipt.reserve_contract.predeclared_before_recovery_event, true);
assert.equal(receipt.reserve_contract.active_during_primary_training, false);
assert.equal(receipt.reserve_contract.eligible_for_primary_map_decision, false);
assert.equal(receipt.reserve_contract.activation_rule_frozen, true);
assert.equal(receipt.oracle.true_route, 'RU');
assert.equal(receipt.oracle.truth_in_primary_family, false);
assert.equal(receipt.oracle.truth_in_reserve_family, false);
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
assert.equal(receipt.activation.classification, 'PRIMARY_MODEL_FALSIFIED_RESERVE_ACTIVATED');
assert.equal(receipt.activation.evidence_role, 'ACTIVATION_EVIDENCE_ONLY');
assert.equal(receipt.activation.reserve_member_identified_from_trigger, false);
assert.equal(receipt.activation.reserve_map_from_trigger, 'NOT_COMPUTED_BY_DESIGN');

const adequacy = receipt.reserve_adequacy;
assert.equal(adequacy.event, 'o');
assert.deepEqual(adequacy.reserve_event_probabilities, { RX: 0, RY: 0, RZ: 0 });
assert.equal(adequacy.reserve_model_falsified, true);
assert.equal(adequacy.primary_model_adequate, false);
assert.equal(adequacy.reserve_model_adequate, false);
assert.equal(adequacy.selected_route, 'NONE');
assert.equal(adequacy.forced_nearest_candidate, false);
assert.equal(adequacy.open_set_state, 'OPEN_SET_UNRESOLVED');
assert.equal(adequacy.abstention_earned, true);
assert.equal(adequacy.truth_identified, false);
assert.equal(adequacy.classification, 'PRIMARY_AND_RESERVE_MODELS_FALSIFIED_OPEN_SET_HOLD');

assert.deepEqual(receipt.unknown_governance, {
  token: 'UNKNOWN_OUTSIDE_DECLARED_FAMILIES',
  unknown_token_is_candidate: false,
  unknown_token_has_route_likelihood: false,
  unknown_token_has_prior_probability: false,
  unknown_token_can_win_map: false
});

assert.deepEqual(receipt.negative_space, {
  classification: 'BOUNDED_NEGATIVE_SPACE_RECEIPT',
  excluded_primary_family: ['R0', 'R1', 'R2'],
  excluded_reserve_family: ['RX', 'RY', 'RZ'],
  exclusion_basis_primary: 'W:c',
  exclusion_basis_reserve: 'Q:o',
  outside_truth_identity: 'UNRESOLVED'
});

assert.equal(receipt.controls.forced_choice.classification, 'FORCED_CHOICE_AFTER_MODEL_EXHAUSTION_REJECTED');
assert.equal(receipt.controls.forced_choice.route_returned, 'NONE');
assert.equal(receipt.controls.forced_choice.historical_primary_map_reused, false);
assert.equal(receipt.controls.forced_choice.reserve_trigger_probability_used_as_recovery_rank, false);
assert.equal(receipt.controls.forced_choice.arbitrary_distance_fallback_used, false);

assert.equal(receipt.controls.posthoc_synthesis.proposed_candidate, 'R_NEW');
assert.equal(receipt.controls.posthoc_synthesis.classification, 'POSTHOC_CANDIDATE_SYNTHESIS_NOT_ADMITTED');
assert.equal(receipt.controls.posthoc_synthesis.new_candidate_synthesis_authorized, false);
assert.equal(receipt.controls.posthoc_synthesis.automatic_ontology_reopening_authorized, false);
assert.equal(receipt.controls.posthoc_synthesis.independent_predeclaration_or_new_governed_assay_required, true);

assert.equal(receipt.controls.soft_reserve.event, 'm');
assert.deepEqual(receipt.controls.soft_reserve.reserve_event_probabilities, { RX: 0.7, RY: 0.4, RZ: 0.2 });
assert.equal(receipt.controls.soft_reserve.classification, 'RESERVE_NOT_FALSIFIED_BY_CONTROL_EVENT');
assert.equal(receipt.controls.soft_reserve.reserve_validated, false);
assert.equal(receipt.controls.soft_reserve.reserve_complete, false);

assert.deepEqual(receipt.scope_ledger, {
  primary_candidate_family: ['R0', 'R1', 'R2'],
  reserve_candidate_family: ['RX', 'RY', 'RZ'],
  truth_in_primary_family: false,
  truth_in_reserve_family: false,
  primary_training_scope: 'Y:[0,0,0,0,0,0]',
  reserve_activation_scope: 'W:c',
  reserve_adequacy_scope: 'Q:o',
  primary_falsification_status: 'FALSIFIED',
  reserve_falsification_status: 'FALSIFIED',
  open_set_state: 'OPEN_SET_UNRESOLVED',
  oracle_truth_exposed_to_decoder: false
});

assert.equal(receipt.gauntlet_status, 'INADEQUATE_RESERVE_AND_OPEN_SET_HOLD_GRAMMAR_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE');
assert.equal(receipt.reusable_relation_status, 'RESEARCH_REFINEMENT_CANDIDATE_ONLY');
assert.match(receipt.reusable_relation, /earned abstention state/);
assert.equal(receipt.next_learning_action, 'TEST_NOISY_OPEN_SET_REJECTION_WITH_NONZERO_NEAR_MISS_SUPPORT');
assert.equal(receipt.promotion_authority, false);
assert.equal(receipt.production_mutated, false);
assert.equal(receipt.live_ash_binding, false);
assert.equal(receipt.human_closure_required, true);
assert.equal(receipt.claims.universal_open_set_recognition, false);
assert.equal(receipt.claims.universal_abstention_optimality, false);
assert.equal(receipt.claims.universal_model_rejection_threshold, false);
assert.equal(receipt.claims.causal_identification, false);
assert.equal(receipt.claims.live_td613_stochastic_behavior, false);
assert.equal(receipt.claims.connection, false);
assert.equal(receipt.claims.curvature, false);
assert.equal(receipt.claims.holonomy, false);
assert.equal(receipt.claims.berry_structure, false);
assert.equal(receipt.claims.quantum_behavior, false);
assert.equal(receipt.claims.proto_loom, false);
assert.equal(receipt.claims.production_authority, false);

const spec = fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/PEDAGOGUE_INADEQUATE_RESERVE_OPEN_SET_HOLD_GAUNTLET_SPEC_V0_1.md', 'utf8');
assert.match(spec, /UNKNOWN_OUTSIDE_DECLARED_FAMILIES/);
assert.match(spec, /PRIMARY_AND_RESERVE_MODELS_FALSIFIED_OPEN_SET_HOLD/);
assert.match(spec, /BOUNDED_NEGATIVE_SPACE_RECEIPT/);
assert.match(spec, /FORCED_CHOICE_AFTER_MODEL_EXHAUSTION_REJECTED/);
assert.match(spec, /POSTHOC_CANDIDATE_SYNTHESIS_NOT_ADMITTED/);
assert.match(spec, /abstention[\s\S]*failed reasoning/i);
assert.match(spec, /negative-space exclusion receipt[\s\S]*identification of the omitted truth/i);

console.log(JSON.stringify({
  ok: true,
  schema: receipt.schema,
  primary_map: receipt.primary_training.map_route,
  primary_posterior: receipt.primary_training.map_posterior,
  activation: receipt.activation.classification,
  reserve_adequacy: adequacy.classification,
  open_set_state: adequacy.open_set_state,
  negative_space: receipt.negative_space.classification,
  forced_choice: receipt.controls.forced_choice.classification,
  posthoc_synthesis: receipt.controls.posthoc_synthesis.classification,
  soft_control: receipt.controls.soft_reserve.classification,
  gauntlet_status: receipt.gauntlet_status,
  next_learning_action: receipt.next_learning_action,
  promotion_authority: receipt.promotion_authority
}, null, 2));
