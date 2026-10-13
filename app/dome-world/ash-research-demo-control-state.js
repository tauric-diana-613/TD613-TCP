export const ASH_RESEARCH_CONTROL_STATE_VERSION = 'td613.ash.research-control-state/v0.4-child-legible-ledger';

const PROFILE = 'research';
const READY_LABEL = 'Open Research project demo';
const BUSY_LABEL = 'Opening Research project…';

function elements(doc = document) {
  return {
    profile: doc.getElementById('newProfile'),
    button: doc.getElementById('startDemo'),
    newCase: doc.getElementById('newCase')
  };
}

function setAttributeIfChanged(node, name, value) {
  const next = String(value);
  if (node.getAttribute(name) !== next) node.setAttribute(name, next);
}

function setDatasetIfChanged(node, name, value) {
  if (node.dataset[name] !== value) node.dataset[name] = value;
}

export function reconcileResearchDemoControl(doc = document) {
  const { profile, button, newCase } = elements(doc);
  if (!profile || !button || profile.value !== PROFILE) return false;
  const busy = button.getAttribute('aria-busy') === 'true' || /Opening Research project/i.test(button.textContent || '');
  if (button.disabled !== busy) button.disabled = busy;
  setAttributeIfChanged(button, 'aria-disabled', busy);
  setAttributeIfChanged(button, 'aria-busy', busy);
  button.classList.toggle('demo-available', !busy);
  button.classList.toggle('demo-unavailable', busy);
  if (button.textContent !== (busy ? BUSY_LABEL : READY_LABEL)) button.textContent = busy ? BUSY_LABEL : READY_LABEL;
  button.title = 'Hydrate one synthetic Research project and audit which current Ash surfaces are populated, gesture-ready, lifecycle-held, intentionally dormant, missing, or separately gated.';
  if (newCase) {
    if (newCase.disabled) newCase.disabled = false;
    setAttributeIfChanged(newCase, 'aria-disabled', false);
    setDatasetIfChanged(newCase, 'ashResearchBlankCaseState', 'READY');
  }
  setDatasetIfChanged(button, 'ashResearchControlState', busy ? 'BUSY' : 'READY');
  return true;
}

export function installResearchDemoControlState(doc = document, host = window) {
  const { profile, button } = elements(doc);
  if (!profile || !button || host.__td613AshResearchControlState) return false;
  let reconcileQueued = false;
  const defer = () => {
    if (reconcileQueued) return;
    reconcileQueued = true;
    host.setTimeout(() => {
      reconcileQueued = false;
      reconcileResearchDemoControl(doc);
    }, 0);
  };
  profile.addEventListener('change', defer);
  host.addEventListener('td613:ash:profile-demo-hydrated', defer);
  host.addEventListener('td613:ash:case-opened', defer);
  host.addEventListener('td613:ash:aia3-readiness-changed', defer);
  host.addEventListener('click', event => {
    const target = event.target?.closest?.('#startDemo');
    if (!target || profile.value !== PROFILE) return;
    target.disabled = true;
    setAttributeIfChanged(target, 'aria-disabled', true);
    setAttributeIfChanged(target, 'aria-busy', true);
    setDatasetIfChanged(target, 'ashResearchControlState', 'BUSY');
    if (target.textContent !== BUSY_LABEL) target.textContent = BUSY_LABEL;
  }, true);
  const observer = new MutationObserver(defer);
  observer.observe(button, { attributes:true, attributeFilter:['disabled', 'aria-disabled', 'aria-busy'], childList:true });
  doc.documentElement.dataset.ashResearchControlState = ASH_RESEARCH_CONTROL_STATE_VERSION;
  host.__td613AshResearchControlState = Object.freeze({
    version:ASH_RESEARCH_CONTROL_STATE_VERSION,
    reconcile:() => reconcileResearchDemoControl(doc)
  });
  queueMicrotask(() => reconcileResearchDemoControl(doc));
  return true;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') installResearchDemoControlState();
