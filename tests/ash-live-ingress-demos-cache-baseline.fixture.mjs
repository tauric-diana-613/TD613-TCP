import assert from 'node:assert/strict';
import fs from 'node:fs';
import { webcrypto } from 'node:crypto';
if (!globalThis.crypto) globalThis.crypto = webcrypto;

import { compileCaseMap, compileRoomRules, compileRouteMemory, verifyCaseMap, verifyRoomRules, verifyRouteMemory } from '../app/engine/ash-keep-core.js';
import { ASH_APEQ_PAIA_PROFILE_DEMOS_VERSION, buildApeqPaiaProfileFixture } from '../app/dome-world/ash-apeq-paia-profile-demos.js';
import { buildResearchFixture } from '../app/dome-world/ash-research-demo-hydration.js';
import { buildLegalMatterDemoFixture } from '../app/dome-world/ash-legal-profile-demo.js';
import { buildArchiveDemoFixture } from '../app/dome-world/ash-archive-profile-demo.js';
import { resetActiveSession, validThresholdReadiness } from '../app/dome-world/ash-cache-flush.js';
import { ASH_LIFECYCLE_ASSET_EPOCH, ASH_LIFECYCLE_MODULE, ASH_MASS_EVICTION_EPOCH, injectAshKeepLifecycle } from '../api/dome-world-shell.js';

const read = file => fs.readFileSync(file, 'utf8');
const ingress = read('app/dome-world/ash-ingress-layout-hydration.js');
const cache = read('app/dome-world/ash-cache-flush.js');
const lifecycle = read('app/dome-world/ash-lifecycle.js');
const bridge = read('app/dome-world/ash-workspace-bridge.js');
const profileWrapper = read('app/dome-world/ash-profile-demo-hydration.js');
const registry = read('app/dome-world/ash-demo-registry.js');
const archiveSource = read('app/dome-world/ash-archive-profile-demo.js');
const empiricalSource = read('app/dome-world/ash-a15-empirical-profile-journeys.js');
const shell = read('api/dome-world-shell.js');
const keepHtml = read('app/dome-world/ash-keep.html');
const closeRepair = read('app/dome-world/ash-case-close-repair.js');
const emergency = read('app/dome-world/ash-emergency-stability-contract.js');
const navigation = read('app/dome-world/ash-workspace-navigation.js');
const rescue = read('app/dome-world/ash-ui-ux-rescue.js');
const LIFECYCLE_EPOCH = '20260724-a12-release-v1';
const REGISTRY_EPOCH = '20260726-a15-empirical-v1';
const MASS_EPOCH = 'td613.ash.cache-flush/2026-07-24-a11-postclosure-v1';

class MemoryStorage {
  constructor(entries = {}) { this.values = new Map(Object.entries(entries)); }
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(String(key), String(value)); }
  removeItem(key) { this.values.delete(String(key)); }
}
const readinessKey = 'td613:ash-threshold:readiness:v0.1';
const validReadiness = (overrides = {}) => ({ schema:'td613.ash.readiness-receipt/v0.1', lifecycle_schema:'td613.ash.lifecycle/v0.1', state:'READINESS_OBSERVED', observed_at:new Date().toISOString(), source_surface:'dome-world-ash-threshold', threshold_gestures:{ arrival_acknowledged:true, boundary_acknowledged:true, custody_acknowledged:true }, raw_content_accepted:false, raw_content_persisted:false, transport_performed:false, readiness_is_custody:false, readiness_digest:`sha256:${'a'.repeat(64)}`, ...overrides });
function cleanupHost(href, receipt = validReadiness()) {
  const documentElement = { classList:{ remove() {} }, dataset:{} };
  return { location:{ href, origin:new URL(href).origin }, localStorage:new MemoryStorage({ 'td613.ash-keep.current-case':'case_demo', 'td613.ash.session.epoch':'old-session' }), sessionStorage:new MemoryStorage({ [readinessKey]:JSON.stringify(receipt), 'td613:ash-stale-ui':'stale', 'unrelated.session':'keep' }), document:{ documentElement, body:{ dataset:{} } } };
}
for (const href of ['https://td613.test/dome-world/ash-threshold.html?arrival=cleared','https://td613.test/dome-world/ash-threshold.html','https://td613.test/dome-world/ash-keep.html']) {
  const host = cleanupHost(href);
  assert.equal(validThresholdReadiness(host), true);
  const reset = resetActiveSession(host);
  assert.deepEqual(reset.preservedSessionKeys, [readinessKey]);
  assert.ok(reset.clearedSessionKeys.includes('td613:ash-stale-ui'));
  assert.notEqual(host.sessionStorage.getItem(readinessKey), null);
  assert.equal(host.sessionStorage.getItem('unrelated.session'), 'keep');
  assert.equal(host.localStorage.getItem('td613.ash-keep.current-case'), null);
  assert.equal(host.localStorage.getItem('td613.ash.session.epoch'), null);
}
for (const invalid of [validReadiness({ readiness_digest:'not-a-digest' }),validReadiness({ source_surface:'other-surface' }),validReadiness({ threshold_gestures:{ arrival_acknowledged:true, boundary_acknowledged:false, custody_acknowledged:true } }),validReadiness({ raw_content_persisted:true })]) {
  const host = cleanupHost('https://td613.test/dome-world/ash-keep.html', invalid);
  assert.equal(validThresholdReadiness(host), false);
  resetActiveSession(host);
  assert.equal(host.sessionStorage.getItem(readinessKey), null);
}

for (const token of ['td613.ash.ingress-layout/v1.0-canonical-native-scroll','SESSION_EPOCH_KEY','overflow-y:auto!important','overscroll-behavior-y:auto!important','-webkit-overflow-scrolling:touch','max-height:none!important','overflow:visible!important','touch-action:pan-y pinch-zoom!important','panel_nested_scroll:false','bindDeliberateEntry']) assert(ingress.includes(token));
for (const forbidden of ['SCROLLBAR_FADE_DELAY','installScrollbarFade','scrollbar-gutter:stable']) assert.equal(ingress.includes(forbidden), false);
assert.match(cache, /2026-07-18-canonical-membrane-v7/);
assert.ok(cache.includes(MASS_EPOCH));
assert.match(cache, /validThresholdReadiness|unregisterSameOriginWorkers|cache:'no-store'/);
assert.doesNotMatch(cache, /indexedDB\.deleteDatabase|localStorage\.clear|sessionStorage\.clear/);

assert.equal(ASH_LIFECYCLE_ASSET_EPOCH, LIFECYCLE_EPOCH);
assert.equal(ASH_MASS_EVICTION_EPOCH, MASS_EPOCH);
assert.equal(ASH_LIFECYCLE_MODULE, `/dome-world/ash-lifecycle.js?v=${LIFECYCLE_EPOCH}`);
assert.match(lifecycle, /const ASH_RELEASE_ASSET_EPOCH = '20260724-a12-release-v1'/);
assert.ok(lifecycle.includes("await import(`./ash-ingress-layout-hydration.js?v=${ASH_RELEASE_ASSET_EPOCH}`)"));
assert.ok(lifecycle.includes("await import(`./ash-cache-flush.js?v=${ASH_RELEASE_ASSET_EPOCH}`)"));

const renderedKeep = injectAshKeepLifecycle(keepHtml);
let moduleCursor = -1;
for (const source of ['ash-keep.js','ash-convergence.js','ash-lifecycle.js','ash-workspace-bridge.js','ash-case-controls.js']) {
  const module = `/dome-world/${source}?v=${ASH_LIFECYCLE_ASSET_EPOCH}`;
  const index = renderedKeep.indexOf(module);
  assert.ok(index > moduleCursor);
  moduleCursor = index;
}
assert.match(renderedKeep, /id="td613-ash-canonical-module-bootstrap"/);
assert.match(renderedKeep, /name="ash-cache-preflight" content="a11-postclosure-v1"/);
assert.match(renderedKeep, /<title>TD613 Ash<\/title>/);
assert.doesNotMatch(renderedKeep, /searchParams\.set\('ash_epoch'/);
assert.equal(injectAshKeepLifecycle(renderedKeep), renderedKeep);

assert.match(bridge, new RegExp(`ash-profile-demo-hydration\\.js\\?v=${REGISTRY_EPOCH}`));
assert.doesNotMatch(bridge, /^import .*ash-investigation-demo-hydration\.js/m);
assert.doesNotMatch(bridge, /^import .*ash-research-demo-hydration\.js/m);
assert.doesNotMatch(bridge, /^import .*ash-research-demo-control-state\.js/m);
assert.doesNotMatch(bridge, /^import .*ash-legal-demo-control-state\.js/m);
assert.match(profileWrapper, new RegExp(`ash-demo-registry\\.js\\?v=${REGISTRY_EPOCH}`));
const providers = ['ash-apeq-paia-profile-demos.js','ash-research-demo-hydration.js','ash-legal-profile-demo.js','ash-archive-profile-demo.js','ash-demo-pedagogy-rehydration.js','ash-a15-empirical-profile-journeys.js'];
for (const provider of providers) assert.ok(profileWrapper.includes(provider));
for (const provider of providers) assert.match(registry, new RegExp(provider.replaceAll('.', '\\.')));
assert.doesNotMatch(registry + archiveSource + empiricalSource, /ash_epoch|caches\.|serviceWorker|deleteDatabase|localStorage\.clear|sessionStorage\.clear/);
assert.match(rescue, /stopImmediatePropagation|ash-ux-motion-track/);

for (const token of ['ASH_MASS_EVICTION_EPOCH','ash-cache-preflight','Clear-Site-Data','case_data_preserved:true','session_epoch_preserved_or_migrated','visible_url:canonicalPath']) assert(shell.includes(token));
for (const token of ['validThresholdReadiness','clearAshSessionStorage','preserveReadiness:true','session_logged_out:true']) assert(closeRepair.includes(token));
for (const token of ['HIDDEN_UNTIL_FINAL_COMPOSITION','REQUIRED_MEMBRANE_IDS','dataset.ashMembraneReady']) assert(emergency.includes(token));
assert.doesNotMatch(navigation, /new host\.MutationObserver/);

assert.equal(ASH_APEQ_PAIA_PROFILE_DEMOS_VERSION, 'td613.ash.apeq-paia-profile-demos/v0.1');
const expected = { rooms:14, nodes:72, relationships:112, rules:8, routes:6, controls:12, held_outs:8, strata:10, joining_keys:8 };
for (const profile of ['political_campaign','fundraiser','investigation']) {
  const fixture = buildApeqPaiaProfileFixture(profile);
  assert.deepEqual(fixture.counts, expected);
  const caseMap = await compileCaseMap({ profile, caseId:`case_live_${profile}`, title:fixture.profile.title, rooms:fixture.rooms, nodes:fixture.nodes, relationships:fixture.relationships, privateChronology:fixture.profile.chronology, intendedActions:fixture.profile.actions, sourceStatus:'SIMULATED', observations:fixture.profile.observations, missingness:fixture.profile.missingness, alternatives:fixture.profile.alternatives, openQuestions:fixture.profile.open_questions });
  const rules = await compileRoomRules({ caseId:caseMap.case_id, rules:fixture.rules, sourceStatus:'SIMULATED' });
  const routes = await compileRouteMemory({ caseId:caseMap.case_id, entries:fixture.routes.entries, sourceStatus:'SIMULATED' });
  assert.equal(await verifyCaseMap(caseMap), true);
  assert.equal(await verifyRoomRules(rules), true);
  assert.equal(await verifyRouteMemory(routes), true);
}
const research = buildResearchFixture();
assert.deepEqual(research.counts, { rooms:14, nodes:72, relationships:112, rules:8, routes:6, controls:12, held_outs:8, strata:10 });
const legal = buildLegalMatterDemoFixture();
assert.deepEqual({ rooms:legal.rooms.length, nodes:legal.nodes.length, relationships:legal.relationships.length, rules:legal.rules.length, routes:legal.routes.length }, { rooms:8, nodes:16, relationships:12, rules:3, routes:3 });
assert.match(legal.defaults.research_notes, /No legal advice/);
const archive = buildArchiveDemoFixture();
assert.deepEqual({ rooms:archive.rooms.length, nodes:archive.nodes.length, relationships:archive.relationships.length, rules:archive.rules.length, routes:archive.routes.length }, { rooms:8, nodes:29, relationships:23, rules:4, routes:4 });
for (const route of archive.routes) assert.match(route.draft_digest, /^sha256:[0-9a-f]{64}$/);
assert.match(archive.defaults.route.digest, /^sha256:[0-9a-f]{64}$/);
assert.equal(archive.assay.release_authority, false);
assert.equal(archive.assay.transfer_authority, false);

console.log('ash-live-ingress-demos-cache.test.mjs passed under A15 empirical registry epoch');
