export const HUSH_PR81_MOBILE_PROFILE_CAROUSEL_VERSION = 'pr81.1-mobile-profile-two-row-snap';

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
        padding:.54rem .42rem .5rem!important;
        min-height:0!important;
        border-radius:16px!important;
        overflow:hidden!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-profile-panel::before{
        content:'';
        position:absolute;
        z-index:3;
        top:3.15rem;
        right:0;
        bottom:.35rem;
        width:3.2rem;
        pointer-events:none;
        background:linear-gradient(90deg,rgba(4,7,17,0),rgba(4,7,17,.86));
      }
      body[data-page-kind="adversarial-bench"] .hush-source-profile-panel::after{
        content:'›';
        position:absolute;
        z-index:4;
        right:.52rem;
        top:50%;
        transform:translateY(-4%);
        width:1.55rem;
        height:1.55rem;
        border-radius:999px;
        display:grid;
        place-items:center;
        border:1px solid rgba(137,255,240,.28);
        background:rgba(5,9,20,.78);
        color:rgba(169,245,255,.86);
        font-size:1.45rem;
        line-height:1;
        pointer-events:none;
        box-shadow:0 0 18px rgba(137,231,255,.14);
      }
      body[data-page-kind="adversarial-bench"] .hush-source-profile-head{
        display:grid!important;
        grid-template-columns:minmax(0,1fr)!important;
        gap:.24rem!important;
        margin-bottom:.38rem!important;
        padding-right:2.35rem!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-profile-head span{
        font-size:.48rem!important;
        letter-spacing:.16em!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-profile-head strong{
        font-size:.64rem!important;
        letter-spacing:.1em!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-profile-head p{
        max-width:none!important;
        margin:0!important;
        text-align:left!important;
        font-size:.55rem!important;
        line-height:1.24!important;
        color:rgba(226,255,236,.62)!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-profile-grid{
        display:grid!important;
        grid-auto-flow:column!important;
        grid-template-rows:repeat(2,minmax(2.58rem,auto))!important;
        grid-auto-columns:minmax(8.6rem,44%)!important;
        gap:.38rem .42rem!important;
        overflow-x:auto!important;
        overflow-y:hidden!important;
        overscroll-behavior-x:contain!important;
        scroll-snap-type:x mandatory!important;
        -webkit-overflow-scrolling:touch!important;
        touch-action:pan-x!important;
        padding:.05rem 2.45rem .42rem .06rem!important;
        scrollbar-width:none!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-profile-grid::-webkit-scrollbar{display:none!important;}
      body[data-page-kind="adversarial-bench"] .hush-source-metric{
        scroll-snap-align:start!important;
        min-height:2.58rem!important;
        padding:.36rem .42rem!important;
        border-radius:13px!important;
        display:flex!important;
        flex-direction:column!important;
        justify-content:center!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-metric span{
        font-size:.46rem!important;
        letter-spacing:.11em!important;
        white-space:nowrap!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-metric strong{
        font-size:.61rem!important;
        line-height:1.16!important;
        margin-top:.16rem!important;
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
