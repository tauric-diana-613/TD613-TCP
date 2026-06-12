const VERSION = 'compare-layout-lite/v1';
const $ = (id) => document.getElementById(id);

function sourceValue() {
  return $('messageDraftInput')?.value ?? '';
}

function outputValue() {
  return $('protectedOutputInput')?.value ?? '';
}

function prep(node) {
  if (!node) return;
  node.style.setProperty('white-space', 'pre-wrap', 'important');
  node.style.setProperty('overflow-wrap', 'anywhere', 'important');
  node.style.setProperty('word-break', 'normal', 'important');
  node.dataset.layoutCustody = 'pre-wrap';
}

function lineBreakCount(value = '') {
  return (String(value).match(/\n/g) || []).length;
}

function render(node, value = '', fallback = '') {
  if (!node) return;
  prep(node);
  const raw = String(value ?? '');
  node.textContent = raw || fallback;
  node.dataset.lineBreakCount = String(lineBreakCount(raw));
  node.dataset.paragraphBreakCount = String((raw.match(/\n\s*\n/g) || []).length);
}

function sync() {
  render($('hushCompareBefore'), sourceValue(), 'No message yet.');
  render($('hushCompareAfter'), outputValue(), 'No transformed message yet.');
}

function bind() {
  ['messageDraftInput', 'protectedOutputInput'].forEach((id) => {
    const node = $(id);
    if (!node || node.dataset.compareLiteBound === 'true') return;
    node.dataset.compareLiteBound = 'true';
    node.addEventListener('input', () => requestAnimationFrame(sync));
  });
  ['generateMaskedOutputBtn', 'analyzeOutputBtn', 'copyHushOutputBtn', 'acceptOutputBtn'].forEach((id) => {
    const node = $(id);
    if (!node || node.dataset.compareLiteClickBound === 'true') return;
    node.dataset.compareLiteClickBound = 'true';
    node.addEventListener('click', () => setTimeout(sync, 180));
  });
  sync();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true });
else bind();
setTimeout(bind, 300);
setTimeout(sync, 900);
window.addEventListener('td613:hush:patch38-result', () => setTimeout(sync, 80));
window.__TD613_HUSH_COMPARE_LAYOUT_LITE__ = { version: VERSION, sync };
