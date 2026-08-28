import assert from 'node:assert/strict';

import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
  phasonicObservationMatrix,
  observePhasonicState,
} from '../app/dome-world/previews/a15-r0/phasonic-supermoire-dromological-tomography.js';
import { DROMOLOGICAL_S3_SCHEDULES } from '../app/dome-world/previews/a15-r0/dromological-s3-schedule-atlas-first-stratum-gate.js';
import { bitemporalAuthorityBirthNonretroactiveJurisdictionCertificate } from '../app/dome-world/previews/a15-r0/bitemporal-authority-birth-nonretroactive-jurisdiction.js';
import { bitemporalProspectiveReplayMinimalObservationPolicyCertificate } from '../app/dome-world/previews/a15-r0/bitemporal-prospective-replay-minimal-observation-policy.js';
import { admissibilityHorizonRefinementRecompressionRuptureCertificate } from '../app/dome-world/previews/a15-r0/admissibility-horizon-refinement-recompression-rupture.js';
import {
  CLAIM_BUNDLE_MINIMAL_SUFFICIENT_CUSTODY_FRONTIER_SCHEMA,
  CLAIM_BUNDLE_MINIMAL_SUFFICIENT_CUSTODY_FRONTIER_PARENT_RECEIPT,
  claimBundleMinimalSufficientCustodyFrontierCertificate,
  compileClaimBundleMinimalSufficientCustodyProjection,
  rejectClaimBundleCustodyFrontierOverreach,
} from '../app/dome-world/previews/a15-r0/claim-bundle-minimal-sufficient-custody-frontier.js';

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

function scheduleId(schedule) {
  const letters = { PHI_PAIR_WIRE: 'P', HEXAGONAL_MOIRE: 'H', ICOSAHEDRAL_PHASON: 'I' };
  return schedule.map(stratum => letters[stratum]).join('-');
}

function stateCube() {
  const out = [];
  for (let x1 = -2; x1 <= 2; x1 += 1) {
    for (let x2 = -2; x2 <= 2; x2 += 1) {
      for (let x3 = -2; x3 <= 2; x3 += 1) out.push([x1, x2, x3]);
    }
  }
  return out;
}

// Independent recursive powerset, not the implementation bitmask enumerator.
function nonemptyBundles(values) {
  const out = [];
  const visit = (index, current) => {
    if (index === values.length) {
      if (current.length > 0) out.push([...current]);
      return;
    }
    visit(index + 1, current);
    current.push(values[index]);
    visit(index + 1, current);
    current.pop();
  };
  visit(0, []);
  return out.sort((left, right) => left.length - right.length || left.join('+').localeCompare(right.join('+')));
}

function quotientKey(stage, antecedent) {
  if (stage === 0) return JSON.stringify(['NULL_REGISTERED_TRACE']);
  return JSON.stringify([
    antecedent.matrix.slice(0, stage),
    antecedent.observation.slice(0, stage),
  ]);
}

function claimValue(claim, antecedent) {
  if (claim === 'FIRST_STRATUM') return antecedent.schedule[0];
  if (claim === 'SCHEDULE') return antecedent.schedule_id;
  if (claim === 'X1') return antecedent.state[0];
  if (claim === 'X2') return antecedent.state[1];
  if (claim === 'X3') return antecedent.state[2];
  if (claim === 'FULL_STATE') return antecedent.state;
  if (claim === 'REPLAY_REQUIRED_FOR_EXACT_STATE') return antecedent.replay_required;
  throw new Error(`unknown hostile claim ${claim}`);
}

function bundleValue(bundle, antecedent) {
  return JSON.stringify(bundle.map(claim => [claim, claimValue(claim, antecedent)]));
}

function buildAntecedents(policy) {
  const states = stateCube();
  const policyBySchedule = new Map(policy.policy_geometry.map(row => [row.schedule_id, row]));
  const antecedents = [];
  for (const schedule of DROMOLOGICAL_S3_SCHEDULES) {
    const id = scheduleId(schedule);
    const policyRow = policyBySchedule.get(id);
    assert.ok(policyRow);
    const matrix = phasonicObservationMatrix(schedule);
    for (const state of states) {
      antecedents.push({
        id: `${id}:${state.join(',')}`,
        schedule,
        schedule_id: id,
        state,
        matrix,
        observation: observePhasonicState(state, schedule),
        replay_required: policyRow.replay_required,
      });
    }
  }
  return { states, antecedents };
}

function buildFibres(antecedents) {
  const byStage = new Map();
  for (const stage of STAGES) {
    const fibres = new Map();
    for (const antecedent of antecedents) {
      const key = quotientKey(stage, antecedent);
      if (!fibres.has(key)) fibres.set(key, []);
      fibres.get(key).push(antecedent);
    }
    byStage.set(stage, fibres);
  }
  return byStage;
}

function independentBirths(jurisdiction, policy) {
  const replay = new Map(policy.replay_required_authority_certificate.schedules.map(row => [row.schedule_id, row.birth]));
  const births = new Map();
  for (const row of jurisdiction.schedules) {
    const claimBirths = Object.fromEntries(row.claim_rows.map(claim => [claim.claim, claim.birth]));
    claimBirths.REPLAY_REQUIRED_FOR_EXACT_STATE = replay.get(row.schedule_id);
    births.set(row.schedule_id, claimBirths);
  }
  return births;
}

function maxBirth(bundle, births) {
  let max = 0;
  for (const claim of bundle) {
    if (births[claim] === 'INF') return 'INF';
    max = Math.max(max, births[claim]);
  }
  return max;
}

const parent = admissibilityHorizonRefinementRecompressionRuptureCertificate();
const jurisdiction = bitemporalAuthorityBirthNonretroactiveJurisdictionCertificate();
const policy = bitemporalProspectiveReplayMinimalObservationPolicyCertificate();
assert.equal(parent.passed, true);
assert.equal(jurisdiction.passed, true);
assert.equal(policy.passed, true);
assert.equal(CLAIM_BUNDLE_MINIMAL_SUFFICIENT_CUSTODY_FRONTIER_PARENT_RECEIPT,
  '623e03795d9cb4dfef33c003b05c3efc45da3f9a');

const bundles = nonemptyBundles(CLAIMS);
assert.equal(bundles.length, 127);
assert.equal(new Set(bundles.map(bundle => bundle.join('+'))).size, 127);
const built = buildAntecedents(policy);
assert.equal(built.states.length, 125);
assert.equal(built.antecedents.length, 750);
const fibres = buildFibres(built.antecedents);
const births = independentBirths(jurisdiction, policy);
const targetsBySchedule = new Map(DROMOLOGICAL_S3_SCHEDULES.map(schedule => {
  const id = scheduleId(schedule);
  return [id, built.antecedents.filter(antecedent => antecedent.schedule_id === id)];
}));

// Cache direct joint supports once per occupied fibre and bundle.
const jointCache = new Map();
const claimCache = new Map();
function jointExact(stage, target, bundle) {
  const fibreKey = quotientKey(stage, target);
  const bundleKey = bundle.join('+');
  const cacheKey = `${stage}|${fibreKey}|${bundleKey}`;
  if (!jointCache.has(cacheKey)) {
    const fibre = fibres.get(stage).get(fibreKey);
    const support = new Set(fibre.map(member => bundleValue(bundle, member)));
    jointCache.set(cacheKey, support.size === 1);
  }
  return jointCache.get(cacheKey);
}
function claimExact(stage, target, claim) {
  const fibreKey = quotientKey(stage, target);
  const cacheKey = `${stage}|${fibreKey}|${claim}`;
  if (!claimCache.has(cacheKey)) {
    const fibre = fibres.get(stage).get(fibreKey);
    const support = new Set(fibre.map(member => JSON.stringify(claimValue(claim, member))));
    claimCache.set(cacheKey, support.size === 1);
  }
  return claimCache.get(cacheKey);
}

const rows = [];
let jointTargetChecks = 0;
let cellAuthorizationChecks = 0;
let mixedHeldCells = 0;
for (const [id, targets] of targetsBySchedule.entries()) {
  for (const bundle of bundles) {
    const cells = [];
    for (const stage of STAGES) {
      let exactCount = 0;
      for (const target of targets) {
        jointTargetChecks += 1;
        if (jointExact(stage, target, bundle)) exactCount += 1;
      }
      cellAuthorizationChecks += 1;
      const authorized = exactCount === 125;
      const mixed = exactCount > 0 && exactCount < 125;
      if (!authorized && mixed) mixedHeldCells += 1;
      cells.push({ stage, authorized, exactCount, mixed });
    }
    const actualBirth = cells.find(cell => cell.authorized)?.stage ?? 'INF';
    const predictedBirth = maxBirth(bundle, births.get(id));
    assert.equal(actualBirth, predictedBirth, `max-birth mismatch ${id} ${bundle.join('+')}`);
    rows.push({
      schedule_id: id,
      bundle,
      bundle_id: bundle.join('+'),
      size: bundle.length,
      actualBirth,
      cells,
    });
  }
}
assert.equal(rows.length, 762);
assert.equal(jointTargetChecks, 381000);
assert.equal(cellAuthorizationChecks, 3048);
assert.ok(mixedHeldCells > 0);

// Red-run 2362 scar: a held schedule-level cell may mix exact and wounded target fibres.
const hpiFullState = rows.find(row => row.schedule_id === 'H-P-I' && row.bundle_id === 'FULL_STATE');
const hpiFullStateQ3 = hpiFullState.cells.find(cell => cell.stage === 3);
assert.equal(hpiFullStateQ3.authorized, false);
assert.ok(hpiFullStateQ3.exactCount > 0 && hpiFullStateQ3.exactCount < 125);

const distribution = { '1': 0, '2': 0, '3': 0, INF: 0 };
const perSchedule = {};
for (const row of rows) {
  const key = String(row.actualBirth);
  distribution[key] += 1;
  perSchedule[row.schedule_id] ??= { '1': 0, '2': 0, '3': 0, INF: 0 };
  perSchedule[row.schedule_id][key] += 1;
}
assert.deepEqual(distribution, { '1': 26, '2': 80, '3': 208, INF: 448 });
assert.deepEqual(perSchedule, {
  'P-H-I': { '1': 7, '2': 24, '3': 96, INF: 0 },
  'P-I-H': { '1': 7, '2': 24, '3': 96, INF: 0 },
  'H-P-I': { '1': 3, '2': 4, '3': 8, INF: 112 },
  'H-I-P': { '1': 3, '2': 12, '3': 0, INF: 112 },
  'I-P-H': { '1': 3, '2': 4, '3': 8, INF: 112 },
  'I-H-P': { '1': 3, '2': 12, '3': 0, INF: 112 },
});

const stageAuthorized = STAGES.map(stage => rows.filter(row => row.cells.find(cell => cell.stage === stage).authorized).length);
const stageHeld = stageAuthorized.map(count => 762 - count);
assert.deepEqual(stageAuthorized, [0, 26, 106, 314]);
assert.deepEqual(stageHeld, [762, 736, 656, 448]);
assert.equal(stageAuthorized.reduce((sum, value) => sum + value, 0), 446);
assert.equal(stageHeld.reduce((sum, value) => sum + value, 0), 2602);
assert.equal(rows.filter(row => row.actualBirth !== 'INF').length, 314);
assert.equal(rows.filter(row => row.actualBirth === 'INF').length, 448);
assert.equal(rows.filter(row => row.actualBirth !== 'INF').reduce((sum, row) => sum + row.actualBirth, 0), 810);
assert.equal(rows.filter(row => row.actualBirth === 'INF').length * 4, 1792);

// Bundle conjunction law: direct tuple constancy iff every constituent support is constant.
let conjunctionChecks = 0;
for (const row of rows) {
  const targets = targetsBySchedule.get(row.schedule_id);
  for (const stage of STAGES) {
    for (const target of targets) {
      conjunctionChecks += 1;
      const joint = jointExact(stage, target, row.bundle);
      const constituents = row.bundle.every(claim => claimExact(stage, target, claim));
      assert.equal(joint, constituents);
    }
  }
}
assert.equal(conjunctionChecks, 381000);

// Cardinality has no custody authority.
const phiX1 = rows.find(row => row.schedule_id === 'P-H-I' && row.bundle_id === 'X1');
const phiX3 = rows.find(row => row.schedule_id === 'P-H-I' && row.bundle_id === 'X3');
assert.equal(phiX1.size, 1);
assert.equal(phiX3.size, 1);
assert.equal(phiX1.actualBirth, 1);
assert.equal(phiX3.actualBirth, 3);
assert.ok(rows.some(left => rows.some(right => (
  left.schedule_id === right.schedule_id
  && left.bundle_id !== right.bundle_id
  && left.actualBirth !== 'INF'
  && left.actualBirth === right.actualBirth
))));

// Exact recompression frontier and state-indexed controls.
let transitions = 0;
let preserved = 0;
let reopened = 0;
let preservingChecks = 0;
let reopeningChecks = 0;
const byBirth = {
  '1': { transitions: 0, preserved: 0, reopened: 0 },
  '2': { transitions: 0, preserved: 0, reopened: 0 },
  '3': { transitions: 0, preserved: 0, reopened: 0 },
};
for (const row of rows) {
  if (row.actualBirth === 'INF') continue;
  const birth = row.actualBirth;
  const targets = targetsBySchedule.get(row.schedule_id);
  for (let fine = birth; fine <= 3; fine += 1) {
    assert.equal(row.cells.find(cell => cell.stage === fine).authorized, true);
    for (let coarse = 0; coarse < fine; coarse += 1) {
      transitions += 1;
      byBirth[String(birth)].transitions += 1;
      const shouldPreserve = coarse >= birth;
      assert.equal(row.cells.find(cell => cell.stage === coarse).authorized, shouldPreserve);
      if (shouldPreserve) {
        preserved += 1;
        byBirth[String(birth)].preserved += 1;
      } else {
        reopened += 1;
        byBirth[String(birth)].reopened += 1;
      }
      let coarseWounds = 0;
      for (const target of targets) {
        assert.equal(jointExact(fine, target, row.bundle), true);
        const coarseExact = jointExact(coarse, target, row.bundle);
        if (shouldPreserve) {
          preservingChecks += 1;
          assert.equal(coarseExact, true);
        } else {
          reopeningChecks += 1;
          if (!coarseExact) {
            coarseWounds += 1;
            assert.equal(row.bundle.some(claim => !claimExact(coarse, target, claim)), true);
          }
        }
      }
      if (!shouldPreserve) assert.ok(coarseWounds > 0, `missing reopened wound ${row.schedule_id} ${row.bundle_id} q${fine}->q${coarse}`);
    }
  }
}
assert.equal(transitions, 1180);
assert.equal(preserved, 158);
assert.equal(reopened, 1022);
assert.equal(preservingChecks, 19750);
assert.equal(reopeningChecks, 127750);
assert.equal(preservingChecks + reopeningChecks, 147500);
assert.deepEqual(byBirth, {
  '1': { transitions: 156, preserved: 78, reopened: 78 },
  '2': { transitions: 400, preserved: 80, reopened: 320 },
  '3': { transitions: 624, preserved: 0, reopened: 624 },
});

const certificate = claimBundleMinimalSufficientCustodyFrontierCertificate();
assert.equal(certificate.schema, CLAIM_BUNDLE_MINIMAL_SUFFICIENT_CUSTODY_FRONTIER_SCHEMA);
assert.equal(certificate.parent_receipt, CLAIM_BUNDLE_MINIMAL_SUFFICIENT_CUSTODY_FRONTIER_PARENT_RECEIPT);
assert.equal(certificate.finite_domain.nonempty_bundles_per_schedule, 127);
assert.equal(certificate.finite_domain.schedule_bundle_pairs, 762);
assert.equal(certificate.finite_domain.bundle_jurisdiction_cells, 3048);
assert.equal(certificate.bundle_support_certificate.joint_support_target_checks, 381000);
assert.equal(certificate.bundle_support_certificate.cell_authorization_checks, 3048);
assert.ok(certificate.bundle_support_certificate.mixed_held_cells > 0);
assert.deepEqual(certificate.minimum_sufficient_custody_census.minimum_stage_distribution,
  { '1': 26, '2': 80, '3': 208, INF: 448 });
assert.deepEqual(certificate.minimum_sufficient_custody_census.stage_rows.map(row => row.authorized), [0, 26, 106, 314]);
assert.equal(certificate.minimum_sufficient_custody_census.terminally_authorizable_bundles, 314);
assert.equal(certificate.minimum_sufficient_custody_census.unreached_bundles, 448);
assert.equal(certificate.authority_preserving_recompression_frontier.fine_authorized_ordered_transitions, 1180);
assert.equal(certificate.authority_preserving_recompression_frontier.preserved_transitions, 158);
assert.equal(certificate.authority_preserving_recompression_frontier.reopened_transitions, 1022);
assert.equal(certificate.authority_preserving_recompression_frontier.total_state_indexed_checks, 147500);
assert.equal(certificate.cardinality_nonidentity_certificate.same_bundle_size_does_not_identify_floor, true);
assert.equal(certificate.cardinality_nonidentity_certificate.same_floor_does_not_identify_bundle, true);
assert.equal(certificate.passed, true);

const ash = compileClaimBundleMinimalSufficientCustodyProjection(AIA_RECEIVERS.ASH);
const loom = compileClaimBundleMinimalSufficientCustodyProjection(AIA_RECEIVERS.LOOM);
assert.deepEqual(ash.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(loom.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.equal(Object.values(ash.authority).some(Boolean), false);
assert.equal(Object.values(loom.authority).some(Boolean), false);
assert.equal(ash.payload.complete_bundle_table_exposed, false);
assert.equal(ash.payload.complete_fibre_table_exposed, false);
assert.equal(ash.payload.latent_state_values_exposed, false);
assert.equal(loom.payload.schedule_bundle_pairs, 762);
assert.deepEqual(loom.payload.minimum_stage_distribution, { '1': 26, '2': 80, '3': 208, INF: 448 });
assert.equal(loom.payload.preserved_recompressions, 158);
assert.equal(loom.payload.reopened_recompressions, 1022);

assert.equal(rejectClaimBundleCustodyFrontierOverreach({
  ...loom,
  bundle_floor_from_cardinality_only: true,
}).accepted, false);
assert.equal(rejectClaimBundleCustodyFrontierOverreach({
  ...loom,
  same_minimum_stage_implies_same_bundle: true,
}).accepted, false);
assert.equal(rejectClaimBundleCustodyFrontierOverreach({
  ...loom,
  all_bundles_terminally_authorized: true,
}).accepted, false);
assert.equal(rejectClaimBundleCustodyFrontierOverreach({
  ...loom,
  inf_means_universally_unknowable: true,
}).accepted, false);
assert.equal(rejectClaimBundleCustodyFrontierOverreach({
  ...loom,
  recompression_below_floor_preserves_bundle: true,
}).accepted, false);
assert.equal(rejectClaimBundleCustodyFrontierOverreach({
  ...loom,
  source_state_transform: true,
}).accepted, false);
assert.equal(rejectClaimBundleCustodyFrontierOverreach({
  ...loom,
  claim_ceiling: { ...loom.claim_ceiling, universal_sufficient_statistic: true },
}).accepted, false);
assert.equal(rejectClaimBundleCustodyFrontierOverreach({
  ...loom,
  claim_ceiling: { ...loom.claim_ceiling, asymptotic_optimization: true },
}).accepted, false);
assert.equal(rejectClaimBundleCustodyFrontierOverreach({
  ...ash,
  payload: { ...ash.payload, complete_bundle_table_exposed: true },
}).accepted, false);

console.log('Ash A15-R0 claim-bundle minimal sufficient custody frontier hostile tests passed.');
