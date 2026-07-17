import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const core = read('scripts/ash-keep-production-probe.mjs');
const coreRunner = read('scripts/run-ash-keep-production-probe.mjs');
const convergenceRunner = read('scripts/run-ash-constitutional-convergence-probe.mjs');
const profileFixtureCompiler = read('scripts/prepare-ash-profile-closure-fixture.mjs');
const lifecycle = read('scripts/ash-lifecycle-production-probe.mjs');

for (const [label, source] of [['core', core], ['lifecycle', lifecycle]]) {
  assert.match(source, /window\.__td613AshPremiumUI\?\.open/,
    `${label} observer does not use the guided premium workspace API`);
  assert.match(source, /window\.__td613OpenAshWorkspace/,
    `${label} observer omitted the guided compatibility bridge`);
  assert.match(source, /window\.__td613AshKeep\?\.openWorkspace/,
    `${label} observer omitted the canonical core fallback`);
  assert.match(source, /Ash guided workspace API is unavailable/,
    `${label} observer omitted an explicit guided-navigation hold`);
  assert.doesNotMatch(source, /page\.locator\(`?\.work-tab\[data-workspace=/,
    `${label} observer retained a direct hidden-tab click`);
}

assert.match(core, /dataset\.ashPremiumWorkspace/);
assert.match(coreRunner, /CLASSIFY_INTENTIONAL_HORIZONTAL_SCROLL_LANES_SEPARATELY_FROM_CLIPPING/);
assert.match(convergenceRunner, /window\.__td613AshPremiumUI\?\.open/);
assert.match(convergenceRunner, /open\('test'\)/);
assert.match(convergenceRunner, /open\('map'\)/);
assert.match(convergenceRunner, /workspace-test/);
assert.match(convergenceRunner, /workspace-map/);
assert.match(convergenceRunner, /guided workspace migration was not materialized/);
assert.match(convergenceRunner, /selectOption\('political_campaign'\)/);
assert.match(convergenceRunner, /Harbor City Mayoral Campaign/);
assert.match(convergenceRunner, /profile_selected_explicitly: true/);
assert.match(convergenceRunner, /window\.__td613AshProfileDemos\?\.profiles\?\.includes/);
assert.match(convergenceRunner, /explicit profile readiness gate was not materialized/);
assert.doesNotMatch(convergenceRunner, /await page\.locator\('#startDemo'\)\.click\(\);\n  await page\.waitForFunction\(\(\) => \/Glasshouse Archive/,
  'Convergence observer retained an unprofiled legacy demo launch');
assert.doesNotMatch(convergenceRunner, /const runtime = source\.replace\(readinessTarget, readinessReplacement\)\.replace\(deletionTarget/);
assert.match(profileFixtureCompiler, /profile_demo_registry_ready: true/);
assert.match(profileFixtureCompiler, /profile_selected_explicitly: true/);
assert.match(profileFixtureCompiler, /window\.__td613AshProfileDemos\?\.profiles\?\.includes\('political_campaign'\)/);
assert.match(profileFixtureCompiler, /function isConvergencePrepared/);
assert.doesNotMatch(profileFixtureCompiler, /profile_demo_ready: true/,
  'Closure fixture compiler still recognizes the superseded convergence readiness marker');
assert.match(lifecycle, /selectOption\('political_campaign'\)/);
assert.match(lifecycle, /Harbor City Mayoral Campaign/);
assert.match(lifecycle, /node_kickoff, node_launch_message, node_press_inquiry/);
assert.match(lifecycle, /td613\.ash\.cache-flush\.epoch/);
assert.match(lifecycle, /preCustodyExactState === 'READINESS_OBSERVED'/);
assert.match(lifecycle, /pre_custody_exact_state: preCustodyExactState/);
assert.match(lifecycle, /test_workspace_navigable: true/);
assert.doesNotMatch(lifecycle, /#workspace-test \.workspace-lifecycle-note/,
  'Lifecycle observer still requires an internal state token to remain visible copy');
assert.doesNotMatch(lifecycle, /navigationNote/,
  'Lifecycle observer still conflates visible guidance with exact lifecycle state');
assert.match(lifecycle, /Authenticated capsule opened[\s\S]*openWorkspace\(page, 'save'\)[\s\S]*#capsulePassphrase/,
  'Lifecycle observer does not return to the guided Capsule workspace after authenticated import');
assert.match(lifecycle, /guided Capsule return before tamper assay/,
  'Lifecycle observer compiler does not name the post-import return seam');

for (const source of [core, coreRunner, convergenceRunner, lifecycle]) {
  assert.doesNotMatch(source, /prediction_authorized\s*:\s*true/);
  assert.doesNotMatch(source, /automatic_action_authorized\s*:\s*true/);
  assert.doesNotMatch(source, /recipient_transport\s*:\s*true/);
}

console.log('ash-guided-observer-contract.test.mjs passed');
