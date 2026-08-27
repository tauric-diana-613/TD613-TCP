import assert from 'node:assert/strict';

import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
  phasonicObservationMatrix,
  observePhasonicState,
} from '../app/dome-world/previews/a15-r0/phasonic-supermoire-dromological-tomography.js';
import {
  DROMOLOGICAL_S3_SCHEDULES,
  invertDromologicalScheduleObservation,
} from '../app/dome-world/previews/a15-r0/dromological-s3-schedule-atlas-first-stratum-gate.js';
import {
  DROMOLOGICAL_SCHEDULE_STATE_LAG_SCHEMA,
  DROMOLOGICAL_SCHEDULE_STATE_LAG_PARENT_RECEIPT,
  dromologicalScheduleStateIdentifiabilityLagCertificate,
  compileDromologicalScheduleStateLagProjection,
  rejectDromologicalScheduleStateLagOverreach,
} from '../app/dome-world/previews/a15-r0/dromological-schedule-state-identifiability-lag.js';

function multiplyRows(rows, vector) {
  return rows.map(row => row.reduce((sum, value, index) => sum + value * vector[index], 0));
}

assert.equal(
  DROMOLOGICAL_SCHEDULE_STATE_LAG_PARENT_RECEIPT,
  'f9d5ee89b8555175d0797893fdd8c91b5395ea8b',
);

const certificate = dromologicalScheduleStateIdentifiabilityLagCertificate();
assert.equal(certificate.schema, DROMOLOGICAL_SCHEDULE_STATE_LAG_SCHEMA);
assert.equal(certificate.parent_receipt, DROMOLOGICAL_SCHEDULE_STATE_LAG_PARENT_RECEIPT);
assert.equal(certificate.passed, true);
assert.equal(certificate.minimal_schedule_identification_prefix, 2);
assert.deepEqual(certificate.prefix_equivalence_classes[1], [[0, 1], [2, 3], [4, 5]]);
assert.deepEqual(certificate.prefix_equivalence_classes[2], [[0], [1], [2], [3], [4], [5]]);
assert.deepEqual(certificate.prefix_equivalence_classes[3], [[0], [1], [2], [3], [4], [5]]);

const expectedRanks = [
  [1, 2, 3],
  [1, 2, 3],
  [1, 1, 2],
  [1, 2, 2],
  [1, 1, 2],
  [1, 2, 2],
];
const expectedStatePrefixes = [3, 3, null, null, null, null];
const expectedTwoRowKernels = [
  [0, 0, 1],
  [0, 1, 0],
  null,
  null,
  null,
  null,
];

certificate.schedules.forEach((row, index) => {
  assert.deepEqual(row.prefix_ranks, expectedRanks[index]);
  assert.equal(row.minimal_state_reconstruction_prefix, expectedStatePrefixes[index]);
  assert.deepEqual(row.two_row_kernel, expectedTwoRowKernels[index]);
});

assert.equal(certificate.strict_schedule_before_state_lag_on_both_p_first_schedules, true);
assert.equal(certificate.hostile_schedules_never_reach_full_rank, true);
assert.equal(certificate.finite_inverse_certificate.checked_state_schedule_pairs, 250);
assert.equal(certificate.finite_inverse_certificate.expected_state_schedule_pairs, 250);
assert.equal(certificate.finite_inverse_certificate.exact, true);
assert.equal(
  certificate.classification,
  'THE_DECLARED_S3_FIXTURE_HAS_A_STRICT_IDENTIFIABILITY_LAG_IN_WHICH_TEMPORAL_SCHEDULE_IDENTITY_IS_EXACTLY_DETERMINED_AFTER_TWO_REGISTERED_OBSERVATIONS_WHILE_THE_LATENT_THREE_COORDINATE_STATE_REQUIRES_THREE_OBSERVATIONS_ON_THE_TWO_UNIMODULAR_SCHEDULES_AND_REMAINS_NONIDENTIFIABLE_ON_THE_OTHER_FOUR',
);
assert.equal(
  certificate.architectural_law,
  'PROCESS_IDENTIFIABILITY_CAN_PRECEDE_LATENT_STATE_IDENTIFIABILITY_WITHOUT_WIDENING_RECEIVER_AUTHORITY',
);

// One observation identifies only the first stratum; it cannot identify all six schedules.
assert.equal(certificate.prefix_equivalence_classes[1].length, 3);
assert.equal(certificate.prefix_equivalence_classes[1].every(group => group.length === 2), true);
assert.equal(certificate.prefix_equivalence_classes[2].length, 6);
assert.equal(certificate.prefix_equivalence_classes[2].every(group => group.length === 1), true);

// Both P-first schedules have a nonzero two-row kernel: schedule identity is exact while state identity is not.
for (let index = 0; index < 2; index += 1) {
  const schedule = DROMOLOGICAL_S3_SCHEDULES[index];
  const kernel = expectedTwoRowKernels[index];
  const prefix = phasonicObservationMatrix(schedule).slice(0, 2);
  assert.notDeepEqual(kernel, [0, 0, 0]);
  assert.deepEqual(multiplyRows(prefix, kernel), [0, 0]);
  assert.deepEqual(multiplyRows(prefix, [0, 0, 0]), multiplyRows(prefix, kernel));
  assert.notDeepEqual(observePhasonicState([0, 0, 0], schedule), observePhasonicState(kernel, schedule));
  const fullObservation = observePhasonicState(kernel, schedule);
  assert.deepEqual(invertDromologicalScheduleObservation(fullObservation, schedule), kernel);
}

// Four non-P-first schedules remain nonidentifiable even after all three registered observations.
for (let index = 2; index < 6; index += 1) {
  assert.equal(certificate.schedules[index].prefix_ranks[2], 2);
  assert.equal(certificate.schedules[index].minimal_state_reconstruction_prefix, null);
}

// Receiver discipline: Ash receives the lag truth, not the technical inverse record.
const ash = compileDromologicalScheduleStateLagProjection(AIA_RECEIVERS.ASH);
const loom = compileDromologicalScheduleStateLagProjection(AIA_RECEIVERS.LOOM);
assert.deepEqual(ash.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(loom.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(ash.authority, loom.authority);
assert.equal(Object.values(ash.authority).some(Boolean), false);
assert.equal(Object.values(loom.authority).some(Boolean), false);
assert.deepEqual(ash.payload.truths, [
  'TWO_CLUES_CAN_TELL_US_WHICH_ORDER_HAPPENED',
  'KNOWING_THE_ORDER_DOES_NOT_MEAN_THE_HIDDEN_STATE_IS_KNOWN',
  'THE_TWO_GOOD_ORDERS_NEED_ONE_MORE_CLUE_FOR_THE_FULL_STATE',
  'FOUR_ORDERS_NEVER_REVEAL_ALL_THREE_STATE_COORDINATES_IN_THIS_FIXTURE',
]);
assert.equal(ash.payload.technical_prefix_matrices_exposed, false);
assert.equal(ash.payload.kernel_vectors_exposed, false);
assert.equal(ash.payload.inverse_formulas_exposed, false);
assert.equal(ash.payload.latent_phason_state_exposed, false);
assert.equal(loom.payload.minimal_schedule_identification_prefix, 2);
assert.deepEqual(loom.payload.invertible_schedule_state_prefixes, [
  { schedule_id: 'P-H-I', minimal_state_reconstruction_prefix: 3 },
  { schedule_id: 'P-I-H', minimal_state_reconstruction_prefix: 3 },
]);

assert.equal(rejectDromologicalScheduleStateLagOverreach(ash).accepted, true);
assert.equal(rejectDromologicalScheduleStateLagOverreach(loom).accepted, true);
assert.equal(rejectDromologicalScheduleStateLagOverreach({ ...loom, authority: { ...loom.authority, inverse: true } }).accepted, false);
assert.equal(rejectDromologicalScheduleStateLagOverreach({ ...loom, runtime_binding: true }).accepted, false);
assert.equal(rejectDromologicalScheduleStateLagOverreach({ ...loom, claim_ceiling: { ...loom.claim_ceiling, universal_stopping_time: true } }).accepted, false);
assert.equal(rejectDromologicalScheduleStateLagOverreach({ ...loom, claim_ceiling: { ...loom.claim_ceiling, continuum_inverse: true } }).accepted, false);
assert.equal(rejectDromologicalScheduleStateLagOverreach({ ...loom, claim_ceiling: { ...loom.claim_ceiling, physical_holonomy: true } }).accepted, false);
assert.equal(rejectDromologicalScheduleStateLagOverreach({ ...ash, payload: { ...ash.payload, kernel_vectors_exposed: true } }).accepted, false);
assert.throws(
  () => compileDromologicalScheduleStateLagProjection('UNDECLARED_RECEIVER'),
  /undeclared AIA receiver/,
);

console.log('Ash A15-R0 dromological schedule/state identifiability-lag hostile tests passed.');
