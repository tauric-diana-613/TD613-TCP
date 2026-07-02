import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), 'utf8');
const schema = JSON.parse(read('app/dome-world/schemas/ash-cinder.schema.json'));
const runtime = read('packages/dome_world_exact/ash_v06.py');
const html = read('app/dome-world/ash-custody.html');

assert.equal(schema.$id, 'td613.ash.cinder/v0.6');
assert.equal(schema.properties.raw_document_exported.const, false);
assert.equal(schema.properties.claimCeiling.const, 'ash-cinder-fragment-not-full-document');
assert.match(runtime, /operatorApproved/);
assert.match(runtime, /export_blocked_reason/);
assert.match(runtime, /content_exported/);
assert.match(html, /Cinder Builder/);
assert.match(html, /Operator approval recorded/);

console.log('Ash Cinder contract: PASS');
