import assert from 'node:assert/strict';

import {
  PASTED_DIAMOND_DEFECT_TRANSPORT_PARENT_RECEIPT,
  finitePastedDiamondDefectTransportProfile,
  pastedDiamondDefectTransportWitnesses,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-pasted-diamond-defect-transport.js';

assert.equal(PASTED_DIAMOND_DEFECT_TRANSPORT_PARENT_RECEIPT, '1340cbf785547454ecbe365986b88b6ec9ff3283');

const witness = pastedDiamondDefectTransportWitnesses();
assert.equal(witness.opposite.passed, true);
assert.equal(witness.same.passed, true);
assert.deepEqual(witness.opposite_local_defects, [
  { terminal: 'w1', defect: ['z'] },
  { terminal: 'w2', defect: ['z'] },
]);
assert.deepEqual(witness.same_local_defects, [
  { terminal: 'w1', defect: ['z'] },
  { terminal: 'w2', defect: ['z'] },
]);
assert.deepEqual(witness.opposite_pasted_defect, []);
assert.deepEqual(witness.same_pasted_defect, ['z']);

const oppositeCert = witness.opposite.terminal_certificates[0];
const sameCert = witness.same.terminal_certificates[0];
assert.equal(oppositeCert.inherited_union_composition_a_exact, true);
assert.equal(oppositeCert.inherited_union_composition_b_exact, true);
assert.equal(oppositeCert.pasted_defect_recomputed_exact, true);
assert.equal(oppositeCert.common_coarsening_creates_no_new_defect, true);
assert.equal(oppositeCert.strict_defect_annihilation, true);
assert.equal(sameCert.common_coarsening_creates_no_new_defect, true);
assert.equal(sameCert.strict_defect_annihilation, false);
assert.deepEqual(oppositeCert.union_local_unoriented_defect, ['z']);
assert.deepEqual(sameCert.union_local_unoriented_defect, ['z']);

// Identity-coarsening control: a one-terminal paste preserves the local defect exactly.
const identityA = [
  { antecedent: 'x1', stage1: 'A1', stage2: 'w', support: ['z'] },
  { antecedent: 'x2', stage1: 'A2', stage2: 'w', support: ['z'] },
  { antecedent: 'x3', stage1: 'A1', stage2: 'w', support: [] },
  { antecedent: 'x4', stage1: 'A2', stage2: 'w', support: [] },
];
const identityB = [
  { antecedent: 'x1', stage1: 'B1', stage2: 'w', support: ['z'] },
  { antecedent: 'x2', stage1: 'B1', stage2: 'w', support: ['z'] },
  { antecedent: 'x3', stage1: 'B2', stage2: 'w', support: [] },
  { antecedent: 'x4', stage1: 'B2', stage2: 'w', support: [] },
];
const identity = finitePastedDiamondDefectTransportProfile(
  identityA,
  identityB,
  [{ terminal: 'w', coarse: 'v' }],
);
assert.equal(identity.passed, true);
assert.deepEqual(identity.local_profile.terminal_certificates[0].parallel_path_decomposition_defect, ['z']);
assert.deepEqual(identity.terminal_certificates[0].pasted_unoriented_defect, ['z']);

// No-local-defect control: common coarsening cannot manufacture a path defect.
const noDefectA = [
  { antecedent: 'a1', stage1: 'A-w1', stage2: 'w1', support: ['z'] },
  { antecedent: 'a2', stage1: 'A-w1', stage2: 'w1', support: [] },
  { antecedent: 'b1', stage1: 'A-w2', stage2: 'w2', support: ['z'] },
  { antecedent: 'b2', stage1: 'A-w2', stage2: 'w2', support: [] },
];
const noDefectB = [
  { antecedent: 'a1', stage1: 'B-w1', stage2: 'w1', support: ['z'] },
  { antecedent: 'a2', stage1: 'B-w1', stage2: 'w1', support: [] },
  { antecedent: 'b1', stage1: 'B-w2', stage2: 'w2', support: ['z'] },
  { antecedent: 'b2', stage1: 'B-w2', stage2: 'w2', support: [] },
];
const noDefect = finitePastedDiamondDefectTransportProfile(
  noDefectA,
  noDefectB,
  [{ terminal: 'w1', coarse: 'v' }, { terminal: 'w2', coarse: 'v' }],
);
assert.equal(noDefect.passed, true);
assert.deepEqual(noDefect.terminal_certificates[0].union_local_unoriented_defect, []);
assert.deepEqual(noDefect.terminal_certificates[0].pasted_unoriented_defect, []);

// Non-total coarsening must abstain.
const nonTotal = finitePastedDiamondDefectTransportProfile(
  noDefectA,
  noDefectB,
  [{ terminal: 'w1', coarse: 'v' }],
);
assert.equal(nonTotal.status, 'PASTED_DIAMOND_ABSTAIN_NON_TOTAL_COARSENING');

// Conflicting coarsening must abstain.
const conflicting = finitePastedDiamondDefectTransportProfile(
  identityA,
  identityB,
  [{ terminal: 'w', coarse: 'v1' }, { terminal: 'w', coarse: 'v2' }],
);
assert.equal(conflicting.status, 'PASTED_DIAMOND_ABSTAIN_CONFLICTING_COARSENING');

// Parent mismatch must remain visible rather than being repaired downstream.
const parentMismatch = finitePastedDiamondDefectTransportProfile(
  [{ antecedent: 'x', stage1: 'A', stage2: 'w', support: ['z'] }],
  [{ antecedent: 'x', stage1: 'B', stage2: 'w', support: [] }],
  [{ terminal: 'w', coarse: 'v' }],
);
assert.equal(parentMismatch.status, 'PASTED_DIAMOND_ABSTAIN_PARENT_LOCAL_PROFILE');

console.log('Ash A15-R0 pasted-diamond defect transport tests passed.');
