import assert from 'node:assert/strict';
import fs from 'node:fs';

const core = fs.readFileSync(new URL('../app/dome-world/ash-a7-a11-recompiler-core.js', import.meta.url), 'utf8');
const source = fs.readFileSync(new URL('../app/dome-world/ash-a7-home-recompilation.js', import.meta.url), 'utf8');
const shell = fs.readFileSync(new URL('../api/dome-world-shell.js', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../app/dome-world/ash-keep.html', import.meta.url), 'utf8');
const vercel = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));

assert.match(core, /td613\.ash\.a7-a11-recompiler-core\/v0\.1/);
assert.match(core, /authority_changed:false/);
assert.match(core, /source_bytes_moved:false/);
assert.match(core, /human_closure_required:true/);

for (const label of [
  'What needs attention',
  'Why it matters',
  'What you can do now',
  'What Ash will change',
  'What Ash will not do',
  'Done when',
  'What remains attached',
  'What became stale',
  'What can be returned to',
  'What must be checked again',
  'What has not been sealed',
  'What has already left',
  'What stayed local',
  'Later stale status'
]) assert.ok(source.includes(label), `A7 source missing ${label}`);

assert.match(source, /ash-stage-primary-action/);
assert.match(source, /data-ash-a7-home/);
assert.match(source, /Route ledger/);
assert.match(source, /Source bytes stay local/);
assert.match(source, /release posture.*human closure remain unchanged/i);
assert.doesNotMatch(source, /fetch\s*\(/);
assert.doesNotMatch(source, /indexedDB\.(?:deleteDatabase|open)/);
assert.doesNotMatch(source, /localStorage\.(?:setItem|removeItem|clear)/);
assert.doesNotMatch(source, /automatic[_ -](?:release|closure|custody)/i);

assert.match(shell, /ash-a7-a11-recompiler-core\.js\?v=20260723-a7-v1/);
assert.match(shell, /ash-a7-home-recompilation\.js\?v=20260723-a7-v1/);
assert.match(html, /ash-a7-a11-recompiler-core\.js/);
assert.match(html, /ash-a7-home-recompilation\.js/);
assert.equal(vercel.git?.deploymentEnabled, false, 'A7 implementation branch must retain the closed Vercel gate');

console.log(JSON.stringify({
  ok:true,
  schema:'td613.ash.a7-home-contract/v0.1',
  primary_action_count_contract:1,
  route_ledger:true,
  continuity:true,
  authority_changed:false,
  source_bytes_moved:false,
  human_closure_required:true,
  vercel_gate:'CLOSED'
}, null, 2));
