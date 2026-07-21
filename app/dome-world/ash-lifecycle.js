const preflight = globalThis.__td613AshAia3Preflight;
if (preflight && typeof preflight.then === 'function') await preflight;

await import('./ash-cache-flush.js?v=20260720-aia3-mass-eviction-v2');
await import('./ash-ingress-layout-hydration.js?v=20260720-aia3-mass-eviction-v2');
await import('./ash-lifecycle-core.js?v=20260720-aia3-mass-eviction-v2');

const legacyPresentation = new URLSearchParams(location.search).get('presentation') === 'legacy';

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
} else {
  document.documentElement.dataset.ashAia3 = 'td613.ash.aia3-composition/v0.3-atomic-ingress-readiness';
  await import('./ash-cache-eviction-aia3.js?v=20260720-aia3-mass-eviction-v2');
  await Promise.all([
    ensureStyle('/dome-world/ash-keep-aia.css?v=20260720-aia3-mass-eviction-v2', 'data-ash-live-aia'),
    ensureStyle('/dome-world/ash-keep-aia3.css?v=20260720-aia3-mass-eviction-v2', 'data-ash-aia3-style'),
    ensureStyle('/dome-world/ash-keep-aia3-compact.css?v=20260720-aia3-mass-eviction-v2', 'data-ash-aia3-compact'),
    ensureStyle('/dome-world/ash-keep-aia3-interaction.css?v=20260720-aia3-mass-eviction-v2', 'data-ash-aia3-interaction')
  ]);
  await import('./ash-keep-aia.js?v=20260720-aia3-mass-eviction-v2');
  await import('./ash-aia3-composition.js?v=20260720-aia3-mass-eviction-v2');
  await import('./ash-keep-aia-workspace-bridge.js?v=20260720-aia3-mass-eviction-v2');
}
