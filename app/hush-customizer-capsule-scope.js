const HUSH_CUSTOMIZER_CAPSULE_SCOPE_VERSION = 'customizer-capsule-scope/v4-mask-select-bound';
const $ = (id) => document.getElementById(id);

function customizerActive() {
  const customizeTab = $('hushCustomizeTabBtn');
  const builtInTab = $('hushBuiltInTabBtn');
  const phase31Panel = $('hushPhase31CustomizerPanel');
  const legacyPanel = $('hushCustomizePanel');
  if (builtInTab?.getAttribute('aria-pressed') === 'true') return false;
  if (customizeTab?.getAttribute('aria-pressed') === 'true') return true;
  if (phase31Panel && phase31Panel.hidden === false) return true;
  if (legacyPanel && legacyPanel.hidden === false && builtInTab?.getAttribute('aria-pressed') !== 'true') return true;
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
  if (active) capsule.style.removeProperty('display');
  else capsule.style.setProperty('display', 'none', 'important');
  capsule.setAttribute('aria-hidden', active ? 'false' : 'true');
  capsule.dataset.customizerScoped = 'true';
  capsule.dataset.scopeState = active ? 'customizer' : 'hidden-outside-customizer';
  return active;
}

function scheduleScopeSweep() {
  [0, 80, 240, 620, 1200, 2400, 4200].forEach((delay) => {
    window.setTimeout(syncCustomMaskCapsuleScope, delay);
  });
}

function bindCapsuleScope() {
  ['hushCustomizeTabBtn', 'hushBuiltInTabBtn', 'maskFieldSelect'].forEach((id) => {
    const node = $(id);
    if (!node || node.dataset.customizerCapsuleScope === 'true') return;
    node.dataset.customizerCapsuleScope = 'true';
    node.addEventListener(id === 'maskFieldSelect' ? 'change' : 'click', scheduleScopeSweep);
  });
  scheduleScopeSweep();
}

function boot() {
  bindCapsuleScope();
  window.setTimeout(bindCapsuleScope, 120);
  window.setTimeout(bindCapsuleScope, 520);
  window.setTimeout(bindCapsuleScope, 1100);
  window.setTimeout(bindCapsuleScope, 2600);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();

window.addEventListener('load', scheduleScopeSweep, { once: true });
window.addEventListener('td613:hush:patch38-result', () => window.setTimeout(syncCustomMaskCapsuleScope, 80));
window.addEventListener('td613:hush:outbound-packet', () => window.setTimeout(syncCustomMaskCapsuleScope, 80));

window.__TD613_HUSH_CUSTOMIZER_CAPSULE_SCOPE__ = { version: HUSH_CUSTOMIZER_CAPSULE_SCOPE_VERSION, syncCustomMaskCapsuleScope, customizerActive };