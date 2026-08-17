import assert from 'node:assert/strict';
import fs from 'node:fs';

const flowcoreProbe = fs.readFileSync('scripts/flowcore-release-content-probe.mjs', 'utf8');
const givingReadiness = fs.readFileSync('scripts/giving-production-readiness.mjs', 'utf8');

assert.match(flowcoreProbe, /vercelConfig\.git\?\.deploymentEnabled !== true/);
assert.match(flowcoreProbe, /execFileSync\('git', \['rev-parse', 'HEAD'\]/);
assert.match(flowcoreProbe, /commits\/\$\{releaseSha\}\/status/);
assert.match(flowcoreProbe, /item\?\.context === 'Vercel'/);
assert.match(flowcoreProbe, /lastState === 'SUCCESS'/);
assert.match(flowcoreProbe, /lastState === 'FAILURE' \|\| lastState === 'ERROR'/);
assert.match(flowcoreProbe, /Vercel deployment for \$\{releaseSha\} did not settle before observation/);
assert.match(flowcoreProbe, /vercel-git-settlement\.json/);
assert.match(flowcoreProbe, /const vercelGitSettlement = await waitForGitFallbackSettlement\(\);/);
const settlementIndex = flowcoreProbe.indexOf('const vercelGitSettlement = await waitForGitFallbackSettlement();');
const closureIndex = flowcoreProbe.indexOf('const closure = await discoverRuntimeClosure();');
assert.ok(settlementIndex >= 0 && closureIndex > settlementIndex, 'Vercel settlement must precede production byte discovery/observation');

assert.match(givingReadiness, /waitForGivingReleaseContent/);
assert.match(givingReadiness, /verifyExactContent = process\.env\.TD613_PRODUCTION_OBSERVATION === 'true'/);
assert.match(givingReadiness, /exactContentObservation = await waitForGivingReleaseContent/);
assert.match(givingReadiness, /practice_critical_surface_exact_source/);
const exactContentIndex = givingReadiness.indexOf('exactContentObservation = await waitForGivingReleaseContent');
const receiptLoopIndex = givingReadiness.indexOf('for (let attempt = 1; attempt <= boundedAttempts; attempt += 1)');
assert.ok(exactContentIndex >= 0 && receiptLoopIndex > exactContentIndex, 'Giving exact-source closure must precede readiness receipt/HTML observation');

console.log('giving-vercel-settlement.test.mjs passed: exact Vercel release SHA settles before source and practice observation');
