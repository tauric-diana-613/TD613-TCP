import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const fixture = JSON.parse(read('app/dome-world/fixtures/ash-keep-demo-investigation.json'));
const hydration = read('app/dome-world/ash-profile-demo-hydration.js');
const guidance = read('app/dome-world/ash-guided-operator-ui.js');
const css = read('app/dome-world/ash-guided-operator-ui.css');
const bridge = read('app/dome-world/ash-workspace-bridge.js');

assert.equal(fixture.profile, 'investigation');
assert.equal(fixture.source_status, 'SIMULATED');
assert.equal(fixture.case.rooms.length, 12);
assert.equal(fixture.case.nodes.length, 56);
assert.equal(fixture.case.relationships.length, 72);
assert.equal(fixture.room_rules.length, 6);
assert.equal(fixture.route_memory.entries.length, 4);
assert.ok(fixture.disclosure_sequence.length >= 10);
assert.ok(fixture.stress_targets.some(value => /AI-sharing guidance/i.test(value)));
assert.ok(fixture.stress_targets.some(value => /Choir/i.test(value)));
assert.ok(fixture.stress_targets.some(value => /Capsule/i.test(value)));
assert.ok(fixture.case.rooms.some(room => room.id === 'room_ai'));
assert.ok(fixture.case.rooms.some(room => room.id === 'room_safety'));
assert.ok(fixture.case.nodes.some(node => node.id === 'node_prompt_risk'));
assert.ok(fixture.case.nodes.some(node => node.id === 'node_linkage_risk'));
assert.ok(fixture.case.nodes.some(node => node.id === 'node_action_ai_packet'));
assert.equal(fixture.defaults.route.id, 'route_llm_analysis');
assert.equal(fixture.defaults.draft.route, 'route_llm_analysis');
assert.match(fixture.defaults.research_notes, /does not establish guilt, intent, identity, authorship, coordination, truth, surveillance, or future behavior/i);

assert.match(hydration, /v0\.3-investigation-campaign-fundraiser/);
assert.match(hydration, /ash-keep-demo-investigation\.json/);
assert.match(bridge, /ash-guided-operator-ui\.js/);
assert.match(guidance, /Protect → Map → Test → Share → Seal/);
assert.match(guidance, /Send the question, not the whole investigation/);
assert.match(guidance, /Early warning ≠ guilt/);
assert.match(guidance, /View exact Rebuild receipt/);
assert.match(guidance, /guidedMapZoomIn/);
assert.match(guidance, /guidedMapFocus/);
assert.match(guidance, /configured LLM/);
assert.match(css, /guided-dome-drift/);
assert.match(css, /Iowan Old Style/);
assert.match(css, /map-stage[^}]*min-height:68vh/);
assert.match(css, /guided-receipt/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);

for (const forbidden of [
  /guilt_established\s*:\s*true/,
  /intent_established\s*:\s*true/,
  /prediction_authorized\s*:\s*true/,
  /automatic_action_authorized\s*:\s*true/,
  /surveillance_probability\s*:\s*[01]/
]) assert.doesNotMatch(guidance + JSON.stringify(fixture), forbidden);

console.log('ash-investigation-guidance.test.mjs passed');
