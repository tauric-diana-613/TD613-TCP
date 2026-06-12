const HUSH_READY_LITE_VERSION = 'ready-lite/v4-conservative-studio';
const $ = (id) => document.getElementById(id);
const STARTED_AT = Date.now();
function box(id) {
  const node = $(id);
  const rect = node?.getBoundingClientRect?.();
  return Boolean(rect && rect.width > 10 && rect.height > 10);
}
function hasText(id) {
  return Boolean($(id)?.textContent?.trim());
}
function maskReady() {
  const select = $('maskFieldSelect');
  const routeGrid = $('hushMaskRouteGrid');
  return Boolean(
    box('hushBuiltInMaskPanel') &&
    select?.options?.length > 0 &&
    routeGrid?.children?.length > 0 &&
    hasText('hushMaskDescription')
  );
}
function ready() {
  return box('consoleMasthead') && box('hushOperatorPath') && box('messageDraftInput') && box('generateMaskedOutputBtn') && maskReady();
}
function topNow() {
  try { window.scrollTo(0, 0); } catch (error) {}
}
function keepVisible(reason = 'studio-pending') {
  const node = $('td613HushLoading');
  if (!node) return false;
  node.dataset.readyToHide = 'false';
  node.hidden = false;
  node.setAttribute('aria-hidden', 'false');
  node.dataset.loadingState = reason;
  return true;
}
function release(reason = 'ready-lite') {
  const node = $('td613HushLoading');
  if (!node) return false;
  node.dataset.readyToHide = 'true';
  topNow();
  node.hidden = true;
  node.setAttribute('aria-hidden', 'true');
  node.dataset.dismissedBy = reason;
  setTimeout(topNow, 80);
  setTimeout(topNow, 240);
  setTimeout(topNow, 520);
  return true;
}
function check(started = STARTED_AT) {
  const minWaitPassed = Date.now() - STARTED_AT > 2800;
  if (minWaitPassed && ready()) return release('conservative-studio-ready');
  if (Date.now() - started > 9000) return release('conservative-studio-timeout');
  keepVisible('studio-pending');
  setTimeout(() => check(started), 120);
  return false;
}
function hold(started = STARTED_AT) {
  keepVisible('boot');
  check(started);
  const timer = setInterval(() => {
    if (ready() && Date.now() - STARTED_AT > 2800) {
      release('conservative-studio-ready');
      clearInterval(timer);
    } else if (Date.now() - started > 9200) {
      release('conservative-studio-timeout');
      clearInterval(timer);
    } else {
      keepVisible('studio-pending');
    }
  }, 120);
}
function boot() {
  hold();
  setTimeout(check, 900);
  setTimeout(check, 2200);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
window.addEventListener('load', () => setTimeout(() => hold(Date.now()), 120), { once: true });
window.__TD613_HUSH_READY_LITE__ = { version: HUSH_READY_LITE_VERSION, ready, maskReady, check, release, hold, keepVisible };