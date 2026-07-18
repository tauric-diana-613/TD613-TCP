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
assert.match(workflow, /secrets\.VERCEL_TOKEN/, 'assistant-triggered release must authenticate through the bounded Vercel credential bridge');
assert.match(workflow, /VERCEL_PROJECT: td-613-tcp/, 'Vercel project binding drifted');
assert.match(workflow, /VERCEL_SCOPE: tauric-diana-s-projects/, 'Vercel scope binding drifted');
assert.equal((workflow.match(/vercel@latest deploy/g) || []).length, 1, 'the release workflow must contain exactly one Vercel deployment invocation');
assert.match(workflow, /No additional deployment attempt is authorized by this failure/, 'a failed release must not silently authorize retries');
assert.match(workflow, /Sealed ⟐/, 'successful release receipt must seal');
assert.match(law, /operator authorization → assistant\/Codex execution → one Vercel deployment/, 'written law must preserve the operator-authorizes, assistant-executes route');
assert.match(law, /The operator is not required to operate Vercel, GitHub Actions, or deployment plumbing/, 'written law must remove deployment burden from the operator');

console.log('vercel-operator-release-gate.test.mjs passed');
