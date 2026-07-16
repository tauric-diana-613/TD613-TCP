import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => JSON.parse(fs.readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8'));
const ensemble = read('app/dome-world/schemas/hush-intervention-ensemble-v01.schema.json');
const receipt = read('app/dome-world/schemas/hush-intervention-receipt-v01.schema.json');
const replay = read('app/dome-world/schemas/hush-intervention-replay-v01.schema.json');

assert.equal(ensemble.$id, 'td613.hush.intervention-ensemble/v0.1');
assert.equal(ensemble.properties.schema.const, ensemble.$id);
assert.equal(ensemble.properties.vocabulary_version.const, 'v0.1');
assert.equal(ensemble.properties.provider_use_requires_explicit_provider_draft_gesture.const, true);
for (const field of [
  'complete_case_map_allowed', 'room_keys_allowed', 'route_memory_body_allowed',
  'private_alias_table_allowed', 'raw_custody_material_allowed',
  'persistence_authorized', 'release_authorized', 'transport_authorized',
  'cinder_action_authorized', 'automatic_hold', 'automatic_ash_action'
]) assert.equal(ensemble.properties[field].const, false);
assert.equal(ensemble.properties.candidate_only.const, true);

assert.equal(receipt.$id, 'td613.hush.intervention-receipt/v0.1');
assert.equal(receipt.properties.schema.const, receipt.$id);
assert.equal(receipt.properties.candidate_status.const, 'UNKEPT_CANDIDATE');
assert.equal(receipt.properties.candidate_kept.const, false);
assert.equal(receipt.properties.universal_score.type, 'null');
assert.deepEqual(receipt.properties.next_required_passages.const, ['LOCAL_REBUILD', 'LOCAL_REVIEW', 'ASH_RELEASE_AUTHORIZATION']);
assert.equal(receipt.properties.intervention_state.enum.length, 11);
for (const field of [
  'readers_executed_by_receipt_compiler', 'provider_call_performed_by_receipt_compiler',
  'network_called', 'storage_mutated', 'release_authorized', 'transport_authorized',
  'cinder_action_authorized', 'automatic_hold', 'automatic_ash_action'
]) assert.equal(receipt.properties[field].const, false);

assert.equal(replay.$id, 'td613.hush.intervention-replay/v0.1');
assert.equal(replay.properties.schema.const, replay.$id);
assert.deepEqual(replay.properties.status.enum, ['HUSH_INTERVENTION_REPLAY_VERIFIED', 'HUSH_INTERVENTION_REPLAY_HELD']);
for (const field of [
  'intervention_reexecuted', 'readers_reexecuted', 'provider_reexecuted',
  'candidate_kept', 'release_authorized', 'transport_authorized', 'cinder_action_authorized'
]) assert.equal(replay.properties[field].const, false);

console.log('hush-intervention/schemas.test.mjs passed');
