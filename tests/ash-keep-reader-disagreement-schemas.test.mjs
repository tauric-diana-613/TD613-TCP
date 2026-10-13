import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const ledger = JSON.parse(await readFile(
  new URL('../app/dome-world/schemas/aperture-reader-disagreement-ledger-v01.schema.json', import.meta.url),
  'utf8'
));
const replay = JSON.parse(await readFile(
  new URL('../app/dome-world/schemas/aperture-reader-disagreement-replay-v01.schema.json', import.meta.url),
  'utf8'
));

assert.equal(ledger.$id, 'td613.aperture.reader-disagreement-ledger/v0.1');
assert.equal(ledger.properties.schema.const, ledger.$id);
assert.equal(ledger.properties.mode.const, 'PROVENANCE_GATED_COMPONENTWISE_DISAGREEMENT');
assert.equal(ledger.properties.reader_count.minimum, 2);
assert.deepEqual(
  ledger.properties.comparison_state.enum,
  ['OBSERVED_READER_DISAGREEMENT', 'PARTIAL_READER_DISAGREEMENT']
);
assert.equal(ledger.properties.universal_disagreement_score.type, 'null');
assert.equal(ledger.properties.real_surveillance_probability.type, 'null');
assert.equal(ledger.properties.raw_reader_input_present.const, false);
assert.equal(ledger.properties.raw_reader_result_present.const, false);
assert.equal(ledger.properties.readers_executed_by_ledger.const, false);
assert.equal(ledger.properties.provider_call_performed.const, false);
assert.equal(ledger.properties.network_called.const, false);
assert.equal(ledger.properties.storage_mutated.const, false);
assert.equal(ledger.properties.transport_authorized.const, false);
assert.equal(ledger.properties.release_authorized.const, false);
assert.equal(ledger.properties.identity_inference_authorized.const, false);
assert.equal(ledger.properties.authorship_attribution_authorized.const, false);
assert.equal(ledger.properties.ownership_inference_authorized.const, false);
assert.equal(ledger.properties.prediction_authorized.const, false);
assert.equal(ledger.properties.automatic_hold.const, false);
assert.equal(ledger.properties.recommendation_not_command.const, true);
assert.equal(ledger.$defs.entry.properties.summary_relation.const, 'DECLARED_PURPOSE_SHAPED_SUMMARY');
assert.deepEqual(
  ledger.$defs.entry.properties.provenance_state.enum,
  ['PROVENANCE_BOUND', 'PROVENANCE_INCOMPLETE']
);

assert.equal(replay.$id, 'td613.aperture.reader-disagreement-replay/v0.1');
assert.equal(replay.properties.schema.const, replay.$id);
assert.equal(replay.properties.summaries_restored_from_ledger.const, false);
assert.equal(replay.properties.raw_reader_inputs_restored.const, false);
assert.equal(replay.properties.raw_reader_results_restored.const, false);
assert.equal(replay.properties.readers_reexecuted.const, false);
assert.equal(replay.properties.provider_called.const, false);
assert.equal(replay.properties.network_called.const, false);
assert.equal(replay.properties.storage_mutated.const, false);
assert.equal(replay.properties.transport_authorized.const, false);
assert.equal(replay.properties.release_authorized.const, false);
assert.equal(replay.properties.identity_inference_authorized.const, false);
assert.equal(replay.properties.authorship_attribution_authorized.const, false);
assert.equal(replay.properties.ownership_inference_authorized.const, false);
assert.equal(replay.properties.prediction_authorized.const, false);
assert.equal(replay.properties.automatic_hold.const, false);
assert.equal(replay.properties.recommendation_not_command.const, true);

console.log('ash-keep-reader-disagreement-schemas.test.mjs passed');
