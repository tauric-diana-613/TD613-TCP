import './hush-layout-topology-guard.js?v=202607020735';
import './hush-edit-corpus-carousel.js?v=202606141720';
import './hush-input-control-rail.js?v=202606142010';
import './hush-pr76-light-panels.js?v=202606162225';
import './hush-lab-mobile-polish.js?v=202606162345';
import './hush-lab-provider-sync.js?v=202606170020';
import './hush-output-active-mask-route.js?v=202606170220';
import './hush-custody-export-wake.js?v=202606171635';

const HUSH_COMPARE_LAYOUT_CUSTODY_VERSION = 'compare-layout-custody/v6-topology-guard';
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

function syncCustodyExports() {
  window.__TD613_HUSH_CUSTODY_EXPORT_WAKE__?.updateButtons?.();
}

function bindLayoutCustody() {
  ['messageDraftInput', 'protectedOutputInput'].forEach((id) => {
    const node = $(id);
    if (!node || node.dataset.compareLayoutCustody === 'true') return;
    node.dataset.compareLayoutCustody = 'true';
    node.addEventListener('input', () => {
      window.setTimeout(syncTransformationCheckLayout, 0);
      window.setTimeout(syncTransformationCheckLayout, 80);
      window.setTimeout(syncCustodyExports, 120);
    });
  });
  ['generateMaskedOutputBtn', 'analyzeOutputBtn', 'copyHushOutputBtn', 'acceptOutputBtn'].forEach((id) => {
    const node = $(id);
    if (!node || node.dataset.compareLayoutCustodyClick === 'true') return;
    node.dataset.compareLayoutCustodyClick = 'true';
    node.addEventListener('click', () => {
      window.setTimeout(syncTransformationCheckLayout, 120);
      window.setTimeout(syncTransformationCheckLayout, 360);
      window.setTimeout(syncCustodyExports, 180);
      window.setTimeout(syncCustodyExports, 520);
      window.setTimeout(syncCustodyExports, 1400);
    });
  });
  syncTransformationCheckLayout();
  syncCustodyExports();
}

function boot() {
  bindLayoutCustody();
  window.setTimeout(bindLayoutCustody, 140);
  window.setTimeout(bindLayoutCustody, 520);
  window.setTimeout(bindLayoutCustody, 1200);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();

window.addEventListener('td613:hush:patch38-result', () => { window.setTimeout(syncTransformationCheckLayout, 80); window.setTimeout(syncCustodyExports, 90); });
window.addEventListener('td613:hush:outbound-packet', () => { window.setTimeout(syncTransformationCheckLayout, 80); window.setTimeout(syncCustodyExports, 90); });
window.addEventListener('td613:hush:provider-log', () => window.setTimeout(syncCustodyExports, 90));

window.__TD613_HUSH_COMPARE_LAYOUT_CUSTODY__ = { version: HUSH_COMPARE_LAYOUT_CUSTODY_VERSION, syncTransformationCheckLayout, syncCustodyExports };
