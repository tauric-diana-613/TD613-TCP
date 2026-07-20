export const ASH_AIA3_CACHE_EPOCH = 'td613.ash.cache-flush/2026-07-20-aia3-production-recovery-v1';
export const ASH_AIA3_ASSET_EPOCH = '20260720-aia3-production-recovery-v1';
const MARKER_KEY = 'td613.ash.cache-flush.aia3.epoch';
const RECEIPT_KEY = 'td613.ash.cache-flush.aia3.receipt';
const POINTER_KEY = 'td613.ash-keep.current-case';
const SESSION_KEY = 'td613.ash.session.epoch';
const EVICTION_ROUTE = '/api/dome-world-shell?surface=cache-evict';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);
function readMarker(host) { try { return host.localStorage?.getItem?.(MARKER_KEY) || null; } catch { return null; } }
function writeMarker(host) { try { host.localStorage?.setItem?.(MARKER_KEY, ASH_AIA3_CACHE_EPOCH); } catch {} }
function writeReceipt(host, receipt) { try { host.sessionStorage?.setItem?.(RECEIPT_KEY, JSON.stringify(receipt)); } catch {} }
async function clearCacheStorage(host) { if (!host.caches?.keys) return []; const names = await host.caches.keys(); await Promise.all(names.map(name => host.caches.delete(name))); return names; }
async function unregisterWorkers(host) { if (!host.navigator?.serviceWorker?.getRegistrations) return []; const registrations = await host.navigator.serviceWorker.getRegistrations(); const sameOrigin = registrations.filter(registration => { try { return new URL(registration.scope, host.location.href).origin === host.location.origin; } catch { return false; } }); await Promise.all(sameOrigin.map(registration => registration.unregister())); return sameOrigin.map(registration => registration.scope); }
async function requestHttpEviction(host) {
  if (LOCAL_HOSTS.has(String(host.location?.hostname || '').toLowerCase())) return { attempted: false, observed: false, reason: 'LOCAL_RUNTIME' };
  try {
    const url = new URL(EVICTION_ROUTE, host.location.href);
    url.searchParams.set('epoch', ASH_AIA3_CACHE_EPOCH); url.searchParams.set('asset_epoch', ASH_AIA3_ASSET_EPOCH); url.searchParams.set('nonce', crypto.randomUUID());
    const response = await host.fetch(url, { cache: 'no-store', credentials: 'same-origin', headers: { 'Cache-Control': 'no-cache, no-store, max-age=0', Pragma: 'no-cache' } });
    return { attempted: true, observed: response.ok, status: response.status };
  } catch (error) { return { attempted: true, observed: false, reason: error.message }; }
}
export async function runAshAia3CacheEviction(host = globalThis) {
  if (!host?.location || readMarker(host) === ASH_AIA3_CACHE_EPOCH) {
    const receipt = Object.freeze({ schema: 'td613.ash.cache-transition-receipt/v0.8-aia3', epoch: ASH_AIA3_CACHE_EPOCH, performed: false, indexeddb_preserved: true, case_data_preserved: true, active_session_reset: false });
    writeReceipt(host, receipt); host.__td613AshAia3CacheTransition = receipt; return receipt;
  }
  const [http_cache, first_names, worker_scopes] = await Promise.all([requestHttpEviction(host), clearCacheStorage(host).catch(() => []), unregisterWorkers(host).catch(() => [])]);
  const second_names = await clearCacheStorage(host).catch(() => []);
  try {
    host.localStorage?.removeItem?.(POINTER_KEY); host.localStorage?.removeItem?.(SESSION_KEY);
    for (let index = host.sessionStorage?.length - 1; index >= 0; index -= 1) { const key = host.sessionStorage.key(index); if (key && /^td613(?::|\.)ash/i.test(key)) host.sessionStorage.removeItem(key); }
  } catch {}
  writeMarker(host);
  const receipt = Object.freeze({ schema: 'td613.ash.cache-transition-receipt/v0.8-aia3', epoch: ASH_AIA3_CACHE_EPOCH, asset_epoch: ASH_AIA3_ASSET_EPOCH, performed: true, http_cache, cache_names: [...new Set([...first_names, ...second_names])], worker_scopes, indexeddb_preserved: true, case_data_preserved: true, active_session_reset: true, local_case_pointer_preserved: false, storage_cleared: false, reload_required: false });
  writeReceipt(host, receipt); host.__td613AshAia3CacheTransition = receipt; return receipt;
}
if (typeof window !== 'undefined' && typeof document !== 'undefined') await runAshAia3CacheEviction(window);
