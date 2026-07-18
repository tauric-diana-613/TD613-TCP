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
  ASH_APEQ_PAIA_PROFILE_DEMOS_VERSION,
  buildApeqPaiaProfileFixture
} from '../app/dome-world/ash-apeq-paia-profile-demos.js';
import { buildResearchFixture } from '../app/dome-world/ash-research-demo-hydration.js';

const read = file => fs.readFileSync(file, 'utf8');
const ingress = read('app/dome-world/ash-ingress-layout-hydration.js');
const cache = read('app/dome-world/ash-cache-flush.js');
const lifecycle = read('app/dome-world/ash-lifecycle.js');
const bridge = read('app/dome-world/ash-workspace-bridge.js');
const profileWrapper = read('app/dome-world/ash-profile-demo-hydration.js');
const investigationWrapper = read('app/dome-world/ash-investigation-demo-hydration.js');
const shell = read('api/dome-world-shell.js');

assert.equal(ASH_APEQ_PAIA_PROFILE_DEMOS_VERSION, 'td613.ash.apeq-paia-profile-demos/v0.1');
for (const token of ['width:min(780px', 'max-height:calc(100dvh - 32px)', 'overflow-y:auto!important', 'scrollbar-gutter:stable']) {
  assert(ingress.includes(token), `Ingress omitted ${token}`);
}
assert.match(cache, /2026-07-18-live-ingress-v3/);
assert.match(cache, /Clear-Site-Data|cache-evict/);
assert.match(cache, /caches\.keys/);
assert.match(cache, /registration\.unregister/);
assert.doesNotMatch(cache, /indexedDB\.deleteDatabase|localStorage\.clear|sessionStorage\.clear/);
assert.match(lifecycle, /ash-ingress-layout-hydration\.js\?v=20260718-live-ingress-v3/);
assert.match(lifecycle, /ash-cache-flush\.js\?v=20260718-live-ingress-v3/);
assert.match(bridge, /ash-profile-demo-hydration\.js\?v=20260718-live-ingress-v3/);
assert.match(bridge, /ash-investigation-demo-hydration\.js\?v=20260718-live-ingress-v3/);
assert.match(bridge, /ash-research-demo-hydration\.js\?v=20260718-live-ingress-v3/);
assert.match(bridge, /ash-research-demo-control-state\.js\?v=20260718-live-ingress-v3/);
assert.doesNotMatch(profileWrapper + investigationWrapper, /fixtures\//);
assert.match(shell, /Clear-Site-Data/);
assert.match(shell, /HTTP_CACHE_ONLY/);
assert.match(shell, /indexeddb_preserved:true/);

const expected = { rooms:14, nodes:72, relationships:112, rules:8, routes:6, controls:12, held_outs:8, strata:10, joining_keys:8 };
for (const profile of ['political_campaign', 'fundraiser', 'investigation']) {
  const fixture = buildApeqPaiaProfileFixture(profile);
  assert.deepEqual(fixture.counts, expected);
  assert.equal(fixture.assay.maximum_assurance, 'PA2_LOCALLY_EXECUTED');
  assert.equal(fixture.assay.unknown_readers, 'UNMEASURED');
  assert.equal(fixture.assay.universal_secrecy, false);
  const caseMap = await compileCaseMap({
    profile,
    caseId:`case_live_${profile}`,
    title:fixture.profile.title,
    rooms:fixture.rooms,
    nodes:fixture.nodes,
    relationships:fixture.relationships,
    privateChronology:fixture.profile.chronology,
    intendedActions:fixture.profile.actions,
    sourceStatus:'SIMULATED',
    observations:fixture.profile.observations,
    missingness:fixture.profile.missingness,
    alternatives:fixture.profile.alternatives,
    openQuestions:fixture.profile.open_questions
  });
  const rules = await compileRoomRules({ caseId:caseMap.case_id, rules:fixture.rules, sourceStatus:'SIMULATED' });
  const routes = await compileRouteMemory({ caseId:caseMap.case_id, entries:fixture.routes.entries, sourceStatus:'SIMULATED' });
  assert.equal(await verifyCaseMap(caseMap), true);
  assert.equal(await verifyRoomRules(rules), true);
  assert.equal(await verifyRouteMemory(routes), true);
}

const research = buildResearchFixture();
assert.deepEqual(research.counts, { rooms:14, nodes:72, relationships:112, rules:8, routes:6, controls:12, held_outs:8, strata:10 });
assert.equal(research.assay.maximum_assurance, 'PA2_LOCALLY_EXECUTED');
assert.equal(research.assay.unknown_readers, 'UNMEASURED');

console.log('ash-live-ingress-demos-cache.test.mjs passed');
