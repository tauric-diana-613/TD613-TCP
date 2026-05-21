import { initHushCustomizerCardFields } from './hush-customizer-card-fields.js';

function boot() {
  initHushCustomizerCardFields(document, window.__TD613_HUSH_BENCH__ || {});
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 50);
  window.setTimeout(boot, 250);
}

export { boot };
