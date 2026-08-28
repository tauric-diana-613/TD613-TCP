import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_SUPERMOIRE_DROMOLOGICAL_TOMOGRAPHY_SCHEMA,
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
  PHASONIC_OBSERVATION_APERTURE,
  phasonicObservationMatrix,
  phasonicFormalHolonomy,
  observePhasonicState,
} from './phasonic-supermoire-dromological-tomography.js';

export const DROMOLOGICAL_S3_SCHEDULE_ATLAS_SCHEMA =
  'td613.dome-world.dromological-s3-schedule-atlas-first-stratum-gate/v0.1';
export const DROMOLOGICAL_S3_SCHEDULE_ATLAS_PARENT_RECEIPT =
  '40dfba93d2577bceba0f66022ac5f42934cdbd06';

const P = 'PHI_PAIR_WIRE';
const H = 'HEXAGONAL_MOIRE';
const I = 'ICOSAHEDRAL_PHASON';

export const DROMOLOGICAL_S3_SCHEDULES = Object.freeze([
  Object.freeze([P, H, I]),
  Object.freeze([P, I, H]),
  Object.freeze([H, P, I]),
  Object.freeze([H, I, P]),
  Object.freeze([I, P, H]),
  Object.freeze([I, H, P]),
]);

const AUTHORITY_KEYS = Object.freeze([
  'inverse',
  'encoder',
  'custody_mutation',
  'release',
  'production',
  'physical_claim',
  'continuum_claim',
]);

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

function determinant3(matrix) {
  const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
  return a * (e * i - f * h)
    - b * (d * i - f * g)
    + c * (d * h - e * g);
}

function rank3(matrix) {
  const determinant = determinant3(matrix);
  if (determinant !== 0) return 3;

  for (let r1 = 0; r1 < 3; r1 += 1) {
    for (let r2 = r1 + 1; r2 < 3; r2 += 1) {
      for (let c1 = 0; c1 < 3; c1 += 1) {
        for (let c2 = c1 + 1; c2 < 3; c2 += 1) {
          const minor = matrix[r1][c1] * matrix[r2][c2]
            - matrix[r1][c2] * matrix[r2][c1];
          if (minor !== 0) return 2;
        }
      }
    }
  }

  return matrix.some(row => row.some(value => value !== 0)) ? 1 : 0;
}

function matrixTimesVector(matrix, vector) {
  return matrix.map(row => row.reduce((sum, value, index) => sum + value * vector[index], 0));
}

function scheduleId(schedule) {
  return schedule.map(id => ({
    [P]: 'P',
    [H]: 'H',
    [I]: 'I',
  }[id])).join('-');
}

function kernelGeneratorFor(schedule) {
  if (schedule[0] === H) return freeze([1, 1, 0]);
  if (schedule[0] === I) return freeze([1, 0, 1]);
  return null;
}

function exactInverseFor(schedule, observation) {
  if (!Array.isArray(observation) || observation.length !== 3 || !observation.every(Number.isInteger)) {
    throw new Error('S3 schedule observation must be an integer vector of length 3');
  }
  const [m1, m2, m3] = observation;
  if (same(schedule, DROMOLOGICAL_S3_SCHEDULES[0])) {
    return freeze([m1, 2 * m1 - m2, m2 - m3]);
  }
  if (same(schedule, DROMOLOGICAL_S3_SCHEDULES[1])) {
    return freeze([m1, m1 + m2 - m3, m1 - m2]);
  }
  throw new Error('bounded schedule inverse is authorized only for the two preregistered unimodular P-first schedules');
}

export function invertDromologicalScheduleObservation(observation, schedule) {
  const matrix = phasonicObservationMatrix(schedule);
  if (Math.abs(determinant3(matrix)) !== 1 || schedule[0] !== P) {
    throw new Error('schedule is nonidentifiable in the declared fixed-aperture fixture');
  }
  return exactInverseFor(schedule, observation);
}

function scheduleRow(schedule) {
  const observationMatrix = phasonicObservationMatrix(schedule);
  const determinant = determinant3(observationMatrix);
  const rank = rank3(observationMatrix);
  const kernelGenerator = kernelGeneratorFor(schedule);
  const nullObservation = kernelGenerator
    ? freeze(matrixTimesVector(observationMatrix, kernelGenerator))
    : null;
  const invertible = Math.abs(determinant) === 1 && rank === 3;
  return freeze({
    schedule: freeze([...schedule]),
    schedule_id: scheduleId(schedule),
    first_stratum: schedule[0],
    observation_matrix: observationMatrix,
    observation_determinant: determinant,
    observation_rank: rank,
    tomography_status: invertible ? 'EXACT_UNIMODULAR' : 'NONIDENTIFIABLE_RANK_TWO',
    kernel_generator: kernelGenerator,
    kernel_generator_maps_to_zero: kernelGenerator
      ? nullObservation.every(value => value === 0)
      : null,
    terminal_formal_holonomy: phasonicFormalHolonomy(schedule),
  });
}

function equivalenceClasses(rows, selector) {
  const classes = new Map();
  rows.forEach((row, index) => {
    const key = JSON.stringify(selector(row));
    if (!classes.has(key)) classes.set(key, []);
    classes.get(key).push(index);
  });
  return freeze([...classes.values()].map(group => freeze([...group])));
}

function finiteInverseCertificate(rows) {
  let checked = 0;
  let passed = true;
  for (const row of rows.filter(candidate => candidate.tomography_status === 'EXACT_UNIMODULAR')) {
    for (let x1 = -2; x1 <= 2; x1 += 1) {
      for (let x2 = -2; x2 <= 2; x2 += 1) {
        for (let x3 = -2; x3 <= 2; x3 += 1) {
          const state = [x1, x2, x3];
          const observation = observePhasonicState(state, row.schedule);
          const recovered = invertDromologicalScheduleObservation(observation, row.schedule);
          checked += 1;
          if (!same(recovered, state)) passed = false;
        }
      }
    }
  }
  return freeze({
    checked_state_schedule_pairs: checked,
    expected_state_schedule_pairs: 250,
    exact: passed && checked === 250,
  });
}

export function dromologicalS3ScheduleAtlasCertificate() {
  const rows = freeze(DROMOLOGICAL_S3_SCHEDULES.map(scheduleRow));
  const invertibleRows = rows.filter(row => row.tomography_status === 'EXACT_UNIMODULAR');
  const nonidentifiableRows = rows.filter(row => row.tomography_status === 'NONIDENTIFIABLE_RANK_TWO');
  const observationClasses = equivalenceClasses(rows, row => row.observation_matrix);
  const holonomyClasses = equivalenceClasses(rows, row => row.terminal_formal_holonomy);
  const inverseCertificate = finiteInverseCertificate(rows);

  const firstStratumGateExact = rows.every(row => (
    (row.first_stratum === P) === (row.tomography_status === 'EXACT_UNIMODULAR')
  ));
  const allRankTwoKernelsValid = nonidentifiableRows.every(row => (
    row.observation_rank === 2
    && row.kernel_generator_maps_to_zero === true
  ));
  const observationHistoryInjective = observationClasses.length === 6
    && observationClasses.every(group => group.length === 1);
  const terminalHolonomyNoninjective = holonomyClasses.length === 4
    && holonomyClasses.some(group => group.length > 1);

  const expectedDeterminants = [1, -1, 0, 0, 0, 0];
  const expectedRanks = [3, 3, 2, 2, 2, 2];
  const exactAtlas = rows.every((row, index) => (
    row.observation_determinant === expectedDeterminants[index]
    && row.observation_rank === expectedRanks[index]
  ));

  const passed = rows.length === 6
    && exactAtlas
    && invertibleRows.length === 2
    && nonidentifiableRows.length === 4
    && firstStratumGateExact
    && allRankTwoKernelsValid
    && inverseCertificate.exact
    && observationHistoryInjective
    && terminalHolonomyNoninjective;

  return freeze({
    schema: DROMOLOGICAL_S3_SCHEDULE_ATLAS_SCHEMA,
    parent_receipt: DROMOLOGICAL_S3_SCHEDULE_ATLAS_PARENT_RECEIPT,
    parent_schema: PHASONIC_SUPERMOIRE_DROMOLOGICAL_TOMOGRAPHY_SCHEMA,
    observation_aperture: PHASONIC_OBSERVATION_APERTURE,
    schedules: rows,
    schedule_count: rows.length,
    invertible_schedule_ids: freeze(invertibleRows.map(row => row.schedule_id)),
    nonidentifiable_schedule_ids: freeze(nonidentifiableRows.map(row => row.schedule_id)),
    invertible_schedule_count: invertibleRows.length,
    nonidentifiable_schedule_count: nonidentifiableRows.length,
    first_stratum_gate_exact: firstStratumGateExact,
    inverse_finite_cube_certificate: inverseCertificate,
    observation_history_equivalence_classes: observationClasses,
    observation_history_class_count: observationClasses.length,
    terminal_holonomy_equivalence_classes: holonomyClasses,
    terminal_holonomy_class_count: holonomyClasses.length,
    observation_history_injective_over_s3: observationHistoryInjective,
    terminal_formal_holonomy_injective_over_s3: !terminalHolonomyNoninjective,
    passed,
    classification: passed
      ? 'THE_COMPLETE_S3_DROMOLOGICAL_SCHEDULE_ATLAS_SPLITS_EXACTLY_BY_FIRST_ADMITTED_STRATUM_WITH_PHI_FIRST_IFF_UNIMODULARLY_INVERTIBLE_IN_THE_DECLARED_FIXTURE'
      : 'COMPLETE_S3_FIRST_STRATUM_GATE_NOT_ESTABLISHED',
    memory_classification: passed
      ? 'THE_REGISTERED_OBSERVATION_HISTORY_DISTINGUISHES_ALL_SIX_TEMPORAL_SCHEDULES_WHILE_TERMINAL_FORMAL_HOLONOMY_COLLAPSES_THEM_TO_FOUR_CLASSES'
      : 'DROMOLOGICAL_MEMORY_SEPARATION_NOT_ESTABLISHED',
    scars: freeze([
      'FIRST_STRATUM_GATE != UNIVERSAL_CAUSAL_PRIORITY',
      'SAME_TERMINAL_HOLONOMY != SAME_TEMPORAL_HISTORY',
      'TERMINAL_FORMAL_HOLONOMY != COMPLETE_DROMOLOGICAL_MEMORY',
      'OBSERVATION_HISTORY_INJECTIVITY != UNIVERSAL_TOMOGRAPHIC_IDENTIFIABILITY',
    ]),
  });
}

export function compileDromologicalS3ScheduleAtlasProjection(receiver) {
  const atlas = dromologicalS3ScheduleAtlasCertificate();
  if (!atlas.passed) throw new Error('cannot project an uncertified dromological S3 atlas');

  let payload;
  if (receiver === AIA_RECEIVERS.ASH) {
    payload = freeze({
      payload_schema: 'td613.dome-world.dromological-s3-child-legible/v0.1',
      truths: freeze([
        'FIRST_LAYER_CHANGES_WHAT_CAN_BE_RECOVERED',
        'TWO_ORDERS_KEEP_ALL_THREE_CLUES',
        'FOUR_ORDERS_LOSE_ONE_CLUE',
        'THE_LAST_PATTERN_DOES_NOT_REMEMBER_EVERY_STEP',
      ]),
      technical_matrices_exposed: false,
      kernel_vectors_exposed: false,
      inverse_formulas_exposed: false,
      latent_phason_state_exposed: false,
    });
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    payload = freeze({
      payload_schema: 'td613.dome-world.dromological-s3-loom-technical/v0.1',
      schedule_atlas: atlas.schedules,
      observation_history_equivalence_classes: atlas.observation_history_equivalence_classes,
      terminal_holonomy_equivalence_classes: atlas.terminal_holonomy_equivalence_classes,
      bounded_inverse_schedule_ids: atlas.invertible_schedule_ids,
    });
  } else {
    throw new Error(`undeclared AIA receiver for dromological S3 atlas: ${receiver}`);
  }

  return freeze({
    schema: DROMOLOGICAL_S3_SCHEDULE_ATLAS_SCHEMA,
    receiver,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    payload,
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
    claim_ceiling: freeze({
      bounded_s3_schedule_atlas: true,
      fixture_specific_first_stratum_gate: true,
      continuum_inverse: false,
      physical_holonomy: false,
      physical_quasicrystal: false,
      live_runtime: false,
      production: false,
    }),
  });
}

export function rejectDromologicalS3AtlasOverreach(candidate) {
  const authorityWidened = Object.values(candidate?.authority ?? {}).some(Boolean);
  const runtime = candidate?.runtime_binding === true;
  const physical = candidate?.claim_ceiling?.physical_holonomy === true
    || candidate?.claim_ceiling?.physical_quasicrystal === true;
  const continuum = candidate?.claim_ceiling?.continuum_inverse === true;
  const universalGate = candidate?.claim_ceiling?.universal_first_stratum_gate === true;
  const accepted = !authorityWidened && !runtime && !physical && !continuum && !universalGate;
  return freeze({
    accepted,
    authority_widened: authorityWidened,
    runtime_binding_attempted: runtime,
    physical_claim_attempted: physical,
    continuum_inverse_claimed: continuum,
    universal_first_stratum_gate_claimed: universalGate,
    classification: accepted
      ? 'DROMOLOGICAL_S3_ATLAS_BOUNDARY_PRESERVED'
      : 'DROMOLOGICAL_S3_ATLAS_OVERREACH_REJECTED',
  });
}
