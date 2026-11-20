/**
 * @fileoverview Unit and integration tests for Fifth-Order Decision-Channel Laboratory tooling.
 *
 * Commission: "THE STAY THAT TESTIFIED AGAINST ITS AUTHOR"
 * Covenant: Khona‌lit-po (literal interior U+200C).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FIFTH_ORDER_COMMISSION_SCHEMA,
  DECISION_CHANNEL_LEAKAGE_SCHEMA,
  FOUR_REMEDY_CONDITIONS_SCHEMA,
  OBSERVER_RELATIVE_CHANNELS_SCHEMA,
  TEMPORAL_BATCHING_DILEMMA_SCHEMA,
  REPARATIVE_INTERVENTION_SCHEMA,
  evaluateDecisionChannelLeakage,
  evaluateFourRemedyConditions,
  evaluateObserverRelativeChannels,
  evaluateReparativeInterventionEthics,
  answerOperatorsQuestionOnRemedyLeakage
} from '../packages/rulefield/lab/counterworld_loom.mjs';

test('FIFTH-ORD 01: Impossibility theorem holds: D = Q causes I(Q; D) = 1.0 bit despite zero source-word leakage', () => {
  const result = evaluateDecisionChannelLeakage({ p_Q: 0.5, policyType: 'DETERMINISTIC_ONE_TO_ONE' });

  assert.equal(result.schema, DECISION_CHANNEL_LEAKAGE_SCHEMA);
  assert.equal(result.impossibility_theorem_holds, true);
  assert.equal(result.probability_distribution.mutual_information_I_Q_D_bits, 1.0);
  assert.equal(result.probability_distribution.posterior_P_Q1_given_D1, 1.0);

  // Lexical privacy is 100%, but semantic privacy is 0%
  assert.equal(result.four_conceptual_layers.lexical_privacy.tokens_leaked, 0);
  assert.equal(result.four_conceptual_layers.lexical_privacy.privacy_score, 1.0);
  assert.equal(result.four_conceptual_layers.semantic_property_disclosure.privacy_score, 0.0);
});

test('FIFTH-ORD 02: Precautionary policy drops mutual information from 1.0 bit to ~0.396 bit', () => {
  const result = evaluateDecisionChannelLeakage({ p_Q: 0.5, policyType: 'PRECAUTIONARY_STRUCTURAL' });

  assert.equal(result.schema, DECISION_CHANNEL_LEAKAGE_SCHEMA);
  assert.equal(result.impossibility_theorem_holds, false);
  assert.ok(result.probability_distribution.mutual_information_I_Q_D_bits < 0.5);
  assert.equal(result.probability_distribution.posterior_P_Q1_given_D1, 0.7143);
  assert.ok(result.four_conceptual_layers.semantic_property_disclosure.privacy_score > 0.5);
});

test('FIFTH-ORD 03: evaluateFourRemedyConditions evaluates Conditions A, B, C, D with exact trade-offs', () => {
  const report = evaluateFourRemedyConditions({ deadlineHours: 24.0, batchDelayHours: 12.0 });

  assert.equal(report.schema, FOUR_REMEDY_CONDITIONS_SCHEMA);
  assert.ok(report.conditions.condition_a);
  assert.ok(report.conditions.condition_b);
  assert.ok(report.conditions.condition_c);
  assert.ok(report.conditions.condition_d);

  assert.equal(report.conditions.condition_a.semantic_leakage_I_Q_D_bits, 1.0);
  assert.equal(report.conditions.condition_b.semantic_leakage_I_Q_D_bits, 1.0);
  assert.ok(report.conditions.condition_c.semantic_leakage_I_Q_D_bits < 0.5);
  assert.equal(report.conditions.condition_d.pre_deadline, true);
});

test('FIFTH-ORD 04: Condition B proves witness secrecy != proposition secrecy', () => {
  const report = evaluateFourRemedyConditions();
  const condB = report.conditions.condition_b;

  assert.equal(condB.source_words_exposed, 0);
  assert.equal(condB.witness_confidentiality, 'PERFECT_CRYPTOGRAPHIC_SECRECY');
  assert.equal(condB.proposition_public, true);
  assert.equal(condB.semantic_leakage_I_Q_D_bits, 1.0);
  assert.equal(condB.posterior_P_Q1_given_stay, 1.0);
});

test('FIFTH-ORD 05: Condition C achieves semantic privacy at the cost of 40% false-positive administrative burden', () => {
  const report = evaluateFourRemedyConditions();
  const condC = report.conditions.condition_c;

  assert.equal(condC.false_positive_rate, 0.40);
  assert.ok(condC.author_privacy_score > 0.5);
  assert.equal(condC.pre_deadline, true);
  assert.equal(condC.administrative_burden_score, 7.0);
});

test('FIFTH-ORD 06: Condition D verifies Dromological Batching Dilemma: pre-deadline vs post-deadline failure', () => {
  // Pre-deadline batching (t = 12h <= 24h)
  const pre = evaluateFourRemedyConditions({ deadlineHours: 24.0, batchDelayHours: 12.0 });
  assert.equal(pre.conditions.condition_d.pre_deadline, true);
  assert.equal(pre.conditions.condition_d.dromological_status, 'PRE_DEADLINE_EFFECTIVE');

  // Post-deadline batching (t = 28h > 24h)
  const post = evaluateFourRemedyConditions({ deadlineHours: 24.0, batchDelayHours: 28.0 });
  assert.equal(post.conditions.condition_d.pre_deadline, false);
  assert.equal(post.conditions.condition_d.dromological_status, 'POST_DEADLINE_FATAL_EVICTION_EXECUTED');
});

test('FIFTH-ORD 07: evaluateObserverRelativeChannels confirms epistemic asymmetry between reviewer, institution, and public', () => {
  const channels = evaluateObserverRelativeChannels();

  assert.equal(channels.schema, OBSERVER_RELATIVE_CHANNELS_SCHEMA);
  assert.equal(channels.channels.reviewer.residual_entropy_H_Q_bits, 0.0);
  assert.equal(channels.channels.institution.case_linked_to_subject, true);
  assert.equal(channels.channels.institution.semantic_leakage_bits, 1.0);
  assert.ok(channels.channels.public.semantic_leakage_bits < 0.2);
});

test('FIFTH-ORD 08: evaluateReparativeInterventionEthics models CBFE double bind and non-extraction', () => {
  const ethics = evaluateReparativeInterventionEthics();

  assert.equal(ethics.schema, REPARATIVE_INTERVENTION_SCHEMA);
  assert.ok(ethics.ethics.the_double_bind_of_protection);
  assert.equal(ethics.ethics.reparative_design_rules.length, 3);
  assert.equal(ethics.disposition, 'REPARATIVE_INTERVENTION_ETHICS_FORMALIZED');
});

test('FIFTH-ORD 09: answerOperatorsQuestionOnRemedyLeakage confirms the stay testified against its author', () => {
  const ans = answerOperatorsQuestionOnRemedyLeakage();

  assert.equal(ans.schema, FIFTH_ORDER_COMMISSION_SCHEMA);
  assert.ok(ans.formal_answer.direct_answer);
  assert.ok(ans.formal_answer.the_mechanism_of_the_leak);
  assert.equal(ans.disposition, 'DECISION_CHANNEL_EXTERIORITY_LEAKAGE_CONFIRMED');
});
