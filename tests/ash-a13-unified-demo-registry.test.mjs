import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  ASH_DEMO_REGISTRY_VERSION,
  ASH_DEMO_ASSET_EPOCH,
  getAshDemoRegistrySnapshot
} from '../app/dome-world/ash-demo-registry.js';

const registrySource = fs.readFileSync('app/dome-world/ash-demo-registry.js', 'utf8');
const archiveSource = fs.readFileSync('app/dome-world/ash-archive-profile-demo.js', 'utf8');
const empiricalSource = fs.readFileSync('app/dome-world/ash-a15-empirical-profile-journeys.js', 'utf8');
const wrapperSource = fs.readFileSync('app/dome-world/ash-profile-demo-hydration.js', 'utf8');
const promptSource = fs.readFileSync('app/dome-world/ash-profile-prompt-canonical.js', 'utf8');
const bridgeSource = fs.readFileSync('app/dome-world/ash-workspace-bridge.js', 'utf8');
const workflowSource = fs.readFileSync('.github/workflows/td613-ci.yml', 'utf8');
const estateSource = fs.readFileSync('tests/workflow-estate.test.mjs', 'utf8');

assert.equal(ASH_DEMO_REGISTRY_VERSION, 'td613.ash.demo-registry/v0.3-a15');
assert.equal(ASH_DEMO_ASSET_EPOCH, '20260726-a15-empirical-v1');

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
  'legal',
  'archive'
]);
assert.equal(snapshot.profiles.find(entry => entry.profile === 'archive')?.status, 'PROMOTED');
assert.equal(snapshot.profiles.find(entry => entry.profile === 'archive')?.owner, 'ARCHIVE');
assert.equal(snapshot.empirical_journey_version, 'td613.ash.a15-empirical-profile-journeys/v0.1');
assert.equal(snapshot.empirical_matrix_cells, 120);
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
  'automatic_consequential_action:false',
  'empirical_journey_version',
  'empirical_matrix_cells'
]) assert(registrySource.includes(token), `Registry omitted ${token}.`);

assert.match(registrySource, /addEventListener\('click',[\s\S]*#startDemo[\s\S]*stopImmediatePropagation/);
assert.match(registrySource, /addEventListener\('change',[\s\S]*stopImmediatePropagation\(\)[\s\S]*true\)/);
assert.match(registrySource, /host\.__td613AshProfileDemos = registryApi/);
assert.match(registrySource, /ashDemoCompatibilityOwner/);
assert.doesNotMatch(registrySource, /Archive demo arrives in A14|RESERVED_FOR_A14|A14_RESERVED/);
assert.match(registrySource, /import\(`\.\/ash-apeq-paia-profile-demos\.js\?v=\$\{ASH_DEMO_ASSET_EPOCH\}`\)/);
assert.match(registrySource, /import\(`\.\/ash-research-demo-hydration\.js\?v=\$\{ASH_DEMO_ASSET_EPOCH\}`\)/);
assert.match(registrySource, /import\(`\.\/ash-legal-profile-demo\.js\?v=\$\{ASH_DEMO_ASSET_EPOCH\}`\)/);
assert.match(registrySource, /import\(`\.\/ash-archive-profile-demo\.js\?v=\$\{ASH_DEMO_ASSET_EPOCH\}`\)/);
assert.match(registrySource, /import\(`\.\/ash-a15-empirical-profile-journeys\.js\?v=\$\{ASH_DEMO_ASSET_EPOCH\}`\)/);
assert.match(registrySource, /installAshA15EmpiricalJourneys/);
assert.doesNotMatch(registrySource + archiveSource + empiricalSource, /fetch\(|sendBeacon|transport_authorized:\s*true|release_authority:\s*true|access_granted:\s*true|transfer_authority:\s*true/);

for (const token of [
  "doc.documentElement.dataset.ashPreCanonicalProfileChoiceBoundary = 'true'",
  "doc.addEventListener('input', receiptPreCanonicalProfileChoice, true)",
  "doc.addEventListener('change', receiptPreCanonicalProfileChoice, true)",
  'td613.ash.pre-canonical-profile-choice/v0.1',
  'ashPreCanonicalProfileChoiceRevision',
  'host.__td613AshPreCanonicalProfileChoice',
  'authority_changed:false',
  'source_bytes_moved:false',
  'human_closure_required:true'
]) assert.ok(wrapperSource.includes(token), `Registry wrapper omitted pre-canonical receipt token ${token}`);
assert.doesNotMatch(wrapperSource, /localStorage\.(?:setItem|removeItem|clear)|sessionStorage\.(?:setItem|removeItem|clear)|indexedDB|fetch\s*\(|sendBeacon/);

for (const token of [
  'td613.ash.profile-prompt-canonical/v1.2-precanonical-choice-handoff',
  'function adoptReceiptedPreCanonicalChoice(select)',
  'host.__td613AshPreCanonicalProfileChoice',
  "select.dataset.ashPreCanonicalProfileChoiceExplicit === 'true'",
  'revision === datasetRevision',
  'select.dataset.ashPreCanonicalProfileChoice === value',
  'select.value === value',
  "select.dataset.ashPreCanonicalProfileChoiceAdopted = 'true'",
  "reason:adoptedPreCanonicalChoice ? 'PRECANONICAL_EXPLICIT_CHOICE_ADOPTED' : 'INITIAL_CANONICAL_NEUTRALITY'",
  'resetSelection:!adoptedPreCanonicalChoice',
  'adopted_precanonical_revision:adoptedPreCanonicalRevision',
  'precanonical_receipt:host.__td613AshPreCanonicalProfileChoice'
]) assert.ok(promptSource.includes(token), `Canonical prompt omitted explicit handoff token ${token}`);
assert.match(promptSource, /function adoptReceiptedPreCanonicalChoice\(select\)[\s\S]{0,900}receipt\?\.explicit === true[\s\S]{0,900}select\.value === value/);
assert.match(promptSource, /const adoptedPreCanonicalChoice = adoptReceiptedPreCanonicalChoice\(initialSelect\);[\s\S]{0,360}resetSelection:!adoptedPreCanonicalChoice/);
assert.doesNotMatch(promptSource, /adoptReceiptedPreCanonicalChoice\(select\)[\s\S]{0,900}(?:localStorage\.setItem|sessionStorage\.setItem|indexedDB|fetch\s*\()/);

assert.match(wrapperSource, /ash-demo-registry\.js\?v=20260726-a15-empirical-v1/);
assert.match(wrapperSource, /hydrateArchiveDemo/);
assert.match(wrapperSource, /buildArchiveDemoFixture/);
assert.match(bridgeSource, /ash-profile-demo-hydration\.js\?v=20260726-a15-empirical-v1/);
assert.doesNotMatch(bridgeSource, /^import .*ash-investigation-demo-hydration\.js/m);
assert.doesNotMatch(bridgeSource, /^import .*ash-research-demo-hydration\.js/m);
assert.doesNotMatch(bridgeSource, /^import .*ash-research-demo-control-state\.js/m);
assert.doesNotMatch(bridgeSource, /^import .*ash-legal-demo-control-state\.js/m);

assert.match(workflowSource, /TD613 Consolidated Validation/);
assert.match(workflowSource, /types:\s*\[opened, synchronize, reopened, ready_for_review\]/);
assert.match(workflowSource, /Full-product exact-head Chromium Firefox WebKit witness/);
assert.match(workflowSource, /github\.event_name == 'workflow_dispatch' && inputs\.mode == 'full-browser'/);
assert.match(workflowSource, /github\.event_name == 'pull_request' && needs\.scope\.outputs\.validation_scope != 'giving'/);
assert.match(workflowSource, /ash-a13-demo-registry-browser-probe\.mjs/);
assert.match(workflowSource, /ash-a14-archive-browser-probe\.mjs/);
assert.match(workflowSource, /ash-a15-empirical-profile-journeys-browser-probe\.mjs/);
assert.match(estateSource, /synchronize-safe front-line three-engine shards/);

console.log('ash-a13-unified-demo-registry.test.mjs passed under A15 empirical registry ownership with pre-canonical explicit-choice handoff');