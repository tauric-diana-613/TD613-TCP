export const ASH_INGRESS_LAYOUT_VERSION = 'td613.ash.ingress-layout/v1.0-canonical-native-scroll';

const STYLE_ID = 'td613-ash-ingress-scroll-membrane';
const POINTER_KEY = 'td613.ash-keep.current-case';
const SESSION_EPOCH_KEY = 'td613.ash.session.epoch';
const SESSION_EPOCH = '20260718-canonical-membrane-v6';

function ensureStyle(doc = document) {
  let style = doc.getElementById(STYLE_ID);
  if (!style) {
    style = doc.createElement('style');
    style.id = STYLE_ID;
    doc.head.append(style);
  }
  style.textContent = `
    html[data-ash-canonical-ingress],
    html[data-ash-canonical-ingress] body{
      overflow-x:hidden!important;
      overscroll-behavior-y:auto!important;
      scroll-behavior:auto!important;
    }
    html[data-ash-canonical-ingress] body{
      overflow-y:auto!important;
      -webkit-overflow-scrolling:touch;
    }
    html[data-ash-canonical-ingress] #launch.launch{
      display:flex;
      align-items:flex-start!important;
      justify-content:center!important;
      overflow-y:auto!important;
      overflow-x:hidden!important;
      overscroll-behavior-y:auto!important;
      -webkit-overflow-scrolling:touch;
      padding:max(16px,env(safe-area-inset-top))
              max(16px,env(safe-area-inset-right))
              max(16px,env(safe-area-inset-bottom))
              max(16px,env(safe-area-inset-left))!important;
    }
    html[data-ash-canonical-ingress] #launch.launch.hidden,
    html[data-ash-canonical-ingress][data-ash-session-open="true"] #launch.launch{
      display:none!important;
    }
    html[data-ash-canonical-ingress][data-ash-session-open="false"] #launch.launch:not(.hidden){
      display:flex!important;
    }
    html[data-ash-canonical-ingress] #launch .launch-panel{
      width:min(900px,calc(100vw - 32px))!important;
      max-height:none!important;
      overflow:visible!important;
      overscroll-behavior:auto!important;
      scrollbar-gutter:auto!important;
      margin:auto!important;
      flex:0 0 auto;
    }
    html[data-ash-canonical-ingress] main,
    html[data-ash-canonical-ingress] .workspace,
    html[data-ash-canonical-ingress] .premium-workspace{
      overflow:visible!important;
    }
    html[data-ash-canonical-ingress] .map-stage canvas{
      touch-action:pan-y pinch-zoom!important;
    }
    html[data-ash-canonical-ingress] .ash-scrollbar-active{
      scrollbar-color:auto!important;
    }
    @media(max-width:760px){
      html[data-ash-canonical-ingress] body{overscroll-behavior-y:auto!important}
      html[data-ash-canonical-ingress] #launch.launch{
        align-items:flex-start!important;
        padding:max(8px,env(safe-area-inset-top)) 8px max(8px,env(safe-area-inset-bottom))!important;
      }
      html[data-ash-canonical-ingress] #launch .launch-panel{
        width:100%!important;
        max-height:none!important;
        overflow:visible!important;
        padding:20px 16px calc(18px + env(safe-area-inset-bottom))!important;
      }
      html[data-ash-canonical-ingress] .map-stage canvas{touch-action:pan-y pinch-zoom!important}
    }
  `;
}

function sessionOpen(host = window) {
  try {
    return Boolean(host.localStorage.getItem(POINTER_KEY)
      && host.localStorage.getItem(SESSION_EPOCH_KEY) === SESSION_EPOCH);
  } catch {
    return false;
  }
}

function setSessionOpen(open, doc = document, host = window) {
  const next = Boolean(open);
  try {
    if (next) host.localStorage.setItem(SESSION_EPOCH_KEY, SESSION_EPOCH);
    else host.localStorage.removeItem(SESSION_EPOCH_KEY);
  } catch {}
  doc.documentElement.dataset.ashSessionOpen = String(next);
  const membrane = doc.getElementById('launch');
  if (next) membrane?.classList.add('hidden');
  else {
    doc.documentElement.classList.remove('ash-has-current-case');
    membrane?.classList.remove('hidden');
    membrane?.scrollTo?.({ top:0, behavior:'auto' });
    doc.querySelector('#launch .launch-panel')?.scrollTo?.({ top:0, behavior:'auto' });
  }
  return next;
}

export function measureAshIngress(host = window) {
  const panel = host.document?.querySelector('#launch .launch-panel');
  const membrane = host.document?.getElementById('launch');
  if (!panel || !membrane) return Object.freeze({ available:false });
  const rect = panel.getBoundingClientRect();
  return Object.freeze({
    available:true,
    version:ASH_INGRESS_LAYOUT_VERSION,
    session_open:sessionOpen(host),
    membrane_visible:getComputedStyle(membrane).display !== 'none',
    membrane_scroll_owner:true,
    panel_nested_scroll:false,
    panel:{
      top:rect.top,
      width:rect.width,
      height:rect.height,
      client_height:panel.clientHeight,
      scroll_height:panel.scrollHeight
    },
    membrane:{
      client_height:membrane.clientHeight,
      scroll_height:membrane.scrollHeight,
      scrollable:membrane.scrollHeight > membrane.clientHeight + 1,
      scroll_top:membrane.scrollTop
    },
    horizontal_overflow:Math.max(0, host.document.documentElement.scrollWidth - host.innerWidth)
  });
}

export function installAshIngressLayout(doc = document, host = window) {
  if (!doc?.head || !host || host.__td613AshIngressLayout?.version === ASH_INGRESS_LAYOUT_VERSION) return false;
  ensureStyle(doc);
  doc.documentElement.dataset.ashCanonicalIngress = ASH_INGRESS_LAYOUT_VERSION;
  doc.documentElement.dataset.ashIngressLayout = ASH_INGRESS_LAYOUT_VERSION;
  const membrane = doc.getElementById('launch');
  const panel = doc.querySelector('#launch .launch-panel');
  membrane?.classList.remove('ash-scrollbar-active');
  panel?.classList.remove('ash-scrollbar-active');
  membrane?.removeAttribute('data-ash-scrollbar-fade');
  panel?.removeAttribute('data-ash-scrollbar-fade');
  if (panel) {
    panel.setAttribute('tabindex', '-1');
    panel.dataset.ashScrollMembrane = 'false';
  }
  setSessionOpen(sessionOpen(host), doc, host);

  for (const type of ['case-opened', 'case-created', 'profile-demo-hydrated', 'capsule-opened']) {
    host.addEventListener(`td613:ash:${type}`, () => setSessionOpen(true, doc, host));
  }
  host.addEventListener('td613:ash:case-closed', () => setSessionOpen(false, doc, host));

  host.__td613AshIngressLayout = Object.freeze({
    version:ASH_INGRESS_LAYOUT_VERSION,
    session_epoch:SESSION_EPOCH,
    measure:() => measureAshIngress(host),
    openSession:() => setSessionOpen(true, doc, host),
    closeSession:() => setSessionOpen(false, doc, host),
    scrollToTop:() => membrane?.scrollTo?.({ top:0, behavior:'auto' })
  });
  host.dispatchEvent(new CustomEvent('td613:ash:ingress-layout-ready', { detail:measureAshIngress(host) }));
  return true;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') installAshIngressLayout();
