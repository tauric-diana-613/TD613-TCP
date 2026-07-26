import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  ASH_A15_EMPIRICAL_VERSION,
  ASH_A15_WORLD_ANSWER_SCHEMA,
  ASH_A15_ACTION_ID,
  ASH_A15_PROFILES,
  ASH_A15_WORKSPACES,
  ASH_A15_ROUTES,
  compileAshA15WorldAnswer,
  compileAshA15Matrix,
  containsSensitiveContext,
  publicAnswerLeaksOntology
} from '../app/dome-world/ash-a15-empirical-profile-journeys.js';
import {
  ASH_DEMO_REGISTRY_VERSION,
  ASH_DEMO_ASSET_EPOCH,
  getAshDemoRegistrySnapshot
} from '../app/dome-world/ash-demo-registry.js';

const source = fs.readFileSync('app/dome-world/ash-a15-empirical-profile-journeys.js', 'utf8');
const registry = fs.readFileSync('app/dome-world/ash-demo-registry.js', 'utf8');
const wrapper = fs.readFileSync('app/dome-world/ash-profile-demo-hydration.js', 'utf8');
const bridge = fs.readFileSync('app/dome-world/ash-workspace-bridge.js', 'utf8');
const workflow = fs.readFileSync('.github/workflows/td613-ci.yml', 'utf8');
const browserProbe = fs.readFileSync('scripts/ash-a15-empirical-profile-journeys-browser-probe.mjs', 'utf8');
const amendment = fs.readFileSync('app/dome-world/docs/ASH_KEEP_A12_A15_OPERATOR_AMENDMENT_V0_1.md', 'utf8');
const shell = fs.readFileSync('api/dome-world-shell.js', 'utf8');
const eviction = fs.readFileSync('app/dome-world/ash-cache-eviction-aia3.js', 'utf8');
const receipt = fs.readFileSync('app/dome-world/docs/ASH_KEEP_A15_EMPIRICAL_PROFILE_JOURNEY_IMPLEMENTATION_RECEIPT_V0_1.md', 'utf8');
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

assert.equal(ASH_A15_EMPIRICAL_VERSION, 'td613.ash.a15-empirical-profile-journeys/v0.1');
assert.equal(ASH_A15_WORLD_ANSWER_SCHEMA, 'td613.ash.a15-profile-world-answer/v0.1');
assert.equal(ASH_A15_ACTION_ID, 'orient_next_bounded_action');
assert.deepEqual(ASH_A15_PROFILES, ['investigation','political_campaign','fundraiser','research','legal','archive']);
assert.deepEqual(ASH_A15_WORKSPACES, ['home','map','work','choir','capsule']);
assert.deepEqual(ASH_A15_ROUTES, ['experimental','custodial','audit','implementation']);
assert.equal(ASH_DEMO_REGISTRY_VERSION, 'td613.ash.demo-registry/v0.3-a15');
assert.equal(ASH_DEMO_ASSET_EPOCH, '20260726-a15-empirical-v1');

const matrix = compileAshA15Matrix();
assert.equal(matrix.length, 120);
assert.equal(new Set(matrix.map(answer => `${answer.profile}:${answer.workspace}:${answer.route}`)).size, 120);
for (const answer of matrix) {
  assert.equal(answer.status, 'READY');
  assert.equal(answer.synthetic_fixture, true);
  assert.equal(answer.context_imported, false);
  assert.equal(answer.real_world_claim, false);
  assert.equal(answer.ontology_exposed, false);
  assert.equal(answer.authority.custody_changed, false);
  assert.equal(answer.authority.source_bytes_moved, false);
  assert.equal(answer.authority.raw_content_transport, false);
  assert.equal(answer.authority.consequential_action, false);
  assert.equal(answer.authority.release_authority, false);
  assert.equal(answer.authority.destination_authority, false);
  assert.equal(answer.authority.human_review_required, true);
  assert.equal(answer.authority.human_closure_required, true);
  assert.equal(publicAnswerLeaksOntology(answer.message), false);
}

for (const workspace of ASH_A15_WORKSPACES) {
  for (const route of ASH_A15_ROUTES) {
    const answers = ASH_A15_PROFILES.map(profile => compileAshA15WorldAnswer({ profile, workspace, route }));
    assert.equal(new Set(answers.map(answer => answer.message)).size, 6, `${workspace}/${route} collapsed six profiles into one answer.`);
    assert.equal(new Set(answers.map(answer => answer.claim_ceiling)).size, 6, `${workspace}/${route} collapsed six claim ceilings.`);
  }
}

const experientialAlias = compileAshA15WorldAnswer({ profile:'research', workspace:'map', route:'EXPERIENTIAL' });
assert.equal(experientialAlias.route, 'experimental');
assert.equal(experientialAlias.status, 'READY');

for (const context of [
  'person@example.com',
  '904-555-1212',
  '123-45-6789',
  'api_key = abc123',
  '-----BEGIN PRIVATE KEY-----'
]) {
  assert.equal(containsSensitiveContext(context), true);
  const held = compileAshA15WorldAnswer({ profile:'legal', workspace:'work', route:'audit', context });
  assert.equal(held.status, 'HELD_SENSITIVE_CONTEXT');
  assert.equal(held.context_imported, false);
  assert.equal(held.authority.consequential_action, false);
  assert.doesNotMatch(held.message, new RegExp(context.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

const incomplete = compileAshA15WorldAnswer({ profile:'archive', workspace:'outside', route:'audit' });
assert.equal(incomplete.status, 'HELD_INCOMPLETE_ROUTE');
const unknownAction = compileAshA15WorldAnswer({ profile:'archive', workspace:'map', route:'audit', action_id:'perform_transfer' });
assert.equal(unknownAction.status, 'HELD_UNKNOWN_ACTION');

const snapshot = getAshDemoRegistrySnapshot();
assert.equal(snapshot.control_owner, 'ASH_DEMO_REGISTRY');
assert.equal(snapshot.profiles.length, 6);
assert.equal(snapshot.profiles.filter(entry => entry.promoted).length, 6);
assert.equal(snapshot.empirical_journey_version, ASH_A15_EMPIRICAL_VERSION);
assert.equal(snapshot.empirical_matrix_cells, 120);
assert.equal(snapshot.raw_content_transport, false);
assert.equal(snapshot.automatic_ash_action, false);
assert.equal(snapshot.release_authority, false);

for (const token of [
  "import(`./ash-a15-empirical-profile-journeys.js?v=${ASH_DEMO_ASSET_EPOCH}`)",
  'installAshA15EmpiricalJourneys',
  'empirical_journey_version',
  'empirical_matrix_cells',
  'ash-a15-empirical-journey:${profile}'
]) assert.ok(registry.includes(token), `A15 registry omitted ${token}`);

for (const token of [
  'ashA15EmpiricalJourney','ashA15OrientAction','ashA15WorldAnswer','td613:ash:a15-world-answer',
  'HELD_SENSITIVE_CONTEXT','real_world_claim:false','ontology_exposed:false','context_imported:false'
]) assert.ok(source.includes(token), `A15 source omitted ${token}`);

for (const pattern of [
  /fetch\s*\(/,/sendBeacon/,/XMLHttpRequest/,/indexedDB\./,/localStorage\.(?:setItem|removeItem|clear)/,
  /sessionStorage\.(?:setItem|removeItem|clear)/,/caches\./,/serviceWorker/,/new\s+(?:Worker|SharedWorker)/
]) assert.doesNotMatch(source, pattern);
assert.doesNotMatch(source, /custody_changed:true|source_bytes_moved:true|raw_content_transport:true|consequential_action:true|release_authority:true|destination_authority:true/);

assert.match(wrapper, /20260726-a15-empirical-v1/);
assert.match(bridge, /ash-profile-demo-hydration\.js\?v=20260726-a15-empirical-v1/);
assert.match(workflow, /Validate Ash A15 empirical profile journeys/);
assert.match(workflow, /ash-a15-empirical-profile-journeys-browser-probe\.mjs/);
assert.match(browserProbe, /matrix_cells:120/);
assert.match(browserProbe, /HELD_SENSITIVE_CONTEXT/);
assert.match(receipt, /120 deterministic cells/);
assert.match(receipt, /graph-wide mass eviction executed: false/);
assert.match(amendment, /single graph-wide mass eviction[\s\S]*A15 postclosure/);
const massEpoch = 'td613.ash.cache-flush/2026-07-24-a11-postclosure-v1';
assert.ok(shell.includes(`ASH_MASS_EVICTION_EPOCH = '${massEpoch}'`));
assert.ok(eviction.includes(`ASH_AIA3_CACHE_EPOCH = '${massEpoch}'`));
assert.equal(vercel.git?.deploymentEnabled, false);

console.log(JSON.stringify({
  ok:true,
  schema:'td613.ash.a15-empirical-profile-journey-contract/v0.1',
  registry_version:ASH_DEMO_REGISTRY_VERSION,
  asset_epoch:ASH_DEMO_ASSET_EPOCH,
  profiles:ASH_A15_PROFILES.length,
  workspaces:ASH_A15_WORKSPACES.length,
  routes:ASH_A15_ROUTES.length,
  matrix_cells:matrix.length,
  sensitive_context_imported:false,
  ontology_leakage:false,
  false_real_world_claims:false,
  graph_wide_mass_eviction_executed:false,
  custody_authority_changed:false,
  raw_content_transport:false,
  release_authority:false,
  human_closure_required:true,
  vercel_gate:'CLOSED'
}, null, 2));
