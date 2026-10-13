import assert from 'node:assert/strict';
import fs from 'node:fs';
import { webcrypto } from 'node:crypto';
if (!globalThis.crypto) globalThis.crypto = webcrypto;

import {
  compileCaseMap,
  compileRoomRules,
  compileRouteMemory,
  verifyCaseMap,
  verifyRoomRules,
  verifyRouteMemory
} from '../app/engine/ash-keep-core.js';
import {
  ASH_RESEARCH_DEMO_VERSION,
  ASH_RESEARCH_SURFACE_LEDGER_VERSION,
  ASH_RESEARCH_SURFACE_PLAN,
  buildResearchFixture
} from '../app/dome-world/ash-research-demo-hydration.js';
import { ASH_RESEARCH_CONTROL_STATE_VERSION } from '../app/dome-world/ash-research-demo-control-state.js';

const read = file => fs.readFileSync(file, 'utf8');
const source = read('app/dome-world/ash-research-demo-hydration.js');
const controls = read('app/dome-world/ash-research-demo-control-state.js');
const bridge = read('app/dome-world/ash-workspace-bridge.js');
const registry = read('app/dome-world/ash-demo-registry.js');
const premium = read('app/dome-world/ash-premium-ui.js');
const lifecycle = read('app/dome-world/ash-lifecycle-core.js');
const probe = read('scripts/ash-research-ux-browser-probe.mjs');
const probeBase = read('scripts/ash-research-ux-browser-probe-base.mjs');
const workflow = read('.github/workflows/td613-ci.yml');

assert.equal(ASH_RESEARCH_DEMO_VERSION, 'td613.ash.research-demo/v0.3-child-legible-surface-ledger');
assert.equal(ASH_RESEARCH_SURFACE_LEDGER_VERSION, 'td613.ash.research-surface-ledger/v0.1');
assert.equal(ASH_RESEARCH_CONTROL_STATE_VERSION, 'td613.ash.research-control-state/v0.4-child-legible-ledger');

const fixture = buildResearchFixture();
assert.equal(fixture.profile.demo_id, 'demo_research_lumen_atlas_v3');
assert.match(fixture.profile.title, /Lumen Atlas Research Project/);
assert.match(fixture.profile.plain_language_question, /how much of the cooling claim can responsibly remain/i);
assert.deepEqual(fixture.counts, { rooms:14, nodes:72, relationships:112, rules:8, routes:6, controls:12, held_outs:8, strata:10 });
assert.equal(fixture.relationships.filter(edge => !edge.id.startsWith('edge_cross_')).length, 58);
assert.equal(fixture.relationships.filter(edge => edge.id.startsWith('edge_cross_')).length, 54);
assert.equal(fixture.assay.maximum_assurance, 'PA2_LOCALLY_EXECUTED');
assert.equal(fixture.assay.unknown_readers, 'UNMEASURED');
assert.equal(fixture.assay.universal_secrecy, false);
assert.match(fixture.assay.claim_ceiling, /NO_EMPIRICAL_RECOVERY_CAUSAL_ATTRIBUTION_OR_ENDPOINT_CLAIM/);
assert.match(fixture.defaults.research_notes, /performs no provider call, custody binding, Rebuild Test, release, Save Point, Capsule export, destination handoff/i);

const expectedPostures = new Set(['HYDRATED_VIEW', 'READY_FOR_GESTURE', 'HELD_BY_LIFECYCLE', 'INTENTIONALLY_DORMANT', 'SEPARATE_BOUNDARY']);
assert(ASH_RESEARCH_SURFACE_PLAN.length >= 25);
assert.deepEqual(new Set(ASH_RESEARCH_SURFACE_PLAN.map(item => item.expected)), expectedPostures);
for (const item of ASH_RESEARCH_SURFACE_PLAN) assert(item.id && item.label && item.selector && item.reason);
for (const required of ['home_view','map_view','work_view','custody_view','choir_view','capsule_view','rebuild_execution','provider_approval','release_approval','unexpected_detail','imported_reader','capsule_passphrase','destination_handoff']) {
  assert(ASH_RESEARCH_SURFACE_PLAN.some(item => item.id === required), `Research surface plan omitted ${required}.`);
}

const roomIds = new Set(fixture.rooms.map(room => room.id));
const nodeIds = new Set(fixture.nodes.map(node => node.id));
const edgeIds = new Set(fixture.relationships.map(edge => edge.id));
for (const node of fixture.nodes) assert(roomIds.has(node.room_id), `Unknown Research Room: ${node.id}`);
for (const edge of fixture.relationships) {
  assert(nodeIds.has(edge.from), `Unknown Research edge source: ${edge.id}`);
  assert(nodeIds.has(edge.to), `Unknown Research edge target: ${edge.id}`);
}
for (const rule of fixture.rules) {
  for (const roomId of rule.allowed_room_ids) assert(roomIds.has(roomId));
  for (const edgeId of rule.local_link_keys) assert(edgeIds.has(edgeId));
}

const caseMap = await compileCaseMap({
  profile:'research', caseId:'case_demo_research_lumen_atlas_v3', title:fixture.profile.title,
  rooms:fixture.rooms, nodes:fixture.nodes, relationships:fixture.relationships,
  privateChronology:fixture.profile.chronology, intendedActions:fixture.profile.actions,
  sourceStatus:'SIMULATED', evidenceBasis:['synthetic child-legible Research project and interface-cartography fixture'],
  observations:fixture.profile.observations, missingness:fixture.profile.missingness,
  alternatives:fixture.profile.alternatives, openQuestions:fixture.profile.open_questions,
  operatorNotes:['demo_profile:research', 'surface_ledger:enabled', 'automatic_actions:none']
});
const roomRules = await compileRoomRules({ caseId:caseMap.case_id, rules:fixture.rules, sourceStatus:'SIMULATED' });
const routeMemory = await compileRouteMemory({ caseId:caseMap.case_id, entries:fixture.routes.entries, operatorDeclaredAssumptions:fixture.routes.operator_declared_assumptions, unknown:fixture.routes.unknown, sourceStatus:'SIMULATED' });
assert.equal(await verifyCaseMap(caseMap), true);
assert.equal(await verifyRoomRules(roomRules), true);
assert.equal(await verifyRouteMemory(routeMemory), true);

for (const token of ['auditResearchSurfaces','researchHydrationLedger','researchMethodDocket','DORMANT_AS_DESIGNED','SEPARATE_BOUNDARY','HELD_BY_LIFECYCLE','surface_ledger:enabled','automatic_actions:none','waitForOpenComposition']) {
  assert(source.includes(token), `Research hydration omitted ${token}.`);
}
assert.match(source, /setValue\('unexpectedText', ''\)/);
assert.match(source, /setChecked\('providerApproval', false\)/);
assert.doesNotMatch(source, /\.click\(\)|fetch\(|sendBeacon|automatic_action_authorized:true|promotion_authorized:true|universal_secrecy:true/);

assert.match(controls, /Open Research project demo/);
assert.doesNotMatch(bridge, /^import .*ash-research-demo-hydration\.js/m);
assert.doesNotMatch(bridge, /^import .*ash-research-demo-control-state\.js/m);
assert.match(registry, /import\(`\.\/ash-research-demo-hydration\.js\?v=\$\{ASH_DEMO_ASSET_EPOCH\}`\)/);
assert.match(registry, /owner:'RESEARCH'/);
assert.match(registry, /hydrateResearchDemo/);
assert.match(registry, /ash-a15-empirical-profile-journeys\.js\?v=\$\{ASH_DEMO_ASSET_EPOCH\}/);
for (const id of ['workspace-home','workspace-work','workspace-choir','workspace-capsule']) assert.match(premium, new RegExp(id));
for (const id of ['workspace-custody','compileQuickScan','registerCustodyRoot','bindCustodyRoot']) assert.match(lifecycle, new RegExp(id));
assert.match(probe, /profile=research/);
assert.match(probe, /__td613AshResearchSurfaceReport/);
assert.match(probe, /window\.__td613AshDemoRegistry/);
assert.match(probe, /control_owner === 'ASH_DEMO_REGISTRY'/);
assert.match(probe, /const startControlTarget/);
assert.match(probe, /const startControlReplacement/);
assert.match(probe, /replaceExactlyOnce\(source, startControlTarget, startControlReplacement, 'registry-owned Research Start Demo control'\)/);
assert.match(probe, /button\.dataset\.ashDemoRegistryOwner === 'td613\.ash\.demo-registry\/v0\.3-a15'/);
assert.match(probe, /empirical_matrix_cells === 120/);
assert.match(probe, /v0\.7-a15-registry-owned-entry-and-navigation/);
assert.match(probe, /runtime\.includes\(retired\)/);
assert.match(probe, /td613\.ash\.demo-registry\/v0\.1-a13/);
assert.match(probe, /td613\.ash\.demo-registry\/v0\.2-a14/);
assert.match(probeBase, /button\.dataset\.ashDemoRegistryOwner === 'td613\.ash\.demo-registry\/v0\.1-a13'/);
assert.doesNotMatch(probe, /__td613AshResearchControlState/);
assert.match(workflow, /ash_browser_shard:[\s\S]*?needs: scope/);
assert.match(workflow, /browser: \[chromium, firefox, webkit\]/);
assert.match(workflow, /playwright install --with-deps "\$\{\{ matrix\.browser \}\}"/);
assert.match(workflow, /Run core extended and Flow-Core lanes in parallel/);
assert.match(workflow, /node tests\/ash-research-ux-rehydration\.test\.mjs/);
assert.match(workflow, /ash-research-ux-browser-probe\.mjs/);

console.log('ash-research-ux-rehydration.test.mjs passed under A15 registry-owned entry/navigation and front-line browser shards');
