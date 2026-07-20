import assert from 'node:assert/strict';
import fs from 'node:fs';

const workflow = fs.readFileSync('.github/workflows/vercel-operator-release.yml', 'utf8');
const law = fs.readFileSync('docs/STRATEGIC_VERCEL_DEPLOYMENT_LAW.md', 'utf8');
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

assert.equal(vercel.git?.deploymentEnabled, false, 'ordinary Git-triggered Vercel deployment must remain disabled');
assert.match(workflow, /^\s{2}issue_comment:\s*$/m, 'release gate must enter through the permanent issue comment conduit');
assert.doesNotMatch(workflow, /^\s{2}(push|pull_request|workflow_dispatch):\s*$/m, 'release gate must not run from pushes, PRs, or an operator-operated Actions button');
assert.match(workflow, /github\.event\.issue\.number == 405/, 'release gate must remain bound to issue #405');
assert.match(workflow, /github\.event\.comment\.user\.login == github\.repository_owner/, 'release gate must require the repository owner identity');
assert.match(workflow, /startsWith\(github\.event\.comment\.body, '\/td613-vercel-release '\)/, 'release gate command prefix drifted');
assert.match(workflow, /TARGET" != "PRODUCTION"/, 'release gate must require the named PRODUCTION target');
assert.match(workflow, /\^\[0-9a-f\]\{40\}\$/, 'release gate must require an exact 40-character commit SHA');
assert.match(workflow, /CURRENT_MAIN="\$\(git rev-parse HEAD\)"/, 'release gate must bind authorization to current main');
assert.match(workflow, /config\.git\?\.deploymentEnabled !== false/, 'release gate must refuse to run if the Git auto-deploy lock is absent');
assert.match(workflow, /^\s{2}contents: write$/m, 'bounded fallback must have branch write permission');
assert.match(workflow, /mode=direct-token/);
assert.match(workflow, /mode=git-fallback/);
assert.match(workflow, /if: steps\.mode\.outputs\.mode == 'direct-token'/);
assert.match(workflow, /if: steps\.mode\.outputs\.mode == 'git-fallback'/);
assert.match(workflow, /secrets\.VERCEL_TOKEN/, 'preferred assistant-triggered release route must retain the Vercel token bridge');
assert.match(workflow, /VERCEL_PROJECT: td-613-tcp/, 'Vercel project binding drifted');
assert.match(workflow, /VERCEL_SCOPE: tauric-diana-s-projects/, 'Vercel scope binding drifted');
assert.equal((workflow.match(/vercel@latest deploy/g) || []).length, 1, 'the release workflow must contain exactly one direct Vercel deployment invocation');

assert.match(workflow, /Create one bounded Git-fallback release commit/);
assert.match(workflow, /config\.git\.deploymentEnabled = true/);
assert.match(workflow, /git push origin HEAD:main/);
assert.match(workflow, /Restore the Git deployment lock after fallback/);
assert.match(workflow, /deploymentEnabled: false/);
assert.match(workflow, /if: always\(\) && steps\.mode\.outputs\.mode == 'git-fallback'/);
assert.equal((workflow.match(/config\.git\.deploymentEnabled = true/g) || []).length, 1, 'fallback may open the deployment lock once');
assert.equal((workflow.match(/deploymentEnabled: false/g) || []).length, 1, 'fallback must close the lock once');

for (const testFile of [
  'ash-keep-live-aia-surface.test.mjs',
  'flowcore-p0-p10-completion.test.mjs',
  'flowcore-p0-p7-seam-closure.test.mjs',
  'flowcore-physical-scene.test.mjs',
  'flowcore-empirical-validation.test.mjs',
  'flowcore-production-promotion.test.mjs',
  'flowcore-runtime-browser-probe.test.mjs'
]) assert.match(workflow, new RegExp(testFile.replaceAll('.', '\\.')));
assert.match(workflow, /flowcore-release-content-probe\.mjs/);
assert.match(workflow, /flowcore-runtime-browser-probe\.mjs/);
assert.match(workflow, /ash-keep-aia2-task-journey-v5\.mjs/);
assert.match(workflow, /for browser in chromium firefox webkit/);
assert.match(workflow, /playwright install --with-deps chromium firefox webkit/);
assert.match(workflow, /flowcore-and-ash-production-release-evidence/);
assert.match(workflow, /exact_source_content = PASS/);
assert.match(workflow, /flowcore_browser_matrix = PASS/);
assert.match(workflow, /ash_keep_aia2_task_matrix = PASS/);
assert.match(workflow, /ash_keep_mobile_390x844 = PASS/);
assert.match(workflow, /source_packet_commit = \$\{\{ steps\.authorize\.outputs\.selected_sha \}\}/);
assert.match(workflow, /counts_as_human_evidence = false/);
assert.match(workflow, /child_study_authorized = false/);
assert.match(workflow, /public_route_promotion_authorized = false/);
assert.match(workflow, /application_tree_drift = none/);
assert.match(workflow, /No additional deployment attempt is authorized by this failure/, 'a failed release must not silently authorize retries');
assert.match(workflow, /Sealed ⟐/, 'successful release receipt must seal');

assert.match(law, /operator authorization → assistant\/Codex execution → one Vercel deployment/, 'written law must preserve the operator-authorizes, assistant-executes route');
assert.match(law, /The operator is not required to operate Vercel, GitHub Actions, or deployment plumbing/, 'written law must remove deployment burden from the operator');
assert.match(law, /direct token bridge/);
assert.match(law, /bounded Git fallback/);
assert.match(law, /source_packet_commit/);
assert.match(law, /Flow-Core browser matrix/);

console.log('vercel-operator-release-gate.test.mjs passed');