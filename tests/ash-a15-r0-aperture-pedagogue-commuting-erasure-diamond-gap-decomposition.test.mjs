import assert from 'node:assert/strict';

import {
  COMMUTING_ERASURE_DIAMOND_PARENT_RECEIPT,
  finiteCommutingErasureDiamondProfile,
  runCommutingErasureDiamondGapDecompositionChamber,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-commuting-erasure-diamond-gap-decomposition.js';

assert.equal(COMMUTING_ERASURE_DIAMOND_PARENT_RECEIPT, '40bcc658bf34a2f31e5f1b20bcc51fe1d9d9c0ba');

const chamber = runCommutingErasureDiamondGapDecompositionChamber();
assert.equal(chamber.status, 'FINITE_COMMUTING_ERASURE_DIAMOND_GAP_DECOMPOSITION_ROUND_CLOSED');
assert.equal(chamber.passed, true);
assert.equal(chamber.certificates.symbolic_theorem.passed, true);
assert.equal(chamber.certificates.role_swap_diamond_hostile.passed, true);
assert.equal(chamber.certificates.relabeled_partition_control.passed, true);
assert.equal(chamber.certificates.exact_descent_control.passed, true);
assert.equal(chamber.certificates.strict_refinement_control.passed, true);
assert.equal(chamber.certificates.noncommuting_composite_hostile.passed, true);

assert.equal(
  chamber.classification,
  'FINITE_COMMUTING_ERASURE_DIAMONDS_HAVE_FACTORIZATION_INVARIANT_TERMINAL_ADMISSIBILITY_GAPS_BUT_CAN_HAVE_FACTORIZATION_SENSITIVE_INHERITED_VS_CROSS_SETTLED_GAP_DECOMPOSITIONS_WITH_EXACT_PARALLEL_PATH_DEFECT',
);
assert.equal(chamber.claim_ceiling.operational_closed_path, false);
assert.equal(chamber.claim_ceiling.holonomy, false);
assert.equal(chamber.claim_ceiling.curvature, false);

const roleSwapA = [
  { antecedent: 'x1', stage1: 'A1', stage2: 'w', support: ['a', 'b'] },
  { antecedent: 'x2', stage1: 'A1', stage2: 'w', support: ['a'] },
  { antecedent: 'x3', stage1: 'A2', stage2: 'w', support: ['b'] },
  { antecedent: 'x4', stage1: 'A2', stage2: 'w', support: [] },
];
const roleSwapB = [
  { antecedent: 'x1', stage1: 'B1', stage2: 'w', support: ['a', 'b'] },
  { antecedent: 'x2', stage1: 'B2', stage2: 'w', support: ['a'] },
  { antecedent: 'x3', stage1: 'B1', stage2: 'w', support: ['b'] },
  { antecedent: 'x4', stage1: 'B2', stage2: 'w', support: [] },
];
const roleSwap = finiteCommutingErasureDiamondProfile(roleSwapA, roleSwapB);
assert.equal(roleSwap.status, 'FINITE_COMMUTING_ERASURE_DIAMOND_GAP_DECOMPOSITION_DERIVED');
assert.equal(roleSwap.passed, true);
assert.equal(roleSwap.terminal_certificates.length, 1);
const rs = roleSwap.terminal_certificates[0];
assert.deepEqual(rs.endpoint_union, ['a', 'b']);
assert.deepEqual(rs.endpoint_intersection, []);
assert.deepEqual(rs.endpoint_gap, ['a', 'b']);
assert.deepEqual(rs.path_a_inherited, ['b']);
assert.deepEqual(rs.path_a_cross_settled, ['a']);
assert.deepEqual(rs.path_b_inherited, ['a']);
assert.deepEqual(rs.path_b_cross_settled, ['b']);
assert.deepEqual(rs.parallel_path_decomposition_defect, ['a', 'b']);
assert.equal(rs.parallel_path_decomposition_defect_cardinality, 2);
assert.equal(rs.endpoint_union_invariant, true);
assert.equal(rs.endpoint_intersection_invariant, true);
assert.equal(rs.endpoint_gap_invariant, true);
assert.equal(rs.pointwise_role_characterization_a_exact, true);
assert.equal(rs.pointwise_role_characterization_b_exact, true);
assert.equal(rs.defect_identity_exact, true);
assert.equal(rs.path_a_partition_refines_b, false);
assert.equal(rs.path_b_partition_refines_a, false);

const fine = [
  { antecedent: 'x1', stage1: 'f1', stage2: 'w', support: ['z'] },
  { antecedent: 'x2', stage1: 'f2', stage2: 'w', support: [] },
];
const coarse = [
  { antecedent: 'x1', stage1: 'c', stage2: 'w', support: ['z'] },
  { antecedent: 'x2', stage1: 'c', stage2: 'w', support: [] },
];
const refinement = finiteCommutingErasureDiamondProfile(fine, coarse);
const rc = refinement.terminal_certificates[0];
assert.equal(rc.path_a_partition_refines_b, true);
assert.deepEqual(rc.path_a_inherited, []);
assert.deepEqual(rc.path_a_cross_settled, ['z']);
assert.deepEqual(rc.path_b_inherited, ['z']);
assert.deepEqual(rc.path_b_cross_settled, []);
assert.equal(rc.refinement_monotonicity_a_to_b, true);

const relabelA = [
  { antecedent: 'x1', stage1: 'u0', stage2: 'w', support: [0] },
  { antecedent: 'x2', stage1: 'u0', stage2: 'w', support: [1] },
  { antecedent: 'x3', stage1: 'u1', stage2: 'w', support: [0] },
];
const relabelB = [
  { antecedent: 'x1', stage1: 'renamed-A', stage2: 'w', support: [0] },
  { antecedent: 'x2', stage1: 'renamed-A', stage2: 'w', support: [1] },
  { antecedent: 'x3', stage1: 'renamed-B', stage2: 'w', support: [0] },
];
const relabel = finiteCommutingErasureDiamondProfile(relabelA, relabelB);
assert.equal(relabel.passed, true);
assert.equal(relabel.terminal_certificates[0].parallel_path_decomposition_defect_cardinality, 0);

const multipleTerminalA = [
  { antecedent: 'a1', stage1: 'A0', stage2: 'w0', support: [0] },
  { antecedent: 'a2', stage1: 'A1', stage2: 'w0', support: [1] },
  { antecedent: 'b1', stage1: 'A2', stage2: 'w1', support: [2] },
  { antecedent: 'b2', stage1: 'A2', stage2: 'w1', support: [2] },
];
const multipleTerminalB = [
  { antecedent: 'a1', stage1: 'B0', stage2: 'w0', support: [0] },
  { antecedent: 'a2', stage1: 'B0', stage2: 'w0', support: [1] },
  { antecedent: 'b1', stage1: 'B1', stage2: 'w1', support: [2] },
  { antecedent: 'b2', stage1: 'B2', stage2: 'w1', support: [2] },
];
const multipleTerminal = finiteCommutingErasureDiamondProfile(multipleTerminalA, multipleTerminalB);
assert.equal(multipleTerminal.passed, true);
assert.equal(multipleTerminal.terminal_certificates.length, 2);
for (const cert of multipleTerminal.terminal_certificates) {
  assert.equal(cert.endpoint_union_invariant, true);
  assert.equal(cert.endpoint_intersection_invariant, true);
  assert.equal(cert.endpoint_gap_invariant, true);
}

const noncommuting = finiteCommutingErasureDiamondProfile(
  [{ antecedent: 'x', stage1: 'A', stage2: 'w0', support: [0] }],
  [{ antecedent: 'x', stage1: 'B', stage2: 'w1', support: [0] }],
);
assert.equal(noncommuting.status, 'COMMUTING_ERASURE_DIAMOND_INPUT_ABSTAIN_NONCOMMUTING_COMPOSITE');

const supportMismatch = finiteCommutingErasureDiamondProfile(
  [{ antecedent: 'x', stage1: 'A', stage2: 'w', support: [0] }],
  [{ antecedent: 'x', stage1: 'B', stage2: 'w', support: [1] }],
);
assert.equal(supportMismatch.status, 'COMMUTING_ERASURE_DIAMOND_INPUT_ABSTAIN_SUPPORT_MISMATCH');

console.log('Ash A15-R0 #760 commuting erasure diamond gap decomposition tests passed.');
