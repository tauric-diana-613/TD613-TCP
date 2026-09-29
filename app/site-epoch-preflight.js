/* TD613 site-wide destructive browser epoch retired 2026-09-29.
 * Compatibility shim only: cached station HTML may still load this path.
 * It must never navigate, clear storage, unregister workers, delete caches, or erase conversations.
 */
(()=> {
  const u = new URL(location.href);
  if (!u.searchParams.has('td613_site_epoch')) return;
  u.searchParams.delete('td613_site_epoch');
  try { history.replaceState(null, '', u.pathname + u.search + u.hash); } catch {}
})();
