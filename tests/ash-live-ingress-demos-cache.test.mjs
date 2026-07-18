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
import { resetActiveSession, validThresholdReadiness } from '../app/dome-world/ash-cache-flush.js';

const read = file => fs.readFileSync(file, 'utf8');
const ingress = read('app/dome-world/ash-ingress-layout-hydration.js');
const cache = read('app/dome-world/ash-cache-flush.js');
const lifecycle = read('app/dome-world/ash-lifecycle.js');
const bridge = read('app/dome-world/ash-workspace-bridge.js');
const profileWrapper = read('app/dome-world/ash-profile-demo-hydration.js');
const investigationWrapper = read('app/dome-world/ash-investigation-demo-hydration.js');
const shell = read('api/dome-world-shell.js');
const closeRepair = read('app/dome-world/ash-case-close-repair.js');
const emergency = read('app/dome-world/ash-emergency-stability-contract.js');
const navigation = read('app/dome-world/ash-workspace-navigation.js');

class MemoryStorage {
  constructor(entries = {}) { this.values = new Map(Object.entries(entries)); }
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(String(key), String(value)); }
  removeItem(key) { this.values.delete(String(key)); }
}

const readinessKey = 'td613:ash-threshold:readiness:v0.1';
const validReadiness = (overrides = {}) => ({
  schema:'td613.ash.readiness-receipt/v0.1',
  lifecycle_schema:'td613.ash.lifecycle/v0.1',
  state:'READINESS_OBSERVED',
  observed_at:new Date().toISOString(),
  source_surface:'dome-world-ash-threshold',
  threshold_gestures:{
    arrival_acknowledged:true,
    boundary_acknowledged:true,
    custody_acknowledged:true
  },
  raw_content_accepted:false,
  raw_content_persisted:false,
  transport_performed:false,
  readiness_is_custody:false,
  readiness_digest:`sha256:${'a'.repeat(64)}`,
  ...overrides
});

function cleanupHost(href, receipt = validReadiness()) {
  const documentElement = { classList:{ remove() {} }, dataset:{} };
  return {
    location:{ href },
    localStorage:new MemoryStorage({
      'td613.ash-keep.current-case':'case_demo',
      'td613.ash.session.epoch':'old-session'
    }),
    sessionStorage:new MemoryStorage({
      [readinessKey]:JSON.stringify(receipt),
      'td613:ash-stale-ui':'stale',
      'unrelated.session':'keep'
    }),
    document:{ documentElement, body:{ dataset:{} } }
  };
}

const clearedArrivalHost = cleanupHost('https://td613.test/dome-world/ash-threshold.html?arrival=cleared');
assert.equal(validThresholdReadiness(clearedArrivalHost), true, 'Fresh cleared-threshold readiness was rejected.');
const clearedArrivalReset = resetActiveSession(clearedArrivalHost);
assert.deepEqual(clearedArrivalReset.preservedSessionKeys, [readinessKey]);
assert.ok(clearedArrivalReset.clearedSessionKeys.includes('td613:ash-stale-ui'));
assert.equal(clearedArrivalHost.sessionStorage.getItem(readinessKey) !== null, true, 'Fresh threshold readiness was deleted.');
assert.equal(clearedArrivalHost.sessionStorage.getItem('td613:ash-stale-ui'), null);
assert.equal(clearedArrivalHost.sessionStorage.getItem('unrelated.session'), 'keep');
assert.equal(clearedArrivalHost.localStorage.getItem('td613.ash-keep.current-case'), null);
assert.equal(clearedArrivalHost.localStorage.getItem('td613.ash.session.epoch'), null);
assert.equal(clearedArrivalHost.document.documentElement.dataset.ashSessionOpen, 'false');
assert.equal(clearedArrivalHost.document.body.dataset.ashCaseClosed, 'true');

const directHost = cleanupHost('https://td613.test/dome-world/ash-keep.html');
assert.equal(validThresholdReadiness(directHost), false, 'Direct Keep load accepted a threshold readiness receipt.');
const directReset = resetActiveSession(directHost);
assert.deepEqual(directReset.preservedSessionKeys, []);
assert.equal(directHost.sessionStorage.getItem(readinessKey), null, 'Direct-load readiness survived cleanup.');

const staleHost = cleanupHost('https://td613.test/dome-world/ash-threshold.html?arrival=cleared', validReadiness({ observed_at:new Date(Date.now() - 16 * 60 * 1000).toISOString() }));
assert.equal(validThresholdReadiness(staleHost), false, 'Expired threshold readiness was accepted.');
assert.equal(resetActiveSession(staleHost).clearedSessionKeys.includes(readinessKey), true);

for (const invalid of [
  validReadiness({ readiness_digest:'not-a-digest' }),
  validReadiness({ source_surface:'other-surface' }),
  validReadiness({ threshold_gestures:{ arrival_acknowledged:true, boundary_acknowledged:false, custody_acknowledged:true } }),
  validReadiness({ raw_content_persisted:true })
]) {
  const host = cleanupHost('https://td613.test/dome-world/ash-threshold.html?arrival=cleared', invalid);
  assert.equal(validThresholdReadiness(host), false, 'Malformed or over-authorized readiness was accepted.');
  resetActiveSession(host);
  assert.equal(host.sessionStorage.getItem(readinessKey), null);
}

assert.equal(ASH_APEQ_PAIA_PROFILE_DEMOS_VERSION, 'td613.ash.apeq-paia-profile-demos/v0.1');
for (const token of [
  'td613.ash.ingress-layout/v1.0-canonical-native-scroll',
  'SESSION_EPOCH_KEY',
  '20260718-canonical-membrane-v6',
  'overflow-y:auto!important',
  'overscroll-behavior-y:auto!important',
  '-webkit-overflow-scrolling:touch',
  'max-height:none!important',
  'overflow:visible!important',
  'touch-action:pan-y pinch-zoom!important',
  'panel_nested_scroll:false',
  'bindDeliberateEntry'
]) assert(ingress.includes(token), `Canonical ingress omitted ${token}`);
for (const forbidden of ['SCROLLBAR_FADE_DELAY', 'installScrollbarFade', 'scrollbar-gutter:stable', 'ash-scrollbar-active::-webkit-scrollbar-thumb']) {
  assert.equal(ingress.includes(forbidden), false, `Canonical ingress retained ${forbidden}`);
}

assert.match(cache, /2026-07-18-canonical-membrane-v6/);
assert.match(cache, /v0\.6-readiness-preservation/);
assert.match(cache, /validThresholdReadiness/);
assert.match(cache, /arrival.*cleared/);
assert.match(cache, /READINESS_MAX_AGE_MS/);
assert.match(cache, /preserved_session_keys/);
assert.match(cache, /readiness_receipt_preserved/);
assert.match(cache, /resetActiveSession/);
assert.match(cache, /localStorage\?\.removeItem\?\.\(POINTER_KEY\)/);
assert.match(cache, /SESSION_EPOCH_KEY/);
assert.match(cache, /active_session_reset:true/);
assert.match(cache, /local_case_pointer_preserved:false/);
assert.match(cache, /case_data_preserved:true/);
assert.match(cache, /Clear-Site-Data|cache-evict/);
assert.match(cache, /caches\.keys/);
assert.match(cache, /registration\.unregister/);
assert.match(cache, /unregisterSameOriginWorkers/);
assert.match(cache, /cache:'no-store'/);
assert.doesNotMatch(cache, /2026-07-18-(?:live-ingress-v3|emergency-stability-v5)/);
assert.doesNotMatch(cache, /indexedDB\.deleteDatabase|localStorage\.clear|sessionStorage\.clear/);

assert.match(lifecycle, /ash-ingress-layout-hydration\.js\?v=20260718-canonical-membrane-v6/);
assert.match(lifecycle, /ash-cache-flush\.js\?v=20260718-canonical-membrane-v6-readiness-hotfix/);
for (const module of ['ash-profile-demo-hydration','ash-investigation-demo-hydration','ash-research-demo-hydration','ash-research-demo-control-state','ash-case-close-repair']) {
  assert.match(bridge, new RegExp(`${module}\\.js\\?v=20260718-canonical-membrane-v6`));
}
assert(bridge.indexOf('ash-emergency-stability-contract.js') > bridge.indexOf('ash-workspace-navigation.js'), 'Final membrane reveal must load after all membrane composition modules.');
assert.doesNotMatch(profileWrapper + investigationWrapper, /fixtures\//);

for (const token of [
  'ASH_CANONICAL_MEMBRANE_EPOCH',
  'ash-canonical-membrane',
  'data-ash-membrane-ready',
  'data-ash-session-open',
  'td613.ash.session.epoch',
  'X-TD613-Ash-Canonical-Membrane',
  'Clear-Site-Data',
  'HTTP_CACHE_ONLY',
  'case_data_preserved:true'
]) assert(shell.includes(token), `Shell omitted ${token}`);

for (const token of [
  'v1.2-session-logout',
  'clearAshSessionStorage',
  'cleanUrl',
  'resetTransientUi',
  'localStorage.removeItem(POINTER_KEY)',
  'localStorage.removeItem(SESSION_EPOCH_KEY)',
  "select.value = ''",
  'session_logged_out:true'
]) assert(closeRepair.includes(token), `Close logout omitted ${token}`);
assert.doesNotMatch(closeRepair, /retainClosedSelection/);

for (const token of ['HIDDEN_UNTIL_FINAL_COMPOSITION','REQUIRED_MEMBRANE_IDS','dataset.ashMembraneReady','canonical-membrane-ready']) {
  assert(emergency.includes(token), `Final composition gate omitted ${token}`);
}
assert.doesNotMatch(navigation, /new host\.MutationObserver/);
assert.match(navigation, /host\.addEventListener\('td613:ash:lifecycle-rendered', refresh\)/);

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
