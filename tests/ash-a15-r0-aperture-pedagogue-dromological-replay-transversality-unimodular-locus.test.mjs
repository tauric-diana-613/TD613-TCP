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
  DROMOLOGICAL_BASELINE_REPLAY_ROW,
  DROMOLOGICAL_HOSTILE_REPLAY_ROW,
  enumerateReplayMinors,
  observeReplayAssistedState,
  dromologicalBaselineReplayRescueCertificate,
} from '../app/dome-world/previews/a15-r0/dromological-baseline-replay-rescue-aperture.js';
import {
  DROMOLOGICAL_REPLAY_TRANSVERSALITY_LOCUS_SCHEMA,
  DROMOLOGICAL_REPLAY_TRANSVERSALITY_PARENT_RECEIPT,
  DROMOLOGICAL_REPLAY_BASIS_ROWS,
  deriveReplayMinorLinearForms,
  evaluateReplayMinorLinearForm,
  classifyDromologicalReplayRow,
  parameterizeUnimodularReplayRow,
  invertReplayLocusObservation,
  dromologicalReplayTransversalityLocusCertificate,
  compileDromologicalReplayTransversalityProjection,
  rejectDromologicalReplayTransversalityOverreach,
} from '../app/dome-world/previews/a15-r0/dromological-replay-transversality-unimodular-locus.js';

function dot(left, right) {
  return left.reduce((sum, value, index) => sum + value * right[index], 0);
}

assert.equal(
  DROMOLOGICAL_REPLAY_TRANSVERSALITY_PARENT_RECEIPT,
  '5fcaf191b7dbed9529687ed3c072107a37a54814',
);
assert.deepEqual(DROMOLOGICAL_REPLAY_BASIS_ROWS, [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
]);

const expectedLinearForms = [
  [
    { rows: [0, 1, 2], replay: false, determinant: 1 },
    { rows: [0, 1, 3], replay: true, coefficients: [0, 0, -1] },
    { rows: [0, 2, 3], replay: true, coefficients: [0, 1, -1] },
    { rows: [1, 2, 3], replay: true, coefficients: [1, 2, 0] },
  ],
  [
    { rows: [0, 1, 2], replay: false, determinant: -1 },
    { rows: [0, 1, 3], replay: true, coefficients: [0, 1, 0] },
    { rows: [0, 2, 3], replay: true, coefficients: [0, 1, -1] },
    { rows: [1, 2, 3], replay: true, coefficients: [-1, -1, -1] },
  ],
  [
    { rows: [0, 1, 2], replay: false, determinant: 0 },
    { rows: [0, 1, 3], replay: true, coefficients: [0, 0, 0] },
    { rows: [0, 2, 3], replay: true, coefficients: [1, 1, 0] },
    { rows: [1, 2, 3], replay: true, coefficients: [1, 1, 0] },
  ],
  [
    { rows: [0, 1, 2], replay: false, determinant: 0 },
    { rows: [0, 1, 3], replay: true, coefficients: [1, 1, 0] },
    { rows: [0, 2, 3], replay: true, coefficients: [1, 1, 0] },
    { rows: [1, 2, 3], replay: true, coefficients: [0, 0, 0] },
  ],
  [
    { rows: [0, 1, 2], replay: false, determinant: 0 },
    { rows: [0, 1, 3], replay: true, coefficients: [0, 0, 0] },
    { rows: [0, 2, 3], replay: true, coefficients: [-1, 0, -1] },
    { rows: [1, 2, 3], replay: true, coefficients: [-1, 0, -1] },
  ],
  [
    { rows: [0, 1, 2], replay: false, determinant: 0 },
    { rows: [0, 1, 3], replay: true, coefficients: [-1, 0, -1] },
    { rows: [0, 2, 3], replay: true, coefficients: [-1, 0, -1] },
    { rows: [1, 2, 3], replay: true, coefficients: [0, 0, 0] },
  ],
];

// Independent determinant-linear-form derivation from the witnessed matrices.
for (let index = 0; index < DROMOLOGICAL_S3_SCHEDULES.length; index += 1) {
  const schedule = DROMOLOGICAL_S3_SCHEDULES[index];
  const forms = deriveReplayMinorLinearForms(schedule);
  assert.equal(forms.length, 4);

  for (let minorIndex = 0; minorIndex < forms.length; minorIndex += 1) {
    const actual = forms[minorIndex];
    const expected = expectedLinearForms[index][minorIndex];
    assert.deepEqual(actual.rows, expected.rows);
    assert.equal(actual.replay_dependent, expected.replay);
    if (expected.replay) {
      assert.deepEqual(actual.coefficients, expected.coefficients);
      assert.equal(actual.zero_at_replay_origin, true);
    } else {
      assert.equal(actual.constant_determinant, expected.determinant);
    }
  }
}

// Linear-form evaluations must equal exact determinant enumeration, including rows outside the rescue locus.
const evaluationRows = [
  [0, 0, 0],
  DROMOLOGICAL_BASELINE_REPLAY_ROW,
  DROMOLOGICAL_HOSTILE_REPLAY_ROW,
  [2, 0, 0],
  [2, -1, 0],
  [-3, 2, 4],
  [4, -3, -3],
];
for (const replayRow of evaluationRows) {
  for (const schedule of DROMOLOGICAL_S3_SCHEDULES) {
    const forms = deriveReplayMinorLinearForms(schedule);
    const actualMinors = enumerateReplayMinors(schedule, replayRow);
    assert.deepEqual(
      forms.map(form => evaluateReplayMinorLinearForm(form, replayRow)),
      actualMinors.map(minor => minor.determinant),
    );
  }
}

const atlas = dromologicalS3ScheduleAtlasCertificate();
assert.equal(atlas.passed, true);
assert.deepEqual(
  atlas.schedules.filter(row => row.observation_rank === 2).map(row => row.kernel_generator),
  [[1, 1, 0], [1, 1, 0], [1, 0, 1], [1, 0, 1]],
);

// Positive inherited probe, double-null hostile, one-sided hostiles, and rank-vs-unimodular separation.
const baseline = classifyDromologicalReplayRow([1, 0, 0]);
assert.equal(baseline.actual_all_six_rank_three, true);
assert.equal(baseline.actual_all_six_have_unimodular_minor, true);
assert.deepEqual(baseline.missing_direction_pairings.map(row => row.pairing), [1, 1]);
assert.equal(baseline.classification, 'UNIMODULAR_INTEGER_RESCUE');

const doubleNull = classifyDromologicalReplayRow([1, -1, -1]);
assert.deepEqual(doubleNull.missing_direction_pairings.map(row => row.pairing), [0, 0]);
assert.deepEqual(doubleNull.schedules.map(row => row.augmented_rank), [3, 3, 2, 2, 2, 2]);
assert.equal(doubleNull.actual_all_six_rank_three, false);
assert.equal(doubleNull.actual_all_six_have_unimodular_minor, false);

const hOnly = classifyDromologicalReplayRow([1, 0, -1]);
assert.deepEqual(hOnly.missing_direction_pairings.map(row => row.pairing), [1, 0]);
assert.deepEqual(hOnly.schedules.map(row => row.augmented_rank), [3, 3, 3, 3, 2, 2]);
assert.equal(hOnly.actual_all_six_rank_three, false);

const iOnly = classifyDromologicalReplayRow([1, -1, 0]);
assert.deepEqual(iOnly.missing_direction_pairings.map(row => row.pairing), [0, 1]);
assert.deepEqual(iOnly.schedules.map(row => row.augmented_rank), [3, 3, 2, 2, 3, 3]);
assert.equal(iOnly.actual_all_six_rank_three, false);

const rankOnly = classifyDromologicalReplayRow([2, 0, 0]);
assert.deepEqual(rankOnly.missing_direction_pairings.map(row => row.pairing), [2, 2]);
assert.deepEqual(rankOnly.schedules.map(row => row.augmented_rank), [3, 3, 3, 3, 3, 3]);
assert.deepEqual(rankOnly.schedules.map(row => row.has_unimodular_minor), [true, true, false, false, false, false]);
assert.equal(rankOnly.actual_all_six_rank_three, true);
assert.equal(rankOnly.actual_all_six_have_unimodular_minor, false);
assert.equal(rankOnly.classification, 'RANK_THREE_RESCUE_WITHOUT_UNIMODULAR_INTEGER_RESCUE');

const mixed = classifyDromologicalReplayRow([2, -1, 0]);
assert.deepEqual(mixed.missing_direction_pairings.map(row => row.pairing), [1, 2]);
assert.deepEqual(mixed.schedules.map(row => row.augmented_rank), [3, 3, 3, 3, 3, 3]);
assert.deepEqual(mixed.schedules.map(row => row.has_unimodular_minor), [true, true, true, true, false, false]);
assert.equal(mixed.actual_all_six_rank_three, true);
assert.equal(mixed.actual_all_six_have_unimodular_minor, false);

// All four affine families exactly realize unit pairings for every integer t sampled here.
for (const epsH of [-1, 1]) {
  for (const epsI of [-1, 1]) {
    for (let t = -8; t <= 8; t += 1) {
      const replayRow = parameterizeUnimodularReplayRow(t, epsH, epsI);
      assert.equal(dot(replayRow, [1, 1, 0]), epsH);
      assert.equal(dot(replayRow, [1, 0, 1]), epsI);
      const classification = classifyDromologicalReplayRow(replayRow);
      assert.equal(classification.actual_all_six_rank_three, true);
      assert.equal(classification.actual_all_six_have_unimodular_minor, true);
    }
  }
}
assert.throws(() => parameterizeUnimodularReplayRow(0.5, 1, 1), /parameter t must be an integer/);
assert.throws(() => parameterizeUnimodularReplayRow(0, 0, 1), /signs must each be/);

// Generic exact inverse for a non-baseline point on the affine rescue locus.
const nonbaselineExactReplay = parameterizeUnimodularReplayRow(3, -1, 1);
for (const schedule of DROMOLOGICAL_S3_SCHEDULES) {
  for (const state of [[0, 0, 0], [2, -1, 1], [-2, 2, -2], [1, 1, 1]]) {
    const observation = observeReplayAssistedState(state, schedule, nonbaselineExactReplay);
    const recovered = invertReplayLocusObservation(observation, schedule, nonbaselineExactReplay);
    assert.deepEqual(recovered, state);
  }
}
const rankOnlyObservation = observeReplayAssistedState([1, 2, 3], DROMOLOGICAL_S3_SCHEDULES[2], [2, 0, 0]);
assert.throws(
  () => invertReplayLocusObservation(rankOnlyObservation, DROMOLOGICAL_S3_SCHEDULES[2], [2, 0, 0]),
  /does not provide a unimodular minor/,
);

const certificate = dromologicalReplayTransversalityLocusCertificate();
assert.equal(certificate.schema, DROMOLOGICAL_REPLAY_TRANSVERSALITY_LOCUS_SCHEMA);
assert.equal(certificate.parent_receipt, DROMOLOGICAL_REPLAY_TRANSVERSALITY_PARENT_RECEIPT);
assert.equal(certificate.parent_baseline_replay_certificate_passed, true);
assert.deepEqual(certificate.inherited_kernel_directions, [[1, 1, 0], [1, 0, 1]]);
assert.equal(certificate.inherited_kernel_directions_match_witnessed_fixture, true);
assert.equal(certificate.replay_minor_coefficients_align_with_inherited_missing_directions, true);
assert.equal(certificate.rank_rescue_predicate, '(a+b)!=0 AND (a+c)!=0');
assert.equal(certificate.unimodular_rescue_predicate, 'abs(a+b)==1 AND abs(a+c)==1');
assert.equal(
  certificate.unimodular_affine_family,
  '[t, eps_H-t, eps_I-t] with t in Z and eps_H,eps_I in {-1,+1}',
);
assert.equal(certificate.finite_named_hostiles.passed, true);
assert.equal(certificate.finite_replay_cube_audit.checked_replay_rows, 729);
assert.equal(certificate.finite_replay_cube_audit.expected_replay_rows, 729);
assert.equal(certificate.finite_replay_cube_audit.checked_schedule_rows, 4374);
assert.equal(certificate.finite_replay_cube_audit.expected_schedule_rows, 4374);
assert.equal(certificate.finite_replay_cube_audit.checked_minor_determinants, 17496);
assert.equal(certificate.finite_replay_cube_audit.expected_minor_determinants, 17496);
assert.equal(certificate.finite_replay_cube_audit.rank_rescue_row_count, 576);
assert.equal(certificate.finite_replay_cube_audit.unimodular_rescue_row_count, 30);
assert.equal(certificate.finite_replay_cube_audit.exact, true);
assert.equal(
  certificate.finite_affine_family_reconstruction_certificate.sampled_affine_family_rows_with_multiplicity,
  28,
);
assert.equal(
  certificate.finite_affine_family_reconstruction_certificate.distinct_sampled_replay_rows,
  28,
);
assert.equal(
  certificate.finite_affine_family_reconstruction_certificate.checked_state_schedule_reconstructions,
  21000,
);
assert.equal(certificate.finite_affine_family_reconstruction_certificate.exact, true);
assert.equal(certificate.replay_removal_preserves_historical_rank_profile, true);
assert.equal(certificate.schedule_identity_already_exact_at_prefix_two, true);
assert.equal(certificate.passed, true);
assert.equal(
  certificate.rank_classification,
  'THE_FIXED_S3_REPLAY_RANK_RESCUE_LOCUS_IS_EXACTLY_THE_COMPLEMENT_OF_THE_TWO_KERNEL_ORTHOGONALITY_PLANES_A_PLUS_B_EQUALS_ZERO_AND_A_PLUS_C_EQUALS_ZERO',
);
assert.equal(
  certificate.unimodular_classification,
  'THE_FIXED_S3_UNIMODULAR_REPLAY_RESCUE_LOCUS_IS_EXACTLY_THE_UNION_OF_FOUR_AFFINE_INTEGER_LINES_DEFINED_BY_UNIT_PAIRING_WITH_BOTH_WITNESSED_MISSING_DIRECTIONS',
);
assert.equal(
  certificate.architectural_law,
  'IN_THE_FIXED_S3_FIXTURE_NONZERO_TRANSVERSALITY_TO_EACH_MISSING_DIRECTION_IS_NECESSARY_AND_SUFFICIENT_FOR_RANK_RESCUE_WHILE_UNIT_TRANSVERSALITY_IS_NECESSARY_AND_SUFFICIENT_FOR_UNIMODULAR_INTEGER_RESCUE',
);

// Parent historical facts remain untouched and schedule identity remains separate.
const parent = dromologicalBaselineReplayRescueCertificate();
assert.equal(parent.passed, true);
assert.deepEqual(parent.original_rank_profile, [3, 3, 2, 2, 2, 2]);
const lag = dromologicalScheduleStateIdentifiabilityLagCertificate();
assert.equal(lag.passed, true);
assert.equal(lag.minimal_schedule_identification_prefix, 2);
assert.equal(lag.strict_schedule_before_state_lag_on_both_p_first_schedules, true);

// Receiver discipline and custody invariance.
const ash = compileDromologicalReplayTransversalityProjection(AIA_RECEIVERS.ASH);
const loom = compileDromologicalReplayTransversalityProjection(AIA_RECEIVERS.LOOM);
assert.deepEqual(ash.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(loom.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(ash.authority, loom.authority);
assert.equal(Object.values(ash.authority).some(Boolean), false);
assert.equal(Object.values(loom.authority).some(Boolean), false);
assert.deepEqual(ash.payload.truths, [
  'SOME_EXTRA_CHECKS_MISS_THE_MISSING_CLUE',
  'SOME_EXTRA_CHECKS_SEE_IT_BUT_NOT_WITH_AN_EXACT_INTEGER_KEY',
  'FOUR_SIMPLE_FAMILIES_OF_CHECKS_GIVE_AN_EXACT_INTEGER_KEY_IN_THIS_FIXTURE',
  'THE_OLD_MISSING_CLUE_REMAINS_A_TRUE_FACT_ABOUT_THE_OLD_RECORD',
]);
for (const key of [
  'replay_vectors_exposed',
  'affine_family_equations_exposed',
  'determinant_coefficients_exposed',
  'kernel_vectors_exposed',
  'inverse_formulas_exposed',
  'latent_coordinates_exposed',
]) {
  assert.equal(ash.payload[key], false);
}
assert.deepEqual(loom.payload.kernel_directions, [[1, 1, 0], [1, 0, 1]]);
assert.equal(loom.payload.rank_rescue_predicate, '(a+b)!=0 AND (a+c)!=0');
assert.equal(loom.payload.unimodular_rescue_predicate, 'abs(a+b)==1 AND abs(a+c)==1');
assert.equal(rejectDromologicalReplayTransversalityOverreach(ash).accepted, true);
assert.equal(rejectDromologicalReplayTransversalityOverreach(loom).accepted, true);

assert.equal(
  rejectDromologicalReplayTransversalityOverreach({
    ...loom,
    authority: { ...loom.authority, inverse: true },
  }).accepted,
  false,
);
assert.equal(
  rejectDromologicalReplayTransversalityOverreach({
    ...loom,
    runtime_binding: true,
  }).accepted,
  false,
);
for (const key of [
  'universal_replay_theorem',
  'universal_sensor_design',
  'optimal_sensor_theorem',
  'asymptotic_recovery_theorem',
  'physical_sensor_manifold',
  'continuum_tomography',
  'physical_holonomy',
  'physical_quasicrystal',
  'semantic_causation',
  'operational_inverse_route',
]) {
  assert.equal(
    rejectDromologicalReplayTransversalityOverreach({
      ...loom,
      claim_ceiling: { ...loom.claim_ceiling, [key]: true },
    }).accepted,
    false,
  );
}
assert.equal(
  rejectDromologicalReplayTransversalityOverreach({
    ...ash,
    payload: { ...ash.payload, determinant_coefficients_exposed: true },
  }).accepted,
  false,
);
assert.throws(
  () => compileDromologicalReplayTransversalityProjection('UNDECLARED_RECEIVER'),
  /undeclared AIA receiver/,
);

assert.deepEqual(certificate.scars, [
  'RANK_RESCUE != UNIMODULAR_INTEGER_RESCUE',
  'NONZERO_KERNEL_PAIRING != UNIT_KERNEL_PAIRING',
  'REPLAY_TRANSVERSALITY_IN_THIS_FIXTURE != UNIVERSAL_SENSOR_DESIGN',
  'AFFINE_RESCUE_LOCUS != PHYSICAL_SENSOR_MANIFOLD',
  'INTEGER_PARAMETRIC_CLASSIFICATION != ASYMPTOTIC_RECOVERY_THEOREM',
  'PROBE_FAMILY != OPERATIONAL_INVERSE_ROUTE',
  'MISSING_DIRECTION_PAIRING != SEMANTIC_CAUSATION',
  'EXACT_RESCUE_LOCUS != RETROACTIVE_INFORMATION_EXISTENCE',
  'REPAIRED_IDENTIFIABILITY != ERASURE_OF_PRIOR_NONIDENTIFIABILITY',
]);

console.log('Ash A15-R0 dromological replay transversality / unimodular-locus hostile tests passed.');
