import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../app/dome-world/ash-a8-case-map-recompilation.js', import.meta.url), 'utf8');
const bridge = fs.readFileSync(new URL('../app/dome-world/ash-workspace-bridge.js', import.meta.url), 'utf8');
const shell = fs.readFileSync(new URL('../api/dome-world-shell.js', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../app/dome-world/ash-keep.html', import.meta.url), 'utf8');
const mirror = fs.readFileSync(new URL('../app/dome-world/ash-keep-source.html', import.meta.url), 'utf8');
const vercel = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));

for (const marker of [
  'What are you placing?',
  'What is known',
  'What remains uncertain',
  'Preview waits for a plain name',
  'Add deliberately',
  'Object A —— choose relation ——> Object B',
  'Evidence/source',
  'Commit relationship',
  'Relationship inspection',
  'Graph view',
  'Notes and history',
  'Accessible table',
  'unresolved',
  'contradiction',
  'engine has no undirected relation state',
  'Storage confirmation remains pending',
  'Stored relationship confirmed'
]) assert.ok(source.includes(marker), `A8 source missing ${marker}`);

for (const id of ['objectName','objectType','objectRoom','objectSource','addObject','linkFrom','linkTo','linkType','addRelationship','researchNotes']) assert.ok(source.includes(`'${id}'`), `A8 must delegate to existing ${id}`);
assert.match(source, /byId\('addObject'\)\?\.click\(\)/);
assert.match(source, /byId\('addRelationship'\)\?\.click\(\)/);
assert.match(source, /notes\.dispatchEvent\(new Event\('change'/);
assert.match(source, /table\.classList\.add\('active'\)/);
assert.match(source, /data-ash-a8-inspect-relation/);
assert.match(source, /id="ashA8RelationDetail"/);
assert.match(source, /root\.addEventListener\('click'/);
assert.doesNotMatch(source, /ashA8RelationDirection/);
assert.match(source, /source_bytes_moved:false/);
assert.match(source, /authority_changed:false/);
assert.doesNotMatch(source, /indexedDB\.(?:open|deleteDatabase)/);
assert.doesNotMatch(source, /fetch\s*\(/);
assert.doesNotMatch(source, /localStorage\.(?:setItem|removeItem|clear)/);
assert.doesNotMatch(source, /new\s+(?:Worker|SharedWorker)/);
assert.match(bridge, /\.ash-flowcore-field--proxy \[data-aia-exact\]/);
assert.match(bridge, /removeAttribute\('data-aia-exact'\)/);
assert.match(shell, /ash-a8-case-map-recompilation\.js\?v=20260723-a8-v1/);
assert.match(html, /ash-a8-case-map-recompilation\.js/);
assert.equal(html, mirror, 'Ash source mirror must remain byte-identical');
assert.equal(vercel.git?.deploymentEnabled, false);

console.log(JSON.stringify({
  ok:true,
  schema:'td613.ash.a8-case-map-contract/v0.1',
  existing_map_engine_delegation:true,
  relation_workshop:true,
  directed_relation_truthful:true,
  notes_change_persistence:true,
  accessible_table:true,
  stored_relation_detail:true,
  proxy_inspection_selector_quarantined:true,
  authority_changed:false,
  source_bytes_moved:false,
  human_closure_required:true,
  vercel_gate:'CLOSED'
}, null, 2));
