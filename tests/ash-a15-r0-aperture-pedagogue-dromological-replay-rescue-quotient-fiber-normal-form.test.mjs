import assert from 'node:assert/strict';

import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
} from '../app/dome-world/previews/a15-r0/phasonic-supermoire-dromological-tomography.js';
import {
  DROMOLOGICAL_S3_SCHEDULES,
  dromologicalS3ScheduleAtlasCertificate,
} from '../app/dome-world/previews/a15-r0/dromological-s3-schedule-atlas-first-stratum-gate.js';
import {
  dromologicalScheduleStateIdentifiabilityLagCertificate,
} from '../app/dome-world/previews/a15-r0/dromological-schedule-state-identifiability-lag.js';
import {
  buildReplayAugmentedObservationMatrix,
  enumerateReplayMinors,
  observeReplayAssistedState,
} from '../app/dome-world/previews/a15-r0/dromological-baseline-replay-rescue-aperture.js';
import {
  dromologicalReplayTransversalityLocusCertificate,
} from '../app/dome-world/previews/a15-r0/dromological-replay-transversality-unimodular-locus.js';
import {
  DROMOLOGICAL_REPLAY_RESCUE_QUOTIENT_SCHEMA,
  DROMOLOGICAL_REPLAY_RESCUE_QUOTIENT_PARENT_RECEIPT,
  dromologicalReplayRescueNormalForm,
  replayRescueNormalCoordinates,
  replayRescueQuotientCoordinate,
  replayRowFromNormalCoordinates,
  canonicalReplaySection,
  translateAlongReplayFiber,
  rescueClassificationFromQuotient,
  dromologicalReplayRescueQuotientCertificate,
  compileDromologicalReplayRescueQuotientProjection,
  rejectDromologicalReplayRescueQuotientOverreach,
} from '../app/dome-world/previews/a15-r0/dromological-replay-rescue-quotient-fiber-normal-form.js';

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function actualSignature(replayRow) {
  const schedules = DROMOLOGICAL_S3_SCHEDULES.map((schedule) => {
    const minors = enumerateReplayMinors(schedule, replayRow);
    return {
      determinants: minors.map(minor => minor.determinant),
      rankThree: minors.some(minor => minor.determinant !== 0),
      unimodular: minors.some(minor => Math.abs(minor.determinant) === 1),
    };
  });
  return {
    schedules,
    allRankThree: schedules.every(row => row.rankThree),
    allUnimodular: schedules.every(row => row.unimodular),
    singularSignature: schedules.slice(2).map(row => row.determinants),
  };
}

function difference(left, right) {
  return left.map((value, index) => value - right[index]);
}

function multipleOf(vector, generator) {
  const pivot = generator.findIndex(value => value !== 0);
  if (pivot < 0) return false;
  if (vector[pivot] % generator[pivot] !== 0) return false;
  const n = vector[pivot] / generator[pivot];
  return vector.every((value, index) => value === n * generator[index]);
}

assert.equal(
  DROMOLOGICAL_REPLAY_RESCUE_QUOTIENT_PARENT_RECEIPT,
  '79a6533843c4133345bec3c1e83477c621230b09',
);

const parent = dromologicalReplayTransversalityLocusCertificate();
assert.equal(parent.passed, true);
assert.deepEqual(parent.inherited_kernel_directions, [[1, 1, 0], [1, 0, 1]]);

const normal = dromologicalReplayRescueNormalForm();
assert.deepEqual(normal.pairing_rows, [[1, 1, 0], [1, 0, 1]]);
assert.deepEqual(normal.fiber_generator, [1, -1, -1]);
assert.deepEqual(normal.declared_fiber_coordinate_row, [1, 0, 0]);
assert.deepEqual(normal.transform_matrix, [
  [1, 1, 0],
  [1, 0, 1],
  [1, 0, 0],
]);
assert.equal(normal.transform_determinant, 1);
assert.deepEqual(normal.inverse_transform_matrix, [
  [0, 0, 1],
  [1, 0, -1],
  [0, 1, -1],
]);
assert.equal(normal.fiber_maps_to_zero_quotient, true);
assert.equal(normal.fiber_coordinate_of_generator, 1);

// Named normal-form controls.
assert.deepEqual(replayRescueNormalCoordinates([1, 0, 0]), [1, 1, 1]);
assert.deepEqual(replayRescueQuotientCoordinate([1, 0, 0]), [1, 1]);
assert.deepEqual(replayRowFromNormalCoordinates([1, 1, 1]), [1, 0, 0]);
assert.deepEqual(canonicalReplaySection([3, -2]), [0, 3, -2]);
assert.deepEqual(translateAlongReplayFiber([0, 3, -2], 4), [4, -1, -6]);
assert.deepEqual(replayRescueQuotientCoordinate([4, -1, -6]), [3, -2]);
assert.throws(() => replayRowFromNormalCoordinates([1, 2]), /length 3/);
assert.throws(() => canonicalReplaySection([1]), /length 2/);
assert.throws(() => translateAlongReplayFiber([0, 0, 0], 0.5), /must be an integer/);

// Independent 729-row exact normal-form, decomposition, and rescue-predicate hostile.
let cubeRows = 0;
let cubeRankRescue = 0;
let cubeUnimodularRescue = 0;
for (let a = -4; a <= 4; a += 1) {
  for (let b = -4; b <= 4; b += 1) {
    for (let c = -4; c <= 4; c += 1) {
      const row = [a, b, c];
      const coordinates = replayRescueNormalCoordinates(row);
      const quotient = coordinates.slice(0, 2);
      assert.deepEqual(replayRowFromNormalCoordinates(coordinates), row);
      const section = canonicalReplaySection(quotient);
      assert.deepEqual(
        row,
        section.map((value, index) => value + coordinates[2] * normal.fiber_generator[index]),
      );

      const predicted = rescueClassificationFromQuotient(quotient);
      const actual = actualSignature(row);
      assert.equal(predicted.all_six_rank_three, actual.allRankThree);
      assert.equal(predicted.all_six_have_unimodular_minor, actual.allUnimodular);
      assert.deepEqual(actual.singularSignature, actualSignature(section).singularSignature);
      if (actual.allRankThree) cubeRankRescue += 1;
      if (actual.allUnimodular) cubeUnimodularRescue += 1;
      cubeRows += 1;
    }
  }
}
assert.equal(cubeRows, 729);
assert.equal(cubeRankRescue, 576);
assert.equal(cubeUnimodularRescue, 30);

// Independent 81-target quotient surjectivity and quotient-locus hostile.
let quotientTargets = 0;
let quotientRankRescue = 0;
let quotientUnimodularRescue = 0;
for (let qH = -4; qH <= 4; qH += 1) {
  for (let qI = -4; qI <= 4; qI += 1) {
    const quotient = [qH, qI];
    const section = canonicalReplaySection(quotient);
    assert.deepEqual(replayRescueQuotientCoordinate(section), quotient);
    const predicted = rescueClassificationFromQuotient(quotient);
    const actual = actualSignature(section);
    assert.equal(predicted.all_six_rank_three, actual.allRankThree);
    assert.equal(predicted.all_six_have_unimodular_minor, actual.allUnimodular);
    if (predicted.all_six_rank_three) quotientRankRescue += 1;
    if (predicted.all_six_have_unimodular_minor) quotientUnimodularRescue += 1;
    quotientTargets += 1;
  }
}
assert.equal(quotientTargets, 81);
assert.equal(quotientRankRescue, 64);
assert.equal(quotientUnimodularRescue, 4);

// Independent 3,087 translation hostile: quotient, rescue phenotype, and exact singular signature are fiber-invariant.
let translationChecks = 0;
let nontrivialDistinct = 0;
for (let a = -3; a <= 3; a += 1) {
  for (let b = -3; b <= 3; b += 1) {
    for (let c = -3; c <= 3; c += 1) {
      const base = [a, b, c];
      const baseQ = replayRescueQuotientCoordinate(base);
      const baseActual = actualSignature(base);
      for (let n = -4; n <= 4; n += 1) {
        const translated = translateAlongReplayFiber(base, n);
        const translatedActual = actualSignature(translated);
        assert.deepEqual(replayRescueQuotientCoordinate(translated), baseQ);
        assert.equal(translatedActual.allRankThree, baseActual.allRankThree);
        assert.equal(translatedActual.allUnimodular, baseActual.allUnimodular);
        assert.deepEqual(translatedActual.singularSignature, baseActual.singularSignature);
        if (n !== 0) {
          assert.notDeepEqual(translated, base);
          nontrivialDistinct += 1;
        }
        translationChecks += 1;
      }
    }
  }
}
assert.equal(translationChecks, 3087);
assert.equal(nontrivialDistinct, 2744);

// Independent finite fiber-completeness hostile over all 117,649 ordered pairs in [-3,3]^3.
const finiteRows = [];
for (let a = -3; a <= 3; a += 1) {
  for (let b = -3; b <= 3; b += 1) {
    for (let c = -3; c <= 3; c += 1) finiteRows.push([a, b, c]);
  }
}
let orderedPairs = 0;
let equalQuotientPairs = 0;
for (const left of finiteRows) {
  const leftQ = replayRescueQuotientCoordinate(left);
  for (const right of finiteRows) {
    const quotientEqual = same(leftQ, replayRescueQuotientCoordinate(right));
    const fiberMultiple = multipleOf(difference(left, right), normal.fiber_generator);
    assert.equal(quotientEqual, fiberMultiple);
    if (quotientEqual) equalQuotientPairs += 1;
    orderedPairs += 1;
  }
}
assert.equal(orderedPairs, 117649);
assert.equal(equalQuotientPairs, 1225);

// Same rescue quotient must not collapse full replay identity or full observation transcript.
const r0 = [1, 0, 0];
const r1 = [2, -1, -1];
assert.deepEqual(replayRescueQuotientCoordinate(r0), [1, 1]);
assert.deepEqual(replayRescueQuotientCoordinate(r1), [1, 1]);
assert.deepEqual(rescueClassificationFromQuotient([1, 1]), {
  quotient_coordinate: [1, 1],
  all_six_rank_three: true,
  all_six_have_unimodular_minor: true,
  class: 'UNIMODULAR_INTEGER_RESCUE',
});
const r0Actual = actualSignature(r0);
const r1Actual = actualSignature(r1);
assert.deepEqual(r0Actual.singularSignature, r1Actual.singularSignature);
assert.notDeepEqual(r0, r1);
const pFirst = DROMOLOGICAL_S3_SCHEDULES[0];
assert.notDeepEqual(
  buildReplayAugmentedObservationMatrix(pFirst, r0),
  buildReplayAugmentedObservationMatrix(pFirst, r1),
);
assert.notDeepEqual(r0Actual.schedules[0].determinants, r1Actual.schedules[0].determinants);
assert.deepEqual(observeReplayAssistedState([1, 0, 0], pFirst, r0), [1, 2, 2, 1]);
assert.deepEqual(observeReplayAssistedState([1, 0, 0], pFirst, r1), [1, 2, 2, 2]);

// Null fiber and one-sided quotient axes preserve the expected family-selective failures.
assert.deepEqual(replayRescueQuotientCoordinate([0, 0, 0]), [0, 0]);
assert.deepEqual(replayRescueQuotientCoordinate([1, -1, -1]), [0, 0]);
assert.deepEqual(actualSignature([1, -1, -1]).schedules.map(row => row.rankThree), [true, true, false, false, false, false]);
assert.deepEqual(actualSignature(canonicalReplaySection([1, 0])).schedules.map(row => row.rankThree), [true, true, true, true, false, false]);
assert.deepEqual(actualSignature(canonicalReplaySection([0, 1])).schedules.map(row => row.rankThree), [true, true, false, false, true, true]);
assert.deepEqual(actualSignature(canonicalReplaySection([2, 2])).schedules.map(row => row.unimodular), [true, true, false, false, false, false]);

const certificate = dromologicalReplayRescueQuotientCertificate();
assert.equal(certificate.schema, DROMOLOGICAL_REPLAY_RESCUE_QUOTIENT_SCHEMA);
assert.equal(certificate.parent_receipt, DROMOLOGICAL_REPLAY_RESCUE_QUOTIENT_PARENT_RECEIPT);
assert.equal(certificate.passed, true);
assert.equal(certificate.exact_sequence, '0 -> Z --(1,-1,-1)--> Z^3 --Q--> Z^2 -> 0');
assert.equal(certificate.quotient_map, 'Q(a,b,c)=(a+b,a+c)');
assert.equal(certificate.splitting_section, 's(u,v)=(0,u,v)');
assert.equal(certificate.inverse_normal_form, '[a,b,c]=[t,q_H-t,q_I-t]');
assert.equal(certificate.rank_rescue_quotient_locus, 'q_H!=0 AND q_I!=0');
assert.equal(certificate.unimodular_rescue_quotient_locus, 'q_H,q_I in {-1,+1}');
assert.equal(certificate.finite_replay_cube_audit.checked_replay_rows, 729);
assert.equal(certificate.finite_replay_cube_audit.exact, true);
assert.equal(certificate.finite_quotient_window_audit.checked_quotient_targets, 81);
assert.equal(certificate.finite_quotient_window_audit.rank_rescue_target_count, 64);
assert.equal(certificate.finite_quotient_window_audit.unimodular_target_count, 4);
assert.equal(certificate.finite_quotient_window_audit.exact, true);
assert.equal(certificate.finite_fiber_translation_audit.checked_translations, 3087);
assert.equal(certificate.finite_fiber_translation_audit.nontrivial_translations_distinct, 2744);
assert.equal(certificate.finite_fiber_translation_audit.exact, true);
assert.equal(certificate.finite_fiber_completeness_audit.checked_ordered_pairs, 117649);
assert.equal(certificate.finite_fiber_completeness_audit.equal_quotient_ordered_pairs, 1225);
assert.equal(certificate.finite_fiber_completeness_audit.exact, true);
assert.equal(certificate.replay_removal_preserves_historical_rank_profile, true);
assert.equal(certificate.schedule_identity_already_exact_at_prefix_two, true);
assert.equal(
  certificate.classification,
  'THE_FIXED_S3_INTEGER_REPLAY_SPACE_ADMITS_A_UNIMODULAR_NORMAL_FORM_Z3_ISOMORPHIC_TO_Z2_CROSS_Z_WITH_COORDINATES_Q_H_Q_I_T_WHERE_THE_DECLARED_RESCUE_CLASSIFICATION_FACTORS_THROUGH_THE_Z2_QUOTIENT_AND_T_PARAMETERIZES_THE_EXACT_INTEGER_FIBER',
);
assert.equal(
  certificate.architectural_law,
  'IN_THE_FIXED_S3_FIXTURE_REPLAY_IDENTITY_CAN_CONTAIN_AN_INTEGER_FIBER_COORDINATE_THAT_IS_INVISIBLE_TO_RESCUE_CLASSIFICATION_WHILE_REMAINING_VISIBLE_TO_THE_FULL_REPLAY_OBSERVATION_TRANSCRIPT',
);

// Historical and schedule/state facts remain separate and unchanged.
const atlas = dromologicalS3ScheduleAtlasCertificate();
assert.equal(atlas.passed, true);
assert.deepEqual(atlas.schedules.map(row => row.observation_rank), [3, 3, 2, 2, 2, 2]);
const lag = dromologicalScheduleStateIdentifiabilityLagCertificate();
assert.equal(lag.passed, true);
assert.equal(lag.minimal_schedule_identification_prefix, 2);

// Receiver discipline and authority ceiling.
const ash = compileDromologicalReplayRescueQuotientProjection(AIA_RECEIVERS.ASH);
const loom = compileDromologicalReplayRescueQuotientProjection(AIA_RECEIVERS.LOOM);
assert.deepEqual(ash.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(loom.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(ash.authority, loom.authority);
assert.equal(Object.values(ash.authority).some(Boolean), false);
assert.equal(Object.values(loom.authority).some(Boolean), false);
assert.deepEqual(ash.payload.truths, [
  'MANY_DIFFERENT_EXTRA_CHECKS_CAN_HAVE_THE_SAME_RESCUE_EFFECT',
  'THE_RESCUE_EFFECT_DOES_NOT_TELL_US_WHICH_EXACT_EXTRA_CHECK_WAS_USED',
  'FOUR_RESCUE_EFFECTS_HAVE_EXACT_INTEGER_KEYS_IN_THIS_FIXTURE',
  'THE_FULL_OBSERVATION_CAN_STILL_TELL_APART_CHECKS_WITH_THE_SAME_RESCUE_EFFECT',
]);
for (const key of [
  'quotient_matrix_exposed',
  'fiber_vector_exposed',
  'affine_fiber_equations_exposed',
  'replay_vectors_exposed',
  'inverse_formulas_exposed',
  'latent_coordinates_exposed',
]) assert.equal(ash.payload[key], false);
assert.deepEqual(loom.payload.normal_form.fiber_generator, [1, -1, -1]);
assert.equal(rejectDromologicalReplayRescueQuotientOverreach(ash).accepted, true);
assert.equal(rejectDromologicalReplayRescueQuotientOverreach(loom).accepted, true);
assert.equal(
  rejectDromologicalReplayRescueQuotientOverreach({
    ...loom,
    authority: { ...loom.authority, inverse: true },
  }).accepted,
  false,
);
assert.equal(
  rejectDromologicalReplayRescueQuotientOverreach({ ...loom, runtime_binding: true }).accepted,
  false,
);
for (const key of [
  'universal_replay_theorem',
  'universal_quotient_theorem',
  'universal_sufficient_statistic',
  'optimal_sensor_theorem',
  'physical_gauge_orbit',
  'continuum_tomography',
  'physical_holonomy',
  'physical_quasicrystal',
  'semantic_equivalence',
  'operational_inverse_route',
]) {
  assert.equal(
    rejectDromologicalReplayRescueQuotientOverreach({
      ...loom,
      claim_ceiling: { ...loom.claim_ceiling, [key]: true },
    }).accepted,
    false,
  );
}
assert.equal(
  rejectDromologicalReplayRescueQuotientOverreach({
    ...ash,
    payload: { ...ash.payload, fiber_vector_exposed: true },
  }).accepted,
  false,
);
assert.throws(
  () => compileDromologicalReplayRescueQuotientProjection('UNDECLARED_RECEIVER'),
  /undeclared AIA receiver/,
);

assert.deepEqual(certificate.scars, [
  'SAME_RESCUE_QUOTIENT != SAME_REPLAY_ROW',
  'SAME_RESCUE_QUOTIENT != SAME_AUGMENTED_OBSERVATION_MATRIX',
  'SAME_RESCUE_QUOTIENT != SAME_FULL_OBSERVATION_TRANSCRIPT',
  'RESCUE_CLASSIFICATION_FACTORING != INFORMATION_ERASURE_FROM_THE_SOURCE_RECORD',
  'INTEGER_FIBER != PHYSICAL_GAUGE_ORBIT',
  'SPLIT_EXACT_SEQUENCE != OPERATIONAL_INVERSE_ROUTE',
  'UNIMODULAR_COORDINATE_CHANGE != UNIVERSAL_SENSOR_OPTIMALITY',
  'QUOTIENT_COMPLETE_FOR_DECLARED_RESCUE_COORDINATES != SEMANTIC_EQUIVALENCE',
  'FINITE_FIBER_CERTIFICATE != ASYMPTOTIC_RECOVERY_THEOREM',
]);

console.log('Ash A15-R0 dromological replay-rescue quotient / fiber normal-form hostile tests passed.');
