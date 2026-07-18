export const ASH_RESEARCH_CONTROL_STATE_VERSION = 'td613.ash.research-control-state/v0.2-idempotent';

const PROFILE = 'research';

function elements(doc = document) {
  return {
    profile: doc.getElementById('newProfile'),
    button: doc.getElementById('startDemo')
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
  const { profile, button } = elements(doc);
  if (!profile || !button || profile.value !== PROFILE) return false;
  const busy = button.getAttribute('aria-busy') === 'true' || /Hydrating Research method/i.test(button.textContent || '');
  if (button.disabled !== busy) button.disabled = busy;
  setAttributeIfChanged(button, 'aria-disabled', busy);
  setAttributeIfChanged(button, 'aria-busy', busy);
  if (!busy) {
    button.classList.add('demo-available');
    button.classList.remove('demo-unavailable');
    if (button.textContent !== 'Start Research qualification demo') button.textContent = 'Start Research qualification demo';
  }
  setDatasetIfChanged(button, 'ashResearchControlState', busy ? 'BUSY' : 'READY');
  return true;
}

export function installResearchDemoControlState(doc = document, host = window) {
  const { profile, button } = elements(doc);
  if (!profile || !button) return false;
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
  host.addEventListener('click', event => {
    const target = event.target?.closest?.('#startDemo');
    if (!target || profile.value !== PROFILE) return;
    if (!target.disabled) target.disabled = true;
    setAttributeIfChanged(target, 'aria-disabled', true);
    setAttributeIfChanged(target, 'aria-busy', true);
    setDatasetIfChanged(target, 'ashResearchControlState', 'BUSY');
  }, true);
  const observer = new MutationObserver(defer);
  observer.observe(button, { attributes:true, attributeFilter:['disabled','aria-disabled','aria-busy'], childList:true });
  doc.documentElement.dataset.ashResearchControlState = ASH_RESEARCH_CONTROL_STATE_VERSION;
  host.__td613AshResearchControlState = Object.freeze({
    version:ASH_RESEARCH_CONTROL_STATE_VERSION,
    reconcile:() => reconcileResearchDemoControl(doc)
  });
  queueMicrotask(() => reconcileResearchDemoControl(doc));
  return true;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') installResearchDemoControlState();
