import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const assay = JSON.parse(await readFile(
  new URL('../app/dome-world/schemas/aperture-moire-rebuild-assay-v01.schema.json', import.meta.url),
  'utf8'
));
const replay = JSON.parse(await readFile(
  new URL('../app/dome-world/schemas/aperture-moire-rebuild-replay-v01.schema.json', import.meta.url),
  'utf8'
));

assert.equal(assay.$id, 'td613.aperture.moire-rebuild-assay/v0.1');
assert.equal(assay.properties.schema.const, assay.$id);
assert.equal(assay.properties.mode.const, 'PAIRWISE_MOIRE_REBUILD');
assert.equal(assay.properties.real_surveillance_probability.type, 'null');
assert.equal(assay.properties.automatic_hold.const, false);
assert.equal(assay.properties.automatic_ash_action.const, false);
assert.equal(assay.properties.prediction_authorized.const, false);
assert.equal(assay.properties.recommendation_not_command.const, true);
assert.equal(assay.properties.projections.maxItems, 32);
assert.equal(assay.$defs.observation.properties.projection_ids.maxItems, 2);
assert.equal(assay.$defs.observation.properties.projection_ids.uniqueItems, true);
assert.equal(assay.$defs.pairResidue.properties.projection_ids.uniqueItems, true);
assert.equal(assay.properties.calibration.$ref, '#/$defs/calibration');
assert.equal(assay.$defs.calibration.additionalProperties, false);
for (const field of [
  'complete_baseline',
  'complete_singleton_coverage',
  'complete_pair_coverage',
  'observed_baseline',
  'observed_singleton_coverage',
  'observed_pair_coverage',
  'all_required_observations_observed'
]) {
  assert.ok(assay.$defs.calibration.required.includes(field), `Calibration schema omitted ${field}`);
  assert.equal(assay.$defs.calibration.properties[field].type, 'boolean');
}
assert.deepEqual(
  assay.properties.calibration_state.enum,
  ['CALIBRATED_FOR_NAMED_FIXTURE', 'NOT_ENOUGH_TEST_DATA']
);

assert.equal(replay.$id, 'td613.aperture.moire-rebuild-replay/v0.1');
assert.equal(replay.properties.schema.const, replay.$id);
assert.equal(replay.properties.assay_content_restored.const, false);
assert.equal(replay.properties.reconstruction_reexecuted.const, false);
assert.equal(replay.properties.network_called.const, false);
assert.equal(replay.properties.storage_mutated.const, false);
assert.equal(replay.properties.automatic_ash_action.const, false);
assert.equal(replay.properties.prediction_authorized.const, false);
assert.equal(replay.properties.recommendation_not_command.const, true);

console.log('ash-keep-moire-schemas.test.mjs passed');
