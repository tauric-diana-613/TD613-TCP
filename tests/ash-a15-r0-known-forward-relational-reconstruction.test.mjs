import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  KNOWN_FORWARD_RELATIONAL_RECONSTRUCTION_SCHEMA,
  runKnownForwardRelationalReconstructionGauntlet
} from '../app/dome-world/previews/a15-r0/known-forward-relational-reconstruction.js';

const receipt = runKnownForwardRelationalReconstructionGauntlet();

assert.equal(receipt.schema, KNOWN_FORWARD_RELATIONAL_RECONSTRUCTION_SCHEMA);
assert.equal(receipt.source_status, 'SIMULATED');
assert.equal(receipt.authority_class, 'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional, true);
assert.deepEqual(receipt.oracle.latent_state, [2, 3, 5]);
assert.equal(receipt.oracle.oracle_state_exposed_to_reconstructor, false);

assert.deepEqual(receipt.forward_model.operator_ids, ['F12', 'F23', 'F13']);
assert.deepEqual(receipt.forward_model.definitions, { F12: 'x+y', F23: 'y+z', F13: 'x+z' });
assert.deepEqual(receipt.forward_model.matrix, [[1,1,0],[0,1,1],[1,0,1]]);
assert.equal(receipt.forward_model.determinant, 2);
assert.equal(receipt.forward_model.rank, 3);
assert.equal(receipt.forward_model.nullity, 0);
assert.equal(receipt.forward_model.forward_operator_known, true);

assert.equal(receipt.exact.classification, 'KNOWN_FORWARD_RELATIONAL_RECONSTRUCTION_EXACT_IN_SYNTHETIC_FIXTURE');
assert.deepEqual(receipt.exact.observation_vector, [5, 8, 7]);
assert.deepEqual(receipt.exact.observation_to_operator_binding, { O12: 5, O23: 8, O13: 7 });
assert.equal(receipt.exact.inverse_method, 'CLOSED_FORM_PAIRWISE_LINEAR_INVERSE');
assert.deepEqual(receipt.exact.reconstructed_state, [2, 3, 5]);
assert.deepEqual(receipt.exact.reconstruction_error_vector, [0, 0, 0]);
assert.equal(receipt.exact.reconstruction_error_l2, 0);
assert.equal(receipt.exact.in_sample_residual_l2, 0);
assert.equal(receipt.exact.heldout_prediction, 23);
assert.equal(receipt.exact.heldout_residual, 0);
assert.equal(receipt.exact.operator_provenance_valid, true);
assert.equal(receipt.exact.reconstruction_claim_admitted, true);
assert.equal(receipt.exact.unique_reconstruction_within_declared_model, true);

assert.equal(receipt.controls.repetition.rank, 1);
assert.equal(receipt.controls.repetition.nullity, 2);
assert.equal(receipt.controls.repetition.unique_reconstruction, false);
assert.equal(receipt.controls.repetition.repetition_promoted_to_operator_diversity, false);
assert.equal(receipt.controls.repetition.classification, 'REPEATED_FORWARD_OPERATOR_REMAINS_UNDERDETERMINED');
assert.match(receipt.controls.repetition.compatible_family, /x \+ y = 5/);

assert.deepEqual(receipt.controls.redundant_labels.operator_ids, ['G1', 'G2', 'G3']);
assert.deepEqual(receipt.controls.redundant_labels.duplicate_of, { G1: 'F12', G2: 'F12', G3: 'F12' });
assert.equal(receipt.controls.redundant_labels.rank, 1);
assert.equal(receipt.controls.redundant_labels.nullity, 2);
assert.equal(receipt.controls.redundant_labels.unique_reconstruction, false);
assert.equal(receipt.controls.redundant_labels.classification, 'REDUNDANT_OPERATOR_LABELS_DO_NOT_INCREASE_RECONSTRUCTION_RANK');

assert.equal(receipt.noisy.classification, 'KNOWN_FORWARD_RECONSTRUCTION_PERTURBATION_PROPAGATED');
assert.deepEqual(receipt.noisy.observation_binding, { O12: 5.1, O23: 7.9, O13: 7 });
assert.deepEqual(receipt.noisy.reconstructed_state, [2.1, 3, 4.9]);
assert.deepEqual(receipt.noisy.error_vector, [0.1, 0, -0.1]);
assert.equal(receipt.noisy.error_l2, 0.14142135623731);
assert.equal(receipt.noisy.noise_model_inferred, false);
assert.equal(receipt.noisy.uncertainty_distribution_estimated, false);
assert.equal(receipt.noisy.empirical_error_rate_claim, false);

const correct = receipt.heldout_validation.correct;
assert.equal(correct.classification, 'RECONSTRUCTION_PASSES_HELDOUT_OPERATOR_VALIDATION');
assert.deepEqual(correct.reconstructed_state, [2, 3, 5]);
assert.equal(correct.in_sample_residual_l2, 0);
assert.equal(correct.heldout_prediction, 23);
assert.equal(correct.heldout_residual, 0);
assert.equal(correct.operator_provenance_valid, true);
assert.equal(correct.reconstruction_claim_admitted, true);

const swapped = receipt.heldout_validation.swapped_binding;
assert.equal(swapped.classification, 'OPERATOR_OBSERVATION_BINDING_FAILURE_DETECTED_BY_HELDOUT_VALIDATOR');
assert.deepEqual(swapped.observation_to_operator_binding, { O12: 5, O23: 7, O13: 8 });
assert.deepEqual(swapped.reconstructed_state, [3, 2, 5]);
assert.equal(swapped.in_sample_residual_l2, 0);
assert.equal(swapped.heldout_prediction, 22);
assert.equal(swapped.heldout_residual, 1);
assert.equal(swapped.operator_provenance_valid, false);
assert.equal(swapped.reconstruction_claim_admitted, false);

assert.equal(receipt.inverse_problem_status, 'KNOWN_FORWARD_LINEAR_INVERSE_PROBLEM_EXECUTED_IN_BOUNDED_SYNTHETIC_FIXTURE');
assert.equal(receipt.tomography_grammar.abstract_experimental_reconstruction_grammar_earned, true);
assert.equal(receipt.tomography_grammar.physical_tomography, false);
assert.equal(receipt.tomography_grammar.quantum_state_tomography, false);
assert.equal(receipt.tomography_grammar.medical_tomography, false);
assert.equal(receipt.tomography_grammar.blind_tomography, false);
assert.equal(receipt.tomography_grammar.unknown_operator_reconstruction, false);
assert.equal(receipt.gauntlet_status, 'KNOWN_FORWARD_RELATIONAL_RECONSTRUCTION_GRAMMAR_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE');
assert.equal(receipt.reusable_relation_status, 'RESEARCH_REFINEMENT_CANDIDATE_ONLY');
assert.match(receipt.reusable_relations[0], /forward operators \+ observation\/operator binding \+ validation residual/);
assert.match(receipt.reusable_relations[1], /missing operator rank/);
assert.equal(receipt.next_learning_action, 'TEST_SELF_CALIBRATING_RECONSTRUCTION_WITH_PARTIALLY_UNKNOWN_FORWARD_OPERATOR');
assert.equal(receipt.promotion_authority, false);
assert.equal(receipt.production_mutated, false);
assert.equal(receipt.live_ash_binding, false);
assert.equal(receipt.human_closure_required, true);
assert.equal(receipt.claims.physical_tomography, false);
assert.equal(receipt.claims.quantum_state_tomography, false);
assert.equal(receipt.claims.medical_tomography, false);
assert.equal(receipt.claims.blind_tomography, false);
assert.equal(receipt.claims.connection, false);
assert.equal(receipt.claims.curvature, false);
assert.equal(receipt.claims.holonomy, false);
assert.equal(receipt.claims.berry_structure, false);
assert.equal(receipt.claims.quantum_behavior, false);
assert.equal(receipt.claims.proto_loom, false);
assert.equal(receipt.claims.production_authority, false);

const spec = fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/PEDAGOGUE_KNOWN_FORWARD_RELATIONAL_RECONSTRUCTION_SPEC_V0_1.md', 'utf8');
assert.match(spec, /S\* = \[x,y,z\]\^T/);
assert.match(spec, /det\(A\) = 2/);
assert.match(spec, /REPEATED_FORWARD_OPERATOR_REMAINS_UNDERDETERMINED/);
assert.match(spec, /OPERATOR_OBSERVATION_BINDING_FAILURE_DETECTED_BY_HELDOUT_VALIDATOR/);
assert.match(spec, /KNOWN_FORWARD_LINEAR_INVERSE_PROBLEM_EXECUTED_IN_BOUNDED_SYNTHETIC_FIXTURE/);
assert.match(spec, /tomographic reconstruction grammar/);
assert.match(spec, /TEST_SELF_CALIBRATING_RECONSTRUCTION_WITH_PARTIALLY_UNKNOWN_FORWARD_OPERATOR/);

console.log(JSON.stringify({
  ok: true,
  schema: receipt.schema,
  rank: receipt.forward_model.rank,
  determinant: receipt.forward_model.determinant,
  exact_reconstruction: receipt.exact.reconstructed_state,
  repetition_rank: receipt.controls.repetition.rank,
  noisy_reconstruction: receipt.noisy.reconstructed_state,
  noisy_error_l2: receipt.noisy.error_l2,
  swapped_reconstruction: swapped.reconstructed_state,
  swapped_heldout_residual: swapped.heldout_residual,
  inverse_problem_status: receipt.inverse_problem_status,
  tomography_grammar_earned: receipt.tomography_grammar.abstract_experimental_reconstruction_grammar_earned,
  next_learning_action: receipt.next_learning_action,
  promotion_authority: receipt.promotion_authority
}, null, 2));
