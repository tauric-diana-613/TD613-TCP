import './ash-cache-flush.js?v=20260718-canonical-membrane-v7-readiness-boundary';
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
    new Promise(resolve => {
      link.addEventListener('load', resolve, { once: true });
      link.addEventListener('error', resolve, { once: true });
    }),
    new Promise(resolve => setTimeout(resolve, 8000))
  ]);
}

await Promise.all([
  ensureStyle('/dome-world/ash-keep-aia.css?v=20260720-ak-aia-2-rescue', 'data-ash-live-aia'),
  ensureStyle('/dome-world/ash-keep-aia2-layout.css?v=20260720-ak-aia-2-work-first', 'data-ash-aia2-layout')
]);
await import('./ash-keep-aia.js?v=20260720-ak-aia-2-rescue');
await import('./ash-keep-aia-workspace-bridge.js?v=20260720-ak-aia-2-rescue');
