export const ASH_PROFILE_PROMPT_CANONICAL_VERSION = 'td613.ash.profile-prompt-canonical/v0.6-bounded-remount-reconciliation';

const host = globalThis.window;
const doc = globalThis.document;
const POINTER_KEY = 'td613.ash-keep.current-case';
let explicitChoice = '';
let controlObserver = null;
let observedSelect = null;
let observedStart = null;
let reconcileQueued = false;

function noCaseOpen() {
  try { return !host.localStorage?.getItem?.(POINTER_KEY); }
  catch { return true; }
}

function queueControlReconcile(reason = 'QUEUED') {
  if (reconcileQueued) return;
  reconcileQueued = true;
  queueMicrotask(() => {
    reconcileQueued = false;
    applyCanonicalProfilePrompt({ reason });
  });
}

function captureExplicitChoice(event) {
  const select = event?.target?.closest?.('#newProfile');
  if (!select || !select.value) return;
  explicitChoice = select.value;
  select.dataset.ashProfileChoiceExplicit = 'true';
  queueControlReconcile('EXPLICIT_PROFILE_CHOICE');
}

function installChoiceBoundary() {
  if (!doc?.documentElement || doc.documentElement.dataset.ashCanonicalProfileChoiceBoundary === 'true') return;
  doc.documentElement.dataset.ashCanonicalProfileChoiceBoundary = 'true';
  doc.addEventListener('input', captureExplicitChoice, true);
  doc.addEventListener('change', captureExplicitChoice, true);
}

function installBoundedControlObserver() {
  if (controlObserver || !doc?.body) return false;
  const launchBoundary = doc.getElementById('launch');
  if (!launchBoundary) return false;
  observedSelect = doc.getElementById('newProfile');
  observedStart = doc.getElementById('startDemo');
  controlObserver = new MutationObserver(records => {
    if (!records.some(record => record.type === 'childList' && (record.addedNodes.length || record.removedNodes.length))) return;
    const currentSelect = doc.getElementById('newProfile');
    const currentStart = doc.getElementById('startDemo');
    if (currentSelect === observedSelect && currentStart === observedStart) return;
    observedSelect = currentSelect;
    observedStart = currentStart;
    queueControlReconcile('INGRESS_CONTROL_IDENTITY_CHANGED');
  });
  controlObserver.observe(launchBoundary, { childList:true, subtree:true });
  doc.documentElement.dataset.ashCanonicalProfileControlObserver = 'BOUNDED_TO_LAUNCH';
  return true;
}

export function applyCanonicalProfilePrompt({ resetSelection = false, reason = 'EXPLICIT_REFRESH' } = {}) {
  const select = doc?.getElementById('newProfile');
  const start = doc?.getElementById('startDemo');
  if (!select || !start) return false;
  observedSelect = select;
  observedStart = start;

  let prompt = select.querySelector('option[value=""]');
  if (!prompt) {
    prompt = doc.createElement('option');
    prompt.value = '';
    select.prepend(prompt);
  }
  prompt.textContent = 'Select a Profile...';
  prompt.disabled = true;

  const firstBinding = select.dataset.ashCanonicalProfilePromptBound !== 'true';
  if (resetSelection) explicitChoice = '';
  const explicitChoiceAvailable = [...select.options].some(option => option.value === explicitChoice);
  if (noCaseOpen()) {
    if (resetSelection || (firstBinding && !explicitChoice)) select.value = '';
    else if (explicitChoice && explicitChoiceAvailable) select.value = explicitChoice;
  }

  if (select.value) explicitChoice = select.value;
  start.disabled = !select.value;
  start.setAttribute('aria-disabled', String(start.disabled));
  select.dataset.ashProfileChoiceExplicit = String(Boolean(explicitChoice));
  select.dataset.ashCanonicalProfilePromptBound = 'true';
  select.dataset.ashCanonicalProfileReconcileReason = reason;
  return true;
}

if (host && doc?.documentElement) {
  installChoiceBoundary();
  applyCanonicalProfilePrompt({ resetSelection:true, reason:'INITIAL_CANONICAL_NEUTRALITY' });
  installBoundedControlObserver();
  for (const type of ['aia-ready','aia3-ready','composition-stable']) {
    host.addEventListener(`td613:ash:${type}`, () => queueControlReconcile(type.toUpperCase()));
  }
  host.addEventListener('td613:ash:post-ingress-motion', () => applyCanonicalProfilePrompt({ reason:'POST_INGRESS_MOTION' }));
  host.addEventListener('td613:ash:case-closed', () => queueMicrotask(() => applyCanonicalProfilePrompt({ resetSelection:true, reason:'CASE_CLOSED' })));
  host.__td613AshProfilePromptCanonical = Object.freeze({
    version:ASH_PROFILE_PROMPT_CANONICAL_VERSION,
    refresh:applyCanonicalProfilePrompt,
    current:() => Object.freeze({
      explicit_choice:explicitChoice || null,
      case_open:!noCaseOpen(),
      observed_selector_bound:Boolean(observedSelect?.isConnected),
      observed_start_bound:Boolean(observedStart?.isConnected),
      observer_scope:controlObserver ? 'LAUNCH' : 'UNAVAILABLE'
    })
  });
}
