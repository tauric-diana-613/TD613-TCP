import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), 'utf8');

const html = read('app/dome-world/ash-custody.html');
const api = read('api/dome-world-engine.py');
const manifestSchema = JSON.parse(read('app/dome-world/schemas/ash-custody-manifest.schema.json'));
const receiptSchema = JSON.parse(read('app/dome-world/schemas/ash-custody-receipt.schema.json'));
const phasonSchema = JSON.parse(read('app/dome-world/schemas/phason-custody-diff.schema.json'));
const indexSchema = JSON.parse(read('app/dome-world/schemas/receipt-index.schema.json'));
const syntheticGarden = JSON.parse(read('app/dome-world/fixtures/ash-custody-garden.json'));

assert.match(html, /Register Artifact/);
assert.match(html, /Ash owns custody/);
assert.match(html, /Receipts index only/);
assert.match(html, /Phason diffs projection/);
assert.match(html, /Substrate waits for exact coordinates/);
assert.match(html, /custody-replay-without-content/);

for (const op of ['ash-custody-register', 'ash-custody-replay', 'phason-custody-diff', 'receipt-index']) {
  assert.match(api, new RegExp(`"${op}"`));
}
assert.match(api, /RAW_CONTENT_KEYS/);

assert.equal(manifestSchema.$id, 'td613.ash.custody-manifest/v0.5');
assert.equal(receiptSchema.$id, 'td613.ash.custody-receipt/v0.5');
assert.equal(phasonSchema.$id, 'td613.phason.custody-diff/v0.5');
assert.equal(indexSchema.$id, 'td613.dome.receipt-index/v0.5');

assert.ok(receiptSchema.required.includes('anti_extraction_defaults'));
assert.equal(receiptSchema.properties.public_surface.properties.content_exported.const, false);
assert.equal(receiptSchema.properties.public_surface.properties.text_preview.const, null);
assert.equal(receiptSchema.properties.public_surface.properties.quantized_weather_only.const, true);
assert.equal(receiptSchema.properties.export_boundary.properties.raw_content_allowed.const, false);
assert.equal(receiptSchema.properties.export_boundary.properties.summary_before_custody.const, false);
assert.equal(receiptSchema.properties.export_boundary.properties.arrival_as_consent.const, false);
assert.equal(receiptSchema.properties.anti_extraction_defaults.properties.local_hold.const, true);
assert.equal(receiptSchema.properties.anti_extraction_defaults.properties.no_content_export.const, true);
assert.equal(receiptSchema.properties.anti_extraction_defaults.properties.public_weather_only.const, true);
assert.equal(receiptSchema.properties.anti_extraction_defaults.properties.receipt_not_proof.const, true);
assert.equal(receiptSchema.properties.anti_extraction_defaults.properties.beauty_not_verification.const, true);
assert.equal(receiptSchema.properties.claimCeiling.const, 'ash-custody-receipt-not-content-custody-or-permission-proof');

const envs = manifestSchema.properties.source_environment.enum;
for (const env of ['local_file', 'repo', 'cloud_drive', 'local_drive', 'spreadsheet', 'llm_chat', 'manual']) {
  assert.ok(envs.includes(env));
}

assert.equal(syntheticGarden.schema, 'td613.ash.synthetic-garden/v0.5');
assert.ok(syntheticGarden.fixtures.length >= 5);
for (const fixture of syntheticGarden.fixtures) {
  assert.ok(fixture.teaches);
  assert.ok(Array.isArray(fixture.doesNotProve));
  assert.ok(fixture.payload?.sourceEnvironment);
  assert.ok(fixture.payload?.sourceLocator);
  assert.ok(fixture.payload?.artifactMetadata?.contentHash);
  assert.ok(fixture.payload?.credentialReference);
  assert.ok(fixture.payload?.ashPosture);
}

console.log('Ash custody layer contract: PASS');
