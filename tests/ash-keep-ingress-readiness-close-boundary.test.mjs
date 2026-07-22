import assert from 'node:assert/strict';
import fs from 'node:fs';

const closeRepair = fs.readFileSync('app/dome-world/ash-case-close-repair.js', 'utf8');
const sessionBoundary = fs.readFileSync('app/dome-world/ash-session-boundary.js', 'utf8');
const bridge = fs.readFileSync('app/dome-world/ash-workspace-bridge.js', 'utf8');

assert.match(closeRepair, /td613\.ash\.case-close-repair\/v1\.3-ingress-readiness-boundary/);
assert.match(closeRepair, /validThresholdReadiness/);
assert.match(closeRepair, /function clearAshSessionStorage\(\{ preserveReadiness = false \} = \{\}\)/);
assert.match(closeRepair, /if \(key === READINESS_KEY && keepReadiness\)/);
assert.match(closeRepair, /if \(!localStorage\.getItem\(POINTER_KEY\)\) exposeMembrane\(\{ preserveReadiness:true \}\);/);
assert.match(closeRepair, /async function closeToMembrane\(\)[\s\S]*?exposeMembrane\(\);/);
assert.doesNotMatch(closeRepair, /closeToMembrane\(\)[\s\S]*?preserveReadiness:true/);
assert.match(bridge, /ash-case-close-repair\.js\?v=20260721-legal-demo-ux-v1/);
assert.match(bridge, /ash-session-boundary\.js\?v=20260721-flowcore-live-field-v1/);

assert.match(sessionBoundary, /v0\.3-pointer-governs-case-explicit-recovery-stays-open/);
assert.match(sessionBoundary, /POINTER_KEY = 'td613\.ash-keep\.current-case'/);
assert.match(sessionBoundary, /if \(!activePointer\) return closedCurrent\(\)/);
assert.match(sessionBoundary, /case_id:null/);
assert.match(sessionBoundary, /function capsuleRecoveryOpen\(\)/);
assert.match(sessionBoundary, /workspace\?\.classList\.contains\('active'\)/);
assert.match(sessionBoundary, /Boolean\(file\?\.files\?\.length\)/);
assert.match(sessionBoundary, /visible\(returnBar\)/);
assert.match(sessionBoundary, /const interactive = caseOpen \|\| recoveryOpen/);
assert.match(sessionBoundary, /RECOVERY_FILE_CHANGED/);
assert.match(sessionBoundary, /CAPSULE_OPENED_SETTLED/);
assert.match(sessionBoundary, /host\.__td613AshKeep = facade/);
assert.match(sessionBoundary, /td613:ash:case-closed/);
assert.match(sessionBoundary, /launch\?\.classList\.remove\('hidden'\)/);
assert.match(sessionBoundary, /main\.setAttribute\('inert',''\)/);
assert.doesNotMatch(sessionBoundary, /deleteDatabase|objectStore\([^)]*\)\.delete/);

console.log('ash-keep-ingress-readiness-close-boundary.test.mjs passed');
