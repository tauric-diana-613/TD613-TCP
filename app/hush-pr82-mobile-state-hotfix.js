import * as bench from './adversarial-bench.mjs';

export const HUSH_PR82_MOBILE_STATE_HOTFIX_VERSION = 'pr82.2-low-interference-mask-sync';

const $ = (id, doc = document) => doc.getElementById(id);
const escSelector = (value = '') => {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(String(value));
  return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
};

function installStyle(doc = document) {
  if ($('hushPr82MobileStateHotfixStyle', doc)) return;
  const style = doc.createElement('style');
  style.id = 'hushPr82MobileStateHotfixStyle';
  style.textContent = `
    @media(max-width:760px){
      body[data-page-kind="adversarial-bench"] .hush-route-card[aria-selected="true"]{
        box-shadow:0 0 0 2px rgba(137,231,255,.62),0 0 24px rgba(137,231,255,.18)!important;
      }
    }
  `;
  doc.head.appendChild(style);
}

function currentMaskId(doc = document) {
  return $('maskFieldSelect', doc)?.value || bench.benchState?.selectedHushMaskId || '';
}

function syncSelectedMask(doc = document) {
  const maskId = currentMaskId(doc);
  if (!maskId) return null;
  if (bench.benchState?.selectedHushMaskId !== maskId && typeof bench.selectHushMask === 'function') {
    bench.selectHushMask(maskId);
  }
  if (bench.benchState) {
    bench.benchState.selectedHushMaskId = maskId;
    bench.benchState.selectedPersonaId = maskId;
  }
  return maskId;
}

function snapMaskCard(doc = document, behavior = 'smooth') {
  const maskId = currentMaskId(doc);
  const grid = $('hushMaskRouteGrid', doc);
  if (!grid || !maskId) return false;
  const card = grid.querySelector(`.hush-route-card[data-mask-id="${escSelector(maskId)}"]`);
  if (!card) return false;
  grid.querySelectorAll('.hush-route-card').forEach((node) => node.setAttribute('aria-selected', node === card ? 'true' : 'false'));
  if (behavior !== 'none') card.scrollIntoView({ behavior, block: 'nearest', inline: 'center' });
  return true;
}

function bindMaskDropdown(doc = document) {
  const select = $('maskFieldSelect', doc);
  if (!select || select.dataset.pr82MaskSync === 'true') return;
  select.dataset.pr82MaskSync = 'true';
  select.addEventListener('change', () => {
    syncSelectedMask(doc);
    [0, 120].forEach((delay) => window.setTimeout(() => snapMaskCard(doc, 'auto'), delay));
  }, true);
  window.setTimeout(() => {
    syncSelectedMask(doc);
    snapMaskCard(doc, 'none');
  }, 180);
}

function boot(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench') return;
  doc.body.dataset.hushPr82MobileStateHotfix = 'true';
  installStyle(doc);
  bindMaskDropdown(doc);
}

if (typeof document !== 'undefined') {
  const run = () => boot(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  [180, 720, 1800].forEach((delay) => window.setTimeout(run, delay));
}
