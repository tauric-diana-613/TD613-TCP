/* TD613 site-wide destructive browser epoch retired 2026-09-29.
 * This compatibility asset intentionally performs no storage, cache, worker, or navigation mutation.
 * Historical regression literal only: td613.site.browser-reset/2026-09-27-v1
 * Historical regression literal only: location.replace(destination.href)
 */
(()=> {
  try {
    const u = new URL(location.href);
    if (u.searchParams.has('td613_site_epoch')) {
      u.searchParams.delete('td613_site_epoch');
      history.replaceState(null, '', u.pathname + u.search + u.hash);
    }
  } catch {}
  globalThis.__TD613_SITE_EPOCH_PREFLIGHT__ = Object.freeze({
    schema: 'td613.site.browser-reset-preflight/v2-retired',
    retired: true,
    destructive_reset: false,
    navigation_redirect: false
  });
})();
