import assert from 'node:assert/strict';
import fs from 'node:fs';

const flowcoreProbe = fs.readFileSync('scripts/flowcore-release-content-probe.mjs', 'utf8');
const givingReadiness = fs.readFileSync('scripts/giving-production-readiness.mjs', 'utf8');

assert.match(flowcoreProbe, /vercelConfig\.git\?\.deploymentEnabled !== true/);
assert.match(flowcoreProbe, /execFileSync\('git', \['rev-parse', 'HEAD'\]/);
assert.match(flowcoreProbe, /commits\/\$\{releaseSha\}\/status/);
assert.match(flowcoreProbe, /item\?\.context === 'Vercel'/);
assert.match(flowcoreProbe, /TD613_VERCEL_SETTLEMENT_REQUEST_TIMEOUT_MS/);
assert.match(flowcoreProbe, /AbortSignal\.timeout\(settlementRequestTimeoutMs\)/);
assert.match(flowcoreProbe, /isRetryableSettlementLookupStatus/);
assert.match(flowcoreProbe, /status === 408 \|\| status === 425 \|\| status === 429 \|\| \(status >= 500 && status <= 599\)/);
assert.match(flowcoreProbe, /transientLookupFailures \+= 1/);
assert.match(flowcoreProbe, /lastLookupIssue = `HTTP \$\{response\.status\}`/);
assert.match(flowcoreProbe, /Vercel settlement status lookup returned non-retryable \$\{response\.status\}/);
assert.match(flowcoreProbe, /lastState === 'SUCCESS'/);
assert.match(flowcoreProbe, /lastState === 'FAILURE' \|\| lastState === 'ERROR'/);
assert.match(flowcoreProbe, /transient_lookup_failures: transientLookupFailures/);
assert.match(flowcoreProbe, /did not settle before observation; last state \$\{lastState\}\$\{lookupDetail\}/);
assert.match(flowcoreProbe, /vercel-git-settlement\.json/);
assert.match(flowcoreProbe, /const vercelGitSettlement = await waitForGitFallbackSettlement\(\);/);
assert.doesNotMatch(flowcoreProbe, /if \(!response\.ok\) throw new Error\(`Vercel settlement status lookup returned/);
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

console.log('giving-vercel-settlement.test.mjs passed: exact Vercel release SHA settlement retries bounded transport/status failures before source and practice observation');
