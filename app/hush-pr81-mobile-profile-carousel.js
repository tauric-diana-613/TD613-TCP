export const HUSH_PR81_MOBILE_PROFILE_CAROUSEL_VERSION = 'pr81.3-mobile-profile-scrollable-two-column';

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
        padding:.58rem .52rem .62rem!important;
        min-height:0!important;
        max-height:min(64vh, 34rem)!important;
        border-radius:16px!important;
        overflow-y:auto!important;
        overflow-x:hidden!important;
        overscroll-behavior:contain!important;
        -webkit-overflow-scrolling:touch!important;
        scrollbar-width:thin!important;
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
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
        grid-template-rows:none!important;
        grid-auto-columns:auto!important;
        gap:.38rem!important;
        overflow:visible!important;
        overscroll-behavior:contain!important;
        scroll-snap-type:none!important;
        -webkit-overflow-scrolling:auto!important;
        touch-action:auto!important;
        padding:0 .04rem .12rem 0!important;
        scrollbar-width:auto!important;
        min-width:0!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-profile-grid::-webkit-scrollbar{display:none!important;}
      body[data-page-kind="adversarial-bench"] .hush-source-metric{
        scroll-snap-align:none!important;
        min-height:4.7rem!important;
        min-width:0!important;
        width:auto!important;
        padding:.5rem .46rem!important;
        border-radius:13px!important;
        display:flex!important;
        flex-direction:column!important;
        justify-content:center!important;
        overflow:hidden!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-metric span{
        display:block!important;
        font-size:.46rem!important;
        letter-spacing:.09em!important;
        white-space:normal!important;
        overflow-wrap:anywhere!important;
        word-break:normal!important;
        line-height:1.15!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-metric strong{
        display:block!important;
        font-size:.62rem!important;
        line-height:1.2!important;
        margin-top:.22rem!important;
        white-space:normal!important;
        overflow-wrap:anywhere!important;
        word-break:normal!important;
        max-width:100%!important;
      }
    }

    @media(max-width:390px){
      body[data-page-kind="adversarial-bench"] .hush-source-profile-panel{
        max-height:min(62vh, 32rem)!important;
        padding:.52rem .46rem .58rem!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-profile-grid{
        gap:.32rem!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-metric{
        min-height:4.35rem!important;
        padding:.44rem .38rem!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-metric strong{
        font-size:.58rem!important;
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
  doc.body.dataset.hushPr81MobileProfileScrollableTwoColumn = 'true';
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
