const legacyPresentation = new URLSearchParams(location.search).get('presentation') === 'legacy';
const assetEpoch = '20260720-aia3-mass-eviction-v2';

async function ensureStyle(href, marker) {
  let link = document.querySelector(`link[${marker}]`);
  if (!link) {
    link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute(marker, 'true');
    document.head.append(link);
  }
  if (link.sheet) return;
  await Promise.race([
    new Promise((resolve, reject) => {
      link.addEventListener('load', resolve, { once:true });
      link.addEventListener('error', () => reject(new Error(`Ash stylesheet failed: ${href}`)), { once:true });
    }),
    new Promise((_, reject) => setTimeout(() => reject(new Error(`Ash stylesheet timed out: ${href}`)), 8000))
  ]);
}

if (legacyPresentation) {
  document.documentElement.dataset.ashAiaLegacy = 'true';
  delete document.documentElement.dataset.ashAia3;
  delete document.documentElement.dataset.ashAia3Ready;
  await import(`./ash-ingress-layout-hydration.js?v=${assetEpoch}`);
  await import(`./ash-lifecycle-core.js?v=${assetEpoch}`);
} else {
  document.documentElement.dataset.ashAia3 = 'td613.ash.aia3-composition/v0.3-atomic-ingress-readiness';
  document.documentElement.dataset.ashAia3Ready = 'false';

  // CacheStorage and same-origin workers must be evicted before any AIA, lifecycle,
  // ingress, or composition module can enter the live graph. The transition keeps
  // IndexedDB, the local case pointer, and the active session epoch intact.
  await import(`./ash-cache-eviction-aia3.js?v=${assetEpoch}`);
  await import(`./ash-ingress-layout-hydration.js?v=${assetEpoch}`);
  await import(`./ash-lifecycle-core.js?v=${assetEpoch}`);

  await Promise.all([
    ensureStyle(`/dome-world/ash-keep-aia.css?v=${assetEpoch}`, 'data-ash-live-aia'),
    ensureStyle(`/dome-world/ash-keep-aia3.css?v=${assetEpoch}`, 'data-ash-aia3-style'),
    ensureStyle(`/dome-world/ash-keep-aia3-compact.css?v=${assetEpoch}`, 'data-ash-aia3-compact'),
    ensureStyle(`/dome-world/ash-keep-aia3-interaction.css?v=${assetEpoch}`, 'data-ash-aia3-interaction')
  ]);
  await import(`./ash-keep-aia.js?v=${assetEpoch}`);
  await import(`./ash-aia3-composition.js?v=${assetEpoch}`);
  await import(`./ash-keep-aia-workspace-bridge.js?v=${assetEpoch}`);
}