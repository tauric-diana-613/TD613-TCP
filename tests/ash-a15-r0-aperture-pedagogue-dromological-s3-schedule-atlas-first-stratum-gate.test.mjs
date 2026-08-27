import assert from 'node:assert/strict';

import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import {
  DROMOLOGICAL_S3_SCHEDULE_ATLAS_SCHEMA,
  DROMOLOGICAL_S3_SCHEDULE_ATLAS_PARENT_RECEIPT,
  DROMOLOGICAL_S3_SCHEDULES,
  dromologicalS3ScheduleAtlasCertificate,
  invertDromologicalScheduleObservation,
  compileDromologicalS3ScheduleAtlasProjection,
  rejectDromologicalS3AtlasOverreach,
} from '../app/dome-world/previews/a15-r0/dromological-s3-schedule-atlas-first-stratum-gate.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
  observePhasonicState,
} from '../app/dome-world/previews/a15-r0/phasonic-supermoire-dromological-tomography.js';

assert.equal(
  DROMOLOGICAL_S3_SCHEDULE_ATLAS_PARENT_RECEIPT,
  '40dfba93d2577bceba0f66022ac5f42934cdbd06',
);

const atlas = dromologicalS3ScheduleAtlasCertificate();
assert.equal(atlas.schema, DROMOLOGICAL_S3_SCHEDULE_ATLAS_SCHEMA);
assert.equal(atlas.parent_receipt, DROMOLOGICAL_S3_SCHEDULE_ATLAS_PARENT_RECEIPT);
assert.equal(atlas.passed, true);
assert.equal(atlas.schedule_count, 6);
assert.equal(atlas.invertible_schedule_count, 2);
assert.equal(atlas.nonidentifiable_schedule_count, 4);
assert.equal(atlas.first_stratum_gate_exact, true);
assert.deepEqual(atlas.invertible_schedule_ids, ['P-H-I', 'P-I-H']);
assert.deepEqual(atlas.nonidentifiable_schedule_ids, ['H-P-I', 'H-I-P', 'I-P-H', 'I-H-P']);
assert.equal(atlas.inverse_finite_cube_certificate.checked_state_schedule_pairs, 250);
assert.equal(atlas.inverse_finite_cube_certificate.expected_state_schedule_pairs, 250);
assert.equal(atlas.inverse_finite_cube_certificate.exact, true);

const expectedMatrices = [
  [[1, 0, 0], [2, -1, 0], [2, -1, -1]],
  [[1, 0, 0], [1, 0, -1], [2, -1, -1]],
  [[1, -1, 0], [1, -1, 0], [1, -1, -1]],
  [[1, -1, 0], [1, -1, -1], [1, -1, -1]],
  [[1, 0, -1], [1, 0, -1], [2, -1, -2]],
  [[1, 0, -1], [1, -1, -1], [1, -1, -1]],
];
const expectedDeterminants = [1, -1, 0, 0, 0, 0];
const expectedRanks = [3, 3, 2, 2, 2, 2];
const expectedKernels = [null, null, [1, 1, 0], [1, 1, 0], [1, 0, 1], [1, 0, 1]];

atlas.schedules.forEach((row, index) => {
  assert.deepEqual(row.observation_matrix, expectedMatrices[index]);
  assert.equal(row.observation_determinant, expectedDeterminants[index]);
  assert.equal(row.observation_rank, expectedRanks[index]);
  assert.deepEqual(row.kernel_generator, expectedKernels[index]);
  if (expectedKernels[index]) {
    assert.equal(row.kernel_generator_maps_to_zero, true);
    assert.equal(row.tomography_status, 'NONIDENTIFIABLE_RANK_TWO');
    assert.throws(
      () => invertDromologicalScheduleObservation([0, 0, 0], row.schedule),
      /nonidentifiable/,
    );
    assert.deepEqual(observePhasonicState([0, 0, 0], row.schedule), observePhasonicState(expectedKernels[index], row.schedule));
  } else {
    assert.equal(row.tomography_status, 'EXACT_UNIMODULAR');
  }
});

// Explicit inverse control on both P-first schedules.
for (const schedule of DROMOLOGICAL_S3_SCHEDULES.slice(0, 2)) {
  const state = [2, -1, 1];
  const observation = observePhasonicState(state, schedule);
  assert.deepEqual(invertDromologicalScheduleObservation(observation, schedule), state);
}

// Dromological memory: observation history retains all six schedules; terminal holonomy does not.
assert.equal(atlas.observation_history_class_count, 6);
assert.equal(atlas.observation_history_injective_over_s3, true);
assert.deepEqual(atlas.observation_history_equivalence_classes, [[0], [1], [2], [3], [4], [5]]);
assert.equal(atlas.terminal_holonomy_class_count, 4);
assert.equal(atlas.terminal_formal_holonomy_injective_over_s3, false);
assert.deepEqual(atlas.terminal_holonomy_equivalence_classes, [[0, 1], [2], [3, 5], [4]]);
assert.notDeepEqual(atlas.schedules[0].observation_matrix, atlas.schedules[1].observation_matrix);
assert.deepEqual(atlas.schedules[0].terminal_formal_holonomy, atlas.schedules[1].terminal_formal_holonomy);
assert.notDeepEqual(atlas.schedules[3].observation_matrix, atlas.schedules[5].observation_matrix);
assert.deepEqual(atlas.schedules[3].terminal_formal_holonomy, atlas.schedules[5].terminal_formal_holonomy);

assert.equal(
  atlas.classification,
  'THE_COMPLETE_S3_DROMOLOGICAL_SCHEDULE_ATLAS_SPLITS_EXACTLY_BY_FIRST_ADMITTED_STRATUM_WITH_PHI_FIRST_IFF_UNIMODULARLY_INVERTIBLE_IN_THE_DECLARED_FIXTURE',
);
assert.equal(
  atlas.memory_classification,
  'THE_REGISTERED_OBSERVATION_HISTORY_DISTINGUISHES_ALL_SIX_TEMPORAL_SCHEDULES_WHILE_TERMINAL_FORMAL_HOLONOMY_COLLAPSES_THEM_TO_FOUR_CLASSES',
);

// AIA projection: custody invariant, technical payload anisotropic.
const ash = compileDromologicalS3ScheduleAtlasProjection(AIA_RECEIVERS.ASH);
const loom = compileDromologicalS3ScheduleAtlasProjection(AIA_RECEIVERS.LOOM);
assert.deepEqual(ash.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(loom.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(ash.authority, loom.authority);
assert.equal(Object.values(ash.authority).some(Boolean), false);
assert.equal(Object.values(loom.authority).some(Boolean), false);
assert.equal(ash.runtime_binding, false);
assert.equal(loom.runtime_binding, false);
assert.deepEqual(ash.payload.truths, [
  'FIRST_LAYER_CHANGES_WHAT_CAN_BE_RECOVERED',
  'TWO_ORDERS_KEEP_ALL_THREE_CLUES',
  'FOUR_ORDERS_LOSE_ONE_CLUE',
  'THE_LAST_PATTERN_DOES_NOT_REMEMBER_EVERY_STEP',
]);
assert.equal(ash.payload.technical_matrices_exposed, false);
assert.equal(ash.payload.kernel_vectors_exposed, false);
assert.equal(ash.payload.inverse_formulas_exposed, false);
assert.equal(ash.payload.latent_phason_state_exposed, false);
assert.equal(loom.payload.schedule_atlas.length, 6);
assert.deepEqual(loom.payload.bounded_inverse_schedule_ids, ['P-H-I', 'P-I-H']);

// Hostile overreach attempts.
assert.equal(rejectDromologicalS3AtlasOverreach(ash).accepted, true);
assert.equal(rejectDromologicalS3AtlasOverreach(loom).accepted, true);
assert.equal(rejectDromologicalS3AtlasOverreach({ ...loom, authority: { ...loom.authority, inverse: true } }).accepted, false);
assert.equal(rejectDromologicalS3AtlasOverreach({ ...loom, runtime_binding: true }).accepted, false);
assert.equal(rejectDromologicalS3AtlasOverreach({ ...loom, claim_ceiling: { ...loom.claim_ceiling, physical_holonomy: true } }).accepted, false);
assert.equal(rejectDromologicalS3AtlasOverreach({ ...loom, claim_ceiling: { ...loom.claim_ceiling, physical_quasicrystal: true } }).accepted, false);
assert.equal(rejectDromologicalS3AtlasOverreach({ ...loom, claim_ceiling: { ...loom.claim_ceiling, continuum_inverse: true } }).accepted, false);
assert.equal(rejectDromologicalS3AtlasOverreach({ ...loom, claim_ceiling: { ...loom.claim_ceiling, universal_first_stratum_gate: true } }).accepted, false);
assert.throws(
  () => compileDromologicalS3ScheduleAtlasProjection('UNDECLARED_RECEIVER'),
  /undeclared AIA receiver/,
);

console.log('Ash A15-R0 dromological S3 schedule atlas / first-stratum gate hostile tests passed.');
