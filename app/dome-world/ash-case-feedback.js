export const ASH_CASE_FEEDBACK_VERSION = 'td613.ash-keep.case-feedback/v0.1';

const INSTALL_MARK = Symbol.for('td613.ash-case-feedback.installed');
const SAVE_FEEDBACK_MS = 1600;

function currentStatus(doc) {
  return doc.getElementById('storageState');
}

export function installAshCaseFeedback(doc = globalThis.document, host = globalThis.window) {
  if (!doc?.documentElement || !host?.addEventListener || host[INSTALL_MARK]) return false;
  host[INSTALL_MARK] = true;
  const timers = new Set();

  const clearTimers = () => {
    for (const timer of timers) host.clearTimeout(timer);
    timers.clear();
  };

  const applySavedFeedback = caseId => {
    if (doc.documentElement.dataset.ashSaveFeedback !== String(caseId || 'CURRENT_SAVED')) return;
    const status = currentStatus(doc);
    if (status) status.textContent = 'Case saved';
  };

  host.addEventListener('td613:ash:constitutional:case-state', event => {
    const detail = event.detail || {};
    if (detail.state !== 'CURRENT_SAVED') return;
    clearTimers();
    const marker = detail.case_id || 'CURRENT_SAVED';
    doc.documentElement.dataset.ashSaveFeedback = marker;
    applySavedFeedback(marker);
    for (const delay of [0, 60, 180]) {
      const timer = host.setTimeout(() => {
        timers.delete(timer);
        applySavedFeedback(marker);
      }, delay);
      timers.add(timer);
    }
    const cleanup = host.setTimeout(() => {
      timers.delete(cleanup);
      if (doc.documentElement.dataset.ashSaveFeedback === marker) {
        delete doc.documentElement.dataset.ashSaveFeedback;
        host.__td613AshLifecycleRefresh?.().catch?.(console.error);
      }
    }, SAVE_FEEDBACK_MS);
    timers.add(cleanup);
  });

  doc.documentElement.dataset.ashCaseFeedback = ASH_CASE_FEEDBACK_VERSION;
  return true;
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  installAshCaseFeedback(document, window);
}
