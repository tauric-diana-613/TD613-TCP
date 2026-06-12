const HUSH_LAZY_ENHANCEMENTS_VERSION = 'hush-lazy-enhancements/v6-ready-hide-marker';

const loaded = new Set();
const loading = new Map();
const modules = {
  customizer: './hush-phase31-1.js?v=202606121900',
  housekeeping: './hush-housekeeping.js?v=202606121846',
  relayout: './hush-housekeeping-relayout.js?v=202606121846',
  capsuleScope: './hush-customizer-tabs-lite.js?v=202606121942',
  compareLayout: './hush-compare-layout-lite.js?v=202606121942'
};

function hasBox(id) {
  const node = document.getElementById(id);
  if (!node) return false;
  const rect = node.getBoundingClientRect?.();
  return Boolean(rect && rect.width > 12 && rect.height > 12);
}

function coreUiReady() {
  const select = document.getElementById('maskFieldSelect');
  const routeGrid = document.getElementById('hushMaskRouteGrid');
  const hasMaskChoices = Boolean(select?.options?.length);
  const hasRouteCards = Boolean(routeGrid?.children?.length);
  return Boolean(
    hasBox('consoleMasthead') &&
    hasBox('hushOperatorPath') &&
    hasBox('messageDraftInput') &&
    hasBox('generateMaskedOutputBtn') &&
    (hasMaskChoices || hasRouteCards)
  );
}

function loadingLayer() {
  return document.getElementById('td613HushLoading');
}

function setLoadingVisible(reason = 'core-ui-not-ready') {
  const node = loadingLayer();
  if (!node) return false;
  node.dataset.readyToHide = 'false';
  node.hidden = false;
  node.setAttribute('aria-hidden', 'false');
  node.dataset.loadingState = reason;
  return true;
}

function hideLoadingOverlay(reason = 'lazy-loader') {
  const node = loadingLayer();
  if (!node) return false;
  node.dataset.readyToHide = 'true';
  node.hidden = true;
  node.setAttribute('aria-hidden', 'true');
  node.dataset.dismissedBy = reason;
  return true;
}

function releaseLoadingWhenReady(startedAt = Date.now(), maxWait = 5200, reason = 'core-ui-ready') {
  if (coreUiReady()) return hideLoadingOverlay(reason);
  if (Date.now() - startedAt >= maxWait) return hideLoadingOverlay('max-wait');
  setLoadingVisible('core-ui-not-ready');
  window.setTimeout(() => releaseLoadingWhenReady(startedAt, maxWait, reason), 120);
  return false;
}

function installLoadingFailsafe() {
  releaseLoadingWhenReady(Date.now(), 5200, 'initial-core-ui-ready');
  window.addEventListener('load', () => window.setTimeout(() => releaseLoadingWhenReady(Date.now(), 2600, 'load-core-ui-ready'), 80), { once: true });
}

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
  releaseLoadingWhenReady(Date.now(), 5200, 'boot-core-ui-ready');
  window.setTimeout(loadPostPaintEnhancements, 900);
  window.setTimeout(bindInteractionLoaders, 300);
  window.setTimeout(bindInteractionLoaders, 1000);
}

installLoadingFailsafe();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();

window.__TD613_HUSH_LAZY_ENHANCEMENTS__ = {
  version: HUSH_LAZY_ENHANCEMENTS_VERSION,
  coreUiReady,
  hideLoadingOverlay,
  releaseLoadingWhenReady,
  importOnce,
  loadCustomizerStack,
  loadCustodyStack,
  loaded: () => [...loaded]
};
