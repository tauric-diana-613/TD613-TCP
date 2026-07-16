import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const safe = read('app/safe-harbor/app/safe-harbor-ash-ingress.js');
const safeLoader = read('app/safe-harbor/app/safe-harbor-housekeeping.js');
const safeBase = read('app/safe-harbor/app/safe-harbor-housekeeping-base.js');
const ash = read('app/dome-world/ash-safe-harbor-ingress.js');
const ashKeep = read('app/dome-world/ash-keep.js');
const draftEngine = read('app/engine/ash-keep-drafts.js');
const ingressLoader = read('app/engine/ash-safe-harbor-ingress-loader.js');
const schema = JSON.parse(read('app/dome-world/schemas/ash-safe-harbor-ingress-v01.schema.json'));

assert.equal(schema.$id, 'td613.ash.safe-harbor-ingress/v0.1');
assert.equal(schema.properties.raw_body_included.const, false);
assert.equal(schema.properties.raw_corpus_included.const, false);
assert.equal(schema.properties.complete_case_map_included.const, false);
assert.equal(schema.properties.complete_route_memory_included.const, false);
assert.equal(schema.properties.room_keys_included.const, false);
assert.equal(schema.properties.capsule_plaintext_included.const, false);
assert.equal(schema.properties.private_aliases_included.const, false);
assert.equal(schema.properties.local_filesystem_paths_included.const, false);
assert.equal(schema.properties.universal_join_key.type, 'null');
assert.equal(schema.properties.server_custody_created.const, false);
assert.equal(schema.properties.destination_transport_authorized.const, false);
assert.equal(schema.properties.release_authorized.const, false);
assert.equal(schema.properties.suppression_authorized.const, false);
assert.equal(schema.properties.cinder_action_authorized.const, false);

for (const token of [
  'Bind in Ash Keep',
  'verifyHashReplay',
  'compileSafeHarborIngressEnvelope',
  'indexedDB.open',
  'safe_harbor_token',
  'rawBodyIncluded: false',
  'CONSIDER_SAFE_HARBOR_REFERENCE_IN_ASH'
]) assert.ok(safe.includes(token), `Safe Harbor browser bridge omitted ${token}`);
assert.doesNotMatch(safe, /fetch\s*\(/);
assert.doesNotMatch(safe, /localStorage\.setItem/);
assert.doesNotMatch(safe, /sessionStorage\.setItem/);
assert.doesNotMatch(safe, /raw corpus.*put|triad plaintext.*put/i);

for (const token of [
  'Reference arrived; custody has not.',
  'Bind L0 reference',
  'Bind L1 with current case',
  'compileSafeHarborCustodyBinding',
  'verifySafeHarborIngressEnvelope',
  'custody root not automatically created',
  'CANCELLED_HOLD',
  'REPLAY_HOLD',
  'ORIGIN_MISMATCH_HOLD',
  'EXPIRED_LOCAL_POSTURE_HOLD'
]) assert.ok(ash.includes(token), `Ash ingress surface omitted ${token}`);
assert.doesNotMatch(ash, /fetch\s*\(/);
assert.doesNotMatch(ash, /localStorage/);
assert.doesNotMatch(ash, /sessionStorage/);

assert.match(safeLoader, /safe-harbor-housekeeping-base\.js/);
assert.match(safeLoader, /safe-harbor-ash-ingress\.js/);
assert.doesNotMatch(safeLoader, /document\.write/);
assert.match(safeBase, /td613\.safe-harbor\.session\.v1/);
assert.match(ashKeep, /compileCaseMap/);
assert.match(ashKeep, /compileRouteMemory/);
assert.match(draftEngine, /ash-safe-harbor-ingress-loader\.js/);
assert.match(draftEngine, /ASH_DRAFT_SCHEMA/);
assert.match(draftEngine, /compileAshDraft/);
assert.match(draftEngine, /Review is bound to a different Case Map/);
assert.match(ingressLoader, /typeof window !== 'undefined'/);
assert.match(ingressLoader, /ash-safe-harbor-ingress\.js/);

console.log('ash-safe-harbor-ingress-browser.test.mjs passed');
