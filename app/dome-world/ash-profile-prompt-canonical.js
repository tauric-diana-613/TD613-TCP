export const ASH_PROFILE_PROMPT_CANONICAL_VERSION = 'td613.ash.profile-prompt-canonical/v1.0-bounded-case-choice-revision';

const host = globalThis.window;
const doc = globalThis.document;
const POINTER_KEY = 'td613.ash-keep.current-case';
let explicitChoice = '';
let explicitCaseChoice = '';
let controlObserver = null;
let observedSelect = null;
let observedStart = null;
let observedCaseSelect = null;
let reconcileQueued = false;
let caseListReconcileQueued = false;
let caseChoiceRestoreQueued = false;

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

function applyCaseChoice(select, reason = 'DELEGATED_CASE_SELECTION') {
  if (!select || select !== doc.getElementById('selectCase')) return false;
  const caseId = select.value || '';
  for (const id of ['openSelectedCase', 'deleteSelectedCase']) {
    const button = doc.getElementById(id);
    if (button) button.disabled = !caseId;
  }
  select.dataset.ashCaseChoiceReconcileReason = reason;
  if (caseId) {
    host.TD613AshConvergence?.transitionCase?.(caseId, {
      nextState:'SELECTED_NOT_OPEN',
      reason:'operator-selected-delegated-case'
    }).catch(error => console.error('Ash delegated case choice transition held:', error));
  }
  return true;
}

function restoreExplicitCaseChoice(select, reason = 'CASE_LIST_OPTIONS_CHANGED') {
  if (!select || select !== doc.getElementById('selectCase')) return false;
  if (noCaseOpen() && explicitCaseChoice && [...select.options].some(option => option.value === explicitCaseChoice)) {
    select.value = explicitCaseChoice;
  }
  select.dataset.ashCaseChoiceRevision = explicitCaseChoice || 'UNSELECTED';
  return applyCaseChoice(select, reason);
}

function captureCaseChoice(event) {
  const select = event?.target?.closest?.('#selectCase');
  if (!select) return;
  explicitCaseChoice = select.value || '';
  restoreExplicitCaseChoice(select, 'EXPLICIT_CASE_SELECTION');
}

function queueCaseChoiceRestore(reason = 'CASE_LIST_OPTIONS_CHANGED') {
  if (caseChoiceRestoreQueued) return;
  caseChoiceRestoreQueued = true;
  queueMicrotask(() => {
    caseChoiceRestoreQueued = false;
    const current = doc.getElementById('selectCase');
    const restored = restoreExplicitCaseChoice(current, reason);
    doc.documentElement.dataset.ashCaseChoiceRevisionRestored = String(restored);
  });
}

function reconcileRemountedCaseChoice(select, reason = 'CASE_LIST_IDENTITY_CHANGED') {
  if (!select) return false;
  select.dataset.ashRemountedCaseChoiceReconciled = 'true';
  restoreExplicitCaseChoice(select, reason);
  return true;
}

function queueCaseListReconcile(reason = 'CASE_LIST_IDENTITY_CHANGED') {
  if (caseListReconcileQueued) return;
  caseListReconcileQueued = true;
  queueMicrotask(async () => {
    caseListReconcileQueued = false;
    const current = doc.getElementById('selectCase');
    if (!current || current !== observedCaseSelect) return;
    try {
      await host.__td613AshCaseControls?.refreshCases?.(current.value || '');
      const settled = doc.getElementById('selectCase');
      if (settled) {
        reconcileRemountedCaseChoice(settled, reason);
        settled.dataset.ashCaseListReconcileReason = reason;
      }
      doc.documentElement.dataset.ashCaseListRemountReconciled = String(Boolean(settled?.dataset.caseListState === 'READY'));
      doc.documentElement.dataset.ashCaseChoiceRemountReconciled = String(Boolean(settled?.dataset.ashRemountedCaseChoiceReconciled === 'true'));
    } catch (error) {
      doc.documentElement.dataset.ashCaseListRemountReconciled = 'false';
      doc.documentElement.dataset.ashCaseChoiceRemountReconciled = 'false';
      console.error('Ash case-list remount reconciliation held:', error);
    }
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
  doc.addEventListener('change', captureCaseChoice, true);
}

function installBoundedControlObserver() {
  if (controlObserver || !doc?.body) return false;
  const launchBoundary = doc.getElementById('launch');
  if (!launchBoundary) return false;
  observedSelect = doc.getElementById('newProfile');
  observedStart = doc.getElementById('startDemo');
  observedCaseSelect = doc.getElementById('selectCase');
  controlObserver = new MutationObserver(records => {
    if (!records.some(record => record.type === 'childList' && (record.addedNodes.length || record.removedNodes.length))) return;
    const currentSelect = doc.getElementById('newProfile');
    const currentStart = doc.getElementById('startDemo');
    const currentCaseSelect = doc.getElementById('selectCase');
    const profileIdentityChanged = currentSelect !== observedSelect || currentStart !== observedStart;
    const caseIdentityChanged = currentCaseSelect !== observedCaseSelect;
    const caseOptionsChanged = records.some(record => currentCaseSelect && (record.target === currentCaseSelect || currentCaseSelect.contains(record.target)));
    if (!profileIdentityChanged && !caseIdentityChanged && !caseOptionsChanged) return;
    observedSelect = currentSelect;
    observedStart = currentStart;
    observedCaseSelect = currentCaseSelect;
    if (profileIdentityChanged) queueControlReconcile('INGRESS_CONTROL_IDENTITY_CHANGED');
    if (caseIdentityChanged) queueCaseListReconcile('CASE_LIST_IDENTITY_CHANGED');
    else if (caseOptionsChanged) queueCaseChoiceRestore('CASE_LIST_OPTIONS_CHANGED');
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
  observedCaseSelect = doc.getElementById('selectCase');

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
      explicit_case_choice:explicitCaseChoice || null,
      case_open:!noCaseOpen(),
      observed_selector_bound:Boolean(observedSelect?.isConnected),
      observed_start_bound:Boolean(observedStart?.isConnected),
      observed_case_selector_bound:Boolean(observedCaseSelect?.isConnected),
      observer_scope:controlObserver ? 'LAUNCH' : 'UNAVAILABLE'
    })
  });
}
