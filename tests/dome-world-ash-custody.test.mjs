import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), 'utf8');

const html = read('app/dome-world/ash-custody.html');
const api = read('api/dome-world-engine.py');
const manifestSchema = JSON.parse(read('app/dome-world/schemas/ash-custody-manifest.schema.json'));
const receiptSchema = JSON.parse(read('app/dome-world/schemas/ash-receipt.schema.json'));
const phasonSchema = JSON.parse(read('app/dome-world/schemas/phason-custody-diff.schema.json'));
const indexSchema = JSON.parse(read('app/dome-world/schemas/receipt-index.schema.json'));

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

const envs = manifestSchema.properties.source_environment.enum;
for (const env of ['local_file', 'repo', 'cloud_drive', 'local_drive', 'spreadsheet', 'llm_chat', 'manual']) {
  assert.ok(envs.includes(env));
}

console.log('Ash custody layer contract: PASS');
