import test from 'node:test';
import assert from 'node:assert/strict';
import {
  compileOneBitReplayStabilityReceipt,
  runOneBitReplayFamily
} from '../app/dome-world/previews/a15-r0/replay-stable-task-code-one-bit.js';
import { C_BLOCKS, Q_BLOCKS } from '../app/dome-world/previews/a15-r0/task-conditioned-anchor-star.js';
import { S_BLOCKS } from '../app/dome-world/previews/a15-r0/structured-probe-design-chamber-ii.js';

const scienceHead = 'd'.repeat(40);

test('every arm executes the full 96-case one-bit family with no oracle tie break', () => {
  for (const blocks of [S_BLOCKS, C_BLOCKS, Q_BLOCKS]) {
    const arm = runOneBitReplayFamily(blocks);
    assert.equal(arm.case_count, 96);
    assert.equal(arm.rng_used, false);
    assert.equal(arm.oracle_tie_break_used, false);
    assert.equal(arm.mean_nearest_distance, 1);
    assert.equal(arm.maximum_nearest_distance, 1);
    assert.equal(arm.true_pair_in_nearest_set_count, 96);
  }
});

test('universal code remains ambiguous under every one-bit corruption', () => {
  const U = runOneBitReplayFamily(S_BLOCKS);
  assert.equal(U.unique_correct_count, 0);
  assert.equal(U.unique_wrong_count, 0);
  assert.equal(U.ambiguous_with_truth_count, 96);
  assert.equal(U.ambiguous_without_truth_count, 0);
});

test('cycle code retains 64 unique-correct cases but cannot claim one-bit correction', () => {
  const C = runOneBitReplayFamily(C_BLOCKS);
  assert.equal(C.unique_correct_count, 64);
  assert.equal(C.unique_wrong_count, 0);
  assert.equal(C.ambiguous_with_truth_count, 32);
  assert.equal(C.ambiguous_without_truth_count, 0);
  for (const pair of ['AB','BC','BD','BE','BF','BG','BH','BI']) {
    const cases = C.cases.filter((item) => item.true_pair === pair);
    assert.equal(cases.filter((item) => item.outcome_class === 'UNIQUE_CORRECT').length, 8);
    assert.equal(cases.filter((item) => item.outcome_class === 'AMBIGUOUS_WITH_TRUTH').length, 4);
  }
});

test('equal-exposure hostile code retains only 48 unique-correct cases', () => {
  const Q = runOneBitReplayFamily(Q_BLOCKS);
  assert.equal(Q.unique_correct_count, 48);
  assert.equal(Q.unique_wrong_count, 0);
  assert.equal(Q.ambiguous_with_truth_count, 48);
  assert.equal(Q.ambiguous_without_truth_count, 0);
});

test('clean preference survives but weakens and no robustness crown is granted', () => {
  const receipt = compileOneBitReplayStabilityReceipt({ scienceHead });
  assert.deepEqual(receipt.corrupted_outcome_vector, {
    U: { unique_correct: 0, unique_wrong: 0, ambiguous_with_truth: 96, ambiguous_without_truth: 0 },
    C: { unique_correct: 64, unique_wrong: 0, ambiguous_with_truth: 32, ambiguous_without_truth: 0 },
    Q: { unique_correct: 48, unique_wrong: 0, ambiguous_with_truth: 48, ambiguous_without_truth: 0 }
  });
  assert.equal(receipt.bounded_relations.clean_task_preference_survives_one_bit_replay_family, true);
  assert.equal(receipt.bounded_relations.clean_task_preference_weakens_under_one_bit_replay_family, true);
  assert.equal(receipt.bounded_relations.positive_minimum_code_distance_does_not_establish_one_bit_correctability, true);
  assert.equal(receipt.bounded_relations.no_unique_wrong_cases_in_authored_one_bit_family, true);
  assert.equal(receipt.scalar_winner, null);
  assert.equal(receipt.universal_replay_stability_claim, false);
  assert.equal(receipt.promotion_authority, false);
  assert.equal(receipt.production_mutated, false);
  assert.equal(receipt.vercel_authority, false);
});
