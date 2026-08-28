import assert from 'node:assert/strict';

import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import {
  phasonicObservationMatrix,
  observePhasonicState,
} from '../app/dome-world/previews/a15-r0/phasonic-supermoire-dromological-tomography.js';
import {
  DROMOLOGICAL_S3_SCHEDULES,
} from '../app/dome-world/previews/a15-r0/dromological-s3-schedule-atlas-first-stratum-gate.js';
import {
  BITEMPORAL_PROSPECTIVE_REPLAY_MINIMAL_OBSERVATION_POLICY_PARENT_RECEIPT,
  bitemporalProspectiveReplayMinimalObservationPolicyCertificate,
} from '../app/dome-world/previews/a15-r0/bitemporal-prospective-replay-minimal-observation-policy.js';
import {
  ADMISSIBILITY_HORIZON_REFINEMENT_RECOMPRESSION_RUPTURE_SCHEMA,
  ADMISSIBILITY_HORIZON_REFINEMENT_RECOMPRESSION_RUPTURE_PARENT_RECEIPT,
  admissibilityHorizonRefinementRecompressionRuptureCertificate,
  compileAdmissibilityHorizonRefinementRecompressionProjection,
  rejectAdmissibilityHorizonRecompressionOverreach,
} from '../app/dome-world/previews/a15-r0/admissibility-horizon-refinement-recompression-rupture.js';

const CLAIMS = [
  'FIRST_STRATUM',
  'SCHEDULE',
  'X1',
  'X2',
  'X3',
  'FULL_STATE',
  'REPLAY_REQUIRED_FOR_EXACT_STATE',
];
const STAGES = [0, 1, 2, 3];
const EXPECTED_REOPEN = {
  FIRST_STRATUM: 18,
  SCHEDULE: 24,
  X1: 6,
  X2: 14,
  X3: 14,
  FULL_STATE: 6,
  REPLAY_REQUIRED_FOR_EXACT_STATE: 18,
};
const EXPECTED_PRESERVE = {
  FIRST_STRATUM: 18,
  SCHEDULE: 6,
  X1: 6,
  X2: 2,
  X3: 2,
  FULL_STATE: 0,
  REPLAY_REQUIRED_FOR_EXACT_STATE: 18,
};

const canonical = value => JSON.stringify(value);

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
  return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
}

function rank3(matrix) {
  if (determinant3(matrix) !== 0) return 3;
  for (let r1 = 0; r1 < 3; r1 += 1) {
    for (let r2 = r1 + 1; r2 < 3; r2 += 1) {
      for (let c1 = 0; c1 < 3; c1 += 1) {
        for (let c2 = c1 + 1; c2 < 3; c2 += 1) {
          if (matrix[r1][c1] * matrix[r2][c2] - matrix[r1][c2] * matrix[r2][c1] !== 0) return 2;
        }
      }
    }
  }
  return matrix.some(row => row.some(value => value !== 0)) ? 1 : 0;
}

function stateCubeIndependent() {
  const rows = [];
  for (let x1 = -2; x1 <= 2; x1 += 1) {
    for (let x2 = -2; x2 <= 2; x2 += 1) {
      for (let x3 = -2; x3 <= 2; x3 += 1) rows.push([x1, x2, x3]);
    }
  }
  return rows;
}

function claimValue(claim, antecedent) {
  if (claim === 'FIRST_STRATUM') return antecedent.schedule[0];
  if (claim === 'SCHEDULE') return antecedent.schedule_id;
  if (claim === 'X1') return antecedent.state[0];
  if (claim === 'X2') return antecedent.state[1];
  if (claim === 'X3') return antecedent.state[2];
  if (claim === 'FULL_STATE') return antecedent.state;
  if (claim === 'REPLAY_REQUIRED_FOR_EXACT_STATE') return antecedent.replay_required;
  throw new Error(`unknown independent claim ${claim}`);
}

function quotient(stage, antecedent) {
  if (stage === 0) return ['NULL_REGISTERED_TRACE'];
  return [
    antecedent.matrix.slice(0, stage).map(row => [...row]),
    antecedent.observation.slice(0, stage),
  ];
}

function subset(left, right) {
  return [...left].every(value => right.has(value));
}

function sameSet(left, right) {
  return left.size === right.size && subset(left, right);
}

const states = stateCubeIndependent();
assert.equal(states.length, 125);
assert.equal(new Set(states.map(canonical)).size, 125);

const antecedents = [];
for (const schedule of DROMOLOGICAL_S3_SCHEDULES) {
  const matrix = phasonicObservationMatrix(schedule);
  const replayRequired = rank3(matrix) < 3;
  for (const state of states) {
    antecedents.push({
      id: `${scheduleId(schedule)}:${state.join(',')}`,
      schedule: [...schedule],
      schedule_id: scheduleId(schedule),
      state: [...state],
      matrix: matrix.map(row => [...row]),
      observation: [...observePhasonicState(state, schedule)],
      replay_required: replayRequired,
    });
  }
}
assert.equal(antecedents.length, 750);

// Independent fibre reconstruction: no private helper or certificate table is used.
const fibres = new Map();
const profiles = new Map();
for (const stage of STAGES) {
  const stageFibres = new Map();
  for (const antecedent of antecedents) {
    const key = canonical(quotient(stage, antecedent));
    if (!stageFibres.has(key)) stageFibres.set(key, []);
    stageFibres.get(key).push(antecedent);
  }
  fibres.set(stage, stageFibres);
  for (const [key, members] of stageFibres.entries()) {
    for (const claim of CLAIMS) {
      const union = new Set(members.map(member => canonical(claimValue(claim, member))));
      const intersection = union.size === 1 ? new Set(union) : new Set();
      const gamma = new Set([...union].filter(value => !intersection.has(value)));
      profiles.set(`${stage}|${key}|${claim}`, {
        members: new Set(members.map(member => member.id)),
        union,
        intersection,
        gamma,
        exact: gamma.size === 0,
      });
    }
  }
}

function profile(stage, antecedent, claim) {
  return profiles.get(`${stage}|${canonical(quotient(stage, antecedent))}|${claim}`);
}

const nullRepresentative = antecedents[0];
assert.deepEqual(Object.fromEntries(CLAIMS.map(claim => [claim, profile(0, nullRepresentative, claim).gamma.size])), {
  FIRST_STRATUM: 3,
  SCHEDULE: 6,
  X1: 5,
  X2: 5,
  X3: 5,
  FULL_STATE: 125,
  REPLAY_REQUIRED_FOR_EXACT_STATE: 2,
});

const bySchedule = new Map();
for (const schedule of DROMOLOGICAL_S3_SCHEDULES) {
  const id = scheduleId(schedule);
  const targets = antecedents.filter(antecedent => antecedent.schedule_id === id);
  const claims = [];
  for (const claim of CLAIMS) {
    const cells = STAGES.map(stage => ({
      stage,
      authorized: targets.every(target => profile(stage, target, claim).exact),
    }));
    claims.push({
      claim,
      cells,
      birth: cells.find(cell => cell.authorized)?.stage ?? 'INF',
    });
  }
  bySchedule.set(id, { schedule_id: id, claims });
}

const stageAuthorized = STAGES.map(stage => [...bySchedule.values()].reduce((sum, row) => (
  sum + row.claims.filter(claim => claim.cells.find(cell => cell.stage === stage)?.authorized).length
), 0));
assert.deepEqual(stageAuthorized, [0, 14, 24, 30]);
assert.deepEqual(stageAuthorized.map(value => 42 - value), [42, 28, 18, 12]);

let eventualEarlierHeld = 0;
let neverAuthorized = 0;
for (const scheduleRow of bySchedule.values()) {
  for (const claimRow of scheduleRow.claims) {
    for (const cell of claimRow.cells) {
      if (cell.authorized) continue;
      if (claimRow.birth === 'INF') neverAuthorized += 1;
      else if (cell.stage < claimRow.birth) eventualEarlierHeld += 1;
    }
  }
}
assert.equal(eventualEarlierHeld, 52);
assert.equal(neverAuthorized, 48);

// Complete 15,750 target-indexed refinement assay.
let refinementChecks = 0;
let strictContractions = 0;
let equalGammaTransitions = 0;
let refinementViolations = 0;
let nestingViolations = 0;
for (const antecedent of antecedents) {
  for (const claim of CLAIMS) {
    for (let stage = 0; stage < 3; stage += 1) {
      const coarse = profile(stage, antecedent, claim);
      const fine = profile(stage + 1, antecedent, claim);
      refinementChecks += 1;
      const nested = subset(fine.members, coarse.members);
      const unionContracted = subset(fine.union, coarse.union);
      const intersectionExpanded = subset(coarse.intersection, fine.intersection);
      const gapContracted = subset(fine.gamma, coarse.gamma);
      if (!nested) nestingViolations += 1;
      if (!(nested && unionContracted && intersectionExpanded && gapContracted)) {
        refinementViolations += 1;
      } else if (sameSet(fine.gamma, coarse.gamma)) {
        equalGammaTransitions += 1;
      } else {
        strictContractions += 1;
      }
    }
  }
}
assert.equal(refinementChecks, 15750);
assert.equal(strictContractions, 6800);
assert.equal(equalGammaTransitions, 8950);
assert.equal(nestingViolations, 0);
assert.equal(refinementViolations, 0);

// Complete ordered fine-authorized recompression census with all 19,000 state-indexed controls.
const reopenedByClaim = Object.fromEntries(CLAIMS.map(claim => [claim, 0]));
const preservedByClaim = Object.fromEntries(CLAIMS.map(claim => [claim, 0]));
let transitions = 0;
let reopened = 0;
let preserved = 0;
let reopenedStateChecks = 0;
let preservedStateChecks = 0;
let membraneViolations = 0;
let fineViolations = 0;
const transitionRows = [];
for (const scheduleRow of bySchedule.values()) {
  const targets = antecedents.filter(antecedent => antecedent.schedule_id === scheduleRow.schedule_id);
  for (const claimRow of scheduleRow.claims) {
    for (let fineStage = 1; fineStage <= 3; fineStage += 1) {
      const fineAuthorized = claimRow.cells.find(cell => cell.stage === fineStage)?.authorized === true;
      if (!fineAuthorized) continue;
      for (let coarseStage = 0; coarseStage < fineStage; coarseStage += 1) {
        transitions += 1;
        const coarseAuthorized = claimRow.cells.find(cell => cell.stage === coarseStage)?.authorized === true;
        if (coarseAuthorized) {
          preserved += 1;
          preservedByClaim[claimRow.claim] += 1;
        } else {
          reopened += 1;
          reopenedByClaim[claimRow.claim] += 1;
        }
        let checks = 0;
        for (const target of targets) {
          checks += 1;
          const fine = profile(fineStage, target, claimRow.claim);
          const coarse = profile(coarseStage, target, claimRow.claim);
          if (!fine.exact) fineViolations += 1;
          if (coarse.exact !== coarseAuthorized) membraneViolations += 1;
        }
        if (coarseAuthorized) preservedStateChecks += checks;
        else reopenedStateChecks += checks;
        transitionRows.push({
          schedule_id: scheduleRow.schedule_id,
          claim: claimRow.claim,
          fine_stage: fineStage,
          coarse_stage: coarseStage,
          result: coarseAuthorized ? 'PRESERVED' : 'REOPENED',
        });
      }
    }
  }
}
assert.equal(transitions, 152);
assert.equal(reopened, 100);
assert.equal(preserved, 52);
assert.deepEqual(reopenedByClaim, EXPECTED_REOPEN);
assert.deepEqual(preservedByClaim, EXPECTED_PRESERVE);
assert.equal(reopenedStateChecks, 12500);
assert.equal(preservedStateChecks, 6500);
assert.equal(reopenedStateChecks + preservedStateChecks, 19000);
assert.equal(membraneViolations, 0);
assert.equal(fineViolations, 0);

// Concrete policy rupture: q1 authorizes the replay-required claim, q0 reopens it.
for (const schedule of DROMOLOGICAL_S3_SCHEDULES) {
  const id = scheduleId(schedule);
  const replayRupture = transitionRows.find(row => row.schedule_id === id
    && row.claim === 'REPLAY_REQUIRED_FOR_EXACT_STATE'
    && row.fine_stage === 1
    && row.coarse_stage === 0);
  assert.equal(replayRupture?.result, 'REOPENED');
}

// Concrete safe recompression: schedule identity remains authorized from q3 back to q2.
for (const schedule of DROMOLOGICAL_S3_SCHEDULES) {
  const id = scheduleId(schedule);
  const schedulePreserved = transitionRows.find(row => row.schedule_id === id
    && row.claim === 'SCHEDULE'
    && row.fine_stage === 3
    && row.coarse_stage === 2);
  assert.equal(schedulePreserved?.result, 'PRESERVED');
}

// Only after independent reconstruction do we consult the implementation certificate.
const parent = bitemporalProspectiveReplayMinimalObservationPolicyCertificate();
assert.equal(parent.passed, true);
assert.equal(BITEMPORAL_PROSPECTIVE_REPLAY_MINIMAL_OBSERVATION_POLICY_PARENT_RECEIPT,
  '54b10adf8a30e779b1cb5f15ce6a4e8350285365');
const certificate = admissibilityHorizonRefinementRecompressionRuptureCertificate();
assert.equal(certificate.schema, ADMISSIBILITY_HORIZON_REFINEMENT_RECOMPRESSION_RUPTURE_SCHEMA);
assert.equal(ADMISSIBILITY_HORIZON_REFINEMENT_RECOMPRESSION_RUPTURE_PARENT_RECEIPT,
  '2fefe16e5883f6c4fe36d75e9e4c41331f317911');
assert.equal(certificate.parent_receipt, '2fefe16e5883f6c4fe36d75e9e4c41331f317911');
assert.equal(certificate.passed, true);
assert.deepEqual(certificate.ledger_certificate.stage_rows.map(row => row.authorized), [0, 14, 24, 30]);
assert.deepEqual(certificate.ledger_certificate.stage_rows.map(row => row.held), [42, 28, 18, 12]);
assert.equal(certificate.ledger_certificate.eventually_authorized_earlier_held_cells, 52);
assert.equal(certificate.ledger_certificate.never_authorized_cells, 48);
assert.equal(certificate.refinement_persistence_certificate.target_indexed_checks, 15750);
assert.equal(certificate.refinement_persistence_certificate.strict_gamma_contractions, 6800);
assert.equal(certificate.refinement_persistence_certificate.equal_gamma_transitions, 8950);
assert.equal(certificate.refinement_persistence_certificate.refinement_violations, 0);
assert.equal(certificate.recompression_rupture_certificate.fine_authorized_ordered_transitions, 152);
assert.equal(certificate.recompression_rupture_certificate.reopened_transitions, 100);
assert.equal(certificate.recompression_rupture_certificate.preserved_transitions, 52);
assert.equal(certificate.recompression_rupture_certificate.total_state_indexed_checks, 19000);
assert.deepEqual(certificate.recompression_rupture_certificate.reopened_by_claim, EXPECTED_REOPEN);
assert.deepEqual(certificate.recompression_rupture_certificate.preserved_by_claim, EXPECTED_PRESERVE);

const ash = compileAdmissibilityHorizonRefinementRecompressionProjection(AIA_RECEIVERS.ASH);
assert.equal(ash.runtime_binding, false);
assert.equal(ash.source_state_transform, false);
assert.equal(Object.values(ash.authority).some(Boolean), false);
assert.equal(ash.payload.latent_state_values_exposed, false);
assert.equal(ash.payload.complete_fibre_table_exposed, false);
assert.equal(ash.payload.recompression_witness_table_exposed, false);
assert.equal(rejectAdmissibilityHorizonRecompressionOverreach(ash).accepted, true);

const loom = compileAdmissibilityHorizonRefinementRecompressionProjection(AIA_RECEIVERS.LOOM);
assert.equal(loom.runtime_binding, false);
assert.equal(loom.payload.refinement_checks, 15750);
assert.equal(loom.payload.reopened_transitions, 100);
assert.equal(loom.payload.preserved_transitions, 52);
assert.equal(rejectAdmissibilityHorizonRecompressionOverreach(loom).accepted, true);

for (const hostile of [
  { ...loom, recompression_never_reopens_authority: true },
  { ...loom, recompression_always_reopens_authority: true },
  { ...loom, prior_authority_implies_current_authority: true },
  { ...loom, fine_record_authority_backfills_coarse_record: true },
  { ...loom, recompression_deletes_source_state: true },
  { ...loom, recompression_reverses_source_truth: true },
  { ...loom, null_registered_trace_means_absent_source: true },
  { ...loom, source_state_transform: true },
  { ...loom, runtime_binding: true },
  { ...loom, claim_ceiling: { ...loom.claim_ceiling, universal_ai_memory_theorem: true } },
  { ...loom, claim_ceiling: { ...loom.claim_ceiling, general_database_theorem: true } },
  { ...loom, claim_ceiling: { ...loom.claim_ceiling, shannon_or_entropy_theorem: true } },
  { ...loom, claim_ceiling: { ...loom.claim_ceiling, asymptotic_information_theorem: true } },
]) {
  assert.equal(rejectAdmissibilityHorizonRecompressionOverreach(hostile).accepted, false);
}

assert.equal(rejectAdmissibilityHorizonRecompressionOverreach({
  ...ash,
  payload: { ...ash.payload, recompression_witness_table_exposed: true },
}).accepted, false);

console.log('Ash A15-R0 admissibility-horizon refinement persistence / recompression rupture hostile passed.');
