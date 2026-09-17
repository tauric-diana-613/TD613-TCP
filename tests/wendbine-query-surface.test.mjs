import assert from 'node:assert/strict';
import path from 'node:path';
import {
  buildIndex,
  lexicalSearch,
  semanticSearch,
  recentEntries,
  resolveEntry
} from '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-query.mjs';

const root = path.resolve('packages/dome_world_exact/fixtures/a15-r0/WENDBINE');
const index = buildIndex(root);

assert.ok(index.length > 35, 'Query surface must index corpus plus receipts/operations, not only the source registry.');

for (const sourceId of ['reddit:t3_1wfliaj', 'reddit:t3_1wfmmo7']) {
  const resolved = resolveEntry(index, sourceId);
  assert.equal(resolved.length, 1, `${sourceId} must resolve through the unified Wendbine query surface.`);
  assert.ok(resolved[0].canonical_url?.includes('/r/Wendbine/comments/'), `${sourceId} must retain canonical source routing.`);
}

const repair = lexicalSearch(index, 'correlation provenance repair paths', { limit: 10 });
assert.ok(repair.some(hit => hit.id === 'reddit:t3_1wfmmo7'), 'Ordinary phrase/word search must recover the Sept 13 builder-discipline source.');

const reconstruction = semanticSearch(index, 'failure reconstruction alternatives testing', { limit: 10 });
assert.ok(reconstruction.some(hit => hit.id === 'reddit:t3_1wfliaj'), 'Concept-semantic search must recover the Sept 13 failure/reconstruction source without exact-title dependence.');

const paul = lexicalSearch(index, 'PAUL', { limit: 50 });
assert.ok(paul.some(hit => hit.id === 'reddit:t3_1wfliaj'), 'PAUL must work as a reversible human-facing retrieval alias for public Reddit source records.');
assert.ok(paul.some(hit => hit.id === 'reddit:t3_1wfmmo7'), 'PAUL alias retrieval must span append-only Reddit deltas.');

const tardis = semanticSearch(index, 'TARDIS phone account memory cross app', { limit: 20 });
const fb = tardis.find(hit => hit.id === 'facebook:user-supplied:paul-personal:cross-app-second-order-observation:20260916');
assert.ok(fb, 'Sept 16 user-supplied cross-platform observation must remain semantically retrievable.');
assert.equal(fb.status, 'HELD_CANONICAL_URL_NOT_SUPPLIED', 'Retrieval must preserve HELD source-binding state rather than promote it.');

const hold = lexicalSearch(index, 'current burst unbound', { limit: 20 });
assert.ok(hold.some(hit => /public-reddit-hydration-20260916-v04\.json$/.test(hit.path) || /2026-09-16-PUBLIC-REFRESH-CURRENT-BURST-HOLD\.md$/.test(hit.path)), 'Sept 16 retrieval HOLD must be searchable as first-class Atelier state.');

const recent = recentEntries(index, { limit: 30 });
assert.ok(recent.some(hit => /public-reddit-profile-delta-20260916-snapshot-v04\.json$/.test(hit.path)), 'Sept 16 profile observation must appear in chronological retrieval.');
assert.ok(recent.some(hit => hit.id === 'facebook:user-supplied:paul-personal:cross-app-second-order-observation:20260916'), 'Sept 16 cross-platform intake must appear in chronological retrieval.');

for (const hit of [...repair, ...reconstruction, ...tardis, ...hold]) {
  assert.ok(hit.path, 'Every query result must route back to a repository artifact.');
  assert.ok('status' in hit, 'Every query result must expose evidence/status state, including null when the artifact defines none.');
}

console.log('Wendbine unified lexical + concept-semantic query surface regression passed.');
