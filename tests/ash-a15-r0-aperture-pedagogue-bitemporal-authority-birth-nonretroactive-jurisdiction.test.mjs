import assert from 'node:assert/strict';

import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
  phasonicObservationMatrix,
  observePhasonicState,
} from '../app/dome-world/previews/a15-r0/phasonic-supermoire-dromological-tomography.js';
import {
  DROMOLOGICAL_S3_SCHEDULES,
} from '../app/dome-world/previews/a15-r0/dromological-s3-schedule-atlas-first-stratum-gate.js';
import {
  finiteAdmissibilityDescentProfile,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-finite-admissibility-descent-theorem.js';
import {
  BITEMPORAL_AUTHORITY_BIRTH_NONRETROACTIVE_JURISDICTION_SCHEMA,
  BITEMPORAL_AUTHORITY_BIRTH_NONRETROACTIVE_JURISDICTION_PARENT_RECEIPT,
  BITEMPORAL_AUTHORITY_BIRTH_FADT_RECEIPT,
  BITEMPORAL_AUTHORITY_BIRTH_LAG_RECEIPT,
  bitemporalAuthorityBirthNonretroactiveJurisdictionCertificate,
  compileBitemporalAuthorityBirthProjection,
  rejectBitemporalAuthorityBirthOverreach,
} from '../app/dome-world/previews/a15-r0/bitemporal-authority-birth-nonretroactive-jurisdiction.js';

const CLAIMS = ['FIRST_STRATUM', 'SCHEDULE', 'X1', 'X2', 'X3', 'FULL_STATE'];
const PREFIXES = [1, 2, 3];

function scheduleId(schedule) {
  const letter = {
    PHI_PAIR_WIRE: 'P',
    HEXAGONAL_MOIRE: 'H',
    ICOSAHEDRAL_PHASON: 'I',
  };
  return schedule.map(stratum => letter[stratum]).join('-');
}

function statesIndependent() {
  return Array.from({ length: 125 }, (_, index) => {
    const x1 = Math.floor(index / 25) - 2;
    const x2 = Math.floor((index % 25) / 5) - 2;
    const x3 = (index % 5) - 2;
    return [x1, x2, x3];
  });
}

function matrixPrefix(schedule, prefix) {
  return phasonicObservationMatrix(schedule).slice(0, prefix).map(row => [...row]);
}

function processClass(target, prefix) {
  const targetKey = JSON.stringify(matrixPrefix(target, prefix));
  return DROMOLOGICAL_S3_SCHEDULES.filter(schedule => (
    JSON.stringify(matrixPrefix(schedule, prefix)) === targetKey
  ));
}

function claimLabel(claim, schedule, state) {
  if (claim === 'FIRST_STRATUM') return schedule[0];
  if (claim === 'SCHEDULE') return scheduleId(schedule);
  if (claim === 'X1') return state[0];
  if (claim === 'X2') return state[1];
  if (claim === 'X3') return state[2];
  if (claim === 'FULL_STATE') return [...state];
  throw new Error(`unknown hostile claim: ${claim}`);
}

function canonical(value) {
  return JSON.stringify(value);
}

function hostileCell(target, claim, prefix, states) {
  const family = processClass(target, prefix);
  const fibers = new Map();
  for (const schedule of family) {
    const observationMatrix = matrixPrefix(schedule, prefix);
    for (const state of states) {
      const observed = observePhasonicState(state, schedule).slice(0, prefix);
      const trace = [observationMatrix, [...observed]];
      const traceKey = canonical(trace);
      if (!fibers.has(traceKey)) fibers.set(traceKey, { trace, rows: [] });
      fibers.get(traceKey).rows.push({
        antecedent: [scheduleId(schedule), [...state]],
        support: [claimLabel(claim, schedule, state)],
      });
    }
  }

  let conflict = null;
  let authorized = true;
  for (const fiber of fibers.values()) {
    const supportKeys = new Set(fiber.rows.map(row => canonical(row.support)));
    if (supportKeys.size > 1) {
      authorized = false;
      if (!conflict) {
        for (let left = 0; left < fiber.rows.length && !conflict; left += 1) {
          for (let right = left + 1; right < fiber.rows.length; right += 1) {
            if (canonical(fiber.rows[left].support) !== canonical(fiber.rows[right].support)) {
              conflict = {
                quotient: fiber.trace,
                left: fiber.rows[left],
                right: fiber.rows[right],
              };
              break;
            }
          }
        }
      }
    }
  }

  let fadtWound = null;
  if (!authorized) {
    assert.ok(conflict);
    const profile = finiteAdmissibilityDescentProfile([
      {
        antecedent: conflict.left.antecedent,
        quotient: conflict.quotient,
        support: conflict.left.support,
      },
      {
        antecedent: conflict.right.antecedent,
        quotient: conflict.quotient,
        support: conflict.right.support,
      },
    ]);
    const fiber = profile.occupied_fibers[0];
    fadtWound = {
      exact_descent: profile.exact_descended_rule_exists,
      union_cardinality: fiber.union_cardinality,
      intersection_cardinality: fiber.intersection_cardinality,
      gap_cardinality: fiber.irreducible_gap_cardinality,
    };
    assert.equal(fadtWound.exact_descent, false);
    assert.equal(fadtWound.union_cardinality, 2);
    assert.equal(fadtWound.intersection_cardinality, 0);
    assert.equal(fadtWound.gap_cardinality, 2);
  }

  return {
    authorized,
    conditioning_schedule_ids: family.map(scheduleId),
    occupied_trace_count: fibers.size,
    fadt_wound: fadtWound,
  };
}

const states = statesIndependent();
assert.equal(states.length, 125);
assert.equal(new Set(states.map(canonical)).size, 125);
assert.equal(DROMOLOGICAL_S3_SCHEDULES.length * states.length, 750);

const processCensus = {};
for (const prefix of PREFIXES) {
  processCensus[prefix] = new Set(DROMOLOGICAL_S3_SCHEDULES.map(schedule => (
    canonical(matrixPrefix(schedule, prefix))
  ))).size;
}
assert.deepEqual(processCensus, { 1: 3, 2: 6, 3: 6 });

const expected = {
  'P-H-I': [1, 2, 1, 2, 3, 3],
  'P-I-H': [1, 2, 1, 3, 2, 3],
  'H-P-I': [1, 2, 'INF', 'INF', 3, 'INF'],
  'H-I-P': [1, 2, 'INF', 'INF', 2, 'INF'],
  'I-P-H': [1, 2, 'INF', 3, 'INF', 'INF'],
  'I-H-P': [1, 2, 'INF', 2, 'INF', 'INF'],
};

const hostileSchedules = [];
const birthSpectrum = { 1: 0, 2: 0, 3: 0, INF: 0 };
const authorizedAccumulation = { 1: 0, 2: 0, 3: 0 };
const heldAccumulation = { 1: 0, 2: 0, 3: 0 };
let authorizedCells = 0;
let heldCells = 0;
let heldWounds = 0;
let eventuallyAuthorizedEarlierHeld = 0;
let neverAuthorizedCells = 0;
let monotonePairs = 0;

for (const schedule of DROMOLOGICAL_S3_SCHEDULES) {
  const rows = [];
  for (const claim of CLAIMS) {
    const cells = PREFIXES.map(prefix => hostileCell(schedule, claim, prefix, states));
    const birthIndex = cells.findIndex(cell => cell.authorized);
    const birth = birthIndex === -1 ? 'INF' : PREFIXES[birthIndex];
    const monotone = cells.every((cell, index) => (
      index === cells.length - 1 || !cell.authorized || cells[index + 1].authorized
    ));
    assert.equal(monotone, true);
    monotonePairs += 1;
    birthSpectrum[birth] += 1;

    for (let index = 0; index < cells.length; index += 1) {
      const prefix = PREFIXES[index];
      const cell = cells[index];
      if (cell.authorized) {
        authorizedCells += 1;
        authorizedAccumulation[prefix] += 1;
      } else {
        heldCells += 1;
        heldAccumulation[prefix] += 1;
        assert.deepEqual(cell.fadt_wound, {
          exact_descent: false,
          union_cardinality: 2,
          intersection_cardinality: 0,
          gap_cardinality: 2,
        });
        heldWounds += 1;
        if (birth === 'INF') neverAuthorizedCells += 1;
        else if (prefix < birth) eventuallyAuthorizedEarlierHeld += 1;
      }
    }
    rows.push({ claim, birth, cells });
  }
  const signature = CLAIMS.map(claim => rows.find(row => row.claim === claim).birth);
  assert.deepEqual(signature, expected[scheduleId(schedule)]);
  hostileSchedules.push({ schedule_id: scheduleId(schedule), rows, signature });
}

assert.deepEqual(birthSpectrum, { 1: 8, 2: 10, 3: 6, INF: 12 });
assert.deepEqual(authorizedAccumulation, { 1: 8, 2: 18, 3: 24 });
assert.deepEqual(heldAccumulation, { 1: 28, 2: 18, 3: 12 });
assert.equal(authorizedCells, 50);
assert.equal(heldCells, 58);
assert.equal(heldWounds, 58);
assert.equal(eventuallyAuthorizedEarlierHeld, 22);
assert.equal(neverAuthorizedCells, 36);
assert.equal(monotonePairs, 36);
assert.equal(new Set(hostileSchedules.map(row => canonical(row.signature))).size, 6);

// Explicit hierarchy reversals: partial latent authority can precede full process identity.
const partialBeforeProcess = hostileSchedules.filter(schedule => {
  const scheduleBirth = schedule.rows.find(row => row.claim === 'SCHEDULE').birth;
  return ['X1', 'X2', 'X3'].some(claim => {
    const birth = schedule.rows.find(row => row.claim === claim).birth;
    return birth !== 'INF' && birth < scheduleBirth;
  });
});
assert.deepEqual(partialBeforeProcess.map(row => row.schedule_id), ['P-H-I', 'P-I-H']);

// Partial latent authority can survive while complete state authority never arrives.
const partialWithoutFullState = hostileSchedules.filter(schedule => {
  const full = schedule.rows.find(row => row.claim === 'FULL_STATE').birth;
  return full === 'INF' && ['X1', 'X2', 'X3'].some(claim => (
    schedule.rows.find(row => row.claim === claim).birth !== 'INF'
  ));
});
assert.deepEqual(partialWithoutFullState.map(row => row.schedule_id), [
  'H-P-I', 'H-I-P', 'I-P-H', 'I-H-P',
]);
assert.equal(hostileSchedules.find(row => row.schedule_id === 'H-P-I').rows.find(row => row.claim === 'X3').birth, 3);
assert.equal(hostileSchedules.find(row => row.schedule_id === 'H-I-P').rows.find(row => row.claim === 'X3').birth, 2);
assert.equal(hostileSchedules.find(row => row.schedule_id === 'I-P-H').rows.find(row => row.claim === 'X2').birth, 3);
assert.equal(hostileSchedules.find(row => row.schedule_id === 'I-H-P').rows.find(row => row.claim === 'X2').birth, 2);

const certificate = bitemporalAuthorityBirthNonretroactiveJurisdictionCertificate();
assert.equal(certificate.schema, BITEMPORAL_AUTHORITY_BIRTH_NONRETROACTIVE_JURISDICTION_SCHEMA);
assert.equal(certificate.parent_receipt, BITEMPORAL_AUTHORITY_BIRTH_NONRETROACTIVE_JURISDICTION_PARENT_RECEIPT);
assert.equal(certificate.fadt_receipt, BITEMPORAL_AUTHORITY_BIRTH_FADT_RECEIPT);
assert.equal(certificate.lag_receipt, BITEMPORAL_AUTHORITY_BIRTH_LAG_RECEIPT);
assert.deepEqual(certificate.process_equivalence_class_census, { 1: 3, 2: 6, 3: 6 });
assert.deepEqual(certificate.birth_spectrum, { '1': 8, '2': 10, '3': 6, INF: 12 });
assert.deepEqual(certificate.authorized_accumulation, { '1': 8, '2': 18, '3': 24 });
assert.deepEqual(certificate.held_accumulation, { '1': 28, '2': 18, '3': 12 });
assert.equal(certificate.ledger_totals.authorized_cells, 50);
assert.equal(certificate.ledger_totals.held_cells, 58);
assert.equal(certificate.ledger_totals.eventually_authorized_but_earlier_held_cells, 22);
assert.equal(certificate.ledger_totals.never_authorized_cells, 36);
assert.equal(certificate.ledger_totals.held_cells_with_exact_two_antecedent_fadt_wound, 58);
assert.equal(certificate.ledger_totals.authorized_cells_with_empty_fadt_gaps, 50);
assert.equal(certificate.authority_birth_signature_count, 6);
assert.equal(certificate.authority_birth_signatures_injective_over_s3, true);
assert.equal(certificate.forward_monotone_schedule_claim_pairs, 36);
assert.deepEqual(certificate.partial_latent_precedes_full_process_schedule_ids, ['P-H-I', 'P-I-H']);
assert.deepEqual(certificate.partial_latent_with_full_state_infinite_schedule_ids, [
  'H-P-I', 'H-I-P', 'I-P-H', 'I-H-P',
]);
assert.equal(certificate.schedule_full_state_lag_bridge_exact, true);
assert.equal(certificate.collision_membrane.generic_fadt_preserved, true);
assert.equal(certificate.collision_membrane.schedule_complete_state_lag_preserved, true);
assert.equal(certificate.collision_membrane.safe_erasure_closure_preserved, true);
assert.equal(certificate.passed, true);

for (const hostile of hostileSchedules) {
  const implementation = certificate.schedules.find(row => row.schedule_id === hostile.schedule_id);
  assert.ok(implementation);
  assert.deepEqual(implementation.birth_signature, hostile.signature);
}

const ash = compileBitemporalAuthorityBirthProjection(AIA_RECEIVERS.ASH);
const loom = compileBitemporalAuthorityBirthProjection(AIA_RECEIVERS.LOOM);
assert.deepEqual(ash.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(loom.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.equal(Object.values(ash.authority).some(Boolean), false);
assert.equal(Object.values(loom.authority).some(Boolean), false);
assert.equal(ash.payload.complete_108_cell_ledger_exposed, false);
assert.equal(ash.payload.conflict_antecedents_exposed, false);
assert.equal(loom.payload.complete_108_cell_ledger_exposed, false);
assert.deepEqual(loom.payload.birth_spectrum, { '1': 8, '2': 10, '3': 6, INF: 12 });
assert.deepEqual(loom.payload.authorized_accumulation, { '1': 8, '2': 18, '3': 24 });

// Retroactive laundering, hierarchy collapse, and scope widening fail closed.
assert.equal(rejectBitemporalAuthorityBirthOverreach({
  ...loom,
  later_reconstruction_backdates_earlier_authority: true,
}).accepted, false);
assert.equal(rejectBitemporalAuthorityBirthOverreach({
  ...loom,
  event_time_equals_authority_time: true,
}).accepted, false);
assert.equal(rejectBitemporalAuthorityBirthOverreach({
  ...loom,
  partial_latent_requires_full_process_identity: true,
}).accepted, false);
assert.equal(rejectBitemporalAuthorityBirthOverreach({
  ...loom,
  partial_latent_requires_full_state_reconstruction: true,
}).accepted, false);
assert.equal(rejectBitemporalAuthorityBirthOverreach({
  ...loom,
  replaces_generic_fadt: true,
}).accepted, false);
assert.equal(rejectBitemporalAuthorityBirthOverreach({
  ...loom,
  replaces_schedule_state_lag: true,
}).accepted, false);
assert.equal(rejectBitemporalAuthorityBirthOverreach({
  ...loom,
  claim_ceiling: { ...loom.claim_ceiling, universal_ai_audit_theorem: true },
}).accepted, false);
assert.equal(rejectBitemporalAuthorityBirthOverreach({
  ...loom,
  claim_ceiling: { ...loom.claim_ceiling, general_bitemporal_database_theorem: true },
}).accepted, false);
assert.equal(rejectBitemporalAuthorityBirthOverreach({
  ...loom,
  claim_ceiling: { ...loom.claim_ceiling, physical_braid_group: true },
}).accepted, false);
assert.equal(rejectBitemporalAuthorityBirthOverreach({
  ...loom,
  source_state_transform: true,
}).accepted, false);
assert.equal(rejectBitemporalAuthorityBirthOverreach({
  ...ash,
  payload: { ...ash.payload, conflict_antecedents_exposed: true },
}).accepted, false);

console.log('Ash A15-R0 bitemporal authority-birth nonretroactive jurisdiction hostile tests passed.');
