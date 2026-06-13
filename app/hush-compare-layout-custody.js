const HUSH_COMPARE_LAYOUT_CUSTODY_VERSION = 'compare-layout-custody/v3-explicit-breaks';
const $ = (id) => document.getElementById(id);

function rawValue(id) {
  return $(id)?.value ?? '';
}

function escapeHtml(value = '') {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function applyLayoutSurface(node) {
  if (!node) return;
  node.style.setProperty('white-space', 'normal', 'important');
  node.style.setProperty('overflow-wrap', 'anywhere', 'important');
  node.style.setProperty('word-break', 'normal', 'important');
  node.style.setProperty('tab-size', '2', 'important');
  node.dataset.layoutCustody = 'explicit-breaks';
}

function countLineBreaks(value = '') {
  return (String(value).match(/\n/g) || []).length;
}

function renderLayoutPreserved(node, value = '', fallback = '') {
  if (!node) return;
  applyLayoutSurface(node);
  const raw = String(value ?? '');
  const display = raw.length ? raw : fallback;
  node.innerHTML = escapeHtml(display).replace(/\n/g, '<br>');
  node.dataset.lineBreakCount = String(countLineBreaks(raw));
  node.dataset.paragraphBreakCount = String((raw.match(/\n\s*\n/g) || []).length);
}

function syncTransformationCheckLayout() {
  const before = $('hushCompareBefore');
  const after = $('hushCompareAfter');
  if (!before && !after) return false;
  renderLayoutPreserved(before, rawValue('messageDraftInput'), 'No message yet.');
  renderLayoutPreserved(after, rawValue('protectedOutputInput'), 'No transformed message yet.');
  return true;
}

function bindLayoutCustody() {
  ['messageDraftInput', 'protectedOutputInput'].forEach((id) => {
    const node = $(id);
    if (!node || node.dataset.compareLayoutCustody === 'true') return;
    node.dataset.compareLayoutCustody = 'true';
    node.addEventListener('input', () => {
      window.setTimeout(syncTransformationCheckLayout, 0);
      window.setTimeout(syncTransformationCheckLayout, 80);
    });
  });
  ['generateMaskedOutputBtn', 'analyzeOutputBtn', 'copyHushOutputBtn', 'acceptOutputBtn'].forEach((id) => {
    const node = $(id);
    if (!node || node.dataset.compareLayoutCustodyClick === 'true') return;
    node.dataset.compareLayoutCustodyClick = 'true';
    node.addEventListener('click', () => {
      window.setTimeout(syncTransformationCheckLayout, 120);
      window.setTimeout(syncTransformationCheckLayout, 360);
    });
  });
  syncTransformationCheckLayout();
}

function boot() {
  bindLayoutCustody();
  window.setTimeout(bindLayoutCustody, 140);
  window.setTimeout(bindLayoutCustody, 520);
  window.setTimeout(bindLayoutCustody, 1200);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();

window.addEventListener('td613:hush:patch38-result', () => window.setTimeout(syncTransformationCheckLayout, 80));
window.addEventListener('td613:hush:outbound-packet', () => window.setTimeout(syncTransformationCheckLayout, 80));

window.__TD613_HUSH_COMPARE_LAYOUT_CUSTODY__ = { version: HUSH_COMPARE_LAYOUT_CUSTODY_VERSION, syncTransformationCheckLayout };