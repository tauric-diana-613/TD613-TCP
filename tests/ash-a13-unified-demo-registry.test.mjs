import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');
const registryPath = path.join(root, 'app/dome-world/ash-demo-registry.js');
const preflightPath = path.join(root, 'app/dome-world/ash-demo-registry-preflight.js');
const wrapperPath = path.join(root, 'app/dome-world/ash-profile-demo-hydration.js');
const bridgePath = path.join(root, 'app/dome-world/ash-workspace-bridge.js');
const operatorAmendmentPath = path.join(root, 'app/dome-world/docs/ASH_KEEP_A12_A15_OPERATOR_AMENDMENT_V0_1.md');
const registrySource = fs.readFileSync(registryPath, 'utf8');
const preflightSource = fs.readFileSync(preflightPath, 'utf8');
const wrapperSource = fs.readFileSync(wrapperPath, 'utf8');
const bridgeSource = fs.readFileSync(bridgePath, 'utf8');
const operatorAmendment = fs.readFileSync(operatorAmendmentPath, 'utf8');

const {
  ASH_DEMO_REGISTRY_VERSION,
  ASH_DEMO_REGISTRY_ASSET_EPOCH,
  ASH_DEMO_REGISTRY,
  ASH_NON_PROMOTED_PROFILES
} = await import(pathToFileURL(registryPath));

assert.equal(ASH_DEMO_REGISTRY_VERSION, 'td613.ash.unified-six-demo-registry/v0.1');
assert.equal(ASH_DEMO_REGISTRY_ASSET_EPOCH, '20260724-a13-release-v1');
assert.deepEqual(Object.keys(ASH_DEMO_REGISTRY), [
  'investigation',
  'political_campaign',
  'fundraiser',
  'research',
  'legal',
  'archive'
]);
assert.deepEqual([...ASH_NON_PROMOTED_PROFILES], ['organizing', 'unpublished']);

for (const [profile, entry] of Object.entries(ASH_DEMO_REGISTRY)) {
  assert.equal(entry.profile, profile);
  assert(entry.demo_id.length > 10, `${profile}: demo id missing.`);
  assert(entry.pedagogy_manifest, `${profile}: pedagogy manifest missing.`);
  assert(entry.workspace_scenes.length >= 5, `${profile}: workspace scene contract incomplete.`);
  assert.deepEqual(entry.aia_route_views.map(route => route.label), [
    'Learn by doing',
    'Protect the source',
    'Check the evidence',
    'Inspect the machinery'
  ]);
  assert.deepEqual([...entry.channel_grammar], ['Glyph', 'Motion', 'Shape', 'Language', 'Inspection']);
  assert.equal(entry.inspection_contract.technical_state_available, true);
  assert.equal(entry.inspection_contract.technical_state_compulsory, false);
  assert.equal(entry.inspection_contract.source_content_exposed, false);
  assert(entry.claim_ceiling.length > 30, `${profile}: claim ceiling missing.`);
  assert(entry.missingness.length > 0, `${profile}: missingness missing.`);
  assert(entry.alternatives.length > 0, `${profile}: alternatives missing.`);
  assert(entry.deterministic_test_journey.length >= 4, `${profile}: deterministic journey missing.`);
  assert.equal(entry.static_parity, true);
  assert.equal(entry.reduced_motion_parity, true);
  assert.equal(entry.automatic_consequential_ash_action, false);
  assert.equal(entry.custody_authority_changed, false);
  assert.equal(entry.release_authority_changed, false);
  assert.equal(entry.human_gesture_required, true);
}

assert.equal(Object.values(ASH_DEMO_REGISTRY).filter(entry => entry.promotion_state === 'PROMOTED').length, 5);
assert.equal(ASH_DEMO_REGISTRY.archive.promotion_state, 'RESERVED_FOR_A14');
assert.equal(ASH_DEMO_REGISTRY.archive.available, false);
assert.equal(ASH_DEMO_REGISTRY.archive.profile_fixture, 'HELD_FOR_A14');
assert.match(ASH_DEMO_REGISTRY.archive.claim_ceiling, /RESERVED_FOR_A14/);

assert.match(preflightSource, /__td613AshDemoRegistryOwnsControls = true/);
assert.match(preflightSource, /addEventListener\('click', captureDemoGesture, true\)/);
assert.match(preflightSource, /addEventListener\('change', captureProfileChange, true\)/);
assert.match(preflightSource, /stopImmediatePropagation/);
assert.doesNotMatch(preflightSource, /MutationObserver|setInterval/);
assert.match(registrySource, /control_owner:'UNIFIED_REGISTRY'/);
assert.match(registrySource, /automatic_consequential_ash_action:false/);
assert.match(registrySource, /registerAshDemoAdapter/);
assert.match(registrySource, /Archive demo arrives in A14/);
assert.match(wrapperSource, /ash-demo-registry-preflight\.js\?v=20260724-a13-release-v1/);
assert.match(wrapperSource, /ash-demo-registry\.js\?v=20260724-a13-release-v1/);
assert.match(bridgeSource, /ash-profile-demo-hydration\.js\?v=20260724-a13-release-v1/);
assert.doesNotMatch(bridgeSource, /ash-research-demo-control-state\.js|ash-legal-demo-control-state\.js/);

assert.match(operatorAmendment, /A11 postclosure is the accepted runtime baseline/);
assert.match(operatorAmendment, /A12 through A14[\s\S]*MUST NOT execute a graph-wide cache flush/);
assert.match(operatorAmendment, /mass eviction[\s\S]*A15 postclosure/i);

console.log('ash-a13-unified-demo-registry.test.mjs passed');
