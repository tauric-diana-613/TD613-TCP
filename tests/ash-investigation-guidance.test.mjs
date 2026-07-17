import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const json = path => JSON.parse(read(path));
const root = 'app/dome-world/fixtures';
const profile = json(`${root}/ash-investigation-profile.json`);
const rooms = json(`${root}/ash-investigation-rooms.json`);
const nodes = [1, 2, 3, 4].flatMap(number => json(`${root}/ash-investigation-nodes-${number}.json`));
const relationships = [1, 2, 3].flatMap(number => json(`${root}/ash-investigation-relations-${number}.json`));
const rules = ['llm', 'counsel', 'source', 'records', 'internal', 'capsule']
  .map(name => json(`${root}/ash-investigation-rule-${name}.json`));
const disclosure = json(`${root}/ash-investigation-disclosure.json`);
const defaultsCore = json(`${root}/ash-investigation-defaults-core.json`);
const defaultsContinuity = json(`${root}/ash-investigation-defaults-continuity.json`);
const hydration = read('app/dome-world/ash-investigation-demo-hydration.js');
const guidance = read('app/dome-world/ash-guided-operator-ui.js');
const css = read('app/dome-world/ash-guided-operator-ui.css');
const bridge = read('app/dome-world/ash-workspace-bridge.js');

assert.equal(profile.profile, 'investigation');
assert.equal(profile.source_status, 'SIMULATED');
assert.equal(rooms.length, 12);
assert.equal(nodes.length, 56);
assert.equal(relationships.length, 72);
assert.equal(rules.length, 6);
assert.ok(disclosure.disclosure_sequence.length >= 10);
assert.ok(profile.stress_targets.some(value => /AI-sharing guidance/i.test(value)));
assert.ok(profile.stress_targets.some(value => /Choir/i.test(value)));
assert.ok(profile.stress_targets.some(value => /Capsule/i.test(value)));
assert.ok(rooms.some(room => room.id === 'room_ai'));
assert.ok(rooms.some(room => room.id === 'room_safety'));
assert.ok(nodes.some(node => node.id === 'node_prompt_risk'));
assert.ok(nodes.some(node => node.id === 'node_linkage_risk'));
assert.ok(nodes.some(node => node.id === 'node_action_ai_packet'));
assert.equal(defaultsCore.route.id, 'route_llm_analysis');
assert.equal(defaultsCore.draft.route, 'route_llm_analysis');
assert.equal(defaultsContinuity.tradeoff.utility, 7);

const roomIds = new Set(rooms.map(room => room.id));
const nodeIds = new Set(nodes.map(node => node.id));
const edgeIds = new Set(relationships.map(edge => edge.id));
assert.equal(roomIds.size, rooms.length);
assert.equal(nodeIds.size, nodes.length);
assert.equal(edgeIds.size, relationships.length);
for (const node of nodes) assert.ok(roomIds.has(node.room_id), `${node.id} references an unknown Room`);
for (const edge of relationships) {
  assert.ok(nodeIds.has(edge.from), `${edge.id} has an unknown source`);
  assert.ok(nodeIds.has(edge.to), `${edge.id} has an unknown target`);
}
for (const rule of rules) {
  for (const roomId of rule.allowed_room_ids) assert.ok(roomIds.has(roomId), `${rule.route_id} has an unknown Room`);
  for (const edgeId of rule.local_link_keys) assert.ok(edgeIds.has(edgeId), `${rule.route_id} has an unknown local link`);
}
for (const reference of [
  ...defaultsCore.test_refs,
  ...defaultsCore.route.refs,
  ...defaultsCore.draft.refs,
  ...disclosure.disclosure_sequence.flat()
]) assert.ok(nodeIds.has(reference), `Unknown default reference ${reference}`);

assert.match(hydration, /td613\.ash\.investigation-demo\/v0\.1-glass-meridian/);
assert.equal((hydration.match(/entry_id: 'routeentry_investigation_/g) || []).length, 4);
assert.match(hydration, /configured-llm-provider/);
assert.match(hydration, /demo_profile:investigation/);
assert.match(hydration, /automatic_action_authorized: false/);
assert.match(hydration, /prediction_authorized: false/);
assert.match(bridge, /ash-investigation-demo-hydration\.js/);
assert.match(bridge, /ash-guided-operator-ui\.js/);
assert.match(guidance, /Protect → Map → Test → Share → Seal/);
assert.match(guidance, /Send the question, not the whole investigation/);
assert.match(guidance, /Early warning ≠ guilt/);
assert.match(guidance, /View exact Rebuild receipt/);
assert.match(guidance, /guidedMapZoomIn/);
assert.match(guidance, /guidedMapFocus/);
assert.match(guidance, /Provider boundary/);
assert.match(css, /guided-dome-drift/);
assert.match(css, /Iowan Old Style/);
assert.match(css, /map-stage[^\{]*\{[^}]*min-height:68vh/);
assert.match(css, /guided-receipt/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);

for (const forbidden of [
  /attribution_established\s*:\s*true/,
  /identity_established\s*:\s*true/,
  /prediction_authorized\s*:\s*true/,
  /automatic_action_authorized\s*:\s*true/,
  /surveillance_probability\s*:\s*[01]/
]) assert.doesNotMatch(hydration + guidance, forbidden);

console.log('ash-investigation-guidance.test.mjs passed');
