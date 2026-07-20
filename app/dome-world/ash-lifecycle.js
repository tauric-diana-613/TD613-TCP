import './ash-cache-flush.js?v=20260718-canonical-membrane-v7-readiness-boundary';
import './ash-cache-eviction-aia3.js?v=20260720-aia3-production-recovery-v1';
import './ash-ingress-layout-hydration.js?v=20260718-canonical-membrane-v6';
import './ash-lifecycle-core.js?v=20260720-ak-aia-3';

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
      link.addEventListener('load', resolve, { once: true });
      link.addEventListener('error', () => reject(new Error(`Ash stylesheet failed: ${href}`)), { once: true });
    }),
    new Promise((_, reject) => setTimeout(() => reject(new Error(`Ash stylesheet timed out: ${href}`)), 8000))
  ]);
}

document.documentElement.dataset.ashAia3 = 'td613.ash.aia3-composition/v0.1-ingress-first-compact-guide';
await Promise.all([
  ensureStyle('/dome-world/ash-keep-aia.css?v=20260720-ak-aia-2-rescue', 'data-ash-live-aia'),
  ensureStyle('/dome-world/ash-keep-aia3.css?v=20260720-aia3-production-recovery-v1', 'data-ash-aia3-style')
]);
await import('./ash-keep-aia.js?v=20260720-aia3-production-recovery-v1');
await import('./ash-aia3-composition.js?v=20260720-aia3-production-recovery-v1');
await import('./ash-keep-aia-workspace-bridge.js?v=20260720-aia3-production-recovery-v1');
