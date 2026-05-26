export const HUSH_PR81_MOBILE_PROFILE_CAROUSEL_VERSION = 'pr81-mobile-authorship-profile-carousel';

const $ = (id, doc = document) => doc.getElementById(id);

function installStyle(doc = document) {
  if ($('hushPr81MobileProfileCarouselStyle', doc)) return;
  const style = doc.createElement('style');
  style.id = 'hushPr81MobileProfileCarouselStyle';
  style.textContent = `
    @media(max-width:760px){
      body[data-page-kind="adversarial-bench"][data-hush-pr76-analyzed="true"] #messageDraftProfile{display:block!important;}
      body[data-page-kind="adversarial-bench"] .hush-source-profile-panel{
        margin:.44rem 0 .42rem!important;
        padding:.54rem!important;
        min-height:0!important;
        border-radius:16px!important;
        overflow:hidden!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-profile-head{
        display:grid!important;
        grid-template-columns:minmax(0,1fr)!important;
        gap:.24rem!important;
        margin-bottom:.38rem!important;
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
        display:flex!important;
        flex-wrap:nowrap!important;
        gap:.42rem!important;
        overflow-x:auto!important;
        overflow-y:hidden!important;
        overscroll-behavior-x:contain!important;
        scroll-snap-type:x mandatory!important;
        -webkit-overflow-scrolling:touch!important;
        padding:.05rem .12rem .45rem!important;
        scrollbar-width:thin!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-metric{
        flex:0 0 min(44%,10.8rem)!important;
        scroll-snap-align:start!important;
        min-height:2.68rem!important;
        padding:.38rem .42rem!important;
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
        font-size:.62rem!important;
        line-height:1.16!important;
        margin-top:.17rem!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-profile-panel::after{
        content:'swipe metrics';
        display:block;
        margin-top:-.28rem;
        color:rgba(137,231,255,.62);
        font-size:.46rem;
        letter-spacing:.16em;
        text-transform:uppercase;
      }
    }
  `;
  doc.head.appendChild(style);
}

function boot(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench') return;
  doc.body.dataset.hushPr81MobileProfileCarousel = 'true';
  installStyle(doc);
}

if (typeof document !== 'undefined') {
  const run = () => boot(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  [240, 720, 1400, 2600].forEach((delay) => window.setTimeout(run, delay));
}
