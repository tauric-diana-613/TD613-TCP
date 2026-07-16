import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => JSON.parse(fs.readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8'));
const plan = read('app/dome-world/schemas/aperture-composition-plan-v01.schema.json');
const receipt = read('app/dome-world/schemas/aperture-composition-receipt-v01.schema.json');
const projection = read('app/dome-world/schemas/aperture-presentation-projection-v01.schema.json');
const replay = read('app/dome-world/schemas/aperture-composition-replay-v01.schema.json');

for (const schema of [plan, receipt, projection, replay]) assert.equal(schema.additionalProperties, false);
assert.equal(plan.$id, 'td613.aperture.composition-plan/v0.1');
assert.equal(plan.properties.schema.const, plan.$id);
assert.deepEqual(plan.properties.layer_order.const, [
  'AUTHORITY_CONTEXT', 'CONTROLLED_SOURCE', 'INSTRUMENT_ENSEMBLE', 'SNAPSHOT_LATTICE',
  'EXPERIMENT_RUN', 'TOMOGRAPHY_RECEIPT', 'CHOIR_CALIBRATION_BINDING',
  'HUSH_INTERVENTION_RECEIPT', 'PRESENTATION_PROJECTION'
]);
for (const field of [
  'warning_collapse_allowed', 'raw_source_allowed', 'candidate_body_allowed',
  'case_map_body_allowed', 'route_memory_body_allowed', 'provider_log_allowed',
  'reader_result_body_allowed', 'ui_mount_authorized',
  'automatic_instrument_selection', 'automatic_model_selection',
  'promotion_authorized', 'release_authorized', 'transport_authorized',
  'cinder_action_authorized', 'automatic_hold', 'automatic_ash_action'
]) assert.equal(plan.properties[field].const, false);
assert.equal(plan.properties.universal_score.type, 'null');

assert.equal(receipt.$id, 'td613.aperture.composition-receipt/v0.1');
assert.equal(receipt.properties.composition_state.enum.length, 11);
for (const field of [
  'ui_mounted', 'ui_mount_authorized', 'instruments_executed_by_composition',
  'readers_executed_by_composition', 'provider_called_by_composition',
  'reconstruction_reexecuted', 'network_called', 'storage_mutated',
  'promotion_authorized', 'release_authorized', 'transport_authorized',
  'cinder_action_authorized', 'automatic_hold', 'automatic_ash_action',
  'automatic_instrument_selection', 'automatic_model_selection'
]) assert.equal(receipt.properties[field].const, false);
assert.equal(receipt.properties.universal_score.type, 'null');

assert.equal(projection.$id, 'td613.aperture.presentation-projection/v0.1');
for (const field of [
  'raw_source_present', 'candidate_body_present', 'case_map_body_present',
  'route_memory_body_present', 'provider_log_present', 'reader_result_body_present',
  'ui_mounted', 'ui_mount_authorized', 'instruments_executed', 'readers_executed',
  'provider_called', 'network_called', 'storage_mutated', 'promotion_authorized',
  'release_authorized', 'transport_authorized', 'cinder_action_authorized',
  'automatic_hold', 'automatic_ash_action'
]) assert.equal(projection.properties[field].const, false);

assert.equal(replay.$id, 'td613.aperture.composition-replay/v0.1');
for (const field of [
  'composition_reexecuted', 'instruments_reexecuted', 'reconstruction_reexecuted',
  'readers_reexecuted', 'provider_reexecuted', 'ui_mounted', 'storage_mutated',
  'release_authorized', 'transport_authorized', 'cinder_action_authorized',
  'automatic_hold', 'automatic_ash_action'
]) assert.equal(replay.properties[field].const, false);

console.log('aperture-composition/schemas.test.mjs passed');
