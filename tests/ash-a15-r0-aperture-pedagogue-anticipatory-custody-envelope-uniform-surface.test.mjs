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
import {
  anticipatoryCustodyEnvelopeCanonicalCertificate,
  compileAnticipatoryCustodyEnvelopeCanonicalProjection,
  rejectAnticipatoryCustodyEnvelopeOverreach,
} from '../app/dome-world/previews/a15-r0/anticipatory-custody-envelope-uniform-surface-certificate.js';

const CLAIMS = [
  'FIRST_STRATUM',
  'SCHEDULE',
  'X1',
  'X2',
  'X3',
  'FULL_STATE',
  'REPLAY_REQUIRED_FOR_EXACT_STATE',
];
const EXPECTED_ROBUST = {
  '5': 4, '10': 4, '15': 8, '25': 4, '30': 16, '50': 4,
  '75': 8, '125': 18, '150': 16, '250': 18, '375': 36, '750': 72,
};
const EXPECTED_RATIO = {
  '1': 4, '2': 4, '3': 8, '5': 4, '6': 16, '10': 4,
  '15': 8, '25': 18, '30': 16, '50': 18, '75': 36, '150': 72,
};
const EXPECTED_TRIPLES = {
  '5->5->5': 4,
  '5->5->10': 4,
  '5->5->15': 8,
  '5->5->25': 2,
  '5->5->50': 2,
  '5->5->75': 4,
  '5->10->30': 16,
  '5->10->150': 8,
  '5->25->25': 2,
  '5->25->50': 2,
  '5->25->75': 4,
  '5->25->125': 18,
  '5->25->250': 18,
  '5->25->375': 36,
  '5->50->150': 8,
  '5->50->750': 72,
};
const EXPECTED_SCHEDULES = {
  'P-H-I': 96,
  'P-I-H': 96,
  'H-P-I': 8,
  'H-I-P': 0,
  'I-P-H': 8,
  'I-H-P': 0,
};

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

// Independent recursive powerset; deliberately not the parent's bitmask generator.
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
  throw new Error(`unknown anticipatory hostile claim ${claim}`);
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
  for (const stage of [0, 1, 2]) {
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
  const replayBirth = new Map(
    policy.replay_required_authority_certificate.schedules.map(row => [row.schedule_id, row.birth]),
  );
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

function stageProfile(fibres, targets, stage, bundle) {
  const occupied = [...new Set(targets.map(target => quotientKey(stage, target)))];
  const supports = occupied.map(key => {
    const members = fibres.get(stage).get(key);
    assert.ok(members);
    return { key, values: [...new Set(members.map(member => bundleValue(bundle, member)))].sort() };
  });
  return {
    stage,
    supports,
    maximum: Math.max(...supports.map(row => row.values.length)),
  };
}

function increment(record, key) {
  record[String(key)] = (record[String(key)] ?? 0) + 1;
}

function normalized(record) {
  return Object.fromEntries(Object.entries(record).sort(([left], [right]) => left.localeCompare(right)));
}

const jurisdiction = bitemporalAuthorityBirthNonretroactiveJurisdictionCertificate();
const policy = bitemporalProspectiveReplayMinimalObservationPolicyCertificate();
assert.equal(jurisdiction.passed, true);
assert.equal(policy.passed, true);

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

const profileCache = new Map();
let supportEvaluations = 0;
function cachedProfile(scheduleIdValue, bundle, stage) {
  const key = `${scheduleIdValue}|${bundle.join('+')}|${stage}`;
  if (profileCache.has(key)) return profileCache.get(key);
  const profile = stageProfile(fibres, targetsBySchedule.get(scheduleIdValue), stage, bundle);
  supportEvaluations += profile.supports.length;
  profileCache.set(key, profile);
  return profile;
}

const robustSpectrum = {};
const ratioSpectrum = {};
const tripleSpectrum = {};
const scheduleCounts = Object.fromEntries(DROMOLOGICAL_S3_SCHEDULES.map(schedule => [scheduleId(schedule), 0]));
const signatures = { FLAT_FLAT: 0, FLAT_EXPAND: 0, EXPAND_FLAT: 0, EXPAND_EXPAND: 0 };
const contexts = [];
let uniformLocalFive = 0;
let plateau = 0;
let expand = 0;
let lowerBoundWitnesses = 0;
let targetDecodeChecks = 0;
let maxDifference = -1;
let maxRatio = -1;

for (const schedule of DROMOLOGICAL_S3_SCHEDULES) {
  const id = scheduleId(schedule);
  const births = birthsBySchedule.get(id);
  const targets = targetsBySchedule.get(id);
  assert.equal(targets.length, 125);

  for (const bundle of bundles) {
    if (maxBirth(bundle, births) !== 3) continue;
    const bundleId = bundle.join('+');
    scheduleCounts[id] += 1;
    const q2 = cachedProfile(id, bundle, 2);
    const q1 = cachedProfile(id, bundle, 1);
    const q0 = cachedProfile(id, bundle, 0);
    const m2 = q2.maximum;
    const m1 = q1.maximum;
    const m0 = q0.maximum;
    assert.ok(m2 <= m1 && m1 <= m0);
    assert.equal(m2, 5);
    uniformLocalFive += 1;
    increment(robustSpectrum, m0);
    increment(ratioSpectrum, m0 / m2);
    increment(tripleSpectrum, `${m2}->${m1}->${m0}`);

    const firstFlat = m2 === m1;
    const secondFlat = m1 === m0;
    const signature = firstFlat
      ? (secondFlat ? 'FLAT_FLAT' : 'FLAT_EXPAND')
      : (secondFlat ? 'EXPAND_FLAT' : 'EXPAND_EXPAND');
    signatures[signature] += 1;
    if (m2 === m0) plateau += 1;
    else expand += 1;

    // Independent robust lower bound on the q0 fibre.
    assert.equal(q0.supports.length, 1);
    const q0Values = q0.supports[0].values;
    assert.equal(q0Values.length, m0);
    assert.ok(m0 >= 2);
    const smallerAlphabet = m0 - 1;
    const firstCollisionLabel = 0 % smallerAlphabet;
    const secondCollisionLabel = (m0 - 1) % smallerAlphabet;
    assert.equal(firstCollisionLabel, secondCollisionLabel);
    assert.notEqual(q0Values[0], q0Values[m0 - 1]);
    lowerBoundWitnesses += 1;

    // Independent sufficiency: one global q0-value label map is retained unchanged.
    const globalLabels = new Map(q0Values.map((value, label) => [value, label]));
    const q1ByKey = new Map(q1.supports.map(row => [row.key, row.values]));
    for (const target of targets) {
      targetDecodeChecks += 1;
      const value = bundleValue(bundle, target);
      const label = globalLabels.get(value);
      assert.ok(Number.isInteger(label) && label >= 0 && label < m0);
      assert.equal(q0Values[label], value);
      assert.ok(q1ByKey.get(quotientKey(1, target))?.includes(value));
      // q0+label and q1+label therefore both recover this exact requested bundle value.
    }

    maxDifference = Math.max(maxDifference, m0 - m2);
    maxRatio = Math.max(maxRatio, m0 / m2);
    contexts.push({ id, bundle, bundle_id: bundleId, m2, m1, m0, signature });
  }
}

assert.equal(contexts.length, 208);
assert.equal(uniformLocalFive, 208);
assert.deepEqual(scheduleCounts, EXPECTED_SCHEDULES);
assert.deepEqual(normalized(robustSpectrum), normalized(EXPECTED_ROBUST));
assert.deepEqual(normalized(ratioSpectrum), normalized(EXPECTED_RATIO));
assert.deepEqual(normalized(tripleSpectrum), normalized(EXPECTED_TRIPLES));
assert.deepEqual(signatures, {
  FLAT_FLAT: 4,
  FLAT_EXPAND: 20,
  EXPAND_FLAT: 2,
  EXPAND_EXPAND: 182,
});
assert.equal(plateau, 4);
assert.equal(expand, 204);
assert.equal(profileCache.size, 624);
assert.equal(supportEvaluations, 6256);
assert.equal(lowerBoundWitnesses, 208);
assert.equal(targetDecodeChecks, 26000);
assert.equal(maxDifference, 745);
assert.equal(maxRatio, 150);

function named(schedule, bundleId) {
  return contexts.find(row => row.id === schedule && row.bundle_id === bundleId);
}

assert.deepEqual(
  (({ m2, m1, m0, signature }) => ({ m2, m1, m0, signature }))(named('P-H-I', 'X3')),
  { m2: 5, m1: 5, m0: 5, signature: 'FLAT_FLAT' },
);
assert.deepEqual(
  (({ m2, m1, m0, signature }) => ({ m2, m1, m0, signature }))(named('P-H-I', 'FIRST_STRATUM+X3')),
  { m2: 5, m1: 5, m0: 15, signature: 'FLAT_EXPAND' },
);
assert.deepEqual(
  (({ m2, m1, m0, signature }) => ({ m2, m1, m0, signature }))(named('P-H-I', 'X2+X3')),
  { m2: 5, m1: 25, m0: 25, signature: 'EXPAND_FLAT' },
);
assert.deepEqual(
  (({ m2, m1, m0, signature }) => ({ m2, m1, m0, signature }))(named('P-H-I', 'FULL_STATE')),
  { m2: 5, m1: 25, m0: 125, signature: 'EXPAND_EXPAND' },
);
assert.deepEqual(
  (({ m2, m1, m0 }) => ({ m2, m1, m0 }))(named('P-H-I', 'SCHEDULE+FULL_STATE')),
  { m2: 5, m1: 50, m0: 750 },
);

// Direct control-surface nonidentifiability: identical local cost, radically different robust obligation.
const cheap = named('P-H-I', 'X3');
const expensive = named('P-H-I', 'SCHEDULE+FULL_STATE');
assert.equal(cheap.m2, 5);
assert.equal(expensive.m2, 5);
assert.equal(cheap.m0, 5);
assert.equal(expensive.m0, 750);
assert.equal(expensive.m0 / expensive.m2, 150);

// One-step success does not certify horizon robustness.
const delayedRupture = named('P-H-I', 'FIRST_STRATUM+X3');
assert.equal(delayedRupture.m2, delayedRupture.m1);
assert.ok(delayedRupture.m1 < delayedRupture.m0);

// Early rupture need not imply continued expansion.
const earlyExpansionPlateau = named('P-H-I', 'X2+X3');
assert.ok(earlyExpansionPlateau.m2 < earlyExpansionPlateau.m1);
assert.equal(earlyExpansionPlateau.m1, earlyExpansionPlateau.m0);

const certificate = anticipatoryCustodyEnvelopeCanonicalCertificate();
assert.equal(certificate.parent_receipt, '082de53b0972a5fd0d235973a8deee2faaebce71');
assert.equal(certificate.initial_implementation_passed, false);
assert.equal(certificate.prehostile_repair.kind, 'REPRESENTATIVE_SELECTION_ONLY');
assert.equal(certificate.prehostile_repair.scientific_counts_changed, false);
assert.equal(certificate.prehostile_repair.theorem_changed, false);
assert.equal(certificate.prehostile_repair.known_initial_iteration_representative_verified, true);
assert.equal(certificate.domain.q3_birth_q2_branch_uncertain_contexts, 208);
assert.equal(certificate.anticipatory_envelope_census.contexts_with_local_q2_minimum_five, 208);
assert.equal(certificate.anticipatory_envelope_census.local_to_robust_expand, 204);
assert.equal(certificate.anticipatory_envelope_census.maximum_cardinality_ratio, 150);
assert.equal(certificate.execution_ledger.occupied_fibre_support_evaluations, 6256);
assert.equal(certificate.execution_ledger.horizon_lower_bound_witnesses, 208);
assert.equal(certificate.execution_ledger.target_indexed_robust_decode_checks, 26000);
assert.equal(certificate.passed, true);

const ash = compileAnticipatoryCustodyEnvelopeCanonicalProjection(AIA_RECEIVERS.ASH);
const loom = compileAnticipatoryCustodyEnvelopeCanonicalProjection(AIA_RECEIVERS.LOOM);
assert.deepEqual(ash.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(loom.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.equal(Object.values(ash.authority).some(Boolean), false);
assert.equal(Object.values(loom.authority).some(Boolean), false);
for (const projection of [ash, loom]) {
  assert.equal(projection.payload.full_context_rows_exposed, false);
  assert.equal(projection.payload.full_fibre_tables_exposed, false);
  assert.equal(projection.payload.full_label_tables_exposed, false);
  assert.equal(projection.payload.latent_state_values_exposed, false);
}

for (const hostile of [
  { ...loom, retrocausal_information_flow: true },
  { ...loom, future_event_changes_past_state: true },
  { ...loom, source_state_transform: true },
  { ...loom, source_state_mutation: true },
  { ...loom, source_information_creation: true },
  { ...loom, minimum_bit_length: true },
  { ...loom, shannon_capacity: true },
  { ...loom, mutual_information: true },
  { ...loom, cryptographic_key: true },
  { ...loom, authentication_credential: true },
  { ...loom, new_sensor_measurement: true },
  { ...loom, universal_robust_control: true },
  { ...loom, universal_coding_theorem: true },
  { ...loom, data_retention_policy: true },
  { ...ash, payload: { ...ash.payload, full_context_rows_exposed: true } },
  { ...ash, payload: { ...ash.payload, full_fibre_tables_exposed: true } },
  { ...ash, payload: { ...ash.payload, full_label_tables_exposed: true } },
  { ...ash, payload: { ...ash.payload, latent_state_values_exposed: true } },
]) assert.equal(rejectAnticipatoryCustodyEnvelopeOverreach(hostile).accepted, false);

console.log('Ash A15-R0 anticipatory custody envelope independent hostile tests passed.');
