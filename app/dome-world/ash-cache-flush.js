// One-time live release transition only: preserves Ash cases, receipts, Capsules, and IndexedDB records.
export const ASH_CACHE_FLUSH_EPOCH = 'td613.ash.cache-flush/2026-07-18-live-ingress-v3';

const MARKER_KEY = 'td613.ash.cache-flush.epoch';
const RECEIPT_KEY = 'td613.ash.cache-flush.receipt';
const QUERY_KEY = 'ash_flush';
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
    url.searchParams.set('nonce', crypto.randomUUID());
    const response = await host.fetch(url, {
      cache:'reload',
      credentials:'same-origin',
      headers:{ 'Cache-Control':'no-cache', 'Pragma':'no-cache' }
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

async function unregisterDomeWorkers() {
  if (!navigator.serviceWorker?.getRegistrations) return [];
  const registrations = await navigator.serviceWorker.getRegistrations();
  const affected = registrations.filter(registration => {
    const scope = new URL(registration.scope, location.href);
    const script = registration.active?.scriptURL || registration.waiting?.scriptURL || registration.installing?.scriptURL || '';
    return scope.origin === location.origin && (/\/dome-world(?:\/|$)/.test(scope.pathname) || /(?:ash|dome-world)/i.test(script));
  });
  await Promise.all(affected.map(registration => registration.unregister()));
  return affected.map(registration => registration.scope);
}

export async function runAshCacheFlush(host = globalThis) {
  if (!host?.location || readMarker() === ASH_CACHE_FLUSH_EPOCH) {
    const receipt = Object.freeze({
      schema:'td613.ash.cache-transition-receipt/v0.2-live-release',
      epoch:ASH_CACHE_FLUSH_EPOCH,
      performed:false,
      reload_required:false,
      indexeddb_preserved:true,
      storage_cleared:false
    });
    writeReceipt(receipt);
    host.__td613AshCacheTransition = receipt;
    return receipt;
  }

  const [http_cache, cache_names, worker_scopes] = await Promise.all([
    requestHttpCacheEviction(host),
    clearCacheStorage().catch(() => []),
    unregisterDomeWorkers().catch(() => [])
  ]);
  writeMarker();

  const url = new URL(host.location.href);
  const alreadyReloaded = url.searchParams.get(QUERY_KEY) === ASH_CACHE_FLUSH_EPOCH;
  const receipt = Object.freeze({
    schema:'td613.ash.cache-transition-receipt/v0.2-live-release',
    epoch:ASH_CACHE_FLUSH_EPOCH,
    performed:true,
    reload_required:!alreadyReloaded,
    http_cache,
    cache_names,
    worker_scopes,
    indexeddb_preserved:true,
    local_case_pointer_preserved:true,
    storage_cleared:false,
    release_asset_epoch:'20260718-live-ingress-v3'
  });
  writeReceipt(receipt);
  host.__td613AshCacheTransition = receipt;

  if (!alreadyReloaded) {
    url.searchParams.set(QUERY_KEY, ASH_CACHE_FLUSH_EPOCH);
    url.searchParams.set('asset_epoch', '20260718-live-ingress-v3');
    host.location.replace(url.toString());
  }
  return receipt;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  await runAshCacheFlush(window);
}
