import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const workflowDir = join(process.cwd(), '.github', 'workflows');
const workflows = readdirSync(workflowDir)
  .filter((name) => /\.ya?ml$/i.test(name))
  .sort();

const required = [
  'pages.yml',
  'td613-ci.yml',
  'vercel-operator-release.yml',
  'vercel-relock-safety.yml',
].sort();

assert.deepEqual(
  workflows,
  required,
  `Workflow estate must remain exactly four durable authority surfaces. Found: ${workflows.join(', ')}`,
);

const retired = [
  'calibration.yml',
  'tcp-smoke.yml',
  'ash-flowcore-live-field.yml',
  'ash-keep-production-closure.yml',
  'ash-keep-aia3-production-observation.yml',
  'dome-world-phase4.yml',
  'vercel-deployment-law.yml',
];
for (const name of retired) {
  assert.ok(!workflows.includes(name), `Superseded workflow returned: ${name}`);
}

const consolidated = readFileSync(join(workflowDir, 'td613-ci.yml'), 'utf8');
assert.match(consolidated, /name:\s*TD613 Consolidated Validation/);
assert.match(consolidated, /cancel-in-progress:\s*true/);
assert.match(consolidated, /types:\s*\[opened, synchronize, reopened, ready_for_review\]/);
assert.match(consolidated, /One exact-head Chromium Firefox WebKit witness/);
assert.match(consolidated, /github\.event_name == 'workflow_dispatch' && inputs\.mode == 'full-browser'/);
assert.match(consolidated, /github\.event_name == 'pull_request' && github\.event\.action == 'ready_for_review'/);
assert.match(consolidated, /playwright install --with-deps chromium firefox webkit/);
assert.match(consolidated, /Explicit self-hosted calibration/);
assert.match(consolidated, /Explicit full-repository validation/);
assert.doesNotMatch(consolidated, /github\.event\.action == 'synchronize'[\s\S]*playwright install/, 'Ordinary PR synchronization must not authorize browsers.');
assert.doesNotMatch(consolidated, /strategy:\s*[\s\S]*matrix:\s*[\s\S]*browser:/, 'Browser engines must share one installation and one bounded job.');

for (const token of [
  'Aggregate changed-risk A8 witness across every engine',
  'set +e',
  'artifacts/ash-risk-preflight/failures.tsv',
  "for browser in chromium firefox webkit",
  "TD613_ASH_STAGES='A8'",
  'td613.ash.changed-risk-preflight/v0.1',
  "engines:['chromium','firefox','webkit']",
  "viewports:['desktop','mobile-reduced']",
  'fail_fast:false',
  'all_engines_observed:true',
  'artifacts/ash-risk-preflight/manifest.json'
]) assert.ok(consolidated.includes(token), `Consolidated changed-risk preflight omitted ${token}`);
assert.match(consolidated, /Aggregate changed-risk A8 witness across every engine[\s\S]*Run the complete Ash witness through each installed engine/, 'Changed-risk preflight must resolve before the expensive full estate.');
assert.equal((consolidated.match(/Aggregate changed-risk A8 witness across every engine/g) || []).length, 1, 'Risk preflight must have one owner.');
assert.equal((consolidated.match(/One exact-head Chromium Firefox WebKit witness/g) || []).length, 1, 'Browser estate must remain one bounded owner.');

const pages = readFileSync(join(workflowDir, 'pages.yml'), 'utf8');
assert.match(pages, /workflow_dispatch:/);
assert.doesNotMatch(pages, /pull_request:/, 'GitHub Pages must not duplicate PR validation.');
assert.doesNotMatch(pages, /push:\s*[\s\S]*branches:\s*\[\s*main\s*\]/, 'GitHub Pages must remain explicitly dispatched.');

const release = readFileSync(join(workflowDir, 'vercel-operator-release.yml'), 'utf8');
const relock = readFileSync(join(workflowDir, 'vercel-relock-safety.yml'), 'utf8');
assert.match(release, /deployment_ceiling = 1/);
assert.match(relock, /deployment_count = 0/);

console.log('Workflow estate closed at 4/4 durable workflows with one aggregate changed-risk preflight inside the consolidated browser owner.');