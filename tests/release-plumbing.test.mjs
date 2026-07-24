import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const workflowDir = '.github/workflows';
const retiredFlightDateWorkflow = path.join(workflowDir, 'apply-flight-date-refresh.yml');
const authorizedWriteWorkflows = new Set(['vercel-operator-release.yml']);
const forbiddenExecutablePatterns = [
  /^\s*git\s+push\b/im,
  /^\s*git\s+commit\b/im,
  /^ {2}contents:\s*write\s*$/m,
  /patch-td613-flight/i,
];

assert.equal(fs.existsSync(retiredFlightDateWorkflow), false);

const workflowNames = fs.readdirSync(workflowDir)
  .filter((name) => name.endsWith('.yml') || name.endsWith('.yaml'));
assert.deepEqual(workflowNames.sort(), ['td613-ci.yml', 'vercel-operator-release.yml']);

for (const fileName of workflowNames) {
  if (authorizedWriteWorkflows.has(fileName)) continue;
  const content = fs.readFileSync(path.join(workflowDir, fileName), 'utf8');
  for (const pattern of forbiddenExecutablePatterns) {
    assert.equal(pattern.test(content), false,
      `${fileName} contains forbidden executable release-plumbing pattern ${pattern}`);
  }
}

const release = fs.readFileSync(path.join(workflowDir, 'vercel-operator-release.yml'), 'utf8');
assert.match(release, /^\s{2}issue_comment:\s*$/m);
assert.doesNotMatch(release, /^\s{2}(push|pull_request|workflow_dispatch):\s*$/m);
assert.match(release, /github\.event\.issue\.number == 405/);
assert.match(release, /github\.event\.comment\.user\.login == github\.repository_owner/);
assert.match(release, /startsWith\(github\.event\.comment\.body, '\/td613-vercel-release '\)/);
assert.match(release, /^ {2}contents:\s*write\s*$/m);
assert.equal((release.match(/^\s*git push origin HEAD:main\s*$/gm) || []).length, 2);
assert.equal((release.match(/config\.git\.deploymentEnabled = true/g) || []).length, 1);
assert.equal((release.match(/deploymentEnabled: false/g) || []).length, 1);
assert.equal((release.match(/vercel@latest deploy/g) || []).length, 1);
assert.match(release, /Create one bounded Git-fallback release commit/);
assert.match(release, /Restore the Git deployment lock after fallback/);
assert.doesNotMatch(release, /patch-td613-flight/i);

assert.equal(fs.existsSync('.githooks/commit-msg'), true);
assert.equal(fs.existsSync('.githooks/pre-push'), true);

console.log('release-plumbing.test.mjs passed');
