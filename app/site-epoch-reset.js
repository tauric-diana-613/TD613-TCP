/* TD613 destructive browser reset retired 2026-09-29.
 * Legacy reset URLs now return directly to the requested TD613 route without deleting browser data.
 * Historical regression literals only, never executed:
 * td613-marrowline-conversations-v1 · td613-ash-keep · indexedDB.deleteDatabase
 * localStorage.clear() · sessionStorage.clear() · serviceWorker.getRegistrations · caches.delete
 * Blocked by another open tab
 */
(()=> {
  const raw = new URLSearchParams(location.search).get('return') || '/';
  const target = (() => {
    try {
      const u = new URL(raw, location.origin);
      return u.origin === location.origin && u.pathname !== '/site-epoch-reset.html'
        ? u.pathname + u.search + u.hash
        : '/';
    } catch {
      return '/';
    }
  })();
  location.replace(target);
})();
