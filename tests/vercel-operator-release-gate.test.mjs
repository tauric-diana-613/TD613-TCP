import assert from 'node:assert/strict';
import fs from 'node:fs';

const workflow = fs.readFileSync('.github/workflows/vercel-operator-release.yml', 'utf8');
const law = fs.readFileSync('docs/STRATEGIC_VERCEL_DEPLOYMENT_LAW.md', 'utf8');
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

assert.equal(vercel.git?.deploymentEnabled, false, 'ordinary Git-triggered Vercel deployment must remain disabled');
assert.match(workflow, /^\s{2}issue_comment:\s*$/m, 'release gate must enter through the permanent issue comment conduit');
assert.doesNotMatch(workflow, /^\s{2}(push|pull_request|workflow_dispatch):\s*$/m, 'release gate must not run from pushes, PRs, or an operator-operated Actions button');
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
assert.equal((workflow.match(/vercel@latest deploy/g) || []).length, 1, 'release workflow must contain exactly one direct Vercel deployment invocation');
assert.match(workflow, /Create one bounded Git-fallback release commit/);
assert.match(workflow, /config\.git\.deploymentEnabled = true/);
assert.match(workflow, /git push origin HEAD:main/);
assert.match(workflow, /Restore the Git deployment lock after fallback/);
assert.match(workflow, /deploymentEnabled: false/);
assert.equal((workflow.match(/config\.git\.deploymentEnabled = true/g) || []).length, 1);
assert.equal((workflow.match(/deploymentEnabled: false/g) || []).length, 1);

for (const testFile of [
  'ash-keep-live-aia-surface.test.mjs',
  'ash-aia3-mass-eviction.test.mjs',
  'flowcore-p0-p10-completion.test.mjs',
  'flowcore-p0-p7-seam-closure.test.mjs',
  'flowcore-physical-scene.test.mjs',
  'flowcore-empirical-validation.test.mjs',
  'flowcore-production-promotion.test.mjs',
  'flowcore-runtime-browser-probe.test.mjs'
]) assert.match(workflow, new RegExp(testFile.replaceAll('.', '\\.')));
assert.match(workflow, /flowcore-release-content-probe\.mjs/);
assert.match(workflow, /npm run test:safe-harbor:gen3:wave-b/);
assert.match(workflow, /npm run test:safe-harbor:gen3:track-r/);
assert.match(workflow, /safe-harbor-gen3-wave-b-production-probe-contract\.test\.mjs/);
assert.match(workflow, /safe-harbor-gen3-wave-b-production-assets\.mjs/);
assert.match(workflow, /safe-harbor-gen3-wave-b-production-probe\.mjs/);
assert.match(workflow, /Observe deployed Safe Harbor Gen3 Wave B/);
assert.match(workflow, /safe-harbor-gen3-wave-b-production-observation\.json/);
assert.match(workflow, /safe_harbor_gen3_wave_b = PASS/);
assert.match(workflow, /temporal_bloom_desktop_1440x1000 = PASS/);
assert.match(workflow, /temporal_bloom_mobile_390x844 = PASS/);
assert.match(workflow, /provenance_deterministic_svg = PASS/);
assert.match(workflow, /provenance_imitation_collision_reduction = PASS/);
assert.match(workflow, /future_safe_harbor_release_authorized = false/);
assert.match(workflow, /flowcore-runtime-browser-probe\.mjs/);
assert.match(workflow, /ash-keep-aia3-task-journey-v3\.mjs/);
assert.match(workflow, /ash-lifecycle-production-probe\.mjs/);
assert.match(workflow, /Observe deployed Ash lifecycle/);
assert.match(workflow, /ash-lifecycle-production-closure\.json/);
assert.match(workflow, /CONTINUITY_SEALED/);
assert.match(workflow, /specialist_cache_preflight\?\.legacy_bypass !== true/);
assert.match(workflow, /aia3_route_required !== false/);
assert.match(workflow, /for browser in chromium firefox webkit/);
assert.match(workflow, /playwright install --with-deps chromium firefox webkit/);
assert.match(workflow, /flowcore-ash-aia3-lifecycle-production-release-evidence/);
assert.match(workflow, /exact_source_content = PASS/);
assert.match(workflow, /flowcore_browser_matrix = PASS/);
assert.match(workflow, /ash_keep_aia3_task_matrix = PASS/);
assert.match(workflow, /ash_lifecycle = PASS/);
assert.match(workflow, /ash_keep_retired_aia2_eviction = PASS/);
assert.match(workflow, /ash_keep_mobile_390x844 = PASS/);
assert.match(workflow, /source_packet_commit = \$\{\{ steps\.authorize\.outputs\.selected_sha \}\}/);
assert.match(workflow, /counts_as_human_evidence = false/);
assert.match(workflow, /child_study_authorized = false/);
assert.match(workflow, /public_route_promotion_authorized = false/);
assert.match(workflow, /application_tree_drift = none/);
assert.match(workflow, /No additional deployment attempt is authorized by this failure/);
assert.match(workflow, /Sealed ⟐/);
assert.doesNotMatch(workflow, /ash-keep-aia2-task-journey|ash-aia2-production|ash_keep_aia2_task_matrix/, 'retired AIA2 witness must not re-enter the release gate');

assert.equal(fs.existsSync('.github/workflows/ash-keep-aia3-production-observation.yml'), false, 'Standalone production observer must remain retired; release owns exact-source AIA3 and lifecycle observation.');

assert.match(law, /operator authorization → assistant\/Codex execution → one Vercel deployment/);
assert.match(law, /The operator is not required to operate Vercel, GitHub Actions, or deployment plumbing/);
assert.match(law, /direct token bridge/);
assert.match(law, /bounded Git fallback/);
assert.match(law, /source_packet_commit/);
assert.match(law, /Flow-Core browser matrix/);
assert.match(law, /Ash Keep AIA3/);
assert.match(law, /retired AIA2/);

console.log('vercel-operator-release-gate.test.mjs passed');
