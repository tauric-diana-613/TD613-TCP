/**
 * @fileoverview Unit and integration tests for Third-Order Notary Laboratory tooling.
 *
 * Commission: "THE NOTARY WHO NEVER SAW THE WITNESS"
 * Covenant: Khona‌lit-po (literal interior U+200C).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  THIRD_ORDER_COMMISSION_SCHEMA,
  TWO_CERTIFIED_WORLDS_SCHEMA,
  DATA_PROCESSING_INEQUALITY_SCHEMA,
  EXTERIORITY_CHALLENGE_SCHEMA,
  THREE_CONDITIONS_TRIAL_SCHEMA,
  INDEPENDENT_WITNESS_TAXONOMY_SCHEMA,
  buildTwoCertifiedWorlds,
  auditTwoCertifiedWorldsDiscrimination,
  evaluateDataProcessingComposition,
  evaluateExteriorityChallenge,
  simulateThreeConditionsTrial,
  answerOperatorsQuestionOnWitnessIndependence
} from '../packages/rulefield/lab/counterworld_loom.mjs';

test('TO-NOTARY 01: buildTwoCertifiedWorlds constructs identical admitted records for distinct originating histories', () => {
  const { world_alpha, world_beta, common_admitted_record } = buildTwoCertifiedWorlds();

  // Originating histories differ
  assert.notEqual(world_alpha.ground_truth_history.originating_digest, world_beta.ground_truth_history.originating_digest);
  assert.equal(world_alpha.ground_truth_history.contains_qualifying_objection, true);
  assert.equal(world_beta.ground_truth_history.contains_qualifying_objection, false);

  // But institutional summaries and notary payloads match
  assert.equal(world_alpha.notary_received_payload.text, world_beta.notary_received_payload.text);
  assert.equal(world_alpha.notary_received_payload.digest, world_beta.notary_received_payload.digest);

  // Admitted records are byte-identical and signature-identical
  assert.equal(world_alpha.admitted_record.external_signature, world_beta.admitted_record.external_signature);
  assert.equal(world_alpha.admitted_record.timestamp, world_beta.admitted_record.timestamp);
  assert.equal(world_alpha.admitted_record.notary_identity.reputation_score, 1.0);
  assert.equal(world_alpha.admitted_record.notary_identity.compromised, false);
});

test('TO-NOTARY 02: auditTwoCertifiedWorldsDiscrimination confirms honest notary discrimination strictly fails', () => {
  const audit = auditTwoCertifiedWorldsDiscrimination();

  assert.equal(audit.schema, TWO_CERTIFIED_WORLDS_SCHEMA);
  assert.equal(audit.commission, 'THE_NOTARY_WHO_NEVER_SAW_THE_WITNESS');
  assert.equal(audit.covenant, 'Khona‌lit-po');
  assert.equal(audit.comparisons.originating_histories_match, false);
  assert.equal(audit.comparisons.admitted_records_match, true);
  assert.equal(audit.comparisons.notary_can_discriminate, false);
  assert.equal(audit.disposition, 'NOTARY_DISCRIMINATION_FAILED_WORLDS_COLLAPSED');
  assert.ok(audit.epistemic_defect.missing_observation);
});

test('TO-NOTARY 03: evaluateDataProcessingComposition validates I(H; N(E(H))) <= I(H; E(H)) = 0 bits', () => {
  const dpi = evaluateDataProcessingComposition();

  assert.equal(dpi.schema, DATA_PROCESSING_INEQUALITY_SCHEMA);
  assert.equal(dpi.data_processing_inequality_validated, true);
  assert.equal(dpi.entropy_metrics_bits.prior_entropy_H, 1.0);
  assert.equal(dpi.entropy_metrics_bits.mutual_information_H_E, 0.0);
  assert.equal(dpi.entropy_metrics_bits.mutual_information_H_N, 0.0);
  assert.equal(dpi.entropy_metrics_bits.information_gain_from_notary, 0.0);
  assert.equal(dpi.verdict, 'AUTHENTIC_CERTIFICATE_CANNOT_RESURRECT_ERASED_FIBER');
});

test('TO-NOTARY 04: Four evidentiary layers separate cryptographic authenticity from semantic adequacy', () => {
  const dpi = evaluateDataProcessingComposition();
  const layers = dpi.evidentiary_layers;

  assert.equal(layers.layer_1_cryptographic_authenticity.status, true);
  assert.equal(layers.layer_2_custody_continuity.status, true);
  assert.equal(layers.layer_3_source_assignment.status, false);
  assert.equal(layers.layer_4_semantic_adequacy.status, false);
});

test('TO-NOTARY 05: evaluateExteriorityChallenge proves 10 independent notaries add zero rank to observation matrix', () => {
  const challenge = evaluateExteriorityChallenge({ numSigners: 10 });

  assert.equal(challenge.schema, EXTERIORITY_CHALLENGE_SCHEMA);
  assert.equal(challenge.multi_signature_experiment.signers_count, 10);
  assert.equal(challenge.multi_signature_experiment.observation_subspace_rank, 1);
  assert.equal(challenge.multi_signature_experiment.distinction_recovered, false);
});

test('TO-NOTARY 06: Exteriority taxonomy distinguishes Level 1/2 from Level 3/4', () => {
  const challenge = evaluateExteriorityChallenge();
  const tax = challenge.exteriority_taxonomy;

  assert.equal(tax[0].relationship, 'INDEPENDENT_POSSESSION');
  assert.equal(tax[0].observation_rank, 1);
  assert.equal(tax[0].resolves_alpha_beta_distinction, false);

  assert.equal(tax[1].relationship, 'INDEPENDENT_CERTIFICATION');
  assert.equal(tax[1].observation_rank, 1);
  assert.equal(tax[1].resolves_alpha_beta_distinction, false);

  assert.equal(tax[2].relationship, 'INDEPENDENT_OBSERVATION_OF_PROCESS');
  assert.equal(tax[2].observation_rank, 2);
  assert.equal(tax[2].resolves_alpha_beta_distinction, true);
  assert.equal(tax[2].conflicts_with_author_opacity, true);

  assert.equal(tax[3].relationship, 'INDEPENDENT_PROPERTY_VERIFICATION');
  assert.equal(tax[3].observation_rank, 2);
  assert.equal(tax[3].resolves_alpha_beta_distinction, true);
  assert.equal(tax[3].conflicts_with_author_opacity, false); // Opacity preserved!
});

test('TO-NOTARY 07: simulateThreeConditionsTrial proves Condition B adds zero info, while Condition C resolves distinction', () => {
  const trial = simulateThreeConditionsTrial();

  assert.equal(trial.schema, THREE_CONDITIONS_TRIAL_SCHEMA);
  assert.equal(trial.condition_a.entropy_remaining_bits, 1.0);
  assert.equal(trial.condition_b.entropy_remaining_bits, 1.0);
  assert.equal(trial.condition_b.information_gain_over_condition_a_bits, 0.0);

  assert.equal(trial.condition_c.entropy_remaining_bits, 0.0);
  assert.equal(trial.condition_c.can_discriminate_alpha_from_beta, true);
  assert.equal(trial.condition_c.author_private_words_exposed, false);
  assert.equal(trial.disposition, 'BOUNDARY_WITNESS_SUCCEEDS_WHERE_NOTARY_FAILS');
});

test('TO-NOTARY 08: Hostile counterexample confirms portal-mediated probe collapses Condition C back to Condition B', () => {
  const trial = simulateThreeConditionsTrial({ intakeProbeMediatedByPortal: true });

  assert.equal(trial.condition_c.has_source_intake_witness, false);
  assert.equal(trial.condition_c.can_discriminate_alpha_from_beta, false);
  assert.equal(trial.condition_c.entropy_remaining_bits, 1.0);
  assert.equal(trial.condition_c.verdict, 'PROBE_MEDIATION_COLLAPSED_TO_CONDITION_B');
  assert.equal(trial.disposition, 'CONDITION_C_COUNTEREXAMPLE_CONFIRMED');
});

test('TO-NOTARY 09: answerOperatorsQuestionOnWitnessIndependence answers the Operator Question with 4 inviolable requirements', () => {
  const answer = answerOperatorsQuestionOnWitnessIndependence();

  assert.equal(answer.schema, INDEPENDENT_WITNESS_TAXONOMY_SCHEMA);
  assert.equal(answer.four_inviolable_witness_requirements.length, 4);
  assert.ok(answer.the_operators_question);
  assert.ok(answer.formal_answer);
  assert.equal(answer.disposition, 'INDEPENDENT_WITNESS_TAXONOMY_ESTABLISHED');
});
