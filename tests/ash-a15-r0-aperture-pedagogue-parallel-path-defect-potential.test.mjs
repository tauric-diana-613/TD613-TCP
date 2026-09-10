import assert from 'node:assert/strict';

import {
  PARALLEL_PATH_DEFECT_POTENTIAL_GATE_ISSUE,
  PARALLEL_PATH_DEFECT_POTENTIAL_PARENT_RECEIPT,
  finiteParallelPathDefectPotentialProfile,
  parallelPathDefectPotentialAssay,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-parallel-path-defect-potential.js';

assert.equal(PARALLEL_PATH_DEFECT_POTENTIAL_GATE_ISSUE, 737);
assert.equal(PARALLEL_PATH_DEFECT_POTENTIAL_PARENT_RECEIPT, '1340cbf785547454ecbe365986b88b6ec9ff3283');

const assay = parallelPathDefectPotentialAssay();
assert.equal(assay.passed, true);
assert.equal(
  assay.classification,
  'PARALLEL_PATH_GAP_GENEALOGY_ADMITS_AN_EXACT_ORIENTED_INTEGER_POTENTIAL_DIFFERENCE_WITH_ADDITIVE_PASTING_AND_ZERO_CLOSED_COMPARISON_CIRCULATION',
);
assert.equal(
  assay.consequential_classification,
  'THE_760_PARALLEL_PATH_DEFECT_IS_GLOBALLY_INTEGRABLE_AS_A_DIFFERENCE_OF_PATH_LOCAL_H_INDICATORS_AND_CANNOT_BY_ITSELF_SUPPLY_NONZERO_HOLONOMY',
);

const pasted = assay.pasted_comparison_hostile;
assert.equal(pasted.passed, true);
assert.equal(pasted.potentials_exact, true);
assert.equal(pasted.vectors_exact, true);
assert.equal(pasted.pasted_comparison_exact, true);
assert.equal(pasted.closed_cycle_zero, true);
assert.equal(pasted.cardinality_anti_shortcut, true);
assert.deepEqual(pasted.exact_values.cycle, [0, 0]);
assert.equal(pasted.exact_values.defect_AB_cardinality, 2);
assert.equal(pasted.exact_values.defect_BC_cardinality, 1);
assert.equal(pasted.exact_values.defect_AC_cardinality, 1);

const cert = pasted.profile.terminal_certificates[0];
assert.deepEqual(cert.gamma_coordinate_order, ['a', 'b']);
assert.equal(cert.identity_exact, true);
assert.equal(cert.reversal_exact, true);
assert.equal(cert.additive_pasting_exact, true);
assert.equal(cert.closed_comparison_circulation_symbolically_zero, true);
assert.equal(cert.support_recovers_760_defect, true);
assert.equal(cert.gain_loss_orientation_exact, true);
assert.equal(cert.refinement_orientation_exact, true);
assert.equal(cert.family_consistent, true);

const potential = (id) => cert.path_potentials.find((entry) => entry.path_id === id);
const defect = (from, to) => cert.oriented_defects.find((entry) => entry.from === from && entry.to === to);

assert.deepEqual(potential('A').inherited_gap, ['b']);
assert.deepEqual(potential('B').inherited_gap, ['a']);
assert.deepEqual(potential('C').inherited_gap, []);
assert.deepEqual(potential('D').inherited_gap, ['a', 'b']);

assert.deepEqual(defect('A', 'B').vector, [1, -1]);
assert.deepEqual(defect('B', 'A').vector, [-1, 1]);
assert.deepEqual(defect('B', 'D').vector, [0, 1]);
assert.deepEqual(defect('A', 'C').vector, [0, -1]);
assert.deepEqual(defect('C', 'D').vector, [1, 1]);
assert.deepEqual(defect('A', 'D').vector, [1, 0]);
assert.deepEqual(defect('A', 'A').vector, [0, 0]);

assert.deepEqual(defect('A', 'B').gain_inherited, ['a']);
assert.deepEqual(defect('A', 'B').loss_inherited, ['b']);
assert.deepEqual(defect('A', 'B').support, ['a', 'b']);

const add = (x, y) => x.map((value, index) => value + y[index]);
assert.deepEqual(add(defect('A', 'B').vector, defect('B', 'D').vector), defect('A', 'D').vector);
assert.deepEqual(add(defect('A', 'C').vector, defect('C', 'D').vector), defect('A', 'D').vector);
assert.notEqual(
  defect('A', 'B').support.length + defect('B', 'C').support.length,
  defect('A', 'C').support.length,
);

assert.equal(assay.relabel_zero_control.passed, true);
assert.equal(assay.noncommuting_abstention_control.passed, true);

// Malformed families abstain instead of fabricating a comparison.
assert.equal(
  finiteParallelPathDefectPotentialProfile([]).status,
  'PARALLEL_PATH_DEFECT_INPUT_ABSTAIN_NEED_TWO_PATHS',
);
assert.equal(
  finiteParallelPathDefectPotentialProfile([
    { id: 'same', rows: [{ antecedent: 'x', stage1: 'a', stage2: 'w', support: [] }] },
    { id: 'same', rows: [{ antecedent: 'x', stage1: 'b', stage2: 'w', support: [] }] },
  ]).status,
  'PARALLEL_PATH_DEFECT_INPUT_ABSTAIN_MALFORMED_OR_DUPLICATE_PATH',
);

assert.equal(assay.claim_ceiling.operational_loop, false);
assert.equal(assay.claim_ceiling.connection, false);
assert.equal(assay.claim_ceiling.holonomy, false);
assert.equal(assay.claim_ceiling.curvature, false);
assert.equal(assay.claim_ceiling.groupoid, false);
assert.equal(assay.claim_ceiling.proto_loom_a16, false);
assert.equal(assay.claim_ceiling.merge, false);
assert.equal(assay.claim_ceiling.production, false);
assert.equal(assay.claim_ceiling.vercel, false);

console.log('Ash A15-R0 #761 parallel-path defect potential tests passed.');
