export const HUSH_SIMPLE_PATH_VERSION = 'phase-14';

const ACTION_IDS = new Set([
  'generateMaskedOutputBtn',
  'analyzeOutputBtn',
  'acceptOutputBtn',
  'exportLedgerJsonBtn',
  'exportReportJsonBtn',
  'exportReportMarkdownBtn',
  'exportHushSwapJsonBtn'
]);

function textValue(doc, id) {
  return String(doc?.getElementById(id)?.value || '');
}

function setValue(doc, id, value) {
  const el = doc?.getElementById(id);
  if (!el) return false;
  el.value = value;
  return true;
}

export function prepareEffectiveBaseline(doc = document) {
  const baseline = textValue(doc, 'protectedBaselineInput').trim();
  const message = textValue(doc, 'messageDraftInput');
  const status = doc?.getElementById('protectedBaselineProfile');
  if (baseline) {
    if (status && !status.textContent.trim()) status.textContent = 'Advanced Reference Voice active.';
    return { source: 'advanced-reference-voice', applied: false, value: baseline };
  }
  if (!message.trim()) {
    if (status) status.textContent = 'Most users can leave this blank. Hush will use the message as reference when needed.';
    return { source: 'empty', applied: false, value: '' };
  }
  setValue(doc, 'protectedBaselineInput', message);
  if (status) status.textContent = 'Using Message to Transform as the local reference voice.';
  return { source: 'message-to-transform', applied: true, value: message };
}

export function clearFallbackBaseline(doc = document) {
  const baseline = doc?.getElementById('protectedBaselineInput');
  if (!baseline) return false;
  baseline.value = '';
  const status = doc?.getElementById('protectedBaselineProfile');
  if (status) status.textContent = 'Most users can leave this blank. Hush will use the message as reference when needed.';
  return true;
}

export function initHushSimplePath(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench') return null;
  const note = doc.getElementById('protectedBaselineProfile');
  if (note && !textValue(doc, 'protectedBaselineInput').trim()) note.textContent = 'Most users can leave this blank. Hush will use the message as reference when needed.';
  doc.addEventListener('click', (event) => {
    const target = event.target;
    if (!target || !ACTION_IDS.has(target.id)) return;
    prepareEffectiveBaseline(doc);
  }, true);
  doc.getElementById('resetBenchBtn')?.addEventListener('click', () => {
    window.setTimeout(() => clearFallbackBaseline(doc), 0);
  });
  return { version: HUSH_SIMPLE_PATH_VERSION };
}

export const ready = typeof document !== 'undefined' ? initHushSimplePath(document) : null;
