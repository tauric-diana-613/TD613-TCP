import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import {
  compileCaseMap,
  compileReaderProfile,
  compileRouteMemory
} from '../app/engine/ash-keep-core.js';
import {
  compileMoireRebuildAssay,
  runDeterministicMoireAssay,
  verifyMoireRebuildAssay
} from '../app/engine/ash-keep-moire.js';

const createdAt = '2026-07-14T20:00:00.000Z';
const caseMap = await compileCaseMap({
  caseId: 'case_moire_stress',
  profile: 'research',
  title: 'Moiré observation-state stress fixture',
  createdAt,
  rooms: [
    { id: 'room_left', label: 'Left room' },
    { id: 'room_right', label: 'Right room' }
  ],
  nodes: [
    { id: 'node_left', type: 'entity', label: 'Left node', room_id: 'room_left', chronology_index: 0 },
    { id: 'node_right', type: 'claim', label: 'Right node', room_id: 'room_right', chronology_index: 1 },
    { id: 'node_hidden', type: 'hypothesis', label: 'Hidden hypothesis', room_id: 'room_right', chronology_index: 2 },
    { id: 'node_action', type: 'intended-action', label: 'Held action', room_id: 'room_left', chronology_index: 3 }
  ],
  relationships: [
    { id: 'edge_bridge', from: 'node_left', to: 'node_right', type: 'supports' },
    { id: 'edge_hidden', from: 'node_right', to: 'node_hidden', type: 'suggests' },
    { id: 'edge_action', from: 'node_hidden', to: 'node_action', type: 'suggests' }
  ],
  evidenceBasis: ['stress fixture']
});
const routeMemory = await compileRouteMemory({
  caseId: caseMap.case_id,
  createdAt,
  entries: [],
  evidenceBasis: ['empty route baseline']
});
const reader = await compileReaderProfile({
  readerId: 'reader_moire_stress',
  label: 'Moiré stress reader',
  readerClass: 'deterministic-baseline',
  repeatCount: 4,
  seeded: true,
  createdAt,
  evidenceBasis: ['declared stress reader']
});

const projections = [
  {
    projection_id: 'proj_left',
    disclosed_opaque_references: ['node_left'],
    route_id: 'route_public',
    purpose: 'left singleton'
  },
  {
    projection_id: 'proj_right',
    disclosed_opaque_references: ['node_right'],
    route_id: 'route_public',
    purpose: 'right singleton'
  }
];

const calibration = {
  preregisteredFixture: true,
  benignControl: true,
  heldOut: true,
  sourceDriftCheck: true,
  alternativeReader: true,
  exactThresholds: { room_bridges: { numerator: 1, denominator: 1 } }
};

function completeResults(pairState = 'OBSERVED') {
  return [
    {
      observation_id: 'obs_baseline',
      projection_ids: [],
      state: 'OBSERVED',
      recovered: {},
      benign_control: true
    },
    {
      observation_id: 'obs_left',
      projection_ids: ['proj_left'],
      state: 'OBSERVED',
      recovered: { node_ids: ['node_left'], chronology: 250 }
    },
    {
      observation_id: 'obs_right',
      projection_ids: ['proj_right'],
      state: 'OBSERVED',
      recovered: { node_ids: ['node_right'], chronology: 250 }
    },
    {
      observation_id: 'obs_pair',
      projection_ids: ['proj_right', 'proj_left'],
      state: pairState,
      held_out: true,
      recovered: {
        node_ids: ['node_action', 'node_hidden', 'node_left', 'node_right'],
        relationship_ids: ['edge_action', 'edge_bridge', 'edge_hidden'],
        chronology: 1000,
        source_style_linkage: 700
      },
      missingness: pairState === 'OBSERVED' ? [] : [`declared ${pairState.toLowerCase()} pair observation`]
    }
  ];
}

async function compileFixture({
  assayId = 'moire_stress_fixture',
  inputProjections = projections,
  results = completeResults(),
  inputCalibration = calibration,
  options = {}
} = {}) {
  return compileMoireRebuildAssay({
    assayId,
    caseMap,
    routeMemory,
    reader,
    createdAt,
    projections: inputProjections,
    results,
    calibration: inputCalibration,
    sourceDriftState: 'SOURCE_HELD',
    evidenceBasis: ['stress fixture', 'pairwise observation state bank']
  }, options);
}

const nonObservedStates = [
  'NULL',
  'REJECTED',
  'MISSING',
  'CONTRADICTORY',
  'UNCAPTURED',
  'ENCODER_REQUIRED',
  'UNRESOLVED'
];

for (const state of nonObservedStates) {
  const assay = await compileFixture({
    assayId: `moire_state_${state.toLowerCase()}`,
    results: completeResults(state)
  });
  const pair = assay.pairwise_residue[0];
  assert.equal(pair.state, 'UNRESOLVED', `${state} pair must remain unresolved.`);
  assert.equal(pair.emergent_topology_detected, false);
  assert.deepEqual(pair.residue.node_ids, []);
  assert.deepEqual(pair.residue.relationship_ids, []);
  assert.ok(pair.missingness.includes(`pair proj_left+proj_right state: ${state}`));
  assert.equal(assay.calibration.complete_pair_coverage, true);
  assert.equal(assay.calibration.observed_pair_coverage, false);
  assert.equal(assay.calibration.all_required_observations_observed, false);
  assert.equal(assay.calibration_state, 'NOT_ENOUGH_TEST_DATA');
  assert.equal(assay.unresolved_pair_count, 1);
  assert.equal(await verifyMoireRebuildAssay(assay), true);
}

const contradictoryBaselineResults = completeResults();
contradictoryBaselineResults[0] = {
  ...contradictoryBaselineResults[0],
  state: 'CONTRADICTORY',
  missingness: ['baseline sources disagree']
};
const contradictoryBaseline = await compileFixture({
  assayId: 'moire_contradictory_baseline',
  results: contradictoryBaselineResults
});
assert.equal(contradictoryBaseline.calibration.complete_baseline, true);
assert.equal(contradictoryBaseline.calibration.observed_baseline, false);
assert.equal(contradictoryBaseline.calibration_state, 'NOT_ENOUGH_TEST_DATA');
assert.equal(contradictoryBaseline.pairwise_residue[0].state, 'UNRESOLVED');
assert.ok(contradictoryBaseline.pairwise_residue[0].missingness.includes('baseline state: CONTRADICTORY'));

const missingSingletonResults = completeResults().filter(result => result.observation_id !== 'obs_right');
const missingSingleton = await compileFixture({
  assayId: 'moire_missing_singleton',
  results: missingSingletonResults
});
assert.equal(missingSingleton.calibration.complete_singleton_coverage, false);
assert.equal(missingSingleton.calibration.observed_singleton_coverage, false);
assert.equal(missingSingleton.calibration_state, 'NOT_ENOUGH_TEST_DATA');
assert.equal(missingSingleton.pairwise_residue[0].state, 'UNRESOLVED');
assert.ok(missingSingleton.pairwise_residue[0].missingness.includes('missing singleton proj_right observation'));

const missingPairResults = completeResults().filter(result => result.observation_id !== 'obs_pair');
const missingPair = await compileFixture({
  assayId: 'moire_missing_pair',
  results: missingPairResults
});
assert.equal(missingPair.calibration.complete_pair_coverage, false);
assert.equal(missingPair.calibration.observed_pair_coverage, false);
assert.equal(missingPair.calibration_state, 'NOT_ENOUGH_TEST_DATA');
assert.equal(missingPair.pairwise_residue[0].state, 'UNRESOLVED');
assert.ok(missingPair.pairwise_residue[0].missingness.includes('missing pair proj_left+proj_right observation'));

const completeObserved = await compileFixture({ assayId: 'moire_complete_observed' });
assert.equal(completeObserved.calibration.all_required_observations_observed, true);
assert.equal(completeObserved.calibration_state, 'CALIBRATED_FOR_NAMED_FIXTURE');
assert.equal(completeObserved.unresolved_pair_count, 0);
assert.deepEqual(completeObserved.pairwise_residue[0].residue.hypothesis_ids, ['node_hidden']);
assert.deepEqual(completeObserved.pairwise_residue[0].residue.next_action_ids, ['node_action']);

const reversedInput = await compileFixture({
  assayId: 'moire_permutation_fixture',
  inputProjections: [...projections].reverse(),
  results: [...completeResults()].reverse()
});
const forwardInput = await compileFixture({
  assayId: 'moire_permutation_fixture',
  inputProjections: projections,
  results: completeResults()
});
assert.deepEqual(reversedInput.projections, forwardInput.projections);
assert.deepEqual(reversedInput.observations, forwardInput.observations);
assert.deepEqual(reversedInput.pairwise_residue, forwardInput.pairwise_residue);
assert.equal(reversedInput.assay_digest, forwardInput.assay_digest);

const deterministicForward = await runDeterministicMoireAssay({
  assayId: 'moire_deterministic_permutation',
  caseMap,
  routeMemory,
  reader,
  createdAt,
  projections,
  heldOutPairIds: ['proj_left+proj_right'],
  calibration
});
const deterministicReverse = await runDeterministicMoireAssay({
  assayId: 'moire_deterministic_permutation',
  caseMap,
  routeMemory,
  reader,
  createdAt,
  projections: [...projections].reverse(),
  heldOutPairIds: ['proj_left+proj_right'],
  calibration
});
assert.equal(deterministicForward.assay_digest, deterministicReverse.assay_digest);
assert.deepEqual(deterministicForward.observations, deterministicReverse.observations);

const observationByKey = new Map(
  deterministicForward.observations.map(result => [result.projection_ids.join('+'), result])
);
const baselineNodes = new Set(observationByKey.get('').recovered.node_ids);
const leftNodes = new Set(observationByKey.get('proj_left').recovered.node_ids);
const rightNodes = new Set(observationByKey.get('proj_right').recovered.node_ids);
const pairNodes = new Set(observationByKey.get('proj_left+proj_right').recovered.node_ids);
const subset = (left, right) => [...left].every(value => right.has(value));
assert.equal(subset(baselineNodes, leftNodes), true);
assert.equal(subset(baselineNodes, rightNodes), true);
assert.equal(subset(leftNodes, pairNodes), true);
assert.equal(subset(rightNodes, pairNodes), true);

const defaultCrypto = await compileFixture({ assayId: 'moire_crypto_parity' });
const explicitWebCrypto = await compileFixture({
  assayId: 'moire_crypto_parity',
  options: { cryptoImpl: webcrypto, TextEncoderImpl: TextEncoder }
});
assert.equal(defaultCrypto.assay_digest, explicitWebCrypto.assay_digest);
assert.equal(await verifyMoireRebuildAssay(explicitWebCrypto, { cryptoImpl: webcrypto, TextEncoderImpl: TextEncoder }), true);

const unknownNodeResults = completeResults();
unknownNodeResults[3] = {
  ...unknownNodeResults[3],
  recovered: {
    ...unknownNodeResults[3].recovered,
    node_ids: [...unknownNodeResults[3].recovered.node_ids, 'node_unknown']
  }
};
await assert.rejects(
  compileFixture({ assayId: 'moire_unknown_node', results: unknownNodeResults }),
  /recovered unknown Case Map node ID: node_unknown/
);

const unknownRelationshipResults = completeResults();
unknownRelationshipResults[3] = {
  ...unknownRelationshipResults[3],
  recovered: {
    ...unknownRelationshipResults[3].recovered,
    relationship_ids: [...unknownRelationshipResults[3].recovered.relationship_ids, 'edge_unknown']
  }
};
await assert.rejects(
  compileFixture({ assayId: 'moire_unknown_relationship', results: unknownRelationshipResults }),
  /recovered unknown Case Map relationship ID: edge_unknown/
);

const unknownProjectionResults = completeResults();
unknownProjectionResults[1] = { ...unknownProjectionResults[1], projection_ids: ['proj_unknown'] };
await assert.rejects(
  compileFixture({ assayId: 'moire_unknown_projection', results: unknownProjectionResults }),
  /references unknown projection ID: proj_unknown/
);

const duplicateProjectionIds = completeResults();
duplicateProjectionIds[3] = { ...duplicateProjectionIds[3], projection_ids: ['proj_left', 'proj_left'] };
await assert.rejects(
  compileFixture({ assayId: 'moire_duplicate_projection', results: duplicateProjectionIds }),
  /projection IDs must be unique/
);

const duplicateObservationIds = completeResults();
duplicateObservationIds[1] = { ...duplicateObservationIds[1], observation_id: 'obs_baseline' };
await assert.rejects(
  compileFixture({ assayId: 'moire_duplicate_observation_id', results: duplicateObservationIds }),
  /observation IDs must be unique/
);

const duplicateProjectionKey = completeResults();
duplicateProjectionKey.push({
  observation_id: 'obs_left_duplicate',
  projection_ids: ['proj_left'],
  state: 'OBSERVED',
  recovered: { node_ids: ['node_left'] }
});
await assert.rejects(
  compileFixture({ assayId: 'moire_duplicate_key', results: duplicateProjectionKey }),
  /Duplicate Moiré observation for projection key: proj_left/
);

console.log('ash-keep-moire-stress.test.mjs passed');
