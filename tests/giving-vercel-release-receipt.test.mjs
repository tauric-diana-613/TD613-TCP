import assert from 'node:assert/strict';
import fs from 'node:fs';

const workflow = fs.readFileSync('.github/workflows/vercel-operator-release.yml', 'utf8');

const acquireIndex = workflow.indexOf('- name: Await exact-source receipt before stability window');
const exactIndex = workflow.indexOf('- name: Verify deployed bytes match the authorized source packet');
const stabilityIndex = workflow.indexOf('- name: Hold authorized source stable against stale queued rollbacks');

assert.ok(acquireIndex >= 0, 'release gate must explicitly acquire the exact-source receipt');
assert.ok(exactIndex > acquireIndex, 'application-byte verification must wait until the exact-source receipt proves the deployment arrived');
assert.ok(stabilityIndex > exactIndex, 'stale-queue stability must begin only after receipt acquisition and exact-byte verification');

assert.match(workflow, /TD613_RECEIPT_ACQUIRE_ATTEMPTS: \$\{\{ steps\.mode\.outputs\.mode == 'git-fallback' && '72' \|\| '24' \}\}/);
assert.match(workflow, /TD613_RECEIPT_ACQUIRE_DELAY_MS: '5000'/);
assert.match(workflow, /Receipt acquisition pending/);
assert.match(workflow, /Authorized source receipt never arrived/);
assert.match(workflow, /\[404, 408, 425, 429\]\.includes\(response\.status\) \|\| response\.status >= 500/);
assert.match(workflow, /observed !== expected[\s\S]*Receipt acquisition pending/, 'a stale pre-acquisition receipt must remain pending rather than falsely proving settlement');
assert.match(workflow, /Stale queued deployment displaced authorized source/, 'once acquired, any source displacement must remain fatal');

console.log('giving-vercel-release-receipt.test.mjs passed for acquire-before-stabilize release observation');
