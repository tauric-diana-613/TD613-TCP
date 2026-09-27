/* Origin-wide TD613 reset: runs before application scripts, once per browser profile. */
(()=> {
  const E="td613.site.browser-reset/2026-09-27-v1", K="td613.site.browser-reset.epoch";
  if (location.pathname==='/site-epoch-reset.html') return;
  let current=false;
  try { current=localStorage.getItem(K)===E; } catch {}
  if (!current) try { current=sessionStorage.getItem(K)===E; } catch {}
  const u=new URL(location.href);
  if (!current && u.searchParams.get('td613_site_epoch')===E) current=true;
  if (current) {
    if (u.searchParams.has('td613_site_epoch')) {
      u.searchParams.delete('td613_site_epoch');
      try { history.replaceState(null,'',u.pathname+u.search+u.hash); } catch {}
    }
    return;
  }
  const destination=new URL('/site-epoch-reset.html',location.origin);
  destination.searchParams.set('return',location.pathname+location.search+location.hash);
  location.replace(destination.href);
})();
