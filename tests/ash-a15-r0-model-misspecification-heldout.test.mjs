import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  MODEL_MISSPECIFICATION_HELDOUT_SCHEMA,
  runModelMisspecificationHeldoutGauntlet
} from '../app/dome-world/previews/a15-r0/model-misspecification-heldout.js';

const receipt = runModelMisspecificationHeldoutGauntlet();

assert.equal(receipt.schema, MODEL_MISSPECIFICATION_HELDOUT_SCHEMA);
assert.equal(receipt.source_status, 'SIMULATED');
assert.equal(receipt.authority_class, 'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional, true);
assert.deepEqual(receipt.candidate_family, ['R0', 'R1', 'R2']);
assert.equal(receipt.oracle_truth.route, 'RX');
assert.equal(receipt.oracle_truth.exposed_to_decoder, false);
assert.equal(receipt.oracle_truth.truth_membership_in_declared_candidate_family, false);

assert.equal(receipt.heldout_contract.heldout_channel_predeclared, true);
assert.equal(receipt.heldout_contract.heldout_channel_used_for_training, false);
assert.equal(receipt.heldout_contract.heldout_channel_used_for_candidate_selection, false);

assert.deepEqual(receipt.training_population.identified_set, ['R0']);
assert.equal(receipt.training_population.classification, 'POINT_IDENTIFIED_WITHIN_MISSPECIFIED_DECLARED_MODEL');
assert.equal(receipt.training_population.point_identified_within_declared_model, true);
assert.equal(receipt.training_population.truth_in_candidate_family, false);
assert.equal(receipt.training_population.truth_identified, false);
assert.equal(receipt.training_population.model_adequacy_established, false);

const caseA = receipt.cases.A_training_sample;
assert.deepEqual(caseA.sample, [0, 0, 0, 0, 0, 0]);
assert.equal(caseA.n_train, 6);
assert.equal(caseA.likelihoods.R0, 0.531441);
assert.equal(caseA.likelihoods.R1, 0.015625);
assert.equal(caseA.likelihoods.R2, 0.000001);
assert.equal(caseA.map_route, 'R0');
assert.equal(caseA.map_posterior, 0.971436770999);
assert.equal(caseA.posterior.R1, 0.028561401072);
assert.equal(caseA.posterior.R2, 0.00000182793);
assert.equal(caseA.classification, 'HIGH_CONFIDENCE_WITHIN_MISSPECIFIED_MODEL');
assert.equal(caseA.high_confidence_truth_claim, false);
assert.equal(caseA.model_adequacy_established, false);
assert.equal(caseA.candidate_family_completeness_inferred, false);

const caseB = receipt.cases.B_hard_holdout;
assert.equal(caseB.event, 'c');
assert.deepEqual(caseB.candidate_event_probabilities, { R0: 0, R1: 0, R2: 0 });
assert.equal(caseB.marginal_evidence_under_declared_model, 0);
assert.equal(caseB.all_admitted_candidates_assign_zero_probability, true);
assert.equal(caseB.classification, 'MODEL_CLASS_FALSIFIED_BY_HELDOUT_EVENT');
assert.equal(caseB.candidate_family_adequate_after_event, false);
assert.equal(caseB.within_model_training_posterior_still_historical, true);
assert.equal(caseB.posterior_update_under_declared_candidate_family, 'UNDEFINED_ZERO_EVIDENCE');
assert.equal(caseB.silent_probability_smoothing_applied, false);
assert.equal(caseB.truth_identified, false);
assert.equal(caseB.omitted_route_identified, false);

const caseC = receipt.cases.C_soft_holdout;
assert.equal(caseC.event, 'a');
assert.deepEqual(caseC.candidate_event_probabilities, { R0: 0.8, R1: 0.5, R2: 0.2 });
assert.equal(caseC.marginal_evidence_under_declared_model, 0.5);
assert.equal(caseC.classification, 'NO_HELDOUT_FALSIFICATION_OBSERVED');
assert.equal(caseC.model_validated, false);
assert.equal(caseC.candidate_family_complete, false);
assert.equal(caseC.truth_membership_in_candidate_family, false);

const caseD = receipt.cases.D_posthoc_expansion;
assert.deepEqual(caseD.candidate_family, ['R0', 'R1', 'R2', 'RX']);
assert.equal(caseD.provenance, 'POSTHOC_ORACLE_REVEALED');
assert.equal(caseD.independent_confirmation, false);
assert.equal(caseD.omitted_route_event_probability, 0.2);
assert.equal(caseD.classification, 'POSTHOC_CANDIDATE_EXPANSION_NOT_CONFIRMATORY');
assert.equal(caseD.RX_identified_from_heldout_event, false);
assert.equal(caseD.outside_alternative_uniquely_identified, false);

assert.deepEqual(receipt.question_status, {
  within_model_identification: 'ANSWERED',
  within_model_finite_sample_decision: 'ANSWERED',
  heldout_model_adequacy_test: 'ANSWERED_FOR_FROZEN_EVENTS',
  outside_truth_identification: 'UNRESOLVED'
});
assert.equal(receipt.gauntlet_status, 'MODEL_MISSPECIFICATION_AND_HELDOUT_ADEQUACY_GRAMMAR_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE');
assert.equal(receipt.reusable_relation_status, 'RESEARCH_REFINEMENT_CANDIDATE_ONLY');
assert.match(receipt.reusable_relation, /adequacy of the model are different questions/);
assert.equal(receipt.next_learning_action, 'TEST_PREDECLARED_CANDIDATE_EXPANSION_AND_OUT_OF_MODEL_RECOVERY');
assert.equal(receipt.promotion_authority, false);
assert.equal(receipt.production_mutated, false);
assert.equal(receipt.live_ash_binding, false);
assert.equal(receipt.human_closure_required, true);
assert.equal(receipt.claims.universal_model_misspecification_theorem, false);
assert.equal(receipt.claims.universal_bayesian_calibration, false);
assert.equal(receipt.claims.causal_identification, false);
assert.equal(receipt.claims.live_td613_stochastic_behavior, false);
assert.equal(receipt.claims.complete_ontology_of_omitted_alternatives, false);
assert.equal(receipt.claims.connection, false);
assert.equal(receipt.claims.curvature, false);
assert.equal(receipt.claims.holonomy, false);
assert.equal(receipt.claims.berry_structure, false);
assert.equal(receipt.claims.quantum_behavior, false);
assert.equal(receipt.claims.proto_loom, false);
assert.equal(receipt.claims.production_authority, false);

const spec = fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/PEDAGOGUE_MODEL_MISSPECIFICATION_HELDOUT_GAUNTLET_SPEC_V0_1.md', 'utf8');
assert.match(spec, /P\(R0\|Y_train,C\) = 0\.971436770999/);
assert.match(spec, /MODEL_CLASS_FALSIFIED_BY_HELDOUT_EVENT/);
assert.match(spec, /UNDEFINED_ZERO_EVIDENCE/);
assert.match(spec, /silent_probability_smoothing_applied = false/);
assert.match(spec, /NO_HELDOUT_FALSIFICATION_OBSERVED/);
assert.match(spec, /POSTHOC_CANDIDATE_EXPANSION_NOT_CONFIRMATORY/);
assert.match(spec, /failure to falsify on one held-out event[\s\S]*model validation/i);

console.log(JSON.stringify({
  ok: true,
  schema: receipt.schema,
  training_identified_set: receipt.training_population.identified_set,
  training_map_route: caseA.map_route,
  training_map_posterior: caseA.map_posterior,
  hard_holdout: caseB.classification,
  hard_holdout_posterior: caseB.posterior_update_under_declared_candidate_family,
  soft_holdout: caseC.classification,
  posthoc_expansion: caseD.classification,
  gauntlet_status: receipt.gauntlet_status,
  next_learning_action: receipt.next_learning_action,
  promotion_authority: receipt.promotion_authority
}, null, 2));
