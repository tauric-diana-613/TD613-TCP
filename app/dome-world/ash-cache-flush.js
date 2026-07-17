export const ASH_CACHE_FLUSH_EPOCH = 'td613.ash.cache-flush/2026-07-17-premium-v1';

const MARKER_KEY = 'td613.ash.cache-flush.epoch';
const QUERY_KEY = 'ash_flush';

function readMarker() {
  try { return localStorage.getItem(MARKER_KEY); }
  catch { return null; }
}

function writeMarker() {
  try { localStorage.setItem(MARKER_KEY, ASH_CACHE_FLUSH_EPOCH); }
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

export async function runAshCacheFlush(host = globalThis) {
  if (!host?.location || readMarker() === ASH_CACHE_FLUSH_EPOCH) return Object.freeze({
    epoch: ASH_CACHE_FLUSH_EPOCH,
    performed: false,
    reload_required: false
  });

  const [cache_names, worker_scopes] = await Promise.all([
    clearCacheStorage().catch(() => []),
    unregisterDomeWorkers().catch(() => [])
  ]);
  writeMarker();

  const url = new URL(host.location.href);
  const alreadyReloaded = url.searchParams.get(QUERY_KEY) === ASH_CACHE_FLUSH_EPOCH;
  if (!alreadyReloaded) {
    url.searchParams.set(QUERY_KEY, ASH_CACHE_FLUSH_EPOCH);
    host.location.replace(url.toString());
  }

  return Object.freeze({
    epoch: ASH_CACHE_FLUSH_EPOCH,
    performed: true,
    reload_required: !alreadyReloaded,
    cache_names,
    worker_scopes
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  await runAshCacheFlush(window);
}
