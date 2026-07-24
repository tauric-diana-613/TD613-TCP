import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  ASH_A11_PREFLIGHT_ASSET_EPOCH,
  ASH_A11_PREFLIGHT_EVICTION_EPOCH,
  ASH_LIFECYCLE_ASSET_EPOCH,
  ASH_MASS_EVICTION_EPOCH,
  injectAshKeepLifecycle
} from '../api/dome-world-shell.js';
import {
  ASH_A11_PREFLIGHT_ASSET_EPOCH as MODULE_A11_ASSET_EPOCH,
  ASH_A11_PREFLIGHT_CACHE_EPOCH,
  ASH_AIA3_ASSET_EPOCH,
  ASH_AIA3_CACHE_EPOCH,
  runAshAia3CacheEviction
} from '../app/dome-world/ash-cache-eviction-aia3.js';

const shell = fs.readFileSync(new URL('../api/dome-world-shell.js', import.meta.url), 'utf8');
const keep = fs.readFileSync(new URL('../app/dome-world/ash-keep.html', import.meta.url), 'utf8');
const receipt = fs.readFileSync(new URL('../docs/ASH_KEEP_A11_PREFLIGHT_CACHE_EVICTION_RECEIPT.md', import.meta.url), 'utf8');
const vercel = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));

assert.equal(ASH_LIFECYCLE_ASSET_EPOCH, '20260723-a2-a5-release-v1');
assert.equal(ASH_MASS_EVICTION_EPOCH, 'td613.ash.cache-flush/2026-07-23-a2-a5-release-v1');
assert.equal(ASH_AIA3_ASSET_EPOCH, ASH_LIFECYCLE_ASSET_EPOCH);
assert.equal(ASH_AIA3_CACHE_EPOCH, ASH_MASS_EVICTION_EPOCH);
assert.equal(ASH_A11_PREFLIGHT_ASSET_EPOCH, '20260724-a11-predeployment-v1');
assert.equal(ASH_A11_PREFLIGHT_EVICTION_EPOCH, 'td613.ash.cache-flush/2026-07-24-a11-predeployment-v1');
assert.equal(MODULE_A11_ASSET_EPOCH, ASH_A11_PREFLIGHT_ASSET_EPOCH);
assert.equal(ASH_A11_PREFLIGHT_CACHE_EPOCH, ASH_A11_PREFLIGHT_EVICTION_EPOCH);

for (const marker of [
  'ASH_A11_PREFLIGHT_ASSET_EPOCH',
  'ASH_A11_PREFLIGHT_EVICTION_EPOCH',
  "schema:'td613.ash.cache-preflight-receipt/v0.4-a11-predeployment'",
  "const epoch=${JSON.stringify(ASH_A11_PREFLIGHT_EVICTION_EPOCH)}",
  "const assetEpoch=${JSON.stringify(ASH_A11_PREFLIGHT_ASSET_EPOCH)}",
  'indexeddb_preserved:true',
  'case_data_preserved:true',
  'active_session_reset:false',
  'local_case_pointer_preserved:',
  'session_epoch_preserved_or_migrated:'
]) assert.ok(shell.includes(marker), `A11 preflight shell omitted ${marker}`);

const rendered = injectAshKeepLifecycle(keep);
assert.ok(rendered.includes(ASH_A11_PREFLIGHT_EVICTION_EPOCH));
assert.ok(rendered.includes(ASH_A11_PREFLIGHT_ASSET_EPOCH));
assert.ok(rendered.includes('name="ash-cache-preflight" content="a2-a5-release-v1"'));
assert.ok(rendered.indexOf(ASH_A11_PREFLIGHT_EVICTION_EPOCH) < rendered.indexOf('td613-ash-canonical-module-bootstrap'));

class MemoryStorage {
  constructor(entries = {}) { this.values = new Map(Object.entries(entries)); }
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
  getItem(key) { return this.values.has(String(key)) ? this.values.get(String(key)) : null; }
  setItem(key, value) { this.values.set(String(key), String(value)); }
  removeItem(key) { this.values.delete(String(key)); }
}

const cacheNames = new Set(['stale-a10-cache']);
const requests = [];
const host = {
  location:{ href:'https://td613.test/dome-world/ash-threshold.html', origin:'https://td613.test', hostname:'td613.test' },
  localStorage:new MemoryStorage({
    'td613.ash.cache-flush.aia3.epoch':ASH_A11_PREFLIGHT_EVICTION_EPOCH,
    'td613.ash.cache-preflight.epoch':ASH_A11_PREFLIGHT_EVICTION_EPOCH,
    'td613.ash-keep.current-case':'case_preserved',
    'td613.ash.session.epoch':'20260718-canonical-membrane-v6'
  }),
  sessionStorage:new MemoryStorage(),
  caches:{ keys:async () => [...cacheNames], delete:async name => cacheNames.delete(name) },
  navigator:{ serviceWorker:{ getRegistrations:async () => [] } },
  crypto:{ randomUUID:() => 'fixture-nonce' },
  fetch:async (...args) => { requests.push(args); throw new Error('A current A11 preflight must not request a second eviction.'); }
};

const moduleReceipt = await runAshAia3CacheEviction(host);
assert.equal(moduleReceipt.performed, false);
assert.equal(moduleReceipt.a11_predeployment_preflight_current, true);
assert.equal(moduleReceipt.epoch, ASH_A11_PREFLIGHT_EVICTION_EPOCH);
assert.equal(moduleReceipt.asset_epoch, ASH_A11_PREFLIGHT_ASSET_EPOCH);
assert.equal(moduleReceipt.indexeddb_preserved, true);
assert.equal(moduleReceipt.case_data_preserved, true);
assert.equal(moduleReceipt.active_session_reset, false);
assert.equal(moduleReceipt.local_case_pointer_preserved, true);
assert.equal(host.localStorage.getItem('td613.ash-keep.current-case'), 'case_preserved');
assert.equal(host.localStorage.getItem('td613.ash.session.epoch'), '20260718-canonical-membrane-v6');
assert.equal(host.localStorage.getItem('td613.ash.cache-flush.aia3.epoch'), ASH_A11_PREFLIGHT_EVICTION_EPOCH);
assert.equal(requests.length, 0);
assert.deepEqual([...cacheNames], ['stale-a10-cache']);

for (const marker of ['A10 closed and deployed','A11 predeployment cache eviction','IndexedDB: preserved','active case pointer: preserved','A11 remains a separate implementation and deployment packet']) {
  assert.ok(receipt.includes(marker), `A11 preflight receipt omitted ${marker}`);
}
assert.equal(vercel.git?.deploymentEnabled, false);

console.log(JSON.stringify({
  ok:true,
  schema:'td613.ash.a11-predeployment-cache-contract/v0.1',
  historical_a2_a5_identity_preserved:true,
  a11_preflight_epoch:ASH_A11_PREFLIGHT_EVICTION_EPOCH,
  a11_asset_epoch:ASH_A11_PREFLIGHT_ASSET_EPOCH,
  indexeddb_preserved:true,
  case_pointer_preserved:true,
  session_epoch_preserved:true,
  second_mass_eviction:false,
  a11_interface_present:false,
  human_closure_required:true,
  vercel_gate:'CLOSED'
}, null, 2));
