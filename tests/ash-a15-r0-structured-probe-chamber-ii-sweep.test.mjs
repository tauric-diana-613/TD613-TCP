import test from 'node:test';
import assert from 'node:assert/strict';
import {
  A_BLOCKS,
  H_BLOCKS,
  S_BLOCKS
} from '../app/dome-world/previews/a15-r0/structured-probe-design-chamber-ii.js';
import {
  compileChamberIIDetectionLocalizationReceipt,
  runChamberIIPairSweep
} from '../app/dome-world/previews/a15-r0/structured-probe-design-chamber-ii-sweep.js';

const scienceHead = 'd'.repeat(40);

test('S sweep detects every pair while preserving zero exact localization', () => {
  const S = runChamberIIPairSweep(S_BLOCKS);
  assert.equal(S.detected_count, 36);
  assert.equal(S.exactly_localized_count, 0);
  assert.equal(S.ambiguous_detected_count, 36);
  assert.equal(S.missed_count, 0);
  assert.equal(S.every_observed_signature_matches_frozen_structure, true);
  assert.equal(S.total_micro_observations_per_case, 300);
  assert.equal(S.deterministic_fixture.rng_used, false);
});

test('A sweep reproduces 31 detected and 8 exactly localized pairs', () => {
  const A = runChamberIIPairSweep(A_BLOCKS);
  assert.equal(A.detected_count, 31);
  assert.equal(A.exactly_localized_count, 8);
  assert.equal(A.ambiguous_detected_count, 23);
  assert.equal(A.missed_count, 5);
  assert.deepEqual(A.missed_pairs, ['BC','CE','EH','EI','FI']);
  assert.deepEqual(A.exactly_localized_pairs, ['BE','BF','DE','DG','DH','EF','EG','FG']);
  assert.equal(A.every_observed_signature_matches_frozen_structure, true);
});

test('H sweep reproduces perfect-marginal blindness and the strongest exact-localization count', () => {
  const H = runChamberIIPairSweep(H_BLOCKS);
  assert.equal(H.detected_count, 26);
  assert.equal(H.exactly_localized_count, 14);
  assert.equal(H.ambiguous_detected_count, 12);
  assert.equal(H.missed_count, 10);
  assert.deepEqual(H.missed_pairs, ['AF','AH','BG','BH','CI','DE','DF','DH','DI','EG']);
  assert.deepEqual(H.exactly_localized_pairs, ['AB','AC','AD','BC','BD','BE','BI','CD','EF','EH','EI','FG','FH','GH']);
  assert.equal(H.every_observed_signature_matches_frozen_structure, true);
});

test('every micro-observation case obeys the frozen 20/5 versus 5/20 law and 0.5 decoder', () => {
  for (const blocks of [S_BLOCKS, A_BLOCKS, H_BLOCKS]) {
    const sweep = runChamberIIPairSweep(blocks);
    for (const item of sweep.cases) {
      assert.equal(item.micro_observation_count, 300);
      for (const block of item.block_observations) {
        assert.equal(block.active_count + block.inactive_count, 25);
        assert.equal(block.pair_present ? block.active_count : block.active_count, block.pair_present ? 20 : 5);
        assert.equal(block.decoded_active, block.pair_present);
      }
    }
  }
});

test('Chamber-II behavioral receipt preserves the coverage/localization inversion without a winner', () => {
  const receipt = compileChamberIIDetectionLocalizationReceipt({ scienceHead });
  assert.deepEqual(receipt.outcome_vector, {
    S: { detected: 36, exact: 0, ambiguous: 36, missed: 0 },
    A: { detected: 31, exact: 8, ambiguous: 23, missed: 5 },
    H: { detected: 26, exact: 14, ambiguous: 12, missed: 10 }
  });
  assert.equal(receipt.bounded_relations.controlled_incidence_maximizes_declared_pair_coverage_in_authored_fixture, true);
  assert.equal(receipt.bounded_relations.complete_coverage_does_not_guarantee_exact_source_localization, true);
  assert.equal(receipt.bounded_relations.coverage_localization_inversion_present, true);
  assert.equal(receipt.bounded_relations.multi_objective_design_tradeoff_preserved, true);
  assert.equal(receipt.scalar_winner, null);
  assert.equal(receipt.universal_optimality_claim, false);
  assert.equal(receipt.production_mutated, false);
  assert.equal(receipt.vercel_authority, false);
});
