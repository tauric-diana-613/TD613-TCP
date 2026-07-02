import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), 'utf8');
const schema = JSON.parse(read('app/dome-world/schemas/ash-veil.schema.json'));
const runtime = read('packages/dome_world_exact/ash_v06.py');
const html = read('app/dome-world/ash-custody.html');

assert.equal(schema.$id, 'td613.ash.veil/v0.6');
assert.equal(schema.properties.content_exported.const, false);
assert.equal(schema.properties.surface.const, 'structural-surrogate');
assert.equal(schema.properties.claimCeiling.const, 'ash-veil-structure-not-content-summary');
assert.match(runtime, /route_scoped_digest/);
assert.match(runtime, /exact_path_or_ref.*allowExactPath/s);
assert.match(html, /Build Ash Veil/);
assert.match(html, /must not reveal raw text/);
assert.match(html, /ash-veil/);
assert.match(html, /saltScope:\$\('saltScope'\)\.value/);

console.log('Ash Veil contract: PASS');
