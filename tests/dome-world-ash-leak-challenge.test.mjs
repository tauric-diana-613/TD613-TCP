import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), 'utf8');
const api = read('api/dome-world-engine.py');
const runtime = read('packages/dome_world_exact/ash_v06.py');
const schema = JSON.parse(read('app/dome-world/schemas/ash-leak-challenge.schema.json'));
const html = read('app/dome-world/ash-custody-v07.html');

assert.equal(schema.$id, 'td613.ash.leak-challenge/v0.6');
assert.equal(schema.properties.raw_content_received.const, false);
assert.equal(schema.properties.claimCeiling.const, 'ash-leak-challenge-risk-estimate-not-anonymity-certification');
assert.match(api, /"ash-leak-challenge"/);
assert.match(api, /walk\(payload\)/);
assert.match(api, /raw content fields are prohibited/);
for (const metric of ['reconstruction_pressure', 'entity_inference_pressure', 'chronology_leakage', 'stylometric_heat', 'linkage_pressure', 'custody_category_leakage', 'authority_drift', 'anti_equivalence_collapse']) {
  assert.match(runtime, new RegExp(metric));
}
assert.match(runtime, /ANTI_GENERIC_RE/);
assert.match(runtime, /_authority_hits/);
assert.match(html, /Client-local mode clears the local text after scoring/);
assert.match(html, /raw_text_sent_to_server:false/);
assert.match(html, /localLeakText["']\)\.value=["']{2}/);

const regression = spawnSync('python3', ['-c', `
from packages.dome_world_exact.ash_v06 import ash_leak_challenge
sample = {
  'schema': 'td613.ash.custody-receipt/v0.5',
  'claimCeiling': 'ash-custody-receipt-not-content-custody-or-permission-proof',
  'anti_extraction_defaults': {'receipt_not_proof': True, 'beauty_not_verification': True},
  'public_surface': {'content_exported': False, 'text_preview': None, 'quantized_weather_only': True}
}
out = ash_leak_challenge({'projection': sample}, {})
assert out['leakageVector']['anti_equivalence_collapse']['bucket'] == 'low', out
assert out['leakageVector']['authority_drift']['bucket'] == 'low', out
`], { cwd: root, encoding: 'utf8' });
assert.equal(regression.status, 0, regression.stderr || regression.stdout);

console.log('Ash Leak Challenge contract: PASS');
