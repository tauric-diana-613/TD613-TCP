import assert from 'node:assert/strict';
import fs from 'node:fs';

const workflow = fs.readFileSync('.github/workflows/vercel-operator-release.yml', 'utf8');
const consolidated = fs.readFileSync('.github/workflows/td613-ci.yml', 'utf8');
const law = fs.readFileSync('docs/STRATEGIC_VERCEL_DEPLOYMENT_LAW.md', 'utf8');
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

assert.equal(vercel.git?.deploymentEnabled, false, 'ordinary Git-triggered Vercel deployment must remain disabled');
assert.match(workflow, /^\s{2}issue_comment:\s*$/m);
assert.doesNotMatch(workflow, /^\s{2}(push|pull_request|workflow_dispatch):\s*$/m);
assert.match(workflow, /github\.event\.issue\.number == 405/);
assert.match(workflow, /github\.event\.comment\.user\.login == github\.repository_owner/);
assert.match(workflow, /startsWith\(github\.event\.comment\.body, '\/td613-vercel-release '\)/);
assert.match(workflow, /TARGET" == 'PRODUCTION'/);
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

for (const testFile of [
  'workflow-estate.test.mjs',
  'tcp-smoke.test.mjs',
  'vercel-deploy-hygiene.test.mjs',
  'vercel-relock-safety.test.mjs',
  'release-plumbing.test.mjs',
  'ash-a12-command-rationalization.test.mjs',
  'ash-a13-unified-demo-registry.test.mjs',
  'ash-lifecycle-production-contract.test.mjs',
  'ash-keep-production-closure-contract.test.mjs'
]) assert.match(workflow, new RegExp(testFile.replaceAll('.', '\\.')));

assert.match(workflow, /flowcore-release-content-probe\.mjs/);
assert.match(workflow, /playwright install --with-deps chromium/);
assert.doesNotMatch(workflow, /playwright install --with-deps chromium firefox webkit/);
assert.doesNotMatch(workflow, /for browser in chromium firefox webkit/);
assert.match(workflow, /ash-a13-demo-registry-browser-probe\.mjs/);
assert.match(workflow, /ash-lifecycle-production-probe\.mjs/);
assert.match(workflow, /production_chromium_desktop_mobile = PASS/);
assert.match(workflow, /premerge_chromium_firefox_webkit = REQUIRED_AND_PASSED_BEFORE_MERGE/);
assert.match(workflow, /exact_source_content = PASS/);
assert.match(workflow, /source_packet_commit = \$\{\{ steps\.authorize\.outputs\.selected_sha \}\}/);
assert.match(workflow, /counts_as_human_evidence = false/);
assert.match(workflow, /child_study_authorized = false/);
assert.match(workflow, /public_route_promotion_authorized = false/);
assert.match(workflow, /application_tree_drift = none/);
assert.match(workflow, /No additional deployment attempt is authorized by this failure/);
assert.match(workflow, /Sealed ⟐/);
assert.doesNotMatch(workflow, /safe-harbor-gen3-wave-[ab]-production-probe|flowcore-runtime-browser-probe\.mjs|ash-keep-aia3-task-journey-v3\.mjs|ash-keep-aia2-task-journey/);

assert.match(consolidated, /One exact-head Chromium Firefox WebKit witness/);
assert.match(consolidated, /if: github\.event_name == 'workflow_dispatch' && inputs\.mode == 'full-browser'/);
assert.match(consolidated, /playwright install --with-deps chromium firefox webkit/);
assert.match(consolidated, /for browser in chromium firefox webkit/);
assert.match(consolidated, /ash-a13-demo-registry-browser-probe\.mjs/);
assert.doesNotMatch(consolidated, /if: github\.event_name == 'pull_request' \|\|/);
assert.equal(fs.existsSync('.github/workflows/ash-keep-aia3-production-observation.yml'), false);

assert.match(law, /operator authorization → assistant\/Codex execution → one Vercel deployment/);
assert.match(law, /The operator is not required to operate Vercel, GitHub Actions, or deployment plumbing/);
assert.match(law, /direct token bridge/);
assert.match(law, /bounded Git fallback/);
assert.match(law, /source_packet_commit/);
assert.match(law, /full three-engine evidence before merge/i);
assert.match(law, /one bounded Chromium production confirmation/i);
assert.match(law, /independent relock safety/i);

console.log('vercel-operator-release-gate.test.mjs passed');
