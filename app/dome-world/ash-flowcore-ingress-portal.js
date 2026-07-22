export const ASH_FLOWCORE_INGRESS_PORTAL_VERSION = 'td613.ash.flowcore-ingress-portal/v0.9-phase-atomic-canonical-play';

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
let syncQueued = false;

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
      if (legacyPromise.id !== LEGACY_PROMISE_ID) legacyPromise.id = LEGACY_PROMISE_ID;
      if (!legacyPromise.hidden) legacyPromise.hidden = true;
      if (!legacyPromise.inert) legacyPromise.inert = true;
      if (legacyPromise.getAttribute('aria-hidden') !== 'true') legacyPromise.setAttribute('aria-hidden','true');
      if (legacyPromise.dataset.ashFlowcoreSuperseded !== 'true') legacyPromise.dataset.ashFlowcoreSuperseded = 'true';
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
  if (root.id) root.removeAttribute('id');
  root.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
  root.querySelectorAll('[aria-labelledby],[aria-describedby]').forEach(node => {
    node.removeAttribute('aria-labelledby');
    node.removeAttribute('aria-describedby');
  });
}

function setDataset(node, name, value) {
  if (!node) return;
  if (value == null) {
    if (node.dataset[name] != null) delete node.dataset[name];
    return;
  }
  const next = String(value);
  if (node.dataset[name] !== next) node.dataset[name] = next;
}

function setText(node, value) {
  if (!node) return;
  const next = String(value ?? '');
  if (node.textContent !== next) node.textContent = next;
}

function setBooleanProperty(node, name, value) {
  if (node && node[name] !== value) node[name] = value;
}

function setAttribute(node, name, value) {
  if (!node) return;
  if (value == null) {
    if (node.hasAttribute(name)) node.removeAttribute(name);
    return;
  }
  const next = String(value);
  if (node.getAttribute(name) !== next) node.setAttribute(name, next);
}

function playFlowcoreField() {
  host.__td613AshFlowcoreField?.setPhase?.(0);
  const canonicalPlay = doc.querySelector('[data-aia-play]');
  if (canonicalPlay) canonicalPlay.click();
  else host.__td613AshFlowcoreField?.play?.();
}

function ensurePlayControl(field) {
  const header = field?.querySelector('.ash-flowcore-field__header');
  if (!header || header.querySelector('[data-flowcore-ingress-play]')) return;
  const button = doc.createElement('button');
  button.type = 'button';
  button.className = 'ash-flowcore-field__play';
  button.dataset.flowcoreIngressPlay = 'true';
  button.textContent = 'Play consequence field';
  button.setAttribute('aria-label', 'Play the finite Flow-Core consequence explanation');
  button.addEventListener('click', playFlowcoreField);
  header.append(button);
}

function copyDynamicState() {
  if (!visibleField || !proxyField || visibleField === proxyField) return;
  for (const name of [
    'flowcorePhase','flowcorePhaseName','flowcorePlaying','flowcoreLifecycle','flowcoreCaseOpen',
    'flowcoreVisualSchema','flowcoreChannels','flowcoreReducedMotion','flowcoreAuthority'
  ]) setDataset(visibleField, name, proxyField.dataset[name]);

  for (const selector of [
    '[data-flowcore-phase-label]','[data-flowcore-consequence]','[data-flowcore-technical]','[data-flowcore-exact-state]'
  ]) {
    const source = proxyField.querySelector(selector);
    const target = visibleField.querySelector(selector);
    if (source && target) setText(target, source.textContent);
  }

  const sourceSteps = proxyField.querySelectorAll('[data-static-phase]');
  const targetSteps = visibleField.querySelectorAll('[data-static-phase]');
  sourceSteps.forEach((source,index) => {
    const target = targetSteps[index];
    if (!target) return;
    setAttribute(target, 'aria-current', source.getAttribute('aria-current'));
  });
}

function applyProxyPosture(node) {
  if (!node || node === visibleField) return;
  if (!node.classList.contains('ash-flowcore-field--proxy')) node.classList.add('ash-flowcore-field--proxy');
  setBooleanProperty(node, 'hidden', true);
  setBooleanProperty(node, 'inert', true);
  setAttribute(node, 'aria-hidden', 'true');
  if (node.id || node.querySelector('[id],[aria-labelledby],[aria-describedby]')) stripDuplicateIds(node);
}

function observeProxy(nextProxy) {
  if (!nextProxy || nextProxy === visibleField) return;
  if (proxyObserver) proxyObserver.disconnect();
  if (proxyField?.isConnected && proxyField !== nextProxy) proxyField.remove();
  proxyField = nextProxy;
  applyProxyPosture(proxyField);
  proxyObserver = new MutationObserver(copyDynamicState);
  proxyObserver.observe(proxyField, {
    subtree:true,
    childList:true,
    characterData:true,
    attributes:true,
    attributeFilter:[
      'data-flowcore-phase','data-flowcore-phase-name','data-flowcore-playing','data-flowcore-lifecycle',
      'data-flowcore-case-open','data-flowcore-visual-schema','data-flowcore-channels',
      'data-flowcore-reduced-motion','data-flowcore-authority','aria-current'
    ]
  });
  copyDynamicState();
}

function normalizeStageFields() {
  const stage = stageHost();
  if (!stage) return Object.freeze({ total:0, visible:0, proxy:0 });
  const fields = [...stage.querySelectorAll(':scope > .ash-flowcore-field')];
  const siblings = fields.filter(node => node !== visibleField);
  if (proxyField && !proxyField.isConnected) {
    proxyObserver?.disconnect();
    proxyObserver = null;
    proxyField = null;
  }
  const preferred = siblings.includes(proxyField) ? proxyField : siblings.at(-1) || null;
  if (preferred && preferred !== proxyField) observeProxy(preferred);
  for (const node of siblings) {
    if (node === proxyField) applyProxyPosture(node);
    else node.remove();
  }
  return Object.freeze({
    total:[...stage.querySelectorAll(':scope > .ash-flowcore-field')].length,
    visible:[...stage.querySelectorAll(':scope > .ash-flowcore-field')].filter(node => !node.hidden && getComputedStyle(node).display !== 'none').length,
    proxy:proxyField?.isConnected ? 1 : 0
  });
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
  setBooleanProperty(visibleField, 'hidden', false);
  setBooleanProperty(visibleField, 'inert', false);
  setAttribute(visibleField, 'aria-hidden', null);
  visibleField.classList.remove('ash-flowcore-field--proxy');
  setDataset(visibleField, 'flowcoreHost', 'ingress');
  setBooleanProperty(ingress, 'hidden', false);
  setBooleanProperty(ingress, 'inert', false);
  setAttribute(ingress, 'aria-hidden', null);
  if (visibleField.parentElement !== ingress) ingress.replaceChildren(visibleField);
  const nextProxy = findStageField();
  if (nextProxy && nextProxy !== proxyField) observeProxy(nextProxy);
  normalizeStageFields();
  setDataset(doc.documentElement, 'ashFlowcoreVisibleHost', 'INGRESS');
  return true;
}

function portalToStage() {
  const stage = stageHost();
  if (!stage || !visibleField) return false;
  setBooleanProperty(visibleField, 'hidden', false);
  setBooleanProperty(visibleField, 'inert', false);
  setAttribute(visibleField, 'aria-hidden', null);
  visibleField.classList.remove('ash-flowcore-field--proxy');
  setDataset(visibleField, 'flowcoreHost', 'aia');
  stage.classList.add('ash-flowcore-mounted');
  if (visibleField.parentElement !== stage) stage.append(visibleField);
  normalizeStageFields();
  const ingress = doc.getElementById(INGRESS_HOST_ID);
  if (ingress?.dataset.ashFlowcoreIngressHost === 'true') {
    setBooleanProperty(ingress, 'hidden', true);
    setBooleanProperty(ingress, 'inert', true);
    setAttribute(ingress, 'aria-hidden', 'true');
  }
  setDataset(doc.documentElement, 'ashFlowcoreVisibleHost', 'AIA');
  return true;
}

function sync(reason = 'OBSERVED') {
  if (syncing || !doc?.body) return false;
  syncing = true;
  try {
    const open = caseOpen();
    const moved = open ? portalToStage() : portalToIngress();
    normalizeStageFields();
    if (!open) {
      const nextProxy = findStageField();
      if (nextProxy && nextProxy !== proxyField) observeProxy(nextProxy);
    }
    if (visibleField) {
      setDataset(visibleField, 'flowcorePortal', ASH_FLOWCORE_INGRESS_PORTAL_VERSION);
      setDataset(visibleField, 'flowcorePortalReason', reason);
    }
    host.dispatchEvent(new CustomEvent('td613:ash:flowcore-portal-synced', {
      detail:{
        version:ASH_FLOWCORE_INGRESS_PORTAL_VERSION,
        visible_host:doc.documentElement.dataset.ashFlowcoreVisibleHost || null,
        case_open:open,
        moved,
        reason
      }
    }));
    return moved;
  } finally {
    syncing = false;
  }
}

function queueSync(reason) {
  if (syncQueued) return;
  syncQueued = true;
  queueMicrotask(() => {
    syncQueued = false;
    sync(reason);
  });
}

function mutationTouchesPortal(record) {
  const selector = '.ash-flowcore-field,#ashAiaMembrane,.ash-aia__stage,#launch,.launch-panel,#guidedLaunchPromise,[data-aia-stage]';
  return [...record.addedNodes, ...record.removedNodes].some(node => {
    if (node?.nodeType !== 1) return false;
    return node.matches?.(selector) || Boolean(node.querySelector?.(selector));
  });
}

function installObserver() {
  if (bodyObserver) return;
  bodyObserver = new MutationObserver(records => {
    if (!records.some(mutationTouchesPortal)) return;
    queueSync('DOM_MUTATION');
  });
  bodyObserver.observe(doc.body, { childList:true, subtree:true });
}

export function installAshFlowcoreIngressPortal() {
  if (!host || !doc?.body || host.__td613AshFlowcoreIngressPortal) return false;
  ensurePortalStyles();
  installObserver();
  for (const type of ['aia-ready','aia3-ready','composition-stable','case-opened','case-created','profile-demo-hydrated','case-closed','session-boundary-reconciled']) {
    host.addEventListener(`td613:ash:${type}`, () => queueSync(type.toUpperCase()));
  }
  host.addEventListener('td613:ash:flowcore-field-phase', copyDynamicState);
  host.__td613AshFlowcoreIngressPortal = Object.freeze({
    version:ASH_FLOWCORE_INGRESS_PORTAL_VERSION,
    refresh:() => sync('EXPLICIT_REFRESH'),
    current:() => Object.freeze({
      visible_host:doc.documentElement.dataset.ashFlowcoreVisibleHost || null,
      case_open:caseOpen(),
      visible:Boolean(visibleField?.isConnected && !visibleField.hidden),
      proxy_present:Boolean(proxyField?.isConnected),
      proxy_count:[...doc.querySelectorAll('.ash-flowcore-field--proxy')].filter(node => node.isConnected).length,
      field_count:doc.querySelectorAll('.ash-flowcore-field').length,
      duplicate_visible_fields:[...doc.querySelectorAll('.ash-flowcore-field')].filter(node => !node.hidden && getComputedStyle(node).display !== 'none').length
    })
  });
  queueSync('INSTALL');
  return true;
}

if (host && doc) installAshFlowcoreIngressPortal();
