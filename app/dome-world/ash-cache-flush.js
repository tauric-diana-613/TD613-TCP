// Canonical membrane transition: preserves IndexedDB cases and receipts while evicting stale active-session state.
export const ASH_CACHE_FLUSH_EPOCH = 'td613.ash.cache-flush/2026-07-18-canonical-membrane-v7';

const MARKER_KEY = 'td613.ash.cache-flush.epoch';
const RECEIPT_KEY = 'td613.ash.cache-flush.receipt';
const READINESS_KEY = 'td613:ash-threshold:readiness:v0.1';
const POINTER_KEY = 'td613.ash-keep.current-case';
const SESSION_EPOCH_KEY = 'td613.ash.session.epoch';
const ASSET_EPOCH = '20260718-canonical-membrane-v7-readiness-boundary';
const EVICTION_ROUTE = '/api/dome-world-shell?surface=cache-evict';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);
const TRANSITION_QUERY_KEYS = ['ash_flush', 'asset_epoch', 'cache_nonce', 'arrival'];
const READINESS_MAX_AGE_MS = 15 * 60 * 1000;
const READINESS_CLOCK_SKEW_MS = 60 * 1000;
const READINESS_ROUTES = new Set(['/dome-world/ash-threshold.html', '/dome-world/ash-keep.html']);

function readMarker(host = globalThis) {
  try { return host.localStorage?.getItem?.(MARKER_KEY) || null; }
  catch { return null; }
}

function writeMarker(host = globalThis) {
  try { host.localStorage?.setItem?.(MARKER_KEY, ASH_CACHE_FLUSH_EPOCH); }
  catch {}
}

function writeReceipt(receipt, host = globalThis) {
  try { host.sessionStorage?.setItem?.(RECEIPT_KEY, JSON.stringify(receipt)); }
  catch {}
}

export function validThresholdReadiness(host = globalThis, storage = host.sessionStorage) {
  try {
    const url = new URL(host.location.href);
    if (!READINESS_ROUTES.has(url.pathname)) return false;
    const receipt = JSON.parse(storage?.getItem?.(READINESS_KEY) || 'null');
    const observedAt = Date.parse(receipt?.observed_at || '');
    const age = Date.now() - observedAt;
    return receipt?.schema === 'td613.ash.readiness-receipt/v0.1'
      && receipt?.lifecycle_schema === 'td613.ash.lifecycle/v0.1'
      && receipt?.state === 'READINESS_OBSERVED'
      && receipt?.source_surface === 'dome-world-ash-threshold'
      && receipt?.threshold_gestures?.arrival_acknowledged === true
      && receipt?.threshold_gestures?.boundary_acknowledged === true
      && receipt?.threshold_gestures?.custody_acknowledged === true
      && receipt?.raw_content_accepted === false
      && receipt?.raw_content_persisted === false
      && receipt?.transport_performed === false
      && receipt?.readiness_is_custody === false
      && typeof receipt?.readiness_digest === 'string'
      && /^sha256:[0-9a-f]{64}$/i.test(receipt.readiness_digest)
      && Number.isFinite(observedAt)
      && age >= -READINESS_CLOCK_SKEW_MS
      && age <= READINESS_MAX_AGE_MS;
  } catch {
    return false;
  }
}

export function resetActiveSession(host = globalThis) {
  const clearedSessionKeys = [];
  const preservedSessionKeys = [];
  try {
    host.localStorage?.removeItem?.(POINTER_KEY);
    host.localStorage?.removeItem?.(SESSION_EPOCH_KEY);
  } catch {}
  try {
    const storage = host.sessionStorage;
    const preserveReadiness = validThresholdReadiness(host, storage);
    if (storage) {
      for (let index = storage.length - 1; index >= 0; index -= 1) {
        const key = storage.key(index);
        if (!key || !/^td613(?::|\.)ash/i.test(key)) continue;
        if (key === READINESS_KEY && preserveReadiness) {
          preservedSessionKeys.push(key);
          continue;
        }
        storage.removeItem(key);
        clearedSessionKeys.push(key);
      }
    }
  } catch {}
  try {
    host.document?.documentElement?.classList?.remove?.('ash-has-current-case');
    if (host.document?.documentElement) host.document.documentElement.dataset.ashSessionOpen = 'false';
    if (host.document?.body) host.document.body.dataset.ashCaseClosed = 'true';
  } catch {}
  return Object.freeze({ clearedSessionKeys, preservedSessionKeys });
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

async function clearCacheStorage(host = globalThis) {
  const cacheStorage = host.caches;
  if (!cacheStorage?.keys) return [];
  const names = await cacheStorage.keys();
  await Promise.all(names.map(name => cacheStorage.delete(name)));
  return names;
}

async function unregisterSameOriginWorkers(host = globalThis) {
  if (!host.navigator?.serviceWorker?.getRegistrations) return [];
  const registrations = await host.navigator.serviceWorker.getRegistrations();
  const affected = registrations.filter(registration => {
    try { return new URL(registration.scope, host.location.href).origin === host.location.origin; }
    catch { return false; }
  });
  await Promise.all(affected.map(registration => registration.unregister()));
  return affected.map(registration => registration.scope);
}

export async function runAshCacheFlush(host = globalThis) {
  if (!host?.location || readMarker(host) === ASH_CACHE_FLUSH_EPOCH) {
    const transition_url_cleaned = cleanTransitionUrl(host);
    const receipt = Object.freeze({
      schema:'td613.ash.cache-transition-receipt/v0.7-readiness-boundary',
      epoch:ASH_CACHE_FLUSH_EPOCH,
      performed:false,
      reload_required:false,
      navigation_replaced:false,
      indexeddb_preserved:true,
      case_data_preserved:true,
      active_session_reset:false,
      readiness_receipt_preserved:Boolean(host.sessionStorage?.getItem?.(READINESS_KEY)),
      transition_url_cleaned
    });
    writeReceipt(receipt, host);
    host.__td613AshCacheTransition = receipt;
    return receipt;
  }

  const sessionReset = resetActiveSession(host);
  const [http_cache, first_cache_names, worker_scopes] = await Promise.all([
    requestHttpCacheEviction(host),
    clearCacheStorage(host).catch(() => []),
    unregisterSameOriginWorkers(host).catch(() => [])
  ]);
  const second_cache_names = await clearCacheStorage(host).catch(() => []);
  writeMarker(host);
  const transition_url_cleaned = cleanTransitionUrl(host);

  const receipt = Object.freeze({
    schema:'td613.ash.cache-transition-receipt/v0.7-readiness-boundary',
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
    cleared_session_keys:sessionReset.clearedSessionKeys,
    preserved_session_keys:sessionReset.preservedSessionKeys,
    readiness_receipt_preserved:sessionReset.preservedSessionKeys.includes(READINESS_KEY),
    storage_cleared:false,
    transition_url_cleaned,
    release_asset_epoch:ASSET_EPOCH
  });
  writeReceipt(receipt, host);
  host.__td613AshCacheTransition = receipt;
  return receipt;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  await runAshCacheFlush(window);
}
