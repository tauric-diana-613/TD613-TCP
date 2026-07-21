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

test('server preflight bypasses exact legacy rollback and republishes the governed receipt', () => {
  assert.match(shellSource, /legacyPresentation/);
  assert.match(shellSource, /legacy_bypass:true/);
  assert.match(shellSource, /__td613AshAia3PreflightReceipt/);
  assert.match(shellSource, /publish\(receipt\)/);
  assert.match(shellSource, /Updating Ash Keep · preserving local cases/);
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
