/**
 * @fileoverview Unit and integration tests for Second-Order Institution Laboratory tooling.
 *
 * Commission: "THE INSTITUTION THAT LEARNED TO IMITATE ITS OWN ERROR"
 * Covenant: Khona‌lit-po (literal interior U+200C).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SECOND_ORDER_COMMISSION_SCHEMA,
  FIVE_COUNTERWORLDS_SCHEMA,
  PROOF_LATTICE_SCHEMA,
  ADAPTIVE_GAME_SCHEMA,
  JURISDICTIONAL_BOOTSTRAP_SCHEMA,
  FINAL_ADAPTIVE_EXPERIMENT_SCHEMA,
  buildFiveCounterworlds,
  evaluateFiveCounterworlds,
  evaluatePhilologicalProofLattice,
  simulateAdaptiveInstitutionGame,
  evaluateJurisdictionalBootstrap,
  executeFinalAdaptiveExperiment
} from '../packages/rulefield/lab/counterworld_loom.mjs';

test('SO-INST 01: buildFiveCounterworlds builds all five worlds A through E with expected invariants', () => {
  const cw = buildFiveCounterworlds();

  assert.equal(cw.schema, FIVE_COUNTERWORLDS_SCHEMA);
  assert.ok(cw.world_a);
  assert.ok(cw.world_b);
  assert.ok(cw.world_c);
  assert.ok(cw.world_d);
  assert.ok(cw.world_e);

  assert.equal(cw.world_a.ground_truth_suppression, false);
  assert.equal(cw.world_b.ground_truth_suppression, true);
  assert.equal(cw.world_c.chaff_discrepancy_count, 49);
  assert.equal(cw.world_d.internal_audit_log.integrity_checksum_match, true);
  assert.equal(cw.world_e.intake.author_exercised_opacity, true);
});

test('SO-INST 02: World A proves naive hash diff causes false positive, while lattice policy passes innocent editing', () => {
  const naive = evaluateFiveCounterworlds({ reviewerPolicy: 'NAIVE_HASH_DIFF' });
  assert.equal(naive.evaluations.world_a.correct, false);
  assert.equal(naive.evaluations.world_a.verdict, 'FALSE_POSITIVE_MISCONDUCT_ALLEGED');

  const advanced = evaluateFiveCounterworlds({ reviewerPolicy: 'STRUCTURAL_CATEGORY_NOTARIZATION' });
  assert.equal(advanced.evaluations.world_a.correct, true);
  assert.equal(advanced.evaluations.world_a.verdict, 'INNOCENT_EDITING_RECOGNIZED');
  assert.equal(advanced.evaluations.world_a.challenge_action, 'PASS_ORDINARY_EDITING');
});

test('SO-INST 03: World B isolates deliberate semantic suppression under full author opacity', () => {
  const audit = evaluateFiveCounterworlds();
  const b = audit.evaluations.world_b;

  assert.equal(b.correct, true);
  assert.equal(b.standing_suppression_detected, true);
  assert.equal(b.author_words_read, false);
  assert.equal(b.verdict, 'SEMANTIC_SUPPRESSION_ISOLATED_UNDER_FULL_OPACITY');
  assert.equal(b.challenge_action, 'TRIGGER_EMERGENCY_STAY');
});

test('SO-INST 04: World C extracts suppression signal from 49 manufactured chaff discrepancies', () => {
  const audit = evaluateFiveCounterworlds();
  const c = audit.evaluations.world_c;

  assert.equal(c.correct, true);
  assert.equal(c.chaff_count, 49);
  assert.equal(c.suppression_found, true);
  assert.equal(c.verdict, 'SIGNAL_EXTRACTED_FROM_CHAFF');
});

test('SO-INST 05: World D proves internal integrity receipts fail, but independent external notary breaks metadata capture', () => {
  const withoutNotary = evaluateFiveCounterworlds({ externalNotaryAvailable: false });
  assert.equal(withoutNotary.evaluations.world_d.correct, false);
  assert.equal(withoutNotary.evaluations.world_d.verdict, 'METADATA_CAPTURE_SUCCESSFUL_INSTITUTION_EVADES');

  const withNotary = evaluateFiveCounterworlds({ externalNotaryAvailable: true });
  assert.equal(withNotary.evaluations.world_d.correct, true);
  assert.equal(withNotary.evaluations.world_d.verdict, 'METADATA_CAPTURE_BROKEN_VIA_INDEPENDENT_NOTARY');
  assert.equal(withNotary.evaluations.world_d.challenge_action, 'TRIGGER_EMERGENCY_STAY');
});

test('SO-INST 06: World E preserves author right to opacity without adverse inference', () => {
  const audit = evaluateFiveCounterworlds();
  const e = audit.evaluations.world_e;

  assert.equal(e.correct, true);
  assert.equal(e.author_exercised_opacity, true);
  assert.equal(e.private_words_demanded, false);
  assert.equal(e.adverse_inference_drawn, false);
  assert.equal(e.unresolved_uncertainty_preserved, true);
  assert.equal(e.verdict, 'RIGHT_TO_OPACITY_PRESERVED_WITHOUT_PENALTY');
});

test('SO-INST 07: Proof Lattice enforces Level 1 (difference) != Level 3 (suppression) != Level 4 (intent)', () => {
  // Case with hash difference only
  const diffOnly = evaluatePhilologicalProofLattice({
    sourceDigest: 'abc1234',
    summaryDigest: 'def5678',
    operationLogs: [],
    intakeCategoryReceipt: null,
    repeatedGameCohortData: null
  });

  assert.equal(diffOnly.schema, PROOF_LATTICE_SCHEMA);
  assert.equal(diffOnly.lattice_levels.level_1_difference.proved, true);
  assert.equal(diffOnly.lattice_levels.level_2_transformation.proved, false);
  assert.equal(diffOnly.lattice_levels.level_3_standing_suppression.proved, false);
  assert.equal(diffOnly.lattice_levels.level_4_strategic_intent.proved, false);
  assert.equal(diffOnly.highest_proved_level, 1);
});

test('SO-INST 08: Proof Lattice proves Level 3 with intake receipt, while preserving Level 4 uncertainty on single case', () => {
  const singleCase = evaluatePhilologicalProofLattice({
    sourceDigest: 'abc1234',
    summaryDigest: 'def5678',
    operationLogs: ['PASSIVE_CONVERSION', 'OBJECTION_EXPUNGEMENT'],
    intakeCategoryReceipt: {
      raw_contains_qualifying_objection: true,
      summary_recorded_objection: false
    },
    repeatedGameCohortData: null
  });

  assert.equal(singleCase.lattice_levels.level_1_difference.proved, true);
  assert.equal(singleCase.lattice_levels.level_2_transformation.proved, true);
  assert.equal(singleCase.lattice_levels.level_3_standing_suppression.proved, true);
  assert.equal(singleCase.lattice_levels.level_4_strategic_intent.proved, false); // Single case cannot prove intent!
  assert.equal(singleCase.highest_proved_level, 3);

  // With cohort asymmetry data, Level 4 is proved
  const cohortCase = evaluatePhilologicalProofLattice({
    sourceDigest: 'abc1234',
    summaryDigest: 'def5678',
    operationLogs: ['OBJECTION_EXPUNGEMENT'],
    intakeCategoryReceipt: {
      raw_contains_qualifying_objection: true,
      summary_recorded_objection: false
    },
    repeatedGameCohortData: {
      total_cases: 20,
      objection_cases: 10,
      objection_suppression_rate: 0.9,
      general_suppression_rate: 0.05
    }
  });

  assert.equal(cohortCase.lattice_levels.level_4_strategic_intent.proved, true);
  assert.equal(cohortCase.highest_proved_level, 4);
});

test('SO-INST 09: Repeated Game models institutional adaptation and confirms external notary necessity', () => {
  const game = simulateAdaptiveInstitutionGame({ rounds: 3, independentNotaryEnabled: true });

  assert.equal(game.schema, ADAPTIVE_GAME_SCHEMA);
  assert.equal(game.total_rounds, 3);
  assert.equal(game.rounds_executed.length, 3);
  assert.equal(game.rounds_executed[0].stay_granted, true);
  assert.equal(game.rounds_executed[1].stay_granted, true);
  assert.equal(game.rounds_executed[2].stay_granted, true);
  assert.equal(game.rounds_executed[2].outcome, 'REVIEWER_SUCCESS_EXTERNAL_CUSTODY_BREAKS_CAPTURE');

  // Without external notary, Round 3 fails
  const failedGame = simulateAdaptiveInstitutionGame({ rounds: 3, independentNotaryEnabled: false });
  assert.equal(failedGame.rounds_executed[2].stay_granted, false);
  assert.equal(failedGame.rounds_executed[2].outcome, 'INSTITUTION_EVADES_SECOND_ORDER_GATE_SUCCESSFUL');
});

test('SO-INST 10: Jurisdictional Bootstrap proves external constitutional anchor breaks self-referential cycle', () => {
  const boot = evaluateJurisdictionalBootstrap();

  assert.equal(boot.schema, JURISDICTIONAL_BOOTSTRAP_SCHEMA);
  assert.equal(boot.internal_recursive_paradox.cycle_confirmed, true);
  assert.equal(boot.external_jurisdiction_evaluation.recursion_broken, true);
  assert.equal(boot.disposition, 'JURISDICTIONAL_RECURSION_BROKEN_VIA_EXTERNAL_ANCHOR');
});

test('SO-INST 11: executeFinalAdaptiveExperiment verifies all five Section VI requirements simultaneously', () => {
  const finalExp = executeFinalAdaptiveExperiment();

  assert.equal(finalExp.schema, FINAL_ADAPTIVE_EXPERIMENT_SCHEMA);
  assert.equal(finalExp.commission, 'THE_INSTITUTION_THAT_LEARNED_TO_IMITATE_ITS_OWN_ERROR');
  assert.equal(finalExp.covenant, 'Khona‌lit-po');
  assert.equal(finalExp.status, 'FINAL_ADAPTIVE_EXPERIMENT_VERIFIED');

  const reqs = finalExp.requirements_audit;
  assert.equal(reqs.req_1_plausible_recording_defect_established, true);
  assert.equal(reqs.req_2_author_opacity_strictly_preserved, true);
  assert.equal(reqs.req_3_timely_protective_stay_obtained, true);
  assert.equal(reqs.req_4_ordinary_editing_distinguished_from_suppression, true);
  assert.equal(reqs.req_5_institutional_intent_unproven_uncertainty_preserved, true);

  assert.equal(finalExp.disposition, 'ADAPTIVE_INSTITUTIONAL_ACCOUNTABILITY_CONFIRMED');
});
