export const ASH_FLOWCORE_INGRESS_PORTAL_VERSION = 'td613.ash.flowcore-ingress-portal/v0.1-single-visible-field';

const host = globalThis.window;
const doc = globalThis.document;
const POINTER_KEY = 'td613.ash-keep.current-case';
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
  return doc.getElementById('guidedLaunchPromise');
}

function stageHost() {
  return doc.querySelector('#ashAiaMembrane [data-aia-stage], .ash-aia__stage');
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
  ingress.classList.add('ash-flowcore-ingress-host');
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
  ingressHost()?.classList.remove('ash-flowcore-ingress-host');
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
