import assert from 'node:assert/strict';
import fs from 'node:fs';

const workflow = fs.readFileSync('.github/workflows/vercel-operator-release.yml', 'utf8');
const law = fs.readFileSync('docs/STRATEGIC_VERCEL_DEPLOYMENT_LAW.md', 'utf8');
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

assert.equal(vercel.git?.deploymentEnabled, false, 'ordinary Git-triggered Vercel deployment must remain disabled');
assert.match(workflow, /^\s{2}issue_comment:\s*$/m);
assert.doesNotMatch(workflow, /^\s{2}(push|pull_request|workflow_dispatch):\s*$/m);
assert.match(workflow, /github\.event\.issue\.number == 405/);
assert.match(workflow, /github\.event\.comment\.user\.login == github\.repository_owner/);
assert.match(workflow, /startsWith\(github\.event\.comment\.body, '\/td613-vercel-release '\)/);
assert.match(workflow, /TARGET" == 'PRODUCTION'|TARGET" != "PRODUCTION"/);
assert.match(workflow, /\^\[0-9a-f\]\{40\}\$/);
assert.match(workflow, /CURRENT_MAIN="\$\(git rev-parse HEAD\)"/);
assert.match(workflow, /config\.git\?\.deploymentEnabled !== false/);
assert.match(workflow, /^\s{2}contents: write$/m);
assert.match(workflow, /mode=direct-token/);
assert.match(workflow, /mode=git-fallback/);
assert.match(workflow, /secrets\.VERCEL_TOKEN/);
assert.match(workflow, /VERCEL_PROJECT: td-613-tcp/);
assert.match(workflow, /VERCEL_SCOPE: tauric-diana-s-projects/);
assert.equal((workflow.match(/vercel@latest deploy/g) || []).length, 1);
assert.match(workflow, /Create one bounded Git-fallback release commit/);
assert.match(workflow, /config\.git\.deploymentEnabled = true/);
assert.match(workflow, /Restore the Git deployment lock after fallback/);
assert.match(workflow, /deploymentEnabled: false/);
assert.equal((workflow.match(/config\.git\.deploymentEnabled = true/g) || []).length, 1);
assert.equal((workflow.match(/deploymentEnabled: false/g) || []).length, 1);

for (const token of [
  'flowcore-release-content-probe.mjs',
  'npm run test:safe-harbor:gen3:wave-b',
  'npm run test:safe-harbor:gen3:track-r',
  'safe-harbor-gen3-wave-b-production-probe.mjs',
  'flowcore-runtime-browser-probe.mjs',
  'ash-keep-aia3-task-journey-v3.mjs',
  'for browser in chromium firefox webkit',
  'playwright install --with-deps chromium firefox webkit',
  'exact_source_content = PASS',
  'flowcore_browser_matrix = PASS',
  'ash_keep_aia3_task_matrix = PASS',
  'counts_as_human_evidence = false',
  'child_study_authorized = false',
  'public_route_promotion_authorized = false',
  'application_tree_drift = none',
  'No additional deployment attempt is authorized by this failure',
  'Sealed ⟐',
]) assert.ok(workflow.includes(token), `release workflow omitted ${token}`);

assert.doesNotMatch(workflow, /ash-keep-aia2-task-journey|ash-aia2-production|ash_keep_aia2_task_matrix/);
assert.match(law, /operator authorization → assistant\/Codex execution → one Vercel deployment/);
assert.match(law, /The operator is not required to operate Vercel, GitHub Actions, or deployment plumbing/);
assert.match(law, /direct token bridge/);
assert.match(law, /bounded Git fallback/);
assert.match(law, /source_packet_commit/);
assert.match(law, /Flow-Core browser matrix/);
assert.match(law, /Ash Keep AIA3/);
assert.match(law, /retired AIA2/);

assert.equal(fs.existsSync('.github/workflows/ash-keep-aia3-production-observation.yml'), false);
assert.equal(fs.existsSync('.github/workflows/vercel-relock-safety.yml'), false);

console.log('vercel-operator-release-gate.test.mjs passed');
