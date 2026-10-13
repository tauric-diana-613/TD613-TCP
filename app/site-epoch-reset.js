/* TD613 destructive browser reset retired 2026-09-29.
 * This legacy path is a non-destructive return shim for stale links only.
 */
(()=>{
  const raw = new URLSearchParams(location.search).get('return') || '/';
  let target = '/';
  try {
    const u = new URL(raw, location.origin);
    if (u.origin === location.origin && u.pathname !== '/site-epoch-reset.html') {
      u.searchParams.delete('td613_site_epoch');
      target = u.pathname + u.search + u.hash;
    }
  } catch {}
  location.replace(target);
})();
