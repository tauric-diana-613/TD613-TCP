import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const bank = JSON.parse(await readFile(
  new URL('../app/dome-world/schemas/aperture-matched-benign-control-bank-v01.schema.json', import.meta.url),
  'utf8'
));
const replay = JSON.parse(await readFile(
  new URL('../app/dome-world/schemas/aperture-matched-benign-control-bank-replay-v01.schema.json', import.meta.url),
  'utf8'
));

assert.equal(bank.$id, 'td613.aperture.matched-benign-control-bank/v0.1');
assert.equal(bank.properties.schema.const, bank.$id);
assert.equal(bank.properties.mode.const, 'MATCHED_BENIGN_ADJACENT_DOCUMENT_CONTROLS');
assert.equal(bank.properties.minimum_eligible_controls.minimum, 3);
assert.deepEqual(bank.properties.bank_state.enum, [
  'CALIBRATED_MATCHED_CONTROL_BANK',
  'PARTIAL_MATCHED_CONTROL_BANK',
  'CONTROL_BANK_HELD'
]);
assert.equal(bank.properties.universal_control_score.type, 'null');
assert.equal(bank.properties.real_surveillance_probability.type, 'null');
assert.equal(bank.properties.raw_document_present.const, false);
assert.equal(bank.properties.raw_reader_input_present.const, false);
assert.equal(bank.properties.raw_reader_result_present.const, false);
assert.equal(bank.properties.readers_executed_by_bank.const, false);
assert.equal(bank.properties.provider_call_performed.const, false);
assert.equal(bank.properties.network_called.const, false);
assert.equal(bank.properties.storage_mutated.const, false);
assert.equal(bank.properties.transport_authorized.const, false);
assert.equal(bank.properties.release_authorized.const, false);
assert.equal(bank.properties.identity_inference_authorized.const, false);
assert.equal(bank.properties.authorship_attribution_authorized.const, false);
assert.equal(bank.properties.ownership_inference_authorized.const, false);
assert.equal(bank.properties.truth_adjudication_authorized.const, false);
assert.equal(bank.properties.prediction_authorized.const, false);
assert.equal(bank.properties.automatic_hold.const, false);
assert.equal(bank.properties.recommendation_not_command.const, true);
assert.deepEqual(bank.$defs.matchProfile.required, [
  'topic', 'genre', 'template', 'register', 'approximate_length_band', 'source_conditions'
]);

assert.equal(replay.$id, 'td613.aperture.matched-benign-control-bank-replay/v0.1');
assert.equal(replay.properties.schema.const, replay.$id);
assert.equal(replay.properties.control_distribution_recomputed.const, false);
assert.equal(replay.properties.raw_documents_restored.const, false);
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
assert.equal(replay.properties.truth_adjudication_authorized.const, false);
assert.equal(replay.properties.prediction_authorized.const, false);
assert.equal(replay.properties.automatic_hold.const, false);
assert.equal(replay.properties.recommendation_not_command.const, true);

console.log('ash-keep-benign-controls-schemas.test.mjs passed');
