import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), 'utf8');
const hcc = JSON.parse(read('app/dome-world/schemas/ash-hcc.schema.json'));
const grade = JSON.parse(read('app/dome-world/schemas/ash-grade-gate.schema.json'));
const runtime = read('packages/dome_world_exact/ash_v06.py');
const html = read('app/dome-world/ash-custody.html');

assert.equal(hcc.$id, 'td613.hcc.adapter/v0.6');
assert.equal(hcc.properties.identity_inference_allowed.const, false);
assert.equal(hcc.properties.how_policy.const, 'non-diagnostic');
assert.equal(hcc.properties.why_policy.const, 'non-predictive');
assert.equal(grade.$id, 'td613.ash.grade-gate/v0.6');
assert.equal(grade.properties.claimCeiling.const, 'ash-grade-gate-context-record-not-third-party-enforcement');
assert.match(runtime, /lower_force_wins/);
assert.match(runtime, /identity_inference_allowed.*False/s);
assert.match(html, /HCC WHO Policy/);
assert.match(html, /Force Status/);

console.log('Ash HCC and Grade Gate contract: PASS');
