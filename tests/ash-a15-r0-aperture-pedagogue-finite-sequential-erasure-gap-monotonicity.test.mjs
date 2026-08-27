import assert from 'node:assert/strict';

import {
  FINITE_SEQUENTIAL_ERASURE_PARENT_RECEIPT,
  finiteSequentialErasureGapProfile,
  runFiniteSequentialErasureGapMonotonicityChamber,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-finite-sequential-erasure-gap-monotonicity.js';

assert.equal(FINITE_SEQUENTIAL_ERASURE_PARENT_RECEIPT, 'ce28f7002feec256ecea191e829a2cbff7afd3b4');

const chamber = runFiniteSequentialErasureGapMonotonicityChamber();
assert.equal(chamber.status, 'FINITE_SEQUENTIAL_ERASURE_GAP_MONOTONICITY_CHAMBER_PASSED');
assert.equal(chamber.passed, true);
assert.equal(chamber.certificates.new_gap_from_exact_locals.passed, true);
assert.equal(chamber.certificates.overlapping_inherited_gap_nonadditivity.passed, true);
assert.equal(chamber.certificates.no_new_gap_control.passed, true);
assert.equal(chamber.certificates.mixed_inherited_and_new_gap.passed, true);

const exactLocals = finiteSequentialErasureGapProfile([
  { antecedent: 'a', stage1: 'y0', stage2: 'w', support: [0] },
  { antecedent: 'b', stage1: 'y1', stage2: 'w', support: [1] },
]);
assert.equal(exactLocals.status, 'FINITE_SEQUENTIAL_ERASURE_GAP_PROFILE_DERIVED');
const exactLocalCertificate = exactLocals.second_stage_certificates[0];
assert.deepEqual(exactLocalCertificate.stage1_gaps.map((row) => row.gap), [[], []]);
assert.deepEqual(exactLocalCertificate.second_gap, [0, 1]);
assert.deepEqual(exactLocalCertificate.inherited_gap_union, []);
assert.deepEqual(exactLocalCertificate.new_cross_settled_gap, [0, 1]);
assert.equal(exactLocalCertificate.gap_cardinality_monotone, true);
assert.equal(exactLocalCertificate.cross_settled_characterization_exact, true);

const overlap = finiteSequentialErasureGapProfile([
  { antecedent: 'a', stage1: 'y0', stage2: 'w', support: [0, 1] },
  { antecedent: 'b', stage1: 'y0', stage2: 'w', support: [0] },
  { antecedent: 'c', stage1: 'y1', stage2: 'w', support: [0, 1] },
  { antecedent: 'd', stage1: 'y1', stage2: 'w', support: [0] },
]);
const overlapCertificate = overlap.second_stage_certificates[0];
assert.deepEqual(overlapCertificate.stage1_gaps.map((row) => row.gap), [[1], [1]]);
assert.deepEqual(overlapCertificate.inherited_gap_union, [1]);
assert.deepEqual(overlapCertificate.second_gap, [1]);
assert.equal(overlapCertificate.inherited_gap_union_cardinality, 1);
assert.equal(overlapCertificate.second_stage_gap_cardinality, 1);
assert.equal(overlapCertificate.new_cross_settled_gap_cardinality, 0);

const mixed = finiteSequentialErasureGapProfile([
  { antecedent: 'a', stage1: 'y0', stage2: 'w', support: [0, 1] },
  { antecedent: 'b', stage1: 'y0', stage2: 'w', support: [0] },
  { antecedent: 'c', stage1: 'y1', stage2: 'w', support: [2] },
]);
const mixedCertificate = mixed.second_stage_certificates[0];
assert.deepEqual(mixedCertificate.inherited_gap_union, [1]);
assert.deepEqual(mixedCertificate.new_cross_settled_gap, [0, 2]);
assert.deepEqual(mixedCertificate.second_gap, [0, 1, 2]);
assert.equal(mixedCertificate.gap_decomposition_exact, true);
assert.equal(mixedCertificate.second_stage_gap_cardinality, 3);

const noNew = finiteSequentialErasureGapProfile([
  { antecedent: 'a', stage1: 'y0', stage2: 'w', support: [0] },
  { antecedent: 'b', stage1: 'y1', stage2: 'w', support: [0] },
]);
assert.deepEqual(noNew.second_stage_certificates[0].second_gap, []);
assert.deepEqual(noNew.second_stage_certificates[0].new_cross_settled_gap, []);

const invalidSecondMap = finiteSequentialErasureGapProfile([
  { antecedent: 'a', stage1: 'y', stage2: 'w0', support: [0] },
  { antecedent: 'b', stage1: 'y', stage2: 'w1', support: [0] },
]);
assert.equal(invalidSecondMap.status, 'FINITE_SEQUENTIAL_ERASURE_INPUT_ABSTAIN_STAGE2_NOT_FUNCTION_OF_STAGE1');

console.log('Ash A15-R0 #756 finite sequential-erasure gap monotonicity tests passed.');