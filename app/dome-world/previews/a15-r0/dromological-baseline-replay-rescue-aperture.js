import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
  phasonicObservationMatrix,
  observePhasonicState,
} from './phasonic-supermoire-dromological-tomography.js';
import {
  DROMOLOGICAL_S3_SCHEDULES,
  dromologicalS3ScheduleAtlasCertificate,
} from './dromological-s3-schedule-atlas-first-stratum-gate.js';
import {
  DROMOLOGICAL_SCHEDULE_STATE_LAG_SCHEMA,
  dromologicalScheduleStateIdentifiabilityLagCertificate,
} from './dromological-schedule-state-identifiability-lag.js';

export const DROMOLOGICAL_BASELINE_REPLAY_RESCUE_SCHEMA =
  'td613.dome-world.dromological-baseline-replay-rescue-aperture/v0.1';
export const DROMOLOGICAL_BASELINE_REPLAY_RESCUE_PARENT_RECEIPT =
  'a51afae88292878de2c02ca0a086ad1e88f73cfb';

export const DROMOLOGICAL_BASELINE_REPLAY_ROW = Object.freeze([1, 0, 0]);
export const DROMOLOGICAL_HOSTILE_REPLAY_ROW = Object.freeze([1, -1, -1]);

const AUTHORITY_KEYS = Object.freeze([
  'inverse',
  'encoder',
  'custody_mutation',
  'release',
  'production',
  'physical_claim',
  'continuum_claim',
]);

const PREREGISTERED_MINOR_TARGETS = Object.freeze({
  'P-H-I': Object.freeze({ rows: Object.freeze([0, 1, 2]), determinant: 1 }),
  'P-I-H': Object.freeze({ rows: Object.freeze([0, 1, 2]), determinant: -1 }),
  'H-P-I': Object.freeze({ rows: Object.freeze([0, 2, 3]), determinant: 1 }),
  'H-I-P': Object.freeze({ rows: Object.freeze([0, 1, 3]), determinant: 1 }),
  'I-P-H': Object.freeze({ rows: Object.freeze([0, 2, 3]), determinant: -1 }),
  'I-H-P': Object.freeze({ rows: Object.freeze([0, 1, 3]), determinant: -1 }),
});

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function zeroAuthority() {
  return freeze(Object.fromEntries(AUTHORITY_KEYS.map(key => [key, false])));
}

function assertIntegerVector(vector, length, label) {
  if (!Array.isArray(vector) || vector.length !== length || !vector.every(Number.isInteger)) {
    throw new Error(`${label} must be an integer vector of length ${length}`);
  }
}

function scheduleId(schedule) {
  const letters = {
    PHI_PAIR_WIRE: 'P',
    HEXAGONAL_MOIRE: 'H',
    ICOSAHEDRAL_PHASON: 'I',
  };
  return schedule.map(stratum => letters[stratum]).join('-');
}

function determinant3(matrix) {
  const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
  return a * (e * i - f * h)
    - b * (d * i - f * g)
    + c * (d * h - e * g);
}

function rankRows(rows) {
  if (!Array.isArray(rows) || rows.length < 1 || rows.some(row => !Array.isArray(row) || row.length !== 3)) {
    throw new Error('rankRows expects one or more three-coordinate rows');
  }
  const triples = tripleRowIndexSets(rows.length);
  if (triples.some(indices => determinant3(indices.map(index => rows[index])) !== 0)) return 3;

  for (let r1 = 0; r1 < rows.length; r1 += 1) {
    for (let r2 = r1 + 1; r2 < rows.length; r2 += 1) {
      for (let c1 = 0; c1 < 3; c1 += 1) {
        for (let c2 = c1 + 1; c2 < 3; c2 += 1) {
          if (rows[r1][c1] * rows[r2][c2] - rows[r1][c2] * rows[r2][c1] !== 0) return 2;
        }
      }
    }
  }
  return rows.some(row => row.some(value => value !== 0)) ? 1 : 0;
}

function tripleRowIndexSets(rowCount) {
  const triples = [];
  for (let a = 0; a < rowCount; a += 1) {
    for (let b = a + 1; b < rowCount; b += 1) {
      for (let c = b + 1; c < rowCount; c += 1) {
        triples.push(freeze([a, b, c]));
      }
    }
  }
  return freeze(triples);
}

function dot(row, vector) {
  return row.reduce((sum, value, index) => sum + value * vector[index], 0);
}

function matrixTimesVector(matrix, vector) {
  return matrix.map(row => dot(row, vector));
}

function inverseUnimodular3(matrix, observation) {
  assertIntegerVector(observation, 3, 'selected replay observation');
  const det = determinant3(matrix);
  if (Math.abs(det) !== 1) {
    throw new Error('selected replay minor must be exactly unimodular over Z');
  }

  const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
  const adjugate = [
    [e * i - f * h, c * h - b * i, b * f - c * e],
    [f * g - d * i, a * i - c * g, c * d - a * f],
    [d * h - e * g, b * g - a * h, a * e - b * d],
  ];
  const numerator = matrixTimesVector(adjugate, observation);
  const recovered = numerator.map((value) => {
    const coordinate = value / det;
    return coordinate === 0 ? 0 : coordinate;
  });
  if (!recovered.every(Number.isInteger)) {
    throw new Error('unimodular replay inverse produced a noninteger coordinate');
  }
  return freeze(recovered);
}

export function buildReplayAugmentedObservationMatrix(
  schedule,
  replayRow = DROMOLOGICAL_BASELINE_REPLAY_ROW,
) {
  assertIntegerVector(replayRow, 3, 'replay row');
  const original = phasonicObservationMatrix(schedule);
  return freeze([
    ...original.map(row => freeze([...row])),
    freeze([...replayRow]),
  ]);
}

export function enumerateReplayMinors(
  schedule,
  replayRow = DROMOLOGICAL_BASELINE_REPLAY_ROW,
) {
  const matrix = buildReplayAugmentedObservationMatrix(schedule, replayRow);
  return freeze(tripleRowIndexSets(matrix.length).map((rows) => {
    const minor = rows.map(index => matrix[index]);
    return freeze({
      rows,
      determinant: determinant3(minor),
    });
  }));
}

function derivedSelectedMinor(schedule, replayRow = DROMOLOGICAL_BASELINE_REPLAY_ROW) {
  const matrix = buildReplayAugmentedObservationMatrix(schedule, replayRow);
  const candidate = enumerateReplayMinors(schedule, replayRow)
    .find(minor => Math.abs(minor.determinant) === 1);
  if (!candidate) return null;
  return freeze({
    rows: candidate.rows,
    determinant: candidate.determinant,
    matrix: freeze(candidate.rows.map(index => freeze([...matrix[index]]))),
  });
}

export function observeReplayAssistedState(
  state,
  schedule,
  replayRow = DROMOLOGICAL_BASELINE_REPLAY_ROW,
) {
  assertIntegerVector(state, 3, 'latent state');
  assertIntegerVector(replayRow, 3, 'replay row');
  const originalObservation = observePhasonicState(state, schedule);
  return freeze([
    ...originalObservation,
    dot(replayRow, state),
  ]);
}

export function invertBaselineReplayObservation(observation, schedule) {
  assertIntegerVector(observation, 4, 'replay-assisted observation');
  const selected = derivedSelectedMinor(schedule, DROMOLOGICAL_BASELINE_REPLAY_ROW);
  if (!selected) {
    throw new Error('baseline replay did not yield a unimodular schedule-indexed minor');
  }
  const selectedObservation = selected.rows.map(index => observation[index]);
  return inverseUnimodular3(selected.matrix, selectedObservation);
}

function replayRowForSchedule(schedule) {
  const id = scheduleId(schedule);
  const original = phasonicObservationMatrix(schedule);
  const augmented = buildReplayAugmentedObservationMatrix(schedule);
  const minors = enumerateReplayMinors(schedule);
  const selected = derivedSelectedMinor(schedule);
  const preregistered = PREREGISTERED_MINOR_TARGETS[id];
  return freeze({
    schedule: freeze([...schedule]),
    schedule_id: id,
    original_observation_matrix: original,
    original_rank: rankRows(original),
    augmented_observation_matrix: augmented,
    augmented_rank: rankRows(augmented),
    all_three_row_minors: minors,
    selected_unimodular_minor: selected,
    preregistered_minor_target: preregistered,
    preregistered_target_independently_rederived: selected !== null
      && same(selected.rows, preregistered.rows)
      && selected.determinant === preregistered.determinant,
  });
}

function finiteReplayReconstructionCertificate(rows) {
  let checked = 0;
  let exact = true;
  for (const row of rows) {
    for (let x1 = -2; x1 <= 2; x1 += 1) {
      for (let x2 = -2; x2 <= 2; x2 += 1) {
        for (let x3 = -2; x3 <= 2; x3 += 1) {
          const state = [x1, x2, x3];
          const observation = observeReplayAssistedState(state, row.schedule);
          const recovered = invertBaselineReplayObservation(observation, row.schedule);
          checked += 1;
          if (!same(state, recovered)) exact = false;
        }
      }
    }
  }
  return freeze({
    checked_state_schedule_pairs: checked,
    expected_state_schedule_pairs: 750,
    exact: exact && checked === 750,
  });
}

function hostileReplayCertificate() {
  const atlas = dromologicalS3ScheduleAtlasCertificate();
  const rows = DROMOLOGICAL_S3_SCHEDULES.map((schedule) => {
    const augmented = buildReplayAugmentedObservationMatrix(schedule, DROMOLOGICAL_HOSTILE_REPLAY_ROW);
    return freeze({
      schedule_id: scheduleId(schedule),
      augmented_rank: rankRows(augmented),
      unimodular_minor_count: enumerateReplayMinors(schedule, DROMOLOGICAL_HOSTILE_REPLAY_ROW)
        .filter(minor => Math.abs(minor.determinant) === 1).length,
    });
  });
  const missingDirections = atlas.schedules
    .filter(row => row.kernel_generator !== null)
    .map(row => freeze({
      schedule_id: row.schedule_id,
      kernel_generator: row.kernel_generator,
      hostile_replay_pairing: dot(DROMOLOGICAL_HOSTILE_REPLAY_ROW, row.kernel_generator),
    }));
  const fourHistoricalFailuresPersist = rows.slice(2).every(row => (
    row.augmented_rank === 2 && row.unimodular_minor_count === 0
  ));
  return freeze({
    replay_row: DROMOLOGICAL_HOSTILE_REPLAY_ROW,
    rows: freeze(rows),
    missing_direction_pairings: freeze(missingDirections),
    hostile_row_orthogonal_to_all_witnessed_missing_directions:
      missingDirections.every(row => row.hostile_replay_pairing === 0),
    fails_to_rescue_all_six: fourHistoricalFailuresPersist,
    four_historical_rank_two_schedules_remain_rank_two: fourHistoricalFailuresPersist,
  });
}

export function dromologicalBaselineReplayRescueCertificate() {
  const lag = dromologicalScheduleStateIdentifiabilityLagCertificate();
  const rows = freeze(DROMOLOGICAL_S3_SCHEDULES.map(replayRowForSchedule));
  const finite = finiteReplayReconstructionCertificate(rows);
  const hostile = hostileReplayCertificate();

  const originalRanks = rows.map(row => row.original_rank);
  const augmentedRanks = rows.map(row => row.augmented_rank);
  const originalInvertibleIds = rows.filter(row => row.original_rank === 3).map(row => row.schedule_id);
  const allSixRescued = rows.every(row => (
    row.augmented_rank === 3
    && row.selected_unimodular_minor !== null
    && Math.abs(row.selected_unimodular_minor.determinant) === 1
  ));
  const preregistrationSurvives = rows.every(row => row.preregistered_target_independently_rederived);
  const originalCertificatePreserved = same(originalRanks, [3, 3, 2, 2, 2, 2])
    && same(originalInvertibleIds, ['P-H-I', 'P-I-H']);
  const scheduleIdentitySeparate = lag.passed
    && lag.minimal_schedule_identification_prefix === 2;

  const passed = DROMOLOGICAL_SCHEDULE_STATE_LAG_SCHEMA
      === 'td613.dome-world.dromological-schedule-state-identifiability-lag/v0.1'
    && lag.passed
    && scheduleIdentitySeparate
    && originalCertificatePreserved
    && same(augmentedRanks, [3, 3, 3, 3, 3, 3])
    && allSixRescued
    && preregistrationSurvives
    && finite.exact
    && hostile.hostile_row_orthogonal_to_all_witnessed_missing_directions
    && hostile.fails_to_rescue_all_six;

  return freeze({
    schema: DROMOLOGICAL_BASELINE_REPLAY_RESCUE_SCHEMA,
    parent_receipt: DROMOLOGICAL_BASELINE_REPLAY_RESCUE_PARENT_RECEIPT,
    replay_row: DROMOLOGICAL_BASELINE_REPLAY_ROW,
    schedules: rows,
    original_rank_profile: freeze(originalRanks),
    augmented_rank_profile: freeze(augmentedRanks),
    original_invertible_schedule_ids: freeze(originalInvertibleIds),
    all_six_augmented_schedules_have_unimodular_minor: allSixRescued,
    preregistered_minor_targets_independently_rederived: preregistrationSurvives,
    finite_reconstruction_certificate: finite,
    replay_removal_reproduces_witnessed_original_result: originalCertificatePreserved,
    schedule_identity_already_exact_at_prefix_two: scheduleIdentitySeparate,
    schedule_identity_remains_separate_from_latent_state_identity: scheduleIdentitySeparate,
    hostile_replay_certificate: hostile,
    passed,
    classification: passed
      ? 'THE_DECLARED_BASELINE_REPLAY_OBSERVATION_RESTORES_A_UNIMODULAR_INTEGER_TOMOGRAPHY_MINOR_FOR_ALL_SIX_DROMOLOGICAL_SCHEDULES_IN_THE_FIXED_S3_FIXTURE'
      : 'DROMOLOGICAL_BASELINE_REPLAY_RESCUE_NOT_ESTABLISHED',
    architectural_law: passed
      ? 'IDENTIFIABILITY_LOSS_CAN_BE_REPAIRED_BY_A_LATER_DECLARED_PROBE_WITHOUT_REWRITING_THE_EARLIER_NONIDENTIFIABILITY_CERTIFICATE'
      : 'LATER_DECLARED_PROBE_REPAIR_NOT_ESTABLISHED',
    scars: freeze([
      'RESCUE_PROBE != ORIGINAL_SCHEDULE_INVERTIBILITY',
      'LATER_REMEASUREMENT != RETROACTIVE_INFORMATION_EXISTENCE',
      'REPAIRED_IDENTIFIABILITY != ERASURE_OF_PRIOR_NONIDENTIFIABILITY',
      'BASELINE_REPLAY != OPERATIONAL_INVERSE_ROUTE',
      'EXTRA_OBSERVATION != UNIVERSAL_SENSOR_DESIGN',
      'FINITE_RESCUE_CERTIFICATE != ASYMPTOTIC_RECOVERY_THEOREM',
    ]),
  });
}

export function compileDromologicalBaselineReplayRescueProjection(receiver) {
  const certificate = dromologicalBaselineReplayRescueCertificate();
  if (!certificate.passed) throw new Error('cannot project uncertified baseline-replay rescue chamber');

  let payload;
  if (receiver === AIA_RECEIVERS.ASH) {
    payload = freeze({
      payload_schema: 'td613.dome-world.baseline-replay-rescue-child-legible/v0.1',
      truths: freeze([
        'WE_KNOW_WHICH_ORDER_HAPPENED_BEFORE_THE_RESCUE',
        'ONE_EXTRA_DECLARED_CHECK_CAN_RECOVER_THE_MISSING_CLUE_IN_THIS_FIXTURE',
        'THE_EARLIER_MISSING_CLUE_WAS_REAL_AT_THE_EARLIER_STAGE',
      ]),
      replay_vector_exposed: false,
      technical_matrices_exposed: false,
      selected_minor_indices_exposed: false,
      inverse_formulas_exposed: false,
      latent_phason_state_exposed: false,
    });
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    payload = freeze({
      payload_schema: 'td613.dome-world.baseline-replay-rescue-loom-technical/v0.1',
      replay_atlas: certificate.schedules,
      finite_reconstruction_certificate: certificate.finite_reconstruction_certificate,
      original_rank_profile: certificate.original_rank_profile,
      augmented_rank_profile: certificate.augmented_rank_profile,
      hostile_replay_certificate: certificate.hostile_replay_certificate,
    });
  } else {
    throw new Error(`undeclared AIA receiver for baseline-replay rescue: ${receiver}`);
  }

  return freeze({
    schema: DROMOLOGICAL_BASELINE_REPLAY_RESCUE_SCHEMA,
    receiver,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    payload,
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
    claim_ceiling: freeze({
      bounded_fixture_replay_rescue: true,
      universal_replay_theorem: false,
      universal_first_stratum_theorem: false,
      universal_sensor_design: false,
      asymptotic_recovery_theorem: false,
      continuum_tomography: false,
      physical_holonomy: false,
      physical_quasicrystal: false,
      operational_inverse_route: false,
      live_runtime: false,
      production: false,
    }),
  });
}

export function rejectDromologicalBaselineReplayRescueOverreach(candidate) {
  const authorityWidened = Object.values(candidate?.authority ?? {}).some(Boolean);
  const runtime = candidate?.runtime_binding === true;
  const ceiling = candidate?.claim_ceiling ?? {};
  const universal = ceiling.universal_replay_theorem === true
    || ceiling.universal_first_stratum_theorem === true
    || ceiling.universal_sensor_design === true
    || ceiling.asymptotic_recovery_theorem === true;
  const continuum = ceiling.continuum_tomography === true;
  const physical = ceiling.physical_holonomy === true || ceiling.physical_quasicrystal === true;
  const operationalInverse = ceiling.operational_inverse_route === true;
  const ashTechnicalLeak = candidate?.receiver === AIA_RECEIVERS.ASH && (
    candidate?.payload?.replay_vector_exposed === true
    || candidate?.payload?.technical_matrices_exposed === true
    || candidate?.payload?.selected_minor_indices_exposed === true
    || candidate?.payload?.inverse_formulas_exposed === true
    || candidate?.payload?.latent_phason_state_exposed === true
  );
  const accepted = !authorityWidened
    && !runtime
    && !universal
    && !continuum
    && !physical
    && !operationalInverse
    && !ashTechnicalLeak;

  return freeze({
    accepted,
    authority_widened: authorityWidened,
    runtime_binding_attempted: runtime,
    universal_claim_attempted: universal,
    continuum_claim_attempted: continuum,
    physical_claim_attempted: physical,
    operational_inverse_route_attempted: operationalInverse,
    ash_technical_leak_attempted: ashTechnicalLeak,
  });
}
