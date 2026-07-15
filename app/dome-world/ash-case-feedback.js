export const ASH_CASE_FEEDBACK_VERSION = 'td613.ash-keep.case-feedback/v0.3';

const INSTALL_MARK = Symbol.for('td613.ash-case-feedback.installed');
const SAVE_FEEDBACK_MS = 1600;
const SAVE_PENDING_TIMEOUT_MS = 10_000;

function currentStatus(doc) {
  return doc.getElementById('storageState');
}

function caseCommands(doc) {
  return [doc.getElementById('saveCase'), doc.getElementById('closeCase')].filter(Boolean);
}

export function installAshCaseFeedback(doc = globalThis.document, host = globalThis.window) {
  if (!doc?.documentElement || !host?.addEventListener || host[INSTALL_MARK]) return false;
  host[INSTALL_MARK] = true;
  const timers = new Set();
  let savePending = false;
  let pendingTimeout = null;
  let feedbackObserver = null;

  const clearTimers = () => {
    for (const timer of timers) host.clearTimeout(timer);
    timers.clear();
  };

  const stopFeedbackObserver = () => {
    feedbackObserver?.disconnect();
    feedbackObserver = null;
  };

  const setCommandHold = held => {
    for (const command of caseCommands(doc)) command.disabled = held;
    doc.documentElement.dataset.ashSavePending = String(held);
  };

  const applySavedFeedback = caseId => {
    if (doc.documentElement.dataset.ashSaveFeedback !== String(caseId || 'CURRENT_SAVED')) return;
    const status = currentStatus(doc);
    if (status && status.textContent !== 'Case saved') status.textContent = 'Case saved';
  };

  const holdSavedFeedback = marker => {
    stopFeedbackObserver();
    const status = currentStatus(doc);
    if (!status || !host.MutationObserver) return;
    feedbackObserver = new host.MutationObserver(() => applySavedFeedback(marker));
    feedbackObserver.observe(status, { childList: true, characterData: true, subtree: true });
  };

  host.addEventListener('click', event => {
    const save = event.target?.closest?.('#saveCase');
    if (!save || save.disabled) return;
    savePending = true;
    setCommandHold(true);
    if (pendingTimeout) host.clearTimeout(pendingTimeout);
    pendingTimeout = host.setTimeout(() => {
      if (!savePending) return;
      savePending = false;
      setCommandHold(false);
      stopFeedbackObserver();
      delete doc.documentElement.dataset.ashSaveFeedback;
      const status = currentStatus(doc);
      if (status) status.textContent = 'Save confirmation held';
    }, SAVE_PENDING_TIMEOUT_MS);
  });

  host.addEventListener('td613:ash:constitutional:case-state', event => {
    const detail = event.detail || {};
    if (detail.state !== 'CURRENT_SAVED') return;
    clearTimers();
    if (pendingTimeout) {
      host.clearTimeout(pendingTimeout);
      pendingTimeout = null;
    }
    savePending = false;
    setCommandHold(false);
    const marker = detail.case_id || 'CURRENT_SAVED';
    doc.documentElement.dataset.ashSaveFeedback = marker;
    applySavedFeedback(marker);
    holdSavedFeedback(marker);
    const cleanup = host.setTimeout(() => {
      timers.delete(cleanup);
      if (doc.documentElement.dataset.ashSaveFeedback === marker) {
        stopFeedbackObserver();
        delete doc.documentElement.dataset.ashSaveFeedback;
        host.__td613AshLifecycleRefresh?.().catch?.(console.error);
      }
    }, SAVE_FEEDBACK_MS);
    timers.add(cleanup);
  });

  doc.documentElement.dataset.ashCaseFeedback = ASH_CASE_FEEDBACK_VERSION;
  doc.documentElement.dataset.ashSavePending = 'false';
  return true;
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  installAshCaseFeedback(document, window);
}
