const VERSION = 'customizer-tabs-lite/v1';
const $ = (id) => document.getElementById(id);

function isCustomizeOpen() {
  const tab = $('hushCustomizeTabBtn');
  const panel = $('hushPhase31CustomizerPanel');
  return tab?.getAttribute('aria-pressed') === 'true' || panel?.hidden === false;
}

function capsuleNode() {
  const node = $('hushPhase32Diagnostics');
  if (!node) return null;
  const label = $('hushCustomMaskCapsuleName');
  return label && node.contains(label) ? node : null;
}

function sync() {
  const active = isCustomizeOpen();
  if (active) {
    try { window.__TD613_HUSH_HOUSEKEEPING__?.ensureCustomMaskCapsule?.(); } catch (error) {}
  }
  const node = capsuleNode();
  if (node) node.hidden = !active;
  return active;
}

function bind() {
  ['hushCustomizeTabBtn', 'hushBuiltInTabBtn'].forEach((id) => {
    const node = $(id);
    if (!node || node.dataset.tabsLiteBound === 'true') return;
    node.dataset.tabsLiteBound = 'true';
    node.addEventListener('click', () => {
      setTimeout(sync, 0);
      setTimeout(sync, 120);
    });
  });
  sync();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true });
else bind();
setTimeout(bind, 300);
setTimeout(sync, 900);
window.addEventListener('td613:hush:patch38-result', () => setTimeout(sync, 80));
window.__TD613_HUSH_CUSTOMIZER_TABS_LITE__ = { version: VERSION, sync };
