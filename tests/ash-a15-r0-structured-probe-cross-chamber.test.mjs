import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COMPONENT_RECEIPTS,
  compileStructuredProbeCrossChamberSynthesis
} from '../app/dome-world/previews/a15-r0/structured-probe-design-cross-chamber.js';

const scienceHead = 'e'.repeat(40);

test('cross-chamber synthesis binds all three frozen component receipts', () => {
  const receipt = compileStructuredProbeCrossChamberSynthesis({ scienceHead });
  assert.equal(receipt.component_receipts.chamber_i_operator_geometry.payload_sha256, 'fba1a3b5ed39cfec91377a241ec4835e08b6f34f287e1f0e9207b370ec9e9a2c');
  assert.equal(receipt.component_receipts.chamber_ii_structural.payload_sha256, 'f4f7048d97a5b76a0030e0142042afb57d6d983b69bd1d6a0452978459c2aa62');
  assert.equal(receipt.component_receipts.chamber_ii_detection_localization.payload_sha256, 'ebfd9269f5f78c1a2a69530d003c7dd57fd6d441ad397cc57fd9a9cd0d868874');
  assert.equal(Object.keys(COMPONENT_RECEIPTS).length, 3);
});

test('synthesis preserves the operator nullspace contradiction instead of laundering Fano coverage into authority', () => {
  const receipt = compileStructuredProbeCrossChamberSynthesis({ scienceHead });
  assert.equal(receipt.chamber_i.raw_fano.pair_coverage, 21);
  assert.equal(receipt.chamber_i.raw_fano.rank, 7);
  assert.equal(receipt.chamber_i.centered_fano_hostile.pair_coverage, 21);
  assert.equal(receipt.chamber_i.centered_fano_hostile.rank, 6);
  assert.equal(receipt.chamber_i.centered_fano_hostile.global_offset_annihilated, true);
  assert.ok(receipt.contradiction_ledger.includes('PERFECT_PAIR_INCIDENCE_CAN_COEXIST_WITH_OPERATOR_NULLSPACE'));
});

test('synthesis preserves the coverage/localization inversion across S A H', () => {
  const receipt = compileStructuredProbeCrossChamberSynthesis({ scienceHead });
  assert.deepEqual(receipt.chamber_ii.S, { detected: 36, exact_localization: 0, missed: 0, point_degree_variance: 0, row_rank: 12 });
  assert.deepEqual(receipt.chamber_ii.A, { detected: 31, exact_localization: 8, missed: 5, point_degree_variance: 0.444444444444444, row_rank: 12 });
  assert.deepEqual(receipt.chamber_ii.H, { detected: 26, exact_localization: 14, missed: 10, point_degree_variance: 0, row_rank: 12 });
  assert.ok(receipt.contradiction_ledger.includes('BETTER_DETECTION_COVERAGE_CAN_COEXIST_WITH_WORSE_EXACT_LOCALIZATION'));
  assert.ok(receipt.contradiction_ledger.includes('PERFECT_POINT_BALANCE_AND_FULL_ROW_RANK_CAN_COEXIST_WITH_TEN_BLIND_TARGET_PAIRS'));
});

test('canonical answer is task-dependent and carries no scalar crown', () => {
  const receipt = compileStructuredProbeCrossChamberSynthesis({ scienceHead });
  assert.equal(receipt.bounded_answer, 'ONCE_DIVERSITY_IS_GENUINE_ITS_DESIGN_CAN_CHANGE_BOUNDED_OBSERVABILITY_GEOMETRY_BUT_THE_DIRECTION_OF_GAIN_IS_TASK_AND_OPERATOR_DEPENDENT');
  assert.equal(receipt.no_scalar_crown, true);
  assert.equal(receipt.global_winner, null);
  assert.equal(receipt.loss_function_declared, false);
  assert.equal(receipt.postmortem_performed, false);
  assert.equal(receipt.claim_ceiling.coverage_curvature, false);
  assert.equal(receipt.claim_ceiling.physical_tomography, false);
  assert.equal(receipt.promotion_authority, false);
  assert.equal(receipt.production_mutated, false);
  assert.equal(receipt.vercel_authority, false);
});
