import assert from 'node:assert/strict';

import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
  phasonicObservationMatrix,
} from '../app/dome-world/previews/a15-r0/phasonic-supermoire-dromological-tomography.js';
import {
  DROMOLOGICAL_S3_SCHEDULES,
  dromologicalS3ScheduleAtlasCertificate,
} from '../app/dome-world/previews/a15-r0/dromological-s3-schedule-atlas-first-stratum-gate.js';
import {
  dromologicalScheduleStateIdentifiabilityLagCertificate,
} from '../app/dome-world/previews/a15-r0/dromological-schedule-state-identifiability-lag.js';
import {
  DROMOLOGICAL_BASELINE_REPLAY_RESCUE_SCHEMA,
  DROMOLOGICAL_BASELINE_REPLAY_RESCUE_PARENT_RECEIPT,
  DROMOLOGICAL_BASELINE_REPLAY_ROW,
  DROMOLOGICAL_HOSTILE_REPLAY_ROW,
  buildReplayAugmentedObservationMatrix,
  enumerateReplayMinors,
  observeReplayAssistedState,
  invertBaselineReplayObservation,
  dromologicalBaselineReplayRescueCertificate,
  compileDromologicalBaselineReplayRescueProjection,
  rejectDromologicalBaselineReplayRescueOverreach,
} from '../app/dome-world/previews/a15-r0/dromological-baseline-replay-rescue-aperture.js';

function determinant3(matrix) {
  const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
  return a * (e * i - f * h)
    - b * (d * i - f * g)
    + c * (d * h - e * g);
}

function tripleIndices(rowCount) {
  const result = [];
  for (let a = 0; a < rowCount; a += 1) {
    for (let b = a + 1; b < rowCount; b += 1) {
      for (let c = b + 1; c < rowCount; c += 1) result.push([a, b, c]);
    }
  }
  return result;
}

function rankRows(rows) {
  if (tripleIndices(rows.length).some(indices => determinant3(indices.map(index => rows[index])) !== 0)) {
    return 3;
  }
  for (let r1 = 0; r1 < rows.length; r1 += 1) {
    for (let r2 = r1 + 1; r2 < rows.length; r2 += 1) {
      for (let c1 = 0; c1 < 3; c1 += 1) {
        for (let c2 = c1 + 1; c2 < 3; c2 += 1) {
          if (rows[r1][c1] * rows[r2][c2] - rows[r1][c2] * rows[r2][c1] !== 0) return 2;
        }
      }
    }
  }
  return rows.some(row => row.some(Boolean)) ? 1 : 0;
}

function dot(left, right) {
  return left.reduce((sum, value, index) => sum + value * right[index], 0);
}

assert.equal(
  DROMOLOGICAL_BASELINE_REPLAY_RESCUE_PARENT_RECEIPT,
  'a51afae88292878de2c02ca0a086ad1e88f73cfb',
);
assert.deepEqual(DROMOLOGICAL_BASELINE_REPLAY_ROW, [1, 0, 0]);
assert.deepEqual(DROMOLOGICAL_HOSTILE_REPLAY_ROW, [1, -1, -1]);

const expectedOriginalMatrices = [
  [[1, 0, 0], [2, -1, 0], [2, -1, -1]],
  [[1, 0, 0], [1, 0, -1], [2, -1, -1]],
  [[1, -1, 0], [1, -1, 0], [1, -1, -1]],
  [[1, -1, 0], [1, -1, -1], [1, -1, -1]],
  [[1, 0, -1], [1, 0, -1], [2, -1, -2]],
  [[1, 0, -1], [1, -1, -1], [1, -1, -1]],
];

const expectedAugmentedMatrices = expectedOriginalMatrices.map(matrix => [...matrix, [1, 0, 0]]);
const expectedMinorDeterminants = [
  [1, 0, 0, 1],
  [-1, 0, 0, -1],
  [0, 0, 1, 1],
  [0, 1, 1, 0],
  [0, 0, -1, -1],
  [0, -1, -1, 0],
];
const expectedSelected = [
  { rows: [0, 1, 2], determinant: 1 },
  { rows: [0, 1, 2], determinant: -1 },
  { rows: [0, 2, 3], determinant: 1 },
  { rows: [0, 1, 3], determinant: 1 },
  { rows: [0, 2, 3], determinant: -1 },
  { rows: [0, 1, 3], determinant: -1 },
];

for (let index = 0; index < DROMOLOGICAL_S3_SCHEDULES.length; index += 1) {
  const schedule = DROMOLOGICAL_S3_SCHEDULES[index];
  const original = phasonicObservationMatrix(schedule);
  const augmented = buildReplayAugmentedObservationMatrix(schedule);
  const minors = enumerateReplayMinors(schedule);

  assert.deepEqual(original, expectedOriginalMatrices[index]);
  assert.deepEqual(augmented, expectedAugmentedMatrices[index]);
  assert.deepEqual(minors.map(row => row.rows), [
    [0, 1, 2],
    [0, 1, 3],
    [0, 2, 3],
    [1, 2, 3],
  ]);
  assert.deepEqual(minors.map(row => row.determinant), expectedMinorDeterminants[index]);

  const firstUnimodular = minors.find(row => Math.abs(row.determinant) === 1);
  assert.deepEqual(firstUnimodular, expectedSelected[index]);
}

const certificate = dromologicalBaselineReplayRescueCertificate();
assert.equal(certificate.schema, DROMOLOGICAL_BASELINE_REPLAY_RESCUE_SCHEMA);
assert.equal(certificate.parent_receipt, DROMOLOGICAL_BASELINE_REPLAY_RESCUE_PARENT_RECEIPT);
assert.equal(certificate.passed, true);
assert.deepEqual(certificate.original_rank_profile, [3, 3, 2, 2, 2, 2]);
assert.deepEqual(certificate.augmented_rank_profile, [3, 3, 3, 3, 3, 3]);
assert.deepEqual(certificate.original_invertible_schedule_ids, ['P-H-I', 'P-I-H']);
assert.equal(certificate.all_six_augmented_schedules_have_unimodular_minor, true);
assert.equal(certificate.preregistered_minor_targets_independently_rederived, true);
assert.equal(certificate.replay_removal_reproduces_witnessed_original_result, true);
assert.equal(certificate.schedule_identity_already_exact_at_prefix_two, true);
assert.equal(certificate.schedule_identity_remains_separate_from_latent_state_identity, true);
assert.equal(certificate.finite_reconstruction_certificate.checked_state_schedule_pairs, 750);
assert.equal(certificate.finite_reconstruction_certificate.expected_state_schedule_pairs, 750);
assert.equal(certificate.finite_reconstruction_certificate.exact, true);
assert.equal(
  certificate.classification,
  'THE_DECLARED_BASELINE_REPLAY_OBSERVATION_RESTORES_A_UNIMODULAR_INTEGER_TOMOGRAPHY_MINOR_FOR_ALL_SIX_DROMOLOGICAL_SCHEDULES_IN_THE_FIXED_S3_FIXTURE',
);
assert.equal(
  certificate.architectural_law,
  'IDENTIFIABILITY_LOSS_CAN_BE_REPAIRED_BY_A_LATER_DECLARED_PROBE_WITHOUT_REWRITING_THE_EARLIER_NONIDENTIFIABILITY_CERTIFICATE',
);

// Independent 6 x 125 exact replay-assisted reconstruction hostile.
let exactReplayChecks = 0;
for (const schedule of DROMOLOGICAL_S3_SCHEDULES) {
  for (let x1 = -2; x1 <= 2; x1 += 1) {
    for (let x2 = -2; x2 <= 2; x2 += 1) {
      for (let x3 = -2; x3 <= 2; x3 += 1) {
        const state = [x1, x2, x3];
        const observation = observeReplayAssistedState(state, schedule);
        const recovered = invertBaselineReplayObservation(observation, schedule);
        exactReplayChecks += 1;
        assert.deepEqual(recovered, state);
      }
    }
  }
}
assert.equal(exactReplayChecks, 750);

// Removing replay reproduces the witnessed historical result exactly.
assert.deepEqual(expectedOriginalMatrices.map(rankRows), [3, 3, 2, 2, 2, 2]);
const historicalAtlas = dromologicalS3ScheduleAtlasCertificate();
assert.equal(historicalAtlas.passed, true);
assert.deepEqual(historicalAtlas.invertible_schedule_ids, ['P-H-I', 'P-I-H']);
assert.deepEqual(historicalAtlas.nonidentifiable_schedule_ids, ['H-P-I', 'H-I-P', 'I-P-H', 'I-H-P']);

// Schedule identity remains a separate earlier fact, inherited unchanged from #804.
const lag = dromologicalScheduleStateIdentifiabilityLagCertificate();
assert.equal(lag.passed, true);
assert.equal(lag.minimal_schedule_identification_prefix, 2);
assert.equal(lag.strict_schedule_before_state_lag_on_both_p_first_schedules, true);

// Hostile replay [1,-1,-1] is orthogonal to both witnessed missing directions.
// It leaves all four historically rank-two schedules rank two, proving an extra row is not universal rescue.
const missingDirections = [
  [1, 1, 0],
  [1, 0, 1],
];
assert.deepEqual(missingDirections.map(vector => dot(DROMOLOGICAL_HOSTILE_REPLAY_ROW, vector)), [0, 0]);
const hostileRanks = DROMOLOGICAL_S3_SCHEDULES.map(schedule => (
  rankRows(buildReplayAugmentedObservationMatrix(schedule, DROMOLOGICAL_HOSTILE_REPLAY_ROW))
));
assert.deepEqual(hostileRanks, [3, 3, 2, 2, 2, 2]);
for (let index = 2; index < DROMOLOGICAL_S3_SCHEDULES.length; index += 1) {
  const hostileMinors = enumerateReplayMinors(
    DROMOLOGICAL_S3_SCHEDULES[index],
    DROMOLOGICAL_HOSTILE_REPLAY_ROW,
  );
  assert.equal(hostileMinors.every(minor => minor.determinant === 0), true);
}
assert.equal(certificate.hostile_replay_certificate.fails_to_rescue_all_six, true);
assert.equal(
  certificate.hostile_replay_certificate.hostile_row_orthogonal_to_all_witnessed_missing_directions,
  true,
);
assert.equal(
  certificate.hostile_replay_certificate.four_historical_rank_two_schedules_remain_rank_two,
  true,
);

// Receiver discipline and custody invariance.
const ash = compileDromologicalBaselineReplayRescueProjection(AIA_RECEIVERS.ASH);
const loom = compileDromologicalBaselineReplayRescueProjection(AIA_RECEIVERS.LOOM);
assert.deepEqual(ash.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(loom.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(ash.authority, loom.authority);
assert.equal(Object.values(ash.authority).some(Boolean), false);
assert.equal(Object.values(loom.authority).some(Boolean), false);
assert.deepEqual(ash.payload.truths, [
  'WE_KNOW_WHICH_ORDER_HAPPENED_BEFORE_THE_RESCUE',
  'ONE_EXTRA_DECLARED_CHECK_CAN_RECOVER_THE_MISSING_CLUE_IN_THIS_FIXTURE',
  'THE_EARLIER_MISSING_CLUE_WAS_REAL_AT_THE_EARLIER_STAGE',
]);
assert.equal(ash.payload.replay_vector_exposed, false);
assert.equal(ash.payload.technical_matrices_exposed, false);
assert.equal(ash.payload.selected_minor_indices_exposed, false);
assert.equal(ash.payload.inverse_formulas_exposed, false);
assert.equal(ash.payload.latent_phason_state_exposed, false);
assert.equal(loom.payload.replay_atlas.length, 6);
assert.deepEqual(loom.payload.original_rank_profile, [3, 3, 2, 2, 2, 2]);
assert.deepEqual(loom.payload.augmented_rank_profile, [3, 3, 3, 3, 3, 3]);

assert.equal(rejectDromologicalBaselineReplayRescueOverreach(ash).accepted, true);
assert.equal(rejectDromologicalBaselineReplayRescueOverreach(loom).accepted, true);
assert.equal(
  rejectDromologicalBaselineReplayRescueOverreach({
    ...loom,
    authority: { ...loom.authority, inverse: true },
  }).accepted,
  false,
);
assert.equal(
  rejectDromologicalBaselineReplayRescueOverreach({
    ...loom,
    runtime_binding: true,
  }).accepted,
  false,
);
for (const key of [
  'universal_replay_theorem',
  'universal_first_stratum_theorem',
  'universal_sensor_design',
  'asymptotic_recovery_theorem',
  'continuum_tomography',
  'physical_holonomy',
  'physical_quasicrystal',
  'operational_inverse_route',
]) {
  assert.equal(
    rejectDromologicalBaselineReplayRescueOverreach({
      ...loom,
      claim_ceiling: { ...loom.claim_ceiling, [key]: true },
    }).accepted,
    false,
  );
}
assert.equal(
  rejectDromologicalBaselineReplayRescueOverreach({
    ...ash,
    payload: { ...ash.payload, replay_vector_exposed: true },
  }).accepted,
  false,
);
assert.throws(
  () => compileDromologicalBaselineReplayRescueProjection('UNDECLARED_RECEIVER'),
  /undeclared AIA receiver/,
);

assert.deepEqual(certificate.scars, [
  'RESCUE_PROBE != ORIGINAL_SCHEDULE_INVERTIBILITY',
  'LATER_REMEASUREMENT != RETROACTIVE_INFORMATION_EXISTENCE',
  'REPAIRED_IDENTIFIABILITY != ERASURE_OF_PRIOR_NONIDENTIFIABILITY',
  'BASELINE_REPLAY != OPERATIONAL_INVERSE_ROUTE',
  'EXTRA_OBSERVATION != UNIVERSAL_SENSOR_DESIGN',
  'FINITE_RESCUE_CERTIFICATE != ASYMPTOTIC_RECOVERY_THEOREM',
]);

console.log('Ash A15-R0 dromological baseline-replay rescue hostile tests passed.');
