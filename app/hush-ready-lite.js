const HUSH_READY_LITE_VERSION = 'ready-lite/v2-active-boot';
const $ = (id) => document.getElementById(id);
function box(id) {
  const node = $(id);
  const rect = node?.getBoundingClientRect?.();
  return Boolean(rect && rect.width > 10 && rect.height > 10);
}
function ready() {
  return box('consoleMasthead') && box('hushOperatorPath') && box('messageDraftInput') && box('generateMaskedOutputBtn');
}
function release(reason = 'ready-lite') {
  const node = $('td613HushLoading');
  if (!node) return false;
  node.dataset.readyToHide = 'true';
  node.hidden = true;
  node.setAttribute('aria-hidden', 'true');
  node.dataset.dismissedBy = reason;
  return true;
}
function check(started = Date.now()) {
  if (ready()) return release('minimal-core-ready');
  if (Date.now() - started > 2600) return release('minimal-core-timeout');
  setTimeout(() => check(started), 80);
  return false;
}
function holdFast(started = Date.now()) {
  check(started);
  const timer = setInterval(() => {
    check(started);
    if (Date.now() - started > 3600) clearInterval(timer);
  }, 60);
}
function boot() {
  holdFast();
  setTimeout(check, 350);
  setTimeout(check, 900);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
window.addEventListener('load', () => setTimeout(() => holdFast(Date.now()), 40), { once: true });
window.__TD613_HUSH_READY_LITE__ = { version: HUSH_READY_LITE_VERSION, ready, check, release, holdFast };
