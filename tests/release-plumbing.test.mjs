import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const workflowDir = '.github/workflows';
const retiredFlightDateWorkflow = path.join(workflowDir, 'apply-flight-date-refresh.yml');
const authorizedWriteWorkflow = 'vercel-operator-release.yml';
const forbiddenPatterns = [
  /\bgit\s+push\b/i,
  /\bgit\s+commit\b/i,
  /^\s*contents:\s*write\s*$/im,
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
  if (fileName === authorizedWriteWorkflow) continue;
  const filePath = path.join(workflowDir, fileName);
  const content = fs.readFileSync(filePath, 'utf8');
  for (const pattern of forbiddenPatterns) {
    assert.equal(
      pattern.test(content),
      false,
      `${filePath} contains forbidden release-plumbing pattern ${pattern}`,
    );
  }
}

const releasePath = path.join(workflowDir, authorizedWriteWorkflow);
assert.equal(fs.existsSync(releasePath), true, 'bounded Vercel release conduit must remain present');
const release = fs.readFileSync(releasePath, 'utf8');
assert.match(release, /^\s{2}issue_comment:\s*$/m);
assert.doesNotMatch(release, /^\s{2}(push|pull_request|workflow_dispatch):\s*$/m);
assert.match(release, /github\.event\.issue\.number == 405/);
assert.match(release, /github\.event\.comment\.user\.login == github\.repository_owner/);
assert.match(release, /startsWith\(github\.event\.comment\.body, '\/td613-vercel-release '\)/);
assert.match(release, /^\s{2}contents:\s*write\s*$/m);
assert.equal((release.match(/git push origin HEAD:main/g) || []).length, 1);
assert.equal((release.match(/config\.git\.deploymentEnabled = true/g) || []).length, 1);
assert.equal((release.match(/deploymentEnabled: false/g) || []).length, 1);
assert.doesNotMatch(release, /patch-td613-flight/i);

assert.equal(fs.existsSync('.githooks/commit-msg'), true, 'commit-msg hook must exist in .githooks');
assert.equal(fs.existsSync('.githooks/pre-push'), true, 'pre-push hook must exist in .githooks');

console.log('release-plumbing.test.mjs passed');
