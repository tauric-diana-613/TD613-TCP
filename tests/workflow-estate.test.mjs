import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const workflowDir = join(process.cwd(), '.github', 'workflows');
const workflows = readdirSync(workflowDir)
  .filter((name) => /\.ya?ml$/i.test(name))
  .sort();

const MAX_DURABLE_WORKFLOWS = 12;
assert.ok(
  workflows.length <= MAX_DURABLE_WORKFLOWS,
  `Workflow estate expanded to ${workflows.length}; durable ceiling is ${MAX_DURABLE_WORKFLOWS}. Move stage checks into tests, scripts, or jobs inside an existing workflow.`,
);

const required = [
  'pages.yml',
  'tcp-smoke.yml',
  'td613-ci.yml',
  'ash-flowcore-live-field.yml',
  'ash-keep-production-closure.yml',
  'ash-keep-aia3-production-observation.yml',
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
  /^hush-phase(?:9|10|11|12|13|14)\.ya?ml$/,
  /^ash-(?:legal-ux|research-ux|four-profile-pedagogy|investigation-guided-flight|user-test-flight|live-ingress-demos-cache|safe-harbor-ingress|custodian-return|destination-handoff|independent-provenance|aperture-composition-constitution)\.ya?ml$/,
  /^ash-keep-(?:aia2-usability|choir-test|delivery-boundary|hush-intervention|live-aia-browser|live-aia)\.ya?ml$/,
  /^ash-(?:lifecycle-integration|map-object-registry|stretch1-closure)\.ya?ml$/,
];

for (const name of workflows) {
  assert.ok(
    !retiredPatterns.some((pattern) => pattern.test(name)),
    `Retired micro-workflow returned: ${name}. Keep its witness in tests/scripts and route it through td613-ci.yml.`,
  );
}

const consolidated = readFileSync(join(workflowDir, 'td613-ci.yml'), 'utf8');
assert.match(consolidated, /concurrency:/, 'td613-ci.yml must cancel superseded runs');
assert.match(consolidated, /cancel-in-progress:\s*true/, 'td613-ci.yml must cancel superseded runs');

console.log(`Workflow estate bounded: ${workflows.length}/${MAX_DURABLE_WORKFLOWS}`);
