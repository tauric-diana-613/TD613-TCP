export const ASH_FLOWCORE_INGRESS_PORTAL_VERSION = 'td613.ash.flowcore-ingress-portal/v0.4-post-controls-canonical-host';

const host = globalThis.window;
const doc = globalThis.document;
const POINTER_KEY = 'td613.ash-keep.current-case';
const INGRESS_HOST_ID = 'guidedLaunchPromise';
const LEGACY_PROMISE_ID = 'guidedLaunchPromiseLegacy';
let visibleField = null;
let proxyField = null;
let bodyObserver = null;
let proxyObserver = null;
let syncing = false;

function caseOpen() {
  try { return Boolean(host.localStorage.getItem(POINTER_KEY)); }
  catch { return false; }
}

function ingressHost() {
  const panel = doc.querySelector('#launch .launch-panel');
  if (!panel) return null;
  panel.classList.add('ash-flowcore-launch-panel');
  let ingress = doc.getElementById(INGRESS_HOST_ID);
  if (ingress?.dataset.ashFlowcoreIngressHost !== 'true') {
    const legacyPromise = ingress;
    if (legacyPromise) {
      legacyPromise.id = LEGACY_PROMISE_ID;
      legacyPromise.hidden = true;
      legacyPromise.inert = true;
      legacyPromise.setAttribute('aria-hidden','true');
      legacyPromise.dataset.ashFlowcoreSuperseded = 'true';
    }
    ingress = null;
  }
  if (!ingress) {
    ingress = doc.createElement('section');
    ingress.id = INGRESS_HOST_ID;
    ingress.className = 'ash-flowcore-ingress-host';
    ingress.dataset.ashFlowcoreIngressHost = 'true';
    ingress.dataset.ashAia3 = 'true';
    ingress.setAttribute('aria-label','Flow-Core consequence field');
    const actions = panel.querySelector(':scope > .actions');
    if (actions) actions.insertAdjacentElement('afterend', ingress);
    else panel.append(ingress);
  }
  return ingress;
}

function stageHost() {
  return doc.querySelector('#ashAiaMembrane [data-aia-stage], .ash-aia__stage');
}

function ensurePortalStyles() {
  if (doc.getElementById('td613-ash-flowcore-ingress-portal-css')) return;
  const style = doc.createElement('style');
  style.id = 'td613-ash-flowcore-ingress-portal-css';
  style.textContent = `
    #launch .launch-panel.ash-flowcore-launch-panel{
      max-height:calc(100vh - 44px)!important;
      overflow-y:auto!important;
      overscroll-behavior:contain;
      scrollbar-gutter:stable;
    }
    #guidedLaunchPromiseLegacy[data-ash-flowcore-superseded="true"]{display:none!important}
    #guidedLaunchPromise.ash-flowcore-ingress-host{
      display:block!important;
      width:100%!important;
      max-width:none!important;
      margin:16px 0 0!important;
      padding:0!important;
      border:1px solid rgba(118,234,212,.22)!important;
      border-radius:14px!important;
      overflow:hidden!important;
      background:#010705!important;
      clear:both;
    }
    .ash-flowcore-field[data-flowcore-host="ingress"]{
      min-height:0!important;
      padding:13px!important;
    }
    .ash-flowcore-field[data-flowcore-host="ingress"] .ash-flowcore-field__canvas{
      min-height:270px!important;
    }
    .ash-flowcore-field[data-flowcore-host="ingress"] .ash-flowcore-field__canvas svg{
      min-height:270px!important;
    }
    .ash-flowcore-field__play{
      position:relative;
      z-index:4;
      flex:0 0 auto;
      min-height:34px;
      padding:7px 10px;
      border:1px solid rgba(228,198,108,.5);
      border-radius:9px;
      background:rgba(228,198,108,.065);
      color:var(--fc-gold,#e4c66c);
      font:700 .56rem/1.2 var(--mono,ui-monospace,monospace);
      text-transform:uppercase;
      cursor:pointer;
    }
    .ash-flowcore-field__play:hover{background:rgba(228,198,108,.12)}
    .ash-flowcore-field__play:focus-visible{outline:2px solid var(--fc-mint,#76ead4);outline-offset:3px}
    .ash-flowcore-field--proxy{display:none!important}
    @media(max-width:760px){
      #launch .launch-panel.ash-flowcore-launch-panel{max-height:calc(100vh - 16px)!important}
      #guidedLaunchPromise.ash-flowcore-ingress-host{margin:10px 0 0!important}
      .ash-flowcore-field[data-flowcore-host="ingress"]{padding:8px!important}
      .ash-flowcore-field[data-flowcore-host="ingress"] .ash-flowcore-field__header{grid-template-columns:1fr!important}
      .ash-flowcore-field__play{justify-self:start}
    }
  `;
  doc.head.append(style);
}

function stripDuplicateIds(root) {
  root.removeAttribute('id');
  root.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
  root.querySelectorAll('[aria-labelledby],[aria-describedby]').forEach(node => {
    node.removeAttribute('aria-labelledby');
    node.removeAttribute('aria-describedby');
  });
}

function ensurePlayControl(field) {
  const header = field?.querySelector('.ash-flowcore-field__header');
  if (!header || header.querySelector('[data-flowcore-ingress-play]')) return;
  const button = doc.createElement('button');
  button.type = 'button';
  button.className = 'ash-flowcore-field__play';
  button.dataset.aiaPlay = '';
  button.dataset.flowcoreIngressPlay = 'true';
  button.textContent = 'Play consequence field';
  button.setAttribute('aria-label', 'Play the finite Flow-Core consequence explanation');
  header.append(button);
}

function copyDynamicState() {
  if (!visibleField || !proxyField || visibleField === proxyField) return;
  for (const name of [
    'flowcorePhase','flowcorePhaseName','flowcorePlaying','flowcoreLifecycle','flowcoreCaseOpen',
    'flowcoreVisualSchema','flowcoreChannels','flowcoreReducedMotion','flowcoreAuthority'
  ]) {
    if (proxyField.dataset[name] == null) delete visibleField.dataset[name];
    else visibleField.dataset[name] = proxyField.dataset[name];
  }
  for (const selector of [
    '[data-flowcore-phase-label]','[data-flowcore-consequence]','[data-flowcore-technical]','[data-flowcore-exact-state]'
  ]) {
    const source = proxyField.querySelector(selector);
    const target = visibleField.querySelector(selector);
    if (source && target) target.textContent = source.textContent;
  }
  const sourceSteps = proxyField.querySelectorAll('[data-static-phase]');
  const targetSteps = visibleField.querySelectorAll('[data-static-phase]');
  sourceSteps.forEach((source,index) => {
    const target = targetSteps[index];
    if (!target) return;
    const current = source.getAttribute('aria-current');
    if (current == null) target.removeAttribute('aria-current');
    else target.setAttribute('aria-current', current);
  });
}

function observeProxy(nextProxy) {
  if (proxyObserver) proxyObserver.disconnect();
  proxyField = nextProxy;
  if (!proxyField) return;
  proxyField.classList.add('ash-flowcore-field--proxy');
  proxyField.hidden = true;
  proxyField.inert = true;
  proxyField.setAttribute('aria-hidden','true');
  stripDuplicateIds(proxyField);
  proxyObserver = new MutationObserver(copyDynamicState);
  proxyObserver.observe(proxyField, { subtree:true, childList:true, characterData:true, attributes:true });
  copyDynamicState();
}

function findStageField() {
  const stage = stageHost();
  if (!stage) return null;
  return [...stage.querySelectorAll(':scope > .ash-flowcore-field')].find(node => node !== visibleField) || null;
}

function portalToIngress() {
  const ingress = ingressHost();
  const stage = stageHost();
  if (!ingress || !stage) return false;
  if (!visibleField?.isConnected) {
    visibleField = stage.querySelector(':scope > .ash-flowcore-field:not(.ash-flowcore-field--proxy)')
      || doc.querySelector('.ash-flowcore-field:not(.ash-flowcore-field--proxy)');
  }
  if (!visibleField) return false;
  ensurePlayControl(visibleField);
  visibleField.hidden = false;
  visibleField.inert = false;
  visibleField.removeAttribute('aria-hidden');
  visibleField.classList.remove('ash-flowcore-field--proxy');
  visibleField.dataset.flowcoreHost = 'ingress';
  ingress.hidden = false;
  ingress.inert = false;
  ingress.removeAttribute('aria-hidden');
  if (visibleField.parentElement !== ingress) ingress.replaceChildren(visibleField);
  const nextProxy = findStageField();
  if (nextProxy && nextProxy !== proxyField) observeProxy(nextProxy);
  doc.documentElement.dataset.ashFlowcoreVisibleHost = 'INGRESS';
  return true;
}

function portalToStage() {
  const stage = stageHost();
  if (!stage || !visibleField) return false;
  if (proxyObserver) proxyObserver.disconnect();
  proxyObserver = null;
  if (proxyField && proxyField !== visibleField) proxyField.remove();
  proxyField = null;
  visibleField.hidden = false;
  visibleField.inert = false;
  visibleField.removeAttribute('aria-hidden');
  visibleField.dataset.flowcoreHost = 'aia';
  stage.classList.add('ash-flowcore-mounted');
  if (visibleField.parentElement !== stage) stage.append(visibleField);
  const ingress = doc.getElementById(INGRESS_HOST_ID);
  if (ingress?.dataset.ashFlowcoreIngressHost === 'true') {
    ingress.hidden = true;
    ingress.inert = true;
    ingress.setAttribute('aria-hidden','true');
  }
  doc.documentElement.dataset.ashFlowcoreVisibleHost = 'AIA';
  return true;
}

function sync(reason = 'OBSERVED') {
  if (syncing || !doc?.body) return false;
  syncing = true;
  try {
    const moved = caseOpen() ? portalToStage() : portalToIngress();
    if (!caseOpen()) {
      const nextProxy = findStageField();
      if (nextProxy && nextProxy !== proxyField) observeProxy(nextProxy);
    }
    if (visibleField) {
      visibleField.dataset.flowcorePortal = ASH_FLOWCORE_INGRESS_PORTAL_VERSION;
      visibleField.dataset.flowcorePortalReason = reason;
    }
    host.dispatchEvent(new CustomEvent('td613:ash:flowcore-portal-synced', {
      detail:{
        version:ASH_FLOWCORE_INGRESS_PORTAL_VERSION,
        visible_host:doc.documentElement.dataset.ashFlowcoreVisibleHost || null,
        case_open:caseOpen(),
        moved,
        reason
      }
    }));
    return moved;
  } finally {
    syncing = false;
  }
}

function installObserver() {
  if (bodyObserver) return;
  bodyObserver = new MutationObserver(records => {
    if (!records.some(record => record.addedNodes.length || record.removedNodes.length)) return;
    queueMicrotask(() => sync('DOM_MUTATION'));
  });
  bodyObserver.observe(doc.body, { childList:true, subtree:true });
}

export function installAshFlowcoreIngressPortal() {
  if (!host || !doc?.body || host.__td613AshFlowcoreIngressPortal) return false;
  ensurePortalStyles();
  installObserver();
  for (const type of ['aia-ready','aia3-ready','composition-stable','case-opened','case-created','profile-demo-hydrated','case-closed','session-boundary-reconciled']) {
    host.addEventListener(`td613:ash:${type}`, () => queueMicrotask(() => sync(type.toUpperCase())));
  }
  host.__td613AshFlowcoreIngressPortal = Object.freeze({
    version:ASH_FLOWCORE_INGRESS_PORTAL_VERSION,
    refresh:() => sync('EXPLICIT_REFRESH'),
    current:() => Object.freeze({
      visible_host:doc.documentElement.dataset.ashFlowcoreVisibleHost || null,
      case_open:caseOpen(),
      visible:Boolean(visibleField?.isConnected && !visibleField.hidden),
      proxy_present:Boolean(proxyField?.isConnected),
      duplicate_visible_fields:[...doc.querySelectorAll('.ash-flowcore-field')].filter(node => !node.hidden && getComputedStyle(node).display !== 'none').length
    })
  });
  queueMicrotask(() => sync('INSTALL'));
  return true;
}

if (host && doc) installAshFlowcoreIngressPortal();
