import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), 'utf8');
const schema = JSON.parse(read('app/dome-world/schemas/ash-compare.schema.json'));
const runtime = read('packages/dome_world_exact/ash_v06.py');
const html = read('app/dome-world/ash-custody.html');

assert.equal(schema.$id, 'td613.ash.compare/v0.6');
assert.equal(schema.properties.claimCeiling.const, 'ash-compare-delta-not-legal-redaction-certification');
assert.match(runtime, /privacy_pressure_delta/);
assert.match(runtime, /reconstruction_pressure_delta/);
assert.match(runtime, /linkage_pressure_delta/);
assert.match(html, /Ash Compare/);
assert.match(html, /without certifying legal redaction/);

console.log('Ash Compare contract: PASS');
