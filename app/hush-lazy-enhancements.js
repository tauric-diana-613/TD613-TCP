const HUSH_LAZY_ENHANCEMENTS_VERSION = 'hush-lazy-enhancements/v2-lite';

const loaded = new Set();
const loading = new Map();
const modules = {
  customizer: './hush-phase31-1.js?v=202606121900',
  housekeeping: './hush-housekeeping.js?v=202606121846',
  relayout: './hush-housekeeping-relayout.js?v=202606121846',
  capsuleScope: './hush-customizer-tabs-lite.js?v=202606121942',
  compareLayout: './hush-compare-layout-lite.js?v=202606121942'
};

function idle(callback, timeout = 1600) {
  if ('requestIdleCallback' in window) return window.requestIdleCallback(callback, { timeout });
  return window.setTimeout(callback, Math.min(timeout, 700));
}

function importOnce(key) {
  if (!modules[key]) return Promise.resolve(null);
  if (loaded.has(key)) return Promise.resolve(key);
  if (loading.has(key)) return loading.get(key);
  const request = import(modules[key])
    .then((module) => {
      loaded.add(key);
      loading.delete(key);
      return module;
    })
    .catch((error) => {
      loading.delete(key);
      console.warn(`[TD613 Hush] enhancement load failed: ${key}`, error);
      return null;
    });
  loading.set(key, request);
  return request;
}

function loadCustomizerStack() {
  return importOnce('customizer')
    .then(() => importOnce('capsuleScope'));
}

function loadCustodyStack() {
  return importOnce('housekeeping')
    .then(() => importOnce('relayout'))
    .then(() => importOnce('compareLayout'));
}

function loadPostPaintEnhancements() {
  idle(() => importOnce('compareLayout'), 1200);
  idle(() => importOnce('housekeeping').then(() => importOnce('relayout')), 2200);
}

function bindInteractionLoaders() {
  const customize = document.getElementById('hushCustomizeTabBtn');
  if (customize && customize.dataset.lazyEnhancementBound !== 'true') {
    customize.dataset.lazyEnhancementBound = 'true';
    customize.addEventListener('pointerdown', loadCustomizerStack, { once: true, passive: true });
    customize.addEventListener('click', loadCustomizerStack, { once: true });
  }

  const transform = document.getElementById('generateMaskedOutputBtn');
  if (transform && transform.dataset.lazyEnhancementBound !== 'true') {
    transform.dataset.lazyEnhancementBound = 'true';
    transform.addEventListener('pointerdown', loadCustodyStack, { once: true, passive: true });
    transform.addEventListener('click', loadCustodyStack, { once: true });
  }
}

function boot() {
  bindInteractionLoaders();
  window.setTimeout(loadPostPaintEnhancements, 900);
  window.setTimeout(bindInteractionLoaders, 300);
  window.setTimeout(bindInteractionLoaders, 1000);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();

window.__TD613_HUSH_LAZY_ENHANCEMENTS__ = {
  version: HUSH_LAZY_ENHANCEMENTS_VERSION,
  importOnce,
  loadCustomizerStack,
  loadCustodyStack,
  loaded: () => [...loaded]
};
