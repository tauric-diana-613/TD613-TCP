import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), 'utf8');
const api = read('api/dome-world-engine.py');
const runtime = read('packages/dome_world_exact/ash_v06.py');
const schema = JSON.parse(read('app/dome-world/schemas/ash-leak-challenge.schema.json'));
const html = read('app/dome-world/ash-custody.html');

assert.equal(schema.$id, 'td613.ash.leak-challenge/v0.6');
assert.equal(schema.properties.raw_content_received.const, false);
assert.equal(schema.properties.claimCeiling.const, 'ash-leak-challenge-risk-estimate-not-anonymity-certification');
assert.match(api, /"ash-leak-challenge"/);
assert.match(api, /walk\(payload\)/);
assert.match(api, /raw content fields are prohibited/);
for (const metric of ['reconstruction_pressure', 'entity_inference_pressure', 'chronology_leakage', 'stylometric_heat', 'linkage_pressure', 'custody_category_leakage', 'authority_drift', 'anti_equivalence_collapse']) {
  assert.match(runtime, new RegExp(metric));
}
assert.match(html, /client-local-raw-text-never-sent/);
assert.match(html, /raw_text_sent_to_server:false/);
assert.match(html, /localLeakText'\)\.value=''/);

console.log('Ash Leak Challenge contract: PASS');
