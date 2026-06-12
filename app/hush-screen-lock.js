const HUSH_SCREEN_LOCK_VERSION = 'screen-lock/v1';
const $ = (id) => document.getElementById(id);
const START = Date.now();
let done = false;

function box(id) {
  const node = $(id);
  const rect = node?.getBoundingClientRect?.();
  return Boolean(rect && rect.width > 10 && rect.height > 10);
}

function text(id) {
  return Boolean($(id)?.textContent?.trim());
}

function studioReady() {
  const select = $('maskFieldSelect');
  const routeGrid = $('hushMaskRouteGrid');
  return Boolean(
    box('consoleMasthead') &&
    box('hushOperatorPath') &&
    box('messageDraftInput') &&
    box('generateMaskedOutputBtn') &&
    box('hushBuiltInMaskPanel') &&
    select?.options?.length > 0 &&
    routeGrid?.children?.length > 0 &&
    text('hushMaskDescription')
  );
}

function keep(reason = 'pending') {
  if (done) return false;
  const node = $('td613HushLoading');
  if (!node) return false;
  node.dataset.finalHide = 'false';
  node.hidden = false;
  node.setAttribute('aria-hidden', 'false');
  node.dataset.screenLock = reason;
  return true;
}

function close(reason = 'ready') {
  const node = $('td613HushLoading');
  if (!node) return false;
  done = true;
  node.dataset.finalHide = 'true';
  node.hidden = true;
  node.setAttribute('aria-hidden', 'true');
  node.dataset.screenLock = reason;
  try { window.scrollTo(0, 0); } catch (error) {}
  setTimeout(() => { try { window.scrollTo(0, 0); } catch (error) {} }, 120);
  return true;
}

function tick() {
  if (done) return true;
  if (Date.now() - START > 2800 && studioReady()) return close('studio-ready');
  if (Date.now() - START > 10000) return close('timeout');
  keep('waiting');
  setTimeout(tick, 140);
  return false;
}

function boot() {
  keep('boot');
  tick();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
window.addEventListener('load', () => setTimeout(tick, 160), { once: true });
window.__TD613_HUSH_SCREEN_LOCK__ = { version: HUSH_SCREEN_LOCK_VERSION, studioReady, keep, close, tick };