import test from 'node:test';
import assert from 'node:assert/strict';
import {
  A_BLOCKS,
  H_BLOCKS,
  S_BLOCKS,
  compileChamberIIStructuralReceipt,
  computeChamberIIStructure
} from '../app/dome-world/previews/a15-r0/structured-probe-design-chamber-ii.js';

const scienceHead = 'c'.repeat(40);

function near(actual, expected, tolerance = 1e-10) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} !~= ${expected}`);
}

test('controlled-incidence S schedule computes complete pair coverage and zero exact localization', () => {
  const S = computeChamberIIStructure(S_BLOCKS);
  assert.deepEqual(S.point_degree_vector, [4,4,4,4,4,4,4,4,4]);
  assert.equal(S.point_degree_variance, 0);
  assert.equal(S.covered_pair_count, 36);
  assert.equal(S.uncovered_pair_count, 0);
  assert.equal(S.pair_duplicate_excess, 0);
  assert.equal(S.maximum_pair_multiplicity, 1);
  assert.equal(S.row_rank, 12);
  assert.equal(S.distinct_nonzero_signature_count, 12);
  assert.equal(S.uniquely_localizable_pair_count, 0);
  assert.equal(S.ambiguous_detected_pair_count, 36);
  near(S.row_space_condition_number, 1);
  assert.deepEqual(S.row_gram_matrix, Array.from({ length: 12 }, (_, i) => Array.from({ length: 12 }, (_, j) => i === j ? 3 : 0)));
});

test('arbitrary genuine-diversity A schedule reproduces its preregistered coverage and signature ledger', () => {
  const A = computeChamberIIStructure(A_BLOCKS);
  assert.deepEqual(A.point_degree_vector, [4,4,3,5,4,4,5,4,3]);
  near(A.point_degree_variance, 4/9);
  assert.equal(A.covered_pair_count, 31);
  assert.deepEqual(A.uncovered_pairs, ['BC','CE','EH','EI','FI']);
  assert.equal(A.pair_duplicate_excess, 5);
  assert.equal(A.maximum_pair_multiplicity, 2);
  assert.equal(A.row_rank, 12);
  assert.equal(A.distinct_nonzero_signature_count, 17);
  assert.equal(A.uniquely_localizable_pair_count, 8);
  assert.equal(A.ambiguous_detected_pair_count, 23);
  assert.ok(A.row_space_condition_number > 1);
});

test('hostile H schedule keeps perfect point marginals and full row rank while leaving ten target pairs blind', () => {
  const H = computeChamberIIStructure(H_BLOCKS);
  assert.deepEqual(H.point_degree_vector, [4,4,4,4,4,4,4,4,4]);
  assert.equal(H.point_degree_variance, 0);
  assert.equal(H.covered_pair_count, 26);
  assert.deepEqual(H.uncovered_pairs, ['AF','AH','BG','BH','CI','DE','DF','DH','DI','EG']);
  assert.equal(H.pair_duplicate_excess, 10);
  assert.equal(H.maximum_pair_multiplicity, 3);
  assert.equal(H.row_rank, 12);
  assert.equal(H.distinct_nonzero_signature_count, 20);
  assert.equal(H.uniquely_localizable_pair_count, 14);
  assert.equal(H.ambiguous_detected_pair_count, 12);
  assert.ok(H.row_space_condition_number > 1);
  for (const pair of H.uncovered_pairs) assert.equal(H.pair_signature_ledger[pair], '000000000000');
});

test('Chamber-II structural receipt preserves coverage/localization contradiction without executing decoder', () => {
  const receipt = compileChamberIIStructuralReceipt({ scienceHead });
  assert.equal(receipt.matched_budget.all_arms_matched, true);
  assert.equal(receipt.bounded_relations.controlled_incidence_covers_all_declared_pairs, true);
  assert.equal(receipt.bounded_relations.point_marginal_balance_is_insufficient_for_target_pair_coverage, true);
  assert.equal(receipt.bounded_relations.full_row_rank_is_insufficient_for_complete_target_relation_coverage, true);
  assert.equal(receipt.bounded_relations.complete_coverage_does_not_yet_establish_exact_localization, true);
  assert.equal(receipt.decoder_executed, false);
  assert.equal(receipt.scalar_winner, null);
  assert.equal(receipt.promotion_authority, false);
  assert.equal(receipt.production_mutated, false);
  assert.equal(receipt.vercel_authority, false);
});

test('malformed Chamber-II schedules fail before structural credit is granted', () => {
  assert.throws(() => computeChamberIIStructure(S_BLOCKS.slice(0, 11)), /exactly 12/);
  assert.throws(() => computeChamberIIStructure([...S_BLOCKS.slice(0, 11), S_BLOCKS[0]]), /distinct/);
  assert.throws(() => computeChamberIIStructure([...S_BLOCKS.slice(0, 11), 'AAX']), /duplicate channel|unknown channel/);
});
