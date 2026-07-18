// Canonical membrane transition: preserves IndexedDB cases and receipts while evicting stale active-session state.
export const ASH_CACHE_FLUSH_EPOCH = 'td613.ash.cache-flush/2026-07-18-canonical-membrane-v6';

const MARKER_KEY = 'td613.ash.cache-flush.epoch';
const RECEIPT_KEY = 'td613.ash.cache-flush.receipt';
const POINTER_KEY = 'td613.ash-keep.current-case';
const SESSION_EPOCH_KEY = 'td613.ash.session.epoch';
const ASSET_EPOCH = '20260718-canonical-membrane-v6';
const EVICTION_ROUTE = '/api/dome-world-shell?surface=cache-evict';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);
const TRANSITION_QUERY_KEYS = ['ash_flush', 'asset_epoch', 'cache_nonce', 'arrival'];

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

function resetActiveSession(host = globalThis) {
  const clearedSessionKeys = [];
  try {
    host.localStorage?.removeItem?.(POINTER_KEY);
    host.localStorage?.removeItem?.(SESSION_EPOCH_KEY);
  } catch {}
  try {
    const storage = host.sessionStorage;
    if (storage) {
      for (let index = storage.length - 1; index >= 0; index -= 1) {
        const key = storage.key(index);
        if (key && /^td613(?::|\.)ash/i.test(key)) {
          storage.removeItem(key);
          clearedSessionKeys.push(key);
        }
      }
    }
  } catch {}
  try {
    host.document?.documentElement?.classList?.remove?.('ash-has-current-case');
    if (host.document?.documentElement) host.document.documentElement.dataset.ashSessionOpen = 'false';
    if (host.document?.body) host.document.body.dataset.ashCaseClosed = 'true';
  } catch {}
  return clearedSessionKeys;
}

function cleanTransitionUrl(host = globalThis) {
  try {
    const url = new URL(host.location.href);
    let changed = false;
    for (const key of TRANSITION_QUERY_KEYS) {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
        changed = true;
      }
    }
    if (changed) host.history?.replaceState?.(null, '', `${url.pathname}${url.search}${url.hash}`);
    return changed;
  } catch {
    return false;
  }
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
    const transition_url_cleaned = cleanTransitionUrl(host);
    const receipt = Object.freeze({
      schema:'td613.ash.cache-transition-receipt/v0.5-canonical-no-reload',
      epoch:ASH_CACHE_FLUSH_EPOCH,
      performed:false,
      reload_required:false,
      navigation_replaced:false,
      indexeddb_preserved:true,
      case_data_preserved:true,
      active_session_reset:false,
      transition_url_cleaned
    });
    writeReceipt(receipt);
    host.__td613AshCacheTransition = receipt;
    return receipt;
  }

  const cleared_session_keys = resetActiveSession(host);
  const [http_cache, first_cache_names, worker_scopes] = await Promise.all([
    requestHttpCacheEviction(host),
    clearCacheStorage().catch(() => []),
    unregisterSameOriginWorkers().catch(() => [])
  ]);
  const second_cache_names = await clearCacheStorage().catch(() => []);
  writeMarker();
  const transition_url_cleaned = cleanTransitionUrl(host);

  const receipt = Object.freeze({
    schema:'td613.ash.cache-transition-receipt/v0.5-canonical-no-reload',
    epoch:ASH_CACHE_FLUSH_EPOCH,
    performed:true,
    reload_required:false,
    navigation_replaced:false,
    http_cache,
    cache_names:[...new Set([...first_cache_names, ...second_cache_names])],
    worker_scopes,
    indexeddb_preserved:true,
    case_data_preserved:true,
    active_session_reset:true,
    local_case_pointer_preserved:false,
    cleared_session_keys,
    storage_cleared:false,
    transition_url_cleaned,
    release_asset_epoch:ASSET_EPOCH
  });
  writeReceipt(receipt);
  host.__td613AshCacheTransition = receipt;
  return receipt;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  await runAshCacheFlush(window);
}
