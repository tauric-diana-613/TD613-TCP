export const ASH_INGRESS_LAYOUT_VERSION = 'td613.ash.ingress-layout/v0.3-live-release';

const STYLE_ID = 'td613-ash-ingress-scroll-membrane';

function ensureStyle(doc = document) {
  if (doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    #launch.launch{
      display:flex!important;
      align-items:flex-start!important;
      justify-content:center!important;
      overflow-y:auto!important;
      overflow-x:hidden!important;
      overscroll-behavior:contain;
      scrollbar-gutter:stable both-edges;
      padding:max(16px,env(safe-area-inset-top))
              max(16px,env(safe-area-inset-right))
              max(16px,env(safe-area-inset-bottom))
              max(16px,env(safe-area-inset-left))!important;
    }
    #launch.launch.hidden,
    .ash-has-current-case #launch.launch{display:none!important}
    #launch .launch-panel{
      width:min(780px,calc(100vw - 40px))!important;
      max-height:calc(100dvh - 32px)!important;
      overflow-y:auto!important;
      overflow-x:hidden!important;
      overscroll-behavior:contain;
      scrollbar-gutter:stable;
      margin:auto!important;
      flex:0 0 auto;
    }
    #launch .launch-panel:focus-within{outline:1px solid rgba(118,234,212,.28);outline-offset:3px}
    @supports not (height:100dvh){
      #launch .launch-panel{max-height:calc(100vh - 32px)!important}
    }
    @media (max-height:760px) and (min-width:621px){
      #launch.launch{padding:10px 14px!important}
      #launch .launch-panel{max-height:calc(100dvh - 20px)!important;padding:20px!important}
    }
    @media (max-width:620px){
      #launch.launch{padding:max(8px,env(safe-area-inset-top)) 8px max(8px,env(safe-area-inset-bottom))!important}
      #launch .launch-panel{width:100%!important;max-height:calc(100dvh - 16px)!important;padding:18px!important}
    }
  `;
  doc.head.append(style);
}

export function measureAshIngress(host = window) {
  const panel = host.document?.querySelector('#launch .launch-panel');
  const membrane = host.document?.getElementById('launch');
  if (!panel || !membrane) return Object.freeze({ available:false });
  const rect = panel.getBoundingClientRect();
  const viewport = { width:host.innerWidth, height:host.innerHeight };
  const center = { x:rect.left + rect.width / 2, y:rect.top + rect.height / 2 };
  return Object.freeze({
    available:true,
    version:ASH_INGRESS_LAYOUT_VERSION,
    viewport,
    panel:{
      top:rect.top,left:rect.left,width:rect.width,height:rect.height,
      client_height:panel.clientHeight,scroll_height:panel.scrollHeight,
      scrollable:panel.scrollHeight > panel.clientHeight + 1,
      scroll_top:panel.scrollTop
    },
    membrane:{
      client_height:membrane.clientHeight,scroll_height:membrane.scrollHeight,
      scrollable:membrane.scrollHeight > membrane.clientHeight + 1
    },
    center_delta:{
      x:Math.round(center.x - viewport.width / 2),
      y:Math.round(center.y - viewport.height / 2)
    },
    horizontal_overflow:Math.max(0, host.document.documentElement.scrollWidth - viewport.width)
  });
}

export function installAshIngressLayout(doc = document, host = window) {
  if (!doc?.head || !host) return false;
  ensureStyle(doc);
  doc.documentElement.dataset.ashIngressLayout = ASH_INGRESS_LAYOUT_VERSION;
  const panel = doc.querySelector('#launch .launch-panel');
  if (panel) {
    panel.setAttribute('tabindex','-1');
    panel.dataset.ashScrollMembrane = 'true';
  }
  host.__td613AshIngressLayout = Object.freeze({
    version:ASH_INGRESS_LAYOUT_VERSION,
    measure:() => measureAshIngress(host),
    scrollToTop:() => panel?.scrollTo({ top:0, behavior:'auto' })
  });
  host.dispatchEvent(new CustomEvent('td613:ash:ingress-layout-ready', { detail:measureAshIngress(host) }));
  return true;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') installAshIngressLayout();
