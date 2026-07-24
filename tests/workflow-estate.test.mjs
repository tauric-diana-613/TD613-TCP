import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const workflowDir = join(process.cwd(), '.github', 'workflows');
const workflows = readdirSync(workflowDir)
  .filter((name) => /\.ya?ml$/i.test(name))
  .sort();

const MAX_DURABLE_WORKFLOWS = 3;
assert.ok(
  workflows.length <= MAX_DURABLE_WORKFLOWS,
  `Workflow estate expanded to ${workflows.length}; durable ceiling is ${MAX_DURABLE_WORKFLOWS}. Live workflows: ${workflows.join(', ')}. Keep validation in the consolidated contract/browser runners or the bounded release membrane.`,
);

const required = [
  'td613-ci.yml',
  'vercel-operator-release.yml',
  'vercel-relock-safety.yml',
];
assert.deepEqual(workflows, required.slice().sort(), `Durable workflow estate must remain exactly the consolidated CI, operator release, and independent relock safety membrane. Live workflows: ${workflows.join(', ')}`);

const retired = [
  'pages.yml',
  'tcp-smoke.yml',
  'ash-flowcore-live-field.yml',
  'ash-keep-production-closure.yml',
  'ash-keep-aia3-production-observation.yml',
  'dome-world-phase4.yml',
  'vercel-deployment-law.yml',
];
for (const name of retired) {
  assert.ok(!workflows.includes(name), `Superseded standalone workflow returned: ${name}`);
}

const retiredPatterns = [
  /^flowcore-pedagogue-p\d+\.ya?ml$/,
  /^flowcore-p0-p(?:7-seam-closure|10-final-stitch)\.ya?ml$/,
  /^flowcore-(?:production-observation|runtime-evidence)\.ya?ml$/,
  /^hush-phase(?:9|10|11|12|13|14)\.ya?ml$/,
  /^ash-(?:legal-ux|research-ux|four-profile-pedagogy|investigation-guided-flight|user-test-flight|live-ingress-demos-cache|safe-harbor-ingress|custodian-return|destination-handoff|independent-provenance|aperture-composition-constitution)\.ya?ml$/,
  /^ash-keep-(?:aia2-usability|choir-test|delivery-boundary|hush-intervention|live-aia-browser|live-aia)\.ya?ml$/,
  /^ash-(?:lifecycle-integration|map-object-registry|stretch1-closure)\.ya?ml$/,
];
for (const name of workflows) {
  assert.ok(
    !retiredPatterns.some((pattern) => pattern.test(name)),
    `Retired micro-workflow returned: ${name}. Keep its witness in tests/scripts and route it through a durable shared workflow.`,
  );
}

const consolidated = readFileSync(join(workflowDir, 'td613-ci.yml'), 'utf8');
for (const token of [
  'name: TD613 Consolidated CI',
  'cancel-in-progress: true',
  'run-td613-consolidated-contracts.mjs',
  'run-td613-full-browser-closure.mjs',
  '/td613-full-browser-closure ',
  'git fetch origin "pull/${PR_NUMBER}/head',
  'playwright install --with-deps chromium firefox webkit',
  'TD613_BROWSERS: chromium,firefox,webkit',
]) assert.match(consolidated, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `Consolidated workflow omitted ${token}`);
assert.equal((consolidated.match(/npm ci/g) || []).length, 2, 'Consolidated workflow may install repository dependencies once for routine contracts and once for the explicitly commanded browser closure.');
assert.equal((consolidated.match(/playwright install/g) || []).length, 1, 'Browser runtime must be installed exactly once per commanded closure.');
assert.doesNotMatch(consolidated, /^\s{2}push:\s*$/m, 'Routine validation must not rerun automatically after an already-green squash merge or release-only relock commit.');

const release = readFileSync(join(workflowDir, 'vercel-operator-release.yml'), 'utf8');
assert.match(release, /group: td613-vercel-production-release/);
assert.match(release, /cancel-in-progress: false/);
assert.match(release, /deployment_count = 1/);

const relock = readFileSync(join(workflowDir, 'vercel-relock-safety.yml'), 'utf8');
assert.match(relock, /group: td613-vercel-production-release/);
assert.match(relock, /deployment_count = 0/);
assert.doesNotMatch(relock, /vercel@latest deploy|deploymentEnabled = true/);

console.log(`Workflow estate consolidated: ${workflows.length}/${MAX_DURABLE_WORKFLOWS}`);
