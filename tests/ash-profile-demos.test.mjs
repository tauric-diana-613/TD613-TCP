import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { webcrypto } from 'node:crypto';
import { fileURLToPath } from 'node:url';

if (!globalThis.crypto) globalThis.crypto = webcrypto;

import {
  CASE_PROFILES,
  compileCaseMap,
  compileRoomRules,
  compileRouteMemory,
  verifyCaseMap,
  verifyRoomRules,
  verifyRouteMemory
} from '../app/engine/ash-keep-core.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixtures = [
  ['political_campaign', 'app/dome-world/fixtures/ash-keep-demo-political-campaign.json', 9, 32, 34],
  ['fundraiser', 'app/dome-world/fixtures/ash-keep-demo-fundraiser.json', 10, 33, 35]
];

assert.equal(CASE_PROFILES.political_campaign, 'Campaign Map');
assert.equal(CASE_PROFILES.fundraiser, 'Fundraising Map');
assert.equal(fs.existsSync(path.join(root, 'app/dome-world/fixtures/ash-keep-demo.json')), false, 'Archaic universal demo fixture still exists.');

const bridge = fs.readFileSync(path.join(root, 'app/dome-world/ash-workspace-bridge.js'), 'utf8');
const hydration = fs.readFileSync(path.join(root, 'app/dome-world/ash-profile-demo-hydration.js'), 'utf8');
assert.match(bridge, /ash-profile-demo-hydration\.js/);
assert.match(hydration, /Select a profile…/);
assert.match(hydration, /demo-unavailable/);
assert.match(hydration, /political_campaign/);
assert.match(hydration, /fundraiser/);
assert.match(hydration, /stopImmediatePropagation/);

for (const [profile, relative, roomMinimum, nodeMinimum, edgeMinimum] of fixtures) {
  const fixture = JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
  assert.equal(fixture.schema, 'td613.ash.keep-demo/v0.2');
  assert.equal(fixture.profile, profile);
  assert.equal(fixture.source_status, 'SIMULATED');
  assert.ok(fixture.stress_targets.some(value => /Choir/.test(value)), `${profile} does not prepare future Choir stress.`);
  assert.ok(fixture.case.rooms.length >= roomMinimum);
  assert.ok(fixture.case.nodes.length >= nodeMinimum);
  assert.ok(fixture.case.relationships.length >= edgeMinimum);
  assert.ok(fixture.room_rules.length >= 5);
  assert.ok(fixture.route_memory.entries.length >= 3);
  assert.ok(fixture.disclosure_sequence.length >= 7);
  assert.ok(fixture.defaults.test_refs.length >= 5);
  assert.ok(fixture.defaults.draft.refs.length >= 3);
  assert.ok(fixture.defaults.route.refs.length >= 3);
  assert.equal(fixture.observations[0].kind, 'SYNTHETIC_PROFILE_DEMO');
  assert.equal(Object.values(fixture.observations[0]).some(value => value === true), false, 'Synthetic disclaimer unexpectedly asserted a real-world fact.');

  const roomIds = new Set(fixture.case.rooms.map(room => room.id));
  const nodeIds = new Set(fixture.case.nodes.map(node => node.id));
  const edgeIds = new Set(fixture.case.relationships.map(edge => edge.id));
  assert.equal(roomIds.size, fixture.case.rooms.length);
  assert.equal(nodeIds.size, fixture.case.nodes.length);
  assert.equal(edgeIds.size, fixture.case.relationships.length);
  for (const node of fixture.case.nodes) assert.ok(roomIds.has(node.room_id), `${profile} node ${node.id} has an unknown Room.`);
  for (const edge of fixture.case.relationships) {
    assert.ok(nodeIds.has(edge.from), `${profile} relation ${edge.id} has an unknown source.`);
    assert.ok(nodeIds.has(edge.to), `${profile} relation ${edge.id} has an unknown target.`);
  }
  for (const rule of fixture.room_rules) {
    for (const roomId of rule.allowed_room_ids) assert.ok(roomIds.has(roomId), `${profile} rule ${rule.route_id} has an unknown Room.`);
    for (const edgeId of rule.local_link_keys) assert.ok(edgeIds.has(edgeId), `${profile} rule ${rule.route_id} has an unknown local link.`);
  }
  for (const entry of fixture.route_memory.entries) {
    assert.match(entry.draft_digest, /^sha256:[0-9a-f]{64}$/);
    for (const reference of entry.disclosed_opaque_references) assert.ok(nodeIds.has(reference), `${profile} route ${entry.entry_id} has an unknown reference.`);
  }
  for (const reference of [
    ...fixture.defaults.test_refs,
    ...fixture.defaults.route.refs,
    ...fixture.defaults.draft.refs,
    ...fixture.disclosure_sequence.flat()
  ]) assert.ok(nodeIds.has(reference), `${profile} default references unknown object ${reference}.`);

  const caseMap = await compileCaseMap({
    profile,
    caseId: `case_demo_${profile}`,
    title: fixture.title,
    rooms: fixture.case.rooms,
    nodes: fixture.case.nodes,
    relationships: fixture.case.relationships,
    privateChronology: fixture.case.privateChronology,
    intendedActions: fixture.case.intendedActions,
    sourceStatus: fixture.source_status,
    evidenceBasis: [`synthetic ${profile} fixture`],
    observations: fixture.observations,
    missingness: fixture.missingness,
    alternatives: fixture.alternatives,
    openQuestions: fixture.open_questions,
    operatorNotes: [`demo_profile:${profile}`]
  });
  const roomRules = await compileRoomRules({ caseId: caseMap.case_id, rules: fixture.room_rules, sourceStatus: 'SIMULATED' });
  const routeMemory = await compileRouteMemory({
    caseId: caseMap.case_id,
    entries: fixture.route_memory.entries,
    operatorDeclaredAssumptions: fixture.route_memory.operator_declared_assumptions,
    unknown: fixture.route_memory.unknown,
    sourceStatus: 'SIMULATED'
  });
  assert.equal(await verifyCaseMap(caseMap), true);
  assert.equal(await verifyRoomRules(roomRules), true);
  assert.equal(await verifyRouteMemory(routeMemory), true);
  assert.equal(caseMap.profile, profile);
  assert.equal(routeMemory.entries.length, fixture.route_memory.entries.length);

  const crossRoomEdges = caseMap.relationships.filter(edge => {
    const left = caseMap.nodes.find(node => node.id === edge.from)?.room_id;
    const right = caseMap.nodes.find(node => node.id === edge.to)?.room_id;
    return left && right && left !== right;
  });
  assert.ok(crossRoomEdges.length >= 10, `${profile} does not exert enough cross-Room pressure.`);
}

console.log('ash-profile-demos.test.mjs passed');
