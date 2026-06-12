const HUSH_READY_LITE_VERSION = 'ready-lite/v3-studio-ready';
const $ = (id) => document.getElementById(id);
function box(id) {
  const node = $(id);
  const rect = node?.getBoundingClientRect?.();
  return Boolean(rect && rect.width > 10 && rect.height > 10);
}
function maskReady() {
  const select = $('maskFieldSelect');
  const routeGrid = $('hushMaskRouteGrid');
  const active = $('hushMaskProfilePanel');
  return Boolean(
    box('hushBuiltInMaskPanel') &&
    (select?.options?.length > 0 || routeGrid?.children?.length > 0 || active?.textContent?.trim())
  );
}
function ready() {
  return box('consoleMasthead') && box('hushOperatorPath') && box('messageDraftInput') && box('generateMaskedOutputBtn') && maskReady();
}
function topNow() {
  try { window.scrollTo(0, 0); } catch (error) {}
}
function release(reason = 'ready-lite') {
  const node = $('td613HushLoading');
  if (!node) return false;
  node.dataset.readyToHide = 'true';
  node.hidden = true;
  node.setAttribute('aria-hidden', 'true');
  node.dataset.dismissedBy = reason;
  topNow();
  setTimeout(topNow, 80);
  return true;
}
function check(started = Date.now()) {
  if (ready()) return release('studio-ready');
  if (Date.now() - started > 5200) return release('studio-ready-timeout');
  setTimeout(() => check(started), 90);
  return false;
}
function holdFast(started = Date.now()) {
  check(started);
  const timer = setInterval(() => {
    check(started);
    if (Date.now() - started > 5600) clearInterval(timer);
  }, 90);
}
function boot() {
  holdFast();
  setTimeout(check, 600);
  setTimeout(check, 1400);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
window.addEventListener('load', () => setTimeout(() => holdFast(Date.now()), 80), { once: true });
window.__TD613_HUSH_READY_LITE__ = { version: HUSH_READY_LITE_VERSION, ready, maskReady, check, release, holdFast };