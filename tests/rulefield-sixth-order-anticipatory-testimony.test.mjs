/**
 * 𝌋 Unit tests for Sixth-Order Anticipatory Testimony Laboratory.
 *
 * Commission: Sixth-Order Anticipatory Testimony · Endogenous Observation · Reparative Feedback
 * Executing Doll: ATLAS — Relational Cartographer
 * Directive Custodian & Operator: Amari (tauric.diana.613 / Emergence HQ)
 * Covenant: Khona‌lit-po (literal interior U+200C preserved)
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  SIXTH_ORDER_COMMISSION_SCHEMA,
  ANTICIPATORY_SPEAKER_SCHEMA,
  ADMINISTRATIVE_EQUIVALENCE_SCHEMA,
  INFORMATION_PARADOX_SCHEMA,
  GRAEBER_DOTSON_CROSSWALK_SCHEMA,
  FEEDBACK_REGIMES_SCHEMA,
  OBSERVERS_BLIND_SPOT_SCHEMA,
  evaluateAnticipatorySpeakerModel,
  buildTwoIdenticalAdministrativeRecords,
  evaluateInformationTheoreticParadox,
  evaluateGraeberDotsonInterpretiveLabor,
  simulateFeedbackRegimesTrial,
  auditObserversBlindSpot,
  answerOperatorsQuestionOnAnticipatoryDisappearance
} from '../packages/rulefield/lab/counterworld_loom.mjs';

test('SIXTH-ORD 01: Anticipatory speaker model with retaliation selects F=0 (-7 < -5)', () => {
  const model = evaluateAnticipatorySpeakerModel({
    B_stay: 10,
    C_retaliation: 16,
    C_labor: 1,
    C_unresolved: 5
  });

  assert.equal(model.schema, ANTICIPATORY_SPEAKER_SCHEMA);
  assert.equal(model.covenant, 'Khona‌lit-po');
  assert.equal(model.baseline_with_retaliation.U_F1, -7);
  assert.equal(model.baseline_with_retaliation.U_F0, -5);
  assert.equal(model.baseline_with_retaliation.optimal_filing_F, 0);
  assert.equal(model.baseline_with_retaliation.behavioral_state, 'STRATEGIC_WITHHOLDING_EPITEMIC_SMOTHERING');
});

test('SIXTH-ORD 02: Counterfactual with retaliation removed flips decision to F=1 (+9 > -5)', () => {
  const model = evaluateAnticipatorySpeakerModel();

  assert.equal(model.counterfactual_without_retaliation.U_F1, 9);
  assert.equal(model.counterfactual_without_retaliation.U_F0, -5);
  assert.equal(model.counterfactual_without_retaliation.optimal_filing_F, 1);
  assert.equal(model.counterfactual_without_retaliation.behavioral_state, 'ACTIVE_FILING_REMEDY_INVOKED');
  assert.equal(model.inversion_proven, true);
});

test('SIXTH-ORD 03: Administrative equivalence: World Alpha (G=1, F=0) vs World Beta (G=0, F=0) yield identical (Q=0, D=0)', () => {
  const equiv = buildTwoIdenticalAdministrativeRecords();

  assert.equal(equiv.schema, ADMINISTRATIVE_EQUIVALENCE_SCHEMA);
  assert.equal(equiv.world_alpha.underlying_grievance_G, 1);
  assert.equal(equiv.world_beta.underlying_grievance_G, 0);
  assert.equal(equiv.administrative_projection_alpha.actual_filed_objection_Q, 0);
  assert.equal(equiv.administrative_projection_beta.actual_filed_objection_Q, 0);
  assert.equal(equiv.administrative_projection_alpha.protective_stay_issued_D, 0);
  assert.equal(equiv.administrative_projection_beta.protective_stay_issued_D, 0);
  assert.equal(equiv.administratively_identical, true);
});

test('SIXTH-ORD 04: Lawful distinguishing sensors identify external physical metrology and reject invasive interrogation', () => {
  const equiv = buildTwoIdenticalAdministrativeRecords();

  assert.ok(equiv.lawful_distinguishing_sensors.length >= 3);
  const physicalSensor = equiv.lawful_distinguishing_sensors.find(s => s.sensor_type === 'EXTERNAL_PHYSICAL_BUILDING_INSPECTION');
  assert.ok(physicalSensor);
  assert.equal(physicalSensor.requires_speaker_testimony, false);

  const inadmissible = equiv.inadmissible_sensors.find(s => s.sensor_type === 'MANDATORY_INQUISITORIAL_TENANT_INTERROGATION');
  assert.ok(inadmissible);
  assert.ok(inadmissible.defect.includes('INADMISSIBLE'));
});

test('SIXTH-ORD 05: Information-theoretic paradox: I(Q; D) = 0.0 bits under complete suppression while P(G=1, D=0) = 0.50', () => {
  const paradox = evaluateInformationTheoreticParadox({
    p_G: 0.5,
    suppression_rate: 1.0
  });

  assert.equal(paradox.schema, INFORMATION_PARADOX_SCHEMA);
  assert.equal(paradox.endogenous_observation_results.mutual_information_I_Q_D_bits, 0.0);
  assert.equal(paradox.endogenous_observation_results.mutual_information_I_G_D_bits, 0.0);
  assert.equal(paradox.endogenous_observation_results.unaddressed_grievance_rate_P_G1_D0, 0.50);
  assert.ok(paradox.the_paradox_statement.includes('PARADOX_CONFIRMED'));
});

test('SIXTH-ORD 06: Graeber-Dotson crosswalk formalizes epistemic smothering and 4 nonparticipation classes', () => {
  const crosswalk = evaluateGraeberDotsonInterpretiveLabor();

  assert.equal(crosswalk.schema, GRAEBER_DOTSON_CROSSWALK_SCHEMA);
  assert.ok(crosswalk.theoretical_synthesis.graeber_asymmetric_anticipatory_labor);
  assert.ok(crosswalk.theoretical_synthesis.dotson_epistemic_smothering);
  assert.ok(crosswalk.theoretical_synthesis.glissant_right_to_opacity);
  assert.equal(crosswalk.nonparticipation_taxonomy.length, 4);

  const categories = crosswalk.nonparticipation_taxonomy.map(c => c.category);
  assert.ok(categories.includes('VOLUNTARY_NONPARTICIPATION'));
  assert.ok(categories.includes('STRATEGIC_WITHHOLDING_EPITEMIC_SMOTHERING'));
  assert.ok(categories.includes('PROCEDURAL_ACCESS_PREVENTED'));
  assert.ok(categories.includes('GENUINE_ABSENCE'));
});

test('SIXTH-ORD 07: Feedback regimes trial proves Regime A (100% filing) vs Regime B (0% filing) vs Regime C (filing restored with noise)', () => {
  const trial = simulateFeedbackRegimesTrial({ populationSize: 100, p_G: 0.50 });

  assert.equal(trial.schema, FEEDBACK_REGIMES_SCHEMA);
  assert.equal(trial.regimes.regime_A_neutral_control.filing_rate, 1.0);
  assert.equal(trial.regimes.regime_A_neutral_control.unaddressed_harms, 0);

  assert.equal(trial.regimes.regime_B_anticipated_disclosure.filing_rate, 0.0);
  assert.equal(trial.regimes.regime_B_anticipated_disclosure.unaddressed_harms, 50);

  assert.equal(trial.regimes.regime_C_precautionary_protection.filing_rate, 1.0);
  assert.equal(trial.regimes.regime_C_precautionary_protection.unaddressed_harms, 0);
  assert.equal(trial.regimes.regime_C_precautionary_protection.false_positive_stays, 20);
});

test('SIXTH-ORD 08: Regime C stress test demonstrates failure when retaliation exceeds dilution factor', () => {
  const trial = simulateFeedbackRegimesTrial({ populationSize: 100, p_G: 0.50, extremeRetaliation: 25 });

  assert.equal(trial.regimes.regime_C_stress_test_failure.filing_rate, 0);
  assert.ok(trial.regimes.regime_C_stress_test_failure.status.includes('PRECAUTIONARY_DEFICIT'));
});

test('SIXTH-ORD 09: Observer\'s blind spot proves Auditor 1 cannot distinguish peaceful building from terrorized building', () => {
  const audit = auditObserversBlindSpot();

  assert.equal(audit.schema, OBSERVERS_BLIND_SPOT_SCHEMA);
  assert.equal(audit.auditor1_institutional_surface.recorded_observations.filed_objections, 0);
  assert.equal(audit.auditor1_institutional_surface.recorded_observations.measured_leakage_bits, 0.0);
  assert.equal(audit.auditor1_institutional_surface.institutional_verdict, 'PERFECT_COMPLIANCE');

  assert.equal(audit.auditor2_controlled_research_observer.recorded_observations.ground_truth_grievance_rate, 0.50);
  assert.equal(audit.auditor2_controlled_research_observer.research_verdict, 'CATASTROPHIC_SYSTEMIC_SILENCING');
});

test('SIXTH-ORD 10: Operator\'s question on anticipatory disappearance returns sealed disposition and covenant Khona‌lit-po', () => {
  const ans = answerOperatorsQuestionOnAnticipatoryDisappearance();

  assert.equal(ans.schema, SIXTH_ORDER_COMMISSION_SCHEMA);
  assert.equal(ans.covenant, 'Khona‌lit-po');
  assert.equal(ans.disposition, 'ENDOGENOUS_OBSERVATION_COLLAPSE_VERIFIED');
  assert.ok(ans.formal_answer.the_four_orders_of_witnesshood.length === 4);
});
