import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const registry = JSON.parse(await readFile(
  new URL('../app/dome-world/schemas/aperture-reader-adapter-registry-v01.schema.json', import.meta.url),
  'utf8'
));
const provenance = JSON.parse(await readFile(
  new URL('../app/dome-world/schemas/aperture-reader-result-provenance-v01.schema.json', import.meta.url),
  'utf8'
));
const replay = JSON.parse(await readFile(
  new URL('../app/dome-world/schemas/aperture-reader-result-provenance-replay-v01.schema.json', import.meta.url),
  'utf8'
));

assert.equal(registry.$id, 'td613.aperture.reader-adapter-registry/v0.1');
assert.equal(registry.properties.schema.const, registry.$id);
assert.equal(registry.properties.reader_execution_performed.const, false);
assert.equal(registry.properties.provider_call_performed.const, false);
assert.equal(registry.properties.transport_authorized.const, false);
assert.equal(registry.properties.release_authorized.const, false);
assert.equal(registry.properties.prediction_authorized.const, false);
assert.equal(registry.properties.automatic_hold.const, false);
assert.equal(registry.$defs.adapter.properties.identity_inference_authorized.const, false);
assert.equal(registry.$defs.adapter.properties.authorship_attribution_authorized.const, false);
assert.equal(registry.$defs.adapter.properties.surveillance_probability_authorized.const, false);

assert.equal(provenance.$id, 'td613.aperture.reader-result-provenance/v0.1');
assert.equal(provenance.properties.schema.const, provenance.$id);
assert.deepEqual(
  provenance.properties.provenance_state.enum,
  ['PROVENANCE_BOUND', 'PROVENANCE_INCOMPLETE']
);
assert.equal(provenance.properties.execution_observed_by_registry.const, false);
assert.equal(provenance.properties.input_content_present.const, false);
assert.equal(provenance.properties.result_content_present.const, false);
assert.equal(provenance.properties.reader_execution_performed_by_registry.const, false);
assert.equal(provenance.properties.provider_call_performed_by_registry.const, false);
assert.equal(provenance.properties.network_called_by_registry.const, false);
assert.equal(provenance.properties.storage_mutated_by_registry.const, false);
assert.equal(provenance.properties.transport_authorized.const, false);
assert.equal(provenance.properties.release_authorized.const, false);
assert.equal(provenance.properties.identity_inference_authorized.const, false);
assert.equal(provenance.properties.authorship_attribution_authorized.const, false);
assert.equal(provenance.properties.surveillance_probability_authorized.const, false);
assert.equal(provenance.properties.prediction_authorized.const, false);
assert.equal(provenance.properties.automatic_hold.const, false);
assert.equal(provenance.properties.recommendation_not_command.const, true);

assert.equal(replay.$id, 'td613.aperture.reader-result-provenance-replay/v0.1');
assert.equal(replay.properties.schema.const, replay.$id);
assert.equal(replay.properties.input_content_restored.const, false);
assert.equal(replay.properties.result_content_restored.const, false);
assert.equal(replay.properties.reader_reexecuted.const, false);
assert.equal(replay.properties.provider_called.const, false);
assert.equal(replay.properties.network_called.const, false);
assert.equal(replay.properties.storage_mutated.const, false);
assert.equal(replay.properties.transport_authorized.const, false);
assert.equal(replay.properties.release_authorized.const, false);
assert.equal(replay.properties.identity_inference_authorized.const, false);
assert.equal(replay.properties.authorship_attribution_authorized.const, false);
assert.equal(replay.properties.surveillance_probability_authorized.const, false);
assert.equal(replay.properties.prediction_authorized.const, false);
assert.equal(replay.properties.automatic_hold.const, false);
assert.equal(replay.properties.recommendation_not_command.const, true);

console.log('ash-keep-reader-adapter-schemas.test.mjs passed');
