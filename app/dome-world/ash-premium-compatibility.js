export const ASH_PREMIUM_COMPATIBILITY_VERSION = 'td613.ash.premium.compatibility/v0.1-exact-rail';

export function installAshPremiumCompatibility(doc = globalThis.document) {
  if (!doc?.head || doc.getElementById('td613-ash-premium-compatibility')) return false;
  const style = doc.createElement('style');
  style.id = 'td613-ash-premium-compatibility';
  style.dataset.td613Version = ASH_PREMIUM_COMPATIBILITY_VERSION;
  style.textContent = `
    html[data-ash-premium-ready="true"] body .workspace-rail{
      position:sticky!important;
      top:130px!important;
      z-index:30!important;
      display:grid!important;
      width:auto!important;
      height:auto!important;
      min-height:34px!important;
      grid-template-columns:repeat(7,minmax(80px,1fr))!important;
      gap:1px!important;
      margin:0!important;
      padding:1px max(18px,env(safe-area-inset-right)) 1px max(18px,env(safe-area-inset-left))!important;
      overflow:visible!important;
      clip:auto!important;
      white-space:normal!important;
      border:0!important;
      border-bottom:1px solid rgba(231,222,188,.075)!important;
      background:rgba(2,8,6,.76)!important;
      opacity:.64;
      backdrop-filter:blur(16px);
    }
    html[data-ash-premium-ready="true"] body .workspace-rail::before{
      content:'Exact chambers';
      position:absolute;
      right:max(20px,env(safe-area-inset-right));
      bottom:-15px;
      color:rgba(154,180,170,.48);
      font:700 .46rem var(--mono);
      letter-spacing:.08em;
      text-transform:uppercase;
      pointer-events:none;
    }
    html[data-ash-premium-ready="true"] body .workspace-rail .work-tab{
      min-width:0!important;
      min-height:32px!important;
      padding:5px 7px!important;
      clip-path:none!important;
      border:0!important;
      color:#71877e!important;
      background:rgba(4,17,13,.66)!important;
      font:700 .52rem/1 var(--sans)!important;
      letter-spacing:.02em!important;
    }
    html[data-ash-premium-ready="true"] body .workspace-rail .work-tab[aria-selected="true"]{
      color:var(--premium-ivory)!important;
      background:rgba(13,37,29,.88)!important;
      box-shadow:inset 0 -1px var(--premium-mint)!important;
    }
    html[data-ash-premium-ready="true"] body .ash-lifecycle-rail{
      position:absolute!important;
      width:1px!important;
      height:1px!important;
      margin:-1px!important;
      padding:0!important;
      overflow:hidden!important;
      clip:rect(0,0,0,0)!important;
      white-space:nowrap!important;
      border:0!important;
    }
    @media(max-width:760px){
      html[data-ash-premium-ready="true"] body .workspace-rail{
        top:113px!important;
        display:grid!important;
        grid-template-columns:none!important;
        grid-auto-flow:column!important;
        grid-auto-columns:92px!important;
        min-height:36px!important;
        padding:1px 8px!important;
        overflow-x:auto!important;
        overflow-y:hidden!important;
        opacity:.54;
        scrollbar-width:none;
      }
      html[data-ash-premium-ready="true"] body .workspace-rail::-webkit-scrollbar{display:none}
      html[data-ash-premium-ready="true"] body .workspace-rail::before{display:none}
      html[data-ash-premium-ready="true"] body .workspace-rail .work-tab{min-height:34px!important}
    }
  `;
  doc.head.append(style);
  doc.documentElement.dataset.ashPremiumCompatibility = ASH_PREMIUM_COMPATIBILITY_VERSION;
  return true;
}

if (typeof document !== 'undefined') installAshPremiumCompatibility(document);
