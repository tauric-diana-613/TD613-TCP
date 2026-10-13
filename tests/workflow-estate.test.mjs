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
  'vercel-production-reobserve.yml',
];
for (const name of retired) {
  assert.ok(!workflows.includes(name), `Superseded workflow returned: ${name}`);
}

const consolidated = readFileSync(join(workflowDir, 'td613-ci.yml'), 'utf8').replace(/\r\n/g, '\n');
assert.match(consolidated, /name:\s*TD613 Consolidated Validation/);
assert.match(consolidated, /cancel-in-progress:\s*true/);
assert.match(consolidated, /types:\s*\[opened, synchronize, reopened\]/);
assert.match(consolidated, /Full-product exact-head Chromium Firefox WebKit witness/);
assert.match(consolidated, /Giving\/practice exact-head Chromium Firefox WebKit witness/);
assert.match(consolidated, /Classify exact-head browser witness scope/);
assert.match(consolidated, /practice_fixture_changed:\s*\$\{\{ steps\.classify\.outputs\.practice_fixture_changed \}\}/);
assert.match(consolidated, /contracts:\n\s+name: Static, constitutional, and release contracts\n\s+needs: scope/);
assert.match(consolidated, /github\.event_name == 'workflow_dispatch' && inputs\.mode == 'full-browser'/);
assert.doesNotMatch(consolidated, /github\.event\.action == 'ready_for_review'/);
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

// Deep browser evidence is diagnostic, not an automatic merge veto.
// Normal PRs retain the fast contract lane; explicit workflow_dispatch owns
// full-browser and Giving-browser replays when an operator actually wants them.
assert.match(shardGate, /github\.event_name == 'workflow_dispatch'/);
assert.match(shardGate, /inputs\.mode == 'full-browser'/);
assert.doesNotMatch(shardGate, /github\.event_name == 'pull_request'/);
assert.match(convergenceGate, /github\.event_name == 'workflow_dispatch'/);
assert.match(convergenceGate, /inputs\.mode == 'full-browser'/);
assert.doesNotMatch(convergenceGate, /github\.event_name == 'pull_request'/);
assert.match(givingBrowserGate, /github\.event_name == 'workflow_dispatch'/);
assert.match(givingBrowserGate, /inputs\.mode == 'giving-browser'/);
assert.doesNotMatch(givingBrowserGate, /github\.event_name == 'pull_request'/);
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

// Retired/deep estates remain executable by explicit full-browser dispatch,
 // but do not participate in ordinary PR or push validation.
for (const stepName of ['Validate Dome-World static surfaces', 'Validate Phase IV static surfaces', 'Validate Ash core and ingress surfaces', 'Validate Ash A9 Work', 'Validate Flow-Core P0-P10 completion']) {
  assert.match(consolidated, new RegExp(`${stepName.replaceAll('-', '\\-')}\\n\\s+if: github\\.event_name == 'workflow_dispatch' && inputs\\.mode == 'full-browser'`));
}

const pages = readFileSync(join(workflowDir, 'pages.yml'), 'utf8').replace(/\r\n/g, '\n');
assert.match(pages, /workflow_dispatch:/);
assert.doesNotMatch(pages, /pull_request:/, 'GitHub Pages must not duplicate PR validation.');
assert.doesNotMatch(pages, /push:\s*[\s\S]*branches:\s*\[\s*main\s*\]/, 'GitHub Pages must remain explicitly dispatched.');

const release = readFileSync(join(workflowDir, 'vercel-operator-release.yml'), 'utf8').replace(/\r\n/g, '\n');
const relock = readFileSync(join(workflowDir, 'vercel-relock-safety.yml'), 'utf8').replace(/\r\n/g, '\n');
assert.match(release, /deployment_ceiling = 1/);
assert.match(relock, /deployment_count = 0/);
assert.match(relock, /startsWith\(github\.event\.comment\.body, '\/td613-vercel-relock '\)/);
assert.doesNotMatch(relock, /startsWith\(github\.event\.comment\.body, '\/td613-vercel-release '\)/,
  'relock safety must remain a separately invoked recovery membrane rather than competing with release');
assert.doesNotMatch(relock, /^concurrency:\s*$/m,
  'relock workflow wrapper must not enter shared release concurrency before command admission');
assert.match(relock, /relock-safety:[\s\S]*?concurrency:\n\s+group: td613-vercel-production-release/,
  'the admitted relock job itself remains serialized against deployment');


// Provider/literary observation is now an operator-directed manual diagnostic,
// not a durable workflow authority surface.
assert.doesNotMatch(release, /node scripts\/loom-production-canary\.mjs/,
  'Vercel deployment success must not automatically spend Gemini quota.');
assert.match(release, /Record live AI observation as manual-only/);
assert.match(release, /automatic_provider_calls:\s*0/);
assert.match(release, /observation_route:\s*'OPERATOR_DIRECTED_MANUAL_DIAGNOSTIC'/);
assert.doesNotMatch(release, /td613-production-reobserve|td613-marrowline-dollhouse-trial/);
assert.equal(workflows.includes('vercel-production-reobserve.yml'), false,
  'The obsolete provider reobserve / frozen Dollhouse listener must remain retired.');

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
assert.ok(wendbineGate.includes("['git','status','--porcelain=v1','-z','--untracked-files=all']"),
 'Untracked nested relations must be enumerated as files, not collapsed into a directory placeholder.');
// Regression for the first real issue #1308 gesture: an untracked
// relations/typed-edges.jsonl file must satisfy the strict write membrane,
// while any unapproved sibling remains rejected.
{
  const {execFileSync} = await import('node:child_process');
  const {mkdtempSync,mkdirSync,writeFileSync,rmSync} = await import('node:fs');
  const {tmpdir} = await import('node:os');
  const tmp = mkdtempSync(join(tmpdir(),'wendbine-membrane-'));
  try {
    execFileSync('git',['init','-q'],{cwd:tmp});
    const root='packages/dome_world_exact/fixtures/a15-r0/WENDBINE/';
    const edge=root+'05-OPERATIONS/relations/typed-edges.jsonl';
    mkdirSync(join(tmp,root,'05-OPERATIONS/relations'),{recursive:true});
    writeFileSync(join(tmp,edge),'{}\n');
    const read=()=>execFileSync('git',['status','--porcelain=v1','-z','--untracked-files=all'],{cwd:tmp,encoding:'utf8'})
      .split('\0').filter(Boolean).map(row=>row.slice(3));
    const allowedDirs=['01-MANIFESTS/phase2/','04-RECEIPTS/phase2/',
      '05-OPERATIONS/phase2/','07-ARCHIVE-LEDGER/syncs/'];
    const allowedFiles=['01-MANIFESTS/registry-index.json','05-OPERATIONS/relations/typed-edges.jsonl'];
    const valid=path=>path.startsWith(root)&&(allowedFiles.includes(path.slice(root.length))||allowedDirs.some(p=>path.slice(root.length).startsWith(p)));
    assert.deepEqual(read(),[edge],'Git must report the leaf file, not the untracked relations directory.');
    assert.ok(read().every(valid),'Valid typed-edge leaf file must pass the source-only membrane.');
    const foreign=root+'05-OPERATIONS/relations/unapproved-source.txt';
    writeFileSync(join(tmp,foreign),'not allowed\n');
    assert.ok(read().some(p=>!valid(p)),'Unexpected sibling file must still fail closed.');
    const prefixCollision=root+'05-OPERATIONS/relations/typed-edges.jsonl.unapproved';
    writeFileSync(join(tmp,prefixCollision),'unapproved');
    assert.equal(valid(prefixCollision),false,'A filename sharing the allowed file prefix must remain forbidden.');
  } finally {rmSync(tmp,{recursive:true,force:true});}
}

assert.ok(wendbineGate.includes('      group: wendbine-operator-sync-${{ github.repository }}-${{ github.event.issue.number }}'),
 'Wendbine gate must own an isolated branch serialization group.');
assert.match(wendbineGate, /cancel-in-progress: false/,
 'A second command cannot cancel the current operator run.');
assert.doesNotMatch(wendbineGate, /td613-vercel-production-release/,
 'Wendbine must never inherit the production release lock.');
assert.match(wendbineGate, /exact_head_validation=PENDING_CI/,
 'A committed projection must not claim a post-commit CI success ahead of validation.');
assert.match(wendbineGate, /Gate #\$GATE_ISSUE DORMANT/);
assert.match(relock, /github\.event\.issue\.number == 758/);
assert.match(relock, /github\.event\.comment\.body == '\/src-zenodo-sync ATELIER'/);
assert.doesNotMatch(consolidated, /^\s*schedule:\s*$/m,
 'Wendbine must never insert a six-hour scheduler into consolidated validation.');
assert.doesNotMatch(wendbineGate, /cron:|deployment_count|vercel-operator-release\.yml/,
 'Wendbine intake carries no autonomous timing or Vercel release authority.');

console.log('Workflow estate closed at 4/4 durable workflows: validation, release, relock/research safety, and Pages remain authority-distinct.');
