import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => JSON.parse(fs.readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8'));
const plan = read('app/dome-world/schemas/aperture-composition-constitution-plan-v01.schema.json');
const receipt = read('app/dome-world/schemas/aperture-composition-constitution-receipt-v01.schema.json');
const projection = read('app/dome-world/schemas/aperture-composition-constitution-projection-v01.schema.json');
const replay = read('app/dome-world/schemas/aperture-composition-constitution-replay-v01.schema.json');

const falsePlan = [
  'warning_collapse_allowed', 'raw_source_allowed', 'candidate_body_allowed',
  'case_map_body_allowed', 'route_memory_body_allowed', 'provider_log_allowed',
  'reader_result_body_allowed', 'ui_mount_authorized',
  'automatic_instrument_selection', 'automatic_model_selection',
  'promotion_authorized', 'release_authorized', 'transport_authorized',
  'cinder_action_authorized', 'automatic_hold', 'automatic_ash_action'
];
for (const field of falsePlan) assert.equal(plan.properties[field].const, false);

const falseReceipt = [
  'ui_mounted', 'ui_mount_authorized', 'instruments_executed_by_composition',
  'readers_executed_by_composition', 'provider_called_by_composition',
  'reconstruction_reexecuted', 'network_called', 'storage_mutated',
  'promotion_authorized', 'release_authorized', 'transport_authorized',
  'cinder_action_authorized', 'automatic_hold', 'automatic_ash_action',
  'automatic_instrument_selection', 'automatic_model_selection'
];
for (const field of falseReceipt) assert.equal(receipt.properties[field].const, false);

const falseProjection = [
  'raw_source_present', 'candidate_body_present', 'case_map_body_present',
  'route_memory_body_present', 'provider_log_present', 'reader_result_body_present',
  'ui_mounted', 'ui_mount_authorized', 'instruments_executed', 'readers_executed',
  'provider_called', 'network_called', 'storage_mutated', 'promotion_authorized',
  'release_authorized', 'transport_authorized', 'cinder_action_authorized',
  'automatic_hold', 'automatic_ash_action'
];
for (const field of falseProjection) assert.equal(projection.properties[field].const, false);

const falseReplay = [
  'composition_reexecuted', 'instruments_reexecuted', 'reconstruction_reexecuted',
  'readers_reexecuted', 'provider_reexecuted', 'ui_mounted', 'storage_mutated',
  'release_authorized', 'transport_authorized', 'cinder_action_authorized',
  'automatic_hold', 'automatic_ash_action'
];
for (const field of falseReplay) assert.equal(replay.properties[field].const, false);
assert.equal(plan.properties.universal_score.type, 'null');
assert.equal(receipt.properties.universal_score.type, 'null');

console.log('aperture-composition/constitution-schema-boundaries.test.mjs passed');
