export const HUSH_PR85_AUTHORSHIP_SCROLL_TUNER_VERSION = 'pr85.1-compact-scroll-affordance';

const STYLE_ID = 'hushPr85AuthorshipScrollTunerStyle';

function installStyle(doc = document) {
  if (!doc?.head || doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media(max-width:760px){
      body[data-page-kind="adversarial-bench"] .hush-source-profile-panel{
        height:clamp(12.5rem,34vh,16.5rem)!important;
        max-height:clamp(12.5rem,34vh,16.5rem)!important;
        min-height:0!important;
        overflow-y:scroll!important;
        overflow-x:hidden!important;
        -webkit-overflow-scrolling:touch!important;
        overscroll-behavior:contain!important;
        scrollbar-width:thin!important;
        scrollbar-color:rgba(137,255,240,.62) rgba(3,8,18,.72)!important;
        padding:.56rem .5rem 1.72rem!important;
        box-shadow:inset 0 -1.35rem 1.4rem rgba(137,255,240,.09), inset 0 1px 0 rgba(255,255,255,.06)!important;
      }

      body[data-page-kind="adversarial-bench"] .hush-source-profile-panel::-webkit-scrollbar{
        width:6px!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-profile-panel::-webkit-scrollbar-track{
        background:rgba(3,8,18,.72)!important;
        border-radius:999px!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-profile-panel::-webkit-scrollbar-thumb{
        background:linear-gradient(180deg,rgba(137,255,240,.9),rgba(198,156,255,.78))!important;
        border-radius:999px!important;
      }

      body[data-page-kind="adversarial-bench"] .hush-source-profile-panel::after{
        content:"↕ scroll stylometrics"!important;
        display:block!important;
        position:sticky!important;
        bottom:.04rem!important;
        z-index:5!important;
        margin:.38rem auto -.95rem!important;
        width:max-content!important;
        max-width:92%!important;
        padding:.18rem .54rem!important;
        border:1px solid rgba(137,255,240,.24)!important;
        border-radius:999px!important;
        background:linear-gradient(105deg,rgba(7,13,28,.96),rgba(17,8,31,.94))!important;
        color:rgba(202,255,223,.86)!important;
        font-size:.48rem!important;
        letter-spacing:.15em!important;
        text-transform:uppercase!important;
        pointer-events:none!important;
        box-shadow:0 0 .7rem rgba(137,255,240,.12)!important;
      }

      body[data-page-kind="adversarial-bench"] .hush-source-profile-head{
        position:sticky!important;
        top:-.56rem!important;
        z-index:4!important;
        margin:-.56rem -.5rem .34rem!important;
        padding:.56rem .5rem .36rem!important;
        background:linear-gradient(180deg,rgba(4,10,21,.98),rgba(4,10,21,.9) 76%,rgba(4,10,21,0))!important;
        backdrop-filter:blur(6px)!important;
      }

      body[data-page-kind="adversarial-bench"] .hush-source-profile-grid{
        display:grid!important;
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
        grid-auto-flow:row!important;
        gap:.26rem!important;
        overflow:visible!important;
        padding:0 0 .2rem!important;
      }

      body[data-page-kind="adversarial-bench"] .hush-source-metric{
        height:2.92rem!important;
        min-height:2.92rem!important;
        max-height:2.92rem!important;
        padding:.34rem .34rem!important;
        border-radius:12px!important;
        display:flex!important;
        flex-direction:column!important;
        justify-content:center!important;
        overflow:hidden!important;
      }

      body[data-page-kind="adversarial-bench"] .hush-source-metric span{
        font-size:.39rem!important;
        letter-spacing:.075em!important;
        line-height:1.08!important;
        white-space:normal!important;
        overflow-wrap:anywhere!important;
      }

      body[data-page-kind="adversarial-bench"] .hush-source-metric strong{
        font-size:.52rem!important;
        line-height:1.12!important;
        margin-top:.12rem!important;
        white-space:normal!important;
        overflow-wrap:anywhere!important;
        word-break:normal!important;
      }
    }

    @media(max-width:390px){
      body[data-page-kind="adversarial-bench"] .hush-source-profile-panel{
        height:clamp(11.5rem,32vh,15rem)!important;
        max-height:clamp(11.5rem,32vh,15rem)!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-profile-grid{
        gap:.22rem!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-metric{
        height:2.74rem!important;
        min-height:2.74rem!important;
        max-height:2.74rem!important;
        padding:.3rem .28rem!important;
      }
      body[data-page-kind="adversarial-bench"] .hush-source-metric strong{
        font-size:.49rem!important;
      }
    }
  `;
  doc.head.appendChild(style);
}

function markScrollable(doc = document) {
  const panel = doc.querySelector?.('.hush-source-profile-panel');
  if (!panel) return;
  panel.setAttribute('data-pr85-scrollable', 'true');
}

function boot(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench') return;
  doc.body.dataset.hushPr85AuthorshipScrollTuner = 'true';
  installStyle(doc);
  const run = () => window.setTimeout(() => markScrollable(doc), 0);
  new MutationObserver(run).observe(doc.body, { childList: true, subtree: true });
  [0, 240, 720, 1400, 2600, 4200].forEach((delay) => window.setTimeout(() => markScrollable(doc), delay));
}

if (typeof document !== 'undefined') {
  const run = () => boot(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
}
