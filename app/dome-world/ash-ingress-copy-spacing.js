export const ASH_INGRESS_COPY_SPACING_VERSION = 'td613.ash.ingress-copy-spacing/v0.1-title-recovery-primary-order';

const host = globalThis.window;
const doc = globalThis.document;
let observer = null;
let syncing = false;

function ensureStyle() {
  if (!doc?.head) return;
  let style = doc.getElementById('td613-ash-ingress-copy-spacing');
  if (!style) {
    style = doc.createElement('style');
    style.id = 'td613-ash-ingress-copy-spacing';
    doc.head.append(style);
  }
  style.textContent = `
    html[data-ash-ingress-copy-spacing] #launch .launch-panel{
      position:relative;
    }
    html[data-ash-ingress-copy-spacing] #launch #ashLaunchTitle{
      position:relative;
      z-index:3;
      margin-top:10px!important;
      margin-bottom:4px!important;
    }
    html[data-ash-ingress-copy-spacing] #launch #capsuleRecoveryLaunchDescription{
      position:relative;
      z-index:3;
      display:block;
      max-width:680px;
      margin:0 0 9px!important;
      padding:0!important;
      color:var(--gold,#e4c66c);
      font:600 .68rem/1.45 var(--mono,ui-monospace,monospace);
      letter-spacing:.01em;
    }
    html[data-ash-ingress-copy-spacing] #launch .ash-ingress-primary-copy{
      position:relative;
      z-index:2;
      display:block;
      margin:0 0 12px!important;
      padding:0!important;
    }
    html[data-ash-ingress-copy-spacing] #launch #capsuleRecoveryLaunchDescription + .ash-ingress-primary-copy{
      margin-top:0!important;
    }
    @media(max-width:620px){
      html[data-ash-ingress-copy-spacing] body[data-ash-aia-case-open="false"] .ash-aia__ingress-slot #launch #ashLaunchTitle,
      html[data-ash-ingress-copy-spacing] body[data-ash-aia-case-open="false"] .ash-aia__ingress-slot #launch #capsuleRecoveryLaunchDescription,
      html[data-ash-ingress-copy-spacing] body[data-ash-aia-case-open="false"] .ash-aia__ingress-slot #launch .ash-ingress-primary-copy{
        display:block!important;
      }
      html[data-ash-ingress-copy-spacing] #launch #ashLaunchTitle{
        margin-top:6px!important;
        margin-bottom:3px!important;
        font-size:clamp(1.65rem,10vw,2.65rem)!important;
      }
      html[data-ash-ingress-copy-spacing] #launch #capsuleRecoveryLaunchDescription{
        margin-bottom:7px!important;
        font-size:.62rem;
        line-height:1.4;
      }
      html[data-ash-ingress-copy-spacing] #launch .ash-ingress-primary-copy{
        margin-bottom:9px!important;
        font-size:.7rem;
        line-height:1.45;
      }
    }
  `;
}

function primaryCopy(panel, title, recovery) {
  return [...panel.children].find(node =>
    node.tagName === 'P'
      && node !== recovery
      && node !== title
      && !node.classList.contains('aia3-restore-note')
      && !node.closest('.guided-launch-promise')
  ) || null;
}

function measure() {
  const title = doc?.getElementById('ashLaunchTitle');
  const recovery = doc?.getElementById('capsuleRecoveryLaunchDescription');
  const primary = doc?.querySelector('#launch .ash-ingress-primary-copy');
  if (!title || !recovery || !primary) return Object.freeze({ available:false });
  const titleRect = title.getBoundingClientRect();
  const recoveryRect = recovery.getBoundingClientRect();
  const primaryRect = primary.getBoundingClientRect();
  const overlap = Math.max(0, recoveryRect.bottom - primaryRect.top);
  return Object.freeze({
    available:true,
    version:ASH_INGRESS_COPY_SPACING_VERSION,
    order:[title.id, recovery.id, 'ash-ingress-primary-copy'],
    title_bottom:titleRect.bottom,
    recovery_top:recoveryRect.top,
    recovery_bottom:recoveryRect.bottom,
    primary_top:primaryRect.top,
    overlap_px:overlap,
    ordered:title.nextElementSibling === recovery && recovery.nextElementSibling === primary
  });
}

function sync(reason = 'OBSERVED') {
  if (syncing || !doc?.body) return false;
  syncing = true;
  try {
    ensureStyle();
    const panel = doc.querySelector('#launch .launch-panel');
    const title = doc.getElementById('ashLaunchTitle');
    const recovery = doc.getElementById('capsuleRecoveryLaunchDescription');
    if (!panel || !title || !recovery) return false;
    const primary = primaryCopy(panel, title, recovery);
    if (!primary) return false;
    primary.classList.add('ash-ingress-primary-copy');
    if (title.nextElementSibling !== recovery) title.insertAdjacentElement('afterend', recovery);
    if (recovery.nextElementSibling !== primary) recovery.insertAdjacentElement('afterend', primary);
    doc.documentElement.dataset.ashIngressCopySpacing = ASH_INGRESS_COPY_SPACING_VERSION;
    panel.dataset.ashIngressCopyOrder = 'TITLE_RECOVERY_PRIMARY';
    const observation = measure();
    host.dispatchEvent(new CustomEvent('td613:ash:ingress-copy-spaced', {
      detail:{ ...observation, reason }
    }));
    return true;
  } finally {
    syncing = false;
  }
}

export function installAshIngressCopySpacing() {
  if (!host || !doc?.body || host.__td613AshIngressCopySpacing) return false;
  ensureStyle();
  sync('INSTALL');
  observer = new MutationObserver(records => {
    if (!records.some(record => record.addedNodes.length || record.removedNodes.length)) return;
    queueMicrotask(() => sync('DOM_MUTATION'));
  });
  observer.observe(doc.body, { childList:true, subtree:true });
  for (const type of ['core-ready','aia-ready','aia3-ready','composition-stable','case-closed']) {
    host.addEventListener(`td613:ash:${type}`, () => queueMicrotask(() => sync(type.toUpperCase())));
  }
  host.__td613AshIngressCopySpacing = Object.freeze({
    version:ASH_INGRESS_COPY_SPACING_VERSION,
    refresh:() => sync('EXPLICIT_REFRESH'),
    measure
  });
  return true;
}

if (host && doc) installAshIngressCopySpacing();
