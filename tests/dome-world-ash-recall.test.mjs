import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), 'utf8');
const schema = JSON.parse(read('app/dome-world/schemas/ash-recall.schema.json'));
const runtime = read('packages/dome_world_exact/ash_v06.py');
const html = read('app/dome-world/ash-custody.html');

assert.equal(schema.$id, 'td613.ash.recall/v0.6');
assert.equal(schema.properties.content_deleted_claimed.const, false);
assert.equal(schema.properties.public_export_allowed.const, false);
assert.equal(schema.properties.claimCeiling.const, 'ash-recall-not-erasure-proof');
assert.match(runtime, /content_deleted_claimed.*False/s);
assert.match(runtime, /public_export_allowed.*False/s);
assert.match(html, /Recall does not claim deletion from external systems/);

console.log('Ash Recall contract: PASS');
