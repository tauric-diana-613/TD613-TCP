import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const binding = JSON.parse(await readFile(
  new URL('../app/dome-world/schemas/aperture-choir-calibration-binding-v01.schema.json', import.meta.url),
  'utf8'
));
const replay = JSON.parse(await readFile(
  new URL('../app/dome-world/schemas/aperture-choir-calibration-replay-v01.schema.json', import.meta.url),
  'utf8'
));
const higherOrder = JSON.parse(await readFile(
  new URL('../app/dome-world/schemas/aperture-higher-order-interference-v01.schema.json', import.meta.url),
  'utf8'
));
const orderedRoute = JSON.parse(await readFile(
  new URL('../app/dome-world/schemas/aperture-ordered-route-sequence-v01.schema.json', import.meta.url),
  'utf8'
));
const workflow = await readFile(new URL('../.github/workflows/ash-keep-choir-test.yml', import.meta.url), 'utf8');
const publisher = await readFile(new URL('../scripts/publish-ash-keep-observer-status.mjs', import.meta.url), 'utf8');

assert.equal(binding.$id, 'td613.aperture.choir-calibration-binding/v0.1');
assert.equal(binding.properties.schema.const, binding.$id);
assert.equal(binding.properties.mode.const, 'RECEIPT_BOUND_CHOIR_CALIBRATION');
assert.deepEqual(binding.properties.binding_state.enum, [
  'CALIBRATION_ELIGIBLE',
  'TAMPER_HOLD',
  'STALE_CASE_HOLD',
  'SOURCE_DRIFT_HOLD',
  'RECEIPT_REFERENCE_HOLD',
  'NOT_ENOUGH_TEST_DATA'
]);
assert.equal(binding.properties.free_calibration_booleans_accepted.const, false);
assert.equal(binding.properties.universal_calibration_score.type, 'null');
assert.equal(binding.properties.real_surveillance_probability.type, 'null');
assert.equal(binding.properties.readers_executed_by_binding.const, false);
assert.equal(binding.properties.provider_call_performed.const, false);
assert.equal(binding.properties.network_called.const, false);
assert.equal(binding.properties.storage_mutated.const, false);
assert.equal(binding.properties.release_authorized.const, false);
assert.equal(binding.properties.transport_authorized.const, false);
assert.equal(binding.properties.cinder_action_authorized.const, false);
assert.equal(binding.properties.prediction_authorized.const, false);
assert.equal(binding.properties.automatic_hold.const, false);
assert.equal(binding.properties.automatic_ash_action.const, false);
assert.equal(binding.properties.recommendation_not_command.const, true);
assert.equal(binding.properties.componentwise_comparison.properties.source.const, 'MATCHED_BENIGN_CONTROL_BANK');
assert.equal(binding.$defs.receiptReferences.properties.moire_assay_digests.minItems, 2);
assert.equal(binding.$defs.receiptReferences.properties.reader_provenance_digests.minItems, 2);

assert.equal(replay.$id, 'td613.aperture.choir-calibration-replay/v0.1');
assert.equal(replay.properties.schema.const, replay.$id);
assert.deepEqual(replay.properties.status.enum, [
  'CHOIR_CALIBRATION_REPLAY_VERIFIED',
  'CHOIR_CALIBRATION_REPLAY_HELD'
]);
assert.equal(replay.properties.replay_digest.pattern, '^sha256:[0-9a-f]{64}$');

assert.equal(higherOrder.$id, 'td613.aperture.higher-order-interference/v0.1');
assert.equal(higherOrder.properties.schema.const, higherOrder.$id);
assert.equal(higherOrder.properties.mode.const, 'BOUNDED_K_ORDER_INTERFERENCE');
assert.equal(higherOrder.properties.order_k.minimum, 3);
assert.equal(higherOrder.properties.order_k.maximum, 6);
assert.equal(higherOrder.properties.declared_caps.properties.max_subsets.maximum, 64);
assert.equal(higherOrder.properties.emergent_residue_is_causation.const, false);
assert.equal(higherOrder.properties.surveillance_probability.type, 'null');
assert.equal(higherOrder.properties.release_authorized.const, false);
assert.equal(higherOrder.properties.transport_authorized.const, false);
assert.equal(higherOrder.properties.suppression_authorized.const, false);
assert.equal(higherOrder.properties.cinder_action_authorized.const, false);
assert.equal(higherOrder.properties.recommendation_not_command.const, true);

assert.equal(orderedRoute.$id, 'td613.aperture.ordered-route-sequence/v0.1');
assert.equal(orderedRoute.properties.schema.const, orderedRoute.$id);
assert.equal(orderedRoute.properties.mode.const, 'BOUNDED_ORDERED_ROUTE_SEQUENCE_RECOVERY');
assert.equal(orderedRoute.properties.declared_caps.properties.max_steps.maximum, 16);
assert.equal(orderedRoute.properties.declared_caps.properties.max_controls.maximum, 8);
assert.deepEqual(orderedRoute.properties.state.enum, [
  'ORDERED_SEQUENCE_ELIGIBLE',
  'CANCELLED_HOLD',
  'TAMPER_HOLD',
  'STALE_CASE_HOLD',
  'CALIBRATION_HOLD',
  'SEQUENCE_INTEGRITY_HOLD',
  'NOT_ENOUGH_TEST_DATA'
]);
assert.equal(orderedRoute.properties.ordered_sequence_effect_is_causation.const, false);
assert.equal(orderedRoute.properties.surveillance_probability.type, 'null');
assert.equal(orderedRoute.properties.prediction_authorized.const, false);
assert.equal(orderedRoute.properties.release_authorized.const, false);
assert.equal(orderedRoute.properties.transport_authorized.const, false);
assert.equal(orderedRoute.properties.suppression_authorized.const, false);
assert.equal(orderedRoute.properties.cinder_action_authorized.const, false);
assert.equal(orderedRoute.properties.readers_reexecuted.const, false);
assert.equal(orderedRoute.properties.provider_called.const, false);
assert.equal(orderedRoute.properties.network_called.const, false);
assert.equal(orderedRoute.properties.storage_mutated.const, false);
assert.equal(orderedRoute.properties.recommendation_not_command.const, true);

for (const token of [
  'statuses: write',
  'Ash Choir Calibration Validation',
  'Publish Choir validation pending status',
  'Validate ordered route-sequence recovery',
  'Publish Choir validation success status',
  'Publish Choir validation failure status',
  'Reconcile terminal Choir validation failure status',
  'choir-calibration-validation-evidence',
  'observer-status-success.json'
]) assert.ok(workflow.includes(token), `Choir workflow omitted ${token}`);
assert.match(workflow, /github\.event_name == 'push' && github\.ref == 'refs\/heads\/main'/);
assert.match(publisher, /Ash Choir Calibration Validation/);
assert.doesNotMatch(workflow, /release_authorized: true|transport_authorized: true|cinder_action_authorized: true/);

console.log('ash-keep-choir-calibration-schemas.test.mjs passed');
