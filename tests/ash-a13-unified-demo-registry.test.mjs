import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  ASH_DEMO_REGISTRY_VERSION,
  ASH_DEMO_ASSET_EPOCH,
  getAshDemoRegistrySnapshot
} from '../app/dome-world/ash-demo-registry.js';

const registrySource = fs.readFileSync('app/dome-world/ash-demo-registry.js', 'utf8');
const wrapperSource = fs.readFileSync('app/dome-world/ash-profile-demo-hydration.js', 'utf8');
const bridgeSource = fs.readFileSync('app/dome-world/ash-workspace-bridge.js', 'utf8');
const workflowSource = fs.readFileSync('.github/workflows/td613-ci.yml', 'utf8');
const estateSource = fs.readFileSync('tests/workflow-estate.test.mjs', 'utf8');

assert.equal(ASH_DEMO_REGISTRY_VERSION, 'td613.ash.demo-registry/v0.1-a13');
assert.equal(ASH_DEMO_ASSET_EPOCH, '20260724-a13-release-v1');

const snapshot = getAshDemoRegistrySnapshot();
assert.equal(snapshot.control_owner, 'ASH_DEMO_REGISTRY');
assert.deepEqual(snapshot.profiles.map(entry => entry.profile), [
  'investigation',
  'political_campaign',
  'fundraiser',
  'research',
  'legal',
  'archive'
]);
assert.deepEqual(snapshot.profiles.filter(entry => entry.promoted).map(entry => entry.profile), [
  'investigation',
  'political_campaign',
  'fundraiser',
  'research',
  'legal'
]);
assert.equal(snapshot.profiles.find(entry => entry.profile === 'archive')?.status, 'RESERVED_FOR_A14');
assert.equal(snapshot.raw_content_transport, false);
assert.equal(snapshot.automatic_ash_action, false);
assert.equal(snapshot.release_authority, false);
assert.equal(snapshot.human_review_required, true);

for (const token of [
  'pedagogy_manifest',
  'workspace_scenes',
  'aia_routes',
  'channel_grammar',
  'menu_home_mapping',
  'inspection_contract',
  'claim_ceiling',
  'missingness',
  'alternatives',
  'deterministic_test_journey',
  'static_parity',
  'reduced_motion_parity',
  'automatic_consequential_action:false'
]) assert(registrySource.includes(token), `Registry omitted ${token}.`);

assert.match(registrySource, /addEventListener\('click',[\s\S]*#startDemo[\s\S]*stopImmediatePropagation/);
assert.match(registrySource, /addEventListener\('change',[\s\S]*stopImmediatePropagation\(\)[\s\S]*true\)/);
assert.match(registrySource, /host\.__td613AshProfileDemos = registryApi/);
assert.match(registrySource, /ashDemoCompatibilityOwner/);
assert.match(registrySource, /Archive demo arrives in A14/);
assert.match(registrySource, /RESERVED_FOR_A14/);
assert.match(registrySource, /import\(`\.\/ash-apeq-paia-profile-demos\.js\?v=\$\{ASH_DEMO_ASSET_EPOCH\}`\)/);
assert.match(registrySource, /import\(`\.\/ash-research-demo-hydration\.js\?v=\$\{ASH_DEMO_ASSET_EPOCH\}`\)/);
assert.match(registrySource, /import\(`\.\/ash-legal-profile-demo\.js\?v=\$\{ASH_DEMO_ASSET_EPOCH\}`\)/);
assert.doesNotMatch(registrySource, /fetch\(|sendBeacon|transport_authorized:\s*true|release_authority:\s*true/);

assert.match(wrapperSource, /ash-demo-registry\.js\?v=20260724-a13-release-v1/);
assert.match(bridgeSource, /ash-profile-demo-hydration\.js\?v=20260724-a13-release-v1/);
assert.doesNotMatch(bridgeSource, /^import .*ash-investigation-demo-hydration\.js/m);
assert.doesNotMatch(bridgeSource, /^import .*ash-research-demo-hydration\.js/m);
assert.doesNotMatch(bridgeSource, /^import .*ash-research-demo-control-state\.js/m);
assert.doesNotMatch(bridgeSource, /^import .*ash-legal-demo-control-state\.js/m);

assert.match(workflowSource, /TD613 Consolidated Validation/);
assert.match(workflowSource, /types:\s*\[opened, synchronize, reopened, ready_for_review\]/);
assert.match(workflowSource, /One exact-head Chromium Firefox WebKit witness/);
assert.match(workflowSource, /github\.event_name == 'workflow_dispatch' && inputs\.mode == 'full-browser'/);
assert.match(workflowSource, /github\.event_name == 'pull_request' && github\.event\.action == 'ready_for_review'/);
assert.match(workflowSource, /ash-a13-demo-registry-browser-probe\.mjs/);
assert.doesNotMatch(workflowSource, /github\.event\.action == 'synchronize'[\s\S]*playwright install/);
assert.match(estateSource, /exactly four durable authority surfaces/);

console.log('ash-a13-unified-demo-registry.test.mjs passed');
