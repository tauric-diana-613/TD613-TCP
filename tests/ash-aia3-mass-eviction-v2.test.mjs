import assert from 'node:assert/strict';
import fs from 'node:fs';
import { runAshAia3CacheEviction } from '../app/dome-world/ash-cache-eviction-aia3.js';

const shell = fs.readFileSync('api/dome-world-shell.js', 'utf8');
const lifecycle = fs.readFileSync('app/dome-world/ash-lifecycle.js', 'utf8');
const cache = fs.readFileSync('app/dome-world/ash-cache-eviction-aia3.js', 'utf8');
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

for (const token of [
  'td613.dome-world.shell/v1.5-aia3-mass-eviction',
  'td613.ash-keep.shell/v0.4-aia3-mass-eviction',
  'td613.ash.cache-transition/v0.4-aia3-mass-eviction',
  '20260720-aia3-mass-eviction-v2',
  'ash-cache-preflight',
  'Updating Ash Keep · preserving local cases',
  'globalThis.caches?.keys',
  'navigator.serviceWorker?.getRegistrations',
  "Clear-Site-Data', '\"cache\"'",
  'local_case_pointer_preserved',
  'session_epoch_preserved',
  'location.replace',
  'ASH_VERSIONED_MODULES',
  'CDN-Cache-Control',
  'Vercel-CDN-Cache-Control'
]) assert(shell.includes(token), `Mass-eviction shell omitted ${token}`);

assert.doesNotMatch(shell, /indexedDB\.deleteDatabase|localStorage\.clear\(|sessionStorage\.clear\(/);
assert.match(shell, /ASH_CANONICAL_MEMBRANE_EPOCH = '20260718-canonical-membrane-v6'/);
assert.match(shell, /active_session_reset_by_client:false/);

assert(lifecycle.indexOf('ash-cache-eviction-aia3.js') < lifecycle.indexOf('ash-ingress-layout-hydration.js'), 'Eviction must precede ingress hydration.');
assert(lifecycle.indexOf('ash-cache-eviction-aia3.js') < lifecycle.indexOf('ash-lifecycle-core.js'), 'Eviction must precede lifecycle core.');
assert.doesNotMatch(lifecycle, /ash-cache-flush\.js/);
for (const token of ['ash-keep-aia.css', 'ash-keep-aia3.css', 'ash-keep-aia3-compact.css', 'ash-keep-aia3-interaction.css', 'ash-keep-aia.js', 'ash-aia3-composition.js', 'ash-keep-aia-workspace-bridge.js']) {
  assert(lifecycle.includes(token), `Lifecycle asset graph omitted ${token}`);
}
assert.equal((lifecycle.match(/\?v=\$\{assetEpoch\}/g) || []).length >= 10, true, 'Lifecycle graph lost common epoch routing.');

for (const token of [
  'td613.ash.cache-flush/2026-07-20-aia3-mass-eviction-v2',
  'td613.ash.cache-transition-receipt/v0.9-aia3-mass-eviction',
  'indexeddb_preserved:true',
  'case_data_preserved:true',
  'active_session_reset:false',
  'local_case_pointer_preserved:pointerAfter === pointerBefore',
  'session_epoch_preserved:sessionAfter === sessionBefore'
]) assert(cache.includes(token), `Client eviction omitted ${token}`);
assert.doesNotMatch(cache, /removeItem\?\.\(POINTER_KEY\)|removeItem\?\.\(SESSION_KEY\)|indexedDB\.deleteDatabase|localStorage\.clear|sessionStorage\.clear/);

class Storage {
  constructor(entries = {}) { this.values = new Map(Object.entries(entries)); }
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(String(key), String(value)); }
  removeItem(key) { this.values.delete(String(key)); }
}
const deletedCaches = [];
const unregistered = [];
const host = {
  location:{ href:'https://td613.test/dome-world/ash-keep.html', origin:'https://td613.test', hostname:'td613.test' },
  localStorage:new Storage({ 'td613.ash-keep.current-case':'case_preserve', 'td613.ash.session.epoch':'20260718-canonical-membrane-v6' }),
  sessionStorage:new Storage(),
  caches:{ async keys(){ return ['old-aia2-cache']; }, async delete(name){ deletedCaches.push(name); return true; } },
  navigator:{ serviceWorker:{ async getRegistrations(){ return [{ scope:'https://td613.test/dome-world/', async unregister(){ unregistered.push(this.scope); return true; } }]; } } },
  crypto:{ randomUUID(){ return '00000000-0000-4000-8000-000000000000'; } },
  async fetch(){ return { ok:true, status:200, headers:{ get(name){ return name.toLowerCase() === 'clear-site-data' ? '"cache"' : null; } } }; }
};
const receipt = await runAshAia3CacheEviction(host);
assert.equal(receipt.performed, true);
assert.deepEqual(deletedCaches, ['old-aia2-cache', 'old-aia2-cache']);
assert.deepEqual(unregistered, ['https://td613.test/dome-world/']);
assert.equal(host.localStorage.getItem('td613.ash-keep.current-case'), 'case_preserve');
assert.equal(host.localStorage.getItem('td613.ash.session.epoch'), '20260718-canonical-membrane-v6');
assert.equal(receipt.local_case_pointer_preserved, true);
assert.equal(receipt.session_epoch_preserved, true);
assert.equal(receipt.indexeddb_preserved, true);
assert.equal(receipt.case_data_preserved, true);

for (const source of ['/dome-world/ash-(.*)', '/app/dome-world/ash-(.*)']) {
  const entry = vercel.headers.find(candidate => candidate.source === source);
  assert(entry, `Missing broad Ash no-store boundary ${source}.`);
  assert.match(entry.headers?.find(header => header.key === 'Cache-Control')?.value || '', /no-store/);
}

console.log('ash-aia3-mass-eviction-v2.test.mjs passed');
