import assert from 'node:assert/strict';
import {
  compileCaseMap,
  compileLinkCheck,
  compileReaderProfile,
  compileRebuildTest,
  compileRoomRules,
  compileRouteMemory,
  compileUnexpectedDetail,
  replayRebuildTest,
  runDeterministicReader,
  verifyCaseMap,
  verifyLinkCheck,
  verifyReaderProfile,
  verifyRebuildReplay,
  verifyRebuildTest,
  verifyRoomRules,
  verifyRouteMemory,
  verifyUnexpectedDetail
} from '../app/engine/ash-keep-core.js';

const DIGEST = `sha256:${'a'.repeat(64)}`;
const caseMap = await compileCaseMap({
  caseId: 'case_glasshouse',
  profile: 'investigation',
  title: 'Glasshouse Archive',
  rooms: [
    { id: 'room_records', label: 'Records' },
    { id: 'room_sources', label: 'Sources' }
  ],
  nodes: [
    { id: 'node_archive', type: 'artifact', label: 'Public archive index', room_id: 'room_records', chronology_index: 1 },
    { id: 'node_source', type: 'source', label: 'Synthetic source class', room_id: 'room_sources', chronology_index: 2 },
    { id: 'node_hypothesis', type: 'hypothesis', label: 'Indexes diverge', room_id: 'room_records', chronology_index: 3 },
    { id: 'node_next', type: 'intended-action', label: 'Request public index', room_id: 'room_records', chronology_index: 4 }
  ],
  relationships: [
    { id: 'edge_source_archive', from: 'node_source', to: 'node_archive', type: 'describes' },
    { id: 'edge_archive_hypothesis', from: 'node_archive', to: 'node_hypothesis', type: 'supports' },
    { id: 'edge_hypothesis_next', from: 'node_hypothesis', to: 'node_next', type: 'suggests' }
  ],
  privateChronology: ['index observed', 'difference recorded'],
  intendedActions: ['request a public index']
});
assert.equal(caseMap.object_label, 'Case Map');
assert.equal(await verifyCaseMap(caseMap), true);

const roomRules = await compileRoomRules({
  caseId: caseMap.case_id,
  rules: [{ route_id: 'route_public', allowed_room_ids: ['room_records'], local_link_keys: ['edge_source_archive'] }]
});
assert.equal(roomRules.timing_shield.cover_traffic, false);
assert.equal(roomRules.timing_shield.chronology_falsification, false);
assert.equal(await verifyRoomRules(roomRules), true);

const routeMemory = await compileRouteMemory({
  caseId: caseMap.case_id,
  entries: [{
    draft_digest: DIGEST,
    route_id: 'route_public',
    purpose: 'request a public index',
    recipient_class: 'public records office',
    disclosed_opaque_references: ['node_archive']
  }],
  operatorDeclaredAssumptions: ['the recipient can read the disclosed request'],
  unknown: ['whether the request will be retained']
});
assert.equal(routeMemory.entries[0].record_class, 'WHAT_ACTUALLY_LEFT');
assert.equal(await verifyRouteMemory(routeMemory), true);

const quickReader = await compileReaderProfile({
  readerId: 'reader_quickscan',
  label: 'Ash v0.6 Quick Scan',
  readerClass: 'ash-v06-quick-scan'
});
assert.equal(await verifyReaderProfile(quickReader), true);
const projection = runDeterministicReader({ caseMap, routeMemory, proposedReferences: ['node_hypothesis'] });
assert.deepEqual(projection.before.node_ids, ['node_archive']);
assert.ok(projection.after.relationship_ids.includes('edge_archive_hypothesis'));

const quickTest = await compileRebuildTest({
  caseMap,
  routeMemory,
  reader: quickReader,
  trials: [{ state: 'OBSERVED', before: projection.before, after: projection.after }]
});
assert.equal(quickTest.mode, 'QUICK_SCAN');
assert.equal(quickTest.calibration_state, 'NOT_ENOUGH_TEST_DATA');
assert.equal(quickTest.exposure_bands_active, false);
assert.equal(quickTest.automatic_hold, false);
assert.equal(quickTest.trials[0].after.nodes.numerator, 2);
assert.equal(quickTest.trials[0].after.nodes.denominator, 4);
assert.equal(await verifyRebuildTest(quickTest), true);

const repeatedReader = await compileReaderProfile({ label: 'Seeded baseline', readerClass: 'deterministic-baseline', repeatCount: 2, seeded: true });
const calibrated = await compileRebuildTest({
  caseMap,
  routeMemory,
  reader: repeatedReader,
  trials: [
    { trial_id: 'trial_control', state: 'OBSERVED', benign_control: true, before: projection.before, after: projection.before },
    { trial_id: 'trial_heldout', state: 'OBSERVED', held_out: true, before: projection.before, after: projection.after }
  ],
  calibration: {
    preregisteredFixture: true,
    sourceDriftCheck: true,
    alternativeReader: true,
    exactThresholds: { room_bridges: { numerator: 1, denominator: 2 } }
  }
});
assert.equal(calibrated.calibration_state, 'CALIBRATED_FOR_NAMED_FIXTURE');
assert.equal(calibrated.exposure_bands_active, true);
assert.equal(calibrated.real_surveillance_probability, null);

const replay = await replayRebuildTest(calibrated);
assert.equal(replay.status, 'REPLAY_VERIFIED');
assert.equal(replay.graph_content_restored, false);
assert.equal(await verifyRebuildReplay(replay), true);
const tampered = structuredClone(calibrated);
tampered.trials[1].state = 'NULL';
assert.equal((await replayRebuildTest(tampered)).status, 'REPLAY_HELD');

const link = await compileLinkCheck({
  leftText: 'The archive index changed after the public revision.',
  rightText: 'After the revision, the archive index showed a different structure.'
});
assert.equal(link.result, 'COMPARISON_AVAILABLE');
assert.equal(await verifyLinkCheck(link), true);

const detail = await compileUnexpectedDetail({
  caseId: caseMap.case_id,
  detail: 'The provider introduced a synthetic committee name.',
  knownBeforeOutput: false
});
assert.equal(detail.acquisition_route, 'UNKNOWN');
assert.equal(detail.actor_attribution, null);
assert.equal(await verifyUnexpectedDetail(detail), true);

console.log('ash-keep-core.test.mjs passed');
