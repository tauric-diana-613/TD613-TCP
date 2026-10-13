const TD613_HUSH_PR123_EXACT_CAPTURE_VERSION = 'pr123-exact-capture/v1';

function isTransformButton(event) {
  const target = event?.target;
  return Boolean(target?.closest?.('#generateMaskedOutputBtn'));
}

function apiReady() {
  return Boolean(window.TD613_HUSH_PR123?.run && /exact-artifacts/.test(String(window.TD613_HUSH_PR123.version || '')));
}

function install() {
  if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return false;
  if (document.body.dataset.pr123ExactCapture === TD613_HUSH_PR123_EXACT_CAPTURE_VERSION) return true;
  document.body.dataset.pr123ExactCapture = TD613_HUSH_PR123_EXACT_CAPTURE_VERSION;
  document.addEventListener('click', (event) => {
    if (!isTransformButton(event)) return;
    if (!apiReady()) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    window.TD613_HUSH_PR123.run(event);
  }, true);
  return true;
}

function boot() {
  install();
  window.setTimeout(install, 120);
  window.setTimeout(install, 520);
  window.setTimeout(install, 1200);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
window.addEventListener('load', () => window.setTimeout(install, 120));
window.__TD613_HUSH_PR123_EXACT_CAPTURE__ = { version: TD613_HUSH_PR123_EXACT_CAPTURE_VERSION, install };
