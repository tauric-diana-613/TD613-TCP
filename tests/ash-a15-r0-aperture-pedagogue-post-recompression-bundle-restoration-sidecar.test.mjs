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
import { claimBundleMinimalSufficientCustodyFrontierCertificate } from '../app/dome-world/previews/a15-r0/claim-bundle-minimal-sufficient-custody-frontier.js';
import {
  POST_RECOMPRESSION_BUNDLE_RESTORATION_SIDECAR_SCHEMA,
  POST_RECOMPRESSION_BUNDLE_RESTORATION_SIDECAR_PARENT_RECEIPT,
  postRecompressionBundleRestorationSidecarCertificate,
  compilePostRecompressionBundleRestorationProjection,
  rejectPostRecompressionBundleRestorationOverreach,
} from '../app/dome-world/previews/a15-r0/post-recompression-bundle-restoration-sidecar.js';

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
const EXPECTED_M = {
  '2':82,'3':36,'5':298,'6':48,'10':90,'15':36,'25':88,'30':64,
  '50':88,'75':16,'125':18,'150':32,'250':18,'375':36,'750':72,
};
const EXPECTED_SCHEDULE = {
  'P-H-I': {'2':19,'3':6,'5':126,'6':8,'10':30,'15':12,'25':44,'30':20,'50':44,'75':8,'125':9,'150':16,'250':9,'375':18,'750':36},
  'P-I-H': {'2':19,'3':6,'5':126,'6':8,'10':30,'15':12,'25':44,'30':20,'50':44,'75':8,'125':9,'150':16,'250':9,'375':18,'750':36},
  'H-P-I': {'2':11,'3':6,'5':13,'6':8,'10':5,'15':2,'30':4},
  'H-I-P': {'2':11,'3':6,'5':10,'6':8,'10':10,'15':4,'30':8},
  'I-P-H': {'2':11,'3':6,'5':13,'6':8,'10':5,'15':2,'30':4},
  'I-H-P': {'2':11,'3':6,'5':10,'6':8,'10':10,'15':4,'30':8},
};
const EXPECTED_WITNESSES = [
  {m:2,schedule:'H-I-P',bundle:'REPLAY_REQUIRED_FOR_EXACT_STATE',birth:1,fine:1,coarse:0},
  {m:3,schedule:'H-I-P',bundle:'FIRST_STRATUM',birth:1,fine:1,coarse:0},
  {m:5,schedule:'H-I-P',bundle:'X3',birth:2,fine:2,coarse:0},
  {m:6,schedule:'H-I-P',bundle:'SCHEDULE',birth:2,fine:2,coarse:0},
  {m:10,schedule:'H-I-P',bundle:'X3+REPLAY_REQUIRED_FOR_EXACT_STATE',birth:2,fine:2,coarse:0},
  {m:15,schedule:'H-I-P',bundle:'FIRST_STRATUM+X3',birth:2,fine:2,coarse:0},
  {m:25,schedule:'P-H-I',bundle:'X1+X2',birth:2,fine:2,coarse:0},
  {m:30,schedule:'H-I-P',bundle:'SCHEDULE+X3',birth:2,fine:2,coarse:0},
  {m:50,schedule:'P-H-I',bundle:'X1+X2+REPLAY_REQUIRED_FOR_EXACT_STATE',birth:2,fine:2,coarse:0},
  {m:75,schedule:'P-H-I',bundle:'FIRST_STRATUM+X1+X2',birth:2,fine:2,coarse:0},
  {m:125,schedule:'P-H-I',bundle:'FULL_STATE',birth:3,fine:3,coarse:0},
  {m:150,schedule:'P-H-I',bundle:'SCHEDULE+X1+X2',birth:2,fine:2,coarse:0},
  {m:250,schedule:'P-H-I',bundle:'FULL_STATE+REPLAY_REQUIRED_FOR_EXACT_STATE',birth:3,fine:3,coarse:0},
  {m:375,schedule:'P-H-I',bundle:'FIRST_STRATUM+FULL_STATE',birth:3,fine:3,coarse:0},
  {m:750,schedule:'P-H-I',bundle:'SCHEDULE+FULL_STATE',birth:3,fine:3,coarse:0},
];

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

// Independent recursive powerset; deliberately avoids the parent bitmask enumerator.
function nonemptyBundles(values) {
  const out = [];
  const visit = (index, current) => {
    if (index === values.length) {
      if (current.length) out.push([...current]);
      return;
    }
    visit(index + 1, current);
    current.push(values[index]);
    visit(index + 1, current);
    current.pop();
  };
  visit(0, []);
  return out;
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
  throw new Error(`unknown hostile restoration claim ${claim}`);
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

function inheritedBirths(jurisdiction, policy) {
  const replayBirth = new Map(policy.replay_required_authority_certificate.schedules.map(row => [row.schedule_id, row.birth]));
  const out = new Map();
  for (const schedule of jurisdiction.schedules) {
    const births = Object.fromEntries(schedule.claim_rows.map(row => [row.claim, row.birth]));
    births.REPLAY_REQUIRED_FOR_EXACT_STATE = replayBirth.get(schedule.schedule_id) ?? 'INF';
    out.set(schedule.schedule_id, births);
  }
  return out;
}

function maxBirth(bundle, births) {
  let maximum = 0;
  for (const claim of bundle) {
    const birth = births[claim];
    if (birth === 'INF') return 'INF';
    maximum = Math.max(maximum, birth);
  }
  return maximum;
}

function support(fibres, stage, key, bundle) {
  const members = fibres.get(stage).get(key);
  assert.ok(members);
  return [...new Set(members.map(member => bundleValue(bundle, member)))].sort();
}

function increment(map, key) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function normalized(map) {
  const out = {};
  [...map.entries()].sort((a, b) => Number(a[0]) - Number(b[0]))
    .forEach(([key, count]) => { if (count) out[String(key)] = count; });
  return out;
}

const jurisdiction = bitemporalAuthorityBirthNonretroactiveJurisdictionCertificate();
const policy = bitemporalProspectiveReplayMinimalObservationPolicyCertificate();
const parent = claimBundleMinimalSufficientCustodyFrontierCertificate();
assert.equal(jurisdiction.passed, true);
assert.equal(policy.passed, true);
assert.equal(parent.passed, true);
assert.equal(POST_RECOMPRESSION_BUNDLE_RESTORATION_SIDECAR_PARENT_RECEIPT,
  'c83bafb12ff6e44f10481f41190fd91bbbf85650');

const built = buildAntecedents(policy);
assert.equal(built.states.length, 125);
assert.equal(built.antecedents.length, 750);
const fibres = buildFibres(built.antecedents);
const bundles = nonemptyBundles(CLAIMS);
assert.equal(bundles.length, 127);
const birthsBySchedule = inheritedBirths(jurisdiction, policy);
const targetsBySchedule = new Map(DROMOLOGICAL_S3_SCHEDULES.map(schedule => {
  const id = scheduleId(schedule);
  return [id, built.antecedents.filter(antecedent => antecedent.schedule_id === id)];
}));

let transitions = 0;
let unsafeTransitions = 0;
let safeTransitions = 0;
let unsafeFibreEvaluations = 0;
let safeFibreEvaluations = 0;
let unsafeWoundedFibres = 0;
let unsafeExactFibres = 0;
let safeWoundedFibres = 0;
let safeExactFibres = 0;
let lowerBoundChecks = 0;
let unsafeTargetChecks = 0;
let safeTargetChecks = 0;
let explicitSmallerAlphabetCollisions = 0;
const mCounts = new Map();
const scheduleCounts = new Map(DROMOLOGICAL_S3_SCHEDULES.map(schedule => [scheduleId(schedule), new Map()]));
const transitionRows = new Map();

for (const schedule of DROMOLOGICAL_S3_SCHEDULES) {
  const id = scheduleId(schedule);
  const targets = targetsBySchedule.get(id);
  const births = birthsBySchedule.get(id);
  assert.equal(targets.length, 125);
  for (const bundle of bundles) {
    const birth = maxBirth(bundle, births);
    if (birth === 'INF') continue;
    const bundleId = bundle.join('+');
    for (let fine = birth; fine <= 3; fine += 1) {
      for (let coarse = 0; coarse < fine; coarse += 1) {
        transitions += 1;
        const unsafe = coarse < birth;
        const occupied = [...new Set(targets.map(target => quotientKey(coarse, target)))];
        const supports = occupied.map(key => ({ key, values: support(fibres, coarse, key, bundle) }));
        const m = Math.max(...supports.map(row => row.values.length));
        const wounded = supports.filter(row => row.values.length > 1).length;
        const exact = supports.filter(row => row.values.length === 1).length;
        const key = `${id}|${bundleId}|${fine}|${coarse}`;
        transitionRows.set(key, { schedule_id:id, bundle, bundle_id:bundleId, birth, fine, coarse, unsafe, m, supports });

        if (unsafe) {
          unsafeTransitions += 1;
          unsafeFibreEvaluations += supports.length;
          unsafeWoundedFibres += wounded;
          unsafeExactFibres += exact;
          increment(mCounts, m);
          increment(scheduleCounts.get(id), m);
          assert.ok(m > 1, `unsafe transition lost wound ${key}`);
          const maximizing = supports.find(row => row.values.length === m);
          assert.ok(maximizing);
          lowerBoundChecks += 1;

          // Explicit m(T)-1 hostile: force m distinct bundle values through m-1 labels.
          // The deterministic modulo map collides values 0 and m-1 on the same coarse record.
          const hostileAlphabet = m - 1;
          assert.ok(hostileAlphabet < m);
          const firstValue = maximizing.values[0];
          const collidingValue = maximizing.values[hostileAlphabet];
          assert.notEqual(firstValue, collidingValue);
          assert.equal(0 % hostileAlphabet, hostileAlphabet % hostileAlphabet);
          explicitSmallerAlphabetCollisions += 1;

          const supportByKey = new Map(supports.map(row => [row.key, row.values]));
          for (const target of targets) {
            unsafeTargetChecks += 1;
            const coarseKey = quotientKey(coarse, target);
            const values = supportByKey.get(coarseKey);
            assert.ok(values);
            const value = bundleValue(bundle, target);
            const label = values.indexOf(value);
            assert.ok(label >= 0 && label < m);
            assert.equal(values[label], value);
          }
        } else {
          safeTransitions += 1;
          safeFibreEvaluations += supports.length;
          safeWoundedFibres += wounded;
          safeExactFibres += exact;
          for (const target of targets) {
            safeTargetChecks += 1;
            const values = support(fibres, coarse, quotientKey(coarse, target), bundle);
            assert.equal(values.length, 1);
            assert.equal(values[0], bundleValue(bundle, target));
          }
        }
      }
    }
  }
}

assert.equal(transitions, 1180);
assert.equal(unsafeTransitions, 1022);
assert.equal(safeTransitions, 158);
assert.deepEqual(normalized(mCounts), EXPECTED_M);
assert.equal(Math.max(...mCounts.keys()), 750);
assert.deepEqual(Object.fromEntries([...scheduleCounts.entries()].map(([id, counts]) => [id, normalized(counts)])), EXPECTED_SCHEDULE);
assert.equal(unsafeFibreEvaluations, 7550);
assert.equal(safeFibreEvaluations, 3382);
assert.equal(unsafeFibreEvaluations + safeFibreEvaluations, 10932);
assert.equal(unsafeWoundedFibres, 7550);
assert.equal(unsafeExactFibres, 0);
assert.equal(safeWoundedFibres, 0);
assert.equal(safeExactFibres, 3382);
assert.equal(lowerBoundChecks, 1022);
assert.equal(explicitSmallerAlphabetCollisions, 1022);
assert.equal(unsafeTargetChecks, 127750);
assert.equal(safeTargetChecks, 19750);
assert.equal(unsafeTargetChecks + safeTargetChecks, 147500);

// Every preregistered distinct m(T) has its explicit maximizing q0 lower-bound fibre.
for (const witness of EXPECTED_WITNESSES) {
  const row = transitionRows.get(`${witness.schedule}|${witness.bundle}|${witness.fine}|${witness.coarse}`);
  assert.ok(row, `missing preregistered lower-bound transition m=${witness.m}`);
  assert.equal(row.birth, witness.birth);
  assert.equal(row.m, witness.m);
  const q0 = row.supports.find(candidate => candidate.key === JSON.stringify(['NULL_REGISTERED_TRACE']));
  assert.ok(q0);
  assert.equal(q0.values.length, witness.m);
  assert.equal(fibres.get(0).get(q0.key).length, 750);
}

// Bundle size cannot identify cost: two singleton q1 bundles at the same transition depth differ.
const replayQ1Q0 = transitionRows.get('P-H-I|REPLAY_REQUIRED_FOR_EXACT_STATE|1|0');
const x1Q1Q0 = transitionRows.get('P-H-I|X1|1|0');
assert.equal(replayQ1Q0.bundle.length, 1);
assert.equal(x1Q1Q0.bundle.length, 1);
assert.equal(replayQ1Q0.birth, 1);
assert.equal(x1Q1Q0.birth, 1);
assert.equal(replayQ1Q0.m, 2);
assert.equal(x1Q1Q0.m, 5);

// Same floor, different cost.
const firstQ1Q0 = transitionRows.get('P-H-I|FIRST_STRATUM|1|0');
assert.equal(firstQ1Q0.birth, x1Q1Q0.birth);
assert.equal(firstQ1Q0.m, 3);
assert.equal(x1Q1Q0.m, 5);

// Same cost, different bundle identity.
const firstReplayQ1Q0 = transitionRows.get('P-H-I|FIRST_STRATUM+REPLAY_REQUIRED_FOR_EXACT_STATE|1|0');
assert.equal(firstQ1Q0.m, 3);
assert.equal(firstReplayQ1Q0.m, 3);
assert.notEqual(firstQ1Q0.bundle_id, firstReplayQ1Q0.bundle_id);

// Requested-bundle restoration cannot widen to a superset claim.
const pMembers = built.antecedents.filter(row => row.schedule_id === 'P-H-I');
const sameFirstDifferentX1 = pMembers.find(left => pMembers.some(right => (
  left !== right
  && left.schedule[0] === right.schedule[0]
  && left.state[0] !== right.state[0]
)));
assert.ok(sameFirstDifferentX1);
const partner = pMembers.find(right => (
  right !== sameFirstDifferentX1
  && right.schedule[0] === sameFirstDifferentX1.schedule[0]
  && right.state[0] !== sameFirstDifferentX1.state[0]
));
assert.ok(partner);
assert.equal(claimValue('FIRST_STRATUM', sameFirstDifferentX1), claimValue('FIRST_STRATUM', partner));
assert.notEqual(claimValue('X1', sameFirstDifferentX1), claimValue('X1', partner));

// Preserve #854 red->repair quantifier scar: the parent atlas still contains mixed held target fibres.
const parentMixed = parent.bundle_support_certificate.rows.find(row => (
  row.schedule_id === 'H-P-I' && row.bundle_id === 'FULL_STATE'
));
assert.ok(parentMixed);
assert.equal(parentMixed.actual_birth, 'INF');
const parentMixedQ3 = parentMixed.cells.find(cell => cell.stage === 3);
assert.equal(parentMixedQ3.authorized, false);
assert.equal(parentMixedQ3.mixed_target_fibres, true);
assert.ok(parentMixedQ3.exact_target_count > 0);
assert.ok(parentMixedQ3.inexact_target_count > 0);
// The restricted finite-birth restoration chamber can nevertheless have all its occupied coarse fibres wounded.
assert.equal(unsafeExactFibres, 0);
assert.equal(unsafeWoundedFibres, 7550);

const certificate = postRecompressionBundleRestorationSidecarCertificate();
assert.equal(certificate.schema, POST_RECOMPRESSION_BUNDLE_RESTORATION_SIDECAR_SCHEMA);
assert.equal(certificate.parent_receipt, POST_RECOMPRESSION_BUNDLE_RESTORATION_SIDECAR_PARENT_RECEIPT);
assert.equal(certificate.finite_domain.unsafe_transitions, 1022);
assert.equal(certificate.finite_domain.safe_controls, 158);
assert.deepEqual(certificate.restoration_census.m_distribution, EXPECTED_M);
assert.deepEqual(certificate.restoration_census.per_schedule_m_distribution, EXPECTED_SCHEDULE);
assert.equal(certificate.restoration_census.maximum_m, 750);
assert.equal(certificate.restoration_census.unsafe_coarse_fibre_support_evaluations, 7550);
assert.equal(certificate.restoration_census.safe_coarse_fibre_support_evaluations, 3382);
assert.equal(certificate.restoration_census.lower_bound_witness_checks, 1022);
assert.equal(certificate.restoration_census.total_target_indexed_checks, 147500);
assert.equal(certificate.restoration_census.restoration_failures, 0);
assert.equal(certificate.restoration_census.safe_control_failures, 0);
assert.equal(certificate.safe_control_certificate.extra_distinguishing_sidecar_information, 0);
assert.equal(certificate.passed, true);

const ash = compilePostRecompressionBundleRestorationProjection(AIA_RECEIVERS.ASH);
const loom = compilePostRecompressionBundleRestorationProjection(AIA_RECEIVERS.LOOM);
assert.deepEqual(ash.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(loom.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.equal(Object.values(ash.authority).some(Boolean), false);
assert.equal(Object.values(loom.authority).some(Boolean), false);
assert.equal(ash.payload.complete_transition_table_exposed, false);
assert.equal(ash.payload.complete_fibre_table_exposed, false);
assert.equal(ash.payload.complete_sidecar_table_exposed, false);
assert.equal(ash.payload.latent_state_values_exposed, false);
assert.equal(loom.payload.complete_transition_table_exposed, false);
assert.equal(loom.payload.complete_fibre_table_exposed, false);
assert.equal(loom.payload.complete_sidecar_table_exposed, false);
assert.deepEqual(loom.payload.m_distribution, EXPECTED_M);

for (const hostile of [
  { ...loom, minimum_bit_length: true },
  { ...loom, shannon_capacity: true },
  { ...loom, cryptographic_key: true },
  { ...loom, authentication_credential: true },
  { ...loom, new_sensor_measurement: true },
  { ...loom, source_state_transform: true },
  { ...loom, source_information_creation: true },
  { ...loom, retroactive_possession: true },
  { ...loom, authority_for_superset_bundle: true },
  { ...loom, universal_encoding_minimality: true },
  { ...loom, first_moment_minimum_custody_equivalence: true },
  { ...loom, claim_conditioned_partial_event_custody_equivalence: true },
  { ...ash, payload: { ...ash.payload, complete_transition_table_exposed: true } },
  { ...ash, payload: { ...ash.payload, complete_fibre_table_exposed: true } },
  { ...ash, payload: { ...ash.payload, complete_sidecar_table_exposed: true } },
  { ...ash, payload: { ...ash.payload, latent_state_values_exposed: true } },
]) assert.equal(rejectPostRecompressionBundleRestorationOverreach(hostile).accepted, false);

console.log('Ash A15-R0 post-recompression bundle restoration sidecar independent hostile tests passed.');
