import test from 'node:test';
import assert from 'node:assert/strict';
import {
  compileTaskConditionedDetectionLocalizationReceipt,
  runTaskConditionedPairSweep
} from '../app/dome-world/previews/a15-r0/task-conditioned-anchor-star-sweep.js';
import { C_BLOCKS, Q_BLOCKS, TASK_FAMILY } from '../app/dome-world/previews/a15-r0/task-conditioned-anchor-star.js';
import { S_BLOCKS } from '../app/dome-world/previews/a15-r0/structured-probe-design-chamber-ii.js';

const scienceHead = 'c'.repeat(40);

test('deterministic task sweep reproduces frozen B-star signatures with no RNG', () => {
  for (const blocks of [S_BLOCKS, C_BLOCKS, Q_BLOCKS]) {
    const sweep = runTaskConditionedPairSweep(blocks, TASK_FAMILY);
    assert.equal(sweep.deterministic_fixture.rng_used, false);
    assert.equal(sweep.deterministic_fixture.replicates_per_probe, 25);
    assert.equal(sweep.deterministic_fixture.present_counts.active, 20);
    assert.equal(sweep.deterministic_fixture.absent_counts.active, 5);
    assert.equal(sweep.deterministic_fixture.threshold, 0.5);
    assert.equal(sweep.every_observed_signature_matches_frozen_structure, true);
    assert.equal(sweep.total_micro_observations_per_case, 300);
  }
});

test('universal baseline detects all task pairs but localizes none', () => {
  const U = runTaskConditionedPairSweep(S_BLOCKS);
  assert.equal(U.detected_count, 8);
  assert.equal(U.exactly_localized_count, 0);
  assert.equal(U.ambiguous_detected_count, 8);
  assert.equal(U.missed_count, 0);
});

test('cycle-coded holdout exactly localizes all eight predeclared task pairs', () => {
  const C = runTaskConditionedPairSweep(C_BLOCKS);
  assert.equal(C.detected_count, 8);
  assert.equal(C.exactly_localized_count, 8);
  assert.equal(C.ambiguous_detected_count, 0);
  assert.equal(C.missed_count, 0);
  assert.deepEqual(C.exactly_localized_pairs, TASK_FAMILY);
  assert.equal(C.cases.every((item) => item.task_localization_candidate_set.length === 1), true);
});

test('equal-exposure hostile code retains four task collisions', () => {
  const Q = runTaskConditionedPairSweep(Q_BLOCKS);
  assert.equal(Q.detected_count, 8);
  assert.equal(Q.exactly_localized_count, 4);
  assert.equal(Q.ambiguous_detected_count, 4);
  assert.equal(Q.missed_count, 0);
  assert.deepEqual(Q.exactly_localized_pairs, ['BF','BG','BH','BI']);
});

test('compiled behavioral receipt preserves mechanism claim ceiling', () => {
  const receipt = compileTaskConditionedDetectionLocalizationReceipt({ scienceHead });
  assert.deepEqual(receipt.outcome_vector, {
    U: { detected: 8, exact: 0, ambiguous: 8, missed: 0 },
    C: { detected: 8, exact: 8, ambiguous: 0, missed: 0 },
    Q: { detected: 8, exact: 4, ambiguous: 4, missed: 0 }
  });
  assert.equal(receipt.bounded_relations.task_conditioned_holdout_reproduces_structural_localization_gain, true);
  assert.equal(receipt.bounded_relations.equal_exposure_hostile_control_reproduces_code_gap, true);
  assert.equal(receipt.bounded_relations.focal_exposure_alone_is_insufficient, true);
  assert.equal(receipt.bounded_relations.deterministic_sweep_matches_frozen_signatures, true);
  assert.equal(receipt.scalar_winner, null);
  assert.equal(receipt.universal_optimality_claim, false);
  assert.equal(receipt.promotion_authority, false);
  assert.equal(receipt.production_mutated, false);
  assert.equal(receipt.vercel_authority, false);
});
