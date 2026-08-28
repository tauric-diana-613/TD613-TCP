import assert from 'node:assert/strict';

import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
} from '../app/dome-world/previews/a15-r0/phasonic-supermoire-dromological-tomography.js';
import {
  dromologicalS3ScheduleAtlasCertificate,
} from '../app/dome-world/previews/a15-r0/dromological-s3-schedule-atlas-first-stratum-gate.js';
import {
  dromologicalScheduleStateIdentifiabilityLagCertificate,
} from '../app/dome-world/previews/a15-r0/dromological-schedule-state-identifiability-lag.js';
import {
  classifyDromologicalReplayRow,
  dromologicalReplayTransversalityLocusCertificate,
} from '../app/dome-world/previews/a15-r0/dromological-replay-transversality-unimodular-locus.js';
import {
  dromologicalRepairSignature,
  canonicalReplayRepairRepresentative,
  compareReplayRepairRows,
  dromologicalReplayRepairQuotientCertificate,
} from '../app/dome-world/previews/a15-r0/dromological-replay-repair-quotient-canonical-section.js';
import {
  DROMOLOGICAL_HOLONOMY_COARSENED_REPLAY_SCHEMA,
  DROMOLOGICAL_HOLONOMY_COARSENED_REPLAY_PARENT_RECEIPT,
  deriveDromologicalTerminalHolonomyClasses,
  dromologicalHolonomyClassReplayPolicy,
  classifyReplayAgainstHolonomyClass,
  dromologicalHolonomyCoarsenedReplayInverseDesignCertificate,
  compileDromologicalHolonomyCoarsenedReplayProjection,
  rejectDromologicalHolonomyCoarsenedReplayOverreach,
} from '../app/dome-world/previews/a15-r0/dromological-holonomy-coarsened-robust-replay-inverse-design.js';

function dot(left, right) {
  return left.reduce((sum, value, index) => sum + value * right[index], 0);
}

assert.equal(
  DROMOLOGICAL_HOLONOMY_COARSENED_REPLAY_PARENT_RECEIPT,
  '2cc95613969951afc96c638c316ae70007560f16',
);

// Parent science must already be green before this chamber can speak.
assert.equal(dromologicalReplayRepairQuotientCertificate().passed, true);
assert.equal(dromologicalReplayTransversalityLocusCertificate().passed, true);
const atlas = dromologicalS3ScheduleAtlasCertificate();
assert.equal(atlas.passed, true);
const lag = dromologicalScheduleStateIdentifiabilityLagCertificate();
assert.equal(lag.passed, true);
assert.equal(lag.minimal_schedule_identification_prefix, 2);

// Derive terminal formal-holonomy classes from inherited matrices, not prose labels.
const classes = deriveDromologicalTerminalHolonomyClasses();
assert.equal(classes.length, 4);
assert.deepEqual(classes.map(row => row.schedule_ids), [
  ['P-H-I', 'P-I-H'],
  ['H-P-I'],
  ['H-I-P', 'I-H-P'],
  ['I-P-H'],
]);
assert.deepEqual(classes.map(row => row.defect_directions), [
  [],
  [[1, 1, 0]],
  [[1, 1, 0], [1, 0, 1]],
  [[1, 0, 1]],
]);
assert.deepEqual(classes.map(row => row.observation_ranks), [
  [3, 3],
  [2],
  [2, 2],
  [2],
]);

// The decisive mixed-class hostile: same terminal holonomy, different temporal schedule and missing direction.
const mixedRows = atlas.schedules.filter(row => ['H-I-P', 'I-H-P'].includes(row.schedule_id));
assert.equal(mixedRows.length, 2);
assert.deepEqual(mixedRows[0].terminal_formal_holonomy, mixedRows[1].terminal_formal_holonomy);
assert.notDeepEqual(mixedRows[0].schedule, mixedRows[1].schedule);
assert.deepEqual(mixedRows.map(row => row.kernel_generator), [
  [1, 1, 0],
  [1, 0, 1],
]);
assert.notDeepEqual(mixedRows[0].kernel_generator, mixedRows[1].kernel_generator);

// The policy is derived from defect sets via positive-unit/selective integer search.
const policy = dromologicalHolonomyClassReplayPolicy();
assert.deepEqual(policy.map(row => row.replay_row), [
  [0, 0, 0],
  [0, 1, 0],
  [1, 0, 0],
  [0, 0, 1],
]);
assert.deepEqual(policy.map(row => row.repair_signature), [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
]);
assert.deepEqual(policy.map(row => [row.l0_cost, row.l1_cost]), [
  [0, 0],
  [1, 1],
  [1, 1],
  [1, 1],
]);
for (const row of policy) {
  for (const pairing of row.pairings) {
    assert.equal(pairing.pairing, pairing.required ? 1 : 0);
  }
}

// Every policy row robustly gives a unimodular repair for every schedule compatible with that holonomy class.
for (let index = 0; index < classes.length; index += 1) {
  const classified = classifyReplayAgainstHolonomyClass(classes[index], policy[index].replay_row);
  assert.equal(classified.actual_class_robust_rank_rescue, true);
  assert.equal(classified.actual_class_robust_unimodular_rescue, true);
  assert.equal(classified.rank_predicate_matches_actual, true);
  assert.equal(classified.unimodular_predicate_matches_actual, true);
}

// Named one-sided and mixed pairings.
assert.equal(dot([0, 1, 0], [1, 1, 0]), 1);
assert.equal(dot([0, 1, 0], [1, 0, 1]), 0);
assert.equal(dot([0, 0, 1], [1, 1, 0]), 0);
assert.equal(dot([0, 0, 1], [1, 0, 1]), 1);
assert.equal(dot([1, 0, 0], [1, 1, 0]), 1);
assert.equal(dot([1, 0, 0], [1, 0, 1]), 1);

// Mixed holonomy ambiguity survives, yet one robust row repairs both possible schedules.
const mixedClass = classes[2];
const mixedReplay = classifyReplayAgainstHolonomyClass(mixedClass, [1, 0, 0]);
assert.deepEqual(mixedReplay.schedule_ids, ['H-I-P', 'I-H-P']);
assert.equal(mixedReplay.actual_class_robust_unimodular_rescue, true);
assert.deepEqual(
  mixedReplay.actual_member_schedule_rows.map(row => row.has_unimodular_minor),
  [true, true],
);

// Named failures show exact dependence on the class defect set.
const hOnlyMiss = classifyReplayAgainstHolonomyClass(classes[1], [0, 0, 1]);
assert.equal(hOnlyMiss.actual_class_robust_rank_rescue, false);
assert.equal(hOnlyMiss.defect_set_predicts_rank_rescue, false);
const iOnlyMiss = classifyReplayAgainstHolonomyClass(classes[3], [0, 1, 0]);
assert.equal(iOnlyMiss.actual_class_robust_rank_rescue, false);
assert.equal(iOnlyMiss.defect_set_predicts_rank_rescue, false);
const mixedOneSidedH = classifyReplayAgainstHolonomyClass(classes[2], [0, 1, 0]);
assert.equal(mixedOneSidedH.actual_class_robust_rank_rescue, false);
const mixedOneSidedI = classifyReplayAgainstHolonomyClass(classes[2], [0, 0, 1]);
assert.equal(mixedOneSidedI.actual_class_robust_rank_rescue, false);

const certificate = dromologicalHolonomyCoarsenedReplayInverseDesignCertificate();
assert.equal(certificate.schema, DROMOLOGICAL_HOLONOMY_COARSENED_REPLAY_SCHEMA);
assert.equal(certificate.parent_receipt, DROMOLOGICAL_HOLONOMY_COARSENED_REPLAY_PARENT_RECEIPT);
assert.equal(certificate.holonomy_class_structure.exact, true);
assert.equal(certificate.holonomy_class_structure.mixed_class_same_terminal_holonomy, true);
assert.equal(certificate.holonomy_class_structure.mixed_class_different_missing_directions, true);

// Full finite replay-cube class audit.
assert.equal(certificate.finite_holonomy_replay_audit.checked_replay_rows, 729);
assert.equal(certificate.finite_holonomy_replay_audit.expected_replay_rows, 729);
assert.equal(certificate.finite_holonomy_replay_audit.checked_class_row_audits, 2916);
assert.equal(certificate.finite_holonomy_replay_audit.expected_class_row_audits, 2916);
assert.equal(certificate.finite_holonomy_replay_audit.checked_member_schedule_audits, 4374);
assert.equal(certificate.finite_holonomy_replay_audit.expected_member_schedule_audits, 4374);
assert.deepEqual(certificate.finite_holonomy_replay_audit.robust_rank_row_counts_by_holonomy_class, [
  729, 648, 576, 648,
]);
assert.deepEqual(certificate.finite_holonomy_replay_audit.robust_unimodular_row_counts_by_holonomy_class, [
  729, 144, 30, 144,
]);
assert.equal(certificate.finite_holonomy_replay_audit.exact, true);

// Cost minima: theoretical lower bound plus independent finite hostile.
assert.equal(certificate.holonomy_class_replay_policy.l0_l1_minima_attained, true);
assert.deepEqual(certificate.finite_cost_hostile.observed_minimum_costs, [
  { l0: 0, l1: 0 },
  { l0: 1, l1: 1 },
  { l0: 1, l1: 1 },
  { l0: 1, l1: 1 },
]);
assert.equal(certificate.finite_cost_hostile.exact, true);

// #812 null-fiber freedom can strictly improve raw replay cost without changing repair phenotype.
const section11 = canonicalReplayRepairRepresentative([1, 1]);
assert.deepEqual(section11, [0, 1, 1]);
assert.deepEqual(dromologicalRepairSignature([1, 0, 0]), [1, 1]);
const sameFiber = compareReplayRepairRows(section11, [1, 0, 0]);
assert.equal(sameFiber.same_repair_signature, true);
assert.equal(sameFiber.same_repair_determinant_atlas, true);
assert.equal(sameFiber.same_p_first_replay_side_minor_atlas, false);
assert.equal(certificate.null_fiber_cost_certificate.section_l0, 2);
assert.equal(certificate.null_fiber_cost_certificate.section_l1, 2);
assert.equal(certificate.null_fiber_cost_certificate.optimized_l0, 1);
assert.equal(certificate.null_fiber_cost_certificate.optimized_l1, 1);
assert.equal(certificate.null_fiber_cost_certificate.strict_l0_improvement, true);
assert.equal(certificate.null_fiber_cost_certificate.strict_l1_improvement, true);
assert.equal(certificate.null_fiber_cost_certificate.exact, true);

// Anti-necessity control: universal e1 already repairs all six without consulting holonomy.
const universal = classifyDromologicalReplayRow([1, 0, 0]);
assert.equal(universal.actual_all_six_rank_three, true);
assert.equal(universal.actual_all_six_have_unimodular_minor, true);
assert.equal(certificate.anti_necessity_certificate.all_six_unimodular_rescue, true);
assert.equal(certificate.anti_necessity_certificate.every_holonomy_class_robustly_unimodular, true);
assert.equal(certificate.anti_necessity_certificate.terminal_holonomy_not_necessary_for_all_six_repair, true);

assert.equal(certificate.historical_schedule_identity_prefix, 2);
assert.equal(certificate.passed, true);
assert.equal(
  certificate.defect_set_classification,
  'TERMINAL_FORMAL_HOLONOMY_CLASS_IN_THE_FIXED_S3_FIXTURE_IS_SUFFICIENT_TO_DETERMINE_THE_EXACT_SET_OF_MISSING_DIRECTIONS_THAT_A_REPLAY_ROW_MUST_TRANSVERSE_FOR_CLASS_ROBUST_RANK_OR_UNIMODULAR_REPAIR',
);
assert.equal(
  certificate.robust_repair_classification,
  'INCOMPLETE_TERMINAL_FORMAL_HOLONOMY_MEMORY_CAN_STILL_BE_SUFFICIENT_FOR_CLASS_ROBUST_UNIMODULAR_REPAIR_IN_THE_FIXED_S3_FIXTURE',
);
assert.equal(
  certificate.null_fiber_design_law,
  'NULL_FIBER_FREEDOM_CAN_CHANGE_RAW_INTEGER_REPLAY_DESIGN_COST_WITHOUT_CHANGING_THE_FIXED_FIXTURE_REPAIR_PHENOTYPE',
);
assert.equal(
  certificate.architectural_law,
  'TERMINAL_FORMAL_HOLONOMY_CAN_BE_TOO_COARSE_FOR_TEMPORAL_SCHEDULE_RECONSTRUCTION_YET_FINE_ENOUGH_FOR_CLASS_ROBUST_EXACT_REPLAY_REPAIR_WITH_ZERO_AUTHORITY_WIDENING',
);

// Receiver discipline and custody invariance.
const ash = compileDromologicalHolonomyCoarsenedReplayProjection(AIA_RECEIVERS.ASH);
const loom = compileDromologicalHolonomyCoarsenedReplayProjection(AIA_RECEIVERS.LOOM);
assert.deepEqual(ash.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(loom.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(ash.authority, loom.authority);
assert.equal(Object.values(ash.authority).some(Boolean), false);
assert.equal(Object.values(loom.authority).some(Boolean), false);
assert.deepEqual(ash.payload.truths, [
  'THE_LAST_PATTERN_CAN_FORGET_THE_EXACT_ORDER_AND_STILL_TELL_US_WHAT_KIND_OF_EXTRA_CHECK_IS_SAFE',
  'ONE_SHARED_LAST_PATTERN_NEEDS_AN_EXTRA_CHECK_THAT_COVERS_TWO_POSSIBLE_MISSING_CLUES',
  'A_SHORTER_EXTRA_CHECK_CAN_LIVE_IN_THE_SAME_REPAIR_FAMILY',
  'FIXING_THE_MISSING_CLUE_DOES_NOT_RECOVER_THE_FORGOTTEN_ORDER',
]);
for (const key of [
  'terminal_holonomy_matrices_exposed',
  'kernel_vectors_exposed',
  'replay_vectors_exposed',
  'quotient_matrix_exposed',
  'determinant_formulas_exposed',
  'inverse_formulas_exposed',
  'latent_coordinates_exposed',
]) {
  assert.equal(ash.payload[key], false);
}
assert.equal(loom.payload.holonomy_class_structure.exact, true);
assert.equal(loom.payload.holonomy_class_replay_policy.exact, true);
assert.equal(rejectDromologicalHolonomyCoarsenedReplayOverreach(ash).accepted, true);
assert.equal(rejectDromologicalHolonomyCoarsenedReplayOverreach(loom).accepted, true);

assert.equal(
  rejectDromologicalHolonomyCoarsenedReplayOverreach({
    ...loom,
    authority: { ...loom.authority, inverse: true },
  }).accepted,
  false,
);
assert.equal(
  rejectDromologicalHolonomyCoarsenedReplayOverreach({
    ...loom,
    runtime_binding: true,
  }).accepted,
  false,
);
for (const key of [
  'complete_schedule_reconstruction_from_terminal_holonomy',
  'universal_holonomy_guided_inverse_design',
  'universal_optimal_sensor_theorem',
  'physical_holonomy',
  'physical_quasicrystal',
  'physical_gauge_fixing',
  'continuum_tomography',
  'operational_sensor_control',
  'operational_inverse_route',
  'semantic_causation',
]) {
  assert.equal(
    rejectDromologicalHolonomyCoarsenedReplayOverreach({
      ...loom,
      claim_ceiling: { ...loom.claim_ceiling, [key]: true },
    }).accepted,
    false,
  );
}
assert.equal(
  rejectDromologicalHolonomyCoarsenedReplayOverreach({
    ...ash,
    payload: { ...ash.payload, kernel_vectors_exposed: true },
  }).accepted,
  false,
);
assert.throws(
  () => compileDromologicalHolonomyCoarsenedReplayProjection('UNDECLARED_RECEIVER'),
  /undeclared AIA receiver/,
);

assert.deepEqual(certificate.scars, [
  'TERMINAL_FORMAL_HOLONOMY != COMPLETE_DROMOLOGICAL_MEMORY',
  'SAME_TERMINAL_HOLONOMY != SAME_MISSING_DIRECTION',
  'HOLONOMY_CLASS_DEFECT_SET != PHYSICAL_HOLONOMY_SPECTRUM',
  'HOLONOMY_GUIDED_REPAIR_SUFFICIENCY != HOLONOMY_NECESSITY_FOR_REPAIR',
  'CLASS_ROBUST_REPLAY_POLICY != OPERATIONAL_SENSOR_CONTROL',
  'CLASS_CONDITIONED_INTEGER_COST_MINIMALITY != UNIVERSAL_OPTIMAL_EXPERIMENT_DESIGN',
  'NULL_FIBER_COST_OPTIMIZATION != PHYSICAL_GAUGE_FIXING',
  'CANONICAL_SECTION != COST_OPTIMAL_REPRESENTATIVE',
  'ROBUST_REPAIR != RECOVERY_OF_FORGOTTEN_SCHEDULE_IDENTITY',
  'FORMAL_HOLONOMY_COARSENING != SEMANTIC_CAUSATION',
]);

console.log('Ash A15-R0 dromological holonomy-coarsened robust replay inverse-design hostile tests passed.');
