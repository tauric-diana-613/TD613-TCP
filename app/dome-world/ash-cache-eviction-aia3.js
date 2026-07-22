export const ASH_AIA3_CACHE_EPOCH = 'td613.ash.cache-flush/2026-07-21-legal-demo-ux-v1';
export const ASH_AIA3_ASSET_EPOCH = '20260721-legal-demo-ux-v1';
export const ASH_LEGACY_CACHE_EPOCH = 'td613.ash.cache-flush/2026-07-18-canonical-membrane-v7';
const MARKER_KEY = 'td613.ash.cache-flush.aia3.epoch';
const PREFLIGHT_MARKER_KEY = 'td613.ash.cache-preflight.epoch';
const LEGACY_MARKER_KEY = 'td613.ash.cache-flush.epoch';
const RECEIPT_KEY = 'td613.ash.cache-flush.aia3.receipt';
const POINTER_KEY = 'td613.ash-keep.current-case';
const SESSION_KEY = 'td613.ash.session.epoch';
const EVICTION_ROUTE = '/api/dome-world-shell?surface=cache-evict';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

function readMarker(host) {
  try {
    return host.localStorage?.getItem?.(MARKER_KEY) || host.localStorage?.getItem?.(PREFLIGHT_MARKER_KEY) || null;
  } catch { return null; }
}

function writeMarker(host) {
  try {
    host.localStorage?.setItem?.(MARKER_KEY, ASH_AIA3_CACHE_EPOCH);
    host.localStorage?.setItem?.(PREFLIGHT_MARKER_KEY, ASH_AIA3_CACHE_EPOCH);
    host.localStorage?.setItem?.(LEGACY_MARKER_KEY, ASH_LEGACY_CACHE_EPOCH);
  } catch {}
}

function writeReceipt(host, receipt) {
  try { host.sessionStorage?.setItem?.(RECEIPT_KEY, JSON.stringify(receipt)); }
  catch {}
}

async function clearCacheStorage(host) {
  if (!host.caches?.keys) return [];
  const names = await host.caches.keys();
  await Promise.all(names.map(name => host.caches.delete(name)));
  return names;
}

async function unregisterWorkers(host) {
  if (!host.navigator?.serviceWorker?.getRegistrations) return [];
  const registrations = await host.navigator.serviceWorker.getRegistrations();
  const sameOrigin = registrations.filter(registration => {
    try { return new URL(registration.scope, host.location.href).origin === host.location.origin; }
    catch { return false; }
  });
  await Promise.all(sameOrigin.map(registration => registration.unregister()));
  return sameOrigin.map(registration => registration.scope);
}

async function requestHttpEviction(host) {
  if (LOCAL_HOSTS.has(String(host.location?.hostname || '').toLowerCase())) {
    return { attempted:false, observed:false, reason:'LOCAL_RUNTIME' };
  }
  try {
    const url = new URL(EVICTION_ROUTE, host.location.href);
    url.searchParams.set('epoch', ASH_AIA3_CACHE_EPOCH);
    url.searchParams.set('asset_epoch', ASH_AIA3_ASSET_EPOCH);
    url.searchParams.set('nonce', host.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`);
    const response = await host.fetch(url, {
      cache:'no-store',
      credentials:'same-origin',
      headers:{ 'Cache-Control':'no-cache, no-store, max-age=0', Pragma:'no-cache' }
    });
    return {
      attempted:true,
      observed:response.ok,
      status:response.status,
      clear_site_data:response.headers?.get?.('Clear-Site-Data') || null
    };
  } catch (error) {
    return { attempted:true, observed:false, reason:error.message };
  }
}

export async function runAshAia3CacheEviction(host = globalThis) {
  const pointerBefore = (() => { try { return host.localStorage?.getItem?.(POINTER_KEY) || null; } catch { return null; } })();
  const sessionBefore = (() => { try { return host.localStorage?.getItem?.(SESSION_KEY) || null; } catch { return null; } })();
  if (!host?.location || readMarker(host) === ASH_AIA3_CACHE_EPOCH) {
    writeMarker(host);
    const receipt = Object.freeze({
      schema:'td613.ash.cache-transition-receipt/v0.9-aia3-mass-eviction',
      epoch:ASH_AIA3_CACHE_EPOCH,
      asset_epoch:ASH_AIA3_ASSET_EPOCH,
      legacy_reset_suppressed:true,
      performed:false,
      indexeddb_preserved:true,
      case_data_preserved:true,
      active_session_reset:false,
      local_case_pointer_preserved:true,
      pointer_present:Boolean(pointerBefore),
      session_epoch_preserved:sessionBefore
    });
    writeReceipt(host, receipt);
    host.__td613AshAia3CacheTransition = receipt;
    return receipt;
  }

  const [http_cache, firstNames, workerScopes] = await Promise.all([
    requestHttpEviction(host),
    clearCacheStorage(host).catch(() => []),
    unregisterWorkers(host).catch(() => [])
  ]);
  const secondNames = await clearCacheStorage(host).catch(() => []);
  writeMarker(host);

  const pointerAfter = (() => { try { return host.localStorage?.getItem?.(POINTER_KEY) || null; } catch { return null; } })();
  const sessionAfter = (() => { try { return host.localStorage?.getItem?.(SESSION_KEY) || null; } catch { return null; } })();
  const receipt = Object.freeze({
    schema:'td613.ash.cache-transition-receipt/v0.9-aia3-mass-eviction',
    epoch:ASH_AIA3_CACHE_EPOCH,
    asset_epoch:ASH_AIA3_ASSET_EPOCH,
    legacy_reset_suppressed:true,
    performed:true,
    http_cache,
    cache_names:[...new Set([...firstNames, ...secondNames])],
    worker_scopes:workerScopes,
    indexeddb_preserved:true,
    case_data_preserved:true,
    active_session_reset:false,
    local_case_pointer_preserved:pointerAfter === pointerBefore,
    session_epoch_preserved:sessionAfter === sessionBefore,
    storage_cleared:false,
    reload_required:false
  });
  writeReceipt(host, receipt);
  host.__td613AshAia3CacheTransition = receipt;
  return receipt;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  await runAshAia3CacheEviction(window);
}
