import assert from 'node:assert/strict';
import fs from 'node:fs';

const closeRepair = fs.readFileSync('app/dome-world/ash-case-close-repair.js', 'utf8');
const bridge = fs.readFileSync('app/dome-world/ash-workspace-bridge.js', 'utf8');

assert.match(closeRepair, /td613\.ash\.case-close-repair\/v1\.3-ingress-readiness-boundary/);
assert.match(closeRepair, /validThresholdReadiness/);
assert.match(closeRepair, /function clearAshSessionStorage\(\{ preserveReadiness = false \} = \{\}\)/);
assert.match(closeRepair, /if \(key === READINESS_KEY && keepReadiness\)/);
assert.match(closeRepair, /if \(!localStorage\.getItem\(POINTER_KEY\)\) exposeMembrane\(\{ preserveReadiness:true \}\);/);
assert.match(closeRepair, /async function closeToMembrane\(\)[\s\S]*?exposeMembrane\(\);/);
assert.doesNotMatch(closeRepair, /closeToMembrane\(\)[\s\S]*?preserveReadiness:true/);
assert.match(bridge, /ash-case-close-repair\.js\?v=20260719-ingress-readiness-boundary-v1/);

console.log('ash-keep-ingress-readiness-close-boundary.test.mjs passed');
