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
  'vercel-production-reobserve.yml',
  'vercel-relock-safety.yml',
].sort();

assert.deepEqual(
  workflows,
  required,
  `Workflow estate must remain exactly five durable authority surfaces. Found: ${workflows.join(', ')}`,
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
  /if \[\[ "\$browser" == 'webkit' \]\]; then[\s\S]*?run_extended_frontline > "artifacts\/\$browser\/extended\/frontline\.log"[\s\S]*?wait "\$extended_frontline_pid"; extended_frontline_status=\$\?[\s\S]*?run_extended_profiles > "artifacts\/\$browser\/extended\/profiles\.log" 2>&1\n\s*extended_profiles_status=\$\?/,
  'WebKit must give the shared extended runtime one browser-heavy client at a time while retaining parallel independent-runtime witnesses.',
);
assert.match(
  consolidated,
  /lane_schedule:process\.env\.BROWSER === 'webkit' \? 'independent-three-then-extended-profiles' : 'four-way-parallel'/,
  'Shard receipts must preserve the engine-specific lane schedule used for the witness.',
);
assert.match(
  consolidated,
  /webkit_extended_same_runtime_overlap:process\.env\.BROWSER === 'webkit' \? false : null/,
  'WebKit receipts must state that the two port-6131 witness families did not overlap.',
);

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
const reobserve = readFileSync(join(workflowDir, 'vercel-production-reobserve.yml'), 'utf8');
const relock = readFileSync(join(workflowDir, 'vercel-relock-safety.yml'), 'utf8');
assert.match(release, /deployment_ceiling = 1/);
assert.match(relock, /deployment_count = 0/);
assert.match(relock, /startsWith\(github\.event\.comment\.body, '\/td613-vercel-relock '\)/);
assert.doesNotMatch(relock, /startsWith\(github\.event\.comment\.body, '\/td613-vercel-release '\)/,
  'relock safety must remain a separately invoked recovery membrane rather than competing with release');
assert.doesNotMatch(relock, /^concurrency:\s*$/m,
  'relock workflow wrapper must not enter shared release concurrency before command admission');
assert.match(relock, /relock-safety:[\s\S]*?concurrency:\n\s+group: td613-vercel-production-release/,
  'the admitted relock job itself remains serialized against deployment');


// Live Gemini observation is deliberately a fifth authority surface because provider
// liveness is not deployment-success authority. It shares release serialization but
// inherits neither deployment nor contents-write authority.
assert.doesNotMatch(release, /node scripts\/loom-production-canary\.mjs/,
  'Vercel deployment success must not automatically spend Gemini quota.');
assert.match(release, /Defer live AI canary to explicit observation lane/);
assert.match(release, /automatic_provider_calls:\s*0/);
assert.match(reobserve, /name:\s*Vercel Explicit Production AI Observation/);
assert.match(reobserve, /github\.event\.issue\.number == 405/);
assert.match(reobserve, /startsWith\(github\.event\.comment\.body, '\/td613-production-reobserve '\)/);
assert.match(reobserve, /group:\s*td613-vercel-production-release/);
assert.match(reobserve, /^\s{2}contents:\s*read$/m);
assert.match(reobserve, /^\s{2}actions:\s*read$/m);
assert.match(reobserve, /^\s{2}issues:\s*write$/m);
assert.doesNotMatch(reobserve, /^\s{2}contents:\s*write$/m);
assert.doesNotMatch(reobserve, /VERCEL_TOKEN|vercel@latest deploy|deploymentEnabled\s*=\s*true|git push/,
  'Observation-only authority must contain no deployment, lock-opening, or source-mutation path.');
assert.match(reobserve, /Admit a prior governed release as observation anchor/);
assert.match(reobserve, /\['success', 'failure'\]\.includes\(run\.conclusion\)/,
  'Explicit observation may bind either a successful or historically held governed release.');
assert.match(reobserve, /prior_release_workflow_run:\s*releaseRunId/);
assert.match(reobserve, /deployment_authority:\s*false/);
assert.match(reobserve, /retroactive_release_rewrite:\s*false/);
assert.match(reobserve, /Verify exact source receipt before re-observation/);
assert.match(reobserve, /Verify deployed bytes before re-observation/);
assert.match(reobserve, /Re-observe Loom Demo 1 and independent Marrowline live route/);
assert.match(reobserve, /Confirm exact source receipt after re-observation/);
assert.match(reobserve, /Reconfirm deployed bytes after re-observation/);
assert.equal((reobserve.match(/flowcore-release-content-probe\.mjs/g) || []).length, 2,
  'Explicit observation must bind exact deployed application bytes on both sides of the live witness.');
assert.equal((reobserve.match(/loom-production-canary\.mjs/g) || []).length, 1,
  'One explicit observation gesture may spend exactly one Loom/Marrowline live canary.');
assert.match(reobserve, /deployment_count = 0/);
assert.match(reobserve, /prior_release_state = PRESERVED_AS_RECORDED/);
assert.match(reobserve, /retroactive_release_rewrite = false/);
assert.match(reobserve, /counts_as_human_evidence = false/);
assert.match(reobserve, /No Vercel deployment occurred\. Sealed ⟐/);

assert.match(reobserve, /github\.event\.issue\.number == 1172/);
assert.match(reobserve, /startsWith\(github\.event\.comment\.body, '\/td613-marrowline-dollhouse-trial '\)/);
assert.match(reobserve, /github\.event\.comment\.user\.login == github\.repository_owner/);
assert.match(reobserve, /github\.event\.comment\.performed_via_github_app == null/);
assert.match(reobserve, /Dollhouse production trial rejects GitHub-App-mediated comments/);
assert.doesNotMatch(reobserve, /issue\.number == 1172[\s\S]{0,260}chatgpt-codex-connector\[bot\]/,
  'Experimental Dollhouse production trials must not accept an app-mediated issue comment as operator authority.');
assert.match(reobserve, /name:\s*Marrowline Dollhouse four-agent production trial/);
assert.match(reobserve, /Verify Dollhouse trial has no release authority/);
assert.match(reobserve, /run-pedagogue-design-gate\.mjs tests\/fixtures\/pedagogue\/marrowline-living-chat-design\.json/);
assert.match(reobserve, /marrowline-dollhouse-trial-contract\.test\.mjs/);
assert.match(reobserve, /run-marrowline-dollhouse-production-trial\.mjs/);
assert.match(reobserve, /td613-marrowline-dollhouse-trial-evidence/);
assert.match(reobserve, /deployment_authority = false/);
assert.match(reobserve, /counts_as_human_evidence = false/);
assert.match(reobserve, /No production mutation occurred\. ⟐/);

// Wendbine explicit operator gate contract: one user gesture, own issue, no cron and no release authority.
const wendbineGate = relock.split('  wendbine-operator-sync:')[1] || '';
assert.ok(wendbineGate, 'Wendbine listener must be active on main inside the existing relock workflow.');
assert.match(wendbineGate, /github\.event\.issue\.number == 1308/);
assert.match(wendbineGate, /github\.event\.issue\.pull_request == null/);
assert.match(wendbineGate, /github\.event\.comment\.body == '\/wendbine-sync ATELIER'/);
assert.match(wendbineGate, /ATELIER_PR: '1134'/);
assert.match(wendbineGate, /ATELIER_BRANCH: research\/wendbine-public-atelier-sync-20260913/);
assert.match(wendbineGate, /source-capture\.sealed\.json/);
assert.match(wendbineGate, /WENDBINE_WRITE_MEMBRANE_VIOLATION/);
assert.match(wendbineGate, /Gate #\$GATE_ISSUE DORMANT/);
assert.match(relock, /github\.event\.issue\.number == 758/);
assert.match(relock, /github\.event\.comment\.body == '\/src-zenodo-sync ATELIER'/);
assert.doesNotMatch(consolidated, /^\s*schedule:\s*$/m,
 'Wendbine must never insert a six-hour scheduler into consolidated validation.');
assert.doesNotMatch(wendbineGate, /cron:|deployment_count|vercel-operator-release\.yml/,
 'Wendbine intake carries no autonomous timing or Vercel release authority.');

console.log('Workflow estate closed at 5/5 durable workflows: validation, release, explicit production AI observation, relock safety, and Pages remain authority-distinct.');
