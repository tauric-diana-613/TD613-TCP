import assert from 'node:assert/strict';
import {
  compileHushInterventionReceipt,
  replayHushInterventionReceipt,
  verifyHushInterventionEnsemble,
  verifyHushInterventionReceipt,
  verifyHushInterventionReplay
} from '../../app/engine/hush-intervention.js';
import { buildHushInterventionFixture } from '../fixtures/hush-intervention-fixture.mjs';

const fixture = await buildHushInterventionFixture();
assert.equal(await verifyHushInterventionEnsemble(fixture.ensemble), true);
for (const field of [
  'complete_case_map_allowed', 'room_keys_allowed', 'route_memory_body_allowed',
  'private_alias_table_allowed', 'raw_custody_material_allowed',
  'persistence_authorized', 'release_authorized', 'transport_authorized',
  'cinder_action_authorized', 'automatic_hold', 'automatic_ash_action'
]) assert.equal(fixture.ensemble[field], false, `${field} crossed the Hush ceiling`);
assert.equal(fixture.ensemble.candidate_only, true);

const receipt = await compileHushInterventionReceipt(fixture.receiptInput);
assert.equal(await verifyHushInterventionReceipt(receipt), true);
assert.equal(receipt.intervention_state, 'INTERVENTION_ELIGIBLE');
assert.deepEqual(receipt.holds, []);
assert.equal(receipt.candidate_status, 'UNKEPT_CANDIDATE');
assert.equal(receipt.candidate_kept, false);
assert.equal(receipt.universal_score, null);
assert.deepEqual(receipt.next_required_passages, ['LOCAL_REBUILD', 'LOCAL_REVIEW', 'ASH_RELEASE_AUTHORIZATION']);
for (const field of [
  'readers_executed_by_receipt_compiler', 'provider_call_performed_by_receipt_compiler',
  'network_called', 'storage_mutated', 'release_authorized', 'transport_authorized',
  'cinder_action_authorized', 'automatic_hold', 'automatic_ash_action'
]) assert.equal(receipt[field], false, `${field} crossed the receipt ceiling`);

const replay = await replayHushInterventionReceipt(receipt, { replayId: 'hush_replay_fixture' });
assert.equal(await verifyHushInterventionReplay(replay), true);
assert.equal(replay.status, 'HUSH_INTERVENTION_REPLAY_VERIFIED');
assert.equal(replay.intervention_reexecuted, false);
assert.equal(replay.readers_reexecuted, false);
assert.equal(replay.provider_reexecuted, false);

const mutated = structuredClone(receipt);
mutated.candidate_digest = `sha256:${'4'.repeat(64)}`;
const heldReplay = await replayHushInterventionReceipt(mutated, { replayId: 'hush_replay_held' });
assert.equal(heldReplay.status, 'HUSH_INTERVENTION_REPLAY_HELD');

console.log('hush-intervention/eligible.test.mjs passed');
