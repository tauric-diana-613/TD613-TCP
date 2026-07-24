import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const workflowDir = join(process.cwd(), '.github', 'workflows');
const workflows = readdirSync(workflowDir)
  .filter((name) => /\.ya?ml$/i.test(name))
  .sort();

const MAX_DURABLE_WORKFLOWS = 8;
assert.ok(
  workflows.length <= MAX_DURABLE_WORKFLOWS,
  `Workflow estate expanded to ${workflows.length}; durable ceiling is ${MAX_DURABLE_WORKFLOWS}. Move stage checks into tests, scripts, or jobs inside an existing workflow.`,
);

const required = [
  'pages.yml',
  'tcp-smoke.yml',
  'td613-ci.yml',
  'ash-flowcore-live-field.yml',
  'dome-world-phase4.yml',
  'vercel-deployment-law.yml',
  'vercel-operator-release.yml',
  'vercel-relock-safety.yml',
];

for (const name of required) {
  assert.ok(workflows.includes(name), `Required durable workflow missing: ${name}`);
}

const retiredPatterns = [
  /^flowcore-pedagogue-p\d+\.ya?ml$/,
  /^flowcore-p0-p(?:7-seam-closure|10-final-stitch)\.ya?ml$/,
  /^flowcore-(?:production-observation|runtime-evidence)\.ya?ml$/,
  /^hush-phase(?:9|10|11|12|13|14)\.ya?ml$/,
  /^ash-(?:legal-ux|research-ux|four-profile-pedagogy|investigation-guided-flight|user-test-flight|live-ingress-demos-cache|safe-harbor-ingress|custodian-return|destination-handoff|independent-provenance|aperture-composition-constitution)\.ya?ml$/,
  /^ash-keep-(?:aia2-usability|choir-test|delivery-boundary|hush-intervention|live-aia-browser|live-aia|production-closure|aia3-production-observation)\.ya?ml$/,
  /^ash-(?:lifecycle-integration|map-object-registry|stretch1-closure)\.ya?ml$/,
];

for (const name of workflows) {
  assert.ok(
    !retiredPatterns.some((pattern) => pattern.test(name)),
    `Retired micro-workflow returned: ${name}. Keep its witness in tests/scripts and route it through a durable shared workflow.`,
  );
}

const core = readFileSync(join(workflowDir, 'td613-ci.yml'), 'utf8');
assert.match(core, /concurrency:/, 'td613-ci.yml must cancel superseded runs');
assert.match(core, /cancel-in-progress:\s*true/, 'td613-ci.yml must cancel superseded runs');

const ash = readFileSync(join(workflowDir, 'ash-flowcore-live-field.yml'), 'utf8');
assert.match(ash, /name: Ash Flow-Core Live Field/);
assert.match(ash, /issue_comment:/, 'The single Ash workflow must retain exact-source production observation.');
assert.match(ash, /Run Chromium, Firefox, and WebKit sequentially on one runner/);
assert.match(ash, /for browser in chromium firefox webkit/);
assert.doesNotMatch(ash, /strategy:\s*[\s\S]*matrix:/, 'Ash browser witnesses must not reinstall in three parallel matrix jobs.');
assert.match(ash, /run-ash-keep-a1-production-probe\.mjs/);
assert.match(ash, /run-ash-constitutional-convergence-handshake\.mjs/);
assert.match(ash, /ash-keep-aia3-task-journey-v3\.mjs/);
assert.match(ash, /ash-lifecycle-production-probe\.mjs/);
assert.match(ash, /cancel-in-progress:\s*\$\{\{ github\.event_name != 'issue_comment' \}\}/);
assert.equal((ash.match(/npm ci/g) || []).length, 2, 'One PR install and one explicit production-observer install are the durable ceiling.');

console.log(`Workflow estate bounded: ${workflows.length}/${MAX_DURABLE_WORKFLOWS}`);
