export const ASH_INGRESS_LAYOUT_VERSION = 'td613.ash.ingress-layout/v0.2-scroll-membrane';

const STYLE_ID = 'td613-ash-ingress-scroll-membrane';

function ensureStyle(doc = document) {
  if (doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    #launch.launch{
      display:flex;
      align-items:flex-start;
      justify-content:center;
      overflow-y:auto;
      overflow-x:hidden;
      overscroll-behavior:contain;
      scrollbar-gutter:stable both-edges;
      padding:max(18px,env(safe-area-inset-top))
              max(18px,env(safe-area-inset-right))
              max(18px,env(safe-area-inset-bottom))
              max(18px,env(safe-area-inset-left));
    }
    #launch.launch.hidden,
    .ash-has-current-case #launch.launch{display:none}
    #launch .launch-panel{
      width:min(900px,calc(100vw - 44px));
      max-height:calc(100dvh - 44px);
      overflow-y:auto;
      overflow-x:hidden;
      overscroll-behavior:contain;
      scrollbar-gutter:stable;
      margin:auto;
      flex:0 0 auto;
    }
    #launch .launch-panel:focus-within{outline:1px solid rgba(118,234,212,.28);outline-offset:3px}
    @supports not (height:100dvh){
      #launch .launch-panel{max-height:calc(100vh - 44px)}
    }
    @media (max-height:760px) and (min-width:621px){
      #launch.launch{padding:12px max(16px,env(safe-area-inset-right)) 12px max(16px,env(safe-area-inset-left))}
      #launch .launch-panel{max-height:calc(100dvh - 24px);padding:22px}
    }
    @media (max-width:620px){
      #launch.launch{padding:max(10px,env(safe-area-inset-top)) 10px max(10px,env(safe-area-inset-bottom))}
      #launch .launch-panel{width:100%;max-height:calc(100dvh - 20px);padding:20px}
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
