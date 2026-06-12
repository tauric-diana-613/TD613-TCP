const HUSH_TOP_LITE_VERSION = 'top-lite/v1';
function topNow() {
  try { window.scrollTo(0, 0); } catch (error) {}
}
function bootTop() {
  topNow();
  setTimeout(topNow, 80);
  setTimeout(topNow, 260);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootTop, { once: true });
else bootTop();
window.addEventListener('load', () => setTimeout(topNow, 80), { once: true });
window.__TD613_HUSH_TOP_LITE__ = { version: HUSH_TOP_LITE_VERSION, topNow };
