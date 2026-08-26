import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const workflowDir = '.github/workflows';
const retiredFlightDateWorkflow = path.join(workflowDir, 'apply-flight-date-refresh.yml');
const authorizedWriteWorkflows = new Set([
  'vercel-operator-release.yml',
  'vercel-relock-safety.yml',
]);
const forbiddenExecutablePatterns = [
  /^\s*git\s+push\b/im,
  /^\s*git\s+commit\b/im,
  /^ {2}contents:\s*write\s*$/m,
  /patch-td613-flight/i,
];

assert.equal(
  fs.existsSync(retiredFlightDateWorkflow),
  false,
  `${retiredFlightDateWorkflow} was a one-shot self-modifying workflow and must remain retired`,
);

const workflowNames = fs.readdirSync(workflowDir)
  .filter((name) => name.endsWith('.yml') || name.endsWith('.yaml'));

for (const fileName of workflowNames) {
  if (authorizedWriteWorkflows.has(fileName)) continue;
  const filePath = path.join(workflowDir, fileName);
  const content = fs.readFileSync(filePath, 'utf8');
  for (const pattern of forbiddenExecutablePatterns) {
    assert.equal(
      pattern.test(content),
      false,
      `${filePath} contains forbidden executable release-plumbing pattern ${pattern}`,
    );
  }
}

function readAuthorized(name, expectedPushes) {
  const filePath = path.join(workflowDir, name);
  assert.equal(fs.existsSync(filePath), true, `bounded write conduit missing: ${name}`);
  const source = fs.readFileSync(filePath, 'utf8');
  assert.match(source, /^\s{2}issue_comment:\s*$/m);
  assert.doesNotMatch(source, /^\s{2}(push|pull_request|workflow_dispatch):\s*$/m);
  assert.match(source, /github\.event\.issue\.number == 405/);
  assert.match(source, /github\.event\.comment\.user\.login == github\.repository_owner/);
  assert.match(source, /startsWith\(github\.event\.comment\.body, '\/td613-vercel-release '\)/);
  assert.match(source, /^ {2}contents:\s*write\s*$/m);
  assert.equal((source.match(/^\s*git push origin HEAD:main\s*$/gm) || []).length, expectedPushes);
  assert.doesNotMatch(source, /patch-td613-flight/i);
  return source;
}

const release = readAuthorized('vercel-operator-release.yml', 2);
assert.match(release, /github\.event\.comment\.user\.login == 'chatgpt-codex-connector\[bot\]'/,
  'the installed chat relay may transport an operator-authorized #405 command');
assert.doesNotMatch(release, /endsWith\([^\n]*\[bot\]/,
  'release relay authority must never widen to arbitrary bot identities');
assert.doesNotMatch(release, /includes\([^\n]*bot/i,
  'release relay authority must remain an exact identity allowlist');
assert.match(release, /release_relay = \$\{\{ github\.event\.comment\.user\.login \}\}/,
  'accepted release receipts must identify which narrow relay transported the operator gesture');
assert.equal((release.match(/config\.git\.deploymentEnabled = true/g) || []).length, 1);
assert.equal((release.match(/deploymentEnabled: false/g) || []).length, 1);
assert.equal((release.match(/vercel@latest deploy/g) || []).length, 1);
assert.match(release, /Create one bounded Git-fallback release commit/);
assert.match(release, /Restore the Git deployment lock immediately after fallback admission/);

const releaseCommitIndex = release.indexOf('- name: Create one bounded Git-fallback release commit');
const immediateRelockIndex = release.indexOf('- name: Restore the Git deployment lock immediately after fallback admission');
const productionObservationIndex = release.indexOf('- name: Resolve deployed production URL');
assert.ok(releaseCommitIndex >= 0, 'fallback release admission step must exist');
assert.ok(immediateRelockIndex > releaseCommitIndex, 'fallback relock must immediately follow deployment admission');
assert.ok(productionObservationIndex > immediateRelockIndex, 'fallback gate must be closed before production observation begins');

const exactSourceProbe = fs.readFileSync('scripts/flowcore-release-content-probe.mjs', 'utf8');
assert.match(exactSourceProbe, /\/giving\/history\/release-source\.json/,
  'common exact-source proof must bind to the production release canary');
assert.match(exactSourceProbe, /TD613_SOURCE_RECEIPT_ATTEMPTS \|\| 288/,
  'release-canary readiness must tolerate bounded long Vercel Git ingestion delay');
assert.match(exactSourceProbe, /Authorized release-source receipt did not reach production/,
  'old production must not pass exact-source merely because unchanged runtime bytes match');
assert.match(exactSourceProbe, /const releaseSourceReceipt = await waitForAuthorizedSourceReceipt\(\);/,
  'release packet identity must settle before runtime byte parity is evaluated');
assert.match(exactSourceProbe, /release_source_receipt: releaseSourceReceipt/,
  'exact-source evidence must retain the release-canary receipt');

const relock = readAuthorized('vercel-relock-safety.yml', 1);
assert.equal((relock.match(/deploymentEnabled: false/g) || []).length, 1);
assert.doesNotMatch(relock, /vercel@latest deploy/);
assert.match(relock, /deployment_count = 0/);

const confirmationIndex = relock.indexOf('  confirm-production-practice:');
const zenodoSyncIndex = relock.indexOf('  src-zenodo-sync:');
assert.ok(confirmationIndex >= 0, 'zero-deploy production practice confirmation job must remain in the existing relock workflow');
assert.ok(zenodoSyncIndex > confirmationIndex, 'SRC Zenodo sync must remain a separately addressable job after production confirmation');
const confirmation = relock.slice(confirmationIndex, zenodoSyncIndex);
assert.match(confirmation, /startsWith\(github\.event\.comment\.body, '\/td613-vercel-confirm '\)/,
  'production confirmation requires its own exact #405 command');
assert.match(confirmation, /github\.event\.comment\.user\.login == 'chatgpt-codex-connector\[bot\]'/,
  'the narrow chat relay may transport the zero-deploy confirmation gesture');
assert.match(confirmation, /^\s{6}contents:\s*read\s*$/m,
  'confirmation job must downgrade repository permissions to read-only');
assert.match(confirmation, /deployment_ceiling = 0/);
assert.match(confirmation, /deployment_count = 0/);
assert.match(confirmation, /TD613_PRODUCTION_OBSERVATION: 'true'/);
assert.match(confirmation, /TD613_PRACTICE_OBSERVATION: 'true'/);
assert.match(confirmation, /Verify deployed source packet before browser observation/);
assert.match(confirmation, /Reconfirm deployed source packet after browser observation/);
assert.match(confirmation, /repository_write_authority = false/);
assert.doesNotMatch(confirmation, /vercel@latest deploy/,
  'zero-deploy confirmation may not contain a Vercel deployment command');
assert.doesNotMatch(confirmation, /^\s*git push\b/m,
  'zero-deploy confirmation may not push repository state');
assert.doesNotMatch(confirmation, /deploymentEnabled = true/,
  'zero-deploy confirmation may never open the Vercel Git gate');

const zenodoSync = relock.slice(zenodoSyncIndex);
assert.match(zenodoSync, /github\.event\.issue\.number == 758/,
  'SRC Zenodo synchronization requires the permanent #758 intake gate');
assert.match(zenodoSync, /github\.event\.comment\.user\.login == 'chatgpt-codex-connector\[bot\]'/,
  'only the exact installed chat relay may transport operator authority to #758');
assert.doesNotMatch(zenodoSync, /endsWith\([^\n]*\[bot\]/,
  'SRC sync relay authority must never widen to arbitrary bot identities');
assert.match(zenodoSync, /github\.event\.comment\.body == '\/src-zenodo-sync ATELIER'/,
  'SRC synchronization requires the exact one-run operator command');
assert.match(zenodoSync, /^\s{6}contents:\s*write\s*$/m,
  'the isolated SRC sync job requires bounded repository write permission');
assert.match(zenodoSync, /^\s{6}pull-requests:\s*read\s*$/m,
  'the SRC sync job may read PR #731 state before writing');
assert.match(zenodoSync, /ATELIER_PR: '731'/,
  'SRC synchronization must bind to the active Atelier PR');
assert.match(zenodoSync, /ATELIER_BRANCH: amari\/src-projective-routing-grammar/,
  'SRC synchronization must bind to the active Atelier branch');
assert.match(zenodoSync, /CREATOR_ORCID: 0009-0009-9348-3534/,
  'SRC synchronization must use the exact SignalRupture Zenodo creator ORCID');
assert.match(zenodoSync, /scripts\/src-zenodo-operator-sync\.py/,
  'SRC synchronization must invoke the bounded Atelier acquisition runner');
assert.match(zenodoSync, /SRC\/01-MANIFESTS\/live\//,
  'SRC synchronization writes live manifests only');
assert.match(zenodoSync, /SRC\/02-ORIGINALS\/live\//,
  'SRC synchronization writes live originals only');
assert.match(zenodoSync, /SRC\/03-DERIVATIVES\/text\/live\//,
  'SRC synchronization writes live text derivatives only');
assert.match(zenodoSync, /SRC\/04-RECEIPTS\/live\//,
  'SRC synchronization writes live receipts only');
assert.match(zenodoSync, /04-RECEIPTS\/phase2/,
  'SRC synchronization must freeze and re-check the sealed Phase-2 receipt tree');
assert.match(zenodoSync, /01-MANIFESTS\/phase2/,
  'SRC synchronization must freeze and re-check the sealed Phase-2 manifest tree');
assert.match(zenodoSync, /git push origin "HEAD:\$ATELIER_BRANCH"/,
  'SRC synchronization may push only its bounded packet back to the live Atelier branch');
assert.doesNotMatch(zenodoSync, /^\s*git push origin HEAD:main\s*$/m,
  'SRC synchronization has no main-branch write authority');
assert.doesNotMatch(zenodoSync, /vercel@latest deploy|deploymentEnabled = true/,
  'SRC synchronization has no Vercel deployment or unlock authority');
assert.match(zenodoSync, /Gate #\$GATE_ISSUE returns to \*\*DORMANT\*\*/,
  'one successful SRC synchronization must explicitly return the gate to dormancy');
assert.match(zenodoSync, /automatic_retry = not authorized/,
  'a held SRC synchronization creates no automatic retry authority');

assert.equal(fs.existsSync('.githooks/commit-msg'), true, 'commit-msg hook must exist in .githooks');
assert.equal(fs.existsSync('.githooks/pre-push'), true, 'pre-push hook must exist in .githooks');

console.log('release-plumbing.test.mjs passed with exact chat relay allowlisting, release-canary-bound exact source, immediate fallback relock, zero-deploy production confirmation, and operator-gated live SRC Zenodo intake');
