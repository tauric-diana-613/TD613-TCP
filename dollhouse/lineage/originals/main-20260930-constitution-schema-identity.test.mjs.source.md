import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => JSON.parse(fs.readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8'));
const plan = read('app/dome-world/schemas/aperture-composition-constitution-plan-v01.schema.json');
const receipt = read('app/dome-world/schemas/aperture-composition-constitution-receipt-v01.schema.json');
const projection = read('app/dome-world/schemas/aperture-composition-constitution-projection-v01.schema.json');
const replay = read('app/dome-world/schemas/aperture-composition-constitution-replay-v01.schema.json');

for (const schema of [plan, receipt, projection, replay]) assert.equal(schema.additionalProperties, false);
assert.equal(plan.$id, 'td613.aperture.composition-constitution-plan/v0.1');
assert.equal(receipt.$id, 'td613.aperture.composition-constitution-receipt/v0.1');
assert.equal(projection.$id, 'td613.aperture.composition-constitution-projection/v0.1');
assert.equal(replay.$id, 'td613.aperture.composition-constitution-replay/v0.1');
assert.deepEqual(plan.properties.layer_order.const, [
  'AUTHORITY_CONTEXT', 'CONTROLLED_SOURCE', 'INSTRUMENT_ENSEMBLE', 'SNAPSHOT_LATTICE',
  'EXPERIMENT_RUN', 'TOMOGRAPHY_RECEIPT', 'CHOIR_CALIBRATION_BINDING',
  'HUSH_INTERVENTION_RECEIPT', 'PRESENTATION_PROJECTION'
]);
assert.equal(receipt.properties.composition_state.enum.length, 11);

console.log('aperture-composition/constitution-schema-identity.test.mjs passed');
