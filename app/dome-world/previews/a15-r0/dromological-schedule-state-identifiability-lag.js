import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
  phasonicObservationMatrix,
  observePhasonicState,
} from './phasonic-supermoire-dromological-tomography.js';
import {
  DROMOLOGICAL_S3_SCHEDULE_ATLAS_PARENT_RECEIPT,
  DROMOLOGICAL_S3_SCHEDULES,
  invertDromologicalScheduleObservation,
} from './dromological-s3-schedule-atlas-first-stratum-gate.js';

export const DROMOLOGICAL_SCHEDULE_STATE_LAG_SCHEMA =
  'td613.dome-world.dromological-schedule-state-identifiability-lag/v0.1';
export const DROMOLOGICAL_SCHEDULE_STATE_LAG_PARENT_RECEIPT =
  'f9d5ee89b8555175d0797893fdd8c91b5395ea8b';

const P = 'PHI_PAIR_WIRE';
const AUTHORITY_KEYS = Object.freeze([
  'inverse', 'encoder', 'custody_mutation', 'release', 'production', 'physical_claim', 'continuum_claim',
]);

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function same(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function zeroAuthority() {
  return freeze(Object.fromEntries(AUTHORITY_KEYS.map(key => [key, false])));
}

function prefixRows(schedule, length) {
  if (!Number.isInteger(length) || length < 1 || length > 3) {
    throw new Error('prefix length must be an integer in {1,2,3}');
  }
  return freeze(phasonicObservationMatrix(schedule).slice(0, length).map(row => freeze([...row])));
}

function rankRows(rows) {
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 3) {
    throw new Error('rankRows expects between one and three rows');
  }
  if (rows.some(row => !Array.isArray(row) || row.length !== 3)) {
    throw new Error('rankRows expects 3-coordinate rows');
  }
  if (rows.every(row => row.every(value => value === 0))) return 0;
  if (rows.length === 1) return 1;
  for (let r1 = 0; r1 < rows.length; r1 += 1) {
    for (let r2 = r1 + 1; r2 < rows.length; r2 += 1) {
      for (let c1 = 0; c1 < 3; c1 += 1) {
        for (let c2 = c1 + 1; c2 < 3; c2 += 1) {
          const minor = rows[r1][c1] * rows[r2][c2] - rows[r1][c2] * rows[r2][c1];
          if (minor !== 0) {
            if (rows.length < 3) return 2;
            const [a, b, c] = rows[0];
            const [d, e, f] = rows[1];
            const [g, h, i] = rows[2];
            const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
            return det !== 0 ? 3 : 2;
          }
        }
      }
    }
  }
  return 1;
}

function matrixTimesVector(rows, vector) {
  return rows.map(row => row.reduce((sum, value, index) => sum + value * vector[index], 0));
}

function equivalenceClassesByPrefix(length) {
  const classes = new Map();
  DROMOLOGICAL_S3_SCHEDULES.forEach((schedule, index) => {
    const key = JSON.stringify(prefixRows(schedule, length));
    if (!classes.has(key)) classes.set(key, []);
    classes.get(key).push(index);
  });
  return freeze([...classes.values()].map(group => freeze([...group])));
}

function scheduleId(schedule) {
  const letter = {
    PHI_PAIR_WIRE: 'P',
    HEXAGONAL_MOIRE: 'H',
    ICOSAHEDRAL_PHASON: 'I',
  };
  return schedule.map(id => letter[id]).join('-');
}

function preregisteredTwoRowKernel(schedule) {
  const id = scheduleId(schedule);
  if (id === 'P-H-I') return freeze([0, 0, 1]);
  if (id === 'P-I-H') return freeze([0, 1, 0]);
  return null;
}

function rowForSchedule(schedule) {
  const ranks = freeze([1, 2, 3].map(length => rankRows(prefixRows(schedule, length))));
  const twoRowKernel = preregisteredTwoRowKernel(schedule);
  const twoRowKernelObservation = twoRowKernel
    ? freeze(matrixTimesVector(prefixRows(schedule, 2), twoRowKernel))
    : null;
  const statePrefix = ranks[2] === 3 ? 3 : null;
  return freeze({
    schedule: freeze([...schedule]),
    schedule_id: scheduleId(schedule),
    first_stratum: schedule[0],
    prefix_ranks: ranks,
    minimal_state_reconstruction_prefix: statePrefix,
    two_row_kernel: twoRowKernel,
    two_row_kernel_maps_to_zero: twoRowKernel
      ? twoRowKernelObservation.every(value => value === 0)
      : null,
  });
}

function finitePFirstReconstructionCertificate(rows) {
  let checked = 0;
  let exact = true;
  for (const row of rows.filter(candidate => candidate.first_stratum === P)) {
    for (let x1 = -2; x1 <= 2; x1 += 1) {
      for (let x2 = -2; x2 <= 2; x2 += 1) {
        for (let x3 = -2; x3 <= 2; x3 += 1) {
          const state = [x1, x2, x3];
          const observation = observePhasonicState(state, row.schedule);
          const recovered = invertDromologicalScheduleObservation(observation, row.schedule);
          checked += 1;
          if (!same(state, recovered)) exact = false;
        }
      }
    }
  }
  return freeze({
    checked_state_schedule_pairs: checked,
    expected_state_schedule_pairs: 250,
    exact: exact && checked === 250,
  });
}

export function dromologicalScheduleStateIdentifiabilityLagCertificate() {
  const prefixClasses = freeze({
    1: equivalenceClassesByPrefix(1),
    2: equivalenceClassesByPrefix(2),
    3: equivalenceClassesByPrefix(3),
  });
  const rows = freeze(DROMOLOGICAL_S3_SCHEDULES.map(rowForSchedule));
  const minimalSchedulePrefix = prefixClasses[1].length < 6 && prefixClasses[2].length === 6 ? 2 : null;
  const pFirstRows = rows.filter(row => row.first_stratum === P);
  const nonPFirstRows = rows.filter(row => row.first_stratum !== P);
  const pFirstStrictLag = pFirstRows.every(row => (
    row.prefix_ranks[1] === 2
    && row.prefix_ranks[2] === 3
    && row.minimal_state_reconstruction_prefix === 3
    && row.two_row_kernel_maps_to_zero === true
  ));
  const hostileNeverFullRank = nonPFirstRows.every(row => row.prefix_ranks[2] === 2 && row.minimal_state_reconstruction_prefix === null);
  const finiteInverse = finitePFirstReconstructionCertificate(rows);

  const passed =
    DROMOLOGICAL_S3_SCHEDULE_ATLAS_PARENT_RECEIPT === '40dfba93d2577bceba0f66022ac5f42934cdbd06'
    && minimalSchedulePrefix === 2
    && same(prefixClasses[1], [[0, 1], [2, 3], [4, 5]])
    && same(prefixClasses[2], [[0], [1], [2], [3], [4], [5]])
    && same(prefixClasses[3], [[0], [1], [2], [3], [4], [5]])
    && pFirstStrictLag
    && hostileNeverFullRank
    && finiteInverse.exact;

  return freeze({
    schema: DROMOLOGICAL_SCHEDULE_STATE_LAG_SCHEMA,
    parent_receipt: DROMOLOGICAL_SCHEDULE_STATE_LAG_PARENT_RECEIPT,
    prefix_equivalence_classes: prefixClasses,
    minimal_schedule_identification_prefix: minimalSchedulePrefix,
    schedules: rows,
    invertible_schedule_state_prefixes: freeze(pFirstRows.map(row => freeze({
      schedule_id: row.schedule_id,
      minimal_state_reconstruction_prefix: row.minimal_state_reconstruction_prefix,
    }))),
    nonidentifiable_schedule_ids: freeze(nonPFirstRows.map(row => row.schedule_id)),
    strict_schedule_before_state_lag_on_both_p_first_schedules: pFirstStrictLag,
    hostile_schedules_never_reach_full_rank: hostileNeverFullRank,
    finite_inverse_certificate: finiteInverse,
    passed,
    classification: passed
      ? 'THE_DECLARED_S3_FIXTURE_HAS_A_STRICT_IDENTIFIABILITY_LAG_IN_WHICH_TEMPORAL_SCHEDULE_IDENTITY_IS_EXACTLY_DETERMINED_AFTER_TWO_REGISTERED_OBSERVATIONS_WHILE_THE_LATENT_THREE_COORDINATE_STATE_REQUIRES_THREE_OBSERVATIONS_ON_THE_TWO_UNIMODULAR_SCHEDULES_AND_REMAINS_NONIDENTIFIABLE_ON_THE_OTHER_FOUR'
      : 'DROMOLOGICAL_SCHEDULE_STATE_IDENTIFIABILITY_LAG_NOT_ESTABLISHED',
    architectural_law: passed
      ? 'PROCESS_IDENTIFIABILITY_CAN_PRECEDE_LATENT_STATE_IDENTIFIABILITY_WITHOUT_WIDENING_RECEIVER_AUTHORITY'
      : 'PROCESS_STATE_IDENTIFIABILITY_SEPARATION_NOT_ESTABLISHED',
    scars: freeze([
      'SCHEDULE_IDENTIFIABILITY != LATENT_STATE_IDENTIFIABILITY',
      'EARLY_PROCESS_IDENTITY != EARLY_PAYLOAD_RECONSTRUCTION',
      'TWO_OBSERVATIONS_IDENTIFY_THE_ORDER != TWO_OBSERVATIONS_IDENTIFY_THE_STATE',
      'MINIMAL_PREFIX_IN_THIS_FIXTURE != UNIVERSAL_STOPPING_TIME',
    ]),
  });
}

export function compileDromologicalScheduleStateLagProjection(receiver) {
  const certificate = dromologicalScheduleStateIdentifiabilityLagCertificate();
  if (!certificate.passed) throw new Error('cannot project uncertified schedule/state identifiability lag');

  let payload;
  if (receiver === AIA_RECEIVERS.ASH) {
    payload = freeze({
      payload_schema: 'td613.dome-world.schedule-state-lag-child-legible/v0.1',
      truths: freeze([
        'TWO_CLUES_CAN_TELL_US_WHICH_ORDER_HAPPENED',
        'KNOWING_THE_ORDER_DOES_NOT_MEAN_THE_HIDDEN_STATE_IS_KNOWN',
        'THE_TWO_GOOD_ORDERS_NEED_ONE_MORE_CLUE_FOR_THE_FULL_STATE',
        'FOUR_ORDERS_NEVER_REVEAL_ALL_THREE_STATE_COORDINATES_IN_THIS_FIXTURE',
      ]),
      technical_prefix_matrices_exposed: false,
      kernel_vectors_exposed: false,
      inverse_formulas_exposed: false,
      latent_phason_state_exposed: false,
    });
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    payload = freeze({
      payload_schema: 'td613.dome-world.schedule-state-lag-loom-technical/v0.1',
      prefix_equivalence_classes: certificate.prefix_equivalence_classes,
      schedule_rank_atlas: certificate.schedules,
      minimal_schedule_identification_prefix: certificate.minimal_schedule_identification_prefix,
      invertible_schedule_state_prefixes: certificate.invertible_schedule_state_prefixes,
    });
  } else {
    throw new Error(`undeclared AIA receiver for schedule/state lag: ${receiver}`);
  }

  return freeze({
    schema: DROMOLOGICAL_SCHEDULE_STATE_LAG_SCHEMA,
    receiver,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    payload,
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
    claim_ceiling: freeze({
      bounded_schedule_state_lag: true,
      universal_stopping_time: false,
      continuum_inverse: false,
      physical_holonomy: false,
      physical_quasicrystal: false,
      live_runtime: false,
      production: false,
    }),
  });
}

export function rejectDromologicalScheduleStateLagOverreach(candidate) {
  const authorityWidened = Object.values(candidate?.authority ?? {}).some(Boolean);
  const runtime = candidate?.runtime_binding === true;
  const universal = candidate?.claim_ceiling?.universal_stopping_time === true;
  const continuum = candidate?.claim_ceiling?.continuum_inverse === true;
  const physical = candidate?.claim_ceiling?.physical_holonomy === true
    || candidate?.claim_ceiling?.physical_quasicrystal === true;
  const ashLeaksTechnical = candidate?.receiver === AIA_RECEIVERS.ASH && (
    candidate?.payload?.technical_prefix_matrices_exposed === true
    || candidate?.payload?.kernel_vectors_exposed === true
    || candidate?.payload?.inverse_formulas_exposed === true
    || candidate?.payload?.latent_phason_state_exposed === true
  );
  const accepted = !authorityWidened && !runtime && !universal && !continuum && !physical && !ashLeaksTechnical;
  return freeze({
    accepted,
    authority_widened: authorityWidened,
    runtime_binding_attempted: runtime,
    universal_stopping_time_claimed: universal,
    continuum_inverse_claimed: continuum,
    physical_claim_attempted: physical,
    ash_technical_leak_attempted: ashLeaksTechnical,
  });
}
