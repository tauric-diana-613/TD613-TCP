import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const core = read('scripts/ash-keep-production-probe.mjs');
const coreRunner = read('scripts/run-ash-keep-production-probe.mjs');
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
assert.match(lifecycle, /selectOption\('political_campaign'\)/);
assert.match(lifecycle, /Harbor City Mayoral Campaign/);
assert.match(lifecycle, /node_kickoff, node_launch_message, node_press_inquiry/);
assert.match(lifecycle, /td613\.ash\.cache-flush\.epoch/);
assert.match(lifecycle, /test_workspace_navigable: true/);

for (const source of [core, lifecycle]) {
  assert.doesNotMatch(source, /prediction_authorized\s*:\s*true/);
  assert.doesNotMatch(source, /automatic_action_authorized\s*:\s*true/);
  assert.doesNotMatch(source, /recipient_transport\s*:\s*true/);
}

console.log('ash-guided-observer-contract.test.mjs passed');
