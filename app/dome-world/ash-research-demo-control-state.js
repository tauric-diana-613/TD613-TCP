export const ASH_RESEARCH_CONTROL_STATE_VERSION = 'td613.ash.research-control-state/v0.1';

const PROFILE = 'research';

function elements(doc = document) {
  return {
    profile: doc.getElementById('newProfile'),
    button: doc.getElementById('startDemo')
  };
}

export function reconcileResearchDemoControl(doc = document) {
  const { profile, button } = elements(doc);
  if (!profile || !button || profile.value !== PROFILE) return false;
  const busy = button.getAttribute('aria-busy') === 'true' || /Hydrating Research method/i.test(button.textContent || '');
  button.disabled = busy;
  button.setAttribute('aria-disabled', String(busy));
  if (!busy) {
    button.classList.add('demo-available');
    button.classList.remove('demo-unavailable');
    button.textContent = 'Start Research qualification demo';
  }
  button.dataset.ashResearchControlState = busy ? 'BUSY' : 'READY';
  return true;
}

export function installResearchDemoControlState(doc = document, host = window) {
  const { profile, button } = elements(doc);
  if (!profile || !button) return false;
  const defer = () => host.setTimeout(() => reconcileResearchDemoControl(doc), 0);
  profile.addEventListener('change', defer);
  host.addEventListener('td613:ash:profile-demo-hydrated', defer);
  host.addEventListener('td613:ash:case-opened', defer);
  host.addEventListener('click', event => {
    const target = event.target?.closest?.('#startDemo');
    if (!target || profile.value !== PROFILE) return;
    target.disabled = true;
    target.setAttribute('aria-disabled', 'true');
    target.setAttribute('aria-busy', 'true');
    target.dataset.ashResearchControlState = 'BUSY';
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
