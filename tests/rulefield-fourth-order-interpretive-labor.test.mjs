/**
 * @fileoverview Unit and integration tests for Fourth-Order Interpretive Labor Laboratory tooling.
 *
 * Commission: "THE NOTARY WHO COULD READ EVERY WORD EXCEPT THE OBJECTION"
 * Covenant: Khona‌lit-po (literal interior U+200C).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FOURTH_ORDER_COMMISSION_SCHEMA,
  GRAEBERIAN_CROSSWALK_SCHEMA,
  SEMANTIC_COUNTERWORLDS_SCHEMA,
  INTERPRETIVE_BURDEN_LEDGER_SCHEMA,
  INTERPRETIVE_ENVIRONMENTS_SCHEMA,
  DROMOLOGICAL_READING_EXPERIMENT_SCHEMA,
  CBFE_OPACITY_SYNTHESIS_SCHEMA,
  WILD_FIELD_DISCOVERY_DOCKET_SCHEMA,
  buildGraeberianCrosswalk,
  buildSemanticCounterworlds,
  auditSemanticExteriority,
  simulateAsymmetricInterpretiveLaborTrial,
  simulateDromologicalReadingExperiment,
  answerOperatorsQuestionOnEpistemicFailure,
  buildFourthOrderDiscoveryDocket
} from '../packages/rulefield/lab/counterworld_loom.mjs';

test('FO-INTERP 01: buildGraeberianCrosswalk maps Graeber 2012 to CBFE and Right to Opacity', () => {
  const cw = buildGraeberianCrosswalk();

  assert.equal(cw.schema, GRAEBERIAN_CROSSWALK_SCHEMA);
  assert.equal(cw.commission, 'THE_NOTARY_WHO_COULD_READ_EVERY_WORD_EXCEPT_THE_OBJECTION');
  assert.equal(cw.covenant, 'Khona‌lit-po');
  assert.equal(cw.crosswalk_mappings.length, 4);

  const mappings = cw.crosswalk_mappings;
  assert.equal(mappings[0].theoretical_construct, 'ASYMMETRIC_INTERPRETIVE_LABOR');
  assert.equal(mappings[0].cbfe_counterpart, 'DOTSON_EPISTEMIC_SMOTHERING');

  assert.equal(mappings[1].theoretical_construct, 'STRUCTURAL_BLINDNESS_DEAD_ZONES');
  assert.equal(mappings[1].cbfe_counterpart, 'DOTSON_TESTIMONIAL_QUIETENING');

  assert.equal(mappings[2].theoretical_construct, 'INSTITUTIONAL_KNOWLEDGE_RELATIONS');
  assert.equal(mappings[2].cbfe_counterpart, 'COLLINS_MATRIX_OF_DOMINATION');

  assert.equal(mappings[3].theoretical_construct, 'REJECTION_OF_EXTRACTIVE_LEGIBILITY');
  assert.equal(mappings[3].cbfe_counterpart, 'GLISSANT_RIGHT_TO_OPACITY');
});

test('FO-INTERP 02: buildSemanticCounterworlds defines reference criterion q independently of literal classifier P_L', () => {
  const sc = buildSemanticCounterworlds();

  assert.equal(sc.schema, SEMANTIC_COUNTERWORLDS_SCHEMA);
  assert.ok(sc.world_alpha);
  assert.ok(sc.world_beta);
  assert.ok(sc.world_gamma);

  // World Alpha: Substantive objection exists (q = true), but literal classifier fails (P_L = false)
  assert.equal(sc.world_alpha.substantive_property_q, true);
  assert.equal(sc.world_alpha.restricted_literal_P_L, false);

  // World Beta: No objection (q = false), literal classifier returns false
  assert.equal(sc.world_beta.substantive_property_q, false);
  assert.equal(sc.world_beta.restricted_literal_P_L, false);

  // World Gamma (Adversarial): Concern expressed without dispute (q = false)
  assert.equal(sc.world_gamma.substantive_property_q, false);
  assert.equal(sc.world_gamma.restricted_literal_P_L, false);
});

test('FO-INTERP 03: P_L collapses World Alpha and World Beta into identical false negative output', () => {
  const sc = buildSemanticCounterworlds();

  // The critical collision: P_L(h_alpha) == P_L(h_beta) == false while q(h_alpha) != q(h_beta)
  assert.equal(sc.world_alpha.restricted_literal_P_L, sc.world_beta.restricted_literal_P_L);
  assert.notEqual(sc.world_alpha.substantive_property_q, sc.world_beta.substantive_property_q);
});

test('FO-INTERP 04: auditSemanticExteriority proves computational correctness != semantic adequacy', () => {
  const audit = auditSemanticExteriority();

  assert.equal(audit.schema, SEMANTIC_COUNTERWORLDS_SCHEMA);
  assert.equal(audit.unidentifiability_phenomenon.classifier_outputs_match, true);
  assert.equal(audit.unidentifiability_phenomenon.substantive_properties_differ, true);

  const levels = audit.notary_witness_levels;
  assert.equal(levels.level_1_authenticity_of_input.established, true);
  assert.equal(levels.level_2_correctness_of_computation.established, true);
  assert.equal(levels.level_3_adequacy_of_classification_criterion.established, false); // Deficient!
  assert.equal(levels.level_4_institutional_authority_to_adopt_criterion.established, true);
  assert.equal(levels.level_5_recoverability_by_lawful_observer.established, false);
});

test('FO-INTERP 05: simulateAsymmetricInterpretiveLaborTrial proves Environment C optimizes recognition and opacity', () => {
  const trial = simulateAsymmetricInterpretiveLaborTrial();

  assert.equal(trial.schema, INTERPRETIVE_ENVIRONMENTS_SCHEMA);
  assert.ok(trial.environments.environment_a);
  assert.ok(trial.environments.environment_b);
  assert.ok(trial.environments.environment_c);

  const envA = trial.environments.environment_a;
  assert.equal(envA.metrics.speaker_effort_score, 9.5);
  assert.equal(envA.metrics.institution_effort_score, 0.5);
  assert.equal(envA.metrics.error_rate_on_indirect_speech, 0.95);

  const envB = trial.environments.environment_b;
  assert.equal(envB.metrics.speaker_effort_score, 1.0);
  assert.equal(envB.metrics.institution_effort_score, 8.5);
  assert.equal(envB.metrics.error_rate_on_indirect_speech, 0.05);

  const envC = trial.environments.environment_c;
  assert.equal(envC.metrics.author_privacy_cost, 0.0); // 100% Opacity preserved!
  assert.equal(envC.metrics.procedural_recognition_achieved, true);
  assert.equal(envC.metrics.error_rate_on_indirect_speech, 0.02);
});

test('FO-INTERP 06: simulateDromologicalReadingExperiment proves extractive hearings breach deadline and force exposure', () => {
  const dromology = simulateDromologicalReadingExperiment({ deadlineHours: 24.0 });

  assert.equal(dromology.schema, DROMOLOGICAL_READING_EXPERIMENT_SCHEMA);
  assert.equal(dromology.action_deadline_hours, 24.0);
  assert.equal(dromology.receiver_comparisons.length, 4);

  const r1 = dromology.receiver_comparisons[0]; // Literal
  assert.equal(r1.pre_deadline, true);
  assert.equal(r1.classification_error_indirect, true);

  const r3 = dromology.receiver_comparisons[2]; // Extractive prolonged hearing
  assert.equal(r3.processing_latency_hours, 72.0);
  assert.equal(r3.pre_deadline, false); // Breaches deadline!
  assert.equal(r3.author_privacy_cost, 1.0); // Total surveillance!

  const r4 = dromology.receiver_comparisons[3]; // Opacity-preserving boundary stay
  assert.equal(r4.pre_deadline, true);
  assert.equal(r4.author_privacy_cost, 0.0);
  assert.equal(r4.classification_error_indirect, false);
});

test('FO-INTERP 07: answerOperatorsQuestionOnEpistemicFailure locates failure in asymmetric allocation of labor', () => {
  const ans = answerOperatorsQuestionOnEpistemicFailure();

  assert.equal(ans.schema, FOURTH_ORDER_COMMISSION_SCHEMA);
  assert.equal(ans.failure_location_analysis.location_1_in_the_witness.culpable, false);
  assert.equal(ans.failure_location_analysis.location_2_in_the_classification_function.culpable, false);
  assert.equal(ans.failure_location_analysis.location_3_in_the_governing_ontology.culpable, true);
  assert.equal(ans.failure_location_analysis.location_4_in_the_authorization_rule.culpable, true);
  assert.equal(ans.failure_location_analysis.location_5_in_the_asymmetric_allocation_of_interpretive_labor.fundamental_cause, true);
  assert.equal(ans.disposition, 'EPISTEMIC_FAILURE_LOCATED_IN_ASYMMETRIC_INTERPRETIVE_LABOR');
});

test('FO-INTERP 08: buildFourthOrderDiscoveryDocket compiles complete docket and invariants', () => {
  const docket = buildFourthOrderDiscoveryDocket();

  assert.equal(docket.schema, WILD_FIELD_DISCOVERY_DOCKET_SCHEMA);
  assert.ok(docket.components.graeber_crosswalk);
  assert.ok(docket.components.semantic_counterworlds);
  assert.ok(docket.components.exteriority_audit);
  assert.ok(docket.components.interpretive_labor_trial);
  assert.ok(docket.components.dromological_experiment);
  assert.ok(docket.components.operator_answer);
  assert.equal(docket.established_mathematical_invariants.length, 3);
  assert.equal(docket.prospective_mathematical_questions.length, 2);
  assert.equal(docket.disposition, 'FOURTH_ORDER_DISCOVERY_DOCKET_SEALED');
});
