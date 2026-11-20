/**
 * 𝌋 Unit tests for Seventh-Order Independent Metrology Laboratory.
 *
 * Commission: Seventh-Order Independent Metrology · Silent-History Identifiability · Observer-Relative Evidence
 * Executing Doll: ATLAS — Relational Cartographer
 * Directive Custodian & Operator: Amari (tauric.diana.613 / Emergence HQ)
 * Covenant: Khona‌lit-po (literal interior U+200C preserved)
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  SEVENTH_ORDER_COMMISSION_SCHEMA,
  FOUR_SILENT_WORLDS_SCHEMA,
  PHYSICAL_METROLOGY_SCHEMA,
  CONDITIONAL_INFORMATION_SCHEMA,
  TEMPORAL_COUNTERWORLD_SCHEMA,
  EVIDENTIARY_TRANSLATION_SCHEMA,
  THREE_AUDITORS_SCHEMA,
  buildFourSilentWorlds,
  evaluatePhysicalMetrologyModel,
  evaluateConditionalInformationDissociation,
  evaluateTemporalCounterworldRecovery,
  auditEvidentiaryTranslationLattice,
  evaluateThreeAuditorsComparison,
  evaluateGraeberDotsonGlissantSynthesis,
  answerOperatorsQuestionOnIndependentMetrology
} from '../packages/rulefield/lab/counterworld_loom.mjs';

test('SEVENTH-ORD 01: Four Silent Worlds all terminate in (Q=0, D=0) under administrative projection', () => {
  const dossier = buildFourSilentWorlds();

  assert.equal(dossier.schema, FOUR_SILENT_WORLDS_SCHEMA);
  assert.equal(dossier.covenant, 'Khona‌lit-po');
  assert.equal(dossier.administrative_equivalence.strictly_identical, true);
  assert.equal(dossier.administrative_equivalence.pi_admin_projection.Q, 0);
  assert.equal(dossier.administrative_equivalence.pi_admin_projection.D, 0);

  const worlds = Object.values(dossier.worlds);
  assert.equal(worlds.length, 4);
  assert.ok(worlds.find(w => w.id === 'WORLD_ALPHA_PEACEFUL'));
  assert.ok(worlds.find(w => w.id === 'WORLD_BETA_UNREPORTED_HAZARD'));
  assert.ok(worlds.find(w => w.id === 'WORLD_GAMMA_REPAIRED'));
  assert.ok(worlds.find(w => w.id === 'WORLD_DELTA_OUTSIDE_INSTRUMENT'));
});

test('SEVENTH-ORD 02: Physical metrology model decouples H from G and verifies Data Processing Inequality', () => {
  const metrology = evaluatePhysicalMetrologyModel({
    sensitivity: 0.90,
    specificity: 0.90,
    prior_H: 0.50,
    p_G_given_H1: 1.0,
    p_G_given_H0: 0.25
  });

  assert.equal(metrology.schema, PHYSICAL_METROLOGY_SCHEMA);
  assert.equal(metrology.calibration.sensitivity, 0.90);
  assert.equal(metrology.calibration.specificity, 0.90);

  // I(H; X) must be strictly greater than I(G; X) because G <-> H <-> X is Markov
  assert.ok(metrology.information_metrics.mutual_information_I_H_X_bits > 0.50);
  assert.ok(metrology.information_metrics.mutual_information_I_G_X_bits < metrology.information_metrics.mutual_information_I_H_X_bits);
  assert.ok(metrology.information_metrics.information_dissociation_gap_bits > 0.20);
});

test('SEVENTH-ORD 03: Conditional mutual information dissociation under (Q=0, D=0)', () => {
  const cond = evaluateConditionalInformationDissociation();

  assert.equal(cond.schema, CONDITIONAL_INFORMATION_SCHEMA);
  assert.ok(cond.conditional_mutual_information.I_H_X_given_QD_bits > cond.conditional_mutual_information.I_G_X_given_QD_bits);
  assert.ok(cond.strongest_counterexample.title.includes('WORLD DELTA'));
});

test('SEVENTH-ORD 04: Temporal counterworld recovery: World Alpha vs World Gamma indistinguishable at t1', () => {
  const currentOnly = evaluateTemporalCounterworldRecovery({ admitAuthenticHistoricalObservation: false });

  assert.equal(currentOnly.schema, TEMPORAL_COUNTERWORLD_SCHEMA);
  assert.equal(currentOnly.current_inspection_t1.distinguishable, false);
  assert.equal(currentOnly.historical_recovery.distinguishable, false);

  const withHistory = evaluateTemporalCounterworldRecovery({ admitAuthenticHistoricalObservation: true });
  assert.equal(withHistory.historical_recovery.distinguishable, true);
  assert.equal(withHistory.historical_recovery.evidence_basis, 'AUTHENTIC_TIMESTAMPED_T0_LOG_EXAMINED');
  assert.ok(withHistory.historical_recovery.standing_of_past_claim.includes('RETAINS_STANDING'));
});

test('SEVENTH-ORD 05: Six-level evidentiary translation lattice separates hazard, grievance, consent, and remedy', () => {
  const lattice = auditEvidentiaryTranslationLattice();

  assert.equal(lattice.schema, EVIDENTIARY_TRANSLATION_SCHEMA);
  assert.equal(lattice.lattice_levels.length, 6);

  // Level 1 deducible from sensor, Level 3 and Level 6 not
  const l1 = lattice.lattice_levels.find(l => l.level === 1);
  const l3 = lattice.lattice_levels.find(l => l.level === 3);
  const l6 = lattice.lattice_levels.find(l => l.level === 6);

  assert.equal(l1.deducible_from_physical_sensor, true);
  assert.equal(l3.deducible_from_physical_sensor, false);
  assert.equal(l6.deducible_from_physical_sensor, false);
  assert.ok(lattice.translation_fallacy_detected.includes('SUBSTRATE_COLLAPSE_FALLACY'));
});

test('SEVENTH-ORD 06: Three Auditors comparison matrix verifies distinct discrimination horizons', () => {
  const audit = evaluateThreeAuditorsComparison();

  assert.equal(audit.schema, THREE_AUDITORS_SCHEMA);
  assert.equal(audit.discrimination_matrix.length, 6);

  assert.equal(audit.auditor_summary.Auditor_A_Administrative.total_collapse, true);
  assert.equal(audit.auditor_summary.Auditor_B_Inspector.pairs_distinguished, '3 / 6');
  assert.equal(audit.auditor_summary.Auditor_C_Research_Omniscient.pairs_distinguished, '6 / 6');

  // Verify Auditor B blind spots
  const alphaVsGamma = audit.discrimination_matrix.find(m => m.pair === 'Alpha vs Gamma');
  assert.equal(alphaVsGamma.Auditor_B.can_distinguish, false);

  const alphaVsDelta = audit.discrimination_matrix.find(m => m.pair === 'Alpha vs Delta');
  assert.equal(alphaVsDelta.Auditor_B.can_distinguish, false);
});

test('SEVENTH-ORD 07: Graeber-Dotson-Glissant synthesis enforces non-extractive right to opacity', () => {
  const synthesis = evaluateGraeberDotsonGlissantSynthesis();

  assert.ok(synthesis.burden_shifts.length >= 4);
  assert.ok(synthesis.scientific_boundary.includes('Strict observation authority only'));
});

test('SEVENTH-ORD 08: Operator\'s question on independent metrology returns confirmed disposition and Khona‌lit-po', () => {
  const ans = answerOperatorsQuestionOnIndependentMetrology();

  assert.equal(ans.schema, SEVENTH_ORDER_COMMISSION_SCHEMA);
  assert.equal(ans.covenant, 'Khona‌lit-po');
  assert.equal(ans.disposition, 'INDEPENDENT_METROLOGY_LIMITS_CONFIRMED');
  assert.ok(ans.formal_answer.what_it_recovers.length >= 3);
  assert.ok(ans.formal_answer.what_it_leaves_unresolved.length >= 4);
});
