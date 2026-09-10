import assert from 'node:assert/strict';

import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
  phasonicObservationMatrix,
  observePhasonicState,
} from '../app/dome-world/previews/a15-r0/phasonic-supermoire-dromological-tomography.js';
import { DROMOLOGICAL_S3_SCHEDULES } from '../app/dome-world/previews/a15-r0/dromological-s3-schedule-atlas-first-stratum-gate.js';
import { DROMOLOGICAL_BASELINE_REPLAY_ROW } from '../app/dome-world/previews/a15-r0/dromological-baseline-replay-rescue-aperture.js';
import { finiteAdmissibilityDescentProfile } from '../app/dome-world/previews/a15-r0/aperture-pedagogue-finite-admissibility-descent-theorem.js';
import { bitemporalAuthorityBirthNonretroactiveJurisdictionCertificate } from '../app/dome-world/previews/a15-r0/bitemporal-authority-birth-nonretroactive-jurisdiction.js';
import {
  BITEMPORAL_PROSPECTIVE_REPLAY_MINIMAL_OBSERVATION_POLICY_SCHEMA,
  BITEMPORAL_PROSPECTIVE_REPLAY_MINIMAL_OBSERVATION_POLICY_PARENT_RECEIPT,
  bitemporalProspectiveReplayMinimalObservationPolicyCertificate,
  compileBitemporalProspectiveReplayMinimalObservationProjection,
  rejectBitemporalProspectiveReplayPolicyOverreach,
} from '../app/dome-world/previews/a15-r0/bitemporal-prospective-replay-minimal-observation-policy.js';

const PREFIXES = [1, 2, 3];
const EXPECTED_RANKS = {
  'P-H-I': [3, 2, 2],
  'P-I-H': [3, 2, 2],
  'H-P-I': [2, 2, 2],
  'H-I-P': [2, 3, 3],
  'I-P-H': [2, 2, 2],
  'I-H-P': [2, 3, 3],
};
const EXPECTED_MINIMA = {
  'P-H-I': 3, 'P-I-H': 3, 'H-P-I': 4, 'H-I-P': 3, 'I-P-H': 4, 'I-H-P': 3,
};
const EXPECTED_TIMINGS = {
  'P-H-I': 1, 'P-I-H': 1, 'H-P-I': 3, 'H-I-P': 2, 'I-P-H': 3, 'I-H-P': 2,
};

function scheduleId(schedule) {
  const letters = { PHI_PAIR_WIRE: 'P', HEXAGONAL_MOIRE: 'H', ICOSAHEDRAL_PHASON: 'I' };
  return schedule.map(stratum => letters[stratum]).join('-');
}
function determinant3(matrix) {
  const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
  return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
}
function triples(n) {
  const out = [];
  for (let a = 0; a < n; a += 1) for (let b = a + 1; b < n; b += 1) for (let c = b + 1; c < n; c += 1) out.push([a, b, c]);
  return out;
}
function rankRows(rows) {
  if (rows.length >= 3 && triples(rows.length).some(ix => determinant3(ix.map(i => rows[i])) !== 0)) return 3;
  for (let a = 0; a < rows.length; a += 1) {
    for (let b = a + 1; b < rows.length; b += 1) {
      for (let c1 = 0; c1 < 3; c1 += 1) for (let c2 = c1 + 1; c2 < 3; c2 += 1) {
        if (rows[a][c1] * rows[b][c2] - rows[a][c2] * rows[b][c1] !== 0) return 2;
      }
    }
  }
  return rows.some(row => row.some(Boolean)) ? 1 : 0;
}
const dot = (row, vector) => row.reduce((sum, value, index) => sum + value * vector[index], 0);
function inverse3(matrix, observation) {
  const det = determinant3(matrix);
  assert.equal(Math.abs(det), 1);
  const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
  const adj = [
    [e * i - f * h, c * h - b * i, b * f - c * e],
    [f * g - d * i, a * i - c * g, c * d - a * f],
    [d * h - e * g, b * g - a * h, a * e - b * d],
  ];
  return adj.map(row => dot(row, observation) / det).map(value => value === 0 ? 0 : value);
}
function states() {
  return Array.from({ length: 125 }, (_, index) => [
    Math.floor(index / 25) - 2,
    Math.floor((index % 25) / 5) - 2,
    (index % 5) - 2,
  ]);
}
const canonical = value => JSON.stringify(value);
const replayRequired = schedule => rankRows(phasonicObservationMatrix(schedule)) < 3;
const matrixPrefix = (schedule, prefix) => phasonicObservationMatrix(schedule).slice(0, prefix).map(row => [...row]);
const processClass = (target, prefix) => {
  const key = canonical(matrixPrefix(target, prefix));
  return DROMOLOGICAL_S3_SCHEDULES.filter(schedule => canonical(matrixPrefix(schedule, prefix)) === key);
};

const stateRows = states();
assert.equal(stateRows.length, 125);
assert.equal(DROMOLOGICAL_S3_SCHEDULES.length, 6);

// Independently recover native replay need from original rank, never from first-stratum naming.
const replayNeed = Object.fromEntries(DROMOLOGICAL_S3_SCHEDULES.map(schedule => [scheduleId(schedule), replayRequired(schedule)]));
assert.deepEqual(replayNeed, {
  'P-H-I': false, 'P-I-H': false, 'H-P-I': true, 'H-I-P': true, 'I-P-H': true, 'I-H-P': true,
});

// Independently execute all 18 new REPLAY_REQUIRED jurisdiction cells against the registered trace quotient.
let newAuthorizedCells = 0;
for (const target of DROMOLOGICAL_S3_SCHEDULES) {
  for (const prefix of PREFIXES) {
    const rows = [];
    for (const schedule of processClass(target, prefix)) {
      for (const state of stateRows) {
        rows.push({
          antecedent: [scheduleId(schedule), [...state]],
          quotient: [matrixPrefix(schedule, prefix), observePhasonicState(state, schedule).slice(0, prefix)],
          support: [replayRequired(schedule)],
        });
      }
    }
    const profile = finiteAdmissibilityDescentProfile(rows);
    assert.equal(profile.status, 'FINITE_ADMISSIBILITY_DESCENT_PROFILE_DERIVED');
    assert.equal(profile.exact_descended_rule_exists, true);
    assert.equal(profile.occupied_fibers.every(fiber => fiber.irreducible_gap_cardinality === 0), true);
    newAuthorizedCells += 1;
  }
}
assert.equal(newAuthorizedCells, 18);

// Exact schedule remains wounded at t1 and closes at t2: policy authority precedes process identity.
for (const target of DROMOLOGICAL_S3_SCHEDULES) {
  const t1Rows = [];
  for (const schedule of processClass(target, 1)) {
    for (const state of stateRows) {
      t1Rows.push({
        antecedent: [scheduleId(schedule), [...state]],
        quotient: [matrixPrefix(schedule, 1), observePhasonicState(state, schedule).slice(0, 1)],
        support: [scheduleId(schedule)],
      });
    }
  }
  const t1 = finiteAdmissibilityDescentProfile(t1Rows);
  assert.equal(t1.exact_descended_rule_exists, false);
  assert.equal(t1.occupied_fibers.some(fiber => fiber.irreducible_gap_cardinality === 2), true);

  const t2Rows = [];
  for (const schedule of processClass(target, 2)) {
    for (const state of stateRows) {
      t2Rows.push({
        antecedent: [scheduleId(schedule), [...state]],
        quotient: [matrixPrefix(schedule, 2), observePhasonicState(state, schedule).slice(0, 2)],
        support: [scheduleId(schedule)],
      });
    }
  }
  const t2 = finiteAdmissibilityDescentProfile(t2Rows);
  assert.equal(t2.exact_descended_rule_exists, true);
}

// Exhaust the complete lawful three-measurement history family.
const hostileGeometry = [];
for (const schedule of DROMOLOGICAL_S3_SCHEDULES) {
  const id = scheduleId(schedule);
  const O = phasonicObservationMatrix(schedule);
  const histories = [
    [O[0], O[1], O[2]],
    [O[0], DROMOLOGICAL_BASELINE_REPLAY_ROW, O[1]],
    [O[0], O[1], DROMOLOGICAL_BASELINE_REPLAY_ROW],
  ];
  const ranks = histories.map(rankRows);
  assert.deepEqual(ranks, EXPECTED_RANKS[id]);
  const minimum = ranks.includes(3) ? 3 : 4;
  assert.equal(minimum, EXPECTED_MINIMA[id]);
  if (id === 'H-P-I' || id === 'I-P-H') assert.equal(ranks.every(rank => rank < 3), true);
  const timingCount = id.startsWith('P-') ? 1 : (minimum === 3 ? 2 : 3);
  assert.equal(timingCount, EXPECTED_TIMINGS[id]);
  hostileGeometry.push({ id, minimum, ranks, timingCount });
}
assert.deepEqual(Object.fromEntries(hostileGeometry.map(row => [row.id, row.minimum])), EXPECTED_MINIMA);
assert.equal(hostileGeometry.reduce((sum, row) => sum + row.minimum, 0), 20);
assert.equal(hostileGeometry.filter(row => row.timingCount > 1).length, 4);

// Independently execute exactly 750 state reconstructions using only acquired rows.
let reconstructed = 0;
for (const schedule of DROMOLOGICAL_S3_SCHEDULES) {
  const O = phasonicObservationMatrix(schedule);
  const trace = [{ kind: 'O', index: 0, row: O[0] }];
  if (replayRequired(schedule)) trace.push({ kind: 'R', index: null, row: DROMOLOGICAL_BASELINE_REPLAY_ROW });
  trace.push({ kind: 'O', index: 1, row: O[1] });
  if (rankRows(trace.map(item => item.row)) < 3) trace.push({ kind: 'O', index: 2, row: O[2] });
  assert.equal(trace.length, EXPECTED_MINIMA[scheduleId(schedule)]);
  const minorIx = triples(trace.length).find(ix => Math.abs(determinant3(ix.map(i => trace[i].row))) === 1);
  assert.ok(minorIx);
  const minor = minorIx.map(i => trace[i].row);
  for (const state of stateRows) {
    const originalObservation = observePhasonicState(state, schedule);
    const acquired = trace.map(item => item.kind === 'R'
      ? dot(DROMOLOGICAL_BASELINE_REPLAY_ROW, state)
      : originalObservation[item.index]);
    const recovered = inverse3(minor, minorIx.map(i => acquired[i]));
    assert.deepEqual(recovered, state);
    reconstructed += 1;
  }
}
assert.equal(reconstructed, 750);

const parent = bitemporalAuthorityBirthNonretroactiveJurisdictionCertificate();
assert.equal(parent.passed, true);
assert.equal(parent.ledger_totals.authorized_cells, 50);
assert.equal(parent.ledger_totals.held_cells, 58);
assert.equal(parent.ledger_totals.eventually_authorized_but_earlier_held_cells, 22);
assert.equal(parent.ledger_totals.never_authorized_cells, 36);

const certificate = bitemporalProspectiveReplayMinimalObservationPolicyCertificate();
assert.equal(certificate.schema, BITEMPORAL_PROSPECTIVE_REPLAY_MINIMAL_OBSERVATION_POLICY_SCHEMA);
assert.equal(certificate.parent_receipt, BITEMPORAL_PROSPECTIVE_REPLAY_MINIMAL_OBSERVATION_POLICY_PARENT_RECEIPT);
assert.equal(certificate.passed, true);
assert.deepEqual(certificate.pointwise_minimum_observation_counts, EXPECTED_MINIMA);
assert.equal(certificate.complete_atlas_adaptive_scalar_observation_burden, 20);
assert.equal(certificate.unconditional_three_original_plus_replay_burden, 24);
assert.equal(certificate.exact_rows_avoided, 4);
assert.deepEqual(certificate.extended_bitemporal_ledger_certificate.birth_spectrum, { 1: 14, 2: 10, 3: 6, INF: 12 });
assert.deepEqual(certificate.extended_bitemporal_ledger_certificate.ledger, {
  claim_family_count: 7,
  schedule_claim_pair_count: 42,
  jurisdiction_cell_count: 126,
  authorized_cells: 68,
  held_cells: 58,
  inherited_held_cells_preserved: 58,
  inherited_eventually_authorized_earlier_held_preserved: 22,
  inherited_never_authorized_preserved: 36,
});
assert.deepEqual(certificate.nonunique_optimal_replay_timing_schedule_ids, ['H-P-I', 'H-I-P', 'I-P-H', 'I-H-P']);
assert.equal(certificate.finite_adaptive_reconstruction_certificate.checked_state_schedule_pairs, 750);

const ash = compileBitemporalProspectiveReplayMinimalObservationProjection(AIA_RECEIVERS.ASH);
const loom = compileBitemporalProspectiveReplayMinimalObservationProjection(AIA_RECEIVERS.LOOM);
for (const projection of [ash, loom]) {
  assert.deepEqual(projection.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
  assert.equal(Object.values(projection.authority).some(Boolean), false);
  assert.equal(projection.runtime_binding, false);
  assert.equal(projection.source_state_transform, false);
  assert.equal(projection.execution_ledger.executed_state_reconstructions, 750);
  assert.equal(projection.execution_ledger.inherited_replay_reconstructions_counted_as_current_execution, false);
  assert.equal(projection.execution_ledger.unacquired_rows_counted_as_executed, false);
  assert.equal(rejectBitemporalProspectiveReplayPolicyOverreach(projection).accepted, true);
}
assert.equal(ash.payload.matrices_exposed, false);
assert.equal(ash.payload.replay_vector_exposed, false);
assert.equal(ash.payload.inverse_coefficients_exposed, false);
assert.equal(ash.payload.latent_state_values_exposed, false);
assert.equal(ash.payload.complete_jurisdiction_ledger_exposed, false);

for (const mutation of [
  { always_replay_claimed_pointwise_minimal: true },
  { never_replay_claimed_exact_all_six: true },
  { all_six_three_rows_claimed_exact: true },
  { original_prefix_skip: true },
  { arbitrary_new_sensing_row: true },
  { source_schedule_reordered: true },
  { endogenous_operator_mutation: true },
  { exact_schedule_at_prefix_one: true },
  { policy_authority_implies_latent_state_authority: true },
  { later_reconstruction_backdates_earlier_possession: true },
  { unique_optimal_replay_timing: true },
  { source_state_transform: true },
  { runtime_binding: true },
]) {
  assert.equal(rejectBitemporalProspectiveReplayPolicyOverreach(mutation).accepted, false);
}
for (const key of [
  'universal_optimal_experimental_design', 'shannon_capacity', 'asymptotic_recovery_theorem',
  'continuum_tomography', 'physical_active_sensing', 'physical_sensor_control',
  'autonomous_experiment_execution', 'general_bitemporal_database_theorem', 'production', 'release', 'deployment',
]) {
  assert.equal(rejectBitemporalProspectiveReplayPolicyOverreach({ claim_ceiling: { [key]: true } }).accepted, false);
}
assert.equal(rejectBitemporalProspectiveReplayPolicyOverreach({ authority: { inverse: true } }).accepted, false);
assert.equal(rejectBitemporalProspectiveReplayPolicyOverreach({ execution_ledger: { executed_state_reconstructions: 751 } }).accepted, false);
assert.equal(rejectBitemporalProspectiveReplayPolicyOverreach({ execution_ledger: { inherited_replay_reconstructions_counted_as_current_execution: true } }).accepted, false);
assert.equal(rejectBitemporalProspectiveReplayPolicyOverreach({ execution_ledger: { unacquired_rows_counted_as_executed: true } }).accepted, false);
assert.equal(rejectBitemporalProspectiveReplayPolicyOverreach({
  receiver: AIA_RECEIVERS.ASH,
  payload: { matrices_exposed: true },
}).accepted, false);

console.log('Ash A15-R0 bitemporal prospective replay minimal observation policy hostile tests passed.');