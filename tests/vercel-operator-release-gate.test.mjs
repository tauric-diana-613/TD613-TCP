import assert from 'node:assert/strict';
import fs from 'node:fs';

const workflow = fs.readFileSync('.github/workflows/vercel-operator-release.yml', 'utf8');
const consolidated = fs.readFileSync('.github/workflows/td613-ci.yml', 'utf8');
const law = fs.readFileSync('docs/STRATEGIC_VERCEL_DEPLOYMENT_LAW.md', 'utf8');
const probe = fs.readFileSync('scripts/flowcore-release-content-probe.mjs', 'utf8');
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
assert.match(workflow, /Classify the authorized release witness scope/);
assert.match(workflow, /classify-validation-scope\.mjs --github-output/);
assert.match(workflow, /validation_scope = \$\{\{ steps\.scope\.outputs\.validation_scope \}\}/);
assert.match(workflow, /Verify Giving-only release contracts[\s\S]*if: steps\.scope\.outputs\.validation_scope == 'giving'/);
assert.match(workflow, /Verify canonical practice fixture release contracts[\s\S]*if: steps\.scope\.outputs\.validation_scope == 'practice'/);
assert.match(workflow, /Verify full-product release contracts[\s\S]*if: steps\.scope\.outputs\.validation_scope == 'full'/);
const givingReleaseContracts = workflow.match(/- name: Verify Giving-only release contracts[\s\S]*?(?=\n\s+- name:)/)?.[0] || '';
const practiceReleaseContracts = workflow.match(/- name: Verify canonical practice fixture release contracts[\s\S]*?(?=\n\s+- name:)/)?.[0] || '';
assert.doesNotMatch(givingReleaseContracts, /ash-|dome-world|flowcore/i, 'Giving release contracts must not invoke another product lane');
assert.match(practiceReleaseContracts, /pedagogue-practice-fixture\.test\.mjs/);
assert.match(practiceReleaseContracts, /pedagogue-design-gate\.test\.mjs/);
assert.doesNotMatch(practiceReleaseContracts, /ash-a|ash-lifecycle|ash-keep-production/i, 'Practice release contracts must not bind or re-litigate live Ash runtime.');
assert.match(workflow, /^\s{2}contents: write$/m);
assert.match(workflow, /mode=direct-token/);
assert.match(workflow, /mode=git-fallback/);
assert.match(workflow, /secrets\.VERCEL_TOKEN/);
assert.match(workflow, /VERCEL_PROJECT: td-613-tcp/);
assert.match(workflow, /VERCEL_SCOPE: tauric-diana-s-projects/);
assert.equal((workflow.match(/vercel@latest deploy/g) || []).length, 1);
assert.match(workflow, /Create one bounded Git-fallback release commit/);
assert.match(workflow, /config\.git\.deploymentEnabled = true/);
assert.match(workflow, /Restore the Git deployment lock immediately after fallback admission/);
assert.match(workflow, /deploymentEnabled: false/);
assert.equal((workflow.match(/config\.git\.deploymentEnabled = true/g) || []).length, 1);
assert.equal((workflow.match(/deploymentEnabled: false/g) || []).length, 1);

const releaseIndex = workflow.indexOf('- name: Create one bounded Git-fallback release commit');
const relockIndex = workflow.indexOf('- name: Restore the Git deployment lock immediately after fallback admission');
const resolveIndex = workflow.indexOf('- name: Resolve deployed production URL');
const exactIndex = workflow.indexOf('- name: Verify deployed bytes match the authorized source packet');
const browserInstallIndex = workflow.indexOf('- name: Install one production browser engine');
assert.ok(releaseIndex >= 0 && relockIndex > releaseIndex, 'fallback relock must follow the single deployable release commit');
assert.ok(resolveIndex > relockIndex, 'fallback must be relocked before production URL observation begins');
assert.ok(exactIndex > relockIndex, 'exact-source observation must happen only after the fallback gate is closed');
assert.ok(browserInstallIndex > relockIndex, 'browser installation must happen only after the fallback gate is closed');

for (const testFile of [
  'workflow-estate.test.mjs',
  'tcp-smoke.test.mjs',
  'vercel-deploy-hygiene.test.mjs',
  'vercel-relock-safety.test.mjs',
  'release-plumbing.test.mjs',
  'ash-a12-command-rationalization.test.mjs',
  'ash-a13-unified-demo-registry.test.mjs',
  'ash-a14-archive-accession.test.mjs',
  'ash-lifecycle-production-contract.test.mjs',
  'ash-keep-production-closure-contract.test.mjs'
]) assert.match(workflow, new RegExp(testFile.replaceAll('.', '\\.')));

assert.equal((workflow.match(/flowcore-release-content-probe\.mjs/g) || []).length, 2,
  'production exact-source bytes must be checked before and after the stale-queue stability window');
assert.match(workflow, /playwright install --with-deps chromium/);
assert.doesNotMatch(workflow, /playwright install --with-deps chromium firefox webkit/);
assert.doesNotMatch(workflow, /for browser in chromium firefox webkit/);
assert.match(workflow, /Confirm deployed Campaign Deputy Giving History exports on Chromium[\s\S]*if: steps\.scope\.outputs\.validation_scope == 'giving'[\s\S]*giving-browser-probe\.mjs/);
assert.match(workflow, /Confirm deployed canonical practice fixture on Chromium[\s\S]*if: steps\.scope\.outputs\.validation_scope == 'practice'[\s\S]*giving-browser-probe\.mjs/);
assert.match(workflow, /giving-production-readiness\.test\.mjs/);
assert.match(workflow, /TD613_SOURCE_PACKET_COMMIT: \$\{\{ steps\.authorize\.outputs\.selected_sha \}\}/);
assert.match(workflow, /TD613_GIVING_PROBE_ATTEMPTS: '72'/);
assert.match(workflow, /TD613_GIVING_PROBE_DELAY_MS: '5000'/);
assert.match(workflow, /Materialize the exact-source receipt/);
const materializeReceiptStep = workflow.match(/- name: Materialize the exact-source receipt[\s\S]*?(?=\n\s+- name:)/)?.[0] || '';
assert.doesNotMatch(materializeReceiptStep, /^\s+if:/m,
  'the exact-source receipt must be materialized for Giving, practice, and full-product releases');
assert.match(workflow, /app\/giving\/history\/release-source\.json/);
assert.match(workflow, /source_packet_commit: sourcePacketCommit/);
const fallbackRelease = workflow.match(/- name: Create one bounded Git-fallback release commit[\s\S]*?(?=\n\s+- name: Restore the Git deployment lock immediately after fallback admission)/)?.[0] || '';
assert.match(fallbackRelease, /git add vercel\.json app\/giving\/history\/release-source\.json/,
  'the one deployable fallback commit must bind the exact-source receipt for every release scope');

assert.match(probe, /new URL\('\/giving\/history\/release-source\.json'/,
  'exact-source observation must interrogate the release receipt before declaring settlement');
assert.match(probe, /Release receipt does not match authorized source/);
assert.match(probe, /release_source_receipt_verified: true/);
assert.match(probe, /td613_receipt_probe_attempt/);
const receiptProbeIndex = probe.indexOf("new URL('/giving/history/release-source.json'");
const runtimeRemoteIndex = probe.indexOf('const remote = [];');
assert.ok(receiptProbeIndex >= 0 && runtimeRemoteIndex > receiptProbeIndex,
  'the authorized release receipt must settle before byte-equivalent runtime content can pass');

assert.match(workflow, /Hold authorized source stable against stale queued rollbacks/);
assert.match(workflow, /TD613_STABILITY_CHECKS: '10'/);
assert.match(workflow, /TD613_STABILITY_DELAY_MS: '10000'/);
assert.match(workflow, /Stale queued deployment displaced authorized source/);
assert.match(workflow, /Reconfirm exact deployed bytes after stability window/);
assert.match(workflow, /TD613_ARTIFACT_DIR: artifacts\/exact-source-stable/);
assert.match(workflow, /Confirm authorized source still owns production after witness/);
assert.match(workflow, /Production source changed during witness/);
assert.match(workflow, /stale_queue_stability_window = PASS/);
assert.match(workflow, /post_witness_source_guard = PASS/);
assert.match(workflow, /artifacts\/exact-source-stable\//);

assert.match(workflow, /ash-a13-demo-registry-browser-probe\.mjs/);
assert.match(workflow, /ash-a14-archive-browser-probe\.mjs/);
assert.match(workflow, /ash-lifecycle-production-probe\.mjs/);
assert.match(workflow, /Confirm deployed A14[\s\S]*if: steps\.scope\.outputs\.validation_scope == 'full'[\s\S]*ash-a13-demo-registry-browser-probe\.mjs/);
assert.match(workflow, /Observe deployed Ash lifecycle[\s\S]*if: steps\.scope\.outputs\.validation_scope == 'full'[\s\S]*ash-lifecycle-production-probe\.mjs/);
assert.match(workflow, /production_giving_history = \$\{\{ steps\.scope\.outputs\.validation_scope == 'giving'/);
assert.match(workflow, /production_practice_fixture = \$\{\{ steps\.scope\.outputs\.validation_scope == 'practice'/);
assert.match(workflow, /production_a14_registry_archive = \$\{\{ steps\.scope\.outputs\.validation_scope == 'full'/);
assert.match(workflow, /production_chromium_desktop_mobile = \$\{\{ steps\.scope\.outputs\.validation_scope == 'full'/);
assert.match(workflow, /premerge_scope_aligned_chromium_firefox_webkit = REQUIRED_AND_PASSED_BEFORE_MERGE/);
assert.match(workflow, /exact_source_content = PASS/);
assert.match(workflow, /source_packet_commit = \$\{\{ steps\.authorize\.outputs\.selected_sha \}\}/);
assert.match(workflow, /counts_as_human_evidence = false/);
assert.match(workflow, /child_study_authorized = false/);
assert.match(workflow, /public_route_promotion_authorized = false/);
assert.match(workflow, /application_tree_drift = none/);
assert.match(workflow, /No additional deployment attempt is authorized by this failure/);
assert.match(workflow, /Sealed ⟐/);
assert.doesNotMatch(workflow, /safe-harbor-gen3-wave-[ab]-production-probe|flowcore-runtime-browser-probe\.mjs|ash-keep-aia3-task-journey-v3\.mjs|ash-keep-aia2-task-journey/);

assert.match(consolidated, /types:\s*\[opened, synchronize, reopened, ready_for_review\]/);
assert.match(consolidated, /Full-product exact-head Chromium Firefox WebKit witness/);
assert.match(consolidated, /Giving\/practice exact-head Chromium Firefox WebKit witness/);
assert.match(consolidated, /Classify exact-head browser witness scope/);
assert.match(consolidated, /practice_fixture_changed:\s*\$\{\{ steps\.classify\.outputs\.practice_fixture_changed \}\}/);
assert.match(consolidated, /contracts:\n\s+name: Static, constitutional, and release contracts\n\s+needs: scope/);
assert.match(consolidated, /needs\.scope\.outputs\.validation_scope == 'giving'/);
assert.match(consolidated, /needs\.scope\.outputs\.validation_scope == 'practice'/);
assert.match(consolidated, /needs\.scope\.outputs\.validation_scope == 'full'/);
assert.match(consolidated, /github\.event_name == 'workflow_dispatch' && inputs\.mode == 'full-browser'/);
assert.match(consolidated, /github\.event_name == 'pull_request' && github\.event\.action == 'ready_for_review'/);
assert.match(consolidated, /ash_browser_shard:[\s\S]*?needs: scope/);
assert.match(consolidated, /ash_browser_shard:[\s\S]*?needs\.scope\.outputs\.validation_scope == 'full'/);
assert.match(consolidated, /giving_browser:[\s\S]*?needs\.scope\.outputs\.validation_scope == 'giving'[\s\S]*?needs\.scope\.outputs\.validation_scope == 'practice'/);
assert.match(consolidated, /browser: \[chromium, firefox, webkit\]/);
assert.match(consolidated, /max-parallel: 3/);
assert.match(consolidated, /playwright install --with-deps "\$\{\{ matrix\.browser \}\}"/);
assert.match(consolidated, /Run front-line A8 A12 and lifecycle preflight for this engine/);
assert.match(consolidated, /Run core extended and Flow-Core lanes in parallel/);
assert.match(consolidated, /td613-browser-shard-\$\{\{ matrix\.browser \}\}/);
assert.match(consolidated, /Collect surviving browser evidence shards/);
assert.match(consolidated, /needs: \[contracts, scope, ash_browser_shard\]/);
assert.match(consolidated, /ash-a13-demo-registry-browser-probe\.mjs/);
assert.match(consolidated, /ash-a14-archive-browser-probe\.mjs/);
assert.match(consolidated, /giving-browser-probe\.mjs/);
for (const stepName of ['Validate Dome-World static surfaces', 'Validate Phase IV static surfaces', 'Validate Ash core and ingress surfaces', 'Validate Ash A9 Work', 'Validate Flow-Core P0-P10 completion']) {
  assert.match(consolidated, new RegExp(`${stepName.replaceAll('-', '\\-')}\\n\\s+if: needs\\.scope\\.outputs\\.validation_scope != 'giving'`));
}
assert.equal(fs.existsSync('.github/workflows/ash-keep-aia3-production-observation.yml'), false);

assert.match(law, /operator authorization → assistant\/Codex execution → one Vercel deployment/);
assert.match(law, /one deployable fallback commit → immediate relock → production observation/);
assert.match(law, /The operator is not required to operate Vercel, GitHub Actions, or deployment plumbing/);
assert.match(law, /direct token bridge/);
assert.match(law, /bounded Git fallback/);
assert.match(law, /source_packet_commit/);
assert.match(law, /scope-aligned three-engine evidence before merge/i);
assert.match(law, /scope-aligned bounded Chromium production confirmation/i);
assert.match(law, /stale-queue stability window/i);
assert.match(law, /independent relock safety/i);

console.log('vercel-operator-release-gate.test.mjs passed for one-commit fallback admission, receipt-bound settlement, immediate relock, stale-queue stability, and bounded scope-aligned production confirmation');