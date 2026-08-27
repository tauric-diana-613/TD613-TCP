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
  deriveReplayMinorLinearForms,
} from '../app/dome-world/previews/a15-r0/dromological-replay-transversality-unimodular-locus.js';
import {
  DROMOLOGICAL_REPAIR_NULL_FIBER_GENERATOR,
  dromologicalRepairSignature,
  replayRepairDeterminantAtlas,
  dromologicalReplayRepairQuotientCertificate,
} from '../app/dome-world/previews/a15-r0/dromological-replay-repair-quotient-canonical-section.js';
import {
  P_FIRST_SIDE_MINOR_REPLAY_IDENTIFIABILITY_SCHEMA,
  P_FIRST_SIDE_MINOR_REPLAY_IDENTIFIABILITY_PARENT_RECEIPT,
  pFirstSideMinorCoordinateAtlas,
  pFirstReplaySideMinorTriple,
  invertPFirstReplaySideMinorTriple,
  identifyReplayFiberCoordinateFromSensitiveMinor,
  reconstructReplayRowFromRepairSignatureAndSensitiveMinor,
  pFirstSideMinorReplayIdentifiabilityCertificate,
  compilePFirstSideMinorReplayIdentifiabilityProjection,
  rejectPFirstSideMinorReplayIdentifiabilityOverreach,
} from '../app/dome-world/previews/a15-r0/p-first-side-minor-replay-identifiability.js';

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function determinant3(matrix) {
  const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
  return a * (e * i - f * h)
    - b * (d * i - f * g)
    + c * (d * h - e * g);
}

function dot(left, right) {
  return left.reduce((sum, value, index) => sum + value * right[index], 0);
}

function matrixTimesVector(matrix, vector) {
  return matrix.map(row => row.reduce((sum, value, index) => sum + value * vector[index], 0));
}

assert.equal(
  P_FIRST_SIDE_MINOR_REPLAY_IDENTIFIABILITY_PARENT_RECEIPT,
  '2cc95613969951afc96c638c316ae70007560f16',
);

const repairParent = dromologicalReplayRepairQuotientCertificate();
assert.equal(repairParent.passed, true);
assert.deepEqual(DROMOLOGICAL_REPAIR_NULL_FIBER_GENERATOR, [1, -1, -1]);

const historicalAtlas = dromologicalS3ScheduleAtlasCertificate();
assert.equal(historicalAtlas.passed, true);
const pFirstSchedules = historicalAtlas.schedules
  .filter(row => row.observation_rank === 3)
  .map(row => row.schedule);
assert.equal(pFirstSchedules.length, 2);

// Independently rederive the six P-first replay-side coefficient rows from inherited determinant forms.
const independentlyDerivedMatrices = pFirstSchedules.map((schedule) => (
  deriveReplayMinorLinearForms(schedule)
    .filter(form => form.replay_dependent)
    .map(form => form.coefficients)
));
assert.deepEqual(independentlyDerivedMatrices, [
  [[0, 0, -1], [0, 1, -1], [1, 2, 0]],
  [[0, 1, 0], [0, 1, -1], [-1, -1, -1]],
]);
assert.deepEqual(independentlyDerivedMatrices.map(determinant3), [1, 1]);

const coordinateAtlas = pFirstSideMinorCoordinateAtlas();
assert.equal(coordinateAtlas.length, 2);
assert.deepEqual(coordinateAtlas.map(row => row.schedule_id), ['P-H-I', 'P-I-H']);
assert.deepEqual(coordinateAtlas.map(row => row.coefficient_matrix), independentlyDerivedMatrices);
assert.deepEqual(coordinateAtlas.map(row => row.determinant), [1, 1]);
assert.deepEqual(coordinateAtlas.map(row => row.inverse_matrix), [
  [[2, -2, 1], [-1, 1, 0], [-1, 0, 0]],
  [[-2, 1, -1], [1, 0, 0], [1, -1, 0]],
]);
assert.deepEqual(coordinateAtlas.map(row => row.fiber_slopes), [
  [1, 0, -1],
  [-1, 0, 1],
]);
assert.deepEqual(coordinateAtlas.map(row => row.fiber_sensitive_indices), [[0, 2], [0, 2]]);
assert.deepEqual(coordinateAtlas.map(row => row.fiber_blind_indices), [[1], [1]]);

// Exact named formula controls from actual determinant values, not only coefficient matrices.
assert.deepEqual(pFirstReplaySideMinorTriple(pFirstSchedules[0], [3, -2, 5]), [-5, -7, -1]);
assert.deepEqual(pFirstReplaySideMinorTriple(pFirstSchedules[1], [3, -2, 5]), [-2, -7, -6]);
assert.deepEqual(invertPFirstReplaySideMinorTriple(pFirstSchedules[0], [-5, -7, -1]), [3, -2, 5]);
assert.deepEqual(invertPFirstReplaySideMinorTriple(pFirstSchedules[1], [-2, -7, -6]), [3, -2, 5]);

// Independent exhaustive 729 x 2 exact replay reconstruction and 729 x 4 fiber-coordinate reconstruction hostile.
const rows = [];
let replayReconstructions = 0;
let fiberReconstructions = 0;
for (let a = -4; a <= 4; a += 1) {
  for (let b = -4; b <= 4; b += 1) {
    for (let c = -4; c <= 4; c += 1) {
      const replayRow = [a, b, c];
      const signature = dromologicalRepairSignature(replayRow);
      const sideTriples = [];
      for (let scheduleIndex = 0; scheduleIndex < pFirstSchedules.length; scheduleIndex += 1) {
        const schedule = pFirstSchedules[scheduleIndex];
        const coordinate = coordinateAtlas[scheduleIndex];
        const triple = pFirstReplaySideMinorTriple(schedule, replayRow);
        sideTriples.push(triple);
        assert.deepEqual(triple, matrixTimesVector(coordinate.coefficient_matrix, replayRow));
        assert.deepEqual(invertPFirstReplaySideMinorTriple(schedule, triple), replayRow);
        replayReconstructions += 1;

        for (const minorIndex of coordinate.fiber_sensitive_indices) {
          const recoveredT = identifyReplayFiberCoordinateFromSensitiveMinor(
            signature,
            schedule,
            minorIndex,
            triple[minorIndex],
          );
          const recoveredRow = reconstructReplayRowFromRepairSignatureAndSensitiveMinor(
            signature,
            schedule,
            minorIndex,
            triple[minorIndex],
          );
          assert.equal(recoveredT, a);
          assert.deepEqual(recoveredRow, replayRow);
          fiberReconstructions += 1;
        }

        const blindIndex = coordinate.fiber_blind_indices[0];
        assert.throws(
          () => identifyReplayFiberCoordinateFromSensitiveMinor(
            signature,
            schedule,
            blindIndex,
            triple[blindIndex],
          ),
          /fiber-blind/,
        );
      }
      rows.push({ replayRow, signature, sideTriples });
    }
  }
}
assert.equal(rows.length, 729);
assert.equal(replayReconstructions, 1458);
assert.equal(fiberReconstructions, 2916);

// Independent pairwise injectivity and strict partition refinement hostile.
let unorderedPairs = 0;
let injectivityChecks = 0;
let sameSignaturePairs = 0;
let refinementChecks = 0;
for (let leftIndex = 0; leftIndex < rows.length; leftIndex += 1) {
  const left = rows[leftIndex];
  for (let rightIndex = leftIndex + 1; rightIndex < rows.length; rightIndex += 1) {
    const right = rows[rightIndex];
    const sameSignature = same(left.signature, right.signature);
    if (sameSignature) sameSignaturePairs += 1;
    for (let scheduleIndex = 0; scheduleIndex < 2; scheduleIndex += 1) {
      assert.notDeepEqual(left.sideTriples[scheduleIndex], right.sideTriples[scheduleIndex]);
      injectivityChecks += 1;
      if (sameSignature) {
        assert.notDeepEqual(left.sideTriples[scheduleIndex], right.sideTriples[scheduleIndex]);
        refinementChecks += 1;
      }
    }
    unorderedPairs += 1;
  }
}
assert.equal(unorderedPairs, 265356);
assert.equal(injectivityChecks, 530712);
assert.equal(sameSignaturePairs, 1296);
assert.equal(refinementChecks, 2592);

// Independently derive fiber slopes and verify exact affine behavior on 18,522 side-minor translations.
for (const coordinate of coordinateAtlas) {
  assert.deepEqual(
    coordinate.coefficient_matrix.map(row => dot(row, DROMOLOGICAL_REPAIR_NULL_FIBER_GENERATOR)),
    coordinate.fiber_slopes,
  );
}
let translationChecks = 0;
for (let a = -3; a <= 3; a += 1) {
  for (let b = -3; b <= 3; b += 1) {
    for (let c = -3; c <= 3; c += 1) {
      const base = [a, b, c];
      for (let n = -4; n <= 4; n += 1) {
        const translated = base.map((value, index) => (
          value + n * DROMOLOGICAL_REPAIR_NULL_FIBER_GENERATOR[index]
        ));
        assert.deepEqual(dromologicalRepairSignature(translated), dromologicalRepairSignature(base));
        for (let scheduleIndex = 0; scheduleIndex < 2; scheduleIndex += 1) {
          const coordinate = coordinateAtlas[scheduleIndex];
          const baseTriple = pFirstReplaySideMinorTriple(pFirstSchedules[scheduleIndex], base);
          const translatedTriple = pFirstReplaySideMinorTriple(pFirstSchedules[scheduleIndex], translated);
          for (let minorIndex = 0; minorIndex < 3; minorIndex += 1) {
            assert.equal(
              translatedTriple[minorIndex] - baseTriple[minorIndex],
              n * coordinate.fiber_slopes[minorIndex],
            );
            translationChecks += 1;
          }
        }
      }
    }
  }
}
assert.equal(translationChecks, 18522);

// Fiber-blind vs unit-slope named hostile inside one earned #812 repair class.
const r0 = [1, 0, 0];
const r1 = [2, -1, -1];
assert.deepEqual(dromologicalRepairSignature(r0), [1, 1]);
assert.deepEqual(dromologicalRepairSignature(r1), [1, 1]);
assert.deepEqual(replayRepairDeterminantAtlas(r0), replayRepairDeterminantAtlas(r1));
for (let scheduleIndex = 0; scheduleIndex < 2; scheduleIndex += 1) {
  const coordinate = coordinateAtlas[scheduleIndex];
  const left = pFirstReplaySideMinorTriple(pFirstSchedules[scheduleIndex], r0);
  const right = pFirstReplaySideMinorTriple(pFirstSchedules[scheduleIndex], r1);
  assert.notDeepEqual(left, right);
  assert.equal(left[coordinate.fiber_blind_indices[0]], right[coordinate.fiber_blind_indices[0]]);
  for (const index of coordinate.fiber_sensitive_indices) assert.notEqual(left[index], right[index]);
}

const certificate = pFirstSideMinorReplayIdentifiabilityCertificate();
assert.equal(certificate.schema, P_FIRST_SIDE_MINOR_REPLAY_IDENTIFIABILITY_SCHEMA);
assert.equal(certificate.parent_receipt, P_FIRST_SIDE_MINOR_REPLAY_IDENTIFIABILITY_PARENT_RECEIPT);
assert.equal(certificate.all_p_first_side_minor_coordinate_systems_unimodular, true);
assert.equal(certificate.fiber_sensitivity_classification_exact, true);
assert.equal(certificate.finite_replay_cube_audit.checked_replay_rows, 729);
assert.equal(certificate.finite_replay_cube_audit.checked_schedule_reconstructions, 1458);
assert.equal(certificate.finite_replay_cube_audit.checked_sensitive_minor_fiber_reconstructions, 2916);
assert.equal(certificate.finite_replay_cube_audit.exact, true);
assert.equal(certificate.finite_pair_partition_audit.p_first_pairwise_injectivity_checks, 530712);
assert.equal(certificate.finite_pair_partition_audit.same_repair_signature_pairs, 1296);
assert.equal(certificate.finite_pair_partition_audit.strict_refinement_checks, 2592);
assert.equal(certificate.finite_pair_partition_audit.exact, true);
assert.equal(certificate.finite_fiber_translation_audit.side_minor_translation_checks, 18522);
assert.equal(certificate.finite_fiber_translation_audit.exact, true);
assert.equal(certificate.named_fiber_blind_control.passed, true);
assert.equal(certificate.replay_removal_preserves_historical_rank_profile, true);
assert.equal(certificate.schedule_identity_already_exact_at_prefix_two, true);
assert.equal(certificate.passed, true);
assert.equal(
  certificate.replay_identifiability_classification,
  'EACH_P_FIRST_REPLAY_DEPENDENT_SIDE_MINOR_TRIPLE_IS_A_UNIMODULAR_INTEGER_COORDINATE_SYSTEM_ON_THE_DECLARED_REPLAY_LATTICE_AND_EXACTLY_IDENTIFIES_THE_REPLAY_ROW_IN_THE_FIXED_S3_FIXTURE',
);
assert.equal(
  certificate.partition_classification,
  'THE_P_FIRST_SIDE_MINOR_PARTITION_STRICTLY_REFINES_THE_REPAIR_QUOTIENT_PARTITION_BECAUSE_THE_FOUR_HISTORICALLY_SINGULAR_REPAIR_ATLASES_FACTOR_THROUGH_Q_WHILE_EITHER_P_FIRST_SIDE_MINOR_TRIPLE_IS_INJECTIVE_ON_INTEGER_REPLAY_ROWS',
);
assert.equal(
  certificate.architectural_law,
  'IN_THE_FIXED_S3_FIXTURE_A_REPLAY_FIBER_COORDINATE_CAN_BE_INVISIBLE_TO_THE_SINGULAR_SCHEDULE_REPAIR_PHENOTYPE_YET_EXACTLY_IDENTIFIABLE_FROM_EITHER_P_FIRST_REPLAY_SIDE_MINOR_TRIPLE_WITH_ZERO_AUTHORITY_WIDENING',
);

// Parent and historical facts remain separately witnessed.
assert.equal(dromologicalReplayRepairQuotientCertificate().passed, true);
assert.deepEqual(historicalAtlas.schedules.map(row => row.observation_rank), [3, 3, 2, 2, 2, 2]);
const lag = dromologicalScheduleStateIdentifiabilityLagCertificate();
assert.equal(lag.passed, true);
assert.equal(lag.minimal_schedule_identification_prefix, 2);

// Receiver discipline and authority ceiling.
const ash = compilePFirstSideMinorReplayIdentifiabilityProjection(AIA_RECEIVERS.ASH);
const loom = compilePFirstSideMinorReplayIdentifiabilityProjection(AIA_RECEIVERS.LOOM);
assert.deepEqual(ash.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(loom.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(ash.authority, loom.authority);
assert.equal(Object.values(ash.authority).some(Boolean), false);
assert.equal(Object.values(loom.authority).some(Boolean), false);
assert.deepEqual(ash.payload.truths, [
  'TWO_GOOD_ORDERS_KEEP_ENOUGH_EXTRA_DETAIL_TO_TELL_WHICH_EXTRA_CHECK_WAS_USED',
  'THE_REPAIR_EFFECT_ALONE_CAN_FORGET_A_DETAIL_THAT_THE_GOOD_ORDER_SIDE_CLUES_STILL_KEEP',
  'ONE_KIND_OF_SIDE_CLUE_STAYS_THE_SAME_ALONG_A_REPAIR_FAMILY_WHILE_OTHER_SIDE_CLUES_CHANGE',
]);
for (const key of [
  'replay_vectors_exposed',
  'coefficient_matrices_exposed',
  'determinant_formulas_exposed',
  'inverse_formulas_exposed',
  'fiber_vector_exposed',
  'quotient_matrix_exposed',
  'latent_coordinates_exposed',
]) assert.equal(ash.payload[key], false);
assert.equal(rejectPFirstSideMinorReplayIdentifiabilityOverreach(ash).accepted, true);
assert.equal(rejectPFirstSideMinorReplayIdentifiabilityOverreach(loom).accepted, true);
assert.equal(
  rejectPFirstSideMinorReplayIdentifiabilityOverreach({
    ...loom,
    authority: { ...loom.authority, inverse: true },
  }).accepted,
  false,
);
assert.equal(
  rejectPFirstSideMinorReplayIdentifiabilityOverreach({ ...loom, runtime_binding: true }).accepted,
  false,
);
for (const key of [
  'universal_replay_theorem',
  'universal_side_minor_theorem',
  'universal_sensor_coordinates',
  'universal_minimal_sufficient_statistic',
  'operational_replay_inverse_route',
  'live_sensor_reconstruction',
  'physical_fiber_sensor',
  'continuum_tomography',
  'physical_holonomy',
  'physical_quasicrystal',
  'semantic_hierarchy',
]) {
  assert.equal(
    rejectPFirstSideMinorReplayIdentifiabilityOverreach({
      ...loom,
      claim_ceiling: { ...loom.claim_ceiling, [key]: true },
    }).accepted,
    false,
  );
}
assert.equal(
  rejectPFirstSideMinorReplayIdentifiabilityOverreach({
    ...ash,
    payload: { ...ash.payload, coefficient_matrices_exposed: true },
  }).accepted,
  false,
);
assert.throws(
  () => compilePFirstSideMinorReplayIdentifiabilityProjection('UNDECLARED_RECEIVER'),
  /undeclared AIA receiver/,
);

assert.deepEqual(certificate.scars, [
  'P_FIRST_SIDE_MINOR_IDENTIFIABILITY != OPERATIONAL_REPLAY_INVERSE_ROUTE',
  'UNIMODULAR_SIDE_MINOR_COORDINATES != UNIVERSAL_SENSOR_COORDINATES',
  'SIDE_MINOR_PARTITION_REFINEMENT != SEMANTIC_HIERARCHY',
  'FIBER_SENSITIVE_MINOR != PHYSICAL_FIBER_SENSOR',
  'FIBER_BLIND_MINOR != INFORMATION_ABSENCE_FROM_THE_FULL_RECORD',
  'SAME_REPAIR_SIGNATURE != SAME_P_FIRST_SIDE_MINOR_TRIPLE',
  'REPLAY_ROW_IDENTIFIED_FROM_DECLARED_MINORS != LATENT_STATE_OR_SOURCE_IDENTITY',
  'FINITE_INTEGER_INVERSE != CONTINUUM_TOMOGRAPHY_INVERSE',
]);

console.log('Ash A15-R0 P-first side-minor replay identifiability hostile tests passed.');
