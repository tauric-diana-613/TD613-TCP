import assert from 'node:assert/strict';
import {
  compileCaseMap,
  compileReaderProfile,
  compileRouteMemory
} from '../app/engine/ash-keep-core.js';
import {
  MOIRE_REBUILD_ASSAY_SCHEMA,
  compileMoireRebuildAssay,
  replayMoireRebuildAssay,
  runDeterministicMoireAssay,
  verifyMoireRebuildAssay,
  verifyMoireRebuildReplay
} from '../app/engine/ash-keep-moire.js';

const createdAt = '2026-07-14T12:00:00.000Z';
const caseMap = await compileCaseMap({
  caseId: 'case_moire_demo',
  profile: 'research',
  title: 'Moiré reconstruction fixture',
  createdAt,
  rooms: [
    { id: 'room_left', label: 'Left room' },
    { id: 'room_right', label: 'Right room' }
  ],
  nodes: [
    { id: 'node_left', type: 'entity', label: 'Left node', room_id: 'room_left', chronology_index: 0 },
    { id: 'node_right', type: 'claim', label: 'Right node', room_id: 'room_right', chronology_index: 1 },
    { id: 'node_hidden', type: 'hypothesis', label: 'Hidden hypothesis', room_id: 'room_right', chronology_index: 2 }
  ],
  relationships: [
    { id: 'edge_bridge', from: 'node_left', to: 'node_right', type: 'supports' },
    { id: 'edge_hidden', from: 'node_right', to: 'node_hidden', type: 'suggests' }
  ],
  evidenceBasis: ['fixture']
});
const routeMemory = await compileRouteMemory({
  caseId: caseMap.case_id,
  createdAt,
  entries: [],
  evidenceBasis: ['empty route baseline']
});
const deterministicReader = await compileReaderProfile({
  readerId: 'reader_deterministic_moire',
  label: 'Deterministic Moiré reader',
  readerClass: 'deterministic-baseline',
  repeatCount: 4,
  seeded: true,
  createdAt,
  evidenceBasis: ['declared deterministic fixture']
});

const deterministic = await runDeterministicMoireAssay({
  assayId: 'moire_deterministic_fixture',
  caseMap,
  routeMemory,
  reader: deterministicReader,
  createdAt,
  projections: [
    {
      projection_id: 'proj_right',
      disclosed_opaque_references: ['node_right'],
      route_id: 'route_public',
      purpose: 'right singleton'
    },
    {
      projection_id: 'proj_left',
      disclosed_opaque_references: ['node_left'],
      route_id: 'route_public',
      purpose: 'left singleton'
    }
  ],
  heldOutPairIds: ['proj_left+proj_right'],
  calibration: {
    preregisteredFixture: true,
    sourceDriftCheck: true,
    alternativeReader: true,
    exactThresholds: { room_bridges: { numerator: 1, denominator: 1 } }
  }
});

assert.equal(deterministic.schema, MOIRE_REBUILD_ASSAY_SCHEMA);
assert.equal(deterministic.calibration_state, 'CALIBRATED_FOR_NAMED_FIXTURE');
assert.equal(deterministic.review_state, 'OPERATOR_REVIEW_REQUIRED');
assert.equal(deterministic.pairwise_residue.length, 1);
assert.deepEqual(deterministic.pairwise_residue[0].projection_ids, ['proj_left', 'proj_right']);
assert.deepEqual(deterministic.pairwise_residue[0].residue.node_ids, []);
assert.deepEqual(deterministic.pairwise_residue[0].residue.relationship_ids, ['edge_bridge']);
assert.deepEqual(deterministic.pairwise_residue[0].residue.room_bridge_ids, ['edge_bridge']);
assert.ok(deterministic.pairwise_residue[0].residue.chronology_millipoints > 0);
assert.equal(deterministic.pairwise_residue[0].emergent_topology_detected, true);
assert.equal(deterministic.emergent_pair_count, 1);
assert.equal(deterministic.real_surveillance_probability, null);
assert.equal(deterministic.automatic_hold, false);
assert.equal(deterministic.automatic_ash_action, false);
assert.equal(deterministic.prediction_authorized, false);
assert.equal(await verifyMoireRebuildAssay(deterministic), true);

const tampered = structuredClone(deterministic);
tampered.pairwise_residue[0].residue.relationship_ids = [];
assert.equal(await verifyMoireRebuildAssay(tampered), false);

const replay = await replayMoireRebuildAssay(deterministic, {
  replayId: 'moirereplay_fixture',
  createdAt
});
assert.equal(replay.status, 'MOIRE_REPLAY_VERIFIED');
assert.equal(replay.reconstruction_reexecuted, false);
assert.equal(replay.network_called, false);
assert.equal(await verifyMoireRebuildReplay(replay), true);

const syntheticReader = await compileReaderProfile({
  readerId: 'reader_synthetic_moire',
  label: 'Synthetic external provider fixture',
  readerClass: 'synthetic-external-provider',
  repeatCount: 1,
  seeded: true,
  createdAt,
  evidenceBasis: ['declared synthetic fixture']
});
const generic = await compileMoireRebuildAssay({
  assayId: 'moire_generic_fixture',
  caseMap,
  routeMemory,
  reader: syntheticReader,
  createdAt,
  projections: [
    { projection_id: 'proj_left', disclosed_opaque_references: ['node_left'] },
    { projection_id: 'proj_right', disclosed_opaque_references: ['node_right'] }
  ],
  results: [
    { observation_id: 'baseline', projection_ids: [], state: 'OBSERVED', recovered: {} },
    { observation_id: 'left', projection_ids: ['proj_left'], state: 'OBSERVED', recovered: { node_ids: ['node_left'] } },
    { observation_id: 'right', projection_ids: ['proj_right'], state: 'OBSERVED', recovered: { node_ids: ['node_right'] } },
    {
      observation_id: 'pair',
      projection_ids: ['proj_right', 'proj_left'],
      state: 'OBSERVED',
      recovered: {
        node_ids: ['node_left', 'node_right', 'node_hidden'],
        relationship_ids: ['edge_bridge', 'edge_hidden'],
        chronology: 1000
      }
    }
  ]
});

assert.equal(generic.calibration_state, 'NOT_ENOUGH_TEST_DATA');
assert.deepEqual(generic.pairwise_residue[0].residue.node_ids, ['node_hidden']);
assert.deepEqual(generic.pairwise_residue[0].residue.hypothesis_ids, ['node_hidden']);
assert.deepEqual(generic.pairwise_residue[0].residue.relationship_ids, ['edge_bridge', 'edge_hidden']);
assert.deepEqual(generic.pairwise_residue[0].residue.room_bridge_ids, ['edge_bridge']);
assert.equal(generic.pairwise_residue[0].emergent_topology_detected, true);
assert.equal(await verifyMoireRebuildAssay(generic), true);

await assert.rejects(
  compileMoireRebuildAssay({
    caseMap,
    routeMemory,
    reader: deterministicReader,
    projections: [
      { projection_id: 'proj_left', disclosed_opaque_references: ['node_left'] },
      { projection_id: 'proj_right', disclosed_opaque_references: ['node_right'] }
    ],
    results: []
  }),
  /baseline observation/
);

console.log('ash-keep-moire.test.mjs passed');
