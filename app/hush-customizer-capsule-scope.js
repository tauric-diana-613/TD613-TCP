const HUSH_CUSTOMIZER_CAPSULE_SCOPE_VERSION = 'customizer-capsule-scope/v1';
const $ = (id) => document.getElementById(id);

function customizerActive() {
  const tab = $('hushCustomizeTabBtn');
  const panel = $('hushPhase31CustomizerPanel');
  if (tab?.getAttribute('aria-pressed') === 'true') return true;
  if (panel && panel.hidden === false) return true;
  return false;
}

function customMaskCapsule() {
  const node = $('hushPhase32Diagnostics');
  if (!node) return null;
  if (node.dataset.capsule === 'custom-mask') return node;
  if (node.classList.contains('hush-custom-mask-capsule')) return node;
  if ($('hushCustomMaskCapsuleName') && node.contains($('hushCustomMaskCapsuleName'))) return node;
  return null;
}

function syncCustomMaskCapsuleScope() {
  const active = customizerActive();
  if (active && window.__TD613_HUSH_HOUSEKEEPING__?.ensureCustomMaskCapsule) {
    try { window.__TD613_HUSH_HOUSEKEEPING__.ensureCustomMaskCapsule(); } catch (error) {}
  }
  const capsule = customMaskCapsule();
  if (!capsule) return false;
  capsule.hidden = !active;
  capsule.dataset.customizerScoped = 'true';
  return active;
}

function bindCapsuleScope() {
  ['hushCustomizeTabBtn', 'hushBuiltInTabBtn'].forEach((id) => {
    const node = $(id);
    if (!node || node.dataset.customizerCapsuleScope === 'true') return;
    node.dataset.customizerCapsuleScope = 'true';
    node.addEventListener('click', () => {
      window.setTimeout(syncCustomMaskCapsuleScope, 0);
      window.setTimeout(syncCustomMaskCapsuleScope, 80);
      window.setTimeout(syncCustomMaskCapsuleScope, 240);
    });
  });
  syncCustomMaskCapsuleScope();
}

function boot() {
  bindCapsuleScope();
  window.setTimeout(bindCapsuleScope, 120);
  window.setTimeout(bindCapsuleScope, 520);
  window.setTimeout(bindCapsuleScope, 1100);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();

window.addEventListener('td613:hush:patch38-result', () => window.setTimeout(syncCustomMaskCapsuleScope, 80));
window.addEventListener('td613:hush:outbound-packet', () => window.setTimeout(syncCustomMaskCapsuleScope, 80));

const observer = new MutationObserver(() => syncCustomMaskCapsuleScope());
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-pressed', 'hidden', 'class', 'data-capsule'] });

window.__TD613_HUSH_CUSTOMIZER_CAPSULE_SCOPE__ = { version: HUSH_CUSTOMIZER_CAPSULE_SCOPE_VERSION, syncCustomMaskCapsuleScope, customizerActive };
