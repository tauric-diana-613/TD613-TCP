import test from 'node:test';
import assert from 'node:assert/strict';
import {
  C_BLOCKS,
  Q_BLOCKS,
  TASK_FAMILY,
  compileTaskConditionedStructuralReceipt
} from '../app/dome-world/previews/a15-r0/task-conditioned-anchor-star.js';

const scienceHead = 'b'.repeat(40);

test('task-conditioned holdout preserves global budget and B-star task declaration', () => {
  const receipt = compileTaskConditionedStructuralReceipt({ scienceHead });
  assert.deepEqual(receipt.task_family, TASK_FAMILY);
  assert.equal(receipt.matched_global_budget.distinct_probe_count, 12);
  assert.equal(receipt.matched_global_budget.probe_cardinality, 3);
  assert.equal(receipt.matched_global_budget.total_micro_observations, 300);
  assert.equal(receipt.matched_global_budget.all_arms_matched, true);
  assert.equal(new Set(C_BLOCKS).size, 12);
  assert.equal(new Set(Q_BLOCKS).size, 12);
});

test('universal baseline detects the whole B-star but preserves four task collisions', () => {
  const { U } = compileTaskConditionedStructuralReceipt({ scienceHead }).arms;
  assert.equal(U.task.task_detected_count, 8);
  assert.equal(U.task.task_exact_localization_count, 0);
  assert.equal(U.task.task_ambiguous_detected_count, 8);
  assert.equal(U.task.minimum_pairwise_task_signature_hamming_distance, 0);
  assert.deepEqual(U.task.task_signature_collision_groups, [
    ['AB','BC'], ['BD','BI'], ['BE','BH'], ['BF','BG']
  ]);
  assert.equal(U.global.covered_pair_count, 36);
  assert.equal(U.global.uncovered_pair_count, 0);
  assert.equal(U.global.row_rank, 12);
});

test('cycle-coded holdout localizes all eight task pairs while surrendering global coverage', () => {
  const { C } = compileTaskConditionedStructuralReceipt({ scienceHead }).arms;
  assert.equal(C.exposure.anchor_block_count, 8);
  assert.equal(C.exposure.task_incidence_slots, 16);
  assert.equal(C.task.task_detected_count, 8);
  assert.equal(C.task.task_exact_localization_count, 8);
  assert.equal(C.task.task_ambiguous_detected_count, 0);
  assert.equal(C.task.minimum_pairwise_task_signature_hamming_distance, 2);
  assert.deepEqual(Object.values(C.task.task_signature_weights), [2,2,2,2,2,2,2,2]);
  assert.equal(C.global.covered_pair_count, 24);
  assert.equal(C.global.uncovered_pair_count, 12);
  assert.equal(C.global.row_rank, 12);
  assert.equal(C.global.uniquely_localizable_pair_count, 18);
});

test('hostile equal-exposure code proves focal observation count is insufficient', () => {
  const receipt = compileTaskConditionedStructuralReceipt({ scienceHead });
  const { C, Q } = receipt.arms;
  assert.equal(Q.exposure.anchor_block_count, 8);
  assert.equal(Q.exposure.task_incidence_slots, 16);
  assert.equal(receipt.exposure_matched_primary_comparison.all_required_exposure_controls_match, true);
  assert.equal(Q.task.task_detected_count, 8);
  assert.equal(Q.task.task_exact_localization_count, 4);
  assert.deepEqual(Q.task.task_exact_localization_pairs, ['BF','BG','BH','BI']);
  assert.deepEqual(Q.task.task_signature_collision_groups, [['AB','BC'], ['BD','BE']]);
  assert.equal(Q.task.minimum_pairwise_task_signature_hamming_distance, 0);
  assert.ok(C.task.task_exact_localization_count > Q.task.task_exact_localization_count);
});

test('structural holdout preserves task/global contradiction and authority membrane', () => {
  const receipt = compileTaskConditionedStructuralReceipt({ scienceHead });
  assert.equal(receipt.development_contamination.a_centered_star_cycle, 'DEVELOPMENT_ONLY_NOT_CONFIRMATORY');
  assert.equal(receipt.development_contamination.counted_as_confirmatory_evidence, false);
  assert.equal(receipt.bounded_relations.task_conditioned_holdout_localizes_more_than_universal_baseline, true);
  assert.equal(receipt.bounded_relations.exposure_matched_incidence_code_changes_task_localization, true);
  assert.equal(receipt.bounded_relations.focal_exposure_alone_does_not_explain_task_localization_gain, true);
  assert.equal(receipt.bounded_relations.task_specialization_trades_against_global_pair_coverage, true);
  assert.equal(receipt.deterministic_task_sweep_executed, false);
  assert.equal(receipt.scalar_winner, null);
  assert.equal(receipt.promotion_authority, false);
  assert.equal(receipt.production_mutated, false);
  assert.equal(receipt.vercel_authority, false);
});
