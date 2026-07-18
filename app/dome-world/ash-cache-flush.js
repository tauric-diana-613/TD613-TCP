// Emergency live release transition only: preserves Ash cases, receipts, Capsules, IndexedDB, and local case pointers.
export const ASH_CACHE_FLUSH_EPOCH = 'td613.ash.cache-flush/2026-07-18-emergency-stability-v5';

const MARKER_KEY = 'td613.ash.cache-flush.epoch';
const RECEIPT_KEY = 'td613.ash.cache-flush.receipt';
const QUERY_KEY = 'ash_flush';
const ASSET_EPOCH = '20260718-emergency-stability-v5';
const EVICTION_ROUTE = '/api/dome-world-shell?surface=cache-evict';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

function readMarker() {
  try { return localStorage.getItem(MARKER_KEY); }
  catch { return null; }
}

function writeMarker() {
  try { localStorage.setItem(MARKER_KEY, ASH_CACHE_FLUSH_EPOCH); }
  catch {}
}

function writeReceipt(receipt) {
  try { sessionStorage.setItem(RECEIPT_KEY, JSON.stringify(receipt)); }
  catch {}
}

async function requestHttpCacheEviction(host) {
  const hostname = String(host.location?.hostname || '').toLowerCase();
  if (LOCAL_HOSTS.has(hostname)) {
    return Object.freeze({
      attempted:false,
      observed:false,
      reason:'LOCAL_BOUNDED_RUNTIME_HAS_NO_VERCEL_HEADER_SURFACE'
    });
  }
  if (typeof host.fetch !== 'function') return Object.freeze({ attempted:false, observed:false, reason:'FETCH_UNAVAILABLE' });
  try {
    const url = new URL(EVICTION_ROUTE, host.location.href);
    url.searchParams.set('epoch', ASH_CACHE_FLUSH_EPOCH);
    url.searchParams.set('asset_epoch', ASSET_EPOCH);
    url.searchParams.set('nonce', crypto.randomUUID());
    const response = await host.fetch(url, {
      cache:'no-store',
      credentials:'same-origin',
      headers:{ 'Cache-Control':'no-cache, no-store, max-age=0', 'Pragma':'no-cache' }
    });
    return Object.freeze({
      attempted:true,
      observed:response.ok,
      status:response.status,
      clear_site_data:response.headers.get('clear-site-data') || 'UNOBSERVED'
    });
  } catch (error) {
    return Object.freeze({ attempted:true, observed:false, reason:error.message });
  }
}

async function clearCacheStorage() {
  if (!globalThis.caches?.keys) return [];
  const names = await caches.keys();
  await Promise.all(names.map(name => caches.delete(name)));
  return names;
}

async function unregisterSameOriginWorkers() {
  if (!navigator.serviceWorker?.getRegistrations) return [];
  const registrations = await navigator.serviceWorker.getRegistrations();
  const affected = registrations.filter(registration => {
    try { return new URL(registration.scope, location.href).origin === location.origin; }
    catch { return false; }
  });
  await Promise.all(affected.map(registration => registration.unregister()));
  return affected.map(registration => registration.scope);
}

export async function runAshCacheFlush(host = globalThis) {
  if (!host?.location || readMarker() === ASH_CACHE_FLUSH_EPOCH) {
    const receipt = Object.freeze({
      schema:'td613.ash.cache-transition-receipt/v0.3-emergency-release',
      epoch:ASH_CACHE_FLUSH_EPOCH,
      performed:false,
      reload_required:false,
      indexeddb_preserved:true,
      local_case_pointer_preserved:true,
      storage_cleared:false
    });
    writeReceipt(receipt);
    host.__td613AshCacheTransition = receipt;
    return receipt;
  }

  const [http_cache, first_cache_names, worker_scopes] = await Promise.all([
    requestHttpCacheEviction(host),
    clearCacheStorage().catch(() => []),
    unregisterSameOriginWorkers().catch(() => [])
  ]);
  const second_cache_names = await clearCacheStorage().catch(() => []);
  writeMarker();

  const url = new URL(host.location.href);
  const alreadyReloaded = url.searchParams.get(QUERY_KEY) === ASH_CACHE_FLUSH_EPOCH;
  const receipt = Object.freeze({
    schema:'td613.ash.cache-transition-receipt/v0.3-emergency-release',
    epoch:ASH_CACHE_FLUSH_EPOCH,
    performed:true,
    reload_required:!alreadyReloaded,
    http_cache,
    cache_names:[...new Set([...first_cache_names, ...second_cache_names])],
    worker_scopes,
    indexeddb_preserved:true,
    local_case_pointer_preserved:true,
    storage_cleared:false,
    release_asset_epoch:ASSET_EPOCH
  });
  writeReceipt(receipt);
  host.__td613AshCacheTransition = receipt;

  if (!alreadyReloaded) {
    url.searchParams.set(QUERY_KEY, ASH_CACHE_FLUSH_EPOCH);
    url.searchParams.set('asset_epoch', ASSET_EPOCH);
    url.searchParams.set('cache_nonce', crypto.randomUUID());
    host.location.replace(url.toString());
  }
  return receipt;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  await runAshCacheFlush(window);
}
