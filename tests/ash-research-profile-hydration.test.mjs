import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readJson = async path => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const source = await readFile(new URL('../app/dome-world/ash-research-profile-hydration.js', import.meta.url), 'utf8');
const lifecycle = await readFile(new URL('../app/dome-world/ash-lifecycle.js', import.meta.url), 'utf8');
const bridge = await readFile(new URL('../app/dome-world/ash-workspace-bridge.js', import.meta.url), 'utf8');
const cache = await readFile(new URL('../app/dome-world/ash-cache-flush.js', import.meta.url), 'utf8');
const research = await readJson('../app/dome-world/fixtures/ash-keep-demo-research.json');
const campaign = await readJson('../app/dome-world/fixtures/ash-keep-demo-political-campaign.json');
const fundraiser = await readJson('../app/dome-world/fixtures/ash-keep-demo-fundraiser.json');

function counts(fixture) {
  return {
    rooms: fixture.case?.rooms?.length || 0,
    nodes: fixture.case?.nodes?.length || 0,
    relationships: fixture.case?.relationships?.length || 0,
    routes: fixture.route_memory?.entries?.length || 0
  };
}

test('Research hydration is installed before baseline profile interception and remains version-bound', () => {
  assert.match(lifecycle, /ash-cache-flush\.js\?v=20260717-research-v2/);
  assert.match(lifecycle, /ash-research-profile-hydration\.js\?v=20260717-research-v1/);
  assert.ok(bridge.indexOf('ash-profile-demo-hydration.js') < bridge.indexOf('ash-research-profile-hydration.js'));
  assert.match(bridge, /ash-profile-demo-hydration\.js\?v=20260717-research-audit-v1/);
  assert.match(source, /event\.stopImmediatePropagation\(\)/);
  assert.match(source, /selectedProfile\(\) !== PROFILE/);
});

test('desktop ingress membrane is a scroll container that centers only when it fits', () => {
  assert.match(source, /\.launch\{[\s\S]*display:flex!important/);
  assert.match(source, /overflow-y:auto!important/);
  assert.match(source, /scrollbar-gutter:stable both-edges/);
  assert.match(source, /block-size:100dvh/);
  assert.match(source, /\.launch-panel\{[\s\S]*margin:auto!important/);
  assert.match(source, /max-block-size:none/);
});

test('Research demo exceeds baseline hydration density without converting density into assurance', () => {
  assert.equal(research.schema, 'td613.ash.keep-demo/v0.2');
  assert.equal(research.profile, 'research');
  assert.equal(research.hydration_class, 'QUALIFICATION_HYDRATION');
  assert.equal(research.minimum_assurance_ceiling, 'PA2');
  const rc = counts(research);
  for (const minimum of [['rooms',10],['nodes',40],['relationships',40],['routes',4]]) {
    assert.ok(rc[minimum[0]] >= minimum[1], `${minimum[0]} remains below the Research floor`);
  }
  for (const baseline of [campaign, fundraiser]) {
    const bc = counts(baseline);
    assert.ok(rc.rooms > bc.rooms || rc.nodes > bc.nodes || rc.relationships > bc.relationships,
      'Research demo did not exceed the baseline demo on any structural dimension');
  }
  assert.match(source, /Constructed evidence remains capped at PA2/);
  assert.match(source, /do not establish empirical sufficiency, endpoint integrity, or PA3–PA5 assurance/);
});

test('Research fixture preserves source classes, contradictions, controls, joining keys, and route memory', () => {
  const roomIds = new Set(research.case.rooms.map(room => room.id));
  const nodeIds = new Set(research.case.nodes.map(node => node.id));
  for (const node of research.case.nodes) assert.ok(roomIds.has(node.room_id), node.id);
  for (const edge of research.case.relationships) {
    assert.ok(nodeIds.has(edge.from), edge.id);
    assert.ok(nodeIds.has(edge.to), edge.id);
  }
  const states = new Set(research.case.nodes.map(node => node.source_status));
  for (const state of ['OBSERVED','CONSTRUCTED','DERIVED','UNRESOLVED']) assert.ok(states.has(state), state);
  const types = new Set(research.case.nodes.map(node => node.type));
  for (const type of ['source','artifact','event','claim','hypothesis','evidence-gap','intended-action']) assert.ok(types.has(type), type);
  assert.ok(research.missingness.length >= 3);
  assert.ok(research.alternatives.length >= 3);
  assert.ok(research.open_questions.length >= 3);
  assert.ok(research.room_rules.some(rule => rule.local_link_keys.length > 0));
  assert.ok(research.route_memory.unknown.length >= 3);
});

test('cache eviction is one-time, preserves case storage, and refuses universal HTTP-cache claims', () => {
  assert.match(cache, /2026-07-17-research-v2/);
  assert.match(cache, /caches\.delete/);
  assert.match(cache, /serviceWorker\?\.getRegistrations/);
  assert.match(cache, /cache: 'reload'/);
  assert.match(cache, /preserves_case_storage: true/);
  assert.match(cache, /clears_http_cache_universally: false/);
  assert.doesNotMatch(cache, /indexedDB\.deleteDatabase/);
  assert.doesNotMatch(cache, /localStorage\.clear\(\)/);
});
