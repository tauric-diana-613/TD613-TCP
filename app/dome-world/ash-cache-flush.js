// One-time maintenance epoch only: preserves Ash cases, receipts, Capsules, localStorage pointers, and IndexedDB records.
export const ASH_CACHE_FLUSH_EPOCH = 'td613.ash.cache-flush/2026-07-17-research-v2';
export const ASH_RELEASE_EPOCH = '20260717-research-hydration-v1';

const MARKER_KEY = 'td613.ash.cache-flush.epoch';
const RECEIPT_KEY = 'td613.ash.cache-flush.receipt';
const QUERY_KEY = 'ash_release';
const CRITICAL_ASSETS = Object.freeze([
  '/dome-world/ash-keep.html',
  '/dome-world/ash-keep.js',
  '/dome-world/ash-convergence.js',
  '/dome-world/ash-lifecycle.js',
  '/dome-world/ash-lifecycle-core.js',
  '/dome-world/ash-workspace-bridge.js',
  '/dome-world/ash-profile-demo-hydration.js',
  '/dome-world/ash-research-profile-hydration.js',
  '/dome-world/ash-premium-ui.js',
  '/dome-world/ash-guided-operator-ui.js'
]);

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

async function revalidateCriticalAssets(host = globalThis) {
  if (typeof host.fetch !== 'function' || !host.location) return [];
  return Promise.all(CRITICAL_ASSETS.map(async pathname => {
    const url = new URL(pathname, host.location.origin);
    url.searchParams.set('release_probe', ASH_RELEASE_EPOCH);
    try {
      const response = await host.fetch(url, {
        cache: 'reload',
        credentials: 'same-origin'
      });
      return Object.freeze({ pathname, status: response.status, ok: response.ok });
    } catch (error) {
      return Object.freeze({ pathname, status: 0, ok: false, error: error?.message || 'revalidation failed' });
    }
  }));
}

export async function runAshCacheFlush(host = globalThis) {
  if (!host?.location || readMarker() === ASH_CACHE_FLUSH_EPOCH) return Object.freeze({
    schema: 'td613.ash.cache-flush-receipt/v0.2',
    epoch: ASH_CACHE_FLUSH_EPOCH,
    release_epoch: ASH_RELEASE_EPOCH,
    performed: false,
    reload_required: false,
    preserves_case_storage: true
  });

  const [cache_names, worker_scopes, revalidated_assets] = await Promise.all([
    clearCacheStorage().catch(() => []),
    unregisterDomeWorkers().catch(() => []),
    revalidateCriticalAssets(host).catch(() => [])
  ]);
  writeMarker();

  const url = new URL(host.location.href);
  const alreadyReloaded = url.searchParams.get(QUERY_KEY) === ASH_RELEASE_EPOCH;
  const receipt = Object.freeze({
    schema: 'td613.ash.cache-flush-receipt/v0.2',
    epoch: ASH_CACHE_FLUSH_EPOCH,
    release_epoch: ASH_RELEASE_EPOCH,
    performed: true,
    reload_required: !alreadyReloaded,
    cache_storage_names: cache_names,
    service_worker_scopes: worker_scopes,
    revalidated_assets,
    preserves_case_storage: true,
    clears_http_cache_universally: false,
    claim_ceiling: 'CACHE_STORAGE_WORKERS_AND_DECLARED_ASSET_REVALIDATION'
  });
  writeReceipt(receipt);

  if (!alreadyReloaded) {
    url.searchParams.delete('ash_flush');
    url.searchParams.set(QUERY_KEY, ASH_RELEASE_EPOCH);
    host.location.replace(url.toString());
  }

  return receipt;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  await runAshCacheFlush(window);
}
