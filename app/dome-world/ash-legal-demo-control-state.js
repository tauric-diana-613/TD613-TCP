export const ASH_LEGAL_CONTROL_STATE_VERSION = 'td613.ash.legal-control-state/v0.1-registered-demo-owner';

const PROFILE = 'legal';
const READY_LABEL = 'Open Legal matter demo';
const BUSY_LABEL = 'Opening Legal matter…';

function elements(doc = document) {
  return {
    profile:doc.getElementById('newProfile'),
    button:doc.getElementById('startDemo'),
    newCase:doc.getElementById('newCase'),
    status:doc.getElementById('demoProfileStatus')
  };
}

function setAttributeIfChanged(node, name, value) {
  const next = String(value);
  if (node.getAttribute(name) !== next) node.setAttribute(name, next);
}

function ensureStatus(doc = document) {
  let status = doc.getElementById('demoProfileStatus');
  if (status) return status;
  const actions = doc.getElementById('startDemo')?.closest('.actions');
  if (!actions) return null;
  status = doc.createElement('p');
  status.id = 'demoProfileStatus';
  status.className = 'demo-profile-status';
  status.setAttribute('aria-live', 'polite');
  actions.insertAdjacentElement('afterend', status);
  return status;
}

export function reconcileLegalDemoControl(doc = document) {
  const { profile, button, newCase } = elements(doc);
  if (!profile || !button || profile.value !== PROFILE) return false;
  const busy = button.getAttribute('aria-busy') === 'true'
    || /(?:Hydrating|Opening) Legal matter/i.test(button.textContent || '');
  button.disabled = busy;
  setAttributeIfChanged(button, 'aria-disabled', busy);
  setAttributeIfChanged(button, 'aria-busy', busy);
  button.classList.toggle('demo-available', !busy);
  button.classList.toggle('demo-unavailable', busy);
  button.textContent = busy ? BUSY_LABEL : READY_LABEL;
  button.title = 'Hydrate a synthetic Legal matter locally with deadlines, filings, evidence, privilege boundaries, competing explanations, routes, and human-reviewed next actions.';
  button.dataset.ashMethodDemoState = busy ? 'BUSY' : 'READY';
  button.dataset.ashLegalControlState = busy ? 'BUSY' : 'READY';
  if (newCase) {
    newCase.disabled = false;
    setAttributeIfChanged(newCase, 'aria-disabled', false);
  }
  const status = ensureStatus(doc);
  if (status && !busy && !/Legal matter demo hydrated/i.test(status.textContent || '')) {
    status.innerHTML = '<strong>Legal matter demo available.</strong> Synthetic deadlines, filings, evidence, privilege boundaries, routes, and next actions; no real client data or legal advice.';
  }
  return true;
}

export function installLegalDemoControlState(doc = document, host = window) {
  const { profile, button } = elements(doc);
  if (!profile || !button || host.__td613AshLegalControlState) return false;
  let queued = false;
  const defer = () => {
    if (queued) return;
    queued = true;
    host.setTimeout(() => {
      queued = false;
      reconcileLegalDemoControl(doc);
    }, 0);
  };
  profile.addEventListener('change', defer);
  for (const type of ['profile-demo-hydrated', 'case-opened', 'case-closed', 'aia3-readiness-changed']) {
    host.addEventListener(`td613:ash:${type}`, defer);
  }
  host.addEventListener('click', event => {
    const target = event.target?.closest?.('#startDemo');
    if (!target || profile.value !== PROFILE) return;
    target.disabled = true;
    setAttributeIfChanged(target, 'aria-disabled', true);
    setAttributeIfChanged(target, 'aria-busy', true);
    target.dataset.ashMethodDemoState = 'BUSY';
    target.dataset.ashLegalControlState = 'BUSY';
    target.textContent = BUSY_LABEL;
  }, true);
  const observer = new MutationObserver(defer);
  observer.observe(button, {
    attributes:true,
    attributeFilter:['disabled', 'aria-disabled', 'aria-busy', 'data-ash-method-demo-state'],
    childList:true
  });
  doc.documentElement.dataset.ashLegalControlState = ASH_LEGAL_CONTROL_STATE_VERSION;
  host.__td613AshLegalControlState = Object.freeze({
    version:ASH_LEGAL_CONTROL_STATE_VERSION,
    reconcile:() => reconcileLegalDemoControl(doc)
  });
  queueMicrotask(() => reconcileLegalDemoControl(doc));
  return true;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') installLegalDemoControlState();
