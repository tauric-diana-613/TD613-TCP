import * as bench from './adversarial-bench.mjs';
import { renderHushMaskRouteCards } from './hush-alien-console.js';

export const HUSH_PR82_MOBILE_STATE_HOTFIX_VERSION = 'pr82-mobile-state-transform-hotfix';

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
      body[data-page-kind="adversarial-bench"] .hush-source-profile-panel{
        margin:.44rem 0 .5rem!important;
        padding:.62rem!important;
        border-radius:18px!important;
        overflow:hidden!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-profile-panel::before,
      body[data-page-kind="adversarial-bench"] .hush-source-profile-panel::after{
        content:none!important;
        display:none!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-profile-head{
        display:grid!important;
        grid-template-columns:minmax(0,1fr)!important;
        gap:.22rem!important;
        padding:0!important;
        margin:0 0 .48rem!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-profile-head span{
        font-size:.5rem!important;
        letter-spacing:.16em!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-profile-head strong{
        font-size:.68rem!important;
        letter-spacing:.1em!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-profile-head p{
        font-size:.56rem!important;
        line-height:1.25!important;
        margin:0!important;
        color:rgba(226,255,236,.62)!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-profile-grid{
        display:grid!important;
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
        grid-auto-flow:row!important;
        grid-auto-columns:auto!important;
        grid-template-rows:none!important;
        gap:.42rem!important;
        overflow:visible!important;
        padding:0!important;
        scroll-snap-type:none!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-metric{
        min-width:0!important;
        min-height:2.35rem!important;
        padding:.42rem .46rem!important;
        border-radius:13px!important;
        display:flex!important;
        flex-direction:column!important;
        justify-content:center!important;
        scroll-snap-align:none!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-metric span{
        font-size:.45rem!important;
        letter-spacing:.105em!important;
        white-space:normal!important;
        overflow-wrap:anywhere!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-metric strong{
        display:block!important;
        font-size:.62rem!important;
        line-height:1.2!important;
        margin-top:.16rem!important;
        white-space:normal!important;
        overflow-wrap:anywhere!important;
      }
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
  card.scrollIntoView({ behavior, block: 'nearest', inline: 'center' });
  grid.querySelectorAll('.hush-route-card').forEach((node) => node.setAttribute('aria-selected', node === card ? 'true' : 'false'));
  return true;
}

function refreshGallery(doc = document, behavior = 'smooth') {
  syncSelectedMask(doc);
  renderHushMaskRouteCards(doc, bench);
  [0, 80, 220].forEach((delay) => window.setTimeout(() => snapMaskCard(doc, behavior), delay));
}

function bindMaskDropdown(doc = document) {
  const select = $('maskFieldSelect', doc);
  if (!select || select.dataset.pr82MaskSync === 'true') return;
  select.dataset.pr82MaskSync = 'true';
  select.addEventListener('change', () => refreshGallery(doc, 'smooth'), true);
  window.setTimeout(() => refreshGallery(doc, 'auto'), 120);
}

function bindTransform(doc = document) {
  const button = $('generateMaskedOutputBtn', doc);
  const patch = window.__TD613_HUSH_PATCH38__;
  if (!button || !patch?.runPatch38Transform || button.dataset.pr82TransformBound === 'true') return false;
  const clone = button.cloneNode(true);
  clone.dataset.pr82TransformBound = 'true';
  clone.dataset.patch38 = 'true';
  clone.dataset.pr75Bound = 'true';
  clone.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    syncSelectedMask(doc);
    patch.runPatch38Transform(doc);
  }, true);
  button.replaceWith(clone);
  return true;
}

function boot(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench') return;
  doc.body.dataset.hushPr82MobileStateHotfix = 'true';
  installStyle(doc);
  bindMaskDropdown(doc);
  bindTransform(doc);
}

if (typeof document !== 'undefined') {
  const run = () => boot(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  [120, 360, 800, 1500, 2600, 4200, 6500].forEach((delay) => window.setTimeout(run, delay));
}
