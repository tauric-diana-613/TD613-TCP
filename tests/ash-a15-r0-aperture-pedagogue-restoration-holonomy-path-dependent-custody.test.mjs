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
  RESTORATION_HOLONOMY_PATH_DEPENDENT_CUSTODY_SCHEMA,
  RESTORATION_HOLONOMY_PATH_DEPENDENT_CUSTODY_PARENT_RECEIPT,
  restorationHolonomyPathDependentCustodyCertificate,
  compileRestorationHolonomyPathDependentCustodyProjection,
  rejectRestorationHolonomyOverreach,
} from '../app/dome-world/previews/a15-r0/restoration-holonomy-path-dependent-custody-certificate.js';

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
const EXPECTED_SUPPORT_PAIRS = {
  '5->25': 90,
  '5->50': 90,
  '50->750': 72,
  '5->750': 72,
  '2->6': 48,
  '10->30': 48,
  '5->5': 40,
  '5->10': 40,
  '25->375': 36,
  '5->375': 36,
  '5->15': 32,
  '10->150': 24,
  '5->75': 20,
  '25->125': 18,
  '5->125': 18,
  '25->250': 18,
  '5->250': 18,
  '2->30': 16,
  '5->30': 16,
  '5->150': 16,
  '50->150': 8,
  '25->75': 4,
  '25->25': 2,
  '25->50': 2,
};
const EXPECTED_SCHEDULE = {
  'P-H-I': { plateau: 13, rupture: 323, total: 336 },
  'P-I-H': { plateau: 13, rupture: 323, total: 336 },
  'H-P-I': { plateau: 6, rupture: 26, total: 32 },
  'H-I-P': { plateau: 2, rupture: 22, total: 24 },
  'I-P-H': { plateau: 6, rupture: 26, total: 32 },
  'I-H-P': { plateau: 2, rupture: 22, total: 24 },
};

function scheduleId(schedule) {
  const letters = {
    PHI_PAIR_WIRE: 'P',
    HEXAGONAL_MOIRE: 'H',
    ICOSAHEDRAL_PHASON: 'I',
  };
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
  throw new Error(`unknown hostile restoration-holonomy claim ${claim}`);
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

function support(fibres, stage, key, bundle) {
  const members = fibres.get(stage).get(key);
  assert.ok(members, `missing hostile fibre at q${stage}`);
  return [...new Set(members.map(member => bundleValue(bundle, member)))].sort();
}

function stageProfile(fibres, targets, stage, bundle) {
  const occupied = [...new Set(targets.map(target => quotientKey(stage, target)))];
  const supports = occupied.map(key => ({ key, values: support(fibres, stage, key, bundle) }));
  return {
    stage,
    supports,
    maximum: Math.max(...supports.map(row => row.values.length)),
  };
}

function increment(map, key) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function normalizedPairs(map) {
  return Object.fromEntries([...map.entries()].sort(([left], [right]) => left.localeCompare(right)));
}

const jurisdiction = bitemporalAuthorityBirthNonretroactiveJurisdictionCertificate();
const policy = bitemporalProspectiveReplayMinimalObservationPolicyCertificate();
assert.equal(jurisdiction.passed, true);
assert.equal(policy.passed, true);
assert.equal(RESTORATION_HOLONOMY_PATH_DEPENDENT_CUSTODY_PARENT_RECEIPT,
  '53e713059cde5dd6c2b4d4cbc20f882601360f7c');

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
function cachedProfile(schedule, bundle, stage) {
  const id = `${schedule}|${bundle.join('+')}|${stage}`;
  if (profileCache.has(id)) return profileCache.get(id);
  const profile = stageProfile(fibres, targetsBySchedule.get(schedule), stage, bundle);
  supportEvaluations += profile.supports.length;
  profileCache.set(id, profile);
  return profile;
}

const paths = [];
const pairCounts = new Map();
const bySchedule = new Map(DROMOLOGICAL_S3_SCHEDULES.map(schedule => [
  scheduleId(schedule),
  { plateau: 0, rupture: 0, total: 0 },
]));
const byBirth = {
  '2': { plateau: 0, rupture: 0, total: 0 },
  '3': { plateau: 0, rupture: 0, total: 0 },
};
const bySecondLeg = {
  'q1->q0': { plateau: 0, rupture: 0, total: 0 },
  'q2->q1': { plateau: 0, rupture: 0, total: 0 },
  'q2->q0': { plateau: 0, rupture: 0, total: 0 },
};
let plateau = 0;
let rupture = 0;
let strictDecrease = 0;
let pathChecks = 0;
let lowerBoundChecks = 0;
let plateauDecodeChecks = 0;
let maximumExpansion = -1;

for (const schedule of DROMOLOGICAL_S3_SCHEDULES) {
  const id = scheduleId(schedule);
  const births = birthsBySchedule.get(id);
  const targets = targetsBySchedule.get(id);
  assert.equal(targets.length, 125);

  for (const bundle of bundles) {
    const birth = maxBirth(bundle, births);
    if (birth === 'INF' || birth < 2) continue;
    const bundleId = bundle.join('+');

    for (let fine = birth; fine <= 3; fine += 1) {
      for (let intermediate = 1; intermediate < birth; intermediate += 1) {
        if (intermediate >= fine) continue;
        for (let terminal = 0; terminal < intermediate; terminal += 1) {
          pathChecks += 1;
          const dProfile = cachedProfile(id, bundle, intermediate);
          const cProfile = cachedProfile(id, bundle, terminal);
          const md = dProfile.maximum;
          const mc = cProfile.maximum;
          assert.ok(md <= mc, `support contraction under recompression ${id}/${bundleId}/q${fine}->q${intermediate}->q${terminal}`);
          if (md > mc) strictDecrease += 1;
          const transportable = md === mc;
          increment(pairCounts, `${md}->${mc}`);
          const scheduleCounts = bySchedule.get(id);
          const birthCounts = byBirth[String(birth)];
          const legCounts = bySecondLeg[`q${intermediate}->q${terminal}`];
          scheduleCounts.total += 1;
          birthCounts.total += 1;
          legCounts.total += 1;

          if (transportable) {
            plateau += 1;
            scheduleCounts.plateau += 1;
            birthCounts.plateau += 1;
            legCounts.plateau += 1;

            // Independent sufficiency construction: label each terminal-fibre bundle value,
            // then restrict that same label assignment to every nested intermediate subfibre.
            const terminalMaps = new Map(cProfile.supports.map(row => [
              row.key,
              new Map(row.values.map((value, label) => [value, label])),
            ]));
            const dByKey = new Map(dProfile.supports.map(row => [row.key, row.values]));
            const cByKey = new Map(cProfile.supports.map(row => [row.key, row.values]));
            for (const target of targets) {
              plateauDecodeChecks += 1;
              const dKey = quotientKey(intermediate, target);
              const cKey = quotientKey(terminal, target);
              const value = bundleValue(bundle, target);
              const label = terminalMaps.get(cKey)?.get(value);
              assert.ok(Number.isInteger(label) && label >= 0 && label < md);
              assert.ok(dByKey.get(dKey)?.includes(value));
              assert.equal(cByKey.get(cKey)?.[label], value);
            }
          } else {
            rupture += 1;
            scheduleCounts.rupture += 1;
            birthCounts.rupture += 1;
            legCounts.rupture += 1;

            // Explicit maximizing-fibre lower bound: a terminal fibre contains mc distinct
            // required bundle values, and the retained intermediate alphabet has only md<mc labels.
            const maximizing = cProfile.supports.find(row => row.values.length === mc);
            assert.ok(maximizing);
            assert.ok(md < maximizing.values.length);
            assert.notEqual(maximizing.values[0], maximizing.values[md]);
            lowerBoundChecks += 1;
          }

          maximumExpansion = Math.max(maximumExpansion, mc - md);
          paths.push({
            schedule_id: id,
            bundle,
            bundle_id: bundleId,
            birth,
            fine,
            intermediate,
            terminal,
            m_d: md,
            m_c: mc,
            transportable,
          });
        }
      }
    }
  }
}

assert.equal(paths.length, 784);
assert.equal(paths.filter(path => path.birth === 2).length, 160);
assert.equal(paths.filter(path => path.birth === 3).length, 624);
assert.equal(plateau, 42);
assert.equal(rupture, 742);
assert.equal(strictDecrease, 0);
assert.deepEqual(normalizedPairs(pairCounts),
  Object.fromEntries(Object.entries(EXPECTED_SUPPORT_PAIRS).sort(([left], [right]) => left.localeCompare(right))));
assert.equal(pairCounts.get('5->5'), 40);
assert.equal(pairCounts.get('25->25'), 2);
assert.deepEqual(Object.fromEntries(bySchedule), EXPECTED_SCHEDULE);
assert.deepEqual(byBirth, {
  '2': { plateau: 8, rupture: 152, total: 160 },
  '3': { plateau: 34, rupture: 590, total: 624 },
});
assert.deepEqual(bySecondLeg, {
  'q1->q0': { plateau: 14, rupture: 354, total: 368 },
  'q2->q1': { plateau: 24, rupture: 184, total: 208 },
  'q2->q0': { plateau: 4, rupture: 204, total: 208 },
});
assert.equal(profileCache.size, 784);
assert.equal(supportEvaluations, 6864);
assert.equal(pathChecks, 784);
assert.equal(lowerBoundChecks, 742);
assert.equal(plateauDecodeChecks, 5250);
assert.equal(maximumExpansion, 745);

// Named preregistered maximum support-expansion witness.
const maximumWitness = paths.find(path => (
  path.schedule_id === 'P-H-I'
  && path.bundle_id === 'SCHEDULE+FULL_STATE'
  && path.birth === 3
  && path.fine === 3
  && path.intermediate === 2
  && path.terminal === 0
));
assert.ok(maximumWitness);
assert.equal(maximumWitness.m_d, 5);
assert.equal(maximumWitness.m_c, 750);
assert.equal(maximumWitness.m_c - maximumWitness.m_d, 745);

// Same-endpoint path groups: exactly 208 q3->q0 endpoint problems have both q1 and q2 intermediates.
const endpointGroups = new Map();
for (const path of paths) {
  const key = `${path.schedule_id}|${path.bundle_id}|${path.birth}|${path.fine}|${path.terminal}`;
  if (!endpointGroups.has(key)) endpointGroups.set(key, []);
  endpointGroups.get(key).push(path);
}
const twoPathGroups = [...endpointGroups.values()].filter(group => group.length === 2);
const mixedGroups = twoPathGroups.filter(group => (
  group.some(path => path.transportable)
  && group.some(path => !path.transportable)
));
assert.equal(endpointGroups.size, 576);
assert.equal(twoPathGroups.length, 208);
assert.equal(mixedGroups.length, 2);

for (const schedule of ['P-H-I', 'P-I-H']) {
  const group = mixedGroups.find(rows => rows[0].schedule_id === schedule);
  assert.ok(group);
  assert.ok(group.every(row => row.bundle_id === 'X2+X3' && row.birth === 3 && row.fine === 3 && row.terminal === 0));
  const viaQ1 = group.find(row => row.intermediate === 1);
  const viaQ2 = group.find(row => row.intermediate === 2);
  assert.deepEqual(
    { m_d: viaQ1.m_d, m_c: viaQ1.m_c, transportable: viaQ1.transportable },
    { m_d: 25, m_c: 25, transportable: true },
  );
  assert.deepEqual(
    { m_d: viaQ2.m_d, m_c: viaQ2.m_c, transportable: viaQ2.transportable },
    { m_d: 5, m_c: 25, transportable: false },
  );
}

// Finer intermediate representation can be less future-robust for the exact same endpoint.
const phiMixed = mixedGroups.find(rows => rows[0].schedule_id === 'P-H-I');
const q1Path = phiMixed.find(row => row.intermediate === 1);
const q2Path = phiMixed.find(row => row.intermediate === 2);
assert.ok(q2Path.intermediate > q1Path.intermediate);
assert.ok(q2Path.m_d < q1Path.m_d);
assert.equal(q1Path.transportable, true);
assert.equal(q2Path.transportable, false);

// Local minimum cardinality does not identify future transportability.
const m5Plateau = paths.find(path => (
  path.schedule_id === 'P-H-I'
  && path.bundle_id === 'X2'
  && path.birth === 2
  && path.fine === 2
  && path.intermediate === 1
  && path.terminal === 0
));
const m5Rupture = paths.find(path => (
  path.schedule_id === 'P-H-I'
  && path.bundle_id === 'FULL_STATE'
  && path.birth === 3
  && path.fine === 3
  && path.intermediate === 2
  && path.terminal === 0
));
assert.deepEqual({ m_d: m5Plateau.m_d, m_c: m5Plateau.m_c, transportable: m5Plateau.transportable },
  { m_d: 5, m_c: 5, transportable: true });
assert.deepEqual({ m_d: m5Rupture.m_d, m_c: m5Rupture.m_c, transportable: m5Rupture.transportable },
  { m_d: 5, m_c: 125, transportable: false });

// A plateau proves existence of a compatible minimum labelling, not transportability of every
// arbitrary fibre-local minimum labelling. Construct an incompatible q1-local permutation for
// P-H-I / X2 while preserving local injectivity in each q1 fibre.
const x2Bundle = ['X2'];
const x2Targets = targetsBySchedule.get('P-H-I');
const x2Q1 = stageProfile(fibres, x2Targets, 1, x2Bundle);
const x2Q0 = stageProfile(fibres, x2Targets, 0, x2Bundle);
assert.equal(x2Q1.maximum, 5);
assert.equal(x2Q0.maximum, 5);
const fullQ1Supports = x2Q1.supports.filter(row => row.values.length === 5);
assert.ok(fullQ1Supports.length >= 2);
const firstLocal = fullQ1Supports[0];
const secondLocal = fullQ1Supports[1];
const leftValue = firstLocal.values[0];
const rightValue = secondLocal.values[1];
assert.notEqual(leftValue, rightValue);
const leftLocalLabels = new Map(firstLocal.values.map((value, label) => [value, label]));
const rotatedSecondLabels = new Map(secondLocal.values.map((value, index) => [value, (index + 4) % 5]));
assert.equal(new Set(leftLocalLabels.values()).size, 5);
assert.equal(new Set(rotatedSecondLabels.values()).size, 5);
assert.equal(leftLocalLabels.get(leftValue), 0);
assert.equal(rotatedSecondLabels.get(rightValue), 0);
assert.notEqual(leftValue, rightValue);
// Once q1 is discarded, q0 plus label 0 cannot decode both different values.
assert.equal(x2Q0.supports.length, 1);

const certificate = restorationHolonomyPathDependentCustodyCertificate();
assert.equal(certificate.schema, RESTORATION_HOLONOMY_PATH_DEPENDENT_CUSTODY_SCHEMA);
assert.equal(certificate.parent_receipt, RESTORATION_HOLONOMY_PATH_DEPENDENT_CUSTODY_PARENT_RECEIPT);
assert.equal(certificate.finite_domain.restored_then_recompressed_paths, 784);
assert.equal(certificate.finite_domain.endpoint_equivalent_two_path_groups, 208);
assert.equal(certificate.path_transport_census.transport_plateau_paths, 42);
assert.equal(certificate.path_transport_census.transport_rupture_paths, 742);
assert.equal(certificate.path_transport_census.strict_decrease_paths, 0);
assert.equal(certificate.path_transport_census.maximum_support_cardinality_expansion, 745);
assert.equal(certificate.path_transport_census.mixed_transport_endpoint_groups, 2);
assert.equal(certificate.execution_ledger.occupied_fibre_support_evaluations, 6864);
assert.equal(certificate.execution_ledger.path_criterion_checks, 784);
assert.equal(certificate.execution_ledger.strict_expansion_lower_bound_checks, 742);
assert.equal(certificate.execution_ledger.plateau_target_decode_checks, 5250);
assert.equal(certificate.execution_ledger.endpoint_group_comparisons, 208);
assert.equal(certificate.execution_ledger.represented_path_target_cross_product_claimed_executed, false);
assert.equal(certificate.transport_criterion.every_minimum_labelling_claimed_transportable, false);
assert.equal(certificate.passed, true);

const ash = compileRestorationHolonomyPathDependentCustodyProjection(AIA_RECEIVERS.ASH);
const loom = compileRestorationHolonomyPathDependentCustodyProjection(AIA_RECEIVERS.LOOM);
assert.deepEqual(ash.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(loom.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.equal(Object.values(ash.authority).some(Boolean), false);
assert.equal(Object.values(loom.authority).some(Boolean), false);
assert.equal(ash.payload.complete_path_table_exposed, false);
assert.equal(ash.payload.complete_fibre_table_exposed, false);
assert.equal(ash.payload.complete_label_table_exposed, false);
assert.equal(ash.payload.latent_state_values_exposed, false);
assert.equal(loom.payload.complete_path_table_exposed, false);
assert.equal(loom.payload.complete_fibre_table_exposed, false);
assert.equal(loom.payload.complete_label_table_exposed, false);
assert.equal(loom.payload.mixed_transport_endpoint_groups, 2);

for (const hostile of [
  { ...loom, minimum_bit_length: true },
  { ...loom, shannon_capacity: true },
  { ...loom, cryptographic_key: true },
  { ...loom, authentication_credential: true },
  { ...loom, new_sensor_measurement: true },
  { ...loom, source_state_transform: true },
  { ...loom, source_information_creation: true },
  { ...loom, retroactive_possession: true },
  { ...loom, operational_path_groupoid: true },
  { ...loom, physical_holonomy: true },
  { ...loom, universal_functoriality: true },
  { ...loom, minimum_augmentation_alphabet_from_support_difference: true },
  { ...loom, every_minimum_labelling_transports: true },
  { ...ash, payload: { ...ash.payload, complete_path_table_exposed: true } },
  { ...ash, payload: { ...ash.payload, complete_fibre_table_exposed: true } },
  { ...ash, payload: { ...ash.payload, complete_label_table_exposed: true } },
  { ...ash, payload: { ...ash.payload, latent_state_values_exposed: true } },
]) assert.equal(rejectRestorationHolonomyOverreach(hostile).accepted, false);

console.log('Ash A15-R0 restoration-holonomy path-dependent custody independent hostile tests passed.');
