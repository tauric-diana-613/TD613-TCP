import assert from 'node:assert/strict';
import fs from 'node:fs';

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
  assert(lifecycle.includes(`v=\${assetEpoch}`) || lifecycle.includes(`?v=\${assetEpoch}`), `Lifecycle asset graph lost epoch interpolation near ${token}`);
}

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

const ashHeaders = vercel.headers.filter(entry => /^\/(?:app\/)?dome-world\/ash-/.test(entry.source));
assert(ashHeaders.length >= 3, 'Ash routes lost explicit cache-control coverage.');
for (const entry of ashHeaders) {
  const value = entry.headers?.find(header => header.key === 'Cache-Control')?.value || '';
  assert(/no-store/.test(value), `Ash route ${entry.source} is not no-store.`);
}

console.log('ash-aia3-mass-eviction-v2.test.mjs passed');
