export const HUSH_PR81_MOBILE_PROFILE_CAROUSEL_VERSION = 'pr81.2-mobile-profile-readable-grid';

const $ = (id, doc = document) => doc.getElementById(id);
const escSelector = (value = '') => {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(String(value));
  return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
};

function installStyle(doc = document) {
  if ($('hushPr81MobileProfileCarouselStyle', doc)) return;
  const style = doc.createElement('style');
  style.id = 'hushPr81MobileProfileCarouselStyle';
  style.textContent = `
    @media(max-width:760px){
      body[data-page-kind="adversarial-bench"][data-hush-pr76-analyzed="true"] #messageDraftProfile{display:block!important;}
      body[data-page-kind="adversarial-bench"] .hush-source-profile-panel{
        position:relative!important;
        margin:.44rem 0 .42rem!important;
        padding:.62rem .55rem .62rem!important;
        min-height:0!important;
        border-radius:16px!important;
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
        gap:.24rem!important;
        margin-bottom:.44rem!important;
        padding-right:0!important;
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
        max-width:none!important;
        margin:0!important;
        text-align:left!important;
        font-size:.58rem!important;
        line-height:1.28!important;
        color:rgba(226,255,236,.62)!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-profile-grid{
        display:grid!important;
        grid-auto-flow:row!important;
        grid-template-columns:minmax(0,1fr)!important;
        grid-template-rows:none!important;
        grid-auto-columns:auto!important;
        gap:.4rem!important;
        overflow:visible!important;
        overscroll-behavior:contain!important;
        scroll-snap-type:none!important;
        -webkit-overflow-scrolling:auto!important;
        touch-action:auto!important;
        padding:0!important;
        scrollbar-width:auto!important;
        min-width:0!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-profile-grid::-webkit-scrollbar{display:none!important;}
      body[data-page-kind="adversarial-bench"] .hush-source-metric{
        scroll-snap-align:none!important;
        min-height:auto!important;
        min-width:0!important;
        width:100%!important;
        padding:.48rem .52rem!important;
        border-radius:13px!important;
        display:block!important;
        overflow:hidden!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-metric span{
        display:block!important;
        font-size:.48rem!important;
        letter-spacing:.1em!important;
        white-space:normal!important;
        overflow-wrap:anywhere!important;
        word-break:normal!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-metric strong{
        display:block!important;
        font-size:.68rem!important;
        line-height:1.25!important;
        margin-top:.18rem!important;
        white-space:normal!important;
        overflow-wrap:break-word!important;
        word-break:normal!important;
        max-width:100%!important;
      }
    }
  `;
  doc.head.appendChild(style);
}

function selectedMaskId(doc = document) {
  return $('maskFieldSelect', doc)?.value || (typeof window !== 'undefined' ? window.__TD613_HUSH_BENCH__?.benchState?.selectedHushMaskId : '') || '';
}

function snapSelectedMaskCard(doc = document, behavior = 'smooth') {
  const maskId = selectedMaskId(doc);
  const grid = $('hushMaskRouteGrid', doc);
  if (!grid || !maskId) return false;
  const card = grid.querySelector(`.hush-route-card[data-mask-id="${escSelector(maskId)}"]`);
  if (!card) return false;
  card.scrollIntoView({ behavior, block: 'nearest', inline: 'center' });
  card.setAttribute('data-autosnapped', 'true');
  return true;
}

function bindMaskSnap(doc = document) {
  const select = $('maskFieldSelect', doc);
  if (select && select.dataset.pr81SnapBound !== 'true') {
    select.dataset.pr81SnapBound = 'true';
    select.addEventListener('change', () => {
      [0, 80, 220].forEach((delay) => window.setTimeout(() => snapSelectedMaskCard(doc), delay));
    });
  }
  const grid = $('hushMaskRouteGrid', doc);
  if (grid && grid.dataset.pr81SnapObserved !== 'true') {
    grid.dataset.pr81SnapObserved = 'true';
    const observer = new MutationObserver(() => window.setTimeout(() => snapSelectedMaskCard(doc, 'auto'), 30));
    observer.observe(grid, { childList: true, subtree: false });
  }
}

function boot(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench') return;
  doc.body.dataset.hushPr81MobileProfileCarousel = 'true';
  doc.body.dataset.hushPr81MobileProfileReadableGrid = 'true';
  installStyle(doc);
  bindMaskSnap(doc);
  window.setTimeout(() => snapSelectedMaskCard(doc, 'auto'), 100);
}

if (typeof document !== 'undefined') {
  const run = () => boot(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  [240, 720, 1400, 2600, 4200].forEach((delay) => window.setTimeout(run, delay));
}
