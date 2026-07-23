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
assert.equal((release.match(/config\.git\.deploymentEnabled = true/g) || []).length, 1);
assert.equal((release.match(/deploymentEnabled: false/g) || []).length, 1);
assert.equal((release.match(/vercel@latest deploy/g) || []).length, 1);
assert.match(release, /Create one bounded Git-fallback release commit/);
assert.match(release, /Restore the Git deployment lock after fallback/);

const relock = readAuthorized('vercel-relock-safety.yml', 1);
assert.equal((relock.match(/deploymentEnabled: false/g) || []).length, 1);
assert.doesNotMatch(relock, /vercel@latest deploy/);
assert.match(relock, /deployment_count = 0/);

assert.equal(fs.existsSync('.githooks/commit-msg'), true, 'commit-msg hook must exist in .githooks');
assert.equal(fs.existsSync('.githooks/pre-push'), true, 'pre-push hook must exist in .githooks');

console.log('release-plumbing.test.mjs passed');
