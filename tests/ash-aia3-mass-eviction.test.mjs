import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  runAshAia3CacheEviction,
  ASH_AIA3_CACHE_EPOCH,
  ASH_AIA3_ASSET_EPOCH,
  ASH_LEGACY_CACHE_EPOCH
} from '../app/dome-world/ash-cache-eviction-aia3.js';
import { runAshCacheFlush } from '../app/dome-world/ash-cache-flush.js';

const shellSource = fs.readFileSync('api/dome-world-shell.js', 'utf8');
const journeySource = fs.readFileSync('scripts/ash-keep-aia3-task-journey-v3.mjs', 'utf8');
const compositionSource = fs.readFileSync('app/dome-world/ash-aia3-composition.js', 'utf8');

test('server preflight bypasses exact legacy rollback and republishes the governed receipt', () => {
  assert.match(shellSource, /legacyPresentation/);
  assert.match(shellSource, /legacy_bypass:true/);
  assert.match(shellSource, /__td613AshAia3PreflightReceipt/);
  assert.match(shellSource, /publish\(receipt\)/);
  assert.match(shellSource, /Updating Ash Keep · preserving local cases/);
  assert.match(shellSource, /td613-ash-cache-preflight-veil/);
  assert.match(shellSource, /window\.stop\(\)/);
});

test('browser witness is bound to the exact current Legal UX delivery epochs', () => {
  assert.match(journeySource, /const EPOCH = '20260721-legal-demo-ux-v1'/);
  assert.match(journeySource, /const CACHE_EPOCH = 'td613\.ash\.cache-flush\/2026-07-21-legal-demo-ux-v1'/);
  assert.doesNotMatch(journeySource, /20260720-aia3-mass-eviction-v2/);
});

test('browser witness waits for coherent case, pointer, membrane, and exact work', () => {
  assert.match(journeySource, /async function waitForCaseComposition/);
  assert.match(journeySource, /localStorage\.getItem\('td613\.ash-keep\.current-case'\) === caseId/);
  assert.match(journeySource, /composition\?\.session_open === true/);
  assert.match(journeySource, /composition\?\.membrane_ready === true/);
  assert.match(journeySource, /composition\?\.hold == null/);
  assert.match(journeySource, /composition\?\.route_count >= 4/);
  assert.match(journeySource, /composition\?\.task_count >= 4/);
  assert.match(journeySource, /Boolean\(current\?\.lifecycle_state\)/);
  assert.match(journeySource, /visible\(root\)/);
  assert.match(journeySource, /visible\(main\) && visible\(rail\)/);
  assert.match(journeySource, /Boolean\(document\.documentElement\.dataset\.ashCompositionStable\)/);
  assert.match(journeySource, /await waitForCaseComposition\(page\)/);
  assert.match(journeySource, /opened\.pointer === opened\.case_id/);
});

test('stale-client recovery cannot finish during the blank remount interval', () => {
  assert.match(compositionSource, /v0\.5-human-profile-choice/);
  assert.match(compositionSource, /WAITING_LIFECYCLE_STATE/);
  assert.match(compositionSource, /WAITING_COMPLETE_ROUTE_TASK_GRAPH/);
  assert.match(journeySource, /document\.documentElement\.dataset\.ashCompositionHydrating !== 'true'/);
  assert.match(journeySource, /root\?\.querySelectorAll\('\[data-aia-route\]'\)\.length >= 4/);
  assert.match(journeySource, /root\?\.querySelectorAll\('\[data-aia-task\]'\)\.length >= 4/);
  assert.match(journeySource, /final\.lifecycle\.state && final\.composition\?\.lifecycle_state/);
  assert.match(journeySource, /Stale client was snapshotted before lifecycle and composition release converged/);
});

test('browser witness waits for lifecycle case binding before tutorial baseline', () => {
  assert.match(journeySource, /async function waitForLifecycleCaseBinding/);
  assert.match(journeySource, /lifecycle\?\.references\?\.case_id === caseId/);
  assert.match(journeySource, /Boolean\(lifecycle\?\.references\?\.case_map_digest\)/);
  assert.match(journeySource, /lifecycle\?\.gates\?\.map === true/);
  assert.match(journeySource, /await waitForLifecycleCaseBinding\(page, text\)/);
  assert.match(journeySource, /worker\.state === 'activated'/, 'The stale-client witness must require actual service-worker activation.');
  assert.match(journeySource, /did not activate within 20 seconds/, 'The stale-client worker activation wait must remain bounded.');
  assert.doesNotMatch(journeySource, /await navigator\.serviceWorker\.ready;/, 'The stale-client witness must not contain an unbounded service-worker readiness wait.');
  assert.doesNotMatch(journeySource, /waitForTimeout\(250\);\n  const before/);
});

class MemoryStorage {
  constructor(entries = {}) { this.values = new Map(Object.entries(entries)); }
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
  getItem(key) { return this.values.has(String(key)) ? this.values.get(String(key)) : null; }
  setItem(key, value) { this.values.set(String(key), String(value)); }
  removeItem(key) { this.values.delete(String(key)); }
}

function hostFixture({ marker = 'td613.ash.cache-flush/old-aia2' } = {}) {
  const cacheNames = new Set(['ash-aia2-old', 'ash-aia3-v1']);
  const registrations = [
    { scope:'https://td613.test/dome-world/', unregister:async () => true },
    { scope:'https://other.test/', unregister:async () => true }
  ];
  const localStorage = new MemoryStorage({
    'td613.ash.cache-flush.aia3.epoch':marker,
    'td613.ash-keep.current-case':'case_preserved',
    'td613.ash.session.epoch':'20260718-canonical-membrane-v6',
    'unrelated.local':'keep'
  });
  const sessionStorage = new MemoryStorage({ 'td613:ash-task':'document', 'unrelated.session':'keep' });
  const requests = [];
  return {
    location:{ href:'https://td613.test/dome-world/ash-keep.html', origin:'https://td613.test', hostname:'td613.test' },
    localStorage,
    sessionStorage,
    caches:{
      keys:async () => [...cacheNames],
      delete:async name => cacheNames.delete(name)
    },
    navigator:{ serviceWorker:{ getRegistrations:async () => registrations } },
    crypto:{ randomUUID:() => 'fixture-nonce' },
    fetch:async (url, init) => {
      requests.push({ url:String(url), init });
      return { ok:true, status:200, headers:{ get:key => key === 'Clear-Site-Data' ? '"cache"' : null } };
    },
    __requests:requests,
    __cacheNames:cacheNames
  };
}

test('mass eviction clears stale browser delivery surfaces while preserving the active local case', async () => {
  const host = hostFixture();
  const receipt = await runAshAia3CacheEviction(host);
  assert.equal(receipt.schema, 'td613.ash.cache-transition-receipt/v0.9-aia3-mass-eviction');
  assert.equal(receipt.epoch, ASH_AIA3_CACHE_EPOCH);
  assert.equal(receipt.asset_epoch, ASH_AIA3_ASSET_EPOCH);
  assert.equal(receipt.legacy_reset_suppressed, true);
  assert.equal(receipt.performed, true);
  assert.equal(receipt.indexeddb_preserved, true);
  assert.equal(receipt.case_data_preserved, true);
  assert.equal(receipt.active_session_reset, false);
  assert.equal(receipt.local_case_pointer_preserved, true);
  assert.equal(receipt.session_epoch_preserved, true);
  assert.deepEqual(receipt.cache_names.sort(), ['ash-aia2-old', 'ash-aia3-v1']);
  assert.deepEqual(receipt.worker_scopes, ['https://td613.test/dome-world/']);
  assert.equal(receipt.http_cache.observed, true);
  assert.equal(receipt.http_cache.clear_site_data, '"cache"');
  assert.equal(host.__cacheNames.size, 0);
  assert.equal(host.localStorage.getItem('td613.ash-keep.current-case'), 'case_preserved');
  assert.equal(host.localStorage.getItem('td613.ash.session.epoch'), '20260718-canonical-membrane-v6');
  assert.equal(host.localStorage.getItem('td613.ash.cache-flush.epoch'), ASH_LEGACY_CACHE_EPOCH);
  assert.equal(host.localStorage.getItem('unrelated.local'), 'keep');
  assert.equal(host.sessionStorage.getItem('td613:ash-task'), 'document');
  assert.equal(host.sessionStorage.getItem('unrelated.session'), 'keep');
  assert.equal(host.__requests.length, 1);
  assert.match(host.__requests[0].url, /surface=cache-evict/);
  assert.match(host.__requests[0].url, new RegExp(ASH_AIA3_ASSET_EPOCH));
  assert.equal(host.__requests[0].init.cache, 'no-store');
});

test('the current epoch is idempotent and preserves every local session boundary', async () => {
  const host = hostFixture({ marker:ASH_AIA3_CACHE_EPOCH });
  const receipt = await runAshAia3CacheEviction(host);
  assert.equal(receipt.performed, false);
  assert.equal(receipt.legacy_reset_suppressed, true);
  assert.equal(receipt.indexeddb_preserved, true);
  assert.equal(receipt.case_data_preserved, true);
  assert.equal(receipt.active_session_reset, false);
  assert.equal(receipt.local_case_pointer_preserved, true);
  assert.equal(host.__requests.length, 0);
  assert.deepEqual([...host.__cacheNames].sort(), ['ash-aia2-old', 'ash-aia3-v1']);
  assert.equal(host.localStorage.getItem('td613.ash.cache-flush.epoch'), ASH_LEGACY_CACHE_EPOCH);
});

test('legacy v7 bootstrap yields to the completed mass eviction instead of clearing the active case', async () => {
  const host = hostFixture({ marker:ASH_AIA3_CACHE_EPOCH });
  const receipt = await runAshCacheFlush(host);
  assert.equal(receipt.performed, false);
  assert.equal(receipt.superseded_by_mass_eviction, true);
  assert.equal(receipt.active_session_reset, false);
  assert.equal(host.localStorage.getItem('td613.ash-keep.current-case'), 'case_preserved');
  assert.equal(host.localStorage.getItem('td613.ash.session.epoch'), '20260718-canonical-membrane-v6');
  assert.equal(host.sessionStorage.getItem('td613:ash-task'), 'document');
  assert.equal(host.sessionStorage.getItem('unrelated.session'), 'keep');
});

console.log('ash-aia3-mass-eviction.test.mjs passed');
