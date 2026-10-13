import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CYCLIC_LOCAL_BLOCKS,
  FANO_BLOCKS,
  compileChamberICombinatorialReceipt,
  computeChamberIBlockCombinatorics
} from '../app/dome-world/previews/a15-r0/structured-probe-design-chamber-i.js';

const scienceHead = 'a'.repeat(40);

test('Chamber I frozen schedules preserve matched first-order controls', () => {
  const receipt = compileChamberICombinatorialReceipt({ scienceHead });
  assert.equal(receipt.matched_first_order_controls.probe_count, true);
  assert.equal(receipt.matched_first_order_controls.unique_probe_count, true);
  assert.equal(receipt.matched_first_order_controls.block_size, true);
  assert.equal(receipt.matched_first_order_controls.incidence_slots, true);
  assert.equal(receipt.matched_first_order_controls.first_order_relation_degree, true);
  assert.equal(receipt.matched_first_order_controls.all_required_first_order_controls_match, true);
  assert.deepEqual(Object.values(receipt.schedules.CYCLIC_LOCAL_DIVERSITY.relation_degrees), [3, 3, 3, 3, 3, 3, 3]);
  assert.deepEqual(Object.values(receipt.schedules.FANO_CONTROLLED_INCIDENCE.relation_degrees), [3, 3, 3, 3, 3, 3, 3]);
});

test('cyclic-local schedule computes the preregistered 7/7/7 pair-incidence distribution', () => {
  const receipt = computeChamberIBlockCombinatorics(CYCLIC_LOCAL_BLOCKS);
  assert.deepEqual(receipt.pair_incidence_histogram, { 0: 7, 1: 7, 2: 7 });
  assert.equal(receipt.uncovered_pair_count, 7);
  assert.equal(receipt.duplicate_pair_count, 7);
  assert.equal(receipt.pair_duplicate_excess, 7);
  assert.equal(receipt.maximum_pair_multiplicity, 2);
  assert.equal(receipt.perfect_pair_balance, false);
  assert.deepEqual(receipt.uncovered_pairs, [
    ['r0', 'r3'], ['r0', 'r4'], ['r1', 'r4'], ['r1', 'r5'], ['r2', 'r5'], ['r2', 'r6'], ['r3', 'r6']
  ]);
});

test('Fano schedule computes exact S(2,3,7) pair coverage rather than asserting it', () => {
  const receipt = computeChamberIBlockCombinatorics(FANO_BLOCKS);
  assert.deepEqual(receipt.pair_incidence_histogram, { 1: 21 });
  assert.equal(receipt.uncovered_pair_count, 0);
  assert.equal(receipt.duplicate_pair_count, 0);
  assert.equal(receipt.pair_duplicate_excess, 0);
  assert.equal(receipt.maximum_pair_multiplicity, 1);
  assert.equal(receipt.perfect_pair_balance, true);
  assert.equal(receipt.pair_incidence_ledger.every((entry) => entry.multiplicity === 1), true);
});

test('Stage I refuses to launder block beauty into operator geometry or a scalar winner', () => {
  const receipt = compileChamberICombinatorialReceipt({ scienceHead });
  assert.equal(receipt.hostile_centered_fano_block_identity.blocks_identical_to_fano, true);
  assert.equal(receipt.hostile_centered_fano_block_identity.operator_geometry_evaluated, false);
  assert.equal(receipt.hostile_centered_fano_block_identity.nullspace_claim_evaluated, false);
  assert.equal(receipt.structural_relations_only.first_order_exposure_equivalent, true);
  assert.equal(receipt.structural_relations_only.pair_incidence_structure_equivalent, false);
  assert.equal(receipt.scientific_verdict, 'NOT_EVALUATED_STAGE_1');
  assert.equal(receipt.scalar_winner, null);
  assert.equal(receipt.operator_geometry_authority, false);
  assert.equal(receipt.promotion_authority, false);
  assert.equal(receipt.production_mutated, false);
  assert.equal(receipt.vercel_authority, false);
});

test('malformed authored blocks fail before a structural receipt can be produced', () => {
  assert.throws(() => computeChamberIBlockCombinatorics([['r0', 'r0', 'r1']]), /duplicate relation/);
  assert.throws(() => computeChamberIBlockCombinatorics([['r0', 'r1']]), /exactly 3/);
  assert.throws(() => computeChamberIBlockCombinatorics([['r0', 'r1', 'rx']]), /unknown relation/);
  assert.throws(() => computeChamberIBlockCombinatorics([
    ['r0', 'r1', 'r2'], ['r2', 'r1', 'r0']
  ]), /duplicate block/);
});
