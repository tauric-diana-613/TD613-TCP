import assert from 'assert';
import fs from 'fs';
import path from 'path';

const workflowDir = '.github/workflows';
const retiredFlightDateWorkflow = path.join(workflowDir, 'apply-flight-date-refresh.yml');
const forbiddenPatterns = [
  /\bgit\s+push\b/i,
  /\bgit\s+commit\b/i,
  /^\s*contents:\s*write\s*$/im,
  /patch-td613-flight/i
];

assert(
  !fs.existsSync(retiredFlightDateWorkflow),
  `${retiredFlightDateWorkflow} was a one-shot self-modifying workflow and must remain retired`
);

for (const fileName of fs.readdirSync(workflowDir).filter((name) => name.endsWith('.yml') || name.endsWith('.yaml'))) {
  const filePath = path.join(workflowDir, fileName);
  const content = fs.readFileSync(filePath, 'utf8');
  for (const pattern of forbiddenPatterns) {
    assert(
      !pattern.test(content),
      `${filePath} contains forbidden release-plumbing pattern ${pattern}`
    );
  }
}

assert(fs.existsSync('.githooks/commit-msg'), 'commit-msg hook must exist in .githooks');
assert(fs.existsSync('.githooks/pre-push'), 'pre-push hook must exist in .githooks');

console.log('release-plumbing.test.mjs passed');
