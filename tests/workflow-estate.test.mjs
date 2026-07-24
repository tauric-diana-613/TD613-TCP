import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const workflowDir = join(process.cwd(), '.github', 'workflows');
const workflows = readdirSync(workflowDir)
  .filter((name) => /\.ya?ml$/i.test(name))
  .sort();

const REQUIRED = ['td613-ci.yml', 'vercel-operator-release.yml'];
assert.deepEqual(
  workflows,
  REQUIRED,
  `Workflow estate must remain exactly two durable conduits: ${REQUIRED.join(', ')}. Found: ${workflows.join(', ')}`,
);

const ci = readFileSync(join(workflowDir, 'td613-ci.yml'), 'utf8');
const operations = readFileSync(join(workflowDir, 'vercel-operator-release.yml'), 'utf8');

assert.match(ci, /^\s{2}pull_request:\s*$/m);
assert.match(ci, /^\s{2}push:\s*$/m);
assert.match(ci, /^\s{2}workflow_dispatch:\s*$/m);
assert.match(ci, /cancel-in-progress:\s*true/);
assert.match(ci, /Enforce two-workflow estate/);
assert.match(ci, /Ash local closure and browser field/);
assert.match(ci, /Phase IV local integration/);
assert.match(ci, /Run tiered cross-browser field/);
assert.match(ci, /one shared browser runtime/i);

assert.match(operations, /^\s{2}issue_comment:\s*$/m);
assert.doesNotMatch(operations, /^\s{2}(push|pull_request|workflow_dispatch):\s*$/m);
assert.match(operations, /td613-vercel-production-release/);
assert.match(operations, /Restore the Git deployment lock after fallback/);

const retired = [
  'pages.yml',
  'tcp-smoke.yml',
  'vercel-relock-safety.yml',
  'ash-keep-aia3-production-observation.yml',
  'ash-flowcore-live-field.yml',
  'vercel-deployment-law.yml',
  'calibration.yml',
  'dome-world-phase4.yml',
  'ash-keep-production-closure.yml',
];
for (const name of retired) {
  assert.equal(workflows.includes(name), false, `Superseded workflow returned: ${name}`);
}

console.log('Workflow estate bounded: 2/2');
