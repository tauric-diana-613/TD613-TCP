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
import { buildLegalMatterDemoFixture } from '../app/dome-world/ash-legal-profile-demo.js';
import { resetActiveSession, validThresholdReadiness } from '../app/dome-world/ash-cache-flush.js';
import {
  ASH_LIFECYCLE_ASSET_EPOCH,
  ASH_LIFECYCLE_MODULE,
  ASH_MASS_EVICTION_EPOCH,
  injectAshKeepLifecycle
} from '../api/dome-world-shell.js';

const read = file => fs.readFileSync(file, 'utf8');
const ingress = read('app/dome-world/ash-ingress-layout-hydration.js');
const cache = read('app/dome-world/ash-cache-flush.js');
const lifecycle = read('app/dome-world/ash-lifecycle.js');
const bridge = read('app/dome-world/ash-workspace-bridge.js');
const profileWrapper = read('app/dome-world/ash-profile-demo-hydration.js');
const investigationWrapper = read('app/dome-world/ash-investigation-demo-hydration.js');
const shell = read('api/dome-world-shell.js');
const keepHtml = read('app/dome-world/ash-keep.html');
const closeRepair = read('app/dome-world/ash-case-close-repair.js');
const emergency = read('app/dome-world/ash-emergency-stability-contract.js');
const navigation = read('app/dome-world/ash-workspace-navigation.js');
const rescue = read('app/dome-world/ash-ui-ux-rescue.js');

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
  schema:'td613.ash.readiness-receipt/v0.1', lifecycle_schema:'td613.ash.lifecycle/v0.1',
  state:'READINESS_OBSERVED', observed_at:new Date().toISOString(), source_surface:'dome-world-ash-threshold',
  threshold_gestures:{ arrival_acknowledged:true, boundary_acknowledged:true, custody_acknowledged:true },
  raw_content_accepted:false, raw_content_persisted:false, transport_performed:false, readiness_is_custody:false,
  readiness_digest:`sha256:${'a'.repeat(64)}`, ...overrides
});

function cleanupHost(href, receipt = validReadiness()) {
  const documentElement = { classList:{ remove() {} }, dataset:{} };
  return {
    location:{ href, origin:new URL(href).origin },
    localStorage:new MemoryStorage({ 'td613.ash-keep.current-case':'case_demo', 'td613.ash.session.epoch':'old-session' }),
    sessionStorage:new MemoryStorage({ [readinessKey]:JSON.stringify(receipt), 'td613:ash-stale-ui':'stale', 'unrelated.session':'keep' }),
    document:{ documentElement, body:{ dataset:{} } }
  };
}

for (const href of [
  'https://td613.test/dome-world/ash-threshold.html?arrival=cleared',
  'https://td613.test/dome-world/ash-threshold.html',
  'https://td613.test/dome-world/ash-keep.html'
]) {
  const host = cleanupHost(href);
  assert.equal(validThresholdReadiness(host), true, `Fresh readiness rejected on ${href}.`);
  const reset = resetActiveSession(host);
  assert.deepEqual(reset.preservedSessionKeys, [readinessKey]);
  assert.ok(reset.clearedSessionKeys.includes('td613:ash-stale-ui'));
  assert.notEqual(host.sessionStorage.getItem(readinessKey), null);
  assert.equal(host.sessionStorage.getItem('unrelated.session'), 'keep');
  assert.equal(host.localStorage.getItem('td613.ash-keep.current-case'), null);
  assert.equal(host.localStorage.getItem('td613.ash.session.epoch'), null);
  assert.equal(host.document.documentElement.dataset.ashSessionOpen, 'false');
}

for (const invalid of [
  validReadiness({ readiness_digest:'not-a-digest' }),
  validReadiness({ source_surface:'other-surface' }),
  validReadiness({ threshold_gestures:{ arrival_acknowledged:true, boundary_acknowledged:false, custody_acknowledged:true } }),
  validReadiness({ raw_content_persisted:true })
]) {
  const host = cleanupHost('https://td613.test/dome-world/ash-keep.html', invalid);
  assert.equal(validThresholdReadiness(host), false);
  resetActiveSession(host);
  assert.equal(host.sessionStorage.getItem(readinessKey), null);
}

for (const token of [
  'td613.ash.ingress-layout/v1.0-canonical-native-scroll', 'SESSION_EPOCH_KEY',
  'overflow-y:auto!important', 'overscroll-behavior-y:auto!important', '-webkit-overflow-scrolling:touch',
  'max-height:none!important', 'overflow:visible!important', 'touch-action:pan-y pinch-zoom!important',
  'panel_nested_scroll:false', 'bindDeliberateEntry'
]) assert(ingress.includes(token), `Canonical ingress omitted ${token}`);
for (const forbidden of ['SCROLLBAR_FADE_DELAY', 'installScrollbarFade', 'scrollbar-gutter:stable']) assert.equal(ingress.includes(forbidden), false);

assert.match(cache, /2026-07-18-canonical-membrane-v7/);
assert.match(cache, /td613\.ash\.cache-flush\/2026-07-23-a2-a5-v1/);
assert.match(cache, /validThresholdReadiness/);
assert.match(cache, /unregisterSameOriginWorkers/);
assert.match(cache, /cache:'no-store'/);
assert.doesNotMatch(cache, /indexedDB\.deleteDatabase|localStorage\.clear|sessionStorage\.clear/);

assert.equal(ASH_LIFECYCLE_ASSET_EPOCH, '20260723-a2-a5-v1');
assert.equal(ASH_MASS_EVICTION_EPOCH, 'td613.ash.cache-flush/2026-07-23-a2-a5-v1');
assert.equal(ASH_LIFECYCLE_MODULE, '/dome-world/ash-lifecycle.js?v=20260723-a2-a5-v1');
assert.match(lifecycle, /const ASH_RELEASE_ASSET_EPOCH = '20260723-a2-a5-v1'/);
assert.match(lifecycle, /await import\(versioned\('\.\/ash-ingress-layout-hydration\.js'\)\)/);
assert.match(lifecycle, /await import\(versioned\('\.\/ash-cache-flush\.js'\)\)/);
assert.match(lifecycle, /data-ash-composition-hydrating/);

const renderedKeep = injectAshKeepLifecycle(keepHtml);
let moduleCursor = -1;
for (const source of ['ash-keep.js', 'ash-convergence.js', 'ash-lifecycle.js', 'ash-workspace-bridge.js', 'ash-case-controls.js']) {
  const module = `/dome-world/${source}?v=${ASH_LIFECYCLE_ASSET_EPOCH}`;
  const index = renderedKeep.indexOf(module);
  assert.ok(index > moduleCursor, `Canonical bootstrap order failed for ${module}.`);
  moduleCursor = index;
  assert.doesNotMatch(renderedKeep, new RegExp(`src="/dome-world/${source.replace('.', '\\.')}"`));
}
assert.match(renderedKeep, /id="td613-ash-canonical-module-bootstrap"/);
assert.match(renderedKeep, /await globalThis\.__td613AshAia3Preflight/);
assert.match(renderedKeep, /name="ash-cache-preflight" content="a2-a5-v1"/);
assert.match(renderedKeep, /Preparing Ash/);
assert.match(renderedKeep, /<title>TD613 Ash<\/title>/);
assert.doesNotMatch(renderedKeep, /searchParams\.set\('ash_epoch'/);
assert.equal(injectAshKeepLifecycle(renderedKeep), renderedKeep, 'First-paint injection is not idempotent.');

for (const module of [
  'ash-profile-demo-hydration','ash-investigation-demo-hydration','ash-research-demo-hydration',
  'ash-research-demo-control-state','ash-case-close-repair','ash-ui-ux-rescue'
]) assert.match(bridge, new RegExp(`${module}\\.js\\?v=20260723-a2-a5-v1`));
assert.match(profileWrapper, /ash-legal-profile-demo\.js\?v=20260723-a2-a5-v1/);
assert.doesNotMatch(profileWrapper + investigationWrapper, /fixtures\//);
assert.match(rescue, /stopImmediatePropagation/);
assert.match(rescue, /ash-ux-motion-track/);

for (const token of ['ASH_MASS_EVICTION_EPOCH','ash-cache-preflight','Clear-Site-Data','case_data_preserved:true','session_epoch_preserved_or_migrated','visible_url:canonicalPath']) assert(shell.includes(token), `Shell omitted ${token}`);
for (const token of ['validThresholdReadiness','clearAshSessionStorage','preserveReadiness:true','session_logged_out:true']) assert(closeRepair.includes(token), `Close boundary omitted ${token}`);
for (const token of ['HIDDEN_UNTIL_FINAL_COMPOSITION','REQUIRED_MEMBRANE_IDS','dataset.ashMembraneReady']) assert(emergency.includes(token), `Composition gate omitted ${token}`);
assert.doesNotMatch(navigation, /new host\.MutationObserver/);

assert.equal(ASH_APEQ_PAIA_PROFILE_DEMOS_VERSION, 'td613.ash.apeq-paia-profile-demos/v0.1');
const expected = { rooms:14, nodes:72, relationships:112, rules:8, routes:6, controls:12, held_outs:8, strata:10, joining_keys:8 };
for (const profile of ['political_campaign', 'fundraiser', 'investigation']) {
  const fixture = buildApeqPaiaProfileFixture(profile);
  assert.deepEqual(fixture.counts, expected);
  assert.equal(fixture.assay.maximum_assurance, 'PA2_LOCALLY_EXECUTED');
  const caseMap = await compileCaseMap({
    profile, caseId:`case_live_${profile}`, title:fixture.profile.title, rooms:fixture.rooms,
    nodes:fixture.nodes, relationships:fixture.relationships, privateChronology:fixture.profile.chronology,
    intendedActions:fixture.profile.actions, sourceStatus:'SIMULATED', observations:fixture.profile.observations,
    missingness:fixture.profile.missingness, alternatives:fixture.profile.alternatives, openQuestions:fixture.profile.open_questions
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

const legal = buildLegalMatterDemoFixture();
assert.equal(legal.profile, 'legal');
assert.deepEqual({ rooms:legal.rooms.length, nodes:legal.nodes.length, relationships:legal.relationships.length, rules:legal.rules.length, routes:legal.routes.length }, { rooms:8, nodes:16, relationships:12, rules:3, routes:3 });
assert.match(legal.defaults.research_notes, /No legal advice/);

console.log('ash-live-ingress-demos-cache.test.mjs passed');
