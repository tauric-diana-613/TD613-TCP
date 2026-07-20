export function openRouteInNewTab(url, environment = globalThis) {
  const baseHref = environment.location?.href || 'http://localhost/';
  const href = new URL(url, baseHref).href;
  let popup = null;

  try {
    popup = environment.open?.('', '_blank') || null;
  } catch {
    popup = null;
  }

  if (popup) {
    try {
      popup.opener = null;
      if (typeof popup.location?.replace === 'function') popup.location.replace(href);
      else popup.location.href = href;
      return { mode: 'new-tab', href };
    } catch {
      try { popup.close?.(); } catch {}
    }
  }

  environment.location?.assign?.(href);
  return { mode: 'same-tab-fallback', href };
}
