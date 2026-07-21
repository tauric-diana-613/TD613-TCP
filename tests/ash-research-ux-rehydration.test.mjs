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
const premium = read('app/dome-world/ash-premium-ui.js');
const lifecycle = read('app/dome-world/ash-lifecycle-core.js');
const probe = read('scripts/ash-research-ux-browser-probe.mjs');
const workflow = read('.github/workflows/ash-research-ux.yml');

assert.equal(ASH_RESEARCH_DEMO_VERSION, 'td613.ash.research-demo/v0.3-child-legible-surface-ledger');
assert.equal(ASH_RESEARCH_SURFACE_LEDGER_VERSION, 'td613.ash.research-surface-ledger/v0.1');
assert.equal(ASH_RESEARCH_CONTROL_STATE_VERSION, 'td613.ash.research-control-state/v0.4-child-legible-ledger');

const fixture = buildResearchFixture();
assert.equal(fixture.profile.demo_id, 'demo_research_lumen_atlas_v3');
assert.match(fixture.profile.title, /Lumen Atlas Research Project/);
assert.match(fixture.profile.plain_language_question, /how much of the cooling claim can responsibly remain/i);
assert.deepEqual(fixture.counts, { rooms:14, nodes:72, relationships:112, rules:8, routes:6, controls:12, held_outs:8, strata:10 });
assert.deepEqual({
  rooms:fixture.rooms.length,
  nodes:fixture.nodes.length,
  relationships:fixture.relationships.length,
  rules:fixture.rules.length,
  routes:fixture.routes.entries.length,
  controls:fixture.assay.controls.length,
  held_outs:fixture.assay.held_outs.length,
  strata:fixture.assay.strata.length
}, fixture.counts, 'Research declarations drifted from the generated fixture.');
const localRelationships = fixture.relationships.filter(edge => !edge.id.startsWith('edge_cross_'));
const crossRelationships = fixture.relationships.filter(edge => edge.id.startsWith('edge_cross_'));
assert.equal(localRelationships.length, 58, 'Research local chains must reflect twelve five-node Rooms and two six-node Rooms.');
assert.equal(crossRelationships.length, 54, 'Research cross-room graph must complete the 112-relation fixture without overfilling it.');
assert.equal(fixture.assay.maximum_assurance, 'PA2_LOCALLY_EXECUTED');
assert.equal(fixture.assay.unknown_readers, 'UNMEASURED');
assert.equal(fixture.assay.universal_secrecy, false);
assert.match(fixture.assay.claim_ceiling, /NO_EMPIRICAL_RECOVERY_CAUSAL_ATTRIBUTION_OR_ENDPOINT_CLAIM/);
assert.match(fixture.defaults.research_notes, /performs no provider call, custody binding, Rebuild Test, release, Save Point, Capsule export, destination handoff/i);
assert.match(fixture.defaults.draft.body, /No causal, individual, universal, or policy claim is authorized/);

const expectedPostures = new Set(['HYDRATED_VIEW', 'READY_FOR_GESTURE', 'HELD_BY_LIFECYCLE', 'INTENTIONALLY_DORMANT', 'SEPARATE_BOUNDARY']);
assert(ASH_RESEARCH_SURFACE_PLAN.length >= 25, 'Research surface plan is too shallow to audit the current UI.');
assert.deepEqual(new Set(ASH_RESEARCH_SURFACE_PLAN.map(item => item.expected)), expectedPostures);
for (const item of ASH_RESEARCH_SURFACE_PLAN) {
  assert(item.id && item.label && item.selector && item.reason, `Incomplete surface plan entry: ${JSON.stringify(item)}`);
}
for (const required of ['home_view', 'map_view', 'work_view', 'custody_view', 'choir_view', 'capsule_view', 'rebuild_execution', 'provider_approval', 'release_approval', 'unexpected_detail', 'imported_reader', 'capsule_passphrase', 'destination_handoff']) {
  assert(ASH_RESEARCH_SURFACE_PLAN.some(item => item.id === required), `Research surface plan omitted ${required}.`);
}
for (const dormant of ASH_RESEARCH_SURFACE_PLAN.filter(item => item.expected === 'INTENTIONALLY_DORMANT')) {
  assert(dormant.idle, `Intentionally dormant surface lacks an idle-state test: ${dormant.id}`);
}

const roomIds = new Set(fixture.rooms.map(room => room.id));
const nodeIds = new Set(fixture.nodes.map(node => node.id));
const edgeIds = new Set(fixture.relationships.map(edge => edge.id));
assert.equal(roomIds.size, fixture.rooms.length);
assert.equal(nodeIds.size, fixture.nodes.length);
assert.equal(edgeIds.size, fixture.relationships.length);
for (const node of fixture.nodes) assert(roomIds.has(node.room_id), `Unknown Research Room: ${node.id}`);
for (const edge of fixture.relationships) {
  assert(nodeIds.has(edge.from), `Unknown Research edge source: ${edge.id}`);
  assert(nodeIds.has(edge.to), `Unknown Research edge target: ${edge.id}`);
}
for (const rule of fixture.rules) {
  for (const roomId of rule.allowed_room_ids) assert(roomIds.has(roomId), `Unknown Research rule Room: ${roomId}`);
  for (const edgeId of rule.local_link_keys) assert(edgeIds.has(edgeId), `Unknown Research rule edge: ${edgeId}`);
}
for (const route of fixture.routes.entries) {
  assert.match(route.draft_digest, /^sha256:[0-9a-f]{64}$/);
  for (const reference of route.disclosed_opaque_references) assert(nodeIds.has(reference), `Unknown Research route reference: ${reference}`);
}

const caseMap = await compileCaseMap({
  profile:'research',
  caseId:'case_demo_research_lumen_atlas_v3',
  title:fixture.profile.title,
  rooms:fixture.rooms,
  nodes:fixture.nodes,
  relationships:fixture.relationships,
  privateChronology:fixture.profile.chronology,
  intendedActions:fixture.profile.actions,
  sourceStatus:'SIMULATED',
  evidenceBasis:['synthetic child-legible Research project and interface-cartography fixture'],
  observations:fixture.profile.observations,
  missingness:fixture.profile.missingness,
  alternatives:fixture.profile.alternatives,
  openQuestions:fixture.profile.open_questions,
  operatorNotes:['demo_profile:research', 'surface_ledger:enabled', 'automatic_actions:none']
});
const roomRules = await compileRoomRules({ caseId:caseMap.case_id, rules:fixture.rules, sourceStatus:'SIMULATED' });
const routeMemory = await compileRouteMemory({
  caseId:caseMap.case_id,
  entries:fixture.routes.entries,
  operatorDeclaredAssumptions:fixture.routes.operator_declared_assumptions,
  unknown:fixture.routes.unknown,
  sourceStatus:'SIMULATED'
});
assert.equal(await verifyCaseMap(caseMap), true);
assert.equal(await verifyRoomRules(roomRules), true);
assert.equal(await verifyRouteMemory(routeMemory), true);

for (const token of [
  'auditResearchSurfaces',
  'researchHydrationLedger',
  'researchMethodDocket',
  'BLOCKED_OR_MISSING',
  'BLOCKED_UNEXPECTEDLY',
  'OVERHYDRATED_REVIEW',
  'DORMANT_AS_DESIGNED',
  'SEPARATE_BOUNDARY',
  'HELD_BY_LIFECYCLE',
  'AVAILABLE_AFTER_PRIOR_STATE',
  'surface_ledger:enabled',
  'automatic_actions:none',
  'waitForOpenComposition',
  'composition?.route_count >= 4',
  'composition?.task_count >= 4'
]) assert(source.includes(token), `Research hydration omitted ${token}.`);

assert.match(source, /setValue\('unexpectedText', ''\)/);
assert.match(source, /setValue\('importedReaderOutput', ''\)/);
assert.match(source, /setChecked\('providerApproval', false\)/);
assert.match(source, /provider_approval[\s\S]*INTENTIONALLY_DORMANT/);
assert.match(source, /release_approval[\s\S]*INTENTIONALLY_DORMANT/);
assert.match(source, /capsule_passphrase[\s\S]*INTENTIONALLY_DORMANT/);
assert.match(source, /destination_handoff[\s\S]*SEPARATE_BOUNDARY/);
assert.doesNotMatch(source, /\.click\(\)|fetch\(|sendBeacon|providerApproval', true|approveRelease', true|knownBefore', true/);
assert.doesNotMatch(source, /automatic_action_authorized:true|promotion_authorized:true|universal_secrecy:true/);

assert.match(controls, /Open Research project demo/);
assert.match(controls, /Opening Research project/);
assert.doesNotMatch(controls, /Start Research qualification demo|Hydrating Research method/);
assert.match(bridge, /ash-research-demo-hydration\.js\?v=20260721-legal-demo-ux-v1/);
assert.match(bridge, /ash-research-demo-control-state\.js\?v=20260721-legal-demo-ux-v1/);
for (const id of ['workspace-home', 'workspace-work', 'workspace-choir', 'workspace-capsule']) assert.match(premium, new RegExp(id));
for (const id of ['workspace-custody', 'compileQuickScan', 'registerCustodyRoot', 'bindCustodyRoot']) assert.match(lifecycle, new RegExp(id));

assert.match(probe, /profile=research/);
assert.match(probe, /__td613AshResearchSurfaceReport/);
assert.match(probe, /DORMANT_AS_DESIGNED/);
assert.match(probe, /BLOCKED_OR_MISSING/);
assert.match(probe, /OVERHYDRATED_REVIEW/);
assert.match(workflow, /browser: \[chromium, firefox, webkit\]/);
assert.match(workflow, /ash-research-ux-browser-probe\.mjs/);

console.log('ash-research-ux-rehydration.test.mjs passed');
