import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), 'utf8');
const hcc = JSON.parse(read('app/dome-world/schemas/ash-hcc.schema.json'));
const grade = JSON.parse(read('app/dome-world/schemas/ash-grade-gate.schema.json'));
const runtime = read('packages/dome_world_exact/ash_v06.py');
const api = read('api/dome-world-engine.py');

assert.equal(hcc.$id, 'td613.hcc.adapter/v0.6');
assert.equal(hcc.properties.identity_inference_allowed.const, false);
assert.equal(hcc.properties.how_policy.const, 'non-diagnostic');
assert.equal(hcc.properties.why_policy.const, 'non-predictive');
assert.equal(grade.$id, 'td613.ash.grade-gate/v0.6');
assert.equal(grade.properties.claimCeiling.const, 'ash-grade-gate-context-record-not-third-party-enforcement');
assert.match(runtime, /lower_force_wins/);
assert.match(runtime, /FORCE_ORDER = \["FORCED", "FORCED_IN_CONTEXT", "FORCED_UNDER_CONSTRAINT", "CONSTRUCTION", "SELECTED", "OPEN"\]/);
assert.match(runtime, /identity_inference_allowed.*False/s);
assert.match(api, /"ash-hcc-adapter"/);
assert.match(api, /"ash-grade-gate"/);

const precedence = spawnSync('python3', ['-c', `
from packages.dome_world_exact.ash_v06 import ash_grade_gate
out = ash_grade_gate({'statuses': ['OPEN', 'FORCED_UNDER_CONSTRAINT', 'SELECTED']}, {})
assert out['force_status'] == 'FORCED_UNDER_CONSTRAINT', out
forced = ash_grade_gate({'statuses': ['OPEN', 'FORCED']}, {})
assert forced['force_status'] == 'FORCED', forced
`], { cwd: root, encoding: 'utf8' });
assert.equal(precedence.status, 0, precedence.stderr || precedence.stdout);

console.log('Ash HCC and Grade Gate contract: PASS');
