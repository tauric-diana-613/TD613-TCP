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
assert.match(consolidated, /Full-product exact-head Chromium Firefox WebKit witness/);
assert.match(consolidated, /Giving\/practice exact-head Chromium Firefox WebKit witness/);
assert.match(consolidated, /Classify exact-head browser witness scope/);
assert.match(consolidated, /practice_fixture_changed:\s*\$\{\{ steps\.classify\.outputs\.practice_fixture_changed \}\}/);
assert.match(consolidated, /contracts:\n\s+name: Static, constitutional, and release contracts\n\s+needs: scope/);
assert.match(consolidated, /github\.event_name == 'workflow_dispatch' && inputs\.mode == 'full-browser'/);
assert.match(consolidated, /github\.event_name == 'pull_request' && github\.event\.action == 'ready_for_review'/);
assert.match(consolidated, /Explicit self-hosted calibration/);
assert.match(consolidated, /Explicit full-repository validation/);

const shardGate = consolidated.match(/  ash_browser_shard:[\s\S]*?    runs-on:/)?.[0] || '';
const convergenceGate = consolidated.match(/  ash_browser:[\s\S]*?    runs-on:/)?.[0] || '';
const givingBrowserGate = consolidated.match(/  giving_browser:[\s\S]*?    runs-on:/)?.[0] || '';
assert.match(shardGate, /needs: scope/, 'Front-line browser shards must depend only on scope so empirical witnessing starts at the front of the run.');
assert.doesNotMatch(shardGate, /needs:\s*\[[^\]]*contracts/, 'Front-line browser shards must not wait behind static contracts.');
assert.doesNotMatch(shardGate, /synchronize/, 'Ordinary PR synchronization must not authorize the full-product browser shards.');
assert.doesNotMatch(convergenceGate, /synchronize/, 'Ordinary PR synchronization must not authorize full-product convergence.');
assert.doesNotMatch(givingBrowserGate, /synchronize/, 'Ordinary PR synchronization must not authorize the Giving/practice browser witness.');
assert.match(givingBrowserGate, /needs: scope/, 'The long Giving/practice browser witness must start directly after scope classification.');
assert.doesNotMatch(givingBrowserGate, /needs:\s*\[[^\]]*contracts/, 'The long Giving/practice browser witness must not wait behind static contracts.');
assert.match(convergenceGate, /needs: \[contracts, scope, ash_browser_shard\]/, 'The canonical owner must converge static contracts with the front-line browser shards.');
assert.match(convergenceGate, /needs\.contracts\.result == 'success'/, 'Convergence must not spend another Chromium install after static contracts fail.');
assert.match(convergenceGate, /needs\.ash_browser_shard\.result == 'success'/, 'Convergence must not run after any front-line browser shard fails or is cancelled.');

// Causal validation scope law:
// - practice-only architecture receives the complete static estate but does not re-litigate live Ash browsers;
// - full-product diffs retain the Ash browser shards;
// - Giving and practice diffs receive the real three-engine Giving witness;
// - a mixed full+practice diff preserves the originating Giving practice witness inside convergence.
assert.match(shardGate, /needs\.scope\.outputs\.validation_scope == 'full'/, 'Only full-product diffs may authorize live Ash front-line browser shards.');
assert.match(convergenceGate, /needs\.scope\.outputs\.validation_scope == 'full'/, 'Only full-product diffs may authorize live Ash convergence.');
assert.match(givingBrowserGate, /needs\.scope\.outputs\.validation_scope == 'giving'/);
assert.match(givingBrowserGate, /needs\.scope\.outputs\.validation_scope == 'practice'/);
assert.match(consolidated, /Witness originating Giving practice fixture with Chromium\n\s+if: needs\.scope\.outputs\.practice_fixture_changed == 'true'/, 'Mixed full+practice work must retain the originating proving fixture before convergence seals.');
assert.match(consolidated, /Stop Giving practice runtime\n\s+if: always\(\) && needs\.scope\.outputs\.practice_fixture_changed == 'true'/);

for (const token of [
  'strategy:',
  'fail-fast: false',
  'max-parallel: 3',
  'browser: [chromium, firefox, webkit]',
  'timeout-minutes: 35',
  'Install one browser engine for this shard',
  'Start isolated core extended and Flow-Core runtimes',
  'Run front-line A8 A12 and lifecycle preflight for this engine',
  "TD613_ASH_STAGES='A8'",
  "TD613_A12_ENTRY_PREFLIGHT='true'",
  "scope:['A8','A12_ENTRY','LIFECYCLE']",
  'fail_fast:false',
  'per_engine_observed:true',
  'Run core extended and Flow-Core lanes in parallel',
  'lane_parallelism:true',
  "TD613_ASH_STAGES='A7,A8,A9,A10,A11'",
  'td613-browser-shard-${{ matrix.browser }}',
  'Collect surviving browser evidence shards',
  'Enforce front-line shard convergence',
]) assert.ok(consolidated.includes(token), `Front-line browser topology omitted ${token}`);

assert.match(
  consolidated,
  /ash_browser_shard:[\s\S]*?needs: scope[\s\S]*?Run core extended and Flow-Core lanes in parallel[\s\S]*?Calibrate A15-R0 and transition ordering for this engine[\s\S]*?Run front-line A8 A12 and lifecycle preflight for this engine/,
  'The expensive per-engine witness lanes must run before calibration and preflight so long failures surface at the front of the critical path.',
);
assert.equal((consolidated.match(/Full-product exact-head Chromium Firefox WebKit witness/g) || []).length, 1, 'Full-product browser estate must retain one canonical convergence owner.');
assert.equal((consolidated.match(/Giving\/practice exact-head Chromium Firefox WebKit witness/g) || []).length, 1, 'Giving/practice browser estate must remain one bounded owner.');
assert.equal((consolidated.match(/Front-line exact-head browser shard/g) || []).length, 1, 'One matrix definition must own the front-line browser shard family.');

// Static/constitutional coverage remains intentionally wider than browser scope:
// practice architecture is shared architecture, therefore these checks still run for practice.
for (const stepName of ['Validate Dome-World static surfaces', 'Validate Phase IV static surfaces', 'Validate Ash core and ingress surfaces', 'Validate Ash A9 Work', 'Validate Flow-Core P0-P10 completion']) {
  assert.match(consolidated, new RegExp(`${stepName.replaceAll('-', '\\-')}\\n\\s+if: needs\\.scope\\.outputs\\.validation_scope != 'giving'`));
}

const pages = readFileSync(join(workflowDir, 'pages.yml'), 'utf8');
assert.match(pages, /workflow_dispatch:/);
assert.doesNotMatch(pages, /pull_request:/, 'GitHub Pages must not duplicate PR validation.');
assert.doesNotMatch(pages, /push:\s*[\s\S]*branches:\s*\[\s*main\s*\]/, 'GitHub Pages must remain explicitly dispatched.');

const release = readFileSync(join(workflowDir, 'vercel-operator-release.yml'), 'utf8');
const relock = readFileSync(join(workflowDir, 'vercel-relock-safety.yml'), 'utf8');
assert.match(release, /deployment_ceiling = 1/);
assert.match(relock, /deployment_count = 0/);

console.log('Workflow estate closed at 4/4 durable workflows with full static practice coverage, causal Ash browser scope, and a distinct three-engine Giving/practice witness.');
